import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { STANDARD_ACCOUNTS, EXPENSE_CATEGORIES } from '../../utils/expenseUtils';
import { formatBDT } from '../../utils/currency';

export const SettlementDialog = ({
  isOpen,
  onClose,
  record,
  onConfirm
}) => {
  if (!isOpen || !record) return null;

  const remainingDue = Math.max(0, (record.amount || 0) - (record.settledAmount || 0));

  const [settleAmount, setSettleAmount] = useState(remainingDue);
  const [logTransaction, setLogTransaction] = useState(true);
  const [accountId, setAccountId] = useState('acc-cash');
  const [category, setCategory] = useState(record.direction === 'i_owe' ? 'Food' : 'Tuition Income');
  const [settleDate, setSettleDate] = useState(new Date().toISOString().split('T')[0]);
  const [settleNote, setSettleNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = Math.max(0, parseFloat(settleAmount) || 0);
    if (amountNum <= 0) return;

    onConfirm(record.id, {
      amount: amountNum,
      logTransaction,
      accountId,
      category,
      date: settleDate,
      note: settleNote
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Settlement: ${record.title}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Record Overview */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Record Direction:</span>
            <span className={`font-black ${record.direction === 'i_owe' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {record.direction === 'i_owe' ? 'I Owe (Payable Debt)' : 'Owed to Me (Receivable)'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Total Amount:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">{formatBDT(record.amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Already Settled:</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">{formatBDT(record.settledAmount || 0)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 font-bold">Remaining to Settle:</span>
            <span className="font-black text-brand-600 dark:text-brand-400 text-sm">{formatBDT(remainingDue)}</span>
          </div>
        </div>

        {/* Settlement Amount */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Settlement Amount (৳ BDT) *
          </label>
          <input
            type="number"
            min="1"
            max={remainingDue}
            step="any"
            required
            value={settleAmount}
            onChange={(e) => setSettleAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-black text-slate-900 dark:text-white focus:border-brand-500"
          />
        </div>

        {/* Option to create a financial transaction */}
        <div className="p-3 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/40 space-y-2.5">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={logTransaction}
              onChange={(e) => setLogTransaction(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded"
            />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Log confirmed transaction to account balance
            </span>
          </label>

          {logTransaction && (
            <div className="space-y-2.5 pt-1 pl-6">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 text-[10px] mb-0.5">
                    Account Source
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                  >
                    {STANDARD_ACCOUNTS.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 text-[10px] mb-0.5">
                    Settlement Date
                  </label>
                  <input
                    type="date"
                    value={settleDate}
                    onChange={(e) => setSettleDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
            Confirm Settlement
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SettlementDialog;
