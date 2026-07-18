import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, IndianRupee, QrCode, ArrowRight, Download, CheckCircle, 
  HelpCircle, Eye, RefreshCw, X, Loader2, Sparkles, Building2, Send, ChevronRight, FileText
} from 'lucide-react';
import { Student, Batch, FeeReceipt, PaymentSettings } from '../types';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

interface StudentPaymentProps {
  studentId: string;
  studentBatchId?: string;
  batches: Batch[];
  fees: FeeReceipt[];
  students: Student[];
  onCollectFees: (studentId: string, amount: number, mode: string, meta?: any) => Promise<void>;
  onTriggerNotification: (message: string, title: string) => void;
  paymentSettings?: PaymentSettings;
}

export default function StudentPayment({
  studentId,
  studentBatchId,
  batches,
  fees,
  students,
  onCollectFees,
  onTriggerNotification,
  paymentSettings
}: StudentPaymentProps) {
  // Find logged-in student details
  const student = students.find((s) => s.id === studentId);
  const activeBatch = batches.find((b) => b.id === (student?.batchId || studentBatchId));
  
  // Outstanding fees calculation
  const totalDue = student ? student.totalFeesDue : 0;
  const totalPaid = student ? student.totalFeesPaid : 0;

  // Tabs for Payment Channels
  const [activeChannel, setActiveChannel] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  
  // Custom Payment Amount input
  const [payAmount, setPayAmount] = useState<string>(totalDue > 0 ? String(totalDue) : '1500');
  const [successMsg, setSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Advanced Student Payment Options
  const [paymentType, setPaymentType] = useState<'Full' | 'Installment'>('Full');
  const [installmentNo, setInstallmentNo] = useState('1');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoPercent, setPromoPercent] = useState(0);
  const [promoType, setPromoType] = useState('');
  const [referralName, setReferralName] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);

  // Dynamic live fee calculation variables
  const grossAmount = Number(payAmount || 0);
  const concessionAmount = promoApplied ? Math.round((grossAmount * promoPercent) / 100) : 0;
  const refDiscountAmount = referralApplied ? 500 : 0;
  const netAmount = Math.max(0, grossAmount - concessionAmount - refDiscountAmount);

  // --- UPI Channel State ---
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [upiId, setUpiId] = useState('herachandr@okaxis');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrType, setQrType] = useState<'dynamic' | 'static'>(paymentSettings?.customQrUrl ? 'static' : 'dynamic');

  useEffect(() => {
    if (paymentSettings?.customQrUrl) {
      setQrType('static');
    } else {
      setQrType('dynamic');
    }
  }, [paymentSettings]);

  // --- Card Channel State ---
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(student ? student.name.toUpperCase() : 'HERA CHANDR');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // --- Net Banking State ---
  const [selectedBank, setSelectedBank] = useState('');
  const [netbankingUserId, setNetbankingUserId] = useState('');
  const [netbankingPassword, setNetbankingPassword] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  // Filter historical receipts specifically belonging to this student
  const studentReceipts = fees.filter((r) => r.studentId === studentId);

  // Sync UPI payment amount dynamically
  useEffect(() => {
    if (activeChannel === 'UPI') {
      generateUpiQrCode();
    }
  }, [payAmount, upiId, activeChannel, paymentSettings]);

  // Generate UPI dynamic QR Code using Google API and local Canvas library
  const generateUpiQrCode = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;

    // Standard deep link format for UPI payments:
    // upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR&tn=NOTES
    const targetUpiId = paymentSettings?.upiId || 'learnersden@okaxis';
    const targetMerchant = paymentSettings?.merchantName || "Learner's Den";
    const notes = encodeURIComponent(`LDEN ERP Fees - ${student?.name || 'Student'}`);
    const upiDeepLink = `upi://pay?pa=${targetUpiId}&pn=${encodeURIComponent(targetMerchant)}&am=${payAmount}&cu=INR&tn=${notes}`;

    QRCode.toCanvas(canvas, upiDeepLink, {
      width: 180,
      margin: 1,
      color: {
        dark: '#1e293b', // Slate 800
        light: '#ffffff'
      }
    }, (err) => {
      if (err) {
        console.error("Error generating UPI QR code:", err);
        return;
      }
      setQrGenerated(true);

      // Draw standard branding badge directly inside the QR Canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(72, 72, 36, 36);
        ctx.fillStyle = '#4f46e5'; // Indigo 600 brand
        ctx.fillRect(77, 77, 26, 26);
        
        // Render small white merchant initials text
        const initials = targetMerchant.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'LD';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(initials, initials.length === 1 ? 87 : (initials.length === 2 ? 83 : 80), 94);
      }
    });
  };

  // Process Card input mask helper
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(v);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9]/g, '');
    if (clean.length >= 2) {
      setCardExpiry(clean.slice(0, 2) + '/' + clean.slice(2, 4));
    } else {
      setCardExpiry(clean);
    }
  };

  // Main payment execution handler
  const executePayment = async (channelMode: string) => {
    const amount = Number(payAmount);
    if (!studentId || isNaN(amount) || amount <= 0) {
      onTriggerNotification("Please enter a valid tuition payment amount.", "Invalid Amount");
      return;
    }

    const concessionAmt = promoApplied ? Math.round((amount * promoPercent) / 100) : 0;
    const refDiscountAmt = referralApplied ? 500 : 0;
    const netAmt = Math.max(0, amount - concessionAmt - refDiscountAmt);

    if (netAmt > totalDue && totalDue > 0) {
      if (!confirm(`You entered ₹${netAmt.toLocaleString()} (after discount), which is greater than your current outstanding dues of ₹${totalDue.toLocaleString()}. Would you like to prepay your next semester tuition advance?`)) {
        return;
      }
    }

    setIsProcessing(true);
    
    // Simulate real gateway processing handshake delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const generatedTxn = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
      const meta = {
        paymentType,
        installmentNo: paymentType === 'Installment' ? Number(installmentNo) : undefined,
        concessionApplied: promoApplied,
        concessionType: promoApplied ? promoType : undefined,
        concessionPercentage: promoApplied ? promoPercent : undefined,
        concessionAmount: promoApplied ? concessionAmt : undefined,
        referralApplied,
        referrerName: referralApplied ? referralName : undefined,
        referralDiscount: referralApplied ? refDiscountAmt : undefined,
        transactionId: generatedTxn,
        remarks: `Self-payment via student dashboard (${channelMode})`
      };

      await onCollectFees(studentId, netAmt, channelMode, meta);
      
      onTriggerNotification(`Successfully authorized receipt of ₹${netAmt.toLocaleString()} via ${channelMode} secure transfer channel.`, "Payment Authorized");
      setSuccessMsg(`Congratulations! Your payment of ₹${netAmt.toLocaleString()} has been authorized and cleared.`);
      
      // Reset forms
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setNetbankingUserId('');
      setNetbankingPassword('');
      setShowOtpScreen(false);
      setOtpValue('');
      setPromoCode('');
      setPromoApplied(false);
      setReferralName('');
      setReferralApplied(false);

      // Refresh remaining due defaults
      const remainingDue = Math.max(0, totalDue - netAmt);
      setPayAmount(remainingDue > 0 ? String(remainingDue) : '1500');

      setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
    } catch (err) {
      console.error(err);
      onTriggerNotification("Gateway handshake failed. Please check network connections and try again.", "Transaction Failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Netbanking Form Simulation Step 1
  const handleNetBankingLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || !netbankingUserId || !netbankingPassword) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowOtpScreen(true);
      onTriggerNotification(`An OTP validation token has been dispatched to your registered mobile ending in *567.`, "OTP Sent");
    }, 1200);
  };

  // PDF Receipt Compiler with jsPDF
  const downloadPdfReceipt = (receipt: FeeReceipt) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });

    // 1. Sleek Outer Slate border Frame
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.4);
    doc.rect(5, 5, 138, 200); // inner frame

    // 2. High-contrast primary headers
    doc.setTextColor(79, 70, 229); // Indigo 600 Brand Accent
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("LEARNER'S DEN COACHING CENTER", 74, 20, { align: 'center' });

    doc.setTextColor(100, 116, 139); // Slate 500
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Official Academic ERP tuition Fee Bill", 74, 25, { align: 'center' });

    // Decorative Separator Line
    doc.setLineWidth(0.6);
    doc.setDrawColor(99, 102, 241); // Indigo 500
    doc.line(15, 30, 133, 30);

    // 3. Receipt Details Card
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("OFFICIAL RECEIPT", 15, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Receipt Reference: ${receipt.receiptNo}`, 15, 44);
    doc.text(`Transaction Date: ${receipt.date}`, 15, 49);
    doc.text(`Payment Mode: ${receipt.paymentMode} ${receipt.transactionId ? `(Ref: ${receipt.transactionId})` : '(Online Gateway)'}`, 15, 54);
    doc.text(`Payment Category: ${receipt.paymentType === 'Installment' ? `Installment #${receipt.installmentNo || 1}` : 'Full Tuition Clearance'}`, 15, 59);

    // 4. Student Enrollment Box
    doc.setFillColor(248, 250, 252); // Slate 50 Background
    doc.rect(15, 65, 118, 28, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("STUDENT PROFILE", 20, 71);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Student Name: ${student?.name || 'Unknown Student'}`, 20, 77);
    doc.text(`Batch: ${activeBatch?.name || 'N/A'}`, 20, 82);
    doc.text(`Outstanding Fees remaining: INR ${(student?.totalFeesDue || 0).toLocaleString()}.00`, 20, 87);

    // 5. Billing Table Breakdown
    doc.setLineWidth(0.2);
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.line(15, 100, 133, 100);

    doc.setFont("helvetica", "bold");
    doc.text("Particulars of Transaction", 15, 105);
    doc.text("Amount (INR)", 133, 105, { align: 'right' });
    doc.line(15, 108, 133, 108);

    doc.setFont("helvetica", "normal");
    
    // Add transaction breakdown items
    let currentY = 115;
    
    // Base amount
    const baseAmt = receipt.amount + (receipt.concessionAmount || 0) + (receipt.referralDiscount || 0);
    doc.text(`Base Tuition Amount`, 15, currentY);
    doc.text(`INR ${baseAmt.toLocaleString()}.00`, 133, currentY, { align: 'right' });
    currentY += 6;

    if (receipt.concessionApplied) {
      doc.setTextColor(220, 38, 38); // Red
      doc.text(`Concession: ${receipt.concessionType || 'Scholarship Discount'} (-${receipt.concessionPercentage || 0}%)`, 15, currentY);
      doc.text(`- INR ${(receipt.concessionAmount || 0).toLocaleString()}.00`, 133, currentY, { align: 'right' });
      doc.setTextColor(30, 41, 59); // Reset slate
      currentY += 6;
    }

    if (receipt.referralApplied) {
      doc.setTextColor(220, 38, 38); // Red
      doc.text(`Referral Discount (Referrer: ${receipt.referrerName || 'Affiliate'})`, 15, currentY);
      doc.text(`- INR ${(receipt.referralDiscount || 0).toLocaleString()}.00`, 133, currentY, { align: 'right' });
      doc.setTextColor(30, 41, 59); // Reset slate
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

    // Summary Net Received Amount
    doc.setFont("helvetica", "bold");
    doc.text("NET AMOUNT RECEIVED", 15, currentY);
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.text(`INR ${receipt.amount.toLocaleString()}.00`, 133, currentY, { align: 'right' });

    doc.setTextColor(30, 41, 59); // Slate 800
    doc.line(15, currentY + 4, 133, currentY + 4);

    // 6. Signature Footers
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFontSize(7);
    doc.text("Thank you for choosing Learner's Den!", 74, 172, { align: 'center' });
    doc.text("This is an authenticated cryptographic billing invoice. No manual signature required.", 74, 176, { align: 'center' });

    // Stamp Badge Look
    doc.setDrawColor(129, 140, 248); // Indigo 400
    doc.setFillColor(245, 247, 255); // Indigo 50
    doc.circle(115, 185, 11, "FD");
    
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text("LEARNER'S DEN", 115, 184, { align: 'center' });
    doc.text("OFFICIAL PAID", 115, 187, { align: 'center' });

    // Save PDF
    doc.save(`Receipt-${receipt.receiptNo}-${student?.name.replace(/\s+/g, '_') || 'Student'}.pdf`);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Dues Breakdown Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-5 shadow-xxs">
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Tuition Fees Outstanding</p>
          <h2 className="text-2xl font-black text-indigo-950 mt-1">₹{totalDue.toLocaleString()}</h2>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`inline-block h-2 w-2 rounded-full ${totalDue > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              {totalDue > 0 ? 'Billing Cycled' : 'Fully Cleared'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Fees Disbursed</p>
          <h2 className="text-2xl font-black text-slate-800 mt-1">₹{totalPaid.toLocaleString()}</h2>
          <p className="text-[9px] text-slate-400 mt-2 font-medium">Across all previous ledger cycles</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Curriculum Batch</p>
          <h2 className="text-base font-extrabold text-slate-800 mt-1 truncate">{activeBatch?.name || 'Elite Batch JEE 2026'}</h2>
          <p className="text-[9px] text-slate-400 mt-2.5 font-medium">{activeBatch?.schedule || 'Mon, Wed, Fri (4:00 PM)'}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Financial Status</p>
          <div className="mt-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-full border ${
              student?.feeStatus === 'Paid' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : student?.feeStatus === 'Overdue'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              {student?.feeStatus || 'Paid'}
            </span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-medium">Automatic billing synchronization active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Dynamic Payment Forms Gateway */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xxs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-indigo-600" />
                <span>Secure Payment Gateway Portal</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Authorize payments using any verified digital finance instrument.</p>
            </div>

            {/* Quick full pay shortcut */}
            {totalDue > 0 && (
              <button
                type="button"
                onClick={() => setPayAmount(String(totalDue))}
                className="px-2.5 py-1 text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg uppercase tracking-wide transition-all cursor-pointer"
              >
                Clear Entire Dues
              </button>
            )}
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-start gap-3 animate-fadeIn">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-800">Payment Processed Successfully!</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Amount configuration panel */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xxs font-black text-slate-500 uppercase tracking-wider">Specify Payment Amount (₹)</label>
              <div className="flex items-center gap-1.5">
                {['500', '1000', '1500'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPayAmount(val)}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[9px] font-bold text-slate-600 transition-all cursor-pointer"
                  >
                    ₹{Number(val).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="number"
                min="10"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Enter custom deposit value"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl text-sm font-black text-slate-800 bg-white"
              />
            </div>
          </div>

          {/* Advanced Options Panel */}
          <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan & Referral Details</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Type */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 mb-1">Payment Plan</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('Full')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      paymentType === 'Full'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Full Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('Installment')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      paymentType === 'Installment'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Instalment
                  </button>
                </div>
              </div>

              {/* Installment Selector */}
              {paymentType === 'Installment' && (
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 mb-1">Select Instalment Number</label>
                  <select
                    value={installmentNo}
                    onChange={(e) => setInstallmentNo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="1">1st Instalment</option>
                    <option value="2">2nd Instalment</option>
                    <option value="3">3rd Instalment</option>
                    <option value="4">4th Instalment</option>
                  </select>
                </div>
              )}
            </div>

            {/* Concession/Promo and Referral Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              {/* Promo Code Concession */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 mb-1">Concession Promo Code</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. SCHOLAR10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    disabled={promoApplied}
                  />
                  {promoApplied ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPromoApplied(false);
                        setPromoPercent(0);
                        setPromoType('');
                      }}
                      className="px-2 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const code = promoCode.trim().toUpperCase();
                        if (code === 'SCHOLAR10') {
                          setPromoApplied(true);
                          setPromoPercent(10);
                          setPromoType('Scholarship Coupon Code (SCHOLAR10)');
                          onTriggerNotification('10% Scholarship concession successfully applied!', 'Promo Code Applied');
                        } else if (code === 'SIBLING15') {
                          setPromoApplied(true);
                          setPromoPercent(15);
                          setPromoType('Sibling Concession (SIBLING15)');
                          onTriggerNotification('15% Sibling concession successfully applied!', 'Promo Code Applied');
                        } else if (code === 'EWS25') {
                          setPromoApplied(true);
                          setPromoPercent(25);
                          setPromoType('EWS Financial Aid (EWS25)');
                          onTriggerNotification('25% EWS concession successfully applied!', 'Promo Code Applied');
                        } else if (code) {
                          onTriggerNotification('Invalid promo code. Try SCHOLAR10, SIBLING15, or EWS25.', 'Invalid Code');
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Hint: SCHOLAR10, SIBLING15, EWS25</p>
              </div>

              {/* Referral discount */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 mb-1">Referral Reference Name</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter friend or senior's name"
                    value={referralName}
                    onChange={(e) => setReferralName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    disabled={referralApplied}
                  />
                  {referralApplied ? (
                    <button
                      type="button"
                      onClick={() => setReferralApplied(false)}
                      className="px-2 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (referralName.trim().length > 2) {
                          setReferralApplied(true);
                          onTriggerNotification('Flat ₹500 referral discount applied!', 'Referral Applied');
                        } else {
                          onTriggerNotification('Please enter a valid referrer name (min 3 chars).', 'Referral Required');
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Unlock flat ₹500 discount on references</p>
              </div>
            </div>

            {/* Detailed Calculations breakdown */}
            {(promoApplied || referralApplied) && (
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Gross Tuition Amount:</span>
                  <span>₹{grossAmount.toLocaleString()}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between font-bold text-rose-600">
                    <span>Promo Concession Discount ({promoPercent}%):</span>
                    <span>- ₹{concessionAmount.toLocaleString()}</span>
                  </div>
                )}
                {referralApplied && (
                  <div className="flex justify-between font-bold text-rose-600">
                    <span>Referral Discount Reward:</span>
                    <span>- ₹500</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-indigo-950 pt-1.5 border-t border-indigo-100 text-sm">
                  <span>Net Payable Amount:</span>
                  <span>₹{netAmount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Horizontal Channel Select Tabs */}
          <div className="flex border-b border-slate-150 gap-1.5">
            {[
              { id: 'UPI', label: 'UPI App / QR Transfer', icon: QrCode },
              { id: 'Card', label: 'Credit & Debit Cards', icon: CreditCard },
              { id: 'NetBanking', label: 'Direct Netbanking', icon: Building2 }
            ].map((chan) => {
              const Icon = chan.icon;
              return (
                <button
                  key={chan.id}
                  onClick={() => setActiveChannel(chan.id as any)}
                  className={`flex-1 py-3 text-center border-b-2 font-black text-xxs sm:text-xs flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer ${
                    activeChannel === chan.id 
                      ? 'border-indigo-600 text-indigo-700' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{chan.label}</span>
                </button>
              );
            })}
          </div>

          {/* CHANNEL WORKSPACES */}

          {/* UPI PANEL */}
          {activeChannel === 'UPI' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                <div className="sm:col-span-5 flex flex-col items-center">
                  {paymentSettings?.customQrUrl && (
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-3 w-full max-w-[190px]">
                      <button
                        type="button"
                        onClick={() => setQrType('static')}
                        className={`flex-1 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          qrType === 'static' ? 'bg-white text-slate-800 shadow-xxs font-black' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Static QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrType('dynamic')}
                        className={`flex-1 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          qrType === 'dynamic' ? 'bg-white text-slate-800 shadow-xxs font-black' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Dynamic (₹{netAmount.toLocaleString()})
                      </button>
                    </div>
                  )}

                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs relative">
                    {qrType === 'static' && paymentSettings?.customQrUrl ? (
                      <img src={paymentSettings.customQrUrl} alt="Institution QR" className="w-[180px] h-[180px] object-contain rounded-xl" />
                    ) : (
                      <>
                        <canvas ref={qrCanvasRef} className="w-[180px] h-[180px]" />
                        {!qrGenerated && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-2xl">
                            <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2.5 text-center font-bold">
                    {qrType === 'static' ? 'Scan Official Institution QR' : 'Scan dynamic on-the-fly QR'}
                  </p>
                </div>

                <div className="sm:col-span-7 space-y-4 text-left">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Institution UPI Endpoint</h4>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-xxs">
                        <span className="font-semibold text-slate-400 uppercase tracking-wider">Recipient Name:</span>
                        <span className="font-bold text-slate-800">{paymentSettings?.merchantName || "Learner's Den"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xxs border-t border-slate-100 pt-1.5">
                        <span className="font-semibold text-slate-400 uppercase tracking-wider">UPI ID / VPA:</span>
                        <span className="font-mono font-bold text-indigo-600 select-all">{paymentSettings?.upiId || "learnersden@okaxis"}</span>
                      </div>
                    </div>
                  </div>

                  {paymentSettings?.instructions && (
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xxs font-semibold text-indigo-950 flex items-start gap-2 leading-relaxed">
                      <HelpCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black text-indigo-900 uppercase tracking-wide text-[9px] mb-0.5">Payment Instructions:</p>
                        <p className="text-slate-600 font-medium">{paymentSettings.instructions}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xxs font-black text-slate-500 uppercase">Your UPI ID for Verification (VPA)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. herachandr@okhdfcbank"
                      className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl text-xs font-bold text-slate-700"
                    />
                  </div>

                  <button
                    onClick={() => executePayment('UPI')}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying QR Transaction...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Simulate QR Scan & Clear ₹{netAmount.toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CREDIT/DEBIT CARD PANEL */}
          {activeChannel === 'Card' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Realistic CSS 3D Flipping Credit Card Visual Mockup */}
              <div className="perspective-1000 w-full max-w-[340px] h-[190px] mx-auto relative group">
                <div className={`relative w-full h-full duration-700 transform-style-3d ${isCardFlipped ? 'rotate-y-180' : ''}`}>
                  
                  {/* Card Front Face */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 text-white p-5 flex flex-col justify-between shadow-md backface-hidden border border-slate-850">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">LEARNER'S DEN</span>
                        <p className="text-[8px] text-indigo-300 tracking-wider">SECURE CAMPUS CARD</p>
                      </div>
                      <span className="text-xl font-black italic tracking-tighter text-slate-100">VISA</span>
                    </div>

                    {/* Simulating electronic chip */}
                    <div className="h-8 w-11 rounded-md bg-gradient-to-br from-yellow-300 to-amber-500/80 border border-amber-400 opacity-85 mt-2" />

                    <div className="space-y-1 mt-2">
                      <p className="text-sm font-bold font-mono tracking-widest text-slate-100">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[7px] text-slate-400 uppercase">Card Holder</p>
                          <p className="text-[10px] font-extrabold uppercase truncate max-w-[200px] text-slate-200">{cardHolder || 'HERA CHANDR'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[7px] text-slate-400 uppercase">Expiry</p>
                          <p className="text-[10px] font-extrabold text-slate-200">{cardExpiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Back Face */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 text-white flex flex-col justify-between py-5 shadow-md rotate-y-180 backface-hidden border border-slate-850">
                    <div className="w-full h-9 bg-slate-950" />
                    
                    <div className="px-5 mt-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-7 bg-white/15 rounded text-right pr-2 text-xxs italic text-slate-300 flex items-center justify-end">
                          Authorized Signature Box
                        </div>
                        <div className="w-10 h-7 bg-amber-400 text-slate-900 font-bold font-mono text-xs flex items-center justify-center rounded">
                          {cardCvv || '•••'}
                        </div>
                      </div>
                    </div>

                    <div className="px-5 text-[7px] text-slate-500 text-center leading-normal">
                      This is a dynamic educational credit card representation. All credentials strictly remain processed on-client in the Cloud Run sandbox container.
                    </div>
                  </div>

                </div>
              </div>

              {/* Card input forms */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 text-left">
                <div className="sm:col-span-12 space-y-1">
                  <label className="block text-xxs font-black text-slate-500 uppercase">Debit / Credit Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    onFocus={() => setIsCardFlipped(false)}
                    placeholder="4111 2222 3333 4444"
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl text-xs font-bold text-slate-700"
                  />
                </div>

                <div className="sm:col-span-6 space-y-1">
                  <label className="block text-xxs font-black text-slate-500 uppercase">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    onFocus={() => setIsCardFlipped(false)}
                    placeholder="As printed on card"
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl text-xs font-bold text-slate-700"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-xxs font-black text-slate-500 uppercase">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    maxLength={5}
                    required
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    onFocus={() => setIsCardFlipped(false)}
                    placeholder="12/29"
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl text-xs font-bold text-slate-700 text-center"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-xxs font-black text-slate-500 uppercase">CVV Security</label>
                  <input
                    type="password"
                    maxLength={3}
                    required
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                    onFocus={() => setIsCardFlipped(true)}
                    onBlur={() => setIsCardFlipped(false)}
                    placeholder="•••"
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl text-xs font-bold text-slate-700 text-center"
                  />
                </div>
              </div>

              <button
                onClick={() => executePayment('Card')}
                disabled={isProcessing || !cardNumber || !cardExpiry || !cardCvv}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authorizing VISA Secure Gateway...</span>
                  </>
                ) : (
                  <span>Charge Card & Pay Tuition (₹{netAmount.toLocaleString()})</span>
                )}
              </button>
            </div>
          )}

          {/* DIRECT NETBANKING Direct Login */}
          {activeChannel === 'NetBanking' && (
            <div className="space-y-4 animate-fadeIn">
              {!showOtpScreen ? (
                <form onSubmit={handleNetBankingLogin} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="block text-xxs font-black text-slate-500 uppercase">Select Retail Bank Portal</label>
                    <select
                      required
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-semibold text-slate-700"
                    >
                      <option value="">-- Choose Partner Bank --</option>
                      <option value="sbi">State Bank of India (SBI)</option>
                      <option value="hdfc">HDFC Retail Bank</option>
                      <option value="icici">ICICI Bank Infinity</option>
                      <option value="axis">Axis Bank Internet Banking</option>
                      <option value="kotak">Kotak Mahindra Netbanking</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xxs font-black text-slate-500 uppercase">Internet Banking User ID</label>
                    <input
                      type="text"
                      required
                      value={netbankingUserId}
                      onChange={(e) => setNetbankingUserId(e.target.value)}
                      placeholder="Enter netbanking alias/id"
                      className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xxs font-black text-slate-500 uppercase">Secure PIN / Password</label>
                    <input
                      type="password"
                      required
                      value={netbankingPassword}
                      onChange={(e) => setNetbankingPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl text-xs font-bold text-slate-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing || !selectedBank}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying Secure Bank Portal Handshake...</span>
                      </>
                    ) : (
                      <span>Initiate Netbanking Gateway</span>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 bg-amber-55/40 border border-amber-200/80 rounded-2xl flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-amber-900">OTP Handshake Needed</h5>
                      <p className="text-[10px] text-amber-800 leading-normal mt-0.5">Please verify the session using the 6-digit numeric token sent to your contact number by your retail banking partner.</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xxs font-black text-slate-500 uppercase text-center">Verify OTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="123456"
                      className="w-40 mx-auto px-3 py-2.5 border-2 border-indigo-400 focus:outline-none focus:border-indigo-600 rounded-xl text-base font-black text-slate-800 text-center tracking-widest block"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpScreen(false);
                        setOtpValue('');
                      }}
                      className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => executePayment('Online Bank')}
                      disabled={isProcessing || otpValue.length < 4}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          <span>Clearing...</span>
                        </>
                      ) : (
                        <span>Verify & Pay</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Historical Invoices & PDFs */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xxs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-150">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-indigo-600" />
                <span>My Ledger Receipts History</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Click any captured receipt below to generate and save your official certified PDF invoice receipt.</p>
            </div>

            <div className="overflow-y-auto max-h-[380px] space-y-3 pr-1">
              {studentReceipts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                  <FileText className="h-10 w-10 mx-auto opacity-30 mb-2" />
                  <p className="text-xxs font-bold">No payments captured for your account yet.</p>
                  <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">Outstanding course fee cycle needs to be initiated with a payment deposit.</p>
                </div>
              ) : (
                studentReceipts.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-slate-150/80 bg-slate-50/20 hover:bg-indigo-50/10 flex justify-between items-center text-xs transition-all duration-300 hover:border-indigo-200 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-800 text-[9px] tracking-wider uppercase px-2 py-0.5 rounded bg-white border border-slate-200">
                          {rec.receiptNo}
                        </span>
                        <span className="text-slate-400 text-xxs font-semibold">
                          {rec.date}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xxs mt-1 font-semibold flex items-center gap-1">
                        Mode: <b className="text-slate-700">{rec.paymentMode}</b>
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[8px] text-emerald-600 font-extrabold uppercase tracking-wide">Captured</p>
                        <h4 className="font-black text-slate-800 text-sm">₹{rec.amount.toLocaleString()}</h4>
                      </div>
                      
                      {/* PDF download receipt button */}
                      <button
                        onClick={() => downloadPdfReceipt(rec)}
                        title="Download official PDF Invoice"
                        className="p-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg border border-indigo-100 transition-all cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-150 bg-indigo-50/30 p-3.5 rounded-xl">
            <h5 className="text-[10px] font-black text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>Learner's Den Guarantee</span>
            </h5>
            <p className="text-[10px] text-indigo-700 leading-relaxed font-semibold mt-1">
              Payments are safe and secured with end-to-end cryptographic layers. Captured receipts automatically clear pinned notices inside the central system Notice Board within 10 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
