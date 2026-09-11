export type TransactionType = "income" | "expense";

export type PaymentMethod = "cash" | "upi" | "card" | "bank_transfer" | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  currency: string;
  monthlyIncome: number;
  timezone: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  category?: Category;
  description: string;
  merchant?: string;
  date: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  notes?: string;
  createdAt: string;
}

export type BudgetStatus = "safe" | "warning" | "critical" | "exceeded";

export interface Budget {
  id: string;
  categoryId: string;
  category?: Category;
  amount: number;
  spent: number;
  month: number;
  year: number;
  usagePercent: number;
  status: BudgetStatus;
}

export interface DashboardSummary {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  recentTransactions: Transaction[];
  spendingTrend: { date: string; amount: number }[];
  categoryBreakdown: { categoryId: string; categoryName: string; amount: number; percent: number }[];
  budgetProgress: Budget[];
}

export interface AnalyticsSummary {
  monthlySpending: { month: string; income: number; expenses: number }[];
  categoryBreakdown: { categoryName: string; amount: number; percent: number }[];
  savingsRate: { month: string; rate: number }[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TransactionFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: TransactionType;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: "date" | "amount" | "description";
  sortOrder?: "asc" | "desc";
}
