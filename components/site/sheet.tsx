"use client"

import { createContext, useContext } from "react"

import { cn } from "@/lib/utils"

/**
 * Inside the locker drawer the drawer is the card: a scheda whose title
 * repeats the drawer's drops its printed header and its edge.
 */
export const DrawerTitle = createContext<string | null>(null)

/**
 * The scheda: the site's one card, a training sheet with its printed ink
 * header (title left, a note right) and a 2px ink edge.
 */
export function Sheet({
  title,
  aside,
  className,
  children,
}: {
  title: React.ReactNode
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const drawer = useContext(DrawerTitle)
  if (drawer !== null && title === drawer && !aside) return <div className={className}>{children}</div>
  return (
    <div className={cn("overflow-hidden rounded-[var(--radius)] border-2 border-foreground bg-background", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 bg-foreground px-5 py-3 text-background sm:px-7">
        <span className="font-stamp text-lg">{title}</span>
        {aside ? <span className="font-stamp text-xs opacity-80">{aside}</span> : null}
      </div>
      {children}
    </div>
  )
}

/** A choice on a scheda: a full pill, ticked in azure when picked. */
export function Choice({
  selected,
  onClick,
  children,
  role = "radio",
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  role?: "radio" | "checkbox"
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border-2 px-4 py-2 text-left text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-sheet-line bg-background hover:border-primary"
      )}
    >
      {children}
    </button>
  )
}
