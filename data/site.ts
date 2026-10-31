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

export const staff = [
  {
    id: "bonucci",
    name: "Lorenzo Bonucci",
    photo: "/images/staff/lorenzo-bonucci.webp",
    instagram: "https://www.instagram.com/bonucci_lorenzo_7",
  },
  {
    id: "lgiannoni",
    name: "Lorenzo Giannoni",
    photo: "/images/staff/lorenzo-giannoni.webp",
    instagram: "https://www.instagram.com/giannonilorenzo",
  },
  {
    id: "camici",
    name: "Ettore Camici",
    photo: "/images/staff/ettore-camici.webp",
  },
  {
    id: "mangani",
    name: "Giada Mangani",
    photo: "/images/staff/giada-mangani.webp",
    instagram: "https://www.instagram.com/giadamangani",
  },
  {
    id: "mgiannoni",
    name: "Marco Giannoni",
    photo: "/images/staff/marco-giannoni.webp",
  },
] as const

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
