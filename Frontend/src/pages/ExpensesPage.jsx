import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Tag,
  CreditCard
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { expenseService } from '../services/expenseService';
import { CompactAccountCards } from '../components/expenses/CompactAccountCards';
import { MonthlyBudgetCard } from '../components/expenses/MonthlyBudgetCard';
import { DueBorrowCard } from '../components/expenses/DueBorrowCard';
import { DueBorrowDrawer } from '../components/expenses/DueBorrowDrawer';
import { DueBorrowEditorModal } from '../components/expenses/DueBorrowEditorModal';
import { SettlementDialog } from '../components/expenses/SettlementDialog';
import { TransactionEditorModal } from '../components/expenses/TransactionEditorModal';
import { ExpenseCategoryPieChart } from '../components/expenses/ExpenseCategoryPieChart';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import { formatBDT } from '../utils/currency';

export const ExpensesPage = () => {
  const {
    expenses,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudgetLimit,
    addDueBorrowRecord,
    updateDueBorrowRecord,
    deleteDueBorrowRecord,
    settleDueBorrowRecord,
    reopenDueBorrowRecord
  } = useData();

  // Dialog & Drawer States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [isDueBorrowDrawerOpen, setIsDueBorrowDrawerOpen] = useState(false);
  const [isDueBorrowModalOpen, setIsDueBorrowModalOpen] = useState(false);
  const [editingDueBorrowRecord, setEditingDueBorrowRecord] = useState(null);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [recordForSettlement, setRecordForSettlement] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'expense', 'income'
  const [categoryFilter, setCategoryFilter] = useState('all');

  const summary = expenseService.getFinancialSummary();
  const transactions = Array.isArray(expenses?.transactions) ? expenses.transactions : [];
  const dueBorrowRecords = Array.isArray(expenses?.dueBorrowRecords) ? expenses.dueBorrowRecords : [];

  // Filtered transactions list
  const filteredTransactions = transactions.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (tx.title || '').toLowerCase().includes(q);
      const matchNotes = (tx.notes || '').toLowerCase().includes(q);
      const matchCat = (tx.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchNotes && !matchCat) return false;
    }
    return true;
  });

  // Handlers
  const handleOpenAddTx = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditTx = (tx) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleSaveTx = (formData) => {
    if (editingTx?.id) {
      updateTransaction(editingTx.id, formData);
    } else {
      addTransaction(formData);
    }
  };

  const handleOpenAddDueBorrow = () => {
    setEditingDueBorrowRecord(null);
    setIsDueBorrowModalOpen(true);
  };

  const handleOpenEditDueBorrow = (rec) => {
    setEditingDueBorrowRecord(rec);
    setIsDueBorrowModalOpen(true);
  };

  const handleSaveDueBorrow = (formData) => {
    if (editingDueBorrowRecord?.id) {
      updateDueBorrowRecord(editingDueBorrowRecord.id, formData);
    } else {
      addDueBorrowRecord(formData);
    }
  };

  const handleOpenSettleDueBorrow = (rec) => {
    setRecordForSettlement(rec);
    setIsSettlementOpen(true);
  };

  const getAccountName = (accId) => {
    const acc = (expenses?.accounts || []).find(a => a.id === accId);
    return acc?.name || accId;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-brand-500" />
            <span>Expense & Financial Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track 4 fixed student accounts, monthly expense budget, and due/borrow records with atomic balance reconciliation
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddTx}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Transaction</span>
        </button>
      </div>

      {/* GRADIENT HERO CARD: Total Net Available Balance */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-brand-100 opacity-90">
              Total Net Available Balance
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
              {formatBDT(summary.totalBalance)}
            </h3>
            <p className="text-xs text-brand-100 opacity-80 pt-1">
              Sum of Mobile Banking, Bank Account, Cash in Wallet, and Cards
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handleOpenAddTx}
              className="px-4 py-2.5 bg-white text-brand-700 hover:bg-brand-50 rounded-xl text-xs font-black shadow-sm transition-all"
            >
              + Quick Transaction
            </button>
            <button
              type="button"
              onClick={() => setIsDueBorrowDrawerOpen(true)}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold backdrop-blur-sm transition-all"
            >
              Due & Borrow ({dueBorrowRecords.filter(r => r.status !== 'settled').length})
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 FIXED ACCOUNTS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Standard Accounts (4)
          </h4>
          <span className="text-[11px] text-slate-400">Reconciled strictly via transactions</span>
        </div>
        <CompactAccountCards
          accounts={summary.accounts}
          transactions={transactions}
        />
      </div>

      {/* MONTHLY BUDGET & DUE/BORROW ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MonthlyBudgetCard
          budgetLimit={summary.budgetLimit}
          monthlySpent={summary.monthlySpent}
          remainingBudget={summary.remainingBudget}
          budgetUsagePercentage={summary.budgetUsagePercentage}
          isNearLimit={summary.isNearLimit}
          isOverBudget={summary.isOverBudget}
          onEditBudget={updateBudgetLimit}
        />

        <DueBorrowCard
          dueBorrowSummary={summary.dueBorrowSummary}
          onOpenManage={() => setIsDueBorrowDrawerOpen(true)}
        />
      </div>

      {/* TRANSACTIONS & EXPENSE DISTRIBUTION SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Transaction History (7 cols on xl) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Transaction History ({filteredTransactions.length})
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Search, filter, or review your complete income and expense ledger
              </p>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 font-medium"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
              >
                <option value="all">All Types</option>
                <option value="expense">Expenses (-)</option>
                <option value="income">Income (+)</option>
              </select>
            </div>
          </div>

          {/* Transactions Table / List */}
          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No Transactions Found"
              description="Log your first income or expense transaction to update account balances."
              actionLabel="Log Transaction"
              onAction={handleOpenAddTx}
            />
          ) : (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map(tx => {
                const isIncome = tx.type === 'income';
                const accountName = getAccountName(tx.accountId);

                return (
                  <div
                    key={tx.id}
                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors gap-3"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className={`p-2.5 rounded-2xl shrink-0 ${
                        isIncome
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                      }`}>
                        {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                          {tx.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                          <span className="font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                            {tx.category}
                          </span>
                          <span>•</span>
                          <span>{accountName}</span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{tx.date}</span>
                          </span>
                        </div>
                        {tx.notes && (
                          <p className="text-[11px] text-slate-400 italic mt-0.5 truncate">
                            {tx.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <span className={`text-sm sm:text-base font-black ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {isIncome ? `+${formatBDT(tx.amount)}` : `-${formatBDT(tx.amount)}`}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTx(tx)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete transaction "${tx.title}"?`)) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Expense Category Pie Chart (5 cols on xl, sticky on desktop) */}
        <div className="xl:col-span-5 xl:sticky xl:top-6">
          <ExpenseCategoryPieChart transactions={transactions} />
        </div>
      </div>

      {/* TRANSACTION EDITOR MODAL */}
      <TransactionEditorModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        transaction={editingTx}
        onSave={handleSaveTx}
      />

      {/* DUE & BORROW MANAGEMENT DRAWER */}
      <DueBorrowDrawer
        isOpen={isDueBorrowDrawerOpen}
        onClose={() => setIsDueBorrowDrawerOpen(false)}
        records={dueBorrowRecords}
        onOpenAdd={handleOpenAddDueBorrow}
        onOpenEdit={handleOpenEditDueBorrow}
        onOpenSettle={handleOpenSettleDueBorrow}
        onDeleteRecord={deleteDueBorrowRecord}
        onReopenRecord={reopenDueBorrowRecord}
      />

      {/* DUE & BORROW EDITOR MODAL */}
      <DueBorrowEditorModal
        isOpen={isDueBorrowModalOpen}
        onClose={() => {
          setIsDueBorrowModalOpen(false);
          setEditingDueBorrowRecord(null);
        }}
        record={editingDueBorrowRecord}
        onSave={handleSaveDueBorrow}
      />

      {/* SETTLEMENT DIALOG */}
      <SettlementDialog
        isOpen={isSettlementOpen}
        onClose={() => {
          setIsSettlementOpen(false);
          setRecordForSettlement(null);
        }}
        record={recordForSettlement}
        onConfirm={settleDueBorrowRecord}
      />
    </div>
  );
};

export default ExpensesPage;
