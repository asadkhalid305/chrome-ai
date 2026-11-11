# Complete app refresh change record

Recorded: 10 November 2026. This describes the completed refresh in the working tree on `codex/refresh-chrome-ai-docs`, compared with commit `94cb9d3357ef95f5eafd5c1c4c0d8c68e9d3f0e0`. It covers 16 modified tracked files and five new Prompt files: 21 implementation/documentation/test files in total. The changes were local and uncommitted when this record was created.

This record was reconstructed from the actual Git diff and the full contents of the new files. It describes what was implemented, including wording, dates, comments, types, test assertions, and formatting. Planned work and native verification that did not happen are identified separately below.

The companion [exact unified patch](app-refresh-exact-changes-2026-11-10.patch) contains every added and removed line, including whitespace and comments. It includes the five new files, which ordinary `git diff` would omit while they are untracked. The patch is a snapshot for review; it has not been applied to another checkout. The final section records the SHA-256 of every covered working-tree file so later edits can be distinguished from this snapshot.

## 1. Prompt lesson integration

### `src/features/prompt/prompt-demo.tsx` — modified

1. Imported `PromptExtensionsDemo` from `./prompt-extensions-demo`.
2. Rendered `<PromptExtensionsDemo accent={accent} />` after the original output area, inside the existing `DemoSection`.
3. Passed the existing lesson accent into the extension panel so it uses the current theme.

These are the only changes in the original Prompt component. Its original puzzle, system instruction, adapter, hook, run button, cancellation, and conversation behavior were not rewritten. No new navigation route or registry entry was required because the extensions live in the existing Prompt tab.

## 2. New Prompt adapter

### `src/features/prompt/prompt-extensions-api.ts` — added

1. Added `PromptExtension`, a union of `structured`, `image`, and `stream`.
2. Added `ExtensionSession`, selecting `prompt`, `promptStreaming`, and `destroy` from the native `LanguageModel` type.
3. Added `extensionOptions(mode)` to describe the modalities needed by the selected exercise. Image mode declares English text plus image input; the other modes declare English text input. All modes declare English text output.
4. Added a comment explaining that image availability and session creation must use matching declarations.
5. Added the `PromptExtensionsAdapter` interface with `availability(mode)` and `create(mode, progress, signal)` methods. This provides a deterministic test seam.
6. Added `promptExtensionsApi`. It reads `LanguageModel` through the existing `readBrowserApi` helper rather than accessing an unsupported global during module loading.
7. Its availability method calls the native factory with the selected exercise options; an absent factory returns `unavailable`.
8. Its creation method reports a clear missing-API error, forwards the abort signal, passes the matching modality/language declarations, and attaches the existing download monitor.
9. Kept the native `availability` and `create` calls visible in this feature file.

This adapter adds no sampling controls, cloud requests, keys, or global session singleton.

## 3. New structured-output schema and validator

### `src/features/prompt/structured-feedback.ts` — added

1. Added `feedbackSchema`: an object with required `sentiment` and `summary` fields and `additionalProperties: false`.
2. Restricted schema sentiment values to `positive`, `negative`, or `mixed`; the summary must be a string.
3. Added `parseFeedback(text)`, which parses JSON into `unknown` before validating it.
4. Rejected null, arrays, and non-object top-level values with `Expected a feedback object.` Invalid JSON retains the native JSON parsing error.
5. Required sentiment to be a string and an allowed enum value. A value such as `["positive"]` is rejected rather than coerced into a string.
6. Required a string summary containing at least one non-whitespace character.
7. Rejected unexpected object keys.
8. Returned only the validated sentiment and summary fields.
9. Used `The model response did not match the feedback schema.` for semantic shape failures.
10. Added a teaching comment explaining that output constrained by a model remains untrusted.

The parser's non-empty-summary check is stricter than the schema's basic string declaration. Neither schema nor parser establishes whether the classification or summary is factually correct.

## 4. New Prompt exercise lifecycle hook

### `src/features/prompt/use-prompt-extension.ts` — added

