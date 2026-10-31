"use client"

import { motion } from "motion/react"
import { useId } from "react"

import { cn } from "@/lib/utils"

/**
 * An azure rubber-stamp tick: ink ring with a rough, uneven edge. It lands
 * (scale down, settle at an angle) the first time it scrolls into view.
 */
export function Stamp({ label, className, tilt = -6 }: { label: string; className?: string; tilt?: number }) {
  const uid = useId().replace(/:/g, "")

  return (
    <motion.span
      className={cn("inline-flex text-primary", className)}
      initial={{ scale: 1.15, opacity: 0, rotate: tilt }}
      whileInView={{ scale: 1, opacity: 1, rotate: tilt }}
      viewport={{ once: true, margin: "0px 0px -30% 0px" }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 64 64" className="size-full overflow-visible" aria-hidden>
        <defs>
          <filter id={`ink-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" />
          </filter>
          <mask id={`wear-${uid}`}>
            <rect width="64" height="64" fill="white" />
            <circle cx="14" cy="47" r="2.2" fill="black" />
            <circle cx="49" cy="15" r="1.4" fill="black" />
            <circle cx="40" cy="54" r="1.1" fill="black" />
          </mask>
        </defs>
        <g filter={`url(#ink-${uid})`} mask={`url(#wear-${uid})`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="32" r="27" strokeWidth="4.2" />
          <circle cx="32" cy="32" r="21.5" strokeWidth="1.4" opacity="0.7" />
          <path d="M20.5 33.5 L28.5 41 L44 23.5" strokeWidth="5.4" />
        </g>
      </svg>
    </motion.span>
  )
}
