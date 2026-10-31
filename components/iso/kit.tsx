/**
 * The isometric kit behind the gym dioramas (components/iso/*), on the
 * pattern of parkito-web's: a 2:1 projection, boxes drawn as their three
 * visible faces, circles on the ground, routes for things that travel. On
 * top of that, the weight room: bumper plates as discs standing across the
 * bar, barbells and dumbbells along the world x axis, and stick-figure
 * lifters posed joint by joint.
 *
 * Scenes are SVG with no JavaScript of their own: geometry is computed at
 * module load and everything moves with SMIL (`animate`, `animateTransform`,
 * `animateMotion`). SMIL ignores `prefers-reduced-motion`, so a scene draws
 * its moving parts in `motion-reduce:hidden` groups and a still frame in
 * `motion-safe:hidden` ones. Bars lie along x and only ever move along an
 * axis, so no sprite has to turn.
 *
 * Colours come from the --iso-* tokens in app/globals.css, in two palettes:
 * `plain` for the white floor, `onPlatform` for the rubber bands.
 */

/** Pixels per world unit (about a metre) along an axis. */
export const S = 20

export type P = [number, number]
export const r1 = (v: number) => Math.round(v * 10) / 10
/** World (x to the lower right, y to the lower left, z up) to screen. */
export const iso = (x: number, y: number, z = 0): P => [
  r1((x - y) * S),
  r1(((x + y) * S) / 2 - z * S),
]
export const poly = (pts: P[]) => pts.map((p) => p.join(",")).join(" ")
/** A world displacement as an SVG translate value. */
export const offset = (dx: number, dy: number, dz = 0) =>
  iso(dx, dy, dz).join(" ")

/** The three visible faces of a box: top, the +y face (lower left), the +x face (lower right). */
export function box(
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number
) {
  const t = z + h
  return {
    top: poly([
      iso(x, y, t),
      iso(x + w, y, t),
      iso(x + w, y + d, t),
      iso(x, y + d, t),
    ]),
    left: poly([
      iso(x, y + d, z),
      iso(x + w, y + d, z),
      iso(x + w, y + d, t),
      iso(x, y + d, t),
    ]),
    right: poly([
      iso(x + w, y, z),
      iso(x + w, y + d, z),
      iso(x + w, y + d, t),
      iso(x + w, y, t),
    ]),
  }
}
export type Box = ReturnType<typeof box>

/** A circle on the ground, of world radius r, is an axis-aligned ellipse on screen. */
export function ellipse(cx: number, cy: number, z: number, r: number) {
  const [x, y] = iso(cx, cy, z)
  return {
    cx: x,
    cy: y,
    rx: r1(r * S * Math.SQRT2),
    ry: r1((r * S * Math.SQRT2) / 2),
  }
}

/** An upright cylinder (a plate lying flat, a stool): its side band and its top. */
export function puck(cx: number, cy: number, z: number, r: number, h: number) {
  const b = ellipse(cx, cy, z, r)
  const t = ellipse(cx, cy, z + h, r)
  return {
    side: `M${b.cx - b.rx} ${t.cy}L${b.cx - b.rx} ${b.cy}A${b.rx} ${b.ry} 0 0 0 ${b.cx + b.rx} ${b.cy}L${b.cx + b.rx} ${t.cy}Z`,
    top: t,
  }
}

/** A path through world points, relative to the first, with the fraction of its length at each point (for keyPoints). */
export function route(points: [number, number][], z = 0) {
  const screen = points.map(([x, y]) => iso(x, y, z))
  const o = screen[0]
  const rel = screen.map(([x, y]) => [r1(x - o[0]), r1(y - o[1])] as P)
  const seg = rel
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - rel[i][0], p[1] - rel[i][1]))
  const total = seg.reduce((a, b) => a + b, 0) || 1
  let acc = 0
  const at = [0, ...seg.map((s) => (acc += s) / total)].map(
    (v) => Math.round(v * 1000) / 1000
  )
  return {
    d: rel.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(""),
    at,
    abs: screen,
  }
}

