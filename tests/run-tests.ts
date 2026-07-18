import { strict as assert } from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function loginAndGetToken(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed for ${email}: ${text}`);
  }
  const data = await res.json();
  if (!data.token) {
    throw new Error(`No token returned during login for ${email}`);
  }
  return data.token;
}

async function runTests() {
  console.log('====================================================');
  console.log('     LEARNER\'S DEN ERP-LMS INTEGRATION TEST RUNNER  ');
  console.log('====================================================');

  const testCases = [
    { name: '1. API Health Check', fn: testHealthCheck },
    { name: '2. Unauthorized Request Blocking (401)', fn: testAuthBlocking },
    { name: '3. RBAC Violation Blocking (403)', fn: testRbacBlocking },
    { name: '4. Authorized Access (Admin Access to Stats)', fn: testAdminStatsAccess },
    { name: '5. End-to-End Recruitment Candidate Lifecycle', fn: testCandidatesLifecycle },
    { name: '6. End-to-End Lecturer Evaluation Lifecycle', fn: testLecturerEvaluationsLifecycle },
    { name: '7. End-to-End Job Application Lifecycle', fn: testJobApplicationsLifecycle },
    { name: '8. Crash Reporting Error Isolation & Health Endpoint', fn: testCrashReportingAndLogs },
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    console.log(`\n▶ Running: ${tc.name}...`);
    try {
      await tc.fn();
      console.log(`✓ PASSED: ${tc.name}`);
      passed++;
    } catch (err: any) {
      console.error(`✗ FAILED: ${tc.name}`);
      console.error(`  Error:`, err.message);
      if (err.stack) {
        console.error(`  Stack:`, err.stack);
      }
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`TEST RUN COMPLETED.`);
  console.log(`PASSED: ${passed}/${testCases.length}`);
  console.log(`FAILED: ${failed}/${testCases.length}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// 1. Health Check Test
async function testHealthCheck() {
  const res = await fetch(`${BASE_URL}/api/health`);
  assert.equal(res.status, 200, 'Health endpoint should return 200 OK');
  const data = await res.json();
  assert.equal(data.status, 'ok', 'Health response status should be ok');
}

// 2. Auth Blocking Test (401 Missing Role/ID Headers)
async function testAuthBlocking() {
  const res = await fetch(`${BASE_URL}/api/stats`);
  assert.equal(res.status, 401, 'Request with missing auth headers should return 401');
  const data = await res.json();
  assert.ok(data.error.toLowerCase().includes('denied') || data.error.toLowerCase().includes('missing'), 'Error message should indicate access is denied/missing');
}

// 3. RBAC Blocking Test (403 Role Forbidden to Admin Endpoint)
async function testRbacBlocking() {
  const token = await loginAndGetToken('student-1@learnerden.com', 'password123');
  const res = await fetch(`${BASE_URL}/api/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  assert.equal(res.status, 403, 'Students should be blocked from stats with 403 Forbidden');
  const data = await res.json();
  assert.ok(data.error.toLowerCase().includes('denied'), 'Error message should mention Access Denied');
}

// 4. Authorized Access
async function testAdminStatsAccess() {
  const token = await loginAndGetToken('admin-1@learnerden.com', 'password123');
  const res = await fetch(`${BASE_URL}/api/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  assert.equal(res.status, 200, 'Admins should have access to stats with 200 OK');
  const data = await res.json();
  assert.ok('totalRevenue' in data, 'Stats response should include totalRevenue');
}

// 5. Candidate Lifecycle Test
async function testCandidatesLifecycle() {
  const token = await loginAndGetToken('hod-1@learnerden.com', 'password123');
  
  // Test listing (HOD Role)
  const resGet = await fetch(`${BASE_URL}/api/recruitment-candidates`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  assert.equal(resGet.status, 200, 'HOD should be authorized to read candidates');
  const candidatesList = await resGet.json();
  assert.ok(Array.isArray(candidatesList), 'Candidates response should be an array');

  // Test submitting a candidate (HOD Role)
  const uniqueCandidateName = 'Test Candidate ' + Date.now();
  const newCandidate = {
    name: uniqueCandidateName,
    role: 'Physics Assistant Professor',
    experience: '3 Years',
    phone: '+91 90000 00000',
    email: 'test.cand@den.com',
    status: 'Interviewing'
  };

  const resPost = await fetch(`${BASE_URL}/api/recruitment-candidates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(newCandidate)
  });
  assert.equal(resPost.status, 200, 'HOD should successfully post candidate');
  const postData = await resPost.json();
  assert.equal(postData.success, true, 'Response success flag must be true');
  assert.equal(postData.candidate.name, uniqueCandidateName, 'Saved candidate name should match');
  assert.ok(postData.candidate.id, 'Candidate should have an assigned ID');
}

// 6. Lecturer Evaluations Lifecycle
async function testLecturerEvaluationsLifecycle() {
  const studentToken = await loginAndGetToken('student-1@learnerden.com', 'password123');
  const hodToken = await loginAndGetToken('hod-1@learnerden.com', 'password123');

  // Submit an evaluation as a student
  const newEval = {
    lecturerId: 'teacher-1',
    lecturerName: 'Prof. Rajesh Patel',
    ratingLoudClear: 9,
    ratingTalented: 8,
    ratingClassManagement: 9,
    ratingGadgetFree: 10,
    ratingTemperControl: 9,
    ratingActiveEnergy: 9,
    ratingInteractive: 9,
    ratingPaceOfTeaching: 8,
    ratingRealLifeContext: 9,
    comments: 'Superb and structured physics explanations.'
  };

  const resPost = await fetch(`${BASE_URL}/api/lecturer-evaluations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify(newEval)
  });
  assert.equal(resPost.status, 200, 'Students should be authorized to submit evaluations');
  const postData = await resPost.json();
  assert.equal(postData.success, true, 'Submit evaluation should succeed');
  assert.ok(postData.evaluation.id, 'Evaluation should be assigned an ID');

  // Verify list retrieval as HOD
  const resGet = await fetch(`${BASE_URL}/api/lecturer-evaluations`, {
    headers: {
      'Authorization': `Bearer ${hodToken}`
    }
  });
  assert.equal(resGet.status, 200, 'HOD should be authorized to list lecturer evaluations');
  const evaluationsList = await resGet.json();
  assert.ok(Array.isArray(evaluationsList), 'Evaluations response should be an array');
  const found = evaluationsList.find((e: any) => e.lecturerId === 'teacher-1' && e.comments === 'Superb and structured physics explanations.');
  assert.ok(found, 'Submitted evaluation should be present in the backend collection');
}

// 7. Job Applications Lifecycle
async function testJobApplicationsLifecycle() {
  const seekerToken = await loginAndGetToken('seeker-1@learnerden.com', 'password123');
  const adminToken = await loginAndGetToken('admin-1@learnerden.com', 'password123');

  const uniqueName = 'Job Seeker ' + Date.now();
  const newApp = {
    name: uniqueName,
    email: 'seeker@jobden.com',
    phone: '+91 88888 88888',
    subject: 'Chemistry',
    experience: '5 Years'
  };

  // Submit as job_seeker
  const resPost = await fetch(`${BASE_URL}/api/job-applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${seekerToken}`
    },
    body: JSON.stringify(newApp)
  });
  assert.equal(resPost.status, 200, 'Job seeker should be authorized to submit a CV profile');
  const postData = await resPost.json();
  assert.equal(postData.success, true, 'CV submission should succeed');
  assert.ok(postData.application.id, 'Job application should be assigned an ID');

  // Retrieve as admin/HOD
  const resGet = await fetch(`${BASE_URL}/api/job-applications`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  assert.equal(resGet.status, 200, 'Admin should be authorized to read job applications');
  const list = await resGet.json();
  assert.ok(Array.isArray(list), 'Job applications list should be an array');
  const found = list.find((a: any) => a.name === uniqueName);
  assert.ok(found, 'Submitted application should be retrievable from the server');
}

// 8. Crash Reporting & Test Endpoint
async function testCrashReportingAndLogs() {
  // Trigger system test endpoint to generate a caught mock crash
  const resTest = await fetch(`${BASE_URL}/api/system/simulate-error`);
  assert.equal(resTest.status, 500, 'System crash test endpoint should return 500 Internal Server Error');
  const dataTest = await resTest.json();
  assert.ok(dataTest.error, 'Response should contain error explanation');

  // Retrieve logs as admin
  const adminToken = await loginAndGetToken('admin-1@learnerden.com', 'password123');
  const resLogs = await fetch(`${BASE_URL}/api/system/logs`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  assert.equal(resLogs.status, 200, 'Admins should be authorized to fetch crash logs');
  const dataLogs = await resLogs.json();
  const logsList = dataLogs.crashLogs;
  assert.ok(Array.isArray(logsList), 'System logs should be returned as an array');
  assert.ok(logsList.length > 0, 'Logs array should have at least the triggered test crash log');
  const newestLog = logsList[logsList.length - 1];
  assert.ok(newestLog.message.includes('Simulated system error'), 'Newest crash log should match simulated message');
}

runTests();
