import type { ComponentType } from 'react'

import { LanguageDetectorDemo } from '../features/language-detector/language-detector-demo'
import { PromptDemo } from '../features/prompt/prompt-demo'
import { ProofreaderDemo } from '../features/proofreader/proofreader-demo'
import { RewriterDemo } from '../features/rewriter/rewriter-demo'
import { SummarizerDemo } from '../features/summarizer/summarizer-demo'
import { TranslatorDemo } from '../features/translator/translator-demo'
import { WebmcpDeclarativeDemo } from '../features/webmcp-declarative/webmcp-declarative-demo'
import { WebmcpImperativeDemo } from '../features/webmcp-imperative/webmcp-imperative-demo'
import { WebMcpIntro } from '../features/webmcp/webmcp-intro'
import { WriterDemo } from '../features/writer/writer-demo'
import { SummarizerWorkshop } from '../workshop/ui/summarizer-workshop'
import { TranslatorWorkshop } from '../workshop/ui/translator-workshop'
import { PromptWorkshop } from '../workshop/ui/prompt-workshop'
import { accentForPosition, type DemoAccent } from '../theme/accent'
import { webmcpTrackEnabled, workshopEnabled } from './feature-flags'
import type { DemoId } from './navigation'

export interface Demo {
  id: DemoId
  label: string
  component: ComponentType<{ accent: DemoAccent }>
  accent: DemoAccent
  track?: 'webmcp'
  status: 'stable' | 'developer-trial' | 'origin-trial'
}

type DemoDefinition = Omit<Demo, 'accent'>

// Adding a lesson means adding one entry here and one id to `demoIds` in
// navigation.ts. Order is the curriculum order, and it also decides each demo's
// accent color, so a new demo cannot repeat its neighbor's color by accident.
const apiDemos: DemoDefinition[] = [
  {
    status: 'stable',
    id: 'translator',
    label: 'Translator',
    component: TranslatorDemo,
  },
  {
    id: 'language-detector',
    status: 'stable',
    label: 'Language Detector',
    component: LanguageDetectorDemo,
  },
  {
    status: 'stable',
    id: 'summarizer',
    label: 'Summarizer',
    component: SummarizerDemo,
  },
  { status: 'stable', id: 'prompt', label: 'Prompt', component: PromptDemo },
  {
    status: 'developer-trial',
    id: 'writer',
    label: 'Writer',
    component: WriterDemo,
  },
  {
    status: 'developer-trial',
    id: 'rewriter',
    label: 'Rewriter',
    component: RewriterDemo,
  },
  {
    status: 'developer-trial',
    id: 'proofreader',
    label: 'Proofreader',
    component: ProofreaderDemo,
  },
]

const webmcpDemos: DemoDefinition[] = [
  {
    id: 'webmcp',
    label: 'Introduction',
    component: WebMcpIntro,
    track: 'webmcp',
    status: 'origin-trial',
  },
  {
    id: 'webmcp-declarative',
    label: 'Declarative API',
    component: WebmcpDeclarativeDemo,
    track: 'webmcp',
    status: 'origin-trial',
  },
  {
    id: 'webmcp-imperative',
    label: 'Imperative API',
    component: WebmcpImperativeDemo,
    track: 'webmcp',
    status: 'origin-trial',
  },
]

// Accents are assigned over the full catalog, not the visible subset, so
// toggling the WebMCP flag cannot recolor the built-in-AI demos. The
// documentation pages read this map so a guide always matches its demo tab.
const accentByDemoId = new Map<DemoId, DemoAccent>(
  [...apiDemos, ...webmcpDemos].map((demo, index) => [
    demo.id,
    accentForPosition(index),
  ]),
)

export function accentForDemoId(demoId: DemoId): DemoAccent {
  return accentByDemoId.get(demoId) ?? 'blue'
}

const workshopDemos: DemoDefinition[] = [
  {
    id: 'summarizer',
    label: 'Summarizer',
    component: SummarizerWorkshop,
    status: 'stable',
  },
  {
    id: 'translator',
    label: 'Translator',
    component: TranslatorWorkshop,
    status: 'stable',
  },
  {
    id: 'prompt',
    label: 'Prompt',
    component: PromptWorkshop,
    status: 'stable',
  },
]

export const visibleDemos: Demo[] = (
  workshopEnabled
    ? workshopDemos
    : webmcpTrackEnabled
      ? [...apiDemos, ...webmcpDemos]
      : apiDemos
).map((demo) => ({ ...demo, accent: accentForDemoId(demo.id) }))

export const visibleDemoIds = new Set<string>(
  visibleDemos.map((demo) => demo.id),
)

export function isDemoVisible(demoId: DemoId) {
  return visibleDemoIds.has(demoId)
}
