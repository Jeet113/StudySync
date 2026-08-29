import React from 'react';
import { OrderedClassRow } from './OrderedClassRow';
import { calculateTuitionProgress } from '../../utils/tuitionUtils';

export const OrderedClassList = ({ student, onDateChange }) => {
  const metrics = calculateTuitionProgress(student);
  const slots = Array.isArray(student?.classSlots) ? student.classSlots : [];

  return (
    <div className="space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Monthly Ordered Classes ({metrics.completed} / {metrics.planned})
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Select the date each class was conducted. Earned income updates automatically.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
            {metrics.progressPercent}% Completed
          </span>
        </div>
      </div>

      {/* Rows Container */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {slots.map((slot) => (
          <OrderedClassRow
            key={slot.id || `slot-${slot.order}`}
            slot={slot}
            student={student}
            onDateChange={onDateChange}
            allSlots={slots}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderedClassList;
