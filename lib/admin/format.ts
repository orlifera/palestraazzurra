/**
 * Writes JSON the way the content files are written by hand: two-space indent,
 * with small objects and lists kept on one line when they fit.
 */

const WIDTH = 120

function inline(value: unknown): string {
  if (Array.isArray(value)) return value.length ? `[${value.map(inline).join(", ")}]` : "[]"
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined)
    return entries.length ? `{ ${entries.map(([k, v]) => `${JSON.stringify(k)}: ${inline(v)}`).join(", ")} }` : "{}"
  }
  return JSON.stringify(value)
}

function block(value: unknown, indent: string, prefix: string, depth: number): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value)
  const flat = inline(value)
  if (depth > 0 && indent.length + prefix.length + flat.length + 1 <= WIDTH) return flat
  const inner = indent + "  "
  if (Array.isArray(value)) {
    if (!value.length) return "[]"
    return `[\n${value.map((v) => inner + block(v, inner, "", depth + 1)).join(",\n")}\n${indent}]`
  }
  const entries = Object.entries(value).filter(([, v]) => v !== undefined)
  if (!entries.length) return "{}"
  return `{\n${entries
    .map(([k, v]) => {
      const p = `${JSON.stringify(k)}: `
      return inner + p + block(v, inner, p, depth + 1)
    })
    .join(",\n")}\n${indent}}`
}

export function formatJson(value: unknown, { compact }: { compact: boolean }) {
  return (compact ? block(value, "", "", 0) : JSON.stringify(value, null, 2)) + "\n"
}
