export type ExpenseCategory =
  | "lighting"
  | "flowers"
  | "decor"
  | "instruments"
  | "venue"
  | "food"
  | "staff"
  | "travel"
  | "other";

export interface ExpenseMoneyRow {
  category: ExpenseCategory;
  amount: number;
  tax_amount: number;
  amount_paid: number;
}

export interface EventMoneySummary {
  agreedTotal: number;
  received: number;
  totalExpenses: number;
  paidToVendors: number;
  owedToVendors: number;
  profit: number;
  byCategory: Record<ExpenseCategory, number>;
}

const categories: ExpenseCategory[] = [
  "lighting",
  "flowers",
  "decor",
  "instruments",
  "venue",
  "food",
  "staff",
  "travel",
  "other",
];

export function calculateEventMoney(
  agreedTotal: number,
  received: number,
  expenses: ExpenseMoneyRow[]
): EventMoneySummary {
  const byCategory = Object.fromEntries(
    categories.map((category) => [category, 0])
  ) as Record<ExpenseCategory, number>;
  let totalExpenses = 0;
  let paidToVendors = 0;

  for (const expense of expenses) {
    const total = expense.amount + expense.tax_amount;
    totalExpenses += total;
    paidToVendors += expense.amount_paid;
    byCategory[expense.category] += total;
  }

  return {
    agreedTotal,
    received,
    totalExpenses,
    paidToVendors,
    owedToVendors: totalExpenses - paidToVendors,
    profit: agreedTotal - totalExpenses,
    byCategory,
  };
}
