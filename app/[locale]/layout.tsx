import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MotionProvider } from "@/components/motion/motion-provider"
import { SmoothScroll } from "@/components/motion/smooth-scroll"
import { Toaster } from "@/components/ui/sonner"
import { routing } from "@/i18n/routing"
import { SITE_URL } from "@/lib/json-ld"
import { cn } from "@/lib/utils"

const openSans = Open_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-open-sans",
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
      className={cn("scroll-smooth antialiased", openSans.variable)}
    >
      <body>
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
