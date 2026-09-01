import React from 'react';
import { ScanLine } from 'lucide-react';

export const RoutineImportButton = ({ onClick }) => (
  <button type="button" onClick={onClick} className="min-h-11 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors shrink-0">
    <ScanLine className="w-4 h-4" />
    <span>Import Routine</span>
  </button>
);

