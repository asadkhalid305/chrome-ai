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

import { WriterDemo } from './writer-demo'
import {
  writerApi,
  type WriterAdapter,
  type WriterSession,
} from './writer-api'
import { useWriter } from './use-writer'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Writer lesson', () => {
  it('reports unavailable when the native global is absent', async () => {
    vi.stubGlobal('Writer', undefined)

    await expect(writerApi.availability()).resolves.toBe('unavailable')
  })

  it('reuses and destroys its writer session', async () => {
    const session: WriterSession = {
      write: vi.fn().mockResolvedValue('A generated draft.'),
      destroy: vi.fn(),
    }
    const adapter: WriterAdapter = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue(session),
    }
    const { result, unmount } = renderHook(() => useWriter(adapter))

    await waitFor(() => expect(result.current.capability).toBe('ready'))
    await act(() => result.current.write('First idea', 'Context'))
    await act(() => result.current.write('Second idea', 'Context'))

    expect(adapter.create).toHaveBeenCalledOnce()
    expect(session.write).toHaveBeenCalledTimes(2)
    unmount()
    expect(session.destroy).toHaveBeenCalledOnce()
  })

  it('keeps the idea and exposes an editable generated draft', async () => {
    vi.stubGlobal('Writer', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        write: vi.fn().mockResolvedValue('Join our friendly study session.'),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<WriterDemo />)
    const idea = screen.getByRole('textbox', { name: 'Writing idea' })

    await user.click(await screen.findByRole('button', { name: 'Create draft' }))

    expect(idea).toHaveValue(
      'Invite the local web community to a hands-on AI study session.',
    )
    const draft = await screen.findByRole('textbox', {
      name: 'Editable generated draft',
    })
    expect(draft).toHaveValue('Join our friendly study session.')
    await user.type(draft, ' Please RSVP.')
    expect(draft).toHaveValue(
      'Join our friendly study session. Please RSVP.',
    )
  })

  it('lets the user join an in-progress model download', async () => {
    vi.stubGlobal('Writer', {
      availability: vi.fn().mockResolvedValue('downloading'),
      create: vi.fn().mockResolvedValue({
        write: vi.fn().mockResolvedValue('Draft created after preparation.'),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<WriterDemo />)

    const action = await screen.findByRole('button', {
      name: 'Download model and write',
    })
    expect(action).toBeEnabled()
    await user.click(action)

    expect(
      await screen.findByDisplayValue('Draft created after preparation.'),
    ).toBeVisible()
  })

  it('shares concurrent session preparation instead of creating twice', async () => {
    let resolveCreation: (session: WriterSession) => void = () => undefined
    const session: WriterSession = {
      write: vi.fn().mockResolvedValue('A generated draft.'),
      destroy: vi.fn(),
    }
    const adapter: WriterAdapter = {
      availability: vi.fn().mockResolvedValue('downloadable'),
      create: vi.fn(
        () =>
          new Promise<WriterSession>((resolve) => {
            resolveCreation = resolve
          }),
      ),
    }
    const { result } = renderHook(() => useWriter(adapter))

    await waitFor(() => expect(result.current.capability).toBe('downloadable'))
    let firstWrite: Promise<void>
    let secondWrite: Promise<void>
    act(() => {
      firstWrite = result.current.write('First idea', '')
      secondWrite = result.current.write('Second idea', '')
    })

    expect(adapter.create).toHaveBeenCalledOnce()
    await act(async () => {
      resolveCreation(session)
      await Promise.all([firstWrite!, secondWrite!])
    })

    expect(session.write).toHaveBeenCalledTimes(2)
  })
})
