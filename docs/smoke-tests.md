# Supported-Chrome smoke tests

Automated fixtures verify application behavior, but compatibility evidence must come from the production adapters in a real supported browser.

## 2026-07-16 — Phase 1

- URL: `http://127.0.0.1:5173/`
- Browser: Headless Chrome 150.0.0.0
- Operating system reported by the browser: macOS (`MacIntel`)
- Explicit flags or trials: none supplied to the browser run
- Language pair: German (`de`) to English (`en`)
- Prompt and summarizer language: English (`en`)

Initial capability states reported by the production adapters:

| API | Initial state | Result |
| --- | --- | --- |
| Translator | `downloadable` | Passed after user-triggered language-pack download; returned a non-empty English translation. |
| Language Detector | `available` | Passed; returned confidence-ranked Spanish, Catalan, and Galician candidates. |
| Summarizer | `downloadable` | Passed after user-triggered model download; returned three non-empty plain-text key points. |
| Prompt / `LanguageModel` | `downloadable` | Passed after model preparation; returned a non-empty English explanation. |

The initial Phase 1 visual verification confirmed that all four lessons and their labeled controls rendered with no Vite error overlay.

### Presentation navigation follow-up

The same browser environment was used after replacing the long page with tabs. Visual and interaction checks confirmed:

- four visible lesson tabs and exactly one mounted tab panel;
- Translator is selected on initial load;
- clicking Summarizer or Prompt replaces the lesson panel without changing the page's scroll position;
- the sticky tab bar remains available after scrolling within a lesson;
- no Vite error overlay appears.
