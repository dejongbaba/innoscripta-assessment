import { afterEach, describe, expect, it, vi } from 'vitest'

import { createGuardianProvider, mapGuardianResult } from '@/services/news/providers/guardian'
import { createNewsApiProvider, mapNewsApiResult } from '@/services/news/providers/newsapi-ai'
import { createNytProvider, mapNytResult } from '@/services/news/providers/nyt'
import { EMPTY_ARTICLE_QUERY } from '@/services/news/types'

afterEach(() => vi.unstubAllGlobals())

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

describe('provider request translation', () => {
  it('translates Guardian keyword, date, category, contributor and page filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      response: { status: 'ok', total: 0, currentPage: 3, pages: 3, results: [] },
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await createGuardianProvider('key').search({
      ...EMPTY_ARTICLE_QUERY,
      keyword: 'clean energy', datePreset: 'custom', from: '2026-09-01', to: '2026-09-23',
      categories: ['science'], authors: [{ id: 'profile/ada', name: 'Ada', provider: 'guardian' }],
    }, '3')

    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.searchParams.get('q')).toBe('clean energy')
    expect(url.searchParams.get('from-date')).toBe('2026-09-01')
    expect(url.searchParams.get('section')).toBe('science')
    expect(url.searchParams.get('tag')).toBe('profile/ada')
    expect(url.searchParams.get('page')).toBe('3')
  })

  it('builds NewsAPI.ai AND groups with OR values inside preference groups', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      articles: { page: 2, pages: 2, totalResults: 0, results: [] },
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await createNewsApiProvider('key').search({
      ...EMPTY_ARTICLE_QUERY,
      keyword: 'markets', categories: ['business', 'technology'],
      sources: ['newsapi-ai:reuters.com', 'newsapi-ai:apnews.com'],
    }, '2')

    const init = fetchMock.mock.calls[0][1] as RequestInit
    const body = JSON.parse(String(init.body))
    expect(body.articlesPage).toBe(2)
    expect(body.query.$query.$and).toEqual(expect.arrayContaining([
      { keyword: 'markets' },
      { categoryUri: { $or: ['dmoz/Business', 'dmoz/Computers'] } },
      { sourceUri: { $or: ['reuters.com', 'apnews.com'] } },
    ]))
  })

  it('translates NYT filters and keeps its zero-based page cursor', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      response: { docs: [], meta: { hits: 0, offset: 20 } },
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await createNytProvider('key').search({
      ...EMPTY_ARTICLE_QUERY,
      keyword: 'space', datePreset: 'custom', from: '2026-09-01', to: '2026-09-23',
      categories: ['science'], sources: ['nyt:The New York Times'],
    }, '2')

    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('begin_date')).toBe('20260901')
    expect(url.searchParams.get('end_date')).toBe('20260923')
    expect(url.searchParams.get('fq')).toContain('section_name:("science")')
    expect(url.searchParams.get('fq')).toContain('source:("The New York Times")')
  })

  it('accepts the current NYT metadata response key and requests a valid NewsAPI.ai home query', async () => {
    const nytFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      response: { docs: [], metadata: { hits: 0, offset: 0 } },
    }), { status: 200 }))
    vi.stubGlobal('fetch', nytFetch)
    const nytPage = await createNytProvider('key').search(EMPTY_ARTICLE_QUERY, null)
    expect(nytPage.articles).toEqual([])

    const newsFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      articles: { page: 1, pages: 1, totalResults: 0, results: [] },
    }), { status: 200 }))
    vi.stubGlobal('fetch', newsFetch)
    await createNewsApiProvider('key').search(EMPTY_ARTICLE_QUERY, null)
    const body = JSON.parse(String((newsFetch.mock.calls[0][1] as RequestInit).body))
    expect(body.query.$query.dateStart).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('excludes providers that cannot satisfy a selected provider-qualified author', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const page = await createGuardianProvider('key').search({
      ...EMPTY_ARTICLE_QUERY,
      authors: [{ id: 'author:42', name: 'Reporter', provider: 'newsapi-ai' }],
    }, null)

    expect(page.articles).toEqual([])
    expect(page.warnings[0]).toMatch(/selected author/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
