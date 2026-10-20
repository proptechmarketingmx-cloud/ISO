// src/app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirige automáticamente a la página de login
  redirect("/login");
}