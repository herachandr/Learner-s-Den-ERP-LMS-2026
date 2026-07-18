import React, { useState, useEffect } from 'react';
import { 
  UserCheck, QrCode, MapPin, Map, Clock, CreditCard, CheckCircle, 
  AlertCircle, Edit, Plus, Trash2, Check, Loader2, ShieldAlert, 
  IndianRupee, Sparkles, RefreshCw, Eye, Landmark, HelpCircle, Power, X,
  Camera, Navigation
} from 'lucide-react';
import { Teacher, TeacherAttendance, Batch } from '../types';

interface TeacherAttendancePayrollProps {
  teachers: Teacher[];
  batches: Batch[];
  attendanceLogs: TeacherAttendance[];
  currentRole: 'admin' | 'teacher';
  activeTeacherId?: string; // If logged in as a specific teacher
  onUpdateTeacherRates: (teacherId: string, rates: { basePay: number; hourlyRate: number; payoutType: 'Fixed' | 'Hourly' | 'Per-Session'; terminated?: boolean }) => Promise<void>;
  onPunchIn: (attendanceData: { teacherId: string; mode: 'QR' | 'PunchIn' | 'Location' | 'Geofence'; location?: { lat: number; lng: number }; verified: boolean }) => Promise<void>;
  onPunchOut: (attendanceId: string, hoursWorked: number) => Promise<void>;
  onApproveAttendance: (attendanceId: string, verified: boolean) => Promise<void>;
  onAddManualLog: (log: Omit<TeacherAttendance, 'id'>) => Promise<void>;
  onDeleteLog: (logId: string) => Promise<void>;
}

