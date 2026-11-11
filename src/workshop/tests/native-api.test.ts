import { afterEach, describe, expect, it, vi } from 'vitest'
// The same acceptance checks validate references by default and participants'
// implementations with `npm run check:exercises`. No exercise is auto-completed.
const [summarizer, translator, prompt] =
  import.meta.env.MODE === 'exercise-check'
    ? await Promise.all([
        import('../exercises/summarizer'),
        import('../exercises/translator'),
        import('../exercises/prompt'),
      ])
    : await Promise.all([
        import('../solutions/summarizer'),
        import('../solutions/translator'),
        import('../solutions/prompt'),
      ])

afterEach(() => vi.unstubAllGlobals())

for (const [name, native, method, solution, expectedOptions] of [
  [
    'Summarizer',
    'Summarizer',
    'summarize',
    summarizer,
    {
      type: 'key-points',
      format: 'plain-text',
      length: 'short',
      expectedInputLanguages: ['en'],
      outputLanguage: 'en',
    },
  ],
  [
    'Translator',
    'Translator',
    'translate',
    translator,
    { sourceLanguage: 'de', targetLanguage: 'en' },
  ],
  [
    'Prompt text',
    'LanguageModel',
    'prompt',
    prompt,
    {
      expectedInputs: [{ type: 'text', languages: ['en'] }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
    },
  ],
] as const) {
  describe(name, () => {
    it('handles an absent global without trying to create a model', async () => {
      vi.stubGlobal(native, undefined)
      // A browser may expose an undefined property; absence is tested by deletion.
      Reflect.deleteProperty(self, native)
      expect(await solution.availability()).toBe('unavailable')
    })

    it('checks capability before execution and never creates an unavailable session', async () => {
      const create = vi.fn()
      const availability = vi.fn().mockResolvedValue('unavailable')
      vi.stubGlobal(native, { availability, create })
      await expect(
        solution.runExercise('Hello', new AbortController().signal, vi.fn()),
      ).rejects.toThrow('unavailable')
      expect(availability).toHaveBeenCalledWith(solution.options)
      expect(create).not.toHaveBeenCalled()
    })

    it('forwards options and download progress, returns text, and destroys the native session', async () => {
      expect(solution.options).toEqual(expect.objectContaining(expectedOptions))
      const destroy = vi.fn()
      const operation = vi.fn().mockResolvedValue('Useful output')
      const availability = vi.fn().mockResolvedValue('downloadable')
      const create = vi.fn().mockImplementation(async (options) => {
        options.monitor({
          addEventListener: (
            _type: string,
            listener: (event: { loaded: number }) => void,
          ) => listener({ loaded: 0.5 }),
        })
        return { [method]: operation, destroy }
      })
      vi.stubGlobal(native, { availability, create })
      expect(await solution.availability()).toBe('downloadable')
      expect(availability).toHaveBeenCalledWith(solution.options)
      const controller = new AbortController()
      const progress = vi.fn()
      expect(
        await solution.runExercise('Hello', controller.signal, progress),
      ).toBe('Useful output')
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...solution.options,
          signal: controller.signal,
          monitor: expect.any(Function),
        }),
      )
      if (name === 'Prompt text') {
        expect(create.mock.calls[0][0].initialPrompts?.[0]).toEqual(
          expect.objectContaining({
            role: 'system',
            content: expect.stringMatching(/\S/),
          }),
        )
      }
      expect(progress).toHaveBeenCalledWith(0.5)
      expect(operation).toHaveBeenCalledWith('Hello', {
        signal: controller.signal,
      })
      expect(destroy).toHaveBeenCalledOnce()
    })

    it.each([
      new Error('Model failed'),
      new DOMException('Canceled', 'AbortError'),
    ])(
      'destroys the session when the operation rejects: %s',
      async (reason) => {
        const destroy = vi.fn()
        vi.stubGlobal(native, {
          availability: vi.fn().mockResolvedValue('available'),
          create: vi.fn().mockResolvedValue({
            [method]: vi.fn().mockRejectedValue(reason),
            destroy,
          }),
        })
        await expect(
          solution.runExercise('Hello', new AbortController().signal, vi.fn()),
        ).rejects.toBe(reason)
        expect(destroy).toHaveBeenCalledOnce()
      },
    )
  })
}

