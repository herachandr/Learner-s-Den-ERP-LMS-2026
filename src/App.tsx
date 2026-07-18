import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Wallet,
  BrainCircuit,
  Settings,
  CloudLightning,
  Loader2,
  FileText,
  Clock,
  LayoutDashboard,
  CheckCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  IndianRupee,
  Smartphone,
  Megaphone,
  Trash2,
  Edit,
  Bell,
  Pin,
  Compass,
  LayoutGrid,
  Home,
  Bus,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CreditCard,
  Check,
  Power,
  Info,
  Image as ImageIcon,
  MoreHorizontal,
  Menu,
  XCircle,
  AlertCircle,
  EyeOff,
  MessageSquare,
  Heart,
  Camera,
  UploadCloud,
  ShieldAlert,
  X,
  ArrowLeft
} from 'lucide-react';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import Login from './components/Login';

// Suspense utility for lazy loaded chunks (Code Splitting & Bundle Size Optimization)
const withSuspense = (LazyComponent: React.ComponentType<any>) => {
  return (props: any) => (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center p-12 min-h-[350px] space-y-4 bg-white border border-slate-100 rounded-3xl animate-pulse">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">Loading Educational Core Module...</span>
      </div>
    }>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

const StudentManager = withSuspense(React.lazy(() => import('./components/StudentManager')));
const CourseBatchManager = withSuspense(React.lazy(() => import('./components/CourseBatchManager')));
const LMSCenter = withSuspense(React.lazy(() => import('./components/LMSCenter')));
const DigitalLibrary = withSuspense(React.lazy(() => import('./components/DigitalLibrary')));
const QuizRunner = withSuspense(React.lazy(() => import('./components/QuizRunner')));
const ExaminationSystem = withSuspense(React.lazy(() => import('./components/ExaminationSystem')));
const AICoach = withSuspense(React.lazy(() => import('./components/AICoach')));
const FeesManager = withSuspense(React.lazy(() => import('./components/FeesManager')));
const StudentPayment = withSuspense(React.lazy(() => import('./components/StudentPayment')));
const AttendanceManager = withSuspense(React.lazy(() => import('./components/AttendanceManager')));
const TeacherAttendancePayroll = withSuspense(React.lazy(() => import('./components/TeacherAttendancePayroll')));
const StudentAttendance = withSuspense(React.lazy(() => import('./components/StudentAttendance')));
const MultiPlatformHub = withSuspense(React.lazy(() => import('./components/MultiPlatformHub')));
const CommunicationCentre = withSuspense(React.lazy(() => import('./components/CommunicationCentre')));
const PerformanceAnalytics = withSuspense(React.lazy(() => import('./components/PerformanceAnalytics')));
const BatchPerformanceChart = withSuspense(React.lazy(() => import('./components/BatchPerformanceChart')));
const AcademicCalendar = withSuspense(React.lazy(() => import('./components/AcademicCalendar')));
const CareerPathfinder = withSuspense(React.lazy(() => import('./components/CareerPathfinder')));
const ErpModulesHub = withSuspense(React.lazy(() => import('./components/ErpModulesHub')));
const InstitutionDetails = withSuspense(React.lazy(() => import('./components/InstitutionDetails')));
const InstitutionGallery = withSuspense(React.lazy(() => import('./components/InstitutionGallery')));
const ParentMonitor = withSuspense(React.lazy(() => import('./components/ParentMonitor')));
const JobApplication = withSuspense(React.lazy(() => import('./components/JobApplication')));
import HighlightBoard from './components/HighlightBoard';
import DailyRemarksStrip from './components/DailyRemarksStrip';
const AnonymousFeedbackDesk = withSuspense(React.lazy(() => import('./components/AnonymousFeedbackDesk')));
const LecturerEvaluationDesk = withSuspense(React.lazy(() => import('./components/LecturerEvaluationDesk')));
const UserTestimonials = withSuspense(React.lazy(() => import('./components/UserTestimonials')));
const AlumniPortal = withSuspense(React.lazy(() => import('./components/AlumniPortal')));
const SettingsManager = withSuspense(React.lazy(() => import('./components/SettingsManager')));
import { Course, Batch, Student, Teacher, TeacherAttendance, Attendance, LeaveApplication, Material, Quiz, Grade, FeeReceipt, DashboardStats, UserRole, AppUser, Notice, Testimonial, AnonymousFeedback, GalleryItem, LecturerEvaluation, PaymentSettings, InstitutionProfile } from './types';

const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
    }
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
    }
  }
};

// Global fetch interceptor to inject Authorization Bearer token automatically on all API requests
if (typeof window !== 'undefined') {
  try {
    const originalFetch = window.fetch;
    const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : (input as Request).url;
      let isApi = false;
      try {
        const parsedUrl = new URL(url, window.location.origin);
        isApi = parsedUrl.pathname.startsWith('/api/');
      } catch (err) {
        isApi = url.startsWith('/api/') || url.includes('/api/');
      }

      // Intercept only backend /api/ requests
      if (isApi) {
        init = init || {};
        
        // Clone init to avoid mutating shared state unexpectedly
        const clonedInit = { ...init };
        const originalHeaders = clonedInit.headers || {};
        
        let headers: Record<string, string> = {};
        if (originalHeaders instanceof Headers) {
          originalHeaders.forEach((value, key) => {
            headers[key] = value;
          });
        } else if (Array.isArray(originalHeaders)) {
          originalHeaders.forEach(([key, value]) => {
            headers[key] = value;
          });
        } else {
          headers = { ...originalHeaders } as Record<string, string>;
        }
        
        try {
          let token = (window as any).erp_current_user_token;
          if (!token) {
            const stored = window.localStorage.getItem('erp_current_user');
            if (stored) {
              const user = JSON.parse(stored);
              if (user && user.token) {
                token = user.token;
              }
            }
          }
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        } catch (e) {
          console.warn('Error adding authorization header to fetch:', e);
        }
        
        clonedInit.headers = headers;
        return originalFetch(input, clonedInit);
      }
      return originalFetch(input, init);
    };

    try {
      Object.defineProperty(window, 'fetch', {
        value: customFetch,
        configurable: true,
        writable: true,
        enumerable: true
      });
    } catch (definePropertyError) {
      (window as any).fetch = customFetch;
    }
  } catch (err) {
    console.warn('Unable to globally intercept window.fetch:', err);
  }
}

const parseHashRoute = (): { tab: string | null; module: string | null } => {
  try {
    const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
    if (!hash || hash === '#') {
      return { tab: null, module: null };
    }
    const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
    const [tabPart, queryPart] = cleanHash.split('?');
    const tab = tabPart || null;
    let module: string | null = null;
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      module = params.get('module');
    }
    return { tab, module };
  } catch (err) {
    console.warn('Error parsing hash route:', err);
    return { tab: null, module: null };
  }
};

