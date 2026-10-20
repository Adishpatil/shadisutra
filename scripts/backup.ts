import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = rest
        .join("=")
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!databaseUrl) {
  console.error("Backup failed: set DATABASE_URL or SUPABASE_DB_URL.");
  process.exit(1);
}

let parsedUrl: URL;
try {
  parsedUrl = new URL(databaseUrl);
  if (!["postgres:", "postgresql:"].includes(parsedUrl.protocol)) {
    throw new Error("Unsupported database URL scheme.");
  }
} catch {
  console.error("Backup failed: the database URL is invalid.");
  process.exit(1);
}

const sslMode = parsedUrl.searchParams.get("sslmode");
const pgEnvironment: NodeJS.ProcessEnv = {
  ...process.env,
  PGHOST: parsedUrl.hostname,
  PGPORT: parsedUrl.port || "5432",
  PGUSER: decodeURIComponent(parsedUrl.username),
  PGPASSWORD: decodeURIComponent(parsedUrl.password),
  PGDATABASE: decodeURIComponent(parsedUrl.pathname.slice(1)),
};
const validSslModes = [
  "disable",
  "allow",
  "prefer",
  "require",
  "verify-ca",
  "verify-full",
];
pgEnvironment.PGSSLMODE =
  sslMode && validSslModes.includes(sslMode) ? sslMode : "require";

const backupDir = path.resolve(process.cwd(), "backups");
fs.mkdirSync(backupDir, { recursive: true });
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputFile = path.join(backupDir, `shadisutra_backup_${timestamp}.dump`);
const result = spawnSync(
  "pg_dump",
  ["--format=custom", "--no-owner", "--no-privileges", "--file", outputFile],
  { env: pgEnvironment, stdio: "ignore" }
);

if (result.error || result.status !== 0) {
  if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
  const pgDumpMissing =
    !!result.error &&
    "code" in result.error &&
    result.error.code === "ENOENT";
  console.error(
    pgDumpMissing
      ? "Backup failed: pg_dump is not installed or is not on PATH."
      : "Backup failed. Check database connectivity and permissions."
  );
  process.exit(1);
}

console.log(`Backup completed: ${path.relative(process.cwd(), outputFile)}`);
