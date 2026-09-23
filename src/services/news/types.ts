export const CATEGORY_SLUGS = [
  'business',
  'technology',
  'automotive',
  'science',
  'work-life',
  'social-issues',
  'travel-culture',
  'entertainment',
  'gaming',
  'lifestyle',
  'hobbies',
  'other',
] as const

export type CategorySlug = (typeof CATEGORY_SLUGS)[number]
export type NewsProviderId = 'guardian' | 'newsapi-ai' | 'nyt'
export type DatePreset = 'any' | 'today' | '7d' | '30d' | 'custom'

export interface PublisherRef {
  id: string
  name: string
}

export interface AuthorRef {
  id: string | null
  name: string
  provider: NewsProviderId
}

export interface Article {
  id: string
  provider: NewsProviderId
  providerArticleId: string
  title: string
  description: string | null
  url: string
  imageUrl: string | null
  publishedAt: string
  publisher: PublisherRef
  authors: AuthorRef[]
  categories: CategorySlug[]
  readTimeMinutes: number | null
}

export interface ArticleQuery {
  keyword: string
  datePreset: DatePreset
  from?: string
  to?: string
  categories: CategorySlug[]
  sources: string[]
  authors: AuthorRef[]
}

export interface ProviderCapabilities {
  keyword: boolean
  date: boolean
  category: boolean
  source: boolean
  author: boolean
  pagination: boolean
}

export type ProviderStatusCode =
  | 'idle'
  | 'missing-key'
  | 'loading'
  | 'success'
  | 'empty'
  | 'unauthorized'
  | 'rate-limited'
  | 'network-error'
  | 'malformed-response'
  | 'unsupported-filter'

export interface ProviderStatus {
  provider: NewsProviderId
  code: ProviderStatusCode
  message?: string
}

export interface ProviderPage {
  articles: Article[]
  nextCursor: string | null
  total?: number
  warnings: string[]
}

export interface NewsPreferencesV1 {
  version: 1
  sources: PublisherRef[]
  categories: CategorySlug[]
  authors: AuthorRef[]
}

export const EMPTY_PREFERENCES: NewsPreferencesV1 = {
  version: 1,
  sources: [],
  categories: [],
  authors: [],
}

export interface NewsProvider {
  id: NewsProviderId
  name: string
  capabilities: ProviderCapabilities
  isConfigured: boolean
  search: (
    query: ArticleQuery,
    cursor: string | null,
    signal?: AbortSignal,
  ) => Promise<ProviderPage>
}

export const EMPTY_ARTICLE_QUERY: ArticleQuery = {
  keyword: '',
  datePreset: 'any',
  categories: [],
  sources: [],
  authors: [],
}
