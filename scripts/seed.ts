/**
 * Seeds the database with canonical peptides and indications.
 * Uses the Supabase admin client — no DATABASE_URL/psql required.
 * Run: npm run db:seed
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, key);

const peptides = [
  { slug: "bpc-157", name: "BPC-157", aliases: ["Pentadecapeptide BPC 157", "PL 14736", "Body Protection Compound"], sequence: "GEPPPGKPADDAGLV", cas_number: "137525-51-0", category: "research", mechanism: "Stable gastric pentadecapeptide; angiogenesis, NO-pathway, tendon/ligament repair", indications_tags: ["tendinopathy", "IBD", "wound healing", "ischemia"], legal_status: { FDA: "not approved", WADA: "prohibited S0 2022+" } },
  { slug: "tb-500", name: "TB-500 (Thymosin Beta-4)", aliases: ["Tβ4", "Thymosin β4 fragment"], sequence: "LKKTETQ", cas_number: "77591-33-4", category: "research", mechanism: "Actin-sequestering peptide; promotes cell migration, angiogenesis, wound healing", indications_tags: ["wound healing", "cardiac repair", "neuroprotection"], legal_status: { WADA: "prohibited S2" } },
  { slug: "ghk-cu", name: "GHK-Cu", aliases: ["Copper Tripeptide-1", "Prezatide copper acetate"], sequence: "GHK", cas_number: "89030-95-5", category: "research", mechanism: "Copper-binding tripeptide; remodels extracellular matrix, modulates gene expression", indications_tags: ["skin aging", "wound healing", "hair growth"], legal_status: { FDA: "cosmetic OTC" } },
  { slug: "semaglutide", name: "Semaglutide", aliases: ["Ozempic", "Wegovy", "Rybelsus"], cas_number: "910463-68-2", category: "therapeutic", mechanism: "GLP-1 receptor agonist", indications_tags: ["type 2 diabetes", "obesity", "cardiovascular"], legal_status: { FDA: "approved", EMA: "approved" } },
  { slug: "tirzepatide", name: "Tirzepatide", aliases: ["Mounjaro", "Zepbound"], cas_number: "2023788-19-2", category: "therapeutic", mechanism: "Dual GIP/GLP-1 receptor agonist", indications_tags: ["type 2 diabetes", "obesity", "sleep apnea"], legal_status: { FDA: "approved", EMA: "approved" } },
  { slug: "retatrutide", name: "Retatrutide", aliases: ["LY3437943"], category: "research", mechanism: "Triple agonist (GLP-1, GIP, glucagon) in Phase III", indications_tags: ["obesity", "diabetes", "MASH"], legal_status: { FDA: "investigational" } },
  { slug: "cjc-1295", name: "CJC-1295", aliases: ["CJC-1295 DAC", "Modified GRF(1-29)"], sequence: "YADAIFTNSYRKVLGQLSARKLLQDILSR", cas_number: "863288-34-0", category: "research", mechanism: "Long-acting GHRH analog; stimulates pituitary GH release", indications_tags: ["GH deficiency", "body composition"], legal_status: { WADA: "prohibited S2" } },
  { slug: "ipamorelin", name: "Ipamorelin", aliases: [], sequence: "Aib-His-D-2-Nal-D-Phe-Lys-NH2", cas_number: "170851-70-4", category: "research", mechanism: "Selective GH secretagogue (ghrelin receptor agonist)", indications_tags: ["GH release", "post-op ileus"], legal_status: { WADA: "prohibited S2" } },
  { slug: "hexarelin", name: "Hexarelin", aliases: ["HEX"], sequence: "His-D-2-methyl-Trp-Ala-Trp-D-Phe-Lys-NH2", cas_number: "140703-51-1", category: "research", mechanism: "GH secretagogue; cardioprotective activity", indications_tags: ["GH deficiency", "cardiac"], legal_status: { WADA: "prohibited S2" } },
  { slug: "melanotan-ii", name: "Melanotan II", aliases: ["MT-II", "MTII"], sequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2", cas_number: "121062-08-6", category: "research", mechanism: "Non-selective melanocortin receptor agonist", indications_tags: ["erectile dysfunction", "skin pigmentation", "appetite"], legal_status: { FDA: "not approved" } },
  { slug: "pt-141", name: "PT-141 (Bremelanotide)", aliases: ["Vyleesi"], sequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH", cas_number: "189691-06-3", category: "therapeutic", mechanism: "MC4R agonist", indications_tags: ["HSDD", "erectile dysfunction"], legal_status: { FDA: "approved 2019" } },
  { slug: "thymosin-alpha-1", name: "Thymosin Alpha-1", aliases: ["Tα1", "Zadaxin"], sequence: "SDAAVDTSSEITTKDLKEKKEVVEEAEN", cas_number: "62304-98-7", category: "both", mechanism: "Immunomodulator; T-cell maturation", indications_tags: ["chronic hepatitis B", "immune dysfunction", "cancer adjuvant"], legal_status: { FDA: "not approved", EMA: "approved several countries" } },
  { slug: "epithalon", name: "Epithalon", aliases: ["Epitalon", "Epithalamin"], sequence: "AEDG", cas_number: "307297-39-8", category: "research", mechanism: "Telomerase activator, pineal modulator", indications_tags: ["aging", "sleep", "circadian"], legal_status: {} },
  { slug: "dsip", name: "DSIP", aliases: ["Delta Sleep-Inducing Peptide"], sequence: "WAGGDASGE", cas_number: "62568-57-4", category: "research", mechanism: "Neuropeptide; sleep and stress modulation", indications_tags: ["insomnia", "withdrawal"], legal_status: {} },
  { slug: "selank", name: "Selank", aliases: ["TP-7"], sequence: "TKPRPGP", cas_number: "129954-34-3", category: "research", mechanism: "Synthetic analog of tuftsin; anxiolytic, nootropic", indications_tags: ["anxiety", "cognition"], legal_status: { Russia: "approved" } },
  { slug: "semax", name: "Semax", aliases: [], sequence: "MEHFPGP", cas_number: "80714-61-0", category: "research", mechanism: "ACTH(4-10) analog; nootropic, neuroprotective", indications_tags: ["stroke", "cognition", "ADHD"], legal_status: { Russia: "approved" } },
  { slug: "mots-c", name: "MOTS-c", aliases: [], sequence: "MRWQEMGYIFYPRKLR", cas_number: "1627580-64-6", category: "research", mechanism: "Mitochondrial-derived peptide; metabolic regulation", indications_tags: ["insulin resistance", "obesity", "aging"], legal_status: {} },
  { slug: "ss-31", name: "SS-31 (Elamipretide)", aliases: ["Bendavia", "MTP-131"], sequence: "D-Arg-dmt-Lys-Phe-NH2", cas_number: "736992-21-5", category: "research", mechanism: "Mitochondrial-targeted cardiolipin peptide", indications_tags: ["mitochondrial disease", "heart failure", "dry AMD"], legal_status: { FDA: "investigational" } },
  { slug: "kpv", name: "KPV", aliases: ["α-MSH(11-13)"], sequence: "KPV", cas_number: "67727-97-3", category: "research", mechanism: "Anti-inflammatory tripeptide derived from α-MSH", indications_tags: ["IBD", "skin inflammation"], legal_status: {} },
  { slug: "liraglutide", name: "Liraglutide", aliases: ["Victoza", "Saxenda"], cas_number: "204656-20-2", category: "therapeutic", mechanism: "GLP-1 receptor agonist", indications_tags: ["type 2 diabetes", "obesity"], legal_status: { FDA: "approved", EMA: "approved" } },
  { slug: "aod-9604", name: "AOD-9604", aliases: ["hGH fragment 176-191"], sequence: "YLRIVQCRSVEGSCGF", cas_number: "221231-10-3", category: "research", mechanism: "Lipolytic hGH fragment", indications_tags: ["obesity", "cartilage repair"], legal_status: { FDA: "not approved" } },
  { slug: "n-acetyl-selank", name: "N-Acetyl Selank", aliases: [], sequence: "Ac-TKPRPGP", category: "research", mechanism: "Acetylated Selank analog", indications_tags: ["anxiety", "cognition"], legal_status: {} },
  { slug: "humanin", name: "Humanin", aliases: ["HN"], sequence: "MAPRGFSCLLLLTSEIDLPVKRRA", category: "research", mechanism: "Mitochondrial-encoded cytoprotective peptide", indications_tags: ["Alzheimer", "diabetes", "cardiac"], legal_status: {} },
  { slug: "glutathione", name: "Glutathione (peptide form)", aliases: ["GSH"], sequence: "ECG", cas_number: "70-18-8", category: "research", mechanism: "Tripeptide antioxidant", indications_tags: ["oxidative stress", "detox"], legal_status: { FDA: "supplement/Rx IV" } },
  { slug: "dihexa", name: "Dihexa", aliases: ["N-hexanoic-Tyr-Ile-(6) aminohexanoic amide", "PNB-0408"], category: "research", mechanism: "HGF/c-Met potentiator; synaptogenic", indications_tags: ["Alzheimer", "cognition"], legal_status: {} },
  { slug: "cagrilintide", name: "Cagrilintide", aliases: ["NN9838"], category: "research", mechanism: "Long-acting amylin analog", indications_tags: ["obesity"], legal_status: { FDA: "investigational" } },
  { slug: "survodutide", name: "Survodutide", aliases: ["BI 456906"], category: "research", mechanism: "GLP-1/glucagon dual agonist", indications_tags: ["obesity", "MASH"], legal_status: { FDA: "investigational" } },
  { slug: "gonadorelin", name: "Gonadorelin", aliases: ["GnRH", "LHRH"], sequence: "pGlu-His-Trp-Ser-Tyr-Gly-Leu-Arg-Pro-Gly-NH2", cas_number: "33515-09-2", category: "therapeutic", mechanism: "Hypothalamic GnRH; stimulates LH/FSH", indications_tags: ["hypogonadism", "diagnostic"], legal_status: { FDA: "approved" } },
  { slug: "tesamorelin", name: "Tesamorelin", aliases: ["Egrifta"], cas_number: "218949-48-5", category: "therapeutic", mechanism: "GHRH analog", indications_tags: ["HIV-lipodystrophy", "visceral fat"], legal_status: { FDA: "approved" } },
  { slug: "larazotide", name: "Larazotide acetate", aliases: ["AT-1001"], cas_number: "258818-34-7", category: "research", mechanism: "Tight-junction regulator (zonulin antagonist)", indications_tags: ["celiac", "IBD"], legal_status: { FDA: "investigational" } },
];

const indications = [
  { slug: "tendinopathy", name: "Tendinopathy", mesh_id: "D052256" },
  { slug: "ibd", name: "Inflammatory Bowel Disease", mesh_id: "D015212" },
  { slug: "wound-healing", name: "Wound Healing", mesh_id: "D014945" },
  { slug: "obesity", name: "Obesity", mesh_id: "D009765" },
  { slug: "type-2-diabetes", name: "Type 2 Diabetes Mellitus", mesh_id: "D003924" },
  { slug: "gh-deficiency", name: "Growth Hormone Deficiency", mesh_id: "D046686" },
  { slug: "cognition", name: "Cognition", mesh_id: "D003071" },
  { slug: "anxiety", name: "Anxiety Disorders", mesh_id: "D001008" },
  { slug: "erectile-dysfunction", name: "Erectile Dysfunction", mesh_id: "D007172" },
  { slug: "sleep", name: "Sleep", mesh_id: "D012890" },
  { slug: "cardiac-repair", name: "Cardiac Regeneration", mesh_id: "D059747" },
  { slug: "neuroprotection", name: "Neuroprotection", mesh_id: "D000067390" },
  { slug: "mash", name: "Metabolic Dysfunction-Associated Steatohepatitis", mesh_id: "D005234" },
  { slug: "hsdd", name: "Hypoactive Sexual Desire Disorder", mesh_id: "D020018" },
  { slug: "mitochondrial-disease", name: "Mitochondrial Diseases", mesh_id: "D028361" },
];

async function main() {
  console.log("Seeding peptides…");
  const { error: pepErr } = await db.from("peptides").upsert(peptides, { onConflict: "slug" });
  if (pepErr) { console.error("Peptides error:", pepErr.message); process.exit(1); }
  console.log(`  ✓ ${peptides.length} peptides upserted`);

  console.log("Seeding indications…");
  const { error: indErr } = await db.from("indications").upsert(indications, { onConflict: "slug" });
  if (indErr) { console.error("Indications error:", indErr.message); process.exit(1); }
  console.log(`  ✓ ${indications.length} indications upserted`);

  console.log("Done.");
}

main();
