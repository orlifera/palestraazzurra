"use client"

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react"
import { useEffect, useId, useRef } from "react"

import { cn } from "@/lib/utils"

/** Side-view plate geometry. Bumpers (≥10 kg) share the 450 mm diameter, like real ones. */
const PLATE: Record<number, { w: number; h: number; tone: string; ink: string }> = {
  25: { w: 52, h: 200, tone: "var(--primary)", ink: "var(--primary-foreground)" },
  20: { w: 46, h: 200, tone: "var(--primary)", ink: "var(--primary-foreground)" },
  15: { w: 36, h: 200, tone: "var(--foreground)", ink: "var(--background)" },
  10: { w: 26, h: 200, tone: "var(--steel-dark)", ink: "var(--background)" },
  5: { w: 18, h: 124, tone: "var(--steel)", ink: "var(--foreground)" },
  2.5: { w: 14, h: 94, tone: "var(--steel)", ink: "var(--foreground)" },
}

/** The plates the bar can carry, heaviest first. */
export const PLATE_KG = [25, 20, 15, 10, 5, 2.5] as const

const VIEW_W = 1200
const CY = 110
const COLLAR_L = 330
const COLLAR_R = VIEW_W - COLLAR_L
const SLEEVE_END = 70
/** Whether a side's plates, collar outwards, fit on the sleeve as `Side` lays them out. */
export const fitsSleeve = (plates: readonly number[]) =>
  16 + plates.reduce((sum, k) => sum + (PLATE[k] ?? PLATE[5]).w + 3, 0) <= COLLAR_L - SLEEVE_END

type BarbellProps = {
  /** Plate weights for one side, collar outwards. */
  plates: readonly number[]
  /** How many plates per side are on the bar. */
  loaded: number
  /** Lift the bar: whips the ends and raises the whole bar. */
  lifted?: boolean
  /** Stamp weights on the plates. */
  stamped?: boolean
  className?: string
  title?: string
}

