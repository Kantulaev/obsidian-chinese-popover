import { Menu, Notice } from "obsidian";
import type ChineseHoverDictPlugin from "./main.ts";
import { DictEntry, MatchResult } from "./dictionary.ts";
import { formatPinyin } from "./pinyin.ts";
import { getCharPinyinFromWordPinyin } from "./pinyin-frequency.ts";
import { ChineseDictSettings, CopyFormat } from "./settings.ts";
import { getHskBadgeInfo } from "./hsk.ts";
import { StrokeOrderModal } from "./stroke-order.ts";
import { resolveChineseFontFamily } from "./font.ts";
import { addNoteToAnki } from "./anki.ts";
import { groupDefinitionsByPos } from "./pos.ts";
import { getRawDefinitionsList } from "./russian-dict.ts";
import { detectPinyinTone, detectJyutpingTone, getToneColor } from "./tones.ts";
import { getCharacterComponents, getCharacterRadical } from "./radicals.ts";
import { ChengyuStory, fetchDynamicChengyuStory, getChengyuStory } from "./chengyu.ts";
import { ExampleSentence, fetchDynamicExamples, getExampleSentences } from "./examples.ts";
import { createWordNote } from "./word-notes.ts";

export interface ContentBounds {
  left: number;
  right: number;
  top?: number;
  bottom?: number;
}

export class DictTooltip {
  private el: HTMLElement;
  private isVisible: boolean = false;
  private isPinned: boolean = false;
  private isDragging: boolean = false;
  private hasCustomPosition: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private dragInitialLeft: number = 0;
  private dragInitialTop: number = 0;
  private currentWord: string | null = null;
  private currentMatch: MatchResult | null = null;
  private currentContextSentence: string | undefined = undefined;
  private currentAudio: HTMLAudioElement | null = null;
  private cleanupActiveDrag: (() => void) | null = null;
  private plugin: ChineseHoverDictPlugin | null = null;
  private burgerFloatingMenu: HTMLElement | null = null;
  private burgerHoverTimer: number | null = null;

