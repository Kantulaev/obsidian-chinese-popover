# Chinese Popover Dictionary for Obsidian

An elegant Apple Liquid Glass Chinese popover dictionary for Obsidian. Look up Chinese characters, words, and idioms with dual **Mandarin Pinyin** and **Cantonese Jyutping**, high-quality audio pronunciation, and concise definitions.

---

## ✨ Features

- **Double-Click & Hover Lookup**: Instantly look up Chinese words in both Live Preview (editing mode) and Reading View.
- **Apple Liquid Glass Aesthetic**: Translucent frosted glass squircle popover with dynamic blur and smooth animations.
- **Dual Phonetics**: Displays tone-marked Pinyin alongside Cantonese Jyutping (`nǐ hǎo / nei5 hou2`).
- **Simplified & Traditional Hanzi**: Displays both Simplified and Traditional forms side-by-side in equal font size.
- **Authentic Audio Pronunciation**:
  - **Cantonese** (`廣東話`): Native Hong Kong neural voice.
  - **Mandarin** (`普通话`): Native Putonghua neural voice.
  - Adjustable speech speed (0.5x – 1.4x, default 0.8x for clear tone perception).
  - Offline fallback via Web Speech API.
- **Comprehensive Vocabulary**: Built on CC-CEDICT (118,000+ entries) combined with Pleco's hand-curated Cantonese readings (104,000+ words), CC-Canto, and Rime Cantonese.
- **Editor Margin Protection**: Smart layout engine prevents the popover from overflowing into Obsidian's empty side margins when "Readable line length" is enabled.
- **Deep Customization**:
  - Trigger modes: Double-click, Hover with modifier key (Alt, Shift, Ctrl, Cmd), Hover always, or Hotkeys only.
  - Appearance: Liquid Glass Dark, Liquid Glass Light, or Solid Minimalist themes; customizable popover width, height, blur intensity, and font sizes.
  - Phonetic display modes: Both, Pinyin only, Jyutping only, or Auto by dialect.
- **Keyboard Shortcuts**: Assign hotkeys to look up the word under the cursor, pronounce the active word, copy dictionary cards, or switch dialects instantly.

---

## 🚀 Installation

### Via Obsidian Community Plugins (Recommended)
1. Open **Settings** > **Community plugins** in Obsidian.
2. Turn off **Restricted mode**.
3. Click **Browse** and search for `Chinese Popover Dictionary`.
4. Click **Install**, then **Enable**.

### Manual Installation
1. Download `main.js`, `manifest.json`, `styles.css`, and `cedict.json` from the latest [GitHub Release](https://github.com/Kantulaev/obsidian-chinese-popover/releases).
2. Create a folder named `chinese-popover-dict` in your vault's plugin directory:
   `<vault>/.obsidian/plugins/chinese-popover-dict/`
3. Copy the four downloaded files into that folder.
4. Reload Obsidian, go to **Settings** > **Community plugins**, and enable **Chinese Popover Dictionary**.

---

## 📖 How to Use

1. **Mouse Lookup**: Double-click any Chinese character or word in your notes.
2. **Audio Pronunciation**: Click the Chinese word in the header pill or click the speaker button (🔊) to hear the native pronunciation.
3. **Copy Entry**: Click the clipboard button (📋) to copy the word, phonetics, and translation to your clipboard.
4. **Dismiss**: Press `Escape`, scroll, or click anywhere outside the popover.

### Hotkeys and Command Palette

You can assign custom hotkeys in **Settings** > **Hotkeys** (search for `Chinese Dictionary`):

| Command | Description |
| :--- | :--- |
| **Look up word under cursor or selection** | Opens popover for the active cursor position or selected text |
| **Pronounce active word** | Plays Cantonese or Mandarin audio for the current word |
| **Copy active word card** | Copies the dictionary entry to the clipboard |
| **Switch Dialect** | Toggles between Cantonese and Mandarin |
| **Cycle Phonetic Display** | Cycles between Both, Pinyin only, Jyutping only, and Auto |
| **Toggle Chinese Dictionary** | Enables or disables the dictionary plugin |
| **Close Popover** | Closes the popover window |

---

## ⚙️ Settings Overview

- **Activation & Triggers**:
  - Trigger Mode: *Double Click*, *Hover + Modifier Key* (Alt/Option, Shift, Ctrl, Cmd), *Hover Always*, or *Hotkeys Only*.
  - Hover Delay: 100 ms – 800 ms.
- **Voice & Audio**:
  - Dialect: Cantonese (`zh-yue`) vs Mandarin (`zh-CN`).
  - Audio Engine: Google HD Neural (online) vs Web Speech API (offline).
  - Speech Speed: 0.5x – 1.4x (default: 0.8x).
  - Auto-play Audio on lookup: On / Off.
- **Phonetics & Hanzi**:
  - Phonetic Display: *Both (Pinyin / Jyutping)*, *Pinyin only*, *Jyutping only*, *Auto by dialect*.
  - Tone Marks: Diacritics (`nǐ hǎo`) vs numbers (`ni3 hao3`).
  - Traditional Hanzi: Show/hide, custom separator (` - `, ` / `, ` · `, `( )`).
  - Max Definitions: 1 to 5 words.
- **Appearance & Liquid Glass**:
  - Theme: *Auto*, *Liquid Glass Dark*, *Liquid Glass Light*, *Solid Minimalist*.
  - Text Accent: *Pure White*, *Cyan Glow*, *Warm Gold*, or *Obsidian Theme Accent*.
  - Sizing & Blur: Popover width (260–460 px), height (130–250 px), blur (0–60 px).
  - Font sizes: Hanzi (14–28 px), Pinyin (16–32 px), Translation (12–22 px).
- **Dictionary Database**:
  - Status indicator and manual download / reload button for the 42 MB dictionary database.

---

## 🔒 Privacy & Network Disclosures

This plugin respects user privacy and complies with the Obsidian Developer Policies:

- **Local & Offline Lookup**: All dictionary queries run 100% locally on your device. Your notes, selections, and keystrokes are never sent to any remote server.
- **No Telemetry**: There is zero tracking, analytics, or data collection.
- **Remote Services**:
  - **Google Translate TTS API** (`translate.google.com`): When the audio button or auto-pronounce feature is triggered, an audio stream for the selected word is requested to provide native Cantonese and Mandarin pronunciation. You can switch the audio engine to **Web Speech API** in settings to use offline system speech synthesis without any internet connection.
  - **Dictionary Database Download**: On initial installation, the plugin downloads the pre-built `cedict.json` (42 MB) database from the GitHub Release assets (`github.com/Kantulaev/obsidian-chinese-popover/releases`) and caches it in the plugin directory for local offline use.

---

## 📜 Attribution & Licenses

- **CC-CEDICT**: Licensed under the [Creative Commons Attribution-Share Alike 3.0 License](https://creativecommons.org/licenses/by-sa/3.0/).
- **Pleco CC-CEDICT Cantonese Readings**: Provided by Pleco Software.
- **CC-Canto**: Provided by the Cantodict and Pleco projects.
- **Rime Cantonese**: Data from the `rime-cantonese` project.

## 📄 License

This plugin is open-source software licensed under the [MIT License](LICENSE).

