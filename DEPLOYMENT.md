# Learner's Den ERP-LMS Production Deployment Manual

This document provides complete instructions for compiling, containerizing, and deploying the Learner's Den ERP-LMS to production-grade auto-scaling serverless infrastructures (e.g., Google Cloud Run) backed by Google Cloud Firestore.

---

## 1. Environment Variable Requirements

The application relies on key server-side environment variables which must be defined in the hosting control console. Do not commit actual production credentials to source files.

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables production optimizations, bundles, static paths, and disables HMR. |
| `PORT` | Yes | `3000` | The internal port the container server binds to. |
| `USE_FIRESTORE` | Yes | `true` | Setting to `true` activates direct Firestore reads and background dual-writes. |
| `JWT_SECRET` | Yes | `high-entropy-crypto-string` | Signed security key for validating local user JWT sessions. |

*Refer to `.env.example` to review the template file structure.*

---

## 2. Compilation and Build Process

The application utilizes a highly cohesive build cycle designed to output static assets inside `/dist/` while compiling the backend TypeScript server into a single bundled CommonJS file to bypass ESM relative path resolution checks.

### Run Production Build
```bash
npm run build
```

The script executes the following:
1. `vite build`: Compiles all React presentation assets and injects optimized files inside `/dist/`.
2. `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`: Bundles and compiles the backend TypeScript Express server into a lightweight, self-contained CommonJS module.

---

## 3. Deployment to Google Cloud Run

To deploy the containerized web app, execute the following commands:

### A. Build Container Image
```bash
gcloud builds submit --tag gcr.io/complete-platform-dwrl4/learners-den-erp:latest
```

### B. Deploy Container Image to Cloud Run
```bash
gcloud run deploy learners-den-erp \
  --image gcr.io/complete-platform-dwrl4/learners-den-erp:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars USE_FIRESTORE=true,NODE_ENV=production,PORT=3000
```

---

## 4. Firestore Security Rules Deployment

To deploy security rules defining access privileges, execute:

```bash
firebase deploy --only firestore:rules
```

---

## 5. Disaster Recovery & Backup Restoration Protocol

To maintain production resilience and protect user data during the active operational pilot, follow these disaster recovery schedules and procedures.

### A. Daily Automated Firestore Backups
Automate exports of the production Firestore database to a secure Google Cloud Storage (GCS) bucket using Cloud Scheduler and Cloud Functions.

**Manual Export Command:**
```bash
gcloud firestore export gs://learners-den-backups-prod/daily-exports --database="(default)"
```

### B. Backup Restoration Procedure
In the event of accidental data corruption or loss:
1. Identify the timestamp of the last verified healthy export inside the GCS bucket.
2. Run the import command to restore all collections to the target Firestore instance:
```bash
gcloud firestore import gs://learners-den-backups-prod/daily-exports/2026-07-18T00:00:00 --database="(default)"
```

### C. Release Rollback Procedure
If a production deployment introduces critical regressions:
1. Identify the previous stable container image hash using the GCP Console or by running:
```bash
gcloud container images list-tags gcr.io/complete-platform-dwrl4/learners-den-erp
```
2. Instantly redirect production ingress traffic back to the previous stable release container to minimize downtime:
```bash
gcloud run deploy learners-den-erp \
  --image gcr.io/complete-platform-dwrl4/learners-den-erp:<PREVIOUS_STABLE_TAG> \
  --region us-central1
```

### D. Upgrades Maintenance Mode
To isolate database operations during structural schema upgrades, administrators can toggle Maintenance Mode:
1. In the system header, navigate to **Settings Manager** -> **Operational Telemetry**.
2. Toggle the **Maintenance Mode** switch. This immediately blocks non-administrator logins and safe-caches outstanding student check-ins and fee entries locally until database upgrades are completed.

