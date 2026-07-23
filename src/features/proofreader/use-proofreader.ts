import { useEffect, useRef, useState } from 'react'

import {
  errorMessage,
  isAbortError,
  toCapabilityState,
  type CapabilityState,
  type RequestState,
} from '../../chrome-ai/shared-types'
import {
  proofreaderApi,
  type ProofreaderAdapter,
  type ProofreaderResult,
  type ProofreaderSession,
} from './proofreader-api'

interface CompletedProofread {
  input: string
  result: ProofreaderResult
}

export function useProofreader(adapter: ProofreaderAdapter = proofreaderApi) {
  const [capability, setCapability] = useState<CapabilityState>('checking')
  const [request, setRequest] = useState<RequestState>('idle')
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [completedProofread, setCompletedProofread] =
    useState<CompletedProofread | null>(null)
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<ProofreaderSession | null>(null)
  const preparationRef = useRef<Promise<ProofreaderSession> | null>(null)
  const requestControllerRef = useRef<AbortController | null>(null)
  const lifecycleRef = useRef(0)

  useEffect(() => {
    lifecycleRef.current += 1
    let active = true

    void adapter
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
      sessionRef.current?.destroy()
    }
  }, [adapter])

  async function prepare(signal?: AbortSignal): Promise<ProofreaderSession> {
    if (sessionRef.current) return sessionRef.current
    if (preparationRef.current) return preparationRef.current
    const lifecycle = lifecycleRef.current

    setCapability('downloading')
    setDownloadProgress(0)
    setError(null)

    const creation = (async () => {
      try {
        const session = await adapter.create(setDownloadProgress, signal)
        if (lifecycleRef.current !== lifecycle) {
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

  async function proofread(input: string) {
    const lifecycle = lifecycleRef.current
    setRequest('running')
    setCompletedProofread(null)
    setError(null)
    const controller = new AbortController()
    requestControllerRef.current = controller

    try {
      const session = await prepare(controller.signal)
      const nextResult = await session.proofread(input, {
        signal: controller.signal,
      })
      if (lifecycleRef.current !== lifecycle) return
      setCompletedProofread({ input, result: nextResult })
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
    completedProofread,
    error,
    proofread,
    cancel: () => requestControllerRef.current?.abort(),
  }
}
