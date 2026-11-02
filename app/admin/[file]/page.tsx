import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { COURSES } from "@/lib/content"
import { findFile } from "@/lib/admin/files"
import { adminPassword, isLoggedIn } from "@/lib/admin/session"
import { readEditable, storageMode, StorageError } from "@/lib/admin/storage"
import { AdminShell } from "../_components/admin-shell"
import { Editor } from "../_components/editor"

async function courseOptions() {
  let names: Record<string, string> = {}
  try {
    const it = JSON.parse((await readEditable("messages/it.json")).text) as { courses?: { items?: Record<string, unknown> } }
    names = Object.fromEntries(
      Object.entries(it.courses?.items ?? {}).filter((e): e is [string, string] => typeof e[1] === "string")
    )
  } catch {
    // Fall back to the ids.
  }
  return COURSES.map((id) => ({ id, label: names[id] ?? id }))
}

export default async function EditFilePage({ params }: PageProps<"/admin/[file]">) {
  if (!adminPassword() || !(await isLoggedIn())) redirect("/admin")

  const { file: id } = await params
  const file = findFile(id)
  if (!file) notFound()

  let loaded: { value: unknown; sha: string } | { error: string }
  try {
    const { text, sha } = await readEditable(file.path)
    loaded = { value: JSON.parse(text), sha }
  } catch (e) {
    loaded = { error: e instanceof StorageError ? e.message : "Non riesco a leggere il file. Riprova tra poco." }
  }

  return (
    <AdminShell loggedIn wide>
      <Link href="/admin" className="text-sm font-medium text-primary hover:underline">
        ← Tutte le sezioni
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{file.title}</h1>
      <p className="mt-1 text-muted-foreground">{file.description}</p>
      {"error" in loaded ? (
        <p role="alert" className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {loaded.error}
        </p>
      ) : (
        <Editor
          fileId={file.id}
          kind={file.kind}
          initialValue={loaded.value}
          initialSha={loaded.sha}
          courses={file.id === "staff" ? await courseOptions() : []}
          github={storageMode() === "github"}
        />
      )}
    </AdminShell>
  )
}
