# Resume Evidence and Updates

Updated October 15, 2026. This is the working master record for tailoring resumes to individual roles. Review the draft before applications. Match each claim to actual personal contributions, including AI-assisted implementation.

## Master resume interview

Build this record through one question at a time. Keep candidate-reported details, documentary or technical evidence, and proposed resume wording distinct. Select relevant material for each application rather than fitting the entire record into the submitted resume.

### Title progression and leadership

- Candidate initially believed their title might have progressed from Junior to Staff Software Engineer. Later confirmed October 15, after being asked about HR/payroll records, that the official title was **Jr. Software Developer**. This supersedes the earlier uncertainty; no Staff promotion established. Current resume title is correct.
- Candidate reported leading teams of people and reporting to a senior colleague. Team size, reporting relationships, responsibilities, and examples still need clarification.
- Retain **Jr. Software Developer** as the official title. Record leadership responsibilities separately in accomplishment bullets.
- Candidate reported October 15: Modulo users reported bugs in a shared group chat; regional managers also submitted new forms for inclusion.
- Candidate assigned Akila to monitor that chat and resolve easier requests. Akila escalated tasks he could not complete to the candidate.
- Candidate also identified bugs and feature opportunities and sometimes delegated those tasks to Akila.
- Candidate answered Akila's questions about the database and system setup, drawing on having originally created Modulo. Earlier disclosure that AI agents performed practically all coding still applies; original system creation does not establish unaided implementation.
- This account supports task delegation, technical guidance, and escalation ownership involving one named colleague. Formal management authority, total team size, and work across additional teams remain unconfirmed.
- Candidate's concrete escalation example, October 15: Akila needed help changing to a new subdomain; the candidate completed the change himself. Reason for the change, configuration steps, and validation have not yet been described. Do not assume this is the historical carrier-filtering incident.
- Candidate described the usual escalation workflow as completing the task himself and then telling the colleague what he did. Code review, formal mentoring, or pairing have not been established by this example.

### Actual role mix and evidence recovery

- Candidate clarified October 15 that development was a small focus of the role; most assigned work was medical administration and Excel work. Exact time allocation is unknown. Do not frame the entire two-year tenure as exclusively software development.
- Candidate does not readily remember all development examples and ran OCR on remaining Teams chats to recover evidence. Reviewed the supplied extract October 15; see the source-linked examples below. Chat reports support historical activity but do not independently verify code, production behavior, or personal implementation.
- Gather administrative and Excel responsibilities for the master record, including any repeatable reporting, formulas, data processing, or automation actually performed. Select material according to role relevance once details are known.
- Candidate reported October 15: transformed raw data into weekly IHA transfer reports for a manager to present to the CEO. Meaning of IHA, data sources, processing steps, report contents, validation, and degree of automation remain to be clarified. Candidate prepared the reports; direct presentation to the CEO was not claimed.
- Candidate reported that other departments requested help with slow spreadsheets. Used Claude in Excel to optimize them. Specific changes, candidate verification, and before/after performance measurements have not yet been described; do not imply manual optimization or measured speed gains.
- IHA follow-up remains pending: What did the candidate do to turn the raw IHA data into the finished weekly report?

### Selectable reporting and spreadsheet bullet drafts

Based on the candidate's October 15 account; refine after clarifying methods and outcomes:

- Prepared weekly IHA transfer reports from raw data for a manager's presentations to the CEO.
- Helped other departments troubleshoot slow Excel workbooks using Claude in Excel.

### Selectable leadership bullet drafts

Based on the candidate's October 15 account; wording can be refined with specific examples and outcomes:

- Coordinated Modulo maintenance by delegating user-reported bugs and enhancements to a developer, handling escalations, and providing guidance on the database and application architecture.

### Details to gather next

- Modulo: problem, users, project timeline, exact stack, personal decisions, AI contribution, verification, production incidents, and supported impact.
- Vaccine inventory and integrations: scope, contribution, technical decisions, and supported results.
- Other relevant work, internship, education, skills, and portfolio links.
- Turn supported examples into a bank of selectable bullets and project stories after gathering the underlying details.

## Teams evidence reviewed October 15, 2026

Source: [all-frames.txt](</Users/struv/Movies/2026-10-15 09-11-19-text/all-frames.txt>). This is screen OCR, not an audio transcript or native Teams export. Repeated screen captures are not separate incidents. Video timestamps indicate where text appeared in the recording; use message dates for chronology. Dates, speaker attribution, numbers, and quoted AI diagnoses can contain errors. Summaries below omit patient identifiers and live form links. The source file remains in its original location.

### SMS queue recovery and runtime limits — strongest incident candidate

- **Candidate clarification, October 15:** Had an AI agent make the SMS fix and set up tests to verify it worked. Attribute implementation and test setup to the agent. Do not infer personal diagnosis, test authorship, code review, or manual production verification from first-person chat updates. Candidate's specific instructions and any additional acceptance checks remain unclarified.
- **June 15, apparently 2026:** William reports checking production with Claude, finding that the SMS queue was not draining on Vercel, cleaning the backlog, adding a cron-backed drain and stale-processing recovery, updating release notes, merging staging into main, and deploying v1.6.0. Akila acknowledges the update and says he will inform staff. Source lines 5860–5888 and 5996–6025. These are reported actions; backlog cleanup criteria and candidate-performed checks still need explanation.
- **July 10–14:** Akila reports recurring delays and a queue draining daily; William says he changed the schedule to every minute. Source lines 4018–4030 and 4082–4094. Do not describe the June change as a permanent resolution.
- **July 14:** A message in William's side of the exchange reports that queue invocations attempted 80 messages and hit a 60-second runtime limit with HTTP 504. The reported change reduced the Vercel batch to 25 while retaining the persistent-server default of 80. It references PR #232, a production deployment, a type check, and an SMS queue service test. The message reports advancing successful-send timestamps; Akila replies that it looks like it is working and nothing has become stuck so far. Source lines 3727–3741, 3985–3999, and 7108–7122. Exact PR URL is OCR-damaged and has not been independently verified.
- **September 22:** Akila reports another reminder backlog and asks William to investigate; William agrees. This is a later reported recurrence, not evidence of a lasting fix. Source lines 79–98 and 329–342.
- Safe positioning: AI-assisted production troubleshooting, scheduled processing, recovery from stuck work, adjustment to deployment runtime constraints, release coordination, and reported operational checks. No percentage improvement, permanent reliability claim, or count of successfully delivered patient messages is established.

