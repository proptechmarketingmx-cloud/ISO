import { redirect } from "next/navigation"

export default function LoginPage() {
  // Mientras está activa la sesión de desarrollo, redirige directo al dashboard
  redirect("/dashboard")
}
