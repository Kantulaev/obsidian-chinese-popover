/**
 * Reverse Dictionary Engine (Multi-Language: EN, RU, DE, FR, ES, JA, KO, VI, IT, PT, etc. -> Chinese)
 * Allows users to learn in reverse: clicking or selecting any foreign word
 * reveals its Chinese counterpart with Pinyin, audio, stroke order & character breakdown.
 */

import type { DictionaryData } from "./dictionary.ts";
import { getHskLevel } from "./hsk.ts";
import { RUSSIAN_TRANSLATIONS } from "./russian-dict.ts";
import { MULTILANG_CORE_VOCAB } from "./multilang-data.ts";

export interface ReverseLookupResult {
  query: string;
  matchedKey: string;
  primaryWord: string;
  allWords: string[];
}

const PUNCT_RE = /[?!.,;:'"()[\]{}]/g;
const PAREN_TAG_RE = /\([^)]*\)|\[[^\]]*\]|<[^>]*>/g;
const EXAMPLE_TAIL_RE = /;\s*Bsp\.:.*$/i;
const PACK_SPLIT_RE = /[,;/]/;
const EN_SPLIT_RE = /[;/]/;
const LETTER_RE = /[\p{L}]/u;
const LEADING_TO_RE = /^to\s+/;

export class ReverseDictionaryEngine {
  private langIndexes = new Map<string, Map<string, string[]>>();
  private indexedPacks = new Set<string>();
  private isEnReady = false;
  private isRuReady = false;
  private isMultiCoreReady = false;
  private isBuilding = false;

  public getOrCreateIndex(lang: string): Map<string, string[]> {
    let map = this.langIndexes.get(lang);
    if (!map) {
      map = new Map<string, string[]>();
      this.langIndexes.set(lang, map);
    }
    return map;
  }

  /**
   * Initializes the reverse index from CC-CEDICT, Russian and multi-language core vocabulary.
   * Runs lazily so it never affects plugin startup time.
   */
  public ensureReady(dictData: DictionaryData): void {
    if ((this.isEnReady && this.isRuReady && this.isMultiCoreReady) || this.isBuilding) return;
    this.isBuilding = true;

    try {
      this.buildEnIndex(dictData);
      this.buildRuIndex();
      this.buildMultiLangCoreIndex();
    } finally {
      this.isBuilding = false;
    }
  }

  /**
   * Dynamically indexes any downloaded full dictionary pack (HanDeDict, CFDICT, etc.)
   * Only runs once per language pack.
   */
  public indexPack(langId: string, packData: Record<string, string[]>): void {
    if (this.indexedPacks.has(langId)) return;
    this.indexedPacks.add(langId);

    const idx = this.getOrCreateIndex(langId);
    for (const [chWord, defs] of Object.entries(packData)) {
      if (!defs || !Array.isArray(defs)) continue;
      for (const rawDef of defs) {
        const cleanDef = rawDef.replace(EXAMPLE_TAIL_RE, "").replace(PAREN_TAG_RE, " ");
        const parts = cleanDef.split(PACK_SPLIT_RE);
        for (const rawP of parts) {
          let s = rawP.trim().toLowerCase();
          if (!s) continue;
          s = s.replace(PUNCT_RE, "").trim();
          if (!s || s.length > 50) continue;
          if (s.length === 1 && !LETTER_RE.test(s)) continue;

          let list = idx.get(s);
          if (!list) {
            list = [chWord];
            idx.set(s, list);
          } else if (list.length < 35 && !list.includes(chWord)) {
            list.push(chWord);
          }
        }
      }
    }
  }

  public unindexPack(langId: string): void {
    this.indexedPacks.delete(langId);
    this.langIndexes.delete(langId);
  }

