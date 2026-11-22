/**
 * Complete 214 Kangxi Radicals (康熙部首 1 to 214) & Character Etymology Components
 */

import { RADICAL_MULTILANG } from "./radicals-data.ts";

export interface RadicalInfo {
  number: number;      // 1 to 214
  radical: string;     // e.g. "人" or "亻"
  pinyin: string;      // e.g. "rén"
  meaningEn: string;   // e.g. "person"
  meaningRu: string;   // e.g. "человек"
  strokeCount: number; // e.g. 2
}

export const KANGXI_RADICALS: Record<number, RadicalInfo> = {
  // 1 stroke (1-6)
  1: { number: 1, radical: "一", pinyin: "yī", meaningEn: "one", meaningRu: "один, черта", strokeCount: 1 },
  2: { number: 2, radical: "丨", pinyin: "gǔn", meaningEn: "line", meaningRu: "вертикальная черта", strokeCount: 1 },
  3: { number: 3, radical: "丶", pinyin: "zhǔ", meaningEn: "dot", meaningRu: "точка", strokeCount: 1 },
  4: { number: 4, radical: "丿", pinyin: "piě", meaningEn: "slash", meaningRu: "откидная влево", strokeCount: 1 },
  5: { number: 5, radical: "乙", pinyin: "yǐ", meaningEn: "second", meaningRu: "второй, изогнутая", strokeCount: 1 },
  6: { number: 6, radical: "亅", pinyin: "jué", meaningEn: "hook", meaningRu: "крючок", strokeCount: 1 },

  // 2 strokes (7-29)
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
  21: { number: 21, radical: "匕", pinyin: "bǐ", meaningEn: "spoon", meaningRu: "ложка, кинжал", strokeCount: 2 },
  22: { number: 22, radical: "匚", pinyin: "fāng", meaningEn: "box", meaningRu: "ящик, короб", strokeCount: 2 },
  23: { number: 23, radical: "匸", pinyin: "xì", meaningEn: "hiding", meaningRu: "прятать", strokeCount: 2 },
  24: { number: 24, radical: "十", pinyin: "shí", meaningEn: "ten", meaningRu: "десять", strokeCount: 2 },
  25: { number: 25, radical: "卜", pinyin: "bǔ", meaningEn: "divination", meaningRu: "гадание", strokeCount: 2 },
  26: { number: 26, radical: "卩", pinyin: "jié", meaningEn: "seal", meaningRu: "печать, коленце (阝)", strokeCount: 2 },
  27: { number: 27, radical: "厂", pinyin: "chǎng", meaningEn: "cliff", meaningRu: "обрыв, утес", strokeCount: 2 },
  28: { number: 28, radical: "厶", pinyin: "sī", meaningEn: "private", meaningRu: "личный, частный", strokeCount: 2 },
  29: { number: 29, radical: "又", pinyin: "yòu", meaningEn: "again", meaningRu: "снова, правая рука", strokeCount: 2 },

  // 3 strokes (30-60)
  30: { number: 30, radical: "口", pinyin: "kǒu", meaningEn: "mouth", meaningRu: "рот, отверстие", strokeCount: 3 },
  31: { number: 31, radical: "囗", pinyin: "wéi", meaningEn: "enclosure", meaningRu: "ограда, рамка", strokeCount: 3 },
  32: { number: 32, radical: "土", pinyin: "tǔ", meaningEn: "earth", meaningRu: "земля, почва", strokeCount: 3 },
  33: { number: 33, radical: "士", pinyin: "shì", meaningEn: "scholar", meaningRu: "воин, ученый", strokeCount: 3 },
  34: { number: 34, radical: "夂", pinyin: "zhǐ", meaningEn: "go slowly", meaningRu: "идти следом", strokeCount: 3 },
  35: { number: 35, radical: "夊", pinyin: "suī", meaningEn: "slow walk", meaningRu: "медленная походка", strokeCount: 3 },
  36: { number: 36, radical: "夕", pinyin: "xī", meaningEn: "evening", meaningRu: "вечер", strokeCount: 3 },
  37: { number: 37, radical: "大", pinyin: "dà", meaningEn: "big", meaningRu: "большой", strokeCount: 3 },
  38: { number: 38, radical: "女", pinyin: "nǚ", meaningEn: "woman", meaningRu: "женщина", strokeCount: 3 },
  39: { number: 39, radical: "子", pinyin: "zǐ", meaningEn: "child", meaningRu: "ребенок, сын", strokeCount: 3 },
  40: { number: 40, radical: "宀", pinyin: "mián", meaningEn: "roof", meaningRu: "крыша с точкой", strokeCount: 3 },
  41: { number: 41, radical: "寸", pinyin: "cùn", meaningEn: "inch", meaningRu: "вершок, ладонь", strokeCount: 3 },
  42: { number: 42, radical: "小", pinyin: "xiǎo", meaningEn: "small", meaningRu: "маленький", strokeCount: 3 },
  43: { number: 43, radical: "尢", pinyin: "wāng", meaningEn: "lame", meaningRu: "хромой", strokeCount: 3 },
  44: { number: 44, radical: "尸", pinyin: "shī", meaningEn: "corpse", meaningRu: "тело, труп", strokeCount: 3 },
  45: { number: 45, radical: "屮", pinyin: "chè", meaningEn: "sprout", meaningRu: "росток", strokeCount: 3 },
  46: { number: 46, radical: "山", pinyin: "shān", meaningEn: "mountain", meaningRu: "гора", strokeCount: 3 },
  47: { number: 47, radical: "巛", pinyin: "chuān", meaningEn: "river", meaningRu: "река, поток (川)", strokeCount: 3 },
  48: { number: 48, radical: "工", pinyin: "gōng", meaningEn: "work", meaningRu: "работа, ремесло", strokeCount: 3 },
  49: { number: 49, radical: "己", pinyin: "jǐ", meaningEn: "oneself", meaningRu: "сам, себя", strokeCount: 3 },
  50: { number: 50, radical: "巾", pinyin: "jīn", meaningEn: "cloth", meaningRu: "платок, ткань", strokeCount: 3 },
  51: { number: 51, radical: "干", pinyin: "gān", meaningEn: "shield", meaningRu: "щит, ствол", strokeCount: 3 },
  52: { number: 52, radical: "幺", pinyin: "yāo", meaningEn: "tiny", meaningRu: "крошечный", strokeCount: 3 },
  53: { number: 53, radical: "广", pinyin: "guǎng", meaningEn: "shelter", meaningRu: "навес, здание", strokeCount: 3 },
  54: { number: 54, radical: "廴", pinyin: "yǐn", meaningEn: "long stride", meaningRu: "длинный шаг", strokeCount: 3 },
  55: { number: 55, radical: "廾", pinyin: "gǒng", meaningEn: "hands joined", meaningRu: "сложенные руки", strokeCount: 3 },
  56: { number: 56, radical: "弋", pinyin: "yì", meaningEn: "shoot", meaningRu: "стрела с привязью", strokeCount: 3 },
  57: { number: 57, radical: "弓", pinyin: "gōng", meaningEn: "bow", meaningRu: "лук (оружие)", strokeCount: 3 },
  58: { number: 58, radical: "彐", pinyin: "jì", meaningEn: "snout", meaningRu: "морда свиньи", strokeCount: 3 },
  59: { number: 59, radical: "彡", pinyin: "shān", meaningEn: "bristle", meaningRu: "перья, штрихи", strokeCount: 3 },
  60: { number: 60, radical: "彳", pinyin: "chì", meaningEn: "step", meaningRu: "шаг левой ногой", strokeCount: 3 },

  // 4 strokes (61-94)
  61: { number: 61, radical: "心", pinyin: "xīn", meaningEn: "heart", meaningRu: "сердце (忄)", strokeCount: 4 },
  62: { number: 62, radical: "戈", pinyin: "gē", meaningEn: "halberd", meaningRu: "клевец, копье", strokeCount: 4 },
  63: { number: 63, radical: "戶", pinyin: "hù", meaningEn: "door", meaningRu: "дверь, двор (户)", strokeCount: 4 },
  64: { number: 64, radical: "手", pinyin: "shǒu", meaningEn: "hand", meaningRu: "рука (扌)", strokeCount: 4 },
  65: { number: 65, radical: "支", pinyin: "zhī", meaningEn: "branch", meaningRu: "ветка", strokeCount: 4 },
  66: { number: 66, radical: "攴", pinyin: "pū", meaningEn: "tap", meaningRu: "бить, ударять (攵)", strokeCount: 4 },
  67: { number: 67, radical: "文", pinyin: "wén", meaningEn: "culture", meaningRu: "культура, текст", strokeCount: 4 },
  68: { number: 68, radical: "斗", pinyin: "dǒu", meaningEn: "dipper", meaningRu: "ковш, мера", strokeCount: 4 },
  69: { number: 69, radical: "斤", pinyin: "jīn", meaningEn: "axe", meaningRu: "топор, цзинь", strokeCount: 4 },
  70: { number: 70, radical: "方", pinyin: "fāng", meaningEn: "square", meaningRu: "квадрат, сторона", strokeCount: 4 },
  71: { number: 71, radical: "无", pinyin: "wú", meaningEn: "not", meaningRu: "нет, без", strokeCount: 4 },
  72: { number: 72, radical: "日", pinyin: "rì", meaningEn: "sun", meaningRu: "солнце, день", strokeCount: 4 },
  73: { number: 73, radical: "曰", pinyin: "yuē", meaningEn: "say", meaningRu: "говорить, изрекать", strokeCount: 4 },
  74: { number: 74, radical: "月", pinyin: "yuè", meaningEn: "moon", meaningRu: "луна, месяц", strokeCount: 4 },
  75: { number: 75, radical: "木", pinyin: "mù", meaningEn: "tree", meaningRu: "дерево", strokeCount: 4 },
  76: { number: 76, radical: "欠", pinyin: "qiàn", meaningEn: "yawn", meaningRu: "зевать, недоставать", strokeCount: 4 },
  77: { number: 77, radical: "止", pinyin: "zhǐ", meaningEn: "stop", meaningRu: "остановиться", strokeCount: 4 },
  78: { number: 78, radical: "歹", pinyin: "dǎi", meaningEn: "death", meaningRu: "смерть, злой", strokeCount: 4 },
  79: { number: 79, radical: "殳", pinyin: "shū", meaningEn: "weapon", meaningRu: "бамбуковая пика", strokeCount: 4 },
  80: { number: 80, radical: "毋", pinyin: "wú", meaningEn: "do not", meaningRu: "нельзя, мать", strokeCount: 4 },
  81: { number: 81, radical: "比", pinyin: "bǐ", meaningEn: "compare", meaningRu: "сравнивать", strokeCount: 4 },
  82: { number: 82, radical: "毛", pinyin: "máo", meaningEn: "fur", meaningRu: "шерсть, волос", strokeCount: 4 },
  83: { number: 83, radical: "氏", pinyin: "shì", meaningEn: "clan", meaningRu: "род, фамилия", strokeCount: 4 },
  84: { number: 84, radical: "气", pinyin: "qì", meaningEn: "steam", meaningRu: "воздух, пар, ци", strokeCount: 4 },
  85: { number: 85, radical: "水", pinyin: "shuǐ", meaningEn: "water", meaningRu: "вода (氵)", strokeCount: 4 },
  86: { number: 86, radical: "火", pinyin: "huǒ", meaningEn: "fire", meaningRu: "огонь (灬)", strokeCount: 4 },
  87: { number: 87, radical: "爪", pinyin: "zhǎo", meaningEn: "claw", meaningRu: "коготь, лапа (爫)", strokeCount: 4 },
  88: { number: 88, radical: "父", pinyin: "fù", meaningEn: "father", meaningRu: "отец", strokeCount: 4 },
  89: { number: 89, radical: "爻", pinyin: "yáo", meaningEn: "trigrams", meaningRu: "черта триграммы", strokeCount: 4 },
  90: { number: 90, radical: "爿", pinyin: "pán", meaningEn: "split wood", meaningRu: "дощечка (丬)", strokeCount: 4 },
  91: { number: 91, radical: "片", pinyin: "piàn", meaningEn: "slice", meaningRu: "пластинка, кусок", strokeCount: 4 },
  92: { number: 92, radical: "牙", pinyin: "yá", meaningEn: "fang", meaningRu: "клык, зуб", strokeCount: 4 },
  93: { number: 93, radical: "牛", pinyin: "niú", meaningEn: "cow", meaningRu: "бык, корова (牜)", strokeCount: 4 },
  94: { number: 94, radical: "犬", pinyin: "quǎn", meaningEn: "dog", meaningRu: "собака (犭)", strokeCount: 4 },

  // 5 strokes (95-117)
  95: { number: 95, radical: "玄", pinyin: "xuán", meaningEn: "profound", meaningRu: "глубокий, чернеющий", strokeCount: 5 },
  96: { number: 96, radical: "玉", pinyin: "yù", meaningEn: "jade", meaningRu: "нефрит (王)", strokeCount: 5 },
  97: { number: 97, radical: "瓜", pinyin: "guā", meaningEn: "melon", meaningRu: "тыква, дыня", strokeCount: 5 },
  98: { number: 98, radical: "瓦", pinyin: "wǎ", meaningEn: "tile", meaningRu: "черепица", strokeCount: 5 },
  99: { number: 99, radical: "甘", pinyin: "gān", meaningEn: "sweet", meaningRu: "сладкий", strokeCount: 5 },
  100: { number: 100, radical: "生", pinyin: "shēng", meaningEn: "life", meaningRu: "рождаться, жизнь", strokeCount: 5 },
  101: { number: 101, radical: "用", pinyin: "yòng", meaningEn: "use", meaningRu: "применять, польза", strokeCount: 5 },
  102: { number: 102, radical: "田", pinyin: "tián", meaningEn: "field", meaningRu: "поле", strokeCount: 5 },
  103: { number: 103, radical: "疋", pinyin: "pǐ", meaningEn: "bolt of cloth", meaningRu: "рулон ткани, нога", strokeCount: 5 },
  104: { number: 104, radical: "疒", pinyin: "nè", meaningEn: "sickness", meaningRu: "болезнь", strokeCount: 5 },
  105: { number: 105, radical: "癶", pinyin: "bō", meaningEn: "footsteps", meaningRu: "расставленные ноги", strokeCount: 5 },
  106: { number: 106, radical: "白", pinyin: "bái", meaningEn: "white", meaningRu: "белый", strokeCount: 5 },
  107: { number: 107, radical: "皮", pinyin: "pí", meaningEn: "skin", meaningRu: "кожа, шкура", strokeCount: 5 },
  108: { number: 108, radical: "皿", pinyin: "mǐn", meaningEn: "dish", meaningRu: "посуда, блюдо", strokeCount: 5 },
  109: { number: 109, radical: "目", pinyin: "mù", meaningEn: "eye", meaningRu: "глаз", strokeCount: 5 },
  110: { number: 110, radical: "矛", pinyin: "máo", meaningEn: "spear", meaningRu: "копье", strokeCount: 5 },
  111: { number: 111, radical: "矢", pinyin: "shǐ", meaningEn: "arrow", meaningRu: "стрела", strokeCount: 5 },
  112: { number: 112, radical: "石", pinyin: "shí", meaningEn: "stone", meaningRu: "камень", strokeCount: 5 },
  113: { number: 113, radical: "示", pinyin: "shì", meaningEn: "spirit", meaningRu: "алтарь, дух (礻)", strokeCount: 5 },
  114: { number: 114, radical: "禸", pinyin: "róu", meaningEn: "track", meaningRu: "след зверя", strokeCount: 5 },
  115: { number: 115, radical: "禾", pinyin: "hé", meaningEn: "grain", meaningRu: "злак, колос", strokeCount: 5 },
  116: { number: 116, radical: "穴", pinyin: "xué", meaningEn: "cave", meaningRu: "пещера, нора", strokeCount: 5 },
  117: { number: 117, radical: "立", pinyin: "lì", meaningEn: "stand", meaningRu: "стоять", strokeCount: 5 },

  // 6 strokes (118-146)
  118: { number: 118, radical: "竹", pinyin: "zhú", meaningEn: "bamboo", meaningRu: "бамбук (⺮)", strokeCount: 6 },
  119: { number: 119, radical: "米", pinyin: "mǐ", meaningEn: "rice", meaningRu: "рис", strokeCount: 6 },
  120: { number: 120, radical: "糸", pinyin: "mì", meaningEn: "silk", meaningRu: "шелк, нить (纟)", strokeCount: 6 },
  121: { number: 121, radical: "缶", pinyin: "fǒu", meaningEn: "jar", meaningRu: "глиняный кувшин", strokeCount: 6 },
  122: { number: 122, radical: "网", pinyin: "wǎng", meaningEn: "net", meaningRu: "сеть (罒)", strokeCount: 6 },
  123: { number: 123, radical: "羊", pinyin: "yáng", meaningEn: "sheep", meaningRu: "баран, овца (⺶)", strokeCount: 6 },
  124: { number: 124, radical: "羽", pinyin: "yǔ", meaningEn: "feather", meaningRu: "перо, крылья", strokeCount: 6 },
  125: { number: 125, radical: "老", pinyin: "lǎo", meaningEn: "old", meaningRu: "старый (耂)", strokeCount: 6 },
  126: { number: 126, radical: "而", pinyin: "ér", meaningEn: "and", meaningRu: "борода, союз 'и'", strokeCount: 6 },
  127: { number: 127, radical: "耒", pinyin: "lěi", meaningEn: "plow", meaningRu: "соха, плуг", strokeCount: 6 },
  128: { number: 128, radical: "耳", pinyin: "ěr", meaningEn: "ear", meaningRu: "ухо", strokeCount: 6 },
  129: { number: 129, radical: "聿", pinyin: "yù", meaningEn: "brush", meaningRu: "кисть для письма", strokeCount: 6 },
  130: { number: 130, radical: "肉", pinyin: "ròu", meaningEn: "meat", meaningRu: "мясо (月)", strokeCount: 6 },
  131: { number: 131, radical: "臣", pinyin: "chén", meaningEn: "minister", meaningRu: "министр, подданный", strokeCount: 6 },
  132: { number: 132, radical: "自", pinyin: "zì", meaningEn: "self", meaningRu: "сам, нос", strokeCount: 6 },
  133: { number: 133, radical: "至", pinyin: "zhì", meaningEn: "arrive", meaningRu: "достигать", strokeCount: 6 },
  134: { number: 134, radical: "臼", pinyin: "jiù", meaningEn: "mortar", meaningRu: "ступа", strokeCount: 6 },
  135: { number: 135, radical: "舌", pinyin: "shé", meaningEn: "tongue", meaningRu: "язык", strokeCount: 6 },
  136: { number: 136, radical: "舛", pinyin: "chuǎn", meaningEn: "oppose", meaningRu: "ошибка, врозь", strokeCount: 6 },
  137: { number: 137, radical: "舟", pinyin: "zhōu", meaningEn: "boat", meaningRu: "лодка, судно", strokeCount: 6 },
  138: { number: 138, radical: "艮", pinyin: "gèn", meaningEn: "stopping", meaningRu: "твердый, упорный", strokeCount: 6 },
  139: { number: 139, radical: "色", pinyin: "sè", meaningEn: "color", meaningRu: "цвет, вид", strokeCount: 6 },
  140: { number: 140, radical: "艸", pinyin: "cǎo", meaningEn: "grass", meaningRu: "трава (艹)", strokeCount: 6 },
  141: { number: 141, radical: "虍", pinyin: "hū", meaningEn: "tiger stripes", meaningRu: "тигр", strokeCount: 6 },
  142: { number: 142, radical: "虫", pinyin: "chóng", meaningEn: "insect", meaningRu: "насекомое, червь", strokeCount: 6 },
  143: { number: 143, radical: "血", pinyin: "xuè", meaningEn: "blood", meaningRu: "кровь", strokeCount: 6 },
  144: { number: 144, radical: "行", pinyin: "xíng", meaningEn: "walk", meaningRu: "идти, ряд", strokeCount: 6 },
  145: { number: 145, radical: "衣", pinyin: "yī", meaningEn: "clothes", meaningRu: "одежда (衤)", strokeCount: 6 },
  146: { number: 146, radical: "襾", pinyin: "yà", meaningEn: "cover", meaningRu: "покрывать (覀)", strokeCount: 6 },

  // 7 strokes (147-166)
  147: { number: 147, radical: "見", pinyin: "jiàn", meaningEn: "see", meaningRu: "видеть (见)", strokeCount: 7 },
  148: { number: 148, radical: "角", pinyin: "jiǎo", meaningEn: "horn", meaningRu: "рог, угол", strokeCount: 7 },
  149: { number: 149, radical: "言", pinyin: "yán", meaningEn: "speech", meaningRu: "речь, слово (讠)", strokeCount: 7 },
  150: { number: 150, radical: "谷", pinyin: "gǔ", meaningEn: "valley", meaningRu: "долина, ущелье", strokeCount: 7 },
  151: { number: 151, radical: "豆", pinyin: "dòu", meaningEn: "bean", meaningRu: "боб, сосуд", strokeCount: 7 },
  152: { number: 152, radical: "豕", pinyin: "shǐ", meaningEn: "pig", meaningRu: "свинья", strokeCount: 7 },
  153: { number: 153, radical: "豸", pinyin: "zhì", meaningEn: "badger", meaningRu: "хищный зверь", strokeCount: 7 },
  154: { number: 154, radical: "貝", pinyin: "bèi", meaningEn: "shell", meaningRu: "раковина, деньги (贝)", strokeCount: 7 },
  155: { number: 155, radical: "赤", pinyin: "chì", meaningEn: "red", meaningRu: "красный, алый", strokeCount: 7 },
  156: { number: 156, radical: "走", pinyin: "zǒu", meaningEn: "run", meaningRu: "идти, бежать", strokeCount: 7 },
  157: { number: 157, radical: "足", pinyin: "zú", meaningEn: "foot", meaningRu: "нога (⻊)", strokeCount: 7 },
  158: { number: 158, radical: "身", pinyin: "shēn", meaningEn: "body", meaningRu: "тело", strokeCount: 7 },
  159: { number: 159, radical: "車", pinyin: "chē", meaningEn: "cart", meaningRu: "повозка, машина (车)", strokeCount: 7 },
  160: { number: 160, radical: "辛", pinyin: "xīn", meaningEn: "bitter", meaningRu: "горький, тяжкий", strokeCount: 7 },
  161: { number: 161, radical: "辰", pinyin: "chén", meaningEn: "morning", meaningRu: "время, циклический знак", strokeCount: 7 },
  162: { number: 162, radical: "辵", pinyin: "chuò", meaningEn: "walk", meaningRu: "движение, идти (辶)", strokeCount: 7 },
  163: { number: 163, radical: "邑", pinyin: "yì", meaningEn: "city", meaningRu: "город (阝 справа)", strokeCount: 7 },
  164: { number: 164, radical: "酉", pinyin: "yǒu", meaningEn: "wine", meaningRu: "сосуд с вином", strokeCount: 7 },
  165: { number: 165, radical: "釆", pinyin: "biàn", meaningEn: "distinguish", meaningRu: "различать", strokeCount: 7 },
  166: { number: 166, radical: "里", pinyin: "lǐ", meaningEn: "village", meaningRu: "верста, деревня", strokeCount: 7 },

  // 8 strokes (167-175)
  167: { number: 167, radical: "金", pinyin: "jīn", meaningEn: "metal", meaningRu: "металл, золото (钅)", strokeCount: 8 },
  168: { number: 168, radical: "長", pinyin: "cháng", meaningEn: "long", meaningRu: "длинный, расти (长)", strokeCount: 8 },
  169: { number: 169, radical: "門", pinyin: "mén", meaningEn: "gate", meaningRu: "ворота, дверь (门)", strokeCount: 8 },
  170: { number: 170, radical: "阜", pinyin: "fù", meaningEn: "mound", meaningRu: "холм (阝 слева)", strokeCount: 8 },
  171: { number: 171, radical: "隶", pinyin: "dài", meaningEn: "slave", meaningRu: "достигать, слуга", strokeCount: 8 },
  172: { number: 172, radical: "隹", pinyin: "zhuī", meaningEn: "short-tailed bird", meaningRu: "короткохвостая птица", strokeCount: 8 },
  173: { number: 173, radical: "雨", pinyin: "yǔ", meaningEn: "rain", meaningRu: "дождь (⻗)", strokeCount: 8 },
  174: { number: 174, radical: "靑", pinyin: "qīng", meaningEn: "blue/green", meaningRu: "синий, зеленый (青)", strokeCount: 8 },
  175: { number: 175, radical: "非", pinyin: "fēi", meaningEn: "wrong", meaningRu: "не быть, ошибка", strokeCount: 8 },

  // 9 strokes (176-186)
  176: { number: 176, radical: "面", pinyin: "miàn", meaningEn: "face", meaningRu: "лицо, поверхность", strokeCount: 9 },
  177: { number: 177, radical: "革", pinyin: "gé", meaningEn: "leather", meaningRu: "сырая кожа", strokeCount: 9 },
  178: { number: 178, radical: "韋", pinyin: "wéi", meaningEn: "tanned leather", meaningRu: "выделанная кожа (韦)", strokeCount: 9 },
  179: { number: 179, radical: "韭", pinyin: "jiǔ", meaningEn: "leek", meaningRu: "лук-порей", strokeCount: 9 },
  180: { number: 180, radical: "音", pinyin: "yīn", meaningEn: "sound", meaningRu: "звук, музыка", strokeCount: 9 },
  181: { number: 181, radical: "頁", pinyin: "yè", meaningEn: "page", meaningRu: "страница, голова (页)", strokeCount: 9 },
  182: { number: 182, radical: "風", pinyin: "fēng", meaningEn: "wind", meaningRu: "ветер (风)", strokeCount: 9 },
  183: { number: 183, radical: "飛", pinyin: "fēi", meaningEn: "fly", meaningRu: "летать (飞)", strokeCount: 9 },
  184: { number: 184, radical: "食", pinyin: "shí", meaningEn: "food", meaningRu: "еда, пища (饣)", strokeCount: 9 },
  185: { number: 185, radical: "首", pinyin: "shǒu", meaningEn: "head", meaningRu: "голова, вождь", strokeCount: 9 },
  186: { number: 186, radical: "香", pinyin: "xiāng", meaningEn: "fragrant", meaningRu: "ароматный", strokeCount: 9 },

  // 10-17 strokes (187-214)
  187: { number: 187, radical: "馬", pinyin: "mǎ", meaningEn: "horse", meaningRu: "лошадь (马)", strokeCount: 10 },
  188: { number: 188, radical: "骨", pinyin: "gǔ", meaningEn: "bone", meaningRu: "кость", strokeCount: 10 },
  189: { number: 189, radical: "高", pinyin: "gāo", meaningEn: "tall", meaningRu: "высокий", strokeCount: 10 },
  190: { number: 190, radical: "髟", pinyin: "biāo", meaningEn: "long hair", meaningRu: "длинные волосы", strokeCount: 10 },
  191: { number: 191, radical: "鬥", pinyin: "dòu", meaningEn: "fight", meaningRu: "биться, борьба", strokeCount: 10 },
  192: { number: 192, radical: "鬯", pinyin: "chàng", meaningEn: "sacrificial wine", meaningRu: "жертвенное вино", strokeCount: 10 },
  193: { number: 193, radical: "鬲", pinyin: "lì", meaningEn: "cauldron", meaningRu: "глиняный котел", strokeCount: 10 },
  194: { number: 194, radical: "鬼", pinyin: "guǐ", meaningEn: "ghost", meaningRu: "призрак, бес", strokeCount: 10 },
  195: { number: 195, radical: "魚", pinyin: "yú", meaningEn: "fish", meaningRu: "рыба (鱼)", strokeCount: 11 },
  196: { number: 196, radical: "鳥", pinyin: "niǎo", meaningEn: "bird", meaningRu: "птица (鸟)", strokeCount: 11 },
  197: { number: 197, radical: "鹵", pinyin: "lǔ", meaningEn: "salt", meaningRu: "солончак, соль (卤)", strokeCount: 11 },
  198: { number: 198, radical: "鹿", pinyin: "lù", meaningEn: "deer", meaningRu: "олень", strokeCount: 11 },
  199: { number: 199, radical: "麥", pinyin: "mài", meaningEn: "wheat", meaningRu: "пшеница (麦)", strokeCount: 11 },
  200: { number: 200, radical: "麻", pinyin: "má", meaningEn: "hemp", meaningRu: "конопля, лен", strokeCount: 11 },
  201: { number: 201, radical: "黃", pinyin: "huáng", meaningEn: "yellow", meaningRu: "желтый (黄)", strokeCount: 12 },
  202: { number: 202, radical: "黍", pinyin: "shǔ", meaningEn: "millet", meaningRu: "просо", strokeCount: 12 },
  203: { number: 203, radical: "黑", pinyin: "hēi", meaningEn: "black", meaningRu: "черный", strokeCount: 12 },
  204: { number: 204, radical: "黹", pinyin: "zhǐ", meaningEn: "embroidery", meaningRu: "вышивка", strokeCount: 12 },
  205: { number: 205, radical: "黽", pinyin: "mǐn", meaningEn: "frog", meaningRu: "лягушка (黾)", strokeCount: 13 },
  206: { number: 206, radical: "鼎", pinyin: "dǐng", meaningEn: "tripod", meaningRu: "треножник", strokeCount: 13 },
  207: { number: 207, radical: "鼓", pinyin: "gǔ", meaningEn: "drum", meaningRu: "барабан", strokeCount: 13 },
  208: { number: 208, radical: "鼠", pinyin: "shǔ", meaningEn: "mouse", meaningRu: "мышь, крыса", strokeCount: 13 },
  209: { number: 209, radical: "鼻", pinyin: "bí", meaningEn: "nose", meaningRu: "нос", strokeCount: 14 },
  210: { number: 210, radical: "齊", pinyin: "qí", meaningEn: "even", meaningRu: "ровный (齐)", strokeCount: 14 },
  211: { number: 211, radical: "齒", pinyin: "chǐ", meaningEn: "tooth", meaningRu: "зуб (齿)", strokeCount: 15 },
  212: { number: 212, radical: "龍", pinyin: "lóng", meaningEn: "dragon", meaningRu: "дракон (龙)", strokeCount: 16 },
  213: { number: 213, radical: "龜", pinyin: "guī", meaningEn: "turtle", meaningRu: "черепаха (龟)", strokeCount: 16 },
  214: { number: 214, radical: "龠", pinyin: "yuè", meaningEn: "flute", meaningRu: "флейта", strokeCount: 17 },
};

