/**
 * Deno CC-CEDICT + Pleco Cantonese + CC-CANTO + Rime Jyutping Unified Dictionary Builder
 *
 * Downloads and merges:
 *   1. CC-CEDICT (~125k entries)
 *   2. Pleco CC-CEDICT Cantonese Readings (~105k hand-curated pronunciations)
 *   3. CC-Canto (Cantonese colloquial dictionary, ~22k entries)
 *   4. Rime Cantonese (Frequency-weighted Jyutping for words and characters)
 *
 * Generates:
 *   cedict.json with Pinyin, highly accurate Jyutping, and English translations.
 */

import { TextLineStream } from "jsr:@std/streams/text-line-stream";

const CEDICT_ZIP_URL =
  "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip";
const PLECO_CANTO_READINGS_URL =
  "https://raw.githubusercontent.com/amadeusine/cc-canto-data/master/cccedict-canto-readings.txt";
const CC_CANTO_URL =
  "https://raw.githubusercontent.com/amadeusine/cc-canto-data/master/cccanto-webdist.txt";
const JYUTPING_CHARS_URL =
  "https://raw.githubusercontent.com/rime/rime-cantonese/main/jyut6ping3.chars.dict.yaml";
const JYUTPING_WORDS_URL =
  "https://raw.githubusercontent.com/rime/rime-cantonese/main/jyut6ping3.words.dict.yaml";
const PINYIN_CHARS_URL =
  "https://raw.githubusercontent.com/mozillazg/pinyin-data/master/kHanyuPinlu.txt";
const PINYIN_WORDS_URL =
  "https://raw.githubusercontent.com/rime/rime-pinyin-simp/master/pinyin_simp.dict.yaml";

const outputFile = Deno.args[0] || "./cedict.json";

interface DictItem {
  simplified: string;
  traditional: string;
  pinyin: string;
  jyutping: string;
  definitions: string[];
}

function parseWeight(part?: string): number {
  if (!part) return 100;
  if (part.endsWith("%")) return parseFloat(part);
  const n = parseFloat(part);
  return isNaN(n) ? 100 : n;
}

async function fetchJyutpingDatabases(): Promise<{
  plecoMap: Map<string, string>;
  cantoWordMap: Map<string, string>;
  charMap: Map<string, string>;
}> {
  console.log("Fetching Cantonese Jyutping databases (Pleco + Rime)...");

  const [plecoRes, charsRes, wordsRes] = await Promise.all([
    fetch(PLECO_CANTO_READINGS_URL),
    fetch(JYUTPING_CHARS_URL),
    fetch(JYUTPING_WORDS_URL),
  ]);

  // 1. Pleco CC-CEDICT Cantonese Readings (highest priority, curated by native linguists)
  const plecoText = await plecoRes.text();
  const plecoMap = new Map<string, string>();
  const plecoRegex = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\{([^}]+)\}/;

  for (const line of plecoText.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const match = line.match(plecoRegex);
    if (match) {
      const trad = match[1];
      const simp = match[2];
      const pinyin = match[3].toLowerCase().replace(/\s+/g, "");
      const jp = match[4].trim();

      // Key by (trad, simp, pinyin) and fallback (trad, simp)
      plecoMap.set(`${trad}\t${simp}\t${pinyin}`, jp);
      if (!plecoMap.has(`${trad}\t${simp}`)) {
        plecoMap.set(`${trad}\t${simp}`, jp);
      }
    }
  }

  // 2. Rime frequency-weighted characters (picks dominant readings, ignores 0% archaic readings)
  const charsText = await charsRes.text();
  const charMap = new Map<string, string>();
  const charWeights = new Map<string, number>();

  for (const line of charsText.split("\n")) {
    if (
      line.startsWith("#") ||
      line.startsWith("---") ||
      line.startsWith("...") ||
      !line.trim()
    ) {
      continue;
    }
    const parts = line.split("\t");
    if (parts.length >= 2) {
      const ch = parts[0].trim();
      const jp = parts[1].trim();
      const weight = parseWeight(parts[2]);
      const currentWeight = charWeights.get(ch);
      if (currentWeight === undefined || weight > currentWeight) {
        charMap.set(ch, jp);
        charWeights.set(ch, weight);
      }
    }
  }

  // 3. Rime frequency-weighted words
  const wordsText = await wordsRes.text();
  const cantoWordMap = new Map<string, string>();
  const wordWeights = new Map<string, number>();

  for (const line of wordsText.split("\n")) {
    if (
      line.startsWith("#") ||
      line.startsWith("---") ||
      line.startsWith("...") ||
      !line.trim()
    ) {
      continue;
    }
    const parts = line.split("\t");
    if (parts.length >= 2) {
      const w = parts[0].trim();
      const jp = parts[1].trim();
      const weight = parseWeight(parts[2]);
      const currentWeight = wordWeights.get(w);
      if (currentWeight === undefined || weight > currentWeight) {
        cantoWordMap.set(w, jp);
        wordWeights.set(w, weight);
      }
    }
  }

  console.log(
    `Loaded ${plecoMap.size} Pleco curated readings, ${cantoWordMap.size} Rime words, ${charMap.size} dominant character readings.`
  );
  return { plecoMap, cantoWordMap, charMap };
}

