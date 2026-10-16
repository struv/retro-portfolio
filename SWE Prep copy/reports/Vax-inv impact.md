**Kids & Teens Medical Group vaccine inventory application — résumé impact evidence**

The available evidence supports recorded inventory activity in **21 documented clinics during September 2026**, and **22 documented clinics across retained history through September**. It does **not yet verify “actively used across 25 clinics.”** The live application exposes more location entries than the stated clinic count. Its current inventory is a snapshot, so September activity overwritten by later edits cannot be recovered from that snapshot.

This report contains aggregate figures only. Production was not changed. No workbook, raw inventory records, submitter values, resource identifiers, or credentials were exported. Source values were processed transiently in memory. Only the aggregate result and reproduction script were saved locally.

**Reporting windows**

- **September:** September 1–30, 2026, America/Los_Angeles (PDT, UTC−07:00). Filter: `2026-09-01T07:00:00Z <= timestamp < 2026-10-01T07:00:00Z`.
- **Fallback:** September 13–October 12, 2026, America/Los_Angeles. This is the latest complete 30 local calendar days as of collection. Filter: `2026-09-13T07:00:00Z <= timestamp < 2026-10-13T07:00:00Z`.
- **Snapshot:** October 13, 2026, 15:06:43–15:07:17 PDT (22:06:43–22:07:17 UTC). Inventory reads were sequential and do not constitute an atomic workbook snapshot.
- **Retained history through September:** all surviving edit timestamps before October 1, 2026, 00:00 PDT. The earliest surviving timestamp is March 24, 2026, 12:39:24 PDT. This is not a verified launch date or the start of complete logging.

**Configuration and retained adoption**

| Metric and definition | Figure | Reporting dates | Denominator / population | Source and reproducible calculation | Limitations |
| --- | ---: | --- | --- | --- | --- |
| Exposed location entries: entries returned by the live location selector API | 27 | Snapshot | All returned location entries | Q1: `locations.length` | The API omits the Activity Log. Entries can include tests and are not automatically verified clinics. Location list can be cached for up to 24 hours. |
| Known test locations excluded | 1 | Snapshot | 27 exposed entries | Q1: match the documented test worksheet against the returned entries | Excludes the known test location only. There is no comprehensive production-test flag. |
| Non-test configured location candidates | 26 | Snapshot | 27 entries less 1 known test | Q1: normalize and deduplicate location names, then remove the documented test entry | A current configuration count, not a September clinic count or an adoption count. |
| Candidates matching the documented clinic list | 22 | Snapshot | 26 non-test candidates | Q5: count normalized location names present in the project documentation's clinic list | Documentation may be outdated. It is not an approved September clinic roster. |
| Other configured candidates needing roster reconciliation | 4 | Snapshot | 26 candidates | Q5: `26 - 22` | May include newer clinics, aliases, or other non-clinic entries. Their status is unverified. |
| Duplicate configured entries after name normalization | 0 | Snapshot | 27 entries | Q1: `locations.length - distinct(normalized_locations).size` | Does not identify different names for the same physical clinic. |
| Configured clinics during September | Unavailable | September | Approved clinic roster effective during September | Requires dated configuration history and clinic mapping | Current worksheets cannot establish how many clinics were configured during September. The user-supplied count of 25 remains unverified. |
| Clinics with retained September edit evidence: at least one surviving `lastEdited` timestamp in the period | 21 documented clinics; 22 non-test location candidates total | September, observed at Snapshot | Searched all 26 current candidates; documented subset contains 22 | Q2: count distinct locations with a qualifying timestamp; Q5 restricts to documented clinics | Minimum observed timestamp coverage, conditional on genuine operational saves. Later edits and deleted rows erase evidence. Test saves on real clinic worksheets cannot be fully excluded. Absence of a surviving timestamp does not prove inactivity. |
| Cumulative clinic adoption evidence: at least one surviving edit timestamp before the end of September | 22 documented clinics; 24 non-test candidates total | Retained history through September | 26 current candidates; documented subset contains 22 | Q2 with no September lower bound, upper bound at October 1; Q5 for documented subset | Retained adoption evidence, not an all-time event total. Earlier deleted/overwritten evidence and former clinics are unavailable. Does not establish repeat or ongoing use. |
| Current persisted inventory row instances returned by the app | 941 | Snapshot | All 26 non-test location candidates | Q2: `sum(inventory.rows.length)` | Inventory rows are vaccine/lot entries, not doses or transactions. Uses the API's row filters. Includes unreconciled candidates. |

No adoption percentage is reported: the September configured-clinic denominator is unavailable, and the current candidate count is not a verified clinic roster.

**September activity and outcomes**

