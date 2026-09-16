"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  RotateCcw,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  History,
  Shield,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  CandidateItem,
  AppSettings,
  ActivityLogItem,
  RecruiterProfile,
} from "@/lib/types";
import { formatIndianDateTime } from "@/lib/date-utils";
import { calculateSalaryBreakdown } from "@/lib/salary-utils";
import {
  onRecruiterAuthStateChanged,
  getCandidateFromFirestore,
  updateCandidateInFirestore,
  deleteCandidateFromFirestore,
  getSettingsFromFirestore,
  saveActivityLogToFirestore,
  getActivityLogsFromFirestore,
  getRecruiterProfileFromFirestore,
} from "@/lib/firebase";
import { User } from "firebase/auth";
import CandidateStatusDropdown, {
  STATUS_META_MAP,
} from "@/components/CandidateStatusDropdown";
import SecurityPinModal from "@/components/SecurityPinModal";
import GoogleAuthGate from "@/components/GoogleAuthGate";

const RESCHEDULE_REASONS = [
  "Candidate requested alternate slot due to current job shift",
  "Interviewer panel was unavailable / internal meeting clash",
  "Candidate unwell / family emergency",
  "Client requested date shift / interviewer rescheduled",
  "Network or audio/video connectivity issue during interview",
  "Candidate requested 24h preparation buffer",
];

