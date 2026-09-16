"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateSalaryBreakdown } from "@/lib/salary-utils";
import RecruiterNavbar from "@/components/RecruiterNavbar";
import CalendarView from "@/components/CalendarView";
import AddCandidateModal from "@/components/AddCandidateModal";
import ManagerExportModal from "@/components/ManagerExportModal";
import OnboardingModal from "@/components/OnboardingModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import GoogleAuthGate from "@/components/GoogleAuthGate";
import StatusFilterDropdown from "@/components/StatusFilterDropdown";
import CandidateStatusDropdown from "@/components/CandidateStatusDropdown";
import CandidateDossierModal from "@/components/CandidateDossierModal";
import SecurityPinModal from "@/components/SecurityPinModal";
import SettingsTab from "@/components/SettingsTab";
import ActivityLogsTab from "@/components/ActivityLogsTab";
import {
  Search,
  RefreshCw,
  Phone,
  MessageCircle,
  MapPin,
  FileText,
  ExternalLink,
  Calendar,
  Clock,
  Download,
  Users,
  CheckCircle2,
  Briefcase,
  Loader2,
  Settings as SettingsIcon,
  RotateCcw,
  Eye,
  Trash2,
  Activity,
} from "lucide-react";
import AddPartiesModal from "@/components/AddPartiesModal";
import { toast } from "sonner";
import {
  CandidateItem,
  CandidateStats,
  RecruiterProfile,
  ActivityLogItem,
  AppSettings,
  CollaboratorParty,
} from "@/lib/types";
import { isToday, isTomorrow, isThisWeek, formatIndianDateTime } from "@/lib/date-utils";
import {
  onRecruiterAuthStateChanged,
  logOutRecruiter,
  syncCandidateToFirestore,
  updateCandidateInFirestore,
  saveRecruiterProfileToFirestore,
  getRecruiterProfileFromFirestore,
  deleteCandidateFromFirestore,
  saveActivityLogToFirestore,
  getActivityLogsFromFirestore,
  saveSettingsToFirestore,
  getSettingsFromFirestore,
  getCandidatesFromFirestore,
  subscribeToCandidatesFromFirestore,
  subscribeToActivityLogsFromFirestore,
  getPartiesFromFirestore,
  subscribeToPartiesFromFirestore,
} from "@/lib/firebase";
import { User } from "firebase/auth";

const PASTEL_CARD_THEMES: Record<
  string,
  { cardBg: string; cardBorder: string; badgeBg: string; badgeText: string }
