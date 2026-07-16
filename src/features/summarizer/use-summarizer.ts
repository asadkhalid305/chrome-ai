import { useEffect, useRef, useState } from 'react'

import {
  errorMessage,
  isAbortError,
  toCapabilityState,
  type CapabilityState,
  type RequestState,
} from '../../chrome-ai/shared-types'
import {
  summarizerApi,
  type SummarizerAdapter,
  type SummarizerSession,
} from './summarizer-api'

export function useSummarizer(adapter: SummarizerAdapter = summarizerApi) {
  const [capability, setCapability] = useState<CapabilityState>('checking')
  const [request, setRequest] = useState<RequestState>('idle')
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<SummarizerSession | null>(null)
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

  async function prepare(signal?: AbortSignal): Promise<SummarizerSession> {
    if (sessionRef.current) return sessionRef.current
    const lifecycle = lifecycleRef.current

    setCapability('downloading')
    setDownloadProgress(0)
    setError(null)

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
  }

  async function summarize(input: string) {
    const lifecycle = lifecycleRef.current
    setRequest('running')
    setOutput('')
    setError(null)
    const controller = new AbortController()
    requestControllerRef.current = controller

    try {
      const session = await prepare(controller.signal)
      const result = await session.summarize(input, {
        context: 'This is a short educational article for web developers.',
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
    prepare,
    summarize,
    cancel: () => requestControllerRef.current?.abort(),
  }
}
