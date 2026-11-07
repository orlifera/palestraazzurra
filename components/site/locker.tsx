"use client"

import { Dialog } from "@base-ui/react/dialog"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLenis } from "lenis/react"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { createContext, useCallback, useContext, useState } from "react"

import { InstallButton } from "@/components/site/app-extras"
import { DrawerTitle } from "@/components/site/sheet"
import { cn } from "@/lib/utils"

/*
 * The locker: every interactive tool the site has, kept off the page until
 * someone asks for it. The page carries one row per tool; a tap opens it in
 * a drawer that slides in from the right. A tool's code loads the first time
 * it is opened, and once opened it stays mounted, so a running rest timer or
 * a half-filled scheda survives closing the drawer.
 */

function Loading() {
  return (
    <div
      aria-hidden
      className="h-72 animate-pulse rounded-[var(--radius)] bg-muted/60"
    />
  )
}

const pick = <K extends string>(
  load: () => Promise<Record<K, React.ComponentType>>,
  name: K
) =>
  dynamic(() => load().then((m) => m[name]), { ssr: false, loading: Loading })

const PANELS = {
  timer: pick(() => import("@/components/site/floor-tools"), "RestTimer"),
  plates: pick(() => import("@/components/site/tools"), "PlateCalculator"),
  orm: pick(() => import("@/components/site/tools"), "OneRepMax"),
  prs: pick(() => import("@/components/site/floor-tools"), "PersonalBests"),
  guide: pick(() => import("@/components/site/workout"), "ExerciseGuide"),
  finder: pick(() => import("@/components/site/course-finder"), "CourseFinder"),
  builder: pick(
    () => import("@/components/site/scheda-builder"),
    "SchedaBuilder"
  ),
  tour: pick(() => import("@/components/site/gym-tour"), "GymTour"),
  planner: pick(
    () => import("@/components/site/visit-planner"),
    "VisitPlanner"
  ),
}

export type ToolId = keyof typeof PANELS

/** Where each tool's name already lives in the messages. */
const TITLE: Record<ToolId, string> = {
  timer: "tools.timer.title",
  plates: "tools.plates.title",
  orm: "tools.orm.title",
  prs: "tools.prs.title",
  guide: "guide.title",
  finder: "finder.title",
  builder: "builder.title",
  tour: "tour.title",
  planner: "planner.title",
}

const GROUPS = {
  floor: ["timer", "plates", "orm", "prs", "guide"],
  before: ["finder", "builder", "tour", "planner"],
} as const satisfies Record<string, readonly ToolId[]>

/** The planner belongs to the hours band, so it opens on rubber. */
const RUBBER: ToolId[] = ["planner"]

const LockerContext = createContext<(id: ToolId) => void>(() => {})

/** Opens a tool in the locker drawer. */
export const useLocker = () => useContext(LockerContext)

export function LockerProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations()
  const lenis = useLenis()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<ToolId | null>(null)
  const [seen, setSeen] = useState<ToolId[]>([])

  const show = useCallback((id: ToolId) => {
    setCurrent(id)
    setSeen((s) => (s.includes(id) ? s : [...s, id]))
    setOpen(true)
  }, [])

  // A link inside a tool to a section of the page ("ask about this course",
  // "send the scheda") closes the drawer first, then goes there.
  const onClick = (e: React.MouseEvent) => {
    if (e.defaultPrevented) return
    const link = (e.target as Element).closest<HTMLAnchorElement>(
      'a[href^="#"]'
    )
    const target = link && document.querySelector(link.getAttribute("href")!)
    if (!target) return
    e.preventDefault()
    setOpen(false)
    setTimeout(() => {
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -88 })
      else target.scrollIntoView()
    }, 360)
  }

  const rubber = current !== null && RUBBER.includes(current)
  const title = current ? t(TITLE[current]) : ""
  const group = current
    ? (Object.keys(GROUPS) as (keyof typeof GROUPS)[]).find((g) =>
        (GROUPS[g] as readonly ToolId[]).includes(current)
      )
    : null

  return (
    <LockerContext.Provider value={show}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal keepMounted>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-platform/45 transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup
            onClick={onClick}
            className={cn(
              "fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden outline-none sm:inset-y-3 sm:right-3 sm:w-[calc(100%-1.5rem)] sm:max-w-[44rem] sm:rounded-[calc(var(--radius)*1.5)]",
              "transition-transform duration-500 ease-out-expo data-ending-style:translate-x-[105%] data-ending-style:duration-300 data-starting-style:translate-x-[105%]",
              rubber
                ? "rubber text-platform-foreground"
                : "bg-background text-foreground"
            )}
          >
            <div
              className={cn(
                "flex items-start justify-between gap-4 px-5 pt-5 pb-5 sm:px-8 sm:pt-7",
                rubber
                  ? "border-b border-platform-line"
                  : "bg-foreground text-background"
              )}
            >
              <div className="min-w-0">
                {group ? (
                  <p className="font-stamp text-xs opacity-75">
                    {t(`locker.groups.${group}`)}
                  </p>
                ) : null}
                <Dialog.Title className="mt-2 font-display text-[clamp(2.5rem,7vw,4rem)]">
                  {title}
                </Dialog.Title>
                {current ? (
                  <Dialog.Description className="mt-2 text-base opacity-80 sm:text-lg">
                    {t(`locker.items.${current}`)}
                  </Dialog.Description>
                ) : null}
              </div>
              <Dialog.Close
                aria-label={t("nav.close")}
                className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-current/30 transition hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
              </Dialog.Close>
            </div>
            <div
              data-lenis-prevent
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8"
            >
              <DrawerTitle.Provider value={title}>
                {seen.map((id) => {
                  const Panel = PANELS[id]
                  return (
                    <div key={id} hidden={id !== current}>
                      <Panel />
                    </div>
                  )
                })}
              </DrawerTitle.Provider>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </LockerContext.Provider>
  )
}

