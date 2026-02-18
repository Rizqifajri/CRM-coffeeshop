import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mimi CRM – Kopi Kita",
  description: "Mini CRM and AI promo helper for Mimi's coffee shop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased bg-background text-foreground",
        )}
      >
        <Providers>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#bbf7d0_0,_transparent_55%),_radial-gradient(circle_at_bottom,_#fed7aa_0,_transparent_55%)]">
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-8 pt-6">
              <header className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white shadow-sm">
                    MK
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold tracking-tight">
                      Mimi CRM
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Kopi Kita · Mini Promo Brain
                    </span>
                  </div>
                </Link>
                <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Link href="/dashboard" className="hover:text-emerald-700">
                    Dashboard
                  </Link>
                  <Link href="/customers" className="hover:text-emerald-700">
                    Customers
                  </Link>
                  <Link href="/promo" className="hover:text-emerald-700">
                    Promo Ideas
                  </Link>
                  <Link href="/chat" className="hover:text-emerald-700">
                    AI Chat
                  </Link>
                  <LogoutButton />
                </nav>
              </header>
              <main className="mt-6 flex-1">{children}</main>
              <footer className="mt-6 text-center text-xs text-muted-foreground">
                Mimi&apos;s Coffee · Built for smart, human promos — not random
                discounts.
              </footer>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
