import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dataFiles = [
  "data/opportunities.json",
  "data/worldwide-opportunities.json",
  "data/social-opportunities.json",
  "data/domestic-opportunities.json",
];
const [artifact, ...groups] = await Promise.all([
  readFile(new URL("quality/artifact.json", root), "utf8").then(JSON.parse),
  ...dataFiles.map((path) => readFile(new URL(path, root), "utf8").then(JSON.parse)),
]);
const opportunities = groups.flat();
const domestic = groups.at(-1);
const evidenceRows = artifact.snapshot.datasets.evidence_states;
const localRoutes = domestic.filter((item) => item.shootingPrefectures?.length);
const coveredPrefectures = [...new Set(localRoutes.flatMap((item) => item.shootingPrefectures))];
const totalCells = evidenceRows.reduce((sum, row) => sum + row.cell_count, 0);
const coveredCells = evidenceRows
  .filter((row) => row.evidence_state === "explicit" || row.evidence_state === "conditional")
  .reduce((sum, row) => sum + row.cell_count, 0);
const coveragePercent = Number((coveredCells / totalCells * 100).toFixed(1));
const remainingPrefectureCount = 47 - coveredPrefectures.length;
const latestAuditRouteIds = new Set([
  "nipponkodo-bonphoto-2026",
  "yumenoshima-photo-contest-2026",
  "kanazawa-matsuri-fireworks-photo-contest-52",
  "monovisions-single-2027",
  "graphis-photography-awards-2027",
  "form-photo-award-unseen-2027",
  "sakai-asean-photo-contest-2026",
  "nihonkai-parkline-photo-contest-2026",
  "head-on-photo-awards-2026",
  "international-212-photography-competition-2026",
  "gose-tourism-photo-contest-38",
  "shimoyama-photo-contest-2026",
  "aizuwakamatsu-takara-sagashi-photo-contest-2026",
]);
const latestAuditRoutes = opportunities.filter((item) => latestAuditRouteIds.has(item.id));
const coverageNote = remainingPrefectureCount === 0
  ? "47都道府県すべてで、少なくとも1件の現行または次回募集を確認しました。これは全件収録の宣言ではなく、終了後に次回の公式募集へ差し替えるための更新台帳です。"
  : `色のない${remainingPrefectureCount}県は「公募なし」ではなく、現行募集を未収録・確認中です。県が一致しても、市町村・祭り・河川・海辺などの細かな撮影範囲は各公式要項で再確認します。`;
const nextScope = remainingPrefectureCount === 0
  ? "次は小規模自治体・広域テーマ・国際公募の締切を月次で再確認し、終了した募集を次回の公式発表へ差し替えます。あわせて、規約PDFだけに残る応募資格・発表歴・加工・権利の未確認セルを優先して補います。"
  : `残る${remainingPrefectureCount}県を、北陸・甲信、近畿、中国・四国、九州の順で追います。締切が近い募集は終了後に現行リストから外し、同じ県の次回募集へ入れ替えます。`;

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const chartRows = evidenceRows.map((row) => `
  <div class="bar-row">
    <div class="bar-label"><b>${escapeHtml(row.state_label)}</b><span>${row.cell_count}セル・${row.share_percent}%</span></div>
    <div class="bar-track" aria-hidden="true"><span style="width:${row.share_percent}%"></span></div>
    <small>${escapeHtml(row.screen_treatment)}</small>
  </div>`).join("");

const routeRows = latestAuditRoutes.map((route) => {
  const kind = route.opportunityKind === "curation"
    ? "キュレーション"
    : route.opportunityKind === "challenge"
      ? "チャレンジ"
      : "コンテスト";
  const region = route.shootingPrefectures?.join("・") ?? route.organizerRegion ?? "—";
  const location = route.shotLocationRule
    ?? (route.applicantScope === "worldwide" ? "世界から応募可。撮影地・撮影日の条件は要項で確認" : "撮影地条件は公式要項で確認");
  return `
    <tr>
      <td><span class="kind">${escapeHtml(kind)}</span><a href="${escapeHtml(route.sourceUrl)}">${escapeHtml(route.title)}</a></td>
      <td>${escapeHtml(region)}</td>
      <td>${escapeHtml(route.deadlineLabel)}</td>
      <td>${escapeHtml(location)}</td>
      <td>${route.rightsPolicy === "explicit" ? "確認済み" : "要確認"}</td>
    </tr>`;
}).join("");

const prefectureChips = coveredPrefectures
  .map((prefecture) => `<li>${escapeHtml(prefecture)}</li>`)
  .join("");

