import {
  readBrowserApi,
  withDownloadMonitor,
} from '../../chrome-ai/browser-globals'

export type PromptExtension = 'structured' | 'image' | 'stream'
export type ExtensionSession = Pick<
  LanguageModel,
  'prompt' | 'promptStreaming' | 'destroy'
>

// Image capability must be checked with the same declarations used at creation.
export function extensionOptions(
  mode: PromptExtension,
): LanguageModelCreateCoreOptions {
  return {
    expectedInputs:
      mode === 'image'
        ? [{ type: 'text', languages: ['en'] }, { type: 'image' }]
        : [{ type: 'text', languages: ['en'] }],
    expectedOutputs: [{ type: 'text', languages: ['en'] }],
  }
}

export interface PromptExtensionsAdapter {
  availability(mode: PromptExtension): Promise<Availability>
  create(
    mode: PromptExtension,
    progress: (value: number) => void,
    signal?: AbortSignal,
  ): Promise<ExtensionSession>
}

export const promptExtensionsApi: PromptExtensionsAdapter = {
  async availability(mode) {
    const factory = readBrowserApi<typeof LanguageModel>('LanguageModel')
    return factory
      ? factory.availability(extensionOptions(mode))
      : 'unavailable'
  },
  async create(mode, progress, signal) {
    const factory = readBrowserApi<typeof LanguageModel>('LanguageModel')
    if (!factory)
      throw new Error('The Prompt API is not available in this browser.')
    return factory.create(
      withDownloadMonitor({ ...extensionOptions(mode), signal }, progress),
    )
  },
}
