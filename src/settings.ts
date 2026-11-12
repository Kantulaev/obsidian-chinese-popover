import { App, PluginSettingTab, Setting } from "obsidian";
import type ChineseHoverDictPlugin from "./main.ts";

export type ChineseDialect = "cantonese" | "mandarin";
export type TriggerMode = "dblclick" | "hover_modifier" | "hover" | "command_only";
export type ModifierKey = "Alt" | "Shift" | "Control" | "Meta";
export type PhoneticDisplay = "both" | "pinyin" | "jyutping" | "dialect_auto";
export type PopoverTheme = "auto" | "glass_dark" | "glass_light" | "solid";
export type TextColorPreset = "white" | "cyan" | "gold" | "obsidian";
export type TraditionalSeparator = " - " | " / " | " · " | " () ";
export type AudioEngine = "google_neural" | "web_speech";

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

  // Personal Vocabulary Notebook
  vocabularyFilePath: string;
  autoSaveContextSentence: boolean;
  practiceMode: boolean;
  vocabularySort: "date_desc" | "date_asc" | "alpha";

  // Smart Chinese Word Splitting & Selection
  smartWordSelection: boolean;
}

export const DEFAULT_SETTINGS: ChineseDictSettings = {
  enabled: true,

  triggerMode: "dblclick",
  hoverModifierKey: "Alt",
  hoverDelayMs: 300,

  dialect: "cantonese",
  speechSpeed: 0.8,
  audioEngine: "google_neural",
  autoPlayAudio: false,

  phoneticDisplay: "both",
  showAccentedPinyin: true,
  showTraditional: true,
  traditionalSeparator: " - ",
  maxDefinitions: 3,
  showActionButtons: true,

  theme: "auto",
  popoverWidth: 330,
  popoverHeight: 165,
  blurIntensity: 34,
  textColorPreset: "white",
  fontSizeHanzi: 19,
  fontSizePinyin: 22,
  fontSizeTranslation: 15,

  maxWordLength: 6,

  vocabularyFilePath: "Chinese Vocabulary.md",
  autoSaveContextSentence: true,
  practiceMode: false,
  vocabularySort: "date_desc",

  smartWordSelection: true,
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

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // --- QUICK HOTKEY HELPER ---
    new Setting(containerEl)
      .setName("⌨️ Сочетания клавиш / Hotkeys")
      .setDesc("Все ключевые действия (поиск слова под курсором, озвучка, копирование, переключение диалекта) можно назначить на любые горячие клавиши в настройках Obsidian.")
      .addButton((btn) =>
        btn
          .setButtonText("Открыть Hotkeys в Obsidian")
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
    // 1. АКТИВАЦИЯ И ТРИГГЕРЫ
    // ==========================================
    new Setting(containerEl)
      .setName("🚀 Способ активации / Activation & Triggers")
      .setHeading();

    new Setting(containerEl)
      .setName("Включить словарь / Enable Dictionary")
      .setDesc("Главный переключатель работы плагина.")
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
      .setName("Способ вызова окна / Trigger Mode")
      .setDesc("Какое действие открывает всплывающее окно со словом.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("dblclick", "Двойной клик мыши / Double Click (по умолчанию)")
          .addOption("hover_modifier", "Наведение с зажатой клавишей / Hover + Modifier")
          .addOption("hover", "Наведение мыши / Hover Always")
          .addOption("command_only", "Только горячие клавиши / Hotkeys & Commands only")
          .setValue(this.plugin.settings.triggerMode)
          .onChange(async (value) => {
            this.plugin.settings.triggerMode = value as TriggerMode;
            await this.plugin.saveSettings();
            this.display(); // Refresh to show/hide relevant modifier options
          })
      );

    new Setting(containerEl)
      .setName("Умное выделение китайских слов / Smart Word Selection")
      .setDesc("При двойном клике автоматически выделяет в редакторе китайское слово целиком (вместо одного иероглифа или всего предложения), используя CEDICT и встроенный Intl.Segmenter.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.smartWordSelection)
          .onChange(async (value) => {
            this.plugin.settings.smartWordSelection = value;
            await this.plugin.saveSettings();
          })
      );

    if (this.plugin.settings.triggerMode === "hover_modifier") {
      new Setting(containerEl)
        .setName("Клавиша-модификатор для наведения / Modifier Key")
        .setDesc("Зажмите эту клавишу и наведите курсор на китайское слово.")
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
        .setName("Задержка наведения / Hover Delay")
        .setDesc("Время удержания курсора на слове перед показом карточки (в миллисекундах).")
        .addSlider((slider) =>
          slider
            .setLimits(100, 800, 50)
            .setValue(this.plugin.settings.hoverDelayMs)
            .setDynamicTooltip()
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
      .setName("🗣️ Озвучка и произношение / Voice & Audio")
      .setHeading();

    new Setting(containerEl)
      .setName("Диалект произношения / Pronunciation Dialect")
      .setDesc("Выберите диалект для озвучки: Кантонский (Гуандунхуа) или Мандарин (Путунхуа).")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("cantonese", "Гуандунхуа / Кантонский (廣東話 / zh-yue)")
          .addOption("mandarin", "Путунхуа / Мандарин (普通话 / zh-CN)")
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
      .setName("Движок озвучки / Audio Engine")
      .setDesc("Google HD Neural обеспечивает естественное звучание онлайн. Web Speech API работает офлайн через систему.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("google_neural", "Google HD Neural (Онлайн, высокое качество)")
          .addOption("web_speech", "Web Speech API (Офлайн, системный голос)")
          .setValue(this.plugin.settings.audioEngine)
          .onChange(async (value) => {
            this.plugin.settings.audioEngine = value as AudioEngine;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Скорость речи / Speech Speed")
      .setDesc("Скорость воспроизведения озвучки (по умолчанию 0.8x для лучшей разборчивости тонов).")
      .addSlider((slider) =>
        slider
          .setLimits(0.5, 1.4, 0.05)
          .setValue(this.plugin.settings.speechSpeed)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.speechSpeed = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Автоматическая озвучка при открытии / Auto-play Audio")
      .setDesc("Автоматически воспроизводить произношение сразу при открытии карточки слова.")
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
      .setName("🀄 Фонетика и иероглифы / Phonetics & Hanzi")
      .setHeading();

    new Setting(containerEl)
      .setName("Режим отображения фонетики / Phonetics Display")
      .setDesc("Как отображать транскрипцию в заголовке карточки.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("both", "И пиньинь, и ютпинг (Pinyin / Jyutping)")
          .addOption("pinyin", "Только пиньинь (Pinyin only)")
          .addOption("jyutping", "Только ютпинг (Jyutping only)")
          .addOption("dialect_auto", "Авто по диалекту (Кантонский: оба / Путунхуа: пиньинь)")
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
      .setName("Диакритические знаки тонов / Accented Pinyin")
      .setDesc("Отображать тоны в пиньине знаками над гласными (nǐ hǎo), а не цифрами (ni3 hao3).")
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
      .setName("Показывать традиционные иероглифы / Show Traditional")
      .setDesc("Отображать традиционную форму справа в том же размере (если отличается от упрощенной).")
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
      .setName("Разделитель иероглифов / Traditional Separator")
      .setDesc("Символ разделения между упрощенным и традиционным написанием.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption(" - ", "Тире: ' - ' (学 - 學)")
          .addOption(" / ", "Слэш: ' / ' (学 / 學)")
          .addOption(" · ", "Точка: ' · ' (学 · 學)")
          .addOption(" () ", "В скобках: ' ( )' (学 (學))")
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
      .setName("Количество слов перевода / Max Definitions")
      .setDesc("Сколько кратких значений перевода показывать в карточке (от 1 до 5).")
      .addSlider((slider) =>
        slider
          .setLimits(1, 5, 1)
          .setValue(this.plugin.settings.maxDefinitions)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.maxDefinitions = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName("Показывать кнопки действий / Show Action Buttons")
      .setDesc("Отображать круглые кнопки озвучки 🔊 и копирования 📋 в правом верхнем углу.")
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

    // ==========================================
    // 4. ВНЕШНИЙ ВИД И СТИЛЬ LIQUID GLASS
    // ==========================================
    new Setting(containerEl)
      .setName("🎨 Внешний вид и стиль Liquid Glass / Appearance")
      .setHeading();

    new Setting(containerEl)
      .setName("Стиль темы / Popover Theme")
      .setDesc("Визуальный стиль карточки словаря.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("auto", "Авто (соответствует теме Obsidian)")
          .addOption("glass_dark", "Liquid Glass Dark (Глубокое матовое стекло)")
          .addOption("glass_light", "Liquid Glass Light (Светлое матовое стекло)")
          .addOption("solid", "Solid Minimalist (Непрозрачный без размытия)")
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
      .setName("Цветовой акцент текста / Text Color Preset")
      .setDesc("Цветовой акцент для фонетического заголовка (пиньинь / ютпинг).")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("white", "Чистый белый / Pure White (по умолчанию)")
          .addOption("cyan", "Неоновый лазурный / Cyan Glow")
          .addOption("gold", "Теплый золотой / Warm Gold")
          .addOption("obsidian", "Цвет акцента темы Obsidian")
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
      .setName("Ширина карточки / Popover Width")
      .setDesc("Фиксированная ширина всплывающего окна в пикселях (по умолчанию 330px).")
      .addSlider((slider) =>
        slider
          .setLimits(260, 460, 10)
          .setValue(this.plugin.settings.popoverWidth)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.popoverWidth = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName("Высота карточки / Popover Height")
      .setDesc("Фиксированная высота всплывающего окна в пикселях (по умолчанию 165px).")
      .addSlider((slider) =>
        slider
          .setLimits(130, 250, 5)
          .setValue(this.plugin.settings.popoverHeight)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.popoverHeight = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName("Интенсивность размытия / Blur Intensity")
      .setDesc("Сила эффекта матового стекла backdrop-filter blur (в пикселях, по умолчанию 34px).")
      .addSlider((slider) =>
        slider
          .setLimits(0, 60, 2)
          .setValue(this.plugin.settings.blurIntensity)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.blurIntensity = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName("Размер шрифта иероглифов / Hanzi Font Size")
      .setDesc("Размер китайских символов в верхней плашке (по умолчанию 19px).")
      .addSlider((slider) =>
        slider
          .setLimits(14, 28, 1)
          .setValue(this.plugin.settings.fontSizeHanzi)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.fontSizeHanzi = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName("Размер шрифта фонетики / Pinyin Font Size")
      .setDesc("Размер пиньиня и ютпинга в центральном блоке (по умолчанию 22px).")
      .addSlider((slider) =>
        slider
          .setLimits(16, 32, 1)
          .setValue(this.plugin.settings.fontSizePinyin)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.fontSizePinyin = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName("Размер шрифта перевода / Translation Font Size")
      .setDesc("Размер текста перевода в нижней части карточки (по умолчанию 15px).")
      .addSlider((slider) =>
        slider
          .setLimits(12, 22, 1)
          .setValue(this.plugin.settings.fontSizeTranslation)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.fontSizeTranslation = value;
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
          })
      );

    // ==========================================
    // 5. ПАРАМЕТРЫ СЛОВАРЯ
    // ==========================================
    new Setting(containerEl)
      .setName("🔍 Параметры словаря / Dictionary")
      .setHeading();

    const isFull = this.plugin.dictionary?.isFullDictionaryLoaded?.() ?? false;
    new Setting(containerEl)
      .setName("База данных словаря / Dictionary Database")
      .setDesc(
        isFull
          ? "✅ Полный словарь загружен и готов к работе (CC-CEDICT + 104k Jyutping)."
          : "⚠️ Используется базовый демо-словарь. Вы можете скачать полную базу данных (42 MB) или поместить cedict.json в папку плагина."
      )
      .addButton((btn) => {
        btn.setButtonText(isFull ? "Перезагрузить словарь" : "Скачать словарь (42 MB)");
        if (!isFull) {
          btn.setCta();
        }
        btn.onClick(async () => {
          btn.setDisabled(true);
          btn.setButtonText("Загрузка...");
          await this.plugin.dictionary.downloadDictionary();
          btn.setDisabled(false);
          this.display();
        });
      });

    new Setting(containerEl)
      .setName("Максимальная длина слова / Max Word Length")
      .setDesc("Максимальное количество символов для поиска составных идиом (чэнъюй) и фраз (по умолчанию 6).")
      .addSlider((slider) =>
        slider
          .setLimits(2, 10, 1)
          .setValue(this.plugin.settings.maxWordLength)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.maxWordLength = value;
            await this.plugin.saveSettings();
          })
      );

    // ==========================================
    // 6. ЛИЧНЫЙ СЛОВАРИК
    // ==========================================
    new Setting(containerEl)
      .setName("📖 Личный словарик / Personal Vocabulary")
      .setHeading();

    new Setting(containerEl)
      .setName("Путь к файлу словарика / Vocabulary Markdown File")
      .setDesc("Файл в вашем хранилище, в который бессрочно сохраняются все добавленные слова.")
      .addText((text) =>
        text
          .setPlaceholder("Chinese Vocabulary.md")
          .setValue(this.plugin.settings.vocabularyFilePath)
          .onChange(async (value) => {
            this.plugin.settings.vocabularyFilePath = value.trim() || "Chinese Vocabulary.md";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Сохранять контекстное предложение / Save Context Sentence")
      .setDesc("Автоматически сохранять предложение, из которого вы добавили слово, для лучшего запоминания контекста.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoSaveContextSentence)
          .onChange(async (value) => {
            this.plugin.settings.autoSaveContextSentence = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Открыть словарик в боковой панели / Open in Sidebar")
      .setDesc("Открыть интерактивную панель словарика в правой боковой панели Obsidian.")
      .addButton((btn) =>
        btn
          .setButtonText("Открыть панель")
          .setCta()
          .onClick(() => {
            this.plugin.activateVocabularyView();
          })
      );

    // ==========================================
    // СБРОС НАСТРОЕК
    // ==========================================
    containerEl.createDiv({ cls: "ch-dict-settings-spacer" });

    new Setting(containerEl)
      .setName("Сбросить настройки / Reset to Defaults")
      .setDesc("Вернуть все параметры к первоначальным рекомендуемым настройкам.")
      .addButton((btn) =>
        btn
          .setButtonText("Сбросить всё")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
            await this.plugin.saveSettings();
            if (this.plugin.tooltip.getIsOpen()) {
              this.plugin.tooltip.refresh(this.plugin.settings);
            }
            this.display();
          })
      );
  }
}
