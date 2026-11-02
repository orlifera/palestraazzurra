import { NextResponse, type NextRequest } from "next/server"

import { fail, guard } from "@/lib/admin/request"
import { sha256Hex, StorageError, writeUpload } from "@/lib/admin/storage"

const MAX_BYTES = 3 * 1024 * 1024

/** Recognises the image by its first bytes, not by what the browser claims. */
function sniff(b: Uint8Array): "jpg" | "png" | "webp" | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg"
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png"
  const ascii = (from: number, to: number) => String.fromCharCode(...b.subarray(from, to))
  if (b.length > 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp"
  return null
}

function slugify(name: string) {
  const base = name.replace(/\.[^.]*$/, "")
  const slug = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "")
  return slug || "foto"
}

export async function POST(req: NextRequest) {
  const denied = await guard(req, { mutates: true })
  if (denied) return denied

  const declared = Number(req.headers.get("content-length") ?? 0)
  if (declared > MAX_BYTES + 64 * 1024) return fail(413, "La foto supera i 3 MB.")

  let file: File | null = null
  try {
    const form = await req.formData()
    const entry = form.get("file")
    if (entry instanceof File) file = entry
  } catch {
    return fail(400, "Richiesta non valida.")
  }
  if (!file) return fail(400, "Nessuna foto ricevuta.")
  if (file.size > MAX_BYTES) return fail(413, "La foto supera i 3 MB.")

  const bytes = new Uint8Array(await file.arrayBuffer())
  const ext = sniff(bytes)
  if (!ext) return fail(415, "Formato non supportato: usa una foto JPG, PNG o WebP.")

  const hash = (await sha256Hex(bytes)).slice(0, 8)
  const name = `${slugify(file.name)}-${hash}.${ext}`
  try {
    const saved = await writeUpload(`public/images/uploads/${name}`, bytes)
    return NextResponse.json({ ok: true, path: `/images/uploads/${name}`, commitUrl: saved.commitUrl ?? null })
  } catch (e) {
    if (e instanceof StorageError) return fail(e.status, e.message)
    console.error("[admin] upload failed", e)
    return fail(500, "Caricamento non riuscito. Riprova tra poco.")
  }
}
