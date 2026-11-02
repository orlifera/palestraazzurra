"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ArrowUp01Icon, Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { itemName, labelFor, LONG_TEXT_KEYS } from "@/lib/admin/labels"
import { newItem } from "@/lib/admin/templates"
import { cn } from "@/lib/utils"
import { EditorContext, ErrorText, inputId, keyOf, useEditor, type Course, type EditorCtx, type Path } from "./editor-context"
import { PhotoField } from "./photo-field"

type Issue = { path: Path; message: string }

function setIn(root: unknown, path: Path, next: unknown): unknown {
  if (!path.length) return next
  const [head, ...rest] = path
  if (Array.isArray(root)) {
    const copy = root.slice()
    copy[head as number] = setIn(copy[head as number], rest, next)
    return copy
  }
  const obj = (root ?? {}) as Record<string, unknown>
  return { ...obj, [head]: setIn(obj[head as string], rest, next) }
}

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; commitUrl: string | null; unchanged?: boolean }
  | { kind: "error"; message: string; conflict?: boolean }

export function Editor({
  fileId,
  kind,
  initialValue,
  initialSha,
  courses,
  github,
}: {
  fileId: string
  kind: "content" | "messages"
  initialValue: unknown
  initialSha: string
  courses: Course[]
  github: boolean
}) {
  const [value, setValue] = useState(initialValue)
  const [sha, setSha] = useState(initialSha)
  const [dirty, setDirty] = useState(false)
  const [issues, setIssues] = useState<Issue[]>([])
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  const errors = useMemo(() => new Map(issues.map((i) => [keyOf(i.path), i.message])), [issues])

  const update = useCallback((path: Path, next: unknown) => {
    setValue((v: unknown) => setIn(v, path, next))
    setDirty(true)
    setStatus((s) => (s.kind === "saved" ? { kind: "idle" } : s))
    // Clear the errors this change may have fixed: the field itself and the groups around it.
    const k = keyOf(path)
    setIssues((list) => list.filter((i) => {
      const ik = keyOf(i.path)
      return !(ik === k || k.startsWith(ik + ".") || ik === "")
    }))
  }, [])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  async function save() {
    setStatus({ kind: "saving" })
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fileId, sha, value }),
      })
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        sha?: string
        commitUrl?: string | null
        unchanged?: boolean
        conflict?: boolean
        issues?: Issue[]
      }
      if (res.ok && body.ok) {
        if (body.sha) setSha(body.sha)
        setIssues([])
        setDirty(false)
        setStatus({ kind: "saved", commitUrl: body.commitUrl ?? null, unchanged: body.unchanged })
        return
      }
      if (res.status === 401) {
        setStatus({ kind: "error", message: "Sessione scaduta: apri una nuova scheda, accedi di nuovo e torna qui a salvare." })
        return
      }
      setIssues(body.issues ?? [])
      setStatus({ kind: "error", message: body.error ?? "Salvataggio non riuscito.", conflict: body.conflict })
    } catch {
      setStatus({ kind: "error", message: "Connessione non riuscita. Controlla la rete e riprova." })
    }
  }

  const ctx = useMemo<EditorCtx>(
    () => ({ fileId, messages: kind === "messages", courses, errors, update }),
    [fileId, kind, courses, errors, update]
  )

  return (
    <EditorContext.Provider value={ctx}>
      <form
        noValidate
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault()
          void save()
        }}
      >
        {issues.length > 0 && <IssueSummary issues={issues} />}
        <Node path={[]} value={value} depth={0} />

        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <Button type="submit" disabled={status.kind === "saving"} className="h-11 rounded-full px-7 text-base">
              {status.kind === "saving" ? "Salvataggio…" : "Salva"}
            </Button>
            <StatusLine status={status} dirty={dirty} github={github} />
          </div>
        </div>
      </form>
    </EditorContext.Provider>
  )
}

