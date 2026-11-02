import { NextResponse, type NextRequest } from "next/server"

import { findFile } from "@/lib/admin/files"
import { formatJson } from "@/lib/admin/format"
import { fail, guard } from "@/lib/admin/request"
import { readEditable, StorageError, writeEditable } from "@/lib/admin/storage"
import { validateEdit } from "@/lib/admin/validate"

const MAX_BODY = 1_000_000

export async function POST(req: NextRequest) {
  const denied = await guard(req, { mutates: true })
  if (denied) return denied

  const raw = await req.text()
  if (raw.length > MAX_BODY) return fail(413, "Il file è troppo grande.")

  let body: { id?: unknown; sha?: unknown; value?: unknown }
  try {
    body = JSON.parse(raw)
  } catch {
    return fail(400, "Richiesta non valida.")
  }
  const file = typeof body.id === "string" ? findFile(body.id) : undefined
  if (!file || typeof body.sha !== "string") return fail(400, "File non modificabile dall'editor.")

  try {
    const current = await readEditable(file.path)
    if (current.sha !== body.sha) {
      return fail(
        409,
        "Qualcun altro ha salvato questo file nel frattempo. Ricarica la pagina per vedere la versione aggiornata, poi rifai le modifiche.",
        { conflict: true }
      )
    }

    const result = validateEdit(file, body.value, JSON.parse(current.text))
    if (!result.ok) {
      return fail(422, "Ci sono dei campi da correggere.", { issues: result.issues })
    }

    const text = formatJson(result.data, { compact: file.kind === "content" })
    if (text === current.text) {
      return NextResponse.json({ ok: true, unchanged: true, sha: current.sha })
    }
    const saved = await writeEditable(file.path, text, current.sha)
    return NextResponse.json({ ok: true, sha: saved.sha, commitUrl: saved.commitUrl ?? null })
  } catch (e) {
    if (e instanceof StorageError) return fail(e.status, e.message, e.conflict ? { conflict: true } : undefined)
    console.error("[admin] save failed", e)
    return fail(500, "Salvataggio non riuscito. Riprova tra poco.")
  }
}
