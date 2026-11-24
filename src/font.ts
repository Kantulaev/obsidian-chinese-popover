/**
 * Chinese Font Customization for Obsidian
 * Supports official HSK Exam font (KaiTi / 楷体), SongTi, HeiTi, FangSong, and Custom fonts.
 * Uses CSS @font-face with strict CJK unicode-range so Russian, English, and all other scripts
 * remain untouched in Obsidian's native default font.
 */

export type ChineseFontPreset =
  | "default"
  | "kaiti"     // HSK Exam & Standard Textbook Font (楷体)
  | "songti"    // Classic Serif (宋体 / SimSun)
  | "heiti"     // Clean Modern Sans-Serif (黑体 / PingFang / YaHei)
  | "fangsong"  // Academic & Official Document (仿宋)
  | "wenkai"    // LXGW WenKai Open Source Calligraphy (霞鹜文楷)
  | "custom";

export type ChineseFontScope = "popover_and_sidebar" | "entire_editor";

const CJK_UNICODE_RANGE =
  "U+4E00-9FFF, U+3400-4DBF, U+20000-2A6DF, U+2A700-2B73F, U+2B740-2B81F, U+2B820-2CEAF, U+F900-FAFF, U+2F00-2FDF, U+2E80-2EFF";

const CHINESE_LOCAL_FONTS: Record<ChineseFontPreset, string[]> = {
  default: [],
  kaiti: ["KaiTi", "楷体", "STKaiti", "DFKai-SB", "BiauKai", "Noto Serif SC"],
  songti: ["SimSun", "宋体", "Songti SC", "STSong", "Noto Serif SC"],
  heiti: ["PingFang SC", "Microsoft YaHei", "微软雅黑", "Heiti SC", "SimHei"],
  fangsong: ["FangSong", "仿宋", "STFangsong"],
  wenkai: ["LXGW WenKai", "LXGW WenKai Screen", "KaiTi", "STKaiti"],
  custom: [],
};

export const CHINESE_FONT_STACKS: Record<ChineseFontPreset, string> = {
  default: "inherit",
  kaiti: '"ChDictHanziOnly", var(--font-text, inherit)',
  songti: '"ChDictHanziOnly", var(--font-text, inherit)',
  heiti: '"ChDictHanziOnly", var(--font-text, inherit)',
  fangsong: '"ChDictHanziOnly", var(--font-text, inherit)',
  wenkai: '"ChDictHanziOnly", var(--font-text, inherit)',
  custom: '"ChDictHanziOnly", var(--font-text, inherit)',
};

const FONT_STYLE_EL_ID = "ch-dict-cjk-font-style";

/**
 * Injects or updates the @font-face rule restricted strictly to CJK Chinese characters.
 * Ensures Russian, English, numbers, and punctuation always use Obsidian's native font.
 */
function updateCjkFontFaceRule(preset: ChineseFontPreset, customFont?: string): void {
  let styleEl = document.getElementById(FONT_STYLE_EL_ID) as HTMLStyleElement | null;

  if (preset === "default") {
    if (styleEl) styleEl.textContent = "";
    return;
  }

  let fontNames = CHINESE_LOCAL_FONTS[preset] || [];
  if (preset === "custom" && customFont && customFont.trim().length > 0) {
    const trimmed = customFont.trim().replace(/"/g, "");
    fontNames = [trimmed, "KaiTi", "STKaiti", "Noto Serif SC"];
  }

  if (fontNames.length === 0) {
    if (styleEl) styleEl.textContent = "";
    return;
  }

  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = FONT_STYLE_EL_ID;
    document.head.appendChild(styleEl);
  }

  const srcList = fontNames.map((name) => `local("${name}")`).join(", ");
  styleEl.textContent = `
@font-face {
  font-family: "ChDictHanziOnly";
  src: ${srcList};
  font-weight: 100 900;
  font-display: swap;
  unicode-range: ${CJK_UNICODE_RANGE};
}
`;
}

/**
 * Resolves the CSS font-family string based on preset and custom font name
 */
export function resolveChineseFontFamily(
  preset: ChineseFontPreset,
  customFont?: string
): string {
  if (preset === "default") return "inherit";
  if (preset === "custom" && (!customFont || !customFont.trim())) {
    return "inherit";
  }
  return '"ChDictHanziOnly", var(--font-text, var(--default-font, inherit))';
}

/**
 * Applies dynamic CSS variables and classes to the document body/workspace
 */
export function applyChineseFontToDOM(
  preset: ChineseFontPreset,
  scope: ChineseFontScope,
  customFont?: string
): void {
  updateCjkFontFaceRule(preset, customFont);
  const fontStack = resolveChineseFontFamily(preset, customFont);
  const root = document.documentElement;

  // Set CSS property for popover, vocabulary & editor components
  root.setCssProps({ "--ch-dict-font-hanzi-family": fontStack });

  const body = document.body;
  body.classList.remove(
    "ch-dict-font-entire-editor",
    "ch-dict-font-kaiti",
    "ch-dict-font-songti",
    "ch-dict-font-heiti",
    "ch-dict-font-fangsong",
    "ch-dict-font-wenkai"
  );

  if (preset !== "default") {
    body.classList.add(`ch-dict-font-${preset}`);
  }

  if (scope === "entire_editor" && preset !== "default") {
    body.classList.add("ch-dict-font-entire-editor");
  }
}
