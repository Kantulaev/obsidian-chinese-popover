import { MULTILANG_CORE_VOCAB } from "../src/multilang-data.ts";

async function buildKorean() {
  console.log("Building full Korean dictionary (dict-ko.json)...");
  const dict: Record<string, string[]> = {};

  // 1. Fetch CC-CPLUSDICT_ko.u8 (124,769 CC-CEDICT entries with reviewed Korean translations)
  console.log("Fetching CC-CPLUSDICT_ko.u8...");
  const res = await fetch("https://raw.githubusercontent.com/R8VEN-LLC/CC-CPLUSDICT/main/dictionaries/CC-CPLUSDICT_ko.u8");
  if (!res.ok) throw new Error("Failed to fetch CC-CPLUSDICT_ko.u8");
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
  console.log(`Loaded CC-CPLUSDICT Korean: ${Object.keys(dict).length} entries`);

  // 2. Merge open-dict-data ko-zh_wiki.txt for encyclopedia/proper nouns
  console.log("Fetching ko-zh_wiki.txt...");
  try {
    const wikiRes = await fetch("https://raw.githubusercontent.com/open-dict-data/wikidict-zh/master/data/ko-zh_wiki.txt");
    if (wikiRes.ok) {
      const wikiText = await wikiRes.text();
      const wikiLines = wikiText.split("\n");
      let added = 0;
      for (const line of wikiLines) {
        const parts = line.split("\t");
        if (parts.length >= 2) {
          const ko = parts[0].trim();
          const zh = parts[1].trim();
          if (zh && ko && !dict[zh]) {
            const clean = ko.replace(/\s*\([^)]*\)$/, "").trim();
            if (clean && clean !== zh) {
              dict[zh] = [clean];
              added++;
            }
          }
        }
      }
      console.log(`Added from ko-zh_wiki: ${added} entries`);
    }
  } catch (err) {
    console.warn("Could not fetch ko-zh_wiki:", err);
  }

  // 3. Ensure high priority core vocabulary
  for (const [hanzi, langMap] of Object.entries(MULTILANG_CORE_VOCAB)) {
    const defs = (langMap as Record<string, string[]>).ko;
    if (defs && defs.length > 0) {
      dict[hanzi] = defs;
    }
  }

  console.log(`Total Korean entries: ${Object.keys(dict).length}`);
  const jsonStr = JSON.stringify(dict);
  await Deno.writeTextFile("dicts/dict-ko.json", jsonStr);
  console.log(`Saved dicts/dict-ko.json (${(jsonStr.length / 1024 / 1024).toFixed(2)} MB)`);
}

if (import.meta.main) {
  await buildKorean();
}
