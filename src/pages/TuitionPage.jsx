import React, { useState } from 'react';
import {
  Banknote,
  Plus,
  User,
  Phone,
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { tuitionService } from '../services/tuitionService';
import { CompactTuitionStudentCard } from '../components/tuition/CompactTuitionStudentCard';
import { TuitionStudentDetailsDrawer } from '../components/tuition/TuitionStudentDetailsDrawer';
import { TuitionStudentEditorModal } from '../components/tuition/TuitionStudentEditorModal';
import { StartNewMonthDialog } from '../components/tuition/StartNewMonthDialog';
import { DeleteTuitionStudentDialog } from '../components/tuition/DeleteTuitionStudentDialog';
import { EmptyState } from '../components/common/EmptyState';
import { formatBDT } from '../utils/currency';

export const TuitionPage = () => {
  const {
    tuitions,
    addTuitionStudent,
    updateTuitionStudent,
    deleteTuitionStudent,
    updateTuitionClassDate,
    startNewTuitionMonth,
    addTuitionNote,
    updateTuitionNote,
    deleteTuitionNote
  } = useData();

  // Dialog & Drawer state
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isStartNewMonthOpen, setIsStartNewMonthOpen] = useState(false);
  const [targetStudentForNewMonth, setTargetStudentForNewMonth] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [targetStudentForDelete, setTargetStudentForDelete] = useState(null);

  const selectedStudent = (tuitions || []).find(t => t.id === selectedStudentId) || null;
  const analytics = tuitionService.getAnalytics();

  // Handlers
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setIsEditorOpen(true);
  };

  const handleSaveStudent = (formData) => {
    if (editingStudent?.id) {
      updateTuitionStudent(editingStudent.id, formData);
    } else {
      addTuitionStudent(formData);
    }
  };

  const handleOpenStartNewMonth = (student) => {
    setTargetStudentForNewMonth(student);
    setIsStartNewMonthOpen(true);
  };

  const handleOpenDelete = (student) => {
    setTargetStudentForDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (studentId) => {
    deleteTuitionStudent(studentId);
    if (selectedStudentId === studentId) {
      setSelectedStudentId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Banknote className="w-6 h-6 text-brand-500" />
            <span>Private Tuition Tracker</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track private student classes with ordered session logs, automated salary progress, and monthly snapshots
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tuition Student</span>
        </button>
      </div>

      {/* FINANCIAL OVERVIEW BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Received Income</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">
            {formatBDT(analytics.totalReceivedIncome)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Expected Target: {formatBDT(analytics.totalExpectedIncome)} across {tuitions.length} private {tuitions.length === 1 ? 'tuition' : 'tuitions'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Outstanding Pending Income</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-1.5">
            {formatBDT(analytics.totalOutstandingIncome)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pending tuition fees to collect this period
          </p>
        </div>
      </div>

      {/* COMPACT STUDENT CARDS GRID */}
      {tuitions.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="No Tuition Students Enrolled"
          description="Add your private tuition students to track ordered monthly class slots, per-class earned income, and payment status."
          actionLabel="Add Student"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tuitions.map((student) => (
            <CompactTuitionStudentCard
              key={student.id}
              student={student}
              onClick={() => setSelectedStudentId(student.id)}
              onEdit={handleOpenEdit}
              onStartNewMonth={handleOpenStartNewMonth}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* STUDENT DETAILS DRAWER */}
      {selectedStudent && (
        <TuitionStudentDetailsDrawer
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudentId(null)}
          student={selectedStudent}
          onDateChange={updateTuitionClassDate}
          onEditStudent={handleOpenEdit}
          onStartNewMonth={handleOpenStartNewMonth}
          onDeleteStudent={handleOpenDelete}
          onAddNote={addTuitionNote}
          onUpdateNote={updateTuitionNote}
          onDeleteNote={deleteTuitionNote}
        />
      )}

      {/* ADD / EDIT STUDENT MODAL */}
      <TuitionStudentEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingStudent(null);
        }}
        student={editingStudent}
        onSave={handleSaveStudent}
      />

      {/* START NEW MONTH DIALOG */}
      <StartNewMonthDialog
        isOpen={isStartNewMonthOpen}
        onClose={() => {
          setIsStartNewMonthOpen(false);
          setTargetStudentForNewMonth(null);
        }}
        student={targetStudentForNewMonth}
        onConfirm={startNewTuitionMonth}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteTuitionStudentDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setTargetStudentForDelete(null);
        }}
        student={targetStudentForDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default TuitionPage;
