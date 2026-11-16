import { Notice, requestUrl } from "obsidian";
import type { VocabularyItem } from "./vocabulary.ts";

export interface AnkiConnectSettings {
  enabled: boolean;
  serverUrl: string; // default http://127.0.0.1:8765
  deckName: string;  // default Chinese
  modelName: string; // default Basic
  tags: string[];    // default ["obsidian-chinese"]
}

export const DEFAULT_ANKI_SETTINGS: AnkiConnectSettings = {
  enabled: false,
  serverUrl: "http://127.0.0.1:8765",
  deckName: "Chinese",
  modelName: "Basic",
  tags: ["obsidian-chinese"],
};

/**
 * Checks if AnkiConnect is active and reachable
 */
export async function checkAnkiConnect(url: string): Promise<boolean> {
  try {
    const res = await requestUrl({
      url,
      method: "POST",
      contentType: "application/json",
      body: JSON.stringify({ action: "version", version: 6 }),
    });
    const data = res.json as { result?: number; error?: string } | null;
    return res.status === 200 && (data?.result ?? 0) >= 6;
  } catch {
    return false;
  }
}

/**
 * Adds a vocabulary item to Anki via AnkiConnect API
 */
export async function addNoteToAnki(
  config: AnkiConnectSettings,
  item: VocabularyItem
): Promise<boolean> {
  const frontHtml = `<b>${item.word}</b>` + (item.traditional && item.traditional !== item.word ? ` <span style="color:#888;">[${item.traditional}]</span>` : "");

  let phonetics = item.pinyin || "";
  if (item.jyutping) {
    phonetics = phonetics ? `${phonetics} / 粵 ${item.jyutping}` : `粵 ${item.jyutping}`;
  }

  const backHtml = [
    `<div style="font-size:1.2em; color:#0284c7; margin-bottom:8px;">${phonetics}</div>`,
    `<ul style="margin:0; padding-left:20px;">`,
    ...item.definitions.map((d) => `<li>${d}</li>`),
    `</ul>`,
    item.contextSentence ? `<blockquote style="margin-top:10px; color:#666; font-style:italic;">${item.contextSentence}</blockquote>` : "",
  ].join("\n");

  const payload = {
    action: "addNote",
    version: 6,
    params: {
      note: {
        deckName: config.deckName || "Chinese",
        modelName: config.modelName || "Basic",
        fields: {
          Front: frontHtml,
          Back: backHtml,
        },
        tags: config.tags || ["obsidian-chinese"],
        options: {
          allowDuplicate: false,
          duplicateScope: "deck",
        },
      },
    },
  };

  try {
    const res = await requestUrl({
      url: config.serverUrl || "http://127.0.0.1:8765",
      method: "POST",
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
    const resData = res.json as { error?: string } | null;
    if (resData?.error) {
      new Notice(`AnkiConnect: ${resData.error}`, 4000);
      return false;
    }
    return true;
  } catch {
    new Notice("Не удалось подключиться к AnkiConnect. Проверьте запущен ли Anki и включен ли плагин AnkiConnect.", 4000);
    return false;
  }
}

/**
 * Generates an Anki-compatible Tab-Separated Values (TSV) string for offline import
 */
export function generateAnkiTsv(items: VocabularyItem[]): string {
  const header = "#separator:tab\n#html:true\n#tags:obsidian-chinese\nFront\tBack\tPinyin\tJyutping\tDefinitions\tContext\n";

  const rows = items.map((item) => {
    const front = `${item.word}` + (item.traditional && item.traditional !== item.word ? ` [${item.traditional}]` : "");
    const defs = item.definitions.join("; ");
    const pinyin = item.pinyin || "";
    const jyutping = item.jyutping || "";
    const ctx = (item.contextSentence || "").replace(/\t/g, " ").replace(/\n/g, "<br>");
    const back = `${pinyin}${jyutping ? " / " + jyutping : ""}<br>${defs}${ctx ? "<br><i>" + ctx + "</i>" : ""}`;

    return [front, back, pinyin, jyutping, defs, ctx].map((f) => f.replace(/\t/g, " ")).join("\t");
  });

  return header + rows.join("\n");
}
