import { Facebook01Icon, InstagramIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { contact } from "@/data/site"

export function Footer() {
  const t = useTranslations("footer")
  const nav = useTranslations("nav")
  const h = useTranslations("hours")

  return (
    <footer className="rubber mt-10 overflow-hidden rounded-t-[calc(var(--radius)*2)] text-platform-foreground">
      <div className="mx-auto max-w-[90rem] px-4 pt-20 pb-10 sm:px-6 lg:px-10">
        <p className="font-display text-[clamp(3.4rem,10vw,10rem)] text-balance">
          {t("tagline")}
        </p>

        <div className="mt-16 grid gap-10 border-t border-platform-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image src="/brand/logo-white.png" alt="Palestra Azzurra" width={900} height={319} className="h-10 w-auto" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-platform-muted">{t("strength")}</p>
          </div>
          <div>
            <Image src="/brand/lab-white.png" alt="Azzurra Lab" width={600} height={491} className="h-14 w-auto" />
            <p className="font-stamp mt-4 text-sm">{t("born")}</p>
            <p className="mt-1 text-sm text-primary">{t("lab")}</p>
          </div>
          <div className="text-sm leading-relaxed">
            <p className="font-stamp mb-3">{h("title")}</p>
            <p>{h("weekdays")}: <span className="tabular">7:30–21:30</span></p>
            <p className="text-platform-muted">{h("continuous")}</p>
            <p>{h("saturday")}: <span className="tabular">9:00–17:00</span></p>
            <p>{h("sunday")}: <span className="tabular">8:30–12:30</span></p>
          </div>
          <div className="text-sm leading-relaxed">
            <p className="font-stamp mb-3">{nav("contact")}</p>
            <p>via G. Rossini 1 - 58022 Follonica (GR)</p>
            <p>
              <a href={`mailto:${contact.email}`} className="break-all hover:text-primary">{contact.email}</a>
            </p>
            <p>
              <a href={contact.phoneHref} className="tabular hover:text-primary">tel. {contact.phone}</a>
            </p>
            <div className="mt-4 flex gap-2">
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex size-10 items-center justify-center rounded-full border border-platform-line transition hover:border-primary hover:text-primary">
                <HugeiconsIcon icon={InstagramIcon} className="size-5" />
              </a>
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex size-10 items-center justify-center rounded-full border border-platform-line transition hover:border-primary hover:text-primary">
                <HugeiconsIcon icon={Facebook01Icon} className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <p className="mt-14 text-xs text-platform-muted">{t("rights", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  )
}
