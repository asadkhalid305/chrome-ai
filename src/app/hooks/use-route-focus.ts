import { useEffect, useRef } from 'react'

import type { AppRoute } from '../navigation'

// Changing route swaps the whole main panel, which leaves a keyboard user with
// no focus and a scroll position from the previous page. This restores both:
// documentation takes focus on the region itself, and coming back to the
// playground returns focus to the tab that opened it.
export function useRouteFocus(
  route: AppRoute,
  restoreFocusToSelectedTab: () => void,
) {
  const mainRef = useRef<HTMLElement | null>(null)
  const previousSurfaceRef = useRef(route.surface)

  // Every `hashchange` parses a fresh route object, so depending on the route
  // itself would re-run this on navigations that did not change anything. The
  // key changes only when the visible page changes.
  const routeKey =
    route.surface === 'playground'
      ? `playground-${route.demoId}`
      : `docs-${route.sectionId}`

  useEffect(() => {
    if (!mainRef.current) return
    mainRef.current.scrollTop = 0

    if (route.surface === 'docs') {
      mainRef.current.focus()
    } else if (previousSurfaceRef.current === 'docs') {
      restoreFocusToSelectedTab()
    }

    previousSurfaceRef.current = route.surface
  }, [routeKey])

  return mainRef
}
