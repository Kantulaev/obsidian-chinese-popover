import { App, Modal } from "obsidian";
import { getHskLevel, HSK_COLORS } from "./hsk.ts";

export interface TextAnalysisStats {
  totalChars: number;
  chineseChars: number;
  uniqueWords: number;
  hskCounts: Record<number, number>;
  nonHskCount: number;
  estimatedLevel: string;
}

export class TextAnalyzerModal extends Modal {
  private text: string;
  private titleText: string;

  constructor(app: App, text: string, titleText: string = "Анализ сложности текста по HSK") {
    super(app);
    this.text = text;
    this.titleText = titleText;
  }

  override onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("ch-analyzer-modal");

    const stats = this.analyze(this.text);

    // Header
    const header = contentEl.createDiv({ cls: "ch-analyzer-header" });
    header.createEl("h3", { text: `📊 ${this.titleText}` });

    // Summary Cards Row
    const summaryRow = contentEl.createDiv({ cls: "ch-analyzer-summary" });

    const card1 = summaryRow.createDiv({ cls: "ch-analyzer-stat-card" });
    card1.createDiv({ cls: "ch-analyzer-stat-val", text: `${stats.chineseChars}` });
    card1.createDiv({ cls: "ch-analyzer-stat-lbl", text: "Китайских иероглифов" });

    const card2 = summaryRow.createDiv({ cls: "ch-analyzer-stat-card" });
    card2.createDiv({ cls: "ch-analyzer-stat-val", text: stats.estimatedLevel });
    card2.createDiv({ cls: "ch-analyzer-stat-lbl", text: "Ориентировочный уровень" });

    const card3 = summaryRow.createDiv({ cls: "ch-analyzer-stat-card" });
    card3.createDiv({ cls: "ch-analyzer-stat-val", text: `${stats.uniqueWords}` });
    card3.createDiv({ cls: "ch-analyzer-stat-lbl", text: "Уникальных слов" });

    // HSK Breakdown Progress Bars
    const breakdownSection = contentEl.createDiv({ cls: "ch-analyzer-breakdown" });
    breakdownSection.createEl("h4", { text: "Распределение словарного запаса (HSK 1 - 6)" });

    const totalWordsEvaluated = Math.max(
      1,
      Object.values(stats.hskCounts).reduce((a, b) => a + b, 0) + stats.nonHskCount
    );

    for (let lvl = 1; lvl <= 6; lvl++) {
      const count = stats.hskCounts[lvl] || 0;
      const pct = Math.round((count / totalWordsEvaluated) * 100);
      const color = HSK_COLORS[lvl]?.color || "#7c3aed";

      const barRow = breakdownSection.createDiv({ cls: "ch-analyzer-bar-row" });
      const labelCol = barRow.createDiv({ cls: "ch-analyzer-bar-label" });
      labelCol.createSpan({ cls: "ch-analyzer-lvl-badge", text: `HSK ${lvl}` });
      labelCol.createSpan({ text: `${count} слов (${pct}%)` });

      const track = barRow.createDiv({ cls: "ch-analyzer-bar-track" });
      const fill = track.createDiv({ cls: "ch-analyzer-bar-fill" });
      fill.style.width = `${pct}%`;
      fill.style.backgroundColor = color;
    }

    // Advanced / Non-HSK
    const nonHskPct = Math.round((stats.nonHskCount / totalWordsEvaluated) * 100);
    const nonHskRow = breakdownSection.createDiv({ cls: "ch-analyzer-bar-row" });
    const nonHskLabel = nonHskRow.createDiv({ cls: "ch-analyzer-bar-label" });
    nonHskLabel.createSpan({ cls: "ch-analyzer-lvl-badge non-hsk", text: "Выше HSK 6" });
    nonHskLabel.createSpan({ text: `${stats.nonHskCount} слов (${nonHskPct}%)` });

    const nonHskTrack = nonHskRow.createDiv({ cls: "ch-analyzer-bar-track" });
    const nonHskFill = nonHskTrack.createDiv({ cls: "ch-analyzer-bar-fill" });
    nonHskFill.style.width = `${nonHskPct}%`;
    nonHskFill.style.backgroundColor = "#64748b";

    // Footer with recommendations
    const adviceBox = contentEl.createDiv({ cls: "ch-analyzer-advice" });
    adviceBox.createEl("p", {
      text: `💡 Рекомендация: Текст больше всего подходит для изучающих с уровнем ${stats.estimatedLevel}. Незнакомые слова вы можете сразу смотреть двойным кликом или наведением в Режиме быстрого чтения!`,
    });
  }

  override onClose(): void {
    this.contentEl.empty();
  }

  private analyze(text: string): TextAnalysisStats {
    const chars = Array.from(text);
    let chineseChars = 0;
    for (const c of chars) {
      if (/\p{Script=Han}/u.test(c)) {
        chineseChars++;
      }
    }

    // Segment text into Chinese tokens using Intl.Segmenter
    let tokens: string[] = [];
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      // @ts-ignore - Intl.Segmenter standard in modern runtime
      const segmenter = new Intl.Segmenter("zh-CN", { granularity: "word" });
      // @ts-ignore
      for (const seg of segmenter.segment(text)) {
        const word = seg.segment.trim();
        if (word && /\p{Script=Han}/u.test(word)) {
          tokens.push(word);
        }
      }
    } else {
      tokens = text.match(/[\p{Script=Han}]+/gu) || [];
    }

    const uniqueTokens = Array.from(new Set(tokens));
    const hskCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let nonHskCount = 0;

    for (const word of uniqueTokens) {
      const lvl = getHskLevel(word);
      if (lvl !== null) {
        hskCounts[lvl] = (hskCounts[lvl] || 0) + 1;
      } else {
        nonHskCount++;
      }
    }

    // Estimate CEFR level
    let estimatedLevel = "HSK 1 (Начинающий / A1)";
    if (hskCounts[6] > 10 || nonHskCount > 30) {
      estimatedLevel = "HSK 6 (Свободный / C2)";
    } else if (hskCounts[5] > 10) {
      estimatedLevel = "HSK 5 (Продвинутый / C1)";
    } else if (hskCounts[4] > 10) {
      estimatedLevel = "HSK 4 (Выше среднего / B2)";
    } else if (hskCounts[3] > 10) {
      estimatedLevel = "HSK 3 (Средний / B1)";
    } else if (hskCounts[2] > 10) {
      estimatedLevel = "HSK 2 (Базовый / A2)";
    }

    return {
      totalChars: chars.length,
      chineseChars,
      uniqueWords: uniqueTokens.length,
      hskCounts,
      nonHskCount,
      estimatedLevel,
    };
  }
}
