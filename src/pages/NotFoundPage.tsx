import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

export function NotFoundPage() {
  return <div className="mx-auto max-w-3xl px-5 py-24"><Empty><EmptyHeader><EmptyTitle>That page missed the edition</EmptyTitle><EmptyDescription>The address may have changed or never existed.</EmptyDescription></EmptyHeader><EmptyContent><Button asChild><Link to="/">Return home</Link></Button></EmptyContent></Empty></div>
}
