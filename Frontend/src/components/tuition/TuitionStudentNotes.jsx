import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, FileText, Clock } from 'lucide-react';

export const TuitionStudentNotes = ({
  student,
  onAddNote,
  onUpdateNote,
  onDeleteNote
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const notes = Array.isArray(student?.notes) ? student.notes : [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    onAddNote(student.id, newContent.trim());
    setNewContent('');
    setIsAdding(false);
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = (noteId) => {
    if (!editContent.trim()) return;
    onUpdateNote(student.id, noteId, editContent.trim());
    setEditingNoteId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Student Notes ({notes.length})
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Keep track of student syllabus, exam results, weak areas, and parent feedback.
          </p>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>
        )}
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write a note about this student..."
            rows={2}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-medium"
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewContent('');
              }}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newContent.trim()}
              className="px-4 py-1.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl shadow-sm"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      {notes.length === 0 && !isAdding ? (
        <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800">
          <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-slate-500">No notes recorded yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Add notes about topics covered, homework assignments, or special instructions.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2"
            >
              {editingNoteId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-medium"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-2.5 py-1 text-xs font-bold text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!editContent.trim()}
                      onClick={() => handleSaveEdit(note.id)}
                      className="px-3 py-1 text-xs font-bold bg-brand-600 text-white rounded-lg shadow-sm"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatTimestamp(note.updatedAt || note.createdAt)}</span>
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(note)}
                        className="p-1 text-slate-400 hover:text-brand-600 rounded-md"
                        title="Edit note"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this note?')) {
                            onDeleteNote(student.id, note.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-md"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TuitionStudentNotes;
