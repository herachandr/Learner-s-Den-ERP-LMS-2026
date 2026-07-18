import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, FileText, CheckCircle, Video, Download, Plus, Sparkles, 
  Search, Filter, Folder, Pin, Heart, Eye, History, Trash2, Edit3, 
  Shield, FileDown, Archive, ChevronDown, ChevronUp, Info, Upload, 
  X, File, Calendar, BarChart2, BookMarked, Globe, Sparkle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { LibraryBook, LibraryResourceType, UserRole, Batch, Course } from '../types';
import { libraryService } from '../services/libraryService';
import { studentService } from '../services/studentService';
import { 
  BookGrid, EmptyState, LoadingState, BookDetails 
} from './library/BookComponents';

interface DigitalLibraryProps {
  currentRole: UserRole;
  studentId: string;
  studentBatchId?: string;
  batches: Batch[];
  courses?: Course[];
}

export default function DigitalLibrary({
  currentRole,
  studentId,
  studentBatchId,
  batches,
  courses,
}: DigitalLibraryProps) {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Searching, Filtering & Folders
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedResourceType, setSelectedResourceType] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'downloads' | 'alpha'>('latest');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  
  // Favorites Persistence
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`fav_books_${studentId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Preview / Modal States
  const [previewBook, setPreviewBook] = useState<LibraryBook | null>(null);
  const [isPreviewingPdf, setIsPreviewingPdf] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewZoom, setPreviewZoom] = useState(100);

  // Administration Upload States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditingBook, setIsEditingBook] = useState<LibraryBook | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Form Metadata States
  const [bookTitle, setBookTitle] = useState('');
  const [bookResourceType, setBookResourceType] = useState<LibraryResourceType>('E-Book');
  const [bookSubject, setBookSubject] = useState('Physics');
  const [bookClassLevel, setBookClassLevel] = useState<'IX' | 'X' | 'XI' | 'XII' | 'All'>('All');
  const [bookCourse, setBookCourse] = useState<'Foundation' | 'NEET' | 'JEE' | 'Boards' | 'General'>('General');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookEdition, setBookEdition] = useState('');
  const [bookLanguage, setBookLanguage] = useState('English');
  const [bookDescription, setBookDescription] = useState('');
  const [bookKeywords, setBookKeywords] = useState('');
  const [bookCoverUrl, setBookCoverUrl] = useState('');
  const [bookAccessLevel, setBookAccessLevel] = useState<'all' | 'class_ix' | 'class_x' | 'class_xi' | 'class_xii' | 'foundation' | 'neet' | 'jee' | 'batch' | 'individual'>('all');
  const [bookAllowedBatchIds, setBookAllowedBatchIds] = useState<string[]>([]);
  const [bookAllowedStudentIds, setBookAllowedStudentIds] = useState<string[]>([]);
  const [bookIsPinned, setBookIsPinned] = useState(false);
  const [bookIsFeatured, setBookIsFeatured] = useState(false);
  const [bookDownloadRestricted, setBookDownloadRestricted] = useState(false);
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Student and Download Audit Logs
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchBooks();
    fetchStudents();
  }, []);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await libraryService.getBooks();
      setBooks(data);
    } catch (err) {
      console.error("Failed to fetch library books:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getStudents();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students database:", err);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = favoriteIds.includes(id) 
      ? favoriteIds.filter(x => x !== id) 
      : [...favoriteIds, id];
    setFavoriteIds(updated);
    try {
      localStorage.setItem(`fav_books_${studentId}`, JSON.stringify(updated));
    } catch {}
    showToast(
      favoriteIds.includes(id) ? "Removed from Saved" : "Book Marked",
      favoriteIds.includes(id) ? "Removed from your personal study favorites." : "Added to your personal library favorites."
    );
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        handleFileSelection(file);
      } else {
        showToast("Invalid File Type", "Please drag and drop a valid PDF document.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    // Auto populate Title from filename if title is currently empty
    if (!bookTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setBookTitle(cleanName);
    }
    showToast("PDF Selected", `"${file.name}" ready to be processed and simulated.`);
  };

  const triggerUploadProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !isEditingBook) {
      showToast("File Required", "Please choose or drop a study PDF material file to compile.");
      return;
    }

    // Simulate PDF file uploading progress
    if (selectedFile) {
      setUploadProgress(10);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return null;
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 20;
        });
      }, 150);

      // Create local object URL for instant, real PDF previewing & downloading
      const localPdfUrl = URL.createObjectURL(selectedFile);
      const fileSizeString = (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB";

      setTimeout(async () => {
        setUploadProgress(100);
        await saveBookMetadata(localPdfUrl, fileSizeString);
        clearInterval(interval);
        setUploadProgress(null);
      }, 1000);
    } else {
      await saveBookMetadata();
    }
  };

  const saveBookMetadata = async (generatedFileUrl?: string, generatedSize?: string) => {
    const payload = {
      title: bookTitle,
      resourceType: bookResourceType,
      subject: bookSubject || "General",
      classLevel: bookClassLevel,
      course: bookCourse,
      author: bookAuthor || "Institutional Staff",
      publisher: bookPublisher || "Internal Library",
      edition: bookEdition || "Current Edition",
      language: bookLanguage,
      description: bookDescription,
      keywords: bookKeywords.split(',').map(x => x.trim()).filter(Boolean),
      coverUrl: bookCoverUrl || undefined,
      fileUrl: generatedFileUrl || (isEditingBook ? isEditingBook.fileUrl : "https://example.com/books/sample.pdf"),
      fileType: "pdf",
      fileSize: generatedSize || (isEditingBook ? isEditingBook.fileSize : "5.0 MB"),
      accessLevel: bookAccessLevel,
      allowedBatchIds: bookAllowedBatchIds,
      allowedStudentIds: bookAllowedStudentIds,
      isPinned: bookIsPinned,
      isFeatured: bookIsFeatured,
      downloadRestricted: bookDownloadRestricted,
      publishDate: "",
      expiryDate: ""
    };

    try {
      if (isEditingBook) {
        await libraryService.updateBook(isEditingBook.id, payload as any);
      } else {
        await libraryService.createBook(payload as any);
      }

      showToast(
        isEditingBook ? "Study Material Updated" : "Material Uploaded Successfully",
        `"${bookTitle}" is catalogued and instantly available based on access rules.`
      );
      setIsUploadOpen(false);
      setIsEditingBook(null);
      resetForm();
      fetchBooks();
    } catch (err) {
      console.error("Failed to post book:", err);
      showToast("Network Error", "Unable to establish secure handshake with catalog host.");
    }
  };

  const resetForm = () => {
    setBookTitle('');
    setBookResourceType('E-Book');
    setBookSubject('Physics');
    setBookClassLevel('All');
    setBookCourse('General');
    setBookAuthor('');
    setBookPublisher('');
    setBookEdition('');
    setBookLanguage('English');
    setBookDescription('');
    setBookKeywords('');
    setBookCoverUrl('');
    setBookAccessLevel('all');
    setBookAllowedBatchIds([]);
    setBookAllowedStudentIds([]);
    setBookIsPinned(false);
    setBookIsFeatured(false);
    setBookDownloadRestricted(false);
    setSelectedFile(null);
    setUploadProgress(null);
  };

  const populateFormForEditing = (book: LibraryBook) => {
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
    setBookAccessLevel(book.accessLevel);
    setBookAllowedBatchIds(book.allowedBatchIds || []);
    setBookAllowedStudentIds(book.allowedStudentIds || []);
    setBookIsPinned(!!book.isPinned);
    setBookIsFeatured(!!book.isFeatured);
    setBookDownloadRestricted(!!book.downloadRestricted);
  };

  const handleDeleteBook = async (id: string, title: string) => {
    if (!confirm(`Are you absolutely sure you want to delete "${title}" permanently?`)) return;
    try {
      await libraryService.deleteBook(id);
      showToast("Material Purged", `"${title}" has been removed from all student study desks.`);
      fetchBooks();
    } catch {
      showToast("Error Purging", "Server rejected the deletion command.");
    }
  };

  const handleDownload = async (book: LibraryBook) => {
    if (book.downloadRestricted && currentRole === 'student') {
      showToast("Restricted File", "Institution rules restrict offline downloads for this secure textbook.");
      return;
    }

    try {
      const studentName = students.find(s => s.id === studentId)?.name || "Active Scholar";
      await libraryService.downloadBook(book.id, { studentId, studentName });
      fetchBooks(); // refresh stats
      showToast("Download Initialized", `Recording log entry. Fetching document source...`);
      window.open(book.fileUrl, '_blank');
    } catch {
      window.open(book.fileUrl, '_blank');
    }
  };

  // Helper to check user access level dynamically
  const hasAccess = (book: LibraryBook) => {
    if (currentRole !== 'student') return true;
    if (book.isArchived) return false;
    if (book.accessLevel === 'all') return true;

    if (book.accessLevel === 'individual') {
      return !!book.allowedStudentIds?.includes(studentId);
    }
    if (book.accessLevel === 'batch') {
      return !!book.allowedBatchIds?.includes(studentBatchId || '');
    }

    const myBatch = batches.find(b => b.id === studentBatchId);
    const batchName = (myBatch?.name || '').toLowerCase();
    
    if (book.accessLevel === 'class_ix' && (batchName.includes('ix') || batchName.includes('9'))) return true;
    if (book.accessLevel === 'class_x' && (batchName.includes(' x') || batchName.includes('10') || batchName.includes('-x'))) return true;
    if (book.accessLevel === 'class_xi' && (batchName.includes('xi') || batchName.includes('11'))) return true;
    if (book.accessLevel === 'class_xii' && (batchName.includes('xii') || batchName.includes('12'))) return true;
    
    if (book.accessLevel === 'neet' && batchName.includes('neet')) return true;
    if (book.accessLevel === 'jee' && batchName.includes('jee')) return true;
    if (book.accessLevel === 'foundation' && batchName.includes('foundation')) return true;

    return false;
  };

  // Apply Search, Filter, Sort and folders
  const filteredBooks = books.filter(book => {
    if (!hasAccess(book)) return false;

    // Folder selection mapping
    if (activeFolder !== 'all') {
      if (activeFolder === 'ebook' && book.resourceType !== 'E-Book') return false;
      if (activeFolder === 'notes' && book.resourceType !== 'PDF Notes') return false;
      if (activeFolder === 'video' && book.resourceType !== 'Video Lecture') return false;
      if (activeFolder === 'assignment' && book.resourceType !== 'Assignment') return false;
      if (activeFolder === 'pyq' && book.resourceType !== 'Previous Year Paper') return false;
      if (activeFolder === 'sample' && book.resourceType !== 'Sample Paper') return false;
      if (activeFolder === 'worksheet' && book.resourceType !== 'Practice Worksheet') return false;
    }

    // Dropdown category filters
    if (selectedSubject !== 'all' && book.subject !== selectedSubject) return false;
    if (selectedClass !== 'all' && book.classLevel !== selectedClass) return false;
    if (selectedCourse !== 'all' && book.course !== selectedCourse) return false;
    if (selectedResourceType !== 'all' && book.resourceType !== selectedResourceType) return false;

    // Free text matching
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = book.title.toLowerCase().includes(q);
      const matchAuthor = book.author.toLowerCase().includes(q);
      const matchSubject = book.subject.toLowerCase().includes(q);
      const matchDesc = book.description.toLowerCase().includes(q);
      const matchKeywords = book.keywords.some(k => k.toLowerCase().includes(q));
      if (!matchTitle && !matchAuthor && !matchSubject && !matchDesc && !matchKeywords) return false;
    }

    return true;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'downloads') {
      return (b.downloadCount || 0) - (a.downloadCount || 0);
    }
    if (sortBy === 'alpha') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
  });

  // Unique Subjects for filter
  const distinctSubjects = Array.from(new Set(books.map(b => b.subject))).filter(Boolean);

  // Compute stats for charts & layout
  const totalBooks = books.length;
  const totalDLs = books.reduce((sum, b) => sum + (b.downloadCount || 0), 0);
  const featuredCount = books.filter(b => b.isFeatured).length;

  const subjectData = Object.entries(
    books.reduce((acc, b) => {
      acc[b.subject] = (acc[b.subject] || 0) + (b.downloadCount || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, downloads]) => ({ name, downloads }));

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 bg-indigo-900 border border-indigo-750 text-white p-4 rounded-xl shadow-lg max-w-sm flex items-start gap-3"
          >
            <Sparkles className="h-5 w-5 text-amber-300 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <h5 className="font-extrabold text-xs tracking-tight">{toastMessage.title}</h5>
              <p className="text-[10px] text-indigo-200 mt-1 leading-normal">{toastMessage.desc}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-indigo-300 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 rounded-3xl border border-indigo-900 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-400/20 rounded-full text-[10px] font-black uppercase tracking-wider">
              Smart Study Desk
            </span>
            <h3 className="text-2xl font-black mt-2 tracking-tight">Institutional Digital E-Book Library</h3>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
              Certified academic materials, textbook revisions, solved syllabus previous year papers, and conceptual study briefs curated specifically for your learning track.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(currentRole === 'admin' || currentRole === 'librarian' || currentRole === 'principal') && (
              <button
                onClick={() => {
                  resetForm();
                  setIsEditingBook(null);
                  setIsUploadOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-950/20 active:scale-95"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Upload Study E-Book</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Folders Directories Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Resource Directory Folders</span>
          {activeFolder !== 'all' && (
            <button onClick={() => setActiveFolder('all')} className="text-xs font-bold text-indigo-600 hover:underline">Clear Folder Filter</button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { id: 'all', label: 'All Folders', count: books.length, color: 'border-slate-200 bg-slate-50 text-slate-700' },
            { id: 'ebook', label: 'E-Books', count: books.filter(b => b.resourceType === 'E-Book').length, icon: BookOpen, color: 'border-blue-100 bg-blue-50/40 text-blue-700' },
            { id: 'notes', label: 'PDF Notes', count: books.filter(b => b.resourceType === 'PDF Notes').length, icon: FileText, color: 'border-amber-100 bg-amber-50/40 text-amber-700' },
            { id: 'video', label: 'Video Lectures', count: books.filter(b => b.resourceType === 'Video Lecture').length, icon: Video, color: 'border-emerald-100 bg-emerald-50/40 text-emerald-700' },
            { id: 'assignment', label: 'Assignments', count: books.filter(b => b.resourceType === 'Assignment').length, icon: FileDown, color: 'border-indigo-100 bg-indigo-50/40 text-indigo-700' },
            { id: 'pyq', label: 'Previous Years', count: books.filter(b => b.resourceType === 'Previous Year Paper').length, icon: History, color: 'border-purple-100 bg-purple-50/40 text-purple-700' },
            { id: 'sample', label: 'Sample Papers', count: books.filter(b => b.resourceType === 'Sample Paper').length, icon: Sparkle, color: 'border-rose-100 bg-rose-50/40 text-rose-700' },
            { id: 'worksheet', label: 'Worksheets', count: books.filter(b => b.resourceType === 'Practice Worksheet').length, icon: CheckCircle, color: 'border-teal-100 bg-teal-50/40 text-teal-700' },
          ].map(folder => {
            const Icon = folder.icon || Folder;
            const isSelected = activeFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm scale-102' 
                    : `${folder.color} hover:shadow-xxs hover:border-slate-350 cursor-pointer`
                }`}
              >
                <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-white' : 'opacity-80'}`} />
                <span className="text-xs font-black truncate w-full leading-none">{folder.label}</span>
                <span className={`text-[10px] mt-1 font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {folder.count} items
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filter, Search, Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xxs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search text input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog by title, scholar author, tags, or description topics..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          {/* Subject Filter */}
          <div className="w-full lg:w-44">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 font-bold focus:bg-white cursor-pointer"
            >
              <option value="all">Subject: All</option>
              {distinctSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
            </select>
          </div>

          {/* Class Grade Filter */}
          <div className="w-full lg:w-40">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 font-bold focus:bg-white cursor-pointer"
            >
              <option value="all">Class: All Grades</option>
              <option value="IX">Class IX</option>
              <option value="X">Class X</option>
              <option value="XI">Class XI</option>
              <option value="XII">Class XII</option>
              <option value="All">Institution Wide</option>
            </select>
          </div>

          {/* Course Track Filter */}
          <div className="w-full lg:w-44">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 font-bold focus:bg-white cursor-pointer"
            >
              <option value="all">Course Track: All</option>
              <option value="JEE">JEE Mains & Advanced</option>
              <option value="NEET">NEET Prep Medical</option>
              <option value="Foundation">IIT Foundation</option>
              <option value="Boards">State/CBSE Boards</option>
              <option value="General">General Track</option>
            </select>
          </div>

          {/* Sorting Option */}
          <div className="w-full lg:w-44">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-indigo-100 rounded-xl text-xs bg-indigo-50/50 text-indigo-700 font-black focus:bg-white cursor-pointer"
            >
              <option value="latest">Sort: Latest Upload</option>
              <option value="downloads">Sort: Most Downloaded</option>
              <option value="alpha">Sort: Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Books Grid */}
      {loading ? (
        <LoadingState />
      ) : sortedBooks.length === 0 ? (
        <EmptyState 
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedSubject('all');
            setSelectedClass('all');
            setSelectedCourse('all');
            setSelectedResourceType('all');
            setActiveFolder('all');
          }}
        />
      ) : (
        <BookGrid
          books={sortedBooks}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          onPreview={(book) => {
            setPreviewBook(book);
            setPreviewPage(1);
            setIsPreviewingPdf(true);
          }}
          onDownload={handleDownload}
          onEdit={(book) => {
            resetForm();
            populateFormForEditing(book);
            setIsEditingBook(book);
            setIsUploadOpen(true);
          }}
          onDelete={(id) => {
            const b = books.find(x => x.id === id);
            if (b) handleDeleteBook(id, b.title);
          }}
          currentRole={currentRole}
        />
      )}

      {/* Library Usage Insights / Analytics Panel */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-5">
        <div>
          <h4 className="text-sm font-black text-slate-850 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-indigo-600" />
            <span>Digital Study Material Analytics</span>
          </h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Live reading downloads and library density metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-4.5 rounded-2xl flex items-center gap-4 shadow-xxs">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Catalogs</span>
              <span className="text-lg font-black text-slate-800">{totalBooks} documents</span>
              <span className="block text-[9px] text-slate-400 mt-0.5">Available offline</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4.5 rounded-2xl flex items-center gap-4 shadow-xxs">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged Downloads</span>
              <span className="text-lg font-black text-slate-800">{totalDLs} deliveries</span>
              <span className="block text-[9px] text-slate-400 mt-0.5">Student verification active</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4.5 rounded-2xl flex items-center gap-4 shadow-xxs">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
            </div>
            <div>
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Featured High-Yield</span>
              <span className="text-lg font-black text-slate-800">{featuredCount} E-books</span>
              <span className="block text-[9px] text-slate-400 mt-0.5">Marked for target prep</span>
            </div>
          </div>
        </div>

        {/* Analytics plotting row */}
        {subjectData.length > 0 && (
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Accumulative Downloads by Curriculum Subject</span>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} stroke="#64748B" />
                  <YAxis fontSize={9} tickLine={false} axisLine={false} stroke="#64748B" />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="downloads" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: PREVIEW BOOK (with custom mock text and zoom triggers) */}
      {previewBook && isPreviewingPdf && (
        <BookDetails
          book={previewBook}
          onClose={() => {
            setIsPreviewingPdf(false);
            setPreviewBook(null);
          }}
          onDownload={handleDownload}
          currentRole={currentRole}
        />
      )}

      {/* =======================================================
          ADMIN-ONLY STUDY MATERIAL / E-BOOK UPLOADER MODAL
          ======================================================= */}
      {isUploadOpen && (currentRole === 'admin' || currentRole === 'librarian' || currentRole === 'principal') && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-3xl border border-slate-200 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 flex justify-between items-center">
              <div className="text-left">
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/25 rounded-md text-[9px] font-black uppercase tracking-wider">
                  ERP Administrator Module
                </span>
                <h3 className="text-sm font-black tracking-tight mt-1">
                  {isEditingBook ? `Modify Catalogue: ${isEditingBook.title}` : 'Curate & Upload Academic PDF Study Material'}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsUploadOpen(false);
                  setIsEditingBook(null);
                  resetForm();
                }}
                className="text-white/80 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={triggerUploadProcess} className="p-6 space-y-5 text-left text-xs max-h-[75vh] overflow-y-auto">
              
              {/* FILE UPLOAD SECTION - PDF File Input with Drag & Drop */}
              {!isEditingBook && (
                <div className="space-y-1.5">
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest">Select PDF Document</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      isDragging 
                        ? 'border-indigo-600 bg-indigo-50/50' 
                        : selectedFile 
                          ? 'border-emerald-500 bg-emerald-50/10' 
                          : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="application/pdf"
                      className="hidden"
                    />
                    
                    {selectedFile ? (
                      <>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-700">{selectedFile.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            PDF File • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600"
                        >
                          Change File
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full animate-pulse">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-700">Drag & Drop Study PDF here, or click to browse</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">Supports PDF format textbooks and worksheets up to 50MB</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Simulated Progress bar */}
                  {uploadProgress !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-indigo-600">
                        <span>Uploading curriculum file...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-150" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CORE METADATA FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">E-Book or Document Title</label>
                  <input
                    type="text"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="e.g., Fundamentals of Algebra & Geometry"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Brief Description / Study Syllabus Outline</label>
                  <textarea
                    rows={2}
                    value={bookDescription}
                    onChange={(e) => setBookDescription(e.target.value)}
                    placeholder="Enter highlights or chapter chapters included in this study book..."
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                </div>

                {/* Resource Category Type */}
                <div>
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Resource Category Type</label>
                  <select
                    value={bookResourceType}
                    onChange={(e) => setBookResourceType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="E-Book">E-Book</option>
                    <option value="PDF Notes">PDF Notes</option>
                    <option value="Video Lecture">Video Lecture</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Previous Year Paper">Previous Year Paper</option>
                    <option value="Sample Paper">Sample Paper</option>
                    <option value="Practice Worksheet">Practice Worksheet</option>
                  </select>
                </div>

                {/* Subject Name */}
                <div>
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={bookSubject}
                    onChange={(e) => setBookSubject(e.target.value)}
                    placeholder="Physics, Chemistry, Zoology, etc."
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Author Name */}
                <div>
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Author / Academic Scholar</label>
                  <input
                    type="text"
                    required
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    placeholder="Dr. H.C. Verma, etc."
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Publisher */}
                <div>
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Publisher House</label>
                  <input
                    type="text"
                    required
                    value={bookPublisher}
                    onChange={(e) => setBookPublisher(e.target.value)}
                    placeholder="Oxford, NCERT Publications, etc."
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Revision Edition Name */}
                <div>
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Edition Revision Level</label>
                  <input
                    type="text"
                    required
                    value={bookEdition}
                    onChange={(e) => setBookEdition(e.target.value)}
                    placeholder="2026 Smart Edition, 14th Rev, etc."
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Medium Language</label>
                  <input
                    type="text"
                    value={bookLanguage}
                    onChange={(e) => setBookLanguage(e.target.value)}
                    placeholder="English, Hindi, Bilingual"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Cover Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Book Thumbnail Cover URL (Optional)</label>
                  <input
                    type="url"
                    value={bookCoverUrl}
                    onChange={(e) => setBookCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or leave blank for dynamic cover"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                {/* Keywords Tagging */}
                <div className="md:col-span-2">
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Search Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={bookKeywords}
                    onChange={(e) => setBookKeywords(e.target.value)}
                    placeholder="mechanics, organic-reaction, class-11-jee"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                {/* Class Standard Targeting */}
                <div>
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Target Class Standard</label>
                  <select
                    value={bookClassLevel}
                    onChange={(e) => setBookClassLevel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="All">All / Institution Wide</option>
                    <option value="IX">Class IX</option>
                    <option value="X">Class X</option>
                    <option value="XI">Class XI</option>
                    <option value="XII">Class XII</option>
                  </select>
                </div>

                {/* Targeted Course Track */}
                <div>
                  <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Target Course Program</label>
                  <select
                    value={bookCourse}
                    onChange={(e) => setBookCourse(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="General">General Track / None</option>
                    <option value="Foundation">IIT Foundation</option>
                    <option value="JEE">JEE Mains & Advanced Prep</option>
                    <option value="NEET">NEET Medical Prep</option>
                    <option value="Boards">State / School Boards</option>
                  </select>
                </div>

                {/* SCOPE & ACCESS LEVEL PERMISSIONS */}
                <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4.5 w-4.5 text-indigo-600" />
                    <span className="text-xs font-black text-slate-850">Access scope & Student Security settings</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Granular Access level</label>
                      <select
                        value={bookAccessLevel}
                        onChange={(e) => setBookAccessLevel(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-indigo-200 rounded-lg bg-white font-extrabold text-indigo-900 cursor-pointer"
                      >
                        <option value="all">Open to All Students (Public)</option>
                        <option value="class_ix">Only Class IX Students</option>
                        <option value="class_x">Only Class X Students</option>
                        <option value="class_xi">Only Class XI Students</option>
                        <option value="class_xii">Only Class XII Students</option>
                        <option value="foundation">Only IIT Foundation Track</option>
                        <option value="neet">Only NEET Target Track</option>
                        <option value="jee">Only JEE Target Track</option>
                        <option value="batch">Explicit Selected Batches Only</option>
                        <option value="individual">Explicit Selected Students Only</option>
                      </select>
                    </div>

                    {/* Conditional: Batch selector */}
                    {bookAccessLevel === 'batch' && (
                      <div>
                        <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Permit Batches (hold Ctrl / Cmd to multi-select)</label>
                        <select
                          multiple
                          value={bookAllowedBatchIds}
                          onChange={(e) => setBookAllowedBatchIds(Array.from(e.target.selectedOptions, option => option.value))}
                          className="w-full px-3 py-1 border border-slate-200 rounded-lg bg-white min-h-[60px]"
                        >
                          {batches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Conditional: Student selector */}
                    {bookAccessLevel === 'individual' && (
                      <div>
                        <label className="block text-xxs font-black text-slate-400 uppercase tracking-widest mb-1">Permit Individual Students (hold Ctrl / Cmd to multi-select)</label>
                        <select
                          multiple
                          value={bookAllowedStudentIds}
                          onChange={(e) => setBookAllowedStudentIds(Array.from(e.target.selectedOptions, option => option.value))}
                          className="w-full px-3 py-1 border border-slate-200 rounded-lg bg-white min-h-[60px]"
                        >
                          {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={bookIsPinned}
                        onChange={(e) => setBookIsPinned(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Pin to Library Header</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={bookIsFeatured}
                        onChange={(e) => setBookIsFeatured(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Mark High-Yield</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={bookDownloadRestricted}
                        onChange={(e) => setBookDownloadRestricted(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-rose-600 font-extrabold uppercase tracking-wide">Block Offline Downloads</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadOpen(false);
                    setIsEditingBook(null);
                    resetForm();
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-950/10 cursor-pointer"
                >
                  {isEditingBook ? 'Apply Modifications' : 'Compile & Publish Material'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
