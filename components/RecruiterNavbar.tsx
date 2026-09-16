"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  FileSpreadsheet,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { User } from "firebase/auth";

interface RecruiterNavbarProps {
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  activeTab: "LINEUP" | "CALENDAR";
  onTabChange: (tab: "LINEUP" | "CALENDAR") => void;
  currentUser?: User | null;
  onSignOut?: () => void;
}

export default function RecruiterNavbar({
  onOpenAddModal,
  onOpenExportModal,
  activeTab,
  onTabChange,
  currentUser,
  onSignOut,
}: RecruiterNavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-hairline transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left: Back to Site + Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link
            href="/"
            className="p-1.5 rounded-md text-ink-mute hover:text-ink hover:bg-canvas-soft border border-hairline transition-colors"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] sm:text-[18px] font-semibold tracking-tight text-ink leading-tight">
                Talent<span className="text-primary font-normal">Flow</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-primary font-semibold hidden sm:block">
                Recruiter Command
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop View Switcher Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-canvas-soft p-1 rounded-pill border border-hairline text-xs font-medium">
          <button
            onClick={() => onTabChange("LINEUP")}
            className={`px-4 py-1.5 rounded-pill transition-all ${
              activeTab === "LINEUP"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Candidate Line-Up
          </button>
          <button
            onClick={() => onTabChange("CALENDAR")}
            className={`px-4 py-1.5 rounded-pill transition-all ${
              activeTab === "CALENDAR"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Interview Calendar
          </button>
        </div>

        {/* Right Actions: Add Candidate, Export, Google Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Manager Export Button (Desktop) */}
          <button
            onClick={onOpenExportModal}
            className="hidden sm:inline-flex btn-secondary-pill text-xs py-1.5 px-3 items-center gap-1.5 text-ink-secondary hover:text-emerald-700"
            title="Download Line-Up for Manager (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manager Export (.xlsx)</span>
          </button>

          {/* + Add Candidate Primary CTA */}
          <button
            onClick={onOpenAddModal}
            className="btn-primary-pill text-xs py-1.5 sm:py-2 px-2.5 sm:px-3.5 inline-flex items-center gap-1 shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-medium hidden sm:inline">Add Candidate</span>
            <span className="font-medium sm:hidden">Add</span>
          </button>

          {/* Recruiter Avatar & Sign Out */}
          {currentUser && (
            <div className="flex items-center gap-1.5 sm:gap-2 border-l border-hairline pl-2 ml-0.5 shrink-0">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || "Recruiter"}
                  className="w-7 h-7 rounded-full object-cover border border-hairline shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.displayName
                    ? currentUser.displayName.charAt(0).toUpperCase()
                    : "HR"}
                </div>
              )}

              <div className="hidden lg:flex flex-col text-[11px] leading-tight text-left">
                <span className="font-semibold text-ink truncate max-w-28">
                  {currentUser.displayName || "Recruiter"}
                </span>
                <span className="text-[10px] text-ink-mute truncate max-w-28">
                  {currentUser.email}
                </span>
              </div>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="p-1 rounded-md text-ink-mute hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                  title="Sign Out of Google Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
