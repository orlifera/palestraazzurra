"use client"

import { Share08Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

export type Card = {
  /** Printed in the sheet's header strip, e.g. "Il mio massimale". */
  title: string
  /** The big line, e.g. "112,5 kg"; optional for list cards. */
  headline?: string
  /** Rows on the sheet, ticked in azure. */
  rows: string[]
  /** File name, without extension. */
  name: string
}

const W = 1080
const H = 1920

/** A token's computed colour, so the card follows the site's palette. */
const token = (name: string) => {
  const probe = document.createElement("span")
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/** Wraps `text` to `width`, returning the lines. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = []
  let line = ""
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > width && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

/**
 * The card as a Story-sized PNG: the rubber platform, a scheda clipped to
 * it with its ink header, the headline in display caps, rows ticked in
 * azure, the gym's handle at the foot.
 */
async function draw(card: Card, footer: string) {
  await document.fonts.ready
  const family = getComputedStyle(document.body).fontFamily
  const ink = "#0f1419"
  const azure = token("--primary")
  const canvas = Object.assign(document.createElement("canvas"), { width: W, height: H })
  const ctx = canvas.getContext("2d")!
  const font = (weight: number, size: number) => {
    ctx.font = `${weight} ${size}px ${family}`
    ctx.wordSpacing = `${-0.18 * size}px`
  }

  // The platform, with its grain.
  ctx.fillStyle = ink
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = "rgba(255,255,255,0.05)"
  for (let y = 0; y < H; y += 10) for (let x = (y / 10) % 2 ? 5 : 0; x < W; x += 10) ctx.fillRect(x, y, 1.6, 1.6)

  // The bar across the top, with a plate either side.
  ctx.fillStyle = "#b9bec4"
  ctx.fillRect(90, 210, W - 180, 18)
  ctx.fillStyle = azure
  for (const x of [150, W - 150 - 46]) {
    ctx.beginPath()
    ctx.roundRect(x, 120, 46, 200, 12)
    ctx.fill()
  }

  font(800, 64)
  ctx.fillStyle = "#ffffff"
  ctx.textBaseline = "alphabetic"
  ctx.fillText("PALESTRA", 90, 440)
  ctx.fillStyle = azure
  ctx.fillText("AZZURRA", 90, 510)

  // The scheda, sized to what it holds and centred under the name.
  const x = 70
  const w = W - 140
  const HEAD = 120
  font(700, 44)
  const rows = card.rows.map((r) => wrap(ctx, r.toUpperCase(), w - 190))
  const body = (card.headline ? 340 : 0) + rows.reduce((h, lines) => h + 44 + lines.length * 62, 0) + 60
  const top = 580
  const room = H - 260 - top
  const sheetH = Math.min(room, HEAD + 70 + body)
  const y = top + Math.max(0, (room - sheetH) / 2)

  ctx.fillStyle = "#ffffff"
  ctx.beginPath()
  ctx.roundRect(x, y, w, sheetH, 40)
  ctx.fill()
  // The printed header, inset so the white edge frames it on the dark ground.
  ctx.fillStyle = ink
  ctx.beginPath()
  ctx.roundRect(x + 8, y + 8, w - 16, HEAD - 8, [32, 32, 0, 0])
  ctx.fill()
  font(700, 32)
  ctx.fillStyle = "#ffffff"
  const heading = card.title.toUpperCase()
  ctx.fillText(heading, x + 50, y + 76)
  // Long titles take the whole header: the name is already above the sheet.
  const brand = "PALESTRA AZZURRA"
  if (ctx.measureText(heading).width + ctx.measureText(brand).width + 60 <= w - 100) {
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.textAlign = "right"
    ctx.fillText(brand, x + w - 50, y + 76)
    ctx.textAlign = "left"
  }

  let cy = y + HEAD + 70
  if (card.headline) {
    // As big as fits in two lines.
    let size = 180
    let lines: string[] = []
    for (; size >= 90; size -= 10) {
      font(800, size)
      lines = wrap(ctx, card.headline.toUpperCase(), w - 100)
      if (lines.length <= 2) break
    }
    ctx.fillStyle = azure
    lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, x + 50, cy + size * 0.8 + i * size * 0.9))
    cy += size * 0.9 * Math.min(lines.length, 2) + 80
  }
  font(700, 44)
  for (const lines of rows) {
    if (cy + lines.length * 62 > y + sheetH - 40) break
    ctx.strokeStyle = "#d3dbe4"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x + 50, cy - 10)
    ctx.lineTo(x + w - 50, cy - 10)
    ctx.stroke()
    // The stamped tick.
    ctx.strokeStyle = azure
    ctx.lineWidth = 7
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(x + 58, cy + 40)
    ctx.lineTo(x + 76, cy + 58)
    ctx.lineTo(x + 108, cy + 22)
    ctx.stroke()
    ctx.fillStyle = ink
    lines.forEach((l, i) => ctx.fillText(l, x + 140, cy + 56 + i * 62))
    cy += 44 + lines.length * 62
  }

  font(700, 36)
  ctx.fillStyle = "#ffffff"
  ctx.fillText(footer.toUpperCase(), 90, H - 140)

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas"))), "image/png")
  )
}

/** Shares the card as an image where the device can (Instagram Stories on phones), or saves it. */
export function ShareButton({ card, className }: { card: () => Card; className?: string }) {
  const t = useTranslations("share")
  const [busy, setBusy] = useState(false)

  const share = async () => {
    setBusy(true)
    try {
      const c = card()
      const file = new File([await draw(c, t("footer"))], `${c.name}.png`, { type: "image/png" })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: c.title })
      } else {
        const url = URL.createObjectURL(file)
        Object.assign(document.createElement("a"), { href: url, download: file.name }).click()
        URL.revokeObjectURL(url)
        toast.success(t("saved"))
      }
    } catch (e) {
      // Closing the share sheet is not an error.
      if (!(e instanceof DOMException && e.name === "AbortError")) console.error(e)
    }
    setBusy(false)
  }

  return (
    <button
      type="button"
      onClick={share}
      disabled={busy}
      aria-busy={busy}
      className={cn(
        "font-stamp inline-flex h-12 items-center gap-2 rounded-full border-2 border-foreground px-5 text-sm transition hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:opacity-60",
        className
      )}
    >
      <HugeiconsIcon icon={Share08Icon} className="size-4.5" />
      {t("button")}
    </button>
  )
}
