import { cookies } from "next/headers"

/**
 * A stateless admin session: the cookie holds an expiry time signed with
 * HMAC-SHA256 (Web Crypto). There is only one role, so there is nothing else
 * to store. Changing ADMIN_SECRET (or the password, when no secret is set)
 * logs everyone out.
 */

export const SESSION_COOKIE = "azzurra_admin"
export const SESSION_TTL_SECONDS = 12 * 60 * 60

const encoder = new TextEncoder()

export function adminPassword() {
  const pw = process.env.ADMIN_PASSWORD
  return pw && pw.length > 0 ? pw : null
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let bin = ""
  for (const b of arr) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function signingKey() {
  const secret = process.env.ADMIN_SECRET || (adminPassword() ? `azzurra-admin-session:${adminPassword()}` : null)
  if (!secret) return null
  // Hash first so a short password still yields a full-length key.
  const material = await crypto.subtle.digest("SHA-256", encoder.encode(secret))
  return crypto.subtle.importKey("raw", material, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
}

async function sign(payload: string) {
  const key = await signingKey()
  if (!key) return null
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)))
}

/** Compares two strings in time that does not depend on where they differ. */
export async function safeEqual(a: string, b: string) {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ])
  const x = new Uint8Array(ha)
  const y = new Uint8Array(hb)
  let diff = a.length === b.length ? 0 : 1
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}

export async function createSessionValue() {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS)
  const sig = await sign(exp)
  return sig ? `${exp}.${sig}` : null
}

export async function verifySessionValue(value: string | undefined) {
  if (!value || !adminPassword()) return false
  const [exp, sig, ...rest] = value.split(".")
  if (!exp || !sig || rest.length || !/^\d+$/.test(exp)) return false
  if (Number(exp) < Date.now() / 1000) return false
  const expected = await sign(exp)
  return expected ? safeEqual(sig, expected) : false
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
}

/** True when the current request carries a valid admin session. */
export async function isLoggedIn() {
  const store = await cookies()
  return verifySessionValue(store.get(SESSION_COOKIE)?.value)
}
