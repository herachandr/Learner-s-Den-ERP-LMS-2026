# Learner's Den ERP-LMS REST API Specifications

This document defines and specifies all backend REST API routes exposed by the Express server. These routes serve as the communication layer between React components/repositories and the local persistence engine, while executing background dual-write tasks to Google Cloud Firestore.

---

## 1. Authentication & Security Endpoints

### POST `/api/auth/signup`
Creates a new user profile, registers relevant sub-entities (such as creating a student profile if role is 'student'), and returns credentials.
- **Request Body**:
  ```json
  {
    "email": "student-1@learnerden.com",
    "password": "securepassword",
    "name": "Aarav Sharma",
    "role": "student",
    "phone": "+91 98234 56789",
    "parentName": "Ramesh Sharma",
    "batchId": "batch-1"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": "user-student-1",
    "email": "student-1@learnerden.com",
    "name": "Aarav Sharma",
    "role": "student",
    "approved": true
  }
  ```

### POST `/api/auth/login`
Authenticates user, verifies device identifiers, triggers 2FA security OTP generation when required, and signs JWT.
- **Request Body**:
  ```json
  {
    "email": "admin-1@learnerden.com",
    "password": "securepassword",
    "deviceId": "device-xyz123"
  }
  ```
- **Response (200 OK - Standard)**:
  ```json
  {
    "id": "admin-1",
    "email": "admin-1@learnerden.com",
    "name": "Test Admin",
    "role": "admin",
    "token": "ey..."
  }
  ```

---

## 2. Student Management Endpoints

### GET `/api/students`
Retrieves a list of all registered student profiles. Supports filtering via URL search parameters.
- **Query Params**: `batchId` (optional), `feeStatus` (optional)
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "student-hera",
      "name": "Hera Chandr",
      "email": "herachandr@gmail.com",
      "phone": "+91 98234 56789",
      "parentName": "Ramesh Iyer",
      "batchId": "",
      "admissionDate": "2026-07-03",
      "feeStatus": "Pending",
      "totalFeesPaid": 0,
      "totalFeesDue": 0,
      "approved": true
    }
  ]
  ```

### POST `/api/students`
Registers a new student profile in the system. Triggers backend dual-write to Firestore collection `students`.
- **Request Body**: Partial student record.
- **Response (200 OK)**: Full created student record.

### PUT `/api/students/:id`
Updates an existing student profile.
- **Response (200 OK)**: Updated student object.

### DELETE `/api/students/:id`
Deletes a student from the system. Removes from both `/database.json` and Firestore in real-time.

---

## 3. Financial Endpoints

### GET `/api/fees`
Retrieves all recorded transaction receipts.
- **Response (200 OK)**: Array of `FeeReceiptDoc`.

### POST `/api/fees`
Records a fee payment, decreases due balance of relevant student, generates a unique transaction invoice code, and dual-writes to the `fees` collection.
- **Request Body**:
  ```json
  {
    "studentId": "student-hera",
    "amount": 1500,
    "paymentMode": "UPI",
    "receiptNo": "REC-2026-001"
  }
  ```

---

## 4. Library & Digital Assets

### GET `/api/books`
Retrieves lists of books registered in the offline and digital catalog.
- **Response (200 OK)**: Array of `LibraryBook`.

### POST `/api/books`
Adds a new book or digital resource to the inventory list.
- **Request Body**: Complete book payload.

---

## 5. Metadata & System Config

### GET `/api/config`
Exposes system environment settings (such as active databases, feature toggles, or integration levels).
- **Response (200 OK)**:
  ```json
  {
    "useFirestore": true,
    "version": "1.4.0",
    "environment": "production"
  }
  ```

---

## 6. Career Guidance & AI Endpoints

### POST `/api/gemini/career`
Queries the server-side Gemini 3.5 Flash model using detailed diagnostic parameters to generate structured career pathways and full cognitive assessment text.
- **Request Body**:
  ```json
  {
    "interests": ["Software Coding & Scripting", "Artificial Intelligence"],
    "subjects": ["Computer Science", "Mathematics"],
    "workStyle": "Collaborative",
    "theoryVsPractice": "practical",
    "educationLevel": "Degree",
    "locationPreference": "Flexible",
    "salaryExpectation": 600000,
    "entrepreneurialInclination": true,
    "studentDetails": {
      "name": "Hera Chandr",
      "batchId": "batch-1"
    }
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "pathways": [
      {
        "title": "Machine Learning Engineer",
        "fitPercentage": 95,
        "whyMatch": "Strong alignment with coding interests and advanced mathematics.",
        "demandedSkills": ["Python", "TensorFlow", "Linear Algebra"],
        "roadmap": [
          "Complete CS Degree",
          "Acquire Python data science certifications",
          "Build portfolio on GitHub"
        ]
      }
    ],
    "analysis": "### AI Career Counseling Blueprint for Success\n..."
  }
  ```
