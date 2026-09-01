import { storageService } from './storageService.js';

const COURSE_COLORS_KEY = 'studysync_course_colors';

export const COURSE_COLOR_PRESETS = [
  '#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1'
];

export const routineService = {
  getCourseColors: () => storageService.get(COURSE_COLORS_KEY, {}),

  getColorForCourse: (courseId) => {
    const colors = routineService.getCourseColors();
    if (colors[courseId]) return colors[courseId];
    const existing = routineService.getAll().find(r => r.courseId === courseId);
    return existing?.color || '#4F46E5';
  },

  setCourseColor: (courseId, color) => {
    const colors = routineService.getCourseColors();
    colors[courseId] = color;
    storageService.set(COURSE_COLORS_KEY, colors);
    const routines = routineService.getAll();
    const updated = routines.map(r =>
      r.courseId === courseId ? { ...r, color } : r
    );
    routineService.saveAll(updated);
    return color;
  },
  getAll: () => {
    return storageService.get(storageService.KEYS.ROUTINES, []);
  },

  saveAll: (routines) => {
    storageService.set(storageService.KEYS.ROUTINES, routines);
  },

  add: (routineData) => {
    const color = routineData.color || routineService.getColorForCourse(routineData.courseId);
    if (routineData.courseId && routineData.color) {
      routineService.setCourseColor(routineData.courseId, routineData.color);
    }
    const routines = routineService.getAll();
    const newRoutine = {
      id: `rt-${Date.now()}`,
      source: 'manual',
      importId: null,
      manuallyEdited: false,
      createdAt: new Date().toISOString(),
      ...routineData,
      color,
      updatedAt: new Date().toISOString()
    };
    routines.push(newRoutine);
    routineService.saveAll(routines);
    return newRoutine;
  },

  update: (id, updatedData) => {
    const routines = routineService.getAll();
    const index = routines.findIndex(r => r.id === id);
    if (index !== -1) {
      if (updatedData.courseId && updatedData.color) {
        routineService.setCourseColor(updatedData.courseId, updatedData.color);
      }
      const existing = routines[index];
      routines[index] = {
        ...existing,
        ...updatedData,
        teacherName: updatedData.teacherName || updatedData.faculty || existing.teacherName || existing.faculty || '',
        faculty: updatedData.teacherName || updatedData.faculty || existing.faculty || existing.teacherName || '',
        manuallyEdited: existing.source === 'ocr-import' ? true : Boolean(existing.manuallyEdited),
        updatedAt: new Date().toISOString()
      };
      routineService.saveAll(routines);
      return routines[index];
    }
    return null;
  },

  delete: (id) => {
    const routines = routineService.getAll();
    const filtered = routines.filter(r => r.id !== id);
    routineService.saveAll(filtered);
    return filtered;
  },

  // Conflict detector algorithm: checks if a proposed routine overlaps with existing routines on the same day
  detectConflicts: (routineToTest, excludeId = null) => {
    const routines = routineService.getAll();
    const conflicts = [];

    const toMinutes = (timeStr) => {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(timeStr || ''))) return null;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const startMinutes = toMinutes(routineToTest.startTime);
    const endMinutes = toMinutes(routineToTest.endTime);
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) return [];

    routines.forEach(existing => {
      if (excludeId && existing.id === excludeId) return;
      if (existing.dayOfWeek === routineToTest.dayOfWeek) {
        const exStart = toMinutes(existing.startTime);
        const exEnd = toMinutes(existing.endTime);
        if (exStart === null || exEnd === null) return;

        // Check time overlap condition
        if ((startMinutes < exEnd) && (endMinutes > exStart)) {
          conflicts.push(existing);
        }
      }
    });

    return conflicts;
  },

  // Get today's classes sorted chronologically
  getTodayClasses: (dayName) => {
    const routines = routineService.getAll();
    const date = new Date().toISOString().split('T')[0];
    return routines
      .filter(r => r.dayOfWeek.toLowerCase() === dayName.toLowerCase())
      .filter(r => (!r.effectiveStartDate || r.effectiveStartDate <= date) && (!r.effectiveEndDate || r.effectiveEndDate >= date))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
};
