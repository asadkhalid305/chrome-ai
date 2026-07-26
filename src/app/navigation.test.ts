import { describe, expect, it } from 'vitest'

import {
  documentationHash,
  parseAppRoute,
  playgroundHash,
} from './navigation'

const allVisible = new Set([
  'translator',
  'language-detector',
  'summarizer',
  'prompt',
  'writer',
  'rewriter',
  'proofreader',
  'webmcp',
  'webmcp-declarative',
  'webmcp-imperative',
])

describe('app hash routes', () => {
  it('parses playground and documentation deep links', () => {
    expect(parseAppRoute('#playground/prompt', allVisible)).toEqual({
      surface: 'playground',
      demoId: 'prompt',
    })
    expect(parseAppRoute('#docs/webmcp-imperative', allVisible)).toEqual({
      surface: 'docs',
      sectionId: 'webmcp-imperative',
    })
  })

  it('uses surface-specific fallbacks', () => {
    expect(parseAppRoute('#playground/unknown', allVisible)).toEqual({
      surface: 'playground',
      demoId: 'translator',
    })
    expect(parseAppRoute('#docs/unknown', allVisible)).toEqual({
      surface: 'docs',
      sectionId: 'overview',
    })
  })

  it('does not route to a demo hidden by the app flag', () => {
    expect(
      parseAppRoute('#playground/webmcp', new Set(['translator'])),
    ).toEqual({
      surface: 'playground',
      demoId: 'translator',
    })
  })

  it('builds stable public hashes', () => {
    expect(playgroundHash('summarizer')).toBe('#playground/summarizer')
    expect(documentationHash('requirements')).toBe('#docs/requirements')
  })
})
