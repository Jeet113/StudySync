import React, { useState } from 'react';
import { MoreVertical, Calendar, DollarSign, CheckCircle2, RotateCcw, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { CircularProgress } from '../common/CircularProgress';
import { ProgressBar } from '../common/ProgressBar';
import { formatBDT } from '../../utils/currency';
import { calculateTuitionProgress } from '../../utils/tuitionUtils';
import { getOrdinalClassLabel } from '../../utils/ordinalUtils';

export const CompactTuitionStudentCard = ({
  student,
  onClick,
  onEdit,
  onStartNewMonth,
  onDelete
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const metrics = calculateTuitionProgress(student);

  // Format month name (e.g. "Aug 2026")
  const activeMonthStr = student.activeMonth || new Date().toISOString().slice(0, 7);
  const [yearStr, monthStr] = activeMonthStr.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabel = `${monthNames[parseInt(monthStr || '1', 10) - 1] || activeMonthStr} ${yearStr}`;

  const nextClassText = metrics.nextUnloggedOrder
    ? `Next: ${getOrdinalClassLabel(metrics.nextUnloggedOrder)}`
    : 'All completed';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      className="group relative p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between space-y-4"
    >
      {/* Top Row: Color Pill + Name + Overflow Menu */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: student.cardColor || '#4F46E5' }}
            />
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {student.studentName}
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {student.subject}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Badge variant={student.paymentStatus === 'paid' ? 'emerald' : student.paymentStatus === 'overdue' ? 'rose' : 'amber'}>
              {student.paymentStatus?.toUpperCase()}
            </Badge>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Student actions menu"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-30 text-xs animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onEdit(student);
                      }}
                      className="w-full px-3.5 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-left font-bold"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onStartNewMonth(student);
                      }}
                      className="w-full px-3.5 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-left font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-brand-500" />
                      <span>Start New Month</span>
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDelete(student);
                      }}
                      className="w-full px-3.5 py-2 flex items-center space-x-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Month & Next Class Subtitle */}
        <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
          <span className="font-semibold">{monthLabel}</span>
          <span className="font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-full">
            {nextClassText}
          </span>
        </div>

        {/* Compact Progress Box */}
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
          <div className="space-y-0.5 text-xs">
            <p className="font-black text-slate-900 dark:text-white">
              {formatBDT(metrics.earnedAmount)} <span className="text-[10px] text-slate-400 font-medium">/ {formatBDT(metrics.salary)}</span>
            </p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {metrics.completed} / {metrics.planned} classes conducted
            </p>
          </div>

          <div className="shrink-0 pl-2">
            <CircularProgress
              value={metrics.progressPercent}
              size={48}
              strokeWidth={4.5}
              color={student.cardColor || '#4F46E5'}
              label=""
            />
          </div>
        </div>
      </div>

      {/* Footer Info: Last Paid Date + Click to Expand prompt */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 truncate">
          {student.lastPaidDate ? `Last paid: ${student.lastPaidDate}` : 'No payment recorded'}
        </span>

        <span className="font-bold text-brand-600 dark:text-brand-400 flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform shrink-0">
          <span>Details</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};

export default CompactTuitionStudentCard;
