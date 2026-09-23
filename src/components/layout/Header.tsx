import { MenuIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home' },
  { to: '/articles', label: 'Articles' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
]

function NavLabel({ label }: { label: string }) {
  return (
    <span className="relative block h-5 overflow-hidden leading-5">
      <span className="block transition-transform duration-300 ease-out group-hover/nav:-translate-y-full group-focus-visible/nav:-translate-y-full">
        {label}
      </span>
      <span aria-hidden="true" className="absolute inset-x-0 top-full block transition-transform duration-300 ease-out group-hover/nav:-translate-y-full group-focus-visible/nav:-translate-y-full">
        {label}
      </span>
    </span>
  )
}

function DesktopNavigation() {
  return (
    <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) => cn('group/nav rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-offset-4', isActive ? 'font-semibold' : 'text-muted-foreground')}
        >
          <NavLabel label={link.label} />
        </NavLink>
      ))}
    </nav>
  )
}

export function Header() {
  return (
    <>
      <div className="border-b bg-muted/60 px-4 py-2.5 text-center text-xs text-muted-foreground">
        Shape the stories you see.{' '}
        <NavLink to="/preferences" className="font-medium text-foreground underline underline-offset-4">Personalize your feed</NavLink>
      </div>
      <header className="border-b bg-background">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <NavLink to="/" className="text-xl font-bold tracking-[-0.06em] focus-visible:outline-2 focus-visible:outline-offset-4">Press<span className="text-muted-foreground">.hub</span></NavLink>
          <DesktopNavigation />
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="icon" asChild>
              <NavLink to="/articles" aria-label="Search articles"><SearchIcon /></NavLink>
            </Button>
            <Button asChild>
              <NavLink to="/preferences"><SlidersHorizontalIcon data-icon="inline-start" />Preferences</NavLink>
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open navigation"><MenuIcon /></Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Press.hub</SheetTitle>
                <SheetDescription>Navigate the newsroom.</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="flex flex-col gap-2 px-4">
                {[...links, { to: '/preferences', label: 'Preferences' }].map((link) => (
                  <SheetClose asChild key={link.to}>
                    <Button variant="ghost" className="justify-start" asChild><NavLink to={link.to}>{link.label}</NavLink></Button>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  )
}
