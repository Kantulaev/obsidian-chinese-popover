import { Notice, Plugin, requestUrl } from "obsidian";

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

export class DictionaryManager {
  private data: DictionaryData = {};
  private isLoaded: boolean = false;
  private plugin: Plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    this.data = Object.assign({}, FALLBACK_DICT, CANTONESE_CORE_DICT);
    this.isLoaded = true;
  }

  /**
   * Loads dictionary data from plugin's cedict.json file, or downloads it on first run
   */
  async load(): Promise<void> {
    try {
      const dictPath = `${this.plugin.manifest.dir}/cedict.json`;
      const adapter = this.plugin.app.vault.adapter;

      if (await adapter.exists(dictPath)) {
        const rawContent = await adapter.read(dictPath);
        this.data = Object.assign({}, JSON.parse(rawContent), CANTONESE_CORE_DICT);
        this.isLoaded = true;
        return;
      }

      // If local file is not present, use built-in core vocabulary first
      this.data = Object.assign({}, FALLBACK_DICT, CANTONESE_CORE_DICT);
      this.isLoaded = true;

      // Trigger automatic background download on first run
      this.downloadDictionary().catch((err) => {
        console.warn("[Chinese Dict] Automatic dictionary download skipped or failed:", err);
      });
    } catch (err) {
      console.error("[Chinese Dict] Failed to load dictionary:", err);
      this.data = Object.assign({}, FALLBACK_DICT, CANTONESE_CORE_DICT);
      this.isLoaded = true;
    }
  }

  /**
   * Downloads cedict.json from GitHub release assets and caches it locally
   */
  async downloadDictionary(): Promise<boolean> {
    const dictPath = `${this.plugin.manifest.dir}/cedict.json`;
    const adapter = this.plugin.app.vault.adapter;

    const version = this.plugin.manifest.version || "1.3.1";
    const downloadUrl = `https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/${version}/cedict.json`;
    const fallbackUrl = `https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.0.0/cedict.json`;

    new Notice("Chinese Popover: Загрузка словаря... / Downloading dictionary database...", 4000);

    try {
      let res;
      try {
        res = await requestUrl({ url: downloadUrl });
      } catch {
        res = await requestUrl({ url: fallbackUrl });
      }
      const text = res.text;
      await adapter.write(dictPath, text);
      this.data = Object.assign({}, JSON.parse(text), CANTONESE_CORE_DICT);
      this.isLoaded = true;
      const count = Object.keys(this.data).length;
      new Notice(`Chinese Popover: Словарь успешно загружен (${count} слов)!`, 5000);
      return true;
    } catch (err) {
      console.warn("[Chinese Dict] Failed to download dictionary file:", err);
      return false;
    }
  }

  isFullDictionaryLoaded(): boolean {
    return Object.keys(this.data).length > 200;
  }

  isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Checks whether text contains or consists of CJK Chinese ideographs
   * (including CJK Extension A through I, Cantonese HKSCS, and Kangxi radicals)
   */
  isChinese(text: string): boolean {
    if (!text) return false;
    return /\p{Script=Han}/u.test(text);
  }

  /**
   * Finds the best matching Chinese or Cantonese word covering the given offset.
   * Features:
   * - Full Unicode astral plane / surrogate pair support (HKSCS Cantonese characters)
   * - Longest-match search in CC-CEDICT + Cantonese Core Lexicon
   * - Cantonese A-not-A question patterns (3-char & 5-char)
   * - Cantonese potential / resultative complements (X得Y / X唔Y)
   * - Cantonese aspect markers (Verb + 緊/咗/晒/埋/返/番/吓/下)
   * - Native Intl.Segmenter fallback with Cantonese locales ('zh-HK', 'yue')
   */
  findWordAtOffset(
    fullText: string,
    offset: number,
    maxLen: number = 6
  ): MatchResult | null {
    if (!this.isLoaded || !fullText || offset < 0 || offset >= fullText.length) {
      return null;
    }

    // Adjust offset if pointing to a trailing surrogate (0xDC00 - 0xDFFF)
    if (offset > 0 && offset < fullText.length) {
      const code = fullText.charCodeAt(offset);
      if (code >= 0xdc00 && code <= 0xdfff) {
        offset--;
      }
    }

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

    // 1. Longest match search in dictionary (CEDICT + Cantonese Lexicon)
    for (let start = minStart; start <= offset; start++) {
      if (start > 0 && fullText.charCodeAt(start) >= 0xdc00 && fullText.charCodeAt(start) <= 0xdfff) {
        continue;
      }
      const maxCandidateLen = Math.min(fullText.length - start, maxLen * 2);
      for (let len = maxCandidateLen; len >= 1; len--) {
        const end = start + len;
        if (end < fullText.length && fullText.charCodeAt(end) >= 0xdc00 && fullText.charCodeAt(end) <= 0xdfff) {
          continue;
        }
        if (offset >= start && offset < end) {
          const candidate = fullText.slice(start, end);
          const entries = this.data[candidate];
          if (entries && entries.length > 0) {
            const charCount = Array.from(candidate).length;
            if (charCount <= maxLen) {
              if (!bestMatch || charCount > bestMatch.length) {
                bestMatch = {
                  word: candidate,
                  entries: entries,
                  length: charCount,
                  start: start,
                  end: end,
                };
                bestStart = start;
                bestEnd = end;
              }
            }
          }
        }
      }
    }

    // Check multi-character Cantonese grammatical patterns before accepting shorter dictionary matches
    if (!bestMatch || bestMatch.length < 3) {
      // 2a. A-not-A 5-character pattern: XY唔XY (e.g. 鍾意唔鍾意, 清楚唔清楚, 開心唔開心)
      for (let s = Math.max(0, offset - 4); s <= offset && s + 5 <= fullText.length; s++) {
        if (s > 0 && fullText.charCodeAt(s) >= 0xdc00 && fullText.charCodeAt(s) <= 0xdfff) continue;
        if (offset < s || offset >= s + 5) continue;
        const w1 = fullText.slice(s, s + 2);
        const mid = fullText[s + 2];
        const w2 = fullText.slice(s + 3, s + 5);
        if (w1 === w2 && (mid === "唔" || mid === "不") && this.isChinese(w1)) {
          const word = fullText.slice(s, s + 5);
          const baseEntries = this.data[w1] || [];
          const baseDef = baseEntries[0]?.definitions?.[0] || w1;
          const baseJyut = baseEntries[0]?.jyutping || "";
          const basePin = baseEntries[0]?.pinyin || "";
          const synthesizedEntries: DictEntry[] = [
            {
              traditional: word,
              pinyin: basePin ? `${basePin} bu4 ${basePin}` : "",
              jyutping: baseJyut ? `${baseJyut} m4 ${baseJyut}` : "",
              definitions: [`whether or not ${baseDef}? (Cantonese A-not-A question)`],
            },
          ];
          return {
            word,
            entries: this.data[word] || synthesizedEntries,
            length: 5,
            start: s,
            end: s + 5,
          };
        }
      }

      // 2b. A-not-A 3-character pattern: X唔X or X不X (e.g. 去唔去, 識唔識, 知唔知, 食唔食)
      for (let s = Math.max(0, offset - 2); s <= offset && s + 3 <= fullText.length; s++) {
        if (s > 0 && fullText.charCodeAt(s) >= 0xdc00 && fullText.charCodeAt(s) <= 0xdfff) continue;
        if (offset < s || offset >= s + 3) continue;
        const c0 = fullText[s];
        const c1 = fullText[s + 1];
        const c2 = fullText[s + 2];
        if (c0 === c2 && (c1 === "唔" || c1 === "不") && this.isChinese(c0)) {
          const word = fullText.slice(s, s + 3);
          const baseEntries = this.data[c0] || [];
          const baseDef = baseEntries[0]?.definitions?.[0] || c0;
          const baseJyut = baseEntries[0]?.jyutping || "";
          const basePin = baseEntries[0]?.pinyin || "";
          const synthesizedEntries: DictEntry[] = [
            {
              traditional: word,
              pinyin: basePin ? `${basePin} bu4 ${basePin}` : "",
              jyutping: baseJyut ? `${baseJyut} m4 ${baseJyut}` : "",
              definitions: [`whether or not to ${baseDef}? (Cantonese A-not-A question)`],
            },
          ];
          return {
            word,
            entries: this.data[word] || synthesizedEntries,
            length: 3,
            start: s,
            end: s + 3,
          };
        }
      }

      // 2c. Potential / Resultative complements: X得Y or X唔Y (e.g. 睇唔明, 聽得明, 搞得掂, 食唔落)
      const resultComplements = new Set(["明", "掂", "到", "落", "出", "入", "完", "好", "成", "開", "走"]);
      for (let s = Math.max(0, offset - 2); s <= offset && s + 3 <= fullText.length; s++) {
        if (s > 0 && fullText.charCodeAt(s) >= 0xdc00 && fullText.charCodeAt(s) <= 0xdfff) continue;
        if (offset < s || offset >= s + 3) continue;
        const c0 = fullText[s];
        const c1 = fullText[s + 1];
        const c2 = fullText[s + 2];
        if ((c1 === "得" || c1 === "唔") && resultComplements.has(c2) && this.isChinese(c0)) {
          const word = fullText.slice(s, s + 3);
          const baseEntries = this.data[c0] || [];
          const baseDef = baseEntries[0]?.definitions?.[0] || c0;
          const baseJyut = baseEntries[0]?.jyutping || "";
          const isAffirmative = c1 === "得";
          const synthesizedEntries: DictEntry[] = [
            {
              traditional: word,
              pinyin: "",
              jyutping: baseJyut ? `${baseJyut} ${isAffirmative ? "dak1" : "m4"} ...` : "",
              definitions: [
                isAffirmative
                  ? `able to ${baseDef} successfully (Cantonese potential complement)`
                  : `unable to ${baseDef} (Cantonese negative potential complement)`,
              ],
            },
          ];
          return {
            word,
            entries: this.data[word] || synthesizedEntries,
            length: 3,
            start: s,
            end: s + 3,
          };
        }
      }
    }

    // If a multi-character match (>= 2 chars) was found in the dictionary, return it
    if (bestMatch && bestMatch.length >= 2) {
      bestMatch.start = bestStart;
      bestMatch.end = bestEnd;
      return bestMatch;
    }

    // 2d. Verb + Cantonese Aspect marker: X緊, X咗, X晒, X埋, X返, X番, X吓, X下
    const aspectMarkers: Record<string, { jyut: string; desc: string }> = {
      "緊": { jyut: "gan2", desc: "currently doing (progressive aspect)" },
      "咗": { jyut: "zo2", desc: "completed / finished doing (perfective aspect)" },
      "晒": { jyut: "saai3", desc: "completely / entirely finished doing" },
      "埋": { jyut: "maai4", desc: "finish up / also doing" },
      "返": { jyut: "faan1", desc: "doing back / returning" },
      "番": { jyut: "faan1", desc: "doing back / again" },
      "吓": { jyut: "haa5", desc: "do a little bit / have a try" },
      "下": { jyut: "haa5", desc: "do a little bit / briefly" },
    };

    for (let s = Math.max(0, offset - 1); s <= offset && s + 2 <= fullText.length; s++) {
      if (s > 0 && fullText.charCodeAt(s) >= 0xdc00 && fullText.charCodeAt(s) <= 0xdfff) continue;
      if (offset < s || offset >= s + 2) continue;
      const c0 = fullText[s];
      const c1 = fullText[s + 1];
      const asp = aspectMarkers[c1];
      if (asp && this.isChinese(c0)) {
        const word = fullText.slice(s, s + 2);
        const baseEntries = this.data[c0] || [];
        const baseDef = baseEntries[0]?.definitions?.[0] || c0;
        const baseJyut = baseEntries[0]?.jyutping || "";
        const synthesizedEntries: DictEntry[] = [
          {
            traditional: word,
            pinyin: "",
            jyutping: baseJyut ? `${baseJyut} ${asp.jyut}` : "",
            definitions: [`${baseDef} (${asp.desc})`],
          },
        ];
        return {
          word,
          entries: this.data[word] || synthesizedEntries,
          length: 2,
          start: s,
          end: s + 2,
        };
      }
    }

    if (bestMatch) {
      bestMatch.start = bestStart;
      bestMatch.end = bestEnd;
      return bestMatch;
    }

    // 3. Fallback: Native Intl.Segmenter (with Cantonese 'zh-HK', 'yue' prioritized)
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      try {
        interface SegmenterType {
          segment(input: string): Iterable<{ segment: string; index: number }>;
        }
        interface IntlWithSegmenter {
          Segmenter: new (locales: string[], options: { granularity: string }) => SegmenterType;
        }
        const IntlSegmenter = (Intl as unknown as IntlWithSegmenter).Segmenter;
        const segmenter = new IntlSegmenter(["zh-HK", "yue", "zh-Hant", "zh-TW", "zh-CN", "zh"], {
          granularity: "word",
        });
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
   * Direct lookup for an exact word
   */
  get(word: string): DictEntry[] | undefined {
    return this.data[word];
  }
}
