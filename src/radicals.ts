/**
 * Kangxi Radicals (康熙部首 214) & Character Etymology Components
 */

export interface RadicalInfo {
  number: number;      // 1 to 214
  radical: string;     // e.g. "人" or "亻"
  pinyin: string;      // e.g. "rén"
  meaningEn: string;   // e.g. "person"
  meaningRu: string;   // e.g. "человек"
  strokeCount: number; // e.g. 2
}

export const KANGXI_RADICALS: Record<number, RadicalInfo> = {
  1: { number: 1, radical: "一", pinyin: "yī", meaningEn: "one", meaningRu: "один, черта", strokeCount: 1 },
  2: { number: 2, radical: "丨", pinyin: "gǔn", meaningEn: "line", meaningRu: "вертикальная черта", strokeCount: 1 },
  3: { number: 3, radical: "丶", pinyin: "zhǔ", meaningEn: "dot", meaningRu: "точка", strokeCount: 1 },
  4: { number: 4, radical: "丿", pinyin: "piě", meaningEn: "slash", meaningRu: "откидная влево", strokeCount: 1 },
  5: { number: 5, radical: "乙", pinyin: "yǐ", meaningEn: "second", meaningRu: "второй, изогнутая", strokeCount: 1 },
  6: { number: 6, radical: "亅", pinyin: "jué", meaningEn: "hook", meaningRu: "крючок", strokeCount: 1 },
  7: { number: 7, radical: "二", pinyin: "èr", meaningEn: "two", meaningRu: "два", strokeCount: 2 },
  8: { number: 8, radical: "亠", pinyin: "tóu", meaningEn: "lid", meaningRu: "верхушка, крышка", strokeCount: 2 },
  9: { number: 9, radical: "人", pinyin: "rén", meaningEn: "person", meaningRu: "человек (亻)", strokeCount: 2 },
  10: { number: 10, radical: "儿", pinyin: "ér", meaningEn: "legs", meaningRu: "ножки, сын", strokeCount: 2 },
  11: { number: 11, radical: "入", pinyin: "rù", meaningEn: "enter", meaningRu: "входить", strokeCount: 2 },
  12: { number: 12, radical: "八", pinyin: "bā", meaningEn: "eight", meaningRu: "восемь, делить", strokeCount: 2 },
  13: { number: 13, radical: "冂", pinyin: "jiōng", meaningEn: "down box", meaningRu: "граница, окраина", strokeCount: 2 },
  14: { number: 14, radical: "冖", pinyin: "mì", meaningEn: "cover", meaningRu: "покрывало, крышка", strokeCount: 2 },
  15: { number: 15, radical: "冫", pinyin: "bīng", meaningEn: "ice", meaningRu: "лед (две точки)", strokeCount: 2 },
  16: { number: 16, radical: "几", pinyin: "jī", meaningEn: "table", meaningRu: "столик", strokeCount: 2 },
  17: { number: 17, radical: "凵", pinyin: "qū", meaningEn: "open box", meaningRu: "яма, вместилище", strokeCount: 2 },
  18: { number: 18, radical: "刀", pinyin: "dāo", meaningEn: "knife", meaningRu: "нож, меч (刂)", strokeCount: 2 },
  19: { number: 19, radical: "力", pinyin: "lì", meaningEn: "power", meaningRu: "сила", strokeCount: 2 },
  20: { number: 20, radical: "勹", pinyin: "bāo", meaningEn: "wrap", meaningRu: "обертывать", strokeCount: 2 },
  24: { number: 24, radical: "十", pinyin: "shí", meaningEn: "ten", meaningRu: "десять", strokeCount: 2 },
  28: { number: 28, radical: "厶", pinyin: "sī", meaningEn: "private", meaningRu: "личный", strokeCount: 2 },
  29: { number: 29, radical: "又", pinyin: "yòu", meaningEn: "again", meaningRu: "снова, правая рука", strokeCount: 2 },
  30: { number: 30, radical: "口", pinyin: "kǒu", meaningEn: "mouth", meaningRu: "рот", strokeCount: 3 },
  31: { number: 31, radical: "囗", pinyin: "wéi", meaningEn: "enclosure", meaningRu: "ограда, рамка", strokeCount: 3 },
  32: { number: 32, radical: "土", pinyin: "tǔ", meaningEn: "earth", meaningRu: "земля, почва", strokeCount: 3 },
  33: { number: 33, radical: "士", pinyin: "shì", meaningEn: "scholar", meaningRu: "воин, ученый", strokeCount: 3 },
  36: { number: 36, radical: "夕", pinyin: "xī", meaningEn: "evening", meaningRu: "вечер", strokeCount: 3 },
  37: { number: 37, radical: "大", pinyin: "dà", meaningEn: "big", meaningRu: "большой", strokeCount: 3 },
  38: { number: 38, radical: "女", pinyin: "nǚ", meaningEn: "woman", meaningRu: "женщина", strokeCount: 3 },
  39: { number: 39, radical: "子", pinyin: "zǐ", meaningEn: "child", meaningRu: "ребенок, сын", strokeCount: 3 },
  40: { number: 40, radical: "宀", pinyin: "mián", meaningEn: "roof", meaningRu: "крыша с точкой", strokeCount: 3 },
  41: { number: 41, radical: "寸", pinyin: "cùn", meaningEn: "inch", meaningRu: "вершок, ладонь", strokeCount: 3 },
  42: { number: 42, radical: "小", pinyin: "xiǎo", meaningEn: "small", meaningRu: "маленький", strokeCount: 3 },
  44: { number: 44, radical: "尸", pinyin: "shī", meaningEn: "corpse", meaningRu: "тело, труп", strokeCount: 3 },
  46: { number: 46, radical: "山", pinyin: "shān", meaningEn: "mountain", meaningRu: "гора", strokeCount: 3 },
  50: { number: 50, radical: "巾", pinyin: "jīn", meaningEn: "cloth", meaningRu: "платок, ткань", strokeCount: 3 },
  53: { number: 53, radical: "广", pinyin: "guǎng", meaningEn: "shelter", meaningRu: "навес, здание", strokeCount: 3 },
  54: { number: 54, radical: "廴", pinyin: "yǐn", meaningEn: "long stride", meaningRu: "длинный шаг", strokeCount: 3 },
  57: { number: 57, radical: "弓", pinyin: "gōng", meaningEn: "bow", meaningRu: "лук (оружие)", strokeCount: 3 },
  60: { number: 60, radical: "彳", pinyin: "chì", meaningEn: "step", meaningRu: "шаг левой ногой", strokeCount: 3 },
  61: { number: 61, radical: "心", pinyin: "xīn", meaningEn: "heart", meaningRu: "сердце (忄)", strokeCount: 4 },
  64: { number: 64, radical: "手", pinyin: "shǒu", meaningEn: "hand", meaningRu: "рука (扌)", strokeCount: 4 },
  66: { number: 66, radical: "攴", pinyin: "pū", meaningEn: "tap", meaningRu: "бить, ударять (攵)", strokeCount: 4 },
  67: { number: 67, radical: "文", pinyin: "wén", meaningEn: "culture", meaningRu: "письменность, культура", strokeCount: 4 },
  72: { number: 72, radical: "日", pinyin: "rì", meaningEn: "sun", meaningRu: "солнце, день", strokeCount: 4 },
  74: { number: 74, radical: "月", pinyin: "yuè", meaningEn: "moon", meaningRu: "луна, месяц", strokeCount: 4 },
  75: { number: 75, radical: "木", pinyin: "mù", meaningEn: "tree", meaningRu: "дерево", strokeCount: 4 },
  85: { number: 85, radical: "水", pinyin: "shuǐ", meaningEn: "water", meaningRu: "вода (氵)", strokeCount: 4 },
  86: { number: 86, radical: "火", pinyin: "huǒ", meaningEn: "fire", meaningRu: "огонь (灬)", strokeCount: 4 },
  96: { number: 96, radical: "玉", pinyin: "yù", meaningEn: "jade", meaningRu: "нефрит (王)", strokeCount: 5 },
  102: { number: 102, radical: "田", pinyin: "tián", meaningEn: "field", meaningRu: "поле", strokeCount: 5 },
  104: { number: 104, radical: "疒", pinyin: "nè", meaningEn: "sickness", meaningRu: "болезнь", strokeCount: 5 },
  109: { number: 109, radical: "目", pinyin: "mù", meaningEn: "eye", meaningRu: "глаз", strokeCount: 5 },
  112: { number: 112, radical: "石", pinyin: "shí", meaningEn: "stone", meaningRu: "камень", strokeCount: 5 },
  113: { number: 113, radical: "示", pinyin: "shì", meaningEn: "spirit", meaningRu: "дух, алтарь (礻)", strokeCount: 5 },
  115: { number: 115, radical: "禾", pinyin: "hé", meaningEn: "grain", meaningRu: "злак, колос", strokeCount: 5 },
  118: { number: 118, radical: "竹", pinyin: "zhú", meaningEn: "bamboo", meaningRu: "бамбук (⺮)", strokeCount: 6 },
  119: { number: 119, radical: "米", pinyin: "mǐ", meaningEn: "rice", meaningRu: "рис", strokeCount: 6 },
  120: { number: 120, radical: "糸", pinyin: "mì", meaningEn: "silk", meaningRu: "шелк, нить (纟)", strokeCount: 6 },
  130: { number: 130, radical: "肉", pinyin: "ròu", meaningEn: "meat", meaningRu: "мясо (月)", strokeCount: 6 },
  140: { number: 140, radical: "艸", pinyin: "cǎo", meaningEn: "grass", meaningRu: "трава (艹)", strokeCount: 6 },
  149: { number: 149, radical: "言", pinyin: "yán", meaningEn: "speech", meaningRu: "речь, слово (讠)", strokeCount: 7 },
  154: { number: 154, radical: "貝", pinyin: "bèi", meaningEn: "shell", meaningRu: "раковина, деньги (贝)", strokeCount: 7 },
  157: { number: 157, radical: "足", pinyin: "zú", meaningEn: "foot", meaningRu: "нога", strokeCount: 7 },
  159: { number: 159, radical: "車", pinyin: "chē", meaningEn: "cart", meaningRu: "повозка, машина (车)", strokeCount: 7 },
  162: { number: 162, radical: "辵", pinyin: "chuò", meaningEn: "walk", meaningRu: "идти, движение (辶)", strokeCount: 7 },
  167: { number: 167, radical: "金", pinyin: "jīn", meaningEn: "metal", meaningRu: "металл, золото (钅)", strokeCount: 8 },
  169: { number: 169, radical: "門", pinyin: "mén", meaningEn: "gate", meaningRu: "ворота, дверь (门)", strokeCount: 8 },
  173: { number: 173, radical: "雨", pinyin: "yǔ", meaningEn: "rain", meaningRu: "дождь", strokeCount: 8 },
  181: { number: 181, radical: "頁", pinyin: "yè", meaningEn: "page", meaningRu: "страница, голова (页)", strokeCount: 9 },
  184: { number: 184, radical: "食", pinyin: "shí", meaningEn: "food", meaningRu: "еда, пища (饣)", strokeCount: 9 },
  187: { number: 187, radical: "馬", pinyin: "mǎ", meaningEn: "horse", meaningRu: "лошадь (马)", strokeCount: 10 },
  195: { number: 195, radical: "魚", pinyin: "yú", meaningEn: "fish", meaningRu: "рыба (鱼)", strokeCount: 11 },
  196: { number: 196, radical: "鳥", pinyin: "niǎo", meaningEn: "bird", meaningRu: "птица (鸟)", strokeCount: 11 },
};

