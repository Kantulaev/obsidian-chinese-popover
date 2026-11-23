import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type ChineseHoverDictPlugin from "./main.ts";
import { applyChineseFontToDOM, ChineseFontPreset, ChineseFontScope } from "./font.ts";
import {
  AnkiConnectSettings,
  checkAnkiConnect,
  DEFAULT_ANKI_SETTINGS,
  generateAnkiTsv,
} from "./anki.ts";
import { generatePlecoFlashcards } from "./pleco.ts";
import { WorksheetModal } from "./worksheet.ts";
import { SUPPORTED_LANGUAGES, t, setActiveLanguage } from "./i18n/index.ts";
import { DICT_PACKS } from "./dict-packs.ts";

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
      searchComponent?: {
        setValue(val: string): void;
      };
      updateHotkeyVisibility?(): void;
    };
  };
}

export class ChineseDictSettingTab extends PluginSettingTab {
  plugin: ChineseHoverDictPlugin;

  constructor(app: App, plugin: ChineseHoverDictPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  override display(): void {
    this.renderSettings();
  }

  private renderSettings(): void {
    const { containerEl } = this;
    containerEl.empty();

    // --- QUICK HOTKEY HELPER ---
    new Setting(containerEl)
      .setName(t("settings.hotkeys_title"))
      .setDesc(t("settings.hotkeys_desc"))
      .addButton((btn) =>
        btn
          .setButtonText(t("settings.hotkeys_btn"))
          .setCta()
          .onClick(() => {
            try {
              const settingTab = (this.app as AppWithSetting).setting;
              if (settingTab) {
                settingTab.open();
                settingTab.openTabById("hotkeys");
                const hotkeyTab = settingTab.activeTab;
                if (hotkeyTab && hotkeyTab.searchComponent) {
                  hotkeyTab.searchComponent.setValue("Chinese Dictionary");
                  hotkeyTab.updateHotkeyVisibility?.();
                }
              }
            } catch (e) {
              console.warn("[Chinese Dict] Could not open hotkey settings tab:", e);
            }
          })
      );

    // ==========================================
    // 0. ЯЗЫК ИНТЕРФЕЙСА И СЛОВАРИ (I18N & DICTIONARY PACKS)
    // ==========================================
    new Setting(containerEl)
      .setName(t("settings.lang_heading"))
      .setHeading();

    new Setting(containerEl)
      .setName(t("settings.ui_language"))
      .setDesc(t("settings.ui_language_desc"))
      .addDropdown((dropdown) => {
        dropdown.addOption("auto", t("settings.ui_language_auto"));
        for (const lang of SUPPORTED_LANGUAGES) {
          dropdown.addOption(lang.code, `${lang.flag} ${lang.nativeName} (${lang.name})`);
        }
        dropdown.setValue(this.plugin.settings.uiLanguage || "auto");
        dropdown.onChange(async (val) => {
          this.plugin.settings.uiLanguage = val;
          setActiveLanguage(val);
          await this.plugin.saveSettings();
          await this.plugin.dictionary.ensureActiveLanguageDictPack();
          this.renderSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("settings.dict_packs_title"))
      .setDesc(t("settings.dict_packs_desc"));

    const packsContainer = containerEl.createDiv({ cls: "ch-dict-packs-container" });
    void this.renderDictPacksCards(packsContainer);

    containerEl.createDiv({ cls: "ch-dict-settings-spacer" });

    // ==========================================
    // 1. АКТИВАЦИЯ И ТРИГГЕРЫ
    // ==========================================
    new Setting(containerEl)
      .setName(t("settings.activation_heading"))
      .setHeading();

    new Setting(containerEl)
      .setName(t("settings.enable_plugin"))
      .setDesc(t("settings.enable_plugin_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enabled)
          .onChange(async (value) => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveSettings();
            if (!value) {
              this.plugin.tooltip.hide();
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.trigger_mode"))
      .setDesc(t("settings.trigger_mode_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("dblclick", t("settings.trigger_dblclick"))
          .addOption("hover_modifier", t("settings.trigger_hover_mod"))
          .addOption("hover", t("settings.trigger_hover"))
          .addOption("command_only", t("settings.trigger_command"))
          .setValue(this.plugin.settings.triggerMode)
          .onChange(async (value) => {
            this.plugin.settings.triggerMode = value as TriggerMode;
            await this.plugin.saveSettings();
            this.renderSettings(); // Refresh to show/hide relevant modifier options
          })
      );

    new Setting(containerEl)
      .setName(t("settings.cantonese_phrases"))
      .setDesc(t("settings.cantonese_phrases_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.selectCantonesePhrases ?? true)
          .onChange(async (value) => {
            this.plugin.settings.selectCantonesePhrases = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.reader_mode"))
      .setDesc(t("settings.reader_mode_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.readerMode)
          .onChange(async (value) => {
            this.plugin.settings.readerMode = value;
            await this.plugin.saveSettings();
            this.plugin.updateReaderStatusBar();
          })
      );

    if (this.plugin.settings.triggerMode === "hover_modifier") {
      new Setting(containerEl)
        .setName(t("settings.modifier_key"))
        .setDesc(t("settings.modifier_key_desc"))
        .addDropdown((dropdown) =>
          dropdown
            .addOption("Alt", "Alt / Option (⌥)")
            .addOption("Shift", "Shift (⇧)")
            .addOption("Control", "Ctrl (⌃)")
            .addOption("Meta", "Command ⌘ / Windows ⊞")
            .setValue(this.plugin.settings.hoverModifierKey)
            .onChange(async (value) => {
              this.plugin.settings.hoverModifierKey = value as ModifierKey;
              await this.plugin.saveSettings();
            })
        );
    }

    if (this.plugin.settings.triggerMode === "hover" || this.plugin.settings.triggerMode === "hover_modifier") {
      new Setting(containerEl)
        .setName(t("settings.hover_delay"))
        .setDesc(t("settings.hover_delay_desc"))
        .addSlider((slider) =>
          slider
            .setLimits(100, 800, 50)
            .setValue(this.plugin.settings.hoverDelayMs)
            .onChange(async (value) => {
              this.plugin.settings.hoverDelayMs = value;
              await this.plugin.saveSettings();
            })
        );
    }

    // ==========================================
    // 2. ОЗВУЧКА И ПРОИЗНОШЕНИЕ
    // ==========================================
    new Setting(containerEl)
      .setName(t("settings.voice_heading"))
      .setHeading();

    new Setting(containerEl)
      .setName(t("settings.dialect"))
      .setDesc(t("settings.dialect_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("mandarin", t("settings.dialect_mandarin"))
          .addOption("cantonese", t("settings.dialect_cantonese"))
          .setValue(this.plugin.settings.dialect)
          .onChange(async (value) => {
            this.plugin.settings.dialect = value as ChineseDialect;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.audio_engine"))
      .setDesc(t("settings.audio_engine_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("google_neural", t("settings.audio_engine_neural"))
          .addOption("web_speech", t("settings.audio_engine_webspeech"))
          .setValue(this.plugin.settings.audioEngine)
          .onChange(async (value) => {
            this.plugin.settings.audioEngine = value as AudioEngine;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.speech_speed"))
      .setDesc(t("settings.speech_speed_desc"))
      .addSlider((slider) =>
        slider
          .setLimits(0.5, 1.4, 0.05)
          .setValue(this.plugin.settings.speechSpeed)
          .onChange(async (value) => {
            this.plugin.settings.speechSpeed = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.autoplay_audio"))
      .setDesc(t("settings.autoplay_audio_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoPlayAudio)
          .onChange(async (value) => {
            this.plugin.settings.autoPlayAudio = value;
            await this.plugin.saveSettings();
          })
      );

    // ==========================================
    // 3. ОТОБРАЖЕНИЕ ФОНЕТИКИ И ИЕРОГЛИФОВ
    // ==========================================
    new Setting(containerEl)
      .setName(t("settings.phonetics_heading"))
      .setHeading();

    new Setting(containerEl)
      .setName(t("settings.phonetic_display"))
      .setDesc(t("settings.phonetic_display_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("pinyin", t("settings.phonetic_pinyin"))
          .addOption("both", t("settings.phonetic_both"))
          .addOption("jyutping", t("settings.phonetic_jyutping"))
          .addOption("dialect_auto", t("settings.phonetic_auto"))
          .setValue(this.plugin.settings.phoneticDisplay)
          .onChange(async (value) => {
            this.plugin.settings.phoneticDisplay = value as PhoneticDisplay;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.accented_pinyin"))
      .setDesc(t("settings.accented_pinyin_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showAccentedPinyin)
          .onChange(async (value) => {
            this.plugin.settings.showAccentedPinyin = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.show_traditional"))
      .setDesc(t("settings.show_traditional_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showTraditional)
          .onChange(async (value) => {
            this.plugin.settings.showTraditional = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.trad_separator"))
      .setDesc(t("settings.trad_separator_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption(" - ", " ' - ' (学 - 學)")
          .addOption(" / ", " ' / ' (学 / 學)")
          .addOption(" · ", " ' · ' (学 · 學)")
          .addOption(" () ", " ' ( )' (学 (學))")
          .setValue(this.plugin.settings.traditionalSeparator)
          .onChange(async (value) => {
            this.plugin.settings.traditionalSeparator = value as TraditionalSeparator;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.max_definitions"))
      .setDesc(t("settings.max_definitions_desc"))
      .addSlider((slider) =>
        slider
          .setLimits(1, 8, 1)
          .setValue(this.plugin.settings.maxDefinitions || 6)
          .onChange(async (value) => {
            this.plugin.settings.maxDefinitions = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.show_action_buttons"))
      .setDesc(t("settings.show_action_buttons_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showActionButtons)
          .onChange(async (value) => {
            this.plugin.settings.showActionButtons = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.show_hsk"))
      .setDesc(t("settings.show_hsk_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showHskBadge)
          .onChange(async (value) => {
            this.plugin.settings.showHskBadge = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.char_breakdown"))
      .setDesc(t("settings.char_breakdown_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showCharacterBreakdown)
          .onChange(async (value) => {
            this.plugin.settings.showCharacterBreakdown = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.trans_lang"))
      .setDesc(t("settings.trans_lang_desc"))
      .addDropdown((dropdown) => {
        dropdown.addOption("auto", t("settings.trans_lang_auto"));
        dropdown.addOption("both", t("settings.trans_lang_both"));
        for (const lang of SUPPORTED_LANGUAGES) {
          dropdown.addOption(lang.code, `${lang.flag} ${lang.nativeName} (${lang.name})`);
        }
        dropdown.setValue(this.plugin.settings.translationLanguage || "auto");
        dropdown.onChange(async (value) => {
          this.plugin.settings.translationLanguage = value;
          await this.plugin.saveSettings();
          await this.plugin.dictionary.ensureActiveLanguageDictPack();
          if (this.plugin.tooltip.getIsOpen()) {
            this.plugin.tooltip.refresh(this.plugin.settings);
          }
        });
      });

    new Setting(containerEl)
      .setName(t("settings.parts_of_speech"))
      .setDesc(t("settings.parts_of_speech_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showPartOfSpeech)
          .onChange(async (value) => {
            this.plugin.settings.showPartOfSpeech = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.tone_colors"))
      .setDesc(t("settings.tone_colors_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("off", t("settings.tone_off"))
          .addOption("phonetics", t("settings.tone_phonetics"))
          .addOption("all", t("settings.tone_all"))
          .setValue(this.plugin.settings.toneColoring)
          .onChange(async (value) => {
            this.plugin.settings.toneColoring = value as "off" | "phonetics" | "all";
            this.plugin.settings.toneColoringExplicit = true;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.radicals"))
      .setDesc(t("settings.radicals_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showRadicals)
          .onChange(async (value) => {
            this.plugin.settings.showRadicals = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.stroke_order"))
      .setDesc(t("settings.stroke_order_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showStrokeOrder)
          .onChange(async (value) => {
            this.plugin.settings.showStrokeOrder = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.word_note_btn"))
      .setDesc(t("settings.word_note_btn_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showWordNotesButton)
          .onChange(async (value) => {
            this.plugin.settings.showWordNotesButton = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    // ==========================================
    // 4. КИТАЙСКАЯ ТИПОГРАФИКА И ШРИФТЫ
    // ==========================================
    new Setting(containerEl)
      .setName(t("settings.typography_heading"))
      .setHeading();

    new Setting(containerEl)
      .setName(t("settings.font_family"))
      .setDesc(t("settings.font_family_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("default", t("settings.font_default"))
          .addOption("kaiti", t("settings.font_kaiti"))
          .addOption("songti", t("settings.font_songti"))
          .addOption("heiti", t("settings.font_heiti"))
          .addOption("fangsong", t("settings.font_fangsong"))
          .addOption("wenkai", t("settings.font_wenkai"))
          .addOption("custom", t("settings.font_custom"))
          .setValue(this.plugin.settings.chineseFontFamily)
          .onChange(async (value) => {
            this.plugin.settings.chineseFontFamily = value as ChineseFontPreset;
            await this.plugin.saveSettings();
            applyChineseFontToDOM(
              this.plugin.settings.chineseFontFamily,
              this.plugin.settings.chineseFontScope,
              this.plugin.settings.customChineseFont
            );
            this.renderSettings();
          })
      );

    if (this.plugin.settings.chineseFontFamily === "custom") {
      new Setting(containerEl)
        .setName(t("settings.custom_font_name"))
        .setDesc(t("settings.custom_font_desc"))
        .addText((text) =>
          text
            .setPlaceholder("Source Han Serif SC")
            .setValue(this.plugin.settings.customChineseFont)
            .onChange(async (val) => {
              this.plugin.settings.customChineseFont = val.trim();
              await this.plugin.saveSettings();
              applyChineseFontToDOM(
                this.plugin.settings.chineseFontFamily,
                this.plugin.settings.chineseFontScope,
                this.plugin.settings.customChineseFont
              );
            })
        );
    }

    new Setting(containerEl)
      .setName(t("settings.font_scope"))
      .setDesc(t("settings.font_scope_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("popover_and_sidebar", t("settings.scope_popover_sidebar"))
          .addOption("entire_editor", t("settings.scope_entire_editor"))
          .setValue(this.plugin.settings.chineseFontScope)
          .onChange(async (value) => {
            this.plugin.settings.chineseFontScope = value as ChineseFontScope;
            await this.plugin.saveSettings();
            applyChineseFontToDOM(
              this.plugin.settings.chineseFontFamily,
              this.plugin.settings.chineseFontScope,
              this.plugin.settings.customChineseFont
            );
          })
      );

    // ==========================================
    // 5. ВНЕШНИЙ ВИД И СТИЛЬ LIQUID GLASS
    // ==========================================
    new Setting(containerEl)
      .setName(t("settings.appearance_heading"))
      .setHeading();

    new Setting(containerEl)
      .setName(t("settings.theme"))
      .setDesc(t("settings.theme_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("auto", t("settings.theme_auto"))
          .addOption("glass_dark", t("settings.theme_glass_dark"))
          .addOption("glass_light", t("settings.theme_glass_light"))
          .addOption("solid", t("settings.theme_solid"))
          .setValue(this.plugin.settings.theme)
          .onChange(async (value) => {
            this.plugin.settings.theme = value as PopoverTheme;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.text_color_preset"))
      .setDesc(t("settings.text_color_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("white", t("settings.color_white"))
          .addOption("cyan", t("settings.color_cyan"))
          .addOption("gold", t("settings.color_gold"))
          .addOption("obsidian", t("settings.color_obsidian"))
          .setValue(this.plugin.settings.textColorPreset)
          .onChange(async (value) => {
            this.plugin.settings.textColorPreset = value as TextColorPreset;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.popover_width"))
      .setDesc(t("settings.popover_width_desc"))
      .addSlider((slider) =>
        slider
          .setLimits(280, 520, 10)
          .setValue(this.plugin.settings.popoverWidth)
          .onChange(async (value) => {
            this.plugin.settings.popoverWidth = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.popover_height"))
      .setDesc(t("settings.popover_height_desc"))
      .addSlider((slider) =>
        slider
          .setLimits(130, 250, 5)
          .setValue(this.plugin.settings.popoverHeight)
          .onChange(async (value) => {
            this.plugin.settings.popoverHeight = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.blur_intensity"))
      .setDesc(t("settings.blur_desc"))
      .addSlider((slider) =>
        slider
          .setLimits(0, 60, 2)
          .setValue(this.plugin.settings.blurIntensity)
          .onChange(async (value) => {
            this.plugin.settings.blurIntensity = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.font_size_hanzi"))
      .setDesc(t("settings.font_size_hanzi_desc"))
      .addSlider((slider) =>
        slider
          .setLimits(14, 32, 1)
          .setValue(this.plugin.settings.fontSizeHanzi)
          .onChange(async (value) => {
            this.plugin.settings.fontSizeHanzi = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.font_size_pinyin"))
      .setDesc(t("settings.font_size_pinyin_desc"))
      .addSlider((slider) =>
        slider
          .setLimits(10, 24, 1)
          .setValue(this.plugin.settings.fontSizePinyin)
          .onChange(async (value) => {
            this.plugin.settings.fontSizePinyin = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.font_size_trans"))
      .setDesc(t("settings.font_size_trans_desc"))
      .addSlider((slider) =>
        slider
          .setLimits(12, 24, 1)
          .setValue(this.plugin.settings.fontSizeTranslation)
          .onChange(async (value) => {
            this.plugin.settings.fontSizeTranslation = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    // ==========================================
    // 6. ИНТЕРАКТИВНОСТЬ И УДОБСТВО (UX)
    // ==========================================
    new Setting(containerEl)
      .setName(t("settings.ux_heading"))
      .setHeading();

    new Setting(containerEl)
      .setName(t("settings.draggable"))
      .setDesc(t("settings.draggable_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableDraggablePopover ?? true)
          .onChange(async (value) => {
            this.plugin.settings.enableDraggablePopover = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.resizable"))
      .setDesc(t("settings.resizable_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableResizablePopover ?? true)
          .onChange(async (value) => {
            this.plugin.settings.enableResizablePopover = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.popover_hotkeys"))
      .setDesc(t("settings.popover_hotkeys_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enablePopoverHotkeys ?? true)
          .onChange(async (value) => {
            this.plugin.settings.enablePopoverHotkeys = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.copy_format"))
      .setDesc(t("settings.copy_format_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("default", t("settings.copy_format_default"))
          .addOption("hanzi_only", t("settings.copy_format_hanzi"))
          .addOption("pinyin_only", t("settings.copy_format_pinyin"))
          .addOption("wikilink", t("settings.copy_format_wikilink"))
          .addOption("markdown_table", t("settings.copy_format_table"))
          .setValue(this.plugin.settings.copyFormat ?? "default")
          .onChange(async (value) => {
            this.plugin.settings.copyFormat = value as CopyFormat;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.recent_history_limit"))
      .setDesc(t("settings.recent_history_desc"))
      .addSlider((slider) =>
        slider
          .setLimits(10, 100, 5)
          .setValue(this.plugin.settings.maxRecentHistory ?? 50)
          .onChange(async (value) => {
            this.plugin.settings.maxRecentHistory = value;
            await this.plugin.saveSettings();
          })
      );

    // ==========================================
    // 7. ПАРАМЕТРЫ СЛОВАРЯ
    // ==========================================
    new Setting(containerEl)
      .setName(t("settings.dict_db_heading"))
      .setHeading();

    const isFull = this.plugin.dictionary?.isFullDictionaryLoaded?.() ?? false;
    new Setting(containerEl)
      .setName(t("settings.dict_db_title"))
      .setDesc(
        isFull
          ? t("settings.dict_db_ready")
          : t("settings.dict_db_demo")
      )
      .addButton((btn) => {
        btn.setButtonText(isFull ? t("settings.dict_reload_btn") : t("settings.dict_download_full_btn"));
        if (!isFull) {
          btn.setCta();
        }
        btn.onClick(async () => {
          btn.setDisabled(true);
          btn.setButtonText(t("settings.dict_downloading"));
          await this.plugin.dictionary.downloadDictionary();
          btn.setDisabled(false);
          this.renderSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("settings.max_word_len"))
      .setDesc(t("settings.max_word_len_desc"))
      .addSlider((slider) =>
        slider
          .setLimits(2, 16, 1)
          .setValue(this.plugin.settings.maxWordLength)
          .onChange(async (value) => {
            this.plugin.settings.maxWordLength = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.reverse_lookup"))
      .setDesc(t("settings.reverse_lookup_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableReverseLookup)
          .onChange(async (value) => {
            this.plugin.settings.enableReverseLookup = value;
            await this.plugin.saveSettings();
            if (value) {
              this.plugin.dictionary.ensureReverseIndexReady();
            }
          })
      );

    new Setting(containerEl)
      .setName(t("settings.reverse_lang"))
      .setDesc(t("settings.reverse_lang_desc"))
      .addDropdown((dropdown) => {
        dropdown.addOption("auto", t("settings.reverse_lang_auto"));
        for (const pack of DICT_PACKS) {
          dropdown.addOption(pack.id, `${pack.flag} ${pack.name} (${pack.nativeName})`);
        }
        dropdown.setValue(this.plugin.settings.reverseLookupLanguage || "auto");
        dropdown.onChange(async (value) => {
          this.plugin.settings.reverseLookupLanguage = value;
          await this.plugin.saveSettings();
        });
      });

    // ==========================================
    // 8. ЛИЧНЫЙ СЛОВАРИК
    // ==========================================
    new Setting(containerEl)
      .setName(t("settings.vocab_heading"))
      .setHeading();

    new Setting(containerEl)
      .setName(t("settings.vocab_path"))
      .setDesc(t("settings.vocab_path_desc"))
      .addText((text) =>
        text
          .setPlaceholder("Chinese Vocabulary.md")
          .setValue(this.plugin.settings.vocabularyFilePath)
          .onChange(async (value) => {
            let clean = value.trim().replace(/^[/\\]+/, "").replace(/\.\./g, "");
            if (clean && !clean.endsWith(".md")) clean += ".md";
            this.plugin.settings.vocabularyFilePath = clean || "Chinese Vocabulary.md";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.save_context"))
      .setDesc(t("settings.save_context_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoSaveContextSentence)
          .onChange(async (value) => {
            this.plugin.settings.autoSaveContextSentence = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.word_notes_folder"))
      .setDesc(t("settings.word_notes_folder_desc"))
      .addText((text) =>
        text
          .setPlaceholder("Chinese/Words")
          .setValue(this.plugin.settings.wordNotesFolder)
          .onChange(async (val) => {
            this.plugin.settings.wordNotesFolder = val.trim() || "Chinese/Words";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.open_sidebar"))
      .setDesc(t("settings.open_sidebar_desc"))
      .addButton((btn) =>
        btn
          .setButtonText(t("settings.open_sidebar_btn"))
          .setCta()
          .onClick(() => {
            void this.plugin.activateVocabularyView();
          })
      );

    // ==========================================
    // 7. ИНТЕГРАЦИЯ С ANKI & PLECO
    // ==========================================
    new Setting(containerEl)
      .setName(t("settings.anki_heading"))
      .setHeading();

    new Setting(containerEl)
      .setName(t("settings.anki_enable"))
      .setDesc(t("settings.anki_enable_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.anki.enabled)
          .onChange(async (value) => {
            this.plugin.settings.anki.enabled = value;
            await this.plugin.saveSettings();
            this.renderSettings();
          })
      );

    if (this.plugin.settings.anki.enabled) {
      new Setting(containerEl)
        .setName(t("settings.anki_url"))
        .setDesc("http://127.0.0.1:8765")
        .addText((text) =>
          text
            .setPlaceholder("http://127.0.0.1:8765")
            .setValue(this.plugin.settings.anki.serverUrl)
            .onChange(async (val) => {
              const url = val.trim();
              if (/^https?:\/\//i.test(url)) {
                this.plugin.settings.anki.serverUrl = url;
              } else if (url) {
                this.plugin.settings.anki.serverUrl = `http://${url}`;
              } else {
                this.plugin.settings.anki.serverUrl = "http://127.0.0.1:8765";
              }
              await this.plugin.saveSettings();
            })
        );

      new Setting(containerEl)
        .setName(t("settings.anki_deck"))
        .setDesc("Chinese")
        .addText((text) =>
          text
            .setPlaceholder("Chinese")
            .setValue(this.plugin.settings.anki.deckName)
            .onChange(async (val) => {
              this.plugin.settings.anki.deckName = val.trim() || "Chinese";
              await this.plugin.saveSettings();
            })
        );

      new Setting(containerEl)
        .setName(t("settings.anki_sync_star"))
        .setDesc(t("settings.anki_sync_star_desc"))
        .addToggle((toggle) =>
          toggle
            .setValue(this.plugin.settings.ankiSyncOnStar)
            .onChange(async (val) => {
              this.plugin.settings.ankiSyncOnStar = val;
              await this.plugin.saveSettings();
            })
        );

      new Setting(containerEl)
        .setName(t("settings.anki_test"))
        .setDesc(t("settings.anki_test_desc"))
        .addButton((btn) =>
          btn
            .setButtonText(t("settings.anki_test_btn"))
            .onClick(async () => {
              btn.setDisabled(true);
              const ok = await checkAnkiConnect(this.plugin.settings.anki.serverUrl);
              btn.setDisabled(false);
              if (ok) {
                new Notice("✅ AnkiConnect OK!", 3500);
              } else {
                new Notice("❌ AnkiConnect Failed!", 4000);
              }
            })
        );
    }

    new Setting(containerEl)
      .setName(t("settings.anki_export_tsv"))
      .setDesc(t("settings.anki_export_tsv_desc"))
      .addButton((btn) =>
        btn
          .setButtonText(t("settings.anki_export_tsv_btn"))
          .onClick(() => {
            const items = this.plugin.vocabulary.getItems();
            if (items.length === 0) {
              new Notice("Словарик пуст! Сначала добавьте слова звёздочкой ⭐.");
              return;
            }
            const tsv = generateAnkiTsv(items);
            const blob = new Blob([tsv], { type: "text/tab-separated-values;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = createEl("a", {
              href: url,
              attr: {
                download: `Anki_Chinese_Vocabulary_${new Date().toISOString().slice(0, 10)}.tsv`,
              },
            });
            link.click();
            URL.revokeObjectURL(url);
            new Notice(`Exported ${items.length} words to TSV!`);
          })
      );

    new Setting(containerEl)
      .setName(t("settings.pleco_export"))
      .setDesc(t("settings.pleco_export_desc"))
      .addButton((btn) =>
        btn
          .setButtonText(t("settings.pleco_export_btn"))
          .onClick(() => {
            const items = this.plugin.vocabulary.getItems();
            if (items.length === 0) {
              new Notice("Словарик пуст! Сначала добавьте слова звёздочкой ⭐.");
              return;
            }
            const txt = generatePlecoFlashcards(items);
            const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = createEl("a", {
              href: url,
              attr: {
                download: `Pleco_Chinese_Vocabulary_${new Date().toISOString().slice(0, 10)}.txt`,
              },
            });
            link.click();
            URL.revokeObjectURL(url);
            new Notice(`Exported ${items.length} words for Pleco!`);
          })
      );

    new Setting(containerEl)
      .setName(t("settings.worksheets"))
      .setDesc(t("settings.worksheets_desc"))
      .addButton((btn) =>
        btn
          .setButtonText(t("settings.worksheets_btn"))
          .onClick(() => {
            const items = this.plugin.vocabulary.getItems();
            if (items.length === 0) {
              new Notice("Словарик пуст! Сначала добавьте слова звёздочкой ⭐.");
              return;
            }
            new WorksheetModal(this.app, items).open();
          })
      );

    // ==========================================
    // 8. РУБИ-РАЗМЕТКА (RUBY / FURIGANA)
    // ==========================================
    new Setting(containerEl)
      .setName(t("settings.ruby_heading"))
      .setHeading();

    new Setting(containerEl)
      .setName(t("settings.ruby_dialect"))
      .setDesc(t("settings.ruby_dialect_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("pinyin", t("settings.ruby_pinyin"))
          .addOption("jyutping", t("settings.ruby_jyutping"))
          .setValue(this.plugin.settings.rubyDialect)
          .onChange(async (val) => {
            this.plugin.settings.rubyDialect = val as "pinyin" | "jyutping";
            await this.plugin.saveSettings();
          })
      );

    // ==========================================
    // СБРОС НАСТРОЕК
    // ==========================================
    containerEl.createDiv({ cls: "ch-dict-settings-spacer" });

    new Setting(containerEl)
      .setName(t("settings.reset_title"))
      .setDesc(t("settings.reset_desc"))
      .addButton((btn) =>
        btn
          .setButtonText(t("settings.reset_btn"))
          .setClass("mod-warning")
          .onClick(async () => {
            this.plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as ChineseDictSettings;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
            this.renderSettings();
          })
      );

    // ==========================================
    // 9. FREE CHINESE COURSES BY AUTHOR (YOUTUBE)
    // ==========================================
    containerEl.createDiv({ cls: "ch-dict-settings-spacer" });

    new Setting(containerEl)
      .setName(t("settings.courses_heading"))
      .setHeading();

    const aboutBox = containerEl.createDiv({ cls: "ch-dict-about-box" });
    aboutBox.createEl("p", {
      text: t("settings.courses_desc"),
    });

    const channelRow = aboutBox.createDiv({ cls: "ch-dict-channels-row" });

    // English YouTube Channel
    const engCard = channelRow.createEl("a", {
      cls: "ch-dict-channel-card",
      href: "https://www.youtube.com/@ChineseWithKantulaev",
    });
    engCard.setAttribute("target", "_blank");
    engCard.setAttribute("rel", "noopener noreferrer");
    engCard.createSpan({ cls: "ch-dict-channel-icon", text: "🇬🇧" });
    const engInfo = engCard.createDiv({ cls: "ch-dict-channel-info" });
    engInfo.createSpan({ cls: "ch-dict-channel-title", text: t("settings.courses_channel_eng") });
    engInfo.createSpan({ cls: "ch-dict-channel-sub", text: t("settings.courses_channel_eng_sub") });

    // Russian YouTube Channel
    const ruCard = channelRow.createEl("a", {
      cls: "ch-dict-channel-card",
      href: "https://www.youtube.com/@kantulaevCN",
    });
    ruCard.setAttribute("target", "_blank");
    ruCard.setAttribute("rel", "noopener noreferrer");
    ruCard.createSpan({ cls: "ch-dict-channel-icon", text: "🇷🇺" });
    const ruInfo = ruCard.createDiv({ cls: "ch-dict-channel-info" });
    ruInfo.createSpan({ cls: "ch-dict-channel-title", text: t("settings.courses_channel_ru") });
    ruInfo.createSpan({ cls: "ch-dict-channel-sub", text: t("settings.courses_channel_ru_sub") });
  }

  private async renderDictPacksCards(containerEl: HTMLElement): Promise<void> {
    containerEl.empty();
    const activePack = this.plugin.settings.activeDictPack || "en";

    for (const pack of DICT_PACKS) {
      const isInstalled = await this.plugin.dictionary.isPackInstalled(pack.id);
      const isActive = activePack === pack.id;

      const card = containerEl.createDiv({ cls: "ch-dict-pack-card" });
      if (isActive) card.addClass("is-active-pack");
      if (isInstalled) card.addClass("is-installed");

      // Left: Flag & Details
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

      // Right: Actions (Download / Activate / Delete)
      const actions = card.createDiv({ cls: "ch-dict-pack-actions" });

      if (isInstalled) {
        if (!isActive) {
          const activateBtn = actions.createEl("button", {
            cls: "mod-cta ch-dict-pack-btn",
            text: t("settings.dict_activate"),
          });
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

        const deleteBtn = actions.createEl("button", {
          cls: "ch-dict-pack-btn ch-dict-pack-btn-delete",
          text: t("settings.dict_delete"),
        });
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
        const downloadBtn = actions.createEl("button", {
          cls: "ch-dict-pack-btn ch-dict-pack-btn-download",
          text: `📥 ${t("settings.dict_download")}`,
        });
        downloadBtn.addEventListener("click", () => {
          void (async () => {
            downloadBtn.setText(`⏳ ${t("settings.dict_downloading")}`);
            downloadBtn.setAttribute("disabled", "true");
            const ok = await this.plugin.dictionary.downloadPack(pack.id);
            if (ok) {
              if (!this.plugin.settings.installedDictPacks) {
                this.plugin.settings.installedDictPacks = ["en"];
              }
              if (!this.plugin.settings.installedDictPacks.includes(pack.id)) {
                this.plugin.settings.installedDictPacks.push(pack.id);
              }
              this.plugin.settings.activeDictPack = pack.id;
              this.plugin.settings.translationLanguage = pack.id;
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
