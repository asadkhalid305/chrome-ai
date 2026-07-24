export const demoIds = [
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
] as const

export type DemoId = (typeof demoIds)[number]

export const documentationSectionIds = [
  'overview',
  'requirements',
  'choosing-an-api',
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
  'sources',
  'terminology',
] as const

export type DocumentationSectionId =
  (typeof documentationSectionIds)[number]

export type AppRoute =
  | { surface: 'playground'; demoId: DemoId }
  | { surface: 'docs'; sectionId: DocumentationSectionId }

const knownDemoIds = new Set<string>(demoIds)
const knownDocumentationSectionIds = new Set<string>(documentationSectionIds)

export function parseAppRoute(
  hash: string,
  visibleDemoIds: ReadonlySet<string>,
): AppRoute {
  const normalized = hash.replace(/^#/, '')
  const [surface, id] = normalized.split('/')

  if (surface === 'docs') {
    return {
      surface: 'docs',
      sectionId:
        id && knownDocumentationSectionIds.has(id)
          ? (id as DocumentationSectionId)
          : 'overview',
    }
  }

  if (
    surface === 'playground' &&
    id &&
    knownDemoIds.has(id) &&
    visibleDemoIds.has(id)
  ) {
    return { surface: 'playground', demoId: id as DemoId }
  }

  return { surface: 'playground', demoId: 'translator' }
}

export function playgroundHash(demoId: DemoId) {
  return `#playground/${demoId}`
}

export function documentationHash(sectionId: DocumentationSectionId) {
  return `#docs/${sectionId}`
}
