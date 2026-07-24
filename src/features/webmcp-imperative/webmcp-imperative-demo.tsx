import { useState, type FormEvent } from 'react'

import { webmcpFlags } from '../../components/api-availability'
import { DemoSection } from '../../components/demo-section'
import {
  IMPERATIVE_TOOL_CONTRACT,
  useWebmcpImperative,
} from './use-webmcp-imperative'

// A pretty-printed JSON Schema next to the human UI keeps the reader honest:
// what they see is exactly what the browser receives when the tool registers.
const inputSchemaJson = JSON.stringify(
  IMPERATIVE_TOOL_CONTRACT.inputSchema,
  null,
  2,
)

const supportBanner: Record<
  ReturnType<typeof useWebmcpImperative>['support'],
  { tone: string; text: string }
> = {
  checking: {
    tone: 'text-slate-500',
    text: 'Checking whether this browser exposes document.modelContext…',
  },
  supported: {
    tone: 'text-brand-green',
    text: 'This browser exposes document.modelContext, so the addTodo tool is registered. A person can still use the list directly; an agent can also call the tool to add items.',
  },
  unavailable: {
    tone: 'text-slate-600',
    text: 'This browser does not expose document.modelContext, so no tool was registered. The list still works normally for people.',
  },
}

const activityToneClass: Record<
  ReturnType<typeof useWebmcpImperative>['activity'],
  string
> = {
  idle: 'text-slate-500',
  running: 'text-brand-blue',
  success: 'text-brand-green',
  error: 'text-brand-red',
}

