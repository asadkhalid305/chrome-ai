import { useRef, useState, type ComponentType, type KeyboardEvent } from 'react'

import { LanguageDetectorDemo } from '../features/language-detector/language-detector-demo'
import { PromptDemo } from '../features/prompt/prompt-demo'
import { SummarizerDemo } from '../features/summarizer/summarizer-demo'
import { TranslatorDemo } from '../features/translator/translator-demo'

type LessonId = 'translator' | 'language-detector' | 'summarizer' | 'prompt'

interface Lesson {
  id: LessonId
  label: string
  component: ComponentType
}

const lessons: Lesson[] = [
  { id: 'translator', label: 'Translator', component: TranslatorDemo },
  {
    id: 'language-detector',
    label: 'Language Detector',
    component: LanguageDetectorDemo,
  },
  { id: 'summarizer', label: 'Summarizer', component: SummarizerDemo },
  { id: 'prompt', label: 'Prompt', component: PromptDemo },
]

export function App() {
  const [selectedLessonId, setSelectedLessonId] =
    useState<LessonId>('translator')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const selectedLesson =
    lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0]
  const SelectedLesson = selectedLesson.component

  function selectLesson(index: number) {
    const lesson = lessons[index]
    setSelectedLessonId(lesson.id)
    tabRefs.current[index]?.focus()
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % lessons.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + lessons.length) % lessons.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = lessons.length - 1
    }

    if (nextIndex !== null) {
      event.preventDefault()
      selectLesson(nextIndex)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Local-first teaching playground
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
            Learn Chrome built-in AI one native API at a time.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            Pick one lesson to explore its browser capability, model lifecycle,
            focused task, and local output. No backend or cloud fallback is
            involved.
          </p>
        </div>
      </header>

      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-6xl overflow-x-auto px-5 sm:px-8">
          <div
            className="flex min-w-max gap-2 py-3"
            role="tablist"
            aria-label="Phase 1 lessons"
          >
            {lessons.map((lesson, index) => {
              const isSelected = lesson.id === selectedLessonId

              return (
                <button
                  aria-controls="lesson-panel"
                  aria-selected={isSelected}
                  className={
                    isSelected
                      ? 'rounded-full border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm'
                      : 'rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-700'
                  }
                  id={`lesson-tab-${lesson.id}`}
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  ref={(element) => {
                    tabRefs.current[index] = element
                  }}
                  role="tab"
                  tabIndex={isSelected ? 0 : -1}
                  type="button"
                >
                  {index + 1}. {lesson.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div
          aria-labelledby={`lesson-tab-${selectedLesson.id}`}
          id="lesson-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <SelectedLesson />
        </div>
      </main>
    </div>
  )
}
