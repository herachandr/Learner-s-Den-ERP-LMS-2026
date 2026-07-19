import React, { useState, useRef } from 'react';
import { Search, Plus, UserPlus, Mail, Phone, Calendar, User, Edit2, Trash2, Tag, CreditCard, Camera, Upload, BookOpen, MapPin, Sparkles, X, Check, Award, Home, Eye, IdCard, QrCode, Download, GraduationCap, SlidersHorizontal, FileText, Users, ShieldAlert, Lock, Coins, Activity, MessageSquare, Clock } from 'lucide-react';
import { Student, Batch, FeeReceipt } from '../types';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { StudentProfileModal } from './StudentProfileModal';

interface StudentManagerProps {
  students: Student[];
  batches: Batch[];
  fees?: FeeReceipt[];
  onAddStudent: (student: Omit<Student, 'id' | 'totalFeesPaid' | 'totalFeesDue'>) => Promise<void>;
  onUpdateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  onCollectFees: (studentId: string, amount: number, mode: string) => Promise<void>;
}

export default function StudentManager({
  students,
  batches,
  fees = [],
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onCollectFees,
}: StudentManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('all');
  const [subTab, setSubTab] = useState<'active' | 'alumni'>('active');
  
  // Advanced Filter States
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterAcademicSession, setFilterAcademicSession] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterEws, setFilterEws] = useState<string>('all');
  const [filterBpl, setFilterBpl] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name-az');

  // Modal tab state
  const [modalTab, setModalTab] = useState<string>('general');
  const [newDocType, setNewDocType] = useState('Aadhaar Card');
  const [newDocName, setNewDocName] = useState('');
  const [simulatedRole, setSimulatedRole] = useState<'admin' | 'lecturer' | 'front_office'>('admin');
  const [editFields, setEditFields] = useState<Partial<Student>>({});
  const [isEditingSection, setIsEditingSection] = useState<string | null>(null); // 'personal' | 'parents' | 'medical' | 'academic' | 'benefits'
  
  // Custom alerts and toast state
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  
  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 3500);
  };

  // State maps for custom profile tabs
  const [attendanceLogs, setAttendanceLogs] = useState<Record<string, { date: string, status: 'Present' | 'Absent' | 'Late', remarks: string }[]>>({});
  const [studentResults, setStudentResults] = useState<Record<string, { id: string, examName: string, subject: string, date: string, marksObtained: number, maxMarks: number, remarks: string }[]>>({});
  const [communicationLogs, setCommunicationLogs] = useState<Record<string, { id: string, date: string, mode: string, recipient: string, messageBody: string, status: string }[]>>({});

  // Dynamic input states for creating records within tabs
  const [newAttDate, setNewAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAttStatus, setNewAttStatus] = useState<'Present' | 'Absent' | 'Late'>('Present');
  const [newAttRemarks, setNewAttRemarks] = useState('');

  const [newResultExam, setNewResultExam] = useState('');
  const [newResultSubject, setNewResultSubject] = useState('Physics');
  const [newResultDate, setNewResultDate] = useState(new Date().toISOString().split('T')[0]);
  const [newResultObtained, setNewResultObtained] = useState('');
  const [newResultMax, setNewResultMax] = useState('100');
  const [newResultRemarks, setNewResultRemarks] = useState('');

  const [newCommMode, setNewCommMode] = useState('WhatsApp');
  const [newCommRecipient, setNewCommRecipient] = useState('Parent');
  const [newCommMessage, setNewCommMessage] = useState('');
  
  // Modals / Form states
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [collectingFeesId, setCollectingFeesId] = useState<string | null>(null);
  
  // New/Edit student fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [batchId, setBatchId] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [feeStatus, setFeeStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Pending');
  const [initialFeesDue, setInitialFeesDue] = useState('1000');

  // Expanded admission details fields
  const [address, setAddress] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [subjectsChosen, setSubjectsChosen] = useState<string[]>([]);
  const [previousClassPercentage, setPreviousClassPercentage] = useState<string>('');
  const [concessionApplied, setConcessionApplied] = useState(false);
  const [concessionPercentage, setConcessionPercentage] = useState<number | ''>(0);

  // New expanded fields for records management requirements
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [ewsStatus, setEwsStatus] = useState(false);
  const [bplStatus, setBplStatus] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<{ id: string; name: string; type: string; url: string; uploadedAt: string; }[]>([]);
  const [formDocType, setFormDocType] = useState('Aadhaar Card');
  const [formDocName, setFormDocName] = useState('');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  const handleDragOverPhoto = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(true);
  };

  const handleDragLeavePhoto = () => {
    setIsDraggingPhoto(false);
  };

  const handleDropPhoto = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Unified communication fields
  const [studentWhatsApp, setStudentWhatsApp] = useState('');
  const [fatherPhone, setFatherPhoneState] = useState('');
  const [fatherWhatsApp, setFatherWhatsApp] = useState('');
  const [fatherEmail, setFatherEmail] = useState('');
  const [motherPhone, setMotherPhoneState] = useState('');
  const [motherWhatsApp, setMotherWhatsApp] = useState('');
  const [motherEmail, setMotherEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianWhatsApp, setGuardianWhatsApp] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');

  // Student details modal drawer state
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Student Profile Camera states
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const registerVideoRef = useRef<HTMLVideoElement | null>(null);
  const registerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fee collection form
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'Cash' | 'Card' | 'Online' | 'UPI'>('UPI');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Camera capture methods
  const startStudentCamera = async () => {
    setIsCapturingPhoto(true);
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      setTimeout(() => {
        if (registerVideoRef.current) {
          registerVideoRef.current.srcObject = stream;
          registerVideoRef.current.play().catch(e => console.error("Error playing student webcam:", e));
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(true);
    }
  };

  const stopStudentCamera = () => {
    if (registerVideoRef.current && registerVideoRef.current.srcObject) {
      const stream = registerVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      registerVideoRef.current.srcObject = null;
    }
    setIsCapturingPhoto(false);
  };

  const captureStudentPhoto = () => {
    const video = registerVideoRef.current;
    const canvas = registerCanvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, 320, 240);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoUrl(dataUrl);
        stopStudentCamera();
      }
    } else {
      // Fallback random mock educational avatar
      const mockAvatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
      ];
      setPhotoUrl(mockAvatars[Math.floor(Math.random() * mockAvatars.length)]);
      setIsCapturingPhoto(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const docName = formDocName.trim() || file.name;
        const newDoc = {
          id: 'doc-' + Date.now(),
          name: docName,
          type: formDocType,
          url: reader.result as string,
          uploadedAt: new Date().toISOString().split('T')[0]
        };
        setUploadedDocs(prev => [...prev, newDoc]);
        setFormDocName('');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedDoc = (docId: string) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== docId));
  };

  const handlePreviousClassPercentageChange = (val: string) => {
    setPreviousClassPercentage(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      if (num >= 95) {
        setConcessionApplied(true);
        setConcessionPercentage(25);
      } else if (num >= 90) {
        setConcessionApplied(true);
        setConcessionPercentage(15);
      } else if (num >= 80) {
        setConcessionApplied(true);
        setConcessionPercentage(10);
      } else {
        setConcessionApplied(false);
        setConcessionPercentage(0);
      }
    } else {
      setConcessionApplied(false);
      setConcessionPercentage(0);
    }
  };

  const toggleSubject = (subject: string) => {
    setSubjectsChosen(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const filteredStudents = React.useMemo(() => {
    return students.filter((student) => {
      const studentBatch = batches.find((b) => b.id === student.batchId);
      const batchName = studentBatch ? studentBatch.name.toLowerCase() : '';
      
      // Multi-factor search bar check
      const matchesSearch = !searchTerm ? true : (
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm) ||
        student.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batchName.includes(searchTerm.toLowerCase()) ||
        (student.admissionNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.enrollmentNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.aadharNumber || '').includes(searchTerm) ||
        (student.parentName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesBatch = selectedBatch === 'all' || student.batchId === selectedBatch;
      const matchesFees = feeStatusFilter === 'all' || student.feeStatus === feeStatusFilter;
      const matchesTab = subTab === 'active' ? !student.isAlumni : !!student.isAlumni;

      // Advanced sorting and filters
      const matchesClass = filterClass === 'all' || student.class === filterClass;
      const matchesSection = filterSection === 'all' || student.section === filterSection;
      const matchesCourse = filterCourse === 'all' || student.course === filterCourse;
      const matchesAcademicSession = filterAcademicSession === 'all' || student.academicYear === filterAcademicSession;
      const matchesGender = filterGender === 'all' || student.gender === filterGender;
      const matchesCategory = filterCategory === 'all' || student.category === filterCategory;
      const matchesEws = filterEws === 'all' || (filterEws === 'yes' ? !!student.ewsStatus : !student.ewsStatus);
      const matchesBpl = filterBpl === 'all' || (filterBpl === 'yes' ? !!student.bplStatus : !student.bplStatus);
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? !student.isAlumni : !!student.isAlumni);

      return (
        matchesSearch && 
        matchesBatch && 
        matchesFees && 
        matchesTab && 
        matchesClass && 
        matchesSection && 
        matchesCourse && 
        matchesAcademicSession && 
        matchesGender && 
        matchesCategory && 
        matchesEws && 
        matchesBpl && 
        matchesStatus
      );
    }).sort((a, b) => {
      if (sortBy === 'name-az') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'name-za') {
        return b.name.localeCompare(a.name);
      } else if (sortBy === 'roll') {
        return (a.rollNumber || '').localeCompare(b.rollNumber || '');
      } else if (sortBy === 'admission-date') {
        return (a.admissionDate || '').localeCompare(b.admissionDate || '');
      }
      return 0;
    });
  }, [
    students, batches, searchTerm, selectedBatch, feeStatusFilter, subTab,
    filterClass, filterSection, filterCourse, filterAcademicSession, filterGender,
    filterCategory, filterEws, filterBpl, filterStatus, sortBy
  ]);

  // Group alumni by year, then by batch name
  const alumniStudents = React.useMemo(() => {
    return students.filter(s => s.isAlumni);
  }, [students]);

  const groupedAlumni = React.useMemo(() => {
    return alumniStudents.reduce((acc, student) => {
      const year = student.alumniYear || String(new Date().getFullYear());
      const batch = student.alumniBatchName || 'JEE-2026 Elite A';
      if (!acc[year]) {
        acc[year] = {};
      }
      if (!acc[year][batch]) {
        acc[year][batch] = [];
      }
      acc[year][batch].push(student);
      return acc;
    }, {} as Record<string, Record<string, Student[]>>);
  }, [alumniStudents]);

  const getBatchName = (id: string) => {
    const b = batches.find((batch) => batch.id === id);
    return b ? b.name : 'Unassigned';
  };

  const getBase64ImageFromUrl = async (imgUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (imgUrl.startsWith('data:')) {
        resolve(imgUrl);
        return;
      }
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const dataURL = canvas.toDataURL('image/jpeg');
            resolve(dataURL);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = imgUrl;
    });
  };

  const drawFallbackAvatar = (doc: jsPDF, x: number, y: number, name: string) => {
    const radius = 10;
    const centerX = x + radius;
    const centerY = y + radius;
    
    doc.setFillColor(224, 231, 255);
    doc.circle(centerX, centerY, radius, 'F');
    
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
      
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text(initials, centerX, centerY + 3.5, { align: 'center' });
  };

  const drawStudentIdCardOnPdf = async (
    doc: jsPDF,
    student: Student,
    startX: number,
    startY: number
  ) => {
    const cardW = 54;
    const cardH = 86;
    const midX = startX + cardW;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(startX, startY, cardW * 2, cardH, 'S');

    doc.setLineDashPattern([2, 2], 0);
    doc.line(midX, startY, midX, startY + cardH);
    doc.setLineDashPattern([], 0);

    doc.setFillColor(79, 70, 229);
    doc.rect(startX, startY, cardW, 22, 'F');

    doc.setFillColor(245, 158, 11);
    doc.rect(startX, startY + 22, cardW, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('AI ACADEMY', startX + (cardW / 2), startY + 9, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text('LEADERSHIP & INNOVATION', startX + (cardW / 2), startY + 13, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('STUDENT IDENTITY CARD', startX + (cardW / 2), startY + 19, { align: 'center' });

    const photoX = startX + 17;
    const photoY = startY + 27.5;
    const photoW = 20;
    const photoH = 20;

    let photoLoaded = false;
    if (student.photoUrl) {
      try {
        const base64Img = await getBase64ImageFromUrl(student.photoUrl);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(1.5);
        doc.rect(photoX - 0.75, photoY - 0.75, photoW + 1.5, photoH + 1.5, 'S');
        doc.addImage(base64Img, 'JPEG', photoX, photoY, photoW, photoH);
        photoLoaded = true;
      } catch (err) {
        console.warn('Could not load student photo, falling back to initial badge:', err);
      }
    }

    if (!photoLoaded) {
      drawFallbackAvatar(doc, photoX, photoY, student.name);
    }

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    const nameLen = student.name.length;
    const nameFontSize = nameLen > 20 ? 8 : nameLen > 15 ? 9.5 : 11;
    doc.setFontSize(nameFontSize);
    doc.text(student.name.toUpperCase(), startX + (cardW / 2), startY + 53, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`ID: ${student.id}`, startX + (cardW / 2), startY + 57.5, { align: 'center' });

    const batchName = getBatchName(student.batchId);
    doc.setFillColor(238, 242, 255);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    const batchText = `BATCH: ${batchName.toUpperCase()}`;
    const badgeTextW = doc.getTextWidth(batchText);
    const badgeW = Math.min(badgeTextW + 5, 46);
    const badgeX = startX + (cardW / 2) - (badgeW / 2);
    
    doc.setDrawColor(199, 210, 254);
    doc.setLineWidth(0.5);
    doc.rect(badgeX, startY + 61, badgeW, 4.5, 'FD');

    doc.setTextColor(79, 70, 229);
    doc.text(batchText, startX + (cardW / 2), startY + 64.2, { align: 'center' });

    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.text('AUTHORIZED SIGNATURE', startX + 10, startY + 77);
    doc.text('ISSUE DATE', startX + cardW - 22, startY + 77);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(startX + 6, startY + 74, startX + 22, startY + 74);
    doc.line(startX + cardW - 24, startY + 74, startX + cardW - 6, startY + 74);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(student.admissionDate, startX + cardW - 15, startY + 73.5, { align: 'center' });

    doc.setFillColor(79, 70, 229);
    doc.rect(startX, startY + 82, cardW, 4, 'F');


    // BACK OF CARD
    doc.setFillColor(255, 255, 255);
    doc.rect(midX, startY, cardW, cardH, 'F');

    doc.setFillColor(248, 250, 252);
    doc.rect(midX, startY, cardW, 10, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(midX, startY + 10, midX + cardW, startY + 10);

    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('OFFICIAL RECORD & DETAILS', midX + (cardW / 2), startY + 6.5, { align: 'center' });

    const qrText = JSON.stringify({
      id: student.id,
      name: student.name,
      phone: student.phone,
      batch: batchName,
      admission: student.admissionDate
    });
    
    try {
      const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1 });
      doc.addImage(qrDataUrl, 'PNG', midX + 17, startY + 13, 20, 20);
    } catch (qrErr) {
      console.error('Error generating QR Code for ID card:', qrErr);
    }

    const detailsStartY = startY + 38;
    const lineGap = 4;
    doc.setFontSize(6.5);

    const drawBackDetail = (label: string, value: string, currentY: number) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(label, midX + 5, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      
      const availableWidth = cardW - 18;
      const lines = doc.splitTextToSize(value || 'N/A', availableWidth);
      
      if (lines.length > 1) {
        for (let i = 0; i < lines.length; i++) {
          doc.text(lines[i], midX + 18, currentY + (i * 3));
        }
        return lines.length * 3;
      } else {
        doc.text(value || 'N/A', midX + 18, currentY);
        return lineGap;
      }
    };

    let currentDetailY = detailsStartY;
    currentDetailY += drawBackDetail('Parent:', student.parentName, currentDetailY);
    currentDetailY += drawBackDetail('Phone:', student.phone, currentDetailY);
    
    const subjectsStr = student.subjectsChosen && student.subjectsChosen.length > 0 
      ? student.subjectsChosen.join(', ') 
      : 'None';
    currentDetailY += drawBackDetail('Subjects:', subjectsStr, currentDetailY);
    
    drawBackDetail('Address:', student.address || 'No address recorded', currentDetailY);

    doc.setFillColor(254, 243, 199);
    doc.rect(midX + 4, startY + 70, cardW - 8, 8, 'F');
    doc.setDrawColor(252, 211, 77);
    doc.setLineWidth(0.3);
    doc.rect(midX + 4, startY + 70, cardW - 8, 8, 'S');

    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5);
    doc.text('IF FOUND, PLEASE RETURN TO:', midX + (cardW / 2), startY + 73, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('AI ACADEMY CENTER OFFICE', midX + (cardW / 2), startY + 76, { align: 'center' });

    doc.setFillColor(15, 23, 42);
    doc.rect(midX, startY + 82, cardW, 4, 'F');
  };

  const handleDownloadSingleIdCard = async (student: Student) => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('AI ACADEMY STUDENT CARD PRINT-OUT', 105, 25, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Please print this document on thick cardstock paper (250-300 GSM), cut along the outer solid border,', 105, 31, { align: 'center' });
      doc.text('fold down the center dashed guideline, and laminate for a professional finished ID card.', 105, 35, { align: 'center' });

      const x = 51;
      const y = 50;
      await drawStudentIdCardOnPdf(doc, student, x, y);

      const fileName = `${student.name.replace(/\s+/g, '_')}_ID_Card.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Error generating PDF ID card:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadBatchIdCards = async () => {
    if (filteredStudents.length === 0) {
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let index = 0; index < filteredStudents.length; index++) {
        const student = filteredStudents[index];
        const pageIndex = Math.floor(index / 2);
        const cardPositionOnPage = index % 2;

        if (index > 0 && cardPositionOnPage === 0) {
          doc.addPage();
        }

        if (cardPositionOnPage === 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.setTextColor(30, 41, 59);
          doc.text(`AI ACADEMY BATCH PRINT-OUT - PAGE ${pageIndex + 1}`, 105, 18, { align: 'center' });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text('Print on heavy cardstock. Cut along solid border lines and fold down the middle dashed lines.', 105, 23, { align: 'center' });
        }

        const startX = 51;
        const startY = cardPositionOnPage === 0 ? 30 : 135;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(79, 70, 229);
        doc.text(`CARD #${index + 1}: ${student.name.toUpperCase()} (ID: ${student.id})`, startX, startY - 2.5);

        await drawStudentIdCardOnPdf(doc, student, startX, startY);
      }

      const fileName = `AI_Academy_Batch_ID_Cards.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Error generating batch PDF ID cards:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportStudentCSV = () => {
    if (filteredStudents.length === 0) {
      if (showToast) showToast("No students to export", "Try loosening your filters to see more students.");
      else alert('No students match your active filters to export.');
      return;
    }
    const csvRows = [
      ["Student ID", "Name", "Email", "Phone", "Parent Name", "Parent Phone", "Parent Email", "Batch", "Admission Date", "Fee Status", "Total Paid", "Total Due", "Address"]
    ];
    filteredStudents.forEach(st => {
      const batchObj = batches.find(b => b.id === st.batchId);
      const batchName = batchObj ? batchObj.name : st.batchId;
      csvRows.push([
        st.id,
        st.name,
        st.email,
        st.phone,
        st.parentName,
        st.parentPhone || '',
        st.parentEmail || '',
        batchName,
        st.admissionDate,
        st.feeStatus,
        String(st.totalFeesPaid),
        String(st.totalFeesDue),
        st.address ? st.address.replace(/\n/g, ' ') : ''
      ]);
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LearnersDen_Student_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (showToast) {
      showToast("Directory Exported", `Successfully exported ${filteredStudents.length} student records to CSV.`);
    }
  };

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setPhone('');
    setParentName('');
    setBatchId(batches[0]?.id || '');
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setFeeStatus('Pending');
    setInitialFeesDue('1500');
    setAddress('');
    setParentPhone('');
    setParentEmail('');
    setPhotoUrl('');
    setSubjectsChosen([]);
    setPreviousClassPercentage('');
    setConcessionApplied(false);
    setConcessionPercentage(0);
    setFatherName('');
    setMotherName('');
    setAadharNumber('');
    setEwsStatus(false);
    setBplStatus(false);
    setUploadedDocs([]);
    setFormDocType('Aadhaar Card');
    setFormDocName('');
    
    // Clear communication states
    setStudentWhatsApp('');
    setFatherPhoneState('');
    setFatherWhatsApp('');
    setFatherEmail('');
    setMotherPhoneState('');
    setMotherWhatsApp('');
    setMotherEmail('');
    setGuardianName('');
    setGuardianPhone('');
    setGuardianWhatsApp('');
    setGuardianEmail('');
    
    setIsAdding(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone);
    setParentName(student.parentName);
    setBatchId(student.batchId);
    setAdmissionDate(student.admissionDate);
    setFeeStatus(student.feeStatus);
    setAddress(student.address || '');
    setParentPhone(student.parentPhone || '');
    setParentEmail(student.parentEmail || '');
    setPhotoUrl(student.photoUrl || '');
    setSubjectsChosen(student.subjectsChosen || []);
    setPreviousClassPercentage(student.previousClassPercentage !== undefined ? String(student.previousClassPercentage) : '');
    setConcessionApplied(student.concessionApplied || false);
    setConcessionPercentage(student.concessionPercentage || 0);
    setFatherName(student.fatherName || '');
    setMotherName(student.motherName || '');
    setAadharNumber(student.aadharNumber || '');
    setEwsStatus(student.ewsStatus || false);
    setBplStatus(student.bplStatus || false);
    setUploadedDocs(student.documents || []);
    setFormDocType('Aadhaar Card');
    setFormDocName('');

    // Populate communication states
    setStudentWhatsApp(student.whatsAppNumber || '');
    setFatherPhoneState(student.fatherPhone || '');
    setFatherWhatsApp(student.fatherWhatsApp || '');
    setFatherEmail(student.fatherEmail || '');
    setMotherPhoneState(student.motherPhone || '');
    setMotherWhatsApp(student.motherWhatsApp || '');
    setMotherEmail(student.motherEmail || '');
    setGuardianName(student.guardianName || '');
    setGuardianPhone(student.guardianPhone || '');
    setGuardianWhatsApp(student.guardianWhatsApp || '');
    setGuardianEmail(student.guardianEmail || '');
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    if (!phone && !parentPhone) {
      alert("Validation Error: Please provide either a Student Phone Number or a Parent Phone Number so we can link communications.");
      return;
    }
    await onAddStudent({
      name,
      email,
      phone: phone || '',
      parentName,
      batchId,
      admissionDate,
      feeStatus,
      address,
      parentPhone,
      parentEmail,
      photoUrl,
      subjectsChosen,
      previousClassPercentage: previousClassPercentage ? Number(previousClassPercentage) : undefined,
      concessionApplied,
      concessionPercentage: concessionPercentage === '' ? undefined : Number(concessionPercentage),
      fatherName,
      motherName,
      aadharNumber,
      ewsStatus,
      bplStatus,
      documents: uploadedDocs,
      whatsAppNumber: studentWhatsApp,
      fatherPhone: fatherPhone,
      fatherWhatsApp: fatherWhatsApp,
      fatherEmail: fatherEmail,
      motherPhone: motherPhone,
      motherWhatsApp: motherWhatsApp,
      motherEmail: motherEmail,
      guardianName: guardianName,
      guardianPhone: guardianPhone,
      guardianWhatsApp: guardianWhatsApp,
      guardianEmail: guardianEmail
    });
    setIsAdding(false);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!phone && !parentPhone) {
      alert("Validation Error: Please provide either a Student Phone Number or a Parent Phone Number so we can link communications.");
      return;
    }
    await onUpdateStudent(editingStudent.id, {
      name,
      email,
      phone: phone || '',
      parentName,
      batchId,
      admissionDate,
      feeStatus,
      address,
      parentPhone,
      parentEmail,
      photoUrl,
      subjectsChosen,
      previousClassPercentage: previousClassPercentage ? Number(previousClassPercentage) : undefined,
      concessionApplied,
      concessionPercentage: concessionPercentage === '' ? undefined : Number(concessionPercentage),
      fatherName,
      motherName,
      aadharNumber,
      ewsStatus,
      bplStatus,
      documents: uploadedDocs,
      whatsAppNumber: studentWhatsApp,
      fatherPhone: fatherPhone,
      fatherWhatsApp: fatherWhatsApp,
      fatherEmail: fatherEmail,
      motherPhone: motherPhone,
      motherWhatsApp: motherWhatsApp,
      motherEmail: motherEmail,
      guardianName: guardianName,
      guardianPhone: guardianPhone,
      guardianWhatsApp: guardianWhatsApp,
      guardianEmail: guardianEmail
    });
    setEditingStudent(null);
  };

  const [isGraduatingBatch, setIsGraduatingBatch] = useState(false);
  const [graduateBatchId, setGraduateBatchId] = useState('');
  const [graduationYear, setGraduationYear] = useState(String(new Date().getFullYear()));
  const [graduatingStudentId, setGraduatingStudentId] = useState<string | null>(null);
  const [singleGraduationYear, setSingleGraduationYear] = useState(String(new Date().getFullYear()));

  const handleGraduateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!graduateBatchId) return;
    const batchToGraduate = batches.find(b => b.id === graduateBatchId);
    if (!batchToGraduate) return;
    
    const studentsInBatch = students.filter(s => s.batchId === graduateBatchId && !s.isAlumni);
    if (studentsInBatch.length === 0) {
      alert("No active students found in this batch to graduate!");
      return;
    }
    
    if (confirm(`Are you sure you want to graduate all ${studentsInBatch.length} students in "${batchToGraduate.name}"?`)) {
      for (const student of studentsInBatch) {
        await onUpdateStudent(student.id, {
          isAlumni: true,
          alumniYear: graduationYear,
          alumniBatchName: batchToGraduate.name
        });
      }
      setIsGraduatingBatch(false);
      setGraduateBatchId('');
    }
  };

  const handleGraduateSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!graduatingStudentId) return;
    const student = students.find(s => s.id === graduatingStudentId);
    if (!student) return;
    const batchName = getBatchName(student.batchId);
    await onUpdateStudent(student.id, {
      isAlumni: true,
      alumniYear: singleGraduationYear,
      alumniBatchName: batchName
    });
    setGraduatingStudentId(null);
  };

  const submitCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingFeesId || !payAmount) return;
    await onCollectFees(collectingFeesId, Number(payAmount), payMode);
    setCollectingFeesId(null);
    setPayAmount('');
  };

  // Helper functions for custom dynamic student profile tabs
  const getStudentAttendance = (studentId: string) => {
    if (attendanceLogs[studentId]) return attendanceLogs[studentId];
    return [
      { date: '2026-07-06', status: 'Present' as const, remarks: 'Active engagement in Physics mock revision.' },
      { date: '2026-07-04', status: 'Present' as const, remarks: 'Very good score in homework quiz.' },
      { date: '2026-07-02', status: 'Late' as const, remarks: 'Arrived 15 minutes late due to monsoon rain traffic.' },
      { date: '2026-06-30', status: 'Present' as const, remarks: 'Solved advanced organic mechanisms on board.' },
      { date: '2026-06-28', status: 'Absent' as const, remarks: 'Prior notice: Family social obligation.' },
      { date: '2026-06-25', status: 'Present' as const, remarks: 'Punctual, excellent question queries.' },
    ];
  };

  const getStudentResults = (studentId: string) => {
    if (studentResults[studentId]) return studentResults[studentId];
    return [
      { id: 'r1', examName: 'IIT-JEE Mock Series - Mechanics-II', subject: 'Physics', date: '2026-06-28', marksObtained: 85, maxMarks: 100, remarks: 'Excellent performance in Rotational Dynamics.' },
      { id: 'r2', examName: 'IIT-JEE Mock Series - Thermodynamics', subject: 'Chemistry', date: '2026-06-28', marksObtained: 72, maxMarks: 100, remarks: 'Slight review needed on entropy formulas.' },
      { id: 'r3', examName: 'IIT-JEE Mock Series - Integration Methods', subject: 'Mathematics', date: '2026-06-28', marksObtained: 91, maxMarks: 100, remarks: 'Phenomenal Calculus skills displayed.' },
    ];
  };

  const getStudentCommunications = (studentId: string) => {
    if (communicationLogs[studentId]) return communicationLogs[studentId];
    return [
      { id: 'c1', date: '2026-07-05 10:30', mode: 'WhatsApp', recipient: 'Parent', messageBody: 'Dear Parent, Your ward has successfully scored 82.6% average in Mock Exam Series 1. Progress Report sent to mail.', status: 'Delivered' },
      { id: 'c2', date: '2026-07-01 09:00', mode: 'SMS', recipient: 'Student', messageBody: 'Class Timetable Update: Chemistry Shift changed to 4:00 PM for Alpha Section.', status: 'Delivered' },
      { id: 'c3', date: '2026-06-25 18:45', mode: 'Email', recipient: 'Parent', messageBody: 'Invoice Receipt #LD-FEE-9821 of ₹12,000 tuition fees has been generated and approved.', status: 'Sent' },
    ];
  };

  const handleAddAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingStudent) return;
    const studentId = viewingStudent.id;
    const currentList = getStudentAttendance(studentId);
    const newList = [{ date: newAttDate, status: newAttStatus, remarks: newAttRemarks || 'Recorded via Portal' }, ...currentList];
    setAttendanceLogs(prev => ({ ...prev, [studentId]: newList }));
    setNewAttRemarks('');
    showToast("Attendance Recorded", `Marked student as ${newAttStatus} for ${newAttDate}.`);
  };

  const handleAddResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingStudent) return;
    if (!newResultExam.trim()) {
      alert("Please specify exam description");
      return;
    }
    const studentId = viewingStudent.id;
    const currentList = getStudentResults(studentId);
    const newRecord = {
      id: `res-${Date.now()}`,
      examName: newResultExam,
      subject: newResultSubject,
      date: newResultDate,
      marksObtained: Number(newResultObtained) || 0,
      maxMarks: Number(newResultMax) || 100,
      remarks: newResultRemarks || 'Graded successfully by faculty'
    };
    setStudentResults(prev => ({ ...prev, [studentId]: [newRecord, ...currentList] }));
    setNewResultExam('');
    setNewResultObtained('');
    setNewResultRemarks('');
    showToast("Result Added", `Added mock exam score of ${newRecord.marksObtained}/${newRecord.maxMarks} for ${newResultSubject}.`);
  };

  const handleSendCommMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingStudent) return;
    if (!newCommMessage.trim()) {
      alert("Please enter a notice message body.");
      return;
    }
    const studentId = viewingStudent.id;
    const currentList = getStudentCommunications(studentId);
    const newRecord = {
      id: `comm-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      mode: newCommMode,
      recipient: newCommRecipient,
      messageBody: newCommMessage,
      status: 'Sent'
    };
    setCommunicationLogs(prev => ({ ...prev, [studentId]: [newRecord, ...currentList] }));
    setNewCommMessage('');
    showToast("Notice Dispatched", `Simulated outbound ${newCommMode} alert sent to ${newCommRecipient}.`);
  };

  const handleGenerateCertificate = (type: string, student: Student) => {
    // Landscape A4 size (297 x 210)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const w = 297;
    const h = 210;

    // Background color (very light cream)
    doc.setFillColor(254, 253, 250);
    doc.rect(0, 0, w, h, 'F');

    // Outer indigo border
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, w - 20, h - 20, 'D');

    // Inner gold border
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.6);
    doc.rect(12, 12, w - 24, h - 24, 'D');

    // Decorative corner lines
    doc.setDrawColor(217, 119, 6);
    doc.line(10, 18, 18, 10);
    doc.line(w - 10, 18, w - 18, 10);
    doc.line(10, h - 18, 18, h - 10);
    doc.line(w - 10, h - 18, w - 18, h - 10);

    // Header Title
    doc.setTextColor(30, 41, 59);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("LEARNER'S DEN ACADEMIC COOPERATIVE", w / 2, 28, { align: 'center' });

    doc.setTextColor(217, 119, 6);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'italic');
    doc.text("Estd 2018 | Premium National-Level Offline Coaching Institute", w / 2, 34, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(50, 39, w - 50, 39);

    doc.setTextColor(79, 70, 229);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    
    let certTitle = "";
    let certBody1 = "";
    let certBody2 = "";
    let certBody3 = "";

    if (type === 'admission') {
      certTitle = "OFFICIAL ADMISSION CONFIRMATION";
      certBody1 = "This is officially certified and recorded that our student";
      certBody2 = student.name.toUpperCase();
      certBody3 = `has been enrolled in the intensive offline classroom batch "${getBatchName(student.batchId)}" under secure registration ID ${student.id} with admission verified on ${student.admissionDate}.`;
    } else if (type === 'completion') {
      certTitle = "COACHING COMPLETION CREDENTIAL";
      certBody1 = "This certifies and honors that our dedicated learner";
      certBody2 = student.name.toUpperCase();
      certBody3 = `has successfully completed the complete preparation modules, mock testing curriculum, and evaluation syllabus for "${getBatchName(student.batchId)}" with exceptional diligence and merit.`;
    } else {
      certTitle = "AWARD FOR ACADEMIC EXCELLENCE & SCHOLARSHIP";
      certBody1 = "This prestigious award is proudly conferred to";
      certBody2 = student.name.toUpperCase();
      certBody3 = `for securing outstanding merit standing in national mock test evaluations under Batch "${getBatchName(student.batchId)}" and qualifying for an official merit concession of ${student.concessionPercentage || 15}% tuition fees reward.`;
    }

    doc.text(certTitle, w / 2, 54, { align: 'center' });

    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(13);
    doc.text(certBody1, w / 2, 70, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(certBody2, w / 2, 88, { align: 'center' });

    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(1.0);
    doc.line(w / 2 - 60, 93, w / 2 + 60, 93);

    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const splitBody = doc.splitTextToSize(certBody3, 200);
    doc.text(splitBody, w / 2, 108, { align: 'center' });

    // Golden & Crimson seal stamp
    const sealX = w / 2;
    const sealY = 148;
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(1.5);
    doc.setFillColor(254, 243, 199);
    doc.circle(sealX, sealY, 14, 'FD');

    doc.setDrawColor(185, 28, 28);
    doc.setLineWidth(0.5);
    doc.circle(sealX, sealY, 11, 'D');

    doc.setTextColor(185, 28, 28);
    doc.setFontSize(7);
    doc.setFont('Helvetica', 'bold');
    doc.text("OFFICIAL", sealX, sealY - 1.5, { align: 'center' });
    doc.text("SEAL", sealX, sealY + 2.5, { align: 'center' });

    // Signature lines
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');

    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.5);
    doc.line(30, 168, 90, 168);
    doc.text("OFFICE REGISTRAR", 60, 174, { align: 'center' });
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8);
    doc.text("Sign: L. Deshmukh", 60, 164, { align: 'center' });

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.line(w - 90, 168, w - 30, 168);
    doc.text("ACADEMIC DIRECTOR", w - 60, 174, { align: 'center' });
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8);
    doc.text("Sign: Prof. S. Sen", w - 60, 164, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Issue Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, w / 2, 185, { align: 'center' });

    doc.save(`${student.name.replace(/\s+/g, '_')}_Certificate_${type}.pdf`);
    showToast("Certificate Downloaded", `Official PDF of ${type} has been downloaded.`);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs for Active Admissions & Alumni Section */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSubTab('active')}
          className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'active'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Active Admissions ({students.filter(s => !s.isAlumni).length})</span>
        </button>
        <button
          onClick={() => setSubTab('alumni')}
          className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'alumni'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Alumni Directory ({students.filter(s => s.isAlumni).length})</span>
        </button>
      </div>

      {/* Simulated RBAC Role Selector Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg border border-slate-800">
        <div className="flex items-center gap-3 text-left">
          <div className="h-9 w-9 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/25 shrink-0">
            <Lock className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400">Simulated Role-Based Access Control (RBAC)</p>
            <p className="text-xs text-slate-300 font-bold mt-0.5">Switch simulated roles below to experience dynamic clearance levels across the student registries.</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/60 shrink-0">
          {(['admin', 'lecturer', 'front_office'] as const).map(role => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setSimulatedRole(role);
                showToast("Simulated Role Updated", `Shifted authorization view to ${role.toUpperCase().replace('_', ' ')}.`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xxs font-black transition-all cursor-pointer capitalize ${
                simulatedRole === role
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Action / Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 md:w-64 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, roll, admn, parent, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
              />
            </div>

            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-bold focus:outline-hidden"
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              value={feeStatusFilter}
              onChange={(e) => setFeeStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-bold focus:outline-hidden"
            >
              <option value="all">All Fee Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-bold focus:outline-hidden"
              title="Sort Results"
            >
              <option value="name-az">Name (A-Z)</option>
              <option value="name-za">Name (Z-A)</option>
              <option value="roll">Roll Number</option>
              <option value="admission-date">Admission Date</option>
            </select>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showAdvancedFilters 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Advanced Filters</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 w-full xl:w-auto">
            {subTab === 'active' && (
              <button
                type="button"
                onClick={() => setIsGraduatingBatch(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Graduate an entire student batch once the course is over"
              >
                <Award className="h-4 w-4 text-amber-600 animate-pulse" />
                <span>Graduate Batch</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadBatchIdCards}
              disabled={isGeneratingPdf || filteredStudents.length === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                isGeneratingPdf || filteredStudents.length === 0
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
              title="Download printable PDF ID cards with QR codes for all filtered students"
            >
              {isGeneratingPdf ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
              ) : (
                <IdCard className="h-4 w-4" />
              )}
              <span>Batch ID Cards ({filteredStudents.length})</span>
            </button>

            <button
              type="button"
              onClick={handleExportStudentCSV}
              disabled={filteredStudents.length === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                filteredStudents.length === 0
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
              }`}
              title="Export dynamic filtered directory list as Excel/Google Sheets compatible CSV"
            >
              <Download className="h-4 w-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              id="btn-add-student"
            >
              <UserPlus className="h-4 w-4" />
              <span>New Admission</span>
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-fadeIn text-[11px] font-semibold text-slate-600">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Standard/Class</label>
              <select
                value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">All Classes</option>
                <option value="Class IX">Class IX</option>
                <option value="Class X">Class X</option>
                <option value="Class XI">Class XI</option>
                <option value="Class XII">Class XII</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Section</label>
              <select
                value={filterSection}
                onChange={e => setFilterSection(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Course / Stream</label>
              <select
                value={filterCourse}
                onChange={e => setFilterCourse(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">All Courses</option>
                <option value="JEE Focus">JEE Focus</option>
                <option value="NEET Prep">NEET Prep</option>
                <option value="CBSE Board Elite">CBSE Board Elite</option>
                <option value="COHSEM Science">COHSEM Science</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Academic Session</label>
              <select
                value={filterAcademicSession}
                onChange={e => setFilterAcademicSession(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">All Sessions</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Gender</label>
              <select
                value={filterGender}
                onChange={e => setFilterGender(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">All Categories</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">EWS Status</label>
              <select
                value={filterEws}
                onChange={e => setFilterEws(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">All Students</option>
                <option value="yes">Economically Weaker (EWS)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">BPL Status</label>
              <select
                value={filterBpl}
                onChange={e => setFilterBpl(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">All Students</option>
                <option value="yes">Below Poverty Line (BPL)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">All Registry Status</option>
                <option value="active">Active Students</option>
                <option value="inactive">Graduated/Alumni</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setFilterClass('all');
                  setFilterSection('all');
                  setFilterCourse('all');
                  setFilterAcademicSession('all');
                  setFilterGender('all');
                  setFilterCategory('all');
                  setFilterEws('all');
                  setFilterBpl('all');
                  setFilterStatus('all');
                  setSortBy('name-az');
                }}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2.5">
                <UserPlus className="h-5 w-5" />
                <span>Register New Student (Admissions Registry)</span>
              </h3>
              <button 
                onClick={() => {
                  stopStudentCamera();
                  setIsAdding(false);
                }} 
                className="text-indigo-100 hover:text-white text-xs font-bold bg-indigo-700/50 hover:bg-indigo-700 p-1.5 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={submitAdd} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN: STUDENT PROFILE & CORE INFO */}
                <div className="space-y-4.5">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Student Photograph</h4>
                    
                    <div className="flex items-center gap-5">
                      <div 
                        onDragOver={handleDragOverPhoto}
                        onDragLeave={handleDragLeavePhoto}
                        onDrop={handleDropPhoto}
                        className={`relative h-24 w-24 rounded-full overflow-hidden border-2 transition-all duration-200 shrink-0 flex flex-col items-center justify-center shadow-md group ${
                          isDraggingPhoto 
                            ? 'border-indigo-500 bg-indigo-50/50 scale-105 shadow-lg' 
                            : 'border-slate-200 bg-slate-100 hover:border-indigo-400'
                        }`}
                      >
                        {photoUrl ? (
                          <>
                            <img referrerPolicy="no-referrer" src={photoUrl} alt="Preview" className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-black uppercase tracking-wider cursor-pointer">
                              <Upload className="h-4 w-4 mb-1" />
                              <span>Replace</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-2 flex flex-col items-center justify-center cursor-pointer">
                            <User className="h-6 w-6 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Drag Here</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={isCapturingPhoto ? stopStudentCamera : startStudentCamera}
                              className="flex-1 py-2 px-3 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                            >
                              <Camera className="h-3.5 w-3.5" />
                              <span>{isCapturingPhoto ? 'Stop Video' : 'Use Camera'}</span>
                            </button>
                            <label className="flex-1 py-2 px-3 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center active:scale-98">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Upload Pic</span>
                              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                            </label>
                          </div>
                          {photoUrl && (
                            <button
                              type="button"
                              onClick={() => setPhotoUrl('')}
                              className="w-full py-1 text-[9px] font-black text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg uppercase tracking-wider transition-all"
                            >
                              Remove Picture
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold leading-normal">
                          {isDraggingPhoto ? (
                            <span className="text-indigo-600 animate-pulse font-black uppercase tracking-wider">Drop file to attach!</span>
                          ) : (
                            <span>Drag and drop profile picture here, capture frame via live webcam feed, or upload directly.</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Camera Viewfinder */}
                    {isCapturingPhoto && (
                      <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-2 relative">
                        <div className="aspect-video relative rounded-lg overflow-hidden flex items-center justify-center bg-black">
                          {!cameraError ? (
                            <video ref={registerVideoRef} className="w-full h-full object-cover" playsInline muted />
                          ) : (
                            <div className="text-center p-4 text-xxs text-slate-500 font-medium">
                              <Camera className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                              <p>Webcam Blocked / Unavailable</p>
                              <button
                                type="button"
                                onClick={captureStudentPhoto}
                                className="mt-2.5 px-3 py-1 bg-indigo-600 text-white font-bold rounded-md"
                              >
                                Simulate Profile Pic
                              </button>
                            </div>
                          )}
                          <div className="absolute inset-0 border border-indigo-500/25 pointer-events-none" />
                        </div>
                        {!cameraError && (
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={captureStudentPhoto}
                              className="flex-1 py-1 px-3 bg-indigo-600 text-white font-bold text-[10px] rounded-lg active:scale-98"
                            >
                              Capture Photo Frame
                            </button>
                            <button
                              type="button"
                              onClick={stopStudentCamera}
                              className="py-1 px-3 bg-slate-800 text-slate-300 hover:text-white font-bold text-[10px] rounded-lg active:scale-98"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        <canvas ref={registerCanvasRef} width="320" height="240" className="hidden" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Student Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Email ID</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Phone Number (Optional)</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          placeholder="Student's Mobile"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Student WhatsApp (Optional)</label>
                        <input
                          type="tel"
                          value={studentWhatsApp}
                          onChange={(e) => setStudentWhatsApp(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          placeholder="Student's WhatsApp Number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Subjects Chosen</span>
                      </label>
                      <p className="text-[10px] text-slate-400 mb-1.5">Select coaching programs student is enrolling for.</p>
                      <div className="flex flex-wrap gap-2 p-3 border border-slate-200/80 bg-slate-50 rounded-2xl">
                        {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'].map((sub) => {
                          const selected = subjectsChosen.includes(sub);
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => toggleSubject(sub)}
                              className={`px-3 py-1.5 rounded-xl text-xxs font-bold border transition-all cursor-pointer active:scale-98 ${
                                selected
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-black'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                              }`}
                            >
                              {sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Government Records & Welfare Status */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span>Government Records & Welfare</span>
                    </h4>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Aadhaar Number</label>
                      <input
                        type="text"
                        value={aadharNumber}
                        onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold"
                        placeholder="12-digit Aadhaar No."
                        maxLength={12}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 p-2 border border-slate-200 bg-white rounded-xl cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={ewsStatus}
                          onChange={(e) => setEwsStatus(e.target.checked)}
                          className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xxs font-black text-slate-700">EWS Candidate</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 border border-slate-200 bg-white rounded-xl cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={bplStatus}
                          onChange={(e) => setBplStatus(e.target.checked)}
                          className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xxs font-black text-slate-700">BPL Category</span>
                      </label>
                    </div>
                  </div>

                  {/* Documents Attachment Registry */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-emerald-500" />
                      <span>Documents Registry</span>
                    </h4>
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Doc Type</label>
                          <select
                            value={formDocType}
                            onChange={(e) => setFormDocType(e.target.value)}
                            className="w-full text-[10px] px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold focus:outline-hidden"
                          >
                            <option value="Aadhaar Card">Aadhaar Card</option>
                            <option value="Birth Certificate">Birth Certificate</option>
                            <option value="Income Certificate">Income Certificate</option>
                            <option value="Marksheet">Marksheet</option>
                            <option value="Transfer Certificate">Transfer Certificate</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Custom Name (Optional)</label>
                          <input
                            type="text"
                            value={formDocName}
                            onChange={(e) => setFormDocName(e.target.value)}
                            placeholder="e.g. My Aadhaar"
                            className="w-full text-[10px] px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold focus:outline-hidden"
                          />
                        </div>
                      </div>
                      <label className="flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-slate-300 bg-white hover:bg-slate-50 text-[10px] font-bold rounded-lg text-slate-600 transition-all cursor-pointer">
                        <Upload className="h-3 w-3 text-indigo-500" />
                        <span>Select Document File</span>
                        <input type="file" onChange={handleDocUpload} className="hidden" />
                      </label>
                    </div>

                    {uploadedDocs.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Staged Documents ({uploadedDocs.length})</p>
                        <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                          {uploadedDocs.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-1.5 bg-white border border-slate-100 rounded-lg text-xxs">
                              <div className="truncate flex-1 min-w-0 mr-2">
                                <span className="font-extrabold text-indigo-600 mr-1">[{doc.type}]</span>
                                <span className="text-slate-700 font-medium">{doc.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeUploadedDoc(doc.id)}
                                className="text-[10px] text-red-500 hover:text-red-700 font-black px-1.5"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* RIGHT COLUMN: RESIDENTIAL, PARENT INFO & CONCESSIONS */}
                <div className="space-y-4.5">
                  <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-3.5">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Parent / Guardian Dossier</h4>
                    
                    {/* Father's Profile */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                        <Users className="h-3 w-3 text-indigo-500" />
                        <span>Father's Details</span>
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Father's Name</label>
                          <input
                            type="text"
                            value={fatherName}
                            onChange={(e) => setFatherName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            placeholder="Father's Full Name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Father's Phone</label>
                          <input
                            type="tel"
                            value={fatherPhone}
                            onChange={(e) => setFatherPhoneState(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Father's Mobile"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Father's WhatsApp</label>
                          <input
                            type="tel"
                            value={fatherWhatsApp}
                            onChange={(e) => setFatherWhatsApp(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Father's WhatsApp"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Father's Email</label>
                          <input
                            type="email"
                            value={fatherEmail}
                            onChange={(e) => setFatherEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Father's Email ID"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mother's Profile */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-[10px] font-bold text-pink-600 uppercase tracking-wider flex items-center gap-1">
                        <Users className="h-3 w-3 text-pink-500" />
                        <span>Mother's Details</span>
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Mother's Name</label>
                          <input
                            type="text"
                            value={motherName}
                            onChange={(e) => setMotherName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            placeholder="Mother's Full Name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Mother's Phone</label>
                          <input
                            type="tel"
                            value={motherPhone}
                            onChange={(e) => setMotherPhoneState(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Mother's Mobile"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Mother's WhatsApp</label>
                          <input
                            type="tel"
                            value={motherWhatsApp}
                            onChange={(e) => setMotherWhatsApp(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Mother's WhatsApp"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Mother's Email</label>
                          <input
                            type="email"
                            value={motherEmail}
                            onChange={(e) => setMotherEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Mother's Email ID"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guardian's Profile */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                        <Users className="h-3 w-3 text-amber-500" />
                        <span>Guardian's Details (Alternative)</span>
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Guardian Name</label>
                          <input
                            type="text"
                            value={guardianName}
                            onChange={(e) => setGuardianName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            placeholder="Guardian Full Name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Guardian Phone</label>
                          <input
                            type="tel"
                            value={guardianPhone}
                            onChange={(e) => setGuardianPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Guardian Mobile"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Guardian WhatsApp</label>
                          <input
                            type="tel"
                            value={guardianWhatsApp}
                            onChange={(e) => setGuardianWhatsApp(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Guardian WhatsApp"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Guardian Email</label>
                          <input
                            type="email"
                            value={guardianEmail}
                            onChange={(e) => setGuardianEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Guardian Email ID"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Primary/Legacy Contact */}
                    <div className="border-t border-slate-200 pt-3 space-y-3">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Primary System Contact Link</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Parent Name</label>
                          <input
                            type="text"
                            required
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. David Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Parent Phone (Required)</label>
                          <input
                            type="tel"
                            required
                            value={parentPhone}
                            onChange={(e) => setParentPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                            placeholder="Primary Parent Mobile"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Parent Email</label>
                        <input
                          type="email"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                          placeholder="Primary Parent Email ID"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Home className="h-3.5 w-3.5 text-slate-400" />
                      <span>Residential Address</span>
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      placeholder="Enter student's home or boarding address details..."
                    />
                  </div>

                  <div className="p-4 bg-amber-50/40 border border-amber-200/60 rounded-2xl space-y-3">
                    <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>Prior Academic Marks & Concessions</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Prev. Class Marks (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={previousClassPercentage}
                          onChange={(e) => handlePreviousClassPercentageChange(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-extrabold text-slate-800"
                          placeholder="e.g. 92"
                        />
                      </div>

                      <div className="flex flex-col justify-end pb-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="concessionApplied"
                            checked={concessionApplied}
                            onChange={(e) => setConcessionApplied(e.target.checked)}
                            className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <label htmlFor="concessionApplied" className="text-xxs font-black text-slate-700 cursor-pointer">Apply Concession</label>
                        </div>
                      </div>
                    </div>

                    {concessionApplied && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div>
                          <label className="block text-[9px] font-black text-amber-600 uppercase tracking-wider mb-1">Scholarship / Discount (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={concessionPercentage}
                            onChange={(e) => setConcessionPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full px-3 py-1.5 border border-amber-200 rounded-xl text-xs bg-white font-black text-amber-700"
                            placeholder="Discount Percent"
                          />
                        </div>
                        <p className="text-[9px] text-amber-800 font-medium italic">
                          *System auto-calculated concession based on high merit scoring!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Batch Allocation</label>
                      <select
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 font-bold"
                      >
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Admission Date</label>
                      <input
                        type="date"
                        required
                        value={admissionDate}
                        onChange={(e) => setAdmissionDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 font-bold"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex gap-4 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    stopStudentCamera();
                    setIsAdding(false);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-98"
                >
                  Submit Registration File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2.5">
                <Edit2 className="h-5 w-5" />
                <span>Edit Student Profile File</span>
              </h3>
              <button 
                onClick={() => {
                  stopStudentCamera();
                  setEditingStudent(null);
                }} 
                className="text-indigo-100 hover:text-white text-xs font-bold bg-indigo-700/50 hover:bg-indigo-700 p-1.5 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={submitEdit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN: STUDENT PROFILE & CORE INFO */}
                <div className="space-y-4.5">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Student Photograph</h4>
                    
                    <div className="flex items-center gap-5">
                      <div 
                        onDragOver={handleDragOverPhoto}
                        onDragLeave={handleDragLeavePhoto}
                        onDrop={handleDropPhoto}
                        className={`relative h-24 w-24 rounded-full overflow-hidden border-2 transition-all duration-200 shrink-0 flex flex-col items-center justify-center shadow-md group ${
                          isDraggingPhoto 
                            ? 'border-indigo-500 bg-indigo-50/50 scale-105 shadow-lg' 
                            : 'border-slate-200 bg-slate-100 hover:border-indigo-400'
                        }`}
                      >
                        {photoUrl ? (
                          <>
                            <img referrerPolicy="no-referrer" src={photoUrl} alt="Preview" className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-black uppercase tracking-wider cursor-pointer">
                              <Upload className="h-4 w-4 mb-1" />
                              <span>Replace</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-2 flex flex-col items-center justify-center cursor-pointer">
                            <User className="h-6 w-6 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Drag Here</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={isCapturingPhoto ? stopStudentCamera : startStudentCamera}
                              className="flex-1 py-2 px-3 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                            >
                              <Camera className="h-3.5 w-3.5" />
                              <span>{isCapturingPhoto ? 'Stop Video' : 'Use Camera'}</span>
                            </button>
                            <label className="flex-1 py-2 px-3 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center active:scale-98">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Upload Pic</span>
                              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                            </label>
                          </div>
                          {photoUrl && (
                            <button
                              type="button"
                              onClick={() => setPhotoUrl('')}
                              className="w-full py-1 text-[9px] font-black text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg uppercase tracking-wider transition-all"
                            >
                              Remove Picture
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold leading-normal">
                          {isDraggingPhoto ? (
                            <span className="text-indigo-600 animate-pulse font-black uppercase tracking-wider">Drop file to attach!</span>
                          ) : (
                            <span>Drag and drop profile picture here, capture frame via live webcam feed, or upload directly.</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Camera Viewfinder */}
                    {isCapturingPhoto && (
                      <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-2 relative">
                        <div className="aspect-video relative rounded-lg overflow-hidden flex items-center justify-center bg-black">
                          {!cameraError ? (
                            <video ref={registerVideoRef} className="w-full h-full object-cover" playsInline muted />
                          ) : (
                            <div className="text-center p-4 text-xxs text-slate-500 font-medium">
                              <Camera className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                              <p>Webcam Blocked / Unavailable</p>
                              <button
                                type="button"
                                onClick={captureStudentPhoto}
                                className="mt-2.5 px-3 py-1 bg-indigo-600 text-white font-bold rounded-md"
                              >
                                Simulate Profile Pic
                              </button>
                            </div>
                          )}
                          <div className="absolute inset-0 border border-indigo-500/25 pointer-events-none" />
                        </div>
                        {!cameraError && (
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={captureStudentPhoto}
                              className="flex-1 py-1 px-3 bg-indigo-600 text-white font-bold text-[10px] rounded-lg active:scale-98"
                            >
                              Capture Photo Frame
                            </button>
                            <button
                              type="button"
                              onClick={stopStudentCamera}
                              className="py-1 px-3 bg-slate-800 text-slate-300 hover:text-white font-bold text-[10px] rounded-lg active:scale-98"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        <canvas ref={registerCanvasRef} width="320" height="240" className="hidden" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Student Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Email ID</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Phone Number (Optional)</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          placeholder="Student's Mobile"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Student WhatsApp (Optional)</label>
                        <input
                          type="tel"
                          value={studentWhatsApp}
                          onChange={(e) => setStudentWhatsApp(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          placeholder="Student's WhatsApp Number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Subjects Chosen</span>
                      </label>
                      <p className="text-[10px] text-slate-400 mb-1.5">Select coaching programs student is enrolling for.</p>
                      <div className="flex flex-wrap gap-2 p-3 border border-slate-200/80 bg-slate-50 rounded-2xl">
                        {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'].map((sub) => {
                          const selected = subjectsChosen.includes(sub);
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => toggleSubject(sub)}
                              className={`px-3 py-1.5 rounded-xl text-xxs font-bold border transition-all cursor-pointer active:scale-98 ${
                                selected
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-black'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                              }`}
                            >
                              {sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Government Records & Welfare Status */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span>Government Records & Welfare</span>
                    </h4>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Aadhaar Number</label>
                      <input
                        type="text"
                        value={aadharNumber}
                        onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold"
                        placeholder="12-digit Aadhaar No."
                        maxLength={12}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 p-2 border border-slate-200 bg-white rounded-xl cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={ewsStatus}
                          onChange={(e) => setEwsStatus(e.target.checked)}
                          className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xxs font-black text-slate-700">EWS Candidate</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 border border-slate-200 bg-white rounded-xl cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={bplStatus}
                          onChange={(e) => setBplStatus(e.target.checked)}
                          className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xxs font-black text-slate-700">BPL Category</span>
                      </label>
                    </div>
                  </div>

                  {/* Documents Attachment Registry */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-emerald-500" />
                      <span>Documents Registry</span>
                    </h4>
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Doc Type</label>
                          <select
                            value={formDocType}
                            onChange={(e) => setFormDocType(e.target.value)}
                            className="w-full text-[10px] px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold focus:outline-hidden"
                          >
                            <option value="Aadhaar Card">Aadhaar Card</option>
                            <option value="Birth Certificate">Birth Certificate</option>
                            <option value="Income Certificate">Income Certificate</option>
                            <option value="Marksheet">Marksheet</option>
                            <option value="Transfer Certificate">Transfer Certificate</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Custom Name (Optional)</label>
                          <input
                            type="text"
                            value={formDocName}
                            onChange={(e) => setFormDocName(e.target.value)}
                            placeholder="e.g. My Aadhaar"
                            className="w-full text-[10px] px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold focus:outline-hidden"
                          />
                        </div>
                      </div>
                      <label className="flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-slate-300 bg-white hover:bg-slate-50 text-[10px] font-bold rounded-lg text-slate-600 transition-all cursor-pointer">
                        <Upload className="h-3 w-3 text-indigo-500" />
                        <span>Select Document File</span>
                        <input type="file" onChange={handleDocUpload} className="hidden" />
                      </label>
                    </div>

                    {uploadedDocs.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Staged Documents ({uploadedDocs.length})</p>
                        <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                          {uploadedDocs.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-1.5 bg-white border border-slate-100 rounded-lg text-xxs">
                              <div className="truncate flex-1 min-w-0 mr-2">
                                <span className="font-extrabold text-indigo-600 mr-1">[{doc.type}]</span>
                                <span className="text-slate-700 font-medium">{doc.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeUploadedDoc(doc.id)}
                                className="text-[10px] text-red-500 hover:text-red-700 font-black px-1.5"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* RIGHT COLUMN: RESIDENTIAL, PARENT INFO & CONCESSIONS */}
                <div className="space-y-4.5">
                  <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-3.5">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Parent / Guardian Dossier</h4>
                    
                    {/* Father's Profile */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                        <Users className="h-3 w-3 text-indigo-500" />
                        <span>Father's Details</span>
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Father's Name</label>
                          <input
                            type="text"
                            value={fatherName}
                            onChange={(e) => setFatherName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            placeholder="Father's Full Name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Father's Phone</label>
                          <input
                            type="tel"
                            value={fatherPhone}
                            onChange={(e) => setFatherPhoneState(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Father's Mobile"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Father's WhatsApp</label>
                          <input
                            type="tel"
                            value={fatherWhatsApp}
                            onChange={(e) => setFatherWhatsApp(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Father's WhatsApp"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Father's Email</label>
                          <input
                            type="email"
                            value={fatherEmail}
                            onChange={(e) => setFatherEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Father's Email ID"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mother's Profile */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-[10px] font-bold text-pink-600 uppercase tracking-wider flex items-center gap-1">
                        <Users className="h-3 w-3 text-pink-500" />
                        <span>Mother's Details</span>
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Mother's Name</label>
                          <input
                            type="text"
                            value={motherName}
                            onChange={(e) => setMotherName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            placeholder="Mother's Full Name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Mother's Phone</label>
                          <input
                            type="tel"
                            value={motherPhone}
                            onChange={(e) => setMotherPhoneState(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Mother's Mobile"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Mother's WhatsApp</label>
                          <input
                            type="tel"
                            value={motherWhatsApp}
                            onChange={(e) => setMotherWhatsApp(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Mother's WhatsApp"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Mother's Email</label>
                          <input
                            type="email"
                            value={motherEmail}
                            onChange={(e) => setMotherEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Mother's Email ID"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guardian's Profile */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                        <Users className="h-3 w-3 text-amber-500" />
                        <span>Guardian's Details (Alternative)</span>
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Guardian Name</label>
                          <input
                            type="text"
                            value={guardianName}
                            onChange={(e) => setGuardianName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            placeholder="Guardian Full Name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Guardian Phone</label>
                          <input
                            type="tel"
                            value={guardianPhone}
                            onChange={(e) => setGuardianPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Guardian Mobile"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Guardian WhatsApp</label>
                          <input
                            type="tel"
                            value={guardianWhatsApp}
                            onChange={(e) => setGuardianWhatsApp(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Guardian WhatsApp"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Guardian Email</label>
                          <input
                            type="email"
                            value={guardianEmail}
                            onChange={(e) => setGuardianEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                            placeholder="Guardian Email ID"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Primary/Legacy Contact */}
                    <div className="border-t border-slate-200 pt-3 space-y-3">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Primary System Contact Link</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Parent Name</label>
                          <input
                            type="text"
                            required
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. David Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Parent Phone (Required)</label>
                          <input
                            type="tel"
                            required
                            value={parentPhone}
                            onChange={(e) => setParentPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                            placeholder="Primary Parent Mobile"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Parent Email</label>
                        <input
                          type="email"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                          placeholder="Primary Parent Email ID"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Home className="h-3.5 w-3.5 text-slate-400" />
                      <span>Residential Address</span>
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      placeholder="Enter student's home or boarding address details..."
                    />
                  </div>

                  <div className="p-4 bg-amber-50/40 border border-amber-200/60 rounded-2xl space-y-3">
                    <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>Prior Academic Marks & Concessions</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Prev. Class Marks (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={previousClassPercentage}
                          onChange={(e) => handlePreviousClassPercentageChange(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-extrabold text-slate-800"
                          placeholder="e.g. 92"
                        />
                      </div>

                      <div className="flex flex-col justify-end pb-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="editConcessionApplied"
                            checked={concessionApplied}
                            onChange={(e) => setConcessionApplied(e.target.checked)}
                            className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <label htmlFor="editConcessionApplied" className="text-xxs font-black text-slate-700 cursor-pointer">Apply Concession</label>
                        </div>
                      </div>
                    </div>

                    {concessionApplied && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div>
                          <label className="block text-[9px] font-black text-amber-600 uppercase tracking-wider mb-1">Scholarship / Discount (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={concessionPercentage}
                            onChange={(e) => setConcessionPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full px-3 py-1.5 border border-amber-200 rounded-xl text-xs bg-white font-black text-amber-700"
                            placeholder="Discount Percent"
                          />
                        </div>
                        <p className="text-[9px] text-amber-800 font-medium italic">
                          *System auto-calculated concession based on high merit scoring!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Batch</label>
                      <select
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 font-bold"
                      >
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Fee Status</label>
                      <select
                        value={feeStatus}
                        onChange={(e) => setFeeStatus(e.target.value as any)}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 font-bold"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Admission Date</label>
                      <input
                        type="date"
                        required
                        value={admissionDate}
                        onChange={(e) => setAdmissionDate(e.target.value)}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 font-bold"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex gap-4 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    stopStudentCamera();
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-98"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Fees Modal */}
      {collectingFeesId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>Collect Fees Payment</span>
              </h3>
              <button onClick={() => setCollectingFeesId(null)} className="text-emerald-100 hover:text-white text-xs font-bold">✕</button>
            </div>
            <form onSubmit={submitCollect} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Amount to Collect (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['UPI', 'Online', 'Card', 'Cash'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPayMode(mode)}
                      className={`py-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                        payMode === mode
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCollectingFeesId(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Directory Table */}
      {subTab === 'active' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <User className="h-10 w-10 mx-auto opacity-40 mb-3" />
              <p className="text-xs font-medium">No students match your query filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xxs uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">Student Profile</th>
                    <th className="px-6 py-4">Batch Details</th>
                    <th className="px-6 py-4">Financial Status</th>
                    <th className="px-6 py-4">Dues Outstanding</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                            {student.photoUrl ? (
                              <img referrerPolicy="no-referrer" src={student.photoUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold text-xs uppercase">
                                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p 
                                className="font-bold text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer"
                                onClick={() => setViewingStudent(student)}
                              >
                                {student.name}
                              </p>
                              {student.approved === false ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-150 text-rose-600 font-extrabold text-[8px] uppercase tracking-wide animate-pulse">
                                  Pending Approval
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-150 text-emerald-700 font-extrabold text-[8px] uppercase tracking-wide">
                                  Approved
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5 mt-0.5 text-slate-500 text-xxs font-medium">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 opacity-60" /> {student.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 opacity-60" /> {student.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xxs border border-slate-200/50">
                            <Tag className="h-3 w-3 opacity-60" />
                            {getBatchName(student.batchId)}
                          </span>
                          <p className="text-slate-400 text-xxs mt-1.5 flex items-center gap-1 font-medium">
                            <Calendar className="h-3 w-3" /> Admitted on {student.admissionDate}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xxs font-bold border ${
                            student.feeStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : student.feeStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {student.feeStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-700">₹{student.totalFeesDue}</p>
                          <p className="text-slate-400 text-xxs mt-0.5 font-medium">Paid: ₹{student.totalFeesPaid}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {student.approved === false && (
                            <button
                              onClick={() => onUpdateStudent(student.id, { approved: true })}
                              className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Approve Student Registration"
                            >
                              <Check className="h-3.5 w-3.5 font-black" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSingleGraduationYear(String(new Date().getFullYear()));
                              setGraduatingStudentId(student.id);
                            }}
                            className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                            title="Graduate Student to Alumni (Course Over)"
                          >
                            <Award className="h-3.5 w-3.5 text-amber-600" />
                          </button>
                          <button
                            onClick={() => setViewingStudent(student)}
                            className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                            title="View Student File"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadSingleIdCard(student)}
                            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Generate & Download ID Card PDF"
                          >
                            <IdCard className="h-3.5 w-3.5" />
                          </button>
                          {student.totalFeesDue > 0 && (
                            <button
                              onClick={() => {
                                setCollectingFeesId(student.id);
                                setPayAmount(String(student.totalFeesDue));
                              }}
                              className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Collect Fee Payment"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Edit Student Info"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this student record?')) {
                                onDeleteStudent(student.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                            title="Delete Student Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Grouped Alumni Section */}
      {subTab === 'alumni' && (
        <div className="space-y-8 animate-fadeIn text-left">
          {Object.keys(groupedAlumni).length === 0 ? (
            <div className="p-16 bg-white border border-slate-200 rounded-3xl text-center text-slate-400 shadow-xxs">
              <Award className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <h4 className="text-sm font-black text-slate-700">No Alumni Records Yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                No active student groups or individual students have been graduated yet. You can graduate an entire active class batch once the course is over using the "Graduate a Batch" action button above.
              </p>
            </div>
          ) : (
            Object.keys(groupedAlumni).sort((a, b) => b.localeCompare(a)).map(year => (
              <div key={year} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                    <span>Graduation Class of {year}</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-150">
                    {Object.values(groupedAlumni[year]).flat().length} Alumni
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(groupedAlumni[year]).map(([batchName, alumniList]) => (
                    <div key={batchName} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xxs flex flex-col justify-between hover:border-slate-300 transition-colors">
                      <div>
                        <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              Graduated Batch
                            </span>
                            <h4 className="font-extrabold text-xs text-slate-800 mt-1">{batchName}</h4>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl text-xxs font-extrabold bg-indigo-50 border border-indigo-100 text-indigo-600">
                            {alumniList.length} Students
                          </span>
                        </div>
                        
                        <div className="space-y-2 mt-2">
                          {alumniList.map(student => (
                            <div key={student.id} className="p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl flex items-center justify-between border border-slate-100 transition-all">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="h-7 w-7 rounded-lg overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center border border-slate-150">
                                  {student.photoUrl ? (
                                    <img referrerPolicy="no-referrer" src={student.photoUrl} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-700 font-extrabold text-[9px] uppercase">
                                      {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 text-left">
                                  <p className="text-xs font-black text-slate-800 truncate">{student.name}</p>
                                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Phone: {student.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 text-[8px] font-black rounded-md border ${
                                  student.feeStatus === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                                    : 'bg-rose-50 text-rose-700 border-rose-150'
                                }`}>
                                  {student.feeStatus}
                                </span>
                                <button
                                  onClick={() => setViewingStudent(student)}
                                  className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-pointer transition-colors"
                                  title="View File"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Do you want to restore ${student.name} back to the Active student directory list?`)) {
                                      onUpdateStudent(student.id, { isAlumni: false, alumniYear: undefined, alumniBatchName: undefined });
                                    }
                                  }}
                                  className="p-1.5 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg text-rose-600 cursor-pointer transition-colors"
                                  title="Restore to Active Student"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Graduate Batch Modal */}
      {isGraduatingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span>Graduate Entire Class Batch</span>
              </h3>
              <button 
                onClick={() => setIsGraduatingBatch(false)} 
                className="text-amber-100 hover:text-white font-bold bg-amber-700/50 hover:bg-amber-700 p-1.5 rounded-lg text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleGraduateBatchSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Select Batch to Graduate</label>
                <select
                  required
                  value={graduateBatchId}
                  onChange={(e) => setGraduateBatchId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
                >
                  <option value="">Select an active batch...</option>
                  {batches.map((b) => {
                    const count = students.filter(s => s.batchId === b.id && !s.isAlumni).length;
                    return (
                      <option key={b.id} value={b.id}>
                        {b.name} ({count} active students)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Graduation Year</label>
                <input
                  type="text"
                  required
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-150 rounded-xl text-xxs text-amber-800 leading-relaxed font-semibold">
                ⚠️ Graduating a batch will mark all active students in the selected batch as Alumni. They will be grouped by Class Year and Batch Name inside the Alumni Section once their foundation course is over.
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGraduatingBatch(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
                >
                  Graduate Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Graduate Single Student Modal */}
      {graduatingStudentId && (() => {
        const student = students.find(s => s.id === graduatingStudentId);
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span>Graduate Student to Alumni</span>
                </h3>
                <button 
                  onClick={() => setGraduatingStudentId(null)} 
                  className="text-indigo-100 hover:text-white font-bold bg-indigo-700/50 hover:bg-indigo-700 p-1.5 rounded-lg text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleGraduateSingleSubmit} className="p-6 space-y-4 text-left">
                <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="font-bold text-slate-800">Student: <span className="text-indigo-600 font-extrabold">{student?.name}</span></p>
                  <p className="text-slate-400 font-semibold">Current Batch: {student ? getBatchName(student.batchId) : ''}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Graduation Year</label>
                  <input
                    type="text"
                    required
                    value={singleGraduationYear}
                    onChange={(e) => setSingleGraduationYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setGraduatingStudentId(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
                  >
                    Graduate Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Detailed Student Profile Viewer Modal */}
      {viewingStudent && (
        <StudentProfileModal
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
          getBatchName={getBatchName}
          onUpdateStudent={onUpdateStudent}
          handleDownloadSingleIdCard={handleDownloadSingleIdCard}
          handleOpenEdit={handleOpenEdit}
          fees={fees}
          batches={batches}
          simulatedRole={simulatedRole}
          setSimulatedRole={setSimulatedRole}
          showToast={showToast}
          attendanceLogs={attendanceLogs}
          setAttendanceLogs={setAttendanceLogs}
          studentResults={studentResults}
          setStudentResults={setStudentResults}
          communicationLogs={communicationLogs}
          setCommunicationLogs={setCommunicationLogs}
        />
      )}

      {/* Floating Toast Notification Popups */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white rounded-2xl px-4 py-3.5 shadow-2xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200 max-w-sm">
          <div className="h-8 w-8 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="text-left text-xs">
            <p className="font-extrabold text-slate-100">{toast.title}</p>
            <p className="text-slate-400 text-[10px] font-semibold mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
