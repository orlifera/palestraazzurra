/**
 * The weights floor as an isometric diorama: a lifting platform with an
 * empty bar on it and a lifter behind it. The plates go on, inner first,
 * one sleeve then the other; the tally reads 80 KG; the lifter sets up and
 * pulls two deadlifts, sets the bar down and stands; the bar is stripped,
 * and the loop starts over. Around the platform, the rest of the floor:
 * plates stacked flat, a bench, the dumbbell rack, two kettlebells.
 *
 * SVG with SMIL, no JavaScript (components/iso/kit.tsx). Reduced motion
 * gets a still frame: the loaded bar at lockout.
 *
 * Decorative: aria-hidden.
 */

import {
  barbell,
  Barbell,
  Blink,
  box,
  Faces,
  iso,
  Kettlebell,
  PALETTES,
  Person,
  poly,
  puck,
  STANDING,
  Track,
  viewBoxOf,
  type IsoTone,
  type PlateTone,
  type Pose,
} from "@/components/iso/kit"
import { cn } from "@/lib/utils"

/** One loop of the scene, seconds. */
const LOOP = 12

// ---------- The world ----------
// The platform sits in the middle of the floor, its long side along y; the
// lifter faces +y (towards the lower left) with the bar along x in front.

const FLOOR = box(-0.4, -0.4, -0.3, 6.6, 5, 0.3)
const PLATFORM = box(1.1, 0.9, 0, 3.2, 2.6, 0.06)
const TOP = 0.06
const STRIP = poly([
  iso(2, 0.9, TOP),
  iso(3.4, 0.9, TOP),
  iso(3.4, 3.5, TOP),
  iso(2, 3.5, TOP),
])

const LIFTER = { x: 2.7, y: 1.95 }
/** The bar over the lifter's midfoot, plates on the platform. */
const BAR = { y: LIFTER.y + 0.18, floor: TOP + 0.3, lift: 0.55 }
const BAR_SHAPE = barbell(LIFTER.x, BAR.y, BAR.floor, { load: [20, 10] })

/** Hips back, shoulders over the bar, hands on it. */
const SETUP: Pose = {
  foot: [0, 0],
  knee: [0.22, 0.4],
  hip: [-0.2, 0.6],
  shoulder: [0.22, 0.92],
  head: [0.36, 1.04],
  hand: [0.18, BAR.floor - TOP],
}
const LOCKOUT: Pose = {
  ...STANDING,
  shoulder: [-0.02, 1.42],
  head: [0, 1.62],
  hand: [0.18, BAR.floor - TOP + BAR.lift],
}

// Loading takes the first third of the loop, two reps the rest.
const LIFT = {
  at: [0, 0.34, 0.42, 0.47, 0.56, 0.62, 0.7, 0.73, 0.81, 0.86, 0.93, 0.97, 1],
  poses: [
    STANDING,
    STANDING,
    SETUP,
    SETUP,
    LOCKOUT,
    LOCKOUT,
    SETUP,
    SETUP,
    LOCKOUT,
    LOCKOUT,
    SETUP,
    STANDING,
    STANDING,
  ],
}
const BAR_TRACK = LIFT.poses.map(
  (p) => [0, 0, p === LOCKOUT ? BAR.lift : 0] as [number, number, number]
)

/** When each plate slides on, by side and by place from the inside. */
const SLIDES = {
  far: [
    [0.04, 0.12],
    [0.15, 0.23],
  ],
  near: [
    [0.09, 0.17],
    [0.2, 0.28],
  ],
} as const
const STRIPPED = 0.94
const SLIDE_FROM = 0.7

// The rest of the floor.
const STACK = [0, 1, 2].map(
  (i) =>
    ({
      ...puck(0.35, 0.35, i * 0.07, 0.3, 0.07),
      tone: i === 2 ? "azure" : "iron",
    }) as const
)
const BENCH = {
  frame: box(0.35, 1.25, 0, 0.3, 1.3, 0.36),
  pad: box(0.3, 1.2, 0.36, 0.4, 1.4, 0.08),
}
const RACK = box(4.85, 0, 0, 0.55, 2.7, 0.42)
const DUMBBELLS = [0.25, 0.75, 1.25, 1.75, 2.25].map((y) =>
  barbell(5.12, y, 0.51, {
    half: 0.24,
    collar: 0.1,
    load: ["db", "db"],
    d: 0.02,
  })
)
const KETTLEBELLS: { x: number; y: number; tone: PlateTone }[] = [
  { x: 0.3, y: 3.5, tone: "iron" },
  { x: 0.8, y: 3.9, tone: "azure" },
]
/** The tally floats over the dumbbell rack, clear of the lift. */
const TAG = iso(4.9, 1.2, 1.6)

