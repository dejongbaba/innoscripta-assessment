import { describe, expect, it } from 'vitest'

import {
  canonicalizeArticleUrl,
  deduplicateAndSortArticles,
  parseArticleQuery,
  serializeArticleQuery,
} from '@/services/news/news-domain'
import type { Article } from '@/services/news/types'

const article = (overrides: Partial<Article>): Article => ({
  id: 'guardian:one',
  provider: 'guardian',
  providerArticleId: 'one',
  title: 'A useful story',
  description: null,
  url: 'https://example.com/story',
  imageUrl: null,
  publishedAt: '2026-09-22T10:00:00.000Z',
  publisher: { id: 'example.com', name: 'Example' },
  authors: [],
  categories: ['technology'],
  readTimeMinutes: null,
  ...overrides,
})

describe('news domain', () => {
  it('canonicalizes tracking variants without dropping meaningful parameters', () => {
    expect(
      canonicalizeArticleUrl(
        'HTTPS://Example.COM/story/?utm_source=newsletter&edition=uk#comments',
      ),
    ).toBe('https://example.com/story?edition=uk')
  })

  it('deduplicates by canonical URL and sorts newest first', () => {
    const result = deduplicateAndSortArticles([
      article({ id: 'a', url: 'https://example.com/story?utm_source=x' }),
      article({ id: 'b', url: 'https://example.com/story/' }),
      article({
        id: 'c',
        url: 'https://example.com/new',
        publishedAt: '2026-09-23T10:00:00.000Z',
      }),
    ])

    expect(result.map(({ id }) => id)).toEqual(['c', 'a'])
  })

  it('round-trips repeated category and source URL parameters', () => {
    const query = parseArticleQuery(
      new URLSearchParams(
        'q=climate&date=custom&from=2026-09-01&to=2026-09-23&category=science&category=technology&source=nyt%3Anytimes',
      ),
    )

    expect(query).toMatchObject({
      keyword: 'climate',
      datePreset: 'custom',
      categories: ['science', 'technology'],
      sources: ['nyt:nytimes'],
    })
    expect(serializeArticleQuery(query).getAll('category')).toEqual([
      'science',
      'technology',
    ])
  })
})
