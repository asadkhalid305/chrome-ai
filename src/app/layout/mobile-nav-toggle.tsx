// On narrow screens the sidebar collapses behind this bar, which also names the
// current selection so the user knows where they are without opening the menu.
export function MobileNavToggle({
  isOpen,
  onToggle,
  selectionLabel,
  surfaceLabel,
}: {
  isOpen: boolean
  onToggle: () => void
  selectionLabel: string
  surfaceLabel: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 md:hidden">
      <div className="min-w-0">
        <p className="text-brand-blue text-xs font-black uppercase tracking-[0.16em]">
          {surfaceLabel}
        </p>
        <p className="truncate text-sm font-bold text-slate-900">
          {selectionLabel}
        </p>
      </div>
      <button
        aria-controls="primary-navigation-items"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-brand-blue/30 bg-white px-3 py-2 text-sm font-bold text-brand-blue shadow-sm hover:bg-brand-blue/5"
        onClick={onToggle}
        type="button"
      >
        <span>{isOpen ? 'Close' : 'Menu'}</span>
        <span aria-hidden="true" className="text-lg leading-none">
          {isOpen ? '×' : '☰'}
        </span>
      </button>
    </div>
  )
}
