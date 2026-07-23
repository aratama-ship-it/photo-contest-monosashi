import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const dataUrl = new URL("../data/opportunities.json", import.meta.url);
const worldwideDataUrl = new URL("../data/worldwide-opportunities.json", import.meta.url);
const socialDataUrl = new URL("../data/social-opportunities.json", import.meta.url);
const domesticDataUrl = new URL("../data/domestic-opportunities.json", import.meta.url);
const discoveryDataUrl = new URL("../data/discovery-channels.json", import.meta.url);
const baseOpportunities = JSON.parse(await readFile(dataUrl, "utf8"));
const worldwideOpportunities = JSON.parse(await readFile(worldwideDataUrl, "utf8"));
const socialOpportunities = JSON.parse(await readFile(socialDataUrl, "utf8"));
const domesticOpportunities = JSON.parse(await readFile(domesticDataUrl, "utf8"));
const discoveryChannels = JSON.parse(await readFile(discoveryDataUrl, "utf8"));
const opportunities = [...baseOpportunities, ...worldwideOpportunities, ...socialOpportunities, ...domesticOpportunities];

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
const discoveryEvidenceKeys = ["cadence", "eligibility", "freshness", "method", "rights", "selection", "visibility"];
const discoveryEvidenceStates = new Set([
  "explicit",
  "conditional",
  "not_stated",
  "not_researched",
  "not_applicable",
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
  "www.vogue.in",
  "www.apec.org",
  "www.jps.gr.jp",
  "personal.canon.jp",
  "www.fujifilm.com",
  "www.tamron.com",
  "www.bdk.or.jp",
  "nationalparksjp-photocontest.com",
  "www.kinkan.co.jp",
]);
const discoveryOfficialHosts = new Set([
  "www.nationalgeographic.com",
  "www.vogue.com",
  "www.worldphotographyweek.com",
  "www.oppo.com",
  "www.photocrowd.com",
  "www.flickr.com",
  "lfi-online.de",
  "www.viewbug.com",
]);
const discoveryPathTypes = new Set(["hashtag", "platform", "email", "hybrid"]);
const discoveryCapturePolicies = new Set([
  "within_6_months",
  "new_after_announcement",
  "existing_explicit",
  "not_stated",
  "listing_specific",
]);
const discoveryWorkTypes = new Set(["single", "series"]);
const discoveryDeviceGroups = new Set(["oppo_family", "leica"]);

assert.equal(baseOpportunities.length, 16, "expected the original 16 independently selectable entry routes");
assert.equal(worldwideOpportunities.length, 11, "expected 11 newly audited worldwide entry routes");
assert.equal(socialOpportunities.length, 2, "expected 2 social or curated entry routes with fixed deadlines");
assert.equal(domesticOpportunities.length, 12, "expected 12 independently audited domestic entry routes");
assert.equal(discoveryChannels.length, 11, "expected 11 rolling discovery channels");
assert.equal(opportunities.length, 41, "expected 41 independently selectable entry routes");
assert.equal(new Set(opportunities.map((item) => item.id)).size, opportunities.length, "IDs must be unique");
assert.equal(new Set(discoveryChannels.map((item) => item.id)).size, discoveryChannels.length, "discovery channel IDs must be unique");
assert.equal(
  new Set([...opportunities, ...discoveryChannels].map((item) => item.id)).size,
  opportunities.length + discoveryChannels.length,
  "entry-route and discovery-channel IDs must not overlap",
);

for (const item of opportunities) {
  assert.equal(item.verifiedAt, "2026-07-23", `${item.id}: verification date is stale`);
  assert.ok(Number.isFinite(Date.parse(item.deadline)), `${item.id}: deadline is not parseable`);
  assert.ok(officialHosts.has(new URL(item.sourceUrl).host), `${item.id}: source is not on the audited official-host list`);
  assert.deepEqual(Object.keys(item.evidence).sort(), evidenceKeys.toSorted(), `${item.id}: evidence cells are incomplete`);
  assert.ok(Object.values(item.evidence).every((state) => evidenceStates.has(state)), `${item.id}: unsupported evidence state`);
  assert.equal(typeof item.categorySelectionRequired, "boolean", `${item.id}: category-selection state must be explicit`);
  assert.ok(["explicit", "needs_check"].includes(item.rightsPolicy), `${item.id}: rights policy must be fail-closed`);
}

