import { Notice } from "obsidian";
import type ChineseHoverDictPlugin from "./main.ts";
import { DictEntry, MatchResult } from "./dictionary.ts";
import { formatPinyin, formatPinyinSentence } from "./pinyin.ts";
import { getCharPinyinFromWordPinyin } from "./pinyin-frequency.ts";
import { ChineseDictSettings, CopyFormat } from "./settings.ts";
import { getHskBadgeInfo } from "./hsk.ts";
import { resolveChineseFontFamily } from "./font.ts";
import { addNoteToAnki } from "./anki.ts";
import { groupDefinitionsByPos } from "./pos.ts";
import { getRawDefinitionsList } from "./russian-dict.ts";
import { detectPinyinTone, detectJyutpingTone, getToneColor } from "./tones.ts";
import { getCharacterComponents, getCharacterRadical } from "./radicals.ts";
import { ChengyuStory, fetchDynamicChengyuStory, getChengyuStory } from "./chengyu.ts";
import { ExampleSentence, fetchDynamicExamples, getExampleSentences } from "./examples.ts";
import { t, getActiveLanguage } from "./i18n/index.ts";

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
      "--ch-dict-font-hanzi": `${settings.fontSizeHanzi || 21}px`,
      "--ch-dict-font-pinyin": `${settings.fontSizePinyin || 13}px`,
      "--ch-dict-font-translation": `${settings.fontSizeTranslation || 16}px`,
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
    language?: string
  ): string {
    const rawEnglish = this.extractEnglishDefinitions(entries);
    if (!word) {
      return rawEnglish.slice(0, maxCount).join(", ") || (t("tooltip.no_def") || "No definition found");
    }

    let targetLang = language || "auto";
    if (targetLang === "auto") {
      targetLang = getActiveLanguage();
    }

    let targetDefs: string[] | null = null;
    if (targetLang !== "en" && targetLang !== "both") {
      targetDefs = this.plugin?.dictionary?.getMultiLangDefs(word, targetLang) || null;
    }

    let finalDefs: string[] = [];
    if (targetLang === "both") {
      const activeL = getActiveLanguage();
      const nonEnDefs = this.plugin?.dictionary?.getMultiLangDefs(word, activeL) ||
        (activeL === "ru" ? getRawDefinitionsList(word, rawEnglish, "ru", maxCount) : []);
      if (nonEnDefs && nonEnDefs.length > 0) {
        finalDefs = Array.from(new Set([...nonEnDefs, ...rawEnglish])).slice(0, maxCount);
      } else {
        finalDefs = rawEnglish.slice(0, maxCount);
      }
    } else if (targetDefs && targetDefs.length > 0) {
      finalDefs = targetDefs.slice(0, maxCount);
    } else if (targetLang === "ru") {
      finalDefs = getRawDefinitionsList(word, rawEnglish, "ru", maxCount);
    } else {
      finalDefs = rawEnglish.slice(0, maxCount);
    }

    const allDefs = entries.flatMap((e) => e.definitions);
    const groups = groupDefinitionsByPos(finalDefs, word, allDefs, targetLang, maxCount);

    return groups
      .map((g) => `${g.posLabel ? `[${g.posLabel}] ` : ""}${g.items.join(", ")}`)
      .join("; ") || (t("tooltip.no_def") || "No definition");
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
    this.el.removeClass("ch-dict-expanded-horiz-right");
    this.el.removeClass("ch-dict-expanded-horiz-left");
    this.el.removeClass("ch-dict-expanded-details");
    const side = this.el.querySelector(".ch-dict-side-panel");
    if (side) {
      side.remove();
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
      new Notice(`📌 ${t("tooltip.pin_hint")}`);
    } else {
      this.el.removeClass("ch-dict-pinned");
      new Notice(`📌 ${t("tooltip.unpin_hint")}`);
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
      new Notice(`${t("tooltip.copied")} (${activeFormat}): ${textToCopy}`);
    }).catch(() => {
      new Notice(t("notices.copy_failed"));
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

    // Main Card Container (standard popover card content)
    const mainCard = this.el.createDiv({ cls: "ch-dict-main-card" });

    // Subtle Apple-style drag grabber pill at the top of the card
    const grabber = mainCard.createDiv({ cls: "ch-dict-drag-grabber" });
    grabber.setAttribute("title", "Потяните, чтобы переместить карточку / Drag to move");
    this.setupDraggable(grabber, settings);

    const isCantonese = settings.dialect === "cantonese";

    // 1. Top Bar: Clickable Pill with Hanzi and Action buttons
    const topBar = mainCard.createDiv({ cls: "ch-dict-top-bar" });
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

    // Action buttons: Speaker (Pronunciation) & Star (Add/Remove from Favorites)
    if (settings.showActionButtons) {
      const actions = topBar.createDiv({ cls: "ch-dict-actions" });

      // 1. Audio TTS Button
      const audioBtn = actions.createEl("button", {
        cls: "ch-dict-glass-btn ch-dict-audio-btn",
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

      // 2. Star / Favorites Button (Add/Remove from Vocabulary)
      const isStarred = this.plugin?.vocabulary?.hasWord(match.word) ?? false;
      const starBtn = actions.createEl("button", {
        cls: `ch-dict-glass-btn ch-dict-star-btn ${isStarred ? "ch-dict-btn-starred" : "ch-dict-btn-unstarred"}`,
        text: isStarred ? "⭐" : "☆",
        attr: {
          "aria-label": isStarred ? t("tooltip.starred") : t("tooltip.star"),
          title: isStarred ? t("tooltip.star_remove_hint") : t("tooltip.star_add_hint"),
        },
      });

      starBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        void (async () => {
          if (this.plugin?.vocabulary) {
            starBtn.addClass("ch-star-bouncing");
            globalThis.setTimeout(() => starBtn.removeClass("ch-star-bouncing"), 450);
            const nowStarred = await this.plugin.vocabulary.toggleWord(match, contextSentence);
            starBtn.setText(nowStarred ? "⭐" : "☆");
            if (nowStarred) {
              starBtn.addClass("ch-dict-btn-starred");
              starBtn.removeClass("ch-dict-btn-unstarred");
            } else {
              starBtn.removeClass("ch-dict-btn-starred");
              starBtn.addClass("ch-dict-btn-unstarred");
            }
            starBtn.setAttribute(
              "title",
              nowStarred ? t("tooltip.star_remove_hint") : t("tooltip.star_add_hint")
            );
            starBtn.setAttribute(
              "aria-label",
              nowStarred ? t("tooltip.starred") : t("tooltip.star")
            );
            this.plugin.refreshVocabularyViews();

            if (nowStarred && this.plugin.settings.ankiSyncOnStar && this.plugin.settings.anki.enabled) {
              const item = this.plugin.vocabulary.getItem(match.word);
              if (item) {
                const ok = await addNoteToAnki(this.plugin.settings.anki, item);
                if (ok) {
                  new Notice(t("notices.anki_added"));
                }
              }
            }
          }
        })();
      });
    }

    // 2. Phonetics Hero (Pinyin / Jyutping)
    const primaryPinyin = match.entries[0]?.pinyin || "";
    const formattedPinyin = formatPinyin(
      primaryPinyin,
      settings.showAccentedPinyin
    );
    const jyutping = match.entries[0]?.jyutping || "";

    const heroContainer = mainCard.createDiv({ cls: "ch-dict-pinyin-hero" });

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
    let transLang = settings.translationLanguage || "auto";
    if (transLang === "auto") {
      transLang = getActiveLanguage();
    }
    const rawEnglishDefs = this.extractEnglishDefinitions(match.entries);
    let targetDefs: string[] | null = null;
    if (transLang !== "en" && transLang !== "both") {
      targetDefs = this.plugin?.dictionary?.getMultiLangDefs(match.word, transLang) || null;
    }
    let finalDefs: string[] = [];
    if (settings.translationLanguage === "both") {
      const activeL = getActiveLanguage();
      const nonEnDefs = this.plugin?.dictionary?.getMultiLangDefs(match.word, activeL) ||
        (activeL === "ru" ? getRawDefinitionsList(match.word, rawEnglishDefs, "ru", settings.maxDefinitions || 6) : []);
      if (nonEnDefs && nonEnDefs.length > 0) {
        finalDefs = Array.from(new Set([...nonEnDefs, ...rawEnglishDefs])).slice(0, settings.maxDefinitions || 6);
      } else {
        finalDefs = rawEnglishDefs.slice(0, settings.maxDefinitions || 6);
      }
    } else if (targetDefs && targetDefs.length > 0) {
      finalDefs = targetDefs.slice(0, settings.maxDefinitions || 6);
    } else if (transLang === "ru") {
      finalDefs = getRawDefinitionsList(
        match.word,
        rawEnglishDefs,
        "ru",
        settings.maxDefinitions || 6
      );
    } else {
      finalDefs = rawEnglishDefs.slice(0, settings.maxDefinitions || 6);
    }
    const allDefs = match.entries.flatMap((e) => e.definitions);
    const posGroups = groupDefinitionsByPos(
      finalDefs,
      match.word,
      allDefs,
      transLang,
      settings.maxDefinitions || 6
    );

    const defsContainer = mainCard.createDiv({ cls: "ch-dict-defs-container" });
    const fullTranslationPlain = posGroups
      .map((g) => `${g.posLabel ? `[${g.posLabel}] ` : ""}${g.items.join(", ")}`)
      .join("; ");
    defsContainer.setAttribute("title", fullTranslationPlain);

    const hsk = getHskBadgeInfo(match.word);
    let globalItemIndex = 1;
    let isFirstGroup = true;
    for (const group of posGroups) {
      const groupEl = defsContainer.createDiv({ cls: "ch-dict-def-group" });

      // Discreet mini HSK level number placed neatly to the left of the part of speech tag
      if (isFirstGroup && hsk) {
        groupEl.createSpan({
          cls: `ch-dict-hsk-mini-num ch-dict-hsk-${hsk.level}`,
          text: `${hsk.level}`,
          attr: {
            title: `HSK ${hsk.level}`,
            "aria-label": `HSK ${hsk.level}`,
          },
        });
      }
      isFirstGroup = false;

      if (group.posLabel) {
        groupEl.createSpan({
          cls: `ch-dict-pos-tag ${group.posClass}`,
          text: group.posLabel,
          attr: { title: `${t("tooltip.pos") || "Часть речи"}: ${group.posLabel}` },
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

    // Action Row under translation: subtle spacer on left, "⋯" (2 Examples Toggle) on right
    const bottomRow = mainCard.createDiv({ cls: "ch-dict-bottom-row" });
    bottomRow.createDiv({ cls: "ch-dict-bottom-spacer" });

    // Side-by-side horizontal expansion state (cleanly opens examples panel on the right)
    let sidePanel: HTMLElement | null = null;
    let originalLeftBeforeShift: number | null = null;

    const expandBtn = bottomRow.createEl("button", {
      cls: "ch-dict-details-btn",
      text: "⋯",
      attr: {
        title: "2 примера предложений / 2 context examples",
        "aria-label": "Примеры",
      },
    });

    expandBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (sidePanel) {
        // Collapse horizontal side panel
        if (originalLeftBeforeShift !== null) {
          this.el.style.left = `${Math.round(originalLeftBeforeShift)}px`;
          originalLeftBeforeShift = null;
        }
        sidePanel.remove();
        sidePanel = null;
        expandBtn.removeClass("is-active");
        this.el.removeClass("ch-dict-expanded-examples");
        return;
      }

      // Open side panel cleanly on the right
      expandBtn.addClass("is-active");
      this.el.addClass("ch-dict-expanded-examples");

      const baseWidth = settings.popoverWidth || 330;
      const sidePanelWidth = 270;
      const extraMarginPadding = 14 + 28; // margin-left 14px + tooltip padding (14 + 14)
      const totalExpandedWidth = baseWidth + sidePanelWidth + extraMarginPadding;

      const curLeft = parseFloat(this.el.style.left) || this.el.getBoundingClientRect().left;
      const winW = globalThis.innerWidth;

      // If opening on the right would exceed screen boundary, smoothly shift left
      if (curLeft + totalExpandedWidth > winW - 16) {
        originalLeftBeforeShift = curLeft;
        const safeLeft = Math.max(16, winW - totalExpandedWidth - 16);
        this.el.style.left = `${Math.round(safeLeft)}px`;
      } else {
        originalLeftBeforeShift = null;
      }

      sidePanel = this.el.createDiv({ cls: "ch-dict-side-panel" });
      this.renderTwoExamplesIntoSidePanel(sidePanel, match, settings);
    });

    // 4. Character Breakdown (for compound words >= 2 chars)
    if (settings.showCharacterBreakdown) {
      const chars = Array.from(match.word).filter((c) => /\p{Script=Han}/u.test(c));
      if (chars.length >= 2) {
        const decompRow = mainCard.createDiv({ cls: "ch-dict-decomp-row" });
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
              title: `${t("tooltip.audio") || "Озвучить"} ${targetChar}`,
              "aria-label": `${t("tooltip.audio") || "Озвучить"} ${targetChar}`,
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
              text: `${t("tooltip.radical")}:`,
            });
            radLine.createSpan({
              text: `#${radInfo.number} «${radInfo.radical}» [${radInfo.pinyin}] — ${radMeaning} (${radInfo.strokeCount} ${t("tooltip.strokes_count")})`,
            });
          }

          if (comps && comps.length > 0) {
            const compLine = detail.createDiv({ cls: "ch-dict-decomp-detail-line" });
            compLine.createSpan({
              cls: "ch-dict-decomp-detail-label",
              text: `${t("tooltip.components")}:`,
            });
            compLine.createSpan({ text: comps.join(" + ") });
          } else if (!radInfo) {
            const basicLine = detail.createDiv({ cls: "ch-dict-decomp-detail-line" });
            basicLine.createSpan({
              text: t("tooltip.basic_char"),
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
              const isRu = (settings.translationLanguage || "auto") === "ru" || getActiveLanguage() === "ru";
              const radMeaning = isRu ? radInfo.meaningRu : radInfo.meaningEn;
              tooltipText += `\n${t("tooltip.radical")} #${radInfo.number}: ${radInfo.radical} (${radInfo.pinyin}, ${radMeaning})`;
            }
            if (comps && comps.length > 0) {
              tooltipText += `\n${t("tooltip.components")}: ${comps.join(" + ")}`;
            }
            tooltipText += `\n${t("tooltip.decomp_hint")}`;

            const chip = decompRow.createDiv({
              cls: "ch-dict-decomp-chip",
              attr: {
                title: tooltipText,
                "aria-label": `${char}: ${t("tooltip.components")}`,
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
                attr: { title: `${t("tooltip.radical")} ${radInfo.radical} (${radInfo.meaningRu})` },
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
        if (!chengyu || mainCard.querySelector(".ch-dict-chengyu-drawer")) return;
        const storyEl = mainCard.createDiv({ cls: "ch-dict-chengyu-drawer" });
        const header = storyEl.createDiv({ cls: "ch-dict-drawer-header" });
        header.createSpan({ cls: "ch-dict-drawer-tag", text: t("chengyu.title") });
        if (chengyu.dynasty) {
          header.createSpan({ cls: "ch-dict-drawer-dynasty", text: chengyu.dynasty });
        }

        const storyBody = storyEl.createDiv({ cls: "ch-dict-drawer-body" });
        const isRu = (settings.translationLanguage || "auto") === "ru" || getActiveLanguage() === "ru";
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
   * Renders exactly 2 small authentic example sentences into the horizontal side panel
   */
  private renderTwoExamplesIntoSidePanel(
    panel: HTMLElement,
    match: MatchResult,
    settings: ChineseDictSettings
  ): void {
    panel.empty();
    const isRu = (settings.translationLanguage || "auto") === "ru" || getActiveLanguage() === "ru";

    const header = panel.createDiv({ cls: "ch-dict-side-header" });
    header.createSpan({
      cls: "ch-dict-side-title",
      text: `例句 ${t("tooltip.examples") || (isRu ? "Примеры" : "Examples")}`,
    });

    const exContainer = panel.createDiv({ cls: "ch-dict-side-ex-list" });
    const localExamples = getExampleSentences(match.word);

    const getSentencePinyin = (chinese: string, rawPinyin?: string): string => {
      if (rawPinyin && rawPinyin.trim().length > 0) {
        return formatPinyinSentence(rawPinyin);
      }
      if (!chinese) return "";
      const dict = this.plugin?.dictionary;
      if (!dict) return "";

      const chars = Array.from(chinese.trim());
      const parts: string[] = [];
      for (let i = 0; i < chars.length; ) {
        let matched = false;
        for (let len = Math.min(4, chars.length - i); len >= 1; len--) {
          const slice = chars.slice(i, i + len).join("");
          const entries = dict.get(slice);
          if (entries && entries[0]?.pinyin) {
            parts.push(formatPinyin(entries[0].pinyin, true));
            i += len;
            matched = true;
            break;
          }
        }
        if (!matched) {
          parts.push(chars[i]);
          i++;
        }
      }
      const rawAssembled = parts.join(" ")
        .replace(/\s+([，。！？,.!?:;”’"')\]\}])/g, "$1")
        .replace(/([“‘(\[\{])\s+/g, "$1")
        .trim();
      return formatPinyinSentence(rawAssembled);
    };

    const renderTwo = (sentences: ExampleSentence[]) => {
      exContainer.empty();
      const two = sentences.slice(0, 2);
      two.forEach((ex) => {
        const row = exContainer.createDiv({ cls: "ch-dict-side-ex-item" });
        const zhRow = row.createDiv({ cls: "ch-dict-side-ex-zh-row" });

        const zhSpan = zhRow.createSpan({
          cls: "ch-dict-side-ex-zh",
          text: ex.chinese,
          attr: { title: t("tooltip.listen_example") || "Нажмите, чтобы прослушать пример" },
        });
        zhSpan.addEventListener("click", (e) => {
          e.stopPropagation();
          this.playSpeech(ex.chinese, settings);
        });

        const exAudioBtn = zhRow.createEl("button", {
          cls: "ch-dict-side-ex-audio-btn",
          text: "🔊",
          attr: { title: "Прослушать / Listen" },
        });
        exAudioBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.playSpeech(ex.chinese, settings);
        });

        const pyText = getSentencePinyin(ex.chinese, ex.pinyin);
        if (pyText) {
          row.createDiv({ cls: "ch-dict-side-ex-py", text: pyText });
        }
        const translationText = (isRu && ex.russian) ? ex.russian : (ex.english || ex.russian || "");
        if (translationText) {
          row.createDiv({ cls: "ch-dict-side-ex-tr", text: translationText });
        }
      });
    };

    if (localExamples && localExamples.length > 0) {
      renderTwo(localExamples);
    } else {
      const loadingEl = exContainer.createDiv({
        cls: "ch-dict-side-loading",
        text: t("tooltip.examples_loading") || "Поиск примеров...",
      });

      const wordAtFetch = match.word;
      const targetLang = isRu ? "rus" : "eng";
      fetchDynamicExamples(match.word, targetLang).then((fetched) => {
        if (!this.isVisible || this.currentWord !== wordAtFetch || !panel.isConnected) {
          return;
        }
        loadingEl.remove();
        if (fetched && fetched.length > 0) {
          renderTwo(fetched);
        } else {
          exContainer.createDiv({
            cls: "ch-dict-side-empty",
            text: t("tooltip.examples_empty") || "Примеры не найдены",
          });
        }
      }).catch(() => {
        if (panel.isConnected) {
          loadingEl.setText(t("tooltip.examples_error") || "Ошибка загрузки примеров");
        }
      });
    }
  }

  /**
   * Intelligently recalculates and adjusts tooltip position after dynamic content
   * (e.g. Details drawer or Character Decomposition) expands or collapses.
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
