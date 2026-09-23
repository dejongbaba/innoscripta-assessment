import { describe, expect, it } from 'vitest'

import { toPersonalizedQuery } from '@/services/news/news-service'
import type { NewsPreferencesV1 } from '@/services/news/types'

describe('personalized provider query', () => {
  it('preserves grouped categories and provider-qualified authors', () => {
    const preferences: NewsPreferencesV1 = {
      version: 1,
      sources: [{ id: 'theguardian.com', name: 'The Guardian' }],
      categories: ['science', 'technology'],
      authors: [{ id: 'profile/ada', name: 'Ada', provider: 'guardian' }],
    }

    expect(toPersonalizedQuery(preferences)).toEqual({
      keyword: '',
      datePreset: '30d',
      categories: ['science', 'technology'],
      sources: ['guardian:theguardian.com', 'newsapi-ai:theguardian.com'],
      authors: preferences.authors,
    })
  })
})
