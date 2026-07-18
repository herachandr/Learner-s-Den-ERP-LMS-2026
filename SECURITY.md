# Learner's Den ERP-LMS Security & RBAC Specifications

This document defines and specifies the security posture, authentication flows, authorization checks, and data confidentiality constraints deployed across the Learner's Den Education Management System.

---

## 1. Authentication Pillars

### A. Timing-Safe Salted Password Hashing
- Under no circumstances does the application write or store plaintext passwords.
- The server uses a high-entropy salted password compiler during signup/authentication.
- Hashing uses a cryptographically secure pseudo-random number generator (CSPRNG) to generate a unique salt for each profile, hashing the input via a standardized key derivation function.
- Verification uses a time-constant string comparison mechanism to mitigate side-channel timing attacks.

### B. Two-Factor Authentication (2FA) & Dynamic OTPs
- To protect administrative operations from credential stuffing attacks, logins from unverified devices trigger a dynamic 5-digit verification code.
- Verification status is bound to the user's secure browser instance through signed cryptographic storage keys.

---

## 2. Granular Role-Based Access Control (RBAC)

The system deploys a strict, granular hierarchy of user roles, enforced server-side within the Express request cycle.

### User Role Hierarchy & Permissions

| Role | Hierarchy / Access Bounds | Permitted Operations |
| :--- | :--- | :--- |
| `admin` | Global Super-User | All CRUD operations across all modules, system configurations, and security tables. |
| `principal` | Global Academic Supervisor | Can view all records, approve admissions, register teachers, but restricted from DB modifications. |
| `teacher` | Batch/Academic Owner | Can manage attendance, post materials, generate tests, and input student remarks. |
| `student` | Restricted Self-Service | Can access digital lectures, attend quizzes, view personal attendance logs, and download receipts. |
| `parent` | Student Monitor Portal | Read-only access to their associated student profile, progress remarks, and due balances. |

### Express RBAC Middleware Execution
Security controls reside within `server.ts` intercepting incoming request heads before they hit routers:

```typescript
function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    const userRole = req.user?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: "Access Denied: Insufficient Privileges" });
    }
    next();
  };
}
```

---

## 3. Cloud Firestore Zero-Trust Rules (`firestore.rules`)

To enforce least-privilege access at the database level, the system deploys zero-trust `firestore.rules`.

1. **Default Deny**: All matches fallback to `{document=**}` allowing access only if explicitly granted.
2. **Authentication Requirement**: Direct read/write blocks anonymous access across all tables.
3. **Owner Isolation**: Users can update only their own profile document (`/users/{userId}`).
4. **Administrative Restraints**: Critical billing and configuration catalogs (`/fees`, `/courses`, `/batches`, `/books`, `/notices`) can only be modified by authenticating users with `admin` roles.

---

## 4. Development vs. Production Header Authentication Controls

To prevent administrative privilege escalation and spoofing in production environments:
- **Legacy Header Fallbacks (`x-user-role`, `x-user-id`)**: Strictly disabled by default in production.
- **Environment Verification**: The Express request interception logic only permits raw header fallbacks if `NODE_ENV === "development"` or if the explicit override feature flag `ALLOW_LEGACY_AUTH=true` is set.
- **Production Defaults**: Standard token-based authorization via JWT/Bearer credentials is required for all active client interactions, protecting the system against session hijacking and authorization bypass.
