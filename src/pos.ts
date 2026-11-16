/**
 * Part of Speech (POS / 词类) Detector for Chinese Words
 * Identifies single and multi-POS categories (兼类词) in Russian and English.
 */

export type PartOfSpeech =
  | "noun"        // 名词 (существительное)
  | "verb"        // 动词 (глагол)
  | "adjective"   // 形容词 (прилагательное)
  | "adverb"      // 副词 (наречие)
  | "pronoun"     // 代词 (местоимение)
  | "classifier"   // 量词 (счётное слово)
  | "preposition" // 介词 (предлог)
  | "conjunction" // 连词 (союз)
  | "particle"    // 助词 (частица)
  | "numeral"     // 数词 (числительное)
  | "interjection"// 叹词 (междометие)
  | "idiom";      // 成语 / 熟语 (идиома)

export interface PosLabels {
  en: string;
  ru: string;
  zh: string;
}

export const POS_METADATA: Record<PartOfSpeech, PosLabels> = {
  noun: { en: "n.", ru: "сущ.", zh: "名词" },
  verb: { en: "v.", ru: "глаг.", zh: "动词" },
  adjective: { en: "adj.", ru: "прил.", zh: "形容词" },
  adverb: { en: "adv.", ru: "нареч.", zh: "副词" },
  pronoun: { en: "pron.", ru: "мест.", zh: "代词" },
  classifier: { en: "cl.", ru: "сч. сл.", zh: "量词" },
  preposition: { en: "prep.", ru: "предл.", zh: "介词" },
  conjunction: { en: "conj.", ru: "союз", zh: "连词" },
  particle: { en: "part.", ru: "част.", zh: "助词" },
  numeral: { en: "num.", ru: "числ.", zh: "数词" },
  interjection: { en: "int.", ru: "межд.", zh: "叹词" },
  idiom: { en: "id.", ru: "идиома", zh: "成语" },
};

// Common words with known multi-POS behavior (兼类词)
const CORE_WORD_POS: Record<string, PartOfSpeech[]> = {
  // Noun + Verb (существительное + глагол)
  "工作": ["noun", "verb"],
  "学习": ["noun", "verb"],
  "生活": ["noun", "verb"],
  "旅行": ["noun", "verb"],
  "运动": ["noun", "verb"],
  "研究": ["noun", "verb"],
  "计划": ["noun", "verb"],
  "翻译": ["noun", "verb"],
  "帮助": ["noun", "verb"],
  "决定": ["noun", "verb"],
  "影响": ["noun", "verb"],
  "变化": ["noun", "verb"],
  "通知": ["noun", "verb"],
  "报告": ["noun", "verb"],
  "感觉": ["noun", "verb"],
  "经历": ["noun", "verb"],
  "爱": ["noun", "verb"],
  "希望": ["noun", "verb"],
  "领导": ["noun", "verb"],
  "教育": ["noun", "verb"],
  "批评": ["noun", "verb"],
  "表扬": ["noun", "verb"],
  "调查": ["noun", "verb"],
  "比较": ["noun", "verb"],
  "说明": ["noun", "verb"],

  // Adjective + Noun (прилагательное + существительное)
  "自由": ["adjective", "noun"],
  "经济": ["adjective", "noun"],
  "科学": ["adjective", "noun"],
  "道德": ["adjective", "noun"],
  "困难": ["adjective", "noun"],
  "标准": ["adjective", "noun"],
  "秘密": ["adjective", "noun"],

  // Adjective + Verb (прилагательное + глагол)
  "丰富": ["adjective", "verb"],
  "端正": ["adjective", "verb"],
  "明白": ["adjective", "verb"],
  "繁荣": ["adjective", "verb"],
  "深入": ["adjective", "verb"],

  // Pronouns (местоимения)
  "我": ["pronoun"],
  "你": ["pronoun"],
  "他": ["pronoun"],
  "她": ["pronoun"],
  "它": ["pronoun"],
  "我们": ["pronoun"],
  "你们": ["pronoun"],
  "他们": ["pronoun"],
  "她们": ["pronoun"],
  "这": ["pronoun"],
  "那": ["pronoun"],
  "什么": ["pronoun"],
  "谁": ["pronoun"],
  "哪": ["pronoun"],
  "自己": ["pronoun"],
  "大家": ["pronoun"],

  // Particles (частицы)
  "的": ["particle"],
  "得": ["particle"],
  "地": ["particle"],
  "了": ["particle"],
  "着": ["particle"],
  "过": ["particle", "verb"],
  "吗": ["particle"],
  "呢": ["particle"],
  "吧": ["particle"],
  "啊": ["particle", "interjection"],

  // Conjunctions (союзы)
  "和": ["conjunction", "preposition"],
  "跟": ["conjunction", "preposition", "verb"],
  "因为": ["conjunction"],
  "所以": ["conjunction"],
  "虽然": ["conjunction"],
  "但是": ["conjunction"],
  "如果": ["conjunction"],
  "而且": ["conjunction"],
  "或者": ["conjunction"],
  "不仅": ["conjunction"],

  // Prepositions (предлоги)
  "在": ["preposition", "verb"],
  "从": ["preposition"],
  "向": ["preposition"],
  "对": ["preposition", "adjective"],
  "把": ["preposition", "classifier", "verb"],
  "被": ["preposition"],
  "比": ["preposition", "verb"],
  "给": ["preposition", "verb"],
  "替": ["preposition", "verb"],
  "为": ["preposition"],

  // Classifiers (счётные слова)
  "个": ["classifier"],
  "只": ["classifier", "adverb"],
  "条": ["classifier"],
  "张": ["classifier", "verb"],
  "本": ["classifier", "noun"],
  "支": ["classifier"],
  "件": ["classifier"],
  "台": ["classifier"],
  "座": ["classifier"],
  "位": ["classifier"],
  "杯": ["classifier", "noun"],
  "瓶": ["classifier", "noun"],

  // Adverbs (наречия)
  "很": ["adverb"],
  "太": ["adverb"],
  "非常": ["adverb"],
  "最": ["adverb"],
  "更": ["adverb"],
  "真": ["adverb", "adjective"],
  "也": ["adverb"],
  "都": ["adverb"],
  "就": ["adverb"],
  "才": ["adverb"],
  "又": ["adverb"],
  "再": ["adverb"],
  "常": ["adverb"],
  "经常": ["adverb"],
  "已经": ["adverb"],
  "正在": ["adverb"],
  "不": ["adverb"],
  "没": ["adverb", "verb"],
};

