import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { deduplicateAndSortArticles } from '@/services/news/news-domain'
import { newsProviders } from '@/services/news/providers'
import { ProviderRequestError } from '@/services/news/providers/provider-utils'
import type {
  Article,
  ArticleQuery,
  AuthorRef,
  NewsProvider,
  ProviderStatus,
  PublisherRef,
} from '@/services/news/types'

function useProviderFeed(provider: NewsProvider, query: ArticleQuery) {
  return useInfiniteQuery({
    queryKey: ['articles', provider.id, query],
    queryFn: ({ pageParam, signal }) => provider.search(query, pageParam, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: provider.isConfigured,
    staleTime: 5 * 60 * 1000,
    retry: (count, error) => {
      if (error instanceof ProviderRequestError && ['unauthorized', 'missing-key', 'unsupported-filter'].includes(error.code)) return false
      return count < 1
    },
  })
}

function statusFor(provider: NewsProvider, result: ReturnType<typeof useProviderFeed>): ProviderStatus {
  if (!provider.isConfigured) {
    return { provider: provider.id, code: 'missing-key', message: `${provider.name} is not configured.` }
  }
  if (result.isPending) return { provider: provider.id, code: 'loading' }
  if (result.isError) {
    const error = result.error
    return {
      provider: provider.id,
      code: error instanceof ProviderRequestError ? error.code : 'network-error',
      message: error instanceof Error ? error.message : `${provider.name} could not be reached.`,
    }
  }
  const count = result.data?.pages.reduce((total, page) => total + page.articles.length, 0) ?? 0
  return { provider: provider.id, code: count ? 'success' : 'empty' }
}

export interface NewsFeedResult {
  articles: Article[]
  statuses: ProviderStatus[]
  sources: PublisherRef[]
  authors: AuthorRef[]
  warnings: string[]
  isLoading: boolean
  isFetchingMore: boolean
  hasNextPage: boolean
  fetchMore: () => Promise<void>
  retryProvider: (providerId: string) => void
}

export function useArticles(query: ArticleQuery): NewsFeedResult {
  const guardian = useProviderFeed(newsProviders[0], query)
  const newsApi = useProviderFeed(newsProviders[1], query)
  const nyt = useProviderFeed(newsProviders[2], query)
  const articles = deduplicateAndSortArticles(
    [guardian, newsApi, nyt].flatMap((result) =>
      result.data?.pages.flatMap((page) => page.articles) ?? [],
    ),
  )

  const sources = useMemo(() => {
    const values = new Map<string, PublisherRef>()
    for (const item of articles) values.set(item.publisher.id, item.publisher)
    return [...values.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [articles])

  const authors = useMemo(() => {
    const values = new Map<string, AuthorRef>()
    for (const item of articles) {
      for (const author of item.authors) {
        if (author.id) values.set(`${author.provider}:${author.id}`, author)
      }
    }
    return [...values.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [articles])

  const results = [guardian, newsApi, nyt]
  const warnings = results.flatMap((result) => result.data?.pages.flatMap((page) => page.warnings) ?? [])
  const hasNextPage = results.some((result) => result.hasNextPage)

  return {
    articles,
    statuses: newsProviders.map((provider, index) => statusFor(provider, results[index])),
    sources,
    authors,
    warnings: [...new Set(warnings)],
    isLoading: results.some((result) => result.isPending && result.fetchStatus === 'fetching'),
    isFetchingMore: results.some((result) => result.isFetchingNextPage),
    hasNextPage,
    fetchMore: async () => {
      await Promise.all(results.filter((result) => result.hasNextPage).map((result) => result.fetchNextPage()))
    },
    retryProvider: (providerId) => {
      const index = newsProviders.findIndex((provider) => provider.id === providerId)
      if (index >= 0) void results[index].refetch()
    },
  }
}
