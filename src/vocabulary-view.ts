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
    const container = this.containerEl.children[1] as HTMLElement;
    if (!container) return;
    container.empty();
    container.addClass("ch-vocab-view-container");

    const allItems = this.plugin.vocabulary.getItems();

    // 1. Header Row
    const headerEl = container.createDiv({ cls: "ch-vocab-header" });
    const titleRow = headerEl.createDiv({ cls: "ch-vocab-title-row" });

    const titleEl = titleRow.createEl("h4", { cls: "ch-vocab-title", text: "🏮 Мой словарик" });
    titleEl.createSpan({
      cls: "ch-vocab-count-badge",
      text: `${allItems.length}`,
    });

    const headerActions = titleRow.createDiv({ cls: "ch-vocab-header-actions" });

    // Open Markdown File button
    const openFileBtn = headerActions.createEl("button", {
      cls: "ch-vocab-icon-btn",
      attr: { "aria-label": "Открыть файл в Obsidian (Open Markdown Note)", title: "Открыть файл заметки" },
      text: "📄",
    });
    openFileBtn.addEventListener("click", () => {
      this.plugin.vocabulary.openMarkdownFile();
    });

    // Re-sync from file button
    const syncBtn = headerActions.createEl("button", {
      cls: "ch-vocab-icon-btn",
      attr: { "aria-label": "Синхронизировать с файлом (Sync)", title: "Синхронизировать" },
      text: "🔄",
    });
    syncBtn.addEventListener("click", async () => {
      const count = await this.plugin.vocabulary.importFromMarkdown();
      new Notice(`Синхронизировано: ${count} слов`, 2000);
      this.render();
    });

    // 2. Control Bar (Search + Practice Mode Toggle + Sort)
    const controlBar = container.createDiv({ cls: "ch-vocab-control-bar" });

    // Search input
    const searchContainer = controlBar.createDiv({ cls: "ch-vocab-search-wrap" });
    const searchInput = searchContainer.createEl("input", {
      type: "search",
      cls: "ch-vocab-search-input",
      placeholder: "Поиск (иероглифы, пиньинь, перевод)...",
      value: this.searchQuery,
    });
    searchInput.addEventListener("input", (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase().trim();
      this.renderList(listContainer);
    });

    // Options Row
    const optionsRow = controlBar.createDiv({ cls: "ch-vocab-options-row" });

    // Practice / Flashcards Toggle
    const practiceBtn = optionsRow.createEl("button", {
      cls: `ch-vocab-toggle-btn ${this.practiceMode ? "ch-vocab-toggle-active" : ""}`,
      text: this.practiceMode ? "🃏 Карточки (Скрыто)" : "🃏 Тренировка",
      attr: { title: "Режим карточек: скрывает перевод для тренировки памяти" },
    });
    practiceBtn.addEventListener("click", async () => {
      this.practiceMode = !this.practiceMode;
      this.plugin.settings.practiceMode = this.practiceMode;
      await this.plugin.saveSettings();
      practiceBtn.setText(this.practiceMode ? "🃏 Карточки (Скрыто)" : "🃏 Тренировка");
      practiceBtn.toggleClass("ch-vocab-toggle-active", this.practiceMode);
      this.revealedCardIds.clear();
      this.renderList(listContainer);
    });

    // Sort Dropdown
    const sortSelect = optionsRow.createEl("select", { cls: "ch-vocab-sort-select" });
    const sortOptions: { value: VocabularySort; label: string }[] = [
      { value: "date_desc", label: "⏳ Сначала новые" },
      { value: "date_asc", label: "⌛ Сначала старые" },
      { value: "alpha", label: "🔤 По алфавиту" },
    ];
    for (const opt of sortOptions) {
      const optionEl = sortSelect.createEl("option", { value: opt.value, text: opt.label });
      if (opt.value === this.sortBy) optionEl.selected = true;
    }
    sortSelect.addEventListener("change", async (e) => {
      this.sortBy = (e.target as HTMLSelectElement).value as VocabularySort;
      this.plugin.settings.vocabularySort = this.sortBy;
      await this.plugin.saveSettings();
      this.renderList(listContainer);
    });

    // 3. Cards List Container
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
          : "Нажимайте звёздочку ⭐ в окне подсказки или выделите слово, чтобы добавить его в коллекцию.",
      });
      return;
    }

    for (const item of items) {
      this.renderCard(container, item);
    }
  }

  private renderCard(container: HTMLElement, item: VocabularyItem): void {
    const card = container.createDiv({ cls: "ch-vocab-card" });

    // 1. Card Top Bar
    const topBar = card.createDiv({ cls: "ch-vocab-card-top" });

    // Hanzi group
    const hanziGroup = topBar.createDiv({ cls: "ch-vocab-hanzi-group" });
    hanziGroup.createSpan({ cls: "ch-vocab-word-simp", text: item.word });

    if (item.traditional && item.traditional !== item.word) {
      hanziGroup.createSpan({ cls: "ch-vocab-word-sep", text: " | " });
      hanziGroup.createSpan({ cls: "ch-vocab-word-trad", text: item.traditional });
    }

    // Action buttons: Audio + Remove
    const actions = topBar.createDiv({ cls: "ch-vocab-card-actions" });

    // Audio Button
    const audioBtn = actions.createEl("button", {
      cls: "ch-vocab-action-btn",
      text: "🔊",
      attr: {
        title: this.plugin.settings.dialect === "cantonese" ? "Озвучить (廣東話)" : "Озвучить (普通话)",
      },
    });
    audioBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.plugin.tooltip.playSpeech(item.word, this.plugin.settings);
    });

    // Delete Button
    const deleteBtn = actions.createEl("button", {
      cls: "ch-vocab-action-btn ch-vocab-delete-btn",
      text: "✕",
      attr: { title: "Удалить из словарика" },
    });
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await this.plugin.vocabulary.removeWord(item.word);
      this.render();
    });

    // 2. Phonetics Row (Pinyin + Jyutping)
    const phoneticsRow = card.createDiv({ cls: "ch-vocab-phonetics" });
    phoneticsRow.createSpan({ cls: "ch-vocab-pinyin", text: item.pinyin });

    if (item.jyutping) {
      const jpBadge = phoneticsRow.createSpan({ cls: "ch-vocab-jyutping" });
      jpBadge.createSpan({ cls: "ch-vocab-jp-tag", text: "粵 " });
      jpBadge.createSpan({ text: item.jyutping });
    }

    // 3. Definitions Row (with practice mode masking)
    const isRevealed = this.revealedCardIds.has(item.id);
    const shouldMask = this.practiceMode && !isRevealed;

    const defsWrap = card.createDiv({
      cls: `ch-vocab-defs-wrap ${shouldMask ? "ch-vocab-masked" : ""}`,
    });

    if (shouldMask) {
      const maskPrompt = defsWrap.createDiv({
        cls: "ch-vocab-mask-hint",
        text: "👁️ Нажмите, чтобы увидеть перевод",
      });
      maskPrompt.addEventListener("click", () => {
        this.revealedCardIds.add(item.id);
        defsWrap.removeClass("ch-vocab-masked");
        maskPrompt.remove();
      });
    }

    const defsText = item.definitions.slice(0, 3).join(" • ");
    defsWrap.createDiv({ cls: "ch-vocab-defs", text: defsText });

    // 4. Context Sentence (if available)
    if (item.contextSentence) {
      const ctxRow = card.createDiv({ cls: "ch-vocab-context" });
      ctxRow.createSpan({ cls: "ch-vocab-ctx-quote", text: "“" });
      ctxRow.createSpan({ cls: "ch-vocab-ctx-text", text: item.contextSentence });
      ctxRow.createSpan({ cls: "ch-vocab-ctx-quote", text: "”" });
    }

    // 5. Card Footer: Date
    const footer = card.createDiv({ cls: "ch-vocab-footer" });
    footer.createSpan({ cls: "ch-vocab-date", text: item.dateString });
  }
}