/** The viewBox round a set of screen points. */
export function viewBoxOf(points: P[], pad = 14) {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const minX = Math.min(...xs) - pad
  const minY = Math.min(...ys) - pad
  return `${minX} ${minY} ${Math.max(...xs) + pad - minX} ${Math.max(...ys) + pad - minY}`
}

// ---------- Plates and bars ----------

function hull(points: P[]): P[] {
  const s = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o: P, a: P, b: P) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const half = (pts: P[]) => {
    const out: P[] = []
    for (const p of pts) {
      while (
        out.length >= 2 &&
        cross(out[out.length - 2], out[out.length - 1], p) <= 0
      )
        out.pop()
      out.push(p)
    }
    return out.slice(0, -1)
  }
  return [...half(s), ...half(s.reverse())]
}

/** A circle standing across the x axis, centre (x, y, z): an ellipse tilted with the y axis. */
const ring = (x: number, y: number, z: number, r: number, n = 32) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return iso(x, y + r * Math.cos(a), z + r * Math.sin(a))
  })

/** A plate on a bar along x, from x to x + t: its rim, its visible (+x) face and the steel hub. */
export function plate(x: number, y: number, z: number, r: number, t: number) {
  const face = ring(x + t, y, z, r)
  return {
    rim: poly(hull([...ring(x, y, z, r), ...face])),
    face: poly(face),
    hub: poly(ring(x + t, y, z, Math.min(r * 0.3, 0.08), 16)),
  }
}
export type PlateShape = ReturnType<typeof plate>

export type PlateTone = "azure" | "iron"
/** Bumpers share one diameter, as on the site's barbell; the weight shows in the thickness. */
export const PLATES = {
  20: { r: 0.3, t: 0.09, tone: "azure" },
  10: { r: 0.3, t: 0.06, tone: "iron" },
  db: { r: 0.09, t: 0.06, tone: "iron" },
  sign: { r: 0.42, t: 0.16, tone: "azure" },
} as const satisfies Record<string, { r: number; t: number; tone: PlateTone }>
export type PlateKind = keyof typeof PLATES

/**
 * A bar along x centred on (cx, y, z), with `load` on each sleeve, inner
 * plate first. The pieces come back in paint order: the far sleeve tip, the
 * far plates outermost first, the shaft with its sleeve stops, the near
 * plates innermost first, the near tip.
 */
export function barbell(
  cx: number,
  y: number,
  z: number,
  { half = 1.1, collar = 0.65, load = [] as PlateKind[], d = 0.035 } = {}
) {
  const sleeve = (a: number, b: number) =>
    box(a, y - d * 1.3, z - d * 1.3, b - a, d * 2.6, d * 2.6)
  let far = cx - collar
  const farPlates = load.map((k) => {
    const { r, t, tone } = PLATES[k]
    far -= t
    return { shape: plate(far, y, z, r, t), tone }
  })
  let near = cx + collar
  const nearPlates = load.map((k) => {
    const { r, t, tone } = PLATES[k]
    const p = { shape: plate(near, y, z, r, t), tone }
    near += t
    return p
  })
  return {
    farTip: sleeve(cx - half, far),
    far: farPlates.reverse(),
    shaft: box(cx - collar, y - d, z - d, collar * 2, d * 2, d * 2),
    stops: [
      box(cx - collar, y - d * 2.2, z - d * 2.2, 0.04, d * 4.4, d * 4.4),
      box(cx + collar - 0.04, y - d * 2.2, z - d * 2.2, 0.04, d * 4.4, d * 4.4),
    ],
    near: nearPlates,
    nearTip: sleeve(near, cx + half),
  }
}
export type BarbellShape = ReturnType<typeof barbell>

// ---------- Palettes ----------

export type IsoTone = "plain" | "onPlatform"

export type Palette = {
  /** The slab the scene stands on. */
  floor: [string, string, string]
  /** Rubber: mats, the platform, the road. */
  mat: [string, string, string]
  /** The lighter centre strip of a lifting platform. */
  strip: string
  /** Walls and roofs. */
  wall: [string, string, string]
  steel: [string, string, string]
  /** Plate face, rim, hub. */
  plate: Record<PlateTone, [string, string, string]>
  /** Hairlines and poles. */
  line: string
  /** Limbs, as a stroke; heads, as a fill. */
  body: string
  head: string
  /** Lettering painted on a wall. */
  letter: string
  /** A sheet of paper: the scheda pinned to the wall. */
  sheet: string
  sheetHead: string
  /** A dark opening: a door, the inside of a window. */
  mouth: string
  glass: string
  sand: string
  sea: [string, string, string]
  tree: string
}

