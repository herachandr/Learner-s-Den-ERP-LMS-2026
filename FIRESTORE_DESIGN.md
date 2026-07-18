# Learner's Den ERP-LMS Firestore Database Architecture Specification (Refined)

This document provides the refined, production-grade, and horizontally scalable Firestore database architecture design for the **Learner's Den ERP-LMS**. It strictly follows Firestore best practices to avoid the 1MB document size limit, eliminate hot-spot constraints, and guarantee sub-second queries for an educational institution scaling up to thousands of students, teachers, and logs.

---

## 1. Document Deconstruction & Subcollection Strategy

To ensure long-term scalability and prevent document size inflation (1MB limit), nested arrays of variable sizes must be deconstructed. We systematically offload all high-growth, high-cardinality, and historical tracking records from parent documents into dedicated Firestore **subcollections** or flat **root collections**.

### A. Student Document Deconstruction (`/students/{studentId}`)
Oversized arrays (such as attached files, modification history, and revision courses) have been extracted into subcollections under the specific student's document tree:

1. **Subcollection: `/students/{studentId}/documents`** (Attached PDFs, Aadhar, Medical Certs)
   - Prevents binary metadata or URL bloating in the main profile.
2. **Subcollection: `/students/{studentId}/modificationHistory`** (Audit trail of record changes)
   - Guarantees unlimited historical edits are tracked without violating document size limits.
3. **Subcollection: `/students/{studentId}/revisionBatches`** (Supplementary classes joined)
   - Offloads multi-batch enrollment tracking.

### B. Teacher Document Deconstruction (`/teachers/{teacherId}`)
Variable and operational matrices (including leaves, timetables, payroll logs, and historical payout disbursements) have been extracted into specific subcollections:

1. **Subcollection: `/teachers/{teacherId}/leaves`** (Individual leave requests)
2. **Subcollection: `/teachers/{teacherId}/timetables`** (Weekly lecture schedules)
3. **Subcollection: `/teachers/{teacherId}/documents`** (Degrees, identity papers, resume PDFs)
4. **Subcollection: `/teachers/{teacherId}/disbursements`** (Historical pay receipts)
5. **Subcollection: `/teachers/{teacherId}/communications`** (Targeted notifications sent)

---

## 2. Refined Schema Definitions & Collection Trees

### A. Root Collections

#### 1. `/users` (Collection)
*Auth UID serves as Document ID. Links Firebase Authentication profiles to portal RBAC permissions.*
```typescript
interface UserDoc {
  id: string;                 // Document ID (matches Firebase Auth UID)
  email: string;              // Lowercase, unique string
  name: string;
  role: 'admin' | 'principal' | 'teacher' | 'student' | 'parent' | 'office_staff' | 'accountant' | 'librarian' | 'receptionist' | 'alumni' | 'guest' | 'job_seeker' | 'hod';
  associatedId?: string;      // References studentId, teacherId, or candidateId
  approved: boolean;          // Gatekeeper flag
  status: 'pending' | 'approved' | 'rejected' | 'ignored';
  phone?: string;
  avatarUrl?: string;
  photoStatus?: 'pending' | 'approved' | 'rejected';
  photoRejectionReason?: string;
  whatsAppNumber?: string;
  contactVerified?: boolean;
  createdAt: string;          // ISO-8601 Timestamp
  updatedAt: string;          // ISO-8601 Timestamp
}
```

#### 2. `/courses` (Collection)
*Academic programs.*
```typescript
interface CourseDoc {
  id: string;                 // Document ID (e.g. course-xxx)
  name: string;
  description: string;
  duration: string;           // E.g. "1 Year", "2 Years"
  fee: number;                // Tuition base fee in INR
  createdAt: string;
}
```

#### 3. `/batches` (Collection)
*Sub-groups under academic courses with timetables.*
```typescript
interface BatchDoc {
  id: string;                 // Document ID (e.g. batch-xxx)
  name: string;
  courseId: string;           // References /courses/{courseId}
  teacherId: string;          // References /teachers/{teacherId} (Primary Faculty)
  schedule: string;           // E.g. "Mon, Wed, Fri 16:00-18:30"
  room: string;               // E.g. "Room 401"
  academicYear: string;       // E.g. "2025-2026"
  createdAt: string;
}
```

