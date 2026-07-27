import { useChromeAiSession } from '../../chrome-ai/use-chrome-ai-session'
import { promptApi, type PromptAdapter, type PromptSession } from './prompt-api'

export function usePrompt(adapter: PromptAdapter = promptApi) {
  const session = useChromeAiSession<PromptSession, string>({
    availability: () => adapter.availability(),
    create: (onDownloadProgress, signal) =>
      adapter.create(onDownloadProgress, signal),
  })

  async function prompt(input: string) {
    await session.run((languageModel, signal) =>
      languageModel.prompt(input, { signal }),
    )
  }

  return {
    ...session.state,
    output: session.result ?? '',
    prompt,
    cancel: session.cancel,
  }
}