// Build reverse map from radical character string to its Kangxi number
const RADICAL_CHAR_MAP: Record<string, number> = {};
for (const [num, info] of Object.entries(KANGXI_RADICALS)) {
  RADICAL_CHAR_MAP[info.radical] = parseInt(num, 10);
}
// Add simplified radical forms:
Object.assign(RADICAL_CHAR_MAP, {
  "亻": 9, "讠": 149, "氵": 85, "扌": 64, "忄": 61, "艹": 140, "灬": 86, "钅": 167,
  "辶": 162, "阝": 170, "纟": 120, "饣": 184, "门": 169, "车": 159, "马": 187,
  "鸟": 196, "鱼": 195, "见": 147, "贝": 154, "页": 181, "风": 182, "飞": 183
});

// Common character to Kangxi radical index mapping
const CHAR_TO_RADICAL: Record<string, number> = {
  // 人 / 亻 (9)
  "你": 9, "他": 9, "休": 9, "们": 9, "作": 9, "住": 9, "体": 9, "便": 9, "信": 9, "值": 9, "像": 9, "位": 9, "会": 9, "令": 9, "做": 9, "保": 9, "件": 9,
  // 言 / 讠 (149)
  "话": 149, "语": 149, "说": 149, "请": 149, "读": 149, "认": 149, "识": 149, "谢": 149, "试": 149, "课": 149, "谁": 149, "词": 149, "讲": 149, "记": 149, "该": 149,
  // 口 (30)
  "吃": 30, "喝": 30, "叫": 30, "听": 30, "问": 30, "响": 30, "唱": 30, "吗": 30, "呢": 30, "吧": 30, "名": 30, "各": 30, "告": 30, "喜": 30, "可": 30, "号": 30, "同": 30,
  // 水 / 氵 (85)
  "江": 85, "河": 85, "海": 85, "湖": 85, "洗": 85, "汉": 85, "没": 85, "渴": 85, "温": 85, "游": 85, "清": 85, "深": 85, "演": 85, "活": 85, "流": 85, "洋": 85,
  // 手 / 扌 (64)
  "打": 64, "找": 64, "提": 64, "把": 64, "报": 64, "排": 64, "推": 64, "拿": 64, "搞": 64, "接": 64, "换": 64, "掉": 64, "擦": 64, "指": 64, "持": 64,
  // 心 / 忄 (61)
  "想": 61, "思": 61, "念": 61, "懂": 61, "快": 61, "慢": 61, "忙": 61, "急": 61, "情": 61, "感": 61, "怕": 61, "态": 61, "总": 61, "爱": 61, "意": 61,
  // 艸 / 艹 (140)
  "草": 140, "茶": 140, "花": 140, "英": 140, "菜": 140, "苹": 140, "药": 140, "节": 140, "蓝": 140, "苦": 140, "荣": 140, "落": 140, "著": 140,
  // 女 (38)
  "好": 38, "妈": 38, "妹": 38, "姐": 38, "她": 38, "姓": 38, "如": 38, "始": 38, "娘": 38, "妻": 38, "奶": 38,
  // 火 / 灬 (86)
  "热": 86, "点": 86, "黑": 86, "照": 86, "然": 86, "烧": 86, "灯": 86, "煮": 86, "烤": 86, "熊": 86,
  // 木 (75)
  "校": 75, "样": 75, "机": 75, "杯": 75, "桌": 75, "椅": 75, "林": 75, "森": 75, "李": 75, "条": 75, "极": 75, "果": 75, "相": 75, "东": 75, "本": 75, "树": 75,
  // 金 / 钅 (167)
  "钱": 167, "钟": 167, "铁": 167, "银": 167, "错": 167, "钢": 167, "针": 167, "铭": 167, "镜": 167,
  // 辵 / 辶 (162)
  "这": 162, "边": 162, "进": 162, "远": 162, "近": 162, "过": 162, "还": 162, "道": 162, "选": 162, "通": 162, "适": 162, "连": 162, "运": 162,
  // 宀 (40)
  "家": 40, "安": 40, "字": 40, "定": 40, "室": 40, "客": 40, "实": 40, "容": 40, "官": 40, "完": 40,
  // 日 (72)
  "时": 72, "明": 72, "星": 72, "春": 72, "昨": 72, "早": 72, "晚": 72, "最": 72, "易": 72, "晴": 72,
  // 目 (109)
  "看": 109, "眼": 109, "睛": 109, "睡": 109, "真": 109,
  // 糸 / 纟 (120)
  "红": 120, "绿": 120, "给": 120, "细": 120, "结": 120, "练": 120, "经": 120, "终": 120, "线": 120, "级": 120,
  // 月 (74) / 肉 (130)
  "朋": 74, "期": 74, "脑": 130, "脸": 130, "腿": 130, "肚": 130, "胖": 130,
  // 子 (39)
  "学": 39, "孩": 39, "存": 39, "孙": 39,
  // 羽 (124)
  "习": 124, "翅": 124,
  // 走 / 足 (156 / 157)
  "起": 156, "跑": 157, "跳": 157, "踢": 157, "跟": 157, "路": 157,
  // 雨 (173)
  "电": 173, "雪": 173, "雷": 173, "零": 173, "需": 173,
  // 欠 (76)
  "欢": 76, "歌": 76, "次": 76,
  // 父 (88)
  "爸": 88, "爷": 88,
};

