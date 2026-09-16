"use client";

import React from "react";
import {
  ListFilter,
  Calendar as CalendarIcon,
  PlusCircle,
  FileSpreadsheet,
  Users,
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-hairline px-2 py-1.5 shadow-level3">
      <div className="flex items-center justify-around">
        {/* Line-Up Tab */}
        <button
          onClick={() => onTabChange("LINEUP")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            activeTab === "LINEUP"
              ? "text-primary font-semibold"
              : "text-ink-mute hover:text-ink"
          }`}
        >
          <ListFilter className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Line-Up</span>
        </button>

        {/* Center Primary + Add Candidate Button */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center -mt-4 bg-primary text-white p-3 rounded-full shadow-md hover:bg-primary-deep transition-transform active:scale-95"
          title="Add Candidate Line-Up"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        {/* Calendar Tab */}
        <button
          onClick={() => onTabChange("CALENDAR")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            activeTab === "CALENDAR"
              ? "text-primary font-semibold"
              : "text-ink-mute hover:text-ink"
          }`}
        >
          <CalendarIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Calendar</span>
        </button>

        {/* Manager Export */}
        <button
          onClick={onOpenExportModal}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-ink-mute hover:text-emerald-700 transition-colors"
        >
          <FileSpreadsheet className="w-5 h-5 mb-0.5 text-emerald-600" />
          <span className="text-[10px]">Export</span>
        </button>
      </div>
    </div>
  );
}
