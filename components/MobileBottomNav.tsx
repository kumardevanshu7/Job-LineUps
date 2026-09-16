"use client";

import React from "react";
import {
  ListFilter,
  Calendar as CalendarIcon,
  Plus,
  FileSpreadsheet,
} from "lucide-react";

interface MobileBottomNavProps {
  activeTab: "LINEUP" | "CALENDAR";
  onTabChange: (tab: "LINEUP" | "CALENDAR") => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
}

export default function MobileBottomNav({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenExportModal,
}: MobileBottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-hairline px-3 py-1.5 shadow-level3 safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Line-Up Tab */}
        <button
          onClick={() => onTabChange("LINEUP")}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2 rounded-xl transition-all active:scale-95 ${
            activeTab === "LINEUP"
              ? "text-primary font-bold bg-primary/5"
              : "text-ink-mute hover:text-ink"
          }`}
        >
          <ListFilter className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">Line-Up</span>
        </button>

        {/* Center Floating + Add Candidate Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center -mt-6 bg-primary text-white w-12 h-12 rounded-full shadow-lg hover:bg-primary-deep transition-transform active:scale-90 ring-4 ring-white shrink-0"
          title="Add Candidate Line-Up"
          aria-label="Add Candidate"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Calendar Tab */}
        <button
          onClick={() => onTabChange("CALENDAR")}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2 rounded-xl transition-all active:scale-95 ${
            activeTab === "CALENDAR"
              ? "text-primary font-bold bg-primary/5"
              : "text-ink-mute hover:text-ink"
          }`}
        >
          <CalendarIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">Calendar</span>
        </button>

        {/* Manager Export */}
        <button
          onClick={onOpenExportModal}
          className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2 rounded-xl text-ink-mute hover:text-emerald-700 transition-all active:scale-95"
          aria-label="Export Line-Up"
        >
          <FileSpreadsheet className="w-5 h-5 mb-0.5 text-emerald-600" />
          <span className="text-[11px] leading-tight">Export</span>
        </button>
      </div>
    </div>
  );
}

