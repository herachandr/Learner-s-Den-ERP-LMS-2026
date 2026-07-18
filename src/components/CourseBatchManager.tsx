import React, { useState } from 'react';
import { BookOpen, Calendar, MapPin, Award, Plus, Layers, Shield, Trash2, ListPlus, Clock, Sparkles } from 'lucide-react';
import { Course, Batch, Teacher, CourseChapter } from '../types';

interface CourseBatchManagerProps {
  courses: Course[];
  batches: Batch[];
  teachers: Teacher[];
  onAddCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  onAddBatch: (batch: Omit<Batch, 'id'>) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  onDeleteBatch: (id: string) => Promise<void>;
  onUpdateCourse: (id: string, updatedCourse: Partial<Course>) => Promise<void>;
}

export default function CourseBatchManager({
  courses,
  batches,
  teachers,
  onAddCourse,
  onAddBatch,
  onDeleteCourse,
  onDeleteBatch,
  onUpdateCourse,
}: CourseBatchManagerProps) {
  const [activeTab, setActiveTab] = useState<'courses' | 'batches'>('courses');

  // Sorting states
  const [sortBy, setSortBy] = useState<'academicYear' | 'courseTitle' | 'room' | 'name' | 'none'>('none');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Chapters management states
  const [selectedCourseForChapters, setSelectedCourseForChapters] = useState<Course | null>(null);
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterPeriods, setNewChapterPeriods] = useState('12');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const showLocalToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };
  
  // Adding course state
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cDuration, setCDuration] = useState('6 Months');
  const [cFee, setCFee] = useState('1500');

  // Adding batch state
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [bName, setBName] = useState('');
  const [bCourseId, setBCourseId] = useState('');
  const [bTeacherId, setBTeacherId] = useState('');
  const [bSchedule, setBSchedule] = useState('');
  const [bRoom, setBRoom] = useState('');
  const [bAcademicYear, setBAcademicYear] = useState('2026-2027');

  const getCourseName = (id: string) => {
    const c = courses.find((course) => course.id === id);
    return c ? c.name : 'Unknown Course';
  };

  const sortedBatches = React.useMemo(() => {
    if (sortBy === 'none') return batches;

    return [...batches].sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortBy === 'academicYear') {
        valA = a.academicYear || '';
        valB = b.academicYear || '';
      } else if (sortBy === 'courseTitle') {
        valA = getCourseName(a.courseId) || '';
        valB = getCourseName(b.courseId) || '';
      } else if (sortBy === 'room') {
        valA = a.room || '';
        valB = b.room || '';
      } else if (sortBy === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      }

      if (valA === valB) return 0;
      
      const comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [batches, sortBy, sortOrder, courses]);

  const getTeacherName = (id: string) => {
    const t = teachers.find((teacher) => teacher.id === id);
    return t ? t.name : 'Unassigned';
  };

  const handleOpenAddCourse = () => {
    setCName('');
    setCDesc('');
    setCDuration('6 Months');
    setCFee('1500');
    setIsAddingCourse(true);
  };

  const handleOpenAddBatch = () => {
    setBName('');
    setBCourseId(courses[0]?.id || '');
    setBTeacherId(teachers[0]?.id || '');
    setBSchedule('Mon, Wed, Fri (5:00 PM - 7:00 PM)');
    setBRoom('Lecture Room 1');
    setBAcademicYear('2026-2027');
    setIsAddingBatch(true);
  };

  const submitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName) return;
    await onAddCourse({
      name: cName,
      description: cDesc,
      duration: cDuration,
      fee: Number(cFee),
    });
    setIsAddingCourse(false);
  };

  const submitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName) return;
    await onAddBatch({
      name: bName,
      courseId: bCourseId,
      teacherId: bTeacherId,
      schedule: bSchedule,
      room: bRoom,
      academicYear: bAcademicYear,
    });
    setIsAddingBatch(false);
  };

  return (
    <div className="space-y-6">
      {/* Tab Select & New buttons */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xxs">
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'courses' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Course Catalog ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'batches' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Running Batches ({batches.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'batches' && (
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-[11px] text-slate-700 font-bold focus:outline-hidden cursor-pointer"
              >
                <option value="none">Default</option>
                <option value="academicYear">Academic Year</option>
                <option value="courseTitle">Course Title</option>
                <option value="room">Room Number</option>
                <option value="name">Batch Name</option>
              </select>
              {sortBy !== 'none' && (
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-1 py-0.5 hover:bg-slate-200 rounded text-slate-600 transition-all cursor-pointer font-bold text-[10px]"
                  title="Toggle Sort Order"
                >
                  {sortOrder === 'asc' ? 'Asc ▲' : 'Desc ▼'}
                </button>
              )}
            </div>
          )}

          {activeTab === 'courses' ? (
            <button
              onClick={handleOpenAddCourse}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Course
            </button>
          ) : (
            <button
              onClick={handleOpenAddBatch}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Schedule Batch
            </button>
          )}
        </div>
      </div>

      {/* Adding Course Modal */}
      {isAddingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Add New Course Structure
              </h3>
              <button onClick={() => setIsAddingCourse(false)} className="text-indigo-100 hover:text-white text-xs font-bold">✕</button>
            </div>
            <form onSubmit={submitCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  placeholder="e.g. Organic Chemistry Intensive"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  rows={3}
                  placeholder="e.g. Comprehensive laboratory and conceptual lectures..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={cDuration}
                    onChange={(e) => setCDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    placeholder="e.g. 6 Months"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Total Course Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={cFee}
                    onChange={(e) => setCFee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    placeholder="e.g. 20000"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingCourse(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adding Batch Modal */}
      {isAddingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Layers className="h-5 w-5" /> Schedule Academic Batch
              </h3>
              <button onClick={() => setIsAddingBatch(false)} className="text-indigo-100 hover:text-white text-xs font-bold">✕</button>
            </div>
            <form onSubmit={submitBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Batch Identifier</label>
                <input
                  type="text"
                  required
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  placeholder="e.g. JEE-2026 Elite C"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Under Course Blueprint</label>
                <select
                  value={bCourseId}
                  onChange={(e) => setBCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lead Instructor</label>
                <select
                  value={bTeacherId}
                  onChange={(e) => setBTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Academic Year</label>
                <select
                  value={bAcademicYear}
                  onChange={(e) => setBAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                >
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                  <option value="2027-2028">2027-2028</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Room/Lab No</label>
                  <input
                    type="text"
                    required
                    value={bRoom}
                    onChange={(e) => setBRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    placeholder="e.g. Room 201"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Schedules</label>
                  <input
                    type="text"
                    required
                    value={bSchedule}
                    onChange={(e) => setBSchedule(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    placeholder="e.g. Mon, Wed, Fri 4:00 PM"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingBatch(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                  Deploy Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid layouts */}
      {activeTab === 'courses' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Deleting this course will remove all dependent batches. Continue?')) {
                        onDeleteCourse(course.id);
                      }
                    }}
                    className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Course"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mt-4 tracking-tight leading-snug">{course.name}</h4>
                <p className="text-slate-500 text-xxs font-medium mt-1.5 leading-relaxed">{course.description}</p>

                {/* Chapters list / badge summary */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Chapters & Syllabus</span>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {(course.chapters || []).length} Chapters ({(course.chapters || []).reduce((sum, ch) => sum + Number(ch.assignedPeriods || 0), 0)} Periods)
                    </span>
                  </div>
                  {(course.chapters && course.chapters.length > 0) ? (
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {course.chapters.slice(0, 3).map((ch, cidx) => (
                        <div key={ch.id || cidx} className="flex justify-between items-center text-[10px] text-slate-600 bg-slate-50/50 hover:bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          <span className="truncate max-w-[150px] font-semibold text-slate-700">Ch {cidx+1}: {ch.name}</span>
                          <span className="text-slate-500 font-mono text-[9px] font-bold bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/40">{ch.assignedPeriods} p.</span>
                        </div>
                      ))}
                      {course.chapters.length > 3 && (
                        <p className="text-[9px] text-slate-400 italic text-left pl-2 mt-1">
                          + {course.chapters.length - 3} more chapters...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic bg-slate-50 p-2 rounded text-center border border-slate-100">No syllabus chapters defined yet.</p>
                  )}
                  
                  {/* Manage Chapters Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourseForChapters(course);
                      setNewChapterName('');
                      setNewChapterPeriods('12');
                    }}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 font-black text-xxs rounded-xl transition-all cursor-pointer border border-indigo-100"
                  >
                    <ListPlus className="h-3 w-3" />
                    <span>Manage Specific Chapters</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xxs text-slate-400 font-bold uppercase tracking-wider">Tuition Fees</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5">₹{course.fee.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xxs text-slate-400 font-bold uppercase tracking-wider">Syllabus Term</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-slate-600 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200/50">
                    <Award className="h-3.5 w-3.5 text-slate-400" />
                    {course.duration}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedBatches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100">
                        {getCourseName(batch.courseId)}
                      </span>
                      {batch.academicYear && (
                        <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 border border-rose-100/55">
                          AY {batch.academicYear}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mt-2.5 tracking-tight">{batch.name}</h4>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete this batch schedule?')) {
                        onDeleteBatch(batch.id);
                      }
                    }}
                    className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete Batch"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
 
                <div className="space-y-2 text-xxs font-medium text-slate-600">
                  <p className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span>Lead Instructor: <b>{getTeacherName(batch.teacherId)}</b></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-400" />
                    <span>Timeline: <b>{batch.schedule}</b></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    <span>Syllabus Room: <b>{batch.room}</b></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-rose-500" />
                    <span>Academic Cycle: <b>{batch.academicYear || "2026-2027"}</b></span>
                  </p>
                </div>
              </div>
 
              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                <span className="text-xxs font-semibold text-slate-400">Scheduled Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chapters Management Modal */}
      {selectedCourseForChapters && (() => {
        const currentChapters = selectedCourseForChapters.chapters || [];
        const totalPeriods = currentChapters.reduce((sum, ch) => sum + (Number(ch.assignedPeriods) || 0), 0);

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 text-left">
              {/* Local Toast Inside Modal */}
              {toastMessage && (
                <div className="absolute top-4 right-4 z-[10000] bg-slate-900 text-white rounded-xl px-3 py-2 text-xxs font-bold shadow-lg flex items-center gap-2 animate-bounce">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>{toastMessage.desc}</span>
                </div>
              )}

              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                    <ListPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Syllabus Chapters Desk</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Course: <span className="text-slate-600">{selectedCourseForChapters.name}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCourseForChapters(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer font-bold animate-pulse"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Add New Chapter Form */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Add New Course Chapter</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-8">
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Chapter Name / Topic</label>
                      <input
                        type="text"
                        placeholder="e.g. Kinematics & Laws of Motion"
                        value={newChapterName}
                        onChange={(e) => setNewChapterName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                      />
                    </div>
                    
                    <div className="md:col-span-4">
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Target Periods</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={newChapterPeriods}
                          onChange={(e) => setNewChapterPeriods(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!newChapterName.trim()) {
                              showLocalToast("Validation Error", "Chapter name cannot be empty.");
                              return;
                            }
                            const periodsVal = Number(newChapterPeriods) || 12;
                            const newChapter: CourseChapter = {
                              id: `ch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                              name: newChapterName.trim(),
                              assignedPeriods: periodsVal,
                              completedPeriods: 0,
                            };
                            
                            const updatedChapters = [...currentChapters, newChapter];
                            await onUpdateCourse(selectedCourseForChapters.id, {
                              chapters: updatedChapters,
                            });
                            
                            // Keep modal in sync
                            setSelectedCourseForChapters({
                              ...selectedCourseForChapters,
                              chapters: updatedChapters,
                            });
                            
                            setNewChapterName('');
                            setNewChapterPeriods('12');
                            showLocalToast("Success", "Added chapter successfully!");
                          }}
                          className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center transition-all"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapters List */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Configured Chapters ({(selectedCourseForChapters.chapters || []).length})</h4>
                    <span className="text-[10px] font-bold text-slate-500">
                      Total Allocated: <strong className="text-indigo-600">{totalPeriods} periods</strong>
                    </span>
                  </div>

                  {currentChapters.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-1">
                      <BookOpen className="h-7 w-7 mx-auto opacity-40 animate-pulse" />
                      <p className="text-xxs font-bold">No chapters defined for this course.</p>
                      <p className="text-[10px] text-slate-400">Use the form above to add specific curriculum chapters.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                      {currentChapters.map((ch, idx) => (
                        <div key={ch.id || idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                              Ch {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate" title={ch.name}>
                              {ch.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-150 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {ch.assignedPeriods} Periods
                            </span>

                            <button
                              type="button"
                              onClick={async () => {
                                const updatedChapters = currentChapters.filter((item) => item.id !== ch.id);
                                await onUpdateCourse(selectedCourseForChapters.id, {
                                  chapters: updatedChapters,
                                });
                                setSelectedCourseForChapters({
                                  ...selectedCourseForChapters,
                                  chapters: updatedChapters,
                                });
                                showLocalToast("Deleted", "Chapter removed.");
                              }}
                              className="text-slate-300 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete Chapter"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 p-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForChapters(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Close & Apply Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
