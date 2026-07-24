import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  IMPERATIVE_TOOL_CONTRACT,
  useWebmcpImperative,
} from './use-webmcp-imperative'
import type { WebmcpImperativeAdapter } from './webmcp-imperative-api'
import { WebmcpImperativeDemo } from './webmcp-imperative-demo'

afterEach(() => {
  cleanup()
})

// A controllable fake adapter: it captures the spec and signal handed to
// `registerTool` so a test can invoke `execute()` as if the browser had routed
// an agent call, and can assert the signal was aborted on unmount.
function createFakeAdapter(isSupported: boolean) {
  const registerTool = vi.fn<WebmcpImperativeAdapter['registerTool']>()
  let capturedSpec: WebmcpToolSpec | null = null
  let capturedSignal: AbortSignal | null = null
  registerTool.mockImplementation(async (spec, signal) => {
    capturedSpec = spec
    capturedSignal = signal
  })
  const adapter: WebmcpImperativeAdapter = {
    isSupported: () => isSupported,
    registerTool,
  }
  return {
    adapter,
    registerTool,
    getSpec: () => capturedSpec,
    getSignal: () => capturedSignal,
  }
}

describe('useWebmcpImperative', () => {
  it('registers the tool with its full contract when the API is available', async () => {
    const fake = createFakeAdapter(true)
    renderHook(() => useWebmcpImperative(fake.adapter))

    await waitFor(() => expect(fake.registerTool).toHaveBeenCalledOnce())

    const spec = fake.getSpec()
    expect(spec?.name).toBe(IMPERATIVE_TOOL_CONTRACT.name)
    expect(spec?.description).toBe(IMPERATIVE_TOOL_CONTRACT.description)
    expect(spec?.inputSchema).toEqual(IMPERATIVE_TOOL_CONTRACT.inputSchema)
    expect(spec?.annotations).toEqual({
      readOnlyHint: false,
      untrustedContentHint: false,
    })
  })

  it('skips registration and reports unavailable when the API is absent', async () => {
    const fake = createFakeAdapter(false)
    const { result } = renderHook(() => useWebmcpImperative(fake.adapter))

    await waitFor(() => expect(result.current.support).toBe('unavailable'))
    expect(fake.registerTool).not.toHaveBeenCalled()
  })

  it('aborts the registration signal on unmount so the tool is unregistered', async () => {
    const fake = createFakeAdapter(true)
    const { unmount } = renderHook(() => useWebmcpImperative(fake.adapter))

    await waitFor(() => expect(fake.getSignal()).not.toBeNull())
    expect(fake.getSignal()?.aborted).toBe(false)

    unmount()
    expect(fake.getSignal()?.aborted).toBe(true)
  })

  it('adds a todo, records success, and returns a confirmation when execute is called', async () => {
    const fake = createFakeAdapter(true)
    const { result } = renderHook(() => useWebmcpImperative(fake.adapter))
    await waitFor(() => expect(fake.getSpec()).not.toBeNull())

    let returned: unknown
    await act(async () => {
      returned = await fake.getSpec()!.execute({ text: 'Buy milk' })
    })

    expect(returned).toBe('Added to-do: "Buy milk".')
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0]).toMatchObject({
      text: 'Buy milk',
      source: 'agent',
    })
    expect(result.current.activity).toBe('success')
    expect(result.current.lastResult).toBe('Added to-do: "Buy milk".')
    expect(result.current.lastError).toBeNull()
  })

  it('rejects malformed agent input with a clear error and does not touch the list', async () => {
    const fake = createFakeAdapter(true)
    const { result } = renderHook(() => useWebmcpImperative(fake.adapter))
    await waitFor(() => expect(fake.getSpec()).not.toBeNull())

    await act(async () => {
      await expect(fake.getSpec()!.execute({ text: '   ' })).rejects.toThrow(
        /non-empty "text" string/,
      )
    })

    expect(result.current.todos).toHaveLength(0)
    expect(result.current.activity).toBe('error')
    expect(result.current.lastError).toMatch(/non-empty "text" string/)

    await act(async () => {
      await expect(fake.getSpec()!.execute({ nope: 1 })).rejects.toThrow(
        /"text" string field/,
      )
    })

    expect(result.current.todos).toHaveLength(0)
  })

  it('surfaces registration failures as the error activity', async () => {
    const fake = createFakeAdapter(true)
    fake.registerTool.mockImplementationOnce(async () => {
      throw new Error('Permissions policy blocked WebMCP.')
    })

    const { result } = renderHook(() => useWebmcpImperative(fake.adapter))

    await waitFor(() => expect(result.current.activity).toBe('error'))
    expect(result.current.lastError).toBe('Permissions policy blocked WebMCP.')
  })

  it('lets a person add and remove items independently of any tool call', () => {
    const fake = createFakeAdapter(false)
    const { result } = renderHook(() => useWebmcpImperative(fake.adapter))

    act(() => result.current.addFromPerson('Write release notes'))
    act(() => result.current.addFromPerson('   '))

    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0]).toMatchObject({
      text: 'Write release notes',
      source: 'person',
    })

    act(() => result.current.remove(result.current.todos[0].id))
    expect(result.current.todos).toHaveLength(0)
  })
})

describe('WebmcpImperativeDemo', () => {
  it('lets a person add and clear items without an agent', async () => {
    const user = userEvent.setup()
    render(<WebmcpImperativeDemo accent="red" />)

    await user.type(
      screen.getByRole('textbox', { name: 'New task' }),
      'Draft the release notes',
    )
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByText('Draft the release notes')).toBeVisible()
    expect(screen.getByText('To-do list (1)')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Clear list' }))
    expect(screen.getByText('To-do list (0)')).toBeVisible()
  })

  it('renders the exact tool contract the hook registers', () => {
    render(<WebmcpImperativeDemo accent="red" />)

    // The tool name is intentionally referenced in multiple places (agent
    // card, empty-list hint, idle activity copy) so the reader can trace it.
    // The description and schema each appear exactly once, inside the agent
    // card, which is where the contract itself lives.
    expect(
      screen.getAllByText(IMPERATIVE_TOOL_CONTRACT.name).length,
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(IMPERATIVE_TOOL_CONTRACT.description)).toBeVisible()

    const schemaBlock = screen.getByText(/"required"/)
    expect(schemaBlock.textContent).toContain('"text"')
    expect(schemaBlock.textContent).toContain('"additionalProperties": false')
  })
})
