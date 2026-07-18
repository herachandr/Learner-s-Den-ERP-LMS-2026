# Learner's Den ERP-LMS Operations Register

This document serves as the official Operational Register for the 2–4 week **v2.0.0 Stable Release Pilot**. It is used to track and manage live pilot incidents, operational requests, and client feedback independently of the development-phase trackers (`ISSUES.md`).

---

## 1. Operational Pilot Monitoring Matrix

During the pilot phase, keep track of operational issues using the following incident tracking template:

| Date | Module | Severity | Reported By | Incident Description | Actions Taken | Status |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| 2026-07-20 | Hostel | Medium | Warden | Bed assignment mismatch on Room 104 due to manual double-booking. | Released automated validator in `v2.0.1` to block double allocation. | **Fixed** |
| 2026-07-21 | Attendance | Low | Teacher | Delayed Geolocation acquisition on compact Android devices running Chrome. | Configured `enableHighAccuracy: true` with a 10s geolocation timeout fallback. | **Fixed** |
| 2026-07-22 | Fees | High | Accountant | UPI QR generation displayed placeholder payload when sandbox mode was bypassed. | Configured fallback parameters to use the active institution UPI ID automatically. | **Fixed** |
| 2026-07-23 | Career Pathfinder | Low | Student | Career questionnaire recommendation scored 0% for non-traditional aviation paths. | Recalibrated matching thresholds to evaluate soft interests when hard metrics are sparse. | **Fixed** |

---

## 2. Operational Health Check Checklist

Each morning during the pilot phase, the system administrator should verify the system's operational readiness against this matrix:

- [ ] **Firestore Latency**: Verify Firestore queries load in `< 250ms` on dashboard telemetry.
- [ ] **QR Code Verification**: Ensure QR code encryption and generation are active at both campuses.
- [ ] **Active Backups**: Verify that the daily automated Firestore exports have compiled successfully.
- [ ] **Auth Token Verification**: Assert that header-based authorization fallbacks are blocked in production logs.
- [ ] **Memory Allocation**: Review Cloud Run container memory usage; confirm heap utilization is below 60%.

---

## 3. Operational Incident Classification

Use these definitions to classify and escalate operational feedback:

- **Critical**: Entire platform inaccessible, payment synchronization fails completely, or private student data is exposed. (Response Time: **< 1 Hour**)
- **High**: Critical module function failing (e.g., QR check-ins blocked, fee receipt generation crashing). (Response Time: **< 4 Hours**)
- **Medium**: UI discrepancies, slow search filters on $>1000$ records, or minor upload cancellations. (Response Time: **< 24 Hours**)
- **Low**: Aesthetic fixes, grammar tweaks, feature suggestions, and minor scrolling lag. (Response Time: **< 48 Hours**)
