/**
 * Pinyin utility functions for converting numeric tone representations (e.g. "ni3 hao3")
 * into formatted tone marks (e.g. "nǐ hǎo").
 */

const TONE_MARKS: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
  A: ["Ā", "Á", "Ǎ", "À"],
  E: ["Ē", "É", "Ě", "È"],
  I: ["Ī", "Í", "Ǐ", "Ì"],
  O: ["Ō", "Ó", "Ǒ", "Ò"],
  U: ["Ū", "Ú", "Ǔ", "Ù"],
  Ü: ["Ǖ", "Ǘ", "Ǚ", "Ǜ"],
};

/**
 * Normalizes 'u:' and 'v' variants to 'ü'
 */
function normalizeUmlaut(syllable: string): string {
  return syllable
    .replace(/u:/g, "ü")
    .replace(/U:/g, "Ü")
    .replace(/v/g, "ü")
    .replace(/V/g, "Ü");
}

/**
 * Converts a single syllable with numeric tone (e.g. "hao3", "lu:4", "de5")
 * into accented Pinyin ("hǎo", "lǜ", "de").
 */
export function convertSyllable(rawSyllable: string): string {
  if (!rawSyllable) return "";

  // Normalize umlauts first
  let syllable = normalizeUmlaut(rawSyllable);

  // Extract tone number (1-5) if present at end
  const toneMatch = syllable.match(/([1-5])$/);
  if (!toneMatch) {
    return syllable;
  }

  const tone = parseInt(toneMatch[1], 10);
  const baseSyllable = syllable.slice(0, -1);

  // Tone 5 is neutral tone: return base syllable without tone mark or number
  if (tone === 5) {
    return baseSyllable;
  }

  const toneIndex = tone - 1; // 0 to 3

  // Tone mark placement rules:
  // 1. If contains 'a' or 'e', it always takes the mark
  if (/[aA]/.test(baseSyllable)) {
    return baseSyllable.replace(/[aA]/, (m) => TONE_MARKS[m][toneIndex]);
  }
  if (/[eE]/.test(baseSyllable)) {
    return baseSyllable.replace(/[eE]/, (m) => TONE_MARKS[m][toneIndex]);
  }

  // 2. If contains 'ou', 'o' takes the mark
  if (/[oO][uU]/.test(baseSyllable)) {
    return baseSyllable.replace(/[oO]/, (m) => TONE_MARKS[m][toneIndex]);
  }

  // 3. Otherwise, the last vowel takes the mark (handles 'iu', 'ui', etc.)
  const vowels = "aeiouüAEIOUÜ";
  let lastVowelIndex = -1;
  for (let i = baseSyllable.length - 1; i >= 0; i--) {
    if (vowels.includes(baseSyllable[i])) {
      lastVowelIndex = i;
      break;
    }
  }

  if (lastVowelIndex !== -1) {
    const vowel = baseSyllable[lastVowelIndex];
    const tonedVowel = TONE_MARKS[vowel] ? TONE_MARKS[vowel][toneIndex] : vowel;
    return (
      baseSyllable.slice(0, lastVowelIndex) +
      tonedVowel +
      baseSyllable.slice(lastVowelIndex + 1)
    );
  }

  // If no standard vowel found (e.g. 'r5' or interjections), return base
  return baseSyllable;
}

/**
 * Converts a full Pinyin string with multiple syllables (e.g. "Zhong1 guo2" -> "Zhōng guó").
 *
 * @param pinyinStr - Raw pinyin string from CC-CEDICT, e.g. "ni3 hao3"
 * @param accented - Whether to convert to tone marks (true) or leave as cleaned numeric/plain (false)
 */
export function formatPinyin(pinyinStr: string, accented: boolean = true): string {
  if (!pinyinStr) return "";

  if (!accented) {
    // If accented is disabled, still normalize umlauts (e.g. lu:4 -> lü4)
    return normalizeUmlaut(pinyinStr);
  }

  // Split by whitespace and common punctuation, retaining delimiters
  const tokens = pinyinStr.split(/(\s+|['’,-])/);

  return tokens
    .map((token) => {
      // If token is whitespace or punctuation, return as-is
      if (!token || /^\s+$/.test(token) || /^['’,-]$/.test(token)) {
        return token;
      }
      return convertSyllable(token);
    })
    .join("");
}

