/**
 * Palestra Azzurra as one isometric plan, drawn behind the whole site
 * (components/motion/plan-backdrop.tsx): eight zones in the order of the
 * page, stepping down the screen in a zigzag. The entrance, the weights
 * floor, the dumbbells, the class floor, Azzurra Lab, the cardio row, the
 * street and the sea.
 *
 * An aisle runs through every zone, a staircase of segments along x and y,
 * kept clear of equipment. The backdrop walks a member down it as the page
 * scrolls, stepping off at the deadlift platform, the bench and the Lab's
 * squat rack (`Station`) to lift their bars.
 *
 * Static SVG in the `drawing` tone (components/iso/kit.tsx). The walker is
 * passed in as children and drawn last. Decorative: aria-hidden.
 */

import {
  barbell,
  Barbell,
  box,
  Faces,
  iso,
  Kettlebell,
  PALETTES,
  plate,
  Plate,
  poly,
  puck,
  S,
  Trees,
  viewBoxOf,
  type Palette,
} from "@/components/iso/kit"
import { cn } from "@/lib/utils"

// ---------- The layout ----------
// Zone i is a 10 × 10 square; each one steps from the last along y, then x,
// alternately, so the plan zigzags down the screen.

const ZONE = 10
const ORIGINS = [
  [0, 0],
  [0, 10],
  [10, 10],
  [10, 20],
  [20, 20],
  [20, 30],
  [30, 30],
  [30, 40],
] as const

/** A box in zone-local coordinates. */
const at =
  (z: number) =>
  (x: number, y: number, h0: number, w: number, d: number, h: number) =>
    box(ORIGINS[z][0] + x, ORIGINS[z][1] + y, h0, w, d, h)
const pt = (z: number, x: number, y: number, h = 0) =>
  iso(ORIGINS[z][0] + x, ORIGINS[z][1] + y, h)
const bar = (
  z: number,
  x: number,
  y: number,
  h: number,
  opts: Parameters<typeof barbell>[3]
) => barbell(ORIGINS[z][0] + x, ORIGINS[z][1] + y, h, opts)
const dumbbell = (z: number, x: number, y: number, h: number) =>
  bar(z, x, y, h, { half: 0.24, collar: 0.1, load: ["db", "db"], d: 0.02 })
const slab = (z: number, depth = ZONE) => at(z)(0, 0, -0.3, ZONE, depth, 0.3)

/** A zone's floor, as polygon points, and its centre on screen: for pointing at a room. */
export const zoneFloor = (z: number) =>
  poly([pt(z, 0, 0), pt(z, ZONE, 0), pt(z, ZONE, ZONE), pt(z, 0, ZONE)])
export const zoneCentre = (z: number) => pt(z, ZONE / 2, ZONE / 2)

// ---------- 0 · Ingresso ----------
const Z0 = at(0)
const ENTRANCE = {
  wallBack: Z0(0, -0.25, 0, ZONE, 0.25, 2.4),
  wallLeft: Z0(-0.25, -0.25, 0, 0.25, ZONE + 0.25, 2.4),
  door: poly([
    pt(0, 6.3, 0, 0),
    pt(0, 7.7, 0, 0),
    pt(0, 7.7, 0, 2),
    pt(0, 6.3, 0, 2),
  ]),
  lockers: Z0(0.6, 0, 0, 4.8, 0.6, 1.9),
  seams: [1.4, 2.2, 3, 3.8, 4.6].map(
    (x) => [pt(0, x, 0.6, 0.1), pt(0, x, 0.6, 1.8)] as const
  ),
  desk: Z0(8.2, 2.5, 0, 1.3, 3.2, 1.05),
  deskTop: Z0(8.05, 2.35, 1.05, 1.6, 3.5, 0.07),
  bench: Z0(1.6, 4.4, 0, 3, 0.5, 0.45),
  /** The name on the left wall (the plane x = 0), read from front to back. */
  lettering: { at: pt(0, 0, 8.6, 1.15), length: 7.4 * S },
  logo: plate(ORIGINS[0][0], ORIGINS[0][1] + 9.35, 1.45, 0.42, 0.05),
}

