import { createOrderedClassSlots } from './tuitionUtils.js';
import { STANDARD_ACCOUNTS, normalizeAccountId, normalizeCategory, calculateAccountBalances } from './expenseUtils.js';

const STORAGE_VERSION_KEY = 'studysync_storage_version';
const CURRENT_VERSION = '2.4.0';

const combineDateTime = (date, time) => {
  if (!date || !time) return null;
  const value = `${date}T${time}:00`;
  return Number.isNaN(new Date(value).getTime()) ? null : value;
};

const migrateAssessments = () => {
  const raw = localStorage.getItem('studysync_assessments');
  if (!raw) return;
  const assessments = JSON.parse(raw);
  if (!Array.isArray(assessments)) return;

  const migrated = assessments.map(assessment => {
    const links = Array.isArray(assessment.links) ? assessment.links.map((link, index) => {
      const legacyTimestamp = new Date(0).toISOString();
      return {
        ...link,
        id: link.id || `legacy-link-${assessment.id || 'assessment'}-${index}`,
        label: link.label || link.url || 'Related link',
        type: link.type || 'Other',
        createdAt: link.createdAt || legacyTimestamp,
        updatedAt: link.updatedAt || link.createdAt || legacyTimestamp
      };
    }) : [];

    if (assessment.type === 'assignment') {
      const deadlineDate = assessment.deadlineDate || assessment.dueDate || assessment.date || null;
      const deadlineTime = assessment.deadlineTime || assessment.dueTime || assessment.startTime || null;
      return {
        ...assessment,
        deadlineDate,
        deadlineTime,
        deadlineAt: assessment.deadlineAt || combineDateTime(deadlineDate, deadlineTime),
        links
      };
    }

    if (assessment.type === 'CT' || assessment.type === 'examination') {
      const endTime = assessment.endTime || null;
      return {
        ...assessment,
        endTime,
        startAt: assessment.startAt || combineDateTime(assessment.date, assessment.startTime),
        endAt: assessment.endAt || combineDateTime(assessment.date, endTime),
        links
      };
    }

    return { ...assessment, links };
  });
  localStorage.setItem('studysync_assessments', JSON.stringify(migrated));

  const tasksRaw = localStorage.getItem('studysync_tasks');
  const tasks = tasksRaw ? JSON.parse(tasksRaw) : [];
  if (!Array.isArray(tasks)) return;
  migrated.filter(item => item.type === 'assignment' && item.deadlineAt).forEach(assignment => {
    const taskId = `task-assessment-${assignment.id}`;
    if (!tasks.some(task => task.id === taskId)) {
      tasks.push({
        id: taskId,
        assessmentId: assignment.id,
        generatedBy: 'assessment',
        title: `Submit ${assignment.title || assignment.courseId || 'assignment'}`,
        dueDate: assignment.deadlineDate,
        dueAt: assignment.deadlineAt,
        priority: assignment.priority || 'medium',
        category: 'academic',
        courseId: assignment.courseId,
        completed: false
      });
    }
  });
  localStorage.setItem('studysync_tasks', JSON.stringify(tasks));
};

const migrateRoutineData = () => {
  const raw = localStorage.getItem('studysync_routines');
  if (!raw) return;
  const routines = JSON.parse(raw);
  if (!Array.isArray(routines)) return;
  const migrated = routines.map(routine => ({
    ...routine,
    teacherName: routine.teacherName || routine.faculty || '',
    courseType: routine.courseType || (routine.classType === 'lecture' ? 'theory' : routine.classType) || 'theory',
    group: routine.group || '',
    section: routine.section || '',
    effectiveStartDate: routine.effectiveStartDate || '',
    effectiveEndDate: routine.effectiveEndDate || '',
    source: routine.source || 'manual',
    importId: routine.importId || null,
    manuallyEdited: Boolean(routine.manuallyEdited)
  }));
  localStorage.setItem('studysync_routines', JSON.stringify(migrated));
  if (!localStorage.getItem('studysync_routine_imports')) localStorage.setItem('studysync_routine_imports', JSON.stringify([]));
};

