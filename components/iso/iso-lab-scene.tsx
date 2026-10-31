/**
 * Azzurra Lab as an isometric diorama: the studio, cut away at two walls.
 * A client squats in the rack with the bar on their back, three reps; the
 * coach stands beside them with the clipboard, and each rep ticks a row of
 * the scheda pinned to the wall. Our programme, your goals: the method, on
 * a loop. Around them, the studio: the dumbbell rack, kettlebells, the
 * lettering on the wall.
 *
 * SVG with SMIL, no JavaScript (components/iso/kit.tsx). Reduced motion
 * gets a still frame: the client standing tall, all three rows ticked.
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
  S,
  STANDING,
  Track,
  viewBoxOf,
  type IsoTone,
  type Palette,
  type Pose,
} from "@/components/iso/kit"
import { cn } from "@/lib/utils"

/** One loop of the scene, seconds. */
const LOOP = 10

// ---------- The world ----------
// The room's back walls run along x (at y = -0.2) and along y (at x = -0.2);
// the rack stands in the middle on the mats, the client facing +y.

const FLOOR = box(-0.2, -0.2, -0.25, 6.4, 4.6, 0.25)
const WALL_LEFT = box(-0.35, -0.35, 0, 0.15, 4.75, 2.4)
const WALL_BACK = box(-0.2, -0.35, 0, 6.4, 0.15, 2.4)
const MATS = box(0.9, 0.6, 0, 4.2, 3.2, 0.04)
const TOP = 0.04

const CLIENT = { x: 2.6, y: 2.15 }
const STAND: Pose = {
  ...STANDING,
  shoulder: [0, 1.4],
  head: [0.02, 1.6],
  hand: [0, 1.42],
}
/** Below parallel, knees out over the toes, the bar over midfoot. */
const BOTTOM: Pose = {
  foot: [0, 0],
  knee: [0.2, 0.42],
  hip: [-0.25, 0.42],
  shoulder: [0, 0.85],
  head: [0.06, 1.03],
  hand: [0, 0.87],
}
const DEPTH = 0.55
const BAR = barbell(CLIENT.x, CLIENT.y, TOP + 1.42, {
  half: 1.15,
  collar: 0.7,
  load: [20, 10],
})

// Three reps, a breath at the top of each.
const REPS = {
  at: [
    0, 0.12, 0.22, 0.26, 0.36, 0.4, 0.5, 0.54, 0.64, 0.68, 0.78, 0.82, 0.92, 1,
  ],
  poses: [
    STAND,
    STAND,
    BOTTOM,
    BOTTOM,
    STAND,
    STAND,
    BOTTOM,
    BOTTOM,
    STAND,
    STAND,
    BOTTOM,
    BOTTOM,
    STAND,
    STAND,
  ],
}
const BAR_TRACK = REPS.poses.map(
  (p) => [0, 0, p === BOTTOM ? -DEPTH : 0] as [number, number, number]
)
/** A rep is ticked as the client stands up out of it. */
const TICKED = [0.36, 0.64, 0.92]
const CLEARED = 0.97

// The power rack: four uprights, the top frame, safety arms at the sides.
const POST_X = [1.98, 3.22]
const POST_Y = [1.75, 2.55]
const RACK_H = 2.3
const post = (x: number, y: number) =>
  box(x - 0.04, y - 0.04, 0, 0.08, 0.08, RACK_H)
const beamX = (y: number) =>
  box(
    POST_X[0] - 0.04,
    y - 0.04,
    RACK_H - 0.08,
    POST_X[1] - POST_X[0] + 0.08,
    0.08,
    0.08
  )
const beamY = (x: number) =>
  box(
    x - 0.04,
    POST_Y[0] - 0.04,
    RACK_H - 0.08,
    0.08,
    POST_Y[1] - POST_Y[0] + 0.08,
    0.08
  )
const SAFETIES = POST_X.map((x) =>
  box(x - 0.03, POST_Y[0] - 0.1, 0.75, 0.06, POST_Y[1] - POST_Y[0] + 0.2, 0.05)
)

const COACH = { x: 4.7, y: 2.7 }
const COACH_POSE: Pose = { ...STANDING, hand: [0.2, 1.05] }
const CLIPBOARD = iso(COACH.x + 0.24, COACH.y + 0.2, 1.12)

// The scheda on the back wall (the plane y = -0.2): a printed header, three rows.
const WALL_Y = -0.2
const onWall = (x: number, z: number) => iso(x, WALL_Y, z)
const SHEET = { x0: 3.6, x1: 4.9, z0: 0.9, z1: 2 }
const SHEET_FACE = poly([
  onWall(SHEET.x0, SHEET.z1),
  onWall(SHEET.x1, SHEET.z1),
  onWall(SHEET.x1, SHEET.z0),
  onWall(SHEET.x0, SHEET.z0),
])
const SHEET_HEAD = poly([
  onWall(SHEET.x0, SHEET.z1),
  onWall(SHEET.x1, SHEET.z1),
  onWall(SHEET.x1, 1.82),
  onWall(SHEET.x0, 1.82),
])
const ROWS = [1.66, 1.38, 1.1].map((z) => ({
  rule: [onWall(SHEET.x0 + 0.08, z - 0.14), onWall(SHEET.x1 - 0.08, z - 0.14)],
  label: [onWall(SHEET.x0 + 0.14, z), onWall(SHEET.x0 + 0.75, z)],
  tick: onWall(4.66, z),
}))

/**
 * The lettering runs along the left wall (the plane x = -0.2), read from
 * front to back. Its length is pinned so it stops short of the corner: one
 * world unit along the wall is S text units.
 */
