import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SummarizerDemo } from './summarizer-demo'
import {
  summarizerApi,
  type SummarizerAdapter,
  type SummarizerSession,
} from './summarizer-api'
import { useSummarizer } from './use-summarizer'

afterEach(() => vi.unstubAllGlobals())

describe('Summarizer demo', () => {
  it('checks availability with the demo options', async () => {
    const availability = vi.fn().mockResolvedValue('available')
    vi.stubGlobal('Summarizer', { availability, create: vi.fn() })

    await expect(summarizerApi.availability()).resolves.toBe('available')
    expect(availability).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'key-points', format: 'plain-text' }),
    )
  })

  it('reuses and destroys its task session', async () => {
    const session: SummarizerSession = {
      summarize: vi.fn().mockResolvedValue('• Local model\n• Explicit cleanup'),
      destroy: vi.fn(),
    }
    const adapter: SummarizerAdapter = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue(session),
    }
    const { result, unmount } = renderHook(() => useSummarizer(adapter))

    await waitFor(() => expect(result.current.capability).toBe('ready'))
    await act(() => result.current.summarize('A sufficiently long article.'))
    await act(() => result.current.summarize('A second article.'))

    expect(adapter.create).toHaveBeenCalledOnce()
    expect(session.summarize).toHaveBeenCalledTimes(2)
    unmount()
    expect(session.destroy).toHaveBeenCalledOnce()
  })

  it('shows the plain-text summary through the form', async () => {
    vi.stubGlobal('Summarizer', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        summarize: vi.fn().mockResolvedValue('Sessions must be cleaned up.'),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<SummarizerDemo />)

    await user.click(await screen.findByRole('button', { name: 'Summarize' }))

    expect(await screen.findByText('Sessions must be cleaned up.')).toBeVisible()
  })
})
