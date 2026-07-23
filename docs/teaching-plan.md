# Teaching Plan

## Audience

The primary learner knows basic JavaScript and has seen React components and hooks, but may not know browser AI, model lifecycle concepts, streaming, structured output, or capability-based progressive enhancement.

The project should also remain pleasant for an experienced frontend developer to demonstrate live.

## Learning sequence

### Lesson 1: Translator

Teach the smallest task-specific API flow:

1. check a language pair;
2. create a translator;
3. translate one user-provided string;
4. render the result as text;
5. destroy the session.

This is the first lesson because the input, output, and configuration are concrete.

### Lesson 2: Language Detector

Teach confidence-ranked language detection and how a task-specific expert model can feed a second API without hiding either native call. Keep detection runnable on its own before pairing it with Translator.

### Lesson 3: Summarizer

Introduce task options, longer input, model preparation, and a reusable task session. Keep the first implementation non-streaming, then add streaming as a clearly marked extension.

### Lesson 4: Prompt API

Introduce the browser's general language model, system instructions, session lifecycle, cancellation, and the difference between free-form and structured output.

The initial prompt example must remain small. Grounding, cloning, token/context management, and response constraints belong in follow-up examples rather than the first screen.

### Lesson 5: Writer

Teach generated drafts, expected input and output languages, context, tone, format, and length as an experimental lesson. Keep generated text editable and require an explicit user action before replacing input.

### Lesson 6: Rewriter

Teach transformation of existing text separately from generation. Make length and tone changes visible, preserve the original input, and label the API's developer-trial status.

### Lesson 7: Proofreader

Teach an experimental API separately and label its status honestly. The UI must distinguish missing browser support from an input with no suggested changes.

### Lesson 8: WebMCP Declarative API

Teach how semantic HTML forms can become agent tools through annotations. Keep the human-visible form primary, show agent activation and cancellation states, and explain the origin-trial boundary.

### Lesson 9: WebMCP Imperative API

Teach `document.modelContext`, explicit tool schemas, execution, cleanup, permissions, and user-visible side effects. Keep this track separate from built-in model inference: WebMCP exposes website capabilities to browser agents; it does not itself run a Chrome AI model.

#### WebMCP track visibility (feature flag)

The WebMCP track (Lessons 8 and 9) is hidden by default so the one-hour
built-in-AI demo stays focused on on-device inference. It lives behind the
`VITE_WEBMCP` app-level flag, which defaults off: an unset value on a fresh
clone keeps the seven built-in-AI lessons unchanged and prevents any accidental
origin-trial activation.

To reveal the track for a longer talk, set `VITE_WEBMCP=true` in a local `.env`
file (see `.env.example`) and restart the dev server. When enabled, the WebMCP
tab is appended after the core lessons — existing lesson numbers stay stable —
and a divider plus group label separate it from the built-in-AI lessons to make
clear that WebMCP exposes website tools to browser agents rather than running a
Chrome model.

### Lesson 10: Production patterns

After the four APIs are understandable independently, add focused examples for:

- download progress;
- streaming and cancellation;
- structured output validation;
- safe output rendering;
- deterministic browser fixtures;
- session reuse and cleanup;
- graceful unsupported-browser behavior.

## Coverage rule

The roadmap covers every Chrome AI or agentic-web API that Chrome documents publicly, even when it is only in a developer trial, origin trial, or early preview. Availability controls when a lesson can be run, not whether it is recorded in the curriculum.

Do not guess at APIs mentioned only inside private Early Preview Program material. Track those as unnamed watchlist items in `docs/api-scope.md`, then add a lesson when Chrome publishes an explainer or official documentation that can be cited and tested.

## Shape of each lesson

Every lesson should expose the same learning landmarks without forcing identical implementation:

1. **What this API is for** — one short paragraph.
2. **Browser status** — visible capability and model state.
3. **Input** — one focused task.
4. **Run** — an explicit user action.
5. **Output** — plain, inspectable result.
6. **Code path** — links or labels naming the adapter, hook, and component.
7. **Important lifecycle note** — creation, reuse, cancellation, or cleanup.
8. **Try a failure state** — deterministic in development where practical.

## Simplicity standard

A learner should be able to answer these questions after reading one feature folder:

- Where is the native Chrome API called?
- Which React hook owns the session?
- Which component displays the state?
- What happens when the API is unavailable?
- When is the session destroyed?

If answering one question requires searching unrelated feature folders, the architecture needs simplification.

## Teaching versus production

The examples must be correct, but they do not need to include every production concern in lesson one. Complexity should be introduced progressively and named when it appears.

Use two labels in documentation and the UI:

- **Core example:** the minimum correct API lifecycle.
- **Production extension:** resilience, validation, streaming, persistence, or optimization added after the core concept.

This separation prevents production hardening from hiding the native API.
