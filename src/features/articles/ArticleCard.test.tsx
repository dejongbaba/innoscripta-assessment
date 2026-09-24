import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ArticleCard } from '@/features/articles/ArticleCard'
import { ArticleSkeletons } from '@/features/articles/ArticleSkeleton'
import type { Article } from '@/services/news/types'

const article: Article = {
  id: 'guardian:test',
  provider: 'guardian',
  providerArticleId: 'test',
  title: 'A useful piece of reporting',
  description: 'The concise article summary.',
  url: 'https://example.com/report',
  imageUrl: null,
  publishedAt: '2026-09-23T08:00:00.000Z',
  publisher: { id: 'example.com', name: 'Example News' },
  authors: [{ id: 'profile/reporter', name: 'A Reporter', provider: 'guardian' }],
  categories: ['technology'],
  readTimeMinutes: 4,
}

describe('ArticleCard', () => {
  it('exposes article metadata and opens the publisher safely in a new tab', () => {
    render(<ArticleCard article={article} />)

    const link = screen.getByRole('link', { name: /open a useful piece of reporting/i })
    expect(link).toHaveAttribute('href', article.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText('Example News')).toBeInTheDocument()
    expect(screen.getAllByText('Technology')).toHaveLength(2)
    expect(screen.getByText(/4 min read/)).toBeInTheDocument()
  })

  it('falls back to the editorial placeholder when a remote image fails', () => {
    const { container } = render(<ArticleCard article={{ ...article, imageUrl: 'https://invalid.example/image.jpg' }} />)
    fireEvent.error(container.querySelector('img') as HTMLImageElement)
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('keeps the read-more control sized to its content', () => {
    render(<ArticleCard article={article} />)

    expect(screen.getByText('Read more').parentElement).toHaveClass('self-start', 'w-fit')
  })

  it('removes the card ring from loading skeletons', () => {
    const { container } = render(<ArticleSkeletons count={1} />)

    expect(container.querySelector('[data-slot="card"]')).toHaveClass('border-0', 'ring-0')
  })
})
