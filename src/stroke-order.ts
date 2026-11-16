import { App, Modal, Notice } from "obsidian";

interface HanziData {
  strokes: string[];
  medians?: number[][][];
}

export class StrokeOrderModal extends Modal {
  private word: string;
  private currentCharIndex: number = 0;
  private hanziData: HanziData | null = null;
  private currentStrokeStep: number = 0;
  private isAnimating: boolean = false;
  private animationTimer: number | null = null;

  constructor(app: App, word: string) {
    super(app);
    // Filter out non-Chinese characters
    const chars = Array.from(word).filter((c) => /\p{Script=Han}/u.test(c));
    this.word = chars.length > 0 ? chars.join("") : word;
  }

  override onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("ch-dict-stroke-modal");

    this.render();
    this.loadCharData(this.getCurrChar());
  }

  override onClose(): void {
    this.stopAnimation();
    this.contentEl.empty();
  }

  private getCurrChar(): string {
    const chars = Array.from(this.word);
    return chars[this.currentCharIndex] || chars[0] || "字";
  }

  private async loadCharData(char: string): Promise<void> {
    this.stopAnimation();
    this.hanziData = null;
    this.currentStrokeStep = 0;

    const canvas = this.contentEl.querySelector(".ch-dict-stroke-canvas");
    if (canvas) {
      canvas.empty();
      canvas.createDiv({ cls: "ch-dict-stroke-loading", text: `Загрузка черт для ${char}...` });
    }

    try {
      const url = `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HanziData = await res.json();
      this.hanziData = data;
      this.currentStrokeStep = data.strokes.length; // initial: show complete
      this.renderSvg();
    } catch {
      // Fallback: Offline / Static calligraphy view
      this.renderFallback(char);
    }
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();

    // 1. Header with character switcher tabs
    const header = contentEl.createDiv({ cls: "ch-dict-stroke-header" });
    const chars = Array.from(this.word);

    if (chars.length > 1) {
      const charTabs = header.createDiv({ cls: "ch-dict-stroke-tabs" });
      chars.forEach((c, idx) => {
        const tab = charTabs.createEl("button", {
          cls: `ch-dict-stroke-tab ${idx === this.currentCharIndex ? "active" : ""}`,
          text: c,
        });
        tab.onclick = () => {
          this.currentCharIndex = idx;
          this.render();
          this.loadCharData(c);
        };
      });
    } else {
      header.createEl("h3", { text: `Порядок черт: ${this.getCurrChar()}` });
    }

    // 2. Main Calligraphy Grid (米字格 Mizige)
    contentEl.createDiv({ cls: "ch-dict-stroke-canvas" });

    // 3. Control Buttons (Play, Step Back, Step Forward, Reset)
    const controls = contentEl.createDiv({ cls: "ch-dict-stroke-controls" });

    const playBtn = controls.createEl("button", {
      cls: "mod-cta",
      text: "▶ Анимация",
    });
    playBtn.onclick = () => this.toggleAnimation(playBtn);

    const prevBtn = controls.createEl("button", { text: "⏮ Шаг назад" });
    prevBtn.onclick = () => {
      this.stopAnimation();
      if (this.currentStrokeStep > 0) {
        this.currentStrokeStep--;
        this.renderSvg();
      }
    };

    const nextBtn = controls.createEl("button", { text: "Шаг вперед ⏭" });
    nextBtn.onclick = () => {
      this.stopAnimation();
      if (this.hanziData && this.currentStrokeStep < this.hanziData.strokes.length) {
        this.currentStrokeStep++;
        this.renderSvg();
      }
    };

    const resetBtn = controls.createEl("button", { text: "↺ Показать всё" });
    resetBtn.onclick = () => {
      this.stopAnimation();
      if (this.hanziData) {
        this.currentStrokeStep = this.hanziData.strokes.length;
        this.renderSvg();
      }
    };
  }

  private renderSvg(): void {
    const canvas = this.contentEl.querySelector(".ch-dict-stroke-canvas");
    if (!canvas || !this.hanziData) return;
    canvas.empty();

    // Create SVG element with Mizige background
    const totalStrokes = this.hanziData.strokes.length;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 1024 1024");
    svg.setAttribute("class", "ch-dict-stroke-svg");

    // Background calligraphic lines (米字格)
    const gridG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gridG.setAttribute("class", "ch-dict-stroke-grid");
    gridG.setAttribute("fill", "none");
    gridG.setAttribute("stroke", "currentColor");
    gridG.setAttribute("stroke-width", "6");
    gridG.setAttribute("stroke-dasharray", "16,16");
    gridG.setAttribute("opacity", "0.22");

    const lines = [
      "M 0 512 L 1024 512", // Horizontal center
      "M 512 0 L 512 1024", // Vertical center
      "M 0 0 L 1024 1024",   // Diagonal 1
      "M 1024 0 L 0 1024",   // Diagonal 2
    ];
    lines.forEach((d) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      gridG.appendChild(path);
    });
    svg.appendChild(gridG);

    // Group for character strokes (Hanzi Writer uses inverted Y-axis 1024 coordinate system)
    const charG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    charG.setAttribute("transform", "scale(1, -1) translate(0, -900)");

    // Render strokes up to currentStrokeStep
    const visibleCount = Math.min(this.currentStrokeStep, totalStrokes);

    // 1. Ghost outlines layer (all strokes rendered faint in background)
    const ghostG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    ghostG.setAttribute("class", "ch-dict-stroke-ghost-layer");
    for (let i = 0; i < totalStrokes; i++) {
      const strokeD = this.hanziData.strokes[i];
      const ghostPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      ghostPath.setAttribute("d", strokeD);
      ghostPath.setAttribute("class", "ch-dict-stroke-ghost");
      ghostG.appendChild(ghostPath);
    }
    charG.appendChild(ghostG);

    // 2. Drawn strokes layer (solid text color + active accent stroke)
    const drawnG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    drawnG.setAttribute("class", "ch-dict-stroke-drawn-layer");
    for (let i = 0; i < visibleCount; i++) {
      const strokeD = this.hanziData.strokes[i];
      const drawnPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      drawnPath.setAttribute("d", strokeD);

      if (i === visibleCount - 1 && this.isAnimating) {
        drawnPath.setAttribute("class", "ch-dict-stroke-active");
      } else {
        drawnPath.setAttribute("class", "ch-dict-stroke-drawn");
      }
      drawnG.appendChild(drawnPath);
    }
    charG.appendChild(drawnG);

    svg.appendChild(charG);
    canvas.appendChild(svg);

    // Counter badge (e.g. "Черта 4 из 7")
    const counter = canvas.createDiv({ cls: "ch-dict-stroke-counter" });
    counter.setText(`Черта ${visibleCount} из ${totalStrokes}`);
  }

  private renderFallback(char: string): void {
    const canvas = this.contentEl.querySelector(".ch-dict-stroke-canvas");
    if (!canvas) return;
    canvas.empty();

    const box = canvas.createDiv({ cls: "ch-dict-stroke-fallback-box" });
    box.createDiv({ cls: "ch-dict-stroke-fallback-char", text: char });
    box.createDiv({
      cls: "ch-dict-stroke-fallback-note",
      text: "Каллиграфический стандарт (Офлайн-режим)",
    });
  }

  private toggleAnimation(btn: HTMLButtonElement): void {
    if (this.isAnimating) {
      this.stopAnimation();
      btn.setText("▶ Анимация");
    } else {
      this.startAnimation(btn);
    }
  }

  private startAnimation(btn: HTMLButtonElement): void {
    if (!this.hanziData) return;
    this.stopAnimation();
    this.isAnimating = true;
    this.currentStrokeStep = 0;
    btn.setText("⏸ Пауза");

    const total = this.hanziData.strokes.length;
    const step = () => {
      if (this.currentStrokeStep < total) {
        this.currentStrokeStep++;
        this.renderSvg();
        this.animationTimer = window.setTimeout(step, 450);
      } else {
        this.stopAnimation();
        btn.setText("▶ Анимация");
      }
    };
    step();
  }

  private stopAnimation(): void {
    this.isAnimating = false;
    if (this.animationTimer !== null) {
      window.clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
  }
}
