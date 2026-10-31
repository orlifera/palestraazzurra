"use client"

import "lenis/dist/lenis.css"

import { ReactLenis } from "lenis/react"
import { useReducedMotionConfig } from "motion/react"

/**
 * Lenis on the whole page, as on sir-alex: the scroll glides, and so does
 * everything driven by it (the plan behind the site, the plate faces, the
 * header rail). In-page links go through Lenis too. Plain native scrolling
 * under reduced motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotionConfig()
  if (reduce) return <>{children}</>
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        // Lenis honours scroll-padding-top (globals.css), which clears the header.
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
