# 📘 Caveman Writer Studio — Beginner's Guide

*Ένας απλός οδηγός στα ελληνικά και στα αγγλικά.*

Welcome! This is a **one-file writing studio**. You paste ideas, it builds a smart prompt for any AI (Claude, ChatGPT, Gemini…), and you manage the whole book — chapters, continuity, review, weekly rhythm — all in your browser. **Nothing leaves your computer.**

---

## 🚀 The 3-step start (30 seconds)

1. **Get an idea** — click **🎲 Spark** (card 3): it builds a spark prompt for your AI that returns ONE fresh, original idea (premise, hero, title, world, themes) with genre-aware naming *and* the author's craft (precise opening, “it must smell”, the thing that remembers). Copy it to your AI, paste the answer back into the spark box, press **⤵ Load** — the brief fills itself. Or paste your own premise. No idea at all? Load a **demo** (card 5: the demo picker → ✦) — «Το Πάρκο που Θυμάται» is the sealed 5-act retro-liminal brief, «Η Γέφυρα των Ψιθύρων» the original horror novella. If you have an unfinished story, use the **📖 Extender** tab later.
2. **Pick a voice** — click **🧠 My profile** (card 2) to write like the house style, or tick one or more of the **19 masters**.
3. **Copy the prompt** — press **⧉ Copy prompt** (top of the right column), paste it into any AI, and let it write Chapter 1.

Then paste the AI's chapter into **📚 Manuscript** (the tools tab) and press **✓ Done → story state**.

> 🎬 The **"Start here — 3 steps"** card at the top of the right column does all three with one click each.

---

## 🧭 The layout

**Left column — the brief** (what you tell the AI):
1. **Work format** — Novel / Novella / Serial, title, target words, genre, POV, tense, register, pacing, ending, *co-author*.
2. **Inspiring authors** — 19 masters, multi-select, + 🧠 My profile.
3. **The story** — premise, hero, world, themes, plus **advanced groups** (▼ Character sheet, Story bible, Glossary/voice, Blog-style generator).
4. **Caveman protocol** — how lean the AI's commentary is (Full is the sweet spot).

**Right column — the work**:
5. **Your prompt** — live, ready to copy (choose EN/ΕΛ, brief density Light/Standard).
6. **How it works** — quick explainer.
7. **Writing tools** (one tabbed panel):
   - 🎬 **Scene tools** — beat sheets, titles, voice samples, reader-sim, hooks, promises, pitch, word counter
   - 🔍 **Reviewer** — proofread + critique any draft
   - ⚡ **Booster** — next-chapter continuation prompt
   - 📖 **Extender** — unfinished story → full novel plan
   - 🧠 **Memory & ideas** — story state, idea inbox, book-bible export
   - 📚 **Manuscript** — your chapters, chart, dictation, weekly rhythm, costs

**Header** — theme (🌙/📜/🌲), language (EN/ΕΛ), compact ⚡, focus ⛶, **book switcher**, 📘 Guide.

---

## 🛠 The 5 power features (added v15)

### 1 · 📊 Words-per-chapter chart (Manuscript tab)
A bar chart shows every chapter's word count against the chapter target — see at a glance which chapters are thin or bloated.

### 2 · 📚 Multi-book switching (header)
The book selector in the header lets you keep **several books at once**. Each book keeps its own brief, chapters, story state, glossary, bible and usage.
- **+** button → new book (give it a name).
- Select another book → everything switches.
- Each book autosaves separately; export each with **💾 Save book (.json)**.

### 3 · ☁️ Backup / full-book export
**💾 Save book (.json)** exports *everything* — brief + chapters + memory + settings. **📂 Load book** restores it. This is your real backup.

**🔗 Cloud sync (link-based)** — in 🧠 Memory & ideas, **Share book via link** encodes the whole book into a URL. Open that link on another device and the book loads there (it asks for confirmation). No server, fully private — it's just a link. For very large books, use the .json export instead.
**💾 Save book (.json)** exports *everything* — brief + chapters + memory + settings. **📂 Load book** restores it. This is your real backup (localStorage can be cleared by the browser). There is no cloud server — by design, your writing stays private.

