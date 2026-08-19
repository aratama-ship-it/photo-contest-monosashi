# Overnight Run State

## Status

- Status: COMPLETE
- Last updated: 2026-08-19 23:17 JST
- Current wave: complete — official-source expiry refresh and final validation

## Baseline

- Branch: main
- HEAD: 729af60dc95bb1ef7c16c0198730625558d7826f
- Worktree: five pre-existing modified files; preserved as the run baseline
- Current routes: 137 after pre-existing removal of JPS Nonfiction 2026 and LensCulture Photobook Prize 2026
- Remaining expired routes: 10
- data/opportunities.json: 821c7dd43e827ff285c49b4ad7b6449f254dde3a58fb50d209aa134046e49c78
- data/social-opportunities.json: fdc7fcf42fb64ed0cce28f574a03dc817b77d4956981099320287778b2f41f04
- data/domestic-opportunities.json: 62c26a8eeba9ad976f43c0a46dbb035147e8d3d7499b52351a4d2ef3f583a795
- data/worldwide-opportunities.json: 3c7811edef57d49819c669e693aea760bb86a5b5dbb3be7b2ce683a4dad1152d
- scripts/audit-opportunities.mjs: 2e841662b19ca01e5dae7e340c0b238e90c4b8ba3502269607dbb1d4ac553e6f
- tests/rendered-html.test.mjs: 84e6c56258d295b7227155755cc3e566a6589679523a91f55838c97d3b3f3fc7
- public/quality-report.html: 71be15e0d259f3f1337f8c3b4a9e84399d63a8604ab3c88be05c8a90cce3bbb4

## Completed Waves

- Captured and audited the pre-existing dirty baseline.
- Checked all 10 remaining expired routes against current official sources.
- Removed nine expired editions from the current canonical lists.
- Advanced the monthly Nakatsu route from July to August.
- Added the current official Ibaraki natural-environment route, restoring 47/47 prefecture coverage.
- Repaired the quality-report generator so evidence coverage is calculated from current canonical data rather than the stale quality artifact.
- Minimized canonical JSON formatting churn while retaining the pre-existing semantic changes.
- Completed the full audit, report generation, production build, rendered-HTML test, lint, duplicate-ID check, expiry check, and diff check.

## Current Wave

- None. The safe local batch is complete.

## Next Action

- Proceed to collection queue item 4, `mie-event-monosashi`.

## Blockers

- European Photography Awards now advertises 2027 as open while listing an April–July 2027 entry period. Remove the expired 2026 route and stage the 2027 page as a temporal-conflict hold.
- No blocking issue for this completed batch.
