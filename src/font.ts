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

export const CHINESE_FONT_SHORT_LABELS: Record<ChineseFontPreset, string> = {
  default: "Обычный",
  kaiti: "楷体 KaiTi",
  songti: "宋体 SongTi",
  heiti: "黑体 HeiTi",
  fangsong: "仿宋 FangSong",
  wenkai: "文楷 WenKai",
  custom: "Свой шрифт",
};

export const CHINESE_FONT_MENU_ITEMS: Array<{ id: ChineseFontPreset; label: string }> = [
  { id: "default", label: "По умолчанию (шрифт темы)" },
  { id: "kaiti", label: "KaiTi (楷体) — Экзамен HSK" },
  { id: "songti", label: "SongTi (宋体) — Классический" },
  { id: "heiti", label: "HeiTi (黑体) — Без засечек" },
  { id: "fangsong", label: "FangSong (仿宋) — Учебный" },
  { id: "wenkai", label: "LXGW WenKai (霞鹜文楷)" },
  { id: "custom", label: "Свой шрифт" },
];

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
  customFont?: string,
  readerMode: boolean = false,
  readerFontScale: number = 100
): void {
  // Remove any legacy dynamic @font-face style tag if present
  document.getElementById("ch-dict-cjk-font-style")?.remove();

  const fontStack = resolveChineseFontFamily(preset, customFont);
  const clampedScale = Math.min(220, Math.max(80, Math.round(readerFontScale || 100)));
  const body = document.body;

  // Set CSS property on body for popover, vocabulary & .ch-dict-hanzi-run spans
  body.setCssProps({
    "--ch-dict-font-hanzi-family": fontStack,
    "--ch-dict-reader-hanzi-scale": readerMode ? String(clampedScale / 100) : "1",
  });

  body.classList.remove(
    "ch-dict-font-entire-editor",
    "ch-dict-reader-active",
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

  if (readerMode) {
    body.classList.add("ch-dict-reader-active");
  }
}
