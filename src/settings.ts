import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type ChineseHoverDictPlugin from "./main.ts";
import { ChineseFontPreset, ChineseFontScope } from "./font.ts";
import { AnkiConnectSettings, checkAnkiConnect, DEFAULT_ANKI_SETTINGS } from "./anki.ts";
import { WorksheetModal } from "./worksheet.ts";
import { SUPPORTED_LANGUAGES, t, setActiveLanguage } from "./i18n/index.ts";
import { DICT_PACKS } from "./dict-packs.ts";
import { exportVocabularyFile } from "./utils.ts";

export type ChineseDialect = "cantonese" | "mandarin";
export type TriggerMode = "dblclick" | "hover_modifier" | "hover" | "command_only";
export type ModifierKey = "Alt" | "Shift" | "Control" | "Meta";
export type PhoneticDisplay = "both" | "pinyin" | "jyutping" | "dialect_auto";
export type PopoverTheme = "auto" | "glass_dark" | "glass_light" | "solid";
export type TextColorPreset = "white" | "cyan" | "gold" | "obsidian";
export type TraditionalSeparator = " - " | " / " | " · " | " () ";
export type AudioEngine = "google_neural" | "web_speech";
export type CopyFormat = "default" | "hanzi_only" | "pinyin_only" | "wikilink" | "markdown_table";

export interface ChineseDictSettings {
  enabled: boolean;

  // Activation & Triggers
  triggerMode: TriggerMode;
  hoverModifierKey: ModifierKey;
  hoverDelayMs: number;

  // Voice & Audio
  dialect: ChineseDialect;
  speechSpeed: number;
  audioEngine: AudioEngine;
  autoPlayAudio: boolean;

  // Phonetics & Hanzi
  phoneticDisplay: PhoneticDisplay;
  showAccentedPinyin: boolean;
  showTraditional: boolean;
  traditionalSeparator: TraditionalSeparator;
  maxDefinitions: number;
  showActionButtons: boolean;

  // Appearance & Styling
  theme: PopoverTheme;
  popoverWidth: number;
  popoverHeight: number;
  blurIntensity: number;
  textColorPreset: TextColorPreset;
  fontSizeHanzi: number;
  fontSizePinyin: number;
  fontSizeTranslation: number;

  // Dictionary Lookup
  maxWordLength: number;
  enableReverseLookup: boolean;
  reverseLookupLanguage: string;

  // Personal Vocabulary Notebook
  vocabularyFilePath: string;
  autoSaveContextSentence: boolean;
  practiceMode: boolean;
  vocabularySort: "date_desc" | "date_asc" | "alpha";

  // Word Selection
  selectCantonesePhrases: boolean;
  smartWordSelection?: boolean;

  // Reader Mode (Quick hover reading without modifier key)
  readerMode: boolean;

  // Chinese Typography & Exam Fonts
  chineseFontFamily: ChineseFontPreset;
  customChineseFont: string;
  chineseFontScope: ChineseFontScope;
  readerModeFontFamily: ChineseFontPreset;
  readerModeCustomFont: string;

  // Learning & Visual Aids
  showHskBadge: boolean;
  showCharacterBreakdown: boolean;
  showStrokeOrder: boolean;
  showWordNotesButton: boolean;

  // Ruby Furigana
  rubyDialect: "pinyin" | "jyutping";

  // Anki Integration
  anki: AnkiConnectSettings;
  ankiSyncOnStar: boolean;

  // UI Localization (20 languages supported)
  uiLanguage: string;

  // Dictionary Packs (On-demand downloads)
  activeDictPack: string;
  installedDictPacks: string[];

  // Translation Language
  translationLanguage: string;

  // Grammar & Advanced Learning
  showPartOfSpeech: boolean;
  showRadicals: boolean;

  // Tone Coloring (Pleco style)
  toneColoring: "off" | "phonetics" | "all";
  toneColoringExplicit?: boolean;

  // Zettelkasten Word Notes
  wordNotesFolder: string;

  // UX & Interactivity
  copyFormat: CopyFormat;
  enablePopoverHotkeys: boolean;
  enableDraggablePopover: boolean;
  enableResizablePopover: boolean;
  maxRecentHistory: number;
}

