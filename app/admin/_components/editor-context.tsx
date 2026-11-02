"use client"

import { createContext, useContext } from "react"

export type Path = (string | number)[]
export type Course = { id: string; label: string }

export type EditorCtx = {
  fileId: string
  messages: boolean
  courses: Course[]
  errors: Map<string, string>
  update: (path: Path, value: unknown) => void
}

export const EditorContext = createContext<EditorCtx | null>(null)

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error("useEditor outside Editor")
  return ctx
}

export const keyOf = (path: Path) => path.join(".")

export const inputId = (path: Path) => `f-${path.join("-") || "root"}`

export function ErrorText({ path }: { path: Path }) {
  const msg = useEditor().errors.get(keyOf(path))
  return msg ? <p className="text-sm font-medium text-destructive">{msg}</p> : null
}
