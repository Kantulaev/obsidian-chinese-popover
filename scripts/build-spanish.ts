/**
 * Builder for dicts/dict-es.json from cedict_es.u8 and nar-ran/hsk-vocab-es
 */

const ES_CEDICT_URL =
  "https://raw.githubusercontent.com/jmjm93/cedict-translations/v0.9/languages/es/cedict_es.u8";

const HSK_LEVEL_URLS = [
  "https://raw.githubusercontent.com/nar-ran/hsk-vocab-es/main/data/hsk1.json",
  "https://raw.githubusercontent.com/nar-ran/hsk-vocab-es/main/data/hsk2.json",
  "https://raw.githubusercontent.com/nar-ran/hsk-vocab-es/main/data/hsk3.json",
  "https://raw.githubusercontent.com/nar-ran/hsk-vocab-es/main/data/hsk4.json",
  "https://raw.githubusercontent.com/nar-ran/hsk-vocab-es/main/data/hsk5.json",
  "https://raw.githubusercontent.com/nar-ran/hsk-vocab-es/main/data/hsk6.json",
  "https://raw.githubusercontent.com/nar-ran/hsk-vocab-es/main/data/hsk7-9.json",
];

async function main() {
  console.log("Fetching Spanish CC-CEDICT (cedict_es.u8)...");
  const res = await fetch(ES_CEDICT_URL);
  if (!res.ok) throw new Error(`Failed to fetch cedict_es.u8: ${res.status}`);
  const text = await res.text();

  const dict: Record<string, string[]> = {};

  // 1. Parse cedict_es.u8
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\//);
    if (!m) continue;

    const trad = m[1];
    const simp = m[2];
    const defs = m[4]
      .split("/")
      .map((d) => d.trim())
      .filter((d) => d.length > 0 && !d.startsWith("CL:") && !d.startsWith("pr. "))
      .slice(0, 4);

    if (defs.length > 0) {
      if (!dict[simp]) dict[simp] = defs;
      if (trad !== simp && !dict[trad]) dict[trad] = defs;
    }
  }
  console.log(`Parsed ${Object.keys(dict).length} entries from cedict_es.u8`);

  // 2. Supplement with curated HSK 1-9 Spanish translations
  for (const hskUrl of HSK_LEVEL_URLS) {
    try {
      console.log(`Fetching ${hskUrl.split("/").pop()}...`);
      const hskRes = await fetch(hskUrl);
      if (hskRes.ok) {
        const hskData = await hskRes.json();
        // Add words
        if (Array.isArray(hskData.words)) {
          for (const item of hskData.words) {
            if (item.hanzi && Array.isArray(item.translation) && item.translation.length > 0) {
              const cleanDefs = item.translation.map((t: string) => t.trim()).filter((t: string) => t.length > 0);
              // Prepend or set curated HSK translation
              dict[item.hanzi] = cleanDefs.slice(0, 4);
            }
          }
        }
        // Add single characters
        if (Array.isArray(hskData.characters)) {
          for (const item of hskData.characters) {
            if (item.hanzi && Array.isArray(item.translation) && item.translation.length > 0) {
              const cleanDefs = item.translation.map((t: string) => t.trim()).filter((t: string) => t.length > 0);
              if (!dict[item.hanzi]) {
                dict[item.hanzi] = cleanDefs.slice(0, 4);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch HSK file:", err);
    }
  }

  console.log(`Total Spanish entries: ${Object.keys(dict).length}`);
  console.log(`Writing to dicts/dict-es.json...`);
  await Deno.writeTextFile("dicts/dict-es.json", JSON.stringify(dict));

  const stats = await Deno.stat("dicts/dict-es.json");
  console.log(`Successfully generated dicts/dict-es.json! Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
