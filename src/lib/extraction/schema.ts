import { z } from "zod";

/**
 * Standardized peptide-study fact sheet.
 * Every study in the DB is normalized into this exact shape — this IS the product.
 *
 * Schema is versioned independently of the prompt; bumping either version triggers
 * re-extraction via the nightly cron (see src/lib/extraction/reextract-job.ts).
 */

export const SCHEMA_VERSION = "1.0.0";

export const StudyType = z.enum([
  "RCT",
  "non-randomized-controlled",
  "cohort",
  "case-control",
  "case-series",
  "case-report",
  "cross-sectional",
  "in-vitro",
  "animal",
  "pilot",
  "review",
  "meta-analysis",
  "protocol",
  "other",
]);

export const Species = z.enum([
  "human",
  "rat",
  "mouse",
  "dog",
  "pig",
  "rabbit",
  "monkey",
  "zebrafish",
  "in-vitro",
  "other",
]);

const DoseSchema = z
  .object({
    peptide: z.string().optional(),
    amount_mg: z.number().nullable().optional(),
    amount_raw: z.string().nullable().optional(),
    frequency: z.string().nullable().optional(),
    route: z.string().nullable().optional(),
    total_days: z.number().nullable().optional(),
  })
  .strict();

const OutcomeSchema = z
  .object({
    name: z.string(),
    direction: z.enum(["improved", "worsened", "no-change", "mixed", "unclear"]).optional(),
    effect_size: z.string().nullable().optional(),
    p_value: z.string().nullable().optional(),
    ci: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
  })
  .strict();

const AdverseEventSchema = z
  .object({
    event: z.string(),
    count: z.number().nullable().optional(),
    severity: z.enum(["mild", "moderate", "severe", "life-threatening", "unknown"]).optional(),
    attributed_to_peptide: z.boolean().optional(),
  })
  .strict();

const RiskOfBiasSchema = z
  .object({
    selection: z.enum(["low", "some-concerns", "high", "unclear"]).optional(),
    performance: z.enum(["low", "some-concerns", "high", "unclear"]).optional(),
    detection: z.enum(["low", "some-concerns", "high", "unclear"]).optional(),
    attrition: z.enum(["low", "some-concerns", "high", "unclear"]).optional(),
    reporting: z.enum(["low", "some-concerns", "high", "unclear"]).optional(),
    overall: z.enum(["low", "some-concerns", "high", "unclear"]).optional(),
    rationale: z.string().nullable().optional(),
  })
  .strict();

const HighlightsSchema = z
  .object({
    tldr: z.array(z.string()).length(3).describe("Exactly 3 bullets: finding, effect, caveat."),
    one_liner: z.string(),
  })
  .strict();

export const ExtractedStudy = z
  .object({
    title: z.string(),
    authors: z.array(z.string()).default([]),
    year: z.number().int().min(1900).max(2100).nullable(),
    journal: z.string().nullable().optional(),
    doi: z.string().nullable().optional(),
    peptides: z.array(z.string()).describe("Peptide names/aliases as mentioned."),
    indications: z.array(z.string()).describe("Conditions/outcomes studied."),
    study_type: StudyType,
    species: Species,
    n_subjects: z.number().int().nullable().optional(),
    design: z
      .object({
        randomized: z.boolean().optional(),
        blinded: z.enum(["none", "single", "double", "triple", "open-label"]).optional(),
        controlled: z.boolean().optional(),
        placebo_controlled: z.boolean().optional(),
        arms: z.number().int().nullable().optional(),
        crossover: z.boolean().optional(),
      })
      .strict()
      .optional(),
    dose: z.array(DoseSchema).default([]),
    duration_days: z.number().int().nullable().optional(),
    route: z.string().nullable().optional(),
    primary_outcomes: z.array(OutcomeSchema).default([]),
    secondary_outcomes: z.array(OutcomeSchema).default([]),
    adverse_events: z.array(AdverseEventSchema).default([]),
    conclusion: z.string(),
    risk_of_bias: RiskOfBiasSchema.optional(),
    highlights: HighlightsSchema,
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe("Self-reported extraction confidence, 0–1."),
    missing_fields: z
      .array(z.string())
      .default([])
      .describe("Fields the source document did not report."),
  })
  .strict();

export type ExtractedStudy = z.infer<typeof ExtractedStudy>;

/** JSON Schema string (pretty) for embedding into prompts. */
export const SCHEMA_JSON_STRING = JSON.stringify(
  {
    title: "string",
    authors: ["string"],
    year: "int | null",
    journal: "string | null",
    doi: "string | null",
    peptides: ["string"],
    indications: ["string"],
    study_type: StudyType.options,
    species: Species.options,
    n_subjects: "int | null",
    design: {
      randomized: "bool",
      blinded: "none | single | double | triple | open-label",
      controlled: "bool",
      placebo_controlled: "bool",
      arms: "int | null",
      crossover: "bool",
    },
    dose: [
      {
        peptide: "string",
        amount_mg: "number | null",
        amount_raw: "string | null",
        frequency: "string | null",
        route: "string | null",
        total_days: "number | null",
      },
    ],
    duration_days: "int | null",
    route: "string | null",
    primary_outcomes: [
      {
        name: "string",
        direction: "improved | worsened | no-change | mixed | unclear",
        effect_size: "string | null",
        p_value: "string | null",
        ci: "string | null",
        note: "string | null",
      },
    ],
    secondary_outcomes: ["same shape as primary_outcomes"],
    adverse_events: [
      {
        event: "string",
        count: "int | null",
        severity: "mild | moderate | severe | life-threatening | unknown",
        attributed_to_peptide: "bool",
      },
    ],
    conclusion: "string",
    risk_of_bias: {
      selection: "low | some-concerns | high | unclear",
      performance: "low | some-concerns | high | unclear",
      detection: "low | some-concerns | high | unclear",
      attrition: "low | some-concerns | high | unclear",
      reporting: "low | some-concerns | high | unclear",
      overall: "low | some-concerns | high | unclear",
      rationale: "string | null",
    },
    highlights: {
      tldr: ["finding", "effect", "caveat"],
      one_liner: "string",
    },
    confidence: "0..1",
    missing_fields: ["string"],
  },
  null,
  2,
);
