import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, Calendar, CheckCircle2 } from 'lucide-react';
import { formatBDT } from '../../utils/currency';
import { getOrdinalClassLabel } from '../../utils/ordinalUtils';

export const TuitionMonthHistory = ({ student }) => {
  const [expandedId, setExpandedId] = useState(null);
  const history = Array.isArray(student?.monthHistory) ? student.monthHistory : [];

  if (history.length === 0) {
    return (
      <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 space-y-1">
        <History className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto" />
        <p className="text-xs font-bold text-slate-500">No previous monthly history</p>
        <p className="text-[11px] text-slate-400">
          When you click "Start New Month", a snapshot of the current month's completed classes and earned income is saved here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Month History ({history.length} {history.length === 1 ? 'Month' : 'Months'})
        </h4>
        <span className="text-[11px] text-slate-400">Read-only snapshots</span>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {history.map((item) => {
          const isExpanded = expandedId === item.id;
          const percent = item.progressPercent !== undefined
            ? item.progressPercent
            : (item.plannedClasses > 0 ? Math.round((item.completedClasses / item.plannedClasses) * 100) : 0);

          return (
            <div
              key={item.id || item.activeMonth}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm"
            >
              {/* Summary Bar */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0" />
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {item.month} {item.year}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      {item.completedClasses} of {item.plannedClasses} classes ({percent}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatBDT(item.earnedAmount)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      of {formatBDT(item.monthlySalary)}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-2">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Salary Target</span>
                      <p className="font-extrabold text-slate-900 dark:text-white">{formatBDT(item.monthlySalary)}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Total Earned</span>
                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatBDT(item.earnedAmount)}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Last Paid Date</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-300">{item.lastPaidDate || 'Not recorded'}</p>
                    </div>
                  </div>

                  {/* List of class dates recorded in that month */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Recorded Class Dates ({Array.isArray(item.classDates) ? item.classDates.length : 0})
                    </span>
                    {Array.isArray(item.classDates) && item.classDates.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-1.5">
                        {item.classDates.map((d, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[10px] flex items-center space-x-1.5"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {typeof d === 'object' ? `${getOrdinalClassLabel(d.order)}: ${d.date}` : String(d)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic mt-1">No specific dates recorded.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TuitionMonthHistory;
