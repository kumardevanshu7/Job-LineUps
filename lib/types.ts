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