#### 4. `/students` (Collection)
*Core learner registry. High-growth histories offloaded to subcollections.*
```typescript
interface StudentDoc {
  id: string;                 // Document ID (e.g. student-xxx)
  name: string;
  email: string;
  phone: string;
  parentName: string;
  batchId: string;            // References /batches/{batchId} (empty string if unassigned)
  admissionDate: string;      // YYYY-MM-DD
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
  academicYear?: string;
  whatsAppNumber?: string;
  contactVerified?: boolean;
  
  // Demographics
  gender?: string;
  dob?: string;
  aadharNumber?: string;
  category?: 'General' | 'OBC' | 'SC' | 'ST';
  
  // Parent details
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  relationship?: string;
  occupation?: string;
  annualIncome?: string;
  
  // Addresses
  permanentAddress?: string;
  correspondenceAddress?: string;
  pinCode?: string;
  
  // Identifiers
  admissionNumber?: string;
  rollNumber?: string;
  
  // Medical profile
  medicalConditions?: string;
  emergencyNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}
```

#### 5. `/teachers` (Collection)
*Staff profile records. Financial and scheduler sub-arrays deconstructed into subcollections.*
```typescript
interface TeacherDoc {
  id: string;                 // Document ID (e.g. teacher-xxx)
  name: string;
  email: string;
  phone: string;
  subject: string;
  batches: string[];          // List of batchId references
  basePay: number;            // Fixed monthly wage
  hourlyRate: number;         // Dynamic wage per session
  payoutType: 'Fixed' | 'Hourly' | 'Per-Session';
  terminated?: boolean;
  joiningDate?: string;
  qualification?: string;
  experienceYears?: number;
  bankAccountNo?: string;
  bankIFSC?: string;
  performanceScore?: number;
  evaluationsCount?: number;
  createdAt: string;
}
```

#### 6. `/attendance` (Collection)
*Daily attendance sheets. High-growth separate collection instead of nesting on student records.*
```typescript
interface AttendanceDoc {
  id: string;                 // Composite ID: "{batchId}_{date}"
  date: string;               // YYYY-MM-DD
  batchId: string;            // References /batches/{batchId}
  records: {
    studentId: string;        // References /students/{studentId}
    status: 'Present' | 'Absent' | 'Late' | 'Leave';
    arrivalTime?: string;     // HH:MM
    lateReason?: string;
    verifiedByBiometrics?: boolean;
  }[];                        // Tracked students' status list
  photoUrl?: string;          // Cloud Storage URL
  createdAt: string;
}
```

#### 7. `/teacherAttendance` (Collection)
*Faculty clock-in logs. Separate collection to prevent teacher document bloating.*
```typescript
interface TeacherAttendanceDoc {
  id: string;                 // Document ID (auto-generated or "{teacherId}_{date}")
  teacherId: string;          // References /teachers/{teacherId}
  date: string;               // YYYY-MM-DD
  timeIn: string;             // HH:MM:SS
  timeOut?: string;           // HH:MM:SS
  mode: 'QR' | 'PunchIn' | 'Location';
  location?: { lat: number; lng: number };
  verified: boolean;
  hoursWorked?: number;
  createdAt: string;
}
```

#### 8. `/fees` (Collection)
*Durable financial receipt records. High-growth.*
```typescript
interface FeeReceiptDoc {
  id: string;                 // Document ID
  studentId: string;          // References /students/{studentId}
  amount: number;             // Amount paid in INR
  date: string;               // YYYY-MM-DD
  paymentMode: 'Cash' | 'Card' | 'Online' | 'UPI';
  receiptNo: string;
  paymentType?: 'Full' | 'Installment';
  installmentNo?: number;
  transactionId?: string;
  remarks?: string;
  createdAt: string;
}
```

#### 9. `/materials` (Collection)
*E-study books, notes, and homework assignments.*
```typescript
interface MaterialDoc {
  id: string;
  title: string;
  description: string;
  type: 'Notes' | 'Syllabus' | 'Homework' | 'Video';
  batchId: string;            // References /batches/{batchId} or "all"
  linkUrl?: string;
  createdAt: string;
}
```

#### 10. `/quizzes` (Collection)
*Examinations and tests.*
```typescript
interface QuizDoc {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  batchId: string;            // References /batches/{batchId}
  questions: {
    id: string;
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
  }[];                        // Embedded questions array (low cardinality, max 100)
  isAiGenerated?: boolean;
  createdAt: string;
}
```

