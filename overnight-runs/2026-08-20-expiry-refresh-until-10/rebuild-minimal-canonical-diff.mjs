#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const files = [
  "data/opportunities.json",
  "data/worldwide-opportunities.json",
  "data/domestic-opportunities.json",
];

const currentRecords = new Map();
for (const path of files) {
  for (const record of JSON.parse(readFileSync(path, "utf8"))) currentRecords.set(record.id, record);
}

function locateObject(source, id) {
  const marker = `"id": ${JSON.stringify(id)}`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`cannot locate ${id}`);
  const start = source.lastIndexOf("  {", markerIndex);
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        let end = index + 1;
        if (source.slice(end, end + 2) === ",\n") end += 2;
        else if (source[end] === "\n") end += 1;
        return { start, end };
      }
    }
  }
  throw new Error(`unterminated object ${id}`);
}

function removeObject(source, id) {
  const { start, end } = locateObject(source, id);
  return source.slice(0, start) + source.slice(end);
}

function updateObject(source, oldId, newId = oldId) {
  const desired = currentRecords.get(newId);
  if (!desired) throw new Error(`missing current record ${newId}`);
  const { start, end } = locateObject(source, oldId);
  const originalObject = JSON.parse(source.slice(start, end).replace(/,\s*$/, ""));
  const changedKeys = [...new Set([...Object.keys(originalObject), ...Object.keys(desired)])]
    .filter((key) => JSON.stringify(originalObject[key]) !== JSON.stringify(desired[key]));
  let objectSource = source.slice(start, end);
  for (const key of changedKeys) {
    if (!(key in originalObject) || !(key in desired)) {
      throw new Error(`${oldId}.${key} requires a structural property edit`);
    }
    const linePattern = new RegExp(`^(\\s*${JSON.stringify(key).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}: ).*$`, "m");
    if (!linePattern.test(objectSource)) throw new Error(`${oldId}.${key} is not a single-line property`);
    const matchedLine = objectSource.match(linePattern)?.[0] ?? "";
    const trailingComma = matchedLine.trimEnd().endsWith(",") ? "," : "";
    objectSource = objectSource.replace(linePattern, (_match, prefix) => `${prefix}${JSON.stringify(desired[key])}${trailingComma}`);
  }
  return source.slice(0, start) + objectSource + source.slice(end);
}

function appendObject(source, id) {
  const desired = currentRecords.get(id);
  if (!desired) throw new Error(`missing current record ${id}`);
  const rendered = JSON.stringify(desired, null, 2).split("\n").map((line) => `  ${line}`).join("\n");
  return source.replace(/\n\]\s*$/, `,\n${rendered}\n]\n`);
}

const plan = {
  "data/opportunities.json": {
    remove: ["tifa-professional-2026", "tifa-nonprofessional-2026"],
    update: [],
    append: [],
  },
  "data/worldwide-opportunities.json": {
    remove: [
      "bifa-professional-2026",
      "bifa-nonprofessional-2026",
      "unesco-youth-eyes-silk-roads-2026",
      "european-photography-awards-2026",
      "lensculture-photobook-prize-2026",
    ],
    update: [
      ["hipa-determination-2026", "hipa-determination-2026"],
      ["head-on-photo-awards-2026", "head-on-photo-awards-2026"],
    ],
    append: [],
  },
  "data/domestic-opportunities.json": {
    remove: [
      "jps-nonfiction-photo-award-2026",
      "hinuma-hydrangea-photo-contest-16",
      "shimane-forest-photo-contest-2026",
      "ichikikushikino-photo-contest-2026",
    ],
    update: [
      ["nakatsu-instagram-photo-contest-2026-july", "nakatsu-instagram-photo-contest-2026-august"],
      ["nipponkodo-bonphoto-2026", "nipponkodo-bonphoto-2026"],
    ],
    append: ["ibaraki-natural-environment-photo-contest-2026"],
  },
};

for (const path of files) {
  let source = execFileSync("git", ["show", `HEAD:${path}`], { encoding: "utf8" });
  for (const id of plan[path].remove) source = removeObject(source, id);
  for (const [oldId, newId] of plan[path].update) source = updateObject(source, oldId, newId);
  for (const id of plan[path].append) source = appendObject(source, id);
  JSON.parse(source);
  writeFileSync(path, source);
  console.log(`rebuilt ${path}`);
}
