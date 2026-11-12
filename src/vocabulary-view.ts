import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import type ChineseHoverDictPlugin from "./main.ts";
import { VocabularyItem, VocabularySort } from "./vocabulary.ts";

export const VIEW_TYPE_CHINESE_VOCABULARY = "chinese-vocabulary-view";

export class ChineseVocabularyView extends ItemView {
  plugin: ChineseHoverDictPlugin;
  private searchQuery: string = "";
  private sortBy: VocabularySort = "date_desc";
  private practiceMode: boolean = false;
  private revealedCardIds: Set<string> = new Set();

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

  override async onOpen(): Promise<void> {
    this.render();
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
    titleGroup.createEl("span", { cls: "ch-vocab-title-text", text: "Мой словарик" });
    titleGroup.createSpan({
      cls: "ch-vocab-count-badge",
      text: `${allItems.length}`,
    });

    const headerActions = titleRow.createDiv({ cls: "ch-vocab-header-actions" });

    // Open Markdown File button
    const openFileBtn = headerActions.createEl("button", {
      cls: "ch-vocab-glass-icon-btn",
      attr: { "aria-label": "Открыть заметку в Obsidian (Open Note)", title: "Открыть заметку" },
      text: "📄",
    });
    openFileBtn.addEventListener("click", () => {
      this.plugin.vocabulary.openMarkdownFile();
    });

    // Re-sync from file button
    const syncBtn = headerActions.createEl("button", {
      cls: "ch-vocab-glass-icon-btn",
      attr: { "aria-label": "Синхронизировать с файлом (Sync)", title: "Синхронизировать" },
      text: "🔄",
    });
    syncBtn.addEventListener("click", async () => {
      const count = await this.plugin.vocabulary.importFromMarkdown();
      new Notice(`Синхронизировано: ${count} слов`, 2000);
      this.render();
    });

    // 2. Search Bar
    const searchWrap = container.createDiv({ cls: "ch-vocab-search-wrap" });
    searchWrap.createSpan({ cls: "ch-vocab-search-icon", text: "🔍" });

    const searchInput = searchWrap.createEl("input", {
      type: "text",
      cls: "ch-vocab-search-input",
      placeholder: "Поиск (иероглифы, пиньинь, перевод)...",
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
      text: "📋 Список",
    });
    listModeBtn.addEventListener("click", async () => {
      if (!this.practiceMode) return;
      this.practiceMode = false;
      this.plugin.settings.practiceMode = false;
      await this.plugin.saveSettings();
      listModeBtn.addClass("ch-vocab-seg-active");
      cardsModeBtn.removeClass("ch-vocab-seg-active");
      this.revealedCardIds.clear();
      this.renderList(listContainer);
    });

    const cardsModeBtn = segmentedGroup.createEl("button", {
      cls: `ch-vocab-seg-btn ${this.practiceMode ? "ch-vocab-seg-active" : ""}`,
      text: "🃏 Карточки",
    });
    cardsModeBtn.addEventListener("click", async () => {
      if (this.practiceMode) return;
      this.practiceMode = true;
      this.plugin.settings.practiceMode = true;
      await this.plugin.saveSettings();
      cardsModeBtn.addClass("ch-vocab-seg-active");
      listModeBtn.removeClass("ch-vocab-seg-active");
      this.revealedCardIds.clear();
      this.renderList(listContainer);
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
    sortBtn.addEventListener("click", async () => {
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
      emptyWrap.createEl("div", {
        cls: "ch-vocab-empty-title",
        text: this.searchQuery ? "Ничего не найдено" : "Словарик пока пуст",
      });
      emptyWrap.createEl("div", {
        cls: "ch-vocab-empty-desc",
        text: this.searchQuery
          ? "Попробуйте изменить поисковый запрос"
          : "Нажимайте звёздочку ⭐ во всплывающем окне подсказки, чтобы сохранять слова в этот список.",
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

    // Header Actions: Audio + Copy + Delete
    const actionsBox = topRow.createDiv({ cls: "ch-vocab-actions-box" });

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
      navigator.clipboard.writeText(clipText);
      copyBtn.setText("✓");
      setTimeout(() => copyBtn.setText("📋"), 1500);
      new Notice(`Скопировано: ${item.word}`);
    });

    // Delete Button
    const deleteBtn = actionsBox.createEl("button", {
      cls: "ch-vocab-action-icon-btn ch-vocab-delete-btn",
      text: "✕",
      attr: { title: "Удалить из словарика" },
    });
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await this.plugin.vocabulary.removeWord(item.word);
      this.render();
    });

    // 2. Phonetics Row
    const phoneticsRow = card.createDiv({ cls: "ch-vocab-phonetics-row" });
    phoneticsRow.createSpan({ cls: "ch-vocab-pinyin-text", text: item.pinyin });

    if (item.jyutping) {
      const jBadge = phoneticsRow.createSpan({ cls: "ch-vocab-jyutping-badge" });
      jBadge.createSpan({ cls: "ch-vocab-jyutping-tag", text: "粵" });
      jBadge.createSpan({ cls: "ch-vocab-jyutping-val", text: item.jyutping });
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
      });
    }

    const defsList = defsContainer.createDiv({ cls: "ch-vocab-defs-list" });
    for (let i = 0; i < Math.min(item.definitions.length, 3); i++) {
      const defRow = defsList.createDiv({ cls: "ch-vocab-def-item" });
      defRow.createSpan({ cls: "ch-vocab-def-bullet", text: "•" });
      defRow.createSpan({ cls: "ch-vocab-def-text", text: item.definitions[i] });
    }

    // 4. Context Quote (if exists)
    if (item.contextSentence) {
      const quoteBox = card.createDiv({ cls: "ch-vocab-quote-box" });
      quoteBox.createSpan({ cls: "ch-vocab-quote-icon", text: "💬" });
      quoteBox.createSpan({ cls: "ch-vocab-quote-content", text: `“${item.contextSentence}”` });
    }

    // 5. Card Footer: Date
    const footer = card.createDiv({ cls: "ch-vocab-card-footer" });
    footer.createSpan({ cls: "ch-vocab-date-tag", text: `📅 ${item.dateString}` });
  }
}
