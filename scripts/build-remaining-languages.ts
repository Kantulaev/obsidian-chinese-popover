/**
 * Builds complete offline dictionaries for Arabic, Turkish, Italian, Polish, Dutch, Ukrainian, and Hindi.
 * Incorporates:
 * 1. 5,387 HSK 1-6 core Chinese words (every verb, adjective, particle, noun)
 * 2. 100,000 - 300,000 open-dict-data entries (indexing both simplified and traditional forms)
 * 3. MULTILANG_CORE_VOCAB
 */

import { MULTILANG_CORE_VOCAB } from "../src/multilang-data.ts";

interface HskItem {
  word: string;
  pinyin: string;
  en: string;
  ru?: string;
  tr?: string;
  ar?: string;
}

async function loadHskWords(): Promise<HskItem[]> {
  console.log("Fetching HSK 1-6 datasets from hanyutong...");
  const allItems: HskItem[] = [];
  for (const file of ["hsk1_2.json", "hsk3_4.json", "hsk5_6.json"]) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/SHLINOvO/hanyutong_app_group/master/assets/words/${file}`);
      if (res.ok) {
        const data = await res.json();
        allItems.push(...data);
      }
    } catch (err) {
      console.error(`Failed to load ${file}:`, err);
    }
  }
  console.log(`Total HSK items loaded: ${allItems.length}`);
  return allItems;
}

async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  const query = texts.join("\n");
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(query)}`
    );
    if (!res.ok) return texts;
    const data = await res.json();
    const fullText = (data[0] as Array<[string]>).map((chunk) => chunk[0]).join("");
    const lines = fullText.split("\n").map((s: string) => s.trim());
    return lines;
  } catch (_e) {
    return texts;
  }
}

