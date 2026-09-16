"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  FileSpreadsheet,
  LogOut,
  Activity,
  Settings,
  Users,
  Calendar,
} from "lucide-react";
import { User } from "firebase/auth";
import { RecruiterProfile } from "@/lib/types";
import CursiveAvatar from "./CursiveAvatar";
import BrandLogo from "./BrandLogo";

interface RecruiterNavbarProps {
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenPartiesModal?: () => void;
  partiesCount?: number;
  activeTab: "LINEUP" | "CALENDAR" | "LOGS" | "SETTINGS";
  onTabChange: (tab: "LINEUP" | "CALENDAR" | "LOGS" | "SETTINGS") => void;
  currentUser?: User | null;
  recruiterProfile?: RecruiterProfile | null;
  onOpenProfileModal?: () => void;
  onSignOut?: () => void;
  candidateCount?: number;
}

export default function RecruiterNavbar({
  onOpenAddModal,
  onOpenExportModal,
  onOpenPartiesModal,
  partiesCount,
  activeTab,
  onTabChange,
  currentUser,
  recruiterProfile,
  onOpenProfileModal,
  onSignOut,
  candidateCount,
}: RecruiterNavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      {/* ========================================================================= */}
      {/* LAYER 1: Top Command & Primary Actions Header                            */}
      {/* ========================================================================= */}
      <div className="w-full backdrop-blur-md bg-white/95 border-b border-hairline/80">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Brand Logo (high-res favicon) + TalentFlow wordmark */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 sm:gap-2 group focus:outline-none shrink-0"
              title="TalentFlow Recruiter Command"
            >
              {/* Always show the favicon/brand logo here */}
              <BrandLogo size="sm" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-2xs shrink-0 group-hover:scale-105 transition-transform" />
              <div className="flex flex-col shrink-0">
                <span className="text-[16px] sm:text-[19px] font-bold tracking-tight text-ink leading-tight">
                  Talent<span className="text-primary font-medium">Flow</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-primary font-semibold hidden sm:block">
                  Recruiter Command
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Desktop Actions Group (Strictly Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Manager Export — desktop only */}
              <button
                onClick={onOpenExportModal}
                className="btn-secondary-pill text-xs py-1.5 px-3 items-center gap-1.5 text-ink-secondary hover:text-emerald-700 hover:border-emerald-300 transition-all shadow-2xs shrink-0"
                title="Download Line-Up for Manager (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium">Manager Export (.xlsx)</span>
              </button>

              {/* Add Parties — desktop only (md+) */}
              <button
                onClick={onOpenPartiesModal}
                className="btn-secondary-pill text-xs py-1.5 px-3 items-center gap-1.5 text-primary border-primary/30 hover:bg-primary-subdued/50 transition-all shadow-2xs shrink-0"
                title="Add Collaborator Parties & Configure Permissions"
              >
                <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-semibold">Add Parties</span>
                {typeof partiesCount === "number" && partiesCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-primary text-white">
                    {partiesCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile-Only Action Buttons (md:hidden) */}
            {/* 1. Mobile Parties Button with Badge */}
            {onOpenPartiesModal && (
              <button
                onClick={onOpenPartiesModal}
                className="md:hidden p-1.5 rounded-lg border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-all shadow-2xs shrink-0 flex items-center justify-center relative"
                title="Collaborator Parties"
                aria-label="Collaborator Parties"
              >
                <Users className="w-4 h-4 text-primary" />
                {typeof partiesCount === "number" && partiesCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 text-[9px] font-bold rounded-full bg-primary text-white flex items-center justify-center">
                    {partiesCount}
                  </span>
                )}
              </button>
            )}

            {/* 2. Mobile Quick Export Button */}
            <button
              onClick={onOpenExportModal}
              className="md:hidden p-1.5 rounded-lg border border-hairline bg-canvas text-emerald-700 hover:bg-emerald-50 transition-all shadow-2xs shrink-0 flex items-center justify-center"
              title="Export Line-Up (.xlsx)"
              aria-label="Export Line-Up"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Add Candidate CTA */}
            <button
              onClick={onOpenAddModal}
              className="btn-primary-pill text-xs py-1.5 sm:py-2 px-2.5 sm:px-4 inline-flex items-center gap-1 sm:gap-1.5 shadow-2xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="font-semibold hidden sm:inline">Add Candidate</span>
              <span className="font-semibold sm:hidden">Add</span>
            </button>

            {/* Recruiter Profile Chip + Sign Out */}
            {currentUser && (
              <div className="flex items-center gap-1 sm:gap-2 border-l border-hairline pl-1.5 sm:pl-3 ml-0.5 shrink-0">
                <button
                  onClick={onOpenProfileModal}
                  className="flex items-center gap-2 group text-left focus:outline-none p-1 rounded-lg hover:bg-canvas-soft transition-colors"
                  title="Click to customize profile & logo"
                >
                  <CursiveAvatar
                    initial={
                      recruiterProfile?.avatarInitial ||
                      currentUser.displayName?.trim().charAt(0) ||
                      "K"
                    }
                    colorId={recruiterProfile?.avatarColorId || "lavender"}
                    size="sm"
                    className="w-7 h-7 rounded-lg group-hover:ring-2 group-hover:ring-primary/40 transition-all shrink-0"
                  />

                  <div className="hidden lg:flex flex-col text-[11px] leading-tight text-left">
                    <span className="font-semibold text-ink truncate max-w-28 group-hover:text-primary transition-colors">
                      {recruiterProfile?.name || currentUser.displayName || "Recruiter"}
                    </span>
                    <span className="text-[10px] text-ink-mute truncate max-w-28">
                      {recruiterProfile?.position || currentUser.email}
                    </span>
                  </div>
                </button>

                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="p-1.5 rounded-lg text-ink-mute hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LAYER 2: Sub-Navigation Strip (Dedicated Tab Navigation Bar)             */}
      {/* ========================================================================= */}
      <div className="w-full bg-white/95 backdrop-blur-md border-b border-hairline">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-11 sm:h-12 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Clean Horizontal Tabs Strip */}
          <nav className="flex items-center gap-1 sm:gap-1.5 text-xs font-medium shrink-0">
            {/* Tab 1: Line-Up */}
            <button
              onClick={() => onTabChange("LINEUP")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "LINEUP"
                  ? "bg-brand-dark text-white font-semibold shadow-xs"
                  : "text-ink-secondary hover:text-ink hover:bg-canvas-soft"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Candidate Line-Up</span>
              {typeof candidateCount === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                    activeTab === "LINEUP"
                      ? "bg-white/25 text-white"
                      : "bg-canvas-soft text-ink-mute border border-hairline"
                  }`}
                >
                  {candidateCount}
                </span>
              )}
            </button>

            {/* Tab 2: Interview Calendar */}
            <button
              onClick={() => onTabChange("CALENDAR")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "CALENDAR"
                  ? "bg-brand-dark text-white font-semibold shadow-xs"
                  : "text-ink-secondary hover:text-ink hover:bg-canvas-soft"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Interview Calendar</span>
            </button>

            {/* Tab 3: Activity Logs (with live glowing pulse dot) */}
            <button
              onClick={() => onTabChange("LOGS")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "LOGS"
                  ? "bg-brand-dark text-white font-semibold shadow-xs"
                  : "text-ink-secondary hover:text-ink hover:bg-canvas-soft"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
              </span>
              <span>Activity Logs</span>
            </button>

            {/* Tab 4: Settings & Security Controls */}
            <button
              onClick={() => onTabChange("SETTINGS")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "SETTINGS"
                  ? "bg-brand-dark text-white font-semibold shadow-xs"
                  : "text-ink-secondary hover:text-ink hover:bg-canvas-soft"
              }`}
              title="Settings & Security PIN"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            {/* Item 5: Collaborator Parties */}
            {onOpenPartiesModal && (
              <button
                onClick={onOpenPartiesModal}
                className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-primary hover:bg-primary/10 border border-primary/20 shrink-0 font-medium ml-1"
                title="Add Collaborator Parties & Configure Permissions"
              >
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>Parties</span>
                {typeof partiesCount === "number" && partiesCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-primary text-white">
                    {partiesCount}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
