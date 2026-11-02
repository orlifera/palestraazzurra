import { LogoutButton } from "./logout-button"

export function AdminShell({
  children,
  loggedIn = false,
  wide = false,
}: {
  children: React.ReactNode
  loggedIn?: boolean
  wide?: boolean
}) {
  return (
    <div className="min-h-svh">
      <header className="border-b border-border">
        <div className={`mx-auto flex h-14 items-center justify-between px-4 ${wide ? "max-w-4xl" : "max-w-3xl"}`}>
          <span className="font-bold">
            Palestra Azzurra <span className="font-normal text-muted-foreground">· Editor del sito</span>
          </span>
          {loggedIn && <LogoutButton />}
        </div>
      </header>
      <main className={`mx-auto px-4 py-8 ${wide ? "max-w-4xl pb-32" : "max-w-3xl"}`}>{children}</main>
    </div>
  )
}