const PLATE_FILLS: Palette["plate"] = {
  azure: ["fill-primary", "fill-(--iso-azure-rim)", "fill-steel"],
  iron: ["fill-steel-dark", "fill-(--iso-iron-rim)", "fill-steel"],
}
const STEEL: Palette["steel"] = [
  "fill-steel",
  "fill-steel-dark",
  "fill-(--iso-iron-rim)",
]

export const PALETTES: Record<IsoTone, Palette> = {
  plain: {
    floor: [
      "fill-(--iso-floor-1)",
      "fill-(--iso-floor-2)",
      "fill-(--iso-floor-3)",
    ],
    mat: [
      "fill-(--iso-rubber-1)",
      "fill-(--iso-rubber-2)",
      "fill-(--iso-rubber-3)",
    ],
    strip: "fill-(--iso-strip)",
    wall: ["fill-(--iso-wall-1)", "fill-(--iso-wall-2)", "fill-(--iso-wall-3)"],
    steel: STEEL,
    plate: PLATE_FILLS,
    line: "stroke-sheet-line",
    body: "stroke-foreground",
    head: "fill-foreground",
    letter: "fill-foreground/70",
    sheet: "fill-background",
    sheetHead: "fill-foreground",
    mouth: "fill-(--iso-rubber-1)",
    glass: "fill-primary/25",
    sand: "fill-(--iso-sand)",
    sea: ["fill-primary/30", "fill-primary/45", "fill-primary/60"],
    tree: "fill-emerald-600/70",
  },
  onPlatform: {
    floor: [
      "fill-(--iso-p-floor-1)",
      "fill-(--iso-p-floor-2)",
      "fill-(--iso-p-floor-3)",
    ],
    mat: [
      "fill-(--iso-p-mat-1)",
      "fill-(--iso-p-mat-2)",
      "fill-(--iso-p-mat-3)",
    ],
    strip: "fill-(--iso-p-strip)",
    wall: [
      "fill-(--iso-p-wall-1)",
      "fill-(--iso-p-wall-2)",
      "fill-(--iso-p-wall-3)",
    ],
    steel: STEEL,
    plate: PLATE_FILLS,
    line: "stroke-platform-muted/50",
    body: "stroke-platform-foreground",
    head: "fill-platform-foreground",
    letter: "fill-platform-foreground/70",
    sheet: "fill-platform-foreground",
    sheetHead: "fill-platform",
    mouth: "fill-platform",
    glass: "fill-primary/35",
    sand: "fill-(--iso-sand)/25",
    sea: ["fill-primary/30", "fill-primary/45", "fill-primary/60"],
    tree: "fill-emerald-400/60",
  },
}

export function Faces({
  b,
  fills,
  opacity,
}: {
  b: Box
  fills: [string, string, string]
  opacity?: number
}) {
  return (
    <g opacity={opacity}>
      <polygon points={b.left} className={fills[2]} />
      <polygon points={b.right} className={fills[1]} />
      <polygon points={b.top} className={fills[0]} />
    </g>
  )
}

export function Plate({
  p,
  fills,
}: {
  p: PlateShape
  fills: [string, string, string]
}) {
  return (
    <>
      <polygon points={p.rim} className={fills[1]} />
      <polygon points={p.face} className={fills[0]} />
      <polygon points={p.hub} className={fills[2]} />
    </>
  )
}

/**
 * A barbell in paint order. `wrap` lets a scene animate a single plate: it
 * gets each plate's side, its index from the inside and the drawn plate.
 */
