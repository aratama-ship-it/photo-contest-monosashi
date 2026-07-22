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
  assert.match(html, /応募候補/);
  assert.match(html, /過去作を読む手掛かり/);
  assert.match(html, /\/og\.png/);
  assert.doesNotMatch(html, /react-loading-skeleton|codex-preview|Starter Project/);
});

test("seed data keeps application routes and evidence auditable", async () => {
  const [opportunitiesText, trendsText, page, layout, packageJson] =
    await Promise.all([
      readFile(new URL("../data/opportunities.json", import.meta.url), "utf8"),
      readFile(new URL("../data/trends.json", import.meta.url), "utf8"),
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../package.json", import.meta.url), "utf8"),
    ]);
  const opportunities = JSON.parse(opportunitiesText);
  const trends = JSON.parse(trendsText);

  assert.equal(opportunities.length, 16);
  assert.equal(new Set(opportunities.map((item) => item.id)).size, 16);
  assert.ok(opportunities.every((item) => item.verifiedAt === "2026-07-23"));
  assert.ok(opportunities.every((item) => item.sourceUrl.startsWith("https://")));
  assert.ok(opportunities.every((item) => !Number.isNaN(Date.parse(item.deadline))));
  assert.ok(opportunities.every((item) => Object.keys(item.evidence).length === 8));
  assert.equal(opportunities.filter((item) => item.id.startsWith("sony-single-")).length, 10);
  assert.ok(trends.length >= 4);
  assert.ok(trends.every((item) => item.url.startsWith("https://")));
  assert.match(page, /localStorage/);
  assert.match(page, /URL\.createObjectURL/);
  assert.match(page, /未回答を推測で埋めず/);
  assert.match(page, /提出準備/);
  assert.match(page, /\/quality-report\.html/);
  assert.match(layout, /x-forwarded-host/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
