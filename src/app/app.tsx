import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
} from 'react'

import type { DemoAccent } from '../components/demo-section'
import { DocumentationPage } from '../docs/documentation-page'
import { documentationNavGroups } from '../docs/documentation-content'
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
import {
  documentationHash,
  parseAppRoute,
  playgroundHash,
  type AppRoute,
  type DemoId,
  type DocumentationSectionId,
} from './navigation'
import { RevealContext } from './reveal-context'

const revealChromeByDefault = import.meta.env.VITE_REVEAL_CHROME !== 'false'
const webmcpTrackEnabled = import.meta.env.VITE_WEBMCP !== 'false'

interface Demo {
  id: DemoId
  label: string
  component: ComponentType<{ accent: DemoAccent }>
  accent: DemoAccent
  track?: 'webmcp'
}

type DemoDefinition = Omit<Demo, 'accent'>

const ACCENT_CYCLE: DemoAccent[] = ['yellow', 'red', 'green', 'blue']

function accentForPosition(index: number): DemoAccent {
  return ACCENT_CYCLE[index % ACCENT_CYCLE.length]
}

const accentClassNames: Record<
  DemoAccent,
  { active: string; hover: string }
> = {
  yellow: {
    active: 'border-brand-yellow bg-brand-yellow text-slate-950',
    hover: 'hover:border-brand-yellow hover:text-brand-yellow',
  },
  red: {
    active: 'border-brand-red bg-brand-red text-white',
    hover: 'hover:border-brand-red hover:text-brand-red',
  },
  green: {
    active: 'border-brand-green bg-brand-green text-white',
    hover: 'hover:border-brand-green hover:text-brand-green',
  },
  blue: {
    active: 'border-brand-blue bg-brand-blue text-white',
    hover: 'hover:border-brand-blue hover:text-brand-blue',
  },
}

const apiDemos: DemoDefinition[] = [
  { id: 'translator', label: 'Translator', component: TranslatorDemo },
  {
    id: 'language-detector',
    label: 'Language Detector',
    component: LanguageDetectorDemo,
  },
  { id: 'summarizer', label: 'Summarizer', component: SummarizerDemo },
  { id: 'prompt', label: 'Prompt', component: PromptDemo },
  { id: 'writer', label: 'Writer', component: WriterDemo },
  { id: 'rewriter', label: 'Rewriter', component: RewriterDemo },
  { id: 'proofreader', label: 'Proofreader', component: ProofreaderDemo },
]

const webmcpDemos: DemoDefinition[] = [
  {
    id: 'webmcp',
    label: 'Introduction',
    component: WebMcpIntro,
    track: 'webmcp',
  },
  {
    id: 'webmcp-declarative',
    label: 'Declarative API',
    component: WebmcpDeclarativeDemo,
    track: 'webmcp',
  },
  {
    id: 'webmcp-imperative',
    label: 'Imperative API',
    component: WebmcpImperativeDemo,
    track: 'webmcp',
  },
]

const visibleDemos: Demo[] = (
  webmcpTrackEnabled ? [...apiDemos, ...webmcpDemos] : apiDemos
).map((demo, index) => ({ ...demo, accent: accentForPosition(index) }))

const visibleDemoIds = new Set<string>(visibleDemos.map((demo) => demo.id))

