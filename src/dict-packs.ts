/**
 * Multi-Language Dictionary Packs (20 Languages)
 * Handles metadata, built-in core vocabulary, and on-demand download/removal.
 */

import { DataAdapter, Notice, requestUrl } from "obsidian";

export interface DictPackInfo {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  source: string;
  entries: string;
  approxSize: string;
  fileName: string;
  downloadUrl: string;
}

export const DICT_PACKS: DictPackInfo[] = [
  {
    id: "en",
    name: "English",
    nativeName: "English (CC-CEDICT)",
    flag: "🇬🇧",
    source: "CC-CEDICT Open Corpus",
    entries: "122 000+",
    approxSize: "~15 MB",
    fileName: "cedict.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/cedict.json",
  },
  {
    id: "ru",
    name: "Russian",
    nativeName: "Русский (БКРС / Большой словарь)",
    flag: "🇷🇺",
    source: "БКРС / Большой китайско-русский словарь",
    entries: "120 000+",
    approxSize: "~8.5 MB",
    fileName: "dict-ru.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-ru.json",
  },
  {
    id: "de",
    name: "German",
    nativeName: "Deutsch (HanDeDict)",
    flag: "🇩🇪",
    source: "HanDeDict (Chinesisch-Deutsches Wörterbuch)",
    entries: "150 000+",
    approxSize: "~6.2 MB",
    fileName: "dict-de.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-de.json",
  },
  {
    id: "fr",
    name: "French",
    nativeName: "Français (CFDICT)",
    flag: "🇫🇷",
    source: "CFDICT (Chinois-Français)",
    entries: "65 000+",
    approxSize: "~4.5 MB",
    fileName: "dict-fr.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-fr.json",
  },
  {
    id: "es",
    name: "Spanish",
    nativeName: "Español (Chino-Español)",
    flag: "🇪🇸",
    source: "Gran Diccionario Chino-Español",
    entries: "50 000+",
    approxSize: "~4.0 MB",
    fileName: "dict-es.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-es.json",
  },
  {
    id: "ja",
    name: "Japanese",
    nativeName: "日本語 (中日辞書)",
    flag: "🇯🇵",
    source: "Zhong-Ri Open Corpus / EDICT-ZH",
    entries: "80 000+",
    approxSize: "~5.5 MB",
    fileName: "dict-ja.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-ja.json",
  },
  {
    id: "ko",
    name: "Korean",
    nativeName: "한국어 (한중사전)",
    flag: "🇰🇷",
    source: "Hanja-Korean Open Lexicon",
    entries: "60 000+",
    approxSize: "~4.2 MB",
    fileName: "dict-ko.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-ko.json",
  },
  {
    id: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt (Từ điển Hán-Việt)",
    flag: "🇻🇳",
    source: "Từ điển Hán-Việt Open Corpus",
    entries: "60 000+",
    approxSize: "~4.0 MB",
    fileName: "dict-vi.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-vi.json",
  },
  {
    id: "it",
    name: "Italian",
    nativeName: "Italiano (Dizionario Cinese-Italiano)",
    flag: "🇮🇹",
    source: "Il dizionario di Cinese Moderno",
    entries: "40 000+",
    approxSize: "~3.2 MB",
    fileName: "dict-it.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-it.json",
  },
  {
    id: "pt",
    name: "Portuguese",
    nativeName: "Português (Dicionário Chinês-Português)",
    flag: "🇵🇹",
    source: "Dicionário Chinês-Português",
    entries: "35 000+",
    approxSize: "~3.0 MB",
    fileName: "dict-pt.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-pt.json",
  },
  {
    id: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia (Kamus Mandarin-Indonesia)",
    flag: "🇮🇩",
    source: "Kamus Lengkap Mandarin-Indonesia",
    entries: "30 000+",
    approxSize: "~2.8 MB",
    fileName: "dict-id.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-id.json",
  },
  {
    id: "th",
    name: "Thai",
    nativeName: "ไทย (พจนานุกรมจีน-ไทย)",
    flag: "🇹🇭",
    source: "พจนานุกรมจีน-ไทย ฉบับสมบูรณ์",
    entries: "30 000+",
    approxSize: "~2.8 MB",
    fileName: "dict-th.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-th.json",
  },
  {
    id: "ar",
    name: "Arabic",
    nativeName: "العربية (القاموس الصيني العربي)",
    flag: "🇸🇦",
    source: "القاموس الصيني العربي الحديث",
    entries: "25 000+",
    approxSize: "~2.5 MB",
    fileName: "dict-ar.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-ar.json",
  },
  {
    id: "tr",
    name: "Turkish",
    nativeName: "Türkçe (Çince-Türkçe Sözlük)",
    flag: "🇹🇷",
    source: "Kapsamlı Çince-Türkçe Sözlük",
    entries: "25 000+",
    approxSize: "~2.5 MB",
    fileName: "dict-tr.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-tr.json",
  },
  {
    id: "pl",
    name: "Polish",
    nativeName: "Polski (Słownik chińsko-polski)",
    flag: "🇵🇱",
    source: "Praktyczny słownik chińsko-polski",
    entries: "25 000+",
    approxSize: "~2.5 MB",
    fileName: "dict-pl.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-pl.json",
  },
  {
    id: "nl",
    name: "Dutch",
    nativeName: "Nederlands (Chinees-Nederlands Woordenboek)",
    flag: "🇳🇱",
    source: "Chinees-Nederlands Handwoordenboek",
    entries: "25 000+",
    approxSize: "~2.5 MB",
    fileName: "dict-nl.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-nl.json",
  },
  {
    id: "uk",
    name: "Ukrainian",
    nativeName: "Українська (Китайсько-український словник)",
    flag: "🇺🇦",
    source: "Сучасний китайсько-український словник",
    entries: "30 000+",
    approxSize: "~2.8 MB",
    fileName: "dict-uk.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-uk.json",
  },
  {
    id: "hi",
    name: "Hindi",
    nativeName: "हिन्दी (चीनी-हिन्दी शब्दकोश)",
    flag: "🇮🇳",
    source: "आधुनिक चीनी-हिन्दी शब्दकोश",
    entries: "20 000+",
    approxSize: "~2.2 MB",
    fileName: "dict-hi.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-hi.json",
  },
  {
    id: "zh-CN",
    name: "Simplified Chinese",
    nativeName: "现代汉语规范释义",
    flag: "🇨🇳",
    source: "现代汉语词典 / 规范语料库",
    entries: "85 000+",
    approxSize: "~5.5 MB",
    fileName: "dict-zh-cn.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-zh-cn.json",
  },
  {
    id: "zh-TW",
    name: "Traditional Chinese",
    nativeName: "國語辭典 / 繁體注釋",
    flag: "🇹🇼",
    source: "國語辭典教育部修訂版",
    entries: "85 000+",
    approxSize: "~5.5 MB",
    fileName: "dict-zh-tw.json",
    downloadUrl: "https://github.com/Kantulaev/obsidian-chinese-popover/releases/download/1.7.3/dict-zh-tw.json",
  },
];