const REJECTION_REASONS = [
  "Notice period is too long for immediate business requirements",
  "Expected salary exceeds client budget threshold",
  "Technical evaluation / round 1 assessment not cleared",
  "Communication or conversational fluency did not meet standard",
  "Candidate did not attend scheduled interview (No Show)",
  "Client selected alternative candidate with more relevant domain experience",
  "Candidate declined offer / accepted counter-offer from current company",
];

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = (params?.id as string) || "";

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile | null>(null);

  const [candidate, setCandidate] = useState<CandidateItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [appliedRole, setAppliedRole] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [noticePeriodDays, setNoticePeriodDays] = useState(0);
  const [currentCtc, setCurrentCtc] = useState("");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [status, setStatus] = useState("New Applied");
  const [interviewDateTime, setInterviewDateTime] = useState("");
  const [rescheduleCount, setRescheduleCount] = useState(0);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [recruiterNotes, setRecruiterNotes] = useState("");

  // PIN & Settings
  const [settings, setSettings] = useState<AppSettings>({
    securityPin: "1234",
    pinProtectionEnabled: true,
    requirePinForStatus: true,
    requirePinForDelete: true,
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinActionTitle, setPinActionTitle] = useState("");
  const [pinActionDescription, setPinActionDescription] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void | Promise<void>) | null>(null);

  // Candidate Audit Logs
  const [candidateLogs, setCandidateLogs] = useState<ActivityLogItem[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsub = onRecruiterAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        getSettingsFromFirestore().then((s) => {
          if (s) setSettings(s);
        });
        getRecruiterProfileFromFirestore(user.uid).then((p) => {
          if (p) setRecruiterProfile(p);
        });
      }
    });
    return () => unsub();
  }, []);

  // Fetch Candidate Data
  const fetchCandidateData = useCallback(async () => {
    if (!candidateId) return;
    setLoading(true);
    try {
      // 1. Try local API
      let loadedCandidate: CandidateItem | null = null;
      try {
        const res = await fetch(`/api/candidates/${candidateId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.candidate) {
            loadedCandidate = data.candidate;
          }
        }
      } catch (err) {
        console.warn("Local API fetch failed, falling back to Firestore:", err);
      }

      // 2. Fallback to Firestore
      if (!loadedCandidate) {
        loadedCandidate = await getCandidateFromFirestore(candidateId);
      }

      if (loadedCandidate) {
        setCandidate(loadedCandidate);
        setFullName(loadedCandidate.fullName || "");
        setPhone(loadedCandidate.phone || "");
        setEmail(loadedCandidate.email || "");
        setLocation(loadedCandidate.location || "");
        setAppliedRole(loadedCandidate.appliedRole || "");
        setExperienceYears(loadedCandidate.experienceYears || 0);
        setNoticePeriodDays(loadedCandidate.noticePeriodDays || 0);
        setCurrentCtc(loadedCandidate.currentCtc || "");
        setExpectedCtc(loadedCandidate.expectedCtc || "");
        setResumeUrl(loadedCandidate.resumeUrl || "");
        setStatus(loadedCandidate.status || "New Applied");
        setRescheduleCount(loadedCandidate.rescheduleCount || 0);
        setRescheduleReason(loadedCandidate.rescheduleReason || "");
        setRejectionReason(loadedCandidate.rejectionReason || "");
        setRecruiterNotes(loadedCandidate.recruiterNotes || "");

        if (loadedCandidate.interviewDate) {
          const d = new Date(loadedCandidate.interviewDate);
          if (!isNaN(d.getTime())) {
            const tzOffset = d.getTimezoneOffset() * 60000;
            const localIso = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
            setInterviewDateTime(localIso);
          } else {
            setInterviewDateTime("");
          }
        } else {
          setInterviewDateTime("");
        }
      } else {
        toast.error("Candidate record not found");
      }

      // 3. Fetch Activity Logs for this candidate
      try {
        const allLogs = await getActivityLogsFromFirestore();
        if (allLogs && allLogs.length > 0) {
          setCandidateLogs(
            allLogs.filter(
              (l) => l.candidateId === candidateId || (loadedCandidate && l.candidateName === loadedCandidate.fullName)
            )
          );
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error("Error fetching candidate:", err);
      toast.error("Failed to load candidate information");
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    if (currentUser) {
      fetchCandidateData();
    }
  }, [currentUser, fetchCandidateData]);

  // Calculations for live CTC
  const currentCtcBreakdown = calculateSalaryBreakdown(currentCtc);
  const expectedCtcBreakdown = calculateSalaryBreakdown(expectedCtc);

  // Quick Preset Handlers
  const handleQuickPreset = (offsetHours: number) => {
    const target = new Date(Date.now() + offsetHours * 3600000);
    const tzOffset = target.getTimezoneOffset() * 60000;
    const localIso = new Date(target.getTime() - tzOffset).toISOString().slice(0, 16);
    setInterviewDateTime(localIso);
  };

  // PIN Guard
  const requestProtectedAction = (
    title: string,
    description: string,
    isDelete: boolean,
    action: () => void | Promise<void>
  ) => {
    if (!settings.pinProtectionEnabled) {
      action();
      return;
    }
    const isRequired = isDelete
      ? (settings.requirePinForDelete ?? true)
      : (settings.requirePinForStatus ?? true);

    if (!isRequired) {
      action();
      return;
    }

    setPinActionTitle(title);
    setPinActionDescription(description);
    setPendingAction(() => action);
    setIsPinModalOpen(true);
  };

  // Status Change
  const handleStatusSelect = (newStatus: string) => {
    if (newStatus === status) return;
    requestProtectedAction(
      "Confirm Pipeline Status Update",
      `Enter your 4-digit PIN to update candidate stage from "${status}" to "${newStatus}".`,
      false,
      () => {
        setStatus(newStatus);
        toast.info(`Candidate stage changed to "${newStatus}". Click Save Changes to commit.`);
      }
    );
  };

  // Delete Candidate
  const handleDeleteCandidate = () => {
    if (!candidate) return;
    requestProtectedAction(
      "Delete Candidate Record",
      `Enter your 4-digit Security PIN to permanently delete "${candidate.fullName}" (${candidate.id}) from the line-up roster.`,
      true,
      async () => {
        try {
          // 1. Delete from SQLite API
          await fetch(`/api/candidates/${candidate.id}`, { method: "DELETE" });
          // 2. Delete from Firestore
          await deleteCandidateFromFirestore(candidate.id);

          // 3. Log event
          const deleteLog: ActivityLogItem = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            recruiterName: recruiterProfile?.name || currentUser?.displayName || "Recruiter",
            action: "CANDIDATE_DELETED",
            candidateName: candidate.fullName,
            candidateId: candidate.id,
            details: `Candidate record ${candidate.id} permanently removed`,
            glowColor: "rose",
          };
          saveActivityLogToFirestore(deleteLog).catch(() => {});

          toast.success("Candidate record deleted successfully");
          router.push("/admin");
        } catch (err) {
          toast.error("Failed to delete candidate");
        }
      }
    );
  };

  // Save All Changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!candidate) return;

    setSaving(true);
    try {
      const isDateChanged =
        (candidate.interviewDate || interviewDateTime) &&
        (candidate.interviewDate
          ? new Date(candidate.interviewDate).toISOString().slice(0, 16)
          : "") !== (interviewDateTime ? new Date(interviewDateTime).toISOString().slice(0, 16) : "");

      const nextRescheduleCount = isDateChanged
        ? (rescheduleCount || 0) + 1
        : rescheduleCount;

      const updatedRecord: Partial<CandidateItem> = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        location: location.trim(),
        appliedRole: appliedRole.trim(),
        experienceYears: Number(experienceYears),
        noticePeriodDays: Number(noticePeriodDays),
        currentCtc: currentCtc.trim() || null,
        expectedCtc: expectedCtc.trim() || null,
        resumeUrl: resumeUrl.trim(),
        status,
        interviewDate: interviewDateTime ? new Date(interviewDateTime).toISOString() : null,
        rescheduleCount: nextRescheduleCount,
        rescheduleReason: rescheduleReason.trim() || null,
        rejectionReason: rejectionReason.trim() || null,
        recruiterNotes: recruiterNotes.trim() || null,
        updatedAt: new Date().toISOString(),
      };

      // 1. Update API
      await fetch(`/api/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecord),
      });

      // 2. Update Firestore
      await updateCandidateInFirestore(candidate.id, updatedRecord);

      // 3. Add Audit Log
      const auditLog: ActivityLogItem = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        recruiterName: recruiterProfile?.name || currentUser?.displayName || "Recruiter",
        action: isDateChanged ? "RESCHEDULE" : status !== candidate.status ? "STATUS_CHANGE" : "NOTES_UPDATED",
        candidateName: fullName,
        candidateId: candidate.id,
        details: isDateChanged
          ? `Interview rescheduled (${nextRescheduleCount}x): ${rescheduleReason || "Slot revised"}`
          : status !== candidate.status
          ? `Status updated to ${status}`
          : "Candidate dossier details updated",
        previousValue: candidate.status,
        newValue: status,
        glowColor: isDateChanged ? "amber" : status === "Selected" ? "emerald" : status === "Rejected" ? "rose" : "blue",
      };
      saveActivityLogToFirestore(auditLog).catch(() => {});

      setRescheduleCount(nextRescheduleCount);
      setCandidate((prev) => (prev ? { ...prev, ...updatedRecord } as CandidateItem : null));
      setCandidateLogs((prev) => [auditLog, ...prev]);

      toast.success("Candidate dossier updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-canvas-soft flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <GoogleAuthGate
        onSuccess={() => {
          // auth state listener will update currentUser automatically
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-soft flex flex-col items-center justify-center p-4 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-ink-mute">Loading candidate profile dossier...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-canvas-soft flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-ink">Candidate Not Found</h2>
        <p className="text-xs text-ink-mute mt-1 mb-4">
          The candidate record you are looking for ({candidateId}) does not exist or has been deleted.
        </p>
        <Link
          href="/admin"
          className="btn-primary-pill text-xs py-2 px-4 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Candidate Line-Up</span>
        </Link>
      </div>
    );
  }

  const statusMeta = STATUS_META_MAP[status] || STATUS_META_MAP["New Applied"];
  const formattedSchedule = formatIndianDateTime(candidate.interviewDate);

  return (
    <div className="min-h-screen bg-canvas-soft flex flex-col pb-24">
      {/* Top Header Command Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-hairline shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Back Link & Candidate Name */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin"
              className="p-2 rounded-lg text-ink-mute hover:text-ink hover:bg-canvas-soft border border-hairline transition-colors shrink-0"
              title="Back to Candidate Line-Up"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-ink truncate">
                  {fullName || "Candidate Dossier"}
                </h1>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-canvas-soft border border-hairline text-ink-mute shrink-0">
                  {candidate.id}
                </span>
              </div>
              <p className="text-[11px] text-ink-mute truncate">
                {appliedRole} • {location}
              </p>
            </div>
          </div>

          {/* Right: Status Dropdown & Save Button */}
          <div className="flex items-center gap-2 shrink-0">
            <CandidateStatusDropdown
              currentStatus={status}
              onSelectStatus={handleStatusSelect}
            />

            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="btn-primary-pill text-xs py-2 px-3.5 sm:px-4 inline-flex items-center gap-1.5 shadow-xs"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span className="font-semibold hidden sm:inline">Save Changes</span>
                  <span className="font-semibold sm:hidden">Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Quick Contact & Action Ribbon */}
        <div className="bg-canvas border border-hairline rounded-2xl p-4 shadow-level1 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
            <a
              href={`tel:${phone}`}
              className="px-3 py-2 rounded-xl bg-canvas-soft hover:bg-canvas border border-hairline font-semibold text-ink inline-flex items-center gap-2 transition-all hover:border-emerald-300"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call: {phone}</span>
            </a>

            <a
              href={`https://wa.me/91${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 font-semibold text-emerald-800 inline-flex items-center gap-2 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Message</span>
            </a>

            <a
              href={`mailto:${email}`}
              className="px-3 py-2 rounded-xl bg-canvas-soft hover:bg-canvas border border-hairline font-semibold text-ink inline-flex items-center gap-2 transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>{email}</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-pill text-xs py-2 px-3.5 inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-deep"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Resume Document</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              type="button"
              onClick={handleDeleteCandidate}
              className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete candidate record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Details, Monthly CTC Breakdown, and Interview Rescheduling */}
          <div className="lg:col-span-2 space-y-6">
            {/* Box 1: Monthly Compensation Breakdown (Real-Time Calculation) */}
            <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-ink">
                      Monthly Compensation &amp; CTC Breakdown
                    </h2>
                    <p className="text-[11px] text-ink-mute">
                      Real-time live calculated monthly salary breakdown based on annual package
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Live Calculator
                </span>
              </div>

              {/* Dynamic Visual Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current CTC Card */}
                <div className="p-4 rounded-xl bg-canvas-soft border border-hairline space-y-2">
                  <span className="text-[11px] font-bold text-ink-mute uppercase tracking-wider block">
                    Current Package Breakdown
                  </span>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-bold text-ink">
                        {currentCtcBreakdown?.monthlyFormatted || "—"}
                      </span>
                      <span className="text-xs text-ink-mute block mt-0.5">
                        {currentCtcBreakdown ? `Annual: ${currentCtcBreakdown.annualFormatted}` : "No valid package entered"}
                      </span>
                    </div>
                    {currentCtcBreakdown && (
                      <span className="text-xs font-bold text-ink-secondary bg-canvas px-2 py-1 rounded-md border border-hairline">
                        {currentCtcBreakdown.monthlyShort}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expected CTC Card */}
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                    Expected Package Breakdown
                  </span>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                        {expectedCtcBreakdown?.monthlyFormatted || "—"}
                      </span>
                      <span className="text-xs text-emerald-800/80 dark:text-emerald-400/80 block mt-0.5">
                        {expectedCtcBreakdown ? `Annual: ${expectedCtcBreakdown.annualFormatted}` : "As per company standards"}
                      </span>
                    </div>
                    {expectedCtcBreakdown && (
                      <span className="text-xs font-bold text-emerald-700 bg-white dark:bg-emerald-900 px-2 py-1 rounded-md border border-emerald-300">
                        {expectedCtcBreakdown.monthlyShort}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Editable CTC Input Fields with Live Feed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-ink">
                      Edit Current CTC:
                    </label>
                    {currentCtcBreakdown && (
                      <span className="text-[10px] font-semibold text-emerald-600">
                        ≈ {currentCtcBreakdown.monthlyFormatted}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={currentCtc}
                    onChange={(e) => setCurrentCtc(e.target.value)}
                    placeholder="e.g. 2,00,000 or 5 LPA"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-ink">
                      Edit Expected CTC:
                    </label>
                    {expectedCtcBreakdown && (
                      <span className="text-[10px] font-semibold text-emerald-600">
                        ≈ {expectedCtcBreakdown.monthlyFormatted}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={expectedCtc}
                    onChange={(e) => setExpectedCtc(e.target.value)}
                    placeholder="e.g. 7,00,000 or 7 LPA"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Interview Scheduling & Rescheduling Hub */}
            <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-ink">
                        Interview Schedule &amp; Rescheduling Hub
                      </h2>
                      {rescheduleCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          Rescheduled {rescheduleCount}x
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-mute">
                      Manage interview slot timing, reasons for postponement, and calendar sync
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Scheduled Time Indicator */}
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-ink">Active Slot:</span>
                  <span className="text-primary font-bold">
                    {formattedSchedule.dateStr ? `${formattedSchedule.dateStr}, ${formattedSchedule.timeStr}` : "Not Scheduled Yet"}
                  </span>
                </div>
                {formattedSchedule.relativeLabel && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary text-white">
                    {formattedSchedule.relativeLabel}
                  </span>
                )}
              </div>

              {/* Date & Time Picker */}
              <div>
                <label className="text-xs font-medium text-ink block mb-1.5">
                  Select New Interview Date &amp; Time (Local):
                </label>
                <input
                  type="datetime-local"
                  value={interviewDateTime}
                  onChange={(e) => setInterviewDateTime(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary font-mono"
                />
              </div>

              {/* Quick 1-Click Presets */}
              <div>
                <span className="text-[11px] font-medium text-ink-mute block mb-1.5">
                  Quick Slot Presets:
                </span>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset(24)}
                    className="btn-secondary-pill text-[11px] py-1 px-2.5 hover:border-primary/40"
                  >
                    +24h (Tomorrow Same Time)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset(48)}
                    className="btn-secondary-pill text-[11px] py-1 px-2.5 hover:border-primary/40"
                  >
                    +48h (Day After Tomorrow)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset(72)}
                    className="btn-secondary-pill text-[11px] py-1 px-2.5 hover:border-primary/40"
                  >
                    +3 Days Buffer
                  </button>
                </div>
              </div>

              {/* Reschedule Reason Selector */}
              <div>
                <label className="text-xs font-medium text-ink block mb-1.5">
                  Document Reason for Rescheduling (Why changed?):
                </label>
                <select
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary mb-2"
                >
                  <option value="">-- Choose standard reason or type custom below --</option>
                  {RESCHEDULE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Or write custom reason for rescheduling..."
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Box 3: Candidate Profile & Experience Details */}
            <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1 space-y-4">
              <h2 className="text-sm font-bold text-ink pb-3 border-b border-hairline flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <span>Candidate Profile &amp; Role Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-medium text-ink-secondary block mb-1">
                    Candidate Full Name:
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-medium text-ink-secondary block mb-1">
                    Role / Position:
                  </label>
                  <input
                    type="text"
                    value={appliedRole}
                    onChange={(e) => setAppliedRole(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-medium text-ink-secondary block mb-1">
                    Location / Hub City:
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-medium text-ink-secondary block mb-1">
                    Total Experience (Years):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-medium text-ink-secondary block mb-1">
                    Notice Period (Days):
                  </label>
                  <input
                    type="number"
                    value={noticePeriodDays}
                    onChange={(e) => setNoticePeriodDays(parseInt(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-medium text-ink-secondary block mb-1">
                    Resume Drive URL:
                  </label>
                  <input
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Status Justification, Recruiter Notes & Audit Trail */}
          <div className="space-y-6">
            {/* Decision Justification (Why Selected or Rejected) */}
            <div className="bg-canvas border border-hairline rounded-2xl p-5 shadow-level1 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-hairline">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Selection / Rejection Documentation
                </h3>
              </div>

              <p className="text-[11px] text-ink-mute">
                Document why candidate was not selected or reasons for final decision:
              </p>

              <div>
                <label className="text-[11px] font-medium text-ink-secondary block mb-1">
                  Preset Rejection Justification:
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary mb-2"
                >
                  <option value="">-- Select reason --</option>
                  {REJECTION_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>

                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Custom justification or client remarks..."
                  className="w-full text-xs p-2.5 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            {/* Recruiter Notes & Assessment */}
            <div className="bg-canvas border border-hairline rounded-2xl p-5 shadow-level1 space-y-3">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider pb-2 border-b border-hairline flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <span>Internal Recruiter Notes</span>
              </h3>

              <textarea
                rows={5}
                value={recruiterNotes}
                onChange={(e) => setRecruiterNotes(e.target.value)}
                placeholder="Key strengths, interview feedback, communication proficiency, salary flexibility, remarks..."
                className="w-full text-xs p-3 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary resize-y"
              />
            </div>

            {/* Candidate Audit Trail */}
            <div className="bg-canvas border border-hairline rounded-2xl p-5 shadow-level1 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-hairline">
                <History className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Candidate Activity History
                </h3>
              </div>

              {candidateLogs.length === 0 ? (
                <p className="text-xs text-ink-mute italic py-2">
                  No previous activity recorded for this candidate.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {candidateLogs.map((log) => {
                    const time = new Date(log.timestamp).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const date = new Date(log.timestamp).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    });

                    return (
                      <div
                        key={log.id}
                        className="text-[11px] p-2.5 rounded-xl bg-canvas-soft border border-hairline space-y-1"
                      >
                        <div className="flex items-center justify-between text-ink-mute">
                          <span className="font-semibold text-ink">{log.action}</span>
                          <span>{date}, {time}</span>
                        </div>
                        <p className="text-ink-secondary">{log.details}</p>
                        <span className="text-[10px] text-ink-mute block">
                          By: {log.recruiterName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Security PIN Verification Modal */}
      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          setIsPinModalOpen(false);
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
        actionTitle={pinActionTitle}
        actionDescription={pinActionDescription}
        expectedPin={settings.securityPin || "1234"}
      />
    </div>
  );
}
