import { ArrowRightIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function SectionHeader({ title, description, actionHref, actionLabel = 'View all' }: { title: string; description?: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="max-w-4xl text-4xl font-medium tracking-[-0.055em] sm:text-5xl lg:text-6xl">{title}</h2>
        {description ? <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p> : null}
      </div>
      {actionHref ? <Button variant="outline" asChild><Link to={actionHref}>{actionLabel}<ArrowRightIcon data-icon="inline-end" /></Link></Button> : null}
    </div>
  )
}
