# Chrome AI Teaching Project

This repository teaches Chrome built-in AI APIs through small, runnable React examples. It is an educational project first and a showcase application second.

## Always-On Rules

- Keep every example local-first. Do not add a backend, API key, cloud-model fallback, authentication, database, or analytics without explicit direction.
- Optimize for a beginner reading one feature at a time. Prefer direct code and descriptive names over clever abstractions.
- Separate browser API access, React lifecycle logic, and presentation. A component or hook must have one clear reason to change.
- Keep each Chrome API independently understandable and runnable. Do not hide the native API behind a generic AI framework.
- Add shared abstractions only after two concrete features need the same behavior and the abstraction makes the native APIs easier to see.
- Build new AI features on `src/chrome-ai/use-chrome-ai-session.ts` instead of copying another hook's capability, download, abort, and request plumbing. Keep that hook free of any single API's name.
- Keep each API's own `availability`/`create` calls, its options objects, its operation call, and each demo's form and submit handler written out in the feature slice. That repetition is the lesson; do not factor it away.
- Treat model output as untrusted. Render it as text unless a deliberately constrained parser is part of the lesson.
- Make capability, download, ready, running, canceled, success, and error states visible where the API supports them.
- Own sessions close to the feature using them and destroy unused sessions. Do not create a global session singleton.
- Use Tailwind CSS utilities for application styling. Do not mix Tailwind utilities with inline React `style` props or duplicate the same styling in component CSS.
- Take accent colors and repeated form classes from `src/theme/`. Do not add another accent map or re-paste a shared class string into a component.
- Register a new demo by extending the arrays in `src/app/demo-registry.ts`. Keep `src/app/app.tsx` a composition of layout components and hooks.
- Use a small plain CSS file only for global directives or browser features Tailwind cannot express clearly. Use SCSS only when plain CSS is genuinely insufficient.
- Write comments for browser-specific constraints, lifecycle decisions, and teaching intent. Do not comment obvious React or TypeScript syntax.
- Verify API status and usage against current official Chrome documentation before changing an API adapter or making compatibility claims.
- Keep the curriculum inventory current across stable, origin-trial, developer-trial, and publicly documented early-preview Chrome AI APIs. Label experimental status in the lesson and never invent examples for unnamed or private APIs.

## Skill Routing

- `chrome-ai-engineering`: implement or refactor demos, adapters, hooks, components, and educational explanations.
- `chrome-ai-testing`: add or run unit, component, fixture, and supported-browser verification.
- `vercel-react-best-practices`: apply Vercel's React performance guidance while writing or reviewing React code.
- `vercel-composition-patterns`: use when component APIs, shared state, or composition choices become non-trivial.

Read `docs/architecture.md`, `docs/teaching-plan.md`, and `docs/api-scope.md` before the first application implementation.
