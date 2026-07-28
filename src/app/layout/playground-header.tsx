// Shown above the playground only while the Chrome details are revealed, so the
// talk can open on a bare demo and add framing afterwards.
export function PlaygroundHeader() {
  return (
    <header className="border-b border-brand-blue/15 bg-brand-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <p className="text-brand-blue text-sm font-bold uppercase tracking-[0.2em]">
          Local-first playground
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
          Learn Chrome built-in AI one native API at a time.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
          Pick one API to explore its browser capability, model lifecycle,
          focused task, and local output. No backend or cloud fallback is
          involved.
        </p>
      </div>
    </header>
  )
}
