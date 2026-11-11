import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import { DictionaryManager } from "./dictionary.ts";
import {
  ChineseDictSettings,
  ChineseDictSettingTab,
  DEFAULT_SETTINGS,
  ModifierKey,
  PhoneticDisplay,
} from "./settings.ts";
import { ContentBounds, DictTooltip } from "./tooltip.ts";

interface CodeMirrorEditor extends Editor {
  cm?: EditorView;
  cursorCoords?(
    primary?: boolean,
    mode?: string
  ): { left: number; right: number; top: number; bottom: number } | null;
}

export default class ChineseHoverDictPlugin extends Plugin {
  settings: ChineseDictSettings = DEFAULT_SETTINGS;
  dictionary!: DictionaryManager;
  tooltip!: DictTooltip;

  private hoverTimeout: number | null = null;
  private lastHoverCoords: { x: number; y: number } | null = null;

  override async onload(): Promise<void> {
    await this.loadSettings();

    this.dictionary = new DictionaryManager(this);
    // Non-blocking background load: Obsidian launches instantly without freeze
    this.dictionary.load().catch((err) => {
      console.error("[Chinese Dict] Background load error:", err);
    });

    this.tooltip = new DictTooltip();

    // Register CodeMirror 6 extension for Live Preview and Source Mode
    this.registerEditorExtension(this.buildCodeMirrorExtension());

    // Register Double-Click listener for Reading View (rendered Markdown)
    this.registerDomEvent(
      document,
      "dblclick",
      this.handleReadingViewDblClick.bind(this)
    );

    // Register MouseMove listener for Reading View (for hover trigger modes)
    this.registerDomEvent(
      document,
      "mousemove",
      this.handleReadingViewMouseMove.bind(this)
    );

    // Dismiss popover on click outside ONLY when popover is actually open
    this.registerDomEvent(document, "mousedown", (event: MouseEvent) => {
      if (!this.tooltip.getIsOpen()) return;
      const target = event.target as HTMLElement | null;
      if (target && !target.closest(".ch-dict-tooltip")) {
        this.tooltip.hide();
      }
    });

    // Dismiss popover on Escape key
    this.registerDomEvent(document, "keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape" && this.tooltip.getIsOpen()) {
        this.tooltip.hide();
      }
    });

    // Dismiss popover on scroll
    this.registerDomEvent(
      document,
      "scroll",
      () => {
        if (this.tooltip.getIsOpen()) {
          this.tooltip.hide();
        }
      },
      true
    );

    // ==========================================
    // COMMAND PALETTE & HOTKEY REGISTRATIONS
    // ==========================================

    // 1. Look up word under cursor / selection
    this.addCommand({
      id: "lookup-word-at-cursor",
      name: "Найти слово под курсором или выделением / Look up word under cursor",
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) return false;
        if (checking) return true;

        if (activeView.getMode() === "source" && activeView.editor) {
          this.lookupAtEditorCursor(activeView.editor);
        } else {
          this.lookupAtReadingView();
        }
        return true;
      },
    });

    // 2. Pronounce current / active word
    this.addCommand({
      id: "pronounce-active-word",
      name: "Озвучить текущее слово / Pronounce active word",
      callback: () => {
        this.pronounceActiveWord();
      },
    });

    // 3. Copy current word and definition
    this.addCommand({
      id: "copy-active-word",
      name: "Скопировать карточку слова / Copy active word card",
      callback: () => {
        this.copyActiveWord();
      },
    });

    // 4. Switch dialect (Cantonese <-> Mandarin)
    this.addCommand({
      id: "switch-dialect",
      name: "Переключить диалект (Кантонский <-> Путунхуа) / Switch Dialect",
      callback: async () => {
        await this.switchDialect();
      },
    });

    // 5. Cycle phonetic display mode (Both -> Pinyin -> Jyutping -> Auto)
    this.addCommand({
      id: "cycle-phonetic-display",
      name: "Переключить режим фонетики (Оба / Пиньинь / Ютпинг) / Cycle Phonetic Display",
      callback: async () => {
        await this.cyclePhoneticDisplay();
      },
    });

    // 6. Toggle Chinese Dictionary on/off
    this.addCommand({
      id: "toggle-chinese-hover-dict",
      name: "Включить/выключить словарь / Toggle Chinese Dictionary",
      callback: async () => {
        this.settings.enabled = !this.settings.enabled;
        await this.saveSettings();
        if (!this.settings.enabled) {
          this.tooltip.hide();
        }
        new Notice(
          `Китайский словарь: ${
            this.settings.enabled ? "Включен (Enabled)" : "Отключен (Disabled)"
          }`
        );
      },
    });

    // 7. Close Popover
    this.addCommand({
      id: "close-popover",
      name: "Закрыть всплывающее окно словаря / Close Popover",
      checkCallback: (checking: boolean) => {
        if (!this.tooltip.getIsOpen()) return false;
        if (checking) return true;
        this.tooltip.hide();
        return true;
      },
    });

    // Add Settings Tab
    this.addSettingTab(new ChineseDictSettingTab(this.app, this));
  }

  override onunload(): void {
    this.cancelHoverLookup();
    if (this.tooltip) {
      this.tooltip.destroy();
    }
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  /**
   * Checks whether the user is holding down the configured modifier key
   */
  private checkModifier(
    event: MouseEvent | KeyboardEvent,
    modifier: ModifierKey
  ): boolean {
    switch (modifier) {
      case "Alt":
        return event.altKey;
      case "Shift":
        return event.shiftKey;
      case "Control":
        return event.ctrlKey;
      case "Meta":
        return event.metaKey;
      default:
        return false;
    }
  }

  /**
   * Accurately determines the inner text content bounds (excluding left/right blank margins).
   */
  public getContentBounds(
    targetEl?: HTMLElement | null,
    editorView?: EditorView
  ): ContentBounds {
    // 1. Check if clicked element or its ancestors has a sizer
    if (targetEl) {
      const sizer = targetEl.closest(
        ".cm-sizer, .markdown-preview-sizer"
      ) as HTMLElement | null;
      if (sizer) {
        return this.getSizerInnerBounds(sizer);
      }

      // Check if inside a line or paragraph
      const line = targetEl.closest(
        ".cm-line, p, h1, h2, h3, h4, h5, h6, li, pre, blockquote"
      ) as HTMLElement | null;
      if (line) {
        const rect = line.getBoundingClientRect();
        if (rect.width > 100) {
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          };
        }
      }
    }

    // 2. Check editorView's sizer or line
    if (editorView) {
      const sizer = editorView.dom.querySelector(
        ".cm-sizer"
      ) as HTMLElement | null;
      if (sizer) {
        return this.getSizerInnerBounds(sizer);
      }
      const line = editorView.dom.querySelector(".cm-line") as HTMLElement | null;
      if (line) {
        const rect = line.getBoundingClientRect();
        if (rect.width > 100) {
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          };
        }
      }
    }

    // 3. Check active leaf in Obsidian workspace
    const leaf =
      document.querySelector(".workspace-leaf.mod-active") || document;
    const sizer = leaf.querySelector(
      ".cm-sizer, .markdown-preview-sizer"
    ) as HTMLElement | null;
    if (sizer) {
      return this.getSizerInnerBounds(sizer);
    }

    const anyLine = leaf.querySelector(
      ".cm-line, .markdown-preview-section p, .markdown-rendered p"
    ) as HTMLElement | null;
    if (anyLine) {
      const rect = anyLine.getBoundingClientRect();
      if (rect.width > 100) {
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      }
    }

    // 4. Default fallback: window margins
    return {
      left: 10,
      right: window.innerWidth - 10,
      top: 10,
      bottom: window.innerHeight - 10,
    };
  }

  private getSizerInnerBounds(sizer: HTMLElement): ContentBounds {
    const rect = sizer.getBoundingClientRect();
    const style = window.getComputedStyle(sizer);
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    return {
      left: rect.left + padLeft,
      right: rect.right - padRight,
      top: rect.top,
      bottom: rect.bottom,
    };
  }

  /**
   * CodeMirror 6 extension for Live Preview and Source mode
   */
  private buildCodeMirrorExtension(): Extension {
    return EditorView.domEventHandlers({
      dblclick: (event: MouseEvent, view: EditorView) => {
        if (!this.settings.enabled) return;
        if (this.settings.triggerMode === "command_only") return;
        if (this.settings.triggerMode === "hover") return;

        const target = event.target as HTMLElement | null;
        const bounds = this.getContentBounds(target, view);
        this.handleEditorLookup(event.clientX, event.clientY, view, bounds);
      },
      mousemove: (event: MouseEvent, view: EditorView) => {
        if (!this.settings.enabled) return;
        const mode = this.settings.triggerMode;
        if (mode !== "hover" && mode !== "hover_modifier") return;

        if (mode === "hover_modifier") {
          if (!this.checkModifier(event, this.settings.hoverModifierKey)) {
            this.cancelHoverLookup();
            return;
          }
        }

        const target = event.target as HTMLElement | null;
        this.scheduleHoverLookup(event.clientX, event.clientY, view, undefined, target || undefined);
      },
      mouseleave: () => {
        this.cancelHoverLookup();
      },
    });
  }

  /**
   * Handles lookup at exact pixel coordinates in CodeMirror
   */
  private handleEditorLookup(
    clientX: number,
    clientY: number,
    view: EditorView,
    bounds?: ContentBounds
  ): void {
    if (!this.dictionary.isReady()) {
      new Notice("Dictionary is still loading, please wait a moment...", 2000);
      return;
    }

    const pos = view.posAtCoords({ x: clientX, y: clientY });
    if (pos === null) return;

    const doc = view.state.doc;
    const fullDoc = doc.toString();

    const match = this.dictionary.findWordAtOffset(
      fullDoc,
      pos,
      this.settings.maxWordLength
    );

    if (match) {
      const resolvedBounds = bounds || this.getContentBounds(null, view);
      this.tooltip.show(match, clientX, clientY, this.settings, resolvedBounds);
    }
  }

  /**
   * Reading View double-click handler
   */
  private handleReadingViewDblClick(event: MouseEvent): void {
    if (!this.settings.enabled) return;
    if (this.settings.triggerMode === "command_only") return;
    if (this.settings.triggerMode === "hover") return;

    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest(".cm-editor") || target.closest(".ch-dict-tooltip")) {
      return;
    }

    const container = target.closest(
      ".markdown-rendered, .markdown-preview-view"
    ) as HTMLElement | null;
    if (!container) return;

    const bounds = this.getContentBounds(target, undefined);
    this.handleReadingViewLookup(event.clientX, event.clientY, container, bounds);
  }

  /**
   * Reading View mousemove handler for hover triggers
   */
  private handleReadingViewMouseMove(event: MouseEvent): void {
    if (!this.settings.enabled) return;
    const mode = this.settings.triggerMode;
    if (mode !== "hover" && mode !== "hover_modifier") return;

    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest(".cm-editor") || target.closest(".ch-dict-tooltip")) {
      return;
    }

    const container = target.closest(
      ".markdown-rendered, .markdown-preview-view"
    ) as HTMLElement | null;
    if (!container) {
      this.cancelHoverLookup();
      return;
    }

    if (mode === "hover_modifier") {
      if (!this.checkModifier(event, this.settings.hoverModifierKey)) {
        this.cancelHoverLookup();
        return;
      }
    }

    this.scheduleHoverLookup(
      event.clientX,
      event.clientY,
      undefined,
      container,
      target
    );
  }

  /**
   * Reading View word lookup implementation
   */
  private handleReadingViewLookup(
    clientX: number,
    clientY: number,
    container: HTMLElement,
    bounds?: ContentBounds
  ): void {
    if (!this.dictionary.isReady()) {
      new Notice("Dictionary is still loading, please wait a moment...", 2000);
      return;
    }

    const resolvedBounds = bounds || this.getContentBounds(container, undefined);

    // Check if user selected text
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : "";
    if (selectedText && this.dictionary.isChinese(selectedText[0])) {
      const directEntries = this.dictionary.get(selectedText);
      if (directEntries && directEntries.length > 0) {
        this.tooltip.show(
          {
            word: selectedText,
            entries: directEntries,
            length: selectedText.length,
          },
          clientX,
          clientY,
          this.settings,
          resolvedBounds
        );
        return;
      }
    }

    // Determine caret position from coordinates
    let range: Range | null = null;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(clientX, clientY);
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(clientX, clientY);
      if (pos && pos.offsetNode) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.setEnd(pos.offsetNode, pos.offset);
      }
    }

    if (
      !range ||
      !range.startContainer ||
      range.startContainer.nodeType !== Node.TEXT_NODE
    ) {
      return;
    }

    const textNode = range.startContainer as Text;
    const offset = range.startOffset;
    const fullText = textNode.textContent || "";

    const match = this.dictionary.findWordAtOffset(
      fullText,
      offset,
      this.settings.maxWordLength
    );

    if (match) {
      this.tooltip.show(match, clientX, clientY, this.settings, resolvedBounds);
    }
  }

  /**
   * Debounced hover scheduler
   */
  private scheduleHoverLookup(
    x: number,
    y: number,
    view?: EditorView,
    containerEl?: HTMLElement,
    targetEl?: HTMLElement
  ): void {
    this.lastHoverCoords = { x, y };
    this.cancelHoverLookup();

    this.hoverTimeout = window.setTimeout(() => {
      this.hoverTimeout = null;
      if (!this.lastHoverCoords) return;
      if (!this.settings.enabled || !this.dictionary.isReady()) return;

      const bounds = this.getContentBounds(targetEl, view);

      if (view) {
        this.handleEditorLookup(
          this.lastHoverCoords.x,
          this.lastHoverCoords.y,
          view,
          bounds
        );
      } else if (containerEl) {
        this.handleReadingViewLookup(
          this.lastHoverCoords.x,
          this.lastHoverCoords.y,
          containerEl,
          bounds
        );
      }
    }, this.settings.hoverDelayMs || 300);
  }

  private cancelHoverLookup(): void {
    if (this.hoverTimeout !== null) {
      window.clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  // ==========================================
  // COMMAND IMPLEMENTATIONS (HOTKEYS)
  // ==========================================

  /**
   * Look up word under cursor or selection in active editor
   */
  public lookupAtEditorCursor(editor: Editor): void {
    if (!this.settings.enabled) {
      new Notice("Словарь отключен. Включите его в настройках плагина.");
      return;
    }
    if (!this.dictionary.isReady()) {
      new Notice("Словарь еще загружается, пожалуйста, подождите...", 2000);
      return;
    }

    const selection = editor.getSelection().trim();
    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;

    const cmEditor = editor as CodeMirrorEditor;
    const cm = cmEditor.cm;
    if (cm) {
      const head = cm.state.selection.main.head;
      const coords = cm.coordsAtPos(head);
      if (coords) {
        clientX = coords.left;
        clientY = coords.bottom;
      }
    } else if (typeof cmEditor.cursorCoords === "function") {
      const coords = cmEditor.cursorCoords(true, "window");
      if (coords) {
        clientX = coords.left;
        clientY = coords.bottom;
      }
    }

    const bounds = this.getContentBounds(null, cm);

    if (selection && this.dictionary.isChinese(selection[0])) {
      const directEntries = this.dictionary.get(selection);
      if (directEntries && directEntries.length > 0) {
        this.tooltip.show(
          { word: selection, entries: directEntries, length: selection.length },
          clientX,
          clientY,
          this.settings,
          bounds
        );
        return;
      }
    }

    const cursor = editor.getCursor();
    const lineText = editor.getLine(cursor.line);
    const match = this.dictionary.findWordAtOffset(
      lineText,
      cursor.ch,
      this.settings.maxWordLength
    );

    if (match) {
      this.tooltip.show(match, clientX, clientY, this.settings, bounds);
    } else {
      new Notice("Иероглиф не найден под курсором / No Chinese character at cursor", 2000);
    }
  }

  /**
   * Look up selected text in Reading View
   */
  public lookupAtReadingView(): void {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : "";
    if (!selectedText || !this.dictionary.isChinese(selectedText[0])) {
      new Notice("Выделите китайское слово для поиска / Select Chinese word to look up", 2000);
      return;
    }

    const directEntries = this.dictionary.get(selectedText);
    if (directEntries && directEntries.length > 0) {
      let clientX = window.innerWidth / 2;
      let clientY = window.innerHeight / 2;

      if (selection && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        clientX = rect.left + rect.width / 2;
        clientY = rect.bottom;
      }

      const bounds = this.getContentBounds(null, undefined);

      this.tooltip.show(
        { word: selectedText, entries: directEntries, length: selectedText.length },
        clientX,
        clientY,
        this.settings,
        bounds
      );
    } else {
      new Notice(`Слово '${selectedText}' не найдено в словаре`, 2000);
    }
  }

  /**
   * Pronounce currently active or selected word
   */
  public pronounceActiveWord(): void {
    if (this.tooltip.getIsOpen() && this.tooltip.getCurrentWord()) {
      this.tooltip.playSpeech(this.tooltip.getCurrentWord()!, this.settings);
      return;
    }

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.editor) {
      const editor = activeView.editor;
      const selection = editor.getSelection().trim();
      if (selection && this.dictionary.isChinese(selection[0])) {
        this.tooltip.playSpeech(selection, this.settings);
        new Notice(`Озвучивание: ${selection}`);
        return;
      }
      const cursor = editor.getCursor();
      const lineText = editor.getLine(cursor.line);
      const match = this.dictionary.findWordAtOffset(
        lineText,
        cursor.ch,
        this.settings.maxWordLength
      );
      if (match) {
        this.tooltip.playSpeech(match.word, this.settings);
        new Notice(`Озвучивание: ${match.word}`);
        return;
      }
    }
    new Notice("Нет слова для озвучивания / No active word to pronounce");
  }

  /**
   * Copy currently active word and definition to clipboard
   */
  public copyActiveWord(): void {
    if (this.tooltip.getIsOpen() && this.tooltip.getCurrentMatch()) {
      this.tooltip.copyCurrentEntry(this.settings);
      return;
    }

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.editor) {
      const editor = activeView.editor;
      const selection = editor.getSelection().trim();
      if (selection && this.dictionary.isChinese(selection[0])) {
        const entries = this.dictionary.get(selection);
        if (entries && entries.length > 0) {
          this.tooltip.copyEntryDirect(
            { word: selection, entries, length: selection.length },
            this.settings
          );
          return;
        }
      }
      const cursor = editor.getCursor();
      const lineText = editor.getLine(cursor.line);
      const match = this.dictionary.findWordAtOffset(
        lineText,
        cursor.ch,
        this.settings.maxWordLength
      );
      if (match) {
        this.tooltip.copyEntryDirect(match, this.settings);
        return;
      }
    }
    new Notice("Нет слова для копирования / No active word to copy");
  }

  /**
   * Instant toggle between Cantonese and Mandarin
   */
  public async switchDialect(): Promise<void> {
    if (this.settings.dialect === "cantonese") {
      this.settings.dialect = "mandarin";
    } else {
      this.settings.dialect = "cantonese";
    }
    await this.saveSettings();

    const label =
      this.settings.dialect === "cantonese"
        ? "Гуандунхуа / Кантонский (廣東話)"
        : "Путунхуа / Мандарин (普通话)";
    new Notice(`Диалект озвучки: ${label}`);

    if (this.tooltip.getIsOpen()) {
      this.tooltip.refresh(this.settings);
    }
  }

  /**
   * Cycle phonetic display mode (Both -> Pinyin -> Jyutping -> Auto)
   */
  public async cyclePhoneticDisplay(): Promise<void> {
    const modes: PhoneticDisplay[] = [
      "both",
      "pinyin",
      "jyutping",
      "dialect_auto",
    ];
    const names: Record<PhoneticDisplay, string> = {
      both: "И пиньинь, и ютпинг (Pinyin / Jyutping)",
      pinyin: "Только пиньинь (Pinyin only)",
      jyutping: "Только ютпинг (Jyutping only)",
      dialect_auto: "Авто по диалекту (Auto by Dialect)",
    };
    const currentIndex = modes.indexOf(this.settings.phoneticDisplay);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    this.settings.phoneticDisplay = nextMode;
    await this.saveSettings();

    new Notice(`Отображение фонетики: ${names[nextMode]}`);

    if (this.tooltip.getIsOpen()) {
      this.tooltip.refresh(this.settings);
    }
  }
}
