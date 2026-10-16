# William Struve — Master Résumé

747-206-8550 · wstruve.tech@gmail.com · linkedin.com/in/wstruve · github.com/struv

Master record for selecting and tailoring. Updated October 16, 2026.

- Tailored résumés pull from this file and never add to it.
- Lines marked *(candidate-reported)* have no independent evidence.
- Where William's memory and a repository disagree, the repository wins.
- Metric definitions and exclusions are in **Evidence rules** at the end.

---

## Summary (selectable)

- Software developer who built and launched production TypeScript applications for a multi-clinic pediatric medical group:
  - a multi-tenant patient intake and messaging platform that replaced a $10,000+/month vendor
  - a vaccine inventory app he maintained alone
- Strengths: turning clinic and operations workflows into shipped features, running releases, supporting users, and delivering quickly with AI coding agents (Claude Code, Codex).

---

## Experience

### Jr. Software Developer — Kids & Teens Medical Group
La Cañada Flintridge, CA · Full-time · Oct 2024 – Oct 2026

The role combined software delivery with medical administration, Excel reporting, and audit preparation. Don't present the whole tenure as software-only.

#### Modulo: patient intake and communications platform (Jan 2026 – Oct 2026)

**Shipped stack** (Modulo README)
- Frontend: React 19, TypeScript, Tailwind CSS 4, shadcn/ui, wouter, react-hook-form, Zod 4
- API: Express 4 + tRPC 11
- Data: PostgreSQL + Drizzle ORM (40+ tables); AWS S3 (presigned URLs, server-side encryption)
- Auth: self-hosted JWT
- Messaging: GoTo/Jive SMS API (OAuth); SMTP via Nodemailer
- PDF: pdf-lib + pdfjs-dist
- Deploy: Vercel static SPA plus one serverless function, with cron jobs
- Tests: Vitest + Playwright

**Delivery and scope**
- Built and launched Modulo, taking it from a one-clinic pilot (v0.1.0, January 8, 2026) to production release (v1.0.0, February 10, 2026).
- Replaced NexHealth, which cost the organization over $10,000 per month. The organization canceled NexHealth and moved fully to Modulo. *(candidate-reported; vendor spend, not net savings)*
- Infrastructure cost about $60/month: roughly $40 for Vercel, the rest for AWS Lightsail database hosting and S3. Messaging ran on an existing GoTo subscription at no added charge. *(candidate estimate; excludes AI tools and labor)*

