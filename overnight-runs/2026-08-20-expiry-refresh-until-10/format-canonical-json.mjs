#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const expanded = process.argv.includes("--expanded");
const expandEvidence = process.argv.includes("--expand-evidence");
const paths = process.argv.slice(2).filter((path) => !["--expanded", "--expand-evidence"].includes(path));
if (paths.length === 0) throw new Error("pass one or more JSON paths");

const scalar = (value) => value === null || typeof value !== "object";

function format(value, depth = 0, compactObject = false, forceExpandedArray = false) {
  if (scalar(value)) return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (!forceExpandedArray && value.every(scalar)) return `[${value.map((item) => format(item)).join(", ")}]`;
    const indentation = "  ".repeat(depth + 1);
    return `[\n${indentation}${value.map((item) => format(item, depth + 1)).join(`,\n${indentation}`)}\n${"  ".repeat(depth)}]`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";
  if (compactObject) {
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}: ${format(item, depth + 1)}`).join(", ")}}`;
  }
  const indentation = "  ".repeat(depth + 1);
  return `{\n${indentation}${entries.map(([key, item]) => {
    const compact = !expandEvidence && key === "evidence" && item && typeof item === "object" && !Array.isArray(item);
    return `${JSON.stringify(key)}: ${format(item, depth + 1, compact, key === "requirements")}`;
  }).join(`,\n${indentation}`)}\n${"  ".repeat(depth)}}`;
}

for (const path of paths) {
  const data = JSON.parse(readFileSync(path, "utf8"));
  writeFileSync(path, `${expanded ? JSON.stringify(data, null, 2) : format(data)}\n`);
  console.log(`formatted ${path}`);
}
