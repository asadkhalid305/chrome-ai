import { useState } from 'react'
import { useChromeAiSession } from '../../chrome-ai/use-chrome-ai-session'
import {
  promptExtensionsApi,
  type ExtensionSession,
  type PromptExtension,
  type PromptExtensionsAdapter,
} from './prompt-extensions-api'
import { feedbackSchema, parseFeedback } from './structured-feedback'

export function usePromptExtension(
  mode: PromptExtension,
  adapter: PromptExtensionsAdapter = promptExtensionsApi,
) {
  const [partial, setPartial] = useState('')
  const session = useChromeAiSession<ExtensionSession, string>({
    availability: () => adapter.availability(mode),
    create: (progress, signal) => adapter.create(mode, progress, signal),
  })

  async function run(input: string, image: File | null) {
    setPartial('')
    await session.run(async (model, signal) => {
      if (mode === 'structured') {
        const result = await model.prompt(
          `Classify this feedback and summarize it briefly in English:\n${input}`,
          {
            signal,
            responseConstraint: feedbackSchema,
          },
        )
        return JSON.stringify(parseFeedback(result), null, 2)
      }
      if (mode === 'image') {
        if (!image || !image.type.startsWith('image/'))
          throw new Error('Choose an image file first.')
        return model.prompt(
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
      }
      let output = ''
      for await (const chunk of model.promptStreaming(input, { signal })) {
        if (signal.aborted) throw new DOMException('Canceled', 'AbortError')
        output += chunk
        setPartial(output)
      }
      return output
    })
  }
  return {
    ...session.state,
    output: session.result ?? '',
    partial,
    run,
    cancel: session.cancel,
  }
}
