import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { WebmcpDeclarativeDemo } from './webmcp-declarative-demo'
import { useWebmcpDeclarative } from './use-webmcp-declarative'
import type {
  ToolEventHandlers,
  WebmcpDeclarativeAdapter,
} from './webmcp-declarative-api'

afterEach(() => {
  cleanup()
})

// Sets a form field's value the way the browser's Declarative API fill does:
// directly on the DOM node, without going through React's onChange. This is
// distinct from userEvent.type()/fireEvent.change(), which both dispatch the
// events React listens for and would mask the bug this simulates.
function setValueWithoutReactEvent(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(element),
    'value',
  )?.set
  valueSetter?.call(element, value)
}

// A controllable fake adapter: it captures the hook's handlers so a test can
// fire the agent-driven tool events on demand, and reports a fixed support flag.
function createFakeAdapter(isSupported: boolean) {
  let handlers: ToolEventHandlers | null = null
  const unsubscribe = vi.fn()
  const adapter: WebmcpDeclarativeAdapter = {
    isSupported: () => isSupported,
    subscribeToolEvents: (next) => {
      handlers = next
      return unsubscribe
    },
  }
  return {
    adapter,
    unsubscribe,
    activate: (toolName: string) => handlers?.onActivated(toolName),
    cancel: (toolName: string) => handlers?.onCancel(toolName),
  }
}

describe('useWebmcpDeclarative', () => {
  it('reports support and unsubscribes from tool events on unmount', () => {
    const fake = createFakeAdapter(true)
    const { result, unmount } = renderHook(() =>
      useWebmcpDeclarative(fake.adapter),
    )

    expect(result.current.support).toBe('supported')

    unmount()
    expect(fake.unsubscribe).toHaveBeenCalledOnce()
  })

  it('marks the tool unavailable when the API is absent', () => {
    const fake = createFakeAdapter(false)
    const { result } = renderHook(() => useWebmcpDeclarative(fake.adapter))

    expect(result.current.support).toBe('unavailable')
  })

  it('reflects agent activation and cancellation', () => {
    const fake = createFakeAdapter(true)
    const { result } = renderHook(() => useWebmcpDeclarative(fake.adapter))

    act(() => fake.activate('submitSupportRequest'))
    expect(result.current.activity).toBe('activated')
    expect(result.current.toolName).toBe('submitSupportRequest')

    act(() => fake.cancel('submitSupportRequest'))
    expect(result.current.activity).toBe('canceled')
  })

  it('records success output and resets back to idle', () => {
    const fake = createFakeAdapter(true)
    const { result } = renderHook(() => useWebmcpDeclarative(fake.adapter))

    act(() => result.current.reportSuccess('Routed to the Billing team.'))
    expect(result.current.activity).toBe('success')
    expect(result.current.output).toBe('Routed to the Billing team.')

    act(() => result.current.reset())
    expect(result.current.activity).toBe('idle')
    expect(result.current.output).toBe('')
  })

  // Verified against real Chrome 150: with toolautosubmit, the browser fires
  // the form's `submit` event for an agent call *before* the window's
  // `toolactivated` event for that same invocation. Without the suppression
  // guard, this late activation would revert a just-reported success back to
  // 'activated'.
  it('keeps an agent-invoked success when toolactivated arrives right after it', () => {
    const fake = createFakeAdapter(true)
    const { result } = renderHook(() => useWebmcpDeclarative(fake.adapter))

    act(() =>
      result.current.reportSuccess('Routed to the Billing team.', {
        agentInvoked: true,
      }),
    )
    act(() => fake.activate('submitSupportRequest'))

    expect(result.current.activity).toBe('success')
    expect(result.current.output).toBe('Routed to the Billing team.')
  })

  it('still shows activation when it is not immediately preceded by an agent-invoked submit', () => {
    const fake = createFakeAdapter(true)
    const { result } = renderHook(() => useWebmcpDeclarative(fake.adapter))

    act(() => fake.activate('submitSupportRequest'))

    expect(result.current.activity).toBe('activated')
  })
})

