import { useEffect, useRef, useState } from 'react'

import {
  errorMessage,
  isAbortError,
  toCapabilityState,
  type CapabilityState,
  type DemoState,
  type RequestState,
} from './shared-types'

// Every built-in AI API in this project shares one lifecycle: probe
// availability, create a session (downloading the model the first time), reuse
// that session, abort in-flight work on request, and destroy the session on
// unmount. Seven copies of it had already drifted apart -- three demos guarded
// against double-submitting during a download and four did not, one nulled its
// refs on cleanup and six left them pointing at destroyed sessions.
//
// So the lifecycle lives here once, and each feature hook keeps the part a
// reader actually came for: which options it passes and which method it calls.

interface DestroyableSession {
  destroy(): void
}

export interface ChromeAiSessionConfig<TSession extends DestroyableSession> {
  availability: () => Promise<Availability>
  create: (
    onDownloadProgress: (progress: number) => void,
    signal?: AbortSignal,
  ) => Promise<TSession>
  // Probe availability again and reset the feature when this changes. Translator
  // uses the language pair, because a different pair is a different model.
  resetKey?: string
  // Keep the previous result on screen while a new request runs. Writer needs
  // this because its draft is an editable textarea the user may have typed into.
  keepPreviousResult?: boolean
}

export function useChromeAiSession<TSession extends DestroyableSession, TResult>(
  config: ChromeAiSessionConfig<TSession>,
) {
  const [capability, setCapability] = useState<CapabilityState>('checking')
  const [request, setRequest] = useState<RequestState>('idle')
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [result, setResult] = useState<TResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sessionRef = useRef<TSession | null>(null)
  const preparationRef = useRef<Promise<TSession> | null>(null)
  const requestControllerRef = useRef<AbortController | null>(null)
  // Incremented on every mount, reset, and unmount. Async work compares the
  // value it started with against the current one, which is how a slow model
  // response knows it belongs to a lifecycle nobody is watching any more.
  const lifecycleRef = useRef(0)

  const { resetKey } = config

  useEffect(() => {
    lifecycleRef.current += 1
    let active = true

    // On mount these are already the initial values. They matter when
    // `resetKey` changes, because that means a different model.
    setCapability('checking')
    setRequest('idle')
    setResult(null)
    setError(null)

    void config
      .availability()
      .then((availability) => {
        if (active) setCapability(toCapabilityState(availability))
      })
      .catch((reason: unknown) => {
        if (active) {
          setCapability('error')
          setError(errorMessage(reason))
        }
      })

    return () => {
      lifecycleRef.current += 1
      active = false
      requestControllerRef.current?.abort()
      requestControllerRef.current = null
      sessionRef.current?.destroy()
      sessionRef.current = null
      preparationRef.current = null
    }
    // `config` holds fresh closures every render, so this is keyed on the reset
    // key instead. The effect that runs is the one from the render where the key
    // changed, so it reads that render's `availability`.
  }, [resetKey])

  // Creates the session on first use and reuses it afterwards, which is what
  // Chrome recommends: creating one per request would re-pay the setup cost.
  async function prepare(signal?: AbortSignal): Promise<TSession> {
    if (sessionRef.current) return sessionRef.current

    // Two submits during one model download must share a session, or the second
    // creates a model that nothing will ever destroy. If a superseded request
    // aborted that shared create, a still-live request starts a fresh one.
    if (preparationRef.current) {
      try {
        return await preparationRef.current
      } catch (reason) {
        if (sessionRef.current) return sessionRef.current
        if (signal?.aborted) throw reason
      }
    }

    if (sessionRef.current) return sessionRef.current
    if (preparationRef.current) return prepare(signal)

    const lifecycle = lifecycleRef.current
    setCapability('downloading')
    setDownloadProgress(0)
    setError(null)

    const creation = (async () => {
      try {
        const session = await config.create(setDownloadProgress, signal)
        if (lifecycleRef.current !== lifecycle) {
          // The demo went away while the model downloaded. Chrome already
          // created the session, so destroy it here or it leaks.
          session.destroy()
          throw new DOMException('The demo was cleaned up.', 'AbortError')
        }
        sessionRef.current = session
        setCapability('ready')
        setDownloadProgress(null)
        return session
      } catch (reason) {
        if (lifecycleRef.current !== lifecycle) throw reason
        if (isAbortError(reason)) {
          // A canceled download leaves the model downloadable, not broken.
          setCapability('downloadable')
          setDownloadProgress(null)
          throw reason
        }
        setCapability('error')
        setError(errorMessage(reason))
        throw reason
      }
    })()

    const preparation = creation.finally(() => {
      if (preparationRef.current === preparation) {
        preparationRef.current = null
      }
    })

    preparationRef.current = preparation
    return preparation
  }

  // Throws the cached session away so the next request creates a fresh one. Some
  // Chrome options are fixed when the session is created, so a feature whose
  // options changed has no way to reuse it.
  async function discardSession() {
    if (preparationRef.current) {
      // Wait for an in-flight creation to land in `sessionRef` first, otherwise
      // the session it is about to produce would have nothing to destroy it.
      await preparationRef.current.catch(() => undefined)
    }
    sessionRef.current?.destroy()
    sessionRef.current = null
    preparationRef.current = null
  }

  // Wraps one call to the native API in the request state machine. The operation
  // receives the ready session plus a signal it must forward to Chrome, which is
  // what makes cancellation reach the model rather than only the UI.
  async function run(
    operation: (session: TSession, signal: AbortSignal) => Promise<TResult>,
  ) {
    const lifecycle = lifecycleRef.current
    // A second submit can land before React disables the button. Abort the
    // previous run first so cancel() and unmount always target the active
    // request, and so a late success from the old run cannot overwrite it.
    requestControllerRef.current?.abort()

    setRequest('running')
    setError(null)
    if (!config.keepPreviousResult) setResult(null)

    const controller = new AbortController()
    requestControllerRef.current = controller

    function isActiveRequest() {
      return (
        lifecycleRef.current === lifecycle &&
        requestControllerRef.current === controller
      )
    }

    try {
      const session = await prepare(controller.signal)
      if (!isActiveRequest()) return
      const nextResult = await operation(session, controller.signal)
      if (!isActiveRequest()) return
      setResult(nextResult)
      setRequest('success')
    } catch (reason) {
      if (!isActiveRequest()) return
      if (isAbortError(reason)) {
        setRequest('canceled')
      } else {
        setRequest('error')
        setError(errorMessage(reason))
      }
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null
      }
    }
  }

  function cancel() {
    requestControllerRef.current?.abort()
  }

  const state: DemoState = { capability, request, downloadProgress, error }

  return { state, result, setResult, run, cancel, discardSession }
}
