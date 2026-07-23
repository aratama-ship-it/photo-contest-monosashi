"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import opportunityData from "@/data/opportunities.json";
import worldwideOpportunityData from "@/data/worldwide-opportunities.json";
import socialOpportunityData from "@/data/social-opportunities.json";
import domesticOpportunityData from "@/data/domestic-opportunities.json";
import discoveryChannelData from "@/data/discovery-channels.json";
import trendData from "@/data/trends.json";

type Subject =
  | "animals"
  | "portrait"
  | "street"
  | "landscape"
  | "wildlife"
  | "architecture"
  | "abstract"
  | "documentary"
  | "stilllife"
  | "sports"
  | "motion"
  | "travel";

type Profile = {
  shotYear: number | null;
  shotDate: string;
  capturePrefecture: string;
  workType: "unknown" | "single" | "series";
  seriesCount: number | null;
  tone: "unknown" | "color" | "monochrome";
  subjects: Subject[];
  age: number | null;
  student: "unknown" | "yes" | "no";
  institutionRegistered: "unknown" | "yes" | "no";
  role: "unknown" | "professional" | "nonprofessional";
  publication: "unknown" | "unpublished" | "social" | "commercial" | "awarded";
  otherContest: "unknown" | "yes" | "no";
  editing: "unknown" | "basic" | "composite" | "generative_edit" | "generated_origin";
  ownsRights: "unknown" | "yes" | "no";
  peoplePermission: "unknown" | "yes" | "no" | "not_applicable";
  feePreference: "any" | "free";
  residence: "unknown" | "japan" | "other_apec" | "other";
  socialEntry: "unknown" | "yes" | "no";
  publicSocialAccount: "unknown" | "yes" | "no";
  platformEntry: "unknown" | "yes" | "no";
  canShootNew: "unknown" | "yes" | "no";
  captureDevice: "unknown" | "oppo_family" | "leica" | "other";
};

type EvidenceState = "explicit" | "conditional" | "conflict" | "date_only" | "not_stated" | "not_researched";
type EvidenceKey = "deadline" | "entrant" | "work" | "technical" | "publication" | "simultaneous" | "editing" | "rights";
type MarketScope = "domestic" | "international";
type MarketFilter = "all" | MarketScope;

type Opportunity = {
  id: string;
  parent: string;
  title: string;
  edition: string;
  status: "open" | "expected" | "closed" | "unknown";
  deadline: string;
  deadlineLabel: string;
  feeType: "free" | "paid" | "unknown";
  feeLabel: string;
  marketScope: MarketScope;
  deadlineTimezone?: string;
  organizerRegion?: string;
  organizerCountry?: string;
  applicantScope?: "worldwide" | "limited" | "unknown";
  applicantScopeLabel?: string;
  eligibleFromJapan?: boolean;
  eligibleResidenceGroups?: string[];
  entryLanguage?: string;
  opportunityKind?: "contest" | "open_call" | "challenge" | "curation";
  submissionMethod?: "web_form" | "platform_upload" | "hashtag" | "email" | "hybrid" | "mail_or_in_person";
  submissionLabel?: string;
  socialExtension?: boolean;
  socialPostingRequired?: boolean;
  requiresPublicSocial?: boolean;
  requiresFollow?: boolean;
  requiredAccountTag?: string;
  requiredTags?: string[];
  entryLimit?: number;
  shootingPrefectures?: string[];
  shotLocationRule?: string;
  entrantRole: "all" | "professional" | "nonprofessional";
  entrantAge: "all" | "adult" | "youth";
  minAge?: number;
  maxAge?: number;
  studentOnly: boolean;
  workType: "single" | "series" | "both";
  seriesMin?: number;
  seriesMax?: number;
  shotYearFrom?: number;
  shotYearTo?: number;
  shotDateFrom?: string;
  shotDatePolicy?: "unrestricted" | "needs_check";
  subjects: string[];
  categorySelectionRequired: boolean;
  themeRequired?: string;
  tones: string[];
  formats: string[];
  minFileMB?: number;
  maxFileMB?: number;
  minLongEdge?: number;
  maxLongEdge?: number;
  publicationPolicy: string;
  priorAwardPolicy: string;
  simultaneousPolicy: string;
  aiPolicy: string;
  editPolicy: string;
  rightsPolicy: "explicit" | "needs_check";
  deadlineNote: string;
  evidence: Record<EvidenceKey, EvidenceState>;
  sourceUrl: string;
  sourceLabel: string;
  verifiedAt: string;
  warning: string;
  requirements: string[];
  trendGroup: string;
};

type Trend = {
  id: string;
  title: string;
  years: string;
  sampleLabel: string;
  kind: string;
  summary: string;
  observations: string[];
  works: { title: string; author: string; award: string }[];
  url: string;
  verifiedAt: string;
};

type DiscoveryChannel = {
  id: string;
  title: string;
  organizer: string;
  kind: string;
  cadence: string;
  pathType: "hashtag" | "platform" | "email" | "hybrid";
  submissionLabel: string;
  platforms: string[];
  requiresSocial: boolean;
  requiresPublicAccount: boolean;
  requiresPlatformAccount: boolean;
  acceptedWorkTypes: Array<"single" | "series">;
  capturePolicy: "within_6_months" | "new_after_announcement" | "existing_explicit" | "not_stated" | "listing_specific";
  themeVariable: boolean;
  activeFrom?: string;
  activeUntil?: string;
  eligibleDeviceGroups?: Array<"oppo_family" | "leica">;
  requiredTags: string[];
  requiredAccountTag?: string;
  publicAccount: "required" | "required_for_hashtag" | "required_for_gallery_visibility" | "not_stated" | "not_applicable";
  feeLabel: string;
  outcome: string;
  subjects: string[];
  eligibilityLabel: string;
  formats?: string[];
  maxFileMB?: number;
  checklist: string[];
  evidence: Record<string, string>;
  sourceUrl: string;
  sourceLabel: string;
  verifiedAt: string;
  warning: string;
};

type PhotoInfo = {
  name: string;
  url: string;
  type: string;
  sizeMB: number;
  width?: number;
  height?: number;
  previewable: boolean;
};

type CheckKind = "pass" | "check" | "fail" | "prepare" | "fit" | "preference";
type AssessmentCheck = { kind: CheckKind; label: string; detail: string };
type Verdict = "eligible" | "needs_check" | "ineligible";
type Assessment = {
  opportunity: Opportunity;
  verdict: Verdict;
  checks: AssessmentCheck[];
  commonSubjects: Subject[];
  unresolved: number;
  preparation: number;
  fitMiss: boolean;
  evidenceCovered: number;
  evidenceTotal: number;
  preferenceMiss: boolean;
};

type DiscoveryCheck = { kind: "pass" | "check" | "fail" | "prepare" | "fit"; label: string; detail: string };
type DiscoveryVerdict = "ready" | "prepare" | "not_fit";
type DiscoveryAssessment = {
  channel: DiscoveryChannel;
  verdict: DiscoveryVerdict;
  checks: DiscoveryCheck[];
  score: number;
};

const opportunities = [
  ...opportunityData.map((item) => ({ ...item, marketScope: "international" as const })),
  ...worldwideOpportunityData.map((item) => ({ ...item, marketScope: "international" as const })),
  ...socialOpportunityData.map((item) => ({ ...item, marketScope: "international" as const })),
  ...domesticOpportunityData.map((item) => ({ ...item, marketScope: "domestic" as const })),
] as Opportunity[];
const discoveryChannels = discoveryChannelData as DiscoveryChannel[];
const trends = trendData as Trend[];
const PROFILE_KEY = "photo-monosashi-profile-v2";
const SAVED_KEY = "photo-monosashi-saved-v1";
const MARKET_KEY = "photo-monosashi-market-v1";

const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
] as const;

const subjectLabels: Record<Subject, string> = {
  animals: "動物・ペット",
  portrait: "人物・ポートレート",
  street: "街・ストリート",
  landscape: "風景",
  wildlife: "野生動物・自然",
  architecture: "建築・構造",
  abstract: "抽象・造形",
  documentary: "記録・ドキュメンタリー",
  stilllife: "静物",
  sports: "スポーツ・動き",
  motion: "動き・モーション",
  travel: "旅・文化",
};

const defaultProfile: Profile = {
  shotYear: null,
  shotDate: "",
  capturePrefecture: "unknown",
  workType: "unknown",
  seriesCount: null,
  tone: "unknown",
  subjects: [],
  age: null,
  student: "unknown",
  institutionRegistered: "unknown",
  role: "unknown",
  publication: "unknown",
  otherContest: "unknown",
  editing: "unknown",
  ownsRights: "unknown",
  peoplePermission: "unknown",
  feePreference: "any",
  residence: "unknown",
  socialEntry: "unknown",
  publicSocialAccount: "unknown",
  platformEntry: "unknown",
  canShootNew: "unknown",
  captureDevice: "unknown",
};

const verdictMeta: Record<Verdict, { label: string; mark: string }> = {
  eligible: { label: "確認範囲で不一致なし", mark: "○" },
  needs_check: { label: "要確認", mark: "△" },
  ineligible: { label: "明示条件に不一致", mark: "×" },
};

const opportunityKindLabels: Record<NonNullable<Opportunity["opportunityKind"]>, string> = {
  contest: "賞・コンテスト",
  open_call: "キュレーション公募",
  challenge: "チャレンジ",
  curation: "掲載キュレーション",
};

