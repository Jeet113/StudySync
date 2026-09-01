import React from 'react';
import { Users } from 'lucide-react';
import { deriveSectionFromGroup, normalizeGroup } from '../utils/groupSectionUtils.js';

export const GroupSelectionStep = ({ groups, selectedGroup, onChange, rememberGroup, onRememberChange, onContinue, onBack }) => {
  const section = deriveSectionFromGroup(selectedGroup);
  return (
    <div className="space-y-5">
      <div className="text-center"><Users className="w-9 h-9 text-cyan-500 mx-auto" /><h4 className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">Which group are you in?</h4><p className="text-xs text-slate-500 dark:text-slate-400">StudySync will include your group, section-wide classes, and common classes.</p></div>
      {groups.length > 0 ? <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{groups.map(group => <button key={group} type="button" onClick={() => onChange(normalizeGroup(group))} className={`min-h-12 rounded-xl text-sm font-extrabold border ${normalizeGroup(selectedGroup) === normalizeGroup(group) ? 'bg-cyan-600 border-cyan-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>{group}</button>)}</div> : <p className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-300">No groups were detected confidently. Enter your group manually and review every included row.</p>}
      <div><label htmlFor="routine-group-manual" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Group</label><input id="routine-group-manual" list="detected-routine-groups" value={selectedGroup} onChange={event => onChange(normalizeGroup(event.target.value))} placeholder="e.g. B2" className="w-full min-h-11 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" /><datalist id="detected-routine-groups">{groups.map(group => <option key={group} value={group} />)}</datalist>{section && <p className="mt-2 text-xs font-bold text-cyan-600 dark:text-cyan-400">Automatically mapped to Section {section}</p>}</div>
      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"><input type="checkbox" checked={rememberGroup} onChange={event => onRememberChange(event.target.checked)} className="rounded border-slate-300 text-cyan-600" />Remember this group on this device</label>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2"><button type="button" onClick={onBack} className="min-h-11 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Back</button><button type="button" onClick={onContinue} className="min-h-11 px-5 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl">Review extracted routine</button></div>
    </div>
  );
};
