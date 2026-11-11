# Chrome AI hands-on workshop

Add browser AI to a prepared UI. Choose one exercise, work alone or pair, and
allow 10–20 minutes. You can finish the others afterwards.

## Start

You need **Node.js 24+** and desktop Chrome. Check
[Chrome's device and model-download requirements](https://developer.chrome.com/docs/ai/get-started).
A model may need downloading before your first result; pair on a prepared laptop
if your device cannot run it.

```sh
git clone --branch workshop https://github.com/asadkhalid305/chrome-ai.git
cd chrome-ai
npm ci
npm run workshop
```

Open the localhost URL printed by Vite in Chrome. If you already have the repo,
switch to `workshop` before installing and starting it.

## Complete an exercise

| Choose                         | Edit this file                                        | Official documentation                                                  |
| ------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Summarizer (recommended first) | [summarizer.ts](src/workshop/exercises/summarizer.ts) | [Summarizer guide](https://developer.chrome.com/docs/ai/summarizer-api) |
| Translator                     | [translator.ts](src/workshop/exercises/translator.ts) | [Translator guide](https://developer.chrome.com/docs/ai/translator-api) |
| Prompt                         | [prompt.ts](src/workshop/exercises/prompt.ts)         | [Prompt guide](https://developer.chrome.com/docs/ai/prompt-api)         |

1. Select the matching tab in the UI. Its instructions show the file to open.
2. Follow the five TODOs. Use the documentation to implement options, browser
   feature detection and availability, session creation/download progress, the
   operation, and cleanup after success, errors, or cancellation.
3. Replace the placeholder errors. Remove the `_` prefix from parameters as you
   use them. Keep the exported function names and signatures so the UI can call them.
4. Reload after implementing availability. Run the button, inspect the output,
   change the input, and try again. For longer requests, try Cancel.
5. Run the check for your chosen exercise below.

Edit only your exercise file. `src/workshop/ui/` provides the UI, and
`src/workshop/tests/` provides automated checks. The completed exercise code uses
native browser APIs without importing project helpers.

### Prompt: three independent choices

Use the **Text / Image / Streaming** switch. Each section in `prompt.ts` has its
own options, availability check, and five TODOs. Implement each independently.

- **Text:** `availability` and `runExercise`, for an email reply.
- **Image:** `imageAvailability` and `runImageExercise`, for text plus a local File.
- **Streaming:** `streamingAvailability` and `runStreamingExercise`. Send the full
  accumulated text to `onPartialOutput` after each chunk, then return the final text.

Progress callbacks accept a fraction from 0 to 1. Switching Prompt choices aborts
old work and resets the form and output. Canceled streamed text remains labeled partial.

## Check your implementation

Run TypeScript checking, then **one** command matching the exercise you completed:

```sh
npm run typecheck
npm run check:exercises -- -t "Summarizer"
npm run check:exercises -- -t "Translator"
npm run check:exercises -- -t "Prompt text"
npm run check:exercises -- -t "Prompt image"
npm run check:exercises -- -t "Prompt streaming"
```

These checks run **your exercise code** against simulated Chrome APIs: they check
configuration, input/output forwarding, and cleanup, plus download progress or
streamed updates where applicable. They intentionally fail while TODOs remain.
Run `npm run check:exercises` without a filter once all five choices are complete.

The checks do not run a real model or evaluate its wording. Also verify the UI in
Chrome: expect a useful, non-empty result, not an exact sentence.

## If something does not work

- A TODO error is expected while that part is unfinished. Reload after changing
  capability checking. An unavailable result after implementing it means the
  requested configuration cannot run on that browser/device.
- Compare your file with the matching reference: [Summarizer](src/workshop/solutions/summarizer.ts),
  [Translator](src/workshop/solutions/translator.ts), or [Prompt](src/workshop/solutions/prompt.ts).
  Check options, awaited calls, abort signals, and cleanup. You can copy a reference
  into its matching exercise file to try the complete implementation in the same UI.
- The UI passes the image File directly to Chrome. No server upload or API key is needed.

## Other commands

`npm test` checks the reference solutions and supporting application code; it does
not certify that your TODOs are complete. `npm run build:workshop` builds this
workshop. `npm run dev` opens the full teaching app with working demonstrations.
See [the verification record](docs/smoke-tests.md) for native-browser test scope.
