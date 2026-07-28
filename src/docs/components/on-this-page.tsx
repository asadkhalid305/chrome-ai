// An in-page section index, rendered only at the xl breakpoint where there is
// room for a third column. These are buttons rather than links because they
// scroll within the current page and must not change the hash, which the app
// treats as its route.
export function OnThisPage({
  items,
}: {
  items: Array<{ id: string; label: string }>
}) {
  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          On this page
        </p>
        <nav aria-label="On this page" className="mt-3">
          <ul className="grid gap-2 text-sm">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  className="text-left text-slate-600 hover:text-brand-blue"
                  onClick={() => scrollToSection(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
