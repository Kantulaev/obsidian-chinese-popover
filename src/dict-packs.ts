/**
 * Multi-Language Dictionary Packs (20+ Languages + Cantonese)
 * Handles pack metadata, mirror fetching, and on-demand install/removal.
 */

import { DataAdapter, Notice, requestUrl } from "obsidian";
export { MULTILANG_CORE_VOCAB } from "./multilang-data.ts";

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

const RAW_MAIN_BASE = "https://raw.githubusercontent.com/Kantulaev/obsidian-chinese-popover/main/dicts";

function packEntry(
  id: string,
  name: string,
  nativeName: string,
  flag: string,
  source: string,
  entries: string,
  approxSize: string,
  fileName: string
): DictPackInfo {
  return {
    id,
    name,
    nativeName,
    flag,
    source,
    entries,
    approxSize,
    fileName,
    downloadUrl: `${RAW_MAIN_BASE}/${fileName}`,
  };
}

export const DICT_PACKS: DictPackInfo[] = [
  packEntry("en", "English", "English (CC-CEDICT)", "🇬🇧", "CC-CEDICT Open Corpus", "122 000+", "~42.3 MB", "cedict.json"),
  packEntry("yue", "Cantonese", "廣東話 / 粵語 (Cantonese Jyutping)", "🇭🇰", "Hong Kong Cantonese Corpus & Jyutping Lexicon", "231 000+", "~17.3 MB", "dict-yue.json"),
  packEntry("ru", "Russian", "Русский (БКРС / Большой словарь)", "🇷🇺", "БКРС / Большой китайско-русский словарь", "470 000+", "~33.6 MB", "dict-ru.json"),
  packEntry("de", "German", "Deutsch (HanDeDict)", "🇩🇪", "HanDeDict (Chinesisch-Deutsches Wörterbuch)", "246 000+", "~13.2 MB", "dict-de.json"),
  packEntry("fr", "French", "Français (CFDICT / CC-CEDICT Français)", "🇫🇷", "CFDICT (Chinois-Français) & C+DICT", "515 000+", "~25.9 MB", "dict-fr.json"),
  packEntry("es", "Spanish", "Español (Gran Diccionario Chino-Español)", "🇪🇸", "Gran Diccionario Chino-Español (CEDICT-ES)", "475 000+", "~24.2 MB", "dict-es.json"),
  packEntry("ja", "Japanese", "日本語 (中日辞書 / MJdic)", "🇯🇵", "MJdic Open Japanese Corpus & C+DICT", "465 000+", "~23.8 MB", "dict-ja.json"),
  packEntry("ko", "Korean", "한국어 (한중사전 / C+DICT)", "🇰🇷", "CC-CPLUSDICT Korean & Hanja Lexicon", "365 000+", "~18.9 MB", "dict-ko.json"),
  packEntry("vi", "Vietnamese", "Tiếng Việt (Từ điển Hán-Việt CVDICT)", "🇻🇳", "Từ điển Hán-Việt Open Corpus", "194 000+", "~12.9 MB", "dict-vi.json"),
  packEntry("it", "Italian", "Italiano (Dizionario Cinese-Italiano)", "🇮🇹", "Il dizionario di Cinese Moderno & HSK", "315 000+", "~12.7 MB", "dict-it.json"),
  packEntry("pt", "Portuguese", "Português (Dicionário Chinês-Português)", "🇵🇹", "Dicionário Chinês-Português C+DICT", "455 000+", "~23.1 MB", "dict-pt.json"),
  packEntry("id", "Indonesian", "Bahasa Indonesia (Kamus Mandarin-Indonesia)", "🇮🇩", "Kamus Lengkap Mandarin-Indonesia C+DICT", "300 000+", "~16.1 MB", "dict-id.json"),
  packEntry("th", "Thai", "ไทย (พจนานุกรมจีน-ไทย)", "🇹🇭", "พจนานุกรมจีน-ไทย ฉบับสมบูรณ์ C+DICT", "255 000+", "~25.7 MB", "dict-th.json"),
  packEntry("ar", "Arabic", "العربية (القاموس الصيني العربي)", "🇸🇦", "القاموس الصيني العربي الحديث & HSK", "155 000+", "~7.9 MB", "dict-ar.json"),
  packEntry("tr", "Turkish", "Türkçe (Çince-Türkçe Sözlük)", "🇹🇷", "Kapsamlı Çince-Türkçe Sözlük & HSK", "129 000+", "~5.5 MB", "dict-tr.json"),
  packEntry("pl", "Polish", "Polski (Słownik chińsko-polski)", "🇵🇱", "Praktyczny słownik chińsko-polski & HSK", "279 000+", "~11.2 MB", "dict-pl.json"),
  packEntry("nl", "Dutch", "Nederlands (Chinees-Nederlands Woordenboek)", "🇳🇱", "Chinees-Nederlands Handwoordenboek & HSK", "290 000+", "~11.2 MB", "dict-nl.json"),
  packEntry("uk", "Ukrainian", "Українська (Китайсько-український словник)", "🇺🇦", "Сучасний китайсько-український словник & HSK", "214 000+", "~10.9 MB", "dict-uk.json"),
  packEntry("hi", "Hindi", "हिन्दी (चीनी-हिन्दी शब्दкоश)", "🇮🇳", "आधुनिक चीनी-हिन्दी शब्दकोश", "39 000+", "~2.1 MB", "dict-hi.json"),
  packEntry("zh-CN", "Simplified Chinese", "现代汉语规范释义 (新华字典)", "🇨🇳", "现代汉语词典 / 新华字典 / 规范语料库", "287 000+", "~18.0 MB", "dict-zh-cn.json"),
  packEntry("zh-TW", "Traditional Chinese", "國語辭典 / 繁體注釋 (教育部版)", "🇹🇼", "國語辭典教育部修訂版", "287 000+", "~18.0 MB", "dict-zh-tw.json"),
];

