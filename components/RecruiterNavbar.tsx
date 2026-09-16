"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  FileSpreadsheet,
  LogOut,
  ArrowLeft,
  Activity,
  Settings,
} from "lucide-react";
import { User } from "firebase/auth";
import { RecruiterProfile } from "@/lib/types";
import CursiveAvatar from "./CursiveAvatar";
import BrandLogo from "./BrandLogo";

interface RecruiterNavbarProps {
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  activeTab: "LINEUP" | "CALENDAR" | "LOGS" | "SETTINGS";
  onTabChange: (tab: "LINEUP" | "CALENDAR" | "LOGS" | "SETTINGS") => void;
  currentUser?: User | null;
  recruiterProfile?: RecruiterProfile | null;
  onOpenProfileModal?: () => void;
  onSignOut?: () => void;
}

export default function RecruiterNavbar({
  onOpenAddModal,
  onOpenExportModal,
  activeTab,
  onTabChange,
  currentUser,
  recruiterProfile,
  onOpenProfileModal,
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
            {recruiterProfile?.avatarInitial ? (
              <button
                type="button"
                onClick={onOpenProfileModal}
                title={`Recruiter Logo (${recruiterProfile.avatarInitial}) — Tap to edit profile`}
                className="focus:outline-none transition-transform hover:scale-105 active:scale-95 shrink-0"
              >
                <CursiveAvatar
                  initial={recruiterProfile.avatarInitial}
                  colorId={recruiterProfile.avatarColorId}
                  size="sm"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm"
                />
              </button>
            ) : (
              <BrandLogo size="sm" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
            )}
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
            className={`px-3.5 py-1.5 rounded-pill transition-all ${
              activeTab === "LINEUP"
                ? "bg-brand-dark text-white shadow-sm font-semibold"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Candidate Line-Up
          </button>
          <button
            onClick={() => onTabChange("CALENDAR")}
            className={`px-3.5 py-1.5 rounded-pill transition-all ${
              activeTab === "CALENDAR"
                ? "bg-brand-dark text-white shadow-sm font-semibold"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Interview Calendar
          </button>
          <button
            onClick={() => onTabChange("LOGS")}
            className={`px-3.5 py-1.5 rounded-pill transition-all flex items-center gap-1.5 ${
              activeTab === "LOGS"
                ? "bg-brand-dark text-white shadow-sm font-semibold"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
            </span>
            <span>Activity Logs</span>
          </button>
          <button
            onClick={() => onTabChange("SETTINGS")}
            className={`px-3 py-1.5 rounded-pill transition-all flex items-center gap-1 ${
              activeTab === "SETTINGS"
                ? "bg-brand-dark text-white shadow-sm font-semibold"
                : "text-ink-secondary hover:text-ink"
            }`}
            title="Settings & Security PIN"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
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

          {/* Recruiter Cursive Avatar & Profile Button */}
          {currentUser && (
            <div className="flex items-center gap-1.5 sm:gap-2 border-l border-hairline pl-2 ml-0.5 shrink-0">
              <button
                onClick={onOpenProfileModal}
                className="flex items-center gap-2 group text-left focus:outline-none"
                title="Click to customize your profile & cursive logo avatar"
              >
                <CursiveAvatar
                  initial={
                    recruiterProfile?.avatarInitial ||
                    currentUser.displayName?.trim().charAt(0) ||
                    "K"
                  }
                  colorId={recruiterProfile?.avatarColorId || "lavender"}
                  size="sm"
                  className="group-hover:scale-105 group-hover:ring-2 group-hover:ring-primary/40 transition-all"
                />

                <div className="hidden lg:flex flex-col text-[11px] leading-tight text-left">
                  <span className="font-semibold text-ink truncate max-w-28 group-hover:text-primary transition-colors">
                    {recruiterProfile?.name || currentUser.displayName || "Recruiter"}
                  </span>
                  <span className="text-[10px] text-ink-mute truncate max-w-28">
                    {recruiterProfile?.position
                      ? `${recruiterProfile.position}`
                      : currentUser.email}
                  </span>
                </div>
              </button>

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