1. Added `usePromptExtension(mode, adapter)` using the existing `useChromeAiSession` for capability probing, download monitoring, session preparation/reuse, abort, errors, request state, and destruction.
2. Added `partial` state for incomplete streamed text.
3. Added `run(input, image)`, which clears earlier partial output before starting another request.
4. Structured mode calls native `prompt` with an English classification instruction, the request signal, and `responseConstraint: feedbackSchema`.
5. Structured mode parses and validates the response, then returns readable JSON with two-space indentation. Parse/validation failures flow through the shared error state.
6. Image mode checks that a selected file exists and has an `image/` MIME type; otherwise it throws `Choose an image file first.`
7. Image mode sends a native user message containing a text part and an image part. The `File` is forwarded directly as the image value.
8. Image mode forwards cancellation to the native prompt.
9. Stream mode iterates `promptStreaming(input, { signal })`, appends chunks to the accumulated output, and updates partial text after each chunk.
10. Stream mode checks for an aborted signal before accepting a chunk and throws an `AbortError` if canceled. Late chunks do not append after cancellation.
11. A completed stream returns the accumulated text as the final result.
12. Returned the shared public state plus final output, partial output, run, and cancel. An absent final result appears as an empty string.

The parent UI remounts the exercise when the mode changes; the hook does not add API-specific branches to the shared session hook.

## 5. New Prompt exercise UI

### `src/features/prompt/prompt-extensions-demo.tsx` — added

**Panel and session ownership**

1. Added a collapsed HTML `details` panel titled **Production extensions: structured output, image input, streaming**.
2. Added local open/closed state synchronized by the native `toggle` event.
3. Added a mode selector defaulting to **Validated structured feedback**, with **Image description** and **Streaming and cancellation** options.
4. Mounted the exercise only while the panel is open. Closing it unmounts the exercise and lets the shared hook destroy its session.
5. Used `key={mode}` so changing modes unmounts the previous exercise, discards its conversation/input/file/partial state, and mounts a fresh exercise.
6. Added a visible 10 November 2026 review date and session-ownership explanation.
7. Added an official Prompt API link opening in another tab with `rel="noreferrer"`.
8. Stated that the examples do not use experimental sampling controls.

**Inputs and actions**

9. Added an editable **Extension prompt** textarea.
10. Structured mode defaults to feedback about useful workshop examples and a slow model download.
11. Image mode defaults to a request for a one-sentence English description without guessed details.
12. Stream mode defaults to a request for three short paragraphs about preparing/reusing a browser model.
13. Image mode adds a **Local image** file input with `accept="image/*"`; selection stores the first file or null.
14. Added a form submit handler using `preventDefault()` and the feature hook's run action.
15. Added **Run extension**. It is disabled during a running request, for blank text, for unsupported/checking capability, or for image mode without a file.
16. Allowed running from ready, downloadable, and downloading states so a request can join model preparation.
17. Added **Cancel extension** only while running, forwarding to the hook's cancel action.

**Visible state and teaching text**

18. Reused `CapabilityStatus` for capability and download progress.
19. Reused `DemoOutput` for idle, running, canceled, success, and error output.
20. Added a separate plain-text partial output area labelled **Partial model output**. It is shown for non-empty stream output until success, including after cancellation.
21. Added the idle message **Run the selected extension to see its result.**
22. Added mode-specific explanations: JSON shape versus classification correctness; image modality declaration and review; streamed chunks and incomplete canceled output.
23. Reused existing theme accents, form classes, button shells, and Tailwind utilities. Added no inline style or component stylesheet.

## 6. New Prompt tests

### `src/features/prompt/prompt-extensions.test.tsx` — added

Added five tests:

1. **Malformed structured responses:** rejects invalid JSON, null, arrays, array-valued sentiment, missing summary, unknown sentiment, and unexpected fields; accepts a valid mixed-sentiment result.
2. **Matching image declarations:** availability includes image input and creation receives matching declarations.
3. **Validation error and cleanup:** malformed model JSON produces the hook's error state; the native call receives a response constraint and AbortSignal; unmount destroys the created session exactly once.
4. **Stream cancellation:** uses a controlled `ReadableStream`, observes initial partial text, aborts, releases a late chunk, verifies native cancellation was signaled, confirms canceled request state, and confirms the late chunk was excluded.
5. **Image forwarding:** verifies the chosen `File` is sent directly in the image message part and the returned description becomes the public output.

Added a fake adapter helper for these tests and restored stubbed globals after each test. Test doubles verify application behavior; they do not certify native model compatibility or quality.

## 7. Shared API setup guidance

### `src/components/api-availability.tsx` — modified

