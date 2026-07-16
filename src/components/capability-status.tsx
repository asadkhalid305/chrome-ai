import type { CapabilityState } from '../chrome-ai/shared-types'

const capabilityCopy: Record<CapabilityState, string> = {
  checking: 'Checking browser support…',
  unavailable: 'Unavailable in this browser or on this device.',
  downloadable: 'Supported. The model downloads after you choose to prepare it.',
  downloading: 'Downloading the on-device model…',
  ready: 'Ready on this device.',
  error: 'The browser capability check failed.',
}

interface CapabilityStatusProps {
  capability: CapabilityState
  downloadProgress: number | null
}

export function CapabilityStatus({
  capability,
  downloadProgress,
}: CapabilityStatusProps) {
  const progressLabel =
    capability === 'downloading' && downloadProgress !== null
      ? ` ${Math.round(downloadProgress * 100)}% complete.`
      : ''

  return (
    <p
      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
      role="status"
    >
      <span className="font-semibold">Browser status:</span>{' '}
      {capabilityCopy[capability]}
      {progressLabel}
    </p>
  )
}