const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>写真コンテストものさし 精度監査</title>
  <style>
    :root { --paper:#f4efe3; --ink:#27251f; --muted:#6f695d; --line:#bdb4a4; --rust:#a8442f; --green:#315e4a; --white:#fffdf7; }
    * { box-sizing:border-box; }
    body { margin:0; color:var(--ink); background:var(--paper); font-family:"Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif; line-height:1.75; }
    a { color:var(--rust); text-underline-offset:3px; }
    header, main, footer { width:min(1080px,calc(100% - 36px)); margin-inline:auto; }
    header { padding:56px 0 32px; border-bottom:2px solid var(--ink); }
    header p { margin:0 0 8px; color:var(--rust); font:700 12px/1.4 ui-monospace,monospace; letter-spacing:.12em; }
    h1 { max-width:760px; margin:0; font-family:serif; font-size:clamp(36px,7vw,72px); line-height:1.06; letter-spacing:-.04em; }
    header div { display:flex; justify-content:space-between; gap:24px; align-items:end; margin-top:28px; color:var(--muted); }
    header div span:last-child { text-align:right; }
    main { padding:34px 0 72px; }
    section { margin-top:54px; }
    h2 { margin:0 0 18px; padding-bottom:10px; border-bottom:1px solid var(--line); font-size:22px; }
    .lede { max-width:820px; margin:0; font-size:17px; }
    .metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); border-top:1px solid var(--ink); border-left:1px solid var(--ink); margin-top:30px; }
    .metrics div { min-height:132px; padding:18px; border-right:1px solid var(--ink); border-bottom:1px solid var(--ink); background:rgba(255,253,247,.42); }
    .metrics b { display:block; font:700 42px/1 ui-monospace,monospace; }
    .metrics span { display:block; margin-top:12px; color:var(--muted); font-size:12px; }
    .bar-chart { display:grid; gap:17px; padding:24px; border:1px solid var(--line); background:var(--white); }
    .bar-row { display:grid; grid-template-columns:190px 1fr 180px; align-items:center; gap:14px; }
    .bar-label { display:flex; justify-content:space-between; gap:8px; font-size:13px; }
    .bar-label span, .bar-row small { color:var(--muted); font-size:11px; }
    .bar-track { height:17px; background:#e2dccf; }
    .bar-track span { display:block; height:100%; background:var(--green); }
    .prefectures { display:flex; flex-wrap:wrap; gap:7px; padding:0; list-style:none; }
    .prefectures li, .kind { padding:4px 8px; border:1px solid var(--line); background:var(--white); font-size:11px; }
    .table-wrap { overflow-x:auto; border:1px solid var(--line); background:var(--white); }
    table { width:100%; min-width:940px; border-collapse:collapse; font-size:12px; }
    th, td { padding:12px 14px; border-bottom:1px solid #ded7ca; text-align:left; vertical-align:top; }
    th { color:var(--muted); font:700 11px/1.4 ui-monospace,monospace; letter-spacing:.05em; }
    td:first-child { min-width:245px; }
    td:first-child a { display:block; margin-top:7px; font-weight:700; }
    .note { padding:18px 20px; border-left:4px solid var(--rust); background:#fff7e8; }
    .note b { color:var(--rust); }
    footer { padding:24px 0 40px; border-top:1px solid var(--line); color:var(--muted); font-size:12px; }
    @media (max-width:760px) {
      header div { display:grid; }
      header div span:last-child { text-align:left; }
      .metrics { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .bar-row { grid-template-columns:1fr; gap:7px; }
    }
  </style>
</head>
<body>
  <header>
    <p>DATA QUALITY / 2026-07-31</p>
    <h1>写真コンテストものさし 精度監査</h1>
    <div><span>地方の小規模公募を、公式要項の確認状態ごと記録する。</span><span><a href="/">ものさしへ戻る</a></span></div>
  </header>
  <main>
    <p class="lede">夜間の公式再確認で、Instagram投稿型2件と郵送型1件を追加しました。日本香堂の盆フォト、夢の島熱帯植物館、横浜市金沢区の募集について、応募資格、発表歴、加工、権利を分けて記録し、書かれていない条件は「要確認」のまま残しています。</p>
    <div class="metrics" aria-label="監査指標">
      <div><b>${opportunities.length}</b><span>固定締切の応募ルート</span></div>
      <div><b>${domestic.length}</b><span>国内ルート</span></div>
      <div><b>${coveredPrefectures.length}/47</b><span>現行公募を確認した都道府県</span></div>
      <div><b>${coveragePercent}%</b><span>明示・条件付き根拠セル</span></div>
    </div>

    <section>
      <h2>${totalCells}条項セルの確認状態</h2>
      <div class="bar-chart" role="img" aria-label="応募ルートの根拠状態別セル数">${chartRows}</div>
      <p>明示・条件付き記載は${coveredCells}セル。残る${totalCells - coveredCells}セルは公式内不一致、日付のみ確認、未記載、未調査として安全側へ送ります。</p>
    </section>

    <section>
      <h2>地域限定ルートの確認範囲</h2>
      <ul class="prefectures">${prefectureChips}</ul>
      <p>${coverageNote}</p>
    </section>

    <section>
      <h2>夜間公式再確認で追加した${latestAuditRoutes.length}ルート</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>募集</th><th>撮影県／主催地域</th><th>締切</th><th>撮影地・応募範囲</th><th>権利条項</th></tr></thead>
          <tbody>${routeRows}</tbody>
        </table>
      </div>
    </section>

    <section class="note">
      <b>母数を広げても、未取得の規約は○にしない</b>
      <p>Instagram投稿型、地域観光型、国際アップロード型は、募集ページに対象地・期間・応募導線だけが掲載され、権利、発表歴、併願、AI・加工の全条項がPDFや応募画面に分かれることがあります。空欄を推測で埋めず、取得できないセルは「要確認」のまま残しています。</p>
    </section>

    <section>
      <h2>次の調査範囲</h2>
      <p>${nextScope}</p>
    </section>
  </main>
  <footer>公開情報の固定スナップショットです。応募前の最終判断は、表内リンク先の主催者公式要項で行ってください。</footer>
</body>
</html>`;

await writeFile(new URL("public/quality-report.html", root), html);
console.log(JSON.stringify({
  routes: opportunities.length,
  domestic: domestic.length,
  coveredPrefectures: coveredPrefectures.length,
  evidenceCoverage: `${coveredCells}/${totalCells}`,
  output: "public/quality-report.html",
}, null, 2));
