import React from 'react';
import { LoaderCircle, X } from 'lucide-react';

export const RoutineOcrProgress = ({ progress, onCancel }) => (
  <div className="space-y-5 py-6 text-center">
    <LoaderCircle className="w-10 h-10 text-cyan-500 animate-spin motion-reduce:animate-none mx-auto" />
    <div>
      <h4 className="font-extrabold text-slate-900 dark:text-white">Extracting routine structure</h4>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{progress.message || 'Preparing the OCR request…'}</p>
      {progress.page && <p className="mt-1 text-[11px] text-slate-400">Page {progress.page} of {progress.pageCount}</p>}
    </div>
    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden" aria-label={`OCR progress ${progress.percent || 0}%`} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress.percent || 0}>
      <div className="h-full bg-cyan-500 transition-[width] motion-reduce:transition-none" style={{ width: `${progress.percent || 0}%` }} />
    </div>
    <button type="button" onClick={onCancel} className="min-h-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"><X className="w-4 h-4" />Cancel extraction</button>
  </div>
);

