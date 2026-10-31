"use client"

import { motion } from "motion/react"

/**
 * Two equal plates on one bar: "il binomio perfetto". The bar arrives tipped
 * and settles level when it scrolls into view.
 */
export function BalanceBar({ left, right }: { left: string; right: string }) {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-4xl"
      initial={{ rotate: -2.5 }}
      whileInView={{ rotate: 0 }}
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
    >
      <div className="relative flex items-center">
        <div className="knurl h-3 flex-1 rounded-full" />
        <Plate label={left} className="left-[4%]" />
        <Plate label={right} className="right-[4%]" />
      </div>
    </motion.div>
  )
}

function Plate({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={`absolute top-1/2 flex h-40 w-[clamp(4.5rem,11vw,7rem)] -translate-y-1/2 items-center justify-center rounded-[1.1rem] bg-primary text-primary-foreground sm:h-56 ${className}`}
    >
      <span className="font-stamp -rotate-90 text-center text-[clamp(0.85rem,1.6vw,1.15rem)] leading-tight whitespace-nowrap">
        {label}
      </span>
    </div>
  )
}
