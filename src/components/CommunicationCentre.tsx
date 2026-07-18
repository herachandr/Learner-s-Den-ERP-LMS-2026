import React, { useState, useEffect, useRef } from "react";
import { 
  Megaphone, Mail, Send, Settings, History, Users, MessageSquare, 
  ShieldAlert, Sparkles, Upload, FileText, CheckCircle2, AlertTriangle, 
  RefreshCw, Clock, Trash2, ShieldCheck, UserCheck, Plus, Search, Filter, 
  ChevronRight, Calendar, AlertCircle, Copy, Check, FileSpreadsheet, Edit3,
  X, Bell, Pin, Download
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { jsPDF } from "jspdf";

import { Student, Teacher, AppUser, Batch, CommunicationLog, CommunicationSettings, Notice } from "../types";
import { communicationService } from "../services/communicationService";
import { studentService } from "../services/studentService";
import { teacherService } from "../services/teacherService";
import { courseService } from "../services/courseService";
import { authService } from "../services/authService";

interface CommunicationCentreProps {
  currentUser: any;
  currentRole: string;
}

export default function CommunicationCentre({ currentUser, currentRole }: CommunicationCentreProps) {
  // Permission Checks
  const isAdminOrStaff = currentRole === 'admin' || currentRole === 'teacher' || currentRole === 'office_staff' || currentRole === 'principal';
  const isAdmin = currentRole === 'admin' || (currentUser?.email === 'the.den.corporation@gmail.com');
  const isTeacher = currentRole === 'teacher';

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'compose' | 'notices' | 'contacts' | 'history' | 'moderation' | 'settings' | 'my-logs' | 'my-contact'>(
    isAdminOrStaff ? 'compose' : 'notices'
  );

  // Core Data Lists
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeacherList] = useState<Teacher[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [commLogs, setCommLogs] = useState<CommunicationLog[]>([]);
  const [settings, setSettings] = useState<CommunicationSettings | null>(null);
  
  // Notices & Announcements States
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticeSearchTerm, setNoticeSearchTerm] = useState('');
  const [selectedNoticeCategory, setSelectedNoticeCategory] = useState<string>('all');
  const [selectedNoticeAudience, setSelectedNoticeAudience] = useState<string>('all');
  const [isNoticeFormOpen, setIsNoticeFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Notice Form Fields
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'General' | 'Academic' | 'Exam' | 'Event' | 'Holiday'>('General');
  const [noticeImportant, setNoticeImportant] = useState(false);
  const [noticeTargetRole, setNoticeTargetRole] = useState<'all' | 'students' | 'teachers'>('all');

  // Loading States
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Composer Form States
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['Notice Board']);
  const [targetType, setTargetType] = useState<'all' | 'class' | 'teachers' | 'parents' | 'individual'>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: string }[]>([]);
  
  // Scheduling States
  const [schedulingType, setSchedulingType] = useState<'now' | 'schedule' | 'recurring'>('now');
  const [scheduleDateTime, setScheduleDateTime] = useState<string>('');
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // AI Writing Panel States
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiTone, setAiTone] = useState<string>('Professional');
  const [aiFormat, setAiFormat] = useState<string>('notice');
  const [aiLanguage, setAiLanguage] = useState<string>('English');
  const [aiOutput, setAiOutput] = useState<string>('');

  // Contacts and Verification Tab States
  const [contactSearch, setContactSearch] = useState<string>('');
  const [contactRoleFilter, setContactRoleFilter] = useState<string>('all');
  const [contactVerifyFilter, setContactVerifyFilter] = useState<string>('all');
  const [editingContact, setEditingContact] = useState<{ id: string; type: 'student' | 'teacher'; name: string; email: string; phone: string; whatsApp: string } | null>(null);
  
  // Bulk Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [importedRows, setImportedRows] = useState<any[]>([]);
  const [mappedColumns, setMappedColumns] = useState({
    name: '0',
    role: '1',
    phone: '2',
    whatsApp: '3',
    email: '4'
  });
  const [importLogs, setImportLogs] = useState<string[]>([]);

  // Simulation Feedback
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [verifyingUser, setVerifyingUser] = useState<{ id: string; type: string; phone: string; code: string } | null>(null);

  useEffect(() => {
    fetchCoreData();
  }, []);

  const fetchCoreData = async () => {
    setLoading(true);
    try {
      const [resStudents, resTeachers, resBatches, resUsers, resLogs, resSettings, resNotices] = await Promise.all([
        studentService.getStudents().catch(() => []),
        teacherService.getTeachers().catch(() => []),
        courseService.getBatches().catch(() => []),
        authService.getUsers().catch(() => []),
        communicationService.getCommunicationLogs().catch(() => []),
        communicationService.getCommunicationSettings().catch(() => null),
        communicationService.getNotices().catch(() => [])
      ]);

      setStudents(Array.isArray(resStudents) ? resStudents : []);
      setTeacherList(Array.isArray(resTeachers) ? resTeachers : []);
      setBatches(Array.isArray(resBatches) ? resBatches : []);
      setUsers(Array.isArray(resUsers) ? resUsers : []);
      setCommLogs(Array.isArray(resLogs) ? resLogs : []);
      setSettings(resSettings && !resSettings.error ? resSettings : null);
      setNotices(Array.isArray(resNotices) ? resNotices : []);
    } catch (err) {
      console.error("Error fetching communication hub data:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // -------------------------------------------------------------
  // Notice Direct Management (CRUD)
  // -------------------------------------------------------------
  const handleAddNotice = async (newNoticeData: Omit<Notice, 'id' | 'date'>) => {
    try {
      await communicationService.createNotice(newNoticeData as any);
      showToast("Announcement successfully published to campus notice board!");
      fetchCoreData();
    } catch (e: any) {
      console.error(e);
      setErrorBanner(e.message || "Failed to publish notice.");
    }
  };

  const handleUpdateNotice = async (id: string, updatedFields: Partial<Notice>) => {
    try {
      await communicationService.updateNotice(id, updatedFields as any);
      showToast("Notice successfully updated.");
      fetchCoreData();
    } catch (e: any) {
      console.error(e);
      setErrorBanner(e.message || "Failed to update notice.");
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notice? This action is irreversible.")) return;
    try {
      await communicationService.deleteNotice(id);
      showToast("Notice successfully deleted.");
      fetchCoreData();
    } catch (e: any) {
      console.error(e);
      setErrorBanner(e.message || "Failed to delete notice.");
    }
  };

  const handleAcknowledgeNotice = async (noticeId: string) => {
    if (!currentUser) {
      alert("Please login first to acknowledge this notice.");
      return;
    }
    const userId = currentUser.id || 'anonymous-user';
    try {
      await communicationService.acknowledgeNotice(noticeId, userId);
      showToast("Acknowledgement receipt logged successfully!");
      fetchCoreData();
    } catch (e) {
      console.error(e);
    }
  };

  const getNoticeCategoryColor = (cat: Notice['category']) => {
    switch (cat) {
      case 'Exam':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Academic':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Holiday':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Event':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleOpenEditNotice = (n: Notice) => {
    setEditingNotice(n);
    setNoticeTitle(n.title);
    setNoticeContent(n.content);
    setNoticeCategory(n.category);
    setNoticeImportant(n.important);
    setNoticeTargetRole(n.targetRole);
    setIsNoticeFormOpen(true);
  };

  const handleSubmitNoticeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      setErrorBanner("Notice title and content are required.");
      return;
    }
    const payload = {
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      category: noticeCategory,
      important: noticeImportant,
      targetRole: noticeTargetRole,
      createdBy: currentUser?.name || 'Administrator',
      acknowledgedBy: editingNotice ? editingNotice.acknowledgedBy : []
    };

    if (editingNotice) {
      await handleUpdateNotice(editingNotice.id, payload);
    } else {
      await handleAddNotice(payload);
    }
    setIsNoticeFormOpen(false);
    setEditingNotice(null);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeCategory('General');
    setNoticeImportant(false);
    setNoticeTargetRole('all');
  };

  const handleExportNoticesPDF = (noticesToExport: Notice[]) => {
    if (noticesToExport.length === 0) return;

    const doc = new jsPDF();
    
    // Header Style
    doc.setFillColor(15, 23, 42); // slate-900 (matches header)
    doc.rect(0, 0, 210, 38, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text("LEARNER'S DEN ACADEMY", 15, 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("CAMPUS NOTICE BOARD & ANNOUNCEMENTS REGISTRY", 15, 22);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Registrar's Office`, 15, 28);
    
    let y = 50;
    
    noticesToExport.forEach((notice, idx) => {
      // Content size calculations
      const splitContent = doc.splitTextToSize(notice.content, 175);
      const contentHeight = splitContent.length * 5;
      const cardHeight = 25 + contentHeight;
      
      // Page break check before starting a card
      if (y + cardHeight > 270) {
        doc.addPage();
        y = 20;
      }

      // Box or border for notice card
      doc.setFillColor(250, 250, 250); // soft off-white
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(15, y, 180, cardHeight, 'FD');
      
      // Left vertical accent bar for urgent ones
      if (notice.important) {
        doc.setFillColor(79, 70, 229); // Indigo 600
        doc.rect(15, y, 2.5, cardHeight, 'F');
      }
      
      // Title
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      const titlePrefix = notice.important ? "[PINNED URGENT] " : "";
      doc.text(`${titlePrefix}${notice.title}`, 20, y + 8);
      
      // Metadata line
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      const ackCount = (notice.acknowledgedBy || []).length;
      doc.text(`Category: ${notice.category} | Date: ${notice.date} | Posted by: ${notice.createdBy} | Acknowledged: ${ackCount} users`, 20, y + 14);
      
      // Thin line separation
      doc.setDrawColor(241, 245, 249);
      doc.line(18, y + 17, 192, y + 17);
      
      // Content body
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text(splitContent, 20, y + 23);
      
      y += cardHeight + 8;
    });
    
    // Page numbering on footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${pageCount} | Learner's Den Campus Registry Services`, 15, 290);
    }
    
    doc.save(`LearnersDen_Campus_Notices_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const sortedNotices = (() => {
    let list = Array.isArray(notices) ? notices : [];
    
    // Filter by role search/view permissions
    if (!isAdminOrStaff) {
      if (currentRole === 'student' || currentRole === 'parent') {
        list = list.filter(n => n && (n.targetRole === 'all' || n.targetRole === 'students'));
      } else if (currentRole === 'teacher') {
        list = list.filter(n => n && (n.targetRole === 'all' || n.targetRole === 'teachers'));
      } else {
        list = list.filter(n => n && n.targetRole === 'all');
      }
    } else {
      // Admins/principal see everything, but can filter audience
      if (selectedNoticeAudience !== 'all') {
        list = list.filter(n => n && n.targetRole === selectedNoticeAudience);
      }
    }

    // Filter by Category
    if (selectedNoticeCategory !== 'all') {
      list = list.filter(n => n && n.category === selectedNoticeCategory);
    }

    // Filter by Search Term
    if (noticeSearchTerm.trim()) {
      const term = noticeSearchTerm.toLowerCase();
      list = list.filter(n => 
        n && (
          n.title.toLowerCase().includes(term) || 
          n.content.toLowerCase().includes(term)
        )
      );
    }

    // Sort: Important/Urgent notices at top, then by Date descending
    return [...list].sort((a, b) => {
      const aImp = !!(a && a.important);
      const bImp = !!(b && b.important);
      if (aImp && !bImp) return -1;
      if (!aImp && bImp) return 1;
      return new Date(b ? b.date : 0).getTime() - new Date(a ? a.date : 0).getTime();
    });
  })();

  const myCommLogs = (() => {
    const list = Array.isArray(commLogs) ? commLogs : [];
    if (isAdminOrStaff) return list; // staff see everything in logs tab

    // If student/parent:
    const name = currentUser?.name || '';
    const phone = currentUser?.phone || '';
    const email = currentUser?.email || '';

    return list.filter(log => {
      if (!log || !Array.isArray(log.recipients)) return false;
      if (log.recipients.includes("All Institution Members")) return true;
      if (currentRole === 'student' && log.recipients.includes("All Students")) return true;
      if (currentRole === 'parent' && log.recipients.includes("All Parents / Guardians")) return true;
      
      // check if targeted to student's batch
      if (currentRole === 'student' && currentUser?.batchId) {
        const studentBatch = batches.find(b => b.id === currentUser.batchId);
        if (studentBatch && log.recipients.some(r => r && r.includes(`Batch: ${studentBatch.name}`))) {
          return true;
        }
      }

      // check if targeted directly
      if (log.recipients.some(r => 
        r && (
          r.toLowerCase().includes(name.toLowerCase()) || 
          r.includes(phone) || 
          r.includes(email)
        )
      )) {
        return true;
      }

      return false;
    });
  })();

  // -------------------------------------------------------------
  // Message Delivery Trigger
  // -------------------------------------------------------------
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) {
      setErrorBanner("Please write some message content first.");
      return;
    }
    if (selectedChannels.length === 0) {
      setErrorBanner("Please select at least one delivery channel (e.g., Notice Board, Email, SMS).");
      return;
    }

    setSending(true);
    setErrorBanner(null);

    // Resolve Recipient addresses/phones
    let recipientAddresses: string[] = [];
    if (targetType === 'all') {
      recipientAddresses = ['All Institution Members'];
    } else if (targetType === 'class') {
      const batch = batches.find(b => b.id === selectedBatch);
      recipientAddresses = [`All in Batch: ${batch?.name || selectedBatch}`];
    } else if (targetType === 'teachers') {
      recipientAddresses = ['All Teachers & Mentors'];
    } else if (targetType === 'parents') {
      recipientAddresses = ['All Parents / Guardians'];
    } else if (targetType === 'individual') {
      const student = students.find(s => s.id === selectedRecipientId);
      const teacher = teachers.find(t => t.id === selectedRecipientId);
      const recipientName = student?.name || teacher?.name || selectedRecipientId;
      recipientAddresses = [recipientName];
    }

    // Trigger sequential channel dispatch
    for (const channel of selectedChannels) {
      try {
        await communicationService.sendBulkMessage({
          channel: channel as any,
          recipients: recipientAddresses,
          message: messageContent,
          filterType: targetType
        });
      } catch (err: any) {
        setErrorBanner(err.message || "An unexpected sending block occurred.");
        setSending(false);
        return;
      }
    }

    showToast(`Successfully published message via ${selectedChannels.join(", ")}!`);
    setMessageContent('');
    setSubject('');
    setAttachments([]);
    setSending(false);
    fetchCoreData(); // reload log
  };

  // -------------------------------------------------------------
  // AI Writing Assistant Integration
  // -------------------------------------------------------------
  const handleAIAssist = async () => {
    if (!aiPrompt.trim()) {
      alert("Please provide some rough ideas or prompt guidelines first.");
      return;
    }
    setAiLoading(true);
    try {
      const data = await communicationService.aiAssist(aiPrompt, aiFormat);
      setAiOutput(data.suggestion || "");
    } catch (err) {
      console.error("AI Assistant error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAIOutput = () => {
    setMessageContent(aiOutput);
    showToast("Applied AI generated draft to your composer!");
  };

  // -------------------------------------------------------------
  // Manual Profile Updates
  // -------------------------------------------------------------
  const handleEditContactSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    try {
      if (editingContact.type === 'student') {
        await studentService.updateStudent(editingContact.id, {
          email: editingContact.email,
          phone: editingContact.phone,
          whatsAppNumber: editingContact.whatsApp
        });
        showToast(`Successfully updated student ${editingContact.name} profile.`);
        setEditingContact(null);
        fetchCoreData();
      } else {
        await teacherService.updateTeacher(editingContact.id, {
          email: editingContact.email,
          phone: editingContact.phone,
          whatsAppNumber: editingContact.whatsApp
        });
        showToast(`Successfully updated teacher ${editingContact.name} profile.`);
        setEditingContact(null);
        fetchCoreData();
      }
    } catch (err) {
      console.error("Error saving contact edits:", err);
    }
  };

  // -------------------------------------------------------------
  // Contact Verification Code Handler
  // -------------------------------------------------------------
  const initiateVerification = (user: any, type: 'student' | 'teacher') => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const phoneNum = user.phone || user.parentPhone || "No Mobile";
    setVerifyingUser({
      id: user.id,
      type,
      phone: phoneNum,
      code
    });
    alert(`[SMS Gateway OTP Simulation] Code sent to ${phoneNum}: ${code}`);
  };

  const handleVerifyOTP = async () => {
    if (!verifyingUser) return;
    if (verificationCode.trim() === verifyingUser.code) {
      // update verified status
      try {
        if (verifyingUser.type === 'student') {
          await studentService.updateStudent(verifyingUser.id, { contactVerified: true });
        } else {
          await teacherService.updateTeacher(verifyingUser.id, { contactVerified: true });
        }
        showToast("Contact number successfully verified and authorized!");
        setVerifyingUser(null);
        setVerificationCode('');
        fetchCoreData();
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Invalid verification OTP. Please try again.");
    }
  };

  // -------------------------------------------------------------
  // CSV Import Parser
  // -------------------------------------------------------------
  const handleCSVTextImport = () => {
    if (!importText.trim()) {
      alert("Please paste comma or tab-separated data.");
      return;
    }

    const lines = importText.split("\n").filter(l => l.trim() !== "");
    const parsedData = lines.map((line) => {
      // Split by tab first, fallback to comma
      const cols = line.includes("\t") ? line.split("\t") : line.split(",");
      return cols.map(c => c.trim().replace(/^["']|["']$/g, ""));
    });

    setImportedRows(parsedData);
    setImportLogs([`Parsed ${parsedData.length} records. Please match the columns below.`]);
  };

  const executeBulkImport = async () => {
    setLoading(true);
    const logs: string[] = [];
    let successCount = 0;
    let duplicateCount = 0;

    for (const row of importedRows) {
      const name = row[Number(mappedColumns.name)] || "";
      const role = (row[Number(mappedColumns.role)] || "student").toLowerCase();
      const phone = row[Number(mappedColumns.phone)] || "";
      const whatsApp = row[Number(mappedColumns.whatsApp)] || "";
      const email = row[Number(mappedColumns.email)] || "";

      if (!name || !phone) {
        logs.push(`Skipped empty row or missing name/phone.`);
        continue;
      }

      // Check Duplicates in current database
      if (role === 'student' || role === 'parent') {
        const isDup = students.some(s => s.phone === phone || s.email === email);
        if (isDup) {
          duplicateCount++;
          logs.push(`Duplicate Student detected (phone: ${phone} / email: ${email}). Skipped.`);
          continue;
        }

        // Add mock / default student payload
        try {
          await studentService.createStudent({
            name,
            email: email || `${name.toLowerCase().replace(/\s+/g, '')}@learnersden.com`,
            phone,
            parentName: 'Imported Parent',
            batchId: 'batch-1',
            feeStatus: 'Paid',
            admissionDate: new Date().toISOString().split('T')[0],
            whatsAppNumber: whatsApp || phone,
            contactVerified: true
          });
          successCount++;
        } catch (err) {
          logs.push(`Failed saving student ${name}.`);
        }
      } else {
        const isDup = teachers.some(t => t.phone === phone || t.email === email);
        if (isDup) {
          duplicateCount++;
          logs.push(`Duplicate Teacher detected (phone: ${phone}). Skipped.`);
          continue;
        }

        try {
          await teacherService.createTeacher({
            name,
            email: email || `${name.toLowerCase().replace(/\s+/g, '')}@learnersden.com`,
            phone,
            subject: 'Science & Maths',
            batches: ['batch-1'],
            basePay: 40000,
            hourlyRate: 350,
            payoutType: 'Fixed',
            whatsAppNumber: whatsApp || phone,
            contactVerified: true
          });
          successCount++;
        } catch (err) {
          logs.push(`Failed saving teacher ${name}.`);
        }
      }
    }

    setImportLogs([
      `Import complete: ${successCount} successfully added.`,
      `Duplicate skipped: ${duplicateCount}.`,
      ...logs
    ]);
    showToast(`Bulk imported ${successCount} contacts successfully!`);
    setImportedRows([]);
    setImportText('');
    fetchCoreData();
  };

  // -------------------------------------------------------------
  // Settings Saving
  // -------------------------------------------------------------
  const handleSaveSettings = async (updatedSettings: Partial<CommunicationSettings>) => {
    if (!settings) return;
    const nextSettings = { ...settings, ...updatedSettings };
    try {
      const data = await communicationService.updateCommunicationSettings(nextSettings);
      setSettings(data.settings);
      showToast("Communication settings successfully synchronized!");
    } catch (err) {
      console.error("Failed saving settings:", err);
    }
  };

  // -------------------------------------------------------------
  // History Cleansing
  // -------------------------------------------------------------
  const handleClearHistory = async () => {
    if (!window.confirm("Are you absolutely sure you want to clear the entire communication logs database? This action is irreversible.")) {
      return;
    }
    try {
      await communicationService.clearCommunicationLogs();
      showToast("All communication history logs successfully erased.");
      fetchCoreData();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // Contacts Filtering Logic
  // -------------------------------------------------------------
  const filteredContacts = (() => {
    const list: any[] = [];
    
    // Merge Students & Parents
    students.forEach(s => {
      if (contactRoleFilter === 'all' || contactRoleFilter === 'student') {
        list.push({
          id: s.id,
          name: s.name,
          role: 'Student',
          phone: s.phone || 'No Mobile',
          whatsApp: s.whatsAppNumber || s.phone || 'No WhatsApp',
          email: s.email || 'No Email',
          verified: !!s.contactVerified,
          raw: s,
          type: 'student'
        });
      }
      if (contactRoleFilter === 'all' || contactRoleFilter === 'parent') {
        list.push({
          id: s.id + '-parent',
          name: s.parentName || `Parent of ${s.name}`,
          role: 'Parent',
          phone: s.parentPhone || 'No Mobile',
          whatsApp: s.fatherWhatsApp || s.motherWhatsApp || s.parentPhone || 'No WhatsApp',
          email: s.parentEmail || 'No Email',
          verified: !!s.contactVerified,
          raw: s,
          type: 'student'
        });
      }
    });

    // Merge Teachers
    teachers.forEach(t => {
      if (contactRoleFilter === 'all' || contactRoleFilter === 'teacher') {
        list.push({
          id: t.id,
          name: t.name,
          role: 'Teacher',
          phone: t.phone || 'No Mobile',
          whatsApp: t.whatsAppNumber || t.phone || 'No WhatsApp',
          email: t.email || 'No Email',
          verified: !!t.contactVerified,
          raw: t,
          type: 'teacher'
        });
      }
    });

    // Apply Search Text
    return list.filter(item => {
      const query = contactSearch.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(query) || 
                            item.phone.toLowerCase().includes(query) || 
                            item.email.toLowerCase().includes(query);
      const matchesVerify = contactVerifyFilter === 'all' || 
                            (contactVerifyFilter === 'verified' && item.verified) || 
                            (contactVerifyFilter === 'unverified' && !item.verified);
      return matchesSearch && matchesVerify;
    });
  })();

  // -------------------------------------------------------------
  // Rich Attachment Simulation
  // -------------------------------------------------------------
  const handleAttachmentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(f => {
      setAttachments(prev => [...prev, { name: f.name, url: '#', type: f.type }]);
    });
  };

  const triggerManualAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(f => {
        setAttachments(prev => [...prev, { name: f.name, url: '#', type: f.type }]);
      });
    }
  };

  // -------------------------------------------------------------
  // Data Analytics for Logs
  // -------------------------------------------------------------
  const channelDistributionData = (() => {
    const counts: Record<string, number> = {
      'Notice Board': 0,
      'Email': 0,
      'SMS': 0,
      'WhatsApp': 0,
      'Push': 0,
      'Circular': 0
    };
    commLogs.forEach(log => {
      if (counts[log.channel] !== undefined) {
        counts[log.channel]++;
      } else {
        counts[log.channel] = 1;
      }
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  })();

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#25d366', '#06b6d4', '#ec4899'];

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-12" id="communication-centre-module">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 md:p-8 rounded-b-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/20">
              <Megaphone className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
              Enterprise Communication Centre
            </h1>
          </div>
          <p className="text-slate-300 text-sm mt-2 max-w-xl">
            Unified broadcast and direct message dashboard. Dispatches messages instantly to SMS, WhatsApp, Email, and notice logs in one click.
          </p>
        </div>

        {/* Action Button */}
        {isAdmin && (
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors text-white font-medium rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-indigo-900/40 border border-indigo-400/30"
          >
            <Upload className="w-4 h-4" />
            Bulk Import Contacts
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        
        {/* Navigation Rail */}
        <div className="flex overflow-x-auto pb-2 gap-2 border-b border-slate-200">
          {isAdminOrStaff && (
            <>
              <button
                onClick={() => setActiveTab('compose')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'compose' 
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Send className="w-4 h-4" />
                Unified Message Composer
              </button>
              <button
                onClick={() => setActiveTab('notices')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'notices' 
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                Notices & Announcements
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'contacts' 
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Contact Directory & OTP
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'history' 
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <History className="w-4 h-4" />
                Dispatch Logs & Delivery Reports
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('moderation')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'moderation' 
                      ? 'bg-white text-rose-700 shadow-sm border border-slate-200' 
                      : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  AI Content Moderation
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'settings' 
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Gateway Configurations
                </button>
              )}
            </>
          )}

          {!isAdminOrStaff && (
            <>
              <button
                onClick={() => setActiveTab('notices')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'notices' 
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                Official Notices & Announcements
              </button>
              <button
                onClick={() => setActiveTab('my-logs')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'my-logs' 
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <History className="w-4 h-4" />
                My Alert History & Reports
              </button>
              <button
                onClick={() => setActiveTab('my-contact')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'my-contact' 
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Contact Details & Verification
              </button>
            </>
          )}
        </div>

        {/* Global Feedback Notifications */}
        {successToast && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-slideIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-medium">{successToast}</p>
          </div>
        )}

        {errorBanner && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 animate-slideIn">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-sm font-medium">{errorBanner}</p>
          </div>
        )}

        {/* =========================================================
            TAB 1: UNIFIED COMPOSER
            ========================================================= */}
        {activeTab === 'compose' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            
            {/* Left Hand: Compose Panel */}
            <form onSubmit={handleSendMessage} className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Edit3 className="w-5 h-5 text-slate-500" />
                Compose New Message
              </h2>

              {/* Channel Selector pills */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Choose Communication Channels (Multi-Select)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Notice Board', 'Email', 'SMS', 'WhatsApp', 'Push'].map((chan) => {
                    const isSelected = selectedChannels.includes(chan);
                    return (
                      <button
                        type="button"
                        key={chan}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedChannels(selectedChannels.filter(c => c !== chan));
                          } else {
                            setSelectedChannels([...selectedChannels, chan]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-100' 
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{chan}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipient Targeting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Recipient Target Category</label>
                  <select
                    value={targetType}
                    onChange={(e: any) => setTargetType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm"
                  >
                    <option value="all">Institution-Wide (All Contacts)</option>
                    <option value="class">Target Specific Class / Batch</option>
                    <option value="teachers">Teachers & Academic Staff Only</option>
                    <option value="parents">Parents & Guardians Only</option>
                    <option value="individual">Direct / Individual Message</option>
                  </select>
                </div>

                {targetType === 'class' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Select Target Batch</label>
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm"
                    >
                      <option value="">-- Choose Batch --</option>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {targetType === 'individual' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Select Recipient Profile</label>
                    <select
                      value={selectedRecipientId}
                      onChange={(e) => setSelectedRecipientId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm"
                    >
                      <option value="">-- Choose Member --</option>
                      <optgroup label="Teachers">
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.phone || 'No Mobile'})</option>
                        ))}
                      </optgroup>
                      <optgroup label="Students">
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.phone || 'No Mobile'})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                )}
              </div>

              {/* Message Content Area */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Message Body</label>
                  <span className="text-xs text-slate-400 font-mono">{messageContent.length} chars</span>
                </div>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your official announcement, circular content, email body, or SMS message here..."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm h-48 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Drag and Drop Attachment simulation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Attachments & Media Circulars</label>
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleAttachmentDrop}
                  onClick={() => document.getElementById('manual-file-input')?.click()}
                  className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center"
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-xs text-slate-600 font-medium">Drag circular PDFs or reference images here, or <span className="text-indigo-600 font-semibold underline">browse</span></p>
                  <input 
                    type="file" 
                    multiple 
                    onChange={triggerManualAttachment} 
                    className="hidden" 
                    id="manual-file-input" 
                  />
                </div>

                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-lg text-xs font-medium">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                          className="text-rose-500 hover:text-rose-700 ml-1"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scheduling Hub */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Dispatch Scheduling Option</span>
                </div>
                
                <div className="flex gap-4">
                  {['now', 'schedule', 'recurring'].map((type) => (
                    <label key={type} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer capitalize">
                      <input
                        type="radio"
                        name="scheduleType"
                        value={type}
                        checked={schedulingType === type}
                        onChange={(e: any) => setSchedulingType(e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      {type === 'now' ? 'Send Immediately' : type === 'schedule' ? 'Schedule Future' : 'Recurring Program'}
                    </label>
                  ))}
                </div>

                {schedulingType === 'schedule' && (
                  <div className="pt-2">
                    <input
                      type="datetime-local"
                      value={scheduleDateTime}
                      onChange={(e) => setScheduleDateTime(e.target.value)}
                      className="bg-white border border-slate-200 text-xs p-2 rounded-lg"
                    />
                  </div>
                )}

                {schedulingType === 'recurring' && (
                  <div className="flex gap-3 pt-2">
                    {['daily', 'weekly', 'monthly'].map((p) => (
                      <label key={p} className="flex items-center gap-1 text-xs text-slate-600 capitalize">
                        <input
                          type="radio"
                          name="recurrencePattern"
                          value={p}
                          checked={recurrencePattern === p}
                          onChange={(e: any) => setRecurrencePattern(e.target.value)}
                          className="text-indigo-600"
                        />
                        Every {p.slice(0, -2)}ly
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMessageContent('');
                    setSubject('');
                    setAttachments([]);
                  }}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm font-medium"
                >
                  Reset Form
                </button>

                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 active:bg-indigo-700 transition-all flex items-center gap-2 disabled:bg-slate-300"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Dispatching Communications...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Dispatch Broadcast
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Right Hand: AI Writer Panel */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* AI Assistant panel */}
              <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-950">
                <div className="flex items-center gap-2 border-b border-indigo-900 pb-3 mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <h3 className="text-md font-bold tracking-tight">AI Communication Assistant</h3>
                </div>

                <p className="text-xs text-indigo-200 leading-relaxed mb-4">
                  Leverage the full server-side Gemini 3.5 Flash compiler. Write professional notices, generate instant SMS reminders, translate messages, or correct tone instantly.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xxs font-bold text-indigo-300 uppercase tracking-widest block mb-1">What are you drafting?</label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Write a quick reminder to JEE Advanced students about the upcoming weekend mock exam, tell them to arrive at 8:30 AM with their calculators."
                      className="w-full bg-slate-900/60 border border-indigo-900 text-xs p-3 rounded-xl h-24 text-indigo-100 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xxs font-bold text-indigo-300 uppercase tracking-widest block mb-1">Format</label>
                      <select
                        value={aiFormat}
                        onChange={(e) => setAiFormat(e.target.value)}
                        className="w-full bg-slate-900 text-xs p-2 rounded-lg border border-indigo-900 text-indigo-100"
                      >
                        <option value="notice">Official Notice</option>
                        <option value="sms">Short SMS</option>
                        <option value="whatsapp">Interactive WhatsApp</option>
                        <option value="email">Professional Email</option>
                        <option value="rewrite">Polite Polish</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xxs font-bold text-indigo-300 uppercase tracking-widest block mb-1">Tone Style</label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className="w-full bg-slate-900 text-xs p-2 rounded-lg border border-indigo-900 text-indigo-100"
                      >
                        <option value="Professional">Professional</option>
                        <option value="Polite & Friendly">Warm & Polite</option>
                        <option value="Urgent">Urgent Warning</option>
                        <option value="Enthusiastic">Encouraging</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAIAssist}
                    disabled={aiLoading}
                    className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 transition-colors text-white text-xs font-bold rounded-xl shadow-md flex justify-center items-center gap-2 disabled:bg-slate-700"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Generating Draft with Gemini AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Compose with AI Writer
                      </>
                    )}
                  </button>

                  {aiOutput && (
                    <div className="mt-4 p-4 bg-slate-900 border border-indigo-900 rounded-xl space-y-3 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-indigo-950 pb-2">
                        <span className="text-xs font-bold text-indigo-300">Generated Draft Output</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(aiOutput);
                            showToast("Copied to clipboard!");
                          }}
                          className="text-xxs text-indigo-400 hover:text-indigo-200 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      </div>
                      <p className="text-xs text-indigo-100 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{aiOutput}</p>
                      
                      <button
                        type="button"
                        onClick={applyAIOutput}
                        className="w-full py-2 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Apply this to Composer Editor
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Gateway Warnings */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Gateway Pre-requisites</h4>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  SMS, WhatsApp, and Emails will dispatch through our Sandbox Gateway by default. For production-ready messaging, configure Twilio, SMTP credentials or MSG91 in the **Gateway Configurations** setting tab.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: CONTACT DATABASE & VERIFICATION
            ========================================================= */}
        {activeTab === 'contacts' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6 space-y-6">
            
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Institution Contact Database
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ensure profiles contain authorized, verified contact details before starting broadcast programs.
                </p>
              </div>

              {/* Duplicate stats */}
              <div className="text-xs font-mono text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Total Contacts: <span className="font-bold text-slate-800">{filteredContacts.length}</span>
              </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search name, phone, email..."
                  className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 rounded-lg text-sm"
                />
              </div>

              <div>
                <select
                  value={contactRoleFilter}
                  onChange={(e) => setContactRoleFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students Only</option>
                  <option value="parent">Parents Only</option>
                  <option value="teacher">Teachers Only</option>
                </select>
              </div>

              <div>
                <select
                  value={contactVerifyFilter}
                  onChange={(e) => setContactVerifyFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-sm"
                >
                  <option value="all">All Verification Statuses</option>
                  <option value="verified">Verified Profile Details</option>
                  <option value="unverified">Unverified Profiles</option>
                </select>
              </div>
            </div>

            {/* Edit Slideover overlay / inline form */}
            {editingContact && (
              <form onSubmit={handleEditContactSave} className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-4 animate-slideIn">
                <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                  <h3 className="text-sm font-bold text-indigo-900">Edit Profile Contact Details: {editingContact.name}</h3>
                  <button type="button" onClick={() => setEditingContact(null)} className="text-indigo-500 hover:text-indigo-800 font-bold">&times;</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xxs font-bold text-slate-600 uppercase">Mobile Phone Number</label>
                    <input
                      type="text"
                      value={editingContact.phone}
                      onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xxs font-bold text-slate-600 uppercase">WhatsApp Number</label>
                    <input
                      type="text"
                      value={editingContact.whatsApp}
                      onChange={(e) => setEditingContact({ ...editingContact, whatsApp: e.target.value })}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xxs font-bold text-slate-600 uppercase">Email Address</label>
                    <input
                      type="email"
                      value={editingContact.email}
                      onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingContact(null)} className="px-3 py-1.5 text-slate-500 text-xs font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm">Save Changes</button>
                </div>
              </form>
            )}

            {/* OTP Verify code input modal inline */}
            {verifyingUser && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 animate-slideIn">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 animate-bounce" />
                    Simulating Contact OTP Verification Program
                  </span>
                  <button type="button" onClick={() => setVerifyingUser(null)} className="text-amber-800 font-bold">&times;</button>
                </div>
                <p className="text-xs text-amber-800">
                  An OTP has been simulated and sent to <strong>{verifyingUser.phone}</strong>. Enter the 6-digit code below to authorize contact details.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit simulated OTP"
                    className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs w-48 font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleVerifyOTP}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    Confirm Code
                  </button>
                </div>
              </div>
            )}

            {/* Core Contacts Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="p-4">Profile Name</th>
                    <th className="p-4">Role / Category</th>
                    <th className="p-4">Mobile Number</th>
                    <th className="p-4">WhatsApp Address</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredContacts.map((contact, i) => (
                    <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{contact.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xxs font-bold uppercase ${
                          contact.role === 'Student' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          contact.role === 'Parent' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                          'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}>
                          {contact.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-600">{contact.phone}</td>
                      <td className="p-4 font-mono text-slate-600">{contact.whatsApp}</td>
                      <td className="p-4 text-slate-600">{contact.email}</td>
                      <td className="p-4">
                        {contact.verified ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                            <ShieldCheck className="w-4 h-4" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
                            <AlertCircle className="w-4 h-4" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!contact.verified && (
                            <button
                              onClick={() => initiateVerification(contact.raw, contact.type)}
                              className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold flex items-center gap-1 border border-amber-200"
                            >
                              Verify OTP
                            </button>
                          )}
                          <button
                            onClick={() => setEditingContact({
                              id: contact.raw.id,
                              type: contact.type,
                              name: contact.name,
                              email: contact.email,
                              phone: contact.phone,
                              whatsApp: contact.whatsApp
                            })}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors rounded-md"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredContacts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">No contacts match the current filter query.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* =========================================================
            TAB 3: DISPATCH LOGS & ANALYTICS
            ========================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-6 mt-6 animate-fadeIn">
            
            {/* Analytical Dashboards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Stats overview boxes */}
              <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Historical Traffic Output</h3>
                  <p className="text-4xl font-extrabold text-slate-900 mt-2">{commLogs.length}</p>
                  <p className="text-xs text-slate-400 mt-1">Dispatched messages across all available channels</p>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Clear Log History:</span>
                  <button 
                    onClick={handleClearHistory}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chart: Channel distribution */}
              <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-800 text-sm font-bold border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                  Channel Usage Metrics
                </h3>
                
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelDistributionData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                        {channelDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Logs list */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Dispatched Messages History Logs</h3>

              <div className="space-y-3">
                {commLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-xl space-y-2 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xxs font-bold uppercase tracking-wider ${
                          log.channel === 'Notice Board' ? 'bg-indigo-100 text-indigo-800' :
                          log.channel === 'Email' ? 'bg-teal-100 text-teal-800' :
                          log.channel === 'SMS' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {log.channel}
                        </span>

                        <span className="text-xs text-slate-500 font-medium">Sent by <strong>{log.senderName}</strong> ({log.senderRole})</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xxs font-mono text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{log.date} at {log.time}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{log.message}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/40 text-xs">
                      <span className="text-slate-500 font-semibold truncate max-w-sm">To: <span className="font-bold text-slate-700">{log.recipients.join(", ")}</span></span>
                      
                      <div className="flex items-center gap-2">
                        {log.deliveryStatus === 'Delivered' ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Sent & Delivered
                          </span>
                        ) : log.deliveryStatus === 'Failed' ? (
                          <span className="flex items-center gap-1 text-rose-600 font-bold text-xs">
                            <AlertCircle className="w-3.5 h-3.5" /> Delivery Blocked: {log.errorMessage}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">{log.deliveryStatus}</span>
                        )}

                        <button 
                          onClick={async () => {
                            // Retry simulated send
                            try {
                              const r = await fetch('/api/communication/send', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...log })
                              });
                              if (r.ok) {
                                showToast("Simulated message retry successfully triggered!");
                                fetchCoreData();
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xxs font-semibold"
                        >
                          Resend / Retry
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {commLogs.length === 0 && (
                  <div className="p-8 text-center text-slate-400 font-medium">No communication log records exist yet. Compose a message above to get started.</div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================
            TAB 4: AI MODERATION VIOLATIONS
            ========================================================= */}
        {activeTab === 'moderation' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6 space-y-4">
            <h2 className="text-lg font-bold text-rose-950 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              AI Moderation Violations Logs
            </h2>
            <p className="text-xs text-slate-500">
              Reviews of messages flagged and blocked in real-time by the Gemini AI Safety model to prevent abusive content, threat circulars, spam or leakage of private information.
            </p>

            <div className="space-y-3 pt-3">
              {(users as any).moderationLogs?.map((mlog: any) => (
                <div key={mlog.id} className="p-4 bg-rose-50/50 border border-rose-200 text-rose-950 rounded-xl space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-xs font-bold text-rose-800">Sender: {mlog.senderName} ({mlog.senderId})</span>
                      <p className="text-xxs font-mono text-slate-400 mt-1">{mlog.timestamp}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-xxs font-bold uppercase">Blocked</span>
                  </div>
                  <p className="text-sm font-medium bg-white/70 p-3 rounded-lg border border-rose-100">{mlog.content}</p>
                  <p className="text-xs text-rose-800 font-semibold flex items-center gap-1.5 bg-rose-100/40 p-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Flagged Reason: <strong>{mlog.flagReason}</strong>
                  </p>
                </div>
              ))}

              {!(users as any).moderationLogs || (users as any).moderationLogs?.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl">
                  No moderation safety violations detected! The systems are clean and safe.
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: SETTINGS HUB
            ========================================================= */}
        {activeTab === 'settings' && settings && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6 space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Gateway Settings & API Management
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Establish parameters for external dispatch protocols (SMTP providers, Twilio or MSG91 gateways, and real-time Gemini moderation guidelines).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SMS GATEWAY SETTINGS */}
              <div className="p-5 border border-slate-200/80 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />
                  SMS Broadcast Gateway Config
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">SMS Gateway Provider</label>
                    <select
                      value={settings.smsProvider}
                      onChange={(e: any) => handleSaveSettings({ smsProvider: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                    >
                      <option value="Twilio">Twilio Gateway API</option>
                      <option value="MSG91">MSG91 Enterprise SMS</option>
                      <option value="Fast2SMS">Fast2SMS Gateway</option>
                      <option value="Textlocal">Textlocal Provider</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">DLT Template ID (Required)</label>
                    <input
                      type="text"
                      value={settings.smsDltTemplateId}
                      onChange={(e: any) => handleSaveSettings({ smsDltTemplateId: e.target.value })}
                      placeholder="e.g. 170716182522731"
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">API Access Key / User</label>
                    <input
                      type="password"
                      value={settings.smsApiKey}
                      onChange={(e: any) => handleSaveSettings({ smsApiKey: e.target.value })}
                      placeholder="SK_PROD_ACCESS_KEY"
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Sender Header ID</label>
                    <input
                      type="text"
                      value={settings.smsSenderId}
                      onChange={(e: any) => handleSaveSettings({ smsSenderId: e.target.value })}
                      placeholder="e.g. LRN_DEN"
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SMTP EMAIL SETTINGS */}
              <div className="p-5 border border-slate-200/80 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Mail className="w-4.5 h-4.5 text-teal-500" />
                  SMTP Server Configuration
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">SMTP Server Host</label>
                    <input
                      type="text"
                      value={settings.smtpHost}
                      onChange={(e: any) => handleSaveSettings({ smtpHost: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">SMTP Port ID</label>
                    <input
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e: any) => handleSaveSettings({ smtpPort: Number(e.target.value) })}
                      placeholder="587"
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">SMTP Username</label>
                    <input
                      type="text"
                      value={settings.smtpUser}
                      onChange={(e: any) => handleSaveSettings({ smtpUser: e.target.value })}
                      placeholder="e.g. notifications@learnersden.com"
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">SMTP Sender Email Address</label>
                    <input
                      type="text"
                      value={settings.smtpSenderEmail}
                      onChange={(e: any) => handleSaveSettings({ smtpSenderEmail: e.target.value })}
                      placeholder="sender@learnersden.com"
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* WHATSAPP BUSINESS GATEWAY CONFIG */}
              <div className="p-5 border border-slate-200/80 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4.5 h-4.5 text-emerald-500" />
                  WhatsApp Business API
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Phone Number Account ID</label>
                    <input
                      type="text"
                      value={settings.waPhoneNumberId}
                      onChange={(e: any) => handleSaveSettings({ waPhoneNumberId: e.target.value })}
                      placeholder="10751185512213"
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">System Webhook Endpoint</label>
                    <input
                      type="text"
                      value={settings.waWebhook}
                      onChange={(e: any) => handleSaveSettings({ waWebhook: e.target.value })}
                      placeholder="https://api.learnersden.com/wa/webhook"
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-600">System API Access Token</label>
                  <input
                    type="password"
                    value={settings.waApiToken}
                    onChange={(e: any) => handleSaveSettings({ waApiToken: e.target.value })}
                    placeholder="EAAGH1bZA2b... prod key authorization"
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* AI SAFETY & MODERATION GUIDELINES */}
              <div className="p-5 border border-slate-200/80 rounded-xl space-y-4 bg-rose-50/20 border-rose-100">
                <h3 className="text-sm font-bold text-rose-950 border-b border-rose-100 pb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
                  AI Safety Rules & Moderation Guardrails
                </h3>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">Activate Real-Time Gemini Safety Scan</p>
                    <p className="text-slate-400">Verifies safety before committing SMS, WhatsApp, and email logs.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.aiModerationEnabled}
                    onChange={(e) => handleSaveSettings({ aiModerationEnabled: e.target.checked })}
                    className="w-4.5 h-4.5 text-indigo-600 focus:ring-indigo-500 rounded border-slate-300"
                  />
                </div>

                {settings.aiModerationEnabled && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-100">
                      <input
                        type="checkbox"
                        checked={settings.aiModerationRules?.blockAbusive}
                        onChange={(e) => {
                          const nextRules = { ...settings.aiModerationRules, blockAbusive: e.target.checked };
                          handleSaveSettings({ aiModerationRules: nextRules });
                        }}
                        className="text-rose-600 rounded"
                      />
                      <span>Block Abusive Text</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-100">
                      <input
                        type="checkbox"
                        checked={settings.aiModerationRules?.blockHateSpeech}
                        onChange={(e) => {
                          const nextRules = { ...settings.aiModerationRules, blockHateSpeech: e.target.checked };
                          handleSaveSettings({ aiModerationRules: nextRules });
                        }}
                        className="text-rose-600 rounded"
                      />
                      <span>Block Hate Speech</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-100">
                      <input
                        type="checkbox"
                        checked={settings.aiModerationRules?.blockPhishing}
                        onChange={(e) => {
                          const nextRules = { ...settings.aiModerationRules, blockPhishing: e.target.checked };
                          handleSaveSettings({ aiModerationRules: nextRules });
                        }}
                        className="text-rose-600 rounded"
                      />
                      <span>Block Phishing Links</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-100">
                      <input
                        type="checkbox"
                        checked={settings.aiModerationRules?.blockSpam}
                        onChange={(e) => {
                          const nextRules = { ...settings.aiModerationRules, blockSpam: e.target.checked };
                          handleSaveSettings({ aiModerationRules: nextRules });
                        }}
                        className="text-rose-600 rounded"
                      />
                      <span>Block Spam / Promos</span>
                    </label>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* =========================================================
            TAB 6: NOTICES & CAMPUS ANNOUNCEMENTS
            ========================================================= */}
        {activeTab === 'notices' && (
          <div className="space-y-6 mt-6 animate-fadeIn" id="notices-board-hub">
            
            {/* Header / Search Filters bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={noticeSearchTerm}
                    onChange={(e) => setNoticeSearchTerm(e.target.value)}
                    placeholder="Search notices, dates, contents..."
                    className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedNoticeCategory}
                  onChange={(e) => setSelectedNoticeCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs p-2 rounded-xl"
                >
                  <option value="all">All Categories</option>
                  <option value="General">General Announcements</option>
                  <option value="Academic">Academic Circulars</option>
                  <option value="Exam">Examination Notices</option>
                  <option value="Event">Institutions Events</option>
                  <option value="Holiday">Holidays & Closures</option>
                </select>

                {isAdminOrStaff && (
                  <select
                    value={selectedNoticeAudience}
                    onChange={(e) => setSelectedNoticeAudience(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs p-2 rounded-xl"
                  >
                    <option value="all">All Audiences</option>
                    <option value="students">Students & Parents Only</option>
                    <option value="teachers">Teachers Only</option>
                  </select>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleExportNoticesPDF(sortedNotices)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export PDF Registry
                </button>

                {isAdminOrStaff && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNotice(null);
                      setNoticeTitle('');
                      setNoticeContent('');
                      setNoticeCategory('General');
                      setNoticeImportant(false);
                      setNoticeTargetRole('all');
                      setIsNoticeFormOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Publish Notice
                  </button>
                )}
              </div>
            </div>

            {/* Pinned Urgent Notice Section */}
            {sortedNotices.some(n => n.important) && (
              <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Pin className="w-4 h-4 text-indigo-600 animate-bounce" />
                  Pinned / Urgent campus bulletins
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedNotices.filter(n => n.important).map(notice => {
                    const isAcked = currentUser && (notice.acknowledgedBy || []).includes(currentUser.name);
                    return (
                      <div key={notice.id} className="bg-white p-5 rounded-xl border-l-4 border-indigo-600 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getNoticeCategoryColor(notice.category)}`}>
                              {notice.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{notice.date}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors">
                            {notice.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                            {notice.content}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                          <span>By: {notice.createdBy}</span>
                          
                          <div className="flex items-center gap-2">
                            {!isAdminOrStaff ? (
                              <button
                                type="button"
                                onClick={() => handleAcknowledgeNotice(notice.id)}
                                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                                  isAcked 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                                {isAcked ? 'Read & Acknowledged' : 'Mark as Read'}
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                                  {(notice.acknowledgedBy || []).length} acks
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditNotice(notice)}
                                  className="text-indigo-600 hover:text-indigo-950 p-1"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteNotice(notice.id)}
                                  className="text-rose-600 hover:text-rose-950 p-1"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standard Notice Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                All Announcements & Bulletins ({sortedNotices.filter(n => !n.important).length})
              </h3>

              {sortedNotices.filter(n => !n.important).length === 0 && (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                  No active general notices match your search queries.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedNotices.filter(n => !n.important).map(notice => {
                  const isAcked = currentUser && (notice.acknowledgedBy || []).includes(currentUser.name);
                  return (
                    <div key={notice.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getNoticeCategoryColor(notice.category)}`}>
                            {notice.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{notice.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {notice.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                          {notice.content}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                        <span>By: {notice.createdBy}</span>
                        
                        <div className="flex items-center gap-2">
                          {!isAdminOrStaff ? (
                            <button
                              type="button"
                              onClick={() => handleAcknowledgeNotice(notice.id)}
                              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                                isAcked 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              {isAcked ? 'Read & Acknowledged' : 'Mark as Read'}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                                {(notice.acknowledgedBy || []).length} acks
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenEditNotice(notice)}
                                className="text-indigo-600 hover:text-indigo-950 p-1 font-bold"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNotice(notice.id)}
                                className="text-rose-600 hover:text-rose-950 p-1 font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Display acknowledgment name badges for Admin */}
                      {isAdminOrStaff && (notice.acknowledgedBy || []).length > 0 && (
                        <div className="mt-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Acks received from:</p>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                            {(notice.acknowledgedBy || []).map((name, idx) => (
                              <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-[9px] px-1 py-0.5 rounded">
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NOTICE PUBLISH / EDIT MODAL */}
            {isNoticeFormOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleSubmitNoticeForm} className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-indigo-600" />
                      {editingNotice ? 'Edit Announcement Bulletin' : 'Publish New Campus Announcement'}
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setIsNoticeFormOpen(false)}
                      className="text-slate-400 hover:text-slate-800 font-extrabold text-xl"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Notice Headline / Title</label>
                      <input
                        type="text"
                        required
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        placeholder="e.g., JEE Advanced Revision Batch Timetable Updates"
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Notice Category</label>
                        <select
                          value={noticeCategory}
                          onChange={(e: any) => setNoticeCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm"
                        >
                          <option value="General">General</option>
                          <option value="Academic">Academic</option>
                          <option value="Exam">Exam</option>
                          <option value="Event">Event</option>
                          <option value="Holiday">Holiday</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Target Audience Role</label>
                        <select
                          value={noticeTargetRole}
                          onChange={(e: any) => setNoticeTargetRole(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm"
                        >
                          <option value="all">Everyone (All members)</option>
                          <option value="students">Students & Parents Only</option>
                          <option value="teachers">Teachers Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Announcement Body Content</label>
                      <textarea
                        required
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                        placeholder="Provide details about dates, syllabus, requirements..."
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm h-36"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <input
                        type="checkbox"
                        checked={noticeImportant}
                        onChange={(e) => setNoticeImportant(e.target.checked)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-indigo-950">Pin to top as Urgent Announcement</p>
                        <p className="text-slate-500 text-[10px]">Urgent announcements get high-contrast indigo outlines and are pinned at the top.</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsNoticeFormOpen(false)}
                      className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                    >
                      {editingNotice ? 'Update Notice' : 'Publish Announcement'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 7: MY DELIVERY LOGS & AUDIT REPORTS (Students/Parents)
            ========================================================= */}
        {activeTab === 'my-logs' && (
          <div className="space-y-6 mt-6 animate-fadeIn" id="my-alerts-logs">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-500" />
                    My Direct Dispatch Logs & Delivery Reports
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    An audit history of all direct messages, SMS notices, and custom emails sent by Learner's Den to your account.
                  </p>
                </div>
                
                <div className="bg-slate-100 text-[10px] text-slate-600 px-3 py-1.5 rounded-lg font-mono font-bold self-start">
                  Recipient Profile: {currentUser?.name || 'Loading'} ({currentRole})
                </div>
              </div>

              {/* Log List */}
              <div className="space-y-4">
                {myCommLogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No matching direct email, SMS, or WhatsApp dispatches recorded for your contact details.
                  </div>
                ) : (
                  myCommLogs.map((log) => (
                    <div key={log.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-150 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 uppercase bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xxs">
                            {log.channel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.date} {log.time}</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.deliveryStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          log.deliveryStatus === 'Sent' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {log.deliveryStatus} ✔
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                        {log.message}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Sender: {log.senderName}</span>
                        <span className="font-mono text-slate-300">Gateway reference: ID-{log.id.slice(-6)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 8: MY PROFILE CONTACT VERIFICATION (Students/Parents)
            ========================================================= */}
        {activeTab === 'my-contact' && (
          <div className="space-y-6 mt-6 animate-fadeIn" id="my-profile-verification">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-6">
              
              <div className="border-b border-slate-100 pb-4 text-center">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-md font-bold text-slate-800">Direct Gateway Contact Details</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ensure your contact parameters are verified to receive high-urgency exam schedules and fee reminders.
                </p>
              </div>

              {/* Member Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 font-bold">Full Name</span>
                  <span className="col-span-2 text-slate-800 font-semibold">{currentUser?.name}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 font-bold">Registered Mobile</span>
                  <span className="col-span-2 text-slate-800 font-mono font-semibold">{currentUser?.phone || 'No Phone Registered'}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 font-bold">WhatsApp Channel</span>
                  <span className="col-span-2 text-slate-800 font-mono font-semibold">{currentUser?.whatsAppNumber || currentUser?.phone || 'No WhatsApp Registered'}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 font-bold">Official Email</span>
                  <span className="col-span-2 text-slate-800 font-semibold">{currentUser?.email || 'No Email Registered'}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 text-xs items-center">
                  <span className="text-slate-500 font-bold">Verification Status</span>
                  <div className="col-span-2 flex items-center gap-2">
                    {currentUser?.contactVerified ? (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Verified Active Contact
                      </span>
                    ) : (
                      <div className="flex flex-col items-start gap-1">
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          Pending OTP Verification
                        </span>
                        
                        <button
                          type="button"
                          onClick={async () => {
                            const code = Math.floor(100000 + Math.random() * 900000).toString();
                            setVerificationCode(code);
                            setVerifyingUser({
                              id: currentUser?.id || 'sim',
                              type: currentRole,
                              phone: currentUser?.phone || '+91 9900112233',
                              code: code
                            });
                            alert(`[SIMULATION OTP] An SMS verification code has been dispatched to ${currentUser?.phone || '+91 9900112233'}. Your temporary OTP code is: ${code}`);
                          }}
                          className="text-xxs font-bold text-indigo-600 hover:underline mt-1"
                        >
                          Send Simulated OTP Verification Code
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* OTP Verifying overlay block */}
              {verifyingUser && (
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-950">Verify Your Identity Code</h4>
                  <p className="text-[10px] text-slate-500">Enter the temporary simulation code displayed to activate and secure your account details.</p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 123456"
                      id="otp-sim-input"
                      className="bg-white border border-slate-200 p-2 rounded-lg text-xs font-mono font-bold max-w-[120px]"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const inputVal = (document.getElementById('otp-sim-input') as HTMLInputElement)?.value;
                        if (inputVal === verifyingUser.code) {
                          try {
                            const route = verifyingUser.type === 'student' ? `/api/students/${verifyingUser.id}` : `/api/teachers/${verifyingUser.id}`;
                            const res = await fetch(route, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ contactVerified: true })
                            });
                            if (res.ok) {
                              showToast("Contact credentials validated and secured!");
                              setVerifyingUser(null);
                              // Refresh profile
                              fetchCoreData();
                              // Update user verified field locally so it reflects in parent context
                              if (currentUser) {
                                currentUser.contactVerified = true;
                              }
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        } else {
                          alert("Invalid verification code. Please re-enter.");
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                    >
                      Confirm Code
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* =========================================================
          MODAL: BULK IMPORT COLUMNS MAPPER
          ========================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                Bulk Contact Import Manager
              </h3>
              <button 
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportedRows([]);
                }}
                className="text-slate-400 hover:text-slate-800 font-extrabold text-xl"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste your student, parent, or teacher registry contact columns below. Supports Tab-separated spreadsheets and standard Comma-separated (CSV) rows.
            </p>

            {importedRows.length === 0 ? (
              <div className="space-y-3">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="John Doe, student, +91 9911223344, +91 9911223344, john@gmail.com&#10;Aarav Roy, teacher, +91 9811223344, +91 9811223344, aarav@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl h-44 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleCSVTextImport}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Analyze Pasted Columns
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Column Mapping Section */}
                <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700">Map your CSV / pasted columns:</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xxs font-bold text-slate-600 uppercase">
                    <label className="space-y-1 block">
                      <span>Name Column Index</span>
                      <select
                        value={mappedColumns.name}
                        onChange={(e) => setMappedColumns({ ...mappedColumns, name: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded text-xs mt-1"
                      >
                        {importedRows[0]?.map((_: any, i: number) => (
                          <option key={i} value={i}>Column {i + 1} (e.g. "{importedRows[0][i]}")</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1 block">
                      <span>Role Column Index</span>
                      <select
                        value={mappedColumns.role}
                        onChange={(e) => setMappedColumns({ ...mappedColumns, role: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded text-xs mt-1"
                      >
                        {importedRows[0]?.map((_: any, i: number) => (
                          <option key={i} value={i}>Column {i + 1} (e.g. "{importedRows[0][i]}")</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1 block">
                      <span>Phone Column Index</span>
                      <select
                        value={mappedColumns.phone}
                        onChange={(e) => setMappedColumns({ ...mappedColumns, phone: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded text-xs mt-1"
                      >
                        {importedRows[0]?.map((_: any, i: number) => (
                          <option key={i} value={i}>Column {i + 1} (e.g. "{importedRows[0][i]}")</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1 block">
                      <span>WhatsApp Column Index</span>
                      <select
                        value={mappedColumns.whatsApp}
                        onChange={(e) => setMappedColumns({ ...mappedColumns, whatsApp: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded text-xs mt-1"
                      >
                        {importedRows[0]?.map((_: any, i: number) => (
                          <option key={i} value={i}>Column {i + 1} (e.g. "{importedRows[0][i]}")</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                {/* Import logs/feedback */}
                <div className="max-h-28 overflow-y-auto bg-slate-900 text-slate-100 p-3 rounded-lg text-xxs font-mono space-y-1">
                  {importLogs.map((log, idx) => (
                    <p key={idx}>{log}</p>
                  ))}
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => setImportedRows([])}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                  >
                    Back to Raw Paste
                  </button>
                  <button
                    onClick={executeBulkImport}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Execute Contact Imports
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
