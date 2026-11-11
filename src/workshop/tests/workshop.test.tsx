import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.doUnmock('../exercises/prompt')
  vi.doUnmock('../exercises/summarizer')
  vi.doUnmock('../exercises/translator')
  vi.resetModules()
  window.history.replaceState(null, '', '/')
})

it('offers three exercises and makes unfinished code distinct from unsupported hardware', async () => {
  vi.stubEnv('MODE', 'workshop')
  vi.stubGlobal('Summarizer', { availability: vi.fn() })
  vi.doMock('../exercises/summarizer', () => ({
    availability: vi.fn().mockRejectedValue(new Error('Complete TODO 2')),
    runExercise: vi.fn(),
  }))
  vi.doMock('../exercises/translator', () => ({
    availability: vi.fn().mockResolvedValue('unavailable'),
    runExercise: vi.fn(),
  }))
  vi.resetModules()
  const { App } = await import('../../app/app')
  const user = userEvent.setup()
  render(<App />)
  expect(screen.getAllByRole('tab')).toHaveLength(3)
  expect(screen.getByRole('tab', { name: '1. Summarizer' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  expect(await screen.findByRole('alert')).toHaveTextContent('Complete TODO 2')
  expect(screen.getByRole('button', { name: 'Summarize' })).toBeDisabled()
  expect(screen.getByLabelText('Article text')).not.toHaveValue('')
  await user.click(screen.getByRole('tab', { name: '2. Translator' }))
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('Unavailable'),
  )
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  await user.click(screen.getByRole('tab', { name: '3. Prompt' }))
  expect(screen.getByLabelText('Email to reply to')).toBeVisible()
  expect(
    within(screen.getByRole('complementary')).getByText(
      'src/workshop/exercises/prompt.ts',
    ),
  ).toBeVisible()
})

it('runs the image choice, renders partial text, and aborts when switching choices', async () => {
  const imageRun = vi.fn().mockResolvedValue('A diagram')
  let streamingSignal: AbortSignal
  let publish: (text: string) => void
  const streamRun = vi.fn((_input, signal, _progress, partial) => {
    streamingSignal = signal
    publish = partial
    return new Promise<string>((_resolve, reject) => {
      signal.addEventListener(
        'abort',
        () => reject(new DOMException('Canceled', 'AbortError')),
        { once: true },
      )
    })
  })
  vi.doMock('../exercises/prompt', () => ({
    availability: vi.fn().mockResolvedValue('available'),
    runExercise: vi.fn(),
    imageAvailability: vi.fn().mockResolvedValue('available'),
    runImageExercise: imageRun,
    streamingAvailability: vi.fn().mockResolvedValue('available'),
    runStreamingExercise: streamRun,
  }))
  vi.resetModules()
  const { PromptWorkshop } = await import('../ui/prompt-workshop')
  const user = userEvent.setup()
  render(<PromptWorkshop accent="blue" />)
  const choice = within(screen.getByRole('group', { name: 'Prompt exercise' }))
  await user.click(choice.getByRole('button', { name: 'Image' }))
  const describe = screen.getByRole('button', { name: 'Describe image' })
  expect(describe).toBeDisabled()
  const image = new File(['pixels'], 'diagram.png', { type: 'image/png' })
  await user.upload(screen.getByLabelText('Local image'), image)
  await waitFor(() => expect(describe).toBeEnabled())
  await user.click(describe)
  expect(await screen.findByLabelText('Model output')).toHaveTextContent(
    'A diagram',
  )
  expect(imageRun.mock.calls[0][1]).toBe(image)
  await user.click(
    choice.getByRole('button', { name: 'Streaming' }),
  )
  const stream = screen.getByRole('button', { name: 'Stream answer' })
  await waitFor(() => expect(stream).toBeEnabled())
  await user.click(stream)
  act(() => publish!('First chunk'))
  expect(
    await screen.findByLabelText('Partial model output'),
  ).toHaveTextContent('First chunk')
  await user.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(await screen.findByText('Request canceled.')).toBeVisible()
  expect(screen.getByLabelText('Partial model output')).toHaveTextContent(
    'First chunk',
  )
  await user.click(stream)
  await user.click(choice.getByRole('button', { name: 'Text' }))
  expect(streamingSignal!.aborted).toBe(true)
  act(() => publish!('Late output'))
  expect(
    screen.queryByLabelText('Partial model output'),
  ).not.toBeInTheDocument()
  expect(screen.getByLabelText('Email to reply to')).toBeVisible()
})
