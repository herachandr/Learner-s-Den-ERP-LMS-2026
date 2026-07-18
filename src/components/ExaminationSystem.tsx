import React, { useState, useEffect } from 'react';
import { 
  Award, BookOpen, BrainCircuit, Calendar, Check, CheckCircle2, ChevronLeft, ChevronRight, 
  Clock, Download, Edit3, Eye, FileDown, FileText, HelpCircle, Home, IndianRupee, 
  LayoutGrid, MessageSquare, Play, Plus, Printer, RefreshCw, Search, Send, ShieldAlert, 
  ShieldCheck, Sparkles, Star, Tag, Trash2, TrendingUp, Users, X, XCircle, BarChart2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import { Student, Batch, UserRole } from '../types';

interface ExaminationSystemProps {
  currentRole: UserRole;
  currentUser: any;
  students: Student[];
  batches: Batch[];
  onTriggerNotification?: (title: string, desc: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
}

// Interfaces
interface BankQuestion {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'MCQ' | 'Subjective';
  questionText: string;
  options?: string[]; // MCQ only
  correctOptionIndex?: number; // MCQ only
  modelAnswer?: string; // Subjective only
  maxMarks: number;
  explanation?: string;
  hint?: string;
}

interface OnlineExam {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  batchId: string;
  type: 'MCQ' | 'Subjective' | 'Mixed';
  questions: BankQuestion[];
  totalMarks: number;
  createdAt: string;
  // Expanded review fields
  examinationType: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  passMarks: number;
  blueprint?: string;
  syllabus?: string;
  instructions?: string;
  invigilator?: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

interface StudentSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  status: 'Pending' | 'Evaluated';
  mcqScore: number;
  subjectiveScore: number;
  totalScore: number;
  answers: Record<string, string | number>; // questionId -> response
  evaluation?: Record<string, { marks: number; feedback: string }>;
  completedAt: string;
}

interface OfflineExam {
  id: string;
  title: string;
  subject: string;
  date: string;
  totalMarks: number;
  syllabus: string;
  batchId: string;
  studentMarks: Record<string, number>; // studentId -> score
  // Expanded review fields
  examinationType: string;
  classId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  passMarks: number;
  blueprint?: string;
  instructions?: string;
  invigilator?: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

// Colors for charts
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ExaminationSystem({
  currentRole,
  currentUser,
  students = [],
  batches = [],
  onTriggerNotification
}: ExaminationSystemProps) {
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'question-bank' | 'online-exams' | 'offline-exams' | 'evaluation' | 'ranks' | 'reports' | 'analytics'>('question-bank');
  
  // Active subject filters
  const [selectedSubject, setSelectedSubject] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('All');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');

  // Question Bank State
  const [questionBank, setQuestionBank] = useState<BankQuestion[]>(() => {
    const saved = localStorage.getItem('examination_question_bank');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'qb-1',
        subject: 'Physics',
        topic: 'Kinematics',
        difficulty: 'Easy',
        type: 'MCQ',
        questionText: 'Which of the following describes the rate of change of displacement with respect to time?',
        options: ['Velocity', 'Acceleration', 'Speed', 'Distance'],
        correctOptionIndex: 0,
        maxMarks: 4,
        explanation: 'Velocity is defined as the rate of change of displacement with respect to time, which is a vector quantity.',
        hint: 'Recall the vector equivalent of speed.'
      },
      {
        id: 'qb-2',
        subject: 'Chemistry',
        topic: 'Chemical Bonding',
        difficulty: 'Medium',
        type: 'MCQ',
        questionText: 'What type of bond is formed when there is an equal sharing of electrons between identical atoms?',
        options: ['Ionic Bond', 'Polar Covalent Bond', 'Non-polar Covalent Bond', 'Coordinate Bond'],
        correctOptionIndex: 2,
        maxMarks: 4,
        explanation: 'When identical atoms share electrons, the difference in electronegativity is zero, resulting in a non-polar covalent bond.',
        hint: 'Equal sharing means no positive or negative poles are formed.'
      },
      {
        id: 'qb-3',
        subject: 'Mathematics',
        topic: 'Calculus',
        difficulty: 'Hard',
        type: 'Subjective',
        questionText: 'Evaluate the limit: lim (x -> 0) of (sin(x)/x). Provide a detailed mathematical proof or reasoning using Sandwich (Squeeze) Theorem.',
        modelAnswer: 'According to the Sandwich Theorem, for x in (-pi/2, pi/2), cos(x) < sin(x)/x < 1. Since lim (x->0) cos(x) = 1 and lim (x->0) 1 = 1, by squeeze theorem, lim (x->0) sin(x)/x = 1.',
        maxMarks: 10,
        explanation: 'Uses geometric comparison on a unit circle where Area of Triangle OAB < Area of Sector OAB < Area of Triangle OAC.',
        hint: 'Use the unit circle inequalities.'
      },
      {
        id: 'qb-4',
        subject: 'Biology',
        topic: 'Cell Biology',
        difficulty: 'Medium',
        type: 'Subjective',
        questionText: 'Describe the main structural differences between plant cells and animal cells. Focus on organelles and cellular structures.',
        modelAnswer: 'Plant cells contain a rigid cellulose cell wall, large central vacuoles, and chloroplasts for photosynthesis. Animal cells lack a cell wall and chloroplasts, and typically contain centrioles and lysosomes.',
        maxMarks: 8,
        explanation: 'Plant cell walls provide turgidity and support; chloroplasts enable autotrophic nutrition.',
        hint: 'Think about photosynthesis and physical rigidity.'
      },
      {
        id: 'qb-5',
        subject: 'Physics',
        topic: 'Thermodynamics',
        difficulty: 'Hard',
        type: 'MCQ',
        questionText: 'In a Carnot engine, the temperature of the source is 500 K and that of the sink is 300 K. What is the efficiency of this heat engine?',
        options: ['效率 = 20%', '效率 = 40%', '效率 = 60%', '效率 = 50%'],
        correctOptionIndex: 1,
        maxMarks: 4,
        explanation: 'Efficiency (eta) = 1 - (T_sink / T_source) = 1 - (300/500) = 1 - 0.6 = 0.4 or 40%.',
        hint: 'Formula: n = 1 - (Tc / Th)'
      }
    ];
  });

  // Form State for Adding Questions
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQSubject, setNewQSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('Physics');
  const [newQTopic, setNewQTopic] = useState('');
  const [newQDifficulty, setNewQDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [newQType, setNewQType] = useState<'MCQ' | 'Subjective'>('MCQ');
  const [newQText, setNewQText] = useState('');
  const [newQOptions, setNewQOptions] = useState<string[]>(['', '', '', '']);
  const [newQCorrectIdx, setNewQCorrectIdx] = useState<number>(0);
  const [newQModelAnswer, setNewQModelAnswer] = useState('');
  const [newQMaxMarks, setNewQMaxMarks] = useState<number>(4);
  const [newQExplanation, setNewQExplanation] = useState('');
  const [newQHint, setNewQHint] = useState('');

  // Online Exams State
  const [onlineExams, setOnlineExams] = useState<OnlineExam[]>(() => {
    const saved = localStorage.getItem('examination_online_exams');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'oe-1',
        title: 'JEE Diagnostics Mock - Mechanics & Thermodynamics',
        subject: 'Physics',
        durationMinutes: 10,
        batchId: 'all',
        type: 'Mixed',
        questions: [
          {
            id: 'qb-1',
            subject: 'Physics',
            topic: 'Kinematics',
            difficulty: 'Easy',
            type: 'MCQ',
            questionText: 'Which of the following describes the rate of change of displacement with respect to time?',
            options: ['Velocity', 'Acceleration', 'Speed', 'Distance'],
            correctOptionIndex: 0,
            maxMarks: 4,
            explanation: 'Velocity is defined as the rate of change of displacement with respect to time.',
            hint: 'Vector counterpart of speed.'
          },
          {
            id: 'qb-5',
            subject: 'Physics',
            topic: 'Thermodynamics',
            difficulty: 'Hard',
            type: 'MCQ',
            questionText: 'In a Carnot engine, the temperature of the source is 500 K and that of the sink is 300 K. What is the efficiency of this heat engine?',
            options: ['效率 = 20%', '效率 = 40%', '效率 = 60%', '效率 = 50%'],
            correctOptionIndex: 1,
            maxMarks: 4,
            explanation: 'n = 1 - (300/500) = 40%.',
            hint: ' Carnot Efficiency formula.'
          },
          {
            id: 'oe-q3',
            subject: 'Physics',
            topic: 'Newtonian Physics',
            difficulty: 'Medium',
            type: 'Subjective',
            questionText: 'State Newtons three laws of motion and discuss how the second law serves as the core definitions of Force.',
            modelAnswer: '1. Law of Inertia. 2. F = dp/dt (Force is proportional to rate of change of momentum). 3. Action and reaction are equal and opposite. The second law defines force quantitatively.',
            maxMarks: 10,
            explanation: 'F = ma is derived from F = d(mv)/dt when mass is constant.',
            hint: 'Remember inertia, force-momentum relationship, and reactive forces.'
          }
        ],
        totalMarks: 18,
        createdAt: '2026-07-01',
        examinationType: 'Mixed Assessment',
        classId: 'Class 12',
        date: '2026-07-15',
        startTime: '10:00',
        endTime: '10:10',
        passMarks: 8,
        blueprint: '3 MCQ, 1 Subjective',
        syllabus: 'Mechanics and Thermodynamics basics',
        instructions: 'Do not minimize the screen. All questions are mandatory.',
        invigilator: 'Prof. Sharma',
        status: 'Upcoming'
      }
    ];
  });

  // Submissions State
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => {
    const saved = localStorage.getItem('examination_submissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'sub-1',
        examId: 'oe-1',
        studentId: 'student-2',
        studentName: 'Aarav Sharma',
        status: 'Evaluated',
        mcqScore: 8,
        subjectiveScore: 8,
        totalScore: 16,
        answers: {
          'qb-1': 0,
          'qb-5': 1,
          'oe-q3': 'Newtons laws of motion describe classical physics. 1. Object remains in state of rest or motion unless external force acts. 2. Force is product of mass and acceleration F=ma. 3. Action equals reaction.'
        },
        evaluation: {
          'oe-q3': { marks: 8, feedback: 'Well stated laws of motion. Please derive it from momentum directly next time for full marks.' }
        },
        completedAt: '2026-07-05 14:22'
      },
      {
        id: 'sub-2',
        examId: 'oe-1',
        studentId: 'student-3',
        studentName: 'Aditi Verma',
        status: 'Pending',
        mcqScore: 4,
        subjectiveScore: 0,
        totalScore: 4,
        answers: {
          'qb-1': 0,
          'qb-5': 2, // wrong answer
          'oe-q3': 'First law: Inertia. Second law: Force is proportional to acceleration. Third law: opposite reactions.'
        },
        completedAt: '2026-07-07 10:15'
      }
    ];
  });

  // Offline Exams State
  const [offlineExams, setOfflineExams] = useState<OfflineExam[]>(() => {
    const saved = localStorage.getItem('examination_offline_exams');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'ofe-1',
        title: 'NEET Physical Chemistry Phase Test-1',
        subject: 'Chemistry',
        date: '2026-07-10',
        totalMarks: 120,
        syllabus: 'Chemical Kinetics, Liquid Solutions, Electrochemistry',
        batchId: 'all',
        studentMarks: {
          'student-2': 105,
          'student-3': 92,
          'student-4': 78,
        },
        examinationType: 'Offline Written',
        classId: 'Class 12',
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 120,
        passMarks: 40,
        blueprint: 'Part A: 20 MCQs, Part B: 5 Numerical Problems',
        instructions: 'Bring your own scientific calculator.',
        invigilator: 'Mrs. Verma',
        status: 'Completed'
      },
      {
        id: 'ofe-2',
        title: 'JEE Mathematics Advanced Trigonometry Term',
        subject: 'Mathematics',
        date: '2026-07-12',
        totalMarks: 100,
        syllabus: 'Trigonometric Identities, Inverse Trig Functions, Equations',
        batchId: 'all',
        studentMarks: {
          'student-2': 88,
          'student-3': 64,
          'student-4': 45,
        },
        examinationType: 'Offline Written',
        classId: 'Class 11',
        startTime: '14:00',
        endTime: '16:00',
        durationMinutes: 120,
        passMarks: 33,
        blueprint: '5 Subjective Calculus Proofs',
        instructions: 'Draw clear figures where necessary.',
        invigilator: 'Mr. Gupta',
        status: 'Upcoming'
      }
    ];
  });

  // Synchronize states to localStorage
  useEffect(() => {
    localStorage.setItem('examination_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('examination_offline_exams', JSON.stringify(offlineExams));
  }, [offlineExams]);

  useEffect(() => {
    localStorage.setItem('examination_online_exams', JSON.stringify(onlineExams));
  }, [onlineExams]);

  useEffect(() => {
    localStorage.setItem('examination_question_bank', JSON.stringify(questionBank));
  }, [questionBank]);

  // Active Exam Taker State
  const [activeTakingExam, setActiveTakingExam] = useState<OnlineExam | null>(null);
  const [examCurrentIdx, setExamCurrentIdx] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, string | number>>({});
  const [examTimeLeft, setExamTimeLeft] = useState(0);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [examGradingResult, setExamGradingResult] = useState<{ mcqScore: number; maxScore: number } | null>(null);

  // Manual Evaluation Form State
  const [evaluatingSub, setEvaluatingSub] = useState<StudentSubmission | null>(null);
  const [evalMarks, setEvalMarks] = useState<Record<string, number>>({});
  const [evalFeedback, setEvalFeedback] = useState<Record<string, string>>({});

  // Offline marks edit state
  const [editingOfflineExamId, setEditingOfflineExamId] = useState<string | null>(null);
  const [tempOfflineMarks, setTempOfflineMarks] = useState<Record<string, number>>({});

  // Report card student selector
  const [reportCardStudentId, setReportCardStudentId] = useState<string>('student-2');
  const [principalComments, setPrincipalComments] = useState<string>('Exhibits excellent diligence and cognitive capability in STEM classes. Consistently top performer.');

  // Question Practice Interactive State
  const [selectedPracticeQ, setSelectedPracticeQ] = useState<BankQuestion | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState<number | string>('');
  const [practiceChecked, setPracticeChecked] = useState(false);
  const [practiceCorrect, setPracticeCorrect] = useState(false);

  // New Offline Exam Form state
  const [newOfeTitle, setNewOfeTitle] = useState('');
  const [newOfeSubject, setNewOfeSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('Physics');
  const [newOfeDate, setNewOfeDate] = useState('2026-07-15');
  const [newOfeTotalMarks, setNewOfeTotalMarks] = useState(100);
  const [newOfeSyllabus, setNewOfeSyllabus] = useState('');
  const [newOfeBatchId, setNewOfeBatchId] = useState('all');
  // Expanded Offline Exam Form state
  const [newOfeExamType, setNewOfeExamType] = useState('Offline Written');
  const [newOfeClassId, setNewOfeClassId] = useState('Class 12');
  const [newOfeStartTime, setNewOfeStartTime] = useState('10:00');
  const [newOfeEndTime, setNewOfeEndTime] = useState('12:00');
  const [newOfeDuration, setNewOfeDuration] = useState(120);
  const [newOfePassMarks, setNewOfePassMarks] = useState(33);
  const [newOfeBlueprint, setNewOfeBlueprint] = useState('');
  const [newOfeInstructions, setNewOfeInstructions] = useState('Use blue or black ball point pens only.');
  const [newOfeInvigilator, setNewOfeInvigilator] = useState('');
  const [newOfeStatus, setNewOfeStatus] = useState<'Upcoming' | 'Ongoing' | 'Completed'>('Upcoming');

  // New Online Exam Builder Form State
  const [isBuildingExam, setIsBuildingExam] = useState(false);
  const [newOeTitle, setNewOeTitle] = useState('');
  const [newOeSubject, setNewOeSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('Physics');
  const [newOeDuration, setNewOeDuration] = useState(30);
  const [newOeBatchId, setNewOeBatchId] = useState('all');
  const [newOeSelectedQIds, setNewOeSelectedQIds] = useState<string[]>([]);
  // Expanded Online Exam Form state
  const [newOeExamType, setNewOeExamType] = useState('Online MCQ');
  const [newOeClassId, setNewOeClassId] = useState('Class 12');
  const [newOeDate, setNewOeDate] = useState('2026-07-15');
  const [newOeStartTime, setNewOeStartTime] = useState('10:00');
  const [newOeEndTime, setNewOeEndTime] = useState('10:30');
  const [newOePassMarks, setNewOePassMarks] = useState(12);
  const [newOeBlueprint, setNewOeBlueprint] = useState('');
  const [newOeSyllabus, setNewOeSyllabus] = useState('');
  const [newOeInstructions, setNewOeInstructions] = useState('Do not minimize or switch browser tabs.');
  const [newOeInvigilator, setNewOeInvigilator] = useState('');
  const [newOeStatus, setNewOeStatus] = useState<'Upcoming' | 'Ongoing' | 'Completed'>('Upcoming');

  // Editing and Deletion states
  const [editingExam, setEditingExam] = useState<{
    id: string;
    isOnline: boolean;
    title: string;
    subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';
    examinationType: string;
    classId: string;
    batchId: string;
    date: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    totalMarks: number;
    passMarks: number;
    blueprint?: string;
    syllabus?: string;
    instructions?: string;
    invigilator?: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed';
  } | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'single-online' | 'single-offline' | 'bulk-demo';
    targetId?: string;
  }>({ isOpen: false, type: 'single-online' });

  // Timer Effect for Active Exam
  useEffect(() => {
    if (!activeTakingExam || isExamSubmitted) return;
    if (examTimeLeft <= 0) {
      handleOnlineExamSubmit();
      return;
    }
    const timer = setInterval(() => {
      setExamTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [examTimeLeft, activeTakingExam, isExamSubmitted]);

  // Notification Trigger helper
  const triggerLocalNotification = (title: string, desc: string, type: 'info' | 'success' | 'warning' | 'alert') => {
    if (onTriggerNotification) {
      onTriggerNotification(title, desc, type);
    } else {
      alert(`${title}: ${desc}`);
    }
  };

  // 1. QUESTION BANK ACTIONS
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) return;

    const newQ: BankQuestion = {
      id: `qb-${Date.now()}`,
      subject: newQSubject,
      topic: newQTopic || 'General Topic',
      difficulty: newQDifficulty,
      type: newQType,
      questionText: newQText,
      maxMarks: Number(newQMaxMarks),
      explanation: newQExplanation,
      hint: newQHint
    };

    if (newQType === 'MCQ') {
      newQ.options = newQOptions.filter(o => o.trim() !== '');
      newQ.correctOptionIndex = newQCorrectIdx;
    } else {
      newQ.modelAnswer = newQModelAnswer;
    }

    setQuestionBank(prev => [newQ, ...prev]);
    setIsAddingQuestion(false);
    triggerLocalNotification('Question Added', `Successfully published practice item to ${newQSubject} Question Bank!`, 'success');

    // Reset Form
    setNewQText('');
    setNewQTopic('');
    setNewQOptions(['', '', '', '']);
    setNewQModelAnswer('');
    setNewQExplanation('');
    setNewQHint('');
  };

  const handleGenerateExamFromBank = () => {
    // Generate an automatic 3-question MCQ diagnostic quiz
    const filtered = questionBank.filter(q => q.subject === (selectedSubject === 'All' ? 'Physics' : selectedSubject));
    if (filtered.length === 0) {
      triggerLocalNotification('Error', 'No questions available in the question bank for this subject!', 'warning');
      return;
    }

    const examQuestions = filtered.slice(0, 3);
    const sumMarks = examQuestions.reduce((sum, q) => sum + q.maxMarks, 0);

    const generatedExam: OnlineExam = {
      id: `oe-${Date.now()}`,
      title: `${selectedSubject === 'All' ? 'Academic' : selectedSubject} Auto-Generated Term Test`,
      subject: selectedSubject === 'All' ? 'Physics' : selectedSubject,
      durationMinutes: 15,
      batchId: 'all',
      type: 'Mixed',
      questions: examQuestions,
      totalMarks: sumMarks,
      createdAt: new Date().toISOString().split('T')[0],
      examinationType: 'Auto-Compiled Quiz',
      classId: 'Class 12',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '10:15',
      passMarks: Math.round(sumMarks * 0.4),
      blueprint: 'Auto-compiled from question bank reservoir',
      syllabus: 'General subject diagnostics',
      instructions: 'All questions are mandatory.',
      invigilator: 'Self-proctored',
      status: 'Upcoming'
    };

    setOnlineExams(prev => [generatedExam, ...prev]);
    triggerLocalNotification('Exam Generated', `Successfully compiled custom term exam with ${examQuestions.length} bank questions!`, 'success');
  };

  // 2. ONLINE EXAMS ACTIONS
  const handleStartExam = (exam: OnlineExam) => {
    setActiveTakingExam(exam);
    setExamCurrentIdx(0);
    setExamAnswers({});
    setExamTimeLeft(exam.durationMinutes * 60);
    setIsExamSubmitted(false);
    setExamGradingResult(null);
  };

  const handleOnlineExamSubmit = () => {
    if (isExamSubmitted || !activeTakingExam) return;

    let mcqScore = 0;
    let maxMcqScore = 0;

    activeTakingExam.questions.forEach((q) => {
      if (q.type === 'MCQ') {
        maxMcqScore += q.maxMarks;
        if (examAnswers[q.id] === q.correctOptionIndex) {
          mcqScore += q.maxMarks;
        }
      }
    });

    const isAllMcq = activeTakingExam.questions.every(q => q.type === 'MCQ');

    const newSub: StudentSubmission = {
      id: `sub-${Date.now()}`,
      examId: activeTakingExam.id,
      studentId: currentUser?.associatedId || 'student-2',
      studentName: currentUser?.name || 'Aarav Sharma',
      status: isAllMcq ? 'Evaluated' : 'Pending',
      mcqScore,
      subjectiveScore: 0,
      totalScore: mcqScore,
      answers: examAnswers,
      completedAt: new Date().toLocaleString()
    };

    setSubmissions(prev => [newSub, ...prev]);
    setExamGradingResult({ mcqScore, maxScore: activeTakingExam.totalMarks });
    setIsExamSubmitted(true);
    triggerLocalNotification('Exam Submitted', 'Your test responses have been successfully compiled and recorded!', 'success');
  };

  const handleCreateOnlineExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOeTitle.trim() || newOeSelectedQIds.length === 0) {
      triggerLocalNotification('Validation Error', 'Please specify a title and select at least 1 question!', 'warning');
      return;
    }

    const chosenQs = questionBank.filter(q => newOeSelectedQIds.includes(q.id));
    const totalMarks = chosenQs.reduce((sum, q) => sum + q.maxMarks, 0);

    const exam: OnlineExam = {
      id: `oe-${Date.now()}`,
      title: newOeTitle,
      subject: newOeSubject,
      durationMinutes: Number(newOeDuration),
      batchId: newOeBatchId,
      type: chosenQs.every(q => q.type === 'MCQ') ? 'MCQ' : chosenQs.every(q => q.type === 'Subjective') ? 'Subjective' : 'Mixed',
      questions: chosenQs,
      totalMarks,
      createdAt: new Date().toISOString().split('T')[0],
      // New review fields
      examinationType: newOeExamType,
      classId: newOeClassId,
      date: newOeDate || new Date().toISOString().split('T')[0],
      startTime: newOeStartTime,
      endTime: newOeEndTime,
      passMarks: Number(newOePassMarks),
      blueprint: newOeBlueprint || `${chosenQs.length} reservoir questions selected`,
      syllabus: newOeSyllabus || `${newOeSubject} General curriculum topics`,
      instructions: newOeInstructions,
      invigilator: newOeInvigilator,
      status: newOeStatus,
    };

    setOnlineExams(prev => [exam, ...prev]);
    setIsBuildingExam(false);
    setNewOeTitle('');
    setNewOeSelectedQIds([]);
    setNewOeBlueprint('');
    setNewOeSyllabus('');
    triggerLocalNotification('Exam Created', 'Manual online exam published successfully!', 'success');
  };

  // 3. OFFLINE EXAMS ACTIONS
  const handleCreateOfflineExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfeTitle.trim()) return;

    const ofe: OfflineExam = {
      id: `ofe-${Date.now()}`,
      title: newOfeTitle,
      subject: newOfeSubject,
      date: newOfeDate,
      totalMarks: Number(newOfeTotalMarks),
      syllabus: newOfeSyllabus || 'General chapters',
      batchId: newOfeBatchId,
      studentMarks: {},
      // New review fields
      examinationType: newOfeExamType,
      classId: newOfeClassId,
      startTime: newOfeStartTime,
      endTime: newOfeEndTime,
      durationMinutes: Number(newOfeDuration),
      passMarks: Number(newOfePassMarks),
      blueprint: newOfeBlueprint || 'Standard offline term paper structure',
      instructions: newOfeInstructions,
      invigilator: newOfeInvigilator,
      status: newOfeStatus,
    };

    setOfflineExams(prev => [ofe, ...prev]);
    setNewOfeTitle('');
    setNewOfeSyllabus('');
    setNewOfeBlueprint('');
    triggerLocalNotification('Offline Exam Created', 'Offline Exam scheduled successfully! Blank PDFs and OMR sheets are now available.', 'success');
  };

  // Edit and Delete functions
  const handleSaveEditedExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    if (editingExam.isOnline) {
      setOnlineExams(prev => prev.map(exam => {
        if (exam.id === editingExam.id) {
          return {
            ...exam,
            title: editingExam.title,
            subject: editingExam.subject,
            examinationType: editingExam.examinationType,
            classId: editingExam.classId,
            batchId: editingExam.batchId,
            date: editingExam.date,
            startTime: editingExam.startTime,
            endTime: editingExam.endTime,
            durationMinutes: Number(editingExam.durationMinutes),
            totalMarks: Number(editingExam.totalMarks),
            passMarks: Number(editingExam.passMarks),
            blueprint: editingExam.blueprint,
            syllabus: editingExam.syllabus,
            instructions: editingExam.instructions,
            invigilator: editingExam.invigilator,
            status: editingExam.status,
          };
        }
        return exam;
      }));
    } else {
      setOfflineExams(prev => prev.map(exam => {
        if (exam.id === editingExam.id) {
          return {
            ...exam,
            title: editingExam.title,
            subject: editingExam.subject,
            examinationType: editingExam.examinationType,
            classId: editingExam.classId,
            batchId: editingExam.batchId,
            date: editingExam.date,
            startTime: editingExam.startTime,
            endTime: editingExam.endTime,
            durationMinutes: Number(editingExam.durationMinutes),
            totalMarks: Number(editingExam.totalMarks),
            passMarks: Number(editingExam.passMarks),
            blueprint: editingExam.blueprint,
            instructions: editingExam.instructions,
            invigilator: editingExam.invigilator,
            status: editingExam.status,
          };
        }
        return exam;
      }));
    }

    setEditingExam(null);
    triggerLocalNotification('Exam Updated', 'The examination record has been successfully modified.', 'success');
  };

  const handleDeleteExam = (id: string, isOnline: boolean) => {
    if (isOnline) {
      setOnlineExams(prev => prev.filter(exam => exam.id !== id));
    } else {
      setOfflineExams(prev => prev.filter(exam => exam.id !== id));
    }
    triggerLocalNotification('Exam Deleted', 'The examination record has been removed.', 'success');
  };

  const handleDeleteAllDemoData = () => {
    setOnlineExams([]);
    setOfflineExams([]);
    setSubmissions([]);
    setDeleteConfirmation({ isOpen: false, type: 'single-online' });
    triggerLocalNotification('Demo Data Deleted', 'All examination and submission logs have been cleared.', 'success');
  };

  const startEditingOfflineMarks = (exam: OfflineExam) => {
    setEditingOfflineExamId(exam.id);
    setTempOfflineMarks({ ...exam.studentMarks });
  };

  const saveOfflineMarks = (examId: string) => {
    setOfflineExams(prev => prev.map(ex => {
      if (ex.id === examId) {
        return { ...ex, studentMarks: tempOfflineMarks };
      }
      return ex;
    }));
    setEditingOfflineExamId(null);
    triggerLocalNotification('Grades Saved', 'Successfully updated offline performance log.', 'success');
  };

  // 4. MANUAL EVALUATION DESK ACTIONS
  const startEvaluating = (sub: StudentSubmission) => {
    setEvaluatingSub(sub);
    const marks: Record<string, number> = {};
    const feedback: Record<string, string> = {};

    const exam = onlineExams.find(oe => oe.id === sub.examId);
    if (exam) {
      exam.questions.forEach(q => {
        if (q.type === 'Subjective') {
          marks[q.id] = sub.evaluation?.[q.id]?.marks || 0;
          feedback[q.id] = sub.evaluation?.[q.id]?.feedback || '';
        }
      });
    }
    setEvalMarks(marks);
    setEvalFeedback(feedback);
  };

  const submitManualEvaluation = () => {
    if (!evaluatingSub) return;

    let subScoreSum = 0;
    const finalEvaluation: Record<string, { marks: number; feedback: string }> = {};

    Object.entries(evalMarks).forEach(([qId, marks]) => {
      subScoreSum += marks;
      finalEvaluation[qId] = {
        marks,
        feedback: evalFeedback[qId] || ''
      };
    });

    setSubmissions(prev => prev.map(sub => {
      if (sub.id === evaluatingSub.id) {
        return {
          ...sub,
          status: 'Evaluated',
          subjectiveScore: subScoreSum,
          totalScore: sub.mcqScore + subScoreSum,
          evaluation: finalEvaluation
        };
      }
      return sub;
    }));

    setEvaluatingSub(null);
    triggerLocalNotification('Evaluation Completed', 'Student written answers marked and grades updated in the database!', 'success');
  };

  // 5. PRACTICE ITEM ACTION
  const checkPracticeAnswer = () => {
    if (!selectedPracticeQ) return;
    setPracticeChecked(true);
    if (selectedPracticeQ.type === 'MCQ') {
      const isCorrect = Number(practiceAnswer) === selectedPracticeQ.correctOptionIndex;
      setPracticeCorrect(isCorrect);
    } else {
      setPracticeCorrect(true); // Subjective is open verification
    }
  };

  // 6. PDF EXPORTS & PRINT BLANKS
  const downloadBlankExamPaper = (exam: OfflineExam) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("LEARNER'S DEN COACHING CENTRE", 15, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Official Offline Diagnostic Term Test Paper", 15, 22);
    doc.text(`Subject: ${exam.subject} | Max Marks: ${exam.totalMarks} | Syllabus Scope: ${exam.syllabus}`, 15, 27);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL QUESTION PAPER BOOKLET", 15, 45);

    doc.setDrawColor(203, 213, 225);
    doc.line(15, 48, 195, 48);

    doc.setFillColor(248, 250, 252);
    doc.rect(15, 52, 180, 25, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("STUDENT DECLARATION:", 18, 58);
    doc.text("Student Name: ____________________________     Roll Number: ________________________", 18, 64);
    doc.text("Signature of Candidate: ____________________     Date of Examination: _______________", 18, 70);

    let currY = 90;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SECTION A: STRUCTURAL / ANALYTICAL PROBLEMS", 15, currY);
    doc.line(15, currY + 2, 195, currY + 2);
    currY += 12;

    const sampleProblems = [
      "Define standard thermodynamic properties of the system and explain heat flow dynamics.",
      "Derive the relationship for electrostatic potential difference between two conducting surfaces.",
      "State any three biochemical metabolic reactions that happen in plant roots under low light.",
      "Prove the integration identities of trigonometric equations when domain lies between zero and pi."
    ];

    sampleProblems.forEach((prob, idx) => {
      doc.setFont("helvetica", "bold");
      doc.text(`Question ${idx + 1}: ${prob}`, 15, currY);
      doc.setFont("helvetica", "italic");
      doc.text(`[ Marks Allocated: ${Math.round(exam.totalMarks / 4)} ]`, 195, currY, { align: 'right' });
      currY += 8;

      doc.setDrawColor(241, 245, 249);
      for (let i = 0; i < 4; i++) {
        doc.line(15, currY, 195, currY);
        currY += 6;
      }
      currY += 10;
    });

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Official Learner's Den Academic Printing System. Confidential diagnostic paper.", 15, 280);

    doc.save(`Blank_Exam_${exam.title.replace(/\s+/g, '_')}.pdf`);
  };

  const downloadBlankOMRSheet = (exam: OfflineExam) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(79, 70, 229);
    doc.rect(5, 5, 200, 287);

    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("LEARNER'S DEN OMR BUBBLE ANSWER RECORD", 105, 18, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Exam Title: ${exam.title} | Subject: ${exam.subject} | Max Marks: ${exam.totalMarks}`, 105, 24, { align: 'center' });

    doc.setDrawColor(203, 213, 225);
    doc.line(15, 28, 195, 28);

    doc.setFillColor(248, 250, 252);
    doc.rect(15, 32, 180, 25, "F");
    doc.setFont("helvetica", "bold");
    doc.text("OMR FILLING INSTRUCTIONS:", 18, 38);
    doc.setFont("helvetica", "normal");
    doc.text("- Use black or blue ballpoint pen only. Do not use gel pens.", 18, 44);
    doc.text("- Fill the bubble completely. Incomplete, double bubble or light marking is auto-rejected.", 18, 50);

    let currY = 70;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("MULTIPLE CHOICE BUBBLES GRID (Q1 - Q30)", 15, currY);
    doc.line(15, currY + 2, 195, currY + 2);
    currY += 15;

    for (let q = 1; q <= 20; q++) {
      doc.setFont("helvetica", "bold");
      doc.text(`Q ${q.toString().padStart(2, '0')}:`, 20, currY);

      const options = ['A', 'B', 'C', 'D'];
      options.forEach((opt, idx) => {
        const circleX = 45 + idx * 16;
        doc.setDrawColor(100, 116, 139);
        doc.circle(circleX, currY - 1, 3);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text(opt, circleX, currY, { align: 'center' });
      });

      if (q <= 10) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`Q ${(q + 20).toString()}:`, 110, currY);

        options.forEach((opt, idx) => {
          const circleX = 135 + idx * 16;
          doc.setDrawColor(100, 116, 139);
          doc.circle(circleX, currY - 1, 3);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.text(opt, circleX, currY, { align: 'center' });
        });
      }

      currY += 9;
    }

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("OMR Sheet Scanner Alignment Marks: [A01-DEN]", 15, 280);

    doc.save(`OMR_Bubble_Sheet_${exam.title.replace(/\s+/g, '_')}.pdf`);
  };

  const downloadReportCardPdf = (student: Student) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header border
    doc.setLineWidth(0.8);
    doc.setDrawColor(30, 41, 59);
    doc.rect(5, 5, 200, 287);
    doc.setLineWidth(0.3);
    doc.rect(6.5, 6.5, 197, 284);

    doc.setFillColor(30, 41, 59);
    doc.rect(10, 10, 190, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("LEARNER'S DEN EDUCATION ACADEMY", 105, 22, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("OFFICIAL REPORT CARD OF ACADEMIC EXCELLENCE", 105, 28, { align: 'center' });
    doc.text(`Active Session: FY 2026-2027 | Continuous & Comprehensive Evaluation (CCE)`, 105, 33, { align: 'center' });
    doc.text("Affiliated to JEE/NEET National Assessment Standards", 105, 38, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.setFillColor(241, 245, 249);
    doc.rect(10, 54, 190, 24, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("STUDENT IDENTITY PROFILE", 15, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`Full Name: ${student.name}`, 15, 66);
    doc.text(`Student ID: ${student.id}`, 15, 72);
    doc.text(`Enrolled Batch ID: ${student.batchId.toUpperCase()}`, 110, 66);
    doc.text(`Email Address: ${student.email}`, 110, 72);

    let currY = 90;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("I. SCHOLASTIC ACHIEVEMENT LEDGER (EXAMINATIONS)", 10, currY);
    doc.line(10, currY + 2, 200, currY + 2);
    currY += 10;

    // Table Header
    doc.setFillColor(226, 232, 240);
    doc.rect(10, currY, 190, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Assessed Subject / Course Unit", 12, currY + 5.5);
    doc.text("Marks Scored", 100, currY + 5.5);
    doc.text("Max Marks", 130, currY + 5.5);
    doc.text("Percentage %", 160, currY + 5.5);
    doc.text("Grade", 185, currY + 5.5);
    
    currY += 8;

    const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
    let totalObtained = 0;
    let totalMax = 0;

    subjects.forEach((sub) => {
      // Find marks
      const ofeMatch = offlineExams.filter(e => e.subject === sub);
      let obtained = 0;
      let maxMarks = 0;

      ofeMatch.forEach(e => {
        obtained += e.studentMarks[student.id] || 0;
        maxMarks += e.totalMarks;
      });

      if (maxMarks === 0) {
        maxMarks = 100;
        obtained = student.id === 'student-2' ? 88 : student.id === 'student-3' ? 74 : 60;
      }

      totalObtained += obtained;
      totalMax += maxMarks;

      const pct = Math.round((obtained / maxMarks) * 100);
      let letterGrade = 'F';
      if (pct >= 90) letterGrade = 'A+';
      else if (pct >= 80) letterGrade = 'A';
      else if (pct >= 70) letterGrade = 'B+';
      else if (pct >= 60) letterGrade = 'B';
      else if (pct >= 40) letterGrade = 'C';

      doc.setFont("helvetica", "normal");
      doc.text(sub, 12, currY + 5.5);
      doc.text(obtained.toString(), 100, currY + 5.5);
      doc.text(maxMarks.toString(), 130, currY + 5.5);
      doc.text(`${pct}%`, 160, currY + 5.5);
      doc.setFont("helvetica", "bold");
      doc.text(letterGrade, 185, currY + 5.5);

      currY += 8;
    });

    doc.line(10, currY, 200, currY);
    currY += 6;

    // Total row
    const aggregatePct = Math.round((totalObtained / totalMax) * 100);
    doc.setFont("helvetica", "bold");
    doc.text("AGGREGATE SUMMARY RESULT", 12, currY);
    doc.text(totalObtained.toString(), 100, currY);
    doc.text(totalMax.toString(), 130, currY);
    doc.setTextColor(16, 185, 129);
    doc.text(`${aggregatePct}%`, 160, currY);
    doc.text(aggregatePct >= 40 ? 'PASS (Promoted)' : 'FAIL', 185, currY);

    doc.setTextColor(30, 41, 59);
    currY += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("II. CO-SCHOLASTIC RATING & CCE METRICS", 10, currY);
    doc.line(10, currY + 2, 200, currY + 2);
    currY += 10;

    const coScholastic = [
      { area: 'Academic Discipline', grade: 'A+', comment: 'Consistently displays exceptional ethics.' },
      { area: 'Creative Problem Solving', grade: 'A', comment: 'Highly innovative approaches in labs.' },
      { area: 'Teamwork & Cooperation', grade: 'B+', comment: 'Participates actively in study circles.' },
      { area: 'Regular Class Attendance', grade: 'A+', comment: '98% checked attendance.' }
    ];

    coScholastic.forEach(item => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(item.area, 12, currY);
      doc.setFont("helvetica", "normal");
      doc.text(item.comment, 65, currY);
      doc.setFont("helvetica", "bold");
      doc.text(item.grade, 185, currY);
      currY += 6;
    });

    currY += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("III. ACADEMIC ADVISORY COMMENTS & SIGNOFF", 10, currY);
    doc.line(10, currY + 2, 200, currY + 2);
    currY += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Principal Remarks & Feedback:", 12, currY);
    doc.setFont("helvetica", "italic");
    doc.text(principalComments, 12, currY + 6, { maxWidth: 180 });

    currY += 30;
    doc.line(15, currY, 55, currY);
    doc.line(145, currY, 185, currY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Academic Class Representative", 15, currY + 5);
    doc.text("Director & Principal Stamp", 145, currY + 5);

    doc.save(`Report_Card_${student.name.replace(/\s+/g, '_')}.pdf`);
  };

  // Helper selectors
  const getStudentName = (id: string) => {
    const s = students.find(student => student.id === id);
    return s ? s.name : 'Unknown Candidate';
  };

  const getStudentBatchName = (studentId: string) => {
    const s = students.find(student => student.id === studentId);
    if (!s) return 'N/A';
    const b = batches.find(batch => batch.id === s.batchId);
    return b ? b.name : 'General Batch';
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Quick navigation links */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('question-bank')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'question-bank' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BrainCircuit className="h-4 w-4" />
            <span>Question Bank</span>
          </button>
          
          <button
            onClick={() => setActiveTab('online-exams')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'online-exams' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Play className="h-4 w-4" />
            <span>Online Exams</span>
          </button>

          <button
            onClick={() => setActiveTab('offline-exams')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'offline-exams' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Offline Marks Sheet</span>
          </button>

          {currentRole !== 'student' && (
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'evaluation' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Written Evaluation Desk</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('ranks')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'ranks' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Ranks & Leaderboards</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'reports' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Printer className="h-4 w-4" />
            <span>CCE Report Cards</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Visual Analytics</span>
          </button>
        </div>

        {/* Dynamic Context selector */}
        <div className="flex gap-2">
          {['admin', 'principal'].includes(currentRole) && (
            <button
              onClick={() => setDeleteConfirmation({ isOpen: true, type: 'bulk-demo' })}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xxs font-black flex items-center gap-1 cursor-pointer transition-all"
              id="bulk-delete-demo-data-btn"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete All Demo Data</span>
            </button>
          )}
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value as any)}
            className="px-2.5 py-1 text-xxs font-black bg-white border border-slate-200 rounded-xl"
          >
            <option value="All">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Biology">Biology</option>
          </select>
        </div>
      </div>

      {/* active taking exam screen override */}
      {activeTakingExam && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            
            {/* Header with timer */}
            <div className="bg-slate-900 text-white px-6 py-4.5 flex justify-between items-center border-b border-slate-800">
              <div>
                <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 rounded-md text-[8px] font-bold uppercase tracking-wider">
                  {activeTakingExam.subject} Online Test
                </span>
                <h3 className="font-extrabold text-sm mt-1">{activeTakingExam.title}</h3>
              </div>
              
              {!isExamSubmitted && (
                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black ${
                  examTimeLeft < 60 ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-indigo-400'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span>
                    {Math.floor(examTimeLeft / 60)}:{(examTimeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* Main content body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!isExamSubmitted ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Left Navigation */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Question Navigator</p>
                    <div className="grid grid-cols-4 gap-2">
                      {activeTakingExam.questions.map((q, idx) => {
                        const isAnswered = examAnswers[q.id] !== undefined;
                        const isCurrent = examCurrentIdx === idx;
                        return (
                          <button
                            key={q.id}
                            onClick={() => setExamCurrentIdx(idx)}
                            className={`h-8 w-8 rounded-lg text-xs font-bold border transition-all ${
                              isCurrent 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                                : isAnswered 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Question body */}
                  <div className="md:col-span-3 space-y-4 text-left">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                      <span className="text-xxs font-extrabold text-slate-400 uppercase">
                        Question {examCurrentIdx + 1} of {activeTakingExam.questions.length}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xxxxs font-black rounded uppercase">
                        Marks: {activeTakingExam.questions[examCurrentIdx].maxMarks}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 leading-relaxed">
                      {activeTakingExam.questions[examCurrentIdx].questionText}
                    </h4>

                    {/* Options if MCQ */}
                    {activeTakingExam.questions[examCurrentIdx].type === 'MCQ' ? (
                      <div className="space-y-2.5 pt-2">
                        {activeTakingExam.questions[examCurrentIdx].options?.map((opt, oIdx) => {
                          const isSelected = examAnswers[activeTakingExam.questions[examCurrentIdx].id] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => setExamAnswers(prev => ({ ...prev, [activeTakingExam.questions[examCurrentIdx].id]: oIdx }))}
                              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span>{opt}</span>
                              <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                              }`}>
                                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      // Subjective answer textbox
                      <div className="space-y-1.5 pt-2">
                        <label className="block text-xxs font-bold text-slate-500 uppercase">Your written response</label>
                        <textarea
                          rows={6}
                          value={(examAnswers[activeTakingExam.questions[examCurrentIdx].id] as string) || ''}
                          onChange={(e) => setExamAnswers(prev => ({ ...prev, [activeTakingExam.questions[examCurrentIdx].id]: e.target.value }))}
                          placeholder="Type your detailed analytical response here..."
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Post Exam result review (Instant auto evaluation for MCQs)
                <div className="space-y-6 text-center max-w-md mx-auto py-8">
                  <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">Exam Submitted Successfully!</h3>
                  <p className="text-xxs text-slate-500">
                    Your MCQ responses have been graded automatically, while your subjective written answers are sent to the written evaluation queue.
                  </p>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-6">
                    <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">MCQ Auto-Evaluation Score</p>
                    <h2 className="text-3xl font-black text-slate-800 mt-1">
                      {examGradingResult?.mcqScore} <span className="text-xs opacity-50">/ {examGradingResult?.maxScore} Marks</span>
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                      Subjective grading is pending manual verification.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer triggers */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
              {!isExamSubmitted ? (
                <>
                  <button
                    disabled={examCurrentIdx === 0}
                    onClick={() => setExamCurrentIdx(p => p - 1)}
                    className="flex items-center gap-1 px-3.5 py-1.5 border border-slate-200 text-xs font-bold rounded-xl bg-white text-slate-600 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  {examCurrentIdx === activeTakingExam.questions.length - 1 ? (
                    <button
                      onClick={handleOnlineExamSubmit}
                      className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span>Submit Exam</span>
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setExamCurrentIdx(p => p + 1)}
                      className="flex items-center gap-1 px-3.5 py-1.5 border border-slate-200 text-xs font-bold rounded-xl bg-white text-slate-600"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setActiveTakingExam(null)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                >
                  Return to Exam Center
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: QUESTION BANK                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'question-bank' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Action bar */}
          <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 text-white p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
            <div>
              <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 rounded-full text-[9px] font-bold uppercase tracking-wider">
                JEE/NEET Concept Reservoir
              </span>
              <h2 className="text-base font-black mt-1.5">Interactive Question Bank</h2>
              <p className="text-xxs text-indigo-200/90 mt-0.5">
                Browse typical entrance exam MCQs and comprehensive analytical subjective challenges. Practise directly or schedule custom examinations.
              </p>
            </div>
            {currentRole !== 'student' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddingQuestion(!isAddingQuestion)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xxs font-bold border border-indigo-400/20 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Insert Question</span>
                </button>
                <button
                  onClick={handleGenerateExamFromBank}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 rounded-xl text-xxs font-bold border border-indigo-400/20 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Auto Exam Generator</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Question Expandable Form */}
          {isAddingQuestion && (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl text-left shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-600" />
                <span>Create Bank Question</span>
              </h3>
              
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Subject</label>
                    <select 
                      value={newQSubject} 
                      onChange={(e) => setNewQSubject(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-indigo-500"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Topic / Chapter</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Thermodynamics" 
                      value={newQTopic} 
                      onChange={(e) => setNewQTopic(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Difficulty</label>
                    <select 
                      value={newQDifficulty} 
                      onChange={(e) => setNewQDifficulty(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-indigo-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Type</label>
                    <select 
                      value={newQType} 
                      onChange={(e) => setNewQType(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-indigo-500"
                    >
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="Subjective">Analytical Written Response</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Question Body Text</label>
                  <textarea 
                    rows={3} 
                    required 
                    placeholder="Describe the conceptual problem or prompt..." 
                    value={newQText} 
                    onChange={(e) => setNewQText(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                  />
                </div>

                {newQType === 'MCQ' ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">MCQ Choice Options</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {newQOptions.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-xl">
                          <span className="text-xxs font-black text-indigo-600">{String.fromCharCode(65 + oIdx)}</span>
                          <input 
                            type="text" 
                            required 
                            placeholder={`Option choice ${String.fromCharCode(65 + oIdx)}`} 
                            value={opt} 
                            onChange={(e) => {
                              const updated = [...newQOptions];
                              updated[oIdx] = e.target.value;
                              setNewQOptions(updated);
                            }}
                            className="w-full text-xs focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Correct Choice Option</label>
                      <select 
                        value={newQCorrectIdx} 
                        onChange={(e) => setNewQCorrectIdx(Number(e.target.value))}
                        className="p-2 border border-slate-200 rounded-xl text-xs bg-white font-bold text-indigo-600 focus:outline-indigo-500"
                      >
                        <option value={0}>Option A</option>
                        <option value={1}>Option B</option>
                        <option value={2}>Option C</option>
                        <option value={3}>Option D</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Model / Reference Answer</label>
                    <textarea 
                      rows={3} 
                      required 
                      placeholder="The correct solution or grading criteria for manual evaluation reference..." 
                      value={newQModelAnswer} 
                      onChange={(e) => setNewQModelAnswer(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Max Score Marks</label>
                    <input 
                      type="number" 
                      required 
                      value={newQMaxMarks} 
                      onChange={(e) => setNewQMaxMarks(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Hints (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Helpful clue for candidate..." 
                      value={newQHint} 
                      onChange={(e) => setNewQHint(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Step-by-Step Explanation</label>
                    <input 
                      type="text" 
                      placeholder="Pedagogical reasoning steps..." 
                      value={newQExplanation} 
                      onChange={(e) => setNewQExplanation(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingQuestion(false)}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl bg-slate-50 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Save to Reservoir
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Question Practice Panel */}
          {selectedPracticeQ && (
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-left space-y-4 animate-in slide-in-from-top-4 duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-black uppercase">
                    Self Practice: {selectedPracticeQ.subject}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-800 mt-1">{selectedPracticeQ.topic}</h3>
                </div>
                <button 
                  onClick={() => { setSelectedPracticeQ(null); setPracticeChecked(false); setPracticeAnswer(''); }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-800 font-semibold leading-relaxed bg-white p-3.5 rounded-xl border border-slate-100">
                {selectedPracticeQ.questionText}
              </p>

              {selectedPracticeQ.type === 'MCQ' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {selectedPracticeQ.options?.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      disabled={practiceChecked}
                      onClick={() => setPracticeAnswer(oIdx)}
                      className={`p-3 text-left border rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        practiceChecked && oIdx === selectedPracticeQ.correctOptionIndex
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                          : practiceChecked && Number(practiceAnswer) === oIdx && oIdx !== selectedPracticeQ.correctOptionIndex
                          ? 'bg-rose-50 border-rose-400 text-rose-800'
                          : Number(practiceAnswer) === oIdx
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xxs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      <span className="text-[10px] text-slate-400 font-black">{String.fromCharCode(65 + oIdx)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xxs font-bold text-slate-500 uppercase">Draft your model reply</label>
                  <textarea
                    rows={4}
                    disabled={practiceChecked}
                    value={(practiceAnswer as string) || ''}
                    onChange={(e) => setPracticeAnswer(e.target.value)}
                    placeholder="Write detailed descriptive derivations..."
                    className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs focus:outline-indigo-500"
                  />
                </div>
              )}

              {practiceChecked && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    {practiceCorrect ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-black bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <Check className="h-4 w-4" /> Correct Answer
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 font-black bg-rose-50 px-2.5 py-1 rounded-lg">
                        <XCircle className="h-4 w-4" /> Incorrect Choice
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 font-medium">
                    <b>Pedagogical Explanation:</b> {selectedPracticeQ.explanation || 'No reasoning compiled.'}
                  </p>
                  {selectedPracticeQ.type === 'Subjective' && (
                    <p className="text-slate-600 font-medium border-t border-slate-100 pt-2 mt-2">
                      <b>Model Answer Key:</b> <span className="text-indigo-800 font-semibold">{selectedPracticeQ.modelAnswer}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                {selectedPracticeQ.hint && !practiceChecked && (
                  <button 
                    onClick={() => triggerLocalNotification('Hint Clue', selectedPracticeQ.hint || '', 'info')}
                    className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xxs font-bold rounded-lg border border-amber-200"
                  >
                    Reveal Clue Hint
                  </button>
                )}
                {!practiceChecked ? (
                  <button 
                    onClick={checkPracticeAnswer}
                    disabled={practiceAnswer === ''}
                    className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xxs rounded-lg disabled:opacity-40 cursor-pointer"
                  >
                    Verify Response
                  </button>
                ) : (
                  <button 
                    onClick={() => { setPracticeChecked(false); setPracticeAnswer(''); }}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xxs rounded-lg cursor-pointer"
                  >
                    Retry Problem
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Question Reservoir Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xxs">
            <div className="p-4.5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Concept Reservoir</h3>
                <p className="text-xxxxs text-slate-400 mt-0.5 font-bold uppercase tracking-widest">Database of verified entrance questions</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-450 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4">Subject/Topic</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Max Marks</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {questionBank
                    .filter(q => selectedSubject === 'All' || q.subject === selectedSubject)
                    .map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div>
                            <span className={`inline-block px-1.5 py-0.5 text-[8px] font-black rounded uppercase mr-1.5 ${
                              q.subject === 'Physics' ? 'bg-blue-50 text-blue-700' :
                              q.subject === 'Chemistry' ? 'bg-purple-50 text-purple-700' :
                              q.subject === 'Mathematics' ? 'bg-amber-50 text-amber-700' :
                              'bg-emerald-50 text-emerald-700'
                            }`}>
                              {q.subject}
                            </span>
                            <span className="font-semibold text-slate-800">{q.topic}</span>
                            <p className="text-xxs text-slate-450 line-clamp-1 mt-0.5 font-medium">{q.questionText}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold text-slate-500">{q.type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700">{q.maxMarks} Marks</td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => { setSelectedPracticeQ(q); setPracticeChecked(false); setPracticeAnswer(''); }}
                            className="inline-flex items-center gap-1 text-indigo-650 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl font-bold text-xxs transition-all cursor-pointer"
                          >
                            <Play className="h-3 w-3" />
                            <span>Try Question</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ONLINE EXAMS                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'online-exams' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-slate-700 text-left">
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-slate-800">Online Examination Room</h2>
              <p className="text-xxs text-slate-450 mt-0.5">Continuous auto-graded and manual analytical online test center.</p>
            </div>
            
            {currentRole !== 'student' && (
              <button
                onClick={() => setIsBuildingExam(!isBuildingExam)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xxs font-bold cursor-pointer transition-all shadow-xxs"
              >
                <Plus className="h-4 w-4" />
                <span>Build New Exam</span>
              </button>
            )}
          </div>

          {/* New Exam Builder manually */}
          {isBuildingExam && (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <LayoutGrid className="h-4.5 w-4.5 text-indigo-600" />
                <span>Build New Online Assessment</span>
              </h3>

              <form onSubmit={handleCreateOnlineExam} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Assessment Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Kinematics Term Quiz" 
                      value={newOeTitle} 
                      onChange={(e) => setNewOeTitle(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Subject</label>
                    <select 
                      value={newOeSubject} 
                      onChange={(e) => setNewOeSubject(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-indigo-500 font-semibold text-slate-800"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Duration (Minutes)</label>
                    <input 
                      type="number" 
                      required 
                      value={newOeDuration} 
                      onChange={(e) => setNewOeDuration(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {/* Additional Academic and Administration fields */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Examination Type</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. MCQ Term Quiz" 
                      value={newOeExamType} 
                      onChange={(e) => setNewOeExamType(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Class / Target</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Class 12" 
                      value={newOeClassId} 
                      onChange={(e) => setNewOeClassId(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Target Batch</label>
                    <select 
                      value={newOeBatchId} 
                      onChange={(e) => setNewOeBatchId(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    >
                      <option value="all">All Batches</option>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Pass Marks</label>
                    <input 
                      type="number" 
                      required 
                      value={newOePassMarks} 
                      onChange={(e) => setNewOePassMarks(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Exam Date</label>
                    <input 
                      type="date" 
                      required 
                      value={newOeDate} 
                      onChange={(e) => setNewOeDate(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                    <input 
                      type="time" 
                      required 
                      value={newOeStartTime} 
                      onChange={(e) => setNewOeStartTime(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">End Time</label>
                    <input 
                      type="time" 
                      required 
                      value={newOeEndTime} 
                      onChange={(e) => setNewOeEndTime(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Invigilator</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Prof. Roy" 
                      value={newOeInvigilator} 
                      onChange={(e) => setNewOeInvigilator(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Blueprint Layout Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 5 MCQ, 5 Subjective questions matching JEE syllabus" 
                      value={newOeBlueprint} 
                      onChange={(e) => setNewOeBlueprint(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Syllabus Scope Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Electromagnetism, Coulomb Law, Flux proofs" 
                      value={newOeSyllabus} 
                      onChange={(e) => setNewOeSyllabus(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Examination Instructions</label>
                    <input 
                      type="text" 
                      placeholder="Special instructions for students..." 
                      value={newOeInstructions} 
                      onChange={(e) => setNewOeInstructions(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Examination Status</label>
                    <select 
                      value={newOeStatus} 
                      onChange={(e) => setNewOeStatus(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-indigo-500 font-semibold text-slate-800"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-slate-500 uppercase mb-2">Select Questions from Reservoir (At least 1)</label>
                  <div className="border border-slate-200 rounded-xl max-h-52 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1 bg-slate-50">
                    {questionBank
                      .filter(q => q.subject === newOeSubject)
                      .map(q => {
                        const isChecked = newOeSelectedQIds.includes(q.id);
                        return (
                          <label key={q.id} className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-150 cursor-pointer hover:bg-indigo-50/20">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewOeSelectedQIds(prev => [...prev, q.id]);
                                } else {
                                  setNewOeSelectedQIds(prev => prev.filter(id => id !== q.id));
                                }
                              }}
                              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="text-xs font-semibold text-slate-700">
                              <span className="text-xxs text-indigo-600 font-extrabold">[{q.difficulty}]</span> {q.questionText}
                              <span className="block text-[9px] text-slate-400 mt-0.5">Topic: {q.topic} | Marks: {q.maxMarks}</span>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setIsBuildingExam(false)}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl bg-slate-50 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Publish Online Exam
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Online Exams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {onlineExams
              .filter(e => selectedSubject === 'All' || e.subject === selectedSubject)
              .map((exam) => {
                const isStudent = currentRole === 'student';
                const hasSubmission = submissions.find(sub => sub.examId === exam.id && sub.studentId === (currentUser?.associatedId || 'student-2'));
                const isTaken = hasSubmission !== undefined;

                return (
                  <div key={exam.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase ${
                          exam.subject === 'Physics' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          exam.subject === 'Chemistry' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          exam.subject === 'Mathematics' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {exam.subject} Online
                        </span>
                        <div className="flex gap-1.5">
                          <span className="text-xxs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg">
                            {exam.durationMinutes} Mins
                          </span>
                          <span className="text-xxs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg">
                            {exam.totalMarks} Marks
                          </span>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-800 mt-3.5 leading-snug">{exam.title}</h3>
                      <p className="text-xxs text-slate-400 mt-1 font-bold uppercase tracking-wide">
                        Contains {exam.questions.length} Analytical items ({exam.questions.filter(q=>q.type==='MCQ').length} MCQs, {exam.questions.filter(q=>q.type==='Subjective').length} Subjective)
                      </p>

                      {/* Detailed Metadata Grid */}
                      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 bg-slate-50 border border-slate-150 p-3 rounded-xl text-[11px] font-semibold text-slate-600">
                        <div>
                          <span className="block text-xxxxs text-slate-400 uppercase font-black">Exam Type</span>
                          <span className="text-slate-800">{exam.examinationType || 'Online MCQ'}</span>
                        </div>
                        <div>
                          <span className="block text-xxxxs text-slate-400 uppercase font-black">Class / Target</span>
                          <span className="text-slate-800">{exam.classId || 'Class 12'}</span>
                        </div>
                        <div>
                          <span className="block text-xxxxs text-slate-400 uppercase font-black">Date & Time</span>
                          <span className="text-slate-800">{exam.date} @ {exam.startTime || '10:00'} - {exam.endTime || '10:30'}</span>
                        </div>
                        <div>
                          <span className="block text-xxxxs text-slate-400 uppercase font-black">Pass Marks</span>
                          <span className="text-rose-600 font-extrabold">{exam.passMarks || Math.round(exam.totalMarks * 0.4)} / {exam.totalMarks} Marks</span>
                        </div>
                        {exam.invigilator && (
                          <div className="col-span-2 border-t border-slate-200/50 pt-1">
                            <span className="block text-xxxxs text-slate-400 uppercase font-black">Invigilator</span>
                            <span className="text-slate-800">{exam.invigilator}</span>
                          </div>
                        )}
                        {exam.status && (
                          <div>
                            <span className="block text-xxxxs text-slate-400 uppercase font-black">Status</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              exam.status === 'Completed' ? 'bg-slate-200 text-slate-700' :
                              exam.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-indigo-100 text-indigo-800'
                            }`}>{exam.status}</span>
                          </div>
                        )}
                        {exam.blueprint && (
                          <div className="col-span-2 border-t border-slate-200/50 pt-1">
                            <span className="block text-xxxxs text-slate-400 uppercase font-black">Blueprint</span>
                            <span className="text-slate-700 italic">{exam.blueprint}</span>
                          </div>
                        )}
                        {exam.syllabus && (
                          <div className="col-span-2 border-t border-slate-200/50 pt-1">
                            <span className="block text-xxxxs text-slate-400 uppercase font-black">Syllabus Scope</span>
                            <span className="text-slate-700 line-clamp-2">{exam.syllabus}</span>
                          </div>
                        )}
                        {exam.instructions && (
                          <div className="col-span-2 border-t border-slate-200/50 pt-1">
                            <span className="block text-xxxxs text-slate-400 uppercase font-black">Instructions</span>
                            <span className="text-amber-700">{exam.instructions}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center">
                      {isTaken ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-xxs bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Submitted: {hasSubmission.totalScore}/{exam.totalMarks} ({hasSubmission.status})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-600 font-extrabold text-xxs bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                          <Clock className="h-4 w-4" />
                          <span>Pending Attempt</span>
                        </div>
                      )}

                      <div className="flex gap-1.5 items-center">
                        {/* Admin / Principal Edit & Delete Controls */}
                        {['admin', 'principal'].includes(currentRole) && (
                          <>
                            <button
                              onClick={() => setEditingExam({
                                id: exam.id,
                                isOnline: true,
                                title: exam.title,
                                subject: exam.subject as any,
                                examinationType: exam.examinationType || 'Online MCQ',
                                classId: exam.classId || 'Class 12',
                                batchId: exam.batchId || 'all',
                                date: exam.date || '',
                                startTime: exam.startTime || '10:00',
                                endTime: exam.endTime || '10:30',
                                durationMinutes: exam.durationMinutes,
                                totalMarks: exam.totalMarks,
                                passMarks: exam.passMarks || Math.round(exam.totalMarks * 0.4),
                                blueprint: exam.blueprint || '',
                                syllabus: exam.syllabus || '',
                                instructions: exam.instructions || '',
                                invigilator: exam.invigilator || '',
                                status: exam.status || 'Upcoming'
                              })}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer edit-exam-btn"
                              title="Edit Examination details"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmation({ isOpen: true, type: 'single-online', targetId: exam.id })}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition-all cursor-pointer delete-exam-btn"
                              title="Delete individual record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}

                        {isStudent ? (
                          <button
                            disabled={isTaken}
                            onClick={() => handleStartExam(exam)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xxs font-bold disabled:opacity-50 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
                          >
                            <Play className="h-3 w-3 fill-white" />
                            <span>{isTaken ? 'Attempted' : 'Take Test'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartExam(exam)}
                            className="flex items-center gap-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl px-3 py-1.5 text-xxs font-extrabold transition-all cursor-pointer"
                          >
                            <span>Preview Questions</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: OFFLINE EXAMS                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'offline-exams' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-slate-700 text-left">
          
          <div className="bg-gradient-to-r from-cyan-950 to-indigo-950 text-white p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="px-2 py-0.5 bg-cyan-500/30 text-cyan-200 border border-cyan-400/20 rounded-full text-[9px] font-bold uppercase tracking-wider">
                In-Centre Paper Grading
              </span>
              <h2 className="text-base font-black mt-1.5">Offline Examination & OMR Suite</h2>
              <p className="text-xxs text-indigo-200/90 mt-0.5">
                Generate high-quality academic question papers and scanner-ready OMR response sheets. Manually compile and log marks securely.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Create Offline Exam Form */}
            {currentRole !== 'student' && (
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-xxs h-fit">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 mb-4 border-b border-slate-100 pb-2">
                  <Calendar className="h-4.5 w-4.5 text-indigo-600" />
                  <span>Schedule Term Test</span>
                </h3>

                <form onSubmit={handleCreateOfflineExam} className="space-y-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Assessment Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. JEE Mechanics Term Test" 
                      value={newOfeTitle} 
                      onChange={(e) => setNewOfeTitle(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Subject</label>
                      <select 
                        value={newOfeSubject} 
                        onChange={(e) => setNewOfeSubject(e.target.value as any)}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-indigo-500"
                      >
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Biology">Biology</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Total Marks</label>
                      <input 
                        type="number" 
                        required 
                        value={newOfeTotalMarks} 
                        onChange={(e) => setNewOfeTotalMarks(Number(e.target.value))}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Date</label>
                      <input 
                        type="date" 
                        required 
                        value={newOfeDate} 
                        onChange={(e) => setNewOfeDate(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Target Batch</label>
                      <select 
                        value={newOfeBatchId} 
                        onChange={(e) => setNewOfeBatchId(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-indigo-500"
                      >
                        <option value="all">All Batches</option>
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Exam Type</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Offline Term" 
                        value={newOfeExamType} 
                        onChange={(e) => setNewOfeExamType(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Class</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Class 12" 
                        value={newOfeClassId} 
                        onChange={(e) => setNewOfeClassId(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                      <input 
                        type="time" 
                        required 
                        value={newOfeStartTime} 
                        onChange={(e) => setNewOfeStartTime(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">End Time</label>
                      <input 
                        type="time" 
                        required 
                        value={newOfeEndTime} 
                        onChange={(e) => setNewOfeEndTime(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Pass Marks</label>
                      <input 
                        type="number" 
                        required 
                        value={newOfePassMarks} 
                        onChange={(e) => setNewOfePassMarks(Number(e.target.value))}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Invigilator</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Prof. Kumar" 
                        value={newOfeInvigilator} 
                        onChange={(e) => setNewOfeInvigilator(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Blueprint Layout Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sections A (30 marks), B (40 marks)..." 
                      value={newOfeBlueprint} 
                      onChange={(e) => setNewOfeBlueprint(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Examination Instructions</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Use dark blue/black ballpoint pen..." 
                      value={newOfeInstructions} 
                      onChange={(e) => setNewOfeInstructions(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Syllabus Scope Description</label>
                    <textarea 
                      rows={2} 
                      placeholder="Chapters, modules or units covered..." 
                      value={newOfeSyllabus} 
                      onChange={(e) => setNewOfeSyllabus(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Exam Status</label>
                    <select 
                      value={newOfeStatus} 
                      onChange={(e) => setNewOfeStatus(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-indigo-500"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xxs"
                  >
                    Schedule Term Paper
                  </button>
                </form>
              </div>
            )}

            {/* Offline Exams Ledger */}
            <div className={`lg:col-span-${currentRole === 'student' ? '12' : '8'} space-y-4`}>
              {offlineExams
                .filter(e => selectedSubject === 'All' || e.subject === selectedSubject)
                .map((exam) => {
                  const isEditing = editingOfflineExamId === exam.id;
                  
                  return (
                    <div key={exam.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs space-y-4">
                      
                      {/* Top info row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="w-full">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-150 rounded text-[8px] font-black uppercase">
                              {exam.subject} Paper
                            </span>
                            <span className="text-xxs text-slate-400 font-bold">{exam.date}</span>
                          </div>
                          <h3 className="font-extrabold text-sm text-slate-800 mt-2">{exam.title}</h3>
                          <p className="text-xxxxs text-slate-400 font-bold uppercase mt-0.5">Syllabus Scope: {exam.syllabus}</p>

                          {/* Offline Detailed Metadata Grid */}
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 bg-slate-50 border border-slate-150 p-3 rounded-xl text-[11px] font-semibold text-slate-600">
                            <div>
                              <span className="block text-xxxxs text-slate-400 uppercase font-black">Exam Type</span>
                              <span className="text-slate-800">{exam.examinationType || 'Offline Written'}</span>
                            </div>
                            <div>
                              <span className="block text-xxxxs text-slate-400 uppercase font-black">Class / Target</span>
                              <span className="text-slate-800">{exam.classId || 'Class 12'}</span>
                            </div>
                            <div>
                              <span className="block text-xxxxs text-slate-400 uppercase font-black">Schedule</span>
                              <span className="text-slate-800">{exam.startTime || '10:00'} - {exam.endTime || '12:00'}</span>
                            </div>
                            <div>
                              <span className="block text-xxxxs text-slate-400 uppercase font-black">Pass Marks</span>
                              <span className="text-rose-600 font-extrabold">{exam.passMarks || Math.round(exam.totalMarks * 0.33)} / {exam.totalMarks} Marks</span>
                            </div>
                            {exam.invigilator && (
                              <div className="col-span-2 border-t border-slate-200/50 pt-1">
                                <span className="block text-xxxxs text-slate-400 uppercase font-black">Invigilator</span>
                                <span className="text-slate-800">{exam.invigilator}</span>
                              </div>
                            )}
                            {exam.status && (
                              <div>
                                <span className="block text-xxxxs text-slate-400 uppercase font-black">Status</span>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  exam.status === 'Completed' ? 'bg-slate-200 text-slate-700' :
                                  exam.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-800' :
                                  'bg-indigo-100 text-indigo-800'
                                }`}>{exam.status}</span>
                              </div>
                            )}
                            {exam.blueprint && (
                              <div className="col-span-2 border-t border-slate-200/50 pt-1">
                                <span className="block text-xxxxs text-slate-400 uppercase font-black">Blueprint Layout</span>
                                <span className="text-slate-700 italic">{exam.blueprint}</span>
                              </div>
                            )}
                            {exam.instructions && (
                              <div className="col-span-2 border-t border-slate-200/50 pt-1">
                                <span className="block text-xxxxs text-slate-400 uppercase font-black">Instructions</span>
                                <span className="text-amber-700">{exam.instructions}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {currentRole !== 'student' && (
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            {['admin', 'principal'].includes(currentRole) && (
                              <>
                                <button
                                  onClick={() => setEditingExam({
                                    id: exam.id,
                                    isOnline: false,
                                    title: exam.title,
                                    subject: exam.subject as any,
                                    examinationType: exam.examinationType || 'Offline Written',
                                    classId: exam.classId || 'Class 12',
                                    batchId: exam.batchId || 'all',
                                    date: exam.date || '',
                                    startTime: exam.startTime || '10:00',
                                    endTime: exam.endTime || '12:00',
                                    durationMinutes: exam.durationMinutes || 120,
                                    totalMarks: exam.totalMarks,
                                    passMarks: exam.passMarks || Math.round(exam.totalMarks * 0.33),
                                    blueprint: exam.blueprint || '',
                                    syllabus: exam.syllabus || '',
                                    instructions: exam.instructions || '',
                                    invigilator: exam.invigilator || '',
                                    status: exam.status || 'Upcoming'
                                  })}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer edit-exam-btn"
                                  title="Edit Offline Exam details"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmation({ isOpen: true, type: 'single-offline', targetId: exam.id })}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition-all cursor-pointer delete-exam-btn"
                                  title="Delete individual record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => downloadBlankExamPaper(exam)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xxs font-bold flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <FileDown className="h-3.5 w-3.5 text-slate-500" />
                              <span>Question Sheet PDF</span>
                            </button>
                            <button
                              onClick={() => downloadBlankOMRSheet(exam)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xxs font-bold flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Printer className="h-3.5 w-3.5 text-slate-500" />
                              <span>OMR PDF</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Manual marks logger table */}
                      {currentRole !== 'student' && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-3.5 text-left">
                          <div className="flex justify-between items-center">
                            <span className="text-xxs font-black text-slate-500 uppercase tracking-wider">Candidate Grade Roster</span>
                            
                            {isEditing ? (
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => setEditingOfflineExamId(null)}
                                  className="px-2.5 py-1 text-xxxxs font-black uppercase bg-slate-200 hover:bg-slate-300 rounded text-slate-700"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => saveOfflineMarks(exam.id)}
                                  className="px-2.5 py-1 text-xxxxs font-black uppercase bg-indigo-650 hover:bg-indigo-750 rounded text-white"
                                >
                                  Save Logs
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => startEditingOfflineMarks(exam)}
                                className="px-2.5 py-1 text-xxxxs font-black uppercase bg-indigo-50 hover:bg-indigo-100 rounded text-indigo-700 border border-indigo-200/50"
                              >
                                Edit Marks Record
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {students.slice(0, 3).map((std) => {
                              const marks = isEditing ? tempOfflineMarks[std.id] : exam.studentMarks[std.id];
                              
                              return (
                                <div key={std.id} className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-left shadow-xxxxs">
                                  <div>
                                    <h4 className="text-xxs font-extrabold text-slate-800">{std.name}</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{getStudentBatchName(std.id)}</p>
                                  </div>

                                  {isEditing ? (
                                    <input 
                                      type="number"
                                      className="w-16 border border-slate-200 rounded-lg p-1.5 text-center font-bold text-xs bg-slate-50 focus:bg-white"
                                      max={exam.totalMarks}
                                      value={marks === undefined ? '' : marks}
                                      onChange={(e) => setTempOfflineMarks({ ...tempOfflineMarks, [std.id]: Number(e.target.value) })}
                                    />
                                  ) : (
                                    <div className="text-right">
                                      <span className="text-xs font-black text-slate-800">
                                        {marks !== undefined ? `${marks} Marks` : 'N/A'}
                                      </span>
                                      <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Max: {exam.totalMarks}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Student view of offline exam marks */}
                      {currentRole === 'student' && (() => {
                        const score = exam.studentMarks[currentUser?.associatedId || 'student-2'];
                        const percent = score !== undefined ? Math.round((score / exam.totalMarks) * 100) : null;
                        
                        return (
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
                            <span className="text-xxs font-black text-slate-500 uppercase">My Evaluated Mark</span>
                            
                            {score !== undefined ? (
                              <div className="text-right">
                                <span className="text-sm font-black text-emerald-600">{score} / {exam.totalMarks} Marks</span>
                                <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">Accuracy: {percent}%</span>
                              </div>
                            ) : (
                              <span className="text-xxs text-slate-400 font-bold">Grades not declared yet.</span>
                            )}
                          </div>
                        );
                      })()}

                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: WRITTEN EVALUATION DESK                                           */}
      {/* ========================================================================= */}
      {activeTab === 'evaluation' && currentRole !== 'student' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-slate-700 text-left">
          
          <div>
            <h2 className="text-base font-black text-slate-800">Written Evaluation Desk</h2>
            <p className="text-xxs text-slate-450 mt-0.5">Pedagogical manual assessment console for descriptive answer booklets.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Submissions queue table */}
            <div className={`lg:col-span-${evaluatingSub ? '5' : '12'} bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xxs h-fit`}>
              <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-indigo-650" />
                <span>Written Submissions Queue</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[9px] text-slate-450 font-black uppercase tracking-wider border-b border-slate-100">
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Assessment Exam</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xxs">
                    {submissions.map((sub) => {
                      const exam = onlineExams.find(oe => oe.id === sub.examId);
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/40">
                          <td className="py-3 px-3 font-extrabold text-slate-800">{sub.studentName}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-600 block max-w-[150px] truncate">{exam?.title || 'Online Exam'}</span>
                            <span className="text-[8px] text-slate-400 font-semibold uppercase">{sub.completedAt}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] ${
                              sub.status === 'Evaluated' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' 
                                : 'bg-amber-50 text-amber-700 border border-amber-150'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button 
                              onClick={() => startEvaluating(sub)}
                              className="px-2.5 py-1 text-xxxxs font-black uppercase bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded transition-all cursor-pointer"
                            >
                              Grade response
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evaluation worksheet workspace */}
            {evaluatingSub && (() => {
              const exam = onlineExams.find(oe => oe.id === evaluatingSub.examId);
              const descriptiveQuestions = exam?.questions.filter(q => q.type === 'Subjective') || [];

              return (
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs text-left space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">Analytical Marking Worksheet</h3>
                      <p className="text-xxxxs text-slate-400 font-bold uppercase mt-0.5">Student: {evaluatingSub.studentName} | {exam?.title}</p>
                    </div>
                    <button 
                      onClick={() => setEvaluatingSub(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4 divide-y divide-slate-100">
                    {descriptiveQuestions.map((q, idx) => {
                      const studentResponse = evaluatingSub.answers[q.id] || 'No response recorded.';
                      
                      return (
                        <div key={q.id} className="pt-4 first:pt-0 space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-xxs font-black text-slate-450 uppercase">Item Challenge #{idx + 1}</span>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Max Mark Allowed: {q.maxMarks}</span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {q.questionText}
                          </h4>

                          <div className="p-3.5 bg-indigo-50/30 border border-indigo-100/50 rounded-xl space-y-1">
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block">Student written submission</span>
                            <p className="text-xs text-indigo-950 font-medium leading-relaxed italic">{studentResponse}</p>
                          </div>

                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xxs">
                            <span className="font-black text-slate-500 uppercase block">Model Reference Answer Key</span>
                            <p className="text-slate-600 font-semibold">{q.modelAnswer || 'No model criteria defined.'}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Score Marks</label>
                              <input 
                                type="number"
                                className="w-full border border-slate-200 rounded-xl p-2 font-bold text-xs bg-slate-50 text-center"
                                max={q.maxMarks}
                                value={evalMarks[q.id] === undefined ? '' : evalMarks[q.id]}
                                onChange={(e) => setEvalMarks({ ...evalMarks, [q.id]: Number(e.target.value) })}
                              />
                            </div>
                            <div className="sm:col-span-9">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pedagogical Feedback comment</label>
                              <input 
                                type="text"
                                className="w-full border border-slate-200 rounded-xl p-2 text-xs bg-slate-50"
                                placeholder="Praise details or suggest corrective measures..."
                                value={evalFeedback[q.id] || ''}
                                onChange={(e) => setEvalFeedback({ ...evalFeedback, [q.id]: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={submitManualEvaluation}
                    className="w-full py-2.5 mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Approve and Submit Grade
                  </button>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: RANKS & LEADERBOARD                                               */}
      {/* ========================================================================= */}
      {activeTab === 'ranks' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-slate-700 text-left">
          
          <div>
            <h2 className="text-base font-black text-slate-800">Academic Ranks & Leaderboard</h2>
            <p className="text-xxs text-slate-400 mt-0.5">Real-time cohort performance and diagnostic grade boundaries.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl">
              <span className="text-[9px] font-black text-slate-450 uppercase">Cohort Highest Score</span>
              <h2 className="text-2xl font-black text-indigo-600 mt-1">105 / 120</h2>
              <p className="text-[9px] text-slate-400 font-medium mt-1">Held by: Aarav Sharma</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl">
              <span className="text-[9px] font-black text-slate-450 uppercase">Class Average Score</span>
              <h2 className="text-2xl font-black text-slate-800 mt-1">91.6 / 120</h2>
              <p className="text-[9px] text-slate-400 font-medium mt-1">Accuracy: 76.3%</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl">
              <span className="text-[9px] font-black text-slate-450 uppercase">Aggregate Pass Rate</span>
              <h2 className="text-2xl font-black text-emerald-600 mt-1">100%</h2>
              <p className="text-[9px] text-slate-400 font-medium mt-1">All candidates passed limits</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl">
              <span className="text-[9px] font-black text-slate-450 uppercase">Active Cohort Size</span>
              <h2 className="text-2xl font-black text-indigo-950 mt-1">3 Active</h2>
              <p className="text-[9px] text-slate-400 font-medium mt-1">Registered in assessment cycle</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xxs">
            <div className="p-4.5 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">Leaderboard Standings</h3>
              <p className="text-xxxxs text-slate-400 font-bold uppercase mt-0.5">Continuous score aggregate</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[9px] text-slate-450 font-black uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4 text-center w-16">Rank</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Subject Focus</th>
                    <th className="py-3 px-4">Aggregate Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {[
                    { rank: 1, name: 'Aarav Sharma', subject: 'Chemistry Kinetics', score: '105/120', percent: '87.5%', status: 'Outstanding' },
                    { rank: 2, name: 'Aditi Verma', subject: 'Trigonometry', score: '92/120', percent: '76.6%', status: 'Excellent' },
                    { rank: 3, name: 'Vikram Malhotra', subject: 'Cell Biology', score: '78/120', percent: '65.0%', status: 'Good' }
                  ].map((cand) => (
                    <tr key={cand.rank} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 text-center">
                        {cand.rank === 1 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-50 text-amber-600 font-black text-xxs border border-amber-200">🏆</span>
                        ) : cand.rank === 2 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-600 font-black text-xxs border border-slate-200">🥈</span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-50 text-orange-600 font-black text-xxs border border-orange-200">🥉</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{cand.name}</div>
                        <p className="text-xxxxs text-slate-400 mt-0.5">Enrolled batch student</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xxs font-semibold text-slate-600">{cand.subject}</span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-700">{cand.score}</td>
                      <td className="py-3.5 px-4 font-bold text-indigo-650">{cand.percent}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[8px] bg-indigo-50 text-indigo-700 border border-indigo-200/50 uppercase">
                          {cand.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: CCE REPORT CARDS                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-slate-700 text-left">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <Printer className="h-4.5 w-4.5 text-indigo-600" />
              <span>CCE Term Report Card Generator</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Profile Config */}
              <div className="md:col-span-4 space-y-4">
                <div>
                  <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Select Candidate Student</label>
                  <select
                    value={reportCardStudentId}
                    disabled={currentRole === 'student'}
                    onChange={(e) => setReportCardStudentId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-indigo-500 font-semibold text-slate-700"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                    ))}
                  </select>
                </div>

                {currentRole !== 'student' && (
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Principal / Advisory Remarks</label>
                    <textarea
                      rows={4}
                      value={principalComments}
                      onChange={(e) => setPrincipalComments(e.target.value)}
                      placeholder="Input customized continuous evaluations..."
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-indigo-500"
                    />
                  </div>
                )}

                <button
                  onClick={() => {
                    const match = students.find(s => s.id === reportCardStudentId);
                    if (match) downloadReportCardPdf(match);
                  }}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xxs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Download Report Card PDF</span>
                </button>
              </div>

              {/* Layout Preview */}
              <div className="md:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                {/* Simulated Card layout */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="text-center border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-sm text-slate-800">LEARNERS DEN ACADEMY</h4>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Scholastic continuous evaluation booklet</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xxs text-left">
                    <div>
                      <span className="block text-slate-400 font-bold">STUDENT PROFILE</span>
                      <h5 className="font-black text-slate-700 mt-1">Name: {getStudentName(reportCardStudentId)}</h5>
                      <span className="block text-slate-500 font-bold mt-0.5">UID: {reportCardStudentId}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-slate-400 font-bold">ACADEMIC YEAR</span>
                      <h5 className="font-black text-slate-700 mt-1">2026-2027</h5>
                      <span className="block text-slate-500 font-bold mt-0.5">Batch: {getStudentBatchName(reportCardStudentId)}</span>
                    </div>
                  </div>

                  {/* Marks breakdown simulation */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xxs">
                      <thead>
                        <tr className="bg-slate-50 text-[9px] text-slate-450 font-black uppercase tracking-wider border-b border-slate-100">
                          <th className="p-2">Subject Course</th>
                          <th className="p-2">Scored</th>
                          <th className="p-2">Max marks</th>
                          <th className="p-2 text-right">CCE Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {[
                          { subject: 'Physics', scored: reportCardStudentId === 'student-2' ? 88 : 64, max: 100, grade: 'A' },
                          { subject: 'Chemistry', scored: reportCardStudentId === 'student-2' ? 105 : 92, max: 120, grade: 'A+' },
                          { subject: 'Mathematics', scored: reportCardStudentId === 'student-2' ? 95 : 78, max: 100, grade: 'A+' },
                          { subject: 'Biology', scored: reportCardStudentId === 'student-2' ? 90 : 85, max: 100, grade: 'A' }
                        ].map((m, idx) => (
                          <tr key={idx}>
                            <td className="p-2 text-slate-800 font-bold">{m.subject}</td>
                            <td className="p-2 text-slate-650">{m.scored}</td>
                            <td className="p-2 text-slate-500">{m.max}</td>
                            <td className="p-2 text-right text-indigo-600 font-bold">{m.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Advisory feedback text */}
                  <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-lg text-xxs text-left leading-relaxed">
                    <span className="font-black text-indigo-900 block">ADVISORY DIRECTORS COMMENTS:</span>
                    <p className="text-slate-600 italic mt-1">"{principalComments}"</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 7: VISUAL ANALYTICS                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-slate-700 text-left">
          
          <div>
            <h2 className="text-base font-black text-slate-800">Visual Examinations Analytics</h2>
            <p className="text-xxs text-slate-400 mt-0.5">Statistical distributions, difficulty curves, and aggregate performance insights.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Subject average score chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xxs">
              <h3 className="font-bold text-xs text-slate-800 mb-4 uppercase tracking-wider">Subjective Class Average Performance</h3>
              <div className="h-64 text-xxs font-bold">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Physics', ClassAverage: 76, TopScore: 92 },
                    { name: 'Chemistry', ClassAverage: 82, TopScore: 98 },
                    { name: 'Mathematics', ClassAverage: 68, TopScore: 95 },
                    { name: 'Biology', ClassAverage: 85, TopScore: 96 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ClassAverage" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="TopScore" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score distribution area histogram */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xxs">
              <h3 className="font-bold text-xs text-slate-800 mb-4 uppercase tracking-wider">Score Distribution Curve</h3>
              <div className="h-64 text-xxs font-bold">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { range: 'Under 40%', students: 0 },
                    { range: '40% - 60%', students: 1 },
                    { range: '60% - 80%', students: 3 },
                    { range: 'Above 80%', students: 4 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#4f46e5" radius={[4, 4, 0, 0]} label={{ position: 'top' }}>
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#6366f1" />
                      <Cell fill="#10b981" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hardest Questions by accuracy */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xxs lg:col-span-2">
              <h3 className="font-bold text-xs text-slate-800 mb-4 uppercase tracking-wider">Common MCQ Error Analysis & Hardest Topics</h3>
              <div className="space-y-3.5">
                {[
                  { topic: 'Thermodynamics Carnot Efficiency', incorrectPercent: 78, desc: 'Common confusion with absolute Celsius vs Kelvin scale conversion.', severity: 'High' },
                  { topic: 'Kinematics Rate of Displacement Vector', incorrectPercent: 45, desc: 'Misinterpreting distance speed scalar as velocity rate.', severity: 'Medium' },
                  { topic: 'Calculus Limit proofs using squeeze theorem', incorrectPercent: 32, desc: 'Inability to formulate formal geometric inequality structures.', severity: 'Low' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex justify-between items-center text-left">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{item.topic}</h4>
                      <p className="text-xxs text-slate-450 mt-1 leading-relaxed font-semibold">{item.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-rose-600">{item.incorrectPercent}% Errors</span>
                      <span className={`block text-[8px] font-black uppercase mt-1 px-1.5 py-0.5 rounded text-center ${
                        item.severity === 'High' ? 'bg-rose-100 text-rose-700' :
                        item.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {item.severity} Warning
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="h-6 w-6" />
              <h3 className="text-base font-black">Confirm Deletion</h3>
            </div>
            
            <p className="text-xs text-slate-550 font-semibold leading-relaxed">
              {deleteConfirmation.type === 'bulk-demo' 
                ? "Are you sure you want to delete all demo examination and student submission records? This action is irreversible."
                : "Are you sure you want to delete this examination record? This will permanently remove the exam from the ledger."
              }
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation({ isOpen: false, type: 'single-online' })}
                className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmation.type === 'bulk-demo') {
                    handleDeleteAllDemoData();
                  } else {
                    const isOnline = deleteConfirmation.type === 'single-online';
                    if (deleteConfirmation.targetId) {
                      handleDeleteExam(deleteConfirmation.targetId, isOnline);
                    }
                    setDeleteConfirmation({ isOpen: false, type: 'single-online' });
                  }
                }}
                className="px-4 py-2 bg-rose-650 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
