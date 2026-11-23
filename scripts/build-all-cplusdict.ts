/**
 * Builds full CC-CPLUSDICT packs for Portuguese, Indonesian, Thai, Japanese, French, Spanish, Russian.
 * Each pack contains 124,769 CC-CEDICT words translated directly into the target language,
 * merged with open-dict-data and core vocabulary.
 */

import { MULTILANG_CORE_VOCAB } from "../src/multilang-data.ts";

const CPLUS_LANGS = [
  { code: "pt", file: "CC-CPLUSDICT_pt.u8", name: "Portuguese" },
  { code: "id", file: "CC-CPLUSDICT_id.u8", name: "Indonesian" },
  { code: "th", file: "CC-CPLUSDICT_th.u8", name: "Thai" },
  { code: "ja", file: "CC-CPLUSDICT_ja.u8", name: "Japanese" },
  { code: "fr", file: "CC-CPLUSDICT_fr.u8", name: "French" },
  { code: "es", file: "CC-CPLUSDICT_es.u8", name: "Spanish" },
  { code: "ru", file: "CC-CPLUSDICT_ru.u8", name: "Russian" },
];

async function fetchCplusDict(fileName: string): Promise<Record<string, string[]>> {
  const url = `https://raw.githubusercontent.com/R8VEN-LLC/CC-CPLUSDICT/main/dictionaries/${fileName}`;
  const dict: Record<string, string[]> = {};

  try {
    const res = await fetch(url);
    if (!res.ok) return dict;

    const text = await res.text();
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.startsWith("#") || !line.trim()) continue;
      const slashIdx = line.indexOf("/");
      const lastSlashIdx = line.lastIndexOf("/");
      if (slashIdx < 0 || lastSlashIdx <= slashIdx) continue;

      const prefix = line.substring(0, slashIdx).trim();
      const rawDefs = line.substring(slashIdx + 1, lastSlashIdx).trim();

      const parts = prefix.split(/\s+/);
      if (parts.length >= 2) {
        const trad = parts[0];
        const simp = parts[1];
        const defs = rawDefs
          .split("/")
          .map((d) => d.trim())
          .filter((d) => d.length > 0 && !d.startsWith("CL:"));

        if (defs.length > 0) {
          dict[simp] = defs;
          if (trad !== simp) dict[trad] = defs;
        }
      }
    }
  } catch (err) {
    console.error(`Error loading ${fileName}:`, err);
  }

  return dict;
}

async function fetchWikiDict(langCode: string): Promise<Record<string, string[]>> {
  const dict: Record<string, string[]> = {};
  const url = `https://raw.githubusercontent.com/open-dict-data/wikidict-zh/master/data/${langCode}-zh_wiki.txt`;

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
  } catch (_e) {
    // optional
  }

  return dict;
}

async function buildOne(lang: { code: string; file: string; name: string }) {
  console.log(`Processing ${lang.name} (${lang.code})...`);

  // 1. Existing dict if any
  let existing: Record<string, string[]> = {};
  try {
    const prevText = await Deno.readTextFile(`dicts/dict-${lang.code}.json`);
    existing = JSON.parse(prevText);
  } catch (_e) {
    // start fresh
  }

  // 2. Fetch C+DICT
  const cplus = await fetchCplusDict(lang.file);
  console.log(`  Loaded ${Object.keys(cplus).length} C+DICT entries for ${lang.code}`);

  // 3. Fetch WikiDict
  const wiki = await fetchWikiDict(lang.code);
  console.log(`  Loaded ${Object.keys(wiki).length} Wiki entries for ${lang.code}`);

  // Merge: C+DICT has priority for rich everyday definitions, then existing, then wiki
  const merged: Record<string, string[]> = Object.assign({}, wiki, existing, cplus);

  // Guarantee core vocabulary
  for (const [hanzi, langMap] of Object.entries(MULTILANG_CORE_VOCAB)) {
    const defs = (langMap as Record<string, string[]>)[lang.code];
    if (defs && defs.length > 0) {
      merged[hanzi] = defs;
    }
  }

  const keys = Object.keys(merged);
  console.log(`  Total ${lang.name} entries: ${keys.length}`);

  const jsonStr = JSON.stringify(merged);
  await Deno.writeTextFile(`dicts/dict-${lang.code}.json`, jsonStr);
  console.log(`  Saved dicts/dict-${lang.code}.json (${(jsonStr.length / 1024 / 1024).toFixed(2)} MB)`);
}

async function main() {
  for (const lang of CPLUS_LANGS) {
    await buildOne(lang);
  }
}

if (import.meta.main) {
  await main();
}
