import { describe, it, expect } from "vitest";
import {
  calculateEventBudget,
  type ItemCostSummary,
  type PaymentRecord,
} from "../lib/admin/budget-calculations";

describe("Budget and Payments Calculation Engine", () => {
  it("calculates total paid, remaining due, and percentage paid accurately", () => {
    const agreedTotal = 1200000;

    const items: ItemCostSummary[] = [
      { category: "lighting", cost: 95000 },
      { category: "flowers", cost: 150000 },
      { category: "decor", cost: 280000 },
      { category: "instruments", cost: 45000 },
    ];

    const payments: PaymentRecord[] = [
      { id: "p1", amount: 450000, paid_on: "2026-08-15", mode: "RTGS", note: "Advance" },
      { id: "p2", amount: 400000, paid_on: "2026-10-01", mode: "NEFT", note: "Tranche 2" },
    ];

    const result = calculateEventBudget(agreedTotal, items, payments);

    // Total Paid = 450,000 + 400,000 = 850,000
    expect(result.totalPaid).toBe(850000);

    // Remaining Due = 1,200,000 - 850,000 = 350,000
    expect(result.remainingDue).toBe(350000);

    // Percentage Paid = Math.round((850000 / 1200000) * 100) = 71%
    expect(result.percentagePaid).toBe(71);

    // Total Item Costs = 95,000 + 150,000 + 280,000 + 45,000 = 570,000
    expect(result.totalItemCosts).toBe(570000);

    // Estimated Margin = 1,200,000 - 570,000 = 630,000
    expect(result.estimatedMargin).toBe(630000);

    // Category breakdown
    expect(result.categoryBreakdown.decor).toBe(280000);
    expect(result.categoryBreakdown.lighting).toBe(95000);
  });

  it("handles zero payments gracefully without division errors", () => {
    const agreedTotal = 500000;
    const result = calculateEventBudget(agreedTotal, [], []);

    expect(result.totalPaid).toBe(0);
    expect(result.remainingDue).toBe(500000);
    expect(result.percentagePaid).toBe(0);
    expect(result.totalItemCosts).toBe(0);
    expect(result.estimatedMargin).toBe(500000);
  });

  it("handles zero agreed total gracefully", () => {
    const result = calculateEventBudget(0, [], []);

    expect(result.agreedTotal).toBe(0);
    expect(result.totalPaid).toBe(0);
    expect(result.remainingDue).toBe(0);
    expect(result.percentagePaid).toBe(0);
  });

  it("handles payments exceeding agreed total (overpayment)", () => {
    const agreedTotal = 100000;
    const payments: PaymentRecord[] = [
      { id: "p1", amount: 120000, paid_on: "2026-10-15", mode: "Cash", note: "Excess" },
    ];

    const result = calculateEventBudget(agreedTotal, [], payments);

    expect(result.totalPaid).toBe(120000);
    expect(result.remainingDue).toBe(0); // Clamped to zero
    expect(result.percentagePaid).toBe(120);
  });
});
