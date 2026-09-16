"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  Filter,
  Search,
  RefreshCw,
  FileSpreadsheet,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Calendar,
  Sparkles,
  Lock,
  LogOut,
  Settings,
  ChevronDown,
  Clock,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { CandidateItem, CandidateStats, CandidateStatus } from "@/lib/types";
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from "@/lib/webhook";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon?: React.ReactNode }
> = {
  "New Applied": {
    label: "New Applied",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "Screening Shortlisted": {
    label: "Screening Shortlisted",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  "Line-Up Scheduled": {
    label: "Line-Up Scheduled",
    bg: "bg-primary-subdued/70",
    text: "text-primary-deep",
    border: "border-primary-subdued",
  },
  "Interview Done": {
    label: "Interview Done",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  Selected: {
    label: "Selected",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  Rejected: {
    label: "Rejected",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

const STATUS_LIST: CandidateStatus[] = [
  "New Applied",
  "Screening Shortlisted",
  "Line-Up Scheduled",
  "Interview Done",
  "Selected",
  "Rejected",
];

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [passkeyInput, setPasskeyInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  // Data State
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
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Candidate Details / Notes / Schedule Drawer
  const [activeCandidate, setActiveCandidate] = useState<CandidateItem | null>(null);
  const [editNotes, setEditNotes] = useState<string>("");
  const [editInterviewDate, setEditInterviewDate] = useState<string>("");
  const [savingDetails, setSavingDetails] = useState<boolean>(false);

  // Cloud Sync Settings Modal
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [testWebhookUrl, setTestWebhookUrl] = useState<string>("");
  const [testingWebhook, setTestingWebhook] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Check stored auth on mount
  useEffect(() => {
    const storedAuth = sessionStorage.getItem("talentflow_admin_auth");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
    setAuthChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passkeyInput }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("talentflow_admin_auth", "true");
        setIsAuthenticated(true);
        toast.success("Welcome to Recruiter Line-Up Command");
      } else {
        setAuthError(data.error || "Invalid passkey. Default is talentflow2026");
      }
    } catch (err) {
      setAuthError("Authentication request failed. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("talentflow_admin_auth");
    setIsAuthenticated(false);
    toast.info("Logged out from Recruiter Command");
  };

  // Fetch Candidates Data
  const fetchCandidates = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/candidates?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setCandidates(data.candidates || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching candidates:", err);
      toast.error("Failed to refresh candidate line-up");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [roleFilter, statusFilter, searchQuery]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCandidates();
    }
  }, [isAuthenticated, fetchCandidates]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCandidates();
  };

  // Update Status Dropdown
  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    // Optimistic UI Update
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );

    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Candidate status updated to "${newStatus}"`);
        // Refresh stats
        fetchCandidates();
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Failed to update status on server. Reverting...");
      fetchCandidates();
    }
  };

  // Save Candidate Notes & Interview Schedule
  const handleSaveDetails = async () => {
    if (!activeCandidate) return;

    setSavingDetails(true);
    try {
      const res = await fetch(`/api/candidates/${activeCandidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruiterNotes: editNotes,
          interviewDate: editInterviewDate ? new Date(editInterviewDate).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Candidate notes & schedule saved successfully!");
        setActiveCandidate(null);
        fetchCandidates();
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (err) {
      toast.error("Failed to save candidate details.");
    } finally {
      setSavingDetails(false);
    }
  };

  // Open candidate details drawer
  const openCandidateDrawer = (candidate: CandidateItem) => {
    setActiveCandidate(candidate);
    setEditNotes(candidate.recruiterNotes || "");
    setEditInterviewDate(
      candidate.interviewDate
        ? new Date(candidate.interviewDate).toISOString().slice(0, 16)
        : ""
    );
  };

  // Test Webhook
  const handleTestWebhook = async () => {
    if (!testWebhookUrl.trim() || !testWebhookUrl.startsWith("http")) {
      toast.error("Please enter a valid Google Apps Script Web App URL");
      return;
    }

    setTestingWebhook(true);
    try {
      const res = await fetch("/api/webhook/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: testWebhookUrl.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Google Sheets Webhook connected successfully!");
      } else {
        toast.error(data.error || "Webhook test failed. Verify URL permissions.");
      }
    } catch (err) {
      toast.error("Failed to ping webhook URL.");
    } finally {
      setTestingWebhook(false);
    }
  };

  const copyScriptCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    toast.success("Google Apps Script code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 3000);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-soft">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Passkey Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-soft p-4">
        <div className="w-full max-w-md bg-canvas rounded-xl border border-hairline shadow-level2 p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-dark text-white mx-auto flex items-center justify-center mb-4 shadow-sm">
            <Lock className="w-6 h-6 text-primary-subdued" />
          </div>

          <h1 className="text-2xl font-light text-ink tracking-heading-lg mb-2">
            TalentFlow Recruiter Portal
          </h1>
          <p className="text-xs text-ink-mute mb-6 font-light">
            Enter your authorized access passkey to view candidate line-ups, manage ATS stages, and export daily rosters.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {authError && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                Recruiter Passkey
              </label>
              <input
                type="password"
                required
                placeholder="Default: talentflow2026"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink tracking-wider"
              />
              <p className="text-[11px] text-ink-mute mt-1">
                Default demo passkey: <code className="text-primary font-mono font-semibold">talentflow2026</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full btn-primary-pill text-sm py-2.5 shadow-sm mt-2"
            >
              Unlock Recruiter Console
            </button>

            <div className="pt-4 text-center">
              <Link
                href="/"
                className="text-xs text-ink-mute hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                ← Back to Public Job Portal
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Recruiter Command Center Dashboard
  return (
    <div className="min-h-screen bg-canvas-soft flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-canvas border-b border-hairline shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-brand-dark flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-semibold tracking-tight text-ink">
                  Talent<span className="text-primary font-normal">Flow</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-primary font-semibold -mt-1">
                  Recruiter Line-Up
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● Live Sync
            </span>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="btn-secondary-pill text-xs py-1.5 px-3 inline-flex items-center gap-1.5 text-ink-secondary hover:text-primary"
              title="Google Sheets Sync Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Sheets Sync</span>
            </button>

            <a
              href={`/api/export-lineup?role=${roleFilter}&status=${statusFilter}&search=${encodeURIComponent(
                searchQuery
              )}`}
              className="btn-primary-pill text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5 shadow-sm"
              title="Export filtered candidates into Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Line-Up (.xlsx)</span>
            </a>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-ink-mute hover:text-ink hover:bg-hairline transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Page Title & Quick Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-light text-ink tracking-heading-lg">
              Master Candidate Line-Up &amp; Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-ink-mute mt-0.5 font-light">
              Live tracking for candidates applying across Sector 59 Noida openings. Real-time ATS stages and instant export.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary-pill text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh Queue"}</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-canvas border border-hairline rounded-lg p-3 shadow-level1">
            <div className="text-[11px] text-ink-mute uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Total Inbound</span>
              <Users className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-2xl font-light text-ink tabular-nums">
              {stats.total}
            </div>
          </div>

          <div className="bg-canvas border border-hairline rounded-lg p-3 shadow-level1">
            <div className="text-[11px] text-ink-mute uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>New Applied</span>
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-light text-blue-600 tabular-nums">
              {stats.newApplied}
            </div>
          </div>

          <div className="bg-canvas border border-hairline rounded-lg p-3 shadow-level1">
            <div className="text-[11px] text-ink-mute uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Shortlisted</span>
              <Briefcase className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-2xl font-light text-purple-600 tabular-nums">
              {stats.shortlisted}
            </div>
          </div>

          <div className="bg-canvas border border-hairline rounded-lg p-3 shadow-level1">
            <div className="text-[11px] text-ink-mute uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Line-Up Sched.</span>
              <Calendar className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-2xl font-light text-primary tabular-nums">
              {stats.scheduled}
            </div>
          </div>

          <div className="bg-canvas border border-hairline rounded-lg p-3 shadow-level1">
            <div className="text-[11px] text-ink-mute uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Selected</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-light text-emerald-600 tabular-nums">
              {stats.selected}
            </div>
          </div>

          <div className="bg-canvas border border-hairline rounded-lg p-3 shadow-level1">
            <div className="text-[11px] text-ink-mute uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Rejected</span>
              <XCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-2xl font-light text-slate-500 tabular-nums">
              {stats.rejected}
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="bg-canvas border border-hairline rounded-xl p-4 shadow-level1 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
            <input
              type="text"
              placeholder="Search candidate, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Role Filter */}
            <div className="flex items-center gap-1 text-xs text-ink-mute">
              <span className="hidden sm:inline">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-sm border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Roles</option>
                <option value="Documentation Specialist">Documentation Specialist</option>
                <option value="Operations Executive">Operations Executive</option>
                <option value="HR Trainee">HR Trainee</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 text-xs text-ink-mute">
              <span className="hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-sm border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Pipeline Stages</option>
                {STATUS_LIST.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {(roleFilter !== "ALL" || statusFilter !== "ALL" || searchQuery) && (
              <button
                onClick={() => {
                  setRoleFilter("ALL");
                  setStatusFilter("ALL");
                  setSearchQuery("");
                }}
                className="text-xs text-primary hover:underline px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Master Line-Up Table */}
        <div className="bg-canvas border border-hairline rounded-xl shadow-level2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-hairline">
              <thead className="bg-canvas-soft text-ink-mute font-medium text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Applied</th>
                  <th className="py-3 px-4">Candidate &amp; Contact</th>
                  <th className="py-3 px-4">Applied Role</th>
                  <th className="py-3 px-4 text-center">Exp / Notice</th>
                  <th className="py-3 px-4">CTC (Cur / Exp)</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4">Pipeline Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline bg-canvas">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-ink-mute">
                      <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                      <span>Loading candidate records...</span>
                    </td>
                  </tr>
                ) : candidates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-ink-mute">
                      <FileSpreadsheet className="w-8 h-8 text-ink-mute/50 mx-auto mb-2" />
                      <p className="text-sm font-medium text-ink">No candidates in this line-up filter</p>
                      <p className="text-xs text-ink-mute mt-1">
                        Try adjusting your search criteria or role filters above.
                      </p>
                    </td>
                  </tr>
                ) : (
                  candidates.map((c) => {
                    const statusMeta =
                      STATUS_CONFIG[c.status] || STATUS_CONFIG["New Applied"];

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-canvas-soft/70 transition-colors group"
                      >
                        {/* Applied Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-ink-mute tabular-nums">
                          <div className="text-ink font-medium">
                            {new Date(c.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </div>
                          <div className="text-[10px] text-ink-mute">
                            {new Date(c.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>

                        {/* Candidate & Contact */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-ink text-[13px] flex items-center gap-1.5">
                            <span>{c.fullName}</span>
                            <span className="text-[10px] text-ink-mute font-mono font-normal">
                              ({c.id})
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-ink-mute mt-0.5">
                            <a
                              href={`tel:${c.phone}`}
                              className="hover:text-primary flex items-center gap-1 tabular-nums"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              {c.phone}
                            </a>
                            <a
                              href={`mailto:${c.email}`}
                              className="hover:text-primary flex items-center gap-1"
                            >
                              <Mail className="w-2.5 h-2.5" />
                              {c.email}
                            </a>
                          </div>
                          <div className="text-[10px] text-ink-mute flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-primary" />
                            <span>{c.location}</span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-ink">{c.appliedRole}</span>
                        </td>

                        {/* Exp / Notice */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap tabular-nums">
                          <div className="font-medium text-ink">
                            {c.experienceYears} Yrs
                          </div>
                          <div className="text-[10px] text-ink-mute">
                            {c.noticePeriodDays === 0
                              ? "Immediate"
                              : `${c.noticePeriodDays}d Notice`}
                          </div>
                        </td>

                        {/* CTC */}
                        <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                          <div className="text-ink text-[11px]">
                            {c.currentCtc || "—"}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-medium">
                            Exp: {c.expectedCtc || "—"}
                          </div>
                        </td>

                        {/* Resume */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <a
                            href={c.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary-deep hover:underline bg-primary/5 px-2 py-1 rounded"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Drive Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>

                        {/* Dynamic Status Dropdown */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="relative inline-block">
                            <select
                              value={c.status}
                              onChange={(e) =>
                                handleStatusChange(c.id, e.target.value)
                              }
                              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                            >
                              {STATUS_LIST.map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                  className="bg-white text-ink"
                                >
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>

                          {c.interviewDate && (
                            <div className="text-[10px] text-primary mt-1 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>
                                {new Date(c.interviewDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => openCandidateDrawer(c)}
                            className="text-xs text-primary hover:text-primary-deep font-medium hover:underline inline-flex items-center gap-1"
                          >
                            <span>Details &amp; Schedule</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="bg-canvas-soft border-t border-hairline px-4 py-3 flex items-center justify-between text-xs text-ink-mute">
            <div>
              Showing <span className="font-semibold text-ink">{candidates.length}</span> active candidates in line-up
            </div>
            <div className="text-[11px]">
              ATS Pipeline sync enabled
            </div>
          </div>
        </div>
      </main>

      {/* Candidate Details & Schedule Interview Modal */}
      {activeCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-canvas rounded-xl border border-hairline shadow-level3 overflow-hidden">
            <div className="bg-canvas-soft border-b border-hairline px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    Candidate Line-Up Dossier
                  </h3>
                  <p className="text-xs text-ink-mute">
                    ID: {activeCandidate.id} • {activeCandidate.appliedRole}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCandidate(null)}
                className="text-ink-mute hover:text-ink text-sm p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Candidate Quick Header */}
              <div className="p-3.5 rounded-lg bg-canvas-soft border border-hairline flex items-center justify-between">
                <div>
                  <div className="font-semibold text-ink text-sm">
                    {activeCandidate.fullName}
                  </div>
                  <div className="text-xs text-ink-mute">
                    {activeCandidate.location} • {activeCandidate.phone}
                  </div>
                </div>
                <a
                  href={activeCandidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-pill text-xs py-1.5 px-3 inline-flex items-center gap-1 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Resume</span>
                </a>
              </div>

              {/* Schedule Interview */}
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Schedule Interview Timestamp</span>
                </label>
                <input
                  type="datetime-local"
                  value={editInterviewDate}
                  onChange={(e) => setEditInterviewDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                />
              </div>

              {/* Recruiter Notes */}
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>Recruiter Assessment &amp; Feedback Notes</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Cleared round 1 screening. Communication is strong. Notice period negotiable to 15 days."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink leading-relaxed"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-hairline flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCandidate(null)}
                  className="px-4 py-2 text-xs text-ink-mute hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDetails}
                  disabled={savingDetails}
                  className="btn-primary-pill text-xs px-5 py-2 inline-flex items-center gap-1.5 shadow-sm disabled:opacity-70"
                >
                  {savingDetails ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Record...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Webhook Integration Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-canvas rounded-xl border border-hairline shadow-level3 overflow-hidden">
            <div className="bg-canvas-soft border-b border-hairline px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    Google Sheets Real-Time Sync Configuration
                  </h3>
                  <p className="text-xs text-ink-mute">
                    Stream every new applicant directly into your shared team Google Spreadsheet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="text-ink-mute hover:text-ink text-sm p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Step instructions */}
              <div className="bg-canvas-soft border border-hairline rounded-lg p-4 space-y-2">
                <div className="font-semibold text-ink text-sm mb-1">
                  How to link your Google Sheet:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-ink-secondary leading-relaxed">
                  <li>Open your Google Sheet where candidates should appear.</li>
                  <li>Click <strong>Extensions</strong> → <strong>Apps Script</strong>.</li>
                  <li>Copy and paste the Google Apps Script code below.</li>
                  <li>Click <strong>Deploy</strong> → <strong>New deployment</strong> → Select type <strong>Web app</strong>.</li>
                  <li>Set <em>Execute as</em>: <strong>Me</strong> and <em>Who has access</em>: <strong>Anyone</strong>.</li>
                  <li>Copy the resulting Web App URL and paste it in your Vercel/environment variables as <code className="text-primary font-mono">GOOGLE_SHEETS_WEBHOOK_URL</code>.</li>
                </ol>
              </div>

              {/* Code snippet block */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-ink">
                    Google Apps Script Code (Code.gs):
                  </span>
                  <button
                    onClick={copyScriptCode}
                    className="btn-secondary-pill text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-primary" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-brand-dark text-slate-200 rounded-md font-mono text-[11px] max-h-48 overflow-y-auto leading-tight">
                  {GOOGLE_APPS_SCRIPT_TEMPLATE}
                </pre>
              </div>

              {/* Test Webhook Connection */}
              <div className="pt-3 border-t border-hairline">
                <label className="block font-semibold text-ink mb-1">
                  Test Webhook Connection URL:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={testWebhookUrl}
                    onChange={(e) => setTestWebhookUrl(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  />
                  <button
                    onClick={handleTestWebhook}
                    disabled={testingWebhook}
                    className="btn-primary-pill text-xs py-2 px-4 whitespace-nowrap inline-flex items-center gap-1.5 shadow-sm disabled:opacity-70"
                  >
                    {testingWebhook ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <span>Send Ping Test</span>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-ink-mute mt-1">
                  Sends a sample test candidate to verify your Google Sheet receives incoming rows.
                </p>
              </div>

              {/* Close Button */}
              <div className="pt-3 border-t border-hairline flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSyncModalOpen(false)}
                  className="btn-secondary-pill text-xs px-5 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
