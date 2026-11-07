"use client"

import { DragDropHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { IsoLabScene } from "@/components/iso/iso-lab-scene"
import { Reveal } from "@/components/motion/reveal"
import ScrollVelocity from "@/components/react-bits/ScrollVelocity"
import { gallery } from "@/data/site"

export function Lab() {
  const t = useTranslations("lab")
  const services = t.raw("services") as string[]

  const swap = (key: "methodA" | "methodB") =>
    t.rich(key, {
      our: (chunks) => <Word>{chunks}</Word>,
      your: (chunks) => <Word tone="your">{chunks}</Word>,
    })

  return (
    <section
      id="lab"
      aria-labelledby="lab-title"
      className="rubber overflow-hidden rounded-[calc(var(--radius)*2)] py-16 text-platform-foreground sm:py-32 lg:mx-3"
    >
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 sm:gap-14 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-10">
        <div className="lg:col-span-6">
          <Reveal>
            <Image
              src="/brand/lab-white.png"
              alt="Azzurra Lab · personal training lab"
              width={600}
              height={491}
              className="h-auto w-36 sm:w-44"
            />
            <h2 id="lab-title" className="font-display mt-10 text-[clamp(2.4rem,7vw,6.5rem)] text-balance">
              {t("title")}
            </h2>
            <p className="mt-5 text-2xl leading-snug font-bold text-balance text-primary sm:text-3xl">{t("born")}</p>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-pretty text-platform-muted sm:text-xl">
              {t("key")}
            </p>
          </Reveal>
        </div>

        <Reveal className="relative lg:col-span-6" delay={0.08}>
          <div className="relative aspect-[5/4] overflow-hidden rounded-[var(--radius)]">
            <Image
              src="/images/gym/lab-studio.webp"
              alt={t("studioAlt")}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <p className="font-stamp absolute -bottom-4 left-5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
            {t("role")}
          </p>
        </Reveal>
      </div>

      {/* The method: OUR and YOUR trade places. */}
      <div className="mx-auto mt-16 max-w-[90rem] px-4 sm:mt-32 sm:px-6 lg:px-10">
        <p className="font-display text-[clamp(1.75rem,5.4vw,5rem)] leading-[1.02] text-balance">
          {swap("methodA")}
        </p>
        <p className="font-display mt-4 text-right text-[clamp(1.75rem,5.4vw,5rem)] leading-[1.02] text-balance">
          {swap("methodB")}
        </p>
      </div>

      {/* The method at work: three reps in the rack, each one ticked on the scheda. */}
      <div className="mx-auto mt-16 max-w-3xl px-4 sm:mt-24 sm:px-6">
        <IsoLabScene />
      </div>

      <div className="font-display mt-16 border-y border-platform-line py-6 text-[clamp(2.25rem,6vw,5.25rem)] sm:mt-32">
        <ScrollVelocity
          texts={[
            <span key="s" className="flex items-center">
              {services.map((s) => (
                <span key={s} className="flex items-center">
                  {s}
                  <span aria-hidden className="mx-[0.5em] inline-block size-[0.32em] rounded-full bg-primary" />
                </span>
              ))}
            </span>,
          ]}
          velocity={28}
          numCopies={3}
        />
        <ul className="sr-only">
          {services.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <Gallery />

      <div className="mx-auto mt-16 grid max-w-[90rem] gap-10 px-4 sm:mt-32 sm:px-6 lg:grid-cols-12 lg:px-10">
        <Reveal className="lg:col-span-5">
          <p className="font-display text-[clamp(2rem,5vw,4.5rem)] text-primary">{t("never")}</p>
          <p className="font-stamp mt-6 text-lg">{t("visit")}</p>
        </Reveal>
        <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.08}>
          <blockquote className="border-t-2 border-primary pt-6">
            <p className="text-2xl leading-snug font-semibold text-pretty sm:text-3xl">
              “{t("quote")}”
            </p>
            <footer className="font-stamp mt-4 text-sm text-platform-muted">
              {t("quoteAuthor")}
            </footer>
          </blockquote>
        </Reveal>
      </div>
    </section>
  )
}

function Word({ children, tone = "our" }: { children: React.ReactNode; tone?: "our" | "your" }) {
  return (
    <motion.span
      className={
        tone === "your"
          ? "inline-block rounded-[0.18em] bg-primary px-[0.12em] text-primary-foreground"
          : "inline-block rounded-[0.18em] px-[0.1em] text-primary ring-2 ring-primary ring-inset"
      }
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: tone === "your" ? 0.3 : 0.1 }}
    >
      {children}
    </motion.span>
  )
}

/** A scrollable strip of the gym's own photos, with the old gallery's lines. */
function Gallery() {
  const t = useTranslations("lab")
  const g = useTranslations("gallery")

  return (
    <div className="mt-16 sm:mt-32">
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div>
          <h3 className="font-display text-[clamp(2rem,5vw,4.5rem)]">{t("galleryTitle")}</h3>
          <p className="mt-3 text-lg text-platform-muted">{t("galleryLine")}</p>
        </div>
        <p className="font-stamp hidden items-center gap-2 text-sm text-platform-muted sm:flex" aria-hidden>
          <HugeiconsIcon icon={DragDropHorizontalIcon} className="size-5" />
          {t("drag")}
        </p>
      </div>

      <div
        role="region"
        aria-label={t("galleryTitle")}
        tabIndex={0}
        className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-8 [scrollbar-color:var(--primary)_transparent] sm:scroll-px-6 sm:px-6 lg:scroll-px-10 lg:px-10"
      >
        {gallery.map((img, i) => (
          <motion.figure
            key={img.src}
            className="relative h-[clamp(16rem,42vw,30rem)] shrink-0 snap-start overflow-hidden rounded-[var(--radius)] bg-platform-line"
            style={{ aspectRatio: `${img.w} / ${img.h}` }}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px -5% 0px 0px" }}
            transition={{ duration: 0.7, delay: Math.min(i, 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={img.src}
              alt={g(img.alt)}
              fill
              sizes="(min-width: 1024px) 45vw, 80vw"
              className="object-cover transition-transform duration-700 ease-out-expo hover:scale-[1.04]"
            />
          </motion.figure>
        ))}
      </div>
    </div>
  )
}
