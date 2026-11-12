import { Notice, TFile } from "obsidian";
import type ChineseHoverDictPlugin from "./main.ts";
import type { MatchResult } from "./dictionary.ts";
import { formatPinyin } from "./pinyin.ts";

export interface VocabularyItem {
  id: string;
  word: string;
  traditional?: string;
  pinyin: string;
  jyutping: string;
  definitions: string[];
  contextSentence?: string;
  dateAdded: number; // unix timestamp ms
  dateString: string; // YYYY-MM-DD
  tags?: string[];
}

export type VocabularySort = "date_desc" | "date_asc" | "alpha";

export class VocabularyManager {
  private plugin: ChineseHoverDictPlugin;
  private items: VocabularyItem[] = [];
  private isLoaded = false;

  constructor(plugin: ChineseHoverDictPlugin) {
    this.plugin = plugin;
  }

  async load(): Promise<void> {
    try {
      // 1. Load from plugin stored data
      const data = await this.plugin.loadData();
      if (data && Array.isArray(data.vocabulary)) {
        this.items = data.vocabulary;
      }

      // 2. Check if the markdown file exists in vault; if not, create it
      const filePath = this.plugin.settings.vocabularyFilePath || "Chinese Vocabulary.md";
      const adapter = this.plugin.app.vault.adapter;
      if (!(await adapter.exists(filePath))) {
        await this.syncToMarkdown();
      } else if (this.items.length === 0) {
        // If plugin data was empty, try parsing existing markdown file
        await this.importFromMarkdown();
      }

      this.isLoaded = true;
    } catch (err) {
      console.warn("[Chinese Dict] Vocabulary load error:", err);
      this.isLoaded = true;
    }
  }

  getItems(): VocabularyItem[] {
    return this.items;
  }

  hasWord(word: string): boolean {
    return this.items.some((item) => item.word === word);
  }

  getItem(word: string): VocabularyItem | undefined {
    return this.items.find((item) => item.word === word);
  }

