import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const dataUrl = new URL("../data/opportunities.json", import.meta.url);
const opportunities = JSON.parse(await readFile(dataUrl, "utf8"));

const evidenceKeys = [
  "deadline",
  "entrant",
  "work",
  "technical",
  "publication",
  "simultaneous",
  "editing",
  "rights",
];
const evidenceStates = new Set([
  "explicit",
  "conditional",
  "conflict",
  "date_only",
  "not_stated",
  "not_researched",
]);
const officialHosts = new Set([
  "www.worldphoto.org",
  "www.tokyofotoawards.jp",
  "www.cewe.fr",
]);

assert.equal(opportunities.length, 16, "expected 16 independently selectable entry routes");
assert.equal(new Set(opportunities.map((item) => item.id)).size, opportunities.length, "IDs must be unique");

for (const item of opportunities) {
  assert.equal(item.verifiedAt, "2026-07-23", `${item.id}: verification date is stale`);
  assert.ok(Number.isFinite(Date.parse(item.deadline)), `${item.id}: deadline is not parseable`);
  assert.ok(officialHosts.has(new URL(item.sourceUrl).host), `${item.id}: source is not on the audited official-host list`);
  assert.deepEqual(Object.keys(item.evidence).sort(), evidenceKeys.toSorted(), `${item.id}: evidence cells are incomplete`);
  assert.ok(Object.values(item.evidence).every((state) => evidenceStates.has(state)), `${item.id}: unsupported evidence state`);
  assert.equal(typeof item.categorySelectionRequired, "boolean", `${item.id}: category-selection state must be explicit`);
  assert.ok(["explicit", "needs_check"].includes(item.rightsPolicy), `${item.id}: rights policy must be fail-closed`);
}

const sonySingle = opportunities.filter((item) => item.id.startsWith("sony-single-"));
assert.equal(sonySingle.length, 10, "Sony Single Image must expose all 10 official categories");
assert.ok(opportunities.filter((item) => item.parent === "Sony World Photography Awards").every((item) => item.formats.join(",") === "image/jpeg"), "Sony routes are JPEG-only");

const sonySeries = opportunities.find((item) => item.id === "sony-series-2027");
assert.equal(sonySeries?.entrantAge, "adult", "Sony Series requires an adult entrant");
assert.equal(sonySeries?.minAge, 19, "Sony Series wording 'over 18' requires a strict boundary");

const sonyStudent = opportunities.find((item) => item.id === "sony-student-2027");
assert.equal(sonyStudent?.studentOnly, true, "Sony Student must require a student entrant");
assert.equal(sonyStudent?.entrantAge, "adult", "Sony Student lower age bound must be enforced");
assert.equal(sonyStudent?.minAge, 18, "Sony Student lower age bound must be explicit");
assert.equal(sonyStudent?.maxAge, 30, "Sony Student upper age bound must be explicit");

const tifaRoutes = opportunities.filter((item) => item.id.startsWith("tifa-"));
assert.equal(tifaRoutes.length, 2, "TIFA must keep professional and non-professional routes separate");
assert.ok(tifaRoutes.every((item) => item.shotDateFrom === "2021-08-01"), "TIFA five-year boundary requires a date-level check");

const evidence = opportunities.flatMap((item) => Object.values(item.evidence));
const coverage = evidence.filter((state) => state === "explicit" || state === "conditional").length;
const deadlineWarnings = opportunities.filter((item) => ["conflict", "date_only"].includes(item.evidence.deadline)).length;
const unknownCells = evidence.filter((state) => state === "not_stated" || state === "not_researched").length;

console.log(JSON.stringify({
  routes: opportunities.length,
  officialSources: new Set(opportunities.map((item) => item.sourceUrl)).size,
  evidenceCoverage: `${coverage}/${evidence.length}`,
  evidenceCoveragePercent: Number((coverage / evidence.length * 100).toFixed(1)),
  deadlineWarnings,
  unknownCells,
}, null, 2));
