// Minimal local declarations for the WebMCP Imperative API (origin trial from
// Chrome 149). The installed DOM typings (`@types/dom-chromium-ai`) cover the
// built-in model APIs but not WebMCP, so we declare only the members this
// lesson touches. Reviewed against the official Imperative API on 2026-11-10.
export {}

declare global {
  interface WebmcpToolAnnotations {
    // Hints the browser can surface to the agent about the tool's behavior.
    // `readOnlyHint` is false when the tool mutates observable state.
    // `untrustedContentHint` is true when the tool returns content that came
    // from an outside source (e.g. a fetched web page).
    consequentialHint?: boolean
    readOnlyHint?: boolean
    untrustedContentHint?: boolean
  }

  // A JSON Schema object describing the tool's input. Kept intentionally loose:
  // JSON Schema is authored by hand in the lesson code, so a tight TypeScript
  // shape here would fight the reader rather than help them.
  interface WebmcpInputSchema {
    type: 'object'
    properties?: Record<string, unknown>
    required?: readonly string[]
    additionalProperties?: boolean
  }

  interface WebmcpToolSpec {
    name: string
    description: string
    inputSchema: WebmcpInputSchema
    // The browser parses the agent's arguments and calls `execute` with the
    // parsed object. The returned value is serialized back to the agent as the
    // tool result. Typed as `unknown` because the agent's input crosses a trust
    // boundary — the lesson code must validate it before use.
    execute: (input: unknown, signal: AbortSignal) => Promise<unknown> | unknown
    annotations?: WebmcpToolAnnotations
  }

  interface WebmcpRegisterToolOptions {
    // Cross-origin exposure is explicit and belongs to registration options.
    exposedTo?: readonly string[]
    // Aborting the signal unregisters the tool.
    signal?: AbortSignal
  }

  interface WebmcpModelContext {
    registerTool(
      spec: WebmcpToolSpec,
      options?: WebmcpRegisterToolOptions,
    ): Promise<void>
  }

  interface Document {
    // Present only when the browser exposes the Imperative API (origin trial or
    // the `enable-webmcp-testing` flag). Optional so a plain browser check can
    // just probe `document.modelContext?.registerTool`.
    readonly modelContext?: WebmcpModelContext
  }
}
