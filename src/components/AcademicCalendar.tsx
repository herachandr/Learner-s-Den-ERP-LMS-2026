import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Info, 
  Filter, 
  Check, 
  X, 
  GraduationCap,
  CalendarDays,
  AlertTriangle
} from 'lucide-react';
import { AcademicEvent, Batch, UserRole, AppUser } from '../types';
import { institutionService } from '../services/institutionService';

interface AcademicCalendarProps {
  currentUser: AppUser | null;
  currentRole: UserRole;
  batches: Batch[];
  onTriggerNotification?: (message: string, title: string) => void;
}

export default function AcademicCalendar({ 
  currentUser, 
  currentRole, 
  batches,
  onTriggerNotification 
}: AcademicCalendarProps) {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(() => {
    // Current time from metadata: 2026-06-27T05:51:45-07:00
    return new Date(2026, 5, 27); // June 2026
  });
  
  const [selectedDayEvents, setSelectedDayEvents] = useState<AcademicEvent[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  
  // Filter state
  const [filterTypes, setFilterTypes] = useState<string[]>(['exam', 'deadline', 'holiday']);
  const [filterBatch, setFilterBatch] = useState<string>('all');
  
  // Add Event form state
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState('2026-06-27');
  const [formType, setFormType] = useState<'exam' | 'deadline' | 'holiday'>('exam');
  const [formBatchId, setFormBatchId] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);

  // Fetch events from server
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await institutionService.getAcademicEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching academic events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim() || !formDate) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formTitle,
        description: formDesc,
        date: formDate,
        type: formType,
        batchId: formBatchId === 'all' ? undefined : formBatchId,
        createdBy: currentUser?.name || 'Administrator'
      };

      const newEv = await institutionService.createAcademicEvent(payload);
      setEvents(prev => [...prev, newEv]);
      setIsAddingEvent(false);
      // Reset form
      setFormTitle('');
      setFormDesc('');
      setFormDate('2026-06-27');
      setFormType('exam');
      setFormBatchId('all');

      if (onTriggerNotification) {
        onTriggerNotification(
          `"${formTitle}" has been scheduled for ${formDate} successfully!`,
          'Academic Schedule Synced'
        );
      }
    } catch (err) {
      console.error('Error creating academic event:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!confirm(`Are you sure you want to cancel and remove the event: "${title}"?`)) {
      return;
    }

    try {
      await institutionService.deleteAcademicEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      // Clear selected day details if deleted
      setSelectedDayEvents(prev => prev.filter(e => e.id !== eventId));
      if (onTriggerNotification) {
        onTriggerNotification(
          `"${title}" has been removed from the academic calendar.`,
          'Schedule Updated'
        );
      }
    } catch (err) {
      console.error('Error deleting academic event:', err);
    }
  };

  // Helper functions for calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // First day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  // Total days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Day of week offset for the first day (0 = Sunday, 6 = Saturday)
  const offset = firstDayOfMonth.getDay();

  // Prev & Next Month Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDateStr(null);
    setSelectedDayEvents([]);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDateStr(null);
    setSelectedDayEvents([]);
  };

  // Calendar cells generation
  const daysArray = [];
  // Add blank cells for offset
  for (let i = 0; i < offset; i++) {
    daysArray.push(null);
  }
  // Add month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  // Filter events based on criteria
  const getFilteredEvents = () => {
    return events.filter(e => {
      // Filter type
      if (!filterTypes.includes(e.type)) return false;
      // Filter batch
      if (filterBatch !== 'all') {
        if (e.batchId && e.batchId !== filterBatch) return false;
      }
      return true;
    });
  };

  const filteredEvents = getFilteredEvents();

  // Check events for a specific day cell
  const getDayEvents = (dayNum: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return filteredEvents.filter(e => e.date === dStr);
  };

  // Select a day cell
  const handleSelectDay = (dayNum: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayEvents = getDayEvents(dayNum);
    setSelectedDateStr(dStr);
    setSelectedDayEvents(dayEvents);
  };

  const isToday = (dayNum: number) => {
    // Current date from metadata: 2026-06-27
    return year === 2026 && month === 5 && dayNum === 27;
  };

  const toggleTypeFilter = (type: string) => {
    setFilterTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const getEventBadgeStyles = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'deadline':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'holiday':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'event':
        return 'bg-violet-50 border-violet-200 text-violet-700';
      case 'milestone':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getEventDotStyles = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-rose-500 ring-rose-200';
      case 'deadline':
        return 'bg-amber-500 ring-amber-200';
      case 'holiday':
        return 'bg-emerald-500 ring-emerald-200';
      case 'event':
        return 'bg-violet-500 ring-violet-200';
      case 'milestone':
        return 'bg-blue-500 ring-blue-200';
      default:
        return 'bg-slate-500 ring-slate-200';
    }
  };

  const canManageCalendar = currentRole === 'admin' || currentRole === 'teacher';

  return (
    <div className="space-y-6" id="academic-calendar-tab">
      
      {/* Upper Control Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <CalendarDays className="h-5.5 w-5.5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Academic Operations Calendar</h3>
            <p className="text-xxs text-slate-400 mt-0.5">Unified scheduling tracker for exams, submissions, assignments, and central holidays.</p>
          </div>
        </div>

        {/* Filters and Add Event Trigger */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Batch Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xxs font-bold text-slate-600">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Filter Batch:</span>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="bg-transparent border-0 font-extrabold text-slate-800 focus:ring-0 cursor-pointer text-xxs py-0"
            >
              <option value="all">All Batches</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {canManageCalendar && (
            <button
              onClick={() => setIsAddingEvent(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xxs font-extrabold transition-all shadow-xs cursor-pointer ml-auto md:ml-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Calendar Matrix */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col h-full">
          
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-800 tracking-tight">
                {monthNames[month]} {year}
              </h2>
              {/* Decorative current month indicators */}
              {year === 2026 && month === 5 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-150 text-[9px] font-black text-indigo-600 animate-pulse">
                  <Sparkles className="h-2.5 w-2.5" />
                  Current Academic Month
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(2026, 5, 27))}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xxs font-bold text-slate-600 cursor-pointer"
              >
                Current Date
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Type Filter Chip Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xxs font-bold text-slate-500 mb-5 pb-3 border-b border-slate-50 shrink-0">
            <span className="text-slate-400">Legend & Toggle Views:</span>
            
            <button
              onClick={() => toggleTypeFilter('exam')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                filterTypes.includes('exam')
                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-extrabold'
                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className={`h-2 w-2 rounded-full bg-rose-500 ${!filterTypes.includes('exam') && 'opacity-40'}`} />
              <span>Exams</span>
            </button>

            <button
              onClick={() => toggleTypeFilter('deadline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                filterTypes.includes('deadline')
                  ? 'bg-amber-50 border-amber-300 text-amber-700 font-extrabold'
                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className={`h-2 w-2 rounded-full bg-amber-500 ${!filterTypes.includes('deadline') && 'opacity-40'}`} />
              <span>Submission Deadlines</span>
            </button>

            <button
              onClick={() => toggleTypeFilter('holiday')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                filterTypes.includes('holiday')
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold'
                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className={`h-2 w-2 rounded-full bg-emerald-500 ${!filterTypes.includes('holiday') && 'opacity-40'}`} />
              <span>Holidays & Events</span>
            </button>
          </div>

          {/* Grid Layout of Calendar */}
          <div className="flex-1 min-h-[420px] flex flex-col">
            
            {/* Days of week titles */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 shrink-0">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Grid days content */}
            <div className="grid grid-cols-7 gap-2 flex-1">
              {daysArray.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="bg-slate-50/40 rounded-xl border border-slate-100/50" />;
                }

                const dayEvents = getDayEvents(day);
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDateStr === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => handleSelectDay(day)}
                    className={`group relative text-left p-2.5 rounded-2xl border flex flex-col justify-between transition-all duration-200 cursor-pointer min-h-[68px] ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100'
                        : isToday(day)
                        ? 'bg-indigo-50/80 border-indigo-200 text-slate-800'
                        : 'bg-white border-slate-150 hover:border-indigo-300 hover:bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    {/* Day number */}
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xs font-black ${
                        isToday(day) && !isSelected ? 'text-indigo-600 bg-indigo-100/80 px-1.5 py-0.5 rounded-lg' : ''
                      }`}>
                        {day}
                      </span>
                      
                      {/* Live notification check */}
                      {isToday(day) && (
                        <span className="text-[8px] font-extrabold uppercase tracking-widest text-indigo-500 hidden sm:block">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Day micro event dots/text */}
                    <div className="w-full space-y-1 mt-1.5">
                      {/* Desktop text view (only fits 1-2 items) */}
                      <div className="hidden sm:block space-y-0.5">
                        {dayEvents.slice(0, 2).map(ev => (
                          <div 
                            key={ev.id}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold truncate max-w-full ${
                              isSelected
                                ? 'bg-white/20 text-white border-0'
                                : ev.type === 'exam' ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                : ev.type === 'deadline' ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className={`text-[7px] font-bold text-center ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                            + {dayEvents.length - 2} more
                          </div>
                        )}
                      </div>

                      {/* Mobile minimal dot views */}
                      <div className="flex flex-wrap gap-1 sm:hidden items-center justify-end">
                        {dayEvents.map(ev => (
                          <span 
                            key={ev.id}
                            className={`h-1.5 w-1.5 rounded-full ring-2 ${
                              isSelected ? 'bg-white ring-indigo-500' : getEventDotStyles(ev.type)
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

        </div>

        {/* Right 1 Column: Selected Day Events & Schedule Feed */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col h-full max-h-[640px] overflow-y-auto">
          
          {/* Section: Daily schedule */}
          <div className="space-y-4 flex-1 flex flex-col">
            
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 shrink-0">
              <Calendar className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                {selectedDateStr ? `Day Ledger: ${selectedDateStr}` : 'Month Agenda feed'}
              </h3>
            </div>

            {selectedDateStr ? (
              // Show ledger for selected day
              <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold text-slate-800">
                    Schedule for Day:
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedDateStr(null);
                      setSelectedDayEvents([]);
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Show All Month
                  </button>
                </div>

                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Info className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-xxs font-bold text-slate-400">No events scheduled on this day.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayEvents.map(ev => {
                      const associatedBatch = batches.find(b => b.id === ev.batchId);
                      return (
                        <div 
                          key={ev.id} 
                          className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 relative overflow-hidden text-left"
                        >
                          {/* Accent type ribbon */}
                          <div className={`absolute top-0 inset-x-0 h-1 ${
                            ev.type === 'exam' ? 'bg-rose-500' : ev.type === 'deadline' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />

                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getEventBadgeStyles(ev.type)}`}>
                              {ev.type}
                            </span>
                            
                            {currentRole === 'admin' && (
                              <button
                                onClick={() => handleDeleteEvent(ev.id, ev.title)}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-slate-100 cursor-pointer"
                                title="Remove Event"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          <h4 className="font-extrabold text-xs text-slate-800 mt-2">{ev.title}</h4>
                          <p className="text-xxs text-slate-500 font-medium leading-relaxed mt-1">{ev.description}</p>
                          
                          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[9px] font-bold text-slate-400">
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3 text-slate-400" />
                              <span>{associatedBatch ? `Batch: ${associatedBatch.name}` : 'All Batches'}</span>
                            </span>
                            <span className="text-slate-300 font-medium">By {ev.createdBy}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Otherwise show entire monthly chronological schedule feed
              <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                <h4 className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>Chronological Schedule Feed</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold">
                    {filteredEvents.length} items
                  </span>
                </h4>

                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-slate-150">
                    <Info className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-xxs font-bold text-slate-400">No events found matching your filter criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {[...filteredEvents]
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(ev => {
                        const associatedBatch = batches.find(b => b.id === ev.batchId);
                        
                        // Parse date to readable
                        const dObj = new Date(ev.date);
                        const dayStr = String(dObj.getDate()).padStart(2, '0');
                        const mStr = monthNames[dObj.getMonth()].slice(0, 3);
                        
                        return (
                          <div 
                            key={ev.id} 
                            onClick={() => {
                              setSelectedDateStr(ev.date);
                              setSelectedDayEvents(events.filter(e => e.date === ev.date));
                            }}
                            className="p-2.5 bg-white border border-slate-150 rounded-2xl hover:bg-slate-50 hover:border-indigo-200 transition-all cursor-pointer text-left flex gap-3.5 items-start"
                          >
                            {/* Date Badge */}
                            <div className="bg-indigo-50/70 border border-indigo-100 p-2 rounded-xl text-center shrink-0 w-11 flex flex-col justify-center">
                              <span className="text-[8px] font-black uppercase text-indigo-400">{mStr}</span>
                              <span className="text-xs font-black text-indigo-700 tracking-tight leading-none mt-0.5">{dayStr}</span>
                            </div>

                            <div className="space-y-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[7px] font-black uppercase border leading-none shrink-0 ${getEventBadgeStyles(ev.type)}`}>
                                  {ev.type}
                                </span>
                                {associatedBatch && (
                                  <span className="text-[8px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-extrabold max-w-[120px] truncate">
                                    {associatedBatch.name}
                                  </span>
                                )}
                              </div>
                              <h5 className="font-extrabold text-slate-800 text-xxs sm:text-xs truncate">{ev.title}</h5>
                              <p className="text-[10px] text-slate-400 truncate font-semibold leading-relaxed">{ev.description}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Quick reminder block */}
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3 flex gap-2.5 items-start mt-auto shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-left leading-relaxed">
                <h5 className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Exam Prep reminder</h5>
                <p className="text-[9px] text-amber-700 font-bold mt-0.5">
                  Prepare well in advance for red-marked examinations. LMS Practice study materials and quizzes are updated on each respective batch desk.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Add Academic Event Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Header border banner */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-600" />

            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-800">Schedule Academic Event</h3>
              </div>
              <button
                onClick={() => setIsAddingEvent(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="p-6 space-y-4">
              
              {/* Event Title */}
              <div className="space-y-1.5 text-left">
                <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">Event Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Physics Thermodynamics Midterm Exam"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Event Description */}
              <div className="space-y-1.5 text-left">
                <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">Event Description</label>
                <textarea
                  required
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detail the event syllabus, submission rules, or holiday description..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Event Date & Event Type Row */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Event Date */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">Event Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-pointer"
                  />
                </div>

                {/* Event Type */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">Event Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="exam">Examination</option>
                    <option value="deadline">Submission Deadline</option>
                    <option value="holiday">Holiday / Event</option>
                  </select>
                </div>

              </div>

              {/* Applicable Batch */}
              <div className="space-y-1.5 text-left">
                <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">Target Applicable Batch</label>
                <select
                  value={formBatchId}
                  onChange={(e) => setFormBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="all">All Batches (Global Center Event)</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  {submitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <span>Save Schedule</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
