import { format } from 'date-fns'
import { z } from 'zod'

import { normalizeCategories } from '@/services/news/categories'
import {
  asProviderError,
  assertResponse,
  dateBounds,
  estimateReadTime,
  ProviderRequestError,
  stripHtml,
} from '@/services/news/providers/provider-utils'
import type { Article, ArticleQuery, NewsProvider } from '@/services/news/types'

const nytResultSchema = z.object({
  _id: z.string(),
  web_url: z.url(),
  abstract: z.string().nullable().optional(),
  lead_paragraph: z.string().nullable().optional(),
  pub_date: z.iso.datetime(),
  source: z.string().min(1),
  section_name: z.string().nullable().optional(),
  news_desk: z.string().nullable().optional(),
  headline: z.object({ main: z.string().min(1) }),
  byline: z
    .object({
      original: z.string().nullable().optional(),
      person: z
        .array(z.object({ firstname: z.string().nullable().optional(), middlename: z.string().nullable().optional(), lastname: z.string().nullable().optional() }))
        .optional(),
    })
    .optional(),
  multimedia: z
    .union([
      z.object({ default: z.object({ url: z.url() }).optional() }),
      z.array(z.object({ url: z.string() })),
    ])
    .nullable()
    .optional(),
  word_count: z.number().nullable().optional(),
})

const nytResponseSchema = z.object({
  response: z.object({
    docs: z.array(nytResultSchema),
    meta: z.object({ hits: z.number(), offset: z.number() }),
  }),
})

export type NytResult = z.input<typeof nytResultSchema>

function nytImage(multimedia: z.output<typeof nytResultSchema>['multimedia']): string | null {
  if (!multimedia) return null
  if (Array.isArray(multimedia)) {
    const value = multimedia.find((item) => item.url)?.url
    if (!value) return null
    return value.startsWith('http') ? value : `https://www.nytimes.com/${value.replace(/^\//, '')}`
  }
  return multimedia.default?.url ?? null
}

export function mapNytResult(input: NytResult): Article {
  const result = nytResultSchema.parse(input)
  const people = result.byline?.person ?? []
  const authors = people
    .map((person) => [person.firstname, person.middlename, person.lastname].filter(Boolean).join(' '))
    .filter(Boolean)
    .map((name) => ({ id: null, name, provider: 'nyt' as const }))
  if (!authors.length && result.byline?.original) {
    authors.push({ id: null, name: result.byline.original.replace(/^By\s+/i, ''), provider: 'nyt' })
  }
  return {
    id: `nyt:${result._id}`,
    provider: 'nyt',
    providerArticleId: result._id,
    title: result.headline.main,
    description: stripHtml(result.abstract ?? result.lead_paragraph),
    url: result.web_url,
    imageUrl: nytImage(result.multimedia),
    publishedAt: new Date(result.pub_date).toISOString(),
    publisher: { id: result.source.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: result.source },
    authors,
    categories: normalizeCategories([result.section_name, result.news_desk]),
    readTimeMinutes: estimateReadTime(result.word_count),
  }
}

const escapeLucene = (value: string) => value.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, '\\$&')

export function createNytProvider(apiKey?: string): NewsProvider {
  return {
    id: 'nyt',
    name: 'The New York Times',
    isConfigured: Boolean(apiKey),
    capabilities: { keyword: true, date: true, category: true, source: true, author: false, pagination: true },
    async search(query: ArticleQuery, cursor, signal) {
      if (!apiKey) throw new ProviderRequestError('missing-key', 'Add VITE_NYT_API_KEY to enable The New York Times.')
      if (query.authors.length) throw new ProviderRequestError('unsupported-filter', 'NYT author identities are not stable enough for preference filtering.')
      const url = new URL('https://api.nytimes.com/svc/search/v2/articlesearch.json')
      url.searchParams.set('api-key', apiKey)
      url.searchParams.set('sort', 'newest')
      url.searchParams.set('page', cursor ?? '0')
      if (query.keyword) url.searchParams.set('q', query.keyword)
      const bounds = dateBounds(query)
      if (bounds.from) url.searchParams.set('begin_date', format(new Date(`${bounds.from}T00:00:00`), 'yyyyMMdd'))
      if (bounds.to) url.searchParams.set('end_date', format(new Date(`${bounds.to}T00:00:00`), 'yyyyMMdd'))
      const clauses: string[] = []
      if (query.categories.length) clauses.push(`section_name:(${query.categories.map((value) => `"${escapeLucene(value)}"`).join(' ')})`)
      const sources = query.sources.filter((value) => value.startsWith('nyt:')).map((value) => value.slice(4))
      if (query.sources.length && !sources.length) return { articles: [], nextCursor: null, warnings: ['NYT does not match the selected publisher.'] }
      if (sources.length) clauses.push(`source:(${sources.map((value) => `"${escapeLucene(value)}"`).join(' ')})`)
      if (clauses.length) url.searchParams.set('fq', clauses.join(' AND '))

      try {
        const response = await fetch(url, { signal })
        assertResponse(response, 'The New York Times')
        const parsed = nytResponseSchema.safeParse(await response.json())
        if (!parsed.success) throw new ProviderRequestError('malformed-response', 'The New York Times returned an unexpected response.')
        const data = parsed.data.response
        const current = Number(cursor ?? '0')
        return {
          articles: data.docs.map(mapNytResult),
          nextCursor: data.meta.offset + data.docs.length < Math.min(data.meta.hits, 1000) ? String(current + 1) : null,
          total: data.meta.hits,
          warnings: [],
        }
      } catch (error) {
        throw asProviderError(error, 'The New York Times')
      }
    },
  }
}