1. Removed `geminiNanoBaseFlags`, which previously prescribed `optimization-guide-on-device-model` and `prompt-api-for-gemini-nano-multimodal-input` for Writer/Rewriter.
2. Removed the old `Enabled BypassPerfRequirement` setup advice and its explanatory comment.
3. Replaced Writer's `writer-api-for-gemini-nano` flag with the currently documented `writer-api`.
4. Replaced Rewriter's `rewriter-api-for-gemini-nano` flag with `rewriter-api`.
5. Retained `Enabled or Enabled Multilingual` as the documented flag values for those two APIs.
6. Added a 10 November review comment pointing to the Writer/Rewriter localhost guides.
7. Updated the WebMCP review comment from 23 July to 10 November and changed “Verified” to “Reviewed.”
8. Changed the setup sentence for origin-trial APIs with flags to **Needs a trial token or local testing flag.** Other flagged APIs retain the localhost-flags sentence; stable APIs retain the no-flags sentence.
9. Preserved the existing writing-assistance alias, Proofreader flag, WebMCP testing flag, disclosure UI, and badge styles.

## 8. Writer, Rewriter, and Proofreader wording

### `src/features/writer/writer-demo.tsx` — modified

1. Replaced the sample context's claim that Chrome 141 or newer on a laptop is sufficient with **supported desktop Chrome with the experimental Writer API enabled**. The old separate “no mobile version yet” clause was removed as part of that replacement.
2. Changed the availability summary from **Developer trial in Chrome 137–148.** to **Developer trial. Previous origin trial: Chrome 137–148.**

### `src/features/rewriter/rewriter-demo.tsx` — modified

1. Replaced **Chrome 141 or newer** in the fictional workshop sample with **supported desktop Chrome with the experimental APIs enabled**.
2. Changed the availability summary from **Developer trial in Chrome 137–148.** to **Developer trial. Previous origin trial: Chrome 137–148.**

### `src/features/proofreader/proofreader-demo.tsx` — modified

1. Changed the availability summary from **Developer trial in Chrome 141–145.** to **Developer trial. Previous origin trial: Chrome 141–145.**

These wording changes distinguish current maturity from past trial windows. The three adapters and operations were not changed.

## 9. WebMCP imperative contract

### `src/features/webmcp-imperative/webmcp-imperative.d.ts` — modified

1. Replaced the July review comment with a 10 November review note.
2. Removed the old comment asserting that the global was renamed specifically in Chrome 150; retained the current `document.modelContext` declaration.
3. Added optional `consequentialHint` to tool annotations.
4. Added the native `AbortSignal` second argument to the `execute` function signature.
5. Removed `exposedTo` from `WebmcpToolSpec`.
6. Added `exposedTo` to `WebmcpRegisterToolOptions`, where the current API expects it.
7. Moved/reworded the cross-origin exposure comment accordingly.
8. Simplified the registration-signal comment to explain that abort unregisters the tool.

This updates local declarations only for the surface used by the lesson. It does not expose the demo to additional origins or add a consequential action.

## 10. WebMCP imperative execution and cleanup

### `src/features/webmcp-imperative/use-webmcp-imperative.ts` — modified

1. Accepted the invocation's AbortSignal as the second execute argument.
2. Rejected an already aborted invocation with `DOMException('Canceled', 'AbortError')` before changing list state.
3. Kept validation for an object containing text and for a non-empty string.
4. Changed expected validation failures from thrown errors to returned recovery messages. The hook still clears the last result, stores the error message, and shows error activity, while the agent receives actionable text. This avoids relying on Chrome preserving thrown error details.
5. Updated the validation comment to explain Chrome may redact thrown errors.
6. Changed `untrustedContentHint` from false to true because the confirmation echoes agent-supplied text.
7. Rewrote the annotation comment to explain the echoed-content trust boundary. `readOnlyHint` remains false because the tool changes the list.
8. Ignored registration promise rejections when the registration controller has already been aborted. This prevents a stale cleanup rejection from overwriting the current lesson state, including during development effect cleanup.

### `src/features/webmcp-imperative/webmcp-imperative-demo.tsx` — modified

1. Changed the support banner from asserting that the tool is registered as soon as the API exists to saying the browser can register it and directing the reader to Tool activity for registration errors.
2. Replaced the absolute **Invalid input never reaches this page's state** explanation with a statement that execute validates input again before changing the list.
3. Renamed the error heading from **execute() rejected:** to **Tool error:** so registration failures and returned validation errors are described accurately.

