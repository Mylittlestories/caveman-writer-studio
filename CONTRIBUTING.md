# Contributing to Caveman Writer Studio

Thanks for wanting to help! This is a single-file app, so contributions are focused.

## Ways to contribute
- **Ideas & feedback** — open an issue; tell us what's missing for *your* writing flow.
- **Translations** — improve the Greek or English strings (all labels live in the `STATIC` / `PH` objects inside `caveman-writer-studio.html`).
- **Masters** — propose a new writer profile (name, tag, 6 techniques, EN + ΕΛ) as an issue first.
- **Bug reports** — include the 🩺 Self-check output (footer button) and what you did.

## Local development
1. Open `caveman-writer-studio.html` directly in a browser — no build step (the small `index.html` is just an entry redirect for web serving — it opens the app file automatically).
2. Keep the app **one file, zero dependencies, offline** — that's the contract.
3. Keep the `🩺 Self-check` button working (it reports version, controls, ids).

## Pull requests
- Small, focused changes preferred.
- Verify with: `node --check` on the inline `<script>` (extract it), and test in a real browser (EN + ΕΛ).
- Mention if the change affects saved data (we keep `localStorage` compatible).

MIT licensed — by contributing you agree your work is MIT too.