// Common character ideogram component decompositions
const CHAR_COMPONENTS: Record<string, string[]> = {
  "学": ["冖 (покров/школа)", "子 (дитя) — познание под руководством учителя"],
  "习": ["羽 (крылья птицы) — взмахи крыльев птенца, тренироваться"],
  "好": ["女 (женщина)", "子 (ребенок) — мать и дитя, гармония и благо"],
  "明": ["日 (солнце)", "月 (луна) — два светила дают ясный свет"],
  "休": ["亻 (человек)", "木 (дерево) — прислонился к дереву для отдыха"],
  "林": ["木 (дерево)", "木 (дерево) — роща"],
  "森": ["木 (дерево)", "木 (дерево)", "木 (дерево) — дремучий лес"],
  "从": ["人 (человек)", "人 (человек) — один идет за другим, следовать"],
  "众": ["人 (человек)", "人 (человек)", "人 (человек) — масса людей, толпа"],
  "信": ["亻 (человек)", "言 (слово) — верность слову человека, доверие"],
  "看": ["手 (рука)", "目 (глаз) — приложить руку к глазам, вглядываясь"],
  "男": ["田 (поле)", "力 (сила) — тот, кто трудится на поле, мужчина"],
  "家": ["宀 (крыша)", "豕 (свинья) — очаг с домашним скотом, дом/семья"],
  "安": ["宀 (крыша)", "女 (женщина) — женщина под надежной крышей, покой"],
  "字": ["宀 (крыша)", "子 (ребенок) — рождение знаков под кровом, иероглиф"],
  "朋": ["月 (раковина/луна)", "月 (раковина/луна) — связка драгоценных раковин, ровня/друзья"],
  "友": ["又 (рука)", "又 (рука) — две руки, протянутые в дружеском рукопожатии"],
  "电": ["日/申 (молния)", "乚 (хвост разряда) — небесный разряд, электричество"],
  "脑": ["月/肉 (тело)", "𡿨 (извилины)", "匕 — мыслящий орган в голове, мозг"],
  "话": ["讠 (речь)", "舌 (язык) — слова, слетающие с языка"],
  "语": ["讠 (речь)", "五 (пять)", "口 (рот) — выражение мысли в речи, язык"],
  "汉": ["氵 (река)", "又 (рука) — священная река Ханьшуй, давшая имя народу"],
  "中": ["丨 (стрела)", "口 (мишень) — стрела точно в центре мишени"],
  "国": ["囗 (ограда)", "玉 (нефрит) — охраняемые границы государства с сокровищем внутри"],
  "喜": ["壴 (барабан)", "口 (рот) — веселье и пение под бой барабана, радость"],
  "欢": ["又 (рука)", "欠 (распахнутый рот) — восторженный крик ликования"],
  "作": ["亻 (человек)", "乍 (начинать) — человек берется за дело, делать"],
  "工": ["древний угломер/линейка ремесленника — труд, мастерство"],
  "现": ["王/玉 (нефрит)", "见 (видеть) — сияние нефрита становится видимым, проявляться/сейчас"],
  "吃": ["口 (рот)", "乞 (просить) — принимать пищу через рот, есть"],
  "喝": ["口 (рот)", "曷 (с мольбой) — утолять жажду, пить"],
  "睡": ["目 (глаз)", "垂 (опускаться) — тяжелые веки опускаются, спать"],
  "觉": ["𦥑 (руки)", "冖 (покров)", "见 (видеть) — внезапно прозреть, ощущать"],
  "时": ["日 (солнце)", "寸 (мера) — измерение хода солнца, время"],
  "间": ["门 (ворота)", "日 (солнце) — луч солнца между створок ворот, промежуток"],
  "问": ["门 (ворота)", "口 (рот) — спрашивать у ворот, вопрос"],
  "闻": ["门 (ворота)", "耳 (ухо) — прислушиваться у двери, слышать новости"],
  "闪": ["门 (ворота)", "人 (человек) — человек быстро промелькнул в двери, блеснуть"],
  "闷": ["门 (ворота)", "心 (сердце) — сердце заперто за дверью, тоска"],
  "钱": ["钅 (металл)", "戋 (маленький) — металлическая монета, деньги"],
  "买": ["乛 (сеть)", "头 (монета) — забирать товар, покупать"],
  "卖": ["十 (избыток)", "买 (покупать) — отдавать излишки, продавать"],
  "车": ["вид повозки с колесами и осью сверху, экипаж"],
  "机": ["木 (дерево)", "几 (опора) — деревянный механизм, станок"],
  "飞": ["крылья и перья птицы в стремительном полете"],
  "运": ["辶 (движение)", "云 (облака) — перемещение, подобное бегущим облакам"],
  "动": ["云 (облако)", "力 (сила) — движущая сила"],
  "谢": ["讠 (речь)", "身 (тело)", "寸 (поклон) — слова благодарности с поклоном"],
  "认": ["讠 (речь)", "刃 (лезвие) — острое распознавание слова, узнавать"],
  "识": ["讠 (речь)", "只 (знак) — знание слов, познание"],
  "想": ["相 (взаимный)", "心 (сердце) — размышлять сердцем, думать/скучать"],
  "思": ["田 (мозг/поле)", "心 (сердце) — работа ума и сердца, мысль"],
  "爱": ["爫 (лапы)", "冖 (покров)", "心 (сердце)", "夂 (медленно) — бережное чувство от всего сердца"],
  "站": ["立 (стоять)", "占 (место) — занимать место на ногах, остановка/станция"],
  "校": ["木 (дерево)", "交 (встреча/обмен) — место встречи и обмена знаниями, школа"],
  "院": ["阝 (стена/холм)", "完 (завершать) — огороженный двор, учреждение"],
  "医": ["匚 (ящик с инструментами)", "矢 (стрелы) — врачевание, извлечение стрел"],
  "起": ["走 (идти)", "己 (сам) — подняться на ноги самому, вставать"],
  "跑": ["足 (нога)", "包 (заворачивать) — стремглав нестись на ногах, бежать"],
  "冷": ["冫 (лед)", "令 (приказ) — сковывающий мороз, холодный"],
  "热": ["执 (держать)", "灬 (огонь) — пылающий огонь в руках, горячий"],
  "茶": ["艹 (трава)", "人 (человек)", "木 (дерево) — листья куста, дарующие бодрость"],
  "饭": ["饣 (еда)", "反 (рука) — приготовленная пища, вареный рис"],
  "伴": ["亻 (человек)", "半 (половина) — вторая половинка, спутник"],
  "体": ["亻 (человек)", "本 (корень) — телесная основа человека"],
  "生": ["росток, пробивающийся сквозь почву — жизнь, рождение"],
  "老": ["старец с длинными седыми волосами и посохом — почтенный, старый"],
  "师": ["знамя наставника войска — учитель, мастер"],
  "见": ["глаз на человеческих ножках — видеть, встречаться"],
  "再": ["вторично, снова, еще раз"],
  "天": ["человек с распростертыми руками, над которым распростерто небо"],
  "昨": ["日 (солнце)", "乍 (прошедшее) — вчерашний день"],
  "今": ["сбор в единый миг — настоящее время, сейчас"],
  "年": ["колос созревшего урожая, годовой цикл — год"],
  "东": ["солнце, поднимающееся сквозь ветви дерева — восток"],
  "西": ["птичье гнездо на закате солнца — запад"],
  "果": ["дерево с круглыми сочными плодами — фрукт, результат"],
  "水": ["струящиеся потоки воды, река"],
  "苹": ["艹 (трава)", "平 (ровный/мирный) — яблоко"],
  "帮": ["巾 (полотно)", "邦 (страна) — опора, помощь"],
  "助": ["力 (сила)", "且 (алтарь) — объединение сил ради благой цели, содействие"],
  "准": ["冫 (лед)", "隹 (птица) — точное равнение, подготовка"],
  "备": ["夂 (шаг)", "田 (поле) — готовность к действию, запас"],
  "已": ["завершенный виток, уже"],
  "经": ["纟 (нить)", "巠 (продольные нити ткани) — путь, проходить через"],
  "唱": ["口 (рот)", "昌 (яркий) — звонкое пение"],
  "歌": ["哥 (распев)", "欠 (раскрытый рот) — песня"],
  "跳": ["足 (нога)", "兆 (быстрый шаг) — подпрыгивать"],
  "舞": ["танцор с развевающимися рукавами — танец"],
  "游": ["氵 (вода)", "斿 (знамя) — плавание по воде"],
  "泳": ["氵 (вода)", "永 (вечный поток) — плыть"],
  "便": ["亻 (человек)", "更 (перемена) — удобный, простой"],
  "宜": ["宀 (кров)", "且 (алтарь) — надлежащий, подходящий"],
  "漂": ["氵 (вода)", "票 (парить) — чистый и свежий, красивый"],
  "亮": ["亠 (сверху)", "口 (свет)", "儿 (человек) — сияние, светлый"],
  "得": ["彳 (шагать)", "旦 (рассвет)", "寸 (получать) — обретать, получать"],
  "知": ["矢 (стрела)", "口 (рот) — точное слово, бьющее в цель, знание"],
  "道": ["辶 (путь)", "首 (голова) — путь разума, дорога, учение"],
  "懂": ["忄 (сердце/разум)", "重 (глубокий) — глубокое понимание сути"],
  "白": ["чистый луч света, белый/ясный"],
  "希": ["巾 (ткань)", "爻 (узор) — редкий узор, надежда"],
  "望": ["亡 (утрата)", "月 (луна)", "壬 (стоять) — вглядываться вдаль на полную луну, надеяться"],
};

