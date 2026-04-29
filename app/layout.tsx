import type { Metadata } from "next";
import "./globals.css";
import { Topbar } from "@/components/shared";

export const metadata: Metadata = {
  title: "EQuity — Peptide Research Assimilator",
  description:
    "AI-powered research companion for peptide researchers. Standardized, ranked, and continuously updated evidence on research-use peptides.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <Topbar />
          <div className="main">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
