/**
 * Types and interfaces for Chinese Popover Dictionary internationalization (i18n).
 * Covers 20 major world languages of Chinese learners.
 */

export type SupportedLanguage =
  | "en"    // English
  | "ru"    // Русский
  | "de"    // Deutsch
  | "fr"    // Français
  | "es"    // Español
  | "ja"    // 日本語
  | "ko"    // 한국어
  | "vi"    // Tiếng Việt
  | "it"    // Italiano
  | "pt"    // Português
  | "id"    // Bahasa Indonesia
  | "th"    // ไทย
  | "ar"    // العربية
  | "tr"    // Türkçe
  | "pl"    // Polski
  | "nl"    // Nederlands
  | "uk"    // Українська
  | "hi"    // हिन्दी
  | "zh-CN" // 简体中文
  | "zh-TW"; // 繁體中文

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export interface I18nBundle {
  langName: string;
  tooltip: {
    copy: string;
    copied: string;
    copy_hint: string;
    star: string;
    starred: string;
    star_add_hint: string;
    star_remove_hint: string;
    pin: string;
    unpin: string;
    pin_hint: string;
    unpin_hint: string;
    note: string;
    note_hint: string;
    strokes: string;
    strokes_hint: string;
    close: string;
    close_hint: string;
    audio_hint: string;
    audio?: string;
    examples: string;
    examples_title: string;
    examples_hint?: string;
    examples_loading: string;
    examples_empty: string;
    examples_error: string;
    listen_example?: string;
    decomp_hint: string;
    radical: string;
    components: string;
    basic_char: string;
    strokes_count: string;
    hsk_badge: string;
    drag_hint: string;
    details?: string;
    details_hint?: string;
    all_definitions?: string;
    pos?: string;
    no_def?: string;
  };
  pos: {
    noun: string;
    verb: string;
    adjective: string;
    adverb: string;
    pronoun: string;
    classifier: string;
    preposition: string;
    conjunction: string;
    particle: string;
    numeral: string;
    interjection: string;
    idiom: string;
    other: string;
  };
  chengyu: {
    title: string;
    literal: string;
    figurative: string;
  };
  vocab: {
    title: string;
    count_badge: string;
    search_placeholder: string;
    spotlight?: string;
    more_actions?: string;
    tab_saved?: string;
    tab_history?: string;
    mode_list?: string;
    mode_cards?: string;
    export_anki: string;
    export_csv: string;
    export_pleco?: string;
    filter_all: string;
    sort_date: string;
    sort_pinyin: string;
    sort_hsk: string;
    empty_title: string;
    empty_desc: string;
    empty_search?: string;
    empty_search_desc?: string;
    empty_due?: string;
    empty_due_desc?: string;
    delete_word: string;
  };
  settings: {
    ui_language: string;
    ui_language_desc: string;
    ui_language_auto: string;
    dict_packs_title: string;
    dict_packs_desc: string;
    dict_download: string;
    dict_downloading: string;
    dict_installed: string;
    dict_delete: string;
    dict_active: string;
    dict_activate: string;
    dict_entries: string;
    trans_lang: string;
    trans_lang_desc: string;
    trans_lang_auto: string;
    trans_lang_both: string;
    font_family: string;
    font_size: string;
    speech_speed: string;
    theme: string;
  };
  notices: {
    copied: string;
    copy_failed: string;
    anki_added: string;
    anki_failed: string;
    dict_download_started: string;
    dict_download_success: string;
    dict_download_failed: string;
    dict_deleted: string;
    dict_activated: string;
  };
}
