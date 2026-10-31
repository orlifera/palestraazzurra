"use client"

import { useTranslations } from "next-intl"

import { BalanceBar } from "@/components/motion/balance-bar"
import { Reveal } from "@/components/motion/reveal"
import ScrollVelocity from "@/components/react-bits/ScrollVelocity"

export function Motto() {
  const t = useTranslations("motto")

  return (
    <section
      id="metodo"
      aria-labelledby="motto-title"
      className="rubber overflow-hidden rounded-t-[calc(var(--radius)*2)] pt-20 pb-28 text-platform-foreground sm:pt-28 lg:pb-36"
    >
      <h2 id="motto-title" className="sr-only">
        {t("title")}
      </h2>
      <div aria-hidden className="font-display text-[clamp(4.5rem,13vw,12rem)]">
        <ScrollVelocity
          texts={[
            <span key="a" className="pr-[0.35em]">{t("title")} <span className="text-primary">·</span></span>,
            <span key="b" className="pr-[0.35em] text-transparent [-webkit-text-stroke:2px_var(--primary)]">{t("title")} ·</span>,
          ]}
          velocity={38}
          numCopies={4}
          className="leading-[0.95]"
        />
      </div>

      <div className="mx-auto mt-16 grid max-w-[90rem] gap-10 px-4 sm:px-6 lg:mt-24 lg:grid-cols-12 lg:px-10">
        <Reveal className="lg:col-span-8">
          <p className="text-2xl leading-relaxed text-pretty sm:text-3xl">
            <strong className="font-stamp text-primary">{t("sub")}</strong>{" "}
            {t("body")}
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-20 max-w-[90rem] px-6 sm:mt-28 lg:px-10">
        <BalanceBar left={t("a")} right={t("b")} />
      </div>

      <Reveal className="mx-auto mt-20 max-w-3xl px-4 text-center sm:mt-28 sm:px-6">
        <p className="text-lg leading-relaxed text-pretty text-platform-muted sm:text-xl">
          {t("after")}
        </p>
      </Reveal>
    </section>
  )
}
