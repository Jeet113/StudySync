import React, { useState } from 'react';
import {
  X,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  RotateCcw,
  HandCoins
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatBDT } from '../../utils/currency';

export const DueBorrowDrawer = ({
  isOpen,
  onClose,
  records = [],
  onOpenAdd,
  onOpenEdit,
  onOpenSettle,
  onDeleteRecord,
  onReopenRecord
}) => {
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'i_owe', 'owed_to_me', 'settled'

  if (!isOpen) return null;

  const filteredRecords = records.filter(r => {
    if (filterTab === 'settled') return r.status === 'settled';
    if (filterTab === 'i_owe') return r.direction === 'i_owe' && r.status !== 'settled';
    if (filterTab === 'owed_to_me') return r.direction === 'owed_to_me' && r.status !== 'settled';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl z-10 h-full flex flex-col overflow-hidden border-l border-slate-200/80 dark:border-slate-800">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <HandCoins className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Due & Borrow Ledger
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Track debts, shared meal costs, and receivables. Balances update only upon confirmed settlement.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              aria-label="Close ledger"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterTab === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                All ({records.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('i_owe')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterTab === 'i_owe' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500'}`}
              >
                I Owe
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('owed_to_me')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterTab === 'owed_to_me' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
              >
                Owed to Me
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('settled')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterTab === 'settled' ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm' : 'text-slate-500'}`}
              >
                Settled
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenAdd}
              className="flex items-center space-x-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          </div>
        </div>

        {/* Scrollable Records */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800">
              <HandCoins className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-500">No records found in this view</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add a due or borrow record to track obligations.
              </p>
            </div>
          ) : (
            filteredRecords.map(rec => {
              const isSettled = rec.status === 'settled';
              const remaining = Math.max(0, rec.amount - (rec.settledAmount || 0));
              const isIOwe = rec.direction === 'i_owe';

              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSettled
                      ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-80'
                      : isIOwe
                      ? 'bg-white dark:bg-slate-900 border-rose-200/70 dark:border-rose-900/40 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-emerald-200/70 dark:border-emerald-900/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isIOwe
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isIOwe ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {rec.title}
                          </h4>
                          <Badge variant={isSettled ? 'slate' : rec.status === 'partially_settled' ? 'amber' : isIOwe ? 'rose' : 'emerald'}>
                            {rec.status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                          {isIOwe ? 'I Owe' : 'Owed to Me'}: <span className="font-extrabold text-slate-900 dark:text-white">{formatBDT(rec.amount)}</span>
                          {rec.settledAmount > 0 && (
                            <span className="text-slate-400 font-normal"> (Settled: {formatBDT(rec.settledAmount)})</span>
                          )}
                        </p>

                        {rec.dueDate && (
                          <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-1 font-medium">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Due Date: {rec.dueDate}</span>
                          </p>
                        )}

                        {rec.note && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1">
                            "{rec.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining</span>
                      <span className={`text-base font-black ${
                        isSettled ? 'text-slate-400' : isIOwe ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {formatBDT(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {!isSettled ? (
                      <button
                        type="button"
                        onClick={() => onOpenSettle(rec)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Settle</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onReopenRecord(rec.id)}
                        className="flex items-center space-x-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reopen</span>
                      </button>
                    )}

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onOpenEdit(rec)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg transition-colors"
                        title="Edit record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete record "${rec.title}"?`)) {
                            onDeleteRecord(rec.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DueBorrowDrawer;
