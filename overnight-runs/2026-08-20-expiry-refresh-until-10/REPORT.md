# Morning Report

## Outcome

Completed locally. No push, deploy, or publication was performed.

## Changes

- Preserved the five-file dirty baseline and its semantic changes: two prior expired-route removals, the Head On deadline/fee extension, and HIPA/Nippon Kodo verification refreshes.
- Rechecked the 10 remaining expired routes against current official sources.
- Removed nine ended 2026 routes: TIFA Professional/Non-Professional, BIFA Professional/Non-Professional, Hinuma, Shimane Forest, Ichikikushikino, European Photography Awards, and UNESCO Youth Eyes on the Silk Roads.
- Replaced Nakatsu's July route with the current August monthly route.
- Added `ibaraki-natural-environment-photo-contest-2026` from the current official organizer page, returning the live list to 47/47 prefecture coverage.
- Updated the live audit invariants and report/test expectations to 129 current routes.
- Changed the quality-report generator to calculate evidence-state totals from the current four canonical datasets; the stale artifact remains metadata-only.
- Reduced bulk JSON reformatting to a reviewable semantic diff.

## Verification

- `npm test`: passed (data audit, quality report, production build, two rendered-HTML/data tests).
- `npm run lint`: passed.
- `git diff --check`: passed.
- Canonical audit: 129 routes, 94 domestic, 35 international, 76 prefecture routes, 47/47 prefectures, 105 official hosts.
- Evidence coverage: 701/1032 cells (67.9%).
- Duplicate IDs: 0.
- Deadlines at or before the 2026-08-19 23:05 JST check instant: 0.
- Protected `data/social-opportunities.json` hash remains `fdc7fcf42fb64ed0cce28f574a03dc817b77d4956981099320287778b2f41f04`.

## Pre-existing State Preserved

- The initial five modified files and their hashes remain recorded in STATE.md.
- Pre-existing changes remain present and are separated from this run's nine removals, one monthly replacement, and one current-route addition.

## Unverified States

- European Photography Awards 2027 remains staging-only because its “now open” claim conflicts with its published April–July 2027 entry period.

## Blockers

- None.

## Morning Decisions

- Decide later whether to promote European Photography Awards 2027 after its published 2027 entry window begins or the organizer corrects the current page. No decision is required now.
