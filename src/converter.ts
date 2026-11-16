/**
 * Simplified (简体) <-> Traditional (繁體) Chinese Character Converter
 */

// Most frequent character pairs in Simplified and Traditional Chinese
const SIMP_TO_TRAD_MAP: Record<string, string> = {
  "学": "學", "习": "習", "会": "會", "点": "點", "国": "國", "话": "話",
  "书": "書", "电": "電", "车": "車", "机": "機", "门": "門", "时": "時",
  "间": "間", "后": "後", "里": "裏", "这": "這", "那": "那", "个": "個",
  "们": "們", "为": "為", "发": "發", "头": "頭", "对": "對", "见": "見",
  "体": "體", "经": "經", "给": "給", "让": "讓", "认": "認", "识": "識",
  "过": "過", "进": "進", "开": "開", "问": "問", "听": "聽", "说": "說",
  "读": "讀", "写": "寫", "语": "語", "汉": "漢", "钱": "錢", "买": "買",
  "卖": "賣", "东": "東", "西": "西", "红": "紅", "绿": "綠", "蓝": "藍",
  "长": "長", "万": "萬", "两": "兩", "动": "動", "产": "產", "业": "業",
  "当": "當", "关": "關", "现": "現", "实": "實", "义": "義", "风": "風",
  "爱": "愛", "变": "變", "边": "邊", "运": "運", "带": "帶", "报": "報",
  "无": "無", "从": "從", "与": "與", "总": "總", "还": "還", "张": "張",
  "难": "難", "乐": "樂", "样": "樣", "种": "種", "声": "聲", "处": "處",
  "备": "備", "传": "傳", "条": "條", "数": "數", "龙": "龍", "马": "馬",
  "鸟": "鳥", "鱼": "魚", "鸡": "雞", "气": "氣", "热": "熱",
  "脑": "腦", "视": "視", "飞": "飛", "师": "師", "友": "友", "线": "線",
  "单": "單", "双": "雙", "觉": "覺", "图": "圖", "观": "觀", "规": "規",
  "则": "則", "题": "題", "纸": "紙", "节": "節", "术": "術", "专": "專",
};

const TRAD_TO_SIMP_MAP: Record<string, string> = {};
for (const [s, t] of Object.entries(SIMP_TO_TRAD_MAP)) {
  TRAD_TO_SIMP_MAP[t] = s;
}

/**
 * Converts text from Simplified Chinese to Traditional Chinese
 */
export function convertToTraditional(text: string): string {
  if (!text) return "";
  return Array.from(text)
    .map((char) => SIMP_TO_TRAD_MAP[char] || char)
    .join("");
}

/**
 * Converts text from Traditional Chinese to Simplified Chinese
 */
export function convertToSimplified(text: string): string {
  if (!text) return "";
  return Array.from(text)
    .map((char) => TRAD_TO_SIMP_MAP[char] || char)
    .join("");
}
