import { Notice } from "obsidian";
import { formatPinyin } from "./pinyin.ts";
import { generateAnkiTsv } from "./anki.ts";
import { generatePlecoFlashcards } from "./pleco.ts";
import type { VocabularyItem } from "./vocabulary.ts";
import type { ChineseDialect, PhoneticDisplay } from "./settings.ts";

/** Pre-compiled regex matching one or more Chinese Hanzi characters */
export const HAN_CHAR_RE = /\p{Script=Han}/u;
export const HAN_RUN_GLOBAL_RE = /\p{Script=Han}+/gu;

/**
 * Triggers a browser download for a UTF-8 text file and revokes the object URL immediately.
 */
export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string = "text/plain;charset=utf-8;"
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = createEl("a", {
    href: url,
    attr: { download: filename },
  });
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports saved vocabulary items to Anki TSV or Pleco TXT format.
 */
export function exportVocabularyFile(
  items: VocabularyItem[],
  format: "anki" | "pleco",
  emptyNotice: string = "Словарик пуст! Сначала добавьте слова звёздочкой ⭐."
): boolean {
  if (!items || items.length === 0) {
    new Notice(emptyNotice);
    return false;
  }

  const dateTag = new Date().toISOString().slice(0, 10);
  if (format === "anki") {
    const tsv = generateAnkiTsv(items);
    downloadTextFile(
      `Anki_Chinese_Vocabulary_${dateTag}.tsv`,
      tsv,
      "text/tab-separated-values;charset=utf-8;"
    );
    new Notice(`Экспортировано ${items.length} слов в TSV файл для Anki!`);
  } else {
    const txt = generatePlecoFlashcards(items);
    downloadTextFile(
      `Pleco_Chinese_Vocabulary_${dateTag}.txt`,
      txt,
      "text/plain;charset=utf-8;"
    );
    new Notice(`Экспортировано ${items.length} слов для Pleco!`);
  }
  return true;
}

/**
 * Formats Pinyin and/or Jyutping according to display preference and active dialect.
 */
export function formatPhoneticLabel(
  rawPinyin: string,
  jyutping: string | undefined,
  display: PhoneticDisplay,
  dialect: ChineseDialect,
  accented: boolean
): string {
  const pinyin = formatPinyin(rawPinyin || "", accented);
  const jyut = jyutping || "";

  if (!jyut || display === "pinyin") return pinyin;
  if (display === "jyutping") return jyut;
  if (display === "both") return pinyin ? `${pinyin} / ${jyut}` : jyut;
  // dialect_auto
  return dialect === "cantonese" ? (pinyin ? `${pinyin} / ${jyut}` : jyut) : pinyin;
}
