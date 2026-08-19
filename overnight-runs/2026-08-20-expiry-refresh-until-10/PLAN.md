# Overnight Run Plan

## Objective

Resolve every fixed-deadline photo-contest route whose stored deadline has passed by 2026-08-19, while preserving the five pre-existing working-tree changes and staging ambiguous next editions instead of guessing.

## Scope

- Working directory: /Users/arata/Library/Mobile Documents/com~apple~CloudDocs/claude code files/web-projects/monosashi/photo-contest-monosashi
- Branch and HEAD: main / 729af60dc95bb1ef7c16c0198730625558d7826f
- Initial worktree: dirty in data/domestic-opportunities.json, data/worldwide-opportunities.json, public/quality-report.html, scripts/audit-opportunities.mjs, and tests/rendered-html.test.mjs
- Writable paths: canonical opportunity files, their audit/test count assertions, quality report, and this run ledger
- Current dirty-state hashes are recorded in STATE.md and treated as the protected baseline.

## Definition of Done

- No canonical fixed-deadline route has a deadline at or before the 2026-08-19 check instant.
- Officially ended editions are removed from the open-route library without inventing successor details.
- The recurring Nakatsu route advances from July to the current August round using the city's published monthly rule.
- Audit, report generation, lint, build, rendered tests, semantic scope audit, duplicate audit, and diff checks pass.

## Allowed Actions

- Read current official organizer, municipality, prefecture, and UNESCO sources.
- Remove expired open-only routes from the canonical fixed-deadline library.
- Advance Nakatsu's current monthly route from July to August using the official monthly-end rule.
- Update directly coupled audit/test/report expectations.

## Prohibited Actions

- No push, deploy, publish, external message, purchase, secret change, or destructive cleanup.
- Do not overwrite or revert the initial five-file dirty baseline.
- Do not add European Photography Awards 2027 while its page says open but publishes an April–July 2027 entry schedule that has not started.
- Do not infer renewed editions from historical patterns.

## Stop Conditions

- Hard stop at 2026-08-20 10:00 JST; no new wave after 09:30 JST.
- Hold conflicting or temporally inconsistent official pages outside canonical data.

## Team

- Coordinator, collector, writer, verifier: root agent.
- Single writer for canonical data.

## Verification

- npm run audit:data
- npm run report:quality
- npm run lint
- npm run build
- node --test tests/rendered-html.test.mjs
- semantic changed-ID audit and expired-route audit
- duplicate ID audit
- git diff --check
