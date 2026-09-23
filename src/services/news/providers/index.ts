import { createGuardianProvider } from '@/services/news/providers/guardian'
import { createNewsApiProvider } from '@/services/news/providers/newsapi-ai'
import { createNytProvider } from '@/services/news/providers/nyt'

export const newsProviders = [
  createGuardianProvider(import.meta.env.VITE_GUARDIAN_API_KEY),
  createNewsApiProvider(import.meta.env.VITE_NEWSAPI_AI_API_KEY),
  createNytProvider(import.meta.env.VITE_NYT_API_KEY),
]
