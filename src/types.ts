export type UserRole = 'admin' | 'principal' | 'teacher' | 'student' | 'parent' | 'office_staff' | 'accountant' | 'librarian' | 'receptionist' | 'alumni' | 'guest' | 'job_seeker';

export interface CourseChapter {
  id: string;
  name: string;
  assignedPeriods: number;
  completedPeriods: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  fee: number;
  chapters?: CourseChapter[];
}

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  teacherId: string;
  schedule: string;
  room: string;
  academicYear?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  parentName: string;
  batchId: string;
  admissionDate: string;
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  totalFeesPaid: number;
  totalFeesDue: number;
  address?: string;
  parentPhone?: string;
  parentEmail?: string;
  photoUrl?: string;
  subjectsChosen?: string[];
  previousClassPercentage?: number;
  concessionApplied?: boolean;
  concessionPercentage?: number;
  approved?: boolean;
  isAlumni?: boolean;
  alumniYear?: string;
  alumniBatchName?: string;
  joinedRevisionBatches?: { batchId: string; joinedSubjects: string[] }[];
  academicYear?: string;

  // Unified Communication details
  whatsAppNumber?: string;
  fatherPhone?: string;
  fatherWhatsApp?: string;
  fatherEmail?: string;
  motherPhone?: string;
  motherWhatsApp?: string;
  motherEmail?: string;
  guardianPhone?: string;
  guardianWhatsApp?: string;
  guardianEmail?: string;
  contactVerified?: boolean;

  // Expanded Personal Info
  gender?: string;
  dob?: string;
  age?: number;
  bloodGroup?: string;
  aadharNumber?: string;
  nationality?: string;
  religion?: string;
  category?: 'General' | 'OBC' | 'SC' | 'ST';
  caste?: string;
  disabilityStatus?: string;

  // Parent/Guardian Details
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  relationship?: string;
  occupation?: string;
  annualIncome?: string;
  contactNumber?: string;
  alternateContactNumber?: string;

  // Address
  permanentAddress?: string;
  correspondenceAddress?: string;
  district?: string;
  state?: string;
  pinCode?: string;

  // Academic Information
  admissionNumber?: string;
  enrollmentNumber?: string;
  course?: string;
  class?: string;
  section?: string;
  rollNumber?: string;
  previousSchool?: string;
  mediumOfInstruction?: string;

  // Government Benefits
  ewsStatus?: boolean;
  bplStatus?: boolean;
  scStObcStatus?: boolean;
  minorityStatus?: boolean;
  disabilityBenefit?: boolean;
  orphanStatus?: boolean;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyRelationship?: string;
  emergencyPhone?: string;

  // Medical Information
  allergies?: string;
  medicalConditions?: string;
  medications?: string;
  emergencyNotes?: string;

  // Documents
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }[];

  // Alumni profile details
  currentOccupation?: string;
  higherEducationDetails?: string;
  currentEmployer?: string;
  city?: string;
  country?: string;
  linkedIn?: string;
  achievements?: string;
  modificationHistory?: { timestamp: string; updatedBy: string; changes: string; }[];
}

export interface AlumniMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  roomType: 'public' | 'batch' | 'year' | 'announcements' | 'events' | 'reunion' | 'photos' | 'jobs' | 'mentorship';
  roomId: string; // e.g. "batch-1", "year-2026", "general"
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  flagged?: boolean;
  flagReason?: string;
}

