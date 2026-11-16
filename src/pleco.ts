/**
 * Pleco Flashcards Exporter
 * Generates official Pleco XML/TXT bookmarks format compatible with Android and iOS apps.
 */

import type { VocabularyItem } from "./vocabulary.ts";

/**
 * Generates a Pleco-compatible Flashcards text file:
 * Format:
 * // Chinese Vocabulary (Folder Category)
 * 简体 [繁体] <tab> pinyin / jyutping <tab> definitions
 */
export function generatePlecoFlashcards(
  items: VocabularyItem[],
  category: string = "Obsidian Chinese"
): string {
  const lines: string[] = [];

  // Pleco category folder header
  lines.push(`// ${category}`);

  for (const item of items) {
    const headword = item.traditional && item.traditional !== item.word
      ? `${item.word}[${item.traditional}]`
      : item.word;

    let phonetics = item.pinyin || "";
    if (item.jyutping) {
      phonetics = phonetics ? `${phonetics} [粵 ${item.jyutping}]` : item.jyutping;
    }

    const defs = item.definitions.join("; ");
    const context = item.contextSentence ? ` (Ex: ${item.contextSentence})` : "";

    lines.push(`${headword}\t${phonetics}\t${defs}${context}`);
  }

  return lines.join("\n");
}
