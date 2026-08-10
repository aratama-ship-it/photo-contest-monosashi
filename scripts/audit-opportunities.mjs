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
  "www.city.utashinai.hokkaido.jp",
  "www.pref.iwate.jp",
  "www.kanko-hanawa.com",
  "www.city.soka.saitama.jp",
  "www.pref.niigata.lg.jp",
  "www.town.iijima.lg.jp",
  "www.town-ono.jp",
  "shigaphotocon.biwako-visitors.jp",
  "www.miyajima.or.jp",
  "higashikagawa.net",
  "tosacity-kankou.com",
  "www.city.goto.nagasaki.jp",
  "www.nebuta.jp",
  "www.miyagi-kankou.or.jp",
  "www.pref.akita.lg.jp",
  "www.pref.yamagata.jp",
  "www.town.ibaraki.lg.jp",
  "www.city.tochigi.lg.jp",
  "www.pref.gunma.jp",
  "www.city.chiba.jp",
  "tokyocameraclub.com",
  "www.city.yokohama.lg.jp",
  "www.pref.toyama.jp",
  "www.pref.fukui.lg.jp",
  "www.pref.shizuoka.jp",
  "aichinow.pref.aichi.jp",
  "www.pref.kyoto.jp",
  "www.pref.wakayama.lg.jp",
  "www.pref.tottori.lg.jp",
  "www.pref.shimane.lg.jp",
  "www.pref.okayama.jp",
  "www.pref.yamaguchi.lg.jp",
  "www.pref.saga.lg.jp",
  "www.pref.okinawa.jp",
  "www.pref.ehime.jp",
  "www.town.misaki.osaka.jp",
  "www.pref.nara.lg.jp",
  "www.pref.mie.lg.jp",
  "castle.kumamoto-guide.jp",
  "www.city-nakatsu.jp",
  "www.city.miyazaki.miyazaki.jp",
  "soo-navi.jp",
  "noto-pokemon.pref.ishikawa.lg.jp",
  "www.town.tokushima-mugi.lg.jp",
  "www.mnf21.com",
  "www.city.tatsuno.lg.jp",
  "www.fujioishihanaterasu.com",
  "www.city.akabira.hokkaido.jp",
  "www.city.ishikari.hokkaido.jp",
  "www.city.iwaki.lg.jp",
  "www.pa.thr.mlit.go.jp",
  "www.rinya.maff.go.jp",
  "www.metro.tokyo.lg.jp",
  "www.city.noda.chiba.jp",
  "www.town.saitama-ina.lg.jp",
  "www.city.hashima.lg.jp",
  "www.city.chiryu.aichi.jp",
  "www.town.shoo.lg.jp",
  "kyuden-mirai.or.jp",
  "shikoku-tourism.com",
  "www.city.ichikikushikino.lg.jp",
  "www.nipponkodo.co.jp",
  "www.yumenoshima.jp",
  "www.unesco.org",
  "europeanphotoawards.com",
  "awards.xposure.net",
  "www.photography.org",
  "www.lensculture.com",
  "chromaticawards.com",
  "monovisionsawards.com",
  "www.town.ogawara.miyagi.jp",
  "www.nihonmatsu-kanko.jp",
  "www.city.ube.yamaguchi.jp",
  "www.city.daisen.lg.jp",
  "www.city.kawasaki.jp",
  "www.city.yawata.kyoto.jp",
  "www.water-supply.hachinohe.aomori.jp",
  "www.city.ena.lg.jp",
  "www.town.mitane.akita.jp",
  "www.gifucvb.or.jp",
  "www.city.sakaide.lg.jp",
  "www.city.sakai.lg.jp",
  "www.city.tsuruoka.lg.jp",
  "graphis.com",
  "form.photography",
  "headon.org.au",
  "www.212photographyistanbul.com",
  "www.city.gose.nara.jp",
  "shimoyama-photo-con.jp",
]);
const prefectures = new Set([
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府",
  "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県",
  "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県",
  "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
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
assert.equal(worldwideOpportunities.length, 24, "expected 24 independently audited worldwide entry routes");
assert.equal(socialOpportunities.length, 2, "expected 2 social or curated entry routes with fixed deadlines");
assert.equal(domesticOpportunities.length, 97, "expected 97 independently audited domestic entry routes");
assert.equal(discoveryChannels.length, 11, "expected 11 rolling discovery channels");
assert.equal(opportunities.length, 139, "expected 139 independently selectable entry routes");
assert.equal(new Set(opportunities.map((item) => item.id)).size, opportunities.length, "IDs must be unique");
assert.equal(new Set(discoveryChannels.map((item) => item.id)).size, discoveryChannels.length, "discovery channel IDs must be unique");
assert.equal(
  new Set([...opportunities, ...discoveryChannels].map((item) => item.id)).size,
  opportunities.length + discoveryChannels.length,
  "entry-route and discovery-channel IDs must not overlap",
);

for (const item of opportunities) {
  assert.ok(["2026-07-23", "2026-07-24", "2026-07-31"].includes(item.verifiedAt), `${item.id}: verification date is stale`);
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

const localRoutes = domesticOpportunities.filter((item) => item.shootingPrefectures?.length);
const coveredPrefectures = new Set(localRoutes.flatMap((item) => item.shootingPrefectures));
assert.equal(localRoutes.length, 78, "expected 78 officially audited local shooting-area routes");
assert.equal(coveredPrefectures.size, 47, "the expanded local audit must cover all 47 distinct prefectures");
assert.ok(
  localRoutes.every((item) => item.shotLocationRule && item.shootingPrefectures.every((prefecture) => prefectures.has(prefecture))),
  "local routes must include a detailed shooting-area rule and valid Japanese prefectures",
);
assert.ok(
  opportunities.filter((item) => item.shootingPrefectures?.length).every((item) => domesticOpportunities.includes(item)),
  "shooting-prefecture routes must remain in the domestic dataset",
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

const utashinai = domesticOpportunities.find((item) => item.id === "utashinai-smallest-photo-contest-2026");
assert.deepEqual(utashinai?.shootingPrefectures, ["北海道"], "Utashinai must retain its Hokkaido shooting-area gate");
assert.equal(utashinai?.workType, "single", "Utashinai accepts a single horizontal work");

const iijima = domesticOpportunities.find((item) => item.id === "iijima-event-photo-contest-2026");
assert.equal(iijima?.submissionMethod, "hybrid", "Iijima must retain print and Instagram routes");
assert.deepEqual(iijima?.shootingPrefectures, ["長野県"], "Iijima must retain its Nagano shooting-area gate");

const gotoIslands = domesticOpportunities.find((item) => item.id === "goto-world-heritage-island-photo-2026");
assert.deepEqual(gotoIslands?.shootingPrefectures, ["長崎県"], "Goto must retain its Nagasaki shooting-area gate");
assert.equal(gotoIslands?.maxFileMB, 15, "Goto web entry allows files up to 15MB");

const expandedLocalPrefectures = new Set([
  "青森県", "宮城県", "秋田県", "山形県", "茨城県", "栃木県",
  "群馬県", "千葉県", "東京都", "神奈川県", "富山県", "福井県",
]);
assert.ok(
  [...expandedLocalPrefectures].every((prefecture) => coveredPrefectures.has(prefecture)),
  "the second local audit must cover the 12 newly researched prefectures",
);
const mogamiOguni = domesticOpportunities.find((item) => item.id === "mogami-oguni-river-photo-contest-2026");
assert.equal(mogamiOguni?.rightsPolicy, "needs_check", "Mogami Oguni PDF gaps must remain fail-closed");
assert.equal(mogamiOguni?.evidence.entrant, "not_researched", "Mogami Oguni entrant rules must not be inferred");
const fukuiCuration = domesticOpportunities.find((item) => item.id === "fukui-life-favorite-curation-2026");
assert.equal(fukuiCuration?.opportunityKind, "curation", "Fukui repost selection must not be mislabeled as a ranked contest");
assert.equal(fukuiCuration?.requiresPublicSocial, true, "Fukui curation requires a public Instagram account");

const thirdLocalPrefectures = new Set([
  "静岡県", "愛知県", "京都府", "和歌山県", "鳥取県", "島根県",
  "岡山県", "山口県", "愛媛県", "佐賀県", "沖縄県",
]);
assert.ok(
  [...thirdLocalPrefectures].every((prefecture) => coveredPrefectures.has(prefecture)),
  "the third local audit must cover the 11 newly researched prefectures",
);
const daisenOki = domesticOpportunities.find((item) => item.id === "daisen-oki-national-park-90-photo-contest");
assert.equal(daisenOki?.workType, "unknown", "Daisen-Oki work type must remain unknown until the full rules are available");
assert.equal(daisenOki?.rightsPolicy, "needs_check", "Daisen-Oki rights must remain fail-closed");
const okinawaFukugi = domesticOpportunities.find((item) => item.id === "okinawa-fukugi-digital-photo-contest-13");
assert.equal(okinawaFukugi?.rightsPolicy, "explicit", "Okinawa Fukugi must preserve its explicit public-purpose license");
assert.deepEqual(okinawaFukugi?.shootingPrefectures, ["沖縄県"], "Okinawa Fukugi must retain its Okinawa shooting-area gate");
const ehimeAssembly = domesticOpportunities.find((item) => item.id === "ehime-prefectural-assembly-high-school-photo-contest-2");
assert.equal(ehimeAssembly?.studentOnly, true, "Ehime Assembly is limited to the listed local-school students");
assert.ok(ehimeAssembly?.localEligibilityLabel, "Ehime Assembly must retain its local-school eligibility warning");

const fourthLocalPrefectures = new Set([
  "石川県", "山梨県", "三重県", "大阪府", "兵庫県", "奈良県",
  "徳島県", "福岡県", "熊本県", "大分県", "宮崎県", "鹿児島県",
]);
assert.ok(
  [...fourthLocalPrefectures].every((prefecture) => coveredPrefectures.has(prefecture)),
  "the fourth local audit must cover the final 12 previously unrecorded prefectures",
);
const misakiTown = domesticOpportunities.find((item) => item.id === "misaki-town-photo-contest-2026");
assert.deepEqual(misakiTown?.shootingPrefectures, ["大阪府"], "Misaki Town must retain its Osaka shooting-area gate");
assert.equal(misakiTown?.rightsPolicy, "explicit", "Misaki Town winning-work usage must remain visible");
const oshiNara = domesticOpportunities.find((item) => item.id === "oshi-nara-photo-contest-2026-spring-summer");
assert.equal(oshiNara?.submissionMethod, "hashtag", "Oshi Nara must preserve its Instagram hashtag route");
assert.equal(oshiNara?.requiresFollow, true, "Oshi Nara must preserve the official-account follow step");
const nakatsu = domesticOpportunities.find((item) => item.id === "nakatsu-instagram-photo-contest-2026-july");
assert.deepEqual(nakatsu?.shootingPrefectures, ["大分県"], "Nakatsu must retain its Oita shooting-area gate");
assert.equal(nakatsu?.requiresPublicSocial, true, "Nakatsu requires a public Instagram account");
const mugiMinami = domesticOpportunities.find((item) => item.id === "mugi-minami-photo-contest-2026");
assert.equal(mugiMinami?.status, "expected", "Mugi-Minami starts on 2026-08-01 and must remain upcoming");
assert.equal(mugiMinami?.submissionMethod, "platform_upload", "Mugi-Minami must retain official LINE submission");
const tatsuno = domesticOpportunities.find((item) => item.id === "tatsuno-tourism-photo-contest-2026");
assert.equal(tatsuno?.minAge, 18, "Tatsuno requires entrants aged 18 or older");
assert.deepEqual(tatsuno?.shootingPrefectures, ["兵庫県"], "Tatsuno must retain its Hyogo shooting-area gate");
const hanaTerrace = domesticOpportunities.find((item) => item.id === "fuji-oishi-hana-terrace-summer-photo-contest-2026");
assert.equal(hanaTerrace?.requiresPublicSocial, true, "Hana Terrace requires a public Instagram account");
assert.deepEqual(hanaTerrace?.shootingPrefectures, ["山梨県"], "Hana Terrace must retain its Yamanashi shooting-area gate");

const akabira = domesticOpportunities.find((item) => item.id === "akabira-photo-contest-2026");
assert.deepEqual(akabira?.shootingPrefectures, ["北海道"], "Akabira must retain its Hokkaido shooting-area gate");
assert.equal(akabira?.editPolicy, "no_composite", "Akabira must preserve its no-composite condition");
const goodIshikari = domesticOpportunities.find((item) => item.id === "good-ishikari-photo-contest-2026");
assert.equal(goodIshikari?.aiPolicy, "photo_origin_required", "Goodishikari must preserve its generative-AI exclusion");
assert.equal(goodIshikari?.simultaneousPolicy, "not_allowed", "Goodishikari must preserve its other-contest exclusion");
const iwaki = domesticOpportunities.find((item) => item.id === "oshi-machi-iwaki-photo-contest-2026");
assert.deepEqual(iwaki?.shootingPrefectures, ["福島県"], "Iwaki must retain its Fukushima shooting-area gate");
assert.equal(iwaki?.editPolicy, "basic_only", "Iwaki must preserve its basic-adjustment-only policy");
const ogawara = domesticOpportunities.find((item) => item.id === "ogawara-town-photo-contest-2026");
assert.deepEqual(ogawara?.shootingPrefectures, ["宮城県"], "Ogawara must retain its Miyagi shooting-area gate");
assert.equal(ogawara?.evidence.technical, "conflict", "Ogawara's conflicting official hashtag labels must remain visible");
assert.equal(ogawara?.requiresPublicSocial, true, "Ogawara requires a public Instagram account");
const nihonmatsuInstagram = domesticOpportunities.find((item) => item.id === "nihonmatsu-tourism-photo-contest-2026-instagram");
assert.equal(nihonmatsuInstagram?.submissionMethod, "hybrid", "Nihonmatsu Instagram entry requires a post and DM");
assert.ok(nihonmatsuInstagram?.requiredTags?.includes("#安達太良山"), "Nihonmatsu Instagram must preserve the official mountain tag");
const nihonmatsuPrint = domesticOpportunities.find((item) => item.id === "nihonmatsu-tourism-photo-contest-2026-print");
assert.equal(nihonmatsuPrint?.status, "expected", "Nihonmatsu print entry must remain an announced upcoming window");
assert.equal(nihonmatsuPrint?.categorySelectionRequired, true, "Nihonmatsu print entry requires a category selection");
const goseTourism = domesticOpportunities.find((item) => item.id === "gose-tourism-photo-contest-38");
assert.equal(goseTourism?.status, "expected", "Gose must remain an officially announced upcoming window");
assert.deepEqual(goseTourism?.shootingPrefectures, ["奈良県"], "Gose must retain its Nara shooting-area gate");
assert.equal(goseTourism?.aiPolicy, "not_allowed", "Gose must preserve its generative-AI exclusion");
assert.equal(goseTourism?.rightsPolicy, "explicit", "Gose copyright transfer must remain visible");
const shimoyama = domesticOpportunities.find((item) => item.id === "shimoyama-photo-contest-2026");
assert.equal(shimoyama?.submissionMethod, "hybrid", "Shimoyama must retain its Instagram-or-mail paths");
assert.ok(shimoyama?.requiredTags?.includes("#2026しもやまフォトコン"), "Shimoyama must retain its official Instagram tag");
assert.equal(shimoyama?.simultaneousPolicy, "not_allowed", "Shimoyama must preserve its other-contest exclusion");
assert.equal(shimoyama?.editPolicy, "no_composite", "Shimoyama must preserve its no-composite condition");
const aizuwakamatsuTakara = domesticOpportunities.find((item) => item.id === "aizuwakamatsu-takara-sagashi-photo-contest-2026");
assert.equal(aizuwakamatsuTakara?.applicantScope, "limited", "Aizuwakamatsu must retain its Japan-resident gate");
assert.deepEqual(aizuwakamatsuTakara?.eligibleResidenceGroups, ["japan"], "Aizuwakamatsu must retain its Japan-only residence group");
assert.equal(aizuwakamatsuTakara?.categorySelectionRequired, true, "Aizuwakamatsu requires a department-tag selection");
assert.equal(aizuwakamatsuTakara?.aiPolicy, "photo_origin_required", "Aizuwakamatsu must preserve its photo-origin generative-AI rule");
assert.equal(aizuwakamatsuTakara?.rightsPolicy, "explicit", "Aizuwakamatsu winning-work licence must remain visible");
const ubekitaSpringSummer = domesticOpportunities.find((item) => item.id === "ubekita-photo-contest-2026-spring-summer");
assert.equal(ubekitaSpringSummer?.status, "open", "Ubekita spring/summer must remain open");
assert.deepEqual(ubekitaSpringSummer?.shootingPrefectures, ["山口県"], "Ubekita spring/summer must retain its Yamaguchi shooting-area gate");
assert.equal(ubekitaSpringSummer?.editPolicy, "basic_only", "Ubekita spring/summer must retain its basic-edit-only rule");
const ubekitaAutumnWinter = domesticOpportunities.find((item) => item.id === "ubekita-photo-contest-2026-autumn-winter");
assert.equal(ubekitaAutumnWinter?.status, "expected", "Ubekita autumn/winter must remain an announced upcoming window");
assert.equal(ubekitaAutumnWinter?.deadline, "2027-02-19", "Ubekita autumn/winter must retain its announced closing date");
const hanabiAmu = domesticOpportunities.find((item) => item.id === "hanabi-amu-fireworks-photo-contest-2026");
assert.equal(hanabiAmu?.status, "expected", "Hanabi Amu must remain an announced upcoming window");
assert.deepEqual(hanabiAmu?.shootingPrefectures, ["秋田県"], "Hanabi Amu must retain its Akita shooting-area gate");
assert.equal(hanabiAmu?.entryLimit, 3, "Hanabi Amu must retain its three-photo entry limit");
const kawasakiSenior = domesticOpportunities.find((item) => item.id === "kawasaki-senior-photo-contest-2026");
assert.equal(kawasakiSenior?.status, "expected", "Kawasaki Senior must remain an officially announced upcoming window");
assert.equal(kawasakiSenior?.applicantScope, "limited", "Kawasaki Senior must retain its city resident/worker/student gate");
assert.equal(kawasakiSenior?.entryLimit, 2, "Kawasaki Senior must retain its two-entry limit");
assert.equal(kawasakiSenior?.maxFileMB, 5, "Kawasaki Senior form uploads are capped at 5MB");
assert.equal(kawasakiSenior?.rightsPolicy, "explicit", "Kawasaki Senior winning-work usage must remain visible");
const yawataSmallFriends = domesticOpportunities.find((item) => item.id === "yawata-small-friends-photo-contest-2026");
assert.deepEqual(yawataSmallFriends?.shootingPrefectures, ["京都府"], "Yawata must retain its Kyoto shooting-area gate");
assert.equal(yawataSmallFriends?.shotYearFrom, 2026, "Yawata work must be taken in 2026");
assert.equal(yawataSmallFriends?.simultaneousPolicy, "not_allowed", "Yawata must retain its other-contest exclusion");
assert.equal(yawataSmallFriends?.editPolicy, "no_composite", "Yawata must retain its crop-only editing condition");
const hachinoheWaterRoutes = domesticOpportunities.filter((item) => item.id.startsWith("hachinohe-water-life-photo-contest-2026-"));
assert.equal(hachinoheWaterRoutes.length, 2, "Hachinohe water contest must keep its two departments separate");
assert.ok(hachinoheWaterRoutes.every((item) => item.applicantScope === "worldwide"), "Hachinohe official no-restriction eligibility must remain visible");
assert.ok(hachinoheWaterRoutes.every((item) => item.formats.join(",") === "image/jpeg" && item.maxFileMB === 5), "Hachinohe email routes are JPEG at 5MB or less");
assert.equal(hachinoheWaterRoutes.find((item) => item.id.endsWith("-oraho"))?.entryLimit, 2, "Hachinohe Orahono division allows two entries");
assert.equal(hachinoheWaterRoutes.find((item) => item.id.endsWith("-minna"))?.entryLimit, 1, "Hachinohe Minna division allows one entry");
assert.deepEqual(hachinoheWaterRoutes.find((item) => item.id.endsWith("-oraho"))?.shootingPrefectures, ["青森県"], "Hachinohe Orahono division must retain its Aomori shooting-area gate");
const hashima = domesticOpportunities.find((item) => item.id === "hashima-no-miryoku-2026");
assert.equal(hashima?.opportunityKind, "curation", "Hashima repost selection must remain a curation route");
assert.equal(hashima?.requiresPublicSocial, true, "Hashima curation requires a public Instagram account");
const ichikikushikino = domesticOpportunities.find((item) => item.id === "ichikikushikino-photo-contest-2026");
assert.deepEqual(ichikikushikino?.shootingPrefectures, ["鹿児島県"], "Ichikikushikino must retain its Kagoshima shooting-area gate");
assert.equal(ichikikushikino?.rightsPolicy, "explicit", "Ichikikushikino winning-work usage must remain visible");
const unescoSilkRoads = worldwideOpportunities.find((item) => item.id === "unesco-youth-eyes-silk-roads-2026");
assert.equal(unescoSilkRoads?.evidence.deadline, "conflict", "UNESCO's conflicting GMT labels must remain visible");
assert.equal(unescoSilkRoads?.minAge, 14, "UNESCO Youth must retain its 14-year lower age");
const xposure = worldwideOpportunities.find((item) => item.id === "xposure-international-photography-awards-2026");
assert.equal(xposure?.feeType, "free", "Xposure official page states free entry");
assert.equal(xposure?.rightsPolicy, "explicit", "Xposure's selected-work licence must remain visible");
const lensculturePhotobook = worldwideOpportunities.find((item) => item.id === "lensculture-photobook-prize-2026");
assert.equal(lensculturePhotobook?.applicantScope, "worldwide", "LensCulture Photobook must retain worldwide eligibility");
assert.equal(lensculturePhotobook?.seriesMin, 20, "LensCulture Photobook needs at least 20 images");
assert.equal(lensculturePhotobook?.seriesMax, 30, "LensCulture Photobook allows at most 30 images");
assert.equal(lensculturePhotobook?.aiPolicy, "photo_origin_required", "LensCulture must exclude purely AI-generated work");
assert.equal(lensculturePhotobook?.rightsPolicy, "explicit", "LensCulture copyright retention must remain visible");
const chromaticRoutes = worldwideOpportunities.filter((item) => item.id.startsWith("chromatic-"));
assert.equal(chromaticRoutes.length, 2, "Chromatic must keep professional and amateur routes separate");
assert.deepEqual(chromaticRoutes.map((item) => item.entrantRole).sort(), ["nonprofessional", "professional"], "Chromatic must retain its professional and amateur divisions");
assert.ok(chromaticRoutes.every((item) => item.deadline === "2026-10-25"), "Chromatic must retain its official final deadline date");
assert.ok(chromaticRoutes.every((item) => item.tones.join(",") === "color"), "Chromatic accepts color photography only");
assert.ok(chromaticRoutes.every((item) => item.priorAwardPolicy === "allowed" && item.simultaneousPolicy === "allowed"), "Chromatic permits awarded and concurrently-entered photographs");
const monovisionsRoutes = worldwideOpportunities.filter((item) => item.id.startsWith("monovisions-"));
assert.equal(monovisionsRoutes.length, 2, "MonoVisions must keep single-photo and series routes separate");
assert.deepEqual(monovisionsRoutes.map((item) => item.workType).sort(), ["series", "single"], "MonoVisions must preserve distinct work types");
assert.ok(monovisionsRoutes.every((item) => item.deadline === "2027-05-16"), "MonoVisions must retain its official final deadline date");
assert.ok(monovisionsRoutes.every((item) => item.tones.join(",") === "monochrome"), "MonoVisions accepts monochrome photography only");
assert.ok(monovisionsRoutes.every((item) => item.publicationPolicy === "allowed" && item.priorAwardPolicy === "allowed"), "MonoVisions permits published and awarded photographs");
const monovisionsSeries = worldwideOpportunities.find((item) => item.id === "monovisions-series-2027");
assert.equal(monovisionsSeries?.seriesMin, 2, "MonoVisions series must contain at least two images");
assert.equal(monovisionsSeries?.seriesMax, 8, "MonoVisions series must contain at most eight images");
const headOn = worldwideOpportunities.find((item) => item.id === "head-on-photo-awards-2026");
assert.equal(headOn?.deadline, "2026-08-16T13:59:00Z", "Head On must retain its AEST deadline conversion");
assert.equal(headOn?.applicantScope, "worldwide", "Head On explicitly accepts worldwide applicants");
assert.equal(headOn?.categorySelectionRequired, true, "Head On must preserve its three-category selection");
assert.equal(headOn?.aiPolicy, "photo_origin_required", "Head On excludes AI-generated images while allowing photo-origin post-production");
assert.equal(headOn?.rightsPolicy, "explicit", "Head On finalist licensing must remain visible");
const photography212 = worldwideOpportunities.find((item) => item.id === "international-212-photography-competition-2026");
assert.equal(photography212?.deadline, "2026-09-06T20:59:00Z", "212 must retain its GMT+3 deadline conversion");
assert.equal(photography212?.seriesMin, 5, "212 requires at least five images");
assert.equal(photography212?.seriesMax, 10, "212 accepts at most ten images");
assert.equal(photography212?.evidence.technical, "conflict", "212's official format and size conflict must remain fail-closed");
assert.equal(photography212?.editPolicy, "allowed", "212's declared manipulation conditions must remain visible");
assert.equal(photography212?.rightsPolicy, "explicit", "212 copyright and licence conditions must remain visible");

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
  localRoutes: localRoutes.length,
  coveredPrefectures: coveredPrefectures.size,
  missingPrefectures: prefectures.size - coveredPrefectures.size,
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
