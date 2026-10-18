import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (key && rest.length > 0 && !process.env[key.trim()]) {
        process.env[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

loadEnv();

console.log("================================================================");
console.log("       Shadi Sutra: Automated Database Backup Utility           ");
console.log("================================================================\n");

const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
const backupDir = path.resolve(process.cwd(), "backups");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputFile = path.join(backupDir, `shadisutra_backup_${timestamp}.sql`);

if (!dbUrl) {
  console.log("ℹ️  To take an automated direct pg_dump backup, provide your connection URI:");
  console.log("   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\n");
  console.log("👉 Alternatively, you can run pg_dump directly via CLI:");
  console.log(`   pg_dump "YOUR_CONNECTION_STRING" > "${outputFile}"\n`);
  console.log("👉 Or use the Supabase Dashboard: Settings -> Database -> Backups (automated daily).");
  console.log("Weekly manual backups are strongly recommended before running migrations.\n");
  process.exit(0);
}

try {
  console.log(`⏳ Exporting database schema and data to: ${outputFile}...`);
  execSync(`pg_dump "${dbUrl}" > "${outputFile}"`, { stdio: "inherit" });
  console.log("✅ Backup completed successfully!");
} catch (error) {
  console.error("❌ pg_dump execution failed:", error);
  process.exit(1);
}
