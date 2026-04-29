import { getDb } from "@/lib/db/client";
import { PeptidesClient } from "./PeptidesClient";

export const revalidate = 300;

export default async function PeptidesIndex() {
  const db = getDb();
  const { data: peptides } = await db
    .from("peptides")
    .select("*")
    .order("study_count", { ascending: false });

  return <PeptidesClient initialPeptides={peptides ?? []} />;
}
