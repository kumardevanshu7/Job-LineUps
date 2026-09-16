"use client";

import React from "react";
import {
  X,
  History,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Clock,
  Briefcase,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { ActivityLogItem } from "@/lib/types";
import { formatIndianDateTime } from "@/lib/date-utils";

interface LogComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  logItem: ActivityLogItem | null;
}

export default function LogComparisonModal({
  isOpen,
  onClose,
  logItem,
}: LogComparisonModalProps) {
  if (!isOpen || !logItem) return null;

  const previousVal = logItem.previousValue || "Not Recorded / Initial Entry";
  const newVal = logItem.newValue || "Updated";
  const fieldLabel =
    logItem.fieldChanged ||
    (logItem.action === "STATUS_CHANGE"
      ? "Pipeline Stage Status"
      : logItem.action === "RESCHEDULE"
      ? "Interview Schedule Slot"
      : logItem.action === "NOTES_UPDATED"
      ? "Recruiter Notes & Feedback"
      : logItem.action === "REJECTION_REASON_SAVED"
      ? "Non-Selection Reason"
      : "Candidate Record Data");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-canvas rounded-2xl border border-hairline shadow-level3 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline bg-canvas-soft">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-subdued/80 border border-primary/20 flex items-center justify-center text-primary">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink leading-tight flex items-center gap-2">
                <span>Audit State Comparison Card</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {logItem.action}
                </span>
              </h2>
              <p className="text-xs text-ink-mute">
                Detailed Before vs. After state snapshot of candidate record
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-mute hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-ink">
          {/* Candidate Context */}
          <div className="p-3.5 rounded-xl bg-canvas-soft border border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs">
                {logItem.candidateName ? logItem.candidateName.charAt(0) : "C"}
              </div>
              <div>
                <span className="text-xs font-bold text-ink block">
                  {logItem.candidateName || "Candidate"}
                </span>
                {logItem.candidateId && (
                  <span className="text-[10px] font-mono text-ink-mute block">
                    ID: {logItem.candidateId}
                  </span>
                )}
              </div>
            </div>

            <div className="text-[11px] text-ink-mute flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>
                {formatIndianDateTime(logItem.timestamp).dateStr} • {formatIndianDateTime(logItem.timestamp).timeStr}
              </span>
            </div>
          </div>

          {/* Editor Info Badge (Who edited: Name + Email) */}
          <div className="p-3 rounded-xl border border-primary/20 bg-primary-subdued/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary shrink-0" />
              <div className="text-xs">
                <span className="text-ink-mute">Edited by: </span>
                <strong className="text-ink font-semibold">
                  {logItem.recruiterName || "Recruiter"}
                </strong>
              </div>
            </div>

            {logItem.recruiterEmail && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <Mail className="w-3.5 h-3.5" />
                <span>{logItem.recruiterEmail}</span>
              </div>
            )}
          </div>

          {/* Field Modified Banner */}
          <div className="flex items-center gap-2 text-xs font-semibold text-ink uppercase tracking-wider px-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Modified Attribute: {fieldLabel}</span>
          </div>

          {/* SIDE-BY-SIDE STATE COMPARISON */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* BEFORE / PREVIOUS VALUE */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  Previous State (Before)
                </span>
                <span className="text-xs font-semibold text-rose-500">Old</span>
              </div>

              <div className="py-2">
                <p className="text-xs font-medium text-rose-900 break-words leading-relaxed">
                  {previousVal}
                </p>
              </div>

              <span className="text-[10px] text-rose-600">
                State prior to this user edit
              </span>
            </div>

            {/* AFTER / NEW VALUE */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Updated State (After)
                </span>
                <span className="text-xs font-semibold text-emerald-600">New</span>
              </div>

              <div className="py-2">
                <p className="text-xs font-bold text-emerald-950 break-words leading-relaxed">
                  {newVal}
                </p>
              </div>

              <span className="text-[10px] text-emerald-700">
                Live value updated in Cloud Firestore
              </span>
            </div>
          </div>

          {/* Details Explanation */}
          <div className="p-3 rounded-xl border border-hairline bg-canvas-soft text-xs space-y-1">
            <span className="font-semibold text-ink-secondary block">
              Audit Record Description:
            </span>
            <p className="text-ink leading-relaxed">{logItem.details}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-canvas-soft border-t border-hairline px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Firestore Audit Trail</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary-pill text-xs py-1.5 px-4"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