function StatusLine({ status, dirty, github }: { status: Status; dirty: boolean; github: boolean }) {
  if (status.kind === "saved") {
    return (
      <p role="status" className="text-sm">
        {status.unchanged ? "Nessuna modifica da salvare." : "Salvato. Il sito si aggiorna in 1–2 minuti."}
        {status.commitUrl && (
          <>
            {" "}
            <a href={status.commitUrl} target="_blank" rel="noreferrer" className="font-medium text-primary underline">
              Vedi la modifica
            </a>
          </>
        )}
        {!github && !status.unchanged && <span className="text-muted-foreground"> (file locale)</span>}
      </p>
    )
  }
  if (status.kind === "error") {
    return (
      <p role="alert" className="flex flex-wrap items-center gap-2 text-sm text-destructive">
        {status.message}
        {status.conflict && (
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => window.location.reload()}>
            Ricarica
          </Button>
        )}
      </p>
    )
  }
  return <p className="text-sm text-muted-foreground">{dirty ? "Modifiche non salvate." : "Nessuna modifica."}</p>
}

function IssueSummary({ issues }: { issues: Issue[] }) {
  const { messages } = useEditor()
  const trail = (path: Path) =>
    path
      .map((p) => (typeof p === "number" ? `n. ${p + 1}` : p === "it" ? "Italiano" : p === "en" ? "English" : labelFor(p, { messages })))
      .join(" › ")
  return (
    <div role="alert" className="mb-6 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
      <p className="font-semibold text-destructive">
        {issues.length === 1 ? "C'è un campo da correggere:" : `Ci sono ${issues.length} campi da correggere:`}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {issues.slice(0, 12).map((i, n) => (
          <li key={n}>
            {i.path.length ? <strong>{trail(i.path)}: </strong> : null}
            {i.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------- the generic form ----------

const isPair = (v: unknown): v is { it: string; en: string } =>
  !!v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.keys(v).length === 2 &&
  typeof (v as Record<string, unknown>).it === "string" &&
  typeof (v as Record<string, unknown>).en === "string"

const isLeaf = (v: unknown) => v === null || typeof v !== "object" || isPair(v)

function lastKey(path: Path) {
  for (let i = path.length - 1; i >= 0; i--) if (typeof path[i] === "string") return path[i] as string
  return ""
}

function Node({ path, value, depth, label }: { path: Path; value: unknown; depth: number; label?: string }) {
  const { fileId, messages } = useEditor()
  const key = typeof path[path.length - 1] === "string" ? (path[path.length - 1] as string) : ""
  const title = label ?? (key ? labelFor(key, { messages }) : "")

  if (fileId === "staff" && key === "courses") return <CoursesField path={path} value={value as string[]} />
  if (!messages && (key === "photo" || (fileId === "tour" && path[0] === "photos" && path.length === 2))) {
    return <PhotoField id={inputId(path)} label={title} path={path} value={typeof value === "string" ? value : ""} />
  }
  if (isPair(value)) return <PairField path={path} value={value} label={title} />
  if (Array.isArray(value)) return <ArrayField path={path} value={value} label={title} depth={depth} />
  if (value && typeof value === "object") return <ObjectField path={path} value={value as Record<string, unknown>} label={title} depth={depth} />
  if (typeof value === "boolean") return <BoolField path={path} value={value} label={title} />
  if (typeof value === "number" || (value === null && !messages)) return <NumberField path={path} value={value as number | null} label={title} />
  return <TextField path={path} value={typeof value === "string" ? value : ""} label={title} />
}

function ObjectField({ path, value, label, depth }: { path: Path; value: Record<string, unknown>; label: string; depth: number }) {
  const { messages } = useEditor()
  const entries = Object.entries(value)
  const children = (
    <>
      <ErrorText path={path} />
      {entries.map(([k, v]) => (
        <Node key={k} path={[...path, k]} value={v} depth={depth + 1} />
      ))}
    </>
  )

  if (depth === 0) return <div className="space-y-6">{children}</div>

  // In the message files every top-level section folds away, so the long list stays usable.
  if (messages && depth === 1) {
    return (
      <details className="group rounded-xl border border-border">
        <summary className="cursor-pointer list-none px-4 py-3 font-semibold select-none marker:hidden">
          <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
          {label}
        </summary>
        <div className="space-y-5 border-t border-border p-4">{children}</div>
      </details>
    )
  }

  // A few short values (e.g. a day: closed, open, close) sit on one row.
  const compact = entries.length <= 4 && entries.every(([k, v]) => (typeof v !== "string" || v.length < 40) && !isPair(v) && isLeaf(v) && !LONG_TEXT_KEYS.has(k))
  const layout = compact ? "flex flex-wrap items-end gap-4" : "space-y-5"
  // An item of a list already sits in its own card: no second frame.
  if (!label) return <div className={layout}>{children}</div>
  return (
    <fieldset className={cn("rounded-xl border border-border p-4", depth > 2 && "bg-muted/20")}>
      <legend className="px-1 font-semibold">{label}</legend>
      <div className={layout}>{children}</div>
    </fieldset>
  )
}

function itemTitle(item: unknown, fallback: string) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const name = (item as Record<string, unknown>).name
    if (typeof name === "string" && name) return name
    if (isPair(name) && name.it) return name.it
  }
  return fallback
}

function ArrayField({ path, value, label, depth }: { path: Path; value: unknown[]; label: string; depth: number }) {
  const { fileId, update, messages } = useEditor()
  const key = lastKey(path)
  const noun = messages || !key ? (path.length ? "voce" : itemName(fileId)) : itemName(key)
  const strings = value.every((v) => typeof v === "string")

  const move = (from: number, to: number) => {
    const copy = value.slice()
    const [item] = copy.splice(from, 1)
    copy.splice(to, 0, item)
    update(path, copy)
  }
  const remove = (i: number) => {
    const what = itemTitle(value[i], `${noun} ${i + 1}`)
    if (window.confirm(`Eliminare “${what}”?`)) update(path, value.filter((_, n) => n !== i))
  }
  const add = () => update(path, [...value, newItem(fileId, path, value)])

  const controls = (i: number) => (
    <div className="flex shrink-0 gap-1">
      <IconButton label="Sposta su" disabled={i === 0} onClick={() => move(i, i - 1)} icon={ArrowUp01Icon} />
      <IconButton label="Sposta giù" disabled={i === value.length - 1} onClick={() => move(i, i + 1)} icon={ArrowDown01Icon} />
      <IconButton label="Elimina" onClick={() => remove(i)} icon={Delete02Icon} destructive />
    </div>
  )

  const body = (
    <>
      <ErrorText path={path} />
      {value.length === 0 && <p className="text-sm text-muted-foreground">Nessun elemento.</p>}
      {value.map((item, i) =>
        strings ? (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">
              <TextField path={[...path, i]} value={item as string} label={`${labelFor(key || "voce", { messages })} ${i + 1}`} hideLabel />
            </div>
            {controls(i)}
          </div>
        ) : (
          <div key={i} className="rounded-xl border border-border p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="font-semibold">{itemTitle(item, `${capitalise(noun)} ${i + 1}`)}</span>
              {controls(i)}
            </div>
            <Node path={[...path, i]} value={item} depth={depth + 2} label="" />
          </div>
        )
      )}
      <Button type="button" variant="outline" className="rounded-full" onClick={add}>
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
        Aggiungi {noun}
      </Button>
    </>
  )

  if (depth === 0) return <div className="space-y-4">{body}</div>
  return (
    <fieldset className="space-y-4">
      <legend className="mb-2 font-semibold">{label}</legend>
      {body}
    </fieldset>
  )
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function IconButton({
  label,
  icon,
  onClick,
  disabled,
  destructive,
}: {
  label: string
  icon: typeof PlusSignIcon
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
}) {
  return (
    <Button
      type="button"
      variant={destructive ? "destructive" : "ghost"}
      size="icon"
      className="rounded-full"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} />
    </Button>
  )
}

function PairField({ path, value, label }: { path: Path; value: { it: string; en: string }; label: string }) {
  const key = lastKey(path)
  const long = LONG_TEXT_KEYS.has(key) || value.it.length > 80 || value.en.length > 80
  return (
    <fieldset className="space-y-2">
      {label && <legend className="mb-2 text-sm font-semibold">{label}</legend>}
      <ErrorText path={path} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField path={[...path, "it"]} value={value.it} label="Italiano" long={long} />
        <TextField path={[...path, "en"]} value={value.en} label="English" long={long} />
      </div>
    </fieldset>
  )
}

function TextField({
  path,
  value,
  label,
  long,
  hideLabel,
}: {
  path: Path
  value: string
  label: string
  long?: boolean
  hideLabel?: boolean
}) {
  const { update, errors, fileId, messages } = useEditor()
  const key = lastKey(path)
  const id = inputId(path)
  const invalid = errors.has(keyOf(path))
  const isLong = long ?? (LONG_TEXT_KEYS.has(key) || value.length > 80 || value.includes("\n"))

  let type = "text"
  if (!messages) {
    if (fileId === "hours" && (key === "open" || key === "close")) type = "time"
    else if (key === "from" || key === "to" || key === "week") type = "date"
    else if (key === "email") type = "email"
    else if (key === "phone") type = "tel"
  }

  const common = {
    id,
    value,
    "aria-invalid": invalid || undefined,
    "aria-label": hideLabel ? label : undefined,
  }
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", type === "time" && "w-32", type === "date" && "w-44")}>
      {!hideLabel && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      {isLong ? (
        <Textarea {...common} rows={3} onChange={(e) => update(path, e.target.value)} className="rounded-xl border-steel" />
      ) : (
        <Input {...common} type={type} onChange={(e) => update(path, e.target.value)} className="h-10 rounded-xl border-steel px-3" />
      )}
      <ErrorText path={path} />
    </div>
  )
}

function NumberField({ path, value, label }: { path: Path; value: number | null; label: string }) {
  const { update, errors } = useEditor()
  const id = inputId(path)
  return (
    <div className="flex w-44 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        value={value ?? ""}
        aria-invalid={errors.has(keyOf(path)) || undefined}
        onChange={(e) => {
          const raw = e.target.value
          update(path, raw === "" || Number.isNaN(Number(raw)) ? null : Number(raw))
        }}
        className="h-10 rounded-xl border-steel px-3"
      />
      <ErrorText path={path} />
    </div>
  )
}

function BoolField({ path, value, label }: { path: Path; value: boolean; label: string }) {
  const { update } = useEditor()
  const id = inputId(path)
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex h-10 cursor-pointer items-center gap-2.5 text-sm font-medium">
        <Checkbox className="border-steel" id={id} checked={value} onCheckedChange={(c) => update(path, c === true)} />
        {label}
      </label>
      <ErrorText path={path} />
    </div>
  )
}

function CoursesField({ path, value }: { path: Path; value: string[] }) {
  const { courses, update } = useEditor()
  const selected = new Set(Array.isArray(value) ? value : [])
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold">Corsi che segue</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {courses.map((c) => {
          const id = inputId([...path, c.id])
          return (
            <label key={c.id} htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Checkbox className="border-steel"
                id={id}
                checked={selected.has(c.id)}
                onCheckedChange={(checked) => {
                  const next = new Set(selected)
                  if (checked) next.add(c.id)
                  else next.delete(c.id)
                  update(path, courses.map((x) => x.id).filter((x) => next.has(x)))
                }}
              />
              {c.label}
            </label>
          )
        })}
      </div>
      <ErrorText path={path} />
    </fieldset>
  )
}
