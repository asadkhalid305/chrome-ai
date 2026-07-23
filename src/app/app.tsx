import {
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
} from "react";

import { LanguageDetectorDemo } from "../features/language-detector/language-detector-demo";
import { PromptDemo } from "../features/prompt/prompt-demo";
import { ProofreaderDemo } from "../features/proofreader/proofreader-demo";
import { RewriterDemo } from "../features/rewriter/rewriter-demo";
import { SummarizerDemo } from "../features/summarizer/summarizer-demo";
import { TranslatorDemo } from "../features/translator/translator-demo";
import { WriterDemo } from "../features/writer/writer-demo";
import type { LessonAccent } from "../components/demo-section";
import { RevealContext } from "./reveal-context";

// Show the Chrome intro and API details from the start unless explicitly
// disabled. Unset (e.g. a fresh clone) defaults to shown; set to "false" in a
// local env file to keep them hidden.
const revealChromeByDefault = import.meta.env.VITE_REVEAL_CHROME !== "false";

type LessonId =
  | "translator"
  | "language-detector"
  | "summarizer"
  | "prompt"
  | "writer"
  | "rewriter"
  | "proofreader";

interface Lesson {
  id: LessonId;
  label: string;
  component: ComponentType;
  accent: LessonAccent;
}

// One coherent treatment per accent so every tab shares the same state logic.
// The dot inherits the text color (`bg-current`), which keeps text and dot
// aligned across the default, hover, and selected states automatically.
// Yellow uses dark foregrounds because brand yellow is too light for white text.
const accentClassNames: Record<
  LessonAccent,
  { active: string; hover: string }
> = {
  yellow: {
    active: "border-brand-yellow bg-brand-yellow text-slate-950",
    hover: "hover:border-brand-yellow hover:text-amber-700",
  },
  red: {
    active: "border-brand-red bg-brand-red text-white",
    hover: "hover:border-brand-red hover:text-brand-red",
  },
  green: {
    active: "border-brand-green bg-brand-green text-white",
    hover: "hover:border-brand-green hover:text-brand-green",
  },
  blue: {
    active: "border-brand-blue bg-brand-blue text-white",
    hover: "hover:border-brand-blue hover:text-brand-blue",
  },
};

const lessons: Lesson[] = [
  {
    id: "translator",
    label: "Translator",
    component: TranslatorDemo,
    accent: "yellow",
  },
  {
    id: "language-detector",
    label: "Language Detector",
    component: LanguageDetectorDemo,
    accent: "red",
  },
  {
    id: "summarizer",
    label: "Summarizer",
    component: SummarizerDemo,
    accent: "green",
  },
  {
    id: "prompt",
    label: "Prompt",
    component: PromptDemo,
    accent: "blue",
  },
  {
    id: "writer",
    label: "Writer",
    component: WriterDemo,
    accent: "blue",
  },
  {
    id: "rewriter",
    label: "Rewriter",
    component: RewriterDemo,
    accent: "yellow",
  },
  {
    id: "proofreader",
    label: "Proofreader",
    component: ProofreaderDemo,
    accent: "red",
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
    <RevealContext value={revealChromeByDefault}>
      <div className="min-h-screen bg-brand-yellow/10 text-slate-950">
        <div
          className="h-2 bg-[linear-gradient(to_right,var(--color-brand-yellow)_0_25%,var(--color-brand-red)_25%_50%,var(--color-brand-green)_50%_75%,var(--color-brand-blue)_75%_100%)]"
          aria-hidden="true"
        />

        {/* The intro names Chrome, so it is shown only when the
            VITE_REVEAL_CHROME flag is enabled. */}
        {revealChromeByDefault ? (
          <header className="border-b border-brand-blue/15 bg-brand-white">
            <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
              <p className="text-brand-blue text-sm font-bold uppercase tracking-[0.2em]">
                Local-first teaching playground
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
                Learn Chrome built-in AI one native API at a time.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Pick one lesson to explore its browser capability, model
                lifecycle, focused task, and local output. No backend or cloud
                fallback is involved.
              </p>
            </div>
          </header>
        ) : null}

        <nav
          aria-label="Lessons"
          className="bg-brand-white/95 sticky top-0 z-10 border-b border-brand-blue/15 shadow-sm backdrop-blur"
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div
                className="flex min-w-max gap-2 py-3"
                role="tablist"
                aria-label="Lessons"
              >
                {lessons.map((lesson, index) => {
                  const isSelected = lesson.id === selectedLessonId;
                  const accent = accentClassNames[lesson.accent];

                  return (
                    <button
                      aria-controls="lesson-panel"
                      aria-selected={isSelected}
                      className={
                        isSelected
                          ? `rounded-full border px-4 py-2 text-sm font-bold shadow-sm ${accent.active}`
                          : `${accent.hover} rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700`
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
                        className="mr-2 inline-block size-2 rounded-full bg-current"
                        aria-hidden="true"
                      />
                      {index + 1}. {lesson.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>

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
    </RevealContext>
  );
}
