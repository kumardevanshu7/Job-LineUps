export interface JobItem {
  id: string;
  title: string;
  department: string;
  location: string;
  experienceBracket: string;
  type: string;
  salaryRange: string;
  description: string;
  requirements: string[];
  active?: boolean;
}

export type CandidateStatus =
  | "New Applied"
  | "Screening Shortlisted"
  | "Line-Up Scheduled"
  | "Interview Done"
  | "Selected"
  | "Rejected";

export interface CandidateItem {
  id: string;
  recruiterId?: string; // owner UID for multi-tenant isolation
  fullName: string;
  phone: string;
  email: string;
  location: string;
  appliedRole: string;
  experienceYears: number;
  noticePeriodDays: number;
  currentCtc?: string | null;
  expectedCtc?: string | null;
  resumeUrl: string;
  status: CandidateStatus | string;
  interviewDate?: string | Date | null;
  recruiterNotes?: string | null;
  rescheduleCount?: number;
  rescheduleReason?: string | null;
  rejectionReason?: string | null; // Why candidate was not selected
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface CandidateStats {
  total: number;
  newApplied: number;
  shortlisted: number;
  scheduled: number;
  interviewDone: number;
  selected: number;
  rejected: number;
  todayCount?: number;
  tomorrowCount?: number;
}

export type DateFilterPreset = "ALL" | "TODAY" | "TOMORROW" | "THIS_WEEK" | "CUSTOM";

export interface RecruiterUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: "Recruiter" | "Lead" | "Manager";
}

export interface RecruiterProfile {
  uid: string;
  name: string;
  username?: string; // e.g. @devanshu — used for team search
  age?: number | string | null;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say" | string;
  company: string; // Where you work
  position: string; // Position/Role
  avatarInitial: string; // A-Z cursive initial
  avatarColorId: string; // Light color id
  completedOnboarding: boolean;
  updatedAt?: string;
}

