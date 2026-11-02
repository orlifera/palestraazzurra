import { NextResponse, type NextRequest } from "next/server"

import { isLoggedIn } from "@/lib/admin/session"

export function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin")
  if (!origin) return false
  try {
    return new URL(origin).host === req.headers.get("host")
  } catch {
    return false
  }
}

export function clientIp(req: NextRequest) {
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon"
}

export function fail(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status, headers: { "Cache-Control": "no-store" } })
}

/**
 * Guards an admin API route. Returns a response to send back when the request
 * is not allowed, or null when it may go ahead.
 */
export async function guard(req: NextRequest, { mutates }: { mutates: boolean }) {
  if (mutates && !isSameOrigin(req)) return fail(403, "Richiesta non consentita.")
  if (!(await isLoggedIn())) return fail(401, "Sessione scaduta: accedi di nuovo.")
  return null
}
