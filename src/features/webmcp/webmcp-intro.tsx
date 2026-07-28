import { webmcpFlags } from '../../components/api-availability'
import { DemoSection } from '../../components/demo-section'
import { softBoxClassNames, type DemoAccent } from '../../theme/accent'

// Static overview only. WebMCP is an origin-trial agentic-web API, not an
// on-device inference API, so this surface deliberately creates no session and
// never touches `document.modelContext` or any WebMCP or built-in-AI global.
// The concrete Declarative and Imperative demos arrive in later tickets.
export function WebMcpIntro({ accent }: { accent: DemoAccent }) {
  return (
    <DemoSection
      accent={accent}
      eyebrow="WebMCP track"
      title="WebMCP: website tools for browser agents"
      description="WebMCP lets a page expose structured, human-visible tools that an AI agent can call to complete a task. It sits in a separate track from the built-in-AI demos because it exposes your website's capabilities to agents rather than running a Chrome model on the device."
      availability={{
        status: 'origin-trial',
        summary: 'Origin trial from Chrome 149.',
        flags: webmcpFlags,
      }}
      codePath="features/webmcp/webmcp-intro.tsx (static overview — no adapter or hook yet)"
      lifecycleNote="This overview calls no browser API and creates no session. The Declarative and Imperative demos will each own their own tool registration, permissions, and cleanup."
    >
      <div className="grid gap-4">
        <div className={`rounded-2xl border p-4 ${softBoxClassNames[accent]}`}>
          <h3 className="text-sm font-bold text-slate-900">
            Not on-device inference
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            The built-in-AI demos run a local Chrome model to translate,
            summarize, or generate text. WebMCP works in the other direction: it
            publishes your site&rsquo;s actions so a browser agent can drive
            them. No model runs on this surface, and it never calls a WebMCP or
            built-in-AI global.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-bold text-slate-900">
            Two demos in this track
          </h3>
          <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-600">
            <li>
              <span className="font-semibold text-slate-900">
                Declarative API
              </span>{' '}
              — annotate a visible HTML form so an agent can fill and submit it.
              Available now in the next tab.
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                Imperative API
              </span>{' '}
              — register schema-driven JavaScript tools through{' '}
              <code className="font-mono text-xs">document.modelContext</code>{' '}
              with explicit inputs, permissions, and user-visible state.
              Available now in the tab after Declarative.
            </li>
          </ul>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            This entry point frames the boundary so the one-hour built-in-AI
            demo stays focused.
          </p>
        </div>
      </div>
    </DemoSection>
  )
}
