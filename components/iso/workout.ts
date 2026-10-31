/**
 * The member's workout through the gym plan (components/iso/gym-plan.tsx),
 * as a script laid along the page's scroll: in at the door, three
 * deadlifts on the platform, three reps on the bench, through the dumbbells
 * and the class floor, three squats in the Lab's rack, past the cardio row
 * and out to the sea.
 *
 * The script is a list of keyframes, each with a cost: walking costs its
 * length in world units, a movement what it is given. `workout(p)` reads
 * the scroll fraction `p` as a share of the total cost, so the walks and
 * the reps get the scroll they need, and returns where the member stands,
 * which way they face, their pose, and how far each station's bar is
 * lifted.
 *
 * Walks run along one world axis at a time. Lifts face +y, like every
 * figure in the kit; the bench poses lie along -y from where the member
 * stands at the foot of the bench.
 */

import { STATIONS, type Station } from "@/components/iso/gym-plan"
import { STANDING, type Pose } from "@/components/iso/kit"

type Point = readonly [number, number, number]
type Bars = Record<Station, number>

type Key = {
  base: Point
  pose: Pose
  /** Half the distance between the hands. */
  grip: number
  /** Each bar's lift from where it rests, in world z. */
  bars: Bars
  /** Scroll spent getting here from the previous key. */
  cost: number
  walk: boolean
}

const REST: Bars = { deadlift: 0, bench: 0, squat: 0 }
const HANDS_DOWN = 0.2

// ---------- Poses ----------

const [, DL_Y, DL_Z] = STATIONS.deadlift
/** The platform's top, under the deadlift. */
const PLATFORM = 0.06
const DL_HANDS = DL_Z - PLATFORM
const DL_SETUP: Pose = {
  foot: [0, 0],
  knee: [0.22, 0.4],
  hip: [-0.2, 0.6],
  shoulder: [0.22, 0.92],
  head: [0.36, 1.04],
  hand: [0.18, DL_HANDS],
}
const DL_LOCKOUT: Pose = {
  ...STANDING,
  shoulder: [-0.02, 1.42],
  head: [0, 1.62],
  hand: [0.18, DL_HANDS + 0.55],
}

/** Standing at the foot of the bench; the bar racks this far behind. */
const [, BENCH_Y, BENCH_Z] = STATIONS.bench
const BENCH_FOOT = 2.3
const SIT: Pose = {
  foot: [0, 0],
  knee: [-0.1, 0.5],
  hip: [-0.55, 0.5],
  shoulder: [-0.6, 1],
  head: [-0.58, 1.2],
  hand: [-0.2, 0.55],
}
const LIE: Pose = {
  foot: [-0.95, 0],
  knee: [-1.2, 0.62],
  hip: [-1.7, 0.57],
  shoulder: [-BENCH_FOOT, 0.6],
  head: [-BENCH_FOOT - 0.25, 0.62],
  hand: [-BENCH_FOOT, BENCH_Z],
}
const CHEST: Pose = { ...LIE, hand: [-BENCH_FOOT, BENCH_Z - 0.4] }

const [SQ_X, SQ_Y] = STATIONS.squat
/** The Lab's mats, under the rack. */
const MATS = 0.04
const UNDER_BAR: Pose = {
  ...STANDING,
  shoulder: [0, 1.4],
  head: [0.02, 1.6],
  hand: [0, 1.42],
}
const BOTTOM: Pose = {
  foot: [0, 0],
  knee: [0.2, 0.42],
  hip: [-0.25, 0.42],
  shoulder: [0, 0.85],
  head: [0.06, 1.03],
  hand: [0, 0.87],
}

// ---------- The script ----------

const KEYS: Key[] = [
  {
    base: [7, 0.6, 0],
    pose: STANDING,
    grip: HANDS_DOWN,
    bars: REST,
    cost: 0,
    walk: false,
  },
]
const last = () => KEYS[KEYS.length - 1]

/** Walk to each point in turn, along one axis at a time; z defaults to the floor. */
function walk(...points: readonly number[][]) {
  for (const [x, y, z = 0] of points) {
    const [px, py] = last().base
    KEYS.push({
      base: [x, y, z],
      pose: STANDING,
      grip: HANDS_DOWN,
      bars: REST,
      cost: Math.abs(x - px) + Math.abs(y - py),
      walk: true,
    })
  }
}

function move(
  pose: Pose,
  cost: number,
  grip = last().grip,
  bar?: [Station, number]
) {
  KEYS.push({
    base: last().base,
    pose,
    grip,
    bars: bar ? { ...REST, [bar[0]]: bar[1] } : REST,
    cost,
    walk: false,
  })
}

/** Down to `bottom` and back up to `top`, n times, with a breath at the top; `bar` lifts at each end. */
function reps(
  n: number,
  bottom: Pose,
  top: Pose,
  grip: number,
  station: Station,
  bar: { bottom: number; top: number }
) {
  for (let i = 0; i < n; i++) {
    move(bottom, 1.1, grip, [station, bar.bottom])
    move(top, 1.1, grip, [station, bar.top])
    move(top, 0.45, grip, [station, bar.top])
  }
}

