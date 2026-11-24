import { Notice } from "obsidian";
import type ChineseHoverDictPlugin from "./main.ts";
import {
  DICT_PACKS,
  isDictPackInstalled,
  downloadDictPack,
  deleteDictPack,
  loadDictPackData,
  fetchJsonFromMirrors,
  buildDictMirrorUrls,
  MULTILANG_CORE_VOCAB,
} from "./dict-packs.ts";
import { HAN_CHAR_RE } from "./utils.ts";
import { getRussianDefinitions } from "./russian-dict.ts";
import { getActiveLanguage } from "./i18n/index.ts";
import {
  sortEntriesByPinyinFrequency,
} from "./pinyin-frequency.ts";
import { reverseDictionary } from "./reverse-dict.ts";

export interface DictEntry {
  simplified?: string;
  traditional: string;
  pinyin: string;
  jyutping?: string;
  definitions: string[];
}

export interface MatchResult {
  word: string;
  entries: DictEntry[];
  length: number;
  start?: number;
  end?: number;
  reverseQuery?: string;
  reverseMatches?: string[];
}

export type DictionaryData = Record<string, DictEntry[]>;

/**
 * Built-in fallback dictionary with Cantonese Jyutping mappings
 */
const FALLBACK_DICT: DictionaryData = {
  "你好": [
    {
      traditional: "你好",
      pinyin: "ni3 hao3",
      jyutping: "nei5 hou2",
      definitions: ["hello", "hi", "how are you"],
    },
  ],
  "中国": [
    {
      traditional: "中國",
      pinyin: "Zhong1 guo2",
      jyutping: "zung1 gwok3",
      definitions: ["China"],
    },
  ],
  "中文": [
    {
      traditional: "中文",
      pinyin: "Zhong1 wen2",
      jyutping: "zung1 man4",
      definitions: ["Chinese language"],
    },
  ],
  "汉语": [
    {
      traditional: "漢語",
      pinyin: "Han4 yu3",
      jyutping: "hon3 jyu5",
      definitions: ["Chinese language", "Mandarin"],
    },
  ],
  "谢谢": [
    {
      traditional: "謝謝",
      pinyin: "xie4 xie5",
      jyutping: "ze6 ze6",
      definitions: ["to thank", "thanks", "thank you"],
    },
  ],
  "不客气": [
    {
      traditional: "不客氣",
      pinyin: "bu4 ke4 qi5",
      jyutping: "bat1 haak3 hei3",
      definitions: ["you're welcome", "don't mention it", "impolite"],
    },
  ],
  "再见": [
    {
      traditional: "再見",
      pinyin: "zai4 jian4",
      jyutping: "zoi3 gin3",
      definitions: ["goodbye", "see you again later"],
    },
  ],
  "朋友": [
    {
      traditional: "朋友",
      pinyin: "peng2 you5",
      jyutping: "pang4 jau5",
      definitions: ["friend"],
    },
  ],
  "学习": [
    {
      traditional: "學習",
      pinyin: "xue2 xi2",
      jyutping: "hok6 zaap6",
      definitions: ["to learn", "to study"],
    },
  ],
  "学生": [
    {
      traditional: "學生",
      pinyin: "xue2 sheng5",
      jyutping: "hok6 saang1",
      definitions: ["student", "schoolchild"],
    },
  ],
  "老师": [
    {
      traditional: "老師",
      pinyin: "lao3 shi1",
      jyutping: "lou5 si1",
      definitions: ["teacher"],
    },
  ],
  "喜欢": [
    {
      traditional: "喜歡",
      pinyin: "xi3 huan5",
      jyutping: "hei2 fun1",
      definitions: ["to like", "to be fond of"],
    },
  ],
  "可以": [
    {
      traditional: "可以",
      pinyin: "ke3 yi3",
      jyutping: "ho2 ji5",
      definitions: ["can", "may", "possible", "able to", "not bad", "passable"],
    },
  ],
  "知道": [
    {
      traditional: "知道",
      pinyin: "zhi1 dao5",
      jyutping: "zi1 dou3",
      definitions: ["to know", "to be aware of"],
    },
  ],
  "明白": [
    {
      traditional: "明白",
      pinyin: "ming2 bai5",
      jyutping: "ming4 baak6",
      definitions: ["clear", "obvious", "to understand", "to realize"],
    },
  ],
  "很": [
    {
      traditional: "很",
      pinyin: "hen3",
      jyutping: "han2",
      definitions: ["very", "rather", "quite"],
    },
  ],
  "好": [
    {
      traditional: "好",
      pinyin: "hao3",
      jyutping: "hou2",
      definitions: ["good", "well", "proper", "fine"],
    },
    {
      traditional: "好",
      pinyin: "hao4",
      jyutping: "hou3",
      definitions: ["to be fond of", "to have a tendency to"],
    },
  ],
  "你": [
    {
      traditional: "你",
      pinyin: "ni3",
      jyutping: "nei5",
      definitions: ["you (singular)"],
    },
  ],
  "我": [
    {
      traditional: "我",
      pinyin: "wo3",
      jyutping: "ngo5",
      definitions: ["I", "me", "my"],
    },
  ],
  "他": [
    {
      traditional: "他",
      pinyin: "ta1",
      jyutping: "taa1",
      definitions: ["he", "him"],
    },
  ],
  "她": [
    {
      traditional: "她",
      pinyin: "ta1",
      jyutping: "taa1",
      definitions: ["she", "her"],
    },
  ],
  "的": [
    {
      traditional: "的",
      pinyin: "de5",
      jyutping: "dik1",
      definitions: ["possessive particle", "of"],
    },
  ],
};

/**
 * Built-in Core Cantonese Lexicon & Slang
 * Complements CC-CEDICT with colloquial Cantonese expressions, particles and loanwords
 */
