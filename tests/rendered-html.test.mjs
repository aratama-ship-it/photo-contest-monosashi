import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the photo contest matching experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="ja"/i);
  assert.match(html, /写真コンテストものさし/);
  assert.match(html, /この一枚を、[\s\S]*どこへ出せるか/);
  assert.match(html, /写真は任意です/);
  assert.match(html, /世界から応募できる賞・オープンコール/);
  assert.match(html, /106[\s\S]{0,20}の応募ルート/);
  assert.match(html, /応募候補/);
  assert.match(html, /地方公募の調査台帳/);
  assert.match(html, /確認済みの都道府県/);
  assert.match(html, /未収録・確認中/);
  assert.match(html, /北海道/);
  assert.match(html, /長崎県/);
  assert.match(html, /フォーム以外の入口/);
  assert.match(html, /11[\s\S]{0,80}週次・月次・常設入口/);
  assert.match(html, /使える見込み/);
  assert.match(html, /NatGeo Your Shot/);
  assert.match(html, /#PhotoVogueMonday/);
  assert.match(html, /Flickr Friday/);
  assert.match(html, /LFI Gallery/);
  assert.match(html, /VIEWBUG/);
  assert.match(html, /過去作を読む手掛かり/);
  assert.match(html, /\/og\.png/);
  assert.doesNotMatch(html, /react-loading-skeleton|codex-preview|Starter Project/);
});

