"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion } from "motion/react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Reveal } from "@/components/motion/reveal"
import { Stamp } from "@/components/motion/stamp"
import { askAbout } from "@/components/site/contact"
import { ShareButton } from "@/components/site/share-card"
import { Choice, Sheet } from "@/components/site/sheet"
import { cn } from "@/lib/utils"

const GOALS = ["weight", "bodybuilding", "posture", "rehab", "pregnancy", "seniors", "pt"] as const
const DAYS = [1, 2, 3, 4, 5, 6] as const
const LEVELS = ["new", "some", "regular"] as const

type Goal = (typeof GOALS)[number]

/**
 * "Write to them and get your own": a blank scheda the visitor fills in by
 * ticking goals, each landing with the stamp, then sends to the contact
 * form, subject and message written.
 */
export function SchedaBuilder() {
  const t = useTranslations("builder")
  const s = useTranslations("share")
  const [goals, setGoals] = useState<Goal[]>([])
  const [days, setDays] = useState<number>(3)
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("some")
  const [error, setError] = useState(false)

  const toggle = (g: Goal) => {
    setError(false)
    setGoals((gs) => (gs.includes(g) ? gs.filter((x) => x !== g) : [...gs, g]))
  }

  const send = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!goals.length) {
      e.preventDefault()
      setError(true)
      return
    }
    // In the order they're listed, not the order they were ticked.
    const list = GOALS.filter((g) => goals.includes(g)).map((g) => t(`goals.${g}`))
    askAbout(
      t("subject"),
      [
        t("messageGoals", { list: list.join(", ") }),
        t("messageDays", { days }),
        t("messageLevel", { level: t(`levels.${level}`) }),
        "",
        t("messageEnd"),
      ].join("\n")
    )
  }

  return (
    <section
      id="scheda"
      aria-labelledby="scheda-title"
      className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-36"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-4">
          <h2 id="scheda-title" className="font-display text-[clamp(3.4rem,6.2vw,6.25rem)] text-balance">
            {t("title")}
          </h2>
          <p className="font-stamp mt-6 text-xl text-balance text-primary sm:text-2xl">{t("lead")}</p>
        </Reveal>

        <Reveal className="lg:col-span-8" delay={0.05}>
          <Sheet title={t("sheet")} aside={t("draft")}>
            <fieldset className="border-b border-sheet-line">
              <legend className="font-stamp px-5 pt-5 text-sm text-foreground/70 sm:px-7">
                {t("goalsLabel")}
              </legend>
              <ul className="mt-2" role="group">
                {GOALS.map((g, i) => {
                  const on = goals.includes(g)
                  return (
                    <li key={g} className="border-t border-sheet-line first:border-t-0">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={() => toggle(g)}
                        className={cn(
                          "group grid min-h-16 w-full grid-cols-[3rem_1fr_4rem] items-center px-5 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:grid-cols-[4rem_1fr_5rem] sm:px-7"
                        )}
                      >
                        <span className="tabular font-stamp text-sm text-foreground/60">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-lg leading-snug font-semibold sm:text-xl">{t(`goals.${g}`)}</span>
                        <span className="flex size-12 items-center justify-center justify-self-end">
                          <AnimatePresence initial={false}>
                            {on ? (
                              <motion.span key="stamp" aria-hidden exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}>
                                <Stamp label="" className="size-11" tilt={i % 2 ? -5 : -9} />
                              </motion.span>
                            ) : (
                              <span
                                key="box"
                                aria-hidden
                                className="size-7 rounded-md border-2 border-sheet-line transition-colors group-hover:border-primary"
                              />
                            )}
                          </AnimatePresence>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </fieldset>

            <div className="grid gap-8 p-5 sm:grid-cols-2 sm:p-7">
              <fieldset>
                <legend className="font-stamp mb-3 text-sm text-foreground/70">{t("daysLabel")}</legend>
                <div role="radiogroup" className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <Choice key={d} selected={days === d} onClick={() => setDays(d)}>
                      <span className="tabular inline-block min-w-4 text-center">{d}</span>
                    </Choice>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="font-stamp mb-3 text-sm text-foreground/70">{t("levelLabel")}</legend>
                <div role="radiogroup" className="flex flex-wrap gap-2">
                  {LEVELS.map((l) => (
                    <Choice key={l} selected={level === l} onClick={() => setLevel(l)}>
                      {t(`levels.${l}`)}
                    </Choice>
                  ))}
                </div>
              </fieldset>

              <div className="sm:col-span-2">
                <a
                  href="#contatti"
                  onClick={send}
                  aria-describedby={error ? "scheda-error" : undefined}
                  className="font-stamp inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-base text-primary-foreground transition hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring active:translate-y-px"
                >
                  {t("send")}
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
                </a>
                <p id="scheda-error" role="alert" className="mt-3 min-h-6 text-sm font-semibold text-destructive">
                  {error ? t("empty") : ""}
                </p>
                {goals.length ? (
                  <ShareButton
                    className="mt-2"
                    card={() => ({
                      title: s("scheda"),
                      rows: [
                        ...GOALS.filter((g) => goals.includes(g)).map((g) => t(`goals.${g}`)),
                        t("messageDays", { days }),
                      ],
                      name: "palestra-azzurra-scheda",
                    })}
                  />
                ) : null}
              </div>
            </div>
          </Sheet>
        </Reveal>
      </div>
    </section>
  )
}
