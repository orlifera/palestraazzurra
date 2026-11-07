import Image from "next/image"
import { useTranslations } from "next-intl"

import { PlateFace } from "@/components/motion/plate-face"
import { Reveal } from "@/components/motion/reveal"
import { stats } from "@/data/site"

export function About() {
  const t = useTranslations("about")

  return (
    <section id="chi-siamo" className="mx-auto max-w-[90rem] px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-10 lg:pt-36 lg:pb-40">
      <div className="grid gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-8">
          <h2 className="font-display text-[clamp(2.2rem,6.4vw,6rem)] text-balance">
            {t("title")}
          </h2>
        </Reveal>

        <Reveal className="lg:col-span-5 lg:col-start-1 lg:row-start-2" delay={0.05}>
          <p className="text-xl leading-relaxed font-semibold text-pretty sm:text-2xl">
            <span className="text-primary">{t("challengeTitle")}:</span>{" "}
            {t("challenge")}
          </p>
          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-pretty sm:text-lg">
            {t("body")}
          </p>
          <div className="relative mt-10 aspect-[3/2] overflow-hidden rounded-[var(--radius)] bg-muted">
            <Image
              src="/images/gym/barbell-floor.webp"
              alt={t("photoAlt")}
              fill
              sizes="(min-width: 1024px) 36vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <div className="relative lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-2 lg:self-center">
          <div className="relative flex items-end justify-center gap-0 pb-6 sm:justify-start">
            <figure className="relative z-10 w-[58%] max-w-[26rem]">
              <PlateFace value={stats.years} label={t("years")} tone="azure" />
              <figcaption className="sr-only">
                {stats.years} {t("years")}
              </figcaption>
            </figure>
            <figure className="relative -ml-[8%] w-[44%] max-w-[20rem]">
              <PlateFace value={stats.degrees} label={t("degrees")} tone="ink" />
              <figcaption className="sr-only">
                {stats.degrees} {t("degrees")}
              </figcaption>
            </figure>
          </div>
          <div className="rubber h-3 rounded-full" aria-hidden />
        </div>
      </div>
    </section>
  )
}
