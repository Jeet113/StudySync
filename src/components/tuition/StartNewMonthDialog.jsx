import React, { useState } from 'react';
import { RotateCcw, Calendar, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { formatBDT } from '../../utils/currency';
import { calculateTuitionProgress } from '../../utils/tuitionUtils';

export const StartNewMonthDialog = ({
  isOpen,
  onClose,
  student,
  onConfirm
}) => {
  const metrics = calculateTuitionProgress(student);

  // Compute next month default
  const currentActiveMonth = student?.activeMonth || new Date().toISOString().slice(0, 7);
  const [yearStr, monthStr] = currentActiveMonth.split('-');
  let nextY = parseInt(yearStr || new Date().getFullYear(), 10);
  let nextM = parseInt(monthStr || '1', 10) + 1;
  if (nextM > 12) {
    nextM = 1;
    nextY += 1;
  }
  const defaultNextMonth = `${nextY}-${String(nextM).padStart(2, '0')}`;

  const [targetMonth, setTargetMonth] = useState(defaultNextMonth);

  if (!isOpen || !student) return null;

  // Format month names
  const getMonthName = (yyyymm) => {
    const parts = (yyyymm || '').split('-');
    const m = parseInt(parts[1] || '1', 10);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[m - 1] || yyyymm} ${parts[0]}`;
  };

  const handleExecute = () => {
    onConfirm(student.id, targetMonth);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Start New Month for ${student.studentName}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Banner Alert */}
        <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-start space-x-3 text-xs">
          <RotateCcw className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-slate-800 dark:text-slate-200">
            <p className="font-extrabold text-brand-700 dark:text-brand-300">
              Close {getMonthName(student.activeMonth)} & Begin New Period
            </p>
            <p className="opacity-90 leading-relaxed">
              Current progress will be safely archived into <strong>Monthly History</strong>. Your student configuration, salary, planned class count, and notes will remain intact while active class slot dates reset to empty.
            </p>
          </div>
        </div>

        {/* Current Month Snapshot Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Snapshot to be Archived ({getMonthName(student.activeMonth)})
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Classes Conducted</span>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {metrics.completed} / {metrics.planned} ({metrics.progressPercent}%)
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Earned Amount</span>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {formatBDT(metrics.earnedAmount)}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Monthly Salary Target</span>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {formatBDT(metrics.salary)}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Last Paid Date</span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {student.lastPaidDate || 'None recorded'}
              </p>
            </div>
          </div>
        </div>

        {/* Target Next Month Selection */}
        <div className="space-y-1.5 text-xs">
          <label className="block font-bold text-slate-700 dark:text-slate-300">
            Target New Month (YYYY-MM)
          </label>
          <input
            type="month"
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-slate-900 dark:text-white"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecute}
            className="px-5 py-2.5 text-xs font-black bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <span>Confirm & Start New Month</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StartNewMonthDialog;
