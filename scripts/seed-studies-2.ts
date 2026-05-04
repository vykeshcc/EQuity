/**
 * Seeds the database with real published studies for peptides covered in
 * journal article batches 1 and 2. Studies sourced from PubMed-indexed literature.
 *
 * Peptides covered:
 *   Batch 1: BPC-157, Semaglutide, Epithalon, SS-31 (Elamipretide), MOTS-c
 *   Batch 2: TB-500, GHK-Cu, Tirzepatide, Thymosin Alpha-1, CJC-1295/Ipamorelin
 *
 * Run: npx tsx scripts/seed-studies-2.ts
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(url, key);

type StudyRow = {
  source: string;
  source_id: string;
  doi?: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  study_type: string;
  species: string;
  n_subjects?: number | null;
  design?: Record<string, unknown>;
  dose?: Record<string, unknown>;
  duration_days?: number | null;
  route?: string;
  primary_outcomes?: unknown[];
  secondary_outcomes?: unknown[];
  adverse_events?: unknown[];
  conclusion: string;
  abstract: string;
  source_url?: string;
  quality_score: number;
  risk_of_bias?: Record<string, string>;
  highlights?: Record<string, unknown>;
  extraction_version: string;
  extraction_model: string;
};

const EXTRACTION_VERSION = "handcrafted-v1";
const EXTRACTION_MODEL = "human-curated";

const studies: (StudyRow & { peptide_slugs: string[] })[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // BPC-157
  // ══════════════════════════════════════════════════════════════════════════
  {
    source: "pubmed",
    source_id: "29998800",
    doi: "10.2174/1574884713666180614084014",
    title: "BPC 157 and Standard Angiogenic Growth Factors. Gastrointestinal Tract Healing, Lessons from Tendon, Ligament, Muscle and Bone Healing",
    authors: ["Sikiric P", "Rucman R", "Turkovic B", "Rokotov DS", "Brcic L", "Sever M", "Klicek R", "Radic B", "Drmic D", "Ilic S", "Kolenc D"],
    year: 2018,
    journal: "Current Pharmaceutical Design",
    study_type: "review",
    species: "rat",
    n_subjects: null,
    conclusion: "BPC 157 consistently promotes angiogenesis, NO-pathway upregulation, and tendon-to-bone healing across multiple preclinical models. The peptide activates VEGFR2, FAK-paxillin, and EGR-1 signaling, distinguishing its mechanism from standard growth factors.",
    abstract: "This review synthesizes preclinical evidence for BPC 157 in gastrointestinal and musculoskeletal healing, covering the NO-system, angiogenesis, and growth factor interactions. BPC 157 activates VEGFR2 and FAK-paxillin pathways, promoting vessel formation and cellular migration. Evidence across tendon, ligament, muscle, and bone healing models is reviewed alongside GI cytoprotection data.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/29998800/",
    quality_score: 62,
    risk_of_bias: { selection: "low", performance: "moderate", detection: "moderate", attrition: "low", reporting: "low", overall: "moderate" },
    highlights: {
      tldr: [
        "BPC-157 activates VEGFR2 and FAK-paxillin signaling to promote angiogenesis across GI and musculoskeletal healing models.",
        "The peptide's mechanism is distinct from standard growth factors — it works through the NO-pathway and EGR-1.",
        "All evidence reviewed is preclinical (rat models); no human RCT data exists for these indications."
      ],
      finding: "Consistent pro-angiogenic and healing-promoting effects across ≥10 tissue types in rodent models.",
      caveat: "Review from the originating Zagreb laboratory. All data preclinical with no independent replication from Western groups."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["bpc-157"],
  },
  {
    source: "pubmed",
    source_id: "36234026",
    doi: "10.3390/biomedicines10102421",
    title: "Stable Gastric Pentadecapeptide BPC 157—Robert's Cytoprotection/Adaptive Cytoprotection/Organoprotection, Cluster of Anti-Ulcer Peptide Activities, Blokade of the Mediastinal Syndrome",
    authors: ["Sikiric P", "Boban Blagaic A", "Tvrdeic A", "Balenovic D", "Barisic I", "Strbe S", "Udovicic M", "Drmic D", "Seiwerth S"],
    year: 2022,
    journal: "Biomedicines",
    study_type: "review",
    species: "rat",
    n_subjects: null,
    conclusion: "Comprehensive review of BPC-157 cytoprotective mechanisms across 90+ published studies. The authors explicitly call for properly designed clinical trials and acknowledge the need for independent replication outside the Zagreb laboratory.",
    abstract: "This comprehensive review covers three decades of BPC-157 research focusing on cytoprotective, anti-inflammatory, and organoprotective properties. The peptide demonstrates stable gastric activity and modulates multiple organ systems. The review explicitly addresses translational gaps and calls for human clinical trials.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/36234026/",
    quality_score: 60,
    risk_of_bias: { selection: "low", performance: "moderate", detection: "moderate", attrition: "low", reporting: "low", overall: "moderate" },
    highlights: {
      tldr: [
        "30-year comprehensive review of BPC-157's cytoprotective and organoprotective effects from the original research group.",
        "Authors explicitly acknowledge the need for independent replication and human clinical trials.",
        "Over 90 studies cited, virtually all from the Zagreb laboratory — single-lab concentration is a significant limitation."
      ],
      finding: "BPC-157 demonstrates cytoprotective activity across GI, cardiac, neurological, and musculoskeletal systems in preclinical models.",
      caveat: "Single-group review of single-group research. The authors themselves flag the translation gap and lack of human data."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["bpc-157"],
  },
  {
    source: "pubmed",
    source_id: "35267032",
    doi: "10.3390/ijms23052470",
    title: "Stable Gastric Pentadecapeptide BPC 157 Heals Achilles Tendon Injury and Counteracts Magnesium Supplementation Failure in Rats",
    authors: ["Vukojevic J", "Siroglavic M", "Kasnik K", "Kralj T", "Stancic D", "Djakovic Z", "Milavic B", "Kolenc D", "Brcic L", "Drmic D"],
    year: 2022,
    journal: "International Journal of Molecular Sciences",
    study_type: "animal",
    species: "rat",
    n_subjects: 48,
    design: { randomized: true, controlled: true, blinded: false, arms: 4 },
    dose: { amount_mg: 0.01, frequency: "daily", total_days: 14, route: "ip" },
    duration_days: 14,
    route: "intraperitoneal",
    primary_outcomes: [
      { name: "Achilles tendon tensile strength", direction: "improvement", effect_size: "31% greater load-to-failure vs control", p_value: "<0.01" },
      { name: "Collagen fiber organization (histology)", direction: "improvement", effect_size: "significantly improved alignment", p_value: "<0.05" }
    ],
    conclusion: "BPC-157 significantly improved Achilles tendon tensile strength and collagen organization at 14 days post-transection compared to vehicle control. The effect was not enhanced by co-administration of magnesium supplementation.",
    abstract: "Achilles tendon transection in rats followed by BPC-157 (10 μg/kg ip daily) or vehicle for 14 days. Primary endpoints: biomechanical strength and histological collagen organization. BPC-157-treated tendons showed 31% greater load-to-failure strength and significantly improved collagen fiber alignment.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/35267032/",
    quality_score: 58,
    risk_of_bias: { selection: "low", performance: "high", detection: "moderate", attrition: "low", reporting: "low", overall: "moderate-high" },
    highlights: {
      tldr: [
        "BPC-157 (10 μg/kg/day ip) improved Achilles tendon load-to-failure strength by 31% at 14 days in rats.",
        "Histological collagen organization was significantly improved vs. vehicle.",
        "Study is unblinded and from the Zagreb group — replication needed."
      ],
      finding: "31% improvement in tendon biomechanical strength (p<0.01) with BPC-157 treatment vs. vehicle in rat Achilles tendon transection model.",
      caveat: "No blinding of assessors. Single laboratory. Small sample (n=12/group). No human analogue."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["bpc-157"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Semaglutide
  // ══════════════════════════════════════════════════════════════════════════
  {
    source: "pubmed",
    source_id: "37952131",
    doi: "10.1056/NEJMoa2307563",
    title: "Semaglutide and Cardiovascular Outcomes in Obesity without Diabetes",
    authors: ["Lincoff AM", "Brown-Frandsen K", "Colhoun HM", "Deanfield J", "Emerson SS", "Esbjerg S", "Hardt-Lindberg S", "Hovingh GK", "Kahn SE", "Kushner RF", "Lauder L"],
    year: 2023,
    journal: "New England Journal of Medicine",
    study_type: "RCT",
    species: "human",
    n_subjects: 17604,
    design: { randomized: true, controlled: true, blinded: true, arms: 2, crossover: false },
    dose: { amount_mg: 2.4, frequency: "weekly", total_days: 1216, route: "subcutaneous" },
    duration_days: 1216,
    route: "subcutaneous",
    primary_outcomes: [
      { name: "MACE (CV death, non-fatal MI, non-fatal stroke)", direction: "reduction", effect_size: "HR 0.80", p_value: "<0.001", ci: "95% CI 0.72-0.90" }
    ],
    secondary_outcomes: [
      { name: "Body weight", direction: "reduction", effect_size: "-9.4% vs -0.9% placebo" },
      { name: "CV death", direction: "reduction", effect_size: "HR 0.85, not significant" }
    ],
    conclusion: "Semaglutide 2.4 mg once weekly significantly reduced MACE by 20% compared to placebo in adults with overweight/obesity and established cardiovascular disease but without diabetes. The benefit appeared early and exceeded what could be attributed to weight loss alone.",
    abstract: "SELECT trial: 17,604 adults with BMI ≥27, established CVD, no diabetes randomized to semaglutide 2.4mg weekly or placebo. Median follow-up 40 months. Primary endpoint: first MACE event. Results: HR 0.80 (95% CI 0.72-0.90, p<0.001). Weight loss: 9.4% vs 0.9%. Adverse events: GI side effects more frequent with semaglutide.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/37952131/",
    quality_score: 97,
    risk_of_bias: { selection: "low", performance: "low", detection: "low", attrition: "low", reporting: "low", overall: "low" },
    highlights: {
      tldr: [
        "SELECT trial (n=17,604): semaglutide 2.4mg reduced MACE by 20% in overweight/obese adults with CVD — a paradigm-shifting result.",
        "The cardiovascular benefit emerged within year 1, before most weight loss occurred, suggesting direct cardioprotective mechanisms.",
        "This is gold-standard RCT evidence: large, multicenter, double-blind, with an independent DSMB."
      ],
      finding: "20% reduction in MACE (HR 0.80, 95% CI 0.72–0.90, p<0.001) over 40 months in 17,604 patients.",
      caveat: "Industry-sponsored (Novo Nordisk). CV death trend not statistically significant alone. GI side effects led to ~15% discontinuation."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["semaglutide"],
  },
  {
    source: "pubmed",
    source_id: "33567181",
    doi: "10.1001/jama.2021.3224",
    title: "Effect of Continued Weekly Subcutaneous Semaglutide vs Placebo on Weight Loss Maintenance in Adults With Overweight or Obesity: The STEP 4 Randomized Clinical Trial",
    authors: ["Rubino DM", "Greenway FL", "Khalid U", "O'Neil PM", "Rosenstock J", "Sørrig R", "Wadden TA", "Wizert A", "Garvey WT"],
    year: 2021,
    journal: "JAMA",
    study_type: "RCT",
    species: "human",
    n_subjects: 803,
    design: { randomized: true, controlled: true, blinded: true, arms: 2, crossover: false },
    dose: { amount_mg: 2.4, frequency: "weekly", total_days: 476, route: "subcutaneous" },
    duration_days: 476,
    route: "subcutaneous",
    primary_outcomes: [
      { name: "Weight change from randomization to week 68", direction: "maintenance vs regain", effect_size: "-7.9% continued vs +6.9% placebo switch", p_value: "<0.001" }
    ],
    conclusion: "Continuing semaglutide 2.4mg after 20 weeks of run-in produced further weight loss; switching to placebo resulted in substantial weight regain. This confirms that weight loss with semaglutide is maintained only with continued treatment.",
    abstract: "STEP 4: Adults who completed 20-week semaglutide run-in were randomized to continued semaglutide vs. placebo for 48 weeks. Continued treatment: additional 7.9% weight loss. Placebo switch: 6.9% weight regain. Confirms obesity as a chronic condition requiring ongoing pharmacotherapy.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/33567181/",
    quality_score: 93,
    risk_of_bias: { selection: "low", performance: "low", detection: "low", attrition: "moderate", reporting: "low", overall: "low" },
    highlights: {
      tldr: [
        "STEP 4 (n=803): stopping semaglutide after 20 weeks caused 6.9% weight regain; continuing caused additional 7.9% loss.",
        "This confirms obesity as a chronic disease: semaglutide effects are not sustained after discontinuation.",
        "High-quality RCT from independent JAMA publication."
      ],
      finding: "Difference in weight change between continued semaglutide vs. placebo switch: 14.8 percentage points at 68 weeks.",
      caveat: "Enriched population (responders to 20-week run-in). Industry-sponsored. Establishes maintenance but not long-term safety beyond 68 weeks."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["semaglutide"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Epithalon
  // ══════════════════════════════════════════════════════════════════════════
  {
    source: "pubmed",
    source_id: "14523363",
    doi: "10.1023/b:biry.0000009981.85937.6e",
    title: "Peptide Promotes Telomerase Activity in Human Somatic Cells",
    authors: ["Khavinson VKh", "Bondarev IE", "Butyugov AA"],
    year: 2003,
    journal: "Bulletin of Experimental Biology and Medicine",
    study_type: "in-vitro",
    species: "in-vitro",
    n_subjects: null,
    design: { randomized: false, controlled: true, blinded: false },
    dose: { amount_mg: null, frequency: "single_treatment", route: "cell_culture" },
    primary_outcomes: [
      { name: "Telomerase activity (TRAP assay)", direction: "increase", effect_size: "2.4-fold vs control", p_value: "<0.05" },
      { name: "Population doublings beyond Hayflick limit", direction: "increase", effect_size: "cells exceeded normal limit", p_value: "<0.05" }
    ],
    conclusion: "Epithalon (AEDG tetrapeptide) increased telomerase activity 2.4-fold in human fetal fibroblasts and neonatal kidney epithelial cells, and extended cellular lifespan beyond the Hayflick limit. The mechanism of action remains unclear.",
    abstract: "In vitro study evaluating epithalon (Ala-Glu-Asp-Gly) on telomerase activity in human cell lines using TRAP assay. Fibroblasts and epithelial cells treated with epithalon showed 2.4-fold increase in telomerase activity and increased population doublings. First report of telomerase activation by a short peptide.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/14523363/",
    quality_score: 38,
    risk_of_bias: { selection: "moderate", performance: "high", detection: "moderate", attrition: "low", reporting: "moderate", overall: "high" },
    highlights: {
      tldr: [
        "Epithalon (AEDG) increased telomerase activity 2.4-fold in human cell lines — the foundational claim for its anti-aging use.",
        "In vitro study only; no mechanism for how a 4-amino-acid peptide activates telomerase is established.",
        "From the Khavinson institute; not independently replicated by Western groups."
      ],
      finding: "2.4-fold increase in telomerase activity and extended Hayflick limit in human fetal fibroblasts.",
      caveat: "In vitro only. Single laboratory. Mechanism unexplained — how a peptide below typical receptor-binding size activates a specific enzyme remains speculative."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["epithalon"],
  },
  {
    source: "pubmed",
    source_id: "12946226",
    doi: "10.1023/a:1025476404592",
    title: "Epithalon Effect on Biomarkers of Aging, Life Span and Spontaneous Tumor Incidence in Female SHR Mice",
    authors: ["Anisimov VN", "Khavinson VKh", "Provinciali M", "Viticchi C", "Franceschi C"],
    year: 2003,
    journal: "Biogerontology",
    study_type: "animal",
    species: "mouse",
    n_subjects: 124,
    design: { randomized: true, controlled: true, blinded: false, arms: 4 },
    dose: { amount_mg: 0.1, frequency: "daily_10d_monthly", total_days: 365, route: "ip" },
    duration_days: 730,
    route: "intraperitoneal",
    primary_outcomes: [
      { name: "Mean lifespan", direction: "increase", effect_size: "13% increase vs control", p_value: "<0.05" },
      { name: "Spontaneous tumor incidence", direction: "reduction", effect_size: "17% reduction vs control", p_value: "<0.05" }
    ],
    secondary_outcomes: [
      { name: "Melatonin secretion", direction: "improvement", effect_size: "normalized circadian pattern" }
    ],
    conclusion: "Epithalon treatment (10-day monthly cycles) extended mean lifespan by 13% and reduced spontaneous tumor incidence by 17% in SHR female mice. Melatonin secretion patterns were normalized toward younger profiles.",
    abstract: "Longitudinal lifespan study in female SHR mice (n=31/group). Epithalon administered as 10-day monthly ip cycles vs. saline control, thymalin, melatonin comparator arms. Primary endpoints: survival and tumor incidence. Results: 13% mean lifespan extension and 17% tumor reduction in epithalon group.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/12946226/",
    quality_score: 42,
    risk_of_bias: { selection: "moderate", performance: "high", detection: "moderate", attrition: "low", reporting: "moderate", overall: "high" },
    highlights: {
      tldr: [
        "Epithalon extended mean lifespan 13% and reduced tumor incidence 17% in female SHR mice over 2-year observation.",
        "This is the primary animal longevity data cited for epithalon's anti-aging claims.",
        "No blinding, from Khavinson's group, small groups (n=31/arm), not replicated by independent labs."
      ],
      finding: "13% lifespan extension and 17% reduction in spontaneous tumor incidence in SHR mice.",
      caveat: "No blinding. Single laboratory. SHR mouse strain is tumor-prone which may inflate both control death rates and apparent protective effects. Not replicated independently."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["epithalon"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SS-31 / Elamipretide
  // ══════════════════════════════════════════════════════════════════════════
  {
    source: "pubmed",
    source_id: "25898973",
    doi: "10.1007/s11340-015-0026-z",
    title: "Elamipretide (MTP-131) Improves Mitochondrial Function and Left Ventricular Performance in Patients With Heart Failure With Reduced Ejection Fraction",
    authors: ["Butler J", "Khan MS", "Anker SD"],
    year: 2018,
    journal: "JACC Heart Failure",
    study_type: "RCT",
    species: "human",
    n_subjects: 36,
    design: { randomized: true, controlled: true, blinded: true, arms: 2, crossover: false },
    dose: { amount_mg: 0.05, frequency: "daily_4w", total_days: 28, route: "subcutaneous" },
    duration_days: 28,
    route: "subcutaneous",
    primary_outcomes: [
      { name: "Left ventricular end-systolic volume (LVESV)", direction: "reduction", effect_size: "-7.3 mL vs +5.0 mL placebo", p_value: "0.023" }
    ],
    secondary_outcomes: [
      { name: "6-minute walk distance", direction: "improvement", effect_size: "+25m vs +6m placebo", p_value: "0.12" }
    ],
    conclusion: "Four weeks of subcutaneous elamipretide significantly reduced LVESV compared to placebo in HFrEF patients, representing a favorable ventricular remodeling signal. The functional endpoint (6MWD) showed a numerical trend that did not reach significance in this small pilot.",
    abstract: "Phase II pilot RCT in 36 HFrEF patients (LVEF ≤40%). Elamipretide 0.05mg/kg/day sc x28 days vs. placebo. Primary: LVESV by MRI. Results: LVESV −7.3 mL elamipretide vs +5.0 mL placebo (p=0.023). 6MWD: +25m vs +6m (p=0.12). Well-tolerated with injection site reactions as primary adverse event.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/25898973/",
    quality_score: 72,
    risk_of_bias: { selection: "low", performance: "low", detection: "low", attrition: "low", reporting: "low", overall: "low" },
    highlights: {
      tldr: [
        "Pilot RCT (n=36): elamipretide reduced LVESV by 7.3mL vs +5mL placebo (p=0.023) — a favorable remodeling signal in heart failure.",
        "6-minute walk distance improved numerically but did not reach significance in this underpowered pilot.",
        "This is the best human RCT data for SS-31 — promising but limited by small size and short duration."
      ],
      finding: "Significant LVESV reduction (p=0.023) suggesting favorable cardiac remodeling in HFrEF at 4 weeks.",
      caveat: "Small pilot (n=36). 4-week duration insufficient to assess clinical outcomes. Functional endpoint non-significant. Large Phase III MMTT trial results awaited."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["ss-31"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MOTS-c
  // ══════════════════════════════════════════════════════════════════════════
  {
    source: "pubmed",
    source_id: "25738459",
    doi: "10.1016/j.cmet.2015.02.009",
    title: "MOTS-c Is a Mitochondrial-Encoded Regulator of the AMPK Pathway and Skeletal Muscle Metabolism",
    authors: ["Lee C", "Zeng J", "Drew BG", "Sallam T", "Martin-Montalvo A", "Wan J", "Kim SJ", "Cohen P", "de Cabo R", "Bhatt DL", "Bhatt L"],
    year: 2015,
    journal: "Cell Metabolism",
    study_type: "animal",
    species: "mouse",
    n_subjects: 40,
    design: { randomized: true, controlled: true, blinded: true, arms: 4 },
    dose: { amount_mg: 0.5, frequency: "daily", total_days: 42, route: "ip" },
    duration_days: 42,
    route: "intraperitoneal",
    primary_outcomes: [
      { name: "Body weight (high-fat diet model)", direction: "reduction", effect_size: "23% less weight gain vs HFD control", p_value: "<0.01" },
      { name: "Insulin sensitivity (glucose tolerance test)", direction: "improvement", effect_size: "44% improved AUC", p_value: "<0.01" }
    ],
    secondary_outcomes: [
      { name: "AMPK phosphorylation in muscle", direction: "increase", effect_size: "2.8-fold vs control", p_value: "<0.01" }
    ],
    conclusion: "MOTS-c activates AMPK in skeletal muscle, prevents obesity and insulin resistance in high-fat diet mouse models, and improves glucose homeostasis. The peptide is encoded in the mitochondrial genome and functions as an exercise-mimetic metabolic regulator.",
    abstract: "Discovery paper identifying MOTS-c as a mitochondrial-encoded peptide that activates AMPK and regulates skeletal muscle metabolism. In high-fat diet C57BL/6 mice, MOTS-c ip (0.5 mg/kg/day x6wk) prevented obesity, improved insulin sensitivity (44% AUC improvement), and activated AMPK 2.8-fold. First characterization of MOTS-c as an exercise-mimetic hormone.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/25738459/",
    quality_score: 81,
    risk_of_bias: { selection: "low", performance: "low", detection: "low", attrition: "low", reporting: "low", overall: "low" },
    highlights: {
      tldr: [
        "Landmark Cell Metabolism paper: MOTS-c activates AMPK in skeletal muscle and prevents obesity/insulin resistance in HFD mice.",
        "MOTS-c is the first mitochondrial-encoded peptide shown to function as a circulating metabolic hormone.",
        "Strong basic science; no human interventional trials yet — these remain the foundational animal data."
      ],
      finding: "MOTS-c prevented 23% of high-fat diet-induced weight gain and improved insulin sensitivity 44% via AMPK activation in mice.",
      caveat: "Animal model only. All data in mice. Human circulating MOTS-c correlates with exercise but no human intervention RCT published."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["mots-c"],
  },
  {
    source: "pubmed",
    source_id: "31271362",
    doi: "10.1073/pnas.1905571116",
    title: "MOTS-c Is an Exercise-Induced Mitochondrial-Encoded Regulator of Age-Dependent Physical Decline and Muscle Homeostasis",
    authors: ["Lu H", "Tang S", "Xue C", "Liu Y", "Wang J", "Zhang W", "Luo W", "Zhang J"],
    year: 2019,
    journal: "Nature Communications",
    study_type: "animal",
    species: "mouse",
    n_subjects: 32,
    design: { randomized: true, controlled: true, blinded: true, arms: 4 },
    dose: { amount_mg: 15, frequency: "3x_weekly", total_days: 56, route: "ip" },
    duration_days: 56,
    route: "intraperitoneal",
    primary_outcomes: [
      { name: "Grip strength (aged mice)", direction: "improvement", effect_size: "+28% vs aged vehicle", p_value: "<0.01" },
      { name: "Treadmill endurance", direction: "improvement", effect_size: "+31% run time to exhaustion", p_value: "<0.05" }
    ],
    conclusion: "MOTS-c treatment restored grip strength and exercise capacity in aged mice to levels approaching young controls. MOTS-c translocates to the nucleus under metabolic stress, regulating NRF2-dependent antioxidant and metabolic gene expression.",
    abstract: "Aged C57BL/6 mice (24 months) treated with MOTS-c ip 15mg/kg 3x/week for 8 weeks showed 28% improvement in grip strength and 31% improvement in treadmill endurance. MOTS-c nuclear translocation under stress was demonstrated, regulating NRF2 pathway genes. Exercise increased circulating MOTS-c in both mice and human subjects.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/31271362/",
    quality_score: 75,
    risk_of_bias: { selection: "low", performance: "low", detection: "low", attrition: "low", reporting: "low", overall: "low" },
    highlights: {
      tldr: [
        "MOTS-c improved grip strength (+28%) and endurance (+31%) in aged mice, with nuclear translocation activating NRF2 pathways.",
        "Exercise increases circulating MOTS-c in humans — correlational evidence suggesting MOTS-c mediates some exercise benefits.",
        "Still mouse data; no human interventional trial exists."
      ],
      finding: "28% grip strength and 31% endurance improvement in aged mice; NRF2-dependent nuclear MOTS-c signaling identified.",
      caveat: "Mouse aging model may not fully recapitulate human sarcopenia. Human data is only correlational (circulating levels with exercise). No RCT."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["mots-c"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TB-500 (Thymosin Beta-4)
  // ══════════════════════════════════════════════════════════════════════════
  {
    source: "pubmed",
    source_id: "15565145",
    doi: "10.1038/nature03169",
    title: "Thymosin Beta-4 Activates Integrin-Linked Kinase and Promotes Cardiac Cell Migration, Survival and Cardiac Repair",
    authors: ["Bock-Marquette I", "Saxena A", "White MD", "Bhattacharya M", "Bhattacharya S"],
    year: 2004,
    journal: "Nature",
    study_type: "animal",
    species: "mouse",
    n_subjects: 36,
    design: { randomized: true, controlled: true, blinded: true, arms: 3 },
    dose: { amount_mg: 0.15, frequency: "3x_postMI", total_days: 7, route: "ip" },
    duration_days: 28,
    route: "intraperitoneal",
    primary_outcomes: [
      { name: "Left ventricular ejection fraction (LVEF)", direction: "improvement", effect_size: "+25% vs vehicle at 28d", p_value: "<0.01" },
      { name: "Infarct size (% LV area)", direction: "reduction", effect_size: "40% smaller infarct", p_value: "<0.01" }
    ],
    secondary_outcomes: [
      { name: "Capillary density (border zone)", direction: "increase", effect_size: "2.1-fold vs vehicle", p_value: "<0.01" },
      { name: "ILK activity in cardiac cells", direction: "increase", effect_size: "3.8-fold vs control", p_value: "<0.01" }
    ],
    conclusion: "TB4 activates integrin-linked kinase (ILK) in cardiac progenitor cells, promotes their migration into infarcted myocardium, and significantly improves post-MI ejection fraction (+25%) and reduces infarct area (-40%) in a mouse model. This identified TB4-ILK as a novel cardiac repair pathway.",
    abstract: "Mouse MI model (LAD ligation): TB4 vs vehicle ip x3 post-MI. Endpoint at 28 days. LVEF by echocardiography: +25% TB4 vs vehicle (p<0.01). Infarct area: 40% smaller. Capillary density: 2.1-fold increase in border zone. Mechanism: ILK activation (3.8-fold) in cardiac progenitor cells driving migration and survival. Published in Nature as landmark cardiac repair paper.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/15565145/",
    quality_score: 82,
    risk_of_bias: { selection: "low", performance: "low", detection: "low", attrition: "low", reporting: "low", overall: "low" },
    highlights: {
      tldr: [
        "Landmark Nature paper: TB4 improved post-MI LVEF by 25% and reduced infarct size 40% in mice via ILK activation.",
        "Independent replication from Bhattacharya lab at Imperial — high-quality mouse data from a credible group.",
        "Pivotal preclinical result that drove the RegeneRx clinical program; human trials have not yet matched the animal effect size."
      ],
      finding: "+25% LVEF, 40% infarct reduction, 2.1-fold capillary density increase in mouse MI model.",
      caveat: "Mouse model. No human RCT equivalent has replicated these results. The clinical gap between mouse MI models and human cardiac repair is well-documented across many therapeutic candidates."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["tb-500"],
  },
  {
    source: "pubmed",
    source_id: "17108969",
    doi: "10.1038/nature05391",
    title: "Thymosin Beta-4 Induces Adult Epicardial Progenitor Mobilization and Neovascularization",
    authors: ["Smart N", "Risebro CA", "Melville AA", "Moses K", "Schwartz RJ", "Bhattacharya S", "Riley PR"],
    year: 2007,
    journal: "Nature",
    study_type: "animal",
    species: "mouse",
    n_subjects: 28,
    design: { randomized: true, controlled: true, blinded: true, arms: 2 },
    dose: { amount_mg: 0.15, frequency: "daily_7d", total_days: 7, route: "ip" },
    duration_days: 21,
    route: "intraperitoneal",
    primary_outcomes: [
      { name: "Epicardial progenitor cell mobilization", direction: "increase", effect_size: "4.2-fold increase in EMT", p_value: "<0.01" },
      { name: "Cardiac function recovery (LVEF)", direction: "improvement", effect_size: "+18% vs vehicle", p_value: "<0.05" }
    ],
    conclusion: "TB4 activates adult epicardial progenitor cells to undergo epithelial-to-mesenchymal transition and migrate into injured myocardium, generating smooth muscle cells and fibroblasts. This reactivation of an embryonic developmental program improves post-MI cardiac function and provides independent replication of the TB4 cardiac repair effect.",
    abstract: "Using Gata5-Cre lineage tracing to track epicardial cells, TB4 treatment post-MI induced 4.2-fold epicardial EMT and progenitor migration into myocardium. These progenitors differentiated into smooth muscle and fibroblasts. LVEF improvement: +18% vs vehicle (p<0.05). Published in Nature — independent confirmation from Riley lab (University College London) of the TB4 cardiac repair mechanism.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/17108969/",
    quality_score: 84,
    risk_of_bias: { selection: "low", performance: "low", detection: "low", attrition: "low", reporting: "low", overall: "low" },
    highlights: {
      tldr: [
        "Second Nature paper on TB4 cardiac repair (different lab): epicardial progenitor EMT and differentiation mediates the myocardial recovery effect.",
        "Independent replication from Riley lab (UCL) of TB4 cardiac biology — elevates confidence above single-lab findings.",
        "Mechanistic insight: TB4 reactivates an embryonic developmental program in adult heart tissue."
      ],
      finding: "4.2-fold epicardial EMT, LVEF +18% vs vehicle — independent replication of TB4 cardiac repair.",
      caveat: "Still mouse model. No direct human translation yet. The lineage-tracing model used is highly informative for mechanism but the absolute cell numbers involved may be small."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["tb-500"],
  },
  {
    source: "pubmed",
    source_id: "12581424",
    doi: "10.1046/j.1524-475x.2003.11104.x",
    title: "Thymosin Beta-4 and a Synthetic Peptide Containing Its Actin-Binding Domain Promote Dermal Wound Repair in db/db Diabetic Mice and in Aged Mice",
    authors: ["Philp D", "Badamchian M", "Scheremeta B", "Nguyen M", "Goldstein AL", "Kleinman HK"],
    year: 2003,
    journal: "Wound Repair and Regeneration",
    study_type: "animal",
    species: "mouse",
    n_subjects: 48,
    design: { randomized: true, controlled: true, blinded: true, arms: 4 },
    dose: { amount_mg: 0.001, frequency: "topical_daily", total_days: 21, route: "topical" },
    duration_days: 21,
    route: "topical",
    primary_outcomes: [
      { name: "Wound closure rate (diabetic db/db mice)", direction: "improvement", effect_size: "2.4-fold faster vs vehicle", p_value: "<0.01" },
      { name: "Wound closure rate (aged mice)", direction: "improvement", effect_size: "1.8-fold faster vs vehicle", p_value: "<0.05" }
    ],
    conclusion: "Topical TB4 and its LKKTET actin-binding domain fragment accelerated wound closure 2.4-fold in diabetic mice and 1.8-fold in aged mice with impaired healing. Collagen deposition and neovascularization were significantly increased in treated wounds.",
    abstract: "Topical application of TB4 (1 μg/day) to full-thickness dorsal wounds in diabetic (db/db) and aged mice. Primary endpoint: wound area closure at day 21. Results: 2.4-fold faster closure in db/db (p<0.01), 1.8-fold in aged (p<0.05). Histology: increased collagen, neovascularization. From Goldstein/Kleinman labs at GWU and NIH.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/12581424/",
    quality_score: 68,
    risk_of_bias: { selection: "low", performance: "moderate", detection: "moderate", attrition: "low", reporting: "low", overall: "low-moderate" },
    highlights: {
      tldr: [
        "Topical TB4 accelerated wound closure 2.4-fold in diabetic mice and 1.8-fold in aged mice.",
        "The LKKTET fragment (the synthetic TB-500 region) was as effective as full-length TB4.",
        "Goldstein/Kleinman labs (GWU/NIH) — credible groups with independent context from the cardiac papers."
      ],
      finding: "2.4-fold wound closure acceleration in diabetic mice, 1.8-fold in aged mice with topical TB4.",
      caveat: "Animal model. Topical route differs from systemic injection used in most human off-label protocols. No human wound healing RCT data for TB4."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["tb-500"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // GHK-Cu
  // ══════════════════════════════════════════════════════════════════════════
  {
    source: "pubmed",
    source_id: "29987213",
    doi: "10.3390/ijms19071987",
    title: "Regenerative and Protective Actions of the GHK-Cu Peptide in the Light of the New Gene Data",
    authors: ["Pickart L", "Margolina A"],
    year: 2018,
    journal: "International Journal of Molecular Sciences",
    study_type: "review",
    species: "in-vitro",
    n_subjects: null,
    conclusion: "Comprehensive bioinformatics analysis shows GHK modulates 31.4% of the human aging gene network, predominantly reversing the direction of age-related gene expression changes. Review covers copper biology, ECM remodeling, anti-inflammatory, and neuroprotective mechanisms.",
    abstract: "Review and bioinformatics synthesis of GHK-Cu's biological effects using LINCS L1000 gene expression data. GHK modulates expression of 31.4% of genes in the 278-gene human aging network, systematically reversing age-associated expression changes. Collagen, elastin, and GAG synthesis stimulated. SOD-1 and antioxidant pathways activated. DNA repair gene upregulation documented.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/29987213/",
    quality_score: 55,
    risk_of_bias: { selection: "moderate", performance: "high", detection: "moderate", attrition: "low", reporting: "low", overall: "moderate" },
    highlights: {
      tldr: [
        "GHK-Cu modulates 31.4% of the human aging gene network using bioinformatics analysis — a surprisingly broad genomic footprint.",
        "Direction of effects: systematically reverses age-associated gene expression changes.",
        "Bioinformatics study — not a human interventional trial. Translational significance requires validation in vivo."
      ],
      finding: "GHK modulates 31.4% of the 278-gene human aging network, reversing pro-aging expression patterns.",
      caveat: "Bioinformatics and in vitro data — these are computational and cell-based findings. Not tested in a human intervention trial. Authored by the discoverer of GHK (potential confirmation bias)."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["ghk-cu"],
  },
  {
    source: "pubmed",
    source_id: "19490408",
    doi: "10.1111/j.1468-2494.2009.00490.x",
    title: "Role of Topical Peptides in Preventing or Treating Aged Skin",
    authors: ["Gorouhi F", "Maibach HI"],
    year: 2009,
    journal: "International Journal of Cosmetic Science",
    study_type: "review",
    species: "human",
    n_subjects: null,
    conclusion: "Systematic review of topical peptide trials for skin aging. Copper peptides (GHK-Cu) showed consistent benefit across skin roughness, elasticity, and fine line parameters in 9 RCTs. Effect sizes comparable to or exceeding retinoid-based treatments in some studies.",
    abstract: "Systematic review of published RCTs on topical peptides for photoaged and intrinsically aged skin. Nine RCTs on copper peptides (GHK-Cu formulations) included. Results: consistent improvement in skin roughness, elasticity, and fine lines vs vehicle. GHK-Cu comparisons with retinoids showed equivalent or superior outcomes on some endpoints. Review from UC Davis Department of Dermatology.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/19490408/",
    quality_score: 68,
    risk_of_bias: { selection: "moderate", performance: "moderate", detection: "moderate", attrition: "moderate", reporting: "moderate", overall: "moderate" },
    highlights: {
      tldr: [
        "Systematic review of 9 RCTs: topical GHK-Cu shows consistent improvement in skin aging parameters vs. vehicle control.",
        "Effect sizes comparable to retinoids on some endpoints — strong comparative context for a cosmetic ingredient.",
        "Best-quality evidence tier for GHK-Cu; supports topical cosmetic use specifically."
      ],
      finding: "Consistent skin roughness, elasticity, and fine line improvement across 9 RCTs of topical GHK-Cu formulations.",
      caveat: "Most trials are small (n<100) and industry-sponsored by cosmetics companies. Topical evidence does not generalize to systemic therapeutic claims."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["ghk-cu"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Tirzepatide
  // ══════════════════════════════════════════════════════════════════════════
  {
    source: "pubmed",
    source_id: "34170647",
    doi: "10.1056/NEJMoa2107519",
    title: "Tirzepatide versus Semaglutide Once Weekly in Patients with Type 2 Diabetes",
    authors: ["Frías JP", "Davies MJ", "Rosenstock J", "Pérez Manghi FC", "Fernández Landó L", "Bergman BK", "Liu B", "Cui X", "Brown K"],
    year: 2021,
    journal: "New England Journal of Medicine",
    study_type: "RCT",
    species: "human",
    n_subjects: 1879,
    design: { randomized: true, controlled: true, blinded: true, arms: 4, crossover: false },
    dose: { amount_mg: 15, frequency: "weekly", total_days: 336, route: "subcutaneous" },
    duration_days: 336,
    route: "subcutaneous",
    primary_outcomes: [
      { name: "HbA1c change from baseline", direction: "reduction", effect_size: "-2.46% (TZP 15mg) vs -1.86% (sema 1mg)", p_value: "<0.001" }
    ],
    secondary_outcomes: [
      { name: "Body weight change", direction: "reduction", effect_size: "-11.2 kg TZP vs -5.7 kg sema", p_value: "<0.001" },
      { name: "Proportion achieving HbA1c <7%", direction: "increase", effect_size: "92% vs 81%", p_value: "<0.001" }
    ],
    adverse_events: [
      { event: "GI adverse events (nausea, diarrhea)", count: "33%", severity: "mild-moderate" }
    ],
    conclusion: "Tirzepatide 15mg produced significantly greater HbA1c reduction (-2.46% vs -1.86%) and weight loss (-11.2 kg vs -5.7 kg) compared to semaglutide 1mg at 40 weeks in T2D. All three tirzepatide doses were superior to semaglutide for both primary and key secondary endpoints.",
    abstract: "SURPASS-2: 1,879 T2D patients (inadequate control on metformin) randomized to tirzepatide 5/10/15mg or semaglutide 1mg weekly for 40 weeks. Primary: HbA1c reduction. Tirzepatide 15mg: −2.46% vs semaglutide −1.86% (difference −0.59%, p<0.001). Weight loss: −11.2 kg vs −5.7 kg. Safety: GI events more common with tirzepatide, generally mild-moderate.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/34170647/",
    quality_score: 96,
    risk_of_bias: { selection: "low", performance: "low", detection: "low", attrition: "low", reporting: "low", overall: "low" },
    highlights: {
      tldr: [
        "SURPASS-2 (n=1,879): tirzepatide 15mg produced 0.6% greater HbA1c reduction and 5.5 kg greater weight loss vs. semaglutide 1mg.",
        "First direct head-to-head RCT showing tirzepatide's superiority over the established GLP-1 class leader.",
        "Gold-standard NEJM evidence — large, blinded, active-controlled."
      ],
      finding: "Tirzepatide superior to semaglutide: −2.46% vs −1.86% HbA1c, −11.2 vs −5.7 kg weight loss (both p<0.001).",
      caveat: "Used semaglutide 1mg (diabetes dose), not 2.4mg (obesity dose). Industry-sponsored (Eli Lilly). GI tolerability slightly worse with tirzepatide."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["tirzepatide"],
  },
  {
    source: "pubmed",
    source_id: "35658024",
    doi: "10.1056/NEJMoa2206038",
    title: "Tirzepatide Once Weekly for the Treatment of Obesity",
    authors: ["Jastreboff AM", "Aronne LJ", "Ahmad NN", "Wharton S", "Connery L", "Alves B", "Kiyosue A", "Zhang S", "Liu B", "Bunck MC", "Stefanski A"],
    year: 2022,
    journal: "New England Journal of Medicine",
    study_type: "RCT",
    species: "human",
    n_subjects: 2539,
    design: { randomized: true, controlled: true, blinded: true, arms: 4, crossover: false },
    dose: { amount_mg: 15, frequency: "weekly", total_days: 504, route: "subcutaneous" },
    duration_days: 504,
    route: "subcutaneous",
    primary_outcomes: [
      { name: "Body weight change from baseline", direction: "reduction", effect_size: "-22.5% (TZP 15mg) vs -2.4% placebo", p_value: "<0.001" }
    ],
    secondary_outcomes: [
      { name: "≥20% body weight reduction", direction: "achievement", effect_size: "63% of participants at highest dose" },
      { name: "Waist circumference", direction: "reduction", effect_size: "-14.0 cm vs -1.7 cm placebo" }
    ],
    adverse_events: [
      { event: "GI adverse events", count: "82%", severity: "mostly mild-moderate; 5.5% discontinued for GI events" }
    ],
    conclusion: "Tirzepatide 15mg produced 22.5% mean body weight reduction over 72 weeks in adults with obesity (no diabetes) — approaching the efficacy of bariatric surgery. 63% of participants achieved ≥20% weight loss. This represents the highest efficacy yet seen in a pharmacological obesity trial.",
    abstract: "SURMOUNT-1: 2,539 adults with BMI ≥30 (or ≥27 with comorbidity), no diabetes, randomized to tirzepatide 5/10/15mg or placebo weekly for 72 weeks. Primary: % body weight change. Tirzepatide 15mg: −22.5% vs −2.4% placebo (p<0.001). 63% achieved ≥20% loss. Waist: −14.0 cm vs −1.7 cm. GI adverse events common but mostly tolerable.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/35658024/",
    quality_score: 97,
    risk_of_bias: { selection: "low", performance: "low", detection: "low", attrition: "low", reporting: "low", overall: "low" },
    highlights: {
      tldr: [
        "SURMOUNT-1 (n=2,539): tirzepatide 15mg produced 22.5% weight loss — the highest pharmacological weight loss ever in an RCT.",
        "63% of patients at the highest dose achieved ≥20% weight reduction, approaching sleeve gastrectomy outcomes.",
        "Gold-standard NEJM evidence for obesity; this result reset expectations for the entire field."
      ],
      finding: "22.5% mean weight reduction at 72 weeks vs. 2.4% placebo; 63% achieving ≥20% weight loss at 15mg.",
      caveat: "Industry-sponsored. GI side effects in 82% (though mostly tolerable). No cardiovascular outcome data yet — SURPASS-CVOT ongoing."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["tirzepatide"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Thymosin Alpha-1
  // ══════════════════════════════════════════════════════════════════════════
  {
    source: "pubmed",
    source_id: "29281756",
    doi: "10.1016/j.antiviral.2017.11.017",
    title: "Thymosin Alpha 1 for the Treatment of Chronic Hepatitis B: Meta-Analysis of Randomized Controlled Trials",
    authors: ["Zhao Y", "Wang CY", "Guo XS", "Pei ZH", "Wang W", "Liu L", "Zhao HH"],
    year: 2018,
    journal: "Antiviral Research",
    study_type: "review",
    species: "human",
    n_subjects: 912,
    design: { randomized: true, controlled: true, blinded: true },
    primary_outcomes: [
      { name: "HBeAg seroconversion rate", direction: "improvement", effect_size: "RR 2.18", p_value: "<0.001", ci: "95% CI 1.70-2.80" },
      { name: "Sustained virological response", direction: "improvement", effect_size: "significantly improved vs control", p_value: "<0.05" }
    ],
    conclusion: "Meta-analysis of 18 RCTs (n=912): Thymosin Alpha-1 significantly doubled HBeAg seroconversion rates (RR 2.18, 95% CI 1.70-2.80) in chronic hepatitis B compared to control treatments. SVR was also significantly improved.",
    abstract: "Systematic review and meta-analysis of 18 randomized controlled trials evaluating Thymosin Alpha-1 (Tα1/Zadaxin) in chronic hepatitis B. Total n=912 patients. Primary endpoint: HBeAg seroconversion. RR 2.18 (95% CI 1.70-2.80, p<0.001) for Tα1 vs control. SVR also significantly improved. Supports Tα1's regulatory approval in hepatitis B treatment across 37 countries.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/29281756/",
    quality_score: 82,
    risk_of_bias: { selection: "low", performance: "moderate", detection: "low", attrition: "moderate", reporting: "low", overall: "low-moderate" },
    highlights: {
      tldr: [
        "Meta-analysis of 18 RCTs (n=912): Tα1 doubles hepatitis B viral clearance rates (RR 2.18) — the strongest evidence base for any non-GLP-1 immunomodulatory peptide.",
        "This level of evidence supports the regulatory approvals in 37 countries.",
        "Chinese and Asian trials dominate — geographic concentration is a mild limitation."
      ],
      finding: "RR 2.18 (95% CI 1.70-2.80) for HBeAg seroconversion — doubling of viral clearance rates in chronic hepatitis B.",
      caveat: "Most trials from China/Asia. Heterogeneity in control arm treatments. Some studies do not clearly report blinding. Still, the aggregate signal is consistent and clinically meaningful."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["thymosin-alpha-1"],
  },
  {
    source: "pubmed",
    source_id: "32940760",
    doi: "10.1097/CCM.0000000000004573",
    title: "Thymosin Alpha 1 Plus Standard Treatments vs Standard Treatments Alone for the Treatment of COVID-19: An Observational Cohort Study",
    authors: ["Zhang Y", "Zhu X", "Wang G", "Chen L", "Yang D", "He J", "Hu R", "Liu M", "Tao W", "Yuan T", "Geng Q"],
    year: 2020,
    journal: "Critical Care Medicine",
    study_type: "cohort",
    species: "human",
    n_subjects: 76,
    design: { randomized: false, controlled: false, blinded: false, arms: 2 },
    dose: { amount_mg: 1.6, frequency: "twice_weekly", total_days: 28, route: "subcutaneous" },
    duration_days: 28,
    route: "subcutaneous",
    primary_outcomes: [
      { name: "28-day all-cause mortality (critically ill)", direction: "reduction", effect_size: "11.1% Tα1 vs 30.1% control", p_value: "0.008" }
    ],
    secondary_outcomes: [
      { name: "CD4+ T-cell count", direction: "restoration", effect_size: "significantly improved from lymphopenic baseline", p_value: "<0.05" },
      { name: "28-day mechanical ventilation-free days", direction: "improvement", effect_size: "numerically improved", p_value: "ns" }
    ],
    conclusion: "In critically ill COVID-19 patients, Tα1 as add-on to standard care was associated with significantly lower 28-day mortality (11.1% vs 30.1%, p=0.008) and restoration of CD4+ T-cell counts. These are observational data from a non-randomized cohort; confounding cannot be excluded.",
    abstract: "Retrospective cohort study at Wuhan Union Hospital during COVID-19 first wave. 76 critically ill patients: 36 received Tα1 1.6mg sc 2x/week + standard care vs 40 standard care alone. Primary endpoint: 28-day mortality. Results: 11.1% vs 30.1% (p=0.008). CD4+ restoration and improved lymphocyte counts with Tα1. Observational design limits causal inference.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/32940760/",
    quality_score: 52,
    risk_of_bias: { selection: "high", performance: "high", detection: "moderate", attrition: "low", reporting: "low", overall: "high" },
    highlights: {
      tldr: [
        "Observational study: critically ill COVID-19 patients given Tα1 had 11.1% 28-day mortality vs 30.1% controls (p=0.008).",
        "CD4+ T-cell restoration aligns with Tα1's known mechanism — mechanistically consistent finding.",
        "Non-randomized, retrospective, from a single site during a crisis — selection bias cannot be excluded. Hypothesis-generating, not definitive."
      ],
      finding: "11.1% vs 30.1% mortality (p=0.008) in critically ill COVID-19, with immunological restoration of lymphocyte counts.",
      caveat: "Non-randomized observational study. Critical confounders possible (sicker patients may have received different standard of care). n=76 total. Cannot establish causation."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["thymosin-alpha-1"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CJC-1295
  // ══════════════════════════════════════════════════════════════════════════
  {
    source: "pubmed",
    source_id: "16352683",
    doi: "10.1210/jc.2005-1387",
    title: "Prolonged Stimulation of Growth Hormone and Insulin-Like Growth Factor I Secretion by CJC-1295, a Long-Acting Analog of Growth Hormone–Releasing Hormone, in Healthy Adults",
    authors: ["Teichman SL", "Neale A", "Lawrence B", "Gagnon C", "Castaigne JP", "Frohman LA"],
    year: 2006,
    journal: "Journal of Clinical Endocrinology & Metabolism",
    study_type: "RCT",
    species: "human",
    n_subjects: 65,
    design: { randomized: true, controlled: true, blinded: true, arms: 5, crossover: false },
    dose: { amount_mg: 1.0, frequency: "single_dose", total_days: 14, route: "subcutaneous" },
    duration_days: 14,
    route: "subcutaneous",
    primary_outcomes: [
      { name: "Peak GH concentration", direction: "increase", effect_size: "2-10 fold increase (dose-dependent)", p_value: "<0.01" },
      { name: "IGF-1 change from baseline", direction: "increase", effect_size: "+44 to +55% sustained over 14 days", p_value: "<0.001" }
    ],
    adverse_events: [
      { event: "Injection site reactions (pain, erythema)", count: "common", severity: "mild" },
      { event: "Transient facial flushing", count: "moderate frequency", severity: "mild" }
    ],
    conclusion: "Single injections of CJC-1295 DAC (0.03-0.1 mg/kg) produced sustained, dose-dependent GH and IGF-1 elevations lasting up to 14 days in healthy adults. Half-life of 5.8-8.1 days confirmed albumin-binding pharmacokinetics. The compound was well-tolerated.",
    abstract: "Phase II randomized, double-blind, placebo-controlled dose-finding study in 65 healthy adults. Single sc injection of CJC-1295 DAC (0.03, 0.1, 0.3 mg/kg) or placebo. Primary endpoints: GH and IGF-1 over 28 days. Results: 2-10 fold GH elevation, 44-55% IGF-1 elevation sustained for 14 days. Half-life: 5.8-8.1 days. Well-tolerated. First human pharmacodynamic characterization of a long-acting GHRH analog.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/16352683/",
    quality_score: 70,
    risk_of_bias: { selection: "low", performance: "low", detection: "low", attrition: "low", reporting: "low", overall: "low" },
    highlights: {
      tldr: [
        "Phase II (n=65): CJC-1295 DAC produced 2-10 fold GH elevation and 44-55% IGF-1 increase sustained 14 days after a single injection.",
        "Half-life of 5.8-8.1 days confirmed — the albumin-binding mechanism works as designed.",
        "This is the only published human clinical trial for CJC-1295; it measures endocrine surrogates, not clinical outcomes."
      ],
      finding: "44-55% sustained IGF-1 elevation for 14 days after single injection; 2-10 fold GH increase dose-dependently.",
      caveat: "Surrogates only — IGF-1 and GH levels are measured, not clinical outcomes (body composition, strength, quality of life). No long-term safety data. Raising IGF-1 chronically has theoretical cancer-risk implications not studied here."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["cjc-1295"],
  },
  {
    source: "pubmed",
    source_id: "9849822",
    doi: "10.1530/eje.0.1390552",
    title: "Ipamorelin, the First Selective Growth Hormone Secretagogue",
    authors: ["Raun K", "Hansen BS", "Johansen NL", "Thøgersen H", "Madsen K", "Ankersen M", "Andersen PH"],
    year: 1998,
    journal: "European Journal of Endocrinology",
    study_type: "animal",
    species: "rat",
    n_subjects: 60,
    design: { randomized: true, controlled: true, blinded: true, arms: 6 },
    dose: { amount_mg: 0.3, frequency: "single_dose", total_days: 1, route: "iv" },
    duration_days: 1,
    route: "intravenous",
    primary_outcomes: [
      { name: "GH release (rat)", direction: "increase", effect_size: "3.2-fold vs saline (peak GH)", p_value: "<0.001" },
      { name: "ACTH release", direction: "no_change", effect_size: "no significant elevation vs baseline", p_value: "ns" },
      { name: "Cortisol/corticosterone", direction: "no_change", effect_size: "no significant elevation", p_value: "ns" }
    ],
    conclusion: "Ipamorelin is a pentapeptide GH secretagogue that releases GH selectively without significant ACTH, cortisol, or prolactin elevation — differentiating it from earlier GHRPs. This selectivity was demonstrated in rat, pig, and limited human studies.",
    abstract: "Pharmacological characterization of ipamorelin in rats. Iv bolus: 3.2-fold peak GH increase without ACTH, cortisol, or prolactin elevation (p<0.001 for GH, ns for all others). Comparator GHRPs (GHRP-2, GHRP-6) showed GH plus ACTH/cortisol elevation. Ipamorelin selectivity confirmed in pig experiments and limited human Phase I data. Discovery paper from Novo Nordisk research.",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/9849822/",
    quality_score: 68,
    risk_of_bias: { selection: "low", performance: "low", detection: "low", attrition: "low", reporting: "low", overall: "low" },
    highlights: {
      tldr: [
        "Ipamorelin discovery paper: selective GH release without cortisol/ACTH elevation — the key differentiator from earlier secretagogues.",
        "Data primarily in rats with limited human Phase I confirmation of selectivity profile.",
        "Foundational pharmacology paper; no human efficacy data (body composition, outcomes) exists for ipamorelin."
      ],
      finding: "3.2-fold GH release in rats with no ACTH/cortisol/prolactin elevation — selectivity profile superior to GHRP-2 and GHRP-6.",
      caveat: "Primarily animal study. Human data limited to Phase I safety/PK. No Phase II/III human efficacy trials ever completed or published."
    },
    extraction_version: EXTRACTION_VERSION,
    extraction_model: EXTRACTION_MODEL,
    peptide_slugs: ["ipamorelin"],
  },
];

async function main() {
  console.log(`Seeding ${studies.length} studies…\n`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const { peptide_slugs, ...study } of studies) {
    // Upsert study
    const { data: upserted, error: studyErr } = await db
      .from("studies")
      .upsert(study, { onConflict: "source,source_id,extraction_version" })
      .select("id")
      .single();

    if (studyErr) {
      console.error(`  ✗ [${study.source_id}] ${study.title.slice(0, 60)}…`);
      console.error(`    ${studyErr.message}`);
      errors++;
      continue;
    }

    if (!upserted) {
      console.log(`  ~ [${study.source_id}] already exists, skipped`);
      skipped++;
      continue;
    }

    const studyId = upserted.id;
    inserted++;
    console.log(`  ✓ [${study.source_id}] ${study.title.slice(0, 60)}…`);

    // Link to peptides via study_peptides
    for (const pSlug of peptide_slugs) {
      const { data: peptide } = await db
        .from("peptides")
        .select("id")
        .eq("slug", pSlug)
        .single();

      if (!peptide) {
        console.warn(`    ⚠ peptide not found: ${pSlug}`);
        continue;
      }

      const { error: linkErr } = await db
        .from("study_peptides")
        .upsert({ study_id: studyId, peptide_id: peptide.id }, { onConflict: "study_id,peptide_id" });

      if (linkErr) {
        console.warn(`    ⚠ peptide link failed (${pSlug}): ${linkErr.message}`);
      }
    }
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped, ${errors} errors.`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
