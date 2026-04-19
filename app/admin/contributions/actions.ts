"use server";

import { getAdminDb } from "@/lib/db/client";

// Whitelist of fields that may be patched on each table.
const ALLOWED_FIELDS: Record<string, string[]> = {
  study: [
    "title", "year", "journal", "authors", "study_type", "species",
    "n_subjects", "design", "dose", "duration_days", "route",
    "primary_outcomes", "secondary_outcomes", "adverse_events",
    "risk_of_bias", "conclusion",
  ],
  peptide: ["name", "mechanism", "category", "indications_tags", "overview", "sequence", "cas_number"],
  policy: ["title", "summary", "status", "effective_date", "source_url"],
};

const TABLE: Record<string, string> = {
  study: "studies",
  peptide: "peptides",
  policy: "policy_items",
};

export async function reviewContribution(
  id: string,
  action: "approve" | "reject",
  targetType: string,
  targetId: string,
  field: string,
  newValue: unknown,
) {
  const db = getAdminDb();

  if (action === "approve") {
    const allowedFields = ALLOWED_FIELDS[targetType];
    const table = TABLE[targetType];
    if (allowedFields?.includes(field) && table) {
      await db.from(table).update({ [field]: newValue }).eq("id", targetId);
    }
    await db
      .from("contributions")
      .update({ status: "merged", reviewed_at: new Date().toISOString() })
      .eq("id", id);
  } else {
    await db
      .from("contributions")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", id);
  }
}
