import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { App } from './app'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Phase 1 lesson tabs', () => {
  it('shows one selected lesson at a time', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(
      screen.getByRole('tab', { name: '1. Translator' }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: 'Translator' })).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Summarizer' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: '3. Summarizer' }))

    expect(
      screen.getByRole('tab', { name: '3. Summarizer' }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: 'Summarizer' })).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Translator' }),
    ).not.toBeInTheDocument()
  })

  it('supports arrow, Home, and End keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<App />)
    const translatorTab = screen.getByRole('tab', { name: '1. Translator' })

    translatorTab.focus()
    await user.keyboard('{ArrowRight}')
    expect(
      screen.getByRole('tab', { name: '2. Language Detector' }),
    ).toHaveFocus()
    expect(
      screen.getByRole('heading', { name: 'Language Detector' }),
    ).toBeVisible()

    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: '4. Prompt' })).toHaveFocus()
    expect(
      screen.getByRole('heading', { name: 'Prompt / LanguageModel' }),
    ).toBeVisible()

    await user.keyboard('{Home}')
    expect(translatorTab).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'Translator' })).toBeVisible()
  })

  it('destroys the active lesson session when switching tabs', async () => {
    const destroy = vi.fn()
    vi.stubGlobal('Translator', {
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        translate: vi.fn().mockResolvedValue('Translated on device.'),
        destroy,
      }),
    })
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Translate' }))
    await screen.findByText('Translated on device.')
    await user.click(screen.getByRole('tab', { name: '3. Summarizer' }))

    await waitFor(() => expect(destroy).toHaveBeenCalledOnce())
  })
})
