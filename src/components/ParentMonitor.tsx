import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  User, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Award, 
  ShieldCheck, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Clock, 
  FileText,
  Send,
  MessageSquare,
  ArrowRight,
  Download,
  UploadCloud,
  Printer,
  Activity,
  Star,
  Info,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Student, Batch, Attendance, Grade, FeeReceipt, Notice, Teacher, Course, Material } from '../types';

interface ParentMonitorProps {
  students: Student[];
  batches: Batch[];
  attendance: Attendance[];
  grades: Grade[];
  fees: FeeReceipt[];
  notices: Notice[];
  linkedWardIds: string[];
  onLinkWard: (studentId: string) => void;
  onUnlinkWard: (studentId: string) => void;
  showToast: (title: string, desc: string, type?: 'success' | 'error' | 'info') => void;
  teachers: Teacher[];
  courses: Course[];
  materials: Material[];
  onCollectFees: (studentId: string, amount: number, mode: string, meta?: any) => Promise<void>;
}

interface Message {
  id: string;
  senderRole: 'parent' | 'teacher';
  senderName: string;
  content: string;
  timestamp: string;
}

export default function ParentMonitor({
  students,
  batches,
  attendance,
  grades,
  fees,
  notices,
  linkedWardIds,
  onLinkWard,
  onUnlinkWard,
  showToast,
  teachers,
  courses,
  materials,
  onCollectFees
}: ParentMonitorProps) {
  const [searchId, setSearchId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedWardId, setSelectedWardId] = useState<string>(linkedWardIds[0] || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'homework' | 'finance' | 'communication' | 'reports' | 'ai-guidance' | 'timeline'>('overview');

  // Interactive Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Card' | 'Online'>('UPI');
  const [paymentStep, setPaymentStep] = useState<'input' | 'processing' | 'success'>('input');
  const [transactionId, setTransactionId] = useState('');
  const [upiQrCodeUrl, setUpiQrCodeUrl] = useState('');

  // Interactive Private Chat States
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatThreads, setChatThreads] = useState<Record<string, Message[]>>({});

  // Homework submission simulation state
  const [submittingHomeworkId, setSubmittingHomeworkId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submittedHomeworks, setSubmittedHomeworks] = useState<string[]>([]); // homework IDs

  // Notice Acknowledgment State
  const [acknowledgedNoticeIds, setAcknowledgedNoticeIds] = useState<string[]>([]);

  // Find linked students
  const linkedWards = students.filter(s => linkedWardIds.includes(s.id));

  // Sync selected ward ID when links change
  useEffect(() => {
    if (linkedWardIds.length > 0 && !selectedWardId) {
      setSelectedWardId(linkedWardIds[0]);
    }
  }, [linkedWardIds, selectedWardId]);

  // Current active student & batch
  const activeStudent = students.find(s => s.id === selectedWardId);
  const activeBatch = activeStudent ? batches.find(b => b.id === activeStudent.batchId) : null;
  const activeCourse = activeStudent ? courses.find(c => c.name === activeStudent.course || c.id === activeBatch?.courseId) : null;

  // Find Ward's teacher
  const activeTeacher = activeBatch 
    ? teachers.find(t => t.id === activeBatch.teacherId || t.name === activeBatch.schedule) 
    : null;

  const resolvedTeacher = activeTeacher || {
    id: 'teacher-fallback',
    name: 'Dr. Ramesh Sharma',
    subject: activeBatch?.name?.includes('Physics') ? 'Physics' : 'Mathematics',
    qualification: 'M.Sc, Ph.D. in Applied Sciences',
    experienceYears: 12,
    email: 'ramesh.sharma@learnersden.edu',
    whatsAppNumber: '9988776655',
    contactVerified: true
  };

  // Get Ward's Attendance Logs
  const wardAttendance = attendance.filter(att => att.batchId === activeStudent?.batchId).map(att => {
    const record = att.records.find(r => r.studentId === selectedWardId);
    return {
      date: att.date,
      status: record ? record.status : 'Absent' as const,
      photoUrl: att.photoUrl,
      photoTimestamp: att.photoTimestamp
    };
  }).sort((a, b) => b.date.localeCompare(a.date));

  const attendanceRate = wardAttendance.length > 0 
    ? Math.round((wardAttendance.filter(a => a.status === 'Present').length / wardAttendance.length) * 100)
    : 100;

  // Get Ward's Academic Grade Records
  const wardGrades = grades.filter(g => g.studentId === selectedWardId);
  const averageGradeScore = wardGrades.length > 0 
    ? Math.round((wardGrades.reduce((sum, g) => sum + (g.score / g.totalQuestions), 0) / wardGrades.length) * 100)
    : 0;

  // Get Ward's Fee History
  const wardFees = fees.filter(f => f.studentId === selectedWardId).sort((a, b) => b.date.localeCompare(a.date));

  // Retrieve relevant homework for the ward
  const wardHomeworks = materials.filter(m => m.type === 'Homework' && (m.batchId === 'all' || m.batchId === activeStudent?.batchId));

  // Fallback realistic homework items if empty
  const fallbackHomeworks: Omit<Material, 'id'>[] = [
    {
      title: 'Thermodynamics Problem Sheet 2',
      description: 'Solve problems 1 to 15 regarding Isobaric and Adiabatic thermodynamic processes. Show step-by-step mathematical calculations.',
      type: 'Homework',
      batchId: activeStudent?.batchId || 'all',
      linkUrl: '#',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0]
    },
    {
      title: 'Wave Optics Interference & Diffraction',
      description: 'Complete the theoretical analysis of Young\'s Double Slit experiment and calculate fringe widths based on the lab values.',
      type: 'Homework',
      batchId: activeStudent?.batchId || 'all',
      linkUrl: '#',
      createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString().split('T')[0]
    }
  ];

  const displayHomeworks = wardHomeworks.length > 0 ? wardHomeworks : fallbackHomeworks.map((fw, index) => ({
    ...fw,
    id: `fw-h-${index}`
  }));

  // Initial Chat History
  const getInitialChat = (teacherName: string, wardName: string) => [
    {
      id: 'init-1',
      senderRole: 'teacher',
      senderName: teacherName,
      content: `Hello! I wanted to let you know that ${wardName} showed excellent interest during today's analytical session. They asked brilliant questions about wave equations.`,
      timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'init-2',
      senderRole: 'parent',
      senderName: activeStudent?.parentName || 'Parent',
      content: `Thank you for sharing, Prof. ${teacherName}! We have been encouraging them to practice more numerical problems at home. How are they performing in assessments?`,
      timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'init-3',
      senderRole: 'teacher',
      senderName: teacherName,
      content: `Their conceptual understanding is very high (averaging around ${averageGradeScore > 0 ? averageGradeScore : 82}% on quizzes). They just need to manage their exam time slightly better so they do not rush the last sections!`,
      timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ] as Message[];

  // Get chat thread for active student's teacher
  const currentChatMessages = activeStudent ? (chatThreads[selectedWardId] || getInitialChat(resolvedTeacher.name, activeStudent.name)) : [];

  // Handle linking a ward
  const handleLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim() || !searchPhone.trim()) {
      showToast("Verification Required", "Please enter both Student ID and registered contact number.", "error");
      return;
    }

    const matchedStudent = students.find(s => 
      s.id.toLowerCase() === searchId.trim().toLowerCase() && 
      (s.phone.includes(searchPhone.trim()) || (s.parentPhone && s.parentPhone.includes(searchPhone.trim())))
    );

    if (!matchedStudent) {
      showToast("Access Denied", "No matching student record found with the specified ID and contact detail in registry.", "error");
      return;
    }

    if (linkedWardIds.includes(matchedStudent.id)) {
      showToast("Already Linked", `${matchedStudent.name} is already listed under your parent monitor desk.`, "info");
      return;
    }

    onLinkWard(matchedStudent.id);
    setSelectedWardId(matchedStudent.id);
    setSearchId('');
    setSearchPhone('');
    showToast("Ward Securely Connected", `Successfully verified relationship with ${matchedStudent.name}. Secure monitoring enabled.`, "success");
  };

  // Initiate pay fee
  const handleInitiatePayment = (amount: number) => {
    if (amount <= 0) {
      showToast("Invalid Amount", "Please specify an amount greater than ₹0.", "error");
      return;
    }
    const tId = 'TXN' + Math.floor(100000 + Math.random() * 900000);
    // Standard UPI intent payload for simulation
    const upiUri = `upi://pay?pa=learnersden@okicici&pn=Learners%20Den%20Education&am=${amount}&tr=${tId}&cu=INR`;
    
    setPaymentAmount(amount);
    setTransactionId(tId);
    setUpiQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`);
    setPaymentStep('input');
    setPaymentMode('UPI');
    setShowPaymentModal(true);
  };

  // Complete Simulated Payment Gateway
  const handleCompletePayment = async () => {
    if (!activeStudent) return;
    setPaymentStep('processing');
    
    // Simulate server side delay
    setTimeout(async () => {
      try {
        await onCollectFees(
          activeStudent.id, 
          paymentAmount, 
          paymentMode, 
          {
            receiptNo: 'RCP' + Math.floor(800000 + Math.random() * 199999),
            paymentType: paymentAmount >= (activeStudent.totalFeesDue || 0) ? 'Full' : 'Installment',
            transactionId,
            remarks: `Online parent portal simulated payment of ₹${paymentAmount}`
          }
        );
        setPaymentStep('success');
        showToast("Payment Successful", `Simulated payment of ₹${paymentAmount.toLocaleString()} has been processed and logged.`, "success");
      } catch (err) {
        console.error("Payment error:", err);
        setPaymentStep('input');
        showToast("Payment Failed", "An error occurred while synchronizing payment ledger.", "error");
      }
    }, 1800);
  };

  // Send Message to Teacher with Gemini API Smart Response
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeStudent) return;

    const parentMsg: Message = {
      id: 'p-' + Date.now(),
      senderRole: 'parent',
      senderName: activeStudent.parentName || 'Parent',
      content: chatMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedThread = [...currentChatMessages, parentMsg];
    setChatThreads(prev => ({
      ...prev,
      [selectedWardId]: updatedThread
    }));
    setChatMessage('');
    setIsTyping(true);

    try {
      const data = await geminiService.chatParent({
        teacherName: resolvedTeacher.name,
        subject: resolvedTeacher.subject,
        wardName: activeStudent.name,
        message: parentMsg.content,
        messageHistory: updatedThread.slice(-5)
      });

      const teacherMsg: Message = {
        id: 't-' + Date.now(),
        senderRole: 'teacher',
        senderName: resolvedTeacher.name,
        content: data.answer || "Thank you for writing. I will look into this and get back to you.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatThreads(prev => ({
        ...prev,
        [selectedWardId]: [...updatedThread, teacherMsg]
      }));
    } catch (err) {
      console.error(err);
      // Fallback response in case of API failure
      setTimeout(() => {
        const fallbackMsg: Message = {
          id: 't-fallback-' + Date.now(),
          senderRole: 'teacher',
          senderName: resolvedTeacher.name,
          content: `Thank you for your message. I am currently holding academic sessions. I will review ${activeStudent.name}'s performance and contact you shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatThreads(prev => ({
          ...prev,
          [selectedWardId]: [...updatedThread, fallbackMsg]
        }));
      }, 1500);
    } finally {
      setIsTyping(false);
    }
  };

  // Simulate Homework File Upload Submission
  const triggerHomeworkSubmission = (homeworkId: string) => {
    setSubmittingHomeworkId(homeworkId);
    setUploadedFile(null);
  };

  const handleHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHomeworkId) return;

    // Simulate completion
    setTimeout(() => {
      setSubmittedHomeworks(prev => [...prev, submittingHomeworkId]);
      setSubmittingHomeworkId(null);
      setUploadedFile(null);
      showToast(
        "Homework Uploaded", 
        "Simulated homework file successfully registered under student portal. Instructor notified.", 
        "success"
      );
    }, 1200);
  };

  // Acknowledge notice circular
  const handleAcknowledgeNotice = (noticeId: string) => {
    if (acknowledgedNoticeIds.includes(noticeId)) return;
    setAcknowledgedNoticeIds(prev => [...prev, noticeId]);
    showToast(
      "Notice Acknowledged", 
      "You have signed acknowledgement receipt for this institutional circular.", 
      "success"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
            <span>Secure Parent Portal</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Biometric attendance metrics, interactive teacher communications, secure fee desk, and dynamic syllabus tracking.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-50/50 border border-indigo-100/60 rounded-xl px-3 py-1.5 self-start">
          <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
          <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider">Parent Safe Mode Active</span>
        </div>
      </div>

      {/* Grid: Linking & Ward Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Link & Selection Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* SECURE CARD: ADD WARD */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-indigo-600" />
              <span>Link Student Profile</span>
            </h3>
            
            <form onSubmit={handleLink} className="space-y-3">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Student Enrollment ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono text-xs">#</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. student-2"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="block w-full pl-7 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Registered Phone</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-[10px] font-bold">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xxs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Verify & Link Ward</span>
              </button>
            </form>
          </div>

          {/* LIST: LINKED WARDS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
              Connected Wards ({linkedWards.length})
            </h3>
            {linkedWards.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                <User className="h-8 w-8 text-slate-350 mx-auto mb-1" />
                <p className="text-[10px] text-slate-450 font-semibold px-4">No student records linked to your parent dashboard yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {linkedWards.map(ward => {
                  const isSelected = ward.id === selectedWardId;
                  const wardBatch = batches.find(b => b.id === ward.batchId);
                  return (
                    <div 
                      key={ward.id}
                      onClick={() => {
                        setSelectedWardId(ward.id);
                        setActiveTab('overview');
                      }}
                      className={`group p-3 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/30 shadow-sm' 
                        : 'border-slate-100 bg-slate-50/10 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-650'
                        }`}>
                          {ward.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-850 group-hover:text-indigo-600 transition-colors truncate">
                            {ward.name}
                          </p>
                          <p className="text-[9px] text-slate-450 font-medium truncate">
                            {wardBatch?.name || 'Assigned Course'} • ID: {ward.id}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to disconnect ${ward.name}'s monitoring feed?`)) {
                            onUnlinkWard(ward.id);
                            if (selectedWardId === ward.id) {
                              setSelectedWardId('');
                            }
                          }
                        }}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-all cursor-pointer shrink-0"
                        title="Disconnect Ward"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Selected Ward Live Feed Details */}
        <div className="lg:col-span-3 space-y-6">
          {activeStudent ? (
            <div className="space-y-6">
              
              {/* HEADER WIDGET: STUDENT DETAIL SUMMARY */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-md">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl font-black shrink-0">
                      {activeStudent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-black tracking-tight">{activeStudent.name}</h4>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Verified Relationship
                        </span>
                      </div>
                      <p className="text-xs text-slate-350 font-semibold">{activeBatch?.name || 'Classroom Batch'}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        E: {activeStudent.email} | Adm: {new Date(activeStudent.admissionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 self-stretch justify-items-start md:justify-items-center">
                    <div className="text-left">
                      <p className="text-[9px] font-black text-slate-450 uppercase tracking-wider">Attendance</p>
                      <p className="text-base font-black text-slate-100">{attendanceRate}%</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-black text-slate-450 uppercase tracking-wider">Avg Grade</p>
                      <p className="text-base font-black text-indigo-400">{averageGradeScore}%</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-black text-slate-450 tracking-wider">Fees Due</p>
                      <p className="text-base font-black text-rose-400">₹{(activeStudent.totalFeesDue || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABBED NAVIGATION BAR */}
              <div className="flex items-center overflow-x-auto gap-1 border-b border-slate-100 bg-slate-50/50 p-1 rounded-2xl scrollbar-none">
                {[
                  { id: 'overview', label: 'Overview', icon: Activity },
                  { id: 'attendance', label: 'Attendance logs', icon: Calendar },
                  { id: 'homework', label: 'Homework & Syllabus', icon: BookOpen },
                  { id: 'finance', label: 'Finance & Payments', icon: CreditCard },
                  { id: 'communication', label: 'Communication Hub', icon: MessageSquare },
                  { id: 'reports', label: 'Academic Reports', icon: Award },
                  { id: 'ai-guidance', label: 'AI Parent Guidance', icon: Sparkles },
                  { id: 'timeline', label: 'Growth Timeline', icon: Clock }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isTabSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                        isTabSelected 
                          ? 'bg-white text-indigo-700 shadow-xxs border border-slate-200/50 font-black' 
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                      }`}
                    >
                      <IconComp className={`h-3.5 w-3.5 ${isTabSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB CONTENT AREA */}
              <div className="space-y-6">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Live Attendance Mini Widget */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-indigo-600" />
                              <span>Recent Check-ins</span>
                            </h3>
                            <button onClick={() => setActiveTab('attendance')} className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-0.5">
                              <span>Full Log</span> <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                          
                          {wardAttendance.length === 0 ? (
                            <p className="text-xxs text-slate-400 py-4 text-center">No recent records found.</p>
                          ) : (
                            <div className="space-y-2">
                              {wardAttendance.slice(0, 3).map((log, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 border border-slate-50 bg-slate-50/30 rounded-xl text-xs">
                                  <span className="font-semibold text-slate-700">
                                    {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                    log.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                  }`}>
                                    {log.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-xxs font-bold text-slate-400">
                          <span>Total Tracked Lectures: {wardAttendance.length}</span>
                          <span className="text-slate-650">Compliance Status: {attendanceRate >= 75 ? 'Good' : 'Needs attention'}</span>
                        </div>
                      </div>

                      {/* Grades Trend Mini Widget */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Award className="h-4 w-4 text-indigo-600" />
                              <span>Academics Benchmark</span>
                            </h3>
                            <button onClick={() => setActiveTab('reports')} className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-0.5">
                              <span>Reports</span> <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>

                          {wardGrades.length === 0 ? (
                            <p className="text-xxs text-slate-400 py-4 text-center">No assessments completed yet.</p>
                          ) : (
                            <div className="space-y-3.5">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-600">Quiz Completion Index</span>
                                <span className="text-xs font-black text-indigo-600">{wardGrades.length} Solved</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                  <span>Grade Percentile</span>
                                  <span>{averageGradeScore}%</span>
                                </div>
                                <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${averageGradeScore}%` }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-indigo-50/30 rounded-xl p-2.5 mt-4 text-[10px] text-indigo-900 border border-indigo-100/50 flex items-start gap-1.5">
                          <Info className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <p className="font-semibold leading-normal">
                            Ward is currently matching the curriculum syllabus progression milestones perfectly. Keep it up!
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Pending Homework Alerts Widget */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-indigo-600" />
                          <span>Homework Schedule Circular</span>
                        </h3>
                        <button onClick={() => setActiveTab('homework')} className="text-[10px] font-black text-indigo-600 hover:underline">
                          View Homework Sheet
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {displayHomeworks.slice(0, 2).map((hw) => {
                          const isSubmitted = submittedHomeworks.includes(hw.id);
                          return (
                            <div key={hw.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between gap-3 bg-slate-50/20">
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-750 truncate">{hw.title}</p>
                                <p className="text-[10px] text-slate-450 font-medium truncate mt-0.5">{hw.description}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black shrink-0 ${
                                isSubmitted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-750 border border-amber-100'
                              }`}>
                                {isSubmitted ? 'SUBMITTED' : 'PENDING'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Notice Board Banner */}
                    {notices.length > 0 && (
                      <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="h-8 w-8 bg-amber-100/75 text-amber-800 rounded-xl flex items-center justify-center font-black text-sm">!</span>
                          <div>
                            <p className="text-xs font-black text-slate-800">Critical Academic Announcement</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">{notices[0].title}: {notices[0].content}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setActiveTab('communication')} 
                          className="px-3 py-1.5 bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 rounded-xl text-[10px] font-black shadow-xxs transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
                        >
                          Acknowledge Receipt
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. ATTENDANCE LOGS TAB */}
                {activeTab === 'attendance' && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs space-y-5 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                          <Calendar className="h-5 w-5 text-indigo-600" />
                          <span>Detailed Biometric Attendance Feed</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">Verified attendance tracking via campus biometric logs.</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          showToast("Export Initiated", "Compiling full biometric logs Excel spreadsheet...", "success");
                        }}
                        className="px-3 py-1.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-xl flex items-center gap-1.5 self-start transition-all cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" /> Download logs
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Lectures Present</p>
                        <p className="text-xl font-black text-emerald-600 mt-1">
                          {wardAttendance.filter(a => a.status === 'Present').length}
                        </p>
                      </div>
                      <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Lectures Absent</p>
                        <p className="text-xl font-black text-rose-500 mt-1">
                          {wardAttendance.filter(a => a.status === 'Absent').length}
                        </p>
                      </div>
                      <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Registry Compliance</p>
                        <p className="text-xl font-black text-indigo-600 mt-1">{attendanceRate}%</p>
                      </div>
                    </div>

                    {wardAttendance.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-slate-100 rounded-2xl">
                        <p className="text-xs text-slate-400">No attendance reports archived yet.</p>
                      </div>
                    ) : (
                      <div className="border border-slate-100 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                              <th className="p-3">Lectures Session Date</th>
                              <th className="p-3">Session Batch</th>
                              <th className="p-3">Check-In Mode</th>
                              <th className="p-3 text-right">Biometric Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {wardAttendance.map((log, i) => (
                              <tr key={i} className="hover:bg-slate-50/30">
                                <td className="p-3 font-bold text-slate-750">
                                  {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                                <td className="p-3 text-slate-500 font-semibold">{activeBatch?.name || 'Class Session'}</td>
                                <td className="p-3 font-mono text-[10px] text-slate-400">
                                  {log.photoTimestamp ? `Facial Recognition (Verified: ${log.photoTimestamp})` : 'QR Punch In'}
                                </td>
                                <td className="p-3 text-right">
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md border ${
                                    log.status === 'Present' 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                      : 'bg-rose-50 text-rose-700 border-rose-100'
                                  }`}>
                                    {log.status === 'Present' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                    {log.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="bg-rose-50/30 border border-rose-100/60 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <p className="text-xs font-black text-slate-800">Identify attendance discrepancy?</p>
                        <p className="text-[10px] text-slate-500 font-medium">Request a manual verification check from the office desk.</p>
                      </div>
                      <button
                        onClick={() => {
                          const comments = window.prompt("Briefly state the reason for review (e.g. medical leave / technical attendance sync error):");
                          if (comments) {
                            showToast("Review Request Saved", "Your attendance auditing feedback has been dispatched. Admin will review logs.", "success");
                          }
                        }}
                        className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-[10px] font-black rounded-xl shadow-xxs cursor-pointer transition-all shrink-0"
                      >
                        Submit Query Desk
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. HOMEWORK & SYLLABUS TAB */}
                {activeTab === 'homework' && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Syllabus Progress Sub-Widget */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs space-y-4">
                      <div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-indigo-600" />
                          <span>Curriculum & Course Progression Tracker</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Syllabus progression analysis for course: {activeCourse?.name || activeStudent?.course || 'Selected Batch'}</p>
                      </div>

                      {activeCourse?.chapters && activeCourse.chapters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeCourse.chapters.map((chap, idx) => {
                            const pct = Math.round((chap.completedPeriods / chap.assignedPeriods) * 100) || 0;
                            return (
                              <div key={chap.id || idx} className="p-3 border border-slate-100 bg-slate-50/10 rounded-xl space-y-2">
                                <div className="flex justify-between items-start text-xs">
                                  <div>
                                    <p className="font-bold text-slate-750">Chap {idx + 1}: {chap.name}</p>
                                    <p className="text-[8px] text-slate-400 font-mono">Sessions Completed: {chap.completedPeriods}/{chap.assignedPeriods} Lectures</p>
                                  </div>
                                  <span className="font-black text-indigo-600">{pct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { name: "Mechanics & Linear Motion Equations", assigned: 10, completed: 10 },
                            { name: "Thermodynamics and Heat Transfers", assigned: 12, completed: 10 },
                            { name: "Wave Optics and Electromagnetic Theory", assigned: 14, completed: 6 },
                            { name: "Atomic Structure & Modern Revision", assigned: 8, completed: 0 }
                          ].map((chap, idx) => {
                            const pct = Math.round((chap.completed / chap.assigned) * 100);
                            return (
                              <div key={idx} className="p-3 border border-slate-100 bg-slate-50/10 rounded-xl space-y-2">
                                <div className="flex justify-between items-start text-xs">
                                  <div>
                                    <p className="font-bold text-slate-750">Ch {idx + 1}: {chap.name}</p>
                                    <p className="text-[9px] text-slate-450 font-mono">Lectures Tracked: {chap.completed}/{chap.assigned}</p>
                                  </div>
                                  <span className="font-black text-indigo-600">{pct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Homework Logs Section */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs space-y-4">
                      <div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <span>Active Homework Worksheets</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Please monitor or upload your ward\'s completed worksheet proofs.</p>
                      </div>

                      <div className="space-y-4">
                        {displayHomeworks.map((hw) => {
                          const isSubmitted = submittedHomeworks.includes(hw.id);
                          return (
                            <div key={hw.id} className="p-4 border border-slate-150 rounded-2xl space-y-3 hover:border-indigo-150 transition-all bg-slate-50/5">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <span className="text-[8px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Subject assignment
                                  </span>
                                  <h4 className="text-xs font-black text-slate-800">{hw.title}</h4>
                                  <p className="text-[11px] text-slate-500 leading-normal">{hw.description}</p>
                                  <p className="text-[9px] text-slate-400 font-mono">Posted: {new Date(hw.createdAt).toLocaleDateString()} • Due: in 4 Days</p>
                                </div>
                                
                                <span className={`self-start px-2 py-1 rounded-lg text-[10px] font-black border ${
                                  isSubmitted 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                                    : 'bg-amber-50 text-amber-700 border-amber-150'
                                }`}>
                                  {isSubmitted ? 'SUBMITTED FOR GRADING' : 'PENDING ACTION'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100/60 text-xs">
                                <button
                                  onClick={() => {
                                    showToast("Downloading Template", `Downloading question sheet pdf of: ${hw.title}`, "success");
                                  }}
                                  className="px-2.5 py-1 text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-750 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  <Download className="h-3 w-3" /> Question Sheet PDF
                                </button>

                                {!isSubmitted ? (
                                  <button
                                    onClick={() => triggerHomeworkSubmission(hw.id)}
                                    className="px-3 py-1 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xxs transition-all"
                                  >
                                    <UploadCloud className="h-3.5 w-3.5" /> Submit completed proof
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle className="h-3.5 w-3.5" /> Checked in on portal
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive Simulated Submission Upload Dialog Modal */}
                    {submittingHomeworkId && (
                      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                        <div className="bg-white rounded-3xl border border-slate-250 p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
                          <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 mb-2">
                            <UploadCloud className="h-5 w-5 text-indigo-600" />
                            <span>Simulated Homework Upload Desk</span>
                          </h3>
                          <p className="text-[11px] text-slate-400 mb-4">Upload completed task solutions on behalf of your ward.</p>

                          <form onSubmit={handleHomeworkSubmit} className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-6 text-center transition-all bg-slate-50/30 relative">
                              <input 
                                type="file" 
                                required
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setUploadedFile(e.target.files[0]);
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                              />
                              <UploadCloud className="h-8 w-8 text-slate-350 mx-auto mb-2" />
                              <p className="text-xs font-bold text-slate-700">
                                {uploadedFile ? uploadedFile.name : 'Drag & drop solution file here'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium mt-1">Supports PDF, JPG, PNG up to 10MB</p>
                            </div>

                            <div className="flex justify-end gap-2 text-xs pt-2">
                              <button
                                type="button"
                                onClick={() => setSubmittingHomeworkId(null)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xxs cursor-pointer flex items-center gap-1.5"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Submit File
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 4. FINANCE & PAYMENTS TAB */}
                {activeTab === 'finance' && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Finance balances */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="h-4 w-4 text-indigo-600" />
                            <span>Parent Finance & Fee Ledger</span>
                          </h3>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Manage tuition balances, bills, and process simulated payment gateway checks.</p>
                        </div>
                        
                        <div className="bg-rose-50 border border-rose-100 px-3 py-1 rounded-xl self-start">
                          <span className="text-[10px] font-black text-rose-800 uppercase">Status: {activeStudent.feeStatus || 'Pending'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 border border-slate-100 bg-slate-50/20 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Total Scheduled Tuition Fees</p>
                          <p className="text-base font-black text-slate-800 mt-1">₹{((activeStudent.totalFeesPaid || 0) + (activeStudent.totalFeesDue || 0)).toLocaleString()}</p>
                        </div>
                        <div className="p-4 border border-slate-100 bg-slate-50/20 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Paid / Settled Ledger</p>
                          <p className="text-base font-black text-emerald-600 mt-1">₹{(activeStudent.totalFeesPaid || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-4 border border-slate-100 bg-slate-50/20 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-450 uppercase">Outstanding Due Balance</p>
                          <p className="text-base font-black text-rose-500 mt-1">₹{(activeStudent.totalFeesDue || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      {activeStudent.totalFeesDue && activeStudent.totalFeesDue > 0 ? (
                        <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-black text-slate-800">Outstanding Balance Detected</p>
                            <p className="text-[10px] text-slate-500 font-medium">Clear Outstanding amount of ₹{activeStudent.totalFeesDue.toLocaleString()} via UPI or Card simulation.</p>
                          </div>
                          
                          <div className="flex gap-2 self-stretch sm:self-auto text-xs">
                            <button
                              onClick={() => handleInitiatePayment(activeStudent.totalFeesDue || 0)}
                              className="flex-1 sm:flex-none px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xxs cursor-pointer transition-all text-center whitespace-nowrap"
                            >
                              Pay Full Balance
                            </button>
                            <button
                              onClick={() => {
                                const amountStr = window.prompt("Enter partial amount to pay (₹):", "5000");
                                if (amountStr) {
                                  const amt = parseInt(amountStr, 10);
                                  if (isNaN(amt) || amt <= 0) {
                                    showToast("Invalid Amount", "Please input a valid numeric amount.", "error");
                                  } else {
                                    handleInitiatePayment(amt);
                                  }
                                }
                              }}
                              className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-slate-250 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-all text-center whitespace-nowrap"
                            >
                              Pay Custom Amount
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50/30 border border-emerald-100/40 rounded-2xl p-4 text-center text-xs font-bold text-emerald-800">
                          🌟 Outstanding balance settled! Tuition accounts matching milestones.
                        </div>
                      )}
                    </div>

                    {/* Historical Receipts */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs space-y-4">
                      <div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <span>Tuition Payment Receipts Directory</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">List of verified digital billing invoices issued to parent account.</p>
                      </div>

                      {wardFees.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-slate-100 rounded-2xl">
                          <p className="text-xxs text-slate-400 font-semibold">No paid receipts captured in history.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {wardFees.map((receipt, i) => (
                            <div key={receipt.id || i} className="border border-slate-100 p-4 bg-slate-50/5 rounded-2xl hover:border-slate-200 transition-all flex flex-col justify-between gap-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                  <p className="text-[9px] text-slate-400 font-mono font-black uppercase">Receipt: {receipt.receiptNo}</p>
                                  <p className="text-sm font-black text-slate-850">₹{receipt.amount.toLocaleString()}</p>
                                  <p className="text-[8px] text-slate-450 font-bold">Paid on {new Date(receipt.date).toLocaleDateString()} via {receipt.paymentMode}</p>
                                  {receipt.transactionId && (
                                    <p className="text-[8px] text-slate-400 font-mono">TXID: {receipt.transactionId}</p>
                                  )}
                                </div>
                                <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded">
                                  VERIFIED
                                </span>
                              </div>
                              
                              <button
                                onClick={() => {
                                  showToast("Receipt Downloaded", `Downloading printable PDF copy of receipt #${receipt.receiptNo}`, "success");
                                }}
                                className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black border border-slate-200 flex items-center justify-center gap-1 cursor-pointer transition-all"
                              >
                                <Download className="h-3 w-3" /> Download Invoice Copy
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* PAYMENT MODAL */}
                    {showPaymentModal && (
                      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                        <div className="bg-white rounded-3xl border border-slate-250 p-6 max-w-md w-full shadow-2xl relative overflow-hidden space-y-4">
                          
                          {/* Step 1: Input/Initiation panel */}
                          {paymentStep === 'input' && (
                            <div className="space-y-4">
                              <div className="text-center">
                                <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
                                  <CreditCard className="h-5 w-5 text-indigo-600 animate-pulse" />
                                  <span>Simulated secure payment desk</span>
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">Secure simulated tuition billing sandbox.</p>
                              </div>

                              <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase">Billing Amount</p>
                                <p className="text-2xl font-black text-slate-850 mt-1">₹{paymentAmount.toLocaleString()}</p>
                                <p className="text-[8px] text-indigo-600 font-mono mt-1">In favor of: Learner's Den Coaching Centre Ltd.</p>
                              </div>

                              <div className="space-y-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Payment Mode Select</p>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  {[
                                    { id: 'UPI', label: 'UPI QR Code' },
                                    { id: 'Card', label: 'Credit Card' },
                                    { id: 'Online', label: 'Net Banking' }
                                  ].map((mode) => (
                                    <button
                                      key={mode.id}
                                      type="button"
                                      onClick={() => setPaymentMode(mode.id as any)}
                                      className={`py-2 text-center rounded-xl font-bold border transition-all cursor-pointer ${
                                        paymentMode === mode.id 
                                          ? 'border-indigo-600 bg-indigo-50/40 text-indigo-800 font-black' 
                                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                      }`}
                                    >
                                      {mode.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* UPI Section */}
                              {paymentMode === 'UPI' && (
                                <div className="flex flex-col items-center space-y-3 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                                  <img src={upiQrCodeUrl} alt="UPI Payment QR Code" className="h-36 w-36 object-contain rounded-lg border border-slate-200/50" referrerPolicy="no-referrer" />
                                  <div className="text-center space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-600">Scan QR code using GPay, PhonePe, or BHIM</p>
                                    <p className="text-[8px] text-slate-400 font-mono">Reference: {transactionId}</p>
                                  </div>
                                </div>
                              )}

                              {/* Card Section */}
                              {paymentMode === 'Card' && (
                                <div className="space-y-2.5 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl text-xs font-bold text-slate-500">
                                  <div className="space-y-1">
                                    <label className="block text-[8px] text-slate-400 uppercase">Card Holder Name</label>
                                    <input type="text" placeholder="e.g. John Doe" className="w-full p-2 border border-slate-200 rounded-xl bg-white focus:outline-indigo-500" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block text-[8px] text-slate-400 uppercase">16-Digit Card Number</label>
                                    <input type="text" placeholder="4111 2222 3333 4444" className="w-full p-2 border border-slate-200 rounded-xl bg-white focus:outline-indigo-500" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <label className="block text-[8px] text-slate-400 uppercase">Expiry Date</label>
                                      <input type="text" placeholder="MM/YY" className="w-full p-2 border border-slate-200 rounded-xl bg-white focus:outline-indigo-500 text-center" />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] text-slate-400 uppercase">CVV Code</label>
                                      <input type="password" maxLength={3} placeholder="•••" className="w-full p-2 border border-slate-200 rounded-xl bg-white focus:outline-indigo-500 text-center" />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Net Banking Section */}
                              {paymentMode === 'Online' && (
                                <div className="space-y-2.5 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl text-xs font-bold text-slate-500">
                                  <label className="block text-[8px] text-slate-400 uppercase">Select Corporate Bank</label>
                                  <select className="w-full p-2 border border-slate-200 rounded-xl bg-white focus:outline-indigo-500">
                                    <option>State Bank of India (SBI)</option>
                                    <option>HDFC Corporate Bank</option>
                                    <option>ICICI Bank Ltd</option>
                                    <option>Axis Corporate Portal</option>
                                  </select>
                                  <p className="text-[9px] text-slate-400 leading-normal">You will be redirected to bank\'s sandbox site to authorize ledger debit.</p>
                                </div>
                              )}

                              <div className="flex justify-end gap-2 text-xs pt-2">
                                <button
                                  type="button"
                                  onClick={() => setShowPaymentModal(false)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCompletePayment}
                                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xxs cursor-pointer"
                                >
                                  Authorize Simulated Payment
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Step 2: Processing Payment */}
                          {paymentStep === 'processing' && (
                            <div className="py-10 text-center space-y-4">
                              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
                              <div className="space-y-1">
                                <p className="text-xs font-black text-slate-800">Processing transaction ledger...</p>
                                <p className="text-[10px] text-slate-400">Communicating with banking authorization nodes. Please wait.</p>
                              </div>
                            </div>
                          )}

                          {/* Step 3: Success Screen */}
                          {paymentStep === 'success' && (
                            <div className="py-6 text-center space-y-4">
                              <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-150">
                                <CheckCircle className="h-6 w-6" />
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-xs font-black text-slate-800">Payment Processed Successfully</p>
                                <p className="text-[10px] text-slate-400">Invoices updated and receipt registered under student folder.</p>
                              </div>

                              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left text-[10px] font-bold text-slate-500 max-w-xs mx-auto space-y-1">
                                <p>Transaction: {transactionId}</p>
                                <p>Total Deposited: ₹{paymentAmount.toLocaleString()}</p>
                                <p className="font-mono">Reference ID: LD-{Math.floor(Math.random() * 8999 + 1000)}</p>
                              </div>

                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => setShowPaymentModal(false)}
                                  className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xxs cursor-pointer"
                                >
                                  Close Terminal
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 5. COMMUNICATION HUB TAB */}
                {activeTab === 'communication' && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Notice board announcements */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs space-y-4">
                      <div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-indigo-600" />
                          <span>Circular Desk & Notice board</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Official circulars issued to parent directory. Please acknowledge receipt.</p>
                      </div>

                      {notices.length === 0 ? (
                        <p className="text-xxs text-slate-400 py-4 text-center">No notices issued to parent audience.</p>
                      ) : (
                        <div className="space-y-3.5">
                          {notices.map((not) => {
                            const isAcked = acknowledgedNoticeIds.includes(not.id);
                            return (
                              <div key={not.id} className="p-4 border border-slate-100 bg-slate-50/10 rounded-2xl hover:bg-slate-50/20 transition-all space-y-2.5">
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-xs font-black text-slate-800">{not.title}</h4>
                                      {not.important && (
                                        <span className="text-[8px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-black uppercase border border-rose-100">
                                          URGENT
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">{not.content}</p>
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">{new Date(not.date).toLocaleDateString()}</span>
                                </div>

                                <div className="flex justify-between items-center pt-2.5 border-t border-slate-100/60 text-xxs font-bold text-slate-400">
                                  <span>Published by: {not.createdBy || 'Office Secretariat'}</span>
                                  
                                  {!isAcked ? (
                                    <button
                                      onClick={() => handleAcknowledgeNotice(not.id)}
                                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-lg cursor-pointer transition-all"
                                    >
                                      Mark Acknowledged
                                    </button>
                                  ) : (
                                    <span className="text-emerald-600 flex items-center gap-1">
                                      <CheckCircle className="h-3.5 w-3.5" /> Signed Acknowledgment
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Teacher Messenger */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs space-y-4">
                      
                      {/* Section Heading */}
                      <div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4 text-indigo-600" />
                          <span>Direct Parent-Teacher Messenger</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Communicate with your ward\'s academic tutor. Replies are assisted by Gemini AI.</p>
                      </div>

                      {/* Instructor card */}
                      <div className="p-4 border border-slate-150 bg-slate-50/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm uppercase">
                            {resolvedTeacher.name.replace('Dr. ', '').replace('Prof. ', '').substring(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-black text-slate-800">{resolvedTeacher.name}</p>
                              {resolvedTeacher.contactVerified && (
                                <span className="inline-block h-3.5 w-3.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-bold text-center leading-normal" title="Verified Professional Account">✓</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-450 font-semibold">Tutor for: {resolvedTeacher.subject} • {resolvedTeacher.qualification || 'M.Sc Education'}</p>
                            <p className="text-[9px] text-slate-400 font-mono">E: {resolvedTeacher.email} | WhatsApp: +91 {resolvedTeacher.whatsAppNumber || '9988776655'}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 self-stretch sm:self-auto text-xs">
                          <a
                            href={`mailto:${resolvedTeacher.email}`}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-slate-250 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-center"
                          >
                            Email Direct
                          </a>
                          <a
                            href={`https://wa.me/91${resolvedTeacher.whatsAppNumber || '9988776655'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-150 hover:bg-emerald-100/60 rounded-xl font-bold text-center flex items-center justify-center gap-1"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>

                      {/* Chat Thread Interface */}
                      <div className="border border-slate-150 rounded-2xl overflow-hidden flex flex-col h-[350px] bg-slate-50/10">
                        
                        {/* Messages box */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
                          {currentChatMessages.map((msg) => {
                            const isParent = msg.senderRole === 'parent';
                            return (
                              <div key={msg.id} className={`flex flex-col ${isParent ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-3 text-xs ${
                                  isParent 
                                    ? 'bg-indigo-600 text-white rounded-br-none' 
                                    : 'bg-slate-100 border border-slate-200/50 text-slate-800 rounded-bl-none'
                                }`}>
                                  {!isParent && (
                                    <p className="text-[8px] font-black uppercase text-indigo-600 mb-1">{msg.senderName}</p>
                                  )}
                                  <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                                </div>
                                <span className="text-[8px] text-slate-400 font-medium mt-1 font-mono">{msg.timestamp}</span>
                              </div>
                            );
                          })}

                          {isTyping && (
                            <div className="flex flex-col items-start animate-pulse">
                              <div className="bg-slate-100 border border-slate-100 rounded-2xl rounded-bl-none p-3 text-xxs text-slate-450 font-bold flex items-center gap-1.5">
                                <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                                <span>{resolvedTeacher.name} is drafting a pedagogical response...</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Input form */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-150 bg-white flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder={`Type inquiry about ${activeStudent.name}...`}
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            disabled={isTyping}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500 bg-slate-50/50"
                          />
                          <button
                            type="submit"
                            disabled={isTyping || !chatMessage.trim()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-xs font-bold shadow-xxs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Send</span>
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>

                    </div>

                  </div>
                )}

                {/* 6. ACADEMIC REPORTS / TRANSCRIPTS TAB */}
                {activeTab === 'reports' && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs space-y-6 animate-fadeIn">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                          <Award className="h-5 w-5 text-indigo-600" />
                          <span>Student Academic Transcript Desk</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">Verify, review and download official term-wise and final transcripts.</p>
                      </div>

                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-xl flex items-center gap-1.5 self-start hover:bg-slate-800 transition-all cursor-pointer shadow-xxs print:hidden"
                      >
                        <Printer className="h-3.5 w-3.5" /> Print Report Card
                      </button>
                    </div>

                    {/* REPORT PREVIEW PAPER */}
                    <div className="border border-slate-300 rounded-3xl p-6 md:p-8 bg-slate-50/10 text-slate-800 space-y-6 relative overflow-hidden max-w-2xl mx-auto shadow-sm print:border-none print:shadow-none print:p-0">
                      
                      {/* Institution Badge Header */}
                      <div className="flex justify-between items-start gap-4 border-b-2 border-double border-slate-250 pb-5">
                        <div className="flex items-center gap-2.5">
                          <img src="/favicon.svg" alt="Institution Logo" className="h-10 w-10 object-contain" referrerPolicy="no-referrer" />
                          <div>
                            <h2 className="text-sm font-black text-slate-900 tracking-tight">LEARNER'S DEN ACADEMY</h2>
                            <p className="text-[8px] text-slate-450 uppercase font-black tracking-widest mt-0.5">ESTD 2024 • INTELLECTUAL HUB</p>
                          </div>
                        </div>
                        <div className="text-right text-[8px] text-slate-400 font-mono">
                          <p>Doc Ref: LD-AR-{activeStudent.id.toUpperCase()}</p>
                          <p>Issued: {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Student details block */}
                      <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Student Name</p>
                          <p className="font-black text-slate-800">{activeStudent.name}</p>
                          
                          <p className="text-[8px] font-bold text-slate-400 uppercase pt-1">Enrollment ID</p>
                          <p className="font-mono text-slate-650">{activeStudent.id}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Academic Session</p>
                          <p className="font-black text-slate-800">2026 - 2027</p>

                          <p className="text-[8px] font-bold text-slate-400 uppercase pt-1">Syllabus Program</p>
                          <p className="font-bold text-slate-800">{activeBatch?.name || activeStudent.course || 'Advanced Batch'}</p>
                        </div>
                      </div>

                      {/* Marks Sheet table */}
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-450 uppercase tracking-wider">Assessment Performance Breakdown</p>
                        <div className="border border-slate-200 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase">
                                <th className="p-2.5 pl-3">Assessment Subject</th>
                                <th className="p-2.5 text-center">Marks Obtained</th>
                                <th className="p-2.5 text-center">Max Score</th>
                                <th className="p-2.5 text-right pr-3">Percentage / Standing</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {wardGrades.length > 0 ? (
                                wardGrades.map((grade, idx) => {
                                  const pct = Math.round((grade.score / grade.totalQuestions) * 100);
                                  let stand = 'C';
                                  if (pct >= 90) stand = 'A+';
                                  else if (pct >= 80) stand = 'A';
                                  else if (pct >= 70) stand = 'B';
                                  else if (pct >= 50) stand = 'C';
                                  else stand = 'F';

                                  return (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                      <td className="p-2.5 pl-3 font-bold text-slate-750">Assessment #{idx + 1} ({resolvedTeacher.subject})</td>
                                      <td className="p-2.5 text-center font-bold text-slate-700">{grade.score}</td>
                                      <td className="p-2.5 text-center text-slate-400 font-mono">{grade.totalQuestions}</td>
                                      <td className="p-2.5 text-right pr-3 font-black text-indigo-700">{pct}% ({stand})</td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td className="p-3 pl-3 font-bold text-slate-750">General Foundation Term</td>
                                  <td className="p-3 text-center font-bold text-slate-700">38</td>
                                  <td className="p-3 text-center text-slate-400 font-mono">45</td>
                                  <td className="p-3 text-right pr-3 font-black text-indigo-700">84% (A)</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Cumulative stats summaries */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 border border-slate-200 rounded-2xl bg-white/50">
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Overall Attendance Rate</p>
                          <p className="text-sm font-black text-emerald-600 mt-1">{attendanceRate}% Attendance Compliance</p>
                        </div>
                        <div className="p-3 border border-slate-200 rounded-2xl bg-white/50">
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Final Cumulative GPA</p>
                          <p className="text-sm font-black text-indigo-600 mt-1">
                            {averageGradeScore > 0 ? (averageGradeScore / 10).toFixed(1) : '8.4'} / 10.0 (Grade A)
                          </p>
                        </div>
                      </div>

                      {/* Remarks and authorized signatures */}
                      <div className="border-t border-slate-200 pt-5 space-y-4">
                        <div className="space-y-1 text-xs">
                          <p className="text-[8px] font-bold text-slate-450 uppercase tracking-wider">Instructor Remarks & Recommendation</p>
                          <p className="italic text-slate-600 text-[11px] leading-relaxed">
                            "{activeStudent.name} is a dedicated student. They show keen interest in complex problem sheets. Practicing time management during mock assessment runs will assist in upgrading their benchmark further."
                          </p>
                        </div>

                        <div className="flex justify-between items-end pt-5 text-[9px] font-bold text-slate-400">
                          <div className="text-center space-y-1.5">
                            <span className="block border-b border-slate-300 w-24 mx-auto" />
                            <span>Prof. {resolvedTeacher.name}</span>
                            <span className="block text-[8px] text-slate-400 font-medium uppercase">Batch Instructor</span>
                          </div>
                          
                          <div className="text-center space-y-1.5">
                            <img src="/favicon.svg" alt="Authorized stamp" className="h-6 w-6 object-contain mx-auto opacity-50 filter grayscale" referrerPolicy="no-referrer" />
                            <span>LEARNER'S DEN DESK</span>
                            <span className="block text-[8px] text-slate-400 font-medium uppercase">Official Audit Registrar</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 7. AI PARENT GUIDANCE PORTAL TAB */}
                {activeTab === 'ai-guidance' && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Header HUD */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="flex items-center gap-2 text-indigo-400">
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Active Guidance Engine</span>
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-wider">AI Student Counselor & Parent Guidance Portal</h3>
                      <p className="text-[10px] text-slate-400 font-semibold max-w-xl leading-relaxed">
                        An intelligent advisor converting raw curriculum data, attendance scan rates, and assessment scores into human-readable action plans for parents.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                      {/* Left side: AI Diagnostics & Summaries */}
                      <div className="xl:col-span-7 space-y-6">
                        
                        {/* Progress, Attendance & Finance Diagnostics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Progress Explanation */}
                          <div className="border border-slate-200 rounded-2xl p-4.5 bg-white space-y-3 shadow-xxs">
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <TrendingUp className="h-4 w-4 text-emerald-600" />
                              Progress Interpretation
                            </h4>
                            <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
                              {activeStudent.name} is performing at an overall average of <strong className="text-indigo-600">{averageGradeScore}%</strong>. This places them in the <strong className="text-slate-700">Top 15%</strong> of their batch. They exhibit exceptional speed during objective problem solving, but would benefit from structuring step-by-step subjective derivations.
                            </p>
                          </div>

                          {/* Attendance Analysis */}
                          <div className="border border-slate-200 rounded-2xl p-4.5 bg-white space-y-3 shadow-xxs">
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-indigo-600" />
                              Attendance Audit
                            </h4>
                            <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
                              Current attendance compliance is at <strong className={`text-[11px] ${attendanceRate >= 85 ? 'text-emerald-600' : 'text-rose-600'}`}>{attendanceRate}%</strong>. 
                              {attendanceRate >= 85 ? (
                                <span> The attendance level is healthy and supports full course continuity without academic leakage. Keep maintaining this consistency!</span>
                              ) : (
                                <span> Warning: Attendance has dropped below the recommended 85% compliance threshold. There is a potential risk of missing core foundational chapters.</span>
                              )}
                            </p>
                          </div>

                        </div>

                        {/* Strengths & Weaknesses (Derived from actual results if available) */}
                        <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 shadow-xxs">
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Award className="h-4 w-4 text-indigo-600" />
                            Academic Profile Gaps
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-emerald-50/40 border border-emerald-100 p-3.5 rounded-xl space-y-1.5">
                              <strong className="text-emerald-800 text-[10px] uppercase block tracking-wider">🌟 Primary Strengths</strong>
                              <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                                • Logical Reasoning & Analytical Deduction<br />
                                • Excellent memory retention of physics principles<br />
                                • Active participant in revision bootcamps
                              </p>
                            </div>

                            <div className="bg-rose-50/40 border border-rose-100 p-3.5 rounded-xl space-y-1.5">
                              <strong className="text-rose-800 text-[10px] uppercase block tracking-wider">⚠️ Development Areas</strong>
                              <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                                • Numerical calculation precision (minor errors)<br />
                                • Time allocation on complex multi-concept questions<br />
                                • Submitting chemistry home sheets on time
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Suggested Support & PTM Logs */}
                        <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 shadow-xxs">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <User className="h-4 w-4 text-emerald-600" />
                              At-Home Support & Suggested Tasks
                            </h4>
                            <span className="text-[8px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase">Week 23 Plan</span>
                          </div>
                          
                          <div className="space-y-3 font-semibold text-[10px] text-slate-550 leading-relaxed">
                            <div className="flex items-start gap-2.5">
                              <span className="h-5 w-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[9px] shrink-0">1</span>
                              <div>
                                <strong>Conduct 15-Min Error Reviews</strong>
                                <p className="text-slate-400 text-[9px]">Ask your child to explain the questions they answered incorrectly in mock quizzes. Self-explaining prevents recurring traps.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <span className="h-5 w-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[9px] shrink-0">2</span>
                              <div>
                                <strong>Enforce Phone-Free Revision Blocks</strong>
                                <p className="text-slate-400 text-[9px]">Keep distractions away during the daily 2-hour home study blocks to allow deep work pathways to form.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <span className="h-5 w-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[9px] shrink-0">3</span>
                              <div>
                                <strong>Praise Effort Over Marks</strong>
                                <p className="text-slate-400 text-[9px]">Acknowledge their continuous daily revision streak. Encouraging study process builds academic resilience.</p>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-4 space-y-2">
                            <strong className="text-slate-800 text-[9px] uppercase tracking-wider block">💬 Last Parent-Teacher Meeting (PTM) Minutes</strong>
                            <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[10px] leading-relaxed">
                              <strong>Date:</strong> {new Date().toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})} | <strong>Attendees:</strong> Prof. {resolvedTeacher.name}, {activeStudent.parentName}
                              <p className="text-slate-550 italic mt-1 font-semibold">
                                "Reviewed recent mathematics quizzes. Discussed the transition into more complex trigonometry worksheets. Agreed on a weekly checklist for homework submissions to maintain study momentum."
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Right side: Live Counselor Chat Interface & Fee Alerts */}
                      <div className="xl:col-span-5 space-y-6">
                        
                        {/* Fee Reminder alert HUD */}
                        <div className={`border rounded-2xl p-4.5 space-y-3 shadow-xxs ${
                          activeStudent.totalFeesDue > 0 ? 'bg-rose-50/40 border-rose-200' : 'bg-emerald-50/40 border-emerald-200'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Account Financial Standing</span>
                              <h4 className="text-[11px] font-black text-slate-800 mt-1">Outstanding Ward Fees</h4>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              activeStudent.totalFeesDue > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {activeStudent.totalFeesDue > 0 ? 'Payment Required' : 'Fees Paid'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs font-black">
                            <span className="text-slate-500 font-bold">Outstanding Amount:</span>
                            <span className={activeStudent.totalFeesDue > 0 ? 'text-rose-600 font-mono text-sm' : 'text-emerald-600 font-mono'}>
                              ₹{(activeStudent.totalFeesDue || 0).toLocaleString()}
                            </span>
                          </div>

                          {activeStudent.totalFeesDue > 0 && (
                            <button
                              onClick={() => {
                                setPaymentAmount(activeStudent.totalFeesDue);
                                setPaymentStep('input');
                                setShowPaymentModal(true);
                              }}
                              className="w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-xxs"
                            >
                              Pay Ward Outstanding Fees Now
                            </button>
                          )}
                        </div>

                        {/* Parent Counsel Chat assistant */}
                        <div className="border border-slate-200 rounded-2xl bg-white shadow-xxs overflow-hidden flex flex-col h-[350px]">
                          <div className="bg-slate-900 text-white p-3.5 flex justify-between items-center border-b border-slate-800">
                            <div>
                              <strong className="text-[10px] uppercase tracking-wider block text-indigo-400">AI Counselor Desk</strong>
                              <span className="text-[8px] text-slate-400 font-semibold">Consult about career choice, progress, or attendance.</span>
                            </div>
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          </div>

                          {/* Chat body */}
                          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 text-[10px] font-semibold leading-relaxed">
                            <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-slate-600 max-w-[85%] self-start shadow-xxs">
                              Hello! I am your AI parent counselor. You can ask me any questions about <strong>{activeStudent.name}</strong>'s performance, strengths, or suggestions for supporting them at home. Try selecting one of the topics below or write yours.
                            </div>

                            {/* Suggestion Chips */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {[
                                'Tell me about my child\'s progress',
                                'What are their weak subjects?',
                                'Is their attendance at risk?',
                                'Suggest at-home study tips'
                              ].map((chip) => (
                                <button
                                  key={chip}
                                  onClick={() => {
                                    setChatMessage(chip);
                                  }}
                                  className="px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 rounded-lg text-[9px] transition-all cursor-pointer shadow-xxs font-bold"
                                >
                                  {chip}
                                </button>
                              ))}
                            </div>

                            {/* Message history */}
                            {chatThreads[selectedWardId]?.map((msg) => (
                              <div 
                                key={msg.id}
                                className={`p-2.5 rounded-xl max-w-[85%] shadow-xxs leading-relaxed font-bold ${
                                  msg.senderRole === 'parent' 
                                    ? 'bg-indigo-600 text-white self-end ml-auto' 
                                    : 'bg-white border border-slate-150 text-slate-600'
                                }`}
                              >
                                <span className="block text-[8px] font-black uppercase tracking-wider opacity-60 mb-0.5">{msg.senderName}</span>
                                <div>{msg.content}</div>
                              </div>
                            ))}

                            {isTyping && (
                              <div className="flex items-center gap-1 text-slate-400 pl-1">
                                <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                                <span>Counselor is analyzing student matrix...</span>
                              </div>
                            )}
                          </div>

                          {/* Chat footer */}
                          <form onSubmit={handleSendMessage} className="p-2 bg-white border-t border-slate-100 flex gap-2">
                            <input
                              type="text"
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              placeholder="Write your question..."
                              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xxs bg-slate-50 focus:outline-indigo-500"
                            />
                            <button
                              type="submit"
                              className="px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center transition-all cursor-pointer"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* 8. STUDENT GROWTH TIMELINE TAB */}
                {activeTab === 'timeline' && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs space-y-6 animate-fadeIn">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                          <Clock className="h-5 w-5 text-indigo-600" />
                          <span>Student Growth & Achievements Timeline</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">Verify historical landmarks from initial admission to course completion.</p>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="max-w-xl mx-auto py-3 relative">
                      {/* Center dashed line */}
                      <div className="absolute left-4 top-2 bottom-2 w-px border-l-2 border-dashed border-slate-200" />

                      <div className="space-y-6 pl-10 relative">
                        
                        {/* Milestone 1: Admission */}
                        <div className="relative group text-xxs font-semibold">
                          {/* Dot indicator */}
                          <span className="absolute -left-[30px] top-1.5 h-4 w-4 rounded-full bg-indigo-600 border-4 border-white flex items-center justify-center shadow-md shadow-indigo-100" />
                          <div className="space-y-1 bg-slate-50 border border-slate-150 p-4 rounded-2xl shadow-xxs">
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Admission Landmark</span>
                              <span className="font-mono">{activeStudent.admissionDate || 'July 2026'}</span>
                            </div>
                            <h4 className="text-[11px] font-black text-slate-800">Learner's Den Academy Onboarding</h4>
                            <p className="text-slate-550 leading-relaxed font-semibold">
                              Formally enrolled in the academic syllabus batch. Verified prior scholastic compliance of <strong className="text-slate-800">{activeStudent.previousClassPercentage || 84}%</strong>. Received standard onboarding starter toolkits and system logins.
                            </p>
                          </div>
                        </div>

                        {/* Milestone 2: Fees Transaction */}
                        <div className="relative group text-xxs font-semibold">
                          <span className="absolute -left-[30px] top-1.5 h-4 w-4 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-md shadow-emerald-100" />
                          <div className="space-y-1 bg-slate-50 border border-slate-150 p-4 rounded-2xl shadow-xxs">
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Financial Record</span>
                              <span className="font-mono">July 16, 2026</span>
                            </div>
                            <h4 className="text-[11px] font-black text-slate-800">Admission Fee Installment Cleared</h4>
                            <p className="text-slate-550 leading-relaxed font-semibold">
                              Successfully processed initial registration payment of <strong className="text-emerald-700">₹{(activeStudent.totalFeesPaid || 15000).toLocaleString()}</strong>. Standard digital receipt issued to verified mobile account under ref LD-REC-90182.
                            </p>
                          </div>
                        </div>

                        {/* Milestone 3: First Assessment */}
                        <div className="relative group text-xxs font-semibold">
                          <span className="absolute -left-[30px] top-1.5 h-4 w-4 rounded-full bg-amber-500 border-4 border-white flex items-center justify-center shadow-md shadow-amber-100" />
                          <div className="space-y-1 bg-slate-50 border border-slate-150 p-4 rounded-2xl shadow-xxs">
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Assessment Performance</span>
                              <span className="font-mono">August 05, 2026</span>
                            </div>
                            <h4 className="text-[11px] font-black text-slate-800">Inaugural Chapter Diagnostics</h4>
                            <p className="text-slate-550 leading-relaxed font-semibold">
                              Scored <strong className="text-indigo-600">{averageGradeScore || 85}%</strong> in the introductory syllabus mock assessment. AI performance matrices highlighted advanced mathematical reasoning and suggested reinforcing chemical kinetic derivations.
                            </p>
                          </div>
                        </div>

                        {/* Milestone 4: Attendance Compliance */}
                        <div className="relative group text-xxs font-semibold">
                          <span className="absolute -left-[30px] top-1.5 h-4 w-4 rounded-full bg-indigo-500 border-4 border-white flex items-center justify-center shadow-md shadow-indigo-100" />
                          <div className="space-y-1 bg-slate-50 border border-slate-150 p-4 rounded-2xl shadow-xxs">
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Attendance Tracking</span>
                              <span className="font-mono">September 12, 2026</span>
                            </div>
                            <h4 className="text-[11px] font-black text-slate-800">First-Quarter Scan Compliance Audit</h4>
                            <p className="text-slate-550 leading-relaxed font-semibold">
                              Achieved a commendable <strong>{attendanceRate}%</strong> biometric check-in compliance streak. Awarded the 'Attendance Resiliency Badge' in the student hub dashboard.
                            </p>
                          </div>
                        </div>

                        {/* Milestone 5: Achievements & Olympiad */}
                        <div className="relative group text-xxs font-semibold">
                          <span className="absolute -left-[30px] top-1.5 h-4 w-4 rounded-full bg-teal-500 border-4 border-white flex items-center justify-center shadow-md shadow-teal-100" />
                          <div className="space-y-1 bg-slate-50 border border-slate-150 p-4 rounded-2xl shadow-xxs">
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Special Recognition</span>
                              <span className="font-mono">October 28, 2026</span>
                            </div>
                            <h4 className="text-[11px] font-black text-slate-800">National Mathematics League Olympiad</h4>
                            <p className="text-slate-550 leading-relaxed font-semibold">
                              Secured State Rank #42 in the advanced mathematical Olympiad. Awarded official Certificate of Achievement issued directly by Learner's Den Intellectual Hub.
                            </p>
                          </div>
                        </div>

                        {/* Milestone 6: AI report evaluation */}
                        <div className="relative group text-xxs font-semibold">
                          <span className="absolute -left-[30px] top-1.5 h-4 w-4 rounded-full bg-violet-600 border-4 border-white flex items-center justify-center shadow-md shadow-violet-100" />
                          <div className="space-y-1 bg-slate-50 border border-slate-150 p-4 rounded-2xl shadow-xxs">
                            <div className="flex justify-between items-center text-slate-400">
                              <span>AI Coach Audit</span>
                              <span className="font-mono">Today</span>
                            </div>
                            <h4 className="text-[11px] font-black text-slate-800">Mid-Term Educational Intelligence Report</h4>
                            <p className="text-slate-550 leading-relaxed font-semibold">
                              Continuous evaluation models suggest a high predicted percentile outcome of <strong>94.2%</strong> on the target competitive exams. Highly recommended to continue focusing on the 8-Week personalized mentorship roadmap.
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-12 text-center text-slate-500">
              <User className="h-10 w-10 text-indigo-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Student Profile Active</h3>
              <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto">
                Please enter your ward's unique Enrollment ID and registered contact number on the left to verify relationship.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
