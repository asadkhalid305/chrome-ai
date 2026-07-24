// Adapter for the WebMCP Imperative API. This is the only file that touches
// `document.modelContext`. Isolating it here keeps the hook and component free
// of direct globals and gives tests a seam to inject a fake adapter.

export interface WebmcpImperativeAdapter {
  // Best-effort feature detection. The lesson's human UI works regardless, so
  // a false result only drives an informational banner.
  isSupported: () => boolean
  // Register the tool for as long as `signal` is not aborted. The spec exposes
  // no explicit `unregisterTool()`; aborting the signal is the only way to
  // remove a tool once registered.
  registerTool: (spec: WebmcpToolSpec, signal: AbortSignal) => Promise<void>
}

function isSupported(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof document.modelContext?.registerTool === 'function'
  )
}

async function registerTool(
  spec: WebmcpToolSpec,
  signal: AbortSignal,
): Promise<void> {
  const modelContext = document.modelContext
  if (!modelContext?.registerTool) {
    // Thrown from the adapter boundary so the hook can catch and translate it
    // into a user-visible error state. The same message a real browser without
    // WebMCP would effectively produce (a missing global).
    throw new Error('This browser does not expose document.modelContext.')
  }
  await modelContext.registerTool(spec, { signal })
}

export const webmcpImperativeApi: WebmcpImperativeAdapter = {
  isSupported,
  registerTool,
}
