import React, { useState } from 'react';
import { CheckCircle2, Circle, Calendar, X, AlertTriangle } from 'lucide-react';
import { getOrdinalClassLabel } from '../../utils/ordinalUtils';
import { validateClassDate } from '../../utils/tuitionUtils';

export const OrderedClassRow = ({
  slot,
  student,
  onDateChange,
  allSlots = []
}) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [inputDate, setInputDate] = useState(slot.date || '');
  const [warningMsg, setWarningMsg] = useState(null);

  const isCompleted = Boolean(slot.date && String(slot.date).trim() !== '');
  const ordinalLabel = getOrdinalClassLabel(slot.order);

  const handleDateSelect = (e) => {
    const newDate = e.target.value;
    setInputDate(newDate);

    if (newDate) {
      const validation = validateClassDate(newDate, allSlots, slot.order);
      setWarningMsg(validation.warning);
      onDateChange(student.id, slot.order, newDate);
      setIsEditingDate(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInputDate('');
    setWarningMsg(null);
    onDateChange(student.id, slot.order, null);
    setIsEditingDate(false);
  };

  return (
    <div
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/40 text-slate-900 dark:text-white'
          : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Left: Check status + Ordinal Label */}
      <div className="flex items-center space-x-3 min-w-0">
        <button
          type="button"
          aria-label={`${ordinalLabel} ${isCompleted ? 'completed on ' + slot.date : 'not completed'}`}
          onClick={() => {
            if (!isCompleted) {
              setIsEditingDate(true);
            }
          }}
          className="shrink-0 transition-transform active:scale-95"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-brand-500" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold capitalize tracking-tight text-slate-800 dark:text-slate-200">
              {ordinalLabel}
            </span>
            {isCompleted && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                Conducted
              </span>
            )}
          </div>

          {/* Date or prompt */}
          {isCompleted ? (
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{slot.date}</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 italic mt-0.5">
              No date recorded yet
            </p>
          )}

          {/* Warning Message if any */}
          {warningMsg && (
            <div className="flex items-center space-x-1 text-[10px] text-amber-600 dark:text-amber-400 mt-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>{warningMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Date Picker / Actions */}
      <div className="flex items-center space-x-2 mt-2 sm:mt-0 self-end sm:self-auto">
        {isEditingDate ? (
          <div className="flex items-center space-x-1">
            <input
              type="date"
              aria-label={`Select date for ${ordinalLabel}`}
              value={inputDate}
              onChange={handleDateSelect}
              className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-brand-500 font-medium"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setIsEditingDate(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : isCompleted ? (
          <div className="flex items-center space-x-1">
            <input
              type="date"
              aria-label={`Change date for ${ordinalLabel}`}
              value={slot.date || ''}
              onChange={handleDateSelect}
              className="px-2 py-1 text-xs bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg outline-none cursor-pointer text-slate-600 dark:text-slate-300"
              title="Click to change date"
            />
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              title="Clear date"
              aria-label={`Clear date for ${ordinalLabel}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <label className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-800 dark:hover:bg-brand-950/40 text-slate-600 dark:text-slate-300 rounded-xl cursor-pointer transition-all border border-slate-200/60 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-brand-500" />
              <span>Select Date</span>
              <input
                type="date"
                aria-label={`Select date for ${ordinalLabel}`}
                value=""
                onChange={handleDateSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderedClassRow;