const LETTERING = { at: iso(-0.2, 4.1, 1.25), length: 3.6 * S }

const RACK_DB = box(0.15, 0.7, 0, 0.5, 2.6, 0.42)
const DUMBBELLS = [0.9, 1.4, 1.9, 2.4, 2.9].map((y) =>
  barbell(0.4, y, 0.51, {
    half: 0.24,
    collar: 0.1,
    load: ["db", "db"],
    d: 0.02,
  })
)
const KETTLEBELLS = [
  { x: 5.1, y: 0.25, tone: "iron" },
  { x: 5.5, y: 0.25, tone: "iron" },
  { x: 5.9, y: 0.25, tone: "azure" },
] as const

const VIEW = viewBoxOf(
  [
    iso(-0.35, -0.35, 2.4),
    iso(6.2, -0.35, 2.4),
    iso(-0.35, 4.4, 2.4),
    iso(6.2, 4.4, -0.25),
    iso(-0.2, 4.4, -0.25),
    iso(6.2, -0.2, -0.25),
  ],
  10
)

function Tick({ at: [x, y] }: { at: [number, number] }) {
  return (
    <g>
      <circle cx={x} cy={y} r={3.4} className="fill-primary" />
      <path
        d={`M${x - 1.7} ${y}l1.2 1.3l2.3 -2.6`}
        fill="none"
        className="stroke-primary-foreground"
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
}

function Room({ pal }: { pal: Palette }) {
  return (
    <>
      <Faces b={FLOOR} fills={pal.floor} />
      <Faces b={WALL_LEFT} fills={pal.wall} />
      <Faces b={WALL_BACK} fills={pal.wall} />
      <text
        transform={`matrix(1 -0.5 0 1 ${LETTERING.at[0]} ${LETTERING.at[1]})`}
        textLength={LETTERING.length}
        lengthAdjust="spacingAndGlyphs"
        className={cn("font-display text-[15px]", pal.letter)}
      >
        Azzurra <tspan className="fill-primary">Lab</tspan>
      </text>
      <polygon points={SHEET_FACE} className={pal.sheet} />
      <polygon points={SHEET_HEAD} className={pal.sheetHead} />
      {ROWS.map((r, i) => (
        <g key={i}>
          <line
            x1={r.rule[0][0]}
            y1={r.rule[0][1]}
            x2={r.rule[1][0]}
            y2={r.rule[1][1]}
            className="stroke-sheet-line"
            strokeWidth={0.8}
          />
          <line
            x1={r.label[0][0]}
            y1={r.label[0][1]}
            x2={r.label[1][0]}
            y2={r.label[1][1]}
            className="stroke-steel"
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        </g>
      ))}
      {KETTLEBELLS.map((k, i) => (
        <Kettlebell key={i} {...k} pal={pal} />
      ))}
      <Faces b={RACK_DB} fills={pal.steel} />
      {DUMBBELLS.map((d, i) => (
        <Barbell key={i} b={d} pal={pal} />
      ))}
      <Faces b={MATS} fills={pal.mat} />
    </>
  )
}

export function IsoLabScene({
  tone = "onPlatform",
  className,
}: {
  tone?: IsoTone
  className?: string
}) {
  const pal = PALETTES[tone]
  const reps = { dur: LOOP, at: REPS.at }

  return (
    <svg
      viewBox={VIEW}
      className={cn("h-auto w-full overflow-visible", className)}
      aria-hidden
      focusable="false"
    >
      <Room pal={pal} />

      {/* The back of the rack, behind the client. */}
      {POST_X.map((x) => (
        <Faces key={x} b={post(x, POST_Y[0])} fills={pal.steel} />
      ))}
      {SAFETIES.map((b, i) => (
        <Faces key={i} b={b} fills={pal.steel} />
      ))}

      {/* Still frame: standing tall, the scheda filled in. */}
      <g className="motion-safe:hidden">
        <Person {...CLIENT} z={TOP} poses={[STAND]} grip={0.42} pal={pal} />
        <Barbell b={BAR} pal={pal} />
        {ROWS.map((r, i) => (
          <Tick key={i} at={r.tick} />
        ))}
      </g>

      <g className="motion-reduce:hidden">
        <Person
          {...CLIENT}
          z={TOP}
          poses={REPS.poses}
          clock={reps}
          grip={0.42}
          pal={pal}
        />
        <Track clock={reps} by={BAR_TRACK}>
          <Barbell b={BAR} pal={pal} />
        </Track>
        {ROWS.map((r, i) => (
          <Blink key={i} dur={LOOP} on={TICKED[i]} off={CLEARED}>
            <Tick at={r.tick} />
          </Blink>
        ))}
      </g>

      {/* The front of the rack, then the top frame over everything. */}
      {POST_X.map((x) => (
        <Faces key={x} b={post(x, POST_Y[1])} fills={pal.steel} />
      ))}
      <Faces b={beamX(POST_Y[0])} fills={pal.steel} />
      {POST_X.map((x) => (
        <Faces key={x} b={beamY(x)} fills={pal.steel} />
      ))}
      <Faces b={beamX(POST_Y[1])} fills={pal.steel} />

      <Person
        {...COACH}
        poses={[COACH_POSE]}
        shirt="stroke-primary"
        pal={pal}
      />
      <rect
        x={CLIPBOARD[0] - 3.5}
        y={CLIPBOARD[1] - 5}
        width={7}
        height={9}
        rx={1}
        transform={`rotate(-18 ${CLIPBOARD[0]} ${CLIPBOARD[1]})`}
        className={pal.sheet}
      />
    </svg>
  )
}
