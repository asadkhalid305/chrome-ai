import { useEffect, useRef, useState } from 'react'

import {
  errorMessage,
  isAbortError,
  toCapabilityState,
  type CapabilityState,
  type RequestState,
} from '../../chrome-ai/shared-types'
import {
  translatorApi,
  type TranslatorAdapter,
  type TranslatorOptions,
  type TranslatorSession,
} from './translator-api'

export function useTranslator(
  options: TranslatorOptions,
  adapter: TranslatorAdapter = translatorApi,
) {
  const [capability, setCapability] = useState<CapabilityState>('checking')
  const [request, setRequest] = useState<RequestState>('idle')
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<TranslatorSession | null>(null)
  const requestControllerRef = useRef<AbortController | null>(null)
  const lifecycleRef = useRef(0)

  useEffect(() => {
    lifecycleRef.current += 1
    let active = true
    setCapability('checking')
    setRequest('idle')
    setOutput('')
    setError(null)

    void adapter
      .availability(options)
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
    }
  }, [adapter, options.sourceLanguage, options.targetLanguage])

  async function prepare(signal?: AbortSignal): Promise<TranslatorSession> {
    if (sessionRef.current) return sessionRef.current
    const lifecycle = lifecycleRef.current

    setCapability('downloading')
    setDownloadProgress(0)
    setError(null)

    try {
      const session = await adapter.create(options, setDownloadProgress, signal)
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
  }

  async function translate(input: string) {
    const lifecycle = lifecycleRef.current
    setRequest('running')
    setOutput('')
    setError(null)
    const controller = new AbortController()
    requestControllerRef.current = controller

    try {
      const session = await prepare(controller.signal)
      const result = await session.translate(input, { signal: controller.signal })
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

  function cancel() {
    requestControllerRef.current?.abort()
  }

  return {
    capability,
    request,
    downloadProgress,
    output,
    error,
    prepare,
    translate,
    cancel,
  }
}
