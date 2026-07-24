// Adapter for the WebMCP Declarative API. The declarative surface is mostly HTML
// attributes on a <form>, so the only imperative pieces to isolate are:
//   1. best-effort feature detection, and
//   2. the window-level "toolactivated" / "toolcancel" events an agent triggers.
// Keeping them here lets the hook and component stay free of direct globals and
// gives tests a seam to inject a fake adapter.

export interface ToolEventHandlers {
  onActivated: (toolName: string) => void
  onCancel: (toolName: string) => void
}

export interface WebmcpDeclarativeAdapter {
  isSupported: () => boolean
  // Subscribe to the agent-driven tool events. Returns an unsubscribe function.
  subscribeToolEvents: (handlers: ToolEventHandlers) => () => void
}

// There is no dedicated "is declarative WebMCP available" global. When the API
// is enabled, Chrome extends SubmitEvent with respondWith()/agentInvoked, so we
// probe for that. This is a heuristic: real availability also depends on the
// origin trial or the enable-webmcp-testing flag, origin isolation, and the
// `tools` permissions policy. The form works for people regardless, so a wrong
// guess here only affects the informational banner, never the human flow.
function isSupported(): boolean {
  if (typeof SubmitEvent === 'undefined') {
    return false
  }
  return 'respondWith' in SubmitEvent.prototype
}

function subscribeToolEvents(handlers: ToolEventHandlers): () => void {
  const handleActivated = (event: ToolEvent) => handlers.onActivated(event.toolName)
  const handleCancel = (event: ToolEvent) => handlers.onCancel(event.toolName)

  window.addEventListener('toolactivated', handleActivated)
  window.addEventListener('toolcancel', handleCancel)

  return () => {
    window.removeEventListener('toolactivated', handleActivated)
    window.removeEventListener('toolcancel', handleCancel)
  }
}

export const webmcpDeclarativeApi: WebmcpDeclarativeAdapter = {
  isSupported,
  subscribeToolEvents,
}
