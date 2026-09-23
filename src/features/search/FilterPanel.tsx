import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORIES } from '@/services/news/categories'
import type { ArticleQuery, CategorySlug, DatePreset, PublisherRef } from '@/services/news/types'

const dateOptions: Array<{ value: DatePreset; label: string }> = [
  { value: 'any', label: 'Any time' }, { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' },
]

export function FilterPanel({ query, sources, onChange, idPrefix = 'filters' }: { query: ArticleQuery; sources: PublisherRef[]; onChange: (query: ArticleQuery) => void; idPrefix?: string }) {
  const toggleCategory = (category: CategorySlug, checked: boolean) => onChange({ ...query, categories: checked ? [...query.categories, category] : query.categories.filter((value) => value !== category) })
  const toggleSource = (source: PublisherRef, checked: boolean) => {
    const references = [`newsapi-ai:${source.id}`]
    if (source.id === 'theguardian.com') references.unshift('guardian:theguardian.com')
    if (/new york times/i.test(source.name)) references.push(`nyt:${source.name}`)
    onChange({ ...query, sources: checked ? [...new Set([...query.sources, ...references])] : query.sources.filter((value) => !references.includes(value)) })
  }
  return (
    <FieldGroup className="gap-8">
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-date`}>Published</FieldLabel>
        <Select value={query.datePreset} onValueChange={(value: DatePreset) => onChange({ ...query, datePreset: value, ...(value === 'custom' ? {} : { from: undefined, to: undefined }) })}>
          <SelectTrigger id={`${idPrefix}-date`}><SelectValue placeholder="Any time" /></SelectTrigger>
          <SelectContent><SelectGroup>{dateOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
      </Field>
      {query.datePreset === 'custom' ? (
        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={Boolean(query.from && query.to && query.from > query.to)}><FieldLabel htmlFor={`${idPrefix}-from`}>From</FieldLabel><Input id={`${idPrefix}-from`} type="date" value={query.from ?? ''} max={query.to} onChange={(event) => onChange({ ...query, from: event.target.value || undefined })} /></Field>
          <Field data-invalid={Boolean(query.from && query.to && query.from > query.to)}><FieldLabel htmlFor={`${idPrefix}-to`}>To</FieldLabel><Input id={`${idPrefix}-to`} type="date" value={query.to ?? ''} min={query.from} onChange={(event) => onChange({ ...query, to: event.target.value || undefined })} /></Field>
        </div>
      ) : null}
      <FieldSet>
        <FieldLegend>Categories</FieldLegend>
        <FieldDescription>Match any selected category.</FieldDescription>
        <FieldGroup className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((category) => (
            <Field key={category.slug} orientation="horizontal">
              <Checkbox id={`${idPrefix}-category-${category.slug}`} checked={query.categories.includes(category.slug)} onCheckedChange={(checked) => toggleCategory(category.slug, checked === true)} />
              <FieldLabel htmlFor={`${idPrefix}-category-${category.slug}`} className="font-normal">{category.label}</FieldLabel>
            </Field>
          ))}
        </FieldGroup>
      </FieldSet>
      {sources.length ? (
        <FieldSet>
          <FieldLegend>Publishers</FieldLegend>
          <FieldDescription>Options come from live provider metadata.</FieldDescription>
          <FieldGroup className="gap-2">
            {sources.map((source) => {
              const checked = query.sources.some((value) => value.endsWith(`:${source.id}`) || value === `nyt:${source.name}`)
              return <Field key={source.id} orientation="horizontal"><Checkbox id={`${idPrefix}-source-${source.id}`} checked={checked} onCheckedChange={(value) => toggleSource(source, value === true)} /><FieldContent><FieldLabel htmlFor={`${idPrefix}-source-${source.id}`} className="font-normal">{source.name}</FieldLabel></FieldContent></Field>
            })}
          </FieldGroup>
        </FieldSet>
      ) : null}
    </FieldGroup>
  )
}
