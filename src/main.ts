import { EditorView } from "@codemirror/view";
import { EditorSelection, Extension } from "@codemirror/state";
import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import { DictionaryManager } from "./dictionary.ts";
import {
  ChineseDictSettings,
  ChineseDictSettingTab,
  DEFAULT_SETTINGS,
  ModifierKey,
  PhoneticDisplay,
} from "./settings.ts";
import { ContentBounds, DictTooltip } from "./tooltip.ts";
import { VocabularyManager } from "./vocabulary.ts";
import {
  ChineseVocabularyView,
  VIEW_TYPE_CHINESE_VOCABULARY,
} from "./vocabulary-view.ts";
import { applyChineseFontToDOM } from "./font.ts";
import { StrokeOrderModal } from "./stroke-order.ts";
import { addNoteToAnki, generateAnkiTsv } from "./anki.ts";
import { formatPinyin } from "./pinyin.ts";
import { TextAnalyzerModal } from "./analyzer.ts";
import { createWordNote } from "./word-notes.ts";
import { convertToSimplified, convertToTraditional } from "./converter.ts";
import { generatePlecoFlashcards } from "./pleco.ts";
import { WorksheetModal } from "./worksheet.ts";
import { HistoryManager } from "./history.ts";
import { ChineseSearchModal } from "./search-modal.ts";

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
  private lastHoverCoords: { x: number; y: number } | null = null;
  private readerStatusBarItem: HTMLElement | null = null;

  override async onload(): Promise<void> {
    await this.loadSettings();

    // Apply Chinese font settings to Obsidian workspace DOM
    applyChineseFontToDOM(
      this.settings.chineseFontFamily,
      this.settings.chineseFontScope,
      this.settings.customChineseFont
    );

    this.dictionary = new DictionaryManager(this);
    // Non-blocking background load: Obsidian launches instantly without freeze
    this.dictionary.load().catch((err) => {
      console.error("[Chinese Dict] Background load error:", err);
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
      void (async () => {
        this.settings.readerMode = !this.settings.readerMode;
        await this.saveSettings();
        this.updateReaderStatusBar();
        new Notice(
          `Режим быстрого чтения: ${
            this.settings.readerMode ? "ВКЛ (ON) 🏮" : "ВЫКЛ (OFF)"
          }`
        );
      })();
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
      callback: async () => {
        this.settings.readerMode = !this.settings.readerMode;
        await this.saveSettings();
        this.updateReaderStatusBar();
        new Notice(
          `Режим быстрого чтения: ${
            this.settings.readerMode ? "ВКЛ (ON) 🏮" : "ВЫКЛ (OFF)"
          }`
        );
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

        let word = "";
        if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord()) {
          word = this.tooltip.getCurrentWord()!;
        } else if (activeView?.editor) {
          word = activeView.editor.getSelection().trim();
          if (!word) {
            const cursor = activeView.editor.getCursor();
            const line = activeView.editor.getLine(cursor.line);
            const match = this.dictionary.findWordAtOffset(
              line,
              cursor.ch,
              this.settings.maxWordLength
            );
            if (match) word = match.word;
          }
        }

        if (word) {
          new StrokeOrderModal(this.app, word).open();
        } else {
          new Notice("Не найден китайский иероглиф под курсором или в выделении.");
        }
        return true;
      },
    });

    // 12. Add Ruby Pinyin / Furigana to selection
    this.addCommand({
      id: "add-ruby-pinyin",
      name: "Добавить пиньинь (Ruby/Furigana) к выделенному тексту / Add Ruby Pinyin",
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView || !activeView.editor) return false;
        const sel = activeView.editor.getSelection().trim();
        if (!sel) return false;
        if (checking) return true;

        const ruby = this.convertTextToRuby(sel, "pinyin");
        activeView.editor.replaceSelection(ruby);
        new Notice("Пиньинь (Ruby) добавлен над текстом!");
        return true;
      },
    });

    // 13. Add Ruby Jyutping / Furigana to selection
    this.addCommand({
      id: "add-ruby-jyutping",
      name: "Добавить ютпинг (Ruby/Furigana) к выделенному тексту / Add Ruby Jyutping",
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView || !activeView.editor) return false;
        const sel = activeView.editor.getSelection().trim();
        if (!sel) return false;
        if (checking) return true;

        const ruby = this.convertTextToRuby(sel, "jyutping");
        activeView.editor.replaceSelection(ruby);
        new Notice("Ютпинг (Ruby) добавлен над текстом!");
        return true;
      },
    });

    // 14. Export Vocabulary to Anki TSV file
    this.addCommand({
      id: "export-vocabulary-anki-tsv",
      name: "Экспорт словарика в файл Anki (.tsv) / Export Vocabulary to Anki TSV",
      callback: () => {
        const items = this.vocabulary.getItems();
        if (items.length === 0) {
          new Notice("Словарик пуст! Сначала добавьте слова звёздочкой ⭐.");
          return;
        }
        const tsv = generateAnkiTsv(items);
        const blob = new Blob([tsv], {
          type: "text/tab-separated-values;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = createEl("a", {
          href: url,
          attr: {
            download: `Anki_Chinese_Vocabulary_${new Date()
              .toISOString()
              .slice(0, 10)}.tsv`,
          },
        });
        link.click();
        URL.revokeObjectURL(url);
        new Notice(`Экспортировано ${items.length} слов в TSV файл для Anki!`);
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
          const ok = await addNoteToAnki(this.settings.anki, item);
          if (ok) count++;
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
        let text = "";
        if (activeView?.editor) {
          text = activeView.editor.getSelection().trim() || activeView.editor.getValue();
        }
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

        let word = "";
        let contextSentence: string | undefined = undefined;
        if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord()) {
          word = this.tooltip.getCurrentWord()!;
          contextSentence = this.tooltip.getCurrentContextSentence();
        } else if (activeView?.editor) {
          word = activeView.editor.getSelection().trim();
          if (!word) {
            const cursor = activeView.editor.getCursor();
            const line = activeView.editor.getLine(cursor.line);
            const match = this.dictionary.findWordAtOffset(
              line,
              cursor.ch,
              this.settings.maxWordLength
            );
            if (match) {
              word = match.word;
              contextSentence = line;
            }
          }
        }

        if (word) {
          const match = this.dictionary.getExact(word);
          if (match) {
            void createWordNote(this.app, match, contextSentence, {
              folderPath: this.settings.wordNotesFolder || "Chinese/Words",
              openAfterCreation: true,
            });
          } else {
            const dummyMatch = {
              word,
              entries: [{
                simplified: word,
                traditional: word,
                pinyin: "",
                definitions: [],
              }],
              length: Array.from(word).length,
            };
            void createWordNote(this.app, dummyMatch, contextSentence, {
              folderPath: this.settings.wordNotesFolder || "Chinese/Words",
              openAfterCreation: true,
            });
          }
        } else {
          new Notice("Поместите курсор на китайское слово или выделите его.");
        }
        return true;
      },
    });

    // 18. Convert Selection to Traditional Chinese (繁體)
    this.addCommand({
      id: "convert-to-traditional",
      name: "Преобразовать выделенный текст в традиционные иероглифы (繁體) / Convert to Traditional",
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView || !activeView.editor) return false;
        const sel = activeView.editor.getSelection();
        if (!sel) return false;
        if (checking) return true;
        const converted = convertToTraditional(sel);
        activeView.editor.replaceSelection(converted);
        new Notice("Преобразовано в традиционные иероглифы (繁體)!");
        return true;
      },
    });

    // 19. Convert Selection to Simplified Chinese (简体)
    this.addCommand({
      id: "convert-to-simplified",
      name: "Преобразовать выделенный текст в упрощенные иероглифы (简体) / Convert to Simplified",
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView || !activeView.editor) return false;
        const sel = activeView.editor.getSelection();
        if (!sel) return false;
        if (checking) return true;
        const converted = convertToSimplified(sel);
        activeView.editor.replaceSelection(converted);
        new Notice("Преобразовано в упрощенные иероглифы (简体)!");
        return true;
      },
    });

    // 20. Speak Selected Text (TTS Cantonese / Mandarin)
    this.addCommand({
      id: "speak-selected-text",
      name: "Озвучить выделенный фрагмент текста (TTS) / Speak Selected Text",
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView || !activeView.editor) return false;
        const sel = activeView.editor.getSelection().trim();
        if (!sel) return false;
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
        const items = this.vocabulary.getItems();
        if (items.length === 0) {
          new Notice("Словарик пуст! Сначала добавьте слова звёздочкой ⭐.");
          return;
        }
        const txt = generatePlecoFlashcards(items);
        const blob = new Blob([txt], {
          type: "text/plain;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = createEl("a", {
          href: url,
          attr: {
            download: `Pleco_Chinese_Vocabulary_${new Date()
              .toISOString()
              .slice(0, 10)}.txt`,
          },
        });
        link.click();
        URL.revokeObjectURL(url);
        new Notice(`Экспортировано ${items.length} слов для Pleco!`);
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
  }

  async saveSettings(): Promise<void> {
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
    return {
      left: 10,
      right: window.innerWidth - 10,
      top: 10,
      bottom: window.innerHeight - 10,
    };
  }

  private getSizerInnerBounds(sizer: HTMLElement): ContentBounds {
    const rect = sizer.getBoundingClientRect();
    const style = window.getComputedStyle(sizer);
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
    return [
      // Mouse selection style facet: overrides double-click word selection ONLY for Cantonese phrases
      // Standard words and 4-character chengyu pass through to Obsidian's built-in word selector
      EditorView.mouseSelectionStyle.of((view: EditorView, event: MouseEvent) => {
        if (
          !this.settings.enabled ||
          !this.settings.selectCantonesePhrases ||
          event.button !== 0 ||
          event.detail !== 2
        ) {
          return null;
        }

        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (pos === null) return null;

        const line = view.state.doc.lineAt(pos);
        const lineOffset = pos - line.from;
        // Check ONLY for Cantonese colloquial phrases; for all other words, return null so Obsidian's built-in selector acts!
        const match = this.dictionary.findCantonesePhraseAtOffset(
          line.text,
          lineOffset,
          this.settings.maxWordLength
        );

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
          this.handleEditorLookup(event.clientX, event.clientY, view, bounds);
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

          const target = event.target as HTMLElement | null;
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
        },
      }),
    ];
  }

  /**
   * Handles lookup at exact pixel coordinates in CodeMirror
   */
  private handleEditorLookup(
    clientX: number,
    clientY: number,
    view: EditorView,
    bounds?: ContentBounds
  ): void {
    if (!this.dictionary.isReady()) {
      new Notice("Dictionary is still loading, please wait a moment...", 2000);
      return;
    }

    const pos = view.posAtCoords({ x: clientX, y: clientY });
    if (pos === null) return;

    const line = view.state.doc.lineAt(pos);
    const lineText = line.text;
    const lineOffset = pos - line.from;
    const resolvedBounds = bounds || this.getContentBounds(null, view);
    const context = this.settings.autoSaveContextSentence
      ? this.extractContextSentence(lineText, lineOffset)
      : undefined;

    // 1. Act on Obsidian's internal selection:
    // If Obsidian's built-in selector already selected text covering pos (e.g. 4-character chengyu),
    // look it up directly without shrinking or overriding Obsidian's selection!
    const selection = view.state.selection.main;
    let selectedText = "";
    if (!selection.empty && pos >= selection.from && pos <= selection.to) {
      selectedText = view.state.sliceDoc(selection.from, selection.to).trim();
    }

    if (selectedText && this.dictionary.isChinese(selectedText)) {
      const directEntries = this.dictionary.get(selectedText);
      if (directEntries && directEntries.length > 0) {
        this.tooltip.show(
          {
            word: selectedText,
            entries: directEntries,
            length: Array.from(selectedText).length,
            start: selection.from,
            end: selection.to,
          },
          clientX,
          clientY,
          this.settings,
          resolvedBounds,
          context
        );
        return;
      }

      const match = this.dictionary.findLongestMatch(
        selectedText,
        this.settings.maxWordLength
      );
      if (match) {
        this.tooltip.show(
          {
            word: match.word,
            entries: match.entries,
            length: match.length,
            start: selection.from,
            end: selection.to,
          },
          clientX,
          clientY,
          this.settings,
          resolvedBounds,
          context
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
      const absStart = match.start !== undefined ? line.from + match.start : undefined;
      const absEnd = match.end !== undefined ? line.from + match.end : undefined;
      this.tooltip.show(
        { ...match, start: absStart, end: absEnd },
        clientX,
        clientY,
        this.settings,
        resolvedBounds,
        context
      );
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
    this.handleReadingViewLookup(event.clientX, event.clientY, container, bounds, event);
  }

  /**
   * Reading View mousemove handler for hover triggers
   */
  private handleReadingViewMouseMove(event: MouseEvent): void {
    if (!this.settings.enabled) return;
    const mode = this.settings.triggerMode;
    const isReader = this.settings.readerMode;
    if (mode !== "hover" && mode !== "hover_modifier" && !isReader) return;

    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest(".cm-editor") || target.closest(".ch-dict-tooltip")) {
      return;
    }

    const container = target.closest(
      ".markdown-rendered, .markdown-preview-view"
    );
    if (!(container instanceof HTMLElement)) {
      this.cancelHoverLookup();
      return;
    }

    if (mode === "hover_modifier" && !isReader) {
      if (!this.checkModifier(event, this.settings.hoverModifierKey)) {
        this.cancelHoverLookup();
        return;
      }
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
    event?: MouseEvent
  ): void {
    if (!this.dictionary.isReady()) {
      new Notice("Dictionary is still loading, please wait a moment...", 2000);
      return;
    }

    const resolvedBounds = bounds || this.getContentBounds(container, undefined);

    // 1. Act on Obsidian / browser internal selection if present
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : "";
    if (selectedText && this.dictionary.isChinese(selectedText)) {
      const directEntries = this.dictionary.get(selectedText);
      if (directEntries && directEntries.length > 0) {
        this.tooltip.show(
          {
            word: selectedText,
            entries: directEntries,
            length: Array.from(selectedText).length,
          },
          clientX,
          clientY,
          this.settings,
          resolvedBounds
        );
        return;
      }

      const match = this.dictionary.findLongestMatch(
        selectedText,
        this.settings.maxWordLength
      );
      if (match) {
        this.tooltip.show(
          {
            word: match.word,
            entries: match.entries,
            length: match.length,
          },
          clientX,
          clientY,
          this.settings,
          resolvedBounds
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
        try {
          const sel = window.getSelection();
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
        this.tooltip.show(cantoMatch, clientX, clientY, this.settings, resolvedBounds, context);
        return;
      }
    }

    const match = this.dictionary.findWordAtOffset(
      fullText,
      offset,
      this.settings.maxWordLength
    );

    if (match) {
      const context = this.settings.autoSaveContextSentence
        ? this.extractContextSentence(fullText, offset)
        : undefined;
      this.tooltip.show(match, clientX, clientY, this.settings, resolvedBounds, context);
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

    this.hoverTimeout = window.setTimeout(() => {
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
          bounds
        );
      } else if (containerEl) {
        this.handleReadingViewLookup(
          this.lastHoverCoords.x,
          this.lastHoverCoords.y,
          containerEl,
          bounds
        );
      }
    }, this.settings.hoverDelayMs || 300);
  }

  private cancelHoverLookup(): void {
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

    const selection = editor.getSelection().trim();
    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;

    const cmEditor = editor as CodeMirrorEditor;
    const cm = cmEditor.cm;
    if (cm) {
      const head = cm.state.selection.main.head;
      const coords = cm.coordsAtPos(head);
      if (coords) {
        clientX = coords.left;
        clientY = coords.bottom;
      }
    } else if (typeof cmEditor.cursorCoords === "function") {
      const coords = cmEditor.cursorCoords(true, "window");
      if (coords) {
        clientX = coords.left;
        clientY = coords.bottom;
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
          bounds
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
          bounds
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
      this.tooltip.show(match, clientX, clientY, this.settings, bounds, context);
    } else {
      new Notice("Иероглиф не найден под курсором / No Chinese character at cursor", 2000);
    }
  }

  /**
   * Look up selected text in Reading View
   */
  public lookupAtReadingView(): void {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : "";
    if (!selectedText || !this.dictionary.isChinese(selectedText)) {
      new Notice("Выделите китайское слово для поиска / Select Chinese word to look up", 2000);
      return;
    }

    const directEntries = this.dictionary.get(selectedText);
    if (directEntries && directEntries.length > 0) {
      let clientX = window.innerWidth / 2;
      let clientY = window.innerHeight / 2;

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
  }

  /**
   * Pronounce currently active or selected word
   */
  public pronounceActiveWord(): void {
    if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord()) {
      this.tooltip.playSpeech(this.tooltip.getCurrentWord()!, this.settings);
      return;
    }

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.editor) {
      const editor = activeView.editor;
      const selection = editor.getSelection().trim();
      if (selection && this.dictionary.isChinese(selection)) {
        this.tooltip.playSpeech(selection, this.settings);
        new Notice(`Озвучивание: ${selection}`);
        return;
      }
      const cursor = editor.getCursor();
      const lineText = editor.getLine(cursor.line);
      const match = this.dictionary.findWordAtOffset(
        lineText,
        cursor.ch,
        this.settings.maxWordLength
      );
      if (match) {
        this.tooltip.playSpeech(match.word, this.settings);
        new Notice(`Озвучивание: ${match.word}`);
        return;
      }
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

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.editor) {
      const editor = activeView.editor;
      const selection = editor.getSelection().trim();
      if (selection && this.dictionary.isChinese(selection)) {
        const entries = this.dictionary.get(selection);
        if (entries && entries.length > 0) {
          this.tooltip.copyEntryDirect(
            { word: selection, entries, length: Array.from(selection).length },
            this.settings
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
        this.tooltip.copyEntryDirect(match, this.settings);
        return;
      }
    }
    new Notice("Нет слова для копирования / No active word to copy");
  }

  /**
   * Creates atomic Zettelkasten note for active word
   */
  public async createActiveWordNote(): Promise<void> {
    let word = "";
    let contextSentence: string | undefined = undefined;
    if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord()) {
      word = this.tooltip.getCurrentWord()!;
      contextSentence = this.tooltip.getCurrentContextSentence();
    } else {
      const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (activeView?.editor) {
        word = activeView.editor.getSelection().trim();
        if (!word) {
          const cursor = activeView.editor.getCursor();
          const line = activeView.editor.getLine(cursor.line);
          const match = this.dictionary.findWordAtOffset(
            line,
            cursor.ch,
            this.settings.maxWordLength
          );
          if (match) {
            word = match.word;
            contextSentence = line;
          }
        }
      }
    }

    if (!word) {
      new Notice("Нет активного слова для создания заметки.");
      return;
    }

    const match = this.dictionary.getExact(word);
    if (match) {
      await createWordNote(this.app, match, contextSentence, {
        folderPath: this.settings.wordNotesFolder || "Chinese/Words",
        openAfterCreation: true,
      });
    } else {
      const dummyMatch = {
        word,
        entries: [{
          simplified: word,
          traditional: word,
          pinyin: "",
          definitions: [],
        }],
        length: Array.from(word).length,
      };
      await createWordNote(this.app, dummyMatch, contextSentence, {
        folderPath: this.settings.wordNotesFolder || "Chinese/Words",
        openAfterCreation: true,
      });
    }
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
      await workspace.revealLeaf(leaf);
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
   * Toggle starring of active word (under popover or under cursor)
   */
  public async toggleStarActiveWord(): Promise<void> {
    if (this.tooltip.getIsOpen() && this.tooltip.getCurrentMatch()) {
      const match = this.tooltip.getCurrentMatch()!;
      const context = this.tooltip.getCurrentContextSentence();
      await this.vocabulary.toggleWord(match, context);
      this.tooltip.refresh(this.settings);
      this.refreshVocabularyViews();
      return;
    }

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.editor) {
      const editor = activeView.editor;
      const selection = editor.getSelection().trim();
      if (selection && this.dictionary.isChinese(selection)) {
        const entries = this.dictionary.get(selection);
        if (entries && entries.length > 0) {
          const cursor = editor.getCursor();
          const lineText = editor.getLine(cursor.line);
          const context = this.settings.autoSaveContextSentence
            ? this.extractContextSentence(lineText, cursor.ch)
            : undefined;
          await this.vocabulary.toggleWord(
            { word: selection, entries, length: selection.length },
            context
          );
          this.refreshVocabularyViews();
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
        const context = this.settings.autoSaveContextSentence
          ? this.extractContextSentence(lineText, cursor.ch)
          : undefined;
        await this.vocabulary.toggleWord(match, context);
        this.refreshVocabularyViews();
        return;
      }
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
      if (/\p{Script=Han}/u.test(char)) {
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
}
