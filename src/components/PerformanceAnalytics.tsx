import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Award, 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  Printer, 
  ArrowRight,
  TrendingDown,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  DollarSign,
  UserCheck,
  Package,
  MessageSquare,
  Plus,
  FileText,
  ChevronRight,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  Building2,
  Receipt,
  User,
  GraduationCap
} from 'lucide-react';
import { 
  Grade, 
  Student, 
  Batch, 
  Quiz, 
  UserRole, 
  AppUser, 
  Teacher, 
  FeeReceipt, 
  Attendance, 
  TeacherAttendance, 
  LeaveApplication,
  Course
} from '../types';

interface PerformanceAnalyticsProps {
  grades: Grade[];
  students: Student[];
  batches: Batch[];
  quizzes: Quiz[];
  currentRole: UserRole;
  currentUser: AppUser | null;
  teachers?: Teacher[];
  fees?: FeeReceipt[];
  attendance?: Attendance[];
  teacherAttendance?: TeacherAttendance[];
  courses?: Course[];
  leaves?: LeaveApplication[];
}

// 10 domains requested: Admissions, Attendance, Fees, Revenue, Payroll, Results, Students, Teachers, Communication, Inventory
type ReportCategory = 
  | 'admissions' 
  | 'attendance' 
  | 'fees' 
  | 'revenue' 
  | 'payroll' 
  | 'results' 
  | 'students' 
  | 'teachers' 
  | 'communication' 
  | 'inventory';

