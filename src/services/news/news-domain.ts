import { isValid, parseISO } from 'date-fns'

import {
  CATEGORY_SLUGS,
  EMPTY_ARTICLE_QUERY,
  type Article,
  type ArticleQuery,
  type CategorySlug,
  type DatePreset,
} from '@/services/news/types'

const TRACKING_PARAMETERS = new Set([
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'source',
])
const DATE_PRESETS = new Set<DatePreset>(['any', 'today', '7d', '30d', 'custom'])
const CATEGORY_SET = new Set<string>(CATEGORY_SLUGS)

const unique = <T,>(values: T[]) => [...new Set(values)]

function validDate(value: string | null): string | undefined {
  if (!value) return undefined
  return isValid(parseISO(value)) ? value.slice(0, 10) : undefined
}

export function canonicalizeArticleUrl(value: string): string | null {
  try {
    const url = new URL(value)
    url.hash = ''
    url.hostname = url.hostname.toLowerCase()
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith('utm_') || TRACKING_PARAMETERS.has(key.toLowerCase())) {
        url.searchParams.delete(key)
      }
    }
    url.searchParams.sort()
    url.pathname = url.pathname !== '/' ? url.pathname.replace(/\/+$/, '') : '/'
    return url.toString().replace(/\/$/, url.pathname === '/' ? '/' : '')
  } catch {
    return null
  }
}

export function deduplicateAndSortArticles(articles: Article[]): Article[] {
  const byUrl = new Map<string, Article>()
  for (const article of articles) {
    const key = canonicalizeArticleUrl(article.url)
    if (!key || byUrl.has(key)) continue
    byUrl.set(key, article)
  }
  return [...byUrl.values()].sort((left, right) => {
    const dateDelta = Date.parse(right.publishedAt) - Date.parse(left.publishedAt)
    return dateDelta || left.id.localeCompare(right.id)
  })
}

export function parseArticleQuery(params: URLSearchParams): ArticleQuery {
  const rawPreset = params.get('date') as DatePreset | null
  const datePreset = rawPreset && DATE_PRESETS.has(rawPreset) ? rawPreset : 'any'
  const categories = unique(
    params
      .getAll('category')
      .filter((value): value is CategorySlug => CATEGORY_SET.has(value)),
  )
  const from = validDate(params.get('from'))
  const to = validDate(params.get('to'))

  return {
    ...EMPTY_ARTICLE_QUERY,
    keyword: (params.get('q') ?? '').trim().slice(0, 200),
    datePreset,
    ...(datePreset === 'custom' && from ? { from } : {}),
    ...(datePreset === 'custom' && to ? { to } : {}),
    categories,
    sources: unique(params.getAll('source').filter(Boolean)),
  }
}

export function serializeArticleQuery(query: ArticleQuery): URLSearchParams {
  const params = new URLSearchParams()
  if (query.keyword) params.set('q', query.keyword)
  if (query.datePreset !== 'any') params.set('date', query.datePreset)
  if (query.datePreset === 'custom' && query.from) params.set('from', query.from)
  if (query.datePreset === 'custom' && query.to) params.set('to', query.to)
  for (const category of unique(query.categories)) params.append('category', category)
  for (const source of unique(query.sources)) params.append('source', source)
  return params
}
