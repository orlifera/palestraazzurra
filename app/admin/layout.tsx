import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"

import "../globals.css"
import { cn } from "@/lib/utils"

const openSans = Open_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-open-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Editor del sito · Palestra Azzurra",
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="it" className={cn("antialiased", openSans.variable)}>
      <body className="min-h-svh bg-background text-foreground">{children}</body>
    </html>
  )
}
