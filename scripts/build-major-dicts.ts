/**
 * Builds full offline dictionaries for German (HanDeDict), French (CFDICT), and Vietnamese (CVDICT).
 */

interface SourceConfig {
  id: string;
  url: string;
  fileName: string;
  name: string;
}

const SOURCES: SourceConfig[] = [
  {
    id: "de",
    url: "https://raw.githubusercontent.com/zydeo/HanDeDict/master/handedict.u8",
    fileName: "dicts/dict-de.json",
    name: "German (HanDeDict)",
  },
  {
    id: "fr",
    url: "https://raw.githubusercontent.com/aure231/cfdict-fr/master/cfdict.u8",
    fileName: "dicts/dict-fr.json",
    name: "French (CFDICT)",
  },
  {
    id: "vi",
    url: "https://raw.githubusercontent.com/ph0ngp/CVDICT/master/CVDICT.u8",
    fileName: "dicts/dict-vi.json",
    name: "Vietnamese (CVDICT)",
  },
];

function parseCedictFormat(text: string): Record<string, string[]> {
  const dict: Record<string, string[]> = {};

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

  return dict;
}

async function main() {
  for (const src of SOURCES) {
    console.log(`\n========================================`);
    console.log(`Downloading and parsing ${src.name}...`);
    try {
      const res = await fetch(src.url);
      if (!res.ok) {
        console.error(`Failed to download ${src.name}: ${res.status}`);
        continue;
      }

      const text = await res.text();
      const dict = parseCedictFormat(text);
      const count = Object.keys(dict).length;
      console.log(`Parsed ${count} entries for ${src.name}`);

      await Deno.writeTextFile(src.fileName, JSON.stringify(dict));
      const stats = await Deno.stat(src.fileName);
      console.log(`Saved ${src.fileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    } catch (err) {
      console.error(`Error processing ${src.name}:`, err);
    }
  }
}

main().catch(console.error);
