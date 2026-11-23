import { ItemView, Menu, Notice, WorkspaceLeaf } from "obsidian";
import type ChineseHoverDictPlugin from "./main.ts";
import { VocabularyItem, VocabularySort, getLocalDateString } from "./vocabulary.ts";
import { HistoryItem } from "./history.ts";
import { ChineseSearchModal } from "./search-modal.ts";
import { getHskBadgeInfo } from "./hsk.ts";
import { StrokeOrderModal } from "./stroke-order.ts";
import { addNoteToAnki, generateAnkiTsv } from "./anki.ts";
import { generatePlecoFlashcards } from "./pleco.ts";
import { WorksheetModal } from "./worksheet.ts";
import { inferPartsOfSpeech, formatPosBadge } from "./pos.ts";
import { getRussianDefinitions } from "./russian-dict.ts";
import { createWordNote } from "./word-notes.ts";
import { detectPinyinTone, detectJyutpingTone, getToneColor } from "./tones.ts";
import { t, getActiveLanguage } from "./i18n/index.ts";

export const VIEW_TYPE_CHINESE_VOCABULARY = "chinese-vocabulary-view";

export class ChineseVocabularyView extends ItemView {
  plugin: ChineseHoverDictPlugin;
  private searchQuery: string = "";
  private sortBy: VocabularySort = "date_desc";
  private practiceMode: boolean = false;
  private filterDueOnly: boolean = false;
  private revealedCardIds: Set<string> = new Set();
  private activeTab: "saved" | "history" = "saved";

  constructor(leaf: WorkspaceLeaf, plugin: ChineseHoverDictPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.practiceMode = plugin.settings.practiceMode ?? false;
    this.sortBy = plugin.settings.vocabularySort ?? "date_desc";
  }

  override getViewType(): string {
    return VIEW_TYPE_CHINESE_VOCABULARY;
  }

  override getDisplayText(): string {
    return "Словарик / Chinese Vocabulary";
  }

  override getIcon(): string {
    return "book-marked";
  }

  override onOpen(): Promise<void> {
    this.render();
    return Promise.resolve();
  }

  override async onClose(): Promise<void> {
    // cleanup
  }

