import type { DemoId, DocumentationSectionId } from '../app/navigation'
import { ArticlePage } from './components/article-page'
import { GuidePage } from './components/guide-page'
import { apiGuideById, documentationArticleById } from './documentation-content'

interface DocumentationPageProps {
  sectionId: DocumentationSectionId
  isDemoAvailable: (demoId: DemoId) => boolean
  onOpenDemo: (demoId: DemoId) => void
}

// Documentation sections come in two shapes: prose articles and per-API guides.
// The section id decides which, so an unknown id falls back to a real page
// rather than rendering nothing.
export function DocumentationPage({
  sectionId,
  isDemoAvailable,
  onOpenDemo,
}: DocumentationPageProps) {
  const article = documentationArticleById.get(sectionId)
  if (article) return <ArticlePage article={article} />

  const guide = apiGuideById.get(sectionId) ?? apiGuideById.get('webmcp')
  if (!guide) return null

  return (
    <GuidePage
      demoAvailable={guide.demoId ? isDemoAvailable(guide.demoId) : false}
      guide={guide}
      onOpenDemo={onOpenDemo}
    />
  )
}
