#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

function updateFile(relativePath, transform) {
  const path = join(root, relativePath);
  const before = JSON.parse(readFileSync(path, 'utf8'));
  const after = transform(before);
  writeFileSync(path, `${JSON.stringify(after, null, 2)}\n`);
  return [before.length, after.length];
}

const removed = new Set([
  'tifa-professional-2026',
  'tifa-nonprofessional-2026',
  'bifa-professional-2026',
  'bifa-nonprofessional-2026',
  'hinuma-hydrangea-photo-contest-16',
  'shimane-forest-photo-contest-2026',
  'ichikikushikino-photo-contest-2026',
  'european-photography-awards-2026',
  'unesco-youth-eyes-silk-roads-2026',
]);

const counts = [];
counts.push(['base', ...updateFile('data/opportunities.json', (records) => records.filter((record) => !removed.has(record.id)))]);
counts.push(['worldwide', ...updateFile('data/worldwide-opportunities.json', (records) => records.filter((record) => !removed.has(record.id)))]);
counts.push(['domestic', ...updateFile('data/domestic-opportunities.json', (records) => records.flatMap((record) => {
  if (removed.has(record.id)) return [];
  if (record.id !== 'nakatsu-instagram-photo-contest-2026-july') return [record];
  return [{
    ...record,
    id: 'nakatsu-instagram-photo-contest-2026-august',
    title: '中津市Instagramフォトコンテスト2026 — 8月回',
    edition: '2026 8月回',
    deadline: '2026-08-31T14:59:00Z',
    deadlineLabel: '2026年8月31日（毎月末締切・投稿時刻は要確認）',
    requiredTags: ['#中津フォトコン2026', '#8月のなかつ'],
    deadlineNote: '2026年度は毎月末日が締切です。この収録は8月回（8月31日）を固定締切として表示し、翌月のテーマ・規約・継続は公式Instagramで再確認します。',
    verifiedAt: '2026-08-19',
  }];
}))]);

const removedCount = counts.reduce((sum, [, before, after]) => sum + before - after, 0);
if (removedCount !== removed.size) throw new Error(`expected ${removed.size} removals, got ${removedCount}`);
console.log(JSON.stringify({ removedCount, counts }, null, 2));
