/**
 * BKRS DSL to dict-ru.json Parser & Builder
 * Produces an optimized, comprehensive Russian dictionary pack (< 25 MB).
 */

import { RUSSIAN_TRANSLATIONS } from "../src/russian-dict.ts";

function cleanDslLine(line: string): string[] {
  let s = line.replace(/\[\/?m\d?\]/g, "").trim();

  // Skip cross references, "См. также", internal dictionary links
  if (s.includes("См. также") || s.startsWith("[c]См.") || s.startsWith("[ref]") || s.startsWith("см. ")) {
    return [];
  }

  // Remove [p]...[/p], [c]...[/c]
  s = s.replace(/\[p\]трад\.\[\/p\].*$/g, "");
  s = s.replace(/\[p\][\s\S]*?\[\/p\]/g, "");
  s = s.replace(/\[c\][\s\S]*?\[\/c\]/g, "");
  s = s.replace(/\[\*\][\s\S]*?\[\/\*\]/g, ""); // inline examples
  s = s.replace(/\[\*\][\s\S]*$/g, "");
  s = s.replace(/\[\/?(i|b|c|p|ref|ex|trn|com|\*)\]/g, "");
  s = s.replace(/\\\[/g, "[").replace(/\\\]/g, "]");

  s = s.replace(/\s+/g, " ").trim();
  if (!s || s.length > 200) return [];

  // Split numbered items like "1) foo 2) bar" or "1. foo 2. bar"
  if (/\b[1-9]\)/.test(s)) {
    return s.split(/\s*[1-9]\)\s*/).map((p) => p.trim()).filter((p) => p.length > 0 && p.length < 120);
  }

  // Split by semicolon if long
  if (s.includes(";")) {
    return s.split(";").map((p) => p.trim()).filter((p) => p.length > 0 && p.length < 120);
  }

  return [s];
}

async function main() {
  console.log("Loading cedict.json keys for prioritization...");
  const cedictRaw = await Deno.readTextFile("cedict.json");
  const cedict = JSON.parse(cedictRaw);
  const cedictKeys = new Set(Object.keys(cedict));
  console.log(`Loaded ${cedictKeys.size} keys from cedict.json`);

  console.log("Parsing temp_bkrs.dsl...");
  const f = await Deno.open("temp_bkrs.dsl");
  const decoder = new TextDecoder("utf-16le");

  const result: Record<string, string[]> = {};

  // Seed with curated translations
  for (const [w, defs] of Object.entries(RUSSIAN_TRANSLATIONS)) {
    result[w] = [...defs];
  }

  let leftover = "";
  const buf = new Uint8Array(64 * 1024);

  let currentWords: string[] = [];
  let currentDefs: string[] = [];

  function commitEntry() {
    if (currentWords.length > 0 && currentDefs.length > 0) {
      const uniqueDefs: string[] = [];
      for (const d of currentDefs) {
        if (!uniqueDefs.includes(d) && uniqueDefs.length < 5) {
          uniqueDefs.push(d);
        }
      }

      if (uniqueDefs.length > 0) {
        for (const w of currentWords) {
          // Include if present in CEDICT (matches all popover dictionary words)
          if (cedictKeys.has(w)) {
            if (!result[w] || result[w].length === 0) {
              result[w] = uniqueDefs;
            }
          }
        }
      }
    }
    currentWords = [];
    currentDefs = [];
  }

  while (true) {
    const bytesRead = await f.read(buf);
    if (bytesRead === null || bytesRead === 0) break;

    const chunk = decoder.decode(buf.subarray(0, bytesRead), { stream: true });
    const fullText = leftover + chunk;
    const lines = fullText.split(/\r?\n/);
    leftover = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("#")) continue;

      if (!line.startsWith(" ") && !line.startsWith("\t")) {
        const headword = line.trim();
        if (headword.length > 0) {
          commitEntry();
          if (/[\u4e00-\u9fff]/.test(headword) && headword.length <= 10) {
            currentWords.push(headword);
          }
        }
      } else {
        const trimmed = line.trim();
        if (currentWords.length === 0) continue;

        if (trimmed.startsWith("[p]трад.[/p]")) {
          const trad = trimmed.replace("[p]трад.[/p]", "").trim();
          if (trad && /[\u4e00-\u9fff]/.test(trad) && !currentWords.includes(trad)) {
            currentWords.push(trad);
          }
        } else if (trimmed.includes("[m1]") || trimmed.includes("[m2]")) {
          const cleaned = cleanDslLine(trimmed);
          for (const c of cleaned) {
            if (c && !currentDefs.includes(c) && currentDefs.length < 5) {
              currentDefs.push(c);
            }
          }
        }
      }
    }
  }

  commitEntry();
  f.close();

  console.log(`DSL parsing complete! Filtered entries: ${Object.keys(result).length}`);
  console.log(`Writing compact dicts/dict-ru.json...`);

  // Compact JSON (no pretty print indentation)
  await Deno.writeTextFile("dicts/dict-ru.json", JSON.stringify(result));

  const stats = await Deno.stat("dicts/dict-ru.json");
  console.log(`Successfully generated dicts/dict-ru.json! Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