#### 11. `/grades` (Collection)
*Individual quiz scorecard submissions. High-growth separate collection.*
```typescript
interface GradeDoc {
  id: string;
  quizId: string;             // References /quizzes/{quizId}
  studentId: string;          // References /students/{studentId}
  score: number;
  totalQuestions: number;
  answers: Record<string, number>; // Question ID -> Option Index selected
  completedAt: string;
}
```

#### 12. `/notices` (Collection)
*Portal announcement board alerts.*
```typescript
interface NoticeDoc {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Academic' | 'Exam' | 'Event' | 'Holiday';
  important: boolean;
  targetRole: 'all' | 'students' | 'teachers';
  date: string;               // YYYY-MM-DD
  createdBy: string;
  acknowledgedBy?: string[];  // User IDs who clicked acknowledge
  createdAt: string;
}
```

#### 13. `/alumniMessages` (Collection)
*Interactive alumni chat streams.*
```typescript
interface AlumniMessageDoc {
  id: string;
  senderId: string;           // References /users/{userId}
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  content: string;
  roomType: 'public' | 'batch' | 'year' | 'announcements' | 'events' | 'reunion' | 'photos' | 'jobs' | 'mentorship';
  roomId: string;
  attachmentUrl?: string;
  createdAt: string;
}
```

#### 14. `/lecturerEvaluations` (Collection)
*Feedback loops for active faculty and candidates.*
```typescript
interface LecturerEvaluationDoc {
  id: string;
  lecturerId: string;         // References active teacher or candidate
  lecturerName: string;
  isDemo: boolean;
  studentId: string;          // Evaluator student ID
  ratingLoudClear: number;    // Scale 1-10
  ratingTalented: number;
  ratingClassManagement: number;
  ratingGadgetFree: number;
  ratingTemperControl: number;
  ratingActiveEnergy: number;
  ratingInteractive: number;
  ratingPaceOfTeaching: number;
  ratingRealLifeContext: number;
  comments?: string;
  createdAt: string;
}
```

#### 15. `/recruitmentCandidates` (Collection)
*HR evaluation profiles.*
```typescript
interface RecruitmentCandidateDoc {
  id: string;
  name: string;
  role: string;
  experience: string;
  phone: string;
  email: string;
  status: 'Interviewing' | 'Demo Lecture' | 'Offered' | 'Joined' | 'Rejected';
  createdAt: string;
}
```

#### 16. `/jobApplications` (Collection)
*Careers inbox for external candidates.*
```typescript
interface JobApplicationDoc {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  experience: string;
  resumeUrl?: string;
  createdAt: string;
}
```

#### 17. `/communicationLogs` (Collection)
*SMS and WhatsApp outbound transmission registries. Separated to prevent memory bloat.*
```typescript
interface CommunicationLogDoc {
  id: string;
  senderId: string;
  senderName: string;
  recipients: string[];
  channel: 'SMS' | 'WhatsApp' | 'Email' | 'Push';
  message: string;
  deliveryStatus: 'Delivered' | 'Sent' | 'Failed';
  createdAt: string;
}
```

#### 18. `/crashLogs` (Collection)
*Centralized application error reporting logs.*
```typescript
interface CrashLogDoc {
  id: string;
  message: string;
  stack?: string;
  userId?: string;
  userRole?: string;
  path?: string;
  createdAt: string;
}
```

#### 19. `/dailyRemarks` (Collection)
*Daily progress metrics.*
```typescript
interface DailyRemarkDoc {
  id: string;
  studentId: string;          // References /students/{studentId}
  remarkText: string;
  rating?: number;            // 1-5
  teacherName: string;
  date: string;               // YYYY-MM-DD
  createdAt: string;
}
```

#### 20. `/books` (Collection)
*Digital library catalogs. Access levels control user visibility.*
```typescript
interface LibraryBookDoc {
  id: string;
  title: string;
  subject: string;
  classLevel: 'IX' | 'X' | 'XI' | 'XII' | 'All';
  course: 'Foundation' | 'NEET' | 'JEE' | 'Boards' | 'General';
  author: string;
  publisher: string;
  fileUrl: string;
  fileSize: string;
  downloadCount: number;
  accessLevel: 'all' | 'class_ix' | 'class_x' | 'class_xi' | 'class_xii' | 'foundation' | 'neet' | 'jee' | 'batch' | 'individual';
  allowedBatchIds?: string[];
  createdAt: string;
}
```

---

## 3. Required Firestore Composite Indexes

Single-field queries are indexed automatically. To support complex UI dashboard filters, stats aggregation, and history logs without raising exceptions, the following **Composite Indexes** must be provisioned:

