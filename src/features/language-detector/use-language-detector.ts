import { useEffect, useRef, useState } from 'react'

import {
  errorMessage,
  isAbortError,
  toCapabilityState,
  type CapabilityState,
  type RequestState,
} from '../../chrome-ai/shared-types'
import {
  languageDetectorApi,
  type DetectionResult,
  type LanguageDetectorAdapter,
  type LanguageDetectorSession,
} from './language-detector-api'

export function useLanguageDetector(
  adapter: LanguageDetectorAdapter = languageDetectorApi,
) {
  const [capability, setCapability] = useState<CapabilityState>('checking')
  const [request, setRequest] = useState<RequestState>('idle')
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [results, setResults] = useState<DetectionResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<LanguageDetectorSession | null>(null)
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

  async function prepare(signal?: AbortSignal): Promise<LanguageDetectorSession> {
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

  async function detect(input: string) {
    const lifecycle = lifecycleRef.current
    setRequest('running')
    setResults([])
    setError(null)
    const controller = new AbortController()
    requestControllerRef.current = controller

    try {
      const session = await prepare(controller.signal)
      const detectionResults = await session.detect(input, {
        signal: controller.signal,
      })
      if (lifecycleRef.current !== lifecycle) return
      setResults(detectionResults)
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
    results,
    error,
    prepare,
    detect,
    cancel: () => requestControllerRef.current?.abort(),
  }
}
