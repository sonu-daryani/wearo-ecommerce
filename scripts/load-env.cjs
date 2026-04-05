/**
 * Load .env then .env.local (later overrides). Maps mongodb_uri → DATABASE_URL for Prisma.
 */
const fs = require("fs");
const path = require("path");

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const eq = trimmed.indexOf("=");
  if (eq < 1) return null;
  const key = trimmed.slice(0, eq).trim();
  let val = trimmed.slice(eq + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  return [key, val];
}

for (const name of [".env", ".env.local"]) {
  const full = path.join(process.cwd(), name);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, "utf8");
  for (const line of text.split("\n")) {
    const pair = parseLine(line);
    if (pair) process.env[pair[0]] = pair[1];
  }
}

if (!process.env.DATABASE_URL && process.env.mongodb_uri) {
  let v = String(process.env.mongodb_uri).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  process.env.DATABASE_URL = v;
}