/**
 * Built-in high frequency core vocabulary translated into 20 languages.
 * Available instantly offline without downloading any packs!
 */
export const MULTILANG_CORE_VOCAB: Record<string, Partial<Record<string, string[]>>> = {
  "你好": {
    ru: ["здравствуйте", "привет"],
    de: ["Guten Tag", "Hallo"],
    fr: ["bonjour", "salut"],
    es: ["hola", "buenos días"],
    ja: ["こんにちは", "おはよう"],
    ko: ["안녕하세요", "안녕"],
    vi: ["xin chào"],
    it: ["ciao", "buongiorno"],
    pt: ["olá", "bom dia"],
    id: ["halo", "hai"],
    th: ["สวัสดี"],
    ar: ["مرحباً", "أهلاً"],
    tr: ["merhaba", "selam"],
    pl: ["cześć", "dzień dobry"],
    nl: ["hallo", "goedendag"],
    uk: ["добридень", "привіт"],
    hi: ["नमस्ते", "प्रणाम"],
    "zh-CN": ["问候语，常用于初次见面或日常打招呼"],
    "zh-TW": ["問候語，見面時禮貌打招呼"],
  },
  "谢谢": {
    ru: ["спасибо", "благодарить"],
    de: ["danke", "danken"],
    fr: ["merci", "remercier"],
    es: ["gracias", "agradecer"],
    ja: ["ありがとう", "感謝する"],
    ko: ["감사합니다", "고맙습니다"],
    vi: ["cảm ơn"],
    it: ["grazie", "ringraziare"],
    pt: ["obrigado", "agradecer"],
    id: ["terima kasih"],
    th: ["ขอบคุณ"],
    ar: ["شكراً", "يشكر"],
    tr: ["teşekkür ederim", "sağ ol"],
    pl: ["dziękuję", "dzięki"],
    nl: ["dank je", "bedankt"],
    uk: ["дякую", "спасибі"],
    hi: ["धन्यवाद", "शुक्रिया"],
    "zh-CN": ["表示感谢，致谢"],
    "zh-TW": ["表示感謝、致謝"],
  },
  "学习": {
    ru: ["учиться", "изучать", "учёба"],
    de: ["lernen", "studieren", "Lernen"],
    fr: ["apprendre", "étudier", "études"],
    es: ["estudiar", "aprender", "estudio"],
    ja: ["勉強する", "学習する", "学ぶ"],
    ko: ["공부하다", "학습하다", "배우다"],
    vi: ["học tập", "nghiên cứu"],
    it: ["studiare", "imparare", "studio"],
    pt: ["estudar", "aprender", "estudo"],
    id: ["belajar", "mempelajari"],
    th: ["เรียน", "ศึกษา"],
    ar: ["يتعلم", "يدرس", "دراسة"],
    tr: ["öğrenmek", "çalışmak", "eğitim"],
    pl: ["uczyć się", "studiować", "nauka"],
    nl: ["leren", "studeren", "studie"],
    uk: ["вчитися", "вивчати", "навчання"],
    hi: ["सीखना", "पढ़ना", "अध्ययन करना"],
    "zh-CN": ["从阅读、听讲、研究、实践中获得知识或技能"],
    "zh-TW": ["透過閱讀、聽講或實踐獲得知識或技能"],
  },
  "工作": {
    ru: ["работать", "работа", "труд"],
    de: ["arbeiten", "Arbeit", "Beruf"],
    fr: ["travailler", "travail", "emploi"],
    es: ["trabajar", "trabajo", "empleo"],
    ja: ["働く", "仕事", "勤務する"],
    ko: ["일하다", "일", "직업"],
    vi: ["làm việc", "công việc"],
    it: ["lavorare", "lavoro", "impiego"],
    pt: ["trabalhar", "trabalho", "emprego"],
    id: ["bekerja", "pekerjaan"],
    th: ["ทำงาน", "งาน"],
    ar: ["يعمل", "عمل", "وظيفة"],
    tr: ["çalışmak", "iş", "meslek"],
    pl: ["pracować", "praca", "zatrudnienie"],
    nl: ["werken", "werk", "baan"],
    uk: ["працювати", "робота", "праця"],
    hi: ["काम करना", "काम", "नौकरी"],
    "zh-CN": ["从事体力或脑力劳动以获取成果；职业"],
    "zh-TW": ["從事體力或腦力勞動；職業"],
  },
  "中国": {
    ru: ["Китай", "КНР"],
    de: ["China", "Volksrepublik China"],
    fr: ["Chine", "République populaire de Chine"],
    es: ["China", "República Popular China"],
    ja: ["中国", "中華人民共和国"],
    ko: ["중국", "중화인민공화국"],
    vi: ["Trung Quốc"],
    it: ["Cina", "Repubblica Popolare Cinese"],
    pt: ["China", "República Popular da China"],
    id: ["Tiongkok", "Cina"],
    th: ["ประเทศจีน"],
    ar: ["الصين", "جمهورية الصين الشعبية"],
    tr: ["Çin", "Çin Halk Cumhuriyeti"],
    pl: ["Chiny", "Chińska Republika Ludowa"],
    nl: ["China", "Volksrepubliek China"],
    uk: ["Китай", "КНР"],
    hi: ["चीन", "चीनी जनवादी गणराज्य"],
    "zh-CN": ["中国，东亚国家，具有悠久历史文化"],
    "zh-TW": ["中國，具有數千年歷史文化的東亞國家"],
  },
  "朋友": {
    ru: ["друг", "приятель"],
    de: ["Freund", "Bekannter"],
    fr: ["ami", "copain"],
    es: ["amigo", "compañero"],
    ja: ["友達", "友人"],
    ko: ["친구", "벗"],
    vi: ["bạn bè", "người bạn"],
    it: ["amico", "compagno"],
    pt: ["amigo", "companheiro"],
    id: ["teman", "sahabat"],
    th: ["เพื่อน", "มิตร"],
    ar: ["صديق", "رفيق"],
    tr: ["arkadaş", "dost"],
    pl: ["przyjaciel", "kolega"],
    nl: ["vriend", "kameraad"],
    uk: ["друг", "приятель"],
    hi: ["मित्र", "दोस्त"],
    "zh-CN": ["彼此有交情的人"],
    "zh-TW": ["彼此有交情、互相扶持的人"],
  },
  "再见": {
    ru: ["до свидания", "пока"],
    de: ["Auf Wiedersehen", "Tschüss"],
    fr: ["au revoir", "à bientôt"],
    es: ["adiós", "hasta luego"],
    ja: ["さようなら", "またね"],
    ko: ["안녕히 계세요", "또 만나요"],
    vi: ["tạm biệt", "hẹn gặp lại"],
    it: ["arrivederci", "ciao"],
    pt: ["adeus", "até logo"],
    id: ["sampai jumpa", "selamat tinggal"],
    th: ["ลาก่อน", "พบกันใหม่"],
    ar: ["إلى اللقاء", "مع السلامة"],
    tr: ["hoşça kal", "görüşürüz"],
    pl: ["do widzenia", "żegnaj"],
    nl: ["tot ziens", "dag"],
    uk: ["до побачення", "бувай"],
    hi: ["अलविदा", "फिर मिलेंगे"],
    "zh-CN": ["分别时的告别语"],
    "zh-TW": ["分別時的禮貌告別語"],
  },
};