describe('Prompt image', () => {
  it('checks each configuration independently and rejects unavailable image input before creation', async () => {
    const availability = vi.fn((options) =>
      Promise.resolve(
        options === prompt.imageOptions ? 'unavailable' : 'available',
      ),
    )
    const create = vi.fn()
    vi.stubGlobal('LanguageModel', { availability, create })
    expect(await prompt.imageAvailability()).toBe('unavailable')
    await expect(
      prompt.runImageExercise(
        'Describe',
        new File(['x'], 'photo.png', { type: 'image/png' }),
        new AbortController().signal,
        vi.fn(),
      ),
    ).rejects.toThrow('unavailable')
    expect(availability).toHaveBeenCalledWith(prompt.imageOptions)
    expect(create).not.toHaveBeenCalled()
  })

  it.each([false, true])(
    'forwards the image File and destroys the session (failure: %s)',
    async (fails) => {
      const destroy = vi.fn()
      const operation = fails
        ? vi.fn().mockRejectedValue(new Error('Image failed'))
        : vi.fn().mockResolvedValue('A red square')
      const create = vi.fn().mockResolvedValue({ prompt: operation, destroy })
      const availability = vi.fn().mockResolvedValue('available')
      vi.stubGlobal('LanguageModel', { availability, create })
      expect(prompt.imageOptions).toEqual(
        expect.objectContaining({
          expectedInputs: expect.arrayContaining([
            { type: 'text', languages: ['en'] },
            { type: 'image' },
          ]),
          expectedOutputs: [{ type: 'text', languages: ['en'] }],
        }),
      )
      const image = new File(['pixels'], 'square.png', { type: 'image/png' })
      const signal = new AbortController().signal
      const pending = prompt.runImageExercise(
        'Describe',
        image,
        signal,
        vi.fn(),
      )
      if (fails) await expect(pending).rejects.toThrow('Image failed')
      else expect(await pending).toBe('A red square')
      expect(availability).toHaveBeenCalledWith(prompt.imageOptions)
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ ...prompt.imageOptions, signal }),
      )
      expect(operation).toHaveBeenCalledWith(
        [
          {
            role: 'user',
            content: [
              { type: 'text', value: 'Describe' },
              { type: 'image', value: image },
            ],
          },
        ],
        { signal },
      )
      expect(destroy).toHaveBeenCalledOnce()
    },
  )
})

describe('Prompt streaming', () => {
  it('accumulates streamed chunks and destroys the session after completion', async () => {
    const destroy = vi.fn()
    const promptStreaming = vi.fn(
      () =>
        new ReadableStream<string>({
          start(controller) {
            controller.enqueue('First ')
            controller.enqueue('second')
            controller.close()
          },
        }),
    )
    const create = vi.fn().mockResolvedValue({ promptStreaming, destroy })
    vi.stubGlobal('LanguageModel', {
      availability: vi.fn().mockResolvedValue('available'),
      create,
    })
    const signal = new AbortController().signal
    const partial = vi.fn()
    expect(prompt.streamingOptions).toEqual(
      expect.objectContaining({
        expectedInputs: [{ type: 'text', languages: ['en'] }],
        expectedOutputs: [{ type: 'text', languages: ['en'] }],
      }),
    )
    expect(
      await prompt.runStreamingExercise('Explain', signal, vi.fn(), partial),
    ).toBe('First second')
    expect(partial.mock.calls).toEqual([['First '], ['First second']])
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ ...prompt.streamingOptions, signal }),
    )
    expect(promptStreaming).toHaveBeenCalledWith('Explain', { signal })
    expect(destroy).toHaveBeenCalledOnce()
  })

  it('ignores chunks after cancellation and destroys the streaming session', async () => {
    let stream: ReadableStreamDefaultController<string>
    const destroy = vi.fn()
    vi.stubGlobal('LanguageModel', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        destroy,
        promptStreaming: () =>
          new ReadableStream<string>({
            start(controller) {
              stream = controller
              controller.enqueue('First')
            },
          }),
      }),
    })
    const controller = new AbortController()
    const partial = vi.fn()
    const pending = prompt.runStreamingExercise(
      'Explain',
      controller.signal,
      vi.fn(),
      partial,
    )
    await vi.waitFor(() => expect(partial).toHaveBeenCalledWith('First'))
    controller.abort()
    stream!.enqueue('late')
    stream!.close()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(partial).toHaveBeenCalledOnce()
    expect(destroy).toHaveBeenCalledOnce()
  })
})