### Product decisions, delegation, and review

- **May 27–29:** William explains that static PDF labels must be edited before reuploading and remapping fields, asks for corresponding Spanish changes, guides radio-button grouping, and asks Akila to update the user-facing issues channel when work is complete. Source lines 6757–6791, 6808–6832, and 6606–6615. Supports application guidance, review of form mappings, and communication with users; does not establish code review.
- **June 4–8:** Provider feedback requests separating consents from questionnaires. William chooses one download control with selections for forms, consents, or all. Akila agrees to implement it and later reports fixing CORS errors and working PDF downloads. William coordinates deployment at staff lunchtime and reports that it looks good on his end. Source lines 6359–6399 and 6188–6199. Attribute product direction and coordination to William; implementation and CORS repair to Akila. No measured time savings are shown.
- **July 17:** William approves a proposed form-packet change and asks for an English/Spanish toggle instead of duplicate language groups in the list; Akila asks whether to implement it and William says yes. Source lines 1803–1923. This documents a design request and delegation, not confirmed shipment or a measured reduction in user effort.
- **July 28–29:** William sends a report guide to help Akila prepare an eCW patient import for a new clinic, offers support, and advises on a facility filter. Akila later reports that the filter returns no data. Source lines 1359–1373. Supports documentation and technical support; successful import is not established.
- **August 19:** William reviews Akila's form mappings and proposes filling repeated fields once and populating matching fields on later pages. He says he will implement it. Source lines 1065–1099 and 1125–1158. Review and feature proposal are supported; completion and impact remain unconfirmed.

### Domain migration and delivery troubleshooting

- **June 11–23:** Messages discuss suspected carrier filtering of form links, obtaining access to a company domain, coordinating DNS/Vercel configuration, and testing messages across domains. William offers to coordinate with the domain contact and requests test messages; Akila and another colleague also perform domain setup. One message reports that the domain was the problem, while subsequent messages say further testing is needed. Source lines 5890–5912, 6139–6162, and 7243–7266.
- **July 15:** William explicitly reports transitioning to the new forms subdomain. Source lines 3602–3613 and 3840–3849.
- This adds context to the candidate's subdomain example, but the messages show shared work across several dates. Do not attribute all configuration or diagnosis solely to William, or promise universal delivery recovery. Provider status marked sent/delivered was itself questioned in the chat.

### Items requiring attribution or scope confirmation

- **eCW integration — excluded:** Candidate explicitly confirmed October 15 that he did not work on eCW integration. Removed eClinicalWorks from the LaTeX and Markdown resume integration bullets. June 15 chat also attributes synchronization investigation to another team (source lines 5977–5995); September messages discuss API costs (lines 75–78). Patient imports and manual PDF uploads are different workflows. When I Work and Paylocity contributions still need separate confirmation.
- **Password reset:** July messages contain an AI diagnosis about a reset token being cleared before a second render. Akila is investigating, and William recalls a prior fix, but the extract does not clearly establish who completed the new repair or a verified outcome (lines 3665–3687). Keep as an incident lead, not a completed resume accomplishment.
- **Organization separation and form selection:** Messages describe an organization-scoping defect and age/gender-dependent packet selection. Akila reports a deployment after the organization issue and asks William for guidance on later packet changes (lines 5550–5568, 4673–4689, and 4273–4309). Do not collapse these into a sole-authorship security fix or a clinical outcome claim.
- No official promotion record, Staff title, formal direct-report relationship, or larger team size is established in this extract. The weekly IHA reporting workflow and spreadsheet performance improvements also remain unexplained here.

### Additional selectable bullet drafts

Use after the candidate can explain personal decisions and checks; technical outcomes below are supported by chat reports rather than a fresh production audit:

- Used an AI coding agent to repair Modulo SMS queue processing and set up automated verification tests. The chat reports a serverless batch-size change and resumed processing; do not attribute those technical decisions or checks personally to the candidate without further clarification.
- Directed a consent/questionnaire PDF export enhancement, defining selection behavior, coordinating implementation with a developer, and reviewing the released workflow.
- Guided a developer through PDF field mapping and English/Spanish form updates, reviewed configurations, and coordinated updates to clinic users.
- Coordinated domain migration and message testing with development and IT colleagues while investigating filtered patient form links.

### Modulo origin, delivery approach, and business case

- Candidate reported October 15: the organization was paying over $10,000 per month for NexHealth and decided to create an in-house solution. This is a candidate-reported vendor cost; billing period, exact amount, included products, and documentary support remain unconfirmed.
- Candidate reports delivering Modulo over approximately one to two months using coding agents. Exact dates, initial release scope, and rollout timeline remain unconfirmed.
- Candidate clarified that agents performed essentially all implementation and he did not meaningfully hand-code the software. His stated focus was obtaining the end result users needed as quickly as possible. Apply this clarification across the master record and future resume wording, rather than implying hands-on implementation from first-person descriptions such as "built" or "fixed."
- Existing chat examples support selected product decisions, delegation, and user communication. Do not infer architecture authorship, manual diagnosis, code review, or test authorship without a specific account.
- Candidate confirmed October 15: the organization canceled NexHealth and completely transitioned to Modulo. Together with the previously reported NexHealth cost of over $10,000 per month, this supports a candidate-reported replacement of a paid vendor. Exact cancellation date, final recurring charge, billing records, and Modulo operating costs remain unconfirmed. Do not present gross vendor spend as net savings or annualize it as realized savings.
- Candidate also reports cancellation of some paid eClinicalWorks services, including campaigns and appointment confirmations. Exact service names, charges, cancellation dates, and the corresponding Modulo workflows remain to be clarified. This is service replacement, not an eCW API integration claim.
- Selectable draft: Delivered Modulo through AI coding agents in approximately one to two months, enabling a full transition from NexHealth, a service costing the organization over $10,000 per month.
- Additional selectable draft, pending workflow confirmation: Helped replace paid eClinicalWorks campaign and appointment-confirmation services with in-house workflows.

