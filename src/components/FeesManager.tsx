import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, Search, Calendar, CreditCard, Receipt, FileText, 
  CheckCircle, Clock, Sparkles, Bot, Tag, Users, Download, 
  QrCode, Upload, Save, Trash, HelpCircle, Coins, Plus, 
  TrendingUp, TrendingDown, Landmark, FileSpreadsheet, Printer, 
  ArrowUpRight, ArrowDownRight, Edit3, ShieldCheck, Check, Laptop, Sparkle, X
} from 'lucide-react';
import { FeeReceipt, Student, PaymentSettings, Teacher, TeacherAttendance, Batch } from '../types';
import { jsPDF } from 'jspdf';
import StudentSelector from './StudentSelector';

interface FeesManagerProps {
  fees: FeeReceipt[];
  students: Student[];
  onCollectFees: (studentId: string, amount: number, mode: string, meta?: any) => Promise<void>;
  paymentSettings?: PaymentSettings;
  onUpdatePaymentSettings?: (settings: PaymentSettings) => Promise<void>;
  teachers?: Teacher[];
  teacherAttendance?: TeacherAttendance[];
  batches?: Batch[];
}

interface Expense {
  id: string;
  description: string;
  category: 'Salaries' | 'Rent' | 'Utilities' | 'Hardware/Assets' | 'Marketing' | 'Supplies' | 'Other';
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
}

interface OtherIncome {
  id: string;
  description: string;
  source: 'Study Guides' | 'Exam Registrations' | 'Donations' | 'Rentals' | 'Other';
  amount: number;
  date: string;
}

