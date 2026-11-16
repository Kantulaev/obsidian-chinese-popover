import type ChineseHoverDictPlugin from "./main.ts";
import type { MatchResult } from "./dictionary.ts";
import { formatPinyin } from "./pinyin.ts";

export interface HistoryItem {
  word: string;
  traditional?: string;
  pinyin: string;
  jyutping?: string;
  definitions: string[];
  timestamp: number;
}

interface PluginSavedData {
  history?: HistoryItem[];
  [key: string]: unknown;
}

export class HistoryManager {
  private plugin: ChineseHoverDictPlugin;
  private items: HistoryItem[] = [];
  private maxItems: number = 50;

  constructor(plugin: ChineseHoverDictPlugin) {
    this.plugin = plugin;
  }

  async load(): Promise<void> {
    try {
      const data = (await this.plugin.loadData()) as PluginSavedData | null;
      if (data && Array.isArray(data.history)) {
        this.items = data.history;
      }
    } catch {
      this.items = [];
    }
  }

  getItems(): HistoryItem[] {
    return this.items;
  }

  async add(match: MatchResult): Promise<void> {
    if (!match || !match.word) return;

    // Filter out previous occurrence if present
    this.items = this.items.filter((i) => i.word !== match.word);

    const firstEntry = match.entries[0];
    const simplified = firstEntry?.simplified || match.word;
    const trads = Array.from(
      new Set(
        match.entries
          .map((e) => e.traditional)
          .filter((t) => t && t !== simplified)
      )
    ).join(", ");

    const pinyinRaw = firstEntry?.pinyin || "";
    const pinyinAccented = formatPinyin(pinyinRaw, true);
    const jyutping = firstEntry?.jyutping || "";

    const defs: string[] = [];
    for (const e of match.entries) {
      for (const d of e.definitions) {
        const clean = d.replace(/\(CL:[^)]+\)/g, "").replace(/\[[^\]]+\]/g, "").trim();
        if (clean && !defs.includes(clean)) {
          defs.push(clean);
        }
        if (defs.length >= 3) break;
      }
      if (defs.length >= 3) break;
    }

    const newItem: HistoryItem = {
      word: match.word,
      traditional: trads || undefined,
      pinyin: pinyinAccented,
      jyutping: jyutping || undefined,
      definitions: defs.length > 0 ? defs : ["No definition"],
      timestamp: Date.now(),
    };

    this.items.unshift(newItem);

    const max = this.plugin.settings?.maxRecentHistory || 50;
    if (this.items.length > max) {
      this.items = this.items.slice(0, max);
    }

    await this.persist();
  }

  async remove(word: string): Promise<void> {
    this.items = this.items.filter((i) => i.word !== word);
    await this.persist();
  }

  async clear(): Promise<void> {
    this.items = [];
    await this.persist();
  }

  private async persist(): Promise<void> {
    try {
      const currentData = ((await this.plugin.loadData()) as PluginSavedData | null) || {};
      currentData.history = this.items;
      await this.plugin.saveData(currentData);
    } catch {
      // ignore
    }
  }
}
