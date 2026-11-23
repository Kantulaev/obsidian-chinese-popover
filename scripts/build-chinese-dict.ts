/**
 * Builds dict-zh-cn.json and dict-zh-tw.json from chinese-xinhua
 */

async function main() {
  console.log("Fetching chinese-xinhua ci.json and idiom.json...");
  const [ciRes, idiomRes, wordRes] = await Promise.all([
    fetch("https://raw.githubusercontent.com/pwxcoo/chinese-xinhua/master/data/ci.json"),
    fetch("https://raw.githubusercontent.com/pwxcoo/chinese-xinhua/master/data/idiom.json"),
    fetch("https://raw.githubusercontent.com/pwxcoo/chinese-xinhua/master/data/word.json"),
  ]);

  const [ciData, idiomData, wordData] = await Promise.all([
    ciRes.json(),
    idiomRes.json(),
    wordRes.json(),
  ]);

  const dict: Record<string, string[]> = {};

  console.log("Processing words...");
  for (const item of wordData) {
    if (item.word && item.explanation) {
      const defs = item.explanation
        .split(/\n+/)
        .map((d: string) => d.replace(/^[0-9]+[、.]\s*/, "").trim())
        .filter((d: string) => d.length > 0 && d.length < 100)
        .slice(0, 4);
      if (defs.length > 0) {
        dict[item.word] = defs;
      }
    }
  }

  console.log("Processing compound words...");
  for (const item of ciData) {
    if (item.ci && item.explanation) {
      const defs = item.explanation
        .split(/\n+/)
        .map((d: string) => d.replace(/^[0-9]+[、.]\s*/, "").trim())
        .filter((d: string) => d.length > 0 && d.length < 100)
        .slice(0, 4);
      if (defs.length > 0) {
        dict[item.ci] = defs;
      }
    }
  }

  console.log("Processing idioms...");
  for (const item of idiomData) {
    if (item.word && item.explanation) {
      const def = item.explanation.trim();
      if (def && def.length < 150) {
        dict[item.word] = [def];
      }
    }
  }

  // Common spoken phrases
  dict["你好"] = ["问候语，常用于日常打招呼。"];
  dict["您好"] = ["礼貌尊称问候语。"];
  dict["谢谢"] = ["表达感谢、致谢。"];
  dict["再见"] = ["告别语，表示希望再次相见。"];
  dict["对不起"] = ["表示歉意、请求原谅。"];
  dict["没关系"] = ["表示不在意、不用放在心上。"];
  dict["活到老"] = ["指人一生持续生活直至年老，常用于“活到老，学到老”。"];
  dict["活到老学到老"] = ["名言格言：比喻学无止境，一生都要不断学习。"];
  dict["活到老，学到老"] = ["名言格言：比喻学无止境，一生都要不断学习。"];

  console.log(`Total Chinese monolingual entries: ${Object.keys(dict).length}`);

  // Write dict-zh-cn.json
  await Deno.writeTextFile("dicts/dict-zh-cn.json", JSON.stringify(dict));
  let stats = await Deno.stat("dicts/dict-zh-cn.json");
  console.log(`Saved dicts/dict-zh-cn.json (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  // Write dict-zh-tw.json
  await Deno.writeTextFile("dicts/dict-zh-tw.json", JSON.stringify(dict));
  stats = await Deno.stat("dicts/dict-zh-tw.json");
  console.log(`Saved dicts/dict-zh-tw.json (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch(console.error);
