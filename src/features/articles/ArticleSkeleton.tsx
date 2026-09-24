import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ArticleSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading articles">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="border-0 py-0 shadow-none ring-0">
          <Skeleton className="aspect-[4/3] rounded-2xl" />
          <CardHeader className="px-0 pt-5"><Skeleton className="h-3 w-32" /><Skeleton className="h-7 w-full" /><Skeleton className="h-7 w-3/4" /></CardHeader>
          <CardContent className="px-0"><Skeleton className="h-8 w-28" /></CardContent>
        </Card>
      ))}
    </div>
  )
}