> = {
  "New Applied": {
    cardBg: "bg-yellow-50/60",
    cardBorder: "border-yellow-200/80 hover:border-yellow-300",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-800",
  },
  "Screening Shortlisted": {
    cardBg: "bg-blue-50/60",
    cardBorder: "border-blue-200/80 hover:border-blue-300",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
  },
  "Line-Up Scheduled": {
    cardBg: "bg-purple-50/60",
    cardBorder: "border-purple-200/80 hover:border-purple-300",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
  },
  "Interview Done": {
    cardBg: "bg-amber-50/60",
    cardBorder: "border-amber-200/80 hover:border-amber-300",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
  },
  Selected: {
    cardBg: "bg-green-50/60",
    cardBorder: "border-green-200/80 hover:border-green-300",
    badgeBg: "bg-green-100",
    badgeText: "text-green-800",
  },
  Rejected: {
    cardBg: "bg-red-50/60",
    cardBorder: "border-red-200/80 hover:border-red-300",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  "New Applied": {
    label: "New Applied",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-300",
  },
  "Screening Shortlisted": {
    label: "Screening Shortlisted",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "Line-Up Scheduled": {
    label: "Line-Up Scheduled",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  "Interview Done": {
    label: "Interview Done",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
  },
  Selected: {
    label: "Selected",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  Rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

const STATUS_LIST = [
  "New Applied",
  "Screening Shortlisted",
  "Line-Up Scheduled",
  "Interview Done",
  "Selected",
  "Rejected",
];

export default function RecruiterAdminPage() {
  // Google Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data state
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [stats, setStats] = useState<CandidateStats>({
    total: 0,
    newApplied: 0,
    shortlisted: 0,
    scheduled: 0,
    interviewDone: 0,
    selected: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"LINEUP" | "CALENDAR" | "LOGS" | "SETTINGS">("LINEUP");
  const router = useRouter();

  // Modals & Profile
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile | null>(null);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAddPartiesModalOpen, setIsAddPartiesModalOpen] = useState(false);

  // Collaborator Parties State
  const [parties, setParties] = useState<CollaboratorParty[]>([]);
  const [activeParty, setActiveParty] = useState<CollaboratorParty | null>(null);

  // PIN Protection State
  const [settings, setSettings] = useState<AppSettings>({
    securityPin: "1234",
    pinProtectionEnabled: true,
    requirePinForStatus: true,
    requirePinForDelete: true,
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinModalTitle, setPinModalTitle] = useState("Security Verification");
  const [pinModalDescription, setPinModalDescription] = useState("");
  const [pendingPinAction, setPendingPinAction] = useState<(() => Promise<void> | void) | null>(null);

  // Candidate Dossier Modal State
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [dossierCandidate, setDossierCandidate] = useState<CandidateItem | null>(null);

  // Activity Logs
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "TOMORROW" | "THIS_WEEK">("ALL");

  // Track Firebase Auth state & Recruiter Profile
  useEffect(() => {
    const unsubscribe = onRecruiterAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        // 1. Profile
        const localKey = `recruiter_profile_${user.uid}`;
        let profileFound: RecruiterProfile | null = null;
        const cached = typeof window !== "undefined" ? localStorage.getItem(localKey) : null;
        if (cached) {
          try {
            profileFound = JSON.parse(cached);
            setRecruiterProfile(profileFound);
          } catch (e) {
            // ignore
          }
        }

        try {
          const remote = await getRecruiterProfileFromFirestore(user.uid);
          if (remote) {
            profileFound = remote;
            setRecruiterProfile(remote);
            if (typeof window !== "undefined") {
              localStorage.setItem(localKey, JSON.stringify(remote));
            }
          }
        } catch (e) {
          console.warn("Error fetching remote profile:", e);
        }

        // 2. Settings (PIN & Rules)
        const localSettingsKey = `app_settings_${user.uid}`;
        const cachedSettings = typeof window !== "undefined" ? localStorage.getItem(localSettingsKey) : null;
        if (cachedSettings) {
          try {
            setSettings(JSON.parse(cachedSettings));
          } catch (e) {}
        }
        getSettingsFromFirestore(user.uid).then((remoteSettings) => {
          if (remoteSettings) {
            setSettings(remoteSettings);
            if (typeof window !== "undefined") {
              localStorage.setItem(localSettingsKey, JSON.stringify(remoteSettings));
            }
          }
        }).catch((e) => console.warn("Error fetching remote settings:", e));

        // 3. Real-time Collaborator Parties (Cloud Firestore) - Scoped to user.uid
        getPartiesFromFirestore(user.uid).then((initialParties) => {
          setParties(initialParties || []);
        }).catch(() => {});
        const unsubParties = subscribeToPartiesFromFirestore((remoteParties) => {
          setParties(remoteParties || []);
        }, user.uid);

        // 4. Real-time Candidates Sync (Zero Local DB Dependency) - Scoped to user.uid
        const unsubCandidates = subscribeToCandidatesFromFirestore((remoteCandidates) => {
          const list = remoteCandidates || [];
          setCandidates(list);
          setStats({
            total: list.length,
            newApplied: list.filter((c) => c.status === "New Applied").length,
            shortlisted: list.filter((c) => c.status === "Screening Shortlisted").length,
            scheduled: list.filter((c) => c.status === "Line-Up Scheduled").length,
            interviewDone: list.filter((c) => c.status === "Interview Done").length,
            selected: list.filter((c) => c.status === "Selected").length,
            rejected: list.filter((c) => c.status === "Rejected").length,
          });
          setLoading(false);
        }, user.uid);

        // 5. Real-time Activity Logs (Cloud Firestore) - Scoped to user.uid
        const localLogsKey = `activity_logs_${user.uid}`;
        const cachedLogs = typeof window !== "undefined" ? localStorage.getItem(localLogsKey) : null;
        if (cachedLogs) {
          try {
            setLogs(JSON.parse(cachedLogs));
          } catch (e) {}
        }
        const unsubLogs = subscribeToActivityLogsFromFirestore((remoteLogs) => {
          const list = remoteLogs || [];
          setLogs(list);
          if (typeof window !== "undefined") {
            localStorage.setItem(localLogsKey, JSON.stringify(list));
          }
        }, user.uid);

        // 6. Prompt Onboarding if not completed
        if (!profileFound || !profileFound.completedOnboarding) {
          setIsOnboardingModalOpen(true);
        }
      } else {
        setRecruiterProfile(null);
        setCandidates([]);
        setStats({
          total: 0,
          newApplied: 0,
          shortlisted: 0,
          scheduled: 0,
          interviewDone: 0,
          selected: 0,
          rejected: 0,
        });
        setLogs([]);
        setParties([]);
        setActiveParty(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveProfile = async (newProfile: RecruiterProfile) => {
    setRecruiterProfile(newProfile);
    if (currentUser && typeof window !== "undefined") {
      localStorage.setItem(`recruiter_profile_${currentUser.uid}`, JSON.stringify(newProfile));
      await saveRecruiterProfileToFirestore(newProfile);
    }
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (currentUser && typeof window !== "undefined") {
      localStorage.setItem(`app_settings_${currentUser.uid}`, JSON.stringify(newSettings));
      await saveSettingsToFirestore(newSettings, currentUser.uid);
    }
  };

  const addLog = (
    action: ActivityLogItem["action"],
    candidateName: string,
    details: string,
    extra?: {
      candidateId?: string;
      role?: string;
      fieldChanged?: string;
      previousValue?: string;
      newValue?: string;
      oldStage?: string;
      newStage?: string;
      glowColor?: "emerald" | "blue" | "purple" | "indigo" | "cyan" | "rose" | "amber";
      recruiterName?: string;
      recruiterEmail?: string;
    }
  ) => {
    let color: "emerald" | "blue" | "purple" | "indigo" | "cyan" | "rose" | "amber" = extra?.glowColor || "blue";
    if (!extra?.glowColor) {
      if (extra?.newStage === "Selected") color = "emerald";
      else if (extra?.newStage === "Rejected" || action === "CANDIDATE_DELETED") color = "rose";
      else if (extra?.newStage === "Line-Up Scheduled") color = "purple";
      else if (extra?.newStage === "Screening Shortlisted") color = "blue";
      else if (extra?.newStage === "Interview Done") color = "amber";
      else if (action === "RESCHEDULE") color = "amber";
      else if (action === "PARTY_ADDED") color = "emerald";
      else if (action === "PARTY_REMOVED") color = "rose";
      else if (action === "PERMISSIONS_UPDATED") color = "indigo";
    }

    const currentUserName =
      extra?.recruiterName ||
      activeParty?.name ||
      recruiterProfile?.name ||
      currentUser?.displayName ||
      "Admin Recruiter";

    const currentUserEmail =
      extra?.recruiterEmail ||
      activeParty?.email ||
      currentUser?.email ||
      "admin@talentflow.in";

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      recruiterUid: currentUser?.uid,
      timestamp: new Date().toISOString(),
      recruiterName: currentUserName,
      recruiterEmail: currentUserEmail,
      recruiterRole: activeParty?.role || recruiterProfile?.position || "Recruiter",
      partyId: activeParty?.id,
      action,
      candidateName,
      candidateId: extra?.candidateId,
      details,
      fieldChanged: extra?.fieldChanged,
      previousValue: extra?.previousValue || extra?.oldStage,
      newValue: extra?.newValue || extra?.newStage,
      glowColor: color,
    };

    setLogs((prev) => {
      const updated = [newLog, ...prev];
      if (currentUser && typeof window !== "undefined") {
        localStorage.setItem(`activity_logs_${currentUser.uid}`, JSON.stringify(updated.slice(0, 200)));
      }
      return updated;
    });

    saveActivityLogToFirestore(newLog, currentUser?.uid).catch((e) =>
      console.warn("Error saving log to Firestore:", e)
    );
  };

  const handleClearLogs = () => {
    setLogs([]);
    if (currentUser && typeof window !== "undefined") {
      localStorage.removeItem(`activity_logs_${currentUser.uid}`);
    }
    toast.success("Activity logs cleared");
  };

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `TalentFlow_Audit_Logs_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Exported activity logs as JSON");
  };

  const handleSignOut = async () => {
    try {
      await logOutRecruiter();
      setCurrentUser(null);
      setRecruiterProfile(null);
      setCandidates([]);
      setStats({
        total: 0,
        newApplied: 0,
        shortlisted: 0,
        scheduled: 0,
        interviewDone: 0,
        selected: 0,
        rejected: 0,
      });
      setLogs([]);
      setParties([]);
      setActiveParty(null);
      toast.info("Signed out from Google Account");
      router.replace("/");
    } catch (err) {
      toast.error("Failed to sign out");
    }
  };

  // Fetch Candidates (Direct Firestore Fetch scoped to current recruiter)
  const fetchCandidates = useCallback(async () => {
    if (!currentUser) return;
    try {
      const firestoreCandidates = await getCandidatesFromFirestore(currentUser.uid);
      const list = firestoreCandidates || [];
      setCandidates(list);
      setStats({
        total: list.length,
        newApplied: list.filter((c) => c.status === "New Applied").length,
        shortlisted: list.filter((c) => c.status === "Screening Shortlisted").length,
        scheduled: list.filter((c) => c.status === "Line-Up Scheduled").length,
        interviewDone: list.filter((c) => c.status === "Interview Done").length,
        selected: list.filter((c) => c.status === "Selected").length,
        rejected: list.filter((c) => c.status === "Rejected").length,
      });
    } catch (err) {
      console.error("Failed to fetch candidates", err);
      toast.error("Failed to refresh candidate line-up");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchCandidates();
    }
  }, [currentUser, fetchCandidates]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCandidates();
  };

  // PIN Protection Guard
  const requestProtectedAction = (
    title: string,
    description: string,
    isDelete: boolean,
    action: () => Promise<void> | void
  ) => {
    if (!settings.pinProtectionEnabled) {
      action();
      return;
    }
    const isRequired = isDelete ? (settings.requirePinForDelete ?? true) : (settings.requirePinForStatus ?? true);
    if (!isRequired) {
      action();
      return;
    }

    setPinModalTitle(title);
    setPinModalDescription(description);
    setPendingPinAction(() => action);
    setIsPinModalOpen(true);
  };

  // Status Change with PIN Verification
  const requestStatusChangeWithPin = (candidate: CandidateItem, newStatus: string) => {
    if (candidate.status === newStatus) return;

    requestProtectedAction(
      `Confirm Status Change`,
      `Enter your 4-digit Security PIN to move "${candidate.fullName}" to "${newStatus}".`,
      false,
      () => executeStatusChange(candidate, newStatus)
    );
  };

  const executeStatusChange = async (candidate: CandidateItem, newStatus: string) => {
    const oldStatus = candidate.status;
    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidate.id ? { ...c, status: newStatus } : c))
    );
    if (dossierCandidate && dossierCandidate.id === candidate.id) {
      setDossierCandidate((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // Sync to Firestore
    updateCandidateInFirestore(candidate.id, { status: newStatus }).catch((e) =>
      console.warn("Firestore sync error:", e)
    );

    // Audit Log with Before & After State
    addLog(
      "STATUS_CHANGE",
      candidate.fullName,
      `Pipeline stage updated from "${oldStatus}" to "${newStatus}"`,
      {
        candidateId: candidate.id,
        role: candidate.appliedRole,
        fieldChanged: "Candidate Pipeline Status",
        previousValue: oldStatus,
        newValue: newStatus,
        oldStage: oldStatus,
        newStage: newStatus,
      }
    );

    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Status updated to "${newStatus}"`);
        fetchCandidates();
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Failed to update status on server. Reverting...");
      fetchCandidates();
    }
  };

  // Delete Candidate with PIN
  const requestDeleteWithPin = (candidate: CandidateItem) => {
    requestProtectedAction(
      `Delete Candidate Record`,
      `Enter your 4-digit Security PIN to permanently delete "${candidate.fullName}" (${candidate.id}) from your line-up roster.`,
      true,
      () => executeDeleteCandidate(candidate)
    );
  };

  const executeDeleteCandidate = async (candidate: CandidateItem) => {
    // Optimistic UI update
    setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
    if (dossierCandidate?.id === candidate.id) {
      setIsDossierModalOpen(false);
      setDossierCandidate(null);
    }

    // Firestore deletion
    deleteCandidateFromFirestore(candidate.id).catch((e) =>
      console.warn("Firestore candidate delete error:", e)
    );

    // Audit Log with Before & After
    addLog(
      "CANDIDATE_DELETED",
      candidate.fullName,
      `Candidate record permanently removed from pipeline`,
      {
        candidateId: candidate.id,
        role: candidate.appliedRole,
        fieldChanged: "Candidate Record",
        previousValue: `${candidate.fullName} (${candidate.status})`,
        newValue: "Permanently Deleted",
        oldStage: candidate.status,
      }
    );

    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Candidate ${candidate.fullName} deleted successfully`);
        fetchCandidates();
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (err) {
      toast.error("Failed to delete candidate on server");
      fetchCandidates();
    }
  };

  // Save Dossier from Modal (Notes, Reasons, Rejection details)
  const handleSaveDossier = async (candidateId: string, updates: Partial<CandidateItem>) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, ...updates } : c))
    );
    if (dossierCandidate && dossierCandidate.id === candidateId) {
      setDossierCandidate((prev) => (prev ? { ...prev, ...updates } : null));
    }

    updateCandidateInFirestore(candidateId, updates).catch((e) =>
      console.warn("Firestore dossier update error:", e)
    );

    const target = candidates.find((c) => c.id === candidateId);
    const action = updates.rejectionReason
      ? "REJECTION_REASON_SAVED"
      : updates.status
      ? "STATUS_CHANGE"
      : "NOTES_UPDATED";

    const fieldChanged = updates.rejectionReason
      ? "Non-Selection Reason"
      : updates.status
      ? "Pipeline Status"
      : "Recruiter Feedback & Notes";

    const prevVal = updates.rejectionReason
      ? target?.rejectionReason || "None"
      : updates.status
      ? target?.status || "Unknown"
      : target?.recruiterNotes || "No previous notes";

    const newVal = updates.rejectionReason
      ? updates.rejectionReason
      : updates.status
      ? updates.status
      : updates.recruiterNotes || "Updated notes";

    addLog(
      action,
      target?.fullName || "Candidate",
      updates.rejectionReason
        ? `Non-selection reason saved: "${updates.rejectionReason}"`
        : `Dossier details & recruiter feedback updated`,
      {
        candidateId,
        role: target?.appliedRole,
        fieldChanged,
        previousValue: prevVal,
        newValue: newVal,
        newStage: updates.status,
      }
    );

    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success("Candidate dossier updated!");
        fetchCandidates();
      }
    } catch (e) {
      toast.error("Failed to save dossier changes on server");
    }
  };

  // Reschedule Candidate Slot
  const handleRescheduleDossier = async (
    candidateId: string,
    newDateIso: string,
    reason: string
  ) => {
    const target = candidates.find((c) => c.id === candidateId);
    const newCount = (target?.rescheduleCount || 0) + 1;
    const updates: Partial<CandidateItem> = {
      interviewDate: newDateIso,
      rescheduleCount: newCount,
      rescheduleReason: reason,
      status: "Line-Up Scheduled",
    };

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, ...updates } : c))
    );
    if (dossierCandidate && dossierCandidate.id === candidateId) {
      setDossierCandidate((prev) => (prev ? { ...prev, ...updates } : null));
    }

    updateCandidateInFirestore(candidateId, updates).catch((e) =>
      console.warn("Firestore reschedule error:", e)
    );

    const oldMeta = formatIndianDateTime(target?.interviewDate);
    const newMeta = formatIndianDateTime(newDateIso);
    const oldDateFormatted = target?.interviewDate
      ? `${oldMeta.dateStr} ${oldMeta.timeStr}`
      : "Not Scheduled";
    const newDateFormatted = `${newMeta.dateStr} ${newMeta.timeStr}`;

    addLog(
      "RESCHEDULE",
      target?.fullName || "Candidate",
      `Interview slot rescheduled (#${newCount}). Reason: "${reason}"`,
      {
        candidateId,
        role: target?.appliedRole,
        fieldChanged: "Interview Schedule Slot",
        previousValue: oldDateFormatted,
        newValue: `${newDateFormatted} (Reason: ${reason})`,
        newStage: "Line-Up Scheduled",
      }
    );

    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success("Interview slot rescheduled successfully!");
        fetchCandidates();
      }
    } catch (e) {
      toast.error("Failed to reschedule on server");
    }
  };

  // Candidate added: Completely FRICTIONLESS (No Password required)
  const handleCandidateAdded = (newCand: CandidateItem) => {
    const candidateWithRecruiter: CandidateItem = {
      ...newCand,
      recruiterId: newCand.recruiterId || currentUser?.uid || "unassigned",
    };
    syncCandidateToFirestore(candidateWithRecruiter, currentUser?.uid).catch((e) =>
      console.warn("Firestore candidate save error:", e)
    );
    addLog(
      "CANDIDATE_ADDED",
      newCand.fullName,
      `New candidate added to line-up for ${newCand.appliedRole} (${newCand.location})`,
      {
        candidateId: newCand.id,
        role: newCand.appliedRole,
        fieldChanged: "New Candidate Record",
        previousValue: "Not in Pipeline",
        newValue: `Created in ${newCand.status || "New Applied"}`,
        newStage: newCand.status,
      }
    );
    fetchCandidates();
  };

  // Auth checking spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-soft">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Google Sign-In Gate for /admin
  if (!currentUser) {
    return <GoogleAuthGate onSuccess={() => {}} />;
  }

  // Filtered Candidates
  const filteredCandidates = candidates.filter((c) => {
    if (roleFilter !== "ALL" && c.appliedRole !== roleFilter) return false;
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;

    if (dateFilter === "TODAY") {
      if (!c.interviewDate || !isToday(c.interviewDate)) return false;
    } else if (dateFilter === "TOMORROW") {
      if (!c.interviewDate || !isTomorrow(c.interviewDate)) return false;
    } else if (dateFilter === "THIS_WEEK") {
      if (!c.interviewDate || !isThisWeek(c.interviewDate)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.fullName.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchRole = c.appliedRole.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchRole) return false;
    }

    return true;
  });

  const todayCount = candidates.filter(
    (c) => c.interviewDate && isToday(c.interviewDate)
  ).length;

  const tomorrowCount = candidates.filter(
    (c) => c.interviewDate && isTomorrow(c.interviewDate)
  ).length;

  return (
    <div className="min-h-screen bg-canvas-soft flex flex-col pb-32 md:pb-8">
      {/* Top Recruiter Navbar */}
      <RecruiterNavbar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPartiesModal={() => setIsAddPartiesModalOpen(true)}
        partiesCount={parties.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        recruiterProfile={recruiterProfile}
        onOpenProfileModal={() => setIsOnboardingModalOpen(true)}
        onSignOut={handleSignOut}
        candidateCount={candidates.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Top KPI Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 mb-6">
          <div className="bg-canvas border border-hairline rounded-lg p-3 shadow-level1">
            <div className="text-[11px] text-ink-mute uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Total Roster</span>
              <Users className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-xl sm:text-2xl font-light text-ink tabular-nums">
              {stats.total}
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab("LINEUP");
              setDateFilter("TODAY");
            }}
            className={`bg-canvas border rounded-lg p-3 shadow-level1 cursor-pointer transition-all ${
              dateFilter === "TODAY"
                ? "border-primary ring-2 ring-primary/20"
                : "border-hairline hover:border-primary"
            }`}
          >
            <div className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Today&apos;s Line-Up</span>
              <Calendar className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-primary tabular-nums">
              {todayCount}
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab("LINEUP");
              setDateFilter("TOMORROW");
            }}
            className={`bg-canvas border rounded-lg p-3 shadow-level1 cursor-pointer transition-all ${
              dateFilter === "TOMORROW"
                ? "border-primary ring-2 ring-primary/20"
                : "border-hairline hover:border-primary"
            }`}
          >
            <div className="text-[11px] text-ink-mute uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Tomorrow</span>
              <Clock className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-light text-purple-600 tabular-nums">
              {tomorrowCount}
            </div>
          </div>

          <div className="bg-canvas border border-hairline rounded-lg p-3 shadow-level1">
            <div className="text-[11px] text-ink-mute uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Shortlisted</span>
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-light text-blue-600 tabular-nums">
              {stats.shortlisted}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-canvas border border-hairline rounded-lg p-3 shadow-level1">
            <div className="text-[11px] text-ink-mute uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Selected</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-light text-emerald-600 tabular-nums">
              {stats.selected}
            </div>
          </div>
        </div>

        {/* View Switcher Bar (Mobile & Tablet) */}
        <div className="flex md:hidden items-center justify-between gap-1 mb-4 bg-canvas p-1 rounded-xl border border-hairline shadow-sm overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("LINEUP")}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === "LINEUP"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-ink-secondary"
            }`}
          >
            Line-Up
          </button>
          <button
            onClick={() => setActiveTab("CALENDAR")}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === "CALENDAR"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-ink-secondary"
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab("LOGS")}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center justify-center gap-1 ${
              activeTab === "LOGS"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-ink-secondary"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>Logs</span>
          </button>
          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === "SETTINGS"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-ink-secondary"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Active Tab: CALENDAR VIEW */}
        {activeTab === "CALENDAR" && (
          <CalendarView
            candidates={candidates}
            onStatusChange={(candidateId, newStatus) => {
              const cand = candidates.find((c) => c.id === candidateId);
              if (cand) requestStatusChangeWithPin(cand, newStatus);
            }}
            onOpenDetails={(c) => {
              router.push(`/admin/candidate/${c.id}`);
            }}
          />
        )}

        {/* Active Tab: LINE-UP ROSTER TABLE & CARDS */}
        {activeTab === "LINEUP" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-canvas border border-hairline rounded-xl p-3 sm:p-4 shadow-level1 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
                  <input
                    type="text"
                    placeholder="Search name, phone, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  />
                </div>

                {/* Date Filter Buttons */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar py-1">
                  <button
                    onClick={() => setDateFilter("ALL")}
                    className={`px-3 py-1.5 rounded-pill text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                      dateFilter === "ALL"
                        ? "bg-brand-dark text-white shadow-sm"
                        : "bg-canvas-soft border border-hairline text-ink-secondary hover:border-primary"
                    }`}
                  >
                    All ({candidates.length})
                  </button>

                  <button
                    onClick={() => setDateFilter("TODAY")}
                    className={`px-3 py-1.5 rounded-pill text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                      dateFilter === "TODAY"
                        ? "bg-primary text-white shadow-sm"
                        : "bg-canvas-soft border border-hairline text-primary hover:bg-primary/5"
                    }`}
                  >
                    Today ({todayCount})
                  </button>

                  <button
                    onClick={() => setDateFilter("TOMORROW")}
                    className={`px-3 py-1.5 rounded-pill text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                      dateFilter === "TOMORROW"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-canvas-soft border border-hairline text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    Tomorrow ({tomorrowCount})
                  </button>

                  <button
                    onClick={() => setDateFilter("THIS_WEEK")}
                    className={`px-3 py-1.5 rounded-pill text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                      dateFilter === "THIS_WEEK"
                        ? "bg-brand-dark text-white shadow-sm"
                        : "bg-canvas-soft border border-hairline text-ink-secondary hover:border-primary"
                    }`}
                  >
                    This Week
                  </button>
                </div>
              </div>

              {/* Row 2: Role & Status Dropdowns */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-hairline text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-ink-mute hidden sm:inline">Role:</span>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="text-xs px-2.5 py-1 rounded-sm border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="Documentation Specialist">Documentation Specialist</option>
                      <option value="Operations Executive">Operations Executive</option>
                      <option value="HR Trainee">HR Trainee</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-ink-mute hidden sm:inline text-xs font-medium">Stage:</span>
                    <StatusFilterDropdown
                      value={statusFilter}
                      onChange={(st) => setStatusFilter(st)}
                    />
                  </div>

                  {(roleFilter !== "ALL" || statusFilter !== "ALL" || searchQuery || dateFilter !== "ALL") && (
                    <button
                      onClick={() => {
                        setRoleFilter("ALL");
                        setStatusFilter("ALL");
                        setSearchQuery("");
                        setDateFilter("ALL");
                      }}
                      className="text-xs text-primary hover:underline px-2 py-0.5"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="text-xs text-ink-mute hover:text-primary inline-flex items-center gap-1 py-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin text-primary" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile View: Clean Candidate Cards List */}
            <div className="block md:hidden space-y-3">
              {loading ? (
                <div className="p-8 text-center text-ink-mute">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <span>Loading candidate line-up...</span>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="p-8 bg-canvas border border-hairline rounded-xl text-center text-ink-mute">
                  <Users className="w-8 h-8 mx-auto text-primary/40 mb-2" />
                  <p className="font-semibold text-ink text-sm">No candidates in line-up yet</p>
                  <p className="text-xs text-ink-mute mt-1">
                    {candidates.length === 0
                      ? "Your line-up roster is clean and ready."
                      : "No candidates match the active filters."}
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-3.5 btn-primary-pill text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-sm"
                  >
                    + Add New Candidate
                  </button>
                </div>
              ) : (
                filteredCandidates.map((c) => {
                  const pastel = PASTEL_CARD_THEMES[c.status] || PASTEL_CARD_THEMES["New Applied"];
                  const { dateStr, timeStr, relativeLabel } = formatIndianDateTime(c.interviewDate);

                  return (
                    <div
                      key={c.id}
                      className={`border rounded-xl p-4 shadow-sm space-y-3 transition-all ${pastel.cardBg} ${pastel.cardBorder}`}
                    >
                      {/* Top Row: Role & Status Dropdown with Colored Bullet Dots */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full truncate max-w-[180px] ${pastel.badgeBg} ${pastel.badgeText}`}>
                          {c.appliedRole}
                        </span>

                        <CandidateStatusDropdown
                          currentStatus={c.status}
                          onStatusChange={(newSt) => requestStatusChangeWithPin(c, newSt)}
                        />
                      </div>

                      {/* Candidate Name & Contact Details */}
                      <div>
                        <div className="text-base font-semibold text-ink flex items-center justify-between gap-2">
                          <span className="truncate">{c.fullName}</span>
                          <span className="text-[10px] text-ink-mute font-mono shrink-0 bg-white/70 px-1.5 py-0.5 rounded border border-hairline">
                            {c.id}
                          </span>
                        </div>
                        <div className="text-xs text-ink-mute flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary shrink-0" />
                            {c.location}
                          </span>
                          <span>•</span>
                          <span className="tabular-nums font-medium text-ink-secondary">{c.experienceYears} Yrs Exp</span>
                          <span>•</span>
                          <span className="tabular-nums font-medium text-ink-secondary">
                            {c.noticePeriodDays === 0 ? "Immediate" : `${c.noticePeriodDays}d Notice`}
                          </span>
                          {c.expectedCtc && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-medium">
                                Exp: {c.expectedCtc}
                                {calculateSalaryBreakdown(c.expectedCtc) && (
                                  <span className="text-[10px] ml-1 bg-emerald-100/80 px-1 py-0.2 rounded font-semibold text-emerald-800">
                                    {calculateSalaryBreakdown(c.expectedCtc)?.monthlyShort}
                                  </span>
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Scheduled Time Banner */}
                      {c.interviewDate ? (
                        <div className="p-2.5 rounded-lg bg-white/80 border border-primary/20 flex items-center justify-between gap-2 text-xs shadow-xs">
                          <div className="flex items-center gap-1.5 text-primary font-medium min-w-0">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {relativeLabel ? `${relativeLabel}, ` : ""}
                              {dateStr} at {timeStr}
                            </span>
                          </div>
                          <Link
                            href={`/admin/candidate/${c.id}`}
                            className="text-[11px] text-primary hover:underline font-semibold shrink-0 py-0.5 inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reschedule</span>
                          </Link>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-white/60 border border-hairline flex items-center justify-between gap-2 text-xs text-ink-mute">
                          <span>No interview scheduled</span>
                          <Link
                            href={`/admin/candidate/${c.id}`}
                            className="text-[11px] text-primary font-medium hover:underline shrink-0 py-0.5"
                          >
                            + Schedule Slot
                          </Link>
                        </div>
                      )}

                      {/* View Full Dossier Page Link */}
                      <Link
                        href={`/admin/candidate/${c.id}`}
                        className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-white/90 hover:bg-white text-ink border border-hairline transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span>Open Candidate Dossier Page</span>
                        {c.rescheduleCount && c.rescheduleCount > 0 ? (
                          <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                            Rescheduled ×{c.rescheduleCount}
                          </span>
                        ) : null}
                      </Link>

                      {/* Reason for Rejection / Non-Selection Note if set */}
                      {c.rejectionReason && (
                        <div className="text-[11px] text-rose-700 bg-rose-50/90 p-2 rounded-lg border border-rose-200/70 flex items-start gap-1.5">
                          <span className="font-semibold shrink-0">Non-Selection Reason:</span>
                          <span className="italic truncate">{c.rejectionReason}</span>
                        </div>
                      )}

                      {/* Direct Call, WhatsApp & Resume Buttons */}
                      <div className="grid grid-cols-5 gap-2 pt-2 border-t border-hairline/60">
                        <a
                          href={`tel:${c.phone}`}
                          className="col-span-2 text-center py-2.5 text-xs font-semibold rounded-pill bg-white/90 border border-hairline text-ink hover:text-primary transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`https://wa.me/91${c.phone}?text=Hello%20${encodeURIComponent(
                            c.fullName
                          )},%20this%20is%20from%20TalentFlow%20Recruitment%20regarding%20your%20interview%20schedule.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="col-span-2 text-center py-2.5 text-xs font-semibold rounded-pill bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={c.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="col-span-1 py-2.5 rounded-pill bg-white/90 border border-hairline text-primary hover:bg-primary/5 transition-all flex items-center justify-center active:scale-95 shadow-sm"
                          title="Open Resume"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                      </div>

                      {c.recruiterNotes && (
                        <p className="text-[11px] text-ink-mute italic bg-white/70 p-2.5 rounded-lg border border-hairline">
                          &ldquo;{c.recruiterNotes}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop View: Full Enterprise Table */}
            <div className="hidden md:block bg-canvas border border-hairline rounded-xl shadow-level2 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-hairline">
                  <thead className="bg-canvas-soft text-ink-mute font-medium text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Interview Schedule</th>
                      <th className="py-3 px-4">Candidate &amp; Contact</th>
                      <th className="py-3 px-4">Applied Role</th>
                      <th className="py-3 px-4 text-center">Exp / Notice</th>
                      <th className="py-3 px-4">Current / Exp CTC</th>
                      <th className="py-3 px-4">Resume</th>
                      <th className="py-3 px-4">Pipeline Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline bg-canvas">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-ink-mute">
                          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                          <span>Loading candidate line-up...</span>
                        </td>
                      </tr>
                    ) : filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-ink-mute">
                          <Users className="w-10 h-10 mx-auto text-primary/40 mb-3" />
                          <p className="text-base font-semibold text-ink">
                            {candidates.length === 0
                              ? "Your candidate line-up roster is empty and ready"
                              : "No candidates match the active filters"}
                          </p>
                          <p className="text-xs text-ink-mute mt-1 max-w-sm mx-auto">
                            {candidates.length === 0
                              ? "All demo entries have been cleared. Add real candidate line-ups to schedule interviews and export manager reports."
                              : "Try clearing your role, stage, or date filters to see more candidates."}
                          </p>
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="mt-4 btn-primary-pill text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-sm"
                          >
                            + Add New Candidate
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((c) => {
                        const statusMeta = STATUS_CONFIG[c.status] || STATUS_CONFIG["New Applied"];
                        const { dateStr, timeStr, relativeLabel } = formatIndianDateTime(c.interviewDate);

                        return (
                          <tr key={c.id} className="hover:bg-canvas-soft/70 transition-colors">
                            <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                              {c.interviewDate ? (
                                <div>
                                  <div className="font-semibold text-primary flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{timeStr}</span>
                                    {relativeLabel && (
                                      <span className="text-[10px] px-1.5 py-0.2 bg-primary/10 rounded font-bold">
                                        {relativeLabel}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-ink-mute">{dateStr}</div>
                                </div>
                              ) : (
                                <Link
                                  href={`/admin/candidate/${c.id}`}
                                  className="text-[11px] text-primary hover:underline font-medium"
                                >
                                  + Set Schedule
                                </Link>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-ink text-[13px] flex items-center gap-1.5">
                                <span>{c.fullName}</span>
                                <span className="text-[10px] text-ink-mute font-mono font-normal">
                                  ({c.id})
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-ink-mute mt-0.5">
                                <a
                                  href={`tel:${c.phone}`}
                                  className="hover:text-primary flex items-center gap-1 tabular-nums"
                                >
                                  <Phone className="w-2.5 h-2.5 text-emerald-600" />
                                  {c.phone}
                                </a>
                                <span>•</span>
                                <a
                                  href={`https://wa.me/91${c.phone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-emerald-600 flex items-center gap-0.5 text-emerald-600 font-medium"
                                >
                                  <MessageCircle className="w-2.5 h-2.5" />
                                  WhatsApp
                                </a>
                              </div>
                              <div className="text-[10px] text-ink-mute flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-primary" />
                                <span>{c.location}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-medium text-ink">{c.appliedRole}</span>
                            </td>

                            <td className="py-3.5 px-4 text-center whitespace-nowrap tabular-nums">
                              <div className="font-medium text-ink">{c.experienceYears} Yrs</div>
                              <div className="text-[10px] text-ink-mute">
                                {c.noticePeriodDays === 0 ? "Immediate" : `${c.noticePeriodDays}d Notice`}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                              <div className="text-ink text-[11px] flex items-center gap-1.5">
                                <span>{c.currentCtc || "—"}</span>
                                {calculateSalaryBreakdown(c.currentCtc) && (
                                   <span className="text-[10px] text-ink-mute">
                                     ({calculateSalaryBreakdown(c.currentCtc)?.monthlyShort})
                                   </span>
                                 )}
                              </div>
                              <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                                <span>Exp: {c.expectedCtc || "—"}</span>
                                {calculateSalaryBreakdown(c.expectedCtc) && (
                                   <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-semibold">
                                     {calculateSalaryBreakdown(c.expectedCtc)?.monthlyShort}
                                   </span>
                                 )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <a
                                href={c.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline bg-primary/5 px-2 py-1 rounded"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Drive Link</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <CandidateStatusDropdown
                                currentStatus={c.status}
                                onStatusChange={(newSt) => requestStatusChangeWithPin(c, newSt)}
                              />
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                              <Link
                                href={`/admin/candidate/${c.id}`}
                                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-primary/5 border border-hairline transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Dossier</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => requestDeleteWithPin(c)}
                                className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 font-medium inline-flex items-center p-1.5 rounded-md border border-hairline transition-colors"
                                title="Delete Candidate Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-canvas-soft border-t border-hairline px-4 py-3 flex items-center justify-between text-xs text-ink-mute">
                <div>
                  Showing <span className="font-semibold text-ink">{filteredCandidates.length}</span> candidates in line-up
                </div>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Manager Report (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Tab: LOGS AUDIT TRAIL */}
        {activeTab === "LOGS" && (
          <ActivityLogsTab
            logs={logs}
            onClearLogs={handleClearLogs}
            onExportLogs={handleExportLogs}
          />
        )}

        {/* Active Tab: SETTINGS & DATABASE BACKUP */}
        {activeTab === "SETTINGS" && (
          <SettingsTab
            candidates={candidates}
            settings={settings}
            onUpdateSettings={handleSaveSettings}
            recruiterProfile={recruiterProfile}
            onOpenProfileModal={() => setIsOnboardingModalOpen(true)}
            logs={logs}
          />
        )}
      </main>

      {/* Candidate Dossier & Reschedule Modal */}
      <CandidateDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => {
          setIsDossierModalOpen(false);
          setDossierCandidate(null);
        }}
        candidate={dossierCandidate}
        onSave={async (updatedCandidate) => {
          await handleSaveDossier(updatedCandidate.id, updatedCandidate);
        }}
        onRequestStatusChange={(id, newStatus) => {
          const cand = candidates.find((c) => c.id === id);
          if (cand) {
            requestStatusChangeWithPin(cand, newStatus);
          }
        }}
        onRequestDelete={(id) => {
          const cand = candidates.find((c) => c.id === id);
          if (cand) {
            requestDeleteWithPin(cand);
          }
        }}
      />

      {/* 4-Digit Action Security PIN Modal */}
      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingPinAction(null);
        }}
        onSuccess={() => {
          if (pendingPinAction) {
            const action = pendingPinAction;
            setPendingPinAction(null);
            action();
          }
        }}
        expectedPin={settings.securityPin || "1234"}
        actionTitle={pinModalTitle}
        actionDescription={pinModalDescription}
      />

      {/* Add Candidate Modal */}
      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCandidateAdded={handleCandidateAdded}
        currentUser={currentUser}
      />

      {/* Manager Export Modal */}
      <ManagerExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        candidates={candidates}
      />

      {/* Recruiter Onboarding & Cursive Logo Designer Modal */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        currentUser={currentUser}
        existingProfile={recruiterProfile}
        onSaveProfile={handleSaveProfile}
        settings={settings}
      />

      {/* Collaborator Parties & Permissions Modal */}
      <AddPartiesModal
        isOpen={isAddPartiesModalOpen}
        onClose={() => setIsAddPartiesModalOpen(false)}
        parties={parties}
        currentUser={currentUser}
        recruiterProfile={recruiterProfile}
        activeParty={activeParty}
        onSetActiveParty={setActiveParty}
        onPartyUpdated={() => {
          getPartiesFromFirestore().then((res) => {
            if (res) setParties(res);
          });
        }}
        onAddLog={addLog}
      />

      {/* Sticky Bottom Navigation for Mobile */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />
    </div>
  );
}