// Common character to primary radical mapping
const CHAR_TO_RADICAL: Record<string, number> = {
  "你": 9, "他": 9, "休": 9, "们": 9, "作": 9, "住": 9, "体": 9, "便": 9,
  "话": 149, "语": 149, "说": 149, "请": 149, "读": 149, "认": 149, "识": 149, "谢": 149,
  "吃": 30, "喝": 30, "叫": 30, "听": 30, "问": 30, "响": 30, "唱": 30,
  "江": 85, "河": 85, "海": 85, "湖": 85, "洗": 85, "汉": 85, "没": 85, "渴": 85,
  "打": 64, "找": 64, "提": 64, "把": 64, "报": 64, "排": 64, "推": 64,
  "想": 61, "思": 61, "念": 61, "懂": 61, "快": 61, "慢": 61, "忙": 61,
  "草": 140, "茶": 140, "花": 140, "英": 140, "菜": 140, "苹": 140, "药": 140,
  "好": 38, "妈": 38, "妹": 38, "姐": 38, "她": 38, "姓": 38,
  "热": 86, "点": 86, "黑": 86, "照": 86,
  "校": 75, "样": 75, "机": 75, "杯": 75, "桌": 75, "椅": 75, "林": 75, "森": 75,
  "钱": 167, "错": 167, "钟": 167, "铁": 167, "银": 167,
  "这": 162, "边": 162, "进": 162, "远": 162, "近": 162, "过": 162, "还": 162, "道": 162,
};

