export const proofreaderOptions = {
  expectedInputLanguages: ['en'],
} as const satisfies ProofreaderCreateCoreOptions

export type ProofreaderResult = ProofreadResult
export type ProofreaderSession = Pick<Proofreader, 'proofread' | 'destroy'>

export interface ProofreaderAdapter {
  availability(): Promise<Availability>
  create(
    onDownloadProgress: (progress: number) => void,
    signal?: AbortSignal,
  ): Promise<ProofreaderSession>
}

type ProofreaderFactory = Pick<typeof Proofreader, 'availability' | 'create'>

function browserProofreader(): ProofreaderFactory | undefined {
  return (
    globalThis as typeof globalThis & { Proofreader?: ProofreaderFactory }
  ).Proofreader
}

export const proofreaderApi: ProofreaderAdapter = {
  async availability() {
    const factory = browserProofreader()
    return factory
      ? factory.availability(proofreaderOptions)
      : 'unavailable'
  },

  async create(onDownloadProgress, signal) {
    const factory = browserProofreader()
    if (!factory) {
      throw new Error('The Proofreader API is not available in this browser.')
    }

    return factory.create({
      ...proofreaderOptions,
      signal,
      monitor(monitor) {
        monitor.addEventListener('downloadprogress', (event) => {
          onDownloadProgress(event.loaded)
        })
      },
    })
  },
}