  /**
   * Builds the English inverted index: english_keyword -> Chinese word[]
   */
  private buildEnIndex(dictData: DictionaryData): void {
    if (this.isEnReady) return;
    const idx = this.getOrCreateIndex("en");

    for (const [chWord, entries] of Object.entries(dictData)) {
      if (!entries) continue;
      for (const entry of entries) {
        if (!entry.definitions) continue;
        for (const def of entry.definitions) {
          const parts = def.split(EN_SPLIT_RE);
          for (const rawPart of parts) {
            let s = rawPart.trim().toLowerCase();
            if (!s) continue;
            s = s.replace(PUNCT_RE, "").trim();
            if (!s || s.length > 40) continue;
            if (s.length === 1 && !LETTER_RE.test(s)) continue;

            const noTo = s.replace(LEADING_TO_RE, "").trim();
            const candidates = noTo !== s && noTo.length >= 1 ? [s, noTo] : [s];

            for (const cand of candidates) {
              let list = idx.get(cand);
              if (!list) {
                list = [chWord];
                idx.set(cand, list);
              } else if (list.length < 35 && !list.includes(chWord)) {
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
    const idx = this.getOrCreateIndex("ru");

    for (const [chWord, ruDefs] of Object.entries(RUSSIAN_TRANSLATIONS)) {
      for (const def of ruDefs) {
        const parts = def.split(/[,;/]/);
        for (const rawP of parts) {
          let s = rawP.trim().toLowerCase();
          s = s.replace(/[?!.,;:'"()[\]{}]/g, "").trim();
          if (!s || s.length > 40) continue;
          if (s.length === 1 && !/[\p{L}]/u.test(s)) continue;

          let list = idx.get(s);
          if (!list) {
            list = [];
            idx.set(s, list);
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
   * Builds inverted index from multi-language core vocabulary (20 languages)
   */
  private buildMultiLangCoreIndex(): void {
    if (this.isMultiCoreReady) return;

    for (const [chWord, langMap] of Object.entries(MULTILANG_CORE_VOCAB)) {
      for (const [langId, defs] of Object.entries(langMap)) {
        if (!defs || !Array.isArray(defs)) continue;
        const idx = this.getOrCreateIndex(langId);

        for (const def of defs) {
          const parts = def.split(/[,;/]/);
          for (const rawP of parts) {
            let s = rawP.trim().toLowerCase();
            s = s.replace(/[?!.,;:'"()[\]{}]/g, "").trim();
            if (!s || s.length > 50) continue;
            if (s.length === 1 && !/[\p{L}]/u.test(s)) continue;

            let list = idx.get(s);
            if (!list) {
              list = [];
              idx.set(s, list);
            }
            if (!list.includes(chWord) && list.length < 35) {
              list.push(chWord);
            }
          }
        }
      }
    }
    this.isMultiCoreReady = true;
  }

  /**
   * Detects the script of a foreign word for smart automatic language matching
   */
  public detectScript(q: string): string | null {
    if (/[\u0600-\u06ff]/u.test(q)) return "ar"; // Arabic
    if (/[\u0e00-\u0e7f]/u.test(q)) return "th"; // Thai
    if (/[\u0900-\u097f]/u.test(q)) return "hi"; // Devanagari (Hindi)
    if (/[\u3040-\u30ff]/u.test(q)) return "ja"; // Japanese Kana
    if (/[\uac00-\ud7af]/u.test(q)) return "ko"; // Korean Hangul
    if (/[а-яё]/i.test(q)) return "ru"; // Cyrillic
    if (/[\u0400-\u04ff]/u.test(q)) return "uk"; // Ukrainian Cyrillic
    return null;
  }

  /**
   * Multi-language inflection lemmatization
   */
  private lemmatize(w: string, lang: string): string[] {
    if (lang === "en") return this.lemmatizeEn(w);
    if (lang === "ru" || lang === "uk") return this.lemmatizeRu(w);
    if (lang === "de") return this.lemmatizeDe(w);
    if (["fr", "es", "it", "pt"].includes(lang)) return this.lemmatizeRomance(w);
    return [w];
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
   * Russian inflection lemmatization (cases, plurals, irregulars)
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
    const suffixes = ["ами", "ями", "ов", "ев", "ей", "ам", "ям", "ах", "ях", "ом", "ем", "ой", "ы", "и", "а", "я", "у", "ю", "е"];
    for (const suf of suffixes) {
      if (w.endsWith(suf) && w.length - suf.length >= 3) {
        forms.push(w.slice(0, -suf.length));
      }
    }

    // Adjective endings -> masculine nominative
    const adjSuffixes = ["ая", "яя", "ое", "ее", "ые", "ие", "ого", "его", "ому", "ему", "ым", "им", "ой", "ую", "юю"];
    for (const suf of adjSuffixes) {
      if (w.endsWith(suf) && w.length - suf.length >= 3) {
        const stem = w.slice(0, -suf.length);
        forms.push(stem + "ый", stem + "ий", stem + "ой");
      }
    }

    // Verb conjugations & past tense -> infinitive (-ть, -ать, -ить, -еть, -ять, -ться)
    const verbConjugations: Array<[string, string[]]> = [
      ["аешь", ["ать"]], ["ает", ["ать"]], ["аем", ["ать"]], ["аете", ["ать"]], ["ают", ["ать"]],
      ["аю", ["ать"]], ["ал", ["ать"]], ["ала", ["ать"]], ["али", ["ать"]], ["ало", ["ать"]],
      ["яешь", ["ять"]], ["яет", ["ять"]], ["яем", ["ять"]], ["яете", ["ять"]], ["яют", ["ять"]],
      ["яю", ["ять"]], ["ял", ["ять"]], ["яла", ["ять"]], ["яли", ["ять"]],
      ["ишь", ["ить", "еть"]], ["ит", ["ить", "еть"]], ["им", ["ить", "еть"]], ["ите", ["ить", "еть"]],
      ["ат", ["ить", "еть"]], ["ят", ["ить", "еть"]],
      ["ил", ["ить"]], ["ила", ["ить"]], ["или", ["ить"]], ["ел", ["еть"]], ["ела", ["еть"]], ["ели", ["еть"]],
      ["ется", ["аться", "ться", "еться"]], ["ются", ["аться", "ться", "яться"]],
      ["ится", ["иться"]], ["ятся", ["иться", "яться"]],
      ["ю", ["ть", "ать", "ить", "еть", "ять"]], ["у", ["ть", "ать", "ить"]],
    ];
    for (const [suf, infs] of verbConjugations) {
      if (w.endsWith(suf) && w.length - suf.length >= 2) {
        const stem = w.slice(0, -suf.length);
        for (const inf of infs) {
          forms.push(stem + inf);
        }
      }
    }

    return Array.from(new Set(forms));
  }

  /**
   * German inflection lemmatization (plurals, verb endings)
   */
  private lemmatizeDe(w: string): string[] {
    const forms = [w];
    if (w.endsWith("en") && w.length > 4) forms.push(w.slice(0, -2));
    if (w.endsWith("e") && w.length > 3) forms.push(w.slice(0, -1));
    if (w.endsWith("er") && w.length > 4) forms.push(w.slice(0, -2));
    if (w.endsWith("es") && w.length > 4) forms.push(w.slice(0, -2));
    if (w.endsWith("st") && w.length > 4) forms.push(w.slice(0, -2));
    if (w.endsWith("te") && w.length > 4) forms.push(w.slice(0, -2));
    if (w.startsWith("ge") && w.length > 5) forms.push(w.slice(2));
    return Array.from(new Set(forms));
  }

  /**
   * Romance languages inflection lemmatization (French, Spanish, Italian, Portuguese)
   */
  private lemmatizeRomance(w: string): string[] {
    const forms = [w];
    const strippedArticle = w.replace(/^(le|la|les|un|une|des|l'|d'|el|los|las|il|lo|gli|i|o|a|os|as)\s+/i, "");
    if (strippedArticle !== w) forms.push(strippedArticle);
    if (w.endsWith("s") && w.length > 3) forms.push(w.slice(0, -1));
    if (w.endsWith("es") && w.length > 4) forms.push(w.slice(0, -2));
    if (w.endsWith("i") && w.length > 3) forms.push(w.slice(0, -1));
    return Array.from(new Set(forms));
  }

  /**
   * Main reverse lookup entrypoint: finds Chinese translations for an English or foreign word.
   */
  public lookup(
    query: string,
    dictData: DictionaryData,
    preferredLang: string = "auto"
  ): ReverseLookupResult | null {
    if (!query) return null;
    const cleanQ = query.trim().toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    if (!cleanQ || cleanQ.length < 1) return null;
    if (cleanQ.length === 1 && !/[\p{L}]/u.test(cleanQ)) return null;

    this.ensureReady(dictData);

    const detected = this.detectScript(cleanQ);
    const searchLangs: string[] = [];

    if (preferredLang && preferredLang !== "auto") {
      searchLangs.push(preferredLang);
      if (detected && detected !== preferredLang) {
        searchLangs.push(detected);
      }
      if (preferredLang !== "en") {
        searchLangs.push("en");
      }
    } else {
      // Auto mode:
      if (detected) {
        searchLangs.push(detected);
        if (detected === "ru") searchLangs.push("uk");
      } else {
        // Latin script: search western language indices in relevance order, then en
        searchLangs.push("de", "fr", "es", "it", "pt", "id", "nl", "pl", "tr", "vi", "en");
      }
    }

    let matchedWords: string[] = [];
    let matchedKey = cleanQ;

    for (const lang of searchLangs) {
      const idx = this.langIndexes.get(lang);
      if (!idx) continue;
      const forms = this.lemmatize(cleanQ, lang);
      for (const form of forms) {
        const list = idx.get(form);
        if (list && list.length > 0) {
          matchedWords = list;
          matchedKey = form;
          break;
        }
      }
      if (matchedWords.length > 0) break;
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
