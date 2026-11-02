import { describe, expect, it } from "vitest";
import { calculateEventMoney } from "../src/lib/admin/money-calculations";

describe("calculateEventMoney", () => {
  it("calculates all money metrics and category totals in integer paise", () => {
    const result = calculateEventMoney(1_000_000, 400_000, [
      { category: "flowers", amount: 125_000, tax_amount: 22_500, amount_paid: 100_000 },
      { category: "flowers", amount: 50_000, tax_amount: 0, amount_paid: 75_000 },
      { category: "venue", amount: 300_000, tax_amount: 54_000, amount_paid: 0 },
    ]);

    expect(result).toEqual({
      agreedTotal: 1_000_000,
      received: 400_000,
      totalExpenses: 551_500,
      paidToVendors: 175_000,
      owedToVendors: 376_500,
      profit: 448_500,
      byCategory: {
        lighting: 0,
        flowers: 197_500,
        decor: 0,
        instruments: 0,
        venue: 354_000,
        food: 0,
        staff: 0,
        travel: 0,
        other: 0,
      },
    });
  });

  it("keeps a loss as a negative profit", () => {
    expect(
      calculateEventMoney(100, 0, [
        { category: "other", amount: 200, tax_amount: 0, amount_paid: 0 },
      ]).profit
    ).toBe(-100);
  });
});
