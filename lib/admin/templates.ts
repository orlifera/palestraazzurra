/**
 * New-item shapes for lists that may be empty, keyed by file id and the list's
 * path with indices written as "*". Lists not listed here copy the shape of
 * their first item with every value blanked.
 */

const pair = () => ({ it: "", en: "" })

const TEMPLATES: Record<string, () => unknown> = {
  "hours:closures": () => ({ from: "", to: "", note: pair() }),
  "staff:": () => ({ id: "", name: "", photo: "", instagram: "", courses: [] }),
  "workout:exercises": () => ({ name: pair(), sets: 3, reps: "10", rest: 60 }),
  "exercises:groups": () => ({ id: "", name: pair(), exercises: [] }),
  "exercises:groups.*.exercises": () => ({ name: pair(), how: pair(), photo: "" }),
}

export function blank(value: unknown): unknown {
  if (Array.isArray(value)) return []
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blank(v)]))
  }
  if (typeof value === "number") return 0
  if (typeof value === "boolean") return false
  return ""
}

export function newItem(fileId: string, path: (string | number)[], list: unknown[]) {
  const key = `${fileId}:${path.map((p) => (typeof p === "number" ? "*" : p)).join(".")}`
  const template = TEMPLATES[key]
  if (template) return template()
  if (list.length) return blank(list[0])
  return ""
}
