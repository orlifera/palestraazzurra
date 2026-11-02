"use client"

import { Cancel01Icon, SmartPhone01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState, useSyncExternalStore } from "react"

import { Link } from "@/i18n/navigation"

/** Registers the service worker (public/sw.js) in production; in development it would cache stale code. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {})
  }, [])
  return null
}

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

/**
 * "Add to Home Screen": the browser's own install prompt where it offers
 * one (Android, desktop Chrome), the Share-menu hint on iPhone, nothing
 * once installed.
 */
export function InstallButton({ className }: { className?: string }) {
  const t = useTranslations("app")
  const [event, setEvent] = useState<InstallEvent | null>(null)
  const [hint, setHint] = useState(false)
  const platform = useSyncExternalStore(
    () => () => {},
    () =>
      matchMedia("(display-mode: standalone)").matches
        ? "installed"
        : /iphone|ipad|ipod/i.test(navigator.userAgent)
          ? "ios"
          : "other",
    () => "server"
  )

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e as InstallEvent)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    return () => window.removeEventListener("beforeinstallprompt", onPrompt)
  }, [])

  if (platform === "installed" || platform === "server" || (platform === "other" && !event)) return null

  const install = async () => {
    if (event) {
      await event.prompt()
      setEvent(null)
    } else setHint((h) => !h)
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={install}
        aria-expanded={platform === "ios" ? hint : undefined}
        className="font-stamp inline-flex h-12 items-center gap-2 rounded-full border-2 border-foreground px-5 text-sm transition hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
      >
        <HugeiconsIcon icon={SmartPhone01Icon} className="size-4.5" />
        {t("install")}
      </button>
      {hint ? <p className="mt-3 max-w-[40ch] text-base">{t("ios")}</p> : null}
    </div>
  )
}

const DISMISSED = "azzurra:lang-dismissed"
const noop = () => () => {}

/**
 * For the summer visitors: on the Italian page, a phone set to another
 * language is offered the English one, and the other way round. Once
 * closed, it stays closed.
 */
export function LangPrompt() {
  const t = useTranslations("langPrompt")
  const locale = useLocale()
  const other = locale === "it" ? "en" : "it"
  const wanted = useSyncExternalStore(
    noop,
    () => {
      try {
        if (localStorage.getItem(DISMISSED)) return false
      } catch {}
      const lang = (navigator.languages?.[0] ?? navigator.language ?? "").toLowerCase()
      return locale === "it" ? !lang.startsWith("it") : lang.startsWith("it")
    },
    () => false
  )
  const [closed, setClosed] = useState(false)

  if (!wanted || closed) return null

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED, "1")
    } catch {}
    setClosed(true)
  }

  return (
    <div
      role="region"
      aria-label={t("text")}
      lang={other}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md items-center gap-3 rounded-full border border-border bg-background/95 py-2 pr-2 pl-5 shadow-none backdrop-blur-md sm:inset-x-auto sm:right-5 sm:bottom-5"
    >
      <p className="min-w-0 flex-1 text-sm font-semibold">{t("text")}</p>
      <Link
        href="/"
        locale={other}
        onClick={dismiss}
        className="font-stamp inline-flex h-10 shrink-0 items-center rounded-full bg-primary px-4 text-xs text-primary-foreground transition hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
      >
        {t("switch")}
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="flex size-10 shrink-0 items-center justify-center rounded-full transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="size-4.5" />
      </button>
    </div>
  )
}
