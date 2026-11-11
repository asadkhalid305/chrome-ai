// Edit this file only. Replace the TODO errors with your implementation.
// Remove the _ prefix from parameters as you use them.
// Three independent exercises: text, image, streaming. Each has its own
// options, capability check, and run function. Do not delegate to another exercise.
// Official guide: https://developer.chrome.com/docs/ai/prompt-api

// TEXT
// TODO 1: Configure English text input and output.
// Find the configuration options in the guide; use them for both the support
// check and session creation.
export const options = {} as const satisfies LanguageModelCreateCoreOptions

// The UI calls this when the tab opens. runExercise also calls it below.
export async function availability(): Promise<Availability> {
  // TODO 2: Check whether this browser exposes the API. If it doesn't, report
  // that it is unavailable. Otherwise, ask the API for its availability status
  // with your chosen options and return that status unchanged.
  throw new Error('Complete TODO 2 in exercises/prompt.ts, then reload.')
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
  // Give the session a system instruction for a brief, friendly English email
  // reply using only the supplied facts. Find the session instruction option.

  // TODO 4: Use that session to process input and return the resulting text.
  // Find this API's operation in the guide and pass the abort signal to it.

  // TODO 5: Release the session after the operation finishes, including when
  // it fails or is canceled. Find the cleanup method in the guide and choose
  // a control-flow structure that guarantees cleanup before returning.
  throw new Error('Complete TODOs 3–5 in exercises/prompt.ts.')
}

// IMAGE — implement this independently of the text exercise.
// TODO 1: Configure English text plus image input and English text output.
export const imageOptions = {} as const satisfies LanguageModelCreateCoreOptions

export async function imageAvailability(): Promise<Availability> {
  // TODO 2: Detect browser support, then ask for availability with imageOptions.
  // A ready text model does not prove this image configuration is supported.
  throw new Error('Complete image TODO 2 in exercises/prompt.ts, then reload.')
}

export async function runImageExercise(
  _input: string,
  _image: File,
  _signal: AbortSignal,
  _onDownloadProgress: (fraction: number) => void,
): Promise<string> {
  const status = await imageAvailability()
  if (status === 'unavailable') {
    throw new Error('Image prompting is unavailable on this device.')
  }

  // TODO 3: Create your own native session with imageOptions, download progress,
  // and cancellation. Do not reuse the text exercise's setup or session.

  // TODO 4: Find the multimodal prompt format in the guide. Send the text and
  // selected image together in a user message and return the resulting text.
  // Pass the File directly; no upload to a server is needed.

  // TODO 5: Release this session after success, failure, or cancellation.
  throw new Error('Complete image TODOs 3–5 in exercises/prompt.ts.')
}

// STREAMING — implement this independently of both exercises above.
// TODO 1: Configure English text input and output for this session.
export const streamingOptions =
  {} as const satisfies LanguageModelCreateCoreOptions

export async function streamingAvailability(): Promise<Availability> {
  // TODO 2: Detect browser support and return availability for streamingOptions.
  throw new Error(
    'Complete streaming TODO 2 in exercises/prompt.ts, then reload.',
  )
}

export async function runStreamingExercise(
  _input: string,
  _signal: AbortSignal,
  _onDownloadProgress: (fraction: number) => void,
  _onPartialOutput: (textSoFar: string) => void,
): Promise<string> {
  const status = await streamingAvailability()
  if (status === 'unavailable') {
    throw new Error('Streaming prompting is unavailable on this device.')
  }

  // TODO 3: Create a new native session with streamingOptions, progress, and
  // cancellation. Write its setup here, without calling another run function.

  // TODO 4: Find the streamed-output operation in the guide. Consume its chunks,
  // accumulate text, and call onPartialOutput with the entire text so far after
  // each chunk. Return the complete text when finished. Forward the abort signal
  // and stop processing chunks if canceled; partial output is incomplete.

  // TODO 5: Release this session on completion, failure, and cancellation.
  throw new Error('Complete streaming TODOs 3–5 in exercises/prompt.ts.')
}
