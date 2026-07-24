import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PromptDemo } from './prompt-demo'
import {
  promptApi,
  type PromptAdapter,
  type PromptSession,
} from './prompt-api'
import { usePrompt } from './use-prompt'

afterEach(() => vi.unstubAllGlobals())

describe('Prompt demo', () => {
  it('creates a native session with a system instruction', async () => {
    const create = vi.fn().mockResolvedValue({ prompt: vi.fn(), destroy: vi.fn() })
    vi.stubGlobal('LanguageModel', {
      availability: vi.fn().mockResolvedValue('available'),
      create,
    })

    await promptApi.create(vi.fn())

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        initialPrompts: [expect.objectContaining({ role: 'system' })],
      }),
    )
  })

  it('marks an aborted prompt as canceled and destroys the session', async () => {
    const session: PromptSession = {
      prompt: vi.fn((_input: LanguageModelPrompt, options?: LanguageModelPromptOptions) =>
        new Promise<string>((_resolve, reject) => {
          if (options?.signal?.aborted) {
            reject(new DOMException('Canceled', 'AbortError'))
            return
          }
          options?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Canceled', 'AbortError'))
          })
        }),
      ),
      destroy: vi.fn(),
    }
    const adapter: PromptAdapter = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue(session),
    }
    const { result, unmount } = renderHook(() => usePrompt(adapter))

    await waitFor(() => expect(result.current.capability).toBe('ready'))
    let request: Promise<void>
    act(() => {
      request = result.current.prompt('Explain cleanup.')
    })
    act(() => result.current.cancel())
    await act(() => request!)

    expect(result.current.request).toBe('canceled')
    unmount()
    expect(session.destroy).toHaveBeenCalledOnce()
  })

  it('renders model output as plain text', async () => {
    vi.stubGlobal('LanguageModel', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        prompt: vi.fn().mockResolvedValue('<strong>Untrusted text</strong>'),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<PromptDemo />)

    await user.click(await screen.findByRole('button', { name: 'Ask the model' }))

    expect(await screen.findByText('<strong>Untrusted text</strong>')).toBeVisible()
    expect(document.querySelector('strong')).toBeNull()
  })
})