function resolveJyutping(
  trad: string,
  simp: string,
  pinyin: string,
  plecoMap: Map<string, string>,
  cantoWordMap: Map<string, string>,
  charMap: Map<string, string>
): string {
  // 1. Highest priority: Pleco's hand-curated CC-CEDICT reading
  const normPinyin = pinyin.toLowerCase().replace(/\s+/g, "");
  const pKey = `${trad}\t${simp}\t${normPinyin}`;
  if (plecoMap.has(pKey)) return plecoMap.get(pKey)!;

  const wKey = `${trad}\t${simp}`;
  if (plecoMap.has(wKey)) return plecoMap.get(wKey)!;

  // 2. High priority: Rime Cantonese compound word dictionary
  if (cantoWordMap.has(trad)) return cantoWordMap.get(trad)!;
  if (cantoWordMap.has(simp)) return cantoWordMap.get(simp)!;

  // 3. Fallback: Character-by-character with dominant frequency weights
  const syllables: string[] = [];
  for (let i = 0; i < trad.length; i++) {
    const chTrad = trad[i];
    const chSimp = simp ? simp[i] : chTrad;
    if (charMap.has(chTrad)) {
      syllables.push(charMap.get(chTrad)!);
    } else if (charMap.has(chSimp)) {
      syllables.push(charMap.get(chSimp)!);
    } else {
      syllables.push(chTrad);
    }
  }
  return syllables.join(" ");
}

function stripPinyin(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[1-5]/g, "")
    .replace(/ü/g, "v")
    .replace(/u:/g, "v")
    .replace(/\s+/g, "")
    .trim();
}

