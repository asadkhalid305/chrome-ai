---
name: chrome-ai-engineering
description: Implement or refactor the Chrome AI teaching project, including native browser adapters, React hooks, demo components, TypeScript contracts, lesson explanations, and feature architecture. Use for application-code changes involving Chrome built-in AI APIs, WebMCP, browser capability states, session lifecycle, streaming, cancellation, structured output, or agent tool registration.
---

# Chrome AI Engineering

1. Read the root `AGENTS.md` and the three files under `docs/` before the first implementation or any architectural change.
2. Verify time-sensitive API names, options, availability, and lifecycle guidance against official Chrome documentation. Record the review date when changing compatibility claims.
3. Implement one feature slice at a time in this order: browser adapter, feature hook, presentation component, focused tests, then learner-facing explanation.
4. Keep the native Chrome call visible in the feature's adapter. Do not route core examples through a generic AI SDK, generic `useChromeAI` hook, or silent fallback.
5. Give each module one reason to change:
   - adapters know browser APIs;
   - hooks know one React lifecycle;
   - components know presentation and user events;
   - pure helpers know parsing or validation.
6. Inject or parameterize the browser environment at the adapter boundary when this makes deterministic testing possible. Do not leak fixture logic into presentation components.
7. Own reusable native sessions in the relevant hook, use refs for imperative session objects, and destroy them on replacement or cleanup. Avoid a global singleton.
8. Put generation in explicit event handlers. Reserve effects for capability synchronization and lifecycle cleanup.
9. Prefer local state and direct props. Add a reducer, context, compound component, or shared abstraction only when the implemented behavior demonstrates the need.
10. Keep comments focused on Chrome constraints, lifecycle reasoning, unsafe output, or teaching decisions. Remove comments that merely translate code into English.
11. After editing React code, apply `vercel-react-best-practices`. Apply `vercel-composition-patterns` when designing shared component state or reusable component APIs.
12. Use `chrome-ai-testing` before declaring an API lesson complete.
13. Use Tailwind utilities for presentation. Do not add inline React `style` props or a parallel component styling system; reserve plain global CSS for Tailwind setup and browser selectors that utilities cannot express clearly.
14. Keep WebMCP lessons separate from built-in inference lessons and make tool permissions, schemas, validation, user-visible state, and cleanup explicit.
