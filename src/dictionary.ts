import { Notice, Plugin } from "obsidian";

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

export class DictionaryManager {
  private data: DictionaryData = {};
  private isLoaded: boolean = false;
  private plugin: Plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
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
        this.data = JSON.parse(rawContent);
        this.isLoaded = true;
        const entryCount = Object.keys(this.data).length;
        console.log(
          `[Chinese Dict] Successfully loaded CC-CEDICT + Jyutping (${entryCount} words).`
        );
        return;
      }

      // If local file is not present, use built-in core vocabulary first
      this.data = FALLBACK_DICT;
      this.isLoaded = true;
      console.log(
        "[Chinese Dict] cedict.json not found locally. Starting background download from GitHub release..."
      );

      // Trigger automatic background download on first run
      this.downloadDictionary().catch((err) => {
        console.warn("[Chinese Dict] Automatic dictionary download skipped or failed:", err);
      });
    } catch (err) {
      console.error("[Chinese Dict] Failed to load dictionary:", err);
      this.data = FALLBACK_DICT;
      this.isLoaded = true;
    }
  }

  /**
   * Downloads cedict.json from GitHub release assets and caches it locally
   */
  async downloadDictionary(): Promise<boolean> {
    const dictPath = `${this.plugin.manifest.dir}/cedict.json`;
    const adapter = this.plugin.app.vault.adapter;

    const version = this.plugin.manifest.version || "1.0.0";
    const downloadUrl = `https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/${version}/cedict.json`;

    new Notice("Chinese Popover: Загрузка словаря... / Downloading dictionary database...", 4000);

    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const text = await res.text();
      await adapter.write(dictPath, text);
      this.data = JSON.parse(text);
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
    return Object.keys(this.data).length > 50;
  }

  isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Checks whether a character is a CJK Chinese ideograph
   */
  isChinese(char: string): boolean {
    if (!char) return false;
    return /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/.test(char);
  }

  /**
   * Finds the best matching Chinese word covering the given offset.
   * Tests candidates starting from (offset - maxLen + 1) up to offset,
   * selecting the longest match that contains the clicked character.
   */
  findWordAtOffset(
    fullText: string,
    offset: number,
    maxLen: number = 6
  ): MatchResult | null {
    if (!this.isLoaded || !fullText || offset < 0 || offset >= fullText.length) {
      return null;
    }

    const clickedChar = fullText[offset];
    if (!this.isChinese(clickedChar)) {
      return null;
    }

    let bestMatch: MatchResult | null = null;
    const minStart = Math.max(0, offset - maxLen + 1);

    for (let start = minStart; start <= offset; start++) {
      const maxCandidateLen = Math.min(fullText.length - start, maxLen);
      for (let len = maxCandidateLen; len >= 1; len--) {
        const end = start + len;
        if (offset >= start && offset < end) {
          const candidate = fullText.slice(start, end);
          const entries = this.data[candidate];
          if (entries && entries.length > 0) {
            if (!bestMatch || len > bestMatch.length) {
              bestMatch = {
                word: candidate,
                entries: entries,
                length: len,
              };
            }
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * Maximum Matching (Longest-Match-First) search starting from the beginning of `text`
   */
  findLongestMatch(text: string, maxLen: number = 6): MatchResult | null {
    if (!this.isLoaded || !text || text.length === 0) {
      return null;
    }

    const firstChar = text[0];
    if (!this.isChinese(firstChar)) {
      return null;
    }

    const checkLen = Math.min(text.length, maxLen);

    for (let len = checkLen; len >= 1; len--) {
      const candidate = text.slice(0, len);
      const entries = this.data[candidate];
      if (entries && entries.length > 0) {
        return {
          word: candidate,
          entries: entries,
          length: len,
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
