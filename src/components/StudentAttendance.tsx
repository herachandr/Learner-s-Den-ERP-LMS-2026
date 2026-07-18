import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, QrCode, MapPin, Camera, Clock, CheckCircle, 
  AlertCircle, ShieldCheck, HelpCircle, Eye, RefreshCw, X, Loader2, Sparkles, Navigation, Calendar, ChevronLeft, ChevronRight,
  Download, FileText, ClipboardList, Send, FileSpreadsheet
} from 'lucide-react';
import { Student, Batch, Attendance, LeaveApplication } from '../types';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

interface StudentAttendanceProps {
  studentId: string;
  studentBatchId?: string;
  batches: Batch[];
  attendance: Attendance[];
  onCheckIn: (checkInData: {
    studentId: string;
    batchId: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Leave';
    arrivalTime?: string;
    lateReason?: string;
    graceStatus?: 'Grace' | 'Exceeded';
    photoUrl?: string;
    photoTimestamp?: string;
    photoLocation?: { lat: number; lng: number };
  }) => Promise<void>;
  leaves: LeaveApplication[];
  onApplyLeave: (leaveData: {
    studentId: string;
    studentName: string;
    batchId: string;
    startDate: string;
    endDate: string;
    reason: string;
    attachmentUrl?: string;
  }) => Promise<void>;
}

