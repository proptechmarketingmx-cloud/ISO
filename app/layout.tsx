import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ISO Plataforma P2P',
  description: 'Plataforma Inmobiliaria con Sincronización P2P por Tailscale',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-900 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
