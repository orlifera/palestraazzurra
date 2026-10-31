"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { openState, type OpenState } from "@/lib/hours"
import { cn } from "@/lib/utils"

/** Live "open now" line, computed in Europe/Rome time after hydration. */
export function OpenStatus({ className }: { className?: string }) {
  const t = useTranslations("status")
  const days = useTranslations("hours").raw("days") as string[]
  const [state, setState] = useState<OpenState | null>(null)

  useEffect(() => {
    const tick = () => setState(openState())
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <p
      className={cn(
        "inline-flex min-h-6 items-center gap-2 text-sm font-semibold",
        className
      )}
      aria-live="polite"
    >
      <span
        className={cn(
          "relative size-2.5 rounded-full",
          state === null && "bg-steel",
          state?.open && "bg-primary",
          state && !state.open && "bg-steel-dark"
        )}
      >
        {state?.open ? (
          <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
        ) : null}
      </span>
      {state === null ? (
        <span className="opacity-0">·</span>
      ) : state.open ? (
        <span>
          {t("open")}{" "}
          <span className="font-normal opacity-80">
            · {t("closesAt", { time: state.closesAt })}
          </span>
        </span>
      ) : (
        <span>
          {t("closed")}{" "}
          <span className="font-normal opacity-80">
            ·{" "}
            {t("opensAt", {
              day:
                state.dayOffset === 0
                  ? t("today")
                  : state.dayOffset === 1
                    ? t("tomorrow")
                    : days[state.weekday],
              time: state.opensAt,
            })}
          </span>
        </span>
      )}
    </p>
  )
}
