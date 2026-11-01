"use client"

import { Call02Icon, Menu01Icon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { animate, useMotionValue, useMotionValueEvent } from "motion/react"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { RailBarbell } from "@/components/motion/barbell"
import { BAR_EVENT } from "@/components/site/hero"
import { BAR_KG, contact, sections } from "@/data/site"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

const PLATES = sections.map((s) => s.kg)

function useLoadedSections() {
  const [loaded, setLoaded] = useState(0)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const line = window.innerHeight * 0.55
      let count = 0
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top < line) count++
      }
      setLoaded(count)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return loaded
}

function Tally({ kg }: { kg: number }) {
  const value = useMotionValue(kg)
  const [shown, setShown] = useState(kg)
  useMotionValueEvent(value, "change", (v) => setShown(Math.round(v)))
  useEffect(() => {
    const controls = animate(value, kg, { duration: 0.6, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [kg, value])

  return (
    <span className="font-stamp tabular inline-flex w-[3.75rem] shrink-0 items-baseline justify-end text-base leading-none">
      {shown}
      <span className="ml-0.5 text-[0.7em] opacity-70">kg</span>
    </span>
  )
}

export function Header() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const { resolvedTheme, setTheme } = useTheme()
  const loaded = useLoadedSections()
  const [open, setOpen] = useState(false)
  // Plates the visitor loaded on the hero bar ride on top of the sections passed.
  const [extra, setExtra] = useState(0)
  useEffect(() => {
    const onBar = (e: Event) => setExtra((e as CustomEvent<number>).detail)
    window.addEventListener(BAR_EVENT, onBar)
    return () => window.removeEventListener(BAR_EVENT, onBar)
  }, [])
  const kg = BAR_KG + 2 * PLATES.slice(0, loaded).reduce((a, b) => a + b, 0) + extra

  const links = [
    { href: "#top", label: t("home") },
    { href: "#staff", label: t("staff") },
    { href: "#lab", label: t("lab") },
    { href: "#orario", label: t("hours") },
    { href: "#contatti", label: t("contact") },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
      <a
        href="#main"
        className="sr-only rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        {t("skip")}
      </a>
      <div className="mx-auto flex h-14 max-w-[90rem] items-center gap-3 rounded-[var(--radius)] border border-border/80 bg-background/95 pr-2 pl-4 backdrop-blur-md">
        <a href="#top" className="shrink-0" aria-label="Palestra Azzurra">
          <Image
            src="/brand/logo-black.png"
            alt=""
            width={900}
            height={319}
            priority
            className="h-8 w-auto dark:hidden"
          />
          <Image
            src="/brand/logo-white.png"
            alt=""
            width={900}
            height={319}
            priority
            className="hidden h-8 w-auto dark:block"
          />
        </a>

        <nav aria-label="Principale" className="ml-4 hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-full px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="ml-auto flex items-center gap-2"
          title={t("load")}
        >
          <RailBarbell
            plates={PLATES}
            loaded={loaded}
            className="w-20 sm:w-32 xl:w-40"
          />
          <span className="hidden sm:inline">
            <Tally kg={kg} />
          </span>
        </div>

        <div className="flex items-center gap-1 md:ml-2">
          <Link
            href="/"
            locale={locale === "it" ? "en" : "it"}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "font-stamp h-9 rounded-full px-3"
            )}
            aria-label={t("language")}
          >
            {t("languageShort")}
          </Link>
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-9 rounded-full"
            )}
            aria-label={t("theme")}
          >
            <HugeiconsIcon icon={Sun03Icon} className="hidden size-4.5 dark:block" />
            <HugeiconsIcon icon={Moon02Icon} className="size-4.5 dark:hidden" />
          </button>
          <a
            href="#contatti"
            className={cn(
              buttonVariants(),
              "hidden h-10 rounded-full px-5 text-sm font-bold sm:inline-flex"
            )}
          >
            {t("cta")}
          </a>

          <a
            href={contact.phoneHref}
            className={cn(
              buttonVariants(),
              "size-10 rounded-full p-0 sm:hidden"
            )}
            aria-label={`${t("call")} ${contact.phone}`}
          >
            <HugeiconsIcon icon={Call02Icon} className="size-4.5" />
          </a>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-10 rounded-full lg:hidden"
              )}
              aria-label={t("menu")}
            >
              <HugeiconsIcon icon={Menu01Icon} className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="rubber w-full border-none p-0 text-platform-foreground sm:max-w-md">
              <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
              <nav aria-label="Mobile" className="flex h-full flex-col px-6 pt-20 pb-8">
                <ul className="flex flex-col gap-1">
                  {links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="font-display block py-2 text-5xl transition-colors hover:text-primary"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <RailBarbell plates={PLATES} loaded={loaded} className="flex-1 [--foreground:var(--platform-foreground)]" />
                    <Tally kg={kg} />
                  </div>
                  <a
                    href={contact.phoneHref}
                    className={cn(buttonVariants(), "h-12 rounded-full text-base font-bold")}
                  >
                    <HugeiconsIcon icon={Call02Icon} />
                    {contact.phone}
                  </a>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
