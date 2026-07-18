import React, { useState } from 'react';
import { 
  User, Tag, Calendar, Sparkles, Phone, Mail, MapPin, 
  Trash2, Download, Upload, FileText, Check, ShieldAlert, 
  Lock, MessageSquare, Award, Clock, IdCard, Edit2, X,
  ShieldCheck, AlertCircle, Briefcase, Plus, Send, CheckCircle2,
  XCircle, Smartphone, Map, ClipboardList, TrendingUp, DollarSign, BookOpen, Users
} from 'lucide-react';
import { Teacher, Batch, TeacherAttendance } from '../types';

interface TeacherProfileModalProps {
  teacher: Teacher;
  onClose: () => void;
  batches: Batch[];
  onUpdateTeacher: (id: string, updates: Partial<Teacher>) => Promise<void>;
  attendanceLogs: TeacherAttendance[];
  onPunchIn: (punchData: { teacherId: string; mode: 'QR' | 'PunchIn' | 'Location' | 'Geofence'; location?: { lat: number; lng: number }; verified: boolean }) => Promise<void>;
  onPunchOut: (attendanceId: string, hoursWorked: number) => Promise<void>;
  onAddManualLog: (logData: Omit<TeacherAttendance, 'id'>) => Promise<void>;
  onDeleteLog: (id: string) => Promise<void>;
  onApproveAttendance: (id: string, verified: boolean) => Promise<void>;
  simulatedRole: 'admin' | 'lecturer' | 'front_office' | 'teacher';
  showToast: (title: string, message: string) => void;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  teacher,
  onClose,
  batches,
  onUpdateTeacher,
  attendanceLogs,
  onPunchIn,
  onPunchOut,
  onAddManualLog,
  onDeleteLog,
  onApproveAttendance,
  simulatedRole,
  showToast
}) => {
  const [modalTab, setModalTab] = useState<string>('profile');
  
  // General Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFields, setEditFields] = useState<Partial<Teacher>>({
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    whatsAppNumber: teacher.whatsAppNumber || teacher.phone,
    subject: teacher.subject,
    joiningDate: teacher.joiningDate || '2025-06-01',
    dob: teacher.dob || '1990-04-15',
    gender: teacher.gender || 'Male',
    qualification: teacher.qualification || 'M.Tech in CSE',
    experienceYears: teacher.experienceYears || 5,
    aadharNumber: teacher.aadharNumber || '1234-5678-9012',
    panNumber: teacher.panNumber || 'ABCDE1234F',
    address: teacher.address || 'H.No 12, Sector 5, Dwarka, New Delhi',
    bankAccountNo: teacher.bankAccountNo || '987654321098',
    bankIFSC: teacher.bankIFSC || 'SBIN0001234'
  });

  // Manual Attendance log insert form
  const [showManualLogForm, setShowManualLogForm] = useState(false);
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLogMode, setNewLogMode] = useState<'PunchIn' | 'QR' | 'Location' | 'Geofence'>('PunchIn');
  const [newLogTimeIn, setNewLogTimeIn] = useState('09:00:00');
  const [newLogTimeOut, setNewLogTimeOut] = useState('17:00:00');
  const [newLogHours, setNewLogHours] = useState('8');

  // Timetable scheduling states
  const [showTimetableForm, setShowTimetableForm] = useState(false);
  const [newTimeDay, setNewTimeDay] = useState('Monday');
  const [newTimeSlot, setNewTimeSlot] = useState('09:00 AM - 10:30 AM');
  const [newTimeSubject, setNewTimeSubject] = useState(teacher.subject);
  const [newTimeBatch, setNewTimeBatch] = useState(teacher.batches?.[0] || '');
  const [newTimeRoom, setNewTimeRoom] = useState('Lab A-3');

  // Leave state
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState('Casual Leave');
  const [newLeaveStart, setNewLeaveStart] = useState(new Date().toISOString().split('T')[0]);
  const [newLeaveEnd, setNewLeaveEnd] = useState(new Date().toISOString().split('T')[0]);
  const [newLeaveReason, setNewLeaveReason] = useState('');

  // Performance Review state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [newFeedbackRating, setNewFeedbackRating] = useState('5');
  const [newFeedbackComment, setNewFeedbackComment] = useState('');

  // Document upload state
  const [isDragging, setIsDragging] = useState(false);
  const [newDocType, setNewDocType] = useState('Resume');
  const [newDocName, setNewDocName] = useState('');

  // Communication state
  const [commChannel, setCommChannel] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');
  const [commTemplate, setCommTemplate] = useState('general');
  const [commCustomText, setCommCustomText] = useState('');

  // Local helper lists if not pre-populated in teacher data
  const localLeaves = teacher.leaves || [
    { id: 'l1', type: 'Casual Leave', startDate: '2026-06-10', endDate: '2026-06-11', reason: 'Personal family affair', status: 'Approved' as const },
    { id: 'l2', type: 'Medical Leave', startDate: '2026-05-15', endDate: '2026-05-16', reason: 'Flu recovery', status: 'Approved' as const },
    { id: 'l3', type: 'Earned Leave', startDate: '2026-07-20', endDate: '2026-07-22', reason: 'Out of town travel', status: 'Pending' as const }
  ];

  const localTimetables = teacher.timetables || [
    { id: 't1', day: 'Monday', time: '10:00 AM - 11:30 AM', subject: teacher.subject, batchId: teacher.batches?.[0] || 'batch-1', room: 'Hall B' },
    { id: 't2', day: 'Wednesday', time: '11:45 AM - 01:15 PM', subject: teacher.subject, batchId: teacher.batches?.[0] || 'batch-1', room: 'Room 102' },
    { id: 't3', day: 'Friday', time: '02:00 PM - 03:30 PM', subject: teacher.subject, batchId: teacher.batches?.[1] || teacher.batches?.[0] || 'batch-2', room: 'Lab A-1' }
  ];

  const localDocuments = teacher.documents || [
    { id: 'd1', name: 'Curriculum_Vitae_Richard.pdf', type: 'Resume', url: '#', uploadedAt: '2025-06-01' },
    { id: 'd2', name: 'Doctorate_Degree_Physics.pdf', type: 'Degree Certificate', url: '#', uploadedAt: '2025-06-01' },
    { id: 'd3', name: 'Aadhaar_Card_Verified.pdf', type: 'Aadhaar Scan', url: '#', uploadedAt: '2025-06-02' }
  ];

  const localDisbursements = teacher.disbursements || [
    { id: 'pay1', date: '2026-06-01', amount: teacher.payoutType === 'Fixed' ? teacher.basePay : 42500, mode: 'Bank Transfer (IMPS)', status: 'Paid' as const, referenceId: 'TXN8273618', period: 'May 2026' },
    { id: 'pay2', date: '2026-05-02', amount: teacher.payoutType === 'Fixed' ? teacher.basePay : 39800, mode: 'Bank Transfer (NEFT)', status: 'Paid' as const, referenceId: 'TXN6251811', period: 'April 2026' }
  ];

  const localCommunications = teacher.communications || [
    { id: 'comm1', date: '2026-07-01 10:00', mode: 'WhatsApp', message: 'Hi Dr. Feynman, Your batch (Quantum Alpha) lecture timings have been synchronized for Monday.', templateName: 'Timetable Update', status: 'Sent' as const },
    { id: 'comm2', date: '2026-06-25 15:30', mode: 'Email', message: 'Dear Faculty Member, Please log your monthly attendance by June 28 for payroll clearances.', templateName: 'Circular', status: 'Sent' as const }
  ];

  // Simulated metrics
  const performanceScore = teacher.performanceScore || 9.2;
  const evaluationsCount = teacher.evaluationsCount || 14;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateTeacher(teacher.id, editFields);
    setIsEditingProfile(false);
    showToast("Profile Updated", `Successfully saved updated demographics for ${teacher.name}.`);
  };

  const handleAddManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      teacherId: teacher.id,
      date: newLogDate,
      timeIn: newLogTimeIn,
      timeOut: newLogTimeOut,
      mode: newLogMode,
      verified: true,
      hoursWorked: Number(newLogHours)
    };
    await onAddManualLog(payload);
    setShowManualLogForm(false);
    showToast("Attendance Saved", `Successfully inserted manual shift check-in for ${newLogDate}.`);
  };

  const handleDisbursePayroll = async () => {
    // calculate estimated remuneration based on attendance logs
    const filteredLogs = attendanceLogs.filter(l => l.teacherId === teacher.id && l.verified);
    let computedPay = teacher.basePay;
    let desc = "";
    if (teacher.payoutType === 'Hourly') {
      const hours = filteredLogs.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
      computedPay = hours * teacher.hourlyRate;
      desc = `Calculated across ${hours.toFixed(1)} verified clock-hours.`;
    } else if (teacher.payoutType === 'Per-Session') {
      const sessions = filteredLogs.length;
      computedPay = sessions * teacher.hourlyRate;
      desc = `Calculated across ${sessions} lectured sessions.`;
    } else {
      desc = `Monthly consolidated base pay.`;
    }

    if (confirm(`Do you want to disburse ₹${computedPay.toLocaleString()} to ${teacher.name} via simulated corporate bank transfer?`)) {
      const newDisb = {
        id: `pay-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: computedPay,
        mode: 'Bank Transfer (IMPS)',
        status: 'Paid' as const,
        referenceId: `TXN${Math.floor(10000000 + Math.random() * 90000000)}`,
        period: 'Current Cycle (June 2026)'
      };
      
      const updatedDisbursements = [newDisb, ...localDisbursements];
      await onUpdateTeacher(teacher.id, { disbursements: updatedDisbursements });
      showToast("Remuneration Disbursed", `Successfully transferred ₹${computedPay.toLocaleString()}! Ref ID: ${newDisb.referenceId}`);
    }
  };

  const handleAddTimetableSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot = {
      id: `time-${Date.now()}`,
      day: newTimeDay,
      time: newTimeSlot,
      subject: newTimeSubject,
      batchId: newTimeBatch,
      room: newTimeRoom
    };
    const updatedTimetables = [...localTimetables, newSlot];
    await onUpdateTeacher(teacher.id, { timetables: updatedTimetables });
    setShowTimetableForm(false);
    setNewTimeRoom('');
    showToast("Timetable Slot Added", `Assigned ${teacher.name} to lecture ${newTimeBatch} on ${newTimeDay}s.`);
  };

  const handleDeleteTimetableSlot = async (slotId: string) => {
    if (confirm("Are you sure you want to remove this timetable slot?")) {
      const updatedTimetables = localTimetables.filter(t => t.id !== slotId);
      await onUpdateTeacher(teacher.id, { timetables: updatedTimetables });
      showToast("Timetable Slot Removed", "Lecture schedule slot deleted successfully.");
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveReason.trim()) {
      alert("Please specify a reason.");
      return;
    }
    const newLeave = {
      id: `leave-${Date.now()}`,
      type: newLeaveType,
      startDate: newLeaveStart,
      endDate: newLeaveEnd,
      reason: newLeaveReason,
      status: (simulatedRole === 'admin' ? 'Approved' : 'Pending') as 'Approved' | 'Pending' | 'Rejected'
    };
    const updatedLeaves = [newLeave, ...localLeaves];
    await onUpdateTeacher(teacher.id, { leaves: updatedLeaves });
    setShowLeaveForm(false);
    setNewLeaveReason('');
    showToast(
      simulatedRole === 'admin' ? "Leave Registered" : "Leave Requested",
      simulatedRole === 'admin' 
        ? "Leave logged as Approved." 
        : "Your leave application has been routed to the Administrative desk."
    );
  };

  const handleToggleLeaveStatus = async (leaveId: string, status: 'Approved' | 'Rejected') => {
    const updatedLeaves = localLeaves.map(l => l.id === leaveId ? { ...l, status } : l);
    await onUpdateTeacher(teacher.id, { leaves: updatedLeaves });
    showToast("Leave Decision Logged", `Leave request marked as ${status}.`);
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackComment.trim()) {
      alert("Please provide feedback notes.");
      return;
    }
    const newScore = ((performanceScore * evaluationsCount) + Number(newFeedbackRating)) / (evaluationsCount + 1);
    await onUpdateTeacher(teacher.id, {
      performanceScore: Number(newScore.toFixed(2)),
      evaluationsCount: evaluationsCount + 1
    });
    setShowFeedbackForm(false);
    setNewFeedbackComment('');
    showToast("Evaluation Filed", "Faculty performance score and student feedback metrics recalculated.");
  };

  const handleSimulatedUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) {
      alert("Please enter file name.");
      return;
    }
    const cleanFileName = newDocName.toLowerCase().endsWith('.pdf') ? newDocName : `${newDocName}.pdf`;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: cleanFileName,
      type: newDocType,
      url: '#',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    const updatedDocs = [newDoc, ...localDocuments];
    await onUpdateTeacher(teacher.id, { documents: updatedDocs });
    setNewDocName('');
    showToast("Document Saved", `Uploaded ${cleanFileName} successfully to instructor dossier.`);
  };

  const handleDeleteDocument = async (docId: string) => {
    if (confirm("Are you sure you want to permanently delete this document from the faculty archive?")) {
      const updatedDocs = localDocuments.filter(d => d.id !== docId);
      await onUpdateTeacher(teacher.id, { documents: updatedDocs });
      showToast("Document Deleted", "File removed from teacher repository.");
    }
  };

  const handleSendComm = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMsg = commCustomText.trim() || `Hi ${teacher.name}, this is an administrative update. Please contact the front office.`;
    const newComm = {
      id: `comm-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      mode: commChannel,
      message: finalMsg,
      templateName: commTemplate,
      status: 'Sent' as const
    };
    const updatedComm = [newComm, ...localCommunications];
    await onUpdateTeacher(teacher.id, { communications: updatedComm });
    setCommCustomText('');
    showToast("Message Transmitted", `Dispatched administrative circular to ${teacher.name} via ${commChannel}.`);
  };

  // Helper calculation metrics
  const activeTeacherLogs = attendanceLogs.filter(log => log.teacherId === teacher.id);
  const approvedCount = activeTeacherLogs.filter(r => r.verified).length;
  const pendingCount = activeTeacherLogs.filter(r => !r.verified).length;
  const totalHours = activeTeacherLogs.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);

  let currentEstPay = teacher.basePay;
  if (teacher.payoutType === 'Hourly') {
    currentEstPay = totalHours * teacher.hourlyRate;
  } else if (teacher.payoutType === 'Per-Session') {
    currentEstPay = approvedCount * teacher.hourlyRate;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-50 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="bg-indigo-900 text-white p-5 sm:p-6 flex justify-between items-center relative">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center font-black text-xl text-indigo-200 shrink-0 shadow-inner">
              {teacher.name.split(' ').pop()?.[0]}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight truncate">{teacher.name}</h2>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] uppercase tracking-wider rounded-md border border-emerald-500/30">
                  {teacher.subject} SPECIALIST
                </span>
              </div>
              <p className="text-xxs text-slate-300 font-medium mt-1">
                Faculty Roster Code: <span className="font-mono font-bold text-white bg-indigo-950 px-1.5 py-0.5 rounded">{teacher.id}</span>
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 flex gap-1.5 overflow-x-auto text-xxs font-extrabold text-slate-500 scrollbar-none shrink-0">
          {[
            { id: 'profile', label: 'Faculty Profile', icon: User },
            { id: 'attendance', label: 'Check-in Logs', icon: Clock },
            { id: 'payroll', label: 'Payroll & Remuneration', icon: DollarSign },
            { id: 'subjects', label: 'Subjects Mapping', icon: BookOpen },
            { id: 'timetable', label: 'Weekly Timetable', icon: Calendar },
            { id: 'leave', label: 'Leave Register', icon: ClipboardList },
            { id: 'performance', label: 'Performance INDEX', icon: Award },
            { id: 'documents', label: 'KYC Dossier', icon: FileText },
            { id: 'communication', label: 'Admin Notifications', icon: MessageSquare }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const active = modalTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setModalTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  active 
                    ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-black shadow-xxs' 
                    : 'bg-transparent border-transparent hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <TabIcon className={`h-3.5 w-3.5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MODAL MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* ==================== 1. GENERAL PROFILE ==================== */}
          {modalTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Personal & Demographic Dossier</h3>
                  <p className="text-xxs text-slate-400 mt-0.5">Maintain legal, verification, and academic demographics of the instructor.</p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded-xl text-indigo-700 font-bold text-xxs transition-all cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Demographics'}</span>
                </button>
              </div>

              {!isEditingProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Personal card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-xxs">
                    <span className="text-[10px] uppercase font-black tracking-wider text-indigo-600 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Demographic Details
                    </span>
                    <div className="space-y-2 text-xxs font-semibold text-slate-600">
                      <p><span className="text-slate-400 block font-medium">Full Name</span> {teacher.name}</p>
                      <p><span className="text-slate-400 block font-medium">Date of Birth</span> {editFields.dob}</p>
                      <p><span className="text-slate-400 block font-medium">Gender</span> {editFields.gender}</p>
                      <p><span className="text-slate-400 block font-medium">Specialty Subject</span> {teacher.subject}</p>
                    </div>
                  </div>

                  {/* Professional / Contract */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-xxs">
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" /> Appointment & KYC
                    </span>
                    <div className="space-y-2 text-xxs font-semibold text-slate-600">
                      <p><span className="text-slate-400 block font-medium">Date of Joining</span> {editFields.joiningDate}</p>
                      <p><span className="text-slate-400 block font-medium">Highest Qualification</span> {editFields.qualification}</p>
                      <p><span className="text-slate-400 block font-medium">Experience Years</span> {editFields.experienceYears} Years</p>
                      <p><span className="text-slate-400 block font-medium">Aadhaar (Simulated)</span> <span className="font-mono">{editFields.aadharNumber}</span></p>
                      <p><span className="text-slate-400 block font-medium">PAN (Simulated)</span> <span className="font-mono">{editFields.panNumber}</span></p>
                    </div>
                  </div>

                  {/* Contact & Banking */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-xxs">
                    <span className="text-[10px] uppercase font-black tracking-wider text-rose-600 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Contact & Banking
                    </span>
                    <div className="space-y-2 text-xxs font-semibold text-slate-600">
                      <p><span className="text-slate-400 block font-medium">Email Address</span> {teacher.email}</p>
                      <p><span className="text-slate-400 block font-medium">Phone Number</span> {teacher.phone}</p>
                      <p><span className="text-slate-400 block font-medium">WhatsApp Notification No.</span> {editFields.whatsAppNumber}</p>
                      <p><span className="text-slate-400 block font-medium">Residence Address</span> {editFields.address}</p>
                      <p><span className="text-slate-400 block font-medium">Bank Details</span> {editFields.bankAccountNo} (IFSC: {editFields.bankIFSC})</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSave} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xxs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editFields.name}
                        onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={editFields.email}
                        onChange={(e) => setEditFields({ ...editFields, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">Phone</label>
                      <input
                        type="text"
                        required
                        value={editFields.phone}
                        onChange={(e) => setEditFields({ ...editFields, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">WhatsApp Notification No.</label>
                      <input
                        type="text"
                        required
                        value={editFields.whatsAppNumber}
                        onChange={(e) => setEditFields({ ...editFields, whatsAppNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editFields.dob}
                        onChange={(e) => setEditFields({ ...editFields, dob: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">Gender</label>
                      <select
                        value={editFields.gender}
                        onChange={(e) => setEditFields({ ...editFields, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">Qualification</label>
                      <input
                        type="text"
                        value={editFields.qualification}
                        onChange={(e) => setEditFields({ ...editFields, qualification: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">Experience Years</label>
                      <input
                        type="number"
                        value={editFields.experienceYears}
                        onChange={(e) => setEditFields({ ...editFields, experienceYears: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">Date of Joining</label>
                      <input
                        type="date"
                        value={editFields.joiningDate}
                        onChange={(e) => setEditFields({ ...editFields, joiningDate: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">Aadhaar (Simulated)</label>
                      <input
                        type="text"
                        value={editFields.aadharNumber}
                        onChange={(e) => setEditFields({ ...editFields, aadharNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">PAN Code</label>
                      <input
                        type="text"
                        value={editFields.panNumber}
                        onChange={(e) => setEditFields({ ...editFields, panNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">Bank Name & A/C No.</label>
                      <input
                        type="text"
                        value={editFields.bankAccountNo}
                        onChange={(e) => setEditFields({ ...editFields, bankAccountNo: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={editFields.bankIFSC}
                        onChange={(e) => setEditFields({ ...editFields, bankIFSC: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xxs font-black text-slate-450 uppercase mb-1">Residential Address</label>
                      <textarea
                        value={editFields.address}
                        onChange={(e) => setEditFields({ ...editFields, address: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xxs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xxs font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      Save Dossier
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ==================== 2. ATTENDANCE LOGS ==================== */}
          {modalTab === 'attendance' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Instructor Check-In Registers</h3>
                  <p className="text-xxs text-slate-400 mt-0.5">Vetted punch logs, GPS perimeters, and active timetabled hours.</p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowManualLogForm(!showManualLogForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded-xl text-indigo-700 font-bold text-xxs transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Insert Attendance Log</span>
                  </button>
                </div>
              </div>

              {/* Attendance metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Hours</span>
                  <span className="text-xl font-black text-indigo-600 block mt-1">{totalHours.toFixed(1)} hrs</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Approved Logs</span>
                  <span className="text-xl font-black text-emerald-600 block mt-1">{approvedCount} days</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Pending Approval</span>
                  <span className="text-xl font-black text-amber-500 block mt-1">{pendingCount} logs</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Check-in Methods</span>
                  <span className="text-xs font-bold text-slate-700 block mt-2 uppercase">QR, Location, GPS</span>
                </div>
              </div>

              {/* Manual insert form */}
              {showManualLogForm && (
                <form onSubmit={handleAddManualAttendance} className="bg-white border border-indigo-100 rounded-2xl p-5 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase">Insert Manual Check-in Log</h4>
                    <button type="button" onClick={() => setShowManualLogForm(false)} className="text-slate-450 hover:text-slate-600"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-xxs font-semibold">
                    <div>
                      <label className="block text-slate-400 mb-1">Date</label>
                      <input type="date" required value={newLogDate} onChange={e => setNewLogDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Punch Mode</label>
                      <select value={newLogMode} onChange={e => setNewLogMode(e.target.value as any)} className="w-full p-2 border border-slate-200 bg-white rounded-xl">
                        <option value="PunchIn">Manual Punch</option>
                        <option value="QR">QR Code</option>
                        <option value="Location">GPS Location</option>
                        <option value="Geofence">Geofence Portal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Time In</label>
                      <input type="text" placeholder="HH:MM:SS" required value={newLogTimeIn} onChange={e => setNewLogTimeIn(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Time Out</label>
                      <input type="text" placeholder="HH:MM:SS" required value={newLogTimeOut} onChange={e => setNewLogTimeOut(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-slate-400 mb-1">Hours worked</label>
                      <input type="number" step="0.5" required value={newLogHours} onChange={e => setNewLogHours(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowManualLogForm(false)} className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xxs text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                    <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xxs font-bold shadow-xs cursor-pointer">Save Log</button>
                  </div>
                </form>
              )}

              {/* Logs register list */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xxs">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Attendance Ledger Registry</span>
                </div>

                {activeTeacherLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 italic text-xxs">
                    No punch history found for this instructor in the current logs cache.
                  </div>
                ) : (
                  <div className="overflow-x-auto text-xxs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="px-5 py-3">Log Date</th>
                          <th className="px-5 py-3">Log timing</th>
                          <th className="px-5 py-3">Verification Mode</th>
                          <th className="px-5 py-3">Hours Logged</th>
                          <th className="px-5 py-3">Vetting Status</th>
                          <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                        {activeTeacherLogs.slice().reverse().map((log) => (
                          <tr key={log.id} className="hover:bg-slate-55/20 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-slate-800">{log.date}</td>
                            <td className="px-5 py-3.5 font-mono">{log.timeIn} → {log.timeOut || 'Shift Active'}</td>
                            <td className="px-5 py-3.5">
                              <span className="px-2 py-0.5 rounded-full border bg-slate-100 border-slate-150 font-bold uppercase text-[9px]">
                                {log.mode}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-800">{log.hoursWorked !== undefined ? `${log.hoursWorked} hrs` : 'Running'}</td>
                            <td className="px-5 py-3.5">
                              {log.verified ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-md font-bold text-[9px]">
                                  ✓ Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-150 px-2 py-0.5 rounded-md font-bold text-[9px]">
                                  ⚠ Unapproved
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex justify-end gap-1.5">
                                {simulatedRole === 'admin' && (
                                  <>
                                    <button
                                      onClick={() => onApproveAttendance(log.id, !log.verified)}
                                      className={`px-2 py-1 rounded-md border text-[9px] font-black uppercase cursor-pointer ${
                                        log.verified 
                                          ? 'bg-amber-50 border-amber-150 text-amber-700 hover:bg-amber-100' 
                                          : 'bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100'
                                      }`}
                                    >
                                      {log.verified ? 'Unverify' : 'Verify'}
                                    </button>
                                    <button
                                      onClick={() => onDeleteLog(log.id)}
                                      className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                      title="Delete Log"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 3. PAYROLL & REMUNERATION ==================== */}
          {modalTab === 'payroll' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Instructor Payroll & Remuneration Portal</h3>
                  <p className="text-xxs text-slate-400 mt-0.5">Manage contractual payout rates, view monthly statements, and disburse faculty salary.</p>
                </div>
                {simulatedRole === 'admin' && (
                  <button
                    onClick={handleDisbursePayroll}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xxs transition-all shadow-sm cursor-pointer"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Disburse Payout Now</span>
                  </button>
                )}
              </div>

              {/* Estimate Statement Info */}
              <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-850 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Estimated Remuneration Ledger</span>
                    <h4 className="text-sm font-bold text-white mt-1">Current Cycle Statement (June 2026)</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20 text-[9px] font-black uppercase">
                    {teacher.payoutType} Wage model
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-center sm:text-left">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">Estimated Current Pay</span>
                    <span className="text-xl font-black text-emerald-400 block mt-1">₹{currentEstPay.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">Payroll Parameter</span>
                    <span className="text-xs font-bold text-slate-200 block mt-1">
                      {teacher.payoutType === 'Fixed' && `₹${teacher.basePay.toLocaleString()} / month`}
                      {teacher.payoutType === 'Hourly' && `₹${teacher.hourlyRate} / clock-hour`}
                      {teacher.payoutType === 'Per-Session' && `₹${teacher.hourlyRate} / lectured session`}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">Clocked Units (Verified)</span>
                    <span className="text-xs font-bold text-slate-200 block mt-1">
                      {teacher.payoutType === 'Fixed' && `${approvedCount} active service days`}
                      {teacher.payoutType === 'Hourly' && `${totalHours.toFixed(1)} clock-hours`}
                      {teacher.payoutType === 'Per-Session' && `${approvedCount} completed sessions`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Disbursement history ledger */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xxs">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Payroll Disbursement Ledger History</span>
                </div>

                <div className="overflow-x-auto text-xxs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-5 py-3">Disbursement Period</th>
                        <th className="px-5 py-3">Processed Date</th>
                        <th className="px-5 py-3">Payment Mode</th>
                        <th className="px-5 py-3">Bank Ref ID</th>
                        <th className="px-5 py-3 text-right">Disbursed Amount</th>
                        <th className="px-5 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                      {localDisbursements.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-800">{pay.period}</td>
                          <td className="px-5 py-3.5">{pay.date}</td>
                          <td className="px-5 py-3.5">{pay.mode}</td>
                          <td className="px-5 py-3.5 font-mono">{pay.referenceId}</td>
                          <td className="px-5 py-3.5 text-right font-black text-slate-800">₹{pay.amount.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded text-[9px] font-bold">
                              {pay.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 4. SUBJECTS MAPPING ==================== */}
          {modalTab === 'subjects' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Instructor Subjects & Batch Expertise Mapping</h3>
                <p className="text-xxs text-slate-400 mt-0.5">Control courses taught, map academic batches, and customize teaching perimeters.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Expertise listing */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xxs">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-indigo-600" /> Teaching Specialty
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                      <span className="text-xxs text-slate-400 font-bold block uppercase">Primary Focus Area</span>
                      <span className="text-sm font-black text-indigo-900">{teacher.subject} Specialist</span>
                      <p className="text-xxs text-slate-500 font-medium leading-relaxed">
                        Authorized to deliver mock modules, test reviews, and core lecture sessions in this domain.
                      </p>
                    </div>

                    <div className="space-y-1 text-xxs font-semibold">
                      <span className="text-slate-400 uppercase font-black block text-[9px]">Additional Expertises</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['IIT-JEE Advanced Syllabus', 'Mechanics & Kinetics', 'Organic Formulations', 'Problem Solving Mock Coaching'].map(exp => (
                          <span key={exp} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg font-bold">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Batch allocations */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xxs">
                  <h4 className="text-xs font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-600" /> Allocated Batches
                  </h4>
                  <div className="space-y-2">
                    {teacher.batches && teacher.batches.length > 0 ? (
                      teacher.batches.map(bid => {
                        const bObj = batches.find(b => b.id === bid);
                        return (
                          <div key={bid} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-150 text-xxs">
                            <div>
                              <span className="font-extrabold text-slate-800 block">{bObj?.name || bid}</span>
                              <span className="text-slate-400 font-medium">Timetable: {bObj?.schedule || 'Not scheduled'}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-150 rounded text-emerald-700 font-bold">
                              Active Room {bObj?.room || 'Hall A'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-slate-400 italic text-xxs">
                        No active academic batches assigned to this instructor.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 5. TIMETABLE ==================== */}
          {modalTab === 'timetable' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Instructor Weekly Timetable</h3>
                  <p className="text-xxs text-slate-400 mt-0.5">Assigned lecture hours, session periods, and room mappings across running batches.</p>
                </div>
                {simulatedRole === 'admin' && (
                  <button
                    onClick={() => setShowTimetableForm(!showTimetableForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded-xl text-indigo-700 font-bold text-xxs transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Schedule Lecture Slot</span>
                  </button>
                )}
              </div>

              {/* Schedule form */}
              {showTimetableForm && (
                <form onSubmit={handleAddTimetableSlot} className="bg-white border border-indigo-100 rounded-2xl p-5 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase">Schedule New Lecture slot</h4>
                    <button type="button" onClick={() => setShowTimetableForm(false)} className="text-slate-450 hover:text-slate-600"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xxs font-semibold">
                    <div>
                      <label className="block text-slate-400 mb-1">Lecture Day</label>
                      <select value={newTimeDay} onChange={e => setNewTimeDay(e.target.value)} className="w-full p-2 border border-slate-200 bg-white rounded-xl">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Time Slot Range</label>
                      <input type="text" placeholder="e.g. 09:00 AM - 10:30 AM" required value={newTimeSlot} onChange={e => setNewTimeSlot(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Subject taught</label>
                      <input type="text" required value={newTimeSubject} onChange={e => setNewTimeSubject(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Academic Batch</label>
                      <select value={newTimeBatch} onChange={e => setNewTimeBatch(e.target.value)} className="w-full p-2 border border-slate-200 bg-white rounded-xl">
                        <option value="">Select Batch</option>
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Room allocation</label>
                      <input type="text" placeholder="e.g. Hall C" required value={newTimeRoom} onChange={e => setNewTimeRoom(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowTimetableForm(false)} className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xxs text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                    <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xxs font-bold shadow-xs cursor-pointer">Schedule Slot</button>
                  </div>
                </form>
              )}

              {/* Timetable weekly slots registry */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xxs">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Weekly Assigned Lecture Slots</span>
                  <span className="text-xxxxs font-mono text-slate-400">Total Scheduled Slots: {localTimetables.length}</span>
                </div>

                {localTimetables.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 italic text-xxs">
                    No timetabled schedule slots registered for this instructor.
                  </div>
                ) : (
                  <div className="overflow-x-auto text-xxs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="px-5 py-3">Day of Week</th>
                          <th className="px-5 py-3">Lecture Shift Timing</th>
                          <th className="px-5 py-3">Allocated Subject</th>
                          <th className="px-5 py-3">Batch Reference</th>
                          <th className="px-5 py-3">Classroom / Room</th>
                          {simulatedRole === 'admin' && <th className="px-5 py-3 text-right">Delete</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                        {localTimetables.map((slot) => (
                          <tr key={slot.id} className="hover:bg-slate-50/20 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-slate-800">{slot.day}</td>
                            <td className="px-5 py-3.5 font-mono text-slate-700">{slot.time}</td>
                            <td className="px-5 py-3.5">{slot.subject}</td>
                            <td className="px-5 py-3.5 text-indigo-700 font-bold">
                              {batches.find(b => b.id === slot.batchId)?.name || slot.batchId}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">
                                {slot.room}
                              </span>
                            </td>
                            {simulatedRole === 'admin' && (
                              <td className="px-5 py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTimetableSlot(slot.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                  title="Remove Slot"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 6. LEAVE REGISTER ==================== */}
          {modalTab === 'leave' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Instructor Leave Register & Balance</h3>
                  <p className="text-xxs text-slate-400 mt-0.5">Apply for academic leaves, review allowances, and approve pending requests.</p>
                </div>
                <button
                  onClick={() => setShowLeaveForm(!showLeaveForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded-xl text-indigo-700 font-bold text-xxs transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Apply for Leave</span>
                </button>
              </div>

              {/* Leave Balances */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <span className="text-slate-400 text-[9px] font-black uppercase block tracking-wider">Casual Leave Balance</span>
                  <span className="text-lg font-black text-indigo-600 block mt-1">8 / 12 Days Left</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <span className="text-slate-400 text-[9px] font-black uppercase block tracking-wider">Medical Leave Balance</span>
                  <span className="text-lg font-black text-rose-600 block mt-1">9 / 10 Days Left</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <span className="text-slate-400 text-[9px] font-black uppercase block tracking-wider">Earned Leave Balance</span>
                  <span className="text-lg font-black text-emerald-600 block mt-1">14 / 15 Days Left</span>
                </div>
              </div>

              {/* Leave Apply Form */}
              {showLeaveForm && (
                <form onSubmit={handleApplyLeave} className="bg-white border border-indigo-100 rounded-2xl p-5 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase">Apply for Leave</h4>
                    <button type="button" onClick={() => setShowLeaveForm(false)} className="text-slate-450 hover:text-slate-600"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xxs font-semibold">
                    <div>
                      <label className="block text-slate-400 mb-1">Leave Category</label>
                      <select value={newLeaveType} onChange={e => setNewLeaveType(e.target.value)} className="w-full p-2 border border-slate-200 bg-white rounded-xl">
                        <option value="Casual Leave">Casual Leave (CL)</option>
                        <option value="Medical Leave">Medical Leave (ML)</option>
                        <option value="Earned Leave">Earned Leave (EL)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Start Date</label>
                      <input type="date" required value={newLeaveStart} onChange={e => setNewLeaveStart(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">End Date</label>
                      <input type="date" required value={newLeaveEnd} onChange={e => setNewLeaveEnd(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Reason Description</label>
                      <input type="text" placeholder="e.g. Sick Leave, Personal Work" required value={newLeaveReason} onChange={e => setNewLeaveReason(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowLeaveForm(false)} className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xxs text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                    <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xxs font-bold shadow-xs cursor-pointer">Apply Leave</button>
                  </div>
                </form>
              )}

              {/* Leave list registry */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xxs">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Leave Applications Archive Ledger</span>
                </div>

                <div className="overflow-x-auto text-xxs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-5 py-3">Leave Type</th>
                        <th className="px-5 py-3">Start Date</th>
                        <th className="px-5 py-3">End Date</th>
                        <th className="px-5 py-3">Reason / Description</th>
                        <th className="px-5 py-3 text-center">Status</th>
                        {simulatedRole === 'admin' && <th className="px-5 py-3 text-right">Approve Desk</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                      {localLeaves.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-800">{l.type}</td>
                          <td className="px-5 py-3.5">{l.startDate}</td>
                          <td className="px-5 py-3.5">{l.endDate}</td>
                          <td className="px-5 py-3.5 italic text-slate-500 font-medium">{l.reason}</td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              l.status === 'Approved' 
                                ? 'bg-emerald-50 border border-emerald-150 text-emerald-800' 
                                : l.status === 'Rejected'
                                ? 'bg-rose-50 border border-rose-150 text-rose-800'
                                : 'bg-amber-50 border border-amber-150 text-amber-800 animate-pulse'
                            }`}>
                              {l.status}
                            </span>
                          </td>
                          {simulatedRole === 'admin' && (
                            <td className="px-5 py-3.5 text-right">
                              {l.status === 'Pending' ? (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleToggleLeaveStatus(l.id, 'Approved')}
                                    className="px-2 py-0.5 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded font-bold uppercase text-[9px] hover:bg-emerald-100 cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleToggleLeaveStatus(l.id, 'Rejected')}
                                    className="px-2 py-0.5 bg-rose-50 border border-rose-150 text-rose-800 rounded font-bold uppercase text-[9px] hover:bg-rose-100 cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic font-medium">Vetted</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 7. PERFORMANCE INDEX ==================== */}
          {modalTab === 'performance' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Instructor Performance Index & Feedbacks</h3>
                  <p className="text-xxs text-slate-400 mt-0.5">Track student reviews, lecture feedback scores, and performance appraisals.</p>
                </div>
                {simulatedRole === 'admin' && (
                  <button
                    onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded-xl text-indigo-700 font-bold text-xxs transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>File Evaluation Record</span>
                  </button>
                )}
              </div>

              {/* KPI metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xxs">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Classroom Rating</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-indigo-600">{performanceScore}</span>
                    <span className="text-xxs font-bold text-slate-400">/ 10 Rating Index</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${performanceScore * 10}%` }}></div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xxs">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Student Evaluations</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-600">{evaluationsCount}</span>
                    <span className="text-xxs font-bold text-slate-400">filed reviews</span>
                  </div>
                  <p className="text-xxxxs text-slate-450 leading-relaxed font-semibold">
                    Derived from randomized post-lecture evaluation slips.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xxs">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Adherence to Timetable</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-600">98.2%</span>
                    <span className="text-xxs font-bold text-slate-400">purity index</span>
                  </div>
                  <p className="text-xxxxs text-slate-450 leading-relaxed font-semibold">
                    Based on punch in geo-stationary delays and late-markings.
                  </p>
                </div>
              </div>

              {/* Add evaluation form */}
              {showFeedbackForm && (
                <form onSubmit={handleAddFeedback} className="bg-white border border-indigo-100 rounded-2xl p-5 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase">File Administrative Faculty Evaluation</h4>
                    <button type="button" onClick={() => setShowFeedbackForm(false)} className="text-slate-450 hover:text-slate-600"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xxs font-semibold">
                    <div>
                      <label className="block text-slate-400 mb-1">Performance Index Score (1-10)</label>
                      <select value={newFeedbackRating} onChange={e => setNewFeedbackRating(e.target.value)} className="w-full p-2 border border-slate-200 bg-white rounded-xl">
                        {[10,9,8,7,6,5,4,3,2,1].map(sc => (
                          <option key={sc} value={sc}>{sc} / 10</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-slate-400 mb-1">Evaluation & Feedback Comments</label>
                      <input type="text" placeholder="e.g. Fantastic student engagement, punctual check-ins" required value={newFeedbackComment} onChange={e => setNewFeedbackComment(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowFeedbackForm(false)} className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xxs text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                    <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xxs font-bold shadow-xs cursor-pointer">File Record</button>
                  </div>
                </form>
              )}

              {/* Feedbacks list */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-xxs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 block mb-2">Student & Administrative Appraisal Log</span>
                
                <div className="space-y-3 text-xxs">
                  {[
                    { rating: 9, reviewer: 'Principal Cabinet Review', date: '2026-06-30', comments: 'Superb pedagogical style. Feynman diagrams used on boards were highly praised.' },
                    { rating: 10, reviewer: 'Alpha Section Student Poll', date: '2026-06-20', comments: 'Extremely interactive lectures! Core numerical methods explained beautifully.' },
                    { rating: 8, reviewer: 'Administrative Desk Review', date: '2026-06-15', comments: 'Punctual with lesson delivery plans, leaves registered with prior notifications.' }
                  ].map((rev, index) => (
                    <div key={index} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/50 space-y-1.5 font-semibold">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-800">{rev.reviewer}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500 font-bold">★ {rev.rating} / 10</span>
                          <span className="text-slate-400 font-mono text-xxxxs">({rev.date})</span>
                        </div>
                      </div>
                      <p className="text-slate-500 italic font-medium leading-relaxed">"{rev.comments}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 8. DOCUMENTS DOSSIER ==================== */}
          {modalTab === 'documents' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Instructor KYC & Professional Dossier</h3>
                <p className="text-xxs text-slate-400 mt-0.5">Archive credentials, contracts, and uploaded identification documents in the secure portal.</p>
              </div>

              {/* Uploader Simulator */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xxs md:col-span-1 text-xxs">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-indigo-600" /> Upload File Credentials
                  </h4>
                  <form onSubmit={handleSimulatedUpload} className="space-y-3.5 font-semibold">
                    <div>
                      <label className="block text-slate-400 mb-1">Document Category</label>
                      <select value={newDocType} onChange={e => setNewDocType(e.target.value)} className="w-full p-2 border border-slate-200 bg-white rounded-xl">
                        <option value="Resume">Curriculum Vitae (CV)</option>
                        <option value="Degree Certificate">Degree Certificate</option>
                        <option value="Aadhaar Scan">Aadhaar Card Scan</option>
                        <option value="PAN Scan">PAN Card Scan</option>
                        <option value="Experience Letter">Experience Certificate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Custom File Name</label>
                      <input type="text" placeholder="e.g. Richard_Feynman_CV" required value={newDocName} onChange={e => setNewDocName(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl" />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Simulate Upload File</span>
                    </button>
                  </form>
                </div>

                {/* Secure Dossier Archive */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-xxs md:col-span-2 text-xxs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">Secure Dossier Archives</h4>

                  <div className="space-y-2.5">
                    {localDocuments.map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-250/60 font-semibold transition-all">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-indigo-600 shrink-0 shadow-xxs">
                            <FileText className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-800 block truncate">{doc.name}</span>
                            <span className="text-[10px] text-slate-450 block mt-0.5">{doc.type} • Uploaded {doc.uploadedAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => alert(`Simulating file download of ${doc.name}... File downloaded successfully.`)}
                            className="p-1.5 hover:bg-white text-slate-550 hover:text-indigo-600 border border-transparent hover:border-slate-200 rounded-lg cursor-pointer"
                            title="Download Document"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1.5 hover:bg-white text-slate-550 hover:text-rose-600 border border-transparent hover:border-slate-200 rounded-lg cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== 9. COMMUNICATION CENTRE ==================== */}
          {modalTab === 'communication' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Instructor Notification Panel</h3>
                <p className="text-xxs text-slate-400 mt-0.5">Transmit instant circulars, WhatsApp notifications, or email alerts directly to this faculty member.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Dispatch card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xxs md:col-span-1 text-xxs">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase flex items-center gap-1.5">
                    <Send className="h-4 w-4 text-indigo-600" /> Dispatch Circular
                  </h4>
                  <form onSubmit={handleSendComm} className="space-y-3.5 font-semibold">
                    <div>
                      <label className="block text-slate-400 mb-1">Transmission Channel</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'WhatsApp', label: 'WhatsApp', icon: Smartphone },
                          { id: 'SMS', label: 'SMS', icon: MessageSquare },
                          { id: 'Email', label: 'Email', icon: Mail }
                        ].map(ch => {
                          const ChIcon = ch.icon;
                          const selected = commChannel === ch.id;
                          return (
                            <button
                              key={ch.id}
                              type="button"
                              onClick={() => setCommChannel(ch.id as any)}
                              className={`flex flex-col items-center gap-1 p-2 border rounded-xl font-bold cursor-pointer transition-all text-[9px] ${
                                selected 
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xxs' 
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <ChIcon className="h-4 w-4" />
                              <span>{ch.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Notification Template</label>
                      <select 
                        value={commTemplate} 
                        onChange={e => {
                          setCommTemplate(e.target.value);
                          if (e.target.value === 'timetable') {
                            setCommCustomText(`Hi ${teacher.name}, your weekly lecture timeslot has been successfully synchronized on the academic schedule portal.`);
                          } else if (e.target.value === 'payroll') {
                            setCommCustomText(`Dear Dr. Feynman, Your remuneration statement for the current cycle has been computed and bank clearances approved.`);
                          } else {
                            setCommCustomText('');
                          }
                        }} 
                        className="w-full p-2 border border-slate-200 bg-white rounded-xl"
                      >
                        <option value="general">Custom Announcement</option>
                        <option value="timetable">Timetable Update alert</option>
                        <option value="payroll">Payroll disburse notice</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Custom Message Text</label>
                      <textarea
                        rows={3}
                        placeholder="Type message text here..."
                        required
                        value={commCustomText}
                        onChange={e => setCommCustomText(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Transmit Message</span>
                    </button>
                  </form>
                </div>

                {/* History list */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-xxs md:col-span-2 text-xxs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">Dispatch History Archives</h4>

                  <div className="space-y-3">
                    {localCommunications.map((c) => (
                      <div key={c.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5 font-semibold">
                        <div className="flex justify-between items-center text-xxxxs text-slate-400 font-bold uppercase">
                          <span className="flex items-center gap-1">
                            <Smartphone className="h-3 w-3" /> Transmitted via {c.mode}
                          </span>
                          <span>{c.date}</span>
                        </div>
                        <p className="text-slate-600 text-xxs leading-relaxed">"{c.message}"</p>
                        <div className="flex justify-between items-center text-[8px] font-black uppercase">
                          <span className="text-slate-400">Template: {c.templateName || 'Direct Notification'}</span>
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded">
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 flex justify-between items-center shrink-0">
          <span className="text-xxxxs font-mono text-slate-400">Secure Education Management Protocol v6.20</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xxs font-extrabold rounded-xl transition-all cursor-pointer shadow-xxs"
          >
            Close Portal
          </button>
        </div>

      </div>
    </div>
  );
};
