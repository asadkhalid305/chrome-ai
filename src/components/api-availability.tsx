// Presents each demo's Chrome release status and, when the API is still behind
// experimental flags, the exact steps to enable it. Detail stays collapsed so a
// learner only reads setup instructions when they choose to.

export interface ChromeFlag {
  // The chrome://flags id without the `chrome://flags/#` prefix.
  id: string
  // The value the learner should select, e.g. "Enabled".
  value: string
}

export interface ApiAvailability {
  // Release channel status; controls the badge tone and label. `origin-trial`
  // covers agentic-web APIs (WebMCP) that ship behind a per-origin trial token
  // rather than the on-device model developer trials.
  status: 'stable' | 'developer-trial' | 'origin-trial'
  // Short human summary, e.g. "Stable since Chrome 138".
  summary: string
  // Flags required on localhost. Omit or leave empty when none are needed.
  flags?: ChromeFlag[]
}

// Writer and Rewriter ship together as a joint developer trial and share the
// same localhost flags, so both demos reference this one source.
export const writingAssistanceFlags: ChromeFlag[] = [
  { id: 'optimization-guide-on-device-model', value: 'Enabled' },
  {
    id: 'prompt-api-for-gemini-nano-multimodal-input',
    value: 'Enabled or Enabled Multilingual',
  },
  {
    id: 'writer-api-for-gemini-nano',
    value: 'Enabled or Enabled Multilingual',
  },
]

export const proofreaderFlags: ChromeFlag[] = [
  { id: 'proofreader-api', value: 'Enabled' },
]

// WebMCP ships as an origin trial from Chrome 149. For local development it is
// gated behind a single testing flag instead of a trial token. Verified against
// https://developer.chrome.com/docs/ai/webmcp on 2026-07-23.
export const webmcpFlags: ChromeFlag[] = [
  { id: 'enable-webmcp-testing', value: 'Enabled' },
]

const statusStyles: Record<
  ApiAvailability['status'],
  { badge: string; label: string }
> = {
  stable: {
    badge: 'border-brand-green/40 bg-brand-green/10 text-brand-green',
    label: 'Stable',
  },
  'developer-trial': {
    badge: 'border-amber-300 bg-amber-50 text-amber-900',
    label: 'Developer trial',
  },
  'origin-trial': {
    badge: 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue',
    label: 'Origin trial',
  },
}

interface ApiAvailabilityInfoProps {
  availability: ApiAvailability
}

export function ApiAvailabilityInfo({ availability }: ApiAvailabilityInfoProps) {
  const styles = statusStyles[availability.status]
  const flags = availability.flags ?? []
  const requiresFlags = flags.length > 0

  return (
    <div className="mt-4 text-sm">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-600">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${styles.badge}`}
        >
          {styles.label}
        </span>
        <span>{availability.summary}</span>
        <span className="text-slate-400" aria-hidden="true">
          ·
        </span>
        <span>
          {requiresFlags
            ? 'Needs Chrome flags on localhost.'
            : 'No Chrome flags required.'}
        </span>
      </p>

      {requiresFlags ? (
        <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <summary className="focus-visible:ring-brand-blue/40 cursor-pointer font-semibold text-slate-800 focus:outline-none focus-visible:ring-4">
            How to enable this API in Chrome
          </summary>
          <ol className="mt-3 grid list-decimal gap-3 pl-5 text-slate-600">
            <li>
              Set each flag below to the listed value:
              <ul className="mt-2 grid gap-1">
                {flags.map((flag) => (
                  <li key={flag.id} className="font-mono text-xs leading-5">
                    chrome://flags/#{flag.id} →{' '}
                    <span className="font-semibold">{flag.value}</span>
                  </li>
                ))}
              </ul>
            </li>
            <li>Click Relaunch to restart Chrome.</li>
            <li>
              Open this app from{' '}
              <span className="font-mono text-xs">http://localhost</span> and
              reload the page.
            </li>
          </ol>
        </details>
      ) : null}
    </div>
  )
}