export const CANTONESE_CORE_DICT: DictionaryData = {
  "咁樣": [
    {
      simplified: "这样",
      traditional: "咁樣",
      pinyin: "gan4 yang4",
      jyutping: "gam2 joeng2",
      definitions: ["like this", "this way", "in this manner", "so (Cantonese)"],
    },
  ],
  "點樣樣": [
    {
      traditional: "點樣樣",
      pinyin: "dian3 yang4 yang4",
      jyutping: "dim2 joeng2 joeng2",
      definitions: ["in what way", "how (Cantonese)"],
    },
  ],
  "𨋢": [
    {
      traditional: "𨋢",
      pinyin: "li4",
      jyutping: "lip1",
      definitions: ["elevator", "lift (Cantonese loanword from English 'lift')"],
    },
  ],
  "搭𨋢": [
    {
      traditional: "搭𨋢",
      pinyin: "da1 li4",
      jyutping: "daap3 lip1",
      definitions: ["to take the elevator / lift (Cantonese)"],
    },
  ],
  "𠵱家": [
    {
      traditional: "𠵱家",
      pinyin: "yi1 jia1",
      jyutping: "ji1 gaa1",
      definitions: ["now", "right now", "at present (Cantonese variant of 而家)"],
    },
  ],
  "做咩事": [
    {
      traditional: "做咩事",
      pinyin: "zuo4 mie1 shi4",
      jyutping: "zou6 me1 si6",
      definitions: ["what happened?", "what's the matter?", "why? (Cantonese)"],
    },
  ],
  "乜水": [
    {
      traditional: "乜水",
      pinyin: "mie1 shui3",
      jyutping: "mat1 seoi2",
      definitions: ["who?", "which person? (Cantonese slang)"],
    },
  ],
  "搭船": [
    {
      traditional: "搭船",
      pinyin: "da1 chuan2",
      jyutping: "daap3 syun4",
      definitions: ["to take a boat / ferry"],
    },
  ],
  "搭飛機": [
    {
      traditional: "搭飛機",
      pinyin: "da1 fei1 ji1",
      jyutping: "daap3 fei1 gei1",
      definitions: ["to take an airplane / fly"],
    },
  ],
  "睇得明": [
    {
      traditional: "睇得明",
      pinyin: "kan4 de5 ming2",
      jyutping: "tai2 dak1 ming4",
      definitions: ["able to understand by reading (Cantonese)"],
    },
  ],
  "睇唔明": [
    {
      traditional: "睇唔明",
      pinyin: "kan4 bu4 ming2",
      jyutping: "tai2 m4 ming4",
      definitions: ["unable to understand by reading (Cantonese)"],
    },
  ],
  "聽得明": [
    {
      traditional: "聽得明",
      pinyin: "ting1 de5 ming2",
      jyutping: "teng1 dak1 ming4",
      definitions: ["able to understand by hearing / comprehend speech (Cantonese)"],
    },
  ],
  "聽唔明": [
    {
      traditional: "聽唔明",
      pinyin: "ting1 bu4 ming2",
      jyutping: "teng1 m4 ming4",
      definitions: ["unable to understand by hearing (Cantonese)"],
    },
  ],
  "搞得掂": [
    {
      traditional: "搞得掂",
      pinyin: "gao3 de5 dian1",
      jyutping: "gaau2 dak1 dim6",
      definitions: ["able to get things done / handle successfully (Cantonese)"],
    },
  ],
  "搞唔掂": [
    {
      traditional: "搞唔掂",
      pinyin: "gao3 bu4 dian1",
      jyutping: "gaau2 m4 dim6",
      definitions: ["unable to handle / in over one's head (Cantonese)"],
    },
  ],
  "食得落": [
    {
      traditional: "食得落",
      pinyin: "shi2 de5 luo4",
      jyutping: "sik6 dak1 lok6",
      definitions: ["able to eat / have appetite (Cantonese)"],
    },
  ],
  "食唔落": [
    {
      traditional: "食唔落",
      pinyin: "shi2 bu4 luo4",
      jyutping: "sik6 m4 lok6",
      definitions: ["unable to eat / having no appetite (Cantonese)"],
    },
  ],
  "識唔識": [
    {
      traditional: "識唔識",
      pinyin: "shi2 bu4 shi2",
      jyutping: "sik1 m4 sik1",
      definitions: ["do you know? / can you? / are you familiar with? (Cantonese question)"],
    },
  ],
  "知唔知": [
    {
      traditional: "知唔知",
      pinyin: "zhi1 bu4 zhi1",
      jyutping: "zi1 m4 zi1",
      definitions: ["do you know? (Cantonese question)"],
    },
  ],
  "去唔去": [
    {
      traditional: "去唔去",
      pinyin: "qu4 bu4 qu4",
      jyutping: "heoi3 m4 heoi3",
      definitions: ["going or not? / would you like to go? (Cantonese question)"],
    },
  ],
  "有搞錯": [
    {
      traditional: "有搞錯",
      pinyin: "you3 gao3 cuo4",
      jyutping: "jau5 gaau2 co3",
      definitions: ["to make a mistake (Cantonese)"],
    },
  ],
  "冇搞錯": [
    {
      traditional: "冇搞錯",
      pinyin: "mei2 gao3 cuo4",
      jyutping: "mou5 gaau2 co3",
      definitions: ["not mistaken / definitely correct (Cantonese)"],
    },
  ],
  "成日都": [
    {
      traditional: "成日都",
      pinyin: "cheng2 ri4 dou1",
      jyutping: "seng4 jat6 dou1",
      definitions: ["always / constantly / all the time (Cantonese)"],
    },
  ],
  "一齊去": [
    {
      traditional: "一齊去",
      pinyin: "yi1 qi2 qu4",
      jyutping: "jat1 cai4 heoi3",
      definitions: ["go together (Cantonese)"],
    },
  ],
  "得唔得閒": [
    {
      traditional: "得唔得閒",
      pinyin: "de2 bu4 de2 xian2",
      jyutping: "dak1 m4 dak1 haan4",
      definitions: ["are you free? / do you have spare time? (Cantonese)"],
    },
  ],
  "食唔食": [
    {
      traditional: "食唔食",
      pinyin: "shi2 bu4 shi2",
      jyutping: "sik6 m4 sik6",
      definitions: ["want to eat or not? / do you eat? (Cantonese question)"],
    },
  ],
  "睇唔睇": [
    {
      traditional: "睇唔睇",
      pinyin: "kan4 bu4 kan4",
      jyutping: "tai2 m4 tai2",
      definitions: ["want to watch or not? / do you want to see? (Cantonese question)"],
    },
  ],
  "等陣先": [
    {
      traditional: "等陣先",
      pinyin: "deng3 zhen4 xian1",
      jyutping: "dang2 zan6 sin1",
      definitions: ["wait a moment / just a second (Cantonese)"],
    },
  ],
  "一陣間": [
    {
      traditional: "一陣間",
      pinyin: "yi1 zhen4 jian1",
      jyutping: "jat1 zan6 gaan1",
      definitions: ["in a moment / in a little while (Cantonese)"],
    },
  ],
  "冇所謂": [
    {
      traditional: "冇所謂",
      pinyin: "mei2 suo3 wei4",
      jyutping: "mou5 so2 wai6",
      definitions: ["doesn't matter / it doesn't bother me (Cantonese)"],
    },
  ],
  "真係㗎": [
    {
      traditional: "真係㗎",
      pinyin: "zhen1 xi4 jia4",
      jyutping: "zan1 hai6 gaa3",
      definitions: ["really? / is that true? (Cantonese)"],
    },
  ],
  "好耐冇見": [
    {
      traditional: "好耐冇見",
      pinyin: "hao3 nai4 mei2 jian4",
      jyutping: "hou2 noi6 mou5 gin3",
      definitions: ["long time no see / haven't seen you in a while (Cantonese)"],
    },
  ],
  "㗎啦": [
    {
      traditional: "㗎啦",
      pinyin: "jia4 la1",
      jyutping: "gaa3 laa1",
      definitions: ["sentence-final particle indicating certainty or completion (Cantonese)"],
    },
  ],
  "嘅啫": [
    {
      traditional: "嘅啫",
      pinyin: "ge5 ze1",
      jyutping: "ge3 ze1",
      definitions: ["sentence-final particle: only / merely / that's all (Cantonese)"],
    },
  ],
  "㗎咋": [
    {
      traditional: "㗎咋",
      pinyin: "jia4 zaa3",
      jyutping: "gaa3 zaa3",
      definitions: ["sentence-final particle: only / that is only (Cantonese)"],
    },
  ],
  "喇噃": [
    {
      traditional: "喇噃",
      pinyin: "la1 bo3",
      jyutping: "laa3 bo3",
      definitions: ["sentence-final particle: reminder / gentle warning (Cantonese)"],
    },
  ],
  "得㗎": [
    {
      traditional: "得㗎",
      pinyin: "de2 jia4",
      jyutping: "dak1 gaa3",
      definitions: ["can be done / it is okay (Cantonese)"],
    },
  ],
};

