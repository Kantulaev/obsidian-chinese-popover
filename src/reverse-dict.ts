/**
 * Reverse Dictionary Engine (English / Russian / Foreign Words -> Chinese)
 * Allows users to learn in reverse: clicking or selecting any foreign word
 * reveals its Chinese counterpart with Pinyin, audio, stroke order & character breakdown.
 */

import type { DictionaryData } from "./dictionary.ts";
import { getHskLevel } from "./hsk.ts";
import { RUSSIAN_TRANSLATIONS } from "./russian-dict.ts";

export interface ReverseLookupResult {
  query: string;
  matchedKey: string;
  primaryWord: string;
  allWords: string[];
}

export class ReverseDictionaryEngine {
  private enIndex = new Map<string, string[]>();
  private ruIndex = new Map<string, string[]>();
  private isEnReady = false;
  private isRuReady = false;
  private isBuilding = false;

  /**
   * Initializes the reverse index from CC-CEDICT and Russian definitions.
   * Runs lazily so it never affects plugin startup time.
   */
  public ensureReady(dictData: DictionaryData): void {
    if ((this.isEnReady && this.isRuReady) || this.isBuilding) return;
    this.isBuilding = true;

    try {
      this.buildEnIndex(dictData);
      this.buildRuIndex();
    } finally {
      this.isBuilding = false;
    }
  }

