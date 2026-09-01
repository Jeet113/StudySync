import React, { useState } from 'react';
import {
  X,
  Edit2,
  RotateCcw,
  Trash2,
  Phone,
  Calendar,
  DollarSign,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  History
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { CircularProgress } from '../common/CircularProgress';
import { OrderedClassList } from './OrderedClassList';
import { TuitionStudentNotes } from './TuitionStudentNotes';
import { TuitionMonthHistory } from './TuitionMonthHistory';
import { formatBDT } from '../../utils/currency';
import { calculateTuitionProgress } from '../../utils/tuitionUtils';

export const TuitionStudentDetailsDrawer = ({
  isOpen,
  onClose,
  student,
  onDateChange,
  onEditStudent,
  onStartNewMonth,
  onDeleteStudent,
  onAddNote,
  onUpdateNote,
  onDeleteNote
}) => {
  const [activeTab, setActiveTab] = useState('classes'); // 'classes', 'notes', 'history'

  if (!isOpen || !student) return null;

  const metrics = calculateTuitionProgress(student);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl z-10 h-full flex flex-col overflow-hidden border-l border-slate-200/80 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3 min-w-0">
              <span
                className="w-4 h-4 rounded-full shrink-0 mt-1 shadow-sm"
                style={{ backgroundColor: student.cardColor || '#4F46E5' }}
              />
              <div className="min-w-0">
                <div className="flex items-center space-x-2 flex-wrap">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                    {student.studentName}
                  </h3>
                  <Badge variant={student.paymentStatus === 'paid' ? 'emerald' : student.paymentStatus === 'overdue' ? 'rose' : 'amber'}>
                    {student.paymentStatus?.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {student.subject} {student.classGrade ? `• ${student.classGrade}` : ''}
                </p>
                {student.guardianContact && (
                  <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{student.guardianContact}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => onStartNewMonth(student)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-sm transition-all shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Month</span>
            </button>

            <button
              type="button"
              onClick={() => onEditStudent(student)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Student</span>
            </button>

            <button
              type="button"
              onClick={() => onDeleteStudent(student)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Financial & Progress Metric Card */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Earned So Far</span>
              <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatBDT(metrics.earnedAmount)}
              </h4>
              <span className="text-[10px] text-slate-400">
                ৳{metrics.perClassRate} / class
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Remaining Target</span>
              <h4 className="text-base font-black text-amber-500 mt-0.5">
                {formatBDT(metrics.remainingAmount)}
              </h4>
              <span className="text-[10px] text-slate-400">
                {metrics.remainingClasses} classes left
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Monthly Salary</span>
              <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {formatBDT(metrics.salary)}
              </h4>
              <span className="text-[10px] text-slate-400">
                {metrics.planned} classes planned
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Last Paid Date</span>
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 mt-1 truncate">
                {student.lastPaidDate || 'Not set'}
              </h4>
              <span className="text-[10px] text-slate-400">Payment date</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-300">
                Monthly Class Completion ({metrics.completed} of {metrics.planned} classes)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {metrics.progressPercent}%
              </span>
            </div>
            <ProgressBar progress={metrics.progressPercent} color="emerald" />
          </div>
        </div>

        {/* Drawer Tabs */}
        <div className="flex items-center space-x-2 px-5 sm:px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 text-xs font-black border-b-2 transition-all ${
              activeTab === 'classes'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Class Log</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800">
              {metrics.completed}/{metrics.planned}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 text-xs font-black border-b-2 transition-all ${
              activeTab === 'notes'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800">
              {student.notes?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 text-xs font-black border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Month History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800">
              {student.monthHistory?.length || 0}
            </span>
          </button>
        </div>

        {/* Scrollable Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === 'classes' && (
            <OrderedClassList
              student={student}
              onDateChange={onDateChange}
            />
          )}

          {activeTab === 'notes' && (
            <TuitionStudentNotes
              student={student}
              onAddNote={onAddNote}
              onUpdateNote={onUpdateNote}
              onDeleteNote={onDeleteNote}
            />
          )}

          {activeTab === 'history' && (
            <TuitionMonthHistory student={student} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TuitionStudentDetailsDrawer;
