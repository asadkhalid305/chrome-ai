// A visual divider between sidebar groups. It is hidden from assistive
// technology because each group's items already carry their own accessible
// names, and announcing a decorative rule would only add noise.
export function NavGroupLabel({
  label,
  variant = 'group',
}: {
  label: string
  variant?: 'group' | 'subgroup'
}) {
  return (
    <div
      aria-hidden="true"
      className="first:mt-0 mt-3 mb-1 flex items-center gap-2 px-1"
      role="presentation"
    >
      <span className="h-px flex-1 bg-slate-200" />
      <span
        className={
          variant === 'subgroup'
            ? 'text-brand-blue text-[10px] font-semibold uppercase tracking-[0.12em]'
            : 'text-brand-blue text-xs font-bold uppercase tracking-[0.18em]'
        }
      >
        {label}
      </span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  )
}