// ---------- 1 · Pesi ----------
const Z1 = at(1)
const WEIGHTS = {
  platform: Z1(0.8, 0.8, 0, 4.4, 3, 0.06),
  strip: poly([
    pt(1, 2.3, 0.8, 0.061),
    pt(1, 3.7, 0.8, 0.061),
    pt(1, 3.7, 3.8, 0.061),
    pt(1, 2.3, 3.8, 0.061),
  ]),
  deadlift: bar(1, 3, 2.3, 0.36, { load: [20, 20] }),
  stack: [0, 1, 2, 3].map(
    (i) =>
      ({
        ...puck(ORIGINS[1][0] + 5.9, ORIGINS[1][1] + 1.2, i * 0.08, 0.3, 0.08),
        tone: i % 2 ? "azure" : "iron",
      }) as const
  ),
  // The bar racks over the lifter's shoulders, the bench runs on towards +y.
  benchUprights: [2.4, 3.6].map((x) => Z1(x - 0.04, 5.56, 0, 0.08, 0.08, 1.15)),
  bench: Z1(2.8, 5.2, 0, 0.4, 2, 0.45),
  benchPress: bar(1, 3, 5.6, 1.2, { load: [20] }),
}

// ---------- 2 · Manubri ----------
const Z2 = at(2)
const DUMBBELL_ROW = [0.9, 1.6, 2.3, 3, 3.7, 4.4, 5.1]
const DUMBBELLS = {
  racks: [Z2(0.55, 0.5, 0, 0.5, 5.2, 0.42), Z2(8.55, 0.5, 0, 0.5, 5.2, 0.42)],
  bells: [0.8, 8.8].flatMap((x) =>
    DUMBBELL_ROW.map((y) => dumbbell(2, x, y, 0.51))
  ),
  benches: [3, 5.6].map((x) => Z2(x, 2, 0, 0.45, 1.8, 0.45)),
  kettlebells: [3, 3.6, 4.2, 4.8, 5.4].map(
    (x, i) =>
      ({
        x: ORIGINS[2][0] + x,
        y: ORIGINS[2][1] + 5.2,
        tone: i === 2 ? "azure" : "iron",
      }) as const
  ),
}

// ---------- 3 · Corsi ----------
const Z3 = at(3)
const CLASSES = {
  mats: [0, 1, 2].flatMap((r) =>
    [0, 1, 2].map((c) => Z3(0.6 + c * 2, 0.6 + r * 2.1, 0, 1.5, 1.8, 0.04))
  ),
  steps: [
    Z3(0.85, 1.1, 0.04, 1, 0.5, 0.2),
    Z3(2.85, 3.2, 0.04, 1, 0.5, 0.2),
    Z3(4.85, 5.3, 0.04, 1, 0.5, 0.2),
  ],
  balls: [
    [8.6, 1.4],
    [9.1, 2.9],
    [8.6, 4.4],
  ].map(([x, y]) => pt(3, x, y, 0.33)),
}

// ---------- 4 · Azzurra Lab ----------
const Z4 = at(4)
const RACK = { x: [2.4, 3.6], y: [2.6, 3.4], h: 2.3 }
const LAB = {
  wall: Z4(0, -0.2, 0, ZONE, 0.2, 1.8),
  /** On the low wall's front (the plane y = 0), read along x. */
  lettering: { at: pt(4, 0.6, 0, 0.55), length: 5.2 * S },
  mats: Z4(0.6, 0.8, 0, 6, 5.4, 0.04),
  backPosts: RACK.x.map((x) =>
    Z4(x - 0.04, RACK.y[0] - 0.04, 0, 0.08, 0.08, RACK.h)
  ),
  frontPosts: RACK.x.map((x) =>
    Z4(x - 0.04, RACK.y[1] - 0.04, 0, 0.08, 0.08, RACK.h)
  ),
  top: [
    Z4(RACK.x[0] - 0.04, RACK.y[0] - 0.04, RACK.h - 0.08, 1.28, 0.08, 0.08),
    ...RACK.x.map((x) =>
      Z4(x - 0.04, RACK.y[0] - 0.04, RACK.h - 0.08, 0.08, 0.88, 0.08)
    ),
    Z4(RACK.x[0] - 0.04, RACK.y[1] - 0.04, RACK.h - 0.08, 1.28, 0.08, 0.08),
  ],
  squat: bar(4, 3, 3, 1.46, { collar: 0.7, half: 1.15, load: [20, 10] }),
  rack: Z4(8.55, 1, 0, 0.5, 4.6, 0.42),
  bells: [1.4, 2.1, 2.8, 3.5, 4.2, 4.9].map((y) => dumbbell(4, 8.8, y, 0.51)),
  kettlebells: [1.2, 1.8, 2.4].map(
    (x) =>
      ({ x: ORIGINS[4][0] + x, y: ORIGINS[4][1] + 5.6, tone: "iron" }) as const
  ),
}

