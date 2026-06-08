import type { Metadata } from "next"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "ESSMS - Enterprise Supply Chain & Sales Management",
  description: "Sistem manajemen supply chain dan penjualan enterprise",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