  async addWord(match: MatchResult, contextSentence?: string): Promise<VocabularyItem> {
    const existingIndex = this.items.findIndex((i) => i.word === match.word);

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

    // Extract clean definitions
    const defs: string[] = [];
    for (const e of match.entries) {
      for (const d of e.definitions) {
        const clean = d.replace(/\(CL:[^)]+\)/g, "").replace(/\[[^\]]+\]/g, "").trim();
        if (clean && !defs.includes(clean)) {
          defs.push(clean);
        }
        if (defs.length >= 4) break;
      }
      if (defs.length >= 4) break;
    }

    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const cleanContext = contextSentence ? contextSentence.replace(/\r?\n/g, " ").trim() : "";

    const newItem: VocabularyItem = {
      id: `${match.word}-${Date.now()}`,
      word: match.word,
      traditional: trads || undefined,
      pinyin: pinyinAccented,
      jyutping: jyutping,
      definitions: defs.length > 0 ? defs : ["No definition"],
      contextSentence: cleanContext || undefined,
      dateAdded: Date.now(),
      dateString: dateString,
      tags: [],
    };

    if (existingIndex >= 0) {
      // Update existing item
      this.items[existingIndex] = newItem;
    } else {
      this.items.unshift(newItem);
    }

    await this.persist();
    await this.syncToMarkdown();

    new Notice(`⭐ Добавлено в словарик: ${match.word} (${pinyinAccented})`, 3000);
    return newItem;
  }

  async removeWord(word: string): Promise<boolean> {
    const initialLen = this.items.length;
    this.items = this.items.filter((i) => i.word !== word);

    if (this.items.length !== initialLen) {
      await this.persist();
      await this.syncToMarkdown();
      new Notice(`Удалено из словарика: ${word}`, 2500);
      return true;
    }
    return false;
  }

  async toggleWord(match: MatchResult, contextSentence?: string): Promise<boolean> {
    if (this.hasWord(match.word)) {
      await this.removeWord(match.word);
      return false;
    } else {
      await this.addWord(match, contextSentence);
      return true;
    }
  }

  private async persist(): Promise<void> {
    const currentData = (await this.plugin.loadData()) || {};
    currentData.vocabulary = this.items;
    await this.plugin.saveData(currentData);
  }

  /**
   * Syncs the current vocabulary list to the user's Markdown file in their vault.
   */
  async syncToMarkdown(): Promise<void> {
    const filePath = this.plugin.settings.vocabularyFilePath || "Chinese Vocabulary.md";
    const adapter = this.plugin.app.vault.adapter;

    let content = "# 🏮 Chinese Personal Vocabulary\n\n";
    content += "> Permanent vocabulary notebook managed by **Chinese Popover Dictionary**.\n";
    content += `> Total entries: **${this.items.length}** | Last updated: **${new Date().toLocaleDateString()}**\n\n`;
    content += "| Word | Traditional | Pinyin | Jyutping (粵) | Definition | Context | Date |\n";
    content += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n";

    for (const item of this.items) {
      const word = `**${this.escapeMd(item.word)}**`;
      const trad = this.escapeMd(item.traditional || "-");
      const pinyin = this.escapeMd(item.pinyin);
      const jyutping = this.escapeMd(item.jyutping || "-");
      const def = this.escapeMd(item.definitions.slice(0, 3).join("; "));
      const ctx = item.contextSentence ? `*${this.escapeMd(item.contextSentence)}*` : "-";
      const date = item.dateString;

      content += `| ${word} | ${trad} | ${pinyin} | ${jyutping} | ${def} | ${ctx} | ${date} |\n`;
    }

    try {
      await adapter.write(filePath, content);
    } catch (err) {
      console.error("[Chinese Dict] Failed to write vocabulary markdown file:", err);
    }
  }

  /**
   * Imports or re-reads words from the user's Markdown table if edited outside.
   */
  async importFromMarkdown(): Promise<number> {
    const filePath = this.plugin.settings.vocabularyFilePath || "Chinese Vocabulary.md";
    const adapter = this.plugin.app.vault.adapter;

    if (!(await adapter.exists(filePath))) return 0;

    try {
      const text = await adapter.read(filePath);
      const lines = text.split("\n");
      const parsedItems: VocabularyItem[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("|") || trimmed.includes(":---") || trimmed.toLowerCase().includes("| word |")) {
          continue;
        }

        const cols = trimmed
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

        if (cols.length >= 5) {
          const word = cols[0].replace(/\*\*/g, "").trim();
          const trad = cols[1] === "-" ? "" : cols[1];
          const pinyin = cols[2];
          const jyutping = cols[3] === "-" ? "" : cols[3];
          const defs = cols[4].split(";").map((d) => d.trim());
          const ctx = cols[5] && cols[5] !== "-" ? cols[5].replace(/^\*|\*$/g, "") : "";
          const date = cols[6] || "";

          if (word) {
            parsedItems.push({
              id: `${word}-${Date.now()}`,
              word,
              traditional: trad || undefined,
              pinyin,
              jyutping,
              definitions: defs,
              contextSentence: ctx || undefined,
              dateAdded: Date.now(),
              dateString: date,
              tags: [],
            });
          }
        }
      }

      if (parsedItems.length > 0) {
        this.items = parsedItems;
        await this.persist();
        return parsedItems.length;
      }
    } catch (err) {
      console.warn("[Chinese Dict] Failed to parse vocabulary markdown file:", err);
    }
    return 0;
  }

  /**
   * Open the vocabulary markdown file inside the active Obsidian workspace
   */
  async openMarkdownFile(): Promise<void> {
    const filePath = this.plugin.settings.vocabularyFilePath || "Chinese Vocabulary.md";
    const file = this.plugin.app.vault.getAbstractFileByPath(filePath);
    if (file instanceof TFile) {
      await this.plugin.app.workspace.getLeaf(false).openFile(file);
    } else {
      await this.syncToMarkdown();
      const newFile = this.plugin.app.vault.getAbstractFileByPath(filePath);
      if (newFile instanceof TFile) {
        await this.plugin.app.workspace.getLeaf(false).openFile(newFile);
      }
    }
  }

  private escapeMd(str: string): string {
    return str.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  }
}
