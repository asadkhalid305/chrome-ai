import { useRef, type KeyboardEvent } from 'react'

import type { Demo } from '../demo-registry'
import type { DemoId } from '../navigation'

// A WAI-ARIA tab list moves selection with the arrow keys rather than Tab, which
// means the component has to move focus itself. This hook owns the element refs
// that make that possible so the sidebar markup stays declarative.
export function useDemoTabList(
  demos: Demo[],
  onSelectDemo: (demoId: DemoId) => void,
) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  function registerTab(index: number) {
    return (element: HTMLButtonElement | null) => {
      tabRefs.current[index] = element
    }
  }

  function focusTab(index: number) {
    tabRefs.current[index]?.focus()
  }

  function focusDemoTab(demoId: DemoId) {
    focusTab(demos.findIndex((demo) => demo.id === demoId))
  }

  function selectTab(index: number) {
    onSelectDemo(demos[index].id)
    focusTab(index)
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (index + 1) % demos.length
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + demos.length) % demos.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = demos.length - 1
    }

    if (nextIndex !== null) {
      event.preventDefault()
      selectTab(nextIndex)
    }
  }

  return { registerTab, handleTabKeyDown, focusDemoTab }
}
