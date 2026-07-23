// Minimal local declarations for the WebMCP Declarative API (origin trial from
// Chrome 149). The installed DOM typings (`@types/dom-chromium-ai`) cover the
// built-in model APIs but not WebMCP, so we declare only the members this
// lesson touches. Verified against
// https://developer.chrome.com/docs/ai/webmcp/declarative-api on 2026-07-23.
export {}

declare global {
  interface SubmitEvent {
    // True when an AI agent (not a person) invoked the form as a WebMCP tool.
    readonly agentInvoked?: boolean
    // Hand the browser a promise whose resolved value is serialized back to the
    // agent as the tool's output. Requires calling preventDefault() first.
    respondWith?(result: Promise<unknown>): void
  }

  // Fired on window when an agent activates (pre-fills) or cancels a form tool.
  interface ToolEvent extends Event {
    readonly toolName: string
  }

  interface WindowEventMap {
    toolactivated: ToolEvent
    toolcancel: ToolEvent
  }
}

// The Declarative API is driven by HTML attributes on the form and its fields.
// React forwards these lowercase custom attributes to the DOM as-is; we add them
// to the shared attribute interface so JSX stays type-checked.
declare module 'react' {
  interface HTMLAttributes<T> {
    toolname?: string
    tooldescription?: string
    toolparamdescription?: string
    toolautosubmit?: string
  }
}
