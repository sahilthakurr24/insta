import { AuthenticatedShell } from "@/components/authenticated-shell"
import { Suspense } from "react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="min-h-svh" />}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  )
}
