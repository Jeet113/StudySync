import React from 'react';
import { HandCoins, ArrowUpRight, ArrowDownLeft, Calendar, ArrowRight } from 'lucide-react';
import { formatBDT } from '../../utils/currency';

export const DueBorrowCard = ({
  dueBorrowSummary = {},
  onOpenManage
}) => {
  const {
    totalIOwe = 0,
    totalOwedToMe = 0,
    netDuePosition = 0,
    openRecordsCount = 0,
    nearestDueDate = null
  } = dueBorrowSummary;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <HandCoins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              Due & Borrow Record
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {openRecordsCount} open {openRecordsCount === 1 ? 'record' : 'records'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenManage}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
        >
          <span>Manage</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 2 Column Stats: I Owe vs Owed To Me */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
          <div className="flex items-center space-x-1 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase">I Owe</span>
          </div>
          <h4 className="text-base font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatBDT(totalIOwe)}
          </h4>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase">Owed to Me</span>
          </div>
          <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatBDT(totalOwedToMe)}
          </h4>
        </div>
      </div>

      {/* Footer Info: Nearest Due Date */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{nearestDueDate ? `Next due: ${nearestDueDate}` : 'No pending due dates'}</span>
        </span>

        <span className="font-bold text-slate-600 dark:text-slate-300">
          Net: {formatBDT(netDuePosition)}
        </span>
      </div>
    </div>
  );
};

export default DueBorrowCard;
