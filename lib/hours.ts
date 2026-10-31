import { openingHours } from "@/data/site"

export type OpenState =
  | { open: true; closesAt: string }
  | { open: false; dayOffset: number; weekday: number; opensAt: string }

function fmt(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${String(m).padStart(2, "0")}`
}

/** Weekday and minutes-from-midnight right now in Follonica. */
function romeNow(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    get("weekday")
  )
  return { weekday, minutes: Number(get("hour")) * 60 + Number(get("minute")) }
}

export function romeWeekday(date = new Date()) {
  return romeNow(date).weekday
}

export function openState(date = new Date()): OpenState {
  const { weekday, minutes } = romeNow(date)
  const [from, to] = openingHours[weekday]
  if (minutes >= from && minutes < to) return { open: true, closesAt: fmt(to) }

  for (let offset = minutes < from ? 0 : 1; offset <= 7; offset++) {
    const day = (weekday + offset) % 7
    const hours = openingHours[day]
    if (hours) {
      return { open: false, dayOffset: offset, weekday: day, opensAt: fmt(hours[0]) }
    }
  }
  return { open: false, dayOffset: 1, weekday: (weekday + 1) % 7, opensAt: "" }
}