1. **`attendance`**: `batchId` (Ascending) + `date` (Descending)
   - *Query*: Retrieve a batch's past rolls in reverse chronological order.
2. **`grades`**: `studentId` (Ascending) + `completedAt` (Descending)
   - *Query*: Display a learner's exam scorecard sorted by latest completed date.
3. **`teacherAttendance`**: `teacherId` (Ascending) + `date` (Descending)
   - *Query*: Generate work hour spreadsheets for faculty monthly payroll.
4. **`alumniMessages`**: `roomId` (Ascending) + `createdAt` (Descending)
   - *Query*: Paginate live chat streams within room partitions.
5. **`lecturerEvaluations`**: `lecturerId` (Ascending) + `createdAt` (Descending)
   - *Query*: Retrieve teaching performance evaluations in order.
6. **`notices`**: `targetRole` (Ascending) + `important` (Descending) + `date` (Descending)
   - *Query*: Fetch announcements filtering for a role, pinning important alerts.
7. **`fees`**: `studentId` (Ascending) + `date` (Descending)
   - *Query*: Build historical invoices and balance ledgers for a student.

---

## 4. Scalable Security Rules (`firestore.rules`)

*This rule set secures all data at the document level. It dynamically checks authentication state, approval status, and matches RBAC roles stored inside the master `/users/{uid}` document:*

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Global session helpers
    function isSignedIn() {
      return request.auth != null;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function isApproved() {
      return getUserData().approved == true;
    }

    function getRole() {
      return getUserData().role;
    }

    function hasAnyRole(roles) {
      return isSignedIn() && isApproved() && (getRole() in roles);
    }

    function isAdmin() {
      return hasAnyRole(['admin', 'principal']);
    }

    // 1. Users Security
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      // Allow self-registration or admin updates. Prevent users from escalating their own role.
      allow update: if isAdmin() || (request.auth.uid == userId && request.resource.data.role == resource.data.role);
      allow delete: if isAdmin();
    }

    // 2. Settings Security
    match /settings/{settingId} {
      allow read: if isSignedIn() && isApproved();
      allow write: if isAdmin();
    }

    // 3. Courses & Batches
    match /courses/{courseId} {
      allow read: if isSignedIn() && isApproved();
      allow write: if isAdmin();
    }
    match /batches/{batchId} {
      allow read: if isSignedIn() && isApproved();
      allow write: if isAdmin() || hasAnyRole(['office_staff']);
    }

    // 4. Students Collection & Subcollections
    match /students/{studentId} {
      allow read: if isSignedIn() && isApproved();
      allow write: if isAdmin() || hasAnyRole(['office_staff']);
      
      // Subcollections
      match /documents/{docId} {
        allow read: if isSignedIn() && isApproved();
        allow write: if isAdmin() || hasAnyRole(['office_staff']);
      }
      match /modificationHistory/{historyId} {
        allow read: if isAdmin();
        allow create: if isSignedIn() && isApproved();
        allow update, delete: if false; // Non-destructive audit trail
      }
      match /revisionBatches/{batchId} {
        allow read: if isSignedIn() && isApproved();
        allow write: if isAdmin() || hasAnyRole(['office_staff']);
      }
    }

    // 5. Teachers Collection & Subcollections
    match /teachers/{teacherId} {
      allow read: if isSignedIn() && isApproved();
      allow write: if isAdmin() || hasAnyRole(['office_staff']);

      // Subcollections
      match /leaves/{leaveId} {
        allow read: if isSignedIn() && isApproved();
        allow write: if isAdmin() || (isSignedIn() && getUserData().associatedId == teacherId);
      }
      match /timetables/{slotId} {
        allow read: if isSignedIn() && isApproved();
        allow write: if isAdmin() || hasAnyRole(['office_staff']);
      }
      match /documents/{docId} {
        allow read: if isAdmin() || (isSignedIn() && getUserData().associatedId == teacherId);
        allow write: if isAdmin() || (isSignedIn() && getUserData().associatedId == teacherId);
      }
      match /disbursements/{payoutId} {
        allow read: if isAdmin() || hasAnyRole(['accountant']) || (isSignedIn() && getUserData().associatedId == teacherId);
        allow write: if isAdmin() || hasAnyRole(['accountant']);
      }
      match /communications/{logId} {
        allow read: if isAdmin() || (isSignedIn() && getUserData().associatedId == teacherId);
        allow write: if isAdmin() || hasAnyRole(['office_staff']);
      }
    }

    // 6. Student Daily Attendance
    match /attendance/{attendanceId} {
      allow read: if isSignedIn() && isApproved();
      allow write: if isAdmin() || hasAnyRole(['teacher', 'office_staff']);
    }

    // 7. Teacher punch logs
    match /teacherAttendance/{logId} {
      allow read: if isAdmin() || hasAnyRole(['office_staff', 'accountant']) || (isSignedIn() && getUserData().associatedId == resource.data.teacherId);
      allow write: if isAdmin() || hasAnyRole(['office_staff', 'teacher']);
    }

    // 8. Study Materials & Homework
    match /materials/{materialId} {
      allow read: if isSignedIn() && isApproved();
      allow write: if isAdmin() || hasAnyRole(['teacher', 'office_staff']);
    }

    // 9. Quizzes & Student Grades
    match /quizzes/{quizId} {
      allow read: if isSignedIn() && isApproved();
      allow write: if isAdmin() || hasAnyRole(['teacher']);
    }
    match /grades/{gradeId} {
      allow read: if isSignedIn() && isApproved();
      // Allow student self-submission
      allow create: if isSignedIn() && isApproved() && getRole() == 'student';
      allow update, delete: if isAdmin() || hasAnyRole(['teacher']);
    }

    // 10. Fees Receipts
    match /fees/{feeId} {
      allow read: if isAdmin() || hasAnyRole(['accountant']) || (isSignedIn() && getUserData().associatedId == resource.data.studentId);
      allow write: if isAdmin() || hasAnyRole(['accountant']);
    }

    // 11. Board Notices & Calendars
    match /notices/{noticeId} {
      allow read: if isSignedIn() && isApproved();
      allow write: if isAdmin() || hasAnyRole(['office_staff']);
    }

    // 12. Public landing modules (Testimonials & Gallery)
    match /testimonials/{testId} {
      allow read: if true; // Publicly viewable
      allow write: if isAdmin() || isSignedIn();
    }
    match /gallery/{itemId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 13. HR, Candidates & Job Applications
    match /recruitmentCandidates/{candidateId} {
      allow read: if isAdmin() || hasAnyRole(['hod', 'principal']);
      allow write: if isAdmin() || hasAnyRole(['hod']);
    }
    match /jobApplications/{appId} {
      allow read: if isAdmin() || hasAnyRole(['hod']);
      allow create: if true; // Allows anonymous CV uploads
      allow update, delete: if isAdmin() || hasAnyRole(['hod']);
    }

    // 14. Logs & Metrics
    match /crashLogs/{logId} {
      allow read: if isAdmin();
      allow create: if true; // Uncaught client crashes logged anonymously
      allow update, delete: if isAdmin();
    }
    match /communicationLogs/{logId} {
      allow read: if isAdmin() || hasAnyRole(['office_staff']);
      allow write: if isAdmin() || hasAnyRole(['office_staff']);
    }
    match /dailyRemarks/{remarkId} {
      allow read: if isSignedIn() && isApproved();
      allow write: if isAdmin() || hasAnyRole(['teacher']);
    }
    match /books/{bookId} {
      allow read: if isSignedIn() && isApproved();
      allow write: if isAdmin() || hasAnyRole(['librarian']);
    }
  }
}
```

---

## 5. Required Cloud Functions (Automation Engine)

To handle heavy background processing, maintain referential integrity, and secure notifications, five Cloud Functions are proposed:

1. **`onUserCreated` (Auth Trigger)**:
   - *Purpose*: Automatically creates a `/users/{uid}` shadow document upon email registration, setting `approved: false` and establishing defaults.
2. **`onStudentDeleted` (Firestore Trigger)**:
   - *Purpose*: Cleans up subcollections (`/documents`, `/revisionBatches`, `/modificationHistory`) when a student is deleted, preventing orphan storage.
3. **`onAttendanceLogged` (Firestore Trigger)**:
   - *Purpose*: Aggregates daily student attendance percentages. Triggers automated WhatsApp and SMS alerts to parents if a student is marked "Absent".
4. **`onFeeReceiptCreated` (Firestore Trigger)**:
   - *Purpose*: Automatically adjusts `totalFeesPaid` and `totalFeesDue` nested attributes inside `/students/{studentId}` upon new receipt submissions. This ensures transactional data integrity.
5. **`onNoticeCreated` (Firestore Trigger)**:
   - *Purpose*: Pushes FCM (Firebase Cloud Messaging) notifications to targeted devices based on the `targetRole` (students, parents, or teachers).

---

## 6. Execution Migration Plan & Rollback Strategy

To migrate the active database with **zero downtime**, we implement an incremental, automated pipeline:

### Step 1: Automated Safety Backup
Before executing any remote operations, the server executes a local backup pipeline, writing the current JSON snapshot of `/database.json` to `/database.backup.json`. This backup is preserved in-place as a persistent physical fallback copy on the server container.

### Step 2: Enable Storage Coexistence (Dual-Write Adapter)
The server adopts a dual-write pipeline. Setting `USE_FIRESTORE=true` in `.env` activates the system. During writes (POST/PUT/DELETE), the server writes to **both** database adapters simultaneously, keeping records in sync during verification. 
- If Firestore throws a connection error or latency threshold exceeds 5 seconds, the server logs a warning and continues writing to the local `/database.json` file fallback, ensuring high availability.
- A background reconciliation worker marks any unsynced records to be re-attempted.

### Step 3: Run the Seeding Script
An administrative utility `POST /api/system/migrate-to-firestore` processes database arrays and uploads them in transactional batches. It maps:
- Top-level arrays directly to collections.
- Deconstructs student history, attached records, and teacher payroll disbursements into their corresponding subcollections.

### Step 4: Verification & Consistency Check
Compare the counts of Firestore records with local file rows. Ensure all records match. If any verification mismatch occurs, the migration is marked compromised, and we invoke the Rollback Strategy.

### Step 5: Rollback Strategy
If critical latency anomalies, data corrupted checks, or validation mismatches occur during or immediately after step 4, the following rollback steps are executed:
1. **Disable Cloud Persistence**: Instantly set `USE_FIRESTORE=false` inside the server `.env` or configuration container variables.
2. **Revert to Local Persistence**: The server automatically redirects all reads and writes back to the secure `/database.json` store without restarting.
3. **Audit Trail Recovery**: Apply any delta records written during the transient dual-write window back to the local database file from the logged request streams to ensure zero data loss.
4. **Clean Remote State**: Purge any incomplete test collections in the Firestore database under the active project.

---

## 7. Disaster Recovery & Backup Plan (DRP)

To protect the production institutional data against manual accidents, service interruptions, or storage corruptions:

### A. Point-in-Time Backups
1. **Firestore Automated Exports**: Establish a Google Cloud Scheduler cron job that triggers a Cloud Function daily to export Firestore documents to an external, multi-region Google Cloud Storage (GCS) bucket (`gs://learners-den-backups-production`).
2. **Retention Policy**: Implement a lifecycle policy on the bucket to retain daily backups for 30 days, weekly backups for 12 weeks, and monthly snapshots for 1 year.

