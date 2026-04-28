/**
 * Deterministic composite quality score (0–100) for a study.
 * Exposed on the study page as "Why this ranks high" for transparency.
 *
 * Dimensions (and weights):
 *   - study_type:  0–35  (RCT/meta-analysis high; case reports low)
 *   - human flag:  0–15  (human evidence > animal > in-vitro)
 *   - n_subjects:  0–20  (log-scaled)
 *   - recency:     0–15  (decays linearly over ~15 years)
 *   - risk-of-bias:0–15  (low bias adds, high bias subtracts)
 */

const TYPE_WEIGHT: Record<string, number> = {
  "meta-analysis": 35,
  RCT: 32,
  "non-randomized-controlled": 24,
  cohort: 20,
  "case-control": 18,
  "cross-sectional": 14,
  pilot: 12,
  "case-series": 10,
  "case-report": 6,
  animal: 15,
  "in-vitro": 8,
  review: 12,
  protocol: 4,
  other: 8,
};

const SPECIES_WEIGHT: Record<string, number> = {
  human: 15,
  monkey: 9,
  dog: 7,
  pig: 7,
  rabbit: 6,
  rat: 5,
  mouse: 5,
  zebrafish: 3,
  "in-vitro": 2,
  other: 3,
};

const ROB_WEIGHT: Record<string, number> = {
  low: 15,
  "some-concerns": 8,
  high: 2,
  unclear: 6,
};

export interface ScoreInput {
  study_type?: string | null;
  species?: string | null;
  n_subjects?: number | null;
  year?: number | null;
  risk_of_bias?: string | null;
}

export interface ScoreBreakdown {
  total: number;
  components: {
    type: number;
    species: number;
    n: number;
    recency: number;
    rob: number;
  };
}

export function scoreBreakdown(input: ScoreInput): ScoreBreakdown {
  const type = TYPE_WEIGHT[input.study_type ?? "other"] ?? 8;
  const species = SPECIES_WEIGHT[input.species ?? "other"] ?? 3;

  const n = input.n_subjects ?? 0;
  const nScore = n > 0 ? Math.min(20, Math.log10(n + 1) * 10) : 0;

  const currentYear = new Date().getFullYear();
  const age = input.year ? Math.max(0, currentYear - input.year) : 15;
  const recency = Math.max(0, 15 - age * 1);

  const rob = ROB_WEIGHT[input.risk_of_bias ?? "unclear"] ?? 6;

  const total = Math.round((type + species + nScore + recency + rob) * 10) / 10;
  return { total, components: { type, species, n: Math.round(nScore * 10) / 10, recency, rob } };
}

export function scoreStudy(input: ScoreInput): number {
  return scoreBreakdown(input).total;
}
