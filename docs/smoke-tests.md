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

## 2026-07-22 — Experimental lessons awaiting enabled Chrome access

Writer, Rewriter, and Proofreader were implemented against the current official
Chrome developer-trial contracts. Deterministic fixtures collectively cover
absent and in-progress capability states, user-triggered download progress,
session reuse and replacement, cancellation, output, errors, and cleanup.
Feature-specific tests also cover editable Writer output, immutable Rewriter
options, and structured Proofreader corrections.

A real enabled-Chrome smoke test remains intentionally pending. When suitable
trial or Early Preview Program access is available, record the Chrome version,
operating system, enabled flags or trial token, initial capability state, and a
non-empty or structured result for each production adapter here.

## 2026-11-10 — Documentation refresh and Prompt extensions

- URL: http://127.0.0.1:5173/#playground/prompt
- Browser: desktop Google Chrome, user agent Chrome/156.0.0.0 on Macintosh.
  The reduced UA reports Mac OS X 10_15_7; this is not evidence of the actual OS
  version or hardware eligibility. No flags, permissions, or extensions were
  changed for this run. Existing profile flags/trial enrollment were not audited.
- Prompt text: English; availability reported ready/available.
- Structured extension: ran through the React form with the default workshop
  feedback; returned mixed sentiment and a non-empty summary. Application JSON
  validation succeeded.
- Streaming extension: ran through the React form; completed with non-empty
  text. A second invocation was canceled and visibly reported Request canceled,
  preserving incomplete output as partial text.
- Image extension adapter: imported the production adapter in DevTools, checked
  image availability, and created a native session. A generated local 200×200 red
  canvas blob prompted the answer Red. The session was destroyed in finally.
  This verifies native adapter inference, not the OS file-picker flow.
- WebMCP imperative: discovered addTodo with document.modelContext.getTools and
  invoked executeTool with an object argument. The local list visibly gained
  an agent-labelled item and displayed the same returned confirmation.
- Native verification exposed a stale registration rejection during effect
  cleanup. Aborted registrations are now ignored; reload showed idle without
  the spurious error, and the native tool invocation succeeded.

Deterministic tests cover malformed structured output, image declarations and
argument forwarding, streaming cancellation, session destruction, and aborted
WebMCP registration. They do not measure model quality or agent tool selection.
The declarative workflow and the other native model lessons were not rerun in
this refresh. Their earlier records above retain their original scope/date.
A real autonomous-agent evaluation remains separate from manual DevTools calls.

The public origin returned HTTP 200 and tools=(self) on 2026-11-10, without an
Origin-Trial response header. No deployment was performed; production trial
console enrollment and any HTML-provided token remain unverified.

## 2026-11-11 — Breakout workshop verification

- The pre-workshop baseline is commit `a5b6136`; the workshop is isolated on
  `workshop`.
- Participant files live in `src/workshop/exercises/`, complete native
  references in `solutions/`, prepared React code in `ui/`, and checks in `tests/`.
- Deterministic tests verify three-tab navigation, visible exercise paths,
  unfinished-code versus absent-global feedback, progress, cancellation, and
  protection against late output after cancellation or unmount.
- Complete solutions are tested with fake native factories for capability and
  creation options, progress forwarding, results, and destruction after success,
  errors, and cancellation. Each request owns its session and destroys it in
  finally. The exercise files import no project helpers.
- Starter TODOs now require participants to write feature detection, native
  availability, creation, monitoring, operation, and cleanup. Complete solutions
  recheck capability before execution and do not create unavailable sessions.
- Native Chrome inference and device eligibility were not rerun. The previous
  native records retain their original dates and scope.

Prompt workshop image and streaming extensions have matching independent native
solutions. Deterministic checks cover image modality options and File forwarding,
stream accumulation, cancellation, cleanup, partial output, and abort on choice
switch. This does not add a native Chrome run.

Participant acceptance checks use `npm run check:exercises`, with optional
`-t` filters documented in README. The same test file validates references during
`npm test` and imports the actual starters in exercise-check mode. Unfinished
starters were confirmed to fail. Each of the five filters was then confirmed to
pass with only its corresponding section filled from the reference, and all
starter TODOs were restored afterwards. These checks remain simulated native API
contracts, not a new native Chrome run.
