/**
 * Context Sentence Examples (例句) Database for Chinese Vocabulary
 */

export interface ExampleSentence {
  chinese: string;
  pinyin: string;
  english: string;
  russian: string;
}

export const EXAMPLES_DATABASE: Record<string, ExampleSentence[]> = {
  "你好": [
    {
      chinese: "你好！很高兴认识你。",
      pinyin: "Nǐ hǎo! Hěn gāoxìng rènshí nǐ.",
      english: "Hello! Nice to meet you.",
      russian: "Привет! Очень приятно познакомиться.",
    },
  ],
  "学习": [
    {
      chinese: "我每天都在学习中文。",
      pinyin: "Wǒ měitiān dōu zài xuéxí zhōngwén.",
      english: "I study Chinese every day.",
      russian: "Я каждый день учу китайский язык.",
    },
    {
      chinese: "我们要向他学习。",
      pinyin: "Wǒmen yào xiàng tā xuéxí.",
      english: "We should learn from him.",
      russian: "Нам следует учиться у него.",
    },
  ],
  "工作": [
    {
      chinese: "他在一家国际公司工作。",
      pinyin: "Tā zài yī jiā guójì gōngsī gōngzuò.",
      english: "He works at an international company.",
      russian: "Он работает в международной компании.",
    },
    {
      chinese: "最近工作非常忙。",
      pinyin: "Zuìjìn gōngzuò fēicháng máng.",
      english: "Work has been very busy lately.",
      russian: "В последнее время на работе очень много дел.",
    },
  ],
  "朋友": [
    {
      chinese: "有朋自远方来，不亦乐乎？",
      pinyin: "Yǒu péng zì yuǎnfāng lái, bù yì yuè hū?",
      english: "Is it not delightful to have friends coming from distant quarters?",
      russian: "Разве не радостно, когда друзья приезжают издалека?",
    },
    {
      chinese: "他是我的好朋友。",
      pinyin: "Tā shì wǒ de hǎo péngyǒu.",
      english: "He is my good friend.",
      russian: "Он мой хороший друг.",
    },
  ],
  "中国": [
    {
      chinese: "中国有很多著名的历史名胜。",
      pinyin: "Zhōngguó yǒu hěn duō zhùmíng de lìshǐ míngshèng.",
      english: "China has many famous historical places.",
      russian: "В Китае много знаменитых исторических достопримечательностей.",
    },
  ],
  "喜欢": [
    {
      chinese: "我非常喜欢喝中国绿茶。",
      pinyin: "Wǒ fēicháng xǐhuān hē zhōngguó lǜchá.",
      english: "I really like drinking Chinese green tea.",
      russian: "Мне очень нравится пить китайский зеленый чай.",
    },
  ],
  "电脑": [
    {
      chinese: "这台电脑的速度非常快。",
      pinyin: "Zhè tái diànnǎo de sùdù fēicháng kuài.",
      english: "This computer is very fast.",
      russian: "Этот компьютер работает очень быстро.",
    },
  ],
  "生活": [
    {
      chinese: "这里的大学生活非常丰富多彩。",
      pinyin: "Zhèlǐ de dàxué shēnghuó fēicháng fēngfù duōcǎi.",
      english: "University life here is very rich and colorful.",
      russian: "Студенческая жизнь здесь очень насыщенная и интересная.",
    },
  ],
  "自由": [
    {
      chinese: "我们拥有选择自己生活道路的自由。",
      pinyin: "Wǒmen yǒngyǒu xuǎnzé zìjǐ shēnghuó dàolù de zìyóu.",
      english: "We have the freedom to choose our own life path.",
      russian: "У нас есть свобода выбирать свой жизненный путь.",
    },
  ],
};

/**
 * Returns example sentences for a word if available
 */
export function getExampleSentences(word: string): ExampleSentence[] | null {
  if (!word) return null;
  return EXAMPLES_DATABASE[word.trim()] || null;
}
