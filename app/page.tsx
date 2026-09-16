"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import CalendarView from "@/components/CalendarView";
import AddCandidateModal from "@/components/AddCandidateModal";
import ManagerExportModal from "@/components/ManagerExportModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import GoogleAuthGate from "@/components/GoogleAuthGate";
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
} from "lucide-react";
import { toast } from "sonner";
import { CandidateItem, CandidateStats } from "@/lib/types";
import { isToday, isTomorrow, isThisWeek, formatIndianDateTime } from "@/lib/date-utils";
import {
  onRecruiterAuthStateChanged,
  logOutRecruiter,
  syncCandidateToFirestore,
  updateCandidateInFirestore,
} from "@/lib/firebase";
import { User } from "firebase/auth";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
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

const STATUS_LIST = [
  "New Applied",
  "Screening Shortlisted",
  "Line-Up Scheduled",
  "Interview Done",
  "Selected",
  "Rejected",
];

export default function RecruiterCommandPage() {
  // Authentication state (Google Sign-In)
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
  const [activeTab, setActiveTab] = useState<"LINEUP" | "CALENDAR">("LINEUP");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState<CandidateItem | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editInterviewDate, setEditInterviewDate] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "TOMORROW" | "THIS_WEEK">("ALL");

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onRecruiterAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await logOutRecruiter();
      setCurrentUser(null);
      toast.info("Signed out from Google Account");
    } catch (err) {
      toast.error("Failed to sign out");
    }
  };

  // Fetch Candidates
  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      if (data.success && data.candidates) {
        setCandidates(data.candidates);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch candidates", err);
      toast.error("Failed to refresh candidate line-up");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchCandidates();
    }
  }, [currentUser, fetchCandidates]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCandidates();
  };

  // Status Change
  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );

    // Sync to Firestore
    updateCandidateInFirestore(candidateId, { status: newStatus }).catch((e) =>
      console.warn("Firestore sync error:", e)
    );

    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
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

  // Save Candidate Notes & Interview Schedule
  const handleSaveDetails = async () => {
    if (!activeCandidate) return;

    setSavingDetails(true);
    try {
      const interviewIso = editInterviewDate
        ? new Date(editInterviewDate).toISOString()
        : null;

      // Update Firestore
      updateCandidateInFirestore(activeCandidate.id, {
        recruiterNotes: editNotes,
        interviewDate: interviewIso,
      }).catch((e) => console.warn("Firestore update error:", e));

      const res = await fetch(`/api/candidates/${activeCandidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruiterNotes: editNotes,
          interviewDate: interviewIso,
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

  const openCandidateDrawer = (candidate: CandidateItem) => {
    setActiveCandidate(candidate);
    setEditNotes(candidate.recruiterNotes || "");
    setEditInterviewDate(
      candidate.interviewDate
        ? new Date(candidate.interviewDate).toISOString().slice(0, 16)
        : ""
    );
  };

  // When candidate added via modal, sync to Firestore as well
  const handleCandidateAdded = (newCand: CandidateItem) => {
    syncCandidateToFirestore(newCand).catch((e) =>
      console.warn("Firestore candidate save error:", e)
    );
    fetchCandidates();
  };

  // Loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-soft">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // If recruiter is NOT authenticated, render Google Sign-In Gate ONLY!
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
    <div className="min-h-screen bg-canvas-soft flex flex-col pb-20 md:pb-8">
      {/* Top Recruiter Navbar */}
      <Navbar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onSignOut={handleSignOut}
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
        <div className="flex md:hidden items-center justify-between gap-2 mb-4 bg-canvas p-1.5 rounded-xl border border-hairline shadow-sm">
          <button
            onClick={() => setActiveTab("LINEUP")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "LINEUP"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-ink-secondary"
            }`}
          >
            Candidate Line-Up
          </button>
          <button
            onClick={() => setActiveTab("CALENDAR")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "CALENDAR"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-ink-secondary"
            }`}
          >
            Interview Calendar
          </button>
        </div>

        {/* Active Tab: CALENDAR VIEW */}
        {activeTab === "CALENDAR" && (
          <CalendarView
            candidates={candidates}
            onStatusChange={handleStatusChange}
            onOpenDetails={openCandidateDrawer}
          />
        )}

        {/* Active Tab: LINE-UP ROSTER TABLE & CARDS */}
        {activeTab === "LINEUP" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-canvas border border-hairline rounded-xl p-3 sm:p-4 shadow-level1 space-y-3">
              {/* Row 1: Search & Quick Presets */}
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
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setDateFilter("ALL")}
                    className={`px-3 py-1 rounded-pill text-xs font-medium transition-all ${
                      dateFilter === "ALL"
                        ? "bg-brand-dark text-white shadow-sm"
                        : "bg-canvas-soft border border-hairline text-ink-secondary hover:border-primary"
                    }`}
                  >
                    All ({candidates.length})
                  </button>

                  <button
                    onClick={() => setDateFilter("TODAY")}
                    className={`px-3 py-1 rounded-pill text-xs font-medium transition-all ${
                      dateFilter === "TODAY"
                        ? "bg-primary text-white shadow-sm"
                        : "bg-canvas-soft border border-hairline text-primary hover:bg-primary/5"
                    }`}
                  >
                    Today ({todayCount})
                  </button>

                  <button
                    onClick={() => setDateFilter("TOMORROW")}
                    className={`px-3 py-1 rounded-pill text-xs font-medium transition-all ${
                      dateFilter === "TOMORROW"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-canvas-soft border border-hairline text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    Tomorrow ({tomorrowCount})
                  </button>

                  <button
                    onClick={() => setDateFilter("THIS_WEEK")}
                    className={`px-3 py-1 rounded-pill text-xs font-medium transition-all ${
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

                  <div className="flex items-center gap-1">
                    <span className="text-ink-mute hidden sm:inline">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs px-2.5 py-1 rounded-sm border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                    >
                      <option value="ALL">All Stages</option>
                      {STATUS_LIST.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
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
                  <Users className="w-8 h-8 mx-auto text-ink-mute/40 mb-2" />
                  <p className="font-medium text-ink text-sm">No candidates found</p>
                  <p className="text-xs text-ink-mute mt-1">Tap &ldquo;+&rdquo; below to add candidate line-up</p>
                </div>
              ) : (
                filteredCandidates.map((c) => {
                  const statusMeta = STATUS_CONFIG[c.status] || STATUS_CONFIG["New Applied"];
                  const { dateStr, timeStr, relativeLabel } = formatIndianDateTime(c.interviewDate);

                  return (
                    <div
                      key={c.id}
                      className="bg-canvas border border-hairline rounded-xl p-4 shadow-level1 space-y-3"
                    >
                      {/* Top Row: Role & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full truncate max-w-44">
                          {c.appliedRole}
                        </span>

                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                        >
                          {STATUS_LIST.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Candidate Name & Contact */}
                      <div>
                        <div className="text-base font-semibold text-ink flex items-center justify-between">
                          <span>{c.fullName}</span>
                          <span className="text-[10px] text-ink-mute font-mono">{c.id}</span>
                        </div>
                        <div className="text-xs text-ink-mute flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span>{c.location}</span>
                          <span>•</span>
                          <span className="tabular-nums">{c.experienceYears} Yrs Exp</span>
                          <span>•</span>
                          <span className="tabular-nums">{c.noticePeriodDays}d Notice</span>
                        </div>
                      </div>

                      {/* Scheduled Time Banner if set */}
                      {c.interviewDate ? (
                        <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-primary font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {relativeLabel ? `${relativeLabel}, ` : ""}
                              {dateStr} at {timeStr}
                            </span>
                          </div>
                          <button
                            onClick={() => openCandidateDrawer(c)}
                            className="text-[11px] text-primary hover:underline font-semibold"
                          >
                            Reschedule
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs text-ink-mute">
                          <span>No interview scheduled</span>
                          <button
                            onClick={() => openCandidateDrawer(c)}
                            className="text-[11px] text-primary font-medium hover:underline"
                          >
                            + Schedule Slot
                          </button>
                        </div>
                      )}

                      {/* Direct Call, WhatsApp & Resume Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-hairline">
                        <a
                          href={`tel:${c.phone}`}
                          className="flex-1 text-center py-2 text-xs font-semibold rounded-pill bg-canvas-soft border border-hairline text-ink hover:text-primary transition-colors flex items-center justify-center gap-1"
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
                          className="flex-1 text-center py-2 text-xs font-semibold rounded-pill bg-canvas-soft border border-hairline text-ink hover:text-emerald-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={c.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-pill bg-canvas-soft border border-hairline text-primary hover:bg-primary/5"
                          title="Open Resume"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                      </div>

                      {c.recruiterNotes && (
                        <p className="text-[11px] text-ink-mute italic bg-canvas-soft p-2 rounded">
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
                        <td colSpan={8} className="py-12 text-center text-ink-mute">
                          <p className="text-sm font-medium text-ink">No candidates in this filter</p>
                          <p className="text-xs text-ink-mute mt-1">Try resetting the search or date filters.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((c) => {
                        const statusMeta = STATUS_CONFIG[c.status] || STATUS_CONFIG["New Applied"];
                        const { dateStr, timeStr, relativeLabel } = formatIndianDateTime(c.interviewDate);

                        return (
                          <tr key={c.id} className="hover:bg-canvas-soft/70 transition-colors">
                            {/* Schedule Date & Time */}
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
                                <button
                                  onClick={() => openCandidateDrawer(c)}
                                  className="text-[11px] text-primary hover:underline font-medium"
                                >
                                  + Set Schedule
                                </button>
                              )}
                            </td>

                            {/* Candidate & Contact */}
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

                            {/* Role */}
                            <td className="py-3.5 px-4">
                              <span className="font-medium text-ink">{c.appliedRole}</span>
                            </td>

                            {/* Exp / Notice */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap tabular-nums">
                              <div className="font-medium text-ink">{c.experienceYears} Yrs</div>
                              <div className="text-[10px] text-ink-mute">
                                {c.noticePeriodDays === 0 ? "Immediate" : `${c.noticePeriodDays}d Notice`}
                              </div>
                            </td>

                            {/* CTC */}
                            <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                              <div className="text-ink text-[11px]">{c.currentCtc || "—"}</div>
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
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline bg-primary/5 px-2 py-1 rounded"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Drive Link</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </td>

                            {/* Dynamic Status Dropdown */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <select
                                value={c.status}
                                onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                              >
                                {STATUS_LIST.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => openCandidateDrawer(c)}
                                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                              >
                                <span>Schedule &amp; Notes</span>
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
      </main>

      {/* Candidate Details & Schedule Drawer Modal */}
      {activeCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-canvas rounded-xl border border-hairline shadow-level3 overflow-hidden">
            <div className="bg-canvas-soft border-b border-hairline px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Candidate Dossier &amp; Interview Slot
                </h3>
                <p className="text-xs text-ink-mute">
                  ID: {activeCandidate.id} • {activeCandidate.appliedRole}
                </p>
              </div>
              <button
                onClick={() => setActiveCandidate(null)}
                className="text-ink-mute hover:text-ink text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 rounded-lg bg-canvas-soft border border-hairline flex items-center justify-between">
                <div>
                  <div className="font-semibold text-ink text-sm">{activeCandidate.fullName}</div>
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
                  <span>Resume</span>
                </a>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Scheduled Interview Date &amp; Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={editInterviewDate}
                  onChange={(e) => setEditInterviewDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Recruiter Screening Assessment &amp; Manager Feedback
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Cleared round 1 screening. Strong operational background. Slot confirmed with candidate."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink leading-relaxed"
                />
              </div>

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

      {/* Add Candidate Modal */}
      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCandidateAdded={handleCandidateAdded}
      />

      {/* Manager Export Modal */}
      <ManagerExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        candidates={candidates}
      />

      {/* Sticky Bottom Navigation for Mobile */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />
    </div>
  );
}
