import { useEffect, useState } from 'react'

import {
  webmcpImperativeApi,
  type WebmcpImperativeAdapter,
} from './webmcp-imperative-api'

// Whether this browser context exposes `document.modelContext`. The lesson's
// human UI works either way; this only drives an informational banner and
// determines whether we attempt tool registration.
export type ImperativeSupport = 'checking' | 'supported' | 'unavailable'

// The tool's visible lifecycle. `running` means an agent is currently executing
// the tool; `success` and `error` are terminal outcomes of the most recent
// invocation. `idle` covers "no agent has called the tool yet, or the reader
// pressed Reset".
export type ImperativeActivity = 'idle' | 'running' | 'success' | 'error'

export interface TodoItem {
  id: string
  text: string
  // Which surface added this item. Rendered as a badge in the UI so a reader
  // can see, at a glance, which entries came from an agent tool call.
  source: 'person' | 'agent'
}

export interface WebmcpImperativeState {
  support: ImperativeSupport
  activity: ImperativeActivity
  todos: readonly TodoItem[]
  lastResult: string | null
  lastError: string | null
  addFromPerson: (text: string) => void
  remove: (id: string) => void
  clearAll: () => void
  reset: () => void
}

// The single tool this lesson registers, pulled up to module scope so the
// contract (name, description, JSON Schema) is a literal the reader can point
// at without navigating through the hook body. The demo component renders this
// exact object next to the human UI, so what the reader sees always matches
// what the browser registers.
const TOOL_NAME = 'addTodo'
const TOOL_DESCRIPTION = 'Add a new item to the local to-do list on this page.'
const TOOL_INPUT_SCHEMA: WebmcpInputSchema = {
  type: 'object',
  properties: {
    text: {
      type: 'string',
      description: 'The task to add. One short line of plain text.',
    },
  },
  required: ['text'],
  additionalProperties: false,
}

export const IMPERATIVE_TOOL_CONTRACT = {
  name: TOOL_NAME,
  description: TOOL_DESCRIPTION,
  inputSchema: TOOL_INPUT_SCHEMA,
} as const

// Small id helper. Random enough for a per-session UI list; not intended as a
// stable identifier beyond this page's lifetime.
function makeId(source: TodoItem['source']): string {
  return `${source}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function useWebmcpImperative(
  adapter: WebmcpImperativeAdapter = webmcpImperativeApi,
): WebmcpImperativeState {
  const [support, setSupport] = useState<ImperativeSupport>('checking')
  const [activity, setActivity] = useState<ImperativeActivity>('idle')
  const [todos, setTodos] = useState<readonly TodoItem[]>([])
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)

  // Support detection is a separate effect from registration because the two
  // have different reasons to change and different failure modes. Splitting
  // them keeps each responsibility a single hook the reader can trace.
  useEffect(() => {
    setSupport(adapter.isSupported() ? 'supported' : 'unavailable')
  }, [adapter])

  useEffect(() => {
    // Skip registration entirely when the API is absent: the human to-do list
    // still works, and there is no browser surface to hand the tool to.
    if (!adapter.isSupported()) {
      return
    }

    const controller = new AbortController()

    // `execute` is captured once, at registration time. That is safe because
    // every state setter it closes over has a stable identity, and we always
    // use the functional form of setTodos so the closure never reads a stale
    // `todos` value.
    const execute = async (input: unknown): Promise<string> => {
      // Agent input crosses a trust boundary. Reject anything that does not
      // match the schema with a clear error string — the browser hands it back
      // to the agent, so a good message is a correction cue for the next turn.
      if (typeof input !== 'object' || input === null || !('text' in input)) {
        const message = `${TOOL_NAME} requires an object with a "text" string field.`
        setLastError(message)
        setLastResult(null)
        setActivity('error')
        throw new Error(message)
      }
      const rawText = (input as { text: unknown }).text
      if (typeof rawText !== 'string' || rawText.trim().length === 0) {
        const message = `${TOOL_NAME} needs a non-empty "text" string.`
        setLastError(message)
        setLastResult(null)
        setActivity('error')
        throw new Error(message)
      }

      setActivity('running')
      setLastError(null)

      const trimmed = rawText.trim()
      const item: TodoItem = {
        id: makeId('agent'),
        text: trimmed,
        source: 'agent',
      }
      setTodos((curr) => [...curr, item])

      const confirmation = `Added to-do: "${trimmed}".`
      setLastResult(confirmation)
      setActivity('success')
      return confirmation
    }

    const spec: WebmcpToolSpec = {
      name: TOOL_NAME,
      description: TOOL_DESCRIPTION,
      inputSchema: TOOL_INPUT_SCHEMA,
      execute,
      annotations: {
        // The tool mutates page state, so it is not read-only. Its return value
        // is generated by this page, not fetched from elsewhere, so it is not
        // "untrusted content" in the WebMCP sense.
        readOnlyHint: false,
        untrustedContentHint: false,
      },
    }

    // Fire-and-forget. A rejection here means the browser refused registration
    // (e.g. the `tools` permissions policy blocked it); surface that as the
    // error activity so a reader can see why nothing happened.
    adapter.registerTool(spec, controller.signal).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err)
      setLastError(message)
      setActivity('error')
    })

    // Aborting the controller unregisters the tool. This is the only cleanup
    // path the Imperative API exposes; without it the tool would outlive the
    // component and the agent could still call `execute` after unmount.
    return () => controller.abort()
  }, [adapter])

  function addFromPerson(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((curr) => [
      ...curr,
      { id: makeId('person'), text: trimmed, source: 'person' },
    ])
  }

  function remove(id: string) {
    setTodos((curr) => curr.filter((todo) => todo.id !== id))
  }

  function clearAll() {
    setTodos([])
  }

  function reset() {
    setActivity('idle')
    setLastResult(null)
    setLastError(null)
  }

  return {
    support,
    activity,
    todos,
    lastResult,
    lastError,
    addFromPerson,
    remove,
    clearAll,
    reset,
  }
}
