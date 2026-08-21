import { normalizeCourseId } from './routineValidationUtils.js';

const overlaps = (left, right) => left.dayOfWeek === right.dayOfWeek && left.startTime < right.endTime && left.endTime > right.startTime;

export const isSameRoutineSlot = (left, right) => (
  normalizeCourseId(left.courseId) === normalizeCourseId(right.courseId)
  && left.dayOfWeek === right.dayOfWeek
  && left.startTime === right.startTime
  && left.endTime === right.endTime
  && String(left.group || '') === String(right.group || '')
);

export const findRoutineConflicts = (entries, existingRoutines = []) => entries.map((entry, index) => {
  const duplicateImported = entries.slice(0, index).find(other => other.include !== false && isSameRoutineSlot(entry, other));
  const exactExisting = existingRoutines.filter(existing => isSameRoutineSlot(entry, existing));
  const overlappingExisting = existingRoutines.filter(existing => !isSameRoutineSlot(entry, existing) && overlaps(entry, existing));
  const conflicts = [];
  if (duplicateImported) conflicts.push({ type: 'duplicate-import', label: 'Duplicate extracted row', ids: [duplicateImported.tempId] });
  if (exactExisting.length) conflicts.push({ type: 'duplicate-existing', label: 'Already exists in the routine', ids: exactExisting.map(item => item.id) });
  if (overlappingExisting.length) conflicts.push({ type: 'overlap-existing', label: `Overlaps ${overlappingExisting.map(item => `${item.courseId} ${item.startTime}–${item.endTime}`).join(', ')}`, ids: overlappingExisting.map(item => item.id) });
  return { ...entry, conflicts, conflictIds: conflicts.flatMap(conflict => conflict.ids) };
});

export const getCourseDifferences = (extracted, existing) => {
  if (!existing) return [];
  const fields = [
    ['title', extracted.title, existing.courseTitle],
    ['credit', Number(extracted.credit), Number(existing.credit)],
    ['teacher', extracted.teacherName, existing.faculty],
    ['type', extracted.courseType, existing.courseType]
  ];
  return fields.filter(([, incoming, current]) => String(incoming || '') !== String(current || '')).map(([field, incoming, current]) => ({ field, incoming, current }));
};