const MARKS = {} as Record<Station, number[]>
/** Marks the start, then the end, of a station's lifting at the latest key. */
function station(s: Station) {
  ;(MARKS[s] ??= []).push(KEYS.length - 1)
}

// In at the door, down the aisle, onto the platform behind the bar.
walk([7, DL_Y - 0.18], [3, DL_Y - 0.18, PLATFORM])
station("deadlift")
move(DL_SETUP, 1.4, 0.3)
// A deadlift starts from the floor: the bar is down at the bottom, up at the top.
reps(3, DL_SETUP, DL_LOCKOUT, 0.3, "deadlift", { bottom: 0, top: 0.55 })
move(DL_SETUP, 1.1, 0.3)
move(STANDING, 1.2, HANDS_DOWN)
station("deadlift")

// Round the platform to the foot of the bench; sit, lie back, press.
const BENCH_AT = BENCH_Y + BENCH_FOOT
walk([6, DL_Y - 0.18, 0], [6, BENCH_AT], [3, BENCH_AT])
station("bench")
move(SIT, 1.4, HANDS_DOWN)
move(LIE, 1.6, 0.42)
reps(3, CHEST, LIE, 0.42, "bench", { bottom: -0.4, top: 0 })
move(SIT, 1.5, HANDS_DOWN)
move(STANDING, 1.3)
station("bench")

// Through the dumbbells and the class floor, into the Lab and under the bar.
walk([17, BENCH_AT], [17, 27], [SQ_X, 27], [SQ_X, SQ_Y, MATS])
station("squat")
move(UNDER_BAR, 1, 0.42)
reps(3, BOTTOM, UNDER_BAR, 0.42, "squat", { bottom: -0.55, top: 0 })
move(STANDING, 1, HANDS_DOWN)
station("squat")

// Back out to the aisle, past the cardio row, out to the water.
walk([SQ_X, 27, 0], [27, 27], [27, 37], [37, 37], [37, 45.4])

const ENDS = KEYS.reduce<number[]>(
  (acc, k) => [...acc, (acc[acc.length - 1] ?? 0) + k.cost],
  []
)
const TOTAL = ENDS[ENDS.length - 1]

/**
 * Where each station's lifting starts and ends, as fractions of the script:
 * the backdrop pins these to the page's white sections, where the plan
 * shows, and lets the walks between them run under the rubber bands.
 */
export const SPANS = Object.fromEntries(
  Object.entries(MARKS).map(([s, [a, b]]) => [
    s,
    [ENDS[a] / TOTAL, ENDS[b] / TOTAL],
  ])
) as Record<Station, [number, number]>
/** Distance walked by the end of each key, for the stride. */
const WALKED = KEYS.reduce<number[]>(
  (acc, k) => [...acc, (acc[acc.length - 1] ?? 0) + (k.walk ? k.cost : 0)],
  []
)

// ---------- Reading it ----------

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => t * t * (3 - 2 * t)
const lerpPose = (a: Pose, b: Pose, t: number) =>
  Object.fromEntries(
    (Object.keys(a) as (keyof Pose)[]).map((j) => [
      j,
      [lerp(a[j][0], b[j][0], t), lerp(a[j][1], b[j][1], t)],
    ])
  ) as unknown as Pose

export type WorkoutFrame = {
  base: Point
  /** The world axis the member faces along. */
  facing: readonly [number, number]
  pose: Pose
  grip: number
  /** The stride, -1 to 1: positive puts the +side foot forward. */
  swing: number
  bars: Bars
}

export function workout(p: number): WorkoutFrame {
  const at = Math.min(Math.max(p, 0), 1) * TOTAL
  let i = 1
  while (i < KEYS.length - 1 && ENDS[i] < at) i++
  const a = KEYS[i - 1]
  const b = KEYS[i]
  const t = b.cost ? Math.min(Math.max((at - ENDS[i - 1]) / b.cost, 0), 1) : 1
  const base = [0, 1, 2].map((k) =>
    lerp(a.base[k], b.base[k], t)
  ) as unknown as Point

  if (b.walk) {
    const facing = [
      Math.sign(b.base[0] - a.base[0]),
      Math.sign(b.base[1] - a.base[1]),
    ] as const
    const walked = WALKED[i - 1] + t * b.cost
    // Feet together at the start and end of every leg.
    const taper = Math.min(1, (t * b.cost) / 0.4, ((1 - t) * b.cost) / 0.4)
    return {
      base,
      facing,
      pose: STANDING,
      grip: HANDS_DOWN,
      swing: Math.sin((walked / 0.55) * Math.PI) * taper,
      bars: REST,
    }
  }

  const e = ease(t)
  const bars = Object.fromEntries(
    (Object.keys(REST) as Station[]).map((s) => [
      s,
      lerp(a.bars[s], b.bars[s], e),
    ])
  ) as Bars
  return {
    base,
    facing: [0, 1],
    pose: lerpPose(a.pose, b.pose, e),
    grip: lerp(a.grip, b.grip, e),
    swing: 0,
    bars,
  }
}
