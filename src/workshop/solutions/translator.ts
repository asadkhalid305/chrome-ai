// Native browser code only: no React or project-helper imports.
// Official guide: https://developer.chrome.com/docs/ai/translator-api
// Configuration: German input and English output using BCP 47 language codes.
// Use the same options for availability and creation.
export const options = {
  sourceLanguage: 'de',
  targetLanguage: 'en',
} as const satisfies TranslatorCreateCoreOptions

export async function availability(): Promise<Availability> {
  if (!('Translator' in self)) return 'unavailable'
  return Translator.availability(options)
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
  const session = await Translator.create({
    ...options,
    signal,
    monitor(m) {
      m.addEventListener('downloadprogress', (event) => {
        onDownloadProgress(event.loaded)
      })
    },
  })
  try {
    return await session.translate(input, { signal })
  } finally {
    // Always release the native session, including on errors and cancellation.
    session.destroy()
  }
}