- Candidate estimated October 15 that recurring infrastructure cost was under $100 per month, approximately $60: about $40 for Vercel seats and hosting, with the remainder for AWS Lightsail database hosting and storage buckets. Provider names normalized from spoken "Versel" and "Amazon Light Sale"; exact AWS services and billing breakdown need confirmation.
- Treat approximately $60/month as a candidate-reported infrastructure estimate, not a verified all-in operating cost. Whether SMS/email delivery, AI subscriptions, other shared services, or maintenance costs are included is not yet established. No verified net-savings amount has been calculated.

- Candidate clarified October 15 that messaging reused an existing GoTo subscription at no additional cost. Existing subscription spend is not zero; this establishes candidate-reported incremental cost only. Whether this account covers both SMS and email remains unspecified.
- Working cost account: approximately $60/month in infrastructure plus messaging through an existing paid subscription with no reported incremental charge. AI subscription costs, maintenance labor, exact billing periods, and remaining services have not been accounted for; do not label this a verified all-in cost or calculate realized annual savings.
- Selectable cost-focused draft, pending billing confirmation: Delivered Modulo using AI coding agents, enabling the organization to cancel NexHealth, previously costing over $10,000/month; operated on approximately $60/month in infrastructure and reused existing GoTo messaging at no additional charge.

### Launch date and changelog evidence

