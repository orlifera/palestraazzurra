import { NextResponse, type NextRequest } from "next/server"

import { allow } from "@/lib/rate-limit"
import { clientIp, fail, isSameOrigin } from "@/lib/admin/request"
import { adminPassword, createSessionValue, safeEqual, SESSION_COOKIE, sessionCookieOptions } from "@/lib/admin/session"

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return fail(403, "Richiesta non consentita.")

  const password = adminPassword()
  if (!password) return fail(503, "L'editor non è configurato.")

  if (!allow(`admin-login:${clientIp(req)}`, 5, 10 * 60_000)) {
    return fail(429, "Troppi tentativi. Riprova tra qualche minuto.")
  }

  const raw = await req.text()
  if (raw.length > 2_000) return fail(413, "Richiesta troppo grande.")
  let given = ""
  try {
    const body = JSON.parse(raw) as { password?: unknown }
    if (typeof body.password === "string") given = body.password
  } catch {
    return fail(400, "Richiesta non valida.")
  }

  if (!(await safeEqual(given, password))) return fail(401, "Password errata.")

  const value = await createSessionValue()
  if (!value) return fail(503, "L'editor non è configurato.")
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
  res.cookies.set(SESSION_COOKIE, value, sessionCookieOptions)
  return res
}
