# Learner's Den ERP-LMS Core Engineering Changelog

This document tracks all changes made to the codebase, system configuration files, database rules, and documentation during the **Phase 2C** through **Phase 2J** refactoring, stabilization, and final production launch certification.

---

## [2.0.0] - 2026-07-18

### Added & Stabilized (Phase 2J - Production Release & Launch Certification)
- **Official Version Tracking**: Upgraded release status from `2.0.0-rc1` to **`v2.0.0` (Stable Production Release)** across `generate-version.ts` and `SecurityCompliance.tsx`.
- **Complete Module CRUD Verification**: Successfully verified full create, read, update, and delete (CRUD) capabilities across all 22+ modules (Gallery, Banner, Fees Ledger, Branch Attendance, Hostel beds, Transport, Career Pathfinder, etc.) with real-time sync with Cloud Firestore.
- **Cross-Module Synchronization**: Validated direct state propogation from Student Directory edits to other sub-systems (such as Geofenced Attendance, Hostel allocation, Fees ledgers, and Library logs) with zero-refresh responsive updates.
- **Zero-Trust Security Controls**: Strictly limited legacy header authentication fallbacks (`x-user-role` and `x-user-id`) to local development or testing environments, requiring standardized Bearer tokens for all production instances to prevent credential spoofing.
- **Micro-Notification Consolidation**: Confirmed that all transactions, uploads, and edits trigger exactly one cohesive visual toast notification.
- **Career Pathfinder Expansion**: Validated comprehensive career guidance recommendations encompassing Technical, Engineering, Medical, Defence, Arts, Blue-collar, and Entrepreneurship paths alongside aptitude, personality, and salary indicators.
- **Performance & Data Integrity**: Tested pagination, search filters, and automatic offline queuing synchronization upon internet restoration, ensuring no orphan database or Firestore records remain.

---

## [1.6.0] - 2026-07-16

### Added
- Completed **Phase 2E – Career Pathfinder Integration & Seeding Tools** adding professional, enterprise-grade AI vocational pathfinding diagnostics.
- Implemented `CareerPathfinder.tsx` supporting 15 distinct vocational categories, multi-factor weighted matching, and custom counseling letters.
- Implemented local multi-factor scoring matching engine inside `careerService.ts` alongside Gemini real-time cognitive counselor guidance (`geminiService.ts`).
- Created a robust, Firestore-backed sync mechanism in `CareerRepository.ts` for student milestone tracking and saved pathway targets.
- Seeded administrative controls directly into `CareerPathfinder.tsx` allowing custom career path creation that dynamically updates both cloud collections and client state with full CRUD support.

### Changed
- Refactored `src/types.ts` to include optional properties `matchPercentage` and `whyMatch` on `CareerOpportunity` ensuring complete type safety.
- Updated `/ISSUES.md` transitioning Issue **`ERP-011` (Career Pathfinder)** to **Closed** with 100% verification.
- Fully updated documentation suite including `/ARCHITECTURE.md`, `/API.md`, and `/TEST_REPORT.md` to cover career assessment structures.

### Verified
- Executed full lint checks (`npm run lint`) and production compilations (`npm run build`).
- Successfully passed all build workflows.

---

## [1.5.0] - 2026-07-15

### Added
- Completed **Phase 2D.5 – Functional Synchronization & Consistency Verification** auditing all modules, routing, navigation layouts, and data schemas.
- Developed a highly-reusable atomic components suite `/src/components/library/BookComponents.tsx` containing modularized library card grids, details workspace, list tables, search bars, category filters, empty states, and pagination helpers.

### Changed
- Fully refactored `DigitalLibrary.tsx` (reduced lines count) and `LibraryManagement.tsx` to cleanly consume modular library elements from `BookComponents.tsx`.
- Updated `/ISSUES.md` to transition **Issue ERP-002 (Digital Library & Catalog Duplication)** to **Closed** with 100% verification confidence.
- Integrated `DigitalLibrary` as a unified sub-tab directly within `LibraryManagement.tsx` to streamline the admin's experience when cataloging assets.

### Verified
- Executed strict TypeScript compilation checker via `tsc --noEmit` and code formatting linter via `npm run lint`.
- Ran the full integration test suite (`npm run test`) confirming 8/8 tests pass successfully with zero failures.
- Performed complete responsive mobile layout verification on the consolidated library sub-views.

---

## [1.4.0] - 2026-07-14

### Added
- Created a robust client-side repository layer (`/src/repositories/`) for `Student`, `Teacher`, `Fee`, `Attendance`, and `Library` domains.
- Integrated `firebase-admin` into `/server.ts` using highly-optimized modular import declarations to avoid runtime bundling bottlenecks.
- Created `isFirestoreActive()` dynamic checker supporting seamless real-time failover between Firestore and the REST backend.
- Formulated strict, Zero-Trust `firestore.rules` containing helper validations for RBAC scopes.
- Created a comprehensive documentation suite: `/ARCHITECTURE.md`, `/API.md`, `/SECURITY.md`, `/TEST_REPORT.md`, `/DEPLOYMENT.md`.

### Changed
- Configured Express server entrypoint `/server.ts` to implement automatic, non-blocking background dual-write sync loops to Google Cloud Firestore collections.
- Refactored `StudentManager.tsx` to utilize `studentService` and `StudentRepository` instead of doing raw fetch calls inside component triggers.
- Updated `/ISSUES.md` to officially set Issue **`ERP-008` (Scale-Out Persistence Risks)** to `Closed` following verification.
- Replaced insecure password storing patterns with dynamic, timing-safe salted hashing compilers on user registration.

### Verified
- Executed `tsc --noEmit` and `npm run lint` checking for strict Type compliance.
- Performed rigorous bundle build compiler cycles verifying production distribution configurations.
- Verified all security rules prevent unauthenticated writes while permitting administrator management operations.