// ---------- 5 · Cardio ----------
const Z5 = at(5)
const CARDIO = {
  treadmills: [0.8, 2.3, 3.8, 5.3].map((x) => ({
    deck: Z5(x, 1, 0, 0.9, 2.2, 0.22),
    posts: [
      Z5(x + 0.05, 3.05, 0, 0.08, 0.08, 1.25),
      Z5(x + 0.77, 3.05, 0, 0.08, 0.08, 1.25),
    ],
    console: Z5(x, 2.95, 1.2, 0.9, 0.28, 0.32),
  })),
  bikes: [1.2, 2.7, 4.2].map((x) => ({
    base: Z5(x, 5, 0, 0.4, 1.3, 0.1),
    post: Z5(x + 0.15, 5.15, 0.1, 0.1, 0.1, 0.8),
    seat: Z5(x + 0.05, 5.05, 0.9, 0.3, 0.42, 0.08),
    stem: Z5(x + 0.15, 6.05, 0.1, 0.1, 0.1, 1),
    bars: Z5(x - 0.05, 5.95, 1.1, 0.5, 0.2, 0.06),
  })),
  water: Z5(8.6, 1.2, 0, 0.5, 0.5, 1.1),
}

// ---------- 6 · Fuori ----------
const Z6 = at(6)
const STREET = {
  pavement: Z6(0, 0, 0, ZONE, 7.9, 0.06),
  road: Z6(0, 8, 0, ZONE, 1.7, 0.03),
  dashes: [pt(6, 0.2, 8.85, 0.04), pt(6, 9.8, 8.85, 0.04)] as const,
  bench: Z6(1.2, 5.2, 0.06, 2.4, 0.5, 0.4),
  trees: (
    [
      [2, 1.8],
      [4.5, 1.2],
      [9, 3],
      [4.4, 4.6],
    ] as const
  ).map(([x, y]) => [ORIGINS[6][0] + x, ORIGINS[6][1] + y] as const),
}

// ---------- 7 · Mare ----------
const SHORE = 6
const SEA_ZONE = {
  sand: at(7)(0, 0, -0.3, ZONE, SHORE, 0.3),
  sea: at(7)(0, SHORE, -0.45, ZONE, 4, 0.38),
  waves: [7, 8, 9].map(
    (y) => [pt(7, 0.4, y, -0.07), pt(7, 9.6, y, -0.07)] as const
  ),
  umbrellas: (
    [
      [2, 1.8],
      [4.5, 1],
      [2.6, 4.2],
      [9, 2.4],
      [5, 3.6],
    ] as const
  ).map(([x, y]) => {
    const rim = pt(7, x, y, 1.05)
    const r = 0.55 * S * Math.SQRT2
    return {
      foot: pt(7, x, y, 0),
      canopy: `M${rim[0] - r} ${rim[1]}A${r} ${r / 2} 0 0 0 ${rim[0] + r} ${rim[1]}L${pt(7, x, y, 1.35).join(" ")}Z`,
      rim,
    }
  }),
}

export const PLAN_VIEW = viewBoxOf(
  ORIGINS.flatMap(([x, y]) => [
    iso(x, y, 2.4),
    iso(x + ZONE, y, 0),
    iso(x + ZONE, y + ZONE, -0.45),
    iso(x, y + ZONE, -0.45),
  ]),
  24
)

function Lettering({
  at: [x, y],
  length,
  plane,
  pal,
  children,
}: {
  at: [number, number]
  length: number
  plane: "x" | "y"
  pal: Palette
  children: React.ReactNode
}) {
  // A wall facing +x reads towards -y; a wall facing +y reads along +x.
  const m = plane === "x" ? "1 -0.5 0 1" : "1 0.5 0 1"
  return (
    <text
      transform={`matrix(${m} ${x} ${y})`}
      textLength={length}
      lengthAdjust="spacingAndGlyphs"
      className={cn("font-display text-[30px]", pal.letter)}
    >
      {children}
    </text>
  )
}

