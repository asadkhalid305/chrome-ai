import { useState, type FormEvent } from 'react'

import {
  accentTextClassNames,
  primaryButtonClassNames,
  softBoxClassNames,
} from '../../components/accent-styles'
import { webmcpFlags } from '../../components/api-availability'
import { DemoSection, type DemoAccent } from '../../components/demo-section'
import { useWebmcpDeclarative } from './use-webmcp-declarative'

// The tool identity. `toolname` + `tooldescription` on the <form> are what
// register it with an agent; removing either attribute unregisters the tool.
const TOOL_NAME = 'submitSupportRequest'
const TOOL_DESCRIPTION = 'Submit a customer support request to the right team.'

const topicOptions = [
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical' },
  { value: 'general', label: 'General' },
]

// Mirrors the `toolparamdescription` attributes on the fields below so learners
// can see, side by side, how annotations become the tool's input schema.
const toolParameters = [
  {
    name: 'fullName',
    type: 'string',
    description: 'The full name of the person who needs help.',
  },
  {
    name: 'email',
    type: 'string',
    description: 'A contact email address for the reply.',
  },
  {
    name: 'topic',
    type: 'enum: billing | technical | general',
    description: 'Which team should receive the request.',
  },
  {
    name: 'details',
    type: 'string',
    description: 'What the person needs help with.',
  },
]

const supportBanner: Record<
  ReturnType<typeof useWebmcpDeclarative>['support'],
  { tone: string; text: string }
> = {
  checking: {
    tone: 'text-slate-500',
    text: 'Checking whether this browser exposes WebMCP tools…',
  },
  supported: {
    tone: 'text-brand-green',
    text: 'This browser exposes the form to agents as a WebMCP tool. An agent can fill and submit the same fields a person can.',
  },
  unavailable: {
    tone: 'text-slate-600',
    text: 'This browser does not expose WebMCP tools, so no agent can call this form. It still works normally for people.',
  },
}

