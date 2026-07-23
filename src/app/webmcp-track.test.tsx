import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

// The WebMCP flag is read at module load, so each case stubs the env before a
// fresh dynamic import of the app shell.
afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.resetModules()
})

async function renderApp() {
  vi.resetModules()
  const { App } = await import('./app')
  render(<App />)
}

describe('WebMCP track feature flag', () => {
  it('hides the WebMCP entry point and leaves the core APIs unchanged by default', async () => {
    await renderApp()

    expect(
      screen.queryByRole('tab', { name: /webmcp/i }),
    ).not.toBeInTheDocument()

    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(7)
    expect(
      screen.getByRole('tab', { name: '1. Translator' }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByRole('tab', { name: '7. Proofreader' }),
    ).toBeInTheDocument()
  })

  it('reveals an accessible WebMCP entry point when VITE_WEBMCP is "true"', async () => {
    vi.stubEnv('VITE_WEBMCP', 'true')
    await renderApp()

    const webmcpTab = screen.getByRole('tab', { name: 'WebMCP track: Introduction' })
    expect(webmcpTab).toBeInTheDocument()

    // The built-in-AI APIs keep their labels and numbers.
    expect(screen.getAllByRole('tab')).toHaveLength(8)
    expect(
      screen.getByRole('tab', { name: '1. Translator' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: '7. Proofreader' }),
    ).toBeInTheDocument()
  })

  it('shows the WebMCP overview and its built-in-AI boundary when selected', async () => {
    vi.stubEnv('VITE_WEBMCP', 'true')
    await renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('tab', { name: 'WebMCP track: Introduction' }))

    expect(
      screen.getByRole('heading', {
        name: 'WebMCP: website tools for browser agents',
      }),
    ).toBeVisible()
    expect(screen.getByText(/Not on-device inference/i)).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Proofreader' }),
    ).not.toBeInTheDocument()
  })

  it('keeps arrow, Home, and End keyboard navigation working across every tab', async () => {
    vi.stubEnv('VITE_WEBMCP', 'true')
    await renderApp()
    const user = userEvent.setup()

    const translatorTab = screen.getByRole('tab', { name: '1. Translator' })
    translatorTab.focus()

    await user.keyboard('{End}')
    expect(
      screen.getByRole('tab', { name: 'WebMCP track: Introduction' }),
    ).toHaveFocus()

    await user.keyboard('{Home}')
    expect(translatorTab).toHaveFocus()
  })
})
