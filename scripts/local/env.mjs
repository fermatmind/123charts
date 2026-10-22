import fs from "node:fs";
export function loadEnv() {
  if (fs.existsSync(".env.local"))
    for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
}
