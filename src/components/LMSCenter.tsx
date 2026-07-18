import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, CheckCircle, Video, Download, Plus, Sparkles, BrainCircuit, Play, ArrowRight, User, Clock, Calendar, Award, RefreshCw, Sparkle, BarChart2, Search, Filter, Folder, Pin, Heart, Eye, ArrowUpRight, History, Trash2, Edit3, Settings, Shield, UserCheck, Lock, Unlock, FileDown, Archive, ChevronDown, ChevronUp, Info, MessageSquare, Send, Trophy, HelpCircle, Lightbulb } from 'lucide-react';
import { Material, Quiz, Batch, Grade, UserRole, Course, CourseChapter, LibraryBook, LibraryResourceType } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import DigitalLibrary from './DigitalLibrary';
import { libraryService } from '../services/libraryService';
import { studentService } from '../services/studentService';
import { geminiService } from '../services/geminiService';

interface LMSCenterProps {
  currentRole: UserRole;
  materials: Material[];
  quizzes: Quiz[];
  batches: Batch[];
  grades: Grade[];
  studentId: string;
  studentBatchId?: string;
  onAddMaterial: (material: Omit<Material, 'id' | 'createdAt'>) => Promise<void>;
  onStartQuiz: (quiz: Quiz) => void;
  onOpenAiQuizForm: () => void;
  courses?: Course[];
  onUpdateCourse?: (id: string, updatedCourse: Partial<Course>) => Promise<void>;
}

