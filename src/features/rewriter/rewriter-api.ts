export type RewriteChange =
  | 'more-formal'
  | 'more-casual'
  | 'shorter'
  | 'longer'

export type RewriterSession = Pick<Rewriter, 'rewrite' | 'destroy'>

export interface RewriterAdapter {
  availability(change: RewriteChange): Promise<Availability>
  create(
    change: RewriteChange,
    onDownloadProgress: (progress: number) => void,
    signal?: AbortSignal,
  ): Promise<RewriterSession>
}

type RewriterFactory = Pick<typeof Rewriter, 'availability' | 'create'>

function browserRewriter(): RewriterFactory | undefined {
  return (globalThis as typeof globalThis & { Rewriter?: RewriterFactory })
    .Rewriter
}

export function rewriterOptions(
  change: RewriteChange,
): RewriterCreateCoreOptions {
  return {
    tone:
      change === 'more-formal' || change === 'more-casual' ? change : 'as-is',
    length: change === 'shorter' || change === 'longer' ? change : 'as-is',
    format: 'plain-text',
    expectedInputLanguages: ['en'],
    expectedContextLanguages: ['en'],
    outputLanguage: 'en',
  }
}

export const rewriterApi: RewriterAdapter = {
  async availability(change) {
    const factory = browserRewriter()
    return factory
      ? factory.availability(rewriterOptions(change))
      : 'unavailable'
  },

  async create(change, onDownloadProgress, signal) {
    const factory = browserRewriter()
    if (!factory) {
      throw new Error('The Rewriter API is not available in this browser.')
    }

    return factory.create({
      ...rewriterOptions(change),
      signal,
      monitor(monitor) {
        monitor.addEventListener('downloadprogress', (event) => {
          onDownloadProgress(event.loaded)
        })
      },
    })
  },
}