### 4 · 🎤 Dictation (Manuscript tab)
Press **🎤 Dictate** and speak — your words are transcribed into the current chapter (Greek or English, matching the app language). Works in Chrome/Edge; press again to stop. Great for drafting while walking or thinking aloud.

### 5 · 👥 Co-author mode (card 1, advanced)
Two narrators, alternating on a schedule:
- Enable **co-author rotation**, pick **Narrator A** and **Narrator B** (each a POV), and how often to switch (every N chapters).
- Continuation and extension prompts automatically tell the AI *which* narrator is up and to keep the two voices distinct.

---

## 🧠 Daily workflow (the loop)

1. **Boost**: after a chapter, in ⚡ Booster paste a 1-line recap → ⚡ Generate → paste into your AI.
2. **Review**: when a draft feels off, paste it into 🔍 Reviewer → 🔍 Generate review prompt → your AI finds errors + style + consistency, then gives you a human checklist.
3. **Save as chapter**: the corrected text → **📖 Save as chapter** lands in the Manuscript tab.
4. **Done → story state**: each finished chapter is logged into the running memory, which flows into the next continuation automatically. The AI never forgets.
5. **Rhythm**: set your weekly target in the Manuscript tab — see your pace and projected finish date.

---

## 🗺 Book status + Re-brief (v17)
- **Book status mini-map** — under the chapter chips in 📚 Manuscript: each chapter shows ✏ draft / 👁 reviewed / ✓ final. Click a chip to cycle. Pressing **✓ Done → story state** auto-marks the chapter reviewed. Status is saved with the book.
- **🔁 Re-brief the whole book** — one click builds a full-context prompt: story bible + glossary + character sheet + story state + **every chapter so far**. Paste it into your AI whenever it seems to have "forgotten" the book or you want to resume after a break.
- **Keyboard** — press **Alt+1…6** to jump between the six tool tabs.

