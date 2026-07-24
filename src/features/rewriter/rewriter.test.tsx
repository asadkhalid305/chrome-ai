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

import { RewriterDemo } from './rewriter-demo'
import {
  rewriterApi,
  type RewriterAdapter,
  type RewriterSession,
} from './rewriter-api'
import { useRewriter } from './use-rewriter'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Rewriter demo', () => {
  it('passes the selected immutable change to the native API', async () => {
    const create = vi.fn().mockResolvedValue({
      rewrite: vi.fn(),
      destroy: vi.fn(),
    })
    vi.stubGlobal('Rewriter', {
      availability: vi.fn().mockResolvedValue('available'),
      create,
    })

    await rewriterApi.create('shorter', vi.fn())

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ tone: 'as-is', length: 'shorter' }),
    )
  })

  it('destroys the prior session when the requested change changes', async () => {
    const firstSession: RewriterSession = {
      rewrite: vi.fn().mockResolvedValue('Formal result.'),
      destroy: vi.fn(),
    }
    const secondSession: RewriterSession = {
      rewrite: vi.fn().mockResolvedValue('Short result.'),
      destroy: vi.fn(),
    }
    const adapter: RewriterAdapter = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi
        .fn()
        .mockResolvedValueOnce(firstSession)
        .mockResolvedValueOnce(secondSession),
    }
    const { result, unmount } = renderHook(() => useRewriter(adapter))

    await waitFor(() => expect(result.current.capability).toBe('ready'))
    await act(() => result.current.rewrite('Original', 'more-formal'))
    await act(() => result.current.rewrite('Original', 'shorter'))

    expect(firstSession.destroy).toHaveBeenCalledOnce()
    unmount()
    expect(secondSession.destroy).toHaveBeenCalledOnce()
  })

  it('preserves the original while showing a separate rewrite', async () => {
    vi.stubGlobal('Rewriter', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        rewrite: vi.fn().mockResolvedValue('Please join our workshop next week.'),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<RewriterDemo />)
    const original = screen.getByRole('textbox', { name: 'Original text' })
    const originalValue = (original as HTMLTextAreaElement).value

    await user.click(
      await screen.findByRole('button', { name: 'Rewrite separately' }),
    )

    expect(original).toHaveValue(originalValue)
    expect(
      await screen.findByText('Please join our workshop next week.'),
    ).toBeVisible()
  })

  it('shows a native error separately from browser unavailability', async () => {
    vi.stubGlobal('Rewriter', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockRejectedValue(new Error('Trial access was rejected.')),
    })
    const user = userEvent.setup()
    render(<RewriterDemo />)

    await user.click(
      await screen.findByRole('button', { name: 'Rewrite separately' }),
    )

    expect(await screen.findByText('Trial access was rejected.')).toBeVisible()
  })

  it('lets the user join an in-progress model download', async () => {
    vi.stubGlobal('Rewriter', {
      availability: vi.fn().mockResolvedValue('downloading'),
      create: vi.fn().mockResolvedValue({
        rewrite: vi.fn().mockResolvedValue('Prepared rewrite.'),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<RewriterDemo />)

    const action = await screen.findByRole('button', {
      name: 'Download model and rewrite',
    })
    expect(action).toBeEnabled()
    await user.click(action)

    expect(await screen.findByText('Prepared rewrite.')).toBeVisible()
  })

  it('shares concurrent preparation for the same immutable options', async () => {
    let resolveCreation: (session: RewriterSession) => void = () => undefined
    const session: RewriterSession = {
      rewrite: vi.fn().mockResolvedValue('Formal result.'),
      destroy: vi.fn(),
    }
    const adapter: RewriterAdapter = {
      availability: vi.fn().mockResolvedValue('downloadable'),
      create: vi.fn(
        () =>
          new Promise<RewriterSession>((resolve) => {
            resolveCreation = resolve
          }),
      ),
    }
    const { result } = renderHook(() => useRewriter(adapter))

    await waitFor(() => expect(result.current.capability).toBe('downloadable'))
    let firstRewrite: Promise<void>
    let secondRewrite: Promise<void>
    act(() => {
      firstRewrite = result.current.rewrite('First', 'more-formal')
      secondRewrite = result.current.rewrite('Second', 'more-formal')
    })

    expect(adapter.create).toHaveBeenCalledOnce()
    await act(async () => {
      resolveCreation(session)
      await Promise.all([firstRewrite!, secondRewrite!])
    })

    expect(session.rewrite).toHaveBeenCalledTimes(2)
  })
})
