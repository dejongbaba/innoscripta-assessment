import { useEffect, useRef, useState, type PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'

export function Reveal({ children, className }: PropsWithChildren<{ className?: string }>) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn('transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100', visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0', className)}>
      {children}
    </div>
  )
}
