// Read once at module load rather than per render, so the tab list and the
// route parser can never disagree about which demos exist. The test suites rely
// on this: they call `vi.resetModules()` and re-import the app to flip a flag.

// The talk reveals Chrome version numbers and flag names progressively. With
// this off, the marketing header and the per-demo availability block stay
// hidden so the audience sees the API before the prerequisites.
export const revealChromeByDefault =
  import.meta.env.VITE_REVEAL_CHROME !== 'false'

// WebMCP is a separate origin-trial track. Turning it off hides the whole
// track, including its documentation deep links.
export const webmcpTrackEnabled = import.meta.env.VITE_WEBMCP !== 'false'