/**
 * High-frequency colloquial Cantonese words and expressions.
 * Used for targeted Cantonese phrase boundary detection without interfering
 * with Obsidian's standard Chinese word segmentation for chengyu and regular words.
 */
export const CANTONESE_SPECIFIC_WORDS: Set<string> = new Set([
  // Words in CANTONESE_CORE_DICT
  "咁樣", "點樣樣", "𨋢", "搭𨋢", "𠵱家", "依家", "而家", "做咩事", "乜水",
  "搭船", "搭飛機", "睇得明", "睇唔明", "聽得明", "聽唔明", "搞得掂", "搞唔掂",
  "食得落", "食唔落", "識唔識", "知唔知", "去唔去", "有搞錯", "冇搞錯",
  "成日都", "一齊去", "得唔得閒", "食唔食", "睇唔睇", "等陣先", "一陣間",
  "冇所謂", "真係㗎", "好耐冇見", "好耐唔見",
  "㗎啦", "嘅啫", "㗎咋", "喇噃", "得㗎", "㗎喇", "嘅喇", "喇喎", "囉喎", "呀嘛", "呀嗱",
  // Common colloquial Cantonese phrases typically fragmented by Mandarin ICU segmenters
  "唔該", "唔該晒", "多謝晒", "唔好意思", "冇問題", "冇相干", "冇緊要", "有冇搞錯",
  "點解", "做咩", "乜嘢", "幾多", "點樣", "有冇", "得唔得", "係唔係", "好唔好",
  "邊度", "呢度", "嗰度", "邊個", "呢個", "嗰個", "呢啲", "嗰啲", "邊啲",
  "屋企", "屋企人", "返屋企", "出街", "行街", "買嘢", "食嘢",
  "返工", "收工", "放工", "放假", "瞓覺", "起身", "傾偈", "搭車",
  "睇戲", "飲茶", "拍拖", "睇書", "真係", "一齊", "大約", "差唔多",
  "犀利", "巴閉", "論盡", "叻仔", "靚仔", "靚女", "肥佬", "瘦蜢蜢", "得戚"
]);

const RESULT_COMPLEMENTS = new Set(["明", "掂", "到", "落", "出", "入", "完", "好", "成", "開", "走"]);

const ASPECT_MARKERS: Record<string, { jyut: string; desc: string }> = {
  "緊": { jyut: "gan2", desc: "currently doing (progressive aspect)" },
  "咗": { jyut: "zo2", desc: "completed / finished doing (perfective aspect)" },
  "晒": { jyut: "saai3", desc: "completely / entirely finished doing" },
  "埋": { jyut: "maai4", desc: "finish up / also doing" },
  "返": { jyut: "faan1", desc: "doing back / returning" },
  "番": { jyut: "faan1", desc: "doing back / again" },
  "吓": { jyut: "haa5", desc: "do a little bit / have a try" },
  "下": { jyut: "haa5", desc: "do a little bit / briefly" },
};

interface ZhSegmentData {
  segment: string;
  index: number;
}

interface ZhSegmenterLike {
  segment(input: string): Iterable<ZhSegmentData>;
}

let cachedZhSegmenter: ZhSegmenterLike | null = null;
function getSharedZhSegmenter(): ZhSegmenterLike | null {
  if (!cachedZhSegmenter && typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const SegmenterCtor = (Intl as unknown as {
        Segmenter: new (
          locales: string[],
          options: { granularity: string }
        ) => ZhSegmenterLike;
      }).Segmenter;
      cachedZhSegmenter = new SegmenterCtor(
        ["zh-HK", "yue", "zh-Hant", "zh-TW", "zh-CN", "zh"],
        { granularity: "word" }
      );
    } catch {
      cachedZhSegmenter = null;
    }
  }
  return cachedZhSegmenter;
}

export class DictionaryManager {
  private data: DictionaryData = {};
  private loadedPacks: Map<string, Record<string, string[]>> = new Map();
  private sortedEntriesCache = new WeakSet<DictEntry[]>();
  private hasPreloadedReversePacks: boolean = false;
  private isLoaded: boolean = false;
  private plugin: ChineseHoverDictPlugin;

  public normalizedMap: Map<string, string> = new Map();
  public idiomClauseIndex: Map<string, { parentKey: string; clauseIndex: number; totalClauses: number }> = new Map();

  constructor(plugin: ChineseHoverDictPlugin) {
    this.plugin = plugin;
    this.data = Object.assign({}, FALLBACK_DICT, CANTONESE_CORE_DICT);
    this.buildIndexes();
    this.isLoaded = false;
  }

  private getPluginDir(): string {
    return this.plugin.manifest.dir || "";
  }

  getData(): DictionaryData {
    return this.data;
  }

