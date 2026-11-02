import { z } from "zod"

import { schemas } from "@/lib/content"
import type { EditableFile } from "@/lib/admin/files"

export type Issue = { path: (string | number)[]; message: string }

const fallback = z.locales.it().localeError

/** Plain-Italian messages for the generic checks; the schemas' own messages take precedence. */
const italian: z.core.$ZodErrorMap = (iss) => {
  if (iss.code === "invalid_type") {
    if (iss.expected === "number") return "Inserisci un numero."
    if (iss.expected === "int") return "Inserisci un numero intero."
    if (iss.expected === "string") return "Inserisci un testo."
    if (iss.expected === "boolean") return "Scegli sì o no."
    return "Campo mancante o non valido."
  }
  if (iss.code === "too_small" && iss.origin === "string") {
    return Number(iss.minimum) <= 1 ? "Campo obbligatorio." : `Scrivi almeno ${iss.minimum} caratteri.`
  }
  if (iss.code === "too_big" && iss.origin === "string") return `Massimo ${iss.maximum} caratteri.`
  if (iss.code === "too_small" && iss.origin === "number") return `Il valore minimo è ${iss.minimum}.`
  if (iss.code === "too_big" && iss.origin === "number") return `Il valore massimo è ${iss.maximum}.`
  if (iss.code === "invalid_value") return "Valore non consentito."
  return fallback(iss)
}

/**
 * Checks an edited value before it is committed. Content files go through
 * their zod schema; message files must keep the exact shape of the current
 * file, since the site looks every text up by its key.
 */
export function validateEdit(file: EditableFile, value: unknown, current: unknown) {
  if (file.kind === "content") {
    const parsed = schemas[file.id].safeParse(value, { error: italian })
    if (parsed.success) return { ok: true as const, data: parsed.data as unknown }
    const issues: Issue[] = parsed.error.issues.map((i) => ({
      path: i.path.filter((p): p is string | number => typeof p !== "symbol"),
      message: i.message,
    }))
    return { ok: false as const, issues }
  }
  const issues: Issue[] = []
  compareShape(current, value, [], issues)
  return issues.length ? { ok: false as const, issues } : { ok: true as const, data: value }
}

const kind = (v: unknown) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v)

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string")
}

/** The {placeholders} and <tags> of an ICU message, which the code fills in by name. */
function tokens(s: string) {
  const names = new Set<string>()
  for (const m of s.matchAll(/\{\s*([A-Za-z_]\w*)/g)) names.add(`{${m[1]}}`)
  for (const m of s.matchAll(/<\/?([A-Za-z]\w*)>/g)) names.add(`<${m[1]}>`)
  return names
}

function balanced(s: string) {
  let depth = 0
  for (const c of s) {
    if (c === "{") depth++
    else if (c === "}" && --depth < 0) return false
  }
  return depth === 0
}

function checkText(after: unknown, path: (string | number)[], issues: Issue[], allowed: Set<string>, required: Set<string>) {
  if (typeof after !== "string") {
    issues.push({ path, message: "Qui ci va un testo." })
    return
  }
  if (!balanced(after)) {
    issues.push({ path, message: "Le parentesi graffe { } non sono bilanciate." })
    return
  }
  const have = tokens(after)
  const missing = [...required].filter((t) => !have.has(t))
  const extra = [...have].filter((t) => !allowed.has(t))
  if (missing.length) issues.push({ path, message: `Lascia invariati questi segnaposto: ${missing.join(", ")}` })
  else if (extra.length) issues.push({ path, message: `Segnaposto non previsti: ${extra.join(", ")}` })
}

function compareShape(before: unknown, after: unknown, path: (string | number)[], issues: Issue[]) {
  if (typeof before === "string") {
    const t = tokens(before)
    checkText(after, path, issues, t, t)
    return
  }
  if (kind(before) !== kind(after)) {
    issues.push({ path, message: "Il tipo di questo campo non può cambiare." })
    return
  }
  if (Array.isArray(before)) {
    const list = after as unknown[]
    if (isStringArray(before)) {
      if (!isStringArray(list)) issues.push({ path, message: "Qui ci va un elenco di testi." })
      else {
        // Items may be added or removed, so only placeholders already used in the list are allowed.
        const allowed = new Set(before.flatMap((s) => [...tokens(s)]))
        list.forEach((s, i) => checkText(s, [...path, i], issues, allowed, new Set()))
      }
      return
    }
    if (list.length !== before.length) {
      issues.push({ path, message: "Il numero di elementi di questo elenco non può cambiare." })
      return
    }
    before.forEach((b, i) => compareShape(b, list[i], [...path, i], issues))
    return
  }
  if (before && typeof before === "object") {
    const a = before as Record<string, unknown>
    const b = after as Record<string, unknown>
    const ka = Object.keys(a)
    const kb = Object.keys(b)
    if (ka.length !== kb.length || ka.some((k) => !(k in b))) {
      issues.push({ path, message: "Le voci di questa sezione non possono cambiare." })
      return
    }
    for (const k of ka) compareShape(a[k], b[k], [...path, k], issues)
    return
  }
  // numbers, booleans, null: may change value but not type (checked above).
}
