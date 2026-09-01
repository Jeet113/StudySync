import React, { useState, useEffect } from 'react';
import { User, BookOpen, DollarSign, Calendar, Phone, Palette, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';

const PRESET_COLORS = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#EF4444'  // Rose
];

export const TuitionStudentEditorModal = ({
  isOpen,
  onClose,
  student = null,
  onSave
}) => {
  const isEditing = Boolean(student?.id);

  const [form, setForm] = useState({
    studentName: '',
    subject: 'Physics & Mathematics',
    classGrade: 'Class 10 (SSC)',
    monthlyPlannedClasses: 12,
    monthlySalary: 8000,
    guardianContact: '',
    startDate: new Date().toISOString().split('T')[0],
    lastPaidDate: '',
    paymentStatus: 'pending',
    cardColor: '#4F46E5',
    description: ''
  });

  const [reducedWarning, setReducedWarning] = useState(null);

  useEffect(() => {
    if (student) {
      setForm({
        studentName: student.studentName || '',
        subject: student.subject || '',
        classGrade: student.classGrade || student.academicLevel || '',
        monthlyPlannedClasses: student.monthlyPlannedClasses || student.monthlyClasses || 12,
        monthlySalary: student.monthlySalary || 8000,
        guardianContact: student.guardianContact || '',
        startDate: student.startDate || new Date().toISOString().split('T')[0],
        lastPaidDate: student.lastPaidDate || '',
        paymentStatus: student.paymentStatus || 'pending',
        cardColor: student.cardColor || '#4F46E5',
        description: student.description || ''
      });
      setReducedWarning(null);
    } else {
      setForm({
        studentName: '',
        subject: 'Physics & Mathematics',
        classGrade: 'Class 10 (SSC)',
        monthlyPlannedClasses: 12,
        monthlySalary: 8000,
        guardianContact: '',
        startDate: new Date().toISOString().split('T')[0],
        lastPaidDate: '',
        paymentStatus: 'pending',
        cardColor: '#4F46E5',
        description: ''
      });
      setReducedWarning(null);
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const completedCount = isEditing && Array.isArray(student.classSlots)
    ? student.classSlots.filter(s => s.date && String(s.date).trim() !== '').length
    : 0;

  const handlePlannedClassesChange = (val) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    setForm(prev => ({ ...prev, monthlyPlannedClasses: num }));

    if (isEditing && num < completedCount) {
      setReducedWarning(`You currently have ${completedCount} completed class dates. Reducing planned classes to ${num} will truncate slots.`);
    } else {
      setReducedWarning(null);
    }
  };

  const isFutureLastPaidDate = form.lastPaidDate && new Date(form.lastPaidDate) > new Date();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.studentName.trim()) return;

    onSave({
      ...form,
      academicLevel: form.classGrade,
      monthlyClasses: form.monthlyPlannedClasses
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Student: ${student.studentName}` : 'Add New Tuition Student'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Student Name */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Student Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Aaraf Rahman"
            value={form.studentName}
            onChange={(e) => setForm({ ...form, studentName: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-900 dark:text-white focus:border-brand-500"
          />
        </div>

        {/* Subject & Class */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Subject(s)
            </label>
            <input
              type="text"
              placeholder="e.g. Physics & Math"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Academic Level / Class Grade
            </label>
            <input
              type="text"
              placeholder="e.g. Class 10 (SSC)"
              value={form.classGrade}
              onChange={(e) => setForm({ ...form, classGrade: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Planned Classes & Monthly Salary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Planned Classes *
            </label>
            <input
              type="number"
              min="1"
              max="50"
              required
              value={form.monthlyPlannedClasses}
              onChange={(e) => handlePlannedClassesChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Salary Target (৳ BDT) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={form.monthlySalary}
              onChange={(e) => setForm({ ...form, monthlySalary: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-emerald-600 dark:text-emerald-400 focus:border-brand-500"
            />
          </div>
        </div>

        {reducedWarning && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{reducedWarning}</span>
          </div>
        )}

        {/* Last Paid Date & Payment Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Last Paid Date (Optional)
            </label>
            <input
              type="date"
              value={form.lastPaidDate || ''}
              onChange={(e) => setForm({ ...form, lastPaidDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-medium"
            />
            {isFutureLastPaidDate && (
              <p className="text-[10px] text-amber-500 mt-0.5">Warning: You selected a future date.</p>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Status
            </label>
            <select
              value={form.paymentStatus}
              onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Guardian Contact Phone */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Guardian / Contact Info
          </label>
          <input
            type="text"
            placeholder="e.g. +880 1711-987654 (Mr. Rahman)"
            value={form.guardianContact}
            onChange={(e) => setForm({ ...form, guardianContact: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500"
          />
        </div>

        {/* Card Color Preset */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Card Accent Color
          </label>
          <div className="flex items-center space-x-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setForm({ ...form, cardColor: color })}
                className={`w-7 h-7 rounded-full transition-transform ${
                  form.cardColor === color ? 'scale-125 ring-2 ring-offset-2 ring-brand-500' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Description / Schedule Notes */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Schedule / Description
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Teaches Sun, Tue, Thu 5:00 PM - 6:30 PM."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-black bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md transition-all"
          >
            {isEditing ? 'Save Changes' : 'Create Tuition Student'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TuitionStudentEditorModal;
