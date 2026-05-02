import type { Metadata } from "next";
import "./globals.css";
import { Topbar } from "@/components/shared";

export const metadata: Metadata = {
  title: "Sequence — Peptide Research & Evidence",
  description:
    "In-depth articles, standardized study extractions, and evidence synthesis for research-use peptides. Covering BPC-157, semaglutide, epithalon, and 30+ peptides from PubMed, ClinicalTrials.gov, and regulators.",
  openGraph: {
    title: "Sequence — Peptide Research & Evidence",
    description: "The Sequence Journal: in-depth peptide science articles, quality-scored study extractions, and continuously updated evidence summaries.",
    type: "website",
  },
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