/**
 * Infers possible parts of speech from CEDICT definitions and character patterns
 */
export function inferPartsOfSpeech(word: string, definitions: string[]): PartOfSpeech[] {
  if (!word) return [];

  // 1. Check known core dictionary mappings
  if (CORE_WORD_POS[word]) {
    return CORE_WORD_POS[word];
  }

  // 2. Idiom detection (4-character standard chengyu)
  if (Array.from(word).length === 4 && /\p{Script=Han}{4}/u.test(word)) {
    const isIdiom = definitions.some((d) =>
      /idiom|chengyu|proverb|saying/i.test(d)
    );
    if (isIdiom) return ["idiom"];
  }

  const results = new Set<PartOfSpeech>();

  for (const def of definitions) {
    const lower = def.toLowerCase().trim();

    // Verbs
    if (/^to\s+[a-z]/i.test(def) || /\b(verb)\b/i.test(def)) {
      results.add("verb");
    }

    // Classifiers
    if (/^classifier\b/i.test(def) || /\b\(cl:[^)]+\)/i.test(def)) {
      results.add("classifier");
    }

    // Adjectives
    if (/\b(adj|adjective)\b/i.test(def) || /^(able|capable|bright|clean|dark|fast|good|happy|high|hot|kind|large|new|old|red|safe|small|warm|young)\b/i.test(def)) {
      results.add("adjective");
    }

    // Adverbs
    if (/\b(adv|adverb)\b/i.test(def) || lower.endsWith("ly") || /^(very|extremely|often|always|already|immediately|suddenly)\b/i.test(def)) {
      results.add("adverb");
    }

    // Prepositions
    if (/\b(prep|preposition)\b/i.test(def) || /^(from|towards|against|regarding)\b/i.test(def)) {
      results.add("preposition");
    }

    // Conjunctions
    if (/\b(conj|conjunction)\b/i.test(def) || /^(because|although|however|moreover|therefore)\b/i.test(def)) {
      results.add("conjunction");
    }

    // Particles
    if (/\b(particle|modal particle|aspect marker)\b/i.test(def)) {
      results.add("particle");
    }

    // Pronouns
    if (/\b(pronoun)\b/i.test(def)) {
      results.add("pronoun");
    }

    // Numerals
    if (/\b(numeral|number)\b/i.test(def)) {
      results.add("numeral");
    }
  }

  // Default fallback: if not identified and not purely a verb/adj, classify as noun
  if (results.size === 0) {
    results.add("noun");
  } else if (!results.has("noun") && !results.has("particle") && !results.has("classifier") && !results.has("conjunction")) {
    // In Chinese, many verbal concepts can also function nominalized
    const hasNominal = definitions.some((d) => !/^to\s+/i.test(d));
    if (hasNominal && results.has("verb")) {
      results.add("noun");
    }
  }

  return Array.from(results);
}

/**
 * Returns formatted localized badge text for parts of speech
 * e.g. "[глаг. / сущ.]" in Russian, or "[v. / n.]" in English
 */
export function formatPosBadge(posList: PartOfSpeech[], lang: "ru" | "en" = "ru"): string {
  if (!posList || posList.length === 0) return "";
  const labels = posList.map((pos) => POS_METADATA[pos]?.[lang] || pos);
  return `[${labels.join(" / ")}]`;
}