for (const item of discoveryChannels) {
  assert.equal(item.verifiedAt, "2026-07-23", `${item.id}: discovery verification date is stale`);
  assert.ok(discoveryOfficialHosts.has(new URL(item.sourceUrl).host), `${item.id}: discovery source is not an audited official host`);
  assert.deepEqual(Object.keys(item.evidence).sort(), discoveryEvidenceKeys, `${item.id}: discovery evidence cells are incomplete`);
  assert.ok(Object.values(item.evidence).every((state) => discoveryEvidenceStates.has(state)), `${item.id}: unsupported discovery evidence state`);
  assert.ok(Array.isArray(item.platforms) && item.platforms.length > 0, `${item.id}: discovery platform must be explicit`);
  assert.ok(Array.isArray(item.checklist) && item.checklist.length > 0, `${item.id}: discovery checklist must not be empty`);
  assert.ok(discoveryPathTypes.has(item.pathType), `${item.id}: unsupported discovery path type`);
  assert.ok(
    Array.isArray(item.acceptedWorkTypes)
      && item.acceptedWorkTypes.length > 0
      && item.acceptedWorkTypes.every((type) => discoveryWorkTypes.has(type)),
    `${item.id}: accepted work types must be explicit`,
  );
  assert.ok(discoveryCapturePolicies.has(item.capturePolicy), `${item.id}: unsupported capture policy`);
  assert.equal(typeof item.requiresSocial, "boolean", `${item.id}: social-entry requirement must be explicit`);
  assert.equal(typeof item.requiresPublicAccount, "boolean", `${item.id}: public-account requirement must be explicit`);
  assert.equal(typeof item.requiresPlatformAccount, "boolean", `${item.id}: platform-account requirement must be explicit`);
  assert.equal(typeof item.themeVariable, "boolean", `${item.id}: theme variability must be explicit`);
  assert.ok(item.eligibilityLabel, `${item.id}: eligibility summary must not be empty`);
  assert.ok(!item.activeFrom || /^\d{4}-\d{2}-\d{2}$/.test(item.activeFrom), `${item.id}: activeFrom must be ISO date`);
  assert.ok(!item.activeUntil || /^\d{4}-\d{2}-\d{2}$/.test(item.activeUntil), `${item.id}: activeUntil must be ISO date`);
  assert.ok(
    !item.eligibleDeviceGroups || item.eligibleDeviceGroups.every((group) => discoveryDeviceGroups.has(group)),
    `${item.id}: unsupported device group`,
  );
}

