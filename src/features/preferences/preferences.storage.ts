import { z } from 'zod'

import {
  CATEGORY_SLUGS,
  EMPTY_PREFERENCES,
  type Article,
  type NewsPreferencesV1,
} from '@/services/news/types'

export const PREFERENCES_KEY = 'presshub.preferences.v1'
export const PREFERENCES_EVENT = 'presshub:preferences-changed'

const preferencesSchema = z.object({
  version: z.literal(1),
  sources: z.array(z.object({ id: z.string().min(1), name: z.string().min(1) })),
  categories: z.array(z.enum(CATEGORY_SLUGS)),
  authors: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      provider: z.enum(['guardian', 'newsapi-ai', 'nyt']),
    }),
  ),
})

export function loadPreferences(storage: Storage = localStorage): NewsPreferencesV1 {
  try {
    const raw = storage.getItem(PREFERENCES_KEY)
    if (!raw) return EMPTY_PREFERENCES
    const parsed = preferencesSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : EMPTY_PREFERENCES
  } catch {
    return EMPTY_PREFERENCES
  }
}

export function savePreferences(
  preferences: NewsPreferencesV1,
  storage: Storage = localStorage,
): void {
  const parsed = preferencesSchema.parse(preferences)
  storage.setItem(PREFERENCES_KEY, JSON.stringify(parsed))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(PREFERENCES_EVENT))
}

export function clearPreferences(storage: Storage = localStorage): void {
  storage.removeItem(PREFERENCES_KEY)
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(PREFERENCES_EVENT))
}

export function hasPreferences(preferences: NewsPreferencesV1): boolean {
  return Boolean(preferences.sources.length || preferences.categories.length || preferences.authors.length)
}

export function matchesPreferences(article: Article, preferences: NewsPreferencesV1): boolean {
  const sourceMatches =
    !preferences.sources.length ||
    preferences.sources.some((source) => source.id === article.publisher.id)
  const categoryMatches =
    !preferences.categories.length ||
    preferences.categories.some((category) => article.categories.includes(category))
  const authorMatches =
    !preferences.authors.length ||
    preferences.authors.some((preference) =>
      article.authors.some(
        (author) =>
          author.id !== null &&
          author.id === preference.id &&
          author.provider === preference.provider,
      ),
    )
  return sourceMatches && categoryMatches && authorMatches
}
