import { format, subDays } from 'date-fns'

import type { ArticleQuery, ProviderStatusCode } from '@/services/news/types'

export class ProviderRequestError extends Error {
  readonly code: ProviderStatusCode

  constructor(
    code: ProviderStatusCode,
    message: string,
  ) {
    super(message)
    this.code = code
    this.name = 'ProviderRequestError'
  }
}

export function stripHtml(value: string | null | undefined): string | null {
  if (!value) return null
  const text = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  return text || null
}

export function estimateReadTime(wordCount: number | string | null | undefined): number | null {
  const count = Number(wordCount)
  return Number.isFinite(count) && count > 0 ? Math.max(1, Math.ceil(count / 220)) : null
}

export function dateBounds(query: ArticleQuery): { from?: string; to?: string } {
  const today = new Date()
  if (query.datePreset === 'today') {
    const value = format(today, 'yyyy-MM-dd')
    return { from: value, to: value }
  }
  if (query.datePreset === '7d') return { from: format(subDays(today, 7), 'yyyy-MM-dd') }
  if (query.datePreset === '30d') return { from: format(subDays(today, 30), 'yyyy-MM-dd') }
  if (query.datePreset === 'custom') return { from: query.from, to: query.to }
  return {}
}

export function assertResponse(response: Response, providerName: string): void {
  if (response.ok) return
  if (response.status === 401 || response.status === 403) {
    throw new ProviderRequestError('unauthorized', `${providerName} rejected its API key.`)
  }
  if (response.status === 429) {
    throw new ProviderRequestError('rate-limited', `${providerName} rate limit reached.`)
  }
  throw new ProviderRequestError(
    'network-error',
    `${providerName} request failed with status ${response.status}.`,
  )
}

export function asProviderError(error: unknown, providerName: string): ProviderRequestError {
  if (error instanceof ProviderRequestError) return error
  if (error instanceof DOMException && error.name === 'AbortError') throw error
  return new ProviderRequestError(
    'network-error',
    error instanceof Error ? error.message : `${providerName} could not be reached.`,
  )
}