/** The three bars a member lifts on the way through. */
export type Station = "deadlift" | "bench" | "squat"

/** Where each station's bar rests, in world units (x, y, z of its centre). */
export const STATIONS: Record<Station, readonly [number, number, number]> = {
  deadlift: [ORIGINS[1][0] + 3, ORIGINS[1][1] + 2.3, 0.36],
  bench: [ORIGINS[1][0] + 3, ORIGINS[1][1] + 5.6, 1.2],
  squat: [ORIGINS[4][0] + 3, ORIGINS[4][1] + 3, 1.46],
}

/**
 * `wrapBar` lets the backdrop move a station's bar with the lift; `children`
 * (the member) is drawn over the whole plan, outside `planClassName`, so
 * the plan can be faded back while the member stays crisp.
 */
export function GymPlan({
  className,
  planClassName,
  wrapBar,
  children,
}: {
  className?: string
  planClassName?: string
  wrapBar?: (station: Station, bar: React.ReactNode) => React.ReactNode
  children?: React.ReactNode
}) {
  const pal = PALETTES.drawing
  const lift = (station: Station, bar: React.ReactNode) =>
    wrapBar ? wrapBar(station, bar) : bar

  return (
    <svg
      viewBox={PLAN_VIEW}
      className={cn("iso-drawing h-auto w-full overflow-visible", className)}
      aria-hidden
      focusable="false"
    >
      <g className={planClassName}>
        <g>
          <Faces b={slab(0)} fills={pal.floor} />
          <Faces b={ENTRANCE.wallLeft} fills={pal.wall} />
          <Faces b={ENTRANCE.wallBack} fills={pal.wall} />
          <polygon points={ENTRANCE.door} className={pal.mouth} />
          <Lettering
            at={ENTRANCE.lettering.at}
            length={ENTRANCE.lettering.length}
            plane="x"
            pal={pal}
          >
            Palestra <tspan className="fill-primary/60">Azzurra</tspan>
          </Lettering>
          <Plate p={ENTRANCE.logo} fills={pal.plate.azure} />
          <Faces b={ENTRANCE.lockers} fills={pal.wall} />
          {ENTRANCE.seams.map(([a, b], i) => (
            <line
              key={i}
              x1={a[0]}
              y1={a[1]}
              x2={b[0]}
              y2={b[1]}
              className={pal.line}
            />
          ))}
          <Faces b={ENTRANCE.bench} fills={pal.mat} />
          <Faces b={ENTRANCE.desk} fills={pal.wall} />
          <Faces b={ENTRANCE.deskTop} fills={pal.mat} />
        </g>

        <g>
          <Faces b={slab(1)} fills={pal.floor} />
          <Faces b={WEIGHTS.platform} fills={pal.mat} />
          <polygon points={WEIGHTS.strip} className={pal.strip} />
          {lift("deadlift", <Barbell b={WEIGHTS.deadlift} pal={pal} />)}
          {WEIGHTS.stack.map((s, i) => (
            <g key={i}>
              <path d={s.side} className={pal.plate[s.tone][1]} />
              <ellipse {...s.top} className={pal.plate[s.tone][0]} />
            </g>
          ))}
          <Faces b={WEIGHTS.bench} fills={pal.mat} />
          {WEIGHTS.benchUprights.map((b, i) => (
            <Faces key={i} b={b} fills={pal.steel} />
          ))}
          {lift("bench", <Barbell b={WEIGHTS.benchPress} pal={pal} />)}
        </g>

        <g>
          <Faces b={slab(2)} fills={pal.floor} />
          {DUMBBELLS.racks.map((b, i) => (
            <Faces key={i} b={b} fills={pal.steel} />
          ))}
          {DUMBBELLS.bells.map((d, i) => (
            <Barbell key={i} b={d} pal={pal} />
          ))}
          {DUMBBELLS.benches.map((b, i) => (
            <Faces key={i} b={b} fills={pal.mat} />
          ))}
          {DUMBBELLS.kettlebells.map((k, i) => (
            <Kettlebell key={i} {...k} pal={pal} />
          ))}
        </g>

        <g>
          <Faces b={slab(3)} fills={pal.floor} />
          {CLASSES.mats.map((b, i) => (
            <Faces key={i} b={b} fills={pal.mat} />
          ))}
          {CLASSES.steps.map((b, i) => (
            <Faces key={i} b={b} fills={pal.wall} />
          ))}
          {CLASSES.balls.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={0.33 * S}
              className={pal.plate.azure[0]}
            />
          ))}
        </g>

        <g>
          <Faces b={slab(4)} fills={pal.floor} />
          <Faces b={LAB.wall} fills={pal.wall} />
          <Lettering
            at={LAB.lettering.at}
            length={LAB.lettering.length}
            plane="y"
            pal={pal}
          >
            Azzurra <tspan className="fill-primary/60">Lab</tspan>
          </Lettering>
          <Faces b={LAB.mats} fills={pal.mat} />
          {LAB.backPosts.map((b, i) => (
            <Faces key={i} b={b} fills={pal.steel} />
          ))}
          {lift("squat", <Barbell b={LAB.squat} pal={pal} />)}
          {LAB.frontPosts.map((b, i) => (
            <Faces key={i} b={b} fills={pal.steel} />
          ))}
          {LAB.top.map((b, i) => (
            <Faces key={i} b={b} fills={pal.steel} />
          ))}
          <Faces b={LAB.rack} fills={pal.steel} />
          {LAB.bells.map((d, i) => (
            <Barbell key={i} b={d} pal={pal} />
          ))}
          {LAB.kettlebells.map((k, i) => (
            <Kettlebell key={i} {...k} pal={pal} />
          ))}
        </g>

        <g>
          <Faces b={slab(5)} fills={pal.floor} />
          {CARDIO.treadmills.map((t, i) => (
            <g key={i}>
              <Faces b={t.deck} fills={pal.mat} />
              {t.posts.map((b, j) => (
                <Faces key={j} b={b} fills={pal.steel} />
              ))}
              <Faces b={t.console} fills={pal.steel} />
            </g>
          ))}
          {CARDIO.bikes.map((b, i) => (
            <g key={i}>
              <Faces b={b.base} fills={pal.steel} />
              <Faces b={b.post} fills={pal.steel} />
              <Faces b={b.stem} fills={pal.steel} />
              <Faces b={b.seat} fills={pal.mat} />
              <Faces b={b.bars} fills={pal.steel} />
            </g>
          ))}
          <Faces b={CARDIO.water} fills={[pal.glass, pal.glass, pal.glass]} />
        </g>

        <g>
          <Faces b={slab(6)} fills={pal.floor} />
          <Faces b={STREET.pavement} fills={pal.wall} />
          <Faces b={STREET.road} fills={pal.mat} />
          <line
            x1={STREET.dashes[0][0]}
            y1={STREET.dashes[0][1]}
            x2={STREET.dashes[1][0]}
            y2={STREET.dashes[1][1]}
            className={pal.line}
            strokeDasharray="8 8"
          />
          <Faces b={STREET.bench} fills={pal.mat} />
          <Trees at={STREET.trees} pal={pal} z={0.06} />
        </g>

        <g>
          <Faces
            b={SEA_ZONE.sand}
            fills={[pal.sand, pal.floor[1], pal.floor[2]]}
          />
          {SEA_ZONE.umbrellas.map((u, i) => (
            <g key={i}>
              <line
                x1={u.foot[0]}
                y1={u.foot[1]}
                x2={u.rim[0]}
                y2={u.rim[1] - 6}
                className={pal.line}
              />
              <path
                d={u.canopy}
                className={i % 2 ? pal.sheet : pal.plate.azure[0]}
              />
            </g>
          ))}
          <Faces b={SEA_ZONE.sea} fills={pal.sea} />
          {SEA_ZONE.waves.map(([a, b], i) => (
            <line
              key={i}
              x1={a[0]}
              y1={a[1]}
              x2={b[0]}
              y2={b[1]}
              className="stroke-primary/40"
              strokeDasharray="10 14"
            />
          ))}
        </g>
      </g>

      {children}
    </svg>
  )
}
