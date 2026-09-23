import { format } from 'date-fns'
import { ArrowRightIcon, ImageIcon } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Article } from '@/services/news/types'

function titleCase(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false)
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${article.title} on ${article.publisher.name} in a new tab`}
      className="group/card block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <Card className="overflow-hidden rounded-2xl border border-border/70 py-0 shadow-none">
        <div className={cn('relative overflow-hidden rounded-none bg-muted', featured ? 'aspect-[16/9]' : 'aspect-[4/3]')}>
          {article.imageUrl && !imageFailed ? (
            <img src={article.imageUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} className="size-full object-cover transition duration-500 ease-out group-hover/card:scale-[1.02] group-focus-visible/card:scale-[1.02]" />
          ) : (
            <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,var(--color-chart-1),transparent_45%),linear-gradient(135deg,var(--color-muted),var(--color-chart-3))] text-primary-foreground"><ImageIcon aria-hidden="true" className="size-8 opacity-80" /></div>
          )}
          <Badge variant="secondary" className="absolute left-3 top-3 overflow-hidden bg-background text-foreground">
            <span className="relative block h-4 overflow-hidden leading-4">
              <span className="block transition-transform duration-300 group-hover/card:-translate-y-full group-focus-visible/card:-translate-y-full">{titleCase(article.categories[0] ?? 'Other')}</span>
              <span aria-hidden="true" className="absolute left-0 top-full transition-transform duration-300 group-hover/card:-translate-y-full group-focus-visible/card:-translate-y-full">{titleCase(article.categories[0] ?? 'Other')}</span>
            </span>
          </Badge>
          <Badge className="absolute bottom-3 left-3 bg-primary/85 text-primary-foreground">{article.publisher.name}</Badge>
        </div>
        <CardHeader className="gap-3 px-0 pt-5">
          <p className="text-xs text-muted-foreground">
            {format(new Date(article.publishedAt), 'MMM d, yyyy')}
            {article.readTimeMinutes ? ` · ${article.readTimeMinutes} min read` : ''}
          </p>
          <CardTitle className={cn('leading-tight tracking-[-0.035em]', featured ? 'text-2xl sm:text-3xl' : 'text-xl')}>{article.title}</CardTitle>
        </CardHeader>
        {article.description ? <CardContent className="line-clamp-2 px-0 text-sm leading-6 text-muted-foreground">{article.description}</CardContent> : null}
        <CardFooter className="px-0 pb-0 pt-2">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium transition-colors group-hover/card:border-primary group-hover/card:bg-primary group-hover/card:text-primary-foreground group-focus-visible/card:border-primary group-focus-visible/card:bg-primary group-focus-visible/card:text-primary-foreground">
            Read more <ArrowRightIcon aria-hidden="true" className="transition-transform duration-300 group-hover/card:translate-x-0.5 group-focus-visible/card:translate-x-0.5" />
          </span>
        </CardFooter>
      </Card>
    </a>
  )
}
