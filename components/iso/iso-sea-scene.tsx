/**
 * "200 m from the sea" as an isometric diorama: the beach with its
 * umbrellas, the promenade and the street, and across it the gym, with a
 * barbell on the roof for a sign and a plate over the door. Two people
 * leave the beach, cross the street and walk in; the route is dashed on
 * the ground and tagged 200 M.
 *
 * SVG with SMIL, no JavaScript (components/iso/kit.tsx). Reduced motion
 * gets a still frame: the two walkers on the pavement, halfway there.
 *
 * Decorative: aria-hidden.
 */

import {
  barbell,
  Barbell,
  box,
  Faces,
  iso,
  Mover,
  PALETTES,
  Person,
  plate,
  Plate,
  poly,
  route,
  STANDING,
  Trees,
  viewBoxOf,
  type IsoTone,
  type Palette,
} from "@/components/iso/kit"
import { cn } from "@/lib/utils"

/** One loop of the scene, seconds. */
const LOOP = 12

// ---------- The world ----------
// The sea runs along the back (small y), the coast road in front of the
// beach, the gym across the road at the front left with its door on the +x
// face.

const SEA = box(0, -2.6, -0.45, 13, 1.8, 0.4)
const LAND = box(0, -0.8, -0.45, 13, 7.4, 0.45)
const SAND = poly([iso(0, -0.8), iso(13, -0.8), iso(13, 1), iso(0, 1)])
const WAVES = [-2.2, -1.7, -1.2].map(
  (y) => [iso(0.3, y, -0.05), iso(12.7, y, -0.05)] as const
)
const PROMENADE = box(0, 1, 0, 13, 0.4, 0.06)
const ROAD = box(0, 1.4, 0, 13, 1.3, 0.03)
const ROAD_DASHES = [iso(0.2, 2.05, 0.04), iso(12.8, 2.05, 0.04)] as const
const PAVEMENT = box(0, 2.7, 0, 13, 0.5, 0.06)

const UMBRELLAS = (
  [
    [1.4, -0.1],
    [3.4, 0.4],
    [5.6, -0.2],
    [7.6, 0.3],
    [11.8, 0],
  ] as const
).map(([x, y], i) => {
  const rim = iso(x, y, 1.05)
  const r = 0.55 * 20 * Math.SQRT2
  return {
    foot: iso(x, y, 0),
    canopy: `M${rim[0] - r} ${rim[1]}A${r} ${r / 2} 0 0 0 ${rim[0] + r} ${rim[1]}L${iso(x, y, 1.35).join(" ")}Z`,
    rim,
    azure: i % 2 === 0,
  }
})

// The gym: walls, the door and windows on the +x face (the plane x = 5),
// a window band on the front (the plane y = 6.2).
const GYM = { x0: 0.6, x1: 5, y0: 3.4, y1: 6.2, h: 2.6 }
const BUILDING = box(GYM.x0, GYM.y0, 0, GYM.x1 - GYM.x0, GYM.y1 - GYM.y0, GYM.h)
const onSide = (y0: number, y1: number, z0: number, z1: number) =>
  poly([
    iso(GYM.x1, y0, z0),
    iso(GYM.x1, y1, z0),
    iso(GYM.x1, y1, z1),
    iso(GYM.x1, y0, z1),
  ])
const onFront = (x0: number, x1: number, z0: number, z1: number) =>
  poly([
    iso(x0, GYM.y1, z0),
    iso(x1, GYM.y1, z0),
    iso(x1, GYM.y1, z1),
    iso(x0, GYM.y1, z1),
  ])
const DOOR_Y = 4.8
const DOOR = onSide(DOOR_Y - 0.3, DOOR_Y + 0.3, 0, 1.3)
const SIDE_WINDOWS = [onSide(3.6, 4.3, 0.5, 1.6), onSide(5.3, 6, 0.5, 1.6)]
const FRONT_WINDOW = onFront(0.9, 4.7, 0.5, 1.8)
const MULLIONS = [1.5, 2.1, 2.7, 3.3, 3.9].map(
  (x) => [iso(x, GYM.y1, 0.5), iso(x, GYM.y1, 1.8)] as const
)
const DOOR_PLATE = plate(GYM.x1, DOOR_Y, 1.85, 0.3, 0.04)
const SIGN = barbell(2.8, DOOR_Y, GYM.h + 0.5, {
  half: 1.3,
  collar: 0.8,
  load: ["sign"],
  d: 0.05,
})
const SIGN_POSTS = [2.1, 3.5].map((x) =>
  box(x - 0.04, DOOR_Y - 0.04, GYM.h, 0.08, 0.08, 0.5)
)

// From under the umbrellas, across the road, along the pavement to the door.
const START: [number, number] = [10.2, 0.2]
const WALK = route([START, [10.2, DOOR_Y], [GYM.x1 + 0.15, DOOR_Y]])
const GROUND_ROUTE = route(
  [START, [10.2, DOOR_Y], [GYM.x1 + 0.15, DOOR_Y]],
  0.08
).abs
const TAG = iso(11.1, 2.05, 0.75)

