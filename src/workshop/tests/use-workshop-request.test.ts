import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useWorkshopRequest } from '../ui/use-workshop-request'

afterEach(cleanup)

it('shows download progress, success, and the returned text', async () => {
  const availability = vi.fn().mockResolvedValue('downloadable')
  let finish: (value: string) => void = () => {}
  const execute = vi.fn((_input, _signal, progress) => {
    progress(0.5)
    return new Promise<string>((resolve) => {
      finish = resolve
    })
  })
  const { result } = renderHook(() => useWorkshopRequest(availability, execute))
  await waitFor(() => expect(result.current.capability).toBe('downloadable'))
  let pending: Promise<void>
  act(() => {
    pending = result.current.run('Article')
  })
  expect(result.current.downloadProgress).toBe(0.5)
  expect(result.current.capability).toBe('downloading')
  await act(async () => {
    finish('Summary')
    await pending
  })
  expect(result.current.request).toBe('success')
  expect(result.current.output).toBe('Summary')
  expect(result.current.capability).toBe('ready')
})

it('aborts on cancel and unmount and prevents late success after cancellation', async () => {
  const availability = vi.fn().mockResolvedValue('available')
  let finish: (value: string) => void = () => {}
  const execute = vi.fn(
    (_input, _signal) =>
      new Promise<string>((resolve) => {
        finish = resolve
      }),
  )
  const { result, unmount } = renderHook(() =>
    useWorkshopRequest(availability, execute),
  )
  await waitFor(() => expect(result.current.capability).toBe('ready'))
  let pending: Promise<void>
  act(() => {
    pending = result.current.run('Article')
  })
  act(() => result.current.cancel())
  expect(execute.mock.calls[0][1].aborted).toBe(true)
  await act(async () => {
    finish('Late output')
    await pending
  })
  expect(result.current.request).toBe('canceled')
  expect(result.current.output).toBe('')
  act(() => {
    pending = result.current.run('Another article')
  })
  unmount()
  expect(execute.mock.calls[1][1].aborted).toBe(true)
  await act(async () => {
    finish('Unmounted output')
    await pending
  })
})
