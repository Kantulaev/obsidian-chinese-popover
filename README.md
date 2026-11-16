# 🏮 Chinese Popover Dictionary for Obsidian

<p align="center">
  <img src="./assets/preview.svg" alt="Chinese Popover Dictionary Preview" width="100%" />
</p>

<p align="center">
  <a href="https://obsidian.md"><img src="https://img.shields.io/badge/Obsidian-v0.15%2B-7C3AED?logo=obsidian&logoColor=white" alt="Obsidian Version" /></a>
  <a href="https://github.com/Kantulaev/obsidian-chinese-popover/releases"><img src="https://img.shields.io/badge/Release-v1.6.6-blue.svg" alt="Version 1.6.6" /></a>
  <a href="https://www.youtube.com/@ChineseWithKantulaev"><img src="https://img.shields.io/badge/YouTube-@ChineseWithKantulaev-FF0000?logo=youtube&logoColor=white" alt="English YouTube Channel" /></a>
  <a href="https://www.youtube.com/@kantulaevCN"><img src="https://img.shields.io/badge/YouTube-@kantulaevCN-FF0000?logo=youtube&logoColor=white" alt="Russian YouTube Channel" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" /></a>
  <img src="https://img.shields.io/badge/Translations-English%20%7C%20Russian%20(БКРС)-blue.svg" alt="EN | RU" />
  <img src="https://img.shields.io/badge/HSK%20Levels-1%20to%206-emerald.svg" alt="HSK 1-6" />
  <img src="https://img.shields.io/badge/Vocabulary-118%2C000%2B%20words-orange.svg" alt="118k entries" />
  <img src="https://img.shields.io/badge/Anki%20%26%20Pleco-Sync%20%2B%20Export-8b5cf6.svg" alt="Anki & Pleco" />
  <img src="https://img.shields.io/badge/Style-Apple%20Liquid%20Glass-7C3AED.svg" alt="Apple Liquid Glass" />
</p>

<p align="center">
  <b>Instant, beautiful Chinese popover lookup and personal vocabulary book for Obsidian.</b><br/>
  Featuring dual <b>Mandarin Pinyin</b> and <b>Cantonese Jyutping</b>, smart Chinese word selection (word splitting), authentic neural audio pronunciation, simplified & traditional Hanzi, and an Apple Liquid Glass aesthetic.
</p>

---

## 💎 Popover & Character Anatomy

<p align="center">
  <img src="./assets/feature-popover.svg" alt="Liquid Glass Popover and Character Anatomy" width="100%" />
</p>

* **Apple Liquid Glass UI** — Translucent frosted glass card with fluid blur, draggable header bar, and pin (📌) to freeze on screen.
* **Character Anatomy & 214 Radicals** — Click any character chip in compound words to reveal its Kangxi radical, stroke count, meaning, and etymological components (`宀 + 子`).
* **Ultra-Compact Action Palette** — 34px icon-only quick dock (`📋`, `⭐`, `📌`, `📝`, `🖌️`, `✕`) that never spills over or hides prematurely.
* **Dual English & Russian Translations** — Choose English (CC-CEDICT), Russian (BKRS), or both simultaneously.
* **Dual Phonetics & Tone Colors** — Mandarin diacritic Pinyin + Cantonese Jyutping (`粵`) with customizable tone colors.

---

## 📚 Study Ecosystem & Flashcards

<p align="center">
  <img src="./assets/feature-study.svg" alt="Study Ecosystem, Vocabulary Book and SRS" width="100%" />
</p>

* **Permanent Personal Vocabulary Book** — Star difficult words (`⭐`) into a clean Markdown note in your vault (`Chinese Vocabulary.md`).
* **Spaced Repetition (SRS Flashcards)** — Built-in SM-2 intervals (**Again 1d**, **Hard 3d**, **Good 7d**, **Easy 14d**) with due review filters.
* **Spotlight Quick Search (`Alt + S`)** — Instant modal to search 118,000+ words by Hanzi (`你好`), Pinyin (`nihao`), Jyutping, or Russian/English.
* **1-Click Anki Sync** — Push cards directly into desktop Anki via AnkiConnect or export offline `.tsv` decks.
* **Pleco Mobile Export** — Export vocabulary directly to Pleco `.txt` format for flashcards on iOS and Android.

