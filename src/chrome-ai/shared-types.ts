export type CapabilityState =
  | 'checking'
  | 'unavailable'
  | 'downloadable'
  | 'downloading'
  | 'ready'
  | 'error'

export type RequestState =
  | 'idle'
  | 'running'
  | 'canceled'
  | 'success'
  | 'error'

export interface LessonState {
  capability: CapabilityState
  request: RequestState
  downloadProgress: number | null
  error: string | null
}

export function toCapabilityState(availability: Availability): CapabilityState {
  if (availability === 'available') {
    return 'ready'
  }

  return availability
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something unexpected happened.'
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
