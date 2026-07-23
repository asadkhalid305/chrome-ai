import { useEffect, useState } from 'react'

import {
  webmcpDeclarativeApi,
  type WebmcpDeclarativeAdapter,
} from './webmcp-declarative-api'

// Whether this browser context exposes the form to agents. The form is always
// usable by people, so this only drives an informational banner.
export type DeclarativeSupport = 'checking' | 'supported' | 'unavailable'

// The tool's visible lifecycle. `activated` means an agent pre-filled the form
// and is waiting for submission; the others are terminal outcomes.
export type DeclarativeActivity =
  | 'idle'
  | 'activated'
  | 'success'
  | 'canceled'
  | 'error'

export interface WebmcpDeclarativeState {
  support: DeclarativeSupport
  activity: DeclarativeActivity
  // Name reported by the last agent tool event, for user-facing messaging.
  toolName: string | null
  // Text handed back to the agent (and shown to the person) on success.
  output: string
  error: string | null
  reportSuccess: (output: string) => void
  reportError: (message: string) => void
  reset: () => void
}

export function useWebmcpDeclarative(
  adapter: WebmcpDeclarativeAdapter = webmcpDeclarativeApi,
): WebmcpDeclarativeState {
  const [support, setSupport] = useState<DeclarativeSupport>('checking')
  const [activity, setActivity] = useState<DeclarativeActivity>('idle')
  const [toolName, setToolName] = useState<string | null>(null)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSupport(adapter.isSupported() ? 'supported' : 'unavailable')

    // Agent-driven events fire on window, so we subscribe once and clean up on
    // unmount. The component still owns the submit handler because respondWith()
    // must run synchronously on the SubmitEvent.
    const unsubscribe = adapter.subscribeToolEvents({
      onActivated: (name) => {
        setToolName(name)
        setError(null)
        setActivity('activated')
      },
      onCancel: (name) => {
        setToolName(name)
        setActivity('canceled')
      },
    })

    return unsubscribe
  }, [adapter])

  function reportSuccess(nextOutput: string) {
    setOutput(nextOutput)
    setError(null)
    setActivity('success')
  }

  function reportError(message: string) {
    setError(message)
    setActivity('error')
  }

  function reset() {
    setActivity('idle')
    setToolName(null)
    setOutput('')
    setError(null)
  }

  return {
    support,
    activity,
    toolName,
    output,
    error,
    reportSuccess,
    reportError,
    reset,
  }
}
