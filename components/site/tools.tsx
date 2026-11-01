"use client"

import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import { useId, useState } from "react"

import { Barbell, fitsSleeve, PLATE_KG } from "@/components/motion/barbell"
import { Reveal } from "@/components/motion/reveal"
import { Choice, Sheet } from "@/components/site/sheet"

const BARS = [20, 15, 10] as const

/** Plates for one side, heaviest first, as close to `perSide` as fit on the sleeve. */
function platesFor(perSide: number) {
  const plates: number[] = []
  let left = perSide
  for (const kg of PLATE_KG) {
    while (left >= kg && fitsSleeve([...plates, kg])) {
      plates.push(kg)
      left -= kg
    }
  }
  return plates
}

/** Epley's estimate of a one-rep max. */
const epley = (kg: number, reps: number) => (reps <= 1 ? kg : kg * (1 + reps / 30))
const round = (kg: number, to = 2.5) => Math.round(kg / to) * to
/** Percentages of the max with the reps they usually allow: a guide, not a rule. */
const PERCENTS = [
  [100, "1"],
  [95, "2"],
  [90, "3–4"],
  [85, "5–6"],
  [80, "7–8"],
  [75, "9–10"],
  [70, "11–12"],
  [65, "13–15"],
  [60, "16–20"],
] as const

