"use client"

import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import { useState, useSyncExternalStore } from "react"

import { contact, openingHours } from "@/data/site"
import { addDays, closureOn, fmt, romeMinutes, romeToday, weekdayOf } from "@/lib/hours"
import { cn } from "@/lib/utils"

const noop = () => () => {}
/** Minutes before closing that make a visit too short to be worth it. */
const SHORT = 60

/** "YYYY-MM-DD" and minutes as an iCalendar local time, e.g. 20261102T183000. */
const icsTime = (date: string, minutes: number) =>
  `${date.replaceAll("-", "")}T${String(Math.floor(minutes / 60)).padStart(2, "0")}${String(minutes % 60).padStart(2, "0")}00`

function downloadIcs(title: string, date: string, from: number, to: number) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Palestra Azzurra//Visita//IT",
    "BEGIN:VEVENT",
    `UID:${date}-${from}@palestraazzurra.it`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;TZID=Europe/Rome:${icsTime(date, from)}`,
    `DTEND;TZID=Europe/Rome:${icsTime(date, to)}`,
    `SUMMARY:${title}`,
    "LOCATION:Palestra Azzurra\\, via G. Rossini 1\\, 58022 Follonica (GR)",
    `DESCRIPTION:Tel. ${contact.phone}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }))
  const a = Object.assign(document.createElement("a"), { href: url, download: "palestra-azzurra.ics" })
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Pick a day of the coming week and a time: the planner answers from the
 * real hours and closures (data/site.ts), and puts the visit in the
 * visitor's calendar. Sits on the hours band.
 */
export function VisitPlanner() {
  const t = useTranslations("planner")
  const s = useTranslations("status")
  const locale = useLocale()
  // The coming week only exists in the browser: the build doesn't know the date.
  const today = useSyncExternalStore(noop, () => romeToday(), () => null)
  const [offset, setOffset] = useState(0)
  const [time, setTime] = useState<number | null>(null)

  if (!today) return <div className="min-h-80" />

  const date = addDays(today, offset)
  const hours = openingHours[weekdayOf(date)]
  const closure = closureOn(date)
  const open = hours && !closure
  // Half-hour slots from opening to half an hour before closing, from now on if it's today.
  const now = offset === 0 ? romeMinutes() : 0
  const slots = open
    ? Array.from({ length: (hours[1] - hours[0]) / 30 }, (_, i) => hours[0] + i * 30).filter((m) => m + 30 > now && m < hours[1])
    : []
  const at = time !== null && slots.includes(time) ? time : slots[0]
  const left = open && at !== undefined ? hours[1] - at : 0

  const dayName = (o: number) =>
    o === 0
      ? s("today")
      : o === 1
        ? s("tomorrow")
        : new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", timeZone: "UTC" }).format(
            new Date(`${addDays(today, o)}T12:00:00Z`)
          )

  return (
    <div className="rounded-[var(--radius)] border-2 border-platform-line p-5 sm:p-6">
      <h3 className="font-stamp text-lg">{t("title")}</h3>

      <fieldset className="mt-5">
        <legend className="font-stamp mb-2.5 text-xs text-platform-muted">{t("day")}</legend>
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }, (_, o) => (
            <Pill key={o} selected={o === offset} onClick={() => setOffset(o)}>
              <span className="capitalize">{dayName(o)}</span>
            </Pill>
          ))}
        </div>
      </fieldset>

      {slots.length ? (
        <fieldset className="mt-5">
          <legend className="font-stamp mb-2.5 text-xs text-platform-muted">{t("time")}</legend>
          <div role="radiogroup" className="flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-1">
            {slots.map((m) => (
              <Pill key={m} selected={m === at} onClick={() => setTime(m)}>
                <span className="tabular">{fmt(m)}</span>
              </Pill>
            ))}
          </div>
        </fieldset>
      ) : null}

      <p className="mt-5 min-h-7 text-base font-semibold" aria-live="polite">
        {closure
          ? closure.note
            ? t("closure", { note: closure.note[locale as "it" | "en"] })
            : t("closedDay")
          : !slots.length
            ? t("closedDay")
            : left < SHORT
              ? <span className="text-primary">{t("late", { time: fmt(hours[1]), minutes: left })}</span>
              : t("ok", { time: fmt(hours[1]) })}
      </p>

      {slots.length && at !== undefined ? (
        <button
          type="button"
          onClick={() => downloadIcs(t("event"), date, at, Math.min(at + 60, hours[1]))}
          className="mt-4 inline-flex h-12 items-center gap-2 rounded-full border-2 border-platform-foreground px-5 font-bold transition hover:bg-platform-foreground hover:text-platform focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
        >
          <HugeiconsIcon icon={Calendar03Icon} className="size-5" />
          {t("add")}
        </button>
      ) : null}
    </div>
  )
}

function Pill({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-full border-2 px-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        selected ? "border-primary bg-primary text-primary-foreground" : "border-platform-line hover:border-primary"
      )}
    >
      {children}
    </button>
  )
}
