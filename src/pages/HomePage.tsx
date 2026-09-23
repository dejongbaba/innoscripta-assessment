import { ArrowRightIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Reveal } from '@/components/layout/Reveal'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/button'
import { ArticleEmpty } from '@/features/articles/ArticleEmpty'
import { ArticleGrid } from '@/features/articles/ArticleGrid'
import { ArticleSkeletons } from '@/features/articles/ArticleSkeleton'
import { ProviderStatusPanel } from '@/features/articles/ProviderStatusPanel'
import { useArticles } from '@/features/articles/use-articles'
import { CategoryTile } from '@/features/categories/CategoryTile'
import { hasPreferences } from '@/features/preferences/preferences.storage'
import { usePreferences } from '@/features/preferences/use-preferences'
import { CATEGORIES } from '@/services/news/categories'
import { toPersonalizedQuery } from '@/services/news/news-service'
import { EMPTY_ARTICLE_QUERY } from '@/services/news/types'

function PersonalizedSection() {
  const { preferences } = usePreferences()
  const feed = useArticles(toPersonalizedQuery(preferences))
  if (!hasPreferences(preferences)) return null
  return (
    <Reveal className="mt-28">
      <SectionHeader title="For you" description="Sources, subjects and authors combined using your saved preferences." actionHref="/preferences" actionLabel="Edit preferences" />
      {feed.isLoading ? <ArticleSkeletons /> : feed.articles.length ? <ArticleGrid articles={feed.articles.slice(0, 6)} /> : <ArticleEmpty filtered />}
    </Reveal>
  )
}

export function HomePage() {
  const feed = useArticles(EMPTY_ARTICLE_QUERY)
  const categoryImages = new Map(feed.articles.flatMap((article) => article.categories.map((category) => [category, article.imageUrl] as const)).filter((entry): entry is [typeof entry[0], string] => Boolean(entry[1])))
  return (
    <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
      <Reveal className="pb-12 pt-16 text-center sm:pb-16 sm:pt-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Three providers. One considered feed.</p>
        <h1 className="mx-auto max-w-5xl text-5xl font-medium leading-[0.94] tracking-[-0.075em] sm:text-7xl lg:text-[5.6rem]">Explore the world’s latest news</h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground">Search independent news providers, understand where every story came from, and tune the mix to what matters to you.</p>
        <div className="mt-8 flex justify-center gap-3"><Button size="lg" asChild><Link to="/articles">Explore stories<ArrowRightIcon data-icon="inline-end" /></Link></Button><Button size="lg" variant="outline" asChild><Link to="/preferences">Personalize</Link></Button></div>
      </Reveal>

      <div className="mb-10"><ProviderStatusPanel statuses={feed.statuses} onRetry={feed.retryProvider} /></div>
      <Reveal>
        {feed.isLoading ? <ArticleSkeletons /> : feed.articles.length ? <ArticleGrid articles={feed.articles.slice(0, 3)} hero /> : <ArticleEmpty />}
      </Reveal>

      <Reveal className="mt-28">
        <SectionHeader title="Browse by category" description="A consistent taxonomy across providers with different editorial desks." actionHref="/categories" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => <CategoryTile key={category.slug} {...category} imageUrl={categoryImages.get(category.slug)} />)}
        </div>
      </Reveal>

      <PersonalizedSection />

      {feed.articles.length ? (
        <Reveal className="mt-28">
          <SectionHeader title="Fresh off the press" description="The newest normalized stories from every available provider." actionHref="/articles" />
          <ArticleGrid articles={feed.articles.slice(3, 9)} />
        </Reveal>
      ) : null}
    </div>
  )
}
