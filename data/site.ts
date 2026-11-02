import { COURSES, contactInfo, hours, staff as staffList, stats as statsInfo, tour } from "@/lib/content"

/*
 * What the staff edit lives in content/*.json (lib/content.ts checks it);
 * this file shapes it for the site, next to what stays in code.
 */

export const contact = {
  ...contactInfo,
  phoneHref: `tel:${contactInfo.phone.replace(/[^\d+]/g, "")}`,
}

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const
const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))

/** Opening hours in Europe/Rome time, minutes from midnight, indexed by JS weekday (0 = Sunday); closed days are missing. */
export const openingHours: Partial<Record<number, [number, number]>> = Object.fromEntries(
  DAYS.flatMap((d, i) => {
    const h = hours.weekly[d]
    return h.closed ? [] : [[i, [minutes(h.open), minutes(h.close)]]]
  })
)

/**
 * Days closed outside the weekly hours (holidays, August, maintenance), in
 * Follonica's calendar: `from` alone for one day, `from` and `to` for a
 * stretch, both included. Past entries are ignored.
 */
export const closures = hours.closures.map((c) => ({
  from: c.from,
  to: c.to || undefined,
  note: c.note?.it || c.note?.en ? c.note : undefined,
}))

export const stats = statsInfo

export const courses = COURSES

/** The coaches; `courses` lists what each one follows, by the ids above. */
export const staff = staffList

/** The zones of the plan (components/iso/gym-plan.tsx) a visitor can tap in the tour, with a photo where one shows that room. */
export const tourZones = (
  [
    { id: "entrance", zone: 0 },
    { id: "weights", zone: 1 },
    { id: "dumbbells", zone: 2 },
    { id: "classes", zone: 3 },
    { id: "lab", zone: 4 },
    { id: "sea", zone: 7 },
  ] as const
).map((z) => ({ ...z, photo: tour.photos[z.id] || undefined }))

export const gallery = [
  { src: "/images/gym/dumbbell-curl.webp", alt: "curl", w: 1920, h: 1280 },
  { src: "/images/gym/kettlebell.webp", alt: "kettlebell", w: 1920, h: 1280 },
  { src: "/images/gym/bench.webp", alt: "bench", w: 1600, h: 900 },
  { src: "/images/gym/floor-plank.webp", alt: "floor", w: 1920, h: 1280 },
  { src: "/images/gym/barbell-squat.webp", alt: "squat", w: 1812, h: 906 },
  { src: "/images/gym/kettlebell-swing.webp", alt: "swing", w: 1600, h: 900 },
  { src: "/images/gym/core.webp", alt: "core", w: 1920, h: 1280 },
  { src: "/images/gym/legs.webp", alt: "legs", w: 1600, h: 900 },
  { src: "/images/gym/dumbbell-rack.webp", alt: "rack", w: 1600, h: 900 },
  { src: "/images/gym/pushup.webp", alt: "pushup", w: 1920, h: 1080 },
  { src: "/images/gym/lab-rack.webp", alt: "labRack", w: 1440, h: 900 },
] as const

export const partners = [
  { src: "/brand/partners/technogym.png", alt: "Technogym", width: 450, height: 134 },
  { src: "/brand/partners/toorx.png", alt: "Toorx", width: 450, height: 134 },
  { src: "/brand/partners/panatta.png", alt: "Panatta", width: 644, height: 184 },
  { src: "/brand/partners/sidea.png", alt: "Sidea", width: 450, height: 134 },
  { src: "/brand/partners/lacertosus.png", alt: "Lacertosus", width: 653, height: 79 },
]

/**
 * Sections in scroll order. Each one passed loads a plate pair on the
 * header barbell; `kg` is the weight of one plate.
 */
export const sections = [
  { id: "chi-siamo", kg: 20 },
  { id: "metodo", kg: 20 },
  { id: "corsi", kg: 15 },
  { id: "lab", kg: 15 },
  { id: "staff", kg: 10 },
  { id: "orario", kg: 5 },
  { id: "contatti", kg: 2.5 },
] as const

export const BAR_KG = 20

