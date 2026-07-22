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
  assert.match(html, /29[\s\S]{0,20}の応募ルート/);
  assert.match(html, /応募候補/);
  assert.match(html, /フォーム以外の入口/);
  assert.match(html, /NatGeo Your Shot/);
  assert.match(html, /#PhotoVogueMonday/);
  assert.match(html, /過去作を読む手掛かり/);
  assert.match(html, /\/og\.png/);
  assert.doesNotMatch(html, /react-loading-skeleton|codex-preview|Starter Project/);
});

test("seed data keeps application routes and evidence auditable", async () => {
  const [opportunitiesText, worldwideText, socialText, discoveryText, trendsText, page, layout, packageJson] =
    await Promise.all([
      readFile(new URL("../data/opportunities.json", import.meta.url), "utf8"),
      readFile(new URL("../data/worldwide-opportunities.json", import.meta.url), "utf8"),
      readFile(new URL("../data/social-opportunities.json", import.meta.url), "utf8"),
      readFile(new URL("../data/discovery-channels.json", import.meta.url), "utf8"),
      readFile(new URL("../data/trends.json", import.meta.url), "utf8"),
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../package.json", import.meta.url), "utf8"),
    ]);
  const opportunities = JSON.parse(opportunitiesText);
  const worldwide = JSON.parse(worldwideText);
  const social = JSON.parse(socialText);
  const discovery = JSON.parse(discoveryText);
  const trends = JSON.parse(trendsText);

  assert.equal(opportunities.length, 16);
  assert.equal(worldwide.length, 11);
  assert.equal(social.length, 2);
  assert.equal(discovery.length, 5);
  const allOpportunities = [...opportunities, ...worldwide, ...social];
  assert.equal(new Set(allOpportunities.map((item) => item.id)).size, 29);
  assert.ok(allOpportunities.every((item) => item.verifiedAt === "2026-07-23"));
  assert.ok(allOpportunities.every((item) => item.sourceUrl.startsWith("https://")));
  assert.ok(allOpportunities.every((item) => !Number.isNaN(Date.parse(item.deadline))));
  assert.ok(allOpportunities.every((item) => Object.keys(item.evidence).length === 8));
  assert.ok(worldwide.every((item) => item.applicantScope === "worldwide"));
  assert.ok(worldwide.every((item) => item.entryLanguage && item.organizerRegion));
  assert.ok(worldwide.some((item) => item.organizerRegion === "中東"));
  assert.ok(worldwide.some((item) => item.organizerRegion === "ヨーロッパ"));
  assert.equal(worldwide.find((item) => item.id === "hipa-determination-2026")?.feeType, "unknown");
  assert.equal(worldwide.find((item) => item.id === "bifa-professional-2026")?.evidence.technical, "conflict");
  assert.equal(social.find((item) => item.id === "photovogue-global-open-call-2026")?.submissionMethod, "platform_upload");
  assert.equal(social.find((item) => item.id === "apec-main-influencer-2026")?.submissionMethod, "hybrid");
  assert.equal(social.find((item) => item.id === "apec-main-influencer-2026")?.eligibleFromJapan, true);
  assert.ok(discovery.every((item) => item.verifiedAt === "2026-07-23"));
  assert.ok(discovery.every((item) => Object.keys(item.evidence).length === 5));
  assert.ok(discovery.find((item) => item.id === "natgeo-your-shot")?.requiredTags.includes("#NatGeoYourShot"));
  assert.ok(discovery.find((item) => item.id === "photovogue-monday-projects")?.requiredTags.includes("#PhotoVogueMonday"));
  assert.equal(opportunities.filter((item) => item.id.startsWith("sony-single-")).length, 10);
  assert.ok(trends.length >= 4);
  assert.ok(trends.every((item) => item.url.startsWith("https://")));
  assert.match(page, /localStorage/);
  assert.match(page, /URL\.createObjectURL/);
  assert.match(page, /未回答を推測で埋めず/);
  assert.match(page, /提出準備/);
  assert.match(page, /worldwideOpportunityData/);
  assert.match(page, /socialOpportunityData/);
  assert.match(page, /discoveryChannelData/);
  assert.match(page, /世界各国から応募可/);
  assert.match(page, /フォーム以外の入口/);
  assert.match(page, /\/quality-report\.html/);
  assert.match(layout, /x-forwarded-host/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
