# Learner's Den ERP-LMS Security & Access Control Specification

This document details the security specification, validation logic, role invariants, and test payload assertions for Phase 2J.3 (Security Hardening).

---

## 1. Data Invariants

1. **Role Invariant**: A user's profile role (`users/{userId}/role`) can only be modified by an `admin` or `principal`. A user registering their profile must not be allowed to self-assign any role other than a default role (`guest` or `student` depending on verification) unless approved.
2. **Payment Invariant**: No student or parent can modify or delete billing or receipt ledgers (`/fees/{feeId}`). Fee collection and entry are restricted to the `admin` and `accountant` roles.
3. **Attendance Validation**: Student attendance records can only be registered or altered by a `teacher`, `admin`, `principal`, or authorized `reception` staff.
4. **Biometric Punch Integrity**: Teachers cannot verify or edit `hoursWorked` or `verified` flags on their own `teacherAttendance` documents. This must be validated and certified by `admin` or `principal` roles.
5. **Library Access Restrictions**: Only the `librarian`, `principal`, or `admin` can insert, update, or remove books (`/books/{bookId}`) from the digital resource repository.
6. **Academic Integrity**: Students cannot write, modify, or delete Quiz configurations (`/quizzes/{quizId}`) or Materials (`/materials/{materialId}`).

---

## 2. The "Dirty Dozen" Payloads (Red Team Penetration Scenarios)

The following 12 JSON payloads must return `PERMISSION_DENIED` under all conditions:

### Payload 1: Admin Role Hijack (Self-Assignment)
*   **Path**: `/users/attacker-uid`
*   **Auth Context**: UID = `attacker-uid`, Role = `student`
*   **Payload**: `{"id": "attacker-uid", "role": "admin", "name": "Fake Admin", "approved": true}`
*   **Target Rule**: Reject updates to user profiles that elevate roles without admin authentication.

### Payload 2: Hostile Fee Deletion
*   **Path**: `/fees/receipt-123`
*   **Auth Context**: UID = `student-uid`, Role = `student`
*   **Operation**: `DELETE`
*   **Target Rule**: Deny delete access to anyone other than `admin` or `accountant`.

### Payload 3: Shadow Fee Receipt Injection
*   **Path**: `/fees/fake-receipt`
*   **Auth Context**: UID = `student-uid`, Role = `student`
*   **Payload**: `{"id": "fake-receipt", "studentId": "student-uid", "amount": 0, "paymentMode": "Cash", "receiptNo": "REC-999"}`
*   **Target Rule**: Deny create access to non-admin and non-accountant.

### Payload 4: Teacher Attendance Hours Tampering
*   **Path**: `/teacherAttendance/log-abc`
*   **Auth Context**: UID = `teacher-uid`, Role = `teacher`
*   **Payload**: `{"id": "log-abc", "teacherId": "teacher-uid", "hoursWorked": 120, "verified": true}`
*   **Target Rule**: Deny update of `hoursWorked` or `verified` field by the teacher themselves.

### Payload 5: Rogue Notice Insertion
*   **Path**: `/notices/fake-notice`
*   **Auth Context**: UID = `student-uid`, Role = `student`
*   **Payload**: `{"id": "fake-notice", "title": "Holiday Tomorrow", "content": "All classes are cancelled.", "category": "General", "important": true}`
*   **Target Rule**: Prevent notices from being created by student roles.

### Payload 6: Unauthenticated Guest Data Scraping (PII Leak)
*   **Path**: `/students/student-999`
*   **Auth Context**: `null` (Anonymous)
*   **Operation**: `GET`
*   **Target Rule**: Direct get/read of student master profiles must reject anonymous/guest attempts.

### Payload 7: Library Inventory Overwrite
*   **Path**: `/books/book-456`
*   **Auth Context**: UID = `student-uid`, Role = `student`
*   **Payload**: `{"id": "book-456", "title": "Injected Book Title", "fileUrl": "http://evil.com/payload.exe"}`
*   **Target Rule**: Reject book modifications unless user has `librarian` or `admin` role.

### Payload 8: Test Score Invalidation / Modification
*   **Path**: `/grades/grade-xyz`
*   **Auth Context**: UID = `student-uid`, Role = `student`
*   **Payload**: `{"id": "grade-xyz", "score": 100, "totalQuestions": 10, "studentId": "victim-uid"}`
*   **Target Rule**: Users must not be allowed to overwrite or modify other students' grade records.

### Payload 9: Invalid ID Path Pollution (ID Poisoning Guard)
*   **Path**: `/courses/course-$$%25%25junk%%$$`
*   **Auth Context**: UID = `admin-uid`, Role = `admin`
*   **Payload**: `{"id": "course-$$%25%25junk%%$$", "name": "Dangerous Course"}`
*   **Target Rule**: Document ID validation (`isValidId`) must reject illegal character sizes or formatting.

### Payload 10: Anonymous Feedback Manipulation
*   **Path**: `/anonymousFeedback/fb-111`
*   **Auth Context**: UID = `student-uid`, Role = `student`
*   **Operation**: `DELETE`
*   **Target Rule**: Standard users cannot delete feedback records.