const VIEW = viewBoxOf(
  [
    iso(-0.4, -0.4, 0),
    iso(6.2, -0.4, 0),
    iso(6.2, 4.6, -0.3),
    iso(-0.4, 4.6, -0.3),
    iso(LIFTER.x, LIFTER.y, 1.9),
    [TAG[0], TAG[1] - 10],
  ],
  10
)

function Tally() {
  return (
    <g>
      <rect
        x={TAG[0] - 18}
        y={TAG[1] - 7}
        width={36}
        height={14}
        rx={7}
        className="fill-primary"
      />
      <text
        x={TAG[0]}
        y={TAG[1] + 3.2}
        textAnchor="middle"
        className="fill-primary-foreground font-stamp text-[8.5px]"
      >
        80 KG
      </text>
    </g>
  )
}

export function IsoPlatformScene({
  tone = "plain",
  className,
}: {
  tone?: IsoTone
  className?: string
}) {
  const pal = PALETTES[tone]
  const lift = { dur: LOOP, at: LIFT.at }

  return (
    <svg
      viewBox={VIEW}
      className={cn("h-auto w-full overflow-visible", className)}
      aria-hidden
      focusable="false"
    >
      <Faces b={FLOOR} fills={pal.floor} />

      {STACK.map((s, i) => (
        <g key={i}>
          <path d={s.side} className={pal.plate[s.tone][1]} />
          <ellipse {...s.top} className={pal.plate[s.tone][0]} />
        </g>
      ))}
      <Faces b={BENCH.frame} fills={pal.steel} />
      <Faces b={BENCH.pad} fills={pal.mat} />
      <Faces b={RACK} fills={pal.steel} />
      {DUMBBELLS.map((d, i) => (
        <Barbell key={i} b={d} pal={pal} />
      ))}

      <Faces b={PLATFORM} fills={pal.mat} />
      <polygon points={STRIP} className={pal.strip} />

      {/* Still frame: the loaded bar at lockout. */}
      <g className="motion-safe:hidden">
        <Person
          x={LIFTER.x}
          y={LIFTER.y}
          z={TOP}
          poses={[LOCKOUT]}
          grip={0.3}
          shirt="stroke-primary"
          pal={pal}
        />
        <Track
          clock={{ dur: 1, at: [0, 1] }}
          by={[
            [0, 0, BAR.lift],
            [0, 0, BAR.lift],
          ]}
        >
          <Barbell b={BAR_SHAPE} pal={pal} />
        </Track>
        <Tally />
      </g>

      <g className="motion-reduce:hidden">
        <Person
          x={LIFTER.x}
          y={LIFTER.y}
          z={TOP}
          poses={LIFT.poses}
          clock={lift}
          grip={0.3}
          shirt="stroke-primary"
          pal={pal}
        />
        <Track clock={lift} by={BAR_TRACK}>
          <Barbell
            b={BAR_SHAPE}
            pal={pal}
            wrap={(side, inner, node) => {
              const [on, done] = SLIDES[side][inner]
              const d = side === "far" ? -SLIDE_FROM : SLIDE_FROM
              return (
                <Blink dur={LOOP} on={on} off={STRIPPED}>
                  <Track
                    clock={{ dur: LOOP, at: [0, on, done, 1] }}
                    by={[
                      [d, 0, 0],
                      [d, 0, 0],
                      [0, 0, 0],
                      [0, 0, 0],
                    ]}
                  >
                    {node}
                  </Track>
                </Blink>
              )
            }}
          />
        </Track>
        <Blink dur={LOOP} on={0.3} off={STRIPPED}>
          <Tally />
        </Blink>
      </g>

      {KETTLEBELLS.map((k, i) => (
        <Kettlebell key={i} {...k} pal={pal} />
      ))}
    </svg>
  )
}