## 🎯 Word goals + chapter search (v18)
- **Goal (words)** field in 📚 Manuscript — set a per-chapter target (default: your format's chapter size). The chart bars and the stats line use it (`words / goal`).
- **Search chapters** field above the chapter list — filters instantly by title/text.

## 🛡 Reliability
- The app is hardened so it **never breaks**: if a control is ever missing it becomes a no-op instead of crashing; unexpected errors show a friendly notice (your work is always autosaved); storage-full shows a clear warning.
- Developers: run `node tests/bullet.js` — 92 checks across 5 angles (syntax, structure, functional, robustness, regression).

## 🔍 Finding a master + writing in English (v19)
- **Author search** — above the masters grid, type a name or a technique (e.g. "lovecraft", "διάλογος", "voice") to filter the 19 cards instantly. The counter shows how many match and how many are selected; **✕ Clear all** empties the selection.
- **Deliverable language** — in the prompt card, choose **Greek or English** for the book itself. This is independent of the UI language: keep the interface in ΕΛ or EN, and the *novel* is written in whichever you pick. The language guard, role, continuation and extender all adapt automatically.

## ⚡ Build from ingredients (v22) — no idea?
At the top of the left column: pick **what kind of story** (cosmic horror · high fantasy · post-apocalyptic · environmental SF · gothic · noir · mythic fairy tale · mirror/psychological), a **mood**, a **setting**, and any **elements** you want in it (e.g. "a whispering bridge", "elves and orcs fighting for the land"). Press **🧠 Build my brief** — the app fills title, world, hero, antagonist, plot, names (genre-matched: high fantasy & mythic → invented names and places like Μάρεςταν/Ξαναντού/Δυρρών; noir & gothic → everyday Greek names and real places), glossary and lore, and regenerates the prompt. No idea at all? **🎲 Surprise me**.

## 🏷 Imaginative naming + Mythos (v21)
- **🏷 Names & places** (Blog-style card) — **v2**: one click builds a crafted prompt for your AI with the genre's naming discipline (high fantasy / dark fantasy / mythic / fairy tale → invented, internally consistent names (Calethir, Orynthas…) and places (Marestan, Xanandou, Dyrron, Eldara…); realistic Greek genres → everyday Greek names (Δημήτρης, Νεφέλη…) and real places (Athens, Arachovis st., a mountain town); sci-fi / post-apocalyptic → western + invented). Paste the answer back → **⤵ Load**. The **🎲 Local roll (offline)** chip keeps the old no-AI roll (same genre-aware register, no genre set → rolls freely and tells you which style it used).
- **🏷 Names & places v2 + 🧬 Character v2** — the spark technique for cast & world: 🏷 builds a crafted prompt (genre-aware naming + the world's register) → your AI returns 3 people, 3 places, 1 object + glossary → paste back, **⤵ Load** (places go to *World*, cast to *Hero/Antagonist*, glossary merges). 🧬 does the same for the character sheet (wound/want/fear/arc/voice/secret + 3–4 lines of pure dialogue, which land in *Extra* as voice samples). Both keep a **🎲 Local roll (offline)** chip as the no-AI fallback.
- **📖 EPUB / 🖨️ PDF** (Manuscript tab) — the whole manuscript as a real EPUB e-book (dependency-free, opens in any e-book reader), or a print-ready A4 manuscript layout → “Save as PDF” from the print dialog. The way you hand a book to an editor now.
- **📓 Short story format** (card 1) — 3–7 acts × ~1,200 words for the standalones (Μύηση, Ο Δυρρών, Μαρεστάν territory); the brief says “one world, one cast, one thread” and closes on an image-ending.
- **🌍 Expand mythos & world** (Memory tab) — a prompt that expands ancient history, 5 named places, institutions, the rules of the strange, and the unspoken secret. Feeds from the new **Lore** field, which is also injected into every brief.
- **Character background** — every brief now asks for a solid origin: family, the day that changed everything, livelihood, a keepsake, the line they'd never cross.

## 🎨 Themes & clarity (v20)
- **📜 Parchment (default, light)** is tuned for clarity: white input fields on warm paper, deeper text, clearer borders and selected states.
- **🌙 Night / 🌲 Forest** are dark options for low-light writing.
- Every selected control (tab, chip, level, author card) now fills with the accent colour so it's obvious what's active; keyboard users get a visible focus ring.
- Switch anytime from the header — the choice is remembered.

## 🎨 Comfort settings

- **Theme** — 🌙 Night (dark) · 📜 Parchment (light, default) · 🌲 Forest (muted dark)
- **⚡ Compact** — denser layout for small screens / power users
- **⛶ Focus** — hide everything but the tools card, for pure writing; **Esc** exits
- **Collapsible cards** — every card header has a −/+ toggle; ⊟/⊞ collapse/expand all
- **Brief density** — Light (for small/local models) or Standard (full detail)

---

## ❓ FAQ

**Does it send my writing anywhere?** No. It's 100% offline; the only "AI" part is the *prompt you copy* — you paste it into your own AI service, and your chapters never leave your browser.

**I lost my book!** Check your browser's localStorage wasn't cleared; if you exported a `.json`, **📂 Load book** restores everything. Export regularly.

**Which AI should I use?** Any chat model (Claude, ChatGPT, Gemini, Grok). If you use a coding agent with files (Claude Code, Codex), pick **"📁 Workspace files"** in Deliverable mode.

**The AI refused / said files are missing?** That was the old bug — the brief now has a **SELF-CONTAINMENT** rule: "never refuse, never ask for the seed again." If a model still refuses, just say: *"No files needed — generate from the brief alone."*

**Can it write in English?** Yes — the app is bilingual; the AI writes in whichever language the brief says (the deliverable is Greek by default; switch UI to EN for an English brief, and use the density/voice settings).

---

## 🔍 Troubleshooting

| Problem | Fix |
|---|---|
| Changes lost on reload | Check browser storage isn't in private/incognito; export `.json` often |
| Dictation button does nothing | Use Chrome/Edge; mic permission must be allowed |
| Prompt looks too long | Set **Brief density → Light** |
| Too many controls | Use ⚡ Compact + collapse cards + Focus mode |
| Can't find a feature | 🩺 Self-check (footer) reports version/ids — tell me the version |
