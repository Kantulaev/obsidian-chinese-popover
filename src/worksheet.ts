import { App, Modal, Notice } from "obsidian";
import type { VocabularyItem } from "./vocabulary.ts";

export class WorksheetModal extends Modal {
  private items: VocabularyItem[];

  constructor(app: App, items: VocabularyItem[]) {
    super(app);
    this.items = items;
  }

  override onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("ch-worksheet-modal");

    const header = contentEl.createDiv({ cls: "ch-worksheet-header" });
    header.createEl("h3", { text: "📝 Прописи по иероглифам (米字格 Mizige)" });

    const btnRow = header.createDiv({ cls: "ch-worksheet-actions" });
    const printBtn = btnRow.createEl("button", {
      cls: "mod-cta",
      text: "🖨️ Печать / Сохранить в PDF",
    });
    printBtn.addEventListener("click", () => {
      this.printWorksheet();
    });

    const previewContainer = contentEl.createDiv({ cls: "ch-worksheet-preview" });
    this.renderWorksheetHtml(previewContainer);
  }

  override onClose(): void {
    this.contentEl.empty();
  }

  private renderWorksheetHtml(container: HTMLElement): void {
    container.empty();

    if (this.items.length === 0) {
      container.createDiv({ text: "Нет слов для создания прописей. Добавьте слова в словарик!" });
      return;
    }

    const sheet = container.createDiv({ cls: "ch-worksheet-sheet" });
    sheet.createEl("h2", { cls: "ch-worksheet-title", text: "汉字练习本 • Тетрадь прописей по китайскому языку" });
    sheet.createDiv({ cls: "ch-worksheet-meta", text: `Дата: ${new Date().toLocaleDateString()} • Имя: ____________________ • Всего слов: ${this.items.length}` });

    for (const item of this.items) {
      const chars = Array.from(item.word).filter((c) => /\p{Script=Han}/u.test(c));
      for (const char of chars) {
        const row = sheet.createDiv({ cls: "ch-worksheet-row" });

        // Left info column
        const infoCol = row.createDiv({ cls: "ch-worksheet-info" });
        infoCol.createSpan({ cls: "ch-worksheet-info-pinyin", text: item.pinyin });
        infoCol.createSpan({ cls: "ch-worksheet-info-trans", text: item.definitions[0] || "" });

        // Practice cells (1 model + 2 tracing + 7 blank)
        const cells = row.createDiv({ cls: "ch-worksheet-cells" });

        // Model cell
        const modelCell = cells.createDiv({ cls: "ch-worksheet-cell model" });
        modelCell.createSpan({ cls: "ch-worksheet-char", text: char });

        // Tracing cells (semi-transparent for tracing with pen)
        for (let i = 0; i < 2; i++) {
          const traceCell = cells.createDiv({ cls: "ch-worksheet-cell trace" });
          traceCell.createSpan({ cls: "ch-worksheet-char trace-char", text: char });
        }

        // Blank practice cells
        for (let i = 0; i < 7; i++) {
          cells.createDiv({ cls: "ch-worksheet-cell blank" });
        }
      }
    }
  }

  private printWorksheet(): void {
    const preview = this.contentEl.querySelector(".ch-worksheet-sheet");
    if (!preview) return;

    // Use a clean hidden iframe for seamless printing without popup windows or document.write
    const iframe = createEl("iframe");
    iframe.setCssStyles({
      position: "fixed",
      right: "0",
      bottom: "0",
      width: "0",
      height: "0",
      border: "0",
      visibility: "hidden",
    });
    activeDocument.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      iframe.remove();
      new Notice("Не удалось открыть окно печати.");
      return;
    }

    const styleEl = createEl("style", {
      text: `
      @page { size: A4 portrait; margin: 12mm; }
      body { font-family: "KaiTi", "楷体", "Noto Serif SC", serif; margin: 0; padding: 0; color: #000; }
      .ch-worksheet-title { text-align: center; font-size: 18px; margin-bottom: 4px; }
      .ch-worksheet-meta { text-align: right; font-size: 12px; margin-bottom: 16px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
      .ch-worksheet-row { display: flex; align-items: center; margin-bottom: 10px; page-break-inside: avoid; }
      .ch-worksheet-info { width: 100px; display: flex; flex-direction: column; font-size: 11px; padding-right: 10px; text-align: right; }
      .ch-worksheet-info-pinyin { font-weight: bold; color: #333; font-size: 13px; }
      .ch-worksheet-info-trans { color: #666; font-size: 10px; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ch-worksheet-cells { display: flex; gap: 4px; }
      .ch-worksheet-cell {
        width: 44px; height: 44px; position: relative; border: 1px solid #c4b5fd;
        display: flex; align-items: center; justify-content: center;
        background:
          linear-gradient(to right, transparent 49%, #f1f5f9 49%, #f1f5f9 51%, transparent 51%),
          linear-gradient(to bottom, transparent 49%, #f1f5f9 49%, #f1f5f9 51%, transparent 51%),
          linear-gradient(45deg, transparent 49%, #f8fafc 49%, #f8fafc 51%, transparent 51%),
          linear-gradient(-45deg, transparent 49%, #f8fafc 49%, #f8fafc 51%, transparent 51%);
      }
      .ch-worksheet-char { font-size: 32px; line-height: 1; font-family: "KaiTi", "楷体", serif; }
      .trace-char { color: #cbd5e1; }
      `,
    });
    doc.head.appendChild(styleEl);

    const cloned = preview.cloneNode(true);
    doc.body.appendChild(cloned);

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    globalThis.setTimeout(() => {
      iframe.remove();
    }, 1000);
  }
}
