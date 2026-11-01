"use client"

import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotionConfig,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react"
import { useEffect, useRef, useState } from "react"

import { GymPlan, PLAN_VIEW, type Station } from "@/components/iso/gym-plan"
import { iso, PALETTES, S, SPREAD } from "@/components/iso/kit"
import { SCRIPT_COST, SPANS, workout } from "@/components/iso/workout"

const [VIEW_X, VIEW_Y, VIEW_W, VIEW_H] = PLAN_VIEW.split(" ").map(Number)

/**
 * Each lift plays out over one of the white sections, where the plan shows
 * through, held at a point of the screen clear of that section's content
 * (fractions of the viewport): the bench sits under the Courses title,
 * beside the card.
 */
const LIFTS: { id: string; station: Station; screen: [number, number] }[] = [
  { id: "chi-siamo", station: "deadlift", screen: [0.5, 0.55] },
  { id: "corsi", station: "bench", screen: [0.2, 0.82] },
  { id: "staff", station: "squat", screen: [0.5, 0.55] },
]
/** Where the camera holds the member while they walk. */
const WALKING: [number, number] = [0.5, 0.55]

/**
 * The member's own pace, in script cost per second (walking units, or a
 * movement's share): the scroll sets where they're headed, never how fast
 * they go, so a flick of the wheel doesn't make them sprint or pump reps.
 * Lifts keep a steady tempo; the walks, mostly under the rubber bands, a
 * brisk one.
 */
const LIFT_PACE = 2
const WALK_PACE = 3.5
/** Further behind than this (a jump through the nav), they're put there. */
const MAX_GAP = 24

/** `target`, followed at the member's pace. */
function usePaced(target: MotionValue<number>) {
  const paced = useMotionValue(target.get())
  useAnimationFrame((_, delta) => {
    const to = target.get()
    const from = paced.get()
    const gap = (to - from) * SCRIPT_COST
    if (gap === 0) return
    // A long frame (a background tab) doesn't turn into a leap.
    const dt = Math.min(delta, 100) / 1000
    const step = dt * (workout(from).walking ? WALK_PACE : LIFT_PACE)
    if (Math.abs(gap) <= step || Math.abs(gap) > MAX_GAP) paced.set(to)
    else paced.set(from + (Math.sign(gap) * step) / SCRIPT_COST)
  })
  return paced
}

/** The member's point on screen at a point of the script: each lift's, eased between them on the walks. */
const SCREEN = (() => {
  const at = [0, ...LIFTS.flatMap((l) => SPANS[l.station]), 1]
  const screens = [
    WALKING,
    ...LIFTS.flatMap((l) => [l.screen, l.screen]),
    WALKING,
  ]
  return (p: number) => {
    let i = 1
    while (i < at.length - 1 && at[i] < p) i++
    const t =
      at[i] > at[i - 1]
        ? Math.min(Math.max((p - at[i - 1]) / (at[i] - at[i - 1]), 0), 1)
        : 1
    const e = t * t * (3 - 2 * t)
    return [0, 1].map(
      (k) => screens[i - 1][k] + (screens[i][k] - screens[i - 1][k]) * e
    ) as [number, number]
  }
})()

/** The member at a point of the scroll (components/iso/workout.ts), as paths for limbs and torso and a head. */
function figure(p: number) {
  const { base, facing, pose, grip, swing } = workout(p)
  // Across the way they face: the other world axis.
  const across = [Math.abs(facing[1]), Math.abs(facing[0])] as const
  // The stride moves feet and knees forward and the hands back, side against side.
  const stride = { foot: 0.22, knee: 0.14, hand: -0.18 } as Partial<
    Record<keyof typeof pose, number>
  >
  const joint = (j: keyof typeof pose, s: number) => {
    const forward = pose[j][0] + (stride[j] ?? 0) * swing * s
    const side = s * (j === "head" ? 0 : j === "hand" ? grip : SPREAD[j])
    return iso(
      base[0] + facing[0] * forward + across[0] * side,
      base[1] + facing[1] * forward + across[1] * side,
      base[2] + pose[j][1]
    ).join(" ")
  }

  const limbs = [-1, 1]
    .map(
      (s) =>
        `M${joint("foot", s)}L${joint("knee", s)}L${joint("hip", s)}M${joint("shoulder", s)}L${joint("hand", s)}`
    )
    .join("")
  const [hx, hy] = joint("head", 0).split(" ").map(Number)
  return {
    limbs,
    torso: `M${joint("hip", 0)}L${joint("shoulder", 0)}`,
    head: [hx, hy] as const,
    /** What the camera follows: where they stand, at chest height. */
    anchor: iso(base[0], base[1], 0.8),
  }
}

