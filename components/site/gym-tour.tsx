"use client"

import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { GymPlan, zoneCentre, zoneFloor } from "@/components/iso/gym-plan"
import { OpenStatus } from "@/components/site/open-status"
import { tourZones } from "@/data/site"
import { cn } from "@/lib/utils"

type ZoneId = (typeof tourZones)[number]["id"]

/**
 * The plan behind the site, brought forward as a map: tap a room (or its
 * name, for keyboards and screen readers) to see it, with its photo where
 * the gym has one.
 */
export function GymTour() {
  const t = useTranslations("tour")
  const [active, setActive] = useState<ZoneId>("weights")
  const zone = tourZones.find((z) => z.id === active)!

  return (
    <div className="grid gap-8">
      <div>
        <div className="mx-auto max-w-md rounded-[var(--radius)] border-2 border-foreground bg-background p-4 sm:p-6">
          <GymPlan planClassName="opacity-70">
            {tourZones.map((z, i) => {
              const on = z.id === active
              const [cx, cy] = zoneCentre(z.zone)
              return (
                <g
                  key={z.id}
                  className="cursor-pointer"
                  onClick={() => setActive(z.id)}
                >
                  <polygon
                    points={zoneFloor(z.zone)}
                    className={cn(
                      "stroke-primary transition-[fill-opacity] duration-300",
                      on
                        ? "fill-primary/20"
                        : "fill-primary/0 hover:fill-primary/10"
                    )}
                    strokeWidth={on ? 2 : 0}
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={on ? 40 : 32}
                    className={cn(
                      "transition-all duration-300",
                      on ? "fill-primary" : "fill-foreground"
                    )}
                  />
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none fill-background font-sans text-[34px] font-bold"
                  >
                    {i + 1}
                  </text>
                </g>
              )
            })}
          </GymPlan>
        </div>
      </div>

      <div>
        <div
          role="tablist"
          aria-label={t("title")}
          className="flex flex-wrap gap-2"
        >
          {tourZones.map((z, i) => (
            <button
              key={z.id}
              type="button"
              role="tab"
              id={`tour-tab-${z.id}`}
              aria-selected={z.id === active}
              aria-controls="tour-panel"
              onClick={() => setActive(z.id)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring",
                z.id === active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-sheet-line hover:border-primary"
              )}
            >
              <span className="font-stamp text-xs tabular opacity-80">
                {i + 1}
              </span>
              {t(`zones.${z.id}.name`)}
            </button>
          ))}
        </div>

        <div
          id="tour-panel"
          role="tabpanel"
          aria-labelledby={`tour-tab-${active}`}
          className="mt-6"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {zone.photo ? (
                <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius)] bg-muted">
                  <Image
                    src={zone.photo}
                    alt={t(`zones.${active}.name`)}
                    fill
                    sizes="(min-width: 640px) 40rem, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <h3 className="mt-6 font-display text-[clamp(2rem,5vw,3.25rem)]">
                {t(`zones.${active}.name`)}
              </h3>
              <p className="mt-3 max-w-[48ch] text-lg leading-relaxed">
                {t(`zones.${active}.body`)}
              </p>
              {active === "entrance" ? (
                <OpenStatus className="mt-4 text-base" />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