const migrateTuitionData = () => {
  const raw = localStorage.getItem('studysync_tuitions');
  if (!raw) return;
  let tuitions = [];
  try {
    tuitions = JSON.parse(raw);
  } catch (e) {
    return;
  }
  if (!Array.isArray(tuitions)) return;

  const currentMonth = new Date().toISOString().slice(0, 7);

  const migrated = tuitions.map(student => {
    const planned = Math.max(1, parseInt(student.monthlyPlannedClasses || student.monthlyClasses || 12, 10));
    const salary = Math.max(0, parseFloat(student.monthlySalary) || 8000);
    const activeMonth = student.activeMonth || currentMonth;
    const lastPaidDate = student.lastPaidDate || student.expectedPaymentDate || null;
    const notes = Array.isArray(student.notes) ? student.notes : [];
    const monthHistory = Array.isArray(student.monthHistory) ? student.monthHistory : [];

    // If student already has valid classSlots, ensure length matches planned
    let classSlots = student.classSlots;
    if (!Array.isArray(classSlots) || classSlots.length === 0) {
      // Migrate from legacy logs
      const legacyLogs = Array.isArray(student.logs) ? [...student.logs] : [];
      // Sort legacy logs by date ascending
      legacyLogs.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      
      const seedSlots = legacyLogs.map((log, index) => ({
        id: log.id || `slot-${index + 1}-${Date.now()}`,
        order: index + 1,
        date: log.date || null,
        completed: Boolean(log.date)
      }));

      classSlots = createOrderedClassSlots(planned, seedSlots);
    } else {
      classSlots = createOrderedClassSlots(planned, classSlots);
    }

    return {
      ...student,
      monthlyPlannedClasses: planned,
      monthlyClasses: planned,
      monthlySalary: salary,
      activeMonth,
      lastPaidDate,
      classSlots,
      notes,
      monthHistory,
      currency: 'BDT'
    };
  });

  localStorage.setItem('studysync_tuitions', JSON.stringify(migrated));
};

const migrateExpenseData = () => {
  const raw = localStorage.getItem('studysync_expenses');
  if (!raw) return;
  let expenses = {};
  try {
    expenses = JSON.parse(raw);
  } catch (e) {
    return;
  }
  if (!expenses || typeof expenses !== 'object') return;

  const budgetLimit = Math.max(0, parseFloat(expenses.budgetLimit) || 12000);
  const dueBorrowRecords = Array.isArray(expenses.dueBorrowRecords) ? expenses.dueBorrowRecords : [];

  // Normalize transactions
  const transactions = (expenses.transactions || []).map(tx => ({
    ...tx,
    accountId: normalizeAccountId(tx.accountId),
    category: normalizeCategory(tx.category, tx.type),
    amount: Math.max(0, parseFloat(tx.amount) || 0)
  }));

  // Reconcile standard 4 accounts with balances
  const accounts = calculateAccountBalances(expenses.accounts || STANDARD_ACCOUNTS, transactions);

  const migrated = {
    budgetLimit,
    accounts,
    transactions,
    dueBorrowRecords
  };

  localStorage.setItem('studysync_expenses', JSON.stringify(migrated));
};

export const storageMigrations = {
  runMigrations: () => {
    try {
      const currentStoredVersion = localStorage.getItem(STORAGE_VERSION_KEY);

      // 1. Migrate Sidebar Preferences
      const sidebarPrefRaw = localStorage.getItem('studysync_sidebar_preferences');
      if (!sidebarPrefRaw) {
        const defaultPreferences = {
          sectionOrder: [
            'dashboard',
            'routine',
            'attendance',
            'assessments',
            'cgpa',
            'math-tools',
            'tuition',
            'expenses',
            'focus'
          ],
          hiddenSections: []
        };
        localStorage.setItem('studysync_sidebar_preferences', JSON.stringify(defaultPreferences));
      }

      // 2. Normalize User Currency to BDT
      const userRaw = localStorage.getItem('studysync_user');
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          if (user && user.currency !== 'BDT') {
            user.currency = 'BDT';
            localStorage.setItem('studysync_user', JSON.stringify(user));
          }
        } catch (e) {
          // ignore
        }
      }

      // 3. Ensure Archived Routine Events array exists
      if (!localStorage.getItem('studysync_archived_routine_events')) {
        localStorage.setItem('studysync_archived_routine_events', JSON.stringify([]));
      }

      // 4. Normalize assessments & routines
      if (currentStoredVersion !== CURRENT_VERSION) {
        migrateAssessments();
        migrateRoutineData();
        migrateTuitionData();
        migrateExpenseData();
      }

      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
    } catch (err) {
      console.warn('Storage migration failed silently:', err);
    }
  }
};

export default storageMigrations;

