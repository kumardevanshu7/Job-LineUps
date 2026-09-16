"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Phone,
  MessageCircle,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trash2,
  Save,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { CandidateItem } from "@/lib/types";
import { formatIndianDateTime } from "@/lib/date-utils";
import CandidateStatusDropdown, { STATUS_META_MAP } from "./CandidateStatusDropdown";

interface CandidateDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateItem | null;
  onSave: (updatedCandidate: CandidateItem) => Promise<void>;
  onRequestStatusChange: (candidateId: string, newStatus: string) => void;
  onRequestDelete: (candidateId: string, candidateName: string) => void;
}

const RESCHEDULE_REASONS = [
  "Candidate requested alternate slot due to current job shift",
  "Interviewer panel was unavailable / meeting clashed",
  "Candidate unwell / family emergency",
  "Client requested date shift",
  "Network / connectivity issue during interview",
  "Candidate requested 24h preparation buffer",
];

const REJECTION_REASONS = [
  "Notice period is too long for urgent requirement",
  "Expected salary exceeds client budget threshold",
  "Technical evaluation / round 1 assessment not cleared",
  "Communication or conversational fluency did not meet standard",
  "Candidate did not attend scheduled interview (No Show)",
  "Client selected alternative candidate with more domain experience",
  "Candidate declined offer / accepted counter offer",
];

