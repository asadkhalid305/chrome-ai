---
name: chrome-ai-testing
description: Add, select, run, or review verification for the Chrome AI teaching project. Use for unit tests, component tests, deterministic browser environments, capability and download states, streaming, cancellation, structured output, session cleanup, WebMCP tool behavior, accessibility checks, or live supported-Chrome smoke tests.
---

# Chrome AI Testing

Scale verification to the lesson while keeping test code as readable as the application code.

1. Test the adapter as plain TypeScript with an injected fake browser factory or session.
2. Test the hook's public behavior for lifecycle concerns: availability, preparation, running, cancellation, errors, and cleanup.
3. Test presentation through accessible roles, labels, visible states, and user actions rather than internal state or implementation details.
4. Keep deterministic environments outside production components. Name fixtures by browser state or failure mode, not by test number.
5. Cover only states supported by the API under test. The common matrix is absent global, unavailable, downloadable, downloading, ready, success, cancellation, thrown error, and malformed structured output.
6. Assert that every created session is destroyed at the intended lifecycle boundary.
7. Treat model output as nondeterministic in live tests. Assert the workflow, language direction, non-empty result, and obvious safety properties rather than exact prose.
8. Do not use deterministic fixture success as evidence that Chrome itself works. A compatibility or release claim requires a real supported-browser run with the production adapter.
9. Record browser version, enabled flags or trials, operating system, API capability states, and tested language pair for live verification.
10. Run the smallest focused checks during implementation, then the complete repository gate before delivery once scripts exist.
11. For WebMCP, test schema validation, registration and unregistration, permissions or origin constraints, user-visible state synchronization, tool failures, and explicit user-control boundaries.
