import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["it", "en"],
  defaultLocale: "it",
  localePrefix: "as-needed",
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
