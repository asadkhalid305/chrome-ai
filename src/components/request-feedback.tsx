import type { CapabilityState, RequestState } from '../chrome-ai/shared-types'

interface RequestFeedbackProps {
  request: RequestState
  capability: CapabilityState
  error: string | null
  mode?: 'batch' | 'streaming'
  id?: string
}

// Keep request feedback consistent even when a lesson renders a custom result.
export function RequestFeedback({
  request,
  capability,
  error,
  mode = 'batch',
  id,
}: RequestFeedbackProps) {
  if (request === 'running' && mode !== 'streaming') {
    return (
      <p id={id} role="status">
        {capability === 'downloading'
          ? 'Preparing the on-device model… Work will start automatically.'
          : 'Running on your device…'}
      </p>
    )
  }
  if (request === 'canceled') return <p role="status">Request canceled.</p>
  if (request === 'error')
    return (
      <p className="text-brand-red" role="alert">
        {error}
      </p>
    )
  return null
}
