import { useState } from 'react'

// The exercise cards let a reader copy a sample input straight into a demo.
// `navigator.clipboard` needs a secure context and is missing when the docs are
// opened over plain HTTP or from a file, so this falls back to the old
// selection-and-copy trick rather than silently doing nothing.
async function writeToClipboard(value: string) {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard API unavailable')
    await navigator.clipboard.writeText(value)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.setAttribute('readonly', '')
    textarea.className = 'fixed -left-[9999px] top-0'
    document.body.append(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
}

// Tracks which field was copied so one card can show "Copied" on the right
// button, then return to "Copy" on its own.
export function useCopyToClipboard(resetAfterMs = 1800) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  async function copy(key: string, value: string) {
    await writeToClipboard(value)
    setCopiedKey(key)
    window.setTimeout(() => setCopiedKey(null), resetAfterMs)
  }

  return { copiedKey, copy }
}
