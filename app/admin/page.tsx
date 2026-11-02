import Link from "next/link"

import { FILES } from "@/lib/admin/files"
import { adminPassword, isLoggedIn } from "@/lib/admin/session"
import { storageMode } from "@/lib/admin/storage"
import { AdminShell } from "./_components/admin-shell"
import { LoginForm } from "./_components/login-form"

export default async function AdminPage() {
  if (!adminPassword()) {
    return (
      <AdminShell>
        <h1 className="text-2xl font-bold">Editor non configurato</h1>
        <p className="mt-3 max-w-prose text-muted-foreground">
          L&apos;editor del sito non è ancora attivo: manca la password (ADMIN_PASSWORD). Contatta chi gestisce il sito.
        </p>
      </AdminShell>
    )
  }

  if (!(await isLoggedIn())) {
    return (
      <AdminShell>
        <LoginForm />
      </AdminShell>
    )
  }

  const mode = storageMode()
  return (
    <AdminShell loggedIn>
      <h1 className="text-2xl font-bold">Cosa vuoi modificare?</h1>
      <p className="mt-2 text-muted-foreground">
        Scegli una sezione. Dopo il salvataggio il sito si aggiorna da solo in 1–2 minuti.
      </p>
      {mode !== "github" && <ModeNotice mode={mode} />}
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {FILES.map((f) => (
          <li key={f.id}>
            <Link
              href={`/admin/${f.id}`}
              className="block h-full rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="block font-semibold">{f.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{f.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </AdminShell>
  )
}

function ModeNotice({ mode }: { mode: "local" | "unconfigured" }) {
  return (
    <p className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-sm">
      {mode === "local"
        ? "Modalità sviluppo: senza GITHUB_TOKEN le modifiche vengono scritte sui file locali."
        : "Il salvataggio non è configurato (manca GITHUB_TOKEN): puoi guardare ma non salvare."}
    </p>
  )
}
