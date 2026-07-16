# Chrome AI

A teaching-first React project for learning Chrome built-in AI APIs through small, isolated examples and then understanding how those primitives grow into production features.

## Current status

Phase 1 contains four independently runnable lessons:

- Translator;
- Language Detector;
- Summarizer;
- Prompt / `LanguageModel`.

The sticky tab bar mounts one lesson at a time for presentation-friendly navigation. Each lesson keeps the native browser call in an adapter, owns its session and cancellation lifecycle in a React hook, and presents capability, download, running, canceled, success, and error states in an accessible UI.

Start with [the architecture](docs/architecture.md), then read [the teaching plan](docs/teaching-plan.md) and [the API scope](docs/api-scope.md).

## Intended stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Vitest and Testing Library
- Chrome built-in AI APIs

There is intentionally no backend, application framework, router, global state library, component library, or generic AI SDK in the initial curriculum.

## Run locally

Use a supported desktop Chrome version. Some APIs require Chrome to download an on-device model after you click a lesson's action button.

```bash
npm install
npm run dev
```

The terminal prints the local URL. Open it in Chrome and run each lesson independently.

## Verify

```bash
npm run typecheck
npm test
npm run build
```

Automated tests use deterministic browser adapters; they do not prove that Chrome's native models work. See [the live smoke-test record](docs/smoke-tests.md) for the latest supported-browser run.
