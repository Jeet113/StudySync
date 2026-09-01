import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import {
  STANDARD_ACCOUNTS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  normalizeAccountId,
  normalizeCategory
} from '../../utils/expenseUtils';

export const TransactionEditorModal = ({
  isOpen,
  onClose,
  transaction = null,
  onSave
}) => {
  const isEditing = Boolean(transaction?.id);

  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    accountId: 'acc-cash',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (transaction) {
      setForm({
        title: transaction.title || '',
        amount: transaction.amount || '',
        type: transaction.type || 'expense',
        category: transaction.category || 'Food',
        accountId: normalizeAccountId(transaction.accountId),
        date: transaction.date || new Date().toISOString().split('T')[0],
        notes: transaction.notes || ''
      });
      setErrorMsg('');
    } else {
      setForm({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        accountId: 'acc-cash',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setErrorMsg('');
    }
  }, [transaction, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (newType) => {
    const defaultCat = newType === 'income' ? 'Tuition Income' : 'Food';
    setForm(prev => ({
      ...prev,
      type: newType,
      category: defaultCat
    }));
  };

  const handleCategoryChange = (newCategory) => {
    if (newCategory === 'Tuition Income' && form.type === 'expense') {
      setForm(prev => ({
        ...prev,
        type: 'income',
        category: 'Tuition Income'
      }));
      return;
    }
    setForm(prev => ({ ...prev, category: newCategory }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(form.amount);

    if (!form.title.trim()) {
      setErrorMsg('Please enter a transaction title.');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMsg('Amount must be greater than zero.');
      return;
    }
    if (!form.accountId) {
      setErrorMsg('Please select an account source.');
      return;
    }

    onSave({
      ...form,
      title: form.title.trim(),
      amount: amountNum,
      notes: form.notes.trim()
    });

    onClose();
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Financial Transaction' : 'Log Financial Transaction'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              form.type === 'expense'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              form.type === 'income'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Income (+)
          </button>
        </div>

        {/* Transaction Title */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Transaction Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Mess Dining Bill, Tuition Fee"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-900 dark:text-white focus:border-brand-500"
            autoFocus
          />
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Amount (৳ BDT) *
            </label>
            <input
              type="number"
              min="1"
              step="any"
              required
              placeholder="500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-black text-slate-900 dark:text-white focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium focus:border-brand-500"
            />
          </div>
        </div>

        {/* Account Source & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Account Source *
            </label>
            <select
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            >
              {STANDARD_ACCOUNTS.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Note */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Optional Note
          </label>
          <input
            type="text"
            placeholder="e.g. Monthly internet recharge, cash deposit"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500"
          />
        </div>

        {errorMsg && (
          <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 font-bold">
            {errorMsg}
          </p>
        )}

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
            {isEditing ? 'Save Changes' : 'Confirm Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionEditorModal;
