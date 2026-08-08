# Overnight Run Plan

## Objective

2026年8月1日10:00 JSTまで、国内外を問わず、写真コンテスト／写真オープンコールの現行または次回募集を公式一次情報で調査する。候補は締切、応募対象、撮影地・作品条件、提出方法、加工・権利の確認状態を分けて記録し、既存データと重複しないものだけを追加候補として残す。

## Scope

- Working directory: `/Users/arata/Library/Mobile Documents/com~apple~CloudDocs/claude code files/app-dev/photo-contest-monosashi`
- Writable paths: `overnight-runs/2026-07-31-photo-contest-research-to-1000/`、および条件が十分に取得できた場合に限る `data/domestic-opportunities.json`、`data/worldwide-opportunities.json`、`scripts/audit-opportunities.mjs`、`tests/rendered-html.test.mjs`、`quality/artifact.json`、`public/quality-report.html`
- Baseline: `main` at `827c639`、2026-07-31 01:42 JST時点で作業ツリーはクリーン
- Canonical data: `data/*-opportunities.json`。未確認候補はこの実行台帳の `CANDIDATES.md` にのみ残す

## Definition of Done

- 公式主催者・自治体・公的機関・公式コンテスト運営者の一次情報だけを使った候補台帳を作成する。
- 追加する各ルートは、既存ID／タイトル／公式URLとの重複を確認し、8つの根拠セルを明示する。
- 2026年8月1日10:00 JSTに、監査・ビルド・テスト・差分確認を行い、朝レポートを完成させる。

## Allowed Actions

- プロジェクトと適用指示、Git状態、既存データ、公式サイト・公式PDFを読み取る。
- 公式一次情報の候補を `CANDIDATES.md` へ追記する。
- 8根拠セルとデータ契約を満たし、既存データと重複しない候補だけを既存JSONへ追加する。
- `npm run audit:data`、`npm run report:quality`、`npm run lint`、`npm test`、`git diff --check`を実行する。

## Prohibited Actions

- push、commit、deploy、公開、外部メッセージ、購入、アカウント変更、秘密情報変更をしない。
- ユーザーデータ、iCloud競合コピー、既存の公募レコードを削除・巻き戻ししない。
- 公式情報で確認できない締切時刻、応募料、居住地条件、AI・加工、権利、併願条件を推測で補わない。
- サブエージェントは起動しない。

## Stop Conditions

- 基準外の変更が同じ対象ファイルに現れた場合、そのファイルへの書き込みを止め、台帳へ記録する。
- 公式一次情報が取得できない、規約が不完全、または既存データと重複する候補は canonical data に加えず、理由とともに台帳へ残す。
- 方向性・費用・公開判断が必要になった場合は決めず、朝レポートの判断事項へ残す。

## Team

- Coordinator / Explorer / Writer / Verifier: 単独のCodexが順番に担当する。ユーザー承認なしのサブエージェントは使わない。

## Verification

- 各波で `git status --short`、JSON構文、既存ID・公式URL重複、`npm run audit:data`を確認する。
- データを変更した波では `npm run report:quality` と該当テストを追加する。
- 最終波では `npm run lint`、`npm test`、`git diff --check`、`python3 /Users/arata/.codex/skills/overnight-project-runner/scripts/validate_run.py overnight-runs/2026-07-31-photo-contest-research-to-1000 --final` を実行する。