/** For the young lifters: the plate maths and the percentages, on two schede. */
export function Tools() {
  const t = useTranslations("tools")

  return (
    <section
      id="strumenti"
      aria-labelledby="strumenti-title"
      className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-36"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 id="strumenti-title" className="font-display text-[clamp(3.4rem,6.2vw,6.25rem)] text-balance">
              {t("title")}
            </h2>
            <p className="font-stamp mt-6 text-xl text-balance text-primary sm:text-2xl">{t("lead")}</p>
          </div>
        </Reveal>
        <div className="grid gap-10 lg:col-span-8">
          <Reveal>
            <PlateCalculator />
          </Reveal>
          <Reveal delay={0.05}>
            <OneRepMax />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function PlateCalculator() {
  const t = useTranslations("tools.plates")
  const num = new Intl.NumberFormat(useLocale())
  const [target, setTarget] = useState(100)
  const [bar, setBar] = useState<(typeof BARS)[number]>(20)
  const id = useId()

  const plates = platesFor(Math.max(0, (target - bar) / 2))
  const loaded = bar + 2 * plates.reduce((a, b) => a + b, 0)
  // The sleeve is full when the next smallest plate wouldn't go on.
  const full = loaded < target && !fitsSleeve([...plates, 2.5])
  const set = (kg: number) => setTarget(Math.min(400, Math.max(bar, round(kg))))

  // Each plate weight with how many go on a side, heaviest first.
  const counts = PLATE_KG.map((kg) => [kg, plates.filter((p) => p === kg).length] as const).filter(([, n]) => n)

  return (
    <Sheet title={t("title")}>
      <div className="grid gap-8 p-5 sm:p-7">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-end">
          <div>
            <label htmlFor={id} className="font-stamp mb-2 block text-sm text-foreground/70">
              {t("target")}
            </label>
            <div className="flex items-center gap-2">
              <Step label="−5 kg" icon={MinusSignIcon} onClick={() => set(target - 5)} />
              <div className="relative">
                <input
                  id={id}
                  type="number"
                  inputMode="decimal"
                  min={bar}
                  max={400}
                  step={2.5}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value) || 0)}
                  onBlur={() => set(target)}
                  className="font-display tabular h-14 w-32 rounded-xl border-2 border-sheet-line bg-background pr-10 pl-4 text-3xl outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25"
                />
                <span className="font-stamp pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-foreground/60">kg</span>
              </div>
              <Step label="+5 kg" icon={PlusSignIcon} onClick={() => set(target + 5)} />
            </div>
          </div>
          <fieldset>
            <legend className="font-stamp mb-2 text-sm text-foreground/70">{t("bar")}</legend>
            <div role="radiogroup" className="flex flex-wrap gap-2">
              {BARS.map((b) => (
                <Choice
                  key={b}
                  selected={bar === b}
                  onClick={() => {
                    setBar(b)
                    setTarget((v) => Math.max(v, b))
                  }}
                >
                  <span className="tabular">{b} kg</span>
                </Choice>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="-mx-2 sm:mx-0">
          <Barbell
            plates={plates}
            loaded={plates.length}
            title={t("barbell", { plates: plates.length ? plates.join(" + ") + " kg" : "0 kg" })}
          />
        </div>

        <div className="grid gap-4 border-t border-sheet-line pt-6 sm:grid-cols-[1fr_auto] sm:items-baseline">
          <div>
            <p className="font-stamp text-sm text-foreground/70">{t("perSide")}</p>
            <p className="font-display tabular mt-1 text-[clamp(1.8rem,3.6vw,2.75rem)] leading-none">
              {counts.length
                ? counts.map(([kg, n]) => `${n > 1 ? `${n} × ` : ""}${num.format(kg)}`).join("  +  ")
                : "—"}
            </p>
          </div>
          <p className="text-base font-semibold sm:text-right" aria-live="polite">
            {!plates.length
              ? t("barOnly")
              : full
                ? t("full", { kg: loaded })
                : loaded !== target
                  ? t("closest", { kg: loaded })
                  : t("loaded", { kg: loaded })}
          </p>
        </div>
      </div>
    </Sheet>
  )
}

function OneRepMax() {
  const t = useTranslations("tools.orm")
  const [kg, setKg] = useState(80)
  const [reps, setReps] = useState(5)
  const max = epley(kg, reps)
  const kgId = useId()
  const repsId = useId()

  return (
    <Sheet title={t("title")}>
      <div className="grid gap-8 p-5 sm:grid-cols-[1fr_1.2fr] sm:p-7">
        <div className="space-y-6">
          <Field id={kgId} label={t("weight")} value={kg} unit="kg" step={2.5} min={1} max={500} onChange={setKg} />
          <Field id={repsId} label={t("reps")} value={reps} step={1} min={1} max={12} onChange={setReps} />
          <div className="border-t-2 border-foreground pt-4">
            <p className="font-stamp text-sm text-foreground/70">{t("result")}</p>
            <p className="font-display tabular mt-1 text-[clamp(3rem,7vw,5rem)] leading-none text-primary" aria-live="polite">
              {round(max)}
              <span className="ml-1 text-[0.4em] text-foreground">kg</span>
            </p>
          </div>
          <p className="text-sm leading-relaxed text-foreground/70">{t("note")}</p>
        </div>

        <table className="w-full self-start text-left">
          <thead>
            <tr className="font-stamp border-b-2 border-foreground text-xs text-foreground/70">
              <th scope="col" className="py-2 font-bold">{t("pct")}</th>
              <th scope="col" className="py-2 font-bold">{t("load")}</th>
              <th scope="col" className="py-2 text-right font-bold">{t("repsCol")}</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {PERCENTS.map(([pct, r]) => (
              <tr key={pct} className="border-b border-sheet-line last:border-b-0">
                <td className="py-2.5 font-semibold text-foreground/70">{pct}%</td>
                <td className="font-display py-2.5 text-2xl leading-none">{round((max * pct) / 100)} kg</td>
                <td className="py-2.5 text-right">{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Sheet>
  )
}

function Field({
  id,
  label,
  value,
  unit,
  step,
  min,
  max,
  onChange,
}: {
  id: string
  label: string
  value: number
  unit?: string
  step: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  return (
    <div>
      <label htmlFor={id} className="font-stamp mb-2 block text-sm text-foreground/70">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Step label={`−${step}`} icon={MinusSignIcon} onClick={() => onChange(clamp(value - step))} />
        <div className="relative">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            onBlur={() => onChange(clamp(value))}
            className="font-display tabular h-14 w-28 rounded-xl border-2 border-sheet-line bg-background pr-9 pl-4 text-3xl outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25"
          />
          {unit ? (
            <span className="font-stamp pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-foreground/60">{unit}</span>
          ) : null}
        </div>
        <Step label={`+${step}`} icon={PlusSignIcon} onClick={() => onChange(clamp(value + step))} />
      </div>
    </div>
  )
}

function Step({ label, icon, onClick }: { label: string; icon: typeof PlusSignIcon; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-12 items-center justify-center rounded-full border-2 border-sheet-line transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring active:translate-y-px"
    >
      <HugeiconsIcon icon={icon} className="size-5" />
    </button>
  )
}