export default function StudentAttendance({
  studentId,
  studentBatchId,
  batches,
  attendance,
  onCheckIn,
  leaves = [],
  onApplyLeave
}: StudentAttendanceProps) {
  // Find student's active batch dynamically
  const studentBatch = batches.find(b => b.id === studentBatchId) || batches[0];
  const batchId = studentBatch?.id || 'batch-1';

  // Component Tabs
  const [activeTab, setActiveTab] = useState<'console' | 'history' | 'leave'>('console');
  
  // Interactive GPS Slider state
  const [gpsSimulatedDistance, setGpsSimulatedDistance] = useState<number>(25); // default 25m (inside bounds)
  const [gpsSimulatedLat, setGpsSimulatedLat] = useState<number>(12.97162);
  const [gpsSimulatedLng, setGpsSimulatedLng] = useState<number>(77.59463);
  
  // Time simulation (classes start at 08:00 AM, grace is 15m)
  const [simulatedClockTime, setSimulatedClockTime] = useState<string>('08:10');
  const [isTimeLate, setIsTimeLate] = useState(false);
  const [lateJustification, setLateJustification] = useState('Metro rail technical delay');

  // Check-in Methods
  const [punchMode, setPunchMode] = useState<'QR_GEN' | 'QR_SCAN' | 'PHOTO_VERIFY'>('QR_GEN');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState('');
  
  // QR states
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrExpiry, setQrExpiry] = useState<number>(45);
  const [qrToken, setQrToken] = useState<string>('');

  // Scanner states
  const [simulatedScanCompleted, setSimulatedScanCompleted] = useState(false);
  const [scannerScanning, setScannerScanning] = useState(false);

  // Photo states
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photoVerifiedScore, setPhotoVerifiedScore] = useState<number | null>(null);
  const [showFaceReticle, setShowFaceReticle] = useState(true);
  const [photoCoords, setPhotoCoords] = useState<{ lat: number; lng: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Leave Form state
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFileAttached, setLeaveFileAttached] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);

  // 4-Month History parameters
  const [historyYear] = useState<number>(2026);
  const [historyMonth, setHistoryMonth] = useState<number>(5); // 5 is June, 4 is May, 3 is April, 2 is March
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const CAMPUS_LAT = 12.9716;
  const CAMPUS_LNG = 77.5946;
  const GEOFENCE_RADIUS_METERS = 100;

  // Dynamic Branches State
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/branches');
        const data = await res.json();
        if (Array.isArray(data)) {
          setBranches(data);
          const activeBranch = data.find(b => b.status === 'Active') || data[0];
          if (activeBranch) {
            setSelectedBranchId(activeBranch.id);
            setSelectedBranch(activeBranch);
          }
        }
      } catch (err) {
        console.error("Failed to load branches in student console:", err);
      }
    };
    fetchBranches();
  }, []);

  // Track if check-in time exceeds grace
  useEffect(() => {
    setIsTimeLate(simulatedClockTime > '08:15');
  }, [simulatedClockTime]);

  // Sync simulated coordinates with slider distance relative to selected branch
  useEffect(() => {
    const baseLat = selectedBranch ? selectedBranch.lat : CAMPUS_LAT;
    const baseLng = selectedBranch ? selectedBranch.lng : CAMPUS_LNG;
    const offset = (gpsSimulatedDistance / 1000) * 0.009;
    setGpsSimulatedLat(Number((baseLat + offset / 1.414).toFixed(6)));
    setGpsSimulatedLng(Number((baseLng + offset / 1.414).toFixed(6)));
  }, [gpsSimulatedDistance, selectedBranch]);

  // Generate QR Token
  const regenerateQrToken = () => {
    const randomHex = Math.random().toString(16).substr(2, 10).toUpperCase();
    const token = `DEN-PASS-${studentId}-${batchId}-${new Date().toISOString().split('T')[0]}-${randomHex}`;
    setQrToken(token);
    setQrExpiry(45);
  };

  useEffect(() => {
    regenerateQrToken();
  }, [punchMode]);

  // QR Expiry countdown
  useEffect(() => {
    if (punchMode !== 'QR_GEN' || qrExpiry <= 0) {
      if (qrExpiry === 0) regenerateQrToken();
      return;
    }
    const interval = setInterval(() => {
      setQrExpiry(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [qrExpiry, punchMode]);

  // Draw QR code canvas
  useEffect(() => {
    const canvas = qrCanvasRef.current;
    if (canvas && punchMode === 'QR_GEN') {
      QRCode.toCanvas(canvas, qrToken, {
        width: 190,
        margin: 1,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      }, (err) => {
        if (err) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(75, 75, 40, 40);
          ctx.fillStyle = '#6366f1';
          ctx.fillRect(80, 80, 30, 30);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(88, 95);
          ctx.lineTo(93, 100);
          ctx.lineTo(102, 89);
          ctx.stroke();
        }
      });
    }
  }, [qrToken, punchMode]);

  // Simulate scanning class QR
  const handleScanClassQR = () => {
    setScannerScanning(true);
    setSimulatedScanCompleted(false);
    setTimeout(() => {
      setSimulatedScanCompleted(true);
      setTimeout(() => {
        setScannerScanning(false);
        submitCheckIn('QR_Scanner_Sync');
      }, 1000);
    }, 2500);
  };

  // Camera initialization
  const startCamera = async () => {
    setIsCameraActive(true);
    setCapturedPhoto(null);
    setPhotoVerifiedScore(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn("Camera fallback triggered");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (video && streamRef.current) {
        ctx.drawImage(video, 0, 0, 640, 480);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 640, 480);
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 3;
        ctx.strokeRect(30, 30, 580, 420);
        ctx.fillStyle = '#312e81';
        ctx.beginPath(); ctx.arc(320, 240, 100, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("BIOMETRIC RETINAL SNAPSHOT", 320, 180);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#a5b4fc';
        ctx.fillText("STUDENT IDENTITY AUTO-MATCH", 320, 215);
      }

      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(0, 380, 640, 100);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 13px monospace';
      ctx.fillText("✓ BIOMETRIC FACE KEY MATCH: 99.82% CONFIDENCE SCORE", 40, 415);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`🕒 WATERMARK TIMESTAMP : ${new Date().toLocaleString()}`, 40, 435);
      ctx.fillText(`🗺️ SECURE GEOLOCATION  : ${gpsSimulatedLat}° N, ${gpsSimulatedLng}° E`, 40, 455);

      const dataUri = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUri);
      setPhotoCoords({ lat: gpsSimulatedLat, lng: gpsSimulatedLng });
      stopCamera();

      // Simulating verification process
      setIsActionLoading(true);
      setTimeout(() => {
        setPhotoVerifiedScore(99.82);
        setIsActionLoading(false);
      }, 1500);
    }
  };

  const submitCheckIn = async (methodUsed: string) => {
    // Geofence lock check
    const radiusLimit = selectedBranch ? selectedBranch.radius : GEOFENCE_RADIUS_METERS;
    const locationName = selectedBranch ? selectedBranch.name : "Learner's Den campus";
    if (gpsSimulatedDistance > radiusLimit) {
      alert(`PUNCH DENIED: You are currently located ${gpsSimulatedDistance} meters away from ${locationName}. Geofence radius limit is ${radiusLimit} meters.`);
      return;
    }

    setIsActionLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const isLate = simulatedClockTime > '08:15';
      const status = isLate ? 'Late' : 'Present';

      const checkInData = {
        studentId,
        batchId,
        date: today,
        status: status as any,
        arrivalTime: simulatedClockTime,
        lateReason: isLate ? lateJustification : undefined,
        graceStatus: isLate ? ('Exceeded' as const) : ('Grace' as const),
        photoUrl: capturedPhoto || undefined,
        photoTimestamp: capturedPhoto ? new Date().toLocaleString() : undefined,
        photoLocation: { lat: gpsSimulatedLat, lng: gpsSimulatedLng },
        branchId: selectedBranchId || undefined,
        qrValue: selectedBranch?.qrActive ? `DEN-SESSION:${batchId}:${today}` : undefined,
      };

      await onCheckIn(checkInData);
      
      // Ring success tone
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        setTimeout(() => { osc.stop(); audioCtx.close(); }, 500);
      } catch {}

      setCheckInSuccessMsg(`SUCCESS: Marked self check-in as "${status.toUpperCase()}" for today.`);
      setTimeout(() => {
        setCheckInSuccessMsg('');
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
      setCapturedPhoto(null);
      setPhotoVerifiedScore(null);
    }
  };

  // LEAVE FORM SUBMIT
  const handleApplyLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason) {
      alert("Please fill out all required fields.");
      return;
    }
    if (leaveStartDate > leaveEndDate) {
      alert("Start Date cannot be after End Date.");
      return;
    }

    setLeaveLoading(true);
    setLeaveSuccess('');
    try {
      // Find dynamic name of the student from parent profile or use ID
      const studentName = "Self Applicant";
      
      await onApplyLeave({
        studentId,
        studentName,
        batchId,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        reason: leaveReason,
        attachmentUrl: leaveFileAttached ? "medical_certificate_simulation.pdf" : undefined
      });

      setLeaveSuccess("Leave application submitted successfully! Admin will evaluate and verify.");
      setLeaveStartDate('');
      setLeaveEndDate('');
      setLeaveReason('');
      setLeaveFileAttached(false);
      setTimeout(() => setLeaveSuccess(''), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setLeaveLoading(false);
    }
  };

  // EXPORT COMPLETE ATTENDANCE REPORT CARD (PDF)
  const handleExportPDFCard = () => {
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text("LEARNER'S DEN ACADEMY", 15, 16);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text("STUDENT INDIVIDUAL ATTENDANCE REPORT CARD", 15, 24);
    doc.text(`Student ID : ${studentId} | Class Batch : ${studentBatch?.name || batchId}`, 15, 30);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 35);

    // Filter student records
    const myLogs = attendance.filter(sh => sh.batchId === batchId);
    let presents = 0, absents = 0, lates = 0, leavesCount = 0;
    
    myLogs.forEach(sh => {
      const r = sh.records.find(rec => rec.studentId === studentId);
      if (r) {
        if (r.status === 'Present') presents++;
        else if (r.status === 'Absent') absents++;
        else if (r.status === 'Late') lates++;
        else if (r.status === 'Leave') leavesCount++;
      }
    });

    const totalSlots = presents + absents + lates + leavesCount;
    const rate = totalSlots > 0 ? Math.round(((presents + lates + leavesCount) / totalSlots) * 100) : 100;

    // Analytics block
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("PERFORMANCE SUMMARY", 15, 52);

    doc.setFillColor(248, 250, 252);
    doc.rect(15, 56, 180, 28, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total Sessions Logged: ${totalSlots}`, 20, 65);
    doc.text(`Compliance Rate: ${rate}%`, 20, 71);
    doc.text(`Presents: ${presents} | Lates: ${lates} | Approved Leaves: ${leavesCount} | Absents: ${absents}`, 20, 77);

    // List records table
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 92, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text("Date", 20, 97);
    doc.text("Marked Status", 65, 97);
    doc.text("Arrival Time", 110, 97);
    doc.text("Justifications / Leaves Remarks", 145, 97);

    let y = 108;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const sortedSheets = [...attendance].sort((a,b) => b.date.localeCompare(a.date));
    sortedSheets.forEach(sh => {
      if (sh.batchId !== batchId) return;
      const rec = sh.records.find(r => r.studentId === studentId);
      if (!rec) return;

      if (y > 270) {
        doc.addPage();
        y = 25;
        doc.setFillColor(241, 245, 249);
        doc.rect(15, 12, 180, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text("Date", 20, 17);
        doc.text("Marked Status", 65, 17);
        doc.text("Arrival Time", 110, 17);
        doc.text("Justifications / Leaves Remarks", 145, 17);
        doc.setFont('helvetica', 'normal');
        y = 26;
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(15, y - 5, 195, y - 5);

      doc.text(sh.date, 20, y);
      
      if (rec.status === 'Present') {
        doc.setTextColor(16, 185, 129);
        doc.text("PRESENT (Verified)", 65, y);
      } else if (rec.status === 'Absent') {
        doc.setTextColor(239, 68, 68);
        doc.text("ABSENT (Unexcused)", 65, y);
      } else if (rec.status === 'Late') {
        doc.setTextColor(245, 158, 11);
        doc.text(`LATE ENTRY`, 65, y);
      } else {
        doc.setTextColor(59, 130, 246);
        doc.text("APPROVED LEAVE", 65, y);
      }
      doc.setTextColor(30, 41, 59);

      doc.text(rec.arrivalTime || '-', 110, y);
      doc.text((rec.lateReason || '-').substring(0, 22), 145, y);

      y += 8;
    });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text("*This report card acts as official academic compliance evidence.", 15, 285);

    doc.save(`Attendance_ReportCard_${studentId}.pdf`);
  };

  // CALENDAR DAYS GENERATOR
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const getCalendarDays = () => {
    const days = getDaysInMonth(historyYear, historyMonth);
    const firstDayIndex = days[0].getDay(); // 0: Sun, 1: Mon
    
    const paddedList = [];
    for (let i = 0; i < firstDayIndex; i++) {
      paddedList.push(null);
    }
    return [...paddedList, ...days];
  };

  // GET SPECIFIC DAY RECORD
  const getDayRecord = (dateString: string) => {
    const sheet = attendance.find(a => a.date === dateString && a.batchId === batchId);
    if (!sheet) return null;
    return sheet.records.find(r => r.studentId === studentId) || null;
  };

  // MY STATS CALCULATIONS
  const getSummaryStats = () => {
    let presents = 0;
    let absents = 0;
    let lates = 0;
    let leavesCount = 0;

    // Filter only records for my batch
    attendance.forEach(sh => {
      if (sh.batchId === batchId) {
        const r = sh.records.find(rec => rec.studentId === studentId);
        if (r) {
          if (r.status === 'Present') presents++;
          else if (r.status === 'Absent') absents++;
          else if (r.status === 'Late') lates++;
          else if (r.status === 'Leave') leavesCount++;
        }
      }
    });

    const total = presents + absents + lates + leavesCount;
    const rate = total > 0 ? Math.round(((presents + lates + leavesCount) / total) * 100) : 100;
    return { presents, absents, lates, leavesCount, total, rate };
  };

  const myStats = getSummaryStats();
  const calendarDays = getCalendarDays();
  const myLeaves = leaves.filter(l => l.studentId === studentId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* TABS DECK */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-xxs">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-4 py-1.5 text-xxs font-black rounded-lg transition-all cursor-pointer ${
              activeTab === 'console' ? 'bg-white text-slate-800 shadow-xxs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Check-In Console
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 text-xxs font-black rounded-lg transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-white text-slate-800 shadow-xxs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            History Calendar
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`px-4 py-1.5 text-xxs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1.5 relative ${
              activeTab === 'leave' ? 'bg-white text-slate-800 shadow-xxs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Apply Leave</span>
            {myLeaves.filter(l => l.status === 'Pending').length > 0 && (
              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        <div className="text-[10px] text-slate-500 font-bold hidden sm:block">
          Batch: <span className="text-slate-800 font-extrabold">{studentBatch?.name || 'Classroom A'}</span>
        </div>
      </div>

      {checkInSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xxs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          <span>{checkInSuccessMsg}</span>
        </div>
      )}

      {/* 1. CHECK-IN CONSOLE */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT PANELS: GEOLOCATION CONTROLLER & TIME LOCK */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* COMPASS GEOFENCE CONTROLLER */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xxs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-indigo-600" />
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Geofence coordinate</h4>
                </div>
                <Navigation className="h-3.5 w-3.5 text-indigo-500" />
              </div>

              <div className="space-y-4">
                {branches.length > 0 && (
                  <div className="flex flex-col space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Select Attendance Branch</label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => {
                        const bId = e.target.value;
                        setSelectedBranchId(bId);
                        setSelectedBranch(branches.find(b => b.id === bId) || null);
                      }}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xxs bg-white text-slate-700 font-extrabold focus:outline-hidden cursor-pointer"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
                      ))}
                    </select>
                    {selectedBranch?.qrActive && (
                      <span className="text-[9px] text-amber-600 font-bold mt-0.5 animate-pulse">
                        ⚠️ Scanning Batch QR Beacon is MANDATORY at this branch.
                      </span>
                    )}
                  </div>
                )}

                <div className="text-xxs space-y-2">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Simulated Distance:</span>
                    <span className={gpsSimulatedDistance <= (selectedBranch ? selectedBranch.radius : 100) ? 'text-emerald-600' : 'text-rose-500'}>
                      {gpsSimulatedDistance} meters {gpsSimulatedDistance <= (selectedBranch ? selectedBranch.radius : 100) ? `(Inside ${selectedBranch?.name || 'Campus'})` : '(Out of geofence)'}
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="5"
                    max="350"
                    value={gpsSimulatedDistance}
                    onChange={(e) => setGpsSimulatedDistance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-[10px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lat Coordinates:</span>
                    <span className="font-mono font-bold text-slate-700">{gpsSimulatedLat}° N</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lng Coordinates:</span>
                    <span className="font-mono font-bold text-slate-700">{gpsSimulatedLng}° E</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gps Accuracy:</span>
                    <span className="text-emerald-600 font-bold">± 3.4 meters (High Accuracy)</span>
                  </div>
                </div>

                {gpsSimulatedDistance > (selectedBranch ? selectedBranch.radius : 100) && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-rose-800 leading-relaxed font-bold">
                      GEOFENCE REJECTED: Self CheckIn is locked. Please pull the simulated distance slider under {selectedBranch ? selectedBranch.radius : 100} meters to check-in at {selectedBranch?.name || "Campus"}.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CLASSROOM TIME LOCK CONTROL */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xxs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-indigo-600" />
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Arrival clock simulation</h4>
                </div>
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
              </div>

              <div className="space-y-4 text-xxs">
                <div className="flex flex-col space-y-1">
                  <label className="font-bold text-slate-500">CheckIn Arrival Time</label>
                  <input
                    type="time"
                    value={simulatedClockTime}
                    onChange={(e) => setSimulatedClockTime(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:outline-hidden"
                  />
                  <p className="text-[9px] text-slate-400 italic mt-1">*Class begins at 08:00 AM. 08:15 AM limit triggers late declaration.</p>
                </div>

                {isTimeLate && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Late Entry Declaration Active</span>
                    </div>
                    <p className="text-[9px] text-amber-700 leading-relaxed leading-normal">
                      Since check-in occurs after 08:15 AM, you must provide a reason for late arrival to save record.
                    </p>
                    <textarea
                      value={lateJustification}
                      onChange={(e) => setLateJustification(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1.5 border border-amber-200 bg-white rounded-lg text-xxs focus:outline-hidden text-slate-700"
                      placeholder="e.g. Traffic delay, family emergency"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* MAIN COLUMN: SCANNING & CAMERA PANEL */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xxs space-y-6 flex flex-col justify-between">
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Class Check-In Interface</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Choose your verified checkout sensor method below.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => { setPunchMode('QR_GEN'); stopCamera(); }}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${
                      punchMode === 'QR_GEN' ? 'bg-white text-indigo-700 shadow-xxs' : 'text-slate-500'
                    }`}
                  >
                    My ID Pass
                  </button>
                  <button
                    onClick={() => { setPunchMode('QR_SCAN'); stopCamera(); }}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${
                      punchMode === 'QR_SCAN' ? 'bg-white text-indigo-700 shadow-xxs' : 'text-slate-500'
                    }`}
                  >
                    Scan Class QR
                  </button>
                  <button
                    onClick={() => { setPunchMode('PHOTO_VERIFY'); startCamera(); }}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${
                      punchMode === 'PHOTO_VERIFY' ? 'bg-white text-indigo-700 shadow-xxs' : 'text-slate-500'
                    }`}
                  >
                    Face ID Sync
                  </button>
                </div>
              </div>

              {/* METHOD 1: DYNAMIC ID PASS QR CODE */}
              {punchMode === 'QR_GEN' && (
                <div className="py-6 flex flex-col items-center text-center space-y-4">
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-slate-800">Your Student Digital Entry Pass</h5>
                    <p className="text-xxs text-slate-400 max-w-sm">
                      Present this encrypted token code to the classroom wall camera scanner or teacher roll app.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs relative">
                    <canvas ref={qrCanvasRef} />
                    {gpsSimulatedDistance > 100 && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-xxs flex flex-col items-center justify-center p-4">
                        <MapPin className="h-8 w-8 text-rose-500 mb-1" />
                        <span className="text-[10px] font-extrabold text-rose-800">Pass Geofenced Lock</span>
                        <p className="text-[9px] text-slate-500 mt-1 max-w-[140px] leading-relaxed">Slider must be inside 100m to activate credential tokens.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xxs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-xl">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Regenerates in {qrExpiry} seconds</span>
                  </div>
                </div>
              )}

              {/* METHOD 2: SCAN CLASSROOM BEACON QR */}
              {punchMode === 'QR_SCAN' && (
                <div className="py-8 flex flex-col items-center text-center space-y-5">
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-slate-800">Scan Lecture Screen Session Code</h5>
                    <p className="text-xxs text-slate-400 max-w-sm">
                      Press scan below to simulate student-side camera capturing and deciphering the Live teacher session payload.
                    </p>
                  </div>

                  <div className="w-52 h-36 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    {scannerScanning ? (
                      <div className="absolute inset-0 bg-indigo-950/20 flex flex-col items-center justify-center gap-2">
                        <div className="w-full h-0.5 bg-indigo-500 animate-bounce absolute top-12 left-0 shadow-lg shadow-indigo-400" />
                        <Loader2 className="h-5 w-5 text-indigo-400 animate-spin mt-6" />
                        <span className="text-[9px] font-mono text-indigo-300">Decoding matrix...</span>
                      </div>
                    ) : simulatedScanCompleted ? (
                      <div className="flex flex-col items-center justify-center text-emerald-400 gap-1 animate-pulse">
                        <CheckCircle className="h-8 w-8" />
                        <span className="text-[9px] font-mono">PAYLOAD DECRYPTED</span>
                      </div>
                    ) : (
                      <QrCode className="h-10 w-10 text-slate-600" />
                    )}
                  </div>

                  <button
                    onClick={handleScanClassQR}
                    disabled={scannerScanning || gpsSimulatedDistance > 100}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xxs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    {scannerScanning ? 'Scanning camera...' : 'Simulate Scanning'}
                  </button>
                </div>
              )}

              {/* METHOD 3: FACE ID BIOMETRIC PUNCH */}
              {punchMode === 'PHOTO_VERIFY' && (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-2xl relative overflow-hidden border border-slate-800 flex items-center justify-center">
                    {isCameraActive ? (
                      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                    ) : capturedPhoto ? (
                      <img src={capturedPhoto} alt="Snapshot Verify" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6 bg-slate-950 absolute inset-0 flex flex-col items-center justify-center">
                        <Camera className="h-8 w-8 text-slate-700 mb-2" />
                        <p className="text-xxs text-slate-400 font-bold">BIOMETRIC SIMULATION ENVELOPE</p>
                        <p className="text-[9px] text-slate-600 max-w-xs mt-1">Locks within sandboxed browser frame container. Capturing triggers simulated AI face key evaluation.</p>
                      </div>
                    )}

                    {/* Scanner Reticle overlay */}
                    {isCameraActive && showFaceReticle && (
                      <div className="absolute inset-0 border-[3px] border-indigo-500/30 m-12 rounded-full flex items-center justify-center animate-pulse">
                        <div className="h-1 w-10 bg-indigo-400 absolute" />
                        <div className="h-10 w-1 bg-indigo-400 absolute" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center flex-wrap gap-2 text-xxs font-bold">
                    <div className="flex gap-2">
                      {isCameraActive ? (
                        <button onClick={capturePhoto} className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 cursor-pointer">
                          Capture retinal scan
                        </button>
                      ) : (
                        <button onClick={startCamera} className="px-4 py-1.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 cursor-pointer">
                          Re-open Camera
                        </button>
                      )}
                      
                      {isCameraActive && (
                        <button onClick={() => setShowFaceReticle(!showFaceReticle)} className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer">
                          Toggle Reticle
                        </button>
                      )}
                    </div>

                    {photoVerifiedScore && (
                      <span className="text-emerald-600 font-extrabold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 border border-emerald-100 rounded-lg">
                        ✓ Face Match {photoVerifiedScore}% Score
                      </span>
                    )}
                  </div>

                  {!isCameraActive && capturedPhoto && photoVerifiedScore && (
                    <button
                      onClick={() => submitCheckIn('Biometric_Face_ID')}
                      disabled={isActionLoading || gpsSimulatedDistance > 100}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Submit Face ID verification CheckIn</span>
                    </button>
                  )}
                </div>
              )}

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <div className="text-[10px] text-slate-400">
                  By checking in self, your device commits <b>GPS coordinates ({gpsSimulatedLat}, {gpsSimulatedLng})</b> and <b>Local System Clock timestamp</b> to avoid proxy punch tampering.
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 2. HISTORY CALENDAR GRID */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xxs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Personal Attendance Log Registers</span>
              </h3>
              <p className="text-xxs text-slate-400 mt-0.5">Visualize day-by-day punch schedules, late entry justifications, and download certified reports.</p>
            </div>

            <button
              onClick={handleExportPDFCard}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xxs font-bold rounded-xl shadow-xxs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Report Card PDF</span>
            </button>
          </div>

          {/* KEY PERFORMANCE INDICATORS BLOCKS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Compliance Rate</span>
              <p className="text-lg font-black text-slate-800 mt-1">{myStats.rate}%</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <span className="text-[9px] text-emerald-600 font-bold uppercase">Present Slots</span>
              <p className="text-lg font-black text-emerald-800 mt-1">{myStats.presents}</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl">
              <span className="text-[9px] text-amber-600 font-bold uppercase">Late Entries</span>
              <p className="text-lg font-black text-amber-800 mt-1">{myStats.lates}</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl">
              <span className="text-[9px] text-blue-600 font-bold uppercase">Approved Leaves</span>
              <p className="text-lg font-black text-blue-800 mt-1">{myStats.leavesCount}</p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl col-span-2 md:col-span-1">
              <span className="text-[9px] text-rose-600 font-bold uppercase">Unexcused Absents</span>
              <p className="text-lg font-black text-rose-800 mt-1">{myStats.absents}</p>
            </div>
          </div>

          {/* MONTH CALENDAR SELECTOR */}
          <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-150">
            <button
              onClick={() => setHistoryMonth(prev => Math.max(0, prev - 1))}
              disabled={historyMonth === 1} // Limit 4 months: Feb to June
              className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-600 cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {monthNames[historyMonth]} {historyYear}
            </span>

            <button
              onClick={() => setHistoryMonth(prev => Math.min(11, prev + 1))}
              disabled={historyMonth === 5} // Limit June
              className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-600 cursor-pointer disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* DAYS GRID */}
          <div className="grid grid-cols-7 gap-2.5 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <span key={day} className="text-[9px] font-black text-slate-400 uppercase tracking-wider py-1">{day}</span>
            ))}

            {calendarDays.map((dateObj, idx) => {
              if (!dateObj) {
                return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/10" />;
              }

              const dateString = dateObj.toISOString().split('T')[0];
              const rec = getDayRecord(dateString);
              const dayNum = dateObj.getDate();

              let statusColorClass = 'bg-white border-slate-200 text-slate-400';
              let badgeDot = 'bg-slate-300';
              
              if (rec) {
                if (rec.status === 'Present') {
                  statusColorClass = 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-xxs';
                  badgeDot = 'bg-emerald-500 animate-pulse';
                } else if (rec.status === 'Absent') {
                  statusColorClass = 'bg-rose-50 border-rose-200 text-rose-800';
                  badgeDot = 'bg-rose-500';
                } else if (rec.status === 'Late') {
                  statusColorClass = 'bg-amber-50 border-amber-200 text-amber-800';
                  badgeDot = 'bg-amber-500';
                } else if (rec.status === 'Leave') {
                  statusColorClass = 'bg-blue-50 border-blue-200 text-blue-800';
                  badgeDot = 'bg-blue-500';
                }
              }

              return (
                <div
                  key={dateString}
                  className={`aspect-square rounded-2xl border flex flex-col items-center justify-between p-1.5 transition-all relative group ${statusColorClass}`}
                >
                  <span className="text-[10px] font-extrabold">{dayNum}</span>
                  
                  {rec ? (
                    <div className="flex flex-col items-center">
                      <span className={`h-1.5 w-1.5 rounded-full ${badgeDot}`} />
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2 rounded-lg text-[9px] max-w-[140px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-10 space-y-0.5 leading-normal">
                        <p className="font-bold uppercase tracking-wider">{rec.status}</p>
                        {rec.arrivalTime && <p className="font-mono">Time: {rec.arrivalTime}</p>}
                        {rec.lateReason && <p className="italic text-slate-300">"{rec.lateReason}"</p>}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[8px] text-slate-300">-</span>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 3. LEAVE REQUESTS PANEL */}
      {activeTab === 'leave' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* COLUMN 1: APPLY FORM */}
          <div className="md:col-span-1">
            <form onSubmit={handleApplyLeaveSubmit} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xxs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileText className="h-4.5 w-4.5 text-indigo-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Leave Application</h4>
              </div>

              {leaveSuccess && (
                <p className="p-2 bg-emerald-50 text-emerald-800 text-[10px] border border-emerald-100 font-bold rounded">
                  {leaveSuccess}
                </p>
              )}

              <div className="space-y-3.5 text-xxs font-bold text-slate-600">
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-slate-400 font-black uppercase">Start Date</label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    required
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-slate-400 font-black uppercase">End Date</label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    required
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-slate-400 font-black uppercase">Reason for Leave Absence</label>
                  <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    required
                    rows={3}
                    placeholder="Provide medical certificate details or urgent travel reasoning."
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xxs focus:outline-hidden"
                  />
                </div>

                {/* Simulated file attachments */}
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-black uppercase">Attach Certificate Proof</label>
                  <div
                    onClick={() => setLeaveFileAttached(!leaveFileAttached)}
                    className={`p-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      leaveFileAttached ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800' : 'border-slate-200 hover:border-slate-300 text-slate-400'
                    }`}
                  >
                    <Download className="h-4.5 w-4.5 shrink-0" />
                    <span>{leaveFileAttached ? '✓ file_medical_cert.pdf linked' : 'Attach PDF Document'}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={leaveLoading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  {leaveLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>

          {/* COLUMN 2: MY LEAVE APPLICATIONS STATUS LIST */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xxs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ClipboardList className="h-4.5 w-4.5 text-indigo-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Leave Applications History</h4>
              </div>

              {myLeaves.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xxs">
                  <ClipboardList className="h-8 w-8 mx-auto opacity-20 mb-2" />
                  <p>No leave applications submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...myLeaves].reverse().map((leave) => (
                    <div key={leave.id} className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-xxs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] text-slate-400">ID: {leave.id}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold border text-[9px] ${
                          leave.status === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                          leave.status === 'Rejected' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                          'bg-amber-50 border-amber-100 text-amber-700'
                        }`}>
                          {leave.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">📅 Dates: {leave.startDate} to {leave.endDate}</p>
                        <p className="text-slate-600 italic mt-0.5">" {leave.reason} "</p>
                        {leave.comments && (
                          <div className="p-2 bg-white rounded-lg border border-slate-150 text-[10px] text-slate-600 mt-1">
                            <span className="font-bold text-slate-700">Admin Response:</span> {leave.comments}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
