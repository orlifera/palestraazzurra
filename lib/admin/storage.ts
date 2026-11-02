import { ALLOWED_PATHS } from "@/lib/admin/files"

/**
 * Where the editable files live. In production they are read from and
 * committed to GitHub (the host rebuilds the site on every commit). In
 * development without a GITHUB_TOKEN, the files on disk are used instead.
 */

export class StorageError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly conflict = false
  ) {
    super(message)
  }
}

export type Mode = "github" | "local" | "unconfigured"

export function storageMode(): Mode {
  if (process.env.GITHUB_TOKEN) return "github"
  if (process.env.NODE_ENV !== "production") return "local"
  return "unconfigured"
}

const UNCONFIGURED =
  "Il salvataggio non è configurato: manca il token di GitHub (GITHUB_TOKEN). Contatta chi gestisce il sito."

const repo = () => process.env.GITHUB_REPO || "orlifera/palestraazzurra"
const branch = () => process.env.GITHUB_BRANCH || "main"

const UPLOAD_PATH = /^public\/images\/uploads\/[a-z0-9-]+\.(jpg|png|webp)$/

function assertAllowed(path: string, { upload = false } = {}) {
  if (upload ? !UPLOAD_PATH.test(path) : !ALLOWED_PATHS.has(path)) {
    throw new StorageError("File non modificabile dall'editor.", 400)
  }
}

// --- encoding helpers (Web APIs only, so this works on any runtime) ---

function bytesToBase64(bytes: Uint8Array) {
  let bin = ""
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

function base64ToBytes(b64: string) {
  const bin = atob(b64.replace(/\s+/g, ""))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export async function sha256Hex(data: Uint8Array | string) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data
  const hash = await crypto.subtle.digest("SHA-256", bytes as BufferSource)
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("")
}

// --- GitHub ---

async function gh(path: string, init?: RequestInit & { raw?: boolean }) {
  const url = `https://api.github.com/repos/${repo()}/contents/${path.split("/").map(encodeURIComponent).join("/")}`
  return fetch(init?.method ? url : `${url}?ref=${encodeURIComponent(branch())}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: init?.raw ? "application/vnd.github.raw+json" : "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "palestra-azzurra-admin",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  })
}

async function ghRead(path: string) {
  const res = await gh(path)
  if (res.status === 404) throw new StorageError("File non trovato su GitHub.", 404)
  if (!res.ok) {
    console.error("[admin] GitHub read failed", res.status, await res.text().catch(() => ""))
    throw new StorageError("Non riesco a leggere il file da GitHub. Riprova tra poco.", 502)
  }
  const body = (await res.json()) as { sha: string; content?: string; encoding?: string }
  let text: string
  if (body.encoding === "base64" && body.content) {
    text = new TextDecoder().decode(base64ToBytes(body.content))
  } else {
    // Files over 1 MB come back without content; fetch the raw bytes.
    const raw = await gh(path, { raw: true })
    if (!raw.ok) throw new StorageError("Non riesco a leggere il file da GitHub. Riprova tra poco.", 502)
    text = await raw.text()
  }
  return { text, sha: body.sha }
}

async function ghWrite(path: string, bytes: Uint8Array, message: string, sha?: string) {
  const res = await gh(path, {
    method: "PUT",
    body: JSON.stringify({ message, content: bytesToBase64(bytes), branch: branch(), ...(sha ? { sha } : {}) }),
  })
  if (res.status === 409 || res.status === 422) {
    throw new StorageError(
      "Qualcun altro ha salvato questo file nel frattempo. Ricarica la pagina per vedere la versione aggiornata, poi rifai le modifiche.",
      409,
      true
    )
  }
  if (!res.ok) {
    console.error("[admin] GitHub write failed", res.status, await res.text().catch(() => ""))
    throw new StorageError("Salvataggio su GitHub non riuscito. Riprova tra poco.", 502)
  }
  const body = (await res.json()) as { content?: { sha?: string }; commit?: { html_url?: string } }
  return { sha: body.content?.sha ?? "", commitUrl: body.commit?.html_url }
}

// --- local disk (development only) ---

async function localPath(path: string) {
  const { join } = await import("node:path")
  return join(process.cwd(), path)
}

async function localRead(path: string) {
  const { readFile } = await import("node:fs/promises")
  const text = await readFile(await localPath(path), "utf8")
  return { text, sha: await sha256Hex(text) }
}

async function localWrite(path: string, bytes: Uint8Array, sha?: string) {
  const fs = await import("node:fs/promises")
  const { dirname } = await import("node:path")
  const full = await localPath(path)
  if (sha !== undefined) {
    const current = await fs.readFile(full).catch(() => null)
    if (current && (await sha256Hex(new Uint8Array(current))) !== sha) {
      throw new StorageError(
        "Il file è cambiato nel frattempo. Ricarica la pagina per vedere la versione aggiornata, poi rifai le modifiche.",
        409,
        true
      )
    }
  }
  await fs.mkdir(dirname(full), { recursive: true })
  await fs.writeFile(full, bytes)
  return { sha: await sha256Hex(bytes), commitUrl: undefined }
}

// --- public API ---

export async function readEditable(path: string) {
  assertAllowed(path)
  const mode = storageMode()
  if (mode === "github") return ghRead(path)
  if (mode === "local") return localRead(path)
  throw new StorageError(UNCONFIGURED, 503)
}

export async function writeEditable(path: string, text: string, sha: string) {
  assertAllowed(path)
  const bytes = new TextEncoder().encode(text)
  const mode = storageMode()
  if (mode === "github") return ghWrite(path, bytes, `Sito: aggiornato ${path} dall'editor`, sha)
  if (mode === "local") return localWrite(path, bytes, sha)
  throw new StorageError(UNCONFIGURED, 503)
}

/** Stores an uploaded image. The name carries a content hash, so a re-upload of the same file is a no-op. */
export async function writeUpload(path: string, bytes: Uint8Array) {
  assertAllowed(path, { upload: true })
  const mode = storageMode()
  if (mode === "github") {
    try {
      return await ghWrite(path, bytes, `Sito: caricata foto ${path} dall'editor`)
    } catch (e) {
      // 422 without a sha means the file already exists: same hash, same bytes.
      if (e instanceof StorageError && e.conflict) return { sha: "", commitUrl: undefined }
      throw e
    }
  }
  if (mode === "local") return localWrite(path, bytes)
  throw new StorageError(UNCONFIGURED, 503)
}
