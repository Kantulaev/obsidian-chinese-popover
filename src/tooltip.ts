import { Menu, Notice } from "obsidian";
import type ChineseHoverDictPlugin from "./main.ts";
import { DictEntry, MatchResult } from "./dictionary.ts";
import { formatPinyin } from "./pinyin.ts";
import { ChineseDictSettings, CopyFormat } from "./settings.ts";
import { getHskBadgeInfo } from "./hsk.ts";
import { StrokeOrderModal } from "./stroke-order.ts";
import { resolveChineseFontFamily } from "./font.ts";
import { addNoteToAnki } from "./anki.ts";
import { formatPosBadge, inferPartsOfSpeech } from "./pos.ts";
import { formatLocalizedDefinitions } from "./russian-dict.ts";
import { colorizePinyin, detectPinyinTone, detectJyutpingTone, getToneColor } from "./tones.ts";
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
   * Extracts concise definitions separated by commas (up to maxCount)
   */
  private formatConciseDefinitions(
    entries: DictEntry[],
    maxCount: number = 3,
    word?: string,
    language: "en" | "ru" | "both" = "en"
  ): string {
    const words: string[] = [];

    for (const entry of entries) {
      for (const rawDef of entry.definitions) {
        // Strip out classifiers and bracketed notes
        const clean = rawDef
          .replace(/\(CL:[^)]+\)/g, "")
          .replace(/\[[^\]]+\]/g, "")
          .trim();

        if (!clean) continue;

        // Split by semicolon, comma or slash
        const parts = clean
          .split(/[,;/]/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        for (const part of parts) {
          const lower = part.toLowerCase();
          if (!words.some((w) => w.toLowerCase() === lower)) {
            words.push(part);
          }
          if (words.length >= maxCount) break;
        }
        if (words.length >= maxCount) break;
      }
      if (words.length >= maxCount) break;
    }

    if (word && language !== "en") {
      return formatLocalizedDefinitions(word, words, language, maxCount);
    }

    if (words.length === 0) {
      return "No definition found";
    }

    return words.slice(0, maxCount).join(", ");
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
      this.plugin.history.add(match);
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
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.el.querySelector(".ch-audio-playing")?.removeClass("ch-audio-playing");

    this.el.removeClass("ch-dict-visible");
    this.el.removeClass("ch-dict-pinned");
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

      // 2. Burger Action Menu (reveals on hover and click)
      const burgerWrap = actions.createDiv({ cls: "ch-dict-burger-wrap" });
      const burgerBtn = burgerWrap.createEl("button", {
        cls: "ch-dict-glass-btn ch-dict-burger-btn",
        text: "☰",
        attr: {
          "aria-label": "Actions Menu",
          title: "Действия карточки (наведите или нажмите) / Card Actions",
        },
      });

      const burgerMenu = burgerWrap.createDiv({ cls: "ch-dict-burger-menu" });

      // Click toggles menu
      burgerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        burgerMenu.toggleClass("is-open", !burgerMenu.hasClass("is-open"));
      });
      burgerWrap.addEventListener("mouseleave", () => {
        burgerMenu.removeClass("is-open");
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
      const copyItem = burgerMenu.createEl("button", {
        cls: "ch-dict-burger-item ch-dict-burger-copy",
        attr: {
          title: "Копировать (Клик - стандарт, Правый клик - выбор формата)",
          "aria-label": "Копировать",
        },
      });
      const copyIcon = copyItem.createSpan({ cls: "ch-dict-burger-icon", text: "📋" });
      const copyLabel = copyItem.createSpan({ cls: "ch-dict-burger-label", text: "Копировать" });

      copyItem.addEventListener("click", (e) => {
        e.stopPropagation();
        this.copyCurrentEntry(settings);
        copyIcon.setText("✓");
        copyLabel.setText("Скопировано!");
        copyItem.addClass("ch-dict-btn-success");
        window.setTimeout(() => {
          copyIcon.setText("📋");
          copyLabel.setText("Копировать");
          copyItem.removeClass("ch-dict-btn-success");
        }, 1200);
      });
      copyItem.addEventListener("contextmenu", showCopyFormatMenu);

      // --- Item: Star (Vocabulary) ---
      const isStarred = this.plugin?.vocabulary?.hasWord(match.word) ?? false;
      const starItem = burgerMenu.createEl("button", {
        cls: "ch-dict-burger-item ch-dict-burger-star",
        attr: {
          title: isStarred ? "Удалить из личного словарика" : "Сохранить в личный словарик",
          "aria-label": isStarred ? "Удалить из словарика" : "Сохранить в словарик",
        },
      });
      const starIcon = starItem.createSpan({
        cls: "ch-dict-burger-icon",
        text: isStarred ? "⭐" : "☆",
      });
      const starLabel = starItem.createSpan({
        cls: "ch-dict-burger-label",
        text: isStarred ? "В словарике" : "В словарик",
      });

      starItem.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (this.plugin?.vocabulary) {
          starIcon.addClass("ch-star-bouncing");
          window.setTimeout(() => starIcon.removeClass("ch-star-bouncing"), 450);
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
      });

      // --- Item: Pin / Sticky Mode ---
      const pinItem = burgerMenu.createEl("button", {
        cls: "ch-dict-burger-item ch-dict-burger-pin",
        attr: {
          title: this.isPinned ? "Открепить карточку" : "Закрепить карточку на экране",
          "aria-label": this.isPinned ? "Открепить карточку" : "Закрепить карточку",
        },
      });
      const pinIcon = pinItem.createSpan({ cls: "ch-dict-burger-icon", text: "📌" });
      const pinLabel = pinItem.createSpan({
        cls: "ch-dict-burger-label",
        text: this.isPinned ? "Открепить" : "Закрепить",
      });
      pinItem.addEventListener("click", (e) => {
        e.stopPropagation();
        const pinned = this.togglePin();
        pinLabel.setText(pinned ? "Открепить" : "Закрепить");
        pinItem.setAttribute("title", pinned ? "Открепить карточку" : "Закрепить карточку на экране");
        pinItem.setAttribute("aria-label", pinned ? "Открепить карточку" : "Закрепить карточку");
      });

      // --- Item: Word Note (Zettelkasten) ---
      const noteItem = burgerMenu.createEl("button", {
        cls: "ch-dict-burger-item ch-dict-burger-note",
        attr: {
          title: "Создать атомную заметку слова (Zettelkasten Note)",
          "aria-label": "Создать заметку слова",
        },
      });
      noteItem.createSpan({ cls: "ch-dict-burger-icon", text: "📝" });
      noteItem.createSpan({ cls: "ch-dict-burger-label", text: "Заметка слова" });
      noteItem.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (this.plugin) {
          await createWordNote(this.plugin.app, match, contextSentence, {
            folderPath: settings.wordNotesFolder || "Chinese/Words",
            openAfterCreation: true,
          });
        }
      });

      // --- Item: Stroke Order Animation ---
      const strokeItem = burgerMenu.createEl("button", {
        cls: "ch-dict-burger-item ch-dict-burger-stroke",
        attr: {
          title: "Порядок черт (Анимация написания)",
          "aria-label": "Порядок черт",
        },
      });
      strokeItem.createSpan({ cls: "ch-dict-burger-icon", text: "🖌️" });
      strokeItem.createSpan({ cls: "ch-dict-burger-label", text: "Порядок черт" });
      strokeItem.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.plugin) {
          new StrokeOrderModal(this.plugin.app, match.word).open();
        }
      });

      // Separator
      burgerMenu.createDiv({ cls: "ch-dict-burger-separator" });

      // --- Item: Close ---
      const closeItem = burgerMenu.createEl("button", {
        cls: "ch-dict-burger-item ch-dict-burger-close",
        attr: {
          title: "Закрыть карточку (Esc)",
          "aria-label": "Закрыть карточку",
        },
      });
      closeItem.createSpan({ cls: "ch-dict-burger-icon", text: "✕" });
      closeItem.createSpan({ cls: "ch-dict-burger-label", text: "Закрыть (Esc)" });
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
    const mode = settings.phoneticDisplay || "both";
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
        s.style.setProperty("color", getToneColor(tone));
        s.style.setProperty("font-weight", "600");
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

    // 3. Readable Translation: 1 to 5 words separated by commas
    const translationText = this.formatConciseDefinitions(
      match.entries,
      settings.maxDefinitions || 3,
      match.word,
      settings.translationLanguage || "en"
    );
    this.el.createDiv({
      cls: "ch-dict-translations",
      text: translationText,
      attr: { title: translationText },
    });

    // Metadata Row under translation: HSK Level & Parts of Speech (subtle, clean, neutral)
    const hsk = getHskBadgeInfo(match.word);
    const allDefs = match.entries.flatMap((e) => e.definitions);
    const posList = inferPartsOfSpeech(match.word, allDefs);

    if (hsk || posList.length > 0) {
      const metaRow = this.el.createDiv({ cls: "ch-dict-meta-row" });

      if (hsk) {
        metaRow.createSpan({
          cls: "ch-dict-meta-item ch-dict-meta-hsk",
          text: hsk.label,
          attr: { title: `Официальный уровень: ${hsk.label}` },
        });
      }

      if (posList.length > 0) {
        const isRu = settings.translationLanguage !== "en";
        const posText = formatPosBadge(posList, isRu ? "ru" : "en");
        metaRow.createSpan({
          cls: "ch-dict-meta-item ch-dict-meta-pos",
          text: posText,
          attr: { title: `Часть речи: ${posList.join(", ")}` },
        });
      }
    }

    // 4. Character Breakdown (for compound words >= 2 chars)
    if (settings.showCharacterBreakdown) {
      const chars = Array.from(match.word).filter((c) => /\p{Script=Han}/u.test(c));
      if (chars.length >= 2) {
        const decompRow = this.el.createDiv({ cls: "ch-dict-decomp-row" });
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

            let extraTitle = "";
            let radInfo = null;
            if (settings.showRadicals) {
              radInfo = getCharacterRadical(char);
              if (radInfo) {
                const radMeaning = settings.translationLanguage === "ru" ? radInfo.meaningRu : radInfo.meaningEn;
                extraTitle += `\nКлюч #${radInfo.number}: ${radInfo.radical} (${radInfo.pinyin}, ${radMeaning}, ${radInfo.strokeCount} черт)`;
              }
              const comps = getCharacterComponents(char);
              if (comps && comps.length > 0) {
                extraTitle += `\nСостав: ${comps.join(" + ")}`;
              }
            }

            const chip = decompRow.createDiv({
              cls: "ch-dict-decomp-chip",
              attr: {
                title: `${char} [${py}${jp ? ` / ${jp}` : ""}] ${def}${extraTitle}\nНажмите для озвучки иероглифа`,
              },
            });
            chip.createSpan({ cls: "ch-dict-decomp-char", text: char });
            chip.createSpan({ cls: "ch-dict-decomp-phon", text: phon });
            chip.createSpan({ cls: "ch-dict-decomp-def", text: def });
            if (radInfo) {
              chip.createSpan({
                cls: "ch-dict-decomp-rad",
                text: radInfo.radical,
                attr: { title: `Ключ: ${radInfo.radical} (${radInfo.meaningRu})` },
              });
            }

            chip.addEventListener("click", (e) => {
              e.stopPropagation();
              this.playSpeech(char, settings);
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

    // 6. Example Sentences Drawer
    if (settings.showExamples) {
      const renderExampleDrawer = (sentences: ExampleSentence[]) => {
        if (!sentences || sentences.length === 0) return;
        if (this.el.querySelector(".ch-dict-example-drawer")) return;

        const exEl = this.el.createDiv({ cls: "ch-dict-example-drawer" });
        const exHeader = exEl.createDiv({ cls: "ch-dict-drawer-header" });
        exHeader.createSpan({ cls: "ch-dict-drawer-tag", text: "例句 Примеры" });

        const isRu = settings.translationLanguage !== "en";
        for (const ex of sentences.slice(0, 2)) {
          const row = exEl.createDiv({ cls: "ch-dict-example-row" });
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
      };

      const localExamples = getExampleSentences(match.word);
      if (localExamples && localExamples.length > 0) {
        renderExampleDrawer(localExamples);
      } else {
        // Query Tatoeba live corpus in background
        const targetLang = settings.translationLanguage === "en" ? "eng" : "rus";
        const wordAtFetch = match.word;
        fetchDynamicExamples(match.word, targetLang).then((fetched) => {
          if (this.isVisible && this.currentWord === wordAtFetch && fetched && fetched.length > 0) {
            renderExampleDrawer(fetched);
          }
        }).catch(() => {});
      }
    }
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
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
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

    const audioBtn = this.el.querySelector(".ch-dict-actions button:first-child") as HTMLElement | null;
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
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = speed;

    const audioBtn = this.el.querySelector(".ch-dict-actions button:first-child") as HTMLElement | null;
    if (audioBtn) {
      audioBtn.addClass("ch-audio-playing");
    }
    const stopAudioAnim = () => {
      audioBtn?.removeClass("ch-audio-playing");
    };
    utterance.onend = stopAudioAnim;
    utterance.onerror = stopAudioAnim;

    if (langCode === "zh-HK") {
      const voices = window.speechSynthesis.getVoices();
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

    window.speechSynthesis.speak(utterance);
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
    ) as HTMLElement | null;

    if (sizer) {
      const rect = sizer.getBoundingClientRect();
      if (rect.width > 100) {
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
    }

    // 2. Look for active line or paragraph
    const textEl = leaf.querySelector(
      ".cm-line, .markdown-preview-section p, .markdown-rendered p"
    ) as HTMLElement | null;

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

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

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
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
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

        const maxLeft = Math.max(10, window.innerWidth - this.el.offsetWidth - 10);
        const maxTop = Math.max(10, window.innerHeight - this.el.offsetHeight - 10);

        const nextLeft = Math.max(10, Math.min(maxLeft, this.dragInitialLeft + dx));
        const nextTop = Math.max(10, Math.min(maxTop, this.dragInitialTop + dy));

        this.el.style.left = `${Math.round(nextLeft)}px`;
        this.el.style.top = `${Math.round(nextTop)}px`;
        this.hasCustomPosition = true;
      };

      const onPointerUp = () => {
        this.isDragging = false;
        this.el.removeClass("ch-dict-is-dragging");
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        this.cleanupActiveDrag = null;
      };

      this.cleanupActiveDrag = onPointerUp;

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    });
  }
}
