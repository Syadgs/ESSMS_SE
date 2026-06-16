import type { Metadata } from "next"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "ESSMS - Enterprise Supply Chain & Sales Management",
  description: "Enterprise supply chain and sales management system",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
