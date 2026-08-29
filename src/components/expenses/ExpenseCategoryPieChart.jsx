import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Tooltip
} from 'recharts';
import { PieChart as PieChartIcon, Tag, TrendingDown } from 'lucide-react';
import { formatBDT } from '../../utils/currency';

// Color map for standard expense categories
const CATEGORY_COLORS = {
  'Food': '#F59E0B',              // Amber
  'Academic Materials': '#4F46E5', // Indigo
  'Fees': '#8B5CF6',               // Purple
  'Internet & Bills': '#06B6D4',   // Cyan
  'Transportation': '#10B981',     // Emerald
  'Other': '#64748B'               // Slate
};

const DEFAULT_COLOR = '#3B82F6';

// Custom active shape for smooth interactive hover expansion
const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill
  } = props;

  return (
    <g>
      {/* Outer expanded sector with glow */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={8}
        style={{
          filter: 'drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.15))',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      {/* Subtle inner accent ring */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 6}
        outerRadius={innerRadius - 3}
        fill={fill}
        opacity={0.6}
        cornerRadius={4}
      />
    </g>
  );
};

export const ExpenseCategoryPieChart = ({ transactions = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Derive expense category distribution
  const { chartData, totalExpense } = useMemo(() => {
    const expenseTx = transactions.filter(t => t.type === 'expense');
    let total = 0;
    const catMap = {};

    expenseTx.forEach(t => {
      const amt = Math.max(0, parseFloat(t.amount) || 0);
      const cat = t.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + amt;
      total += amt;
    });

    const data = Object.keys(catMap).map(cat => ({
      name: cat,
      value: catMap[cat],
      percentage: total > 0 ? Math.round((catMap[cat] / total) * 100) : 0,
      color: CATEGORY_COLORS[cat] || DEFAULT_COLOR
    })).sort((a, b) => b.value - a.value);

    return { chartData: data, totalExpense: total };
  }, [transactions]);

  const activeItem = activeIndex !== null && chartData[activeIndex] ? chartData[activeIndex] : null;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              Expense Distribution
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Breakdown across categories
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spent</span>
          <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
            {formatBDT(totalExpense)}
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      {chartData.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-1.5">
          <TrendingDown className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-bold text-slate-500">No Expense Data</p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Log your first expense transaction to visualize category spending.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={84}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={100}
                  animationDuration={800}
                  animationEasing="ease-out"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="transparent"
                      className="transition-all duration-300"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Dynamic Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate max-w-[110px]">
                {activeItem ? activeItem.name : 'Total Expense'}
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
                {activeItem ? formatBDT(activeItem.value) : formatBDT(totalExpense)}
              </span>
              <span className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400">
                {activeItem ? `${activeItem.percentage}% of total` : `${chartData.length} categories`}
              </span>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {chartData.map((item, index) => {
              const isHovered = activeIndex === index;

              return (
                <button
                  type="button"
                  key={item.name}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={() => setActiveIndex(isHovered ? null : index)}
                  className={`p-2 rounded-xl flex items-center justify-between text-left transition-all border ${
                    isHovered
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-sm scale-[1.02]'
                      : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800/60 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 pl-1">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-2xs">
                      {item.percentage}%
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {formatBDT(item.value)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategoryPieChart;
