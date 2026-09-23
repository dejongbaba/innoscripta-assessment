import { SearchIcon, XIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Field, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'

export function SearchBar({ value, onSubmit }: { value: string; onSubmit: (value: string) => void }) {
  const [draft, setDraft] = useState(value)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(draft.trim())
  }
  return (
    <form onSubmit={submit} role="search" className="w-full">
      <Field>
        <FieldLabel htmlFor="article-search" className="sr-only">Search articles</FieldLabel>
        <InputGroup className="h-12 rounded-xl bg-background">
          <InputGroupAddon><SearchIcon /></InputGroupAddon>
          <InputGroupInput id="article-search" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Search reporting across every source" autoComplete="off" />
          {draft ? <InputGroupAddon align="inline-end"><InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => { setDraft(''); onSubmit('') }}><XIcon /></InputGroupButton></InputGroupAddon> : null}
          <InputGroupAddon align="inline-end"><InputGroupButton type="submit" variant="default" size="sm">Search</InputGroupButton></InputGroupAddon>
        </InputGroup>
      </Field>
    </form>
  )
}
