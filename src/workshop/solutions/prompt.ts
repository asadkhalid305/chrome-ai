// Native browser code only: no React or project-helper imports.
// Official guide: https://developer.chrome.com/docs/ai/prompt-api
// Configuration: English text input and English text output.
// Use the same options for availability and creation.
export const options = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
} as const satisfies LanguageModelCreateCoreOptions

// The system instruction is the first message.
export const initialPrompts: [LanguageModelSystemMessage] = [
  {
    role: 'system',
    content:
      'Write a brief, friendly English reply using only the supplied facts.',
  },
]

export async function availability(): Promise<Availability> {
  if (!('LanguageModel' in self)) return 'unavailable'
  return LanguageModel.availability(options)
}

// Called directly from the form's user action. This small exercise owns one
// session per request so creation, use, and cleanup are visible together.
export async function runExercise(
  input: string,
  signal: AbortSignal,
  onDownloadProgress: (fraction: number) => void,
): Promise<string> {
  const status = await availability()
  if (status === 'unavailable') {
    throw new Error('This API or configuration is unavailable on this device.')
  }
  // Creation uses the same options as the capability check.
  // Read "Model download" in the guide: monitor receives Chrome's monitor,
  // and downloadprogress events report a fraction in event.loaded.
  const session = await LanguageModel.create({
    ...options,
    signal,
    initialPrompts,
    monitor(m) {
      m.addEventListener('downloadprogress', (event) => {
        onDownloadProgress(event.loaded)
      })
    },
  })
  try {
    return await session.prompt(input, { signal })
  } finally {
    // Always release the native session, including on errors and cancellation.
    session.destroy()
  }
}

// IMAGE: independent capability declarations and native session.
export const imageOptions = {
  expectedInputs: [{ type: 'text', languages: ['en'] }, { type: 'image' }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
} as const satisfies LanguageModelCreateCoreOptions

export async function imageAvailability(): Promise<Availability> {
  if (!('LanguageModel' in self)) return 'unavailable'
  return LanguageModel.availability(imageOptions)
}

export async function runImageExercise(
  input: string,
  image: File,
  signal: AbortSignal,
  onDownloadProgress: (fraction: number) => void,
): Promise<string> {
  const status = await imageAvailability()
  if (status === 'unavailable')
    throw new Error('Image prompting is unavailable on this device.')
  if (!image.type.startsWith('image/')) throw new Error('Choose an image file.')
  const session = await LanguageModel.create({
    ...imageOptions,
    signal,
    monitor(m) {
      m.addEventListener('downloadprogress', (event) =>
        onDownloadProgress(event.loaded),
      )
    },
  })
  try {
    return await session.prompt(
      [
        {
          role: 'user',
          content: [
            { type: 'text', value: input },
            { type: 'image', value: image },
          ],
        },
      ],
      { signal },
    )
  } finally {
    session.destroy()
  }
}

// STREAMING: independent text configuration and native session.
export const streamingOptions = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
} as const satisfies LanguageModelCreateCoreOptions

export async function streamingAvailability(): Promise<Availability> {
  if (!('LanguageModel' in self)) return 'unavailable'
  return LanguageModel.availability(streamingOptions)
}

export async function runStreamingExercise(
  input: string,
  signal: AbortSignal,
  onDownloadProgress: (fraction: number) => void,
  onPartialOutput: (textSoFar: string) => void,
): Promise<string> {
  const status = await streamingAvailability()
  if (status === 'unavailable')
    throw new Error('Streaming prompting is unavailable on this device.')
  const session = await LanguageModel.create({
    ...streamingOptions,
    signal,
    monitor(m) {
      m.addEventListener('downloadprogress', (event) =>
        onDownloadProgress(event.loaded),
      )
    },
  })
  try {
    let output = ''
    for await (const chunk of session.promptStreaming(input, { signal })) {
      signal.throwIfAborted()
      output += chunk
      onPartialOutput(output)
    }
    signal.throwIfAborted()
    return output
  } finally {
    session.destroy()
  }
}
