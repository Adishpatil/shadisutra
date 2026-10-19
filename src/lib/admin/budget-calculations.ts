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
  totalItemCosts: number;
  estimatedMargin: number;
  categoryBreakdown: Record<string, number>;
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
  const safeAgreed = Math.max(0, agreedTotal || 0);

  // 1. Calculate total paid from all payment records
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // 2. Calculate remaining balance due
  const remainingDue = Math.max(0, safeAgreed - totalPaid);

  // 3. Calculate percentage paid (clamped between 0 and 100+)
  const percentagePaid =
    safeAgreed > 0 ? Math.round((totalPaid / safeAgreed) * 100) : 0;

  // 4. Calculate vendor item costs breakdown
  const categoryBreakdown: Record<string, number> = {
    lighting: 0,
    flowers: 0,
    decor: 0,
    instruments: 0,
    other: 0,
  };

  let totalItemCosts = 0;

  for (const it of items) {
    const cost = Number(it.cost) || 0;
    totalItemCosts += cost;
    const cat = it.category || "other";
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + cost;
  }

  // 5. Estimated Margin (Agreed client total - total vendor item costs)
  const estimatedMargin = safeAgreed - totalItemCosts;

  return {
    agreedTotal: safeAgreed,
    totalPaid,
    remainingDue,
    percentagePaid,
    totalItemCosts,
    estimatedMargin,
    categoryBreakdown,
  };
}
