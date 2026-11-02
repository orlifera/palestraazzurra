"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ErrorText, keyOf, useEditor, type Path } from "./editor-context"

const MAX_BYTES = 3 * 1024 * 1024

export function PhotoField({ id, label, path, value }: { id: string; label: string; path: Path; value: string }) {
  const { update, errors } = useEditor()
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  // A just-uploaded photo is not on the live site until it rebuilds: preview the local copy.
  const [local, setLocal] = useState<{ path: string; url: string } | null>(null)
  const [broken, setBroken] = useState<string | null>(null)

  useEffect(() => () => {
    if (local) URL.revokeObjectURL(local.url)
  }, [local])

  const src = local && local.path === value ? local.url : value
  const showImage = !!src && broken !== src

  async function upload(file: File) {
    setUploadError(null)
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setUploadError("Formato non supportato: usa una foto JPG, PNG o WebP.")
      return
    }
    if (file.size > MAX_BYTES) {
      setUploadError("La foto supera i 3 MB: riducila e riprova.")
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: form })
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; path?: string; error?: string }
      if (res.ok && body.ok && body.path) {
        setLocal({ path: body.path, url: URL.createObjectURL(file) })
        update(path, body.path)
      } else {
        setUploadError(body.error ?? "Caricamento non riuscito.")
      }
    } catch {
      setUploadError("Connessione non riuscita. Riprova.")
    }
    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 sm:w-40">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- plain preview of an arbitrary path
            <img src={src} alt="" className="size-full object-cover" onError={() => setBroken(src)} />
          ) : (
            <span className="px-3 text-center text-xs text-muted-foreground">
              {value ? "Anteprima non disponibile" : "Nessuna foto"}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Input
            id={id}
            value={value}
            placeholder="/images/..."
            aria-invalid={errors.has(keyOf(path)) || undefined}
            onChange={(e) => update(path, e.target.value)}
            className="h-10 rounded-xl border-steel px-3"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
            >
              {uploading ? "Caricamento…" : "Carica una foto"}
            </Button>
            {value && (
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => update(path, "")}>
                Togli la foto
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG o WebP, massimo 3 MB.</p>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ""
              if (file) void upload(file)
            }}
          />
          {uploadError && <p className="text-sm font-medium text-destructive">{uploadError}</p>}
          <ErrorText path={path} />
        </div>
      </div>
    </div>
  )
}
