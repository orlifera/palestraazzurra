"use client"

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion } from "motion/react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { askAbout } from "@/components/site/contact"
import { Choice, Sheet } from "@/components/site/sheet"
import type { courses } from "@/data/site"

type Course = (typeof courses)[number]
const GOALS = ["weight", "bodybuilding", "posture", "rehab"] as const
const LIFE = ["pregnancy", "seniors", "none"] as const
const STYLE = ["floor", "pt"] as const

type Answers = {
  goal?: (typeof GOALS)[number]
  life?: (typeof LIFE)[number]
  style?: (typeof STYLE)[number]
}

/** The answers as courses: pregnancy and age come before the goal; one to one adds the Lab. */
function recommend({ goal, life, style }: Required<Answers>): Course[] {
  const main: Course = life === "none" ? goal : life
  return style === "pt" ? [main, "pt"] : [main]
}

/** Three questions, ending on the course to ask about. Opened from the course list, in the locker drawer. */
export function CourseFinder() {
  const t = useTranslations("finder")
  const c = useTranslations("courses")
  const [answers, setAnswers] = useState<Answers>({})
  const step = !answers.goal ? 1 : !answers.life ? 2 : !answers.style ? 3 : 4

  const back = () =>
    setAnswers(({ goal, life }) =>
      step === 3 ? { goal } : step === 4 ? { goal, life } : {}
    )

  const question =
    step === 1
      ? {
          q: t("q1"),
          options: GOALS.map((k) => ({
            k,
            label: t(`q1a.${k}`),
            pick: () => setAnswers({ goal: k }),
          })),
        }
      : step === 2
        ? {
            q: t("q2"),
            options: LIFE.map((k) => ({
              k,
              label: t(`q2a.${k}`),
              pick: () => setAnswers((a) => ({ ...a, life: k })),
            })),
          }
        : step === 3
          ? {
              q: t("q3"),
              options: STYLE.map((k) => ({
                k,
                label: t(`q3a.${k}`),
                pick: () => setAnswers((a) => ({ ...a, style: k })),
              })),
            }
          : null

  const result = step === 4 ? recommend(answers as Required<Answers>) : []

  return (
    <div>
      <Sheet
        title={step < 4 ? t("step", { n: step }) : t("result")}
        aside={
          step > 1 ? (
            <button
              type="button"
              onClick={step === 4 ? () => setAnswers({}) : back}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-background/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {step === 4 ? null : (
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
              )}
              {step === 4 ? t("restart") : t("back")}
            </button>
          ) : undefined
        }
      >
        {/* Progress, as three ticks on the sheet's edge. */}
        <div aria-hidden className="flex gap-1 px-5 pt-4 sm:px-7">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${n < step ? "bg-primary" : "bg-sheet-line"}`}
            />
          ))}
        </div>
        <div className="min-h-64 p-5 sm:p-7" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {question ? (
                <fieldset>
                  <legend className="text-xl font-bold sm:text-2xl">
                    {question.q}
                  </legend>
                  <div
                    role="radiogroup"
                    className="mt-5 flex flex-col items-start gap-2.5"
                  >
                    {question.options.map((o) => (
                      <Choice key={o.k} selected={false} onClick={o.pick}>
                        {o.label}
                      </Choice>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <div>
                  <ul className="space-y-3">
                    {result.map((id) => (
                      <ResultRow
                        key={id}
                        label={c(`items.${id}`)}
                        lab={id === "pt"}
                        ask={c("ask")}
                        more={c("more")}
                        subject={c("askSubject", { course: c(`items.${id}`) })}
                      />
                    ))}
                  </ul>
                  <p className="mt-7 font-stamp text-sm text-foreground/70">
                    {t("also")}
                  </p>
                  <ul className="mt-3">
                    <ResultRow
                      label={c("items.anamnesis")}
                      ask={c("ask")}
                      more={c("more")}
                      subject={c("askSubject", {
                        course: c("items.anamnesis"),
                      })}
                    />
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Sheet>
    </div>
  )
}

function ResultRow({
  label,
  lab = false,
  ask,
  more,
  subject,
}: {
  label: string
  lab?: boolean
  ask: string
  more: string
  subject: string
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <span className="font-display text-[clamp(1.6rem,3.4vw,2.75rem)] leading-none">
        {label}
      </span>
      <a
        href={lab ? "#lab" : "#contatti"}
        onClick={lab ? undefined : () => askAbout(subject)}
        className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-primary bg-primary px-3 py-1.5 font-stamp text-xs text-primary-foreground transition hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
      >
        {lab ? more : ask}
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
      </a>
    </li>
  )
}