### B. Disaster Recovery Procedures
1. **Data Loss Incident**: If data is accidentally deleted, run the gcloud CLI restore script:
   `gcloud firestore import gs://learners-den-backups-production/2026-XX-XX-timestamp/`
2. **Service Interruption Fallback**: If Google Cloud Firestore experiences an extended region-wide outage, the ERP-LMS automatically falls back to containerized SQLite or JSON file mode, running in read-only status to protect administrative sanity until service recovery.

---

## 8. Cost Estimations & Hotspot Isolation

### Estimated Operating Costs (1,000 Active Users)

- **Average Daily Reads**: 80,000 operations
  - *Free Allowance*: 50,000 ops
  - *Billable*: 30,000 ops * $0.06/100,000 = **$0.018 / day**
- **Average Daily Writes**: 25,000 operations
  - *Free Allowance*: 20,000 ops
  - *Billable*: 5,000 ops * $0.18/100,000 = **$0.009 / day**
- **Average Storage**: 5 GB
  - *Free Allowance*: 1 GB
  - *Billable*: 4 GB * $0.18/GB = **$0.72 / month**
- **Total Estimated Cost**: **~$1.53 USD / month** (Highly cost-efficient).

### Hotspot Prevention (Firestore Constraints)
Firestore enforces a **1 write per second** limitation on any single document.
- **Identified Hotspot**: Global system dashboard tallies (e.g., total student enrollment counts, total accumulated revenue). If multiple transactions increment a single settings document concurrently, queries will block or fail.
- **Prevention Strategy**: Instead of keeping dynamic totals nested inside a central settings document, write transaction records to flat collections (`/fees` and `/students`). The server then calculates averages in memory or aggregates daily tallies in flat cache files, preventing direct single-document high-concurrency writes.
