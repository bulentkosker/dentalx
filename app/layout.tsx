import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DentalX — Найдите лучшую стоматологию в Казахстане",
  description:
    "DentalX — каталог стоматологических клиник Казахстана. Найдите проверенных специалистов в Алматы и Астане.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased bg-white text-slate-900`}>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                D
              </span>
              <span>
                Dental<span className="text-primary">X</span>
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-slate-600">
              <Link href="/almaty" className="hover:text-primary">Алматы</Link>
              <Link href="/astana" className="hover:text-primary">Астана</Link>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
            <div>© {new Date().getFullYear()} DentalX</div>
            <div>Каталог стоматологий Казахстана</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
