import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

function getAllSourceFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllSourceFiles(fullPath));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

describe("Security Code Rules", () => {
  it("ensures SUPABASE_SERVICE_ROLE_KEY is used only in server-only modules", () => {
    const srcDir = path.resolve(process.cwd(), "src");
    const sourceFiles = getAllSourceFiles(srcDir);

    const violatingFiles: string[] = [];

    for (const file of sourceFiles) {
      // Exclude test files themselves
      if (file.includes("tests") || file.includes(".test.")) continue;

      const content = fs.readFileSync(file, "utf-8");

      // Check if file references the service role key
      if (content.includes("SUPABASE_SERVICE_ROLE_KEY")) {
        const isClientFile = content.includes('"use client"') || content.includes("'use client'");
        const isServerOnlyGuarded =
          content.includes('import "server-only"') || content.includes("import 'server-only'");

        // Violation if used in client file or not guarded with server-only
        if (isClientFile || !isServerOnlyGuarded) {
          violatingFiles.push(path.relative(process.cwd(), file));
        }
      }
    }

    expect(
      violatingFiles,
      `SUPABASE_SERVICE_ROLE_KEY found in unprotected or client modules: ${violatingFiles.join(", ")}`
    ).toHaveLength(0);
  });
});
