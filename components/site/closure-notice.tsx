"use client"

import { useLocale, useTranslations } from "next-intl"
import { useSyncExternalStore } from "react"

import { longDate } from "@/components/site/open-status"
import { upcomingClosure } from "@/lib/hours"
import { cn } from "@/lib/utils"

const noop = () => () => {}

/** The next closure from data/site.ts, two weeks ahead and while it lasts. Nothing otherwise. */
export function ClosureNotice({ className }: { className?: string }) {
  const t = useTranslations("status")
  const locale = useLocale()
  // None during SSR: the build doesn't know what day it is. The entries are
  // stable objects, so the snapshot only changes with the date.
  const closure = useSyncExternalStore(noop, () => upcomingClosure(), () => undefined)

  if (!closure) return null
  const note = closure.note?.[locale as "it" | "en"]
  const dates =
    closure.to && closure.to !== closure.from
      ? t("closedFromTo", { from: longDate(closure.from, locale), to: longDate(closure.to, locale) })
      : t("closedOn", { date: longDate(closure.from, locale) })

  return (
    <p
      role="status"
      className={cn(
        "font-stamp inline-flex w-fit flex-wrap items-center gap-x-2 rounded-full border-2 border-primary px-3 py-1 text-sm text-primary",
        className
      )}
    >
      {dates}
      {note ? <span className="font-semibold tracking-normal normal-case opacity-80">· {note}</span> : null}
    </p>
  )
}