export interface ModerationLog {
  id: string;
  messageId?: string;
  senderId: string;
  senderName: string;
  content: string;
  flagReason: string;
  timestamp: string;
  actionTaken: 'blocked' | 'warned' | 'removed';
  language?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  batches: string[]; // List of batch IDs
  basePay: number; // monthly base in INR
  hourlyRate: number; // hourly rate in INR
  payoutType: 'Fixed' | 'Hourly' | 'Per-Session';
  terminated?: boolean;
  whatsAppNumber?: string;
  contactVerified?: boolean;
  joiningDate?: string;
  dob?: string;
  gender?: string;
  qualification?: string;
  experienceYears?: number;
  aadharNumber?: string;
  panNumber?: string;
  address?: string;
  bankAccountNo?: string;
  bankIFSC?: string;
  leaves?: { id: string; type: string; startDate: string; endDate: string; reason: string; status: 'Pending' | 'Approved' | 'Rejected' }[];
  timetables?: { id: string; day: string; time: string; subject: string; batchId: string; room: string }[];
  documents?: { id: string; name: string; type: string; url: string; uploadedAt: string }[];
  performanceScore?: number;
  evaluationsCount?: number;
  disbursements?: { id: string; date: string; amount: number; mode: string; status: 'Paid' | 'Failed'; referenceId: string; period: string }[];
  communications?: { id: string; date: string; mode: string; message: string; templateName?: string; status: 'Sent' | 'Failed' }[];
}

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  timeIn: string; // HH:MM:SS
  timeOut?: string; // HH:MM:SS
  mode: 'QR' | 'PunchIn' | 'Location' | 'Geofence';
  location?: { lat: number; lng: number };
  verified: boolean;
  hoursWorked?: number;
}

export interface AttendanceRecord {
  studentId: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  arrivalTime?: string; // e.g. "08:15"
  lateReason?: string; // reason for late arrival
  graceStatus?: 'Grace' | 'Exceeded'; // whether late within acceptable grace period
  leaveId?: string; // references leave application id if status is 'Leave'
  verifiedByBiometrics?: boolean; // whether checked-in via biometric machine
  biometricId?: string; // references biometric device/log id
}

export interface LeaveApplication {
  id: string;
  studentId: string;
  studentName: string;
  batchId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string; // YYYY-MM-DD HH:MM
  approvedBy?: string; // admin/teacher name
  comments?: string;
  attachmentUrl?: string; // Mock attachment URL/Base64
}

export interface Attendance {
  id: string;
  date: string; // YYYY-MM-DD
  batchId: string;
  records: AttendanceRecord[];
  photoUrl?: string; // Data URI of captured photo
  photoTimestamp?: string;
  photoLocation?: { lat: number; lng: number };
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'Notes' | 'Syllabus' | 'Homework' | 'Video';
  batchId: string; // references Batch.id or "all"
  linkUrl?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  batchId: string;
  questions: Question[];
  isAiGenerated?: boolean;
  createdAt: string;
}

export interface Grade {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  completedAt: string;
}

export interface FeeReceipt {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  paymentMode: 'Cash' | 'Card' | 'Online' | 'UPI';
  receiptNo: string;
  paymentType?: 'Full' | 'Installment';
  installmentNo?: number;
  concessionApplied?: boolean;
  concessionType?: string;
  concessionPercentage?: number;
  concessionAmount?: number;
  referralApplied?: boolean;
  referrerName?: string;
  referralDiscount?: number;
  transactionId?: string;
  remarks?: string;
}

// Summary interface for overall stats
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalBatches: number;
  totalRevenue: number;
  pendingFees: number;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  associatedId?: string;
  approved?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'ignored';
  phone?: string;
  avatarUrl?: string;
  photoStatus?: 'pending' | 'approved' | 'rejected';
  photoRejectionReason?: string;
  whatsAppNumber?: string;
  contactVerified?: boolean;
  token?: string;
}

export interface AnonymousFeedback {
  id: string;
  type: 'feedback' | 'suggestion' | 'complaint';
  category: string;
  title: string;
  content: string;
  createdAt: string;
  status?: 'pending' | 'approved' | 'rejected';
  targetAudience?: 'all' | 'students' | 'teachers' | 'parents' | 'none';
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  rating: number;
  avatarUrl?: string;
  createdAt: string;
  featured?: boolean;
  pinned?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  targetAudience?: 'all' | 'students' | 'teachers' | 'parents' | 'none';
  authorId?: string;
}

export interface GalleryItem {
  id: string;
  category: 'activities' | 'winners';
  title: string;
  date: string;
  desc: string;
  img: string;
  createdAt: string;
}

export interface InstitutionProfile {
  // Basic Information
  name: string;
  coachingCentreName?: string;
  motto?: string;
  tagline?: string;
  description: string;
  aboutUs?: string;
  vision?: string;
  mission?: string;
  directorMessage?: string;
  chairmanMessage?: string;
  history?: string;

