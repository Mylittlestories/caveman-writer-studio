# Security

**Caveman Writer Studio** runs 100% in your browser. Nothing is sent anywhere:
no accounts, no telemetry, no network calls. All data (brief, chapters, story
state, glossary, bible) lives in your browser's `localStorage` — export
**💾 Save .json** regularly as your backup.

## Reporting a vulnerability
If you find a security issue (e.g., something that could leak local data or
break the sandbox), **do not open a public issue**. Report it privately to the
repository owner. Include the 🩺 Self-check output and a minimal repro.

## Notes
- The app uses no external scripts/fonts; the only network dependency is
  none — it works fully offline.
- Back up `localStorage` via the app's `.json` export; browser data can be
  cleared by the user at any time.
