"use client"

import { motion, useScroll, useTransform } from "motion/react"
import { useId, useRef } from "react"

import CountUp from "@/components/react-bits/CountUp"
import { cn } from "@/lib/utils"

type PlateFaceProps = {
  value: number
  /** Stamped around the rim, like the lettering moulded into a bumper. */
  label: string
  tone?: "azure" | "ink"
  className?: string
}

/** A bumper plate seen face-on. It rolls as the page scrolls; the number counts up. */
export function PlateFace({ value, label, tone = "azure", className }: PlateFaceProps) {
  const ref = useRef<HTMLDivElement>(null)
  const uid = useId().replace(/:/g, "")
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const rotate = useTransform(scrollYProgress, [0, 1], tone === "azure" ? [-30, 30] : [24, -24])

  const fill = tone === "azure" ? "var(--primary)" : "var(--platform)"
  const ink = tone === "azure" ? "var(--primary-foreground)" : "var(--platform-foreground)"
  const rim = `${label} · ${label} · `

  return (
    <div ref={ref} className={cn("relative aspect-square", className)}>
      <motion.svg viewBox="0 0 400 400" className="absolute inset-0 size-full" style={{ rotate }} aria-hidden>
        <defs>
          <path id={`rim-${uid}`} d="M200,200 m-158,0 a158,158 0 1,1 316,0 a158,158 0 1,1 -316,0" />
        </defs>
        <circle cx="200" cy="200" r="198" fill={fill} />
        <circle cx="200" cy="200" r="186" fill="none" stroke={ink} strokeOpacity="0.16" strokeWidth="2" />
        <circle cx="200" cy="200" r="132" fill="none" stroke={ink} strokeOpacity="0.16" strokeWidth="2" />
        <text
          fill={ink}
          fontSize="19"
          fontWeight="700"
          letterSpacing="3.2"
          style={{ fontStretch: "75%", textTransform: "uppercase" }}
        >
          <textPath href={`#rim-${uid}`}>{rim.toUpperCase()}</textPath>
        </text>
        {/* Steel insert ring around the centre. */}
        <circle cx="200" cy="200" r="122" fill="none" stroke="var(--steel)" strokeWidth="5" />
      </motion.svg>
      <div
        className="absolute inset-[24%] flex items-center justify-center"
        style={{ color: ink }}
      >
        <span className="font-display tabular -translate-y-[0.06em] text-[clamp(3.5rem,9vw,7.5rem)] leading-none">
          <CountUp to={value} duration={1.6} easing="expo" mode="roll" />
        </span>
      </div>
    </div>
  )
}