## 11. WebMCP test changes

### `src/features/webmcp-imperative/webmcp-imperative.test.tsx` — modified

1. Changed the annotation assertion to expect `untrustedContentHint: true`.
2. Added a regression test for a late rejection from an aborted registration: replace the adapter, reject the previous registration promise, and verify activity stays idle with no error.
3. Added a test that an already canceled invocation throws and does not mutate the list.
4. Passed a real AbortSignal to direct execute calls in existing success and validation tests, matching the updated native callback signature.
5. Changed malformed-input assertions from promise rejection checks to resolved-message checks, while preserving checks for error activity and an unchanged list.
6. Reformatted the touched assertions and registration-regression code. The exact patch captures these line wrapping changes.

## 12. WebMCP introduction

### `src/features/webmcp/webmcp-intro.tsx` — modified

1. Replaced the stale comment saying the concrete demos would arrive in later tickets with a note that neighboring lessons own their registrations.
2. Changed the lifecycle note from future tense (“will each own”) to present tense (“each own”).
3. Added a visible paragraph dated 10 November 2026 explaining that tool registration and agent support are separate; a manual DevTools call can work even when a particular agent cannot use the tool.
4. Explained that origin trials are temporary, schemas/annotations do not replace authorization, consequential actions need visible confirmation, and tool descriptions/input/output require an untrusted-content boundary.

## 13. In-app documentation

### `src/docs/documentation-content.ts` — modified

**Overview article**

1. Added **Real products and experimental tools**, attributing Drupal, Yahoo! Japan, and Trip.com examples to Google.
2. Qualified those examples as product evidence rather than adoption statistics or a guarantee of device support.
3. Distinguished deployed tools, manual invocation, and successful agent journeys as different evidence.
4. Added a source entry labelled **Google-published product examples** linking to Chrome's I/O 2026 feature article.

**Browser requirements article**

5. Replaced a fixed-foundation-model description with browser-managed language models Chrome may update.
6. Expanded the generic storage/OS note into the documented desktop OS, Chromebook Plus, storage, GPU/CPU, and audio GPU conditions. Explicitly distinguished the 22 GB free-storage requirement from download size.
7. Replaced the assertion that WebMCP always needs the local flag with the token-or-flag distinction and directed readers to current DevTools setup instructions.
8. Added **Languages, downloads, and access programs**: five documented foundation-model text languages from Chrome 149; English-focused lessons; separate translation language-pair models; runtime checks; user activation; unmetered initial download; prepared offline use; possible network use for assets/model updates; possible model removal under storage pressure.
9. Explained stable access without EPP, separate time-limited origin-trial tokens, and the meaning of developer trials.

**Choosing an API article**

10. Replaced the statement that Proofreader returns categories/explanations with correction ranges/replacements and the current Chrome limitation.

**Prompt guide**

11. Updated its playground description to mention the separate JSON, image, and streaming exercises.
12. Replaced the “no response constraints” limitation with a distinction between the core lesson and structured-output validation; emphasized that valid shape does not establish correctness.

**Proofreader guide**

13. Corrected the option spelling from `includeCorrectionExplanations` to the singular `includeCorrectionExplanation`.

**Review dates**

14. Changed all ten guide review dates to 2026-11-10: Translator, Language Detector, Summarizer, Prompt, Writer, Rewriter, Proofreader, WebMCP overview, declarative WebMCP, and imperative WebMCP. Nine previously used 2026-07-24; Proofreader used 2026-07-28. Review dates record a source review, not a fresh native run of every API.

## 14. Repository documentation

### `README.md` — modified

1. Appended **Documentation refresh — 10 November 2026**.
2. Described optional structured feedback, image, and streaming exercises and their session/modality ownership.
3. Explained that API/access claims are dated snapshots, stable access does not need EPP, and experimental setup differs.
4. Pointed readers to scope and smoke-test documents to distinguish source review, fixtures, and native verification.

### `docs/api-scope.md` — modified