assert.ok(
  worldwideOpportunities.every((item) => item.applicantScope === "worldwide"),
  "every newly added route must explicitly accept applicants worldwide",
);
assert.ok(
  worldwideOpportunities.every((item) => item.entryLanguage && item.organizerRegion),
  "worldwide routes must expose entry language and organizer region",
);
assert.ok(
  domesticOpportunities.every((item) => item.organizerCountry === "日本" && item.organizerRegion === "日本"),
  "domestic routes must have a verified Japan organizer classification",
);
assert.ok(
  domesticOpportunities.every((item) => item.status === "open" || item.status === "expected"),
  "domestic routes must be open or have an officially announced upcoming window",
);
assert.ok(
  domesticOpportunities
    .filter((item) => item.applicantScope === "limited")
    .every((item) => item.eligibleFromJapan && item.eligibleResidenceGroups?.includes("japan")),
  "residence-limited domestic routes must explicitly retain Japan eligibility",
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

const photoVogue = opportunities.find((item) => item.id === "photovogue-global-open-call-2026");
assert.equal(photoVogue?.opportunityKind, "open_call", "PhotoVogue must be described as an open call, not a prize contest");
assert.equal(photoVogue?.submissionMethod, "platform_upload", "PhotoVogue must keep its Picter submission method");
assert.equal(photoVogue?.seriesMax, 15, "PhotoVogue accepts a project of up to 15 items");
assert.equal(photoVogue?.feeType, "free", "PhotoVogue official announcement states free entry");
assert.equal(photoVogue?.applicantScope, "worldwide", "PhotoVogue is open worldwide");

const apec = opportunities.find((item) => item.id === "apec-main-influencer-2026");
assert.equal(apec?.deadline, "2026-09-06T15:59:00Z", "APEC deadline must preserve the official SGT conversion");
assert.equal(apec?.applicantScope, "limited", "APEC must not be described as worldwide");
assert.deepEqual(apec?.eligibleResidenceGroups, ["japan", "other_apec"], "APEC eligibility must include Japan and other APEC economies only");
assert.equal(apec?.submissionMethod, "hybrid", "APEC must distinguish the official submission from its Instagram extension");
assert.equal(apec?.socialExtension, true, "APEC Influencer Award is a social extension");
assert.equal(apec?.requiresPublicSocial, true, "APEC Influencer Award requires public visibility");
assert.equal(apec?.feeType, "unknown", "APEC fee must not be guessed");
assert.equal(apec?.priorAwardPolicy, "not_allowed", "APEC excludes previously submitted contest photos");
assert.equal(apec?.simultaneousPolicy, "not_allowed", "APEC excludes photos submitted to other contests");

const jpsNonfiction = opportunities.find((item) => item.id === "jps-nonfiction-photo-award-2026");
assert.equal(jpsNonfiction?.submissionMethod, "mail_or_in_person", "JPS Nonfiction must preserve its physical submission route");
assert.equal(jpsNonfiction?.maxAge, 30, "JPS Nonfiction is limited to entrants aged 30 or younger");
assert.equal(jpsNonfiction?.workType, "series", "JPS Nonfiction requires a coherent print series");
assert.equal(jpsNonfiction?.seriesMin, 15, "JPS Nonfiction requires at least 15 prints");
assert.equal(jpsNonfiction?.seriesMax, 30, "JPS Nonfiction allows at most 30 prints");
assert.equal(jpsNonfiction?.priorAwardPolicy, "not_allowed", "JPS Nonfiction excludes works with another decided award");
assert.equal(jpsNonfiction?.editPolicy, "no_composite", "JPS Nonfiction excludes processing, compositing and generative AI");
assert.equal(jpsNonfiction?.rightsPolicy, "explicit", "JPS Nonfiction explicitly retains copyright with the photographer");

const canonRoutes = domesticOpportunities.filter((item) => item.id.startsWith("canon-photo-contest-60-"));
assert.equal(canonRoutes.length, 2, "Canon print and WEB submission routes must remain separate");
assert.ok(canonRoutes.every((item) => item.entrantRole === "nonprofessional"), "Canon requires amateur entrants");
assert.equal(canonRoutes.find((item) => item.id.endsWith("-web"))?.formats.join(","), "image/jpeg", "Canon WEB is JPEG-only");
assert.equal(canonRoutes.find((item) => item.id.endsWith("-print"))?.workType, "both", "Canon print accepts single and grouped works");

const fujifilm = domesticOpportunities.find((item) => item.id === "fujifilm-photo-contest-65");
assert.equal(fujifilm?.status, "expected", "Fujifilm's September opening must remain marked as upcoming");
assert.equal(fujifilm?.shotYearFrom, 2023, "Fujifilm accepts works shot from 2023 onward");
assert.equal(fujifilm?.evidence.deadline, "date_only", "Fujifilm deadline time and mail basis remain confirmation-required");

const tamronGeneralRoutes = domesticOpportunities.filter((item) => item.id.startsWith("tamron-photo-contest-2026-"));
assert.equal(tamronGeneralRoutes.length, 2, "TAMRON general and macro categories must remain separate");
assert.ok(tamronGeneralRoutes.every((item) => item.formats.join(",") === "image/jpeg" && item.maxFileMB === 10), "TAMRON online routes are JPEG at 10MB or less");
assert.equal(tamronGeneralRoutes.find((item) => item.id.endsWith("-macro"))?.themeRequired, "マクロレンズで撮影した写真", "TAMRON macro must preserve its lens requirement");

const tamronTrainRoutes = domesticOpportunities.filter((item) => item.id.startsWith("tamron-train-2026-"));
assert.equal(tamronTrainRoutes.length, 2, "TAMRON train general and U-18 routes must remain separate");
assert.equal(tamronTrainRoutes.find((item) => item.id.endsWith("-general"))?.minAge, 18, "TAMRON train general starts at age 18");
assert.equal(tamronTrainRoutes.find((item) => item.id.endsWith("-u18"))?.maxAge, 17, "TAMRON train U-18 ends at age 17");
assert.ok(tamronTrainRoutes.every((item) => item.deadline === "2026-09-01T14:59:00Z"), "TAMRON train deadline must preserve Japan-time conversion");

const bdkRoutes = domesticOpportunities.filter((item) => item.id.startsWith("bdk-hotoke-heart-2026-"));
assert.equal(bdkRoutes.length, 2, "BDK print and WEB submission routes must remain separate");
assert.equal(bdkRoutes.find((item) => item.id.endsWith("-print"))?.tones.join(","), "color", "BDK print requires color");
assert.equal(bdkRoutes.find((item) => item.id.endsWith("-web"))?.maxFileMB, 10, "BDK WEB has a 10MB limit");

const nationalParks = domesticOpportunities.find((item) => item.id === "national-parks-japan-photo-contest-2026");
assert.equal(nationalParks?.submissionMethod, "hashtag", "National Parks requires a social-platform route");
assert.equal(nationalParks?.requiresPublicSocial, true, "National Parks Instagram entry requires public visibility");
assert.equal(nationalParks?.deadline, "2026-11-30T14:59:00Z", "National Parks deadline must preserve Japan-time conversion");

const kinkan = domesticOpportunities.find((item) => item.id === "kinkan-photo-contest-2026");
assert.equal(kinkan?.submissionMethod, "hybrid", "Kinkan must retain form and social alternatives");
assert.equal(kinkan?.maxFileMB, 5, "Kinkan form submissions have a 5MB limit");
assert.equal(kinkan?.evidence.deadline, "date_only", "Kinkan deadline time remains confirmation-required");

const natGeo = discoveryChannels.find((item) => item.id === "natgeo-your-shot");
assert.ok(natGeo?.requiredTags.includes("#NatGeoYourShot"), "NatGeo discovery channel must preserve the official hashtag");
assert.equal(natGeo?.publicAccount, "required", "NatGeo Your Shot requires a public account");
assert.equal(natGeo?.capturePolicy, "within_6_months", "NatGeo Your Shot requires a six-month photo freshness check");
assert.equal(natGeo?.requiresPublicAccount, true, "NatGeo Your Shot must enforce public visibility");
const photoVogueMonday = discoveryChannels.find((item) => item.id === "photovogue-monday");
assert.ok(photoVogueMonday?.requiredTags.includes("#PhotoVogueMonday"), "PhotoVogue Monday must preserve the official hashtag");
assert.equal(photoVogueMonday?.acceptedWorkTypes.includes("single"), true, "PhotoVogue Monday must remain a social-image route");
const photoVogueProjects = discoveryChannels.find((item) => item.id === "photovogue-full-projects");
assert.equal(photoVogueProjects?.pathType, "email", "PhotoVogue Full Projects must remain separate from Monday social entry");
assert.deepEqual(photoVogueProjects?.acceptedWorkTypes, ["series"], "PhotoVogue Full Projects requires a finished series");
const photocrowd = discoveryChannels.find((item) => item.id === "photocrowd-open-contests");
assert.match(photocrowd?.warning ?? "", /固定公募ではなく探索先/, "Photocrowd must remain a rolling discovery channel");
const flickrMonthly = discoveryChannels.find((item) => item.id === "flickr-monthly-photo-challenge");
assert.equal(flickrMonthly?.requiresPlatformAccount, true, "Flickr Monthly requires a Flickr account");
assert.ok(flickrMonthly?.requiredTags.includes("#FlickrPhotoChallenge"), "Flickr Monthly must preserve its official challenge tag");
const flickrFriday = discoveryChannels.find((item) => item.id === "flickr-friday");
assert.equal(flickrFriday?.capturePolicy, "new_after_announcement", "Flickr Friday must require a newly shot image");
assert.ok(flickrFriday?.requiredTags.includes("flickrfriday"), "Flickr Friday must preserve its official tag");
const lfiGallery = discoveryChannels.find((item) => item.id === "lfi-gallery-selection");
assert.equal(lfiGallery?.capturePolicy, "existing_explicit", "LFI Gallery can select an older upload");
assert.deepEqual(lfiGallery?.formats, ["image/jpeg"], "LFI Gallery is JPEG-only");
assert.equal(lfiGallery?.maxFileMB, 15, "LFI Gallery has a 15MB upload limit");
assert.equal(lfiGallery?.eligibleDeviceGroups, undefined, "LFI general gallery accepts any camera brand");
const lfiMastershots = discoveryChannels.find((item) => item.id === "lfi-leica-mastershots");
assert.deepEqual(lfiMastershots?.eligibleDeviceGroups, ["leica"], "LFI Mastershots requires a Leica body");
assert.deepEqual(lfiMastershots?.formats, ["image/jpeg"], "LFI Mastershots is JPEG-only");
assert.equal(lfiMastershots?.maxFileMB, 15, "LFI Mastershots has a 15MB upload limit");
const viewbug = discoveryChannels.find((item) => item.id === "viewbug-open-contests");
assert.equal(viewbug?.capturePolicy, "listing_specific", "VIEWBUG rules must remain contest-specific");
assert.equal(viewbug?.evidence.rights, "explicit", "VIEWBUG platform-rights evidence must be retained");
assert.ok(new URL(viewbug?.termsUrl).host === "terms.viewbug.com", "VIEWBUG terms must use its official terms host");

const evidence = opportunities.flatMap((item) => Object.values(item.evidence));
const coverage = evidence.filter((state) => state === "explicit" || state === "conditional").length;
const deadlineWarnings = opportunities.filter((item) => ["conflict", "date_only"].includes(item.evidence.deadline)).length;
const unknownCells = evidence.filter((state) => state === "not_stated" || state === "not_researched").length;
const discoveryEvidence = discoveryChannels.flatMap((item) => Object.values(item.evidence));
const discoveryCoverage = discoveryEvidence.filter(
  (state) => state === "explicit" || state === "conditional" || state === "not_applicable",
).length;
const submissionMethods = socialOpportunities.reduce((counts, item) => {
  counts[item.submissionMethod] = (counts[item.submissionMethod] ?? 0) + 1;
  return counts;
}, {});

console.log(JSON.stringify({
  routes: opportunities.length,
  domesticRoutes: domesticOpportunities.length,
  internationalRoutes: opportunities.length - domesticOpportunities.length,
  worldwideAdded: worldwideOpportunities.length,
  socialDeadlineRoutes: socialOpportunities.length,
  discoveryChannels: discoveryChannels.length,
  explicitWorldwideRoutes: opportunities.filter((item) => item.applicantScope === "worldwide").length,
  organizerRegions: [...new Set(worldwideOpportunities.map((item) => item.organizerRegion))].sort(),
  officialSources: new Set(opportunities.map((item) => item.sourceUrl)).size,
  discoveryOfficialSources: new Set(discoveryChannels.map((item) => item.sourceUrl)).size,
  submissionMethods,
  evidenceCoverage: `${coverage}/${evidence.length}`,
  evidenceCoveragePercent: Number((coverage / evidence.length * 100).toFixed(1)),
  discoveryEvidenceCoverage: `${discoveryCoverage}/${discoveryEvidence.length}`,
  discoveryEvidenceCoveragePercent: Number((discoveryCoverage / discoveryEvidence.length * 100).toFixed(1)),
  discoveryPathTypes: discoveryChannels.reduce((counts, item) => {
    counts[item.pathType] = (counts[item.pathType] ?? 0) + 1;
    return counts;
  }, {}),
  deadlineWarnings,
  unknownCells,
}, null, 2));
