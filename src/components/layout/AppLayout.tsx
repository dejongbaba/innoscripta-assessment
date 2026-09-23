import { Outlet, ScrollRestoration } from 'react-router-dom'

import { Header } from '@/components/layout/Header'
import { Separator } from '@/components/ui/separator'

export function AppLayout() {
  return (
    <div className="min-h-svh bg-background">
      <Header />
      <main><Outlet /></main>
      <footer className="mx-auto mt-24 max-w-[1240px] px-5 pb-10 sm:px-8 lg:px-10">
        <Separator />
        <div className="flex flex-col gap-6 py-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <p className="text-2xl font-bold tracking-[-0.06em]">Press.hub</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">A calm, source-transparent way to search and shape the day’s reporting.</p>
          </div>
          <p className="text-xs text-muted-foreground">Guardian · NewsAPI.ai · The New York Times</p>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
