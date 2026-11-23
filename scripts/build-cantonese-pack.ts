/**
 * Builds standalone Cantonese dictionary pack (dict-yue.json)
 * Maps Simplified and Traditional Chinese words to authentic Cantonese Jyutping and definitions.
 */

interface CedictEntry {
  simplified: string;
  traditional: string;
  pinyin: string;
  jyutping?: string;
  definitions: string[];
}

async function buildCantonesePack() {
  console.log("Reading dicts/cedict.json...");
  const raw = await Deno.readTextFile("dicts/cedict.json");
  const cedict = JSON.parse(raw) as Record<string, CedictEntry[]>;

  console.log("Compiling Cantonese dictionary entries...");
  const yueDict: Record<string, string[]> = {};

  // Additional colloquial Cantonese phrases and slang
  const CANTONESE_SLANG: Record<string, string[]> = {
    "唔該晒": ["m4 goi1 saai3 • thank you very much; many thanks"],
    "唔该晒": ["m4 goi1 saai3 • thank you very much; many thanks"],
    "點樣樣": ["dim2 joeng2 joeng2 • in what way; how"],
    "点样样": ["dim2 joeng2 joeng2 • in what way; how"],
    "搭𨋢": ["daap3 lip1 • to take the elevator / lift"],
    "搭䢂": ["daap3 lip1 • to take the elevator / lift"],
    "搭船": ["daap3 syun4 • to take a boat / ferry"],
    "搭飛機": ["daap3 fei1 gei1 • to take an airplane"],
    "搭飞机": ["daap3 fei1 gei1 • to take an airplane"],
    "睇得明": ["tai2 dak1 ming4 • able to understand by reading"],
    "睇唔明": ["tai2 m4 ming4 • unable to understand by reading"],
    "聽得明": ["teng1 dak1 ming4 • able to understand by hearing"],
    "听得明": ["teng1 dak1 ming4 • able to understand by hearing"],
    "聽唔明": ["teng1 m4 ming4 • unable to understand by hearing"],
    "听唔明": ["teng1 m4 ming4 • unable to understand by hearing"],
    "搞得掂": ["gaau2 dak1 dim6 • able to get things done / handle successfully"],
    "搞唔掂": ["gaau2 m4 dim6 • unable to handle / in over one's head"],
    "食得落": ["sik6 dak1 lok6 • able to eat / have appetite"],
    "食唔落": ["sik6 m4 lok6 • unable to eat / having no appetite"],
    "識唔識": ["sik1 m4 sik1 • do you know? / can you?"],
    "识唔识": ["sik1 m4 sik1 • do you know? / can you?"],
    "知唔知": ["zi1 m4 zi1 • do you know?"],
    "去唔去": ["heoi3 m4 heoi3 • going or not? / would you like to go?"],
    "有搞錯": ["jau5 gaau2 co3 • to make a mistake"],
    "有搞错": ["jau5 gaau2 co3 • to make a mistake"],
    "冇搞錯": ["mou5 gaau2 co3 • not mistaken / definitely correct"],
    "冇搞错": ["mou5 gaau2 co3 • not mistaken / definitely correct"],
    "成日都": ["seng4 jat6 dou1 • always / constantly / all the time"],
    "成日": ["seng4 jat6 • all day long / always"],
    "邊度": ["bin1 dou6 • where / which place"],
    "边度": ["bin1 dou6 • where / which place"],
    "幾時": ["gei2 si4 • when / what time"],
    "几时": ["gei2 si4 • when / what time"],
    "邊個": ["bin1 go3 • who / which one"],
    "边个": ["bin1 go3 • who / which one"],
    "咩事": ["me1 si6 • what happened? / what's up?"],
    "點解": ["dim2 gaai2 • why? / how come?"],
    "点解": ["dim2 gaai2 • why? / how come?"],
    "咁樣": ["gam2 joeng2 • like this / in this way"],
    "咁样": ["gam2 joeng2 • like this / in this way"],
    "食咗飯未": ["sik6 zo2 faan6 mei6 • have you eaten yet?"],
    "食咗饭未": ["sik6 zo2 faan6 mei6 • have you eaten yet?"],
    "早晨": ["zou2 san4 • good morning"],
    "早安": ["zou2 on1 • good morning"],
    "晚安": ["maan5 on1 • good night"],
    "拜拜": ["baai1 baai3 • bye bye / see you"],
    "唔好意思": ["m4 hou2 ji3 si3 • excuse me / sorry"],
    "對唔住": ["deoi3 m4 zyu6 • sorry / pardon"],
    "对唔住": ["deoi3 m4 zyu6 • sorry / pardon"],
    "冇問題": ["mou5 man6 tai4 • no problem"],
    "冇问题": ["mou5 man6 tai4 • no problem"],
    "唔緊要": ["m4 gan2 jiu3 • never mind / it doesn't matter"],
    "唔紧要": ["m4 gan2 jiu3 • never mind / it doesn't matter"],
    "好犀利": ["hou2 sai1 lei6 • awesome / incredible"],
    "好正": ["hou2 zeng3 • very good / excellent / attractive"],
    "好抵": ["hou2 dai2 • great value / worthwhile"],
    "好平": ["hou2 peng4 • very cheap"],
    "好貴": ["hou2 gwai3 • very expensive"],
    "好贵": ["hou2 gwai3 • very expensive"],
  };

  for (const [word, entries] of Object.entries(cedict)) {
    if (!Array.isArray(entries) || entries.length === 0) continue;
    const defLines: string[] = [];
    for (const e of entries) {
      const jyut = e.jyutping ? `${e.jyutping} • ` : "";
      const meaning = e.definitions?.slice(0, 4).join("; ") || "";
      if (meaning) {
        defLines.push(`${jyut}${meaning}`);
      }
    }
    if (defLines.length > 0) {
      yueDict[word] = defLines;
    }
  }

  // Merge slang
  for (const [k, v] of Object.entries(CANTONESE_SLANG)) {
    yueDict[k] = v;
  }

  const outPath = "dicts/dict-yue.json";
  console.log(`Writing ${Object.keys(yueDict).length} entries to ${outPath}...`);
  await Deno.writeTextFile(outPath, JSON.stringify(yueDict));
  const stat = await Deno.stat(outPath);
  console.log(`Done! ${outPath} size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
}

buildCantonesePack().catch((err) => {
  console.error("Cantonese build failed:", err);
  Deno.exit(1);
});
