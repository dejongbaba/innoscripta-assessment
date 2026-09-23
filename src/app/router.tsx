import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'

function RouteFallback() {
  return <div className="mx-auto min-h-[60vh] max-w-[1240px] animate-pulse px-5 py-20 text-sm text-muted-foreground">Loading Press.hub…</div>
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    HydrateFallback: RouteFallback,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('@/pages/HomePage')).HomePage }) },
      { path: 'articles', lazy: async () => ({ Component: (await import('@/pages/ArticlesPage')).ArticlesPage }) },
      { path: 'categories', lazy: async () => ({ Component: (await import('@/pages/CategoriesPage')).CategoriesPage }) },
      { path: 'preferences', lazy: async () => ({ Component: (await import('@/pages/PreferencesPage')).PreferencesPage }) },
      { path: 'about', lazy: async () => ({ Component: (await import('@/pages/AboutPage')).AboutPage }) },
      { path: '*', lazy: async () => ({ Component: (await import('@/pages/NotFoundPage')).NotFoundPage }) },
    ],
  },
])
