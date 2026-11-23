import { MULTILANG_CORE_VOCAB } from "../src/multilang-data.ts";

async function main() {
  console.log("Building full Japanese dictionary (dict-ja.json)...");
  const dict: Record<string, string[]> = {};

  // 1. Fetch code4fukui/MJdic (122k CEDICT entries with Japanese translations)
  console.log("Fetching MJdic cedict_ts.csv...");
  try {
    const res = await fetch("https://raw.githubusercontent.com/code4fukui/MJdic/main/cedict_ts.csv");
    if (res.ok) {
      const text = await res.text();
      const lines = text.split("\n");
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const idx1 = line.indexOf(",");
        if (idx1 < 0) continue;
        const trad = line.substring(0, idx1).trim();
        const idx2 = line.indexOf(",", idx1 + 1);
        if (idx2 < 0) continue;
        const simp = line.substring(idx1 + 1, idx2).trim();
        const lastComma = line.lastIndexOf(",");
        if (lastComma <= idx2) continue;
        let ja = line.substring(lastComma + 1).trim();
        if (ja.startsWith('"') && ja.endsWith('"')) ja = ja.slice(1, -1);
        ja = ja.replace(/""/g, '"').trim();
        if (!ja) continue;

        const defs = ja.split(/[;；/／]/).map((d) => d.trim()).filter(Boolean).slice(0, 5);
        if (defs.length === 0) continue;

        if (simp) dict[simp] = defs;
        if (trad && trad !== simp) dict[trad] = defs;
      }
      console.log(`Loaded MJdic: ${Object.keys(dict).length} entries`);
    }
  } catch (e) {
    console.error("Error fetching MJdic:", e);
  }

  // 2. Fetch open-dict-data ja-zh_wiki.txt
  console.log("Fetching ja-zh_wiki.txt...");
  try {
    const res = await fetch("https://raw.githubusercontent.com/open-dict-data/wikidict-zh/master/data/ja-zh_wiki.txt");
    if (res.ok) {
      const text = await res.text();
      const lines = text.split("\n");
      let added = 0;
      for (const line of lines) {
        const parts = line.split("\t");
        if (parts.length >= 2) {
          const ja = parts[0].trim();
          const zh = parts[1].trim();
          if (zh && ja && !dict[zh]) {
            // Clean up Wikipedia disambiguations like "(映画)" or "(曖昧さ回避)"
            const cleanJa = ja.replace(/\s*\([^)]*\)$/, "").trim();
            if (cleanJa) {
              dict[zh] = [cleanJa];
              added++;
            }
          }
        }
      }
      console.log(`Added from ja-zh_wiki: ${added} entries`);
    }
  } catch (e) {
    console.error("Error fetching ja-zh_wiki:", e);
  }

  // 3. Ensure high priority core vocabulary from MULTILANG_CORE_VOCAB
  const coreJa = MULTILANG_CORE_VOCAB.ja;
  if (coreJa) {
    for (const [hanzi, defs] of Object.entries(coreJa)) {
      dict[hanzi] = defs;
    }
  }

  const keys = Object.keys(dict);
  console.log(`Total Japanese entries: ${keys.length}`);
  const jsonStr = JSON.stringify(dict);
  await Deno.writeTextFile("dicts/dict-ja.json", jsonStr);
  console.log(`Saved dicts/dict-ja.json (${(jsonStr.length / 1024 / 1024).toFixed(2)} MB)`);
}

if (import.meta.main) {
  await main();
}
