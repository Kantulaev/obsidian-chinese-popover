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
   * Uses an elegant, readable 4-column layout that fits cleanly in Obsidian on all screen sizes.
   */
  async syncToMarkdown(): Promise<void> {
    const filePath = this.plugin.settings.vocabularyFilePath || "Chinese Vocabulary.md";
    const adapter = this.plugin.app.vault.adapter;

    let content = "# 🏮 Китайский словарик / Chinese Personal Vocabulary\n\n";
    content += "> Карточки и слова сохранены плагином **Chinese Popover Dictionary**.\n";
    content += `> Всего слов: **${this.items.length}** • Последнее обновление: **${new Date().toLocaleDateString()}**\n\n`;
    content += "| Иероглифы | Фонетика | Перевод | Контекст и дата |\n";
    content += "| :--- | :--- | :--- | :--- |\n";

    for (const item of this.items) {
      // Column 1: Hanzi
      let hanziCell = `**${this.escapeMd(item.word)}**`;
      if (item.traditional && item.traditional !== item.word) {
        hanziCell += `<br><small>繁: ${this.escapeMd(item.traditional)}</small>`;
      }

      // Column 2: Phonetics
      let phoneticsCell = `\`${this.escapeMd(item.pinyin)}\``;
      if (item.jyutping) {
        phoneticsCell += `<br><small>粵: ${this.escapeMd(item.jyutping)}</small>`;
      }

      // Column 3: Definitions
      const defCell = this.escapeMd(item.definitions.slice(0, 3).join(" • "));

      // Column 4: Context & Date
      let metaCell = "";
      if (item.contextSentence) {
        metaCell += `*“${this.escapeMd(item.contextSentence)}”*<br>`;
      }
      metaCell += `<small>${item.dateString}</small>`;

      content += `| ${hanziCell} | ${phoneticsCell} | ${defCell} | ${metaCell} |\n`;
    }

    try {
      await adapter.write(filePath, content);
    } catch (err) {
      console.error("[Chinese Dict] Failed to write vocabulary markdown file:", err);
    }
  }

  /**
   * Imports or re-reads words from the user's Markdown table (supports both 4-column and 7-column formats).
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
        if (
          !trimmed.startsWith("|") ||
          trimmed.includes(":---") ||
          trimmed.toLowerCase().includes("| word |") ||
          trimmed.toLowerCase().includes("| иероглифы |")
        ) {
          continue;
        }

        const cols = trimmed
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

        if (cols.length === 4) {
          // New 4-column format: | Hanzi | Phonetics | Definition | Meta |
          const hanziRaw = cols[0];
          const wordMatch = hanziRaw.match(/\*\*([^*]+)\*\*/);
          const word = wordMatch ? wordMatch[1].trim() : hanziRaw.split("<br>")[0].replace(/[^\u4e00-\u9fa5]/g, "").trim();
          
          let trad = "";
          const tradMatch = hanziRaw.match(/繁:\s*([^<]+)/);
          if (tradMatch) trad = tradMatch[1].trim();

          const phoneticsRaw = cols[1];
          const pinyinMatch = phoneticsRaw.match(/`([^`]+)`/);
          const pinyin = pinyinMatch ? pinyinMatch[1].trim() : phoneticsRaw.split("<br>")[0].trim();

          let jyutping = "";
          const jpMatch = phoneticsRaw.match(/粵:\s*([^<]+)/);
          if (jpMatch) jyutping = jpMatch[1].trim();

          const defs = cols[2].split("•").map((d) => d.trim()).filter(Boolean);

          const metaRaw = cols[3];
          let ctx = "";
          const ctxMatch = metaRaw.match(/\*“([^”]+)”\*/);
          if (ctxMatch) ctx = ctxMatch[1].trim();

          let date = "";
          const dateMatch = metaRaw.match(/(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) date = dateMatch[1];

          if (word) {
            parsedItems.push({
              id: `${word}-${Date.now()}`,
              word,
              traditional: trad || undefined,
              pinyin,
              jyutping,
              definitions: defs.length > 0 ? defs : ["No definition"],
              contextSentence: ctx || undefined,
              dateAdded: Date.now(),
              dateString: date || new Date().toISOString().slice(0, 10),
              tags: [],
            });
          }
        } else if (cols.length >= 5) {
          // Legacy 7-column format
          const word = cols[0].replace(/\*\*/g, "").trim();
          const trad = cols[1] === "-" ? "" : cols[1];
          const pinyin = cols[2];
          const jyutping = cols[3] === "-" ? "" : cols[3];
          const defs = cols[4].split(/;|•/).map((d) => d.trim()).filter(Boolean);
          const ctx = cols[5] && cols[5] !== "-" ? cols[5].replace(/^\*|\*$/g, "").replace(/^“|”$/g, "") : "";
          const date = cols[6] || "";

          if (word) {
            parsedItems.push({
              id: `${word}-${Date.now()}`,
              word,
              traditional: trad || undefined,
              pinyin,
              jyutping,
              definitions: defs.length > 0 ? defs : ["No definition"],
              contextSentence: ctx || undefined,
              dateAdded: Date.now(),
              dateString: date || new Date().toISOString().slice(0, 10),
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
