import type { CategorySlug } from '@/services/news/types'

export const CATEGORIES: ReadonlyArray<{
  slug: CategorySlug
  label: string
  description: string
}> = [
  { slug: 'business', label: 'Business', description: 'Markets, companies and the economy' },
  { slug: 'technology', label: 'Technology', description: 'Digital culture and emerging tools' },
  { slug: 'automotive', label: 'Automotive', description: 'Mobility, transport and vehicles' },
  { slug: 'science', label: 'Science', description: 'Research, climate and discovery' },
  { slug: 'work-life', label: 'Work Life', description: 'Careers, leadership and modern work' },
  { slug: 'social-issues', label: 'Social Issues', description: 'Society, policy and communities' },
  { slug: 'travel-culture', label: 'Travel & Culture', description: 'Places, ideas and the arts' },
  { slug: 'entertainment', label: 'Entertainment', description: 'Film, music and television' },
  { slug: 'gaming', label: 'Gaming', description: 'Games, studios and interactive culture' },
  { slug: 'lifestyle', label: 'Lifestyle', description: 'Health, food and everyday living' },
  { slug: 'hobbies', label: 'Hobbies', description: 'Creative pursuits and recreation' },
  { slug: 'other', label: 'Other', description: 'Stories beyond the usual desks' },
]

const categoryPatterns: Array<[CategorySlug, RegExp]> = [
  ['business', /business|econom|finance|market|money/i],
  ['technology', /technolog|digital|internet|software|comput/i],
  ['automotive', /automotive|cars?|motoring|transport|vehicle/i],
  ['science', /science|climate|environment|space|research/i],
  ['work-life', /work|career|jobs?|employment|leadership/i],
  ['social-issues', /society|social|politic|world|inequality|rights/i],
  ['travel-culture', /travel|culture|arts?|books?|theater|theatre/i],
  ['entertainment', /entertainment|film|movie|music|television|tv/i],
  ['gaming', /gaming|games?|esports/i],
  ['lifestyle', /lifestyle|health|food|fashion|wellness/i],
  ['hobbies', /hobbies|craft|garden|photography|sport/i],
]

export function normalizeCategories(values: Array<string | null | undefined>): CategorySlug[] {
  const normalized = new Set<CategorySlug>()
  for (const value of values) {
    if (!value) continue
    const match = categoryPatterns.find(([, pattern]) => pattern.test(value))
    normalized.add(match?.[0] ?? 'other')
  }
  return normalized.size ? [...normalized] : ['other']
}