export function Barbell({
  plates,
  loaded,
  lifted = false,
  stamped = true,
  className,
  title,
}: BarbellProps) {
  const uid = useId().replace(/:/g, "")
  // `whip` is how far the ends sit below the centre of the shaft.
  const whip = useMotionValue(0)
  const prevLoaded = useRef(loaded)

  useEffect(() => {
    const added = loaded > prevLoaded.current
    prevLoaded.current = loaded
    if (!added) return
    // Plates land: the ends dip slightly and settle, no ringing.
    const t = setTimeout(() => {
      whip.set(3)
      animate(whip, 0, { duration: 0.45, ease: [0.22, 1, 0.36, 1] })
    }, 420)
    return () => clearTimeout(t)
  }, [loaded, whip])

  useEffect(() => {
    if (!lifted) return
    whip.set(6)
    animate(whip, 0, { duration: 0.9, ease: [0.22, 1, 0.36, 1] })
  }, [lifted, whip])

  const shaft = useTransform(
    whip,
    (e) =>
      `M ${COLLAR_L} ${CY + e} Q ${VIEW_W / 2} ${CY - e * 0.6} ${COLLAR_R} ${CY + e}`
  )
  const endY = useTransform(whip, (e) => e)

  return (
    <motion.svg
      viewBox={`0 0 ${VIEW_W} 220`}
      className={cn("block h-auto w-full overflow-visible", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      animate={{ y: lifted ? -12 : 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <pattern
          id={`knurl-${uid}`}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="6" height="6" fill="var(--steel)" />
          <path d="M0 0H6M0 0V6" stroke="var(--steel-dark)" strokeWidth="1.4" />
        </pattern>
      </defs>

      <motion.path
        d={shaft}
        stroke={`url(#knurl-${uid})`}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />

      <Side
        side="left"
        plates={plates}
        loaded={loaded}
        stamped={stamped}
        endY={endY}
      />
      <Side
        side="right"
        plates={plates}
        loaded={loaded}
        stamped={stamped}
        endY={endY}
      />
    </motion.svg>
  )
}

function Side({
  side,
  plates,
  loaded,
  stamped,
  endY,
}: {
  side: "left" | "right"
  plates: readonly number[]
  loaded: number
  stamped: boolean
  endY: MotionValue<number>
}) {
  const dir = side === "left" ? -1 : 1
  const collar = side === "left" ? COLLAR_L : COLLAR_R
  const sleeveEnd = side === "left" ? SLEEVE_END : VIEW_W - SLEEVE_END

  const placed = plates.map((kg, i) => {
    const p = PLATE[kg] ?? PLATE[5]
    // Distance from the collar to this plate's inner face.
    const offset =
      16 +
      plates
        .slice(0, i)
        .reduce((sum, k) => sum + (PLATE[k] ?? PLATE[5]).w + 3, 0)
    const x = dir === -1 ? collar - offset - p.w : collar + offset
    return { kg, i, x, ...p }
  })

  return (
    <motion.g style={{ y: endY }}>
      {/* Sleeve */}
      <rect
        x={Math.min(collar, sleeveEnd)}
        y={CY - 11}
        width={Math.abs(sleeveEnd - collar)}
        height={22}
        rx={4}
        fill="var(--steel)"
      />
      {/* Collar */}
      <rect
        x={collar - 8}
        y={CY - 22}
        width={16}
        height={44}
        rx={4}
        fill="var(--steel-dark)"
      />
      {placed.map((p) => {
        const on = p.i < loaded
        return (
          <motion.g
            key={p.i}
            initial={false}
            animate={{
              x: on ? 0 : dir * 260,
              opacity: on ? 1 : 0,
            }}
            transition={{
              x: on
                ? { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                : { duration: 0.35, ease: [0.64, 0, 0.78, 0] },
              opacity: { duration: on ? 0.2 : 0.3, delay: on ? 0 : 0.05 },
            }}
          >
            <rect
              x={p.x}
              y={CY - p.h / 2}
              width={p.w}
              height={p.h}
              rx={Math.min(10, p.w / 2.5)}
              fill={p.tone}
            />
            {/* Rim highlight */}
            <rect
              x={p.x + (dir === -1 ? 3 : p.w - 6)}
              y={CY - p.h / 2 + 10}
              width={3}
              height={p.h - 20}
              rx={1.5}
              fill="var(--background)"
              opacity={0.18}
            />
            {stamped && p.h >= 200 ? (
              <text
                x={p.x + p.w / 2}
                y={CY}
                fill={p.ink}
                fontSize={p.w > 30 ? 20 : 15}
                fontWeight={800}
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(-90 ${p.x + p.w / 2} ${CY})`}
                style={{ letterSpacing: "0.08em" }}
              >
                {p.kg} KG
              </text>
            ) : null}
          </motion.g>
        )
      })}
    </motion.g>
  )
}

/** Compact plate geometry for the header rail, tuned to read at ~30px tall. */
const RAIL: Record<number, { w: number; h: number; fill: string }> = {
  20: { w: 10, h: 56, fill: "var(--primary)" },
  15: { w: 8, h: 56, fill: "var(--foreground)" },
  10: { w: 6, h: 56, fill: "var(--steel-dark)" },
  5: { w: 5, h: 38, fill: "var(--steel-dark)" },
  2.5: { w: 4, h: 28, fill: "var(--steel-dark)" },
}
const RAIL_W = 300
const RAIL_CY = 32
const RAIL_COLLAR = 74

/**
 * Header progress bar drawn as a loaded barbell. Plates still to come show as
 * faint outlines; each section passed fills in one pair.
 */
export function RailBarbell({
  plates,
  loaded,
  className,
}: {
  plates: readonly number[]
  loaded: number
  className?: string
}) {
  return (
    <svg
      viewBox={`0 0 ${RAIL_W} 64`}
      className={cn("block h-auto overflow-visible", className)}
      aria-hidden
    >
      {/* Sleeves */}
      <rect x={4} y={RAIL_CY - 4} width={RAIL_COLLAR - 4} height={8} rx={2} fill="var(--steel)" />
      <rect x={RAIL_W - RAIL_COLLAR} y={RAIL_CY - 4} width={RAIL_COLLAR - 4} height={8} rx={2} fill="var(--steel)" />
      {/* Shaft */}
      <rect
        x={RAIL_COLLAR}
        y={RAIL_CY - 2.5}
        width={RAIL_W - RAIL_COLLAR * 2}
        height={5}
        rx={2.5}
        fill="var(--steel-dark)"
      />
      {/* Collars */}
      <rect x={RAIL_COLLAR - 3} y={RAIL_CY - 8} width={6} height={16} rx={1.5} fill="var(--foreground)" />
      <rect x={RAIL_W - RAIL_COLLAR - 3} y={RAIL_CY - 8} width={6} height={16} rx={1.5} fill="var(--foreground)" />

      {(["left", "right"] as const).map((side) => {
        const dir = side === "left" ? -1 : 1
        const collar = side === "left" ? RAIL_COLLAR : RAIL_W - RAIL_COLLAR
        return plates.map((kg, i) => {
          const p = RAIL[kg] ?? RAIL[5]
          const offset =
            5 + plates.slice(0, i).reduce((sum, k) => sum + (RAIL[k] ?? RAIL[5]).w + 1.5, 0)
          const x = dir === -1 ? collar - offset - p.w : collar + offset
          const on = i < loaded
          return (
            <g key={`${side}-${i}`}>
              <rect
                x={x + 0.5}
                y={RAIL_CY - p.h / 2 + 0.5}
                width={p.w - 1}
                height={p.h - 1}
                rx={2}
                fill="none"
                stroke="var(--foreground)"
                strokeOpacity={0.18}
              />
              <motion.rect
                x={x}
                y={RAIL_CY - p.h / 2}
                width={p.w}
                height={p.h}
                rx={2}
                fill={p.fill}
                initial={false}
                animate={{ opacity: on ? 1 : 0, x: on ? 0 : dir * 10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </g>
          )
        })
      })}
    </svg>
  )
}
