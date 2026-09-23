import { NewspaperIcon, SearchXIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function ArticleEmpty({ filtered = false }: { filtered?: boolean }) {
  return (
    <Empty className="rounded-2xl border py-20">
      <EmptyHeader>
        <EmptyMedia variant="icon">{filtered ? <SearchXIcon /> : <NewspaperIcon />}</EmptyMedia>
        <EmptyTitle>{filtered ? 'No stories match these filters' : 'No stories are available yet'}</EmptyTitle>
        <EmptyDescription>{filtered ? 'Try broadening the date range or removing a category or source.' : 'Configure at least one provider to begin retrieving live reporting.'}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{filtered ? <Button variant="outline" asChild><Link to="/articles">Clear filters</Link></Button> : <Button asChild><Link to="/about">View setup guidance</Link></Button>}</EmptyContent>
    </Empty>
  )
}
