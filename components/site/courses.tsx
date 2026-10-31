"use client"

import { ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { IsoPlatformScene } from "@/components/iso/iso-platform-scene"
import { Reveal } from "@/components/motion/reveal"
import { Stamp } from "@/components/motion/stamp"
import { courses } from "@/data/site"

/** The course list as the training card ("scheda") an instructor hands you. */
export function Courses() {
  const t = useTranslations("courses")
  const list = useRef<HTMLOListElement>(null)
  const [current, setCurrent] = useState(-1)

  // The row crossing the middle of the screen carries the folded "you are here" flag.
  useEffect(() => {
    const items = Array.from(list.current?.children ?? [])
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(items.indexOf(e.target))
        }
      },
      { rootMargin: "-48% 0px -48% 0px" }
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

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
            <ol ref={list}>
              {courses.map((id, i) => (
                <Row key={id} index={i} current={current === i} label={t(`items.${id}`)} href={id === "pt" ? "#lab" : undefined} more={t("more")} done={t("done")} />
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Row({
  index,
  current,
  label,
  href,
  more,
  done,
}: {
  index: number
  current: boolean
  label: string
  href?: string
  more: string
  done: string
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
        {href ? (
          <span className="font-stamp inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
            {more}
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </span>
        ) : null}
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
      {current ? (
        <motion.span
          layoutId="scheda-flag"
          aria-hidden
          className="absolute top-1/2 left-0 z-10 h-10 w-2.5 -translate-y-1/2 rounded-r-sm bg-primary sm:w-3"
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="absolute -top-0 -right-2 size-2 rounded-tr-sm bg-primary brightness-75 [clip-path:polygon(0_0,100%_100%,0_100%)]" />
        </motion.span>
      ) : null}
      {href ? (
        <a href={href} className={`${cls} transition-colors hover:bg-accent`}>
          {content}
        </a>
      ) : (
        <div className={cls}>{content}</div>
      )}
    </li>
  )
}
