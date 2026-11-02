"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (res.ok && body.ok) {
        router.refresh()
        return
      }
      setError(body.error ?? "Accesso non riuscito.")
    } catch {
      setError("Connessione non riuscita. Riprova.")
    }
    setPending(false)
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm">
      <h1 className="text-2xl font-bold">Accedi</h1>
      <p className="mt-2 text-muted-foreground">Inserisci la password dello staff per modificare i contenuti del sito.</p>
      <Field className="mt-6" data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? true : undefined}
          className="h-11 rounded-xl border-steel px-4"
        />
        {error && <FieldError>{error}</FieldError>}
      </Field>
      <Button type="submit" disabled={pending || !password} className="mt-5 h-11 w-full rounded-full text-base">
        {pending ? "Accesso…" : "Entra"}
      </Button>
    </form>
  )
}
