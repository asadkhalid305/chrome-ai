import { useEffect, useState } from 'react'

import { isDemoVisible, visibleDemoIds } from '../demo-registry'
import {
  parseAppRoute,
  playgroundHash,
  type AppRoute,
  type DemoId,
} from '../navigation'

// The location hash is the single source of truth for which surface is showing,
// so a refresh, a deep link, and the browser back button all restore the same
// view. There is no router dependency: one `hashchange` listener is the whole
// mechanism.
export function useHashRoute() {
  const [route, setRoute] = useState<AppRoute>(() =>
    parseAppRoute(window.location.hash, visibleDemoIds),
  )

  useEffect(() => {
    function syncRouteFromHash() {
      setRoute(parseAppRoute(window.location.hash, visibleDemoIds))
    }

    window.addEventListener('hashchange', syncRouteFromHash)
    return () => window.removeEventListener('hashchange', syncRouteFromHash)
  }, [])

  function navigateToDemo(demoId: DemoId) {
    if (!isDemoVisible(demoId)) return
    const hash = playgroundHash(demoId)
    // Assigning the hash it already has fires no `hashchange` event, so a repeat
    // navigation has to update state directly or the click does nothing.
    if (window.location.hash === hash) {
      setRoute({ surface: 'playground', demoId })
      return
    }
    window.location.hash = hash
  }

  return { route, navigateToDemo }
}
