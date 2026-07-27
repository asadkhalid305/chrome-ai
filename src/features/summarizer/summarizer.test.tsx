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

  it('creates one session when two requests race an in-progress download', async () => {
    let resolveCreation: (session: SummarizerSession) => void = () => undefined
    const session: SummarizerSession = {
      summarize: vi.fn().mockResolvedValue('• Shared session'),
      destroy: vi.fn(),
    }
    const adapter: SummarizerAdapter = {
      availability: vi.fn().mockResolvedValue('downloadable'),
      create: vi.fn(
        () =>
          new Promise<SummarizerSession>((resolve) => {
            resolveCreation = resolve
          }),
      ),
    }
    const { result, unmount } = renderHook(() => useSummarizer(adapter))

    await waitFor(() => expect(result.current.capability).toBe('downloadable'))
    let first: Promise<void>
    let second: Promise<void>
    act(() => {
      first = result.current.summarize('First article.')
      second = result.current.summarize('Second article.')
    })

    expect(adapter.create).toHaveBeenCalledOnce()
    await act(async () => {
      resolveCreation(session)
      await Promise.all([first!, second!])
    })

    expect(session.summarize).toHaveBeenCalledTimes(2)
    unmount()
    // A second session would have had nothing left holding a reference to it.
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
    render(<SummarizerDemo accent="green" />)

    await user.click(await screen.findByRole('button', { name: 'Summarize' }))

    expect(await screen.findByText('Sessions must be cleaned up.')).toBeVisible()
  })

  it('lets the user join an in-progress model download', async () => {
    vi.stubGlobal('Summarizer', {
      availability: vi.fn().mockResolvedValue('downloading'),
      create: vi.fn().mockResolvedValue({
        summarize: vi.fn().mockResolvedValue('Prepared summary.'),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<SummarizerDemo accent="green" />)

    const action = await screen.findByRole('button', {
      name: 'Download model and summarize',
    })
    expect(action).toBeEnabled()
    await user.click(action)

    expect(await screen.findByText('Prepared summary.')).toBeVisible()
  })
})