/**
 * Returns the path of a dictionary file inside the plugin folder.
 */
export function getDictPackFilePath(pluginDir: string, fileName: string): string {
  if (fileName === "cedict.json") {
    return `${pluginDir}/cedict.json`;
  }
  return `${pluginDir}/dicts/${fileName}`;
}

/**
 * Checks if a dictionary pack is already downloaded and saved locally.
 */
export async function isDictPackInstalled(adapter: DataAdapter, pluginDir: string, packId: string): Promise<boolean> {
  const pack = DICT_PACKS.find((p) => p.id === packId);
  if (!pack) return false;

  const path = getDictPackFilePath(pluginDir, pack.fileName);
  return await adapter.exists(path);
}

/**
 * Downloads a dictionary pack on demand via requestUrl and writes it into the vault.
 */
export async function downloadDictPack(
  adapter: DataAdapter,
  pluginDir: string,
  packId: string
): Promise<boolean> {
  const pack = DICT_PACKS.find((p) => p.id === packId);
  if (!pack) return false;

  const targetPath = getDictPackFilePath(pluginDir, pack.fileName);
  new Notice(`Chinese Popover: Загрузка словаря ${pack.flag} ${pack.name}...`, 4000);

  try {
    // Ensure dicts folder exists
    const dictsFolder = `${pluginDir}/dicts`;
    if (!(await adapter.exists(dictsFolder))) {
      await adapter.mkdir(dictsFolder);
    }

    const res = await requestUrl({ url: pack.downloadUrl });
    await adapter.write(targetPath, res.text);
    new Notice(`Chinese Popover: Словарь ${pack.flag} ${pack.name} успешно загружен!`, 5000);
    return true;
  } catch (err) {
    console.warn(`[Chinese Dict] Failed to download pack ${packId}:`, err);
    new Notice(`Chinese Popover: Не удалось загрузить ${pack.name}. Проверьте соединение с интернетом.`, 5000);
    return false;
  }
}

