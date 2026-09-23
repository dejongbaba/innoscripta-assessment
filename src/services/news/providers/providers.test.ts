import { describe, expect, it } from 'vitest'

import { mapGuardianResult } from '@/services/news/providers/guardian'
import { mapNewsApiResult } from '@/services/news/providers/newsapi-ai'
import { mapNytResult } from '@/services/news/providers/nyt'

describe('provider normalization', () => {
  it('normalizes Guardian fields and stable contributor identities', () => {
    const article = mapGuardianResult({
      id: 'technology/2026/sep/23/story',
      webTitle: 'Guardian story',
      webUrl: 'https://www.theguardian.com/technology/2026/sep/23/story',
      webPublicationDate: '2026-09-23T08:00:00Z',
      sectionId: 'technology',
      sectionName: 'Technology',
      fields: { trailText: '<p>A clear summary.</p>', thumbnail: 'https://media.guim.co.uk/image.jpg', wordcount: '850' },
      tags: [{ id: 'profile/jane-doe', webTitle: 'Jane Doe', type: 'contributor' }],
    })

    expect(article).toMatchObject({
      provider: 'guardian',
      title: 'Guardian story',
      description: 'A clear summary.',
      categories: ['technology'],
      authors: [{ id: 'profile/jane-doe', name: 'Jane Doe', provider: 'guardian' }],
    })
  })

  it('normalizes NewsAPI.ai source, author and category URIs', () => {
    const article = mapNewsApiResult({
      uri: '123',
      title: 'Registry story',
      url: 'https://publisher.example/story',
      dateTimePub: '2026-09-22T09:00:00Z',
      body: 'A sufficiently useful summary from the provider.',
      image: 'https://publisher.example/image.jpg',
      source: { uri: 'publisher.example', title: 'Publisher' },
      authors: [{ uri: 'author:42', name: 'Reporter One' }],
      categories: [{ uri: 'dmoz/Science', label: 'Science' }],
    })

    expect(article).toMatchObject({
      id: 'newsapi-ai:123',
      publisher: { id: 'publisher.example', name: 'Publisher' },
      authors: [{ id: 'author:42', provider: 'newsapi-ai' }],
      categories: ['science'],
    })
  })

  it('keeps NYT bylines displayable but non-selectable without stable IDs', () => {
    const article = mapNytResult({
      _id: 'nyt://article/one',
      web_url: 'https://www.nytimes.com/2026/09/21/story.html',
      abstract: 'An abstract.',
      pub_date: '2026-09-21T12:00:00Z',
      source: 'The New York Times',
      section_name: 'Science',
      headline: { main: 'NYT story' },
      byline: { original: 'By Ada Example', person: [{ firstname: 'Ada', lastname: 'Example' }] },
      multimedia: { default: { url: 'https://static01.nyt.com/image.jpg' } },
      word_count: 600,
    })

    expect(article).toMatchObject({
      provider: 'nyt',
      title: 'NYT story',
      authors: [{ id: null, name: 'Ada Example', provider: 'nyt' }],
      categories: ['science'],
    })
  })
})
