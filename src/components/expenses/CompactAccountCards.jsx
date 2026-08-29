import React from 'react';
import { Smartphone, Building, Coins, CreditCard } from 'lucide-react';
import { formatBDT } from '../../utils/currency';

const getAccountIcon = (type) => {
  switch (type) {
    case 'mobile_banking':
      return Smartphone;
    case 'bank':
      return Building;
    case 'cash':
      return Coins;
    case 'card':
      return CreditCard;
    default:
      return Coins;
  }
};

export const CompactAccountCard = ({ account, txCount = 0 }) => {
  const IconComponent = getAccountIcon(account.type);

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex justify-between items-center text-slate-400">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
          {account.name}
        </span>
        <div
          className="p-1.5 rounded-lg shrink-0"
          style={{ backgroundColor: `${account.color || '#4F46E5'}15`, color: account.color || '#4F46E5' }}
        >
          <IconComponent className="w-4 h-4" />
        </div>
      </div>

      <div>
        <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {formatBDT(account.balance)}
        </h4>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {txCount} {txCount === 1 ? 'transaction' : 'transactions'}
        </p>
      </div>
    </div>
  );
};

export const CompactAccountCards = ({ accounts = [], transactions = [] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {accounts.map(acc => {
        const count = transactions.filter(t => t.accountId === acc.id).length;
        return (
          <CompactAccountCard
            key={acc.id}
            account={acc}
            txCount={count}
          />
        );
      })}
    </div>
  );
};

export default CompactAccountCards;
