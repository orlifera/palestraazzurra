"use client"

import { Delete02Icon, PauseIcon, PlayIcon, RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react"

import { ShareButton } from "@/components/site/share-card"
import { Choice, Sheet } from "@/components/site/sheet"
import { cn } from "@/lib/utils"

const PRESETS = [60, 90, 120, 180] as const
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.ceil(s) % 60).padStart(2, "0")}`

/** A short double beep, made on the spot: no audio file to download. */
function beep() {
  try {
    const audio = new AudioContext()
    ;[0, 0.25].forEach((at) => {
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.25, audio.currentTime + at)
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + at + 0.18)
      osc.connect(gain).connect(audio.destination)
      osc.start(audio.currentTime + at)
      osc.stop(audio.currentTime + at + 0.2)
    })
  } catch {}
}

/**
 * The rest between sets: pick a time, start, and the plate's rim empties
 * as it runs. It counts from the clock, so a locked phone doesn't slow it,
 * keeps the screen awake where it can, and beeps and buzzes at the end.
 */
export function RestTimer() {
  const t = useTranslations("tools.timer")
  const [duration, setDuration] = useState<number>(90)
  const [left, setLeft] = useState<number>(90)
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [sound, setSound] = useState(true)
  const [done, setDone] = useState(false)
  const lock = useRef<WakeLockSentinel | null>(null)
  const soundId = useId()

  useEffect(() => {
    if (endsAt === null) return
    navigator.wakeLock?.request("screen").then((l) => (lock.current = l), () => {})
    const id = setInterval(() => {
      const remaining = Math.max(0, (endsAt - Date.now()) / 1000)
      setLeft(remaining)
      if (remaining === 0) {
        setEndsAt(null)
        setDone(true)
        if (sound) beep()
        navigator.vibrate?.([200, 100, 200])
      }
    }, 100)
    return () => {
      clearInterval(id)
      lock.current?.release().catch(() => {})
      lock.current = null
    }
  }, [endsAt, sound])

  const pick = (s: number) => {
    setDuration(s)
    setLeft(s)
    setEndsAt(null)
    setDone(false)
  }
  const toggle = () => {
    setDone(false)
    if (endsAt !== null) {
      setEndsAt(null)
    } else {
      const from = left > 0 ? left : duration
      setLeft(from)
      setEndsAt(Date.now() + from * 1000)
    }
  }

  const running = endsAt !== null
  const R = 88
  const C = 2 * Math.PI * R
  const share = left / duration

  return (
    <Sheet title={t("title")}>
      <div className="grid items-center gap-8 p-5 sm:grid-cols-[auto_1fr] sm:p-7">
        {/* The plate: its azure rim empties as the rest runs down. */}
        <div className="relative mx-auto size-52">
          <svg viewBox="0 0 200 200" className="size-full -rotate-90" aria-hidden>
            <circle cx="100" cy="100" r={R} fill="var(--foreground)" />
            <circle cx="100" cy="100" r={R} fill="none" stroke="var(--steel-dark)" strokeWidth="14" />
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - share)}
              className={cn(!running && "transition-[stroke-dashoffset] duration-300")}
            />
          </svg>
          <span
            className="font-display tabular absolute inset-0 flex items-center justify-center pb-1 text-6xl text-background"
            aria-hidden
          >
            {/* Sulphur Point has no tabular figures: fixed cells stop the clock jittering. */}
            {[...mmss(left)].map((c, i) =>
              c === ":" ? (
                c
              ) : (
                <span key={i} className="inline-block w-[0.52em] text-center">
                  {c}
                </span>
              )
            )}
          </span>
        </div>

        <div>
          <div role="radiogroup" aria-label={t("title")} className="flex flex-wrap gap-2">
            {PRESETS.map((s) => (
              <Choice key={s} selected={duration === s} onClick={() => pick(s)}>
                <span className="tabular">{mmss(s)}</span>
              </Choice>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggle}
              className="font-stamp inline-flex h-14 min-w-36 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base text-primary-foreground transition hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring active:translate-y-px"
            >
              <HugeiconsIcon icon={running ? PauseIcon : PlayIcon} className="size-5" />
              {running ? t("pause") : left < duration && left > 0 ? t("resume") : t("start")}
            </button>
            <button
              type="button"
              onClick={() => pick(duration)}
              className="font-stamp inline-flex h-14 items-center gap-2 rounded-full border-2 border-sheet-line px-5 text-sm transition hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
            >
              <HugeiconsIcon icon={RefreshIcon} className="size-4.5" />
              {t("reset")}
            </button>
          </div>
          <label htmlFor={soundId} className="mt-5 inline-flex items-center gap-2.5 text-sm font-semibold">
            <input
              id={soundId}
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              className="size-5 accent-[var(--primary)]"
            />
            {t("sound")}
          </label>
          <p className="mt-3 min-h-7 text-lg font-bold text-primary" role="status">
            {done ? t("done") : ""}
          </p>
        </div>
      </div>
    </Sheet>
  )
}

// ---------- Personal bests, kept in this browser only ----------

const LIFTS = ["squat", "bench", "deadlift"] as const
type Lift = (typeof LIFTS)[number]
type Entry = { lift: Lift; kg: number; date: string }

const KEY = "azzurra:prs"
const EVENT = "azzurra:prs"
const read = () => {
  try {
    return localStorage.getItem(KEY) ?? "[]"
  } catch {
    return "[]"
  }
}
const write = (entries: Entry[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {}
  window.dispatchEvent(new Event(EVENT))
}
const subscribe = (fn: () => void) => {
  window.addEventListener("storage", fn)
  window.addEventListener(EVENT, fn)
  return () => {
    window.removeEventListener("storage", fn)
    window.removeEventListener(EVENT, fn)
  }
}

/**
 * A lifter's records for the three big lifts, on their own device: no
 * account, nothing sent anywhere. The best of each stands out; the rest is
 * the history, newest first.
 */
export function PersonalBests() {
  const t = useTranslations("tools.prs")
  const locale = useLocale()
  const raw = useSyncExternalStore(subscribe, read, () => "[]")
  const entries = useMemo<Entry[]>(() => {
    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  }, [raw])
  const [lift, setLift] = useState<Lift>("squat")
  const [kg, setKg] = useState("")
  const kgId = useId()

  const best = (l: Lift) => entries.filter((e) => e.lift === l).reduce<Entry | null>((b, e) => (!b || e.kg > b.kg ? e : b), null)
  const history = entries.filter((e) => e.lift === lift).toReversed()
  const day = (d: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`))
  const num = new Intl.NumberFormat(locale)

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const value = Number(kg.replace(",", "."))
    if (!(value > 0 && value < 1000)) return
    write([...entries, { lift, kg: value, date: new Date().toISOString().slice(0, 10) }])
    setKg("")
  }
  const remove = (entry: Entry) => write(entries.filter((e) => e !== entry))

  return (
    <Sheet title={t("title")}>
      <div className="p-5 sm:p-7">
        <ul className="grid grid-cols-3 gap-3">
          {LIFTS.map((l) => {
            const b = best(l)
            return (
              <li key={l} className="rounded-[var(--radius)] border-2 border-sheet-line p-3 sm:p-4">
                <p className="font-stamp text-xs text-foreground/70">{t(`lifts.${l}`)}</p>
                <p className="font-display tabular mt-1 text-[clamp(1.5rem,4vw,2.75rem)] leading-none">
                  {b ? num.format(b.kg) : "—"}
                  {b ? <span className="ml-0.5 text-[0.45em]">kg</span> : null}
                </p>
              </li>
            )
          })}
        </ul>

        <form onSubmit={save} className="mt-7 grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <fieldset>
            <legend className="font-stamp mb-2 text-sm text-foreground/70">{t("lift")}</legend>
            <div role="radiogroup" className="flex flex-wrap gap-2">
              {LIFTS.map((l) => (
                <Choice key={l} selected={lift === l} onClick={() => setLift(l)}>
                  {t(`lifts.${l}`)}
                </Choice>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor={kgId} className="font-stamp mb-2 block text-sm text-foreground/70">
              {t("weight")}
            </label>
            <div className="relative">
              <input
                id={kgId}
                inputMode="decimal"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder="100"
                className="font-display tabular h-12 w-32 rounded-xl border-2 border-sheet-line bg-background pr-10 pl-4 text-2xl outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25"
              />
              <span className="font-stamp pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-foreground/60">kg</span>
            </div>
          </div>
          <button
            type="submit"
            className="font-stamp h-12 rounded-full bg-primary px-6 text-sm text-primary-foreground transition hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring active:translate-y-px"
          >
            {t("save")}
          </button>
        </form>

        <div className="mt-7 border-t border-sheet-line pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-stamp text-sm text-foreground/70">
              {t("history")} · {t(`lifts.${lift}`)}
            </p>
            {entries.length ? (
              <ShareButton
                card={() => ({
                  title: t("title"),
                  rows: LIFTS.flatMap((l) => {
                    const b = best(l)
                    return b ? [`${t(`lifts.${l}`)} · ${num.format(b.kg)} kg`] : []
                  }),
                  name: "palestra-azzurra-record",
                })}
              />
            ) : null}
          </div>
          {history.length ? (
            <ul className="mt-3">
              {history.slice(0, 8).map((e) => (
                <li key={`${e.date}-${e.kg}-${entries.indexOf(e)}`} className="flex items-center justify-between gap-3 border-b border-sheet-line py-2.5 last:border-b-0">
                  <span className="tabular text-base">
                    <strong className="font-bold">{num.format(e.kg)} kg</strong>
                    <span className="ml-3 text-foreground/70">{day(e.date)}</span>
                    {best(lift) === e ? <span className="font-stamp ml-3 text-xs text-primary">{t("best")}</span> : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(e)}
                    aria-label={`${t("remove")} ${num.format(e.kg)} kg`}
                    className="flex size-10 items-center justify-center rounded-full text-foreground/60 transition hover:bg-accent hover:text-destructive focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="size-4.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-base text-foreground/70">{t("empty")}</p>
          )}
          <p className="mt-4 text-sm text-foreground/70">{t("privacy")}</p>
        </div>
      </div>
    </Sheet>
  )
}