export default function TeacherAttendancePayroll({
  teachers,
  batches,
  attendanceLogs,
  currentRole,
  activeTeacherId = 'teacher-1', // Default to Prof Rajesh Patel for sandbox teacher view
  onUpdateTeacherRates,
  onPunchIn,
  onPunchOut,
  onApproveAttendance,
  onAddManualLog,
  onDeleteLog,
}: TeacherAttendancePayrollProps) {
  // Tabs for sub views
  const [activeTab, setActiveTab] = useState<'attendance' | 'payroll' | 'setup'>(
    currentRole === 'admin' ? 'attendance' : 'attendance'
  );

  // Punch in states
  const [punchMode, setPunchMode] = useState<'QR' | 'PunchIn' | 'Location' | 'Geofence' | 'QR_GEN' | 'PHOTO_VERIFY'>('PunchIn');
  const [punching, setPunching] = useState(false);
  const [punchSuccess, setPunchSuccess] = useState('');
  const [simulatedScanner, setSimulatedScanner] = useState(false);
  const [scanningCompleted, setScanningCompleted] = useState(false);
  const [shareLocationActive, setShareLocationActive] = useState(false);
  const [geofenceVerified, setGeofenceVerified] = useState<boolean | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Advanced Geofencing, QR Generator, and Photo Verification States for Teacher
  const [gpsDistance, setGpsDistance] = useState<number>(15); // default 15m (inside bounds)
  const [teacherQrExpiry, setTeacherQrExpiry] = useState<number>(45);
  const [teacherQrToken, setTeacherQrToken] = useState<string>('');
  const [teacherCapturedPhoto, setTeacherCapturedPhoto] = useState<string | null>(null);
  const [isTeacherCamActive, setIsTeacherCamActive] = useState(false);
  const [teacherFaceScore, setTeacherFaceScore] = useState<number | null>(null);
  const [showTeacherFaceReticle, setShowTeacherFaceReticle] = useState(true);
  const [teacherPhotoCoords, setTeacherPhotoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [teacherHistoryMonth, setTeacherHistoryMonth] = useState<number>(5); // default June (5)

  const teacherQrCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const teacherVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const teacherCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const teacherStreamRef = React.useRef<MediaStream | null>(null);

  // Synchronize teacher coordinates based on simulated distance
  const simulatedLat = Number((12.9716 + (gpsDistance / 1000) * 0.009 / 1.414).toFixed(6));
  const simulatedLng = Number((77.5946 + (gpsDistance / 1000) * 0.009 / 1.414).toFixed(6));
  const isGeofenceValid = gpsDistance <= 100;

  // Sync token count-down and rendering logic
  const regenerateTeacherQr = () => {
    const randomHex = Math.random().toString(16).substr(2, 6).toUpperCase();
    setTeacherQrToken(`DEN-CLASS-${activeTeacherId}-${new Date().toISOString().split('T')[0]}-${randomHex}`);
    setTeacherQrExpiry(45);
  };

  useEffect(() => {
    if (punchMode === 'QR_GEN') {
      regenerateTeacherQr();
    }
  }, [punchMode]);

  useEffect(() => {
    if (punchMode !== 'QR_GEN' || teacherQrExpiry <= 0) {
      if (teacherQrExpiry === 0) regenerateTeacherQr();
      return;
    }
    const interval = setInterval(() => {
      setTeacherQrExpiry(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [teacherQrExpiry, punchMode]);

  // Effect to draw QR code on canvas
  useEffect(() => {
    const canvas = teacherQrCanvasRef.current;
    if (canvas && punchMode === 'QR_GEN') {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);

        // draw matrix bits
        ctx.fillStyle = '#0f172a';
        
        const drawFinder = (x: number, y: number) => {
          ctx.fillRect(x, y, 40, 40);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 5, y + 5, 30, 30);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 10, y + 10, 20, 20);
        };

        drawFinder(10, 10);
        drawFinder(150, 10);
        drawFinder(10, 150);

        ctx.fillStyle = '#334155';
        for (let r = 0; r < 25; r++) {
          for (let c = 0; c < 25; c++) {
            if (r < 6 && c < 6) continue;
            if (r < 6 && c > 18) continue;
            if (r > 18 && c < 6) continue;
            
            const hash = Math.sin(r * 44.912 + c * 82.114) * 5821.11;
            const rand = hash - Math.floor(hash);
            if (rand > 0.45) {
              ctx.fillRect(10 + c * 7.2, 10 + r * 7.2, 5, 5);
            }
          }
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(80, 80, 40, 40);
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(85, 85, 30, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("DEN", 100, 104);
      }
    }
  }, [teacherQrToken, punchMode]);

  // Rate Editing states (Admin)
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editBasePay, setEditBasePay] = useState<number | ''>(0);
  const [editHourlyRate, setEditHourlyRate] = useState<number | ''>(0);
  const [editPayoutType, setEditPayoutType] = useState<'Fixed' | 'Hourly' | 'Per-Session'>('Hourly');

  // Manual Log form (Admin)
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTeacherId, setManualTeacherId] = useState(teachers[0]?.id || '');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTimeIn, setManualTimeIn] = useState('09:00:00');
  const [manualTimeOut, setManualTimeOut] = useState('17:00:00');
  const [manualHours, setManualHours] = useState('8');
  const [manualMode, setManualMode] = useState<'QR' | 'PunchIn' | 'Location' | 'Geofence'>('PunchIn');

  // Selected teacher filter in Admin view
  const [adminTeacherFilter, setAdminTeacherFilter] = useState('all');

  // Success notifications
  const [adminSuccess, setAdminSuccess] = useState('');

  // ----------------------------------------------------
  // CALCULATE PAYROLL STATISTICS
  // ----------------------------------------------------
  const calculateTeacherRemuneration = (teacher: Teacher) => {
    const logs = attendanceLogs.filter(log => log.teacherId === teacher.id && log.verified);
    const completedLogs = logs.filter(l => l.timeOut && l.hoursWorked !== undefined);
    
    let loggedUnits = 0;
    let computedRemuneration = 0;
    let description = '';

    if (teacher.payoutType === 'Fixed') {
      // Base salary plus an attendance incentive of hourlyRate * verified days
      const daysWorked = logs.length;
      loggedUnits = daysWorked;
      const incentive = daysWorked * 500; // ₹500 incentive per day present
      computedRemuneration = teacher.basePay + incentive;
      description = `Fixed Base: ₹${teacher.basePay.toLocaleString()} + Attendance Incentive (₹500/day for ${daysWorked} days)`;
    } else if (teacher.payoutType === 'Hourly') {
      // Hourly rate times total hours worked
      const totalHours = completedLogs.reduce((acc, log) => acc + (log.hoursWorked || 0), 0);
      loggedUnits = totalHours;
      computedRemuneration = totalHours * teacher.hourlyRate;
      description = `${totalHours.toFixed(1)} verified hours worked @ ₹${teacher.hourlyRate}/hour`;
    } else if (teacher.payoutType === 'Per-Session') {
      // Number of unique days / batch sessions logged times a flat session rate (hourlyRate acts as session rate)
      const sessions = logs.length;
      loggedUnits = sessions;
      computedRemuneration = sessions * teacher.hourlyRate;
      description = `${sessions} lecture sessions delivered @ ₹${teacher.hourlyRate}/session`;
    }

    return {
      loggedUnits,
      computedRemuneration,
      description,
      logsCount: logs.length,
      pendingOutLogs: logs.filter(l => !l.timeOut).length
    };
  };

  // Currently logged in teacher stats
  const activeTeacher = teachers.find(t => t.id === activeTeacherId) || teachers[0];
  const activeTeacherStats = activeTeacher ? calculateTeacherRemuneration(activeTeacher) : null;
  const activeTeacherLogs = attendanceLogs.filter(log => log.teacherId === activeTeacherId);
  const activeTeacherCheckedIn = activeTeacherLogs.find(log => !log.timeOut);

  // Biometric Camera methods for Faculty Selfie verification
  const startTeacherCamera = async () => {
    setIsTeacherCamActive(true);
    setTeacherCapturedPhoto(null);
    setTeacherFaceScore(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      teacherStreamRef.current = mediaStream;
      if (teacherVideoRef.current) {
        teacherVideoRef.current.srcObject = mediaStream;
        teacherVideoRef.current.play();
      }
    } catch (e) {
      console.warn("Camera blocked inside sandboxed frame. Falling back to dynamic matrix rendering.", e);
    }
  };

  const stopTeacherCamera = () => {
    if (teacherStreamRef.current) {
      teacherStreamRef.current.getTracks().forEach(t => t.stop());
      teacherStreamRef.current = null;
    }
    setIsTeacherCamActive(false);
  };

  const captureTeacherPhoto = () => {
    const canvas = teacherCanvasRef.current;
    const video = teacherVideoRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (video && teacherStreamRef.current) {
        ctx.drawImage(video, 0, 0, 640, 480);
      } else {
        // Sandboxed premium vector design fallback
        ctx.fillStyle = '#0f172a'; // Slate-900
        ctx.fillRect(0, 0, 640, 480);
        
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(50, 50, 540, 380);
        
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.beginPath();
        ctx.moveTo(320, 0); ctx.lineTo(320, 480);
        ctx.moveTo(0, 240); ctx.lineTo(640, 240);
        ctx.stroke();

        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath(); ctx.arc(320, 220, 100, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.moveTo(180, 440);
        ctx.lineTo(240, 320);
        ctx.lineTo(400, 320);
        ctx.lineTo(460, 440);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("FACULTY BIOMETRIC SECURE CAPTURE", 320, 100);
      }
      
      const dateStr = new Date().toLocaleString();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, 380, 640, 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`📍 GEOFENCE SECURE  : ${isGeofenceValid ? 'INSIDE' : 'OUTSIDE'} (${gpsDistance}m)`, 25, 410);
      ctx.fillText(`🕒 WATERMARK TIMELINE: ${dateStr}`, 25, 432);
      ctx.fillText(`🗺️ GPS COORDS LINK   : ${simulatedLat}° N, ${simulatedLng}° E`, 25, 454);
      
      const dataUri = canvas.toDataURL('image/jpeg', 0.85);
      setTeacherCapturedPhoto(dataUri);
      setTeacherPhotoCoords({ lat: simulatedLat, lng: simulatedLng });
      setTeacherFaceScore(Number((97.1 + Math.random() * 2.5).toFixed(1)));
      stopTeacherCamera();
    }
  };

  // ----------------------------------------------------
  // PUNCH IN / OUT SIMULATION LOGIC
  // ----------------------------------------------------
  const handleGPSDetect = () => {
    return new Promise<{ lat: number; lng: number }>((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: Number(pos.coords.latitude.toFixed(6)),
              lng: Number(pos.coords.longitude.toFixed(6))
            });
          },
          () => {
            // Fallback inside Campus
            resolve({ lat: 12.971600, lng: 77.594600 });
          }
        );
      } else {
        resolve({ lat: 12.971600, lng: 77.594600 });
      }
    });
  };

  const executePunchIn = async (mode: 'QR' | 'PunchIn' | 'Location' | 'Geofence', coords?: { lat: number; lng: number }, verifiedOverride = true) => {
    setPunching(true);
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];

      let loc = coords || null;
      let isVerified = verifiedOverride;

      // Geofence checking logic
      if (mode === 'Geofence') {
        const campusLat = 12.9716;
        const campusLng = 77.5946;
        const detectCoords = coords || await handleGPSDetect();
        loc = detectCoords;
        // Verify distance < ~100m. In coordinates, roughly 0.001 degrees.
        const diffLat = Math.abs(detectCoords.lat - campusLat);
        const diffLng = Math.abs(detectCoords.lng - campusLng);
        if (diffLat < 0.005 && diffLng < 0.005) {
          isVerified = true;
          setGeofenceVerified(true);
        } else {
          isVerified = false;
          setGeofenceVerified(false);
        }
      } else if (mode === 'Location') {
        loc = coords || await handleGPSDetect();
        isVerified = true;
      }

      await onPunchIn({
        teacherId: activeTeacherId,
        mode,
        location: loc || undefined,
        verified: isVerified,
      });

      setPunchSuccess(`Successfully Checked In (${mode}) at ${timeStr}! Welcome to your shift.`);
      setTimeout(() => setPunchSuccess(''), 6000);
    } catch (e) {
      console.error(e);
    } finally {
      setPunching(false);
    }
  };

  const handlePunchOut = async () => {
    if (!activeTeacherCheckedIn) return;
    setPunching(true);
    try {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      
      // Calculate elapsed hours since check-in
      const checkInParts = activeTeacherCheckedIn.timeIn.split(':').map(Number);
      const checkInDate = new Date();
      checkInDate.setHours(checkInParts[0], checkInParts[1], checkInParts[2] || 0);
      
      let elapsedMs = now.getTime() - checkInDate.getTime();
      if (elapsedMs < 0) elapsedMs = 4 * 60 * 60 * 1000; // Fallback to 4 hours if clock wraps or crosses midnight
      const hours = Number((elapsedMs / (1000 * 60 * 60)).toFixed(2));
      const finalizedHours = hours > 0.05 ? hours : 4.5; // default to a standard tutorial shift of 4.5 hrs for demo purposes if short

      await onPunchOut(activeTeacherCheckedIn.id, finalizedHours);
      setPunchSuccess(`Successfully Checked Out at ${timeStr}! Shift recorded: ${finalizedHours} hours.`);
      setTimeout(() => setPunchSuccess(''), 6000);
    } catch (e) {
      console.error(e);
    } finally {
      setPunching(false);
    }
  };

  const handleQRScannerTrigger = () => {
    setSimulatedScanner(true);
    setScanningCompleted(false);
    setTimeout(() => {
      setScanningCompleted(true);
      setTimeout(() => {
        setSimulatedScanner(false);
        executePunchIn('QR', { lat: 12.9716, lng: 77.5946 }, true);
      }, 1000);
    }, 2500);
  };

  const handleLocationTrigger = async () => {
    setShareLocationActive(true);
    const coords = await handleGPSDetect();
    setCurrentCoords(coords);
    setTimeout(() => {
      setShareLocationActive(false);
      executePunchIn('Location', coords, true);
    }, 1800);
  };

  const handleGeofenceTrigger = async () => {
    setShareLocationActive(true);
    const coords = await handleGPSDetect();
    setCurrentCoords(coords);
    setTimeout(() => {
      setShareLocationActive(false);
      executePunchIn('Geofence', coords, true);
    }, 1800);
  };

  // ----------------------------------------------------
  // ADMIN UPDATE & MANUAL LOG ACTIONS
  // ----------------------------------------------------
  const handleEditRates = (teacher: Teacher) => {
    setEditingTeacherId(teacher.id);
    setEditBasePay(teacher.basePay);
    setEditHourlyRate(teacher.hourlyRate);
    setEditPayoutType(teacher.payoutType);
  };

  const handleSaveRates = async (teacherId: string) => {
    try {
      await onUpdateTeacherRates(teacherId, {
        basePay: Number(editBasePay),
        hourlyRate: Number(editHourlyRate),
        payoutType: editPayoutType,
      });
      setEditingTeacherId(null);
      setAdminSuccess('Instructor remuneration configuration updated successfully!');
      setTimeout(() => setAdminSuccess(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAddManualLog({
        teacherId: manualTeacherId,
        date: manualDate,
        timeIn: manualTimeIn,
        timeOut: manualTimeOut || undefined,
        mode: manualMode,
        verified: true,
        hoursWorked: manualTimeOut ? Number(manualHours) : undefined,
      });
      setShowManualForm(false);
      setAdminSuccess('Manual check-in record successfully inserted into database ledger!');
      setTimeout(() => setAdminSuccess(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAttendanceLog = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this instructor attendance log?")) {
      await onDeleteLog(id);
      setAdminSuccess('Attendance entry removed.');
      setTimeout(() => setAdminSuccess(''), 4000);
    }
  };

  const handleVerifyLogToggle = async (log: TeacherAttendance) => {
    await onApproveAttendance(log.id, !log.verified);
    setAdminSuccess(`Entry ${log.verified ? 'unverified' : 'verified'} successfully.`);
    setTimeout(() => setAdminSuccess(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Tab selection */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {currentRole === 'admin' ? 'Attendance Logs & Check-ins' : 'My Attendance Portal'}
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'payroll'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {currentRole === 'admin' ? 'Dependent Payroll calculations' : 'My Payout Overview'}
        </button>
        {currentRole === 'admin' && (
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'setup'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Configure Remuneration parameters
          </button>
        )}
      </div>

      {adminSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xxs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>{adminSuccess}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ATTENDANCE LOGS / CHECK-IN INTERFACES                                  */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TEACHER CHECK-IN PANEL */}
          {currentRole === 'teacher' ? (
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xxs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Power className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Instructor Check-In</h3>
                  <p className="text-xxs text-slate-400">Mark attendance to log active teaching units.</p>
                </div>
              </div>

              {punchSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xxs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span>{punchSuccess}</span>
                </div>
              )}

              {/* Status display */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-2">
                <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Shift Status</span>
                {activeTeacherCheckedIn ? (
                  <>
                    <span className="px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full font-bold text-xxs flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      Currently Checked-In
                    </span>
                    <p className="text-xs font-bold text-slate-700 mt-1">Checked in at: {activeTeacherCheckedIn.timeIn} ({activeTeacherCheckedIn.mode})</p>
                    <p className="text-xxs text-slate-400">Date: {activeTeacherCheckedIn.date}</p>
                  </>
                ) : (
                  <>
                    <span className="px-3 py-1 bg-slate-250 border border-slate-300 text-slate-600 rounded-full font-bold text-xxs">
                      Off Duty / Checked-Out
                    </span>
                    <p className="text-xxs text-slate-400 mt-1">No active teaching shifts running.</p>
                  </>
                )}
              </div>

              {/* Check in modes selection */}
              {!activeTeacherCheckedIn ? (
                <div className="space-y-4">
                  {/* GPS Distance slider to simulate compliance */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5 text-slate-700">
                    <div className="flex justify-between items-center text-xxxxs font-bold uppercase tracking-wider text-slate-400">
                      <span>Simulated GPS Position</span>
                      <span className={isGeofenceValid ? 'text-emerald-600' : 'text-rose-600'}>
                        {gpsDistance}m ({isGeofenceValid ? 'Compliant' : 'Violation'})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="200"
                      value={gpsDistance}
                      onChange={(e) => setGpsDistance(Number(e.target.value))}
                      className="w-full accent-indigo-600 h-1 bg-slate-200 rounded appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                      <span>Coords:</span>
                      <span>{simulatedLat}° N, {simulatedLng}° E</span>
                    </div>

                    {!isGeofenceValid && (
                      <div className="p-1.5 bg-rose-50 border border-rose-100 rounded-md text-[9.5px] font-bold text-rose-800 flex items-center gap-1 mt-1 animate-pulse">
                        <ShieldAlert className="h-3 w-3 text-rose-500" />
                        <span>OUT OF CAMPUS RADIUS: Shifts Locked!</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Verification Mode</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPunchMode('PunchIn')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        punchMode === 'PunchIn'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UserCheck className="h-4 w-4 mx-auto mb-1 text-indigo-600" />
                      <span className="text-[10px] block">Manual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPunchMode('QR')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        punchMode === 'QR'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <QrCode className="h-4 w-4 mx-auto mb-1 text-amber-600" />
                      <span className="text-[10px] block">Scan Wall</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPunchMode('Location')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        punchMode === 'Location'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <MapPin className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
                      <span className="text-[10px] block">GPS Share</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPunchMode('Geofence')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        punchMode === 'Geofence'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Map className="h-4 w-4 mx-auto mb-1 text-rose-600" />
                      <span className="text-[10px] block">Geofence</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPunchMode('QR_GEN')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        punchMode === 'QR_GEN'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <QrCode className="h-4 w-4 mx-auto mb-1 text-indigo-600 animate-pulse" />
                      <span className="text-[10px] block">Class QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPunchMode('PHOTO_VERIFY')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        punchMode === 'PHOTO_VERIFY'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Camera className="h-4 w-4 mx-auto mb-1 text-teal-600" />
                      <span className="text-[10px] block">Bio-Verify</span>
                    </button>
                  </div>

                  {/* Mode specific descriptions and buttons */}
                  {punchMode === 'PunchIn' && (
                    <button
                      type="button"
                      onClick={() => executePunchIn('PunchIn')}
                      disabled={punching || !isGeofenceValid}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      {punching ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                      <span>Punch In Shift</span>
                    </button>
                  )}

                  {punchMode === 'QR' && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xxs text-slate-400">Position your camera to scan the wall mounted classroom QR Code beacon.</p>
                      <button
                        type="button"
                        onClick={handleQRScannerTrigger}
                        disabled={punching || simulatedScanner || !isGeofenceValid}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        {simulatedScanner ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                        <span>Scan Classroom QR Beacon</span>
                      </button>
                    </div>
                  )}

                  {punchMode === 'Location' && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xxs text-slate-400">Transmit your GPS telemetry coordinates to certify your physical presence on the campus map.</p>
                      <button
                        type="button"
                        onClick={handleLocationTrigger}
                        disabled={punching || shareLocationActive || !isGeofenceValid}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        {shareLocationActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                        <span>Transmit Live Location</span>
                      </button>
                    </div>
                  )}

                  {punchMode === 'Geofence' && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xxs text-slate-400">Checks if you are physically inside the 100m Learner's Den radius geofence.</p>
                      <button
                        type="button"
                        onClick={handleGeofenceTrigger}
                        disabled={punching || shareLocationActive || !isGeofenceValid}
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        {shareLocationActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />}
                        <span>Verify Geofence Bounds</span>
                      </button>
                      
                      {geofenceVerified !== null && (
                        <div className={`p-2.5 rounded-lg border text-xxs font-bold flex items-center gap-1.5 ${
                          geofenceVerified 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                            : 'bg-rose-50 border-rose-100 text-rose-800'
                        }`}>
                          {geofenceVerified ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                              <span>Vetted: Within Learner's Den campus block!</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="h-4 w-4 text-rose-500" />
                              <span>Denied: Campus GPS mismatch. Please try again.</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ADVANCED QR CODE GENERATOR FOR STUDENTS */}
                  {punchMode === 'QR_GEN' && (
                    <div className="flex flex-col items-center text-center space-y-3.5 pt-2 border-t border-slate-100">
                      <div className="relative p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                        <canvas ref={teacherQrCanvasRef} width="160" height="160" className="w-36 h-36 mx-auto" />
                        {!isGeofenceValid && (
                          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs flex flex-col items-center justify-center p-3">
                            <AlertCircle className="h-6 w-6 text-rose-500 mb-1" />
                            <p className="text-white text-[10px] font-bold uppercase">QR Pass Blocked</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-xxs font-mono text-slate-500 flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>Pulsing in <b className="text-indigo-600">{teacherQrExpiry}s</b></span>
                        </p>
                        <p className="text-[9px] font-mono text-slate-400 max-w-xs break-all bg-slate-50 p-1 rounded border border-slate-150">
                          {teacherQrToken}
                        </p>
                        <button
                          type="button"
                          onClick={() => executePunchIn('QR', { lat: simulatedLat, lng: simulatedLng }, true)}
                          disabled={!isGeofenceValid}
                          className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xxs rounded-lg shadow-xs transition-all"
                        >
                          Punch In with Session QR
                        </button>
                      </div>
                    </div>
                  )}

                  {/* BIOMETRIC SELFIE PHOTO VERIFICATION */}
                  {punchMode === 'PHOTO_VERIFY' && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      {isTeacherCamActive ? (
                        <div className="space-y-3">
                          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-900 flex items-center justify-center">
                            <video ref={teacherVideoRef} className="w-full h-full object-cover" playsInline muted />
                            
                            {showTeacherFaceReticle && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-32 h-32 border border-dashed border-teal-400 rounded-full animate-pulse flex items-center justify-center">
                                  <span className="text-[8px] font-mono font-bold bg-teal-950/80 text-teal-400 px-1 py-0.5 rounded">ALIGN</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={captureTeacherPhoto}
                            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xxs font-bold rounded-lg shadow-sm"
                          >
                            Capture Selfie Reference
                          </button>
                        </div>
                      ) : teacherCapturedPhoto ? (
                        <div className="space-y-2 text-center">
                          <img src={teacherCapturedPhoto} alt="Faculty selfie verify" className="w-full max-h-36 object-cover rounded-xl border border-slate-200" />
                          <p className="text-xxs font-mono text-slate-400">Biometric Similarity: <b className="text-teal-600 font-bold">{teacherFaceScore}% MATCH</b></p>
                          
                          <button
                            type="button"
                            onClick={() => executePunchIn('Location', { lat: simulatedLat, lng: simulatedLng }, true)}
                            disabled={!isGeofenceValid}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xxs rounded-lg shadow-sm"
                          >
                            Punch In via Face ID
                          </button>
                          <button
                            type="button"
                            onClick={startTeacherCamera}
                            className="text-xxxxs font-mono font-bold text-indigo-600 hover:underline block mx-auto"
                          >
                            Retake Biometric Snapshot
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                          <Camera className="h-8 w-8 text-slate-400 mx-auto" />
                          <p className="text-xxs text-slate-500 font-semibold leading-normal">Requires facial matching log to confirm shift. Coordinates will be hard watermarked.</p>
                          <button
                            type="button"
                            onClick={startTeacherCamera}
                            disabled={!isGeofenceValid}
                            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xxs font-bold rounded-lg shadow-sm"
                          >
                            Start Live Camera
                          </button>
                        </div>
                      )}
                      <canvas ref={teacherCanvasRef} width="640" height="480" className="hidden" />
                    </div>
                  )}

                </div>
              ) : (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePunchOut}
                    disabled={punching}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    {punching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                    <span>Punch Out Shift</span>
                  </button>
                  <p className="text-xxs text-slate-400 text-center mt-2">Checking out will compute elapsed hours and accumulate pay.</p>
                </div>
              )}

              {/* QR Scanner Overlay simulator */}
              {simulatedScanner && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 relative">
                  <div className="h-32 w-32 border-2 border-indigo-500 relative flex items-center justify-center overflow-hidden bg-slate-900 rounded-lg">
                    <QrCode className="h-16 w-16 text-slate-500" />
                    <div className="absolute inset-x-0 h-0.5 bg-indigo-500 animate-bounce top-1/2" />
                  </div>
                  <p className="text-xxs text-slate-300 font-bold">
                    {scanningCompleted ? '✓ Classroom Beacon Decoded' : 'Aligning camera with campus Wall QR...'}
                  </p>
                </div>
              )}

              {/* GPS loading simulator */}
              {shareLocationActive && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
                  <p className="text-xxs text-slate-300 font-bold">Contacting geo-stationary satellites...</p>
                  {currentCoords && (
                    <p className="text-xxxxs font-mono text-emerald-400">Lat: {currentCoords.lat}, Lng: {currentCoords.lng}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            // ADMIN CONTROLS IN ATTENDANCE TAB
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xxs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Attendance Admin</h3>
                  <p className="text-xxs text-slate-400">Manage instructor attendance records.</p>
                </div>
                <button
                  onClick={() => setShowManualForm(!showManualForm)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 border border-indigo-150 rounded-xl text-indigo-700 font-bold text-xxs hover:bg-indigo-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Insert Log</span>
                </button>
              </div>

              {/* Teacher selector filter */}
              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Filter Instructor</label>
                <select
                  value={adminTeacherFilter}
                  onChange={(e) => setAdminTeacherFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold"
                >
                  <option value="all">All Instructors ({teachers.length})</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Manual insert log form */}
              {showManualForm && (
                <form onSubmit={handleAddManualAttendance} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5 text-xs font-semibold animate-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                    <span className="text-xxs text-slate-400 uppercase font-bold">Manual Attendance Entry</span>
                    <button type="button" onClick={() => setShowManualForm(false)} className="text-slate-400 hover:text-slate-600"><X className="h-3 w-3" /></button>
                  </div>
                  
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Select Teacher</label>
                    <select
                      value={manualTeacherId}
                      onChange={(e) => setManualTeacherId(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xxs font-medium bg-white"
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xxs"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Mode</label>
                      <select
                        value={manualMode}
                        onChange={(e: any) => setManualMode(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xxs bg-white"
                      >
                        <option value="PunchIn">PunchIn</option>
                        <option value="QR">QR Scan</option>
                        <option value="Location">GPS Share</option>
                        <option value="Geofence">Geofence</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Time In</label>
                      <input
                        type="text"
                        placeholder="HH:MM:SS"
                        required
                        value={manualTimeIn}
                        onChange={(e) => setManualTimeIn(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xxs"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Time Out</label>
                      <input
                        type="text"
                        placeholder="HH:MM:SS"
                        value={manualTimeOut}
                        onChange={(e) => setManualTimeOut(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xxs"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        required={!!manualTimeOut}
                        value={manualHours}
                        onChange={(e) => setManualHours(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xxs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xxs rounded-lg mt-2"
                  >
                    Save Entry
                  </button>
                </form>
              )}

              {/* Sandbox Quick Tip */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-extrabold text-slate-700 text-xxs flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Remuneration Trigger
                </span>
                <p className="text-slate-500 text-xxs leading-relaxed font-medium">
                  Instructor payouts are automatically tied to these verified attendance sheets. Hourly teachers accumulate pay per hour checked, and Per-Session teachers accumulate pay per roll-call.
                </p>
              </div>
            </div>
          )}

          {/* ATTENDANCE HISTORY LIST / TABLE */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">
                {currentRole === 'admin' ? 'Database Check-in Register' : 'My Check-in Log History'}
              </h3>
              
              {/* 4-Month History Month Selector */}
              <select
                value={teacherHistoryMonth}
                onChange={(e) => setTeacherHistoryMonth(Number(e.target.value))}
                className="text-xxs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={-1}>All Months</option>
                <option value={5}>June 2026</option>
                <option value={4}>May 2026</option>
                <option value={3}>April 2026</option>
                <option value={2}>March 2026</option>
                <option value={1}>February 2026</option>
              </select>
            </div>

            {/* Filtered records */}
            {(() => {
              let records = currentRole === 'admin'
                ? (adminTeacherFilter === 'all' 
                    ? attendanceLogs 
                    : attendanceLogs.filter(log => log.teacherId === adminTeacherFilter))
                : activeTeacherLogs;

              // Filter by month if selected
              if (teacherHistoryMonth !== -1) {
                const monthStr = (teacherHistoryMonth + 1) < 10 ? `0${teacherHistoryMonth + 1}` : `${teacherHistoryMonth + 1}`;
                const prefix = `2026-${monthStr}`;
                records = records.filter(log => log.date.startsWith(prefix));
              }

              if (records.length === 0) {
                return (
                  <div className="p-12 text-center text-slate-400">
                    <Clock className="h-10 w-10 mx-auto opacity-30 mb-2" />
                    <p className="text-xs font-semibold">No attendance sessions logged for this month.</p>
                    <p className="text-xxs mt-1 text-slate-400">Mark check-in or choose another month to view historical entries.</p>
                  </div>
                );
              }

              // Calculate mini statistics for the current filtered view
              const approvedCount = records.filter(r => r.verified).length;
              const pendingCount = records.filter(r => !r.verified).length;
              const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);

              return (
                <div className="space-y-4 mt-4">
                  {/* Mini summary metrics header */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Approved Logs</span>
                      <span className="text-xs font-black text-emerald-600">{approvedCount} entries</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Unapproved Logs</span>
                      <span className="text-xs font-black text-amber-500">{pendingCount} entries</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Total Hours Logged</span>
                      <span className="text-xs font-black text-indigo-600">{totalHours.toFixed(1)} hrs</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xxs uppercase font-bold">
                        <th className="px-4 py-3">Date / Instructor</th>
                        <th className="px-4 py-3">Timing In/Out</th>
                        <th className="px-4 py-3">Verification Mode</th>
                        <th className="px-4 py-3">Duration Logged</th>
                        <th className="px-4 py-3 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                      {records.slice().reverse().map((log) => {
                        const tInfo = teachers.find(t => t.id === log.teacherId);
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-4 py-3.5">
                              <div>
                                <p className="font-bold text-slate-800">{log.date}</p>
                                {currentRole === 'admin' && (
                                  <p className="text-xxs text-slate-400 mt-0.5">{tInfo?.name || log.teacherId}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-mono text-xxs text-slate-700">
                                <span>{log.timeIn}</span>
                                <span className="mx-1 text-slate-400">→</span>
                                <span>{log.timeOut || 'Active'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xxxxs font-bold uppercase tracking-wider border ${
                                log.mode === 'QR' 
                                  ? 'bg-amber-50 border-amber-100 text-amber-700' 
                                  : log.mode === 'Geofence'
                                  ? 'bg-rose-50 border-rose-100 text-rose-700'
                                  : log.mode === 'Location'
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                  : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                              }`}>
                                {log.mode}
                              </span>
                              {log.location && (
                                <p className="text-xxxxs text-slate-400 font-mono mt-0.5">{log.location.lat.toFixed(4)}, {log.location.lng.toFixed(4)}</p>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="text-xxs font-bold text-slate-800">
                                {log.hoursWorked !== undefined ? `${log.hoursWorked} hrs` : <span className="text-indigo-600 animate-pulse">Running...</span>}
                              </p>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {currentRole === 'admin' ? (
                                  <>
                                    <button
                                      onClick={() => handleVerifyLogToggle(log)}
                                      className={`px-2 py-0.5 text-xxxxs font-extrabold rounded-md border uppercase tracking-wider ${
                                        log.verified 
                                          ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
                                          : 'bg-amber-50 border-amber-150 text-amber-800'
                                      }`}
                                      title="Toggle Verification"
                                    >
                                      {log.verified ? '✓ Verified' : '⚠ Unverified'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAttendanceLog(log.id)}
                                      className="p-1 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-600"
                                      title="Delete entry"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </>
                                ) : (
                                  <span className={`text-xxs font-bold ${log.verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {log.verified ? '✓ Log Vetted' : '⚠ Vetting Pending'}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REMUNERATION / PAYROLL TAB VIEW                                       */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          
          {/* STATS OVERVIEW FOR CURRENT ACTIVE VIEW */}
          {currentRole === 'teacher' ? (
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xxs font-bold uppercase tracking-wider text-slate-400">My Remuneration Estimate</p>
                  <h3 className="text-xl font-extrabold text-white mt-1">Instructor Payout Statement</h3>
                </div>
                <div className="h-10 w-10 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-indigo-400" />
                </div>
              </div>

              {activeTeacherStats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                    <p className="text-xxs text-slate-400 font-bold uppercase tracking-wider">Estimated Pay</p>
                    <h4 className="text-2xl font-black text-emerald-400 mt-1">₹{activeTeacherStats.computedRemuneration.toLocaleString()}</h4>
                    <p className="text-xxxxs text-slate-500 font-medium mt-0.5">Subject to vetting and approval</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                    <p className="text-xxs text-slate-400 font-bold uppercase tracking-wider">Payroll Parameter</p>
                    <h4 className="text-sm font-bold text-slate-200 mt-2 capitalize">{activeTeacher.payoutType} structure</h4>
                    <p className="text-xxxxs text-slate-500 font-medium mt-0.5">
                      {activeTeacher.payoutType === 'Fixed' && `Base ₹${activeTeacher.basePay}/mo`}
                      {activeTeacher.payoutType === 'Hourly' && `Rate ₹${activeTeacher.hourlyRate}/hour`}
                      {activeTeacher.payoutType === 'Per-Session' && `Rate ₹${activeTeacher.hourlyRate}/session`}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                    <p className="text-xxs text-slate-400 font-bold uppercase tracking-wider">Verified Units logged</p>
                    <h4 className="text-xl font-bold text-slate-200 mt-1">
                      {activeTeacher.payoutType === 'Fixed' && `${activeTeacherStats.loggedUnits} Working Days`}
                      {activeTeacher.payoutType === 'Hourly' && `${activeTeacherStats.loggedUnits.toFixed(1)} Clocked Hours`}
                      {activeTeacher.payoutType === 'Per-Session' && `${activeTeacherStats.loggedUnits} Lectured Sessions`}
                    </h4>
                    <p className="text-xxxxs text-slate-500 font-medium mt-1">From {activeTeacherStats.logsCount} check-ins</p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xxs text-slate-400 font-medium flex items-start gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-slate-300">Statement Details:</span> {activeTeacherStats?.description}
                </div>
              </div>
            </div>
          ) : (
            // ADMIN LEDGER FOR REMUNERATION CALCULATIONS
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Dependent Payroll Calculation Ledger</h3>
                  <p className="text-xxs text-slate-400">Real-time attendance-dependent wage computation across the academic faculty.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xxs font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-md">
                    Live Database Linked
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xxs uppercase font-bold">
                      <th className="px-4 py-3">Instructor Faculty</th>
                      <th className="px-4 py-3">Remuneration Parameter</th>
                      <th className="px-4 py-3">Logged Units</th>
                      <th className="px-4 py-3 text-right">Computed Pay (INR)</th>
                      <th className="px-4 py-3 text-right">Payment Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                    {teachers.map((t) => {
                      const payroll = calculateTeacherRemuneration(t);
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-extrabold text-slate-800">{t.name}</p>
                              <p className="text-xxs text-slate-400 font-medium mt-0.5">{t.subject} specialist</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xxxxs font-bold uppercase tracking-wider">
                                {t.payoutType} Wage
                              </span>
                              <p className="text-xxs font-mono text-slate-500 mt-1">
                                {t.payoutType === 'Fixed' && `₹${t.basePay.toLocaleString()} / month`}
                                {t.payoutType === 'Hourly' && `₹${t.hourlyRate} / clock-hour`}
                                {t.payoutType === 'Per-Session' && `₹${t.hourlyRate} / teaching-session`}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-bold text-slate-800">
                                {t.payoutType === 'Fixed' && `${payroll.loggedUnits} Present Days`}
                                {t.payoutType === 'Hourly' && `${payroll.loggedUnits.toFixed(1)} Clocked Hours`}
                                {t.payoutType === 'Per-Session' && `${payroll.loggedUnits} Lectured Sessions`}
                              </p>
                              <p className="text-xxs text-slate-400 font-medium mt-0.5">from {payroll.logsCount} verified sessions</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-black text-slate-800">₹{payroll.computedRemuneration.toLocaleString()}</span>
                            <p className="text-xxxxs text-slate-400 font-mono mt-0.5">inclusive of incentives</p>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => alert(`Remuneration of ₹${payroll.computedRemuneration.toLocaleString()} successfully disbursed to ${t.name} via corporate bank API.`)}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xxs rounded-xl shadow-xxs transition-all"
                            >
                              Disburse Pay
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONFIGURE TEACHER PAYROLL REMUNERATION PARAMETERS                     */}
      {/* ========================================================================= */}
      {activeTab === 'setup' && currentRole === 'admin' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm">Remuneration Parameter Configuration</h3>
            <p className="text-xxs text-slate-400">Configure base salary limits and contract parameters for offline instructors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teachers.map((t) => {
              const isEditing = editingTeacherId === t.id;
              return (
                <div key={t.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{t.name}</h4>
                      <p className="text-xxs text-slate-400 font-semibold">{t.subject} Specialist | Code: {t.id}</p>
                      <div className="mt-1">
                        {t.terminated ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-[8px] uppercase tracking-wider animate-pulse">
                            ● Service Terminated
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-[8px] uppercase tracking-wider">
                            ● Active Instructor
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to ${t.terminated ? 're-activate' : 'terminate'} service for ${t.name}?`)) {
                            await onUpdateTeacherRates(t.id, {
                              basePay: t.basePay,
                              hourlyRate: t.hourlyRate,
                              payoutType: t.payoutType,
                              terminated: !t.terminated
                            });
                          }
                        }}
                        className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                          t.terminated 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title={t.terminated ? "Re-activate Service" : "Terminate Service"}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </button>
                      {!isEditing && (
                        <button
                          onClick={() => handleEditRates(t)}
                          className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 cursor-pointer border border-slate-200"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3.5 text-xs font-semibold">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">Contract Type</label>
                          <select
                            value={editPayoutType}
                            onChange={(e: any) => setEditPayoutType(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                          >
                            <option value="Fixed">Fixed salary</option>
                            <option value="Hourly">Hourly rate</option>
                            <option value="Per-Session">Per-Session fee</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">Base Salary (₹/Mo)</label>
                          <input
                            type="number"
                            value={editBasePay}
                            onChange={(e) => setEditBasePay(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {editPayoutType === 'Hourly' ? 'Hourly rate (₹)' : editPayoutType === 'Per-Session' ? 'Per-Session fee (₹)' : 'Daily Incentive multiplier (₹)'}
                        </label>
                        <input
                          type="number"
                          value={editHourlyRate}
                          onChange={(e) => setEditHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingTeacherId(null)}
                          className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xxs text-slate-600 font-bold hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveRates(t.id)}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xxs font-bold rounded-lg"
                        >
                          Save Config
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 text-center text-xxs font-bold">
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                        <span className="text-slate-400 block uppercase font-bold text-xxxxs tracking-wider mb-0.5">Contract Type</span>
                        <span className="text-slate-800">{t.payoutType}</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                        <span className="text-slate-400 block uppercase font-bold text-xxxxs tracking-wider mb-0.5">Base Pay</span>
                        <span className="text-slate-800">₹{t.basePay.toLocaleString()}</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                        <span className="text-slate-400 block uppercase font-bold text-xxxxs tracking-wider mb-0.5">Unit Rate</span>
                        <span className="text-slate-800">₹{t.hourlyRate.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