export const DEFAULT_SETTINGS: ChineseDictSettings = {
  enabled: true,

  triggerMode: "dblclick",
  hoverModifierKey: "Alt",
  hoverDelayMs: 300,

  dialect: "mandarin",
  speechSpeed: 0.8,
  audioEngine: "google_neural",
  autoPlayAudio: false,

  phoneticDisplay: "pinyin",
  showAccentedPinyin: true,
  showTraditional: true,
  traditionalSeparator: " - ",
  maxDefinitions: 6,
  showActionButtons: true,

  theme: "auto",
  popoverWidth: 370,
  popoverHeight: 165,
  blurIntensity: 34,
  textColorPreset: "white",
  fontSizeHanzi: 21,
  fontSizePinyin: 13,
  fontSizeTranslation: 16,

  maxWordLength: 12,
  enableReverseLookup: false,
  reverseLookupLanguage: "auto",

  vocabularyFilePath: "Chinese Vocabulary.md",
  autoSaveContextSentence: true,
  practiceMode: false,
  vocabularySort: "date_desc",

  selectCantonesePhrases: false,
  readerMode: false,

  chineseFontFamily: "default",
  customChineseFont: "",
  chineseFontScope: "popover_and_sidebar",
  readerModeFontFamily: "default",
  readerModeCustomFont: "",

  showHskBadge: false,
  showCharacterBreakdown: false,
  showStrokeOrder: false,
  showWordNotesButton: false,

  rubyDialect: "pinyin",

  anki: DEFAULT_ANKI_SETTINGS,
  ankiSyncOnStar: false,

  uiLanguage: "auto",
  activeDictPack: "en",
  installedDictPacks: ["en"],
  translationLanguage: "auto",
  showPartOfSpeech: false,
  showRadicals: false,
  toneColoring: "off",
  wordNotesFolder: "Chinese/Words",

  copyFormat: "default",
  enablePopoverHotkeys: true,
  enableDraggablePopover: true,
  enableResizablePopover: true,
  maxRecentHistory: 50,
};

interface AppWithSetting extends App {
  setting?: {
    open(): void;
    openTabById(id: string): void;
    activeTab?: {
      searchComponent?: { setValue(val: string): void };
      updateHotkeyVisibility?(): void;
    };
  };
}

export class ChineseDictSettingTab extends PluginSettingTab {
  plugin: ChineseHoverDictPlugin;
  private dictFilterQuery: string = "";

