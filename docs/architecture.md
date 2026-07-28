# Architecture

## Goal

Make the native Chrome AI APIs easy to locate, explain, run, and compare. The architecture must support real browser lifecycle concerns without making learners understand the entire application first.

## Technology decision

Use Vite, React, TypeScript, and Tailwind CSS.

Vite keeps the project focused on browser APIs. Next.js would introduce server/client boundaries, routing conventions, and framework behavior that are unrelated to the first learning objective. A backend is unnecessary because Chrome performs the supported work on the user's device.

Tailwind keeps styling visible beside the teaching markup without adding a second component styling system. Use utility classes by default. Do not add inline React `style` props, CSS-in-JS, or CSS Modules. Keep the global stylesheet limited to Tailwind setup, global defaults, and browser selectors that Tailwind cannot express clearly. Use SCSS only when plain CSS cannot express a necessary rule cleanly.

## Dependency direction

```text
Presentation component
        ↓ props and user events
Feature hook  ──────→  useChromeAiSession
        ↓                  capability, download, session ref,
        ↓                  abort, request state machine
        ↓ typed function calls
Chrome API adapter
        ↓ native browser global
Chrome built-in AI API
```

Dependencies only point downward. The adapter must not import React. Presentation components must not access Chrome globals, storage, or session objects.

`useChromeAiSession` sits beside the feature hook rather than below the adapter. It never touches a Chrome global itself: the feature hook passes it the adapter's `availability` and `create` functions, so the direction of knowledge still runs from the slice into the shared module.

## Source shape

```text
src/
├── theme/
│   ├── accent.ts                    DemoAccent and every accent class map
│   └── field-styles.ts              class strings repeated across demo forms
├── app/
│   ├── app.tsx                      composition only
│   ├── navigation.ts                route ids and section metadata
│   ├── demo-registry.ts             the demo list, accents, visibility
│   ├── feature-flags.ts             import.meta.env reads
│   ├── hooks/                       use-hash-route, use-demo-tab-list, use-route-focus
│   └── layout/                      sidebars, header, mobile nav toggle
├── chrome-ai/
│   ├── shared-types.ts              capability and request vocabulary
│   ├── browser-globals.ts           readBrowserApi, withDownloadMonitor
│   └── use-chrome-ai-session.ts     the lifecycle shared by every AI feature
├── components/                      capability status, demo section, output panel
├── docs/
│   ├── documentation-content.ts     article and guide data
│   ├── documentation-page.tsx       picks article or guide for a section id
│   ├── documentation-accents.ts     accent per documentation section
│   ├── components/                  article-page, guide-page, exercise-card, …
│   └── hooks/                       use-copy-to-clipboard
├── features/
│   ├── translator/
│   │   ├── translator-api.ts        native Translator calls and options
│   │   ├── use-translator.ts        the translate call plus its own state
│   │   ├── translator-demo.tsx      form, submit handler, output
│   │   └── translator.test.tsx
│   ├── summarizer/ prompt/ writer/ rewriter/ proofreader/
│   ├── language-detector/
│   └── webmcp-declarative/ webmcp-imperative/
├── index.css
└── main.tsx
```

Add each feature slice when its lesson is implemented. Do not create empty folders or shared modules ahead of a second caller.

Two folders exist for scaffolding a learner never reads while studying an API: `theme/` for anything that only decides how something looks, and `app/` for routing, layout, and the demo registry. Adding a demo means extending an array in `demo-registry.ts`; it does not mean editing `app.tsx`.

`index.css` is the single global styling entry point. A feature-specific stylesheet is an exception for a browser selector or behavior that is impractical to express with Tailwind, not the default way to style a component.

## Responsibility boundaries

### API adapter

One adapter represents one native Chrome API. It owns:

- native global access;
- availability and session creation options;
- the direct API operation;
- native result normalization when necessary;
- session destruction primitives.

It does not own React state, UI messages, DOM rendering, or lesson navigation.

### Feature hook

One hook coordinates one feature lifecycle. It owns:

- the actual API operation, written out with its own options object;
- the result type and the name the demo sees it under;
- any per-feature rule about when the session must be replaced;
- public actions used by the demo component.

It delegates the parts every AI feature shares to `useChromeAiSession`: capability state, download progress, the session reference and its destruction, the abort controller, and the running/success/canceled/error transitions.