function NavGroupLabel({ label }: { label: string }) {
  return (
    <div
      aria-hidden="true"
      className="first:mt-0 mt-3 mb-1 flex items-center gap-2 px-1"
      role="presentation"
    >
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-brand-blue text-xs font-bold uppercase tracking-[0.18em]">
        {label}
      </span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

function DocumentationSidebar({
  onNavigate,
  selectedSectionId,
}: {
  onNavigate: () => void
  selectedSectionId: DocumentationSectionId
}) {
  return (
    <div className="flex flex-col gap-1 px-3 py-4">
      <a
        className="mb-2 flex items-center rounded-lg border border-brand-blue/25 bg-brand-blue/5 px-3 py-2 text-sm font-bold text-brand-blue hover:bg-brand-blue/10"
        href={playgroundHash('translator')}
        onClick={onNavigate}
      >
        <span aria-hidden="true" className="mr-2">
          ←
        </span>
        Back to playground
      </a>

      {documentationNavGroups.map((group) => (
        <Fragment key={group.label}>
          <NavGroupLabel label={group.label} />
          {group.items.map((item) => {
            const selected = item.id === selectedSectionId
            return (
              <a
                aria-current={selected ? 'page' : undefined}
                className={
                  selected
                    ? 'flex w-full items-center rounded-lg border border-brand-blue bg-brand-blue px-3 py-2 text-left text-sm font-bold text-white shadow-sm'
                    : 'flex w-full items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:border-brand-blue hover:text-brand-blue'
                }
                href={documentationHash(item.id)}
                key={item.id}
                onClick={onNavigate}
              >
                {item.label}
              </a>
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}

export function App() {
  const [route, setRoute] = useState<AppRoute>(() =>
    parseAppRoute(window.location.hash, visibleDemoIds),
  )
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const mainRef = useRef<HTMLElement | null>(null)
  const previousSurfaceRef = useRef(route.surface)

  useEffect(() => {
    function syncRouteFromHash() {
      setRoute(parseAppRoute(window.location.hash, visibleDemoIds))
    }

    window.addEventListener('hashchange', syncRouteFromHash)
    return () => window.removeEventListener('hashchange', syncRouteFromHash)
  }, [])

  const routeKey =
    route.surface === 'playground'
      ? `playground-${route.demoId}`
      : `docs-${route.sectionId}`

  useEffect(() => {
    if (!mainRef.current) return
    mainRef.current.scrollTop = 0
    if (route.surface === 'docs') {
      mainRef.current.focus()
    } else if (previousSurfaceRef.current === 'docs') {
      const selectedIndex = visibleDemos.findIndex(
        (demo) => demo.id === route.demoId,
      )
      tabRefs.current[selectedIndex]?.focus()
    }
    previousSurfaceRef.current = route.surface
  }, [routeKey])

  const selectedDemoId =
    route.surface === 'playground' ? route.demoId : 'translator'
  const selectedDemo =
    visibleDemos.find((demo) => demo.id === selectedDemoId) ?? visibleDemos[0]
  const SelectedDemo = selectedDemo.component
  const selectedDocumentationLabel =
    route.surface === 'docs'
      ? documentationNavGroups
          .flatMap((group) => group.items)
          .find((item) => item.id === route.sectionId)?.label
      : undefined
  const selectedNavigationLabel =
    route.surface === 'docs'
      ? (selectedDocumentationLabel ?? 'Overview')
      : selectedDemo.label

  function navigateToDemo(id: DemoId) {
    if (!visibleDemoIds.has(id)) return
    setIsMobileNavigationOpen(false)
    const hash = playgroundHash(id)
    if (window.location.hash === hash) {
      setRoute({ surface: 'playground', demoId: id })
      return
    }
    window.location.hash = hash
  }

  function selectDemo(index: number) {
    const demo = visibleDemos[index]
    navigateToDemo(demo.id)
    tabRefs.current[index]?.focus()
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (index + 1) % visibleDemos.length
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + visibleDemos.length) % visibleDemos.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = visibleDemos.length - 1
    }

    if (nextIndex !== null) {
      event.preventDefault()
      selectDemo(nextIndex)
    }
  }

  return (
    <RevealContext value={revealChromeByDefault}>
      <div className="flex h-screen flex-col overflow-hidden bg-brand-yellow/10 text-slate-950">
        <div
          aria-hidden="true"
          className="h-2 shrink-0 bg-[linear-gradient(to_right,var(--color-brand-yellow)_0_25%,var(--color-brand-red)_25%_50%,var(--color-brand-green)_50%_75%,var(--color-brand-blue)_75%_100%)]"
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          <nav
            aria-label={
              route.surface === 'playground'
                ? 'Playground'
                : 'Documentation'
            }
            className={`bg-brand-white/95 flex w-full flex-col border-b border-brand-blue/15 shadow-sm md:min-h-0 md:w-64 md:shrink-0 md:border-r md:border-b-0 ${
              isMobileNavigationOpen
                ? 'min-h-0 flex-1'
                : 'shrink-0'
            }`}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:hidden">
              <div className="min-w-0">
                <p className="text-brand-blue text-xs font-black uppercase tracking-[0.16em]">
                  {route.surface === 'docs' ? 'Documentation' : 'Playground'}
                </p>
                <p className="truncate text-sm font-bold text-slate-900">
                  {selectedNavigationLabel}
                </p>
              </div>
              <button
                aria-controls="primary-navigation-items"
                aria-expanded={isMobileNavigationOpen}
                aria-label={
                  isMobileNavigationOpen
                    ? 'Close navigation menu'
                    : 'Open navigation menu'
                }
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-brand-blue/30 bg-white px-3 py-2 text-sm font-bold text-brand-blue shadow-sm hover:bg-brand-blue/5"
                onClick={() =>
                  setIsMobileNavigationOpen((isOpen) => !isOpen)
                }
                type="button"
              >
                <span>{isMobileNavigationOpen ? 'Close' : 'Menu'}</span>
                <span aria-hidden="true" className="text-lg leading-none">
                  {isMobileNavigationOpen ? '×' : '☰'}
                </span>
              </button>
            </div>

            <div
              className={`min-h-0 flex-1 overflow-y-auto md:block ${
                isMobileNavigationOpen ? 'block' : 'hidden'
              }`}
              id="primary-navigation-items"
            >
              {route.surface === 'playground' ? (
                <div
                  aria-label="Playground"
                  aria-orientation="vertical"
                  className="flex flex-col gap-1 px-3 py-4"
                  role="tablist"
                >
                  <NavGroupLabel label="APIs" />
                  {visibleDemos.map((demo, index) => {
                    const isSelected = demo.id === selectedDemoId
                    const accent = accentClassNames[demo.accent]
                    const startsWebmcpGroup =
                      demo.track === 'webmcp' &&
                      visibleDemos[index - 1]?.track !== 'webmcp'

                    return (
                      <Fragment key={demo.id}>
                        {startsWebmcpGroup ? (
                          <NavGroupLabel label="WebMCP" />
                        ) : null}
                        <button
                          aria-controls="demo-panel"
                          aria-label={
                            demo.track === 'webmcp'
                              ? `WebMCP track: ${demo.label}`
                              : undefined
                          }
                          aria-selected={isSelected}
                          className={
                            isSelected
                              ? `flex w-full items-center rounded-lg border px-3 py-2 text-left text-sm font-bold shadow-sm ${accent.active}`
                              : `${accent.hover} flex w-full items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700`
                          }
                          id={`demo-tab-${demo.id}`}
                          onClick={() => navigateToDemo(demo.id)}
                          onKeyDown={(event) =>
                            handleTabKeyDown(event, index)
                          }
                          ref={(element) => {
                            tabRefs.current[index] = element
                          }}
                          role="tab"
                          tabIndex={isSelected ? 0 : -1}
                          type="button"
                        >
                          <span
                            aria-hidden="true"
                            className="mr-2 inline-block size-2 shrink-0 rounded-full bg-current"
                          />
                          {demo.track === 'webmcp' ? (
                            demo.label
                          ) : (
                            <>
                              {index + 1}. {demo.label}
                            </>
                          )}
                        </button>
                      </Fragment>
                    )
                  })}
                  <NavGroupLabel label="Learn" />
                  <a
                    className="flex w-full items-center rounded-lg border border-brand-blue/30 bg-white px-3 py-2 text-left text-sm font-bold text-brand-blue hover:bg-brand-blue/5"
                    href={documentationHash('overview')}
                    onClick={() => setIsMobileNavigationOpen(false)}
                  >
                    <span aria-hidden="true" className="mr-2">
                      ◫
                    </span>
                    Documentation
                  </a>
                </div>
              ) : (
                <DocumentationSidebar
                  onNavigate={() => setIsMobileNavigationOpen(false)}
                  selectedSectionId={route.sectionId}
                />
              )}
            </div>
          </nav>

          <main
            aria-label={
              route.surface === 'playground'
                ? 'Chrome AI playground'
                : 'Chrome AI documentation'
            }
            className={`min-h-0 flex-1 overflow-y-auto outline-none md:block ${
              isMobileNavigationOpen ? 'hidden' : 'block'
            }`}
            ref={mainRef}
            tabIndex={-1}
          >
            {route.surface === 'playground' && revealChromeByDefault ? (
              <header className="border-b border-brand-blue/15 bg-brand-white">
                <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
                  <p className="text-brand-blue text-sm font-bold uppercase tracking-[0.2em]">
                    Local-first playground
                  </p>
                  <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
                    Learn Chrome built-in AI one native API at a time.
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                    Pick one API to explore its browser capability, model
                    lifecycle, focused task, and local output. No backend or
                    cloud fallback is involved.
                  </p>
                </div>
              </header>
            ) : null}

            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
              {route.surface === 'playground' ? (
                <div
                  aria-labelledby={`demo-tab-${selectedDemo.id}`}
                  id="demo-panel"
                  role="tabpanel"
                  tabIndex={0}
                >
                  <SelectedDemo accent={selectedDemo.accent} />
                </div>
              ) : (
                <DocumentationPage
                  isDemoAvailable={(id) => visibleDemoIds.has(id)}
                  onOpenDemo={navigateToDemo}
                  sectionId={route.sectionId}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </RevealContext>
  )
}
