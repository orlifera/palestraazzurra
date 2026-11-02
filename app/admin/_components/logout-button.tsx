"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  return (
    <Button
      variant="ghost"
      className="rounded-full"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await fetch("/api/admin/logout", { method: "POST" }).catch(() => null)
        router.push("/admin")
        router.refresh()
      }}
    >
      Esci
    </Button>
  )
}
