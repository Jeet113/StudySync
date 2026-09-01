import { storageService } from './storageService';
import {
  createOrderedClassSlots,
  calculateTuitionProgress,
  createMonthSnapshot
} from '../utils/tuitionUtils';

export const tuitionService = {
  getStudents: () => {
    return storageService.get(storageService.KEYS.TUITIONS, []);
  },

  saveStudents: (students) => {
    storageService.set(storageService.KEYS.TUITIONS, students);
  },

  addStudent: (studentData) => {
    const students = tuitionService.getStudents();
    const planned = Math.max(1, parseInt(studentData.monthlyPlannedClasses || studentData.monthlyClasses || 12, 10));
    const now = new Date().toISOString();
    const currentMonth = new Date().toISOString().slice(0, 7);

    const newStudent = {
      id: `tu-${Date.now()}`,
      studentName: studentData.studentName || '',
      subject: studentData.subject || '',
      classGrade: studentData.classGrade || studentData.academicLevel || '',
      academicLevel: studentData.academicLevel || studentData.classGrade || '',
      guardianContact: studentData.guardianContact || '',
      monthlyPlannedClasses: planned,
      monthlyClasses: planned,
      monthlySalary: Math.max(0, parseFloat(studentData.monthlySalary) || 8000),
      currency: 'BDT',
      lastPaidDate: studentData.lastPaidDate || null,
      startDate: studentData.startDate || currentMonth + '-01',
      paymentStatus: studentData.paymentStatus || 'pending',
      cardColor: studentData.cardColor || '#4F46E5',
      description: studentData.description || '',
      activeMonth: studentData.activeMonth || currentMonth,
      classSlots: createOrderedClassSlots(planned),
      notes: [],
      monthHistory: [],
      createdAt: now,
      updatedAt: now,
      ...studentData
    };

    // Ensure classSlots matches planned
    newStudent.classSlots = createOrderedClassSlots(planned, newStudent.classSlots || []);

    students.push(newStudent);
    tuitionService.saveStudents(students);
    return newStudent;
  },

  updateStudent: (id, updatedData) => {
    const students = tuitionService.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      const current = students[index];
      const newPlanned = updatedData.monthlyPlannedClasses !== undefined
        ? Math.max(1, parseInt(updatedData.monthlyPlannedClasses, 10))
        : current.monthlyPlannedClasses || 12;

      let classSlots = current.classSlots || [];
      if (newPlanned !== current.monthlyPlannedClasses) {
        classSlots = createOrderedClassSlots(newPlanned, classSlots);
      }

      students[index] = {
        ...current,
        ...updatedData,
        monthlyPlannedClasses: newPlanned,
        monthlyClasses: newPlanned,
        classSlots,
        updatedAt: new Date().toISOString()
      };

      tuitionService.saveStudents(students);
      return students[index];
    }
    return null;
  },

  deleteStudent: (id) => {
    const students = tuitionService.getStudents();
    const filtered = students.filter(s => s.id !== id);
    tuitionService.saveStudents(filtered);
    return filtered;
  },

  // Calculate per-class earnings and salary progress
  calculateStudentMetrics: (student) => {
    return calculateTuitionProgress(student);
  },

  // Update a single ordered class slot date (or clear it)
  updateClassSlotDate: (studentId, slotOrder, date) => {
    const students = tuitionService.getStudents();
    const index = students.findIndex(s => s.id === studentId);
    if (index !== -1) {
      const student = students[index];
      const slots = Array.isArray(student.classSlots) ? [...student.classSlots] : [];
      const slotIndex = slots.findIndex(s => s.order === slotOrder);

      const cleanDate = date && String(date).trim() !== '' ? String(date).trim() : null;

      if (slotIndex !== -1) {
        slots[slotIndex] = {
          ...slots[slotIndex],
          date: cleanDate,
          completed: Boolean(cleanDate)
        };
      } else {
        slots.push({
          id: `slot-${slotOrder}-${Date.now()}`,
          order: slotOrder,
          date: cleanDate,
          completed: Boolean(cleanDate)
        });
      }

      student.classSlots = slots;
      student.updatedAt = new Date().toISOString();
      students[index] = student;
      tuitionService.saveStudents(students);
      return student;
    }
    return null;
  },

  // Start new month: archive current progress snapshot and reset slots
  startNewMonth: (studentId, targetNewMonth = null) => {
    const students = tuitionService.getStudents();
    const index = students.findIndex(s => s.id === studentId);
    if (index !== -1) {
      const student = students[index];
      const snapshot = createMonthSnapshot(student);

      if (!student.monthHistory) student.monthHistory = [];

      // Check if this month is already in history to prevent duplicate snapshot
      const existingSnapIdx = student.monthHistory.findIndex(
        h => h.activeMonth === snapshot.activeMonth || (h.month === snapshot.month && h.year === snapshot.year)
      );

      if (existingSnapIdx !== -1) {
        student.monthHistory[existingSnapIdx] = snapshot;
      } else {
        student.monthHistory.unshift(snapshot);
      }

      // Calculate next active month (e.g. "2026-09")
      let nextMonth = targetNewMonth;
      if (!nextMonth) {
        const currentActive = student.activeMonth || new Date().toISOString().slice(0, 7);
        const [yearStr, monthStr] = currentActive.split('-');
        let y = parseInt(yearStr, 10);
        let m = parseInt(monthStr, 10) + 1;
        if (m > 12) {
          m = 1;
          y += 1;
        }
        nextMonth = `${y}-${String(m).padStart(2, '0')}`;
      }

      student.activeMonth = nextMonth;
      student.classSlots = createOrderedClassSlots(student.monthlyPlannedClasses || 12);
      student.updatedAt = new Date().toISOString();

      students[index] = student;
      tuitionService.saveStudents(students);
      return student;
    }
    return null;
  },

  // Notes CRUD
  addStudentNote: (studentId, content) => {
    if (!content || !content.trim()) return null;
    const students = tuitionService.getStudents();
    const index = students.findIndex(s => s.id === studentId);
    if (index !== -1) {
      const student = students[index];
      if (!student.notes) student.notes = [];
      const newNote = {
        id: `tn-${Date.now()}`,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      student.notes.unshift(newNote);
      student.updatedAt = new Date().toISOString();
      students[index] = student;
      tuitionService.saveStudents(students);
      return newNote;
    }
    return null;
  },

  updateStudentNote: (studentId, noteId, content) => {
    if (!content || !content.trim()) return null;
    const students = tuitionService.getStudents();
    const index = students.findIndex(s => s.id === studentId);
    if (index !== -1) {
      const student = students[index];
      if (!student.notes) return null;
      const noteIdx = student.notes.findIndex(n => n.id === noteId);
      if (noteIdx !== -1) {
        student.notes[noteIdx].content = content.trim();
        student.notes[noteIdx].updatedAt = new Date().toISOString();
        student.updatedAt = new Date().toISOString();
        students[index] = student;
        tuitionService.saveStudents(students);
        return student.notes[noteIdx];
      }
    }
    return null;
  },

  deleteStudentNote: (studentId, noteId) => {
    const students = tuitionService.getStudents();
    const index = students.findIndex(s => s.id === studentId);
    if (index !== -1) {
      const student = students[index];
      if (!student.notes) return null;
      student.notes = student.notes.filter(n => n.id !== noteId);
      student.updatedAt = new Date().toISOString();
      students[index] = student;
      tuitionService.saveStudents(students);
      return student;
    }
    return null;
  },

  // Log a completed session for a student.
  logClassSession: (studentId, sessionData = {}) => {
    const students = tuitionService.getStudents();
    const index = students.findIndex(s => s.id === studentId);
    if (index === -1) return null;

    const student = students[index];
    const date = sessionData.date || new Date().toISOString().slice(0, 10);
    const slotOrder = Number(sessionData.slotOrder ?? 1);

    const updatedStudent = {
      ...student,
      classSlots: Array.isArray(student.classSlots) ? student.classSlots.map(slot => {
        if (slot.order === slotOrder) {
          return { ...slot, date, completed: true };
        }
        return slot;
      }) : createOrderedClassSlots(student.monthlyPlannedClasses || 12)
    };

    updatedStudent.updatedAt = new Date().toISOString();
    students[index] = updatedStudent;
    tuitionService.saveStudents(students);
    return updatedStudent;
  },

  // Aggregated tuition overview
  getAnalytics: () => {
    const students = tuitionService.getStudents();
    let totalExpectedIncome = 0;
    let totalReceivedIncome = 0;
    let totalOutstandingIncome = 0;
    let totalCompletedClasses = 0;
    let totalPlannedClasses = 0;

    students.forEach(st => {
      const metrics = calculateTuitionProgress(st);
      totalExpectedIncome += metrics.salary;
      totalPlannedClasses += metrics.planned;
      totalCompletedClasses += metrics.completed;

      if (st.paymentStatus === 'paid') {
        totalReceivedIncome += metrics.salary;
      } else {
        totalReceivedIncome += metrics.earnedAmount;
        totalOutstandingIncome += metrics.remainingAmount;
      }
    });

    return {
      totalExpectedIncome,
      totalReceivedIncome,
      totalOutstandingIncome,
      totalCompletedClasses,
      totalPlannedClasses,
      totalStudents: students.length
    };
  }
};

export default tuitionService;
