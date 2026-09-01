import React, { useState } from 'react';
import { DollarSign, Edit2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ProgressBar } from '../common/ProgressBar';
import { formatBDT } from '../../utils/currency';

export const BudgetEditorModal = ({
  isOpen,
  onClose,
  currentBudget = 12000,
  onSave
}) => {
  const [limit, setLimit] = useState(currentBudget);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = Math.max(0, parseFloat(limit) || 0);
    onSave(val);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Monthly Expense Budget"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Monthly Target Budget Limit (৳ BDT)
          </label>
          <input
            type="number"
            min="0"
            step="100"
            required
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-black text-slate-900 dark:text-white text-base focus:border-brand-500"
            autoFocus
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Calculated exclusively from your expense transactions for the active month.
          </p>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-black bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md transition-all"
          >
            Save Budget
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const MonthlyBudgetCard = ({
  budgetLimit = 12000,
  monthlySpent = 0,
  remainingBudget = 0,
  budgetUsagePercentage = 0,
  isNearLimit = false,
  isOverBudget = false,
  onEditBudget
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const progressColor = isOverBudget ? 'rose' : isNearLimit ? 'amber' : 'emerald';

  return (
    <>
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                Monthly Student Expense Budget
              </h3>
              {isOverBudget ? (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>OVER BUDGET</span>
                </span>
              ) : isNearLimit ? (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>NEAR LIMIT</span>
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Spent <strong className="text-slate-700 dark:text-slate-300 font-black">{formatBDT(monthlySpent)}</strong> of <strong className="text-slate-700 dark:text-slate-300 font-black">{formatBDT(budgetLimit)}</strong> monthly target limit
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <div className="text-right">
              <span className="text-xs font-black uppercase text-slate-400 block text-[10px]">
                {isOverBudget ? 'Budget Exceeded By' : 'Remaining Target'}
              </span>
              <span className={`text-base sm:text-lg font-black ${
                isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {isOverBudget ? formatBDT(monthlySpent - budgetLimit) : formatBDT(remainingBudget)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              title="Edit monthly budget"
              aria-label="Edit monthly budget limit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <ProgressBar
            progress={Math.min(100, budgetUsagePercentage)}
            color={progressColor}
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-bold">
            <span>{budgetUsagePercentage}% of budget utilized</span>
            <span>Expenses Only</span>
          </div>
        </div>
      </div>

      <BudgetEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBudget={budgetLimit}
        onSave={(val) => {
          if (onEditBudget) onEditBudget(val);
        }}
      />
    </>
  );
};

export default MonthlyBudgetCard;