  // Branding
  logoUrl?: string;
  faviconUrl?: string;
  bannerUrl?: string;
  additionalBanners?: string[];
  backgroundImages?: string[];

  // Contact Information
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  phone: string;
  mobileNumbers?: string;
  whatsAppNumber?: string;
  email: string;
  website?: string;
  googleMapsLocation?: string;

  // Office Information
  officeTimings?: string;
  workingDays?: string;
  admissionOfficeTimings?: string;
  holidayTimings?: string;

  // Academic Information
  academicSession?: string;
  admissionStartDate?: string;
  admissionEndDate?: string;
  classTimings?: string;
  batchTimings?: string;
  examinationSchedule?: string;
  vacationDetails?: string;

  // Social Media
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  telegram?: string;

  // Legal Information
  registrationNumber?: string;
  affiliationDetails?: string;
  recognitionDetails?: string;
  accreditationInfo?: string;
  gstNumber?: string;

  // Homepage Content
  welcomeMessage?: string;
  homepageBannerText?: string;
  announcementTitle?: string;
  announcementText?: string;
  announcementActive?: boolean;
  announcementDate?: string;
  featuredCourses?: string[];
  highlights?: string[];
  successStats?: { label: string; value: string }[];
  achievements?: string[];
  partnerLogos?: string[];
  upcomingEvents?: { title: string; date: string; desc: string }[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Academic' | 'Exam' | 'Event' | 'Holiday';
  important: boolean;
  targetRole: 'all' | 'students' | 'teachers';
  date: string; // YYYY-MM-DD
  createdBy: string; // Name of admin
  acknowledgedBy?: string[];
}

export interface AcademicEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  type: 'exam' | 'deadline' | 'holiday' | 'event' | 'milestone';
  batchId?: string; // Specific batch or undefined for all
  createdBy?: string;
}

export interface LecturerEvaluation {
  id: string;
  lecturerId: string; // Can be candidate.id (e.g. c1) or teacher.id (e.g. teacher-1)
  lecturerName: string;
  isDemo: boolean;
  month?: string; // e.g. "July 2026"
  studentId: string;
  ratingLoudClear: number; // 1-10
  ratingTalented: number; // 1-10
  ratingClassManagement: number; // 1-10
  ratingGadgetFree: number; // 1-10
  ratingTemperControl: number; // 1-10
  ratingActiveEnergy: number; // 1-10
  ratingInteractive: number; // 1-10
  ratingPaceOfTeaching: number; // 1-10
  ratingRealLifeContext: number; // 1-10
  comments?: string;
  createdAt: string;
}

export interface PaymentSettings {
  upiId: string;
  merchantName: string;
  customQrUrl?: string;
  instructions?: string;
}

export interface CommunicationLog {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipients: string[];
  channel: 'SMS' | 'WhatsApp' | 'Email' | 'Push' | 'In-App' | 'Announcement' | 'Circular' | 'Notice Board';
  date: string;
  time: string;
  message: string;
  attachments?: { name: string; url: string; type: string }[];
  deliveryStatus: 'Delivered' | 'Sent' | 'Read' | 'Retrying' | 'Failed';
  readStatus?: 'Read' | 'Unread';
  retryCount?: number;
  errorMessage?: string;
}

export interface CommunicationSettings {
  smsProvider: 'MSG91' | 'Fast2SMS' | 'Textlocal' | 'Twilio';
  smsApiKey: string;
  smsSenderId: string;
  smsDltTemplateId: string;
  smsAuthToken: string;
  
  waBusinessApi: string;
  waApiToken: string;
  waPhoneNumberId: string;
  waWebhook: string;
  waTemplates: { id: string; name: string; content: string }[];
  
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpSenderEmail: string;
  smtpProvider: 'Gmail' | 'Outlook' | 'Zoho' | 'Custom';
  
  pushEnabled: boolean;
  pushWebKey: string;
  
  aiModerationEnabled: boolean;
  aiModerationRules: {
    blockAbusive: boolean;
    blockHateSpeech: boolean;
    blockPhishing: boolean;
    blockSpam: boolean;
    blockProhibitedImages: boolean;
  };
  
