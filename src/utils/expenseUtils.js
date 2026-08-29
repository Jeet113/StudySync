/**
 * Expense Tracker Utilities & Configuration
 * Fixed 4 accounts, category definitions, atomic balance management,
 * expense-only budget calculation, and Due & Borrow record summaries.
 */

export const ACCOUNT_TYPES = {
  MOBILE_BANKING: 'mobile_banking',
  BANK: 'bank',
  CASH: 'cash',
  CARD: 'card'
};

export const STANDARD_ACCOUNTS = [
  { id: 'acc-mobile', name: 'Mobile Banking', type: ACCOUNT_TYPES.MOBILE_BANKING, color: '#EC4899', iconName: 'Smartphone' },
  { id: 'acc-bank', name: 'Bank Account', type: ACCOUNT_TYPES.BANK, color: '#3B82F6', iconName: 'Building' },
  { id: 'acc-cash', name: 'Physical Wallet Cash', type: ACCOUNT_TYPES.CASH, color: '#10B981', iconName: 'Coins' },
  { id: 'acc-card', name: 'Credit/Debit Card', type: ACCOUNT_TYPES.CARD, color: '#8B5CF6', iconName: 'CreditCard' }
];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Academic Materials',
  'Fees',
  'Internet & Bills',
  'Transportation',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Tuition Income',
  'Other'
];

/**
 * Normalizes account ID to one of the 4 standard accounts
 */
export const normalizeAccountId = (accountIdOrType) => {
  if (!accountIdOrType) return 'acc-cash';
  const str = String(accountIdOrType).toLowerCase();

  if (str.includes('mobile') || str.includes('bkash') || str.includes('nagad') || str.includes('rocket') || str === 'acc-1') {
    return 'acc-mobile';
  }
  if (str.includes('bank') || str.includes('dbbl') || str.includes('city') || str === 'acc-2') {
    return 'acc-bank';
  }
  if (str.includes('cash') || str.includes('wallet') || str.includes('pocket') || str === 'acc-3') {
    return 'acc-cash';
  }
  if (str.includes('card') || str.includes('visa') || str.includes('master') || str === 'acc-4') {
    return 'acc-card';
  }

  return 'acc-cash';
};

/**
 * Normalizes category name to the new standardized set
 */
export const normalizeCategory = (category, type = 'expense') => {
  if (type === 'income') {
    const isTuition = String(category || '').toLowerCase().includes('tuition');
    return isTuition ? 'Tuition Income' : 'Other';
  }

  const catStr = String(category || '').toLowerCase();
  if (catStr.includes('food') || catStr.includes('mess') || catStr.includes('snack') || catStr.includes('dining')) {
    return 'Food';
  }
  if (catStr.includes('academic') || catStr.includes('book') || catStr.includes('print') || catStr.includes('stationary') || catStr.includes('material')) {
    return 'Academic Materials';
  }
  if (catStr.includes('fee') || catStr.includes('exam') || catStr.includes('hall') || catStr.includes('tuition fee') || catStr.includes('admission')) {
    return 'Fees';
  }
  if (catStr.includes('internet') || catStr.includes('bill') || catStr.includes('data') || catStr.includes('wifi') || catStr.includes('electricity') || catStr.includes('recharge')) {
    return 'Internet & Bills';
  }
  if (catStr.includes('travel') || catStr.includes('transport') || catStr.includes('bus') || catStr.includes('train') || catStr.includes('cng') || catStr.includes('rickshaw') || catStr.includes('ticket')) {
    return 'Transportation';
  }

  return 'Other';
};

/**
 * Reconciles account balances from opening balance + full transaction history.
 */