/** Pines at the corners, clear of the route. */
const TREES = [
  [12.2, 3.8],
  [12.5, 5.5],
] as const

const VIEW = viewBoxOf(
  [
    iso(0, -2.6, 0),
    iso(13, -2.6, 0),
    iso(13, 6.6, -0.45),
    iso(0, 6.6, -0.45),
    iso(1.5, DOOR_Y, GYM.h + 1),
  ],
  10
)

function Walker({
  x,
  y,
  shirt,
  pal,
}: {
  x: number
  y: number
  shirt?: string
  pal: Palette
}) {
  return <Person x={x} y={y} poses={[STANDING]} shirt={shirt} pal={pal} />
}

export function IsoSeaScene({
  tone = "onPlatform",
  className,
}: {
  tone?: IsoTone
  className?: string
}) {
  const pal = PALETTES[tone]
  const keyPoints = "0;0;1;1"
  const keyTimes = "0;0.05;0.85;1"
  const fade: [string, string] = ["0;0;1;1;0;0", "0;0.04;0.08;0.84;0.88;1"]

  return (
    <svg
      viewBox={VIEW}
      className={cn("h-auto w-full overflow-visible", className)}
      aria-hidden
      focusable="false"
    >
      <Faces b={SEA} fills={pal.sea} />
      {WAVES.map(([a, b], i) => (
        <g
          key={i}
          className="stroke-white/50"
          strokeWidth={1.4}
          strokeLinecap="round"
        >
          <line
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
            strokeDasharray="10 16"
            className="motion-safe:hidden"
          />
          <line
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
            strokeDasharray="10 16"
            className="motion-reduce:hidden"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-52"
              dur={`${4 + i}s`}
              repeatCount="indefinite"
            />
          </line>
        </g>
      ))}

      <Faces b={LAND} fills={pal.floor} />
      <polygon points={SAND} className={pal.sand} />
      {UMBRELLAS.map((u, i) => (
        <g key={i}>
          <line
            x1={u.foot[0]}
            y1={u.foot[1]}
            x2={u.rim[0]}
            y2={u.rim[1] - 6}
            className={pal.line}
            strokeWidth={1.6}
          />
          <path d={u.canopy} className={u.azure ? "fill-primary" : pal.sheet} />
        </g>
      ))}

      <Faces b={PROMENADE} fills={pal.wall} />
      <Faces b={ROAD} fills={pal.mat} />
      <line
        x1={ROAD_DASHES[0][0]}
        y1={ROAD_DASHES[0][1]}
        x2={ROAD_DASHES[1][0]}
        y2={ROAD_DASHES[1][1]}
        className="stroke-white/50"
        strokeWidth={1.2}
        strokeDasharray="6 6"
      />
      <Faces b={PAVEMENT} fills={pal.wall} />
      <polyline
        points={poly(GROUND_ROUTE)}
        fill="none"
        className="stroke-primary"
        strokeWidth={1.6}
        strokeDasharray="2 4"
        strokeLinecap="round"
      />

      {/* The gym, its sign on the roof. */}
      <Faces b={BUILDING} fills={pal.wall} />
      <polygon points={FRONT_WINDOW} className={pal.glass} />
      {MULLIONS.map(([a, b], i) => (
        <line
          key={i}
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
          className={pal.line}
          strokeWidth={1}
        />
      ))}
      {SIDE_WINDOWS.map((w, i) => (
        <polygon key={i} points={w} className={pal.glass} />
      ))}
      <polygon points={DOOR} className={pal.mouth} />
      <Plate p={DOOR_PLATE} fills={pal.plate.azure} />
      {SIGN_POSTS.map((b, i) => (
        <Faces key={i} b={b} fills={pal.steel} />
      ))}
      <Barbell b={SIGN} pal={pal} />

      {/* Still frame: halfway there, on the pavement. */}
      <g className="motion-safe:hidden">
        <Walker x={8.2} y={DOOR_Y - 0.15} pal={pal} />
        <Walker x={7.6} y={DOOR_Y + 0.15} shirt="stroke-primary" pal={pal} />
      </g>
      <Mover
        path={WALK.d}
        dur={LOOP}
        keyPoints={keyPoints}
        keyTimes={keyTimes}
        fade={fade}
      >
        <Walker x={START[0]} y={START[1]} pal={pal} />
      </Mover>
      <Mover
        path={WALK.d}
        dur={LOOP}
        begin={0.7}
        keyPoints={keyPoints}
        keyTimes={keyTimes}
        fade={fade}
      >
        <Walker x={START[0]} y={START[1]} shirt="stroke-primary" pal={pal} />
      </Mover>

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
          200 M
        </text>
      </g>

      <Trees at={TREES} pal={pal} />
    </svg>
  )
}
