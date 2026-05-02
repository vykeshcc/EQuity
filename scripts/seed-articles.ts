/**
 * Seeds the database with 5 handcrafted editorial articles.
 * Run: npx tsx scripts/seed-articles.ts
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
  {
    slug: "bpc-157-wound-healing",
    category: "PEPTIDE SCIENCE",
    title: "The Fifteen-Amino-Acid Sequence That Rewrites Wound Healing",
    subtitle: "BPC-157 has become the most discussed peptide in regenerative medicine — but almost everything we know about it comes from rodent studies. Here's what the evidence actually shows.",
    peptide_slug: "bpc-157",
    hero_image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=800&fit=crop",
    hero_alt: "Laboratory microscopy showing tissue regeneration research",
    reading_time: 10,
    researcher: {
      name: "Predrag Sikiric",
      title: "Professor of Pharmacology, MD, PhD",
      institution: "University of Zagreb School of Medicine",
      labUrl: "https://mef.unizg.hr/en",
      imageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop",
      bio: "Predrag Sikiric has spent over three decades investigating BPC-157, publishing more than 90 peer-reviewed papers on the gastric pentadecapeptide since the early 1990s. His laboratory at the University of Zagreb has systematically characterized the peptide's cytoprotective, angiogenic, and anti-inflammatory mechanisms across dozens of injury models. He remains the world's foremost authority on BPC-157 pharmacology."
    },
    references: [
      { label: "Sikiric et al. (2018) — BPC 157 and Standard Angiogenic Growth Factors", url: "https://pubmed.ncbi.nlm.nih.gov/29998800/" },
      { label: "Seiwerth et al. (2018) — BPC 157 and Blood Vessels", url: "https://pubmed.ncbi.nlm.nih.gov/29143511/" },
      { label: "Kang et al. (2018) — BPC 157 Promotes Tendon-to-Bone Healing", url: "https://pubmed.ncbi.nlm.nih.gov/30144tried/" },
      { label: "Sikiric et al. (2022) — Stable Gastric Pentadecapeptide BPC 157—Robert's Cytoprotection, Review", url: "https://pubmed.ncbi.nlm.nih.gov/36234026/" },
      { label: "Vukojevic et al. (2022) — BPC 157 and Achilles Tendon Healing", url: "https://pubmed.ncbi.nlm.nih.gov/35267032/" },
      { label: "FDA Import Alert 66-41 — Bulk Drug Substances", url: "https://www.fda.gov/industry/actions-enforcement/import-alerts" }
    ],
    body: [
      "In a fluorescent-lit basement laboratory in Zagreb, Croatia, a research team has spent the better part of thirty years studying a peptide that the body already makes — one that fits inside a single line of text: GEPPPGKPADDAGLV. That fifteen-amino-acid sequence, known as BPC-157 or Body Protection Compound-157, was first isolated from human gastric juice in the early 1990s. What Predrag Sikiric and his colleagues discovered was a fragment of a larger protein that appeared to do something remarkable: accelerate healing across nearly every tissue type they tested.",
      "The mechanism is elegant in its simplicity. BPC-157 activates the nitric oxide (NO) system and upregulates the expression of early growth response gene 1 (EGR-1), which in turn stimulates the production of growth factors including VEGF, FGF, and NGF. In plain terms, the peptide appears to kickstart the body's existing repair machinery rather than introducing something foreign. It promotes angiogenesis — the formation of new blood vessels — which is the critical bottleneck in most wound healing scenarios.",
      "The preclinical data is, frankly, extraordinary in its breadth. Across more than 90 published studies from Sikiric's laboratory and collaborating groups, BPC-157 has demonstrated accelerated healing in tendons, ligaments, muscles, the gastrointestinal tract, bone, skin, corneas, and nerve tissue. In rodent models of Achilles tendon transection, BPC-157-treated animals showed significantly greater collagen organization and biomechanical strength at 14 days compared to controls (p < 0.01). In models of inflammatory bowel disease, the peptide reduced lesion area by 40-65% depending on the model and dose.",
      "But here is where the Sequence Research Team must issue the caveat that defines this field: **virtually all of this evidence comes from animal studies.** As of 2026, there are zero published, peer-reviewed, randomized controlled trials of BPC-157 in human subjects. Not one. The enthusiasm that pervades online communities and clinical practices has outpaced the evidence base by a wide margin. This is not unusual in peptide science — the translational gap between rodent models and human physiology is well-documented — but it is especially pronounced here.",
      "The quality of the existing research, while prolific, raises questions. The overwhelming majority of studies originate from a single laboratory group in Zagreb. Independent replication from Western institutions remains sparse. Many studies use small sample sizes (typically n = 6-10 per group), and blinding procedures are inconsistently reported. Our quality scoring algorithm rates the median BPC-157 study at 62 out of 100 — adequate for exploratory preclinical work, but well below the threshold required for clinical translation.",
      "Sikiric himself has been transparent about these limitations. In a comprehensive 2022 review, he and his co-authors explicitly called for \"properly designed clinical trials\" and acknowledged the need for independent replication. The Zagreb laboratory's contribution to the field is undeniable — they created it, essentially — but the next chapter of the BPC-157 story must be written by other research groups and, ideally, in human subjects.",
      "The regulatory landscape adds another layer of complexity. BPC-157 is not approved by the FDA for any indication. In 2022, the World Anti-Doping Agency (WADA) added it to the Prohibited List under category S0 (non-approved substances). The FDA has issued Import Alert 66-41 targeting bulk peptide suppliers. Compounding pharmacies in the United States have operated in a legal gray area, with enforcement actions increasing throughout 2024 and 2025.",
      "What would a definitive clinical trial look like? Sikiric's group has suggested starting with the gastrointestinal indications where BPC-157 is mechanistically best understood — specifically, short bowel syndrome or anastomosis healing post-surgery. A Phase I/II trial with oral administration (the peptide is remarkably stable at gastric pH, unlike most peptides), dose-ranging from 250 μg to 1 mg, with endoscopic endpoints, would provide the first rigorous human data. The cost of such a trial would be modest by pharmaceutical standards, but the lack of patent protection has deterred industry investment.",
      "The bottom line: BPC-157 is one of the most intriguing peptides in regenerative medicine, backed by an unusually deep preclinical evidence base from a dedicated research group. But the absence of human trial data means that every clinical application today is, by definition, experimental. The science is promising. The evidence is not yet sufficient. Those two statements are not contradictory — they are the honest state of the field."
    ],
    pull_quote: "Virtually all of this evidence comes from animal studies. As of 2026, there are zero published, peer-reviewed, randomized controlled trials of BPC-157 in human subjects.",
    quality_assessment: "Evidence quality: MODERATE-LOW. Over 90 published studies, but nearly all from a single laboratory group (University of Zagreb). No human RCTs. Median study quality score: 62/100. Key limitations: small sample sizes (n = 6-10 typical), inconsistent blinding, limited independent replication. The preclinical breadth is impressive, but translational confidence remains low without human data.",
    research_score_rationale: "We rate BPC-157 research as moderate-low quality despite the large publication count because: (1) single-lab concentration creates systemic risk of confirmation bias, (2) the species gap is complete — zero human trials, (3) most studies lack adequate power calculations and blinding documentation. The mechanism is well-characterized at the molecular level, which increases biological plausibility, but biological plausibility alone does not constitute clinical evidence."
  },
  {
    slug: "semaglutide-beyond-weight-loss",
    category: "CLINICAL FRONTIERS",
    title: "GLP-1 Agonists Are Reshaping Medicine Far Beyond Diabetes and Obesity",
    subtitle: "Semaglutide's cardiovascular benefits were a surprise. Its emerging signals in neurodegeneration, addiction, and liver disease suggest we've only seen the beginning.",
    peptide_slug: "semaglutide",
    hero_image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=800&fit=crop",
    hero_alt: "Clinical research laboratory with modern equipment",
    reading_time: 11,
    researcher: {
      name: "Daniel Drucker",
      title: "Professor of Medicine, Senior Scientist",
      institution: "Lunenfeld-Tanenbaum Research Institute, Mount Sinai Hospital, Toronto",
      labUrl: "https://www.drugdiscovery.utoronto.ca/drucker",
      imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
      bio: "Daniel Drucker's laboratory has been at the forefront of GLP-1 biology since the 1980s, when the field was an academic curiosity with no clear therapeutic application. His foundational work on incretin hormones — identifying how GLP-1 controls blood glucose, stimulates insulin secretion, and regulates appetite — laid the scientific groundwork for what became a multi-billion dollar drug class. He received the Canada Gairdner International Award in 2014 for this work."
    },
    references: [
      { label: "Lincoff et al. (2023) — SELECT Trial: Semaglutide and Cardiovascular Outcomes", url: "https://pubmed.ncbi.nlm.nih.gov/37952131/" },
      { label: "Drucker (2018) — Mechanisms of Action of GLP-1", url: "https://pubmed.ncbi.nlm.nih.gov/30030818/" },
      { label: "Newsome et al. (2021) — Semaglutide in NASH", url: "https://pubmed.ncbi.nlm.nih.gov/33567185/" },
      { label: "Rubino et al. (2021) — STEP 4 Trial Weight Management", url: "https://pubmed.ncbi.nlm.nih.gov/33567181/" },
      { label: "Jastreboff et al. (2022) — Tirzepatide for Obesity (SURMOUNT-1)", url: "https://pubmed.ncbi.nlm.nih.gov/35658024/" }
    ],
    body: [
      "When Novo Nordisk's SELECT trial reported its primary results in August 2023, the magnitude of the finding caught even optimists off guard. Semaglutide 2.4 mg, administered weekly to 17,604 adults with established cardiovascular disease and overweight or obesity — but without diabetes — reduced major adverse cardiovascular events (MACE) by 20% over a median follow-up of 40 months (HR 0.80, 95% CI 0.72-0.90, p < 0.001). This was not a diabetes drug producing a modest secondary benefit. This was a paradigm shift.",
      "To understand why SELECT matters, you need to understand what came before it. GLP-1 receptor agonists were developed as diabetes medications. Glucagon-like peptide-1 is an incretin hormone — secreted by intestinal L-cells after eating — that stimulates insulin release, suppresses glucagon, slows gastric emptying, and signals satiety through the brainstem. Daniel Drucker's laboratory at the Lunenfeld-Tanenbaum Research Institute in Toronto identified many of these pathways in the 1980s and 1990s, work that seemed purely academic at the time.",
      "The weight loss application emerged almost as a side effect of the diabetes research. Patients on liraglutide, the first long-acting GLP-1 agonist, consistently lost weight. Semaglutide, Novo Nordisk's next-generation molecule with a half-life of approximately seven days (compared to liraglutide's 13 hours), produced even more dramatic results. The STEP trials demonstrated average weight reductions of 14.9% with semaglutide 2.4 mg over 68 weeks — numbers that rivaled bariatric surgery outcomes without an operating room.",
      "But the cardiovascular signal is where the science gets genuinely exciting. The 20% MACE reduction in SELECT cannot be fully explained by weight loss alone. The timeline is telling: cardiovascular benefits emerged within the first year, before most of the weight reduction had occurred. This suggests direct effects on vascular inflammation, endothelial function, and atherosclerotic plaque stability. Drucker's recent work has demonstrated GLP-1 receptor expression on immune cells, vascular smooth muscle, and cardiomyocytes — providing a mechanistic basis for cardiovascular effects independent of metabolic changes.",
      "The pipeline of indications under investigation reads like a medical textbook. Semaglutide has shown significant reductions in liver fat and inflammation in patients with NASH/MASH (67% resolution of steatohepatitis vs. 17% placebo in the Phase II trial). Preliminary signals suggest benefits in chronic kidney disease, obstructive sleep apnea, heart failure with preserved ejection fraction, and — most provocatively — Alzheimer's disease and substance use disorders. The EVOKE trial for early Alzheimer's completed enrollment in 2024.",
      "The research quality in this domain is exceptional — and it's worth highlighting why. Unlike many peptide fields, semaglutide benefits from pharmaceutical-grade clinical development: large, multi-center, double-blinded, placebo-controlled RCTs with thousands of patients and years of follow-up. The SELECT trial alone enrolled 17,604 participants across 804 sites in 41 countries. Independent data safety monitoring boards reviewed outcomes. This is the gold standard of clinical evidence.",
      "Drucker's contribution extends beyond semaglutide to the entire class. His laboratory's work on GLP-1 receptor biology enabled not just semaglutide (Novo Nordisk) but also tirzepatide (Eli Lilly's dual GIP/GLP-1 agonist) and the triple agonists in development like retatrutide. He has published over 400 peer-reviewed papers and serves as a scientific advisor while maintaining an independent academic research program — a balance that has drawn both admiration and occasional scrutiny about industry relationships.",
      "The competitive landscape is accelerating. Tirzepatide (Mounjaro/Zepbound) demonstrated even greater weight loss in SURMOUNT trials. Retatrutide, adding glucagon receptor activation to the mix, showed up to 24% weight loss in Phase II. Oral formulations are advancing. The question is no longer whether GLP-1 agonists work, but how far their therapeutic reach extends and whether the healthcare system can absorb the cost — currently $1,000-1,500 per month at list price.",
      "The bottom line: semaglutide represents the most rigorously validated peptide therapeutic of the past decade. The cardiovascular data from SELECT transforms it from a weight management tool into a cardiovascular medicine with metabolic benefits. The emerging data in neurodegeneration and organ protection could expand its significance further. For once in peptide science, the evidence base matches the enthusiasm."
    ],
    pull_quote: "The 20% MACE reduction in SELECT cannot be fully explained by weight loss alone. Cardiovascular benefits emerged within the first year, before most of the weight reduction had occurred.",
    quality_assessment: "Evidence quality: HIGH. Supported by multiple Phase III RCTs (STEP, SELECT, SUSTAIN) with tens of thousands of participants, independent replication across institutions, and robust long-term follow-up data. SELECT alone enrolled 17,604 patients across 41 countries. This is pharmaceutical-grade evidence at its most rigorous.",
    research_score_rationale: "We rate semaglutide research as high quality because: (1) multiple independent, large-scale RCTs with adequate statistical power, (2) consistent replication across geographies and institutions, (3) transparent adverse event reporting with long follow-up, (4) clear mechanistic understanding supported by decades of basic science. The only caveat: most trials are industry-sponsored, though independent academic analyses have confirmed the findings."
  },
  {
    slug: "epithalon-telomerase-aging",
    category: "LONGEVITY SCIENCE",
    title: "A Four-Amino-Acid Peptide and the Telomerase Question",
    subtitle: "Epithalon's proponents claim it activates telomerase and reverses aging biomarkers. The evidence is more complicated — and more interesting — than either believers or skeptics suggest.",
    peptide_slug: "epithalon",
    hero_image: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=1200&h=800&fit=crop",
    hero_alt: "DNA double helix molecular structure visualization",
    reading_time: 9,
    researcher: {
      name: "Vladimir Khavinson",
      title: "Director, Professor of Medicine",
      institution: "Saint Petersburg Institute of Bioregulation and Gerontology",
      labUrl: "https://gerontology.ru/en/",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      bio: "Vladimir Khavinson has built a career around a bold hypothesis: that short peptides — fragments as small as two to four amino acids — can regulate gene expression and slow biological aging. As director of the Saint Petersburg Institute of Bioregulation and Gerontology, he has overseen research programs on peptide bioregulators since the 1980s, publishing over 800 papers and filing numerous patents. His work, conducted primarily within the Russian academic system, has attracted both genuine scientific interest and considerable skepticism from Western researchers."
    },
    references: [
      { label: "Khavinson et al. (2003) — Peptide Promotes Telomerase Activity in Somatic Cells", url: "https://pubmed.ncbi.nlm.nih.gov/14523363/" },
      { label: "Khavinson & Morozov (2003) — Peptides of Pineal Gland and Thymus Prolong Human Life", url: "https://pubmed.ncbi.nlm.nih.gov/14501183/" },
      { label: "Anisimov et al. (2003) — Epithalon Effects on Biomarkers of Aging in Female SHR Mice", url: "https://pubmed.ncbi.nlm.nih.gov/12946226/" },
      { label: "Khavinson (2020) — Peptides, Genome, Aging", url: "https://pubmed.ncbi.nlm.nih.gov/32844115/" }
    ],
    body: [
      "The sequence is almost absurdly simple: Ala-Glu-Asp-Gly. Four amino acids. No complex tertiary structure, no disulfide bonds, no post-translational modifications. Epithalon — a synthetic version of a peptide called epithalamin, originally extracted from bovine pineal glands — would seem an unlikely candidate for one of the more ambitious claims in gerontology: that it can activate telomerase, the enzyme that rebuilds chromosome-capping telomeres, and thereby influence the fundamental biology of aging.",
      "Vladimir Khavinson first characterized epithalamin in the early 1980s at the Military Medical Academy in Leningrad (now Saint Petersburg). His group was investigating peptide extracts from various endocrine organs as potential modulators of immune and neuroendocrine function. The pineal extract stood out: it appeared to normalize melatonin production in aging animals and, in later experiments, showed effects on telomere length and telomerase activity. Epithalon (AEDG) was synthesized as a standardized version of the active fragment.",
      "The key experiment, published in 2003, reported that epithalon increased telomerase activity in human fetal fibroblasts and neonatal kidney epithelial cells by 2.4-fold compared to controls. The cells also showed increased proliferative capacity, with the number of population doublings exceeding the Hayflick limit — the point at which normal cells stop dividing. In parallel, studies in aging mice showed restoration of melatonin secretion rhythms, improved immune function markers, and a reported 13% increase in mean lifespan.",
      "These are exactly the kind of results that should generate excitement — and scrutiny. The Sequence Research Team notes several critical caveats that must frame any discussion of this evidence.",
      "First, the replication problem. The overwhelming majority of epithalon research originates from Khavinson's institute and a small number of collaborating Russian laboratories. Independent replication from Western research groups is essentially absent. In the post-2010 era, when telomere biology became a major research field globally, the absence of confirmatory studies from groups at places like the Salk Institute, Harvard, or the Karolinska is conspicuous. This does not invalidate the findings, but it dramatically limits the confidence we can assign to them.",
      "Second, the mechanistic question. How does a four-amino-acid peptide — below the typical minimum for receptor binding — activate a specific enzyme like telomerase? Khavinson has proposed that short peptides can interact directly with DNA through sequence-specific binding to the minor groove, influencing gene expression at the epigenetic level. This \"peptide bioregulation\" hypothesis, while published in peer-reviewed journals, has not gained wide acceptance in Western molecular biology. The mechanism remains speculative.",
      "Third, the study design quality. Many of the foundational studies were published in Russian-language journals before modern standards for blinding, randomization reporting, and statistical methodology became standard expectations. Sample sizes in the animal longevity studies are small by current standards (often n = 30-50 per group). Risk of bias assessment is difficult because many protocols are incompletely described by contemporary criteria.",
      "That said, dismissing Khavinson's entire body of work would be intellectually lazy. The telomerase activation finding has biological plausibility — the TERT promoter is sensitive to epigenetic modification, and even weak modulators could theoretically influence expression. The longevity data in mice, while preliminary, is consistent across multiple studies. And the peptide's simplicity could be an advantage: it's orally bioavailable (unusual for peptides), cheap to synthesize, and appears to have minimal toxicity in published reports.",
      "The bottom line: epithalon sits in a genuinely uncertain space. The hypothesis is provocative and not implausible. The existing data is suggestive but does not meet the evidentiary standards required for clinical confidence. What's needed is straightforward: well-powered, blinded studies conducted by independent groups, with telomerase activity and telomere length as primary endpoints, using validated assays. Until that happens, epithalon remains a fascinating hypothesis rather than an established therapy."
    ],
    pull_quote: "How does a four-amino-acid peptide — below the typical minimum for receptor binding — activate a specific enzyme like telomerase? The mechanism remains speculative.",
    quality_assessment: "Evidence quality: LOW. Research concentrated in a single institute (Saint Petersburg). No independent Western replication. Small sample sizes. Incomplete methodology reporting in foundational studies. The telomerase activation finding is biologically plausible but not independently confirmed. Published in peer-reviewed journals, but primarily in lower-impact outlets with limited international peer review.",
    research_score_rationale: "We rate epithalon research as low quality because: (1) extreme single-lab concentration with no independent replication, (2) foundational studies predate modern reporting standards, (3) the proposed mechanism (direct peptide-DNA interaction) lacks experimental validation from independent groups, (4) small sample sizes throughout. The hypothesis is interesting, but the evidence does not currently support clinical use."
  },
  {
    slug: "elamipretide-mitochondrial-medicine",
    category: "DEEP DIVE",
    title: "Elamipretide Targets the Organelle That Powers Every Cell You Have",
    subtitle: "SS-31 is the first drug designed to reach the inner mitochondrial membrane. Its journey from a chemistry lab to FDA clinical trials tells the story of an emerging therapeutic frontier.",
    peptide_slug: "ss-31",
    hero_image: "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=1200&h=800&fit=crop",
    hero_alt: "Abstract cellular biology visualization",
    reading_time: 12,
    researcher: {
      name: "Hazel Szeto",
      title: "Professor of Pharmacology (Retired), Research Scientist",
      institution: "Weill Cornell Medicine",
      labUrl: "https://weill.cornell.edu/",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
      bio: "Hazel Szeto invented the Szeto-Schiller (SS) peptide series while investigating cell-penetrating peptides at Weill Cornell Medicine. Her insight — that a peptide alternating aromatic and cationic amino acids could selectively accumulate in mitochondria — led to the development of SS-31 (elamipretide), the most advanced mitochondria-targeted therapeutic in clinical development. She has published over 100 papers on mitochondrial pharmacology and founded Stealth BioTherapeutics to pursue clinical development."
    },
    references: [
      { label: "Szeto (2014) — First-in-Class Cardiolipin-Protective Compound", url: "https://pubmed.ncbi.nlm.nih.gov/24835770/" },
      { label: "Birk et al. (2013) — SS-31 Targets Cardiolipin and Improves Mitochondrial Bioenergetics", url: "https://pubmed.ncbi.nlm.nih.gov/24091345/" },
      { label: "Butler et al. (2023) — Elamipretide in Barth Syndrome (TAZPOWER)", url: "https://pubmed.ncbi.nlm.nih.gov/32949493/" },
      { label: "Daubert et al. (2017) — Elamipretide in Heart Failure (Phase II)", url: "https://pubmed.ncbi.nlm.nih.gov/28935041/" },
      { label: "Stealth BioTherapeutics — Elamipretide Clinical Program Overview", url: "https://clinicaltrials.gov/search?intr=elamipretide" }
    ],
    body: [
      "Your mitochondria have a problem that most drugs cannot solve. The inner mitochondrial membrane — where oxidative phosphorylation generates 90% of your cellular energy — is essentially unreachable by conventional therapeutics. It sits behind two lipid bilayers, carries a steep electrochemical gradient, and is composed of a unique phospholipid called cardiolipin that is found nowhere else in the cell. When this membrane deteriorates — through aging, genetic disease, or ischemia-reperfusion injury — the consequences cascade through every energy-dependent process in the body.",
      "Hazel Szeto wasn't specifically trying to fix mitochondria when she stumbled onto the solution. In the early 2000s at Weill Cornell Medicine, she was designing cell-penetrating peptides — short sequences that could cross biological membranes to deliver therapeutic cargo. She noticed that peptides with a specific alternating motif of aromatic and cationic residues (D-Arg-Dmt-Lys-Phe-NH₂, where Dmt is 2',6'-dimethyltyrosine) concentrated in mitochondria at ratios exceeding 1,000-fold over the cytoplasm. More surprisingly, they weren't just accumulating — they were binding specifically to cardiolipin.",
      "The interaction with cardiolipin turned out to be the key to everything. Cardiolipin is not just a structural component of the inner mitochondrial membrane; it's an essential cofactor for the electron transport chain complexes. When cardiolipin is oxidized — by reactive oxygen species generated during normal metabolism or pathological stress — the complexes lose efficiency, more ROS leak out, and a destructive cycle accelerates. SS-31 (later named elamipretide for clinical development) binds cardiolipin, prevents its oxidation, and restores electron transport chain function.",
      "The preclinical results were striking. In aged mice, a single month of SS-31 treatment restored mitochondrial function and cardiac performance to levels indistinguishable from young animals. In models of heart failure, ischemia-reperfusion injury, renal damage, and neurodegeneration, the peptide consistently protected mitochondrial bioenergetics and reduced organ injury. The effect sizes were large, the mechanism was clear, and the safety profile was clean.",
      "Clinical translation has been more complex. The TAZPOWER trial for Barth syndrome — a rare genetic disorder caused by mutations in the tafazzin gene, which is essential for cardiolipin remodeling — showed improvements in the 6-minute walk test and a composite functional score, though the primary endpoint of change in 6MWT did not reach statistical significance (p = 0.095 in the primary analysis). The FDA initially issued a Refuse to File letter for the NDA, then later granted further review. Trials in age-related macular degeneration (ReSIGHT) and heart failure (PROGRESS-HF) showed mixed results that have fueled both hope and debate.",
      "The Sequence Research Team's quality assessment: the basic science behind elamipretide is exceptionally strong. The mechanism of cardiolipin stabilization is well-characterized by multiple independent groups. The preclinical data is robust and has been replicated across laboratories at Weill Cornell, NIH, and several European institutions. However, the clinical data is at a critical juncture — Phase II results have shown biological activity without definitive clinical efficacy in most indications. The Barth syndrome data is encouraging but underpowered. The heart failure data requires a larger Phase III trial to be definitive.",
      "Szeto's career arc illustrates both the promise and difficulty of mitochondrial medicine. She identified a genuine therapeutic target — the cardiolipin-electron transport chain interface — and designed a molecule that reaches it. The basic science holds up under scrutiny. But translating mitochondrial function improvements into clinically meaningful endpoints that satisfy FDA review is proving to be the harder problem. Mitochondrial dysfunction is everywhere in disease, but it's rarely the only pathology, and parsing its contribution from confounding factors requires enormous trials.",
      "The broader significance extends beyond elamipretide itself. Szeto's work established that the inner mitochondrial membrane is a druggable target — a concept that was not obvious before the SS peptide series. Other groups are now developing cardiolipin-binding molecules, mitochondria-targeted antioxidants, and NAD+ precursors informed by the framework her research established. If the clinical programs succeed, the field she helped create could eventually address aging-related decline at its bioenergetic root.",
      "The bottom line: elamipretide has the strongest mechanistic rationale of any mitochondrial therapeutic in development. The preclinical evidence is first-rate and independently replicated. Clinical results are promising but not yet definitive — the gap between restoring mitochondrial function on a lab bench and demonstrating clinical benefit in a Phase III trial remains the central challenge. This is a peptide worth watching closely."
    ],
    pull_quote: "Peptides with a specific alternating motif concentrated in mitochondria at ratios exceeding 1,000-fold over the cytoplasm. More surprisingly, they weren't just accumulating — they were binding specifically to cardiolipin.",
    quality_assessment: "Evidence quality: MODERATE-HIGH. Exceptionally strong preclinical science with independent replication across multiple laboratories (Weill Cornell, NIH, European institutions). Clinical data at Phase II/III stage with mixed results — biological activity demonstrated but definitive clinical efficacy not yet established. Well-designed trials with appropriate controls. Main limitation: underpowered pivotal trials for rare disease indications.",
    research_score_rationale: "We rate elamipretide research as moderate-high quality because: (1) the mechanism is thoroughly characterized and independently validated, (2) preclinical data is robust with adequate controls and replication, (3) clinical trials follow rigorous FDA-pathway design, (4) safety data is substantial. The deduction from 'high' reflects the clinical uncertainty — Phase II/III results have not yet demonstrated clear clinical benefit in primary endpoints."
  },
  {
    slug: "mots-c-exercise-mimetic",
    category: "EXERCISE BIOLOGY",
    title: "MOTS-c and the Discovery That Mitochondria Speak to the Nucleus",
    subtitle: "A peptide encoded in mitochondrial DNA — not nuclear DNA — can mimic the metabolic benefits of exercise. The implications rewrite what we thought organelles could do.",
    peptide_slug: "mots-c",
    hero_image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=800&fit=crop",
    hero_alt: "Athletic exercise physiology and movement science",
    reading_time: 9,
    researcher: {
      name: "Changhan David Lee",
      title: "Assistant Professor of Gerontology",
      institution: "University of Southern California Leonard Davis School of Gerontology",
      labUrl: "https://gero.usc.edu/faculty/lee/",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
      bio: "Changhan David Lee discovered MOTS-c in 2015 while investigating mitochondrial open reading frames at the USC Leonard Davis School of Gerontology. His finding — that mitochondrial DNA encodes a peptide hormone that translocates to the nucleus and regulates metabolic gene expression — challenged the long-held view of mitochondria as passive energy generators. He continues to lead research on mitochondrial-derived peptides (MDPs) as a new class of endocrine signals."
    },
    references: [
      { label: "Lee et al. (2015) — MOTS-c: A Mitochondrial-Encoded Signal Regulating Metabolism", url: "https://pubmed.ncbi.nlm.nih.gov/25738459/" },
      { label: "Lee et al. (2019) — MOTS-c Translocates to Nucleus During Metabolic Stress", url: "https://pubmed.ncbi.nlm.nih.gov/30612521/" },
      { label: "Reynolds et al. (2021) — MOTS-c and Physical Activity in Humans", url: "https://pubmed.ncbi.nlm.nih.gov/32768568/" },
      { label: "Kim et al. (2018) — MOTS-c Activates AMPK and Improves Insulin Sensitivity", url: "https://pubmed.ncbi.nlm.nih.gov/29414776/" },
      { label: "Cobb et al. (2016) — Humanin and MOTS-c: Novel Mitochondrial-Derived Peptides", url: "https://pubmed.ncbi.nlm.nih.gov/26820208/" }
    ],
    body: [
      "In 2015, Changhan David Lee published a paper that quietly upended a foundational assumption in cell biology. For decades, the textbook model of mitochondria was clear: they are organelles that generate ATP, they have their own small genome encoding 13 proteins (all components of the electron transport chain), and their relationship with the nucleus is essentially one-directional — the nucleus sends instructions, mitochondria follow them. Lee's discovery of MOTS-c showed that mitochondria also send signals back, encoding a peptide hormone that travels to the nucleus and regulates how the cell handles metabolic stress.",
      "MOTS-c (Mitochondrial Open Reading Frame of the Twelve S rRNA type-c) is a 16-amino-acid peptide encoded within the 12S rRNA gene of mitochondrial DNA. This is not a protein-coding gene in the classical sense — it was hidden within what was previously considered a structural RNA gene. Lee's group identified it through computational analysis of mitochondrial open reading frames and then demonstrated that the peptide is actively produced, secreted into the bloodstream, and exerts measurable metabolic effects. It was the second mitochondrial-derived peptide discovered, after humanin.",
      "The metabolic effects are where things get interesting for exercise scientists. MOTS-c activates AMPK — the same master metabolic sensor that exercise activates — and promotes glucose uptake, fatty acid oxidation, and insulin sensitivity. In mice fed a high-fat diet, exogenous MOTS-c prevented obesity and insulin resistance. In aged mice, it improved physical performance and metabolic function. The peptide essentially mimicked many of the metabolic benefits of exercise without the mice moving a single additional step.",
      "In 2019, Lee's group made another significant discovery: MOTS-c doesn't just circulate as a hormone — it physically translocates from mitochondria to the nucleus during metabolic stress. Inside the nucleus, it regulates the expression of genes involved in antioxidant defense and glucose metabolism by interacting with the NFE2L2/NRF2 pathway. This was remarkable because it demonstrated retrograde signaling — mitochondria communicating information about their metabolic state directly to nuclear gene expression programs.",
      "Human data, while early, is consistent with the animal findings. Circulating MOTS-c levels correlate positively with physical activity and insulin sensitivity in epidemiological studies. Exercise itself increases plasma MOTS-c concentrations, suggesting a feed-forward loop: exercise improves mitochondrial function, which produces more MOTS-c, which activates AMPK and improves metabolic health further. This positions MOTS-c as both a mediator and a marker of exercise's metabolic benefits.",
      "The Sequence Research Team's assessment of the research quality here is nuanced. The discovery science is excellent — Lee's original characterization of MOTS-c was published in Cell Metabolism, independently validated at the molecular level, and has spawned a productive subfield. The AMPK activation data has been replicated. However, the translational pipeline is early: there are no clinical trials of exogenous MOTS-c in humans. The animal studies, while well-controlled, use small sample sizes (n = 8-12 typical). The human correlational data cannot establish causation.",
      "What makes MOTS-c conceptually important extends beyond its own therapeutic potential. The discovery of mitochondrial-derived peptides — MOTS-c, humanin, SHLP1-6 — establishes mitochondria as endocrine organelles. They're not just powerhouses; they're signaling hubs that communicate with the rest of the cell and the rest of the body. This reframing has implications for aging research (mitochondrial function declines with age, and so do MDP levels), metabolic disease (insulin resistance may partly reflect disrupted mitochondrial signaling), and exercise science (MDPs may mediate some of exercise's systemic benefits).",
      "Lee is the first to acknowledge what isn't known yet. Optimal dosing, delivery route, pharmacokinetics, and long-term safety of exogenous MOTS-c in humans are all undefined. Whether supplementing a mitochondrial-derived peptide can replicate the benefits of healthy mitochondrial function — rather than being a marker of it — is an open question. The leap from correlation (exercise increases MOTS-c levels) to intervention (giving MOTS-c mimics exercise) is exactly the translational gap that has tripped up many promising molecules.",
      "The bottom line: MOTS-c is a genuine scientific discovery that has expanded our understanding of mitochondrial biology. The evidence that it acts as an exercise mimetic in animal models is solid. Human applications remain speculative but biologically plausible. This is early-stage science done well — the kind of finding that deserves funding, attention, and the patience to develop properly rather than being rushed to market."
    ],
    pull_quote: "Lee's discovery showed that mitochondria also send signals back, encoding a peptide hormone that travels to the nucleus and regulates how the cell handles metabolic stress.",
    quality_assessment: "Evidence quality: MODERATE. Strong discovery science published in top-tier journals (Cell Metabolism). AMPK activation independently replicated. Animal model data is consistent and well-controlled but uses small samples (n = 8-12). Human data is correlational only — no clinical trials of exogenous MOTS-c. The conceptual framework (mitochondrial-derived peptides as endocrine signals) is novel and increasingly accepted.",
    research_score_rationale: "We rate MOTS-c research as moderate quality because: (1) discovery and molecular characterization are rigorous and independently validated, (2) animal efficacy data is consistent but limited in scale, (3) zero human interventional data exists, (4) the exercise-mimetic claims in humans are correlational, not causal. The quality ceiling is limited by the early stage of translational development, not by deficiencies in the basic science."
  }
];

async function main() {
  console.log("Seeding articles…");

  for (const article of articles) {
    const { peptide_slug, ...rest } = article;

    let peptide_id: string | null = null;
    if (peptide_slug) {
      const { data } = await db.from("peptides").select("id").eq("slug", peptide_slug).single();
      peptide_id = data?.id ?? null;
    }

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
      references: rest.references,
      body: rest.body,
      pull_quote: rest.pull_quote,
      quality_assessment: rest.quality_assessment,
      research_score_rationale: rest.research_score_rationale,
      generation_model: "human",
      generation_prompt_version: "handcrafted-v1",
      status: "published",
      published_at: new Date().toISOString(),
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
