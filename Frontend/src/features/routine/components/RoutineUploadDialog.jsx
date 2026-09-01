import React, { useRef, useState } from 'react';
import { AlertTriangle, FileImage, FileText, RefreshCw, Trash2, UploadCloud } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { ROUTINE_OCR_ACCEPT, ROUTINE_OCR_MAX_FILE_MB } from '../services/routineOcrService.js';
import { useRoutineImport } from '../hooks/useRoutineImport.js';
import { RoutineOcrProgress } from './RoutineOcrProgress';
import { GroupSelectionStep } from './GroupSelectionStep';
import { ExtractedCoursesReview } from './ExtractedCoursesReview';
import { ExtractedRoutineReview } from './ExtractedRoutineReview';
import { RoutineImportSummary } from './RoutineImportSummary';

const formatBytes = bytes => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export const RoutineUploadDialog = ({ isOpen, onClose, routines, courses, onDataChanged, onManualEntry }) => {
  const importer = useRoutineImport({ routines, existingCourses: courses, onDataChanged });
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const closeDialog = () => {
    importer.cancelExtraction();
    importer.resetImport();
    setConfirmed(false);
    onClose();
  };

  const chooseFiles = files => {
    const selected = files?.[0];
    if (selected) importer.chooseFile(selected);
  };

  const renderUpload = () => <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-slate-500 dark:text-slate-400">PDF, PNG, JPG/JPEG, or WEBP · up to {ROUTINE_OCR_MAX_FILE_MB} MB</p>{importer.mockMode && <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-[10px] font-bold text-amber-700 dark:text-amber-300">Development mock OCR</span>}</div>
    {!importer.file ? <div
      onDragEnter={event => { event.preventDefault(); setDragging(true); }}
      onDragOver={event => event.preventDefault()}
      onDragLeave={event => { event.preventDefault(); setDragging(false); }}
      onDrop={event => { event.preventDefault(); setDragging(false); chooseFiles(event.dataTransfer.files); }}
      className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${dragging ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20' : 'border-slate-300 dark:border-slate-700'}`}
    >
      <UploadCloud className="w-10 h-10 text-cyan-500 mx-auto" /><h4 className="mt-3 text-sm font-extrabold text-slate-900 dark:text-white">Drop your routine here</h4><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">The document is sent only when you start extraction and is never saved in localStorage.</p><button type="button" onClick={() => inputRef.current?.click()} className="mt-4 min-h-11 px-5 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl">Browse files</button>
      <input ref={inputRef} type="file" accept={ROUTINE_OCR_ACCEPT} onChange={event => chooseFiles(event.target.files)} className="sr-only" />
    </div> : <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      {importer.file.type.startsWith('image/') ? <img src={importer.previewUrl} alt="Selected routine preview" className="max-h-64 w-full object-contain rounded-xl bg-slate-100 dark:bg-slate-800" /> : <div className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center"><FileText className="w-12 h-12 text-rose-500" /><span className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">PDF selected</span></div>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div className="min-w-0"><p className="text-sm font-bold text-slate-900 dark:text-white truncate">{importer.file.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{formatBytes(importer.file.size)} · {importer.file.type}</p></div><div className="flex gap-2"><button type="button" onClick={() => inputRef.current?.click()} className="min-h-10 inline-flex items-center gap-1.5 px-3 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"><RefreshCw className="w-3.5 h-3.5" />Replace</button><button type="button" onClick={importer.removeFile} className="min-h-10 inline-flex items-center gap-1.5 px-3 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"><Trash2 className="w-3.5 h-3.5" />Remove</button></div><input ref={inputRef} type="file" accept={ROUTINE_OCR_ACCEPT} onChange={event => chooseFiles(event.target.files)} className="sr-only" /></div>
    </div>}
    <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2"><button type="button" onClick={() => { closeDialog(); onManualEntry(); }} className="min-h-11 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Enter routine manually</button><button type="button" disabled={!importer.file} onClick={importer.startExtraction} className="min-h-11 px-5 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl">Start extraction</button></div>
  </div>;

  const renderReview = () => <div className="space-y-6"><ExtractedCoursesReview courses={importer.courseRows} onUpdate={importer.updateCourse} onMergeDuplicates={importer.mergeDuplicateCourses} /><ExtractedRoutineReview rows={importer.routineRows} onUpdate={importer.updateRoutineRow} onDelete={importer.deleteRoutineRow} onAdd={importer.addRoutineRow} onReset={importer.resetRoutineRow} previewUrl={importer.previewUrl} /><div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2"><button type="button" onClick={() => importer.setStep('group')} className="min-h-11 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Back to group</button><button type="button" onClick={importer.goToConflicts} className="min-h-11 px-5 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl">Review conflicts</button></div></div>;

  const renderConflicts = () => {
    const conflicts = importer.routineRows.filter(row => row.conflicts.length);
    return <div className="space-y-5"><div><h4 className="text-base font-extrabold text-slate-900 dark:text-white">Conflict review</h4><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manual routine entries are never overwritten unless you explicitly choose “Use imported”.</p></div>{conflicts.length === 0 ? <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-xs font-bold text-emerald-700 dark:text-emerald-300">No duplicates or overlaps detected.</div> : <div className="space-y-3">{conflicts.map(row => <div key={row.tempId} className="p-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/10"><p className="text-xs font-extrabold text-slate-900 dark:text-white">{row.dayOfWeek} {row.startTime}–{row.endTime} · {row.courseId}</p>{row.conflicts.map(conflict => <p key={conflict.type} className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">{conflict.label}</p>)}<label className="block mt-3 text-[10px] font-bold text-slate-500">Decision</label><select value={row.conflictResolution} onChange={event => importer.updateRoutineRow(row.tempId, 'conflictResolution', event.target.value)} className="mt-1 w-full min-h-10 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"><option value="keep-existing">Keep existing / skip imported</option><option value="use-imported">Use imported and replace conflicts</option><option value="keep-both">Keep both</option><option value="skip">Skip imported row</option></select><button type="button" onClick={() => importer.setStep('review')} className="mt-2 min-h-9 px-3 text-xs font-bold text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-950/30">Edit imported row</button></div>)}</div>}
      <label className="flex items-start gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="mt-0.5 rounded border-slate-300 text-cyan-600" /><span>I reviewed the extracted courses, routine rows, groups, times, and conflict decisions. Import the approved data into StudySync.</span></label>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2"><button type="button" onClick={() => importer.setStep('review')} className="min-h-11 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Back to editing</button><button type="button" disabled={!confirmed} onClick={importer.confirmImport} className="min-h-11 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl">Confirm import</button></div>
    </div>;
  };

  const visibleStep = importer.step === 'upload' ? 1 : importer.step === 'group' ? 2 : importer.step === 'review' ? 3 : importer.step === 'conflicts' ? 4 : 5;
  return <Modal isOpen={isOpen} onClose={closeDialog} title="Import Routine with OCR" maxWidth="max-w-6xl"><div className="space-y-5 min-w-0">
    {importer.step !== 'processing' && importer.step !== 'summary' && <div className="flex items-center gap-1" aria-label={`Import step ${visibleStep} of 5`}>{['Upload', 'Group', 'Review', 'Conflicts', 'Import'].map((label, index) => <React.Fragment key={label}><div className={`h-2 flex-1 rounded-full ${index < visibleStep ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-slate-700'}`} /> </React.Fragment>)}</div>}
    {importer.error && <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /><span>{importer.error}</span></div>}
    {importer.extraction?.warnings?.length > 0 && ['group', 'review', 'conflicts'].includes(importer.step) && <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300"><p className="font-bold">Some rows need review before they can be imported.</p>{importer.extraction.warnings.map(warning => <p key={warning} className="mt-1">{warning}</p>)}</div>}
    {importer.step === 'upload' && renderUpload()}
    {importer.step === 'processing' && <RoutineOcrProgress progress={importer.progress} onCancel={importer.cancelExtraction} />}
    {importer.step === 'group' && <GroupSelectionStep groups={importer.extraction?.detectedGroups || []} selectedGroup={importer.selectedGroup} onChange={importer.setSelectedGroup} rememberGroup={importer.rememberGroup} onRememberChange={importer.setRememberGroup} onContinue={importer.continueFromGroup} onBack={() => importer.setStep('upload')} />}
    {importer.step === 'review' && renderReview()}
    {importer.step === 'conflicts' && renderConflicts()}
    {importer.step === 'summary' && <RoutineImportSummary summary={importer.summary} onDone={closeDialog} onImportAnother={() => { importer.resetImport(); setConfirmed(false); }} />}
  </div></Modal>;
};
