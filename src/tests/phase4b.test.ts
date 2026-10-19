import { describe, expect, it } from "vitest";
import { calculateEventBudget, parseMoneyToPaise } from "../lib/admin/budget-calculations";
import {
  designSignatureMatches,
  isDesignMimeType,
} from "../lib/admin/design-validation";

describe("Phase 4B money handling", () => {
  it("parses currency as integer paise and rejects excess precision", () => {
    expect(parseMoneyToPaise("1234.5")).toBe(123450);
    expect(parseMoneyToPaise("0.01")).toBe(1);
    expect(parseMoneyToPaise("0")).toBe(0);
    expect(parseMoneyToPaise("1.999")).toBeNull();
    expect(parseMoneyToPaise("-1")).toBeNull();
    expect(parseMoneyToPaise("10000000000")).toBeNull();
  });

  it("calculates totals without fractional-paise drift", () => {
    const result = calculateEventBudget(
      1000.1,
      [{ category: "decor", cost: 12.34 }],
      [
        { id: "payment-1", amount: 12.34, paid_on: "2026-10-19", mode: "upi", note: null },
        { id: "payment-2", amount: 0.01, paid_on: "2026-10-19", mode: "cash", note: null },
      ]
    );

    expect(result.totalPaid).toBe(12.35);
    expect(result.remainingDue).toBe(987.75);
    expect(result.totalItemCosts).toBe(12.34);
    expect(result.estimatedMargin).toBe(987.76);
    expect(result.isOverpaid).toBe(false);
  });

  it("flags a paise-level overpayment without blocking it", () => {
    const result = calculateEventBudget(
      100,
      [],
      [{ id: "payment-1", amount: 100.01, paid_on: "2026-10-19", mode: "upi", note: null }]
    );
    expect(result.remainingDue).toBe(0);
    expect(result.isOverpaid).toBe(true);
  });
});

describe("Phase 4B design file validation", () => {
  it("accepts only allowed MIME types and matching file signatures", () => {
    expect(isDesignMimeType("image/png")).toBe(true);
    expect(isDesignMimeType("image/svg+xml")).toBe(false);
    expect(designSignatureMatches(
      new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
      "image/png"
    )).toBe(true);
    expect(designSignatureMatches(
      new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
      "image/jpeg"
    )).toBe(false);
    expect(designSignatureMatches(
      new TextEncoder().encode("%PDF-1.7"),
      "application/pdf"
    )).toBe(true);
  });
});
