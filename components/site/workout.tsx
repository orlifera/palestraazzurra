"use client"

import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import { Reveal } from "@/components/motion/reveal"
import { ShareButton } from "@/components/site/share-card"
import { Sheet } from "@/components/site/sheet"
import { exercises, workout } from "@/lib/content"
import { cn } from "@/lib/utils"

type Locale = "it" | "en"

/**
 * The staff's workout of the week (content/workout.json), written from the
 * editor. Shows only once they tick "published".
 */
export function WeeklyWorkout() {
  const t = useTranslations("workout")
  const s = useTranslations("share")
  const locale = useLocale() as Locale
  if (!workout.published) return null

  const week = workout.week
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${workout.week}T12:00:00Z`))
    : null

  return (
    <section
      id="allenamento"
      aria-labelledby="allenamento-title"
      className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-36"
    >
      <div className="grid gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-4">
          <h2 id="allenamento-title" className="font-display text-[clamp(2.25rem,4.6vw,4.75rem)] text-balance break-words hyphens-auto">
            {t("title")}
          </h2>
          {week ? <p className="font-stamp mt-6 text-xl text-primary sm:text-2xl">{t("week", { date: week })}</p> : null}
        </Reveal>
        <Reveal className="lg:col-span-8" delay={0.05}>
          <Sheet title={workout.title[locale]} aside="Palestra Azzurra">
            <table className="w-full text-left">
              <thead>
                <tr className="font-stamp border-b border-sheet-line text-xs text-foreground/70">
                  <th scope="col" className="px-5 py-3 font-bold sm:px-7">N°</th>
                  <th scope="col" className="py-3 font-bold">{t("exercise")}</th>
                  <th scope="col" className="py-3 text-right font-bold">{t("sets")}</th>
                  <th scope="col" className="py-3 text-right font-bold">{t("reps")}</th>
                  <th scope="col" className="px-5 py-3 text-right font-bold sm:px-7">{t("rest")}</th>
                </tr>
              </thead>
              <tbody className="tabular">
                {workout.exercises.map((e, i) => (
                  <tr key={i} className="border-b border-sheet-line last:border-b-0">
                    <td className="font-stamp px-5 py-5 text-sm text-foreground/60 sm:px-7">{String(i + 1).padStart(2, "0")}</td>
                    <th scope="row" className="font-display py-5 pr-3 text-[clamp(1.5rem,3vw,2.5rem)] leading-none font-extrabold">
                      {e.name[locale]}
                    </th>
                    <td className="py-5 text-right text-xl font-bold">{e.sets}</td>
                    <td className="py-5 text-right text-xl font-bold">{e.reps}</td>
                    <td className="px-5 py-5 text-right text-xl font-bold sm:px-7">{t("restValue", { s: e.rest })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {workout.notes[locale] ? (
              <p className="border-t border-sheet-line px-5 py-5 text-lg leading-relaxed sm:px-7">{workout.notes[locale]}</p>
            ) : null}
          </Sheet>
          <ShareButton
            className="mt-6"
            card={() => ({
              title: s("workout"),
              headline: workout.title[locale],
              rows: workout.exercises.map((e) => `${e.name[locale]} · ${e.sets} × ${e.reps}`),
              name: "palestra-azzurra-allenamento",
            })}
          />
        </Reveal>
      </div>
    </section>
  )
}

/** How the main exercises are done, by body area, with the gym's own photos (content/exercises.json). Lives in the locker drawer. */
export function ExerciseGuide() {
  const t = useTranslations("guide")
  const locale = useLocale() as Locale
  const [group, setGroup] = useState(exercises.groups[0]?.id)
  const active = exercises.groups.find((g) => g.id === group)
  if (!active) return null

  return (
    <div>
      <div role="tablist" aria-label={t("title")} className="flex flex-wrap gap-2">
        {exercises.groups.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            id={`guide-tab-${g.id}`}
            aria-selected={g.id === group}
            aria-controls="guide-panel"
            onClick={() => setGroup(g.id)}
            className={cn(
              "min-h-12 rounded-full border-2 px-5 text-base font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring",
              g.id === group ? "border-primary bg-primary text-primary-foreground" : "border-sheet-line hover:border-primary"
            )}
          >
            {g.name[locale]}
          </button>
        ))}
      </div>

      <ul id="guide-panel" role="tabpanel" aria-labelledby={`guide-tab-${group}`} className="mt-6 border-t-2 border-foreground">
        {active.exercises.map((e) => (
          <li key={e.name.it} className="grid gap-5 border-b border-sheet-line py-6 sm:grid-cols-[13rem_1fr] sm:gap-7">
            {e.photo ? (
              <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius)] bg-muted">
                <Image src={e.photo} alt={e.name[locale]} fill sizes="(min-width: 640px) 13rem, 100vw" className="object-cover" />
              </div>
            ) : (
              <div aria-hidden className="hidden sm:block" />
            )}
            <div>
              <h3 className="font-display text-[clamp(1.75rem,4vw,2.5rem)]">{e.name[locale]}</h3>
              <p className="mt-2 max-w-[62ch] text-base leading-relaxed sm:text-lg">{e.how[locale]}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-base font-semibold">{t("ask")}</p>
    </div>
  )
}