1. Changed the main review date from 22 July to 10 November.
2. Changed the Proofreader limitation check date from 28 July to 10 November.
3. Added **Reviewed runtime and access boundaries** covering stable/EPP/trial access, origin scoping and expiry, local flags, and developer-trial maturity.
4. Recorded the five foundation-model text languages, separate translation pairs, desktop/hardware/storage eligibility, and audio GPU requirement.
5. Described the three Prompt follow-ups and their validation/locality boundaries.
6. Recorded object arguments for WebMCP executeTool and the Chrome 155 deprecation of JSON-stringified input arguments. This is documentation; the app itself does not call executeTool.
7. Recorded the registration-options location of exposedTo, advisory hints, and the trust boundary for echoed content.

### `docs/teaching-plan.md` — modified

1. Replaced the stale phrase **After the four APIs** with **After the individual APIs**.
2. Added a dated Prompt follow-up section explaining the collapsed panel, three exercises, one mounted exercise, session destruction on close/switch, and schema validation limits.

### `docs/webmcp-environment.md` — modified

1. Updated the review date from 24 July to 10 November.
2. Replaced “eventual deployed Vercel origin” with “deployed Vercel origin.”
3. Reworded the gates introduction to distinguish app visibility, browser access, and inspection.
4. Clarified in the testing-flag description that it enables local testing without a token.
5. Replaced the previous absolute origin-isolation prescription with what the app actually does, what earlier notes said, and the absence of that statement in the current overview. Distinguished origin isolation from cross-origin isolation and advised against adding headers without a current requirement and observed failure.
6. Replaced the assertion that the final domain was undecided with the actual public origin, the checked-in permissions header, and the observed HTTP response.
7. Recorded HTTP 200 and tools=(self), with no Origin-Trial response header; stated that HTML-provided tokens and console enrollment were not verified.
8. Changed “for that subdomain” to “for the production origin” in token setup instructions.
9. Added **Agent evaluation and trust**, separating contract checks from real agent journeys and recording the advisory nature of hints, confirmation/authorization requirements, and local-only demo effects.
10. Added official security, tool-design, and evaluation URLs.

### `docs/smoke-tests.md` — modified

Appended a dated record containing the local URL, Chrome 156 reduced UA, limits of the UA as OS evidence, existing-profile configuration uncertainty, native structured/streaming/image/WebMCP results, the registration cleanup issue and fix, deterministic test scope, untouched native flows, absence of a real autonomous-agent evaluation, and public-site header results. It explicitly says the image verification exercised the production adapter rather than the operating-system file picker.

## 15. Formatting and comments

The new Prompt files and touched WebMCP test code were formatted with Prettier 3.6.2 using single quotes and no semicolons. This was run with npx; no formatter dependency or package/lockfile change was added. The patch records every resulting newline, comma, and wrapping change. Teaching comments were added or changed where noted in the file descriptions above.

## 16. Verification performed during implementation

- `npm run typecheck`: passed.
- `npm test`: 14 test files and 89 tests passed in the final implementation run.
- `npm run build`: passed.
- `git diff --check`: passed.
- The build emitted warnings for the existing experimental WebMCP CSS pseudo-classes `tool-form-active` and `tool-submit-active`; no stylesheet was changed to suppress them.
- Native Chrome 156: structured feedback returned validated mixed sentiment and a summary; streamed output completed; another stream canceled while retaining partial output; the image adapter described a local red canvas as Red; imperative WebMCP added an agent-labelled task and returned its confirmation.
- A native check exposed an aborted registration rejection incorrectly reaching the visible error state. The implementation now ignores that stale rejection, and the refreshed page was idle and could execute the tool.
- A read-only HTTP header check of the public app returned 200 and tools=(self), without an Origin-Trial header.

The first typecheck caught missing signal arguments in older WebMCP tests. A later typecheck caught an AsyncGenerator test double where the native type requires ReadableStream; the test double was corrected. A validation test initially used a string-containment matcher with a regular expression after changing rejection to returned text; it was corrected to a regular-expression matcher. All final checks above passed after those corrections.

## 17. Scope and limits for future slide work

The refresh added functionality under the existing Prompt route and corrected educational/setup content. It did not replace the seven core API adapters, add audio input, add experimental sampling controls, create a cloud fallback, change dependencies, provision a trial token, modify deployment headers, update slides, commit, push, or deploy.

Native verification covered the new Prompt capabilities and imperative WebMCP invocation in an existing configured Chrome profile. It did not audit hardware, actual OS version, all flags/trial enrollment, OS file selection, declarative WebMCP, every other native model lesson, or autonomous-agent selection of a tool. Keep these distinctions when using this record to update slides.

