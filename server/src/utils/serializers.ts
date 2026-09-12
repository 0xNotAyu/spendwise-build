import { ICategory } from '../models/Category';
import { ITransaction } from '../models/Transaction';

export interface CategoryDTO {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  isDefault: boolean;
}

export function serializeCategory(category: ICategory): CategoryDTO {
  return {
    id: category._id.toString(),
    name: category.name,
    type: category.type,
    icon: category.icon,
    isDefault: category.isDefault,
  };
}

export interface TransactionDTO {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  category?: CategoryDTO | null;
  description: string;
  merchant?: string;
  date: string;
  paymentMethod: string;
  tags: string[];
  notes?: string;
  createdAt: string;
}

/**
 * Serializes a Transaction document. Works whether or not `categoryId`
 * has been `.populate()`-d: if it has (an object with a `name` field),
 * the nested category is pulled out into `category` and `categoryId`
 * is flattened back down to just the id string, matching what the
 * client's Transaction type expects.
 */
export function serializeTransaction(tx: ITransaction): TransactionDTO {
  const rawCategory = tx.categoryId as any;
  const isPopulated = rawCategory && typeof rawCategory === 'object' && 'name' in rawCategory;

  return {
    id: tx._id.toString(),
    type: tx.type,
    amount: tx.amount,
    categoryId: isPopulated ? rawCategory._id.toString() : rawCategory?.toString(),
    category: isPopulated
      ? {
          id: rawCategory._id.toString(),
          name: rawCategory.name,
          icon: rawCategory.icon,
          type: rawCategory.type,
          isDefault: rawCategory.isDefault ?? false,
        }
      : undefined,
    description: tx.description,
    merchant: tx.merchant,
    date: tx.date.toISOString(),
    paymentMethod: tx.paymentMethod,
    tags: tx.tags,
    notes: tx.notes,
    createdAt: tx.createdAt.toISOString(),
  };
}
