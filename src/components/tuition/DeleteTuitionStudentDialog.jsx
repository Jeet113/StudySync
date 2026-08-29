import React, { useState } from 'react';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { formatBDT } from '../../utils/currency';
import { calculateTuitionProgress } from '../../utils/tuitionUtils';

export const DeleteTuitionStudentDialog = ({
  isOpen,
  onClose,
  student,
  onConfirm
}) => {
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !student) return null;

  const metrics = calculateTuitionProgress(student);
  const savedMonthsCount = Array.isArray(student.monthHistory) ? student.monthHistory.length : 0;
  const isMatch = typedConfirmation.trim() === student.studentName || typedConfirmation.trim().toUpperCase() === 'DELETE';

  const handleDelete = () => {
    if (!isMatch) return;
    setIsDeleting(true);
    onConfirm(student.id);
    setIsDeleting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Tuition Student Record"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Warning Banner */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1 text-rose-800 dark:text-rose-300">
            <p className="font-extrabold">Permanent Deletion Warning</p>
            <p className="opacity-90 leading-relaxed">
              This action will permanently delete <strong>{student.studentName}</strong> along with all recorded class slot dates, notes, and monthly snapshots. This cannot be undone.
            </p>
          </div>
        </div>

        {/* Student Impact Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500">Student Name:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">{student.studentName}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500">Saved Month Snapshots:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{savedMonthsCount} months</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500">Current Month Completed Classes:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{metrics.completed} classes</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">Current Month Earned Amount:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">{formatBDT(metrics.earnedAmount)}</span>
          </div>
        </div>

        {/* Typed confirmation */}
        <div className="space-y-2 text-xs">
          <label className="block font-bold text-slate-700 dark:text-slate-300">
            Type <span className="font-extrabold text-rose-600 dark:text-rose-400">"{student.studentName}"</span> or <span className="font-extrabold text-rose-600 dark:text-rose-400">"DELETE"</span> to confirm:
          </label>
          <input
            type="text"
            value={typedConfirmation}
            onChange={(e) => setTypedConfirmation(e.target.value)}
            placeholder={student.studentName}
            className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isMatch || isDeleting}
            onClick={handleDelete}
            className="px-5 py-2.5 text-xs font-black bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Permanently Delete Student</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteTuitionStudentDialog;