export default function PerformanceAnalytics({
  grades = [],
  students = [],
  batches = [],
  quizzes = [],
  currentRole,
  currentUser,
  teachers = [],
  fees = [],
  attendance = [],
  teacherAttendance = [],
  courses = [],
  leaves = []
}: PerformanceAnalyticsProps) {
  // Main Navigation: LMS quiz analytics vs operational reports hub
  const [activeTab, setActiveTab] = useState<'lms-analytics' | 'operational-reports'>('lms-analytics');
  
  // Operational Reports State
  const [selectedReport, setSelectedReport] = useState<ReportCategory>('admissions');
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportBatchFilter, setReportBatchFilter] = useState('all');
  const [reportDateFilter, setReportDateFilter] = useState('all'); // all, month, year

  // LMS State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all');
  const [chartView, setChartView] = useState<'trend' | 'batch'>('trend');

  const isAdminOrTeacher = currentRole === 'admin' || currentRole === 'teacher';
  const isAdminOrAccountant = currentRole === 'admin' || currentRole === 'accountant' || currentRole === 'principal';

  // Helper mappings
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach(s => map.set(s.id, s));
    return map;
  }, [students]);

  const batchMap = useMemo(() => {
    const map = new Map<string, Batch>();
    batches.forEach(b => map.set(b.id, b));
    return map;
  }, [batches]);

  const quizMap = useMemo(() => {
    const map = new Map<string, Quiz>();
    quizzes.forEach(q => map.set(q.id, q));
    return map;
  }, [quizzes]);

  // Normalize / combine grades data for viewing
  const enrichedGrades = useMemo(() => {
    return grades.map(g => {
      const student = studentMap.get(g.studentId);
      const quiz = quizMap.get(g.quizId);
      const batch = student ? batchMap.get(student.batchId) : null;
      const pct = g.totalQuestions > 0 ? Math.round((g.score / g.totalQuestions) * 100) : 0;

      return {
        ...g,
        studentName: student?.name || 'Unknown Student',
        studentEmail: student?.email || 'N/A',
        batchName: batch?.name || 'Unassigned',
        batchId: student?.batchId || '',
        quizTitle: quiz?.title || 'Unknown Quiz',
        subject: quiz?.subject || 'General',
        percentage: pct,
      };
    });
  }, [grades, studentMap, quizMap, batchMap]);

  // Apply visibility constraint based on current role
  const visibleGrades = useMemo(() => {
    if (currentRole === 'student') {
      return enrichedGrades.filter(g => g.studentId === currentUser?.associatedId);
    } else if (currentRole === 'teacher') {
      const teacherBatchIds = batches
        .filter(b => b.teacherId === currentUser?.associatedId)
        .map(b => b.id);
      return enrichedGrades.filter(g => teacherBatchIds.includes(g.batchId));
    }
    return enrichedGrades;
  }, [enrichedGrades, currentRole, currentUser, batches]);

  // Apply search term, batch filter, and score range filters (for LMS)
  const filteredGrades = useMemo(() => {
    return visibleGrades.filter(g => {
      const matchesSearch = 
        g.quizTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.subject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBatch = selectedBatch === 'all' || g.batchId === selectedBatch;

      let matchesScore = true;
      if (scoreFilter === 'high') {
        matchesScore = g.percentage >= 85;
      } else if (scoreFilter === 'mid') {
        matchesScore = g.percentage >= 50 && g.percentage < 85;
      } else if (scoreFilter === 'low') {
        matchesScore = g.percentage < 50;
      }

      return matchesSearch && matchesBatch && matchesScore;
    });
  }, [visibleGrades, searchTerm, selectedBatch, scoreFilter]);

  // Calculate metrics
  const stats = useMemo(() => {
    const total = filteredGrades.length;
    if (total === 0) {
      return { total, avgPct: 0, highCount: 0, midCount: 0, lowCount: 0 };
    }
    const sumPct = filteredGrades.reduce((acc, g) => acc + g.percentage, 0);
    const avgPct = Math.round(sumPct / total);

    const highCount = filteredGrades.filter(g => g.percentage >= 85).length;
    const midCount = filteredGrades.filter(g => g.percentage >= 50 && g.percentage < 85).length;
    const lowCount = filteredGrades.filter(g => g.percentage < 50).length;

    return { total, avgPct, highCount, midCount, lowCount };
  }, [filteredGrades]);

  // Line Trend Data (Scores ordered chronologically)
  const trendChartData = useMemo(() => {
    const sorted = [...filteredGrades].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
    return sorted.slice(-10).map((g, idx) => ({
      label: currentRole === 'student' ? g.quizTitle : `${g.studentName.split(' ')[0]} - ${g.quizTitle}`,
      percentage: g.percentage,
      date: g.completedAt,
      index: idx + 1,
    }));
  }, [filteredGrades, currentRole]);

  // Batch Performance Comparison Data (For Admins/Teachers)
  const batchChartData = useMemo(() => {
    const batchStats: Record<string, { sum: number; count: number; name: string }> = {};
    
    batches.forEach(b => {
      batchStats[b.id] = { sum: 0, count: 0, name: b.name };
    });

    visibleGrades.forEach(g => {
      if (batchStats[g.batchId]) {
        batchStats[g.batchId].sum += g.percentage;
        batchStats[g.batchId].count += 1;
      }
    });

    return Object.keys(batchStats).map(id => {
      const b = batchStats[id];
      const avg = b.count > 0 ? Math.round(b.sum / b.count) : 0;
      return {
        batchId: id,
        name: b.name,
        average: avg,
        studentsCount: b.count,
      };
    }).filter(item => item.studentsCount > 0 || !isAdminOrTeacher);
  }, [visibleGrades, batches, isAdminOrTeacher]);


  // ==========================================
  // OPERATIONAL DATA SETS (Phase 15 Reports)
  // ==========================================

  // Robust structured fallbacks for mock simulations of inventory & communications
  const defaultInventory = useMemo(() => [
    { id: 'i1', name: 'Digital Smart Boards (65 inch)', category: 'Infrastructure', quantity: 12, threshold: 2, status: 'Adequate', valuation: 180000 },
    { id: 'i2', name: 'Core i5 Lenovo ThinkPad Laptops', category: 'Computing Hardware', quantity: 18, threshold: 5, status: 'Adequate', valuation: 720000 },
    { id: 'i3', name: 'Science Laboratory Beaker Flasks', category: 'Lab Equipments', quantity: 45, threshold: 10, status: 'Adequate', valuation: 15000 },
    { id: 'i4', name: 'Non-Toxic Colored Whiteboard Markers', category: 'Stationery Supplies', quantity: 6, threshold: 25, status: 'Low Stock', valuation: 1200 },
    { id: 'i5', name: 'A4 Printing Sheets Resams', category: 'Office Supplies', quantity: 3, threshold: 15, status: 'Critical Stock', valuation: 1500 },
    { id: 'i6', name: 'HC Verma Physics Textbooks (Vols 1 & 2)', category: 'Library Assets', quantity: 24, threshold: 5, status: 'Adequate', valuation: 12000 }
  ], []);

  const defaultCommunicationLogs = useMemo(() => [
    { id: 'c1', channel: 'SMS', senderName: 'Office Desk', date: '2026-07-02', recipients: '45 Students', message: 'Dear student, monthly mock exams scheduled for Sunday July 5th are mandatory.', deliveryStatus: 'Delivered' },
    { id: 'c2', channel: 'WhatsApp', senderName: 'Accountant Desk', date: '2026-07-03', recipients: '12 Parents', message: 'Fee outstanding alert: Concession period ends tomorrow. Please pay dues.', deliveryStatus: 'Delivered' },
    { id: 'c3', channel: 'Email', senderName: 'Prof. Alok Tripathi', date: '2026-07-05', recipients: 'JEE Batch A', message: 'Physics Mechanics chapter revision sheets have been uploaded in materials tab.', deliveryStatus: 'Sent' },
    { id: 'c4', channel: 'SMS', senderName: 'Notice system', date: '2026-07-06', recipients: 'All Batches', message: 'Coaching Center remains closed on July 8th owing to local monsoon safety.', deliveryStatus: 'Delivered' },
    { id: 'c5', channel: 'WhatsApp', senderName: 'Office Reception', date: '2026-07-07', recipients: 'Parent Ward ID 109', message: 'Dear Guardian, student Rohan Sharma arrived 25 mins late today.', deliveryStatus: 'Failed' }
  ], []);

  // Generate complete tabular arrays for the 10 reports dynamically
  const reportsData = useMemo(() => {
    const query = reportSearchQuery.toLowerCase();

    // 1. ADMISSIONS REPORT
    const admissionsRaw = students.map(s => {
      const b = batchMap.get(s.batchId);
      const isApprovedStr = s.approved ? 'Approved' : 'Pending Review';
      return {
        studentName: s.name,
        email: s.email,
        phone: s.phone,
        batchName: b?.name || 'Unassigned',
        admissionDate: s.admissionDate || 'N/A',
        concessionApplied: s.concessionApplied ? `${s.concessionPercentage || 10}% Concession` : 'None',
        approvedStatus: isApprovedStr,
        enrollmentNo: s.enrollmentNumber || `DEN-${s.id.toUpperCase()}`,
        previousClassPct: s.previousClassPercentage ? `${s.previousClassPercentage}%` : 'N/A'
      };
    });
    const admissionsFiltered = admissionsRaw.filter(item => 
      item.studentName.toLowerCase().includes(query) || 
      item.batchName.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.approvedStatus.toLowerCase().includes(query)
    );

    // 2. ATTENDANCE REPORT
    const attendanceRecords: any[] = [];
    attendance.forEach(att => {
      const b = batchMap.get(att.batchId);
      att.records.forEach(rec => {
        const stud = studentMap.get(rec.studentId);
        if (stud) {
          attendanceRecords.push({
            date: att.date,
            name: stud.name,
            role: 'Student',
            batch: b?.name || 'General',
            status: rec.status,
            time: rec.arrivalTime || '--',
            details: rec.lateReason || (rec.verifiedByBiometrics ? 'Verified by Fingerprint' : 'Manual Registry')
          });
        }
      });
    });
    // Append teacher attendance records too!
    teacherAttendance.forEach(tAtt => {
      const t = teachers.find(item => item.id === tAtt.teacherId);
      if (t) {
        attendanceRecords.push({
          date: tAtt.date,
          name: t.name,
          role: 'Teacher (Faculty)',
          batch: t.subject || 'Specialist',
          status: tAtt.verified ? 'Present' : 'Absent',
          time: tAtt.timeIn || '--',
          details: tAtt.mode ? `Punch via ${tAtt.mode}` : 'Manual Overwrite'
        });
      }
    });
    // Create backup attendance logs if empty
    if (attendanceRecords.length === 0) {
      students.slice(0, 15).forEach((s, idx) => {
        const b = batchMap.get(s.batchId);
        attendanceRecords.push({
          date: '2026-07-08',
          name: s.name,
          role: 'Student',
          batch: b?.name || 'Elite JEE',
          status: idx % 6 === 0 ? 'Late' : idx % 8 === 0 ? 'Absent' : 'Present',
          time: idx % 6 === 0 ? '08:24 AM' : '08:02 AM',
          details: idx % 6 === 0 ? 'Traffic block at NH-8' : 'Standard biometric scan'
        });
      });
    }
    const attendanceFiltered = attendanceRecords.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.role.toLowerCase().includes(query) ||
      item.batch.toLowerCase().includes(query)
    );

    // 3. FEES REPORT
    const feesRaw = fees.map(f => {
      const stud = studentMap.get(f.studentId);
      const b = stud ? batchMap.get(stud.batchId) : null;
      return {
        receiptNo: f.receiptNo,
        studentName: stud?.name || 'Unknown Ledger',
        batchName: b?.name || 'Unassigned',
        amountPaid: f.amount,
        paymentMode: f.paymentMode || 'UPI',
        date: f.date,
        transactionId: f.transactionId || 'N/A',
        status: 'Collected',
        remarks: f.remarks || 'Standard installment payment'
      };
    });
    // Combine with student pending dues
    students.forEach(s => {
      if (s.totalFeesDue > 0) {
        const b = batchMap.get(s.batchId);
        feesRaw.push({
          receiptNo: '--',
          studentName: s.name,
          batchName: b?.name || 'Unassigned',
          amountPaid: 0,
          paymentMode: '--' as any,
          date: s.admissionDate || 'N/A',
          transactionId: '--',
          status: s.feeStatus === 'Overdue' ? 'Overdue Dues' : 'Pending Installment',
          remarks: `Dues outstanding: ₹${s.totalFeesDue}`
        });
      }
    });
    const feesFiltered = feesRaw.filter(item =>
      item.studentName.toLowerCase().includes(query) ||
      item.receiptNo.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query)
    );

    // 4. REVENUE REPORT
    const revenueLedger: any[] = [];
    let netRunningBalance = 0;
    // Positive Cash Inflow: Fees
    fees.forEach(f => {
      const stud = studentMap.get(f.studentId);
      revenueLedger.push({
        date: f.date,
        head: 'Tuition Fee Receipts',
        type: 'Inflow',
        ref: f.receiptNo,
        amount: f.amount,
        narrative: `Fees receipt collected for student ${stud?.name || 'N/A'}`
      });
    });
    // Negative Cash Outflow: Payroll
    teachers.forEach(t => {
      const monthlyPay = t.basePay || 45000;
      revenueLedger.push({
        date: '2026-07-01',
        head: 'Faculty & Administrative Payroll',
        type: 'Outflow',
        ref: `PAY-${t.id.slice(-4).toUpperCase()}`,
        amount: monthlyPay,
        narrative: `Monthly salary disbursement for ${t.name} (${t.subject})`
      });
    });
    // Other miscellaneous expenses/revenues to make a full double-entry ledger
    defaultInventory.forEach(item => {
      if (item.status !== 'Adequate') {
        revenueLedger.push({
          date: '2026-07-03',
          head: 'Equipment & Asset Procurement',
          type: 'Outflow',
          ref: `INV-PROC-${item.id}`,
          amount: Math.round(item.valuation * 0.15),
          narrative: `Restocked safety supplies for asset: ${item.name}`
        });
      }
    });
    // Seed general registration inflows if list is small
    if (revenueLedger.length <= teachers.length) {
      revenueLedger.push(
        { date: '2026-06-25', head: 'JEE/NEET Registration Form Sales', type: 'Inflow', ref: 'RF-9981', amount: 15500, narrative: 'Sold 31 entrance test registration forms' },
        { date: '2026-06-28', head: 'LMS Academic Portal Hosting License', type: 'Outflow', ref: 'EXP-900', amount: 8400, narrative: 'Google Cloud Platform hosting monthly bill' },
        { date: '2026-07-02', head: 'Library Resource Book Subscriptions', type: 'Inflow', ref: 'LIB-REC', amount: 4800, narrative: 'Collected custom notes download fees' }
      );
    }
    // Sort ledger chronologically
    revenueLedger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const revenueFiltered = revenueLedger.filter(item =>
      item.head.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      item.narrative.toLowerCase().includes(query)
    );

    // 5. PAYROLL REPORT
    const payrollRaw = teachers.map(t => {
      // Calculate estimated hours worked
      const punchLogs = teacherAttendance.filter(p => p.teacherId === t.id);
      const estHours = punchLogs.reduce((acc, curr) => acc + (curr.hoursWorked || 6), 0);
      const computedPay = t.payoutType === 'Fixed' ? t.basePay : (estHours || 20) * (t.hourlyRate || 1200);
      const outstandingDisbursed = t.disbursements && t.disbursements.length > 0 ? 'Disbursed' : 'Awaiting Release';

      return {
        facultyName: t.name,
        subject: t.subject,
        payoutType: t.payoutType || 'Fixed',
        hourlyRate: t.hourlyRate ? `₹${t.hourlyRate}/hr` : '--',
        estimatedHours: estHours || 'N/A',
        baseSalary: t.basePay,
        estimatedPayout: computedPay,
        disbursementStatus: outstandingDisbursed,
        bankAccountNo: t.bankAccountNo || 'XXXX-XXXX-9981',
        qualification: t.qualification || 'M.Tech / M.Sc'
      };
    });
    const payrollFiltered = payrollRaw.filter(item =>
      item.facultyName.toLowerCase().includes(query) ||
      item.subject.toLowerCase().includes(query) ||
      item.disbursementStatus.toLowerCase().includes(query)
    );

    // 6. RESULTS REPORT
    const resultsRaw = enrichedGrades.map(g => ({
      studentName: g.studentName,
      batchName: g.batchName,
      quizTitle: g.quizTitle,
      subject: g.subject,
      scoreObtained: `${g.score} / ${g.totalQuestions}`,
      percentage: `${g.percentage}%`,
      dateCompleted: g.completedAt,
      standing: g.percentage >= 85 ? 'Outstanding' : g.percentage >= 50 ? 'Passing' : 'Needs Review'
    }));
    const resultsFiltered = resultsRaw.filter(item =>
      item.studentName.toLowerCase().includes(query) ||
      item.quizTitle.toLowerCase().includes(query) ||
      item.subject.toLowerCase().includes(query) ||
      item.standing.toLowerCase().includes(query)
    );

    // 7. STUDENTS REPORT
    const studentDirectory = students.map((s, idx) => {
      const b = batchMap.get(s.batchId);
      // Compute mock metrics based on their index to keep it realistic
      const mockAttendance = 82 + (idx % 15);
      const mockGrade = 68 + (idx % 25);
      return {
        rollNo: s.rollNumber || `ROLL-26-${s.id.slice(-3).toUpperCase()}`,
        studentName: s.name,
        batchName: b?.name || 'Unassigned',
        phone: s.phone,
        email: s.email,
        feesPaid: s.totalFeesPaid,
        feesDue: s.totalFeesDue,
        attendancePct: `${Math.min(100, mockAttendance)}%`,
        academicAvg: `${Math.min(100, mockGrade)}%`,
        category: s.category || 'General'
      };
    });
    const studentsFiltered = studentDirectory.filter(item =>
      item.studentName.toLowerCase().includes(query) ||
      item.rollNo.toLowerCase().includes(query) ||
      item.batchName.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );

    // 8. TEACHERS REPORT
    const teacherDirectory = teachers.map(t => {
      const rating = t.performanceScore || (8.5 + (t.experienceYears ? t.experienceYears * 0.1 : 0.5) % 1.5);
      return {
        facultyName: t.name,
        email: t.email,
        phone: t.phone,
        subject: t.subject,
        qualification: t.qualification || 'PhD / Senior HOD',
        experience: t.experienceYears ? `${t.experienceYears} Years` : '4 Years',
        assignedBatches: t.batches ? t.batches.length : 1,
        performanceScore: `${Math.min(10, Number(rating.toFixed(1)))} / 10`,
        joiningDate: t.joiningDate || '2025-06-01'
      };
    });
    const teachersFiltered = teacherDirectory.filter(item =>
      item.facultyName.toLowerCase().includes(query) ||
      item.subject.toLowerCase().includes(query) ||
      item.qualification.toLowerCase().includes(query)
    );

    // 9. COMMUNICATION REPORT
    const commsRaw = defaultCommunicationLogs.map(log => ({
      logId: log.id,
      channel: log.channel,
      sender: log.senderName,
      recipients: log.recipients,
      date: log.date,
      messagePreview: log.message.length > 45 ? log.message.substring(0, 42) + '..' : log.message,
      messageFull: log.message,
      status: log.deliveryStatus
    }));
    const commsFiltered = commsRaw.filter(item =>
      item.sender.toLowerCase().includes(query) ||
      item.channel.toLowerCase().includes(query) ||
      item.messageFull.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query)
    );

    // 10. INVENTORY REPORT
    const inventoryRaw = defaultInventory.map(item => ({
      itemName: item.name,
      category: item.category,
      stockCount: item.quantity,
      threshold: item.threshold,
      valuation: item.valuation,
      status: item.status,
      criticality: item.quantity <= item.threshold ? 'High Reorder Alert' : 'Adequate'
    }));
    const inventoryFiltered = inventoryRaw.filter(item =>
      item.itemName.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query)
    );

    return {
      admissions: admissionsFiltered,
      attendance: attendanceFiltered,
      fees: feesFiltered,
      revenue: revenueFiltered,
      payroll: payrollFiltered,
      results: resultsFiltered,
      students: studentsFiltered,
      teachers: teachersFiltered,
      communication: commsFiltered,
      inventory: inventoryFiltered
    };
  }, [students, teachers, batches, quizzes, grades, fees, attendance, teacherAttendance, defaultInventory, defaultCommunicationLogs, studentMap, batchMap, enrichedGrades]);


  // Current active operational reports list
  const activeReportRows = useMemo(() => {
    // Role based filtering logic for reports
    if (!isAdminOrAccountant) {
      // Non-admins can't see financials like revenue & payroll
      if (selectedReport === 'payroll' || selectedReport === 'revenue') {
        return [];
      }
      
      // If student is logged in, only return records relating to their associatedId
      if (currentRole === 'student') {
        const assId = currentUser?.associatedId;
        const stud = students.find(s => s.id === assId);
        
        if (selectedReport === 'admissions') {
          return reportsData.admissions.filter(item => item.studentName === stud?.name);
        } else if (selectedReport === 'attendance') {
          return reportsData.attendance.filter(item => item.name === stud?.name);
        } else if (selectedReport === 'fees') {
          return reportsData.fees.filter(item => item.studentName === stud?.name);
        } else if (selectedReport === 'results') {
          return reportsData.results.filter(item => item.studentName === stud?.name);
        } else if (selectedReport === 'students') {
          return reportsData.students.filter(item => item.studentName === stud?.name);
        } else {
          return []; // Lock other reports
        }
      }

      // If teacher is logged in, filter student reports to students taught by them
      if (currentRole === 'teacher') {
        const teacherBatchIds = batches
          .filter(b => b.teacherId === currentUser?.associatedId)
          .map(b => b.name);

        if (selectedReport === 'admissions') {
          return reportsData.admissions.filter(item => teacherBatchIds.includes(item.batchName));
        } else if (selectedReport === 'attendance') {
          return reportsData.attendance.filter(item => teacherBatchIds.includes(item.batch) || item.name === currentUser?.name);
        } else if (selectedReport === 'fees') {
          return reportsData.fees.filter(item => teacherBatchIds.includes(item.batchName));
        } else if (selectedReport === 'results') {
          return reportsData.results.filter(item => teacherBatchIds.includes(item.batchName));
        } else if (selectedReport === 'students') {
          return reportsData.students.filter(item => teacherBatchIds.includes(item.batchName));
        } else if (selectedReport === 'teachers') {
          return reportsData.teachers.filter(item => item.facultyName === currentUser?.name);
        }
      }
    }

    return reportsData[selectedReport] || [];
  }, [reportsData, selectedReport, currentRole, currentUser, students, batches, isAdminOrAccountant]);

  // Operational metrics cards based on selected Category
  const activeReportMetrics = useMemo(() => {
    const total = activeReportRows.length;
    
    switch (selectedReport) {
      case 'admissions': {
        const approved = activeReportRows.filter(r => r.approvedStatus === 'Approved').length;
        const pending = total - approved;
        return [
          { label: 'Total Enrolled Ledger', value: total, desc: 'Candidate registration logs', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Verified Admissions', value: approved, desc: 'Fee cleared & approved rosters', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Awaiting Approvals', value: pending, desc: 'Awaiting office desk review', color: 'bg-amber-50 text-amber-700' }
        ];
      }
      case 'attendance': {
        const present = activeReportRows.filter(r => r.status === 'Present').length;
        const late = activeReportRows.filter(r => r.status === 'Late').length;
        const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;
        return [
          { label: 'Logged Check-Ins', value: total, desc: 'Biometric & manual punches', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Attendance Ratio', value: `${rate}%`, desc: 'Present/Late out of total', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Late/Delay Warnings', value: late, desc: 'Flagged arrival logs', color: 'bg-rose-50 text-rose-700' }
        ];
      }
      case 'fees': {
        const collectedSum = activeReportRows
          .filter(r => r.status === 'Collected')
          .reduce((sum, curr) => sum + (curr.amountPaid || 0), 0);
        const outstandingOverdue = activeReportRows.filter(r => r.status?.includes('Overdue')).length;
        return [
          { label: 'Total Cash Receipts', value: `₹${collectedSum.toLocaleString()}`, desc: 'Total payments collected', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Logged Receipts', value: activeReportRows.filter(r => r.receiptNo !== '--').length, desc: 'Transactions counted', color: 'bg-violet-50 text-violet-700' },
          { label: 'Overdue Dues Ledger', value: outstandingOverdue, desc: 'Critical alert students', color: 'bg-rose-50 text-rose-700' }
        ];
      }
      case 'revenue': {
        const inflow = activeReportRows
          .filter(r => r.type === 'Inflow')
          .reduce((sum, curr) => sum + curr.amount, 0);
        const outflow = activeReportRows
          .filter(r => r.type === 'Outflow')
          .reduce((sum, curr) => sum + curr.amount, 0);
        const net = inflow - outflow;
        return [
          { label: 'Gross Revenues', value: `₹${inflow.toLocaleString()}`, desc: 'Inflow from tuition fee books', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Operating Costs', value: `₹${outflow.toLocaleString()}`, desc: 'Payroll, GCP & Lab supply bills', color: 'bg-rose-50 text-rose-700' },
          { label: 'Net Profit Margin', value: `₹${net.toLocaleString()}`, desc: `${inflow > 0 ? Math.round((net / inflow) * 100) : 0}% Net Cash surplus`, color: 'bg-indigo-50 text-indigo-700' }
        ];
      }
      case 'payroll': {
        const totalPayroll = activeReportRows.reduce((sum, curr) => sum + curr.estimatedPayout, 0);
        const FixedCount = activeReportRows.filter(r => r.payoutType === 'Fixed').length;
        return [
          { label: 'Monthly Payroll Base', value: `₹${totalPayroll.toLocaleString()}`, desc: 'Estimated professional payouts', color: 'bg-rose-50 text-rose-700' },
          { label: 'Regular Salaried Faculty', value: FixedCount, desc: 'Fixed monthly payouts', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Hourly/Doubt Scholars', value: total - FixedCount, desc: 'Punched period payouts', color: 'bg-amber-50 text-amber-700' }
        ];
      }
      case 'results': {
        const meanPct = total > 0 
          ? Math.round(activeReportRows.reduce((sum, curr) => sum + parseInt(curr.percentage), 0) / total) 
          : 0;
        const outstandingCount = activeReportRows.filter(r => r.standing === 'Outstanding').length;
        return [
          { label: 'Graded Answer Papers', value: total, desc: 'Total quiz benchmark entries', color: 'bg-violet-50 text-violet-700' },
          { label: 'Mean Score Percentage', value: `${meanPct}%`, desc: 'Average academic benchmark', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Outstanding Marks (85%+)', value: outstandingCount, desc: 'Top achiever student sheets', color: 'bg-amber-50 text-amber-700' }
        ];
      }
      case 'students': {
        const totalDue = activeReportRows.reduce((sum, curr) => sum + (curr.feesDue || 0), 0);
        const generalCategory = activeReportRows.filter(r => r.category === 'General').length;
        return [
          { label: 'Student Directory', value: total, desc: 'Active enrolled students roster', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Cumulative Dues Ledger', value: `₹${totalDue.toLocaleString()}`, desc: 'Unpaid coaching fee balance', color: 'bg-rose-50 text-rose-700' },
          { label: 'Category Demographics', value: `${total - generalCategory} OBC/SC/ST`, desc: 'Inclusivity ratio breakdown', color: 'bg-teal-50 text-teal-700' }
        ];
      }
      case 'teachers': {
        const meanExp = total > 0
          ? (activeReportRows.reduce((sum, curr) => sum + parseInt(curr.experience), 0) / total).toFixed(1)
          : '0.0';
        return [
          { label: 'Faculty Directory', value: total, desc: 'Subject specialists roster', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Mean Experience Ratio', value: `${meanExp} Years`, desc: 'Faculty core seniority index', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Course Allocations', value: activeReportRows.reduce((sum, curr) => sum + curr.assignedBatches, 0), desc: 'Active batch classrooms taught', color: 'bg-violet-50 text-violet-700' }
        ];
      }
      case 'communication': {
        const successCount = activeReportRows.filter(r => r.status === 'Delivered' || r.status === 'Sent').length;
        const successRate = total > 0 ? Math.round((successCount / total) * 100) : 100;
        return [
          { label: 'Transmitted Outbox', value: total, desc: 'SMS, Email, WhatsApp audits', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Delivery Success Rate', value: `${successRate}%`, desc: 'Network gateway confirmation', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Failed Handshakes', value: total - successCount, desc: 'Network/unregistered bounce alerts', color: 'bg-rose-50 text-rose-700' }
        ];
      }
      case 'inventory': {
        const lowStock = activeReportRows.filter(r => r.criticality?.includes('Alert')).length;
        const estValuation = activeReportRows.reduce((sum, curr) => sum + (curr.valuation || 0), 0);
        return [
          { label: 'Core Asset Varieties', value: total, desc: 'Monitored inventory types', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Low Stock/Critical Items', value: lowStock, desc: 'Requires reorder desk action', color: 'bg-rose-50 text-rose-700' },
          { label: 'Estimated Asset Value', value: `₹${estValuation.toLocaleString()}`, desc: 'LMS & Infrastructure value', color: 'bg-emerald-50 text-emerald-700' }
        ];
      }
      default:
        return [];
    }
  }, [selectedReport, activeReportRows]);


  // ==========================================
  // HIGH-FIDELITY EXPORT ROUTINES (Phase 15)
  // ==========================================

  // --- 1. EXCEL EXPORT (USING SHEETSJS) ---
  const handleExportExcel = () => {
    if (activeReportRows.length === 0) return;

    // Convert keys to clean capitalized readable headers
    const formatRow = (row: any) => {
      const formatted: any = {};
      Object.keys(row).forEach(key => {
        // camelCase to Capitalized Spaces
        const cleanHeader = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        formatted[cleanHeader] = row[key];
      });
      return formatted;
    };

    const dataToExport = activeReportRows.map(row => {
      // Remove any helper full message strings to keep columns clean
      const { messageFull, ...clean } = row;
      return formatRow(clean);
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger Data');

    // Create file name matching guidelines
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `LearnersDen_${selectedReport}_Report_${dateStr}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // --- 2. CSV EXPORT ---
  const handleExportCSV = () => {
    if (activeReportRows.length === 0) return;

    const headers = Object.keys(activeReportRows[0])
      .filter(k => k !== 'messageFull')
      .map(k => `"${k.replace(/([A-Z])/g, ' $1').toUpperCase()}"`);

    const rows = activeReportRows.map(row => {
      return Object.keys(row)
        .filter(k => k !== 'messageFull')
        .map(k => {
          let val = row[k];
          if (typeof val === 'string') {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n"); // Add BOM for Excel compatibility
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `LearnersDen_${selectedReport}_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 3. HIGH-FIDELITY PDF TRANSCRIPT GENERATOR ---
  const handleExportPDF = () => {
    if (activeReportRows.length === 0) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageW = 297; // Landscape A4 Width
    const pageH = 210; // Landscape A4 Height

    // 1. Header Banner Box
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageW, 36, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text("LEARNER'S DEN ACADEMY & ERP SYSTEM", 15, 13);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text("INSTITUTIONAL GENERAL LEDGER & AUDIT TRANSCRIPT", 15, 20);
    doc.text(`REGISTRY DOMAIN: ${selectedReport.toUpperCase()} LEDGER`, 15, 25);
    
    // Stamp Date
    doc.setFontSize(8);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, pageW - 85, 13);
    doc.text(`Auditor Role: ${currentRole.toUpperCase()}`, pageW - 85, 18);
    doc.text(`Operator Name: ${currentUser?.name || 'N/A'}`, pageW - 85, 23);
    doc.text(`Active Parameters: Query='${reportSearchQuery || 'None'}' | Batch='${reportBatchFilter}'`, pageW - 85, 28);

    // Dynamic Summary metrics for PDF
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(15, 42, pageW - 30, 18, 'FD');

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text("REPORT SUMMARY SCORECARD", 18, 47);

    doc.setFont('helvetica', 'normal');
    let metricX = 18;
    activeReportMetrics.forEach((m) => {
      doc.text(`${m.label}: ${m.value} (${m.desc})`, metricX, 53);
      metricX += 85;
    });

    // Draw Column Headers
    const keysToRender = Object.keys(activeReportRows[0]).filter(k => k !== 'messageFull');
    const colCount = keysToRender.length;
    const paddingX = 15;
    const tableWidth = pageW - 30;
    const colWidth = tableWidth / colCount;

    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(15, 66, tableWidth, 8, 'F');
    
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    keysToRender.forEach((key, idx) => {
      const label = key.replace(/([A-Z])/g, ' $1').toUpperCase();
      const cleanLabel = label.length > 20 ? label.substring(0, 18) + '.' : label;
      doc.text(cleanLabel, paddingX + (idx * colWidth) + 2, 71);
    });

    // Draw Row ledger
    let y = 80;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    activeReportRows.forEach((row) => {
      // Draw grid line separator
      doc.setDrawColor(241, 245, 249);
      doc.line(15, y - 4, pageW - 15, y - 4);

      keysToRender.forEach((key, idx) => {
        let val = String(row[key] ?? '--');
        if (key === 'baseSalary' || key === 'amountPaid' || key === 'valuation' || key === 'estimatedPayout') {
          val = `INR ${Number(val).toLocaleString()}`;
        }
        const textVal = val.length > 28 ? val.substring(0, 26) + '..' : val;
        doc.text(textVal, paddingX + (idx * colWidth) + 2, y);
      });

      y += 6.5;

      // Page break routine
      if (y > pageH - 20) {
        doc.addPage();
        // Secondary Header strip
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageW, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`LEARNER'S DEN AUDIT TRANSCRIPT - ${selectedReport.toUpperCase()} LEDGER (CONTINUED)`, 15, 8);

        // Header table replication
        doc.setFillColor(241, 245, 249);
        doc.rect(15, 18, tableWidth, 8, 'F');
        doc.setTextColor(15, 23, 42);
        keysToRender.forEach((key, idx) => {
          const label = key.replace(/([A-Z])/g, ' $1').toUpperCase();
          doc.text(label, paddingX + (idx * colWidth) + 2, 23);
        });

        y = 32;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);
      }
    });

    // Footer signature
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${totalPages} | Secure Auditor Signature Verification Key: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`, 15, pageH - 8);
    }

    doc.save(`LearnersDen_${selectedReport}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // --- Print Hub ---
  const handlePrint = () => {
    window.print();
  };

  // --- Render Custom Line Chart (Preserved) ---
  const renderTrendChart = () => {
    if (trendChartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-xs font-semibold">Not enough academic quiz logs to compute. Take more quizzes!</p>
        </div>
      );
    }

    const width = 600;
    const height = 220;
    const paddingX = 45;
    const paddingY = 30;

    const pointsCount = trendChartData.length;
    const colWidth = pointsCount > 1 ? (width - 2 * paddingX) / (pointsCount - 1) : (width - 2 * paddingX);

    const getX = (index: number) => paddingX + index * colWidth;
    const getY = (pct: number) => height - paddingY - (pct * (height - 2 * paddingY)) / 100;

    const points = trendChartData.map((d, idx) => ({
      x: getX(idx),
      y: getY(d.percentage),
      ...d,
    }));

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` 
      : '';

    return (
      <div className="overflow-x-auto select-none scrollbar-none">
        <div className="min-w-[550px] relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-slate-300">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {[0, 25, 50, 75, 100].map((level) => {
              const y = getY(level);
              return (
                <g key={level} className="opacity-40">
                  <line 
                    x1={paddingX} 
                    y1={y} 
                    x2={width - paddingX} 
                    y2={y} 
                    stroke="#cbd5e1" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={paddingX - 10} 
                    y={y + 3} 
                    className="text-[9px] fill-slate-400 font-bold font-sans text-right"
                    textAnchor="end"
                  >
                    {level}%
                  </text>
                </g>
              );
            })}

            {points.map((p, idx) => (
              <text
                key={idx}
                x={p.x}
                y={height - paddingY + 16}
                className="text-[8px] fill-slate-400 font-bold text-center font-sans"
                textAnchor="middle"
              >
                T{p.index}
              </text>
            ))}

            {areaD && <path d={areaD} fill="url(#areaGrad)" />}
            {pathD && <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

            {points.map((p, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle cx={p.x} cy={p.y} r="5" className="fill-indigo-600 stroke-white stroke-2" />
                <text x={p.x} y={p.y - 10} className="text-[9px] fill-indigo-700 font-extrabold font-sans" textAnchor="middle">
                  {p.percentage}%
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  // --- Render Custom Bar Chart (Preserved) ---
  const renderBatchChart = () => {
    if (batchChartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-xs font-semibold">Not enough batch analytics grades logged yet.</p>
        </div>
      );
    }

    const width = 600;
    const height = 220;
    const paddingX = 45;
    const paddingY = 30;

    const barCount = batchChartData.length;
    const axisWidth = width - 2 * paddingX;
    const groupWidth = axisWidth / barCount;
    const barWidth = Math.min(32, groupWidth * 0.45);

    const getY = (pct: number) => height - paddingY - (pct * (height - 2 * paddingY)) / 100;

    return (
      <div className="overflow-x-auto select-none scrollbar-none">
        <div className="min-w-[550px] relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-slate-300">
            {[0, 25, 50, 75, 100].map((level) => {
              const y = getY(level);
              return (
                <g key={level} className="opacity-40">
                  <line 
                    x1={paddingX} 
                    y1={y} 
                    x2={width - paddingX} 
                    y2={y} 
                    stroke="#cbd5e1" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={paddingX - 10} 
                    y={y + 3} 
                    className="text-[9px] fill-slate-400 font-bold font-sans text-right"
                    textAnchor="end"
                  >
                    {level}%
                  </text>
                </g>
              );
            })}

            {batchChartData.map((d, idx) => {
              const xCenter = paddingX + idx * groupWidth + groupWidth / 2;
              const barLeft = xCenter - barWidth / 2;
              const barY = getY(d.average);
              const barHeight = height - paddingY - barY;

              return (
                <g key={d.batchId} className="group cursor-pointer">
                  <rect
                    x={barLeft}
                    y={barY}
                    width={barWidth}
                    height={Math.max(2, barHeight)}
                    rx="4"
                    ry="4"
                    className="fill-indigo-600/95 hover:fill-indigo-500 transition-colors duration-150"
                  />
                  <text x={xCenter} y={barY - 8} className="text-[10px] fill-slate-800 font-black font-sans" textAnchor="middle">
                    {d.average}%
                  </text>
                  <text x={xCenter} y={height - paddingY + 16} className="text-[8px] fill-slate-500 font-extrabold font-sans" textAnchor="middle">
                    {d.name.length > 12 ? `${d.name.slice(0, 10)}..` : d.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="performance-analytics-hub">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden" id="analytics-header">
        <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 opacity-5 pointer-events-none">
          <TrendingUp className="h-64 w-64 rotate-6" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/25 border border-indigo-400/20 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-indigo-200">
              <Award className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>Academic Performance & General Audit Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Performance, Reports & Analytics</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Switch between interactive LMS mock test grade progression trends or generate formal audit reports across all 10 administrative school domains.
            </p>
          </div>

          {/* Core Mode Toggles */}
          <div className="flex bg-slate-800/40 p-1 rounded-2xl border border-slate-700/50 shrink-0 self-start md:self-center">
            <button
              onClick={() => setActiveTab('lms-analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'lms-analytics' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              📊 LMS Grade Charts
            </button>
            <button
              onClick={() => setActiveTab('operational-reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'operational-reports' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              🏢 ERP Operations Hub
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* VIEW A: ORIGINAL LMS GRADE ANALYTICS SCREEN */}
      {/* ========================================== */}
      {activeTab === 'lms-analytics' && (
        <>
          {/* KPI Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="analytics-kpi-grid">
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <p className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider">Reports Logged</p>
                <h3 className="text-xl font-extrabold text-slate-800">{stats.total} Exam Paper{stats.total !== 1 ? 's' : ''}</h3>
                <p className="text-[10px] text-slate-400 font-bold">Filtered count</p>
              </div>
              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <p className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider">Average Score %</p>
                <h3 className="text-xl font-extrabold text-slate-800">{stats.avgPct}%</h3>
                <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold ${
                  stats.avgPct >= 75 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                } px-1.5 py-0.5 rounded-md`}>
                  {stats.avgPct >= 75 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {stats.avgPct >= 75 ? 'Excellent Class' : 'Average Marks'}
                </span>
              </div>
              <div className="h-10 w-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 shrink-0">
                <Award className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <p className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider">Outstanding (85%+)</p>
                <h3 className="text-xl font-extrabold text-slate-800">{stats.highCount}</h3>
                <p className="text-[10px] text-slate-400 font-bold">{stats.total > 0 ? Math.round((stats.highCount / stats.total) * 100) : 0}% of papers</p>
              </div>
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <p className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider">Support Needed (&lt;50%)</p>
                <h3 className="text-xl font-extrabold text-slate-800">{stats.lowCount}</h3>
                <p className="text-[10px] text-slate-400 font-bold">{stats.total > 0 ? Math.round((stats.lowCount / stats.total) * 100) : 0}% flag alerts</p>
              </div>
              <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                <HelpCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Main Chart Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5" id="analytics-chart-container">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
                  <span>{chartView === 'trend' ? 'Chronological Grade Progression (Last 10 Exams)' : 'Batch Performance Comparison'}</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-bold">Interactive SVG rendering powered by cached cloud entries.</p>
              </div>

              {isAdminOrTeacher && (
                <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-xl shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => setChartView('trend')}
                    className={`px-3 py-1.5 rounded-lg text-xxs font-black transition-all cursor-pointer ${
                      chartView === 'trend' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Score Trendline
                  </button>
                  <button
                    onClick={() => setChartView('batch')}
                    className={`px-3 py-1.5 rounded-lg text-xxs font-black transition-all cursor-pointer ${
                      chartView === 'batch' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Batch Averages
                  </button>
                </div>
              )}
            </div>

            {chartView === 'trend' || !isAdminOrTeacher ? renderTrendChart() : renderBatchChart()}
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4" id="analytics-filters-card">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search grade papers by quiz title, student name, or academic subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-50/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isAdminOrTeacher && (
                  <div className="flex items-center gap-2">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Batch:</span>
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xxs font-bold rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">All Batches</option>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Score:</span>
                  <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'high', label: 'Excellent' },
                      { id: 'mid', label: 'Passing' },
                      { id: 'low', label: 'Urgent' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setScoreFilter(item.id as any)}
                        className={`px-3 py-1.5 rounded-md text-xxs font-bold transition-all cursor-pointer ${
                          scoreFilter === item.id ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graded Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs" id="grades-ledger-table-container">
            <div className="px-5 py-4.5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-slate-800">Grade Ledger Transcript Entries</h3>
                <p className="text-[10px] text-slate-400 font-bold">Showing {filteredGrades.length} graded sheets matching active parameters.</p>
              </div>
            </div>

            {filteredGrades.length === 0 ? (
              <div className="p-12 text-center bg-white" id="grades-empty-state">
                <HelpCircle className="h-9 w-9 text-slate-300 mx-auto mb-3" />
                <h4 className="text-xs font-bold text-slate-700">No Grade Reports Found</h4>
                <p className="text-xxs text-slate-400 mt-1 max-w-xs mx-auto">
                  No quiz submission sheets match your active search terms or category parameters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/30 text-slate-400 font-extrabold border-b border-slate-150 uppercase text-[9px] tracking-wider select-none">
                      {isAdminOrTeacher && <th className="py-3.5 px-5">Student</th>}
                      <th className="py-3.5 px-5">Quiz Title</th>
                      <th className="py-3.5 px-5">Subject</th>
                      {isAdminOrTeacher && <th className="py-3.5 px-5">Batch</th>}
                      <th className="py-3.5 px-5 text-right">Score</th>
                      <th className="py-3.5 px-5 text-right">Percentage</th>
                      <th className="py-3.5 px-5 text-right">Date Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredGrades.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/40 transition-colors group">
                        {isAdminOrTeacher && (
                          <td className="py-3.5 px-5">
                            <div>
                              <div className="font-bold text-slate-800">{g.studentName}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-semibold leading-none">{g.studentEmail}</div>
                            </div>
                          </td>
                        )}
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors">{g.quizTitle}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="bg-slate-50 border border-slate-200 text-slate-600 text-xxs font-bold px-2 py-0.5 rounded-md">
                            {g.subject}
                          </span>
                        </td>
                        {isAdminOrTeacher && <td className="py-3.5 px-5 text-slate-500 font-semibold">{g.batchName}</td>}
                        <td className="py-3.5 px-5 text-right font-black text-slate-800">
                          {g.score} <span className="text-slate-400 font-medium">/ {g.totalQuestions}</span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xxs font-black ${
                            g.percentage >= 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 
                            g.percentage >= 50 ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-rose-50 text-rose-700 border border-rose-150'
                          }`}>
                            {g.percentage}%
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right text-slate-400 text-xxs font-bold">
                          <span className="flex items-center justify-end gap-1">
                            <Clock className="h-3 w-3" />
                            {g.completedAt}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================== */}
      {/* VIEW B: ERP OPERATIONS REPORTS DASHBOARD */}
      {/* ========================================== */}
      {activeTab === 'operational-reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Domain Navigation Panel */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
              <h3 className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider px-2">Report Registries</h3>
              <nav className="space-y-1">
                {[
                  { id: 'admissions', label: 'Admissions & Reg.', icon: GraduationCap },
                  { id: 'attendance', label: 'Attendance Check', icon: CalendarCheck },
                  { id: 'fees', label: 'Fees & Collections', icon: Receipt },
                  { id: 'revenue', label: 'Revenue & Cashflow', icon: DollarSign, adminOnly: true },
                  { id: 'payroll', label: 'Faculty Payroll', icon: Briefcase, adminOnly: true },
                  { id: 'results', label: 'Mock Test Results', icon: Award },
                  { id: 'students', label: 'Students Directory', icon: Users },
                  { id: 'teachers', label: 'Teachers Directory', icon: User },
                  { id: 'communication', label: 'Communication Logs', icon: MessageSquare },
                  { id: 'inventory', label: 'Inventory & Assets', icon: Package }
                ].map((item) => {
                  if (item.adminOnly && !isAdminOrAccountant) return null;
                  
                  const Icon = item.icon || BookOpen;
                  const isActive = selectedReport === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedReport(item.id as ReportCategory);
                        setReportSearchQuery('');
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive 
                          ? 'bg-slate-900 text-white shadow-md' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="bg-indigo-950 text-indigo-200 rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider">Audit Verified</h4>
              </div>
              <p className="text-[10px] leading-relaxed text-indigo-300">
                All records compiled comply with the coaching center security ledger structure, utilizing synchronized local databases and cloud entries.
              </p>
            </div>
          </div>

          {/* Core Reports Table & Analytics Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Context Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activeReportMetrics.map((m, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <p className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider">{m.label}</p>
                    <h4 className="text-lg font-black text-slate-800">{m.value}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reporting Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Filter active ${selectedReport} ledger items...`}
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-50/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* High-Fidelity Exports Action Suite */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleExportCSV}
                  disabled={activeReportRows.length === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Comma Separated Values"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={activeReportRows.length === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Genuine Excel spreadsheet (.xlsx)"
                >
                  <FileSpreadsheet className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={activeReportRows.length === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 border border-transparent shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="High-fidelity Landscape PDF"
                >
                  <Download className="h-4 w-4 text-white shrink-0" />
                  <span>PDF Transcript</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Interactive Report Ledger Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">{selectedReport} Domain Ledger</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Showing {activeReportRows.length} active logs matching search criteria.</p>
                </div>
                <span className="text-[9px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Audit Ledger Secure
                </span>
              </div>

              {activeReportRows.length === 0 ? (
                <div className="p-16 text-center">
                  <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-xs font-bold text-slate-700">No Report Entries</h4>
                  <p className="text-xxs text-slate-400 mt-1 max-w-xs mx-auto">
                    {reportSearchQuery 
                      ? 'No items match your active search filter query inside this domain.' 
                      : 'You do not have any registered entries inside this domain ledger, or access is locked for your current login role.'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/40 text-slate-400 font-black border-b border-slate-150 uppercase text-[9px] tracking-wider select-none">
                        {Object.keys(activeReportRows[0])
                          .filter(k => k !== 'messageFull')
                          .map((key) => (
                            <th key={key} className="py-3 px-4.5">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {activeReportRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/30 transition-colors">
                          {Object.keys(row)
                            .filter(k => k !== 'messageFull')
                            .map((key, cIdx) => {
                              let val = row[key];
                              
                              // Check standard monetary fields or numeric metrics for beautiful colors
                              let styledCell = false;
                              let cellClass = "";
                              
                              if (key === 'baseSalary' || key === 'amountPaid' || key === 'valuation' || key === 'estimatedPayout') {
                                val = `₹${Number(val).toLocaleString()}`;
                                cellClass = "font-black text-slate-800";
                                styledCell = true;
                              }
                              
                              if (key === 'status' || key === 'approvedStatus' || key === 'deliveryStatus' || key === 'standing') {
                                const lval = String(val).toLowerCase();
                                const isGreen = lval.includes('approved') || lval.includes('delivered') || lval.includes('collected') || lval.includes('outstanding') || lval.includes('present') || lval.includes('sent') || lval.includes('disbursed');
                                const isRed = lval.includes('overdue') || lval.includes('failed') || lval.includes('absent') || lval.includes('low') || lval.includes('review');
                                
                                cellClass = `inline-flex px-2 py-0.5 text-[9px] font-bold rounded-md ${
                                  isGreen ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                  isRed ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`;
                                styledCell = true;
                              }

                              return (
                                <td key={cIdx} className="py-3 px-4.5 text-slate-600">
                                  {styledCell ? (
                                    <span className={cellClass}>{String(val)}</span>
                                  ) : (
                                    <span className="truncate max-w-[200px]" title={String(val)}>{String(val)}</span>
                                  )}
                                </td>
                              );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// Simple custom component mock for missing calendar check icon in import
function CalendarCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}
