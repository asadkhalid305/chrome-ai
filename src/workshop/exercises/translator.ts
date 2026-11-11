// Edit this file only. Replace the TODO errors with your implementation.
// Remove the _ prefix from parameters as you use them.
// Official guide: https://developer.chrome.com/docs/ai/translator-api

// TODO 1: Configure German input and English output using language codes.
// Find the configuration options in the guide; use them for both the support
// check and session creation.
export const options = {
  sourceLanguage: '',
  targetLanguage: '',
} as const satisfies TranslatorCreateCoreOptions

// The UI calls this when the tab opens. runExercise also calls it below.
export async function availability(): Promise<Availability> {
  // TODO 2: Check whether this browser exposes the API. If it doesn't, report
  // that it is unavailable. Otherwise, ask the API for its availability status
  // with your chosen options and return that status unchanged.
  throw new Error('Complete TODO 2 in exercises/translator.ts, then reload.')
}

// The form calls this when the participant clicks the action button.
export async function runExercise(
  _input: string,
  _signal: AbortSignal,
  _onDownloadProgress: (fraction: number) => void,
): Promise<string> {
  const status = await availability()
  if (status === 'unavailable') {
    throw new Error('This API or configuration is unavailable on this device.')
  }

  // TODO 3: Create a native session using your chosen options. Read the guide's
  // model-download section to report progress through onDownloadProgress.
  // Forward the supplied abort signal so Cancel can stop preparation and work.

  // TODO 4: Use that session to process input and return the resulting text.
  // Find this API's operation in the guide and pass the abort signal to it.

  // TODO 5: Release the session after the operation finishes, including when
  // it fails or is canceled. Find the cleanup method in the guide and choose
  // a control-flow structure that guarantees cleanup before returning.
  throw new Error('Complete TODOs 3–5 in exercises/translator.ts.')
}