---

## 🛠️ Advanced Chinese Tools Suite

<p align="center">
  <img src="./assets/feature-tools.svg" alt="Stroke Order, HSK Analyzer and Tools" width="100%" />
</p>

* **Animated Stroke Order (米字格 Mizige)** — Step-by-step vector calligraphy animation modal with character tabs and playback speed controls.
* **Text Difficulty & HSK Analyzer (`Alt + A`)** — Evaluates entire notes or selections, showing HSK 1–6 percentage distribution and CEFR difficulty ratings.
* **Zettelkasten Atomic Word Notes (`Alt + N`)** — 1-click generation of structured Markdown notes in `Chinese/Words/` with YAML metadata, tags, readings, and context sentences.
* **Chengyu Origin Stories (成语故事)** — Expandable ancient fables, allegorical meanings, and historical dynasty context for 4-character idioms.
* **Printable Calligraphy Worksheets** — Generate and print practice sheets with stroke tracing and blank Mizige grids directly to paper or PDF.

---

## 🚀 Quick Start

### Installation via Community Directory (Recommended)
1. In Obsidian, go to **Settings** > **Community plugins**.
2. Make sure **Restricted mode** is turned **off**.
3. Click **Browse** and search for `Chinese Popover Dictionary`.
4. Click **Install**, then click **Enable**.

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest [GitHub Release](https://github.com/Kantulaev/obsidian-chinese-popover/releases).
2. Create a folder named `chinese-popover-dict` in your vault's plugins folder:
   ```text
   <YourVault>/.obsidian/plugins/chinese-popover-dict/
   ```
3. Place `main.js`, `manifest.json`, and `styles.css` into that folder.
4. Reload Obsidian and enable the plugin under **Settings** > **Community plugins**.

---

## ⌨️ Hotkeys & Commands

All actions can be bound to your favorite keyboard shortcuts under **Settings** > **Hotkeys**:

| Command | Suggested Shortcut | Description |
| :--- | :---: | :--- |
| **Look up word under cursor or selection** | <kbd>Alt</kbd> + <kbd>D</kbd> | Opens popover for active cursor position or selection |
| **Star or unstar word** | <kbd>Alt</kbd> + <kbd>B</kbd> | Adds or removes word from Personal Vocabulary notebook |
| **Create Zettelkasten Word Note** | <kbd>Alt</kbd> + <kbd>N</kbd> | Generates an atomic Markdown note with YAML in `Chinese/Words/` |
| **Analyze Text Difficulty & HSK** | <kbd>Alt</kbd> + <kbd>A</kbd> | Analyzes HSK level distribution and CEFR difficulty |
| **Open Calligraphy Worksheets** | — | Opens printable Tianzige / Mizige practice sheets modal |
| **Export Pleco Flashcards** | — | Exports vocabulary as a `.txt` deck for Pleco mobile app |
| **Speak Selected Text** | <kbd>Alt</kbd> + <kbd>R</kbd> | Reads aloud selected sentences/paragraphs with neural TTS |
| **Convert to Traditional (繁體)** | — | Bidirectional conversion of selected text to traditional Hanzi |
| **Convert to Simplified (简体)** | — | Bidirectional conversion of selected text to simplified Hanzi |
| **Open vocabulary in sidebar** | — | Opens the vocabulary notebook panel in the right sidebar |
| **Pronounce active word** | <kbd>Alt</kbd> + <kbd>P</kbd> | Plays audio for current word in chosen dialect |
| **Copy active word card** | <kbd>Alt</kbd> + <kbd>C</kbd> | Copies formatted dictionary entry to clipboard |
| **Switch Dialect** | <kbd>Alt</kbd> + <kbd>S</kbd> | Toggles between Cantonese (`廣東話`) and Mandarin (`普通话`) |
| **Cycle Phonetic Display** | <kbd>Alt</kbd> + <kbd>T</kbd> | Cycles: Both → Pinyin → Jyutping → Auto |
| **Toggle Chinese Dictionary** | — | Enables or disables popover triggers |
| **Close Popover** | <kbd>Escape</kbd> | Closes any open popover immediately |

---

## ⚙️ Customization

Customize everything to match your vault's theme:

* **Personal Vocabulary**:
  * Customizable markdown file path (`Chinese Vocabulary.md`).
  * Auto-save context sentences: On / Off.
  * Practice / flashcard mode toggle.
* **Trigger Modes**: Double-click, Hover with modifier key (<kbd>Alt/Option</kbd>, <kbd>Shift</kbd>, <kbd>Ctrl</kbd>, <kbd>Cmd</kbd>), Hover always, or Hotkeys only.
* **Themes**:
  * 🌌 **Liquid Glass Dark** — Deep glassmorphism with vivid cyan/emerald highlights.
  * ☀️ **Liquid Glass Light** — Frosted translucent glass tuned for light themes.
  * ⬛ **Solid Minimalist** — Opaque card styling with zero transparency.
  * 🔄 **Auto** — Adapts seamlessly to your current Obsidian theme.
* **Card Dimensions**: Adjust popover width (260–460 px), height (130–250 px), and backdrop blur (0–60 px).
* **Typography**: Fine-tune font sizes for Hanzi, Pinyin, and translations independently.

---

## 🔒 Privacy & Security

We believe your notes and thoughts belong solely to you:

* 🛡️ **100% Local Dictionary Queries**: Words are looked up entirely inside your local vault. No note content, text selections, or keystrokes are ever sent to an external server.
* 📁 **Your Data Stays Yours**: Your personal vocabulary is written to standard Markdown in your vault. It will never be locked into proprietary formats and will remain readable forever.
* 🚫 **Zero Telemetry**: No trackers, no cookies, no analytics.
* 🌐 **External Connections**:
  1. **Google TTS API** (`translate.google.com`): When the audio button is clicked, an audio stream is fetched for the selected word. You can switch to **Web Speech API** in settings for 100% offline pronunciation.
  2. **CEDICT Database Download**: On first run, the plugin downloads the offline dictionary database (`cedict.json`, ~42 MB) from GitHub Releases and caches it in your plugin folder for lifetime offline use.

---

## 📺 Free Chinese Video Courses by Author

Learn Chinese for free with structured video courses created by the author of this plugin:

| Channel | Language | Description & Content | Link |
| :--- | :---: | :--- | :---: |
| **Chinese with Kantulaev** | 🇬🇧 English | Free comprehensive Chinese video courses from beginner to fluent: pronunciation, tones, character stroke order, and grammar. | [**@ChineseWithKantulaev**](https://www.youtube.com/@ChineseWithKantulaev) |
| **Курсы китайского языка** | 🇷🇺 Русский | Бесплатные пошаговые видеоуроки китайского языка с нуля: фонетика, ключи Канси, разбор уровней HSK и живая разговорная речь. | [**@kantulaevCN**](https://www.youtube.com/@kantulaevCN) |

---

## 📜 Credits & Licenses

* **[CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cedict)**: Licensed under [Creative Commons Attribution-Share Alike 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
* **[Pleco Software](https://www.pleco.com/)**: Hand-curated Cantonese readings database.
* **[CC-Canto](https://cantonese.org/)**: Additional colloquial Cantonese vocabulary.
* **[Rime Cantonese](https://github.com/rime/rime-cantonese)**: Frequency and phonetic mappings.

---

## 📄 License

Distributed under the [MIT License](LICENSE). Built with ❤️ for the Chinese learning community.
