import { InstagramIcon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { Reveal } from "@/components/motion/reveal"
import { staff } from "@/data/site"

export function Staff() {
  const t = useTranslations("staff")

  return (
    <section
      id="staff"
      aria-labelledby="staff-title"
      className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-36"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <Reveal>
            <h2 id="staff-title" className="font-display text-[clamp(4rem,9vw,8.5rem)]">
              {t("title")}
            </h2>
            <p className="font-stamp mt-6 text-xl text-balance text-primary sm:text-2xl">{t("lead")}</p>
          </Reveal>
          <Reveal className="mt-10 max-w-[60ch] space-y-5 text-lg leading-relaxed text-pretty" delay={0.05}>
            <p className="font-semibold">{t("team")}</p>
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
            <p>{t("p3")}</p>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.1}>
          <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius)] bg-muted">
            <Image
              src="/images/gym/floor-plank.webp"
              alt={t("teamAlt")}
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover object-[30%_50%]"
            />
          </div>
        </Reveal>
      </div>

      {/* The roster: one row per coach, credentials ticked like a scheda. */}
      <ul className="mt-20 border-t-2 border-foreground sm:mt-28">
        {staff.map((m, i) => {
          const roles = t.raw(`members.${m.id}.roles`) as string[]
          const credentials = t.raw(`members.${m.id}.credentials`) as string[]
          return (
            <li key={m.id} className="border-b border-sheet-line">
              <Reveal className="grid gap-6 py-8 sm:grid-cols-[9rem_1fr] sm:gap-8 lg:grid-cols-[11rem_1.1fr_1fr] lg:py-10" delay={Math.min(i, 2) * 0.04}>
                <div className="relative size-32 overflow-hidden rounded-[var(--radius)] bg-muted sm:size-36 lg:size-44">
                  <Image
                    src={m.photo}
                    alt={m.name}
                    fill
                    sizes="11rem"
                    className="object-cover object-top grayscale-[0.2] transition duration-500 hover:grayscale-0"
                  />
                </div>
                <div>
                  <h3 className="font-display text-[clamp(2.4rem,4.6vw,4rem)]">{m.name}</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {roles.map((r) => (
                      <li
                        key={r}
                        className="font-stamp rounded-full border-2 border-primary px-3 py-1 text-xs text-primary"
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                  {"instagram" in m && m.instagram ? (
                    <a
                      href={m.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline decoration-primary decoration-2"
                      aria-label={t("instagram", { name: m.name })}
                    >
                      <HugeiconsIcon icon={InstagramIcon} className="size-4" />
                      Instagram
                    </a>
                  ) : null}
                </div>
                <ul className="space-y-2.5 sm:col-start-2 lg:col-start-3">
                  {credentials.map((c) => (
                    <li key={c} className="flex gap-3 text-base leading-snug">
                      <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className="mt-0.5 size-4.5 shrink-0 text-primary" />
                      {c}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
