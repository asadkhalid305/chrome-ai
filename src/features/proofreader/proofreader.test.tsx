import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ProofreaderDemo } from './proofreader-demo'
import {
  proofreaderApi,
  type ProofreaderAdapter,
  type ProofreaderSession,
} from './proofreader-api'
import { useProofreader } from './use-proofreader'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Proofreader demo', () => {
  it('reports unavailable when the native global is absent', async () => {
    vi.stubGlobal('Proofreader', undefined)

    await expect(proofreaderApi.availability()).resolves.toBe('unavailable')
  })

  it('destroys its proofreader session on cleanup', async () => {
    const session: ProofreaderSession = {
      proofread: vi.fn().mockResolvedValue({
        correctedInput: 'This is correct.',
        corrections: [],
      }),
      destroy: vi.fn(),
    }
    const adapter: ProofreaderAdapter = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue(session),
    }
    const { result, unmount } = renderHook(() => useProofreader(adapter))

    await waitFor(() => expect(result.current.capability).toBe('ready'))
    await act(() => result.current.proofread('This is correct.'))
    unmount()

    expect(session.destroy).toHaveBeenCalledOnce()
  })

  it('renders correction details as text without changing the original', async () => {
    vi.stubGlobal('Proofreader', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        proofread: vi.fn().mockResolvedValue({
          correctedInput:
            'Yesterday I received an email about the new browser API. We were surprised that the model only downloads once, and we did not notice any delay on their second run.',
          // The indices address the demo's seeded text, which is what the
          // component slices to show each correction in place.
          corrections: [
            {
              startIndex: 140,
              endIndex: 145,
              correction: 'their',
              types: ['grammar'],
              explanation: 'Use the possessive "their" before a noun.',
            },
          ],
        }),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<ProofreaderDemo accent="green" />)
    const original = screen.getByRole('textbox', { name: 'Original text' })
    const originalValue = (original as HTMLTextAreaElement).value

    await user.click(
      await screen.findByRole('button', { name: 'Inspect corrections' }),
    )

    expect(original).toHaveValue(originalValue)
    expect(await screen.findByText('grammar')).toBeVisible()
    expect(
      screen.getByText('Use the possessive "their" before a noun.'),
    ).toBeVisible()

    await user.clear(original)
    await user.type(original, 'A different sentence.')

    expect(screen.getByText('there')).toBeVisible()
    expect(original).toHaveValue('A different sentence.')
  })

  it('renders a missing-text correction and says why labels are absent', async () => {
    vi.stubGlobal('Proofreader', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        // Chrome reports missing text as an empty range and returns no category
        // or explanation today, which is the result that previously rendered as
        // an empty "Original" line next to two "Not provided" rows.
        proofread: vi.fn().mockResolvedValue({
          correctedInput: 'Yesterday, i recieved a email.',
          corrections: [{ startIndex: 9, endIndex: 9, correction: ',' }],
        }),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<ProofreaderDemo accent="green" />)

    await user.click(
      await screen.findByRole('button', { name: 'Inspect corrections' }),
    )

    expect(await screen.findByText('Insert:')).toBeVisible()
    expect(screen.getByText('insertion point')).toBeInTheDocument()
    expect(screen.getByText('Characters 9–9')).toBeVisible()
    expect(screen.getByText(/returns positions and/)).toBeVisible()
    expect(screen.queryByText('Not provided')).not.toBeInTheDocument()
  })

  it('distinguishes a successful result with no corrections', async () => {
    vi.stubGlobal('Proofreader', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        proofread: vi.fn().mockResolvedValue({
          correctedInput: 'This sentence is correct.',
          corrections: [],
        }),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<ProofreaderDemo accent="green" />)

    await user.click(
      await screen.findByRole('button', { name: 'Inspect corrections' }),
    )

    expect(
      await screen.findByText(
        'No corrections were suggested. The API ran successfully.',
      ),
    ).toBeVisible()
  })

  it('reports model download progress and cancels preparation', async () => {
    const adapter: ProofreaderAdapter = {
      availability: vi.fn().mockResolvedValue('downloadable'),
      create: vi.fn((onDownloadProgress, signal) => {
        onDownloadProgress(0.4)
        return new Promise<ProofreaderSession>((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            reject(new DOMException('Canceled', 'AbortError'))
          })
        })
      }),
    }
    const { result } = renderHook(() => useProofreader(adapter))

    await waitFor(() => expect(result.current.capability).toBe('downloadable'))
    act(() => {
      void result.current.proofread('Text to inspect.')
    })
    await waitFor(() => expect(result.current.downloadProgress).toBe(0.4))

    act(() => result.current.cancel())

    await waitFor(() => expect(result.current.request).toBe('canceled'))
    expect(result.current.capability).toBe('downloadable')
    expect(result.current.downloadProgress).toBeNull()
  })

  it('lets the user join an in-progress model download', async () => {
    vi.stubGlobal('Proofreader', {
      availability: vi.fn().mockResolvedValue('downloading'),
      create: vi.fn().mockResolvedValue({
        proofread: vi.fn().mockResolvedValue({
          correctedInput: 'Prepared sentence.',
          corrections: [],
        }),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<ProofreaderDemo accent="green" />)

    const action = await screen.findByRole('button', {
      name: 'Download model and proofread',
    })
    expect(action).toBeEnabled()
    await user.click(action)

    expect(
      await screen.findByText(
        'No corrections were suggested. The API ran successfully.',
      ),
    ).toBeVisible()
  })
})