export default function LMSCenter({
  currentRole,
  materials,
  quizzes,
  batches,
  grades,
  studentId,
  studentBatchId,
  onAddMaterial,
  onStartQuiz,
  onOpenAiQuizForm,
  courses,
  onUpdateCourse,
}: LMSCenterProps) {
  const [activeTab, setActiveTab] = useState<'materials' | 'quizzes' | 'syllabus' | 'digital-library' | 'assignments' | 'forums' | 'planner' | 'certificates' | 'question-bank'>('materials');
  const [filterBatch, setFilterBatch] = useState<string>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('default');

  // --- DISCUSSION FORUM STATES ---
  const [forumThreads, setForumThreads] = useState<any[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('nep_lms_forum_threads');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [
      {
        id: 'thread-1',
        title: 'Doubt on Wave Mechanics - Path Difference vs Phase Difference',
        category: 'Physics',
        authorName: 'Aarav Mehta',
        authorRole: 'student',
        content: 'Hi all, when calculating constructive interference, why is path difference defined as an integral multiple of wavelength, while phase difference is an even multiple of pi? How do we mathematically convert one to the other?',
        likes: 12,
        likedBy: [],
        replies: [
          {
            id: 'reply-1-1',
            authorName: 'Dr. Ramesh Kumar (HOD Physics)',
            authorRole: 'teacher',
            content: 'Great question, Aarav! The relationship is Phase Difference = (2 * pi / Wavelength) * Path Difference. Thus, if Path Difference = n * Wavelength, then Phase Difference = (2 * pi / Wavelength) * (n * Wavelength) = 2 * n * pi. This is why you get even multiples of pi for constructive interference!',
            likes: 8,
            isBestAnswer: true,
            createdAt: '2026-07-06T10:15:00Z'
          },
          {
            id: 'reply-1-2',
            authorName: 'Sneha Reddy',
            authorRole: 'student',
            content: 'This clear explanation cleared up my doubt as well. Thanks sir!',
            likes: 3,
            isBestAnswer: false,
            createdAt: '2026-07-06T11:20:00Z'
          }
        ],
        createdAt: '2026-07-06T09:00:00Z',
        isPinned: true
      },
      {
        id: 'thread-2',
        title: 'Balancing complex Red-ox Equations quickly - tips requested',
        category: 'Chemistry',
        authorName: 'Sneha Reddy',
        authorRole: 'student',
        content: 'Is it better to use the ion-electron method (half-reaction method) or the oxidation state change method for solving fast MCQ questions in JEE? Standard textbook steps take too much time.',
        likes: 7,
        likedBy: [],
        replies: [
          {
            id: 'reply-2-1',
            authorName: 'Prof. Neha Gupta',
            authorRole: 'teacher',
            content: 'In standard entrance exams, I highly recommend the ion-electron method in acidic/basic medium. With practice, you only write the key elements change. Let me upload a short PDF guide in the E-Library tomorrow containing balancing shortcuts!',
            likes: 5,
            isBestAnswer: true,
            createdAt: '2026-07-07T08:30:00Z'
          }
        ],
        createdAt: '2026-07-07T07:15:00Z'
      },
      {
        id: 'thread-3',
        title: 'JEE Mains Math: Best resources for Definite Integration bounds shift',
        category: 'Mathematics',
        authorName: 'Kabir Dev',
        authorRole: 'student',
        content: 'Does anyone have a list of properties of Definite Integration that are most frequently tested? Specifically looking for King property applications.',
        likes: 5,
        likedBy: [],
        replies: [],
        createdAt: '2026-07-07T12:00:00Z'
      }
    ];
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState('Physics');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [forumSearch, setForumSearch] = useState('');
  const [forumCategoryFilter, setForumCategoryFilter] = useState('all');
  const [isAddingThread, setIsAddingThread] = useState(false);
  const [newReplyContent, setNewReplyContent] = useState('');

  // Save forum threads to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('nep_lms_forum_threads', JSON.stringify(forumThreads));
      }
    } catch {}
  }, [forumThreads]);

  // --- INTERACTIVE VIDEO PLAYER ---
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoPlayTime, setVideoPlayTime] = useState(0);

  // --- ASSIGNMENTS & HOMEWORK STATES ---
  const [assignments, setAssignments] = useState<any[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('nep_lms_assignments');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [
      {
        id: 'assign-1',
        title: 'Electrostatics Practice Worksheet #1',
        description: 'Complete problems 1 to 15 regarding Gauss Law, Flux, and Potential. PDF contains previous year JEE problems.',
        subject: 'Physics',
        dueDate: '2026-07-15',
        totalPoints: 100,
        batchId: 'all',
        fileUrl: 'https://example.com/materials/electrostatics_ws1.pdf',
        createdAt: '2026-07-07T10:00:00Z'
      },
      {
        id: 'assign-2',
        title: 'Chemical Kinetics Assignment 2',
        description: 'Solve first-order reaction differential rate laws. Show step-by-step mathematical integration calculations.',
        subject: 'Chemistry',
        dueDate: '2026-07-18',
        totalPoints: 50,
        batchId: 'all',
        fileUrl: 'https://example.com/materials/kinetics_as2.pdf',
        createdAt: '2026-07-07T11:30:00Z'
      }
    ];
  });

  const [submissions, setSubmissions] = useState<any[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('nep_lms_submissions');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [
      {
        id: 'sub-1',
        assignmentId: 'assign-1',
        studentId: 'student-2',
        studentName: 'Aarav Mehta',
        fileName: 'Electrostatics_Aarav_Mehta.pdf',
        submittedAt: '2026-07-08T14:30:00Z',
        grade: '95/100',
        feedback: 'Excellent work! GAUSS law calculations are perfect. Watch out for units in question 12.',
        status: 'Graded'
      }
    ];
  });

  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignDesc, setNewAssignDesc] = useState('');
  const [newAssignSubject, setNewAssignSubject] = useState('Physics');
  const [newAssignClass, setNewAssignClass] = useState('Class 12');
  const [newAssignDueDate, setNewAssignDueDate] = useState('');
  const [newAssignPoints, setNewAssignPoints] = useState(100);
  const [newAssignBatch, setNewAssignBatch] = useState('all');
  const [isAddingAssign, setIsAddingAssign] = useState(false);
  
  const [selectedAssignForSubmit, setSelectedAssignForSubmit] = useState<any | null>(null);
  const [submitFileName, setSubmitFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Sync to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('nep_lms_assignments', JSON.stringify(assignments));
      }
    } catch {}
  }, [assignments]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('nep_lms_submissions', JSON.stringify(submissions));
      }
    } catch {}
  }, [submissions]);

  // --- AI STUDY PLANNER STATES ---
  const [examTarget, setExamTarget] = useState('JEE Main 2027');
  const [weakAreas, setWeakAreas] = useState('Thermodynamics, Definite Integration');
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(5);
  const [studyPlan, setStudyPlan] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(`study_plan_${studentId}`);
        if (saved) return saved;
      }
    } catch {}
    return '';
  });
  const [loadingStudyPlan, setLoadingStudyPlan] = useState(false);

  // --- QUESTION BANK STATES ---
  const [qBankSearch, setQBankSearch] = useState('');
  const [qBankSubjectFilter, setQBankSubjectFilter] = useState('all');
  const [qBankDifficultyFilter, setQBankDifficultyFilter] = useState('all');
  const [revealAnswerId, setRevealAnswerId] = useState<string | null>(null);
  const [revealHintId, setRevealHintId] = useState<string | null>(null);
  const [questionBankQuestions, setQuestionBankQuestions] = useState<any[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('nep_lms_qbank');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [
      {
        id: 'q-1',
        subject: 'Physics',
        topic: 'Electrostatics',
        difficulty: 'Hard',
        question: 'Three point charges +q, -2q, and +q are placed at points (x=0, y=a, z=0), (x=0, y=0, z=0), and (x=a, y=0, z=0) respectively. What is the magnitude of the electric dipole moment vector of this charge assembly?',
        options: [
          'q * a * sqrt(2)',
          'q * a',
          'q * a * sqrt(3)',
          '2 * q * a'
        ],
        correctOptionIndex: 0,
        hint: 'Break the charge -2q into two charges of -q and -q. This forms two separate dipoles along the x and y axes. Find their vector sum.',
        reasoning: 'The system can be considered as two electric dipoles. One is formed by the -q charge at the origin and +q charge at (0, a, 0), with a dipole moment of magnitude p1 = q*a pointing along the +y direction. The second dipole is formed by the second -q charge at the origin and the +q charge at (a, 0, 0), with a dipole moment of p2 = q*a pointing along the +x direction. Since the two dipole moments are orthogonal, their resultant dipole moment is: p = sqrt(p1^2 + p2^2) = sqrt((q*a)^2 + (q*a)^2) = q * a * sqrt(2).'
      },
      {
        id: 'q-2',
        subject: 'Chemistry',
        topic: 'Chemical Kinetics',
        difficulty: 'Medium',
        question: 'For a first-order reaction, if the concentration of the reactant decreases from 0.8 M to 0.2 M in 40 minutes, what is the half-life (t_1/2) of the reaction?',
        options: [
          '10 minutes',
          '20 minutes',
          '40 minutes',
          '30 minutes'
        ],
        correctOptionIndex: 1,
        hint: 'The concentration drops from 0.8 M to 0.4 M (first half-life) and then from 0.4 M to 0.2 M (second half-life). Look at the total number of half-lives that have elapsed.',
        reasoning: 'Since this is a first-order reaction, the time required for any fractional completion is independent of the initial concentration. The drop from 0.8 M to 0.2 M represents: 0.8 M -> (t_1/2) -> 0.4 M -> (t_1/2) -> 0.2 M. Therefore, exactly 2 half-lives have passed. The total time elapsed is 40 minutes, which means 2 * t_1/2 = 40 minutes => t_1/2 = 20 minutes.'
      },
      {
        id: 'q-3',
        subject: 'Mathematics',
        topic: 'Definite Integration',
        difficulty: 'Hard',
        question: 'Evaluate the definite integral: I = ∫ [from 0 to pi/2] (sin(x)^3) / (sin(x)^3 + cos(x)^3) dx.',
        options: [
          'pi',
          'pi/2',
          'pi/4',
          '0'
        ],
        correctOptionIndex: 2,
        hint: 'Use the King Property: ∫ [from a to b] f(x) dx = ∫ [from a to b] f(a + b - x) dx. Apply it to replace x with (pi/2 - x) and add both integrals.',
        reasoning: 'Using the property I = ∫[0 to pi/2] f(pi/2 - x) dx, we get: I = ∫[0 to pi/2] cos(x)^3 / (cos(x)^3 + sin(x)^3) dx. Adding both expressions: 2I = ∫[0 to pi/2] (sin(x)^3 + cos(x)^3) / (sin(x)^3 + cos(x)^3) dx = ∫[0 to pi/2] 1 dx = [x] from 0 to pi/2 = pi/2. Solving for I gives: I = pi/4.'
      }
    ];
  });

  const [newQSubject, setNewQSubject] = useState('Physics');
  const [newQTopic, setNewQTopic] = useState('');
  const [newQDiff, setNewQDiff] = useState('Medium');
  const [newQText, setNewQText] = useState('');
  const [newQOptA, setNewQOptA] = useState('');
  const [newQOptB, setNewQOptB] = useState('');
  const [newQOptC, setNewQOptC] = useState('');
  const [newQOptD, setNewQOptD] = useState('');
  const [newQCorrectIdx, setNewQCorrectIdx] = useState(0);
  const [newQHint, setNewQHint] = useState('');
  const [newQReason, setNewQReason] = useState('');
  const [isAddingQ, setIsAddingQ] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('nep_lms_qbank', JSON.stringify(questionBankQuestions));
      }
    } catch {}
  }, [questionBankQuestions]);

  // Digital Library / Learning Resources States
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  
  // Library searching and filtering
  const [bookSearch, setBookSearch] = useState('');
  const [bookSubjectFilter, setBookSubjectFilter] = useState('all');
  const [bookClassFilter, setBookClassFilter] = useState('all');
  const [bookCourseFilter, setBookCourseFilter] = useState('all');
  const [bookTypeFilter, setBookTypeFilter] = useState('all');
  const [bookSort, setBookSort] = useState<'latest' | 'downloads' | 'alpha'>('latest');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  
  // Favorites stored in localStorage
  const [favoriteBookIds, setFavoriteBookIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(`fav_books_${studentId}`);
        return saved ? JSON.parse(saved) : [];
      }
    } catch {}
    return [];
  });

  const toggleFavoriteBook = (id: string) => {
    setFavoriteBookIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(`fav_books_${studentId}`, JSON.stringify(next));
        }
      } catch {}
      return next;
    });
  };

  // Administration Modals & States
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [isEditingBook, setIsEditingBook] = useState<LibraryBook | null>(null);
  const [isReplacingBook, setIsReplacingBook] = useState<LibraryBook | null>(null);
  const [isPreviewingBook, setIsPreviewingBook] = useState<LibraryBook | null>(null);
  
  // Book Form states
  const [bookTitle, setBookTitle] = useState('');
  const [bookResourceType, setBookResourceType] = useState<LibraryResourceType>('E-Book');
  const [bookSubject, setBookSubject] = useState('');
  const [bookClassLevel, setBookClassLevel] = useState<'IX' | 'X' | 'XI' | 'XII' | 'All'>('All');
  const [bookCourse, setBookCourse] = useState<'Foundation' | 'NEET' | 'JEE' | 'Boards' | 'General'>('General');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookEdition, setBookEdition] = useState('');
  const [bookLanguage, setBookLanguage] = useState('English');
  const [bookDescription, setBookDescription] = useState('');
  const [bookKeywords, setBookKeywords] = useState('');
  const [bookCoverUrl, setBookCoverUrl] = useState('');
  const [bookFileUrl, setBookFileUrl] = useState('');
  const [bookFileType, setBookFileType] = useState('pdf');
  const [bookFileSize, setBookFileSize] = useState('5.0 MB');
  const [bookAccessLevel, setBookAccessLevel] = useState<'all' | 'class_ix' | 'class_x' | 'class_xi' | 'class_xii' | 'foundation' | 'neet' | 'jee' | 'batch' | 'individual'>('all');
  const [bookAllowedBatchIds, setBookAllowedBatchIds] = useState<string[]>([]);
  const [bookAllowedStudentIds, setBookAllowedStudentIds] = useState<string[]>([]);
  const [bookIsPinned, setBookIsPinned] = useState(false);
  const [bookIsFeatured, setBookIsFeatured] = useState(false);
  const [bookDownloadRestricted, setBookDownloadRestricted] = useState(false);
  const [bookPublishDate, setBookPublishDate] = useState('');
  const [bookExpiryDate, setBookExpiryDate] = useState('');
  
  // Replacer state
  const [replaceFileUrl, setReplaceFileUrl] = useState('');
  const [replaceFileSize, setReplaceFileSize] = useState('10.0 MB');
  const [replaceFileType, setReplaceFileType] = useState('pdf');
  const [replaceEdition, setReplaceEdition] = useState('');
  const [replaceNote, setReplaceNote] = useState('');

  // Loaded students list (for permissions dropdown)
  const [allStudents, setAllStudents] = useState<any[]>([]);
  
  useEffect(() => {
    fetchBooks();
    if (currentRole === 'admin' || currentRole === 'teacher') {
      fetchStudents();
    }
  }, []);

  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      const data = await libraryService.getBooks();
      setBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getStudents();
      setAllStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetBookForm = () => {
    setBookTitle('');
    setBookResourceType('E-Book');
    setBookSubject('');
    setBookClassLevel('All');
    setBookCourse('General');
    setBookAuthor('');
    setBookPublisher('');
    setBookEdition('');
    setBookLanguage('English');
    setBookDescription('');
    setBookKeywords('');
    setBookCoverUrl('');
    setBookFileUrl('');
    setBookFileType('pdf');
    setBookFileSize('5.0 MB');
    setBookAccessLevel('all');
    setBookAllowedBatchIds([]);
    setBookAllowedStudentIds([]);
    setBookIsPinned(false);
    setBookIsFeatured(false);
    setBookDownloadRestricted(false);
    setBookPublishDate('');
    setBookExpiryDate('');
  };

  const populateBookForm = (book: LibraryBook) => {
    setBookTitle(book.title);
    setBookResourceType(book.resourceType);
    setBookSubject(book.subject);
    setBookClassLevel(book.classLevel);
    setBookCourse(book.course);
    setBookAuthor(book.author);
    setBookPublisher(book.publisher);
    setBookEdition(book.edition);
    setBookLanguage(book.language);
    setBookDescription(book.description);
    setBookKeywords(book.keywords.join(', '));
    setBookCoverUrl(book.coverUrl || '');
    setBookFileUrl(book.fileUrl);
    setBookFileType(book.fileType);
    setBookFileSize(book.fileSize);
    setBookAccessLevel(book.accessLevel);
    setBookAllowedBatchIds(book.allowedBatchIds || []);
    setBookAllowedStudentIds(book.allowedStudentIds || []);
    setBookIsPinned(!!book.isPinned);
    setBookIsFeatured(!!book.isFeatured);
    setBookDownloadRestricted(!!book.downloadRestricted);
    setBookPublishDate(book.publishDate || '');
    setBookExpiryDate(book.expiryDate || '');
  };

  const getEligibleStudentCount = (
    access: string,
    batchesList: string[],
    studentsList: string[],
    classLvl: string,
    crs: string
  ) => {
    if (access === 'all') return 'all (Entire Institution)';
    if (access === 'batch') return `${batchesList.length} batches`;
    if (access === 'individual') return `${studentsList.length} students`;
    if (access.startsWith('class_')) return `Class ${access.split('_')[1].toUpperCase()} students`;
    return `all ${crs} students`;
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: bookTitle,
      resourceType: bookResourceType,
      subject: bookSubject || "General",
      classLevel: bookClassLevel,
      course: bookCourse,
      author: bookAuthor || "Unknown",
      publisher: bookPublisher || "Unknown",
      edition: bookEdition || "1st Edition",
      language: bookLanguage,
      description: bookDescription,
      keywords: bookKeywords.split(',').map(x => x.trim()).filter(Boolean),
      coverUrl: bookCoverUrl || undefined,
      fileUrl: bookFileUrl || 'https://example.com/books/sample.pdf',
      fileType: bookFileType,
      fileSize: bookFileSize,
      accessLevel: bookAccessLevel,
      allowedBatchIds: bookAllowedBatchIds,
      allowedStudentIds: bookAllowedStudentIds,
      isPinned: bookIsPinned,
      isFeatured: bookIsFeatured,
      downloadRestricted: bookDownloadRestricted,
      publishDate: bookPublishDate,
      expiryDate: bookExpiryDate
    };

    try {
      await libraryService.createBook(payload as any);
      showLmsToast("Material Uploaded", `"${bookTitle}" has been added to the library.`);
      setIsAddingBook(false);
      resetBookForm();
      fetchBooks();
      
      const recipientCount = getEligibleStudentCount(bookAccessLevel, bookAllowedBatchIds, bookAllowedStudentIds, bookClassLevel, bookCourse);
      showLmsToast("Broadcast Complete", `In-app alerts sent to matching ${recipientCount}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingBook) return;

    const payload = {
      title: bookTitle,
      resourceType: bookResourceType,
      subject: bookSubject || "General",
      classLevel: bookClassLevel,
      course: bookCourse,
      author: bookAuthor || "Unknown",
      publisher: bookPublisher || "Unknown",
      edition: bookEdition || "1st Edition",
      language: bookLanguage,
      description: bookDescription,
      keywords: bookKeywords.split(',').map(x => x.trim()).filter(Boolean),
      coverUrl: bookCoverUrl || undefined,
      fileUrl: bookFileUrl,
      fileType: bookFileType,
      fileSize: bookFileSize,
      accessLevel: bookAccessLevel,
      allowedBatchIds: bookAllowedBatchIds,
      allowedStudentIds: bookAllowedStudentIds,
      isPinned: bookIsPinned,
      isFeatured: bookIsFeatured,
      downloadRestricted: bookDownloadRestricted,
      publishDate: bookPublishDate,
      expiryDate: bookExpiryDate
    };

    try {
      await libraryService.updateBook(isEditingBook.id, payload as any);
      showLmsToast("Book Updated", `"${bookTitle}" details have been updated successfully.`);
      setIsEditingBook(null);
      resetBookForm();
      fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplaceBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReplacingBook) return;
    
    try {
      await libraryService.replaceBook(isReplacingBook.id, {
        fileUrl: replaceFileUrl || 'https://example.com/books/sample-v2.pdf',
        fileSize: replaceFileSize,
        fileType: replaceFileType,
        edition: replaceEdition || `${isReplacingBook.edition} (revised)`,
        updateNote: replaceNote || "Updated to newer version"
      } as any);
      showLmsToast("Edition Upgraded", `"${isReplacingBook.title}" updated successfully. Download history preserved!`);
      setIsReplacingBook(null);
      setReplaceFileUrl('');
      setReplaceNote('');
      fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this material?")) return;
    try {
      await libraryService.deleteBook(id);
      showLmsToast("Material Deleted", "Study material has been removed from the library.");
      fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleArchiveBook = async (book: LibraryBook) => {
    const nextStatus = !book.isArchived;
    try {
      await libraryService.updateBook(book.id, { isArchived: nextStatus });
      showLmsToast(
        nextStatus ? "Material Archived" : "Material Restored",
        nextStatus ? `"${book.title}" is archived. Students won't see it.` : `"${book.title}" is now active.`
      );
      fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadBook = async (book: LibraryBook) => {
    if (book.downloadRestricted && currentRole === 'student') {
      showLmsToast("Download Restricted", "This material is marked as restricted. You can preview it online, but download is disabled by the administrator.");
      return;
    }
    
    try {
      const activeStudent = allStudents.find(s => s.id === studentId);
      const studentName = activeStudent ? activeStudent.name : (currentRole === 'student' ? 'Active Student' : 'Teacher/Admin');
      await libraryService.downloadBook(book.id, {
        studentId: studentId,
        studentName: studentName
      });
      showLmsToast("Download Initiated", `"${book.title}" download has been logged successfully.`);
      fetchBooks();
      window.open(book.fileUrl, '_blank');
    } catch (err) {
      console.error('Error recording download:', err);
    }
  };

  const checkStudentAccess = (book: LibraryBook) => {
    if (currentRole !== 'student') return true; 
    if (book.isArchived) return false;

    // Check publication date scheduler
    const today = new Date().toISOString().split('T')[0];
    if (book.publishDate && book.publishDate > today) return false;
    if (book.expiryDate && book.expiryDate < today) return false;

    if (book.accessLevel === 'all') return true;
    
    if (book.accessLevel === 'individual') {
      return !!book.allowedStudentIds?.includes(studentId);
    }
    
    const currentStudentBatchId = studentBatchId || '';
    if (book.accessLevel === 'batch') {
      return !!book.allowedBatchIds?.includes(currentStudentBatchId);
    }

    // Lookup student's batch and course for matching
    const studentBatch = batches.find(b => b.id === currentStudentBatchId);
    const studentCourse = courses?.find(c => c.id === studentBatch?.courseId);
    
    const batchNameLower = (studentBatch?.name || '').toLowerCase();
    const courseNameLower = (studentCourse?.name || '').toLowerCase();
    
    if (book.accessLevel === 'class_ix') {
      return batchNameLower.includes('ix') || batchNameLower.includes('9') || courseNameLower.includes('ix') || courseNameLower.includes('9');
    }
    if (book.accessLevel === 'class_x') {
      return batchNameLower.includes(' x') || batchNameLower.includes('10') || batchNameLower.includes('-x') || courseNameLower.includes(' x') || courseNameLower.includes('10') || courseNameLower.includes('-x');
    }
    if (book.accessLevel === 'class_xi') {
      return batchNameLower.includes('xi') || batchNameLower.includes('11') || courseNameLower.includes('xi') || courseNameLower.includes('11');
    }
    if (book.accessLevel === 'class_xii') {
      return batchNameLower.includes('xii') || batchNameLower.includes('12') || courseNameLower.includes('xii') || courseNameLower.includes('12');
    }
    if (book.accessLevel === 'neet') {
      return batchNameLower.includes('neet') || courseNameLower.includes('neet');
    }
    if (book.accessLevel === 'jee') {
      return batchNameLower.includes('jee') || courseNameLower.includes('jee');
    }
    if (book.accessLevel === 'foundation') {
      return batchNameLower.includes('foundation') || courseNameLower.includes('foundation');
    }
    
    return true;
  };

  // Searching and filtering
  const filteredBooks = books.filter(book => {
    if (!checkStudentAccess(book)) return false;

    // Folder selection (Resource Type filter)
    if (activeFolder !== 'all') {
      if (activeFolder === 'ebook' && book.resourceType !== 'E-Book') return false;
      if (activeFolder === 'notes' && book.resourceType !== 'PDF Notes') return false;
      if (activeFolder === 'video' && book.resourceType !== 'Video Lecture') return false;
      if (activeFolder === 'assignment' && book.resourceType !== 'Assignment') return false;
      if (activeFolder === 'pyq' && book.resourceType !== 'Previous Year Paper') return false;
      if (activeFolder === 'sample' && book.resourceType !== 'Sample Paper') return false;
      if (activeFolder === 'worksheet' && book.resourceType !== 'Practice Worksheet') return false;
    }

    // Dropdown filters
    if (bookSubjectFilter !== 'all' && book.subject !== bookSubjectFilter) return false;
    if (bookClassFilter !== 'all' && book.classLevel !== bookClassFilter) return false;
    if (bookCourseFilter !== 'all' && book.course !== bookCourseFilter) return false;
    if (bookTypeFilter !== 'all' && book.resourceType !== bookTypeFilter) return false;

    // Search bar
    if (bookSearch.trim() !== '') {
      const s = bookSearch.toLowerCase();
      const matchTitle = book.title.toLowerCase().includes(s);
      const matchAuthor = book.author.toLowerCase().includes(s);
      const matchSubject = book.subject.toLowerCase().includes(s);
      const matchDesc = book.description.toLowerCase().includes(s);
      const matchKeywords = book.keywords.some(k => k.toLowerCase().includes(s));
      if (!matchTitle && !matchAuthor && !matchSubject && !matchDesc && !matchKeywords) return false;
    }

    return true;
  });

  // Sort Books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (bookSort === 'downloads') {
      return (b.downloadCount || 0) - (a.downloadCount || 0);
    }
    if (bookSort === 'alpha') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
  });

  // Analytics Calculations
  const totalBooksCount = books.length;
  const totalDownloadsCount = books.reduce((sum, b) => sum + (b.downloadCount || 0), 0);
  const pinnedBooksCount = books.filter(b => b.isPinned).length;
  const archivedBooksCount = books.filter(b => b.isArchived).length;
  
  const subjectDownloadsData = Object.entries(
    books.reduce((acc, b) => {
      acc[b.subject] = (acc[b.subject] || 0) + (b.downloadCount || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, downloads]) => ({ name, downloads }));

  const allDownloadLogs = books.flatMap(book => 
    (book.downloadHistory || []).map(h => ({
      bookId: book.id,
      bookTitle: book.title,
      ...h
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Subject options
  const distinctSubjects = Array.from(new Set(books.map(b => b.subject))).filter(Boolean);
  
  // Load syllabusChapters from localStorage or use default
  const [syllabusChapters, setSyllabusChapters] = useState<any[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('nep_syllabus_chapters');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [
      { id: 'smart-ch-0-default', chapter: 'Electrostatics', standardPeriods: 24, assignedPeriods: 24, completedPeriods: 24 },
      { id: 'smart-ch-1-default', chapter: 'Current Electricity', standardPeriods: 18, assignedPeriods: 18, completedPeriods: 10 },
      { id: 'smart-ch-2-default', chapter: 'Electromagnetic Induction & AC', standardPeriods: 22, assignedPeriods: 22, completedPeriods: 0 },
      { id: 'smart-ch-3-default', chapter: 'Optics & Light', standardPeriods: 20, assignedPeriods: 20, completedPeriods: 0 },
      { id: 'smart-ch-4-default', chapter: 'Modern Physics', standardPeriods: 20, assignedPeriods: 20, completedPeriods: 0 },
    ];
  });

  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const showLmsToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const updateSyllabus = (updated: any[]) => {
    setSyllabusChapters(updated);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('nep_syllabus_chapters', JSON.stringify(updated));
      }
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'syllabus') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const saved = window.localStorage.getItem('nep_syllabus_chapters');
          if (saved) {
            setSyllabusChapters(JSON.parse(saved));
          }
        }
      } catch {}
    }
  }, [activeTab]);
  
  // Track completed materials for student progress
  const [completedMaterialIds, setCompletedMaterialIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(`completed_materials_${studentId}`);
        return saved ? JSON.parse(saved) : [];
      }
    } catch (err) {
      console.warn('localStorage is not accessible in this environment:', err);
    }
    return [];
  });

  const toggleMaterialCompletion = (materialId: string) => {
    setCompletedMaterialIds((prev) => {
      const next = prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(`completed_materials_${studentId}`, JSON.stringify(next));
        }
      } catch (err) {
        console.warn('Error saving completion status to localStorage:', err);
      }
      return next;
    });
  };
  
  // Create material states
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'Notes' | 'Syllabus' | 'Homework' | 'Video'>('Notes');
  const [batchId, setBatchId] = useState('all');
  const [linkUrl, setLinkUrl] = useState('');

  const filteredMaterials = materials.filter((m) => {
    return filterBatch === 'all' || m.batchId === 'all' || m.batchId === filterBatch;
  });

  const filteredQuizzes = quizzes.filter((q) => {
    return filterBatch === 'all' || q.batchId === filterBatch;
  });

  const getBatchName = (id: string) => {
    if (id === 'all') return 'All Batches';
    const b = batches.find((batch) => batch.id === id);
    return b ? b.name : 'All Batches';
  };

  const getQuizGrade = (quizId: string) => {
    const grade = grades.find((g) => g.quizId === quizId && g.studentId === studentId);
    return grade ? `${grade.score}/${grade.totalQuestions}` : null;
  };

  const submitMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await onAddMaterial({
      title,
      description,
      type,
      batchId,
      linkUrl: linkUrl || 'https://example.com/resources/document.pdf',
    });
    setIsAddingMaterial(false);
    setTitle('');
    setDescription('');
    setLinkUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Top filter and switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-200 gap-4 shadow-xxs">
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl flex-wrap w-full">
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'materials' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Study Materials ({filteredMaterials.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'assignments' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Assignments Hub ({assignments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'quizzes' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quizzes & Exams ({filteredQuizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('question-bank')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'question-bank' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Question Bank</span>
          </button>
          <button
            onClick={() => setActiveTab('forums')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'forums' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Discussion Forums</span>
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'planner' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
            <span>AI Planner & Progress</span>
          </button>
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'syllabus' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Syllabus Tracker ({syllabusChapters.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('digital-library')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'digital-library' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Digital Library ({books.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'certificates' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Certificates</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full justify-between bg-white/50 p-3 rounded-2xl border border-slate-150">
        <div className="text-xxs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span>Current Space:</span>
          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md font-extrabold">{activeTab.toUpperCase().replace('-', ' ')}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {['materials', 'quizzes', 'assignments', 'syllabus'].includes(activeTab) && (
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium"
            >
              <option value="all">Filter Batch: All</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {currentRole !== 'student' && activeTab === 'materials' && (
            <button
              onClick={() => setIsAddingMaterial(!isAddingMaterial)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" /> Upload Material
            </button>
          )}

          {currentRole !== 'student' && activeTab === 'quizzes' && (
            <button
              onClick={onOpenAiQuizForm}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-100"
            >
              <BrainCircuit className="h-4 w-4 text-amber-300" />
              <span>AI Quiz Generator</span>
              <Sparkles className="h-3 w-3 text-amber-200 animate-pulse" />
            </button>
          )}

          {/* Digital library upload button removed - handled by DigitalLibrary component */}
        </div>
      </div>

      {/* Add Study Material Form */}
      {isAddingMaterial && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 animate-in slide-in-from-top-4 duration-200">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Plus className="h-4 w-4 text-indigo-600" /> Upload Learning Resource
          </h4>
          <form onSubmit={submitMaterial} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Resource Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Newton's Laws Summary Sheet"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Brief Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Core concepts with solved exemplars..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Resource Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
              >
                <option value="Notes">Notes / PDFs</option>
                <option value="Syllabus">Syllabus Tracker</option>
                <option value="Homework">Homework Sheet</option>
                <option value="Video">Video Lecture</option>
              </select>
            </div>
            <div>
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Batch Access</label>
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
              >
                <option value="all">All Batches (Public)</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Document Link / URL</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/resources/document.pdf"
                  className="w-full flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shrink-0"
                >
                  Publish Resource
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Materials List View */}
      {activeTab === 'materials' && (() => {
        const effectiveBatchId = studentBatchId || 'all';
        const assignedMaterials = materials.filter((m) => {
          return m.batchId === 'all' || m.batchId === effectiveBatchId;
        });

        const totalAssigned = assignedMaterials.length;
        const completedAssigned = assignedMaterials.filter((m) => completedMaterialIds.includes(m.id)).length;
        const completionPercentage = totalAssigned > 0 ? Math.round((completedAssigned / totalAssigned) * 100) : 0;

        // Breakdown by type
        const typeStats = ['Notes', 'Homework', 'Video', 'Syllabus'].map((t) => {
          const materialsOfType = assignedMaterials.filter((m) => m.type === t);
          const completedOfType = materialsOfType.filter((m) => completedMaterialIds.includes(m.id)).length;
          return {
            type: t,
            completed: completedOfType,
            total: materialsOfType.length,
          };
        });

        return (
          <div className="space-y-6">
            {/* Student LMS Progress Bar Widget */}
            {currentRole === 'student' && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xxs animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
                      <span>Study Materials Progress</span>
                    </h3>
                    <p className="text-xxs text-slate-400 font-medium">
                      Monitor completion of assigned course materials for your current batch. Click the checkmark on any resource to mark it as read or done!
                    </p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-3 py-1.5 rounded-xl">
                      {completedAssigned} of {totalAssigned} completed ({completionPercentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden shadow-inner p-0.5">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[10px] font-black text-slate-400">
                    <span>0% Started</span>
                    <span className="text-slate-600 font-extrabold">{completionPercentage}% Completed</span>
                    <span>100% Mastered</span>
                  </div>
                </div>

                {/* Subcategories Breakdown Pills */}
                {totalAssigned > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-200/50">
                    {typeStats.map((stat) => {
                      const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
                      return (
                        <div key={stat.type} className="bg-white border border-slate-150 p-3 rounded-2xl text-center space-y-1.5 shadow-3xs">
                          <span className="text-xxs font-black text-slate-400 uppercase tracking-wider">{stat.type}</span>
                          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-700">
                            <span>{stat.completed}</span>
                            <span className="text-slate-300">/</span>
                            <span>{stat.total}</span>
                          </div>
                          {/* Micro bar */}
                          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Materials List Card Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xxs overflow-hidden">
              {filteredMaterials.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <FileText className="h-10 w-10 mx-auto opacity-35 mb-2" />
                  <p className="text-xs font-semibold">No learning materials found for this selection.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredMaterials.map((material) => {
                    const isCompleted = completedMaterialIds.includes(material.id);
                    return (
                      <div 
                        key={material.id} 
                        className={`p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/40 transition-colors ${
                          isCompleted ? 'bg-slate-50/20' : ''
                        }`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className={`p-2.5 rounded-xl transition-all ${
                            isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            material.type === 'Notes' ? 'bg-indigo-50 text-indigo-600' :
                            material.type === 'Homework' ? 'bg-amber-50 text-amber-600' :
                            material.type === 'Video' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {material.type === 'Video' ? <Video className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex flex-wrap items-center gap-2">
                              <span className={isCompleted ? 'line-through text-slate-400 font-medium' : ''}>
                                {material.title}
                              </span>
                              {isCompleted && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded-md animate-pulse">
                                  Done
                                </span>
                              )}
                            </h4>
                            <p className="text-xxs font-medium text-slate-400 mt-0.5">{material.description}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 rounded-full text-xxs font-bold bg-slate-100 text-slate-500 border border-slate-200/50">
                                {material.type}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xxs font-bold bg-indigo-50/50 text-indigo-600">
                                {getBatchName(material.batchId)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 self-end sm:self-auto w-full sm:w-auto justify-end">
                          {/* Circle check for completion (only for student portal) */}
                          {currentRole === 'student' && (
                            <button
                              onClick={() => toggleMaterialCompletion(material.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xxs font-black border transition-all cursor-pointer ${
                                isCompleted
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                              }`}
                              title={isCompleted ? "Mark incomplete" : "Mark as completed"}
                            >
                              <CheckCircle className={`h-4 w-4 ${isCompleted ? 'fill-emerald-600 text-white' : 'text-slate-400'}`} />
                              <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                            </button>
                          )}

                          <a
                            href={material.linkUrl}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-bold px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Access Resource</span>
                          </a>
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

      {/* Online Quizzes List View */}
      {activeTab === 'quizzes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuizzes.length === 0 ? (
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <BrainCircuit className="h-10 w-10 mx-auto opacity-35 mb-2" />
              <p className="text-xs font-semibold">No quizzes currently scheduled for this selection.</p>
            </div>
          ) : (
            filteredQuizzes.map((quiz) => {
              const studentGrade = getQuizGrade(quiz.id);
              const isTaken = studentGrade !== null;

              return (
                <div key={quiz.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center font-bold text-xs shrink-0">
                        Q
                      </div>
                      <div className="flex gap-1.5 items-center">
                        {quiz.isAiGenerated && (
                          <span className="inline-flex items-center gap-0.5 text-xxs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            AI Gen
                          </span>
                        )}
                        <span className="text-xxs font-bold bg-slate-100 text-slate-500 border border-slate-200/50 px-2.5 py-0.5 rounded-full">
                          {quiz.durationMinutes} Mins
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm mt-4 tracking-tight leading-snug">{quiz.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xxs font-semibold px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200/50 rounded-md">
                        {quiz.subject}
                      </span>
                      <span className="text-xxs font-semibold px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200/50 rounded-md">
                        {getBatchName(quiz.batchId)}
                      </span>
                    </div>

                    <p className="text-xxs text-slate-400 mt-4 font-semibold">
                      Total Questions: <b>{quiz.questions.length}</b>
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {isTaken ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs font-bold">Passed: {studentGrade}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xxs font-semibold">Pending completion</span>
                    )}

                    {currentRole === 'student' ? (
                      isTaken ? (
                        <button disabled className="px-4 py-2 rounded-xl text-slate-300 bg-slate-50 border border-slate-200 text-xs font-bold cursor-not-allowed">
                          Completed
                        </button>
                      ) : (
                        <button
                          onClick={() => onStartQuiz(quiz)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-100 group"
                        >
                          <span>Take Test</span>
                          <Play className="h-3 w-3 fill-white group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => onStartQuiz(quiz)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl px-4 py-2 text-xs font-bold transition-all"
                      >
                        <span>Preview Questions ({quiz.questions.length})</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Planned Periods & NEP Syllabus Tracker View */}
      {activeTab === 'syllabus' && (() => {
        const isDefault = selectedCourseId === 'default';
        const activeCourse = (courses || []).find(c => c.id === selectedCourseId);
        
        const currentTrackChapters: any[] = isDefault 
          ? syllabusChapters 
          : (activeCourse?.chapters || []);

        const totalAssignedPeriods = currentTrackChapters.reduce((sum, ch) => sum + (Number(ch.assignedPeriods) || 0), 0);
        const totalCompletedPeriods = currentTrackChapters.reduce((sum, ch) => sum + (Number(ch.completedPeriods) || 0), 0);
        const overallProgressPercentage = totalAssignedPeriods > 0 
          ? Math.round((totalCompletedPeriods / totalAssignedPeriods) * 100) 
          : 0;

        const chartData = currentTrackChapters.map((ch, idx) => ({
          shortName: `Ch ${idx + 1}`,
          fullName: isDefault ? ch.chapter : ch.name,
          Target: Number(ch.assignedPeriods) || 0,
          Completed: Number(ch.completedPeriods) || 0,
        }));

        const handleUpdateCompletedPeriods = async (chapterId: string, nextCompleted: number) => {
          if (isDefault) {
            const updated = syllabusChapters.map(ch => 
              ch.id === chapterId ? { ...ch, completedPeriods: nextCompleted } : ch
            );
            updateSyllabus(updated);
          } else if (activeCourse && onUpdateCourse) {
            const updated = currentTrackChapters.map(ch => 
              ch.id === chapterId ? { ...ch, completedPeriods: nextCompleted } : ch
            );
            await onUpdateCourse(activeCourse.id, { chapters: updated });
            showLmsToast("Syllabus Logged", `Updated lecture progress for chapter.`);
          }
        };

        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Inline Toast Notification inside the component */}
            {toastMessage && (
              <div className="fixed top-5 right-5 z-[10000] bg-slate-900 text-white rounded-2xl px-4 py-3.5 shadow-xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <Sparkles className="h-5 w-5 text-amber-400 animate-pulse shrink-0" />
                <div>
                  <h5 className="text-xs font-black">{toastMessage.title}</h5>
                  <p className="text-[10px] text-slate-400 font-medium">{toastMessage.desc}</p>
                </div>
              </div>
            )}

            {/* Course Selector Dropdown Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-left">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Syllabus Active Track</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Select central standard or institutional course curriculum</p>
                </div>
              </div>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="default">📘 Standard NEP-2020 Physics XII (Default)</option>
                {(courses || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    🎓 {c.name} ({c.duration})
                  </option>
                ))}
              </select>
            </div>

            {/* Syllabus Performance Progress Gauge */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 text-white shadow-xl border border-indigo-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 text-left">
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full">
                  <Sparkle className="h-3 w-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                  {isDefault ? 'NEP-2020 Standard Track' : 'Course Curriculum Desk'}
                </span>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {isDefault ? 'Active Academic Course Syllabus' : activeCourse?.name}
                </h3>
                <p className="text-xxs text-indigo-200/80 max-w-xl font-medium leading-relaxed font-sans">
                  LMS Instructors can conduct lecture classes mapped to configured chapters. Period progress logging synchronizes instantly with the academic database logs.
                </p>
              </div>

              {/* Dynamic Overall Metric Rings */}
              <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl shrink-0 w-full md:w-auto">
                <div className="text-center md:text-left pr-4 md:border-r border-white/10">
                  <span className="block text-[9px] font-black text-indigo-300 uppercase tracking-wider">TOTAL PLANNED</span>
                  <span className="text-lg font-extrabold text-white">{totalAssignedPeriods} <span className="text-xs text-indigo-200">periods</span></span>
                </div>
                <div className="text-center md:text-left pr-4 md:border-r border-white/10">
                  <span className="block text-[9px] font-black text-indigo-300 uppercase tracking-wider">COMPLETED HOURS</span>
                  <span className="text-lg font-extrabold text-emerald-400">{totalCompletedPeriods} <span className="text-xs text-emerald-200">periods</span></span>
                </div>
                <div className="text-center md:text-left">
                  <span className="block text-[9px] font-black text-indigo-300 uppercase tracking-wider">COURSE COMPLETED</span>
                  <span className="text-lg font-extrabold text-amber-400">{overallProgressPercentage}%</span>
                </div>
              </div>
            </div>

            {/* Combined Overall Progress Indicator */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 text-left">
              <div className="text-xxs font-black text-slate-500 uppercase tracking-wider shrink-0">
                COURSE SYLLABUS PROGRESS:
              </div>
              <div className="flex-1 w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner p-0.5">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${overallProgressPercentage}%` }}
                />
              </div>
              <div className="text-xs font-black text-slate-700 shrink-0">
                {overallProgressPercentage}% Covered
              </div>
            </div>

            {/* Instructor Syllabus Analytics Chart */}
            {currentTrackChapters.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-center space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-left">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Instructor Syllabus Analytics Chart</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Visualizing lecture progress: Planned vs. Completed periods</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full shrink-0">
                    <BarChart2 className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                    <span>Live Lecture Burn-down</span>
                  </div>
                </div>

                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="shortName" 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', textAlign: 'left' }}
                        labelStyle={{ fontWeight: 'black', fontSize: '11px', color: '#38bdf8' }}
                        itemStyle={{ fontSize: '11px', padding: '1px 0' }}
                        formatter={(value: any, name: any, props: any) => {
                          return [`${value} periods`, name === 'Target' ? 'Planned Target' : 'Completed Lectures'];
                        }}
                        labelFormatter={(label) => {
                          const item = chartData.find(d => d.shortName === label);
                          return item ? `${item.shortName}: ${item.fullName}` : label;
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="Target" fill="#c7d2fe" radius={[4, 4, 0, 0]} name="Planned Target periods" barSize={24} />
                      <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed Lectures" barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* List of planned periods by chapters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {currentTrackChapters.length === 0 ? (
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-4">
                  <Calendar className="h-10 w-10 mx-auto opacity-35 animate-bounce text-indigo-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">No chapters configured for this course yet.</p>
                    <p className="text-[10px] text-slate-400 max-w-sm mx-auto mt-1">
                      Configure custom syllabus chapters under the Admin "Course & Batch Manager" tab, or click the button below to pre-populate with default Physics chapters for testing.
                    </p>
                  </div>
                  {currentRole !== 'student' && onUpdateCourse && activeCourse && (
                    <button
                      type="button"
                      onClick={async () => {
                        const defaultChaptersList: CourseChapter[] = [
                          { id: 'ch-init-1', name: 'Electrostatics', assignedPeriods: 24, completedPeriods: 10 },
                          { id: 'ch-init-2', name: 'Current Electricity', assignedPeriods: 18, completedPeriods: 5 },
                          { id: 'ch-init-3', name: 'Electromagnetic Induction & AC', assignedPeriods: 22, completedPeriods: 0 },
                          { id: 'ch-init-4', name: 'Optics & Wave Light theory', assignedPeriods: 20, completedPeriods: 0 },
                          { id: 'ch-init-5', name: 'Modern & Quantum Physics', assignedPeriods: 20, completedPeriods: 0 },
                        ];
                        await onUpdateCourse(activeCourse.id, { chapters: defaultChaptersList });
                        showLmsToast("Chapters Initialized", "Loaded standard default chapters successfully.");
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Initialize Default Chapters</span>
                    </button>
                  )}
                </div>
              ) : (
                currentTrackChapters.map((chapterObj, idx) => {
                  const chName = isDefault ? chapterObj.chapter : chapterObj.name;
                  const assignedPeriods = Number(chapterObj.assignedPeriods) || 12;
                  const completedPeriods = Number(chapterObj.completedPeriods) || 0;
                  const itemProgress = assignedPeriods > 0 
                    ? Math.round((completedPeriods / assignedPeriods) * 100) 
                    : 0;

                  return (
                    <div 
                      key={chapterObj.id || idx} 
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-sm transition-all duration-150 text-left"
                    >
                      {/* Chapter Title Block */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-black">
                              Ch-{idx + 1}
                            </span>
                            {isDefault && chapterObj.standardPeriods > 0 && (
                              <span className="text-[9px] text-slate-400 font-semibold bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                                NEP Target: {chapterObj.standardPeriods} Periods
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                            {chName}
                          </h4>
                        </div>

                        {/* Progress Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                          itemProgress === 100 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse' 
                            : itemProgress > 0 
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                              : 'bg-slate-50 text-slate-500 border border-slate-200'
                        }`}>
                          {itemProgress === 100 ? 'Completed' : itemProgress > 0 ? 'Active' : 'Not Started'}
                        </span>
                      </div>

                      {/* Period Trackers */}
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-3">
                        <div className="flex justify-between items-center text-xxs font-bold text-slate-500">
                          <span>PLANNED DURATION:</span>
                          <span className="text-slate-800 font-extrabold">{assignedPeriods} Lectures / Periods</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xxs font-bold text-slate-500">
                          <span>COMPLETED LECTURES:</span>
                          <span className="text-emerald-600 font-extrabold">{completedPeriods} of {assignedPeriods} periods</span>
                        </div>

                        {/* Interactive Instructor controls */}
                        {currentRole !== 'student' && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide mr-auto">Instructor Log:</span>
                            <div className="flex items-center gap-1.5">
                              {/* Decrease Button */}
                              <button
                                type="button"
                                disabled={completedPeriods <= 0}
                                onClick={() => handleUpdateCompletedPeriods(chapterObj.id, Math.max(0, completedPeriods - 1))}
                                className="px-2.5 py-1 bg-white border border-slate-250 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-black rounded-lg cursor-pointer select-none transition-colors"
                              >
                                -
                              </button>
                              
                              <span className="w-8 text-center text-xs font-bold text-slate-700 font-mono">
                                {completedPeriods}
                              </span>

                              {/* Increase Button */}
                              <button
                                type="button"
                                disabled={completedPeriods >= assignedPeriods}
                                onClick={() => {
                                  const nextVal = Math.min(assignedPeriods, completedPeriods + 1);
                                  if (nextVal === assignedPeriods) {
                                    showLmsToast("Chapter Completed!", `"${chName}" is marked 100% complete.`);
                                  }
                                  handleUpdateCompletedPeriods(chapterObj.id, nextVal);
                                }}
                                className="px-2.5 py-1 bg-white border border-slate-250 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-black rounded-lg cursor-pointer select-none transition-colors"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={completedPeriods === assignedPeriods}
                              onClick={() => {
                                handleUpdateCompletedPeriods(chapterObj.id, assignedPeriods);
                                showLmsToast("Syllabus Completed!", `Chapter "${chName}" is marked as fully completed.`);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                            >
                              All Clear
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Chapter progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          <span>Chapter progress:</span>
                          <span className="text-indigo-600">{itemProgress}% covered</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                          <div 
                            className={`h-full rounded-full transition-all duration-350 ${
                              itemProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${itemProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Informational Notice footer */}
            <div className="bg-slate-50 border border-slate-250 rounded-2xl p-4 text-[11px] text-slate-500 leading-relaxed flex gap-3 text-left">
              <Clock className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black text-slate-700 mb-0.5">Syllabus Synchronization & Target Adherence Instructions:</strong>
                LMS instructors should refer to the planned target periods for each topic to stay fully synchronized with overall institution curriculum timelines. Please update course logs after completing every batch lecture session.
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4. Digital E-Book Library & Learning Resources */}
      {activeTab === 'digital-library' && (
        <DigitalLibrary
          currentRole={currentRole}
          studentId={studentId}
          studentBatchId={studentBatchId}
          batches={batches}
          courses={courses}
        />
      )}

      {/* 5. Assignments & Homework Portal */}
      {activeTab === 'assignments' && (() => {
        return (
          <div className="space-y-6 animate-in fade-in duration-200 text-slate-700">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-5 rounded-2xl border border-emerald-700 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-100 border border-emerald-400/20 rounded-full text-[9px] font-black uppercase tracking-wider">
                    Worksheets & Homework
                  </span>
                  <h3 className="text-lg font-bold mt-1.5 tracking-tight">LMS Assignments Portal</h3>
                  <p className="text-xxs text-emerald-100/95 mt-0.5 max-w-xl">
                    Submit homework sheets, retrieve class assignments, and receive detailed grading reviews from your course teachers.
                  </p>
                </div>
                {currentRole !== 'student' && (
                  <button
                    onClick={() => setIsAddingAssign(!isAddingAssign)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all shadow-xs"
                  >
                    <Plus className="h-4 w-4" /> Create Assignment
                  </button>
                )}
              </div>
            </div>

            {/* Create Assignment Form */}
            {isAddingAssign && currentRole !== 'student' && (
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-600" /> Draft New Assignment
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newAssignTitle || !newAssignDueDate) return;
                    const newAssign = {
                      id: `assign-${Date.now()}`,
                      title: newAssignTitle,
                      description: newAssignDesc,
                      subject: newAssignSubject,
                      classId: newAssignClass,
                      dueDate: newAssignDueDate,
                      totalPoints: Number(newAssignPoints) || 100,
                      batchId: newAssignBatch,
                      fileUrl: 'https://example.com/materials/curated_assignment_sheet.pdf',
                      createdAt: new Date().toISOString()
                    };
                    setAssignments(prev => [newAssign, ...prev]);
                    setIsAddingAssign(false);
                    setNewAssignTitle('');
                    setNewAssignDesc('');
                    setNewAssignDueDate('');
                    setNewAssignPoints(100);
                    setNewAssignBatch('all');
                    setNewAssignClass('Class 12');
                    showLmsToast("Assignment Published", `"${newAssign.title}" is now active.`);
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Subject</label>
                    <select
                      value={newAssignSubject}
                      onChange={(e) => setNewAssignSubject(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Target Class</label>
                    <select
                      value={newAssignClass}
                      onChange={(e) => setNewAssignClass(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    >
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                      <option value="all">All Classes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Target Batch</label>
                    <select
                      value={newAssignBatch}
                      onChange={(e) => setNewAssignBatch(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    >
                      <option value="all">All Batches</option>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Assignment Title</label>
                    <input
                      type="text"
                      required
                      value={newAssignTitle}
                      onChange={(e) => setNewAssignTitle(e.target.value)}
                      placeholder="e.g. Electrostatics Gauss Law Solved Set"
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Max Score Points</label>
                    <input
                      type="number"
                      value={newAssignPoints}
                      onChange={(e) => setNewAssignPoints(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newAssignDesc}
                      onChange={(e) => setNewAssignDesc(e.target.value)}
                      placeholder="Specify instructions and question sets to solve..."
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">PDF Document (Optional Upload)</label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="application/pdf"
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            showLmsToast("PDF Uploaded", `${file.name} uploaded successfully.`);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Deadline Date</label>
                    <input
                      type="date"
                      required
                      value={newAssignDueDate}
                      onChange={(e) => setNewAssignDueDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-xxs cursor-pointer"
                    >
                      Assign Homework
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Assignments List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: List of assignments */}
              <div className="lg:col-span-2 space-y-4">
                <span className="text-xxs font-black text-slate-400 uppercase tracking-wider block">Active Course Assignments</span>
                {assignments.length === 0 ? (
                  <div className="bg-white p-12 border border-slate-200 rounded-2xl text-center text-slate-400">
                    <FileDown className="h-8 w-8 mx-auto opacity-40 mb-2" />
                    <p className="text-xs">No active assignments listed at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map(a => {
                      const studentSub = submissions.find(s => s.assignmentId === a.id && s.studentId === studentId);
                      return (
                        <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-xs transition-shadow space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-bold uppercase tracking-wider">
                                {a.subject}
                              </span>
                              <h4 className="text-xs sm:text-sm font-black text-slate-800 mt-1">{a.title}</h4>
                              <p className="text-xxs text-slate-400 mt-0.5">{a.description}</p>
                            </div>
                            <div className="text-right text-xxs">
                              <span className="block font-bold text-slate-500">Max Points: {a.totalPoints}</span>
                              <span className="block font-black text-rose-500 mt-1">Due: {a.dueDate}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xxs">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={a.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-indigo-600 hover:underline font-bold"
                              >
                                <Download className="h-3.5 w-3.5" /> Download Sheet PDF
                              </a>
                            </div>

                            {currentRole === 'student' ? (
                              <div>
                                {studentSub ? (
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-md font-black uppercase text-[9px] ${
                                      studentSub.status === 'Graded' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-amber-50 text-amber-700 border border-amber-150'
                                    }`}>
                                      {studentSub.status}
                                    </span>
                                    {studentSub.grade && (
                                      <span className="font-extrabold text-slate-700">Score: <b className="text-indigo-600">{studentSub.grade}</b></span>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setSelectedAssignForSubmit(a)}
                                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xxs shadow-3xs"
                                  >
                                    Submit Solution
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-bold">
                                  Submissions: {submissions.filter(s => s.assignmentId === a.id).length}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Student view feedback if graded */}
                          {currentRole === 'student' && studentSub?.feedback && (
                            <div className="bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-xl text-xxs text-indigo-700 mt-2">
                              <strong>Teacher Feedback:</strong> "{studentSub.feedback}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Instructor Review Panel */}
              <div className="space-y-4">
                <span className="text-xxs font-black text-slate-400 uppercase tracking-wider block">
                  {currentRole === 'student' ? "Your Submission Stats" : "Submissions Grading Desk"}
                </span>

                {currentRole === 'student' ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center text-xs font-black text-slate-700">
                      <span>Total Tasks Assigned</span>
                      <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{assignments.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black text-slate-700">
                      <span>Tasks Submitted</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{submissions.filter(s => s.studentId === studentId).length}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black text-slate-700">
                      <span>Graded Feedback</span>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{submissions.filter(s => s.studentId === studentId && s.status === 'Graded').length}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    {submissions.length === 0 ? (
                      <p className="text-xxs text-slate-400 text-center py-6">No student submissions yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {submissions.map(sub => {
                          const assign = assignments.find(a => a.id === sub.assignmentId);
                          return (
                            <div key={sub.id} className="py-2.5 space-y-1.5 first:pt-0 last:pb-0">
                              <div className="flex justify-between items-start gap-1">
                                <div>
                                  <span className="text-[10px] font-black text-slate-800">{sub.studentName}</span>
                                  <p className="text-[9px] text-slate-400 truncate max-w-[150px]">{assign?.title || "Unknown Assignment"}</p>
                                </div>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                  sub.status === 'Graded' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                  {sub.status}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                                <span className="truncate max-w-[120px]">📄 {sub.fileName}</span>
                                <button
                                  onClick={() => {
                                    setGradingSubmission(sub);
                                    setGradeInput(sub.grade || '');
                                    setFeedbackInput(sub.feedback || '');
                                  }}
                                  className="text-indigo-600 hover:underline font-extrabold"
                                >
                                  {sub.status === 'Graded' ? "Re-grade" : "Evaluate"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* MODAL: Submit Solution homework */}
            {selectedAssignForSubmit && (
              <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className="bg-white rounded-2xl w-full max-w-md border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
                  <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider">Submit Solution Sheet</h4>
                    <button onClick={() => setSelectedAssignForSubmit(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
                  </div>
                  <div className="p-5 space-y-4 text-xs">
                    <p className="text-xxs font-semibold text-slate-400 uppercase tracking-wider">TARGET ASSIGNMENT</p>
                    <p className="font-bold text-slate-800 -mt-2">{selectedAssignForSubmit.title}</p>

                    {/* Drag & Drop simulated component */}
                    <div
                      onDragEnter={() => setDragActive(true)}
                      onDragLeave={() => setDragActive(false)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        if (e.dataTransfer.files?.[0]) {
                          setSubmitFileName(e.dataTransfer.files[0].name);
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        dragActive ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200 hover:border-slate-350'
                      }`}
                    >
                      <FileDown className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-600 text-xxs">Drag & drop your PDF file here, or click to browse</p>
                      <p className="text-[9px] text-slate-400 mt-1">Allowed formats: PDF, ZIP (Max 15MB)</p>
                      
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSubmitFileName(e.target.files[0].name);
                          }
                        }}
                        className="hidden"
                        id="assignment-file-browse"
                      />
                      <label
                        htmlFor="assignment-file-browse"
                        className="inline-block mt-3 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-lg text-xxs cursor-pointer"
                      >
                        Browse Files
                      </label>
                    </div>

                    {submitFileName && (
                      <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-xxs font-black text-emerald-800 truncate max-w-[250px]">📄 Selected: {submitFileName}</span>
                        <button onClick={() => setSubmitFileName('')} className="text-emerald-500 font-bold">✕</button>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 text-xxs pt-2">
                      <button
                        onClick={() => setSelectedAssignForSubmit(null)}
                        className="px-4 py-2 bg-slate-100 font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={!submitFileName}
                        onClick={() => {
                          const newSub = {
                            id: `sub-${Date.now()}`,
                            assignmentId: selectedAssignForSubmit.id,
                            studentId,
                            studentName: 'Aarav Mehta', // Demo static or prop student name
                            fileName: submitFileName,
                            submittedAt: new Date().toISOString(),
                            status: 'Pending'
                          };
                          setSubmissions(prev => [newSub, ...prev]);
                          setSelectedAssignForSubmit(null);
                          setSubmitFileName('');
                          showLmsToast("Solution Uploaded", "Your homework has been securely submitted for grading.");
                        }}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-45"
                      >
                        Submit Assignment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL: Evaluate / Grade submission */}
            {gradingSubmission && (
              <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className="bg-white rounded-2xl w-full max-w-md border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
                  <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider">Evaluate Submission</h4>
                    <button onClick={() => setGradingSubmission(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
                  </div>
                  <div className="p-5 space-y-4 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Student Name</p>
                      <p className="font-bold text-slate-800 text-sm">{gradingSubmission.studentName}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Submitted File</p>
                      <a href="#" className="font-extrabold text-indigo-600 hover:underline">📄 {gradingSubmission.fileName}</a>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Score Grade</label>
                        <input
                          type="text"
                          value={gradeInput}
                          onChange={(e) => setGradeInput(e.target.value)}
                          placeholder="e.g. 95/100, A+"
                          className="w-full px-3 py-2 border rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Teacher Feedback</label>
                      <textarea
                        rows={3}
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Write constructive notes and revision advice..."
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>

                    <div className="flex justify-end gap-2 text-xxs pt-2">
                      <button onClick={() => setGradingSubmission(null)} className="px-4 py-2 bg-slate-100 font-bold rounded-xl">Cancel</button>
                      <button
                        onClick={() => {
                          setSubmissions(prev => prev.map(s => {
                            if (s.id === gradingSubmission.id) {
                              return {
                                ...s,
                                grade: gradeInput,
                                feedback: feedbackInput,
                                status: 'Graded'
                              };
                            }
                            return s;
                          }));
                          setGradingSubmission(null);
                          showLmsToast("Grading Published", `Sent results to ${gradingSubmission.studentName}.`);
                        }}
                        className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                      >
                        Publish Grades
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 6. Question Bank */}
      {activeTab === 'question-bank' && (() => {
        const filteredQBank = questionBankQuestions.filter(q => {
          const matchSearch = q.question.toLowerCase().includes(qBankSearch.toLowerCase()) || q.topic.toLowerCase().includes(qBankSearch.toLowerCase());
          const matchSub = qBankSubjectFilter === 'all' || q.subject === qBankSubjectFilter;
          const matchDiff = qBankDifficultyFilter === 'all' || q.difficulty === qBankDifficultyFilter;
          return matchSearch && matchSub && matchDiff;
        });

        return (
          <div className="space-y-6 animate-in fade-in duration-200 text-slate-700">
            {/* Header banner */}
            <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 text-white p-5 rounded-2xl border border-indigo-950 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 rounded-full text-[9px] font-black uppercase tracking-wider">
                    Self-Study & Practice
                  </span>
                  <h3 className="text-lg font-bold mt-1.5 tracking-tight">Interactive Question Bank</h3>
                  <p className="text-xxs text-indigo-200/90 mt-0.5 max-w-xl">
                    Browse typical entrance-style Multiple Choice Questions. Take individual attempts, read instant step-by-step reasoning solutions, and view expert hints.
                  </p>
                </div>
                {currentRole !== 'student' && (
                  <button
                    onClick={() => setIsAddingQ(!isAddingQ)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all border border-indigo-400/30"
                  >
                    <Plus className="h-4 w-4" /> Add Question
                  </button>
                )}
              </div>
            </div>

            {/* Add Question Form */}
            {isAddingQ && currentRole !== 'student' && (
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-indigo-600" /> Insert Practice Problem
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newQText || !newQOptA || !newQOptB) return;
                    const newQ = {
                      id: `q-${Date.now()}`,
                      subject: newQSubject,
                      topic: newQTopic || 'General',
                      difficulty: newQDiff,
                      question: newQText,
                      options: [newQOptA, newQOptB, newQOptC || 'N/A', newQOptD || 'N/A'],
                      correctOptionIndex: Number(newQCorrectIdx),
                      hint: newQHint,
                      reasoning: newQReason
                    };
                    setQuestionBankQuestions(prev => [newQ, ...prev]);
                    setIsAddingQ(false);
                    setNewQTopic('');
                    setNewQText('');
                    setNewQOptA('');
                    setNewQOptB('');
                    setNewQOptC('');
                    setNewQOptD('');
                    setNewQCorrectIdx(0);
                    setNewQHint('');
                    setNewQReason('');
                    showLmsToast("Question Added", "The question has been published to the study question bank.");
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Subject</label>
                      <select value={newQSubject} onChange={(e) => setNewQSubject(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white">
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Biology">Biology</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Topic / Chapter Name</label>
                      <input type="text" value={newQTopic} onChange={(e) => setNewQTopic(e.target.value)} placeholder="e.g. Thermodynamics" className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white" />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Difficulty</label>
                      <select value={newQDiff} onChange={(e) => setNewQDiff(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Question Body Text</label>
                    <textarea rows={3} required value={newQText} onChange={(e) => setNewQText(e.target.value)} placeholder="Type standard multi-choice academic question..." className="w-full px-3 py-2 border rounded-xl text-xs bg-white" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Option A</label>
                      <input type="text" required value={newQOptA} onChange={(e) => setNewQOptA(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white" />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Option B</label>
                      <input type="text" required value={newQOptB} onChange={(e) => setNewQOptB(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white" />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Option C</label>
                      <input type="text" value={newQOptC} onChange={(e) => setNewQOptC(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white" />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Option D</label>
                      <input type="text" value={newQOptD} onChange={(e) => setNewQOptD(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Correct Choice</label>
                      <select value={newQCorrectIdx} onChange={(e) => setNewQCorrectIdx(Number(e.target.value))} className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white font-bold text-indigo-600">
                        <option value={0}>Option A</option>
                        <option value={1}>Option B</option>
                        <option value={2}>Option C</option>
                        <option value={3}>Option D</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs">
                        Publish Question
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Question Hint</label>
                      <input type="text" value={newQHint} onChange={(e) => setNewQHint(e.target.value)} placeholder="Helpful formula or theorem reminder..." className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white" />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Detailed Explanation & Reasoning</label>
                      <input type="text" value={newQReason} onChange={(e) => setNewQReason(e.target.value)} placeholder="Full step-by-step resolution reasoning..." className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white" />
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Filter and Search controls */}
            <div className="bg-white p-4 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-2 w-full">
                <Search className="h-4 w-4 text-slate-400 self-center shrink-0" />
                <input
                  type="text"
                  placeholder="Search questions by keyword or topic..."
                  value={qBankSearch}
                  onChange={(e) => setQBankSearch(e.target.value)}
                  className="w-full text-xs bg-transparent border-none outline-none focus:ring-0 text-slate-700"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <select
                  value={qBankSubjectFilter}
                  onChange={(e) => setQBankSubjectFilter(e.target.value)}
                  className="px-2.5 py-1.5 border rounded-xl text-xxs bg-white text-slate-600 font-bold"
                >
                  <option value="all">Subject: All</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>

                <select
                  value={qBankDifficultyFilter}
                  onChange={(e) => setQBankDifficultyFilter(e.target.value)}
                  className="px-2.5 py-1.5 border rounded-xl text-xxs bg-white text-slate-600 font-bold"
                >
                  <option value="all">Difficulty: All</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Questions Grid list */}
            <div className="space-y-4">
              {filteredQBank.length === 0 ? (
                <div className="bg-white p-12 border rounded-2xl text-center text-slate-400">
                  <HelpCircle className="h-8 w-8 mx-auto opacity-35 mb-2" />
                  <p className="text-xs">No matching questions found.</p>
                </div>
              ) : (
                filteredQBank.map(q => {
                  return (
                    <div key={q.id} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center text-xxs font-black">
                        <div className="flex gap-2 items-center">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold uppercase tracking-wider">{q.subject}</span>
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-600">{q.topic}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full ${
                          q.difficulty === 'Hard' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                        {q.question}
                      </p>

                      {/* Choices option list */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {q.options.map((opt: string, idx: number) => {
                          const letter = String.fromCharCode(65 + idx);
                          const isRevealed = revealAnswerId === q.id;
                          const isCorrect = idx === q.correctOptionIndex;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                if (revealAnswerId === q.id) return;
                                setRevealAnswerId(q.id);
                                if (idx === q.correctOptionIndex) {
                                  showLmsToast("Correct Answer!", "Excellent! Your logic matches the solution.");
                                } else {
                                  showLmsToast("Incorrect Option", "Refer to the step-by-step resolution solution below.");
                                }
                              }}
                              className={`p-3 border rounded-xl text-xxs font-medium flex gap-2 cursor-pointer transition-all ${
                                isRevealed
                                  ? isCorrect
                                    ? 'bg-emerald-50 border-emerald-350 text-emerald-800 font-extrabold'
                                    : 'bg-rose-50/40 border-rose-200 text-slate-500'
                                  : 'bg-slate-50/50 border-slate-150 hover:bg-indigo-50/20 hover:border-indigo-150 text-slate-700'
                              }`}
                            >
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                isRevealed && isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>{letter}</span>
                              <span className="self-center">{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Hints & Solutions buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 text-xxs font-black uppercase tracking-wider">
                        <button
                          onClick={() => setRevealHintId(revealHintId === q.id ? null : q.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                        >
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
                          <span>{revealHintId === q.id ? 'Hide Hint' : 'View Hint'}</span>
                        </button>
                        <button
                          onClick={() => setRevealAnswerId(revealAnswerId === q.id ? null : q.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-indigo-500" />
                          <span>{revealAnswerId === q.id ? 'Hide Answer' : 'Show Solution'}</span>
                        </button>
                      </div>

                      {/* Hint block */}
                      {revealHintId === q.id && (
                        <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xxs text-amber-800 leading-relaxed animate-in fade-in duration-100">
                          <strong>💡 Helpful Practice Hint:</strong> {q.hint || "Analyze structural coordinates or use standard conservation properties."}
                        </div>
                      )}

                      {/* Reasoning block */}
                      {revealAnswerId === q.id && (
                        <div className="p-3.5 bg-emerald-50/30 border border-emerald-150 rounded-xl text-xxs text-slate-700 leading-relaxed space-y-1.5 animate-in slide-in-from-top-1.5 duration-150">
                          <strong className="text-emerald-800 block">✓ Detailed Explanation & Reasoning:</strong>
                          <p>{q.reasoning}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}

      {/* 7. Discussion Forums */}
      {activeTab === 'forums' && (() => {
        // Filter threads
        const filteredThreads = forumThreads.filter(t => {
          const matchSearch = t.title.toLowerCase().includes(forumSearch.toLowerCase()) || t.content.toLowerCase().includes(forumSearch.toLowerCase());
          const matchCat = forumCategoryFilter === 'all' || t.category === forumCategoryFilter;
          return matchSearch && matchCat;
        }).sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        const activeThread = forumThreads.find(t => t.id === activeThreadId);

        return (
          <div className="space-y-6 animate-in fade-in duration-200 text-slate-700">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-indigo-700 to-violet-700 text-white p-5 rounded-2xl border border-indigo-850 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="px-2.5 py-0.5 bg-white/10 text-violet-100 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-wider">
                    Community Learning
                  </span>
                  <h3 className="text-lg font-bold mt-1.5 tracking-tight">Student & Teacher Discussion Forums</h3>
                  <p className="text-xxs text-violet-100/95 mt-0.5 max-w-xl">
                    Post questions, share answers, request resource PDFs, and resolve engineering or mathematical doubts with batch teachers.
                  </p>
                </div>
                {!activeThreadId && (
                  <button
                    onClick={() => setIsAddingThread(!isAddingThread)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-indigo-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-xs"
                  >
                    <Plus className="h-4 w-4" /> Start Discussion
                  </button>
                )}
              </div>
            </div>

            {/* Create Discussion Form */}
            {isAddingThread && !activeThreadId && (
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-indigo-600" /> Open New Discussion Thread
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newThreadTitle || !newThreadContent) return;
                    const newThread = {
                      id: `thread-${Date.now()}`,
                      title: newThreadTitle,
                      category: newThreadCategory,
                      authorName: currentRole === 'student' ? 'Aarav Mehta' : 'Dr. Ramesh Kumar',
                      authorRole: currentRole,
                      content: newThreadContent,
                      likes: 0,
                      likedBy: [],
                      replies: [],
                      createdAt: new Date().toISOString()
                    };
                    setForumThreads(prev => [newThread, ...prev]);
                    setIsAddingThread(false);
                    setNewThreadTitle('');
                    setNewThreadContent('');
                    showLmsToast("Discussion Started", `Thread on "${newThread.category}" is now online.`);
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Discussion Topic / Query Title</label>
                      <input
                        type="text"
                        required
                        value={newThreadTitle}
                        onChange={(e) => setNewThreadTitle(e.target.value)}
                        placeholder="e.g. Help needed resolving definitive integration King property variables"
                        className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Subject Category</label>
                      <select
                        value={newThreadCategory}
                        onChange={(e) => setNewThreadCategory(e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white"
                      >
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Biology">Biology</option>
                        <option value="General">General Doubt</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase mb-1">Describe your query in detail</label>
                    <textarea
                      rows={4}
                      required
                      value={newThreadContent}
                      onChange={(e) => setNewThreadContent(e.target.value)}
                      placeholder="Be specific! Mention key formulas, textbook numbers, or specific homework problems..."
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-xxs pt-1">
                    <button type="button" onClick={() => setIsAddingThread(false)} className="px-4 py-2 bg-slate-100 font-bold rounded-xl">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs">Publish Discussion</button>
                  </div>
                </form>
              </div>
            )}

            {/* Main Threads area */}
            {!activeThreadId ? (
              <div className="space-y-4">
                {/* Search forum */}
                <div className="bg-white p-4 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-1 gap-2 w-full">
                    <Search className="h-4 w-4 text-slate-400 self-center shrink-0" />
                    <input
                      type="text"
                      placeholder="Search forum threads by title or keywords..."
                      value={forumSearch}
                      onChange={(e) => setForumSearch(e.target.value)}
                      className="w-full text-xs bg-transparent border-none outline-none focus:ring-0 text-slate-700"
                    />
                  </div>

                  <select
                    value={forumCategoryFilter}
                    onChange={(e) => setForumCategoryFilter(e.target.value)}
                    className="px-2.5 py-1.5 border rounded-xl text-xxs bg-white text-slate-600 font-bold w-full md:w-auto"
                  >
                    <option value="all">Category: All Subjects</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="General">General</option>
                  </select>
                </div>

                {/* Threads list */}
                <div className="space-y-3">
                  {filteredThreads.length === 0 ? (
                    <div className="bg-white p-12 border rounded-2xl text-center text-slate-400">
                      <MessageSquare className="h-8 w-8 mx-auto opacity-35 mb-2" />
                      <p className="text-xs">No active discussions match this search.</p>
                    </div>
                  ) : (
                    filteredThreads.map(t => {
                      return (
                        <div
                          key={t.id}
                          onClick={() => setActiveThreadId(t.id)}
                          className={`bg-white border p-4 rounded-2xl hover:border-slate-350 transition-all cursor-pointer space-y-3 relative ${
                            t.isPinned ? 'border-indigo-200 bg-indigo-50/5/30' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-2 text-xxs">
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9px] font-bold uppercase tracking-wider">{t.category}</span>
                                <span className="text-slate-400">•</span>
                                <span className="font-semibold text-slate-500">By {t.authorName} ({t.authorRole})</span>
                                {t.isPinned && (
                                  <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-150 px-1.5 py-0.5 rounded text-[8px] font-extrabold animate-pulse">
                                    📌 Pinned
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs sm:text-sm font-black text-slate-800 mt-2 line-clamp-1">{t.title}</h4>
                              <p className="text-xxs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{t.content}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors">
                                <Heart className="h-3.5 w-3.5" /> {t.likes} Likes
                              </span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <MessageSquare className="h-3.5 w-3.5" /> {t.replies.length} Replies
                              </span>
                            </div>

                            <span className="text-slate-400 font-semibold">{new Date(t.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* DETAILED THREAD VIEW */
              activeThread && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 animate-in fade-in duration-200">
                  {/* Back trigger */}
                  <button
                    onClick={() => {
                      setActiveThreadId(null);
                      setNewReplyContent('');
                    }}
                    className="text-xxs font-black uppercase text-indigo-600 flex items-center gap-1 hover:underline"
                  >
                    ← Back to Discussions
                  </button>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xxs">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-150 rounded text-[9px] font-black uppercase tracking-wider">{activeThread.category}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-slate-500">By {activeThread.authorName} ({activeThread.authorRole})</span>
                    </div>

                    <h3 className="text-base font-black text-slate-800 tracking-tight leading-snug">{activeThread.title}</h3>
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
                      {activeThread.content}
                    </div>

                    <div className="flex justify-between items-center text-xxs pt-1">
                      <button
                        onClick={() => {
                          setForumThreads(prev => prev.map(t => {
                            if (t.id === activeThread.id) {
                              return { ...t, likes: t.likes + 1 };
                            }
                            return t;
                          }));
                          showLmsToast("Thread Liked", "Thanks for your feedback!");
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 transition-all font-black uppercase text-[10px] rounded-lg"
                      >
                        <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> Like ({activeThread.likes})
                      </button>

                      <span className="text-slate-400 font-bold">Posted on {new Date(activeThread.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Replies division */}
                  <div className="space-y-3 pt-4 border-t border-slate-150">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <span>Thread Responses ({activeThread.replies.length})</span>
                    </h4>

                    {activeThread.replies.length === 0 ? (
                      <p className="text-xxs text-slate-400 text-center py-4 bg-slate-50 rounded-xl">Be the first to reply to this discussion query!</p>
                    ) : (
                      <div className="space-y-3">
                        {activeThread.replies.map((rep: any) => {
                          return (
                            <div
                              key={rep.id}
                              className={`p-3.5 border rounded-xl space-y-2 transition-all ${
                                rep.isBestAnswer
                                  ? 'border-emerald-300 bg-emerald-50/20'
                                  : 'border-slate-150 bg-slate-50/40'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="text-xxs font-black flex items-center gap-2">
                                  <span className="text-slate-800">{rep.authorName}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase ${
                                    rep.authorRole === 'teacher' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                                  }`}>{rep.authorRole}</span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-400 font-semibold">{new Date(rep.createdAt).toLocaleDateString()}</span>
                                </div>

                                {rep.isBestAnswer && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-3xs animate-bounce">
                                    ✓ Best Answer
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                {rep.content}
                              </p>

                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-100/50">
                                <button
                                  onClick={() => {
                                    setForumThreads(prev => prev.map(t => {
                                      if (t.id === activeThread.id) {
                                        return {
                                          ...t,
                                          replies: t.replies.map((r: any) => r.id === rep.id ? { ...r, likes: r.likes + 1 } : r)
                                        };
                                      }
                                      return t;
                                    }));
                                  }}
                                  className="text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                  ❤️ {rep.likes} Upvotes
                                </button>

                                {currentRole === 'teacher' && !rep.isBestAnswer && (
                                  <button
                                    onClick={() => {
                                      setForumThreads(prev => prev.map(t => {
                                        if (t.id === activeThread.id) {
                                          return {
                                            ...t,
                                            replies: t.replies.map((r: any) => r.id === rep.id ? { ...r, isBestAnswer: true } : { ...r, isBestAnswer: false })
                                          };
                                        }
                                        return t;
                                      }));
                                      showLmsToast("Best Answer set", "Instructor-certified answer marked on thread.");
                                    }}
                                    className="text-emerald-600 hover:underline font-bold"
                                  >
                                    Accept as Best Answer
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Reply Form */}
                  <div className="pt-4 border-t border-slate-150 space-y-3">
                    <span className="text-xxs font-black text-slate-400 uppercase tracking-wider block">Write a response reply</span>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newReplyContent) return;
                        const newRep = {
                          id: `reply-${Date.now()}`,
                          authorName: currentRole === 'student' ? 'Aarav Mehta' : 'Dr. Ramesh Kumar (HOD Physics)',
                          authorRole: currentRole,
                          content: newReplyContent,
                          likes: 0,
                          isBestAnswer: false,
                          createdAt: new Date().toISOString()
                        };
                        setForumThreads(prev => prev.map(t => {
                          if (t.id === activeThread.id) {
                            return { ...t, replies: [...t.replies, newRep] };
                          }
                          return t;
                        }));
                        setNewReplyContent('');
                        showLmsToast("Reply Published", "Your forum response has been listed successfully.");
                      }}
                      className="space-y-2.5"
                    >
                      <textarea
                        rows={3}
                        required
                        value={newReplyContent}
                        onChange={(e) => setNewReplyContent(e.target.value)}
                        placeholder="Write helpful study notes, formulas, or corrections..."
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white text-slate-700"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Publish Response</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )
            )}
          </div>
        );
      })()}

      {/* 8. AI Study Planner */}
      {activeTab === 'planner' && (() => {
        // Compute stats for Progress Tracking
        const materialsCount = materials.length;
        const completedMaterials = completedMaterialIds.length;
        const materialsPct = materialsCount > 0 ? Math.round((completedMaterials / materialsCount) * 100) : 0;

        const gradedSubmissions = submissions.filter(s => s.studentId === studentId && s.status === 'Graded');
        const avgScore = gradedSubmissions.length > 0
          ? Math.round(gradedSubmissions.reduce((acc, sub) => {
              const matches = sub.grade?.match(/^(\d+)/);
              return acc + (matches ? Number(matches[1]) : 85);
            }, 0) / gradedSubmissions.length)
          : 85; // Default reference

        const overallSyllabusProgress = Math.round(
          syllabusChapters.reduce((acc, c) => acc + (c.completedPeriods / c.standardPeriods), 0) / syllabusChapters.length * 100
        );

        // Fetch Study Plan function
        const triggerGeneratePlan = async () => {
          setLoadingStudyPlan(true);
          try {
            const data = await geminiService.generatePlanner({
              examTarget,
              weakAreas,
              studyHoursPerDay
            });
            setStudyPlan(data.plan);
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(`study_plan_${studentId}`, data.plan);
              }
            } catch {}
            showLmsToast("Study Plan Ready", "AI Coach has compiled your custom weekly study routine!");
          } catch (err) {
            console.error(err);
          } finally {
            setLoadingStudyPlan(false);
          }
        };

        return (
          <div className="space-y-6 animate-in fade-in duration-200 text-slate-700">
            {/* Unified Academic Progress Tracker Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-black uppercase tracking-wider">Materials Read</span>
                  <span className="text-base font-black text-slate-800">{completedMaterials} / {materialsCount}</span>
                  <span className="block text-[9px] text-indigo-600 font-extrabold mt-0.5">{materialsPct}% Completed</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <FileDown className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-black uppercase tracking-wider">Homework Done</span>
                  <span className="text-base font-black text-slate-800">
                    {submissions.filter(s => s.studentId === studentId).length} Completed
                  </span>
                  <span className="block text-[9px] text-amber-600 font-extrabold mt-0.5">
                    {submissions.filter(s => s.studentId === studentId && s.status === 'Graded').length} Evaluated
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-black uppercase tracking-wider">Avg Test Grades</span>
                  <span className="text-base font-black text-slate-800">{avgScore}% Score</span>
                  <span className="block text-[9px] text-emerald-600 font-extrabold mt-0.5">Top 15% of Batch</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-black uppercase tracking-wider">Syllabus Covered</span>
                  <span className="text-base font-black text-slate-800">{overallSyllabusProgress}% Covered</span>
                  <span className="block text-[9px] text-violet-600 font-extrabold mt-0.5">Synchronized with NEP</span>
                </div>
              </div>
            </div>

            {/* AI Planner interactive UI split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form parameter controls */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-3xl border border-indigo-950 space-y-4">
                <div>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 rounded-full text-[8px] font-black uppercase tracking-wider">
                    Gemini Academic AI
                  </span>
                  <h3 className="text-base font-bold mt-2 tracking-tight">AI Study Planner</h3>
                  <p className="text-xxs text-indigo-200/80 leading-relaxed mt-0.5">
                    Configure your academic parameters to generate a custom high-performance week-by-week study timetable blueprint.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[9px] font-black text-indigo-300 uppercase mb-1">Target Examination</label>
                    <select
                      value={examTarget}
                      onChange={(e) => setExamTarget(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl outline-none transition-colors"
                    >
                      <option className="text-slate-850" value="JEE Main & Advanced 2027">JEE Main & Advanced 2027</option>
                      <option className="text-slate-850" value="NEET UG Medical 2026">NEET UG Medical 2026</option>
                      <option className="text-slate-850" value="Class XII Boards Revision">Class XII CBSE Boards</option>
                      <option className="text-slate-850" value="Class X Board Foundations">Class X Board Foundations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-indigo-300 uppercase mb-1">Doubt Areas / Weak Subjects</label>
                    <input
                      type="text"
                      value={weakAreas}
                      onChange={(e) => setWeakAreas(e.target.value)}
                      placeholder="e.g. Thermodynamics, Optics, Calculus"
                      className="w-full px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[9px] font-black text-indigo-300 uppercase mb-1">
                      <span>Daily Study Hours</span>
                      <span className="text-amber-400 bg-amber-500/10 border border-amber-400/20 px-2 py-0.5 rounded-full">{studyHoursPerDay} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="12"
                      value={studyHoursPerDay}
                      onChange={(e) => setStudyHoursPerDay(Number(e.target.value))}
                      className="w-full h-1.5 bg-indigo-950/80 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <button
                    onClick={triggerGeneratePlan}
                    disabled={loadingStudyPlan}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xxs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/40 disabled:opacity-45"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                    <span>{loadingStudyPlan ? "Analyzing Syllabus..." : "Draft Custom Plan"}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: AI Plan Display */}
              <div className="lg:col-span-2 flex flex-col min-h-[45vh]">
                <span className="text-xxs font-black text-slate-400 uppercase tracking-wider mb-2 block">Personalized Academic Timetable</span>
                <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs flex flex-col">
                  {loadingStudyPlan ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 py-12">
                      <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
                      <div>
                        <p className="font-extrabold text-slate-700 text-xs sm:text-sm">AI Coach is drafting your study blueprint...</p>
                        <p className="text-xxs text-slate-400 mt-0.5">Partitioning syllabus chapters and weak areas into mock schedules.</p>
                      </div>
                    </div>
                  ) : studyPlan ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" /> AI Recommendation Active
                        </span>
                        <button
                          onClick={() => {
                            setStudyPlan('');
                            try {
                              if (typeof window !== 'undefined' && window.localStorage) {
                                window.localStorage.removeItem(`study_plan_${studentId}`);
                              }
                            } catch {}
                          }}
                          className="text-[10px] text-rose-500 hover:underline font-extrabold"
                        >
                          Clear Schedule
                        </button>
                      </div>
                      <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-600 whitespace-pre-wrap font-medium">
                        {studyPlan}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-400 py-12 space-y-2">
                      <BrainCircuit className="h-12 w-12 opacity-30 text-indigo-400" />
                      <div>
                        <p className="font-extrabold text-slate-700 text-xs sm:text-sm">No Active Study Routine</p>
                        <p className="text-xxs text-slate-400 mt-0.5 max-w-sm mx-auto">
                          Click "Draft Custom Plan" on the left to activate expert schedule layouts personalized to your targets.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 9. Certificates & Milestones */}
      {activeTab === 'certificates' && (() => {
        // Compute metrics
        const materialsCount = materials.length;
        const completedMaterials = completedMaterialIds.length;
        const materialsPct = materialsCount > 0 ? Math.round((completedMaterials / materialsCount) * 100) : 0;

        const quizGrades = grades.filter(g => g.studentId === studentId);
        const quizAvg = quizGrades.length > 0
          ? Math.round(quizGrades.reduce((acc, g) => acc + (g.score / g.totalQuestions), 0) / quizGrades.length * 100)
          : 0;

        const isUnlocked = materialsPct >= 75 && quizAvg >= 70;

        return (
          <div className="space-y-6 animate-in fade-in duration-200 text-slate-700 flex flex-col items-center">
            {/* Eligibility widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center max-w-xl w-full space-y-4">
              <div className="space-y-1">
                <Trophy className={`h-10 w-10 mx-auto ${isUnlocked ? 'text-amber-500 animate-bounce' : 'text-slate-300'}`} />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Academic Milestones & Certifications</h3>
                <p className="text-xxs text-slate-400 max-w-md mx-auto">
                  Earn your Course Completion Certificate authorized by Learner's Den Academic Committee. Boost study progress to clear validation standards.
                </p>
              </div>

              {/* Progress targets split */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-50 border p-3 rounded-xl space-y-1 text-xxs font-black text-slate-700">
                  <span className="block text-slate-400 uppercase text-[9px]">Materials Progress</span>
                  <span className="text-sm">{materialsPct}%</span>
                  <span className={`block text-[9px] ${materialsPct >= 75 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {materialsPct >= 75 ? '✓ Cleared' : 'Min 75% required'}
                  </span>
                </div>
                <div className="bg-slate-50 border p-3 rounded-xl space-y-1 text-xxs font-black text-slate-700">
                  <span className="block text-slate-400 uppercase text-[9px]">Quizzes Avg Grade</span>
                  <span className="text-sm">{quizAvg}%</span>
                  <span className={`block text-[9px] ${quizAvg >= 70 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {quizAvg >= 70 ? '✓ Cleared' : 'Min 70% required'}
                  </span>
                </div>
              </div>
            </div>

            {/* Certificate renderer */}
            {isUnlocked ? (
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-3xl border-4 border-indigo-200 max-w-3xl w-full text-center space-y-6 shadow-xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                {/* Certificate layout */}
                <div className="border-2 border-dashed border-indigo-300 p-6 rounded-2xl bg-white space-y-6 relative z-10">
                  <div className="space-y-1">
                    <span className="block text-xxs font-black tracking-widest text-indigo-600 uppercase">LEARNER'S DEN COACHING CENTRE</span>
                    <h2 className="text-xl sm:text-2xl font-serif font-extrabold tracking-wide text-slate-950 mt-1">CERTIFICATE OF RECOGNITION</h2>
                    <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">LMS ACADEMIC ACHIEVEMENT</span>
                  </div>

                  <div className="space-y-1.5 py-2">
                    <p className="text-xxs text-slate-500 italic">This highly prestigious document is proudly presented to:</p>
                    <h3 className="text-lg font-serif font-black underline decoration-indigo-400 decoration-2 underline-offset-4 text-slate-800">
                      Aarav Mehta
                    </h3>
                  </div>

                  <p className="text-xxs text-slate-600 leading-relaxed max-w-md mx-auto italic font-medium">
                    For extraordinary determination and academic mastery, clearing all advanced syllabus materials with an outstanding quiz average of <b>{quizAvg}%</b>. Confirmed on this date via coaching ledger.
                  </p>

                  <div className="grid grid-cols-2 gap-8 pt-6 max-w-md mx-auto text-[9px] font-black text-slate-500 uppercase tracking-wider">
                    <div className="border-t border-slate-350 pt-2 text-center">
                      <span className="block text-slate-800 font-extrabold">DR. RAMESH KUMAR</span>
                      <span className="block text-[8px] text-slate-400 mt-0.5">DIRECTOR OF ACADEMICS</span>
                    </div>
                    <div className="border-t border-slate-350 pt-2 text-center flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-600 mb-1">
                        ★
                      </div>
                      <span className="block text-slate-800 font-extrabold">VERIFIED</span>
                      <span className="block text-[8px] text-slate-400 mt-0.5">LID: #9610-LMS</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-indigo-150 flex items-center gap-2 mx-auto"
                >
                  <Award className="h-4 w-4 text-amber-300 animate-pulse" />
                  <span>Print Certificate</span>
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-xl w-full text-center py-12 space-y-3">
                <Lock className="h-10 w-10 mx-auto text-slate-300 animate-pulse" />
                <h4 className="font-extrabold text-slate-800 text-sm">Certification Locked</h4>
                <p className="text-xxs text-slate-400 max-w-sm mx-auto">
                  Earn your certification of excellence by reading all remaining class sheets (min 75%) and clearing online exams (min 70%). Keep up your hard work!
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* MODAL: INTERACTIVE VIDEO PLAYER */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl text-white animate-in zoom-in-95 duration-150 flex flex-col md:flex-row">
            
            {/* Left side: Video player screen */}
            <div className="flex-1 bg-black aspect-video md:aspect-auto flex flex-col justify-between relative p-4 group">
              {/* Fake player frame */}
              <div className="flex justify-between items-center z-10">
                <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[8px] font-black uppercase tracking-widest animate-pulse">STREAMING</span>
                <span className="text-xxs text-slate-400 font-bold">{selectedVideo.title}</span>
              </div>

              {/* Central play circle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 flex items-center justify-center text-white cursor-pointer pointer-events-auto transition-all"
                  onClick={() => {
                    setIsVideoPlaying(!isVideoPlaying);
                    if (!isVideoPlaying) {
                      const interval = setInterval(() => {
                        setVideoPlayTime(prev => {
                          if (prev >= 100) {
                            clearInterval(interval);
                            setIsVideoPlaying(false);
                            return 100;
                          }
                          return prev + 1;
                        });
                      }, 1000);
                    }
                  }}
                >
                  <Play className="h-6 w-6 fill-white text-white" />
                </div>
              </div>

              {/* Bottom bar controls */}
              <div className="space-y-3 z-10 pt-24">
                {/* Timeline bar */}
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden p-0 relative">
                  <div className="bg-red-600 h-full rounded-full transition-all duration-300" style={{ width: `${videoPlayTime}%` }} />
                </div>
                
                <div className="flex justify-between items-center text-xxs text-slate-400">
                  <span className="font-bold">{isVideoPlaying ? "Playing" : "Paused"}</span>
                  <span className="font-extrabold">{videoPlayTime}% Watched</span>
                </div>
              </div>
            </div>

            {/* Right side: Sidebar chapters */}
            <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-slate-800 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-1">
                  <div>
                    <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[8px] font-black uppercase">Lecture Series</span>
                    <h4 className="text-xs font-black text-white mt-1 leading-tight">{selectedVideo.title}</h4>
                  </div>
                  <button onClick={() => {
                    setSelectedVideo(null);
                    setIsVideoPlaying(false);
                    setVideoPlayTime(0);
                  }} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
                </div>
                
                <p className="text-[10px] text-slate-400 leading-relaxed">{selectedVideo.description || "Video lecture designed by coaching directors for board revision targets."}</p>
                
                <div className="space-y-2 pt-2 text-xxs font-black">
                  <span className="block text-slate-500 uppercase text-[8px]">Lecture Syllabus</span>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center">
                    <span>1. Electrostatics Gauss Intro</span>
                    <span className="text-emerald-500">14m</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center">
                    <span>2. Electric Potential Formula</span>
                    <span className="text-slate-500">22m</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    if (!completedMaterialIds.includes(selectedVideo.id)) {
                      toggleMaterialCompletion(selectedVideo.id);
                    }
                    setSelectedVideo(null);
                    setIsVideoPlaying(false);
                    setVideoPlayTime(0);
                    showLmsToast("Lecture Completed", "Progress marked on dashboard!");
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xxs uppercase tracking-wider rounded-xl transition-all"
                >
                  Mark Class Completed
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
