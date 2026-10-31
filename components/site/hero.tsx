"use client"

import { ArrowDown01Icon, Call02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { Barbell } from "@/components/motion/barbell"
import { Equipment } from "@/components/site/equipment"
import { OpenStatus } from "@/components/site/open-status"
import { buttonVariants } from "@/components/ui/button"
import { contact } from "@/data/site"
import { cn } from "@/lib/utils"

const HERO_PLATES = [20, 15, 10, 5] as const

function useLoadSequence() {
  const [loaded, setLoaded] = useState(0)
  const [lifted, setLifted] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    HERO_PLATES.forEach((_, i) => {
      timers.push(setTimeout(() => setLoaded(i + 1), 400 + i * 220))
    })
    timers.push(
      setTimeout(() => setLifted(true), 400 + HERO_PLATES.length * 220 + 450)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return { loaded, lifted }
}

export function Hero() {
  const t = useTranslations("hero")
  const nav = useTranslations("nav")
  const { loaded, lifted } = useLoadSequence()

  return (
    <section id="top" className="relative flex flex-col overflow-x-clip pt-24 lg:h-svh lg:min-h-[44rem] lg:pt-22">
      <div className="mx-auto grid w-full max-w-[90rem] gap-10 px-4 sm:px-6 lg:mb-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[1.4fr_1fr] lg:gap-14 lg:px-10">
        <div className="flex min-w-0 flex-col">
          <h1 className="font-display relative text-[clamp(4.6rem,min(12vw,15svh),12rem)]">
            <motion.span
              className="block"
              animate={{ y: lifted ? -10 : 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              Palestra
            </motion.span>
            <span className="-mx-[6%] my-[0.04em] block w-[112%] text-[1rem] sm:-mr-[20%] sm:w-[126%]">
              <Barbell
                plates={HERO_PLATES}
                loaded={loaded}
                lifted={lifted}
              />
            </span>
            <span className="-mt-[0.1em] block text-primary">Azzurra</span>
          </h1>

          <div className="mt-6 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="max-w-xl">
              <p
                className="hero-rise font-stamp text-xl text-balance sm:text-2xl"
                style={{ "--d": "150ms" } as React.CSSProperties}
              >
                {t("motto")}
              </p>
              <p
                className="hero-rise mt-4 text-lg leading-relaxed"
                style={{ "--d": "260ms" } as React.CSSProperties}
              >
                <strong className="font-bold">{t("lead")}</strong> {t("sub")}{" "}
                <span className="text-primary">{t("coach")}</span>
              </p>
            </div>
          </div>

          <div
            className="hero-rise mt-6 flex flex-wrap items-center gap-3"
            style={{ "--d": "380ms" } as React.CSSProperties}
          >
            <a
              href="#contatti"
              className={cn(
                buttonVariants(),
                "h-13 rounded-full px-7 text-base font-bold"
              )}
            >
              {nav("cta")}
            </a>
            <a
              href={contact.phoneHref}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "tabular h-13 rounded-full px-6 text-base font-semibold"
              )}
            >
              <HugeiconsIcon icon={Call02Icon} />
              {contact.phone}
            </a>
            <a
              href="#chi-siamo"
              className="group inline-flex h-13 items-center gap-2 px-3 text-sm font-semibold underline decoration-primary decoration-2 underline-offset-4"
            >
              {t("more")}
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className="size-4 transition-transform group-hover:translate-y-0.5"
              />
            </a>
          </div>
          <OpenStatus className="hero-rise mt-4" />
        </div>

        <div className="relative lg:pt-2 lg:pb-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)] bg-muted lg:aspect-auto lg:h-full lg:min-h-[28rem]">
            <Image
              src="/images/staff/team.webp"
              alt={t("photoAlt")}
              fill
              priority
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
        </div>
      </div>
      <Equipment />
    </section>
  )
}
