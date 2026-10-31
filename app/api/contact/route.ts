import { NextResponse, type NextRequest } from "next/server"

import { contact } from "@/data/site"
import { contactSchema } from "@/lib/contact-schema"
import { allow } from "@/lib/rate-limit"

const MAX_BODY = 16_000

function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin")
  if (!origin) return false
  try {
    return new URL(origin).host === req.headers.get("host")
  } catch {
    return false
  }
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return new NextResponse(null, { status: 403 })

  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon"
  if (!allow(`contact:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "rate" }, { status: 429 })
  }

  const raw = await req.text()
  if (raw.length > MAX_BODY) return NextResponse.json({ ok: false, error: "server" }, { status: 413 })

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false, error: "server" }, { status: 400 })
  }

  // Bots fill the hidden field: pretend it worked.
  if (typeof body === "object" && body && "website" in body && (body as { website?: string }).website) {
    return NextResponse.json({ ok: true })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]))
    return NextResponse.json({ ok: false, error: "validation", fields }, { status: 422 })
  }

  const { name, email, subject, message, locale } = parsed.data
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] RESEND_API_KEY not set; message not sent:", { name, email, subject, message, locale })
      return NextResponse.json({ ok: true, dev: true })
    }
    console.error("[contact] RESEND_API_KEY missing")
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 })
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Palestra Azzurra <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO ?? contact.email],
      reply_to: email,
      subject: `[Sito] ${subject}`,
      text: `${message}\n\n— ${name} <${email}> (${locale.toUpperCase()})\nConsenso trattamento dati: accettato`,
      html: `<p style="white-space:pre-wrap">${escape(message)}</p><hr><p><strong>${escape(name)}</strong> &lt;${escape(email)}&gt; · ${locale.toUpperCase()}<br>Consenso trattamento dati: accettato</p>`,
    }),
  })

  if (!res.ok) {
    console.error("[contact] Resend error", res.status, await res.text().catch(() => ""))
    return NextResponse.json({ ok: false, error: "server" }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
