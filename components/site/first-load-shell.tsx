"use client"

import { useEffect, useRef, useState } from "react"

/** Where a skip jumps to: the fin starting its slice. See first-load.css. */
const FIRST_LOAD_SKIP_TO_MS = 1700
const DONE_EVENT = "azzurra:first-load-done"
const SEEN_KEY = "azzurra:first-load-seen"

/**
 * Runs while the HTML is parsed, before first paint: returning visitors never
 * see the intro. It also hides the intro when the animation ends, so nothing
 * depends on React having hydrated by then.
 */
const INLINE = `(function(){var e=document.getElementById("first-load");if(!e)return;try{if(sessionStorage.getItem("${SEEN_KEY}")){e.hidden=true;return}sessionStorage.setItem("${SEEN_KEY}","1")}catch(_){}e.addEventListener("animationend",function(a){if(a.target===e)e.hidden=true})})()`

const isOff = (el: HTMLElement) =>
  el.hidden || getComputedStyle(el).display === "none"

/** Runs `run` once the intro is out of the way, at once if there isn't one. Returns a cancel. */
export function afterFirstLoad(run: () => void) {
  const el = document.getElementById("first-load")
  if (!el || isOff(el)) {
    run()
    return () => {}
  }
  window.addEventListener(DONE_EVENT, run, { once: true })
  return () => window.removeEventListener(DONE_EVENT, run)
}

/** Survives client-side remounts (a locale switch), where the inline script doesn't run again. */
let played = false

export function FirstLoadShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(played)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const finish = () => {
      played = true
      setGone(true)
      window.dispatchEvent(new Event(DONE_EVENT))
    }
    if (isOff(el)) {
      finish()
      return
    }

    // Any tap, scroll or key jumps straight to the slice rather than cutting away.
    const skip = () => {
      for (const a of el.getAnimations({ subtree: true })) {
        if (Number(a.currentTime) < FIRST_LOAD_SKIP_TO_MS) a.currentTime = FIRST_LOAD_SKIP_TO_MS
      }
    }
    const onEnd = (e: AnimationEvent) => {
      if (e.target === el) finish()
    }
    el.addEventListener("animationend", onEnd)
    el.addEventListener("pointerdown", skip)
    window.addEventListener("wheel", skip, { passive: true })
    window.addEventListener("touchmove", skip, { passive: true })
    window.addEventListener("keydown", skip)
    return () => {
      el.removeEventListener("animationend", onEnd)
      el.removeEventListener("pointerdown", skip)
      window.removeEventListener("wheel", skip)
      window.removeEventListener("touchmove", skip)
      window.removeEventListener("keydown", skip)
    }
  }, [])

  if (gone) return null

  return (
    <>
      <div ref={ref} id="first-load" className="fl" aria-hidden suppressHydrationWarning>
        {children}
      </div>
      {/* Text on the server, inert on the client: the script must only run from the HTML. */}
      <script
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: INLINE }}
      />
    </>
  )
}