async function fetchWikiDict(wikiCode: string): Promise<Record<string, string[]>> {
  const dict: Record<string, string[]> = {};
  const url = `https://raw.githubusercontent.com/open-dict-data/wikidict-zh/master/data/${wikiCode}-zh_wiki.txt`;

  try {
    const res = await fetch(url);
    if (!res.ok) return dict;

    const text = await res.text();
    const lines = text.split("\n");

    for (const line of lines) {
      const parts = line.split("\t");
      if (parts.length >= 2) {
        const foreign = parts[0].trim();
        const zh = parts[1].trim();
        if (zh && foreign && !dict[zh]) {
          const clean = foreign.replace(/\s*\([^)]*\)$/, "").trim();
          if (clean && clean !== zh) {
            dict[zh] = [clean];
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Wiki fetch failed for ${wikiCode}:`, err);
  }

  return dict;
}

async function buildAll() {
  const hskItems = await loadHskWords();

  // Load cedict for simplified <-> traditional cross-indexing
  console.log("Loading cedict.json for trad/simp indexing...");
  const cedictMap: Record<string, { simp?: string; trad?: string }> = {};
  try {
    const cedictRaw = JSON.parse(await Deno.readTextFile("cedict.json"));
    for (const [key, entries] of Object.entries(cedictRaw) as [string, Array<{ simplified?: string; traditional?: string }>][]) {
      if (Array.isArray(entries) && entries.length > 0) {
        cedictMap[key] = {
          simp: entries[0].simplified || key,
          trad: entries[0].traditional || key,
        };
      }
    }
  } catch (_e) {
    // optional
  }

  // 1. Process Arabic (ar) and Turkish (tr) directly from HSK data + Wiki
  for (const lang of [
    { code: "ar", name: "Arabic", key: "ar" },
    { code: "tr", name: "Turkish", key: "tr" },
  ]) {
    console.log(`Building full ${lang.name} (${lang.code})...`);
    const dict: Record<string, string[]> = {};

    // A. Wiki base
    const wiki = await fetchWikiDict(lang.code);
    for (const [zh, defs] of Object.entries(wiki)) {
      dict[zh] = defs;
      const mapping = cedictMap[zh];
      if (mapping) {
        if (mapping.simp && !dict[mapping.simp]) dict[mapping.simp] = defs;
        if (mapping.trad && !dict[mapping.trad]) dict[mapping.trad] = defs;
      }
    }

    // B. HSK 1-6 words
    for (const item of hskItems) {
      const def = (item as unknown as Record<string, string | undefined>)[lang.key];
      if (def && typeof def === "string" && def.trim()) {
        const defs = [def.trim()];
        dict[item.word] = defs;
        const mapping = cedictMap[item.word];
        if (mapping) {
          if (mapping.simp) dict[mapping.simp] = defs;
          if (mapping.trad) dict[mapping.trad] = defs;
        }
      }
    }

    // C. Core vocab
    for (const [hanzi, langMap] of Object.entries(MULTILANG_CORE_VOCAB)) {
      const defs = (langMap as Record<string, string[]>)[lang.code];
      if (defs && defs.length > 0) {
        dict[hanzi] = defs;
      }
    }

    console.log(`  Total ${lang.name} entries: ${Object.keys(dict).length}`);
    const jsonStr = JSON.stringify(dict);
    await Deno.writeTextFile(`dicts/dict-${lang.code}.json`, jsonStr);
    console.log(`  Saved dicts/dict-${lang.code}.json (${(jsonStr.length / 1024 / 1024).toFixed(2)} MB)`);
  }

  // 2. Process Italian, Polish, Dutch, Ukrainian, Hindi with batch translated HSK words + Wiki
  const batchLangs = [
    { code: "it", name: "Italian" },
    { code: "pl", name: "Polish" },
    { code: "nl", name: "Dutch" },
    { code: "uk", name: "Ukrainian" },
    { code: "hi", name: "Hindi" },
  ];

  // Batch translate HSK words for each language
  const BATCH_SIZE = 80;
  for (const lang of batchLangs) {
    console.log(`Building full ${lang.name} (${lang.code})...`);
    const dict: Record<string, string[]> = {};

    // A. Wiki base
    const wiki = await fetchWikiDict(lang.code);
    for (const [zh, defs] of Object.entries(wiki)) {
      dict[zh] = defs;
      const mapping = cedictMap[zh];
      if (mapping) {
        if (mapping.simp && !dict[mapping.simp]) dict[mapping.simp] = defs;
        if (mapping.trad && !dict[mapping.trad]) dict[mapping.trad] = defs;
      }
    }

    // B. Batch translate HSK words
    console.log(`  Translating HSK 1-6 core vocabulary to ${lang.name}...`);
    for (let i = 0; i < hskItems.length; i += BATCH_SIZE) {
      const chunk = hskItems.slice(i, i + BATCH_SIZE);
      const enList = chunk.map((c) => c.en || c.word);
      const translated = await translateBatch(enList, lang.code);

      for (let j = 0; j < chunk.length; j++) {
        const item = chunk[j];
        const trans = translated[j] || item.en;
        if (trans) {
          const defs = [trans];
          dict[item.word] = defs;
          const mapping = cedictMap[item.word];
          if (mapping) {
            if (mapping.simp) dict[mapping.simp] = defs;
            if (mapping.trad) dict[mapping.trad] = defs;
          }
        }
      }
      // Small pause to be polite
      await new Promise((r) => setTimeout(r, 60));
    }

    // C. Core vocab
    for (const [hanzi, langMap] of Object.entries(MULTILANG_CORE_VOCAB)) {
      const defs = (langMap as Record<string, string[]>)[lang.code];
      if (defs && defs.length > 0) {
        dict[hanzi] = defs;
      }
    }

    console.log(`  Total ${lang.name} entries: ${Object.keys(dict).length}`);
    const jsonStr = JSON.stringify(dict);
    await Deno.writeTextFile(`dicts/dict-${lang.code}.json`, jsonStr);
    console.log(`  Saved dicts/dict-${lang.code}.json (${(jsonStr.length / 1024 / 1024).toFixed(2)} MB)`);
  }
}

if (import.meta.main) {
  await buildAll();
}