async function fetchPinyinDatabases(): Promise<{
  charDominantMap: Map<string, string[]>;
  rimeWordWeights: Map<string, Map<string, number>>;
}> {
  console.log("Fetching Mandarin Pinyin frequency databases (kHanyuPinlu + Rime)...");
  const [pinluRes, rimeRes] = await Promise.all([
    fetch(PINYIN_CHARS_URL),
    fetch(PINYIN_WORDS_URL),
  ]);

  const markToTone: Record<string, string> = {
    "\u0304": "1",
    "\u0301": "2",
    "\u030c": "3",
    "\u0300": "4",
  };

  function accentedToNumbered(s: string): string {
    return s
      .split(/\s+/)
      .map((syl) => {
        let tone = "5";
        let base = syl
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, (m) => {
            if (markToTone[m]) tone = markToTone[m];
            return "";
          });
        base = base.replace(/ü/g, "u:").replace(/v/g, "u:");
        return (base + tone).toLowerCase();
      })
      .join(" ");
  }

  const pinluText = await pinluRes.text();
  const charDominantMap = new Map<string, string[]>();

  for (const line of pinluText.split("\n")) {
    if (!line.startsWith("U+")) continue;
    const parts = line.split("#");
    const ch = parts[1]?.trim();
    const readings = parts[0].split(":")[1]?.trim();
    if (ch && readings) {
      let list = readings.split(",").map((s) => accentedToNumbered(s.trim()));
      if (ch === "长") {
        list = ["chang2", "zhang3"];
      }
      charDominantMap.set(ch, list);
    }
  }

  // Canonical overrides for essential characters
  charDominantMap.set("着", ["zhe5", "zhao2", "zhuo2", "zhao1"]);
  charDominantMap.set("看", ["kan4", "kan1"]);
  charDominantMap.set("得", ["de5", "de2", "dei3"]);
  charDominantMap.set("还", ["hai2", "huan2"]);
  charDominantMap.set("行", ["xing2", "hang2"]);
  charDominantMap.set("的", ["de5", "di4", "di2"]);
  charDominantMap.set("地", ["de5", "di4"]);
  charDominantMap.set("了", ["le5", "liao3"]);
  charDominantMap.set("便", ["bian4", "pian2"]);
  charDominantMap.set("数", ["shu4", "shu3"]);
  charDominantMap.set("重", ["zhong4", "chong2"]);
  charDominantMap.set("发", ["fa1", "fa4"]);
  charDominantMap.set("给", ["gei3", "ji3"]);
  charDominantMap.set("没", ["mei2", "mo4"]);
  charDominantMap.set("只", ["zhi3", "zhi1"]);
  charDominantMap.set("教", ["jiao4", "jiao1"]);
  charDominantMap.set("乐", ["le4", "yue4"]);
  charDominantMap.set("为", ["wei4", "wei2"]);
  charDominantMap.set("当", ["dang1", "dang4"]);
  charDominantMap.set("长", ["chang2", "zhang3"]);
  charDominantMap.set("好", ["hao3", "hao4"]);

  const rimeText = await rimeRes.text();
  const rimeWordWeights = new Map<string, Map<string, number>>();

  for (const line of rimeText.split("\n")) {
    if (
      line.startsWith("#") ||
      line.startsWith("---") ||
      line.startsWith("...") ||
      !line.trim()
    ) {
      continue;
    }
    const parts = line.split("\t");
    if (parts.length >= 2) {
      const word = parts[0].trim();
      const pinyin = parts[1].trim().toLowerCase().replace(/\s+/g, "");
      const weight = parts[2] ? parseFloat(parts[2]) : 1;
      if (!rimeWordWeights.has(word)) {
        rimeWordWeights.set(word, new Map());
      }
      rimeWordWeights.get(word)!.set(pinyin, weight);
    }
  }

  console.log(
    `Loaded ${charDominantMap.size} character frequency rankings, ${rimeWordWeights.size} Rime word weights.`
  );
  return { charDominantMap, rimeWordWeights };
}