- Candidate initially supplied launch date as `01.08.2026` and linked [the application changelog](https://www.expressvipcheckin.com/changelog). Subsequently clarified October 15: limited testing at one clinic in January 2026; live in February 2026. Use these month-level milestones; the exact January pilot day and production day have not been independently confirmed by the candidate. NexHealth cancellation date is still unknown.
- The live URL could not be retrieved October 15 (web tool inaccessible; direct request failed DNS resolution). Read the existing local repository's changelog instead; local source does not establish what is currently deployed or on GitHub.
- Local [CHANGELOG.md](</Users/struv/Documents/code/forms/CHANGELOG.md:863>) records **January 8, 2026** as v0.1.0, **Initial Setup**. [The same file](</Users/struv/Documents/code/forms/CHANGELOG.md:582>) labels **February 10, 2026** as v1.0.0, **Production Release**. Candidate's month-level pilot and launch clarification aligns with this sequence. These entries do not independently establish exact clinic-use dates, development effort, or vendor cancellation timing.
- The local changelog page imports [shared/changelog.ts](</Users/struv/Documents/code/forms/shared/changelog.ts:16>), whose latest listed release is v1.6.0 on June 15; the Markdown changelog's latest listed release is v1.5.0 on May 27. Keep these source versions distinct.
- Initial setup lists React, Express, tRPC, GoTo/Jive OAuth, role-based access, kiosk forms, and appointment scheduling. Later entries document PDF mapping/scoring, SMS/email delivery, patient imports, campaigns, organization scoping, and queue recovery. Treat these as product capabilities/release records, with agents and colleague contributions attributed separately.

- Selectable rollout draft: Delivered Modulo using AI coding agents, progressing from a one-clinic pilot in January 2026 to production launch in February 2026.

- Candidate confirmed October 15: Modulo was in use across 25 clinics by the end of his time at Kids & Teens in October 2026. This is candidate-reported adoption, distinct from historical configured-location counts and the separate vaccine inventory application.
- Selectable adoption draft: Delivered Modulo through AI coding agents, progressing from a one-clinic pilot in January 2026 to production launch in February and adoption across 25 clinics by October 2026.

### Everyday workflows

- Candidate confirmed October 15 that clinic staff used Modulo for patient outreach through text and email, campaign messages, and recall campaigns.
- Staff also used Modulo to create and administer forms for patients to sign and complete before appointments.
- These are candidate-confirmed uses, not just features listed in the changelog. Usage volumes, completion rates, recall conversions, and changes in staff workload are not yet established by this account.
- Selectable scope draft: Delivered an AI-agent-built patient intake and communications platform used across 25 clinics for SMS/email outreach, campaigns and recalls, and pre-appointment forms and signatures.

### Requirements discovery

- Candidate reported October 15 that he studied existing workflows to decide what features the replacement needed.
- Candidate clarified October 15 that he reviewed NexHealth's features alongside the existing workflows to identify what Modulo needed to support.
- This supports workflow analysis. Staff interviews, formal requirements documents, feature prioritization methods, and manager-supplied requirements have not yet been established.

- Selectable requirements draft: Defined Modulo's initial requirements by studying clinic workflows and reviewing NexHealth's features.

### Pilot-to-production changes documented in the changelog

Reviewed October 15 from local [CHANGELOG.md](</Users/struv/Documents/code/forms/CHANGELOG.md:582>), covering January 8 initial setup through February 10 production release. Candidate does not recall specific pilot feedback. These are documented changes during the pilot-to-launch period; the changelog does not establish that each change resulted from pilot feedback. The February 10 entry summarizes the production feature set and repeats some earlier additions, so do not count everything there as newly developed on that date.

| Period | Documented additions and fixes | Resume relevance |
|---|---|---|
| January 14–17, v0.2–0.3 | Email delivery/campaigns, cloud form storage, completed-form archival, patient imports with guardian contacts, mapped consent forms, questionnaire scoring, automatic SMS/email form sending, and combined PDF downloads. | Expanded the initial prototype into a more complete intake and outreach workflow. Source lines 818–861. |
| January 19–22, v0.4–0.5 | Patient pagination, user/admin controls, compressed audit logs, form-field copying, patient downloads, clearer scheduling-conflict notifications; fixes for saving forms, automatic SMS sending, and clinic message templates. | Improved staff administration, form setup, and everyday usability. Source lines 771–816. |
| January 27–30, v0.6–0.7 | Search by chart ID and DOB, location columns, persistent location/language filters, blank and completed packet downloads; fixes for incorrect language defaults, age-dependent consent selection, template placeholders, and duplicate document groups. | Made clinic workflows easier to navigate and corrected form selection/delivery behavior. Source lines 730–769. |
| February 3, v0.8 | Rate-limited SMS queue, recovery watchdog, queue diagnostics, file-upload fields, duplicate-patient detection, import contact validation, and form-link expiration changes. | Added messaging resilience and data-entry safeguards. Source lines 706–728. |
| February 5–6, v0.9–0.9.1 | Resource/polling optimizations, MMS support, message priorities, dashboard filtering, and Playwright testing infrastructure; fixes for incorrect consent selection and completion status. | Prepared the product for broader use and introduced automated end-to-end testing infrastructure. Source lines 671–704. No independently measured speed/cost gains established here. |
| February 10, v1.0 | Production release documents patient management, visual forms/signatures, packets, scheduling, messaging, imports, permissions, campaigns, and release/testing tools; fixes include duplicate/double sends, placeholders, age-based consents, and deployment compatibility. Lists login/reset rate limits, session timeout, HTTPS enforcement, and removal of a fallback signing secret. | Records the production scope and further reliability/security work. Source lines 582–669. Security controls are not independent proof of HIPAA compliance. |

- Draft narrative for tailoring: Took Modulo from a one-clinic pilot to a production release, expanding intake and outreach workflows and addressing form selection, message delivery, and staff usability through AI coding agents.
- Keep all implementation attributed to agents and relevant colleagues as previously clarified; this release list does not establish personal manual coding, test authorship, clinical outcomes, or independent technical decisions.

### Rollout training and user support

- Candidate reported October 15 that he created a group chat for user questions and offered ongoing help with using Modulo.
- Held multiple training sessions demonstrating the application's workflows. Exact session count, attendance, dates, and supporting materials have not yet been established.
- Initially trained regional managers and other higher-level staff. These staff offered to help offices learn the system, supporting adoption across clinics. Do not imply the candidate personally trained every user at all 25 clinics.
- Selectable rollout/support draft: Supported Modulo adoption across 25 clinics by training regional managers and senior staff through live demonstrations and establishing a shared channel for user questions and ongoing support.
- Interview story: introduced the software through demonstrations for regional leadership, enabled those staff to support office learning, and maintained a direct channel for questions and issues. Training outcomes and proficiency improvements have not been measured here.

## Vaccine inventory — candidate account, October 15

- Candidate identifies this as his second main project. Medical assistants across 25 clinics checked vaccine stock in refrigerators and entered the inventory through a web interface backed by an Excel workbook.
- Candidate reported an approximately two-week build-to-use timeline.
- Candidate initially gave March 2026 as the start of clinic use, then described it as seven months before October 15, 2026, consistent with approximately March 2026. Exact day and clinic-by-clinic rollout dates remain unspecified.
- Candidate reported staff accessed the inventory app through a company-only link. Authentication, authorization, and enforcement of company-only access have not been described or independently verified; do not infer individual accounts, SSO, or network restrictions from this description.
- Motivation: previous direct Excel editing by MAs caused accidental mistakes. Candidate provided a front end to make entry more efficient and avoid having MAs edit the workbook directly. Candidate calls the front end secure; specific access controls and their verification have not yet been reviewed here. Do not infer quantified error reduction or compliance certification.
- An overseas team compared the submitted values against the EMR, investigated differences, and reconciled discrepancies. This was a human reconciliation workflow, not an automated EMR integration.
- Candidate added a duplicate-entry feature so MAs could quickly enter multiple cases of the same vaccine. Reports very positive user feedback, especially about this feature; no survey results, measured time savings, or error rates supplied.
- Existing clarification that coding agents performed essentially all implementation applies here as well.
- Selectable draft: Delivered an Excel-backed vaccine inventory interface used by medical assistants across 25 clinics, enabling stock entry without direct workbook editing and supporting an overseas team's reconciliation against EMR records.
- Selectable usability draft: Added vaccine-entry duplication to simplify recording multiple cases of the same vaccine, receiving positive user feedback.
- Candidate confirmed October 15 that he alone was responsible for ongoing vaccine inventory app support and changes after rollout. This describes human ownership; implementation continued to use coding agents as previously clarified. Ownership after his departure has not been described.
- Selectable ownership draft: Served as the sole support and maintenance owner for an Excel-backed vaccine inventory application used across 25 clinics.
- Candidate reported October 15 that acquiring new offices created a need to onboard additional locations. Created a way for the overseas team to add new locations directly in the app and sync them to the master spreadsheet. Specific permissions, validation, implementation details, and number of locations onboarded remain unspecified.
- Selectable expansion draft: Added an in-app location-onboarding workflow so the overseas operations team could add newly acquired clinics and synchronize them with the master Excel workbook.
- Candidate clarified October 15 that he gathered requirements through a long phone conversation with the vaccine reconciliation lead, who managed the reconciliation team. The lead specifically wanted to retain Excel because his team was familiar with it.
- Candidate used the existing Excel workbook as the application's data store and provided a front end for clinic entries. This records a stakeholder-driven data-storage choice; it does not imply a database migration or that the candidate personally implemented the integration code.
- Candidate reports that the reconciliation team liked the result and needed little adaptation. Treat this as qualitative feedback, not a measured training or adoption-time reduction.
- Asked how app entries were checked against the Excel workbook before rollout, candidate reported testing together with the reconciliation team lead. Supports collaborative user acceptance testing; specific cases, coverage, and recorded results were not described. Candidate described the lead as very helpful and said they became good friends; retain this as relationship context, not a technical outcome.
- Selectable collaboration draft: Partnered with the vaccine reconciliation lead to define requirements and test the inventory workflow against the team's existing Excel workbook before rollout.
- Selectable requirements/design draft: Gathered requirements from the vaccine reconciliation lead and delivered a clinic-facing interface backed by the team's existing Excel workbook, preserving their established reconciliation workflow.
- Evidence status: 25-clinic use is candidate-reported; earlier technical snapshot location counts require reconciliation before using them as independent adoption proof. The duplicate feature and security controls have not been inspected in this turn.

### Inventory interface screenshot evidence

- Reviewed two screenshots supplied by the candidate October 15. Sources: `/var/folders/yp/mn9gdrfx49gc6vklnytbh4qr0000gn/T/codex-clipboard-13133625-52a5-461f-934a-9bd5d7e147d1.png` and `/var/folders/yp/mn9gdrfx49gc6vklnytbh4qr0000gn/T/codex-clipboard-4bcdbcc8-997f-4802-b3e0-7017299c431f.png`. These are temporary attachment paths; no archival copy created.
- Visible fields: vaccine, brand, VFC/PVT type selection, quantity on hand, presentation (e.g. vials or syringes), doses per box, lot number, expiration date, and NDC.
- Interface includes a clinic selector, submitter-name field, weekly-submission label, current date, overall last-update indicator, and per-row editor/time labels. An entered name is not evidence of authenticated identity.
- Inventory is organized into Refrigerator, Freezer, and Extra Spaces sections. Visible controls include Add Row, duplicate-row icons, delete controls on some rows, and Save Inventory.
- Screenshots support the existence of these interface elements. They do not independently verify duplicate behavior, persistence to Excel, access restrictions, validation, accuracy of entered data, or adoption totals. Staff names and individual stock/lot values are not reproduced in resume notes.
- Selectable feature detail: Supported stock entry by vaccine, lot, expiration, quantity, and VFC/private classification, with row duplication and refrigerator/freezer sections.

## GitHub project discovery — October 15

Read accessible repositories on the connected `struv` account, then inspected relevant READMEs and selected source files. Repository existence and documented capabilities do not prove workplace deployment, adoption, individual authorship, or measured outcomes. Initial generic repository listing returned no results; listing by owner affiliation returned repositories. Private `vax-inv` could not be retrieved through this connection (404); this is not evidence that it does not exist. Discovery below is limited to what the connection exposed.

| Project | What the inspected source indicates | Follow-up status |
|---|---|---|
| [transfers-dashboard](https://github.com/struv/transfers-dashboard/blob/main/README.md) | Python preprocessing of Excel transfer workbooks into an interactive dashboard with group, age-segment, channel, IPA, and period filters. README describes validation against prior-year totals. | Candidate confirmed this supported the weekly IHA reporting and was used by his manager. Do not adopt README validation figures as personal impact without reproduction. |
| [capacity-dashboard](https://github.com/struv/capacity-dashboard/blob/main/src/app/components/ProviderScheduleViewer.tsx) | Provider schedule viewer that parses appointment CSV data and groups it by provider/week. README is a generic Next.js starter, so inspected the component. | Candidate confirmed use by the scheduling team to identify locations needing more appointments, accounting for capacity and specialties. Specific rules and outcomes remain to be clarified. |
| [Paylocity-WIW-API-Integration](https://github.com/struv/Paylocity-WIW-API-Integration/blob/main/README.md) | README describes workforce integration involving scheduling, employee data, time off, and payroll. | Confirm what was actually implemented and deployed. README's percentage reductions and accuracy claims have no supporting measurement in this review and must not be reused in the resume. |
| [audits](https://github.com/struv/audits/blob/main/README.md) | Medical Record Review / Facility Site Review audit manager with checklists, progress, and calendar. | Candidate confirmed personal use for learning audit requirements and tracking preparation; not adopted as a shared company tool. |
| [shiftswap](https://github.com/struv/shiftswap/blob/main/README.md) | Intended medical-team call-out/coverage app using Next.js and Supabase. | Candidate answered "nope" when asked whether staff ever used it: record no staff adoption. Exact completion status remains unspecified; README lists substantial TODOs. Exclude from deployed workplace accomplishments. |
| [ept-vbp-form](https://github.com/struv/ept-vbp-form/blob/main/index.html) | EPT value-based payment readiness assessment form. | Candidate confirmed one-time use to obtain the CEO's answers through an interactive alternative to unintuitive program PDFs. Minor project; low priority for resume inclusion. |
| [kt-pt-appt-qr](https://github.com/struv/kt-pt-appt-qr/blob/main/qr.html) | Kids & Teens appointment-request interface. | Candidate confirmed October 15 that it was not used to collect real appointment requests. Inspected handler logs data and has a commented-out backend example. Exclude from adopted workplace accomplishments. |
| [passport](https://github.com/struv/passport/blob/main/index.html) | Pediatric Health Passport; source tree includes newborn-passport, personal-information, and authentication screens. | Candidate confirmed October 15 that it was never used. Completion/deployment status unspecified; exclude from adopted workplace accomplishments. |

- No changes made to GitHub repositories or live applications. Did not fetch source patient workbooks or patient datasets for this discovery.

### IHA transfer reporting and dashboard — confirmed workplace use

- Candidate confirmed October 15 that the transfers dashboard supported the same weekly IHA reporting described earlier. Built it so his manager could review the data more easily instead of navigating Excel sheets.
- Candidate pulled the reports weekly. Intended to automate the full process but did not have time to complete it. Distinguish the implemented dashboard/data transformation from manual data collection; do not claim end-to-end automated reporting or measured time savings.
- Earlier account states that the manager presented the weekly reports to the CEO; direct CEO use of the dashboard has not been claimed.
- Selectable draft: Delivered an interactive dashboard for weekly IHA transfer reporting, giving a manager a consolidated view of Excel data used in CEO presentations.

### Scheduling capacity dashboard — confirmed workplace use

- Candidate confirmed October 15 that the scheduling team used the capacity dashboard to see which locations needed more appointments, accounting for capacity, specialties, and other scheduling considerations.
- Exact capacity definitions, specialty rules, data sources/update frequency, usage scale, and measured changes in appointment volume or utilization remain unconfirmed. Do not claim automated booking, optimization, or increased utilization from this account alone.
- Selectable draft: Delivered a scheduling dashboard that helped staff identify locations needing additional appointments based on capacity and specialty requirements.
- Existing clarification that agents performed essentially all implementation applies to both dashboards.

### Paylocity–When I Work integration — completed, not adopted

- Candidate clarified October 15 that the integration was completed but the cost of implementation was too high, so the company did not meaningfully use it. Exact cost, what the implementation charge covered, completion/testing scope, and any limited trial use remain unspecified.
- Classify as completed development without organizational adoption. Do not imply that it automated live operations or delivered payroll/time savings. README percentage improvements remain unsupported and excluded.
- Selectable draft: Developed a Paylocity–When I Work API integration using AI coding agents; completed development, with rollout not pursued because of implementation cost.
- Existing resume bullet should reflect the lack of adoption rather than implying achieved operational automation. Prioritize adopted systems when selecting bullets for applications.

### Audit Manager — personally used work-support tool

- Candidate clarified October 15 that he was put in charge of audits and responsible for preparing all locations for their audits. Exact location count and scope of authority for this responsibility remain unspecified; do not automatically reuse the 25-clinic software adoption count.
- Used Audit Manager himself as a learning aid and checklist to keep track of the many audit preparation requirements. This was a personally used tool supporting real job responsibilities, not a shared company deployment or merely an unused prototype.
- No claim of use by other employees, organization-wide software adoption, improved audit scores, regulatory compliance, or measured preparation-time savings is established.
- Selectable draft: Created and used an audit-preparation checklist application to organize requirements while preparing clinic locations for audits.
- Broader administrative responsibility to retain in the master record: coordinated preparation of clinic locations for audits. Specific actions, audit types, and results need follow-up.
- Candidate clarified that audit preparation involved visiting locations in person and checking that everything was in place; he explicitly considers this unrelated to software engineering. Keep as administrative background, with low priority for SWE resume tailoring. No further audit detail needed for the current software-focused interview.
- Existing clarification that coding agents performed essentially all implementation applies to this application.

### EPT assessment form — one-time internal use

- Candidate reported October 15 that the CEO had limited time and the EPT program's PDFs were unintuitive. Created an interactive form to obtain the CEO's answers directly.
- Used once for this purpose. Candidate considers it an inconsequential project; retain as background in the master record and give it low priority when selecting resume accomplishments.
- No measured time savings, recurring adoption, program outcome, or organization-wide deployment claimed. Existing AI implementation attribution applies.

### Modulo stack choices and deployment transition

- Candidate clarified October 15 that agents recommended most technology choices. Do not attribute independent stack selection or architecture design to the candidate without specific evidence.
- Candidate reports the original application was created in Manus and that its initial setup was not deployable on Vercel, requiring changes to part of the stack. He considers some initial stack choices mistakes but does not recall technical specifics.
- Exact original/replacement technologies, incompatibility, migration steps, dates, and personal decisions remain unknown. This is a candidate-reported project-specific deployment constraint, not a general claim that Manus applications cannot deploy on Vercel.
- Preserve as an interview-story lead; inspect repository history if needed to recover details. Do not turn it into a detailed migration accomplishment until substantiated.

- Candidate reported October 15 that the senior colleague had minimal involvement, recommending AWS Lightsail for the database and storage buckets and advising robust data backups. Exact AWS storage service remains unconfirmed. This is guidance received, not evidence that a particular backup system was implemented or restore-tested. Agents still recommended most other stack choices.

- Asked what backup process was actually in place, candidate answered "aws db and s3 snapshots." Record as candidate-reported AWS database and S3 backup arrangements, preserving the original wording until exact mechanisms are verified. Do not infer database service, S3 versioning, AWS Backup, snapshot frequency, retention, automation, or successful restoration from this answer.

- Candidate confirmed that he did not test restoring data from the backups. Do not claim restore-tested backups, validated disaster recovery, or proven recovery capability.

### Projects outside Kids & Teens

- Candidate reported that software built outside Kids & Teens was for personal use; no additional externally adopted software was identified. Do not imply outside users, freelance clients, or adoption for those projects.
- Prioritize Modulo, vaccine inventory, and the reporting/scheduling dashboards for SWE resume evidence. Personal projects may be selected for relevant technical examples after clarifying scope and contribution.

### Lepow International internship — candidate clarification

- Candidate corrected the internship dates October 15 and subsequently confirmed the months: **May 2022 - Sep 2023**, superseding the May 2020-September 2021 dates copied from the original resume and the interim year-only range. Use the confirmed month/year range consistently in the master and submission versions.
- Updated the master Markdown and LaTeX, the Machina submission, and both exported PDFs. Refreshed the previously stale master PDF from the current master text; it is two pages, while the Machina submission remains one page. Master LaTeX compilation succeeded and the PDF layouts and corrected date text were checked. Also aligned the master's summary and project ownership verbs with the candidate's previously requested builder framing.
- Candidate reported that the work mostly involved WordPress and Elementor pages, updating site content, and helping with influencer marketing.
- Began learning PHP but did not progress to substantial work with it. Do not list PHP as professional development experience based on this account.
- No measured SEO, conversion, traffic, or marketing improvements established. The current draft's stronger claims about improving search visibility and coordinating campaigns/partnerships require confirmation or narrower wording.
- Selectable draft: Updated WordPress and Elementor pages and site content, and supported influencer marketing activities.

### Live Chatroom and WebSockets clarification October 15

- Candidate recalled using WebSockets to build the Live Chatroom listed in the uploaded resume for a college web development class. This supersedes the earlier statement that he had not used WebSockets.
- The original resume lists the chatroom as a May-June 2024 project built with a partner using Node.js and Express. Those dates and the partner context are carried from the supplied resume, not newly reverified. Candidate's current account confirms the academic context and WebSockets use.
- Selectable bullet: Built a browser-based chatroom with a teammate for a college web development course, using WebSockets for real-time messaging.
- Record WebSockets as academic project experience. The particular library/API, implementation details, current independent fluency, and professional production use are not established by this recollection.
- Candidate is considering another WebSockets project to refresh his memory, probably a multiplayer browser game. This is a future idea, not a started or completed project, and is not a resume accomplishment.
- Added the class chatroom and WebSockets to the master Markdown/LaTeX and Machina submission. Refreshed both PDFs; the master remains two pages and Machina one page. Master LaTeX compilation succeeded, and the changed pages and extracted project/date text were checked.

### MediCAL Billing Application — candidate contribution

- Candidate confirmed that this was a school project. Treat as academic project experience; no workplace adoption or real Medi-Cal submission established.
- Candidate confirmed a four-person team including himself; he was the team leader.
- Candidate reported that he was team leader and did most of the project, including selecting the technology stack, integrating OCR, and getting the application built.
- Candidate clarified that his work on this earlier project was entirely self-written, without AI implementation. This establishes candidate-reported past hands-on development, distinct from the later agent-driven workplace projects. Other contributors' responsibilities and quantitative evaluation/results remain unspecified.
- Candidate says he has forgotten how to program at that level since AI tools became available. Keep past project contribution separate from current coding fluency; current unaided ability remains subject to the independent assessment in the preparation track. Do not erase the historical contribution or treat it as proof of present mastery.
- Selectable draft: Led the MediCAL Billing Application project, selecting its technology stack and integrating OCR into the application.
- Candidate described the workflow as converting a paper-completed EBO form into a digital document that could then be submitted to the Medi-Cal office. Corrected the initially transcribed "EVO" to "EBO"; acronym expansion remains unspecified.
- Candidate confirmed CSV as the output format. Submission itself was outside the application's scope. Input capture method, validation, and whether an actual Medi-Cal submission accepted the output remain unconfirmed. Do not infer automated submission, billing-system integration, or additional export formats such as JSON.
- Selectable workflow draft: Integrated OCR to extract data from completed paper EBO forms and export it as CSV for subsequent Medi-Cal submission.
- Candidate reported that the team created many mock inputs and tested them to check OCR/CSV correctness. Checks mixed automated testing with mostly manual comparisons. A dedicated teammate created the mocks and performed testing. Exact case count, input variations, automated test authorship, framework, and measured accuracy remain unspecified; do not attribute the teammate's test work to William.
- Selectable testing draft: Integrated OCR-to-CSV functionality and worked with a dedicated testing teammate who created mock inputs and checked outputs, primarily through manual comparisons.

- Asked about the hardest technical problems, candidate described the team trying several OCR options before choosing the best-suited one, then mapping the form's fields and aligning the input for OCR extraction. Exact alternatives, selection criteria, alignment technique, and personal versus teammate responsibilities within these steps remain unspecified.
- Selectable technical draft: Evaluated OCR alternatives and integrated form-field mapping and alignment into an EBO-to-CSV extraction workflow. Refine personal attribution and specific methods before using as an interview deep dive; no measured accuracy gain established.

- Candidate confirmed that the final OCR option was Pytesseract/Tesseract, consistent with the original resume. Names of rejected OCR options and exact selection criteria remain unspecified.

- Candidate confirmed OpenCV use for image preprocessing/form alignment and said the referenced technology details were accurate. This confirmation concerns the technical description; it does not validate the original resume's unsupported percentages, JSON export, or personal test authorship.
- Consolidated selectable academic-project summary: Led a four-person team to build an EBO-form digitization application, selected the technology stack, and wrote most of the application code without AI assistance. Used OpenCV for image preprocessing/alignment and Pytesseract/Tesseract for OCR, mapped extracted fields, and exported CSV. A dedicated teammate created mock inputs and performed testing using a mixture of checks, predominantly manual comparisons. The application did not submit documents to Medi-Cal.

## Master consolidation completed October 15

- Candidate confirmed there were no further accomplishments to add. Consolidated the existing `Resume Draft.tex` and matching `Resume Draft.md` into a master resume for selecting and shortening material per role.
- Prioritized Modulo and vaccine inventory; included adopted dashboards, lower-priority work, internship, academic OCR project, technologies, and education. Explicitly distinguished agent-driven workplace delivery from self-written academic work and reflected the mixed administrative/software role.
- Retained the $10,000+ NexHealth monthly cost and approximately $60 infrastructure estimate with their original cost scope; did not calculate net or annual savings. Deployment and maintenance details that cannot be personally explained remain evidence leads rather than detailed architecture claims.
- Removed unsupported SEO/marketing outcomes, JSON output, personal test authorship, and strong compliance claims from the resume text. Kept the unadopted Paylocity integration explicit and grouped it as lower-priority material.
- Existing contact details, internship/project dates, and education were carried forward from the original draft; those were not independently verified by this interview. Technologies used are not a current unaided proficiency assessment.
- Built-in compiler confirmed the updated LaTeX source compiles successfully. Visual layout, final PDF text extraction, and employer-specific parsing remain checks for the application-specific version.
- Next action: use a specific job posting to select relevant accomplishments, tailor the summary and technologies, and produce a concise submission version. No further interview question pending.

## Machina Labs tailoring details October 15

- Candidate reports having used Docker for his Pi-hole setup. He subsequently recalled using WebSockets for his college Live Chatroom project; this corrects his earlier statement of no WebSockets experience.
- This supports personal Docker exposure. Specific setup, configuration, maintenance, troubleshooting, and level of assistance have not been described; professional container deployment, Dockerfile authoring, orchestration, and Kubernetes experience are not established.
- Possible skills wording if relevant to the submission: Docker (personal Pi-hole setup).
- WebSockets is academic project experience relevant to the Full Stack Engineer posting. Refresh current fluency before interviews; do not characterize it as professional production experience.
- Docker use case is clarified. Further detail is needed only for a stronger configuration, maintenance, or deployment claim.
- Prepared [a concise Machina Full Stack Engineer draft](Machina%20Labs%20-%20Full%20Stack%20Engineer.md) and [matching PDF](../output/pdf/William%20Struve%20-%20Machina%20Labs.pdf) on October 15. Target: [Full Stack Engineer](https://jobs.lever.co/MachinaLabs/f3bb50fc-2e20-4823-b389-7f448af90e3a).
- The current draft prioritizes operational applications, requirements, rollout, support, reporting, and the academic OCR and chatroom projects. It uses direct ownership wording for building Modulo and Vax-inv, lists development tools under technical skills, and qualifies Docker as a personal Pi-hole setup. WebSockets is supported by the academic chatroom; no TypeScript proficiency, professional container deployment, or four-year experience claim was added.
- Exported PDF is one page; visually reviewed the final render and verified readable text extraction and contact hyperlinks. These checks do not establish a particular employer's parsing or hiring outcome.
- Application status: draft prepared for candidate review; no submission or resume upload. Review contact details and final wording before applying. The master and Machina internship dates are confirmed as May 2022 - Sep 2023.

### Metrics and format revision October 15

- Candidate requested metrics from the supplied `reports/` folder, clarified that the submission should present him as the builder of Modulo and Vax-inv, and rejected a blanket statement that made his work sound like sole reliance on agents. Use ownership verbs such as "Built and launched" and "Built and maintained" for those applications. Keep actual tool use and coding contributions in this evidence record; project ownership does not require claiming manual authorship of every line.
- Candidate supplied `/Users/struv/Downloads/CS_Resume_2.pdf` as the format reference. Revised the Machina submission to use a centered name/contact header, serif type, ruled section headings, dates aligned on the right, and Education, Technical Skills, Experience, and Projects sections. Updated facts and the most recent role remain in place; obsolete accomplishments and percentages from the old resume were not restored.
- Revised the summary and bullets to emphasize building, launching, requirements, maintenance, and user support. Removed the blanket AI implementation sentence from the submission; Claude Code and Codex remain ordinary tools in the skills section.

| Submission metric | Source and scope | Interpretation |
| --- | --- | --- |
| Modulo adopted across 25 clinics by October 2026 | Candidate's October 15 account recorded above | Overall rollout by October, separate from September's 24 packet-active location records. |
| 115 monthly active staff accounts; 3,847 completed form packets; 24,039 outbound SMS transmissions | [Modulo report](../../reports/Modulo%20Impact.md), Kids & Teens scope, September 1-30, 2026, America/Los_Angeles; collected October 13 | Accounts are not verified unique employees; packets are not individual documents; transmissions are provider-accepted messages, not confirmed deliveries. Counts describe the application, while the candidate account supports ownership. |
| Recorded inventory activity across 21 documented clinics in September 2026 | [Vax-inv report](../../reports/Vax-inv%20impact.md), surviving September edit timestamps observed October 13 | Recorded activity coverage, not a complete historical submission count. Distinct from the candidate-reported 25-clinic rollout by October. |
| NexHealth previously cost over $10,000 per month and was replaced by Modulo | Candidate's prior account and cancellation clarification above | Vendor spend, not verified net savings or realized annual savings. No net savings percentage added. |

- Revised PDF remains one page. Inspected the final render for alignment and clipping, confirmed text extraction including all selected metrics, and verified the email and LinkedIn links. The reports' proposed "contributed to" wording predates the candidate's current ownership clarification and was not copied as the submission's framing.

### GitHub and independent review update October 15

- Candidate authorized adding [github.com/struv](https://github.com/struv) to both the master and Machina resume headers and the review prompt. Added the link to the master Markdown/LaTeX and Machina submission.
- Refreshed both PDFs and confirmed the GitHub text and clickable URL in each. Master remains two pages and Machina one page; the confirmed Lepow month/year dates are preserved. Inspected both updated headers for clipping and confirmed the master LaTeX compiles.
- Read the supplied [audit response](</Users/struv/.codex/attachments/e88f9678-4f86-459e-98ce-2d0a4e1d630a/Pasted text.txt>). The reviewer states it did not have the impact reports and did not inspect GitHub. Its technology, equivalent-experience, and screening predictions are review opinions or leads to investigate, not newly verified candidate facts.
- Saved [the revised application review prompt](Application%20Review%20Prompt.md), explicitly identifying GitHub, both impact reports, current resume materials, and these contribution notes. It asks the reviewer to inspect actual code, distinguish planned from shipped technology, and compare dates and metric definitions before judging inconsistencies.
- Current confirmed internship dates remain May 2022-September 2023. Academic WebSockets and personal Docker experience remain scoped to their respective projects. No other audit-proposed resume changes were applied as part of the GitHub header update.

## Sources

- Submitted resume: `CS_Resume_2 - Original.pdf`, copied byte-for-byte from `/Users/struv/Downloads/CS_Resume_2.pdf`.
- Current answers: two years at Kids & Teens; employment ended October 2026; B.S. in CS; JavaScript, React/Next.js, Vercel, and AWS databases; agents performed practically all coding. Modulo is the main accomplishment. Vaccine inventory is in use across 25 clinics.
- October 15 Teams screen OCR: source-linked examples and attribution limits are recorded above.
- Supplied impact reports reviewed October 15: `reports/Modulo Impact.md` and `reports/Vax-inv impact.md`, both prepared from October 13 evidence. Submission metrics and their scope are recorded in the Machina revision section.
- Historical reference: the imported `anduril-interview-coach/06 Resume & Portfolio Workspace.md` and its production evidence. Historical details need current confirmation before submission.

## Draft changes

Replace the fresh-graduate summary, lead professional experience with Kids & Teens, include Modulo and vaccine inventory, and keep the skills list focused. For the Machina submission, the candidate's October 15 format request supersedes the earlier suggestion to move education below experience: follow the supplied reference's Education, Technical Skills, Experience, and Projects order. Use October 2024 through October 2026 for Kids & Teens and preserve the original contact details for review.

## Confirm before submission

- Contact details and whether any additional portfolio links should be added; GitHub inclusion is authorized and implemented.
- Exact personal responsibilities for each bullet: design, agent direction, review, tests, release, and incident handling.
- Modulo's stack: historical notes describe React/Vite with TypeScript and Express/tRPC. The draft attributes React/Next.js to the broader web work, not specifically to Modulo. Confirm each project's stack.
- SQL and other listed skills should be explainable in an interview; the skills list is not an assessment result.
- Current Modulo adoption, volume, and measured results, using the metrics request.
- Whether the old OCR project deserves space once newer project evidence is quantified.

## Historical production evidence

The older notes describe digital patient intake, PDF forms, visit-specific packets, SMS/email, organization-scoped multi-tenancy, scheduled messaging, audit trails, and archival. They record a carrier-filtering incident resolved by changing the form-link domain, plus tests, browser checks, logs, and user feedback. These support draft bullets pending candidate review.

Recorded July 2026 snapshots include 26 clinic locations across two organizations, about 170,000 patient records, and 32,669 SMS messages in a 30-day window. Those are historical snapshots, not verified current metrics. Confirm definitions, dates, and disclosure suitability before adding numbers.

## Percentages excluded pending evidence

The original resume claims an 80% reduction in manual entry, a 45% reduction in documentation time, a 10% conversion increase, and a 15% organic traffic increase. Confirm measurement and attribution before reuse. Avoid guarantees of clinical accuracy or billing compliance. Describe Pytesseract as OCR rather than a newly trained AI model.

## Interview preparation

For each retained bullet, explain the problem, architecture, personal decisions, agent contribution, verification, a failure or tradeoff, and observed results. Keep directing production work and writing code independently distinct.