const CHAR_COMPONENTS_EN: Record<string, string[]> = {
  "学": ["冖 (cover/school)", "子 (child) — learning under the guidance of a teacher"],
  "习": ["羽 (wings) — young bird flapping wings, practicing"],
  "好": ["女 (woman)", "子 (child) — mother and child, harmony and goodness"],
  "明": ["日 (sun)", "月 (moon) — two luminaries produce bright light"],
  "休": ["亻 (person)", "木 (tree) — resting against a tree"],
  "林": ["木 (tree)", "木 (tree) — grove / woods"],
  "森": ["木 (tree)", "木 (tree)", "木 (tree) — dense forest"],
  "从": ["人 (person)", "人 (person) — one follows another, follow"],
  "众": ["人 (person)", "人 (person)", "人 (person) — crowd / multitude"],
  "信": ["亻 (person)", "言 (words) — true to a person's words, trust"],
  "看": ["手 (hand)", "目 (eye) — hand shielding eye to look into distance"],
  "男": ["田 (field)", "力 (strength) — person working strength in the field, man"],
  "家": ["宀 (roof)", "豕 (pig) — livestock under roof, home / family"],
  "安": ["宀 (roof)", "女 (woman) — woman protected under roof, peace / safety"],
  "字": ["宀 (roof)", "子 (child) — birth of characters under a roof, character"],
  "朋": ["月 (cowrie shells)", "月 (cowrie shells) — strings of precious shells, peers / friends"],
  "友": ["又 (hand)", "又 (hand) — two hands clasped in handshake, friend"],
  "电": ["日/申 (lightning)", "乚 (flash tail) — celestial flash, electricity"],
  "脑": ["月/肉 (body)", "𡿨 (curves)", "匕 — thinking organ in head, brain"],
  "话": ["讠 (speech)", "舌 (tongue) — words rolling off the tongue, spoken words"],
  "语": ["讠 (speech)", "五 (five)", "口 (mouth) — giving voice to thought, language"],
  "汉": ["氵 (river)", "又 (hand) — sacred Hanshui river, giving name to Han people"],
  "中": ["丨 (arrow)", "口 (target) — arrow right through target center, center"],
  "国": ["囗 (enclosure)", "玉 (jade) — defended borders guarding precious jade, country"],
  "喜": ["壴 (drum)", "口 (mouth) — singing and rejoicing to the drum beat, joyful"],
  "欢": ["又 (hand)", "欠 (open mouth) — joyous shout of jubilation, delight"],
  "作": ["亻 (person)", "乍 (start) — person setting to work, to make/do"],
  "工": ["ancient carpenter's square / ruler — labor, craftsmanship"],
  "现": ["王/玉 (jade)", "见 (see) — inner jade brilliance becoming visible, to appear/now"],
  "吃": ["口 (mouth)", "乞 (beg/receive) — taking sustenance into the mouth, to eat"],
  "喝": ["口 (mouth)", "曷 (imploring) — quenching thirst, to drink"],
  "睡": ["目 (eye)", "垂 (droop) — heavy eyelids drooping, to sleep"],
  "觉": ["𦥑 (hands)", "冖 (cover)", "见 (see) — suddenly waking up to realize, to feel"],
  "时": ["日 (sun)", "寸 (measure) — measuring the sun's passage, time"],
  "间": ["门 (gate)", "日 (sun) — sunbeam between gate leaves, space/interval"],
  "问": ["门 (gate)", "口 (mouth) — asking at the gate, to ask"],
  "闻": ["门 (gate)", "耳 (ear) — listening at the door, to hear/news"],
  "闪": ["门 (gate)", "人 (person) — person flashing through the doorway, to flash"],
  "闷": ["门 (gate)", "心 (heart) — heart shut tight behind doors, depressed/stuffy"],
  "钱": ["钅 (metal)", "戋 (small) — metal coins, money"],
  "买": ["乛 (net)", "头 (coin) — collecting goods, to buy"],
  "卖": ["十 (surplus)", "买 (buy) — parting with excess, to sell"],
  "车": ["ancient top-down view of a wheeled cart / chariot"],
  "机": ["木 (wood)", "几 (support) — wooden loom / mechanism, machine"],
  "飞": ["wings and feathers of a bird in swift flight, to fly"],
  "运": ["辶 (movement)", "云 (clouds) — moving continuously like floating clouds, to move/transport"],
  "动": ["云 (clouds)", "力 (force) — moving power, motion"],
  "谢": ["讠 (words)", "身 (body)", "寸 (bow) — humble words of gratitude accompanied by a bow, to thank"],
  "认": ["讠 (words)", "刃 (blade) — sharp recognition of words, to recognize"],
  "识": ["讠 (words)", "只 (mark) — knowing signs and words, knowledge"],
  "想": ["相 (mutual)", "心 (heart) — contemplating in one's heart, to think/miss"],
  "思": ["田 (brain/field)", "心 (heart) — working of mind and heart, thought"],
  "爱": ["爫 (claws/hands)", "冖 (cover)", "心 (heart)", "夂 (slowly) — tenderly holding from the bottom of one's heart, love"],
  "站": ["立 (stand)", "占 (position) — taking up a standing position, station/to stand"],
  "校": ["木 (wood)", "交 (interchange) — place of meeting and exchange of knowledge, school"],
  "院": ["阝 (wall/hill)", "完 (complete) — enclosed compound, courtyard/institution"],
  "医": ["匚 (tool chest)", "矢 (arrows) — healing arts, extracting arrows, medicine"],
  "起": ["走 (walk)", "己 (self) — rising onto one's own feet, to get up"],
  "跑": ["足 (foot)", "包 (wrap) — swiftly racing on feet, to run"],
  "冷": ["冫 (ice)", "令 (command) — biting frost taking command, cold"],
  "热": ["执 (grasp)", "灬 (fire) — blazing fire held in hand, hot"],
  "茶": ["艹 (grass)", "人 (person)", "木 (tree) — leaves of the bush granting vitality, tea"],
  "饭": ["饣 (food)", "反 (turn) — prepared meal, cooked rice"],
  "伴": ["亻 (person)", "半 (half) — other half, companion"],
  "体": ["亻 (person)", "本 (root) — bodily foundation of a person, body"],
  "生": ["shoot breaking through soil — life, birth"],
  "老": ["venerable elder with long hair and staff — old, aged"],
  "师": ["banner of the troop leader — teacher, master"],
  "见": ["eye with human legs — to see, meet"],
  "再": ["second time, again, once more"],
  "天": ["human figure with outstretched arms beneath heaven — sky, day"],
  "昨": ["日 (sun)", "乍 (past) — yesterday's sun, yesterday"],
  "今": ["gathering into this single moment — present, now"],
  "年": ["sheaf of ripened harvest, annual cycle — year"],
  "东": ["sun rising through tree branches — east"],
  "西": ["bird nest at sunset — west"],
  "果": ["tree bearing round succulent fruit — fruit, result"],
  "水": ["flowing streams of a river, water"],
  "苹": ["艹 (grass)", "平 (level/peaceful) — apple"],
  "帮": ["巾 (cloth)", "邦 (nation) — support, to help"],
  "助": ["力 (strength)", "且 (altar) — joining forces for a noble cause, assistance"],
  "准": ["冫 (ice)", "隹 (bird) — accurate alignment, preparation"],
  "备": ["夂 (step)", "田 (field) — readiness for action, reserve"],
  "已": ["completed cycle, already"],
  "经": ["纟 (thread)", "巠 (loom warp) — path, warp thread, to pass through"],
  "唱": ["口 (mouth)", "昌 (bright) — resonant bright singing, to sing"],
  "歌": ["哥 (melody)", "欠 (open mouth) — song"],
  "跳": ["足 (foot)", "兆 (quick stride) — to leap, jump"],
  "舞": ["dancer with flowing sleeves — dance"],
  "游": ["氵 (water)", "斿 (banner) — swimming / floating in water"],
  "泳": ["氵 (water)", "永 (eternal flow) — to swim"],
  "便": ["亻 (person)", "更 (change) — convenient, easy"],
  "宜": ["宀 (roof)", "且 (altar) — fitting, proper"],
  "漂": ["氵 (water)", "票 (float) — pristine and fresh, floating/beautiful"],
  "亮": ["亠 (top)", "口 (light)", "儿 (person) — brilliant radiant glow, bright"],
  "得": ["彳 (step)", "旦 (dawn)", "寸 (obtain) — to acquire, gain"],
  "知": ["矢 (arrow)", "口 (mouth) — swift word striking the mark, knowledge"],
  "道": ["辶 (path)", "首 (head) — path of wisdom, way / doctrine"],
  "懂": ["忄 (heart/mind)", "重 (deep) — deep comprehension of the essence, to understand"],
  "白": ["clear beam of morning light, white / clear"],
  "希": ["巾 (cloth)", "爻 (pattern) — rare embroidered weave, hope"],
  "望": ["亡 (perish)", "月 (moon)", "壬 (stand) — gazing into the distance at the full moon, hoping"],
};

