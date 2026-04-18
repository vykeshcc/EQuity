import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { getServerDb } from "@/lib/db/server";

export const metadata: Metadata = {
  title: "EQuity — Peptide Research Assimilator",
  description:
    "AI-powered research companion for peptide researchers. Standardized, ranked, and continuously updated evidence on research-use peptides.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <header className="border-b border-slate-200">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="inline-block h-6 w-6 rounded-md bg-brand-600" />
              <span>EQuity</span>
              <span className="text-xs font-normal text-slate-500">Peptide Research</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/peptides" className="hover:text-brand-700">Peptides</Link>
              <Link href="/search" className="hover:text-brand-700">Search</Link>
              <Link href="/policy" className="hover:text-brand-700">Policy</Link>
              <Link href="/contribute" className="hover:text-brand-700">Contribute</Link>
              {user ? (
                <form action="/auth/signout" method="POST">
                  <button type="submit" className="text-slate-500 hover:text-brand-700">
                    Sign out
                  </button>
                </form>
              ) : (
                <Link href="/auth/login" className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700">
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        <footer className="mt-16 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-slate-500">
            Research companion only. Not medical advice. Peptides are for research use where
            legally permitted in your jurisdiction.
          </div>
        </footer>
      </body>
    </html>
  );
}
