import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
  title: 'ISO — Plataforma Inmobiliaria',
  description: 'Sistema CRM Inmobiliario, Matching y Redes CNA sobre PostgreSQL',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
