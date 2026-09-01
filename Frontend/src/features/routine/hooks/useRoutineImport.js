import { useEffect, useMemo, useRef, useState } from 'react';
import { routineOcrService, validateRoutineFile } from '../services/routineOcrService.js';
import { routineImportService } from '../services/routineImportService.js';
import { deriveSectionFromGroup, isAmbiguousGroup, matchesSelectedGroup, normalizeGroup } from '../utils/groupSectionUtils.js';
import { findRoutineConflicts, getCourseDifferences } from '../utils/routineConflictUtils.js';
import { normalizeCourseId, validateExtractedCourse, validateRoutineEntry } from '../utils/routineValidationUtils.js';

const makeTempId = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

export const useRoutineImport = ({ routines, existingCourses, onDataChanged }) => {
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ phase: 'idle', percent: 0, message: '' });
  const [extraction, setExtraction] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(() => localStorage.getItem('studysync_last_routine_group') || '');
  const [rememberGroup, setRememberGroup] = useState(Boolean(localStorage.getItem('studysync_last_routine_group')));
  const [courseRows, setCourseRows] = useState([]);
  const [routineRows, setRoutineRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const chooseFile = nextFile => {
    setError('');
    const validation = validateRoutineFile(nextFile);
    if (!validation.valid) {
      setError(validation.message);
      return false;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setExtraction(null);
    setCourseRows([]);
    setRoutineRows([]);
    return true;
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setFile(null);
    setError('');
  };

  const startExtraction = async () => {
    if (!file) return;
    setError('');
    setStep('processing');
    abortRef.current = new AbortController();
    try {
      const result = await routineOcrService.extractRoutine(file, { signal: abortRef.current.signal, onProgress: setProgress });
      setExtraction(result);
      setCourseRows(result.courses.map(course => ({
        ...course,
        include: true,
        courseResolution: existingCourses.some(existing => normalizeCourseId(existing.courseId) === normalizeCourseId(course.courseId)) ? 'keep-existing' : 'create',
        _ocrOriginal: { ...course }
      })));
      setProgress({ phase: 'complete', percent: 100, message: 'Extraction complete.' });
      setStep('group');
    } catch (nextError) {
      if (nextError?.name === 'AbortError') {
        setError('Routine extraction was cancelled. Your file has not been stored.');
      } else {
        setError(nextError.message || 'The OCR service is unavailable. You can retry or enter the routine manually.');
      }
      setStep('upload');
    } finally {
      abortRef.current = null;
    }
  };

  const cancelExtraction = () => abortRef.current?.abort();

  const continueFromGroup = () => {
    const group = normalizeGroup(selectedGroup);
    if (!group) {
      setError('Select or enter your group before continuing.');
      return;
    }
    setError('');
    const section = deriveSectionFromGroup(group);
    const rows = extraction.routineEntries
      .filter(row => matchesSelectedGroup(row, group) || isAmbiguousGroup(row))
      .map(row => ({
        ...row,
        include: matchesSelectedGroup(row, group),
        group: row.group,
        section: row.section,
        conflictResolution: 'keep-both',
        effectiveStartDate: '',
        effectiveEndDate: '',
        _ocrOriginal: { ...row }
      }));
    const referencedCourseIds = new Set(rows.filter(row => row.include).map(row => normalizeCourseId(row.courseId)));
    setCourseRows(current => current.map(course => ({ ...course, include: referencedCourseIds.has(normalizeCourseId(course.courseId)) })));
    setRoutineRows(rows);
    if (rememberGroup) localStorage.setItem('studysync_last_routine_group', group);
    else localStorage.removeItem('studysync_last_routine_group');
    setSelectedGroup(group);
    setStep('review');
  };

  const reviewedCourses = useMemo(() => courseRows.map(course => {
    const existing = existingCourses.find(item => normalizeCourseId(item.courseId) === normalizeCourseId(course.courseId));
    const validation = validateExtractedCourse(course);
    const sameIdRows = courseRows.filter(item => normalizeCourseId(item.courseId) === normalizeCourseId(course.courseId));
    if (sameIdRows.some(item => item.tempId !== course.tempId && (Number(item.credit) !== Number(course.credit) || item.teacherName !== course.teacherName))) {
      validation.warnings.push('Conflicting teacher or credit values were detected for this course ID.');
    }
    return { ...course, validation, existing, differences: getCourseDifferences(course, existing) };
  }), [courseRows, existingCourses]);

  const reviewedRoutineRows = useMemo(() => findRoutineConflicts(routineRows, routines).map(row => {
    const validation = validateRoutineEntry(row);
    const courseExists = courseRows.some(course => normalizeCourseId(course.courseId) === normalizeCourseId(row.courseId))
      || existingCourses.some(course => normalizeCourseId(course.courseId) === normalizeCourseId(row.courseId));
    if (!courseExists) validation.warnings.push('This course ID was not found in the extracted or existing course list.');
    let conflictResolution = row.conflictResolution;
    if (row.conflicts.length && conflictResolution === 'keep-both') conflictResolution = 'keep-existing';
    return { ...row, conflictResolution, validation };
  }), [routineRows, routines, courseRows, existingCourses]);

  const updateCourse = (tempId, field, value) => setCourseRows(rows => rows.map(row => row.tempId === tempId ? { ...row, [field]: value } : row));
  const updateRoutineRow = (tempId, field, value) => setRoutineRows(rows => rows.map(row => {
    if (row.tempId !== tempId) return row;
    const updated = { ...row, [field]: value };
    if (field === 'group') updated.section = deriveSectionFromGroup(value);
    return updated;
  }));
  const deleteRoutineRow = tempId => setRoutineRows(rows => rows.filter(row => row.tempId !== tempId));
  const addRoutineRow = () => setRoutineRows(rows => [...rows, {
    tempId: makeTempId('manual-review-row'), dayOfWeek: 'Sunday', startTime: '09:00', endTime: '09:50', courseId: '', courseTitle: '',
    teacherName: '', credit: 0, group: selectedGroup, section: deriveSectionFromGroup(selectedGroup), room: '', building: '', classType: 'theory',
    isCommon: false, confidence: 1, sourcePage: 1, sourceText: 'Manually added during OCR review', include: true, conflictResolution: 'keep-both',
    effectiveStartDate: '', effectiveEndDate: '', _ocrOriginal: null
  }]);
  const resetRoutineRow = tempId => setRoutineRows(rows => rows.map(row => row.tempId === tempId && row._ocrOriginal ? { ...row._ocrOriginal, include: row.include, conflictResolution: row.conflictResolution, effectiveStartDate: '', effectiveEndDate: '', _ocrOriginal: row._ocrOriginal } : row));

  const mergeDuplicateCourses = () => {
    const merged = new Map();
    courseRows.forEach(course => {
      const key = normalizeCourseId(course.courseId) || course.tempId;
      if (!merged.has(key)) merged.set(key, course);
      else {
        const current = merged.get(key);
        merged.set(key, {
          ...current,
          title: current.title || course.title,
          credit: current.credit || course.credit,
          teacherName: current.teacherName || course.teacherName,
          confidence: Math.max(current.confidence, course.confidence)
        });
      }
    });
    setCourseRows([...merged.values()]);
  };

  const goToConflicts = () => {
    const invalidCourses = reviewedCourses.some(course => course.include !== false && !course.validation.isValid);
    const invalidRows = reviewedRoutineRows.some(row => row.include !== false && !row.validation.isValid);
    if (invalidCourses || invalidRows || !reviewedRoutineRows.some(row => row.include !== false)) {
      setError(!reviewedRoutineRows.some(row => row.include !== false) ? 'Select at least one valid routine row to import.' : 'Some included rows need correction before import.');
      return;
    }
    setError('');
    setRoutineRows(reviewedRoutineRows);
    setStep('conflicts');
  };

  const confirmImport = () => {
    try {
      const result = routineImportService.importApproved({
        importId: extraction.importId,
        sourceFile: extraction.sourceFile,
        selectedGroup,
        section: deriveSectionFromGroup(selectedGroup),
        courses: reviewedCourses,
        routineEntries: reviewedRoutineRows
      });
      setSummary(result);
      onDataChanged?.();
      setStep('summary');
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  const resetImport = () => {
    abortRef.current?.abort();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStep('upload');
    setFile(null);
    setPreviewUrl('');
    setError('');
    setProgress({ phase: 'idle', percent: 0, message: '' });
    setExtraction(null);
    setCourseRows([]);
    setRoutineRows([]);
    setSummary(null);
  };

  return {
    step, setStep, file, previewUrl, error, setError, progress, extraction, selectedGroup, setSelectedGroup, rememberGroup, setRememberGroup,
    courseRows: reviewedCourses, routineRows: reviewedRoutineRows, summary, chooseFile, removeFile, startExtraction, cancelExtraction,
    continueFromGroup, updateCourse, updateRoutineRow, deleteRoutineRow, addRoutineRow, resetRoutineRow, mergeDuplicateCourses,
    goToConflicts, confirmImport, resetImport, mockMode: routineOcrService.isMockMode()
  };
};
