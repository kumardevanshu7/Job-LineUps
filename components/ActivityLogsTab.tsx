"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  Activity,
  Search,
  Filter,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserPlus,
  Trash2,
  Calendar,
} from "lucide-react";
import { ActivityLogItem } from "@/lib/types";

interface ActivityLogsTabProps {
  logs: ActivityLogItem[];
  onExportLogs?: () => void;
  onClearLogs?: () => void;
}

const GLOW_COLOR_STYLES: Record<
  string,
  { dot: string; glow: string; badge: string }
> = {
  emerald: {
    dot: "bg-emerald-500",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.85)]",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  blue: {
    dot: "bg-blue-500",
    glow: "shadow-[0_0_12px_rgba(37,99,235,0.85)]",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  purple: {
    dot: "bg-purple-500",
    glow: "shadow-[0_0_12px_rgba(147,51,234,0.85)]",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
  indigo: {
    dot: "bg-[#533afd]",
    glow: "shadow-[0_0_12px_rgba(83,58,253,0.85)]",
    badge: "bg-primary-subdued/70 text-primary-deep border-primary-subdued",
  },
  cyan: {
    dot: "bg-cyan-500",
    glow: "shadow-[0_0_12px_rgba(8,145,178,0.85)]",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  rose: {
    dot: "bg-rose-500",
    glow: "shadow-[0_0_12px_rgba(244,63,94,0.85)]",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
  amber: {
    dot: "bg-amber-500",
    glow: "shadow-[0_0_12px_rgba(217,119,6,0.85)]",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
};

export default function ActivityLogsTab({ logs, onExportLogs, onClearLogs }: ActivityLogsTabProps) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      if (actionFilter !== "ALL" && item.action !== actionFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = item.candidateName?.toLowerCase().includes(q);
        const matchDetails = item.details.toLowerCase().includes(q);
        const matchId = item.candidateId?.toLowerCase().includes(q);
        return matchName || matchDetails || matchId;
      }
      return true;
    });
  }, [logs, search, actionFilter]);

  const handleExportJson = () => {
    if (onExportLogs) {
      onExportLogs();
      return;
    }
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `TalentFlow_Logs_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "STATUS_CHANGE":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "RESCHEDULE":
        return <RotateCcw className="w-3.5 h-3.5" />;
      case "CANDIDATE_ADDED":
        return <UserPlus className="w-3.5 h-3.5" />;
      case "CANDIDATE_DELETED":
        return <Trash2 className="w-3.5 h-3.5" />;
      case "REJECTION_REASON_SAVED":
        return <AlertCircle className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Real-Time Audit Trail</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-ink">
            Recruiter Activity &amp; Candidate Change Logs
          </h2>
          <p className="text-xs sm:text-sm text-ink-mute mt-0.5 font-light">
            Every candidate stage update, interview rescheduling, and feedback entry recorded with glowing timeline points.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onClearLogs && logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-xs py-2 px-3 rounded-pill border border-hairline text-ink-mute hover:text-rose-600 hover:border-rose-300 transition-colors"
            >
              Clear Logs
            </button>
          )}
          <button
            onClick={handleExportJson}
            className="btn-secondary-pill text-xs py-2 px-3.5 inline-flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export Logs (.json)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-canvas border border-hairline rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity by candidate name, role, or action details..."
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
          />
        </div>

        {/* Action filter pill select */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "ALL", label: "All Activity" },
            { id: "STATUS_CHANGE", label: "Stages" },
            { id: "RESCHEDULE", label: "Rescheduled" },
            { id: "CANDIDATE_ADDED", label: "New Added" },
            { id: "CANDIDATE_DELETED", label: "Deleted" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActionFilter(tab.id)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all shrink-0 font-medium ${
                actionFilter === tab.id
                  ? "bg-brand-dark text-white border-brand-dark shadow-xs"
                  : "bg-canvas border-hairline text-ink-secondary hover:bg-canvas-soft"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Glowing Timeline Container */}
      <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-ink-mute">
            <Clock className="w-10 h-10 mx-auto text-primary/40 mb-3" />
            <p className="text-sm font-semibold text-ink">No activity records logged yet</p>
            <p className="text-xs text-ink-mute mt-1">
              Changes to candidate line-ups, interview reschedules, and status transitions will automatically stream here.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-hairline">
            {filteredLogs.map((log) => {
              const glowStyle =
                GLOW_COLOR_STYLES[log.glowColor] || GLOW_COLOR_STYLES.indigo;

              const dateObj = new Date(log.timestamp);
              const formattedTime = isNaN(dateObj.getTime())
                ? log.timestamp
                : dateObj.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
              const formattedDate = isNaN(dateObj.getTime())
                ? ""
                : dateObj.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

              return (
                <div key={log.id} className="relative group">
                  {/* Glowing Timeline Point (Pulse Indicator) */}
                  <div
                    className={`absolute -left-[30px] sm:-left-[38px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-1 ring-hairline flex items-center justify-center transition-transform group-hover:scale-125 ${
                      glowStyle.dot
                    } ${glowStyle.glow}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80 animate-ping" />
                  </div>

                  {/* Log Entry Card */}
                  <div className="bg-canvas-soft/70 hover:bg-canvas border border-hairline hover:border-primary/30 rounded-xl p-3.5 sm:p-4 transition-all shadow-2xs hover:shadow-level1 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            glowStyle.badge
                          }`}
                        >
                          {getActionIcon(log.action)}
                          <span>{log.action.replace(/_/g, " ")}</span>
                        </span>

                        {log.candidateName && (
                          <span className="text-xs font-semibold text-ink">
                            {log.candidateName}
                            {log.candidateId && (
                              <span className="text-[10px] text-ink-mute font-mono ml-1">
                                ({log.candidateId})
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="text-[11px] text-ink-mute tabular-nums flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-primary/70" />
                        <span>
                          {formattedDate} • {formattedTime}
                        </span>
                      </div>
                    </div>

                    {/* Details Message */}
                    <p className="text-xs text-ink-secondary leading-relaxed font-normal">
                      {log.details}
                    </p>

                    {log.recruiterName && (
                      <div className="text-[10px] text-ink-mute pt-1 border-t border-hairline flex items-center justify-between">
                        <span>Action performed by: <strong className="text-ink font-medium">{log.recruiterName}</strong></span>
                        <span className="text-[9px] font-mono opacity-60">ID: {log.id.slice(0, 8)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
