"use client";

import React, { useState } from "react";
import {
  X,
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle,
  Filter,
  Check,
} from "lucide-react";
import { CandidateItem } from "@/lib/types";
import { isToday, isTomorrow, isThisWeek } from "@/lib/date-utils";

interface ManagerExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateItem[];
}

export default function ManagerExportModal({
  isOpen,
  onClose,
  candidates,
}: ManagerExportModalProps) {
  const [filterType, setFilterType] = useState<
    "TODAY" | "TOMORROW" | "THIS_WEEK" | "ALL" | "SELECTED"
  >("TODAY");
  const [roleFilter, setRoleFilter] = useState("ALL");

  if (!isOpen) return null;

  // Filter candidates based on selection
  const filteredCandidates = candidates.filter((c) => {
    // Role check
    if (roleFilter !== "ALL" && c.appliedRole !== roleFilter) {
      return false;
    }

    // Date check
    if (filterType === "TODAY") {
      return c.interviewDate && isToday(c.interviewDate);
    }
    if (filterType === "TOMORROW") {
      return c.interviewDate && isTomorrow(c.interviewDate);
    }
    if (filterType === "THIS_WEEK") {
      return c.interviewDate && isThisWeek(c.interviewDate);
    }
    if (filterType === "SELECTED") {
      return c.status === "Selected";
    }
    return true;
  });

  const handleDownload = () => {
    const params = new URLSearchParams();
    if (roleFilter !== "ALL") params.append("role", roleFilter);

    // If today/tomorrow, we can let the backend filter or download directly
    const downloadUrl = `/api/export-lineup?${params.toString()}`;
    window.location.href = downloadUrl;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-canvas rounded-t-2xl sm:rounded-xl border border-hairline shadow-level3 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-canvas-soft border-b border-hairline px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-ink">
                Export Line-Up for Manager
              </h3>
              <p className="text-[11px] sm:text-xs text-ink-mute">
                Generate clean, formatted Excel sheet (.xlsx) for leadership review
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

        {/* Content (Scrollable) */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-ink-secondary mb-2">
              Select Line-Up Date Scope:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFilterType("TODAY")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  filterType === "TODAY"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-hairline hover:bg-canvas-soft"
                }`}
              >
                <div className="font-semibold text-xs text-ink">
                  Today&apos;s Line-Up
                </div>
                <div className="text-[11px] text-ink-mute">
                  Candidates scheduled today
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFilterType("TOMORROW")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  filterType === "TOMORROW"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-hairline hover:bg-canvas-soft"
                }`}
              >
                <div className="font-semibold text-xs text-ink">
                  Tomorrow&apos;s Line-Up
                </div>
                <div className="text-[11px] text-ink-mute">
                  Next day roster
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFilterType("THIS_WEEK")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  filterType === "THIS_WEEK"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-hairline hover:bg-canvas-soft"
                }`}
              >
                <div className="font-semibold text-xs text-ink">
                  This Week&apos;s Pipeline
                </div>
                <div className="text-[11px] text-ink-mute">
                  Current 7-day schedule
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  filterType === "ALL"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-hairline hover:bg-canvas-soft"
                }`}
              >
                <div className="font-semibold text-xs text-ink">
                  All Active Line-Ups
                </div>
                <div className="text-[11px] text-ink-mute">
                  Full master database
                </div>
              </button>
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-xs font-semibold text-ink-secondary mb-1">
              Filter by Role:
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full text-base sm:text-xs px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
            >
              <option value="ALL">All Roles</option>
              <option value="Documentation Specialist">Documentation Specialist</option>
              <option value="Operations Executive">Operations Executive</option>
              <option value="HR Trainee">HR Trainee</option>
            </select>
          </div>

          {/* Export Preview Summary Card */}
          <div className="p-3.5 rounded-lg bg-canvas-soft border border-hairline space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-ink-secondary">
              <span>Candidates to be exported:</span>
              <span className="font-bold text-ink tabular-nums text-sm">
                {filteredCandidates.length} Candidates
              </span>
            </div>
            <div className="flex items-center justify-between text-ink-mute text-[11px]">
              <span>File format:</span>
              <span className="font-mono text-emerald-700 font-semibold">.xlsx (Excel)</span>
            </div>
            <div className="flex items-center justify-between text-ink-mute text-[11px]">
              <span>Columns included:</span>
              <span>Time slot, Name, Phone, Exp, Notice, CTC, Resume, Notes</span>
            </div>
          </div>
        </div>

        {/* Sticky Modal Footer */}
        <div className="shrink-0 bg-canvas-soft border-t border-hairline px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-end gap-2.5 safe-bottom">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm text-ink-mute hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="btn-primary-pill text-xs sm:text-sm px-5 py-2.5 inline-flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel File</span>
          </button>
        </div>
      </div>
    </div>
  );
}
