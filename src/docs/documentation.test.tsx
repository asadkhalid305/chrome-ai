import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  apiGuides,
  documentationArticles,
} from './documentation-content'
import { DocumentationPage } from './documentation-page'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('documentation catalog', () => {
  it('provides sources and exactly three exercises for every runnable guide', () => {
    const runnableGuides = apiGuides.filter((guide) => guide.demoId)

    expect(runnableGuides).toHaveLength(9)
    for (const guide of apiGuides) {
      expect(guide.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(guide.sources.length).toBeGreaterThan(0)
      if (guide.demoId) expect(guide.exercises).toHaveLength(3)
    }
  })

  it('documents the built-in DevTools workflow without the obsolete extension', () => {
    const catalogText = JSON.stringify({ apiGuides, documentationArticles })
    const webmcpGuide = apiGuides.find((guide) => guide.id === 'webmcp')

    expect(catalogText).toContain('Application → WebMCP')
    expect(catalogText).toContain('devtools-webmcp-support')
    expect(catalogText).toContain('enable-webmcp-testing')
    expect(catalogText).not.toContain('Model Context Tool Inspector')
    expect(webmcpGuide?.workflow?.steps).toHaveLength(7)
  })
})

describe('documentation experience', () => {
  it('copies an exercise field and opens its matching demo', async () => {
    const onOpenDemo = vi.fn()
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')

    render(
      <DocumentationPage
        isDemoAvailable={() => true}
        onOpenDemo={onOpenDemo}
        sectionId="prompt"
      />,
    )

    const copyButtons = screen.getAllByRole('button', { name: 'Copy' })
    await user.click(copyButtons[0])

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('junior frontend developer'),
    )
    expect(screen.getByRole('button', { name: 'Copied' })).toBeVisible()

    await user.click(screen.getAllByRole('button', { name: 'Open demo' })[0])
    expect(onOpenDemo).toHaveBeenCalledWith('prompt')
  })

  it('renders six DevTools exercises across both WebMCP variants', () => {
    const onOpenDemo = vi.fn()
    const { rerender } = render(
      <DocumentationPage
        isDemoAvailable={() => true}
        onOpenDemo={onOpenDemo}
        sectionId="webmcp-declarative"
      />,
    )

    expect(screen.getAllByText(/Challenge \d/)).toHaveLength(3)
    expect(screen.getAllByText(/submitSupportRequest/).length).toBeGreaterThan(0)

    rerender(
      <DocumentationPage
        isDemoAvailable={() => true}
        onOpenDemo={onOpenDemo}
        sectionId="webmcp-imperative"
      />,
    )

    expect(screen.getAllByText(/Challenge \d/)).toHaveLength(3)
    expect(screen.getAllByText(/addTodo/).length).toBeGreaterThan(0)
  })
})
