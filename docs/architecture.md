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
Feature hook
        ↓ typed function calls
Chrome API adapter
        ↓ native browser global
Chrome built-in AI API
```

Dependencies only point downward. The adapter must not import React. Presentation components must not access Chrome globals, storage, or session objects.

## Planned source shape

```text
src/
├── app/
│   └── app.tsx
├── components/
│   ├── capability-status.tsx
│   └── demo-section.tsx
├── features/
│   ├── translator/
│   │   ├── translator-api.ts
│   │   ├── use-translator.ts
│   │   ├── translator-demo.tsx
│   │   └── translator.test.ts
│   ├── summarizer/
│   ├── prompt/
│   └── proofreader/
├── chrome-ai/
│   └── shared-types.ts
├── index.css
└── main.tsx
```

This is a target, not a quota. Do not create empty folders or premature shared modules. Add each feature slice when its lesson is implemented.

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

- capability and operation state for that feature;
- the active session reference;
- cancellation and cleanup;
- translating adapter errors into a small UI-facing state;
- public actions used by the demo component.

It does not render JSX or combine unrelated APIs. Split independent effects or lifecycles instead of creating one all-purpose controller hook.

### Presentation component

A demo component owns the visible teaching example. It receives state and actions from its hook, renders semantic controls, and explains what the learner is observing.

Extract a child component when it has a distinct UI responsibility or makes the parent easier to read. Do not fragment a five-line piece of markup solely to increase the component count.

## State model

Use a small explicit state vocabulary:

```text
checking → unavailable | downloadable | ready
downloadable → preparing → ready
ready → running → success | canceled | error
```

Keep capability state separate from request state. Do not encode every feature into one global state machine.

Use local React state by default. Use a reducer only when transitions become easier to understand than independent state values. Do not add a global state library for independent demos.

## Session ownership

The feature hook owns its session. It may retain a reusable task session when the native API recommends reuse, but it must destroy that session on unmount or replacement.

Do not use a process-wide singleton. A lifecycle-scoped session is easier to test, explain, and clean up.

## Abstraction rule

Prefer a small amount of duplication between the first API examples. Translator, Summarizer, Prompt, and Proofreader have different options and lifecycle details; a generic `useChromeAI()` hook would hide the concepts the repository is meant to teach.

Extract shared behavior only when:

1. at least two implemented features contain the same concept;
2. the shared name is clearer than the duplicated native calls;
3. a learner can still find the actual Chrome API invocation quickly;
4. tests become simpler rather than more indirect.

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
