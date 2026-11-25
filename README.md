# 🏮 Chinese Popover Dictionary for Obsidian

<p align="center">
  <img src="./assets/preview.svg" alt="Chinese Popover Dictionary Preview" width="100%" />
</p>

<p align="center">
  <a href="https://obsidian.md"><img src="https://img.shields.io/badge/Obsidian-v1.5%2B-7C3AED?logo=obsidian&logoColor=white" alt="Obsidian v1.5+" /></a>
  <a href="https://github.com/Kantulaev/obsidian-chinese-popover/releases"><img src="https://img.shields.io/badge/Release-2.3.4-blue.svg" alt="Version 2.3.4" /></a>
  <a href="https://www.youtube.com/@ChineseWithKantulaev"><img src="https://img.shields.io/badge/YouTube-@ChineseWithKantulaev-FF0000?logo=youtube&logoColor=white" alt="English YouTube Channel" /></a>
  <a href="https://www.youtube.com/@kantulaevCN"><img src="https://img.shields.io/badge/YouTube-@kantulaevCN-FF0000?logo=youtube&logoColor=white" alt="Russian YouTube Channel" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" /></a>
  <img src="https://img.shields.io/badge/Dialects-Mandarin%20%2B%20Cantonese-emerald.svg" alt="Mandarin + Cantonese" />
  <img src="https://img.shields.io/badge/Offline%20Dicts-21%20Packs-orange.svg" alt="21 Offline Dictionary Packs" />
  <img src="https://img.shields.io/badge/Reverse%20Lookup-20%20Languages-blue.svg" alt="20 Languages" />
  <img src="https://img.shields.io/badge/SRS-SM--2%20Flashcards-8b5cf6.svg" alt="SRS SM-2" />
</p>

<p align="center">
  <b>Instant Chinese popup dictionary, translator, and language-learning suite for Obsidian.</b><br/>
  Built with a frosted <b>Liquid Glass</b> interface, simultaneous <b>Mandarin Pinyin</b> &amp; <b>Cantonese Jyutping</b>, <b>Instant Reader Mode</b>, <b>214 Kangxi radicals anatomy</b>, <b>21 offline dictionary packs</b> (CC-CEDICT, БКРС, CC-Canto, HanDeDict, CFDICT), <b>20-language reverse lookup</b>, <b>HSK 1–6 analysis</b>, and <b>Spaced Repetition (SRS)</b> flashcards.
</p>

---

## 💎 Minimalist Liquid Glass Popover & Reader Mode

<p align="center">
  <img src="./assets/feature-popover.svg" alt="Minimalist Liquid Glass Popover" width="100%" />
</p>

* **Liquid Glass Design** — Compact frosted squircle card (`auto`, `glass_dark`, `glass_light`, and `solid` themes) with adjustable blur, font scale, draggable header, resizable bounds, and pin/sticky toggle.
* **Instant Reader Mode** — Zero-delay hover translation designed for effortless reading: triggers strictly over Chinese characters (ignoring surrounding whitespace and non-CJK text) and optionally applies a dedicated reading font (e.g., HSK Exam KaiTi 楷体 or LXGW WenKai) that automatically restores your editor typography when turned off.
* **Isolated Hanzi Typography Engine** — Custom Chinese font presets (`KaiTi 楷体`, `SongTi 宋体`, `HeiTi 黑体`, `FangSong 仿宋`, `LXGW WenKai 霞鹜文楷`, or any system/custom font) apply selectively to Chinese glyphs (`.ch-dict-hanzi-run`) without altering Latin, Cyrillic, or Pinyin spacing.
* **Simultaneous Mandarin & Cantonese** — View Pinyin and Cantonese Jyutping side by side, hear neural pronunciation (Google Neural TTS or offline Web Speech API), and combine standard English (`CC-CEDICT`) with Cantonese colloquialisms & grammar recognition (`XY唔XY`, `X唔X`, aspect markers `緊 / 咗 / 過`).
* **Pleco-Style Tone Coloring & Structured POS** — Optional tone coloring (tones 1–4 + neutral), grammar labels (noun, verb, adjective, measure word, idiom), traditional/simplified display, and subtle HSK `1`–`6` badges.
* **214 Kangxi Radicals & Component Breakdown** — Click any character to inspect its Kangxi radical, stroke count, core meaning, and structural components.

