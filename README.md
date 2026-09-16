# TalentFlow — High-Velocity Recruitment Portal & Live Recruiter Line-Up

> Production-ready recruitment intake and live recruiter pipeline application with native Excel (.xlsx) synchronization and Google Sheets webhook integration, designed according to the **Stripi Design System** (`stripe-DESIGN.md`).

---

## Key Highlights

- **Candidate Fast-Track Intake (`/`)**:
  - High-converting, mobile-first application flow with zero sign-up walls.
  - Vetted field validations: 10-digit mobile number, verified email, experience bracket, notice days, current/expected CTC, and Google Drive cloud resume link.
  - Instant submission confirmation with unique Reference ID (e.g. `TF-2026-XXXX`).
  - Atmospheric gradient mesh hero backdrop, Sohne/Inter thin display typography (`-1.4px` letter spacing), and pill CTAs per `stripe-DESIGN.md`.

- **Recruiter Command Line-Up Dashboard (`/admin`)**:
  - Protected with passkey authentication (default: `talentflow2026`).
  - Executive KPI metrics row: *Total Inbound, New Applied, Shortlisted, Line-Up Scheduled, Selected, Rejected*.
  - Multi-criteria real-time filtering: instant search, role filters (*Documentation Specialist, Operations Executive, HR Trainee*), and pipeline stage filters.
  - Dynamic in-table status progression badges with instant optimistic UI updates and server persistence.
  - Schedule interview timestamp and recruiter review notes drawer.
  - **1-Click Native Excel (.xlsx) Line-Up Export**: Generates styled enterprise ATS rosters with formatted columns.

- **Google Sheets Real-Time Sync**:
  - Every candidate submission automatically dispatches a background POST webhook to a Google Apps Script Web App.
  - Built-in connection tester and ready-to-use Google Apps Script code.

---

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="talentflow2026"
GOOGLE_SHEETS_WEBHOOK_URL=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup SQLite Database & Seed Sample Records
```bash
npx prisma db push
npm run prisma:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
Recruiter Portal: [http://localhost:3000/admin](http://localhost:3000/admin) (Passkey: `talentflow2026`).

---

## Deployment to Vercel (Production)

Vercel Serverless Functions have an ephemeral filesystem where SQLite files cannot persist across executions. Therefore, for production on Vercel, connect a PostgreSQL database.

### Step 1: Create a Free PostgreSQL Database
You can provision a free PostgreSQL database in under 2 minutes using:
- **Vercel Postgres** (Directly in your Vercel project dashboard under the *Storage* tab)
- **Neon.tech** (Generous free tier: [https://neon.tech](https://neon.tech))
- **Supabase** ([https://supabase.com](https://supabase.com))

### Step 2: Push Database Schema to Production Postgres
In your terminal (or `.env` file):
```bash
# In prisma/schema.prisma, change provider to "postgresql":
# datasource db {
#   provider = "postgresql"
#   url      = env("DATABASE_URL")
# }

# Set your connection string:
set DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Push schema:
npx prisma db push
```

### Step 3: Configure Environment Variables in Vercel
In your Vercel Project Settings → **Environment Variables**, add:

| Variable | Description | Example / Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `ADMIN_PASSWORD` | Recruiter portal passkey | `talentflow2026` (or your custom secret) |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Optional Google Sheets webhook URL | `https://script.google.com/macros/s/.../exec` |
| `NEXT_PUBLIC_APP_URL` | Production URL | `https://your-app.vercel.app` |

### Step 4: Deploy
Deploy via the Vercel CLI or connect your GitHub repository to Vercel. Vercel will automatically run:
```bash
prisma generate && next build
```

---

## Connecting Google Sheets (Live Inbound Sync)

Follow these steps to have every applicant automatically populate your Google Sheet in real time:

1. Open a new or existing **Google Sheet**.
2. In the top menu, navigate to **Extensions** → **Apps Script**.
3. Replace the code in the editor with the following:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Candidate ID",
        "Timestamp",
        "Full Name",
        "Phone",
        "Email",
        "Location",
        "Applied Role",
        "Experience (Yrs)",
        "Notice (Days)",
        "Current CTC",
        "Expected CTC",
        "Resume URL",
        "Pipeline Status",
        "Recruiter Notes"
      ]);
      sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#f6f9fc");
    }

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.id || Utilities.getUuid(),
      new Date(),
      data.fullName || "",
      data.phone || "",
      data.email || "",
      data.location || "",
      data.appliedRole || "",
      data.experienceYears || 0,
      data.noticePeriodDays || 0,
      data.currentCtc || "N/A",
      data.expectedCtc || "N/A",
      data.resumeUrl || "",
      data.status || "New Applied",
      data.recruiterNotes || ""
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Candidate synced successfully" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Deploy** → **New deployment**.
5. Select type: **Web app**.
6. Set:
   - Description: `TalentFlow Webhook`
   - Execute as: `Me`
   - Who has access: `Anyone` *(Crucial: must be 'Anyone' so the API can post without OAuth popup)*
7. Click **Deploy**, authorize access, and copy the **Web app URL**.
8. Paste the URL into `GOOGLE_SHEETS_WEBHOOK_URL` in your `.env` or in the `/admin` settings modal.
9. Click **Send Ping Test** in `/admin` to verify that a row appears in your Google Sheet immediately!

---

## Architecture Overview

```
+------------------------------------+      +------------------------------------+
|  Candidate Application Portal (/)  |      |   Recruiter Command Center (/admin)|
+------------------------------------+      +------------------------------------+
                   \                                     /
                    v                                   v
+--------------------------------------------------------------------------------+
|                   Next.js 14 App Router + Tailwind CSS Engine                  |
+--------------------------------------------------------------------------------+
          |                         |                        |
          v                         v                        v
+-------------------+      +-------------------+    +----------------------------+
| API Route Layer   |      | SheetJS (.xlsx)   |    | Google Sheets Webhook      |
| • /api/apply      |      | Export Engine     |    | Asynchronous live sync     |
| • /api/candidates |      | • /api/export-    |    | to Apps Script Web App     |
| • /api/jobs       |      |   lineup          |    +----------------------------+
+-------------------+      +-------------------+
          |
          v
+-----------------------------------------------+
| Prisma ORM Layer                              |
| • SQLite for zero-config local development    |
| • PostgreSQL for Vercel Serverless Production |
| • Resilient in-memory fallback layer          |
+-----------------------------------------------+
```

---

## License
MIT. Built for Arigato Labs.