The earlier research brief `docs/research/chrome-ai-webmcp-refresh-2026-11-04.md` was created during the preceding research task and already existed before this implementation. It was preserved and was not part of the 21-file implementation diff. This document and its patch are new documentation artifacts requested after implementation; neither is included recursively in the patch.

## 18. Exact snapshot inventory

Paths are relative to the repository root. SHA-256 values identify the working-tree bytes at the time this record was created.

| File | Change | SHA-256 |
| --- | --- | --- |
| `README.md` | Modified | `35ab8c5306ea789476f2572667b5c878b4763b09ad3fb0412c3039664b3b62bc` |
| `docs/api-scope.md` | Modified | `acfbe294c161c0e1386d094fb7ef1c1fc5260c81d7e8dccdc4a203e1a2d1a3d5` |
| `docs/smoke-tests.md` | Modified | `be7b9432cfa013e73503d042d37d91579ca23757347060b7490dbf1068898e29` |
| `docs/teaching-plan.md` | Modified | `4398c55dbb073e58074e532ab250f43e9109a3cdb9cb6df71de86fabd9107812` |
| `docs/webmcp-environment.md` | Modified | `f311199048c4bbeff048ec57e5215b073ef2bad54d83cd78a7be122243308296` |
| `src/components/api-availability.tsx` | Modified | `55a111889744759aef29193bf801c37ce7345748c483a29aecd95f0a71d84f8c` |
| `src/docs/documentation-content.ts` | Modified | `4d815e245b54e1bd56fe83ad9cba1f3b9f0447b1d99d151a17786920594ed900` |
| `src/features/prompt/prompt-demo.tsx` | Modified | `cf47f6368ab2ce438bd2496e5f2034824759b1c0ce592b2be7bc201c93ae110b` |
| `src/features/prompt/prompt-extensions-api.ts` | Added | `6f004a33fb5b276fb1b1f24c47bc09e7d13d79493f28454180df5ed4dc58c93c` |
| `src/features/prompt/prompt-extensions-demo.tsx` | Added | `cce76adbaafc66756dec2f8eb4a901e4d509e6cd93be85169f61e31f10362609` |
| `src/features/prompt/prompt-extensions.test.tsx` | Added | `6e9f7032f2984238fef7530efb44c6875619412cba085c922a67539b74a4b8b9` |
| `src/features/prompt/structured-feedback.ts` | Added | `a8665c1fec61c4ab2cfbbf9c3bb94b4d5bce0174094cb6359cd929602f5cb5b4` |
| `src/features/prompt/use-prompt-extension.ts` | Added | `dc319390c37848c94ab3e762077bf68b9814d1180e1abfa9f354be89acf1df4c` |
| `src/features/proofreader/proofreader-demo.tsx` | Modified | `7b2eb661754ba9f209b29266db5d1d0f2ede07a06fb9706b01693395cb7a237c` |
| `src/features/rewriter/rewriter-demo.tsx` | Modified | `c35731004f5d1f8d3adc0d4747dd387f77485b66c5ef1dff96ba235533c5dcd8` |
| `src/features/webmcp-imperative/use-webmcp-imperative.ts` | Modified | `44921c5c6d7d3930e48d15274a419ec5e08d299bdcf37fd261f225952d10450e` |
| `src/features/webmcp-imperative/webmcp-imperative-demo.tsx` | Modified | `6d51e94367a7e198827a61c507ec1a3bee456d68e8d9aee31afc871cb530cb76` |
| `src/features/webmcp-imperative/webmcp-imperative.d.ts` | Modified | `964bdb09d680f8e7a636d8d25de5c9282876f89cab2f107efdbcf71e50e0a3e3` |
| `src/features/webmcp-imperative/webmcp-imperative.test.tsx` | Modified | `169c4c85d1ab4e1eade4541275087c946a06f819ba6e27c2d1001c32a077dcde` |
| `src/features/webmcp/webmcp-intro.tsx` | Modified | `6740f43fa1d88551b887bb94bdf50a0f358dca00821fabc74f4b3fd580de2ff1` |
| `src/features/writer/writer-demo.tsx` | Modified | `c2436ba8a10cc896361f043c1217f8c6d1820357ab42ac44e1a2c167bc04938e` |

Companion patch SHA-256: `505c9014d561b7d432e6c34e8e3bd1c2608581bdb3cc0c9fb9cab6a56898c02a`.