It does not render JSX or combine unrelated APIs. Split independent effects or lifecycles instead of creating one all-purpose controller hook.

### Shared session hook

`useChromeAiSession` owns the lifecycle plumbing, not the lesson. It receives the adapter's `availability` and `create` functions and returns the capability and request state, the result of the last run, and `run`, `cancel`, and `discardSession`. It is generic over both the session and the result type, so a feature that returns `DetectionResult[]` and one that returns a string share it without either becoming the general case.

It must not branch on which API it is serving. Per-feature needs enter through neutral options — `resetKey` for Translator, whose language pair selects a different model, and `keepPreviousResult` for Writer, whose draft is an editable textarea — or through a primitive the feature drives itself, as Rewriter does by calling `discardSession()` when the requested change no longer matches its session. If a change would require an `if` on a specific API inside this hook, the behavior belongs in the feature slice instead.

### Presentation component

A demo component owns the visible teaching example. It receives state and actions from its hook, renders semantic controls, and explains what the learner is observing.

Extract a child component when it has a distinct UI responsibility or makes the parent easier to read. Do not fragment a five-line piece of markup solely to increase the component count.

## State model

Use a small explicit state vocabulary:

```text
checking → unavailable | downloadable | ready
downloadable → downloading → ready
ready → running → success | canceled | error
```

Keep capability state separate from request state. Do not encode every feature into one global state machine.

Every demo allows submitting while the capability is `downloading`: the request waits for the download it joins. A submit button disabled mid-download looks broken, and the seven demos previously disagreed about this.

Use local React state by default. Use a reducer only when transitions become easier to understand than independent state values. Do not add a global state library for independent demos.

## Session ownership

Each feature owns its session for the lifetime of the component using it, through `useChromeAiSession`. The session is destroyed on unmount or replacement.

Do not use a process-wide singleton. A lifecycle-scoped session is easier to test, explain, and clean up.

## Abstraction rule

Prefer a small amount of duplication between the first API examples. A generic `useChromeAI()` hook that also owned the prompt, the options, and the result shape would hide the concepts the repository exists to teach.

Extract shared behavior only when:

1. at least two implemented features contain the same concept;
2. the shared name is clearer than the duplicated native calls;
3. a learner can still find the actual Chrome API invocation quickly;
4. tests become simpler rather than more indirect.

### Where the line was drawn

Seven implemented AI features met that bar, so the shared lifecycle now exists. The dividing question is what a reader opens a file to see:

| Stays visible in the slice | Moved to a shared module |
| --- | --- |
| each adapter's own `availability(options)` and `create({...})` calls and its options object | reading the browser global and attaching the `downloadprogress` listener (`browser-globals.ts`) |
| `session.summarize(input, {...})` and the result it produces | capability probing, download progress, session destruction, abort, request state (`use-chrome-ai-session.ts`) |
| the form, its `onSubmit`, `preventDefault`, and the `canRun` expression | the class strings those elements repeat (`theme/field-styles.ts`) |
| which demos exist and what each teaches | how a demo gets its accent color (`theme/accent.ts`, `app/demo-registry.ts`) |

The duplication in the left column is deliberate and must survive future refactors. The duplication that used to exist in the right column had already drifted into three behavioral inconsistencies between demos — a submit button that worked mid-download in three demos but not the other four, double sessions on double-submit in four hooks, and refs left pointing at destroyed sessions in six — which is the concrete argument for consolidating it.

When adding an eighth AI feature, write the slice against `useChromeAiSession` rather than copying an existing hook's plumbing.

## React practices

- Put user-triggered work in event handlers rather than effects.
- Use effects only to synchronize with browser lifecycle concerns.
- Derive values during render instead of mirroring state.
- Keep effect dependencies complete and narrow.
- Avoid `useMemo`, `useCallback`, context, reducers, and memoization until they solve an observable readability or performance need.
- Use explicit component variants instead of growing boolean-prop APIs.
- Prefer direct imports over barrel files.
- Keep browser-only modules conditionally loaded if loading them eagerly would increase the initial bundle or execute unsupported globals.

## Comments

Comments should answer one of these questions:

- Why is this Chrome option required?
- Why is this session created or destroyed here?
- Why is an output or input treated as untrusted?
- What browser state is difficult to infer from the code?
- What teaching decision intentionally avoids a production abstraction?

Comments should not narrate assignments, JSX, or standard hook syntax.
