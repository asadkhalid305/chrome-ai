import { accentForDemoId } from '../app/demo-registry'
import {
  demoIds,
  type DemoId,
  type DocumentationSectionId,
} from '../app/navigation'
import type { DemoAccent } from '../theme/accent'

// Most documentation sections describe one API and borrow that demo's accent, so
// a guide always matches the tab it documents. These sections have no demo of
// their own, so they are colored explicitly.
const standaloneSectionAccents: Partial<
  Record<DocumentationSectionId, DemoAccent>
> = {
  overview: 'yellow',
  requirements: 'red',
  'choosing-an-api': 'green',
  sources: 'blue',
  terminology: 'blue',
}

const knownDemoIds = new Set<string>(demoIds)

// Section ids and demo ids share a namespace: `#docs/translator` documents the
// same API as `#playground/translator`.
function isDemoId(sectionId: DocumentationSectionId): sectionId is DemoId {
  return knownDemoIds.has(sectionId)
}

export function accentForDocumentationSection(
  sectionId: DocumentationSectionId,
): DemoAccent {
  const standalone = standaloneSectionAccents[sectionId]
  if (standalone) return standalone
  if (isDemoId(sectionId)) return accentForDemoId(sectionId)
  return 'blue'
}
