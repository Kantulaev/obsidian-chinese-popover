/**
 * Zettelkasten Word Note Creator for Obsidian
 * Generates structured atomic notes in user's vault with YAML metadata, definitions, and links.
 */

import { App, Notice, TFile } from "obsidian";
import type { MatchResult } from "./dictionary.ts";
import { formatPinyin } from "./pinyin.ts";
import { getHskLevel } from "./hsk.ts";
import { inferPartsOfSpeech, formatPosBadge } from "./pos.ts";
import { getRussianDefinitions } from "./russian-dict.ts";

export interface WordNoteOptions {
  folderPath: string; // e.g. "Chinese/Words"
  openAfterCreation: boolean;
}

/**
 * Creates an atomic Markdown note for a Chinese word
 */
export async function createWordNote(
  app: App,
  match: MatchResult,
  contextSentence?: string,
  options: WordNoteOptions = { folderPath: "Chinese/Words", openAfterCreation: true }
): Promise<TFile | null> {
  const folder = options.folderPath.replace(/^\/|\/$/g, "");
  const adapter = app.vault.adapter;

  // Ensure folder exists
  if (folder && !(await adapter.exists(folder))) {
    try {
      await app.vault.createFolder(folder);
    } catch {
      // folder might already exist
    }
  }

  const word = match.word;
  const fileName = folder ? `${folder}/${word}.md` : `${word}.md`;

  if (await adapter.exists(fileName)) {
    new Notice(`Заметка для "${word}" уже существует в ${fileName}`);
    const existing = app.vault.getAbstractFileByPath(fileName);
    if (existing instanceof TFile && options.openAfterCreation) {
      await app.workspace.getLeaf(false).openFile(existing);
    }
    return existing instanceof TFile ? existing : null;
  }

  const firstEntry = match.entries[0];
  const pinyin = formatPinyin(firstEntry?.pinyin || "", true);
  const jyutping = firstEntry?.jyutping || "";
  const trad = firstEntry?.traditional && firstEntry.traditional !== word ? firstEntry.traditional : "";
  const hsk = getHskLevel(word);
  const posList = inferPartsOfSpeech(word, match.entries.flatMap((e) => e.definitions));
  const posStr = formatPosBadge(posList, "ru");
  const ruDefs = getRussianDefinitions(word);

  const defLines = (ruDefs && ruDefs.length > 0 ? ruDefs : match.entries.flatMap((e) => e.definitions))
    .slice(0, 5)
    .map((d) => `- ${d}`)
    .join("\n");

  const today = new Date().toISOString().slice(0, 10);

  const content = [
    `---`,
    `word: "${word}"`,
    trad ? `traditional: "${trad}"` : null,
    `pinyin: "${pinyin}"`,
    jyutping ? `jyutping: "${jyutping}"` : null,
    hsk ? `hsk: ${hsk}` : null,
    `pos: [${posList.map((p) => `"${p}"`).join(", ")}]`,
    `tags:`,
    `  - chinese/vocabulary`,
    hsk ? `  - hsk${hsk}` : null,
    `date: ${today}`,
    `---`,
    ``,
    `# ${word} ${trad ? `(${trad})` : ""} \`${pinyin}\``,
    jyutping ? `> 粵: \`${jyutping}\` • ${posStr}` : `> ${posStr}`,
    ``,
    `### Значения / Definitions:`,
    defLines,
    ``,
    contextSentence ? `### Контекст употребления:\n> *“${contextSentence}”*\n` : null,
    `### Связанные слова и заметки:`,
    `- `,
    ``,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const createdFile = await app.vault.create(fileName, content);
    new Notice(`Создана заметка слова: ${fileName}`);
    if (options.openAfterCreation) {
      await app.workspace.getLeaf(false).openFile(createdFile);
    }
    return createdFile;
  } catch (err) {
    new Notice(`Не удалось создать заметку: ${err}`);
    return null;
  }
}
