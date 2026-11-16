import { App, SuggestModal } from "obsidian";
import type ChineseHoverDictPlugin from "./main.ts";
import { DictEntry, MatchResult } from "./dictionary.ts";
import { formatPinyin } from "./pinyin.ts";
import { getHskBadgeInfo } from "./hsk.ts";
import { detectPinyinTone, getToneColor } from "./tones.ts";

export interface SearchMatchItem {
  word: string;
  entries: DictEntry[];
  highlightField: "word" | "pinyin" | "definition";
}

export class ChineseSearchModal extends SuggestModal<SearchMatchItem> {
  private plugin: ChineseHoverDictPlugin;

  constructor(app: App, plugin: ChineseHoverDictPlugin) {
    super(app);
    this.plugin = plugin;
    this.setPlaceholder("Поиск по словарю: иероглифы (你好), пиньинь (nihao) или перевод (привет / hello)...");
    this.emptyStateText = "Ничего не найдено в словаре";
  }

  getSuggestions(query: string): SearchMatchItem[] {
    const q = query.trim();
    if (!q) {
      // Show recent history or top common words when query is empty
      const historyItems = this.plugin.history?.getItems() || [];
      if (historyItems.length > 0) {
        const results: SearchMatchItem[] = [];
        for (const h of historyItems.slice(0, 15)) {
          const entries = this.plugin.dictionary.get(h.word) || [
            {
              traditional: h.traditional || h.word,
              pinyin: h.pinyin,
              jyutping: h.jyutping,
              definitions: h.definitions,
            },
          ];
          results.push({
            word: h.word,
            entries,
            highlightField: "word",
          });
        }
        return results;
      }
      return [];
    }

    const dictData = this.plugin.dictionary.getData();
    if (!dictData) return [];

    const lowerQ = q.toLowerCase();
    const cleanPinyinQ = lowerQ.replace(/[\s\d]/g, "");
    const isHanziQuery = /\p{Script=Han}/u.test(q);

    const exactMatches: SearchMatchItem[] = [];
    const prefixMatches: SearchMatchItem[] = [];
    const pinyinMatches: SearchMatchItem[] = [];
    const defMatches: SearchMatchItem[] = [];

    const limit = 25;

    // 1. Direct key check if query is Chinese
    if (isHanziQuery) {
      const exactEntries = dictData[q];
      if (exactEntries && exactEntries.length > 0) {
        exactMatches.push({ word: q, entries: exactEntries, highlightField: "word" });
      }
    }

    // 2. Iterate keys
    for (const word of Object.keys(dictData)) {
      if (exactMatches.length >= limit) break;

      const entries = dictData[word];
      if (!entries || entries.length === 0) continue;

      if (isHanziQuery) {
        if (word === q) continue; // already in exact
        if (word.startsWith(q)) {
          prefixMatches.push({ word, entries, highlightField: "word" });
          if (prefixMatches.length >= limit) break;
        } else if (word.includes(q) && prefixMatches.length < 15) {
          prefixMatches.push({ word, entries, highlightField: "word" });
        }
      } else {
        // Match by Pinyin or English/Russian definitions
        const firstEntry = entries[0];
        const pinyinRaw = firstEntry.pinyin.toLowerCase().replace(/[\s\d]/g, "");
        const pinyinSpaced = firstEntry.pinyin.toLowerCase();

        if (pinyinRaw === cleanPinyinQ || pinyinSpaced.startsWith(lowerQ)) {
          pinyinMatches.push({ word, entries, highlightField: "pinyin" });
          if (pinyinMatches.length >= limit) break;
        } else if (pinyinRaw.startsWith(cleanPinyinQ)) {
          if (pinyinMatches.length < limit) {
            pinyinMatches.push({ word, entries, highlightField: "pinyin" });
          }
        } else if (defMatches.length < 15) {
          // Check definition keywords
          const hasDefMatch = entries.some((e) =>
            e.definitions.some((d) => d.toLowerCase().includes(lowerQ))
          );
          if (hasDefMatch) {
            defMatches.push({ word, entries, highlightField: "definition" });
          }
        }
      }
    }

    const combined = [...exactMatches, ...prefixMatches, ...pinyinMatches, ...defMatches];
    return combined.slice(0, limit);
  }

  renderSuggestion(item: SearchMatchItem, el: HTMLElement): void {
    el.empty();
    el.addClass("ch-search-suggestion-item");

    const row = el.createDiv({ cls: "ch-search-row" });

    // Word (Hanzi)
    const wordSpan = row.createSpan({ cls: "ch-search-word", text: item.word });

    // HSK Badge
    const hsk = getHskBadgeInfo(item.word);
    if (hsk) {
      const badge = row.createSpan({ cls: "ch-dict-hsk-badge", text: hsk.label });
      badge.style.setProperty("--hsk-color", hsk.color);
      badge.style.setProperty("--hsk-bg", hsk.bg);
    }

    // Phonetics
    const firstEntry = item.entries[0];
    const pyFormatted = formatPinyin(firstEntry?.pinyin || "", true);
    const pyContainer = row.createSpan({ cls: "ch-search-pinyin" });

    const syllables = pyFormatted.split(/\s+/).filter(Boolean);
    syllables.forEach((syl, idx) => {
      if (idx > 0) pyContainer.createSpan({ text: " " });
      const tone = detectPinyinTone(syl);
      const s = pyContainer.createSpan({ text: syl, cls: `ch-tone-${tone}` });
      s.style.setProperty("color", getToneColor(tone));
    });

    if (firstEntry?.jyutping) {
      row.createSpan({ cls: "ch-search-jyutping", text: `(粤 ${firstEntry.jyutping})` });
    }

    // Definition snippet
    const defSnippet = item.entries
      .flatMap((e) => e.definitions)
      .slice(0, 3)
      .join("; ");
    if (defSnippet) {
      el.createDiv({ cls: "ch-search-def", text: defSnippet });
    }
  }

  onChooseSuggestion(item: SearchMatchItem, _evt: MouseEvent | KeyboardEvent): void {
    const match: MatchResult = {
      word: item.word,
      entries: item.entries,
      length: Array.from(item.word).length,
    };

    // Open popover centered on screen
    const clientX = window.innerWidth / 2;
    const clientY = window.innerHeight / 2 - 80;

    this.plugin.tooltip.show(match, clientX, clientY, this.plugin.settings);
    // Pin it so it stays visible after modal closes!
    if (!this.plugin.tooltip.getIsPinned()) {
      this.plugin.tooltip.togglePin();
    }
  }
}
