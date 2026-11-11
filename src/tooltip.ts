import { Notice } from "obsidian";
import { DictEntry, MatchResult } from "./dictionary.ts";
import { formatPinyin } from "./pinyin.ts";
import { ChineseDictSettings } from "./settings.ts";

export interface ContentBounds {
  left: number;
  right: number;
  top?: number;
  bottom?: number;
}

export class DictTooltip {
  private el: HTMLElement;
  private isVisible: boolean = false;
  private currentWord: string | null = null;
  private currentMatch: MatchResult | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    this.el = document.createElement("div");
    this.el.addClass("ch-dict-tooltip");

    // Strictly ensure it does not intercept clicks or take layout space when hidden
    this.el.style.display = "none";
    this.el.style.pointerEvents = "none";
    this.el.style.left = "-9999px";
    this.el.style.top = "-9999px";

    // Prevent clicking inside the tooltip from bubbling to document and closing it
    this.el.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });

    document.body.appendChild(this.el);
  }

  /**
   * Applies custom CSS variables, theme classes, and color presets
   */
  applyDynamicStyles(settings: ChineseDictSettings): void {
    const width = settings.popoverWidth || 330;
    const height = settings.popoverHeight || 165;
    const blur = settings.blurIntensity ?? 34;

    this.el.style.setProperty("--ch-dict-width", `${width}px`);
    this.el.style.setProperty("--ch-dict-height", `${height}px`);
    this.el.style.setProperty("--ch-dict-blur", `${blur}px`);
    this.el.style.setProperty("--ch-dict-font-hanzi", `${settings.fontSizeHanzi || 19}px`);
    this.el.style.setProperty("--ch-dict-font-pinyin", `${settings.fontSizePinyin || 22}px`);
    this.el.style.setProperty("--ch-dict-font-translation", `${settings.fontSizeTranslation || 15}px`);

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
  }

  /**
   * Extracts concise definitions separated by commas (up to maxCount)
   */
  private formatConciseDefinitions(entries: DictEntry[], maxCount: number = 3): string {
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
    bounds?: ContentBounds
  ): void {
    this.currentMatch = match;
    this.currentWord = match.word;

    this.applyDynamicStyles(settings);
    this.render(match, settings);
    this.position(x, y, settings, bounds);

    // Make visible and interactive
    this.el.style.display = "flex";
    this.el.style.pointerEvents = "auto";
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
    this.render(this.currentMatch, settings);
  }

  /**
   * Instantly hides the tooltip, cancels any audio, and removes pointer-events entirely
   */
  hide(): void {
    if (!this.isVisible) return;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    this.el.removeClass("ch-dict-visible");
    this.el.style.display = "none";
    this.el.style.pointerEvents = "none";
    this.el.style.left = "-9999px";
    this.el.style.top = "-9999px";
    this.isVisible = false;
    this.currentWord = null;
    this.currentMatch = null;
  }

  getIsOpen(): boolean {
    return this.isVisible;
  }

  getCurrentWord(): string | null {
    return this.currentWord;
  }

  getCurrentMatch(): MatchResult | null {
    return this.currentMatch;
  }

  /**
   * Copies formatted entry to clipboard
   */
  copyCurrentEntry(settings: ChineseDictSettings): void {
    if (!this.currentMatch) return;
    this.copyEntryDirect(this.currentMatch, settings);
  }

  copyEntryDirect(match: MatchResult, settings: ChineseDictSettings): void {
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
      settings.maxDefinitions
    );

    let wordText = simplified;
    if (settings.showTraditional && trads.length > 0) {
      const sep = settings.traditionalSeparator || " - ";
      wordText =
        sep === " () "
          ? `${simplified} (${trads.join(", ")})`
          : `${simplified}${sep}${trads.join(", ")}`;
    }

    const clipText = `${wordText} [${phonetics}] ${defsText}`;
    navigator.clipboard.writeText(clipText);
    new Notice(`Скопировано: ${clipText}`);
  }

  /**
   * Builds the DOM content:
   * - Top Pill: Large Simplified on left - Large Traditional on right (same size)
   * - Big Crisp Pinyin Hero: Multi-line wrap, customizable color & font size
   * - Translations: 1-5 readable words comma-separated
   */
  private render(match: MatchResult, settings: ChineseDictSettings): void {
    this.el.empty();

    const isCantonese = settings.dialect === "cantonese";

    // 1. Top Bar: Clickable Pill with Hanzi and Action buttons
    const topBar = this.el.createDiv({ cls: "ch-dict-top-bar" });

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

    // Action buttons (Speaker & Copy) if enabled
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

      // Copy Button
      const copyBtn = actions.createEl("button", {
        cls: "ch-dict-glass-btn",
        text: "📋",
        attr: { "aria-label": "Copy dictionary entry", title: "Копировать" },
      });
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.copyCurrentEntry(settings);
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
    let showPinyinOnly = false;

    if (mode === "both") {
      showBoth = Boolean(jyutping);
      showPinyinOnly = !jyutping;
    } else if (mode === "pinyin") {
      showPinyinOnly = true;
    } else if (mode === "jyutping") {
      showJyutpingOnly = Boolean(jyutping);
      showPinyinOnly = !jyutping;
    } else if (mode === "dialect_auto") {
      if (isCantonese && jyutping) {
        showBoth = true;
      } else {
        showPinyinOnly = true;
      }
    }

    if (showBoth) {
      heroContainer.createSpan({
        cls: "ch-dict-pinyin-part",
        text: formattedPinyin,
      });
      heroContainer.createSpan({
        cls: "ch-dict-pinyin-slash",
        text: " / ",
      });
      heroContainer.createSpan({
        cls: "ch-dict-jyutping-part",
        text: jyutping,
      });
      heroContainer.setAttribute(
        "title",
        `${formattedPinyin} / ${jyutping}`
      );
    } else if (showJyutpingOnly) {
      heroContainer.createSpan({
        cls: "ch-dict-jyutping-part",
        text: jyutping,
      });
      heroContainer.setAttribute("title", jyutping);
    } else {
      heroContainer.createSpan({
        cls: "ch-dict-pinyin-part",
        text: formattedPinyin,
      });
      heroContainer.setAttribute("title", formattedPinyin);
    }

    // 3. Readable Translation: 1 to 5 words separated by commas
    const translationText = this.formatConciseDefinitions(
      match.entries,
      settings.maxDefinitions || 3
    );
    this.el.createDiv({
      cls: "ch-dict-translations",
      text: translationText,
      attr: { title: translationText },
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
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

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

    try {
      const audio = new Audio(url);
      audio.playbackRate = speed;
      this.currentAudio = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("[Chinese Dict] Online audio failed, using offline TTS fallback:", err);
          this.fallbackSpeechSynthesis(text, isCantonese ? "zh-HK" : "zh-CN", speed);
        });
      }
    } catch (_) {
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

    this.el.style.left = `${Math.round(left)}px`;
    this.el.style.top = `${Math.round(top)}px`;
  }

  /**
   * Cleans up DOM element on plugin unload
   */
  destroy(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}
