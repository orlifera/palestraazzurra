import type { Metadata } from "next"
import { Sulphur_Point } from "next/font/google"

import "../globals.css"
import { cn } from "@/lib/utils"

const sulphurPoint = Sulphur_Point({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-sulphur-point",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Editor del sito · Palestra Azzurra",
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="it" className={cn("antialiased", sulphurPoint.variable)}>
      <body className="min-h-svh bg-background text-foreground">{children}</body>
    </html>
  )
}
