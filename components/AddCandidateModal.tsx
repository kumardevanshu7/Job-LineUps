"use client";

import React, { useState } from "react";
import {
  X,
  UserPlus,
  Calendar,
  Clock,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Loader2,
  Check,
  Workflow,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { CandidateItem, WebhookWorkspace, WEBHOOK_WORKSPACE_COLORS } from "@/lib/types";
import { calculateSalaryBreakdown } from "@/lib/salary-utils";
import { User } from "firebase/auth";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCandidateAdded: (newCandidate: CandidateItem) => void;
  currentUser?: User | null;
  webhookWorkspaces?: WebhookWorkspace[];
}

const PRESET_ROLES = [
  "Documentation Specialist",
  "Operations Executive",
  "HR Trainee",
  "Customer Support Associate",
  "Accounts & Billing Executive",
  "Compliance Officer",
];

export default function AddCandidateModal({
  isOpen,
  onClose,
  onCandidateAdded,
  currentUser,
  webhookWorkspaces = [],
}: AddCandidateModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("Sector 59, Noida");
  const [appliedRole, setAppliedRole] = useState(PRESET_ROLES[0]);
  const [customRole, setCustomRole] = useState("");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [experienceYears, setExperienceYears] = useState("2.0");
  const [noticePeriodDays, setNoticePeriodDays] = useState("15");
  const [currentCtc, setCurrentCtc] = useState("");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [status, setStatus] = useState("Line-Up Scheduled");
  const [interviewDateTime, setInterviewDateTime] = useState("");
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>("AUTO");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Please enter the candidate's full legal name.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    const finalRole = isCustomRole
      ? customRole.trim() || "Operations Executive"
      : appliedRole;

    setLoading(true);

    try {
      // Determine target webhook URL based on recruiter selection
      let resolvedWebhookUrl: string | undefined = undefined;
      if (targetWorkspaceId === "SKIP") {
        resolvedWebhookUrl = "SKIP";
      } else if (targetWorkspaceId !== "AUTO") {
        const chosen = (webhookWorkspaces || []).find((w) => w.id === targetWorkspaceId);
        if (chosen?.webhookUrl) {
          resolvedWebhookUrl = chosen.webhookUrl;
        } else {
          resolvedWebhookUrl = "SKIP";
        }
      }

      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: email.trim(),
          location: location.trim(),
          appliedRole: finalRole,
          experienceYears: parseFloat(experienceYears) || 0,
          noticePeriodDays: parseInt(noticePeriodDays) || 0,
          currentCtc: currentCtc.trim() || null,
          expectedCtc: expectedCtc.trim() || null,
          resumeUrl: resumeUrl.trim() || "https://drive.google.com",
          webhookUrl: resolvedWebhookUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create candidate");
      }

      const candidateId = data.candidate?.id;

      // Update with scheduled interview date and notes if provided
      let finalCandidate: CandidateItem = {
        id: candidateId,
        recruiterId: currentUser?.uid || "unassigned",
        fullName: fullName.trim(),
        phone: cleanPhone,
        email: email.trim(),
        location: location.trim(),
        appliedRole: finalRole,
        experienceYears: parseFloat(experienceYears) || 0,
        noticePeriodDays: parseInt(noticePeriodDays) || 0,
        currentCtc: currentCtc.trim() || null,
        expectedCtc: expectedCtc.trim() || null,
        resumeUrl: resumeUrl.trim() || "https://drive.google.com",
        status,
        interviewDate: interviewDateTime ? new Date(interviewDateTime).toISOString() : null,
        recruiterNotes: recruiterNotes.trim() || null,
        createdAt: new Date().toISOString(),
      };

      if (interviewDateTime || recruiterNotes || status !== "New Applied") {
        const patchRes = await fetch(`/api/candidates/${candidateId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            interviewDate: interviewDateTime ? new Date(interviewDateTime).toISOString() : null,
            recruiterNotes: recruiterNotes.trim() || null,
          }),
        });
        const patchData = await patchRes.json();
        if (patchData.success && patchData.candidate) {
          finalCandidate = patchData.candidate;
        }
      }

      if (targetWorkspaceId === "SKIP") {
        toast.success(`Candidate ${fullName} added! (Google Sheets sync skipped)`);
      } else if (targetWorkspaceId !== "AUTO") {
        const chosen = (webhookWorkspaces || []).find((w) => w.id === targetWorkspaceId);
        toast.success(`Candidate ${fullName} added & dispatched to "${chosen?.name || "Selected Sheet"}"!`);
      } else {
        toast.success(`Candidate ${fullName} added to Line-Up & Calendar!`);
      }
      onCandidateAdded(finalCandidate);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating candidate";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentFinalRole = isCustomRole
    ? customRole.trim() || "Operations Executive"
    : appliedRole;

  const activeMatchingWorkspaces = (webhookWorkspaces || []).filter(
    (ws) =>
      ws.active &&
      (!ws.targetRole || ws.targetRole === "ALL" || ws.targetRole.toLowerCase() === currentFinalRole.toLowerCase())
  );

  const selectedWorkspace = (webhookWorkspaces || []).find(
    (ws) => ws.id === targetWorkspaceId
  );
  const selectedWorkspaceColor = selectedWorkspace
    ? WEBHOOK_WORKSPACE_COLORS.find((c) => c.id === selectedWorkspace.colorId)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-canvas rounded-t-2xl sm:rounded-xl border border-hairline shadow-level3 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-canvas-soft border-b border-hairline px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-ink">
                Create Candidate Line-Up Entry
              </h2>
              <p className="text-[11px] sm:text-xs text-ink-mute">
                Schedule candidate for interview &amp; add to daily manager roster
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-mute hover:text-ink hover:bg-hairline transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Form Body (Scrollable) */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

          {/* Section 1: Candidate Contact Info */}
          <div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-2">
              1. Candidate Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Mobile Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9811223344"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Current City / Hub Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 59, Noida"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Role, Experience & Notice */}
          <div className="pt-2 border-t border-hairline">
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-2">
              2. Role &amp; Experience
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-ink-secondary">
                    Role / Position Lined Up *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomRole(!isCustomRole)}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    {isCustomRole ? "Pick Preset Role" : "+ Custom Role"}
                  </button>
                </div>

                {isCustomRole ? (
                  <input
                    type="text"
                    placeholder="Enter custom role title..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  />
                ) : (
                  <select
                    value={appliedRole}
                    onChange={(e) => setAppliedRole(e.target.value)}
                    className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  >
                    {PRESET_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Total Exp (Years) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="40"
                  required
                  placeholder="e.g. 2.5"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Notice Period (Days) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  required
                  placeholder="e.g. 15 (0 for immediate)"
                  value={noticePeriodDays}
                  onChange={(e) => setNoticePeriodDays(e.target.value)}
                  className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Pipeline Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                >
                  <option value="Line-Up Scheduled">Line-Up Scheduled</option>
                  <option value="Screening Shortlisted">Screening Shortlisted</option>
                  <option value="New Applied">New Applied</option>
                  <option value="Interview Done">Interview Done</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Compensation & Resume */}
          <div className="pt-2 border-t border-hairline">
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-2">
              3. CTC &amp; Resume URL
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-ink-secondary">
                    Current CTC
                  </label>
                  {calculateSalaryBreakdown(currentCtc) && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      ≈ {calculateSalaryBreakdown(currentCtc)?.monthlyFormatted}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. 2,00,000 or 5 LPA"
                  value={currentCtc}
                  onChange={(e) => setCurrentCtc(e.target.value)}
                  className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                />
                {calculateSalaryBreakdown(currentCtc) && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    Monthly: <span className="font-semibold">{calculateSalaryBreakdown(currentCtc)?.monthlyFormatted}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-ink-secondary">
                    Expected CTC
                  </label>
                  {calculateSalaryBreakdown(expectedCtc) && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      ≈ {calculateSalaryBreakdown(expectedCtc)?.monthlyFormatted}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. 7,00,000 or 7 LPA"
                  value={expectedCtc}
                  onChange={(e) => setExpectedCtc(e.target.value)}
                  className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                />
                {calculateSalaryBreakdown(expectedCtc) && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    Monthly: <span className="font-semibold">{calculateSalaryBreakdown(expectedCtc)?.monthlyFormatted}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Resume Cloud Link
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Target Google Sheet Webhook Workspace */}
          <div className="pt-2 border-t border-hairline">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-indigo-500" />
                <span>4. Target Google Sheet Webhook</span>
              </span>
              {selectedWorkspace && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white shadow-2xs flex items-center gap-1"
                  style={{ backgroundColor: selectedWorkspaceColor?.hex || "#6366f1" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{selectedWorkspace.name}</span>
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-ink-secondary">
                Select Which Google Sheet / Webhook to Sync:
              </label>

              <select
                value={targetWorkspaceId}
                onChange={(e) => setTargetWorkspaceId(e.target.value)}
                className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink font-medium"
              >
                <option value="AUTO">
                  ⚡ Auto-Route by Role ({activeMatchingWorkspaces.length} active matching {activeMatchingWorkspaces.length === 1 ? "sheet" : "sheets"})
                </option>
                {webhookWorkspaces && webhookWorkspaces.length > 0 && (
                  <optgroup label="Direct Webhook Workspaces">
                    {webhookWorkspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.active ? "🟢" : "⚪"} {ws.name} — ({ws.targetRole === "ALL" ? "All Roles" : ws.targetRole}) {!ws.webhookUrl ? "⚠️ [No URL set]" : ""}
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value="SKIP">🚫 Do Not Sync to Google Sheets (TalentFlow Only)</option>
              </select>

              {/* Dynamic feedback card */}
              {targetWorkspaceId === "AUTO" ? (
                <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-[11px] text-indigo-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-indigo-900">
                      Auto-Routing to all active sheets configured for &quot;{currentFinalRole}&quot;:
                    </p>
                    <p className="text-indigo-800">
                      {activeMatchingWorkspaces.length > 0 ? (
                        <span>
                          Candidate will be dispatched to:{" "}
                          <strong>
                            {activeMatchingWorkspaces.map((w) => w.name).join(", ")}
                          </strong>
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          No active workspace currently targets &quot;{currentFinalRole}&quot;. Candidate will be safely saved in TalentFlow line-up.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ) : targetWorkspaceId === "SKIP" ? (
                <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-950 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Candidate will be saved in TalentFlow database only. No Google Sheets webhook ping will be fired.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-canvas-soft border border-hairline text-[11px] text-ink flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: selectedWorkspaceColor?.hex || "#6366f1" }}
                    />
                    <span>
                      Target Sheet: <strong>{selectedWorkspace?.name}</strong> ({selectedWorkspace?.targetRole === "ALL" ? "All Roles" : selectedWorkspace?.targetRole})
                    </span>
                  </div>
                  {selectedWorkspace?.webhookUrl ? (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Connected ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ⚠️ No URL Configured
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Interview Date & Time on Calendar */}
          <div className="pt-2 border-t border-hairline bg-primary/5 p-3 rounded-lg border border-primary/20">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
              <Calendar className="w-4 h-4" />
              <span>Schedule Interview on Calendar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Interview Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={interviewDateTime}
                  onChange={(e) => setInterviewDateTime(e.target.value)}
                  className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Recruiter Screening Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spoke to candidate, good comms, slot booked"
                  value={recruiterNotes}
                  onChange={(e) => setRecruiterNotes(e.target.value)}
                  className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Buttons */}
        <div className="shrink-0 bg-canvas-soft border-t border-hairline px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-end gap-2.5 safe-bottom">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm text-ink-mute hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-pill text-xs sm:text-sm px-5 sm:px-6 py-2.5 inline-flex items-center gap-2 shadow-sm disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding to Line-Up...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm &amp; Add to Calendar</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}
