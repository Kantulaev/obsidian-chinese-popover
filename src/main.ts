import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { EditorSelection, Extension, RangeSetBuilder } from "@codemirror/state";
import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import { DictionaryManager } from "./dictionary.ts";
import {
  ChineseDictSettings,
  ChineseDictSettingTab,
  DEFAULT_SETTINGS,
  ModifierKey,
  PhoneticDisplay,
} from "./settings.ts";
import { ContentBounds, DictTooltip, TargetRect } from "./tooltip.ts";
import { VocabularyManager } from "./vocabulary.ts";
import {
  ChineseVocabularyView,
  VIEW_TYPE_CHINESE_VOCABULARY,
} from "./vocabulary-view.ts";
import { applyChineseFontToDOM } from "./font.ts";
import { StrokeOrderModal } from "./stroke-order.ts";
import { addNoteToAnki } from "./anki.ts";
import { formatPinyin } from "./pinyin.ts";
import { TextAnalyzerModal } from "./analyzer.ts";
import { createWordNote } from "./word-notes.ts";
import { convertToSimplified, convertToTraditional } from "./converter.ts";
import { WorksheetModal } from "./worksheet.ts";
import { HistoryManager } from "./history.ts";
import { ChineseSearchModal } from "./search-modal.ts";
import { setActiveLanguage } from "./i18n/index.ts";
import { exportVocabularyFile, HAN_CHAR_RE, HAN_RUN_GLOBAL_RE } from "./utils.ts";
import type { MatchResult } from "./dictionary.ts";

interface CodeMirrorEditor extends Editor {
  cm?: EditorView;
  cursorCoords?(
    primary?: boolean,
    mode?: string
  ): { left: number; right: number; top: number; bottom: number } | null;
}

export default class ChineseHoverDictPlugin extends Plugin {
  settings: ChineseDictSettings = DEFAULT_SETTINGS;
  dictionary!: DictionaryManager;
  vocabulary!: VocabularyManager;
  history!: HistoryManager;
  tooltip!: DictTooltip;

  private hoverTimeout: number | null = null;
  private hoverHideTimeout: number | null = null;
  private lastHoverCoords: { x: number; y: number } | null = null;
  private readerStatusBarItem: HTMLElement | null = null;

