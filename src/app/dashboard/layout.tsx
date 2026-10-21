import { auth } from "@/lib/auth"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/shared/sidebar"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar rol={session.user.rol} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header usuario={session.user} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  )
}
