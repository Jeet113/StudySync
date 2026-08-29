/**
 * Tuition Tracker Utilities
 * Pure domain logic and calculations for private tuition students,
 * ordered monthly class slots, and month closure snapshots.
 */

/**
 * Creates or adjusts an ordered list of class slots based on planned count.
 * Preserves existing date entries where applicable.
 */
export const createOrderedClassSlots = (plannedCount, existingSlots = []) => {
  const count = Math.max(1, parseInt(plannedCount, 10) || 12);
  const slots = [];

  for (let i = 1; i <= count; i++) {
    const existing = existingSlots.find(s => s.order === i);
    const date = existing?.date || null;
    slots.push({
      id: existing?.id || `slot-${i}-${Date.now()}`,
      order: i,
      date,
      completed: Boolean(date && String(date).trim() !== '')
    });
  }

  return slots;
};

/**
 * Calculates current tuition student metrics and progress.
 * Completed class count is derived directly from class slots containing valid dates.
 */
export const calculateTuitionProgress = (student) => {
  if (!student) {
    return {
      planned: 0,
      completed: 0,
      remainingClasses: 0,
      salary: 0,
      perClassRate: 0,
      exactPerClassRate: 0,
      earnedAmount: 0,
      remainingAmount: 0,
      progressPercent: 0,
      nextUnloggedOrder: null
    };
  }

  const planned = Math.max(1, parseInt(student.monthlyPlannedClasses || student.monthlyClasses || 12, 10));
  const salary = Math.max(0, parseFloat(student.monthlySalary) || 0);
  const slots = Array.isArray(student.classSlots) ? student.classSlots : [];

  // Completed classes strictly derived from class slots with valid non-empty dates
  const completedSlots = slots.filter(slot => slot.date && String(slot.date).trim() !== '');
  const completed = completedSlots.length;

  const exactPerClassRate = planned > 0 ? (salary / planned) : 0;
  const perClassRate = Math.round(exactPerClassRate);
  const earnedAmount = Math.round(exactPerClassRate * completed);
  const remainingAmount = Math.max(0, salary - earnedAmount);
  const remainingClasses = Math.max(0, planned - completed);
  const progressPercent = planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : 0;

  // Find next unlogged class slot
  const nextSlot = slots.find(slot => !slot.date || String(slot.date).trim() === '');
  const nextUnloggedOrder = nextSlot ? nextSlot.order : null;

  return {
    planned,
    completed,
    remainingClasses,
    salary,
    perClassRate,
    exactPerClassRate,
    earnedAmount,
    remainingAmount,
    progressPercent,
    nextUnloggedOrder
  };
};

/**
 * Validates a class date selection
 */
export const validateClassDate = (selectedDate, existingSlots = [], currentSlotOrder = null) => {
  if (!selectedDate) {
    return { valid: false, warning: null, error: 'Please select a valid date.' };
  }

  const dateObj = new Date(selectedDate);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, warning: null, error: 'Invalid date format.' };
  }

  // Check duplicate date across other slots
  const duplicate = existingSlots.find(
    s => s.order !== currentSlotOrder && s.date === selectedDate
  );

  let warning = null;
  if (duplicate) {
    warning = `Another class (${duplicate.order}th) is already recorded on ${selectedDate}.`;
  }

  // Check distant future date (more than 90 days from today)
  const now = new Date();
  const diffDays = Math.round((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 90) {
    warning = warning ? `${warning} Also, this date is more than 3 months in the future.` : 'Selected date is unusually far in the future.';
  }

  return {
    valid: true,
    warning,
    error: null
  };
};

/**
 * Creates a monthly snapshot object when starting a new month.
 */
export const createMonthSnapshot = (student) => {
  const metrics = calculateTuitionProgress(student);
  const activeMonthStr = student.activeMonth || new Date().toISOString().slice(0, 7);
  const slots = Array.isArray(student.classSlots) ? student.classSlots : [];
  const validDates = slots.filter(s => s.date).map(s => ({ order: s.order, date: s.date }));

  const dateParts = activeMonthStr.split('-');
  const year = dateParts[0] || new Date().getFullYear().toString();
  const monthNum = parseInt(dateParts[1] || '1', 10);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[monthNum - 1] || activeMonthStr;

  return {
    id: `snap-${activeMonthStr}-${Date.now()}`,
    activeMonth: activeMonthStr,
    month: monthName,
    year: parseInt(year, 10),
    plannedClasses: metrics.planned,
    completedClasses: metrics.completed,
    classDates: validDates,
    monthlySalary: metrics.salary,
    earnedAmount: metrics.earnedAmount,
    lastPaidDate: student.lastPaidDate || null,
    progressPercent: metrics.progressPercent,
    closedAt: new Date().toISOString()
  };
};

export default {
  createOrderedClassSlots,
  calculateTuitionProgress,
  validateClassDate,
  createMonthSnapshot
};
