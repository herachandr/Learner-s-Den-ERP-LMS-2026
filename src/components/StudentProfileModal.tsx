import React, { useState } from 'react';
import { 
  User, Tag, Calendar, Sparkles, Phone, Mail, MapPin, 
  Trash2, Download, Upload, FileText, Check, ShieldAlert, 
  Lock, MessageSquare, Award, Clock, IdCard, Edit2, X
} from 'lucide-react';
import { Student, Batch, FeeReceipt } from '../types';
import { jsPDF } from 'jspdf';

interface StudentProfileModalProps {
  student: Student;
  onClose: () => void;
  getBatchName: (batchId: string) => string;
  onUpdateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  handleDownloadSingleIdCard: (student: Student) => void;
  handleOpenEdit: (student: Student) => void;
  fees: any[];
  batches: Batch[];
  simulatedRole: 'admin' | 'lecturer' | 'front_office';
  setSimulatedRole: (role: 'admin' | 'lecturer' | 'front_office') => void;
  showToast: (title: string, message: string) => void;
  
  // Custom states shared from parent
  attendanceLogs: Record<string, { date: string, status: 'Present' | 'Absent' | 'Late', remarks: string }[]>;
  setAttendanceLogs: React.Dispatch<React.SetStateAction<Record<string, { date: string, status: 'Present' | 'Absent' | 'Late', remarks: string }[]>>>;
  studentResults: Record<string, { id: string, examName: string, subject: string, date: string, marksObtained: number, maxMarks: number, remarks: string }[]>;
  setStudentResults: React.Dispatch<React.SetStateAction<Record<string, { id: string, examName: string, subject: string, date: string, marksObtained: number, maxMarks: number, remarks: string }[]>>>;
  communicationLogs: Record<string, { id: string, date: string, mode: string, recipient: string, messageBody: string, status: string }[]>;
  setCommunicationLogs: React.Dispatch<React.SetStateAction<Record<string, { id: string, date: string, mode: string, recipient: string, messageBody: string, status: string }[]>>>;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  getBatchName,
  onUpdateStudent,
  handleDownloadSingleIdCard,
  handleOpenEdit,
  fees,
  batches,
  simulatedRole,
  setSimulatedRole,
  showToast,
  attendanceLogs,
  setAttendanceLogs,
  studentResults,
  setStudentResults,
  communicationLogs,
  setCommunicationLogs
}) => {
  const [modalTab, setModalTab] = useState<string>('general');
  const [newDocType, setNewDocType] = useState('Aadhaar Card');
  const [newDocName, setNewDocName] = useState('');
  
  const [isEditingSection, setIsEditingSection] = useState<string | null>(null); // 'personal' | 'parents' | 'medical'
  const [editFields, setEditFields] = useState<Partial<Student>>({});

  // Dynamic input states for creating records within tabs
  const [newAttDate, setNewAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAttStatus, setNewAttStatus] = useState<'Present' | 'Absent' | 'Late'>('Present');
  const [newAttRemarks, setNewAttRemarks] = useState('');

  const [newResultExam, setNewResultExam] = useState('');
  const [newResultSubject, setNewResultSubject] = useState('Physics');
  const [newResultDate, setNewResultDate] = useState(new Date().toISOString().split('T')[0]);
  const [newResultObtained, setNewResultObtained] = useState('');
  const [newResultMax, setNewResultMax] = useState('100');
  const [newResultRemarks, setNewResultRemarks] = useState('');

  const [newCommMode, setNewCommMode] = useState('WhatsApp');
  const [newCommRecipient, setNewCommRecipient] = useState('Parent');
  const [newCommMessage, setNewCommMessage] = useState('');

  // Helper getters
  const getStudentAttendance = (studentId: string) => {
    if (attendanceLogs[studentId]) return attendanceLogs[studentId];
    return [
      { date: '2026-07-06', status: 'Present' as const, remarks: 'Active engagement in Physics mock revision.' },
      { date: '2026-07-04', status: 'Present' as const, remarks: 'Very good score in homework quiz.' },
      { date: '2026-07-02', status: 'Late' as const, remarks: 'Arrived 15 minutes late due to monsoon rain traffic.' },
      { date: '2026-06-30', status: 'Present' as const, remarks: 'Solved advanced organic mechanisms on board.' },
      { date: '2026-06-28', status: 'Absent' as const, remarks: 'Prior notice: Family social obligation.' },
      { date: '2026-06-25', status: 'Present' as const, remarks: 'Punctual, excellent question queries.' },
    ];
  };

  const getStudentResults = (studentId: string) => {
    if (studentResults[studentId]) return studentResults[studentId];
    return [
      { id: 'r1', examName: 'IIT-JEE Mock Series - Mechanics-II', subject: 'Physics', date: '2026-06-28', marksObtained: 85, maxMarks: 100, remarks: 'Excellent performance in Rotational Dynamics.' },
      { id: 'r2', examName: 'IIT-JEE Mock Series - Thermodynamics', subject: 'Chemistry', date: '2026-06-28', marksObtained: 72, maxMarks: 100, remarks: 'Slight review needed on entropy formulas.' },
      { id: 'r3', examName: 'IIT-JEE Mock Series - Integration Methods', subject: 'Mathematics', date: '2026-06-28', marksObtained: 91, maxMarks: 100, remarks: 'Phenomenal Calculus skills displayed.' },
    ];
  };

  const getStudentCommunications = (studentId: string) => {
    if (communicationLogs[studentId]) return communicationLogs[studentId];
    return [
      { id: 'c1', date: '2026-07-05 10:30', mode: 'WhatsApp', recipient: 'Parent', messageBody: 'Dear Parent, Your ward has successfully scored 82.6% average in Mock Exam Series 1. Progress Report sent to mail.', status: 'Delivered' },
      { id: 'c2', date: '2026-07-01 09:00', mode: 'SMS', recipient: 'Student', messageBody: 'Class Timetable Update: Chemistry Shift changed to 4:00 PM for Alpha Section.', status: 'Delivered' },
      { id: 'c3', date: '2026-06-25 18:45', mode: 'Email', recipient: 'Parent', messageBody: 'Invoice Receipt #LD-FEE-9821 of ₹12,000 tuition fees has been generated and approved.', status: 'Sent' },
    ];
  };

  const handleAddAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = student.id;
    const currentList = getStudentAttendance(studentId);
    const newList = [{ date: newAttDate, status: newAttStatus, remarks: newAttRemarks || 'Recorded via Portal' }, ...currentList];
    setAttendanceLogs(prev => ({ ...prev, [studentId]: newList }));
    setNewAttRemarks('');
    showToast("Attendance Recorded", `Marked student as ${newAttStatus} for ${newAttDate}.`);
  };

  const handleAddResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResultExam.trim()) {
      alert("Please specify exam description");
      return;
    }
    const studentId = student.id;
    const currentList = getStudentResults(studentId);
    const newRecord = {
      id: `res-${Date.now()}`,
      examName: newResultExam,
      subject: newResultSubject,
      date: newResultDate,
      marksObtained: Number(newResultObtained) || 0,
      maxMarks: Number(newResultMax) || 100,
      remarks: newResultRemarks || 'Graded successfully by faculty'
    };
    setStudentResults(prev => ({ ...prev, [studentId]: [newRecord, ...currentList] }));
    setNewResultExam('');
    setNewResultObtained('');
    setNewResultRemarks('');
    showToast("Result Added", `Added mock exam score of ${newRecord.marksObtained}/${newRecord.maxMarks} for ${newResultSubject}.`);
  };

  const handleSendCommMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommMessage.trim()) {
      alert("Please enter a notice message body.");
      return;
    }
    const studentId = student.id;
    const currentList = getStudentCommunications(studentId);
    const newRecord = {
      id: `comm-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      mode: newCommMode,
      recipient: newCommRecipient,
      messageBody: newCommMessage,
      status: 'Sent'
    };
    setCommunicationLogs(prev => ({ ...prev, [studentId]: [newRecord, ...currentList] }));
    setNewCommMessage('');
    showToast("Notice Dispatched", `Simulated outbound ${newCommMode} alert sent to ${newCommRecipient}.`);
  };

  const handleGenerateCertificate = (type: string, studentData: Student) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const w = 297;
    const h = 210;

    doc.setFillColor(254, 253, 250);
    doc.rect(0, 0, w, h, 'F');

    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, w - 20, h - 20, 'D');

    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.6);
    doc.rect(12, 12, w - 24, h - 24, 'D');

    doc.setDrawColor(217, 119, 6);
    doc.line(10, 18, 18, 10);
    doc.line(w - 10, 18, w - 18, 10);
    doc.line(10, h - 18, 18, h - 10);
    doc.line(w - 10, h - 18, w - 18, h - 10);

    doc.setTextColor(30, 41, 59);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("LEARNER'S DEN ACADEMIC COOPERATIVE", w / 2, 28, { align: 'center' });

    doc.setTextColor(217, 119, 6);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'italic');
    doc.text("Estd 2018 | Premium National-Level Offline Coaching Institute", w / 2, 34, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(50, 39, w - 50, 39);

    doc.setTextColor(79, 70, 229);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    
    let certTitle = "";
    let certBody1 = "";
    let certBody2 = "";
    let certBody3 = "";

    if (type === 'admission') {
      certTitle = "OFFICIAL ADMISSION CONFIRMATION";
      certBody1 = "This is officially certified and recorded that our student";
      certBody2 = studentData.name.toUpperCase();
      certBody3 = `has been enrolled in the intensive offline classroom batch "${getBatchName(studentData.batchId)}" under secure registration ID ${studentData.id} with admission verified on ${studentData.admissionDate}.`;
    } else if (type === 'completion') {
      certTitle = "COACHING COMPLETION CREDENTIAL";
      certBody1 = "This certifies and honors that our dedicated learner";
      certBody2 = studentData.name.toUpperCase();
      certBody3 = `has successfully completed the complete preparation modules, mock testing curriculum, and evaluation syllabus for "${getBatchName(studentData.batchId)}" with exceptional diligence and merit.`;
    } else {
      certTitle = "AWARD FOR ACADEMIC EXCELLENCE & SCHOLARSHIP";
      certBody1 = "This prestigious award is proudly conferred to";
      certBody2 = studentData.name.toUpperCase();
      certBody3 = `for securing outstanding merit standing in national mock test evaluations under Batch "${getBatchName(studentData.batchId)}" and qualifying for an official merit concession of ${studentData.concessionPercentage || 15}% tuition fees reward.`;
    }

    doc.text(certTitle, w / 2, 54, { align: 'center' });

    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(13);
    doc.text(certBody1, w / 2, 70, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(certBody2, w / 2, 88, { align: 'center' });

    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(1.0);
    doc.line(w / 2 - 60, 93, w / 2 + 60, 93);

    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const splitBody = doc.splitTextToSize(certBody3, 200);
    doc.text(splitBody, w / 2, 108, { align: 'center' });

    const sealX = w / 2;
    const sealY = 148;
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(1.5);
    doc.setFillColor(254, 243, 199);
    doc.circle(sealX, sealY, 14, 'FD');

    doc.setDrawColor(185, 28, 28);
    doc.setLineWidth(0.5);
    doc.circle(sealX, sealY, 11, 'D');

    doc.setTextColor(185, 28, 28);
    doc.setFontSize(7);
    doc.setFont('Helvetica', 'bold');
    doc.text("OFFICIAL", sealX, sealY - 1.5, { align: 'center' });
    doc.text("SEAL", sealX, sealY + 2.5, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');

    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.5);
    doc.line(30, 168, 90, 168);
    doc.text("OFFICE REGISTRAR", 60, 174, { align: 'center' });
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8);
    doc.text("Sign: L. Deshmukh", 60, 164, { align: 'center' });

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.line(w - 90, 168, w - 30, 168);
    doc.text("ACADEMIC DIRECTOR", w - 60, 174, { align: 'center' });
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8);
    doc.text("Sign: Prof. S. Sen", w - 60, 164, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Issue Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, w / 2, 185, { align: 'center' });

    doc.save(`${studentData.name.replace(/\s+/g, '_')}_Certificate_${type}.pdf`);
    showToast("Certificate Downloaded", `Official PDF of ${type} has been downloaded.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-500 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">Student Admissions Dossier & Registry</h3>
              <p className="text-[10px] text-slate-400 font-bold">Simulating role: {simulatedRole.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Static Header Banner Card */}
        <div className="p-6 pb-0 shrink-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="h-16 w-16 rounded-xl overflow-hidden border-2 border-white bg-slate-100 shrink-0 flex items-center justify-center shadow-sm">
              {student.photoUrl ? (
                <img referrerPolicy="no-referrer" src={student.photoUrl} alt={student.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-800 font-black text-lg uppercase">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div>
                <h4 className="font-extrabold text-base text-slate-800">{student.name}</h4>
                <p className="text-xxs text-slate-400 font-semibold">Student Admission ID: <span className="font-mono text-slate-600 font-bold">{student.id}</span></p>
              </div>

              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200/50 text-slate-600 font-bold text-xxs border border-slate-200/30">
                  <Tag className="h-3 w-3 opacity-60" />
                  Batch: {getBatchName(student.batchId)}
                </span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xxs font-bold border ${
                  student.feeStatus === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : student.feeStatus === 'Pending'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  Fees Status: {student.feeStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 px-6 shrink-0 gap-1 pt-2">
          {(['general', 'personal', 'medical', 'documents', 'attendance', 'results', 'communications', 'certificates'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setModalTab(tab);
                setIsEditingSection(null);
              }}
              className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-all capitalize cursor-pointer ${
                modalTab === tab
                  ? 'border-indigo-600 text-indigo-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'general' ? 'Overview' : tab === 'personal' ? 'Personal' : tab === 'medical' ? 'Medical' : tab === 'documents' ? 'Documents' : tab === 'attendance' ? 'Attendance' : tab === 'results' ? 'Academic Results' : tab === 'communications' ? 'Notice logs' : 'Credentials'}
            </button>
          ))}
        </div>

        {/* Profile Content Body (Scrollable) */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {modalTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700 text-xs">
              <div className="space-y-4 text-left">
                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Academic Enrolments</h5>
                  <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Chosen Core Subjects</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {student.subjectsChosen && student.subjectsChosen.length > 0 ? (
                          student.subjectsChosen.map(sub => (
                            <span key={sub} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xxs font-black border border-indigo-100">
                              {sub}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-xxs">No specific subjects recorded</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Prior Academic Merit</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {student.previousClassPercentage !== undefined ? `${student.previousClassPercentage}% Marks in Entrance/Prev Class` : 'N/A'}
                      </p>
                    </div>

                    {student.concessionApplied && (
                      <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl flex items-center gap-2 mt-1">
                        <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                        <div>
                          <p className="font-extrabold text-[10px] text-amber-800">Merit Concession Active</p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-0.5">{student.concessionPercentage}% reduction applied to batch fees.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Student Contacts</h5>
                  <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Personal Email</span>
                      <p className="font-medium text-slate-800">{student.email}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Personal Phone</span>
                      <p className="font-medium text-slate-800">{student.phone || 'No personal phone recorded'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Home Address</span>
                      <p className="font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">{student.address || 'No residential address recorded'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 text-left">
                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Parent / Guardian Information</h5>
                  <div className="space-y-2.5 p-3.5 bg-indigo-50/20 border border-indigo-100 rounded-2xl">
                    <div>
                      <span className="text-[9px] font-bold text-indigo-600 uppercase">Primary Contact Person</span>
                      <p className="font-bold text-slate-800">{student.parentName}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-indigo-600 uppercase">Primary Contact Phone</span>
                      <p className="font-medium text-slate-800">{student.parentPhone || 'No separate parent phone recorded'}</p>
                    </div>
                    {student.parentEmail && (
                      <div>
                        <span className="text-[9px] font-bold text-indigo-600 uppercase">Primary Contact Email</span>
                        <p className="font-medium text-slate-800">{student.parentEmail}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Financial Records</h5>
                  <div className="p-3.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase">Fees Cleared</span>
                      <p className="font-black text-emerald-700 text-sm mt-0.5">₹{student.totalFeesPaid}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-rose-500 uppercase">Fees Outstanding</span>
                      <p className="font-black text-rose-700 text-sm mt-0.5">₹{student.totalFeesDue}</p>
                    </div>
                  </div>
                </div>

                {fees.filter(f => f.studentId === student.id).length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Fee Payment History</h5>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {fees
                        .filter(f => f.studentId === student.id)
                        .map(f => (
                          <div key={f.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xxs font-semibold text-slate-700 hover:bg-emerald-50/10 hover:border-emerald-200 transition-colors">
                            <div className="space-y-0.5">
                              <p className="text-slate-800 text-xxs font-black">{f.receiptNo}</p>
                              <p className="text-slate-400 text-[10px]">{f.date} • {f.paymentMode}</p>
                            </div>
                            <span className="text-emerald-600 font-black">₹{f.amount.toLocaleString()}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {modalTab === 'personal' && (
            <div className="space-y-4 text-slate-700 text-xs text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Demographic Registry Details</h6>
                {(simulatedRole === 'admin' || simulatedRole === 'front_office') && (
                  isEditingSection === 'personal' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await onUpdateStudent(student.id, editFields);
                          Object.assign(student, editFields);
                          setIsEditingSection(null);
                          showToast("Profile Updated", "Personal demographic fields saved successfully.");
                        }}
                        className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg cursor-pointer hover:bg-emerald-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingSection(null)}
                        className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg cursor-pointer hover:bg-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditingSection('personal');
                        setEditFields({
                          dob: student.dob || '2008-10-14',
                          age: student.age || 17,
                          gender: student.gender || 'Male',
                          bloodGroup: student.bloodGroup || 'O+',
                          aadharNumber: student.aadharNumber || 'XXXX-XXXX-8921',
                          religion: student.religion || 'Hinduism',
                          category: student.category || 'General',
                          disabilityStatus: student.disabilityStatus || 'None',
                        });
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg cursor-pointer border border-indigo-150 transition-all flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Section</span>
                    </button>
                  )
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Date of Birth', key: 'dob', fallback: '14th October 2008' },
                  { label: 'Age', key: 'age', fallback: '17 Years' },
                  { label: 'Gender', key: 'gender', fallback: 'Male' },
                  { label: 'Blood Group', key: 'bloodGroup', fallback: 'O+' },
                  { label: 'Aadhaar Number', key: 'aadharNumber', fallback: 'XXXX-XXXX-8921' },
                  { label: 'Religion', key: 'religion', fallback: 'Hinduism' },
                  { label: 'Category', key: 'category', fallback: 'General' },
                  { label: 'Disability Status', key: 'disabilityStatus', fallback: 'None' },
                ].map(field => (
                  <div key={field.key} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">{field.label}</span>
                    {isEditingSection === 'personal' ? (
                      <input
                        type="text"
                        value={(editFields as any)[field.key] || ''}
                        onChange={e => setEditFields({ ...editFields, [field.key]: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-hidden text-slate-800"
                      />
                    ) : (
                      <p className="font-bold text-slate-800">{(student as any)[field.key] || field.fallback}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-100 pt-4">
                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Family Registry</h6>
                {(simulatedRole === 'admin' || simulatedRole === 'front_office') && (
                  isEditingSection === 'parents' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await onUpdateStudent(student.id, editFields);
                          Object.assign(student, editFields);
                          setIsEditingSection(null);
                          showToast("Profile Updated", "Family registry contacts saved successfully.");
                        }}
                        className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg cursor-pointer hover:bg-emerald-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingSection(null)}
                        className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg cursor-pointer hover:bg-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditingSection('parents');
                        setEditFields({
                          fatherName: student.fatherName || 'L. Tomba Singh',
                          fatherPhone: student.fatherPhone || '',
                          motherName: student.motherName || 'L. Shanti Devi',
                          motherPhone: student.motherPhone || '',
                          occupation: student.occupation || 'Government Service',
                          annualIncome: student.annualIncome || '3,50,000'
                        });
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg cursor-pointer border border-indigo-150 transition-all flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Section</span>
                    </button>
                  )
                )}
              </div>

              <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Father's Full Name", key: 'fatherName', fallback: 'L. Tomba Singh' },
                  { label: "Father's Contact", key: 'fatherPhone', fallback: 'Not Recorded' },
                  { label: "Mother's Full Name", key: 'motherName', fallback: 'L. Shanti Devi' },
                  { label: "Mother's Contact", key: 'motherPhone', fallback: 'Not Recorded' },
                  { label: "Father's Occupation", key: 'occupation', fallback: 'Government Service / Agri' },
                  { label: "Family Annual Income", key: 'annualIncome', fallback: '3,50,000' },
                ].map(field => (
                  <div key={field.key}>
                    <span className="text-[9px] font-bold text-indigo-600 uppercase block mb-0.5">{field.label}</span>
                    {isEditingSection === 'parents' ? (
                      <input
                        type="text"
                        value={(editFields as any)[field.key] || ''}
                        onChange={e => setEditFields({ ...editFields, [field.key]: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-hidden text-slate-800"
                      />
                    ) : (
                      <p className="font-bold text-slate-800">{(student as any)[field.key] || field.fallback}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {modalTab === 'medical' && (
            <div className="space-y-4 text-slate-700 text-xs text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h6 className="text-[10px] font-black text-rose-700 uppercase tracking-wider">Emergency Contact Person</h6>
                {(simulatedRole === 'admin' || simulatedRole === 'front_office') && (
                  isEditingSection === 'medical' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await onUpdateStudent(student.id, editFields);
                          Object.assign(student, editFields);
                          setIsEditingSection(null);
                          showToast("Profile Updated", "Medical and emergency logs saved successfully.");
                        }}
                        className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg cursor-pointer hover:bg-emerald-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingSection(null)}
                        className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg cursor-pointer hover:bg-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditingSection('medical');
                        setEditFields({
                          emergencyContactName: student.emergencyContactName || 'L. Tomba Singh',
                          emergencyRelationship: student.emergencyRelationship || 'Father',
                          emergencyPhone: student.emergencyPhone || '+91-9876543210',
                          allergies: student.allergies || 'None',
                          medicalConditions: student.medicalConditions || 'None',
                        });
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg cursor-pointer border border-indigo-150 transition-all flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Section</span>
                    </button>
                  )
                )}
              </div>

              <div className="bg-rose-50/40 border border-rose-150 rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Contact Person Name', key: 'emergencyContactName', fallback: 'L. Tomba Singh' },
                    { label: 'Relationship', key: 'emergencyRelationship', fallback: 'Father' },
                    { label: 'Emergency Hotline Phone', key: 'emergencyPhone', fallback: '+91-9876543210' },
                  ].map(field => (
                    <div key={field.key}>
                      <span className="text-[9px] font-bold text-rose-500 uppercase">{field.label}</span>
                      {isEditingSection === 'medical' ? (
                        <input
                          type="text"
                          value={(editFields as any)[field.key] || ''}
                          onChange={e => setEditFields({ ...editFields, [field.key]: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-hidden text-slate-800 mt-1"
                        />
                      ) : (
                        <p className="font-bold text-slate-800 mt-0.5">{(student as any)[field.key] || field.fallback}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-wider pt-2">Medical Profile Details</h6>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Known Allergies', key: 'allergies', fallback: 'No known food or drug allergies' },
                  { label: 'Chronic Medical Conditions', key: 'medicalConditions', fallback: 'No critical chronic diseases recorded' },
                ].map(field => (
                  <div key={field.key}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{field.label}</span>
                    {isEditingSection === 'medical' ? (
                      <input
                        type="text"
                        value={(editFields as any)[field.key] || ''}
                        onChange={e => setEditFields({ ...editFields, [field.key]: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-hidden text-slate-800 mt-1"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800 mt-0.5">{(student as any)[field.key] || field.fallback}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {modalTab === 'documents' && (
            <div className="space-y-4 text-slate-700 text-xs text-left">
              <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">Simulate Uploading Document to Dossier</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Document Type</label>
                    <select
                      value={newDocType}
                      onChange={e => setNewDocType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 text-slate-700 font-bold"
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="Birth Certificate">Birth Certificate</option>
                      <option value="Transfer Certificate">Transfer Certificate</option>
                      <option value="Migration Certificate">Migration Certificate</option>
                      <option value="Mark Sheet">Mark Sheet</option>
                      <option value="Income Certificate">Income Certificate</option>
                      <option value="EWS Certificate">EWS Certificate</option>
                      <option value="BPL Certificate">BPL Certificate</option>
                      <option value="Caste Certificate">Caste Certificate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Custom Filename</label>
                    <input
                      type="text"
                      placeholder="e.g. Aadhaar_Verified.pdf"
                      value={newDocName}
                      onChange={e => setNewDocName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 text-slate-700"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newDocName.trim()) {
                      alert("Please specify a filename for this document upload.");
                      return;
                    }
                    const newDoc = {
                      id: "doc-" + Date.now(),
                      name: newDocName,
                      type: newDocType,
                      url: "https://learnersden.in/docs/simulated_upload_" + Date.now() + ".pdf",
                      uploadedAt: new Date().toISOString().split("T")[0]
                    };
                    const updatedDocs = [...(student.documents || []), newDoc];
                    await onUpdateStudent(student.id, { documents: updatedDocs });
                    student.documents = updatedDocs;
                    setNewDocName('');
                    showToast("Document Uploaded", "KYC PDF document successfully linked to student admission file.");
                  }}
                  className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Upload className="h-4 w-4" />
                  <span>Commit Document Upload</span>
                </button>
              </div>

              <div className="space-y-2">
                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Uploaded Documents Dossier</h6>
                {(!student.documents || student.documents.length === 0) ? (
                  <div className="text-center py-6 bg-slate-50 border border-slate-150 rounded-2xl text-slate-400">
                    <FileText className="h-8 w-8 mx-auto stroke-1 text-slate-300 mb-1" />
                    <p className="text-xxs font-black">No official document records uploaded yet</p>
                    <p className="text-[9px] text-slate-400">Upload critical KYC files like Aadhaar or Birth Certificates above to store securely.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {student.documents.map(doc => (
                      <div key={doc.id} className="p-3 bg-white border border-slate-150 rounded-2xl flex items-center justify-between text-xs font-semibold hover:border-indigo-150 transition-all group">
                        <div className="flex items-center gap-2.5 text-left">
                          <div className="h-9 w-9 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 text-xs">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{doc.type} • Uploaded on {doc.uploadedAt}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="h-8 w-8 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                            title="Download Document"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm("Remove this document from the student's admission registry?")) return;
                              const updatedDocs = (student.documents || []).filter(d => d.id !== doc.id);
                              await onUpdateStudent(student.id, { documents: updatedDocs });
                              student.documents = updatedDocs;
                              showToast("Document Deleted", "Document removed successfully from database.");
                            }}
                            className="h-8 w-8 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {modalTab === 'attendance' && (
            <div className="space-y-4 text-slate-700 text-xs text-left">
              {(simulatedRole === 'admin' || simulatedRole === 'front_office') ? (
                <form onSubmit={handleAddAttendance} className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">Log Offline Session Attendance</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Session Date</label>
                      <input
                        type="date"
                        value={newAttDate}
                        onChange={e => setNewAttDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Status</label>
                      <select
                        value={newAttStatus}
                        onChange={e => setNewAttStatus(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 text-slate-700 font-bold"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Class Remarks / Topic Covered</label>
                      <input
                        type="text"
                        placeholder="e.g. Solved advanced mechanics drill"
                        value={newAttRemarks}
                        onChange={e => setNewAttRemarks(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 text-slate-700"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="h-4 w-4" />
                    <span>Log Attendance Entry</span>
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-700">
                  <ShieldAlert className="h-4 w-4" />
                  <p className="text-[10px] font-bold">Lecturers are unauthorized to modify daily registrar logs. Switching simulated role enables this action.</p>
                </div>
              )}

              <div className="space-y-2">
                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Historical Attendance Registry</h6>
                <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-400 uppercase font-black">
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Remarks / Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {getStudentAttendance(student.id).map((entry, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-bold text-slate-700">{entry.date}</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              entry.status === 'Present'
                                ? 'bg-emerald-50 text-emerald-700'
                                : entry.status === 'Absent'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {entry.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 font-medium">{entry.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {modalTab === 'results' && (
            <div className="space-y-4 text-slate-700 text-xs text-left">
              {(simulatedRole === 'admin' || simulatedRole === 'lecturer') ? (
                <form onSubmit={handleAddResult} className="bg-emerald-50/10 border border-emerald-150 rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Log National Mock Exam Performance</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Exam / Series Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Mock Test 4 - Physics Mechanics"
                        value={newResultExam}
                        onChange={e => setNewResultExam(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 text-slate-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Subject domain</label>
                      <select
                        value={newResultSubject}
                        onChange={e => setNewResultSubject(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold focus:outline-hidden focus:border-indigo-500 text-slate-700"
                      >
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Biology">Biology</option>
                        <option value="General Aptitude">General Aptitude</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Date Evaluated</label>
                      <input
                        type="date"
                        value={newResultDate}
                        onChange={e => setNewResultDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Marks Obtained</label>
                      <input
                        type="number"
                        placeholder="e.g. 85"
                        value={newResultObtained}
                        onChange={e => setNewResultObtained(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 text-slate-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Maximum Marks</label>
                      <input
                        type="number"
                        placeholder="e.g. 100"
                        value={newResultMax}
                        onChange={e => setNewResultMax(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 text-slate-700"
                        required
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Academic Feedback remarks</label>
                      <input
                        type="text"
                        placeholder="e.g. Outstanding speed in rotational vectors"
                        value={newResultRemarks}
                        onChange={e => setNewResultRemarks(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 text-slate-700"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="h-4 w-4" />
                    <span>Log Performance Record</span>
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-700">
                  <ShieldAlert className="h-4 w-4" />
                  <p className="text-[10px] font-bold">Front Office staff is restricted from entering direct grading metrics. Switch to Lecturer or Admin simulation.</p>
                </div>
              )}

              <div className="space-y-2">
                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Evaluation & Mock Exams Index</h6>
                <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-400 uppercase font-black">
                        <th className="px-4 py-2.5">Exam Series / Date</th>
                        <th className="px-4 py-2.5">Subject</th>
                        <th className="px-4 py-2.5">Score</th>
                        <th className="px-4 py-2.5">Evaluator Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {getStudentResults(student.id).map((res) => (
                        <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5">
                            <p className="font-bold text-slate-700 text-xs">{res.examName}</p>
                            <p className="text-[9px] text-slate-400 font-semibold">{res.date}</p>
                          </td>
                          <td className="px-4 py-2.5 font-bold">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-100">
                              {res.subject}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-baseline gap-0.5">
                              <span className="font-extrabold text-slate-800 text-sm">{res.marksObtained}</span>
                              <span className="text-[10px] text-slate-400">/ {res.maxMarks}</span>
                            </div>
                            <span className={`text-[9px] font-bold block ${
                              res.marksObtained / res.maxMarks >= 0.8
                                ? 'text-emerald-600'
                                : res.marksObtained / res.maxMarks >= 0.6
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}>
                              {Math.round((res.marksObtained / res.maxMarks) * 100)}% Grade standing
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 font-medium">{res.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {modalTab === 'communications' && (
            <div className="space-y-4 text-slate-700 text-xs text-left">
              {(simulatedRole === 'admin' || simulatedRole === 'front_office') ? (
                <form onSubmit={handleSendCommMessage} className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">Dispatch Parent & Student Outbound Alerts</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Dispatch Protocol Mode</label>
                      <select
                        value={newCommMode}
                        onChange={e => setNewCommMode(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold focus:outline-hidden focus:border-indigo-500 text-slate-700"
                      >
                        <option value="WhatsApp">WhatsApp Business API</option>
                        <option value="SMS">Transactional SMS Gateway</option>
                        <option value="Email">Secure SMTP Mailer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Target Recipient</label>
                      <select
                        value={newCommRecipient}
                        onChange={e => setNewCommRecipient(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold focus:outline-hidden focus:border-indigo-500 text-slate-700"
                      >
                        <option value="Parent">Primary Contact Person (Parent)</option>
                        <option value="Student">Student Registry Profile</option>
                        <option value="Both">Broadcast (Both Parent & Student)</option>
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Notice Template Body</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Your ward was marked PRESENT today. They scored 85% in mock series exam."
                        value={newCommMessage}
                        onChange={e => setNewCommMessage(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 text-slate-700 leading-normal"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Dispatch Broadcast Notice</span>
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-700">
                  <ShieldAlert className="h-4 w-4" />
                  <p className="text-[10px] font-bold">Faculty members are restricted from outbound global notices. Switch to Admin or Front Office simulations to dispatch alerts.</p>
                </div>
              )}

              <div className="space-y-2">
                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Outbound Dispatch Logs</h6>
                <div className="space-y-2">
                  {getStudentCommunications(student.id).map((comm) => (
                    <div key={comm.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-2 justify-between items-start text-xxs font-semibold">
                      <div className="space-y-1 text-left flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[9px] font-black">
                            {comm.mode}
                          </span>
                          <span className="text-slate-400 text-[9px] font-bold">
                            {comm.date}
                          </span>
                          <span className="text-slate-400 text-[9px] font-medium">• Sent to {comm.recipient}</span>
                        </div>
                        <p className="text-slate-700 text-xxs leading-relaxed font-bold whitespace-pre-wrap">{comm.messageBody}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black border border-emerald-100 self-start md:self-center shrink-0">
                        {comm.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {modalTab === 'certificates' && (
            <div className="space-y-4 text-slate-700 text-xs text-center py-4">
              <div className="max-w-md mx-auto space-y-2">
                <Award className="h-12 w-12 text-indigo-500 mx-auto stroke-1 animate-pulse" />
                <h4 className="font-extrabold text-sm text-slate-800">Generate Official Academic Credentials</h4>
                <p className="text-xxs text-slate-400 font-medium leading-relaxed">
                  Download highly polished, official landscape certificates of academic standing directly in vector PDF format. Each certificate includes security stamps, Estd marks, and signatures.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3 hover:border-indigo-150 hover:bg-indigo-50/5 transition-all">
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-800">Enrollment Confirmation</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Official certificate of active enrollment and batch registration status.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerateCertificate('admission', student)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xxs font-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Admission Certificate</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3 hover:border-indigo-150 hover:bg-indigo-50/5 transition-all">
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-800">Course Completion</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Official certificate of intensive syllabus completion for competitive testing.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerateCertificate('completion', student)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xxs font-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Completion Credential</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3 hover:border-indigo-150 hover:bg-indigo-50/5 transition-all">
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-800">Scholarship Excellence</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Merit recognition award for top mock standing with tuition concessions.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerateCertificate('scholarship', student)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xxs font-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Scholarship Award</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleDownloadSingleIdCard(student)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <IdCard className="h-4 w-4" />
            <span>Download ID Card</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              handleOpenEdit(student);
            }}
            className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close File
          </button>
        </div>
      </div>
    </div>
  );
};
