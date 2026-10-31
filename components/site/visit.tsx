"use client"

import { Location01Icon, Navigation03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { useSyncExternalStore } from "react"

import { IsoSeaScene } from "@/components/iso/iso-sea-scene"
import { Reveal } from "@/components/motion/reveal"
import { OpenStatus } from "@/components/site/open-status"
import { contact } from "@/data/site"
import { romeWeekday } from "@/lib/hours"
import { cn } from "@/lib/utils"

const ROWS = [
  { key: "weekdays", days: [1, 2, 3, 4, 5], time: ["7:30", "21:30"], note: true },
  { key: "saturday", days: [6], time: ["9:00", "17:00"] },
  { key: "sunday", days: [0], time: ["8:30", "12:30"] },
] as const

const noop = () => () => {}

export function Visit() {
  const t = useTranslations("hours")
  const w = useTranslations("where")
  const s = useTranslations("status")
  // Today's weekday in Follonica; null during SSR so the markup stays stable.
  const today = useSyncExternalStore(noop, romeWeekday, () => null)

  return (
    <section
      id="orario"
      aria-labelledby="orario-title"
      className="rubber mx-0 overflow-hidden rounded-[calc(var(--radius)*2)] py-24 text-platform-foreground sm:py-32 lg:mx-3"
    >
      <div className="mx-auto grid max-w-[90rem] gap-16 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-10">
        <div className="lg:col-span-7">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="orario-title" className="font-display text-[clamp(4rem,9vw,8.5rem)]">
              {t("title")}
            </h2>
            <OpenStatus className="mb-3 text-base" />
          </Reveal>
          <dl className="mt-10 border-t border-platform-line">
            {ROWS.map((r, i) => {
              const active = today !== null && (r.days as readonly number[]).includes(today)
              return (
                <Reveal
                  key={r.key}
                  delay={i * 0.06}
                  className={cn(
                    "relative grid grid-cols-1 items-baseline gap-x-6 gap-y-1 border-b border-platform-line py-6 sm:grid-cols-[1fr_auto]",
                    active && "text-primary"
                  )}
                >
                  <dt className="font-stamp text-lg sm:text-xl">
                    {t(r.key)}
                    {active ? (
                      <span className="ml-3 inline-block -rotate-6 rounded-md border-2 border-primary px-2 py-0.5 align-middle text-xs">
                        {s("today")}
                      </span>
                    ) : null}
                    {"note" in r ? (
                      <span className="block text-sm font-semibold tracking-normal text-platform-muted normal-case">
                        {t("continuous")}
                      </span>
                    ) : null}
                  </dt>
                  <dd className="font-display tabular text-[clamp(3rem,7vw,6rem)]">
                    {r.time[0]}
                    <span className="mx-[0.15em] text-platform-muted">–</span>
                    {r.time[1]}
                  </dd>
                </Reveal>
              )
            })}
          </dl>
          {/* From the beach to the door: the 200 m, walked. */}
          <IsoSeaScene className="mt-16 sm:mt-20" />
        </div>

        <Reveal className="flex flex-col lg:col-span-4 lg:col-start-9" delay={0.1}>
          <h3 className="font-display text-[clamp(2.5rem,5vw,4.5rem)]">{w("title")}</h3>
          <p className="mt-6 flex items-start gap-3 text-xl leading-snug font-semibold">
            <HugeiconsIcon icon={Location01Icon} className="mt-1 size-5 shrink-0 text-primary" />
            {w("address")}
          </p>
          <p className="font-stamp mt-4 inline-flex w-fit rounded-full border-2 border-primary px-3 py-1 text-sm text-primary">
            {w("sea")}
          </p>
          <dl className="mt-8 space-y-3 text-lg">
            <div>
              <dt className="sr-only">E-mail</dt>
              <dd>
                <a href={`mailto:${contact.email}`} className="break-all underline decoration-primary decoration-2 hover:text-primary">
                  {contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="sr-only">Tel.</dt>
              <dd>
                <a href={contact.phoneHref} className="tabular underline decoration-primary decoration-2 hover:text-primary">
                  tel. {contact.phone}
                </a>
              </dd>
            </div>
          </dl>
          <a
            href={contact.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-13 w-fit items-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground transition hover:bg-primary/85"
          >
            <HugeiconsIcon icon={Navigation03Icon} className="size-5" />
            {w("directions")}
          </a>
        </Reveal>
      </div>
    </section>
  )
}