export interface PartyPermissions {
  canEditStatus: boolean;
  canReschedule: boolean;
  canEditNotes: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export interface CollaboratorParty {
  id: string;
  ownerUid?: string; // owner recruiter UID
  name: string;
  email: string;
  role: string; // e.g., "Interviewer", "Hiring Manager", "HR Coordinator", "Lead Recruiter"
  avatarInitial?: string;
  avatarColorId?: string;
  permissions: PartyPermissions;
  createdAt: string;
  addedBy?: string;
}

export interface ActivityLogItem {
  id: string;
  recruiterUid?: string; // owner recruiter UID
  action:
    | "STATUS_CHANGE"
    | "RESCHEDULE"
    | "CANDIDATE_ADDED"
    | "CANDIDATE_DELETED"
    | "NOTES_UPDATED"
    | "REJECTION_REASON_SAVED"
    | "SETTINGS_UPDATED"
    | "PARTY_ADDED"
    | "PARTY_REMOVED"
    | "PERMISSIONS_UPDATED";
  candidateId?: string;
  candidateName?: string;
  details: string;
  fieldChanged?: string; // e.g. "Candidate Status", "Interview Schedule", "Recruiter Notes", "Rejection Reason"
  previousValue?: string; // e.g. "Screening Shortlisted"
  newValue?: string; // e.g. "Line-Up Scheduled"
  glowColor: "emerald" | "blue" | "purple" | "indigo" | "cyan" | "rose" | "amber";
  timestamp: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterRole?: string;
  partyId?: string;
}

export interface AppSettings {
  securityPin: string; // Default "1234"
  pinProtectionEnabled: boolean; // Default true
  requirePinForStatus?: boolean;
  requirePinForDelete?: boolean;
  webhookUrl?: string;
  updatedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  ownerUid: string;
  ownerName: string;
  ownerUsername: string;
  isPublic: boolean;
  members: CollaboratorParty[];
  createdAt: string;
  updatedAt?: string;
}

export interface TeamJoinRequest {
  id: string;
  teamId: string;
  teamName: string;
  ownerUid: string;
  requesterUid: string;
  requesterName: string;
  requesterEmail: string;
  requesterUsername?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

export interface WebhookWorkspaceColor {
  id: string;
  name: string;
  hex: string;
  borderClass: string;
  bgClass: string;
  badgeClass: string;
  glowClass: string;
}

export const WEBHOOK_WORKSPACE_COLORS: WebhookWorkspaceColor[] = [
  {
    id: "lavender",
    name: "Lavender Dream",
    hex: "#a855f7",
    borderClass: "border-purple-300 dark:border-purple-700",
    bgClass: "bg-purple-50 dark:bg-purple-950/30",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    glowClass: "shadow-[0_0_15px_rgba(168,85,247,0.35)]",
  },
  {
    id: "emerald",
    name: "Mint Emerald",
    hex: "#10b981",
    borderClass: "border-emerald-300 dark:border-emerald-700",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    glowClass: "shadow-[0_0_15px_rgba(16,185,129,0.35)]",
  },
  {
    id: "sky",
    name: "Electric Sky",
    hex: "#0ea5e9",
    borderClass: "border-sky-300 dark:border-sky-700",
    bgClass: "bg-sky-50 dark:bg-sky-950/30",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
    glowClass: "shadow-[0_0_15px_rgba(14,165,233,0.35)]",
  },
  {
    id: "amber",
    name: "Neon Amber",
    hex: "#f59e0b",
    borderClass: "border-amber-300 dark:border-amber-700",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    glowClass: "shadow-[0_0_15px_rgba(245,158,11,0.35)]",
  },
  {
    id: "rose",
    name: "Coral Rose",
    hex: "#f43f5e",
    borderClass: "border-rose-300 dark:border-rose-700",
    bgClass: "bg-rose-50 dark:bg-rose-950/30",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
    glowClass: "shadow-[0_0_15px_rgba(244,63,94,0.35)]",
  },
  {
    id: "indigo",
    name: "Royal Indigo",
    hex: "#6366f1",
    borderClass: "border-indigo-300 dark:border-indigo-700",
    bgClass: "bg-indigo-50 dark:bg-indigo-950/30",
    badgeClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
    glowClass: "shadow-[0_0_15px_rgba(99,102,241,0.35)]",
  },
  {
    id: "cyan",
    name: "Mint Cyan",
    hex: "#06b6d4",
    borderClass: "border-cyan-300 dark:border-cyan-700",
    bgClass: "bg-cyan-50 dark:bg-cyan-950/30",
    badgeClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
    glowClass: "shadow-[0_0_15px_rgba(6,182,212,0.35)]",
  },
  {
    id: "fuchsia",
    name: "Orchid Fuchsia",
    hex: "#d946ef",
    borderClass: "border-fuchsia-300 dark:border-fuchsia-700",
    bgClass: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
    badgeClass: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300",
    glowClass: "shadow-[0_0_15px_rgba(217,70,239,0.35)]",
  },
  {
    id: "lime",
    name: "Bright Lime",
    hex: "#84cc16",
    borderClass: "border-lime-300 dark:border-lime-700",
    bgClass: "bg-lime-50 dark:bg-lime-950/30",
    badgeClass: "bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-300",
    glowClass: "shadow-[0_0_15px_rgba(132,204,22,0.35)]",
  },
  {
    id: "orange",
    name: "Tangerine Glow",
    hex: "#f97316",
    borderClass: "border-orange-300 dark:border-orange-700",
    bgClass: "bg-orange-50 dark:bg-orange-950/30",
    badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    glowClass: "shadow-[0_0_15px_rgba(249,115,22,0.35)]",
  },
];

export interface WebhookWorkspace {
  id: string;
  recruiterUid: string;
  name: string;
  colorId: string;
  targetRole?: string; // "ALL" or specific appliedRole
  webhookUrl?: string;
  active: boolean;
  totalSyncs?: number;
  lastSyncedAt?: string;
  lastPingStatus?: "success" | "error" | "untested";
  createdAt: string;
  updatedAt?: string;
}