export function WebmcpImperativeDemo() {
  const imperative = useWebmcpImperative()
  const [draft, setDraft] = useState('')

  const banner = supportBanner[imperative.support]

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return
    imperative.addFromPerson(trimmed)
    setDraft('')
  }

  return (
    <DemoSection
      accent="blue"
      eyebrow="WebMCP · Imperative"
      title="Imperative API: register a JavaScript tool"
      description="Hand the browser one JavaScript tool through document.modelContext. It carries a name, description, JSON Schema for its input, and an execute function. A person adds items with the form on the left; an agent can call the same operation as a typed tool call, and the result flows back to the same list."
      availability={{
        status: 'origin-trial',
        summary: 'Origin trial from Chrome 149.',
        flags: webmcpFlags,
      }}
      codePath="webmcp-imperative-api.ts → use-webmcp-imperative.ts → webmcp-imperative-demo.tsx"
      lifecycleNote="The hook registers one tool on mount using an AbortController; unmount (e.g. switching tabs) aborts the signal, which is the Imperative API's only cleanup path. Registration failures surface as the error activity so a reader can see the reason."
    >
      <p className={`text-sm font-semibold ${banner.tone}`} role="status">
        {banner.text}
      </p>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-800">
            Why this lesson exists next to the Declarative one:
          </span>{' '}
          the Declarative API turned a visible form into a tool. Here the tool
          is not a form — it is a piece of JavaScript with a typed input schema
          and an <span className="font-mono text-xs">execute</span> function.
          The browser calls that function on the agent&apos;s behalf; whatever
          it returns is serialized straight back to the agent as the tool
          result.
        </p>
      </div>

      {/* `min-w-0` on the grid children lets each column shrink to its `1fr`
          track. Without it, the JSON schema `<pre>` on the right forces its
          column past `1fr` (grid items default to `min-width: auto`), which
          both unbalances the two columns and defeats the pre's own
          `overflow-x-auto` scroll. */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* The human interface. It never hides behind the tool: a person can
            add and remove items with or without an agent present. */}
        <div className="grid min-w-0 content-start gap-4">
          <form className="grid gap-3" onSubmit={handleAdd}>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              New task
              <input
                className="focus:border-brand-blue focus:ring-brand-blue/20 rounded-xl border border-slate-300 px-3 py-2 font-normal focus:ring-4 focus:outline-none"
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="e.g. Draft the release notes"
                required
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                className="bg-brand-blue hover:bg-brand-blue/85 rounded-xl px-4 py-2 text-sm font-bold text-white"
                type="submit"
              >
                Add task
              </button>
              <button
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={imperative.clearAll}
                disabled={imperative.todos.length === 0}
              >
                Clear list
              </button>
            </div>
          </form>

          <div
            className="rounded-2xl border border-slate-200 bg-white p-4"
            aria-live="polite"
          >
            <h3 className="text-sm font-bold text-slate-900">
              To-do list ({imperative.todos.length})
            </h3>
            {imperative.todos.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                Empty. Add a task above, or (in a browser with WebMCP enabled)
                let an agent call the{' '}
                <span className="font-mono text-xs">
                  {IMPERATIVE_TOOL_CONTRACT.name}
                </span>{' '}
                tool.
              </p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {imperative.todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={
                          todo.source === 'agent'
                            ? 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide'
                            : 'inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600'
                        }
                      >
                        {todo.source}
                      </span>
                      <span className="truncate text-slate-800">
                        {todo.text}
                      </span>
                    </span>
                    <button
                      className="text-xs font-semibold text-slate-500 hover:text-brand-red"
                      type="button"
                      onClick={() => imperative.remove(todo.id)}
                      aria-label={`Remove ${todo.text}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* What the agent sees: the exact tool contract this page registers,
            plus a live activity panel showing the last invocation's outcome. */}
        <div className="grid min-w-0 content-start gap-4">
          {/* `min-w-0` here too: this card is a grid item in the single-column
              stack above, which defaults its items to `min-width: auto`. The
              unwrapped JSON in the <pre> below is wide enough to become that
              auto minimum, which grew this card (and the whole column) past
              the section's edge. Capping the card lets the <pre>'s own
              `overflow-x-auto` scroll internally instead. */}
          <div className="min-w-0 border-brand-blue/25 bg-brand-blue/5 rounded-2xl border p-4">
            <h3 className="text-sm font-bold text-slate-900">
              What the agent sees
            </h3>
            <dl className="mt-3 grid gap-1 text-sm text-slate-700">
              <div className="flex gap-2">
                <dt className="font-semibold text-slate-900">Tool</dt>
                <dd className="font-mono text-xs leading-5">
                  {IMPERATIVE_TOOL_CONTRACT.name}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-slate-900">Purpose</dt>
                <dd>{IMPERATIVE_TOOL_CONTRACT.description}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Input schema
            </p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs leading-5 text-slate-800">
              {inputSchemaJson}
            </pre>
            <p className="mt-3 text-xs text-slate-500">
              The browser parses the agent&apos;s arguments against this schema
              before calling{' '}
              <span className="font-mono text-[11px]">execute</span>. Invalid
              input never reaches this page&apos;s state.
            </p>
          </div>

          <div
            className="rounded-2xl border border-slate-200 bg-white p-4"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900">
                Tool activity
              </h3>
              <button
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={imperative.reset}
                disabled={imperative.activity === 'idle'}
              >
                Reset
              </button>
            </div>
            <p
              className={`mt-2 text-xs font-bold uppercase tracking-wide ${activityToneClass[imperative.activity]}`}
            >
              {imperative.activity}
            </p>
            <div className="mt-2 text-sm leading-6">
              {imperative.activity === 'idle' ? (
                <p className="text-slate-500">
                  No agent call yet. When an agent invokes{' '}
                  <span className="font-mono text-xs">
                    {IMPERATIVE_TOOL_CONTRACT.name}
                  </span>
                  , the running, success, or error outcome appears here.
                </p>
              ) : null}
              {imperative.activity === 'running' ? (
                <p className="text-brand-blue">
                  Running{' '}
                  <span className="font-mono text-xs">
                    {IMPERATIVE_TOOL_CONTRACT.name}
                  </span>
                  …
                </p>
              ) : null}
              {imperative.activity === 'success' ? (
                <div className="text-slate-700">
                  <p className="text-brand-green font-semibold">
                    execute() returned:
                  </p>
                  <p className="mt-1 font-mono text-xs leading-5 text-slate-800">
                    {imperative.lastResult}
                  </p>
                </div>
              ) : null}
              {imperative.activity === 'error' ? (
                <div className="text-slate-700">
                  <p className="text-brand-red font-semibold">
                    execute() rejected:
                  </p>
                  <p className="mt-1 font-mono text-xs leading-5 text-slate-800">
                    {imperative.lastError}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </DemoSection>
  )
}