  constructor(app: App, plugin: ChineseHoverDictPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  override display(): void {
    this.renderSettings();
  }

  private async saveAndRefresh(refreshTooltip: boolean = true): Promise<void> {
    await this.plugin.saveSettings();
    if (refreshTooltip && this.plugin.tooltip.getIsOpen()) {
      this.plugin.tooltip.refresh(this.plugin.settings);
    }
  }

  private addToggle(
    container: HTMLElement,
    name: string,
    desc: string,
    value: boolean,
    onChange: (val: boolean) => Promise<void> | void,
    refreshTooltip: boolean = true
  ): Setting {
    return new Setting(container)
      .setName(name)
      .setDesc(desc)
      .addToggle((toggle) =>
        toggle.setValue(value).onChange(async (val) => {
          await onChange(val);
          await this.saveAndRefresh(refreshTooltip);
        })
      );
  }

  private addDropdown(
    container: HTMLElement,
    name: string,
    desc: string,
    options: Array<[string, string]>,
    value: string,
    onChange: (val: string) => Promise<void> | void,
    refreshTooltip: boolean = true,
    rerender: boolean = false
  ): Setting {
    return new Setting(container)
      .setName(name)
      .setDesc(desc)
      .addDropdown((dropdown) => {
        for (const [optVal, optLabel] of options) {
          dropdown.addOption(optVal, optLabel);
        }
        dropdown.setValue(value).onChange(async (val) => {
          await onChange(val);
          await this.saveAndRefresh(refreshTooltip);
          if (rerender) this.renderSettings();
        });
      });
  }

  private addSlider(
    container: HTMLElement,
    name: string,
    desc: string,
    min: number,
    max: number,
    step: number,
    value: number,
    onChange: (val: number) => void,
    refreshTooltip: boolean = true
  ): Setting {
    return new Setting(container)
      .setName(name)
      .setDesc(desc)
      .addSlider((slider) =>
        slider
          .setLimits(min, max, step)
          .setValue(value)
          .onChange(async (val) => {
            onChange(val);
            await this.saveAndRefresh(refreshTooltip);
          })
      );
  }

  private getFontPresetOptions(includeSameDefault: boolean = false): Array<[string, string]> {
    return [
      ["default", includeSameDefault ? t("settings.reader_font_same") : t("settings.font_default")],
      ["kaiti", t("settings.font_kaiti")],
      ["songti", t("settings.font_songti")],
      ["heiti", t("settings.font_heiti")],
      ["fangsong", t("settings.font_fangsong")],
      ["wenkai", t("settings.font_wenkai")],
      ["custom", t("settings.font_custom")],
    ];
  }

  private renderHeroBar(containerEl: HTMLElement): void {
    const isFull = this.plugin.dictionary?.isFullDictionaryLoaded?.() ?? false;
    const hero = containerEl.createDiv({ cls: "ch-settings-hero" });

    const info = hero.createDiv({ cls: "ch-settings-hero-info" });
    info.createDiv({ cls: "ch-settings-hero-title", text: "🏮 Chinese Popover Dictionary" });
    info.createDiv({
      cls: "ch-settings-hero-sub",
      text: isFull ? t("settings.dict_db_ready") : t("settings.dict_db_demo"),
    });

    const actions = hero.createDiv({ cls: "ch-settings-hero-actions" });

    const vocabBtn = actions.createEl("button", {
      cls: "ch-settings-hero-btn",
      text: `📖 ${t("settings.open_sidebar_btn")}`,
    });
    vocabBtn.addEventListener("click", () => {
      void this.plugin.activateVocabularyView();
    });

    const hotkeysBtn = actions.createEl("button", {
      cls: "mod-cta ch-settings-hero-btn",
      text: `⌨️ ${t("settings.hotkeys_btn")}`,
    });
    hotkeysBtn.addEventListener("click", () => {
      try {
        const settingTab = (this.app as AppWithSetting).setting;
        if (settingTab) {
          settingTab.open();
          settingTab.openTabById("hotkeys");
          if (settingTab.activeTab?.searchComponent) {
            settingTab.activeTab.searchComponent.setValue("Chinese Dictionary");
            settingTab.activeTab.updateHotkeyVisibility?.();
          }
        }
      } catch (e) {
        console.warn("[Chinese Dict] Could not open hotkey settings tab:", e);
      }
    });
  }

  private renderSettings(): void {
    const { containerEl } = this;
    containerEl.empty();

    const s = this.plugin.settings;
    const langOptions: Array<[string, string]> = SUPPORTED_LANGUAGES.map((l) => [
      l.code,
      `${l.flag} ${l.nativeName} (${l.name})`,
    ]);

    // Top Hero Status & Quick Shortcuts
    this.renderHeroBar(containerEl);

    // ==========================================
    // 1. САМОЕ ВАЖНОЕ: АКТИВАЦИЯ, ЯЗЫК И РЕЖИМ ЧТЕНИЯ
    // ==========================================
    new Setting(containerEl).setName(t("settings.activation_heading")).setHeading();

    this.addToggle(
      containerEl,
      t("settings.enable_plugin"),
      t("settings.enable_plugin_desc"),
      s.enabled,
      (val) => {
        s.enabled = val;
        if (!val) this.plugin.tooltip.hide();
      },
      false
    );

    this.addDropdown(
      containerEl,
      t("settings.ui_language"),
      t("settings.ui_language_desc"),
      [["auto", t("settings.ui_language_auto")], ...langOptions],
      s.uiLanguage || "auto",
      async (val) => {
        s.uiLanguage = val;
        setActiveLanguage(val);
        await this.plugin.dictionary.ensureActiveLanguageDictPack();
      },
      false,
      true
    );

    this.addDropdown(
      containerEl,
      t("settings.trans_lang"),
      t("settings.trans_lang_desc"),
      [["auto", t("settings.trans_lang_auto")], ["both", t("settings.trans_lang_both")], ...langOptions],
      s.translationLanguage || "auto",
      async (val) => {
        s.translationLanguage = val;
        await this.plugin.dictionary.ensureActiveLanguageDictPack();
      },
      true
    );

    this.addToggle(
      containerEl,
      t("settings.reader_mode"),
      t("settings.reader_mode_desc"),
      s.readerMode,
      (val) => {
        s.readerMode = val;
        this.plugin.updateReaderStatusBar();
        this.plugin.applyCurrentFont();
      },
      false
    );

    this.addDropdown(
      containerEl,
      t("settings.trigger_mode"),
      t("settings.trigger_mode_desc"),
      [
        ["dblclick", t("settings.trigger_dblclick")],
        ["hover_modifier", t("settings.trigger_hover_mod")],
        ["hover", t("settings.trigger_hover")],
        ["command_only", t("settings.trigger_command")],
      ],
      s.triggerMode,
      (val) => { s.triggerMode = val as TriggerMode; },
      false,
      true
    );

    if (s.triggerMode === "hover_modifier") {
      this.addDropdown(
        containerEl,
        t("settings.modifier_key"),
        t("settings.modifier_key_desc"),
        [
          ["Alt", "Alt / Option (⌥)"],
          ["Shift", "Shift (⇧)"],
          ["Control", "Ctrl (⌃)"],
          ["Meta", "Command ⌘ / Windows ⊞"],
        ],
        s.hoverModifierKey,
        (val) => { s.hoverModifierKey = val as ModifierKey; },
        false
      );
    }

    if (s.triggerMode === "hover" || s.triggerMode === "hover_modifier") {
      this.addSlider(
        containerEl,
        t("settings.hover_delay"),
        t("settings.hover_delay_desc"),
        100, 800, 50,
        s.hoverDelayMs,
        (val) => { s.hoverDelayMs = val; },
        false
      );
    }

    this.addToggle(
      containerEl,
      t("settings.cantonese_phrases"),
      t("settings.cantonese_phrases_desc"),
      s.selectCantonesePhrases ?? true,
      (val) => { s.selectCantonesePhrases = val; },
      false
    );

    this.addToggle(
      containerEl,
      t("settings.reverse_lookup"),
      t("settings.reverse_lookup_desc"),
      s.enableReverseLookup,
      (val) => {
        s.enableReverseLookup = val;
        if (val) this.plugin.dictionary.ensureReverseIndexReady();
      },
      false
    );

    if (s.enableReverseLookup) {
      this.addDropdown(
        containerEl,
        t("settings.reverse_lang"),
        t("settings.reverse_lang_desc"),
        [["auto", t("settings.reverse_lang_auto")], ...DICT_PACKS.map((p) => [p.id, `${p.flag} ${p.name} (${p.nativeName})`] as [string, string])],
        s.reverseLookupLanguage || "auto",
        (val) => { s.reverseLookupLanguage = val; },
        false
      );
    }

    // ==========================================
    // 2. ФОНЕТИКА, ДИАЛЕКТ И ОЗВУЧКА
    // ==========================================
    new Setting(containerEl).setName(t("settings.phonetics_heading")).setHeading();

    this.addDropdown(
      containerEl,
      t("settings.dialect"),
      t("settings.dialect_desc"),
      [
        ["mandarin", t("settings.dialect_mandarin")],
        ["cantonese", t("settings.dialect_cantonese")],
      ],
      s.dialect,
      (val) => { s.dialect = val as ChineseDialect; }
    );

    this.addDropdown(
      containerEl,
      t("settings.phonetic_display"),
      t("settings.phonetic_display_desc"),
      [
        ["pinyin", t("settings.phonetic_pinyin")],
        ["both", t("settings.phonetic_both")],
        ["jyutping", t("settings.phonetic_jyutping")],
        ["dialect_auto", t("settings.phonetic_auto")],
      ],
      s.phoneticDisplay,
      (val) => { s.phoneticDisplay = val as PhoneticDisplay; }
    );

    this.addToggle(containerEl, t("settings.accented_pinyin"), t("settings.accented_pinyin_desc"), s.showAccentedPinyin, (v) => { s.showAccentedPinyin = v; });
    this.addToggle(containerEl, t("settings.show_traditional"), t("settings.show_traditional_desc"), s.showTraditional, (v) => { s.showTraditional = v; });

    this.addDropdown(
      containerEl,
      t("settings.trad_separator"),
      t("settings.trad_separator_desc"),
      [
        [" - ", " ' - ' (学 - 學)"],
        [" / ", " ' / ' (学 / 學)"],
        [" · ", " ' · ' (学 · 學)"],
        [" () ", " ' ( )' (学 (學))"],
      ],
      s.traditionalSeparator,
      (val) => { s.traditionalSeparator = val as TraditionalSeparator; }
    );

    this.addDropdown(
      containerEl,
      t("settings.tone_colors"),
      t("settings.tone_colors_desc"),
      [
        ["off", t("settings.tone_off")],
        ["phonetics", t("settings.tone_phonetics")],
        ["all", t("settings.tone_all")],
      ],
      s.toneColoring,
      (val) => {
        s.toneColoring = val as "off" | "phonetics" | "all";
        s.toneColoringExplicit = true;
      }
    );

    this.addSlider(containerEl, t("settings.max_definitions"), t("settings.max_definitions_desc"), 1, 8, 1, s.maxDefinitions || 6, (v) => { s.maxDefinitions = v; });

    this.addDropdown(
      containerEl,
      t("settings.audio_engine"),
      t("settings.audio_engine_desc"),
      [
        ["google_neural", t("settings.audio_engine_neural")],
        ["web_speech", t("settings.audio_engine_webspeech")],
      ],
      s.audioEngine,
      (val) => { s.audioEngine = val as AudioEngine; },
      false
    );
    this.addSlider(containerEl, t("settings.speech_speed"), t("settings.speech_speed_desc"), 0.5, 1.4, 0.05, s.speechSpeed, (v) => { s.speechSpeed = v; }, false);
    this.addToggle(containerEl, t("settings.autoplay_audio"), t("settings.autoplay_audio_desc"), s.autoPlayAudio, (v) => { s.autoPlayAudio = v; }, false);

    // ==========================================
    // 3. КИТАЙСКАЯ ТИПОГРАФИКА И ШРИФТЫ
    // ==========================================
    new Setting(containerEl).setName(t("settings.typography_heading")).setHeading();

    this.addDropdown(
      containerEl,
      t("settings.font_family"),
      t("settings.font_family_desc"),
      this.getFontPresetOptions(false),
      s.chineseFontFamily,
      (val) => {
        s.chineseFontFamily = val as ChineseFontPreset;
        this.plugin.applyCurrentFont();
      },
      false,
      true
    );

    if (s.chineseFontFamily === "custom") {
      new Setting(containerEl)
        .setName(t("settings.custom_font_name"))
        .setDesc(t("settings.custom_font_desc"))
        .addText((text) =>
          text.setPlaceholder("Source Han Serif SC").setValue(s.customChineseFont).onChange(async (val) => {
            s.customChineseFont = val.trim();
            await this.plugin.saveSettings();
            this.plugin.applyCurrentFont();
          })
        );
    }

    this.addDropdown(
      containerEl,
      t("settings.reader_font_family"),
      t("settings.reader_font_family_desc"),
      this.getFontPresetOptions(true),
      s.readerModeFontFamily || "default",
      (val) => {
        s.readerModeFontFamily = val as ChineseFontPreset;
        this.plugin.applyCurrentFont();
      },
      false,
      true
    );

    if (s.readerModeFontFamily === "custom") {
      new Setting(containerEl)
        .setName(t("settings.custom_font_name"))
        .setDesc(t("settings.custom_font_desc"))
        .addText((text) =>
          text.setPlaceholder("LXGW WenKai").setValue(s.readerModeCustomFont).onChange(async (val) => {
            s.readerModeCustomFont = val.trim();
            await this.plugin.saveSettings();
            this.plugin.applyCurrentFont();
          })
        );
    }

    this.addDropdown(
      containerEl,
      t("settings.font_scope"),
      t("settings.font_scope_desc"),
      [
        ["popover_and_sidebar", t("settings.scope_popover_sidebar")],
        ["entire_editor", t("settings.scope_entire_editor")],
      ],
      s.chineseFontScope,
      (val) => {
        s.chineseFontScope = val as ChineseFontScope;
        this.plugin.applyCurrentFont();
      },
      false
    );

    // ==========================================
    // 4. ВНЕШНИЙ ВИД, МОДУЛИ КАРТОЧКИ И UX
    // ==========================================
    new Setting(containerEl).setName(t("settings.appearance_heading")).setHeading();

    this.addDropdown(
      containerEl,
      t("settings.theme"),
      t("settings.theme_desc"),
      [
        ["auto", t("settings.theme_auto")],
        ["glass_dark", t("settings.theme_glass_dark")],
        ["glass_light", t("settings.theme_glass_light")],
        ["solid", t("settings.theme_solid")],
      ],
      s.theme,
      (val) => { s.theme = val as PopoverTheme; }
    );

    this.addDropdown(
      containerEl,
      t("settings.text_color_preset"),
      t("settings.text_color_desc"),
      [
        ["white", t("settings.color_white")],
        ["cyan", t("settings.color_cyan")],
        ["gold", t("settings.color_gold")],
        ["obsidian", t("settings.color_obsidian")],
      ],
      s.textColorPreset,
      (val) => { s.textColorPreset = val as TextColorPreset; }
    );

    this.addSlider(containerEl, t("settings.blur_intensity"), t("settings.blur_desc"), 0, 60, 2, s.blurIntensity, (v) => { s.blurIntensity = v; });
    this.addSlider(containerEl, t("settings.popover_width"), t("settings.popover_width_desc"), 280, 520, 10, s.popoverWidth, (v) => { s.popoverWidth = v; });
    this.addSlider(containerEl, t("settings.popover_height"), t("settings.popover_height_desc"), 130, 250, 5, s.popoverHeight, (v) => { s.popoverHeight = v; });
    this.addSlider(containerEl, t("settings.font_size_hanzi"), t("settings.font_size_hanzi_desc"), 14, 32, 1, s.fontSizeHanzi, (v) => { s.fontSizeHanzi = v; });
    this.addSlider(containerEl, t("settings.font_size_pinyin"), t("settings.font_size_pinyin_desc"), 10, 24, 1, s.fontSizePinyin, (v) => { s.fontSizePinyin = v; });
    this.addSlider(containerEl, t("settings.font_size_trans"), t("settings.font_size_trans_desc"), 12, 24, 1, s.fontSizeTranslation, (v) => { s.fontSizeTranslation = v; });

    this.addToggle(containerEl, t("settings.show_action_buttons"), t("settings.show_action_buttons_desc"), s.showActionButtons, (v) => { s.showActionButtons = v; });
    this.addToggle(containerEl, t("settings.show_hsk"), t("settings.show_hsk_desc"), s.showHskBadge, (v) => { s.showHskBadge = v; });
    this.addToggle(containerEl, t("settings.char_breakdown"), t("settings.char_breakdown_desc"), s.showCharacterBreakdown, (v) => { s.showCharacterBreakdown = v; });
    this.addToggle(containerEl, t("settings.parts_of_speech"), t("settings.parts_of_speech_desc"), s.showPartOfSpeech, (v) => { s.showPartOfSpeech = v; });
    this.addToggle(containerEl, t("settings.radicals"), t("settings.radicals_desc"), s.showRadicals, (v) => { s.showRadicals = v; });
    this.addToggle(containerEl, t("settings.stroke_order"), t("settings.stroke_order_desc"), s.showStrokeOrder, (v) => { s.showStrokeOrder = v; });
    this.addToggle(containerEl, t("settings.word_note_btn"), t("settings.word_note_btn_desc"), s.showWordNotesButton, (v) => { s.showWordNotesButton = v; });

    this.addToggle(containerEl, t("settings.draggable"), t("settings.draggable_desc"), s.enableDraggablePopover ?? true, (v) => { s.enableDraggablePopover = v; }, false);
    this.addToggle(containerEl, t("settings.resizable"), t("settings.resizable_desc"), s.enableResizablePopover ?? true, (v) => { s.enableResizablePopover = v; });
    this.addToggle(containerEl, t("settings.popover_hotkeys"), t("settings.popover_hotkeys_desc"), s.enablePopoverHotkeys ?? true, (v) => { s.enablePopoverHotkeys = v; }, false);

    this.addDropdown(
      containerEl,
      t("settings.copy_format"),
      t("settings.copy_format_desc"),
      [
        ["default", t("settings.copy_format_default")],
        ["hanzi_only", t("settings.copy_format_hanzi")],
        ["pinyin_only", t("settings.copy_format_pinyin")],
        ["wikilink", t("settings.copy_format_wikilink")],
        ["markdown_table", t("settings.copy_format_table")],
      ],
      s.copyFormat ?? "default",
      (val) => { s.copyFormat = val as CopyFormat; },
      false
    );
    this.addSlider(containerEl, t("settings.recent_history_limit"), t("settings.recent_history_desc"), 10, 100, 5, s.maxRecentHistory ?? 50, (v) => { s.maxRecentHistory = v; }, false);

    // ==========================================
    // 5. УЧЁБА, ЛИЧНЫЙ СЛОВАРИК, ЭКСПОРТ И ANKI
    // ==========================================
    new Setting(containerEl).setName(t("settings.vocab_heading")).setHeading();

    new Setting(containerEl)
      .setName(t("settings.vocab_path"))
      .setDesc(t("settings.vocab_path_desc"))
      .addText((text) =>
        text.setPlaceholder("Chinese Vocabulary.md").setValue(s.vocabularyFilePath).onChange(async (value) => {
          let clean = value.trim().replace(/^[/\\]+/, "").replace(/\.\./g, "");
          if (clean && !clean.endsWith(".md")) clean += ".md";
          s.vocabularyFilePath = clean || "Chinese Vocabulary.md";
          await this.plugin.saveSettings();
        })
      );

    this.addToggle(containerEl, t("settings.save_context"), t("settings.save_context_desc"), s.autoSaveContextSentence, (v) => { s.autoSaveContextSentence = v; }, false);

    new Setting(containerEl)
      .setName(t("settings.word_notes_folder"))
      .setDesc(t("settings.word_notes_folder_desc"))
      .addText((text) =>
        text.setPlaceholder("Chinese/Words").setValue(s.wordNotesFolder).onChange(async (val) => {
          s.wordNotesFolder = val.trim() || "Chinese/Words";
          await this.plugin.saveSettings();
        })
      );

    this.addDropdown(
      containerEl,
      t("settings.ruby_dialect"),
      t("settings.ruby_dialect_desc"),
      [
        ["pinyin", t("settings.ruby_pinyin")],
        ["jyutping", t("settings.ruby_jyutping")],
      ],
      s.rubyDialect,
      (val) => { s.rubyDialect = val as "pinyin" | "jyutping"; },
      false
    );

    new Setting(containerEl)
      .setName(t("settings.worksheets"))
      .setDesc(t("settings.worksheets_desc"))
      .addButton((btn) =>
        btn.setButtonText(t("settings.worksheets_btn")).onClick(() => {
          const items = this.plugin.vocabulary.getItems();
          if (items.length === 0) {
            new Notice("Словарик пуст! Сначала добавьте слова звёздочкой ⭐.");
            return;
          }
          new WorksheetModal(this.app, items).open();
        })
      );

    this.addDropdown(
      containerEl,
      t("settings.anki_heading"),
      t("settings.anki_enable_desc"),
      [
        ["off", "Off"],
        ["on", "AnkiConnect On"],
      ],
      s.anki.enabled ? "on" : "off",
      (val) => { s.anki.enabled = val === "on"; },
      false,
      true
    );

    if (s.anki.enabled) {
      new Setting(containerEl)
        .setName(t("settings.anki_url"))
        .setDesc("http://127.0.0.1:8765")
        .addText((text) =>
          text.setPlaceholder("http://127.0.0.1:8765").setValue(s.anki.serverUrl).onChange(async (val) => {
            const url = val.trim();
            s.anki.serverUrl = url ? (/^https?:\/\//i.test(url) ? url : `http://${url}`) : "http://127.0.0.1:8765";
            await this.plugin.saveSettings();
          })
        );

      new Setting(containerEl)
        .setName(t("settings.anki_deck"))
        .setDesc("Chinese")
        .addText((text) =>
          text.setPlaceholder("Chinese").setValue(s.anki.deckName).onChange(async (val) => {
            s.anki.deckName = val.trim() || "Chinese";
            await this.plugin.saveSettings();
          })
        );

      this.addToggle(containerEl, t("settings.anki_sync_star"), t("settings.anki_sync_star_desc"), s.ankiSyncOnStar, (v) => { s.ankiSyncOnStar = v; }, false);

      new Setting(containerEl)
        .setName(t("settings.anki_test"))
        .setDesc(t("settings.anki_test_desc"))
        .addButton((btn) =>
          btn.setButtonText(t("settings.anki_test_btn")).onClick(async () => {
            btn.setDisabled(true);
            const ok = await checkAnkiConnect(s.anki.serverUrl);
            btn.setDisabled(false);
            new Notice(ok ? "✅ AnkiConnect OK!" : "❌ AnkiConnect Failed!", 3500);
          })
        );
    }

    new Setting(containerEl)
      .setName(t("settings.anki_export_tsv"))
      .setDesc(t("settings.anki_export_tsv_desc"))
      .addButton((btn) =>
        btn.setButtonText(t("settings.anki_export_tsv_btn")).onClick(() => {
          exportVocabularyFile(this.plugin.vocabulary.getItems(), "anki");
        })
      );

    new Setting(containerEl)
      .setName(t("settings.pleco_export"))
      .setDesc(t("settings.pleco_export_desc"))
      .addButton((btn) =>
        btn.setButtonText(t("settings.pleco_export_btn")).onClick(() => {
          exportVocabularyFile(this.plugin.vocabulary.getItems(), "pleco");
        })
      );

    // ==========================================
    // 6. ОФЛАЙН-СЛОВАРИ И ЯЗЫКОВЫЕ БАЗЫ (ВНИЗУ)
    // ==========================================
    containerEl.createDiv({ cls: "ch-dict-settings-spacer" });
    new Setting(containerEl).setName(t("settings.dict_packs_title")).setHeading();

    const isFull = this.plugin.dictionary?.isFullDictionaryLoaded?.() ?? false;
    new Setting(containerEl)
      .setName(t("settings.dict_db_title"))
      .setDesc(isFull ? t("settings.dict_db_ready") : t("settings.dict_db_demo"))
      .addButton((btn) => {
        btn.setButtonText(isFull ? t("settings.dict_reload_btn") : t("settings.dict_download_full_btn"));
        if (!isFull) btn.setCta();
        btn.onClick(async () => {
          btn.setDisabled(true);
          btn.setButtonText(t("settings.dict_downloading"));
          await this.plugin.dictionary.downloadDictionary();
          btn.setDisabled(false);
          this.renderSettings();
        });
      });

    this.addSlider(containerEl, t("settings.max_word_len"), t("settings.max_word_len_desc"), 2, 16, 1, s.maxWordLength, (v) => { s.maxWordLength = v; }, false);

    new Setting(containerEl)
      .setName(t("settings.dict_packs_desc"))
      .addText((text) =>
        text
          .setPlaceholder("🔍 Filter languages (ru, ko, yue, es...)")
          .setValue(this.dictFilterQuery)
          .onChange((val) => {
            this.dictFilterQuery = val.trim().toLowerCase();
            void this.renderDictPacksCards(packsContainer);
          })
      );

    const packsContainer = containerEl.createDiv({ cls: "ch-dict-packs-container" });
    void this.renderDictPacksCards(packsContainer);

    // ==========================================
    // 7. СБРОС НАСТРОЕК И КУРСЫ АВТОРА
    // ==========================================
    containerEl.createDiv({ cls: "ch-dict-settings-spacer" });

    new Setting(containerEl)
      .setName(t("settings.reset_title"))
      .setDesc(t("settings.reset_desc"))
      .addButton((btn) =>
        btn.setButtonText(t("settings.reset_btn")).setClass("mod-warning").onClick(async () => {
          this.plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as ChineseDictSettings;
          await this.plugin.saveSettings();
          this.plugin.applyCurrentFont();
          this.plugin.updateReaderStatusBar();
          if (this.plugin.tooltip.getIsOpen()) {
            this.plugin.tooltip.refresh(this.plugin.settings);
          }
          this.renderSettings();
        })
      );

    new Setting(containerEl).setName(t("settings.courses_heading")).setHeading();
    const aboutBox = containerEl.createDiv({ cls: "ch-dict-about-box" });
    aboutBox.createEl("p", { text: t("settings.courses_desc") });

    const channelRow = aboutBox.createDiv({ cls: "ch-dict-channels-row" });
    const channels = [
      { url: "https://www.youtube.com/@ChineseWithKantulaev", icon: "🇬🇧", title: t("settings.courses_channel_eng"), sub: t("settings.courses_channel_eng_sub") },
      { url: "https://www.youtube.com/@kantulaevCN", icon: "🇷🇺", title: t("settings.courses_channel_ru"), sub: t("settings.courses_channel_ru_sub") },
    ];
    for (const ch of channels) {
      const card = channelRow.createEl("a", { cls: "ch-dict-channel-card", href: ch.url });
      card.setAttribute("target", "_blank");
      card.setAttribute("rel", "noopener noreferrer");
      card.createSpan({ cls: "ch-dict-channel-icon", text: ch.icon });
      const info = card.createDiv({ cls: "ch-dict-channel-info" });
      info.createSpan({ cls: "ch-dict-channel-title", text: ch.title });
      info.createSpan({ cls: "ch-dict-channel-sub", text: ch.sub });
    }
  }

  private async renderDictPacksCards(containerEl: HTMLElement): Promise<void> {
    containerEl.empty();
    const activePack = this.plugin.settings.activeDictPack || "en";
    const q = this.dictFilterQuery;

    for (const pack of DICT_PACKS) {
      if (
        q &&
        !pack.id.toLowerCase().includes(q) &&
        !pack.name.toLowerCase().includes(q) &&
        !pack.nativeName.toLowerCase().includes(q)
      ) {
        continue;
      }

      const isInstalled = await this.plugin.dictionary.isPackInstalled(pack.id);
      const isCantoneseAddon = pack.id === "yue";
      const isActive = isCantoneseAddon ? isInstalled : (activePack === pack.id);

      const card = containerEl.createDiv({ cls: "ch-dict-pack-card" });
      if (isActive) card.addClass("is-active-pack");
      if (isInstalled) card.addClass("is-installed");

      const leftCol = card.createDiv({ cls: "ch-dict-pack-left" });
      leftCol.createSpan({ cls: "ch-dict-pack-flag", text: pack.flag });

      const infoCol = leftCol.createDiv({ cls: "ch-dict-pack-info" });
      const titleRow = infoCol.createDiv({ cls: "ch-dict-pack-title-row" });
      titleRow.createSpan({ cls: "ch-dict-pack-name", text: pack.nativeName });

      if (isActive) {
        titleRow.createSpan({ cls: "ch-dict-pack-badge ch-dict-pack-badge-active", text: t("settings.dict_active") });
      } else if (isInstalled) {
        titleRow.createSpan({ cls: "ch-dict-pack-badge ch-dict-pack-badge-installed", text: t("settings.dict_installed") });
      }

      const metaRow = infoCol.createDiv({ cls: "ch-dict-pack-meta" });
      metaRow.createSpan({ text: `${pack.entries} ${t("settings.dict_entries")} • ${pack.approxSize} • ${pack.source}` });

      const actions = card.createDiv({ cls: "ch-dict-pack-actions" });

      if (isInstalled) {
        if (!isActive && !isCantoneseAddon) {
          const activateBtn = actions.createEl("button", { cls: "mod-cta ch-dict-pack-btn", text: t("settings.dict_activate") });
          activateBtn.addEventListener("click", () => {
            void (async () => {
              this.plugin.settings.activeDictPack = pack.id;
              this.plugin.settings.translationLanguage = pack.id;
              await this.plugin.saveSettings();
              await this.plugin.dictionary.loadPack(pack.id);
              new Notice(`${t("notices.dict_activated")} ${pack.flag} ${pack.nativeName}`);
              await this.renderDictPacksCards(containerEl);
            })();
          });
        }

        const deleteBtn = actions.createEl("button", { cls: "ch-dict-pack-btn ch-dict-pack-btn-delete", text: t("settings.dict_delete") });
        deleteBtn.addEventListener("click", () => {
          void (async () => {
            const ok = await this.plugin.dictionary.deletePack(pack.id);
            if (ok) {
              if (this.plugin.settings.activeDictPack === pack.id) {
                this.plugin.settings.activeDictPack = "en";
                this.plugin.settings.translationLanguage = "en";
                await this.plugin.saveSettings();
              }
              await this.renderDictPacksCards(containerEl);
            }
          })();
        });
      } else {
        const downloadBtn = actions.createEl("button", { cls: "ch-dict-pack-btn ch-dict-pack-btn-download", text: `📥 ${t("settings.dict_download")}` });
        downloadBtn.addEventListener("click", () => {
          void (async () => {
            downloadBtn.setText(`⏳ ${t("settings.dict_downloading")}`);
            downloadBtn.setAttribute("disabled", "true");
            const ok = await this.plugin.dictionary.downloadPack(pack.id);
            if (ok) {
              if (!this.plugin.settings.installedDictPacks) this.plugin.settings.installedDictPacks = ["en"];
              if (!this.plugin.settings.installedDictPacks.includes(pack.id)) this.plugin.settings.installedDictPacks.push(pack.id);
              if (!isCantoneseAddon) {
                this.plugin.settings.activeDictPack = pack.id;
                this.plugin.settings.translationLanguage = pack.id;
              }
              await this.plugin.saveSettings();
              await this.renderDictPacksCards(containerEl);
            } else {
              downloadBtn.setText(`📥 ${t("settings.dict_download")}`);
              downloadBtn.removeAttribute("disabled");
            }
          })();
        });
      }
    }
  }
}
