import { ArticleCard } from '@/features/articles/ArticleCard'
import { cn } from '@/lib/utils'
import type { Article } from '@/services/news/types'

export function ArticleGrid({ articles, hero = false }: { articles: Article[]; hero?: boolean }) {
  if (hero) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_1.65fr_1fr] lg:items-start">
        {articles.slice(0, 3).map((article, index) => <ArticleCard key={article.id} article={article} featured={index === 1} />)}
      </div>
    )
  }
  return (
    <div className="grid gap-x-5 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => (
        <div key={article.id} className={cn(index % 6 === 0 || index % 6 === 5 ? 'lg:col-span-2' : '')}>
          <ArticleCard article={article} featured={index % 6 === 0 || index % 6 === 5} />
        </div>
      ))}
    </div>
  )
}