export function WebmcpDeclarativeDemo({ accent }: { accent: DemoAccent }) {
  const declarative = useWebmcpDeclarative()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState(topicOptions[0].value)
  const [details, setDetails] = useState('')

  const banner = supportBanner[declarative.support]

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Always take over submission: there is no backend, and respondWith() (used
    // for agent calls) requires preventDefault() to run first.
    event.preventDefault()
    const native = event.nativeEvent as SubmitEvent
    const agentInvoked = native.agentInvoked === true

    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    const trimmedDetails = details.trim()

    if (!trimmedName || !trimmedEmail.includes('@') || !trimmedDetails) {
      const message =
        'Add a name, a valid email, and a short message before submitting.'
      declarative.reportError(message)
      // Hand the same validation error back so an agent can correct its input.
      if (agentInvoked) {
        native.respondWith?.(Promise.reject(new Error(message)))
      }
      return
    }

    const topicLabel =
      topicOptions.find((option) => option.value === topic)?.label ?? topic
    const confirmation = `Support request routed to the ${topicLabel} team for ${trimmedName} (${trimmedEmail}).`
    declarative.reportSuccess(confirmation)
    // The same text the person sees is serialized back to the agent as output.
    if (agentInvoked) {
      native.respondWith?.(Promise.resolve(confirmation))
    }
  }

  function handleClear() {
    setFullName('')
    setEmail('')
    setTopic(topicOptions[0].value)
    setDetails('')
    declarative.reset()
  }

  return (
    <DemoSection
      accent={accent}
      eyebrow="WebMCP · Declarative"
      title="Declarative API: turn a form into an agent tool"
      description="Annotate a normal support form with toolname and tooldescription, and each field becomes a typed tool parameter. The form stays fully usable by people, while an agent can fill and submit the same fields."
      availability={{
        status: 'origin-trial',
        summary: 'Origin trial from Chrome 149.',
        flags: webmcpFlags,
      }}
      codePath="webmcp-declarative-api.ts → use-webmcp-declarative.ts → webmcp-declarative-demo.tsx"
      lifecycleNote="The hook subscribes to the window toolactivated / toolcancel events on mount and removes them on unmount. The form owns submission so it can call respondWith() synchronously; there is no model or session to destroy."
    >
      <p className={`text-sm font-semibold ${banner.tone}`} role="status">
        {banner.text}
      </p>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-800">
            <span className="font-mono text-xs">toolautosubmit</span>
          </span>{' '}
          is a real attribute in the Declarative API spec: adding it to a{' '}
          <span className="font-mono text-xs">{'<form>'}</span> lets the page
          author opt that specific tool into agent auto-submission, skipping
          the human-review click entirely. This demo omits an interactive
          toggle for it — the only agent-execution surface available while
          building this lesson (the Model Context Tool Inspector extension's
          simulated <span className="font-mono text-xs">executeTool()</span>)
          fills forms but never dispatches a real submit either way, so a
          live toggle here would teach behavior we can&apos;t actually verify.
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* The human interface. It never hides behind the tool: a person can
            complete it with or without an agent present. */}
        <form
          className="grid gap-4"
          toolname={TOOL_NAME}
          tooldescription={TOOL_DESCRIPTION}
          // toolautosubmit is intentionally never set: this form always keeps
          // the spec's human-review default. The available agent-testing tool
          // (see note above the form) can't reliably demonstrate what setting
          // it would actually do, so we don't expose a control that implies we
          // can.
          onSubmit={handleSubmit}
          // The browser derives each tool parameter's key from the field's
          // plain `name` attribute (the same one HTML forms have always used),
          // and its required-ness from the `required` attribute. `noValidate`
          // stops the browser's own validation popup from blocking submission
          // before our friendlier, agent-visible error message can run.
          noValidate
        >
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Full name
            <input
              className="focus:border-brand-blue focus:ring-brand-blue/20 rounded-xl border border-slate-300 px-3 py-2 font-normal focus:ring-4 focus:outline-none"
              type="text"
              name="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              toolparamdescription="The full name of the person who needs help."
              autoComplete="name"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Email
            <input
              className="focus:border-brand-blue focus:ring-brand-blue/20 rounded-xl border border-slate-300 px-3 py-2 font-normal focus:ring-4 focus:outline-none"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              toolparamdescription="A contact email address for the reply."
              autoComplete="email"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Topic
            <select
              className="focus:border-brand-blue focus:ring-brand-blue/20 rounded-xl border border-slate-300 px-3 py-2 font-normal focus:ring-4 focus:outline-none"
              name="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              toolparamdescription="Which team should receive the request."
              required
            >
              {topicOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Message
            <textarea
              className="focus:border-brand-blue focus:ring-brand-blue/20 min-h-24 rounded-xl border border-slate-300 px-3 py-2 font-normal focus:ring-4 focus:outline-none"
              name="details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              toolparamdescription="What the person needs help with."
              required
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className={`${primaryButtonClassNames[accent]} rounded-xl px-4 py-2 text-sm font-bold`}
              type="submit"
            >
              Submit request
            </button>
            <button
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              type="button"
              onClick={handleClear}
            >
              Clear form
            </button>
          </div>
        </form>

        {/* What the agent sees: the annotations above, translated into a tool
            name, description, and typed parameters. */}
        <div className="grid content-start gap-4">
          <div className={`rounded-2xl border p-4 ${softBoxClassNames[accent]}`}>
            <h3 className="text-sm font-bold text-slate-900">
              What the agent sees
            </h3>
            <dl className="mt-3 grid gap-1 text-sm text-slate-700">
              <div className="flex gap-2">
                <dt className="font-semibold text-slate-900">Tool</dt>
                <dd className="font-mono text-xs leading-5">{TOOL_NAME}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-slate-900">Purpose</dt>
                <dd>{TOOL_DESCRIPTION}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Parameters
            </p>
            <ul className="mt-2 grid gap-2">
              {toolParameters.map((parameter) => (
                <li
                  key={parameter.name}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-sm"
                >
                  <p className="font-mono text-xs text-slate-900">
                    {parameter.name}
                    <span className="text-slate-400"> · {parameter.type}</span>
                  </p>
                  <p className="mt-1 text-slate-600">{parameter.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-2xl border border-slate-200 bg-white p-4"
            aria-live="polite"
          >
            <h3 className="text-sm font-bold text-slate-900">Tool activity</h3>
            <div className="mt-2 text-sm leading-6">
              {declarative.activity === 'idle' ? (
                <p className="text-slate-500">
                  Submit the form yourself, or let an agent call the tool. Agent
                  activation, submission, cancellation, and errors all appear
                  here.
                </p>
              ) : null}
              {declarative.activity === 'activated' ? (
                <p className={accentTextClassNames[accent]}>
                  An agent activated{' '}
                  <span className="font-mono text-xs">
                    {declarative.toolName}
                  </span>{' '}
                  and pre-filled the form. Review the values and submit.
                </p>
              ) : null}
              {declarative.activity === 'success' ? (
                <div className="text-slate-700">
                  <p className="text-brand-green font-semibold">
                    Submitted successfully.
                  </p>
                  <p className="mt-1">
                    Returned to the caller: {declarative.output}
                  </p>
                </div>
              ) : null}
              {declarative.activity === 'canceled' ? (
                <p className="text-slate-600">
                  The agent operation for{' '}
                  <span className="font-mono text-xs">
                    {declarative.toolName}
                  </span>{' '}
                  was canceled.
                </p>
              ) : null}
              {declarative.activity === 'error' ? (
                <p className="text-brand-red">{declarative.error}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </DemoSection>
  )
}
