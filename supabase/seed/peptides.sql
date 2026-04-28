-- Canonical research-use peptides seed.
-- Focused on the peptides researchers are actively studying.

insert into peptides (slug, name, aliases, sequence, cas_number, category, mechanism, indications_tags, legal_status) values
  ('bpc-157', 'BPC-157', ARRAY['Pentadecapeptide BPC 157','PL 14736','Body Protection Compound'], 'GEPPPGKPADDAGLV', '137525-51-0', 'research', 'Stable gastric pentadecapeptide; angiogenesis, NO-pathway, tendon/ligament repair', ARRAY['tendinopathy','IBD','wound healing','ischemia'], '{"FDA":"not approved","WADA":"prohibited S0 2022+"}'::jsonb),
  ('tb-500', 'TB-500 (Thymosin Beta-4)', ARRAY['Tβ4','Thymosin β4 fragment'], 'LKKTETQ', '77591-33-4', 'research', 'Actin-sequestering peptide; promotes cell migration, angiogenesis, wound healing', ARRAY['wound healing','cardiac repair','neuroprotection'], '{"WADA":"prohibited S2"}'::jsonb),
  ('ghk-cu', 'GHK-Cu', ARRAY['Copper Tripeptide-1','Prezatide copper acetate'], 'GHK', '89030-95-5', 'research', 'Copper-binding tripeptide; remodels extracellular matrix, modulates gene expression', ARRAY['skin aging','wound healing','hair growth'], '{"FDA":"cosmetic OTC"}'::jsonb),
  ('semaglutide', 'Semaglutide', ARRAY['Ozempic','Wegovy','Rybelsus'], NULL, '910463-68-2', 'therapeutic', 'GLP-1 receptor agonist', ARRAY['type 2 diabetes','obesity','cardiovascular'], '{"FDA":"approved","EMA":"approved"}'::jsonb),
  ('tirzepatide', 'Tirzepatide', ARRAY['Mounjaro','Zepbound'], NULL, '2023788-19-2', 'therapeutic', 'Dual GIP/GLP-1 receptor agonist', ARRAY['type 2 diabetes','obesity','sleep apnea'], '{"FDA":"approved","EMA":"approved"}'::jsonb),
  ('retatrutide', 'Retatrutide', ARRAY['LY3437943'], NULL, NULL, 'research', 'Triple agonist (GLP-1, GIP, glucagon) in Phase III', ARRAY['obesity','diabetes','MASH'], '{"FDA":"investigational"}'::jsonb),
  ('cjc-1295', 'CJC-1295', ARRAY['CJC-1295 DAC','Modified GRF(1-29)'], 'YADAIFTNSYRKVLGQLSARKLLQDILSR', '863288-34-0', 'research', 'Long-acting GHRH analog; stimulates pituitary GH release', ARRAY['GH deficiency','body composition'], '{"WADA":"prohibited S2"}'::jsonb),
  ('ipamorelin', 'Ipamorelin', ARRAY[]::text[], 'Aib-His-D-2-Nal-D-Phe-Lys-NH2', '170851-70-4', 'research', 'Selective GH secretagogue (ghrelin receptor agonist)', ARRAY['GH release','post-op ileus'], '{"WADA":"prohibited S2"}'::jsonb),
  ('hexarelin', 'Hexarelin', ARRAY['HEX'], 'His-D-2-methyl-Trp-Ala-Trp-D-Phe-Lys-NH2', '140703-51-1', 'research', 'GH secretagogue; cardioprotective activity', ARRAY['GH deficiency','cardiac'], '{"WADA":"prohibited S2"}'::jsonb),
  ('melanotan-ii', 'Melanotan II', ARRAY['MT-II','MTII'], 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2', '121062-08-6', 'research', 'Non-selective melanocortin receptor agonist', ARRAY['erectile dysfunction','skin pigmentation','appetite'], '{"FDA":"not approved"}'::jsonb),
  ('pt-141', 'PT-141 (Bremelanotide)', ARRAY['Vyleesi'], 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH', '189691-06-3', 'therapeutic', 'MC4R agonist', ARRAY['HSDD','erectile dysfunction'], '{"FDA":"approved 2019"}'::jsonb),
  ('thymosin-alpha-1', 'Thymosin Alpha-1', ARRAY['Tα1','Zadaxin'], 'SDAAVDTSSEITTKDLKEKKEVVEEAEN', '62304-98-7', 'both', 'Immunomodulator; T-cell maturation', ARRAY['chronic hepatitis B','immune dysfunction','cancer adjuvant'], '{"FDA":"not approved","EMA":"approved several countries"}'::jsonb),
  ('epithalon', 'Epithalon', ARRAY['Epitalon','Epithalamin'], 'AEDG', '307297-39-8', 'research', 'Telomerase activator, pineal modulator', ARRAY['aging','sleep','circadian'], '{}'::jsonb),
  ('dsip', 'DSIP', ARRAY['Delta Sleep-Inducing Peptide'], 'WAGGDASGE', '62568-57-4', 'research', 'Neuropeptide; sleep and stress modulation', ARRAY['insomnia','withdrawal'], '{}'::jsonb),
  ('selank', 'Selank', ARRAY['TP-7'], 'TKPRPGP', '129954-34-3', 'research', 'Synthetic analog of tuftsin; anxiolytic, nootropic', ARRAY['anxiety','cognition'], '{"Russia":"approved"}'::jsonb),
  ('semax', 'Semax', ARRAY[]::text[], 'MEHFPGP', '80714-61-0', 'research', 'ACTH(4-10) analog; nootropic, neuroprotective', ARRAY['stroke','cognition','ADHD'], '{"Russia":"approved"}'::jsonb),
  ('mots-c', 'MOTS-c', ARRAY[]::text[], 'MRWQEMGYIFYPRKLR', '1627580-64-6', 'research', 'Mitochondrial-derived peptide; metabolic regulation', ARRAY['insulin resistance','obesity','aging'], '{}'::jsonb),
  ('ss-31', 'SS-31 (Elamipretide)', ARRAY['Bendavia','MTP-131'], 'D-Arg-dmt-Lys-Phe-NH2', '736992-21-5', 'research', 'Mitochondrial-targeted cardiolipin peptide', ARRAY['mitochondrial disease','heart failure','dry AMD'], '{"FDA":"investigational"}'::jsonb),
  ('kpv', 'KPV', ARRAY['α-MSH(11-13)'], 'KPV', '67727-97-3', 'research', 'Anti-inflammatory tripeptide derived from α-MSH', ARRAY['IBD','skin inflammation'], '{}'::jsonb),
  ('liraglutide', 'Liraglutide', ARRAY['Victoza','Saxenda'], NULL, '204656-20-2', 'therapeutic', 'GLP-1 receptor agonist', ARRAY['type 2 diabetes','obesity'], '{"FDA":"approved","EMA":"approved"}'::jsonb),
  ('aod-9604', 'AOD-9604', ARRAY['hGH fragment 176-191'], 'YLRIVQCRSVEGSCGF', '221231-10-3', 'research', 'Lipolytic hGH fragment', ARRAY['obesity','cartilage repair'], '{"FDA":"not approved"}'::jsonb),
  ('n-acetyl-selank', 'N-Acetyl Selank', ARRAY[]::text[], 'Ac-TKPRPGP', NULL, 'research', 'Acetylated Selank analog', ARRAY['anxiety','cognition'], '{}'::jsonb),
  ('humanin', 'Humanin', ARRAY['HN'], 'MAPRGFSCLLLLTSEIDLPVKRRA', NULL, 'research', 'Mitochondrial-encoded cytoprotective peptide', ARRAY['Alzheimer','diabetes','cardiac'], '{}'::jsonb),
  ('glutathione', 'Glutathione (peptide form)', ARRAY['GSH'], 'ECG', '70-18-8', 'research', 'Tripeptide antioxidant', ARRAY['oxidative stress','detox'], '{"FDA":"supplement/Rx IV"}'::jsonb),
  ('dihexa', 'Dihexa', ARRAY['N-hexanoic-Tyr-Ile-(6) aminohexanoic amide','PNB-0408'], NULL, NULL, 'research', 'HGF/c-Met potentiator; synaptogenic', ARRAY['Alzheimer','cognition'], '{}'::jsonb),
  ('cagrilintide', 'Cagrilintide', ARRAY['NN9838'], NULL, NULL, 'research', 'Long-acting amylin analog', ARRAY['obesity'], '{"FDA":"investigational"}'::jsonb),
  ('survodutide', 'Survodutide', ARRAY['BI 456906'], NULL, NULL, 'research', 'GLP-1/glucagon dual agonist', ARRAY['obesity','MASH'], '{"FDA":"investigational"}'::jsonb),
  ('gonadorelin', 'Gonadorelin', ARRAY['GnRH','LHRH'], 'pGlu-His-Trp-Ser-Tyr-Gly-Leu-Arg-Pro-Gly-NH2', '33515-09-2', 'therapeutic', 'Hypothalamic GnRH; stimulates LH/FSH', ARRAY['hypogonadism','diagnostic'], '{"FDA":"approved"}'::jsonb),
  ('tesamorelin', 'Tesamorelin', ARRAY['Egrifta'], NULL, '218949-48-5', 'therapeutic', 'GHRH analog', ARRAY['HIV-lipodystrophy','visceral fat'], '{"FDA":"approved"}'::jsonb),
  ('larazotide', 'Larazotide acetate', ARRAY['AT-1001'], NULL, '258818-34-7', 'research', 'Tight-junction regulator (zonulin antagonist)', ARRAY['celiac','IBD'], '{"FDA":"investigational"}'::jsonb)
on conflict (slug) do nothing;

-- A few indications to bootstrap the controlled vocab.
insert into indications (slug, name, mesh_id) values
  ('tendinopathy','Tendinopathy','D052256'),
  ('ibd','Inflammatory Bowel Disease','D015212'),
  ('wound-healing','Wound Healing','D014945'),
  ('obesity','Obesity','D009765'),
  ('type-2-diabetes','Type 2 Diabetes Mellitus','D003924'),
  ('gh-deficiency','Growth Hormone Deficiency','D046686'),
  ('cognition','Cognition','D003071'),
  ('anxiety','Anxiety Disorders','D001008'),
  ('erectile-dysfunction','Erectile Dysfunction','D007172'),
  ('sleep','Sleep','D012890'),
  ('cardiac-repair','Cardiac Regeneration','D059747'),
  ('neuroprotection','Neuroprotection','D000067390'),
  ('mash','Metabolic Dysfunction-Associated Steatohepatitis','D005234'),
  ('hsdd','Hypoactive Sexual Desire Disorder','D020018'),
  ('mitochondrial-disease','Mitochondrial Diseases','D028361')
on conflict (slug) do nothing;
