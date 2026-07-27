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

import { LanguageDetectorDemo } from './language-detector-demo'
import {
  languageDetectorApi,
  type LanguageDetectorAdapter,
  type LanguageDetectorSession,
} from './language-detector-api'
import { useLanguageDetector } from './use-language-detector'

afterEach(() => {
  // Two cases in this file render the same detected language, so a leftover DOM
  // from the previous test makes the text query ambiguous.
  cleanup()
  vi.unstubAllGlobals()
})

describe('Language Detector demo', () => {
  it('reports unavailable when the native API is absent', async () => {
    expect(await languageDetectorApi.availability()).toBe('unavailable')
  })

  it('returns ranked candidates and destroys its session', async () => {
    const session: LanguageDetectorSession = {
      detect: vi.fn().mockResolvedValue([
        { detectedLanguage: 'es', confidence: 0.98 },
        { detectedLanguage: 'pt', confidence: 0.02 },
      ]),
      destroy: vi.fn(),
    }
    const adapter: LanguageDetectorAdapter = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue(session),
    }
    const { result, unmount } = renderHook(() => useLanguageDetector(adapter))

    await waitFor(() => expect(result.current.capability).toBe('ready'))
    await act(() => result.current.detect('Este texto está en español.'))

    expect(result.current.results[0]).toEqual({
      detectedLanguage: 'es',
      confidence: 0.98,
    })
    unmount()
    expect(session.destroy).toHaveBeenCalledOnce()
  })

  it('renders confidence-ranked results accessibly', async () => {
    vi.stubGlobal('LanguageDetector', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        detect: vi.fn().mockResolvedValue([
          { detectedLanguage: 'es', confidence: 0.98 },
        ]),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<LanguageDetectorDemo accent="red" />)

    await user.click(
      await screen.findByRole('button', { name: 'Detect language' }),
    )

    expect(await screen.findByText('Spanish')).toBeVisible()
    expect(screen.getByText('98.0%')).toBeVisible()
  })

  it('lets the user join an in-progress model download', async () => {
    vi.stubGlobal('LanguageDetector', {
      availability: vi.fn().mockResolvedValue('downloading'),
      create: vi.fn().mockResolvedValue({
        detect: vi
          .fn()
          .mockResolvedValue([{ detectedLanguage: 'es', confidence: 0.98 }]),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<LanguageDetectorDemo accent="red" />)

    const action = await screen.findByRole('button', {
      name: 'Download model and detect',
    })
    expect(action).toBeEnabled()
    await user.click(action)

    expect(await screen.findByText('Spanish')).toBeVisible()
  })
})