const CHAR_COMPONENTS_ZH: Record<string, string[]> = {
  "学": ["冖 (秃宝盖)", "子 (孩子) — 良师引导下的求学启蒙"],
  "习": ["羽 (鸟翼) — 幼鸟振翅练习，温习操练"],
  "好": ["女 (女子)", "子 (孩子) — 母子相亲，和睦美好"],
  "明": ["日 (太阳)", "月 (月亮) — 日月齐辉，光明澄澈"],
  "休": ["亻 (人)", "木 (树木) — 人倚树木，停歇歇息"],
  "林": ["木 (树木)", "木 (树木) — 双木成林"],
  "森": ["木 (树木)", "木 (树木)", "木 (树木) — 三木成森，幽深茂密"],
  "从": ["人 (人)", "人 (人) — 二人相随，跟随顺从"],
  "众": ["人 (人)", "人 (人)", "人 (人) — 三人成众，众多人群"],
  "信": ["亻 (人)", "言 (言语) — 人言有信，诚信守诺"],
  "看": ["手 (手)", "目 (眼睛) — 手搭凉棚远眺，凝神细看"],
  "男": ["田 (田地)", "力 (力气) — 耕作田野之劳力，男子汉"],
  "家": ["宀 (房屋)", "豕 (猪) — 屋下有圈养牲畜，家园家庭"],
  "安": ["宀 (房屋)", "女 (女子) — 屋中有女居，平安宁静"],
  "字": ["宀 (房屋)", "子 (孩子) — 门下滋生繁衍，文字符号"],
  "朋": ["月 (贝币)", "月 (贝币) — 珍贵贝串，同道同门好友"],
  "友": ["又 (手)", "又 (手) — 两手相握，朋友之谊"],
  "电": ["日/申 (雷电)", "乚 (电芒) — 天空闪电光芒，电能"],
  "脑": ["月/肉 (身体)", "𡿨 (沟回)", "匕 — 首中思维之官，大脑"],
  "话": ["讠 (言语)", "舌 (舌头) — 舌尖吐纳之言，说话言语"],
  "语": ["讠 (言语)", "五 (五方)", "口 (口中) — 吐纳于口之深意，语言"],
  "汉": ["氵 (水流)", "又 (手) — 汉水发源之地，汉族汉字"],
  "中": ["丨 (箭矢)", "口 (箭靶) — 矢中靶心，正中居中"],
  "国": ["囗 (疆界)", "玉 (美玉) — 城垣守护珍宝，国家领土"],
  "喜": ["壴 (喜鼓)", "口 (欢唱) — 击鼓欢歌，喜悦欢腾"],
  "欢": ["又 (双手)", "欠 (张口) — 欢声雀跃，开怀欢乐"],
  "作": ["亻 (人)", "乍 (起始) — 人起而行之，制作劳作"],
  "工": ["古代匠人曲尺 — 工艺劳动，规矩手艺"],
  "现": ["王/玉 (美玉)", "见 (显现) — 玉石光华显露，显现当下"],
  "吃": ["口 (嘴巴)", "乞 (祈求/纳受) — 口纳食物，进食吃喝"],
  "喝": ["口 (嘴巴)", "曷 (呼求) — 口干急饮，畅饮喝水"],
  "睡": ["目 (眼眸)", "垂 (低垂) — 倦眼低垂，入眠安睡"],
  "觉": ["𦥑 (双手)", "冖 (遮蔽)", "见 (洞见) — 揭开遮蔽猛然看见，觉醒领会"],
  "时": ["日 (日头)", "寸 (刻度) — 测定日规推移，时光时刻"],
  "间": ["门 (门扉)", "日 (阳光) — 门扉中透入日光，缝隙间隔"],
  "问": ["门 (门扉)", "口 (询问) — 登门叩问，请教询问"],
  "闻": ["门 (门扉)", "耳 (耳朵) — 倚门倾听，聆听传闻"],
  "闪": ["门 (门扉)", "人 (人影) — 人影门前掠过，闪现闪烁"],
  "闷": ["门 (门扉)", "心 (心灵) — 封闭于门内之心，苦闷郁结"],
  "钱": ["钅 (金属)", "戋 (细微) — 铸造之金属钱币，金钱财富"],
  "买": ["乛 (网罗)", "头 (财货) — 网罗货物，购置买入"],
  "卖": ["十 (出货)", "买 (买入) — 溢出售让，贩卖出售"],
  "车": ["古代独辕两轮战车之俯视图，车辆"],
  "机": ["木 (木构)", "几 (机巧) — 木制织机巧构，机械机运"],
  "飞": ["展翅翱翔之羽翼飞鸟，飞翔飞逝"],
  "运": ["辶 (行进)", "云 (流云) — 如流云般迁徙流转，运转运送"],
  "动": ["云 (动云)", "力 (动力) — 汇聚力量移转，行动动弹"],
  "谢": ["讠 (言语)", "身 (躬身)", "寸 (分寸) — 躬身致辞以表敬意，感谢致谢"],
  "认": ["讠 (言语)", "刃 (利刃) — 辨别如刃之精准，认识辨认"],
  "识": ["讠 (言语)", "只 (记识) — 辨记言词符号，见识知识"],
  "想": ["相 (观相)", "心 (心思) — 心映万象思量，思念想念"],
  "思": ["田 (脑髓)", "心 (心神) — 运筹心智，沉思思绪"],
  "爱": ["爫 (双手)", "冖 (珍惜)", "心 (衷心)", "夂 (徐行) — 捧心慢护之真挚情感，珍爱仁爱"],
  "站": ["立 (直立)", "占 (位置) — 稳立于地占定席位，站立车站"],
  "校": ["木 (梁柱)", "交 (交融) — 师生交流学问之所，学堂学校"],
  "院": ["阝 (垣墙)", "完 (完整) — 庭垣围合之规整处所，庭院学院"],
  "医": ["匚 (盛器)", "矢 (矢箭) — 拔箭施治活人之术，医学医者"],
  "起": ["走 (迈步)", "己 (自身) — 振作己身迈步前行，起床起始"],
  "跑": ["足 (双足)", "包 (裹挟) — 迈开双足风驰电掣，奔跑跃进"],
  "冷": ["冫 (寒冰)", "令 (号令) — 严霜降临寒意逼人，寒冷冷清"],
  "热": ["执 (手持)", "灬 (烈焰) — 手执烈火炽盛熏灼，炎热温热"],
  "茶": ["艹 (草木)", "人 (人饮)", "木 (木本) — 人在草木之间舒展神思，清茗茶道"],
  "饭": ["饣 (饮食)", "反 (反转) — 烹熟转生为熟之谷物，米饭饭食"],
  "伴": ["亻 (人类)", "半 (半边) — 人之另一半辅佐相依，伴侣同伴"],
  "体": ["亻 (人身)", "本 (根本) — 人之根本形质骨架，身体体魄"],
  "生": ["破土萌发之青苗，生命诞生"],
  "老": ["须发斑白拄杖老者，年长长寿"],
  "师": ["军阵前引领之旌旗，导师恩师"],
  "见": ["睁目之人形远望，看见接见"],
  "再": ["重重叠叠更进一步，再次重演"],
  "天": ["顶天立地张臂大汉顶上蒼穹，天空天际"],
  "昨": ["日 (红日)", "乍 (初去) — 刚过去之白昼，昨日往昔"],
  "今": ["汇聚于此刻当下，如今现今"],
  "年": ["谷熟成熟丰收一轮，岁月光阴"],
  "东": ["旭日自扶桑林木间升起之方，东方晨曦"],
  "西": ["落日时分归鸟栖于巢木之方，西方落日"],
  "果": ["枝头结出圆硕果实，成果果实"],
  "水": ["奔流不息之山川清溪，水流滋养"],
  "苹": ["艹 (草木)", "平 (平和) — 平安吉祥之嘉果，苹果"],
  "帮": ["巾 (辅佐)", "邦 (邦国) — 辅翼家邦相扶相携，协助帮助"],
  "助": ["力 (出力)", "且 (助佑) — 汇聚众人力气成事，赞助协助"],
  "准": ["冫 (平准)", "隹 (仪鸟) — 水平齐准预作谋划，准备标准"],
  "备": ["夂 (戒备)", "田 (器用) — 有备无患准备就绪，预备设备"],
  "已": ["回转完满之终局，已然完成"],
  "经": ["纟 (经纬)", "巠 (直水) — 织锦之纵线大纲，经典经历"],
  "唱": ["口 (放声)", "昌 (通畅) — 朗朗高歌亮畅声调，歌唱吟唱"],
  "歌": ["哥 (吟咏)", "欠 (呼气) — 吐纳声律悠扬成曲，歌曲赞歌"],
  "跳": ["足 (步履)", "兆 (迅疾) — 腾挪起伏迅跃凌空，起跳跳跃"],
  "舞": ["长袖舒展旋转之舞者，舞蹈起舞"],
  "游": ["氵 (碧波)", "斿 (游戈) — 随波荡漾巡历远方，畅游旅行"],
  "泳": ["氵 (清流)", "永 (源长) — 随流水浮波前行，游泳潜泳"],
  "便": ["亻 (人体)", "更 (通畅) — 顺畅适宜安便便利，简便便宜"],
  "宜": ["宀 (高堂)", "且 (案几) — 宾主适得其所宜然，合宜适宜"],
  "漂": ["氵 (清波)", "票 (轻扬) — 浮水生姿轻盈秀美，漂浮漂亮"],
  "亮": ["亠 (高远)", "口 (明晰)", "儿 (俊采) — 朗照高远璀璨生辉，明亮光亮"],
  "得": ["彳 (行步)", "旦 (明晓)", "寸 (执守) — 身体力行收获成果，获得得到"],
  "知": ["矢 (利矢)", "口 (言语) — 语中要害如矢中的，知晓知识"],
  "道": ["辶 (大道)", "首 (头领) — 智者引领之正途大道，道路道法"],
  "懂": ["忄 (心智)", "重 (深沉) — 心入深处豁然领悟，懂得懂悟"],
  "白": ["初升清晓之一束白光，皎洁纯白"],
  "希": ["巾 (锦罗)", "爻 (织纹) — 稀罕精致之锦绣华纹，希望希冀"],
  "望": ["亡 (怅惘)", "月 (明月)", "壬 (登高) — 登高翘首遥望满月，盼望眺望"],
};

