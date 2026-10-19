export interface ItemCostSummary {
  cost: number;
  category: "lighting" | "flowers" | "decor" | "instruments" | "other";
}

export interface PaymentRecord {
  id: string;
  amount: number;
  paid_on: string;
  mode: string;
  note: string | null;
}

export interface CalculatedEventBudget {
  agreedTotal: number;
  totalPaid: number;
  remainingDue: number;
  percentagePaid: number;
  isOverpaid: boolean;
  totalItemCosts: number;
  estimatedMargin: number;
  categoryBreakdown: Record<string, number>;
}

export function parseMoneyToPaise(value: string): number | null {
  const normalized = value.trim();
  const match = /^(0|[1-9]\d{0,9})(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) return null;
  const rupees = Number(match[1]);
  const paise = Number((match[2] ?? "").padEnd(2, "0") || "0");
  const total = rupees * 100 + paise;
  return Number.isSafeInteger(total) ? total : null;
}

function toPaise(value: number): number {
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

function fromPaise(value: number): number {
  return value / 100;
}

/**
 * Calculates event financial metrics.
 * Per the project brief:
 * "Paid, remaining and % paid are calculated, never typed."
 */
export function calculateEventBudget(
  agreedTotal: number,
  items: ItemCostSummary[],
  payments: PaymentRecord[]
): CalculatedEventBudget {
  const agreedPaise = Math.max(0, toPaise(agreedTotal));
  const totalPaidPaise = payments.reduce(
    (sum, payment) => sum + toPaise(Number(payment.amount)),
    0
  );
  const remainingPaise = Math.max(0, agreedPaise - totalPaidPaise);
  const percentagePaid =
    agreedPaise > 0
      ? Math.round((totalPaidPaise * 100) / agreedPaise)
      : 0;

  // 4. Calculate vendor item costs breakdown
  const categoryBreakdown: Record<string, number> = {
    lighting: 0,
    flowers: 0,
    decor: 0,
    instruments: 0,
    other: 0,
  };

  let totalItemCostsPaise = 0;

  for (const it of items) {
    const costPaise = toPaise(Number(it.cost));
    totalItemCostsPaise += costPaise;
    const cat = it.category || "other";
    categoryBreakdown[cat] =
      fromPaise(toPaise(categoryBreakdown[cat]) + costPaise);
  }

  const totalItemCosts = fromPaise(totalItemCostsPaise);
  const safeAgreed = fromPaise(agreedPaise);
  const totalPaid = fromPaise(totalPaidPaise);

  return {
    agreedTotal: safeAgreed,
    totalPaid,
    remainingDue: fromPaise(remainingPaise),
    percentagePaid,
    isOverpaid: totalPaidPaise > agreedPaise,
    totalItemCosts,
    estimatedMargin: fromPaise(agreedPaise - totalItemCostsPaise),
    categoryBreakdown,
  };
}