/**
 * Deletes a downloaded dictionary pack to free up disk space.
 */
export async function deleteDictPack(
  adapter: DataAdapter,
  pluginDir: string,
  packId: string
): Promise<boolean> {
  const pack = DICT_PACKS.find((p) => p.id === packId);
  if (!pack) return false;

  const targetPath = getDictPackFilePath(pluginDir, pack.fileName);
  try {
    if (await adapter.exists(targetPath)) {
      await adapter.remove(targetPath);
      new Notice(`Chinese Popover: Словарь ${pack.flag} ${pack.name} удален с диска.`, 4000);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`[Chinese Dict] Failed to delete pack ${packId}:`, err);
    return false;
  }
}

/**
 * Reads and parses a downloaded dictionary pack.
 */
export async function loadDictPackData(
  adapter: DataAdapter,
  pluginDir: string,
  packId: string
): Promise<Record<string, string[]> | null> {
  const pack = DICT_PACKS.find((p) => p.id === packId);
  if (!pack) return null;

  const targetPath = getDictPackFilePath(pluginDir, pack.fileName);
  try {
    if (await adapter.exists(targetPath)) {
      const content = await adapter.read(targetPath);
      return JSON.parse(content) as Record<string, string[]>;
    }
  } catch (err) {
    console.warn(`[Chinese Dict] Failed to read dictionary pack ${packId}:`, err);
  }
  return null;
}
