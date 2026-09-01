import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

export const DueBorrowEditorModal = ({
  isOpen,
  onClose,
  record = null,
  onSave
}) => {
  const isEditing = Boolean(record?.id);

  const [form, setForm] = useState({
    title: '',
    direction: 'i_owe', // 'i_owe' or 'owed_to_me'
    amount: '',
    dueDate: '',
    note: ''
  });

  useEffect(() => {
    if (record) {
      setForm({
        title: record.title || '',
        direction: record.direction || 'i_owe',
        amount: record.amount || '',
        dueDate: record.dueDate || '',
        note: record.note || ''
      });
    } else {
      setForm({
        title: '',
        direction: 'i_owe',
        amount: '',
        dueDate: '',
        note: ''
      });
    }
  }, [record, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(form.amount);
    if (!form.title.trim() || isNaN(amountNum) || amountNum <= 0) return;

    onSave({
      ...form,
      title: form.title.trim(),
      amount: amountNum,
      note: form.note.trim()
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Due / Borrow Record' : 'Add Due / Borrow Record'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Direction Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setForm({ ...form, direction: 'i_owe' })}
            className={`py-2 text-xs font-black rounded-lg transition-all ${
              form.direction === 'i_owe'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            I Owe (Payable Debt)
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, direction: 'owed_to_me' })}
            className={`py-2 text-xs font-black rounded-lg transition-all ${
              form.direction === 'owed_to_me'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Owed to Me (Receivable)
          </button>
        </div>

        {/* Reference / Person Title */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Person / Reference Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Mess Manager, Tanvir (Book Share)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold focus:border-brand-500"
            autoFocus
          />
        </div>

        {/* Amount & Due Date */}
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
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-black focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium focus:border-brand-500"
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Note / Description
          </label>
          <input
            type="text"
            placeholder="e.g. For canteen bill, book share"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500"
          />
        </div>

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
            {isEditing ? 'Save Changes' : 'Save Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DueBorrowEditorModal;
