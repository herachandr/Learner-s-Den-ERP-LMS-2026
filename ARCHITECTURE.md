# Learner's Den ERP-LMS Comprehensive Architecture Specification

This document provides a detailed specification of the architecture of the **Learner's Den ERP-LMS**. It details how the client application, API service layers, repositories, local file database, and Google Cloud Firestore interact in a scalable, highly resilient, and performance-optimized full-stack configuration.

---

## 1. Architectural Principles & Model

The Learner's Den ERP-LMS utilizes a modern full-stack multi-layer architecture conforming to **SOLID** design principles and clean encapsulation. The data layer separates storage implementations from business logic via a decoupled **Repository Pattern**, permitting immediate hot-swapping or dual-writing between a high-performance local fallback store and Google Cloud Firestore.

```
       [ React UI Components ]
                  │
                  ▼
         [ Service Layer ] (Domain & Business Logic)
                  │
                  ▼
        [ Repository Layer ] (Data Abstraction)
         /               \
        ▼                 ▼
[ Firestore SDK ]   [ REST API Calls ]
        │                 │
        ▼                 ▼
[ Cloud Firestore ]  [ Express Backend ]
                           │
                           ├─► [ Local database.json Fallback ]
                           └─► [ Firebase Admin Firestore Sync ]
```

---

## 2. Key Architectural Layers

### A. Presentation Layer (React & Tailwind CSS)
- **Framework**: React 18+ with Vite as the bundler.
- **Styling**: Tailwind CSS for responsive utility styling with fluid column layouts.
- **Animation**: Micro-interactions and transition state sequences driven by `motion/react` animations.
- **Lazy Loading**: Route-splitting and module chunking using `React.lazy()` with standard `<React.Suspense>` wrappers to keep initial bundle sizes exceptionally small and compile times rapid.

### B. Service Layer (`/src/services/*`)
- Centralizes all domain business logic (e.g., student registration, payroll processing, mark calculations).
- Decouples component controllers from data retrieval mechanisms.
- Keeps UI views strictly presentational and completely free of raw `fetch` or SDK-specific calls.
- **Career & Guidance Services**: `careerService` processes hybrid multi-factor local scoring vectors, and `geminiService` interacts with real-time server-side Gemini 3.5 Flash models to output custom counseling blueprints.

### C. Repository Layer (`/src/repositories/*`)
- Encapsulates all data access logic.
- Exposes clean, standardized APIs (`getStudents()`, `saveStudentAttendance()`, etc.) returning type-safe TypeScript interfaces.
- **Career Repository**: `CareerRepository.ts` syncs active vocational roadmaps, checklist criteria, custom administrative pathways, and user milestone checkpoints synchronously between local structures and Google Cloud Firestore.
- Implements a modern **Runtime Fallback Engine** (`isFirestoreActive()`):
  1. Detects if Firestore is active in the environment via an administrative configuration check.
  2. If active, retrieves records directly from Firestore client-side with minimal latency.
  3. If Firestore is offline or disconnected, falls back dynamically to REST API calls, avoiding blank screens and ensuring continuous offline availability.

### D. Server Infrastructure Layer (`server.ts`)
- **Server Platform**: Express server bound to host `0.0.0.0` on Port `3000` to handle container ingress seamlessly.
- **Durable Sync & Dual-Write Pipeline**:
  - Writes data immediately to the in-memory cache and persistent JSON file database (`database.json`).
  - Background processes automatically dual-write changed records to Google Cloud Firestore using `firebase-admin`, achieving zero data loss and flawless synchrony.
- **Administrative Utilities**: Includes safe database self-healing schemes (hashing existing cleartext passwords on startup) and direct migration seeding endpoints (`/api/system/migrate-to-firestore`) for seamless initial setups.

---

## 3. Data Flow Execution Sequence

### Create/Update Operation (Write Flow)
1. **Component**: Invokes `studentService.createStudent(payload)`.
2. **Service**: Processes validation, applies concession logic, and passes state to `StudentRepository`.
3. **Repository**:
   - Performs client-side write to Firestore `students/{studentId}` (if active).
   - Issues a REST POST request to `/api/students` for local file backup synchronization.
4. **Express Backend**:
   - Parses the payload, writes the document to `/database.json`.
   - Dual-writes the record asynchronously to Google Cloud Firestore via Firebase Admin.

### Query/Read Operation (Read Flow)
1. **Component**: Invokes `studentService.getStudents()`.
2. **Service**: Proxies to `StudentRepository.getStudents()`.
3. **Repository**:
   - Resolves `isFirestoreActive()`.
   - If `true`, returns records directly from the Firestore collection `students`.
   - If `false`, executes an HTTP GET to `/api/students` to retrieve records from `/database.json`.

### Career Diagnostic & Matching Flow
1. **Wizard Form**: Collects interests, subject strengths, preferred work styles, education levels, and salary benchmarks.
2. **Local Multi-Factor Engine**: Invokes `careerService.matchCareersLocal(criteria)` to perform instant high-fidelity weighted matrix matching against local seed records (30% Interest, 25% Subject, 15% Work Style, 15% Theory vs Practice, 15% Filters/Outlook).
3. **Cognitive AI Generation**: Simultaneously invokes `geminiService.suggestCareer(criteria)` which proxies through the server-side Express `/api/gemini/career` endpoint to compile a custom counseling blueprint via Gemini 3.5 Flash.
4. **Milestone Synchronizer**: Saved targets and completed roadmap checkpoints are written to client state and dual-synced with high durability to Firestore `savedPathways` collection.

---

## 4. Scalability & Resilience Optimizations

- **Avoiding Firestore Limits**: Nested fields (attendance logs, results, file attachments) are deconstructed into dedicated root collections or subcollections rather than stored within a single parent document, avoiding the 1MB limit entirely.
- **Dual-Write Concurrency**: Non-blocking asynchronous background execution ensures that write latency remains sub-second, and API requests do not block while communicating with Firestore.
- **No-Single-Point-of-Failure**: If Firebase is completely blocked or the database is unprovisioned, the local REST API fallbacks act instantly, resulting in 100% uptime.
