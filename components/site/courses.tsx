"use client"

import { ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useScroll, useTransform } from "motion/react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState, type RefObject } from "react"

import { IsoPlatformScene } from "@/components/iso/iso-platform-scene"
import { Reveal } from "@/components/motion/reveal"
import { Stamp } from "@/components/motion/stamp"
import { askAbout } from "@/components/site/contact"
import { CourseFinder } from "@/components/site/course-finder"
import { courses } from "@/data/site"
import { cn } from "@/lib/utils"

/** The course list as the training card ("scheda") an instructor hands you. */
export function Courses() {
  const t = useTranslations("courses")
  const list = useRef<HTMLOListElement>(null)
  const bar = useSmithBar(list)

  return (
    <section
      id="corsi"
      aria-labelledby="corsi-title"
      className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-36"
    >
      <div className="grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 id="corsi-title" className="font-display text-[clamp(4rem,9vw,8.5rem)]">
              {t("title")}
            </h2>
            {/* The weights floor: the plates go on, two pulls, the bar comes off. */}
            <IsoPlatformScene className="mt-10 max-w-md lg:mt-14 lg:max-w-none" />
          </div>
        </Reveal>

        <Reveal className="lg:col-span-8" delay={0.05}>
          <div className="overflow-hidden rounded-[var(--radius)] border-2 border-foreground bg-background">
            {/* Card header, like the printed top of a scheda. */}
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-foreground bg-foreground px-5 py-3 text-background sm:px-7">
              <span className="font-stamp text-lg">{t("sheet")}</span>
              <span className="font-stamp text-xs opacity-80">{t("gym")}</span>
            </div>
            <div className="font-stamp grid grid-cols-[3rem_1fr_4.5rem] border-b border-sheet-line px-5 py-2 text-xs text-foreground/70 sm:grid-cols-[4rem_1fr_6rem] sm:px-7">
              <span>N°</span>
              <span>{t("column")}</span>
              <span className="flex justify-end">
                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className="size-4" />
                <span className="sr-only">{t("done")}</span>
              </span>
            </div>
            <div className="relative">
              <SmithTrack bar={bar} layer="light" />
              <ol ref={list}>
                {courses.map((id, i) => {
                  const label = t(`items.${id}`)
                  // Personal training has its own section; the rest open the form, subject filled in.
                  return id === "pt" ? (
                    <Row key={id} index={i} label={label} href="#lab" more={t("more")} done={t("done")} accent />
                  ) : (
                    <Row
                      key={id}
                      index={i}
                      label={label}
                      href="#contatti"
                      onClick={() => askAbout(t("askSubject", { course: label }))}
                      more={t("ask")}
                      done={t("done")}
                    />
                  )
                })}
              </ol>
              <SmithTrack bar={bar} layer="machine" />
            </div>
          </div>
          <CourseFinder />
        </Reveal>
      </div>
    </section>
  )
}

function Row({
  index,
  label,
  href,
  onClick,
  more,
  done,
  accent = false,
}: {
  index: number
  label: string
  href: string
  onClick?: () => void
  more: string
  done: string
  accent?: boolean
}) {
  const content = (
    <>
      <span className="tabular font-stamp text-sm text-foreground/60 sm:text-base">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="font-display flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 pr-2 text-[clamp(1.6rem,3.4vw,2.75rem)] leading-[1] break-words">
        <span className="relative">
          {label}
          <span
            aria-hidden
            className="absolute inset-x-[-0.15em] bottom-[0.08em] -z-10 h-[0.42em] origin-left scale-x-0 rounded-sm bg-primary/30 transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
          />
        </span>
        <span
          className={cn(
            "font-stamp inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-primary px-3 py-1 text-xs",
            accent ? "bg-primary text-primary-foreground" : "text-primary"
          )}
        >
          {more}
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </span>
      </span>
      <span className="flex justify-end">
        <Stamp label={done} className="size-12 sm:size-14" tilt={index % 2 ? -4 : -7} />
      </span>
    </>
  )

  const cls =
    "group isolate grid grid-cols-[3rem_1fr_4.5rem] items-center gap-y-2 border-b border-sheet-line px-5 py-5 last:border-b-0 sm:grid-cols-[4rem_1fr_6rem] sm:px-7 sm:py-6"

  return (
    <li className="relative last:[&>*]:border-b-0">
      <a href={href} onClick={onClick} className={`${cls} transition-colors hover:bg-accent`}>
        {content}
      </a>
    </li>
  )
}

