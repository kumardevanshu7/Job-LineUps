TalentFlow — PRD &amp; TRD Specification

Job Application Portal with Live Recruiter Line-Up &amp; Excel Sync

DOCUMENT OVERVIEW: This document contains end-to-end Product Requirements (PRD) and Technical Requirements (TRD) designed for immediate implementation by AI Agents (Antigravity / Cursor / Claude Code).

PART 1: Product Requirements Document (PRD)

1. Executive Summary &amp; Vision

TalentFlow is a lightweight, high-efficiency recruitment portal designed to bridge the gap between candidate application intake and recruiter workflow management. It provides job seekers with a streamlined, mobile-friendly application flow while automatically syncing applicants directly into a centralized recruiter dashboard and a live Excel line-up sheet.

2. Problem Statement &amp; Solution

Current Pain Point: Manual Data Entry Overhead: Recruiters lose 2-3 hours daily copy-pasting applicant details from emails and job portals into tracking spreadsheets.

Operational Risk: Line-Up Inaccuracies: Version control issues occur when multiple team members edit offline Excel files simultaneously.

The Solution: Unified Pipeline Solution: TalentFlow captures applicants via a structured web interface and instantly streams clean, validated records into a master recruiter line-up tracker with one-click Excel (.xlsx) export.

3. User Personas

Candidate (Job Seeker): Wants to view open vacancies, verify role requirements, and submit their profile, contact details, experience, and resume link in under 60 seconds without complex sign-up walls.

Recruitment Executive / HR Coordinator: Reviews inbound applicants, filters by role and experience, updates interview pipeline stages, and exports ATS-compliant daily line-up sheets for client and leadership reviews.

4. Core Functional Modules

Module A: Public Job Portal &amp; Application Flow

Job Listings Catalog: Displays active job cards with Title, Department, Location (e.g., Sector 59, Noida), Experience Bracket, and 'Apply Now' triggers.

Fast-Track Application Modal: Gathers essential recruiter data points:

• Identity: Full Name, Phone (10 digits), Email Address, Current City.

• Logistics: Total Experience (Years), Notice Period (Days), Current CTC, Expected CTC.

• Resume Link: Google Drive / Cloud URL with link accessibility validation.

Instant Confirmation: Displays a tracking confirmation badge upon successful submission.

Module B: Recruiter Line-Up Management Dashboard (/admin)

Real-Time Line-Up Grid: Live table rendering all applicants sorted by application timestamp.

Multi-Criteria Filtering: Search by candidate name/phone, filter by job role, and filter by pipeline status.

Dynamic Status Progression: Dropdown selection allowing instantaneous state transitions: New Applied -&gt; Screening Shortlisted -&gt; Line-Up Scheduled -&gt; Interview Done -&gt; Selected / Rejected.

Native Excel (.xlsx) Generation: One-click export downloading a styled, clean Line-Up Tracker formatted for enterprise review.

PART 2: Technical Requirements Document (TRD)

1. System Architecture

The architecture follows a modern decoupled full-stack model optimized for low latency, zero infrastructure cost, and direct spreadsheet synchronization:

+-------------------------+       +-------------------------+| Candidate Portal (Web)  |       |  Recruiter Admin Panel  |+-------------------------+       +-------------------------+             |                                 |             v                                 v+-----------------------------------------------------------+|   Next.js 14 / React Full-Stack API (App Router / Node)   |+-----------------------------------------------------------+             |                                 |     +-------+-------+                 +-------+-------+     v               v                 v               v+----------+   +-------------+   +-----------+   +-------------+| SQLite / |   | Cloud Sheets|   | Excel Gen |   | Line-Up     || Postgres |   | Webhook API |   | (SheetJS) |   | State Store |+----------+   +-------------+   +-----------+   +-------------+

2. Technology Stack

Layer

Technology

Implementation Purpose

Frontend UI

Next.js 14 / React + Tailwind CSS

Responsive applicant portal &amp; recruiter command dashboard

Icons &amp; Components

Lucide React + Tailwind UI / shadcn

Clean, modern enterprise styling with zero overhead

Backend API

Next.js Server Actions / API Routes

Validation, local persistence &amp; webhook broadcasting

Database

SQLite via Prisma ORM / PostgreSQL

Local relational storage of candidates, jobs &amp; pipeline status

Excel Engine

SheetJS (xlsx) / ExcelJS

Client/Server generation of formatted daily .xlsx line-up sheets

3. Database Schema (Prisma)

model Candidate {  id               String    @id @default(cuid())  fullName         String  phone            String  email            String  location         String  appliedRole      String  experienceYears  Float  noticePeriodDays Int  currentCtc       String?  expectedCtc      String?  resumeUrl        String  status           String    @default("New Applied")  interviewDate    DateTime?  recruiterNotes   String?  createdAt        DateTime  @default(now())  updatedAt        DateTime  @updatedAt}

4. REST &amp; Server Action Endpoints

GET /api/jobs: Returns JSON catalog of open vacancies with role parameters.

POST /api/apply: Validates payload, commits candidate record, and triggers Google Sheets webhook.

GET /api/candidates: Fetches candidate records supporting ?role= &amp; ?status= query params.

PATCH /api/candidates/:id: Updates pipeline status, interview timestamp, and recruiter review notes.

GET /api/export-lineup: Generates and streams an ATS-formatted .xlsx file with styled headers.

5. Google Sheets / Cloud Sync Webhook Code

Copy-paste this script into Google Sheets Extensions -&gt; Apps Script and deploy as Web App (Access: Anyone):

function doPost(e) {  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();  var data = JSON.parse(e.postData.contents);    sheet.appendRow([    data.id || Utilities.getUuid(),    new Date(),    data.fullName,    data.phone,    data.email,    data.appliedRole,    data.experienceYears,    data.noticePeriodDays,    data.resumeUrl,    data.status || "New Applied",    data.recruiterNotes || ""  ]);    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))    .setMimeType(ContentService.MimeType.JSON);}

PART 3: Ready-to-Run Antigravity / Cursor Prompt

Copy and paste the exact block below directly into Antigravity or Cursor Composer to auto-generate the complete application:

Build a production-ready Recruitment Job Portal &amp; Candidate Line-Up Dashboard:1. Technology Stack:   - Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, SQLite with Prisma ORM.   - SheetJS (xlsx) for exporting native Excel line-up sheets.2. Pages &amp; Features to Build:   - Public Landing Page (/):     * Header with brand name 'TalentFlow' and 'Recruiter Login' button.     * Job Board showcasing 3 roles: 'Documentation Specialist', 'Operations Executive', 'HR Trainee'.     * Clean 'Apply Now' modal form with validation: Full Name, Phone, Email, Location, Total Experience, Notice Period, Resume Link.   - Recruiter Dashboard (/admin):     * Metrics row: Total Applications, Screened, Line-Up Scheduled, Selected.     * Search bar &amp; filter dropdowns (Role, Status).     * Interactive Line-Up Table with editable status dropdown badge (green for Selected, blue for Scheduled, yellow for Applied).     * Button: 'Download Line-Up (.xlsx)' that exports all filtered candidates formatted cleanly.   - Cloud Synchronization:     * Send candidate payload via POST to a Google Apps Script Webhook URL on submission.3. Quality &amp; Styling:   - Sleek modern recruiter UI, responsive design, toast notifications for submissions and status changes.