  override async onload(): Promise<void> {
    await this.loadSettings();
    setActiveLanguage(this.settings.uiLanguage);

    // Apply Chinese font settings to Obsidian workspace DOM
    this.applyCurrentFont();

    this.dictionary = new DictionaryManager(this);
    // Non-blocking background load: Obsidian launches instantly without freeze
    this.dictionary.load().catch((err) => {
      console.error("[Chinese Dict] Background load error:", err);
    });

    // Schedule lazy background download of default English CC-CEDICT pack after layout is fully ready
    this.app.workspace.onLayoutReady(() => {
      window.setTimeout(() => {
        this.dictionary.ensureDefaultEnglishDictPack().catch(() => {});
        this.dictionary.ensureActiveLanguageDictPack().catch(() => {});
        if (this.settings.enableReverseLookup) {
          this.dictionary.ensureReverseIndexReady();
        }
      }, 3000);
    });

    this.vocabulary = new VocabularyManager(this);
    this.vocabulary.load().catch((err) => {
      console.error("[Chinese Dict] Vocabulary load error:", err);
    });

    this.history = new HistoryManager(this);
    this.history.load().catch((err) => {
      console.error("[Chinese Dict] History load error:", err);
    });

    this.tooltip = new DictTooltip(this);

    // Register Status Bar item for Reader Mode
    this.readerStatusBarItem = this.addStatusBarItem();
    this.updateReaderStatusBar();
    this.readerStatusBarItem.addEventListener("click", () => {
      void this.toggleReaderMode();
    });

    // Register Right Sidebar View for Vocabulary
    this.registerView(
      VIEW_TYPE_CHINESE_VOCABULARY,
      (leaf) => new ChineseVocabularyView(leaf, this)
    );

    // Ribbon icon to open Vocabulary in right sidebar
    this.addRibbonIcon(
      "book-marked",
      "Китайский словарик / Chinese Vocabulary",
      () => {
        void this.activateVocabularyView();
      }
    );

    // Register CodeMirror 6 extension for Live Preview and Source Mode
    this.registerEditorExtension(this.buildCodeMirrorExtension());

    // Wrap Chinese Hanzi runs in Reading View only when entire_editor font scope is active
    this.registerMarkdownPostProcessor((el) => {
      if (this.settings.chineseFontScope !== "entire_editor" || !this.hasActiveEditorHanziFont()) return;
      if (!HAN_CHAR_RE.test(el.textContent || "")) return;

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let current = walker.nextNode();
      while (current) {
        if (
          current.nodeType === Node.TEXT_NODE &&
          current.textContent &&
          HAN_CHAR_RE.test(current.textContent) &&
          !(current.parentElement?.classList.contains("ch-dict-hanzi-run"))
        ) {
          textNodes.push(current as Text);
        }
        current = walker.nextNode();
      }

      for (const node of textNodes) {
        const text = node.textContent || "";
        HAN_RUN_GLOBAL_RE.lastIndex = 0;
        let match = HAN_RUN_GLOBAL_RE.exec(text);
        if (!match) continue;

        const frag = createFragment();
        let lastIdx = 0;
        while (match) {
          if (match.index > lastIdx) {
            frag.appendText(text.slice(lastIdx, match.index));
          }
          frag.createSpan({ cls: "ch-dict-hanzi-run", text: match[0] });
          lastIdx = match.index + match[0].length;
          match = HAN_RUN_GLOBAL_RE.exec(text);
        }
        if (lastIdx < text.length) {
          frag.appendText(text.slice(lastIdx));
        }
        node.parentNode?.replaceChild(frag, node);
      }
    });

    // Register Double-Click listener for Reading View (rendered Markdown)
    this.registerDomEvent(
      document,
      "dblclick",
      this.handleReadingViewDblClick.bind(this)
    );

    // Register MouseMove listener for Reading View (for hover trigger modes)
    this.registerDomEvent(
      document,
      "mousemove",
      this.handleReadingViewMouseMove.bind(this)
    );

    // Dismiss popover when mouse leaves the document window (in hover or reader modes)
    this.registerDomEvent(document, "mouseleave", () => {
      this.cancelHoverLookup();
      if (
        this.settings.readerMode ||
        this.settings.triggerMode === "hover" ||
        this.settings.triggerMode === "hover_modifier"
      ) {
        this.scheduleHoverHide(200);
      }
    });

    // Dismiss popover on click outside ONLY when popover is actually open AND not pinned
    this.registerDomEvent(document, "mousedown", (event: MouseEvent) => {
      if (!this.tooltip.getIsOpen() || this.tooltip.getIsPinned()) return;
      const target = event.target as HTMLElement | null;
      if (target && !target.closest(".ch-dict-tooltip")) {
        this.tooltip.hide();
      }
    });

    // Handle Escape and One-Key Shortcuts when popover is active
    this.registerDomEvent(document, "keydown", (event: KeyboardEvent) => {
      if (!this.tooltip.getIsOpen()) return;

      // Escape always closes the popover (forces close even if pinned)
      if (event.key === "Escape") {
        this.tooltip.hide(true);
        return;
      }

      if (this.settings.enablePopoverHotkeys === false) return;

      // If user is actively typing inside an input/textarea or CodeMirror, do not trigger single-letter shortcuts
      const activeEl = document.activeElement as HTMLElement | null;
      const tag = activeEl?.tagName?.toLowerCase();
      const isInput = tag === "input" || tag === "textarea";
      const isEditor = activeEl?.closest(".cm-editor, .cm-content") !== null;

      if (isInput || isEditor) {
        return;
      }

      if (event.code === "Space" || event.key === "r" || event.key === "R") {
        event.preventDefault();
        this.pronounceActiveWord();
      } else if (event.key === "s" || event.key === "S") {
        event.preventDefault();
        void this.toggleStarActiveWord();
      } else if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        void this.createActiveWordNote();
      } else if (event.key === "c" || event.key === "C") {
        event.preventDefault();
        this.copyActiveWord();
      } else if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        this.tooltip.togglePin();
      }
    });

    // Dismiss popover on scroll ONLY if not pinned
    this.registerDomEvent(
      document,
      "scroll",
      () => {
        if (this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
          this.tooltip.hide();
        }
      },
      true
    );

    // ==========================================
    // COMMAND PALETTE & HOTKEY REGISTRATIONS
    // ==========================================

    // 1. Look up word under cursor / selection
    this.addCommand({
      id: "lookup-word-at-cursor",
      name: "Найти слово под курсором или выделением / Look up word under cursor",
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) return false;
        if (checking) return true;

        if (activeView.getMode() === "source" && activeView.editor) {
          this.lookupAtEditorCursor(activeView.editor);
        } else {
          this.lookupAtReadingView();
        }
        return true;
      },
    });

    // 2. Pronounce current / active word
    this.addCommand({
      id: "pronounce-active-word",
      name: "Озвучить текущее слово / Pronounce active word",
      callback: () => {
        this.pronounceActiveWord();
      },
    });

    // 3. Copy current word and definition
    this.addCommand({
      id: "copy-active-word",
      name: "Скопировать карточку слова / Copy active word card",
      callback: () => {
        this.copyActiveWord();
      },
    });

    // 4. Switch dialect (Cantonese <-> Mandarin)
    this.addCommand({
      id: "switch-dialect",
      name: "Переключить диалект (Кантонский <-> Путунхуа) / Switch Dialect",
      callback: async () => {
        await this.switchDialect();
      },
    });

    // 5. Cycle phonetic display mode (Both -> Pinyin -> Jyutping -> Auto)
    this.addCommand({
      id: "cycle-phonetic-display",
      name: "Переключить режим фонетики (Оба / Пиньинь / Ютпинг) / Cycle Phonetic Display",
      callback: async () => {
        await this.cyclePhoneticDisplay();
      },
    });

    // 6. Toggle Chinese Dictionary on/off
    this.addCommand({
      id: "toggle-chinese-hover-dict",
      name: "Включить/выключить словарь / Toggle Chinese Dictionary",
      callback: async () => {
        this.settings.enabled = !this.settings.enabled;
        await this.saveSettings();
        if (!this.settings.enabled) {
          this.tooltip.hide();
        }
        new Notice(
          `Китайский словарь: ${
            this.settings.enabled ? "Включен (Enabled)" : "Отключен (Disabled)"
          }`
        );
      },
    });

    // 7. Close Popover
    this.addCommand({
      id: "close-popover",
      name: "Закрыть всплывающее окно словаря / Close Popover",
      checkCallback: (checking: boolean) => {
        if (!this.tooltip.getIsOpen()) return false;
        if (checking) return true;
        this.tooltip.hide();
        return true;
      },
    });

    // 8. Open Personal Vocabulary in Sidebar
    this.addCommand({
      id: "open-chinese-vocabulary",
      name: "Открыть словарик в боковой панели / Open vocabulary in sidebar",
      callback: () => {
        void this.activateVocabularyView();
      },
    });

    // 9. Star or unstar word under cursor / selection
    this.addCommand({
      id: "toggle-star-active-word",
      name: "Добавить или удалить слово из словарика / Star or unstar word",
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView && !this.tooltip.getIsOpen()) return false;
        if (checking) return true;
        void this.toggleStarActiveWord();
        return true;
      },
    });

    // 10. Toggle Reader Mode
    this.addCommand({
      id: "toggle-reader-mode",
      name: "Переключить режим быстрого чтения / Toggle Reader Mode",
      callback: () => {
        void this.toggleReaderMode();
      },
    });

    // 11. Stroke Order Animation Modal
    this.addCommand({
      id: "show-stroke-order",
      name: "Показать порядок черт иероглифа / Show Stroke Order Animation",
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView && !this.tooltip.getIsOpen()) return false;
        if (checking) return true;

        const ctx = this.resolveActiveWordContext();
        if (ctx?.word) {
          new StrokeOrderModal(this.app, ctx.word).open();
        } else {
          new Notice("Не найден китайский иероглиф под курсором или в выделении.");
        }
        return true;
      },
    });

    // 12 & 13. Add Ruby Pinyin / Jyutping to selection
    const registerRubyCommand = (dialect: "pinyin" | "jyutping", id: string, name: string, msg: string) => {
      this.addCommand({
        id,
        name,
        checkCallback: (checking: boolean) => {
          const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
          const sel = activeView?.editor?.getSelection().trim();
          if (!activeView?.editor || !sel) return false;
          if (checking) return true;
          activeView.editor.replaceSelection(this.convertTextToRuby(sel, dialect));
          new Notice(msg);
          return true;
        },
      });
    };
    registerRubyCommand("pinyin", "add-ruby-pinyin", "Добавить пиньинь (Ruby/Furigana) к выделенному тексту / Add Ruby Pinyin", "Пиньинь (Ruby) добавлен над текстом!");
    registerRubyCommand("jyutping", "add-ruby-jyutping", "Добавить ютпинг (Ruby/Furigana) к выделенному тексту / Add Ruby Jyutping", "Ютпинг (Ruby) добавлен над текстом!");

    // 14. Export Vocabulary to Anki TSV file
    this.addCommand({
      id: "export-vocabulary-anki-tsv",
      name: "Экспорт словарика в файл Anki (.tsv) / Export Vocabulary to Anki TSV",
      callback: () => {
        exportVocabularyFile(this.vocabulary.getItems(), "anki");
      },
    });

    // 15. Direct Sync to AnkiConnect
    this.addCommand({
      id: "sync-vocabulary-ankiconnect",
      name: "Синхронизировать словарик с AnkiConnect / Sync to AnkiConnect",
      callback: async () => {
        const items = this.vocabulary.getItems();
        if (items.length === 0) {
          new Notice("Словарик пуст!");
          return;
        }
        new Notice("Начата синхронизация с AnkiConnect...");
        let count = 0;
        for (const item of items) {
          if (await addNoteToAnki(this.settings.anki, item)) count++;
        }
        new Notice(`Синхронизация завершена: ${count} карточек отправлено в Anki.`);
      },
    });

    // 16. Text Difficulty & HSK Analyzer
    this.addCommand({
      id: "analyze-text-difficulty",
      name: "Анализатор сложности текста и уровни HSK / Analyze Text Difficulty & HSK",
      callback: () => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        const text = activeView?.editor
          ? (activeView.editor.getSelection().trim() || activeView.editor.getValue())
          : "";
        if (!text) {
          new Notice("Нет открытого текста для анализа сложности по HSK.");
          return;
        }
        new TextAnalyzerModal(this.app, text).open();
      },
    });

    // 17. Create Zettelkasten Word Note
    this.addCommand({
      id: "create-word-note",
      name: "Создать атомную заметку слова (Zettelkasten) / Create Word Note",
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView && !this.tooltip.getIsOpen()) return false;
        if (checking) return true;
        void this.createActiveWordNote();
        return true;
      },
    });

    // 18 & 19. Convert Selection between Simplified and Traditional Chinese
    const registerScriptCommand = (id: string, name: string, fn: (s: string) => string, msg: string) => {
      this.addCommand({
        id,
        name,
        checkCallback: (checking: boolean) => {
          const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
          const sel = activeView?.editor?.getSelection();
          if (!activeView?.editor || !sel) return false;
          if (checking) return true;
          activeView.editor.replaceSelection(fn(sel));
          new Notice(msg);
          return true;
        },
      });
    };
    registerScriptCommand("convert-to-traditional", "Преобразовать выделенный текст в традиционные иероглифы (繁體) / Convert to Traditional", convertToTraditional, "Преобразовано в традиционные иероглифы (繁體)!");
    registerScriptCommand("convert-to-simplified", "Преобразовать выделенный текст в упрощенные иероглифы (简体) / Convert to Simplified", convertToSimplified, "Преобразовано в упрощенные иероглифы (简体)!");

    // 20. Speak Selected Text (TTS Cantonese / Mandarin)
    this.addCommand({
      id: "speak-selected-text",
      name: "Озвучить выделенный фрагмент текста (TTS) / Speak Selected Text",
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        const sel = activeView?.editor?.getSelection().trim();
        if (!activeView?.editor || !sel) return false;
        if (checking) return true;
        this.tooltip.playSpeech(sel, this.settings);
        return true;
      },
    });

    // 21. Export Pleco Flashcards (.txt)
    this.addCommand({
      id: "export-pleco-flashcards",
      name: "Экспорт словарика в Pleco (.txt) / Export Pleco Flashcards",
      callback: () => {
        exportVocabularyFile(this.vocabulary.getItems(), "pleco");
      },
    });

    // 22. Open Calligraphy Worksheets (米字格)
    this.addCommand({
      id: "open-calligraphy-worksheets",
      name: "Открыть каллиграфические прописи (米字格) / Print Calligraphy Worksheets",
      callback: () => {
        const items = this.vocabulary.getItems();
        if (items.length === 0) {
          new Notice("Словарик пока пуст! Добавьте слова ⭐.");
          return;
        }
        new WorksheetModal(this.app, items).open();
      },
    });

    // 23. Quick Search Dictionary (Spotlight Modal)
    this.addCommand({
      id: "search-chinese-dictionary",
      name: "Быстрый поиск в китайском словаре (Spotlight) / Search Chinese Dictionary",
      callback: () => {
        new ChineseSearchModal(this.app, this).open();
      },
    });

    // 24. Toggle Pin / Sticky Mode for Popover
    this.addCommand({
      id: "toggle-pin-popover",
      name: "Закрепить или открепить карточку словаря (Pin/Sticky) / Toggle Pin Popover",
      checkCallback: (checking: boolean) => {
        if (!this.tooltip.getIsOpen()) return false;
        if (checking) return true;
        this.tooltip.togglePin();
        return true;
      },
    });

    // Add Settings Tab
    this.addSettingTab(new ChineseDictSettingTab(this.app, this));
  }

  override onunload(): void {
    this.cancelHoverLookup();
    this.cancelHoverHide();
    if (this.tooltip) {
      this.tooltip.destroy();
    }
  }

  async loadSettings(): Promise<void> {
    const loaded = (await this.loadData()) as Partial<ChineseDictSettings> | null;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);
    if (loaded && loaded.toneColoring === "phonetics" && !loaded.toneColoringExplicit) {
      this.settings.toneColoring = "off";
    }
    setActiveLanguage(this.settings.uiLanguage);
  }

  async saveSettings(): Promise<void> {
    setActiveLanguage(this.settings.uiLanguage);
    await this.saveData(this.settings);
  }

  /**
   * Checks whether the user is holding down the configured modifier key
   */
  private checkModifier(
    event: MouseEvent | KeyboardEvent,
    modifier: ModifierKey
  ): boolean {
    switch (modifier) {
      case "Alt":
        return event.altKey;
      case "Shift":
        return event.shiftKey;
      case "Control":
        return event.ctrlKey;
      case "Meta":
        return event.metaKey;
      default:
        return false;
    }
  }

  /**
   * Accurately determines the inner text content bounds (excluding left/right blank margins).
   */
  public getContentBounds(
    targetEl?: HTMLElement | null,
    editorView?: EditorView
  ): ContentBounds {
    // 1. Check if clicked element or its ancestors has a sizer
    if (targetEl) {
      const sizer = targetEl.closest(
        ".cm-sizer, .markdown-preview-sizer"
      );
      if (sizer instanceof HTMLElement) {
        return this.getSizerInnerBounds(sizer);
      }

      // Check if inside a line or paragraph
      const line = targetEl.closest(
        ".cm-line, p, h1, h2, h3, h4, h5, h6, li, pre, blockquote"
      );
      if (line) {
        const rect = line.getBoundingClientRect();
        if (rect.width > 100) {
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          };
        }
      }
    }

    // 2. Check editorView's sizer or line
    if (editorView) {
      const sizer = editorView.dom.querySelector(
        ".cm-sizer"
      );
      if (sizer instanceof HTMLElement) {
        return this.getSizerInnerBounds(sizer);
      }
      const line = editorView.dom.querySelector(".cm-line");
      if (line) {
        const rect = line.getBoundingClientRect();
        if (rect.width > 100) {
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          };
        }
      }
    }

    // 3. Check active leaf in Obsidian workspace
    const leaf =
      document.querySelector(".workspace-leaf.mod-active") || document;
    const sizer = leaf.querySelector(
      ".cm-sizer, .markdown-preview-sizer"
    );
    if (sizer instanceof HTMLElement) {
      return this.getSizerInnerBounds(sizer);
    }

    const anyLine = leaf.querySelector(
      ".cm-line, .markdown-preview-section p, .markdown-rendered p"
    );
    if (anyLine) {
      const rect = anyLine.getBoundingClientRect();
      if (rect.width > 100) {
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      }
    }

    // 4. Default fallback: window margins
    const win = (typeof activeWindow !== "undefined" && activeWindow) ? activeWindow : window;
    return {
      left: 10,
      right: win.innerWidth - 10,
      top: 10,
      bottom: win.innerHeight - 10,
    };
  }

  private getSizerInnerBounds(sizer: HTMLElement): ContentBounds {
    const rect = sizer.getBoundingClientRect();
    const style = (sizer.win || window).getComputedStyle(sizer);
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    return {
      left: rect.left + padLeft,
      right: rect.right - padRight,
      top: rect.top,
      bottom: rect.bottom,
    };
  }

  /**
   * CodeMirror 6 extension for Live Preview and Source mode
   */
  private buildCodeMirrorExtension(): Extension {
    const isHanziStylingEnabled = () =>
      this.settings.chineseFontScope === "entire_editor" && this.hasActiveEditorHanziFont();
    return [
      // Mouse selection style facet: intelligently highlights the exact Chinese word / phrase
      // (2-, 3-, or 4-character chengyu / compound word) so the editor selection and dictionary match 100%!
      EditorView.mouseSelectionStyle.of((view: EditorView, event: MouseEvent) => {
        if (!this.settings.enabled || event.button !== 0 || event.detail !== 2) {
          return null;
        }

        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (pos === null) return null;

        const line = view.state.doc.lineAt(pos);
        const lineOffset = pos - line.from;
        const charAtOffset = line.text[lineOffset];
        if (!charAtOffset || !this.dictionary.isChinese(charAtOffset)) {
          return null;
        }

        // 1. Check Cantonese phrases if enabled
        let match = this.settings.selectCantonesePhrases
          ? this.dictionary.findCantonesePhraseAtOffset(
              line.text,
              lineOffset,
              this.settings.maxWordLength
            )
          : null;

        // 2. Look up dictionary word at offset (2-, 3-, or 4-character word)
        if (!match) {
          match = this.dictionary.findWordAtOffset(
            line.text,
            lineOffset,
            this.settings.maxWordLength
          );
        }

        if (!match || match.start === undefined || match.end === undefined) {
          return null;
        }

        const start = line.from + match.start;
        const end = line.from + match.end;

        return {
          get(curEvent: MouseEvent, _extend: boolean, multiple: boolean) {
            let range = EditorSelection.range(start, end);
            const curPos = view.posAtCoords({
              x: curEvent.clientX,
              y: curEvent.clientY,
            });
            if (curPos !== null) {
              if (curPos < start) {
                range = EditorSelection.range(end, curPos);
              } else if (curPos > end) {
                range = EditorSelection.range(start, curPos);
              }
            }
            if (multiple) {
              return view.state.selection.addRange(range);
            }
            return EditorSelection.create([range]);
          },
          update(_update: unknown) {},
        };
      }),
      EditorView.domEventHandlers({
        dblclick: (event: MouseEvent, view: EditorView) => {
          if (!this.settings.enabled) return;
          if (this.settings.triggerMode === "command_only") return;
          if (this.settings.triggerMode === "hover") return;

          const target = event.target as HTMLElement | null;
          const bounds = this.getContentBounds(target, view);
          this.handleEditorLookup(event.clientX, event.clientY, view, bounds, false);
        },
        mousemove: (event: MouseEvent, view: EditorView) => {
          if (!this.settings.enabled) return;
          const mode = this.settings.triggerMode;
          const isReader = this.settings.readerMode;
          if (mode !== "hover" && mode !== "hover_modifier" && !isReader) return;

          if (mode === "hover_modifier" && !isReader) {
            if (!this.checkModifier(event, this.settings.hoverModifierKey)) {
              this.cancelHoverLookup();
              return;
            }
          }

          // Fast jitter guard before DOM traversal
          if (this.lastHoverCoords && this.hoverTimeout !== null) {
            if (Math.hypot(event.clientX - this.lastHoverCoords.x, event.clientY - this.lastHoverCoords.y) < 4) {
              return;
            }
          }

          const target = event.target as HTMLElement | null;
          if (target?.closest(".ch-dict-tooltip")) {
            this.cancelHoverLookup();
            this.cancelHoverHide();
            return;
          }

          this.scheduleHoverLookup(
            event.clientX,
            event.clientY,
            view,
            undefined,
            target || undefined
          );
        },
        mouseleave: () => {
          this.cancelHoverLookup();
          if (
            this.settings.readerMode ||
            this.settings.triggerMode === "hover" ||
            this.settings.triggerMode === "hover_modifier"
          ) {
            this.scheduleHoverHide(200);
          }
        },
      }),
      ViewPlugin.fromClass(
        class {
          decorations: DecorationSet;
          constructor(view: EditorView) {
            this.decorations = this.buildDecorations(view);
          }
          update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
              this.decorations = this.buildDecorations(update.view);
            }
          }
          buildDecorations = (view: EditorView): DecorationSet => {
            const builder = new RangeSetBuilder<Decoration>();
            if (!isHanziStylingEnabled()) {
              return builder.finish();
            }
            const mark = Decoration.mark({ class: "ch-dict-hanzi-run" });
            for (const { from, to } of view.visibleRanges) {
              const text = view.state.doc.sliceString(from, to);
              HAN_RUN_GLOBAL_RE.lastIndex = 0;
              let m = HAN_RUN_GLOBAL_RE.exec(text);
              while (m) {
                builder.add(from + m.index, from + m.index + m[0].length, mark);
                m = HAN_RUN_GLOBAL_RE.exec(text);
              }
            }
            return builder.finish();
          };
        },
        { decorations: (v) => v.decorations }
      ),
    ];
  }

  /**
   * Calculates the exact bounding rectangle for a text range in CodeMirror
   */
  private getEditorTargetRect(
    view: EditorView,
    from: number,
    to: number
  ): TargetRect | undefined {
    try {
      const startCoords = view.coordsAtPos(from);
      const endCoords = view.coordsAtPos(to, -1) || view.coordsAtPos(to);
      if (!startCoords || !endCoords) {
        const single = startCoords || endCoords;
        return single
          ? {
              left: single.left,
              right: single.right,
              top: single.top,
              bottom: single.bottom,
            }
          : undefined;
      }

      // Check for multiline wrap: if from and to are on different lines
      if (Math.abs(startCoords.top - endCoords.top) > 10) {
        return {
          left: startCoords.left,
          right: startCoords.right + 20,
          top: startCoords.top,
          bottom: startCoords.bottom,
        };
      }

      return {
        left: Math.min(startCoords.left, endCoords.left),
        right: Math.max(startCoords.right, endCoords.right),
        top: Math.min(startCoords.top, endCoords.top),
        bottom: Math.max(startCoords.bottom, endCoords.bottom),
      };
    } catch {
      return undefined;
    }
  }

  /**
   * Calculates the exact bounding rectangle for a text node range in Reading View
   */
  private getReadingViewTargetRect(
    textNode: Node,
    start: number,
    end: number
  ): TargetRect | undefined {
    try {
      const range = document.createRange();
      range.setStart(textNode, start);
      range.setEnd(textNode, end);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      }
    } catch {
      // ignore
    }
    return undefined;
  }

  /**
   * Handles lookup at exact pixel coordinates in CodeMirror
   */
  private handleEditorLookup(
    clientX: number,
    clientY: number,
    view: EditorView,
    bounds?: ContentBounds,
    isHover: boolean = false
  ): void {
    if (!this.dictionary.isReady()) {
      if (!isHover) {
        new Notice("Dictionary is still loading, please wait a moment...", 2000);
      }
      return;
    }

    // If mouse is inside tooltip, do not trigger and cancel hide
    if (this.tooltip.getIsOpen()) {
      const tooltipEl = this.tooltip.getElement();
      const rect = tooltipEl.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        this.cancelHoverLookup();
        this.cancelHoverHide();
        return;
      }
    }

    const pos = view.posAtCoords({ x: clientX, y: clientY });
    if (pos === null) {
      if (isHover && this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
        this.scheduleHoverHide();
      }
      return;
    }

    const line = view.state.doc.lineAt(pos);
    const lineText = line.text;
    const lineOffset = pos - line.from;
    const resolvedBounds = bounds || this.getContentBounds(null, view);
    const context = this.settings.autoSaveContextSentence
      ? this.extractContextSentence(lineText, lineOffset)
      : undefined;

    // 1. Act on Obsidian's internal selection:
    // If double-click or drag-selection highlighted text (e.g. 2-character word or 4-character chengyu),
    // look it up directly with full compound synthesis so selection and popup match 100%!
    const lineMatch = this.dictionary.findWordAtOffset(
      lineText,
      lineOffset,
      Math.max(this.settings.maxWordLength || 12, 12)
    );

    let selectedText = "";
    let selStart: number | undefined = undefined;
    let selEnd: number | undefined = undefined;

    const selection = view.state.selection.main;
    if (!selection.empty && pos >= selection.from - 1 && pos <= selection.to + 1) {
      selectedText = view.state.sliceDoc(selection.from, selection.to).trim();
      selStart = selection.from;
      selEnd = selection.to;
    }

    if (!selectedText) {
      const domSel = (view.dom.win || window).getSelection();
      const domText = domSel ? domSel.toString().trim() : "";
      if (domText && this.dictionary.isChinese(domText)) {
        selectedText = domText;
      }
    }

    // If lineMatch is a longer, complete dictionary entry enclosing or extending the selection (e.g. 活到老，学到老)
    if (lineMatch && (!selectedText || (lineMatch.length > Array.from(selectedText).length && lineMatch.word.includes(selectedText)))) {
      const matchStart = line.from + (lineMatch.start ?? lineOffset);
      const matchEnd = line.from + (lineMatch.end ?? (lineOffset + lineMatch.length));
      const targetRect = this.getEditorTargetRect(view, matchStart, matchEnd);

      if (isHover && !this.isPointOverTargetRect(clientX, clientY, targetRect)) {
        if (this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
          this.scheduleHoverHide();
        }
        return;
      }

      if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord() === lineMatch.word) {
        this.cancelHoverHide();
        return;
      }

      this.cancelHoverHide();
      if (
        !isHover &&
        selStart !== undefined &&
        lineMatch.start !== undefined &&
        lineMatch.end !== undefined &&
        line.from + lineMatch.start <= selStart &&
        line.from + lineMatch.end >= (selEnd ?? selStart)
      ) {
        try {
          view.dispatch({
            selection: { anchor: line.from + lineMatch.start, head: line.from + lineMatch.end },
          });
        } catch {
          // ignore selection update error
        }
      }
      this.tooltip.show(
        lineMatch,
        clientX,
        clientY,
        this.settings,
        resolvedBounds,
        context,
        targetRect
      );
      return;
    }

    if (selectedText && this.dictionary.isChinese(selectedText)) {
      const wordFrom = selStart ?? pos;
      const wordTo = selEnd ?? (pos + Array.from(selectedText).length);
      const targetRect = this.getEditorTargetRect(view, wordFrom, wordTo);

      if (isHover && !this.isPointOverTargetRect(clientX, clientY, targetRect)) {
        if (this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
          this.scheduleHoverHide();
        }
        return;
      }

      if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord() === selectedText) {
        this.cancelHoverHide();
        return;
      }

      const directEntries = this.dictionary.getOrSynthesize(selectedText);
      if (directEntries && directEntries.length > 0) {
        this.cancelHoverHide();
        this.tooltip.show(
          {
            word: selectedText,
            entries: directEntries,
            length: Array.from(selectedText).length,
            start: selStart,
            end: selEnd,
          },
          clientX,
          clientY,
          this.settings,
          resolvedBounds,
          context,
          targetRect
        );
        return;
      }

      const match = this.dictionary.findLongestMatch(
        selectedText,
        this.settings.maxWordLength || 12
      );
      if (match) {
        this.cancelHoverHide();
        this.tooltip.show(
          {
            word: match.word,
            entries: match.entries,
            length: match.length,
            start: selStart,
            end: selEnd,
          },
          clientX,
          clientY,
          this.settings,
          resolvedBounds,
          context,
          targetRect
        );
        return;
      }
    } else if (selectedText && this.settings.enableReverseLookup) {
      const wordFrom = selStart ?? pos;
      const wordTo = selEnd ?? (pos + selectedText.length);
      const targetRect = this.getEditorTargetRect(view, wordFrom, wordTo);
      if (isHover && !this.isPointOverTargetRect(clientX, clientY, targetRect)) {
        if (this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
          this.scheduleHoverHide();
        }
        return;
      }
      const rev = this.dictionary.lookupReverse(selectedText, this.settings.reverseLookupLanguage);
      if (rev) {
        this.cancelHoverHide();
        this.tooltip.show(
          { ...rev, start: selStart, end: selEnd },
          clientX,
          clientY,
          this.settings,
          resolvedBounds,
          context,
          targetRect
        );
        return;
      }
    }

    // 2. Fallback: if selection is empty (e.g. hover trigger), find word at pos
    const match = this.dictionary.findWordAtOffset(
      lineText,
      lineOffset,
      this.settings.maxWordLength
    );

    if (match) {
      const absStart = match.start !== undefined ? line.from + match.start : (line.from + lineOffset);
      const absEnd = match.end !== undefined ? line.from + match.end : (absStart + match.length);
      const targetRect = this.getEditorTargetRect(view, absStart, absEnd);

      if (isHover && !this.isPointOverTargetRect(clientX, clientY, targetRect)) {
        if (this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
          this.scheduleHoverHide();
        }
        return;
      }

      if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord() === match.word) {
        this.cancelHoverHide();
        return;
      }

      this.cancelHoverHide();
      if (!isHover && absStart !== undefined && absEnd !== undefined) {
        // Synchronize editor selection to match the dictionary word exactly on double-click
        view.dispatch({
          selection: { anchor: absStart, head: absEnd },
        });
      }
      this.tooltip.show(
        { ...match, start: absStart, end: absEnd },
        clientX,
        clientY,
        this.settings,
        resolvedBounds,
        context,
        targetRect
      );
      return;
    } else if (this.settings.enableReverseLookup) {
      const foreignMatch = this.extractForeignWordRangeAtOffset(lineText, lineOffset);
      if (foreignMatch) {
        const targetRect = this.getEditorTargetRect(
          view,
          line.from + foreignMatch.start,
          line.from + foreignMatch.end
        );
        if (isHover && !this.isPointOverTargetRect(clientX, clientY, targetRect)) {
          if (this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
            this.scheduleHoverHide();
          }
          return;
        }
        const rev = this.dictionary.lookupReverse(foreignMatch.word, this.settings.reverseLookupLanguage);
        if (rev) {
          if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord() === rev.word) {
            this.cancelHoverHide();
            return;
          }
          this.cancelHoverHide();
          this.tooltip.show(
            rev,
            clientX,
            clientY,
            this.settings,
            resolvedBounds,
            context,
            targetRect
          );
          return;
        }
      }
    }

    // No word matched at coordinates
    if (isHover && this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
      this.scheduleHoverHide();
    }
  }

  /**
   * Reading View double-click handler
   */
  private handleReadingViewDblClick(event: MouseEvent): void {
    if (!this.settings.enabled) return;
    if (this.settings.triggerMode === "command_only") return;
    if (this.settings.triggerMode === "hover") return;

    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest(".cm-editor") || target.closest(".ch-dict-tooltip")) {
      return;
    }

    const container = target.closest(
      ".markdown-rendered, .markdown-preview-view"
    );
    if (!(container instanceof HTMLElement)) return;

    const bounds = this.getContentBounds(target, undefined);
    this.handleReadingViewLookup(event.clientX, event.clientY, container, bounds, event, false);
  }

  /**
   * Reading View mousemove handler for hover triggers
   */
  private handleReadingViewMouseMove(event: MouseEvent): void {
    if (!this.settings.enabled) return;
    const mode = this.settings.triggerMode;
    const isReader = this.settings.readerMode;
    if (mode !== "hover" && mode !== "hover_modifier" && !isReader) return;

    if (mode === "hover_modifier" && !isReader) {
      if (!this.checkModifier(event, this.settings.hoverModifierKey)) {
        this.cancelHoverLookup();
        return;
      }
    }

    // Fast jitter guard before expensive DOM closest() calls
    if (this.lastHoverCoords && this.hoverTimeout !== null) {
      if (Math.hypot(event.clientX - this.lastHoverCoords.x, event.clientY - this.lastHoverCoords.y) < 4) {
        return;
      }
    }

    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest(".cm-editor") || target.closest(".ch-dict-tooltip")) {
      this.cancelHoverLookup();
      this.cancelHoverHide();
      return;
    }

    const container = target.closest(
      ".markdown-rendered, .markdown-preview-view"
    );
    if (!(container instanceof HTMLElement)) {
      this.cancelHoverLookup();
      return;
    }

    this.scheduleHoverLookup(
      event.clientX,
      event.clientY,
      undefined,
      container,
      target
    );
  }

  /**
   * Reading View word lookup implementation
   */
  private handleReadingViewLookup(
    clientX: number,
    clientY: number,
    container: HTMLElement,
    bounds?: ContentBounds,
    event?: MouseEvent,
    isHover: boolean = false
  ): void {
    if (!this.dictionary.isReady()) {
      if (!isHover) {
        new Notice("Dictionary is still loading, please wait a moment...", 2000);
      }
      return;
    }

    // If mouse is inside tooltip, do not trigger and cancel hide
    if (this.tooltip.getIsOpen()) {
      const tooltipEl = this.tooltip.getElement();
      const rect = tooltipEl.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        this.cancelHoverLookup();
        this.cancelHoverHide();
        return;
      }
    }

    const resolvedBounds = bounds || this.getContentBounds(container, undefined);

    // 1. Act on Obsidian / browser internal selection if present
    const selection = (container.win || window).getSelection();
    const selectedText = selection ? selection.toString().trim() : "";
    let selTargetRect: TargetRect | undefined = undefined;
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
      try {
        const r = selection.getRangeAt(0).getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          selTargetRect = {
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
          };
        }
      } catch {
        // ignore
      }
    }

    if (selectedText && this.dictionary.isChinese(selectedText)) {
      if (isHover && !this.isPointOverTargetRect(clientX, clientY, selTargetRect)) {
        if (this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
          this.scheduleHoverHide();
        }
        return;
      }

      if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord() === selectedText) {
        this.cancelHoverHide();
        return;
      }

      // Check if selectedText is part of a longer idiom/proverb in the surrounding text node
      const parentText = selection?.anchorNode?.textContent || "";
      if (parentText && parentText.length > selectedText.length) {
        const anchorOffset = selection?.anchorOffset || 0;
        const lineMatch = this.dictionary.findWordAtOffset(
          parentText,
          anchorOffset,
          Math.max(this.settings.maxWordLength || 12, 12)
        );
        if (lineMatch && lineMatch.length > Array.from(selectedText).length && lineMatch.word.includes(selectedText)) {
          this.cancelHoverHide();
          this.tooltip.show(
            lineMatch,
            clientX,
            clientY,
            this.settings,
            resolvedBounds,
            undefined,
            selTargetRect
          );
          return;
        }
      }

      const directEntries = this.dictionary.getOrSynthesize(selectedText);
      if (directEntries && directEntries.length > 0) {
        this.cancelHoverHide();
        this.tooltip.show(
          {
            word: selectedText,
            entries: directEntries,
            length: Array.from(selectedText).length,
          },
          clientX,
          clientY,
          this.settings,
          resolvedBounds,
          undefined,
          selTargetRect
        );
        return;
      }

      const match = this.dictionary.findLongestMatch(
        selectedText,
        this.settings.maxWordLength || 12
      );
      if (match) {
        this.cancelHoverHide();
        this.tooltip.show(
          {
            word: match.word,
            entries: match.entries,
            length: match.length,
          },
          clientX,
          clientY,
          this.settings,
          resolvedBounds,
          undefined,
          selTargetRect
        );
        return;
      }
    } else if (selectedText && this.settings.enableReverseLookup) {
      if (isHover && !this.isPointOverTargetRect(clientX, clientY, selTargetRect)) {
        if (this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
          this.scheduleHoverHide();
        }
        return;
      }
      const rev = this.dictionary.lookupReverse(selectedText, this.settings.reverseLookupLanguage);
      if (rev) {
        this.cancelHoverHide();
        this.tooltip.show(
          rev,
          clientX,
          clientY,
          this.settings,
          resolvedBounds,
          undefined,
          selTargetRect
        );
        return;
      }
    }

    // Determine caret position from coordinates
    let range: Range | null = null;
    if ("caretPositionFromPoint" in document) {
      const pos = (document as unknown as { caretPositionFromPoint(x: number, y: number): { offsetNode: Node; offset: number } | null }).caretPositionFromPoint(clientX, clientY);
      if (pos?.offsetNode) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.setEnd(pos.offsetNode, pos.offset);
      }
    } else if ("caretRangeFromPoint" in document) {
      const docWithRange = document as unknown as { caretRangeFromPoint(x: number, y: number): Range | null };
      range = docWithRange.caretRangeFromPoint(clientX, clientY);
    }

    if (
      !range ||
      !range.startContainer ||
      range.startContainer.nodeType !== Node.TEXT_NODE
    ) {
      if (isHover && this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
        this.scheduleHoverHide();
      }
      return;
    }

    const textNode = range.startContainer as Text;
    const offset = range.startOffset;
    const fullText = textNode.textContent || "";

    // If selectCantonesePhrases is enabled, check for Cantonese phrases
    if (this.settings.selectCantonesePhrases) {
      const cantoMatch = this.dictionary.findCantonesePhraseAtOffset(
        fullText,
        offset,
        this.settings.maxWordLength
      );
      if (cantoMatch && cantoMatch.start !== undefined && cantoMatch.end !== undefined) {
        const targetRect = this.getReadingViewTargetRect(textNode, cantoMatch.start, cantoMatch.end);

        if (isHover && !this.isPointOverTargetRect(clientX, clientY, targetRect)) {
          if (this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
            this.scheduleHoverHide();
          }
          return;
        }

        if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord() === cantoMatch.word) {
          this.cancelHoverHide();
          return;
        }

        try {
          const sel = (textNode.parentElement?.win || window).getSelection();
          if (sel) {
            const wordRange = document.createRange();
            wordRange.setStart(textNode, cantoMatch.start);
            wordRange.setEnd(textNode, cantoMatch.end);
            sel.removeAllRanges();
            sel.addRange(wordRange);
          }
          if (event) {
            event.preventDefault();
          }
        } catch {
          // ignore
        }
        const context = this.settings.autoSaveContextSentence
          ? this.extractContextSentence(fullText, offset)
          : undefined;
        this.cancelHoverHide();
        this.tooltip.show(cantoMatch, clientX, clientY, this.settings, resolvedBounds, context, targetRect);
        return;
      }
    }

    const match = this.dictionary.findWordAtOffset(
      fullText,
      offset,
      this.settings.maxWordLength
    );

    if (match) {
      const wordStart = match.start ?? offset;
      const wordEnd = match.end ?? (offset + match.length);
      const targetRect = this.getReadingViewTargetRect(textNode, wordStart, wordEnd);

      if (isHover && !this.isPointOverTargetRect(clientX, clientY, targetRect)) {
        if (this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
          this.scheduleHoverHide();
        }
        return;
      }

      if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord() === match.word) {
        this.cancelHoverHide();
        return;
      }

      const context = this.settings.autoSaveContextSentence
        ? this.extractContextSentence(fullText, offset)
        : undefined;
      this.cancelHoverHide();
      this.tooltip.show(match, clientX, clientY, this.settings, resolvedBounds, context, targetRect);
      return;
    } else if (this.settings.enableReverseLookup) {
      const foreignMatch = this.extractForeignWordRangeAtOffset(fullText, offset);
      if (foreignMatch) {
        const targetRect = this.getReadingViewTargetRect(textNode, foreignMatch.start, foreignMatch.end);
        if (isHover && !this.isPointOverTargetRect(clientX, clientY, targetRect)) {
          if (this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
            this.scheduleHoverHide();
          }
          return;
        }
        const rev = this.dictionary.lookupReverse(foreignMatch.word, this.settings.reverseLookupLanguage);
        if (rev) {
          if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord() === rev.word) {
            this.cancelHoverHide();
            return;
          }
          const context = this.settings.autoSaveContextSentence
            ? this.extractContextSentence(fullText, offset)
            : undefined;
          this.cancelHoverHide();
          this.tooltip.show(
            rev,
            clientX,
            clientY,
            this.settings,
            resolvedBounds,
            context,
            targetRect
          );
          return;
        }
      }
    }

    // No word matched at coordinates
    if (isHover && this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
      this.scheduleHoverHide();
    }
  }

  /**
   * Debounced hover scheduler
   */
  private scheduleHoverLookup(
    x: number,
    y: number,
    view?: EditorView,
    containerEl?: HTMLElement,
    targetEl?: HTMLElement
  ): void {
    // Jitter guard: avoid resetting timer if cursor only moved < 4px
    if (this.lastHoverCoords && this.hoverTimeout !== null) {
      const dist = Math.hypot(x - this.lastHoverCoords.x, y - this.lastHoverCoords.y);
      if (dist < 4) {
        return;
      }
    }

    this.lastHoverCoords = { x, y };
    this.cancelHoverLookup();

    const runLookup = () => {
      this.hoverTimeout = null;
      if (!this.lastHoverCoords) return;
      if (!this.settings.enabled || !this.dictionary.isReady()) return;

      const bounds = this.getContentBounds(targetEl, view);

      if (view) {
        if ((view as unknown as { destroyed?: boolean }).destroyed) return;
        this.handleEditorLookup(
          this.lastHoverCoords.x,
          this.lastHoverCoords.y,
          view,
          bounds,
          true
        );
      } else if (containerEl) {
        this.handleReadingViewLookup(
          this.lastHoverCoords.x,
          this.lastHoverCoords.y,
          containerEl,
          bounds,
          undefined,
          true
        );
      }
    };

    // Instant 0ms lookup in Reader Mode; configurable delay otherwise
    if (this.settings.readerMode) {
      runLookup();
      return;
    }

    this.hoverTimeout = window.setTimeout(runLookup, this.settings.hoverDelayMs || 300);
  }

  public scheduleHoverHide(delayMs: number = 250): void {
    if (this.hoverHideTimeout !== null) return;
    this.hoverHideTimeout = window.setTimeout(() => {
      this.hoverHideTimeout = null;
      if (this.tooltip.getIsOpen() && !this.tooltip.getIsPinned()) {
        this.tooltip.hide();
      }
    }, delayMs);
  }

  public cancelHoverHide(): void {
    if (this.hoverHideTimeout !== null) {
      window.clearTimeout(this.hoverHideTimeout);
      this.hoverHideTimeout = null;
    }
  }

  public cancelHoverLookup(): void {
    if (this.hoverTimeout !== null) {
      window.clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  // ==========================================
  // COMMAND IMPLEMENTATIONS (HOTKEYS)
  // ==========================================

  /**
   * Look up word under cursor or selection in active editor
   */
  public lookupAtEditorCursor(editor: Editor): void {
    if (!this.settings.enabled) {
      new Notice("Словарь отключен. Включите его в настройках плагина.");
      return;
    }
    if (!this.dictionary.isReady()) {
      new Notice("Словарь еще загружается, пожалуйста, подождите...", 2000);
      return;
    }

    const win = (typeof activeWindow !== "undefined" && activeWindow) ? activeWindow : window;
    const selection = editor.getSelection().trim();
    let clientX = win.innerWidth / 2;
    let clientY = win.innerHeight / 2;

    const cmEditor = editor as CodeMirrorEditor;
    const cm = cmEditor.cm;
    let targetRect: TargetRect | undefined = undefined;
    if (cm) {
      const head = cm.state.selection.main.head;
      const coords = cm.coordsAtPos(head);
      if (coords) {
        clientX = coords.left;
        clientY = coords.bottom;
        targetRect = {
          left: coords.left,
          right: coords.right,
          top: coords.top,
          bottom: coords.bottom,
        };
      }
    } else if (typeof cmEditor.cursorCoords === "function") {
      const coords = cmEditor.cursorCoords(true, "window");
      if (coords) {
        clientX = coords.left;
        clientY = coords.bottom;
        targetRect = {
          left: coords.left,
          right: coords.right,
          top: coords.top,
          bottom: coords.bottom,
        };
      }
    }

    const bounds = this.getContentBounds(null, cm);

    if (selection && this.dictionary.isChinese(selection)) {
      const directEntries = this.dictionary.get(selection);
      if (directEntries && directEntries.length > 0) {
        this.tooltip.show(
          { word: selection, entries: directEntries, length: Array.from(selection).length },
          clientX,
          clientY,
          this.settings,
          bounds,
          undefined,
          targetRect
        );
        return;
      }
      const match = this.dictionary.findLongestMatch(selection, this.settings.maxWordLength);
      if (match) {
        this.tooltip.show(
          { word: match.word, entries: match.entries, length: match.length },
          clientX,
          clientY,
          this.settings,
          bounds,
          undefined,
          targetRect
        );
        return;
      }
    } else if (selection && this.settings.enableReverseLookup) {
      const rev = this.dictionary.lookupReverse(selection, this.settings.reverseLookupLanguage);
      if (rev) {
        this.tooltip.show(
          rev,
          clientX,
          clientY,
          this.settings,
          bounds,
          undefined,
          targetRect
        );
        return;
      }
    }

    const cursor = editor.getCursor();
    const lineText = editor.getLine(cursor.line);
    const match = this.dictionary.findWordAtOffset(
      lineText,
      cursor.ch,
      this.settings.maxWordLength
    );

    if (match) {
      if (
        this.settings.selectCantonesePhrases &&
        match.start !== undefined &&
        match.end !== undefined
      ) {
        editor.setSelection(
          { line: cursor.line, ch: match.start },
          { line: cursor.line, ch: match.end }
        );
      }

      const context = this.settings.autoSaveContextSentence
        ? this.extractContextSentence(lineText, cursor.ch)
        : undefined;
      this.tooltip.show(match, clientX, clientY, this.settings, bounds, context, targetRect);
    } else if (this.settings.enableReverseLookup) {
      const foreignWord = this.extractForeignWordAtOffset(lineText, cursor.ch);
      if (foreignWord) {
        const rev = this.dictionary.lookupReverse(foreignWord, this.settings.reverseLookupLanguage);
        if (rev) {
          const context = this.settings.autoSaveContextSentence
            ? this.extractContextSentence(lineText, cursor.ch)
            : undefined;
          this.tooltip.show(
            rev,
            clientX,
            clientY,
            this.settings,
            bounds,
            context,
            targetRect
          );
          return;
        }
      }
      new Notice("Иероглиф не найден под курсором / No Chinese character at cursor", 2000);
    } else {
      new Notice("Иероглиф не найден под курсором / No Chinese character at cursor", 2000);
    }
  }

  /**
   * Look up selected text in Reading View
   */
  public lookupAtReadingView(): void {
    const win = (typeof activeWindow !== "undefined" && activeWindow) ? activeWindow : window;
    const selection = win.getSelection();
    const selectedText = selection ? selection.toString().trim() : "";
    if (!selectedText) {
      new Notice("Выделите слово для поиска / Select word to look up", 2000);
      return;
    }

    if (this.dictionary.isChinese(selectedText)) {
      const directEntries = this.dictionary.get(selectedText);
      if (directEntries && directEntries.length > 0) {
        let clientX = win.innerWidth / 2;
        let clientY = win.innerHeight / 2;

        if (selection && selection.rangeCount > 0) {
          const rect = selection.getRangeAt(0).getBoundingClientRect();
          clientX = rect.left + rect.width / 2;
          clientY = rect.bottom;
        }

        const bounds = this.getContentBounds(null, undefined);

        this.tooltip.show(
          { word: selectedText, entries: directEntries, length: Array.from(selectedText).length },
          clientX,
          clientY,
          this.settings,
          bounds
        );
      } else {
        new Notice(`Слово '${selectedText}' не найдено в словаре`, 2000);
      }
    } else if (this.settings.enableReverseLookup) {
      const rev = this.dictionary.lookupReverse(selectedText, this.settings.reverseLookupLanguage);
      if (rev) {
        let clientX = win.innerWidth / 2;
        let clientY = win.innerHeight / 2;

        if (selection && selection.rangeCount > 0) {
          const rect = selection.getRangeAt(0).getBoundingClientRect();
          clientX = rect.left + rect.width / 2;
          clientY = rect.bottom;
        }

        const bounds = this.getContentBounds(null, undefined);

        this.tooltip.show(
          rev,
          clientX,
          clientY,
          this.settings,
          bounds
        );
      } else {
        new Notice(`Перевод для '${selectedText}' не найден`, 2000);
      }
    } else {
      new Notice("Выделите китайское слово для поиска / Select Chinese word to look up", 2000);
    }
  }

  /**
   * Resolves the currently active Chinese word & match (open popover -> selection -> cursor word)
   */
  private resolveActiveWordContext(): {
    word: string;
    match?: MatchResult;
    contextSentence?: string;
  } | null {
    if (this.tooltip.getIsOpen() && this.tooltip.getCurrentMatch()) {
      const m = this.tooltip.getCurrentMatch()!;
      return {
        word: m.word,
        match: m,
        contextSentence: this.tooltip.getCurrentContextSentence(),
      };
    }

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView?.editor) return null;

    const editor = activeView.editor;
    const cursor = editor.getCursor();
    const lineText = editor.getLine(cursor.line);
    const contextSentence = this.settings.autoSaveContextSentence
      ? this.extractContextSentence(lineText, cursor.ch)
      : undefined;

    const selection = editor.getSelection().trim();
    if (selection && this.dictionary.isChinese(selection)) {
      const entries = this.dictionary.get(selection);
      const match: MatchResult | undefined =
        entries && entries.length > 0
          ? { word: selection, entries, length: Array.from(selection).length }
          : undefined;
      return { word: selection, match, contextSentence: contextSentence ?? lineText };
    }

    const match = this.dictionary.findWordAtOffset(lineText, cursor.ch, this.settings.maxWordLength);
    if (match) {
      return { word: match.word, match, contextSentence: contextSentence ?? lineText };
    }

    return null;
  }

  /**
   * Toggles Reader Mode and updates status bar & fonts immediately
   */
  public async toggleReaderMode(): Promise<void> {
    this.settings.readerMode = !this.settings.readerMode;
    await this.saveSettings();
    this.updateReaderStatusBar();
    this.applyCurrentFont();
    new Notice(
      `Режим быстрого чтения: ${this.settings.readerMode ? "ВКЛ (ON) 🏮" : "ВЫКЛ (OFF)"}`
    );
  }

  /**
   * Pronounce currently active or selected word
   */
  public pronounceActiveWord(): void {
    const ctx = this.resolveActiveWordContext();
    if (ctx?.word) {
      this.tooltip.playSpeech(ctx.word, this.settings);
      if (!this.tooltip.getIsOpen()) {
        new Notice(`Озвучивание: ${ctx.word}`);
      }
      return;
    }
    new Notice("Нет слова для озвучивания / No active word to pronounce");
  }

  /**
   * Copy currently active word and definition to clipboard
   */
  public copyActiveWord(): void {
    if (this.tooltip.getIsOpen() && this.tooltip.getCurrentMatch()) {
      this.tooltip.copyCurrentEntry(this.settings);
      return;
    }
    const ctx = this.resolveActiveWordContext();
    if (ctx?.match) {
      this.tooltip.copyEntryDirect(ctx.match, this.settings);
      return;
    }
    new Notice("Нет слова для копирования / No active word to copy");
  }

  /**
   * Creates atomic Zettelkasten note for active word
   */
  public async createActiveWordNote(): Promise<void> {
    const ctx = this.resolveActiveWordContext();
    if (!ctx?.word) {
      new Notice("Нет активного слова для создания заметки.");
      return;
    }

    const match =
      ctx.match ||
      this.dictionary.getExact(ctx.word) || {
        word: ctx.word,
        entries: [{
          simplified: ctx.word,
          traditional: ctx.word,
          pinyin: "",
          definitions: [],
        }],
        length: Array.from(ctx.word).length,
      };

    await createWordNote(this.app, match, ctx.contextSentence, {
      folderPath: this.settings.wordNotesFolder || "Chinese/Words",
      openAfterCreation: true,
    });
  }

  /**
   * Instant toggle between Cantonese and Mandarin
   */
  public async switchDialect(): Promise<void> {
    if (this.settings.dialect === "cantonese") {
      this.settings.dialect = "mandarin";
    } else {
      this.settings.dialect = "cantonese";
    }
    await this.saveSettings();

    const label =
      this.settings.dialect === "cantonese"
        ? "Гуандунхуа / Кантонский (廣東話)"
        : "Путунхуа / Мандарин (普通话)";
    new Notice(`Диалект озвучки: ${label}`);

    if (this.tooltip.getIsOpen()) {
      this.tooltip.refresh(this.settings);
    }
  }

  /**
   * Cycle phonetic display mode (Both -> Pinyin -> Jyutping -> Auto)
   */
  public async cyclePhoneticDisplay(): Promise<void> {
    const modes: PhoneticDisplay[] = [
      "both",
      "pinyin",
      "jyutping",
      "dialect_auto",
    ];
    const names: Record<PhoneticDisplay, string> = {
      both: "И пиньинь, и ютпинг (Pinyin / Jyutping)",
      pinyin: "Только пиньинь (Pinyin only)",
      jyutping: "Только ютпинг (Jyutping only)",
      dialect_auto: "Авто по диалекту (Auto by Dialect)",
    };
    const currentIndex = modes.indexOf(this.settings.phoneticDisplay);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    this.settings.phoneticDisplay = nextMode;
    await this.saveSettings();

    new Notice(`Отображение фонетики: ${names[nextMode]}`);

    if (this.tooltip.getIsOpen()) {
      this.tooltip.refresh(this.settings);
    }
  }

  /**
   * Opens or reveals the Chinese Vocabulary View in the right sidebar
   */
  public async activateVocabularyView(): Promise<void> {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_CHINESE_VOCABULARY)[0];

    if (!leaf) {
      const rightLeaf = workspace.getRightLeaf(false);
      if (rightLeaf) {
        await rightLeaf.setViewState({
          type: VIEW_TYPE_CHINESE_VOCABULARY,
          active: true,
        });
        leaf = rightLeaf;
      }
    }

    if (leaf) {
      workspace.setActiveLeaf(leaf, { focus: true });
      if (leaf.view instanceof ChineseVocabularyView) {
        leaf.view.render();
      }
    }
  }

  /**
   * Refreshes any open vocabulary view tabs in real time
   */
  public refreshVocabularyViews(): void {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_CHINESE_VOCABULARY);
    for (const leaf of leaves) {
      if (leaf.view instanceof ChineseVocabularyView) {
        leaf.view.render();
      }
    }
  }

  /**
   * Extracts the full sentence surrounding the given character offset
   */
  public extractContextSentence(text: string, offset: number): string {
    if (!text) return "";
    const delimiters = /[。！？!?;\n]/;

    let start = 0;
    for (let i = offset - 1; i >= 0; i--) {
      if (delimiters.test(text[i])) {
        start = i + 1;
        break;
      }
    }

    let end = text.length;
    for (let i = offset; i < text.length; i++) {
      if (delimiters.test(text[i])) {
        end = i + 1;
        break;
      }
    }

    const sentence = text.substring(start, end).trim();
    return sentence.length > 0 ? sentence : text.trim();
  }

  /**
   * Checks if cursor coordinates are strictly over the target word bounding box (2px subpixel tolerance)
   */
  private isPointOverTargetRect(clientX: number, clientY: number, rect?: TargetRect): boolean {
    if (!rect) return true;
    const MARGIN = 2;
    return (
      clientX >= rect.left - MARGIN &&
      clientX <= rect.right + MARGIN &&
      clientY >= rect.top - MARGIN &&
      clientY <= rect.bottom + MARGIN
    );
  }

  /**
   * Extracts a foreign word and its [start, end] range at the specified character offset
   */
  public extractForeignWordRangeAtOffset(
    text: string,
    offset: number
  ): { word: string; start: number; end: number } | null {
    if (!text || offset < 0 || offset > text.length) return null;
    const isWordChar = (c: string) => /[\p{L}\p{N}'\-_]/u.test(c);
    let idx = offset;
    if (idx >= text.length || !isWordChar(text[idx])) {
      if (idx > 0 && isWordChar(text[idx - 1])) {
        idx = idx - 1;
      } else {
        return null;
      }
    }
    let start = idx;
    while (start > 0 && isWordChar(text[start - 1])) start--;
    let end = idx;
    while (end < text.length && isWordChar(text[end])) end++;
    const word = text.slice(start, end).replace(/^['\-_]+|['\-_]+$/g, "").trim();
    if (!word || this.dictionary.isChinese(word)) return null;
    return { word, start, end };
  }

  /**
   * Extracts a foreign word (English, Russian, etc.) at the specified character offset
   */
  public extractForeignWordAtOffset(text: string, offset: number): string | null {
    return this.extractForeignWordRangeAtOffset(text, offset)?.word || null;
  }

  /**
   * Toggle starring of active word (under popover or under cursor)
   */
  public async toggleStarActiveWord(): Promise<void> {
    const ctx = this.resolveActiveWordContext();
    if (ctx?.match) {
      await this.vocabulary.toggleWord(ctx.match, ctx.contextSentence);
      if (this.tooltip.getIsOpen()) {
        this.tooltip.refresh(this.settings);
      }
      this.refreshVocabularyViews();
      return;
    }
    new Notice("Нет слова для добавления в словарик / No active word to star");
  }

  /**
   * Updates text and visual style of status bar reader indicator
   */
  public updateReaderStatusBar(): void {
    if (!this.readerStatusBarItem) return;
    if (this.settings.readerMode) {
      this.readerStatusBarItem.setText("🏮 Чтение: ВКЛ");
      this.readerStatusBarItem.setAttribute(
        "title",
        "Режим быстрого чтения ВКЛЮЧЕН (Наведите на китайское слово без зажатия клавиш). Нажмите для выключения."
      );
      this.readerStatusBarItem.addClass("ch-dict-status-reader-active");
    } else {
      this.readerStatusBarItem.setText("🏮 Чтение: ВЫКЛ");
      this.readerStatusBarItem.setAttribute(
        "title",
        "Режим быстрого чтения ВЫКЛЮЧЕН. Нажмите для включения (быстрый перевод при наведении мыши)."
      );
      this.readerStatusBarItem.removeClass("ch-dict-status-reader-active");
    }
  }

  /**
   * Annotates Chinese text with HTML <ruby> tags: <ruby>汉<rt>hàn</rt></ruby>
   */
  public convertTextToRuby(
    text: string,
    dialect: "pinyin" | "jyutping" = "pinyin"
  ): string {
    if (!text) return "";
    let result = "";
    let i = 0;
    const chars = Array.from(text);

    while (i < chars.length) {
      const char = chars[i];
      if (HAN_CHAR_RE.test(char)) {
        // Try matching words up to 4 characters first for correct multi-character polyphonic readings
        let matchedLen = 1;
        let pinyinStr = "";
        let jyutpingStr = "";

        for (let l = Math.min(4, chars.length - i); l >= 1; l--) {
          const subWord = chars.slice(i, i + l).join("");
          const entries = this.dictionary.get(subWord);
          if (entries && entries.length > 0) {
            matchedLen = l;
            pinyinStr = entries[0].pinyin;
            jyutpingStr = entries[0].jyutping || "";
            break;
          }
        }

        const matchedChars = chars.slice(i, i + matchedLen);
        if (dialect === "jyutping" && jyutpingStr) {
          const jpTones = jyutpingStr.split(/\s+/).filter(Boolean);
          if (jpTones.length === matchedLen) {
            for (let c = 0; c < matchedLen; c++) {
              result += `<ruby>${matchedChars[c]}<rt>${jpTones[c]}</rt></ruby>`;
            }
          } else {
            result += `<ruby>${matchedChars.join("")}<rt>${jyutpingStr}</rt></ruby>`;
          }
        } else if (pinyinStr) {
          const pinyinParts = pinyinStr
            .split(/\s+/)
            .filter(Boolean)
            .map((p) => formatPinyin(p, true));
          if (pinyinParts.length === matchedLen) {
            for (let c = 0; c < matchedLen; c++) {
              result += `<ruby>${matchedChars[c]}<rt>${pinyinParts[c]}</rt></ruby>`;
            }
          } else {
            const formatted = formatPinyin(pinyinStr, true);
            result += `<ruby>${matchedChars.join("")}<rt>${formatted}</rt></ruby>`;
          }
        } else {
          result += char;
        }

        i += matchedLen;
      } else {
        result += char;
        i++;
      }
    }

    return result;
  }

  public hasActiveEditorHanziFont(): boolean {
    const useReaderFont =
      this.settings.readerMode &&
      this.settings.readerModeFontFamily &&
      this.settings.readerModeFontFamily !== "default";
    const preset = useReaderFont
      ? this.settings.readerModeFontFamily
      : this.settings.chineseFontFamily;
    return Boolean(preset && preset !== "default");
  }

  /**
   * Applies the active Chinese font preset to the workspace DOM:
   * uses the separate Reader Mode font when Reader Mode is active and configured,
   * and restores the normal font when Reader Mode is turned off.
   */
  public applyCurrentFont(): void {
    const useReaderFont =
      this.settings.readerMode &&
      this.settings.readerModeFontFamily &&
      this.settings.readerModeFontFamily !== "default";

    const preset = useReaderFont
      ? this.settings.readerModeFontFamily
      : this.settings.chineseFontFamily;
    const customFont = useReaderFont
      ? this.settings.readerModeCustomFont
      : this.settings.customChineseFont;

    applyChineseFontToDOM(preset, this.settings.chineseFontScope, customFont);

    if (this.tooltip?.getIsOpen()) {
      this.tooltip.refresh(this.settings);
    }
    this.app.workspace.updateOptions();
  }
}
