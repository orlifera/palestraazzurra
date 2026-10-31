"use client"

import { useTranslations } from "next-intl"

import LogoLoop from "@/components/react-bits/LogoLoop"
import { partners } from "@/data/site"

export function Equipment() {
  const t = useTranslations()

  return (
    <div className="rubber relative mt-12 text-platform-foreground lg:mt-auto lg:pt-0">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:gap-10 lg:px-10">
        <p className="font-stamp shrink-0 text-sm text-platform-muted">
          {t("equipped")}
        </p>
        <div className="min-w-0 flex-1">
          <LogoLoop
            logos={partners.map((p) => ({ ...p, title: p.alt }))}
            speed={60}
            logoHeight={34}
            gap={72}
            pauseOnHover
            scaleOnHover
            fadeOut
            fadeOutColor="var(--platform)"
            ariaLabel={t("equipped")}
          />
        </div>
      </div>
    </div>
  )
}