export function Barbell({
  b,
  pal,
  wrap,
}: {
  b: BarbellShape
  pal: Palette
  wrap?: (
    side: "far" | "near",
    inner: number,
    node: React.ReactNode
  ) => React.ReactNode
}) {
  const draw = (side: "far" | "near") => {
    const plates = b[side]
    return plates.map((p, i) => {
      const inner = side === "far" ? plates.length - 1 - i : i
      const node = (
        <Plate key={`${side}${inner}`} p={p.shape} fills={pal.plate[p.tone]} />
      )
      return wrap ? (
        <g key={`${side}${inner}`}>{wrap(side, inner, node)}</g>
      ) : (
        node
      )
    })
  }
  return (
    <>
      <Faces b={b.farTip} fills={pal.steel} />
      {draw("far")}
      <Faces b={b.shaft} fills={pal.steel} />
      {b.stops.map((s, i) => (
        <Faces key={i} b={s} fills={pal.steel} />
      ))}
      {draw("near")}
      <Faces b={b.nearTip} fills={pal.steel} />
    </>
  )
}

export function Trees({
  at,
  pal,
  z = 0,
}: {
  at: readonly (readonly [number, number])[]
  pal: Palette
  z?: number
}) {
  return at.map(([x, y], i) => {
    const foot = iso(x, y, z)
    const crown = iso(x, y, z + 1.1)
    return (
      <g key={i}>
        <line
          x1={foot[0]}
          y1={foot[1]}
          x2={crown[0]}
          y2={crown[1]}
          className={pal.line}
          strokeWidth={2}
        />
        <ellipse
          cx={crown[0]}
          cy={crown[1] - 3}
          rx={11}
          ry={6}
          className={pal.tree}
        />
      </g>
    )
  })
}

/** A kettlebell on the floor at (x, y): a bell and its handle. */
export function Kettlebell({
  x,
  y,
  tone,
  pal,
}: {
  x: number
  y: number
  tone: PlateTone
  pal: Palette
}) {
  const [cx, cy] = iso(x, y, 0.16)
  return (
    <g>
      <path
        d={`M${cx - 2.6} ${cy - 2}A3 3 0 1 1 ${cx + 2.6} ${cy - 2}`}
        fill="none"
        className="stroke-steel"
        strokeWidth={1.6}
      />
      <circle cx={cx} cy={cy} r={4} className={pal.plate[tone][0]} />
    </g>
  )
}

// ---------- Timing ----------

/** One loop: its length in seconds and the fraction of it at each keyframe (0 first, 1 last). */
export type Clock = { dur: number; at: readonly number[]; begin?: number }

const EASE = "0.45 0 0.55 1"
/** The attributes every keyframed animation of a clock shares: eased, looping. */
export function timing({ dur, at, begin = 0 }: Clock) {
  return {
    dur: `${dur}s`,
    begin: `${begin}s`,
    repeatCount: "indefinite",
    keyTimes: at.join(";"),
    calcMode: "spline",
    keySplines: Array.from({ length: at.length - 1 }, () => EASE).join(";"),
  } as const
}

/** Moves its children through a world-space track, one displacement per keyframe of the clock. */
export function Track({
  clock,
  by,
  children,
}: {
  clock: Clock
  by: [number, number, number][]
  children: React.ReactNode
}) {
  return (
    <g>
      {children}
      <animateTransform
        attributeName="transform"
        type="translate"
        values={by.map((d) => offset(...d)).join(";")}
        {...timing(clock)}
      />
    </g>
  )
}

/** Opacity through the keyframes of a clock: present from `on` to `off` (fractions of the loop). */
export function Blink({
  dur,
  on,
  off,
  begin = 0,
  children,
}: {
  dur: number
  on: number
  off: number
  begin?: number
  children: React.ReactNode
}) {
  const f = 0.02
  return (
    <g opacity={0}>
      {children}
      <animate
        attributeName="opacity"
        values="0;0;1;1;0;0"
        keyTimes={`0;${on};${Math.min(on + f, off)};${off};${Math.min(off + f, 1)};1`}
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
      />
    </g>
  )
}

/**
 * Something that travels along a route (from `route`) at constant speed,
 * appearing at the start and leaving at the end. Visible only with motion
 * allowed; pair it with a still frame for reduced motion.
 */