export const calculateAccountBalances = (accounts = [], transactions = []) => {
  // Ensure we have the 4 standard accounts
  const accountMap = {};
  STANDARD_ACCOUNTS.forEach(sa => {
    const existing = accounts.find(a => normalizeAccountId(a.id || a.type) === sa.id);
    accountMap[sa.id] = {
      ...sa,
      openingBalance: existing?.openingBalance || 0,
      balance: existing?.openingBalance || 0
    };
  });

  // Apply all transactions sequentially
  (transactions || []).forEach(tx => {
    const targetId = normalizeAccountId(tx.accountId);
    if (accountMap[targetId]) {
      const amount = parseFloat(tx.amount) || 0;
      if (tx.type === 'income') {
        accountMap[targetId].balance += amount;
      } else if (tx.type === 'expense') {
        accountMap[targetId].balance -= amount;
      }
    }
  });

  return Object.values(accountMap);
};

/**
 * Calculates Total Net Available Balance (sum of all 4 accounts)
 */
export const calculateNetAvailableBalance = (accounts = []) => {
  return (accounts || []).reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);
};

/**
 * Calculates Monthly Expense Budget status (expense transactions only)
 */
export const calculateBudgetStatus = (budgetLimit, transactions = [], targetMonth = null) => {
  const currentMonth = targetMonth || new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const limit = Math.max(0, parseFloat(budgetLimit) || 12000);

  let monthlySpent = 0;
  let monthlyIncome = 0;
  const categoryTotals = {};

  (transactions || []).forEach(tx => {
    if (tx.date && String(tx.date).startsWith(currentMonth)) {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'expense') {
        monthlySpent += amt;
        const cat = normalizeCategory(tx.category, 'expense');
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      } else if (tx.type === 'income') {
        monthlyIncome += amt;
      }
    }
  });

  const remainingBudget = Math.max(0, limit - monthlySpent);
  const budgetUsagePercentage = limit > 0 ? Math.round((monthlySpent / limit) * 100) : 0;
  const isNearLimit = budgetUsagePercentage >= 85 && budgetUsagePercentage <= 100;
  const isOverBudget = monthlySpent > limit;

  const categoryBreakdown = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat]
  }));

  return {
    budgetLimit: limit,
    monthlySpent,
    monthlyIncome,
    remainingBudget,
    budgetUsagePercentage,
    isNearLimit,
    isOverBudget,
    categoryBreakdown,
    currentMonth
  };
};

/**
 * Calculates Due & Borrow ledger metrics
 */
export const calculateDueBorrowSummary = (records = []) => {
  let totalIOwe = 0;
  let totalOwedToMe = 0;
  let openCount = 0;
  let nearestDueDate = null;

  const validRecords = Array.isArray(records) ? records : [];
  const now = new Date();

  validRecords.forEach(rec => {
    const amount = parseFloat(rec.amount) || 0;
    const settledAmount = parseFloat(rec.settledAmount) || 0;
    const remaining = Math.max(0, amount - settledAmount);
    const isOpen = rec.status !== 'settled' && remaining > 0;

    if (isOpen) {
      openCount++;
      if (rec.direction === 'i_owe' || rec.direction === 'I owe') {
        totalIOwe += remaining;
      } else {
        totalOwedToMe += remaining;
      }

      if (rec.dueDate) {
        const d = new Date(rec.dueDate);
        if (!isNaN(d.getTime())) {
          if (!nearestDueDate || d < new Date(nearestDueDate)) {
            nearestDueDate = rec.dueDate;
          }
        }
      }
    }
  });

  const netDuePosition = totalOwedToMe - totalIOwe;

  return {
    totalIOwe,
    totalOwedToMe,
    netDuePosition,
    nearestDueDate,
    openCount,
    openRecordsCount: openCount,
    totalRecordsCount: validRecords.length
  };
};

export default {
  ACCOUNT_TYPES,
  STANDARD_ACCOUNTS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  normalizeAccountId,
  normalizeCategory,
  calculateAccountBalances,
  calculateNetAvailableBalance,
  calculateBudgetStatus,
  calculateDueBorrowSummary
};