async function main() {
  console.log("=== CC-CEDICT + Pleco Cantonese + Mandarin Frequency Builder ===");

  const [jyutpingDbs, pinyinDbs] = await Promise.all([
    fetchJyutpingDatabases(),
    fetchPinyinDatabases(),
  ]);
  const { plecoMap, cantoWordMap, charMap } = jyutpingDbs;
  const { charDominantMap, rimeWordWeights } = pinyinDbs;

  let cedictPath = "./cedict_ts.u8";
  if (!tryStat(cedictPath)) {
    console.log("Downloading CC-CEDICT zip archive...");
    const zipRes = await fetch(CEDICT_ZIP_URL);
    const zipBuf = new Uint8Array(await zipRes.arrayBuffer());

    const view = new DataView(zipBuf.buffer, zipBuf.byteOffset, zipBuf.byteLength);
    for (let i = 0; i < zipBuf.length - 30; i++) {
      if (view.getUint32(i, true) === 0x04034b50) {
        const compression = view.getUint16(i + 8, true);
        const compSize = view.getUint32(i + 18, true);
        const nameLen = view.getUint16(i + 26, true);
        const extraLen = view.getUint16(i + 28, true);
        const name = new TextDecoder().decode(
          zipBuf.subarray(i + 30, i + 30 + nameLen)
        );
        const dataStart = i + 30 + nameLen + extraLen;
        const dataEnd = dataStart + compSize;

        if (name.includes("cedict_ts.u8") || name.endsWith(".u8")) {
          const compData = zipBuf.subarray(dataStart, dataEnd);
          if (compression === 0) {
            await Deno.writeFile(cedictPath, compData);
          } else if (compression === 8) {
            const ds = new DecompressionStream("deflate-raw");
            const writer = ds.writable.getWriter();
            writer.write(compData);
            writer.close();
            const decomp = new Uint8Array(
              await new Response(ds.readable).arrayBuffer()
            );
            await Deno.writeFile(cedictPath, decomp);
          }
          break;
        }
        i = dataEnd - 1;
      }
    }
  }

  const dict: Record<string, DictItem[]> = Object.create(null);
  const startTime = Date.now();

  // 1. Process CC-CEDICT (~125k entries)
  console.log("Processing CC-CEDICT with Pleco Cantonese readings...");
  const file = await Deno.open(cedictPath, { read: true });
  const lineStream = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());

  const cedictRegex = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/$/;
  let cedictCount = 0;

  for await (const line of (lineStream as unknown as AsyncIterable<string>)) {
    if (!line || line.startsWith("#")) continue;

    const match = line.match(cedictRegex);
    if (!match) continue;

    const traditional = match[1];
    const simplified = match[2];
    const pinyin = match[3];
    const rawDefs = match[4];

    const definitions = rawDefs
      .split("/")
      .map((d: string) => d.trim())
      .filter((d: string) => d.length > 0);

    const jyutping = resolveJyutping(
      traditional,
      simplified,
      pinyin,
      plecoMap,
      cantoWordMap,
      charMap
    );

    const entry: DictItem = {
      simplified,
      traditional,
      pinyin,
      jyutping,
      definitions,
    };

    if (!dict[simplified]) dict[simplified] = [entry];
    else dict[simplified].push(entry);

    if (traditional !== simplified) {
      if (!dict[traditional]) dict[traditional] = [entry];
      else dict[traditional].push(entry);
    }

    cedictCount++;
  }

  // 2. Process CC-Canto (~22k Cantonese-specific colloquial entries)
  console.log("Processing CC-Canto Cantonese colloquial database...");
  try {
    const cantoRes = await fetch(CC_CANTO_URL);
    const cantoText = await cantoRes.text();
    const cantoRegex = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\{([^}]+)\}\s+\/(.+)\/$/;
    let cantoAdded = 0;

    for (const line of cantoText.split("\n")) {
      if (!line || line.startsWith("#")) continue;
      const match = line.match(cantoRegex);
      if (!match) continue;

      const traditional = match[1];
      const simplified = match[2];
      const pinyin = match[3];
      const jyutping = match[4].trim();
      const rawDefs = match[5];

      const definitions = rawDefs
        .split("/")
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      const entry: DictItem = {
        simplified,
        traditional,
        pinyin,
        jyutping,
        definitions,
      };

      if (!dict[simplified]) {
        dict[simplified] = [entry];
        cantoAdded++;
      } else {
        const existing = dict[simplified][0];
        if (existing && !existing.jyutping) {
          existing.jyutping = jyutping;
        }
      }

      if (traditional !== simplified) {
        if (!dict[traditional]) {
          dict[traditional] = [entry];
          cantoAdded++;
        } else {
          const existing = dict[traditional][0];
          if (existing && !existing.jyutping) {
            existing.jyutping = jyutping;
          }
        }
      }
    }
    console.log(`CC-Canto added ${cantoAdded} unique Cantonese entries.`);
  } catch (err) {
    console.warn("Could not merge CC-Canto:", (err as Error)?.message ?? err);
  }

  console.log("Sorting dictionary entries by Pinyin & Jyutping frequency...");
  let reorderedCount = 0;

  for (const [key, entries] of Object.entries(dict)) {
    if (entries.length <= 1) continue;

    // Deduplicate entries with identical traditional, simplified, pinyin, and jyutping
    const mergedMap = new Map<string, DictItem>();
    for (const item of entries) {
      const sig = `${item.traditional}\t${item.simplified}\t${item.pinyin}\t${item.jyutping}`;
      const existing = mergedMap.get(sig);
      if (existing) {
        for (const def of item.definitions) {
          if (!existing.definitions.includes(def)) {
            existing.definitions.push(def);
          }
        }
      } else {
        mergedMap.set(sig, { ...item, definitions: [...item.definitions] });
      }
    }
    const dedupedEntries = Array.from(mergedMap.values());

    const dominantList = charDominantMap.get(key);
    const rimeMap = rimeWordWeights.get(key);

    dedupedEntries.sort((a, b) => {
      // 1. Dominant character reading from kHanyuPinlu
      if (dominantList && dominantList.length > 0) {
        const aNorm = a.pinyin.toLowerCase().replace(/ü/g, "u:").replace(/v/g, "u:").trim();
        const bNorm = b.pinyin.toLowerCase().replace(/ü/g, "u:").replace(/v/g, "u:").trim();
        let aIdx = dominantList.indexOf(aNorm);
        let bIdx = dominantList.indexOf(bNorm);
        if (aIdx === -1) {
          aIdx = dominantList.findIndex((d) => d.slice(0, -1) === aNorm.slice(0, -1));
          if (aIdx !== -1) aIdx += 0.5;
        }
        if (bIdx === -1) {
          bIdx = dominantList.findIndex((d) => d.slice(0, -1) === bNorm.slice(0, -1));
          if (bIdx !== -1) bIdx += 0.5;
        }
        const aScore = aIdx === -1 ? 999 : aIdx;
        const bScore = bIdx === -1 ? 999 : bIdx;
        if (aScore !== bScore) {
          return aScore - bScore;
        }
      }

      // 2. Rime compound word weight
      if (rimeMap) {
        const aClean = stripPinyin(a.pinyin);
        const bClean = stripPinyin(b.pinyin);
        const aWeight = rimeMap.get(aClean) ?? -1;
        const bWeight = rimeMap.get(bClean) ?? -1;
        if (aWeight !== bWeight) {
          return bWeight - aWeight;
        }
      }

      // 3. Deprioritize surnames
      const aIsSurname = a.definitions.some((d) => d.toLowerCase().includes("surname "));
      const bIsSurname = b.definitions.some((d) => d.toLowerCase().includes("surname "));
      if (aIsSurname !== bIsSurname) {
        return aIsSurname ? 1 : -1;
      }

      // 4. Deprioritize cross-reference variants
      const aIsVariant = a.definitions.some(
        (d) => d.startsWith("variant of ") || d.startsWith("see ")
      );
      const bIsVariant = b.definitions.some(
        (d) => d.startsWith("variant of ") || d.startsWith("see ")
      );
      if (aIsVariant !== bIsVariant) {
        return aIsVariant ? 1 : -1;
      }

      return 0;
    });

    dict[key] = dedupedEntries;
    reorderedCount++;
  }
  console.log(`Frequency sorting and deduplication completed on ${reorderedCount} multi-entry words.`);

  console.log("Writing final JSON dictionary...");
  await Deno.writeTextFile(outputFile, JSON.stringify(dict));

  try {
    await Deno.remove(cedictPath);
  } catch (_) {
    // ignore
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const fileStat = await Deno.stat(outputFile);
  const sizeMb = (fileStat.size / (1024 * 1024)).toFixed(2);
  const uniqueKeys = Object.keys(dict).length;

  console.log("====================================");
  console.log(`Dictionary completed in ${duration}s!`);
  console.log(`- CC-CEDICT entries:  ${cedictCount}`);
  console.log(`- Total lookup keys:  ${uniqueKeys}`);
  console.log(`- Output file:        ${outputFile} (${sizeMb} MB)`);
  console.log("====================================");
}

function tryStat(path: string): boolean {
  try {
    Deno.statSync(path);
    return true;
  } catch {
    return false;
  }
}

main().catch((err) => {
  console.error("Error building dictionary:", err);
  Deno.exit(1);
});
