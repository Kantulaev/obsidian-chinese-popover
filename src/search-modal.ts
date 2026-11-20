import { App, SuggestModal } from "obsidian";
import type ChineseHoverDictPlugin from "./main.ts";
import { DictEntry, MatchResult } from "./dictionary.ts";
import { formatPinyin } from "./pinyin.ts";
import { getHskBadgeInfo } from "./hsk.ts";
import { detectPinyinTone, getToneColor } from "./tones.ts";
import { getRussianDefinitions } from "./russian-dict.ts";

export interface SearchMatchItem {
  word: string;
  entries: DictEntry[];
  highlightField: "word" | "pinyin" | "definition";
}

function renderHighlighted(container: HTMLElement, fullText: string, query: string): void {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    container.setText(fullText);
    return;
  }
  const lower = fullText.toLowerCase();
  const idx = lower.indexOf(trimmed);
  if (idx === -1) {
    container.setText(fullText);
    return;
  }
  const before = fullText.slice(0, idx);
  const match = fullText.slice(idx, idx + trimmed.length);
  const after = fullText.slice(idx + trimmed.length);

  if (before) container.createSpan({ text: before });
  container.createSpan({ cls: "ch-search-match", text: match });
  if (after) {
    renderHighlighted(container, after, query);
  }
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
          // Check definition keywords (English CC-CEDICT or Russian БКРС)
          let hasDefMatch = entries.some((e) =>
            e.definitions.some((d) => d.toLowerCase().includes(lowerQ))
          );
          if (!hasDefMatch && /[а-яё]/i.test(lowerQ)) {
            const ru = getRussianDefinitions(word);
            if (ru && ru.some((d) => d.toLowerCase().includes(lowerQ))) {
              hasDefMatch = true;
            }
          }
          if (hasDefMatch) {
            defMatches.push({ word, entries, highlightField: "definition" });
          }
        }
      }
    }

    const combined = [...exactMatches, ...prefixMatches, ...pinyinMatches, ...defMatches];
    return combined.slice(0, limit);
  }

  onOpen(): void {
    void super.onOpen();
    const footer = this.modalEl.createDiv({ cls: "ch-search-footer" });
    const legend = footer.createDiv({ cls: "ch-search-legend" });

    const kbdNavigate = legend.createSpan();
    kbdNavigate.createEl("kbd", { text: "↑↓" });
    kbdNavigate.createSpan({ text: " Навигация" });

    const kbdSelect = legend.createSpan();
    kbdSelect.createEl("kbd", { text: "↵" });
    kbdSelect.createSpan({ text: " Открыть карточку" });

    const kbdClose = legend.createSpan();
    kbdClose.createEl("kbd", { text: "esc" });
    kbdClose.createSpan({ text: " Закрыть" });

    footer.createSpan({ text: "Словарь CC-CEDICT" });
  }

  renderSuggestion(item: SearchMatchItem, el: HTMLElement): void {
    el.empty();
    el.addClass("ch-search-suggestion-item");

    const query = this.inputEl?.value?.trim() || "";
    const row = el.createDiv({ cls: "ch-search-row" });

    // Word (Hanzi)
    const wordSpan = row.createSpan({ cls: "ch-search-word" });
    if (query && item.word.toLowerCase().includes(query.toLowerCase())) {
      renderHighlighted(wordSpan, item.word, query);
    } else {
      wordSpan.setText(item.word);
    }

    // HSK Badge
    if (this.plugin.settings.showHskBadge) {
      const hsk = getHskBadgeInfo(item.word);
      if (hsk) {
        const badge = row.createSpan({ cls: "ch-dict-hsk-badge", text: hsk.label });
        badge.setCssProps({
          "--hsk-color": hsk.color,
          "--hsk-bg": hsk.bg,
        });
      }
    }

    // Phonetics
    const firstEntry = item.entries[0];
    const pyFormatted = formatPinyin(firstEntry?.pinyin || "", true);
    const pyContainer = row.createSpan({ cls: "ch-search-pinyin" });

    if (this.plugin.settings.toneColoring === "off") {
      pyContainer.setText(pyFormatted);
    } else {
      const syllables = pyFormatted.split(/\s+/).filter(Boolean);
      syllables.forEach((syl, idx) => {
        if (idx > 0) pyContainer.createSpan({ text: " " });
        const tone = detectPinyinTone(syl);
        const s = pyContainer.createSpan({ text: syl, cls: `ch-tone-${tone}` });
        s.setCssStyles({ color: getToneColor(tone) });
      });
    }

    if (firstEntry?.jyutping) {
      row.createSpan({ cls: "ch-search-jyutping", text: `(粤 ${firstEntry.jyutping})` });
    }

    // Definition snippet
    let defSnippet = "";
    if (this.plugin.settings.translationLanguage === "ru") {
      const ru = getRussianDefinitions(item.word);
      if (ru && ru.length > 0) {
        defSnippet = ru.slice(0, 3).join("; ");
      }
    } else if (this.plugin.settings.translationLanguage === "both") {
      const ru = getRussianDefinitions(item.word);
      if (ru && ru.length > 0) {
        defSnippet = `${ru.slice(0, 2).join("; ")} | ${item.entries.flatMap((e) => e.definitions).slice(0, 2).join("; ")}`;
      }
    }
    if (!defSnippet) {
      defSnippet = item.entries
        .flatMap((e) => e.definitions)
        .slice(0, 3)
        .join("; ");
    }

    if (defSnippet) {
      const defEl = el.createDiv({ cls: "ch-search-def" });
      if (query && defSnippet.toLowerCase().includes(query.toLowerCase())) {
        renderHighlighted(defEl, defSnippet, query);
      } else {
        defEl.setText(defSnippet);
      }
    }
  }

  onChooseSuggestion(item: SearchMatchItem, _evt: MouseEvent | KeyboardEvent): void {
    const match: MatchResult = {
      word: item.word,
      entries: item.entries,
      length: Array.from(item.word).length,
    };

    // Open popover centered on screen
    const clientX = globalThis.innerWidth / 2;
    const clientY = globalThis.innerHeight / 2 - 80;

    this.plugin.tooltip.show(match, clientX, clientY, this.plugin.settings);
    // Pin it so it stays visible after modal closes!
    if (!this.plugin.tooltip.getIsPinned()) {
      this.plugin.tooltip.togglePin();
    }
  }
}