  constructor(plugin?: ChineseHoverDictPlugin) {
    this.plugin = plugin ?? null;
    this.el = createDiv({ cls: "ch-dict-tooltip" });

    // Prevent clicking inside the tooltip from bubbling to document and closing it
    this.el.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });

    document.body.appendChild(this.el);
  }

  setPlugin(plugin: ChineseHoverDictPlugin): void {
    this.plugin = plugin;
  }

  getCurrentContextSentence(): string | undefined {
    return this.currentContextSentence;
  }

  /**
   * Applies custom CSS variables, theme classes, and color presets
   */
  applyDynamicStyles(settings: ChineseDictSettings): void {
    const width = settings.popoverWidth || 330;
    const height = settings.popoverHeight || 165;
    const blur = settings.blurIntensity ?? 34;
    const fontFamily = resolveChineseFontFamily(settings.chineseFontFamily, settings.customChineseFont);

    this.el.setCssProps({
      "--ch-dict-width": `${width}px`,
      "--ch-dict-height": `${height}px`,
      "--ch-dict-blur": `${blur}px`,
      "--ch-dict-font-hanzi": `${settings.fontSizeHanzi || 19}px`,
      "--ch-dict-font-pinyin": `${settings.fontSizePinyin || 22}px`,
      "--ch-dict-font-translation": `${settings.fontSizeTranslation || 15}px`,
      "--ch-dict-font-hanzi-family": fontFamily,
    });

    // Reset theme classes
    this.el.removeClass(
      "ch-dict-theme-auto",
      "ch-dict-theme-glass_dark",
      "ch-dict-theme-glass_light",
      "ch-dict-theme-solid"
    );
    this.el.addClass(`ch-dict-theme-${settings.theme || "auto"}`);

    // Reset color classes
    this.el.removeClass(
      "ch-dict-color-white",
      "ch-dict-color-cyan",
      "ch-dict-color-gold",
      "ch-dict-color-obsidian"
    );
    this.el.addClass(`ch-dict-color-${settings.textColorPreset || "white"}`);

    // Resizable class
    if (settings.enableResizablePopover ?? true) {
      this.el.addClass("ch-dict-resizable");
    } else {
      this.el.removeClass("ch-dict-resizable");
    }
  }

  /**
   * Helper to extract deduplicated English definition words from DictEntries
   */
  private extractEnglishDefinitions(entries: DictEntry[]): string[] {
    const words: string[] = [];
    for (const entry of entries) {
      for (const rawDef of entry.definitions) {
        const clean = rawDef
          .replace(/\(CL:[^)]+\)/g, "")
          .replace(/\[[^\]]+\]/g, "")
          .trim();
        if (!clean) continue;
        const parts = clean
          .split(/[,;/]/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
        for (const part of parts) {
          const lower = part.toLowerCase();
          if (!words.some((w) => w.toLowerCase() === lower)) {
            words.push(part);
          }
        }
      }
    }
    return words;
  }

  /**
   * Extracts concise definitions separated by commas (up to maxCount)
   */
  private formatConciseDefinitions(
    entries: DictEntry[],
    maxCount: number = 6,
    word?: string,
    language: "en" | "ru" | "both" = "ru"
  ): string {
    const rawEnglish = this.extractEnglishDefinitions(entries);
    if (!word) {
      return rawEnglish.slice(0, maxCount).join(", ") || "No definition found";
    }

    const rawDefs = getRawDefinitionsList(word, rawEnglish, language, maxCount);
    const allDefs = entries.flatMap((e) => e.definitions);
    const groups = groupDefinitionsByPos(rawDefs, word, allDefs, language, maxCount);

    return groups
      .map((g) => `${g.posLabel ? `[${g.posLabel}] ` : ""}${g.items.join(", ")}`)
      .join("; ") || "Нет перевода / No definition";
  }

  /**
   * Instantly displays the liquid glass popover at the given coordinates,
   * bounded strictly within contentBounds (readable line length margins).
   */
  show(
    match: MatchResult,
    x: number,
    y: number,
    settings: ChineseDictSettings,
    bounds?: ContentBounds,
    contextSentence?: string
  ): void {
    this.currentMatch = match;
    this.currentWord = match.word;
    this.currentContextSentence = contextSentence;

    // Record in Recent Lookups History
    if (this.plugin?.history) {
      void this.plugin.history.add(match);
      this.plugin.refreshVocabularyViews();
    }

    this.applyDynamicStyles(settings);
    this.render(match, settings, contextSentence);
    this.position(x, y, settings, bounds);

    // Make visible and interactive via CSS class
    this.el.addClass("ch-dict-visible");
    this.isVisible = true;

    if (settings.autoPlayAudio) {
      this.playSpeech(match.word, settings);
    }
  }

  /**
   * Re-renders the current match dynamically when settings change
   */
  refresh(settings: ChineseDictSettings): void {
    if (!this.isVisible || !this.currentMatch) return;
    this.applyDynamicStyles(settings);
    this.render(this.currentMatch, settings, this.currentContextSentence);
  }

  /**
   * Instantly hides the tooltip, cancels any audio, and removes pointer-events entirely.
   * If force is false and tooltip is pinned, it stays visible.
   */
  hide(force: boolean = false): void {
    if (!this.isVisible) return;
    if (this.isPinned && !force) {
      return; // Do not dismiss while pinned!
    }

    if (this.cleanupActiveDrag) {
      this.cleanupActiveDrag();
      this.cleanupActiveDrag = null;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (globalThis.speechSynthesis) {
      globalThis.speechSynthesis.cancel();
    }
    this.el.querySelector(".ch-audio-playing")?.removeClass("ch-audio-playing");

    this.el.removeClass("ch-dict-visible");
    this.el.removeClass("ch-dict-pinned");
    this.el.removeClass("ch-dict-expanded-examples");
    if (this.burgerFloatingMenu) {
      this.burgerFloatingMenu.removeClass("is-visible");
      this.burgerFloatingMenu.removeClass("is-open");
    }
    this.isVisible = false;
    this.isPinned = false;
    this.hasCustomPosition = false;
    this.currentWord = null;
    this.currentMatch = null;
  }

  getIsOpen(): boolean {
    return this.isVisible;
  }

  getIsPinned(): boolean {
    return this.isPinned;
  }

  togglePin(): boolean {
    this.isPinned = !this.isPinned;
    if (this.isPinned) {
      this.el.addClass("ch-dict-pinned");
      new Notice("📌 Карточка закреплена (не исчезает при кликах и скролле)");
    } else {
      this.el.removeClass("ch-dict-pinned");
      new Notice("📌 Карточка откреплена");
    }
    return this.isPinned;
  }

  getCurrentWord(): string | null {
    return this.currentWord;
  }

  getCurrentMatch(): MatchResult | null {
    return this.currentMatch;
  }

  /**
   * Copies formatted entry to clipboard (uses setting or specific format)
   */
  copyCurrentEntry(settings: ChineseDictSettings, format?: CopyFormat): void {
    if (!this.currentMatch) return;
    this.copyEntryFormatted(this.currentMatch, settings, format);
  }

  copyEntryDirect(match: MatchResult, settings: ChineseDictSettings): void {
    this.copyEntryFormatted(match, settings, "default");
  }

  copyEntryFormatted(
    match: MatchResult,
    settings: ChineseDictSettings,
    format?: CopyFormat
  ): void {
    const activeFormat = format || settings.copyFormat || "default";
    const firstEntry = match.entries[0];
    const simplified = firstEntry?.simplified || match.word;
    const trads = Array.from(
      new Set(
        match.entries
          .map((e) => e.traditional)
          .filter((t) => t && t !== simplified)
      )
    );

    const pinyinText = formatPinyin(
      match.entries[0]?.pinyin || "",
      settings.showAccentedPinyin
    );
    const jyutping = match.entries[0]?.jyutping || "";

    let phonetics = pinyinText;
    if (settings.phoneticDisplay === "both" && jyutping) {
      phonetics = `${pinyinText} / ${jyutping}`;
    } else if (settings.phoneticDisplay === "jyutping" && jyutping) {
      phonetics = jyutping;
    } else if (settings.phoneticDisplay === "dialect_auto") {
      phonetics =
        settings.dialect === "cantonese" && jyutping
          ? `${pinyinText} / ${jyutping}`
          : pinyinText;
    }

    const defsText = this.formatConciseDefinitions(
      match.entries,
      settings.maxDefinitions,
      match.word,
      settings.translationLanguage
    );

    let textToCopy = "";
    switch (activeFormat) {
      case "hanzi_only":
        textToCopy = simplified;
        break;
      case "pinyin_only":
        textToCopy = `${simplified} ${phonetics}`;
        break;
      case "wikilink":
        textToCopy = `[[${simplified}]]`;
        break;
      case "markdown_table":
        textToCopy = `| ${simplified} | ${phonetics} | ${defsText} |`;
        break;
      case "default":
      default: {
        let wordText = simplified;
        if (settings.showTraditional && trads.length > 0) {
          const sep = settings.traditionalSeparator || " - ";
          wordText =
            sep === " () "
              ? `${simplified} (${trads.join(", ")})`
              : `${simplified}${sep}${trads.join(", ")}`;
        }
        textToCopy = `${wordText} [${phonetics}] ${defsText}`;
        break;
      }
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      new Notice(`Скопировано (${activeFormat}): ${textToCopy}`);
    }).catch(() => {
      new Notice("Не удалось скопировать в буфер обмена");
    });
  }

  /**
   * Builds the DOM content:
   * - Top Pill: Large Simplified on left - Large Traditional on right (same size)
   * - Big Crisp Pinyin Hero: Multi-line wrap, customizable color & font size
   * - Translations: 1-5 readable words comma-separated
   */
  private render(match: MatchResult, settings: ChineseDictSettings, contextSentence?: string): void {
    this.el.empty();

    // Subtle Apple-style drag grabber pill at the top of the card
    const grabber = this.el.createDiv({ cls: "ch-dict-drag-grabber" });
    grabber.setAttribute("title", "Потяните, чтобы переместить карточку / Drag to move");
    this.setupDraggable(grabber, settings);

    const isCantonese = settings.dialect === "cantonese";

    // 1. Top Bar: Clickable Pill with Hanzi and Action buttons
    const topBar = this.el.createDiv({ cls: "ch-dict-top-bar" });
    this.setupDraggable(topBar, settings);

    const pill = topBar.createDiv({
      cls: "ch-dict-pill ch-dict-clickable-word",
      attr: {
        title: isCantonese
          ? `Нажмите, чтобы прослушать на кантонском (廣東話, ${settings.speechSpeed}x)`
          : `Нажмите, чтобы прослушать на путунхуа (普通话, ${settings.speechSpeed}x)`,
      },
    });

    const firstEntry = match.entries[0];
    const simplified = firstEntry?.simplified || match.word;
    const trads = Array.from(
      new Set(
        match.entries
          .map((e) => e.traditional)
          .filter((t) => t && t !== simplified)
      )
    );

    // Left: Simplified characters
    pill.createSpan({ cls: "ch-dict-hanzi", text: simplified });

    // Right: Traditional characters (if enabled and present)
    if (settings.showTraditional && trads.length > 0) {
      const sep = settings.traditionalSeparator || " - ";
      if (sep === " () ") {
        pill.createSpan({ cls: "ch-dict-dash", text: " (" });
        pill.createSpan({
          cls: "ch-dict-hanzi ch-dict-trad-hanzi",
          text: trads.join(", "),
        });
        pill.createSpan({ cls: "ch-dict-dash", text: ")" });
      } else {
        pill.createSpan({ cls: "ch-dict-dash", text: sep });
        pill.createSpan({
          cls: "ch-dict-hanzi ch-dict-trad-hanzi",
          text: trads.join(", "),
        });
      }
    }

    // Clicking the word triggers high quality pronunciation
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      this.playSpeech(match.word, settings);
    });

    // Action buttons: Speaker & Hover Burger Menu
    if (settings.showActionButtons) {
      const actions = topBar.createDiv({ cls: "ch-dict-actions" });

      // Audio TTS Button
      const audioBtn = actions.createEl("button", {
        cls: "ch-dict-glass-btn",
        text: "🔊",
        attr: {
          "aria-label": "Pronounce word",
          title: isCantonese
            ? `Гуандунхуа (zh-yue, ${settings.speechSpeed}x)`
            : `Путунхуа (zh-CN, ${settings.speechSpeed}x)`,
        },
      });
      audioBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.playSpeech(match.word, settings);
      });

      // 2. Burger Action Button
      const burgerWrap = actions.createDiv({ cls: "ch-dict-burger-wrap" });
      const burgerBtn = burgerWrap.createEl("button", {
        cls: "ch-dict-glass-btn ch-dict-burger-btn",
        text: "☰",
        attr: {
          "aria-label": "Actions Menu",
          title: "Действия карточки / Card Actions",
        },
      });

      // Floating menu attached to document.body - completely decoupled from popover scroll container!
      if (!this.burgerFloatingMenu) {
        this.burgerFloatingMenu = document.body.createDiv({
          cls: "ch-dict-burger-floating-menu",
        });
      }
      this.burgerFloatingMenu.empty();

      const updateMenuPos = () => {
        if (!this.burgerFloatingMenu || !burgerBtn.isConnected) return;
        const rect = burgerBtn.getBoundingClientRect();
        const menuHeight = this.burgerFloatingMenu.offsetHeight || 118;
        const winH = globalThis.innerHeight;
        const winW = globalThis.innerWidth;
        // Prioritize upward flip whenever space below is tight (<150px) or would overflow bottom
        const willOverflowBottom = (rect.bottom + menuHeight + 10 > winH) || (winH - rect.bottom < 150);
        let top = willOverflowBottom ? rect.top - menuHeight - 6 : rect.bottom + 6;
        top = Math.max(10, Math.min(top, winH - menuHeight - 10));
        const right = Math.max(10, Math.min(winW - rect.right, winW - 300));

        this.burgerFloatingMenu.setCssStyles({
          top: `${Math.round(top)}px`,
          right: `${Math.round(right)}px`,
        });
      };

      const openMenu = () => {
        if (this.burgerHoverTimer !== null) {
          globalThis.clearTimeout(this.burgerHoverTimer);
          this.burgerHoverTimer = null;
        }
        if (this.burgerFloatingMenu) {
          updateMenuPos();
          this.burgerFloatingMenu.addClass("is-visible");
        }
      };

      const closeMenuWithDelay = () => {
        if (this.burgerHoverTimer !== null) {
          globalThis.clearTimeout(this.burgerHoverTimer);
        }
        this.burgerHoverTimer = globalThis.setTimeout(() => {
          if (this.burgerFloatingMenu) {
            this.burgerFloatingMenu.removeClass("is-visible");
            this.burgerFloatingMenu.removeClass("is-open");
          }
          this.burgerHoverTimer = null;
        }, 350);
      };

      burgerWrap.addEventListener("mouseenter", openMenu);
      burgerWrap.addEventListener("mouseleave", closeMenuWithDelay);
      this.burgerFloatingMenu.addEventListener("mouseenter", openMenu);
      this.burgerFloatingMenu.addEventListener("mouseleave", closeMenuWithDelay);

      burgerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.burgerHoverTimer !== null) {
          globalThis.clearTimeout(this.burgerHoverTimer);
          this.burgerHoverTimer = null;
        }
        if (!this.burgerFloatingMenu) return;
        const willOpen = !this.burgerFloatingMenu.hasClass("is-open");
        if (willOpen) {
          updateMenuPos();
          this.burgerFloatingMenu.addClass("is-open");
          this.burgerFloatingMenu.addClass("is-visible");
        } else {
          this.burgerFloatingMenu.removeClass("is-open");
          this.burgerFloatingMenu.removeClass("is-visible");
        }
      });

      // Helper to open Obsidian context menu on top of popover
      const showCopyFormatMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const menu = new Menu();
        menu.addItem((i) =>
          i.setTitle("📋 Полная карточка (Стандарт)")
           .setIcon("copy")
           .onClick(() => this.copyEntryFormatted(match, settings, "default"))
        );
        menu.addItem((i) =>
          i.setTitle("🀄 Только иероглифы (汉字)")
           .onClick(() => this.copyEntryFormatted(match, settings, "hanzi_only"))
        );
        menu.addItem((i) =>
          i.setTitle("🔤 Иероглиф + Пиньинь (汉字 + Pinyin)")
           .onClick(() => this.copyEntryFormatted(match, settings, "pinyin_only"))
        );
        menu.addItem((i) =>
          i.setTitle("🔗 Вики-ссылка Obsidian ([[Слово]])")
           .onClick(() => this.copyEntryFormatted(match, settings, "wikilink"))
        );
        menu.addItem((i) =>
          i.setTitle("📊 Строка таблицы Markdown (| 汉字 | py | def |)")
           .onClick(() => this.copyEntryFormatted(match, settings, "markdown_table"))
        );
        menu.showAtMouseEvent(e);
      };

      burgerBtn.addEventListener("contextmenu", showCopyFormatMenu);

      // --- Item: Copy ---
      const copyItem = this.burgerFloatingMenu.createEl("button", {
        cls: "ch-dict-menu-item",
        attr: {
          title: "Копировать карточку (Клик - стандарт, Правый клик - выбор формата)",
          "aria-label": "Копировать",
        },
      });
      const copyIcon = copyItem.createSpan({ cls: "ch-dict-menu-icon", text: "📋" });
      const copyLabel = copyItem.createSpan({ cls: "ch-dict-menu-label", text: "Копировать" });

      copyItem.addEventListener("click", (e) => {
        e.stopPropagation();
        this.copyCurrentEntry(settings);
        copyIcon.setText("✓");
        copyLabel.setText("Скопировано!");
        copyItem.addClass("ch-dict-btn-success");
        globalThis.setTimeout(() => {
          copyIcon.setText("📋");
          copyLabel.setText("Копировать");
          copyItem.removeClass("ch-dict-btn-success");
        }, 1200);
      });
      copyItem.addEventListener("contextmenu", showCopyFormatMenu);

      // --- Item: Star (Vocabulary) ---
      const isStarred = this.plugin?.vocabulary?.hasWord(match.word) ?? false;
      const starItem = this.burgerFloatingMenu.createEl("button", {
        cls: "ch-dict-menu-item",
        attr: {
          title: isStarred ? "Удалить из личного словарика" : "Сохранить в личный словарик",
          "aria-label": isStarred ? "Удалить из словарика" : "Сохранить в словарик",
        },
      });
      const starIcon = starItem.createSpan({
        cls: "ch-dict-menu-icon",
        text: isStarred ? "⭐" : "☆",
      });
      const starLabel = starItem.createSpan({
        cls: "ch-dict-menu-label",
        text: isStarred ? "В словарике" : "В словарик",
      });

      starItem.addEventListener("click", (e) => {
        e.stopPropagation();
        void (async () => {
          if (this.plugin?.vocabulary) {
            starIcon.addClass("ch-star-bouncing");
            globalThis.setTimeout(() => starIcon.removeClass("ch-star-bouncing"), 450);
            const nowStarred = await this.plugin.vocabulary.toggleWord(match, contextSentence);
            starIcon.setText(nowStarred ? "⭐" : "☆");
            starLabel.setText(nowStarred ? "В словарике" : "В словарик");
            starItem.setAttribute("title", nowStarred ? "Удалить из личного словарика" : "Сохранить в личный словарик");
            this.plugin.refreshVocabularyViews();

            if (nowStarred && this.plugin.settings.ankiSyncOnStar && this.plugin.settings.anki.enabled) {
              const item = this.plugin.vocabulary.getItem(match.word);
              if (item) {
                const ok = await addNoteToAnki(this.plugin.settings.anki, item);
                if (ok) {
                  new Notice(`Слово "${match.word}" добавлено в Anki!`);
                }
              }
            }
          }
        })();
      });

      // --- Item: Pin / Sticky Mode ---
      const pinItem = this.burgerFloatingMenu.createEl("button", {
        cls: "ch-dict-menu-item",
        attr: {
          title: this.isPinned ? "Открепить карточку" : "Закрепить карточку на экране",
          "aria-label": this.isPinned ? "Открепить карточку" : "Закрепить карточку",
        },
      });
      const pinIcon = pinItem.createSpan({ cls: "ch-dict-menu-icon", text: this.isPinned ? "📍" : "📌" });
      const pinLabel = pinItem.createSpan({
        cls: "ch-dict-menu-label",
        text: this.isPinned ? "Открепить" : "Закрепить",
      });
      pinItem.addEventListener("click", (e) => {
        e.stopPropagation();
        const pinned = this.togglePin();
        pinIcon.setText(pinned ? "📍" : "📌");
        pinLabel.setText(pinned ? "Открепить" : "Закрепить");
        pinItem.setAttribute("title", pinned ? "Открепить карточку" : "Закрепить карточку на экране");
      });

      // --- Item: Word Note (Zettelkasten) ---
      const noteItem = this.burgerFloatingMenu.createEl("button", {
        cls: "ch-dict-menu-item",
        attr: {
          title: "Создать атомную заметку слова (Zettelkasten Note)",
          "aria-label": "Создать заметку слова",
        },
      });
      noteItem.createSpan({ cls: "ch-dict-menu-icon", text: "📝" });
      noteItem.createSpan({ cls: "ch-dict-menu-label", text: "Заметка" });
      noteItem.addEventListener("click", (e) => {
        e.stopPropagation();
        void (async () => {
          if (this.plugin) {
            await createWordNote(this.plugin.app, match, contextSentence, {
              folderPath: settings.wordNotesFolder || "Chinese/Words",
              openAfterCreation: true,
            });
          }
        })();
      });

      // --- Item: Stroke Order Animation ---
      const strokeItem = this.burgerFloatingMenu.createEl("button", {
        cls: "ch-dict-menu-item",
        attr: {
          title: "Порядок черт (Анимация написания)",
          "aria-label": "Порядок черт",
        },
      });
      strokeItem.createSpan({ cls: "ch-dict-menu-icon", text: "🖌️" });
      strokeItem.createSpan({ cls: "ch-dict-menu-label", text: "Черты" });
      strokeItem.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.plugin) {
          new StrokeOrderModal(this.plugin.app, match.word).open();
        }
      });

      // --- Item: Close ---
      const closeItem = this.burgerFloatingMenu.createEl("button", {
        cls: "ch-dict-menu-item ch-dict-menu-item-close",
        attr: {
          title: "Закрыть карточку (Esc)",
          "aria-label": "Закрыть карточку",
        },
      });
      closeItem.createSpan({ cls: "ch-dict-menu-icon", text: "✕" });
      closeItem.createSpan({ cls: "ch-dict-menu-label", text: "Закрыть" });
      closeItem.addEventListener("click", (e) => {
        e.stopPropagation();
        this.hide(true);
      });
    }

    // 2. Phonetics Hero (Pinyin / Jyutping)
    const primaryPinyin = match.entries[0]?.pinyin || "";
    const formattedPinyin = formatPinyin(
      primaryPinyin,
      settings.showAccentedPinyin
    );
    const jyutping = match.entries[0]?.jyutping || "";

    const heroContainer = this.el.createDiv({ cls: "ch-dict-pinyin-hero" });

    // Determine what to display based on phoneticDisplay setting
    const mode = settings.phoneticDisplay || "pinyin";
    let showBoth = false;
    let showJyutpingOnly = false;

    if (mode === "both") {
      showBoth = Boolean(jyutping);
    } else if (mode === "jyutping") {
      showJyutpingOnly = Boolean(jyutping);
    } else if (mode === "dialect_auto") {
      if (isCantonese && jyutping) {
        showBoth = true;
      }
    }

    const renderColoredSyllables = (container: HTMLElement, text: string, type: "pinyin" | "jyutping") => {
      const span = container.createSpan({
        cls: type === "pinyin" ? "ch-dict-pinyin-part" : "ch-dict-jyutping-part",
      });
      if (settings.toneColoring === "off") {
        span.setText(text);
        return;
      }
      const syllables = text.split(/\s+/).filter(Boolean);
      syllables.forEach((syl, idx) => {
        if (idx > 0) span.createSpan({ text: " " });
        const tone = type === "pinyin" ? detectPinyinTone(syl) : detectJyutpingTone(syl);
        const s = span.createSpan({ text: syl, cls: `ch-tone-${tone}` });
        s.setCssStyles({ color: getToneColor(tone) });
      });
    };

    if (showBoth) {
      renderColoredSyllables(heroContainer, formattedPinyin, "pinyin");
      heroContainer.createSpan({
        cls: "ch-dict-pinyin-slash",
        text: " / ",
      });
      renderColoredSyllables(heroContainer, jyutping, "jyutping");
      heroContainer.setAttribute(
        "title",
        `${formattedPinyin} / ${jyutping}`
      );
    } else if (showJyutpingOnly) {
      renderColoredSyllables(heroContainer, jyutping, "jyutping");
      heroContainer.setAttribute("title", jyutping);
    } else {
      renderColoredSyllables(heroContainer, formattedPinyin, "pinyin");
      heroContainer.setAttribute("title", formattedPinyin);
    }

    // 3. Rich Structured Translation (5-6 main meanings divided by Parts of Speech)
    const rawEnglishDefs = this.extractEnglishDefinitions(match.entries);
    const rawDefs = getRawDefinitionsList(
      match.word,
      rawEnglishDefs,
      settings.translationLanguage || "ru",
      settings.maxDefinitions || 6
    );
    const allDefs = match.entries.flatMap((e) => e.definitions);
    const posGroups = groupDefinitionsByPos(
      rawDefs,
      match.word,
      allDefs,
      settings.translationLanguage || "ru",
      settings.maxDefinitions || 6
    );

    const defsContainer = this.el.createDiv({ cls: "ch-dict-defs-container" });
    const fullTranslationPlain = posGroups
      .map((g) => `${g.posLabel ? `[${g.posLabel}] ` : ""}${g.items.join(", ")}`)
      .join("; ");
    defsContainer.setAttribute("title", fullTranslationPlain);

    let globalItemIndex = 1;
    for (const group of posGroups) {
      const groupEl = defsContainer.createDiv({ cls: "ch-dict-def-group" });
      if (group.posLabel) {
        groupEl.createSpan({
          cls: `ch-dict-pos-tag ${group.posClass}`,
          text: group.posLabel,
          attr: { title: `Часть речи: ${group.pos}` },
        });
      }

      const itemsEl = groupEl.createDiv({ cls: "ch-dict-def-items" });
      group.items.forEach((item, idx) => {
        const itemSpan = itemsEl.createSpan({ cls: "ch-dict-def-item" });
        itemSpan.createSpan({
          cls: "ch-dict-def-num",
          text: `${globalItemIndex++}.`,
        });
        itemSpan.createSpan({
          cls: "ch-dict-def-text",
          text: item,
        });
        if (idx < group.items.length - 1) {
          itemsEl.createSpan({ cls: "ch-dict-def-sep", text: "•" });
        }
      });
    }

    // Metadata / Action Row under translation: HSK Level on left, Examples Toggle Button on right
    const bottomRow = this.el.createDiv({ cls: "ch-dict-bottom-row" });
    const hsk = getHskBadgeInfo(match.word);
    if (hsk) {
      const metaRow = bottomRow.createDiv({ cls: "ch-dict-meta-row" });
      metaRow.createSpan({
        cls: "ch-dict-meta-item ch-dict-meta-hsk",
        text: hsk.label,
        attr: { title: `Официальный уровень: ${hsk.label}` },
      });
    } else {
      bottomRow.createDiv({ cls: "ch-dict-bottom-spacer" });
    }

    // Small On-Demand Examples Button in bottom-right corner
    let exampleDrawer: HTMLElement | null = null;
    const exToggleBtn = bottomRow.createEl("button", {
      cls: "ch-dict-ex-toggle-btn",
      attr: {
        title: "Показать/скрыть 1-2 примера предложений (расширяет карточку)",
        "aria-label": "Примеры предложений",
      },
    });
    exToggleBtn.createSpan({ cls: "ch-dict-ex-btn-icon", text: "💬" });
    exToggleBtn.createSpan({ cls: "ch-dict-ex-btn-label", text: "Примеры" });

    exToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (exampleDrawer) {
        // Collapse drawer
        exampleDrawer.remove();
        exampleDrawer = null;
        exToggleBtn.removeClass("is-active");
        this.el.removeClass("ch-dict-expanded-examples");
        this.adjustPopoverBoundsAfterExpand();
        return;
      }

      // Expand popover adaptively & show drawer
      exToggleBtn.addClass("is-active");
      this.el.addClass("ch-dict-expanded-examples");

      exampleDrawer = createDiv({ cls: "ch-dict-example-drawer" });
      bottomRow.after(exampleDrawer);

      const exHeader = exampleDrawer.createDiv({ cls: "ch-dict-drawer-header" });
      exHeader.createSpan({ cls: "ch-dict-drawer-tag", text: "例句 Примеры" });

      const isRu = settings.translationLanguage !== "en";
      const localExamples = getExampleSentences(match.word);

      if (localExamples && localExamples.length > 0) {
        this.renderExamplesIntoDrawer(exampleDrawer, localExamples.slice(0, 2), settings, isRu);
        this.adjustPopoverBoundsAfterExpand();
      } else {
        const loadingEl = exampleDrawer.createDiv({
          cls: "ch-dict-drawer-loading",
          text: isRu ? "Поиск аутентичных примеров..." : "Fetching authentic examples...",
        });
        this.adjustPopoverBoundsAfterExpand();

        const wordAtFetch = match.word;
        const targetLang = isRu ? "rus" : "eng";
        fetchDynamicExamples(match.word, targetLang).then((fetched) => {
          if (!this.isVisible || this.currentWord !== wordAtFetch || !exampleDrawer || !exampleDrawer.isConnected) {
            return;
          }
          loadingEl.remove();
          if (fetched && fetched.length > 0) {
            this.renderExamplesIntoDrawer(exampleDrawer, fetched.slice(0, 2), settings, isRu);
          } else {
            exampleDrawer.createDiv({
              cls: "ch-dict-drawer-empty",
              text: isRu ? "Примеры для этого слова не найдены" : "No examples found for this word",
            });
          }
          this.adjustPopoverBoundsAfterExpand();
        }).catch(() => {
          if (exampleDrawer && exampleDrawer.isConnected) {
            loadingEl.setText(isRu ? "Не удалось загрузить примеры" : "Could not load examples");
            this.adjustPopoverBoundsAfterExpand();
          }
        });
      }
    });

    // 4. Character Breakdown (for compound words >= 2 chars)
    if (settings.showCharacterBreakdown) {
      const chars = Array.from(match.word).filter((c) => /\p{Script=Han}/u.test(c));
      if (chars.length >= 2) {
        const decompRow = this.el.createDiv({ cls: "ch-dict-decomp-row" });
        let activeChar: string | null = null;
        let decompDrawer: HTMLElement | null = null;
        const chipElements = new Map<string, HTMLElement>();

        const renderDecompDrawer = (targetChar: string) => {
          if (decompDrawer) {
            decompDrawer.remove();
            decompDrawer = null;
          }

          if (activeChar === targetChar) {
            // Clicking same character collapses drawer
            activeChar = null;
            chipElements.forEach((el) => el.removeClass("is-active"));
            this.adjustPopoverBoundsAfterExpand();
            return;
          }

          activeChar = targetChar;
          chipElements.forEach((el, c) => {
            if (c === targetChar) {
              el.addClass("is-active");
            } else {
              el.removeClass("is-active");
            }
          });

          const contextPy = match.entries[0]?.pinyin
            ? getCharPinyinFromWordPinyin(match.word, match.entries[0].pinyin, targetChar)
            : undefined;
          const charEntries = this.plugin?.dictionary?.get(targetChar, contextPy);
          const py = charEntries && charEntries[0] ? formatPinyin(charEntries[0].pinyin, true) : "";
          const jp = charEntries && charEntries[0]?.jyutping;
          const phon = isCantonese && jp ? jp : py;
          const isRu = settings.translationLanguage !== "en";
          const def = charEntries ? this.formatConciseDefinitions(charEntries, 2, targetChar, settings.translationLanguage || "en") : "";

          const radInfo = getCharacterRadical(targetChar);
          const comps = getCharacterComponents(targetChar);

          decompDrawer = this.el.createDiv({ cls: "ch-dict-decomp-drawer" });
          decompRow.after(decompDrawer);

          // Drawer Header: Char + Phonetic + Def + Audio Button
          const header = decompDrawer.createDiv({ cls: "ch-dict-decomp-drawer-header" });
          const left = header.createDiv({ cls: "ch-dict-decomp-drawer-left" });
          left.createSpan({ cls: "ch-dict-decomp-drawer-char", text: targetChar });
          if (phon) {
            left.createSpan({ cls: "ch-dict-decomp-drawer-phon", text: `[${phon}]` });
          }
          if (def) {
            left.createSpan({ cls: "ch-dict-decomp-drawer-def", text: def });
          }

          const audioBtn = header.createEl("button", {
            cls: "ch-dict-decomp-drawer-audio",
            text: "🔊",
            attr: {
              title: `Озвучить ${targetChar}`,
              "aria-label": `Озвучить ${targetChar}`,
            },
          });
          audioBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.playSpeech(targetChar, settings);
          });

          // Drawer Detail (Radical & Anatomy/Components)
          const detail = decompDrawer.createDiv({ cls: "ch-dict-decomp-drawer-detail" });

          if (radInfo) {
            const radMeaning = isRu ? radInfo.meaningRu : radInfo.meaningEn;
            const radLine = detail.createDiv({ cls: "ch-dict-decomp-detail-line" });
            radLine.createSpan({
              cls: "ch-dict-decomp-detail-label",
              text: isRu ? "Ключ:" : "Radical:",
            });
            radLine.createSpan({
              text: `#${radInfo.number} «${radInfo.radical}» [${radInfo.pinyin}] — ${radMeaning} (${radInfo.strokeCount} ${isRu ? "черт" : "strokes"})`,
            });
          }

          if (comps && comps.length > 0) {
            const compLine = detail.createDiv({ cls: "ch-dict-decomp-detail-line" });
            compLine.createSpan({
              cls: "ch-dict-decomp-detail-label",
              text: isRu ? "Состав:" : "Components:",
            });
            compLine.createSpan({ text: comps.join(" + ") });
          } else if (!radInfo) {
            const basicLine = detail.createDiv({ cls: "ch-dict-decomp-detail-line" });
            basicLine.createSpan({
              text: isRu ? "Базовый неделимый иероглиф" : "Basic ideogram / pictogram",
            });
          }
          this.adjustPopoverBoundsAfterExpand();
        };

        for (const char of chars) {
          const charEntries = this.plugin?.dictionary?.get(char);
          if (charEntries && charEntries.length > 0) {
            const py = formatPinyin(charEntries[0].pinyin, true);
            const jp = charEntries[0].jyutping;
            const phon = isCantonese && jp ? jp : py;
            const def = this.formatConciseDefinitions(
              charEntries,
              1,
              char,
              settings.translationLanguage || "en"
            );

            const radInfo = getCharacterRadical(char);
            const comps = getCharacterComponents(char);
            let tooltipText = `${char} [${py}${jp ? ` / ${jp}` : ""}] ${def}`;
            if (radInfo) {
              const radMeaning = settings.translationLanguage === "ru" ? radInfo.meaningRu : radInfo.meaningEn;
              tooltipText += `\nКлюч #${radInfo.number}: ${radInfo.radical} (${radInfo.pinyin}, ${radMeaning})`;
            }
            if (comps && comps.length > 0) {
              tooltipText += `\nСостав: ${comps.join(" + ")}`;
            }
            tooltipText += `\nНажмите, чтобы раскрыть строение и состав`;

            const chip = decompRow.createDiv({
              cls: "ch-dict-decomp-chip",
              attr: {
                title: tooltipText,
                "aria-label": `${char}: строение и состав`,
              },
            });
            chipElements.set(char, chip);

            chip.createSpan({ cls: "ch-dict-decomp-char", text: char });
            chip.createSpan({ cls: "ch-dict-decomp-phon", text: phon });
            chip.createSpan({ cls: "ch-dict-decomp-def", text: def });
            if (radInfo && settings.showRadicals) {
              chip.createSpan({
                cls: "ch-dict-decomp-rad",
                text: radInfo.radical,
                attr: { title: `Ключ: ${radInfo.radical} (${radInfo.meaningRu})` },
              });
            }

            chip.addEventListener("click", (e) => {
              e.stopPropagation();
              renderDecompDrawer(char);
            });
          }
        }
      }
    }

    // 5. Chengyu Origin Story Drawer
    if (settings.showChengyuStories && Array.from(match.word).length === 4) {
      const renderChengyuDrawer = (chengyu: ChengyuStory) => {
        if (!chengyu || this.el.querySelector(".ch-dict-chengyu-drawer")) return;
        const storyEl = this.el.createDiv({ cls: "ch-dict-chengyu-drawer" });
        const header = storyEl.createDiv({ cls: "ch-dict-drawer-header" });
        header.createSpan({ cls: "ch-dict-drawer-tag", text: "成语故事 Притча" });
        if (chengyu.dynasty) {
          header.createSpan({ cls: "ch-dict-drawer-dynasty", text: chengyu.dynasty });
        }

        const storyBody = storyEl.createDiv({ cls: "ch-dict-drawer-body" });
        const isRu = settings.translationLanguage !== "en";
        storyBody.createDiv({
          cls: "ch-dict-chengyu-lit",
          text: `«${chengyu.literal}» — ${chengyu.figurative}`,
        });
        storyBody.createDiv({
          cls: "ch-dict-chengyu-story",
          text: isRu ? chengyu.storyRu : chengyu.storyEn,
        });
        this.adjustPopoverBoundsAfterExpand();
      };

      const localStory = getChengyuStory(match.word);
      if (localStory) {
        renderChengyuDrawer(localStory);
      } else {
        const wordAtFetch = match.word;
        fetchDynamicChengyuStory(match.word).then((story) => {
          if (this.isVisible && this.currentWord === wordAtFetch && story) {
            renderChengyuDrawer(story);
          }
        }).catch(() => {});
      }
    }
  }

  /**
   * Renders 1-2 example sentences into the on-demand example drawer
   */
  private renderExamplesIntoDrawer(
    drawer: HTMLElement,
    sentences: ExampleSentence[],
    settings: ChineseDictSettings,
    isRu: boolean
  ): void {
    for (const ex of sentences) {
      const row = drawer.createDiv({ cls: "ch-dict-example-row" });
      const zhSpan = row.createSpan({
        cls: "ch-dict-ex-zh",
        text: ex.chinese,
        attr: { title: "Нажмите, чтобы прослушать пример" },
      });
      zhSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        this.playSpeech(ex.chinese, settings);
      });
      if (ex.pinyin) {
        row.createDiv({ cls: "ch-dict-ex-py", text: ex.pinyin });
      }
      const trText = isRu ? (ex.russian || ex.english) : (ex.english || ex.russian);
      if (trText) {
        row.createDiv({ cls: "ch-dict-ex-tr", text: trText });
      }
    }
  }

  /**
   * Intelligently recalculates and adjusts tooltip position after dynamic content
   * (e.g. Example sentences drawer or Character Decomposition) expands or collapses.
   * Expands in all 4 directions (down/up, right/left) smoothly depending on available space.
   */
  public adjustPopoverBoundsAfterExpand(): void {
    if (!this.isVisible) return;

    globalThis.requestAnimationFrame(() => {
      if (!this.isVisible || !this.el.isConnected) return;
      const rect = this.el.getBoundingClientRect();
      const winW = globalThis.innerWidth;
      const winH = globalThis.innerHeight;
      const padding = 12;

      let currentTop = rect.top;
      let currentLeft = rect.left;

      // Vertical adjustment (Up/Down)
      if (rect.bottom > winH - padding) {
        const overflow = rect.bottom - (winH - padding);
        currentTop = Math.max(padding, currentTop - overflow);
      }
      if (currentTop < padding) {
        currentTop = padding;
      }

      // Horizontal adjustment (Left/Right)
      if (rect.right > winW - padding) {
        const overflow = rect.right - (winW - padding);
        currentLeft = Math.max(padding, currentLeft - overflow);
      }
      if (currentLeft < padding) {
        currentLeft = padding;
      }

      this.el.setCssStyles({
        top: `${Math.round(currentTop)}px`,
        left: `${Math.round(currentLeft)}px`,
      });

      // Keep floating action menu attached to burger button if menu is visible
      if (this.burgerFloatingMenu && this.burgerFloatingMenu.hasClass("is-visible")) {
        const burgerBtn = this.el.querySelector(".ch-dict-burger-btn");
        if (burgerBtn) {
          const btnRect = burgerBtn.getBoundingClientRect();
          const menuHeight = this.burgerFloatingMenu.offsetHeight || 118;
          const willOverflowBottom = (btnRect.bottom + menuHeight + 10 > winH) || (winH - btnRect.bottom < 150);
          let top = willOverflowBottom ? btnRect.top - menuHeight - 6 : btnRect.bottom + 6;
          top = Math.max(10, Math.min(top, winH - menuHeight - 10));
          const right = Math.max(10, Math.min(winW - btnRect.right, winW - 300));
          this.burgerFloatingMenu.setCssStyles({
            top: `${Math.round(top)}px`,
            right: `${Math.round(right)}px`,
          });
        }
      }
    });
  }

  /**
   * Plays high quality native audio:
   * - Cantonese (Google 'yue' native Hong Kong neural voice)
   * - Mandarin (Google 'zh-CN' native Putonghua neural voice)
   * or Web Speech API (offline)
   */
  public playSpeech(text: string, settings: ChineseDictSettings): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (globalThis.speechSynthesis) {
      globalThis.speechSynthesis.cancel();
    }
    this.el.querySelector(".ch-audio-playing")?.removeClass("ch-audio-playing");

    const isCantonese = settings.dialect === "cantonese";
    const speed = settings.speechSpeed || 0.8;

    if (settings.audioEngine === "web_speech") {
      this.fallbackSpeechSynthesis(text, isCantonese ? "zh-HK" : "zh-CN", speed);
      return;
    }

    // Google HD Neural Online Engine: 'yue' for Cantonese HK, 'zh-CN' for Mandarin
    const langCode = isCantonese ? "yue" : "zh-CN";
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(
      text
    )}`;

    const audioBtn = this.el.querySelector(".ch-dict-actions button:first-child");
    if (audioBtn) {
      audioBtn.addClass("ch-audio-playing");
    }
    const stopAudioAnim = () => {
      audioBtn?.removeClass("ch-audio-playing");
    };

    try {
      const audio = new Audio(url);
      audio.playbackRate = speed;
      this.currentAudio = audio;
      audio.onended = stopAudioAnim;
      audio.onerror = stopAudioAnim;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          stopAudioAnim();
          console.warn("[Chinese Dict] Online audio failed, using offline TTS fallback:", err);
          this.fallbackSpeechSynthesis(text, isCantonese ? "zh-HK" : "zh-CN", speed);
        });
      }
    } catch {
      stopAudioAnim();
      this.fallbackSpeechSynthesis(text, isCantonese ? "zh-HK" : "zh-CN", speed);
    }
  }

  /**
   * Offline fallback to browser Web Speech API
   */
  private fallbackSpeechSynthesis(
    text: string,
    langCode: string,
    speed: number
  ): void {
    if (!globalThis.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = speed;

    const audioBtn = this.el.querySelector(".ch-dict-actions button:first-child");
    if (audioBtn) {
      audioBtn.addClass("ch-audio-playing");
    }
    const stopAudioAnim = () => {
      audioBtn?.removeClass("ch-audio-playing");
    };
    utterance.onend = stopAudioAnim;
    utterance.onerror = stopAudioAnim;

    if (langCode === "zh-HK") {
      const voices = globalThis.speechSynthesis.getVoices();
      const cantoneseVoice = voices.find(
        (v) =>
          v.lang === "zh-HK" ||
          v.lang === "zh-YUE" ||
          v.lang.startsWith("yue") ||
          v.name.toLowerCase().includes("cantonese") ||
          v.name.toLowerCase().includes("hong kong")
      );
      if (cantoneseVoice) {
        utterance.voice = cantoneseVoice;
      }
    }

    globalThis.speechSynthesis.speak(utterance);
  }

  /**
   * Automatically discovers the readable text bounds of the currently active note in Obsidian.
   */
  public findActiveContentBounds(): ContentBounds | undefined {
    const leaf =
      document.querySelector(".workspace-leaf.mod-active") || document;

    // 1. Look for sizers (CodeMirror 6 .cm-sizer or Reading view .markdown-preview-sizer)
    const sizer = leaf.querySelector(
      ".cm-sizer, .markdown-preview-sizer"
    );

    if (sizer instanceof HTMLElement) {
      const rect = sizer.getBoundingClientRect();
      if (rect.width > 100) {
        const style = globalThis.getComputedStyle(sizer);
        const padLeft = parseFloat(style.paddingLeft) || 0;
        const padRight = parseFloat(style.paddingRight) || 0;
        return {
          left: rect.left + padLeft,
          right: rect.right - padRight,
          top: rect.top,
          bottom: rect.bottom,
        };
      }
    }

    // 2. Look for active line or paragraph
    const textEl = leaf.querySelector(
      ".cm-line, .markdown-preview-section p, .markdown-rendered p"
    );

    if (textEl) {
      const rect = textEl.getBoundingClientRect();
      if (rect.width > 100) {
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      }
    }

    return undefined;
  }

  /**
   * Positions the popover box near coordinates (x, y) with customizable dimensions.
   * Restricts horizontal position strictly inside bounds (readable line length column),
   * never bleeding out into the left or right side margins of Obsidian.
   */
  private position(
    x: number,
    y: number,
    settings: ChineseDictSettings,
    bounds?: ContentBounds
  ): void {
    if (this.hasCustomPosition && this.isPinned) {
      return;
    }

    const width = settings.popoverWidth || 330;
    const height = settings.popoverHeight || 165;
    const padding = 10;
    const offsetDistance = 14;

    const windowWidth = globalThis.innerWidth;
    const windowHeight = globalThis.innerHeight;

    // If caller didn't pass bounds, or passed full-screen bounds, auto-detect readable bounds
    if (!bounds || bounds.right - bounds.left >= windowWidth - 40) {
      const detected = this.findActiveContentBounds();
      if (detected) {
        bounds = detected;
      }
    }

    // Start centered horizontally on cursor x
    let left = x - width / 2;

    // Strictly enforce bounds within the Obsidian readable text column
    if (bounds) {
      const colWidth = bounds.right - bounds.left;
      if (colWidth >= width) {
        // Popover fits inside text column: strictly clamp to column edges
        if (left < bounds.left) {
          left = bounds.left;
        } else if (left + width > bounds.right) {
          left = bounds.right - width;
        }
      } else {
        // Narrow column: center horizontally on the text column
        left = bounds.left + (colWidth - width) / 2;
      }
    } else {
      // Fallback: clamp within viewport
      if (left + width + padding > windowWidth) {
        left = windowWidth - width - padding;
      }
      if (left < padding) {
        left = padding;
      }
    }

    // Absolute screen safety guard: never go off-screen
    if (left + width + padding > windowWidth) {
      left = windowWidth - width - padding;
    }
    if (left < padding) {
      left = padding;
    }

    // Vertical placement: default below cursor, flip above if overflowing bottom
    let top = y + offsetDistance;
    if (top + height + padding > windowHeight) {
      top = y - height - offsetDistance;
    }
    if (top < padding) {
      top = padding;
    }

    this.el.setCssStyles({
      left: `${Math.round(left)}px`,
      top: `${Math.round(top)}px`,
    });
  }

  /**
   * Cleans up DOM element on plugin unload
   */
  destroy(): void {
    if (this.cleanupActiveDrag) {
      this.cleanupActiveDrag();
      this.cleanupActiveDrag = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (globalThis.speechSynthesis) {
      globalThis.speechSynthesis.cancel();
    }
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    if (this.burgerFloatingMenu && this.burgerFloatingMenu.parentNode) {
      this.burgerFloatingMenu.parentNode.removeChild(this.burgerFloatingMenu);
      this.burgerFloatingMenu = null;
    }
  }

  private setupDraggable(topBar: HTMLElement, settings: ChineseDictSettings): void {
    if (settings.enableDraggablePopover === false) return;

    topBar.addClass("ch-dict-drag-handle");

    topBar.addEventListener("pointerdown", (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, .ch-dict-clickable-word, a, input, textarea")) {
        return;
      }

      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;

      const rect = this.el.getBoundingClientRect();
      this.dragInitialLeft = rect.left;
      this.dragInitialTop = rect.top;

      this.el.addClass("ch-dict-is-dragging");

      const onPointerMove = (moveEv: PointerEvent) => {
        if (!this.isDragging) return;
        const dx = moveEv.clientX - this.dragStartX;
        const dy = moveEv.clientY - this.dragStartY;

        const maxLeft = Math.max(10, globalThis.innerWidth - this.el.offsetWidth - 10);
        const maxTop = Math.max(10, globalThis.innerHeight - this.el.offsetHeight - 10);

        const nextLeft = Math.max(10, Math.min(maxLeft, this.dragInitialLeft + dx));
        const nextTop = Math.max(10, Math.min(maxTop, this.dragInitialTop + dy));

        this.el.setCssStyles({
          left: `${Math.round(nextLeft)}px`,
          top: `${Math.round(nextTop)}px`,
        });
        this.hasCustomPosition = true;

        if (this.burgerFloatingMenu && this.burgerFloatingMenu.hasClass("is-visible")) {
          const burgerBtn = this.el.querySelector(".ch-dict-burger-btn");
          if (burgerBtn) {
            const rect = burgerBtn.getBoundingClientRect();
            const menuHeight = this.burgerFloatingMenu.offsetHeight || 118;
            const winH = globalThis.innerHeight;
            const winW = globalThis.innerWidth;
            const willOverflowBottom = (rect.bottom + menuHeight + 10 > winH) || (winH - rect.bottom < 150);
            let topPos = willOverflowBottom ? rect.top - menuHeight - 6 : rect.bottom + 6;
            topPos = Math.max(10, Math.min(topPos, winH - menuHeight - 10));
            const rightPos = Math.max(10, Math.min(winW - rect.right, winW - 300));
            this.burgerFloatingMenu.setCssStyles({
              top: `${Math.round(topPos)}px`,
              right: `${Math.round(rightPos)}px`,
            });
          }
        }
      };

      const onPointerUp = () => {
        this.isDragging = false;
        this.el.removeClass("ch-dict-is-dragging");
        globalThis.removeEventListener("pointermove", onPointerMove);
        globalThis.removeEventListener("pointerup", onPointerUp);
        this.cleanupActiveDrag = null;
      };

      this.cleanupActiveDrag = onPointerUp;

      globalThis.addEventListener("pointermove", onPointerMove);
      globalThis.addEventListener("pointerup", onPointerUp);
    });
  }
}
