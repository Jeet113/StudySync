import { storageService } from './storageService';
import {
  STANDARD_ACCOUNTS,
  normalizeAccountId,
  normalizeCategory,
  calculateAccountBalances,
  calculateNetAvailableBalance,
  calculateBudgetStatus,
  calculateDueBorrowSummary
} from '../utils/expenseUtils';

export const expenseService = {
  getData: () => {
    const raw = storageService.get(storageService.KEYS.EXPENSES, null);
    if (!raw || typeof raw !== 'object') {
      return {
        budgetLimit: 12000,
        accounts: STANDARD_ACCOUNTS.map(a => ({ ...a, balance: 0, openingBalance: 0 })),
        transactions: [],
        dueBorrowRecords: []
      };
    }

    const budgetLimit = Math.max(0, parseFloat(raw.budgetLimit) || 12000);
    const transactions = Array.isArray(raw.transactions) ? raw.transactions : [];
    const dueBorrowRecords = Array.isArray(raw.dueBorrowRecords) ? raw.dueBorrowRecords : [];

    // Ensure 4 standard accounts with reconciled balances
    const accounts = calculateAccountBalances(raw.accounts || STANDARD_ACCOUNTS, transactions);

    return {
      budgetLimit,
      accounts,
      transactions,
      dueBorrowRecords
    };
  },

  saveData: (data) => {
    storageService.set(storageService.KEYS.EXPENSES, data);
  },

  // Log new financial transaction (atomic balance calculation)
  addTransaction: (txData) => {
    const data = expenseService.getData();
    const now = new Date().toISOString();
    const amount = Math.max(0, parseFloat(txData.amount) || 0);
    const type = txData.type === 'income' ? 'income' : 'expense';
    const accountId = normalizeAccountId(txData.accountId);
    const category = normalizeCategory(txData.category, type);

    const newTx = {
      id: txData.id || `tx-${Date.now()}`,
      title: txData.title || (type === 'income' ? 'Income Record' : 'Expense Record'),
      amount,
      type,
      category,
      accountId,
      date: txData.date || now.split('T')[0],
      notes: txData.notes || '',
      createdAt: now,
      ...txData
    };

    data.transactions.unshift(newTx);
    data.accounts = calculateAccountBalances(data.accounts, data.transactions);

    expenseService.saveData(data);
    return newTx;
  },

  // Edit financial transaction (atomic balance calculation)
  updateTransaction: (id, updatedData) => {
    const data = expenseService.getData();
    const index = data.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      const type = updatedData.type !== undefined ? updatedData.type : data.transactions[index].type;
      const accountId = updatedData.accountId !== undefined ? normalizeAccountId(updatedData.accountId) : data.transactions[index].accountId;
      const category = updatedData.category !== undefined ? normalizeCategory(updatedData.category, type) : data.transactions[index].category;

      data.transactions[index] = {
        ...data.transactions[index],
        ...updatedData,
        amount: Math.max(0, parseFloat(updatedData.amount !== undefined ? updatedData.amount : data.transactions[index].amount) || 0),
        type,
        accountId,
        category,
        updatedAt: new Date().toISOString()
      };

      data.accounts = calculateAccountBalances(data.accounts, data.transactions);
      expenseService.saveData(data);
      return data.transactions[index];
    }
    return null;
  },

  // Delete transaction (atomic balance reversal)
  deleteTransaction: (id) => {
    const data = expenseService.getData();
    data.transactions = data.transactions.filter(t => t.id !== id);
    data.accounts = calculateAccountBalances(data.accounts, data.transactions);
    expenseService.saveData(data);
    return data.transactions;
  },

  // Update monthly budget limit
  updateBudgetLimit: (newLimit) => {
    const data = expenseService.getData();
    data.budgetLimit = Math.max(0, parseFloat(newLimit) || 0);
    expenseService.saveData(data);
    return data.budgetLimit;
  },

  // --- Due & Borrow Record Ledger ---
  getDueBorrowRecords: () => {
    const data = expenseService.getData();
    return data.dueBorrowRecords || [];
  },

  addDueBorrowRecord: (recordData) => {
    const data = expenseService.getData();
    if (!data.dueBorrowRecords) data.dueBorrowRecords = [];

    const now = new Date().toISOString();
    const amount = Math.max(0, parseFloat(recordData.amount) || 0);
    const direction = recordData.direction === 'owed_to_me' || recordData.direction === 'Owed to me'
      ? 'owed_to_me'
      : 'i_owe';

    const newRecord = {
      id: `due-${Date.now()}`,
      title: recordData.title || (direction === 'i_owe' ? 'Debt to pay' : 'Receivable money'),
      direction,
      amount,
      settledAmount: 0,
      dueDate: recordData.dueDate || null,
      note: recordData.note || '',
      status: 'open',
      createdAt: now,
      updatedAt: now,
      settlementTransactionIds: [],
      ...recordData
    };

    data.dueBorrowRecords.unshift(newRecord);
    expenseService.saveData(data);
    return newRecord;
  },

  updateDueBorrowRecord: (id, updatedData) => {
    const data = expenseService.getData();
    if (!data.dueBorrowRecords) return null;

    const index = data.dueBorrowRecords.findIndex(r => r.id === id);
    if (index !== -1) {
      const current = data.dueBorrowRecords[index];
      const amount = updatedData.amount !== undefined ? Math.max(0, parseFloat(updatedData.amount)) : current.amount;
      const settledAmount = updatedData.settledAmount !== undefined ? Math.max(0, parseFloat(updatedData.settledAmount)) : current.settledAmount;

      let status = updatedData.status || current.status;
      if (settledAmount >= amount && amount > 0) {
        status = 'settled';
      } else if (settledAmount > 0) {
        status = 'partially_settled';
      } else {
        status = 'open';
      }

      data.dueBorrowRecords[index] = {
        ...current,
        ...updatedData,
        amount,
        settledAmount,
        status,
        updatedAt: new Date().toISOString()
      };

      expenseService.saveData(data);
      return data.dueBorrowRecords[index];
    }
    return null;
  },

  deleteDueBorrowRecord: (id) => {
    const data = expenseService.getData();
    if (!data.dueBorrowRecords) return [];
    data.dueBorrowRecords = data.dueBorrowRecords.filter(r => r.id !== id);
    expenseService.saveData(data);
    return data.dueBorrowRecords;
  },

  // Settle record (partial or full) with optional transaction creation
  settleDueBorrowRecord: (id, settlementOptions = {}) => {
    const data = expenseService.getData();
    if (!data.dueBorrowRecords) return null;

    const index = data.dueBorrowRecords.findIndex(r => r.id === id);
    if (index === -1) return null;

    const record = data.dueBorrowRecords[index];
    const settleAmt = Math.max(0, parseFloat(settlementOptions.amount) || (record.amount - record.settledAmount));
    const newSettledTotal = Math.min(record.amount, record.settledAmount + settleAmt);
    const isFull = newSettledTotal >= record.amount;

    record.settledAmount = newSettledTotal;
    record.status = isFull ? 'settled' : 'partially_settled';
    record.updatedAt = new Date().toISOString();

    let createdTx = null;
    // Log settlement as transaction if requested
    if (settlementOptions.logTransaction && settleAmt > 0) {
      const accountId = normalizeAccountId(settlementOptions.accountId || 'acc-cash');
      // If "I owe", settling means user pays out -> expense
      // If "Owed to me", settling means user receives money -> income
      const txType = record.direction === 'i_owe' ? 'expense' : 'income';
      const category = record.direction === 'i_owe'
        ? (settlementOptions.category || 'Other')
        : 'Other';

      createdTx = expenseService.addTransaction({
        title: `Settlement: ${record.title}`,
        amount: settleAmt,
        type: txType,
        category,
        accountId,
        date: settlementOptions.date || new Date().toISOString().split('T')[0],
        notes: `Due/Borrow settlement for "${record.title}". ${settlementOptions.note || ''}`.trim()
      });

      if (!record.settlementTransactionIds) record.settlementTransactionIds = [];
      if (createdTx?.id) record.settlementTransactionIds.push(createdTx.id);
    }

    data.dueBorrowRecords[index] = record;
    expenseService.saveData(data);

    return {
      record,
      transaction: createdTx
    };
  },

  // Reopen settled record
  reopenDueBorrowRecord: (id) => {
    const data = expenseService.getData();
    const index = (data.dueBorrowRecords || []).findIndex(r => r.id === id);
    if (index !== -1) {
      data.dueBorrowRecords[index].status = 'open';
      data.dueBorrowRecords[index].settledAmount = 0;
      data.dueBorrowRecords[index].updatedAt = new Date().toISOString();
      expenseService.saveData(data);
      return data.dueBorrowRecords[index];
    }
    return null;
  },

  // Financial summary combining balance, budget, category math, and Due/Borrow
  getFinancialSummary: (targetMonth = null) => {
    const data = expenseService.getData();
    const accounts = data.accounts || [];
    const transactions = data.transactions || [];
    const dueBorrowRecords = data.dueBorrowRecords || [];

    const totalBalance = calculateNetAvailableBalance(accounts);

    // Individual standard account balances
    const mobileAccount = accounts.find(a => a.id === 'acc-mobile');
    const bankAccount = accounts.find(a => a.id === 'acc-bank');
    const cashAccount = accounts.find(a => a.id === 'acc-cash');
    const cardAccount = accounts.find(a => a.id === 'acc-card');

    const mobileBalance = mobileAccount?.balance || 0;
    const bankBalance = bankAccount?.balance || 0;
    const cashBalance = cashAccount?.balance || 0;
    const cardBalance = cardAccount?.balance || 0;

    // Budget and category breakdown
    const budgetStatus = calculateBudgetStatus(data.budgetLimit, transactions, targetMonth);

    // Due & Borrow breakdown
    const dueBorrowSummary = calculateDueBorrowSummary(dueBorrowRecords);

    return {
      totalBalance,
      accounts,
      mobileBalance,
      bankBalance,
      cashBalance,
      cardBalance,
      ...budgetStatus,
      dueBorrowSummary
    };
  }
};

export default expenseService;
