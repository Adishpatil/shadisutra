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

  it("prevents client modules from importing the service-role client", () => {
    const srcDir = path.resolve(process.cwd(), "src");
    const clientFiles = getAllSourceFiles(srcDir).filter((file) => {
      const content = fs.readFileSync(file, "utf-8");
      return /^\s*["']use client["'];/.test(content);
    });
    const violatingFiles = clientFiles.filter((file) =>
      /from\s+["'][^"']*supabase\/admin["']/.test(
        fs.readFileSync(file, "utf-8")
      )
    );

    expect(
      violatingFiles,
      `Client modules import the service-role client: ${violatingFiles.join(", ")}`
    ).toHaveLength(0);
  });

  it("requires aal2 before rendering admin routes", () => {
    const adminLayout = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/admin/layout.tsx"),
      "utf-8"
    );

    expect(adminLayout).toContain('assurance.currentLevel !== "aal2"');
    expect(adminLayout).toContain("isAdminClientConfigured()");
  });
});
