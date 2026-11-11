import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptExtensionsDemo } from './prompt-extensions-demo'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  promptExtensionsApi,
  type ExtensionSession,
  type PromptExtensionsAdapter,
} from './prompt-extensions-api'
import { parseFeedback } from './structured-feedback'
import { usePromptExtension } from './use-prompt-extension'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function fakeAdapter(
  model: Partial<ExtensionSession>,
): PromptExtensionsAdapter {
  return {
    availability: vi.fn().mockResolvedValue('available'),
    create: vi.fn().mockResolvedValue({ destroy: vi.fn(), ...model }),
  }
}

describe('Prompt production extensions', () => {
  it('rejects malformed structured responses and unexpected fields', () => {
    for (const text of [
      'bad JSON',
      'null',
      '[]',
      '{"sentiment":["positive"],"summary":"x"}',
      '{"sentiment":"positive"}',
      '{"sentiment":"unknown","summary":"x"}',
      '{"sentiment":"mixed","summary":"x","extra":true}',
    ]) {
      expect(() => parseFeedback(text)).toThrow()
    }
    expect(
      parseFeedback('{"sentiment":"mixed","summary":"Useful but slow"}')
        .sentiment,
    ).toBe('mixed')
  })

  it('checks the same image modalities at availability and creation', async () => {
    const availability = vi.fn().mockResolvedValue('available')
    const create = vi.fn().mockResolvedValue({ destroy: vi.fn() })
    vi.stubGlobal('LanguageModel', { availability, create })
    await promptExtensionsApi.availability('image')
    await promptExtensionsApi.create('image', vi.fn())
    const options = availability.mock.calls[0][0]
    expect(options.expectedInputs).toContainEqual({ type: 'image' })
    expect(create).toHaveBeenCalledWith(expect.objectContaining(options))
  })

  it('surfaces structured validation failure and destroys its session', async () => {
    const destroy = vi.fn()
    const prompt = vi.fn().mockResolvedValue('{"sentiment":"positive"}')
    const adapter = fakeAdapter({ prompt, destroy })
    const { result, unmount } = renderHook(() =>
      usePromptExtension('structured', adapter),
    )
    await waitFor(() => expect(result.current.capability).toBe('ready'))
    await act(() => result.current.run('feedback', null))
    expect(result.current.request).toBe('error')
    expect(prompt).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        responseConstraint: expect.any(Object),
        signal: expect.any(AbortSignal),
      }),
    )
    unmount()
    expect(destroy).toHaveBeenCalledOnce()
  })

  it('streams partial text, forwards cancellation, and ignores chunks after abort', async () => {
    let release: () => void = () => {}
    const promptStreaming = vi.fn(
      (_input: LanguageModelPrompt, options?: LanguageModelPromptOptions) =>
        new ReadableStream<string>({
          async start(controller) {
            controller.enqueue('First ')
            await new Promise<void>((resolve) => {
              release = resolve
            })
            expect(options?.signal?.aborted).toBe(true)
            controller.enqueue('late chunk')
            controller.close()
          },
        }),
    )
    const adapter = fakeAdapter({ promptStreaming })
    const { result } = renderHook(() => usePromptExtension('stream', adapter))
    await waitFor(() => expect(result.current.capability).toBe('ready'))
    let pending: Promise<void>
    act(() => {
      pending = result.current.run('Explain', null)
    })
    await waitFor(() => expect(result.current.partial).toBe('First '))
    act(() => {
      result.current.cancel()
      release()
    })
    await act(() => pending!)
    expect(result.current.request).toBe('canceled')
    expect(result.current.partial).toBe('First ')
  })

  it('passes the selected image directly to the native prompt', async () => {
    const prompt = vi.fn().mockResolvedValue('A diagram')
    const adapter = fakeAdapter({ prompt })
    const { result } = renderHook(() => usePromptExtension('image', adapter))
    await waitFor(() => expect(result.current.capability).toBe('ready'))
    const image = new File(['pixels'], 'diagram.png', { type: 'image/png' })
    await act(() => result.current.run('Describe', image))
    expect(prompt.mock.calls[0][0][0].content[1]).toEqual({
      type: 'image',
      value: image,
    })
    expect(result.current.output).toBe('A diagram')
  })
})

describe('Prompt extension presentation', () => {
  it('shows a themed image chooser, selected filename, and enables image submission', async () => {
    vi.stubGlobal('LanguageModel', {
      availability: vi.fn().mockResolvedValue('available'),
    })
    const user = userEvent.setup()
    render(<PromptExtensionsDemo accent="blue" />)
    await user.click(
      screen.getByText(
        'Production extensions: structured output, image input, streaming',
      ),
    )
    await user.selectOptions(screen.getByLabelText('Prompt extension'), 'image')
    expect(await screen.findByText('Choose image')).toBeVisible()
    expect(screen.getByText('No image selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Run extension' })).toBeDisabled()
    await user.upload(
      screen.getByLabelText('Local image'),
      new File(['pixels'], 'diagram.png', { type: 'image/png' }),
    )
    expect(screen.getByText('diagram.png')).toBeVisible()
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Run extension' }),
      ).toBeEnabled(),
    )
  })

  it('appends streamed chunks inside the output panel before completion and retains them on cancel', async () => {
    let streamController: ReadableStreamDefaultController<string>
    vi.stubGlobal('LanguageModel', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        destroy: vi.fn(),
        promptStreaming: (
          _input: LanguageModelPrompt,
          options?: LanguageModelPromptOptions,
        ) =>
          new ReadableStream<string>({
            start(controller) {
              streamController = controller
                options?.signal?.addEventListener('abort', () =>
                controller.error(new DOMException('Canceled', 'AbortError')),
              )
            },
          }),
      }),
    })
    const user = userEvent.setup()
    render(<PromptExtensionsDemo accent="blue" />)
    await user.click(
      screen.getByText(
        'Production extensions: structured output, image input, streaming',
      ),
    )
    await user.selectOptions(
      screen.getByLabelText('Prompt extension'),
      'stream',
    )
    const action = screen.getByRole('button', { name: 'Run extension' })
    await waitFor(() => expect(action).toBeEnabled())
    await user.click(action)
    expect(screen.queryByText('Running on your device…')).not.toBeInTheDocument()
    act(() => streamController!.enqueue('First chunk'))
    const partial = await screen.findByLabelText('Partial model output')
    const panel = partial.closest('[aria-live="polite"]')
    expect(panel).toHaveClass('bg-slate-950')
    expect(panel).not.toHaveTextContent('Running on your device…')
    act(() => streamController!.enqueue(' plus next chunk'))
    await waitFor(() =>
      expect(partial).toHaveTextContent('First chunk plus next chunk'),
    )
    await user.click(screen.getByRole('button', { name: 'Cancel extension' }))
    await waitFor(() => expect(panel).toHaveTextContent('Request canceled.'))
    expect(partial).toHaveTextContent('First chunk plus next chunk')
  })
})
