/**
 * Builds full offline dictionaries for all remaining languages using:
 * 1. open-dict-data/wikidict-zh (multi-megabyte interlanguage corpus)
 * 2. Crow-Tech multi-language definitions (website/*.json.gz)
 * 3. MULTILANG_CORE_VOCAB (curated high-frequency core vocabulary)
 * 4. High-frequency essential grammar words (conjunctions, pronouns, numbers, common verbs)
 */

import { MULTILANG_CORE_VOCAB } from "../src/multilang-data.ts";

const TARGET_LANGS: Array<{ code: string; name: string; wikiCode: string; crowCode?: string }> = [
  { code: "it", name: "Italian", wikiCode: "it", crowCode: "it" },
  { code: "pt", name: "Portuguese", wikiCode: "pt", crowCode: "pt" },
  { code: "ko", name: "Korean", wikiCode: "ko", crowCode: "ko" },
  { code: "pl", name: "Polish", wikiCode: "pl", crowCode: "pl" },
  { code: "nl", name: "Dutch", wikiCode: "nl", crowCode: "nl" },
  { code: "uk", name: "Ukrainian", wikiCode: "uk", crowCode: "ru" },
  { code: "tr", name: "Turkish", wikiCode: "tr", crowCode: "tr" },
  { code: "th", name: "Thai", wikiCode: "th", crowCode: "th" },
  { code: "id", name: "Indonesian", wikiCode: "id", crowCode: "id" },
  { code: "ar", name: "Arabic", wikiCode: "ar", crowCode: "ar" },
  { code: "hi", name: "Hindi", wikiCode: "hi" },
];

/**
 * Essential high frequency function words and basic vocabulary
 */