export function Mover({
  path,
  dur,
  begin = 0,
  keyPoints,
  keyTimes,
  fade,
  children,
}: {
  path: string
  dur: number
  begin?: number
  keyPoints: string
  keyTimes: string
  /** Opacity values/keyTimes for appearing and leaving, e.g. ["0;1;1;0;0", "0;0.04;0.8;0.86;1"]. */
  fade?: [string, string]
  children: React.ReactNode
}) {
  return (
    <g className="motion-reduce:hidden" opacity={fade ? 0 : 1}>
      {children}
      <animateMotion
        path={path}
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        keyPoints={keyPoints}
        keyTimes={keyTimes}
        calcMode="linear"
      />
      {fade ? (
        <animate
          attributeName="opacity"
          values={fade[0]}
          keyTimes={fade[1]}
          dur={`${dur}s`}
          begin={`${begin}s`}
          repeatCount="indefinite"
        />
      ) : null}
    </g>
  )
}

// ---------- People ----------

type Joint = "foot" | "knee" | "hip" | "shoulder" | "head" | "hand"
/** A pose in the figure's own frame: each joint as (forward, up), forward being +y. */
export type Pose = Record<Joint, readonly [number, number]>

export const STANDING: Pose = {
  foot: [0, 0],
  knee: [0.03, 0.48],
  hip: [0, 0.92],
  shoulder: [0, 1.42],
  head: [0.02, 1.62],
  hand: [0.06, 0.8],
}

/** How far each side's joint sits from the midline, along x. */
const SPREAD: Record<Exclude<Joint, "head">, number> = {
  foot: 0.13,
  knee: 0.12,
  hip: 0.1,
  shoulder: 0.17,
  hand: 0.2,
}

/**
 * A person standing at world (x, y, z) facing +y, drawn as limbs and a
 * head. Given several poses and a clock, every joint moves through them;
 * given one, the figure stands still. `grip` is half the distance between
 * the hands, for a bar.
 */
export function Person({
  x,
  y,
  z = 0,
  poses,
  clock,
  grip = SPREAD.hand,
  shirt,
  pal,
}: {
  x: number
  y: number
  z?: number
  poses: readonly Pose[]
  clock?: Clock
  grip?: number
  shirt?: string
  pal: Palette
}) {
  const at = (j: Joint, side: number) =>
    poses.map((p) => {
      const spread = j === "head" ? 0 : j === "hand" ? grip : SPREAD[j]
      return iso(x + side * spread, y + p[j][0], z + p[j][1])
    })
  const t = clock && poses.length > 1 ? timing(clock) : null

  const bone = (
    a: P[],
    b: P[],
    className: string,
    width: number,
    key: string
  ) => (
    <line
      key={key}
      x1={a[0][0]}
      y1={a[0][1]}
      x2={b[0][0]}
      y2={b[0][1]}
      className={className}
      strokeWidth={width}
      strokeLinecap="round"
    >
      {t
        ? (
            [
              ["x1", a, 0],
              ["y1", a, 1],
              ["x2", b, 0],
              ["y2", b, 1],
            ] as const
          ).map(([attr, pts, k]) => (
            <animate
              key={attr}
              attributeName={attr}
              values={pts.map((p) => p[k]).join(";")}
              {...t}
            />
          ))
        : null}
    </line>
  )
  // The -x side is the far one: its limbs go down first.
  const side = (s: number) => [
    bone(at("foot", s), at("knee", s), pal.body, 3, `shin${s}`),
    bone(at("knee", s), at("hip", s), pal.body, 3.4, `thigh${s}`),
  ]
  const arm = (s: number) =>
    bone(at("shoulder", s), at("hand", s), pal.body, 2.4, `arm${s}`)
  const head = at("head", 0)

  return (
    <g>
      {side(-1)}
      {arm(-1)}
      {bone(at("hip", 0), at("shoulder", 0), shirt ?? pal.body, 6, "torso")}
      {side(1)}
      {arm(1)}
      <circle cx={head[0][0]} cy={head[0][1]} r={3.6} className={pal.head}>
        {t ? (
          <>
            <animate
              attributeName="cx"
              values={head.map((p) => p[0]).join(";")}
              {...t}
            />
            <animate
              attributeName="cy"
              values={head.map((p) => p[1]).join(";")}
              {...t}
            />
          </>
        ) : null}
      </circle>
    </g>
  )
}
