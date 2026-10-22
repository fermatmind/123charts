#!/usr/bin/env node
import { execFileSync } from "node:child_process";
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
console.log(JSON.stringify({ local_commit: git("rev-parse", "HEAD"), dirty: !!git("status", "--porcelain"), deployment: "NOT EXECUTED", instructions: "deploy/README.md" }, null, 2));