const discoveryVerdictMeta: Record<DiscoveryVerdict, { label: string; mark: string }> = {
  ready: { label: "使える見込み", mark: "○" },
  prepare: { label: "準備・確認あり", mark: "△" },
  not_fit: { label: "今回の条件外", mark: "×" },
};

const marketLabels: Record<MarketScope, string> = {
  domestic: "国内公募",
  international: "海外・国際公募",
};

function normalizeProfile(value: Partial<Profile>): Profile {
  const subjects = Array.isArray(value.subjects)
    ? value.subjects.filter((subject): subject is Subject => subject in subjectLabels)
    : [];
  return {
    ...defaultProfile,
    ...value,
    shotYear: value.shotYear ? Number(value.shotYear) : null,
    shotDate: typeof value.shotDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.shotDate) ? value.shotDate : "",
    capturePrefecture:
      typeof value.capturePrefecture === "string" && prefectures.includes(value.capturePrefecture as (typeof prefectures)[number])
        ? value.capturePrefecture
        : "unknown",
    seriesCount: value.seriesCount ? Number(value.seriesCount) : null,
    age: value.age ? Number(value.age) : null,
    subjects,
  };
}

function parseDeadline(value: string) {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T23:59:59Z` : value;
  return new Date(normalized).getTime();
}

function daysUntil(value: string) {
  return Math.ceil((parseDeadline(value) - Date.now()) / 86_400_000);
}

function deadlineProximity(opportunity: Opportunity) {
  const days = daysUntil(opportunity.deadline);
  if (days < 0) return "締切経過の可能性";
  if (days === 0) return opportunity.evidence.deadline === "explicit" ? "本日締切" : "本日付近・時刻要確認";
  if (days <= 14) {
    const suffix = opportunity.evidence.deadline === "conflict" ? "・時刻不一致" : opportunity.evidence.deadline === "date_only" ? "・時刻未確認" : "";
    return `あと${days}日${suffix}`;
  }
  return null;
}

function assess(opportunity: Opportunity, profile: Profile, photo: PhotoInfo | null): Assessment {
  const checks: AssessmentCheck[] = [];
  const add = (kind: CheckKind, label: string, detail: string) => checks.push({ kind, label, detail });

  if (opportunity.applicantScope === "worldwide") {
    add("pass", "応募地域", `居住国を限定しない世界公募（応募言語: ${opportunity.entryLanguage ?? "公式要項で確認"}）`);
  } else if (opportunity.applicantScope === "limited") {
    const eligibleGroups = opportunity.eligibleResidenceGroups ?? (opportunity.eligibleFromJapan ? ["japan"] : []);
    if (profile.residence === "unknown") {
      add("check", "応募地域", `${opportunity.applicantScopeLabel ?? "居住地・国籍に制限あり"}。居住・市民権の範囲を回答してください`);
    } else if (eligibleGroups.includes(profile.residence)) {
      add("pass", "応募地域", opportunity.applicantScopeLabel ?? "回答した地域は対象範囲内");
    } else {
      add("fail", "応募地域", opportunity.applicantScopeLabel ?? "回答した地域は対象範囲外");
    }
  }

  if (opportunity.submissionMethod === "hashtag" && opportunity.socialPostingRequired !== false) {
    if (profile.socialEntry === "unknown") {
      add("check", "SNS投稿応募", "ハッシュタグ投稿を使えるか未回答");
    } else if (profile.socialEntry === "no") {
      add("fail", "SNS投稿応募", "SNSの公開投稿が必須の応募方式です");
    } else if (opportunity.requiresPublicSocial && profile.publicSocialAccount !== "yes") {
      add(profile.publicSocialAccount === "no" ? "fail" : "check", "公開アカウント", "主催者が投稿を確認できる公開アカウントが必要です");
    } else {
      add("pass", "SNS投稿応募", `${opportunity.submissionLabel ?? "ハッシュタグ投稿"}を使えると回答`);
    }
  } else if (opportunity.socialExtension) {
    if (profile.socialEntry === "yes" && opportunity.requiresPublicSocial && profile.publicSocialAccount !== "yes") {
      add("check", "SNS追加枠", "本賞はフォームで応募できますが、追加賞には公開アカウントが必要です");
    } else if (profile.socialEntry === "yes") {
      add("prepare", "SNS追加枠", `${opportunity.requiredTags?.join("・") ?? "指定タグ"}と${opportunity.requiredAccountTag ?? "公式アカウント"}の条件を投稿前に確認`);
    } else {
      add("pass", "応募方式", "SNS投稿なしでも本賞へは公式フォーム／メールで応募可能");
    }
  }

  if (opportunity.status === "closed" || daysUntil(opportunity.deadline) < 0) {
    add("fail", "締切", "収録した締切を経過しています。再募集・延長がない限り応募できません");
  } else if (opportunity.status !== "open") {
    add("check", "募集状態", "募集開始・受付状態を公式応募画面で確認してください");
  }

  if (profile.workType === "unknown") {
    add(
      opportunity.workType === "both" ? "pass" : "check",
      "作品形式",
      opportunity.workType === "both" ? "単写真・シリーズの両方に応募枠あり" : "単写真かシリーズか未回答",
    );
  } else if (opportunity.workType === "both" || opportunity.workType === profile.workType) {
    add("pass", "作品形式", profile.workType === "single" ? "単写真に対応" : "シリーズに対応");
  } else {
    add(
      "fail",
      "作品形式",
      opportunity.workType === "single" ? "単写真のみが対象" : "シリーズ作品のみが対象",
    );
  }

  if (profile.workType === "series" && opportunity.workType !== "single") {
    const min = opportunity.seriesMin ?? 1;
    const max = opportunity.seriesMax ?? 100;
    if (profile.seriesCount === null) {
      add("check", "シリーズ枚数", `${min}〜${max}枚。構成枚数を入力してください`);
    } else if (profile.seriesCount >= min && profile.seriesCount <= max) {
      add("pass", "シリーズ枚数", `${profile.seriesCount}枚は規定範囲内`);
    } else {
      add("fail", "シリーズ枚数", `${min}〜${max}枚が必要`);
    }
  }

  if (opportunity.minAge !== undefined || opportunity.maxAge !== undefined) {
    const min = opportunity.minAge ?? 0;
    const max = opportunity.maxAge ?? 999;
    const ageLabel = opportunity.minAge !== undefined && opportunity.maxAge !== undefined
      ? `${min}〜${max}歳`
      : opportunity.minAge !== undefined
        ? `${min}歳以上`
        : `${max}歳以下`;
    add(
      profile.age === null ? "check" : profile.age >= min && profile.age <= max ? "pass" : "fail",
      "年齢",
      profile.age === null ? `締切日時点の年齢が未回答（対象: ${ageLabel}）` : `締切日時点で${ageLabel}が対象`,
    );
  } else {
    add("pass", "年齢", "公式要項上、年齢区分を設けない応募枠");
  }

  if (opportunity.studentOnly) {
    if (profile.student === "unknown") {
      add("check", "学生資格", "写真プログラムを履修中か未回答");
    } else if (profile.student === "no") {
      add("fail", "学生資格", "高等教育の写真プログラム履修者が対象");
    } else if (profile.age !== null && (profile.age < 18 || profile.age > 30)) {
      add("fail", "学生資格", "学生部門は18〜30歳が対象");
    } else if (profile.institutionRegistered === "no") {
      add("fail", "教育機関の登録", "所属機関が公式登録されている必要があります");
    } else if (profile.institutionRegistered === "unknown") {
      add("check", "教育機関の登録", "所属機関が公式登録済みか確認してください");
    } else {
      add("pass", "学生資格", "写真プログラム履修・教育機関登録を回答済み");
    }
  }

  if (opportunity.entrantRole !== "all") {
    if (profile.role === "unknown") {
      add("check", "応募区分", "写真収入が主か未回答");
    } else if (opportunity.entrantRole === profile.role) {
      add(
        "pass",
        "応募区分",
        profile.role === "professional" ? "写真収入を主とする区分" : "写真収入を主としない区分",
      );
    } else {
      add(
        "fail",
        "応募区分",
        opportunity.entrantRole === "professional" ? "Professional区分が対象" : "Non-Professional区分が対象",
      );
    }
  }

  if (opportunity.shotYearFrom || opportunity.shotYearTo) {
    const from = opportunity.shotYearFrom ?? 0;
    const to = opportunity.shotYearTo ?? 9999;
    if (profile.shotYear === null) {
      add("check", "撮影年", `${from}${from !== to ? `〜${to}` : ""}年が対象。撮影年を入力してください`);
    } else if (profile.shotYear >= from && profile.shotYear <= to) {
      if (opportunity.shotDateFrom && profile.shotYear === Number(opportunity.shotDateFrom.slice(0, 4))) {
        add("check", "撮影日", `${opportunity.shotDateFrom}以降か、年だけでは判定できません`);
      } else {
      add("pass", "撮影年", `${profile.shotYear}年は対象期間内`);
      }
    } else {
      add("fail", "撮影年", `${from}${from !== to ? `〜${to}` : ""}年に撮影した作品が対象`);
    }
  } else if (opportunity.shotDatePolicy === "unrestricted") {
    add("pass", "撮影時期", "撮影時期の制限なしと公式要項で確認");
  } else {
    add("check", "撮影・公開時期", "未公開作品と公開済み作品で条件が異なるため要項を確認");
  }

  if (opportunity.shootingPrefectures?.length) {
    if (profile.capturePrefecture === "unknown") {
      add("check", "撮影都道府県", `${opportunity.shootingPrefectures.join("・")}で撮影した作品が対象。撮影地を回答してください`);
    } else if (opportunity.shootingPrefectures.includes(profile.capturePrefecture)) {
      add("pass", "撮影都道府県", `${profile.capturePrefecture}は対象地域に含まれます`);
    } else {
      add("fail", "撮影都道府県", `${opportunity.shootingPrefectures.join("・")}で撮影した作品が対象です`);
    }
  }

  if (opportunity.shotLocationRule) {
    add("check", opportunity.shootingPrefectures?.length ? "撮影地域の詳細" : "撮影地", opportunity.shotLocationRule);
  }

  const allSubjects = opportunity.subjects.includes("all");
  const commonSubjects = profile.subjects.filter((subject) => opportunity.subjects.includes(subject));
  if (opportunity.themeRequired) {
    add("check", "指定テーマ", `「${opportunity.themeRequired}」への応答は本人が公式ブリーフと照合してください`);
  } else if (allSubjects && opportunity.categorySelectionRequired) {
    add("check", "題材・部門", "複数部門を含む総合枠。公式応募画面で部門を選ぶ必要があります");
  } else if (allSubjects) {
    add("pass", "題材・部門", "公式要項上、題材を限定しない応募枠");
  } else if (profile.subjects.length === 0) {
    add("check", "題材・部門", "作品の題材を選ぶと部門との対応を確認できます");
  } else if (commonSubjects.length > 0) {
    add(opportunity.categorySelectionRequired ? "check" : "pass", "題材・部門", `${commonSubjects.map((subject) => subjectLabels[subject]).join("・")}${opportunity.categorySelectionRequired ? "に対応する公式部門を選択してください" : ""}`);
  } else {
    add("fit", "部門候補", "自己申告した題材との共通タグなし。応募不可ではありませんが、別部門も確認してください");
  }

  if (profile.tone === "unknown" && opportunity.tones.length === 1) {
    add("check", "カラー形式", "カラー／モノクロが未回答");
  } else if (profile.tone === "unknown") {
    add("pass", "カラー形式", "カラー・モノクロの両方に対応");
  } else if (opportunity.tones.includes(profile.tone)) {
    add("pass", "カラー形式", profile.tone === "color" ? "カラー作品に対応" : "モノクロ作品に対応");
  } else {
    add("fail", "カラー形式", "この応募枠の指定形式と一致しません");
  }

  if (!photo && (opportunity.formats.length > 0 || opportunity.minFileMB || opportunity.maxFileMB || opportunity.minLongEdge || opportunity.maxLongEdge)) {
    add("prepare", "提出ファイル", "写真なしで照合中。形式・容量・寸法は応募前に確認してください");
  } else if (photo) {
    if (opportunity.formats.length > 0) {
      if (opportunity.formats.includes(photo.type)) {
        add("pass", "ファイル形式", photo.type === "image/jpeg" ? "JPEG" : photo.type);
      } else {
        add("prepare", "ファイル形式", `${opportunity.formats.map((value) => value.replace("image/", "").toUpperCase()).join(" / ")}へ書き出しが必要`);
      }
    }

    if (opportunity.minFileMB && photo.sizeMB < opportunity.minFileMB) {
      add("prepare", "ファイル容量", `${opportunity.minFileMB}MB以上へ書き出しが必要（現在${photo.sizeMB.toFixed(1)}MB）`);
    } else if (opportunity.maxFileMB && photo.sizeMB > opportunity.maxFileMB) {
      add("prepare", "ファイル容量", `${opportunity.maxFileMB}MB以下へ書き出しが必要（現在${photo.sizeMB.toFixed(1)}MB）`);
    } else if (opportunity.minFileMB || opportunity.maxFileMB) {
      add("pass", "ファイル容量", `${photo.sizeMB.toFixed(1)}MBは記載範囲内`);
    }

    const longEdge = photo.width && photo.height ? Math.max(photo.width, photo.height) : null;
    if (opportunity.minLongEdge || opportunity.maxLongEdge) {
      if (!longEdge) {
        add("prepare", "ピクセル寸法", "この形式では寸法を読めません。書き出し時に確認してください");
      } else if (opportunity.minLongEdge && longEdge < opportunity.minLongEdge) {
        add("prepare", "ピクセル寸法", `長辺${opportunity.minLongEdge}px以上へ書き出しが必要（現在${longEdge}px）`);
      } else if (opportunity.maxLongEdge && longEdge > opportunity.maxLongEdge) {
        add("prepare", "ピクセル寸法", `長辺${opportunity.maxLongEdge}px以下へ書き出しが必要（現在${longEdge}px）`);
      } else {
        add("pass", "ピクセル寸法", `長辺${longEdge}pxは記載範囲内`);
      }
    }
  }

  if (profile.publication === "unknown") {
    if (opportunity.publicationPolicy === "allowed" && opportunity.priorAwardPolicy === "allowed") {
      add("pass", "発表・受賞歴", "公開済み・過去受賞作品も可と公式に明記");
    } else {
      add("check", "発表・受賞歴", "未回答。公開時期や公開点数で条件が変わります");
    }
  } else if (profile.publication === "awarded") {
    if (opportunity.priorAwardPolicy === "allowed") {
      add("pass", "過去の受賞", "過去に受賞した作品も応募可と明記");
    } else if (opportunity.priorAwardPolicy === "not_allowed") {
      add("fail", "過去の受賞", "他公募へ提出・受賞した作品は対象外と明記");
    } else {
      add("check", "過去の受賞", "過去受賞作品の扱いを最新要項で確認");
    }
  } else if (profile.publication === "commercial") {
    if (opportunity.publicationPolicy === "allowed") {
      add("pass", "発表歴", "発表済み作品も応募可と明記");
    } else {
      add("check", "発表歴", "商用利用済み作品の扱いを最新要項で確認");
    }
  } else if (profile.publication === "social") {
    const socialAllowed = opportunity.publicationPolicy === "allowed" || opportunity.publicationPolicy === "social_allowed";
    add(
      socialAllowed ? "pass" : "check",
      "発表歴",
      socialAllowed ? "個人の非営利SNS掲載作品は応募可と明記" : "SNS公開済み作品の扱いを確認",
    );
  } else {
    add("pass", "発表歴", "未発表として照合");
  }

  if (profile.otherContest === "unknown") {
    if (opportunity.simultaneousPolicy === "allowed") {
      add("pass", "同時応募", "同時応募可と公式に明記");
    } else {
      add("check", "同時応募", "他公募への応募状況が未回答");
    }
  } else if (profile.otherContest === "yes") {
    add(
      opportunity.simultaneousPolicy === "not_allowed" ? "fail" : "check",
      "同時応募",
      opportunity.simultaneousPolicy === "not_allowed"
        ? "他公募へ提出した作品は対象外と公式要項に明記"
        : "他公募へ応募中。同一・類似作と拘束期間の規定を公式要項で確認",
    );
  } else {
    add("pass", "同時応募", "他公募へ応募中ではないと回答");
  }

  if (profile.editing === "unknown") {
    add("check", "編集", "編集方法が未回答。合成・生成AIは別条項として確認します");
  } else if (profile.editing === "generated_origin") {
    if (opportunity.aiPolicy === "photo_origin_required") {
      add("fail", "生成AI", "作品の起点がアナログまたはデジタル写真である必要があります");
    } else if (opportunity.aiPolicy === "separate_category") {
      add("check", "生成AI", "AI生成専用カテゴリーの対象条件を確認してください");
    } else {
      add("check", "生成AI", "AI生成作品の扱いを公式要項で確認してください");
    }
  } else if (profile.editing === "generative_edit") {
    add(
      opportunity.editPolicy === "no_composite" ? "fail" : "check",
      "生成AI編集",
      opportunity.editPolicy === "no_composite"
        ? "加工・合成・画像生成AIを使用した作品は不可と明記"
        : "生成塗り足し・要素追加が操作規定に収まるか確認してください",
    );
  } else if (profile.editing === "composite") {
    add(
      opportunity.editPolicy === "no_composite" ? "fail" : "check",
      "合成・大幅編集",
      opportunity.editPolicy === "no_composite"
        ? "加工・合成した作品は不可と明記"
        : "部門ごとの編集規定、素材の権利、申告方法を確認",
    );
  } else {
    add(opportunity.editPolicy === "needs_check" ? "check" : "pass", "編集", opportunity.editPolicy === "needs_check" ? "基本補正の許容範囲も要項で未確認" : "基本補正として照合");
  }

  if (profile.ownsRights === "unknown") {
    add("check", "著作権・応募権", "本人が単独の著作者で、応募できる権利を持つか未回答");
  } else if (profile.ownsRights === "no") {
    add(
      opportunity.rightsPolicy === "explicit" ? "fail" : "check",
      "著作権・応募権",
      opportunity.rightsPolicy === "explicit"
        ? "本人が著作者・権利者であることを求める応募枠です"
        : "本人が権利を持たないと回答。公募固有の権利条項は未確認です",
    );
  } else {
    add(opportunity.rightsPolicy === "explicit" ? "pass" : "check", "著作権・応募権", opportunity.rightsPolicy === "explicit" ? "本人が権利を持つと回答" : "本人の権利は回答済み。公募固有の権利条項は要確認");
  }

  const mayContainPeople = profile.subjects.some((subject) => ["portrait", "street", "documentary"].includes(subject));
  if (mayContainPeople) {
    if (profile.peoplePermission === "unknown") {
      add("check", "人物の許諾", "識別できる人物がいる場合の同意・モデルリリースが未回答");
    } else if (profile.peoplePermission === "no") {
      add(
        opportunity.evidence.rights === "explicit" ? "fail" : "check",
        "人物の許諾",
        opportunity.evidence.rights === "explicit"
          ? "人物の同意を求める要項と一致しません"
          : "必要な許諾がないと回答。人物に関する公式条項は未確認です",
      );
    } else {
      add("pass", "人物の許諾", profile.peoplePermission === "yes" ? "必要な同意があると回答" : "識別できる人物はいないと回答");
    }
  }

  if (opportunity.evidence.deadline === "conflict") {
    add("check", "締切時刻", opportunity.deadlineNote);
  } else if (opportunity.evidence.deadline === "date_only") {
    add("check", "締切時刻", opportunity.deadlineNote);
  }

  if (opportunity.evidence.technical === "conflict") {
    add("check", "技術仕様", "公式ページ同士で提出寸法の記載が一致しません。応募画面で確認してください");
  }

  const preferenceMiss = profile.feePreference === "free" && opportunity.feeType === "paid";
  if (preferenceMiss) {
    add("preference", "費用希望", "無料のみの希望から外れます");
  } else if (profile.feePreference === "free" && opportunity.feeType === "unknown") {
    add("check", "応募費用", "公式ページで料金を確認できないため、無料とは判定しません");
  }

  const hasFail = checks.some((item) => item.kind === "fail");
  const hasCheck = checks.some((item) => item.kind === "check");
  const fitMiss = checks.some((item) => item.kind === "fit");
  const preparation = checks.filter((item) => item.kind === "prepare").length;
  const evidenceValues = Object.values(opportunity.evidence);
  const evidenceCovered = evidenceValues.filter((value) => value === "explicit" || value === "conditional").length;
  const verdict: Verdict = hasFail ? "ineligible" : hasCheck ? "needs_check" : "eligible";
  return {
    opportunity,
    verdict,
    checks,
    commonSubjects,
    unresolved: checks.filter((item) => item.kind === "check").length,
    preparation,
    fitMiss,
    evidenceCovered,
    evidenceTotal: evidenceValues.length,
    preferenceMiss,
  };
}

function assessDiscovery(channel: DiscoveryChannel, profile: Profile, photo: PhotoInfo | null): DiscoveryAssessment {
  const checks: DiscoveryCheck[] = [];
  const add = (kind: DiscoveryCheck["kind"], label: string, detail: string) => checks.push({ kind, label, detail });

  if (profile.workType === "unknown") {
    add("check", "作品形式", `${channel.acceptedWorkTypes.map((type) => type === "single" ? "単写真" : "シリーズ").join("・")}の入口です`);
  } else if (channel.acceptedWorkTypes.includes(profile.workType)) {
    add("pass", "作品形式", profile.workType === "single" ? "単写真で使える入口" : "シリーズで使える入口");
  } else {
    add("fail", "作品形式", profile.workType === "single" ? "完成した作品群が必要です" : "単写真向けの入口です");
  }

  if (channel.requiresSocial) {
    if (profile.socialEntry === "unknown") {
      add("check", "SNS投稿", "SNS投稿型の入口を使えるか未回答");
    } else if (profile.socialEntry === "no") {
      add("fail", "SNS投稿", "SNS投稿を使わない回答のため、この入口は使えません");
    } else if (channel.requiresPublicAccount && profile.publicSocialAccount === "unknown") {
      add("check", "公開アカウント", "主催者が確認できる公開設定か未回答");
    } else if (channel.requiresPublicAccount && profile.publicSocialAccount === "no") {
      add("fail", "公開アカウント", "非公開アカウントでは主催者が投稿を確認できません");
    } else {
      add("pass", "SNS投稿", "投稿方式と公開条件に対応");
    }
  }

  if (channel.requiresPlatformAccount) {
    if (profile.platformEntry === "unknown") {
      add("check", "サービス登録", `${channel.platforms.join("／")}のアカウントを使えるか未回答`);
    } else if (profile.platformEntry === "no") {
      add("fail", "サービス登録", "外部写真サービスへ登録しない回答のため、この入口は使えません");
    } else {
      add("pass", "サービス登録", `${channel.platforms.join("／")}から提出できると回答`);
    }
  }

  if (channel.eligibleDeviceGroups?.length) {
    if (profile.captureDevice === "unknown") {
      add("check", "撮影機材", channel.eligibilityLabel);
    } else if (channel.eligibleDeviceGroups.includes(profile.captureDevice as "oppo_family" | "leica")) {
      add("pass", "撮影機材", channel.eligibilityLabel);
    } else {
      add("fail", "撮影機材", channel.eligibilityLabel);
    }
  }

  if (channel.capturePolicy === "within_6_months") {
    if (!profile.shotDate) {
      add("check", "撮影日", "投稿時点から6か月以内か確認するため、撮影日を入力してください");
    } else {
      const shotAt = new Date(`${profile.shotDate}T00:00:00Z`);
      const cutoff = new Date();
      cutoff.setUTCMonth(cutoff.getUTCMonth() - 6);
      add(
        shotAt.getTime() >= cutoff.getTime() ? "pass" : "fail",
        "撮影日",
        shotAt.getTime() >= cutoff.getTime() ? "直近6か月以内" : "投稿時点から6か月を超えるため対象外",
      );
    }
  } else if (channel.capturePolicy === "new_after_announcement") {
    if (profile.canShootNew === "unknown") {
      add("check", "新規撮影", "この傑作の再利用ではなく、週テーマ発表後に新しく撮れるか未回答");
    } else if (profile.canShootNew === "no") {
      add("fail", "新規撮影", "手元の過去作は対象外。テーマ発表後の新作だけが対象");
    } else {
      add("prepare", "新規撮影", "最新テーマを確認してから新しく撮影");
    }
  } else if (channel.capturePolicy === "existing_explicit") {
    add("pass", "撮影時期", "過去のアップロードも選出対象になり得ると公式FAQに明記");
  } else if (channel.capturePolicy === "listing_specific") {
    add("prepare", "撮影時期", "個別募集の撮影日・公開歴条件を確認");
  } else {
    add("check", "撮影時期", "既存作品を使えるか公式ページで明記を確認できず");
  }

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  if (channel.activeFrom && todayKey < channel.activeFrom) {
    add("prepare", "開催期間", `${channel.activeFrom}から受付。今は準備期間`);
  }
  if (channel.activeUntil && todayKey > channel.activeUntil) {
    add("fail", "開催期間", `${channel.activeUntil}で終了。次回開催を確認してください`);
  } else if (channel.activeUntil && todayKey >= (channel.activeFrom ?? "")) {
    add("pass", "開催期間", `${channel.activeUntil}までの開催期間内`);
  }

  if (channel.themeVariable) {
    add("prepare", "現在のテーマ", "月・週・個別募集ごとに変わるため、公式ページで最新テーマを確認");
  }

  if (!channel.subjects.includes("all")) {
    const shared = profile.subjects.filter((subject) => channel.subjects.includes(subject));
    if (profile.subjects.length === 0) {
      add("check", "題材", "作品の題材を選ぶと、この入口との共通点を確認できます");
    } else if (shared.length > 0) {
      add("fit", "題材", `${shared.map((subject) => subjectLabels[subject]).join("・")}の掲載領域あり`);
    } else {
      add("check", "題材", "現在の自己申告タグと公式掲載領域に共通なし。個別テーマを確認");
    }
  }

  if (channel.formats?.length || channel.maxFileMB) {
    if (!photo) {
      add("prepare", "提出ファイル", "写真を置くと形式・容量も確認できます");
    } else {
      if (channel.formats?.length) {
        add(
          channel.formats.includes(photo.type) ? "pass" : "prepare",
          "ファイル形式",
          channel.formats.includes(photo.type) ? "JPG要件に一致" : "JPGへ書き出しが必要",
        );
      }
      if (channel.maxFileMB) {
        add(
          photo.sizeMB <= channel.maxFileMB ? "pass" : "prepare",
          "ファイル容量",
          photo.sizeMB <= channel.maxFileMB ? `${photo.sizeMB.toFixed(1)}MBは上限内` : `${channel.maxFileMB}MB以下へ書き出しが必要`,
        );
      }
    }
  }

  const hasFail = checks.some((check) => check.kind === "fail");
  const hasUnresolved = checks.some((check) => check.kind === "check" || check.kind === "prepare");
  const verdict: DiscoveryVerdict = hasFail ? "not_fit" : hasUnresolved ? "prepare" : "ready";
  const score = checks.reduce((total, check) => total + (check.kind === "pass" ? 3 : check.kind === "fit" ? 2 : check.kind === "prepare" ? -1 : check.kind === "check" ? -2 : -10), 0);
  return { channel, verdict, checks, score };
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={value === option.value ? "is-selected" : ""}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [photo, setPhoto] = useState<PhotoInfo | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [measured, setMeasured] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOpen, setSavedOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedProfile = localStorage.getItem(PROFILE_KEY);
        const storedSaved = localStorage.getItem(SAVED_KEY);
        const storedMarket = localStorage.getItem(MARKET_KEY);
        if (storedProfile) {
          setProfile(normalizeProfile(JSON.parse(storedProfile)));
        }
        if (storedSaved) {
          const ids = JSON.parse(storedSaved);
          if (Array.isArray(ids)) setSaved(ids.map(String));
        }
        if (storedMarket === "all" || storedMarket === "domestic" || storedMarket === "international") {
          setMarketFilter(storedMarket);
        }
      } catch {
        // Storage is optional. The matcher still works without persistence.
      }
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore unavailable storage.
    }
  }, [profile, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    } catch {
      // Ignore unavailable storage.
    }
  }, [saved, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(MARKET_KEY, marketFilter);
    } catch {
      // Ignore unavailable storage.
    }
  }, [marketFilter, hydrated]);

  useEffect(() => {
    return () => {
      if (photo?.url) URL.revokeObjectURL(photo.url);
    };
  }, [photo]);

  const assessments = useMemo(() => {
    const verdictOrder: Record<Verdict, number> = { eligible: 0, needs_check: 1, ineligible: 2 };
    return opportunities
      .map((opportunity) => assess(opportunity, profile, photo))
      .sort((a, b) => {
        if (verdictOrder[a.verdict] !== verdictOrder[b.verdict]) {
          return verdictOrder[a.verdict] - verdictOrder[b.verdict];
        }
        if (a.preferenceMiss !== b.preferenceMiss) return Number(a.preferenceMiss) - Number(b.preferenceMiss);
        if (a.fitMiss !== b.fitMiss) return Number(a.fitMiss) - Number(b.fitMiss);
        if (a.unresolved !== b.unresolved) return a.unresolved - b.unresolved;
        return parseDeadline(a.opportunity.deadline) - parseDeadline(b.opportunity.deadline);
      });
  }, [photo, profile]);

  const marketCounts = useMemo(() => {
    return assessments.reduce(
      (result, item) => ({ ...result, [item.opportunity.marketScope]: result[item.opportunity.marketScope] + 1 }),
      { domestic: 0, international: 0 } as Record<MarketScope, number>,
    );
  }, [assessments]);

  const localRouteCounts = useMemo(() => {
    return opportunities
      .filter((opportunity) => opportunity.marketScope === "domestic" && opportunity.shootingPrefectures?.length)
      .reduce((countsByPrefecture, opportunity) => {
        opportunity.shootingPrefectures?.forEach((prefecture) => {
          countsByPrefecture[prefecture] = (countsByPrefecture[prefecture] ?? 0) + 1;
        });
        return countsByPrefecture;
      }, {} as Record<string, number>);
  }, []);

  const coveredPrefectureCount = Object.keys(localRouteCounts).length;

  const filteredAssessments = useMemo(() => {
    return marketFilter === "all"
      ? assessments
      : assessments.filter((item) => item.opportunity.marketScope === marketFilter);
  }, [assessments, marketFilter]);

  const counts = useMemo(() => {
    return filteredAssessments.reduce(
      (result, item) => ({ ...result, [item.verdict]: result[item.verdict] + 1 }),
      { eligible: 0, needs_check: 0, ineligible: 0 } as Record<Verdict, number>,
    );
  }, [filteredAssessments]);

  const discoveryAssessments = useMemo(() => {
    const verdictOrder: Record<DiscoveryVerdict, number> = { ready: 0, prepare: 1, not_fit: 2 };
    return discoveryChannels
      .map((channel) => assessDiscovery(channel, profile, photo))
      .sort((a, b) => verdictOrder[a.verdict] - verdictOrder[b.verdict] || b.score - a.score);
  }, [photo, profile]);

  const discoveryCounts = useMemo(() => {
    return discoveryAssessments.reduce(
      (result, item) => ({ ...result, [item.verdict]: result[item.verdict] + 1 }),
      { ready: 0, prepare: 0, not_fit: 0 } as Record<DiscoveryVerdict, number>,
    );
  }, [discoveryAssessments]);

  const savedItems = saved
    .map((id) => opportunities.find((item) => item.id === id))
    .filter((item): item is Opportunity => Boolean(item));
  const hasSonySeriesConflict =
    saved.includes("sony-series-2027") && saved.some((id) => id.startsWith("sony-single-"));

  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function toggleSubject(subject: Subject) {
    setProfile((current) => ({
      ...current,
      subjects: current.subjects.includes(subject)
        ? current.subjects.filter((item) => item !== subject)
        : [...current.subjects, subject],
    }));
  }

  function loadFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("画像ファイルを選んでください。");
      return;
    }

    setMeasured(false);
    setPhotoError("");
    const url = URL.createObjectURL(file);
    const base: PhotoInfo = {
      name: file.name,
      url,
      type: file.type || "application/octet-stream",
      sizeMB: file.size / 1_000_000,
      previewable: false,
    };
    const image = new Image();
    image.onload = () => {
      setPhoto({ ...base, width: image.naturalWidth, height: image.naturalHeight, previewable: true });
    };
    image.onerror = () => {
      setPhoto(base);
      setPhotoError("この形式はブラウザ内でプレビューできませんが、容量と形式は照合できます。JPEGへ書き出すと応募条件を詳しく確認できます。");
    };
    image.src = url;
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    loadFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    loadFile(event.dataTransfer.files?.[0]);
  }

  function runMeasure() {
    setMeasured(true);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }

  function toggleSaved(id: string) {
    setSaved((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function clearPassport() {
    if (photo?.url) URL.revokeObjectURL(photo.url);
    setPhoto(null);
    setPhotoError("");
    setMeasured(false);
    setProfile(defaultProfile);
    try {
      localStorage.removeItem(PROFILE_KEY);
    } catch {
      // Ignore unavailable storage.
    }
  }

  function choosePrefecture(prefecture: string) {
    updateProfile("capturePrefecture", prefecture);
    setMarketFilter("domestic");
    setMeasured(true);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="写真コンテストものさし ホーム">
          <span className="ruler-mark" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <span>写真コンテストものさし</span>
          <small>BETA</small>
        </a>
        <nav aria-label="メインナビゲーション">
          <a href="#measure">この写真を測る</a>
          <a href="#local-coverage">地方公募の空白</a>
          <a href="#channels">フォーム以外の入口</a>
          <a href="#trends">過去作の手掛かり</a>
          <button type="button" onClick={() => setSavedOpen(true)}>
            あとで見る <span>{saved.length}</span>
          </button>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">ONE PHOTOGRAPH · WORLDWIDE DESTINATIONS</p>
          <h1>この一枚を、<br /><em>どこへ出せるか。</em></h1>
          <p className="hero-lede">
            世界から応募できる賞・オープンコールを含む{opportunities.length}の応募ルートと、{discoveryChannels.length}のキュレーション／探索経路から探します。公式フォームだけでなく、ハッシュタグ、写真プラットフォーム、編集部への作品送付も別の入口として照合します。写真は任意です。
          </p>
          <div className="hero-principles" aria-label="このサイトの原則">
            <span><b>01</b> 写真は端末内だけ</span>
            <span><b>02</b> AI採点をしない</span>
            <span><b>03</b> 根拠から公式へ</span>
          </div>
        </div>

        <div className="light-table-wrap" id="measure">
          <div className="light-table" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
            <span className="corner corner-tl" aria-hidden="true" />
            <span className="corner corner-tr" aria-hidden="true" />
            <span className="corner corner-bl" aria-hidden="true" />
            <span className="corner corner-br" aria-hidden="true" />
            {photo?.previewable ? (
              // Object URLs remain on the device and are intentionally used instead of an image host.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.url} alt="選択した応募候補写真" className="photo-preview" />
            ) : photo ? (
              <div className="unpreviewable">
                <span aria-hidden="true">□</span>
                <b>{photo.name}</b>
                <small>プレビュー非対応</small>
              </div>
            ) : (
              <div className="empty-frame" aria-hidden="true">
                <div className="empty-horizon" />
                <div className="empty-sun" />
              </div>
            )}
            <button className="file-trigger" type="button" onClick={() => fileInputRef.current?.click()}>
              <span>{photo ? "別の写真を選ぶ" : "写真を置く（任意）"}</span>
              <small>{photo ? "またはドラッグ＆ドロップ" : "形式・容量・寸法も確認できます"}</small>
            </button>
            <input
              ref={fileInputRef}
              className="visually-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/tiff"
              onChange={onFileChange}
              aria-label="応募候補の写真を選ぶ"
            />
          </div>
          <div className="privacy-slip">
            <span className="lock-dot" aria-hidden="true" />
            <p><b>写真なしでも検索できます。</b><br />置いた写真は送信せず、閉じれば消えます。</p>
          </div>
        </div>
      </section>

      <section className="passport-section" aria-labelledby="passport-title">
        <div className="section-heading">
          <p>PHOTO PASSPORT</p>
          <h2 id="passport-title">作品カルテ</h2>
          <span>画像だけでは分からない応募条件を、本人の回答で補います。</span>
        </div>

        <div className="passport-ledger">
          <section className="ledger-block">
            <div className="ledger-number">A</div>
            <div className="ledger-content">
              <h3>作品の形</h3>
              <label>単写真 / シリーズ</label>
              <Segmented
                label="作品形式"
                value={profile.workType}
                options={[{ value: "unknown", label: "未回答" }, { value: "single", label: "単写真" }, { value: "series", label: "シリーズ" }]}
                onChange={(value) => updateProfile("workType", value)}
              />
              {profile.workType === "series" && (
                <label className="number-field">
                  <span>構成枚数</span>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={profile.seriesCount ?? ""}
                    placeholder="例 5"
                    onChange={(event) => updateProfile("seriesCount", event.target.value ? Number(event.target.value) : null)}
                  />
                  <small>枚</small>
                </label>
              )}
              <label>カラー / モノクロ</label>
              <Segmented
                label="カラー形式"
                value={profile.tone}
                options={[{ value: "unknown", label: "未回答" }, { value: "color", label: "カラー" }, { value: "monochrome", label: "モノクロ" }]}
                onChange={(value) => updateProfile("tone", value)}
              />
              <label className="number-field">
                <span>撮影年</span>
                <input
                  type="number"
                  min="1900"
                  max="2027"
                  value={profile.shotYear ?? ""}
                  placeholder="例 2026"
                  onChange={(event) => {
                    const shotYear = event.target.value ? Number(event.target.value) : null;
                    setProfile((current) => ({
                      ...current,
                      shotYear,
                      shotDate: current.shotDate && shotYear !== Number(current.shotDate.slice(0, 4)) ? "" : current.shotDate,
                    }));
                  }}
                />
                <small>年</small>
              </label>
              <label>撮影日（分かる場合）</label>
              <input
                type="date"
                max="2027-12-31"
                value={profile.shotDate}
                onChange={(event) => {
                  const shotDate = event.target.value;
                  setProfile((current) => ({
                    ...current,
                    shotDate,
                    shotYear: shotDate ? Number(shotDate.slice(0, 4)) : current.shotYear,
                  }));
                }}
              />
              <label>撮影した都道府県</label>
              <select value={profile.capturePrefecture} onChange={(event) => updateProfile("capturePrefecture", event.target.value)}>
                <option value="unknown">未回答・日本国外</option>
                {prefectures.map((prefecture) => <option value={prefecture} key={prefecture}>{prefecture}</option>)}
              </select>
              <p className="field-note">市町村・施設など、都道府県より細かい対象範囲は候補ごとに「要確認」として残します。</p>
              <label>撮影したカメラ／端末</label>
              <select value={profile.captureDevice} onChange={(event) => updateProfile("captureDevice", event.target.value as Profile["captureDevice"])}>
                <option value="unknown">未回答・不明</option>
                <option value="oppo_family">OPPO／OnePlus／realme</option>
                <option value="leica">Leicaボディ</option>
                <option value="other">その他</option>
              </select>
            </div>
          </section>

          <section className="ledger-block ledger-subjects">
            <div className="ledger-number">B</div>
            <div className="ledger-content">
              <h3>写真が扱うもの</h3>
              <p className="field-hint">当てはまるものを複数選べます。価値判断ではなく、部門を探すための札です。</p>
              <div className="subject-grid">
                {(Object.keys(subjectLabels) as Subject[]).map((subject) => (
                  <button
                    type="button"
                    key={subject}
                    aria-pressed={profile.subjects.includes(subject)}
                    className={profile.subjects.includes(subject) ? "is-selected" : ""}
                    onClick={() => toggleSubject(subject)}
                  >
                    <span aria-hidden="true">{profile.subjects.includes(subject) ? "●" : "○"}</span>
                    {subjectLabels[subject]}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="ledger-block">
            <div className="ledger-number">C</div>
            <div className="ledger-content">
              <h3>発表と編集</h3>
              <label>これまでの発表</label>
              <select value={profile.publication} onChange={(event) => updateProfile("publication", event.target.value as Profile["publication"])}>
                <option value="unknown">未回答</option>
                <option value="unpublished">未発表</option>
                <option value="social">SNS・個人サイトのみ</option>
                <option value="commercial">展示・出版・商用利用済み</option>
                <option value="awarded">他コンテストで受賞・入選済み</option>
              </select>
              <label>編集の範囲</label>
              <select value={profile.editing} onChange={(event) => updateProfile("editing", event.target.value as Profile["editing"])}>
                <option value="unknown">未回答・判断できない</option>
                <option value="basic">色・明るさ・トリミングなど基本補正</option>
                <option value="composite">自分の写真同士の合成・要素の追加削除</option>
                <option value="generative_edit">生成塗り足し・生成AIによる要素の追加削除</option>
                <option value="generated_origin">作品の起点がAI生成画像</option>
              </select>
              <label>同じ写真・類似カットを他公募へ応募中か</label>
              <Segmented
                label="他公募への応募状況"
                value={profile.otherContest}
                options={[{ value: "unknown", label: "未回答" }, { value: "no", label: "いいえ" }, { value: "yes", label: "はい" }]}
                onChange={(value) => updateProfile("otherContest", value)}
              />
            </div>
          </section>

          <section className="ledger-block">
            <div className="ledger-number">D</div>
            <div className="ledger-content">
              <h3>応募する人</h3>
              <label className="number-field">
                <span>締切時点の年齢</span>
                <input type="number" min="1" max="120" value={profile.age ?? ""} placeholder="例 35" onChange={(event) => updateProfile("age", event.target.value ? Number(event.target.value) : null)} />
                <small>歳</small>
              </label>
              <label>高等教育で写真プログラムを履修中か</label>
              <Segmented
                label="写真プログラムの履修"
                value={profile.student}
                options={[{ value: "unknown", label: "未回答" }, { value: "no", label: "いいえ" }, { value: "yes", label: "はい" }]}
                onChange={(value) => updateProfile("student", value)}
              />
              {profile.student === "yes" && (
                <>
                  <label>所属教育機関がSonyの登録校か</label>
                  <Segmented
                    label="教育機関の登録"
                    value={profile.institutionRegistered}
                    options={[{ value: "unknown", label: "未確認" }, { value: "no", label: "いいえ" }, { value: "yes", label: "はい" }]}
                    onChange={(value) => updateProfile("institutionRegistered", value)}
                  />
                </>
              )}
              <label>活動区分</label>
              <Segmented
                label="活動区分"
                value={profile.role}
                options={[{ value: "unknown", label: "未回答" }, { value: "nonprofessional", label: "写真収入が主ではない" }, { value: "professional", label: "写真収入が主" }]}
                onChange={(value) => updateProfile("role", value)}
              />
              <label>居住・市民権の範囲</label>
              <select value={profile.residence} onChange={(event) => updateProfile("residence", event.target.value as Profile["residence"])}>
                <option value="unknown">未回答</option>
                <option value="japan">日本</option>
                <option value="other_apec">日本以外のAPECエコノミー</option>
                <option value="other">その他</option>
              </select>
              <label>SNS投稿型の応募も使えるか</label>
              <Segmented
                label="SNS投稿型の応募"
                value={profile.socialEntry}
                options={[{ value: "unknown", label: "未回答" }, { value: "no", label: "使わない" }, { value: "yes", label: "使える" }]}
                onChange={(value) => updateProfile("socialEntry", value)}
              />
              {profile.socialEntry === "yes" && (
                <>
                  <label>応募期間中に公開アカウントで投稿できるか</label>
                  <Segmented
                    label="公開SNSアカウント"
                    value={profile.publicSocialAccount}
                    options={[{ value: "unknown", label: "未確認" }, { value: "no", label: "非公開のみ" }, { value: "yes", label: "公開できる" }]}
                    onChange={(value) => updateProfile("publicSocialAccount", value)}
                  />
                </>
              )}
              <label>Flickr・LFI・Photocrowdなどへ登録して提出できるか</label>
              <Segmented
                label="外部写真サービスからの応募"
                value={profile.platformEntry}
                options={[{ value: "unknown", label: "未回答" }, { value: "no", label: "登録しない" }, { value: "yes", label: "使える" }]}
                onChange={(value) => updateProfile("platformEntry", value)}
              />
              <label>週テーマに合わせた新作も撮るか</label>
              <Segmented
                label="新作撮影型の入口"
                value={profile.canShootNew}
                options={[{ value: "unknown", label: "未回答" }, { value: "no", label: "手元の写真だけ" }, { value: "yes", label: "新作も撮る" }]}
                onChange={(value) => updateProfile("canShootNew", value)}
              />
              <label>応募費用の希望</label>
              <Segmented
                label="応募費用の希望"
                value={profile.feePreference}
                options={[{ value: "any", label: "有料も見る" }, { value: "free", label: "無料のみ優先" }]}
                onChange={(value) => updateProfile("feePreference", value)}
              />
              <label>作品の著作権・応募権を自分が持つか</label>
              <Segmented
                label="著作権と応募権"
                value={profile.ownsRights}
                options={[{ value: "unknown", label: "未回答" }, { value: "no", label: "いいえ" }, { value: "yes", label: "はい" }]}
                onChange={(value) => updateProfile("ownsRights", value)}
              />
              <label>識別できる人物の許諾</label>
              <select value={profile.peoplePermission} onChange={(event) => updateProfile("peoplePermission", event.target.value as Profile["peoplePermission"])}>
                <option value="unknown">未回答</option>
                <option value="not_applicable">識別できる人物はいない</option>
                <option value="yes">必要な同意・許諾がある</option>
                <option value="no">必要な同意・許諾がない</option>
              </select>
            </div>
          </section>
        </div>

        <div className="measure-actions">
          <button className="measure-button" type="button" onClick={runMeasure}>
            <span className="measure-ruler" aria-hidden="true" />
            この一枚の行き先を測る
          </button>
          <button className="clear-button" type="button" onClick={clearPassport}>カルテを消す</button>
          {photo && (
            <p className="file-facts">
              <b>{photo.name}</b>
              <span>{photo.type.replace("image/", "").toUpperCase()} · {photo.sizeMB.toFixed(1)}MB{photo.width ? ` · ${photo.width}×${photo.height}px` : ""}</span>
            </p>
          )}
          {photoError && <p className="photo-error" role="alert">{photoError}</p>}
        </div>
      </section>

      <section className="local-coverage" id="local-coverage" aria-labelledby="local-coverage-title">
        <div className="coverage-heading">
          <div>
            <p>47-PREFECTURE RESEARCH LEDGER</p>
            <h2 id="local-coverage-title">地方公募の調査台帳</h2>
          </div>
          <p>
            地方自治体・観光協会などの公式要項をたどり、撮影地が限定される小規模公募を県単位で記録しています。色のない県は「公募がない」のではなく、現行募集をまだ収録できていない調査空白です。
          </p>
        </div>
        <div className="coverage-tally" aria-label="地方公募の調査状況">
          <span><b>{coveredPrefectureCount}</b><small>確認済みの都道府県</small></span>
          <span><b>{prefectures.length - coveredPrefectureCount}</b><small>未収録・確認中</small></span>
          <span><b>{Object.values(localRouteCounts).reduce((total, count) => total + count, 0)}</b><small>地域限定ルート</small></span>
        </div>
        <p className="coverage-instruction">県名を選ぶと、その撮影地を作品カルテへ入れて国内公募の判定結果へ移動します。</p>
        <div className="prefecture-grid">
          {prefectures.map((prefecture, index) => {
            const routeCount = localRouteCounts[prefecture] ?? 0;
            const covered = routeCount > 0;
            const selected = profile.capturePrefecture === prefecture;
            return (
              <button
                type="button"
                key={prefecture}
                className={`${covered ? "is-covered" : "is-missing"}${selected ? " is-current" : ""}`}
                aria-pressed={selected}
                onClick={() => choosePrefecture(prefecture)}
                title={covered ? `${routeCount}件の地域限定ルートを確認済み` : "現行募集を未収録・確認中"}
              >
                <small>{String(index + 1).padStart(2, "0")}</small>
                <span>{prefecture}</span>
                <b>{covered ? `${routeCount}件` : "空白"}</b>
              </button>
            );
          })}
        </div>
        <p className="coverage-caveat">
          収録基準は、主催者の公式ページで現在または次回の募集期間を確認できることです。募集回の表示が古い、日付が食い違う、要項PDFを確認できない場合は候補数へ入れません。
        </p>
      </section>

      {measured && (
        <section className="results-section" ref={resultsRef} id="results" aria-labelledby="results-title">
          <div className="results-head">
            <div>
              <p className="eyebrow">MEASURED AGAINST {filteredAssessments.length} OF {opportunities.length} ENTRY ROUTES</p>
              <h2 id="results-title">この一枚の候補</h2>
            </div>
            <div className="result-counts" aria-label="表示中の判定件数" aria-live="polite">
              <span className="count-eligible"><b>{counts.eligible}</b> 不一致なし</span>
              <span className="count-check"><b>{counts.needs_check}</b> 要確認</span>
              <span className="count-fail"><b>{counts.ineligible}</b> 不一致</span>
            </div>
          </div>
          <p className="results-note">
            これは受賞可能性ではありません。未回答を推測で埋めず、確認できない条件は「要確認」に残します。国内は主催者所在地が日本の公募、海外・国際はそれ以外として分類します。地方公募では撮影都道府県を先に照合し、市町村・施設など細かな境界は「撮影地域の詳細」で公式要項へ戻します。
          </p>
          <div className="market-filter" role="group" aria-label="国内・海外の表示切替">
            <button type="button" className={marketFilter === "all" ? "is-selected" : ""} aria-pressed={marketFilter === "all"} onClick={() => setMarketFilter("all")}>
              <small>ALL ROUTES</small><span>すべて</span><b>{opportunities.length}</b>
            </button>
            <button type="button" className={marketFilter === "domestic" ? "is-selected" : ""} aria-pressed={marketFilter === "domestic"} onClick={() => setMarketFilter("domestic")}>
              <small>JAPAN</small><span>国内公募</span><b>{marketCounts.domestic}</b>
            </button>
            <button type="button" className={marketFilter === "international" ? "is-selected" : ""} aria-pressed={marketFilter === "international"} onClick={() => setMarketFilter("international")}>
              <small>GLOBAL</small><span>海外・国際公募</span><b>{marketCounts.international}</b>
            </button>
          </div>
          <div className="precision-legend" aria-label="判定記号の説明">
            <span><b>×</b> 明示条件の不一致</span>
            <span><b>△</b> 未回答・公式未確認</span>
            <span><b>↺</b> 書き出しで調整</span>
            <span><b>◇</b> 部門候補の参考</span>
          </div>

          <div className="results-list">
            {filteredAssessments.map((assessment, index) => {
              const meta = verdictMeta[assessment.verdict];
              const savedAlready = saved.includes(assessment.opportunity.id);
              const proximity = deadlineProximity(assessment.opportunity);
              const primaryChecks = assessment.checks.filter((item) => item.kind !== "pass").slice(0, 4);
              return (
                <article className={`result-row verdict-${assessment.verdict}`} key={assessment.opportunity.id}>
                  <div className="result-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="result-main">
                    <div className="result-titleline">
                      <div>
                        <p><span className={`market-stamp market-${assessment.opportunity.marketScope}`}>{marketLabels[assessment.opportunity.marketScope]}</span>{assessment.opportunity.parent}{assessment.opportunity.organizerRegion ? ` · ${assessment.opportunity.organizerRegion}` : ""}</p>
                        <h3>{assessment.opportunity.title}</h3>
                        <span className="submission-badge">
                          {assessment.opportunity.opportunityKind ? opportunityKindLabels[assessment.opportunity.opportunityKind] : "賞・コンテスト"}
                          <b>{assessment.opportunity.submissionLabel ?? "応募方式は公式要項で確認"}</b>
                        </span>
                      </div>
                      <span className="verdict-label"><b aria-hidden="true">{meta.mark}</b>{meta.label}</span>
                    </div>
                    <dl className="result-facts">
                      <div><dt>締切</dt><dd>{assessment.opportunity.deadlineLabel}{proximity && <em>{proximity}</em>}</dd></div>
                      <div><dt>費用</dt><dd>{assessment.opportunity.feeLabel}{assessment.preferenceMiss && <em>希望外</em>}</dd></div>
                      <div><dt>応募地域</dt><dd>{assessment.opportunity.applicantScope === "worldwide" ? "世界各国から応募可" : assessment.opportunity.applicantScopeLabel ?? "公式要項で確認"}{assessment.opportunity.entryLanguage && <em>{assessment.opportunity.entryLanguage}</em>}</dd></div>
                      <div><dt>撮影地域</dt><dd>{assessment.opportunity.shotLocationRule ?? "撮影地の指定なし／公式要項で確認"}</dd></div>
                      <div><dt>部門との共通点</dt><dd>{assessment.commonSubjects.length ? assessment.commonSubjects.map((subject) => subjectLabels[subject]).join("・") : assessment.opportunity.subjects.includes("all") && assessment.opportunity.categorySelectionRequired ? "公式画面で部門選択" : assessment.opportunity.subjects.includes("all") ? "題材を限定しない応募枠" : "自己申告タグとの共通なし"}</dd></div>
                      <div><dt>公式根拠の確認範囲</dt><dd>{assessment.evidenceCovered}/{assessment.evidenceTotal}条項{assessment.preparation > 0 && <em>提出準備 {assessment.preparation}件</em>}</dd></div>
                    </dl>

                    {primaryChecks.length > 0 ? (
                      <ul className="check-list">
                        {primaryChecks.map((check, checkIndex) => (
                          <li className={`check-${check.kind}`} key={`${check.label}-${checkIndex}`}>
                            <span>{check.kind === "fail" ? "×" : check.kind === "preference" ? "↘" : check.kind === "prepare" ? "↺" : check.kind === "fit" ? "◇" : "?"}</span>
                            <p><b>{check.label}</b>{check.detail}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="all-pass">回答済み項目と確認済み要項の範囲では、不一致は見つかりませんでした。</p>
                    )}

                    <details>
                      <summary>確認した条件をすべて見る</summary>
                      <ul className="all-checks">
                        {assessment.checks.map((check, checkIndex) => (
                          <li key={`${check.label}-all-${checkIndex}`}><span>{check.kind === "pass" ? "○" : check.kind === "fail" ? "×" : check.kind === "preference" ? "↘" : check.kind === "prepare" ? "↺" : check.kind === "fit" ? "◇" : "△"}</span><b>{check.label}</b>{check.detail}</li>
                        ))}
                      </ul>
                      <p className="warning-line"><b>応募前の注意</b>{assessment.opportunity.warning}</p>
                    </details>
                  </div>
                  <div className="result-actions">
                    <button type="button" className={savedAlready ? "saved" : ""} aria-pressed={savedAlready} onClick={() => toggleSaved(assessment.opportunity.id)}>
                      {savedAlready ? "★ 保存済み" : "☆ あとで見る"}
                    </button>
                    <a href={assessment.opportunity.sourceUrl} target="_blank" rel="noreferrer">
                      <span>公式要項</span><small>{assessment.opportunity.verifiedAt} 確認</small>
                    </a>
                    {trends.some((trend) => trend.id === assessment.opportunity.trendGroup) && (
                      <a className="trend-jump" href={`#trend-${assessment.opportunity.trendGroup}`}>過去作の手掛かりへ ↓</a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="channels-section" id="channels" aria-labelledby="channels-title">
        <div className="section-heading">
          <p>BEYOND THE ENTRY FORM</p>
          <h2 id="channels-title">フォーム以外の入口</h2>
          <span>{discoveryChannels.length}の週次・月次・常設入口を、作品カルテと照合します。受賞・掲載・参加・新作撮影を混同せず、次にすることまで示します。</span>
        </div>

        <div className="channel-key" aria-label="探索先の判定件数">
          <span><b><i>{discoveryCounts.ready}</i> 使える見込み</b>回答済み条件では大きな不一致なし</span>
          <span><b><i>{discoveryCounts.prepare}</i> 準備・確認あり</b>タグ・テーマ・撮影日・登録などが必要</span>
          <span><b><i>{discoveryCounts.not_fit}</i> 今回の条件外</b>機材・公開方法・作品形式などが不一致</span>
        </div>

        <div className="channel-grid">
          {discoveryAssessments.map((assessment, index) => {
            const channel = assessment.channel;
            const meta = discoveryVerdictMeta[assessment.verdict];
            const evidenceValues = Object.values(channel.evidence);
            const evidenceCovered = evidenceValues.filter((value) => value === "explicit" || value === "conditional" || value === "not_applicable").length;
            const primaryChecks = assessment.checks.filter((check) => check.kind !== "pass").slice(0, 4);
            return (
              <article className={`channel-card channel-${assessment.verdict}`} key={channel.id}>
                <div className="channel-number">PATH {String(index + 1).padStart(2, "0")}</div>
                <div className="channel-titleline">
                  <div>
                    <p>{channel.organizer}</p>
                    <h3>{channel.title}</h3>
                  </div>
                  <div className="channel-labels">
                    <span>{channel.kind}</span>
                    <b><i aria-hidden="true">{meta.mark}</i>{meta.label}</b>
                  </div>
                </div>
                <dl>
                  <div><dt>頻度</dt><dd>{channel.cadence}</dd></div>
                  <div><dt>入口</dt><dd>{channel.submissionLabel}</dd></div>
                  <div><dt>到達点</dt><dd>{channel.outcome}</dd></div>
                  <div><dt>前提</dt><dd>{channel.eligibilityLabel}</dd></div>
                </dl>
                {primaryChecks.length > 0 ? (
                  <ul className="channel-match-list" aria-label="この作品との照合">
                    {primaryChecks.map((check, checkIndex) => (
                      <li className={`channel-check-${check.kind}`} key={`${check.label}-${checkIndex}`}>
                        <span>{check.kind === "fail" ? "×" : check.kind === "prepare" ? "↺" : check.kind === "fit" ? "◇" : "△"}</span>
                        <p><b>{check.label}</b>{check.detail}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="channel-ready-line">回答済み条件の範囲では、この入口を使う準備ができています。</p>
                )}
                {(channel.requiredTags.length > 0 || channel.requiredAccountTag) && (
                  <div className="channel-tags" aria-label="必要なタグ">
                    {channel.requiredTags.map((tag) => <code key={tag}>{tag}</code>)}
                    {channel.requiredAccountTag && <code>{channel.requiredAccountTag}</code>}
                  </div>
                )}
                <details className="channel-checklist">
                  <summary>投稿前のチェックリスト</summary>
                  <ul>
                    {channel.checklist.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </details>
                <p className="channel-warning">{channel.warning}</p>
                <div className="channel-foot">
                  <span>公式確認 {evidenceCovered}/{evidenceValues.length}項目 · {channel.verifiedAt}</span>
                  <a href={channel.sourceUrl} target="_blank" rel="noreferrer">公式の入口を見る ↗</a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="trend-section" id="trends" aria-labelledby="trends-title">
        <div className="section-heading light-heading">
          <p>READ THE ARCHIVE</p>
          <h2 id="trends-title">過去作を読む手掛かり</h2>
          <span>公式ギャラリーの事実と、本サイトの整理を分けて表示します。画像は無断転載せず、公式ページで見ます。</span>
        </div>

        <div className="trend-grid">
          {trends.map((trend, index) => (
            <article className="trend-card" id={`trend-${trend.id}`} key={trend.id}>
              <div className="contact-strip" aria-hidden="true">
                {[0, 1, 2].map((cell) => <span key={cell}><i>{String(index * 3 + cell + 1).padStart(2, "0")}</i></span>)}
              </div>
              <div className="trend-body">
                <div className="trend-kicker"><span>{trend.years}</span>{trend.kind}</div>
                <h3>{trend.title}</h3>
                <p className="sample-label">観察範囲: {trend.sampleLabel}</p>
                <p>{trend.summary}</p>
                <ul className="observation-list">
                  {trend.observations.map((observation) => <li key={observation}>{observation}</li>)}
                </ul>
                <div className="work-slips">
                  {trend.works.map((work) => (
                    <div key={`${work.title}-${work.author}`}>
                      <span>{work.award}</span>
                      <b>{work.title}</b>
                      <small>{work.author}</small>
                    </div>
                  ))}
                </div>
                <a className="archive-link" href={trend.url} target="_blank" rel="noreferrer">
                  公式ギャラリーで作品を見る <span aria-hidden="true">↗</span>
                </a>
                <p className="trend-caveat">公開作品だけを対象にした手掛かりです。応募全体や次回審査の傾向を保証しません。</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="method-section" id="method" aria-labelledby="method-title">
        <div className="method-intro">
          <p className="eyebrow">HOW THE RULER WORKS</p>
          <h2 id="method-title">一つの点数にしない理由</h2>
          <p>応募できること、部門に題材が合うこと、過去に選ばれた作品と似ていることは、まったく別の話です。</p>
        </div>
        <ol className="method-list">
          <li><span>1</span><div><h3>要項の事実</h3><p>年齢、撮影年、形式、容量、発表歴など。公式に書かれた条件だけを三値で照合します。</p></div></li>
          <li><span>2</span><div><h3>本人の作品カルテ</h3><p>画像から断定できない発表歴や編集を本人が補います。写真の価値は採点しません。</p></div></li>
          <li><span>3</span><div><h3>過去作の手掛かり</h3><p>年度・部門・標本範囲を示し、公式ギャラリーへ戻れる形で観察材料を置きます。</p></div></li>
        </ol>
        <aside>
          <b>最終確認は必ず公式要項で。</b>
          <p>締切・費用・権利・AI規定は変更されます。「要確認」は情報が弱いことを隠さないための表示です。</p>
        </aside>
      </section>

      <footer>
        <div className="footer-brand">
          <span className="ruler-mark footer-ruler" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <div><b>写真コンテストものさし</b><small>一枚の行き先を、根拠から測る。</small></div>
        </div>
        <div className="footer-copy">
          <p>掲載情報は2026年7月23日に各主催者の公式ページで再確認した実証用MVPです。応募前に必ず最新要項をご確認ください。</p>
          <p>写真は送信・保存しません。カルテと「あとで見る」のIDだけをこの端末に保存します。</p>
        </div>
        <nav className="footer-links" aria-label="補足情報">
          <a href="/quality-report.html" target="_blank" rel="noreferrer">精度監査レポート ↗</a>
          <a href="#method">調べ方と判定の限界</a>
        </nav>
      </footer>

      {savedOpen && (
        <div className="saved-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSavedOpen(false); }}>
          <section className="saved-drawer" role="dialog" aria-modal="true" aria-labelledby="saved-title">
            <div className="saved-head">
              <div><p>LOCAL SHORTLIST</p><h2 id="saved-title">あとで見る</h2></div>
              <button type="button" onClick={() => setSavedOpen(false)} aria-label="あとで見るを閉じる">×</button>
            </div>
            <p className="saved-privacy">保存しているのは応募枠のIDだけです。写真は保存されません。</p>
            {hasSonySeriesConflict && (
              <div className="conflict-note" role="alert">
                <b>同じ作品群を使えない組み合わせがあります</b>
                <p>SonyのSingle ImageとSeriesへ両方応募する場合は、異なる作品群を使う必要があります。</p>
              </div>
            )}
            {savedItems.length ? (
              <div className="saved-list">
                {savedItems.map((item) => (
                  <article key={item.id}>
                    <div><p>{item.parent}</p><h3>{item.title}</h3><span>{item.deadlineLabel}</span></div>
                    <button type="button" onClick={() => toggleSaved(item.id)}>外す</button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="saved-empty"><span>☆</span><p>まだ保存した応募枠はありません。<br />判定結果の「あとで見る」から追加できます。</p></div>
            )}
            {savedItems.length > 0 && <button className="clear-saved" type="button" onClick={() => setSaved([])}>すべて外す</button>}
          </section>
        </div>
      )}
    </main>
  );
}