/**
 * Where the Smith bar is in the list, with the scroll: racked along the foot
 * of each row as it crosses the middle of the screen, sliding in between.
 */
function useSmithBar(list: RefObject<HTMLOListElement | null>) {
  const { scrollY } = useScroll()
  // Scroll positions where each row is centred on screen, and that row's place in the list.
  const [stops, setStops] = useState({ scroll: [0, 1], top: [0, 0], height: [0, 0] })

  useEffect(() => {
    const el = list.current
    if (!el) return
    const measure = () => {
      const rows = Array.from(el.children as HTMLCollectionOf<HTMLElement>)
      const base = el.getBoundingClientRect().top + window.scrollY
      setStops({
        scroll: rows.map((r) => base + r.offsetTop + r.offsetHeight / 2 - window.innerHeight / 2),
        top: rows.map((r) => r.offsetTop),
        height: rows.map((r) => r.offsetHeight),
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [list])

  return {
    y: useTransform(scrollY, stops.scroll, stops.top),
    height: useTransform(scrollY, stops.scroll, stops.height),
  }
}

const RAILS = ["left-[11px]", "right-[11px]"] as const

/**
 * The scheda's "you are here", as a Smith machine: a chrome guide rod down
 * each edge of the card, and the loaded, knurled bar riding them with the
 * scroll. As each row crosses the middle of the screen the bar racks along
 * its foot and the row is lit; between rows it slides from one to the next.
 *
 * Drawn in two layers: the `light` under the rows, so their text and hover
 * sit on it, and the `machine` over them, so a hovered row never hides the
 * rods. Decorative: the rows carry the content.
 */
function SmithTrack({
  bar: { y, height },
  layer,
}: {
  bar: ReturnType<typeof useSmithBar>
  layer: "light" | "machine"
}) {
  if (layer === "light") {
    return (
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 bg-primary/[0.07]"
        style={{ y, height }}
      />
    )
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {RAILS.map((side) => (
        <span key={side} className={cn("absolute inset-y-0 w-1.5", side)}>
          {/* The rod, shaded round, between its two mounts. */}
          <span className="absolute inset-y-1 left-1/2 w-1 -translate-x-1/2 rounded-full bg-linear-to-r from-steel-dark via-steel to-steel-dark" />
          <span className="absolute top-0 left-1/2 h-2 w-3.5 -translate-x-1/2 rounded-b-[3px] bg-steel-dark" />
          <span className="absolute bottom-0 left-1/2 h-2 w-3.5 -translate-x-1/2 rounded-t-[3px] bg-steel-dark" />
        </span>
      ))}
      <motion.div className="absolute inset-x-0 top-0" style={{ y, height }}>
        <span className="absolute inset-x-0 bottom-0 h-10 translate-y-1/2">
          <span className="knurl absolute inset-x-3.5 top-1/2 h-1.5 -translate-y-1/2 rounded-full" />
          {(["left", "right"] as const).map((side) => (
            <span
              key={side}
              className={cn("absolute inset-y-0 left-0 w-6", side === "right" && "right-0 left-auto -scale-x-100")}
            >
              {/* The plate outside the rod; the carriage on it, its hook turned in. */}
              <span className="absolute inset-y-0 left-0 w-1.5 rounded-r-[3px] bg-primary" />
              <span className="absolute top-1/2 left-1.5 h-7 w-3.5 -translate-y-1/2 rounded-[3px] bg-foreground" />
              <span className="absolute top-[calc(50%+6px)] left-[18px] h-1 w-1.5 rounded-r-full bg-foreground" />
            </span>
          ))}
        </span>
      </motion.div>
    </div>
  )
}
