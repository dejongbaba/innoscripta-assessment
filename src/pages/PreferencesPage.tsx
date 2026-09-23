import { RotateCcwIcon, SaveIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useArticles } from '@/features/articles/use-articles'
import { usePreferences } from '@/features/preferences/use-preferences'
import { CATEGORIES } from '@/services/news/categories'
import { EMPTY_ARTICLE_QUERY, type AuthorRef, type NewsPreferencesV1, type PublisherRef } from '@/services/news/types'

function mergeById<T extends { id: string | null }>(current: T[], available: T[], key: (value: T) => string) {
  const values = new Map<string, T>()
  for (const item of [...current, ...available]) if (item.id) values.set(key(item), item)
  return [...values.values()]
}

export function PreferencesPage() {
  const { preferences, update, reset } = usePreferences()
  const feed = useArticles({ ...EMPTY_ARTICLE_QUERY, datePreset: '30d' })
  const [draft, setDraft] = useState<NewsPreferencesV1>(preferences)
  const sources = useMemo(() => mergeById<PublisherRef>(preferences.sources, feed.sources, (source) => source.id), [preferences.sources, feed.sources])
  const authors = useMemo(() => mergeById<AuthorRef>(preferences.authors, feed.authors, (author) => `${author.provider}:${author.id}`), [preferences.authors, feed.authors])
  const toggle = <T extends string>(values: T[], value: T, checked: boolean) => checked ? [...new Set([...values, value])] : values.filter((item) => item !== value)

  const save = () => {
    update(draft)
    toast.success('Your news feed preferences were saved.')
  }
  const clear = () => {
    reset()
    setDraft({ version: 1, sources: [], categories: [], authors: [] })
    toast('Preferences reset.')
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Make it yours</p><h1 className="mt-4 text-5xl font-medium tracking-[-0.065em] sm:text-7xl">Your news mix</h1><p className="mt-5 max-w-2xl leading-7 text-muted-foreground">Selections within a group match any choice. When you use several groups, a story must match at least one choice in every group.</p></div>
      <Alert className="mt-10 rounded-2xl"><AlertTitle>About authors</AlertTitle><AlertDescription>Only authors with stable provider-issued identifiers can be selected. NYT bylines remain visible on stories but are not merged by name or offered as preference identities.</AlertDescription></Alert>
      <Tabs defaultValue="categories" className="mt-10">
        <TabsList><TabsTrigger value="categories">Categories</TabsTrigger><TabsTrigger value="sources">Sources</TabsTrigger><TabsTrigger value="authors">Authors</TabsTrigger></TabsList>
        <TabsContent value="categories" className="mt-8">
          <FieldSet><FieldLegend>Preferred categories</FieldLegend><FieldDescription>Choose any subjects you want included.</FieldDescription><FieldGroup className="grid gap-3 sm:grid-cols-2">{CATEGORIES.map((category) => <Field key={category.slug} orientation="horizontal"><Checkbox id={`pref-${category.slug}`} checked={draft.categories.includes(category.slug)} onCheckedChange={(value) => setDraft({ ...draft, categories: toggle(draft.categories, category.slug, value === true) })} /><FieldContent><FieldLabel htmlFor={`pref-${category.slug}`}>{category.label}</FieldLabel><FieldDescription>{category.description}</FieldDescription></FieldContent></Field>)}</FieldGroup></FieldSet>
        </TabsContent>
        <TabsContent value="sources" className="mt-8">
          <FieldSet><FieldLegend>Preferred publishers</FieldLegend><FieldDescription>Publisher choices are discovered from live article metadata.</FieldDescription><FieldGroup className="gap-3">{sources.length ? sources.map((source) => <Field key={source.id} orientation="horizontal"><Checkbox id={`pref-source-${source.id}`} checked={draft.sources.some((item) => item.id === source.id)} onCheckedChange={(value) => setDraft({ ...draft, sources: value === true ? [...draft.sources.filter((item) => item.id !== source.id), source] : draft.sources.filter((item) => item.id !== source.id) })} /><FieldLabel htmlFor={`pref-source-${source.id}`}>{source.name}</FieldLabel></Field>) : <p className="text-sm text-muted-foreground">Connect a provider and load articles to discover publishers.</p>}</FieldGroup></FieldSet>
        </TabsContent>
        <TabsContent value="authors" className="mt-8">
          <FieldSet><FieldLegend>Preferred authors</FieldLegend><FieldDescription>Names remain provider-qualified; identical names are never assumed to be the same person.</FieldDescription><FieldGroup className="gap-3">{authors.length ? authors.map((author) => <Field key={`${author.provider}:${author.id}`} orientation="horizontal"><Checkbox id={`pref-author-${author.provider}-${author.id}`} checked={draft.authors.some((item) => item.id === author.id && item.provider === author.provider)} onCheckedChange={(value) => setDraft({ ...draft, authors: value === true ? [...draft.authors.filter((item) => !(item.id === author.id && item.provider === author.provider)), author] : draft.authors.filter((item) => !(item.id === author.id && item.provider === author.provider)) })} /><FieldContent><FieldLabel htmlFor={`pref-author-${author.provider}-${author.id}`}>{author.name}</FieldLabel><FieldDescription>{author.provider === 'guardian' ? 'The Guardian' : 'NewsAPI.ai'}</FieldDescription></FieldContent></Field>) : <p className="text-sm text-muted-foreground">Stable authors will appear after configured providers return article metadata.</p>}</FieldGroup></FieldSet>
        </TabsContent>
      </Tabs>
      <div className="mt-10 flex flex-wrap gap-3"><Button onClick={save}><SaveIcon data-icon="inline-start" />Save preferences</Button><Button variant="outline" onClick={clear}><RotateCcwIcon data-icon="inline-start" />Reset</Button></div>
    </div>
  )
}
