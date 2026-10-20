import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  "/",
  "/about",
  "/services",
  "/services/weddings",
  "/gallery",
  "/contact",
  "/login",
  "/privacy",
  "/terms",
];

for (const path of pages) {
  test(`axe accessibility scan: ${path}`, async ({ page }) => {
    const cspErrors: string[] = [];
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /content security policy|refused to .*policy/i.test(message.text())
      ) {
        cspErrors.push(message.text());
      }
    });

    const response = await page.goto(path);
    expect(response?.status(), `${path} should load`).toBeLessThan(400);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Skip to content" })).toHaveCount(1);

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact ?? "")
    );
    const nonBlocking = results.violations.filter((violation) =>
      ["moderate", "minor"].includes(violation.impact ?? "")
    );

    if (nonBlocking.length > 0) {
      console.warn(
        `Non-blocking axe findings on ${path}:`,
        nonBlocking.map(({ id, impact, description, nodes }) => ({
          id,
          impact,
          description,
          selectors: nodes.map((node) => node.target),
        }))
      );
    }

    expect(
      blocking,
      `Serious or critical axe violations on ${path}`
    ).toEqual([]);
    expect(cspErrors, `CSP console errors on ${path}`).toEqual([]);
  });
}
