import { SlidersHorizontalIcon, XIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { ArticleEmpty } from '@/features/articles/ArticleEmpty'
import { ArticleGrid } from '@/features/articles/ArticleGrid'
import { ArticleSkeletons } from '@/features/articles/ArticleSkeleton'
import { ProviderStatusPanel } from '@/features/articles/ProviderStatusPanel'
import { useArticles } from '@/features/articles/use-articles'
import { FilterPanel } from '@/features/search/FilterPanel'
import { SearchBar } from '@/features/search/SearchBar'
import { parseArticleQuery, serializeArticleQuery } from '@/services/news/news-domain'
import type { ArticleQuery } from '@/services/news/types'

export function ArticlesPage() {
  const [params, setParams] = useSearchParams()
  const query = useMemo(() => parseArticleQuery(params), [params])
  const feed = useArticles(query)
  const setQuery = (next: ArticleQuery) => setParams(serializeArticleQuery(next), { replace: true })
  const activeCount = query.categories.length + query.sources.length + (query.datePreset !== 'any' ? 1 : 0)
  const isFiltered = Boolean(query.keyword || activeCount)

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Unified newsroom</p>
        <h1 className="mt-4 text-5xl font-medium tracking-[-0.065em] sm:text-7xl">All articles</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Search once, then compare reporting from every available provider.</p>
        <div className="mt-8"><SearchBar key={query.keyword} value={query.keyword} onSubmit={(keyword) => setQuery({ ...query, keyword })} /></div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block"><FilterPanel idPrefix="desktop-filters" query={query} sources={feed.sources} onChange={setQuery} /></aside>
        <div className="min-w-0">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Sheet>
                <SheetTrigger asChild><Button variant="outline" className="lg:hidden"><SlidersHorizontalIcon data-icon="inline-start" />Filters{activeCount ? ` (${activeCount})` : ''}</Button></SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  <SheetHeader><SheetTitle>Filter stories</SheetTitle><SheetDescription>Filters are reflected in the shareable URL.</SheetDescription></SheetHeader>
                  <div className="px-4 pb-6"><FilterPanel idPrefix="mobile-filters" query={query} sources={feed.sources} onChange={setQuery} /></div>
                </SheetContent>
              </Sheet>
              {query.categories.map((category) => <Button key={category} size="sm" variant="secondary" onClick={() => setQuery({ ...query, categories: query.categories.filter((value) => value !== category) })}>{category.replace('-', ' ')}<XIcon data-icon="inline-end" /></Button>)}
            </div>
            {isFiltered ? <Button variant="ghost" size="sm" onClick={() => setParams({})}>Clear all</Button> : null}
          </div>
          <ProviderStatusPanel statuses={feed.statuses} onRetry={feed.retryProvider} />
          <div className="mt-8">
            {feed.isLoading ? <ArticleSkeletons count={6} /> : feed.articles.length ? <ArticleGrid articles={feed.articles} /> : <ArticleEmpty filtered={isFiltered} />}
          </div>
          {feed.hasNextPage ? <div className="mt-12 flex justify-center"><Button variant="outline" size="lg" disabled={feed.isFetchingMore} onClick={() => void feed.fetchMore()}>{feed.isFetchingMore ? <><Spinner data-icon="inline-start" />Loading</> : 'Load more stories'}</Button></div> : null}
        </div>
      </div>
    </div>
  )
}
