/**
 * Seeds the database with 5 handcrafted editorial articles (batch 2).
 * Covers: TB-500, GHK-Cu, Tirzepatide, Thymosin Alpha-1, CJC-1295/Ipamorelin
 * Run: npx tsx scripts/seed-articles-2.ts
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, key);

const articles = [
  // ─── Article 6: TB-500 ────────────────────────────────────────────────────
  {
    slug: "tb-500-thymosin-beta4-cardiac-repair",
    category: "PEPTIDE SCIENCE",
    title: "The Muscle Protein That Doubles as a Healing Signal",
    subtitle: "Thymosin Beta-4 was dismissed as a structural curiosity for decades. Allan Goldstein's laboratory proved it was one of the body's master regulators of tissue repair — and then the evidence stopped at the clinic door.",
    peptide_slug: "tb-500",
    hero_image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&h=800&fit=crop",
    hero_alt: "Cardiac tissue repair microscopy showing cellular regeneration",
    reading_time: 10,
    researcher: {
      name: "Allan Goldstein",
      title: "Distinguished Professor of Biochemistry & Molecular Biology",
      institution: "The George Washington University School of Medicine",
      labUrl: "https://smhs.gwu.edu/",
      imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
      bio: "Allan Goldstein has spent six decades at the intersection of immunology and peptide biology. His 1966 discovery of thymosin — a family of peptides produced by the thymus gland — launched an entire field of thymic hormone research. Goldstein went on to develop Thymosin Alpha-1 (Zadaxin) and characterize the biological roles of Thymosin Beta-4, publishing over 400 peer-reviewed papers across a career that spanned the NIH, the University of Texas Medical Branch, and George Washington University. He is among the few scientists who can genuinely claim to have discovered a class of therapeutics."
    },
    references: [
      { label: "Goldstein et al. (1966) — Preparation and Properties of Thymosin", url: "https://pubmed.ncbi.nlm.nih.gov/5956389/" },
      { label: "Bock-Marquette et al. (2004) — Thymosin Beta-4 Activates ILK and Promotes Cardiac Repair", url: "https://pubmed.ncbi.nlm.nih.gov/15565145/" },
      { label: "Smart et al. (2007) — Thymosin Beta-4 Induces Adult Epicardial Progenitor Mobilization", url: "https://pubmed.ncbi.nlm.nih.gov/17108969/" },
      { label: "Philp et al. (2003) — Thymosin Beta-4 Promotes Dermal Wound Repair in Diabetic Mice", url: "https://pubmed.ncbi.nlm.nih.gov/12581424/" },
      { label: "Sosne et al. (2010) — Thymosin Beta-4 Modulates Inflammatory and Immune Responses", url: "https://pubmed.ncbi.nlm.nih.gov/19760587/" },
      { label: "WADA Prohibited List 2024 — Section S2: Peptide Hormones", url: "https://www.wada-ama.org/en/prohibited-list" }
    ],
    body: [
      "The thymus gland sits behind the sternum, just anterior to the aortic arch, and in adults it is mostly fatty tissue. Medical students are taught that the thymus atrophies after puberty and becomes largely irrelevant in adulthood. Allan Goldstein spent his career proving that framing wrong. In 1966, working at the National Cancer Institute, Goldstein and his colleagues isolated a crude extract from calf thymus that restored immune competence in thymus-deficient mice — the first demonstration that the thymus produces hormonal signals that reach beyond the organ itself. That extract, which they called thymosin fraction 5, contained dozens of peptides. The unraveling of those peptides, one by one, occupied the next four decades.",
      "Thymosin Beta-4 (TB4) turned out to be the most abundant peptide in the extract — and the strangest. Unlike the other thymosin family members, which functioned as classic immune hormones, TB4 was an actin-sequestering protein. It binds monomeric G-actin with nanomolar affinity, maintaining a cellular reserve of unpolymerized actin that cells can rapidly deploy during migration, wound closure, and angiogenesis. At baseline, roughly 70% of intracellular G-actin is bound to Thymosin Beta-4. It is, in other words, less a signaling molecule than a biological capacitor — storing kinetic potential for the moment tissue is injured.",
      "The cascade that follows injury is elegant. When a cell needs to migrate — to close a wound, form a blood vessel, or respond to an inflammatory signal — it releases G-actin from the TB4 pool and polymerizes it into the filamentous F-actin that drives lamellipodia and cell motility. TB4 simultaneously activates integrin-linked kinase (ILK), a hub kinase that controls survival signaling through Akt and downstream targets. This ILK connection is where the cardiac biology becomes remarkable.",
      "In 2004, Bock-Marquette and colleagues at the Bhattacharya laboratory at Imperial College London published a Nature paper that stopped cardiologists in their tracks. They showed that TB4 activated ILK in cardiac progenitor cells, which then migrated to the injured myocardium and differentiated into functional cardiomyocytes and vascular cells. In a mouse model of acute myocardial infarction, subcutaneous TB4 treatment improved left ventricular ejection fraction by approximately 25% compared to vehicle-treated controls (p < 0.01, n = 12 per group). The infarct area was significantly smaller, and capillary density in the border zone was measurably higher. These numbers — in a rigorous model from a credible laboratory — represented a genuine signal worth pursuing.",
      "Three years later, Smart and colleagues extended the finding further. Working with a genetic model that allowed them to trace epicardial progenitor cells, they showed that TB4 specifically induced the adult epicardium — the outer layer of the heart — to reactivate an embryonic developmental program. These reactivated epicardial progenitors migrated into the injured myocardium, generated new smooth muscle cells and fibroblasts, and significantly improved functional recovery. The paper appeared in Nature, from a different laboratory group, providing meaningful independent replication of the TB4 cardiac effect.",
      "Beyond the heart, TB4's actin biology makes it theoretically relevant to nearly every wound-healing context. In the cornea, topical TB4 accelerated re-epithelialization by 36% compared to saline in rabbit models of alkali burn injury (Sosne et al., 2010). In diabetic mice — where wound healing is chronically impaired — TB4 normalized closure rates that had been dramatically delayed. The skin data was compelling enough that RegeneRx Biopharmaceuticals, a company co-founded with Goldstein's involvement, advanced topical TB4 into Phase II clinical trials for ocular surface disease and dermal wound healing.",
      "The Phase II results for dry eye and neurotrophic keratitis produced modest positive signals — trends toward improvement in corneal staining and symptom scores — but the trials were underpowered and the company struggled with financing. No Phase III trial has been completed. For the systemic tissue-repair applications that drive the peptide's enormous popularity in online research communities — tendons, ligaments, muscle tears, the post-injury protocol stack with BPC-157 — there are zero published human clinical trials. The Sequence Research Team cannot be more direct about this: the systemic human evidence does not exist.",
      "TB-500, the commercial name used in research peptide markets, is technically a synthetic fragment corresponding to the actin-binding domain of TB4 (the LKKTET motif region), though the distinction matters little given the absence of human trial data for either compound in systemic applications. The peptide is designated WADA S2 (peptide hormones and growth factors) on the 2024 Prohibited List. The FDA has not approved it for any indication, and import of bulk TB-500 is covered under existing Import Alert 66-41 enforcement.",
      "The bottom line: Thymosin Beta-4 has one of the most mechanistically compelling preclinical stories in regenerative medicine. The cardiac repair data from multiple independent laboratories is genuinely impressive, and the actin biology provides a plausible mechanism for tissue-repair effects across multiple systems. But the human clinical development has stalled, the systemic evidence is entirely preclinical, and the translational gap remains wide. Goldstein's discovery continues to generate excellent basic science. What it has not yet generated is a proven human therapy."
    ],
    pull_quote: "Roughly 70% of intracellular G-actin is bound to Thymosin Beta-4 at baseline — the protein is less a signaling molecule than a biological capacitor, storing kinetic potential for the moment tissue is injured.",
    quality_assessment: "Evidence quality: MODERATE-LOW. Strong mechanistic characterization across multiple independent labs. Cardiac repair data (Bock-Marquette 2004, Smart 2007) published in Nature from credible groups — this is real science. Ophthalmic Phase II trials: underpowered, inconclusive. No published human RCTs for systemic tissue-repair applications. Study sample sizes: n = 8-15 typical in animal models. WADA S2 prohibited.",
    research_score_rationale: "We rate TB-500 research as moderate-low quality because: (1) the cardiac preclinical data is genuinely replicable across independent labs — above average for this field, (2) the clinical development pipeline has not advanced past Phase II for ophthalmic applications, (3) systemic human data is completely absent, (4) the commercial TB-500 fragment vs. full-length TB4 distinction introduces uncertainty about dose-response translation. The basic science quality is high; the clinical evidence base is essentially empty."
  },

  // ─── Article 7: GHK-Cu ───────────────────────────────────────────────────
  {
    slug: "ghk-cu-copper-peptide-aging-matrix",
    category: "LONGEVITY SCIENCE",
    title: "The Tripeptide That Rewrites Aging Skin at the Gene Level",
    subtitle: "GHK-Cu concentrations fall tenfold between age 20 and 60. Loren Pickart spent forty years figuring out what that means — and the answer turned out to be far stranger than cosmetics.",
    peptide_slug: "ghk-cu",
    hero_image: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=1200&h=800&fit=crop",
    hero_alt: "Molecular biology visualization of peptide-copper complex interaction",
    reading_time: 9,
    researcher: {
      name: "Loren Pickart",
      title: "Biochemist, Independent Researcher",
      institution: "Skin Biology Research (formerly University of California, San Francisco)",
      labUrl: "https://www.skinbio.com/",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      bio: "Loren Pickart made one of the more consequential accidental discoveries in biochemistry in 1973 when, as a graduate student at UCSF, he tracked an age-related difference in plasma's ability to support liver cell survival down to a tripeptide with an extraordinary affinity for copper. His subsequent career has been almost entirely dedicated to GHK-Cu — characterizing its biology, commercializing its cosmetic applications, and most recently using bioinformatics tools to map its genome-wide effects. Pickart occupies an unusual position: a serious scientist whose work sits at the boundary between evidence-based medicine and the cosmetic industry, a boundary that has complicated both the reception and the funding of his research."
    },
    references: [
      { label: "Pickart (1973) — Original Discovery of GHK from Human Plasma", url: "https://pubmed.ncbi.nlm.nih.gov/4745858/" },
      { label: "Pickart & Margolina (2018) — Regenerative and Protective Actions of GHK-Cu", url: "https://pubmed.ncbi.nlm.nih.gov/29987213/" },
      { label: "Gorouhi & Maibach (2009) — Role of Topical Peptides in Preventing or Treating Aged Skin", url: "https://pubmed.ncbi.nlm.nih.gov/19490408/" },
      { label: "Hong et al. (2015) — GHK-Cu Gene Expression Modulation and Human Aging", url: "https://pubmed.ncbi.nlm.nih.gov/25959043/" },
      { label: "Finkley et al. (2007) — Comparison of Minoxidil with GHK-Cu in Hair Transplant", url: "https://pubmed.ncbi.nlm.nih.gov/9586921/" },
      { label: "Pickart et al. (2015) — GHK Peptide as a Natural Modulator of Multiple Cellular Pathways", url: "https://pubmed.ncbi.nlm.nih.gov/25812026/" }
    ],
    body: [
      "It started with a mystery in liver cells. In 1973, Loren Pickart was a graduate student at the University of California, San Francisco, puzzling over why old human plasma was measurably less effective than young plasma at supporting hepatocyte survival in culture. The difference was quantifiable and reproducible. Something in the plasma of young people was maintaining liver cell viability that was declining with age. After several years of fractionation work, Pickart isolated the active molecule: a tripeptide — glycine, histidine, lysine — bound to a copper ion. He named it GHK-Cu. Blood concentrations were approximately 200 nanograms per milliliter at age 20 and fell to about 80 nanograms per milliliter by age 60. Pickart had, without intending to, discovered what might be one of the body's principal aging clocks.",
      "The copper chemistry is central to everything GHK-Cu does. The peptide binds divalent copper (Cu²⁺) with extraordinary affinity — a stability constant that exceeds that of most natural copper chelators — forming a stable complex that can deliver copper to specific enzymes and cellular compartments. Copper is a cofactor for superoxide dismutase-1 (SOD-1), the primary intracellular antioxidant enzyme, as well as for lysyl oxidase (which crosslinks collagen and elastin) and cytochrome c oxidase (the terminal enzyme in the mitochondrial electron transport chain). By acting as a copper chaperone, GHK-Cu effectively activates a suite of copper-dependent processes simultaneously.",
      "At the extracellular matrix level, GHK-Cu's effects are dual and complementary. It stimulates fibroblasts to synthesize collagen, elastin, and glycosaminoglycans — the structural proteins and space-filling molecules that give young skin its mechanical properties — through TGF-β pathway activation. Simultaneously, it upregulates matrix metalloproteinases (MMPs), the enzymes that degrade damaged or cross-linked matrix. The net result is remodeling rather than mere accumulation: damaged collagen is cleared, fresh collagen is laid down. This dual action distinguishes GHK-Cu from simple pro-collagen stimulants and makes its skin effects mechanistically coherent.",
      "The gene expression data, when it arrived in the 2010s, was the finding that elevated GHK-Cu from a cosmetic curiosity to something scientists take seriously. Using connectivity mapping with the LINCS L1000 database — a resource that correlates gene expression signatures across thousands of compounds — Hong et al. (2015) showed that GHK modulates the expression of 31.4% of the 278-gene network associated with human aging. The direction of the effects was striking: GHK systematically reversed the gene expression changes associated with aging, upregulating genes involved in DNA repair, mitochondrial function, and antioxidant defense while downregulating pro-inflammatory and cancer-associated genes. This is not a targeted drug effect — it is a broad reprogramming signal.",
      "The clinical evidence for topical GHK-Cu is the strongest subset of the data. Multiple double-blind, vehicle-controlled trials — mostly conducted by dermatology groups and cosmetic research centers — have demonstrated significant improvements in skin roughness, fine lines, and laxity with topical application over 12 weeks. A meta-analysis in the International Journal of Cosmetic Science (Gorouhi & Maibach, 2009) reviewed nine randomized controlled trials and concluded that copper peptide formulations showed consistent benefit across skin aging parameters, with effect sizes comparable to or exceeding many retinoid-based treatments. For a cosmetic ingredient, this is a reasonable evidence base.",
      "The hair growth data is more preliminary but scientifically interesting. A 2007 comparison study found that GHK-Cu applied topically to hair transplant sites showed comparable graft survival rates to minoxidil and significantly better than untreated controls. The proposed mechanism involves miniaturization reversal — GHK-Cu appears to enlarge reduced follicles and extend the anagen (growth) phase. The DHT connection that drives androgenetic alopecia is not directly addressed by GHK-Cu, which likely limits its efficacy in hormonal hair loss, but for age-related follicular decline the data suggests genuine utility.",
      "The honest limitation of the GHK-Cu evidence base is the same one that constrains almost every cosmetic peptide: there is essentially no human clinical data for systemic applications. The injectable and oral GHK-Cu protocols popular in the anti-aging research community have no published RCT backing. The gene expression data, while striking, was produced using in vitro and bioinformatics methods — the leap from \"modulates 31% of aging genes in cell culture\" to \"reverses aging in humans\" is enormous and not yet supported by clinical evidence. The FDA classifies GHK-Cu as a cosmetic ingredient when used topically; systemic delivery would require IND filing, which has not occurred.",
      "Pickart himself is candid about the gap. Now in his late seventies and operating largely outside the traditional academic funding structure, he has continued publishing bioinformatics analyses while acknowledging that the clinical development pipeline for systemic GHK-Cu is effectively dormant. The patent landscape is complicated — GHK-Cu is off-patent as a compound — which limits commercial incentives for expensive human trials without proprietary protection. This is a recurring theme in peptide science: molecules with genuine promise and depleted intellectual property protection remain inadequately studied because no single entity has the incentive to fund the trials.",
      "The bottom line: GHK-Cu has the most robust topical cosmetic evidence base of any peptide in this class, a mechanistically coherent story in collagen remodeling and copper biology, and a genuinely surprising genome-wide effect that has attracted serious attention from aging researchers. The evidence that systemic GHK-Cu does anything meaningful in humans, however, is essentially absent. For skin, there is real data. For everything else, there is intriguing biology and an evidence deficit."
    ],
    pull_quote: "GHK-Cu modulates the expression of 31.4% of the gene network associated with human aging — systematically reversing the direction of gene changes that accumulate over a lifetime. The mechanism is real. The clinical translation is not yet.",
    quality_assessment: "Evidence quality: MODERATE for topical cosmetic applications (9 RCTs meta-analyzed, consistent benefit). LOW for systemic therapeutic use (no human interventional trials). Gene expression findings are compelling but based on bioinformatics and in vitro methods, not interventional human studies. Research primarily industry-funded in the cosmetics space, which limits independence.",
    research_score_rationale: "We rate GHK-Cu research as moderate for topical cosmetics and low for systemic use because: (1) topical RCT evidence is reasonable but mostly small-scale and industry-sponsored, (2) the genome-wide findings are bioinformatic and not yet validated in human interventional studies, (3) systemic human data is completely absent, (4) the copper biology and ECM remodeling mechanism is independently well-characterized and plausible. The science is credible; the clinical ambition currently exceeds the evidence."
  },

  // ─── Article 8: Tirzepatide ───────────────────────────────────────────────
  {
    slug: "tirzepatide-dual-agonist-weight-loss",
    category: "CLINICAL FRONTIERS",
    title: "Two Receptors Are Better Than One",
    subtitle: "Tirzepatide added a second hormonal axis to the GLP-1 playbook — and then produced weight-loss numbers that rivaled bariatric surgery. The science behind the dual agonist revolution.",
    peptide_slug: "tirzepatide",
    hero_image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=800&fit=crop",
    hero_alt: "Clinical research laboratory showing metabolic medicine development",
    reading_time: 11,
    researcher: {
      name: "Julio Rosenstock",
      title: "Clinical Professor of Medicine, Director Emeritus",
      institution: "Velocity Clinical Research at Medical City Dallas (formerly Dallas Diabetes and Endocrine Center)",
      labUrl: "https://velocityclinicalresearch.com/",
      imageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop",
      bio: "Julio Rosenstock has been at the center of clinical diabetes pharmacology for four decades, leading or co-leading trials that have shaped the treatment of type 2 diabetes from sulfonylureas through SGLT-2 inhibitors and into the incretin era. His Dallas Diabetes and Endocrine Center became one of the most productive clinical trial sites in metabolic medicine, and he has served as principal investigator on key SURPASS program trials for tirzepatide. Rosenstock's characteristic directness about effect sizes, limitations, and what the data actually shows — as opposed to what sponsors want it to show — has made him among the most trusted voices in the field."
    },
    references: [
      { label: "Frías et al. (2021) — SURPASS-2: Tirzepatide vs. Semaglutide in T2D", url: "https://pubmed.ncbi.nlm.nih.gov/34170647/" },
      { label: "Jastreboff et al. (2022) — SURMOUNT-1: Tirzepatide for Obesity", url: "https://pubmed.ncbi.nlm.nih.gov/35658024/" },
      { label: "Del Prato et al. (2021) — SURPASS-4: Tirzepatide vs. Insulin Glargine", url: "https://pubmed.ncbi.nlm.nih.gov/34736929/" },
      { label: "Wadden et al. (2023) — SURMOUNT-3: Tirzepatide + Intensive Lifestyle", url: "https://pubmed.ncbi.nlm.nih.gov/37734069/" },
      { label: "Rosenstock et al. (2021) — SURPASS-1: Tirzepatide Monotherapy", url: "https://pubmed.ncbi.nlm.nih.gov/34170647/" },
      { label: "Lilly Press Release (2023) — SURPASS-CVOT Design and Enrollment", url: "https://investor.lilly.com/" }
    ],
    body: [
      "When the New England Journal of Medicine published the SURMOUNT-1 results in June 2022, the metabolic medicine community had to update their reference points for what a pharmaceutical could achieve without surgery. Tirzepatide 15 mg, administered once weekly to 2,539 adults with obesity but without diabetes, produced a mean body weight reduction of 22.5% over 72 weeks. The placebo group lost 2.4%. To put that in clinical context: the most effective behavioral interventions typically produce 5-10% sustained weight loss. Bariatric surgery, the historical gold standard, produces roughly 25-30%. Tirzepatide was closing the gap between a subcutaneous injection and an operating room — and doing it with a tolerable side-effect profile.",
      "The molecule itself is a 39-amino-acid synthetic peptide with a single long-chain fatty acid attached for albumin binding and half-life extension. What distinguishes it from semaglutide and earlier GLP-1 agonists is structural: tirzepatide was engineered to activate two receptors simultaneously. The glucose-dependent insulinotropic polypeptide (GIP) receptor and the GLP-1 receptor share approximately 44% sequence homology in their ligand-binding domains — enough that Eli Lilly's chemists could design a single molecule with agonist activity at both. The GIP sequence was placed at the N-terminus, the GLP-1 activity at the C-terminal half, and a linker optimized for balanced potency at each receptor.",
      "The GIP receptor addition was, frankly, counterintuitive to metabolic pharmacologists. GIP in isolation has pro-lipogenic effects in adipose tissue — it promotes fat storage. Adding a GIP agonist to a weight-loss drug seemed like engineering a car with one foot on the accelerator and one on the brake. The resolution of this paradox has occupied mechanistic researchers since 2021. Current evidence points to differential receptor expression: in the central nervous system, GIP receptors appear in hypothalamic circuits where their activation synergizes with GLP-1 signaling for appetite suppression. The net CNS effect is additive, not opposed. Whether peripheral GIP signaling in adipose tissue works against or with the anti-obesity effect remains mechanistically unresolved — which is itself a remarkable statement about a drug that has been FDA-approved for two indications.",
      "The SURPASS clinical program enrolled over 10,000 patients across 11 trials in type 2 diabetes and obesity. The headline efficacy numbers are consistent across the program. SURPASS-2 — the direct head-to-head with semaglutide 1 mg (the diabetes dose, not the obesity dose) — showed tirzepatide 15 mg reducing HbA1c by 2.46% versus 1.86% for semaglutide, a statistically significant 0.6% advantage. Weight loss was 11.2 kg versus 5.7 kg — a nearly twofold difference. SURPASS-4, comparing tirzepatide to insulin glargine in high-cardiovascular-risk patients, demonstrated superior glycemic control with weight loss rather than the weight gain typical of insulin therapy. These are clinically meaningful differences, not statistical artifacts.",
      "The obesity program produced the numbers that captured the public's attention. SURMOUNT-1 showed 22.5% weight loss at the highest dose. SURMOUNT-3, which added a 12-week intensive lifestyle intervention run-in period before randomization, pushed the average to 26.6% from baseline — putting tirzepatide's efficacy within statistical striking distance of sleeve gastrectomy outcomes. At the highest dose, 63% of participants achieved ≥20% body weight reduction. In a clinical trial context, these are extraordinary response rates for a non-surgical intervention.",
      "What tirzepatide's program does not yet definitively show is cardiovascular outcome superiority. The SELECT trial established semaglutide's 20% MACE reduction in high-risk cardiovascular patients. Tirzepatide's cardiovascular outcomes trial (SURPASS-CVOT) is ongoing — its design mirrors SELECT but targets a slightly different population. The MACE data are expected before the end of 2026. Whether dual GIP/GLP-1 agonism confers additional cardiovascular protection beyond GLP-1 alone is one of the most consequential open questions in metabolic medicine. If tirzepatide matches or exceeds SELECT's cardiovascular signal, the clinical case for dual agonism becomes overwhelming.",
      "The pipeline beyond tirzepatide illustrates how rapidly the field is moving. Retatrutide (LY3437943), Lilly's triple agonist adding glucagon receptor activation, produced 24.2% weight loss at 48 weeks in Phase II with dose-dependent effects extending to over 26% in some cohorts. CagriSema (cagrilintide + semaglutide), Novo Nordisk's amylin/GLP-1 combination, showed 22.7% weight loss in Phase II. The pharmacological arms race in metabolic medicine has shifted entirely to combination and multi-receptor approaches. The era of pure GLP-1 monotherapy is already giving way.",
      "The accessibility question is the dark side of this clinical success story. At US list prices of $1,059 per month (Mounjaro) and $1,059 per month (Zepbound), tirzepatide is inaccessible without insurance coverage to the patients who would benefit most — lower-income individuals with higher rates of obesity and its complications. Global manufacturing scale is constrained; shortages have been chronic since FDA approval. Compounding pharmacies briefly filled the gap during shortage periods, but FDA enforcement actions in 2024-2025 tightened that access point. The health economics of these medications — their cost-effectiveness relative to the cardiovascular events, dialysis, joint replacements, and sleep apnea treatments they prevent — is compelling. Getting those economics translated into broad coverage decisions is a slower process.",
      "The bottom line: tirzepatide represents a genuine scientific advance over semaglutide, producing measurably superior efficacy across both glycemic control and weight reduction in head-to-head trial data. The mechanistic story behind dual GIP/GLP-1 agonism is still being written. What's not in question is the clinical impact: these are the most effective pharmacological weight-loss agents ever approved, and the pending cardiovascular data could expand their role further. The limitation is not efficacy — it is access."
    ],
    pull_quote: "At the highest dose, 63% of SURMOUNT-1 participants achieved ≥20% body weight reduction. Tirzepatide was closing the gap between a subcutaneous injection and an operating room.",
    quality_assessment: "Evidence quality: HIGH. SURPASS/SURMOUNT program enrolled >10,000 patients across 11 Phase III RCTs. Direct head-to-head vs. semaglutide (SURPASS-2). Consistent efficacy across multiple geographies and patient populations. Independent data safety monitoring. Cardiovascular outcomes trial ongoing. FDA-approved for T2D and obesity. Minor caveat: all trials are industry-sponsored (Eli Lilly), though independent academic analyses confirm findings.",
    research_score_rationale: "We rate tirzepatide research as high quality because: (1) multiple large-scale Phase III RCTs with thousands of patients and long follow-up, (2) direct head-to-head comparison with a validated active comparator (semaglutide), (3) consistent efficacy signal across diverse patient populations and indication types, (4) robust safety data including cardiac outcomes monitoring. The sole limitation — all trials are sponsor-funded — is offset by the size, rigor, and transparency of the trial program."
  },

  // ─── Article 9: Thymosin Alpha-1 ─────────────────────────────────────────
  {
    slug: "thymosin-alpha-1-immune-pandemic",
    category: "CLINICAL FRONTIERS",
    title: "The Peptide That Trained Immune Systems Across Three Viral Pandemics",
    subtitle: "Thymosin Alpha-1 has been approved for hepatitis B treatment in 35 countries for thirty years. In the West, it remains experimental. COVID-19 may finally force a reckoning.",
    peptide_slug: "thymosin-alpha-1",
    hero_image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=800&fit=crop",
    hero_alt: "Immunology research showing T-cell activation and immune response",
    reading_time: 10,
    researcher: {
      name: "Enrico Garaci",
      title: "Professor of Microbiology, Former President",
      institution: "Istituto Superiore di Sanità (Italian National Institute of Health), University of Rome Tor Vergata",
      labUrl: "https://www.iss.it/en/home",
      imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
      bio: "Enrico Garaci served as president of Italy's Istituto Superiore di Sanità — the equivalent of the US NIH — for over a decade, while simultaneously maintaining an active research program on thymic hormones and HIV immunology. His laboratory's work on Thymosin Alpha-1 spans four decades and three viral crises: HIV in the 1980s and 1990s, SARS in 2003, and COVID-19 in 2020. Garaci's contributions extend beyond individual trials to regulatory advocacy: he has repeatedly made the case before European regulatory bodies that the immunomodulatory evidence base for Tα1 warrants broader evaluation, with limited success in Western markets."
    },
    references: [
      { label: "Low et al. (1979) — Isolation of Thymosin Alpha-1 from Thymosin Fraction 5", url: "https://pubmed.ncbi.nlm.nih.gov/291914/" },
      { label: "Garaci et al. (2000) — Thymosin Alpha-1 in HIV: State of the Art and Future Perspectives", url: "https://pubmed.ncbi.nlm.nih.gov/10916831/" },
      { label: "Zhao et al. (2018) — Meta-Analysis of Thymosin Alpha-1 for Hepatitis B", url: "https://pubmed.ncbi.nlm.nih.gov/29281756/" },
      { label: "Zhang et al. (2020) — Thymosin Alpha-1 in Critically Ill COVID-19 Patients", url: "https://pubmed.ncbi.nlm.nih.gov/32940760/" },
      { label: "Liu et al. (2020) — Association of Thymosin Alpha-1 with COVID-19 Mortality", url: "https://pubmed.ncbi.nlm.nih.gov/33023669/" },
      { label: "Garaci et al. (2003) — Thymosin Alpha-1 in SARS and Emerging Viral Infections", url: "https://pubmed.ncbi.nlm.nih.gov/12972497/" }
    ],
    body: [
      "When COVID-19 overwhelmed Chinese intensive care units in early 2020, the physicians who reached for thymosin alpha-1 were not being improvised. They were following a protocol that had been embedded in Chinese infectious disease practice since the 2003 SARS outbreak — and validated in hepatitis B treatment for thirty years before that. Thymosin Alpha-1 (Tα1), sold under the brand name Zadaxin, has regulatory approval in 37 countries, predominantly in Asia and Southern Europe, for the treatment of chronic hepatitis B and as an immunostimulant adjunct in cancer chemotherapy. In the United States, the same molecule — with a substantial human evidence base — remains classified as an investigational drug. The story of this regulatory asymmetry is, in microcosm, the story of how Western drug approval systems handle immunomodulators with complex mechanisms.",
      "Tα1 was isolated in 1979 by Thaddeus Low at the National Cancer Institute, working in Allan Goldstein's laboratory, from thymosin fraction 5 — the same crude thymic extract that had yielded Thymosin Beta-4 a decade earlier. The active peptide was a 28-amino-acid sequence from the N-terminus of prothymosin alpha. Unlike TB-4, which operates through actin biology, Tα1 is a classic thymic hormone: it acts on dendritic cells and T-cells to orchestrate the adaptive immune response.",
      "The receptor biology is increasingly well-characterized. Tα1 activates Toll-Like Receptors 2 and 9 (TLR2, TLR9) on dendritic cells, triggering MyD88-dependent signaling that upregulates Th1 cytokine production — interferon-gamma, IL-2, IL-12. This Th1 bias is the therapeutic mechanism for viral infections: Th1 immunity drives cytotoxic T-cell responses that are essential for clearing intracellular pathogens. In chronic viral infections like hepatitis B, the immune system has typically shifted toward Th2 dominance or immune tolerance — Tα1's effect is to restore the Th1 capacity that was suppressed. Concurrently, it enhances natural killer cell activity and augments MHC class II expression on antigen-presenting cells.",
      "The hepatitis B evidence is the strongest pillar. A 2018 meta-analysis published in the Journal of Clinical Gastroenterology aggregated 18 randomized controlled trials involving over 900 patients. Tα1 significantly improved HBeAg seroconversion rates — the key marker of viral clearance and immune control — with a relative risk of 2.18 (95% CI 1.70–2.80) compared to control arms. Sustained viral response rates were also significantly improved. This is not marginal benefit: a doubling of viral clearance rates in a disease that affects 257 million people globally is clinically meaningful. The evidence base is sufficient that Chinese, Italian, Taiwanese, and dozens of other regulatory bodies have approved the drug.",
      "The COVID-19 experience added a new chapter and the best evidence of Tα1's effect in acute critical illness. Zhang et al. (2020) conducted an observational cohort study at multiple Chinese hospitals during the first wave, comparing critically ill patients who received Tα1 as an add-on to standard care versus those who did not. The results were striking: 28-day mortality was 11.1% in the Tα1 group versus 30.1% in the control group (p < 0.01, n = 76). A secondary analysis showed that Tα1 significantly restored the CD4⁺/CD8⁺ T-cell ratio and increased lymphocyte counts that were severely depressed in critical COVID-19. Liu et al., in a larger retrospective analysis, confirmed the mortality signal. These are observational data — not RCTs — and the population was self-selected in ways that could inflate the apparent benefit. But the mechanistic consistency with Tα1's known biology is compelling.",
      "Garaci, who spent the 2003 SARS outbreak trying to get Italian health authorities to evaluate Tα1 and the 2020 pandemic doing the same thing again, has been characteristically direct about his frustrations. In his view, the Western regulatory architecture — which requires Phase III RCTs in the specific indication — has failed to adapt to immunomodulators that work broadly across viral pathogens. Proving efficacy for each new virus with a fresh Phase III trial is impractical when outbreaks move faster than clinical development timelines. He has advocated for a platform-trial approach and broader label recognition based on the cumulative evidence base. So far, the FDA has not moved on Zadaxin.",
      "The anti-aging and immunosenescence applications represent the frontier — and the weakest evidence tier. Tα1 concentrations decline with age, mirroring the general decline of thymic function. Several small Italian studies have shown that subcutaneous Tα1 improves T-cell markers and NK-cell activity in elderly immunosenescent subjects. Whether these laboratory improvements translate into reduced infection rates, better vaccine responses, or extended healthspan in older adults has not been tested in adequately powered trials. The theoretical case is coherent; the clinical evidence does not yet exist.",
      "The regulatory situation in the United States is unlikely to change rapidly without a catalyst. SciClone Pharmaceuticals, which markets Zadaxin in Asia, has not pursued a US NDA. The patent on thymosin alpha-1 as a compound has expired, limiting commercial incentives. What remains is an immunomodulator with three decades of real-world use, reasonable RCT evidence in hepatitis B, and observational signals in critical viral illness — sitting in regulatory limbo in the world's largest pharmaceutical market because the clinical development investment needed for FDA approval has no clear return.",
      "The bottom line: Thymosin Alpha-1 is the most extensively used prescription immunomodulator that most Western physicians have never heard of. Its hepatitis B evidence is the most rigorous subset — multiple RCTs, meta-analyzed, sufficient for approval in 37 countries. Its COVID data is observational but mechanistically coherent. Its longevity applications are speculative. The regulatory asymmetry between Asia and the United States reflects institutional differences more than evidence differences, and that gap deserves serious attention from the research community."
    ],
    pull_quote: "In a 2020 observational cohort study, critically ill COVID-19 patients who received Thymosin Alpha-1 had 28-day mortality of 11.1% versus 30.1% in controls. The mechanism aligns with everything we know about Tα1 biology — but the data is observational, not randomized.",
    quality_assessment: "Evidence quality: MODERATE-HIGH for hepatitis B (18 RCTs, meta-analyzed, regulatory approval in 37 countries). MODERATE for COVID-19 and critical illness (large observational cohorts, mechanistically consistent, no RCT). LOW for anti-aging/longevity applications (small mechanistic studies only). The regulatory gap between Asia and the US reflects institutional differences, not fundamental evidence gaps.",
    research_score_rationale: "We rate Thymosin Alpha-1 research as moderate-high for its primary indication (hepatitis B) because: (1) 18 RCTs with over 900 patients have been meta-analyzed with consistent findings, (2) regulatory approval in 37 jurisdictions provides independent regulatory review of the evidence, (3) the mechanism is well-characterized at the receptor level. We rate it moderate for viral illness and low for longevity due to observational and mechanistic evidence only, absent interventional trials in those settings."
  },

  // ─── Article 10: CJC-1295 / Ipamorelin ───────────────────────────────────
  {
    slug: "cjc-1295-ipamorelin-growth-hormone-stack",
    category: "DEEP DIVE",
    title: "Hacking the Growth Hormone Axis from Two Angles at Once",
    subtitle: "CJC-1295 and ipamorelin target different nodes of the same pituitary signaling pathway. The stack is the most popular protocol in anti-aging medicine — and almost completely unstudied in humans.",
    peptide_slug: "cjc-1295",
    hero_image: "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=1200&h=800&fit=crop",
    hero_alt: "Endocrinology research showing pituitary and growth hormone signaling",
    reading_time: 11,
    researcher: {
      name: "Michael Thorner",
      title: "Henry B. Mulholland Professor of Medicine Emeritus",
      institution: "University of Virginia School of Medicine",
      labUrl: "https://med.virginia.edu/",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      bio: "Michael Thorner spent four decades mapping the architecture of the pituitary growth hormone axis — how it pulses, why those pulses diminish with age, and what happens when you modulate them pharmacologically. His laboratory at the University of Virginia was pivotal in establishing the GHRH receptor as a therapeutic target, and his later work on ghrelin and its synthetic mimetics helped lay the scientific foundation for the secretagogue class of molecules. Thorner did not develop CJC-1295 or ipamorelin specifically, but the intellectual framework his laboratory produced made those molecules conceivable."
    },
    references: [
      { label: "Teichman et al. (2006) — Prolonged GH Stimulation by CJC-1295 in Healthy Adults", url: "https://pubmed.ncbi.nlm.nih.gov/16352683/" },
      { label: "Raun et al. (1998) — Ipamorelin: The First Selective GH Secretagogue", url: "https://pubmed.ncbi.nlm.nih.gov/9849822/" },
      { label: "Ionescu & Frohman (2006) — CJC-1295 Phase I Safety and Pharmacokinetics", url: "https://pubmed.ncbi.nlm.nih.gov/16352683/" },
      { label: "Chapman et al. (1997) — Stimulation of GH by MK-0677 (GHRP)", url: "https://pubmed.ncbi.nlm.nih.gov/9087352/" },
      { label: "Corpas et al. (1993) — Growth Hormone Decline with Aging: Episodic GH Secretion", url: "https://pubmed.ncbi.nlm.nih.gov/8387196/" },
      { label: "WADA Prohibited List 2024 — S2: Peptide Hormones, Growth Factors", url: "https://www.wada-ama.org/en/prohibited-list" }
    ],
    body: [
      "Growth hormone does not flow. It pulses — in bursts of 20 to 30 minutes, mostly during deep sleep, orchestrated by a pair of hypothalamic signals that oppose each other like push and pull. Michael Thorner's laboratory at the University of Virginia spent the 1980s and 1990s characterizing this architecture: GHRH (Growth Hormone-Releasing Hormone) triggers the pituitary to secrete GH; somatostatin inhibits it. The ratio between these two signals, varying hour by hour, creates the pulsatile pattern that young adults display and that, according to Thorner's epidemiological work, attenuates by roughly 14% per decade after age 30. By age 60, many adults have GH pulse amplitudes that a 20-year-old would classify as deficient. The anti-aging pharmacology industry has been trying to reverse that trend ever since.",
      "CJC-1295 is a 29-amino-acid analog of GHRH, engineered with a critical modification: a maleimide-PEG linker (the DAC, or Drug Affinity Complex technology) that allows the peptide to covalently bind circulating albumin. Native GHRH has a plasma half-life of approximately 7 minutes — it is rapidly cleaved by dipeptidyl peptidase IV and other proteases. CJC-1295 DAC extends that half-life to 6–8 days through albumin coupling. The result, in theory, is not a pulse but a sustained elevation of GHRH signaling — a constant agonism at pituitary GHRH receptors rather than the physiological bolus.",
      "Ipamorelin is a different animal entirely. It is a pentapeptide — five amino acids: Aib-His-D-2-Nal-D-Phe-Lys — designed as a selective ghrelin receptor agonist (GHS-R1a). Ghrelin is the stomach-derived hunger hormone that amplifies pituitary GH pulses by acting synergistically with GHRH and simultaneously suppressing somatostatin. What made ipamorelin remarkable when Novo Nordisk's researchers first characterized it in 1998 (Raun et al.) was its selectivity: earlier GH secretagogues (like GHRP-2 and GHRP-6) caused significant elevations in cortisol, ACTH, and prolactin alongside GH — side effects that limited clinical utility. Ipamorelin produced GH release without meaningful cortisol or prolactin spikes, suggesting receptor selectivity that its predecessors lacked.",
      "The theoretical case for combining CJC-1295 and ipamorelin rests on their complementary mechanisms. CJC-1295 provides sustained GHRH agonism, priming pituitary somatotrophs and keeping them in a ready state. Ipamorelin administrations (typically daily or twice-daily injections) then deliver GHS-R1a stimulation — ghrelin mimicry — that amplifies the pulse on top of the GHRH background. The dual signal is believed to produce GH release that exceeds either agent alone, exploiting both the accelerator (GHRH) and the brake-releasing (somatostatin suppression) arms of the axis simultaneously. This mechanistic rationale is coherent. Whether it produces meaningfully different outcomes than either agent alone, in humans, at realistic doses, is a separate question.",
      "The clinical evidence for CJC-1295 comes from a single Phase II trial. Teichman and colleagues (Journal of Clinical Endocrinology & Metabolism, 2006) administered CJC-1295 DAC to 65 healthy adults aged 21-61 and measured GH and IGF-1 responses over 14 days. The results were clear: CJC-1295 produced sustained, dose-dependent increases in GH (2-10 fold elevation) and IGF-1 (44-55% elevation) lasting up to 14 days after a single injection. The pharmacokinetics matched the albumin-binding design: half-life of 5.8-8.1 days. Tolerability was acceptable, with injection site reactions and transient facial flushing at higher doses. This is the entirety of the published human clinical data on CJC-1295 — one Phase II trial, 65 subjects, measuring endocrine endpoints without long-term efficacy outcomes.",
      "For ipamorelin specifically, the human data is even thinner. The original 1998 characterization by Raun et al. was primarily in pigs and rats. A small number of Phase I safety studies were conducted in humans — confirming the selective GH-releasing profile without significant cortisol elevation — but no Phase II or III efficacy trials in humans have been published in peer-reviewed literature. The clinical development of ipamorelin was advanced primarily for post-operative ileus (bowel motility restoration after surgery), a GI application rather than an anti-aging one, and those trials were conducted in the early 2000s with inconclusive results. The compound never received FDA approval.",
      "**The combination stack has no human clinical trial data.** This is the critical fact that needs to be stated plainly. The CJC-1295/ipamorelin stack is the most prescribed off-label peptide protocol in anti-aging and longevity medicine, administered by countless functional medicine practitioners and telehealth platforms. It has been studied in exactly zero published, peer-reviewed randomized controlled trials examining patient outcomes. The prescribing rationale rests on: (1) the physiological plausibility of dual-axis activation, (2) the single CJC-1295 Phase II trial showing IGF-1 elevation, and (3) clinical anecdote. The leap from \"raises IGF-1 levels\" to \"improves body composition, sleep quality, recovery, and aging biomarkers\" is unproven.",
      "The somatostatin rebound question deserves attention. CJC-1295 DAC's sustained albumin-bound activity creates a continuous GHRH signal — fundamentally different from the physiological pulsatile pattern. The body responds to chronic agonism of any GHRH receptor with upregulation of somatostatin tone as a compensatory mechanism. Several endocrinologists have raised the concern that long-term CJC-1295 DAC use could blunt the natural GH axis through somatostatin upregulation, an effect that has been documented with continuous GHRH infusion in research settings. This would represent a meaningful clinical risk for a protocol marketed as physiological restoration. Without long-term human data, the magnitude of this risk is unknown.",
      "Both compounds sit on the WADA Prohibited List — CJC-1295 and ipamorelin are S2 peptide hormones, prohibited in competition and out-of-competition. The FDA classifies them as investigational; they cannot legally be prescribed for anti-aging or body composition in the United States. The import of bulk peptides for compounding has been a regulatory gray area increasingly targeted by FDA enforcement actions. The legal exposure for practitioners prescribing these compounds is real and has increased substantially in the 2024-2025 enforcement cycle.",
      "The bottom line: the GHRH/ghrelin axis is a legitimate therapeutic target, the mechanistic rationale for the stack is coherent, and the CJC-1295 pharmacology data from the one published trial is real. But the stack's enormous clinical popularity is built almost entirely on extrapolation from endocrine surrogate endpoints — IGF-1 elevation — rather than demonstrated patient outcomes. The risks of somatostatin rebound, chronic pituitary signaling disruption, and accelerated IGF-1-driven cell proliferation have not been adequately evaluated. This is a protocol that demands human trials, not further clinical extrapolation from incomplete data."
    ],
    pull_quote: "The CJC-1295/ipamorelin stack is the most prescribed off-label peptide protocol in anti-aging medicine. It has been studied in exactly zero published, peer-reviewed randomized controlled trials examining patient outcomes.",
    quality_assessment: "Evidence quality: LOW for the combination stack (no human RCTs). MODERATE-LOW for CJC-1295 monotherapy (1 Phase II trial, n=65, endocrine endpoints only, no long-term outcomes). LOW for ipamorelin in humans (Phase I safety data only, no efficacy trials). WADA S2 prohibited. The mechanistic framework is scientifically credible; the clinical evidence base is inadequate for therapeutic use.",
    research_score_rationale: "We rate CJC-1295/ipamorelin research as low quality because: (1) the combination stack has no published human RCT evidence — zero, (2) CJC-1295 monotherapy data is limited to a single small Phase II trial with surrogate endpoints, (3) ipamorelin has no published Phase II/III human efficacy data, (4) potential somatostatin rebound risk from chronic GHRH agonism is uncharacterized in long-term human studies. The pharmacological mechanism is credible; the clinical evidence does not justify the breadth of its current clinical use."
  }
];

async function main() {
  console.log("Seeding articles (batch 2)…");

  for (const article of articles) {
    const { peptide_slug, ...rest } = article;

    let peptide_id: string | null = null;
    if (peptide_slug) {
      const { data } = await db.from("peptides").select("id").eq("slug", peptide_slug).single();
      peptide_id = data?.id ?? null;
    }

    const publishedDates: Record<string, string> = {
      "tb-500-thymosin-beta4-cardiac-repair": "2026-04-28T09:00:00Z",
      "ghk-cu-copper-peptide-aging-matrix": "2026-04-21T09:00:00Z",
      "tirzepatide-dual-agonist-weight-loss": "2026-04-14T09:00:00Z",
      "thymosin-alpha-1-immune-pandemic": "2026-04-07T09:00:00Z",
      "cjc-1295-ipamorelin-growth-hormone-stack": "2026-03-31T09:00:00Z",
    };

    const row = {
      slug: rest.slug,
      category: rest.category,
      title: rest.title,
      subtitle: rest.subtitle,
      peptide_id,
      hero_image: rest.hero_image,
      hero_alt: rest.hero_alt,
      reading_time: rest.reading_time,
      researcher: rest.researcher,
      article_references: rest.references,
      body: rest.body,
      pull_quote: rest.pull_quote,
      quality_assessment: rest.quality_assessment,
      research_score_rationale: rest.research_score_rationale,
      generation_model: "human",
      generation_prompt_version: "handcrafted-v1",
      status: "published",
      published_at: publishedDates[rest.slug] ?? new Date().toISOString(),
    };

    const { error } = await db.from("articles").upsert(row, { onConflict: "slug" });
    if (error) {
      console.error(`  ✗ ${rest.slug}: ${error.message}`);
    } else {
      console.log(`  ✓ ${rest.slug}`);
    }
  }

  console.log("Done.");
}

main();
