/**
 * Context Sentence Examples (例句) Database for Chinese Vocabulary
 * Supports both high-speed offline core database and dynamic live fetching from Tatoeba Open API.
 */

import { requestUrl } from "obsidian";

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
    {
      chinese: "我打算明年去中国旅游。",
      pinyin: "Wǒ dǎsuàn míngnián qù zhōngguó lǚyóu.",
      english: "I plan to travel to China next year.",
      russian: "Я планирую поехать в Китай в следующем году.",
    },
  ],
  "喜欢": [
    {
      chinese: "我非常喜欢喝中国绿茶。",
      pinyin: "Wǒ fēicháng xǐhuān hē zhōngguó lǜchá.",
      english: "I really like drinking Chinese green tea.",
      russian: "Мне очень нравится пить китайский зеленый чай.",
    },
    {
      chinese: "你喜欢听什么音乐？",
      pinyin: "Nǐ xǐhuān tīng shénme yīnyuè?",
      english: "What kind of music do you like listening to?",
      russian: "Какую музыку ты любишь слушать?",
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
  "时间": [
    {
      chinese: "时间过得真快啊！",
      pinyin: "Shíjiān guò de zhēn kuài a!",
      english: "Time flies so fast!",
      russian: "Время летит так быстро!",
    },
    {
      chinese: "你明天有时间吗？",
      pinyin: "Nǐ míngtiān yǒu shíjiān ma?",
      english: "Do you have time tomorrow?",
      russian: "У тебя есть завтра время?",
    },
  ],
  "看": [
    {
      chinese: "我看了一本很有意思的书。",
      pinyin: "Wǒ kànle yī běn hěn yǒuyìsi de shū.",
      english: "I read a very interesting book.",
      russian: "Я прочитал очень интересную книгу.",
    },
  ],
  "听": [
    {
      chinese: "你听懂他在说什么了吗？",
      pinyin: "Nǐ tīng dǒng tā zài shuō shénme le ma?",
      english: "Did you understand what he said?",
      russian: "Ты понял, что он сказал?",
    },
  ],
  "吃": [
    {
      chinese: "你吃过北京烤鸭吗？",
      pinyin: "Nǐ chīguo běijīng kǎoyā ma?",
      english: "Have you ever eaten Peking duck?",
      russian: "Ты пробовал пекинскую утку?",
    },
  ],
  "喝": [
    {
      chinese: "你想喝茶还是咖啡？",
      pinyin: "Nǐ xiǎng hē chá háishì kāfēi?",
      english: "Would you like tea or coffee?",
      russian: "Ты хочешь чай или кофе?",
    },
  ],
  "买": [
    {
      chinese: "我想买这件衬衫，多少钱？",
      pinyin: "Wǒ xiǎng mǎi zhè jiàn chènshān, duōshao qián?",
      english: "I want to buy this shirt, how much is it?",
      russian: "Я хочу купить эту рубашку, сколько она стоит?",
    },
  ],
  "准备": [
    {
      chinese: "我们正在认真准备考试。",
      pinyin: "Wǒmen zhèngzài rènzhēn zhǔnbèi kǎoshì.",
      english: "We are carefully preparing for the exam.",
      russian: "Мы тщательно готовимся к экзамену.",
    },
  ],
  "帮助": [
    {
      chinese: "非常感谢你对我的帮助。",
      pinyin: "Fēicháng gǎnxiè nǐ duì wǒ de bāngzhù.",
      english: "Thank you very much for your help.",
      russian: "Большое спасибо за твою помощь.",
    },
  ],
  "希望": [
    {
      chinese: "我希望一切都会好起来。",
      pinyin: "Wǒ xīwàng yīqiè dōu huì hǎo qǐlai.",
      english: "I hope everything will be fine.",
      russian: "Я надеюсь, что всё наладится.",
    },
  ],
};

const DYNAMIC_EXAMPLES_CACHE = new Map<string, ExampleSentence[]>();
const MAX_CACHE_SIZE = 300;

/**
 * Returns instant synchronous example sentences if present in local offline database
 */
export function getExampleSentences(word: string): ExampleSentence[] | null {
  if (!word) return null;
  const clean = word.trim();
  if (DYNAMIC_EXAMPLES_CACHE.has(clean)) {
    return DYNAMIC_EXAMPLES_CACHE.get(clean)!;
  }
  return EXAMPLES_DATABASE[clean] || null;
}

/**
 * Fetches authentic parallel sentences dynamically from Tatoeba Open API with in-memory caching.
 * Non-blocking, fails gracefully to empty array on timeout or offline mode.
 */
export async function fetchDynamicExamples(
  word: string,
  targetLang: "rus" | "eng" = "rus"
): Promise<ExampleSentence[]> {
  const cleanWord = word.trim();
  if (!cleanWord) return [];

  const cacheKey = `${cleanWord}:${targetLang}`;
  if (DYNAMIC_EXAMPLES_CACHE.has(cacheKey)) {
    return DYNAMIC_EXAMPLES_CACHE.get(cacheKey)!;
  }

  if (EXAMPLES_DATABASE[cleanWord]) {
    const list = EXAMPLES_DATABASE[cleanWord];
    DYNAMIC_EXAMPLES_CACHE.set(cacheKey, list);
    return list;
  }

interface TatoebaItem {
  text?: string;
  transcriptions?: Array<{ script?: string; text?: string }>;
  translations?: Array<Array<{ lang?: string; text?: string }>>;
}

interface TatoebaResponse {
  results?: TatoebaItem[];
}

  const url = `https://tatoeba.org/en/api_v0/search?from=cmn&to=${targetLang}&query=${encodeURIComponent(cleanWord)}`;

  try {
    const res = await requestUrl({
      url,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const json = res.json as TatoebaResponse | null;
    if (res.status !== 200 || !json || !Array.isArray(json.results)) {
      return [];
    }

    const sentences: ExampleSentence[] = [];
    const results = json.results;

    for (const item of results) {
      if (!item.text) continue;
      const zh = item.text.trim();

      // Find pinyin transcription if present in response
      let py = "";
      if (Array.isArray(item.transcriptions)) {
        const latn = item.transcriptions.find(
          (t) => t.script === "Latn"
        );
        if (latn && latn.text) {
          py = latn.text.trim();
        }
      }

      // Find translation matching target language
      let trans = "";
      if (Array.isArray(item.translations)) {
        for (const subGroup of item.translations) {
          if (Array.isArray(subGroup)) {
            const matched = subGroup.find(
              (t) => t.lang === targetLang
            );
            if (matched && matched.text) {
              trans = matched.text.trim();
              break;
            }
          }
        }
      }

      if (zh && trans) {
        sentences.push({
          chinese: zh,
          pinyin: py,
          english: targetLang === "eng" ? trans : "",
          russian: targetLang === "rus" ? trans : "",
        });
        if (sentences.length >= 2) break;
      }
    }

    // Keep cache bounded
    if (DYNAMIC_EXAMPLES_CACHE.size >= MAX_CACHE_SIZE) {
      const firstKey = DYNAMIC_EXAMPLES_CACHE.keys().next().value;
      if (firstKey) DYNAMIC_EXAMPLES_CACHE.delete(firstKey);
    }

    DYNAMIC_EXAMPLES_CACHE.set(cacheKey, sentences);
    DYNAMIC_EXAMPLES_CACHE.set(cleanWord, sentences);
    return sentences;
  } catch {
    return [];
  }
}