function normalizeLangCode(lang?: string): string {
  if (!lang || lang === "auto") return "en";
  const l = lang.toLowerCase();
  if (l === "zh-tw" || l === "zh-hk" || l.includes("hant")) return "zh-TW";
  if (l.startsWith("zh")) return "zh-CN";
  return lang;
}

export function getRadicalMeaning(
  rad: RadicalInfo | number,
  lang: string = "en"
): string {
  const num = typeof rad === "number" ? rad : rad.number;
  const normalizedLang = normalizeLangCode(lang);
  const mult = RADICAL_MULTILANG[num];
  if (mult && mult[normalizedLang]) {
    return mult[normalizedLang];
  }
  if (typeof rad === "object") {
    if (normalizedLang === "ru") return rad.meaningRu;
    if (normalizedLang === "en") return rad.meaningEn;
  }
  return mult?.["en"] || (typeof rad === "object" ? rad.meaningEn : KANGXI_RADICALS[num]?.meaningEn || "");
}

export function formatBasicRadicalDesc(
  radNum: number,
  radical: string,
  meaning: string,
  strokeCount: number,
  lang: string = "en"
): string {
  const l = normalizeLangCode(lang);
  switch (l) {
    case "ru":
      return `Базовый неделимый иероглиф-ключ #${radNum} «${radical}» («${meaning}», ${strokeCount} черт)`;
    case "de":
      return `Grundlegendes Kangxi-Radikal #${radNum} «${radical}» („${meaning}“, ${strokeCount} Striche)`;
    case "fr":
      return `Radical de base de Kangxi #${radNum} « ${radical} » (« ${meaning} », ${strokeCount} traits)`;
    case "es":
      return `Radical básico de Kangxi #${radNum} «${radical}» («${meaning}», ${strokeCount} trazos)`;
    case "ja":
      return `基本康熙部首 #${radNum}「${radical}」（${meaning}、${strokeCount}画）`;
    case "ko":
      return `기본 강희자전 부수 #${radNum} '${radical}' (${meaning}, ${strokeCount}획)`;
    case "vi":
      return `Bộ thủ Khang Hy cơ bản #${radNum} «${radical}» («${meaning}», ${strokeCount} nét)`;
    case "it":
      return `Radicale base di Kangxi #${radNum} «${radical}» («${meaning}», ${strokeCount} tratti)`;
    case "pt":
      return `Radical básico de Kangxi #${radNum} «${radical}» («${meaning}», ${strokeCount} traços)`;
    case "id":
      return `Radikal dasar Kangxi #${radNum} «${radical}» («${meaning}», ${strokeCount} guratan)`;
    case "th":
      return `หมวดนำคังซีพื้นฐาน #${radNum} «${radical}» («${meaning}», ${strokeCount} ขีด)`;
    case "ar":
      return `الجذر الأساسي لكانغ شي #${radNum} «${radical}» («${meaning}»، ${strokeCount} ضربات)`;
    case "tr":
      return `Temel Kangxi kökü #${radNum} «${radical}» («${meaning}», ${strokeCount} çizgi)`;
    case "pl":
      return `Podstawowy pierwiastek Kangxi #${radNum} «${radical}» („${meaning}”, ${strokeCount} kresek)`;
    case "nl":
      return `Basis Kangxi-radicaal #${radNum} «${radical}» («${meaning}», ${strokeCount} strepen)`;
    case "uk":
      return `Базовий неподільний ієрогліф-ключ #${radNum} «${radical}» («${meaning}», ${strokeCount} рис)`;
    case "hi":
      return `मूल कांग्शी मूलक #${radNum} «${radical}» («${meaning}», ${strokeCount} स्ट्रोक)`;
    case "zh-CN":
      return `基本康熙部首 #${radNum} “${radical}”（${meaning}，${strokeCount}画）`;
    case "zh-TW":
      return `基本康熙部首 #${radNum} 「${radical}」（${meaning}，${strokeCount}畫）`;
    case "en":
    default:
      return `Basic Kangxi radical #${radNum} «${radical}» («${meaning}», ${strokeCount} strokes)`;
  }
}

