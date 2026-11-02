import { closures, contact, openingHours } from "@/data/site"

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.palestraazzurra.it"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`

/**
 * The gym as schema.org reads it, for Google's listing and the maps: hours
 * and closures come from data/site.ts, so they stay in step with the page.
 */
export function gymJsonLd(locale: string, description: string) {
  // Days sharing their hours go in one entry.
  const groups = new Map<string, string[]>()
  for (const [day, hours] of Object.entries(openingHours)) {
    if (!hours) continue
    const key = `${hhmm(hours[0])}-${hhmm(hours[1])}`
    groups.set(key, [...(groups.get(key) ?? []), DAYS[Number(day)]])
  }

  return {
    "@context": "https://schema.org",
    "@type": "ExerciseGym",
    name: "Palestra Azzurra",
    url: new URL(locale === "it" ? "/" : `/${locale}`, SITE_URL).href,
    description,
    image: new URL("/images/staff/team.webp", SITE_URL).href,
    logo: new URL("/brand/logo-black.png", SITE_URL).href,
    telephone: contact.phone,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Via G. Rossini 1",
      postalCode: "58022",
      addressLocality: "Follonica",
      addressRegion: "GR",
      addressCountry: "IT",
    },
    hasMap: contact.maps,
    sameAs: [contact.instagram, contact.facebook],
    openingHoursSpecification: [...groups].map(([key, dayOfWeek]) => {
      const [opens, closes] = key.split("-")
      return { "@type": "OpeningHoursSpecification", dayOfWeek, opens, closes }
    }),
    // Google's way of saying closed: open and close at midnight.
    specialOpeningHoursSpecification: closures.map((c) => ({
      "@type": "OpeningHoursSpecification",
      validFrom: c.from,
      validThrough: c.to ?? c.from,
      opens: "00:00",
      closes: "00:00",
    })),
  }
}
