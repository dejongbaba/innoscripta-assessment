import { AlertCircleIcon, CheckCircle2Icon, KeyRoundIcon, RefreshCwIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ProviderStatus } from '@/services/news/types'

const labels: Record<ProviderStatus['provider'], string> = { guardian: 'The Guardian', 'newsapi-ai': 'NewsAPI.ai', nyt: 'The New York Times' }

export function ProviderStatusPanel({ statuses, onRetry }: { statuses: ProviderStatus[]; onRetry: (id: string) => void }) {
  const unavailable = statuses.filter((status) => !['success', 'empty', 'loading'].includes(status.code))
  const configured = statuses.length - statuses.filter((status) => status.code === 'missing-key').length
  if (!unavailable.length) return null
  const noneConfigured = configured === 0
  return (
    <Alert className="rounded-2xl">
      {noneConfigured ? <KeyRoundIcon /> : <AlertCircleIcon />}
      <AlertTitle>{noneConfigured ? 'Connect your news providers' : 'Some sources are unavailable'}</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>{noneConfigured ? 'Add the three Vite API variables described in .env.example, then restart the development server.' : 'Available providers still appear below. Retry an individual source when it is ready.'}</p>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <div key={status.provider} className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 text-xs">
              {status.code === 'success' || status.code === 'empty' ? <CheckCircle2Icon className="text-muted-foreground" /> : null}
              <span>{labels[status.provider]}</span>
              <Badge variant={status.code === 'success' ? 'default' : 'secondary'}>{status.code.replace('-', ' ')}</Badge>
              {!['missing-key', 'success', 'empty', 'loading'].includes(status.code) ? <Button variant="ghost" size="icon-xs" onClick={() => onRetry(status.provider)} aria-label={`Retry ${labels[status.provider]}`}><RefreshCwIcon /></Button> : null}
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  )
}
