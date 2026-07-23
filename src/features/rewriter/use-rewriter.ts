import { useEffect, useRef, useState } from 'react'

import {
  errorMessage,
  isAbortError,
  toCapabilityState,
  type CapabilityState,
  type RequestState,
} from '../../chrome-ai/shared-types'
import {
  rewriterApi,
  type RewriteChange,
  type RewriterAdapter,
  type RewriterSession,
} from './rewriter-api'

interface RewriterPreparation {
  change: RewriteChange
  promise: Promise<RewriterSession>
}

export function useRewriter(adapter: RewriterAdapter = rewriterApi) {
  const [capability, setCapability] = useState<CapabilityState>('checking')
  const [request, setRequest] = useState<RequestState>('idle')
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<RewriterSession | null>(null)
  const sessionChangeRef = useRef<RewriteChange | null>(null)
  const preparationRef = useRef<RewriterPreparation | null>(null)
  const requestControllerRef = useRef<AbortController | null>(null)
  const lifecycleRef = useRef(0)

  useEffect(() => {
    lifecycleRef.current += 1
    let active = true

    void adapter
      .availability('more-formal')
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
      sessionRef.current?.destroy()
    }
  }, [adapter])

  async function prepare(
    change: RewriteChange,
    signal?: AbortSignal,
  ): Promise<RewriterSession> {
    if (sessionRef.current && sessionChangeRef.current === change) {
      return sessionRef.current
    }
    const activePreparation = preparationRef.current
    if (activePreparation) {
      if (activePreparation.change === change) {
        return activePreparation.promise
      }
      await activePreparation.promise.catch(() => undefined)
      if (sessionRef.current && sessionChangeRef.current === change) {
        return sessionRef.current
      }
    }
    const lifecycle = lifecycleRef.current

    sessionRef.current?.destroy()
    sessionRef.current = null
    sessionChangeRef.current = null
    setCapability('downloading')
    setDownloadProgress(0)
    setError(null)

    const creation = (async () => {
      try {
        const session = await adapter.create(change, setDownloadProgress, signal)
        if (lifecycleRef.current !== lifecycle) {
          session.destroy()
          throw new DOMException('The lesson was cleaned up.', 'AbortError')
        }
        sessionRef.current = session
        sessionChangeRef.current = change
        setCapability('ready')
        setDownloadProgress(null)
        return session
      } catch (reason) {
        if (lifecycleRef.current !== lifecycle) throw reason
        if (isAbortError(reason)) {
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
      if (preparationRef.current?.promise === preparation) {
        preparationRef.current = null
      }
    })

    preparationRef.current = { change, promise: preparation }
    return preparation
  }

  async function rewrite(input: string, change: RewriteChange) {
    const lifecycle = lifecycleRef.current
    setRequest('running')
    setOutput('')
    setError(null)
    const controller = new AbortController()
    requestControllerRef.current = controller

    try {
      const session = await prepare(change, controller.signal)
      const result = await session.rewrite(input, {
        context: 'Keep the meaning and important facts of this message.',
        signal: controller.signal,
      })
      if (lifecycleRef.current !== lifecycle) return
      setOutput(result)
      setRequest('success')
    } catch (reason) {
      if (lifecycleRef.current !== lifecycle) return
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

  return {
    capability,
    request,
    downloadProgress,
    output,
    error,
    rewrite,
    cancel: () => requestControllerRef.current?.abort(),
  }
}