---

## 🌐 21 Offline Dictionaries & 20-Language Reverse Lookup

Translate both **Chinese → target language** and **native word → Chinese (reverse lookup)** across downloaded offline dictionaries directly inside your notes—including Russian (БКРС), English (CC-CEDICT), Cantonese (粵語), German (HanDeDict), French (CFDICT), Spanish, Japanese (MJdic), Korean, Vietnamese (Hán-Việt), and 12 more languages.

<details>
<summary><b>Browse all 21 downloadable offline dictionary packs &amp; corpora</b></summary>

| Language | Native Name / Script | Corpus / Source | Entries | Approx. Size |
| :--- | :--- | :--- | :---: | :---: |
| **English** | English (`CC-CEDICT`) | CC-CEDICT Open Corpus | 122,000+ | ~42.3 MB |
| **Cantonese** | 廣東話 / 粵語 (Jyutping) | Hong Kong Cantonese Corpus &amp; Jyutping Lexicon | 231,000+ | ~17.3 MB |
| **Russian** | Русский (БКРС) | Большой китайско-русский словарь | 470,000+ | ~33.6 MB |
| **French** | Français (`CFDICT`) | CFDICT &amp; C+DICT | 515,000+ | ~25.9 MB |
| **Spanish** | Español | Gran Diccionario Chino-Español (`CEDICT-ES`) | 475,000+ | ~24.2 MB |
| **Japanese** | 日本語 (中日辞書) | MJdic Open Japanese Corpus &amp; C+DICT | 465,000+ | ~23.8 MB |
| **Portuguese** | Português | Dicionário Chinês-Português C+DICT | 455,000+ | ~23.1 MB |
| **Korean** | 한국어 (한중사전) | CC-CPLUSDICT Korean &amp; Hanja Lexicon | 365,000+ | ~18.9 MB |
| **Italian** | Italiano | Dizionario di Cinese Moderno &amp; HSK | 315,000+ | ~12.7 MB |
| **Indonesian** | Bahasa Indonesia | Kamus Lengkap Mandarin-Indonesia C+DICT | 300,000+ | ~16.1 MB |
| **Dutch** | Nederlands | Chinees-Nederlands Handwoordenboek &amp; HSK | 290,000+ | ~11.2 MB |
| **Simplified Chinese** | 现代汉语规范释义 (`新华字典`) | 现代汉语词典 / 新华字典语料库 | 287,000+ | ~18.0 MB |
| **Traditional Chinese** | 國語辭典 / 繁體注釋 | 國語辭典教育部修訂版 | 287,000+ | ~18.0 MB |
| **Polish** | Polski | Praktyczny słownik chińsko-polski &amp; HSK | 279,000+ | ~11.2 MB |
| **Thai** | ไทย | พจนานุกรมจีน-ไทย C+DICT | 255,000+ | ~25.7 MB |
| **German** | Deutsch (`HanDeDict`) | HanDeDict Chinesisch-Deutsches Wörterbuch | 246,000+ | ~13.2 MB |
| **Ukrainian** | Українська | Сучасний китайсько-український словник | 214,000+ | ~10.9 MB |
| **Vietnamese** | Tiếng Việt (`Hán-Việt`) | Từ điển Hán-Việt (`CVDICT`) | 194,000+ | ~12.9 MB |
| **Arabic** | العربية | القاموس الصيني العربي الحديث &amp; HSK | 155,000+ | ~7.9 MB |
| **Turkish** | Türkçe | Kapsamlı Çince-Türkçe Sözlük &amp; HSK | 129,000+ | ~5.5 MB |
| **Hindi** | हिन्दी | आधुनिक चीनी-हिन्दी शब्दкоश | 39,000+ | ~2.1 MB |

</details>

