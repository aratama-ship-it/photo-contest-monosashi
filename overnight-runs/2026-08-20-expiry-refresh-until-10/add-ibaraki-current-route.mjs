#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const dataPath = join(root, 'data/domestic-opportunities.json');
const records = JSON.parse(readFileSync(dataPath, 'utf8'));
const id = 'ibaraki-natural-environment-photo-contest-2026';
if (records.some((record) => record.id === id)) throw new Error(`${id} already exists`);

records.push({
  id,
  parent: '環境保全茨城県民会議・茨城県',
  title: '令和8年度 いばらき自然環境フォトコンテスト',
  edition: '2026',
  status: 'open',
  deadline: '2026-10-15',
  deadlineLabel: '2026年10月15日（締切時刻は公式ページで未確認）',
  deadlineTimezone: 'Asia/Tokyo（締切時刻は未公表）',
  organizerRegion: '日本',
  organizerCountry: '日本',
  applicantScope: 'unknown',
  applicantScopeLabel: '公式要項は「どなたでも応募可」。居住地制限は明記なし、未成年者は保護者同意が必要',
  eligibleFromJapan: true,
  entryLanguage: '日本語',
  opportunityKind: 'contest',
  submissionMethod: 'hybrid',
  submissionLabel: '公式WebフォームまたはメールでJPEGデータを送信',
  socialPostingRequired: false,
  requiresPublicSocial: false,
  requiresFollow: false,
  requiredTags: [],
  feeType: 'unknown',
  feeLabel: '応募料の記載を公式要項で確認できず',
  entrantRole: 'all',
  entrantAge: 'all',
  studentOnly: false,
  workType: 'single',
  entryLimit: 5,
  shotDatePolicy: 'needs_check',
  shotYearFrom: 2025,
  shootingPrefectures: ['茨城県'],
  shotLocationRule: '2025年10月以降に応募者自身が茨城県内で撮影した自然風景、動植物、人と自然の関わり',
  subjects: ['landscape', 'wildlife', 'nature', 'documentary'],
  categorySelectionRequired: true,
  themeRequired: '一般部門「茨城県の豊かな自然の魅力を伝える写真」またはジュニア部門「私の大好きな茨城の生き物や風景」',
  tones: [],
  formats: ['image/jpeg'],
  maxFileMB: 5,
  publicationPolicy: 'not_allowed',
  priorAwardPolicy: 'not_allowed',
  simultaneousPolicy: 'not_allowed',
  aiPolicy: 'needs_check',
  editPolicy: 'allowed_with_limits',
  rightsPolicy: 'explicit',
  deadlineNote: '公式主催者ページは2026年10月15日締切を明記していますが、時刻は公表していません。',
  evidence: {
    deadline: 'date_only',
    entrant: 'explicit',
    work: 'explicit',
    technical: 'explicit',
    publication: 'explicit',
    simultaneous: 'explicit',
    editing: 'explicit',
    rights: 'explicit',
  },
  sourceUrl: 'https://ecodane.jp/photo_contest/2026/',
  sourceLabel: '環境保全茨城県民会議 2026公式募集ページ・応募フォーム',
  verifiedAt: '2026-08-19',
  warning: '未発表作品限定で、SNS掲載作、他コンテスト応募作、類似作品も不可です。一般部門は19歳以上、ジュニア部門は18歳以下。生成AIの扱いと締切時刻は公式に明記されていないため応募前に確認してください。',
  requirements: [
    '2025年10月以降に応募者自身が茨城県内で撮影',
    'JPEG・合計5MB以下、1人合計5点まで',
    '未発表・他公募および類似作品不可。基本補正と指定の定点合成のみ条件付きで可',
  ],
  trendGroup: 'ibaraki-natural-environment-2026',
});

writeFileSync(dataPath, `${JSON.stringify(records, null, 2)}\n`);
console.log(`added ${id}`);
