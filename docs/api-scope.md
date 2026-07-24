# Chrome AI API Scope

Last reviewed: 2026-07-22.

Chrome built-in AI availability changes across browser versions, operating systems, hardware, language combinations, policies, and experimental programs. Treat this document as a curriculum boundary, not as a permanent compatibility matrix.

Before implementation or compatibility changes, verify the current official documentation at:

- https://developer.chrome.com/docs/ai/built-in
- https://developer.chrome.com/docs/ai/built-in-apis
- https://developer.chrome.com/docs/ai/built-in-ai-dos-donts
- https://developer.chrome.com/docs/ai/translator-api
- https://developer.chrome.com/docs/ai/language-detection
- https://developer.chrome.com/docs/ai/summarizer-api
- https://developer.chrome.com/docs/ai/writer-api
- https://developer.chrome.com/docs/ai/rewriter-api
- https://developer.chrome.com/docs/ai/prompt-api
- https://developer.chrome.com/docs/ai/proofreader-api
- https://developer.chrome.com/docs/ai/webmcp
- https://developer.chrome.com/docs/ai/webmcp/declarative-api
- https://developer.chrome.com/docs/ai/webmcp/imperative-api
- https://developer.chrome.com/docs/devtools/application/webmcp
- https://developer.chrome.com/blog/new-in-devtools-149
- https://developer.chrome.com/docs/ai/join-epp

## Publicly documented curriculum

Status labels below are a reviewed snapshot, not permanent compatibility claims. Recheck the official catalog and the individual API page before implementing a lesson.

| API | Reviewed status | Curriculum role | Initial example |
| --- | --- | --- | --- |
| Translator | Stable from Chrome 138 | First task-specific expert-model API | German-to-English text translation |
| Language Detector | Stable from Chrome 138 | Ranked detection results and API composition | Detect an editable sentence, then optionally translate it |
| Summarizer | Stable from Chrome 138 | Task options, longer input, and model preparation | Summarize a short supplied article |
| Prompt / `LanguageModel` | Web: stable from Chrome 148; extensions: stable from Chrome 138 | General model, multimodal input, sessions, and structured output | Ask for a concise explanation |
| Prompt sampling parameters | Origin-trial capability on the web | Explain experimental model controls without making output deterministic | Compare supported sampling settings |
| Writer | Developer trial | Generate a new editable draft from an idea and context | Draft a short message |
| Rewriter | Developer trial | Transform existing text by tone or length | Rewrite a short message while preserving the original |
| Proofreader | Developer trial | Structured corrections and explanations | Check one editable sentence |
| WebMCP Declarative | Origin trial from Chrome 149 | Expose semantic HTML forms as tools for browser agents | Annotate a visible support-request form |
| WebMCP Imperative | Origin trial from Chrome 149 | Register schema-driven JavaScript tools for browser agents | Register and execute a local state-management tool |

WebMCP is part of the wider Chrome AI and agentic-web curriculum, but it is not a built-in model API. Keep its adapters, security guidance, and lessons separate from `Translator`, `LanguageModel`, and the other on-device inference APIs.

See `docs/webmcp-environment.md` for the operational setup this scope requires: local Chrome flags, the origin isolation and `tools` permissions policy requirements, the origin-trial token path for the deployed environment, and the supported verification tool.

## Early-preview watchlist

Chrome's Early Preview Program provides access to in-progress, unreleased APIs and early-stage ideas. Public Chrome documentation does not currently name additional teachable APIs beyond the catalog above.

- Recheck the official built-in API catalog, WebMCP documentation, Chrome AI release posts, and EPP page during every scope review.
- Add a proposed API as soon as an official public explainer or documentation page provides enough detail to describe its purpose, status, and runnable boundary.
- Never publish private EPP material or infer an API contract from an announcement alone.
- Keep exploratory lessons isolated because Chrome explicitly notes that experimental APIs may change or may never ship.

## Product boundaries

- No cloud fallback or polyfill in the core curriculum.
- No API keys or remote model requests.
- No automatic model download on initial page load.
- No claim of mobile support without a verified official source and real-device test.
- No silent fallback from one API to another in a core lesson. Learners should see which API is running.
- Experimental APIs must remain clearly labeled and isolated from stable examples.
- WebMCP tools must keep human-visible state synchronized with tool execution and must teach permissions, origin isolation, validation, and user control.

## TypeScript boundary

Prefer the current official or Chrome-recommended DOM typings when the React project is scaffolded. Do not hand-maintain a large duplicate browser declaration file if an authoritative type package covers the required API surface.

If the browser typings lag an experimental API, add the smallest local declaration beside that API adapter and explain why it exists.
