import { LanguageMeta, SupportedLanguage } from "./types.ts";
import { LOCALES } from "./locales.ts";

export * from "./types.ts";
export * from "./locales.ts";

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "zh-CN", name: "Simplified Chinese", nativeName: "简体中文", flag: "🇨🇳" },
  { code: "zh-TW", name: "Traditional Chinese", nativeName: "繁體中文", flag: "🇹🇼" },
];

/**
 * Automatically detects the current Obsidian application locale.
 */
export function detectObsidianLocale(): SupportedLanguage {
  const momentLocale = (globalThis as unknown as { moment?: { locale?: () => string } }).moment?.locale?.() || "";
  const navLang = (typeof navigator !== "undefined" ? navigator.language : "").toLowerCase();
  const raw = (momentLocale || navLang || "en").toLowerCase();

  if (raw === "zh-tw" || raw === "zh-hk" || raw.includes("hant")) return "zh-TW";
  if (raw.startsWith("zh")) return "zh-CN";
  if (raw.startsWith("ru")) return "ru";
  if (raw.startsWith("de")) return "de";
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("es")) return "es";
  if (raw.startsWith("ja")) return "ja";
  if (raw.startsWith("ko")) return "ko";
  if (raw.startsWith("vi")) return "vi";
  if (raw.startsWith("it")) return "it";
  if (raw.startsWith("pt")) return "pt";
  if (raw.startsWith("id")) return "id";
  if (raw.startsWith("th")) return "th";
  if (raw.startsWith("ar")) return "ar";
  if (raw.startsWith("tr")) return "tr";
  if (raw.startsWith("pl")) return "pl";
  if (raw.startsWith("nl")) return "nl";
  if (raw.startsWith("uk")) return "uk";
  if (raw.startsWith("hi")) return "hi";

  return "en";
}

let currentActiveLanguage: SupportedLanguage = "en";

export function setActiveLanguage(lang: string): void {
  if (lang === "auto" || !lang) {
    currentActiveLanguage = detectObsidianLocale();
  } else if (lang in LOCALES) {
    currentActiveLanguage = lang as SupportedLanguage;
  } else {
    currentActiveLanguage = "en";
  }
}

export function getActiveLanguage(): SupportedLanguage {
  return currentActiveLanguage;
}

/**
 * Resolves a dot-notated translation key like 'tooltip.copy' or 'pos.verb'.
 * Falls back to English if the key is missing in the chosen locale.
 */
export function t(key: string, langOverride?: string): string {
  const lang = (langOverride && langOverride !== "auto" && langOverride in LOCALES)
    ? (langOverride as SupportedLanguage)
    : currentActiveLanguage;

  const bundle = LOCALES[lang] || LOCALES.en;
  const enBundle = LOCALES.en;

  const parts = key.split(".");
  let cur: unknown = bundle;
  for (const part of parts) {
    if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      cur = undefined;
      break;
    }
  }

  if (typeof cur === "string") return cur;

  // Fallback to English
  let enCur: unknown = enBundle;
  for (const part of parts) {
    if (enCur && typeof enCur === "object" && part in (enCur as Record<string, unknown>)) {
      enCur = (enCur as Record<string, unknown>)[part];
    } else {
      enCur = undefined;
      break;
    }
  }

  return typeof enCur === "string" ? enCur : key;
}
