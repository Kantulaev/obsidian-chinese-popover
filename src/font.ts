/**
 * Chinese Font Customization for Obsidian
 * Supports official HSK Exam font (KaiTi / 楷体), SongTi, HeiTi, FangSong, and Custom fonts.
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

export const CHINESE_FONT_STACKS: Record<ChineseFontPreset, string> = {
  default: "inherit",
  kaiti: '"KaiTi", "楷体", "STKaiti", "DFKai-SB", "BiauKai", "Noto Serif SC", serif',
  songti: '"SimSun", "宋体", "Songti SC", "STSong", "Noto Serif SC", serif',
  heiti: '"PingFang SC", "Microsoft YaHei", "微软雅黑", "Heiti SC", "SimHei", sans-serif',
  fangsong: '"FangSong", "仿宋", "STFangsong", serif',
  wenkai: '"LXGW WenKai", "LXGW WenKai Screen", "KaiTi", "STKaiti", serif',
  custom: "inherit",
};

/**
 * Resolves the CSS font-family string based on preset and custom font name
 */
export function resolveChineseFontFamily(
  preset: ChineseFontPreset,
  customFont?: string
): string {
  if (preset === "custom" && customFont && customFont.trim().length > 0) {
    const trimmed = customFont.trim();
    return `"${trimmed}", "KaiTi", "STKaiti", "Noto Serif SC", sans-serif`;
  }
  return CHINESE_FONT_STACKS[preset] || "inherit";
}

/**
 * Applies dynamic CSS variables and classes to the document body/workspace
 */
export function applyChineseFontToDOM(
  preset: ChineseFontPreset,
  scope: ChineseFontScope,
  customFont?: string
): void {
  const fontStack = resolveChineseFontFamily(preset, customFont);
  const root = document.documentElement;

  // Set CSS property for popover & vocabulary components
  root.style.setProperty("--ch-dict-font-hanzi-family", fontStack);

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