const updateHashRoute = (tab: string, module: string | null) => {
  try {
    if (typeof window === 'undefined') return;
    let newHash = `#${tab}`;
    if (module) {
      newHash += `?module=${module}`;
    }
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  } catch (err) {
    console.warn('Error updating hash route:', err);
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const stored = safeLocalStorage.getItem('erp_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const stored = safeLocalStorage.getItem('erp_current_user');
      if (stored) {
        const u = JSON.parse(stored);
        return u.role;
      }
    } catch {}
    return 'admin';
  });

  const [currentTabVal, setRawTab] = useState<string>(() => {
    try {
      const parsed = parseHashRoute();
      if (parsed.tab) return parsed.tab;

      const stored = safeLocalStorage.getItem('erp_current_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === 'admin') return 'erp-suite';
      }
    } catch {}
    return 'dashboard';
  });

  const [activeModuleVal, setRawActiveModule] = useState<string | null>(() => {
    try {
      const parsed = parseHashRoute();
      if (parsed.module) return parsed.module;
    } catch {}
    return null;
  });

  const currentTab = currentTabVal;
  const activeModule = activeModuleVal;

  const [navHistory, setNavHistory] = useState<{ tab: string; module: string | null }[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).erp_current_user_token = currentUser?.token || '';
    }
  }, [currentUser]);

  const isHomePage = () => {
    if (currentRole === 'admin') {
      return currentTabVal === 'erp-suite' && activeModuleVal === null;
    }
    if (currentRole === 'parent') {
      return currentTabVal === 'parent-monitor';
    }
    if (currentRole === 'job_seeker') {
      return currentTabVal === 'job-application';
    }
    if (currentRole === 'student' && !isApprovedStudent) {
      return currentTabVal === 'institution-details';
    }
    return currentTabVal === 'dashboard';
  };

  const setCurrentTab = (tab: string) => {
    const prevTab = currentTabVal;
    const prevMod = activeModuleVal;
    if (prevTab !== tab) {
      setNavHistory(prev => {
        const last = prev[prev.length - 1];
        if (last && last.tab === prevTab && last.module === prevMod) {
          return prev;
        }
        return [...prev, { tab: prevTab, module: prevMod }];
      });
    }
    setRawTab(tab);
    if (tab !== 'erp-suite') {
      setRawActiveModule(null);
      updateHashRoute(tab, null);
    } else {
      updateHashRoute(tab, activeModuleVal);
    }
  };

  const setActiveModule = (mod: string | null) => {
    const prevTab = currentTabVal;
    const prevMod = activeModuleVal;
    if (prevMod !== mod) {
      setNavHistory(prev => {
        const last = prev[prev.length - 1];
        if (last && last.tab === prevTab && last.module === prevMod) {
          return prev;
        }
        return [...prev, { tab: prevTab, module: prevMod }];
      });
    }
    setRawActiveModule(mod);
    updateHashRoute(currentTabVal, mod);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHashRoute();
      if (parsed.tab && parsed.tab !== currentTabVal) {
        setRawTab(parsed.tab);
      }
      if (parsed.module !== activeModuleVal) {
        setRawActiveModule(parsed.module);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    // Sync initial state back to hash URL if it's currently empty
    if (!window.location.hash) {
      updateHashRoute(currentTabVal, activeModuleVal);
    }
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [currentTabVal, activeModuleVal]);

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [hasExited, setHasExited] = useState(false);

  // Background Version Checking & PWA Update Detection (Production-Ready)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [newlyDetectedVersion, setNewlyDetectedVersion] = useState('');
  const [newlyDetectedEnv, setNewlyDetectedEnv] = useState('Staging');

  const checkForUpdates = async () => {
    try {
      const isAutoUpdateEnabled = localStorage.getItem('app_auto_update_enabled') !== 'false';
      if (!isAutoUpdateEnabled) return;

      const res = await fetch('/api/version');
      if (!res.ok) return;
      const data = await res.json();

      // Store latest detected version to display in About or trigger modal
      localStorage.setItem('app_cloud_latest_version', data.version);
      localStorage.setItem('app_cloud_latest_build', data.buildTime);
      localStorage.setItem('app_cloud_latest_env', data.env);

      const currentVersion = localStorage.getItem('app_current_version') || '1.1.2';
      if (data.version !== currentVersion) {
        setNewlyDetectedVersion(data.version);
        setNewlyDetectedEnv(data.env);
        setIsUpdateAvailable(true);
        localStorage.setItem('app_mismatch_detected_version', data.version);
      }
      return data;
    } catch (err) {
      // Handle fetch failure gracefully (e.g. offline mode or server rebooting)
      console.warn('Unable to poll /api/version (running in offline or container reboot state):', err instanceof Error ? err.message : err);
    }
  };

  useEffect(() => {
    // 1. Initialize version metadata in storage if empty
    if (!localStorage.getItem('app_current_version')) {
      localStorage.setItem('app_current_version', '1.1.2');
    }
    if (!localStorage.getItem('app_build_time')) {
      localStorage.setItem('app_build_time', '2026-07-14 12:30');
    }
    if (!localStorage.getItem('app_environment')) {
      localStorage.setItem('app_environment', 'Staging');
    }
    if (!localStorage.getItem('app_cloud_latest_version')) {
      localStorage.setItem('app_cloud_latest_version', '1.1.2');
    }

    // Trigger update check on app start
    checkForUpdates();

    // 2. Tab becomes active again update check
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Dynamic periodic polling based on server-configured interval
    let pollInterval: NodeJS.Timeout;
    const setupPeriodicPolling = async () => {
      const serverMeta = await checkForUpdates();
      const isStaging = (serverMeta && serverMeta.env === 'Staging') || (localStorage.getItem('app_environment') === 'Staging');
      
      // Default fast interval for staging (4 seconds), slow for production (5 minutes = 300000ms)
      let intervalMs = isStaging ? 4000 : 300000;
      
      // If server returned a configured interval, use that
      if (serverMeta && serverMeta.updatePollingInterval) {
        intervalMs = Number(serverMeta.updatePollingInterval);
      } else {
        const localConfig = localStorage.getItem('app_polling_interval');
        if (localConfig) intervalMs = Number(localConfig);
      }

      pollInterval = setInterval(() => {
        checkForUpdates();
      }, intervalMs);
    };

    setupPeriodicPolling();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // 4. Update check when user signs in (currentUser changes from null to a valid user)
  useEffect(() => {
    if (currentUser) {
      checkForUpdates();
    }
  }, [currentUser]);

  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Mobile drawer swipe gesture states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    if (isLeftSwipe) {
      setIsMobileDrawerOpen(false);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobileDrawerOpen]);

  const handleLogout = () => {
    safeLocalStorage.removeItem('erp_current_user');
    setCurrentUser(null);
    setCurrentRole('admin');
    setCurrentTab('dashboard');
    setActiveQuiz(null);
  };

  const handleSeedDatabase = async () => {
    if (checkOfflineAction('Seed Database')) return;
    setLoading(true);
    try {
      const response = await fetch('/api/db/seed', { method: 'POST' });
      if (response.ok) {
        await fetchData();
        triggerSimulatedNotification('Database populated with standard 4-month academic history successfully!', 'System Synced');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    if (checkOfflineAction('Clear Database')) return;
    if (!confirm('Are you sure you want to delete all students, teachers, classes, logs, and grades? This will reset the database.')) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/db/clear', { method: 'POST' });
      if (response.ok) {
        await fetchData();
        triggerSimulatedNotification('Database completely reset. All dynamic collections are blank.', 'Database Reset');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetStats = async () => {
    if (checkOfflineAction('Reset Statistics')) return;
    if (!confirm('Are you sure you want to reset all academic performance analytics, fee payments, and attendance records? This preserves student & teacher rosters.')) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/db/reset-stats', { method: 'POST' });
      if (response.ok) {
        await fetchData();
        triggerSimulatedNotification('All statistics, check-in logs, and payments reset to initial values.', 'Stats Reset');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendance[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [fees, setFees] = useState<FeeReceipt[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    upiId: 'learnersden@okaxis',
    merchantName: "Learner's Den",
    instructions: "Scan the QR code below or pay directly to the UPI ID above. Please enter the generated transaction ID to complete your fee collection.",
    customQrUrl: ''
  });
  const [notices, setNotices] = useState<Notice[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [anonymousFeedback, setAnonymousFeedback] = useState<AnonymousFeedback[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [institutionProfile, setInstitutionProfile] = useState<InstitutionProfile | null>(null);
  const [linkedWardIds, setLinkedWardIds] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('linked_ward_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('linked_ward_ids', JSON.stringify(linkedWardIds));
      }
    } catch {}
  }, [linkedWardIds]);

  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [lecturerEvaluations, setLecturerEvaluations] = useState<LecturerEvaluation[]>([]);

  // Parent Search Form State
  const [parentSearchId, setParentSearchId] = useState('');
  const [parentSearchContact, setParentSearchContact] = useState('');

  // Job Seeker Form State
  const [jobForm, setJobForm] = useState({ name: '', email: '', phone: '', subject: 'Calculus', education: 'Master\'s Degree', experience: '1-3 years', resumeName: '' });
  const [cvUploading, setCvUploading] = useState(false);
  const [cvUploadProgress, setCvUploadProgress] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalBatches: 0,
    totalRevenue: 0,
    pendingFees: 0,
  });

  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Initiating secure handshake...');

  // Check if student is approved
  const isApprovedStudent = React.useMemo(() => {
    if (!currentUser) return true;
    if (currentUser.role !== 'student') return true;
    
    // Look up in students list to get real-time status
    const studentRecord = students.find(s => s.id === currentUser.associatedId || (s.email && currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()));
    if (studentRecord) {
      return studentRecord.approved !== false;
    }
    return currentUser.approved !== false;
  }, [currentUser, students]);
  
  // Offline and Sync states
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      return !window.navigator.onLine;
    }
    return false;
  });
  const [simulateOffline, setSimulateOffline] = useState(false);
  const isAppOffline = isOffline || simulateOffline;
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Just now');
  
  // Quiz running state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  // Cross-Platform Simulator States
  const [simulatedPlatform, setSimulatedPlatform] = useState<'pc' | 'ios' | 'android'>('pc');

  // Sidebar Sections Collapsible States
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    "Core Workspace": false,
    "Administration & Finance": false,
    "Educator Workspace": false,
    "Student Hub & Guidance": false,
    "System & Analytics": false
  });

  // Faculty form states
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [adminTeachersSubTab, setAdminTeachersSubTab] = useState<'directory' | 'verification'>('directory');
  const [tName, setTName] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tSubject, setTSubject] = useState('');
  const [tBasePay, setTBasePay] = useState('45000');
  const [tHourlyRate, setTHourlyRate] = useState('1200');
  const [tPayoutType, setTPayoutType] = useState<'Fixed' | 'Hourly' | 'Per-Session'>('Hourly');

  // Cross-Platform Audio Notification Chime (Zero Assets Web Audio API synthesizer)
  const playChime = (type: 'success' | 'warning' | 'info' | 'sync' | 'error') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      
      if (type === 'success') {
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25); // C6
      } else if (type === 'warning' || type === 'error') {
        osc1.frequency.setValueAtTime(392.00, now); // G4
        osc1.frequency.exponentialRampToValueAtTime(311.13, now + 0.3); // Eb4 (Minor third drop)
      } else if (type === 'sync') {
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      } else {
        osc1.frequency.setValueAtTime(659.25, now); // E5
        osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.15); // B5
      }

      gain1.gain.setValueAtTime(type === 'error' || type === 'warning' ? 0.1 : 0.06, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);
    } catch (e) {
      console.log('Audio chime blocked or not supported on client', e);
    }
  };

  // State-backed notification queue for deduplication, classification, and mutual exclusion
  const [notificationsQueue, setNotificationsQueue] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'sync' | 'error';
    timestamp: string;
  }>>([]);

  const triggerSimulatedNotification = (
    message: string, 
    title: string, 
    typeParam?: 'success' | 'warning' | 'info' | 'sync' | 'error'
  ) => {
    // 1. Deduplication
    if (notificationsQueue.some(n => n.message === message)) {
      return;
    }

    // 2. Auto-classification based on text patterns
    let type: 'success' | 'warning' | 'info' | 'sync' | 'error' = typeParam || 'info';
    if (!typeParam) {
      const combined = (message + ' ' + title).toLowerCase();
      if (combined.includes('fail') || combined.includes('error') || combined.includes('cannot') || combined.includes('abort') || combined.includes('invalid')) {
        type = 'error';
      } else if (combined.includes('success') || combined.includes('saved') || combined.includes('loaded') || combined.includes('synced') || combined.includes('published') || combined.includes('stashed') || combined.includes('updated')) {
        type = 'success';
      } else if (combined.includes('warning') || combined.includes('caution') || combined.includes('offline') || combined.includes('disruption')) {
        type = 'warning';
      } else if (combined.includes('sync') || combined.includes('connect') || combined.includes('cache')) {
        type = 'sync';
      }
    }

    // 3. Mutual exclusivity constraints: Success and Error cannot live together
    if (type === 'success') {
      setNotificationsQueue(prev => prev.filter(n => n.type !== 'error'));
    } else if (type === 'error') {
      setNotificationsQueue(prev => prev.filter(n => n.type !== 'success'));
    }

    const newNotification = {
      id: String(Date.now() + Math.random()),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    playChime(type);

    setNotificationsQueue(prev => [...prev, newNotification].slice(-3)); // Limit to last 3 visible to prevent screen clutter

    setTimeout(() => {
      setNotificationsQueue(prev => prev.filter(n => n.id !== newNotification.id));
    }, 6000);
  };

  const handlePlatformChange = (platform: 'pc' | 'ios' | 'android') => {
    setSimulatedPlatform(platform);
  };

  // Sync data on mount
  const fetchData = async () => {
    setLoading(true);
    setLoadingProgress(5);
    setLoadingStage('Connecting to Learner\'s Den Secure Cloud... (5%)');

    let completed = 0;
    const totalFetches = 22;

    const updateProgress = (stageName: string) => {
      completed += 1;
      const pct = Math.min(Math.round(5 + (completed / totalFetches) * 95), 100);
      setLoadingProgress(pct);
      setLoadingStage(`${stageName} (${pct}%)`);
    };

    try {
      const fetchWithProgress = async (url: string, setter: (data: any) => void, stageName: string) => {
        try {
          const res = await fetch(url, {
            headers: {
              'x-user-role': currentUser?.role || '',
              'x-user-id': currentUser?.id || ''
            }
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setter(data);
          updateProgress(stageName);
        } catch (err) {
          console.warn(`Failed to fetch ${url}:`, err);
          // Update progress even on failure to avoid getting stuck
          updateProgress(`Failed to load ${stageName.split('...')[0]}...`);
        }
      };

      await Promise.all([
        fetchWithProgress('/api/stats', setStats, 'Loaded core business stats...'),
        fetchWithProgress('/api/students', setStudents, 'Synchronized student enrollment database...'),
        fetchWithProgress('/api/teachers', setTeachers, 'Synced instructor faculty records...'),
        fetchWithProgress('/api/courses', setCourses, 'Loaded curriculum syllabi catalogs...'),
        fetchWithProgress('/api/batches', setBatches, 'Retrieved active batch schedules...'),
        fetchWithProgress('/api/attendance', setAttendance, 'Processed daily check-in logs...'),
        fetchWithProgress('/api/leaves', setLeaves, 'Retrieved student leave applications...'),
        fetchWithProgress('/api/materials', setMaterials, 'Indexed digital study resources...'),
        fetchWithProgress('/api/quizzes', setQuizzes, 'Loaded AI test questions database...'),
        fetchWithProgress('/api/grades', setGrades, 'Cached performance exam marks...'),
        fetchWithProgress('/api/fees', setFees, 'Downloaded tuition invoices...'),
        fetchWithProgress('/api/teacher-attendance', setTeacherAttendance, 'Calculated instructor payroll ledgers...'),
        fetchWithProgress('/api/notices', setNotices, 'Acquiring active Notice Board announcements...'),
        fetchWithProgress('/api/users', setUsers, 'Synchronized workspace accounts roster...'),
        fetchWithProgress('/api/testimonials', setTestimonials, 'Retrieved positive student and parent testimonials...'),
        fetchWithProgress('/api/anonymous-feedback', setAnonymousFeedback, 'Downloaded feedback box complaints...'),
        fetchWithProgress('/api/gallery', setGallery, 'Retrieved interactive photo archive...'),
        fetchWithProgress('/api/payment-settings', setPaymentSettings, 'Retrieved institution payment settings...'),
        fetchWithProgress('/api/institution-profile', setInstitutionProfile, 'Acquiring institution details...'),
        fetchWithProgress('/api/recruitment-candidates', setCandidates, 'Synchronized staff recruitment pipeline...'),
        fetchWithProgress('/api/lecturer-evaluations', setLecturerEvaluations, 'Downloaded lecturer evaluations roster...'),
        fetchWithProgress('/api/job-applications', setJobApplications, 'Indexed submitted instructor profiles...'),
      ]);

      // Tiny decorative delay so the user can enjoy the high-fidelity load screen
      setLoadingProgress(100);
      setLoadingStage('ERP & LMS Client Ready! Launching Interface... (100%)');
      setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (err) {
      console.error('Error synchronizing database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleOnline = () => {
      setIsOffline(false);
      triggerSimulatedNotification('Internet connection restored! Backend database synchronizer online.', 'Network Online');
    };
    const handleOffline = () => {
      setIsOffline(true);
      triggerSimulatedNotification('Internet connection lost. You are now running in local Offline Sandbox Mode.', 'Network Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Automatically redirect admins from generic dashboard tab to erp-suite tab with active module set to dashboard
  useEffect(() => {
    if (currentUser && currentRole === 'admin' && currentTab === 'dashboard') {
      setCurrentTab('erp-suite');
      try {
        window.localStorage.setItem('erp_active_module', 'dashboard');
      } catch (e) {}
    }
  }, [currentRole, currentTab, currentUser]);

  // Guard unapproved students, parents, and job seekers from accessing private dashboards/tabs
  useEffect(() => {
    if (currentUser && currentUser.role === 'student' && !isApprovedStudent) {
      const allowedTabs = ['institution-details', 'institution-gallery', 'student-pathfinder', 'institution-testimonials', 'anonymous-feedback', 'notice-board'];
      if (!allowedTabs.includes(currentTab)) {
        setCurrentTab('institution-details');
      }
    }
    if (currentUser && currentUser.role === 'parent') {
      const allowedTabs = ['parent-monitor', 'institution-details', 'institution-gallery', 'student-pathfinder', 'notice-board', 'institution-testimonials', 'anonymous-feedback', 'academic-calendar'];
      if (!allowedTabs.includes(currentTab)) {
        setCurrentTab('parent-monitor');
      }
    }
    if (currentUser && currentUser.role === 'job_seeker') {
      const allowedTabs = ['job-application', 'institution-details', 'institution-gallery', 'student-pathfinder', 'notice-board', 'institution-testimonials', 'anonymous-feedback'];
      if (!allowedTabs.includes(currentTab)) {
        setCurrentTab('job-application');
      }
    }
  }, [currentUser, isApprovedStudent, currentTab]);

  // Guard helper to prevent potential data loss during offline usage
  const checkOfflineAction = (actionLabel: string): boolean => {
    if (isAppOffline) {
      triggerSimulatedNotification(`Transaction blocked! Cannot perform "${actionLabel}" while running offline. Reconnect or turn off offline simulation in the header to resume.`, 'Data Protection');
      return true;
    }
    return false;
  };

  // Sync selected tab with persona switches
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setActiveQuiz(null);
    if (role === 'admin') {
      setCurrentTab('erp-suite');
    } else if (role === 'parent') {
      setCurrentTab('parent-monitor');
    } else if (role === 'job_seeker') {
      setCurrentTab('job-application');
    } else {
      setCurrentTab('dashboard');
    }
  };

  // API Proxy handlers

  // Admissions
  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'totalFeesPaid' | 'totalFeesDue'>) => {
    if (checkOfflineAction('Enroll Student')) return;
    // Look up course fee
    const batch = batches.find(b => b.id === studentData.batchId);
    const course = courses.find(c => c.id === batch?.courseId);
    let fee = course ? course.fee : 1500;

    // Apply concession if applicable
    if (studentData.concessionApplied && studentData.concessionPercentage) {
      fee = Math.max(0, Math.round(fee * (1 - studentData.concessionPercentage / 100)));
    }

    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...studentData,
        totalFeesPaid: 0,
        totalFeesDue: fee,
      }),
    });
    await fetchData();
  };

  const handleUpdateCandidates = async (updatedCandidates: any[]) => {
    setCandidates(updatedCandidates);
    try {
      await fetch('/api/recruitment-candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify(updatedCandidates)
      });
    } catch (err) {
      console.error('Failed to update recruitment candidates on server:', err);
    }
  };

  const handleUpdateJobApplications = async (updatedApplications: any[]) => {
    setJobApplications(updatedApplications);
    try {
      await fetch('/api/job-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify(updatedApplications)
      });
    } catch (err) {
      console.error('Failed to update job applications on server:', err);
    }
  };

  const handleAddJobApplication = async (newApp: any) => {
    try {
      const res = await fetch('/api/job-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify(newApp)
      });
      if (res.ok) {
        const data = await res.json();
        setJobApplications(prev => [...prev, data.application]);
        
        // Auto-feed submitted CV as a pending ATS candidate
        const autoCandidate = {
          name: newApp.name,
          role: `${newApp.subject || 'Faculty'} Mentor`,
          experience: newApp.experience || '1-3 years',
          phone: newApp.phone || '',
          email: newApp.email || '',
          status: 'Interviewing',
          resumeName: newApp.resumeName || 'cv_attachment.pdf'
        };
        await handleAddOrUpdateCandidate(autoCandidate);
      }
    } catch (err) {
      console.error('Failed to submit job application to server:', err);
    }
  };

  const handleAddOrUpdateCandidate = async (candidate: any) => {
    try {
      const res = await fetch('/api/recruitment-candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify(candidate)
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(prev => {
          const idx = prev.findIndex(c => c.id === data.candidate.id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = data.candidate;
            return copy;
          }
          return [...prev, data.candidate];
        });
      }
    } catch (err) {
      console.error('Failed to save recruitment candidate:', err);
    }
  };

  const handleAddEvaluation = async (newEval: any) => {
    try {
      const res = await fetch('/api/lecturer-evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify(newEval)
      });
      if (res.ok) {
        const data = await res.json();
        setLecturerEvaluations(prev => [data.evaluation, ...prev]);
        triggerSimulatedNotification(
          `Successfully submitted anonymous evaluation for ${newEval.lecturerName}!`,
          "Evaluation Logged"
        );
      }
    } catch (err) {
      console.error('Failed to submit lecturer evaluation:', err);
    }
  };

  const handleUpdateStudent = async (id: string, studentData: Partial<Student>) => {
    if (checkOfflineAction('Update Student Profile')) return;
    await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': currentRole,
        'x-user-id': currentUser?.id || 'admin'
      },
      body: JSON.stringify(studentData),
    });
    await fetchData();
  };

  const handleDeleteStudent = async (id: string) => {
    if (checkOfflineAction('De-enroll Student')) return;
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  // Fees collections
  const handleCollectFees = async (studentId: string, amount: number, mode: string, meta?: any) => {
    if (checkOfflineAction('Record Tuition Payment')) return;
    await fetch('/api/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, amount, paymentMode: mode, ...meta }),
    });
    await fetchData();
  };

  const handleUpdatePaymentSettings = async (settings: PaymentSettings) => {
    if (checkOfflineAction('Update Payment Settings')) return;
    try {
      const res = await fetch('/api/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const updated = await res.json();
        setPaymentSettings(updated);
        triggerSimulatedNotification('Institution payment settings (UPI & custom QR) updated successfully.', 'Payment Settings');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInstitutionProfile = async (updatedFields: Partial<InstitutionProfile>) => {
    if (checkOfflineAction('Update Institution Profile')) return;
    try {
      const res = await fetch('/api/institution-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const data = await res.json();
        setInstitutionProfile(data);
      } else {
        throw new Error("Server rejected profile update");
      }
    } catch (err) {
      console.error(err);
      throw err; // propagate to child component so it can handle notification appropriately
    }
  };

  // Courses & Batches
  const handleAddCourse = async (courseData: Omit<Course, 'id'>) => {
    if (checkOfflineAction('Create Course')) return;
    await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    await fetchData();
  };

  const handleAddBatch = async (batchData: Omit<Batch, 'id'>) => {
    if (checkOfflineAction('Create Academic Batch')) return;
    await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData),
    });
    await fetchData();
  };

  const handleDeleteCourse = async (id: string) => {
    if (checkOfflineAction('Delete Course')) return;
    await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  const handleUpdateCourse = async (id: string, updatedCourse: Partial<Course>) => {
    if (checkOfflineAction('Update Course')) return;
    await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCourse),
    });
    await fetchData();
  };

  const handleDeleteBatch = async (id: string) => {
    if (checkOfflineAction('Delete Academic Batch')) return;
    await fetch(`/api/batches/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  // Faculty management
  const handleAddTeacher = async (teacherData: Omit<Teacher, 'id'>) => {
    await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData),
    });
    await fetchData();
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to remove this instructor?')) return;
    await fetch(`/api/teachers/${id}`, {
      method: 'DELETE',
    });
    await fetchData();
  };

  // Material uploads
  const handleAddMaterial = async (matData: Omit<Material, 'id' | 'createdAt'>) => {
    await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matData),
    });
    await fetchData();
  };

  // Mark Attendance
  const handleSaveAttendance = async (attData: {
    date: string;
    batchId: string;
    records: { studentId: string; status: 'Present' | 'Absent' }[];
    photoUrl?: string;
    photoTimestamp?: string;
    photoLocation?: { lat: number; lng: number };
  }) => {
    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attData),
    });
    await fetchData();
  };

  // Instructor attendance & remuneration handlers
  const handleUpdateTeacherRates = async (teacherId: string, rates: { basePay: number; hourlyRate: number; payoutType: 'Fixed' | 'Hourly' | 'Per-Session'; terminated?: boolean }) => {
    await fetch(`/api/teachers/${teacherId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rates),
    });
    await fetchData();
  };

  const handleUpdateTeacher = async (teacherId: string, updates: Partial<Teacher>) => {
    await fetch(`/api/teachers/${teacherId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    await fetchData();
  };

  const handleToggleUserApproval = async (userId: string, approved: boolean) => {
    if (checkOfflineAction('Approve User Verification')) return;
    await fetch(`/api/users/${userId}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved })
    });
    await fetchData();
    triggerSimulatedNotification(
      `User account status updated to ${approved ? 'Verified & Approved' : 'Unverified/Pending'}.`,
      'Roster Sync'
    );
  };

  const handleUpdateUserStatus = async (userId: string, status: 'approved' | 'rejected' | 'ignored' | 'pending') => {
    if (checkOfflineAction('Update User Status')) return;
    await fetch(`/api/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await fetchData();
    triggerSimulatedNotification(
      `User account status updated to ${status}.`,
      'Roster Sync'
    );
  };

  const handleDeleteUserAccount = async (userId: string) => {
    if (checkOfflineAction('Delete User Account')) return;
    if (!window.confirm("Are you sure you want to completely delete this user registration account? This cannot be undone.")) return;
    await fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    });
    await fetchData();
    triggerSimulatedNotification(
      `User registration account deleted successfully.`,
      'Registry Sync'
    );
  };

  const handleTeacherPunchIn = async (punchData: { teacherId: string; mode: 'QR' | 'PunchIn' | 'Location' | 'Geofence'; location?: { lat: number; lng: number }; verified: boolean }) => {
    await fetch('/api/teacher-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...punchData,
        action: 'checkin',
      }),
    });
    await fetchData();
  };

  const handleTeacherPunchOut = async (attendanceId: string, hoursWorked: number) => {
    const log = teacherAttendance.find(t => t.id === attendanceId);
    if (log) {
      await fetch('/api/teacher-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          teacherId: log.teacherId,
          date: log.date,
          hoursWorked,
        }),
      });
      await fetchData();
    }
  };

  const handleApproveTeacherAttendance = async (attendanceId: string, verified: boolean) => {
    await fetch(`/api/teacher-attendance/${attendanceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified }),
    });
    await fetchData();
  };

  const handleAddManualLog = async (logData: Omit<TeacherAttendance, 'id'>) => {
    await fetch('/api/teacher-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
    await fetchData();
  };

  const handleDeleteAttendanceLog = async (logId: string) => {
    await fetch(`/api/teacher-attendance/${logId}`, {
      method: 'DELETE',
    });
    await fetchData();
  };

  const handleStudentCheckIn = async (checkInData: {
    studentId: string;
    batchId: string;
    date: string;
    status: 'Present' | 'Absent';
    photoUrl?: string;
    photoTimestamp?: string;
    photoLocation?: { lat: number; lng: number };
  }) => {
    await fetch('/api/student-attendance/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkInData),
    });
    await fetchData();
  };

  const handleApplyLeave = async (leaveData: {
    studentId: string;
    studentName: string;
    batchId: string;
    startDate: string;
    endDate: string;
    reason: string;
    attachmentUrl?: string;
  }) => {
    await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData)
    });
    await fetchData();
  };

  const handleUpdateLeave = async (leaveId: string, status: 'Approved' | 'Rejected', comments?: string) => {
    await fetch(`/api/leaves/${leaveId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, approvedBy: currentUser?.name || 'ERP Admin', comments })
    });
    await fetchData();
  };

  // Submit test grades
  const handleSubmitGrade = async (gradeData: Omit<Grade, 'id' | 'completedAt'>) => {
    await fetch('/api/grades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gradeData),
    });
    await fetchData();
  };

  // Generate Gemini Quiz
  const handleGenerateQuiz = async (quizData: { title: string; subject: string; topic: string; batchId: string; count: number }) => {
    const res = await fetch('/api/gemini/quiz-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: quizData.topic, subject: quizData.subject, count: quizData.count }),
    });
    const data = await res.json();
    if (res.ok) {
      // Post the new quiz to LMS
      await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizData.title,
          subject: quizData.subject,
          durationMinutes: quizData.count * 3, // 3 mins per question
          batchId: quizData.batchId,
          questions: data.questions,
          isAiGenerated: true,
        }),
      });
      await fetchData();
    } else {
      throw new Error(data.error || 'Quiz generation failed');
    }
  };

  // Notice Board Handlers
  const handleAddNotice = async (noticeData: Omit<Notice, 'id' | 'date'>) => {
    await fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticeData),
    });
    await fetchData();
  };

  const handleUpdateNotice = async (id: string, noticeData: Partial<Notice>) => {
    await fetch(`/api/notices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticeData),
    });
    await fetchData();
  };

  const handleDeleteNotice = async (id: string) => {
    await fetch(`/api/notices/${id}`, {
      method: 'DELETE',
    });
    await fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-100/60 flex flex-col items-center relative overflow-hidden">
          {/* Ambient header glow */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"></div>

          {/* Glowing app icon */}
          <div className="h-16 w-16 bg-transparent flex items-center justify-center mb-5 relative shrink-0">
            <img src="/favicon.svg" alt="Learner's Den Logo" className="h-16 w-16 object-contain select-none animate-pulse filter drop-shadow-md" referrerPolicy="no-referrer" />
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
            Learner's Den
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/50">
              ERP + LMS
            </span>
          </h2>
          <p className="text-xxs text-slate-400 font-bold uppercase tracking-widest mt-1">
            INTELLIGENT ACADEMIC PORTAL
          </p>

          {/* Main Progress Bar Container */}
          <div className="w-full bg-slate-100 border border-slate-200/60 rounded-2xl p-1 mt-8 mb-4">
            <div className="relative h-4 w-full bg-slate-150/40 rounded-xl overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-sm transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Stat Progress & Label */}
          <div className="w-full flex items-center justify-between text-xxs font-extrabold text-slate-500 px-1">
            <span className="truncate max-w-[80%] text-slate-600 flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 text-indigo-500 animate-spin" />
              {loadingStage}
            </span>
            <span className="text-indigo-600 font-black">{loadingProgress}%</span>
          </div>

          {/* Subtle Decorative Checklist */}
          <div className="w-full mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[10px] font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${loadingProgress >= 15 ? 'bg-indigo-500' : 'bg-slate-300'}`}></span>
              <span className={loadingProgress >= 15 ? 'text-slate-600' : ''}>Stats & Financials</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${loadingProgress >= 40 ? 'bg-indigo-500' : 'bg-slate-300'}`}></span>
              <span className={loadingProgress >= 40 ? 'text-slate-600' : ''}>Student Directory</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${loadingProgress >= 65 ? 'bg-indigo-500' : 'bg-slate-300'}`}></span>
              <span className={loadingProgress >= 65 ? 'text-slate-600' : ''}>LMS Materials</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${loadingProgress >= 90 ? 'bg-indigo-500' : 'bg-slate-300'}`}></span>
              <span className={loadingProgress >= 90 ? 'text-slate-600' : ''}>Staff Payrolls</span>
            </div>
          </div>
        </div>

        {/* Footer info badge */}
        <p className="text-[10px] text-slate-400 font-bold mt-4 flex items-center gap-1">
          <span>● Caching enabled</span>
          <span className="text-slate-300">|</span>
          <span>Powered by Learner's Den Intelligence</span>
        </p>
      </div>
    );
  }

  // Define grouped side menu sections representing all academic and ERP modules
  const rawMenuSections: { title: string; items: { id: string; label: string; icon: any; roles: UserRole[]; badge?: string }[] }[] = [
    {
      title: "Core Workspace",
      items: [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
        { id: 'notice-board', label: 'Communication Centre', icon: Megaphone, roles: ['admin', 'teacher', 'student', 'parent', 'job_seeker'] },
        { id: 'academic-calendar', label: 'Academic Calendar', icon: Calendar, roles: ['admin', 'teacher', 'student', 'parent'] },
        { id: 'anonymous-feedback', label: 'Anonymous Feedback Desk', icon: MessageSquare, roles: ['admin', 'teacher', 'student', 'parent', 'job_seeker'] },
      ]
    },
    {
      title: "Explore Institute",
      items: [
        { id: 'institution-details', label: currentRole === 'admin' ? 'Institution Management' : 'Details of Institution', icon: Info, roles: ['admin', 'teacher', 'student', 'parent', 'job_seeker'] },
        { id: 'institution-gallery', label: 'Campus Gallery', icon: ImageIcon, roles: ['admin', 'teacher', 'student', 'parent', 'job_seeker'] },
        { id: 'institution-testimonials', label: 'User Testimonials', icon: Heart, roles: ['admin', 'teacher', 'student', 'parent', 'job_seeker'] },
        { id: 'student-pathfinder', label: 'AI Career Pathfinder', icon: Compass, roles: ['student', 'admin', 'teacher', 'parent', 'job_seeker'], badge: "AI" },
        { id: 'alumni-portal', label: 'Alumni Portal & Community', icon: Users, roles: ['admin', 'teacher', 'student', 'parent'], badge: "Chat" },
      ]
    },
    {
      title: "Parent Ward Monitoring",
      items: [
        { id: 'parent-monitor', label: 'Monitor Ward', icon: ShieldCheck, roles: ['parent'] },
      ]
    },
    {
      title: "Careers & Recruitment",
      items: [
        { id: 'job-application', label: 'Submit Profile & CV', icon: FileText, roles: ['job_seeker'] },
      ]
    },
    {
      title: "Administration & Finance",
      items: [
        { id: 'admin-students', label: 'Admissions Directory', icon: GraduationCap, roles: ['admin'] },
        { id: 'admin-curriculum', label: 'Curriculum & Batches', icon: BookOpen, roles: ['admin'] },
        { id: 'admin-teachers', label: 'Instructors Faculty', icon: Users, roles: ['admin'] },
        { id: 'admin-payroll', label: 'Instructor Payroll', icon: IndianRupee, roles: ['admin'] },
        { id: 'admin-finance', label: 'Fees & Invoicing', icon: Wallet, roles: ['admin'] },
        { id: 'digital-library', label: 'Digital E-Book Library', icon: BookOpen, roles: ['admin'] },
        { id: 'erp-suite', label: 'Academic ERP Suite', icon: LayoutGrid, roles: ['admin'], badge: "ERP" },
      ]
    },
    {
      title: "Educator Workspace",
      items: [
        { id: 'teacher-timetable', label: 'Batch Schedules', icon: Calendar, roles: ['teacher'] },
        { id: 'teacher-payroll', label: 'My Wage & Punch-In', icon: Clock, roles: ['teacher'] },
        { id: 'teacher-attendance', label: 'Roll-Call Attendance', icon: UserCheck, roles: ['teacher'] },
        { id: 'teacher-lms', label: 'Learning Center (LMS)', icon: FileText, roles: ['teacher'] },
        { id: 'digital-library', label: 'Digital E-Book Library', icon: BookOpen, roles: ['teacher'] },
        { id: 'teacher-ai', label: 'AI Quiz Builder', icon: BrainCircuit, roles: ['teacher'], badge: "AI" },
        { id: 'teacher-feedback', label: 'Student Evaluations', icon: MessageSquare, roles: ['teacher'], badge: "Rating" },
      ]
    },
    {
      title: "Student Hub & Guidance",
      items: [
        { id: 'student-lms', label: 'My Study Desk (LMS)', icon: BookOpen, roles: ['student'] },
        { id: 'digital-library', label: 'Digital E-Book Library', icon: BookOpen, roles: ['student'] },
        { id: 'student-ai', label: 'AI Study Companion', icon: BrainCircuit, roles: ['student'], badge: "AI" },
        { id: 'student-attendance', label: 'My Attendance Check-In', icon: UserCheck, roles: ['student'] },
        { id: 'student-payment', label: 'Pay My Fees', icon: CreditCard, roles: ['student'], badge: "Pay" },
        { id: 'student-feedback', label: 'Lecturer Evaluation', icon: MessageSquare, roles: ['student'], badge: "Rate" },
      ]
    },
    {
      title: "System & Analytics",
      items: [
        { id: 'exams', label: 'Examination System', icon: Award, roles: ['admin', 'teacher', 'student'], badge: 'Exams' },
        { id: 'performance-analytics', label: 'Performance & Reports', icon: TrendingUp, roles: ['admin', 'teacher', 'student'] },
        { id: 'platform-hub', label: 'Multi-Platform PWA Hub', icon: Smartphone, roles: ['admin', 'teacher', 'student'] },
        { id: 'settings', label: 'Settings & About', icon: Settings, roles: ['admin', 'teacher', 'student', 'parent', 'job_seeker'] }
      ]
    }
  ];

  const menuSections = (currentRole === 'parent' || currentRole === 'job_seeker')
    ? rawMenuSections
    : isApprovedStudent
      ? rawMenuSections
      : [
          {
            title: "Institution Hub (Unapproved)",
            items: [
              { id: 'institution-details', label: 'Details of Institution', icon: Info, roles: ['student'] },
              { id: 'institution-gallery', label: 'Campus Gallery', icon: ImageIcon, roles: ['student'] },
              { id: 'student-pathfinder', label: 'AI Career Pathfinder', icon: Compass, roles: ['student'], badge: "AI" },
            ]
          }
        ];

  // Flat helper array for any legacy single-tier lookup and mobile select dropdown fallback
  const menuItems = menuSections.flatMap(sec => sec.items);
  const activeRoleItems = menuItems.filter(item => item.roles.includes(currentRole));

  // Smart sidebar/panel click handler that transitions persona perspective automatically
  const handleItemClick = (itemId: string, itemRoles: UserRole[]) => {
    const prevTab = currentTab;
    const prevMod = activeModule;
    const pushHistory = () => {
      setNavHistory(prev => {
        const last = prev[prev.length - 1];
        if (last && last.tab === prevTab && last.module === prevMod) {
          return prev;
        }
        return [...prev, { tab: prevTab, module: prevMod }];
      });
    };

    if (!itemRoles.includes(currentRole)) {
      if (currentUser?.role === 'admin') {
        const targetRole = itemRoles[0]; // e.g. switch view perspective
        setCurrentRole(targetRole);
        pushHistory();
        if (targetRole === 'admin' && itemId === 'dashboard') {
          setCurrentTab('erp-suite');
          setActiveModule('dashboard');
        } else {
          setCurrentTab(itemId);
          setActiveModule(null);
        }
        setActiveQuiz(null);
        triggerSimulatedNotification(`Simulated view perspective changed to ${targetRole.toUpperCase()} to load this module.`, 'Perspective Synced');
      } else {
        triggerSimulatedNotification(`Access restricted. Log in as an Administrator to explore other modules in sandbox.`, 'Access Restricted');
      }
    } else {
      pushHistory();
      if (currentRole === 'admin' && itemId === 'dashboard') {
        setCurrentTab('erp-suite');
        setActiveModule('dashboard');
      } else {
        setCurrentTab(itemId);
        setActiveModule(null);
      }
      setActiveQuiz(null);
    }
  };

  const handleBack = () => {
    if (isMobileDrawerOpen) {
      setIsMobileDrawerOpen(false);
    } else if (isHomePage() || navHistory.length === 0) {
      setIsExitModalOpen(true);
    } else {
      setNavHistory(prev => {
        const nextHistory = [...prev];
        const last = nextHistory.pop();
        if (last) {
          setRawTab(last.tab);
          setRawActiveModule(last.module);
        }
        return nextHistory;
      });
    }
  };

  const renderAdminDashboardContent = () => (
    <div className="space-y-6">
      <StatsGrid stats={stats} />
      
      <BatchPerformanceChart batches={batches} students={students} grades={grades} quizzes={quizzes} />



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timetable schedule timeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs lg:col-span-2">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Calendar className="h-4.5 w-4.5 text-indigo-600" />
            <span>Timetable timeline</span>
          </h3>
          <div className="space-y-3.5 text-left">
            {batches.map((batch, idx) => (
              <div key={batch.id} className="flex gap-4 items-start text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div className={`p-2.5 rounded-xl font-extrabold flex flex-col items-center justify-center shrink-0 w-12 text-center ${
                  idx === 0 ? 'bg-indigo-50 text-indigo-700' :
                  idx === 1 ? 'bg-emerald-50 text-emerald-700' :
                  idx === 2 ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'
                }`}>
                  <span className="text-xxs opacity-80 uppercase font-black">Room</span>
                  <span className="text-xxs">{batch.room.split(' ')[1] || 'T1'}</span>
                </div>
                <div className="space-y-0.5 flex-1">
                  <h4 className="font-bold text-slate-800">{batch.name}</h4>
                  <p className="text-slate-500 font-medium text-xxs">Schedule: <b>{batch.schedule}</b></p>
                  <p className="text-slate-400 text-xxs font-semibold">Teacher Code: {batch.teacherId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admissions Ledger */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
            <span>Admission Ledger Activity</span>
          </h3>
          <div className="space-y-3 text-left">
            {students.slice(0, 4).map((student) => (
              <div key={student.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-150/80 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-800">{student.name}</p>
                  <p className="text-xxs text-slate-400 mt-1 font-semibold">Admitted: {student.admissionDate}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xxs font-bold border ${
                    student.feeStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {student.feeStatus}
                  </span>
                  <p className="text-xxs font-bold text-slate-500 mt-1.5">Paid: ₹{student.totalFeesPaid}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const isSimulatedMobile = simulatedPlatform !== 'pc';

  const renderNotifications = () => {
    if (notificationsQueue.length === 0) return null;
    return (
      <div className="fixed top-6 right-6 z-[9999] w-full max-w-sm px-4 space-y-3 pointer-events-none">
        {notificationsQueue.map((notification) => {
          let cardBg = 'bg-slate-900/95 border-slate-700/50';
          let textColor = 'text-white';
          let iconColor = 'text-indigo-400';
          let IconComp = Info;

          if (notification.type === 'success') {
            cardBg = 'bg-emerald-950/95 border-emerald-800/40';
            iconColor = 'text-emerald-400';
            IconComp = CheckCircle;
          } else if (notification.type === 'error') {
            cardBg = 'bg-rose-950/95 border-rose-800/40';
            iconColor = 'text-rose-400';
            IconComp = XCircle;
          } else if (notification.type === 'warning') {
            cardBg = 'bg-amber-950/95 border-amber-800/40';
            iconColor = 'text-amber-400';
            IconComp = AlertCircle;
          } else if (notification.type === 'sync') {
            cardBg = 'bg-sky-950/95 border-sky-800/40';
            iconColor = 'text-sky-400 animate-spin';
            IconComp = Loader2;
          }

          return (
            <div 
              key={notification.id}
              className={`backdrop-blur-md ${cardBg} ${textColor} rounded-2xl p-4 shadow-2xl border flex gap-3 items-start pointer-events-auto transition-all duration-300 transform translate-y-0 scale-100 hover:scale-[1.02] animate-fadeIn`}
            >
              <div className={`h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0`}>
                <IconComp className={`h-4.5 w-4.5 ${iconColor}`} />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold opacity-60 uppercase tracking-widest">
                    {notification.type.toUpperCase()} ALERT
                  </span>
                  <span className="text-[8px] text-slate-400 font-medium">{notification.timestamp}</span>
                </div>
                <h4 className="text-xxs font-black text-white truncate leading-tight uppercase tracking-wider">{notification.title}</h4>
                <p className="text-xxxxs text-slate-300 leading-normal font-semibold">{notification.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsQueue(prev => prev.filter(n => n.id !== notification.id))}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 shrink-0 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAppContent = () => {
    if (!currentUser) return null;

    if (hasExited) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full space-y-6">
            <div className="h-16 w-16 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
              <GraduationCap className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-white tracking-tight">You have exited Learner's Den.</h1>
              <p className="text-xs text-slate-400 font-bold">Your session was closed safely. You can restart or return to the platform at any time.</p>
            </div>
            <button
              onClick={() => {
                setHasExited(false);
                setNavHistory([]);
                setCurrentTab('dashboard');
                setActiveModule(null);
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <span>Launch Platform Again</span>
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className={`flex flex-col flex-1 relative ${isSimulatedMobile ? 'h-full overflow-y-auto pb-24' : 'min-h-screen pb-24 md:pb-6'}`}>
        {/* Dynamic Header */}
        <Header
          currentRole={currentRole}
          onChangeRole={handleRoleChange}
          currentUser={currentUser}
          onLogout={handleLogout}
          isOffline={isAppOffline}
          onToggleOffline={() => setSimulateOffline(!simulateOffline)}
          onUpdateUser={(updatedUser) => {
            setCurrentUser(updatedUser);
            safeLocalStorage.setItem('erp_current_user', JSON.stringify(updatedUser));
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
          }}
          showToast={(title, desc) => triggerSimulatedNotification(desc, title)}
          onMenuToggle={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
        />

        {/* Mobile Slide-In Navigation Drawer */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden animate-fadeIn" role="dialog" aria-modal="true">
            {/* Backdrop Overlay */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ease-out cursor-pointer"
              onClick={() => setIsMobileDrawerOpen(false)}
            />

            {/* Slide-In Drawer Panel */}
            <div 
              className="relative flex w-full max-w-xs flex-col bg-white h-full shadow-2xl p-4 overflow-y-auto transition-transform duration-300 ease-out animate-slideInLeft text-left"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <img src="/favicon.svg" alt="Learner's Den Logo" className="h-9 w-9 object-contain select-none" referrerPolicy="no-referrer" />
                  <div>
                    <h2 className="text-xs font-black text-slate-800 tracking-tight leading-none">Learner's Den</h2>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Mobile Navigation</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Active Persona profile info inside drawer */}
              <div className="px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 mb-4 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0 ${
                  currentRole === 'admin' ? 'bg-indigo-600' : currentRole === 'teacher' ? 'bg-emerald-600' : 'bg-violet-600'
                }`}>
                  {currentRole[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-slate-800 capitalize leading-tight">{currentRole} portal</h4>
                  <p className="text-[9px] text-slate-400 font-bold truncate mt-0.5">{currentUser?.name || 'Administrator'}</p>
                </div>
              </div>

              {/* Segmented Persona quick controller (Only if main account is admin) */}
              {currentUser?.role === 'admin' && (
                <div className="space-y-1.5 mb-5 pb-4 border-b border-slate-100 shrink-0">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Quick Switch Perspective</p>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-150">
                    {[
                      { role: 'admin' as UserRole, label: 'Admin', color: 'hover:text-indigo-600', activeBg: 'bg-indigo-600 text-white shadow-xs' },
                      { role: 'teacher' as UserRole, label: 'Teacher', color: 'hover:text-emerald-600', activeBg: 'bg-emerald-600 text-white shadow-xs' },
                      { role: 'student' as UserRole, label: 'Student', color: 'hover:text-violet-600', activeBg: 'bg-violet-600 text-white shadow-xs' }
                    ].map(sw => {
                      const isSelected = currentRole === sw.role;
                      return (
                        <button
                          key={sw.role}
                          onClick={() => {
                            handleRoleChange(sw.role);
                            setIsMobileDrawerOpen(false);
                          }}
                          className={`py-1.5 px-1 rounded-lg text-[9px] font-black transition-all cursor-pointer text-center ${
                            isSelected
                              ? sw.activeBg
                              : `text-slate-500 ${sw.color} hover:bg-white/60`
                          }`}
                          title={`Switch simulation perspective to ${sw.role}`}
                        >
                          {sw.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation sections */}
              <nav className="space-y-4 flex-1 pb-8">
                {menuSections.map(section => {
                  const isCollapsed = collapsedSections[section.title];
                  return (
                    <div key={section.title} className="space-y-1.5">
                      {/* Section Header */}
                      <button
                        onClick={() => {
                          setCollapsedSections(prev => ({
                            ...prev,
                            [section.title]: !prev[section.title]
                          }));
                        }}
                        className="w-full flex items-center justify-between px-2 py-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-all text-left"
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider">{section.title}</span>
                        {isCollapsed ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                        )}
                      </button>

                      {/* Section Items */}
                      {!isCollapsed && (
                        <div className="space-y-0.5">
                          {section.items.map(item => {
                            const Icon = item.icon;
                            const isSelected = currentTab === item.id;
                            const isAllowed = item.roles.includes(currentRole);

                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  handleItemClick(item.id, item.roles);
                                  setIsMobileDrawerOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 group relative ${
                                  isSelected
                                    ? currentRole === 'admin'
                                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                                      : currentRole === 'teacher'
                                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                      : 'bg-violet-600 text-white font-bold shadow-xs'
                                    : !isAllowed
                                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-50/50'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Icon className={`h-4 w-4 shrink-0 ${
                                    isSelected
                                      ? 'text-white'
                                      : !isAllowed
                                      ? 'text-slate-300'
                                      : currentRole === 'admin'
                                      ? 'text-slate-500 group-hover:text-indigo-600'
                                      : currentRole === 'teacher'
                                      ? 'text-slate-500 group-hover:text-emerald-600'
                                      : 'text-slate-500 group-hover:text-violet-600'
                                  }`} />
                                  <span className="truncate leading-tight">{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : item.badge === 'AI'
                                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                      : item.badge === 'Exams'
                                      ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                      : 'bg-slate-100 text-slate-600 border border-slate-150'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

      <div className={`max-w-7xl mx-auto w-full flex-1 flex py-6 gap-6 ${isSimulatedMobile ? 'flex-col px-3' : 'px-4 sm:px-6 lg:px-8'}`}>
        {/* Responsive Sidebar */}
        {!isSimulatedMobile && (
          <aside className="w-72 shrink-0 hidden md:block text-left">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-5 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              
              {/* Sidebar Header: Active Persona Profile & Quick Switcher Segmented Control */}
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Workspace</p>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-150 text-indigo-700 font-extrabold text-[8px] uppercase tracking-wide">
                    Sandbox
                  </span>
                </div>

                {/* Animated active view details */}
                <div className="px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0 ${
                    currentRole === 'admin' ? 'bg-indigo-600' : currentRole === 'teacher' ? 'bg-emerald-600' : 'bg-violet-600'
                  }`}>
                    {currentRole[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <h4 className="text-xs font-black text-slate-800 capitalize leading-tight">{currentRole} portal</h4>
                    <p className="text-[9px] text-slate-400 font-bold truncate mt-0.5">{currentUser?.name || 'Administrator'}</p>
                  </div>
                </div>

                {/* Segmented Persona quick controller (Only if main account is admin) */}
                {currentUser?.role === 'admin' && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Quick Switch Perspective</p>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-150">
                      {[
                        { role: 'admin' as UserRole, label: 'Admin', color: 'hover:text-indigo-600', activeBg: 'bg-indigo-600 text-white shadow-xs' },
                        { role: 'teacher' as UserRole, label: 'Teacher', color: 'hover:text-emerald-600', activeBg: 'bg-emerald-600 text-white shadow-xs' },
                        { role: 'student' as UserRole, label: 'Student', color: 'hover:text-violet-600', activeBg: 'bg-violet-600 text-white shadow-xs' }
                      ].map(sw => {
                        const isSelected = currentRole === sw.role;
                        return (
                          <button
                            key={sw.role}
                            onClick={() => handleRoleChange(sw.role)}
                            className={`py-1.5 px-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                              isSelected
                                ? sw.activeBg
                                : `text-slate-500 ${sw.color} hover:bg-white/60`
                            }`}
                            title={`Switch simulation perspective to ${sw.role}`}
                          >
                            {sw.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible/Expandable Navigation Sections */}
              <nav className="space-y-4">
                {menuSections.map(section => {
                  const isCollapsed = collapsedSections[section.title];
                  return (
                    <div key={section.title} className="space-y-1.5">
                      {/* Section Header */}
                      <button
                        onClick={() => {
                          setCollapsedSections(prev => ({
                            ...prev,
                            [section.title]: !prev[section.title]
                          }));
                        }}
                        className="w-full flex items-center justify-between px-2 py-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-all text-left"
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider">{section.title}</span>
                        {isCollapsed ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0 animate-pulse" />
                        ) : (
                          <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                        )}
                      </button>

                      {/* Section Items */}
                      {!isCollapsed && (
                        <div className="space-y-0.5 animate-fadeIn">
                          {section.items.map(item => {
                            const Icon = item.icon;
                            const isSelected = currentTab === item.id;
                            const isAllowed = item.roles.includes(currentRole);
                            const canAutoSwitch = currentUser?.role === 'admin';

                            return (
                              <button
                                key={item.id}
                                onClick={() => handleItemClick(item.id, item.roles)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 group relative ${
                                  isSelected
                                    ? currentRole === 'admin'
                                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                                      : currentRole === 'teacher'
                                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                      : 'bg-violet-600 text-white font-bold shadow-xs'
                                    : !isAllowed
                                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-50/50'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Icon className={`h-4 w-4 shrink-0 ${
                                    isSelected
                                      ? 'text-white'
                                      : !isAllowed
                                      ? 'text-slate-300'
                                      : currentRole === 'admin'
                                      ? 'text-slate-500 group-hover:text-indigo-600'
                                      : currentRole === 'teacher'
                                      ? 'text-slate-500 group-hover:text-emerald-600'
                                      : 'text-slate-500 group-hover:text-violet-600'
                                  }`} />
                                  <span className="truncate leading-tight">{item.label}</span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {/* AI or ERP Glowing Badge */}
                                  {item.badge && (
                                    <span className={`px-1.5 py-0.5 text-[8px] font-black rounded-md ${
                                      item.badge === 'AI' 
                                        ? 'bg-violet-500/10 text-violet-600 border border-violet-200/50 animate-pulse'
                                        : 'bg-amber-500/10 text-amber-600 border border-amber-200/50'
                                    }`}>
                                      {item.badge}
                                    </span>
                                  )}

                                  {/* Locked / Transition indicator for other roles */}
                                  {!isAllowed && (
                                    <div className="flex items-center">
                                      {canAutoSwitch ? (
                                        <span className="text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                          Switch
                                        </span>
                                      ) : (
                                        <Lock className="h-3 w-3 text-slate-300" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

            </div>
          </aside>
        )}

        {/* Main Workspace Frame */}
        <main className="flex-1 min-w-0">
          {/* Universal Back Navigation & Breadcrumb System */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-white border border-slate-200 p-3 rounded-2xl shadow-xxs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                id="universal-back-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-black transition-all cursor-pointer shadow-3xs"
              >
                <ArrowLeft className="h-4 w-4 text-slate-500" />
                <span>Back</span>
              </button>
              
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-indigo-600 font-extrabold">
                  {currentTab === 'erp-suite' 
                    ? `Academic ERP Suite ${activeModule ? `/ ${activeModule}` : ''}`
                    : currentTab.replace(/-/g, ' ')}
                </span>
              </div>
            </div>

            {navHistory.length > 0 && (
              <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded-lg">
                Stack: {navHistory.length}
              </span>
            )}
          </div>

          {activeQuiz ? (
            /* Active Interactive Quiz taking */
            <QuizRunner
              quiz={activeQuiz}
              studentId={currentUser?.associatedId || "student-2"}
              isTeacherPreview={currentRole !== 'student'}
              onClose={() => setActiveQuiz(null)}
              onSubmitGrade={handleSubmitGrade}
            />
          ) : (
            /* Standard Dashboard Content based on current selected tab */
            <div className="space-y-6">
              {/* MOBILE screen header */}
              <div className={`${isSimulatedMobile ? 'flex' : 'md:hidden'} items-center justify-between pb-4 border-b border-slate-100/80 mb-3 text-left`}>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Viewing Module</span>
                  <h2 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5 mt-0.5">
                    {(() => {
                      let activeItem = null;
                      for (const sec of menuSections) {
                        const found = sec.items.find(i => i.id === currentTab);
                        if (found) {
                          activeItem = found;
                          break;
                        }
                      }
                      if (activeItem) {
                        const Icon = activeItem.icon;
                        return (
                          <>
                            <Icon className={`h-4 w-4 ${
                              currentRole === 'admin' ? 'text-indigo-600' : currentRole === 'teacher' ? 'text-emerald-600' : 'text-violet-600'
                            }`} />
                            <span>{activeItem.label}</span>
                          </>
                        );
                      }
                      return (
                        <>
                          <Home className="h-4 w-4 text-indigo-600" />
                          <span>Overview Dashboard</span>
                        </>
                      );
                    })()}
                  </h2>
                </div>
                <div className="px-2.5 py-1 bg-slate-50 border border-slate-200/60 rounded-full text-[9px] font-black text-slate-500 capitalize tracking-wide shrink-0 font-mono">
                  {currentRole} Portal
                </div>
              </div>

              {/* 1. Unified Overview Dashboard */}
              {currentTab === 'dashboard' && (
                <div className="space-y-6 animate-fadeIn text-left">
                  {/* Persona-Tailored Header Hero Card */}
                  <div className={`relative rounded-3xl p-6 sm:p-8 text-white overflow-hidden border ${
                    currentRole === 'admin'
                      ? 'bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 border-indigo-950 shadow-md shadow-indigo-100/10'
                      : currentRole === 'teacher'
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-900 border-emerald-950 shadow-md shadow-emerald-100/10'
                      : 'bg-gradient-to-r from-violet-600 via-violet-700 to-fuchsia-900 border-violet-950 shadow-md shadow-violet-100/10'
                  }`}>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
                      <div className="space-y-2 max-w-2xl">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-black uppercase tracking-wider">
                          <LayoutDashboard className="h-3 w-3" />
                          <span>{currentRole} Dashboard Panel</span>
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                          {currentRole === 'admin' && "Learner's Den ERP Suite Intelligence"}
                          {currentRole === 'teacher' && `Welcome Back, ${currentUser?.name || "Instructor"}!`}
                          {currentRole === 'student' && `Welcome Back, ${currentUser?.name || "Learner"}!`}
                        </h1>
                        <p className="text-xs text-white/80 font-medium leading-relaxed">
                          {currentRole === 'admin' && "Review dynamic tuition metrics, active batch performance analytics, and manage administrative subsystems. Click any module grid element to jump directly to ERP suite."}
                          {currentRole === 'teacher' && "Monitor assigned subject batches, record shift check-ins, verify students' attendance, and deploy conceptual quizzes generated with Gemini."}
                          {currentRole === 'student' && "Challenge yourself with interactive mock examinations, clear academic doubts using the AI companion, or discover customized future options with the Career Pathfinder."}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0 bg-white/5 border border-white/10 p-4 rounded-2xl text-left min-w-[150px]">
                        <p className="text-[9px] font-black uppercase text-white/60 tracking-wider">Active Workspace</p>
                        <p className="text-base font-black capitalize tracking-tight flex items-center gap-1.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${
                            currentRole === 'admin' ? 'bg-indigo-400' : currentRole === 'teacher' ? 'bg-emerald-400' : 'bg-violet-400'
                          } animate-pulse`}></span>
                          <span>{currentRole} Portal</span>
                        </p>
                        <p className="text-[9px] text-white/50 font-bold">Synchronized in real-time</p>
                      </div>
                    </div>
                  </div>

                  {/* Highlight & Advertisement Board with scrolling Daily Remarks */}
                  <div className="space-y-4 animate-fadeIn">
                    <HighlightBoard currentUser={currentUser} currentRole={currentRole} />
                    <DailyRemarksStrip currentUser={currentUser} currentRole={currentRole} />
                  </div>

                  {/* 1. ADMIN PRESENTATION */}
                  {currentRole === 'admin' && (
                    <div className="space-y-6">
                      <StatsGrid stats={stats} />
                      
                      <BatchPerformanceChart batches={batches} students={students} grades={grades} quizzes={quizzes} />

                      {/* ERP Modules Quick Launch Center */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                          <div className="text-left">
                            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                              <LayoutGrid className="h-4.5 w-4.5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
                              <span>Coaching ERP Modules Hub (Quick Launcher)</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Click any module card below to launch the respective console directly inside the Academic ERP Suite.</p>
                          </div>
                          <button
                            onClick={() => {
                              setCurrentTab('erp-suite');
                            }}
                            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xxs font-black rounded-lg transition-all"
                          >
                            Open ERP Suite Panel
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {[
                            { id: 'admission', name: 'Admissions Office', desc: 'Enrollment & files', color: 'indigo', icon: GraduationCap },
                            { id: 'fees', name: 'Fee Ledger', desc: 'Dues & collections', color: 'emerald', icon: Wallet },
                            { id: 'library', name: 'Library Catalog', desc: 'Book issuances', color: 'cyan', icon: BookOpen },
                            { id: 'transport', name: 'GPS Bus Routes', desc: 'Bus tracking logs', color: 'amber', icon: Bus },
                            { id: 'hostel', name: 'Hostel Blocks', desc: 'Rooms allocation', color: 'rose', icon: Home },
                            { id: 'communication', name: 'SMS Broadcasts', desc: 'Parent notifications', color: 'sky', icon: Smartphone },
                          ].map(mod => {
                            const Icon = mod.icon;
                            return (
                              <button
                                key={mod.id}
                                onClick={() => {
                                  try {
                                    window.localStorage.setItem('erp_active_module', mod.id);
                                  } catch {}
                                  setActiveModule(mod.id);
                                  setCurrentTab('erp-suite');
                                }}
                                className="p-3 bg-slate-50 hover:bg-white border border-slate-150 rounded-xl text-left flex flex-col justify-between h-24 transition-all cursor-pointer hover:border-indigo-400 hover:shadow-md group relative overflow-hidden"
                              >
                                <div className={`h-8 w-8 rounded-lg bg-${mod.color}-50 text-${mod.color}-600 border border-${mod.color}-100 flex items-center justify-center shrink-0`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5 mt-2">
                                  <h4 className="font-black text-xs text-slate-800 leading-none group-hover:text-indigo-600 transition-colors truncate">{mod.name}</h4>
                                  <p className="text-[9px] text-slate-400 font-semibold truncate">{mod.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>



                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Timetable schedule timeline */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs lg:col-span-2">
                          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <Calendar className="h-4.5 w-4.5 text-indigo-600" />
                            <span>Timetable timeline</span>
                          </h3>
                          <div className="space-y-3.5 text-left">
                            {batches.map((batch, idx) => (
                              <div key={batch.id} className="flex gap-4 items-start text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                <div className={`p-2.5 rounded-xl font-extrabold flex flex-col items-center justify-center shrink-0 w-12 text-center ${
                                  idx === 0 ? 'bg-indigo-50 text-indigo-700' :
                                  idx === 1 ? 'bg-emerald-50 text-emerald-700' :
                                  idx === 2 ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'
                                }`}>
                                  <span className="text-xxs opacity-80 uppercase font-black">Room</span>
                                  <span className="text-xxs">{batch.room.split(' ')[1] || 'T1'}</span>
                                </div>
                                <div className="space-y-0.5 flex-1">
                                  <h4 className="font-bold text-slate-800">{batch.name}</h4>
                                  <p className="text-slate-500 font-medium text-xxs">Schedule: <b>{batch.schedule}</b></p>
                                  <p className="text-slate-400 text-xxs font-semibold">Teacher Code: {batch.teacherId}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Admissions Ledger */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
                          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
                            <span>Admission Ledger Activity</span>
                          </h3>
                          <div className="space-y-3 text-left">
                            {students.slice(0, 4).map((student) => (
                              <div key={student.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-150/80 flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-bold text-slate-800">{student.name}</p>
                                  <p className="text-xxs text-slate-400 mt-1 font-semibold">Admitted: {student.admissionDate}</p>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xxs font-bold border ${
                                    student.feeStatus === 'Paid'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}>
                                    {student.feeStatus}
                                  </span>
                                  <p className="text-xxs font-bold text-slate-500 mt-1.5">Paid: ₹{student.totalFeesPaid}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. TEACHER PRESENTATION */}
                  {currentRole === 'teacher' && (() => {
                    const teacherId = currentUser?.associatedId || 'teacher-1';
                    const teacherProfile = teachers.find(t => t.id === teacherId);
                    const teacherBatches = batches.filter(b => b.teacherId === teacherId);
                    const punchLogs = teacherAttendance.filter(t => t.teacherId === teacherId);
                    const latestPunch = punchLogs[0];
                    
                    return (
                      <div className="space-y-6 animate-fadeIn">
                        {/* Educator Workspace Launcher Grid */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
                          <div className="text-left mb-4 border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                              <LayoutGrid className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
                              <span>Educator Workspace Applications Launcher</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Quickly select and launch active modules from your educator suite.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                            {[
                              { id: 'teacher-timetable', name: 'Batch Schedules', desc: 'Check lecture hours & room mapping', icon: Calendar, badge: null, bg: 'from-emerald-500 to-teal-600', color: 'emerald' },
                              { id: 'teacher-attendance', name: 'Roll-Call Attendance', desc: 'Take student attendance logs', icon: UserCheck, badge: 'New', bg: 'from-teal-500 to-cyan-600', color: 'teal' },
                              { id: 'teacher-payroll', name: 'My Wage & Punch-In', desc: 'Verify worked hours & payouts', icon: Clock, badge: 'Active', bg: 'from-cyan-500 to-blue-600', color: 'cyan' },
                              { id: 'teacher-lms', name: 'Learning Center (LMS)', desc: 'Publish study sheets & notes', icon: FileText, badge: 'LMS', bg: 'from-purple-500 to-violet-600', color: 'purple' },
                              { id: 'teacher-ai', name: 'AI Quiz Builder', desc: 'Draft online tests via Gemini API', icon: BrainCircuit, badge: 'AI', bg: 'from-amber-500 to-orange-600', color: 'amber' },
                              { id: 'teacher-feedback', name: 'Student Evaluations', desc: 'Read anonymous lecturer feedbacks', icon: MessageSquare, badge: 'Rating', bg: 'from-teal-500 to-emerald-600', color: 'teal' },
                              { id: 'student-pathfinder', name: 'AI Career Pathfinder', desc: 'Discover career directions', icon: Compass, badge: 'AI', bg: 'from-sky-500 to-indigo-600', color: 'sky' },
                            ].map(mod => {
                              const Icon = mod.icon;
                              return (
                                <button
                                  key={mod.id}
                                  onClick={() => {
                                    setCurrentTab(mod.id);
                                    setActiveQuiz(null);
                                  }}
                                  className="p-4 bg-slate-50 hover:bg-white border border-slate-150 rounded-2xl text-left flex items-start gap-4 transition-all cursor-pointer hover:border-emerald-400 hover:shadow-md group relative overflow-hidden"
                                >
                                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                    <Icon className="h-6 w-6" />
                                  </div>
                                  <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="font-extrabold text-xs text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors truncate">{mod.name}</h4>
                                      {mod.badge && (
                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-150">
                                          {mod.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{mod.desc}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Quick Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xxs">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Batches</p>
                            <p className="text-xl font-black text-slate-800 mt-1">{teacherBatches.length} Classes</p>
                            <p className="text-[9px] text-slate-400 mt-1">Direct classroom cohorts</p>
                          </div>
                          
                          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xxs">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hourly Wage Scale</p>
                            <p className="text-xl font-black text-emerald-600 mt-1">₹{teacherProfile?.hourlyRate || '1,200'}/Hr</p>
                            <p className="text-[9px] text-slate-400 mt-1">Mode: {teacherProfile?.payoutType || 'Hourly'}</p>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xxs">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Punch-In Shifts logged</p>
                            <p className="text-xl font-black text-indigo-600 mt-1">{punchLogs.length} shifts</p>
                            <p className="text-[9px] text-slate-400 mt-1">Approved & pending validation</p>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xxs">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Status</p>
                            <p className="text-xl font-black text-indigo-600 mt-1 flex items-center gap-1.5">
                              <span className={`h-2.5 w-2.5 rounded-full ${latestPunch && !latestPunch.hoursWorked ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                              <span>{latestPunch && !latestPunch.hoursWorked ? 'On-Duty' : 'Checked-Out'}</span>
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1">{latestPunch && !latestPunch.hoursWorked ? `Punched in at ${latestPunch.timeIn}` : 'No active shift'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Timetable Section & Quick Shift Actions */}
                          <div className="lg:col-span-2 space-y-6">
                            {/* Attendance shift check center */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs text-left">
                              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-3">
                                <Clock className="h-4.5 w-4.5 text-emerald-600" />
                                <span>Educator Shift Punch-In Dashboard</span>
                              </h3>
                              <p className="text-[10px] text-slate-400 mb-4">Punch in from the homepage directly using QR code scanning, mock GPS, or digital wall signature.</p>
                              
                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-slate-800">
                                    {latestPunch && !latestPunch.hoursWorked ? "You are currently Punched In!" : "Ready to start your subject lecture?"}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-semibold">
                                    {latestPunch && !latestPunch.hoursWorked ? `Started at ${latestPunch.timeIn} on ${latestPunch.date}` : "Click punch in to record your subject lecture logs instantly."}
                                  </p>
                                </div>
                                
                                {latestPunch && !latestPunch.hoursWorked ? (
                                  <button
                                    onClick={() => handleTeacherPunchOut(latestPunch.id, 2)}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
                                  >
                                    Punch Out Now (2 Hrs)
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleTeacherPunchIn({
                                      teacherId,
                                      mode: 'QR',
                                      verified: true
                                    })}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
                                  >
                                    Punch In shift (QR-verified)
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Batch Schedules Timetable */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs text-left">
                              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-4">
                                <Calendar className="h-4.5 w-4.5 text-emerald-600" />
                                <span>My Subject Lecture Schedule Batches</span>
                              </h3>
                              {teacherBatches.length === 0 ? (
                                <p className="text-xxs text-slate-400 font-bold py-4 text-center border-2 border-dashed border-slate-100 rounded-xl">No batches assigned to your teacher code ({teacherId})</p>
                              ) : (
                                <div className="space-y-3">
                                  {teacherBatches.map((batch) => (
                                    <div key={batch.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-150 flex justify-between items-center text-xs">
                                      <div>
                                        <h4 className="font-bold text-slate-800">{batch.name}</h4>
                                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">Lecture Room: <b>{batch.room}</b></p>
                                      </div>
                                      <div className="text-right">
                                        <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-black text-xxs text-slate-700">{batch.schedule}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick assistant shortcuts */}
                          <div className="space-y-6 text-left">
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
                              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-4">
                                <Plus className="h-4.5 w-4.5 text-emerald-600" />
                                <span>Quick Assistant Hub</span>
                              </h3>
                              <div className="space-y-2.5">
                                <button
                                  onClick={() => setCurrentTab('teacher-attendance')}
                                  className="w-full p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left text-xs font-bold text-slate-700 flex items-center gap-3 transition-all cursor-pointer"
                                >
                                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">1</div>
                                  <span>Take Roll-Call Attendance</span>
                                </button>
                                <button
                                  onClick={() => setCurrentTab('teacher-ai')}
                                  className="w-full p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left text-xs font-bold text-slate-700 flex items-center gap-3 transition-all cursor-pointer"
                                >
                                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">2</div>
                                  <span>Draft Online Test via Gemini API</span>
                                </button>
                                <button
                                  onClick={() => setCurrentTab('teacher-lms')}
                                  className="w-full p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left text-xs font-bold text-slate-700 flex items-center gap-3 transition-all cursor-pointer"
                                >
                                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">3</div>
                                  <span>Upload PDF Study Material</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3. STUDENT PRESENTATION */}
                  {currentRole === 'student' && (() => {
                    const studentId = currentUser?.associatedId || 'student-2';
                    const activeStudentObj = students.find(s => s.id === studentId);
                    const activeStudentBatchObj = batches.find(b => b.id === activeStudentObj?.batchId);
                    const completedGrades = grades.filter(g => g.studentId === studentId);
                    
                    const studentLogs = attendance.filter(a => a.records.some(r => r.studentId === studentId));
                    const attendedCount = studentLogs.filter(a => a.records.some(r => r.studentId === studentId && r.status === 'Present')).length;
                    const attendanceRate = studentLogs.length > 0 ? Math.round((attendedCount / studentLogs.length) * 100) : 94;

                    const pendingQuizzes = quizzes.filter(q => q.batchId === activeStudentObj?.batchId && !completedGrades.some(g => g.quizId === q.id));

                    return (
                      <div className="space-y-6 animate-fadeIn">
                        {/* Student Hub Launcher Grid */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
                          <div className="text-left mb-4 border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                              <LayoutGrid className="h-4.5 w-4.5 text-violet-600 animate-pulse" />
                              <span>My Student Hub Applications Launcher</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Explore subject material, clear doubt logs, or make rapid fee transfers.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                            {[
                              { id: 'student-lms', name: 'My Study Desk (LMS)', desc: 'Access study notes & lectures', icon: BookOpen, badge: 'LMS', bg: 'from-violet-500 to-purple-600', color: 'violet' },
                              { id: 'student-ai', name: 'AI Study Companion', desc: 'Clarify subjects using AI', icon: BrainCircuit, badge: 'AI', bg: 'from-indigo-500 to-blue-600', color: 'indigo' },
                              { id: 'student-revision', name: 'Free Revision Desk', desc: 'Enroll in classes of other batches', icon: Award, badge: 'Free', bg: 'from-amber-500 to-orange-600', color: 'amber' },
                              { id: 'student-payment', name: 'Pay My Tuition Fees', desc: 'UPI transfers & receipts', icon: CreditCard, badge: 'Pay', bg: 'from-emerald-500 to-teal-600', color: 'emerald' },
                              { id: 'student-attendance', name: 'Attendance Check-In', desc: 'Punch check-ins via QR scan', icon: UserCheck, badge: 'Active', bg: 'from-amber-500 to-orange-600', color: 'amber' },
                              { id: 'student-pathfinder', name: 'AI Career Pathfinder', desc: 'Identify recommended career paths', icon: Compass, badge: 'AI', bg: 'from-sky-500 to-indigo-600', color: 'sky' },
                              { id: 'student-feedback', name: 'Lecturer Evaluation', desc: 'Evaluate demo classes & regular faculty', icon: MessageSquare, badge: 'Rate', bg: 'from-blue-500 to-indigo-600', color: 'blue' },
                              { id: 'performance-analytics', name: 'My Tests Analytics', desc: 'View test grades & rank charts', icon: TrendingUp, badge: 'Live', bg: 'from-rose-500 to-pink-600', color: 'rose' },
                            ].map(mod => {
                              const Icon = mod.icon;
                              return (
                                <button
                                  key={mod.id}
                                  onClick={() => {
                                    setCurrentTab(mod.id);
                                    setActiveQuiz(null);
                                  }}
                                  className="p-4 bg-slate-50 hover:bg-white border border-slate-150 rounded-2xl text-left flex items-start gap-4 transition-all cursor-pointer hover:border-violet-400 hover:shadow-md group relative overflow-hidden"
                                >
                                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                    <Icon className="h-6 w-6" />
                                  </div>
                                  <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="font-extrabold text-xs text-slate-800 leading-tight group-hover:text-violet-600 transition-colors truncate">{mod.name}</h4>
                                      {mod.badge && (
                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-150">
                                          {mod.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{mod.desc}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Quick Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xxs">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Attendance rate</p>
                            <p className="text-xl font-black text-violet-600 mt-1">{attendanceRate}%</p>
                            <p className="text-[9px] text-slate-400 mt-1">Goal: Keep above 85% always</p>
                          </div>
                          
                          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xxs">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Test Papers</p>
                            <p className="text-xl font-black text-rose-500 mt-1">{pendingQuizzes.length} Unfinished</p>
                            <p className="text-[9px] text-slate-400 mt-1">Immediate evaluation due</p>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xxs">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tests Taken Score</p>
                            <p className="text-xl font-black text-emerald-600 mt-1">{completedGrades.length} Solved</p>
                            <p className="text-[9px] text-slate-400 mt-1">Evaluated by active curriculum</p>
                          </div>

                          <div 
                            onClick={() => setCurrentTab('student-payment')}
                            className="bg-white border border-indigo-100 hover:border-indigo-300 rounded-2xl p-4 shadow-xxs cursor-pointer transition-all hover:shadow-xs group text-left relative overflow-hidden"
                          >
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Fee Invoicing Status</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xl font-black text-indigo-600 flex items-center gap-1.5">
                                <span className={`h-2.5 w-2.5 rounded-full ${activeStudentObj?.feeStatus === 'Paid' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                <span>{activeStudentObj?.feeStatus || 'Paid'}</span>
                              </p>
                              <span className="text-[9px] font-black text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                                <span>Manage</span>
                                <ArrowRight className="h-3 w-3" />
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">
                              {activeStudentObj?.feeStatus === 'Paid' 
                                ? 'All dues completely paid' 
                                : `₹${activeStudentObj?.totalFeesDue.toLocaleString()} outstanding dues pending`
                              }
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Left layout lists */}
                          <div className="lg:col-span-2 space-y-6">
                            {/* Class Timetable Card */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs text-left">
                              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-4">
                                <Calendar className="h-4.5 w-4.5 text-violet-600" />
                                <span>My Lecture Batch details</span>
                              </h3>
                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="space-y-1">
                                  <span className="text-[8px] font-black tracking-widest bg-violet-50 text-violet-700 px-2 py-0.5 rounded border border-violet-100 uppercase">My Cohort</span>
                                  <h4 className="text-sm font-black text-slate-800 mt-1">{activeStudentBatchObj?.name || 'JEE Elite 2026'}</h4>
                                  <p className="text-xxs text-slate-400 font-semibold">Allocated Lecture Center: {activeStudentBatchObj?.room || 'Room 102'}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Schedules</p>
                                  <p className="text-xs font-black text-slate-700 mt-0.5">{activeStudentBatchObj?.schedule || 'Mon, Wed, Fri (4:00 PM)'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Pending Interactive Exams */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs text-left">
                              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-3">
                                <BrainCircuit className="h-4.5 w-4.5 text-violet-600" />
                                <span>Outstanding Revision Practice tests</span>
                              </h3>
                              <p className="text-[10px] text-slate-400 mb-4">Solve AI and HOD developed interactive JEE/NEET test sheets right on your home dashboard.</p>
                              
                              {pendingQuizzes.length === 0 ? (
                                <p className="text-xxs text-slate-400 font-bold py-6 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/20">🎉 Double thumbs-up! All available mock tests solved completely.</p>
                              ) : (
                                <div className="space-y-3">
                                  {pendingQuizzes.slice(0, 3).map((quiz) => (
                                    <div key={quiz.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center text-xs">
                                      <div className="text-left">
                                        <p className="font-bold text-slate-800">{quiz.title}</p>
                                        <p className="text-[9px] text-slate-400 mt-1 font-semibold">Subject: <b>{quiz.subject}</b> | Time: {quiz.durationMinutes} minutes</p>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setActiveQuiz(quiz);
                                        }}
                                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xxs font-black rounded-lg transition-all cursor-pointer shadow-xs"
                                      >
                                        Launch Test
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick launcher Shortcuts */}
                          <div className="space-y-6 text-left">
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
                              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-4">
                                <Compass className="h-4.5 w-4.5 text-violet-600" />
                                <span>Co-pilot Shortcuts</span>
                              </h3>
                              <div className="space-y-2.5">
                                <button
                                  onClick={() => setCurrentTab('student-ai')}
                                  className="w-full p-3 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-xl text-left text-xs font-bold text-slate-700 flex items-center gap-3 transition-all cursor-pointer"
                                >
                                  <div className="h-7 w-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-black">1</div>
                                  <span>Clear Doubts (AI Coach)</span>
                                </button>
                                <button
                                  onClick={() => setCurrentTab('student-pathfinder')}
                                  className="w-full p-3 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-xl text-left text-xs font-bold text-slate-700 flex items-center gap-3 transition-all cursor-pointer"
                                >
                                  <div className="h-7 w-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-black">2</div>
                                  <span>Consult AI Career Advisor</span>
                                </button>
                                <button
                                  onClick={() => setCurrentTab('student-lms')}
                                  className="w-full p-3 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-xl text-left text-xs font-bold text-slate-700 flex items-center gap-3 transition-all cursor-pointer"
                                >
                                  <div className="h-7 w-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-black">3</div>
                                  <span>Open LMS Study Materials</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* SHARED REAL-TIME NOTICE BOARD BULLETIN WIDGET */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs text-left animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                          <Megaphone className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                          <span>Pinned Official Notice Board Circulars</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Stay updated with official bulletins. Mark notices as read to clear your board.</p>
                      </div>
                      <button
                        onClick={() => setCurrentTab('notice-board')}
                        className="px-3 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-lg text-xxs font-black transition-all"
                      >
                        Open Notice Board Feed
                      </button>
                    </div>

                    {notices.length === 0 ? (
                      <p className="text-xxs text-slate-400 font-bold py-6 text-center">No circulars posted on the Notice Board yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {notices.slice(0, 2).map((notice) => {
                          const hasRead = notice.acknowledgedBy?.includes(currentUser?.id || '');
                          return (
                            <div 
                              key={notice.id} 
                              className={`p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between gap-3 relative ${
                                notice.important 
                                  ? 'bg-amber-50/50 border-amber-200/80' 
                                  : 'bg-slate-50/50 border-slate-200/80'
                              }`}
                            >
                              {notice.important && (
                                <span className="absolute top-3.5 right-3.5 px-2 py-0.5 bg-amber-100 border border-amber-200 text-amber-700 font-black rounded text-[8px] uppercase tracking-wider">
                                  Pinned Alert
                                </span>
                              )}
                              
                              <div className="space-y-1">
                                <span className={`inline-block px-2 py-0.5 text-[8px] font-bold rounded uppercase ${
                                  notice.category === 'Exam' ? 'bg-rose-50 border border-rose-100 text-rose-600' :
                                  notice.category === 'Academic' ? 'bg-indigo-50 border border-indigo-100 text-indigo-600' :
                                  notice.category === 'Holiday' ? 'bg-amber-50 border border-amber-100 text-amber-600' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {notice.category} Notice
                                </span>
                                <h4 className="font-extrabold text-slate-800 pr-16">{notice.title}</h4>
                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium text-left">{notice.content}</p>
                              </div>

                              <div className="flex items-center justify-between border-t border-slate-150/60 pt-2.5 mt-1 text-[10px] font-bold text-slate-400">
                                <span>Published: {notice.date}</span>
                                <button
                                  onClick={async () => {
                                    if (currentUser) {
                                      const updatedRead = hasRead
                                        ? notice.acknowledgedBy?.filter(uid => uid !== currentUser.id) || []
                                        : [...(notice.acknowledgedBy || []), currentUser.id];
                                      await handleUpdateNotice(notice.id, { acknowledgedBy: updatedRead });
                                    }
                                  }}
                                  className={`px-2.5 py-1 border rounded-lg text-xxs font-black transition-all cursor-pointer ${
                                    hasRead
                                      ? 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                                      : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-xxs'
                                  }`}
                                >
                                  {hasRead ? "✓ Read" : "Mark Acknowledge"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Admin Students Manager */}
              {currentTab === 'admin-students' && ['admin', 'principal', 'office_staff', 'receptionist'].includes(currentRole) && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <GraduationCap className="h-5.5 w-5.5 text-indigo-600" />
                      <span>Admissions Directory Manager</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Maintain, register, enroll, and modify student registration indexes.</p>
                  </div>
                  <StudentManager
                    students={students}
                    batches={batches}
                    fees={fees}
                    onAddStudent={handleAddStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onDeleteStudent={handleDeleteStudent}
                    onCollectFees={handleCollectFees}
                  />
                </div>
              )}

              {/* 3. Admin Curriculum Manager */}
              {currentTab === 'admin-curriculum' && ['admin', 'principal', 'office_staff'].includes(currentRole) && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                      <span>Curriculum Catalog & Batch Schedules</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Manage course term values, assign teachers, and allocate lecture rooms.</p>
                  </div>
                  <CourseBatchManager
                    courses={courses}
                    batches={batches}
                    teachers={teachers}
                    onAddCourse={handleAddCourse}
                    onAddBatch={handleAddBatch}
                    onDeleteCourse={handleDeleteCourse}
                    onDeleteBatch={handleDeleteBatch}
                    onUpdateCourse={handleUpdateCourse}
                  />
                </div>
              )}

              {/* 4. Admin Instructor Directory */}
              {currentTab === 'admin-teachers' && ['admin', 'principal', 'office_staff', 'accountant'].includes(currentRole) && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-xxs gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        <span>Learner's Den Faculty Directory</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Manage subject instructors, contracts, and approve portal credentials.</p>
                    </div>
                    {adminTeachersSubTab === 'directory' && (
                      <button
                        onClick={() => {
                          setTName('');
                          setTEmail('');
                          setTPhone('');
                          setTSubject('');
                          setTBasePay('0');
                          setTHourlyRate('385');
                          setTPayoutType('Hourly');
                          setIsAddingTeacher(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Plus className="h-4 w-4" /> Register Instructor
                      </button>
                    )}
                  </div>

                  <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl border">
                    <button
                      onClick={() => setAdminTeachersSubTab('directory')}
                      className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        adminTeachersSubTab === 'directory'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Active Faculty Directory ({teachers.length})
                    </button>
                    <button
                      onClick={() => setAdminTeachersSubTab('verification')}
                      className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        adminTeachersSubTab === 'verification'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>Staff Verification & Approvals</span>
                      {users.filter(u => u.role === 'teacher' && !u.approved).length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[9px] leading-none">
                          {users.filter(u => u.role === 'teacher' && !u.approved).length}
                        </span>
                      )}
                    </button>
                  </div>

                  {adminTeachersSubTab === 'directory' && (
                    <>
                      {isAddingTeacher && (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!tName || !tEmail) return;
                            await handleAddTeacher({
                              name: tName,
                              email: tEmail,
                              phone: tPhone,
                              subject: tSubject || 'General',
                              batches: [],
                              basePay: Number(tBasePay),
                              hourlyRate: Number(tHourlyRate),
                              payoutType: tPayoutType,
                            });
                            setIsAddingTeacher(false);
                          }}
                          className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-md space-y-4 animate-fadeIn"
                        >
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Register New Instructor</h3>
                            <button
                              type="button"
                              onClick={() => setIsAddingTeacher(false)}
                              className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Instructor Name
                              </label>
                              <input
                                type="text"
                                required
                                value={tName}
                                onChange={(e) => setTName(e.target.value)}
                                placeholder="Dr. Richard Feynman"
                                className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Email Address
                              </label>
                              <input
                                type="email"
                                required
                                value={tEmail}
                                onChange={(e) => setTEmail(e.target.value)}
                                placeholder="feynman@coaching.com"
                                className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Phone Number
                              </label>
                              <input
                                type="text"
                                value={tPhone}
                                onChange={(e) => setTPhone(e.target.value)}
                                placeholder="+91 94444 88888"
                                className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Specialty / Subject
                              </label>
                              <input
                                type="text"
                                value={tSubject}
                                onChange={(e) => setTSubject(e.target.value)}
                                placeholder="Quantum Physics"
                                className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Payout Model
                              </label>
                              <select
                                value={tPayoutType}
                                onChange={(e) => setTPayoutType(e.target.value as any)}
                                className="block w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="Hourly">Hourly Rate</option>
                                <option value="Fixed">Monthly Fixed Salary</option>
                                <option value="Per-Session">Per-Session Pay</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Rate Value (INR)
                              </label>
                              <input
                                type="number"
                                required
                                value={tPayoutType === 'Fixed' ? tBasePay : tHourlyRate}
                                onChange={(e) => {
                                  if (tPayoutType === 'Fixed') {
                                    setTBasePay(e.target.value);
                                  } else {
                                    setTHourlyRate(e.target.value);
                                  }
                                }}
                                className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setIsAddingTeacher(false)}
                              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
                            >
                              Create Instructor Profile
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teachers.map((teacher) => (
                          <div 
                            key={teacher.id} 
                            onClick={() => setSelectedTeacher(teacher)}
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs flex items-start gap-4 relative group cursor-pointer hover:border-indigo-400 hover:shadow-sm transition-all"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTeacher(teacher.id);
                              }}
                              className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                              title="Remove Instructor Profile"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-bold">
                              {teacher.name.split(' ').pop()?.[0]}
                            </div>
                            <div className="space-y-1 min-w-0 pr-6">
                              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm truncate">{teacher.name}</h4>
                              <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xxs font-bold border border-emerald-150 rounded-md">
                                {teacher.subject} Specialist
                              </span>
                              <p className="text-xxs text-slate-400 font-semibold mt-2">Email: {teacher.email}</p>
                              <p className="text-xxs text-slate-400 font-semibold">Phone: {teacher.phone}</p>
                              <div className="pt-2">
                                <p className="text-xxs font-bold text-slate-500 uppercase tracking-wide">Assigned Batches</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {teacher.batches && teacher.batches.length > 0 ? (
                                    teacher.batches.map(bid => (
                                      <span key={bid} className="text-xxs bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-full font-bold">
                                        {batches.find(b => b.id === bid)?.name || bid}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">No batches assigned yet</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {adminTeachersSubTab === 'verification' && (
                    <div className="space-y-6">
                      <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl flex items-start gap-3">
                        <Info className="h-4.5 w-4.5 text-indigo-600 mt-0.5 shrink-0" />
                        <div className="text-xxs text-slate-600 space-y-1 leading-relaxed">
                          <p className="font-extrabold text-slate-700">How Faculty Verification Works</p>
                          <p>When instructors sign up via the public signup portal, their account is initialized as <span className="font-bold text-rose-600">Pending Verification</span>. They are blocked from accessing classes, inputting lessons, or logging active hours until approved below.</p>
                          <p>Verifying a teacher instantly allows them to access their portal. Their preloaded or registered subject profiles are automatically synchronized.</p>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xxs">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Instructor User Registrations</h3>
                          <span className="text-xxs font-bold text-slate-400">{users.filter(u => u.role === 'teacher').length} accounts registered</span>
                        </div>

                        {users.filter(u => u.role === 'teacher').length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-xs italic">
                            No faculty user accounts found in registry.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 text-xxxxs font-bold uppercase tracking-wider">
                                  <th className="px-5 py-3">Instructor User</th>
                                  <th className="px-5 py-3">Email Address</th>
                                  <th className="px-5 py-3">Roster Association</th>
                                  <th className="px-5 py-3">Status</th>
                                  <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {users.filter(u => u.role === 'teacher').map(user => {
                                  const associatedTeacher = teachers.find(t => t.id === user.associatedId || (t.email && user.email && t.email.toLowerCase() === user.email.toLowerCase()));
                                  return (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-5 py-4">
                                        <div className="flex items-center gap-2.5">
                                          <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs ${user.approved ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                            {user.name[0]}
                                          </div>
                                          <div>
                                            <p className="font-bold text-slate-800">{user.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">ID: {user.id}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-5 py-4 font-mono text-xxs text-slate-600">
                                        {user.email}
                                      </td>
                                      <td className="px-5 py-4">
                                        {associatedTeacher ? (
                                          <div>
                                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">
                                              Matched: {associatedTeacher.subject}
                                            </span>
                                            <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">{associatedTeacher.name}</p>
                                          </div>
                                        ) : (
                                          <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md font-bold">
                                            No profile match!
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-5 py-4">
                                        {user.approved ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-md">
                                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                                            Approved & Verified
                                          </span>
                                        ) : user.status === 'rejected' ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded-md">
                                            <XCircle className="h-3 w-3 text-rose-500" />
                                            Rejected / Terminated
                                          </span>
                                        ) : user.status === 'ignored' ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">
                                            <EyeOff className="h-3 w-3 text-slate-400" />
                                            Ignored / Deferred
                                          </span>
                                        ) : associatedTeacher?.terminated ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded-md animate-pulse">
                                            <AlertCircle className="h-3 w-3 text-rose-500" />
                                            Terminated
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded-md animate-pulse">
                                            <Lock className="h-3 w-3 text-rose-500" />
                                            Pending Verification
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-5 py-4 text-right">
                                        <div className="flex justify-end items-center gap-1.5 flex-wrap">
                                          {user.approved ? (
                                            <button
                                              onClick={() => handleToggleUserApproval(user.id, false)}
                                              className="px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-xl text-xxs font-bold transition-all cursor-pointer"
                                            >
                                              Revoke Approval
                                            </button>
                                          ) : (
                                            <>
                                              <button
                                                onClick={() => handleToggleUserApproval(user.id, true)}
                                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xxs font-black shadow-xxs transition-all cursor-pointer flex items-center gap-1 inline-flex"
                                              >
                                                <Check className="h-3 w-3" /> Approve
                                              </button>

                                              {user.status !== 'rejected' && (
                                                <button
                                                  onClick={() => handleUpdateUserStatus(user.id, 'rejected')}
                                                  className="px-2 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xxs font-bold transition-all cursor-pointer"
                                                >
                                                  Reject
                                                </button>
                                              )}

                                              {user.status !== 'ignored' && (
                                                <button
                                                  onClick={() => handleUpdateUserStatus(user.id, 'ignored')}
                                                  className="px-2 py-1.5 border border-slate-250 text-slate-500 hover:bg-slate-100 rounded-xl text-xxs font-bold transition-all cursor-pointer"
                                                >
                                                  Ignore
                                                </button>
                                              )}

                                              <button
                                                onClick={() => handleDeleteUserAccount(user.id)}
                                                className="px-2 py-1.5 bg-slate-900 text-white hover:bg-rose-600 rounded-xl text-xxs font-bold transition-all cursor-pointer"
                                              >
                                                Delete
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. Admin Financial Ledger */}
              {currentTab === 'admin-finance' && ['admin', 'principal', 'accountant'].includes(currentRole) && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-indigo-600" />
                      <span>Tuition Fees & Financials</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Track student tuition fee collections, process outstanding invoices, and issue receipts.</p>
                  </div>
                  <FeesManager 
                    fees={fees} 
                    students={students} 
                    onCollectFees={handleCollectFees} 
                    paymentSettings={paymentSettings} 
                    onUpdatePaymentSettings={handleUpdatePaymentSettings}
                    teachers={teachers}
                    teacherAttendance={teacherAttendance}
                    batches={batches}
                  />
                </div>
              )}

              {/* Admin Instructor Payroll */}
              {currentTab === 'admin-payroll' && ['admin', 'principal', 'accountant'].includes(currentRole) && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-indigo-600" />
                      <span>Instructor Faculty Payroll</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Approve instructor attendance logs, calculate dependent salary pay scales, and disburse wages.</p>
                  </div>
                  <TeacherAttendancePayroll
                    teachers={teachers}
                    batches={batches}
                    attendanceLogs={teacherAttendance}
                    currentRole={['admin', 'principal', 'accountant'].includes(currentRole) ? "admin" : "teacher"}
                    onUpdateTeacherRates={handleUpdateTeacherRates}
                    onPunchIn={handleTeacherPunchIn}
                    onPunchOut={handleTeacherPunchOut}
                    onApproveAttendance={handleApproveTeacherAttendance}
                    onAddManualLog={handleAddManualLog}
                    onDeleteLog={handleDeleteAttendanceLog}
                  />
                </div>
              )}


              {/* TEACHER PERSONA TAB VIEW COUPLINGS */}

              {/* 6. Teacher Roll-Call Attendance */}
              {currentTab === 'teacher-attendance' && currentRole === 'teacher' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-emerald-600" />
                      <span>Roll-Call attendance marking</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Perform roll-call attendance registers on running batches.</p>
                  </div>
                  <AttendanceManager
                    students={students}
                    batches={batches}
                    attendance={attendance}
                    onSaveAttendance={handleSaveAttendance}
                    leaves={leaves}
                    onUpdateLeave={handleUpdateLeave}
                  />
                </div>
              )}

              {/* Teacher My Payroll and Punch-in */}
              {currentTab === 'teacher-payroll' && currentRole === 'teacher' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <Clock className="h-5 w-5 text-emerald-600" />
                      <span>My Wage & Attendance Punch-In</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Punch in/out class shift hours via QR Wall Code, geo-fenced GPS perimeter, or manual check-in.</p>
                  </div>
                  <TeacherAttendancePayroll
                    teachers={teachers}
                    batches={batches}
                    attendanceLogs={teacherAttendance}
                    currentRole="teacher"
                    activeTeacherId={currentUser?.associatedId || "teacher-1"}
                    onUpdateTeacherRates={handleUpdateTeacherRates}
                    onPunchIn={handleTeacherPunchIn}
                    onPunchOut={handleTeacherPunchOut}
                    onApproveAttendance={handleApproveTeacherAttendance}
                    onAddManualLog={handleAddManualLog}
                    onDeleteLog={handleDeleteAttendanceLog}
                  />
                </div>
              )}

              {/* 7. Teacher Batch Timetables */}
              {currentTab === 'teacher-timetable' && currentRole === 'teacher' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                      <span>Class Timetables & Schedules</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Assigned lecture rooms, session timings, and batch syllabi tracker.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {batches.map((batch) => (
                      <div key={batch.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
                        <span className="text-xxs font-bold bg-slate-100 text-slate-500 border border-slate-200/50 px-2.5 py-1 rounded-md">
                          Batch code: {batch.id}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-3 tracking-tight">{batch.name}</h4>
                        
                        <div className="mt-4 space-y-2.5 text-xxs font-medium text-slate-500">
                          <p>Timings: <b className="text-slate-700">{batch.schedule}</b></p>
                          <p>Lecture Room: <b className="text-slate-700">{batch.room}</b></p>
                          <p>Enrolled Students: <b className="text-slate-700">{students.filter(s => s.batchId === batch.id).length} Active</b></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Digital E-Book Library Tab */}
              {currentTab === 'digital-library' && (() => {
                const activeStudentObj = students.find(s => s.id === currentUser?.associatedId);
                return (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <DigitalLibrary
                      currentRole={currentRole}
                      studentId={currentUser?.associatedId || "student-2"}
                      studentBatchId={activeStudentObj?.batchId}
                      batches={batches}
                      courses={courses}
                    />
                  </div>
                );
              })()}

              {/* 8. Teacher LMS Syllabus learningDesk */}
              {currentTab === 'teacher-lms' && currentRole === 'teacher' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      <span>Syllabus Learning Management system (LMS)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Upload textbook revisions, assign custom worksheets, and manage mock test quizzes.</p>
                  </div>
                  <LMSCenter
                    currentRole={currentRole}
                    materials={materials}
                    quizzes={quizzes}
                    batches={batches}
                    grades={grades}
                    studentId={currentUser?.associatedId || "student-2"}
                    onAddMaterial={handleAddMaterial}
                    onStartQuiz={setActiveQuiz}
                    onOpenAiQuizForm={() => setCurrentTab('teacher-ai')}
                    courses={courses}
                    onUpdateCourse={handleUpdateCourse}
                  />
                </div>
              )}

              {/* 9. Teacher AI Quiz generator */}
              {currentTab === 'teacher-ai' && currentRole === 'teacher' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <BrainCircuit className="h-5 w-5 text-emerald-600" />
                      <span>AI Mock Quiz Builder (Gemini 3.5 Flash)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Draft multiple-choice quizzes automatically from any academic topic with dynamic reasoning.</p>
                  </div>
                  <AICoach batches={batches} onGenerateQuiz={handleGenerateQuiz} initialTab="quiz" />
                </div>
              )}

              {/* Teacher Anonymous Student Evaluations */}
              {currentTab === 'teacher-feedback' && currentRole === 'teacher' && (
                <div className="space-y-6">
                  <LecturerEvaluationDesk
                    currentUser={currentUser}
                    currentRole="teacher"
                    teachers={teachers}
                    candidates={candidates}
                    evaluations={lecturerEvaluations}
                    onAddEvaluation={(newEval) => {
                      setLecturerEvaluations(prev => [newEval, ...prev]);
                    }}
                  />
                </div>
              )}


              {/* STUDENT PERSONA TAB VIEW COUPLINGS */}

              {/* 10. Student LMS Desk */}
              {currentTab === 'student-lms' && currentRole === 'student' && (() => {
                const activeStudentObj = students.find(s => s.id === currentUser?.associatedId);
                const activeStudentBatchObj = batches.find(b => b.id === activeStudentObj?.batchId);
                const activeStudentGrades = grades.filter(g => g.studentId === currentUser?.associatedId);
                return (
                  <div className="space-y-6">
                    {/* Dashboard header for Dynamic Student */}
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 text-white flex justify-between items-center shadow-lg shadow-indigo-100">
                      <div>
                        <p className="text-xxs font-bold uppercase tracking-wider text-indigo-200">Student dashboard</p>
                        <h2 className="text-xl font-extrabold mt-0.5 tracking-tight">Welcome back, {currentUser?.name || "Student"}!</h2>
                        <p className="text-xxs text-indigo-100 font-semibold mt-1">
                          Batch: <b>{activeStudentBatchObj ? activeStudentBatchObj.name : "Unassigned"}</b> | Admission Code: {currentUser?.associatedId || "N/A"}
                        </p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-2xl shrink-0 text-center border border-white/10 hidden sm:block">
                        <p className="text-xxs font-bold uppercase tracking-wider text-indigo-200">Test Scores</p>
                        <p className="text-base font-black tracking-tight mt-0.5">{activeStudentGrades.length} Taken</p>
                      </div>
                    </div>

                    <LMSCenter
                      currentRole={currentRole}
                      materials={materials}
                      quizzes={quizzes}
                      batches={batches}
                      grades={grades}
                      studentId={currentUser?.associatedId || "student-2"}
                      studentBatchId={activeStudentObj?.batchId}
                      onAddMaterial={handleAddMaterial}
                      onStartQuiz={setActiveQuiz}
                      onOpenAiQuizForm={() => {}}
                      courses={courses}
                      onUpdateCourse={handleUpdateCourse}
                    />
                  </div>
                );
              })()}

              {/* 11. Student AI Companion Copilot */}
              {currentTab === 'student-ai' && currentRole === 'student' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <BrainCircuit className="h-5.5 w-5.5 text-violet-600" />
                      <span>AI Academic Doubt Solver & Study Planner</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Clear doubt queries with detailed conceptual steps and design custom week blueprints.</p>
                  </div>
                  <AICoach batches={batches} onGenerateQuiz={handleGenerateQuiz} initialTab="doubt" />
                </div>
              )}

              {/* Student Attendance Desk */}
              {currentTab === 'student-attendance' && currentRole === 'student' && (() => {
                const activeStudentObj = students.find(s => s.id === currentUser?.associatedId);
                return (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <UserCheck className="h-5.5 w-5.5 text-indigo-600" />
                        <span>My Self-CheckIn Desk</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Punch in your daily classroom attendance using dynamic QR code generator, live-cam photo verification, and geo-fenced campus check-in logs.</p>
                    </div>
                    <StudentAttendance
                      studentId={currentUser?.associatedId || "student-2"}
                      studentBatchId={activeStudentObj?.batchId}
                      batches={batches}
                      attendance={attendance}
                      onCheckIn={handleStudentCheckIn}
                      leaves={leaves}
                      onApplyLeave={handleApplyLeave}
                    />
                  </div>
                );
              })()}

              {/* Student Fee Payment Gate */}
              {currentTab === 'student-payment' && currentRole === 'student' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <CreditCard className="h-5.5 w-5.5 text-indigo-600" />
                      <span>Online Fee Payment Gateway</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Disburse outstanding tuition balance, view payment logs, and download official PDF receipts instantly.</p>
                  </div>
                  <StudentPayment
                    studentId={currentUser?.associatedId || "student-2"}
                    studentBatchId={students.find(s => s.id === (currentUser?.associatedId || "student-2"))?.batchId}
                    batches={batches}
                    fees={fees}
                    students={students}
                    onCollectFees={handleCollectFees}
                    onTriggerNotification={triggerSimulatedNotification}
                    paymentSettings={paymentSettings}
                  />
                </div>
              )}

              {/* Student Free Revision Course Desk */}
              {currentTab === 'student-revision' && currentRole === 'student' && (() => {
                const activeStudentObj = students.find(s => s.id === currentUser?.associatedId);
                if (!activeStudentObj) return null;
                const activeStudentBatchObj = batches.find(b => b.id === activeStudentObj?.batchId);
                
                // Extract 4 digit year from batch name, default to current year
                const studentBatchYear = activeStudentBatchObj?.name.match(/\b\d{4}\b/)?.[0] || activeStudentObj?.academicYear || '2026';
                
                // Paid subjects in the foundation course
                const paidSubjects = activeStudentObj.subjectsChosen || ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
                
                // Other batches of the same year
                const otherSameYearBatches = batches.filter(b => b.id !== activeStudentObj.batchId && b.name.includes(studentBatchYear));
                
                const handleJoinRevisionBatch = async (batchId: string, subject: string) => {
                  const currentJoined = activeStudentObj.joinedRevisionBatches || [];
                  const existingBatchJoin = currentJoined.find(j => j.batchId === batchId);
                  
                  let newJoined;
                  if (existingBatchJoin) {
                    if (existingBatchJoin.joinedSubjects.includes(subject)) return;
                    newJoined = currentJoined.map(j => 
                      j.batchId === batchId 
                        ? { ...j, joinedSubjects: [...j.joinedSubjects, subject] }
                        : j
                    );
                  } else {
                    newJoined = [...currentJoined, { batchId, joinedSubjects: [subject] }];
                  }
                  
                  await handleUpdateStudent(activeStudentObj.id, {
                    joinedRevisionBatches: newJoined
                  });
                  
                  triggerSimulatedNotification(
                    `Successfully joined revision classes of ${subject} in batch "${batches.find(b => b.id === batchId)?.name}"!`,
                    "Revision Course Enrolled"
                  );
                };

                const handleLeaveRevisionBatch = async (batchId: string, subject: string) => {
                  const currentJoined = activeStudentObj.joinedRevisionBatches || [];
                  const newJoined = currentJoined.map(j => {
                    if (j.batchId === batchId) {
                      return { ...j, joinedSubjects: j.joinedSubjects.filter(s => s !== subject) };
                    }
                    return j;
                  }).filter(j => j.joinedSubjects.length > 0);

                  await handleUpdateStudent(activeStudentObj.id, {
                    joinedRevisionBatches: newJoined
                  });
                  
                  triggerSimulatedNotification(
                    `Withdrew from revision classes of ${subject} in batch "${batches.find(b => b.id === batchId)?.name}".`,
                    "Revision Class Withdrawn"
                  );
                };

                return (
                  <div className="space-y-6 animate-fadeIn text-left">
                    {/* Header Card */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-amber-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded border border-white/10">
                          Exclusive Student Benefit
                        </span>
                        <h2 className="text-xl font-extrabold tracking-tight mt-1">📚 Free Lifetime Revision Desk</h2>
                        <p className="text-xxs text-amber-50 max-w-xl leading-relaxed mt-0.5 font-semibold">
                          Current foundation students remain registered in their active batch for the <b>Class of {studentBatchYear}</b>, with the bonus option to attend lectures of new batches of the same year as revision, <b>free of cost</b>! You can join revisions only for subjects paid in your foundation course.
                        </p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-2xl border border-white/10 shrink-0 text-center">
                        <p className="text-[8px] font-black uppercase tracking-wider text-amber-100">Revision Cost</p>
                        <p className="text-sm font-black tracking-tight mt-0.5">₹0 / Free of Cost</p>
                      </div>
                    </div>

                    {/* Paid Subjects & Status Info */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
                      <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-2.5">
                        My Eligible Foundation Course Subjects
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {paidSubjects.map((sub) => (
                          <span key={sub} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-700 text-xs font-bold shadow-xxs">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                            <span>{sub} (Paid & Verified)</span>
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        * You can enroll in revision schedules for these verified subjects across any of the parallel batches below.
                      </p>
                    </div>

                    {/* New Revision Batches of Same Year */}
                    <div className="space-y-4">
                      <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-500 animate-bounce" />
                        <span>Eligible Same-Year Revision Batches (Class of {studentBatchYear})</span>
                      </h3>
                      
                      {otherSameYearBatches.length === 0 ? (
                        <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 shadow-xxs">
                          <Compass className="h-10 w-10 mx-auto opacity-30 mb-2" />
                          <p className="text-xs font-medium">No parallel active batches found for the Class of {studentBatchYear} yet.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Parallel batches are added by administrators under the Curriculum Manager.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {otherSameYearBatches.map((batch) => {
                            const joinedSubjectsForThisBatch = activeStudentObj.joinedRevisionBatches?.find(j => j.batchId === batch.id)?.joinedSubjects || [];
                            
                            return (
                              <div key={batch.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xxs transition-colors flex flex-col justify-between">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start pb-3.5 border-b border-slate-100">
                                    <div>
                                      <span className="text-[8px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-250 px-2 py-0.5 rounded">
                                        Revision Cohort
                                      </span>
                                      <h4 className="font-extrabold text-sm text-slate-800 mt-1">{batch.name}</h4>
                                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Lecture Room: <b>{batch.room}</b> | Timetable: <b>{batch.schedule}</b></p>
                                    </div>
                                    <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50/50 border border-amber-100 px-2 py-1 rounded-xl">
                                      {joinedSubjectsForThisBatch.length} Active Revisions
                                    </span>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Subject Enrollments</p>
                                    <div className="space-y-2">
                                      {paidSubjects.map((sub) => {
                                        const isJoined = joinedSubjectsForThisBatch.includes(sub);
                                        return (
                                          <div key={sub} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                                            <div className="text-left">
                                              <p className="text-xs font-bold text-slate-700">{sub}</p>
                                              <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">Tuition Credit: Foundation Paid (FREE)</p>
                                            </div>
                                            {isJoined ? (
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-emerald-600 flex items-center gap-0.5">
                                                  ✓ Enrolled
                                                </span>
                                                <button
                                                  onClick={() => handleLeaveRevisionBatch(batch.id, sub)}
                                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 text-[9px] font-black rounded-lg cursor-pointer transition-colors"
                                                >
                                                  Withdraw
                                                </button>
                                              </div>
                                            ) : (
                                              <button
                                                onClick={() => handleJoinRevisionBatch(batch.id, sub)}
                                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg cursor-pointer transition-all shadow-xxs"
                                              >
                                                Join Session
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Student Lecturer Evaluation Desk */}
              {currentTab === 'student-feedback' && currentRole === 'student' && (
                <div className="space-y-6">
                  <LecturerEvaluationDesk
                    currentUser={currentUser}
                    currentRole="student"
                    teachers={teachers}
                    candidates={candidates}
                    evaluations={lecturerEvaluations}
                    onAddEvaluation={handleAddEvaluation}
                  />
                </div>
              )}

              {/* Parent Ward Monitor */}
              {currentTab === 'parent-monitor' && currentRole === 'parent' && (
                <div className="space-y-6 animate-fadeIn">
                  <ParentMonitor
                    students={students}
                    batches={batches}
                    attendance={attendance}
                    grades={grades}
                    fees={fees}
                    notices={notices}
                    linkedWardIds={linkedWardIds}
                    onLinkWard={(studentId) => setLinkedWardIds(prev => [...prev, studentId])}
                    onUnlinkWard={(studentId) => setLinkedWardIds(prev => prev.filter(id => id !== studentId))}
                    showToast={(title, desc) => triggerSimulatedNotification(desc, title)}
                    teachers={teachers}
                    courses={courses}
                    materials={materials}
                    onCollectFees={handleCollectFees}
                  />
                </div>
              )}

              {/* Careers / Job Application Desk */}
              {currentTab === 'job-application' && currentRole === 'job_seeker' && (
                <div className="space-y-6 animate-fadeIn">
                  <JobApplication
                    jobApplications={jobApplications}
                    onAddApplication={handleAddJobApplication}
                    showToast={(title, desc) => triggerSimulatedNotification(desc, title)}
                  />
                </div>
              )}

              {/* Institution Details */}
              {currentTab === 'institution-details' && (
                <div className="space-y-6 animate-fadeIn">
                  <InstitutionDetails
                    currentUser={currentUser}
                    currentRole={currentRole}
                    profile={institutionProfile}
                    onUpdateProfile={handleUpdateInstitutionProfile}
                    isOffline={isOffline}
                    galleryItems={gallery}
                    onAddGalleryItem={(newItem) => setGallery(prev => [newItem, ...prev])}
                    onDeleteGalleryItem={(itemId) => setGallery(prev => prev.filter(item => item.id !== itemId))}
                    testimonials={testimonials}
                    onAddTestimonial={(newTesti) => setTestimonials(prev => [newTesti, ...prev])}
                    onUpdateTestimonial={(updated) => setTestimonials(prev => prev.map(t => t.id === updated.id ? updated : t))}
                    onDeleteTestimonial={(id) => setTestimonials(prev => prev.filter(t => t.id !== id))}
                  />
                </div>
              )}

              {/* Institution Gallery */}
              {currentTab === 'institution-gallery' && (
                <div className="space-y-6 animate-fadeIn">
                  <InstitutionGallery
                    currentUser={currentUser}
                    currentRole={currentRole}
                    galleryItems={gallery}
                    onAddGalleryItem={(newItem) => setGallery(prev => [newItem, ...prev])}
                    onDeleteGalleryItem={(itemId) => setGallery(prev => prev.filter(item => item.id !== itemId))}
                    showToast={(title, desc) => triggerSimulatedNotification(desc, title)}
                    isOffline={isOffline}
                  />
                </div>
              )}

              {/* AI Career Pathfinder */}
              {currentTab === 'student-pathfinder' && (
                <div className="space-y-6 animate-fadeIn">
                  <CareerPathfinder
                    students={students}
                    currentStudentId={currentUser?.associatedId || "student-2"}
                    showToast={(title, desc) => triggerSimulatedNotification(desc, title)}
                  />
                </div>
              )}

              {/* Academic ERP Suite */}
              {currentTab === 'erp-suite' && (
                <div className="space-y-6 animate-fadeIn">
                  <ErpModulesHub
                    students={students}
                    batches={batches}
                    notices={notices}
                    onAddNotice={handleAddNotice}
                    currentUser={currentUser}
                    currentRole={currentRole}
                    adminDashboardView={renderAdminDashboardContent()}
                    jobApplications={jobApplications}
                    onUpdateJobApplications={handleUpdateJobApplications}
                    candidates={candidates}
                    onUpdateCandidates={handleUpdateCandidates}
                    lecturerEvaluations={lecturerEvaluations}
                    onUpdateStudent={handleUpdateStudent}
                    activeModule={activeModule}
                    setActiveModule={setActiveModule}
                  />
                </div>
              )}

              {/* 12. Multi-Platform Control Hub */}
              {currentTab === 'platform-hub' && (
                <div className="space-y-6 animate-fadeIn">
                  <MultiPlatformHub
                    onSimulateNotification={triggerSimulatedNotification}
                    simulatedPlatform={simulatedPlatform}
                    onChangePlatform={handlePlatformChange}
                  />
                </div>
              )}

              {/* 13. System Settings & About */}
              {currentTab === 'settings' && (
                <div className="space-y-6 animate-fadeIn">
                  <SettingsManager
                    currentRole={currentRole}
                    onTriggerNotification={triggerSimulatedNotification}
                    isOffline={isOffline}
                    onClearDatabase={handleClearDatabase}
                    onSeedDatabase={handleSeedDatabase}
                    onResetStats={handleResetStats}
                  />
                </div>
              )}

              {/* Notice Board / Communication Centre */}
              {currentTab === 'notice-board' && (
                <div className="space-y-6 animate-fadeIn">
                  <CommunicationCentre
                    currentUser={currentUser}
                    currentRole={currentRole}
                  />
                </div>
              )}

              {/* Academic Calendar */}
              {currentTab === 'academic-calendar' && (
                <div className="space-y-6 animate-fadeIn">
                  <AcademicCalendar
                    currentUser={currentUser}
                    currentRole={currentRole}
                    batches={batches}
                    onTriggerNotification={triggerSimulatedNotification}
                  />
                </div>
              )}

              {/* Performance Analytics */}
              {currentTab === 'exams' && (
                <div className="space-y-6 animate-fadeIn">
                  <ExaminationSystem
                    currentRole={currentRole}
                    currentUser={currentUser}
                    students={students}
                    batches={batches}
                    onTriggerNotification={triggerSimulatedNotification}
                  />
                </div>
              )}

              {currentTab === 'performance-analytics' && (
                <div className="space-y-6 animate-fadeIn">
                  <PerformanceAnalytics
                    grades={grades}
                    students={students}
                    batches={batches}
                    quizzes={quizzes}
                    currentRole={currentRole}
                    currentUser={currentUser}
                    teachers={teachers}
                    fees={fees}
                    attendance={attendance}
                    teacherAttendance={teacherAttendance}
                    courses={courses}
                    leaves={leaves}
                  />
                </div>
              )}

              {/* Institution Testimonials Page */}
              {currentTab === 'institution-testimonials' && (
                <div className="space-y-6 animate-fadeIn">
                  <UserTestimonials
                    currentUser={currentUser}
                    testimonials={testimonials}
                    onAddTestimonial={(newTesti) => setTestimonials(prev => [newTesti, ...prev])}
                    onUpdateTestimonial={(updated) => setTestimonials(prev => prev.map(t => t.id === updated.id ? updated : t))}
                    onDeleteTestimonial={(id) => setTestimonials(prev => prev.filter(t => t.id !== id))}
                    showToast={(title, desc) => triggerSimulatedNotification(desc, title)}
                    isOffline={isOffline}
                  />
                </div>
              )}

              {/* Anonymous Feedback Desk */}
              {currentTab === 'anonymous-feedback' && (
                <div className="space-y-6 animate-fadeIn">
                  <AnonymousFeedbackDesk
                    currentUser={currentUser}
                    feedbackList={anonymousFeedback}
                    onAddFeedback={(newFb) => setAnonymousFeedback(prev => [newFb, ...prev])}
                    onUpdateFeedback={(updated) => setAnonymousFeedback(prev => prev.map(fb => fb.id === updated.id ? updated : fb))}
                    onDeleteFeedback={(id) => setAnonymousFeedback(prev => prev.filter(fb => fb.id !== id))}
                    usersList={users}
                    onRefreshUsers={() => {
                      // Fetch the updated users to reflect photo status modifications
                      fetch('/api/users')
                        .then(res => res.json())
                        .then(data => setUsers(data))
                        .catch(err => console.error("Could not refresh users roster:", err));
                    }}
                    showToast={(title, desc) => triggerSimulatedNotification(desc, title)}
                    isOffline={isOffline}
                  />
                </div>
              )}

              {/* Alumni Portal & Community */}
              {currentTab === 'alumni-portal' && (
                <div className="space-y-6 animate-fadeIn">
                  <AlumniPortal
                    students={students}
                    currentUser={currentUser}
                    currentRole={currentRole}
                    onUpdateStudent={handleUpdateStudent}
                    batches={batches}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE MORE MENU DRAWER */}
      {isMobileMoreOpen && (
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-40 transition-all duration-300 rounded-[44px]"
          onClick={() => setIsMobileMoreOpen(false)}
        />
      )}

      <div className={`absolute bottom-16 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl z-50 p-4 shadow-2xl transition-all duration-300 ease-out text-left ${
        isMobileMoreOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Coaching Suite</span>
            <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">Extended ERP & LMS Modules</h3>
          </div>
          <button 
            onClick={() => setIsMobileMoreOpen(false)}
            className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
          {(() => {
            if (currentRole === 'admin') {
              return [
                { id: 'admin-students', label: 'Admissions Directory', icon: GraduationCap, desc: 'Add & manage student enrollments' },
                { id: 'admin-curriculum', label: 'Curriculum & Batches', icon: BookOpen, desc: 'Courses, syllabi & room allocation' },
                { id: 'admin-teachers', label: 'Instructors Faculty', icon: Users, desc: 'Register leading specialist teachers' },
                { id: 'admin-payroll', label: 'Instructor Payroll', icon: IndianRupee, desc: 'Approve hours & disburse wages' },
                { id: 'admin-finance', label: 'Fees & Invoicing', icon: Wallet, desc: 'Tuition collections & receipts' },
                { id: 'academic-calendar', label: 'Academic Calendar', icon: Calendar, desc: 'Track term plans & deadlines' },
                { id: 'platform-hub', label: 'Multi-Platform PWA Hub', icon: Smartphone, desc: 'Test offline caching & sensors' }
              ];
            } else if (currentRole === 'teacher') {
              return [
                { id: 'teacher-timetable', label: 'Batch Schedules', icon: Calendar, desc: 'My assigned lectures & timings' },
                { id: 'teacher-payroll', label: 'My Wage & Punch-In', icon: Clock, desc: 'Punch shift logs & view earnings' },
                { id: 'notice-board', label: 'Communication Centre', icon: Megaphone, desc: 'Centralized multi-channel messaging & notice boards' },
                { id: 'academic-calendar', label: 'Academic Calendar', icon: Calendar, desc: 'Term events & exam dates' },
                { id: 'student-pathfinder', label: 'AI Career Pathfinder', icon: Compass, desc: 'Guide students on career choices' },
                { id: 'performance-analytics', label: 'Performance Analytics', icon: TrendingUp, desc: 'Class performance reports' },
                { id: 'platform-hub', label: 'Multi-Platform PWA Hub', icon: Smartphone, desc: 'Simulate native hardware sensors' }
              ];
            } else {
              return [
                { id: 'student-attendance', label: 'My Attendance Logs', icon: UserCheck, desc: 'Self-checkin and camera logs' },
                { id: 'student-payment', label: 'Pay My Fees', icon: CreditCard, desc: 'Tuition balances & PDF receipts' },
                { id: 'student-pathfinder', label: 'AI Career Pathfinder', icon: Compass, desc: 'Map career directions & options' },
                { id: 'academic-calendar', label: 'Academic Calendar', icon: Calendar, desc: 'Coaching holidays & mock tests' },
                { id: 'institution-details', label: 'Campus Details', icon: Info, desc: 'Contact numbers & curriculum terms' },
                { id: 'institution-gallery', label: 'Campus Gallery', icon: ImageIcon, desc: 'Browse coaching facilities photos' },
                { id: 'performance-analytics', label: 'Performance Analytics', icon: TrendingUp, desc: 'Track my mock exam scorecards' },
                { id: 'platform-hub', label: 'Multi-Platform PWA Hub', icon: Smartphone, desc: 'Installation instructions & PWA features' }
              ];
            }
          })().map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setActiveQuiz(null);
                setIsMobileMoreOpen(false);
              }}
              className={`w-full p-2 rounded-xl border text-left flex items-start gap-3 transition-all ${
                currentTab === item.id 
                  ? 'bg-slate-50 border-indigo-150 text-indigo-700 font-bold' 
                  : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentTab === item.id
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-slate-50 text-slate-500 border border-slate-100'
              }`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xxs font-extrabold text-slate-800 leading-tight">{item.label}</h4>
                <p className="text-[9px] text-slate-400 font-medium leading-normal mt-0.5 truncate">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className={`${isSimulatedMobile ? 'absolute' : 'fixed'} bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex justify-around items-center shadow-lg ${isSimulatedMobile ? 'block' : 'md:hidden block'}`}>
        {(() => {
          if (currentUser?.role === 'student' && currentUser?.approved === false) {
            return [
              { id: 'institution-details', label: 'Details', icon: Info },
              { id: 'institution-gallery', label: 'Gallery', icon: ImageIcon },
              { id: 'student-pathfinder', label: 'Pathfinder', icon: Compass },
            ];
          }

          if (currentRole === 'admin') {
            return [
              { id: 'dashboard', label: 'Home', icon: Home },
              { id: 'erp-suite', label: 'ERP Suite', icon: LayoutGrid, badge: 'ERP' },
              { id: 'performance-analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'notice-board', label: 'Notices', icon: Megaphone },
              { id: 'more-menu', label: 'More', icon: MoreHorizontal }
            ];
          } else if (currentRole === 'teacher') {
            return [
              { id: 'dashboard', label: 'Home', icon: Home },
              { id: 'teacher-attendance', label: 'Roll-Call', icon: UserCheck },
              { id: 'teacher-lms', label: 'My LMS', icon: FileText },
              { id: 'teacher-ai', label: 'AI Quiz', icon: BrainCircuit, badge: 'AI' },
              { id: 'more-menu', label: 'More', icon: MoreHorizontal }
            ];
          } else {
            return [
              { id: 'dashboard', label: 'Home', icon: Home },
              { id: 'student-lms', label: 'Study Desk', icon: BookOpen },
              { id: 'student-ai', label: 'AI Coach', icon: BrainCircuit, badge: 'AI' },
              { id: 'notice-board', label: 'Notices', icon: Megaphone },
              { id: 'more-menu', label: 'More', icon: MoreHorizontal }
            ];
          }
        })().map(tab => {
          const isSelected = tab.id === 'more-menu' ? isMobileMoreOpen : (currentTab === tab.id);
          const TabIcon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'more-menu') {
                  setIsMobileMoreOpen(!isMobileMoreOpen);
                } else {
                  setCurrentTab(tab.id);
                  setActiveQuiz(null);
                  setIsMobileMoreOpen(false);
                }
              }}
              className="flex flex-col items-center justify-center py-1 px-2.5 relative cursor-pointer min-w-[56px]"
            >
              <div className={`p-1 rounded-xl transition-all relative ${
                isSelected 
                  ? currentRole === 'admin'
                    ? 'text-indigo-600 bg-indigo-50/50'
                    : currentRole === 'teacher'
                    ? 'text-emerald-600 bg-emerald-50/50'
                    : 'text-violet-600 bg-violet-50/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}>
                <TabIcon className="h-5 w-5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white font-black text-[7px] px-1 py-0.2 rounded-full scale-90 uppercase">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[8px] font-extrabold tracking-tight mt-0.5 ${
                isSelected 
                  ? currentRole === 'admin'
                    ? 'text-indigo-600'
                    : currentRole === 'teacher'
                    ? 'text-emerald-600'
                    : 'text-violet-600'
                  : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

  if (isSimulatedMobile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-6 px-4 relative overflow-hidden font-sans">
        {renderNotifications()}
        
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Floating Switcher Toolbar */}
        <div className="mb-4 w-full max-w-[400px] bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex items-center justify-between shadow-xl relative z-40 text-xxs font-bold text-white">
          <div className="flex items-center gap-1.5 pl-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 font-extrabold uppercase tracking-wider text-[9px]">
              {simulatedPlatform === 'ios' ? 'iOS iPhone' : 'Android Pixel'} Simulator
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setSimulatedPlatform('pc')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-all"
            >
              <span>Full PC View</span>
            </button>
            <button
              onClick={() => setSimulatedPlatform(simulatedPlatform === 'ios' ? 'android' : 'ios')}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 transition-all"
            >
              <span>To {simulatedPlatform === 'ios' ? 'Android' : 'iOS'}</span>
            </button>
          </div>
        </div>

        {/* Smartphone Casing */}
        <div className="w-full max-w-[400px] bg-slate-900 rounded-[56px] p-3 shadow-2xl border-[10px] border-slate-800 relative overflow-hidden shrink-0 ring-10 ring-slate-950/40">
           {/* Camera notch details */}
           {simulatedPlatform === 'ios' ? (
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-5 w-28 bg-slate-800 rounded-b-xl z-50 flex items-center justify-center">
               <div className="h-0.5 w-10 bg-slate-700 rounded-full mb-0.5"></div>
               <div className="h-1.5 w-1.5 rounded-full bg-slate-950 ml-2"></div>
             </div>
           ) : (
             <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 h-3.5 w-3.5 bg-slate-950 border border-slate-800 rounded-full z-50"></div>
           )}

           {/* Mobile screen container */}
           <div className="bg-slate-50 rounded-[44px] overflow-hidden border border-slate-700/10 h-[710px] overflow-y-auto flex flex-col relative select-none">
              {/* Simulated OS status bar */}
              <div className="bg-white border-b border-slate-100 px-6 py-2 flex items-center justify-between text-[10px] font-black text-slate-850 shrink-0 select-none">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-extrabold uppercase tracking-wide">LTE</span>
                  <div className="h-2.5 w-5 border border-slate-850 rounded-xs p-0.5 flex items-center">
                    <div className="h-full w-full bg-slate-850 rounded-xxs"></div>
                  </div>
                </div>
              </div>

              {/* Live Web Application Viewport */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
                {!currentUser ? (
                  <Login
                    batches={batches}
                    onLoginSuccess={(u) => {
                      setCurrentUser(u);
                      setCurrentRole(u.role);
                      safeLocalStorage.setItem('erp_current_user', JSON.stringify(u));
                      if (u.role === 'admin') {
                        setCurrentTab('erp-suite');
                      } else if (u.role === 'student' && u.approved === false) {
                        setCurrentTab('institution-details');
                      } else {
                        setCurrentTab('dashboard');
                      }
                    }}
                  />
                ) : (
                  renderAppContent()
                )}
              </div>

              {/* Bottom OS Softkeys / home indicator */}
              {simulatedPlatform === 'ios' ? (
                <div className="bg-white/95 py-2.5 flex justify-center border-t border-slate-100 shrink-0">
                  <div className="h-1 w-24 bg-slate-300 rounded-full"></div>
                </div>
              ) : (
                <div className="bg-slate-950 py-2.5 px-10 flex justify-between items-center text-slate-500 border-t border-slate-850 shrink-0 text-[10px] font-bold">
                  <button onClick={handleBack} className="hover:text-slate-300">◀</button>
                  <button 
                    onClick={() => {
                      if (isHomePage()) {
                        setIsExitModalOpen(true);
                      } else {
                        if (currentRole === 'admin') {
                          setCurrentTab('erp-suite');
                        } else if (currentRole === 'parent') {
                          setCurrentTab('parent-monitor');
                        } else if (currentRole === 'job_seeker') {
                          setCurrentTab('job-application');
                        } else if (currentRole === 'student' && !isApprovedStudent) {
                          setCurrentTab('institution-details');
                        } else {
                          setCurrentTab('dashboard');
                        }
                      }
                    }} 
                    className="hover:text-slate-300"
                  >
                    ●
                  </button>
                  <button onClick={() => setCurrentTab('platform-hub')} className="hover:text-slate-300">■</button>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  // Otherwise Standard PC Fullscreen render
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
        {renderNotifications()}
        <Login
          batches={batches}
          onLoginSuccess={(u) => {
            setCurrentUser(u);
            setCurrentRole(u.role);
            safeLocalStorage.setItem('erp_current_user', JSON.stringify(u));
            if (u.role === 'admin') {
              setCurrentTab('erp-suite');
            } else if (u.role === 'student' && u.approved === false) {
              setCurrentTab('institution-details');
            } else {
              setCurrentTab('dashboard');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      {renderNotifications()}
      
      {/* Top developer navigation bar for PWA awareness */}
      <div className="bg-indigo-900 text-indigo-100 px-4 py-2 text-xxs font-bold border-b border-indigo-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-inner z-30">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded-md bg-indigo-800 text-indigo-300 border border-indigo-700 uppercase tracking-widest text-[9px]">PWA Ready</span>
          <p className="text-indigo-200">Fully responsive cross-platform web app, installable on <b>Android, iOS, & PC</b> with offline caching enabled.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-indigo-300 mr-1 hidden sm:inline">Explore simulator frames:</span>
          <button
            onClick={() => handlePlatformChange('ios')}
            className="px-2 py-0.5 bg-indigo-800 hover:bg-indigo-750 text-indigo-200 rounded-md border border-indigo-700 transition-all cursor-pointer"
          >
            📱 iOS iPhone
          </button>
          <button
            onClick={() => handlePlatformChange('android')}
            className="px-2 py-0.5 bg-indigo-800 hover:bg-indigo-750 text-indigo-200 rounded-md border border-indigo-700 transition-all cursor-pointer"
          >
            🤖 Android Pixel
          </button>
          <button
            onClick={() => {
              setCurrentTab('platform-hub');
              setActiveQuiz(null);
            }}
            className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-650 text-white rounded-md transition-all cursor-pointer font-extrabold shadow-xs"
          >
            ⚡ Open Simulator Hub
          </button>
        </div>
      </div>

      {renderAppContent()}

      {/* Universal Exit Application Confirmation Modal */}
      {isExitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-scaleIn">
            <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="h-6 w-6 text-rose-600 animate-pulse" />
            </div>
            <h3 className="text-base font-black text-slate-800 tracking-tight mb-2">Do you want to exit the application?</h3>
            <p className="text-xs text-slate-500 font-bold mb-6">Are you sure you want to terminate your current session and exit Learner's Den ERP?</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsExitModalOpen(false);
                  setHasExited(true);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-97 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Exit
              </button>
              <button
                onClick={() => setIsExitModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-97 text-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Automatic Web App Updates Notification Modal */}
      {isUpdateAvailable && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-[10000] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl animate-scaleIn">
            <div className="h-14 w-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CloudLightning className="h-7 w-7 text-indigo-600" />
            </div>
            
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600">Cloud Run Deployment Sync</span>
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight mt-1 mb-2">
              A new version of Learner's Den ERP-LMS is available.
            </h3>
            
            <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6">
              A newer container revision (<b>v{newlyDetectedVersion}</b>) has been successfully rolled out to the <b>{newlyDetectedEnv}</b> environment. 
              We highly recommend updating to ensure full component sync and performance optimizations.
            </p>

            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-left mb-6 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-bold">CURRENT VERSION:</span>
                <span className="font-mono font-bold text-slate-700">v{localStorage.getItem('app_current_version') || '1.1.2'}</span>
              </div>
              <div className="flex justify-between text-[11px] border-t border-slate-100 pt-1.5">
                <span className="text-slate-400 font-bold">LATEST VERSION:</span>
                <span className="font-mono font-bold text-indigo-600">v{newlyDetectedVersion}</span>
              </div>
              <div className="flex justify-between text-[11px] border-t border-slate-100 pt-1.5">
                <span className="text-slate-400 font-bold">UNSAVED DRAFT SAFETY:</span>
                <span className="font-semibold text-emerald-600">✓ SECURED (AUTO-STASHED)</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Save latest version info as current local version
                  localStorage.setItem('app_current_version', newlyDetectedVersion);
                  localStorage.setItem('app_build_time', new Date().toISOString().replace('T', ' ').substring(0, 16));
                  localStorage.setItem('app_environment', newlyDetectedEnv);
                  
                  // Invalidate service worker and clear all browser caches safely
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then((registrations) => {
                      for (const registration of registrations) {
                        registration.unregister();
                      }
                    });
                  }
                  
                  if ('caches' in window) {
                    caches.keys().then((names) => {
                      for (const name of names) {
                        caches.delete(name);
                      }
                    });
                  }

                  triggerSimulatedNotification('Caching layer cleared. Fetching latest compiled bundles from Cloud Run container ingress...', 'System Invalidation');
                  setIsUpdateAvailable(false);
                  
                  // Force hard reload to pull latest static bundles
                  setTimeout(() => {
                    localStorage.removeItem('app_mismatch_detected_version');
                    window.location.reload();
                  }, 1500);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-97 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md"
              >
                Update Now
              </button>
              <button
                onClick={() => setIsUpdateAvailable(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-97 text-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTeacher && (() => {
        const currentModalTeacher = teachers.find(t => t.id === selectedTeacher.id) || selectedTeacher;
        return (
          <TeacherProfileModal
            teacher={currentModalTeacher}
            onClose={() => setSelectedTeacher(null)}
            batches={batches}
            onUpdateTeacher={handleUpdateTeacher}
            attendanceLogs={teacherAttendance}
            onPunchIn={handleTeacherPunchIn}
            onPunchOut={handleTeacherPunchOut}
            onAddManualLog={handleAddManualLog}
            onDeleteLog={handleDeleteAttendanceLog}
            onApproveAttendance={handleApproveTeacherAttendance}
            simulatedRole={['admin', 'principal', 'office_staff', 'accountant'].includes(currentRole) ? 'admin' : 'teacher'}
            showToast={(title, desc) => triggerSimulatedNotification(desc, title)}
          />
        );
      })()}
    </div>
  );
}
