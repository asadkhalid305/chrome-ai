import { useEffect, useRef, useState } from 'react'
import {
  errorMessage,
  isAbortError,
  toCapabilityState,
  type DemoState,
} from '../../chrome-ai/shared-types'

// UI scaffolding only. The portable exercise function owns every native call
// and destroys its own session in finally; this hook owns React state and aborts.
export function useWorkshopRequest<TInput = string>(
  checkAvailability: () => Promise<Availability>,
  execute: (
    input: TInput,
    signal: AbortSignal,
    progress: (fraction: number) => void,
    partial: (textSoFar: string) => void,
  ) => Promise<string>,
) {
  const [state, setState] = useState<DemoState>({
    capability: 'checking',
    request: 'idle',
    error: null,
    downloadProgress: null,
  })
  const [output, setOutput] = useState('')
  const [partialOutput, setPartialOutput] = useState<string | undefined>()
  const activeRequest = useRef<AbortController | null>(null)

  useEffect(() => {
    let mounted = true
    void checkAvailability()
      .then((value) => {
        if (mounted)
          setState((previous) => ({
            ...previous,
            capability: toCapabilityState(value),
          }))
      })
      .catch((reason: unknown) => {
        if (mounted)
          setState((previous) => ({
            ...previous,
            capability: 'error',
            error: errorMessage(reason),
          }))
      })
    return () => {
      mounted = false
      activeRequest.current?.abort()
      activeRequest.current = null
    }
  }, [checkAvailability])

  async function run(input: TInput) {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    setOutput('')
    setPartialOutput(undefined)
    setState((previous) => ({ ...previous, request: 'running', error: null }))
    try {
      const result = await execute(
        input,
        controller.signal,
        (fraction) => {
          if (activeRequest.current !== controller || controller.signal.aborted)
            return
          setState((previous) => ({
            ...previous,
            capability: fraction < 1 ? 'downloading' : 'ready',
            downloadProgress: fraction < 1 ? fraction : null,
          }))
        },
        (textSoFar) => {
          if (activeRequest.current !== controller || controller.signal.aborted)
            return
          setPartialOutput(textSoFar)
        },
      )
      if (activeRequest.current !== controller) return
      controller.signal.throwIfAborted()
      setOutput(result)
      setState({
        capability: 'ready',
        request: 'success',
        error: null,
        downloadProgress: null,
      })
    } catch (reason) {
      if (activeRequest.current !== controller) return
      const canceled = controller.signal.aborted || isAbortError(reason)
      setState((previous) => ({
        ...previous,
        capability:
          previous.capability === 'downloading'
            ? 'downloadable'
            : previous.capability,
        request: canceled ? 'canceled' : 'error',
        error: canceled ? null : errorMessage(reason),
        downloadProgress: null,
      }))
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null
    }
  }

  return {
    ...state,
    output,
    partialOutput,
    run,
    cancel: () => activeRequest.current?.abort(),
  }
}
