import React, { useState, useEffect } from 'react';
import { Student, Batch } from '../types';

interface StudentSelectorProps {
  students: Student[];
  batches: Batch[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  label?: string;
}

export default function StudentSelector({
  students,
  batches,
  selectedStudentId,
  onSelectStudent,
  label = "Student Selection"
}: StudentSelectorProps) {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');

  // Extract unique classes, fallback to 'General' or student's class
  const classes = Array.from(new Set(students.map(s => s.class || 'General').filter(Boolean)));

  // We filter batches based on selected class or just show all
  const filteredBatches = selectedClass 
    ? batches.filter(b => b.name.toLowerCase().includes(selectedClass.toLowerCase()) || selectedClass === 'General')
    : batches;

  // Filter students based on selected batch and class
  const filteredStudents = students.filter(s => {
    const classMatch = !selectedClass || (s.class || 'General') === selectedClass;
    const batchMatch = !selectedBatch || s.batchId === selectedBatch;
    return classMatch && batchMatch;
  });

  // Sync selection if student is changed externally
  useEffect(() => {
    if (selectedStudentId) {
      const s = students.find(x => x.id === selectedStudentId);
      if (s) {
        setSelectedClass(s.class || 'General');
        setSelectedBatch(s.batchId || '');
      }
    }
  }, [selectedStudentId, students]);

  return (
    <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200" id="student-selector-root">
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">{label} Hierarchy</span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Class Selector */}
        <div>
          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">1. Class Level</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedBatch('');
              onSelectStudent('');
            }}
            className="w-full bg-white border border-slate-250 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer shadow-3xs"
          >
            <option value="">-- All Classes --</option>
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Batch Selector */}
        <div>
          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">2. Target Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              onSelectStudent('');
            }}
            className="w-full bg-white border border-slate-250 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer shadow-3xs"
          >
            <option value="">-- All Batches --</option>
            {filteredBatches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Student Selector */}
        <div>
          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">3. Select Student</label>
          <select
            value={selectedStudentId}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer shadow-3xs"
          >
            <option value="">-- Choose Student --</option>
            {filteredStudents.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.rollNumber || s.id})</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
