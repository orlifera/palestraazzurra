export const contact = {
  email: "palestraazzurra.fit@gmail.com",
  phone: "+39 0566 469433",
  phoneHref: "tel:+390566469433",
  instagram: "https://www.instagram.com/palestraazzurra/",
  facebook: "https://www.facebook.com/profile.php?id=61557082070869",
  maps: "https://www.google.com/maps/search/?api=1&query=Palestra+Azzurra+via+Rossini+1+58022+Follonica+GR",
}

/** Opening hours in Europe/Rome time, minutes from midnight, indexed by JS weekday (0 = Sunday). */
export const openingHours: Record<number, [number, number]> = {
  0: [8 * 60 + 30, 12 * 60 + 30],
  1: [7 * 60 + 30, 21 * 60 + 30],
  2: [7 * 60 + 30, 21 * 60 + 30],
  3: [7 * 60 + 30, 21 * 60 + 30],
  4: [7 * 60 + 30, 21 * 60 + 30],
  5: [7 * 60 + 30, 21 * 60 + 30],
  6: [9 * 60, 17 * 60],
}

/**
 * Days closed outside the weekly hours (holidays, August, maintenance), in
 * Follonica's calendar: `from` alone for one day, `from` and `to` for a
 * stretch, both included. The open status, the hours, Google's listing and
 * the notice that shows two weeks ahead all follow this list. Past entries
 * can stay; they're ignored.
 *
 *   { from: "2026-12-25", to: "2026-12-26", note: { it: "Natale", en: "Christmas" } },
 */
export const closures: {
  from: string
  to?: string
  note?: { it: string; en: string }
}[] = []

export const stats = { years: 17, degrees: 24 }

export const courses = [
  "pt",
  "weight",
  "pregnancy",
  "rehab",
  "anamnesis",
  "bodybuilding",
  "posture",
  "seniors",
] as const

/**
 * The coaches. `courses` lists what each one follows, by the ids above:
 * filled in from the roster (personal trainers; Giada's fitness and body
 * building diploma). Add the rest as the gym confirms them.
 */
export const staff = [
  {
    id: "bonucci",
    courses: ["pt"],
    name: "Lorenzo Bonucci",
    photo: "/images/staff/lorenzo-bonucci.webp",
    instagram: "https://www.instagram.com/bonucci_lorenzo_7",
  },
  {
    id: "lgiannoni",
    courses: ["pt"],
    name: "Lorenzo Giannoni",
    photo: "/images/staff/lorenzo-giannoni.webp",
    instagram: "https://www.instagram.com/giannonilorenzo",
  },
  {
    id: "camici",
    courses: ["pt"],
    name: "Ettore Camici",
    photo: "/images/staff/ettore-camici.webp",
  },
  {
    id: "mangani",
    courses: ["pt", "bodybuilding"],
    name: "Giada Mangani",
    photo: "/images/staff/giada-mangani.webp",
    instagram: "https://www.instagram.com/giadamangani",
  },
  {
    id: "mgiannoni",
    courses: [],
    name: "Marco Giannoni",
    photo: "/images/staff/marco-giannoni.webp",
  },
] as const satisfies readonly {
  id: string
  courses: readonly (typeof courses)[number][]
  name: string
  photo: string
  instagram?: string
}[]

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

/**
 * The zones of the plan (components/iso/gym-plan.tsx) a visitor can tap in
 * the tour, by zone index, with a photo where one shows that room.
 */
export const tourZones = [
  { id: "entrance", zone: 0 },
  { id: "weights", zone: 1, photo: "/images/gym/barbell-squat.webp" },
  { id: "dumbbells", zone: 2, photo: "/images/gym/dumbbell-rack.webp" },
  { id: "classes", zone: 3 },
  { id: "lab", zone: 4, photo: "/images/gym/lab-studio.webp" },
  { id: "sea", zone: 7 },
] as const