const COMMON_GRAMMAR_VOCAB: Record<string, Record<string, string[]>> = {
  "如果": {
    it: ["se", "nel caso in cui", "qualora"],
    pt: ["se", "caso", "no caso de"],
    ko: ["만약", "만일", "만약에"],
    pl: ["jeśli", "jeżeli", "w wypadku"],
    nl: ["als", "indien", "in het geval dat"],
    uk: ["якщо", "якби", "у разі якщо"],
    tr: ["eğer", "şayet", "ise"],
    th: ["ถ้า", "หาก", "สมมติว่า"],
    id: ["jika", "kalau", "apabila"],
    ar: ["إذا", "لو", "إن"],
    hi: ["अगर", "यदि", "जो"],
  },
  "但是": {
    it: ["ma", "però", "tuttavia", "bensì"],
    pt: ["mas", "porém", "contudo", "todavia"],
    ko: ["하지만", "그러나", "그렇지만"],
    pl: ["ale", "lecz", "jednak"],
    nl: ["maar", "echter", "doch"],
    uk: ["але", "проте", "однак"],
    tr: ["fakat", "ama", "ancak", "lakin"],
    th: ["แต่", "ทว่า", "แต่ว่า"],
    id: ["tetapi", "tapi", "namun"],
    ar: ["لكن", "ولكن", "غير أن"],
    hi: ["लेकिन", "परन्तु", "मगर", "किन्तु"],
  },
  "虽然": {
    it: ["sebbene", "benché", "nonostante"],
    pt: ["embora", "apesar de", "posto que"],
    ko: ["비록 ~일지라도", "비록"],
    pl: ["chociaż", "aczkolwiek", "mimo że"],
    nl: ["hoewel", "ofschoon"],
    uk: ["хоча", "дарма що"],
    tr: ["rağmen", "karşın", "ise de"],
    th: ["แม้ว่า", "ถึงแม้ว่า"],
    id: ["walaupun", "meskipun", "kendatipun"],
    ar: ["على الرغم من", "مع أن"],
    hi: ["यद्यपि", "हालाँकि"],
  },
  "因为": {
    it: ["perché", "poiché", "giacché"],
    pt: ["porque", "pois", "visto que"],
    ko: ["왜냐하면", "때문에"],
    pl: ["ponieważ", "bo", "dlatego że"],
    nl: ["omdat", "doordat", "want"],
    uk: ["тому що", "бо", "оскільки"],
    tr: ["çünkü", "zira", "-dığı için"],
    th: ["เพราะว่า", "เนื่องจาก"],
    id: ["karena", "sebab"],
    ar: ["لأن", "بسبب"],
    hi: ["क्योंकि", "चूंकि"],
  },
  "所以": {
    it: ["quindi", "dunque", "perciò"],
    pt: ["portanto", "por isso", "assim"],
    ko: ["그래서", "그러므로", "따라서"],
    pl: ["dlatego", "więc", "zatem"],
    nl: ["daarom", "dus", "vandaar"],
    uk: ["тому", "відтак", "отже"],
    tr: ["bu yüzden", "dolayısıyla", "bu sebeple"],
    th: ["ดังนั้น", "จึง", "เพราะฉะนั้น"],
    id: ["oleh karena itu", "sehingga", "maka"],
    ar: ["لذلك", "وبالتالي", "لهذا"],
    hi: ["इसलिए", "अतः"],
  },
  "我们": {
    it: ["noi"],
    pt: ["nós", "a gente"],
    ko: ["우리", "저희"],
    pl: ["my"],
    nl: ["wij", "we"],
    uk: ["ми"],
    tr: ["biz"],
    th: ["พวกเรา", "เรา"],
    id: ["kami", "kita"],
    ar: ["نحن"],
    hi: ["हम", "हम लोग"],
  },
  "你们": {
    it: ["voi"],
    pt: ["vocês", "vós"],
    ko: ["너희", "여러분", "당신들"],
    pl: ["wy"],
    nl: ["jullie"],
    uk: ["ви"],
    tr: ["siz", "sizler"],
    th: ["พวกคุณ", "พวกเธอ"],
    id: ["kalian", "kamu sekalian"],
    ar: ["أنتم"],
    hi: ["आप लोग", "तुम लोग"],
  },
  "他们": {
    it: ["loro", "essi"],
    pt: ["eles"],
    ko: ["그들"],
    pl: ["oni"],
    nl: ["zij", "ze"],
    uk: ["вони"],
    tr: ["onlar"],
    th: ["พวกเขา"],
    id: ["mereka"],
    ar: ["هم"],
    hi: ["वे", "वे लोग"],
  },
  "这": {
    it: ["questo", "questa"],
    pt: ["isto", "este", "esta"],
    ko: ["이", "이것"],
    pl: ["to", "ten", "ta"],
    nl: ["dit", "deze"],
    uk: ["це", "цей", "ця"],
    tr: ["bu"],
    th: ["นี้", "นี่"],
    id: ["ini"],
    ar: ["هذا", "هذه"],
    hi: ["यह", "ये"],
  },
  "那": {
    it: ["quello", "quella"],
    pt: ["aquilo", "aquele", "aquela"],
    ko: ["그", "저", "그것"],
    pl: ["tamto", "tamten"],
    nl: ["dat", "die"],
    uk: ["те", "той", "та"],
    tr: ["şu", "o"],
    th: ["นั้น", "นั่น", "โน่น"],
    id: ["itu"],
    ar: ["ذاك", "ذلك", "تلك"],
    hi: ["वह", "वो"],
  },
  "什么": {
    it: ["cosa", "che cosa", "quale"],
    pt: ["o que", "que", "qual"],
    ko: ["무엇", "뭐"],
    pl: ["co", "jaki"],
    nl: ["wat", "welk"],
    uk: ["що", "який"],
    tr: ["ne", "hangi"],
    th: ["อะไร"],
    id: ["apa"],
    ar: ["ماذا", "ما"],
    hi: ["क्या"],
  },
  "谁": {
    it: ["chi"],
    pt: ["quem"],
    ko: ["누구"],
    pl: ["kto"],
    nl: ["wie"],
    uk: ["хто"],
    tr: ["kim"],
    th: ["ใคร"],
    id: ["siapa"],
    ar: ["من"],
    hi: ["कौन"],
  },
  "世界": {
    it: ["mondo", "universo"],
    pt: ["mundo", "universo"],
    ko: ["세계", "세상"],
    pl: ["świat"],
    nl: ["wereld"],
    uk: ["світ"],
    tr: ["dünya", "alem"],
    th: ["โลก"],
    id: ["dunia"],
    ar: ["العالم", "دنيا"],
    hi: ["संसार", "दुनिया", "विश्व"],
  },
};

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
    console.error(`Failed to fetch wiki dict for ${wikiCode}:`, err);
  }

  return dict;
}

