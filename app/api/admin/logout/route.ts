import { NextResponse, type NextRequest } from "next/server"

import { fail, isSameOrigin } from "@/lib/admin/request"
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/admin/session"

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return fail(403, "Richiesta non consentita.")
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 })
  return res
}
