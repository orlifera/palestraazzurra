import type { Metadata } from "next"
import { Big_Shoulders, Sulphur_Point } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { FirstLoad } from "@/components/site/first-load"
import { MotionProvider } from "@/components/motion/motion-provider"
import { SmoothScroll } from "@/components/motion/smooth-scroll"
import { Toaster } from "@/components/ui/sonner"
import { routing } from "@/i18n/routing"
import { SITE_URL } from "@/lib/json-ld"
import { cn } from "@/lib/utils"

const sulphurPoint = Sulphur_Point({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-sulphur-point",
  display: "swap",
})

/** The display voice: condensed, heavy, cut like the lettering on a plate. */
const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-big-shoulders",
  display: "swap",
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: { it: "/", en: "/en" },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: ["/images/staff/team.webp"],
      locale: locale === "it" ? "it_IT" : "en_GB",
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn("scroll-smooth antialiased", sulphurPoint.variable, bigShoulders.variable)}
    >
      <body>
        <FirstLoad />
        <NextIntlClientProvider>
          <ThemeProvider>
            <MotionProvider>
              <SmoothScroll>{children}</SmoothScroll>
            </MotionProvider>
            <Toaster position="bottom-center" />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
