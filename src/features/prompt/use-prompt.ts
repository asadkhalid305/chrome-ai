import { useEffect, useRef, useState } from 'react'

import {
  errorMessage,
  isAbortError,
  toCapabilityState,
  type CapabilityState,
  type RequestState,
} from '../../chrome-ai/shared-types'
import {
  promptApi,
  type PromptAdapter,
  type PromptSession,
} from './prompt-api'

export function usePrompt(adapter: PromptAdapter = promptApi) {
  const [capability, setCapability] = useState<CapabilityState>('checking')
  const [request, setRequest] = useState<RequestState>('idle')
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<PromptSession | null>(null)
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

  async function prepare(signal?: AbortSignal): Promise<PromptSession> {
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

  async function prompt(input: string) {
    const lifecycle = lifecycleRef.current
    setRequest('running')
    setOutput('')
    setError(null)
    const controller = new AbortController()
    requestControllerRef.current = controller

    try {
      const session = await prepare(controller.signal)
      const result = await session.prompt(input, { signal: controller.signal })
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
    prompt,
    cancel: () => requestControllerRef.current?.abort(),
  }
}