  /**
   * Builds the English inverted index: english_keyword -> Chinese word[]
   */
  private buildEnIndex(dictData: DictionaryData): void {
    if (this.isEnReady) return;

    for (const [chWord, entries] of Object.entries(dictData)) {
      if (!entries) continue;
      for (const entry of entries) {
        if (!entry.definitions) continue;
        for (const def of entry.definitions) {
          const parts = def.split(/[;/]/);
          for (const rawPart of parts) {
            let s = rawPart.trim().toLowerCase();
            s = s.replace(/[?!.,;:'"()[\]{}]/g, "").trim();
            if (!s || s.length > 40) continue;
            if (s.length === 1 && !/[\p{L}]/u.test(s)) continue;

            const noTo = s.replace(/^to\s+/, "").trim();
            const candidates = [s];
            if (noTo !== s && noTo.length >= 1) {
              candidates.push(noTo);
            }

            for (const cand of candidates) {
              let list = this.enIndex.get(cand);
              if (!list) {
                list = [];
                this.enIndex.set(cand, list);
              }
              if (!list.includes(chWord) && list.length < 35) {
                list.push(chWord);
              }
            }
          }
        }
      }
    }
    this.isEnReady = true;
  }

  /**
   * Builds the Russian inverted index: russian_keyword -> Chinese word[]
   */
  private buildRuIndex(): void {
    if (this.isRuReady) return;

    for (const [chWord, ruDefs] of Object.entries(RUSSIAN_TRANSLATIONS)) {
      for (const def of ruDefs) {
        const parts = def.split(/[,;/]/);
        for (const rawP of parts) {
          let s = rawP.trim().toLowerCase();
          s = s.replace(/[?!.,;:'"()[\]{}]/g, "").trim();
          if (!s || s.length > 40) continue;
          if (s.length === 1 && !/[\p{L}]/u.test(s)) continue;

          let list = this.ruIndex.get(s);
          if (!list) {
            list = [];
            this.ruIndex.set(s, list);
          }
          if (!list.includes(chWord) && list.length < 35) {
            list.push(chWord);
          }
        }
      }
    }
    this.isRuReady = true;
  }

  /**
   * English inflection lemmatization (plurals, verbs, adverbs)
   */
  private lemmatizeEn(w: string): string[] {
    const forms: string[] = [w];

    const enIrregulars: Record<string, string> = {
      men: "man",
      women: "woman",
      children: "child",
      people: "person",
      went: "go",
      gone: "go",
      better: "good",
      best: "good",
      worse: "bad",
      worst: "bad",
    };
    if (enIrregulars[w]) {
      forms.push(enIrregulars[w]);
    }

    // Plurals
    if (w.endsWith("ies") && w.length > 4) forms.push(w.slice(0, -3) + "y");
    if (w.endsWith("es") && w.length > 3) forms.push(w.slice(0, -2));
    if (w.endsWith("s") && !w.endsWith("ss") && w.length > 2) forms.push(w.slice(0, -1));

    // Verbs
    if (w.endsWith("ing") && w.length > 4) {
      forms.push(w.slice(0, -3));
      forms.push(w.slice(0, -3) + "e");
      // Double consonant (e.g. running -> run)
      if (w.length > 5 && w[w.length - 4] === w[w.length - 5]) {
        forms.push(w.slice(0, -4));
      }
    }
    if (w.endsWith("ed") && w.length > 3) {
      forms.push(w.slice(0, -2));
      forms.push(w.slice(0, -1));
      if (w.endsWith("ied") && w.length > 4) {
        forms.push(w.slice(0, -3) + "y");
      }
    }

    // Adverbs
    if (w.endsWith("ly") && w.length > 4) {
      forms.push(w.slice(0, -2));
      if (w.endsWith("ily")) {
        forms.push(w.slice(0, -3) + "y");
      }
    }

    return Array.from(new Set(forms));
  }

  /**
   * Russian inflection lemmatization (cases, plurals, adjectives)
   */
  private lemmatizeRu(w: string): string[] {
    const forms: string[] = [w];

    const ruIrregulars: Record<string, string> = {
      друзья: "друг",
      друзей: "друг",
      друзьям: "друг",
      друзьями: "друг",
      братья: "брат",
      братьев: "брат",
      сыновья: "сын",
      сыновей: "сын",
      люди: "человек",
      людей: "человек",
      людям: "человек",
      людьми: "человек",
      дети: "ребенок",
      детей: "ребенок",
      детям: "ребенок",
      детьми: "ребенок",
    };
    if (ruIrregulars[w]) {
      forms.push(ruIrregulars[w]);
    }

    // Plurals & Cases endings
    const suffixes = ["ами", "ями", "ов", "ев", "ей", "ам", "ям", "ах", "ях", "ом", "ем", "ой", "ей", "ы", "и", "а", "я", "у", "ю", "е"];
    for (const suf of suffixes) {
      if (w.endsWith(suf) && w.length - suf.length >= 3) {
        forms.push(w.slice(0, -suf.length));
      }
    }

    return Array.from(new Set(forms));
  }

  /**
   * Main reverse lookup entrypoint: finds Chinese translations for an English or foreign word.
   */
  public lookup(
    query: string,
    dictData: DictionaryData,
    preferredLang: string = "en"
  ): ReverseLookupResult | null {
    if (!query) return null;
    const cleanQ = query.trim().toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    if (!cleanQ || cleanQ.length < 1) return null;
    if (cleanQ.length === 1 && !/[\p{L}]/u.test(cleanQ)) return null;

    this.ensureReady(dictData);

    const isCyrillic = /[а-яё]/i.test(cleanQ);
    let matchedWords: string[] = [];
    let matchedKey = cleanQ;

    if (isCyrillic || preferredLang === "ru") {
      // 1. Search Russian index
      const ruForms = this.lemmatizeRu(cleanQ);
      for (const form of ruForms) {
        const list = this.ruIndex.get(form);
        if (list && list.length > 0) {
          matchedWords = list;
          matchedKey = form;
          break;
        }
      }
    }

    // 2. If no Russian match or preferred language is English/auto, search English index
    if (matchedWords.length === 0 && (!isCyrillic || preferredLang !== "ru")) {
      const enForms = this.lemmatizeEn(cleanQ);
      for (const form of enForms) {
        const list = this.enIndex.get(form);
        if (list && list.length > 0) {
          matchedWords = list;
          matchedKey = form;
          break;
        }
      }
    }

    if (matchedWords.length === 0) {
      return null;
    }

    // Rank words intelligently:
    // 1. Exact match in first definition
    // 2. HSK level (HSK 1 words come first, then 2, 3, 4, 5, 6)
    // 3. Length of Chinese word (2-char words preferred over long idioms)
    // 4. Concise focus of definitions
    const ranked = this.rankResults(matchedWords, matchedKey, dictData);
    if (ranked.length === 0) return null;

    return {
      query: cleanQ,
      matchedKey,
      primaryWord: ranked[0],
      allWords: ranked.slice(0, 8),
    };
  }

  /**
   * Ranks matching Chinese words so the most practical, natural learner words appear first.
   */
  private rankResults(words: string[], keyword: string, dictData: DictionaryData): string[] {
    const scored = words.map((word) => {
      let score = 0;
      const entries = dictData[word];

      // HSK Level bonus
      const hsk = getHskLevel(word);
      if (hsk !== null) {
        score += (7 - hsk) * 40; // HSK 1: +240, HSK 2: +200, etc.
      }

      // Word length bonus (2-character words are standard Chinese vocabulary)
      const len = Array.from(word).length;
      if (len === 2) {
        score += 50;
      } else if (len === 1) {
        score += 35;
      } else if (len === 3) {
        score += 20;
      } else if (len === 4) {
        score += 10;
      }

      // Exact primary definition match
      if (entries && entries[0] && entries[0].definitions) {
        const firstDef = entries[0].definitions[0]?.toLowerCase().trim() || "";
        const allDefs = entries.flatMap((e) => e.definitions.map((d) => d.toLowerCase()));

        if (firstDef === keyword || firstDef === "to " + keyword) {
          score += 150;
        } else if (firstDef.startsWith(keyword + ";") || firstDef.startsWith(keyword + " ")) {
          score += 100;
        } else if (allDefs.some((d) => d === keyword || d === "to " + keyword)) {
          score += 70;
        }

        // Definition focus: award words where this is the primary/sole definition
        score += Math.max(0, 40 - entries[0].definitions.length * 5);
      }

      // Prefer Simplified Chinese characters
      if (entries && entries[0]?.simplified === word) {
        score += 25;
      }

      return { word, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Filter duplicate words (e.g. simplified and traditional if both present)
    const seen = new Set<string>();
    const finalWords: string[] = [];

    for (const item of scored) {
      if (!seen.has(item.word)) {
        seen.add(item.word);
        finalWords.push(item.word);
      }
    }

    return finalWords;
  }
}

export const reverseDictionary = new ReverseDictionaryEngine();