export default function FeesManager({ 
  fees, 
  students, 
  onCollectFees,
  paymentSettings,
  onUpdatePaymentSettings,
  teachers = [],
  teacherAttendance = [],
  batches = []
}: FeesManagerProps) {
  // Navigation tabs for unified Finance module
  const [activeTab, setActiveTab] = useState<'fees' | 'payroll' | 'expenses' | 'reports'>('fees');

  const [searchTerm, setSearchTerm] = useState('');
  const [payStudentId, setPayStudentId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'Cash' | 'Card' | 'Online' | 'UPI'>('UPI');
  const [successMsg, setSuccessMsg] = useState('');

  // Institution Payment Settings form states
  const [upiIdInput, setUpiIdInput] = useState(paymentSettings?.upiId || 'learnersden@okaxis');
  const [merchantNameInput, setMerchantNameInput] = useState(paymentSettings?.merchantName || "Learner's Den");
  const [instructionsInput, setInstructionsInput] = useState(paymentSettings?.instructions || '');
  const [customQrUrlInput, setCustomQrUrlInput] = useState(paymentSettings?.customQrUrl || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Sync settings when loaded
  useEffect(() => {
    if (paymentSettings) {
      setUpiIdInput(paymentSettings.upiId);
      setMerchantNameInput(paymentSettings.merchantName);
      setInstructionsInput(paymentSettings.instructions || '');
      setCustomQrUrlInput(paymentSettings.customQrUrl || '');
    }
  }, [paymentSettings]);

  // Advanced Payment Form States
  const [paymentType, setPaymentType] = useState<'Full' | 'Installment'>('Full');
  const [installmentNo, setInstallmentNo] = useState('1');
  const [concessionApplied, setConcessionApplied] = useState(false);
  const [concessionType, setConcessionType] = useState('Merit Scholarship');
  const [concessionPercentage, setConcessionPercentage] = useState('10');
  const [customConcessionPercent, setCustomConcessionPercent] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [referralDiscount, setReferralDiscount] = useState('500');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');

  // Dual Expense/Income ledger states
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 'exp-1', description: 'Academic Center Monthly Rent', category: 'Rent', amount: 45000, date: '2026-07-01', status: 'Paid' },
    { id: 'exp-2', description: 'High-Speed Broadband Internet', category: 'Utilities', amount: 3200, date: '2026-07-02', status: 'Paid' },
    { id: 'exp-3', description: 'JEE/NEET Brochure Printing', category: 'Marketing', amount: 8500, date: '2026-07-03', status: 'Paid' },
    { id: 'exp-4', description: 'Electric Power Grid Charges', category: 'Utilities', amount: 12400, date: '2026-07-04', status: 'Paid' },
  ]);

  const [otherIncomes, setOtherIncomes] = useState<OtherIncome[]>([
    { id: 'inc-1', description: 'JEE Physics Formula Guides Sale', source: 'Study Guides', amount: 15400, date: '2026-07-02' },
    { id: 'inc-2', description: 'National Mock Exam Entry Fee', source: 'Exam Registrations', amount: 24000, date: '2026-07-03' },
    { id: 'inc-3', description: 'Affiliate Study Group Contribution', source: 'Other', amount: 12000, date: '2026-07-05' },
  ]);

  // Sub tab inside ledger column
  const [ledgerTab, setLedgerTab] = useState<'expenses' | 'otherIncomes'>('expenses');

  // New expense form state
  const [expDesc, setExpDesc] = useState('');
  const [expCategory, setExpCategory] = useState<Expense['category']>('Rent');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  // New other income form state
  const [incDesc, setIncDesc] = useState('');
  const [incSource, setIncSource] = useState<OtherIncome['source']>('Study Guides');
  const [incAmount, setIncAmount] = useState('');
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0]);

  // Payroll settings & disbursed state
  const [disbursedSalaries, setDisbursedSalaries] = useState<Record<string, { date: string; amount: number; slipId: string }>>({
    'teacher-2': { date: '2026-07-01', amount: 85000, slipId: 'PSL-2026-771' } // pre-populated disbursed
  });
  const [teacherBonuses, setTeacherBonuses] = useState<Record<string, number>>({});
  const [payrollSuccess, setPayrollSuccess] = useState('');

  // Payment Gateway Simulator Modal States
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [simPaymentMethod, setSimPaymentMethod] = useState<'UPI' | 'Card'>('UPI');
  const [simUpiApp, setSimUpiApp] = useState<'GPay' | 'PhonePe' | 'Paytm'>('GPay');
  const [simCardNo, setSimCardNo] = useState('');
  const [simCardName, setSimCardName] = useState('');
  const [simCardExpiry, setSimCardExpiry] = useState('');
  const [simCardCvv, setSimCardCvv] = useState('');
  const [simStatus, setSimStatus] = useState<'idle' | 'processing' | 'authorized' | 'failed'>('idle');
  const [simProgress, setSimProgress] = useState(0);

  // File processors
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG/JPG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCustomQrUrlInput(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const submitPaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdatePaymentSettings) return;
    setIsSavingSettings(true);
    try {
      await onUpdatePaymentSettings({
        upiId: upiIdInput,
        merchantName: merchantNameInput,
        instructions: instructionsInput,
        customQrUrl: customQrUrlInput
      });
      setSettingsSuccess('Institution payment settings updated successfully!');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const filteredReceipts = fees.filter((receipt) => {
    const student = students.find((s) => s.id === receipt.studentId);
    const studentName = student ? student.name.toLowerCase() : '';
    return (
      studentName.includes(searchTerm.toLowerCase()) ||
      receipt.receiptNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStudentName = (id: string) => {
    const s = students.find((student) => student.id === id);
    return s ? s.name : 'Unknown Student';
  };

  const getStudentDues = (id: string) => {
    const s = students.find((student) => student.id === id);
    return s ? s.totalFeesDue : 0;
  };

  // Compute fee summary breakdown
  const grossAmount = Number(payAmount || 0);
  const activePercent = concessionPercentage === 'custom' ? Number(customConcessionPercent || 0) : Number(concessionPercentage);
  const concessionAmount = concessionApplied ? Math.round((grossAmount * activePercent) / 100) : 0;
  const refDiscountAmount = referralApplied ? Number(referralDiscount || 0) : 0;
  const netAmount = Math.max(0, grossAmount - concessionAmount - refDiscountAmount);

  // Submit payment handler
  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payStudentId || !payAmount) return;
    try {
      const meta = {
        paymentType,
        installmentNo: paymentType === 'Installment' ? Number(installmentNo) : undefined,
        concessionApplied,
        concessionType: concessionApplied ? concessionType : undefined,
        concessionPercentage: concessionApplied ? activePercent : undefined,
        concessionAmount: concessionApplied ? concessionAmount : undefined,
        referralApplied,
        referrerName: referralApplied ? referrerName : undefined,
        referralDiscount: referralApplied ? refDiscountAmount : undefined,
        transactionId: transactionId || undefined,
        remarks: remarks || undefined
      };
      
      await onCollectFees(payStudentId, netAmount, payMode, meta);
      setSuccessMsg(`Tuition fee payment of ₹${netAmount.toLocaleString()} successfully processed for ${getStudentName(payStudentId)}!`);
      
      // Clear payment state
      setPayStudentId('');
      setPayAmount('');
      setTransactionId('');
      setRemarks('');
      setConcessionApplied(false);
      setReferralApplied(false);

      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  // Expense/Income triggers
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc || !expAmount) return;
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      description: expDesc,
      category: expCategory,
      amount: Number(expAmount),
      date: expDate,
      status: 'Paid'
    };
    setExpenses([newExp, ...expenses]);
    setExpDesc('');
    setExpAmount('');
    setSettingsSuccess('Operating expense entry logged successfully!');
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  const handleAddOtherIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incDesc || !incAmount) return;
    const newInc: OtherIncome = {
      id: `inc-${Date.now()}`,
      description: incDesc,
      source: incSource,
      amount: Number(incAmount),
      date: incDate
    };
    setOtherIncomes([newInc, ...otherIncomes]);
    setIncDesc('');
    setIncAmount('');
    setSettingsSuccess('External income stream logged successfully!');
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  // Calculate teacher payout details
  const calculateRemuneration = (teacher: Teacher) => {
    const logs = teacherAttendance.filter(log => log.teacherId === teacher.id && log.verified);
    const completedLogs = logs.filter(l => l.timeOut && l.hoursWorked !== undefined);
    
    let loggedUnits = 0;
    let computedRemuneration = 0;
    let description = '';

    if (teacher.payoutType === 'Fixed') {
      const daysWorked = logs.length;
      loggedUnits = daysWorked;
      const incentive = daysWorked * 500; // ₹500 attendance incentive per day
      computedRemuneration = (teacher.basePay || 50000) + incentive;
      description = `Fixed Base: ₹${(teacher.basePay || 50000).toLocaleString()} + Attendance Incentive (₹500/day for ${daysWorked} days)`;
    } else if (teacher.payoutType === 'Hourly') {
      const totalHours = completedLogs.reduce((acc, log) => acc + (log.hoursWorked || 0), 0);
      loggedUnits = totalHours;
      computedRemuneration = totalHours * (teacher.hourlyRate || 450);
      description = `${totalHours.toFixed(1)} verified hours worked @ ₹${teacher.hourlyRate || 450}/hour`;
    } else if (teacher.payoutType === 'Per-Session') {
      const sessions = logs.length;
      loggedUnits = sessions;
      computedRemuneration = sessions * (teacher.hourlyRate || 450);
      description = `${sessions} coaching sessions delivered @ ₹${teacher.hourlyRate || 450}/session`;
    }

    // Default fallbacks for display demo if there are zero logs
    if (computedRemuneration === 0) {
      if (teacher.payoutType === 'Fixed') {
        computedRemuneration = teacher.basePay || 60000;
        description = `Fixed Monthly Base Salary Contract`;
      } else {
        // Mock units for demo if zero logs exist
        const mockUnits = teacher.id === 'teacher-1' ? 45 : 32;
        loggedUnits = mockUnits;
        computedRemuneration = mockUnits * (teacher.hourlyRate || 450);
        description = `${mockUnits} estimated hours/sessions logged (Sandbox Fallback)`;
      }
    }

    const bonus = teacherBonuses[teacher.id] || 0;
    const epf = Math.round(computedRemuneration * 0.12); // 12% EPF contribution
    const tax = computedRemuneration > 40000 ? Math.round(computedRemuneration * 0.10) : 200; // 10% TDS or flat ₹200 professional tax
    const net = Math.max(0, computedRemuneration + bonus - epf - tax);

    return {
      loggedUnits,
      computedRemuneration,
      description,
      bonus,
      epf,
      tax,
      netPay: net,
      logsCount: logs.length || 10
    };
  };

  const handleDisbursePayroll = (teacher: Teacher) => {
    const calculations = calculateRemuneration(teacher);
    const slipId = `PSL-2026-${Math.floor(100 + Math.random() * 900)}`;
    
    // Add to paid state
    setDisbursedSalaries({
      ...disbursedSalaries,
      [teacher.id]: {
        date: new Date().toISOString().split('T')[0],
        amount: calculations.netPay,
        slipId
      }
    });

    // Append to expenses list as salary category
    const salaryExpense: Expense = {
      id: `exp-${Date.now()}`,
      description: `Disbursed Salary to ${teacher.name} (Slip ${slipId})`,
      category: 'Salaries',
      amount: calculations.netPay,
      date: new Date().toISOString().split('T')[0],
      status: 'Paid'
    };
    setExpenses(prev => [salaryExpense, ...prev]);

    setPayrollSuccess(`Salary of ₹${calculations.netPay.toLocaleString()} safely disbursed to ${teacher.name}! Expense ledger synchronized.`);
    setTimeout(() => setPayrollSuccess(''), 5000);
  };

  // PDF Generators
  const downloadPdfReceipt = (receipt: FeeReceipt) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    const student = students.find((s) => s.id === receipt.studentId);

    // Sleek border frame
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.rect(5, 5, 138, 200);

    // Primary Headers
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("LEARNER'S DEN COACHING CENTER", 74, 20, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Official Academic ERP Tuition Fee Bill", 74, 25, { align: 'center' });

    // Separator line
    doc.setLineWidth(0.6);
    doc.setDrawColor(99, 102, 241);
    doc.line(15, 30, 133, 30);

    // Receipt details
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("OFFICIAL RECEIPT", 15, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Receipt Reference: ${receipt.receiptNo}`, 15, 44);
    doc.text(`Transaction Date: ${receipt.date}`, 15, 49);
    doc.text(`Payment Mode: ${receipt.paymentMode} ${receipt.transactionId ? `(Ref: ${receipt.transactionId})` : '(Cash Depot)'}`, 15, 54);
    doc.text(`Payment Category: ${receipt.paymentType === 'Installment' ? `Installment #${receipt.installmentNo || 1}` : 'Full Tuition Clearance'}`, 15, 59);

    // Profile Box
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 65, 118, 28, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("STUDENT PROFILE", 20, 71);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Student Name: ${student?.name || 'Unknown Student'}`, 20, 77);
    doc.text(`Contact: ${student?.phone || 'N/A'} | Email: ${student?.email || 'N/A'}`, 20, 82);
    doc.text(`Outstanding Fees remaining: INR ${(student?.totalFeesDue || 0).toLocaleString()}.00`, 20, 87);

    // Billing breakdown
    doc.setLineWidth(0.2);
    doc.setDrawColor(203, 213, 225);
    doc.line(15, 100, 133, 100);

    doc.setFont("helvetica", "bold");
    doc.text("Particulars of Transaction", 15, 105);
    doc.text("Amount (INR)", 133, 105, { align: 'right' });
    doc.line(15, 108, 133, 108);

    doc.setFont("helvetica", "normal");
    let currentY = 115;
    const baseAmt = receipt.amount + (receipt.concessionAmount || 0) + (receipt.referralDiscount || 0);
    doc.text(`Base Tuition Amount`, 15, currentY);
    doc.text(`INR ${baseAmt.toLocaleString()}.00`, 133, currentY, { align: 'right' });
    currentY += 6;

    if (receipt.concessionApplied) {
      doc.setTextColor(220, 38, 38);
      doc.text(`Concession: ${receipt.concessionType || 'Scholarship'} (-${receipt.concessionPercentage || 0}%)`, 15, currentY);
      doc.text(`- INR ${(receipt.concessionAmount || 0).toLocaleString()}.00`, 133, currentY, { align: 'right' });
      doc.setTextColor(30, 41, 59);
      currentY += 6;
    }

    if (receipt.referralApplied) {
      doc.setTextColor(220, 38, 38);
      doc.text(`Referral Discount (Referrer: ${receipt.referrerName || 'Affiliate'})`, 15, currentY);
      doc.text(`- INR ${(receipt.referralDiscount || 0).toLocaleString()}.00`, 133, currentY, { align: 'right' });
      doc.setTextColor(30, 41, 59);
      currentY += 6;
    }

    if (receipt.remarks) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.text(`Remarks: ${receipt.remarks}`, 15, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      currentY += 6;
    }

    doc.line(15, currentY, 133, currentY);
    currentY += 6;

    // Net Amount Received
    doc.setFont("helvetica", "bold");
    doc.text("NET AMOUNT RECEIVED", 15, currentY);
    doc.setTextColor(16, 185, 129);
    doc.text(`INR ${receipt.amount.toLocaleString()}.00`, 133, currentY, { align: 'right' });

    doc.setTextColor(30, 41, 59);
    doc.line(15, currentY + 4, 133, currentY + 4);

    // Footer signatures
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text("Note: Generated digitally. Verified signatures required on request only.", 15, 175);
    
    doc.setDrawColor(148, 163, 184);
    doc.line(15, 186, 45, 186);
    doc.line(100, 186, 130, 186);
    
    doc.text("Office Accounts Executive", 15, 191);
    doc.text("Student Guardian Signature", 100, 191);

    // Official Certified stamp
    doc.setDrawColor(16, 185, 129);
    doc.rect(102, 170, 26, 10);
    doc.setTextColor(16, 185, 129);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text("LEARNER'S DEN", 115, 174, { align: 'center' });
    doc.text("OFFICIAL PAID", 115, 177, { align: 'center' });

    doc.save(`Receipt-${receipt.receiptNo}-${student?.name.replace(/\s+/g, '_') || 'Student'}.pdf`);
  };

  const downloadPdfPayslip = (teacher: Teacher) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    const calculations = calculateRemuneration(teacher);
    const slipDetails = disbursedSalaries[teacher.id] || { date: new Date().toISOString().split('T')[0], slipId: `PSL-2026-REG` };

    // Sleek border frame
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.rect(5, 5, 138, 200);

    // Header logo
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("LEARNER'S DEN ACADEMY", 74, 20, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Official Educator Monthly Salary Slip", 74, 25, { align: 'center' });

    // Separator line
    doc.setLineWidth(0.6);
    doc.setDrawColor(99, 102, 241);
    doc.line(15, 30, 133, 30);

    // Title
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("STAFF DISBURSEMENT ADVICE", 15, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Payslip ID: ${slipDetails.slipId}`, 15, 44);
    doc.text(`Disbursement Date: ${slipDetails.date}`, 15, 49);
    doc.text(`Bank Dispatch Reference: NEFT-DEN-7104${teacher.id.replace(/\D/g,'')}`, 15, 54);
    doc.text(`Wage Cycle: July 2026 Monthly Payout`, 15, 59);

    // Faculty Information Box
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 65, 118, 28, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("EDUCATOR EMPLOYEE PROFILE", 20, 71);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Instructor Name: ${teacher.name}`, 20, 77);
    doc.text(`Role: Senior Academic ${teacher.subject} Specialist`, 20, 82);
    doc.text(`Contract Payout: ${teacher.payoutType} Wage (Verified Units: ${calculations.loggedUnits})`, 20, 87);

    // Billing Table
    doc.setLineWidth(0.2);
    doc.setDrawColor(203, 213, 225);
    doc.line(15, 100, 133, 100);

    doc.setFont("helvetica", "bold");
    doc.text("Earnings & Allowances", 15, 105);
    doc.text("Deductions & Tax", 100, 105);
    doc.line(15, 108, 133, 108);

    doc.setFont("helvetica", "normal");
    let currentY = 115;
    
    // Base wage item
    doc.text("Basic Remuneration:", 15, currentY);
    doc.text(`INR ${calculations.computedRemuneration.toLocaleString()}`, 65, currentY, { align: 'right' });
    
    // Tax item
    doc.text("Provident Fund (EPF):", 80, currentY);
    doc.text(`INR ${calculations.epf.toLocaleString()}`, 133, currentY, { align: 'right' });
    
    currentY += 6;

    // Bonus item
    doc.text("Performance Bonus:", 15, currentY);
    doc.text(`INR ${calculations.bonus.toLocaleString()}`, 65, currentY, { align: 'right' });
    
    // Professional Tax / TDS
    doc.text("Professional TDS:", 80, currentY);
    doc.text(`INR ${calculations.tax.toLocaleString()}`, 133, currentY, { align: 'right' });
    
    currentY += 6;

    doc.line(15, currentY, 133, currentY);
    currentY += 6;

    // Gross vs deductions
    const grossEarnings = calculations.computedRemuneration + calculations.bonus;
    const totalDeductions = calculations.epf + calculations.tax;

    doc.text("Total Gross Earnings:", 15, currentY);
    doc.text(`INR ${grossEarnings.toLocaleString()}`, 65, currentY, { align: 'right' });

    doc.text("Total Deductions:", 80, currentY);
    doc.text(`INR ${totalDeductions.toLocaleString()}`, 133, currentY, { align: 'right' });

    currentY += 10;
    doc.line(15, currentY, 133, currentY);
    currentY += 6;

    // Net pay summary
    doc.setFont("helvetica", "bold");
    doc.text("NET SALARY DISBURSED", 15, currentY);
    doc.setTextColor(16, 185, 129);
    doc.text(`INR ${calculations.netPay.toLocaleString()}`, 133, currentY, { align: 'right' });

    doc.setTextColor(30, 41, 59);
    doc.line(15, currentY + 4, 133, currentY + 4);

    // Bottom signatories
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text("Certified payout under academic labor contracts. System copy.", 15, 175);
    
    doc.setDrawColor(148, 163, 184);
    doc.line(15, 186, 45, 186);
    doc.line(100, 186, 130, 186);
    
    doc.text("Academic Managing Director", 15, 191);
    doc.text("Educator/Recipient Signature", 100, 191);

    // Official Certified stamp
    doc.setDrawColor(99, 102, 241);
    doc.rect(102, 170, 26, 10);
    doc.setTextColor(99, 102, 241);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text("LEARNER'S DEN", 115, 174, { align: 'center' });
    doc.text("PAID & DISBURSED", 115, 177, { align: 'center' });

    doc.save(`Payslip-${teacher.name.replace(/\s+/g, '_')}-${slipDetails.slipId}.pdf`);
  };

  const downloadPdfFinancialStatement = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("LEARNER'S DEN COACHING CENTER", 15, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Official Corporate Accounting & Operational Performance statement", 15, 24);
    doc.text(`Generated On: ${new Date().toLocaleDateString()} | Active Academic Period: FY 2026`, 15, 29);

    // Divider
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1);
    doc.line(0, 40, 210, 40);

    // 1. Balance Summary Row
    doc.setTextColor(15, 23, 42); // slate 900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("I. CONSOLIDATED ACCOUNTS SUMMARY", 15, 52);

    doc.setLineWidth(0.2);
    doc.setDrawColor(203, 213, 225);
    doc.line(15, 55, 195, 55);

    const tuitionFeesSum = fees.reduce((acc, r) => acc + r.amount, 0);
    const otherIncomesSum = otherIncomes.reduce((acc, r) => acc + r.amount, 0);
    const grossIncome = tuitionFeesSum + otherIncomesSum;

    const opExpensesSum = expenses.filter(e => e.category !== 'Salaries').reduce((acc, r) => acc + r.amount, 0);
    const salaryExpensesSum = expenses.filter(e => e.category === 'Salaries').reduce((acc, r) => acc + r.amount, 0);
    const grossExpenses = opExpensesSum + salaryExpensesSum;
    const netProfit = grossIncome - grossExpenses;
    const margin = grossIncome > 0 ? ((netProfit / grossIncome) * 100).toFixed(1) : '0';

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("Financial Parameters", 15, 62);
    doc.text("Gross Volume (INR)", 195, 62, { align: 'right' });
    doc.line(15, 64, 195, 64);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Total Collected Tuition Fee Intake", 15, 71);
    doc.text(`INR ${tuitionFeesSum.toLocaleString()}.00`, 195, 71, { align: 'right' });

    doc.text("Total External/Secondary Income (Exam registries, Guides)", 15, 77);
    doc.text(`INR ${otherIncomesSum.toLocaleString()}.00`, 195, 77, { align: 'right' });

    doc.text("Total Operational Operating Expenses (Rent, Utilities, Supplies)", 15, 83);
    doc.text(`- INR ${opExpensesSum.toLocaleString()}.00`, 195, 83, { align: 'right' });

    doc.text("Total Academic Staff Salaries & Wage Disbursements", 15, 89);
    doc.text(`- INR ${salaryExpensesSum.toLocaleString()}.00`, 195, 89, { align: 'right' });
    
    doc.line(15, 93, 195, 93);

    doc.setFont("helvetica", "bold");
    doc.text("GROSS REVENUE", 15, 100);
    doc.text(`INR ${grossIncome.toLocaleString()}.00`, 195, 100, { align: 'right' });

    doc.text("TOTAL DISBURSEMENTS", 15, 106);
    doc.text(`INR ${grossExpenses.toLocaleString()}.00`, 195, 106, { align: 'right' });

    doc.text("NET ACCUMULATED SURPLUS (PROFIT)", 15, 114);
    if (netProfit >= 0) {
      doc.setTextColor(16, 185, 129); // green
      doc.text(`+ INR ${netProfit.toLocaleString()}.00 (${margin}% Margin)`, 195, 114, { align: 'right' });
    } else {
      doc.setTextColor(220, 38, 38); // red
      doc.text(`- INR ${Math.abs(netProfit).toLocaleString()}.00 (${margin}% Deficit)`, 195, 114, { align: 'right' });
    }

    doc.setTextColor(15, 23, 42); // slate 900
    doc.line(15, 118, 195, 118);

    // 2. Ledger details table
    doc.setFontSize(14);
    doc.text("II. OPERATING EXPENSES RECORD SHEET", 15, 132);
    doc.line(15, 135, 195, 135);

    doc.setFontSize(9.5);
    doc.text("Date", 15, 142);
    doc.text("Particular Description", 40, 142);
    doc.text("Category", 125, 142);
    doc.text("Value (INR)", 195, 142, { align: 'right' });
    doc.line(15, 144, 195, 144);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    let currentY = 151;
    expenses.slice(0, 12).forEach((exp) => {
      doc.text(exp.date, 15, currentY);
      
      // truncate long descriptions safely
      const desc = exp.description.length > 45 ? exp.description.substr(0, 42) + "..." : exp.description;
      doc.text(desc, 40, currentY);
      doc.text(exp.category, 125, currentY);
      doc.text(`INR ${exp.amount.toLocaleString()}.00`, 195, currentY, { align: 'right' });
      currentY += 6;
    });

    // 3. Certified stamp
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.text("This accounting audit statement is compiled by Learner's Den ERP system. Devoid of manual bias.", 15, 260);

    doc.setDrawColor(203, 213, 225);
    doc.line(15, 275, 55, 275);
    doc.line(145, 275, 185, 275);
    
    doc.text("Authorized Audit Representative", 15, 280);
    doc.text("Academic Executive Signoff", 145, 280);

    doc.save(`Learners_Den_Financial_Audit_${new Date().getFullYear()}.pdf`);
  };

  // Automated notice sync numbers
  const pendingCount = students.filter((s) => s.feeStatus === 'Pending' || s.totalFeesDue > 0).length;

  // Render trigger for payment simulator
  const handleOpenSimulator = () => {
    setSimStatus('idle');
    setSimProgress(0);
    setIsSimulatingPayment(true);
  };

  // Run payment simulator bar timer
  useEffect(() => {
    let timer: any;
    if (simStatus === 'processing') {
      timer = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setSimStatus('authorized');
            // Auto generate genuine details on successful gateway response
            const randomizedTxn = `TXN_2026_GP` + Math.random().toString(36).substr(2, 6).toUpperCase();
            setTransactionId(randomizedTxn);
            setPayMode(simPaymentMethod);
            setRemarks(`Mock Gateway verified (${simPaymentMethod === 'UPI' ? simUpiApp : 'Credit Card'})`);
            return 100;
          }
          return prev + 15;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [simStatus]);

  // Format Card Number
  const handleCardNoChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setSimCardNo(formatted.substr(0, 19));
  };

  // Format Card Expiry
  const handleExpiryChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setSimCardExpiry(`${cleaned.substr(0, 2)}/${cleaned.substr(2, 2)}`);
    } else {
      setSimCardExpiry(cleaned);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Sub Navigation Tab Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('fees')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'fees' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Fees & Collection</span>
          </button>
          
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'payroll' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coins className="h-4 w-4" />
            <span>Faculty Payroll Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'expenses' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Operating Ledgers</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'reports' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Audit Reports & Analytics</span>
          </button>
        </div>

        {/* Global Action Shortcut */}
        {activeTab === 'reports' && (
          <button
            onClick={downloadPdfFinancialStatement}
            className="px-3.5 py-1.5 text-xxs font-black bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl shadow-xxs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Audit PDF Statement</span>
          </button>
        )}
      </div>

      {/* OVERVIEW WIDGETS (Renders on all views to keep financial overview unified) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl flex items-center gap-4 text-left shadow-xxs">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <IndianRupee className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tuition Fees Collected</p>
            <h3 className="text-lg font-black text-slate-800 mt-0.5">
              ₹{fees.reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
            </h3>
            <p className="text-xxxxs text-slate-400 mt-0.5 font-semibold">From {fees.length} logs</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl flex items-center gap-4 text-left shadow-xxs">
          <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl shrink-0">
            <TrendingUp className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Other Income Volume</p>
            <h3 className="text-lg font-black text-slate-800 mt-0.5">
              ₹{otherIncomes.reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
            </h3>
            <p className="text-xxxxs text-slate-400 mt-0.5 font-semibold">From {otherIncomes.length} categories</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl flex items-center gap-4 text-left shadow-xxs">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <TrendingDown className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Expense</p>
            <h3 className="text-lg font-black text-slate-800 mt-0.5">
              ₹{expenses.reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
            </h3>
            <p className="text-xxxxs text-rose-500 mt-0.5 font-bold">Salaries, utilities, hardware</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl flex items-center gap-4 text-left shadow-xxs">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl shrink-0">
            <Clock className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Dues</p>
            <h3 className="text-lg font-black text-slate-800 mt-0.5">
              ₹{students.reduce((acc, s) => acc + s.totalFeesDue, 0).toLocaleString()}
            </h3>
            <p className="text-xxxxs text-amber-600 mt-0.5 font-bold">{pendingCount} students pending</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FEES & COLLECTIONS                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'fees' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Notice Board Synced alert */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left ${
            pendingCount > 0 
              ? 'bg-gradient-to-r from-amber-50 to-orange-50/60 border-amber-200/80' 
              : 'bg-gradient-to-r from-emerald-50 to-teal-50/60 border-emerald-200/80'
          }`}>
            <div className="flex items-center gap-3.5 text-left">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                pendingCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <Bot className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Notice Sync Automation</h4>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${
                    pendingCount > 0 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {pendingCount > 0 ? 'Active Notice' : 'All Settled'}
                  </span>
                </div>
                <p className="text-xxs text-slate-600 font-medium leading-relaxed max-w-4xl">
                  {pendingCount > 0 ? (
                    <span>
                      <b>Learner's Den Automated Finance Bot</b> has identified <b>{pendingCount}</b> student profiles with outstanding tuition balance. A persistent, live <b>"Urgent Payment Notice"</b> is currently active and pinned on the Notice Board listing these individuals.
                    </span>
                  ) : (
                    <span>
                      <b>Great job!</b> There are currently no students with outstanding dues. The system has automatically cleared any urgent payment notices from the Official Notice Board.
                    </span>
                  )}
                </p>
              </div>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5 self-end md:self-center">
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider shrink-0">Live & Persistent</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Payment form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-xxs">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-4">
                  <CreditCard className="h-4.5 w-4.5 text-indigo-600" />
                  <span>Record Fee Payment</span>
                </h3>

                {successMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xxs font-semibold flex items-center gap-2 mb-4 animate-in fade-in duration-200">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={submitPayment} className="space-y-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1.5">Select Enrolled Student Hierarchy</label>
                    <StudentSelector
                      students={students}
                      batches={batches || []}
                      selectedStudentId={payStudentId}
                      onSelectStudent={(studentId) => {
                        setPayStudentId(studentId);
                        const dues = getStudentDues(studentId);
                        setPayAmount(dues > 0 ? String(dues) : '');
                      }}
                      label="Fee Payer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Tuition Gross Amount (INR)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 15000"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Installments Option</label>
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-semibold focus:outline-indigo-500"
                      >
                        <option value="Full">Full Payment</option>
                        <option value="Installment">Installment Scheme</option>
                      </select>
                    </div>
                  </div>

                  {paymentType === 'Installment' && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Installment Stage / Sequence</label>
                      <div className="flex gap-2">
                        {['1', '2', '3', '4'].map((num) => (
                          <button
                            type="button"
                            key={num}
                            onClick={() => setInstallmentNo(num)}
                            className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                              installmentNo === num 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xxs' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            #{num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Concession/Scholarship Block */}
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xxs font-bold text-indigo-900 uppercase flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Scholarship Concession</span>
                      </label>
                      <input 
                        type="checkbox"
                        checked={concessionApplied}
                        onChange={(e) => setConcessionApplied(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>

                    {concessionApplied && (
                      <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={concessionType}
                            onChange={(e) => setConcessionType(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg p-1.5 text-xxs text-slate-700 font-bold"
                          >
                            <option value="Merit Scholarship">Merit scholarship</option>
                            <option value="EWS Concession">EWS Scheme Waiver</option>
                            <option value="Girls Empowerment">Girls concession</option>
                            <option value="Sibling discount">Sibling discount</option>
                          </select>

                          <select
                            value={concessionPercentage}
                            onChange={(e) => setConcessionPercentage(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg p-1.5 text-xxs text-slate-700 font-bold"
                          >
                            <option value="10">10% Concession</option>
                            <option value="25">25% Quarter Waiver</option>
                            <option value="50">50% Half Waiver</option>
                            <option value="100">100% Full Waiver</option>
                            <option value="custom">Custom Percentage</option>
                          </select>
                        </div>

                        {concessionPercentage === 'custom' && (
                          <input 
                            type="number"
                            placeholder="Enter Custom % (e.g. 15)"
                            value={customConcessionPercent}
                            onChange={(e) => setCustomConcessionPercent(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xxs font-bold"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Referral Applied Block */}
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xxs font-bold text-blue-900 uppercase flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                        <span>Referral Affiliate Discount</span>
                      </label>
                      <input 
                        type="checkbox"
                        checked={referralApplied}
                        onChange={(e) => setReferralApplied(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                    </div>

                    {referralApplied && (
                      <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 duration-200">
                        <input 
                          type="text"
                          placeholder="Referrer Full Name"
                          required
                          value={referrerName}
                          onChange={(e) => setReferrerName(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xxs font-semibold"
                        />
                        <select
                          value={referralDiscount}
                          onChange={(e) => setReferralDiscount(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xxs text-slate-700 font-bold"
                        >
                          <option value="500">₹500 Discount</option>
                          <option value="1000">₹1,000 Discount</option>
                          <option value="2000">₹2,000 Discount</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Payment Mode Selector */}
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Select Payment Mode</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['UPI', 'Card', 'Cash', 'Online'] as const).map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setPayMode(m)}
                          className={`py-1.5 text-xxs font-bold rounded-xl border text-center cursor-pointer transition-all ${
                            payMode === m 
                              ? 'bg-slate-950 text-white border-slate-950 shadow-xxs' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transaction ID & Simulator Button */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xxs font-bold text-slate-500 uppercase">Transaction reference ID</label>
                      <button
                        type="button"
                        onClick={handleOpenSimulator}
                        className="text-[10px] text-indigo-650 hover:text-indigo-800 font-black flex items-center gap-1 transition-all"
                      >
                        <Sparkle className="h-3 w-3 text-indigo-500 animate-pulse" />
                        <span>Simulate Gateway</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. TXN_98741022"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Remarks / Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Second instalment term fee"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>

                  {/* Net Payable Breakdown Panel */}
                  <div className="p-3.5 bg-slate-950 text-white rounded-2xl text-xs space-y-2 font-semibold">
                    <div className="flex justify-between text-slate-400">
                      <span>Gross tuition balance:</span>
                      <span>₹{grossAmount.toLocaleString()}</span>
                    </div>
                    {concessionApplied && (
                      <div className="flex justify-between text-rose-400">
                        <span>Waiver:</span>
                        <span>-₹{concessionAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {referralApplied && (
                      <div className="flex justify-between text-rose-400">
                        <span>Referral Concession:</span>
                        <span>-₹{refDiscountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-sm">
                      <span className="text-indigo-300">NET CHARGE PAYABLE:</span>
                      <span className="text-emerald-400">₹{netAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-4.5 w-4.5 text-indigo-200" />
                    <span>Collect Payment & Print Receipt</span>
                  </button>
                </form>
              </div>

              {/* Accordion Settings */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-xxs">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-3">
                  <QrCode className="h-4.5 w-4.5 text-indigo-600" />
                  <span>Merchant Gateway Setup</span>
                </h3>
                <p className="text-[10px] text-slate-400 leading-normal mb-4">
                  Define corporate bank details, direct UPI endpoints, and upload static payment gateway QR codes for student mobile scan-to-pay.
                </p>

                {settingsSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[10px] font-bold mb-3">
                    {settingsSuccess}
                  </div>
                )}

                <form onSubmit={submitPaymentSettings} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Corporate UPI ID</label>
                      <input
                        type="text"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xxs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Merchant Name</label>
                      <input
                        type="text"
                        value={merchantNameInput}
                        onChange={(e) => setMerchantNameInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xxs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gate Instructions</label>
                    <input
                      type="text"
                      placeholder="e.g. Pay tuition before 10th of every month to avoid fine."
                      value={instructionsInput}
                      onChange={(e) => setInstructionsInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xxs font-medium text-slate-700"
                    />
                  </div>

                  {/* Drag and Drop File Upload for QR Codes */}
                  <div className="space-y-2 text-left">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Gateway Static QR Asset</label>
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                        dragActive ? 'border-indigo-500 bg-indigo-50/40' : 'border-slate-200 hover:border-slate-350 bg-slate-50/40'
                      }`}
                    >
                      {customQrUrlInput ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <img src={customQrUrlInput} className="h-20 w-20 object-contain border border-slate-200 p-1 bg-white rounded-lg" alt="Gateway QR Code" />
                          <button
                            type="button"
                            onClick={() => setCustomQrUrlInput('')}
                            className="text-[9px] text-rose-600 hover:text-rose-800 font-bold uppercase tracking-wider"
                          >
                            Remove Code Image
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block space-y-1">
                          <Upload className="h-5 w-5 mx-auto text-slate-400" />
                          <span className="block text-xxs font-bold text-slate-650">Drag & Drop QR Code Image</span>
                          <span className="block text-[9px] text-slate-400 font-semibold">Or click to search folders</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xxs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xxs"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{isSavingSettings ? 'Saving Settings...' : 'Save Merchant Parameters'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right column ledger */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-xxs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Tuition Transaction Ledger</h3>
                  <p className="text-xxs text-slate-400 font-medium mt-0.5">Historical log records of incoming student term collections.</p>
                </div>
                
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search receipt/student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xxs bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-[750px] space-y-3 pr-1">
                {filteredReceipts.length === 0 ? (
                  <div className="p-16 text-center text-slate-400">
                    <FileText className="h-10 w-10 mx-auto opacity-30 mb-2" />
                    <p className="text-xxs font-medium">No financial transactions registered.</p>
                  </div>
                ) : (
                  filteredReceipts.map((receipt) => (
                    <div
                      key={receipt.id}
                      className="p-3.5 rounded-xl border border-slate-150/80 hover:bg-slate-50/30 flex justify-between items-center text-xs transition-all duration-200"
                    >
                      <div className="space-y-1.5 text-left">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-extrabold text-slate-800 text-xxs tracking-wider uppercase px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/50 text-slate-600">
                            {receipt.receiptNo}
                          </span>
                          <span className="text-slate-400 font-semibold text-xxs flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {receipt.date}
                          </span>
                          {receipt.paymentType === 'Installment' && (
                            <span className="text-[9px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-bold">
                              Instalment #{receipt.installmentNo || 1}
                            </span>
                          )}
                          {receipt.concessionApplied && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                              Concession
                            </span>
                          )}
                          {receipt.referralApplied && (
                            <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                              Referral
                            </span>
                          )}
                        </div>
                        
                        <p className="font-bold text-slate-700">{getStudentName(receipt.studentId)}</p>
                        
                        <div className="flex flex-col gap-0.5 text-xxs text-slate-400 font-medium">
                          <p>
                            Channel: <b>{receipt.paymentMode}</b>
                            {receipt.transactionId && <span> (Ref: <code className="text-slate-600 font-bold">{receipt.transactionId}</code>)</span>}
                          </p>
                          {receipt.remarks && <p className="italic">Note: "{receipt.remarks}"</p>}
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div className="space-y-1">
                          <p className="text-xxs text-emerald-600 font-black uppercase tracking-wider">Cleared</p>
                          <h4 className="text-sm font-extrabold text-slate-800">+₹{receipt.amount.toLocaleString()}</h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => downloadPdfReceipt(receipt)}
                          title="Print & Save PDF Receipt"
                          className="p-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl border border-indigo-100 hover:border-indigo-600 transition-all cursor-pointer shadow-xxs"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FACULTY PAYROLL LEDGER                                             */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-6 animate-in fade-in duration-300 text-left">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xxs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Educator Remuneration & Payroll</h3>
                <p className="text-xs text-slate-400 mt-0.5">Vetting monthly working logs, adding performance bonuses, and distributing salaries with printable PDF payslips.</p>
              </div>
              <span className="text-xxs font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-md">
                Live Attendance Sync Connected
              </span>
            </div>

            {payrollSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xxs font-semibold flex items-center gap-2 animate-bounce">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>{payrollSuccess}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              {teachers.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-12">No active instructor faculty in current register.</p>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xxs uppercase font-bold">
                      <th className="px-4 py-3">Instructor Educator</th>
                      <th className="px-4 py-3">Payout Structure</th>
                      <th className="px-4 py-3">Work logs (Month)</th>
                      <th className="px-4 py-3">Deductions (EPF/Tax)</th>
                      <th className="px-4 py-3">Custom Bonus (INR)</th>
                      <th className="px-4 py-3 text-right">Net Payable Amount</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-650">
                    {teachers.map((teacher) => {
                      const payroll = calculateRemuneration(teacher);
                      const isDisbursed = disbursedSalaries[teacher.id] !== undefined;
                      const disDetails = disbursedSalaries[teacher.id];

                      return (
                        <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-extrabold text-slate-800 text-sm">{teacher.name}</p>
                              <p className="text-xxs text-slate-400 mt-0.5">{teacher.subject} Senior Mentor</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider">
                                {teacher.payoutType} contract
                              </span>
                              <p className="text-xxs font-mono text-slate-500 mt-1">
                                {teacher.payoutType === 'Fixed' && `₹${(teacher.basePay || 50000).toLocaleString()}/mo`}
                                {teacher.payoutType === 'Hourly' && `₹${teacher.hourlyRate || 450}/hr`}
                                {teacher.payoutType === 'Per-Session' && `₹${teacher.hourlyRate || 450}/session`}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-extrabold text-slate-700">
                                {teacher.payoutType === 'Fixed' && `${payroll.loggedUnits} Working Days`}
                                {teacher.payoutType === 'Hourly' && `${payroll.loggedUnits.toFixed(1)} Clocked Hours`}
                                {teacher.payoutType === 'Per-Session' && `${payroll.loggedUnits} Coaching Sessions`}
                              </p>
                              <p className="text-xxxxs text-slate-400 font-medium mt-0.5">{payroll.description}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-rose-500">
                            <div>
                              <p>EPF: -₹{payroll.epf.toLocaleString()}</p>
                              <p className="text-xxxxs text-slate-450">TDS: -₹{payroll.tax.toLocaleString()}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <input 
                              type="number"
                              disabled={isDisbursed}
                              placeholder="₹ Add Allowance"
                              value={teacherBonuses[teacher.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                setTeacherBonuses({
                                  ...teacherBonuses,
                                  [teacher.id]: val
                                });
                              }}
                              className="w-24 px-2 py-1 border border-slate-200 rounded-lg text-xxs font-bold focus:outline-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-black text-slate-800">₹{payroll.netPay.toLocaleString()}</span>
                            {isDisbursed ? (
                              <p className="text-[9px] text-emerald-600 font-extrabold uppercase mt-0.5 tracking-wider flex items-center justify-end gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Disbursed</span>
                              </p>
                            ) : (
                              <p className="text-[9px] text-amber-500 font-bold uppercase mt-0.5 tracking-wider">Pending Release</p>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {isDisbursed ? (
                                <>
                                  <button
                                    onClick={() => downloadPdfPayslip(teacher)}
                                    title="Download Salary Slip PDF"
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                                  >
                                    <Printer className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="px-2 py-1.5 bg-emerald-50 border border-emerald-150 text-emerald-700 text-[10px] font-black rounded-xl">
                                    Settled
                                  </span>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleDisbursePayroll(teacher)}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xxs rounded-xl shadow-xxs cursor-pointer transition-all flex items-center gap-1"
                                >
                                  <span>Release Pay</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: OPERATING LEDGERS                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300 text-left">
          
          {/* Form Columns */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Record Expense */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-4">
                <ArrowDownRight className="h-5 w-5 text-rose-500" />
                <span>Log Operating Expense</span>
              </h3>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Expense category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-semibold focus:outline-indigo-500"
                  >
                    <option value="Rent">Academy Rent</option>
                    <option value="Utilities">Electricity & Utility Bills</option>
                    <option value="Hardware/Assets">Laptops & Smart Boards</option>
                    <option value="Marketing">Advertising & Brochure Printing</option>
                    <option value="Supplies">Stationery & Chalks</option>
                    <option value="Other">Miscellaneous Costs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Particulars Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paid Office Broadband Router fee"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Amount Paid (INR)</label>
                    <input
                      type="number"
                      required
                      placeholder="INR"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Date of Payment</label>
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xxs transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Commit Expense Outflow</span>
                </button>
              </form>
            </div>

            {/* Record Secondary Income */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-4">
                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                <span>Log Secondary Income Stream</span>
              </h3>

              <form onSubmit={handleAddOtherIncome} className="space-y-4">
                <div>
                  <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Income stream source</label>
                  <select
                    value={incSource}
                    onChange={(e) => setIncSource(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-semibold focus:outline-indigo-500"
                  >
                    <option value="Study Guides">Physics Formula Sheets & Book Sales</option>
                    <option value="Exam Registrations">NTSE / Olympiad Mock Exams</option>
                    <option value="Donations">Corporate CSR / Group Sponsoring</option>
                    <option value="Rentals">Academic Hall Sunday Rent</option>
                    <option value="Other">Other Miscellaneous Source</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Income description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sold 40 copies of NEET Botany guide"
                    value={incDesc}
                    onChange={(e) => setIncDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Amount Intake (INR)</label>
                    <input
                      type="number"
                      required
                      placeholder="INR"
                      value={incAmount}
                      onChange={(e) => setIncAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Date of Intake</label>
                    <input
                      type="date"
                      value={incDate}
                      onChange={(e) => setIncDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xxs transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Commit Income Inflow</span>
                </button>
              </form>
            </div>
          </div>

          {/* Ledgers Column */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs space-y-4">
            
            {/* Ledger Tab Nav */}
            <div className="flex border-b border-slate-100 pb-2 gap-3">
              <button
                onClick={() => setLedgerTab('expenses')}
                className={`pb-2 text-xs font-black relative cursor-pointer ${
                  ledgerTab === 'expenses' ? 'text-slate-800 border-b-2 border-indigo-650' : 'text-slate-400'
                }`}
              >
                <span>Operating Expenditures ({expenses.length})</span>
              </button>
              <button
                onClick={() => setLedgerTab('otherIncomes')}
                className={`pb-2 text-xs font-black relative cursor-pointer ${
                  ledgerTab === 'otherIncomes' ? 'text-slate-800 border-b-2 border-indigo-650' : 'text-slate-400'
                }`}
              >
                <span>Non-Tuition Inflow ({otherIncomes.length})</span>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[600px] space-y-3 pr-1">
              
              {/* Render expenses list */}
              {ledgerTab === 'expenses' && (
                expenses.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-16">No operational expenditures on ledger.</p>
                ) : (
                  expenses.map((exp) => (
                    <div key={exp.id} className="p-3 border border-slate-150 rounded-xl flex items-center justify-between hover:bg-slate-50/40 transition-all text-xs font-semibold">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black uppercase bg-rose-50 border border-rose-150 text-rose-700 px-1.5 py-0.5 rounded">
                            {exp.category}
                          </span>
                          <span className="text-slate-400 text-xxs flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {exp.date}
                          </span>
                        </div>
                        <p className="text-slate-800 text-xs font-bold">{exp.description}</p>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-rose-600 font-extrabold">-₹{exp.amount.toLocaleString()}</p>
                          <p className="text-xxxxs text-emerald-600 font-black uppercase">Cleared</p>
                        </div>
                        <button
                          onClick={() => setExpenses(expenses.filter(e => e.id !== exp.id))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                        >
                          <Trash className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}

              {/* Render other income list */}
              {ledgerTab === 'otherIncomes' && (
                otherIncomes.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-16">No secondary income streams on ledger.</p>
                ) : (
                  otherIncomes.map((inc) => (
                    <div key={inc.id} className="p-3 border border-slate-150 rounded-xl flex items-center justify-between hover:bg-slate-50/40 transition-all text-xs font-semibold">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black uppercase bg-emerald-50 border border-emerald-150 text-emerald-700 px-1.5 py-0.5 rounded">
                            {inc.source}
                          </span>
                          <span className="text-slate-400 text-xxs flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {inc.date}
                          </span>
                        </div>
                        <p className="text-slate-800 text-xs font-bold">{inc.description}</p>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-emerald-600 font-extrabold">+₹{inc.amount.toLocaleString()}</p>
                          <p className="text-xxxxs text-indigo-500 font-bold uppercase">Deposited</p>
                        </div>
                        <button
                          onClick={() => setOtherIncomes(otherIncomes.filter(i => i.id !== inc.id))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                        >
                          <Trash className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUDIT REPORTS & ANALYTICS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (() => {
        const tuitionFeesSum = fees.reduce((acc, r) => acc + r.amount, 0);
        const otherIncomesSum = otherIncomes.reduce((acc, r) => acc + r.amount, 0);
        const totalIncome = tuitionFeesSum + otherIncomesSum;

        const opExpensesSum = expenses.filter(e => e.category !== 'Salaries').reduce((acc, r) => acc + r.amount, 0);
        const salaryExpensesSum = expenses.filter(e => e.category === 'Salaries').reduce((acc, r) => acc + r.amount, 0);
        const totalExpense = opExpensesSum + salaryExpensesSum;
        const netSurplus = totalIncome - totalExpense;
        const opMargin = totalIncome > 0 ? Math.round((netSurplus / totalIncome) * 100) : 0;

        return (
          <div className="space-y-6 animate-in fade-in duration-300 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Balance Sheet Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Landmark className="h-4.5 w-4.5 text-indigo-650" />
                  <span>Statement of Operations</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal">Operational ledger summaries showing current corporate earnings and net savings margins.</p>
                
                <div className="space-y-3.5 pt-2 text-xs font-semibold">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <span className="text-slate-500">Gross Student Tuitions:</span>
                    <span className="text-slate-800 font-bold">₹{tuitionFeesSum.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <span className="text-slate-500">Other Secondary Streams:</span>
                    <span className="text-slate-800 font-bold">₹{otherIncomesSum.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <span className="text-slate-500">General Operating Costs:</span>
                    <span className="text-slate-800 font-bold">₹{opExpensesSum.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <span className="text-slate-500">Faculty Wages release:</span>
                    <span className="text-slate-800 font-bold">₹{salaryExpensesSum.toLocaleString()}</span>
                  </div>

                  <div className="pt-3 flex justify-between items-center font-black text-sm">
                    <span className="text-slate-800">Net operating surplus:</span>
                    <span className={netSurplus >= 0 ? 'text-emerald-600' : 'text-rose-650'}>
                      ₹{netSurplus.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xxs font-black text-slate-500">
                    <span>Performance net savings Margin:</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase ${
                      netSurplus >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {opMargin}% {netSurplus >= 0 ? 'Surplus' : 'Deficit'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Horizontal bar chart */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Operational Budgets Allocation</h3>
                  <p className="text-xxs text-slate-400 mt-0.5 font-medium">Dynamic category chart showing proportion distributions of income streams vs outlays.</p>
                </div>

                <div className="space-y-4 my-6">
                  {/* Tuition fees intake */}
                  <div className="space-y-1 text-xs font-bold">
                    <div className="flex justify-between text-xxs">
                      <span className="text-slate-500">Student Coaching Tuitions (Inflow)</span>
                      <span className="text-emerald-600">₹{tuitionFeesSum.toLocaleString()} ({totalIncome > 0 ? Math.round((tuitionFeesSum/totalIncome)*100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalIncome > 0 ? (tuitionFeesSum/totalIncome)*100 : 0}%` }} />
                    </div>
                  </div>

                  {/* Other incomes intake */}
                  <div className="space-y-1 text-xs font-bold">
                    <div className="flex justify-between text-xxs">
                      <span className="text-slate-500">Guides Sales & Registry Streams (Inflow)</span>
                      <span className="text-emerald-600">₹{otherIncomesSum.toLocaleString()} ({totalIncome > 0 ? Math.round((otherIncomesSum/totalIncome)*100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalIncome > 0 ? (otherIncomesSum/totalIncome)*100 : 0}%` }} />
                    </div>
                  </div>

                  {/* Wages outlays */}
                  <div className="space-y-1 text-xs font-bold">
                    <div className="flex justify-between text-xxs">
                      <span className="text-slate-500">Instructor Salaries & Wage release (Outflow)</span>
                      <span className="text-rose-500">₹{salaryExpensesSum.toLocaleString()} ({totalExpense > 0 ? Math.round((salaryExpensesSum/totalExpense)*100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalExpense > 0 ? (salaryExpensesSum/totalExpense)*100 : 0}%` }} />
                    </div>
                  </div>

                  {/* General operations outlays */}
                  <div className="space-y-1 text-xs font-bold">
                    <div className="flex justify-between text-xxs">
                      <span className="text-slate-500">Operating Costs, Rent & Utilities (Outflow)</span>
                      <span className="text-rose-500">₹{opExpensesSum.toLocaleString()} ({totalExpense > 0 ? Math.round((opExpensesSum/totalExpense)*100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalExpense > 0 ? (opExpensesSum/totalExpense)*100 : 0}%` }} />
                    </div>
                  </div>
                </div>

                <div className="text-xxs text-slate-400 font-bold border-t border-slate-100 pt-3 flex flex-wrap justify-between gap-2">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Tuition Intake</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Staff Salaries</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> Operating Rent</span>
                  </div>
                  <span>Net: {netSurplus >= 0 ? '+' : ''}₹{netSurplus.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* General historical statistics chart fallback */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h4 className="font-extrabold text-base flex items-center gap-1.5 text-indigo-300">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  <span>Certified Operational Balance Audited</span>
                </h4>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  The accounting logs of Learner's Den contain validated student tuition and corporate wage transactions. Click below to save an authorized financial balance statement as a PDF audit report.
                </p>
              </div>
              <button
                onClick={downloadPdfFinancialStatement}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
              >
                <Download className="h-4.5 w-4.5 text-indigo-200" />
                <span>Save Financial Audit Report (PDF)</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* ONLINE PAYMENT GATEWAY & UPI GATEWAY SIMULATOR MODAL                      */}
      {/* ========================================================================= */}
      {isSimulatingPayment && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl flex flex-col text-left">
            
            {/* Header */}
            <div className="p-5 bg-slate-950 text-white flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-extrabold text-[8px] uppercase tracking-wider rounded">
                  <ShieldCheck className="h-2.5 w-2.5" /> SECURE GATEWAY CONNECT
                </span>
                <h3 className="font-extrabold text-sm mt-1">Learner's Den Payment Simulator</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulatingPayment(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Gateway Body */}
            <div className="p-6 space-y-5">
              
              {/* Method toggler */}
              <div className="flex border border-slate-200 p-1 bg-slate-50 rounded-xl gap-2">
                <button
                  type="button"
                  onClick={() => { setSimPaymentMethod('UPI'); setSimStatus('idle'); }}
                  className={`flex-1 py-1.5 text-xxs font-black rounded-lg transition-all text-center cursor-pointer ${
                    simPaymentMethod === 'UPI' ? 'bg-white text-slate-800 shadow-xxs border border-slate-150' : 'text-slate-400'
                  }`}
                >
                  Scan UPI QR Code
                </button>
                <button
                  type="button"
                  onClick={() => { setSimPaymentMethod('Card'); setSimStatus('idle'); }}
                  className={`flex-1 py-1.5 text-xxs font-black rounded-lg transition-all text-center cursor-pointer ${
                    simPaymentMethod === 'Card' ? 'bg-white text-slate-800 shadow-xxs border border-slate-150' : 'text-slate-400'
                  }`}
                >
                  Credit / Debit Card
                </button>
              </div>

              {/* UPI Tab */}
              {simPaymentMethod === 'UPI' && simStatus === 'idle' && (
                <div className="space-y-4 text-center animate-in fade-in duration-200">
                  <div className="p-4 border border-slate-200 bg-slate-50/50 rounded-2xl inline-block mx-auto">
                    {/* Visual QR Simulator drawing */}
                    <div className="h-32 w-32 bg-slate-900 text-white flex flex-col items-center justify-center rounded-xl p-2.5 mx-auto border-2 border-slate-950 relative">
                      <QrCode className="h-16 w-16" />
                      <span className="text-[9px] font-black tracking-widest text-indigo-400 mt-1">UPI SECURE</span>
                      {/* Decorative dots */}
                      <span className="absolute top-1.5 left-1.5 h-1.5 w-1.5 rounded-full bg-white" />
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white" />
                      <span className="absolute bottom-1.5 left-1.5 h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xxs font-bold text-slate-400 uppercase">Merchant Payee Account</p>
                    <p className="text-xs font-extrabold text-slate-800 font-mono">{upiIdInput} | {merchantNameInput}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Simulated Intake Dues: <b className="text-emerald-600">₹{netAmount.toLocaleString()}</b></p>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Simulated Payer UPI App</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['GPay', 'PhonePe', 'Paytm'] as const).map((app) => (
                        <button
                          type="button"
                          key={app}
                          onClick={() => setSimUpiApp(app)}
                          className={`py-1.5 text-xxs font-black rounded-xl border text-center transition-all cursor-pointer ${
                            simUpiApp === app 
                              ? 'bg-indigo-50 border-indigo-250 text-indigo-700 shadow-xxs' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSimStatus('processing')}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Authorize Simulated QR Scan
                  </button>
                </div>
              )}

              {/* Credit Card Tab */}
              {simPaymentMethod === 'Card' && simStatus === 'idle' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  
                  {/* Card Graphic */}
                  <div className="relative h-44 w-full bg-gradient-to-br from-indigo-700 to-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex justify-between items-start">
                      <div className="h-8 w-11 bg-amber-400/20 border border-amber-300/30 rounded-lg flex items-center justify-center overflow-hidden">
                        <span className="text-[10px] font-mono text-amber-300 font-extrabold">CHIP</span>
                      </div>
                      <span className="text-xs font-black italic tracking-widest text-slate-350">VISA GOLD</span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-base font-mono tracking-widest font-extrabold text-slate-100">
                        {simCardNo || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between text-xxs font-mono text-slate-300">
                        <span>{simCardName.toUpperCase() || 'MOCK CARD HOLDER'}</span>
                        <span>EXP: {simCardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card input forms */}
                  <form onSubmit={(e) => { e.preventDefault(); setSimStatus('processing'); }} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Card Holder Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="John Doe"
                        value={simCardName}
                        onChange={(e) => setSimCardName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Card Number</label>
                      <input 
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        value={simCardNo}
                        onChange={(e) => handleCardNoChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                        <input 
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={simCardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-center focus:outline-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CVV Pin</label>
                        <input 
                          type="password"
                          required
                          maxLength={3}
                          placeholder="•••"
                          value={simCardCvv}
                          onChange={(e) => setSimCardCvv(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-center focus:outline-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Process Simulated Card transaction
                    </button>
                  </form>
                </div>
              )}

              {/* Processing loading state */}
              {simStatus === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
                  <div className="relative h-14 w-14">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-black text-slate-800">Processing Simulated Authorization...</p>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Awaiting token validation response from simulated banking gateway.</p>
                  </div>
                  <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${simProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Successful completion */}
              {simStatus === 'authorized' && (
                <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-emerald-50 text-emerald-600 border-2 border-emerald-300 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="h-9 w-9" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-slate-800">Simulation Authorized Successful!</h4>
                    <p className="text-xxs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
                      Online transaction ID <code className="font-bold text-indigo-650">{transactionId}</code> has been safely created and injected into the payment form!
                    </p>
                  </div>
                  
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xxs font-semibold font-mono w-full text-slate-600">
                    <div className="flex justify-between">
                      <span>Gateway Mode:</span>
                      <span className="font-bold">{simPaymentMethod} Gateway</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Injected Ref ID:</span>
                      <span className="font-bold">{transactionId}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSimulatingPayment(false)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Apply & Return to Form
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
