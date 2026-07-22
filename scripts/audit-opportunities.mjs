import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const dataUrl = new URL("../data/opportunities.json", import.meta.url);
const worldwideDataUrl = new URL("../data/worldwide-opportunities.json", import.meta.url);
const baseOpportunities = JSON.parse(await readFile(dataUrl, "utf8"));
const worldwideOpportunities = JSON.parse(await readFile(worldwideDataUrl, "utf8"));
const opportunities = [...baseOpportunities, ...worldwideOpportunities];

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
  "www.tpoty.com",
  "ndawards.net",
  "budapestfotoawards.com",
  "fineartphotoawards.com",
  "hipa.ae",
]);

assert.equal(baseOpportunities.length, 16, "expected the original 16 independently selectable entry routes");
assert.equal(worldwideOpportunities.length, 11, "expected 11 newly audited worldwide entry routes");
assert.equal(opportunities.length, 27, "expected 27 independently selectable entry routes");
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

assert.ok(
  worldwideOpportunities.every((item) => item.applicantScope === "worldwide"),
  "every newly added route must explicitly accept applicants worldwide",
);
assert.ok(
  worldwideOpportunities.every((item) => item.entryLanguage && item.organizerRegion),
  "worldwide routes must expose entry language and organizer region",
);

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

const tpotyRoutes = opportunities.filter((item) => item.id.startsWith("tpoty-"));
assert.equal(tpotyRoutes.length, 4, "TPOTY must keep One Shot, Portfolio, Rising Talent and Young separate");
assert.ok(tpotyRoutes.every((item) => item.deadline === "2026-10-12T22:59:00Z"), "TPOTY deadline must preserve UK-time conversion");

const ndRoutes = opportunities.filter((item) => item.id.startsWith("nd-"));
assert.equal(ndRoutes.length, 2, "ND Awards must keep professional and non-professional routes separate");
assert.ok(ndRoutes.every((item) => item.minLongEdge === 1200 && item.maxLongEdge === 1200), "ND requires a 1200px long edge");

const bifaRoutes = opportunities.filter((item) => item.id.startsWith("bifa-"));
assert.equal(bifaRoutes.length, 2, "BIFA must keep professional and non-professional routes separate");
assert.ok(bifaRoutes.every((item) => item.evidence.technical === "conflict"), "BIFA official minimum-edge conflict must remain fail-closed");
assert.ok(bifaRoutes.every((item) => item.minLongEdge === undefined), "BIFA conflicting minimum edge must not be enforced as fact");

const fapaRoutes = opportunities.filter((item) => item.id.startsWith("fapa-"));
assert.equal(fapaRoutes.length, 2, "FAPA must keep professional and amateur routes separate");
assert.ok(fapaRoutes.every((item) => item.minAge === 19), "FAPA 'over 18' boundary must be stored as 19+");

const hipa = opportunities.find((item) => item.id === "hipa-determination-2026");
assert.equal(hipa?.feeType, "unknown", "HIPA fee must not be guessed as free");
assert.equal(hipa?.evidence.technical, "conditional", "HIPA JPEG/RAW wording needs a conditional technical state");

const evidence = opportunities.flatMap((item) => Object.values(item.evidence));
const coverage = evidence.filter((state) => state === "explicit" || state === "conditional").length;
const deadlineWarnings = opportunities.filter((item) => ["conflict", "date_only"].includes(item.evidence.deadline)).length;
const unknownCells = evidence.filter((state) => state === "not_stated" || state === "not_researched").length;

console.log(JSON.stringify({
  routes: opportunities.length,
  worldwideAdded: worldwideOpportunities.length,
  explicitWorldwideRoutes: opportunities.filter((item) => item.applicantScope === "worldwide").length,
  organizerRegions: [...new Set(worldwideOpportunities.map((item) => item.organizerRegion))].sort(),
  officialSources: new Set(opportunities.map((item) => item.sourceUrl)).size,
  evidenceCoverage: `${coverage}/${evidence.length}`,
  evidenceCoveragePercent: Number((coverage / evidence.length * 100).toFixed(1)),
  deadlineWarnings,
  unknownCells,
}, null, 2));
