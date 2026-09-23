import { ExternalLinkIcon, ShieldCheckIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const providers = [
  { name: 'The Guardian', variable: 'VITE_GUARDIAN_API_KEY', detail: 'Search, dates, sections, contributors and pagination.' },
  { name: 'NewsAPI.ai', variable: 'VITE_NEWSAPI_AI_API_KEY', detail: 'Broad publisher, category and stable-author discovery.' },
  { name: 'The New York Times', variable: 'VITE_NYT_API_KEY', detail: 'Article Search with keyword, date and Lucene filters.' },
]

export function AboutPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-5 py-16 sm:px-8 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
      <h1 className="mt-4 max-w-4xl text-5xl font-medium leading-[0.96] tracking-[-0.065em] sm:text-7xl">A frontend-only window into three newsrooms</h1>
      <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground">Press.hub translates three different APIs into one transparent article model. Each provider keeps its own pagination and error state, so a problem in one newsroom never erases reporting from the others.</p>
      <div className="mt-14 grid gap-4 md:grid-cols-3">{providers.map((provider) => <Card key={provider.name}><CardHeader><Badge variant="secondary" className="w-fit">Provider</Badge><CardTitle>{provider.name}</CardTitle><CardDescription>{provider.variable}</CardDescription></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{provider.detail}</CardContent></Card>)}</div>
      <Alert className="mt-10 rounded-2xl"><ShieldCheckIcon /><AlertTitle>Browser-visible credentials</AlertTitle><AlertDescription>Vite variables are embedded in the production JavaScript bundle. They are configuration values, not secrets. Use only provider keys whose terms permit browser use, and apply provider-side restrictions where available.</AlertDescription></Alert>
      <div className="mt-14 grid gap-10 sm:grid-cols-2"><div><h2 className="text-2xl font-semibold tracking-[-0.04em]">No hidden proxy</h2><p className="mt-3 leading-7 text-muted-foreground">The browser communicates directly with configured providers. There is no backend, database, authentication service or CORS relay.</p></div><div><h2 className="text-2xl font-semibold tracking-[-0.04em]">Original reporting</h2><p className="mt-3 leading-7 text-muted-foreground">Every card names its publisher and opens the original article in a new tab. Press.hub never republishes full article bodies.</p><p className="mt-4 inline-flex items-center gap-2 text-sm font-medium">External links are clearly announced <ExternalLinkIcon /></p></div></div>
    </div>
  )
}
