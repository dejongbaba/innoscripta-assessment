import { Link } from 'react-router-dom'

import type { CategorySlug } from '@/services/news/types'

const tileColors: Record<CategorySlug, string> = {
  business: 'from-amber-300 to-orange-600',
  technology: 'from-cyan-300 to-blue-700',
  automotive: 'from-zinc-300 to-red-700',
  science: 'from-lime-300 to-emerald-700',
  'work-life': 'from-yellow-200 to-stone-600',
  'social-issues': 'from-rose-300 to-fuchsia-700',
  'travel-culture': 'from-sky-300 to-teal-700',
  entertainment: 'from-pink-300 to-violet-700',
  gaming: 'from-green-300 to-cyan-800',
  lifestyle: 'from-orange-200 to-rose-500',
  hobbies: 'from-violet-200 to-indigo-600',
  other: 'from-stone-200 to-stone-600',
}

export function CategoryTile({ slug, label, imageUrl }: { slug: CategorySlug; label: string; imageUrl?: string | null }) {
  return (
    <Link
      to={`/articles?category=${slug}`}
      className="group/tile relative grid min-h-36 place-items-center overflow-hidden rounded-2xl border bg-muted focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {imageUrl ? <img src={imageUrl} alt="" loading="lazy" className="absolute inset-0 size-full scale-110 object-cover opacity-0 transition duration-500 ease-out group-hover/tile:scale-100 group-hover/tile:opacity-100 group-focus-visible/tile:scale-100 group-focus-visible/tile:opacity-100" /> : <div className={`absolute inset-0 bg-gradient-to-br ${tileColors[slug]} opacity-0 transition duration-500 group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100`} />}
      <span className="relative h-5 overflow-hidden font-medium leading-5">
        <span className="block transition duration-300 group-hover/tile:-translate-y-full group-hover/tile:text-white group-focus-visible/tile:-translate-y-full group-focus-visible/tile:text-white">{label}</span>
        <span aria-hidden="true" className="absolute left-0 top-full block text-white transition duration-300 group-hover/tile:-translate-y-full group-focus-visible/tile:-translate-y-full">{label}</span>
      </span>
    </Link>
  )
}
