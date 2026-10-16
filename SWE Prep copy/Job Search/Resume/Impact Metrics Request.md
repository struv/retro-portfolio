# Resume Impact Metrics Request

Run this prompt with agents that have authorized read access to the relevant project and reporting sources. Paste the sanitized result back into the job-search chat.

---

I am updating my resume after working as Jr Software Developer at Kids & Teens Medical Group from October 2024 through October 2026. Collect defensible aggregate impact evidence for **Modulo** (patient intake/forms and messaging) and **vaccine inventory** (in use across 25 clinics).

Use existing authorized access. Read-only investigation: do not change production, send messages, alter records, deploy, or create new external data exports. Return aggregate figures and source references only; exclude patient/staff names, contact information, identifiers, message contents, credentials, and raw rows.

1. Inspect project documentation, analytics, logs, or existing reporting queries. Identify the real data source, reporting timezone, date fields, and metric definitions. Prefer September 1-30, 2026 as the most recent full month, plus all-time adoption as of extraction. If unavailable, use the latest complete 30-day period and state the exact dates. Keep lifetime, monthly, and configured-versus-active counts separate.
2. For Modulo, collect active clinics and organizations, active staff, unique patients served, completed form packets, completion rate with denominator, SMS/email sent and delivered, and any measured reliability or reduction in manual work. Distinguish platform totals from the named period. Distinguish patient records stored from patients actively served, packets from individual forms, and provider acceptance from delivery. Explain exclusions such as staging, tests, retries, duplicates, or deleted records.
3. For vaccine inventory, confirm configured clinics versus clinics with activity in the period; collect active users, inventory or dose transactions, and any measured time savings, error reduction, or avoided shortages. If those outcomes were not measured, say unavailable. Do not infer savings from feature availability or transaction volume.
4. For each useful figure, provide: value and unit, exact dates, definition/denominator, reproducible query or calculation when appropriate, data-source or file reference, and limitations. Include aggregate output only; use source labels without secrets. Suggest a lightweight way to measure important missing outcomes without running a new experiment.
5. Separate confirmed figures, estimates with stated assumptions, historical snapshots, and unavailable claims. Do not invent percentages or productivity multipliers. Propose 3-5 concise resume bullets supported by the evidence, noting which are ready to use and which require my confirmation of personal ownership. Describe AI-assisted implementation accurately.

Deliver one sanitized Markdown report with a metric table, calculation/source notes, and proposed bullets. Save it locally in this project's approved workspace or return it in chat; do not upload company data elsewhere.