### Payload 11: Shadow Leave Approval (Privilege Escalation)
*   **Path**: `/leaves/leave-teacher-1`
*   **Auth Context**: UID = `teacher-uid`, Role = `teacher`
*   **Payload**: `{"id": "leave-teacher-1", "teacherId": "teacher-uid", "status": "Approved"}`
*   **Target Rule**: Prevent self-approval of leaves.

### Payload 12: Terminal Quiz Outcome Corruption
*   **Path**: `/quizzes/quiz-101`
*   **Auth Context**: UID = `teacher-uid`, Role = `teacher`
*   **Payload**: `{"id": "quiz-101", "isAiGenerated": true}` (with extra unregistered parameters)
*   **Target Rule**: Block unauthorized field injections (affectedKeys validation).

---

## 3. The Test Runner (`tests/firestore.rules.test.ts`)

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

describe('Learner\'s Den Firebase Security Rules Verification', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'complete-platform-dwrl4',
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8')
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  test('Dirty Dozen 1: Reject user attempting to self-promote to admin', async () => {
    const studentDb = testEnv.authenticatedContext('attacker-uid').firestore();
    const docRef = studentDb.collection('users').doc('attacker-uid');
    
    // Attacking self profile
    await assertFails(
      docRef.set({
        id: 'attacker-uid',
        role: 'admin',
        name: 'Fake Admin',
        approved: true
      })
    );
  });

  test('Dirty Dozen 2: Reject student deleting fee ledger', async () => {
    const studentDb = testEnv.authenticatedContext('student-uid').firestore();
    await assertFails(
      studentDb.collection('fees').doc('receipt-123').delete()
    );
  });

  test('Dirty Dozen 3: Reject student writing shadow fee receipts', async () => {
    const studentDb = testEnv.authenticatedContext('student-uid').firestore();
    await assertFails(
      studentDb.collection('fees').doc('fake-receipt').set({
        id: 'fake-receipt',
        studentId: 'student-uid',
        amount: 500,
        paymentMode: 'Cash'
      })
    );
  });

  test('Dirty Dozen 4: Reject teacher self-verifying hoursWorked', async () => {
    const teacherDb = testEnv.authenticatedContext('teacher-uid').firestore();
    await assertFails(
      teacherDb.collection('teacherAttendance').doc('log-abc').set({
        id: 'log-abc',
        teacherId: 'teacher-uid',
        hoursWorked: 120,
        verified: true
      })
    );
  });

  test('Dirty Dozen 5: Block rogue student inserting a notice', async () => {
    const studentDb = testEnv.authenticatedContext('student-uid').firestore();
    await assertFails(
      studentDb.collection('notices').doc('fake-notice').set({
        title: 'Holiday Tomorrow',
        content: 'No classes'
      })
    );
  });

  test('Dirty Dozen 6: Block unauthenticated guest profile reads', async () => {
    const anonDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      anonDb.collection('students').doc('student-999').get()
    );
  });

  test('Dirty Dozen 7: Block student library catalog tampering', async () => {
    const studentDb = testEnv.authenticatedContext('student-uid').firestore();
    await assertFails(
      studentDb.collection('books').doc('book-456').set({
        title: 'Malicious Upload',
        fileUrl: 'http://evil.com/payload'
      })
    );
  });

  test('Dirty Dozen 8: Block modifying other students grade logs', async () => {
    const studentDb = testEnv.authenticatedContext('student-uid').firestore();
    await assertFails(
      studentDb.collection('grades').doc('grade-xyz').set({
        score: 100,
        studentId: 'victim-uid'
      })
    );
  });

  test('Dirty Dozen 9: Block ID Pollution matching invalid schema', async () => {
    const adminDb = testEnv.authenticatedContext('admin-uid').firestore();
    await assertFails(
      adminDb.collection('courses').doc('course-$$%junk%%$$').set({
        id: 'course-$$%junk%%$$',
        name: 'Dangerous Course Name'
      })
    );
  });

  test('Dirty Dozen 10: Block standard students from deleting feedback logs', async () => {
    const studentDb = testEnv.authenticatedContext('student-uid').firestore();
    await assertFails(
      studentDb.collection('anonymousFeedback').doc('fb-111').delete()
    );
  });

  test('Dirty Dozen 11: Block teacher self-approving leave application', async () => {
    const teacherDb = testEnv.authenticatedContext('teacher-uid').firestore();
    await assertFails(
      teacherDb.collection('leaves').doc('leave-1').set({
        id: 'leave-1',
        teacherId: 'teacher-uid',
        status: 'Approved'
      })
    );
  });

  test('Dirty Dozen 12: Block terminal outcome corruption via unexpected updates', async () => {
    const teacherDb = testEnv.authenticatedContext('teacher-uid').firestore();
    await assertFails(
      teacherDb.collection('quizzes').doc('quiz-101').update({
        id: 'quiz-101',
        isAiGenerated: true,
        extraInjection: 'malicious'
      })
    );
  });
});
```