* **Full 20-Language UI** — Settings tabs, tooltips, grammatical labels, and controls localize into 20 languages automatically (`auto` detects Obsidian's interface language).

---

## 📚 Study Ecosystem, Flashcards & Zettelkasten

<p align="center">
  <img src="./assets/feature-study.svg" alt="Study Ecosystem, Vocabulary Book and SRS" width="100%" />
</p>

* **Markdown Vocabulary Notebook** — Star any entry (`⭐`) to append it to `Chinese Vocabulary.md` with Hanzi, phonetic reading, definition, and automatically captured context sentence.
* **Spaced Repetition Flashcards (SM-2 SRS)** — Review saved words right inside Obsidian's sidebar with active recall practice (`Again 1d`, `Hard 3d`, `Good 7d`, `Easy 14d`) and Due Queue filtering.
* **Atomic Zettelkasten Word Notes** — Generate dedicated Markdown vocabulary notes in your chosen folder for deep character study and graph linking.
* **AnkiConnect Sync, Anki TSV & Pleco Export** — Push starred words straight to desktop Anki via AnkiConnect, export `.tsv` spreadsheets for Anki, or generate `.txt` flashcard decks for Pleco on iOS and Android.

---

## 🖌️ Calligraphy, Ruby Furigana & HSK Analyzer

<p align="center">
  <img src="./assets/feature-tools.svg" alt="Stroke Order, HSK Analyzer, Reader Mode and Worksheets" width="100%" />
</p>

* **Spotlight Dictionary Search** — Fast modal search across Hanzi (`你好`), numbered or accented Pinyin (`ni3hao3` / `nihao`), Cantonese Jyutping (`nei5hou2`), and reverse translations across active offline packs.
* **Animated Stroke Order (笔顺)** — Step-by-step vector calligraphy stroke animation with multi-character tabs and speed control.
* **Printable Calligraphy Worksheets (米字格)** — Build custom practice grids from your saved vocabulary for printing or PDF export.
* **Text Difficulty & HSK Analyzer** — Measure HSK 1–6 vocabulary breakdown, character uniqueness, and estimated CEFR difficulty for any selection or entire note.
* **Ruby Annotations (`<ruby>`) & Simplified ↔ Traditional Converter** — Insert inline Pinyin or Jyutping furigana over selected Hanzi, or convert notes and selections between Simplified (`简体`) and Traditional (`繁體`) characters in one command.

---

## 🚀 Installation

### Community Plugins Directory
1. Open Obsidian **Settings** → **Community plugins**.
2. Disable **Restricted mode**.
3. Click **Browse**, search for **Chinese Popover Dictionary**, click **Install**, and click **Enable**.

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest [GitHub Release](https://github.com/Kantulaev/obsidian-chinese-popover/releases).
2. Copy those files into your vault at:
   ```text
   <YourVault>/.obsidian/plugins/chinese-popover-dict/
   ```
3. Restart Obsidian (or reload plugins) and enable **Chinese Popover Dictionary**.
4. *(Optional)* Download offline dictionary packs directly inside the plugin settings under **Offline Dictionaries** (English `CC-CEDICT` downloads automatically on first start).

---

## ⌨️ Controls, One-Key Shortcuts & Command Palette

### Active Popover Shortcuts
When the dictionary card is open (and cursor is not typing inside an input/editor, configurable via **Enable Popover Hotkeys**):

| Key | Action |
| :---: | :--- |
| <kbd>Space</kbd> / <kbd>R</kbd> | Pronounce current word in active dialect (Mandarin / Cantonese) |
| <kbd>S</kbd> | Star / unstar current word to Vocabulary Notebook |
| <kbd>N</kbd> | Create Zettelkasten atomic word note |
| <kbd>C</kbd> | Copy formatted card to clipboard |
| <kbd>P</kbd> | Pin / unpin (sticky) popover window |
| <kbd>Escape</kbd> | Force close popover |

### Command Palette Commands
All **24 commands** can be triggered from the Command Palette (<kbd>Ctrl/Cmd</kbd> + <kbd>P</kbd>) or assigned custom hotkeys under **Settings → Hotkeys**:
* Look up word under cursor or selection • Spotlight Quick Dictionary Search • Toggle Reader Mode • Toggle Chinese Dictionary
* Pronounce active word • Speak Selected Text (TTS) • Switch Dialect (Mandarin ↔ Cantonese) • Cycle Phonetic Display (Both / Pinyin / Jyutping / Auto)
* Open Vocabulary Sidebar • Star / unstar active word • Create Word Note (Zettelkasten) • Analyze Text Difficulty & HSK
* Show Stroke Order Animation • Print Calligraphy Worksheets (米字格)
* Add Ruby Pinyin / Add Ruby Jyutping (`<ruby>`) • Convert to Traditional (`繁體`) / Convert to Simplified (`简体`)
* Export Vocabulary to Anki TSV • Sync to AnkiConnect • Export Pleco Flashcards (`.txt`) • Copy active word card • Toggle Pin Popover • Close Popover

---

## 🔒 Privacy & Network Usage

* 🛡️ **Local Vault Lookups** — All note parsing, word matching, reverse dictionary queries, and HSK analysis run locally inside Obsidian. Your notes and selections are never uploaded to external servers.
* 📁 **Markdown-First Storage** — Your saved vocabulary lives in standard Markdown inside your vault.
* 🚫 **Zero Telemetry** — No tracking, analytics, or ads.
* 🌐 **Optional Network Calls** — Used only to download offline dictionary JSON files (`raw.githubusercontent.com` / `cdn.jsdelivr.net`), sync cards to your local AnkiConnect (`localhost`), or fetch audio if you choose **Google Neural TTS** (you can switch to offline **Web Speech API** anytime in Settings).

---

## 📺 Free Video Courses by Author

Learn Chinese step by step with free structured video lessons created by the author:

| Channel | Language | Topics Covered | Link |
| :--- | :---: | :--- | :---: |
| **Chinese with Kantulaev** | 🇬🇧 English | Beginner to fluent Mandarin courses: tones, Pinyin, stroke order, grammar, and listening practice. | [**@ChineseWithKantulaev**](https://www.youtube.com/@ChineseWithKantulaev) |
| **Курсы китайского языка** | 🇷🇺 Русский | Пошаговые видеоуроки китайского языка: фонетика, тоны, ключи Канси, HSK и разговорная практика. | [**@kantulaevCN**](https://www.youtube.com/@kantulaevCN) |

---

<details>
<summary><b>🇷🇺 Краткое описание плагина на русском языке</b></summary>

**Chinese Popover Dictionary** — быстрый всплывающий словарь китайского языка для Obsidian в стиле Liquid Glass с поддержкой путунхуа (пиньинь) и кантонского диалекта (ютпинг):

* **Мгновенный перевод в Режиме чтения (Reader Mode)**: наведите курсор на китайское слово — карточка появляется без задержки, срабатывает строго на китайских иероглифах и поддерживает отдельный шрифт чтения с автовозвратом при выключении.
* **Кантонский + Путунхуа одновременно**: живое совмещение основного словаря (`CC-CEDICT` или `БКРС`) и кантонского лексикона (`dict-yue.json`), распознавание кантонских грамматических конструкций и озвучка обоих диалектов.
* **Изолированные китайские шрифты**: выберите учебный `KaiTi (楷体)`, `SongTi`, `HeiTi`, `FangSong`, `LXGW WenKai` или системный шрифт — меняется только китайский текст, без поломки русского, английского и пиньиня.
* **21 офлайн-словарь и обратный перевод на 20 языках**: включая Большой китайско-русский словарь (БКРС — 470 000+ статей), `CC-CEDICT`, `CFDICT`, `HanDeDict`, `MJdic`, японский, корейский, вьетнамский и др. Обратный перевод работает по всем загруженным словарям с русского, английского и других языков.
* **Учёба и повторение (SRS)**: сохранение слов со звёздочкой `⭐` в `Chinese Vocabulary.md`, встроенные карточки интервального повторения SM-2, заметки Zettelkasten, синхронизация с Anki / Pleco, порядок черт, 214 ключей Канси, раскраска тонов, пиньинь/ютпинг над иероглифами (Ruby), конвертер `简体 ↔ 繁體`, прописи `米字格` и анализатор сложности текста по HSK 1–6.

</details>

---

## 📜 Credits & License

* **[CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cedict)** — Licensed under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
* **[CC-Canto](https://cantonese.org/)** & **[Pleco Software](https://www.pleco.com/)** — Colloquial Cantonese vocabulary and hand-curated readings.
* **[Rime Cantonese](https://github.com/rime/rime-cantonese)** — Cantonese frequency and phonetic mappings.
* **Open Multilingual Corpora** — БКРС (Russian), HanDeDict (German), CFDICT (French), CEDICT-ES (Spanish), MJdic (Japanese), CVDICT (Vietnamese), 现代汉语词典 / 國語辭典.

Released under the [MIT License](LICENSE). Built for Chinese & Cantonese learners using Obsidian.
