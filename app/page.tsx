"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import opportunityData from "@/data/opportunities.json";
import trendData from "@/data/trends.json";

type Subject =
  | "portrait"
  | "street"
  | "landscape"
  | "wildlife"
  | "architecture"
  | "abstract"
  | "documentary"
  | "stilllife"
  | "sports"
  | "travel";

type Profile = {
  shotYear: number;
  workType: "single" | "series";
  seriesCount: number;
  tone: "color" | "monochrome";
  subjects: Subject[];
  age: number;
  student: boolean;
  role: "professional" | "nonprofessional";
  publication: "unpublished" | "social" | "commercial" | "awarded";
  otherContest: boolean;
  editing: "basic" | "composite" | "ai";
  feePreference: "any" | "free";
};

type Opportunity = {
  id: string;
  parent: string;
  title: string;
  edition: string;
  status: "open" | "expected" | "closed" | "unknown";
  deadline: string;
  deadlineLabel: string;
  feeType: "free" | "paid";
  feeLabel: string;
  entrantRole: "all" | "professional" | "nonprofessional";
  entrantAge: "all" | "adult" | "youth";
  studentOnly: boolean;
  workType: "single" | "series" | "both";
  seriesMin?: number;
  seriesMax?: number;
  shotYearFrom?: number;
  shotYearTo?: number;
  subjects: string[];
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

type PhotoInfo = {
  name: string;
  url: string;
  type: string;
  sizeMB: number;
  width?: number;
  height?: number;
  previewable: boolean;
};

type CheckKind = "pass" | "check" | "fail" | "preference";
type AssessmentCheck = { kind: CheckKind; label: string; detail: string };
type Verdict = "eligible" | "needs_check" | "ineligible";
type Assessment = {
  opportunity: Opportunity;
  verdict: Verdict;
  checks: AssessmentCheck[];
  commonSubjects: Subject[];
  unresolved: number;
  preferenceMiss: boolean;
};

const opportunities = opportunityData as Opportunity[];
const trends = trendData as Trend[];
const PROFILE_KEY = "photo-monosashi-profile-v1";
const SAVED_KEY = "photo-monosashi-saved-v1";

const subjectLabels: Record<Subject, string> = {
  portrait: "人物・ポートレート",
  street: "街・ストリート",
  landscape: "風景",
  wildlife: "野生動物・自然",
  architecture: "建築・構造",
  abstract: "抽象・造形",
  documentary: "記録・ドキュメンタリー",
  stilllife: "静物",
  sports: "スポーツ・動き",
  travel: "旅・文化",
};

const defaultProfile: Profile = {
  shotYear: 2026,
  workType: "single",
  seriesCount: 5,
  tone: "color",
  subjects: [],
  age: 35,
  student: false,
  role: "nonprofessional",
  publication: "unpublished",
  otherContest: false,
  editing: "basic",
  feePreference: "any",
};

const verdictMeta: Record<Verdict, { label: string; mark: string }> = {
  eligible: { label: "明示条件に適合", mark: "○" },
  needs_check: { label: "要確認", mark: "△" },
  ineligible: { label: "明示条件に不一致", mark: "×" },
};

function normalizeProfile(value: Partial<Profile>): Profile {
  const subjects = Array.isArray(value.subjects)
    ? value.subjects.filter((subject): subject is Subject => subject in subjectLabels)
    : [];
  return {
    ...defaultProfile,
    ...value,
    shotYear: Number(value.shotYear) || defaultProfile.shotYear,
    seriesCount: Number(value.seriesCount) || defaultProfile.seriesCount,
    age: Number(value.age) || defaultProfile.age,
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

function deadlineProximity(value: string) {
  const days = daysUntil(value);
  if (days < 0) return "締切経過の可能性";
  if (days === 0) return "本日締切";
  if (days <= 14) return `あと${days}日`;
  return null;
}

function assess(opportunity: Opportunity, profile: Profile, photo: PhotoInfo): Assessment {
  const checks: AssessmentCheck[] = [];
  const add = (kind: CheckKind, label: string, detail: string) => checks.push({ kind, label, detail });

  if (opportunity.workType === "both" || opportunity.workType === profile.workType) {
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
    if (profile.seriesCount >= min && profile.seriesCount <= max) {
      add("pass", "シリーズ枚数", `${profile.seriesCount}枚は規定範囲内`);
    } else {
      add("fail", "シリーズ枚数", `${min}〜${max}枚が必要`);
    }
  }

  if (opportunity.entrantAge === "youth") {
    add(profile.age <= 19 ? "pass" : "fail", "年齢", "締切日時点で19歳以下が対象");
  } else if (opportunity.entrantAge === "adult") {
    add(profile.age >= 18 ? "pass" : "fail", "年齢", "18歳以上が対象");
  } else {
    add("pass", "年齢", "年齢を問わない応募枠");
  }

  if (opportunity.studentOnly) {
    if (!profile.student) {
      add("fail", "学生資格", "高等教育の写真プログラム履修者が対象");
    } else if (profile.age < 18 || profile.age > 30) {
      add("fail", "学生資格", "学生部門は18〜30歳が対象");
    } else {
      add("check", "学生資格", "所属教育機関の登録状況を公式サイトで確認");
    }
  }

  if (opportunity.entrantRole !== "all") {
    if (opportunity.entrantRole === profile.role) {
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
    if (profile.shotYear >= from && profile.shotYear <= to) {
      add("pass", "撮影年", `${profile.shotYear}年は対象期間内`);
    } else {
      add("fail", "撮影年", `${from}${from !== to ? `〜${to}` : ""}年に撮影した作品が対象`);
    }
  } else {
    add("check", "撮影・公開時期", "未公開作品と公開済み作品で条件が異なるため要項を確認");
  }

  const allSubjects = opportunity.subjects.includes("all");
  const commonSubjects = profile.subjects.filter((subject) => opportunity.subjects.includes(subject));
  if (allSubjects) {
    add("pass", "題材・部門", "幅広い題材を受け付ける応募枠");
  } else if (profile.subjects.length === 0) {
    add("check", "題材・部門", "作品の題材を選ぶと部門との対応を確認できます");
  } else if (commonSubjects.length > 0) {
    add("pass", "題材・部門", commonSubjects.map((subject) => subjectLabels[subject]).join("・"));
  } else {
    add("fail", "題材・部門", "選んだ題材とこの部門の主題が一致しません");
  }

  if (opportunity.tones.includes(profile.tone)) {
    add("pass", "カラー形式", profile.tone === "color" ? "カラー作品に対応" : "モノクロ作品に対応");
  }

  if (opportunity.formats.length > 0) {
    if (opportunity.formats.includes(photo.type)) {
      add("pass", "ファイル形式", photo.type === "image/jpeg" ? "JPEG" : photo.type);
    } else {
      add("fail", "ファイル形式", `${opportunity.formats.map((value) => value.replace("image/", "").toUpperCase()).join(" / ")}へ書き出しが必要`);
    }
  }

  if (opportunity.minFileMB && photo.sizeMB < opportunity.minFileMB) {
    add("fail", "ファイル容量", `${opportunity.minFileMB}MB以上が必要（現在${photo.sizeMB.toFixed(1)}MB）`);
  } else if (opportunity.maxFileMB && photo.sizeMB > opportunity.maxFileMB) {
    add("fail", "ファイル容量", `${opportunity.maxFileMB}MB以下が必要（現在${photo.sizeMB.toFixed(1)}MB）`);
  } else if (opportunity.minFileMB || opportunity.maxFileMB) {
    add("pass", "ファイル容量", `${photo.sizeMB.toFixed(1)}MBは記載範囲内`);
  }

  const longEdge = photo.width && photo.height ? Math.max(photo.width, photo.height) : null;
  if (opportunity.minLongEdge || opportunity.maxLongEdge) {
    if (!longEdge) {
      add("check", "ピクセル寸法", "この形式ではブラウザから寸法を読み取れませんでした");
    } else if (opportunity.minLongEdge && longEdge < opportunity.minLongEdge) {
      add("fail", "ピクセル寸法", `長辺${opportunity.minLongEdge}px以上が必要（現在${longEdge}px）`);
    } else if (opportunity.maxLongEdge && longEdge > opportunity.maxLongEdge) {
      add("fail", "ピクセル寸法", `長辺${opportunity.maxLongEdge}px以下が必要（現在${longEdge}px）`);
    } else {
      add("pass", "ピクセル寸法", `長辺${longEdge}pxは記載範囲内`);
    }
  }

  if (profile.publication === "awarded") {
    if (opportunity.priorAwardPolicy === "allowed") {
      add("pass", "過去の受賞", "過去に受賞した作品も応募可と明記");
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
    add(
      opportunity.publicationPolicy === "allowed" ? "pass" : "check",
      "発表歴",
      opportunity.publicationPolicy === "allowed" ? "公開済み作品も応募可と明記" : "SNS公開済み作品の扱いを確認",
    );
  } else {
    add("pass", "発表歴", "未発表として照合");
  }

  if (profile.otherContest) {
    add(
      opportunity.simultaneousPolicy === "allowed_with_notes" ? "check" : "check",
      "同時応募",
      "他公募へ応募中。結果確定までの拘束や同一・類似作の規定を必ず確認",
    );
  }

  if (profile.editing === "ai") {
    if (opportunity.aiPolicy === "separate_category") {
      add("check", "生成AI", "AI生成専用カテゴリーと通常写真部門の境界を確認");
    } else {
      add("check", "生成AI", "生成AI・AI編集の扱いを最新要項で確認");
    }
  } else if (profile.editing === "composite") {
    add(
      opportunity.editPolicy === "allowed_by_category" ? "check" : "check",
      "合成・大幅編集",
      "部門ごとの編集規定と、素材がすべて本人撮影かを確認",
    );
  } else {
    add("pass", "編集", "基本補正・トリミングとして照合");
  }

  const preferenceMiss = profile.feePreference === "free" && opportunity.feeType === "paid";
  if (preferenceMiss) {
    add("preference", "費用希望", "無料のみの希望から外れます");
  }

  const hasFail = checks.some((item) => item.kind === "fail");
  const hasCheck = checks.some((item) => item.kind === "check");
  const verdict: Verdict = hasFail ? "ineligible" : hasCheck ? "needs_check" : "eligible";
  return {
    opportunity,
    verdict,
    checks,
    commonSubjects,
    unresolved: checks.filter((item) => item.kind === "check").length,
    preferenceMiss,
  };
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedProfile = localStorage.getItem(PROFILE_KEY);
        const storedSaved = localStorage.getItem(SAVED_KEY);
        if (storedProfile) {
          setProfile(normalizeProfile(JSON.parse(storedProfile)));
        }
        if (storedSaved) {
          const ids = JSON.parse(storedSaved);
          if (Array.isArray(ids)) setSaved(ids.map(String));
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
    return () => {
      if (photo?.url) URL.revokeObjectURL(photo.url);
    };
  }, [photo]);

  const assessments = useMemo(() => {
    if (!photo) return [];
    const verdictOrder: Record<Verdict, number> = { eligible: 0, needs_check: 1, ineligible: 2 };
    return opportunities
      .map((opportunity) => assess(opportunity, profile, photo))
      .sort((a, b) => {
        if (verdictOrder[a.verdict] !== verdictOrder[b.verdict]) {
          return verdictOrder[a.verdict] - verdictOrder[b.verdict];
        }
        if (a.preferenceMiss !== b.preferenceMiss) return Number(a.preferenceMiss) - Number(b.preferenceMiss);
        if (a.unresolved !== b.unresolved) return a.unresolved - b.unresolved;
        return parseDeadline(a.opportunity.deadline) - parseDeadline(b.opportunity.deadline);
      });
  }, [photo, profile]);

  const counts = useMemo(() => {
    return assessments.reduce(
      (result, item) => ({ ...result, [item.verdict]: result[item.verdict] + 1 }),
      { eligible: 0, needs_check: 0, ineligible: 0 } as Record<Verdict, number>,
    );
  }, [assessments]);

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
    if (!photo) {
      setPhotoError("先に写真を選んでください。");
      fileInputRef.current?.focus();
      return;
    }
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
          <a href="#trends">過去作の手掛かり</a>
          <button type="button" onClick={() => setSavedOpen(true)}>
            あとで見る <span>{saved.length}</span>
          </button>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">ONE PHOTOGRAPH · MANY DESTINATIONS</p>
          <h1>この一枚を、<br /><em>どこへ出せるか。</em></h1>
          <p className="hero-lede">
            傑作だと思う写真を机に置くように選んでください。応募条件と、公開された過去作を読む手掛かりを、同じ点数に混ぜずに並べます。
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
              <span>{photo ? "別の写真を選ぶ" : "写真をここに置く"}</span>
              <small>{photo ? "またはドラッグ＆ドロップ" : "ファイルを選ぶ / ドラッグ＆ドロップ"}</small>
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
            <p><b>写真はアップロードされません。</b><br />ブラウザ内で開き、閉じれば消えます。</p>
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
                options={[{ value: "single", label: "単写真" }, { value: "series", label: "シリーズ" }]}
                onChange={(value) => updateProfile("workType", value)}
              />
              {profile.workType === "series" && (
                <label className="number-field">
                  <span>構成枚数</span>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={profile.seriesCount}
                    onChange={(event) => updateProfile("seriesCount", Number(event.target.value))}
                  />
                  <small>枚</small>
                </label>
              )}
              <label>カラー / モノクロ</label>
              <Segmented
                label="カラー形式"
                value={profile.tone}
                options={[{ value: "color", label: "カラー" }, { value: "monochrome", label: "モノクロ" }]}
                onChange={(value) => updateProfile("tone", value)}
              />
              <label className="number-field">
                <span>撮影年</span>
                <input
                  type="number"
                  min="1900"
                  max="2027"
                  value={profile.shotYear}
                  onChange={(event) => updateProfile("shotYear", Number(event.target.value))}
                />
                <small>年</small>
              </label>
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
                <option value="unpublished">未発表</option>
                <option value="social">SNS・個人サイトのみ</option>
                <option value="commercial">展示・出版・商用利用済み</option>
                <option value="awarded">他コンテストで受賞・入選済み</option>
              </select>
              <label>編集の範囲</label>
              <select value={profile.editing} onChange={(event) => updateProfile("editing", event.target.value as Profile["editing"])}>
                <option value="basic">色・明るさ・トリミングなど基本補正</option>
                <option value="composite">合成・要素の追加削除・大幅編集</option>
                <option value="ai">生成AIまたはAI生成要素を使用</option>
              </select>
              <label className="check-row">
                <input type="checkbox" checked={profile.otherContest} onChange={(event) => updateProfile("otherContest", event.target.checked)} />
                <span>この写真、または類似カットを他のコンテストへ応募中</span>
              </label>
            </div>
          </section>

          <section className="ledger-block">
            <div className="ledger-number">D</div>
            <div className="ledger-content">
              <h3>応募する人</h3>
              <label className="number-field">
                <span>締切時点の年齢</span>
                <input type="number" min="1" max="120" value={profile.age} onChange={(event) => updateProfile("age", Number(event.target.value))} />
                <small>歳</small>
              </label>
              <label className="check-row">
                <input type="checkbox" checked={profile.student} onChange={(event) => updateProfile("student", event.target.checked)} />
                <span>高等教育で写真の授業・プログラムを履修中</span>
              </label>
              <label>活動区分</label>
              <Segmented
                label="活動区分"
                value={profile.role}
                options={[{ value: "nonprofessional", label: "非プロ・収入の主ではない" }, { value: "professional", label: "写真収入が主" }]}
                onChange={(value) => updateProfile("role", value)}
              />
              <label>応募費用の希望</label>
              <Segmented
                label="応募費用の希望"
                value={profile.feePreference}
                options={[{ value: "any", label: "有料も見る" }, { value: "free", label: "無料のみ優先" }]}
                onChange={(value) => updateProfile("feePreference", value)}
              />
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

      {measured && photo && (
        <section className="results-section" ref={resultsRef} id="results" aria-labelledby="results-title">
          <div className="results-head">
            <div>
              <p className="eyebrow">MEASURED AGAINST 12 ENTRY ROUTES</p>
              <h2 id="results-title">この一枚の候補</h2>
            </div>
            <div className="result-counts" aria-label="判定件数">
              <span className="count-eligible"><b>{counts.eligible}</b> 適合</span>
              <span className="count-check"><b>{counts.needs_check}</b> 要確認</span>
              <span className="count-fail"><b>{counts.ineligible}</b> 不一致</span>
            </div>
          </div>
          <p className="results-note">
            これは受賞可能性ではありません。掲載要項の明示条件と、入力したカルテに不一致があるかを確認した結果です。
          </p>

          <div className="results-list">
            {assessments.map((assessment, index) => {
              const meta = verdictMeta[assessment.verdict];
              const savedAlready = saved.includes(assessment.opportunity.id);
              const proximity = deadlineProximity(assessment.opportunity.deadline);
              const primaryChecks = assessment.checks.filter((item) => item.kind !== "pass").slice(0, 4);
              return (
                <article className={`result-row verdict-${assessment.verdict}`} key={assessment.opportunity.id}>
                  <div className="result-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="result-main">
                    <div className="result-titleline">
                      <div>
                        <p>{assessment.opportunity.parent}</p>
                        <h3>{assessment.opportunity.title}</h3>
                      </div>
                      <span className="verdict-label"><b aria-hidden="true">{meta.mark}</b>{meta.label}</span>
                    </div>
                    <dl className="result-facts">
                      <div><dt>締切</dt><dd>{assessment.opportunity.deadlineLabel}{proximity && <em>{proximity}</em>}</dd></div>
                      <div><dt>費用</dt><dd>{assessment.opportunity.feeLabel}{assessment.preferenceMiss && <em>希望外</em>}</dd></div>
                      <div><dt>部門との共通点</dt><dd>{assessment.commonSubjects.length ? assessment.commonSubjects.map((subject) => subjectLabels[subject]).join("・") : assessment.opportunity.subjects.includes("all") ? "題材を限定しない応募枠" : "なし"}</dd></div>
                    </dl>

                    {primaryChecks.length > 0 ? (
                      <ul className="check-list">
                        {primaryChecks.map((check, checkIndex) => (
                          <li className={`check-${check.kind}`} key={`${check.label}-${checkIndex}`}>
                            <span>{check.kind === "fail" ? "×" : check.kind === "preference" ? "↘" : "?"}</span>
                            <p><b>{check.label}</b>{check.detail}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="all-pass">入力した範囲では、明示条件の不一致は見つかりませんでした。</p>
                    )}

                    <details>
                      <summary>確認した条件をすべて見る</summary>
                      <ul className="all-checks">
                        {assessment.checks.map((check, checkIndex) => (
                          <li key={`${check.label}-all-${checkIndex}`}><span>{check.kind === "pass" ? "○" : check.kind === "fail" ? "×" : check.kind === "preference" ? "↘" : "△"}</span><b>{check.label}</b>{check.detail}</li>
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
          <p>掲載情報は2026年7月22日に各主催者の公式ページで確認した実証用MVPです。応募前に必ず最新要項をご確認ください。</p>
          <p>写真は送信・保存しません。カルテと「あとで見る」のIDだけをこの端末に保存します。</p>
        </div>
        <a href="#method">調べ方と判定の限界</a>
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
