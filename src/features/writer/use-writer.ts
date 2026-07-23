import { useEffect, useRef, useState } from 'react'

import {
  errorMessage,
  isAbortError,
  toCapabilityState,
  type CapabilityState,
  type RequestState,
} from '../../chrome-ai/shared-types'
import { writerApi, type WriterAdapter, type WriterSession } from './writer-api'

export function useWriter(adapter: WriterAdapter = writerApi) {
  const [capability, setCapability] = useState<CapabilityState>('checking')
  const [request, setRequest] = useState<RequestState>('idle')
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<WriterSession | null>(null)
  const preparationRef = useRef<Promise<WriterSession> | null>(null)
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

  async function prepare(signal?: AbortSignal): Promise<WriterSession> {
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
          throw new DOMException('The lesson was cleaned up.', 'AbortError')
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

  async function write(idea: string, context: string) {
    const lifecycle = lifecycleRef.current
    setRequest('running')
    setError(null)
    const controller = new AbortController()
    requestControllerRef.current = controller

    try {
      const session = await prepare(controller.signal)
      const result = await session.write(idea, {
        context: context.trim() || undefined,
        signal: controller.signal,
      })
      if (lifecycleRef.current !== lifecycle) return
      setDraft(result)
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
    draft,
    error,
    setDraft,
    prepare,
    write,
    cancel: () => requestControllerRef.current?.abort(),
  }
}