function Member({ progress }: { progress: MotionValue<number> }) {
  const pal = PALETTES.drawing
  const limbs = useTransform(progress, (p) => figure(p).limbs)
  const torso = useTransform(progress, (p) => figure(p).torso)
  const cx = useTransform(progress, (p) => figure(p).head[0])
  const cy = useTransform(progress, (p) => figure(p).head[1])
  return (
    <g className="iso-solid opacity-85">
      <motion.path
        d={limbs}
        fill="none"
        className={pal.body}
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d={torso}
        fill="none"
        className="stroke-primary"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <motion.circle cx={cx} cy={cy} r={2.4} className={pal.head} />
    </g>
  )
}

/** A station's bar, raised and lowered with the member's lift. */
function LiftedBar({
  progress,
  station,
  children,
}: {
  progress: MotionValue<number>
  station: Station
  children: React.ReactNode
}) {
  const y = useTransform(progress, (p) => -workout(p).bars[station] * S)
  return <motion.g style={{ y }}>{children}</motion.g>
}

/**
 * The plan of the gym (components/iso/gym-plan.tsx) behind the whole site,
 * after sir-alex's site plan. From the top of the page to the bottom a
 * member works out through it: in at the door,
 * deadlifts on the platform, the bench press, squats in the Lab's rack, out
 * to the sea (components/iso/workout.ts), the bars moving with the lifts.
 * Each lift is pinned to a white section (About, Courses, Staff), where
 * the plan shows; the walks between run under the rubber bands. The plan
 * glides under the screen to keep them in view, and holds while they lift,
 * so the reps play out under the scroll, at the member's own pace however
 * fast the page goes. The rubber bands cover it as they
 * pass; it shows through the white ground.
 *
 * Under reduced motion the plan stands still, top in view, with no member.
 * Decorative.
 */
export function PlanBackdrop() {
  const reduce = useReducedMotionConfig()
  const { scrollY } = useScroll()
  const plan = useRef<HTMLDivElement>(null)
  // Scroll positions pinned to points of the workout: the page's ends, and
  // each lift's section from when it reaches mid-screen until it leaves.
  const [stops, setStops] = useState({ scroll: [0, 1], script: [0, 1] })
  const [box, setBox] = useState({ w: 1, h: 1, vw: 1, vh: 1 })

  useEffect(() => {
    function measure() {
      const vh = window.innerHeight
      const end = Math.max(1, document.documentElement.scrollHeight - vh)
      const scroll = [0]
      const script = [0]
      for (const { id, station } of LIFTS) {
        const section = document.getElementById(id)
        if (!section) continue
        const top = section.getBoundingClientRect().top + window.scrollY
        const from = top - vh * 0.45
        const to = top + section.offsetHeight - vh * 0.65
        // Short sections on small screens: keep the stops in order.
        const prev = scroll[scroll.length - 1]
        scroll.push(Math.max(from, prev + 1), Math.max(to, from, prev + 2))
        script.push(...SPANS[station])
      }
      scroll.push(Math.max(end, scroll[scroll.length - 1] + 1))
      script.push(1)
      setStops({ scroll, script })
      const r = plan.current?.getBoundingClientRect()
      if (r)
        setBox({
          w: r.width,
          h: r.height,
          vw: window.innerWidth,
          vh: window.innerHeight,
        })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    if (plan.current) observer.observe(plan.current)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  const target = useTransform(scrollY, stops.scroll, stops.script)
  const progress = usePaced(target)
  // The camera: the member held at their point of the screen, the plan
  // never pulled past its own edges.
  const k = box.w / VIEW_W
  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v))
  const x = useTransform(progress, (p) => {
    const [fx] = figure(p).anchor
    return clamp(
      box.vw * SCREEN(p)[0] - (fx - VIEW_X) * k,
      Math.min(0, box.vw - box.w),
      Math.max(0, box.vw - box.w)
    )
  })
  const y = useTransform(progress, (p) => {
    const [, fy] = figure(p).anchor
    return clamp(
      box.vh * SCREEN(p)[1] - (fy - VIEW_Y) * k,
      Math.min(0, box.vh - box.h),
      0
    )
  })
  const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        ref={plan}
        className="absolute top-0 left-0 w-[max(170vw,150vh)] will-change-transform"
        style={{
          aspectRatio: `${VIEW_W} / ${VIEW_H}`,
          transform: reduce ? "translateX(calc(50vw - 50%))" : transform,
        }}
      >
        <GymPlan
          planClassName="opacity-50 dark:opacity-60"
          wrapBar={
            reduce
              ? undefined
              : (station, bar) => (
                  <LiftedBar progress={progress} station={station}>
                    {bar}
                  </LiftedBar>
                )
          }
        >
          {reduce ? null : <Member progress={progress} />}
        </GymPlan>
      </motion.div>
      {/* Keeps the edges quiet and the text readable. */}
      <div className="absolute inset-0 bg-radial from-transparent from-35% to-background/90" />
    </div>
  )
}
