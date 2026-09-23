import { CategoryTile } from '@/features/categories/CategoryTile'
import { useArticles } from '@/features/articles/use-articles'
import { CATEGORIES } from '@/services/news/categories'
import { EMPTY_ARTICLE_QUERY } from '@/services/news/types'

export function CategoriesPage() {
  const feed = useArticles(EMPTY_ARTICLE_QUERY)
  const imageFor = (slug: (typeof CATEGORIES)[number]['slug']) => feed.articles.find((article) => article.categories.includes(slug) && article.imageUrl)?.imageUrl
  return (
    <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto mb-14 max-w-3xl text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Explore the desks</p><h1 className="mt-4 text-5xl font-medium tracking-[-0.065em] sm:text-7xl">All categories</h1><p className="mt-4 text-muted-foreground">One shared vocabulary keeps filtering predictable across three very different APIs.</p></div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{CATEGORIES.map((category) => <CategoryTile key={category.slug} {...category} imageUrl={imageFor(category.slug)} />)}</div>
    </div>
  )
}
