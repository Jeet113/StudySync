import React from 'react';
import { GitMerge, RotateCcw } from 'lucide-react';

const fieldClass = 'w-full min-h-10 px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg';

export const ExtractedCoursesReview = ({ courses, onUpdate, onMergeDuplicates }) => (
  <section className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Courses</h4><p className="text-[11px] text-slate-500 dark:text-slate-400">Existing courses are matched by normalized course ID.</p></div><button type="button" onClick={onMergeDuplicates} className="min-h-10 inline-flex items-center gap-1.5 px-3 text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl"><GitMerge className="w-3.5 h-3.5" />Merge duplicate courses</button></div>
    <div className="space-y-3">
      {courses.map(course => <div key={course.tempId} className={`p-3 rounded-2xl border ${course.validation.errors.length ? 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/10' : course.validation.warnings.length ? 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
        <div className="flex items-center justify-between gap-3 mb-3"><label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200"><input type="checkbox" checked={course.include !== false} onChange={event => onUpdate(course.tempId, 'include', event.target.checked)} />Include course</label><span className="text-[10px] font-bold text-slate-400">Page {course.sourcePage} · {Math.round(course.confidence * 100)}% confidence</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <div><label className="text-[10px] font-bold text-slate-500">Course ID</label><input aria-label="Extracted course ID" value={course.courseId} onChange={event => onUpdate(course.tempId, 'courseId', event.target.value)} className={fieldClass} /></div>
          <div className="lg:col-span-2"><label className="text-[10px] font-bold text-slate-500">Title</label><input aria-label="Extracted course title" value={course.title} onChange={event => onUpdate(course.tempId, 'title', event.target.value)} className={fieldClass} /></div>
          <div><label className="text-[10px] font-bold text-slate-500">Credit</label><input aria-label="Extracted course credit" type="number" step="0.25" min="0" value={course.credit} onChange={event => onUpdate(course.tempId, 'credit', Number(event.target.value))} className={fieldClass} /></div>
          <div><label className="text-[10px] font-bold text-slate-500">Type</label><select aria-label="Extracted course type" value={course.courseType} onChange={event => onUpdate(course.tempId, 'courseType', event.target.value)} className={fieldClass}><option value="theory">Theory</option><option value="lab">Lab</option><option value="sessional">Sessional</option><option value="tutorial">Tutorial</option></select></div>
          <div className="sm:col-span-2 lg:col-span-3"><label className="text-[10px] font-bold text-slate-500">Teacher</label><input aria-label="Extracted course teacher" value={course.teacherName} onChange={event => onUpdate(course.tempId, 'teacherName', event.target.value)} className={fieldClass} /></div>
          {course.existing && <div className="sm:col-span-2"><label className="text-[10px] font-bold text-slate-500">Existing course decision</label><select value={course.courseResolution} onChange={event => onUpdate(course.tempId, 'courseResolution', event.target.value)} className={fieldClass}><option value="keep-existing">Keep existing</option><option value="replace">Replace with extracted</option></select></div>}
        </div>
        {course.differences.length > 0 && <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-300">Differences: {course.differences.map(item => `${item.field} (${item.current || 'missing'} → ${item.incoming || 'missing'})`).join('; ')}</p>}
        {[...course.validation.errors, ...course.validation.warnings].map(message => <p key={message} className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{message}</p>)}
      </div>)}
    </div>
  </section>
);

