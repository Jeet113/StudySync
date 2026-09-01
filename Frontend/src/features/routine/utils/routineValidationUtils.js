import { normalizeGroup } from './groupSectionUtils.js';

export const ROUTINE_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const COURSE_TYPES = ['theory', 'lab', 'sessional', 'tutorial'];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const normalizeCourseId = (courseId) => String(courseId || '')
  .trim()
  .toUpperCase()
  .replace(/[\s_-]+/g, '');

export const isAssessmentScheduleText = (value) => {
  const text = String(value || '').toLowerCase();
  return /\b(class\s*test|ct\s*(date|schedule|exam|[-#:]*\d)|assignment\s*(deadline|due|schedule)|mid[- ]?term\s*exam|final\s*exam|examination\s*schedule)\b/.test(text);
};

export const validateRoutineEntry = (entry) => {
  const errors = [];
  const warnings = [];
  if (!ROUTINE_DAYS.includes(entry.dayOfWeek || entry.day)) errors.push('Select a valid day.');
  if (!normalizeCourseId(entry.courseId)) errors.push('Course ID is required.');
  if (!TIME_PATTERN.test(entry.startTime || '')) errors.push('A valid start time is required.');
  if (!TIME_PATTERN.test(entry.endTime || '')) errors.push('A valid end time is required.');
  if (TIME_PATTERN.test(entry.startTime || '') && TIME_PATTERN.test(entry.endTime || '') && entry.endTime <= entry.startTime) errors.push('End time must be later than start time.');
  if (!normalizeGroup(entry.group) && !normalizeGroup(entry.section) && !entry.isCommon) warnings.push('Group or section is unclear. Assign it before import.');
  if (!COURSE_TYPES.includes(String(entry.classType || '').toLowerCase())) errors.push('Select a supported class type.');
  if (Number(entry.confidence ?? 1) < 0.75) warnings.push('Low-confidence OCR result.');
  if (isAssessmentScheduleText(`${entry.sourceText || ''} ${entry.courseTitle || ''}`)) errors.push('Assessment schedules cannot be imported as routine classes.');
  return { errors, warnings, isValid: errors.length === 0 };
};

export const validateExtractedCourse = (course) => {
  const errors = [];
  const warnings = [];
  if (!normalizeCourseId(course.courseId)) errors.push('Course ID is required.');
  if (!String(course.title || course.courseTitle || '').trim()) errors.push('Course title is required.');
  const credit = Number(course.credit);
  if (!Number.isFinite(credit) || credit <= 0) errors.push('Enter a valid credit value.');
  const type = String(course.courseType || '').toLowerCase();
  if (!COURSE_TYPES.includes(type)) errors.push('Select a supported course type.');
  if (type === 'theory' && ![2, 3].includes(credit)) warnings.push('Theory courses normally use 2 or 3 credits.');
  if (['lab', 'sessional'].includes(type) && ![0.75, 1.5].includes(credit)) warnings.push('Lab/sessional courses normally use 0.75 or 1.5 credits.');
  if (type === 'tutorial') warnings.push('Tutorial courses require manual review of attendance rules.');
  if (!String(course.teacherName || '').trim()) warnings.push('Teacher name is missing.');
  if (Number(course.confidence ?? 1) < 0.75) warnings.push('Low-confidence OCR result.');
  return { errors, warnings, isValid: errors.length === 0 };
};

