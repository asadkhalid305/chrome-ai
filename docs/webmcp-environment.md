# WebMCP Environment

Last reviewed: 2026-07-24, against https://developer.chrome.com/docs/ai/webmcp and https://developer.chrome.com/docs/ai/webmcp/imperative-api.

This document covers the conditions needed to run and verify the WebMCP lessons (`docs/teaching-plan.md` Lessons 8–9), both on localhost and on the eventual deployed Vercel origin. WebMCP is an agentic-web API, not on-device inference, so its environment needs (origin isolation, a permissions policy, an origin-trial token) are different from the built-in-AI lessons and are recorded here rather than in `docs/api-scope.md`.

## The two independent gates

Running a WebMCP lesson requires two separate things to be true at once. Neither implies the other:

- **`VITE_WEBMCP` app flag** (see `.env.example`) — reveals the WebMCP tab in this app's navigation. Defaults on; set to `false` for a shorter, built-in-AI-only demo.
- **`chrome://flags/#enable-webmcp-testing` browser flag** — makes `document.modelContext` and the declarative `toolname`/`tooldescription` form attributes exist in the browser at all. Without it, the WebMCP tab renders but every lesson reports its "unavailable" state, and the human-facing form/UI still works normally.

## Run and verify locally

1. `npm run dev` (the WebMCP tab is visible by default; no `.env` change needed unless you previously set `VITE_WEBMCP=false`).
2. Open `chrome://flags/#enable-webmcp-testing`, set it to **Enabled**, and relaunch Chrome.
3. Install [WebMCP - Model Context Tool Inspector](https://chromewebstore.google.com/detail/gbpdfapgefenggkahomfgkhfehlcenpd) from the Chrome Web Store. This is Chrome's own inspection extension for native WebMCP pages.
4. Open the Declarative or Imperative tab, open the extension's side panel, and confirm the tool(s) registered by that lesson appear with the expected name, description, and input schema. Use the panel's manual execution to call a tool directly and confirm the human-visible state (the "Tool activity" panel in each demo) updates in response.
5. Fallback check without the extension: open DevTools console and run `await document.modelContext.getTools()` to confirm the same tool list.

Record a real run here, and in `docs/smoke-tests.md`, once this has been exercised in a supported Chrome build.

## Security requirements

WebMCP gates both APIs behind two browser-level checks. Neither needs to be "enabled" for this app — the requirement is to not accidentally break either default.

### Origin isolation

WebMCP is only available in origin-isolated documents. This is Chrome's default; it is disabled only when a document sends the `Origin-Agent-Cluster: ?0` response header or sets `document.domain`. Neither the Vite dev server nor Vercel's static hosting sends that header, and nothing in this codebase sets `document.domain`. There is nothing to configure locally or in `vercel.json` for this — only something to avoid introducing later.

### The `tools` permissions policy

Both the Declarative and Imperative APIs are gated by the `tools` Permissions Policy, which defaults to `self`: it allows tool registration in the top-level document and same-origin frames, and blocks cross-origin iframes unless they carry `allow="tools"`. This app has no iframes, so the default is already sufficient.

`vercel.json` sets `Permissions-Policy: tools=(self)` explicitly on every route for the deployed origin, so the policy is visible in the codebase rather than left to an implicit browser default. If a lesson ever embeds a cross-origin iframe, extend the value to an explicit allowlist (e.g. `tools=(self "https://partner.example")`) and add `allow="tools"` to that `<iframe>`.

## Deployed environment (Vercel)

The deployment stays a static build with no functions, no backend, and no serverless origin-trial handling — `vercel.json` only adds response headers on top of Vercel's default static hosting for this Vite project.

### Origin-trial token placement

WebMCP ships as an origin trial from Chrome 149. An origin-trial token is issued for one exact origin, so no token can be requested or applied until the final Vercel production subdomain is decided and live — until then, the deployed track runs without a trial token and every lesson reports its "unavailable" capability state in unsupported browsers, the same as any other experimental lesson.

When trial access is granted for that subdomain:

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
