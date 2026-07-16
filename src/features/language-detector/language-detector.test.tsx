import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LanguageDetectorDemo } from './language-detector-demo'
import {
  languageDetectorApi,
  type LanguageDetectorAdapter,
  type LanguageDetectorSession,
} from './language-detector-api'
import { useLanguageDetector } from './use-language-detector'

afterEach(() => vi.unstubAllGlobals())

describe('Language Detector lesson', () => {
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
    render(<LanguageDetectorDemo />)

    await user.click(
      await screen.findByRole('button', { name: 'Detect language' }),
    )

    expect(await screen.findByText('Spanish')).toBeVisible()
    expect(screen.getByText('98.0%')).toBeVisible()
  })
})
