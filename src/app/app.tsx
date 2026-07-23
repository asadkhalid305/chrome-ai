import {
  Fragment,
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
import { WebmcpDeclarativeDemo } from "../features/webmcp-declarative/webmcp-declarative-demo";
import { WebMcpIntro } from "../features/webmcp/webmcp-intro";
import { WriterDemo } from "../features/writer/writer-demo";
import type { DemoAccent } from "../components/demo-section";
import { RevealContext } from "./reveal-context";

// Show the Chrome intro and API details from the start unless explicitly
// disabled. Unset (e.g. a fresh clone) defaults to shown; set to "false" in a
// local env file to keep them hidden.
const revealChromeByDefault = import.meta.env.VITE_REVEAL_CHROME !== "false";

// The WebMCP track teaches website tools for browser agents rather than local
// model inference, so it is hidden by default to keep the one-hour built-in-AI
// demo focused. Require an explicit "true" (contrast the default-on reveal flag
// above) so an unset value on a fresh clone stays off. Set VITE_WEBMCP=true in a
// local env file to reveal it for a longer talk.
const webmcpTrackEnabled = import.meta.env.VITE_WEBMCP === "true";

type DemoId =
  | "translator"
  | "language-detector"
  | "summarizer"
  | "prompt"
  | "writer"
  | "rewriter"
  | "proofreader"
  | "webmcp"
  | "webmcp-declarative";

interface Demo {
  id: DemoId;
  label: string;
  component: ComponentType;
  accent: DemoAccent;
  // Present only on demos that belong to the separate WebMCP track, which the
  // nav sets apart from the built-in-AI APIs.
  track?: "webmcp";
}

// One coherent treatment per accent so every tab shares the same state logic.
// The dot inherits the text color (`bg-current`), which keeps text and dot
// aligned across the default, hover, and selected states automatically.
// Yellow uses dark foregrounds because brand yellow is too light for white text.
const accentClassNames: Record<
  DemoAccent,
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

const apiDemos: Demo[] = [
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

// The WebMCP track. The intro is a static overview; the Declarative demo is the
// first runnable WebMCP lesson. Both carry `track: "webmcp"` so the nav groups
// and labels them apart from the numbered built-in-AI APIs. The track is
// appended after the core APIs so the built-in-AI tab numbers stay stable.
const webmcpDemos: Demo[] = [
  {
    id: "webmcp",
    label: "Introduction",
    component: WebMcpIntro,
    accent: "blue",
    track: "webmcp",
  },
  {
    id: "webmcp-declarative",
    label: "Declarative API",
    component: WebmcpDeclarativeDemo,
    accent: "blue",
    track: "webmcp",
  },
];

// When the flag is off this is exactly the seven built-in-AI APIs, so that
// experience is unchanged. When on, the WebMCP track is appended at the end.
const visibleDemos: Demo[] = webmcpTrackEnabled
  ? [...apiDemos, ...webmcpDemos]
  : apiDemos;

// A small decorative heading that groups tabs in the sidebar (e.g. "APIs",
// "WebMCP"). Defined at module scope, not inside App, so it keeps a stable
// component identity across renders.
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
  );
}

export function App() {
  const [selectedDemoId, setSelectedDemoId] = useState<DemoId>("translator");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedDemo =
    visibleDemos.find((demo) => demo.id === selectedDemoId) ??
    visibleDemos[0];
  const SelectedDemo = selectedDemo.component;

  function selectDemo(index: number) {
    const demo = visibleDemos[index];
    setSelectedDemoId(demo.id);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null;

    // The tablist is vertical, so Up/Down are the primary keys. Left/Right are
    // kept as aliases so muscle memory (and either orientation) still works.
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % visibleDemos.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (index - 1 + visibleDemos.length) % visibleDemos.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = visibleDemos.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      selectDemo(nextIndex);
    }
  }

  return (
    <RevealContext value={revealChromeByDefault}>
      {/* Fixed-height app shell: the page itself never scrolls. Scrolling is
          delegated to the sidebar nav and the main panel independently. */}
      <div className="flex h-screen flex-col overflow-hidden bg-brand-yellow/10 text-slate-950">
        <div
          className="h-2 shrink-0 bg-[linear-gradient(to_right,var(--color-brand-yellow)_0_25%,var(--color-brand-red)_25%_50%,var(--color-brand-green)_50%_75%,var(--color-brand-blue)_75%_100%)]"
          aria-hidden="true"
        />

        {/* Body split: vertical sidebar + scrollable content. min-h-0 lets the
            flex children shrink so their own overflow scrolls instead of the
            page. */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <nav
            aria-label="Playground"
            className="bg-brand-white/95 flex w-60 shrink-0 flex-col overflow-y-auto border-r border-brand-blue/15 shadow-sm sm:w-64"
          >
            <div
              className="flex flex-col gap-1 px-3 py-4"
              role="tablist"
              aria-label="Playground"
              aria-orientation="vertical"
            >
              <NavGroupLabel label="APIs" />
              {visibleDemos.map((demo, index) => {
                const isSelected = demo.id === selectedDemoId;
                const accent = accentClassNames[demo.accent];
                const startsWebmcpGroup =
                  demo.track === "webmcp" &&
                  visibleDemos[index - 1]?.track !== "webmcp";

                return (
                  <Fragment key={demo.id}>
                    {/* Separate the WebMCP track from the built-in-AI APIs.
                        The label is decorative; the tab's aria-label carries
                        the track name for assistive tech. */}
                    {startsWebmcpGroup ? <NavGroupLabel label="WebMCP" /> : null}
                    <button
                      aria-controls="demo-panel"
                      aria-label={
                        demo.track === "webmcp"
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
                      onClick={() => setSelectedDemoId(demo.id)}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
                      ref={(element) => {
                        tabRefs.current[index] = element;
                      }}
                      role="tab"
                      tabIndex={isSelected ? 0 : -1}
                      type="button"
                    >
                      <span
                        className="mr-2 inline-block size-2 shrink-0 rounded-full bg-current"
                        aria-hidden="true"
                      />
                      {demo.track === "webmcp" ? (
                        demo.label
                      ) : (
                        <>
                          {index + 1}. {demo.label}
                        </>
                      )}
                    </button>
                  </Fragment>
                );
              })}
            </div>
          </nav>

          {/* Only the main panel scrolls; min-h-0 enables its own overflow. */}
          <main className="min-h-0 flex-1 overflow-y-auto">
            {/* The intro names Chrome, so it is shown only when the
                VITE_REVEAL_CHROME flag is enabled. */}
            {revealChromeByDefault ? (
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

            <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
              <div
                aria-labelledby={`demo-tab-${selectedDemo.id}`}
                id="demo-panel"
                role="tabpanel"
                tabIndex={0}
              >
                <SelectedDemo />
              </div>
            </div>
          </main>
        </div>
      </div>
    </RevealContext>
  );
}
