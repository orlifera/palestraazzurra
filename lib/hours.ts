import { closures, openingHours } from "@/data/site"

export type Closure = (typeof closures)[number]

export type OpenState =
  | { open: true; closesAt: string }
  | {
      open: false
      dayOffset: number
      weekday: number
      /** The day they reopen, "YYYY-MM-DD", for reopenings more than a week out. */
      date: string
      opensAt: string
    }

export function fmt(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${String(m).padStart(2, "0")}`
}

/**
 * The hours as the site lists them: one row per group of days sharing a
 * time, each a key of the `hours` messages. If one weekday ever gets its own
 * hours, it needs its own row here.
 */
export const hourRows = (
  [
    { key: "weekdays", days: [1, 2, 3, 4, 5], note: true },
    { key: "saturday", days: [6], note: false },
    { key: "sunday", days: [0], note: false },
  ] as const
).map((r) => ({ ...r, time: openingHours[r.days[0]].map(fmt) as [string, string] }))

/** Weekday, minutes from midnight and date right now in Follonica. */
function romeNow(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    get("weekday")
  )
  return {
    weekday,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    date: `${get("year")}-${get("month")}-${get("day")}`,
  }
}

/** "YYYY-MM-DD" plus some days. */
export function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** The closure covering a "YYYY-MM-DD", if any. */
export function closureOn(date: string): Closure | undefined {
  return closures.find((c) => date >= c.from && date <= (c.to ?? c.from))
}

export function romeWeekday(date = new Date()) {
  return romeNow(date).weekday
}

/** Today in Follonica, "YYYY-MM-DD", and the minutes since midnight there. */
export function romeToday(date = new Date()) {
  return romeNow(date).date
}

export function romeMinutes(date = new Date()) {
  return romeNow(date).minutes
}

/** The weekday of a "YYYY-MM-DD". */
export function weekdayOf(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay()
}

/** The closure under way, or starting within two weeks: the one worth a notice. */
export function upcomingClosure(date = new Date()): Closure | undefined {
  const today = romeNow(date).date
  const horizon = addDays(today, 14)
  return closures
    .filter((c) => (c.to ?? c.from) >= today && c.from <= horizon)
    .sort((a, b) => a.from.localeCompare(b.from))[0]
}

export function openState(date = new Date()): OpenState {
  const { weekday, minutes, date: today } = romeNow(date)
  const [from, to] = openingHours[weekday]
  if (!closureOn(today) && minutes >= from && minutes < to) {
    return { open: true, closesAt: fmt(to) }
  }

  // Closures can run for weeks, August above all.
  for (let offset = minutes < from ? 0 : 1; offset <= 120; offset++) {
    const day = (weekday + offset) % 7
    const hours = openingHours[day]
    const on = addDays(today, offset)
    if (hours && !closureOn(on)) {
      return { open: false, dayOffset: offset, weekday: day, date: on, opensAt: fmt(hours[0]) }
    }
  }
  return { open: false, dayOffset: 1, weekday: (weekday + 1) % 7, date: addDays(today, 1), opensAt: "" }
}
