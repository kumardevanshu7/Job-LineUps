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


