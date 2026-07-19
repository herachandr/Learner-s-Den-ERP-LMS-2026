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