| Metric and definition | Figure | Reporting dates | Denominator / population | Source and reproducible calculation | Limitations |
| --- | ---: | --- | --- | --- | --- |
| Active users: distinct authenticated people performing an operational action | Unavailable | September | Authenticated identities with qualifying actions | Would require identity-linked activity records | The inspected workflow uses a free-text submitter field. It does not establish unique authenticated users or distinguish views from saves. |
| Submitter-label proxy: distinct nonblank `editedBy` values on rows with retained September timestamps | 30 labels; 29 within documented clinics | September, observed at Snapshot | Matching retained rows in 26 candidates; documented subset separately | Q3: count distinct normalized editor labels after the Q2 date filter | Not a unique-person count. Case and whitespace variants are normalized; spelling variants, shared labels and test submitters remain possible. No names are disclosed. |
| Inventory updates: confirmed successful saves that actually add, modify or remove inventory data, excluding unchanged saves | Unavailable | September | Operational, deduplicated saves with verifiable changes | Requires the Activity Log plus reliable change evidence or before/after inventory versions | Snapshot timestamps cannot reconstruct save events. The available log-writing code does not reliably measure real changes. |
| Retained edit groups: distinct location + `lastEdited` timestamp pairs still present | 76 groups; 72 within documented clinics | September, observed at Snapshot | Matching retained rows | Q4: count distinct `(normalized_location, parsed_timestamp)` pairs | Not a submission total, dose count, or verified change count. One save can retain older timestamps alongside new ones; later saves overwrite groups. Repeated saves can restamp rows. |
| Rows whose most recent retained edit timestamp falls in September | 302 row instances | September, observed at Snapshot | Matching rows within the 941 current row instances | Q2: count rows satisfying the September timestamp filter | Not 302 historical inventory updates. Each row exposes only its latest retained timestamp. Real changes and no-op restamps cannot be separated. |
| Dose transactions: distinct receipts, administrations, transfers, wastage or adjustments, with event type and dose quantity | Unavailable | September | Operational dose ledger events | Requires a dated, deduplicated dose transaction ledger | The inspected model stores an on-hand balance. It lacks transaction type, quantity delta and before/after balances. Summing on-hand values would measure stock, not transactions. |
| Measured time savings: observed reduction in time for comparable inventory tasks | Unavailable / unmeasured | September | Matched tasks with before/after timing and sample sizes | No accessible time study or baseline/post-implementation timing evidence found | Features and submission volume do not establish time saved. |
| Error reduction: change in independently measured inventory error rates | Unavailable / unmeasured | September | Errors divided by audited inventory operations in each comparison period | No accessible baseline/post-implementation audit evidence found | Validation exists, but users can override warnings. Validation availability does not establish prevented errors. |
| Avoided shortages: independently documented shortage cases prevented by an intervention | Unavailable / unmeasured | September | Reviewed shortage-risk cases with documented intervention and outcome | No accessible intervention/outcome evidence found | Current balances and inventory visibility do not establish avoided shortages. |

**Fallback activity**

The complete September Activity Log was unavailable through the existing read-only access. The fallback period is also missing complete audit access. The following are therefore retained snapshot measures, not a replacement set of complete monthly totals.

| Metric and definition | Figure | Reporting dates | Denominator / population | Source and calculation | Limitations |
| --- | ---: | --- | --- | --- | --- |
| Locations with retained edit timestamps | 22 documented clinics; 23 non-test candidates total | Fallback | All 26 current candidates; documented subset separately | Q2 and Q5 with fallback bounds | Same timestamp-overwrite and test-save limitations as September. |
| Distinct retained submitter labels | 32 labels; 31 within documented clinics | Fallback | Matching retained rows | Q3 with fallback bounds | Not authenticated users. |
| Distinct retained location/timestamp groups | 87 groups; 83 within documented clinics | Fallback | Matching retained rows | Q4 with fallback bounds | Not verified inventory-update or submission totals. |
| Rows with a latest retained timestamp in the period | 583 row instances | Fallback | Matching rows within 941 current row instances | Q2 with fallback bounds | Current surviving rows only, not historical changes. |

**Sources, access and calculations**

The production deployment's recorded source commit matches the local repository HEAD. The existing dirty working tree was preserved. The relevant inventory-read, timestamp and log-writing logic was inspected against the committed implementation. The collector calls only `GET /api/locations` and `GET /api/inventory` for inventory evidence. It does not call diagnostic routes, save routes or workbook session creation.

Source references:

- Live production location and inventory GET responses, collected during Snapshot. Their raw contents were not saved.
- `api/index.ts`, location filtering/cache, inventory reading, inventory save and Activity Log writer. The writer appends timestamp, location, free-text submitter, row counts and a summary after saving inventory. Logging errors are non-fatal.
- `client/src/form-state.ts`, `rowChanged` and `collectPayload`. Changed rows receive a client-generated timestamp. Change detection compares with the loaded snapshot; repeated saves can restamp rows that still differ from that snapshot.
- `CLAUDE.md`, documented clinic list and known test-location designation. The clinic list has not been validated against a dated operational roster.
- Repository commit messages contain explicit AI-tool references. They support describing development as AI-assisted but do not establish the user's personal ownership, review, testing or rollout work.