**Multi-tenancy conversion (major challenge; William's account)**
- Modulo was first built for Kids & Teens alone. William converted it into multi-tenant software so a second practice, Los Angeles Intensive Pediatric Care, could run on it in production. He describes this as one of the hardest parts of the project.
- Confirmed by the README and impact report:
  - Each organization has isolated patient data, its own phone number, its own S3 path, and its own Dropbox folder.
  - Per-organization GoTo phone numbers live in the organizations table. The legacy single `GOTO_PHONE_NUMBER` environment variable was retired.
  - One GoTo OAuth credential set serves all organizations.
  - Scheduled jobs (reminders, archival, location sync) process each organization independently.
  - Patient matching is scoped to each organization.
  - Both organizations were active in September 2026: 24 Kids & Teens locations; 25 platform-wide.
- From Teams chat (unverified): an organization-scoping defect surfaced, and the second developer reported deploying a fix. Know exactly what happened, and whether any data crossed organizations, before you raise it in an interview.
- Pull from the `forms` repo before interviews:
  - when the conversion shipped (CHANGELOG)
  - how existing rows were migrated to an organization (migration files)
  - how every query is scoped (tRPC context or middleware)
  - what the scoping defect was and how it was fixed
- Selectable bullet: *Converted Modulo from a single-practice app to multi-tenant software, scoping patient data, phone numbers, file storage (S3, Dropbox), and scheduled jobs per organization; a second pediatric practice was live by September 2026.*

**Features (selectable)**
- Drag-and-drop form-field editor over uploaded PDFs: text, checkbox, radio, signature, initials, date, and file-upload fields, with undo/redo and copying fields between documents.
- Mobile patient form fill with e-signatures, auto-fill from submissions in the past 6 months, and auto-scoring for questionnaires such as ASQ developmental screenings.
- Form packets by visit type (well visit, sick visit, ADHD, sports physical; newborn through 18-year age codes), sent as one link, with age-based consent filtering.
- Delivery by SMS (GoTo/Jive) and email (SMTP):
  - a self-hosted link shortener to avoid carrier spam filtering
  - auto-send when an appointment is created
  - Sent/Viewed/Completed tracking
- Split-pane messaging inbox with family-contact switching, saved responses, unknown-number triage, and 10-second background sync (polling).
- English/Spanish kiosk check-in on shared office tablets.

**Security, release, and operations**
- PHI audit trail covering access, mutations, and auth events, archived monthly to S3 (gzip) with 7-year retention.
- Security controls:
  - AES-256-GCM encryption of signature data at rest
  - S3 server-side encryption
  - TLS-enforced database connections and HSTS via helmet
  - rate limiting on login and password reset
  - 30-minute sliding session timeout
  - CSRF protection

  These are controls, not a certification. Don't write "HIPAA-compliant."
- Release workflow:
  - feature branch → staging → main through PRs
  - Conventional Commits enforced by commitlint
  - Prettier and `tsc --noEmit` on every commit (husky)
  - every production release tagged
  - separate staging and production Vercel projects
- Vitest unit tests and Playwright end-to-end tests covering auth, patient CRUD, form submission, SMS/email delivery, audit logging, CSRF, and kiosk. *(set up through coding agents)*
- Backups: AWS database and S3 snapshots. *(restores never tested; don't claim disaster recovery)*

**Reliability: SMS reminder queue (incident story)**
- **June 2026** *(Teams chat)*: the queue wasn't draining on Vercel serverless. Added a cron-driven drain with stale-processing recovery, cleared the backlog, and released v1.6.0.
- **July 2026** *(Teams chat)*:
  - The drain only ran daily, which caused delays, so it was moved to every minute.
  - Runs attempting 80 messages then hit the 60-second function limit (HTTP 504). The Vercel batch was cut to 25, keeping 80 for the persistent-server build (PR #232).
- **September 2026** *(production SQL)*:
  - Reminders created September 1–21: 0 of 2,714 transmitted.
  - The cron-repair release went out September 22 (PR #255).
  - Reminders created September 24–30: 707 of 707 transmitted, with a median 124 s and p95 518 s from ready-to-send to provider acceptance.
  - 5,372 stale queued messages were suppressed rather than sent.
- **Root cause of the September failure: unknown; pull it from PR #255.** The README's warning that the Hobby-plan staging project "cannot run the production sub-daily cron schedule" is a lead, not an answer.
- Selectable bullet: *Owned reliability of the SMS reminder queue on Vercel: added a cron-driven drain with stale-job recovery, cut batch size from 80 to 25 to fit the 60-second function limit, and restored reminders after a September cron failure (0 sent Sept. 1–21; 707 of 707 sent Sept. 24–30, median 124 s to provider acceptance).*

**Usage: Kids & Teens, September 1–30, 2026** (production SQL, October 13 snapshot)
- Locations and staff:
  - 24 clinic locations with form activity
  - 115 active staff accounts
- Forms:
  - 3,847 completed form packets, totaling 32,840 document units
  - 4,761 patients with form or SMS-reply activity (deduplicated by name + DOB)
- Messages:
  - 24,039 outbound SMS transmitted
  - 5,102 logged form-link email events
- Retained history, January 19 – September 30, 2026: 26,446 completed packets; 26,724 patients with platform activity.
- Selectable bullet: *Scaled Modulo to 24 clinic locations by September 2026, with 115 active staff accounts, 3,847 completed patient form packets, and 24,039 outbound SMS transmitted that month.*

**Product, team, and rollout**
- Defined initial requirements by studying clinic workflows and reviewing NexHealth's features.
- Made product decisions from provider and staff feedback. Examples:
  - one PDF download control with a forms/consents/all selection
  - an English/Spanish toggle for packets instead of duplicate language groups
- Trained regional managers and senior staff through live demos; they then helped their own offices learn the system. Ran a shared chat for questions, bug reports, and new-form requests.
- Worked with a second developer:
  - delegated support-chat monitoring and routine fixes to him
  - handled his escalations, such as moving form links to a new subdomain
  - reviewed his PDF field mappings
  - answered his database and architecture questions
- Coordinated with IT and the domain owner to move patient form links to a company subdomain while investigating carrier filtering of SMS links. This was shared work across several people.

#### Vax-inv: vaccine inventory app (Mar 2026 – Oct 2026)

**Shipped stack** (Vax-inv report; Graph confirmed by William)
- TypeScript, with a Vercel serverless API (`api/index.ts`) and a client under `client/src`
- Data store: a SharePoint-hosted Excel workbook, read and written through the Microsoft Graph API

- Built Vax-inv in about two weeks. Clinic staff began using it around March 2026; the earliest retained edit is March 24, 2026.
- Medical assistants enter stock through the app instead of editing the workbook directly:
  - sections for refrigerator, freezer, and extra space
  - fields for vaccine, brand, VFC/private type, quantity, presentation, doses per box, lot, expiration, and NDC
- Gathered requirements from the vaccine reconciliation lead. Kept his team's existing workbook as the data store so the overseas team could keep reconciling counts against EMR records in Excel.
- Tested the app-to-Excel workflow with the reconciliation lead before rollout. Added:
  - row duplication for multiple cases of the same vaccine, which drew strong positive feedback
  - in-app location onboarding that syncs newly acquired clinics to the master workbook
- Sole support and maintenance owner after rollout.
- Usage: inventory activity recorded at 21 documented clinics in September 2026, and 22 across retained history through September. These come from a timestamp snapshot and are a floor. *(25-clinic use is candidate-reported and unverified)*
- Selectable bullet: *Built and solely maintained Vax-inv, a TypeScript app on Vercel serverless functions that writes clinic vaccine stock counts to a SharePoint-hosted Excel workbook through the Microsoft Graph API, keeping the overseas reconciliation team's Excel workflow; 21 clinics recorded inventory in September 2026.*

#### Dashboards and reporting
- **IHA transfer dashboard:** built a Python (openpyxl) pipeline that aggregates multi-sheet patient-transfer workbooks into an interactive static dashboard.
  - Filters: group, age segment, channel, IPA, and month range.
  - Used for weekly IHA transfer reports that a manager presented to the CEO.
  - Includes a validation script that checks output against prior-year hand-keyed totals.
  - Weekly data pulls stayed manual; full automation was not finished.
- **Capacity dashboard:** built a Next.js/TypeScript scheduling dashboard (CSV parsing, provider-by-week view), January 2025. The scheduling team used it to find locations needing more appointments, accounting for capacity and specialty. A colleague contributed the holiday and current-day features.

#### Rolled out, then recalled
- **AI medical scribe and meeting transcription:** rolled out AI medical scribe and meeting-transcription tools in trials with the group's physicians. Recalled after the trials showed they were less efficient than expected. *(candidate-reported. Needed: vendor/tool, how many providers, trial length, how efficiency was judged. The "over 100 employees" figure on the old site is unverified.)*
- **AI EMR template generator:** built and rolled out an AI EMR template generator based on physician-written templates. Recalled when leadership moved William to other priorities. *(candidate-reported. Needed: whether "trained" meant fine-tuning or examples in a prompt, the tools used, dates, how many users.)*
- Interview angle: the scribe trial shows rolling out a tool, measuring it against real use, and pulling it back. It's only as strong as the measurement behind it.

#### Lower-priority work
- Completed a When I Work–Paylocity API integration using coding agents. Not adopted because of implementation cost. *(The public repo holds only a tutorial site; its percentage claims are unsupported and must not be reused.)*
- Helped other departments troubleshoot slow Excel workbooks using Claude in Excel.
- Built and used a personal audit-preparation checklist app.
- Built a one-time interactive EPT VBP readiness form to collect the CEO's responses.

#### Administrative responsibilities (background; low priority for SWE roles)
- Medical administration and Excel reporting.
- Prepared clinic locations for audits through in-person checks.

### Web Development Intern — Lepow International
Walnut, CA · May 2022 – Sep 2023
- Updated WordPress and Elementor pages and maintained site content.
- Supported influencer marketing activities.

---

## Projects (academic; written without AI tools)

### Meta-Scan (Medi-Cal billing OCR) · Python, Flask, Tesseract, OpenCV, pytest · Aug 2024
Repo: CS-179K/Meta-Scan. Commits run August 2 – September 1, 2024.
- Team leader *(candidate-reported)* of a four-person team building a Flask app that extracts fields from scanned UB-04 claim forms into CSV. It uses Pytesseract/Tesseract OCR with OpenCV preprocessing.
- William's work, per the repo:
  - date and address field validation for the patient and admit/discharge sections
  - the pytest field-validation suite (`test/test_fieldValidation.py`)
  - scrum test plans
  - the About/help tutorial pages
  - the README install and usage docs
- Teammates built the OCR pipeline: form recognition and CSV sectioning (`main.py`), the Flask app (`WindowsStuff/app.py`), and the OpenCV crop module (`photo_crop/crop.py`).
- Selectable bullet: *Led a four-person team building a Flask app that extracts UB-04 claim-form fields into CSV with Tesseract OCR and OpenCV preprocessing; implemented patient and admit/discharge field validation and its pytest tests.*

### Live Chatroom · Node.js, Express, MongoDB, Handlebars · May – Jun 2024
Repo: struv/cs110-final. Commits June 9–12, 2024. Four-person team; two members committed.
- William's work, per the repo:
  - the core app from his course lab: rooms, messaging, nicknames, and Mongoose models (`server.js`, `controllers/`, `models/`)
  - message edit/delete (`routes/messages.js`)
  - the profile "skip" option
  - most of the CSS
- A teammate added Google OAuth login (Passport), database-stored sessions, profiles with validation, and message search.
- Messages post by form submit and page redirect. No WebSockets; socket.io is installed but never used.
- Selectable bullet: *In a four-person course team, built the chatroom's room and messaging backend (Express, Mongoose models) and message edit/delete with Handlebars server-side rendering; teammates added Google OAuth login and search.*

---

## Technologies used (not a proficiency rating)
- **Languages:** TypeScript, JavaScript, Python, SQL, HTML/CSS
- **Frontend:** React, Next.js, Tailwind CSS, shadcn/ui, react-hook-form, Zod
- **Backend:** Node.js, Express, tRPC, Flask
- **Data:** PostgreSQL, Drizzle ORM, MongoDB/Mongoose, Excel/SharePoint (Microsoft Graph API), openpyxl, papaparse
- **Cloud and deploy:** Vercel (serverless functions, cron), AWS (S3, Lightsail), GitHub Pages
- **Integrations:** GoTo/Jive SMS API, SMTP (Nodemailer), OAuth (Google via Passport, GoTo), Microsoft Graph
- **Testing and tooling:** Vitest, Playwright, pytest, Git, husky/commitlint, Claude Code, Codex
- **OCR:** Tesseract/Pytesseract, OpenCV
- **Personal only:** Docker (Pi-hole setup)

## Education
University of California, Riverside — B.S. Computer Science — Aug 2024

---

## Evidence rules for tailoring

### Metric definitions
| Claim | Use | Don't |
|---|---|---|
| Modulo clinics | "24 clinic locations, September 2026," alongside the other September metrics | Don't use 25 for Kids & Teens. 25 is the platform-wide count including Los Angeles Intensive Pediatric Care. |
| 115 active staff accounts | "accounts" | "staff" or "employees". Accounts can be shared or belong to admins. |
| 3,847 packets | "completed form packets" | "forms". One packet bundles several documents (32,840 document units). |
| 24,039 SMS | "transmitted" or "sent" (provider-accepted) | "delivered". The delivery rate is unavailable. |
| NexHealth $10,000+/month | vendor cost replaced | "saved $X," annualized, or set beside the $60/month (that implies net savings). |
| Vax-inv 21 / 22 clinics | September / through September | 25 (unverified) |
| Time saved, error reduction, uptime, delivery rate | — | No measurement exists. Don't claim any. |

### Attribution
- Implementation across the Kids & Teens apps was done with coding agents. William owned product, requirements, delivery, releases, support, and operations. Use ownership verbs (built, launched, converted, owned, maintained). In interviews, say what the agents and the second developer did.
- The second developer implemented the PDF-download selection and its CORS fix; William specified and released it. The domain migration was shared work.
- On résumés, call the second organization "a second pediatric practice." Its name, Los Angeles Intensive Pediatric Care, is fine in interviews.
- Excluded:
  - eClinicalWorks integration (not William's)
  - shiftswap (incomplete side project, never used)
  - passport and kt-pt-appt-qr (never used)

### Not used, or not claimed
- **Confirmed not used:** WebSockets, in the chatroom and in Modulo.
- **Not claimed until evidence exists:**
  - Docker beyond the personal Pi-hole setup
  - Kubernetes
  - GitHub Actions or CI pipelines at work
  - HIPAA certification
  - robotics or hardware integration

### Current fluency (interview prep, not résumé)
- Python: minimal; actively studying for interviews.
- TypeScript: reads codebases reasonably well; writing needs work.

### Open items
1. **September cron failure:** root cause. Pull it from PR #255 in `forms`.
2. **Multi-tenancy conversion:**
   - date
   - migration approach
   - how queries are scoped
   - what the organization-scoping defect was

   Pull these from `forms`.
3. **AI scribe trial:** tool, provider count, trial length, and how efficiency was judged.
4. **EMR template generator:** fine-tuning or prompt examples? Plus tools, dates, and users.
5. **wstruve.com:** Codex refreshed the copy, but as of October 16, 3:30 pm PT the live site still shows:
   - the eClinicalWorks claim
   - "Software Developer, 10/24 – Present"
   - Lepow "6/19 – 4/19"

   Deploy it.
