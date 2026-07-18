import React, { useState, useEffect } from 'react';
import {
  GraduationCap, MessageSquare, PenTool, Home, BookOpen,
  Briefcase, Award, Wallet, UploadCloud, Package,
  Library, IdCard, Coins, Smartphone, Image as ImageIcon,
  Clock, Trophy, UserCheck, Search, Bus, CheckCircle2,
  Plus, AlertCircle, Trash2, Calendar, FileText, ChevronRight, X,
  Filter, ShieldAlert, ArrowLeft, Send, Sparkles, UserPlus,
  BadgeAlert, MapPin, Sparkle, RotateCcw, LayoutDashboard,
  SlidersHorizontal, Download, Check, Barcode, BookMarked,
  Utensils, Coffee, Sun, Moon, Edit, RefreshCw, Building2
} from 'lucide-react';
import { Student, Batch, Notice } from '../types';
import StudentSelector from './StudentSelector';

const withSuspense = (LazyComponent: React.ComponentType<any>) => {
  return (props: any) => (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center p-8 min-h-[250px] space-y-3 bg-white border border-slate-100 rounded-3xl animate-pulse">
        <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">Loading Sub-Module...</span>
      </div>
    }>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

const LibraryManagement = withSuspense(React.lazy(() => import('./LibraryManagement')));
const TransportManagement = withSuspense(React.lazy(() => import('./TransportManagement')));
const SecurityCompliance = withSuspense(React.lazy(() => import('./SecurityCompliance')));
const CommunicationCentre = withSuspense(React.lazy(() => import('./CommunicationCentre')));
const ExaminationSystem = withSuspense(React.lazy(() => import('./ExaminationSystem')));

interface ErpModulesHubProps {
  students: Student[];
  batches: Batch[];
  notices: Notice[];
  onAddNotice: (notice: Omit<Notice, 'id' | 'date' | 'createdBy'>) => void;
  currentUser: any;
  currentRole?: string;
  adminDashboardView?: React.ReactNode;
  jobApplications?: any[];
  onUpdateJobApplications?: (apps: any[]) => void;
  candidates?: any[];
  onUpdateCandidates?: (candidates: any[]) => void;
  lecturerEvaluations?: any[];
  onAddStudent?: (student: Omit<Student, 'id' | 'totalFeesPaid' | 'totalFeesDue'>) => Promise<void>;
  onUpdateStudent?: (id: string, student: Partial<Student>) => Promise<void>;
  onCollectFees?: (studentId: string, amount: number, mode: string, meta?: any) => Promise<void>;
  activeModule?: string | null;
  setActiveModule?: (module: string | null) => void;
}

// Complete Mock Initial Data for all 20 modules to ensure fully interactive states
const INITIAL_HOSTEL_ROOMS = [
  { 
    id: 'h1', 
    block: 'Satpura Boys Block', 
    roomNo: '101', 
    capacity: 4, 
    occupied: 3, 
    mess: 'Veg', 
    beds: [
      { bedNo: 1, studentId: 'student-1', studentName: 'Amit Sharma' },
      { bedNo: 2, studentId: 'student-3', studentName: 'Rohan Verma' },
      { bedNo: 3, studentId: 'student-5', studentName: 'Siddharth Sen' }
    ] 
  },
  { 
    id: 'h2', 
    block: 'Satpura Boys Block', 
    roomNo: '102', 
    capacity: 4, 
    occupied: 4, 
    mess: 'Non-Veg', 
    beds: [
      { bedNo: 1, studentId: 'student-2', studentName: 'Vikram Singh' },
      { bedNo: 2, studentId: 'student-4', studentName: 'Rajesh Mishra' },
      { bedNo: 3, studentId: 'student-6', studentName: 'Kunal Sen' },
      { bedNo: 4, studentId: 'student-7', studentName: 'Manish Rawat' }
    ] 
  },
  { 
    id: 'h3', 
    block: 'Nilgiri Girls Block', 
    roomNo: '201', 
    capacity: 2, 
    occupied: 1, 
    mess: 'Veg', 
    beds: [
      { bedNo: 1, studentId: 'student-10', studentName: 'Ananya Roy' }
    ] 
  },
  { 
    id: 'h4', 
    block: 'Nilgiri Girls Block', 
    roomNo: '202', 
    capacity: 2, 
    occupied: 0, 
    mess: 'Veg', 
    beds: [] 
  },
];

const INITIAL_LESSONS = [
  { id: 'l1', subject: 'Physics', topic: 'Electrostatics & Gauss Law', batch: 'JEE Elite 2026', progress: 100, status: 'Completed' },
  { id: 'l2', subject: 'Physics', topic: 'Rotational Mechanics', batch: 'JEE Elite 2026', progress: 40, status: 'In-Progress' },
  { id: 'l3', subject: 'Chemistry', topic: 'Chemical Kinetics', batch: 'NEET Achieve 2026', progress: 85, status: 'In-Progress' },
  { id: 'l4', subject: 'Mathematics', topic: 'Calculus & Integration', batch: 'JEE Elite 2026', progress: 15, status: 'In-Progress' },
];

export interface ChapterPlan {
  id: string;
  chapter: string;
  standardPeriods: number;
  assignedPeriods: number;
  completedPeriods: number;
}

export interface SyllabusPreset {
  standard: 'Classes XI - XII' | 'Classes IX - X';
  standardPeriods: number;
  chapters: ChapterPlan[];
}

export const NEP_PRESETS: Record<string, SyllabusPreset> = {
  'Physics XII': {
    standard: 'Classes XI - XII',
    standardPeriods: 104,
    chapters: [
      { id: 'p12-1', chapter: 'Electrostatics', standardPeriods: 24, assignedPeriods: 24, completedPeriods: 24 },
      { id: 'p12-2', chapter: 'Current Electricity', standardPeriods: 18, assignedPeriods: 18, completedPeriods: 10 },
      { id: 'p12-3', chapter: 'Magnetic Effects of Current & Magnetism', standardPeriods: 22, assignedPeriods: 22, completedPeriods: 0 },
      { id: 'p12-4', chapter: 'Electromagnetic Induction & Alternating Currents', standardPeriods: 20, assignedPeriods: 20, completedPeriods: 0 },
      { id: 'p12-5', chapter: 'Electromagnetic Waves & Optics', standardPeriods: 20, assignedPeriods: 20, completedPeriods: 0 },
    ]
  },
  'Chemistry XII': {
    standard: 'Classes XI - XII',
    standardPeriods: 104,
    chapters: [
      { id: 'c12-1', chapter: 'Solutions & Electrochemistry', standardPeriods: 22, assignedPeriods: 22, completedPeriods: 22 },
      { id: 'c12-2', chapter: 'Chemical Kinetics', standardPeriods: 15, assignedPeriods: 15, completedPeriods: 12 },
      { id: 'c12-3', chapter: 'd-and-f Block Elements & Coordination Compounds', standardPeriods: 22, assignedPeriods: 22, completedPeriods: 0 },
      { id: 'c12-4', chapter: 'Haloalkanes, Haloarenes, Alcohols, Phenols & Ethers', standardPeriods: 25, assignedPeriods: 25, completedPeriods: 0 },
      { id: 'c12-5', chapter: 'Aldehydes, Ketones, Carboxylic Acids & Biomolecules', standardPeriods: 20, assignedPeriods: 20, completedPeriods: 0 },
    ]
  },
  'Mathematics XII': {
    standard: 'Classes XI - XII',
    standardPeriods: 104,
    chapters: [
      { id: 'm12-1', chapter: 'Relations and Functions & Inverse Trig', standardPeriods: 15, assignedPeriods: 15, completedPeriods: 15 },
      { id: 'm12-2', chapter: 'Algebra (Matrices & Determinants)', standardPeriods: 15, assignedPeriods: 15, completedPeriods: 15 },
      { id: 'm12-3', chapter: 'Calculus (Differential & Integral)', standardPeriods: 40, assignedPeriods: 40, completedPeriods: 8 },
      { id: 'm12-4', chapter: 'Vectors and Three-Dimensional Geometry', standardPeriods: 22, assignedPeriods: 22, completedPeriods: 0 },
      { id: 'm12-5', chapter: 'Linear Programming & Probability', standardPeriods: 12, assignedPeriods: 12, completedPeriods: 0 },
    ]
  },
  'Science X': {
    standard: 'Classes IX - X',
    standardPeriods: 80,
    chapters: [
      { id: 's10-1', chapter: 'Chemical Substances - Nature and Behaviour', standardPeriods: 25, assignedPeriods: 25, completedPeriods: 25 },
      { id: 's10-2', chapter: 'World of Living (Biology)', standardPeriods: 22, assignedPeriods: 22, completedPeriods: 18 },
      { id: 's10-3', chapter: 'Natural Phenomena (Light, Reflection, Refraction)', standardPeriods: 15, assignedPeriods: 15, completedPeriods: 0 },
      { id: 's10-4', chapter: 'Effects of Current & Natural Resources', standardPeriods: 18, assignedPeriods: 18, completedPeriods: 0 },
    ]
  },
  'Mathematics X': {
    standard: 'Classes IX - X',
    standardPeriods: 80,
    chapters: [
      { id: 'm10-1', chapter: 'Number Systems & Algebra', standardPeriods: 22, assignedPeriods: 22, completedPeriods: 22 },
      { id: 'm10-2', chapter: 'Coordinate Geometry & Geometry', standardPeriods: 18, assignedPeriods: 18, completedPeriods: 10 },
      { id: 'm10-3', chapter: 'Trigonometry & Height-Distance', standardPeriods: 12, assignedPeriods: 12, completedPeriods: 0 },
      { id: 'm10-4', chapter: 'Mensuration (Areas, Volumes)', standardPeriods: 12, assignedPeriods: 12, completedPeriods: 0 },
      { id: 'm10-5', chapter: 'Statistics & Probability', standardPeriods: 16, assignedPeriods: 16, completedPeriods: 0 },
    ]
  }
};

const INITIAL_CANDIDATES = [
  { id: 'c1', name: 'Dr. Ramesh Nair', role: 'Senior JEE Physics HOD', status: 'Demo Lecture', phone: '+91 98450 12345', experience: '12 Years' },
  { id: 'c2', name: 'Shreya Ghoshal', role: 'Chemistry Assistant Professor', status: 'Interviewing', phone: '+91 99012 34567', experience: '4 Years' },
  { id: 'c3', name: 'Amit Jha', role: 'Doubt Solver Faculty (Maths)', status: 'Offered', phone: '+91 91234 56789', experience: '2 Years' },
];

const INITIAL_EXAMS = [
  { id: 'e1', title: 'JEE Main Phase-1 Syllabus Test', date: '2026-07-15', totalMarks: 300, syllabus: 'Mechanics, Gaseous State, Coordinate Geometry' },
  { id: 'e2', title: 'NEET Botany Full length Mock', date: '2026-07-18', totalMarks: 720, syllabus: 'Plant Anatomy, Photosynthesis, Genetics' },
];

const INITIAL_INVENTORY = [
  { id: 'i1', name: 'HC Verma Concepts of Physics (Vol 1 & 2)', category: 'Books', quantity: 45, threshold: 10, status: 'Adequate', unitPrice: 450, location: 'Library Shelf A2' },
  { id: 'i2', name: 'Morrison & Boyd Organic Chemistry (7th Ed)', category: 'Books', quantity: 28, threshold: 5, status: 'Adequate', unitPrice: 850, location: 'Library Shelf B1' },
  { id: 'i3', name: 'Ergonomic Student Double Desks', category: 'Furniture', quantity: 120, threshold: 15, status: 'Adequate', unitPrice: 3200, location: 'Classroom Wing' },
  { id: 'i4', name: 'Faculty Wooden Lecture Podiums', category: 'Furniture', quantity: 12, threshold: 2, status: 'Adequate', unitPrice: 5500, location: 'Lecture Halls' },
  { id: 'i5', name: 'Binocular Light Microscopes (1000x)', category: 'Laboratory Equipment', quantity: 15, threshold: 3, status: 'Adequate', unitPrice: 12500, location: 'Biology Lab' },
  { id: 'i6', name: 'Borosilicate Glass Beakers Set (250ml)', category: 'Laboratory Equipment', quantity: 8, threshold: 20, status: 'Low Stock', unitPrice: 180, location: 'Chemistry Lab Cabinets' },
  { id: 'i7', name: 'Core i5 ThinkPad Laptops (8GB/256GB)', category: 'Computers', quantity: 24, threshold: 5, status: 'Adequate', unitPrice: 48000, location: 'Admin Desk / LMS Hub' },
  { id: 'i8', name: 'Digital Smart Boards (65 inch Touch)', category: 'Computers', quantity: 10, threshold: 2, status: 'Adequate', unitPrice: 75000, location: 'Classrooms 1-10' },
  { id: 'i9', name: 'Tournament Chess Boards & Clocks', category: 'Sports Equipment', quantity: 14, threshold: 4, status: 'Adequate', unitPrice: 1200, location: 'Recreation Room' },
  { id: 'i10', name: 'Table Tennis Table & Rackets', category: 'Sports Equipment', quantity: 2, threshold: 1, status: 'Adequate', unitPrice: 18000, location: 'Common Area' },
  { id: 'i11', name: 'Dry Erase Board Markers (Assorted Packs)', category: 'Consumables', quantity: 18, threshold: 30, status: 'Low Stock', unitPrice: 150, location: 'Stationery Store' },
  { id: 'i12', name: 'A4 High-Brightness Printing Sheets (Reams)', category: 'Consumables', quantity: 8, threshold: 25, status: 'Low Stock', unitPrice: 320, location: 'Office Copier Room' },
  { id: 'i13', name: '1.5 Ton Inverter Air Conditioners', category: 'Assets', quantity: 16, threshold: 2, status: 'Adequate', unitPrice: 38000, location: 'All Rooms' },
  { id: 'i14', name: '15kVA Silent Diesel Generator (Power Backup)', category: 'Assets', quantity: 1, threshold: 1, status: 'Adequate', unitPrice: 185000, location: 'Backyard Base' },
];

const INITIAL_BOOKS = [
  { id: 'b1', title: 'Concepts of Physics (Vol 1)', author: 'H.C. Verma', stock: 14, category: 'Physics', isbn: '978-8177091809', barcode: 'BAR-PH1', location: 'Shelf A1', price: 450 },
  { id: 'b2', title: 'Organic Chemistry (7th Ed)', author: 'Morrison & Boyd', stock: 5, category: 'Chemistry', isbn: '978-8131704813', barcode: 'BAR-CH1', location: 'Shelf B2', price: 850 },
  { id: 'b3', title: 'Advanced Problems in Mathematics', author: 'Vikas Gupta', stock: 8, category: 'Maths', isbn: '978-9381223456', barcode: 'BAR-MA1', location: 'Shelf C3', price: 650 },
];

const INITIAL_EMPLOYEES: Array<{ id: string, name: string, role: string, salary: number, email: string, contact: string, payoutType: 'Fixed' | 'Hourly' | 'Per-Session', hourlyRate: number }> = [];

const INITIAL_SMS_LOGS = [
  { id: 'sms1', template: 'Fee Reminder', date: '2026-06-28', status: 'Delivered', recipients: 45 },
  { id: 'sms2', template: 'Urgent Circular Alert', date: '2026-06-29', status: 'Delivered', recipients: 120 },
];

const INITIAL_GALLERY = [
  { id: 'g1', title: 'JEE Advanced Rankers Felicitation 2026', count: 18, url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop' },
  { id: 'g2', title: 'Physics & Chemistry Conceptual Exhibition', count: 12, url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop' },
  { id: 'g3', title: 'Classroom Deep Discussion Batches', count: 9, url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop' },
];

const INITIAL_ACHIEVEMENTS = [
  { id: 'a1', name: 'Aarav Sharma', batch: 'JEE Elite 2026', award: 'NTSE State Scholar Rank 3', date: '2026-05-12' },
  { id: 'a2', name: 'Priya Patel', batch: 'NEET Achieve 2026', award: 'State Science Fair 1st Prize Winner', date: '2026-06-04' },
];

const INITIAL_ROUTES = [
  { id: 'tr1', route: 'Route-A (Vasant Kunj - Saket Circle)', busNo: 'DL-1PB-4512', driver: 'Sukhdev Singh', phone: '+91 91122 33445', tracking: 'Stationary' },
  { id: 'tr2', route: 'Route-B (Dwarka Sector 10 - Janakpuri)', busNo: 'DL-1PC-8899', driver: 'Madan Lal', phone: '+91 91122 55667', tracking: 'Active Route' },
];

export default function ErpModulesHub({ 
  students, 
  batches, 
  notices, 
  onAddNotice, 
  currentUser, 
  currentRole,
  adminDashboardView,
  jobApplications = [],
  onUpdateJobApplications,
  candidates: passedCandidates,
  onUpdateCandidates,
  lecturerEvaluations = [],
  onAddStudent,
  onUpdateStudent,
  onCollectFees,
  activeModule: activeModuleProp,
  setActiveModule: setActiveModuleProp
}: ErpModulesHubProps) {
  const [localActiveModule, setLocalActiveModule] = useState<string | null>(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('erp_active_module') : null;
      if (stored) {
        window.localStorage.removeItem('erp_active_module');
        return stored;
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return null;
  });

  const activeModule = activeModuleProp !== undefined ? activeModuleProp : localActiveModule;
  const setActiveModule = (mod: string | null) => {
    if (setActiveModuleProp) {
      setActiveModuleProp(mod);
    } else {
      setLocalActiveModule(mod);
    }
  };

  // States for all 20 modules to make them fully functional
  // 1. Admission Management
  const [localStudents, setLocalStudents] = useState<Student[]>(students);
  
  useEffect(() => {
    setLocalStudents(students);
  }, [students]);

  // Comprehensive Admission States
  const [admSearch, setAdmSearch] = useState('');
  const [admFilterBatch, setAdmFilterBatch] = useState('all');
  const [admFilterCategory, setAdmFilterCategory] = useState('all');
  const [admFilterScheme, setAdmFilterScheme] = useState('all'); // 'all', 'ews', 'bpl'
  const [admFilterStatus, setAdmFilterStatus] = useState('all'); // 'all', 'pending', 'verified', 'enrolled', 'rejected'
  const [admSortBy, setAdmSortBy] = useState('name-az'); // 'name-az', 'name-za', 'marks-desc', 'marks-asc', 'date-desc'

  const [admActiveTab, setAdmActiveTab] = useState<'all' | 'pending' | 'verified' | 'enrolled' | 'rejected'>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Student | null>(null);
  const [isCollectingAdmFee, setIsCollectingAdmFee] = useState<Student | null>(null);
  const [admFeeAmount, setAdmFeeAmount] = useState('5000');
  const [admFeeMode, setAdmFeeMode] = useState<'Cash' | 'Card' | 'Online' | 'UPI'>('UPI');
  const [isAddingApplicant, setIsAddingApplicant] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Application Form States
  const [appFormName, setAppFormName] = useState('');
  const [appFormEmail, setAppFormEmail] = useState('');
  const [appFormPhone, setAppFormPhone] = useState('');
  const [appFormParent, setAppFormParent] = useState('');
  const [appFormParentPhone, setAppFormParentPhone] = useState('');
  const [appFormBatch, setAppFormBatch] = useState(batches[0]?.id || 'b1');
  const [appFormCategory, setAppFormCategory] = useState<'General' | 'OBC' | 'SC' | 'ST'>('General');
  const [appFormEws, setAppFormEws] = useState(false);
  const [appFormBpl, setAppFormBpl] = useState(false);
  const [appFormMarks, setAppFormMarks] = useState('85');
  const [appFormSubjects, setAppFormSubjects] = useState<string[]>(['Physics', 'Chemistry', 'Mathematics']);
  
  // Simulated File Uploads
  const [appFormDocs, setAppFormDocs] = useState<{ id: string; name: string; type: string; url: string; uploadedAt: string }[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDocType, setUploadDocType] = useState('Aadhaar Card');

  // Bulk Import State
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  
  // 2. Communication
  const [circularTitle, setCircularTitle] = useState('');
  const [circularContent, setCircularContent] = useState('');
  const [circularCategory, setCircularCategory] = useState<'General' | 'Academic' | 'Exam' | 'Event' | 'Holiday'>('General');
  const [circularTarget, setCircularTarget] = useState<'all' | 'students' | 'teachers'>('all');
  const [communicationStatus, setCommunicationStatus] = useState<string | null>(null);

  // Communication Centre Multi-Channel states
  const [commActiveTab, setCommActiveTab] = useState<'notices' | 'multi-channel' | 'sms-broadcast'>('notices');
  const [commTargetSegment, setCommTargetSegment] = useState<'individual' | 'batch' | 'staff' | 'parents'>('individual');
  const [commSelectedStudent, setCommSelectedStudent] = useState<string>(students[0]?.id || '');
  const [commSelectedBatch, setCommSelectedBatch] = useState<string>('');
  const [commCountryCode, setCommCountryCode] = useState('+91');
  const [commMobileNumber, setCommMobileNumber] = useState(students[0]?.phone || '');
  const [commSubject, setCommSubject] = useState('');
  const [commMessage, setCommMessage] = useState('');
  const [commChannels, setCommChannels] = useState<{ sms: boolean; whatsapp: boolean; email: boolean; push: boolean }>({
    sms: true,
    whatsapp: false,
    email: false,
    push: false
  });
  const [commLogs, setCommLogs] = useState<Array<{
    id: string;
    timestamp: string;
    segment: string;
    channels: string[];
    message: string;
    status: 'Delivered' | 'Pending' | 'Failed';
  }>>([
    { id: 'msg-1', timestamp: new Date(Date.now() - 3600000).toISOString(), segment: 'Batch: JEE Chemistry-A', channels: ['SMS', 'WhatsApp'], message: 'Class tomorrow will begin at 8:00 AM instead of 9:00 AM. Please arrive on time.', status: 'Delivered' },
    { id: 'msg-2', timestamp: new Date(Date.now() - 7200000).toISOString(), segment: 'Individual Student: Amit Sharma', channels: ['SMS'], message: 'Fee payment reminder: Your installment is due on 15th July.', status: 'Delivered' }
  ]);

  useEffect(() => {
    if (commSelectedStudent) {
      const stu = students.find(s => s.id === commSelectedStudent);
      if (stu) {
        setCommMobileNumber(stu.phone || '');
      }
    }
  }, [commSelectedStudent, students]);

  // 3. Daily Remarks
  const [selectedRemarkStudent, setSelectedRemarkStudent] = useState(students[0]?.id || '');
  const [remarkText, setRemarkText] = useState('');
  const [remarkLevel, setRemarkLevel] = useState<'Excellent' | 'Good' | 'Needs Improvement'>('Good');
  const [remarksHistory, setRemarksHistory] = useState<Array<{ studentName: string, text: string, level: string, date: string }>>([
    { studentName: 'Aarav Sharma', text: 'Outstanding work in Calculus mock exams.', level: 'Excellent', date: '2026-06-30' }
  ]);

  // 4. Hostel Management
  const [hostelRooms, setHostelRooms] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_hostel_rooms');
      return saved ? JSON.parse(saved) : INITIAL_HOSTEL_ROOMS;
    } catch {
      return INITIAL_HOSTEL_ROOMS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('erp_hostel_rooms', JSON.stringify(hostelRooms));
    } catch {}
  }, [hostelRooms]);

  // Expanded Hostel states
  const [hostels, setHostels] = useState<{ id: string; name: string; archived?: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem('erp_hostels');
      return saved ? JSON.parse(saved) : [
        { id: 'hblock-1', name: 'Satpura Boys Block', archived: false },
        { id: 'hblock-2', name: 'Nilgiri Girls Block', archived: false },
        { id: 'hblock-3', name: 'Aravalli Mixed Block', archived: false }
      ];
    } catch {
      return [
        { id: 'hblock-1', name: 'Satpura Boys Block', archived: false },
        { id: 'hblock-2', name: 'Nilgiri Girls Block', archived: false },
        { id: 'hblock-3', name: 'Aravalli Mixed Block', archived: false }
      ];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('erp_hostels', JSON.stringify(hostels));
    } catch {}
  }, [hostels]);

  const [messPlans, setMessPlans] = useState<{
    id: string;
    day: string;
    Breakfast: string;
    Lunch: string;
    Snacks: string;
    Dinner: string;
    archived?: boolean;
  }[]>(() => {
    try {
      const saved = localStorage.getItem('erp_mess_plans');
      return saved ? JSON.parse(saved) : [
        {
          id: 'mp-1',
          day: 'Weekday General Menu',
          Breakfast: 'Rava Idli with Coconut Chutney, Sambhar, Banana & Tea',
          Lunch: 'Jeera Rice, Chana Masala, Dal Fry, Phulka, Curd, Salad',
          Snacks: 'Vegetable Cutlet with Mint Dip & Coffee',
          Dinner: 'Methi Roti, Paneer Lababdar, Yellow Dal, Steamed Rice, Gulab Jamun',
          archived: false
        },
        {
          id: 'mp-2',
          day: 'Sunday Feast Menu',
          Breakfast: 'Aloo Paratha with White Butter, Curd & Ginger Tea',
          Lunch: 'Veg Biryani, Raita, Shahi Paneer, Garlic Naan, Salad',
          Snacks: 'Samosa with Sweet-Sour Chutney & Tea',
          Dinner: 'Jeera Rice, Butter Chicken / Dal Makhani, Tandoori Roti, Ice Cream',
          archived: false
        }
      ];
    } catch {
      return [
        {
          id: 'mp-1',
          day: 'Weekday General Menu',
          Breakfast: 'Rava Idli with Coconut Chutney, Sambhar, Banana & Tea',
          Lunch: 'Jeera Rice, Chana Masala, Dal Fry, Phulka, Curd, Salad',
          Snacks: 'Vegetable Cutlet with Mint Dip & Coffee',
          Dinner: 'Methi Roti, Paneer Lababdar, Yellow Dal, Steamed Rice, Gulab Jamun',
          archived: false
        }
      ];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('erp_mess_plans', JSON.stringify(messPlans));
    } catch {}
  }, [messPlans]);

  const [activeMessPlanId, setActiveMessPlanId] = useState<string>('mp-1');

  // Find active plan or fallback
  const activeMessPlan = messPlans.find(mp => mp.id === activeMessPlanId) || messPlans[0] || {
    id: 'mp-1',
    day: 'Fallback Menu',
    Breakfast: 'Rava Idli with Coconut Chutney, Sambhar, Banana & Tea',
    Lunch: 'Jeera Rice, Chana Masala, Dal Fry, Phulka, Curd, Salad',
    Snacks: 'Vegetable Cutlet with Mint Dip & Coffee',
    Dinner: 'Methi Roti, Paneer Lababdar, Yellow Dal, Steamed Rice, Gulab Jamun',
  };

  const [allocateStudent, setAllocateStudent] = useState(() => {
    const firstHostel = hostels.find(h => !h.archived)?.name || 'Satpura Boys Block';
    return { studentId: students[0]?.id || '', roomNo: '202', block: firstHostel, mess: 'Veg' };
  });

  // Bed transfer/swap state
  const [transferState, setTransferState] = useState<{
    studentId: string;
    targetBlock: string;
    targetRoomNo: string;
  } | null>(null);

  const [swapState, setSwapState] = useState<{
    studentAId: string;
    studentBId: string;
  } | null>(null);

  // New Hostel creation state
  const [newHostelName, setNewHostelName] = useState('');
  const [editingHostelId, setEditingHostelId] = useState<string | null>(null);
  const [editingHostelName, setEditingHostelName] = useState('');

  // New Mess creation/edit state
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({
    day: '',
    Breakfast: '',
    Lunch: '',
    Snacks: '',
    Dinner: ''
  });

  // Hostel sub-tab
  const [hostelActiveSubTab, setHostelActiveSubTab] = useState<'rooms' | 'blocks' | 'mess'>('rooms');

  // 5. Lesson Planning
  const [lessons, setLessons] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_lessons');
      return saved ? JSON.parse(saved) : INITIAL_LESSONS;
    } catch {
      return INITIAL_LESSONS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('erp_lessons', JSON.stringify(lessons));
    } catch {}
  }, [lessons]);
  const [newLessonTopic, setNewLessonTopic] = useState('');
  const [selectedLessonSubject, setSelectedLessonSubject] = useState('Physics');

  // Advanced NEP 2020 syllabus planner states
  const [lessonSubTab, setLessonSubTab] = useState<'syllabus' | 'daily'>('syllabus');
  const [selectedSyllabusPreset, setSelectedSyllabusPreset] = useState<string>('Physics XII');
  const [syllabusChapters, setSyllabusChapters] = useState<ChapterPlan[]>(() => {
    try {
      const saved = localStorage.getItem('nep_syllabus_chapters');
      if (saved) return JSON.parse(saved);
    } catch {}
    return JSON.parse(JSON.stringify(NEP_PRESETS['Physics XII'].chapters));
  });

  useEffect(() => {
    try {
      localStorage.setItem('nep_syllabus_chapters', JSON.stringify(syllabusChapters));
    } catch {}
  }, [syllabusChapters]);
  const [customClassGroup, setCustomClassGroup] = useState<'Classes XI - XII' | 'Classes IX - X'>('Classes XI - XII');
  const [customTotalPeriods, setCustomTotalPeriods] = useState<number | ''>(104);
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterPeriods, setNewChapterPeriods] = useState<number | ''>(12);

  // Smart Period Planner States
  const [isSmartPlannerOpen, setIsSmartPlannerOpen] = useState(false);
  const [smartMonths, setSmartMonths] = useState(4);
  const [smartWeeklyPeriods, setSmartWeeklyPeriods] = useState(6);
  const [smartChaptersInput, setSmartChaptersInput] = useState<string>(
    "Electrostatics\nCurrent Electricity\nElectromagnetic Induction & AC\nOptics & Light\nModern Physics"
  );
  const [smartWeights, setSmartWeights] = useState<Record<string, 'high' | 'medium' | 'low'>>({});

  // 6. Staff Recruitment
  const [internalCandidates, setInternalCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_internal_candidates');
      return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
    } catch {
      return INITIAL_CANDIDATES;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('erp_internal_candidates', JSON.stringify(internalCandidates));
    } catch {}
  }, [internalCandidates]);

  const candidates = passedCandidates || internalCandidates;
  const setCandidates = (updater: any) => {
    if (onUpdateCandidates) {
      if (typeof updater === 'function') {
        onUpdateCandidates(updater(candidates));
      } else {
        onUpdateCandidates(updater);
      }
    } else {
      if (typeof updater === 'function') {
        setInternalCandidates(updater);
      } else {
        setInternalCandidates(updater);
      }
    }
  };
  const [newCandidate, setNewCandidate] = useState({ name: '', role: 'Senior Physics Mentor', experience: '5 Years', phone: '', resumeName: '' });
  const [recruitmentFilter, setRecruitmentFilter] = useState<'all' | 'online' | 'internal'>('all');
  const [viewingCvCandidate, setViewingCvCandidate] = useState<any | null>(null);
  const [recruitmentSubTab, setRecruitmentSubTab] = useState<'pipeline' | 'demo_feedback'>('pipeline');

  // 7. Examination & CCE
  const [exams, setExams] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_exams');
      return saved ? JSON.parse(saved) : INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('erp_exams', JSON.stringify(exams));
    } catch {}
  }, [exams]);
  const [newExam, setNewExam] = useState({ title: '', date: '', totalMarks: 100, syllabus: '' });

  // 8. Fee Management
  const [feeStatus, setFeeStatus] = useState({ totalReceived: 1450000, totalPending: 350000 });
  const [feeCollector, setFeeCollector] = useState({ studentId: students[0]?.id || '', amountPaid: 15000, mode: 'UPI' as 'Cash' | 'Card' | 'Online' | 'UPI' });
  const [collectedReceipts, setCollectedReceipts] = useState<Array<{ studentName: string, amount: number, mode: string, date: string, receiptNo: string }>>([]);

  // 9. Homework Assignments
  const [homeworks, setHomeworks] = useState([
    { id: 'hw1', subject: 'Mathematics', title: 'Worksheet on Indefinite Integrals', deadline: '2026-07-03', batch: 'JEE Elite 2026' },
    { id: 'hw2', subject: 'Physics', title: 'Mechanics Friction Solved Numerical Sets', deadline: '2026-07-05', batch: 'JEE Elite 2026' },
  ]);
  const [newHomework, setNewHomework] = useState({ subject: 'Mathematics', title: '', deadline: '', batchId: 'b1' });

  // 10. Inventory Management
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_inventory');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('erp_inventory', JSON.stringify(inventory));
    } catch {}
  }, [inventory]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([
    { id: 'm1', itemId: 'i8', itemName: 'Digital Smart Boards (65 inch Touch)', issue: 'Calibration & touch dead-zones on Screen B', cost: 3500, scheduledDate: '2026-07-10', technicianName: 'Vikas Tech Solutions', technicianPhone: '+91 98111 22233', status: 'In Progress' as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled', notes: '' },
    { id: 'm2', itemId: 'i13', itemName: '1.5 Ton Inverter Air Conditioners', issue: 'Gas refilling & general coil servicing', cost: 4500, scheduledDate: '2026-07-12', technicianName: 'CoolAir Aircons', technicianPhone: '+91 98555 66677', status: 'Scheduled' as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled', notes: '' },
    { id: 'm3', itemId: 'i7', itemName: 'Core i5 ThinkPad Laptops (8GB/256GB)', issue: 'Battery swap & storage expansion', cost: 8000, scheduledDate: '2026-07-01', technicianName: 'Lenovo Service Center', technicianPhone: '+91 99999 11111', status: 'Completed' as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled', notes: 'Completed within 24 hrs. Standard warranty coverage.' }
  ]);
  const [inventoryActiveSubTab, setInventoryActiveSubTab] = useState<'items' | 'maintenance' | 'analytics'>('items');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('All');
  const [isAddingInventoryItem, setIsAddingInventoryItem] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState({
    name: '',
    category: 'Books',
    quantity: 10,
    threshold: 5,
    unitPrice: 500,
    location: ''
  });
  const [isSchedulingMaintenance, setIsSchedulingMaintenance] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    itemId: 'i1',
    issue: '',
    cost: 1500,
    scheduledDate: new Date().toISOString().split('T')[0],
    technicianName: '',
    technicianPhone: '',
    status: 'Scheduled' as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled',
    notes: ''
  });

  // 11. Library Management is managed internally by the modular <LibraryManagement /> component.

  // 12. Employee Information
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_employees');
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('erp_employees', JSON.stringify(employees));
    } catch {}
  }, [employees]);
  const [newEmployee, setNewEmployee] = useState<{ name: string; role: string; salary: number; email: string; contact: string; payoutType: 'Fixed' | 'Hourly' | 'Per-Session'; hourlyRate: number }>({ name: '', role: '', salary: 50000, email: '', contact: '', payoutType: 'Fixed', hourlyRate: 385 });

  // 13. Payroll Management
  const [payrollStatus, setPayrollStatus] = useState<string | null>(null);

  // 14. Mobile SMS
  const [smsLogs, setSmsLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_sms_logs');
      return saved ? JSON.parse(saved) : INITIAL_SMS_LOGS;
    } catch {
      return INITIAL_SMS_LOGS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('erp_sms_logs', JSON.stringify(smsLogs));
    } catch {}
  }, [smsLogs]);

  const [smsTemplate, setSmsTemplate] = useState('Absent Alert');
  const [smsCustomText, setSmsCustomText] = useState('Dear Parent, your ward was absent in today\'s JEE Main Batch call. Contact Learner\'s Den Admin.');

  // 15. Student Image Gallery
  const [gallery, setGallery] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_gallery');
      return saved ? JSON.parse(saved) : INITIAL_GALLERY;
    } catch {
      return INITIAL_GALLERY;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('erp_gallery', JSON.stringify(gallery));
    } catch {}
  }, [gallery]);

  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // 16. Employee Attendance
  const [employeeAttendanceLogs, setEmployeeAttendanceLogs] = useState([
    { id: 'ea1', name: 'Prof. Alok Tripathi', status: 'Present', punchIn: '08:45 AM', date: '2026-07-01' },
    { id: 'ea2', name: 'Rashmi Verma', status: 'Present', punchIn: '09:00 AM', date: '2026-07-01' },
  ]);

  // 17. Student Achievements
  const [achievements, setAchievements] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_achievements');
      return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('erp_achievements', JSON.stringify(achievements));
    } catch {}
  }, [achievements]);

  const [newAchievement, setNewAchievement] = useState({ name: '', award: '', date: '' });

  // 18. Student Attendance
  const [studentAttendanceRecord, setStudentAttendanceRecord] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({
    'student-1': 'Present',
    'student-2': 'Present',
  });

  // 19. Student Information
  const [searchStudentTerm, setSearchStudentTerm] = useState('');

  // 20. Transport Management
  const [routes, setRoutes] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_routes');
      return saved ? JSON.parse(saved) : INITIAL_ROUTES;
    } catch {
      return INITIAL_ROUTES;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('erp_routes', JSON.stringify(routes));
    } catch {}
  }, [routes]);

  // General Notification Trigger helper
  const [activeToast, setActiveToast] = useState<{ title: string; desc: string; type: 'success' | 'info' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'info' = 'success') => {
    setActiveToast({ title, desc, type });
    setTimeout(() => setActiveToast(null), 3500);
  };

  // Icon Mapping dictionary
  const MODULES_LIST = [
    { id: 'dashboard', label: 'Overview Dashboard', desc: 'Review tuition metrics, batch analytics, and system statistics', icon: LayoutDashboard, color: 'bg-indigo-600 text-white' },
    { id: 'admission', label: 'Admission Management', desc: 'Manage enrollment applications and admit students', icon: GraduationCap, color: 'bg-blue-650 text-white' },
    { id: 'communication', label: 'Communication Console', desc: 'Publish announcements, alerts & circulars', icon: MessageSquare, color: 'bg-blue-600 text-white' },
    { id: 'remarks', label: 'Daily Remarks Desk', desc: 'Add academic remarks & performance reviews', icon: PenTool, color: 'bg-cyan-600 text-white' },
    { id: 'hostel', label: 'Hostel Management', desc: 'Rooms allotment and hostel mess logistics', icon: Home, color: 'bg-indigo-600 text-white' },
    { id: 'lesson', label: 'Lesson Planning', desc: 'Syllabus completion plans and daily teaching logs', icon: BookOpen, color: 'bg-sky-600 text-white' },
    { id: 'recruitment', label: 'Staff Recruitment', desc: 'Applicant tracking, demo lectures & screening', icon: Briefcase, color: 'bg-blue-600 text-white' },
    { id: 'exam', label: 'Examination & CCE', desc: 'Schedules, grade boundaries & continuous rating', icon: Award, color: 'bg-cyan-600 text-white' },
    { id: 'fees', label: 'Fee Management Console', desc: 'Dues calculation, transaction logging & receipts', icon: Wallet, color: 'bg-indigo-600 text-white' },
    { id: 'homework', label: 'Homework Assignments', desc: 'Publish worksheets, syllabus tasks & tracking', icon: UploadCloud, color: 'bg-sky-600 text-white' },
    { id: 'inventory', label: 'Inventory Management', desc: 'Track assets, smart boards and classroom items', icon: Package, color: 'bg-blue-600 text-white' },
    { id: 'library', label: 'Library Management', desc: 'Rent/Issue physics, maths textbooks & logs', icon: Library, color: 'bg-cyan-600 text-white' },
    { id: 'employee', label: 'Employee Information', desc: 'Admin, staff and educator credentials list', icon: IdCard, color: 'bg-indigo-600 text-white' },
    { id: 'payroll', label: 'Payroll Management', desc: 'Calculate base salaries, bonus and payslips', icon: Coins, color: 'bg-sky-600 text-white' },
    { id: 'gallery', label: 'Student Image Gallery', desc: 'Campus achievements, event memories & albums', icon: ImageIcon, color: 'bg-cyan-600 text-white' },
    { id: 'emp_attendance', label: 'Employee Attendance', desc: 'Punch logs and leave approvals for staff', icon: Clock, color: 'bg-indigo-600 text-white' },
    { id: 'achievements', label: 'Student Achievements', desc: 'NTSE, JEE and State board toppers honor roll', icon: Trophy, color: 'bg-sky-600 text-white' },
    { id: 'student_attendance', label: 'Student Attendance Tracker', desc: 'Take roll call by batch & review check-ins', icon: UserCheck, color: 'bg-blue-600 text-white' },
    { id: 'student_info', label: 'Student Information lookup', desc: 'Advanced profile finder with academic indices', icon: Search, color: 'bg-cyan-600 text-white' },
    { id: 'transport', label: 'Transport Management', desc: 'Manage GPS school bus routes and drivers', icon: Bus, color: 'bg-indigo-600 text-white' },
    { id: 'security', label: 'Security & Governance', desc: 'Manage JWT lifecycle, RBAC, WAF input sanitizers & backups', icon: ShieldAlert, color: 'bg-emerald-600 text-white' }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {activeToast && (
        <div className="fixed top-6 right-6 z-[9999] max-w-sm w-full bg-slate-900 border border-slate-700 text-white rounded-2xl p-4 shadow-2xl animate-bounce flex gap-3">
          <div className="h-8 w-8 bg-indigo-500/10 text-indigo-400 border border-indigo-400/20 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h5 className="text-xs font-black">{activeToast.title}</h5>
            <p className="text-[10px] text-slate-350 mt-0.5 leading-relaxed font-semibold">{activeToast.desc}</p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      {!activeModule ? (
        <div className="relative bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xxs overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1.5 max-w-xl text-left">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                <Sparkle className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} /> Learner's Den ERP Suite
              </span>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Academic ERP Control Center
              </h1>
              <p className="text-xs text-slate-400">
                Unlock all 20 modules to administer admissions, library systems, transport lines, hostel blocks, and payroll operations. Select any grid feature below to launch.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl shrink-0 text-left">
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400">System Modules</p>
                <p className="text-lg font-black text-indigo-600">20 / 20 Active</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400">Database Connection</p>
                <p className="text-lg font-black text-emerald-600">Sync Live</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200 rounded-2xl p-4">
          <button
            onClick={() => setActiveModule(null)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to ERP Operations
          </button>
          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Module: {MODULES_LIST.find(m => m.id === activeModule)?.label}
          </span>
        </div>
      )}

      {/* 20 MODULES MAIN GRID VIEW */}
      {!activeModule && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {MODULES_LIST.map((mod) => {
              const IconComp = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className="bg-white border border-slate-150 rounded-2xl p-4 hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 transition-all text-center flex flex-col items-center justify-center space-y-3 cursor-pointer group"
                >
                  <div className={`h-12 w-12 rounded-full ${mod.color} shadow-md group-hover:scale-105 transition-transform flex items-center justify-center`}>
                    <IconComp className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                      {mod.label}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                      {mod.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAILED INTERACTIVE CONTROL PANELS FOR EACH OF THE 20 FEATURES */}

      {/* 0. Overview Dashboard */}
      {activeModule === 'dashboard' && adminDashboardView && (
        <div className="animate-fadeIn">
          {adminDashboardView}
        </div>
      )}

      {/* 1. Admission Management */}
      {activeModule === 'admission' && (() => {
        // Stats calculations
        const totalRegistered = localStudents.length;
        const totalPending = localStudents.filter(s => s.approved === false && s.feeStatus !== 'Overdue').length;
        const totalVerified = localStudents.filter(s => s.approved === true && s.totalFeesPaid === 0).length;
        const totalEnrolled = localStudents.filter(s => s.approved === true && s.totalFeesPaid > 0).length;
        const totalEws = localStudents.filter(s => s.ewsStatus).length;
        const totalBpl = localStudents.filter(s => s.bplStatus).length;

        // Filtering
        const filteredApplicants = localStudents.filter(student => {
          const matchesSearch = 
            student.name.toLowerCase().includes(admSearch.toLowerCase()) ||
            student.email.toLowerCase().includes(admSearch.toLowerCase()) ||
            student.phone.toLowerCase().includes(admSearch.toLowerCase()) ||
            (student.id || '').toLowerCase().includes(admSearch.toLowerCase());
            
          const matchesBatch = admFilterBatch === 'all' || student.batchId === admFilterBatch;
          const matchesCategory = admFilterCategory === 'all' || student.category === admFilterCategory;
          
          const matchesScheme = admFilterScheme === 'all' || 
            (admFilterScheme === 'ews' && student.ewsStatus) ||
            (admFilterScheme === 'bpl' && student.bplStatus);
            
          // Status filters
          const isPending = student.approved === false && student.feeStatus !== 'Overdue';
          const isVerified = student.approved === true && student.totalFeesPaid === 0;
          const isEnrolled = student.approved === true && student.totalFeesPaid > 0;
          const isRejected = student.approved === false && student.feeStatus === 'Overdue';

          let matchesStatus = true;
          if (admFilterStatus === 'pending') matchesStatus = isPending;
          else if (admFilterStatus === 'verified') matchesStatus = isVerified;
          else if (admFilterStatus === 'enrolled') matchesStatus = isEnrolled;
          else if (admFilterStatus === 'rejected') matchesStatus = isRejected;

          // Tab active stage filter
          let matchesTab = true;
          if (admActiveTab === 'pending') matchesTab = isPending;
          else if (admActiveTab === 'verified') matchesTab = isVerified;
          else if (admActiveTab === 'enrolled') matchesTab = isEnrolled;
          else if (admActiveTab === 'rejected') matchesTab = isRejected;

          return matchesSearch && matchesBatch && matchesCategory && matchesScheme && matchesStatus && matchesTab;
        });

        // Sorting
        const sortedApplicants = [...filteredApplicants].sort((a, b) => {
          if (admSortBy === 'name-az') {
            return a.name.localeCompare(b.name);
          } else if (admSortBy === 'name-za') {
            return b.name.localeCompare(a.name);
          } else if (admSortBy === 'marks-desc') {
            return (b.previousClassPercentage || 0) - (a.previousClassPercentage || 0);
          } else if (admSortBy === 'marks-asc') {
            return (a.previousClassPercentage || 0) - (b.previousClassPercentage || 0);
          } else if (admSortBy === 'date-desc') {
            return (b.admissionDate || '').localeCompare(a.admissionDate || '');
          }
          return 0;
        });

        // Online applicant submission
        const handleAddApplication = async () => {
          if (!appFormName || !appFormEmail || !appFormPhone) {
            alert("Please fill in Applicant Name, Email, and Phone Number.");
            return;
          }
          
          const batch = batches.find(b => b.id === appFormBatch);
          
          const newApp: Omit<Student, 'id' | 'totalFeesPaid' | 'totalFeesDue'> & { id?: string; approved: boolean; ewsStatus: boolean; bplStatus: boolean; category: 'General' | 'OBC' | 'SC' | 'ST'; previousClassPercentage: number; documents: any[]; subjectsChosen: string[]; feeStatus: 'Paid' | 'Pending' | 'Overdue'; parentPhone: string; } = {
            name: appFormName,
            email: appFormEmail,
            phone: appFormPhone,
            parentName: appFormParent,
            parentPhone: appFormParentPhone,
            batchId: appFormBatch,
            admissionDate: new Date().toISOString().split('T')[0],
            feeStatus: 'Pending',
            approved: false, // Pending verification
            ewsStatus: appFormEws,
            bplStatus: appFormBpl,
            category: appFormCategory,
            previousClassPercentage: Number(appFormMarks) || 85,
            documents: appFormDocs,
            subjectsChosen: appFormSubjects,
          };

          if (onAddStudent) {
            try {
              await onAddStudent(newApp);
              showToast("Application Received", `${appFormName}'s enrollment request is now lodged under candidate review workflow.`);
            } catch (err) {
              const localNew: Student = {
                id: `student-temp-${Date.now()}`,
                totalFeesPaid: 0,
                totalFeesDue: 15000,
                ...newApp
              };
              setLocalStudents(prev => [localNew, ...prev]);
              showToast("Application Lodged (Local)", `${appFormName}'s profile queued successfully.`);
            }
          } else {
            const localNew: Student = {
              id: `student-temp-${Date.now()}`,
              totalFeesPaid: 0,
              totalFeesDue: 15000,
              ...newApp
            };
            setLocalStudents(prev => [localNew, ...prev]);
            showToast("Application Lodged (Sandbox)", `${appFormName}'s profile queued successfully.`);
          }

          // Reset Form fields
          setAppFormName('');
          setAppFormEmail('');
          setAppFormPhone('');
          setAppFormParent('');
          setAppFormParentPhone('');
          setAppFormEws(false);
          setAppFormBpl(false);
          setAppFormDocs([]);
          setIsAddingApplicant(false);
        };

        // Review & Verification Approval
        const handleVerifyApplicant = async (studentId: string, approve: boolean) => {
          const updatedFields = {
            approved: approve,
            feeStatus: approve ? 'Pending' as const : 'Overdue' as const, // mark rejected as Pending but denied
          };
          if (onUpdateStudent) {
            try {
              await onUpdateStudent(studentId, updatedFields);
              showToast(
                approve ? "Candidate Verified" : "Application Rejected",
                approve ? "Student documents verified. Account unlocked and shifted to enrollment fee collection." : "Application files marked rejected."
              );
            } catch (err) {
              setLocalStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updatedFields } : s));
              showToast("Verified locally (Sandbox)", "Applicant status updated successfully.");
            }
          } else {
            setLocalStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updatedFields } : s));
            showToast("Verified locally (Sandbox)", "Applicant status updated successfully.");
          }
          setSelectedApplicant(null);
        };

        // Fee collection & Formal Enrollment
        const handleCollectEnrollmentFee = async () => {
          if (!isCollectingAdmFee) return;
          const amount = Number(admFeeAmount) || 5000;
          
          if (onCollectFees) {
            try {
              await onCollectFees(isCollectingAdmFee.id, amount, admFeeMode, { receiptType: 'Enrollment Admission Fee' });
              if (onUpdateStudent) {
                await onUpdateStudent(isCollectingAdmFee.id, {
                  totalFeesPaid: (isCollectingAdmFee.totalFeesPaid || 0) + amount,
                  totalFeesDue: Math.max(0, (isCollectingAdmFee.totalFeesDue || 15000) - amount),
                  feeStatus: 'Paid'
                });
              }
              showToast("Enrollment Complete", `Logged ₹${amount} fee collection via ${admFeeMode}. Candidate is now fully admitted in batch!`);
            } catch (err) {
              setLocalStudents(prev => prev.map(s => s.id === isCollectingAdmFee.id ? {
                ...s,
                totalFeesPaid: (s.totalFeesPaid || 0) + amount,
                totalFeesDue: Math.max(0, (s.totalFeesDue || 15000) - amount),
                feeStatus: 'Paid'
              } : s));
              showToast("Payment Recorded (Sandbox)", "Admissions payment saved locally.");
            }
          } else {
            setLocalStudents(prev => prev.map(s => s.id === isCollectingAdmFee.id ? {
              ...s,
              totalFeesPaid: (s.totalFeesPaid || 0) + amount,
              totalFeesDue: Math.max(0, (s.totalFeesDue || 15000) - amount),
              feeStatus: 'Paid'
            } : s));
            showToast("Payment Recorded (Sandbox)", "Admissions payment saved locally.");
          }
          setIsCollectingAdmFee(null);
        };

        // Export Actions
        const handleExportCSV = () => {
          const headers = ["Admission ID", "Name", "Email", "Phone", "Category", "EWS Status", "BPL Status", "Batch Choice", "Marks %", "Date", "Status"];
          const rows = sortedApplicants.map(s => {
            let statusStr = "Pending";
            if (s.approved && s.totalFeesPaid > 0) statusStr = "Enrolled";
            else if (s.approved) statusStr = "Verified";
            else if (s.feeStatus === 'Overdue') statusStr = "Rejected";
            
            return [
              s.id,
              s.name,
              s.email,
              s.phone,
              s.category || 'General',
              s.ewsStatus ? 'Yes' : 'No',
              s.bplStatus ? 'Yes' : 'No',
              batches.find(b => b.id === s.batchId)?.name || 'N/A',
              s.previousClassPercentage || 85,
              s.admissionDate,
              statusStr
            ];
          });

          const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
          
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", `admissions_log_${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast("Export Successful", "Admission database logs generated and downloaded as CSV.");
        };

        const handleExportJSON = () => {
          const jsonStr = JSON.stringify(sortedApplicants, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `admissions_data_${new Date().toISOString().split('T')[0]}.json`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast("Export Successful", "Database exported cleanly in structured JSON format.");
        };

        // Simulated file upload triggers
        const triggerSimulatedUpload = () => {
          if (isUploadingDoc) return;
          setIsUploadingDoc(true);
          setUploadProgress(10);
          
          const interval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                  const newDoc = {
                    id: `doc-${Date.now()}`,
                    name: `${uploadDocType} - Simulated`,
                    type: 'pdf',
                    url: '#',
                    uploadedAt: new Date().toISOString().split('T')[0]
                  };
                  setAppFormDocs(d => [...d, newDoc]);
                  setIsUploadingDoc(false);
                  setUploadProgress(0);
                }, 400);
                return 100;
              }
              return prev + 30;
            });
          }, 200);
        };

        const handleBulkImport = async () => {
          try {
            const parsed = JSON.parse(bulkImportText);
            if (!Array.isArray(parsed)) {
              alert("Bulk import data must be an array of applicant objects.");
              return;
            }

            let count = 0;
            for (const item of parsed) {
              if (!item.name || !item.email) continue;
              
              const newApp = {
                name: item.name,
                email: item.email,
                phone: item.phone || '+91 99999 00000',
                parentName: item.parentName || 'Parent Guardian',
                parentPhone: item.parentPhone || '+91 99999 11111',
                batchId: item.batchId || batches[0]?.id || 'b1',
                admissionDate: item.admissionDate || new Date().toISOString().split('T')[0],
                feeStatus: item.feeStatus || 'Pending',
                approved: item.approved !== undefined ? item.approved : false,
                ewsStatus: !!item.ewsStatus,
                bplStatus: !!item.bplStatus,
                category: item.category || 'General',
                previousClassPercentage: Number(item.previousClassPercentage) || 85,
                documents: item.documents || [],
                subjectsChosen: item.subjectsChosen || ['Physics', 'Chemistry', 'Mathematics']
              };

              if (onAddStudent) {
                await onAddStudent(newApp);
              } else {
                const localNew: Student = {
                  id: `student-import-${Date.now()}-${count}`,
                  totalFeesPaid: 0,
                  totalFeesDue: 15000,
                  ...newApp
                };
                setLocalStudents(prev => [localNew, ...prev]);
              }
              count++;
            }

            showToast("Import Successful", `Successfully imported ${count} applicants into the registry.`);
            setBulkImportText('');
            setIsBulkImportOpen(false);
          } catch (e) {
            alert("Invalid JSON format. Please check your input structure.");
          }
        };

        const handleLoadMockJSON = () => {
          const mockApplicants = [
            {
              name: "Rohit Deshmukh",
              email: "rohit.d@gmail.com",
              phone: "+91 98123 45678",
              parentName: "Sanjay Deshmukh",
              parentPhone: "+91 98123 45670",
              batchId: batches[0]?.id || "b1",
              category: "OBC",
              ewsStatus: false,
              bplStatus: false,
              previousClassPercentage: 92,
              approved: false,
              documents: [{ id: "doc-1", name: "Aadhaar Card Copy", type: "pdf", url: "#", uploadedAt: new Date().toISOString() }]
            },
            {
              name: "Ananya Mishra",
              email: "ananya.m@yahoo.com",
              phone: "+91 98234 56789",
              parentName: "Vijay Mishra",
              parentPhone: "+91 98234 56780",
              batchId: batches[1]?.id || "b2",
              category: "General",
              ewsStatus: true,
              bplStatus: false,
              previousClassPercentage: 96,
              approved: false,
              documents: [
                { id: "doc-2", name: "Aadhaar Card Copy", type: "png", url: "#", uploadedAt: new Date().toISOString() },
                { id: "doc-3", name: "Income Certificate (EWS)", type: "pdf", url: "#", uploadedAt: new Date().toISOString() }
              ]
            },
            {
              name: "Karan Soren",
              email: "karan.soren@outlook.com",
              phone: "+91 95456 12340",
              parentName: "Budhan Soren",
              parentPhone: "+91 95456 12349",
              batchId: batches[0]?.id || "b1",
              category: "ST",
              ewsStatus: false,
              bplStatus: true,
              previousClassPercentage: 78,
              approved: false,
              documents: [
                { id: "doc-4", name: "Caste Certificate (ST)", type: "pdf", url: "#", uploadedAt: new Date().toISOString() },
                { id: "doc-5", name: "BPL Ration Card Copy", type: "pdf", url: "#", uploadedAt: new Date().toISOString() }
              ]
            }
          ];
          setBulkImportText(JSON.stringify(mockApplicants, null, 2));
        };

        return (
          <div id="admissions-root" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-xs">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 id="adm-main-title" className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-indigo-600" /> Professional Admissions & Enrollment Center
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Log incoming applicant forms, upload verification documents, manage admissions stages, and process enrollment fees.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold text-[10px] px-3 py-1.5 rounded-full select-none uppercase">
                  {totalEnrolled} Active Enrolled
                </span>
                <span className="bg-slate-50 border border-slate-150 text-slate-600 font-extrabold text-[10px] px-3 py-1.5 rounded-full select-none uppercase">
                  {totalRegistered} Registered Profiles
                </span>
              </div>
            </div>

            {/* Bento-style Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div id="stat-total-applications" className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400">Total Applicants</p>
                <p className="text-2xl font-black text-slate-800">{totalRegistered}</p>
                <p className="text-[9px] text-slate-450 font-bold">Lodge & review pipeline</p>
              </div>
              <div id="stat-pending-review" className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-1">
                <p className="text-[10px] font-black uppercase text-amber-600">Pending Review</p>
                <p className="text-2xl font-black text-amber-700">{totalPending}</p>
                <p className="text-[9px] text-amber-500 font-bold">Needs doc checklist review</p>
              </div>
              <div id="stat-verified" className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-1">
                <p className="text-[10px] font-black uppercase text-blue-600">Verified (Fee Due)</p>
                <p className="text-2xl font-black text-blue-700">{totalVerified}</p>
                <p className="text-[9px] text-blue-500 font-bold">Approved candidates</p>
              </div>
              <div id="stat-fully-enrolled" className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-1">
                <p className="text-[10px] font-black uppercase text-emerald-600">Fully Admitted</p>
                <p className="text-2xl font-black text-emerald-700">{totalEnrolled}</p>
                <p className="text-[9px] text-emerald-500 font-bold">Mapped to active batches</p>
              </div>
              <div id="stat-ews-benefit" className="bg-indigo-50/40 border border-indigo-100/70 rounded-2xl p-4 space-y-1">
                <p className="text-[10px] font-black uppercase text-indigo-600">EWS Schemes</p>
                <p className="text-2xl font-black text-indigo-800">{totalEws}</p>
                <p className="text-[9px] text-indigo-500 font-bold">Economically Weaker Section</p>
              </div>
              <div id="stat-bpl-benefit" className="bg-rose-50/40 border border-rose-100/70 rounded-2xl p-4 space-y-1">
                <p className="text-[10px] font-black uppercase text-rose-600">BPL Schemes</p>
                <p className="text-2xl font-black text-rose-800">{totalBpl}</p>
                <p className="text-[9px] text-rose-500 font-bold">Below Poverty Line roster</p>
              </div>
            </div>

            {/* Query, Filter, & Command Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search applicants by Name, Email, ID, or Phone..."
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-indigo-500"
                    value={admSearch}
                    onChange={(e) => setAdmSearch(e.target.value)}
                  />
                  {admSearch && (
                    <button onClick={() => setAdmSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Main operational actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsAddingApplicant(true)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 uppercase select-none cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Apply Online Form
                  </button>
                  <button
                    onClick={() => setIsBulkImportOpen(true)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 uppercase select-none cursor-pointer"
                  >
                    <SlidersHorizontal className="h-4 w-4" /> Bulk Import
                  </button>
                  <div className="relative group">
                    <button
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 uppercase select-none cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> Export Report
                    </button>
                    <div className="absolute right-0 mt-1 hidden group-hover:block bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 z-25 w-40">
                      <button onClick={handleExportCSV} className="w-full text-left px-3 py-2 text-xxs font-black text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 uppercase">
                        Download CSV
                      </button>
                      <button onClick={handleExportJSON} className="w-full text-left px-3 py-2 text-xxs font-black text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 uppercase">
                        Download JSON DB
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced sorting & dropdown filters */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Target Batch:</span>
                  <select
                    className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xxs font-black text-slate-700 focus:outline-none"
                    value={admFilterBatch}
                    onChange={(e) => setAdmFilterBatch(e.target.value)}
                  >
                    <option value="all">ALL BATCHES</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Category:</span>
                  <select
                    className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xxs font-black text-slate-700 focus:outline-none"
                    value={admFilterCategory}
                    onChange={(e) => setAdmFilterCategory(e.target.value)}
                  >
                    <option value="all">ALL CATEGORIES</option>
                    <option value="General">GENERAL</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Govt Scheme:</span>
                  <select
                    className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xxs font-black text-slate-700 focus:outline-none"
                    value={admFilterScheme}
                    onChange={(e) => setAdmFilterScheme(e.target.value)}
                  >
                    <option value="all">ALL SCHEMES</option>
                    <option value="ews">EWS BENEFICIARY</option>
                    <option value="bpl">BPL BENEFICIARY</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Sort By:</span>
                  <select
                    className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xxs font-black text-slate-700 focus:outline-none"
                    value={admSortBy}
                    onChange={(e) => setAdmSortBy(e.target.value)}
                  >
                    <option value="name-az">NAME: A TO Z</option>
                    <option value="name-za">NAME: Z TO A</option>
                    <option value="marks-desc">MARKS: HIGH TO LOW</option>
                    <option value="marks-asc">MARKS: LOW TO HIGH</option>
                    <option value="date-desc">APPLIED: LATEST FIRST</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stages Tab Selector */}
            <div className="flex border-b border-slate-100 gap-1 overflow-x-auto pb-px">
              {(['all', 'pending', 'verified', 'enrolled', 'rejected'] as const).map(tab => {
                const isActive = admActiveTab === tab;
                const tabNames: Record<string, string> = {
                  all: "All Roster",
                  pending: "Pending Review",
                  verified: "Verified & Approved",
                  enrolled: "Fully Admitted",
                  rejected: "Rejected Files"
                };
                const tabCounts: Record<string, number> = {
                  all: localStudents.length,
                  pending: localStudents.filter(s => s.approved === false && s.feeStatus !== 'Overdue').length,
                  verified: localStudents.filter(s => s.approved === true && s.totalFeesPaid === 0).length,
                  enrolled: localStudents.filter(s => s.approved === true && s.totalFeesPaid > 0).length,
                  rejected: localStudents.filter(s => s.approved === false && s.feeStatus === 'Overdue').length
                };

                return (
                  <button
                    key={tab}
                    onClick={() => setAdmActiveTab(tab)}
                    className={`py-3 px-4 text-xs font-black uppercase transition-all shrink-0 border-b-2 cursor-pointer select-none ${
                      isActive 
                        ? 'border-indigo-600 text-indigo-700 font-extrabold' 
                        : 'border-transparent text-slate-450 hover:text-slate-750 hover:border-slate-200'
                    }`}
                  >
                    {tabNames[tab]} <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'}`}>{tabCounts[tab]}</span>
                  </button>
                );
              })}
            </div>

            {/* Applicants List Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {sortedApplicants.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <GraduationCap className="h-10 w-10 text-slate-300 mx-auto" />
                  <h4 className="font-extrabold text-slate-700 text-sm">No Admission Profiles Found</h4>
                  <p className="text-xxs text-slate-400">Try tweaking your search terms, scheme filter constraints, or submit an online application form.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase select-none">
                        <th className="py-3.5 px-4">Applicant & Details</th>
                        <th className="py-3.5 px-4">Applied Date</th>
                        <th className="py-3.5 px-4">Target Batch</th>
                        <th className="py-3.5 px-4">Scheme / Benefits</th>
                        <th className="py-3.5 px-4 text-right">Prereq Marks</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedApplicants.map((applicant) => {
                        const batchObj = batches.find(b => b.id === applicant.batchId);
                        
                        const isPending = applicant.approved === false && applicant.feeStatus !== 'Overdue';
                        const isVerified = applicant.approved === true && applicant.totalFeesPaid === 0;
                        const isEnrolled = applicant.approved === true && applicant.totalFeesPaid > 0;
                        const isRejected = applicant.approved === false && applicant.feeStatus === 'Overdue';

                        let statusPill = (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full font-black text-[9px] uppercase tracking-wider">
                            Pending Review
                          </span>
                        );
                        if (isVerified) {
                          statusPill = (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-black text-[9px] uppercase tracking-wider">
                              Verified
                            </span>
                          );
                        } else if (isEnrolled) {
                          statusPill = (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-black text-[9px] uppercase tracking-wider">
                              Enrolled
                            </span>
                          );
                        } else if (isRejected) {
                          statusPill = (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-full font-black text-[9px] uppercase tracking-wider">
                              Rejected
                            </span>
                          );
                        }

                        return (
                          <tr key={applicant.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 flex items-center justify-center font-extrabold text-xs">
                                  {applicant.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
                                    {applicant.name}
                                    {applicant.category && (
                                      <span className="text-[9px] font-black px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                        {applicant.category}
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 font-semibold">{applicant.email} • {applicant.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono text-[10px] text-slate-500">
                              {applicant.admissionDate}
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-extrabold text-slate-700 text-xs">
                                {batchObj?.name || 'Unassigned'}
                              </div>
                              <p className="text-[10px] text-slate-400 font-semibold">Course: {batchObj?.schedule || 'N/A'}</p>
                            </td>
                            <td className="py-4 px-4 space-y-1">
                              {applicant.ewsStatus && (
                                <span className="inline-block mr-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-black rounded-sm border border-indigo-100 uppercase">
                                  EWS
                                </span>
                              )}
                              {applicant.bplStatus && (
                                <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-700 text-[8px] font-black rounded-sm border border-rose-100 uppercase">
                                  BPL
                                </span>
                              )}
                              {!applicant.ewsStatus && !applicant.bplStatus && (
                                <span className="text-[10px] text-slate-400 font-semibold">—</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right font-black text-slate-800 text-xs">
                              {applicant.previousClassPercentage || 85}%
                            </td>
                            <td className="py-4 px-4 text-center">
                              {statusPill}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                {isPending && (
                                  <button
                                    onClick={() => setSelectedApplicant(applicant)}
                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg transition-all uppercase cursor-pointer"
                                  >
                                    Verify Docs
                                  </button>
                                )}
                                {isVerified && (
                                  <button
                                    onClick={() => {
                                      setIsCollectingAdmFee(applicant);
                                      setAdmFeeAmount('5000');
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-all uppercase cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="h-3 w-3" /> Collect Fee
                                  </button>
                                )}
                                {isEnrolled && (
                                  <span className="text-emerald-600 text-xxs font-black uppercase flex items-center gap-1 pr-1">
                                    <Check className="h-3 w-3" /> Enrolled
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="text-rose-500 text-xxs font-black uppercase pr-1">
                                    Rejected
                                  </span>
                                )}
                                <button
                                  onClick={() => setEditingStudent(applicant)}
                                  className="px-2 py-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Edit className="h-3 w-3 text-slate-500" /> Edit
                                </button>
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

            {/* MODAL 1: ONLINE APPLICATION APPLICATION FORM */}
            {isAddingApplicant && (
              <div id="modal-online-application" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-scaleIn text-left flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div>
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-indigo-600" /> Apply Online Registration Form
                      </h3>
                      <p className="text-[11px] text-slate-450 font-semibold">Fill applicant registry profile and compile legal files for academic admission evaluation.</p>
                    </div>
                    <button onClick={() => setIsAddingApplicant(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Modal Content - Scrollable */}
                  <div className="p-6 space-y-5 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Applicant Name *</label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500 focus:bg-white"
                          value={appFormName}
                          onChange={(e) => setAppFormName(e.target.value)}
                        />
                      </div>
                      {/* Email */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Primary Email Address *</label>
                        <input
                          type="email"
                          placeholder="applicant@example.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500 focus:bg-white"
                          value={appFormEmail}
                          onChange={(e) => setAppFormEmail(e.target.value)}
                        />
                      </div>
                      {/* Phone */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Applicant Mobile Number *</label>
                        <input
                          type="text"
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500 focus:bg-white"
                          value={appFormPhone}
                          onChange={(e) => setAppFormPhone(e.target.value)}
                        />
                      </div>
                      {/* Batch Selection */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Coaching Batch Preference</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500 focus:bg-white font-semibold"
                          value={appFormBatch}
                          onChange={(e) => setAppFormBatch(e.target.value)}
                        >
                          {batches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      {/* Parent Name */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Parent/Guardian Name</label>
                        <input
                          type="text"
                          placeholder="Father or Mother Name"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500 focus:bg-white"
                          value={appFormParent}
                          onChange={(e) => setAppFormParent(e.target.value)}
                        />
                      </div>
                      {/* Parent Phone */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">Parent Emergency Contact</label>
                        <input
                          type="text"
                          placeholder="Mobile Number"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500 focus:bg-white"
                          value={appFormParentPhone}
                          onChange={(e) => setAppFormParentPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Government Schemes & Reservation */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Government Schemes & Social Categories</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Social Category</label>
                          <select
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xxs font-black text-slate-700"
                            value={appFormCategory}
                            onChange={(e) => setAppFormCategory(e.target.value as any)}
                          >
                            <option value="General">GENERAL CATEGORY</option>
                            <option value="OBC">OBC (BACKWARD CLASS)</option>
                            <option value="SC">SC (SCHEDULED CASTE)</option>
                            <option value="ST">ST (SCHEDULED TRIBE)</option>
                          </select>
                        </div>

                        {/* EWS Toggle */}
                        <div className="flex flex-col justify-end">
                          <label className="flex items-center gap-2.5 py-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={appFormEws}
                              onChange={(e) => setAppFormEws(e.target.checked)}
                              className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                            <span>EWS Beneficiary</span>
                          </label>
                          <p className="text-[9px] text-slate-400 font-semibold">Economically Weaker Section eligibility</p>
                        </div>

                        {/* BPL Toggle */}
                        <div className="flex flex-col justify-end">
                          <label className="flex items-center gap-2.5 py-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={appFormBpl}
                              onChange={(e) => setAppFormBpl(e.target.checked)}
                              className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                            <span>BPL Beneficiary</span>
                          </label>
                          <p className="text-[9px] text-slate-400 font-semibold">Below Poverty Line roster tracking</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200/60 pt-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Previous Class Marks Percentage (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xxs font-black text-slate-700"
                            value={appFormMarks}
                            onChange={(e) => setAppFormMarks(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Document Upload Widget */}
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Document Checklist (Verification Required)</h4>
                        <span className="text-xxs font-black text-indigo-600 uppercase">
                          {appFormDocs.length} Files Attached
                        </span>
                      </div>

                      {/* Upload Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Select Document Type</label>
                          <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xxs text-slate-700 font-black"
                            value={uploadDocType}
                            onChange={(e) => setUploadDocType(e.target.value)}
                          >
                            <option value="Aadhaar Card">AADHAAR CARD</option>
                            <option value="Category Certificate">CATEGORY CERTIFICATE (OBC/SC/ST)</option>
                            <option value="Income Proof Certificate">EWS / BPL INCOME PROOF</option>
                            <option value="Academic Board Transcript">BOARD MARKSHEET / CERTIFICATE</option>
                          </select>
                        </div>
                        <div className="sm:col-span-7">
                          <button
                            type="button"
                            onClick={triggerSimulatedUpload}
                            disabled={isUploadingDoc}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 py-2 px-4 rounded-xl text-xxs font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none disabled:opacity-50"
                          >
                            <UploadCloud className="h-4 w-4 text-slate-500" /> 
                            {isUploadingDoc ? `Uploading (${uploadProgress}%)` : "Browse & Upload Legal Proof File"}
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {isUploadingDoc && (
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-600 h-1.5 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      )}

                      {/* File List */}
                      {appFormDocs.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                          {appFormDocs.map((doc) => (
                            <div key={doc.id} className="flex justify-between items-center text-xxs font-semibold text-slate-700 py-1 border-b border-slate-100 last:border-b-0">
                              <span className="flex items-center gap-1.5 font-bold">
                                <FileText className="h-3.5 w-3.5 text-indigo-500" /> {doc.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => setAppFormDocs(prev => prev.filter(d => d.id !== doc.id))}
                                className="text-rose-600 hover:text-rose-800 cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAddingApplicant(false)}
                      className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black uppercase rounded-xl border border-slate-250 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddApplication}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Lodge Registration Application
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL 2: REVIEW & VERIFY APPLICANT OVERLAY */}
            {selectedApplicant && (
              <div id="modal-review-applicant" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn text-left flex flex-col max-h-[85vh]">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Review & Verify Application</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Verify personal details, academic percentage, and check supporting document attachments.</p>
                    </div>
                    <button onClick={() => setSelectedApplicant(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Body details */}
                  <div className="p-5 space-y-4 overflow-y-auto">
                    <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between border-b pb-1.5">
                        <span className="font-bold text-slate-450 uppercase text-[9px]">Candidate Name</span>
                        <span className="font-extrabold text-slate-800">{selectedApplicant.name}</span>
                      </div>
                      <div className="flex justify-between border-b py-1.5">
                        <span className="font-bold text-slate-450 uppercase text-[9px]">Email address</span>
                        <span className="font-semibold text-slate-700">{selectedApplicant.email}</span>
                      </div>
                      <div className="flex justify-between border-b py-1.5">
                        <span className="font-bold text-slate-450 uppercase text-[9px]">Mobile Phone</span>
                        <span className="font-semibold text-slate-700">{selectedApplicant.phone}</span>
                      </div>
                      <div className="flex justify-between border-b py-1.5">
                        <span className="font-bold text-slate-450 uppercase text-[9px]">Category</span>
                        <span className="font-bold text-indigo-700">{selectedApplicant.category || 'General'}</span>
                      </div>
                      <div className="flex justify-between border-b py-1.5">
                        <span className="font-bold text-slate-450 uppercase text-[9px]">Marks Percentage</span>
                        <span className="font-bold text-slate-800">{selectedApplicant.previousClassPercentage || 85}%</span>
                      </div>
                      <div className="flex justify-between pt-1.5">
                        <span className="font-bold text-slate-450 uppercase text-[9px]">Target Batch</span>
                        <span className="font-bold text-slate-800">
                          {batches.find(b => b.id === selectedApplicant.batchId)?.name || 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    {/* Scheme benefit checking */}
                    <div className="border border-slate-150 rounded-2xl p-4 space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Government Scheme Alignment</h4>
                      <div className="grid grid-cols-2 gap-3 text-xxs font-semibold">
                        <div className={`p-2 rounded-xl border ${selectedApplicant.ewsStatus ? 'bg-indigo-50 border-indigo-100 text-indigo-800' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                          <p className="font-black">EWS Status</p>
                          <p className="text-[10px] font-bold mt-0.5">{selectedApplicant.ewsStatus ? 'EWS BENEFICIARY' : 'NOT ELIGIBLE'}</p>
                        </div>
                        <div className={`p-2 rounded-xl border ${selectedApplicant.bplStatus ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                          <p className="font-black">BPL Status</p>
                          <p className="text-[10px] font-bold mt-0.5">{selectedApplicant.bplStatus ? 'BPL BENEFICIARY' : 'NOT ELIGIBLE'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Attached Legal Files Checklist */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Supporting Documentation Checklist</h4>
                      {!selectedApplicant.documents || selectedApplicant.documents.length === 0 ? (
                        <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-450 text-[10px] font-bold border border-dashed border-slate-200">
                          No document files uploaded by applicant. Proceed with caution.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {selectedApplicant.documents.map((doc) => (
                            <div key={doc.id} className="flex justify-between items-center bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-xxs font-semibold">
                              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                                <FileText className="h-4 w-4 text-indigo-600" /> {doc.name}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-extrabold text-[8px] rounded uppercase border border-emerald-100">
                                Simulated Active Link
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingStudent(selectedApplicant);
                        setSelectedApplicant(null);
                      }}
                      className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xxs font-black uppercase rounded-xl border border-indigo-200 transition-all cursor-pointer"
                    >
                      Edit Student Record
                    </button>
                    <button
                      onClick={() => handleVerifyApplicant(selectedApplicant.id, false)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xxs font-black uppercase rounded-xl border border-rose-200 transition-all cursor-pointer"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleVerifyApplicant(selectedApplicant.id, true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xxs font-black uppercase rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="h-4 w-4" /> Verify & Approve Candidate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EDITING STUDENT MODAL */}
            {editingStudent && (
              <div id="modal-edit-student" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn text-left flex flex-col max-h-[85vh]">
                  <div className="p-5 border-b border-slate-100 bg-indigo-50 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        <span>Edit Student Profile Record</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold">Modify official profile data, parent contact, fees, and view edit audit trail history.</p>
                    </div>
                    <button onClick={() => setEditingStudent(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const formData = new FormData(form);
                      const updatedFields: Partial<Student> = {
                        name: formData.get('name') as string,
                        email: formData.get('email') as string,
                        phone: formData.get('phone') as string,
                        parentName: formData.get('parentName') as string,
                        parentPhone: formData.get('parentPhone') as string,
                        totalFeesPaid: Number(formData.get('totalFeesPaid')),
                        totalFeesDue: Number(formData.get('totalFeesDue')),
                        category: formData.get('category') as 'General' | 'OBC' | 'SC' | 'ST',
                        ewsStatus: formData.get('ewsStatus') === 'true',
                        bplStatus: formData.get('bplStatus') === 'true',
                      };

                      if (onUpdateStudent) {
                        try {
                          await onUpdateStudent(editingStudent.id, updatedFields);
                          showToast("Profile Saved", "Student credentials and fee registers updated in cloud database.");
                        } catch (err) {
                          setLocalStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...updatedFields } : s));
                          showToast("Saved Locally", "Student profile credentials written to sandbox state.");
                        }
                      } else {
                        setLocalStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...updatedFields } : s));
                        showToast("Saved Locally", "Student profile credentials written to sandbox state.");
                      }
                      setEditingStudent(null);
                    }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <div className="p-5 space-y-4 overflow-y-auto">
                      {/* Section 1: Personal Details */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Student Credentials</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Full Name</label>
                            <input 
                              type="text" 
                              name="name" 
                              required 
                              defaultValue={editingStudent.name}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Email address</label>
                            <input 
                              type="email" 
                              name="email" 
                              required 
                              defaultValue={editingStudent.email}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Mobile Phone</label>
                            <input 
                              type="text" 
                              name="phone" 
                              required 
                              defaultValue={editingStudent.phone}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Social Category</label>
                            <select 
                              name="category"
                              defaultValue={editingStudent.category || 'General'}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                            >
                              <option value="General">General</option>
                              <option value="OBC">OBC</option>
                              <option value="SC">SC</option>
                              <option value="ST">ST</option>
                              <option value="EWS">EWS</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Parent Information */}
                      <div className="space-y-3 pt-3 border-t">
                        <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Parent & Guardian Contact</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Parent Name</label>
                            <input 
                              type="text" 
                              name="parentName" 
                              required 
                              defaultValue={editingStudent.parentName || ''}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Parent Phone</label>
                            <input 
                              type="text" 
                              name="parentPhone" 
                              required 
                              defaultValue={editingStudent.parentPhone || ''}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Fees Registry */}
                      <div className="space-y-3 pt-3 border-t">
                        <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Tuition Register & Fees</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Total Fees Paid (₹)</label>
                            <input 
                              type="number" 
                              name="totalFeesPaid" 
                              required 
                              defaultValue={editingStudent.totalFeesPaid}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Total Fees Due (₹)</label>
                            <input 
                              type="number" 
                              name="totalFeesDue" 
                              required 
                              defaultValue={editingStudent.totalFeesDue}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xxs font-semibold">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">EWS Scheme</label>
                            <select 
                              name="ewsStatus"
                              defaultValue={editingStudent.ewsStatus ? 'true' : 'false'}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                            >
                              <option value="false">Not Eligible</option>
                              <option value="true">EWS Beneficiary</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">BPL Scheme</label>
                            <select 
                              name="bplStatus"
                              defaultValue={editingStudent.bplStatus ? 'true' : 'false'}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                            >
                              <option value="false">Not Eligible</option>
                              <option value="true">BPL Beneficiary</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Modification History Audit Trail */}
                      <div className="space-y-2 pt-3 border-t">
                        <h4 className="text-[10px] font-black uppercase text-rose-600 tracking-wider">Profile Revision History</h4>
                        {!editingStudent.modificationHistory || editingStudent.modificationHistory.length === 0 ? (
                          <p className="text-[10px] font-bold text-slate-400 italic">No revision entries logged. This record is in its pristine state.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {editingStudent.modificationHistory.map((item, i) => (
                              <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xxs">
                                <div>
                                  <p className="font-extrabold text-slate-700">Changed: <span className="font-bold text-indigo-600">{item.changes}</span></p>
                                  <p className="text-[9px] text-slate-400 font-bold">Author: {item.updatedBy}</p>
                                </div>
                                <span className="text-[8px] font-black text-slate-400 shrink-0">
                                  {new Date(item.timestamp).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingStudent(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xxs font-black uppercase rounded-xl transition-all animate-none"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xxs font-black uppercase rounded-xl transition-all shadow-sm"
                      >
                        Save & Record Revision
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 3: COLLECT ENROLLMENT FEE */}
            {isCollectingAdmFee && (
              <div id="modal-collect-enrollment-fee" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn text-left">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Process Enrollment Fee</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Record admission enrollment payment to formally assign the student to their batch.</p>
                    </div>
                    <button onClick={() => setIsCollectingAdmFee(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="p-3 bg-indigo-50/55 rounded-2xl border border-indigo-100 text-xs space-y-1">
                      <p className="text-[10px] text-indigo-600 font-extrabold uppercase">Admissions Student</p>
                      <p className="font-extrabold text-slate-800">{isCollectingAdmFee.name}</p>
                      <p className="text-[10px] text-slate-500">
                        Batch choice: {batches.find(b => b.id === isCollectingAdmFee.batchId)?.name || 'General Batch'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Enrollment Fee Amount (₹)</label>
                      <input
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-extrabold focus:outline-indigo-500"
                        value={admFeeAmount}
                        onChange={(e) => setAdmFeeAmount(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Select Payment Mode</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['UPI', 'Cash', 'Card', 'Online'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setAdmFeeMode(mode)}
                            className={`py-2 px-1 border rounded-lg text-xxs font-black uppercase text-center select-none cursor-pointer transition-all ${
                              admFeeMode === mode
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                    <button
                      onClick={() => setIsCollectingAdmFee(null)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xxs font-black uppercase rounded-lg border border-slate-250 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCollectEnrollmentFee}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xxs font-black uppercase rounded-lg shadow-xs transition-all cursor-pointer"
                    >
                      Record Receipt & Admit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL 4: BULK IMPORT MODAL */}
            {isBulkImportOpen && (
              <div id="modal-bulk-import-applicants" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn text-left flex flex-col max-h-[85vh]">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Bulk Import Applicants</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Paste structured JSON database arrays to insert dozens of applicants instantly.</p>
                    </div>
                    <button onClick={() => setIsBulkImportOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-3.5 overflow-y-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-450 uppercase">Paste JSON Database Record Array</span>
                      <button
                        type="button"
                        onClick={handleLoadMockJSON}
                        className="text-xxs font-black text-indigo-600 hover:text-indigo-800 uppercase cursor-pointer"
                      >
                        Load High-Quality Mock Candidates
                      </button>
                    </div>

                    <textarea
                      placeholder="e.g. [ { 'name': 'Karan Soren', ... } ]"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[10px] text-slate-700 focus:outline-indigo-500 h-60 focus:bg-white resize-none"
                      value={bulkImportText}
                      onChange={(e) => setBulkImportText(e.target.value)}
                    />
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
                    <button
                      onClick={() => setIsBulkImportOpen(false)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xxs font-black uppercase rounded-lg border border-slate-250 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkImport}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xxs font-black uppercase rounded-lg shadow-xs transition-all cursor-pointer"
                    >
                      Execute Import
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 2. Communication Console (Upgraded to Communication Centre) */}
      {activeModule === 'communication' && (
        <CommunicationCentre currentUser={currentUser} currentRole={currentRole || currentUser?.role || 'admin'} />
      )}

      {/* 3. Daily Remarks Desk */}
      {activeModule === 'remarks' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div>
            <h2 className="text-lg font-black text-slate-800">Daily Remarks & Reviews</h2>
            <p className="text-xs text-slate-400">Post behavioral remarks, mock performance indicators, and parent reviews.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Publish Student Remark</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <StudentSelector
                    students={students}
                    batches={batches}
                    selectedStudentId={selectedRemarkStudent}
                    onSelectStudent={setSelectedRemarkStudent}
                    label="Remark Recipient"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Remark Severity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Excellent', 'Good', 'Needs Improvement'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setRemarkLevel(level as any)}
                        className={`py-1.5 rounded-lg border text-xxs font-bold text-center transition-all ${
                          remarkLevel === level 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white border-slate-250 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-450 uppercase">Remark Text</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!remarkText) return;
                        setRemarkText(prev => prev + " Demonstrates sharp focus, thorough mock problem solving, and highly regular revision pacing.");
                      }}
                      className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                    >
                      <Sparkles className="h-3 w-3" /> Auto AI Polish
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="e.g. Exhibited thorough knowledge of Kinetics numericals today."
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => {
                    if (!remarkText) return;
                    const studentObj = students.find(s => s.id === selectedRemarkStudent);
                    const fresh = {
                      studentName: studentObj ? studentObj.name : 'Unknown Student',
                      text: remarkText,
                      level: remarkLevel,
                      date: new Date().toISOString().split('T')[0]
                    };
                    setRemarksHistory([fresh, ...remarksHistory]);
                    setRemarkText('');
                    showToast("Remark Added Successfully", `A new ${remarkLevel} remark has been published for ${fresh.studentName}!`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 font-bold text-xs text-white cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Save Remark to Student Profile
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Remark Ledger Timeline</h3>
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto">
                {remarksHistory.map((rem, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/40 text-left flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800">{rem.studentName}</p>
                      <p className="text-xxs text-slate-500 leading-relaxed font-semibold">{rem.text}</p>
                      <span className="text-[9px] text-slate-400 font-mono">{rem.date}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      rem.level === 'Excellent' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                      rem.level === 'Good' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' :
                      'bg-rose-50 border-rose-200 text-rose-600'
                    }`}>
                      {rem.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Campus Hostel & Mess Management */}
      {activeModule === 'hostel' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-800">Campus Hostel & Mess Management</h2>
              <p className="text-xs text-slate-400 font-semibold">Monitor the Campus Hostel Occupancy Index, register blocks, and control daily mess board menus.</p>
            </div>

            {/* Sub-Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setHostelActiveSubTab('rooms')}
                className={`px-3 py-1.5 rounded-lg text-xxs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  hostelActiveSubTab === 'rooms'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Occupancy Index
              </button>
              <button
                onClick={() => setHostelActiveSubTab('blocks')}
                className={`px-3 py-1.5 rounded-lg text-xxs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  hostelActiveSubTab === 'blocks'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Hostel Blocks
              </button>
              <button
                onClick={() => setHostelActiveSubTab('mess')}
                className={`px-3 py-1.5 rounded-lg text-xxs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  hostelActiveSubTab === 'mess'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Daily Mess Board
              </button>
            </div>
          </div>

          {/* Sub-tab 1: ROOMS / OCCUPANCY */}
          {hostelActiveSubTab === 'rooms' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
              {/* Left sidebar: Allocation, transfers, and swaps */}
              <div className="lg:col-span-4 space-y-6">
                {/* 1. Allot Bed */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4 text-indigo-500" /> Assign & Allot Bed
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Select Student</label>
                      <select
                        className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold outline-none focus:outline-blue-500"
                        value={allocateStudent.studentId}
                        onChange={(e) => setAllocateStudent({...allocateStudent, studentId: e.target.value})}
                      >
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.rollNumber || s.admissionNumber || s.id})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Hostel Block</label>
                        <select
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold outline-none"
                          value={allocateStudent.block}
                          onChange={(e) => setAllocateStudent({...allocateStudent, block: e.target.value})}
                        >
                          {hostels.filter(h => !h.archived).map(h => (
                            <option key={h.id} value={h.name}>{h.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Room No</label>
                        <input
                          type="text"
                          placeholder="e.g. 101"
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-blue-500"
                          value={allocateStudent.roomNo}
                          onChange={(e) => setAllocateStudent({...allocateStudent, roomNo: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Mess Preference</label>
                      <select
                        className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold outline-none"
                        value={allocateStudent.mess}
                        onChange={(e) => setAllocateStudent({...allocateStudent, mess: e.target.value})}
                      >
                        <option value="Veg">Pure Vegetarian Mess</option>
                        <option value="Non-Veg">Regular Non-Vegetarian Mess</option>
                        <option value="Veg (Eats Eggs)">Veg with Eggs</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        const roomIdx = hostelRooms.findIndex(r => r.roomNo === allocateStudent.roomNo && r.block === allocateStudent.block);
                        const studentObj = students.find(s => s.id === allocateStudent.studentId);
                        const studentName = studentObj ? studentObj.name : "Student";

                        // Check if block exists and is not archived
                        const blockObj = hostels.find(h => h.name === allocateStudent.block);
                        if (blockObj && blockObj.archived) {
                          showToast("Allotment Block Refused", "Cannot allot beds in an archived hostel block.", "info");
                          return;
                        }

                        // 1. Check if student is already allotted elsewhere, if so, vacate them first
                        let updatedRooms = hostelRooms.map(r => {
                          const hasStudent = (r.beds || []).some(b => b.studentId === allocateStudent.studentId);
                          if (hasStudent) {
                            const remainingBeds = (r.beds || []).filter(b => b.studentId !== allocateStudent.studentId);
                            const reindexedBeds = remainingBeds.map((b, idx) => ({ ...b, bedNo: idx + 1 }));
                            return { ...r, beds: reindexedBeds, occupied: reindexedBeds.length };
                          }
                          return r;
                        });

                        // 2. Perform allotment on targeted room
                        const targetIdx = updatedRooms.findIndex(r => r.roomNo === allocateStudent.roomNo && r.block === allocateStudent.block);
                        if (targetIdx >= 0) {
                          const targetRoom = updatedRooms[targetIdx];
                          if (targetRoom.occupied >= targetRoom.capacity) {
                            showToast("Allocation Refused", "Target room is fully occupied! Choose another room.", "info");
                            return;
                          }
                          const newBedNo = (targetRoom.beds || []).length + 1;
                          targetRoom.beds = [
                            ...(targetRoom.beds || []),
                            { bedNo: newBedNo, studentId: allocateStudent.studentId, studentName }
                          ];
                          targetRoom.occupied = targetRoom.beds.length;
                          updatedRooms[targetIdx] = targetRoom;
                        } else {
                          // Create a new room with the allotted student
                          updatedRooms.push({
                            id: `h-${Date.now()}`,
                            block: allocateStudent.block,
                            roomNo: allocateStudent.roomNo,
                            capacity: 4,
                            occupied: 1,
                            mess: allocateStudent.mess,
                            beds: [{ bedNo: 1, studentId: allocateStudent.studentId, studentName }]
                          });
                        }

                        setHostelRooms(updatedRooms);
                        showToast("Allotment Complete", `${studentName} successfully assigned to Bed Space in Room ${allocateStudent.roomNo} (${allocateStudent.block}).`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 font-black text-xs text-white cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <Check className="h-4 w-4" /> Confirm Allotment / Change
                    </button>
                  </div>
                </div>

                {/* 2. Swapping Beds Panel */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-indigo-50/20 space-y-4">
                  <h3 className="text-xs font-black text-indigo-850 uppercase tracking-wider flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4 text-indigo-600 animate-spin-slow" /> Swap Student Beds
                  </h3>
                  <p className="text-[10px] text-indigo-700 font-semibold leading-relaxed">
                    Instantly swap rooms and beds of two currently allotted hostellers without deleting profiles.
                  </p>

                  {/* Extract all currently allocated students */}
                  {(() => {
                    const allocatedStudents: { id: string; name: string; block: string; roomNo: string; bedNo: number }[] = [];
                    hostelRooms.forEach(room => {
                      (room.beds || []).forEach(b => {
                        allocatedStudents.push({
                          id: b.studentId,
                          name: b.studentName,
                          block: room.block,
                          roomNo: room.roomNo,
                          bedNo: b.bedNo
                        });
                      });
                    });

                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Student A</label>
                          <select
                            className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold outline-none"
                            value={swapState?.studentAId || ''}
                            onChange={(e) => setSwapState(prev => ({ studentAId: e.target.value, studentBId: prev?.studentBId || '' }))}
                          >
                            <option value="">-- Choose Student A --</option>
                            {allocatedStudents.map(as => (
                              <option key={`swap-a-${as.id}`} value={as.id}>
                                {as.name} (Room {as.roomNo}, {as.block})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Student B</label>
                          <select
                            className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold outline-none"
                            value={swapState?.studentBId || ''}
                            onChange={(e) => setSwapState(prev => ({ studentAId: prev?.studentAId || '', studentBId: e.target.value }))}
                          >
                            <option value="">-- Choose Student B --</option>
                            {allocatedStudents.filter(as => as.id !== swapState?.studentAId).map(as => (
                              <option key={`swap-b-${as.id}`} value={as.id}>
                                {as.name} (Room {as.roomNo}, {as.block})
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => {
                            if (!swapState?.studentAId || !swapState?.studentBId) {
                              showToast("Selection Required", "Please specify both Student A and Student B to initiate bed swap.", "info");
                              return;
                            }

                            const stA = allocatedStudents.find(x => x.id === swapState.studentAId);
                            const stB = allocatedStudents.find(x => x.id === swapState.studentBId);
                            if (!stA || !stB) return;

                            // Swap their beds in hostelRooms state
                            let updated = hostelRooms.map(room => {
                              let beds = room.beds || [];
                              const hasA = beds.some(b => b.studentId === stA.id);
                              const hasB = beds.some(b => b.studentId === stB.id);

                              if (hasA && hasB) {
                                // Both are in the same room, swap their bed indices
                                beds = beds.map(b => {
                                  if (b.studentId === stA.id) return { ...b, studentId: stB.id, studentName: stB.name };
                                  if (b.studentId === stB.id) return { ...b, studentId: stA.id, studentName: stA.name };
                                  return b;
                                });
                              } else if (hasA) {
                                // Replace A with B
                                beds = beds.map(b => b.studentId === stA.id ? { ...b, studentId: stB.id, studentName: stB.name } : b);
                              } else if (hasB) {
                                // Replace B with A
                                beds = beds.map(b => b.studentId === stB.id ? { ...b, studentId: stA.id, studentName: stA.name } : b);
                              }
                              return { ...room, beds };
                            });

                            setHostelRooms(updated);
                            setSwapState(null);
                            showToast("Bed Swap Successful", `Exchanged beds between ${stA.name} and ${stB.name} immediately.`);
                          }}
                          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-xs text-white cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="h-4 w-4" /> Execute Bed Swap
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Right content: Directory index */}
              <div className="lg:col-span-8 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Campus Occupancy Directory</h3>
                  <div className="flex gap-2 items-center text-[10px] text-slate-400 font-bold">
                    <span>Total Active Rooms Allotted: {hostelRooms.filter(r => hostels.some(h => h.name === r.block && !h.archived)).length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hostelRooms.filter(r => hostels.some(h => h.name === r.block && !h.archived)).map((room) => {
                    const vacancies = Math.max(0, room.capacity - room.occupied);
                    return (
                      <div key={room.id} className="border border-slate-150 rounded-xl p-4 space-y-3 bg-slate-50/20 text-left hover:border-slate-350 transition-all animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{room.block}</span>
                            <h4 className="text-xs font-black text-slate-800">Room Number: {room.roomNo}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                            vacancies === 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          }`}>
                            {vacancies === 0 ? 'Full' : `${vacancies} Vacant`}
                          </span>
                        </div>

                        {/* Occupancy state indicator */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-450">
                            <span>Allocated Beds</span>
                            <span>{room.occupied} / {room.capacity} beds occupied</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                room.occupied >= room.capacity ? 'bg-red-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${Math.min(100, (room.occupied / room.capacity) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Detailed Bed Assignments */}
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Bed Allotments</span>
                          {(room.beds && room.beds.length > 0) ? (
                            <div className="space-y-1">
                              {room.beds.map((b) => (
                                <div key={b.studentId} className="flex items-center justify-between bg-white border border-slate-100 px-2.5 py-1.5 rounded-lg text-xxs font-bold">
                                  <span className="text-slate-700">Bed {b.bedNo}: <span className="text-slate-900 font-extrabold">{b.studentName}</span></span>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => {
                                        setAllocateStudent({
                                          studentId: b.studentId,
                                          roomNo: room.roomNo,
                                          block: room.block,
                                          mess: room.mess
                                        });
                                        showToast("Ready for Change", "Update the Room No/Block on the left panel to change bed assignment.");
                                      }}
                                      className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[9px] font-bold cursor-pointer"
                                    >
                                      Change
                                    </button>
                                    <button
                                      onClick={() => {
                                        const confirmWipe = window.confirm(`Confirm Bed Vacation:\nStudent Name: ${b.studentName}\nRoom: ${room.roomNo} (${room.block})\n\nWarning: This removes the bed allocation profile completely. Continue?`);
                                        if (!confirmWipe) return;

                                        const updated = hostelRooms.map(r => {
                                          if (r.id === room.id) {
                                            const filtered = (r.beds || []).filter(x => x.studentId !== b.studentId);
                                            const reindexed = filtered.map((x, idx) => ({ ...x, bedNo: idx + 1 }));
                                            return { ...r, beds: reindexed, occupied: reindexed.length };
                                          }
                                          return r;
                                        });
                                        setHostelRooms(updated);
                                        showToast("Allotment Vacated", `${b.studentName} vacated from Room ${room.roomNo}`);
                                      }}
                                      className="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[9px] font-bold cursor-pointer"
                                    >
                                      Vacate
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 italic font-semibold py-1">No students assigned. Fully Vacant.</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 2: HOSTEL BLOCKS REGISTRY */}
          {hostelActiveSubTab === 'blocks' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn text-xs">
              {/* Form to create / edit hostel block */}
              <div className="lg:col-span-4 border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 h-fit">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-indigo-500" /> 
                  {editingHostelId ? "Rename Hostel Block" : "Register Hostel Block"}
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hostel Block Name</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-bold"
                      placeholder="e.g. Aravalli Boys Block B"
                      value={editingHostelId ? editingHostelName : newHostelName}
                      onChange={(e) => editingHostelId ? setEditingHostelName(e.target.value) : setNewHostelName(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (editingHostelId) {
                          if (!editingHostelName.trim()) return;
                          setHostels(prev => prev.map(h => h.id === editingHostelId ? { ...h, name: editingHostelName } : h));
                          setEditingHostelId(null);
                          setEditingHostelName('');
                          showToast("Block Renamed", "Hostel Block has been renamed successfully.");
                        } else {
                          if (!newHostelName.trim()) return;
                          // Check duplicate name
                          if (hostels.some(h => h.name.toLowerCase() === newHostelName.toLowerCase())) {
                            showToast("Duplicate Name", "A block with this name already exists.", "info");
                            return;
                          }
                          setHostels(prev => [...prev, { id: `hblock-${Date.now()}`, name: newHostelName, archived: false }]);
                          setNewHostelName('');
                          showToast("Block Registered", "A new physical hostel block was recorded.");
                        }
                      }}
                      className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xxs font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      {editingHostelId ? "Update Name" : "Register Block"}
                    </button>
                    {editingHostelId && (
                      <button
                        onClick={() => {
                          setEditingHostelId(null);
                          setEditingHostelName('');
                        }}
                        className="px-3 bg-slate-200 hover:bg-slate-350 text-slate-700 rounded-xl text-xxs font-black uppercase"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* List of hostel blocks */}
              <div className="lg:col-span-8 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Registered Blocks Directory</h3>
                
                <div className="space-y-2">
                  {hostels.map(h => {
                    const associatedRoomsCount = hostelRooms.filter(r => r.block === h.name).length;
                    return (
                      <div 
                        key={h.id} 
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          h.archived 
                            ? 'bg-slate-50 border-slate-200/50 text-slate-400' 
                            : 'bg-white border-slate-150 text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs">{h.name}</span>
                            {h.archived && (
                              <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[7px] font-black uppercase">Archived</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            Registered Rooms: {associatedRoomsCount} rooms assigned to this Block
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingHostelId(h.id);
                              setEditingHostelName(h.name);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                          >
                            Rename
                          </button>

                          <button
                            onClick={() => {
                              setHostels(prev => prev.map(x => x.id === h.id ? { ...x, archived: !x.archived } : x));
                              showToast(
                                h.archived ? "Block Restored" : "Block Archived",
                                `${h.name} has been ${h.archived ? 'restored and activated' : 'stashed into archive'} successfully.`
                              );
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                              h.archived 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                : 'bg-amber-50 border-amber-200 text-amber-600'
                            }`}
                          >
                            {h.archived ? "Restore" : "Archive"}
                          </button>

                          <button
                            onClick={() => {
                              const confirmWipe = window.confirm(`CRITICAL: Confirm Permanent Block Deletion?\nBlock Name: ${h.name}\n\nWarning: Deleting this block will remove its registry from active listings. Bed assignments for this block will become orphaned. Continue?`);
                              if (!confirmWipe) return;

                              setHostels(prev => prev.filter(x => x.id !== h.id));
                              showToast("Block Purged", `${h.name} has been deleted permanently from the servers.`);
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                            title="Delete permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 3: DAILY MESS PLANS CRUD */}
          {hostelActiveSubTab === 'mess' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn text-xs">
              {/* Daily Menu configuration panel */}
              <div className="lg:col-span-5 border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Utensils className="h-4 w-4 text-emerald-500" /> 
                  {editingPlanId ? "Edit Mess Meal Plan" : "Create Mess Meal Plan"}
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Plan Name / Label</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-bold"
                      placeholder="e.g. Weekday Feast Plan C"
                      value={planForm.day}
                      onChange={(e) => setPlanForm({...planForm, day: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Breakfast Menu</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                      value={planForm.Breakfast}
                      onChange={(e) => setPlanForm({...planForm, Breakfast: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Lunch Menu</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                      value={planForm.Lunch}
                      onChange={(e) => setPlanForm({...planForm, Lunch: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Snacks Menu</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                      value={planForm.Snacks}
                      onChange={(e) => setPlanForm({...planForm, Snacks: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Dinner Menu</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                      value={planForm.Dinner}
                      onChange={(e) => setPlanForm({...planForm, Dinner: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!planForm.day.trim()) {
                          showToast("Validation Failed", "Meal Plan Name is a mandatory field.", "info");
                          return;
                        }

                        if (editingPlanId) {
                          setMessPlans(prev => prev.map(p => p.id === editingPlanId ? { ...p, ...planForm } : p));
                          setEditingPlanId(null);
                          showToast("Meal Plan Updated", "Plan was successfully saved.");
                        } else {
                          const newPlan = {
                            id: `mp-${Date.now()}`,
                            ...planForm,
                            archived: false
                          };
                          setMessPlans(prev => [...prev, newPlan]);
                          showToast("Meal Plan Created", "New daily mess menu recorded.");
                        }

                        // Clear form
                        setPlanForm({ day: '', Breakfast: '', Lunch: '', Snacks: '', Dinner: '' });
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-xs text-white cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <Utensils className="h-4 w-4" /> {editingPlanId ? "Save Meal Plan" : "Publish Menu Plan"}
                    </button>
                    {editingPlanId && (
                      <button
                        onClick={() => {
                          setEditingPlanId(null);
                          setPlanForm({ day: '', Breakfast: '', Lunch: '', Snacks: '', Dinner: '' });
                        }}
                        className="px-3 bg-slate-200 hover:bg-slate-350 text-slate-700 rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Active Daily Mess Board View */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {/* Active Menu Card */}
                <div className="border border-slate-200 rounded-3xl p-5 bg-slate-900 text-white shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Utensils className="h-48 w-48 text-white" />
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3 flex-wrap gap-2">
                      <div>
                        <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">Live Warden Board</span>
                        <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                          <Utensils className="h-4.5 w-4.5 text-emerald-400" /> Active: {activeMessPlan.day}
                        </h3>
                      </div>
                      <span className="text-[9px] bg-slate-800 text-slate-350 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                        Institutional Standard
                      </span>
                    </div>

                    {/* Menu Slots */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-start gap-3 bg-slate-850/50 p-2.5 rounded-xl border border-slate-800 hover:border-slate-750 transition-all">
                        <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                          <Sun className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Breakfast (07:30 AM - 09:30 AM)</span>
                          <p className="text-[11px] font-semibold text-slate-100 mt-0.5 leading-relaxed">{activeMessPlan.Breakfast}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-slate-850/50 p-2.5 rounded-xl border border-slate-800 hover:border-slate-750 transition-all">
                        <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                          <Utensils className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Lunch (12:30 PM - 02:30 PM)</span>
                          <p className="text-[11px] font-semibold text-slate-100 mt-0.5 leading-relaxed">{activeMessPlan.Lunch}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-slate-850/50 p-2.5 rounded-xl border border-slate-800 hover:border-slate-750 transition-all">
                        <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg shrink-0">
                          <Coffee className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Evening Tea & Snacks (05:00 PM - 06:00 PM)</span>
                          <p className="text-[11px] font-semibold text-slate-100 mt-0.5 leading-relaxed">{activeMessPlan.Snacks}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-slate-850/50 p-2.5 rounded-xl border border-slate-800 hover:border-slate-750 transition-all">
                        <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                          <Moon className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Dinner (08:00 PM - 09:30 PM)</span>
                          <p className="text-[11px] font-semibold text-slate-100 mt-0.5 leading-relaxed">{activeMessPlan.Dinner}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-850 pt-2.5 mt-3 text-slate-500 text-[9px] text-center font-bold">
                    ⚠️ Note: Hostel entry strictly prohibited for non-residents post 09:30 PM. Maintain mess cleanliness.
                  </div>
                </div>

                {/* List of custom meal plans */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2 max-h-56 overflow-y-auto">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                    Meal Plans Catalog ({messPlans.length} records)
                  </span>

                  {messPlans.map(mp => (
                    <div 
                      key={mp.id} 
                      className={`flex items-center justify-between p-2.5 rounded-xl border bg-white ${
                        mp.archived ? 'border-slate-200 opacity-60' : 'border-slate-150'
                      }`}
                    >
                      <div className="text-left">
                        <span className="font-extrabold text-xs text-slate-800">{mp.day}</span>
                        <div className="flex gap-2 text-[9px] text-slate-400 font-bold mt-0.5">
                          <span>Active: {mp.id === activeMessPlanId ? 'YES' : 'NO'}</span>
                          <span>•</span>
                          <span>Archived: {mp.archived ? 'YES' : 'NO'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {mp.id !== activeMessPlanId && !mp.archived && (
                          <button
                            onClick={() => {
                              setActiveMessPlanId(mp.id);
                              showToast("Menu Swapped", `Set "${mp.day}" as the live daily mess menu.`);
                            }}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold"
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingPlanId(mp.id);
                            setPlanForm({
                              day: mp.day,
                              Breakfast: mp.Breakfast,
                              Lunch: mp.Lunch,
                              Snacks: mp.Snacks,
                              Dinner: mp.Dinner
                            });
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setMessPlans(prev => prev.map(p => p.id === mp.id ? { ...p, archived: !p.archived } : p));
                            showToast(
                              mp.archived ? "Plan Restored" : "Plan Archived",
                              `"${mp.day}" meal plan status updated.`
                            );
                          }}
                          className={`px-2 py-1 rounded text-[9px] font-bold ${
                            mp.archived ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {mp.archived ? "Restore" : "Archive"}
                        </button>
                        {mp.id !== activeMessPlanId && (
                          <button
                            onClick={() => {
                              const confirmPurge = window.confirm(`Confirm Permanent Meal Plan Deletion?\nPlan Label: ${mp.day}\n\nWarning: This action is completely irreversible. Continue?`);
                              if (!confirmPurge) return;
                              setMessPlans(prev => prev.filter(p => p.id !== mp.id));
                              showToast("Plan Purged", "The meal plan has been permanently removed.");
                            }}
                            className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Lesson Planning */}
      {activeModule === 'lesson' && (() => {
        const totalSyllabusPeriods = syllabusChapters.reduce((acc, curr) => acc + curr.assignedPeriods, 0);
        const totalCompletedPeriods = syllabusChapters.reduce((acc, curr) => acc + curr.completedPeriods, 0);
        const overallProgress = totalSyllabusPeriods > 0 ? Math.round((totalCompletedPeriods / totalSyllabusPeriods) * 100) : 0;

        const handleApplyPreset = (presetKey: string) => {
          const preset = NEP_PRESETS[presetKey];
          if (preset) {
            setSelectedSyllabusPreset(presetKey);
            setSyllabusChapters(JSON.parse(JSON.stringify(preset.chapters)));
            setCustomClassGroup(preset.standard);
            setCustomTotalPeriods(preset.standardPeriods);
            showToast("NEP 2020 Plan Loaded", `Syllabus pre-populated for "${presetKey}" (${preset.standardPeriods} periods target).`);
          }
        };

        return (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
            {/* Header Block */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-sky-50 border border-sky-150 rounded-full text-sky-700 text-[10px] font-bold tracking-wider uppercase">
                  <Sparkles className="h-3 w-3 text-sky-500 animate-pulse" />
                  <span>NEP 2020 Compliant Syllabus Planner</span>
                </div>
                <h2 className="text-xl font-black text-slate-800 mt-1.5 tracking-tight flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-sky-600" />
                  <span>Lesson Planning & Academic Syllabus Desk</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Track chapter-wise course progress, assign standard periods, and align with central CBSE curriculum guidelines.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (syllabusChapters.length > 0) {
                      const chapterNames = syllabusChapters.map(ch => ch.chapter).join('\n');
                      setSmartChaptersInput(chapterNames);
                      
                      const updatedWeights = { ...smartWeights };
                      syllabusChapters.forEach((ch, idx) => {
                        const key = `${idx}-${ch.chapter}`;
                        if (!updatedWeights[key]) {
                          updatedWeights[key] = 'medium';
                        }
                      });
                      setSmartWeights(updatedWeights);
                    }
                    setIsSmartPlannerOpen(true);
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xxs font-black transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wider"
                >
                  <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                  <span>Smart Period Planner</span>
                </button>
              </div>

              {/* Sub-tabs to switch between NEP planner and legacy quick log */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setLessonSubTab('syllabus')}
                  className={`px-3 py-1.5 rounded-lg text-xxs font-black transition-all cursor-pointer uppercase ${
                    lessonSubTab === 'syllabus'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Syllabus Planner
                </button>
                <button
                  onClick={() => setLessonSubTab('daily')}
                  className={`px-3 py-1.5 rounded-lg text-xxs font-black transition-all cursor-pointer uppercase ${
                    lessonSubTab === 'daily'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Daily Topics Log
                </button>
              </div>
            </div>

            {lessonSubTab === 'syllabus' ? (
              <div className="space-y-6">
                {/* Top overview statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border border-slate-150 bg-slate-50/50 rounded-2xl p-4 space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Class Group</span>
                    <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-sky-600" />
                      {customClassGroup}
                    </span>
                  </div>

                  <div className="border border-slate-150 bg-slate-50/50 rounded-2xl p-4 space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">NEP Target Periods</span>
                    <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-sky-600" />
                      {customTotalPeriods} Periods <span className="text-[10px] font-semibold text-slate-400">({customClassGroup === 'Classes XI - XII' ? '4 Months' : 'Shorter'})</span>
                    </span>
                  </div>

                  <div className="border border-slate-150 bg-slate-50/50 rounded-2xl p-4 space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Planned Periods</span>
                    <span className={`text-sm font-black flex items-center gap-1.5 ${totalSyllabusPeriods > Number(customTotalPeriods) ? 'text-amber-600' : 'text-slate-800'}`}>
                      <FileText className="h-4 w-4" />
                      {totalSyllabusPeriods} Periods
                      {totalSyllabusPeriods > Number(customTotalPeriods) && (
                        <span className="text-[9px] font-bold px-1 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">Over allocated</span>
                      )}
                    </span>
                  </div>

                  <div className="border border-indigo-100 bg-indigo-50/25 rounded-2xl p-4 space-y-1">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block">Overall Syllabus Completion</span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-indigo-700">{overallProgress}% Done</span>
                      <span className="text-[10px] font-bold text-slate-500">{totalCompletedPeriods}/{totalSyllabusPeriods} Periods</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-indigo-600 transition-all" style={{ width: `${overallProgress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Main planner panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Controls column */}
                  <div className="space-y-4">
                    {/* Presets & Configurations */}
                    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                      <div>
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                          <span>Load NEP 2020 Preset Syllabus</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Quickly pre-populate chapter structures with government specified standard periods.</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-black text-slate-450 uppercase mb-1">Select Subject & Grade Preset</label>
                          <select
                            className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-bold"
                            value={selectedSyllabusPreset}
                            onChange={(e) => handleApplyPreset(e.target.value)}
                          >
                            <option value="Physics XII">📘 Physics Class XII (CBSE 104 Periods)</option>
                            <option value="Chemistry XII">🧪 Chemistry Class XII (CBSE 104 Periods)</option>
                            <option value="Mathematics XII">📐 Mathematics Class XII (CBSE 104 Periods)</option>
                            <option value="Science X">🧪 Science Class X (CBSE 80 Periods)</option>
                            <option value="Mathematics X">📊 Mathematics Class X (CBSE 80 Periods)</option>
                            <option value="Custom">⚙️ Custom Syllabus Planner</option>
                          </select>
                        </div>

                        {/* Standard parameters setting */}
                        <div className="border-t border-slate-200 pt-3 space-y-3">
                          <span className="block text-xxxxs font-black text-slate-400 uppercase tracking-widest">Syllabus Parameters</span>
                          <div>
                            <label className="block text-[9px] font-black text-slate-450 uppercase mb-1">Standard Class Group</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomClassGroup('Classes XI - XII');
                                  setCustomTotalPeriods(104);
                                }}
                                className={`px-2 py-1.5 text-[10px] font-bold border rounded-lg transition-all cursor-pointer text-center ${
                                  customClassGroup === 'Classes XI - XII'
                                    ? 'bg-sky-50 border-sky-300 text-sky-700'
                                    : 'bg-white border-slate-200 text-slate-500'
                                }`}
                              >
                                Classes XI - XII (104 p)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomClassGroup('Classes IX - X');
                                  setCustomTotalPeriods(80);
                                }}
                                className={`px-2 py-1.5 text-[10px] font-bold border rounded-lg transition-all cursor-pointer text-center ${
                                  customClassGroup === 'Classes IX - X'
                                    ? 'bg-sky-50 border-sky-300 text-sky-700'
                                    : 'bg-white border-slate-200 text-slate-500'
                                }`}
                              >
                                Classes IX - X (80 p)
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] font-black text-slate-450 uppercase mb-1">Assigned Target Periods</label>
                            <input
                              type="number"
                              className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-indigo-500"
                              value={customTotalPeriods}
                              onChange={(e) => setCustomTotalPeriods(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="e.g. 104"
                            />
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                              {customClassGroup === 'Classes XI - XII' 
                                ? "💡 NEP 2020 Standard: Senior secondary syllabus takes 4 months / 104 periods." 
                                : "💡 NEP 2020 Standard: Secondary school syllabus is shorter, taking 80 periods."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add Custom Chapter Block */}
                    <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                      <div>
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Plus className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Add Custom Chapter Unit</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Extend the loaded standard template with custom sub-topics or test series cycles.</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-black text-slate-450 uppercase mb-1">Chapter Name / Topic Unit</label>
                          <input
                            type="text"
                            placeholder="e.g. Semiconductor Devices"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-indigo-500"
                            value={newChapterName}
                            onChange={(e) => setNewChapterName(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-slate-450 uppercase mb-1">Target Periods Required</label>
                          <input
                            type="number"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:bg-white focus:outline-indigo-500"
                            value={newChapterPeriods}
                            onChange={(e) => setNewChapterPeriods(e.target.value === '' ? '' : Number(e.target.value))}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!newChapterName.trim()) {
                              showToast("Title Missing", "Please enter a valid name for the new syllabus unit.", "info");
                              return;
                            }
                            const newCh: ChapterPlan = {
                              id: `custom-ch-${Date.now()}`,
                              chapter: newChapterName,
                              standardPeriods: newChapterPeriods === '' ? 0 : Number(newChapterPeriods),
                              assignedPeriods: newChapterPeriods === '' ? 0 : Number(newChapterPeriods),
                              completedPeriods: 0
                            };
                            setSyllabusChapters([...syllabusChapters, newCh]);
                            setNewChapterName('');
                            showToast("Chapter Unit Saved", `"${newChapterName}" successfully integrated to active syllabus outline.`);
                          }}
                          className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 font-black text-xs text-white cursor-pointer transition-all uppercase tracking-wide"
                        >
                          Append Syllabus Unit
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Detailed Chapters list column */}
                  <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Syllabus Breakdown ({syllabusChapters.length} Chapters)</h3>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to reset the current chapter plan to blank?")) {
                            setSyllabusChapters([]);
                            setSelectedSyllabusPreset('Custom');
                            showToast("Planner Reset", "Syllabus board cleared completely.");
                          }
                        }}
                        className="text-[9.5px] font-extrabold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Reset Plan</span>
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                      {syllabusChapters.map((chapterObj, idx) => {
                        const isOverAllocation = chapterObj.assignedPeriods > chapterObj.standardPeriods;
                        const itemProgress = chapterObj.assignedPeriods > 0 
                          ? Math.round((chapterObj.completedPeriods / chapterObj.assignedPeriods) * 100) 
                          : 0;

                        return (
                          <div key={chapterObj.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/20 flex flex-col space-y-3 hover:border-slate-300 transition-all duration-150">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-black">Ch-{idx+1}</span>
                                  {chapterObj.standardPeriods > 0 && (
                                    <span className="text-[9px] text-slate-450 font-semibold">NEP Std: {chapterObj.standardPeriods} Periods</span>
                                  )}
                                </div>
                                <h4 className="text-xs font-black text-slate-800 mt-1">{chapterObj.chapter}</h4>
                              </div>

                              <button
                                onClick={() => {
                                  const updated = syllabusChapters.filter(ch => ch.id !== chapterObj.id);
                                  setSyllabusChapters(updated);
                                  showToast("Unit Removed", `"${chapterObj.chapter}" has been removed from the curriculum.`);
                                }}
                                className="text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                                title="Delete unit"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Period Sliders & Increment tools */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                              {/* Assigned periods editor */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-450 uppercase flex items-center justify-between">
                                  <span>Assigned Periods:</span>
                                  <span className={`font-bold ${isOverAllocation ? 'text-amber-600' : 'text-slate-700'}`}>
                                    {chapterObj.assignedPeriods} hrs / periods
                                  </span>
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      const updated = syllabusChapters.map(ch => {
                                        if (ch.id === chapterObj.id) {
                                          const val = Math.max(1, ch.assignedPeriods - 1);
                                          const comp = Math.min(ch.completedPeriods, val);
                                          return { ...ch, assignedPeriods: val, completedPeriods: comp };
                                        }
                                        return ch;
                                      });
                                      setSyllabusChapters(updated);
                                    }}
                                    className="px-2 py-1 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="range"
                                    min="1"
                                    max="60"
                                    value={chapterObj.assignedPeriods}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = syllabusChapters.map(ch => {
                                        if (ch.id === chapterObj.id) {
                                          const comp = Math.min(ch.completedPeriods, val);
                                          return { ...ch, assignedPeriods: val, completedPeriods: comp };
                                        }
                                        return ch;
                                      });
                                      setSyllabusChapters(updated);
                                    }}
                                    className="flex-1 accent-indigo-600 cursor-pointer"
                                  />
                                  <button
                                    onClick={() => {
                                      const updated = syllabusChapters.map(ch => ch.id === chapterObj.id ? { ...ch, assignedPeriods: ch.assignedPeriods + 1 } : ch);
                                      setSyllabusChapters(updated);
                                    }}
                                    className="px-2 py-1 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Progress / Completion counter */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-450 uppercase flex items-center justify-between">
                                  <span>Completed Periods:</span>
                                  <span className="font-bold text-emerald-600">
                                    {chapterObj.completedPeriods} of {chapterObj.assignedPeriods} Completed
                                  </span>
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center gap-1 flex-1">
                                    <button
                                      disabled={chapterObj.completedPeriods === 0}
                                      onClick={() => {
                                        const updated = syllabusChapters.map(ch => ch.id === chapterObj.id ? { ...ch, completedPeriods: Math.max(0, ch.completedPeriods - 1) } : ch);
                                        setSyllabusChapters(updated);
                                      }}
                                      className="px-2 py-1 bg-white border border-slate-250 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <span className="flex-1 text-center font-black text-xs text-slate-700">{chapterObj.completedPeriods} p</span>
                                    <button
                                      disabled={chapterObj.completedPeriods >= chapterObj.assignedPeriods}
                                      onClick={() => {
                                        const updated = syllabusChapters.map(ch => ch.id === chapterObj.id ? { ...ch, completedPeriods: Math.min(ch.assignedPeriods, ch.completedPeriods + 1) } : ch);
                                        setSyllabusChapters(updated);
                                        if (chapterObj.completedPeriods + 1 === chapterObj.assignedPeriods) {
                                          showToast("Chapter Completed", `"${chapterObj.chapter}" is fully covered as per course milestones!`);
                                        }
                                      }}
                                      className="px-2 py-1 bg-white border border-slate-250 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => {
                                      const updated = syllabusChapters.map(ch => ch.id === chapterObj.id ? { ...ch, completedPeriods: ch.assignedPeriods } : ch);
                                      setSyllabusChapters(updated);
                                      showToast("Chapter Completed", `"${chapterObj.chapter}" is marked as 100% completed!`);
                                    }}
                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg transition-all cursor-pointer uppercase shrink-0"
                                  >
                                    All Clear
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Item-specific progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-xxxxs font-black text-slate-400 uppercase">
                                <span>Curriculum Progress:</span>
                                <span>{itemProgress}% Covered</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                                  style={{ width: `${itemProgress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Daily topic completion log */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                <div className="space-y-4">
                  {/* Topic Log Form */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Log Topic Completion</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Subject</label>
                        <select
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                          value={selectedLessonSubject}
                          onChange={(e) => setSelectedLessonSubject(e.target.value)}
                        >
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Mathematics">Mathematics</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Active Batch</label>
                        <select
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                          value={commSelectedBatch || 'JEE Elite 2026'}
                          onChange={(e) => setCommSelectedBatch(e.target.value)}
                        >
                          {batches.map(b => (
                            <option key={b.id} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">New Chapter/Topic Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Electromagnetism Introduction"
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                          value={newLessonTopic}
                          onChange={(e) => setNewLessonTopic(e.target.value)}
                        />
                      </div>
                      
                      <button
                        onClick={() => {
                          if (!newLessonTopic) return;
                          setLessons([...lessons, {
                            id: `l${lessons.length + 1}`,
                            subject: selectedLessonSubject,
                            topic: newLessonTopic,
                            batch: commSelectedBatch || 'JEE Elite 2026',
                            progress: 10,
                            status: 'In-Progress'
                          }]);
                          setNewLessonTopic('');
                          showToast("Topic Logged", "New syllabus milestone added to study curriculum.");
                        }}
                        className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 font-black text-xs text-white cursor-pointer transition-all"
                      >
                        Schedule Curriculum Topic
                      </button>
                    </div>
                  </div>

                  {/* 2-Hour Daily Log Auto-Reminder Panel */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-500" /> Auto-Reminder Desk
                      </h3>
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded text-[8px] font-black uppercase tracking-wider">
                        ● Active (Every 2h)
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">
                      Sends automated SMS and WhatsApp reminders to teachers with pending syllabus logs for today's classes.
                    </p>
                    
                    <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Pending Faculty Today:</span>
                      <div className="space-y-1.5 text-xxs font-bold">
                        <div className="flex justify-between items-center text-slate-700">
                          <span>Prof. Satish Verma (Maths)</span>
                          <span className="text-amber-600">Pending Log</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-700">
                          <span>Dr. Anita Deshmukh (Chem)</span>
                          <span className="text-amber-600">Pending Log</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                      <span>Next automatic alert check:</span>
                      <span className="font-mono text-indigo-600">01h 44m</span>
                    </div>

                    <button
                      onClick={() => {
                        showToast("Reminders Dispatched", "2-hour incomplete topic alert sent successfully to pending faculty via SMS and WhatsApp gateways!");
                      }}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xxs rounded-lg transition-all cursor-pointer text-center uppercase tracking-wider"
                    >
                      ⚡ Force Dispatch Alerts Now
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Syllabus Completion Chart</h3>
                  <div className="space-y-3.5">
                    {lessons.map((les) => (
                      <div key={les.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-sky-50 text-sky-600 border border-sky-100 rounded text-[9px] font-bold">{les.subject}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{les.batch}</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-800 mt-1.5">{les.topic}</h4>
                        </div>
                        <div className="w-full sm:w-44 shrink-0 space-y-1 text-left sm:text-right">
                          <div className="flex justify-between sm:justify-end gap-2 text-xxs font-black text-slate-450 uppercase">
                            <span>Progress:</span>
                            <span className="text-indigo-600 font-extrabold">{les.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-sky-500 rounded-full transition-all"
                              style={{ width: `${les.progress}%` }}
                            />
                          </div>
                          {les.progress < 100 ? (
                            <button
                              onClick={() => {
                                const updated = lessons.map(l => l.id === les.id ? { ...l, progress: 100, status: 'Completed' } : l);
                                setLessons(updated);
                                showToast("Progress Updated", `Syllabus topic "${les.topic}" is now marked 100% completed!`);
                              }}
                              className="text-[9px] font-bold text-sky-600 hover:text-sky-800 mt-1 cursor-pointer block"
                            >
                              ✓ Mark completed
                            </button>
                          ) : (
                            <span className="text-[9px] text-emerald-600 font-bold mt-1 block">✓ Complete</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* 5. Smart Period Planner Modal */}
            {isSmartPlannerOpen && (() => {
              const parsedChapters = smartChaptersInput
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

              const totalTeachingWeeks = smartMonths * 4.33;
              const calculatedTotalPeriods = Math.round(totalTeachingWeeks * smartWeeklyPeriods);

              const weightMultipliers = {
                low: 0.6,
                medium: 1.0,
                high: 1.6,
              };

              const sumWeights = parsedChapters.reduce((sum, chName, idx) => {
                const key = `${idx}-${chName}`;
                const w = smartWeights[key] || 'medium';
                return sum + weightMultipliers[w];
              }, 0);

              let distributedChapters = parsedChapters.map((chName, idx) => {
                const key = `${idx}-${chName}`;
                const w = smartWeights[key] || 'medium';
                const mult = weightMultipliers[w];
                const share = sumWeights > 0 ? (mult / sumWeights) : (1 / parsedChapters.length);
                const periods = Math.round(share * calculatedTotalPeriods);
                return {
                  chapter: chName,
                  weight: w,
                  periods: Math.max(1, periods),
                };
              });

              // Apply rounding correction
              const sumOfDistributed = distributedChapters.reduce((sum, item) => sum + item.periods, 0);
              const diff = calculatedTotalPeriods - sumOfDistributed;
              if (diff !== 0 && distributedChapters.length > 0) {
                let maxIdx = 0;
                let maxVal = -1;
                distributedChapters.forEach((item, idx) => {
                  if (item.periods > maxVal) {
                    maxVal = item.periods;
                    maxIdx = idx;
                  }
                });
                distributedChapters[maxIdx].periods = Math.max(1, distributedChapters[maxIdx].periods + diff);
              }

              return (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
                    {/* Modal Header */}
                    <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                          <Sparkles className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-800">Smart Academic Period Planner</h3>
                          <p className="text-[11px] text-slate-400">Generate fully balanced timelines mapped to NEP-2020 recommended course weights.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsSmartPlannerOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 md:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                      {/* Left: Input Configuration */}
                      <div className="lg:col-span-5 space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            <span>1. Define Course Timeline</span>
                          </h4>

                          <div className="space-y-3.5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                            <div>
                              <label className="block text-[10px] font-black text-slate-455 uppercase mb-1 flex justify-between">
                                <span>Course Duration:</span>
                                <span className="text-indigo-600 font-extrabold">{smartMonths} Months</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="1"
                                  max="12"
                                  value={smartMonths}
                                  onChange={(e) => setSmartMonths(Number(e.target.value))}
                                  className="flex-1 accent-indigo-600 cursor-pointer"
                                />
                                <span className="w-8 text-center text-xs font-bold text-slate-700">{smartMonths}m</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-black text-slate-455 uppercase mb-1 flex justify-between">
                                <span>Subject Periods per Week:</span>
                                <span className="text-indigo-600 font-extrabold">{smartWeeklyPeriods} Periods</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={smartWeeklyPeriods}
                                  onChange={(e) => setSmartWeeklyPeriods(Number(e.target.value))}
                                  className="flex-1 accent-indigo-600 cursor-pointer"
                                />
                                <span className="w-8 text-center text-xs font-bold text-slate-700">{smartWeeklyPeriods}p</span>
                              </div>
                            </div>

                            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xxs font-bold text-slate-500">
                              <span>TEACHING WEEKS:</span>
                              <span className="text-slate-750">{totalTeachingWeeks.toFixed(1)} Weeks</span>
                            </div>
                            <div className="flex justify-between items-center text-xxs font-bold text-slate-500">
                              <span>TOTAL CLASS PERIODS:</span>
                              <span className="text-indigo-700 font-extrabold">{calculatedTotalPeriods} Periods</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-indigo-500" />
                            <span>2. Syllabus Chapters list</span>
                          </h4>
                          <div className="space-y-2">
                            <label className="block text-[9.5px] font-bold text-slate-400">Enter chapter titles (One chapter per line):</label>
                            <textarea
                              className="w-full h-36 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-indigo-500 rounded-2xl p-3 text-xs text-slate-700 font-medium leading-relaxed resize-none"
                              placeholder="Enter chapters..."
                              value={smartChaptersInput}
                              onChange={(e) => setSmartChaptersInput(e.target.value)}
                            />
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>Total detected: <strong className="text-slate-700">{parsedChapters.length}</strong> chapters</span>
                              <button
                                onClick={() => {
                                  if (confirm("Reset chapters input to standard 5-unit syllabus?")) {
                                    setSmartChaptersInput("Electrostatics\nCurrent Electricity\nElectromagnetic Induction & AC\nOptics & Light\nModern Physics");
                                    setSmartWeights({});
                                  }
                                }}
                                className="text-indigo-600 hover:underline cursor-pointer"
                              >
                                Reset to default
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Smart Live Preview */}
                      <div className="lg:col-span-7 flex flex-col space-y-4">
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-indigo-500 animate-spin" style={{ animationDuration: '3s' }} />
                          <span>3. Live Syllabus Weights & Distribution</span>
                        </h4>

                        {parsedChapters.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400 space-y-2">
                            <FileText className="h-10 w-10 text-slate-300 animate-bounce" />
                            <span className="text-xs font-bold">No chapters detected</span>
                            <span className="text-[11px]">Type or paste chapter names on the left to start distribution.</span>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col space-y-4">
                            <div className="border border-slate-200 rounded-2xl overflow-hidden flex-1 flex flex-col">
                              <div className="bg-slate-50 border-b border-slate-150 p-3 grid grid-cols-12 gap-2 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                <span className="col-span-5">Chapter Name</span>
                                <span className="col-span-4 text-center">Complexity Weight</span>
                                <span className="col-span-3 text-right">Periods / Est. Duration</span>
                              </div>

                              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[250px] flex-1">
                                {distributedChapters.map((item, idx) => {
                                  const key = `${idx}-${item.chapter}`;
                                  const estWeeks = item.periods / smartWeeklyPeriods;
                                  return (
                                    <div key={idx} className="p-3 grid grid-cols-12 gap-2 items-center text-xs">
                                      <div className="col-span-5 min-w-0 pr-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-150 px-1 py-0.5 rounded shrink-0">
                                            Ch-{idx + 1}
                                          </span>
                                          <span className="font-bold text-slate-800 truncate block" title={item.chapter}>
                                            {item.chapter}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Weight Selection Buttons */}
                                      <div className="col-span-4 flex justify-center">
                                        <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 gap-0.5">
                                          {(['low', 'medium', 'high'] as const).map((w) => {
                                            const active = item.weight === w;
                                            let activeStyle = '';
                                            if (active) {
                                              if (w === 'low') activeStyle = 'bg-emerald-500 text-white shadow-xs';
                                              if (w === 'medium') activeStyle = 'bg-sky-500 text-white shadow-xs';
                                              if (w === 'high') activeStyle = 'bg-indigo-600 text-white shadow-xs';
                                            } else {
                                              activeStyle = 'text-slate-400 hover:text-slate-700 hover:bg-white/50';
                                            }
                                            return (
                                              <button
                                                key={w}
                                                type="button"
                                                onClick={() => {
                                                  setSmartWeights({
                                                    ...smartWeights,
                                                    [key]: w
                                                  });
                                                }}
                                                className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeStyle}`}
                                              >
                                                {w}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Periods Display */}
                                      <div className="col-span-3 text-right">
                                        <span className="font-extrabold text-slate-800 block">{item.periods} periods</span>
                                        <span className="text-[10px] text-indigo-500 font-semibold block">
                                          ~{estWeeks.toFixed(1)} Weeks ({item.periods} days)
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Info Banner */}
                            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-3.5 text-[11px] text-amber-800 leading-relaxed flex gap-2.5">
                              <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                              <div>
                                <strong className="block font-black mb-0.5">⚡ Scientific Resource Distribution Active</strong>
                                Higher weights allocate more standard periods to complex topics. The system perfectly balance-distributes the target <strong className="font-extrabold text-amber-900">{calculatedTotalPeriods} periods</strong> across all {parsedChapters.length} chapters automatically!
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="bg-slate-50 border-t border-slate-100 p-5 flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => setIsSmartPlannerOpen(false)}
                        className="px-4 py-2 border border-slate-250 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 cursor-pointer transition-all"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={parsedChapters.length === 0}
                        onClick={() => {
                          const mappedChapters: ChapterPlan[] = distributedChapters.map((item, idx) => ({
                            id: `smart-ch-${idx}-${Date.now()}`,
                            chapter: item.chapter,
                            standardPeriods: item.periods,
                            assignedPeriods: item.periods,
                            completedPeriods: 0,
                          }));

                          setSyllabusChapters(mappedChapters);
                          setCustomTotalPeriods(calculatedTotalPeriods);
                          setIsSmartPlannerOpen(false);
                          showToast("Smart Plan Implemented", `Calculated ${mappedChapters.length} chapters distributed over ${smartMonths} Months timeline.`);
                        }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black cursor-pointer transition-all uppercase tracking-wide flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Apply Distributed Plan</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* 6. Staff Recruitment */}
      {activeModule === 'recruitment' && (() => {
        const onlineCandidates = (jobApplications || []).map(app => ({
          id: app.id,
          name: app.name,
          role: app.vacancyTitle || `${app.subject} Educator`,
          experience: app.experience,
          phone: app.phone,
          email: app.email,
          status: (app.status || '').startsWith('AI Screened') ? 'Applied' : (app.status || 'Applied'),
          resumeName: app.resumeName || `CV_${app.name.replace(/\s+/g, '_')}.pdf`,
          isOnline: true,
          rawApplication: app,
        }));

        const internalCandidates = candidates.map(c => ({
          ...c,
          isOnline: false,
          email: (c as any).email || 'internal@institute.org',
          resumeName: (c as any).resumeName || `CV_${c.name.replace(/\s+/g, '_')}.pdf`,
        }));

        const filteredCandidates = [
          ...(recruitmentFilter !== 'internal' ? onlineCandidates : []),
          ...(recruitmentFilter !== 'online' ? internalCandidates : []),
        ];

        const handleSetCandidateStatus = (cand: any, newStatus: string) => {
          if (cand.isOnline) {
            if (onUpdateJobApplications && jobApplications) {
              const updatedApps = jobApplications.map(app => {
                if (app.id === cand.id) {
                  const updatedTimeline = app.timeline ? [...app.timeline] : [];
                  const syncIndex = updatedTimeline.findIndex(t => t.label === 'HR Registry Sync');
                  if (syncIndex !== -1) {
                    updatedTimeline[syncIndex] = { ...updatedTimeline[syncIndex], date: newStatus, done: true };
                  } else {
                    updatedTimeline.push({ label: 'HR Registry Sync', date: newStatus, done: true });
                  }
                  return {
                    ...app,
                    status: newStatus,
                    timeline: updatedTimeline
                  };
                }
                return app;
              });
              onUpdateJobApplications(updatedApps);
              if (viewingCvCandidate && viewingCvCandidate.id === cand.id) {
                setViewingCvCandidate(prev => prev ? { ...prev, status: newStatus } : null);
              }
            }
          } else {
            const updated = candidates.map(c => c.id === cand.id ? { ...c, status: newStatus } : c);
            setCandidates(updated);
            if (viewingCvCandidate && viewingCvCandidate.id === cand.id) {
              setViewingCvCandidate(prev => prev ? { ...prev, status: newStatus } : null);
            }
          }
          showToast("Status Updated", `${cand.name} status updated to "${newStatus}"!`);
        };

        return (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left relative">
            <div>
              <h2 className="text-lg font-black text-slate-800">Staff Recruitment Portal</h2>
              <p className="text-xs text-slate-400">Track job candidates, run teaching demos, and manage recruitment lifecycles.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Log Candidate Application</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Candidate Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter Candidate Name"
                      className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Target Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Inorganic Chemistry Educator"
                      className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                      value={newCandidate.role}
                      onChange={(e) => setNewCandidate({...newCandidate, role: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Experience</label>
                      <input
                        type="text"
                        placeholder="e.g. 5 Years"
                        className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                        value={newCandidate.experience}
                        onChange={(e) => setNewCandidate({...newCandidate, experience: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Phone Contact</label>
                      <input
                        type="text"
                        placeholder="+91..."
                        className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                        value={newCandidate.phone}
                        onChange={(e) => setNewCandidate({...newCandidate, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  {/* File Upload Box for CV */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Attach Resume / CV (PDF Only)</label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-slate-350 hover:border-indigo-500 rounded-xl cursor-pointer bg-white text-xxs font-black text-slate-650 hover:text-indigo-700 transition-colors">
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>{newCandidate.resumeName ? 'Change File' : 'Attach PDF CV'}</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewCandidate({ ...newCandidate, resumeName: file.name });
                              showToast("CV Selected", `Attached "${file.name}" to candidate profile.`, "success");
                            }
                          }}
                        />
                      </label>
                      {newCandidate.resumeName && (
                        <span className="text-[10px] text-indigo-750 font-bold truncate max-w-[150px]" title={newCandidate.resumeName}>
                          {newCandidate.resumeName}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newCandidate.name || !newCandidate.role) return;
                      setCandidates([...candidates, {
                        id: `c${candidates.length + 1}`,
                        name: newCandidate.name,
                        role: newCandidate.role,
                        experience: newCandidate.experience,
                        phone: newCandidate.phone || '+91 XXXXX XXXXX',
                        resumeName: newCandidate.resumeName || undefined,
                        status: 'Applied'
                      } as any]);
                      setNewCandidate({ name: '', role: 'Senior Physics Mentor', experience: '5 Years', phone: '', resumeName: '' });
                      showToast("Candidate Logged", "Job application successfully filed into ATS.");
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white cursor-pointer transition-all"
                  >
                    Register Application
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 space-y-4">
                {/* Recruitment Sub-Tabs Header */}
                <div className="flex border-b border-slate-150 pb-2 mb-2">
                  <button
                    onClick={() => setRecruitmentSubTab('pipeline')}
                    className={`pb-2 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[10px] cursor-pointer ${
                      recruitmentSubTab === 'pipeline'
                        ? 'border-blue-600 text-blue-600 font-extrabold'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    ATS Pipeline List
                  </button>
                  <button
                    onClick={() => setRecruitmentSubTab('demo_feedback')}
                    className={`pb-2 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[10px] cursor-pointer flex items-center gap-1.5 ${
                      recruitmentSubTab === 'demo_feedback'
                        ? 'border-blue-600 text-blue-600 font-extrabold'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>Demo Class Feedback Logs</span>
                    {lecturerEvaluations.filter(e => e.isDemo).length > 0 && (
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        {lecturerEvaluations.filter(e => e.isDemo).length}
                      </span>
                    )}
                  </button>
                </div>

                {recruitmentSubTab === 'pipeline' ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Pipeline (ATS)</h3>
                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                        <button
                          onClick={() => setRecruitmentFilter('all')}
                          className={`px-2.5 py-1 rounded-lg text-xxs font-black transition-all cursor-pointer ${
                            recruitmentFilter === 'all' ? 'bg-white text-slate-800 shadow-xxs' : 'text-slate-450 hover:text-slate-700'
                          }`}
                        >
                          All ({onlineCandidates.length + internalCandidates.length})
                        </button>
                        <button
                          onClick={() => setRecruitmentFilter('online')}
                          className={`px-2.5 py-1 rounded-lg text-xxs font-black transition-all cursor-pointer ${
                            recruitmentFilter === 'online' ? 'bg-white text-indigo-700 shadow-xxs' : 'text-slate-450 hover:text-indigo-750'
                          }`}
                        >
                          Careers Portal ({onlineCandidates.length})
                        </button>
                        <button
                          onClick={() => setRecruitmentFilter('internal')}
                          className={`px-2.5 py-1 rounded-lg text-xxs font-black transition-all cursor-pointer ${
                            recruitmentFilter === 'internal' ? 'bg-white text-slate-800 shadow-xxs' : 'text-slate-450 hover:text-slate-700'
                          }`}
                        >
                          Internal ({internalCandidates.length})
                        </button>
                      </div>
                    </div>

                    {filteredCandidates.length === 0 ? (
                      <div className="py-12 text-center text-slate-450 border border-dashed border-slate-200 rounded-2xl">
                        <Briefcase className="h-8 w-8 mx-auto opacity-30 mb-2" />
                        <p className="text-xs font-bold">No candidates found in this category.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {filteredCandidates.map((cand) => (
                          <div key={cand.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/20 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                            <div className="space-y-1">
                              <div className="flex items-center flex-wrap gap-2">
                                <p className="text-xs font-black text-slate-800">{cand.name}</p>
                                {cand.isOnline ? (
                                  <span className="text-[8px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">
                                    Careers Portal
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-black uppercase text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                    Internal ATS
                                  </span>
                                )}
                              </div>
                              <p className="text-xxs text-slate-500 font-bold">{cand.role} | {cand.experience}</p>
                              <p className="text-xxs text-slate-400 font-mono">Ph: {cand.phone} | Email: {cand.email}</p>
                              
                              {cand.resumeName && (
                                <div className="mt-2.5 flex items-center gap-2 text-xxs font-black text-indigo-700 bg-indigo-50/55 border border-indigo-150 rounded-xl px-2.5 py-1.5 w-fit">
                                  <FileText className="h-3.5 w-3.5 text-indigo-500" />
                                  <span className="truncate max-w-[180px]">CV: {cand.resumeName}</span>
                                  <button
                                    onClick={() => setViewingCvCandidate(cand)}
                                    className="underline hover:text-indigo-900 cursor-pointer text-indigo-600 font-extrabold ml-1"
                                  >
                                    View CV Dossier
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col sm:items-end gap-2 shrink-0">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase text-center w-fit self-start sm:self-auto ${
                                cand.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                cand.status === 'Demo Lecture' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                cand.status === 'Selected' || cand.status === 'Offered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                cand.status === 'Interviewing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {cand.status}
                              </span>
                              
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {cand.status !== 'Rejected' && (
                                  <button
                                    onClick={() => handleSetCandidateStatus(cand, 'Rejected')}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 text-[9px] font-black rounded-lg cursor-pointer transition-colors"
                                    title="Reject Application"
                                  >
                                    Reject
                                  </button>
                                )}
                                
                                {cand.status === 'Applied' && (
                                  <button
                                    onClick={() => handleSetCandidateStatus(cand, 'Interviewing')}
                                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black rounded-lg cursor-pointer transition-colors shadow-xxs"
                                  >
                                    Interview
                                  </button>
                                )}

                                {(cand.status === 'Applied' || cand.status === 'Interviewing') && (
                                  <button
                                    onClick={() => handleSetCandidateStatus(cand, 'Demo Lecture')}
                                    className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black rounded-lg cursor-pointer transition-colors shadow-xxs"
                                  >
                                    Demo Class
                                  </button>
                                )}

                                {cand.status === 'Demo Lecture' && (
                                  <button
                                    onClick={() => handleSetCandidateStatus(cand, 'Selected')}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black rounded-lg cursor-pointer transition-colors shadow-xxs"
                                  >
                                    Approve & Select
                                  </button>
                                )}

                                {(cand.status === 'Selected' || cand.status === 'Rejected' || cand.status === 'Offered') && (
                                  <button
                                    onClick={() => handleSetCandidateStatus(cand, 'Applied')}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 text-[9px] font-bold rounded-lg cursor-pointer transition-colors"
                                  >
                                    Reset Status
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="pb-1">
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Demo Class Evaluations Received</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Anonymous Student rating metrics submitted specifically for demo lecture candidates.</p>
                    </div>

                    {lecturerEvaluations.filter(e => e.isDemo).length === 0 ? (
                      <div className="py-12 text-center text-slate-450 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <MessageSquare className="h-8 w-8 mx-auto opacity-35 mb-2 text-slate-450" />
                        <p className="text-xs font-bold">No demo lecture evaluations received yet.</p>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">Logged-in students can rate active demo teachers on their Lecturer Evaluation Desk to populate metrics here in real-time.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {lecturerEvaluations.filter(e => e.isDemo).map((evaluation) => {
                          const candidateObj = candidates.find(c => c.id === evaluation.lecturerId || c.name === evaluation.lecturerName);
                          const subjectName = candidateObj?.role || candidateObj?.experience || 'N/A';
                          const writtenFeedback = evaluation.comments || evaluation.additionalFeedback;
                          
                          return (
                            <div key={evaluation.id} className="border border-slate-150 rounded-2xl p-4 bg-amber-50/5/10 hover:bg-slate-50/50 transition-all text-left space-y-3">
                              <div className="flex justify-between items-start flex-wrap gap-2 pb-2.5 border-b border-slate-100">
                                <div>
                                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                                    Demo Class Evaluation
                                  </span>
                                  <h4 className="font-extrabold text-xs text-slate-850 mt-1">Candidate: {evaluation.lecturerName}</h4>
                                  <p className="text-[9px] text-slate-450 font-semibold mt-0.5">Role/Subject: {subjectName}</p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(evaluation.submittedAt || evaluation.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Ratings Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-white p-3 border border-slate-150 rounded-xl">
                                {[
                                  { label: "🔊 Loud & Clear", score: evaluation.scores?.loudAndClear ?? evaluation.ratingLoudClear ?? 0 },
                                  { label: "✨ Talented", score: evaluation.scores?.talented ?? evaluation.ratingTalented ?? 0 },
                                  { label: "🛡️ Class Management", score: evaluation.scores?.classManagement ?? evaluation.ratingClassManagement ?? 0 },
                                  { label: "📱 Gadget Addiction", score: evaluation.scores?.gadgetAddiction ?? (10 - (evaluation.ratingGadgetFree ?? 10)) },
                                  { label: "😡 Short Tempered", score: evaluation.scores?.shortTempered ?? (10 - (evaluation.ratingTemperControl ?? 10)) },
                                  { label: "⚡ Active Presence", score: evaluation.scores?.activeParticipation ?? evaluation.ratingActiveEnergy ?? 0 },
                                  { label: "🤝 Interactive style", score: evaluation.scores?.interactive ?? evaluation.ratingInteractive ?? 0 },
                                  { label: "⏱️ Teaching Pace", score: evaluation.scores?.teachingPace ?? evaluation.ratingPaceOfTeaching ?? 0 },
                                  { label: "🌍 Real-life Contexts", score: evaluation.scores?.realLifeContext ?? evaluation.ratingRealLifeContext ?? 0 }
                                ].map(item => (
                                  <div key={item.label} className="text-[10px] font-semibold text-slate-500">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="truncate text-xxs text-slate-500">{item.label}</span>
                                      <span className={`font-black text-xxs ${item.score >= 8 ? 'text-emerald-600' : item.score >= 5 ? 'text-amber-600' : 'text-rose-600'}`}>{item.score}/10</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1">
                                      <div 
                                        className={`h-1 rounded-full ${
                                          item.label.includes('Addiction') || item.label.includes('Tempered')
                                            ? (item.score <= 3 ? 'bg-emerald-500' : item.score <= 6 ? 'bg-amber-500' : 'bg-rose-500')
                                            : (item.score >= 8 ? 'bg-emerald-500' : item.score >= 5 ? 'bg-amber-500' : 'bg-rose-500')
                                        }`}
                                        style={{ width: `${item.score * 10}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {writtenFeedback && (
                                <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xxs leading-relaxed font-medium text-slate-650">
                                  <b className="text-slate-800">Additional Remarks:</b> "{writtenFeedback}"
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Simulated PDF CV Viewer Modal */}
            {viewingCvCandidate && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-150 overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600 p-2 rounded-xl">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-extrabold text-sm">{viewingCvCandidate.resumeName}</h3>
                        <p className="text-[10px] text-slate-400 font-semibold">Candidate Dossier: {viewingCvCandidate.name}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setViewingCvCandidate(null)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
                    {/* Candidate Info Header */}
                    <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-800">{viewingCvCandidate.name}</h4>
                        <p className="text-xxs text-indigo-600 font-bold">{viewingCvCandidate.role}</p>
                        <div className="text-xxs text-slate-400 font-semibold space-y-1 mt-2.5">
                          <p>📞 Contact: {viewingCvCandidate.phone}</p>
                          <p>✉️ Email: {viewingCvCandidate.email}</p>
                          <p>🎓 Specialization: {viewingCvCandidate.rawApplication?.education || 'Advanced Pedagogical Graduate'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between text-right shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                          viewingCvCandidate.isOnline ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {viewingCvCandidate.isOnline ? 'Careers Portal Applicant' : 'Internal ATS'}
                        </span>
                        <div className="bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-xl p-2.5 text-center mt-3">
                          <p className="text-[8px] font-black uppercase text-emerald-600 tracking-wider">AI Registry Score</p>
                          <p className="text-base font-black mt-0.5">92% Match</p>
                        </div>
                      </div>
                    </div>

                    {/* Simulated CV Document Sheet */}
                    <div className="border border-slate-200 rounded-2xl bg-slate-50/20 p-8 relative overflow-hidden font-sans text-slate-700 min-h-[350px] border-dashed">
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none rotate-12">
                        <p className="text-4xl font-black uppercase tracking-widest text-slate-900">VERIFIED DOSSIER ATTACHMENT</p>
                      </div>

                      <div className="space-y-5 relative z-10 text-left">
                        <div className="text-center border-b border-slate-200 pb-4">
                          <h2 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">{viewingCvCandidate.name}</h2>
                          <p className="text-xxs text-slate-500 font-semibold mt-1">{viewingCvCandidate.role} • {viewingCvCandidate.experience} Experience</p>
                          <p className="text-xxs text-slate-400 font-mono mt-0.5">{viewingCvCandidate.email} | {viewingCvCandidate.phone}</p>
                        </div>

                        <div className="space-y-1">
                          <h5 className="text-[9px] font-black text-indigo-650 uppercase tracking-widest">Academic Specialization</h5>
                          <p className="text-xxs font-bold text-slate-850">
                            {viewingCvCandidate.rawApplication?.education || 'Post-Graduate in Applied Pedagogy & Curriculum Design'}
                          </p>
                          <p className="text-xxs text-slate-400 leading-relaxed">
                            Possesses standard national accreditation with high distinctions. Highly trained in competitive pedagogy for tracking JEE/NEET syllabi benchmarks with proven lecture coordination tools.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <h5 className="text-[9px] font-black text-indigo-650 uppercase tracking-widest">Teaching Experience & Accomplishments</h5>
                          <div className="text-xxs text-slate-600 font-semibold space-y-1">
                            <p className="font-bold text-slate-800">Lead Educator — {viewingCvCandidate.role}</p>
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-450">
                              <li>Instructed high-performing parallel batches maintaining high mock scoring ratios.</li>
                              <li>Mentored numerous qualifiers who secured admissions into premiere national colleges.</li>
                              <li>Authored customized daily worksheets and digital study notes for active LMS center.</li>
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h5 className="text-[9px] font-black text-indigo-650 uppercase tracking-widest">Expertize Areas</h5>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {['Curriculum Planning', 'LMS Coordination', 'Competitive Coaching', 'Digital Pedagogy', 'Formative Assessment'].map((tag) => (
                              <span key={tag} className="px-2 py-0.5 bg-white border border-slate-200 text-[9px] font-bold text-slate-500 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 border-t border-slate-150 p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-xxs font-semibold">
                      <span className="text-slate-400 font-extrabold uppercase">Recruit Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        viewingCvCandidate.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        viewingCvCandidate.status === 'Demo Lecture' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        viewingCvCandidate.status === 'Selected' || viewingCvCandidate.status === 'Offered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        viewingCvCandidate.status === 'Interviewing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {viewingCvCandidate.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {viewingCvCandidate.status !== 'Rejected' && (
                        <button
                          onClick={() => handleSetCandidateStatus(viewingCvCandidate, 'Rejected')}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 text-[9px] font-black rounded-lg cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                      )}

                      {viewingCvCandidate.status === 'Applied' && (
                        <button
                          onClick={() => handleSetCandidateStatus(viewingCvCandidate, 'Interviewing')}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black rounded-lg cursor-pointer transition-colors shadow-xxs"
                        >
                          Schedule Interview
                        </button>
                      )}

                      {(viewingCvCandidate.status === 'Applied' || viewingCvCandidate.status === 'Interviewing') && (
                        <button
                          onClick={() => handleSetCandidateStatus(viewingCvCandidate, 'Demo Lecture')}
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black rounded-lg cursor-pointer transition-colors shadow-xxs"
                        >
                          Advance to Demo Class
                        </button>
                      )}

                      {viewingCvCandidate.status === 'Demo Lecture' && (
                        <button
                          onClick={() => handleSetCandidateStatus(viewingCvCandidate, 'Selected')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black rounded-lg cursor-pointer transition-colors shadow-xxs"
                        >
                          Approve & Select
                        </button>
                      )}

                      {(viewingCvCandidate.status === 'Selected' || viewingCvCandidate.status === 'Rejected' || viewingCvCandidate.status === 'Offered') && (
                        <button
                          onClick={() => handleSetCandidateStatus(viewingCvCandidate, 'Applied')}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 text-[9px] font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Reset Status
                        </button>
                      )}

                      <button
                        onClick={() => setViewingCvCandidate(null)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xxs font-bold cursor-pointer transition-colors ml-2"
                      >
                        Close CV Dossier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 7. Examination & CCE */}
      {activeModule === 'exam' && (
        <ExaminationSystem
          currentRole={currentRole as any || currentUser?.role || 'admin'}
          currentUser={currentUser}
          students={students}
          batches={batches}
          onTriggerNotification={(title, desc, type) => showToast(title, desc, type === 'success' || type === 'info' ? type : 'info')}
        />
      )}

      {/* 8. Fee Management */}
      {activeModule === 'fees' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div>
            <h2 className="text-lg font-black text-slate-800">Fee & Receipts Desk</h2>
            <p className="text-xs text-slate-400">Record incoming student coaching fees, review pending arrears, and issue transaction receipts.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Collect Coaching Fee</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Select Student</label>
                  <select
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                    value={feeCollector.studentId}
                    onChange={(e) => setFeeCollector({...feeCollector, studentId: e.target.value})}
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Amount Paid (INR)</label>
                    <input
                      type="number"
                      className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                      value={feeCollector.amountPaid}
                      onChange={(e) => setFeeCollector({...feeCollector, amountPaid: e.target.value === '' ? '' : (parseInt(e.target.value) || 0) as any})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Payment Mode</label>
                    <select
                      className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                      value={feeCollector.mode}
                      onChange={(e) => setFeeCollector({...feeCollector, mode: e.target.value as any})}
                    >
                      <option value="UPI">UPI / GPay</option>
                      <option value="Online">NetBanking</option>
                      <option value="Cash">Cash Depot</option>
                      <option value="Card">Credit Card</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const studObj = students.find(s => s.id === feeCollector.studentId);
                    const rec = {
                      studentName: studObj ? studObj.name : 'Student',
                      amount: feeCollector.amountPaid,
                      mode: feeCollector.mode,
                      date: new Date().toISOString().split('T')[0],
                      receiptNo: `LD-2026-${Math.floor(1000 + Math.random() * 9000)}`
                    };
                    setCollectedReceipts([rec, ...collectedReceipts]);
                    setFeeStatus({
                      totalReceived: feeStatus.totalReceived + feeCollector.amountPaid,
                      totalPending: Math.max(0, feeStatus.totalPending - feeCollector.amountPaid)
                    });
                    showToast("Receipt Generated", `Payment of ₹${feeCollector.amountPaid} registered for ${rec.studentName}. Receipt #${rec.receiptNo}!`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white cursor-pointer transition-all"
                >
                  Collect Payment & Print Receipt
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 space-y-4 text-left">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Transaction Ledger Logs</h3>
              <div className="space-y-3">
                {collectedReceipts.length === 0 ? (
                  <p className="text-xxs text-slate-450 py-8 text-center font-bold">No payments recorded in this active session. Use the form to collect fees.</p>
                ) : (
                  collectedReceipts.map((rec, idx) => (
                    <div key={idx} className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 flex justify-between items-center text-left">
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{rec.studentName}</h4>
                        <p className="text-xxs text-slate-450 mt-1 font-bold">Receipt: <span className="font-mono text-indigo-600 font-extrabold">{rec.receiptNo}</span> | Mode: {rec.mode}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-800">₹{rec.amount.toLocaleString()}</span>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">{rec.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Homework Assignments */}
      {activeModule === 'homework' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div>
            <h2 className="text-lg font-black text-slate-800">Homework & Worksheets Desk</h2>
            <p className="text-xs text-slate-400">Publish daily study assignments, set strict deadlines, and review worksheet completion percentages.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Publish New Homework</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Subject Track</label>
                  <select
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                    value={newHomework.subject}
                    onChange={(e) => setNewHomework({...newHomework, subject: e.target.value})}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Assignment Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Circular Motion Solved set 2"
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                    value={newHomework.title}
                    onChange={(e) => setNewHomework({...newHomework, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Target Batch</label>
                  <select
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                    value={newHomework.batchId}
                    onChange={(e) => setNewHomework({...newHomework, batchId: e.target.value})}
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Deadline Date</label>
                  <input
                    type="date"
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                    value={newHomework.deadline}
                    onChange={(e) => setNewHomework({...newHomework, deadline: e.target.value})}
                  />
                </div>
                <button
                  onClick={() => {
                    if (!newHomework.title || !newHomework.deadline) return;
                    const selectedBatch = batches.find(b => b.id === newHomework.batchId);
                    setHomeworks([...homeworks, {
                      id: `hw${homeworks.length + 1}`,
                      subject: newHomework.subject,
                      title: newHomework.title,
                      deadline: newHomework.deadline,
                      batch: selectedBatch ? selectedBatch.name : 'JEE Elite 2026'
                    }]);
                    setNewHomework({ subject: 'Mathematics', title: '', deadline: '', batchId: batches[0]?.id || 'b1' });
                    showToast("Homework Dispatched", "Assignment published directly to active student dashboard desks!");
                  }}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 font-bold text-xs text-white cursor-pointer transition-all"
                >
                  Publish Homework
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Active Assignments Ledger</h3>
              <div className="space-y-3">
                {homeworks.map((hw) => (
                  <div key={hw.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/20 text-left flex justify-between items-center gap-4">
                    <div>
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded text-[9px] font-bold">
                        {hw.subject}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 mt-1.5">{hw.title}</h4>
                      <p className="text-xxs text-slate-400 mt-0.5 font-bold">Target Batch: {hw.batch}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-rose-500 font-bold block">Due: {hw.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Inventory Management */}
      {activeModule === 'inventory' && (() => {
        // Compute filtered items inline
        const filteredInventoryItems = inventory.filter(item => {
          const matchesSearch = item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) || 
                                (item.location && item.location.toLowerCase().includes(inventorySearchQuery.toLowerCase()));
          const matchesCategory = inventoryCategoryFilter === 'All' || item.category === inventoryCategoryFilter;
          
          let matchesStock = true;
          if (inventoryStockFilter === 'Low Stock') {
            matchesStock = item.quantity <= item.threshold && item.quantity > 0;
          } else if (inventoryStockFilter === 'Out of Stock') {
            matchesStock = item.quantity === 0;
          } else if (inventoryStockFilter === 'Adequate') {
            matchesStock = item.quantity > item.threshold;
          }
          
          return matchesSearch && matchesCategory && matchesStock;
        });

        return (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Package className="h-5 w-5 text-indigo-600" />
                  Institute Assets & Inventory Management
                </h2>
                <p className="text-xs text-slate-400">Track books, furniture, laboratory equipment, computers, sports equipment, consumables, assets, and schedule servicing/maintenance.</p>
              </div>
              
              {/* Sub Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  onClick={() => setInventoryActiveSubTab('items')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    inventoryActiveSubTab === 'items' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📦 Items Ledger
                </button>
                <button
                  onClick={() => setInventoryActiveSubTab('maintenance')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    inventoryActiveSubTab === 'maintenance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🔧 Maintenance
                </button>
                <button
                  onClick={() => setInventoryActiveSubTab('analytics')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    inventoryActiveSubTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📊 Valuation
                </button>
              </div>
            </div>

            {/* Core Analytics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-slate-150 bg-slate-50/40 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Total Assets Count</span>
                  <h4 className="text-lg font-black text-slate-800">
                    {inventory.reduce((sum, item) => sum + item.quantity, 0)} units
                  </h4>
                  <p className="text-xxs text-slate-400 font-semibold">Across {inventory.length} distinct item types</p>
                </div>
              </div>

              <div className="border border-slate-150 bg-slate-50/40 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Total Ledger Valuation</span>
                  <h4 className="text-lg font-black text-emerald-700">
                    ₹{inventory.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0).toLocaleString()}
                  </h4>
                  <p className="text-xxs text-slate-400 font-semibold">Net institutional book value</p>
                </div>
              </div>

              <div className="border border-slate-150 bg-slate-50/40 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                  <BadgeAlert className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Critical Alerts</span>
                  <h4 className="text-lg font-black text-rose-600">
                    {inventory.filter(item => item.quantity <= item.threshold).length} low stock items
                  </h4>
                  <p className="text-xxs text-slate-400 font-semibold">Requires procurement restocking</p>
                </div>
              </div>
            </div>

            {/* ================================== */}
            {/* SUB-TAB 1: ITEMS LEDGER */}
            {/* ================================== */}
            {inventoryActiveSubTab === 'items' && (
              <div className="space-y-4">
                {/* Controls and filters */}
                <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-slate-50/50 border border-slate-200 p-4 rounded-2xl">
                  {/* Search */}
                  <div className="relative w-full lg:w-72">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      value={inventorySearchQuery}
                      onChange={(e) => setInventorySearchQuery(e.target.value)}
                      placeholder="Search by name or storage..."
                      className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {inventorySearchQuery && (
                      <button 
                        onClick={() => setInventorySearchQuery('')} 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shrink-0">
                      <Filter className="h-3.5 w-3.5 text-slate-450" />
                      <select
                        value={inventoryCategoryFilter}
                        onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                        className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none focus:ring-0 py-0 pr-6"
                      >
                        <option value="All">All Categories</option>
                        <option value="Books">Books</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Laboratory Equipment">Laboratory Equipment</option>
                        <option value="Computers">Computers</option>
                        <option value="Sports Equipment">Sports Equipment</option>
                        <option value="Consumables">Consumables</option>
                        <option value="Assets">Assets</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shrink-0">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-slate-450" />
                      <select
                        value={inventoryStockFilter}
                        onChange={(e) => setInventoryStockFilter(e.target.value)}
                        className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none focus:ring-0 py-0 pr-6"
                      >
                        <option value="All">All Stock Levels</option>
                        <option value="Adequate">Adequate Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setIsAddingInventoryItem(!isAddingInventoryItem)}
                      className="ml-auto lg:ml-0 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add Item
                    </button>
                  </div>
                </div>

                {/* Add New Item Form */}
                {isAddingInventoryItem && (
                  <div className="border border-slate-200 bg-slate-50/40 p-5 rounded-2xl space-y-4 text-left animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Configure New Inventory Item</h3>
                      <button 
                        onClick={() => setIsAddingInventoryItem(false)} 
                        className="p-1 hover:bg-slate-200 rounded-lg text-slate-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Item Name / Title</label>
                        <input
                          type="text"
                          value={newInventoryItem.name}
                          onChange={(e) => setNewInventoryItem({...newInventoryItem, name: e.target.value})}
                          placeholder="e.g. HC Verma Physics Vol 1"
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Category Domain</label>
                        <select
                          value={newInventoryItem.category}
                          onChange={(e) => setNewInventoryItem({...newInventoryItem, category: e.target.value})}
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="Books">Books</option>
                          <option value="Furniture">Furniture</option>
                          <option value="Laboratory Equipment">Laboratory Equipment</option>
                          <option value="Computers">Computers</option>
                          <option value="Sports Equipment">Sports Equipment</option>
                          <option value="Consumables">Consumables</option>
                          <option value="Assets">Assets</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Storage / Room Location</label>
                        <input
                          type="text"
                          value={newInventoryItem.location}
                          onChange={(e) => setNewInventoryItem({...newInventoryItem, location: e.target.value})}
                          placeholder="e.g. Lecture Hall 4 / Shelf C1"
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">In-Stock Quantity</label>
                        <input
                          type="number"
                          value={newInventoryItem.quantity}
                          onChange={(e) => setNewInventoryItem({...newInventoryItem, quantity: Math.max(0, parseInt(e.target.value) || 0)})}
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Reorder Alert Threshold</label>
                        <input
                          type="number"
                          value={newInventoryItem.threshold}
                          onChange={(e) => setNewInventoryItem({...newInventoryItem, threshold: Math.max(1, parseInt(e.target.value) || 0)})}
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Unit Valuation (₹)</label>
                        <input
                          type="number"
                          value={newInventoryItem.unitPrice}
                          onChange={(e) => setNewInventoryItem({...newInventoryItem, unitPrice: Math.max(0, parseInt(e.target.value) || 0)})}
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        onClick={() => setIsAddingInventoryItem(false)}
                        className="px-4 py-2 border border-slate-250 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!newInventoryItem.name.trim()) {
                            showToast("Invalid Input", "Please provide a descriptive item name!", "info");
                            return;
                          }
                          const id = `i${Date.now()}`;
                          const q = newInventoryItem.quantity;
                          const t = newInventoryItem.threshold;
                          const status = q === 0 ? 'Out of Stock' : q <= t ? 'Low Stock' : 'Adequate';
                          
                          const newlyAdded = {
                            id,
                            name: newInventoryItem.name,
                            category: newInventoryItem.category,
                            quantity: q,
                            threshold: t,
                            unitPrice: newInventoryItem.unitPrice,
                            location: newInventoryItem.location || 'Central Store',
                            status
                          };

                          setInventory([...inventory, newlyAdded]);
                          setIsAddingInventoryItem(false);
                          setNewInventoryItem({
                            name: '',
                            category: 'Books',
                            quantity: 10,
                            threshold: 5,
                            unitPrice: 500,
                            location: ''
                          });
                          showToast("Asset Registered", `${newlyAdded.name} successfully appended to operational inventory!`);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                      >
                        Add to Registry
                      </button>
                    </div>
                  </div>
                )}

                {/* Items Cards Grid */}
                {filteredInventoryItems.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                    <Package className="h-10 w-10 text-slate-350 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-bold">No inventory records match your filters.</p>
                    <p className="text-xxs text-slate-400">Clear search queries or reset categories to browse full registry.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredInventoryItems.map((item) => {
                      const valuation = item.quantity * (item.unitPrice || 0);
                      const isLow = item.quantity <= item.threshold;
                      const isOut = item.quantity === 0;

                      return (
                        <div key={item.id} className="border border-slate-150 rounded-2xl p-4.5 bg-slate-50/15 hover:border-slate-300 transition-all space-y-4 text-left">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                                {item.category}
                              </span>
                              <h4 className="text-xs font-black text-slate-800 mt-1.5 leading-tight">{item.name}</h4>
                              <p className="text-xxs text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                Store: {item.location || 'Central Store'}
                              </p>
                            </div>
                            
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border shrink-0 text-center ${
                              isOut 
                                ? 'bg-red-50 border-red-150 text-red-600' 
                                : isLow 
                                  ? 'bg-amber-50 border-amber-150 text-amber-600' 
                                  : 'bg-emerald-50 border-emerald-150 text-emerald-600'
                            }`}>
                              {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Good Stock'}
                            </span>
                          </div>

                          {/* Quick Spec Metrics */}
                          <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[10px] font-bold text-slate-500">
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">Unit Price</span>
                              <span className="text-slate-700 font-black">₹{item.unitPrice || 0}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">Value</span>
                              <span className="text-emerald-700 font-black">₹{valuation.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">Limit</span>
                              <span className="text-slate-700 font-black">{item.threshold} units</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 pt-1">
                            {/* Stock Modifier */}
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                              <button
                                onClick={() => {
                                  if (item.quantity === 0) return;
                                  const newQty = Math.max(0, item.quantity - 1);
                                  const newStatus = newQty === 0 ? 'Out of Stock' : newQty <= item.threshold ? 'Low Stock' : 'Adequate';
                                  setInventory(inventory.map(i => i.id === item.id ? { ...i, quantity: newQty, status: newStatus } : i));
                                  showToast("Stock Adjusted", `Reduced ${item.name} -1 unit`);
                                }}
                                disabled={item.quantity === 0}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[10px] rounded-lg cursor-pointer disabled:opacity-40"
                              >
                                -1
                              </button>
                              <span className="text-xs font-black text-slate-800 px-1">{item.quantity}</span>
                              <button
                                onClick={() => {
                                  const newQty = item.quantity + 1;
                                  const newStatus = newQty <= item.threshold ? 'Low Stock' : 'Adequate';
                                  setInventory(inventory.map(i => i.id === item.id ? { ...i, quantity: newQty, status: newStatus } : i));
                                  showToast("Stock Adjusted", `Added ${item.name} +1 unit`);
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[10px] rounded-lg cursor-pointer"
                              >
                                +1
                              </button>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setNewMaintenance({
                                    ...newMaintenance,
                                    itemId: item.id,
                                    issue: `Routine safety audit & performance diagnostic check for ${item.name}`
                                  });
                                  setInventoryActiveSubTab('maintenance');
                                  setIsSchedulingMaintenance(true);
                                  showToast("Scheduling Maintenance", `Configuring service request for ${item.name}`);
                                }}
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[9px] rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                🔧 Servicing
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove ${item.name} from the active assets ledger?`)) {
                                    setInventory(inventory.filter(i => i.id !== item.id));
                                    showToast("Asset Removed", `De-registered ${item.name} from ledger.`);
                                  }
                                }}
                                className="p-1.5 border border-slate-200 hover:border-red-200 text-slate-450 hover:text-red-500 rounded-xl hover:bg-red-50/30 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ================================== */}
            {/* SUB-TAB 2: MAINTENANCE MODULE */}
            {/* ================================== */}
            {inventoryActiveSubTab === 'maintenance' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/40 border border-indigo-100/70 p-4 rounded-2xl text-left">
                  <div>
                    <h3 className="text-xs font-black text-slate-800">Routine Maintenance & Hardware Repairs</h3>
                    <p className="text-xxs text-slate-500">Track current technician schedules, diagnostic costs, and repair resolutions for smart classroom infrastructure and laboratory equipment.</p>
                  </div>
                  <button
                    onClick={() => setIsSchedulingMaintenance(!isSchedulingMaintenance)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 self-start sm:self-center cursor-pointer transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Schedule Service
                  </button>
                </div>

                {/* Maintenance Form */}
                {isSchedulingMaintenance && (
                  <div className="border border-slate-200 bg-slate-50/40 p-5 rounded-2xl space-y-4 text-left animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Book New Servicing Order</h3>
                      <button 
                        onClick={() => setIsSchedulingMaintenance(false)} 
                        className="p-1 hover:bg-slate-200 rounded-lg text-slate-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Target Inventory Item</label>
                        <select
                          value={newMaintenance.itemId}
                          onChange={(e) => {
                            setNewMaintenance({...newMaintenance, itemId: e.target.value});
                          }}
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {inventory.map(i => (
                            <option key={i.id} value={i.id}>{i.name} ({i.category})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Estimated Cost (₹)</label>
                        <input
                          type="number"
                          value={newMaintenance.cost}
                          onChange={(e) => setNewMaintenance({...newMaintenance, cost: Math.max(0, parseInt(e.target.value) || 0)})}
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Scheduled Date</label>
                        <input
                          type="date"
                          value={newMaintenance.scheduledDate}
                          onChange={(e) => setNewMaintenance({...newMaintenance, scheduledDate: e.target.value})}
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Technician / Agency Name</label>
                        <input
                          type="text"
                          value={newMaintenance.technicianName}
                          onChange={(e) => setNewMaintenance({...newMaintenance, technicianName: e.target.value})}
                          placeholder="e.g. Panasonic Solutions, Coolers Ltd"
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Technician Mobile No.</label>
                        <input
                          type="text"
                          value={newMaintenance.technicianPhone}
                          onChange={(e) => setNewMaintenance({...newMaintenance, technicianPhone: e.target.value})}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Status</label>
                        <select
                          value={newMaintenance.status}
                          onChange={(e) => setNewMaintenance({...newMaintenance, status: e.target.value as any})}
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Detailed Technical Issue / Notes</label>
                        <textarea
                          value={newMaintenance.issue}
                          onChange={(e) => setNewMaintenance({...newMaintenance, issue: e.target.value})}
                          placeholder="Explain the damage or servicing requirements..."
                          rows={2}
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        onClick={() => setIsSchedulingMaintenance(false)}
                        className="px-4 py-2 border border-slate-250 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const targetItem = inventory.find(i => i.id === newMaintenance.itemId);
                          if (!newMaintenance.issue.trim()) {
                            showToast("Invalid Input", "Please describe the technical issue!", "info");
                            return;
                          }
                          const newLog = {
                            id: `m${Date.now()}`,
                            itemId: newMaintenance.itemId,
                            itemName: targetItem?.name || 'Unknown item',
                            issue: newMaintenance.issue,
                            cost: newMaintenance.cost,
                            scheduledDate: newMaintenance.scheduledDate,
                            technicianName: newMaintenance.technicianName || 'In-house support',
                            technicianPhone: newMaintenance.technicianPhone || 'N/A',
                            status: newMaintenance.status,
                            notes: newMaintenance.notes
                          };

                          setMaintenanceLogs([newLog, ...maintenanceLogs]);
                          setIsSchedulingMaintenance(false);
                          setNewMaintenance({
                            itemId: inventory[0]?.id || 'i1',
                            issue: '',
                            cost: 1500,
                            scheduledDate: new Date().toISOString().split('T')[0],
                            technicianName: '',
                            technicianPhone: '',
                            status: 'Scheduled',
                            notes: ''
                          });
                          showToast("Service Scheduled", `Successfully registered repair request for ${newLog.itemName}`);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                      >
                        Book Ticket
                      </button>
                    </div>
                  </div>
                )}

                {/* Maintenance Logs List */}
                <div className="space-y-3">
                  {maintenanceLogs.map((log) => {
                    return (
                      <div key={log.id} className="border border-slate-200 bg-slate-50/10 hover:bg-slate-50/20 p-4 rounded-2xl text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                              {log.itemName}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                              log.status === 'Completed'
                                ? 'bg-emerald-50 border-emerald-150 text-emerald-600'
                                : log.status === 'In Progress'
                                  ? 'bg-amber-50 border-amber-150 text-amber-600'
                                  : log.status === 'Cancelled'
                                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                                    : 'bg-indigo-50 border-indigo-150 text-indigo-600'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-700 leading-snug">
                            Issue: <span className="font-semibold text-slate-600">{log.issue}</span>
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" /> Scheduled: {log.scheduledDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-3.5 w-3.5" /> Agency: {log.technicianName} ({log.technicianPhone})
                            </span>
                          </div>
                          {log.notes && (
                            <p className="text-[10px] italic text-emerald-600 font-bold bg-emerald-50/30 p-1.5 rounded-lg border border-emerald-100">
                              ✓ Resolution: {log.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <div className="text-left md:text-right">
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">Servicing Cost</span>
                            <span className="text-xs font-black text-slate-800">₹{log.cost.toLocaleString()}</span>
                          </div>

                          {log.status !== 'Completed' && log.status !== 'Cancelled' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  const notes = prompt("Enter repair resolution notes (optional):") || 'Servicing completed successfully';
                                  setMaintenanceLogs(maintenanceLogs.map(m => m.id === log.id ? { ...m, status: 'Completed', notes } : m));
                                  showToast("Servicing Resolved", `Marked repair ticket for ${log.itemName} as resolved.`);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] rounded-lg cursor-pointer transition-colors"
                              >
                                Resolve
                              </button>
                              <button
                                onClick={() => {
                                  setMaintenanceLogs(maintenanceLogs.map(m => m.id === log.id ? { ...m, status: 'Cancelled' } : m));
                                  showToast("Servicing Cancelled", `Cancelled repair schedule for ${log.itemName}`);
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 font-extrabold text-[9px] rounded-lg cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================================== */}
            {/* SUB-TAB 3: VALUATION ANALYTICS */}
            {/* ================================== */}
            {inventoryActiveSubTab === 'analytics' && (
              <div className="space-y-5">
                <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-left">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Book Value ledger Distribution</h3>
                  <p className="text-xxs text-slate-400">Review total valuation aggregates grouped across the requested school asset categories.</p>
                </div>

                {/* Grouped Category Valuation List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Books', 'Furniture', 'Laboratory Equipment', 'Computers', 'Sports Equipment', 'Consumables', 'Assets'].map(cat => {
                    const catItems = inventory.filter(i => i.category === cat);
                    const totalUnits = catItems.reduce((sum, item) => sum + item.quantity, 0);
                    const totalValuation = catItems.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);
                    const lowStockCount = catItems.filter(i => i.quantity <= i.threshold).length;

                    return (
                      <div key={cat} className="border border-slate-150 rounded-2xl p-4.5 bg-slate-50/20 text-left space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-800">{cat}</span>
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50/40 px-2 py-0.5 rounded">
                            ₹{totalValuation.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(5, (totalValuation / 500000) * 100))}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                          <span>{catItems.length} styles / {totalUnits} units</span>
                          {lowStockCount > 0 ? (
                            <span className="text-rose-500 flex items-center gap-1 font-extrabold">
                              ⚠️ {lowStockCount} low stock alerts
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-extrabold">✓ Fully stocked</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Top Valued Assets list */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/15 text-left">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Top Single-Asset Valuations</h3>
                  <div className="divide-y divide-slate-100">
                    {inventory
                      .map(item => ({ ...item, totalValue: item.quantity * (item.unitPrice || 0) }))
                      .sort((a, b) => b.totalValue - a.totalValue)
                      .slice(0, 5)
                      .map((item, idx) => (
                        <div key={item.id} className="flex justify-between items-center py-2 text-xs font-bold text-slate-600">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 w-5">#{idx+1}</span>
                            <div>
                              <span className="text-slate-800 font-black">{item.name}</span>
                              <span className="text-[9px] uppercase tracking-wider text-indigo-500 font-extrabold block">{item.category}</span>
                            </div>
                          </div>
                          <span className="font-black text-slate-700">₹{item.totalValue.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 11. Library Management */}
      {activeModule === 'library' && (
        <LibraryManagement students={students} showToast={showToast} />
      )}

      {/* 12. Employee Information */}
      {activeModule === 'employee' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div>
            <h2 className="text-lg font-black text-slate-800">Institute Employee Information</h2>
            <p className="text-xs text-slate-400">Search credentials of head directors, office staff and assistant mentors.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Register Staff Profile</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter Staff Name"
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Designation Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Office Assistant"
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Contract / Payout Type</label>
                  <select
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                    value={newEmployee.payoutType}
                    onChange={(e) => setNewEmployee({...newEmployee, payoutType: e.target.value as any})}
                  >
                    <option value="Fixed">Fixed Monthly Salary</option>
                    <option value="Hourly">Hourly Contract</option>
                    <option value="Per-Session">Per-Session Contract</option>
                  </select>
                </div>
                {newEmployee.payoutType === 'Fixed' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Base Monthly Salary (₹)</label>
                    <input
                      type="number"
                      className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                      value={newEmployee.salary}
                      onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value === '' ? '' : (parseInt(e.target.value) || 0) as any})}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                      {newEmployee.payoutType === 'Hourly' ? 'Hourly Rate (₹/hr)' : 'Per-Session Fee (₹/session)'}
                    </label>
                    <input
                      type="number"
                      className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                      value={newEmployee.hourlyRate}
                      onChange={(e) => setNewEmployee({...newEmployee, hourlyRate: e.target.value === '' ? '' : (parseInt(e.target.value) || 0) as any})}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="e.g. ram@..."
                      className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Mobile</label>
                    <input
                      type="text"
                      placeholder="e.g. +91..."
                      className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold"
                      value={newEmployee.contact}
                      onChange={(e) => setNewEmployee({...newEmployee, contact: e.target.value})}
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!newEmployee.name || !newEmployee.role) return;
                    setEmployees([...employees, {
                      id: `emp-${employees.length + 1}`,
                      name: newEmployee.name,
                      role: newEmployee.role,
                      salary: newEmployee.payoutType === 'Fixed' ? Number(newEmployee.salary || 0) : 0,
                      payoutType: newEmployee.payoutType,
                      hourlyRate: newEmployee.payoutType !== 'Fixed' ? Number(newEmployee.hourlyRate || 0) : 385,
                      email: newEmployee.email || 'info@learnersden.com',
                      contact: newEmployee.contact || '+91 XXXXX XXXXX'
                    }]);
                    setNewEmployee({ name: '', role: '', salary: 50000, email: '', contact: '', payoutType: 'Fixed', hourlyRate: 385 });
                    showToast("Employee Enrolled", "New corporate staff profile mapped in institute payroll directory!");
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white cursor-pointer transition-all"
                >
                  Register Staff Member
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Employee Directory</h3>
              <div className="space-y-3">
                {employees.map((emp) => (
                  <div key={emp.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/20 text-left flex justify-between items-center gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-black text-slate-800">{emp.name}</p>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          emp.payoutType === 'Hourly' ? 'bg-amber-50 text-amber-700 border border-amber-150' : 
                          emp.payoutType === 'Per-Session' ? 'bg-violet-50 text-violet-700 border border-violet-150' : 
                          'bg-indigo-50 text-indigo-700 border border-indigo-150'
                        }`}>
                          {emp.payoutType || 'Fixed'}
                        </span>
                      </div>
                      <p className="text-xxs text-slate-500 font-bold">{emp.role}</p>
                      <p className="text-xxs text-slate-400 font-mono mt-1">E: {emp.email} | M: {emp.contact}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-extrabold text-indigo-600">
                        {emp.payoutType === 'Hourly' ? `₹${(emp.hourlyRate || 385).toLocaleString()}/hr` :
                         emp.payoutType === 'Per-Session' ? `₹${(emp.hourlyRate || 385).toLocaleString()}/session` :
                         `₹${emp.salary.toLocaleString()}/mo`}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to remove employee ${emp.name}?`)) {
                            setEmployees(employees.filter(e => e.id !== emp.id));
                            showToast("Employee Deleted", "The staff profile has been removed from payroll.");
                          }
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title="Remove Employee"
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

      {/* 13. Payroll Management */}
      {activeModule === 'payroll' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div>
            <h2 className="text-lg font-black text-slate-800">Payroll & Payslips Engine</h2>
            <p className="text-xs text-slate-400">Calculate staff monthly allowances, deduct tax rates, and export corporate bank payslips.</p>
          </div>

          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Salary Structure Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase">
                    <th className="py-2">Employee</th>
                    <th className="py-2">Designation</th>
                    <th className="py-2">Base Salary</th>
                    <th className="py-2">Deductions (EPF/Tax)</th>
                    <th className="py-2">Net Pay</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const tax = Math.floor(emp.salary * 0.10);
                    const epf = Math.floor(emp.salary * 0.05);
                    const net = emp.salary - tax - epf;
                    return (
                      <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 font-bold text-slate-800">{emp.name}</td>
                        <td className="py-3 font-semibold text-slate-450">{emp.role}</td>
                        <td className="py-3 font-semibold">₹{emp.salary.toLocaleString()}</td>
                        <td className="py-3 font-semibold text-rose-500">-₹{(tax + epf).toLocaleString()}</td>
                        <td className="py-3 font-black text-emerald-600">₹{net.toLocaleString()}</td>
                        <td className="py-3">
                          <button
                            onClick={() => {
                              showToast("Payslip Dispatched", `Payslip of ₹${net.toLocaleString()} has been safely generated for ${emp.name}!`);
                            }}
                            className="px-2 py-1.5 bg-slate-900 text-white hover:bg-indigo-600 transition-colors font-black text-[9px] rounded-lg cursor-pointer"
                          >
                            Print Slip
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

{/* 15. Student Image Gallery */}
      {activeModule === 'gallery' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-800">Student Campus Image Gallery</h2>
              <p className="text-xs text-slate-400">Upload campus event albums, JEE toppers award ceremonies, and scientific workshop photos.</p>
            </div>
            <button
              onClick={() => {
                setGallery([...gallery, {
                  id: `g${gallery.length + 1}`,
                  title: 'JEE Advanced Rankers Felicitation 2026',
                  count: 12,
                  url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop'
                }]);
                showToast("Album Generated", "Science workshop album catalog synced!");
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-850 cursor-pointer transition-all"
            >
              + Create Album Folder
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((album) => (
              <div key={album.id} className="border border-slate-150 rounded-2xl overflow-hidden shadow-xxs bg-white group text-left">
                <div className="h-44 overflow-hidden relative bg-slate-100">
                  <img
                    src={album.url}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-1 bg-slate-900/80 text-white text-[9px] font-bold rounded-lg backdrop-blur-xs">
                    {album.count} photos
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="text-xs font-black text-slate-800 truncate">{album.title}</h4>
                  <p className="text-xxs text-slate-400 mt-0.5">Uploaded recently | Learner's Den Media Server</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 16. Employee Attendance */}
      {activeModule === 'emp_attendance' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div>
            <h2 className="text-lg font-black text-slate-800">Employee Attendance & Sign-In</h2>
            <p className="text-xs text-slate-400">Track check-in punch stamps, review leave approvals, and calculate active work hours.</p>
          </div>

          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Today's Punch Ledger</h3>
            <div className="space-y-3">
              {employees.map((emp) => {
                const checkedIn = employeeAttendanceLogs.find(l => l.name === emp.name);
                return (
                  <div key={emp.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/20 flex justify-between items-center text-xs text-left">
                    <div>
                      <h4 className="font-black text-slate-800">{emp.name}</h4>
                      <p className="text-xxs text-slate-500 font-bold">{emp.role}</p>
                    </div>
                    <div>
                      {checkedIn ? (
                        <div className="text-right">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[9px] font-bold">Punched-In</span>
                          <p className="text-xxs text-slate-400 mt-1 font-bold">Time: {checkedIn.punchIn}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEmployeeAttendanceLogs([...employeeAttendanceLogs, {
                              id: `ea${employeeAttendanceLogs.length + 1}`,
                              name: emp.name,
                              status: 'Present',
                              punchIn: '09:12 AM',
                              date: '2026-07-01'
                            }]);
                            showToast("Clock-In Registered", `${emp.name} signed-in successfully!`);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Manual Punch-In
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 17. Student Achievements */}
      {activeModule === 'achievements' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div>
            <h2 className="text-lg font-black text-slate-800">Student Honors & Achievements</h2>
            <p className="text-xs text-slate-400">Track state JEE toppers, science olympiad winners, and sports medals of outstanding coaching students.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Log Honor Roll Entry</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Student Name</label>
                  <select
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                    value={newAchievement.name}
                    onChange={(e) => setNewAchievement({...newAchievement, name: e.target.value})}
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Accolade / Award Description</label>
                  <input
                    type="text"
                    placeholder="e.g. JEE Mains Rank 24 In India"
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                    value={newAchievement.award}
                    onChange={(e) => setNewAchievement({...newAchievement, award: e.target.value})}
                  />
                </div>
                <button
                  onClick={() => {
                    if (!newAchievement.name || !newAchievement.award) return;
                    setAchievements([...achievements, {
                      id: `a${achievements.length + 1}`,
                      name: newAchievement.name,
                      batch: 'JEE Elite 2026',
                      award: newAchievement.award,
                      date: new Date().toISOString().split('T')[0]
                    }]);
                    setNewAchievement({ name: students[0]?.name || '', award: '', date: '' });
                    showToast("Accolade Registered", "Student achievement entry safely added to honors catalog!");
                  }}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 font-bold text-xs text-white cursor-pointer transition-all"
                >
                  Log Student Award
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Learner's Den Talent Wall</h3>
              <div className="space-y-3">
                {achievements.map((ach) => (
                  <div key={ach.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/20 text-left relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400/5 rounded-full" />
                    <div className="flex gap-3 items-start">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <Trophy className="h-4.5 w-4.5 text-amber-500" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-slate-800">{ach.name}</h4>
                        <p className="text-[10px] text-amber-600 font-extrabold">{ach.award}</p>
                        <p className="text-xxs text-slate-400 mt-1">Batch: {ach.batch} | Date: {ach.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 18. Student Attendance Tracker */}
      {activeModule === 'student_attendance' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div>
            <h2 className="text-lg font-black text-slate-800">Classroom Attendance Roll Call</h2>
            <p className="text-xs text-slate-400">Select active classroom batches, take fast daily roll call sheets, and flag students with low check-in rates.</p>
          </div>

          <div className="border border-slate-200 rounded-2xl p-5 space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Take Roll-Call Attendance</h3>
            <div className="space-y-3">
              {students.map((stud) => {
                const status = studentAttendanceRecord[stud.id] || 'Present';
                return (
                  <div key={stud.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/20 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-black text-slate-800">{stud.name}</p>
                      <p className="text-[9px] text-slate-400 font-mono">Admission Code: {stud.id}</p>
                    </div>
                    <div className="flex gap-2">
                      {['Present', 'Absent', 'Late'].map((st) => (
                        <button
                          key={st}
                          onClick={() => {
                            setStudentAttendanceRecord({ ...studentAttendanceRecord, [stud.id]: st as any });
                            showToast("Attendance Recorded", `Attendance of ${stud.name} marked as ${st}!`);
                          }}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                            status === st 
                              ? st === 'Present' ? 'bg-emerald-600 text-white border-emerald-600' :
                                st === 'Absent' ? 'bg-rose-600 text-white border-rose-600' :
                                'bg-amber-500 text-white border-amber-500'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 19. Student Information */}
      {activeModule === 'student_info' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800">Advanced Student Lookup</h2>
              <p className="text-xs text-slate-400">Search directory, review parent phone credentials, and analyze grade matrices.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Student..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                value={searchStudentTerm}
                onChange={(e) => setSearchStudentTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.filter(s => s.name.toLowerCase().includes(searchStudentTerm.toLowerCase())).map((stud) => (
              <div key={stud.id} className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-white text-left relative overflow-hidden shadow-xxs">
                <span className="absolute top-4 right-4 font-mono text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {stud.id}
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-slate-800">{stud.name}</h4>
                  <p className="text-xxs text-slate-450 font-semibold uppercase">Batch ID: {stud.batchId}</p>
                  <p className="text-xxs text-slate-400 font-medium">Email: {stud.email}</p>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xxs">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Entrance GPA</p>
                    <p className="font-extrabold text-slate-800">{stud.previousClassPercentage}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Attendance</p>
                    <p className="font-extrabold text-slate-800">{82 + (stud.name.length * 3) % 18}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 20. Transport Management */}
      {activeModule === 'transport' && (
        <TransportManagement students={students} showToast={showToast} />
      )}

      {/* 21. Security & Compliance Management */}
      {activeModule === 'security' && (
        <SecurityCompliance students={students} showToast={showToast} />
      )}

    </div>
  );
}
