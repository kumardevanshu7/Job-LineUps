"use client";

import React from "react";
import {
  ListFilter,
  Calendar as CalendarIcon,
  Plus,
  Activity,
  Settings,
} from "lucide-react";

interface MobileBottomNavProps {
  activeTab: "LINEUP" | "CALENDAR" | "LOGS" | "SETTINGS";
  onTabChange: (tab: "LINEUP" | "CALENDAR" | "LOGS" | "SETTINGS") => void;
  onOpenAddModal: () => void;
}

export default function MobileBottomNav({
  activeTab,
  onTabChange,
  onOpenAddModal,
}: MobileBottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-hairline px-2 py-1 shadow-level3 safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Line-Up Tab */}
        <button
          onClick={() => onTabChange("LINEUP")}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-1.5 rounded-xl transition-all active:scale-95 ${
            activeTab === "LINEUP"
              ? "text-primary font-bold bg-primary/10"
              : "text-ink-mute hover:text-ink"
          }`}
        >
          <ListFilter className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Line-Up</span>
        </button>

        {/* Calendar Tab */}
        <button
          onClick={() => onTabChange("CALENDAR")}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-1.5 rounded-xl transition-all active:scale-95 ${
            activeTab === "CALENDAR"
              ? "text-primary font-bold bg-primary/10"
              : "text-ink-mute hover:text-ink"
          }`}
        >
          <CalendarIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Calendar</span>
        </button>

        {/* Center Floating + Add Candidate Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center -mt-5 bg-primary text-white w-12 h-12 rounded-full shadow-lg hover:bg-primary-deep transition-transform active:scale-90 ring-4 ring-white shrink-0"
          title="Add Candidate Line-Up"
          aria-label="Add Candidate"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Logs Tab with Glowing Pulse Dot */}
        <button
          onClick={() => onTabChange("LOGS")}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-1.5 rounded-xl transition-all active:scale-95 relative ${
            activeTab === "LOGS"
              ? "text-primary font-bold bg-primary/10"
              : "text-ink-mute hover:text-ink"
          }`}
        >
          <div className="relative">
            <Activity className="w-5 h-5 mb-0.5" />
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
          </div>
          <span className="text-[10px] leading-tight">Logs</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => onTabChange("SETTINGS")}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-1.5 rounded-xl transition-all active:scale-95 ${
            activeTab === "SETTINGS"
              ? "text-primary font-bold bg-primary/10"
              : "text-ink-mute hover:text-ink"
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Settings</span>
        </button>
      </div>
    </div>
  );
}