export function getCharacterRadical(char: string): RadicalInfo | null {
  if (!char) return null;
  const c = Array.from(char)[0];
  const radNum = CHAR_TO_RADICAL[c] || RADICAL_CHAR_MAP[c];
  if (radNum && KANGXI_RADICALS[radNum]) {
    return KANGXI_RADICALS[radNum];
  }
  return null;
}

export function getCharacterComponents(char: string, lang: string = "en"): string[] | null {
  if (!char) return null;
  const c = Array.from(char)[0];
  const l = normalizeLangCode(lang);

  if (l === "ru" && CHAR_COMPONENTS[c]) {
    return CHAR_COMPONENTS[c];
  }
  if ((l === "zh-CN" || l === "zh-TW") && CHAR_COMPONENTS_ZH[c]) {
    return CHAR_COMPONENTS_ZH[c];
  }
  if (l !== "ru" && CHAR_COMPONENTS_EN[c]) {
    return CHAR_COMPONENTS_EN[c];
  }
  if (CHAR_COMPONENTS[c]) {
    return CHAR_COMPONENTS[c];
  }

  const radNum = RADICAL_CHAR_MAP[c];
  if (radNum && KANGXI_RADICALS[radNum]) {
    const info = KANGXI_RADICALS[radNum];
    const meaning = getRadicalMeaning(info, lang);
    return [
      formatBasicRadicalDesc(radNum, info.radical, meaning, info.strokeCount, lang),
    ];
  }
  return null;
}
