H3K20me2 Flux Assay Workflow for Circulating Tumor Cells (CTCs)

Purpose

Provide a validated, high-throughput mass-spectrometry-based assay to quantify H3K20me2 levels from patient-derived CTCs as a real-time pharmacodynamic biomarker.

Overview

- Sample: 20 mL peripheral blood collected in Streck Cell-Free DNA BCT tubes or EDTA (process within recommended timeframe for CTC integrity).
- Timepoints: baseline; 48 hours post IDE397 start; pre-Trodelvy (Day 8); Day 11 (during methionine rescue); Day 21.
- Target readout: absolute and relative quantification of H3K20me2 peptide(s) normalized to total H3 peptide abundance.

Steps

1) CTC enrichment
   - Recommended platforms: Parsortix (microfluidic) or immunomagnetic capture (EpCAM/CK markers) depending on tumor phenotype.
   - Suggested cell yield expectation: 100–5,000 CTCs per 20 mL (variable by tumor type and burden).

2) Histone extraction from CTCs
   - Acid extraction: resuspend enriched cells -> 0.4 N H2SO4 or 0.2 M HCl (ice, 30 min) -> centrifuge -> extract histones.
   - Protein quantification using micro-BCA.

3) Derivatization & Proteolysis
   - Propionylation of free lysines (prevents missed cleavages) -> trypsin digestion -> second propionylation step to derivatize newly formed N-termini.
   - Clean-up via StageTip C18 desalting.

4) Targeted LC–MS/MS (PRM/SRM)
   - Instrument: Thermo Q-Exactive HF-X (PRM) or Sciex QTRAP (SRM) recommended.
   - Method: PRM transitions targeting H3 peptide with K20 dimethylation (sequence context and m/z listed in lab SOP), plus housekeeping H3 peptide transitions for normalization.
   - Heavy labeled synthetic peptide internal standards for both H3K20me2 and total H3 peptides spiked at known concentrations for absolute quantitation.
   - LC gradient: 30–45 min nano-LC gradient; column: 75 µm × 25 cm C18.

5) QC and calibration
   - Calibration curve: serial dilutions of heavy peptides 0.1–100 fmol on-column.
   - LOD/LOQ determination with blank and low-concentration spikes.
   - Inter-run controls: HeLa digest +/- PRMT5 inhibitor (positive/negative controls).

6) Data analysis
   - Software: Skyline for peak integration and quantitation; export peptide-level AUCs.
   - Normalize H3K20me2 AUC to total H3 peptide AUC to produce ratio; report as % change from baseline.
   - Statistical model: linear mixed-effects model across timepoints; threshold for predicted deep molecular response = >=50% drop in H3K20me2 within 48 hours.

7) Reporting and integration
   - Deliverables: per-sample QC metrics, normalized H3K20me2 ratios, and integrated dashboard with ctDNA PredicineCARE results.
   - Turnaround target: 72 hours from blood draw to report (for clinical decisioning during early cycles).

Operational notes

- Sample batching: process same-patient replicates together to minimize run-to-run variability.
- Backup: freeze aliquots of enriched CTCs for retrospective analyses.
- Validation: analytical validation required before use in clinical decision-making (linearity, accuracy, precision, stability).

Next steps

- Create SOPs for CTC enrichment + histone extraction and assign CLIA lab partner for clinical workflows.
- Order heavy-labeled peptides and establish calibration curves in-house.
- Pilot workflow on 10 retrospective patient samples (paired ctDNA) to validate predictive threshold.
