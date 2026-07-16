import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TranslatorDemo } from './translator-demo'
import {
  translatorApi,
  type TranslatorAdapter,
  type TranslatorSession,
} from './translator-api'
import { useTranslator } from './use-translator'

afterEach(() => vi.unstubAllGlobals())

describe('Translator lesson', () => {
  it('uses the native Translator factory with the selected language pair', async () => {
    const session = { translate: vi.fn(), destroy: vi.fn() }
    const create = vi.fn().mockResolvedValue(session)
    vi.stubGlobal('Translator', {
      availability: vi.fn().mockResolvedValue('available'),
      create,
    })

    await translatorApi.create({ sourceLanguage: 'de', targetLanguage: 'en' }, vi.fn())

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ sourceLanguage: 'de', targetLanguage: 'en' }),
    )
  })

  it('runs a translation and destroys its session during cleanup', async () => {
    const session: TranslatorSession = {
      translate: vi.fn().mockResolvedValue('Built-in AI runs locally.'),
      destroy: vi.fn(),
    }
    const adapter: TranslatorAdapter = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue(session),
    }
    const { result, unmount } = renderHook(() =>
      useTranslator({ sourceLanguage: 'de', targetLanguage: 'en' }, adapter),
    )

    await waitFor(() => expect(result.current.capability).toBe('ready'))
    await act(() => result.current.translate('Browser-KI läuft lokal.'))

    expect(result.current.output).toBe('Built-in AI runs locally.')
    expect(result.current.request).toBe('success')
    unmount()
    expect(session.destroy).toHaveBeenCalledOnce()
  })

  it('destroys a session that finishes creating after cleanup', async () => {
    const session: TranslatorSession = {
      translate: vi.fn(),
      destroy: vi.fn(),
    }
    let resolveCreate: (session: TranslatorSession) => void = () => undefined
    const adapter: TranslatorAdapter = {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn(
        () =>
          new Promise<TranslatorSession>((resolve) => {
            resolveCreate = resolve
          }),
      ),
    }
    const { result, unmount } = renderHook(() =>
      useTranslator({ sourceLanguage: 'de', targetLanguage: 'en' }, adapter),
    )

    await waitFor(() => expect(result.current.capability).toBe('ready'))
    let request: Promise<void>
    act(() => {
      request = result.current.translate('Browser-KI läuft lokal.')
    })
    unmount()
    resolveCreate(session)
    await request!

    expect(session.destroy).toHaveBeenCalledOnce()
    expect(session.translate).not.toHaveBeenCalled()
  })

  it('is operable through its accessible form controls', async () => {
    vi.stubGlobal('Translator', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        translate: vi.fn().mockResolvedValue('Translated on device.'),
        destroy: vi.fn(),
      }),
    })
    const user = userEvent.setup()
    render(<TranslatorDemo />)

    await user.click(await screen.findByRole('button', { name: 'Translate' }))

    expect(await screen.findByText('Translated on device.')).toBeVisible()
  })
})