test("seed data keeps application routes and evidence auditable", async () => {
  const [opportunitiesText, worldwideText, socialText, domesticText, discoveryText, trendsText, page, layout, packageJson, qualityReport] =
    await Promise.all([
      readFile(new URL("../data/opportunities.json", import.meta.url), "utf8"),
      readFile(new URL("../data/worldwide-opportunities.json", import.meta.url), "utf8"),
      readFile(new URL("../data/social-opportunities.json", import.meta.url), "utf8"),
      readFile(new URL("../data/domestic-opportunities.json", import.meta.url), "utf8"),
      readFile(new URL("../data/discovery-channels.json", import.meta.url), "utf8"),
      readFile(new URL("../data/trends.json", import.meta.url), "utf8"),
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../package.json", import.meta.url), "utf8"),
      readFile(new URL("../public/quality-report.html", import.meta.url), "utf8"),
    ]);
  const opportunities = JSON.parse(opportunitiesText);
  const worldwide = JSON.parse(worldwideText);
  const social = JSON.parse(socialText);
  const domestic = JSON.parse(domesticText);
  const discovery = JSON.parse(discoveryText);
  const trends = JSON.parse(trendsText);

  assert.equal(opportunities.length, 16);
  assert.equal(worldwide.length, 14);
  assert.equal(social.length, 2);
  assert.equal(domestic.length, 74);
  assert.equal(discovery.length, 11);
  const allOpportunities = [...opportunities, ...worldwide, ...social, ...domestic];
  assert.equal(new Set(allOpportunities.map((item) => item.id)).size, 106);
  assert.ok(allOpportunities.every((item) => ["2026-07-23", "2026-07-24"].includes(item.verifiedAt)));
  assert.ok(allOpportunities.every((item) => item.sourceUrl.startsWith("https://")));
  assert.ok(allOpportunities.every((item) => !Number.isNaN(Date.parse(item.deadline))));
  assert.ok(allOpportunities.every((item) => Object.keys(item.evidence).length === 8));
  assert.ok(worldwide.every((item) => item.applicantScope === "worldwide"));
  assert.ok(worldwide.every((item) => item.entryLanguage && item.organizerRegion));
  assert.ok(worldwide.some((item) => item.organizerRegion === "中東"));
  assert.ok(worldwide.some((item) => item.organizerRegion === "ヨーロッパ"));
  assert.equal(worldwide.find((item) => item.id === "hipa-determination-2026")?.feeType, "unknown");
  assert.equal(worldwide.find((item) => item.id === "bifa-professional-2026")?.evidence.technical, "conflict");
  assert.equal(worldwide.find((item) => item.id === "unesco-youth-eyes-silk-roads-2026")?.evidence.deadline, "conflict");
  assert.equal(worldwide.find((item) => item.id === "xposure-international-photography-awards-2026")?.feeType, "free");
  assert.equal(social.find((item) => item.id === "photovogue-global-open-call-2026")?.submissionMethod, "platform_upload");
  assert.equal(social.find((item) => item.id === "apec-main-influencer-2026")?.submissionMethod, "hybrid");
  assert.equal(social.find((item) => item.id === "apec-main-influencer-2026")?.eligibleFromJapan, true);
  assert.ok(domestic.every((item) => item.organizerCountry === "日本"));
  assert.ok(domestic.every((item) => item.status === "open" || item.status === "expected"));
  assert.equal(domestic.find((item) => item.id === "jps-nonfiction-photo-award-2026")?.submissionMethod, "mail_or_in_person");
  assert.equal(domestic.find((item) => item.id === "jps-nonfiction-photo-award-2026")?.seriesMin, 15);
  assert.equal(domestic.find((item) => item.id === "jps-nonfiction-photo-award-2026")?.seriesMax, 30);
  assert.equal(domestic.filter((item) => item.id.startsWith("canon-photo-contest-60-")).length, 2);
  assert.equal(domestic.filter((item) => item.id.startsWith("tamron-photo-contest-2026-")).length, 2);
  assert.equal(domestic.filter((item) => item.id.startsWith("tamron-train-2026-")).length, 2);
  assert.equal(domestic.filter((item) => item.id.startsWith("bdk-hotoke-heart-2026-")).length, 2);
  assert.equal(domestic.find((item) => item.id === "national-parks-japan-photo-contest-2026")?.requiresPublicSocial, true);
  assert.equal(domestic.find((item) => item.id === "kinkan-photo-contest-2026")?.submissionMethod, "hybrid");
  const localRoutes = domestic.filter((item) => item.shootingPrefectures?.length);
  assert.equal(localRoutes.length, 59);
  assert.equal(new Set(localRoutes.flatMap((item) => item.shootingPrefectures)).size, 47);
  assert.ok(localRoutes.every((item) => item.shotLocationRule));
  assert.deepEqual(domestic.find((item) => item.id === "utashinai-smallest-photo-contest-2026")?.shootingPrefectures, ["北海道"]);
  assert.deepEqual(domestic.find((item) => item.id === "goto-world-heritage-island-photo-2026")?.shootingPrefectures, ["長崎県"]);
  assert.deepEqual(domestic.find((item) => item.id === "aomori-nebuta-photo-contest-2026")?.shootingPrefectures, ["青森県"]);
  assert.deepEqual(domestic.find((item) => item.id === "fukui-life-favorite-curation-2026")?.shootingPrefectures, ["福井県"]);
  assert.deepEqual(domestic.find((item) => item.id === "daisen-oki-national-park-90-photo-contest")?.shootingPrefectures, ["鳥取県", "島根県", "岡山県"]);
  assert.equal(domestic.find((item) => item.id === "daisen-oki-national-park-90-photo-contest")?.workType, "unknown");
  assert.deepEqual(domestic.find((item) => item.id === "okinawa-fukugi-digital-photo-contest-13")?.shootingPrefectures, ["沖縄県"]);
  assert.ok(domestic.find((item) => item.id === "ehime-prefectural-assembly-high-school-photo-contest-2")?.localEligibilityLabel);
  assert.deepEqual(domestic.find((item) => item.id === "misaki-town-photo-contest-2026")?.shootingPrefectures, ["大阪府"]);
  assert.deepEqual(domestic.find((item) => item.id === "nakatsu-instagram-photo-contest-2026-july")?.shootingPrefectures, ["大分県"]);
  assert.equal(domestic.find((item) => item.id === "mugi-minami-photo-contest-2026")?.status, "expected");
  assert.deepEqual(domestic.find((item) => item.id === "fuji-oishi-hana-terrace-summer-photo-contest-2026")?.shootingPrefectures, ["山梨県"]);
  assert.deepEqual(domestic.find((item) => item.id === "akabira-photo-contest-2026")?.shootingPrefectures, ["北海道"]);
  assert.equal(domestic.find((item) => item.id === "good-ishikari-photo-contest-2026")?.aiPolicy, "photo_origin_required");
  assert.equal(domestic.find((item) => item.id === "hashima-no-miryoku-2026")?.opportunityKind, "curation");
  assert.equal(domestic.find((item) => item.id === "ichikikushikino-photo-contest-2026")?.rightsPolicy, "explicit");
  assert.equal(domestic.find((item) => item.id === "mogami-oguni-river-photo-contest-2026")?.rightsPolicy, "needs_check");
  assert.equal(domestic.find((item) => item.id === "fukui-life-favorite-curation-2026")?.opportunityKind, "curation");
  assert.ok(discovery.every((item) => item.verifiedAt === "2026-07-23"));
  assert.ok(discovery.every((item) => Object.keys(item.evidence).length === 7));
  assert.ok(discovery.find((item) => item.id === "natgeo-your-shot")?.requiredTags.includes("#NatGeoYourShot"));
  assert.equal(discovery.find((item) => item.id === "natgeo-your-shot")?.capturePolicy, "within_6_months");
  assert.ok(discovery.find((item) => item.id === "photovogue-monday")?.requiredTags.includes("#PhotoVogueMonday"));
  assert.equal(discovery.find((item) => item.id === "photovogue-full-projects")?.pathType, "email");
  assert.equal(discovery.find((item) => item.id === "flickr-friday")?.capturePolicy, "new_after_announcement");
  assert.deepEqual(discovery.find((item) => item.id === "lfi-leica-mastershots")?.eligibleDeviceGroups, ["leica"]);
  assert.equal(opportunities.filter((item) => item.id.startsWith("sony-single-")).length, 10);
  assert.ok(trends.length >= 4);
  assert.ok(trends.every((item) => item.url.startsWith("https://")));
  assert.match(page, /localStorage/);
  assert.match(page, /URL\.createObjectURL/);
  assert.match(page, /未回答を推測で埋めず/);
  assert.match(page, /提出準備/);
  assert.match(page, /worldwideOpportunityData/);
  assert.match(page, /socialOpportunityData/);
  assert.match(page, /domesticOpportunityData/);
  assert.match(page, /discoveryChannelData/);
  assert.match(page, /assessDiscovery/);
  assert.match(page, /使える見込み/);
  assert.match(page, /captureDevice/);
  assert.match(page, /capturePrefecture/);
  assert.match(page, /地方公募の調査台帳/);
  assert.match(page, /47-PREFECTURE RESEARCH LEDGER/);
  assert.match(page, /shootingPrefectures/);
  assert.match(page, /platformEntry/);
  assert.match(page, /国内・海外の表示切替/);
  assert.match(page, /marketFilter/);
  assert.match(page, /海外・国際公募/);
  assert.match(page, /social_allowed/);
  assert.match(page, /世界各国から応募可/);
  assert.match(page, /フォーム以外の入口/);
  assert.match(page, /\/quality-report\.html/);
  assert.match(layout, /x-forwarded-host/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(qualityReport, /106/);
  assert.match(qualityReport, /47\/47/);
  assert.match(qualityReport, /66\.5%/);
  assert.match(qualityReport, /第5次調査で追加した18ルート/);
  assert.match(qualityReport, /あかびらフォトコン2026/);
  assert.match(qualityReport, /Youth Eyes on the Silk Roads/);
});
