import { beforeEach, describe, expect, it } from 'vitest'

import {
  loadPreferences,
  matchesPreferences,
  savePreferences,
} from '@/features/preferences/preferences.storage'
import type { Article, NewsPreferencesV1 } from '@/services/news/types'

const preferences: NewsPreferencesV1 = {
  version: 1,
  sources: [{ id: 'publisher.example', name: 'Publisher' }],
  categories: ['technology', 'science'],
  authors: [{ id: 'author:1', name: 'Ada Reporter', provider: 'newsapi-ai' }],
}

const article: Article = {
  id: 'newsapi-ai:1', provider: 'newsapi-ai', providerArticleId: '1',
  title: 'Story', description: null, url: 'https://publisher.example/story', imageUrl: null,
  publishedAt: '2026-09-23T08:00:00.000Z',
  publisher: { id: 'publisher.example', name: 'Publisher' },
  authors: [{ id: 'author:1', name: 'Ada Reporter', provider: 'newsapi-ai' }],
  categories: ['science'], readTimeMinutes: null,
}

describe('preferences', () => {
  beforeEach(() => localStorage.clear())

  it('persists and validates versioned preferences', () => {
    savePreferences(preferences)
    expect(loadPreferences()).toEqual(preferences)
    localStorage.setItem('presshub.preferences.v1', '{"version":2}')
    expect(loadPreferences()).toEqual({ version: 1, sources: [], categories: [], authors: [] })
  })

  it('uses OR within groups and AND across non-empty groups', () => {
    expect(matchesPreferences(article, preferences)).toBe(true)
    expect(
      matchesPreferences(article, {
        ...preferences,
        categories: ['business', 'science'],
      }),
    ).toBe(true)
    expect(
      matchesPreferences(article, {
        ...preferences,
        authors: [{ id: 'author:2', name: 'Another', provider: 'newsapi-ai' }],
      }),
    ).toBe(false)
  })
})