  autoNotifications: {
    admissionConfirm: boolean;
    feeDue: boolean;
    feePayment: boolean;
    homeworkAssigned: boolean;
    attendanceAlert: boolean;
    examReminder: boolean;
    birthdayWishes: boolean;
  };
}

export type LibraryResourceType = 'E-Book' | 'Video Lecture' | 'PDF Notes' | 'Assignment' | 'Previous Year Paper' | 'Sample Paper' | 'Practice Worksheet';

export interface LibraryBookDownloadLog {
  studentId: string;
  studentName: string;
  timestamp: string;
}

export interface LibraryBookEditionHistory {
  version: string;
  updateDate: string;
  note: string;
  fileUrl: string;
  fileSize: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  resourceType: LibraryResourceType;
  subject: string; // e.g. "Physics", "Chemistry", "Mathematics", "Biology", "English", "General"
  classLevel: 'IX' | 'X' | 'XI' | 'XII' | 'All';
  course: 'Foundation' | 'NEET' | 'JEE' | 'Boards' | 'General';
  batchId?: string; // Optional batch ID mapping or "all"
  author: string;
  publisher: string;
  edition: string;
  language: string;
  description: string;
  keywords: string[];
  coverUrl?: string;
  fileUrl: string;
  fileType: string; // "pdf" | "epub" | "docx" | "pptx" | "zip" | "mp4" etc.
  fileSize: string;
  uploadDate: string;
  lastUpdatedDate: string;
  version: string;
  downloadCount: number;
  
  // Admin Flags
  isPinned?: boolean;
  isFeatured?: boolean;
  isArchived?: boolean;
  downloadRestricted?: boolean;
  publishDate?: string; // YYYY-MM-DD (empty means immediate)
  expiryDate?: string; // YYYY-MM-DD (empty means never)
  
  // Permissions
  accessLevel: 'all' | 'class_ix' | 'class_x' | 'class_xi' | 'class_xii' | 'foundation' | 'neet' | 'jee' | 'batch' | 'individual';
  allowedBatchIds?: string[]; // If accessLevel is 'batch'
  allowedStudentIds?: string[]; // If accessLevel is 'individual'
  
  // Logs & History
  downloadHistory?: LibraryBookDownloadLog[];
  editionHistory?: LibraryBookEditionHistory[];
}

export type CareerCategory =
  | 'Technical'
  | 'Medical & Healthcare'
  | 'Science & Research'
  | 'Commerce & Finance'
  | 'Government & Civil Services'
  | 'Defence & Uniformed Services'
  | 'Education'
  | 'Legal'
  | 'Blue Collar'
  | 'Green Collar'
  | 'New Collar'
  | 'Creative'
  | 'Entrepreneurship'
  | 'Skilled Vocational'
  | 'International';

export interface CareerOpportunity {
  id: string;
  title: string;
  category: CareerCategory;
  overview: string;
  eligibility: string;
  requiredSubjects: string[];
  pathways: string[];
  alternativePathways?: string[];
  entranceExams?: string[];
  skills: string[];
  certifications?: string[];
  roadmap: string[];
  responsibilities: string[];
  industries: string[];
  opportunities: {
    government?: string;
    private?: string;
    selfEmployment?: string;
  };
  salaryRange: {
    min: number;
    max: number;
    formatted: string;
  };
  outlook: string;
  automationImpact: 'Low' | 'Medium' | 'High';
  relatedCareers?: string[];
  resources?: string[];
  matchPercentage?: number;
  whyMatch?: string;
  
  // Matching criteria for weighted scoring
  matchingCriteria: {
    interests: string[];
    aptitude: {
      logical: number;
      verbal: number;
      spatial: number;
      quantitative: number;
    };
    subjects: string[];
    workStyle: 'Independent' | 'Collaborative' | 'Leadership';
    theoryVsPractice: 'theoretical' | 'practical' | 'balanced';
    educationLevel: 'No Degree' | 'Diploma' | 'Degree' | 'Cert' | 'PhD';
    locationPreference: 'Domestic' | 'Remote' | 'International' | 'Flexible';
    physicalRequirements?: string;
    relocationRequired?: boolean;
    entrepreneurialInclination?: boolean;
  };
}

export interface BranchLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // in meters, e.g. 15
  qrActive: boolean;
  status: 'Active' | 'Inactive';
}






