/**
 * Complete 214 Kangxi Radicals (康熙部首 1 to 214) & Character Etymology Components
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

// Common character to Kangxi radical index mapping
const CHAR_TO_RADICAL: Record<string, number> = {
  // 人 / 亻 (9)
  "你": 9, "他": 9, "休": 9, "们": 9, "作": 9, "住": 9, "体": 9, "便": 9, "信": 9, "值": 9, "像": 9, "位": 9, "会": 9, "令": 9,
  // 言 / 讠 (149)
  "话": 149, "语": 149, "说": 149, "请": 149, "读": 149, "认": 149, "识": 149, "谢": 149, "试": 149, "课": 149, "谁": 149, "词": 149,
  // 口 (30)
  "吃": 30, "喝": 30, "叫": 30, "听": 30, "问": 30, "响": 30, "唱": 30, "吗": 30, "呢": 30, "吧": 30, "名": 30, "各": 30, "告": 30,
  // 水 / 氵 (85)
  "江": 85, "河": 85, "海": 85, "湖": 85, "洗": 85, "汉": 85, "没": 85, "渴": 85, "温": 85, "游": 85, "清": 85, "深": 85, "演": 85,
  // 手 / 扌 (64)
  "打": 64, "找": 64, "提": 64, "把": 64, "报": 64, "排": 64, "推": 64, "拿": 64, "搞": 64, "接": 64, "换": 64, "掉": 64, "擦": 64,
  // 心 / 忄 (61)
  "想": 61, "思": 61, "念": 61, "懂": 61, "快": 61, "慢": 61, "忙": 61, "急": 61, "情": 61, "感": 61, "怕": 61, "态": 61, "总": 61,
  // 艸 / 艹 (140)
  "草": 140, "茶": 140, "花": 140, "英": 140, "菜": 140, "苹": 140, "药": 140, "节": 140, "蓝": 140, "苦": 140, "荣": 140,
  // 女 (38)
  "好": 38, "妈": 38, "妹": 38, "姐": 38, "她": 38, "姓": 38, "如": 38, "始": 38, "娘": 38, "妻": 38,
  // 火 / 灬 (86)
  "热": 86, "点": 86, "黑": 86, "照": 86, "然": 86, "烧": 86, "灯": 86, "煮": 86,
  // 木 (75)
  "校": 75, "样": 75, "机": 75, "杯": 75, "桌": 75, "椅": 75, "林": 75, "森": 75, "李": 75, "条": 75, "极": 75, "果": 75, "相": 75,
  // 金 / 钅 (167)
  "钱": 167, "钟": 167, "铁": 167, "银": 167, "错": 167, "钢": 167, "针": 167,
  // 辵 / 辶 (162)
  "这": 162, "边": 162, "进": 162, "远": 162, "近": 162, "过": 162, "还": 162, "道": 162, "选": 162, "通": 162, "适": 162, "连": 162,
  // 宀 (40)
  "家": 40, "安": 40, "字": 40, "定": 40, "室": 40, "客": 40, "实": 40, "容": 40, "官": 40,
  // 日 (72)
  "时": 72, "明": 72, "星": 72, "春": 72, "昨": 72, "早": 72, "晚": 72, "最": 72, "易": 72,
  // 目 (109)
  "看": 109, "眼": 109, "睛": 109, "睡": 109,
  // 糸 / 纟 (120)
  "红": 120, "绿": 120, "给": 120, "细": 120, "结": 120, "练": 120, "经": 120, "终": 120, "线": 120,
};

// Common character ideogram component decompositions
const CHAR_COMPONENTS: Record<string, string[]> = {
  "休": ["亻 (человек)", "木 (дерево) — прислонился к дереву для отдыха"],
  "好": ["女 (женщина)", "子 (ребенок) — мать и дитя, гармония и благо"],
  "明": ["日 (солнце)", "月 (луна) — два светила дают ясный свет"],
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
  "学": ["冖 (покров)", "子 (дитя) — познание истины под покровом учителя"],
  "问": ["门 (дверь)", "口 (рот) — говорить у ворот, спрашивать"],
  "间": ["门 (дверь)", "日 (солнце) — солнечный луч сквозь створки ворот, промежуток"],
  "闻": ["门 (дверь)", "耳 (ухо) — прислушиваться у двери, слышать новости"],
  "闪": ["门 (дверь)", "人 (человек) — человек быстро промелькнул в двери, блеснуть"],
  "闷": ["门 (дверь)", "心 (сердце) — сердце заперто за дверью, тоска"],
  "伴": ["亻 (человек)", "半 (половина) — вторая половинка, спутник"],
  "体": ["亻 (человек)", "本 (корень) — телесная основа человека"],
};

export function getCharacterRadical(char: string): RadicalInfo | null {
  if (!char) return null;
  const c = Array.from(char)[0];
  const radNum = CHAR_TO_RADICAL[c];
  if (radNum && KANGXI_RADICALS[radNum]) {
    return KANGXI_RADICALS[radNum];
  }
  return null;
}

export function getCharacterComponents(char: string): string[] | null {
  if (!char) return null;
  const c = Array.from(char)[0];
  return CHAR_COMPONENTS[c] || null;
}
