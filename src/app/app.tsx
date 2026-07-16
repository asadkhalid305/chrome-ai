import {
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
} from "react";

import { LanguageDetectorDemo } from "../features/language-detector/language-detector-demo";
import { PromptDemo } from "../features/prompt/prompt-demo";
import { SummarizerDemo } from "../features/summarizer/summarizer-demo";
import { TranslatorDemo } from "../features/translator/translator-demo";

type LessonId = "translator" | "language-detector" | "summarizer" | "prompt";

interface Lesson {
  id: LessonId;
  label: string;
  component: ComponentType;
  activeClassName: string;
  dotClassName: string;
  hoverClassName: string;
}

const lessons: Lesson[] = [
  {
    id: "translator",
    label: "Translator",
    component: TranslatorDemo,
    activeClassName: "border-brand-yellow bg-brand-yellow text-white",
    dotClassName: "bg-brand-white",
    hoverClassName: "hover:border-brand-yellow hover:text-brand-yellow",
  },
  {
    id: "language-detector",
    label: "Language Detector",
    component: LanguageDetectorDemo,
    activeClassName: "border-brand-red bg-brand-red text-white",
    dotClassName: "bg-brand-white",
    hoverClassName: "hover:border-brand-red hover:text-brand-red",
  },
  {
    id: "summarizer",
    label: "Summarizer",
    component: SummarizerDemo,
    activeClassName: "border-brand-green bg-brand-green text-white",
    dotClassName: "bg-brand-white",
    hoverClassName: "hover:border-brand-green hover:text-brand-green",
  },
  {
    id: "prompt",
    label: "Prompt",
    component: PromptDemo,
    activeClassName: "border-brand-blue bg-brand-blue text-white",
    dotClassName: "bg-brand-white",
    hoverClassName: "hover:border-brand-blue hover:text-brand-blue",
  },
];

export function App() {
  const [selectedLessonId, setSelectedLessonId] =
    useState<LessonId>("translator");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedLesson =
    lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];
  const SelectedLesson = selectedLesson.component;

  function selectLesson(index: number) {
    const lesson = lessons[index];
    setSelectedLessonId(lesson.id);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % lessons.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + lessons.length) % lessons.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lessons.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      selectLesson(nextIndex);
    }
  }

  return (
    <div className="min-h-screen bg-brand-yellow/10 text-slate-950">
      <header className="border-b border-brand-blue/15 bg-brand-white">
        <div className="grid h-2 grid-cols-4" aria-hidden="true">
          <span className="bg-brand-yellow" />
          <span className="bg-brand-red" />
          <span className="bg-brand-green" />
          <span className="bg-brand-blue" />
        </div>
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <p className="text-brand-blue text-sm font-bold uppercase tracking-[0.2em]">
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

      <div className="bg-brand-white/95 sticky top-0 z-10 border-b border-brand-blue/15 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-6xl overflow-x-auto px-5 sm:px-8">
          <div
            className="flex min-w-max gap-2 py-3"
            role="tablist"
            aria-label="Phase 1 lessons"
          >
            {lessons.map((lesson, index) => {
              const isSelected = lesson.id === selectedLessonId;

              return (
                <button
                  aria-controls="lesson-panel"
                  aria-selected={isSelected}
                  className={
                    isSelected
                      ? `rounded-full border px-4 py-2 text-sm font-bold shadow-sm ${lesson.activeClassName}`
                      : `${lesson.hoverClassName} rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700`
                  }
                  id={`lesson-tab-${lesson.id}`}
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  role="tab"
                  tabIndex={isSelected ? 0 : -1}
                  type="button"
                >
                  <span
                    className={`mr-2 inline-block size-2 rounded-full ${lesson.dotClassName}`}
                    aria-hidden="true"
                  />
                  {index + 1}. {lesson.label}
                </button>
              );
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
  );
}
