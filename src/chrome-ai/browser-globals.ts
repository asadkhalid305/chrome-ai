// Two mechanical details that every built-in AI adapter repeats identically.
// The interesting part of an adapter -- which global it reads, which options it
// passes, and which method it calls -- deliberately stays written out in the
// adapter itself.

// Chrome exposes each built-in AI API as a global object that simply does not
// exist in other browsers, or in Chrome versions before the API shipped. Reading
// it off `globalThis` makes a missing API an ordinary `undefined` instead of a
// thrown ReferenceError, which is what lets `availability()` answer
// "unavailable" rather than crash.
export function readBrowserApi<TFactory>(
  globalName: string,
): TFactory | undefined {
  return (globalThis as Record<string, unknown>)[globalName] as
    | TFactory
    | undefined
}

// Chrome reports first-run model download progress on a monitor object handed to
// `create()`, not on the session it returns. Attaching the listener here is the
// only chance to observe the download, so every adapter needs it.
export function withDownloadMonitor<TOptions extends object>(
  options: TOptions,
  onDownloadProgress: (progress: number) => void,
) {
  return {
    ...options,
    monitor(monitor: CreateMonitor) {
      monitor.addEventListener('downloadprogress', (event) => {
        onDownloadProgress(event.loaded)
      })
    },
  }
}