export default function CandidateDossierModal({
  isOpen,
  onClose,
  candidate,
  onSave,
  onRequestStatusChange,
  onRequestDelete,
}: CandidateDossierModalProps) {
  const [interviewDateTime, setInterviewDateTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [currentCtc, setCurrentCtc] = useState("");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (candidate) {
      if (candidate.interviewDate) {
        const d = new Date(candidate.interviewDate);
        if (!isNaN(d.getTime())) {
          // Format as YYYY-MM-DDThh:mm for datetime-local
          const tzOffset = d.getTimezoneOffset() * 60000;
          const localIso = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
          setInterviewDateTime(localIso);
        } else {
          setInterviewDateTime("");
        }
      } else {
        setInterviewDateTime("");
      }
      setRescheduleReason(candidate.rescheduleReason || "");
      setRejectionReason(candidate.rejectionReason || "");
      setRecruiterNotes(candidate.recruiterNotes || "");
      setCurrentCtc(candidate.currentCtc || "");
      setExpectedCtc(candidate.expectedCtc || "");
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const statusMeta = STATUS_META_MAP[candidate.status] || STATUS_META_MAP["New Applied"];
  const { dateStr, timeStr } = formatIndianDateTime(candidate.interviewDate);

  const handleQuickPreset = (offsetHours: number) => {
    const target = new Date(Date.now() + offsetHours * 3600000);
    const tzOffset = target.getTimezoneOffset() * 60000;
    const localIso = new Date(target.getTime() - tzOffset).toISOString().slice(0, 16);
    setInterviewDateTime(localIso);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const isRescheduled =
        candidate.interviewDate &&
        interviewDateTime &&
        new Date(candidate.interviewDate).toISOString() !==
          new Date(interviewDateTime).toISOString();

      const updated: CandidateItem = {
        ...candidate,
        interviewDate: interviewDateTime ? new Date(interviewDateTime).toISOString() : null,
        rescheduleCount: isRescheduled
          ? (candidate.rescheduleCount || 0) + 1
          : candidate.rescheduleCount || 0,
        rescheduleReason: rescheduleReason.trim() || null,
        rejectionReason: rejectionReason.trim() || null,
        recruiterNotes: recruiterNotes.trim() || null,
        currentCtc: currentCtc.trim() || null,
        expectedCtc: expectedCtc.trim() || null,
        updatedAt: new Date().toISOString(),
      };

      await onSave(updated);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-canvas w-full max-w-2xl rounded-2xl border border-hairline shadow-level3 max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-hairline bg-canvas-soft flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0 border border-primary/20">
              {candidate.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-semibold text-ink truncate">
                  {candidate.fullName}
                </h2>
                <span className="text-[11px] font-mono text-ink-mute bg-canvas px-1.5 py-0.5 rounded border border-hairline shrink-0">
                  {candidate.id}
                </span>
              </div>
              <p className="text-xs text-primary font-medium truncate">
                {candidate.appliedRole}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <CandidateStatusDropdown
              currentStatus={candidate.status}
              onSelectStatus={(newSt) => onRequestStatusChange(candidate.id, newSt)}
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-mute hover:text-ink hover:bg-canvas transition-colors"
              title="Close Dossier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Dossier Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Quick Contact & Credentials Pill Bar */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`tel:${candidate.phone}`}
              className="py-2.5 px-3 rounded-xl bg-canvas-soft hover:bg-emerald-50 text-ink hover:text-emerald-700 border border-hairline hover:border-emerald-200 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-2xs active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{candidate.phone}</span>
            </a>

            <a
              href={`https://wa.me/91${candidate.phone}?text=Hello%20${encodeURIComponent(
                candidate.fullName
              )},%20this%20is%20from%20TalentFlow%20Recruitment%20regarding%20your%20application.`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-2xs active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>WhatsApp</span>
            </a>

            <a
              href={candidate.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-canvas-soft hover:bg-primary/5 text-primary border border-hairline hover:border-primary/30 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-2xs active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Resume Link</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

          {/* Core Profile Highlights Grid */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-canvas-soft/80 border border-hairline text-xs space-y-3">
            <div className="font-semibold text-ink uppercase tracking-wider text-[10px] text-ink-mute">
              Candidate Dossier Overview
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-ink-mute block text-[11px]">Location</span>
                <span className="font-medium text-ink flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-primary shrink-0" />
                  <span className="truncate">{candidate.location}</span>
                </span>
              </div>
              <div>
                <span className="text-ink-mute block text-[11px]">Experience</span>
                <span className="font-medium text-ink tabular-nums mt-0.5 block">
                  {candidate.experienceYears} Years
                </span>
              </div>
              <div>
                <span className="text-ink-mute block text-[11px]">Notice Period</span>
                <span className="font-medium text-ink tabular-nums mt-0.5 block">
                  {candidate.noticePeriodDays === 0
                    ? "Immediate Joiner"
                    : `${candidate.noticePeriodDays} Days`}
                </span>
              </div>
              <div>
                <span className="text-ink-mute block text-[11px]">Email</span>
                <span className="font-medium text-ink truncate mt-0.5 block" title={candidate.email}>
                  {candidate.email}
                </span>
              </div>
            </div>

            {/* Editable CTCs */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-hairline">
              <div>
                <label className="text-[11px] text-ink-mute block mb-1">Current CTC</label>
                <input
                  type="text"
                  value={currentCtc}
                  onChange={(e) => setCurrentCtc(e.target.value)}
                  placeholder="e.g. ₹5,50,000"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-ink-mute block mb-1">Expected CTC</label>
                <input
                  type="text"
                  value={expectedCtc}
                  onChange={(e) => setExpectedCtc(e.target.value)}
                  placeholder="e.g. ₹7,20,000"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Interview Schedule & Reschedule Engine */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.02] space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Calendar className="w-4 h-4" />
                <span>Interview Schedule &amp; Rescheduling</span>
              </div>

              {candidate.rescheduleCount && candidate.rescheduleCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Rescheduled {candidate.rescheduleCount} time(s)</span>
                </span>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-ink block">
                Scheduled Interview Date &amp; Time:
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="datetime-local"
                  value={interviewDateTime}
                  onChange={(e) => setInterviewDateTime(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset(2)}
                    className="text-[10px] px-2 py-1.5 rounded-md border border-hairline bg-canvas hover:bg-canvas-soft text-ink-secondary"
                  >
                    +2h Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset(24)}
                    className="text-[10px] px-2 py-1.5 rounded-md border border-hairline bg-canvas hover:bg-canvas-soft text-ink-secondary"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterviewDateTime("")}
                    className="text-[10px] px-2 py-1.5 rounded-md border border-hairline text-rose-600 hover:bg-rose-50"
                  >
                    Clear Slot
                  </button>
                </div>
              </div>
            </div>

            {/* Reschedule Reason Input */}
            <div className="space-y-1.5 pt-2 border-t border-hairline">
              <label className="text-[11px] font-medium text-ink flex items-center justify-between">
                <span>Reason for Rescheduling (if slot changed):</span>
                <span className="text-[10px] text-ink-mute font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="e.g. Candidate requested evening slot due to current office shift"
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {RESCHEDULE_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRescheduleReason(r)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-canvas border border-hairline text-ink-mute hover:text-primary hover:border-primary/40 transition-colors truncate max-w-xs"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Rejection / Non-Selection Reason (Why not selected) */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Non-Selection Reason &amp; Feedback Dossier</span>
              </div>
              <span className="text-[10px] text-rose-600 font-medium">
                Explains why candidate was not selected
              </span>
            </div>

            <p className="text-[11px] text-ink-mute leading-relaxed">
              If this candidate was not selected during screening or interview, document the exact reason here for client audits and managerial reviews.
            </p>

            <textarea
              rows={2}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Technical round evaluation failed on data verification; notice period of 60 days exceeds client's 15-day SLA requirement."
              className="w-full text-xs p-2.5 rounded-lg border border-rose-200 bg-canvas text-ink focus:outline-none focus:border-rose-400"
            />

            {/* Quick reason tag pills */}
            <div className="flex flex-wrap gap-1.5">
              {REJECTION_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectionReason(reason)}
                  className="text-[10px] px-2 py-1 rounded-full bg-white border border-rose-200 text-rose-800 hover:bg-rose-100/60 transition-colors text-left"
                >
                  + {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: General Recruiter Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink">
              Internal Recruiter Notes &amp; Highlights:
            </label>
            <textarea
              rows={2}
              value={recruiterNotes}
              onChange={(e) => setRecruiterNotes(e.target.value)}
              placeholder="Add key strengths, client panel feedback, communication ratings..."
              className="w-full text-xs p-2.5 rounded-lg border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
            />
          </div>

          {/* Danger Zone: Delete Candidate */}
          <div className="p-3 rounded-xl bg-rose-50/30 border border-rose-100 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-semibold text-rose-700 block">
                Delete Candidate Record
              </span>
              <span className="text-[11px] text-ink-mute">
                Protected by Security PIN verification.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRequestDelete(candidate.id, candidate.fullName)}
              className="btn-secondary-pill text-xs py-1.5 px-3 text-rose-600 hover:bg-rose-50 border-rose-200 inline-flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Record</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-hairline bg-canvas-soft flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary-pill text-xs py-2 px-4"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="btn-primary-pill text-xs py-2 px-5 inline-flex items-center gap-1.5 shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Dossier...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Dossier Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
