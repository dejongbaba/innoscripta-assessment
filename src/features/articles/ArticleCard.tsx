import { format } from 'date-fns'
import { ArrowRightIcon, ImageIcon } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
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
      className="group/card block min-w-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
    >
      <div className="group/card-module min-w-0 bg-background">
        <div className={cn('relative overflow-hidden rounded-[15px] bg-muted', featured ? 'aspect-[16/9]' : 'aspect-[4/3]')}>
          {article.imageUrl && !imageFailed ? (
            <img
              src={article.imageUrl}
              alt=""
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="size-full object-cover transition-transform duration-250 ease-out group-hover/card:scale-[1.015] group-focus-visible/card:scale-[1.015]"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,var(--color-chart-1),transparent_45%),linear-gradient(135deg,var(--color-muted),var(--color-chart-3))] text-primary-foreground">
              <ImageIcon aria-hidden="true" className="size-8 opacity-80" />
            </div>
          )}
          <Badge variant="secondary" className="absolute left-3 top-3 rounded-[9px] bg-white px-2.5 py-1 text-[11px] font-medium text-black shadow-none">
            <span className="relative block h-4 overflow-hidden leading-4">
              <span className="block transition-transform duration-300 ease-out group-hover/card:-translate-y-full group-focus-visible/card:-translate-y-full">
                {titleCase(article.categories[0] ?? 'Other')}
              </span>
              <span aria-hidden="true" className="absolute left-0 top-full transition-transform duration-300 ease-out group-hover/card:-translate-y-full group-focus-visible/card:-translate-y-full">
                {titleCase(article.categories[0] ?? 'Other')}
              </span>
            </span>
          </Badge>
          <Badge className="absolute bottom-3 left-3 rounded-[9px] border-0 bg-black/75 px-2.5 py-1 text-[11px] font-medium text-white">
            {article.publisher.name}
          </Badge>
        </div>

        <div className="flex min-w-0 flex-col gap-3 px-2 pt-5 sm:px-2.5">
          <p className="flex min-h-5 items-center gap-1 whitespace-nowrap text-[13px] leading-5 text-muted-foreground">
            {format(new Date(article.publishedAt), 'MMM d, yyyy')}
            {article.readTimeMinutes ? <><span aria-hidden="true">•</span><span>{article.readTimeMinutes} min read</span></> : null}
          </p>
          <h3 className={cn('min-h-[2.4em] line-clamp-2 text-[18px] font-medium leading-[1.2] tracking-[-0.035em] text-foreground sm:text-[20px]', featured && 'sm:text-[22px]')}>
            {article.title}
          </h3>
          {article.description ? <p className="line-clamp-2 min-h-[3rem] text-sm leading-6 text-muted-foreground">{article.description}</p> : <span className="min-h-[3rem]" aria-hidden="true" />}
          <span className="inline-flex h-9 w-[106px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] border border-border bg-white px-2 text-[13px] font-medium text-foreground transition-colors duration-250 group-hover/card-module:border-[#0c0407] group-hover/card-module:bg-[#0c0407] group-hover/card-module:text-white group-focus-visible/card-module:border-[#0c0407] group-focus-visible/card-module:bg-[#0c0407] group-focus-visible/card-module:text-white">
            <span className="shrink-0 whitespace-nowrap">Read more</span>
            <span className="relative size-4 overflow-hidden" aria-hidden="true">
              <ArrowRightIcon className="absolute inset-0 size-4 transition-transform duration-250 ease-out group-hover/card-module:-translate-x-5 group-focus-visible/card-module:-translate-x-5" />
              <ArrowRightIcon className="absolute inset-0 size-4 translate-x-5 text-white transition-transform duration-250 ease-out group-hover/card-module:translate-x-0 group-focus-visible/card-module:translate-x-0" />
            </span>
          </span>
        </div>
      </div>
    </a>
  )
}
