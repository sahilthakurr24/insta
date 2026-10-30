import { onboardUser } from "@/actions/onboardUser"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { auth } from "@clerk/nextjs/server"
import { connection } from "next/server"
import { Suspense, type ReactNode } from "react"

export async function AuthenticatedShell({ children }: { children: ReactNode }) {
  await connection()

  const { userId, redirectToSignIn } = await auth()

  if (!userId) {
    redirectToSignIn()
  }

  await onboardUser()

  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <AppSidebar />
      </Suspense>
      <main className="min-w-0 flex-1">
        <SidebarTrigger className="fixed top-4 right-4 z-20 md:hidden" />
        {children}
      </main>
    </SidebarProvider>
  )
}
