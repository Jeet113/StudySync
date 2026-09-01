import { z } from 'zod';
import { deriveSectionFromGroup, normalizeGroup, normalizeSection } from './groupSectionUtils.js';
import { COURSE_TYPES, isAssessmentScheduleText, normalizeCourseId, ROUTINE_DAYS } from './routineValidationUtils.js';

const uuid = (prefix) => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
const cleanText = value => String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();

const normalizeDay = value => {
  const clean = cleanText(value).toLowerCase();
  if (clean.length < 3) return '';
  return ROUTINE_DAYS.find(day => day.toLowerCase().startsWith(clean.slice(0, 3))) || '';
};

const normalizeTime = value => {
  const clean = cleanText(value).toUpperCase();
  const match = clean.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/);
  if (!match) return '';
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (match[3] === 'PM' && hours < 12) hours += 12;
  if (match[3] === 'AM' && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return '';
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const normalizeType = value => {
  const type = cleanText(value).toLowerCase();
  if (type.includes('sessional')) return 'sessional';
  if (type.includes('lab')) return 'lab';
  if (type.includes('tutorial')) return 'tutorial';
  return COURSE_TYPES.includes(type) ? type : 'theory';
};

const normalizedResponseSchema = z.object({
  importId: z.string().min(1),
  sourceFile: z.object({ name: z.string(), type: z.string(), pageCount: z.number().int().positive() }),
  detectedGroups: z.array(z.string()),
  courses: z.array(z.object({
    tempId: z.string(), courseId: z.string(), title: z.string(), credit: z.number(), teacherName: z.string(),
    courseType: z.enum(COURSE_TYPES), confidence: z.number().min(0).max(1), sourcePage: z.number().int().positive(), sourceText: z.string()
  })),
  routineEntries: z.array(z.object({
    tempId: z.string(), dayOfWeek: z.string(), startTime: z.string(), endTime: z.string(), courseId: z.string(),
    courseTitle: z.string(), teacherName: z.string(), credit: z.number(), group: z.string(), section: z.string(), room: z.string(),
    building: z.string(), classType: z.enum(COURSE_TYPES), isCommon: z.boolean(), confidence: z.number().min(0).max(1),
    sourcePage: z.number().int().positive(), sourceText: z.string()
  })),
  warnings: z.array(z.string()),
  rawTextReference: z.string().nullable()
});

export const normalizeRoutineOcrResponse = (raw, file) => {
  if (!raw || typeof raw !== 'object') throw new Error('INVALID_RESPONSE');
  const rawCourses = Array.isArray(raw.courses) ? raw.courses : [];
  const rawEntries = Array.isArray(raw.routineEntries) ? raw.routineEntries : [];

  const courses = rawCourses
    .map(course => ({
      tempId: cleanText(course.tempId) || uuid('ocr-course'),
      courseId: cleanText(course.courseId || course.courseNumber).toUpperCase(),
      title: cleanText(course.title || course.courseTitle),
      credit: Number(course.credit || 0),
      teacherName: cleanText(course.teacherName || course.teacher || course.faculty),
      courseType: normalizeType(course.courseType || course.classType),
      confidence: Math.max(0, Math.min(1, Number(course.confidence ?? 0.5))),
      sourcePage: Math.max(1, Number(course.sourcePage || 1)),
      sourceText: cleanText(course.sourceText || course.rawText)
    }))
    .filter(course => !isAssessmentScheduleText(`${course.sourceText} ${course.title}`));

  const courseById = new Map(courses.map(course => [normalizeCourseId(course.courseId), course]));
  const routineEntries = rawEntries.map(entry => {
    const course = courseById.get(normalizeCourseId(entry.courseId || entry.courseNumber));
    const group = normalizeGroup(entry.group);
    const explicitSection = normalizeSection(entry.section);
    return {
      tempId: cleanText(entry.tempId) || uuid('ocr-row'),
      dayOfWeek: normalizeDay(entry.dayOfWeek || entry.day),
      startTime: normalizeTime(entry.startTime || String(entry.timePeriod || '').split(/[-–—]/)[0]),
      endTime: normalizeTime(entry.endTime || String(entry.timePeriod || '').split(/[-–—]/)[1]),
      courseId: cleanText(entry.courseId || entry.courseNumber).toUpperCase(),
      courseTitle: cleanText(entry.courseTitle || course?.title),
      teacherName: cleanText(entry.teacherName || entry.teacher || entry.faculty || course?.teacherName),
      credit: Number(entry.credit || course?.credit || 0),
      group,
      section: explicitSection || deriveSectionFromGroup(group),
      room: cleanText(entry.room || entry.roomNumber),
      building: cleanText(entry.building),
      classType: normalizeType(entry.classType || entry.courseType || course?.courseType),
      isCommon: Boolean(entry.isCommon) || ['ALL', 'COMMON'].includes(group),
      confidence: Math.max(0, Math.min(1, Number(entry.confidence ?? 0.5))),
      sourcePage: Math.max(1, Number(entry.sourcePage || 1)),
      sourceText: cleanText(entry.sourceText || entry.rawText)
    };
  }).filter(entry => !isAssessmentScheduleText(`${entry.sourceText} ${entry.courseTitle}`));

  if (!courses.length && !routineEntries.length) throw new Error('EMPTY_RESULT');
  const detectedGroups = [...new Set([...(raw.detectedGroups || []).map(normalizeGroup), ...routineEntries.map(entry => entry.group)].filter(group => group && !['ALL', 'COMMON'].includes(group)))];

  return normalizedResponseSchema.parse({
    importId: cleanText(raw.importId) || uuid('routine-import'),
    sourceFile: {
      name: cleanText(raw.sourceFile?.name || file?.name || 'routine-file').split(/[\\/]/).pop(),
      type: cleanText(raw.sourceFile?.type || file?.type || 'application/octet-stream'),
      pageCount: Math.max(1, Number(raw.sourceFile?.pageCount || 1))
    },
    detectedGroups,
    courses,
    routineEntries,
    warnings: Array.isArray(raw.warnings) ? raw.warnings.map(cleanText).filter(Boolean) : [],
    rawTextReference: typeof raw.rawTextReference === 'string' ? cleanText(raw.rawTextReference) : null
  });
};
