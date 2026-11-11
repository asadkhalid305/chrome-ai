export const feedbackSchema = {
  type: 'object',
  properties: {
    sentiment: { type: 'string', enum: ['positive', 'negative', 'mixed'] },
    summary: { type: 'string' },
  },
  required: ['sentiment', 'summary'],
  additionalProperties: false,
} as const

// A constrained response is still untrusted: validate the parsed value before use.
export function parseFeedback(text: string) {
  const value: unknown = JSON.parse(text)
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Expected a feedback object.')
  }
  const record = value as Record<string, unknown>
  if (
    typeof record.sentiment !== 'string' ||
    !['positive', 'negative', 'mixed'].includes(record.sentiment) ||
    typeof record.summary !== 'string' ||
    !record.summary.trim() ||
    Object.keys(record).some((key) => key !== 'sentiment' && key !== 'summary')
  ) {
    throw new Error('The model response did not match the feedback schema.')
  }
  return { sentiment: record.sentiment, summary: record.summary }
}