describe('WebmcpDeclarativeDemo', () => {
  it('keeps the form usable for people without an agent', async () => {
    const user = userEvent.setup()
    render(<WebmcpDeclarativeDemo accent="yellow" />)

    await user.type(
      screen.getByRole('textbox', { name: 'Full name' }),
      'Ada Lovelace',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Email' }),
      'ada@example.com',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Message' }),
      'I need help with billing.',
    )

    await user.click(screen.getByRole('button', { name: 'Submit request' }))

    expect(screen.getByText(/Submitted successfully/i)).toBeVisible()
    expect(
      screen.getByText(
        /Support request routed to the Billing team for Ada Lovelace/i,
      ),
    ).toBeVisible()
  })

  it('reads submitted field values even when they bypass React onChange', async () => {
    const { container } = render(<WebmcpDeclarativeDemo accent="yellow" />)

    // Simulate an agent-driven fill: the browser sets these DOM values
    // directly, the way the Declarative API does, without ever calling the
    // inputs' onChange. Component state for these fields stays empty.
    setValueWithoutReactEvent(
      screen.getByRole('textbox', { name: 'Full name' }) as HTMLInputElement,
      'Ada Lovelace',
    )
    setValueWithoutReactEvent(
      screen.getByRole('textbox', { name: 'Email' }) as HTMLInputElement,
      'ada@example.com',
    )
    setValueWithoutReactEvent(
      screen.getByRole('textbox', {
        name: 'Message',
      }) as HTMLTextAreaElement,
      'I need help with billing.',
    )

    const form = container.querySelector('form')
    if (!form) {
      throw new Error('Expected the support request form to be in the document.')
    }
    fireEvent.submit(form)

    expect(await screen.findByText(/Submitted successfully/i)).toBeVisible()
    expect(
      screen.getByText(
        /Support request routed to the Billing team for Ada Lovelace \(ada@example\.com\)/i,
      ),
    ).toBeVisible()
  })

  it('keeps agent-filled fields intact through the "activated" re-render', async () => {
    const { container } = render(<WebmcpDeclarativeDemo accent="yellow" />)

    // Simulate the real sequence: the browser fills the DOM directly, then
    // fires toolactivated. That event drives a state update inside
    // useWebmcpDeclarative, which re-renders this component. If the fields
    // were still React-controlled, that re-render would snap them back to
    // stale (empty) state and wipe the fill below.
    setValueWithoutReactEvent(
      screen.getByRole('textbox', { name: 'Full name' }) as HTMLInputElement,
      'Ada Lovelace',
    )
    setValueWithoutReactEvent(
      screen.getByRole('textbox', { name: 'Email' }) as HTMLInputElement,
      'ada@example.com',
    )
    setValueWithoutReactEvent(
      screen.getByRole('textbox', {
        name: 'Message',
      }) as HTMLTextAreaElement,
      'I need help with billing.',
    )

    const activation = new Event('toolactivated') as ToolEvent
    Object.defineProperty(activation, 'toolName', {
      value: 'submitSupportRequest',
    })
    act(() => {
      window.dispatchEvent(activation)
    })
    expect(await screen.findByText(/An agent activated/i)).toBeVisible()

    const form = container.querySelector('form')
    if (!form) {
      throw new Error('Expected the support request form to be in the document.')
    }
    fireEvent.submit(form)

    expect(await screen.findByText(/Submitted successfully/i)).toBeVisible()
    expect(
      screen.getByText(
        /Support request routed to the Billing team for Ada Lovelace \(ada@example\.com\)/i,
      ),
    ).toBeVisible()
  })

  it('shows a validation error instead of submitting empty fields', async () => {
    const user = userEvent.setup()
    render(<WebmcpDeclarativeDemo accent="yellow" />)

    await user.click(screen.getByRole('button', { name: 'Submit request' }))

    expect(
      screen.getByText(/Add a name, a valid email, and a short message/i),
    ).toBeVisible()
    expect(screen.queryByText(/Submitted successfully/i)).not.toBeInTheDocument()
  })

  it('defaults to the human-review flow, without toolautosubmit', () => {
    const { container } = render(<WebmcpDeclarativeDemo accent="yellow" />)
    const form = container.querySelector('form')

    expect(form).not.toHaveAttribute('toolautosubmit')
    expect(
      screen.getByRole('checkbox', { name: 'Enable toolautosubmit' }),
    ).not.toBeChecked()
  })

  it('sets toolautosubmit on the form when the checkbox is enabled', async () => {
    const user = userEvent.setup()
    const { container } = render(<WebmcpDeclarativeDemo accent="yellow" />)

    await user.click(
      screen.getByRole('checkbox', { name: 'Enable toolautosubmit' }),
    )

    const form = container.querySelector('form')
    expect(form).toHaveAttribute('toolautosubmit')
  })

  it('exposes the tool name, purpose, and typed parameters to the reader', () => {
    render(<WebmcpDeclarativeDemo accent="yellow" />)

    expect(screen.getByText('submitSupportRequest')).toBeVisible()
    expect(
      screen.getByText('Submit a customer support request to the right team.'),
    ).toBeVisible()
    expect(screen.getByText('fullName')).toBeVisible()
    expect(screen.getByText('details')).toBeVisible()
  })
})
