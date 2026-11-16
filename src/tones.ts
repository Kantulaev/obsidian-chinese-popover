/**
 * Chinese Tone Color Coding (Pleco / Hanping style)
 * Maps Pinyin & Jyutping tone levels (1-5/6) to distinct colors.
 */

export interface ToneColors {
  1: string; // Tone 1 (ˉ) - Red
  2: string; // Tone 2 (ˊ) - Green
  3: string; // Tone 3 (ˇ) - Blue
  4: string; // Tone 4 (ˋ) - Purple
  5: string; // Tone 5 (neutral) - Gray
}

export const DEFAULT_TONE_COLORS: ToneColors = {
  1: "#ef4444", // Red (High flat)
  2: "#10b981", // Green (Rising)
  3: "#3b82f6", // Blue (Dipping)
  4: "#a855f7", // Purple (Falling)
  5: "#94a3b8", // Slate / Gray (Neutral)
};

const PINYIN_TONE_DIACRITICS: Record<string, number> = {
  // 1st Tone
  "ā": 1, "ē": 1, "ī": 1, "ō": 1, "ū": 1, "ǖ": 1,
  "Ā": 1, "Ē": 1, "Ī": 1, "Ō": 1, "Ū": 1, "Ǖ": 1,
  // 2nd Tone
  "á": 2, "é": 2, "í": 2, "ó": 2, "ú": 2, "ǘ": 2,
  "Á": 2, "É": 2, "Í": 2, "Ó": 2, "Ú": 2, "Ǘ": 2,
  // 3rd Tone
  "ǎ": 3, "ě": 3, "ǐ": 3, "ǒ": 3, "ǔ": 3, "ǚ": 3,
  "Ǎ": 3, "Ě": 3, "Ǐ": 3, "Ǒ": 3, "Ǔ": 3, "Ǚ": 3,
  // 4th Tone
  "à": 4, "è": 4, "ì": 4, "ò": 4, "ù": 4, "ǜ": 4,
  "À": 4, "È": 4, "Ì": 4, "Ò": 4, "Ù": 4, "Ǜ": 4,
};

/**
 * Extracts the tone number (1-5) from an accented or numbered pinyin syllable
 */
export function detectPinyinTone(syllable: string): number {
  if (!syllable) return 5;

  // Numbered pinyin (e.g. hao3, ma5)
  const numMatch = syllable.match(/[1-5]$/);
  if (numMatch) {
    return parseInt(numMatch[0], 10);
  }

  // Accented pinyin
  for (const char of syllable) {
    if (PINYIN_TONE_DIACRITICS[char]) {
      return PINYIN_TONE_DIACRITICS[char];
    }
  }

  return 5; // Neutral
}

/**
 * Detects tone number (1-6) from a Jyutping syllable (e.g. nei5 -> 5)
 */
export function detectJyutpingTone(syllable: string): number {
  const numMatch = syllable.match(/[1-6]$/);
  if (numMatch) {
    const tone = parseInt(numMatch[0], 10);
    // Map Jyutping 6 tones to palette
    if (tone === 6) return 4;
    return tone;
  }
  return 5;
}

/**
 * Returns color string for a tone number
 */
export function getToneColor(tone: number, customColors?: Partial<ToneColors>): string {
  const t = Math.min(Math.max(tone, 1), 5) as keyof ToneColors;
  return customColors?.[t] || DEFAULT_TONE_COLORS[t] || "#94a3b8";
}

/**
 * Formats a pinyin string with tone coloring HTML spans
 */
export function colorizePinyin(
  pinyin: string,
  enabled: boolean,
  customColors?: Partial<ToneColors>
): string {
  if (!enabled || !pinyin) return pinyin;

  const syllables = pinyin.split(/\s+/).filter(Boolean);
  const colored = syllables.map((syl) => {
    const tone = detectPinyinTone(syl);
    const color = getToneColor(tone, customColors);
    return `<span style="color:${color};font-weight:600;">${syl}</span>`;
  });

  return colored.join(" ");
}