The existing Vercel session allowed production resolution and a read-only environment access check, but the production secret needed for direct workbook access was not returned. No connected Excel document session was available. The Activity Log was not retrieved. The inventory-read route does not expose the log's schema. This is an access limitation, not evidence of zero logged activity. Vercel's read endpoint is documented in its [environment-variable API reference](https://vercel.com/docs/rest-api/projects/retrieve-the-environment-variables-of-a-project-by-id-or-name).

`reproduce-impact-snapshot.mjs` contains the executable calculation. Run from the repository root:

```sh
node reports/reproduce-impact-snapshot.mjs
```

It uses the existing local Vercel session to resolve the production origin, processes responses in memory, and prints aggregates only. It never fetches Azure credentials. Re-running against live inventory can produce different figures because historical timestamps are overwritten. The saved aggregate JSON preserves this collection's results without retaining source records.

The calculation definitions are:

```text
Q1
  GET {production_origin}/api/locations
  normalize = Unicode NFKC + trim + collapse whitespace + uppercase
  candidates = distinct(normalized locations) minus documented test location

Q2
  For each candidate, GET /api/inventory?location={candidate}
  Timestamp = timezone-qualified ISO timestamp, or Excel serial converted to UTC
  Reject blank, unparseable, timezone-ambiguous and future timestamps
  qualifying_rows = rows where period_start <= lastEdited < period_end
  active_timestamp_locations = COUNT DISTINCT location in qualifying_rows
  retained_row_instances = COUNT qualifying_rows
  current_row_instances = SUM returned row counts across candidates

Q3
  COUNT DISTINCT normalized nonblank editedBy within qualifying_rows
  Return only the count; do not output labels, hashes or per-user breakdowns

Q4
  COUNT DISTINCT (normalized location, parsed lastEdited) in qualifying_rows

Q5
  Restrict Q1–Q4 to normalized locations matching the documented clinic list
```

All 26 candidate inventory reads succeeded, and the returned location list was unchanged during collection. Among the 941 returned rows, there were zero missing timestamps, zero unparseable/timezone-ambiguous timestamps, zero future timestamps and zero rows carrying the committed diagnostic writer's exact test-submitter marker. September's 302 retained rows had zero exact duplicates and zero missing submitter labels. These checks validate the snapshot calculations, not complete historical coverage or real-person identity.

Exact row duplicates were checked using location, returned inventory fields, parsed timestamp and normalized submitter. Rows were not collapsed merely because they share a vaccine or lot: those can represent legitimate separate inventory entries. Distinct location/timestamp groups already avoid counting repeated row copies as separate groups. Name normalization cannot detect clinic aliases or all test activity.

If the Activity Log becomes readable using an existing authorized session, a reproducible **logged-submission** calculation would select its dated rows, restrict to an approved clinic roster, exclude documented diagnostic/test entries, remove exact duplicate complete log rows, and count the remaining rows in the reporting window. Count distinct clinic mappings for save activity. Distinct normalized submitter strings would remain a proxy. This calculation was **not run**. Without an event identifier, duplicate-like legitimate saves and retries can remain ambiguous. Because logging is non-fatal, even that result could undercount successful saves.

Do not sum the log's `Rows Changed` as verified updates: the writer counts rows sharing the payload's newest retained timestamp even when an unchanged save preserves old timestamps. Deletions are not reliably represented by that measure. True change counts require before/after evidence or a trustworthy change ledger. No production instrumentation was added.

**Proposed résumé bullets — confirm personal contribution before use**

These are alternative drafts, not independently verified attribution. “Built,” “maintained” and “implemented” require confirmation that the user owned those activities. AI-assisted describes the implementation process supported by repository evidence; it does not establish how much code the user personally wrote or whether the user personally reviewed and tested it.

- Built and maintained an AI-assisted vaccine inventory application for Kids & Teens Medical Group, with recorded inventory activity across 22 documented clinics in retained history through September 2026.
- Implemented SharePoint/Excel inventory workflows using AI-assisted development, supporting 941 current inventory records and recorded September 2026 activity in 21 documented clinics.

The first draft uses cumulative adoption evidence. The second combines an October inventory snapshot with September activity, so preserve those date distinctions when discussing it. Use “25 clinics” only after reconciling the approved roster and verifying the intended adoption period. Avoid unique-user, dose-transaction, time-savings, error-reduction and shortage-prevention claims until the corresponding evidence is available.
