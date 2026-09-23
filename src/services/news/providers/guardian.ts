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

const guardianResultSchema = z.object({
  id: z.string().min(1),
  webTitle: z.string().min(1),
  webUrl: z.url(),
  webPublicationDate: z.iso.datetime(),
  sectionId: z.string().optional(),
  sectionName: z.string().optional(),
  fields: z
    .object({
      trailText: z.string().optional(),
      thumbnail: z.url().optional(),
      wordcount: z.union([z.string(), z.number()]).optional(),
    })
    .optional(),
  tags: z
    .array(
      z.object({
        id: z.string(),
        webTitle: z.string(),
        type: z.string().optional(),
      }),
    )
    .optional(),
})

const guardianResponseSchema = z.object({
  response: z.object({
    status: z.literal('ok'),
    total: z.number(),
    currentPage: z.number(),
    pages: z.number(),
    results: z.array(guardianResultSchema),
  }),
})

export type GuardianResult = z.input<typeof guardianResultSchema>

export function mapGuardianResult(input: GuardianResult): Article {
  const result = guardianResultSchema.parse(input)
  return {
    id: `guardian:${result.id}`,
    provider: 'guardian',
    providerArticleId: result.id,
    title: result.webTitle,
    description: stripHtml(result.fields?.trailText),
    url: result.webUrl,
    imageUrl: result.fields?.thumbnail ?? null,
    publishedAt: new Date(result.webPublicationDate).toISOString(),
    publisher: { id: 'theguardian.com', name: 'The Guardian' },
    authors: (result.tags ?? [])
      .filter((tag) => tag.type === 'contributor' || tag.id.startsWith('profile/'))
      .map((tag) => ({ id: tag.id, name: tag.webTitle, provider: 'guardian' as const })),
    categories: normalizeCategories([result.sectionId, result.sectionName]),
    readTimeMinutes: estimateReadTime(result.fields?.wordcount),
  }
}

const sectionByCategory: Record<string, string> = {
  business: 'business', technology: 'technology', automotive: 'technology', science: 'science',
  'work-life': 'business', 'social-issues': 'society', 'travel-culture': 'travel',
  entertainment: 'culture', gaming: 'games', lifestyle: 'lifeandstyle', hobbies: 'lifeandstyle',
}

export function createGuardianProvider(apiKey?: string): NewsProvider {
  return {
    id: 'guardian',
    name: 'The Guardian',
    isConfigured: Boolean(apiKey),
    capabilities: { keyword: true, date: true, category: true, source: false, author: true, pagination: true },
    async search(query: ArticleQuery, cursor, signal) {
      if (!apiKey) throw new ProviderRequestError('missing-key', 'Add VITE_GUARDIAN_API_KEY to enable The Guardian.')
      if (query.sources.length && !query.sources.includes('guardian:theguardian.com')) {
        return { articles: [], nextCursor: null, warnings: ['The Guardian does not match the selected publisher.'] }
      }
      if (query.authors.length && !query.authors.some((author) => author.provider === 'guardian' && author.id)) {
        return { articles: [], nextCursor: null, warnings: ['The Guardian does not match the selected author.'] }
      }
      const url = new URL('https://content.guardianapis.com/search')
      url.searchParams.set('api-key', apiKey)
      url.searchParams.set('page-size', '12')
      url.searchParams.set('page', cursor ?? '1')
      url.searchParams.set('order-by', 'newest')
      url.searchParams.set('show-fields', 'trailText,thumbnail,wordcount')
      url.searchParams.set('show-tags', 'contributor')
      if (query.keyword) url.searchParams.set('q', query.keyword)
      const bounds = dateBounds(query)
      if (bounds.from) url.searchParams.set('from-date', bounds.from)
      if (bounds.to) url.searchParams.set('to-date', bounds.to)
      const sections = query.categories.map((category) => sectionByCategory[category]).filter(Boolean)
      if (sections.length) url.searchParams.set('section', [...new Set(sections)].join('|'))
      const guardianAuthors = query.authors.filter((author) => author.provider === 'guardian' && author.id)
      if (guardianAuthors.length) url.searchParams.set('tag', guardianAuthors.map((author) => author.id).join('|'))

      try {
        const response = await fetch(url, { signal })
        assertResponse(response, 'The Guardian')
        const parsed = guardianResponseSchema.safeParse(await response.json())
        if (!parsed.success) throw new ProviderRequestError('malformed-response', 'The Guardian returned an unexpected response.')
        const page = parsed.data.response
        return {
          articles: page.results.map(mapGuardianResult),
          nextCursor: page.currentPage < page.pages ? String(page.currentPage + 1) : null,
          total: page.total,
          warnings: [],
        }
      } catch (error) {
        throw asProviderError(error, 'The Guardian')
      }
    },
  }
}
