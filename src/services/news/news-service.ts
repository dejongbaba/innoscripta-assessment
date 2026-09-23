import type { ArticleQuery, NewsPreferencesV1 } from '@/services/news/types'

export function toPersonalizedQuery(preferences: NewsPreferencesV1): ArticleQuery {
  const sources = preferences.sources.flatMap((source) => {
    const refs = [`newsapi-ai:${source.id}`]
    if (source.id === 'theguardian.com') refs.unshift('guardian:theguardian.com')
    if (/new york times/i.test(source.name)) refs.push(`nyt:${source.name}`)
    return refs
  })
  return {
    keyword: '',
    datePreset: '30d',
    categories: preferences.categories,
    sources: [...new Set(sources)],
    authors: preferences.authors,
  }
}
