import { z } from 'zod'

import { normalizeCategories } from '@/services/news/categories'
import {
  asProviderError,
  assertResponse,
  dateBounds,
  ProviderRequestError,
  stripHtml,
} from '@/services/news/providers/provider-utils'
import type { Article, ArticleQuery, NewsProvider } from '@/services/news/types'

const newsApiArticleSchema = z.object({
  uri: z.union([z.string(), z.number()]).transform(String),
  title: z.string().min(1),
  url: z.url(),
  dateTimePub: z.string().optional(),
  dateTime: z.string().optional(),
  date: z.string().optional(),
  body: z.string().optional(),
  image: z.url().nullable().optional(),
  source: z.object({ uri: z.string(), title: z.string() }),
  authors: z.array(z.object({ uri: z.string().optional(), name: z.string() })).optional(),
  categories: z.array(z.object({ uri: z.string().optional(), label: z.string().optional() })).optional(),
})

const newsApiResponseSchema = z.object({
  articles: z.object({
    page: z.number().optional(),
    pages: z.number().optional(),
    totalResults: z.number().optional(),
    results: z.array(newsApiArticleSchema),
  }),
})

export type NewsApiResult = z.input<typeof newsApiArticleSchema>

export function mapNewsApiResult(input: NewsApiResult): Article {
  const result = newsApiArticleSchema.parse(input)
  const publishedAt = result.dateTimePub ?? result.dateTime ?? result.date
  if (!publishedAt || Number.isNaN(Date.parse(publishedAt))) {
    throw new ProviderRequestError('malformed-response', 'NewsAPI.ai article is missing a valid publication date.')
  }
  return {
    id: `newsapi-ai:${result.uri}`,
    provider: 'newsapi-ai',
    providerArticleId: result.uri,
    title: result.title,
    description: stripHtml(result.body)?.slice(0, 320) ?? null,
    url: result.url,
    imageUrl: result.image ?? null,
    publishedAt: new Date(publishedAt).toISOString(),
    publisher: { id: result.source.uri, name: result.source.title },
    authors: (result.authors ?? []).map((author) => ({
      id: author.uri ?? null,
      name: author.name,
      provider: 'newsapi-ai' as const,
    })),
    categories: normalizeCategories((result.categories ?? []).flatMap((category) => [category.uri, category.label])),
    readTimeMinutes: null,
  }
}

const categoryUri: Record<string, string> = {
  business: 'dmoz/Business', technology: 'dmoz/Computers', automotive: 'dmoz/Recreation/Autos',
  science: 'dmoz/Science', 'work-life': 'dmoz/Business/Employment', 'social-issues': 'dmoz/Society',
  'travel-culture': 'dmoz/Recreation/Travel', entertainment: 'dmoz/Arts', gaming: 'dmoz/Games',
  lifestyle: 'dmoz/Health', hobbies: 'dmoz/Recreation',
}

export function createNewsApiProvider(apiKey?: string): NewsProvider {
  return {
    id: 'newsapi-ai',
    name: 'NewsAPI.ai',
    isConfigured: Boolean(apiKey),
    capabilities: { keyword: true, date: true, category: true, source: true, author: true, pagination: true },
    async search(query: ArticleQuery, cursor, signal) {
      if (!apiKey) throw new ProviderRequestError('missing-key', 'Add VITE_NEWSAPI_AI_API_KEY to enable NewsAPI.ai.')
      const filters: Record<string, unknown>[] = []
      if (query.keyword) filters.push({ keyword: query.keyword })
      const bounds = dateBounds(query)
      if (bounds.from || bounds.to) filters.push({ ...(bounds.from ? { dateStart: bounds.from } : {}), ...(bounds.to ? { dateEnd: bounds.to } : {}) })
      const categories = query.categories.map((value) => categoryUri[value]).filter(Boolean)
      if (categories.length) filters.push({ categoryUri: { $or: categories } })
      const sources = query.sources.filter((value) => value.startsWith('newsapi-ai:')).map((value) => value.slice('newsapi-ai:'.length))
      if (query.sources.length && !sources.length) return { articles: [], nextCursor: null, warnings: ['NewsAPI.ai does not match the selected publisher.'] }
      if (sources.length) filters.push({ sourceUri: { $or: sources } })
      const authors = query.authors.filter((author) => author.provider === 'newsapi-ai' && author.id).map((author) => author.id)
      if (authors.length) filters.push({ authorUri: { $or: authors } })
      const body = {
        action: 'getArticles', resultType: 'articles', apiKey,
        articlesPage: Number(cursor ?? '1'), articlesCount: 12,
        articlesSortBy: 'date', articlesSortByAsc: false,
        includeArticleImage: true, includeArticleCategories: true,
        includeArticleAuthors: true, articlesArticleBodyLen: 320,
        dataType: ['news'],
        ...(filters.length ? { query: { $query: filters.length === 1 ? filters[0] : { $and: filters } } } : {}),
      }
      try {
        const response = await fetch('https://eventregistry.org/api/v1/article/getArticles', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal,
        })
        assertResponse(response, 'NewsAPI.ai')
        const parsed = newsApiResponseSchema.safeParse(await response.json())
        if (!parsed.success) throw new ProviderRequestError('malformed-response', 'NewsAPI.ai returned an unexpected response.')
        const page = parsed.data.articles
        const current = page.page ?? Number(cursor ?? '1')
        return {
          articles: page.results.map(mapNewsApiResult),
          nextCursor: page.pages && current < page.pages ? String(current + 1) : null,
          total: page.totalResults,
          warnings: [],
        }
      } catch (error) {
        throw asProviderError(error, 'NewsAPI.ai')
      }
    },
  }
}