  /**
   * Builds normalized punctuation index and idiom clause lookup tables
   * for instant multi-word and proverb search without performance impact.
   */
  public buildIndexes(): void {
    this.normalizedMap.clear();
    this.idiomClauseIndex.clear();

    const keys = Object.keys(this.data);
    for (let k = 0; k < keys.length; k++) {
      const key = keys[k];

      // Fast-path: skip regex replacement on the ~98% of keys with no punctuation/spaces
      if (
        key.includes("，") ||
        key.includes(",") ||
        key.includes(" ") ||
        key.includes("·") ||
        key.includes("、")
      ) {
        // 1. Normalized map for phrases/proverbs with commas, middle dots, or spaces
        const norm = key.replace(/[，, ·、\s]/g, "");
        if (norm !== key && !this.data[norm]) {
          this.normalizedMap.set(norm, key);
        }

        // 2. Idiom clause index (e.g. "活到老" / "学到老" in "活到老，学到老")
        if (key.includes("，") || key.includes(",")) {
          const parts = key.split(/[，,]/).map((p) => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            for (let i = 0; i < parts.length; i++) {
              const part = parts[i];
              if (part.length >= 2 && !this.data[part]) {
                const existing = this.idiomClauseIndex.get(part);
                const isSimp = this.data[key]?.[0]?.simplified === key;
                if (!existing || isSimp) {
                  this.idiomClauseIndex.set(part, { parentKey: key, clauseIndex: i, totalClauses: parts.length });
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Loads dictionary data from plugin's cedict.json file, or built-in core vocabulary.
   * Checks dicts/cedict.json first, then root cedict.json for compatibility.
   * Never freezes startup.
   */
  async load(): Promise<void> {
    try {
      const adapter = this.plugin.app.vault.adapter;
      const dictsPath = `${this.getPluginDir()}/dicts/cedict.json`;
      const rootPath = `${this.getPluginDir()}/cedict.json`;
      const dictPath = (await adapter.exists(dictsPath)) ? dictsPath : rootPath;

      if (await adapter.exists(dictPath)) {
        const rawContent = await adapter.read(dictPath);
        this.data = Object.assign({}, JSON.parse(rawContent) as DictionaryData, CANTONESE_CORE_DICT);
        this.sortedEntriesCache = new WeakSet<DictEntry[]>();
        this.buildIndexes();
        this.isLoaded = true;
      } else {
        // If local file is not present, use built-in core vocabulary first
        this.data = Object.assign({}, FALLBACK_DICT, CANTONESE_CORE_DICT);
        this.sortedEntriesCache = new WeakSet<DictEntry[]>();
        this.buildIndexes();
        this.isLoaded = true;
      }

      // Preload active non-English pack if configured
      const activePack = this.plugin.settings?.activeDictPack;
      if (activePack && activePack !== "en") {
        await this.loadPack(activePack);
      }

      // Preload active translation language pack if non-English and not yet loaded
      const effectiveLang = (this.plugin.settings?.translationLanguage && this.plugin.settings.translationLanguage !== "auto")
        ? this.plugin.settings.translationLanguage
        : getActiveLanguage();
      if (effectiveLang && effectiveLang !== "en" && effectiveLang !== "both" && !this.loadedPacks.has(effectiveLang)) {
        await this.loadPack(effectiveLang);
      }

      // Always preload Cantonese pack if installed so English + Cantonese work together
      if (!this.loadedPacks.has("yue") && await isDictPackInstalled(adapter, this.getPluginDir(), "yue")) {
        await this.loadPack("yue");
      }
    } catch (err) {
      console.error("[Chinese Dict] Failed to load dictionary:", err);
      this.data = Object.assign({}, FALLBACK_DICT, CANTONESE_CORE_DICT);
      this.sortedEntriesCache = new WeakSet<DictEntry[]>();
      this.buildIndexes();
      this.isLoaded = true;
    }
  }

  /**
   * Quiet background check & download for default English CC-CEDICT pack.
   * Scheduled lazily after Obsidian is fully loaded.
   */
  async ensureDefaultEnglishDictPack(): Promise<void> {
    const adapter = this.plugin.app.vault.adapter;
    const dictsPath = `${this.getPluginDir()}/dicts/cedict.json`;
    const rootPath = `${this.getPluginDir()}/cedict.json`;
    if ((await adapter.exists(dictsPath)) || (await adapter.exists(rootPath))) {
      return;
    }
    await this.downloadDictionary(true);
  }

  /**
   * Quiet background check & download for active language dictionary pack (e.g. Russian БКРС).
   */
  async ensureActiveLanguageDictPack(): Promise<void> {
    const effectiveLang = (this.plugin.settings?.translationLanguage && this.plugin.settings.translationLanguage !== "auto")
      ? this.plugin.settings.translationLanguage
      : getActiveLanguage();

    if (!effectiveLang || effectiveLang === "en" || effectiveLang === "both") {
      return;
    }

    if (this.loadedPacks.has(effectiveLang)) {
      return;
    }

    const isInstalled = await this.isPackInstalled(effectiveLang);
    if (!isInstalled) {
      await this.downloadPack(effectiveLang);
    } else {
      await this.loadPack(effectiveLang);
    }
  }

  /**
   * Downloads cedict.json from GitHub release assets and caches it locally in dicts/
   */
  async downloadDictionary(isSilent: boolean = false): Promise<boolean> {
    const adapter = this.plugin.app.vault.adapter;
    const dictsFolder = `${this.getPluginDir()}/dicts`;
    if (!(await adapter.exists(dictsFolder))) {
      await adapter.mkdir(dictsFolder);
    }
    const dictPath = `${dictsFolder}/cedict.json`;

    if (!isSilent) {
      new Notice("Chinese Popover: Загрузка словаря... / Downloading dictionary database...", 4000);
    }

    try {
      const text = await fetchJsonFromMirrors(
        buildDictMirrorUrls("cedict.json"),
        "Failed to download cedict.json from mirrors"
      );
      await adapter.write(dictPath, text);
      this.data = Object.assign({}, JSON.parse(text) as DictionaryData, CANTONESE_CORE_DICT);
      this.sortedEntriesCache = new WeakSet<DictEntry[]>();
      this.buildIndexes();
      this.isLoaded = true;
      const count = Object.keys(this.data).length;
      if (!isSilent) {
        new Notice(`Chinese Popover: Словарь успешно загружен (${count} слов)!`, 5000);
      }
      return true;
    } catch (err) {
      console.warn("[Chinese Dict] Failed to download dictionary file:", err);
      if (!isSilent) {
        new Notice(`Chinese Popover: Не удалось загрузить словарь. Ошибка: ${(err as Error)?.message || "Сетевая ошибка"}`, 5000);
      }
      return false;
    }
  }

  async isPackInstalled(packId: string): Promise<boolean> {
    return await isDictPackInstalled(this.plugin.app.vault.adapter, this.getPluginDir(), packId);
  }

  async downloadPack(packId: string): Promise<boolean> {
    if (packId === "en") {
      return await this.downloadDictionary(false);
    }
    const ok = await downloadDictPack(this.plugin.app.vault.adapter, this.getPluginDir(), packId);
    if (ok) {
      await this.loadPack(packId);
    }
    return ok;
  }

  async deletePack(packId: string): Promise<boolean> {
    if (packId === "en") {
      const adapter = this.plugin.app.vault.adapter;
      const dictsPath = `${this.getPluginDir()}/dicts/cedict.json`;
      const rootPath = `${this.getPluginDir()}/cedict.json`;
      let deleted = false;
      if (await adapter.exists(dictsPath)) {
        await adapter.remove(dictsPath);
        deleted = true;
      }
      if (await adapter.exists(rootPath)) {
        await adapter.remove(rootPath);
        deleted = true;
      }
      if (deleted) {
        this.data = Object.assign({}, FALLBACK_DICT, CANTONESE_CORE_DICT);
        this.sortedEntriesCache = new WeakSet<DictEntry[]>();
        this.buildIndexes();
        new Notice("Chinese Popover: Словарь CC-CEDICT удален с диска.", 4000);
        return true;
      }
      return false;
    }
    const ok = await deleteDictPack(this.plugin.app.vault.adapter, this.getPluginDir(), packId);
    if (ok) {
      this.loadedPacks.delete(packId);
      reverseDictionary.unindexPack(packId);
    }
    return ok;
  }

  async loadPack(packId: string): Promise<boolean> {
    if (packId === "en") return true;
    if (this.loadedPacks.has(packId)) return true;
    const data = await loadDictPackData(this.plugin.app.vault.adapter, this.getPluginDir(), packId);
    if (data) {
      this.loadedPacks.set(packId, data);
      if (packId === "yue") {
        // Merge Cantonese-specific slang/entries into base dictionary so English + Cantonese work together
        for (const [word, defs] of Object.entries(data)) {
          if (!this.data[word] && defs && defs.length > 0) {
            const entries: DictEntry[] = defs.map((d) => {
              const sepIdx = d.indexOf(" • ");
              const jyutping = sepIdx !== -1 ? d.slice(0, sepIdx).trim() : "";
              const meaning = sepIdx !== -1 ? d.slice(sepIdx + 3).trim() : d;
              return {
                simplified: word,
                traditional: word,
                pinyin: "",
                jyutping,
                definitions: meaning.split(/;\s*/).filter(Boolean),
              };
            });
            this.data[word] = entries;
          }
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Automatically preloads all offline dictionary packs present in the vault.
   */
  async loadAllInstalledPacks(): Promise<void> {
    for (const pack of DICT_PACKS) {
      if (pack.id === "en") continue;
      const isInstalled = await isDictPackInstalled(this.plugin.app.vault.adapter, this.getPluginDir(), pack.id);
      if (isInstalled) {
        await this.loadPack(pack.id);
      }
    }
  }

  /**
   * Retrieves definition translations for a word in any of the 20 supported languages.
   * Checks loaded pack -> built-in core vocab -> null (falling back to English).
   */
  getMultiLangDefs(word: string, lang: string): string[] | null {
    if (!word || !lang || lang === "en") return null;

    // 1. Check loaded offline dictionary pack (with simplified <-> traditional fallback)
    const pack = this.loadedPacks.get(lang);
    if (pack) {
      if (pack[word] && pack[word].length > 0) {
        return pack[word];
      }
      // Check alternate script form (simplified <-> traditional) from CC-CEDICT entry
      const entry = this.data[word]?.[0];
      if (entry) {
        if (entry.traditional && pack[entry.traditional] && pack[entry.traditional].length > 0) {
          return pack[entry.traditional];
        }
        if (entry.simplified && pack[entry.simplified] && pack[entry.simplified].length > 0) {
          return pack[entry.simplified];
        }
      }
    }

    // 2. Check Russian dictionary
    if (lang === "ru") {
      const ru = getRussianDefinitions(word);
      if (ru && ru.length > 0) return ru;
    }

    // 3. Check built-in multi-language core vocabulary
    const core = MULTILANG_CORE_VOCAB[word]?.[lang];
    if (core && core.length > 0) {
      return core;
    }

    return null;
  }

  isFullDictionaryLoaded(): boolean {
    return Object.keys(this.data).length > 200;
  }

  isReady(): boolean {
    return this.isLoaded;
  }

  ensureReverseIndexReady(): void {
    reverseDictionary.ensureReady(this.data);
    for (const [langId, packData] of this.loadedPacks.entries()) {
      reverseDictionary.indexPack(langId, packData);
    }
    if (!this.hasPreloadedReversePacks) {
      this.hasPreloadedReversePacks = true;
      void this.loadAllInstalledPacks().then(() => {
        for (const [langId, packData] of this.loadedPacks.entries()) {
          reverseDictionary.indexPack(langId, packData);
        }
      });
    }
  }

  lookupReverse(query: string, preferredLang: string = "auto"): MatchResult | null {
    this.ensureReverseIndexReady();
    const rev = reverseDictionary.lookup(query, this.data, preferredLang);
    if (!rev) return null;
    const entries = this.getOrSynthesize(rev.primaryWord) || this.get(rev.primaryWord);
    if (!entries || entries.length === 0) return null;
    return {
      word: rev.primaryWord,
      entries,
      length: Array.from(rev.primaryWord).length,
      reverseQuery: query,
      reverseMatches: rev.allWords,
    };
  }

  /**
   * Checks whether text contains or consists of CJK Chinese ideographs
   * (including CJK Extension A through I, Cantonese HKSCS, and Kangxi radicals)
   */
  isChinese(text: string): boolean {
    return Boolean(text && HAN_CHAR_RE.test(text));
  }

  private normalizeSurrogateOffset(fullText: string, offset: number): number {
    if (offset > 0 && offset < fullText.length) {
      const code = fullText.charCodeAt(offset);
      if (code >= 0xdc00 && code <= 0xdfff) return offset - 1;
    }
    return offset;
  }

  private isTrailingSurrogate(text: string, idx: number): boolean {
    const code = text.charCodeAt(idx);
    return code >= 0xdc00 && code <= 0xdfff;
  }

  private ensureSorted(word: string, entries?: DictEntry[]): DictEntry[] | undefined {
    if (!entries || entries.length === 0) return undefined;
    if (entries.length > 1 && !this.sortedEntriesCache.has(entries)) {
      const sorted = sortEntriesByPinyinFrequency(word, entries);
      this.data[word] = sorted;
      this.sortedEntriesCache.add(sorted);
      return sorted;
    }
    return entries;
  }

  /**
   * Matches multi-character Cantonese A-not-A questions (XY唔XY / X唔X)
   * and potential/resultative complements (X得Y / X唔Y) covering `offset`.
   */
  private matchCantoneseGrammarPatterns(fullText: string, offset: number): MatchResult | null {
    // 1. A-not-A 5-character pattern: XY唔XY (e.g. 鍾意唔鍾意, 清楚唔清楚)
    for (let s = Math.max(0, offset - 4); s <= offset && s + 5 <= fullText.length; s++) {
      if (s > 0 && this.isTrailingSurrogate(fullText, s)) continue;
      if (offset < s || offset >= s + 5) continue;
      const w1 = fullText.slice(s, s + 2);
      const mid = fullText[s + 2];
      const w2 = fullText.slice(s + 3, s + 5);
      if (w1 === w2 && (mid === "唔" || mid === "不") && this.isChinese(w1)) {
        const word = fullText.slice(s, s + 5);
        const base = this.data[w1]?.[0];
        const baseDef = base?.definitions?.[0] || w1;
        const baseJyut = base?.jyutping || "";
        const basePin = base?.pinyin || "";
        const synth: DictEntry[] = [{
          traditional: word,
          pinyin: basePin ? `${basePin} bu4 ${basePin}` : "",
          jyutping: baseJyut ? `${baseJyut} m4 ${baseJyut}` : "",
          definitions: [`whether or not ${baseDef}? (Cantonese A-not-A question)`],
        }];
        return { word, entries: this.data[word] || synth, length: 5, start: s, end: s + 5 };
      }
    }

    // 2. A-not-A 3-char (X唔X / X不X) & Potential complements (X得Y / X唔Y)
    for (let s = Math.max(0, offset - 2); s <= offset && s + 3 <= fullText.length; s++) {
      if (s > 0 && this.isTrailingSurrogate(fullText, s)) continue;
      if (offset < s || offset >= s + 3) continue;
      const c0 = fullText[s];
      const c1 = fullText[s + 1];
      const c2 = fullText[s + 2];
      if (!this.isChinese(c0)) continue;

      if (c0 === c2 && (c1 === "唔" || c1 === "不")) {
        const word = fullText.slice(s, s + 3);
        const base = this.data[c0]?.[0];
        const baseDef = base?.definitions?.[0] || c0;
        const baseJyut = base?.jyutping || "";
        const basePin = base?.pinyin || "";
        const synth: DictEntry[] = [{
          traditional: word,
          pinyin: basePin ? `${basePin} bu4 ${basePin}` : "",
          jyutping: baseJyut ? `${baseJyut} m4 ${baseJyut}` : "",
          definitions: [`whether or not to ${baseDef}? (Cantonese A-not-A question)`],
        }];
        return { word, entries: this.data[word] || synth, length: 3, start: s, end: s + 3 };
      }

      if ((c1 === "得" || c1 === "唔") && RESULT_COMPLEMENTS.has(c2)) {
        const word = fullText.slice(s, s + 3);
        const base = this.data[c0]?.[0];
        const baseDef = base?.definitions?.[0] || c0;
        const baseJyut = base?.jyutping || "";
        const isAffirmative = c1 === "得";
        const synth: DictEntry[] = [{
          traditional: word,
          pinyin: "",
          jyutping: baseJyut ? `${baseJyut} ${isAffirmative ? "dak1" : "m4"} ...` : "",
          definitions: [
            isAffirmative
              ? `able to ${baseDef} successfully (Cantonese potential complement)`
              : `unable to ${baseDef} (Cantonese negative potential complement)`,
          ],
        }];
        return { word, entries: this.data[word] || synth, length: 3, start: s, end: s + 3 };
      }
    }

    return null;
  }

  /**
   * Matches Verb + Cantonese Aspect marker: X緊, X咗, X晒, X埋, X返, X番, X吓, X下
   */
  private matchCantoneseAspectAtOffset(fullText: string, offset: number): MatchResult | null {
    for (let s = Math.max(0, offset - 1); s <= offset && s + 2 <= fullText.length; s++) {
      if (s > 0 && this.isTrailingSurrogate(fullText, s)) continue;
      if (offset < s || offset >= s + 2) continue;
      const c0 = fullText[s];
      const c1 = fullText[s + 1];
      const asp = ASPECT_MARKERS[c1];
      if (asp && this.isChinese(c0)) {
        const word = fullText.slice(s, s + 2);
        const base = this.data[c0]?.[0];
        const baseDef = base?.definitions?.[0] || c0;
        const baseJyut = base?.jyutping || "";
        const synth: DictEntry[] = [{
          traditional: word,
          pinyin: "",
          jyutping: baseJyut ? `${baseJyut} ${asp.jyut}` : "",
          definitions: [`${baseDef} (${asp.desc})`],
        }];
        return { word, entries: this.data[word] || synth, length: 2, start: s, end: s + 2 };
      }
    }
    return null;
  }

  /**
   * Specifically detects whether the character at `offset` belongs to a colloquial
   * Cantonese phrase, idiom, or grammatical construction (A-not-A, aspect particles, complements).
   */
  findCantonesePhraseAtOffset(
    fullText: string,
    offset: number,
    maxLen: number = 6
  ): MatchResult | null {
    if (!this.isLoaded || !fullText || offset < 0 || offset >= fullText.length) {
      return null;
    }

    offset = this.normalizeSurrogateOffset(fullText, offset);
    const codePoint = fullText.codePointAt(offset);
    if (codePoint === undefined) return null;
    const clickedChar = String.fromCodePoint(codePoint);
    if (!this.isChinese(clickedChar)) {
      return null;
    }

    // 1. Check against Cantonese specific vocabulary
    for (let len = Math.min(maxLen * 2, fullText.length); len >= 2; len--) {
      for (let s = Math.max(0, offset - len + 1); s <= offset; s++) {
        if (s > 0 && this.isTrailingSurrogate(fullText, s)) continue;
        const e = s + len;
        if (e < fullText.length && this.isTrailingSurrogate(fullText, e)) continue;
        if (offset >= s && offset < e && e <= fullText.length) {
          const cand = fullText.slice(s, e);
          if (CANTONESE_SPECIFIC_WORDS.has(cand)) {
            return {
              word: cand,
              entries: this.data[cand] || [],
              length: Array.from(cand).length,
              start: s,
              end: e,
            };
          }
        }
      }
    }

    // 2. Cantonese A-not-A & potential complements
    const grammarMatch = this.matchCantoneseGrammarPatterns(fullText, offset);
    if (grammarMatch) return grammarMatch;

    // 3. Cantonese aspect markers
    const aspectMatch = this.matchCantoneseAspectAtOffset(fullText, offset);
    if (aspectMatch) return aspectMatch;

    // 4. Single Cantonese unique character (like 𨋢)
    if (CANTONESE_SPECIFIC_WORDS.has(clickedChar)) {
      return {
        word: clickedChar,
        entries: this.get(clickedChar) || [],
        length: Array.from(clickedChar).length,
        start: offset,
        end: offset + clickedChar.length,
      };
    }

    return null;
  }

  /**
   * Finds the best matching Chinese or Cantonese word covering the given offset.
   */
  findWordAtOffset(
    fullText: string,
    offset: number,
    maxLen: number = 12
  ): MatchResult | null {
    if (!this.isLoaded || !fullText || offset < 0 || offset >= fullText.length) {
      return null;
    }

    offset = this.normalizeSurrogateOffset(fullText, offset);
    const codePoint = fullText.codePointAt(offset);
    if (codePoint === undefined) return null;
    const clickedChar = String.fromCodePoint(codePoint);
    if (!this.isChinese(clickedChar)) {
      return null;
    }

    let bestMatch: MatchResult | null = null;
    let bestStart = -1;
    let bestEnd = -1;
    const minStart = Math.max(0, offset - maxLen * 2);

    // 1. Longest match search in dictionary (CEDICT + Cantonese Lexicon + Normalized proverbs)
    for (let start = minStart; start <= offset; start++) {
      if (start > 0 && this.isTrailingSurrogate(fullText, start)) continue;
      const maxCandidateLen = Math.min(fullText.length - start, maxLen * 2);
      for (let len = maxCandidateLen; len >= 1; len--) {
        const end = start + len;
        if (end < fullText.length && this.isTrailingSurrogate(fullText, end)) continue;
        if (offset >= start && offset < end) {
          const candidate = fullText.slice(start, end);
          let entries: DictEntry[] | undefined = this.data[candidate];
          if (!entries || entries.length === 0) {
            const normKey = this.normalizedMap.get(candidate);
            if (normKey) entries = this.data[normKey];
          }
          if (!entries || entries.length === 0) {
            const clause = this.findIdiomClauseMatch(candidate);
            if (clause && clause.length > 0) entries = clause;
          }
          entries = this.ensureSorted(candidate, entries);
          if (entries && entries.length > 0) {
            const charCount = Array.from(candidate).length;
            if (charCount <= maxLen && (!bestMatch || charCount > bestMatch.length)) {
              bestMatch = { word: candidate, entries, length: charCount, start, end };
              bestStart = start;
              bestEnd = end;
            }
          }
        }
      }
    }

    // 2. Check multi-character Cantonese grammatical patterns before accepting shorter dictionary matches
    if (!bestMatch || bestMatch.length < 3) {
      const grammarMatch = this.matchCantoneseGrammarPatterns(fullText, offset);
      if (grammarMatch) return grammarMatch;
    }

    // 3. Return multi-character dictionary match if found
    if (bestMatch && bestMatch.length >= 2) {
      bestMatch.start = bestStart;
      bestMatch.end = bestEnd;
      return bestMatch;
    }

    // 4. Cantonese aspect markers (Verb + 緊/咗/晒/埋/返/番/吓/下)
    const aspectMatch = this.matchCantoneseAspectAtOffset(fullText, offset);
    if (aspectMatch) return aspectMatch;

    if (bestMatch) {
      bestMatch.start = bestStart;
      bestMatch.end = bestEnd;
      return bestMatch;
    }

    // 3. Fallback: Native Intl.Segmenter (with Cantonese 'zh-HK', 'yue' prioritized)
    const segmenter = getSharedZhSegmenter();
    if (segmenter) {
      try {
        const segments = segmenter.segment(fullText);
        for (const seg of segments) {
          const s = seg.index;
          const e = seg.index + seg.segment.length;
          if (offset >= s && offset < e) {
            const word = seg.segment;
            if (this.isChinese(word[0])) {
              return {
                word,
                entries: this.get(word) || [],
                length: Array.from(word).length,
                start: s,
                end: e,
              };
            }
          }
        }
      } catch {
        // ignore and fallback
      }
    }

    // 4. Ultimate fallback: single clicked character
    return {
      word: clickedChar,
      entries: this.get(clickedChar) || [],
      length: 1,
      start: offset,
      end: offset + clickedChar.length,
    };
  }

  /**
   * Maximum Matching (Longest-Match-First) search starting from the beginning of `text`
   */
  findLongestMatch(text: string, maxLen: number = 6): MatchResult | null {
    if (!this.isLoaded || !text || text.length === 0) {
      return null;
    }

    const codePoint = text.codePointAt(0);
    if (codePoint === undefined) return null;
    const firstChar = String.fromCodePoint(codePoint);
    if (!this.isChinese(firstChar)) {
      return null;
    }

    const checkLen = Math.min(text.length, maxLen * 2);

    for (let len = checkLen; len >= 1; len--) {
      if (len < text.length && text.charCodeAt(len) >= 0xdc00 && text.charCodeAt(len) <= 0xdfff) {
        continue;
      }
      const candidate = text.slice(0, len);
      const entries = this.data[candidate];
      if (entries && entries.length > 0) {
        return {
          word: candidate,
          entries: entries,
          length: Array.from(candidate).length,
        };
      }
    }

    return null;
  }

  /**
   * Direct lookup for an exact word.
   * If `preferredPinyin` is passed, the matching entry is prioritized first.
   * Also checks normalized punctuation variants (e.g. without Chinese commas).
   */
  get(word: string, preferredPinyin?: string): DictEntry[] | undefined {
    if (!word) return undefined;
    let entries = this.data[word];
    if (!entries || entries.length === 0) {
      const normKey = this.normalizedMap.get(word);
      if (normKey) {
        entries = this.data[normKey];
      }
    }
    if ((!entries || entries.length === 0) && /[，, ·、\s]/.test(word)) {
      const clean = word.replace(/[，, ·、\s]/g, "");
      if (this.data[clean]) {
        entries = this.data[clean];
      } else if (this.normalizedMap.has(clean)) {
        entries = this.data[this.normalizedMap.get(clean)!];
      }
    }
    if (!entries || entries.length === 0) return undefined;
    if (entries.length > 1 && !this.sortedEntriesCache.has(entries)) {
      const sorted = sortEntriesByPinyinFrequency(word, entries);
      this.data[word] = sorted;
      this.sortedEntriesCache.add(sorted);
      entries = sorted;
    }
    if (preferredPinyin) {
      return sortEntriesByPinyinFrequency(word, entries, preferredPinyin);
    }
    return entries;
  }

  /**
   * Returns a complete MatchResult for an exact word if it exists in dictionary.
   * If `preferredPinyin` is passed, the matching entry is prioritized first.
   */
  getExact(word: string, preferredPinyin?: string): MatchResult | null {
    const entries = this.get(word, preferredPinyin);
    if (entries && entries.length > 0) {
      return {
        word,
        entries,
        length: Array.from(word).length,
      };
    }
    return null;
  }

  /**
   * Matches whether the given word is a clause of a multi-clause proverb/idiom
   * (e.g. "活到老" or "学到老" from "活到老，学到老", "始于足下" from "千里之行，始于足下").
   * Synthesizes authentic clause pinyin, jyutping and idiom context definitions.
   */
  findIdiomClauseMatch(word: string): DictEntry[] | undefined {
    if (!word || word.length < 2) return undefined;
    const clean = word.trim();
    const clauseInfo = this.idiomClauseIndex.get(clean);
    if (!clauseInfo) return undefined;

    const parentEntries = this.data[clauseInfo.parentKey];
    if (!parentEntries || parentEntries.length === 0) return undefined;
    const parent = parentEntries[0];

    const parts = clauseInfo.parentKey.split(/[，,]/).map((p) => p.trim()).filter(Boolean);
    const idx = clauseInfo.clauseIndex;

    // Extract clause-specific pinyin from parent pinyin
    let clausePinyin = "";
    if (parent.pinyin) {
      const pinyinParts = parent.pinyin.split(/[,，]/).map((p) => p.trim());
      if (pinyinParts.length === parts.length) {
        clausePinyin = pinyinParts[idx];
      }
    }
    if (!clausePinyin) {
      const chars = Array.from(clean);
      clausePinyin = chars.map((c) => this.data[c]?.[0]?.pinyin || "").filter(Boolean).join(" ");
    }

    // Extract clause-specific jyutping from parent jyutping
    let clauseJyut = "";
    if (parent.jyutping) {
      const jyutParts = parent.jyutping.split(/[,，]/).map((p) => p.trim());
      if (jyutParts.length === parts.length) {
        clauseJyut = jyutParts[idx];
      }
    }

    let trad = clean;
    if (parent.traditional) {
      const tradParts = parent.traditional.split(/[，,]/).map((p) => p.trim());
      if (tradParts.length === parts.length) {
        trad = tradParts[idx];
      }
    }

    const idiomDef = parent.definitions?.[0] || "";
    const defs: string[] = [];
    if (idiomDef) {
      defs.push(`${idiomDef} (idiom: ${clauseInfo.parentKey})`);
    }

    return [
      {
        simplified: clean,
        traditional: trad,
        pinyin: clausePinyin,
        jyutping: clauseJyut || undefined,
        definitions: defs.length > 0 ? defs : (parent.definitions || []),
      },
    ];
  }

  /**
   * Segments a phrase into multi-character dictionary words using forward maximum matching.
   */
  segmentToWords(phrase: string): { word: string; entry: DictEntry | null }[] {
    const segments: { word: string; entry: DictEntry | null }[] = [];
    let i = 0;
    while (i < phrase.length) {
      let matched: { word: string; entry: DictEntry | null } | null = null;
      for (let len = Math.min(8, phrase.length - i); len >= 2; len--) {
        const sub = phrase.slice(i, i + len);
        const entries = this.get(sub);
        if (entries && entries.length > 0) {
          matched = { word: sub, entry: entries[0] };
          i += len;
          break;
        }
      }
      if (!matched) {
        const ch = phrase[i];
        matched = { word: ch, entry: this.get(ch)?.[0] || null };
        i++;
      }
      segments.push(matched);
    }
    return segments;
  }

  /**
   * Synthesizes a natural, coherent definition for multi-word phrases and expressions
   * (e.g. "非常好吃", "学中文", "今天天气很好", "不客气").
   */
  synthesizeMultiWordPhrase(phrase: string): DictEntry[] | undefined {
    const segs = this.segmentToWords(phrase);
    if (segs.length <= 1) return undefined;
    if (segs.every((s) => s.word.length === 1 && !s.entry)) return undefined;

    const pinyins: string[] = [];
    const jyuts: string[] = [];
    const trads: string[] = [];
    const glosses: string[] = [];
    const breakdownParts: string[] = [];

    for (const s of segs) {
      trads.push(s.entry?.traditional || s.word);
      if (s.entry?.pinyin) pinyins.push(s.entry.pinyin);
      if (s.entry?.jyutping) jyuts.push(s.entry.jyutping);
      const topDef = s.entry?.definitions?.[0]?.replace(/\(CL:[^)]+\)/g, "").trim() || s.word;
      const cleanDef = topDef.split(/[,;/]/)[0].trim();
      glosses.push(cleanDef);
      breakdownParts.push(`${s.word} (${cleanDef})`);
    }

    // Synthesize coherent phrase translation
    let mainGloss = "";
    if (segs.length === 2) {
      const w1 = segs[0].word;
      const d1 = glosses[0];
      const d2 = glosses[1];
      if (["非常", "很", "特别", "十分", "真", "最", "太"].includes(w1)) {
        mainGloss = `${d1} ${d2}`;
      } else if (["学", "看", "吃", "去", "做", "听", "读", "写"].includes(w1)) {
        mainGloss = `to ${d1.replace(/^to\s+/i, "")} ${d2}`;
      } else if (["不", "没", "别"].includes(w1)) {
        mainGloss = `not ${d2}`;
      } else {
        mainGloss = `${d1} ${d2}`;
      }
    } else {
      mainGloss = glosses.join(" ");
    }

    const defs: string[] = [];
    if (mainGloss) defs.push(mainGloss);
    defs.push(breakdownParts.join(" + "));

    return [
      {
        simplified: phrase,
        traditional: trads.join(""),
        pinyin: pinyins.join(" "),
        jyutping: jyuts.length === segs.length ? jyuts.join(" ") : undefined,
        definitions: defs,
      },
    ];
  }

  /**
   * Retrieves dictionary entries for a word or synthesizes compound definitions
   * for multi-character selections (proverbs, clauses, multi-word phrases, verb-complements).
   * Ensures selections never truncate or show meaningless character lists!
   */
  getOrSynthesize(word: string): DictEntry[] | undefined {
    if (!word) return undefined;
    const exact = this.get(word);
    if (exact && exact.length > 0) {
      return exact;
    }

    // 1. Check if word is a clause of a compound idiom / proverb (e.g. "活到老", "学到老", "始于足下")
    const idiomClause = this.findIdiomClauseMatch(word);
    if (idiomClause && idiomClause.length > 0) {
      return idiomClause;
    }

    const chars = Array.from(word);
    if (chars.length < 2 || chars.length > 16) {
      return undefined;
    }

    if (!chars.every((c) => this.isChinese(c) || /[，, ·、\s]/.test(c))) {
      return undefined;
    }

    // 2. Multi-word phrase segmentation and synthesis (e.g. "非常好吃", "学中文")
    const phraseSynthesis = this.synthesizeMultiWordPhrase(word);
    if (phraseSynthesis && phraseSynthesis.length > 0) {
      return phraseSynthesis;
    }

    // 3. Fallback: longest match in word
    const longest = this.findLongestMatch(word, 8);
    if (longest && longest.entries.length > 0) {
      return longest.entries;
    }

    // 4. Fallback: character-by-character
    const charEntries = chars.map((c) => this.get(c)?.[0]);
    const pinyins: string[] = [];
    const jyutpings: string[] = [];
    const trads: string[] = [];
    const defParts: string[] = [];

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const entry = charEntries[i];
      if (entry) {
        trads.push(entry.traditional || ch);
        if (entry.pinyin) pinyins.push(entry.pinyin);
        if (entry.jyutping) jyutpings.push(entry.jyutping);
        const topDefs = (entry.definitions || [])
          .slice(0, 2)
          .map((d) => d.replace(/\(CL:[^)]+\)/g, "").trim())
          .filter(Boolean);
        defParts.push(`${ch}: ${topDefs.join(", ") || "—"}`);
      } else {
        trads.push(ch);
      }
    }

    const synthesized: DictEntry = {
      simplified: word,
      traditional: trads.join(""),
      pinyin: pinyins.join(" "),
      jyutping: jyutpings.length === chars.length ? jyutpings.join(" ") : undefined,
      definitions: [defParts.join("; ")],
    };

    return [synthesized];
  }
}