/**
 * Common ideogram decompositions into recognizable semantic/phonetic parts
 */
const CHAR_COMPONENTS: Record<string, string[]> = {
  "休": ["亻 (человек)", "木 (дерево)"],
  "好": ["女 (женщина)", "子 (ребенок)"],
  "明": ["日 (солнце)", "月 (луна)"],
  "林": ["木 (дерево)", "木 (дерево)"],
  "森": ["木 (дерево)", "木 (дерево)", "木 (дерево)"],
  "从": ["人 (человек)", "人 (человек)"],
  "众": ["人 (человек)", "人 (человек)", "人 (человек)"],
  "信": ["亻 (человек)", "言 (речь)"],
  "看": ["手 (рука)", "目 (глаз)"],
  "男": ["田 (поле)", "力 (сила)"],
  "家": ["宀 (крыша)", "豕 (свинья)"],
  "安": ["宀 (крыша)", "女 (женщина)"],
  "字": ["宀 (крыша)", "子 (дитя)"],
  "学": ["冖 (покров)", "子 (дитя)"],
  "问": ["门 (дверь)", "口 (рот)"],
  "间": ["门 (дверь)", "日 (солнце)"],
  "闷": ["门 (дверь)", "心 (сердце)"],
};

/**
 * Returns radical information for a Chinese character
 */
export function getCharacterRadical(char: string): RadicalInfo | null {
  if (!char) return null;
  const c = Array.from(char)[0];
  const radNum = CHAR_TO_RADICAL[c];
  if (radNum && KANGXI_RADICALS[radNum]) {
    return KANGXI_RADICALS[radNum];
  }
  return null;
}

/**
 * Returns ideogram components decomposition if known
 */
export function getCharacterComponents(char: string): string[] | null {
  if (!char) return null;
  const c = Array.from(char)[0];
  return CHAR_COMPONENTS[c] || null;
}
