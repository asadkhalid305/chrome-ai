# WebMCP Environment

Last reviewed: 2026-11-10, against https://developer.chrome.com/docs/ai/webmcp, https://developer.chrome.com/docs/devtools/application/webmcp, and https://developer.chrome.com/blog/new-in-devtools-149.

This document covers the conditions needed to run and verify the WebMCP lessons (`docs/teaching-plan.md` Lessons 8–9), both on localhost and on the deployed Vercel origin. WebMCP is an agentic-web API, not on-device inference, so its environment needs (origin isolation, a permissions policy, an origin-trial token) are different from the built-in-AI lessons and are recorded here rather than in `docs/api-scope.md`.

## The two independent gates

App visibility, browser API access, and the inspection interface are separate:

- **`VITE_WEBMCP` app flag** (see `.env.example`) — reveals the WebMCP tab in this app's navigation. Defaults on; set to `false` for a shorter, built-in-AI-only demo.
- **`chrome://flags/#enable-webmcp-testing` browser flag** — enables local testing without a trial token, exposing `document.modelContext` and the declarative `toolname`/`tooldescription` form attributes. Without a testing flag or eligible trial token, the lessons report an unavailable state; the human-facing form/UI still works normally.
- **`chrome://flags/#devtools-webmcp-support` DevTools flag** — reveals the experimental WebMCP pane in Chrome DevTools so registered tools can be inspected and called manually.

## Run and verify locally

1. `npm run dev` (the WebMCP tab is visible by default; no `.env` change needed unless you previously set `VITE_WEBMCP=false`).
2. Open `chrome://flags/#enable-webmcp-testing`, set it to **Enabled**, and relaunch Chrome.
3. Open `chrome://flags/#devtools-webmcp-support`, set it to **Enabled**, and relaunch Chrome if required.
4. Open the Declarative or Imperative tab so that lesson's tool is registered.
5. Open Chrome DevTools, select **Application**, then select **WebMCP** in the Application sidebar.
6. Confirm the expected tool appears under **Available Tools** with its name, description, type, and inputs.
7. Select the tool, enter parameters in the manual test area, and choose **Run tool**.
8. Select the call under **Invoked Tools** and verify its status, exact **Input**, and returned **Output** or error. Confirm the same call updates the lesson's human-visible state.

Record a real run here, and in `docs/smoke-tests.md`, once this has been exercised in a supported Chrome build.

## Security requirements

WebMCP gates both APIs behind two browser-level checks. Neither needs to be "enabled" for this app — the requirement is to not accidentally break either default.

### Origin isolation

This app does not set `document.domain` or send `Origin-Agent-Cluster: ?0`.
Earlier setup notes described origin isolation as a prerequisite. The current
Chrome overview documents the tools Permissions Policy but does not repeat that
requirement; do not treat historical setup notes as a verified current contract.
Do not add COOP/COEP or other isolation headers without a current requirement and
an observed browser failure. Origin isolation and cross-origin isolation are
different concepts.

### The `tools` permissions policy

Both the Declarative and Imperative APIs are gated by the `tools` Permissions Policy, which defaults to `self`: it allows tool registration in the top-level document and same-origin frames, and blocks cross-origin iframes unless they carry `allow="tools"`. This app has no iframes, so the default is already sufficient.

`vercel.json` sets `Permissions-Policy: tools=(self)` explicitly on every route for the deployed origin, so the policy is visible in the codebase rather than left to an implicit browser default. If a lesson ever embeds a cross-origin iframe, extend the value to an explicit allowlist (e.g. `tools=(self "https://partner.example")`) and add `allow="tools"` to that `<iframe>`.

## Deployed environment (Vercel)

The deployment stays a static build with no functions, no backend, and no serverless origin-trial handling — `vercel.json` only adds response headers on top of Vercel's default static hosting for this Vite project.

### Origin-trial token placement

The public app origin is https://chromeai.asadullahkhalid.com. The checked-in
`vercel.json` supplies `Permissions-Policy: tools=(self)` but no Origin-Trial
header. A read-only HTTP response check on 2026-11-10 returned 200 and
`Permissions-Policy: tools=(self)`, with no Origin-Trial header. A header check
alone does not exclude a token injected into HTML; check the trial console and
actual browser availability before claiming deployed trial access. Trial tokens are scoped and expire; a local testing flag is a separate
way to experiment, not proof of deployed support.

When trial access is granted for the production origin:

1. Register the exact production origin at the [Chrome origin trials console](https://developer.chrome.com/origintrials) for the WebMCP trial.
2. Add one entry to the `headers` array in `vercel.json`:

   ```json
   { "key": "Origin-Trial", "value": "<token>" }
   ```

3. Redeploy. No application code changes are needed — the token only needs to reach the browser as a response header (or equivalently a `<meta http-equiv="origin-trial">` tag, which this project does not use so the header stays the single source of truth).

Origin-trial tokens are not secrets — they are delivered to every visitor's browser already — so committing the token to `vercel.json` is fine.

## See also

- `docs/api-scope.md` — curriculum status and reviewed API scope.
- `docs/teaching-plan.md` — WebMCP track visibility and lesson sequencing.
- `docs/smoke-tests.md` — record of real supported-Chrome verification runs.

## Agent evaluation and trust

Verify tool discovery, successful state changes, invalid arguments, missing
prerequisites, cancellation, and cleanup separately. Then evaluate paraphrased
user goals with a named compatible agent. Record its version and permissions;
a manual DevTools success does not prove an agent will select the tool.

Current security guidance recommends readOnlyHint, untrustedContentHint, and
consequentialHint as appropriate. They are advisory. Require confirmation in the
application for consequential actions and enforce authorization on any real
backend. This demo changes only local page state. Do not add cloud-backed agent
extensions to the core lesson: they can require keys and transmit prompts.

Sources: https://developer.chrome.com/docs/ai/webmcp/secure-tools,
https://developer.chrome.com/docs/ai/webmcp/build-tools,
https://developer.chrome.com/docs/ai/webmcp/evals.