  render(): void {
    const container = this.contentEl;
    if (!container) return;
    container.empty();
    container.addClass("ch-vocab-view-container");

    const allItems = this.plugin.vocabulary.getItems();

    // 1. Header Bar
    const headerEl = container.createDiv({ cls: "ch-vocab-header" });
    const titleRow = headerEl.createDiv({ cls: "ch-vocab-title-row" });

    const titleGroup = titleRow.createDiv({ cls: "ch-vocab-title-group" });
    titleGroup.createSpan({ cls: "ch-vocab-lantern", text: "🏮" });
    titleGroup.createSpan({ cls: "ch-vocab-title-text", text: t("vocab.title") });
    titleGroup.createSpan({
      cls: "ch-vocab-count-badge",
      text: `${allItems.length}`,
    });

    const headerActions = titleRow.createDiv({ cls: "ch-vocab-header-actions" });

    // 1. Quick Search Button (Spotlight)
    const searchModalBtn = headerActions.createEl("button", {
      cls: "ch-vocab-glass-icon-btn",
      attr: { "aria-label": t("vocab.spotlight") || "Search", title: t("vocab.spotlight") || "Spotlight" },
      text: "🔍",
    });
    searchModalBtn.addEventListener("click", () => {
      new ChineseSearchModal(this.plugin.app, this.plugin).open();
    });

    // 2. Consolidated More Actions & Export Menu Button
    const moreBtn = headerActions.createEl("button", {
      cls: "ch-vocab-glass-icon-btn",
      attr: { "aria-label": t("vocab.more_actions") || "Actions", title: t("vocab.more_actions") || "Actions" },
      text: "⋯",
    });
    moreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const menu = new Menu();

      menu.addItem((i) =>
        i.setTitle(`📥 ${t("vocab.export_anki")}`)
          .setIcon("download")
          .onClick(() => {
            const items = this.plugin.vocabulary.getItems();
            if (items.length === 0) {
              new Notice("Словарик пока пуст! Сначала добавьте слова звёздочкой ⭐.");
              return;
            }
            const tsv = generateAnkiTsv(items);
            const blob = new Blob([tsv], { type: "text/tab-separated-values;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = createEl("a", {
              href: url,
              attr: {
                download: `Anki_Chinese_Vocabulary_${new Date().toISOString().slice(0, 10)}.tsv`,
              },
            });
            link.click();
            URL.revokeObjectURL(url);
            new Notice(`Экспортировано ${items.length} карточек в TSV для Anki!`);
          })
      );

      if (this.plugin.settings.anki.enabled) {
        menu.addItem((i) =>
          i.setTitle("🗃️ Синхронизировать с AnkiConnect")
            .setIcon("sync")
            .onClick(() => {
              void (async () => {
                const items = this.plugin.vocabulary.getItems();
                if (items.length === 0) {
                  new Notice("Словарик пуст!");
                  return;
                }
                let addedCount = 0;
                for (const item of items) {
                  const ok = await addNoteToAnki(this.plugin.settings.anki, item);
                  if (ok) addedCount++;
                }
                new Notice(`Синхронизация завершена: ${addedCount} карточек добавлено в Anki.`);
              })();
            })
        );
      }

      menu.addItem((i) =>
        i.setTitle(`📱 ${t("vocab.export_pleco") || "Экспорт в Pleco (.txt)"}`)
          .setIcon("smartphone")
          .onClick(() => {
            const items = this.plugin.vocabulary.getItems();
            if (items.length === 0) {
              new Notice("Словарик пока пуст!");
              return;
            }
            const txt = generatePlecoFlashcards(items);
            const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = createEl("a", {
              href: url,
              attr: {
                download: `Pleco_Chinese_Vocabulary_${new Date().toISOString().slice(0, 10)}.txt`,
              },
            });
            link.click();
            URL.revokeObjectURL(url);
            new Notice(`Экспортировано ${items.length} слов для Pleco!`);
          })
      );

      menu.addItem((i) =>
        i.setTitle("📝 Прописи для печати (米字格)")
          .setIcon("pencil")
          .onClick(() => {
            const items = this.plugin.vocabulary.getItems();
            if (items.length === 0) {
              new Notice("Словарик пока пуст! Добавьте слова ⭐.");
              return;
            }
            new WorksheetModal(this.app, items).open();
          })
      );

      menu.addSeparator();

      menu.addItem((i) =>
        i.setTitle("📄 Открыть файл словарика (.md)")
          .setIcon("file-text")
          .onClick(() => {
            void this.plugin.vocabulary.openMarkdownFile();
          })
      );

      menu.addItem((i) =>
        i.setTitle("🔄 Синхронизировать с файлом")
          .setIcon("refresh-cw")
          .onClick(() => {
            void (async () => {
              const count = await this.plugin.vocabulary.importFromMarkdown();
              new Notice(`Синхронизировано: ${count} слов`, 2000);
              this.render();
            })();
          })
      );

      menu.addSeparator();

      menu.addItem((i) =>
        i.setTitle("📺 YouTube (EN): @ChineseWithKantulaev")
          .setIcon("play-circle")
          .onClick(() => {
            window.open("https://www.youtube.com/@ChineseWithKantulaev", "_blank");
          })
      );

      menu.addItem((i) =>
        i.setTitle("📺 YouTube (RU): @kantulaevCN")
          .setIcon("play-circle")
          .onClick(() => {
            window.open("https://www.youtube.com/@kantulaevCN", "_blank");
          })
      );

      menu.showAtMouseEvent(e);
    });

    // 2. Segmented Tab Bar: [⭐ Избранное (N)] [🕒 Недавние (M)]
    const historyItems = this.plugin.history?.getItems() || [];
    const tabBar = container.createDiv({ cls: "ch-vocab-tab-bar" });

    const savedTabBtn = tabBar.createEl("button", {
      cls: `ch-vocab-tab-btn ${this.activeTab === "saved" ? "ch-vocab-tab-active" : ""}`,
      text: `${t("vocab.tab_saved") || "⭐ Избранное"} (${allItems.length})`,
    });
    savedTabBtn.addEventListener("click", () => {
      this.activeTab = "saved";
      this.render();
    });

    const historyTabBtn = tabBar.createEl("button", {
      cls: `ch-vocab-tab-btn ${this.activeTab === "history" ? "ch-vocab-tab-active" : ""}`,
      text: `${t("vocab.tab_history") || "🕒 Недавние"} (${historyItems.length})`,
    });
    historyTabBtn.addEventListener("click", () => {
      this.activeTab = "history";
      this.render();
    });

    if (this.activeTab === "history") {
      this.renderHistory(container, historyItems);
      return;
    }

    // 3. Search Bar for Saved Items
    const searchWrap = container.createDiv({ cls: "ch-vocab-search-wrap" });
    searchWrap.createSpan({ cls: "ch-vocab-search-icon", text: "🔍" });

    const searchInput = searchWrap.createEl("input", {
      type: "text",
      cls: "ch-vocab-search-input",
      placeholder: t("vocab.search_placeholder"),
      value: this.searchQuery,
    });
    searchInput.addEventListener("input", (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase().trim();
      clearBtn.toggleClass("ch-vocab-clear-visible", Boolean(this.searchQuery));
      this.renderList(listContainer);
    });

    const clearBtn = searchWrap.createSpan({
      cls: `ch-vocab-search-clear ${this.searchQuery ? "ch-vocab-clear-visible" : ""}`,
      text: "✕",
    });
    clearBtn.addEventListener("click", () => {
      this.searchQuery = "";
      searchInput.value = "";
      clearBtn.removeClass("ch-vocab-clear-visible");
      this.renderList(listContainer);
    });

    // 3. Segmented Control Toolbar
    const toolbar = container.createDiv({ cls: "ch-vocab-toolbar" });

    // Segmented Mode: List vs Flashcards
    const segmentedGroup = toolbar.createDiv({ cls: "ch-vocab-segmented-group" });

    const listModeBtn = segmentedGroup.createEl("button", {
      cls: `ch-vocab-seg-btn ${!this.practiceMode ? "ch-vocab-seg-active" : ""}`,
      text: t("vocab.mode_list") || "📋 Список",
    });
    listModeBtn.addEventListener("click", () => {
      void (async () => {
        if (!this.practiceMode) return;
        this.practiceMode = false;
        this.plugin.settings.practiceMode = false;
        await this.plugin.saveSettings();
        listModeBtn.addClass("ch-vocab-seg-active");
        cardsModeBtn.removeClass("ch-vocab-seg-active");
        this.revealedCardIds.clear();
        this.renderList(listContainer);
      })();
    });

    const cardsModeBtn = segmentedGroup.createEl("button", {
      cls: `ch-vocab-seg-btn ${this.practiceMode ? "ch-vocab-seg-active" : ""}`,
      text: t("vocab.mode_cards") || "🎴 Карточки",
    });
    cardsModeBtn.addEventListener("click", () => {
      void (async () => {
        if (this.practiceMode) return;
        this.practiceMode = true;
        this.plugin.settings.practiceMode = true;
        await this.plugin.saveSettings();
        cardsModeBtn.addClass("ch-vocab-seg-active");
        listModeBtn.removeClass("ch-vocab-seg-active");
        this.revealedCardIds.clear();
        this.renderList(listContainer);
      })();
    });

    // Sort Cycle Button
    const sortLabels: Record<VocabularySort, string> = {
      date_desc: "⏳ Новые",
      date_asc: "⌛ Старые",
      alpha: "🔤 А-Я",
    };
    const sortBtn = toolbar.createEl("button", {
      cls: "ch-vocab-sort-btn",
      text: sortLabels[this.sortBy],
      attr: { title: "Сортировка (нажмите для переключения)" },
    });
    sortBtn.addEventListener("click", () => {
      void (async () => {
        if (this.sortBy === "date_desc") {
          this.sortBy = "date_asc";
        } else if (this.sortBy === "date_asc") {
          this.sortBy = "alpha";
        } else {
          this.sortBy = "date_desc";
        }
        this.plugin.settings.vocabularySort = this.sortBy;
        await this.plugin.saveSettings();
        sortBtn.setText(sortLabels[this.sortBy]);
        this.renderList(listContainer);
      })();
    });

    // Due Today SRS filter button
    const dueCount = this.plugin.vocabulary.getDueItemsCount();
    const dueBtn = toolbar.createEl("button", {
      cls: `ch-vocab-due-filter-btn ${this.filterDueOnly ? "ch-vocab-due-active" : ""}`,
      text: `🔁 К повторению (${dueCount})`,
      attr: { title: "Показать только слова, требующие повторения (интервальное повторение SRS)" },
    });
    dueBtn.addEventListener("click", () => {
      this.filterDueOnly = !this.filterDueOnly;
      dueBtn.toggleClass("ch-vocab-due-active", this.filterDueOnly);
      this.renderList(listContainer);
    });

    // 4. Cards List Container
    const listContainer = container.createDiv({ cls: "ch-vocab-cards-list" });
    this.renderList(listContainer);
  }

  private getFilteredItems(): VocabularyItem[] {
    let items = [...this.plugin.vocabulary.getItems()];

    if (this.searchQuery) {
      items = items.filter((item) => {
        return (
          item.word.toLowerCase().includes(this.searchQuery) ||
          (item.traditional && item.traditional.toLowerCase().includes(this.searchQuery)) ||
          item.pinyin.toLowerCase().includes(this.searchQuery) ||
          item.jyutping.toLowerCase().includes(this.searchQuery) ||
          item.definitions.some((d) => d.toLowerCase().includes(this.searchQuery)) ||
          (item.contextSentence && item.contextSentence.toLowerCase().includes(this.searchQuery))
        );
      });
    }

    if (this.filterDueOnly) {
      const todayStr = getLocalDateString();
      items = items.filter((item) => !item.nextReviewDate || item.nextReviewDate <= todayStr);
    }

    if (this.sortBy === "date_desc") {
      items.sort((a, b) => b.dateAdded - a.dateAdded);
    } else if (this.sortBy === "date_asc") {
      items.sort((a, b) => a.dateAdded - b.dateAdded);
    } else if (this.sortBy === "alpha") {
      items.sort((a, b) => a.pinyin.localeCompare(b.pinyin));
    }

    return items;
  }

  private renderList(container: HTMLElement): void {
    container.empty();
    const items = this.getFilteredItems();

    if (items.length === 0) {
      const emptyWrap = container.createDiv({ cls: "ch-vocab-empty" });
      emptyWrap.createDiv({ cls: "ch-vocab-empty-icon", text: "🏮" });
      emptyWrap.createDiv({
        cls: "ch-vocab-empty-title",
        text: this.searchQuery
          ? (t("vocab.empty_search") || "Ничего не найдено")
          : (this.filterDueOnly ? (t("vocab.empty_due") || "На сегодня всё повторено! 🎉") : t("vocab.empty_title")),
      });
      emptyWrap.createDiv({
        cls: "ch-vocab-empty-desc",
        text: this.searchQuery
          ? (t("vocab.empty_search_desc") || "Попробуйте изменить поисковый запрос")
          : (this.filterDueOnly ? (t("vocab.empty_due_desc") || "Слов для повторения на сегодня нет. Отличная работа!") : t("vocab.empty_desc")),
      });
      return;
    }

    for (const item of items) {
      this.renderCard(container, item);
    }
  }

  private renderCard(container: HTMLElement, item: VocabularyItem): void {
    const card = container.createDiv({ cls: "ch-vocab-card" });

    // 1. Top Row: Hanzi + Actions
    const topRow = card.createDiv({ cls: "ch-vocab-card-header" });

    // Hanzi presentation
    const hanziBox = topRow.createDiv({ cls: "ch-vocab-hanzi-box" });
    hanziBox.createSpan({ cls: "ch-vocab-hanzi-main", text: item.word });

    if (item.traditional && item.traditional !== item.word) {
      hanziBox.createSpan({
        cls: "ch-vocab-trad-badge",
        text: `繁 ${item.traditional}`,
        attr: { title: "Традиционные иероглифы (Traditional)" },
      });
    }

    // HSK Badge
    if (this.plugin.settings.showHskBadge) {
      const hsk = getHskBadgeInfo(item.word);
      if (hsk) {
        const hskBadge = hanziBox.createSpan({
          cls: "ch-vocab-hsk-badge",
          text: hsk.label,
          attr: { title: `Официальный уровень HSK: ${hsk.level}` },
        });
        hskBadge.setCssProps({
          "--hsk-color": hsk.color,
          "--hsk-bg": hsk.bg,
        });
      }
    }

    // POS Badge
    if (this.plugin.settings.showPartOfSpeech) {
      const posList = inferPartsOfSpeech(item.word, item.definitions);
      if (posList.length > 0) {
        hanziBox.createSpan({
          cls: "ch-vocab-pos-badge",
          text: formatPosBadge(posList, this.plugin.settings.translationLanguage === "ru" ? "ru" : "en"),
          attr: { title: `Часть речи: ${posList.join(", ")}` },
        });
      }
    }

    // Header Actions: Stroke Order + Note + Audio + Copy + Delete
    const actionsBox = topRow.createDiv({ cls: "ch-vocab-actions-box" });

    // Note Button (Zettelkasten)
    const noteBtn = actionsBox.createEl("button", {
      cls: "ch-vocab-action-icon-btn",
      text: "📝",
      attr: { title: "Создать атомную заметку слова (Zettelkasten Note)" },
    });
    noteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      void (async () => {
        const match = this.plugin.dictionary.getExact(item.word);
        if (match) {
          await createWordNote(this.plugin.app, match, item.contextSentence, {
            folderPath: this.plugin.settings.wordNotesFolder || "Chinese/Words",
            openAfterCreation: true,
          });
        } else {
          const dummyMatch = {
            word: item.word,
            entries: [{
              simplified: item.word,
              traditional: item.traditional || item.word,
              pinyin: item.pinyin,
              jyutping: item.jyutping,
              definitions: item.definitions,
            }],
            length: Array.from(item.word).length,
          };
          await createWordNote(this.plugin.app, dummyMatch, item.contextSentence, {
            folderPath: this.plugin.settings.wordNotesFolder || "Chinese/Words",
            openAfterCreation: true,
          });
        }
      })();
    });

    // Stroke Order Button
    if (this.plugin.settings.showStrokeOrder) {
      const strokeBtn = actionsBox.createEl("button", {
        cls: "ch-vocab-action-icon-btn",
        text: "🖌️",
        attr: { title: "Порядок черт (Анимация написания)" },
      });
      strokeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        new StrokeOrderModal(this.plugin.app, item.word).open();
      });
    }

    // Audio Button
    const isCantonese = this.plugin.settings.dialect === "cantonese";
    const audioBtn = actionsBox.createEl("button", {
      cls: `ch-vocab-audio-pill ${isCantonese ? "ch-vocab-audio-canto" : "ch-vocab-audio-mando"}`,
      attr: {
        title: isCantonese
          ? `Озвучить на кантонском (廣東話, ${this.plugin.settings.speechSpeed}x)`
          : `Озвучить на путунхуа (普通话, ${this.plugin.settings.speechSpeed}x)`,
      },
    });
    audioBtn.createSpan({ cls: "ch-vocab-audio-icon", text: "🔊" });
    audioBtn.createSpan({ cls: "ch-vocab-audio-label", text: isCantonese ? "廣東話" : "普通话" });
    audioBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.plugin.tooltip.playSpeech(item.word, this.plugin.settings);
    });

    // Copy Button
    const copyBtn = actionsBox.createEl("button", {
      cls: "ch-vocab-action-icon-btn",
      text: "📋",
      attr: { title: "Скопировать карточку" },
    });
    copyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const clipText = `${item.word}${item.traditional ? ` (${item.traditional})` : ""} [${item.pinyin}${item.jyutping ? ` / 粵 ${item.jyutping}` : ""}] - ${item.definitions.join("; ")}`;
      navigator.clipboard.writeText(clipText).then(() => {
        copyBtn.setText("✓");
        window.setTimeout(() => copyBtn.setText("📋"), 1500);
        new Notice(`Скопировано: ${item.word}`);
      }).catch(() => {
        new Notice(`Не удалось скопировать в буфер обмена`);
      });
    });

    // Delete Button
    const deleteBtn = actionsBox.createEl("button", {
      cls: "ch-vocab-action-icon-btn ch-vocab-delete-btn",
      text: "✕",
      attr: { title: "Удалить из словарика" },
    });
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      void (async () => {
        await this.plugin.vocabulary.removeWord(item.word);
        this.render();
      })();
    });

    // 2. Phonetics Row
    const phoneticsRow = card.createDiv({ cls: "ch-vocab-phonetics-row" });
    const renderColoredSyllables = (container: HTMLElement, text: string, type: "pinyin" | "jyutping") => {
      const span = container.createSpan({
        cls: type === "pinyin" ? "ch-vocab-pinyin-text" : "ch-vocab-jyutping-val",
      });
      if (this.plugin.settings.toneColoring === "off") {
        span.setText(text);
        return;
      }
      const syllables = text.split(/\s+/).filter(Boolean);
      syllables.forEach((syl, idx) => {
        if (idx > 0) span.createSpan({ text: " " });
        const tone = type === "pinyin" ? detectPinyinTone(syl) : detectJyutpingTone(syl);
        const s = span.createSpan({ text: syl, cls: `ch-tone-${tone}` });
        s.setCssStyles({ color: getToneColor(tone) });
      });
    };

    renderColoredSyllables(phoneticsRow, item.pinyin, "pinyin");

    const showJyut = this.plugin.settings.phoneticDisplay === "both" ||
      this.plugin.settings.phoneticDisplay === "jyutping" ||
      (this.plugin.settings.phoneticDisplay === "dialect_auto" && this.plugin.settings.dialect === "cantonese");

    if (item.jyutping && showJyut) {
      const jBadge = phoneticsRow.createSpan({ cls: "ch-vocab-jyutping-badge" });
      jBadge.createSpan({ cls: "ch-vocab-jyutping-tag", text: "粵" });
      renderColoredSyllables(jBadge, item.jyutping, "jyutping");
    }

    // 3. Definitions Section (Practice Mode Masking)
    const isRevealed = this.revealedCardIds.has(item.id);
    const isMasked = this.practiceMode && !isRevealed;

    const defsContainer = card.createDiv({
      cls: `ch-vocab-defs-box ${isMasked ? "ch-vocab-is-masked" : ""}`,
    });

    if (isMasked) {
      const maskOverlay = defsContainer.createDiv({ cls: "ch-vocab-mask-overlay" });
      maskOverlay.createSpan({ cls: "ch-vocab-mask-btn", text: "👁️ Нажмите для проверки" });
      maskOverlay.addEventListener("click", (e) => {
        e.stopPropagation();
        this.revealedCardIds.add(item.id);
        defsContainer.removeClass("ch-vocab-is-masked");
        maskOverlay.remove();
        this.renderCardSrsControls(card, item, container);
      });
    }

    const defsList = defsContainer.createDiv({ cls: "ch-vocab-defs-list" });
    let displayDefs = item.definitions;
    const transLang = (this.plugin.settings.translationLanguage && this.plugin.settings.translationLanguage !== "auto")
      ? this.plugin.settings.translationLanguage
      : getActiveLanguage();

    if (transLang !== "en" && transLang !== "both") {
      const localized = this.plugin.dictionary.getMultiLangDefs(item.word, transLang) ||
        (transLang === "ru" ? getRussianDefinitions(item.word) : null);
      if (localized && localized.length > 0) {
        displayDefs = localized;
      }
    } else if (transLang === "both") {
      const activeL = getActiveLanguage();
      const localized = this.plugin.dictionary.getMultiLangDefs(item.word, activeL) ||
        (activeL === "ru" ? getRussianDefinitions(item.word) : null);
      if (localized && localized.length > 0) {
        displayDefs = [...localized.slice(0, 2), ...item.definitions.slice(0, 2)];
      }
    }

    for (let i = 0; i < Math.min(displayDefs.length, 3); i++) {
      const defRow = defsList.createDiv({ cls: "ch-vocab-def-item" });
      defRow.createSpan({ cls: "ch-vocab-def-bullet", text: "•" });
      defRow.createSpan({ cls: "ch-vocab-def-text", text: displayDefs[i] });
    }

    // Context Quote (if exists)
    if (item.contextSentence) {
      const quoteBox = card.createDiv({ cls: "ch-vocab-quote-box" });
      quoteBox.createSpan({ cls: "ch-vocab-quote-icon", text: "💬" });
      quoteBox.createSpan({ cls: "ch-vocab-quote-content", text: `“${item.contextSentence}”` });
    }

    // SRS review controls if in practice mode and revealed
    if (this.practiceMode && isRevealed) {
      this.renderCardSrsControls(card, item, container);
    }

    // 5. Card Footer: Date & SRS review status
    const footer = card.createDiv({ cls: "ch-vocab-card-footer" });
    footer.createSpan({ cls: "ch-vocab-date-tag", text: `📅 ${item.dateString}` });

    if (item.nextReviewDate) {
      const todayStr = getLocalDateString();
      const isDue = item.nextReviewDate <= todayStr;
      footer.createSpan({
        cls: `ch-vocab-srs-due-tag ${isDue ? "ch-vocab-is-due" : ""}`,
        text: isDue ? "🔁 Повторить сегодня!" : `🔁 След: ${item.nextReviewDate}`,
      });
    }
  }

  private renderCardSrsControls(card: HTMLElement, item: VocabularyItem, listContainer: HTMLElement): void {
    if (card.querySelector(".ch-vocab-srs-bar")) return;

    const srsBar = card.createDiv({ cls: "ch-vocab-srs-bar" });
    srsBar.createSpan({ cls: "ch-vocab-srs-label", text: "Оценка памяти (SRS):" });
    const srsBtns = srsBar.createDiv({ cls: "ch-vocab-srs-btns" });

    const btnAgain = srsBtns.createEl("button", {
      cls: "ch-vocab-srs-btn srs-again",
      text: "🔴 Снова (1д)",
    });
    btnAgain.addEventListener("click", (e) => {
      e.stopPropagation();
      void (async () => {
        await this.plugin.vocabulary.updateSrsRating(item.word, "again");
        new Notice(`Запланировано на завтра (1 день): ${item.word}`);
        this.renderList(listContainer);
      })();
    });

    const btnHard = srsBtns.createEl("button", {
      cls: "ch-vocab-srs-btn srs-hard",
      text: "🟡 Трудно",
    });
    btnHard.addEventListener("click", (e) => {
      e.stopPropagation();
      void (async () => {
        await this.plugin.vocabulary.updateSrsRating(item.word, "hard");
        new Notice(`Интервал обновлен (Трудно): ${item.word}`);
        this.renderList(listContainer);
      })();
    });

    const btnGood = srsBtns.createEl("button", {
      cls: "ch-vocab-srs-btn srs-good",
      text: "🟢 Хорошо",
    });
    btnGood.addEventListener("click", (e) => {
      e.stopPropagation();
      void (async () => {
        await this.plugin.vocabulary.updateSrsRating(item.word, "good");
        const updated = this.plugin.vocabulary.getItem(item.word);
        new Notice(`Отлично! Следующее повторение: ${updated?.nextReviewDate || ""}`);
        this.renderList(listContainer);
      })();
    });

    const btnEasy = srsBtns.createEl("button", {
      cls: "ch-vocab-srs-btn srs-easy",
      text: "🔵 Легко",
    });
    btnEasy.addEventListener("click", (e) => {
      e.stopPropagation();
      void (async () => {
        await this.plugin.vocabulary.updateSrsRating(item.word, "easy");
        const updated = this.plugin.vocabulary.getItem(item.word);
        new Notice(`Запомнено! Следующее повторение: ${updated?.nextReviewDate || ""}`);
        this.renderList(listContainer);
      })();
    });
  }

  private renderHistory(container: HTMLElement, items: HistoryItem[]): void {
    const historyWrap = container.createDiv({ cls: "ch-vocab-history-wrap" });

    const topBar = historyWrap.createDiv({ cls: "ch-vocab-history-top" });
    topBar.createSpan({
      cls: "ch-vocab-history-subtitle",
      text: `История недавних просмотров (${items.length})`,
    });

    if (items.length > 0) {
      const clearBtn = topBar.createEl("button", {
        cls: "ch-vocab-history-clear-btn",
        text: "Очистить всё 🗑️",
      });
      clearBtn.addEventListener("click", () => {
        void (async () => {
          if (this.plugin.history) {
            await this.plugin.history.clear();
            this.render();
          }
        })();
      });
    }

    if (items.length === 0) {
      const emptyEl = historyWrap.createDiv({ cls: "ch-vocab-empty" });
      emptyEl.createDiv({ cls: "ch-vocab-empty-icon", text: "🕒" });
      emptyEl.createDiv({
        cls: "ch-vocab-empty-title",
        text: "История просмотров пуста",
      });
      emptyEl.createDiv({
        cls: "ch-vocab-empty-desc",
        text: "Наводите курсор на китайские слова или дважды кликайте по ним в заметках — они будут автоматически сохраняться здесь для повторения в конце чтения!",
      });
      return;
    }

    const listEl = historyWrap.createDiv({ cls: "ch-vocab-history-list" });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;

    const todayItems: HistoryItem[] = [];
    const yesterdayItems: HistoryItem[] = [];
    const earlierItems: HistoryItem[] = [];

    for (const item of items) {
      if (item.timestamp >= todayStart) {
        todayItems.push(item);
      } else if (item.timestamp >= yesterdayStart) {
        yesterdayItems.push(item);
      } else {
        earlierItems.push(item);
      }
    }

    const groups: { title: string; list: HistoryItem[] }[] = [];
    if (todayItems.length > 0) groups.push({ title: "Сегодня", list: todayItems });
    if (yesterdayItems.length > 0) groups.push({ title: "Вчера", list: yesterdayItems });
    if (earlierItems.length > 0) groups.push({ title: "Ранее", list: earlierItems });

    for (const group of groups) {
      const groupEl = listEl.createDiv({ cls: "ch-vocab-history-group" });
      const groupHeader = groupEl.createDiv({ cls: "ch-vocab-history-group-header" });
      groupHeader.createSpan({ text: `${group.title} (${group.list.length})` });

      for (const item of group.list) {
        this.renderHistoryCard(groupEl, item);
      }
    }
  }

  private renderHistoryCard(container: HTMLElement, item: HistoryItem): void {
    const card = container.createDiv({ cls: "ch-vocab-history-card" });

    // Click card to open dictionary popover
    card.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;
      const match = this.plugin.dictionary.getExact(item.word) || {
        word: item.word,
        entries: [
          {
            traditional: item.traditional || item.word,
            pinyin: item.pinyin,
            jyutping: item.jyutping,
            definitions: item.definitions,
          },
        ],
        length: Array.from(item.word).length,
      };
      const x = (this.containerEl.win || window).innerWidth / 2;
      const y = (this.containerEl.win || window).innerHeight / 2 - 80;
      this.plugin.tooltip.show(match, x, y, this.plugin.settings);
    });

    const mainRow = card.createDiv({ cls: "ch-vocab-history-main" });

    // Left: Hanzi & Phonetics
    const wordGroup = mainRow.createDiv({ cls: "ch-vocab-history-word-group" });
    wordGroup.createSpan({ cls: "ch-vocab-history-hanzi", text: item.word });

    // Phonetics
    const phonSpan = wordGroup.createSpan({ cls: "ch-vocab-history-phonetics" });
    if (this.plugin.settings.toneColoring === "off") {
      phonSpan.setText(item.pinyin);
    } else {
      const syllables = item.pinyin.split(/\s+/).filter(Boolean);
      syllables.forEach((syl, idx) => {
        if (idx > 0) phonSpan.createSpan({ text: " " });
        const tone = detectPinyinTone(syl);
        const s = phonSpan.createSpan({ text: syl, cls: `ch-tone-${tone}` });
        s.setCssStyles({ color: getToneColor(tone) });
      });
    }

    const showHistJyut = this.plugin.settings.phoneticDisplay === "both" ||
      this.plugin.settings.phoneticDisplay === "jyutping" ||
      (this.plugin.settings.phoneticDisplay === "dialect_auto" && this.plugin.settings.dialect === "cantonese");

    if (item.jyutping && showHistJyut) {
      wordGroup.createSpan({ cls: "ch-vocab-history-jyutping", text: `(粤 ${item.jyutping})` });
    }

    // Time relative string
    const timeDiff = Date.now() - item.timestamp;
    let timeStr = "только что";
    if (timeDiff >= 86400000) {
      timeStr = `${Math.floor(timeDiff / 86400000)} д назад`;
    } else if (timeDiff >= 3600000) {
      timeStr = `${Math.floor(timeDiff / 3600000)} ч назад`;
    } else if (timeDiff >= 60000) {
      timeStr = `${Math.floor(timeDiff / 60000)} мин назад`;
    }
    mainRow.createSpan({ cls: "ch-vocab-history-time", text: timeStr });

    // Translation
    const defStr = item.definitions.slice(0, 3).join("; ");
    if (defStr) {
      card.createDiv({ cls: "ch-vocab-history-def", text: defStr });
    }

    // Action row
    const actions = card.createDiv({ cls: "ch-vocab-history-actions" });

    // 🔊 Voice
    const voiceBtn = actions.createEl("button", {
      cls: "ch-vocab-card-btn",
      text: "🔊",
      attr: { title: "Прослушать озвучку" },
    });
    voiceBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.plugin.tooltip.playSpeech(item.word, this.plugin.settings);
    });

    // ⭐ Star / Add to saved vocabulary
    const isStarred = this.plugin.vocabulary.hasWord(item.word);
    const starBtn = actions.createEl("button", {
      cls: `ch-vocab-card-btn ${isStarred ? "ch-vocab-btn-starred" : ""}`,
      text: isStarred ? "⭐ В словарике" : "☆ В словарик",
      attr: { title: isStarred ? "Удалить из словарика" : "Сохранить в личный словарик" },
    });
    starBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      void (async () => {
        const match = this.plugin.dictionary.getExact(item.word) || {
          word: item.word,
          entries: [
            {
              traditional: item.traditional || item.word,
              pinyin: item.pinyin,
              jyutping: item.jyutping,
              definitions: item.definitions,
            },
          ],
          length: Array.from(item.word).length,
        };
        const nowStarred = await this.plugin.vocabulary.toggleWord(match);
        starBtn.setText(nowStarred ? "⭐ В словарике" : "☆ В словарик");
        starBtn.toggleClass("ch-vocab-btn-starred", nowStarred);
        this.render();
      })();
    });

    // 📝 Note
    const noteBtn = actions.createEl("button", {
      cls: "ch-vocab-card-btn",
      text: "📝 Заметка",
      attr: { title: "Создать заметку слова (Zettelkasten)" },
    });
    noteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      void (async () => {
        const match = this.plugin.dictionary.getExact(item.word) || {
          word: item.word,
          entries: [
            {
              traditional: item.traditional || item.word,
              pinyin: item.pinyin,
              jyutping: item.jyutping,
              definitions: item.definitions,
            },
          ],
          length: Array.from(item.word).length,
        };
        await createWordNote(this.plugin.app, match, undefined, {
          folderPath: this.plugin.settings.wordNotesFolder || "Chinese/Words",
          openAfterCreation: true,
        });
      })();
    });

    // ✕ Remove from history
    const delBtn = actions.createEl("button", {
      cls: "ch-vocab-card-btn ch-vocab-card-del-btn",
      text: "✕",
      attr: { title: "Удалить из истории" },
    });
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      void (async () => {
        if (this.plugin.history) {
          await this.plugin.history.remove(item.word);
          this.render();
        }
      })();
    });
  }
}