/** A bumper plate seen face-on: the "open" mark. It turns a quarter on hover, like a plate spun onto a sleeve. */
function PlateMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      aria-hidden
      className={cn(
        "transition-transform duration-500 ease-out-expo group-hover:rotate-90",
        className
      )}
    >
      <circle cx="28" cy="28" r="27" className="fill-primary" />
      <circle
        cx="28"
        cy="28"
        r="19"
        fill="none"
        strokeWidth="1.5"
        className="stroke-primary-foreground/45"
      />
      <circle cx="28" cy="28" r="9.5" className="fill-steel" />
      <circle cx="28" cy="28" r="4.5" className="fill-background" />
      <rect
        x="26.5"
        y="3.5"
        width="3"
        height="7"
        rx="1.5"
        className="fill-primary-foreground/80"
      />
    </svg>
  )
}

/** One tool in the locker: its name, what it does, and the plate to open it. */
function LockerRow({ id }: { id: ToolId }) {
  const t = useTranslations()
  const open = useLocker()
  return (
    <li className="border-b border-sheet-line">
      <button
        type="button"
        onClick={() => open(id)}
        aria-haspopup="dialog"
        className="group -mx-3 grid w-[calc(100%+1.5rem)] grid-cols-[1fr_auto] items-center gap-4 rounded-[var(--radius)] px-3 py-5 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:py-6"
      >
        <span className="min-w-0">
          <span className="block font-display text-[clamp(2rem,4.2vw,3.25rem)] transition-colors group-hover:text-primary">
            {t(TITLE[id])}
          </span>
          <span className="mt-1.5 block text-base leading-snug text-foreground/75 sm:text-lg">
            {t(`locker.items.${id}`)}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <span className="hidden font-stamp text-xs text-foreground/60 transition-colors group-hover:text-primary sm:inline">
            {t("locker.open")}
          </span>
          <PlateMark className="size-12 sm:size-14" />
        </span>
      </button>
    </li>
  )
}

/** The locker on the page: two racks of tools, for the floor and for before the first visit. */
export function Locker() {
  const t = useTranslations("locker")
  return (
    <section
      id="attrezzi"
      aria-labelledby="attrezzi-title"
      className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-36"
    >
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2
          id="attrezzi-title"
          className="font-display text-[clamp(3.5rem,13vw,11rem)] lg:col-span-7"
        >
          {t("title")}
        </h2>
        <div className="lg:col-span-5 lg:pb-3">
          <p className="font-stamp text-xl text-balance text-primary sm:text-2xl">
            {t("lead")}
          </p>
          <InstallButton className="mt-6" />
        </div>
      </div>

      <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-2 lg:gap-10">
        {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((g) => (
          <div key={g}>
            <h3 className="border-b-2 border-foreground pb-3 font-stamp text-sm">
              {t(`groups.${g}`)}
            </h3>
            <ul>
              {GROUPS[g].map((id) => (
                <LockerRow key={id} id={id} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * A tool offered where it belongs (the finder under the courses, the planner
 * on the hours, the scheda by the form), closed until asked for.
 */
export function ToolLauncher({
  id,
  lead,
  action,
  tone = "ground",
  className,
}: {
  id: ToolId
  lead: string
  action: string
  tone?: "ground" | "rubber"
  className?: string
}) {
  const t = useTranslations()
  const open = useLocker()
  const rubber = tone === "rubber"
  return (
    <button
      type="button"
      onClick={() => open(id)}
      aria-haspopup="dialog"
      className={cn(
        "group flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-[var(--radius)] border-2 p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring sm:p-6",
        rubber
          ? "border-platform-line hover:border-primary"
          : "border-foreground hover:bg-accent",
        className
      )}
    >
      <span className="min-w-0">
        <span className="block font-display text-[clamp(1.9rem,3.6vw,2.75rem)]">
          {t(TITLE[id])}
        </span>
        <span
          className={cn(
            "mt-1.5 block text-base leading-snug",
            rubber ? "text-platform-muted" : "text-foreground/75"
          )}
        >
          {lead}
        </span>
      </span>
      <span className="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full bg-primary pr-1.5 pl-5 font-stamp text-sm text-primary-foreground transition group-hover:bg-primary/85">
        {action}
        <PlateMark className="size-9 [&_circle:first-child]:fill-platform" />
      </span>
    </button>
  )
}
