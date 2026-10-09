# Client dashboards

A dashboard in the client portal (`/client/projects/<id>/dashboard`) built from
the client's own files. Arabella Women's Health was the first.

How one is made:

1. **Analyse.** Run the generic analysers on the client's files. They write
   aggregate facts only; names, numbers and addresses never leave the script.
   - `analyse_ledger.py <ledger.xlsx> <ledger.json>`: a sales ledger with a sheet per month
   - `analyse_directory.py <directory.csv> <directory.json>`: a patient directory export
   - `export-surveys.ts <slug-prefix> <surveys.json>`: the audit survey responses
   Run the Python with `-I` from a venv holding `openpyxl`, and keep the
   client's files and the facts in a scratch directory, never in the repo.
2. **Compose.** Write `build_<client>.py`, copying `build_arabella.py`. This is
   the only client-specific part: which figures matter and what they mean.
   Output follows `lib/client-dashboard/types.ts`.
3. **Save a draft.** `save-draft.ts <engagementId> <dashboard.json> "<title>" <asOf> "<source>"`.
4. **Review and publish** at `/admin/client-dashboards`. Only a PARTNER or
   ADMIN can publish, publishing supersedes the previous version, and the
   client sees nothing until then.

Rules the renderer and the composer both keep: aggregates only; no survey
statement with fewer than five answers; every finding names its source; the
copy is written to the client's leadership and describes the business, never
a person. Every enabled portal contact on the client sees the dashboard.
