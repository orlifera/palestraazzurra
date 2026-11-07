import "./first-load.css"

import { FirstLoadShell } from "./first-load-shell"
import { SHARK } from "./first-load-art"

const INK = "#231f20"
const TAIL_BEAT = "0.46s"

/** Left in the shark's wake as it swims in. */
const BUBBLES = [
  { x: "9%", y: "60%", s: "1rem", d: "0.1s" },
  { x: "16%", y: "47%", s: "0.65rem", d: "0.2s" },
  { x: "23%", y: "57%", s: "1.3rem", d: "0.3s" },
  { x: "30%", y: "64%", s: "0.75rem", d: "0.42s" },
  { x: "36%", y: "50%", s: "0.95rem", d: "0.54s" },
  { x: "42%", y: "61%", s: "0.6rem", d: "0.66s" },
]

/** First-load intro. Server-rendered, so the drawing stays out of the JavaScript bundle. */
export function FirstLoad() {
  return (
    <FirstLoadShell>
      <div className="fl-half fl-half-top" />
      <div className="fl-half fl-half-bottom" />

      {BUBBLES.map((b) => (
        <span
          key={b.x + b.d}
          className="fl-bubble"
          style={{ "--x": b.x, "--y": b.y, "--s": b.s, "--d": b.d } as React.CSSProperties}
        />
      ))}

      <div className="fl-stage">
        <div className="fl-swim">
          <div className="fl-bob">
            <div className="fl-pose">
              {/* In the logo's own coordinates. */}
              <svg className="fl-shark" viewBox="200 150 550 230">
                <defs>
                  <clipPath id="fl-lens">
                    <path d={SHARK.lens} />
                  </clipPath>
                </defs>

                {/* The body and tail the logo doesn't show, beating as it swims. */}
                <g className="fl-pectoral">
                  <path d={SHARK.pecInk} fill={INK} />
                  <path d={SHARK.pecFill} fill="#fff" />
                </g>
                <path d={SHARK.swimInk[0]} fill={INK}>
                  <animate
                    attributeName="d"
                    dur={TAIL_BEAT}
                    repeatCount="indefinite"
                    values={SHARK.swimInk.join(";")}
                  />
                </path>
                <path d={SHARK.swimFill[0]} fill="#fff">
                  <animate
                    attributeName="d"
                    dur={TAIL_BEAT}
                    repeatCount="indefinite"
                    values={SHARK.swimFill.join(";")}
                  />
                </path>

                {/* The logo's head. */}
                <path d={SHARK.headFill.d} transform={SHARK.headFill.t} fill="#fff" />
                <path d={SHARK.head} fill={INK} />
                <g clipPath="url(#fl-lens)">
                  <rect
                    className="fl-glint"
                    x="618"
                    y="165"
                    width="9"
                    height="50"
                    fill="#fff"
                    transform="rotate(20 622 190)"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="fl-fin">
        <svg viewBox="0 0 120 100">
          <path d={SHARK.slicerInk} fill={INK} />
          <path d={SHARK.slicerFill} fill="#fff" />
        </svg>
      </div>
    </FirstLoadShell>
  )
}