async function fetchCrowTech(crowCode: string): Promise<Record<string, string[]>> {
  const dict: Record<string, string[]> = {};
  const url = `https://raw.githubusercontent.com/Crow-Tech-Pte-Ltd/crow-chinese-dictionary/main/data/release/website/${crowCode}.json.gz`;

  try {
    const res = await fetch(url);
    if (!res.ok) return dict;

    const buf = await res.arrayBuffer();
    const ds = new DecompressionStream("gzip");
    const decompressed = new Response(new Blob([buf]).stream().pipeThrough(ds));
    const list = await decompressed.json();

    if (Array.isArray(list)) {
      for (const item of list) {
        if (Array.isArray(item) && item.length >= 4) {
          const trad = item[0];
          const simp = item[1];
          const rawDef = item[3];
          if (typeof rawDef === "string" && rawDef.trim()) {
            const defs = rawDef
              .split(/[/;；]/)
              .map((d: string) => d.trim())
              .filter((d: string) => d.length > 0)
              .slice(0, 4);

            if (defs.length > 0) {
              if (simp) dict[simp] = defs;
              if (trad && trad !== simp) dict[trad] = defs;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error(`Failed to fetch Crow-Tech for ${crowCode}:`, err);
  }

  return dict;
}

async function buildLang(lang: { code: string; name: string; wikiCode: string; crowCode?: string }) {
  console.log(`Building full ${lang.name} dictionary (dict-${lang.code}.json)...`);

  // 1. Base from WikiDict
  const dict = await fetchWikiDict(lang.wikiCode);
  console.log(`  WikiDict entries: ${Object.keys(dict).length}`);

  // 2. Merge Crow-Tech
  if (lang.crowCode) {
    const crow = await fetchCrowTech(lang.crowCode);
    console.log(`  Crow-Tech entries: ${Object.keys(crow).length}`);
    for (const [hanzi, defs] of Object.entries(crow)) {
      if (!dict[hanzi]) {
        dict[hanzi] = defs;
      } else {
        for (const d of defs) {
          if (!dict[hanzi].includes(d)) {
            dict[hanzi].unshift(d);
          }
        }
      }
    }
  }

  // 3. Guarantee MULTILANG_CORE_VOCAB high-frequency entries (correct key mapping)
  for (const [hanzi, langMap] of Object.entries(MULTILANG_CORE_VOCAB)) {
    const defs = (langMap as Record<string, string[]>)[lang.code];
    if (defs && defs.length > 0) {
      dict[hanzi] = defs;
    }
  }

  // 4. Guarantee COMMON_GRAMMAR_VOCAB high-frequency words
  for (const [hanzi, langMap] of Object.entries(COMMON_GRAMMAR_VOCAB)) {
    const defs = langMap[lang.code];
    if (defs && defs.length > 0) {
      dict[hanzi] = defs;
    }
  }

  const totalKeys = Object.keys(dict).length;
  console.log(`  Total entries: ${totalKeys}`);

  const jsonStr = JSON.stringify(dict);
  await Deno.writeTextFile(`dicts/dict-${lang.code}.json`, jsonStr);
  console.log(`  Saved dicts/dict-${lang.code}.json (${(jsonStr.length / 1024 / 1024).toFixed(2)} MB)`);
}

async function main() {
  for (const lang of TARGET_LANGS) {
    await buildLang(lang);
  }
}

if (import.meta.main) {
  await main();
}