/**
 * Downloads a JSON string from ordered mirror URLs, guaranteeing an Error instance on failure.
 */
export async function fetchJsonFromMirrors(
  urls: string[],
  fallbackErrorMsg: string
): Promise<string> {
  let lastError: unknown = null;

  for (const url of urls) {
    try {
      const attempt = await requestUrl({ url });
      if (attempt?.text && attempt.text.trim().startsWith("{")) {
        return attempt.text;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error(typeof lastError === "string" ? lastError : fallbackErrorMsg);
}

/**
 * Returns standard mirror URLs for any dictionary file in the repository's dicts/ directory.
 */
export function buildDictMirrorUrls(fileName: string, primaryUrl?: string): string[] {
  const urls = [
    primaryUrl || `${RAW_MAIN_BASE}/${fileName}`,
    `https://cdn.jsdelivr.net/gh/Kantulaev/obsidian-chinese-popover@main/dicts/${fileName}`,
    `https://raw.githubusercontent.com/Kantulaev/obsidian-chinese-popover/master/dicts/${fileName}`,
  ];
  return Array.from(new Set(urls));
}

export function getDictPackFilePath(pluginDir: string, fileName: string): string {
  return `${pluginDir}/dicts/${fileName}`;
}

export async function getExistingDictPackPath(
  adapter: DataAdapter,
  pluginDir: string,
  fileName: string
): Promise<string | null> {
  const dictsPath = `${pluginDir}/dicts/${fileName}`;
  if (await adapter.exists(dictsPath)) return dictsPath;
  const rootPath = `${pluginDir}/${fileName}`;
  if (await adapter.exists(rootPath)) return rootPath;
  return null;
}

export async function isDictPackInstalled(adapter: DataAdapter, pluginDir: string, packId: string): Promise<boolean> {
  const pack = DICT_PACKS.find((p) => p.id === packId);
  if (!pack) return false;
  return (await getExistingDictPackPath(adapter, pluginDir, pack.fileName)) !== null;
}

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
    const dictsFolder = `${pluginDir}/dicts`;
    if (!(await adapter.exists(dictsFolder))) {
      await adapter.mkdir(dictsFolder);
    }

    const text = await fetchJsonFromMirrors(
      buildDictMirrorUrls(pack.fileName, pack.downloadUrl),
      `Failed to download ${pack.fileName} from mirrors`
    );

    await adapter.write(targetPath, text);
    new Notice(`Chinese Popover: Словарь ${pack.flag} ${pack.name} успешно загружен!`, 5000);
    return true;
  } catch (err) {
    console.warn(`[Chinese Dict] Failed to download pack ${packId}:`, err);
    new Notice(`Chinese Popover: Не удалось загрузить ${pack.name}. Ошибка: ${(err as Error)?.message || "Сетевая ошибка"}`, 5000);
    return false;
  }
}

export async function deleteDictPack(
  adapter: DataAdapter,
  pluginDir: string,
  packId: string
): Promise<boolean> {
  const pack = DICT_PACKS.find((p) => p.id === packId);
  if (!pack) return false;

  let deleted = false;
  for (const path of [`${pluginDir}/dicts/${pack.fileName}`, `${pluginDir}/${pack.fileName}`]) {
    try {
      if (await adapter.exists(path)) {
        await adapter.remove(path);
        deleted = true;
      }
    } catch (err) {
      console.error(`[Chinese Dict] Failed to delete pack ${packId} at ${path}:`, err);
    }
  }

  if (deleted) {
    new Notice(`Chinese Popover: Словарь ${pack.flag} ${pack.name} удален с диска.`, 4000);
  }
  return deleted;
}

export async function loadDictPackData(
  adapter: DataAdapter,
  pluginDir: string,
  packId: string
): Promise<Record<string, string[]> | null> {
  const pack = DICT_PACKS.find((p) => p.id === packId);
  if (!pack) return null;

  try {
    const existingPath = await getExistingDictPackPath(adapter, pluginDir, pack.fileName);
    if (existingPath) {
      return JSON.parse(await adapter.read(existingPath)) as Record<string, string[]>;
    }
  } catch (err) {
    console.warn(`[Chinese Dict] Failed to read dictionary pack ${packId}:`, err);
  }
  return null;
}
