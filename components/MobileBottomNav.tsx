"use client";

import React from "react";
import {
  ListFilter,
  Calendar as CalendarIcon,
  Plus,
  Activity,
  Settings,
  Workflow,
} from "lucide-react";

interface MobileBottomNavProps {
  activeTab: "LINEUP" | "CALENDAR" | "LOGS" | "WEBHOOKS" | "SETTINGS";
  onTabChange: (tab: "LINEUP" | "CALENDAR" | "LOGS" | "WEBHOOKS" | "SETTINGS") => void;
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
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === "LINEUP"
              ? "text-primary font-bold bg-primary/10"
              : "text-ink-mute hover:text-ink"
          }`}
        >
          <ListFilter className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] leading-tight">Line-Up</span>
        </button>

        {/* Calendar Tab */}
        <button
          onClick={() => onTabChange("CALENDAR")}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === "CALENDAR"
              ? "text-primary font-bold bg-primary/10"
              : "text-ink-mute hover:text-ink"
          }`}
        >
          <CalendarIcon className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] leading-tight">Calendar</span>
        </button>

        {/* Center Floating + Add Candidate Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center -mt-4 bg-primary text-white w-11 h-11 rounded-full shadow-lg hover:bg-primary-deep transition-transform active:scale-90 ring-4 ring-white shrink-0"
          title="Add Candidate Line-Up"
          aria-label="Add Candidate"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Webhooks Tab */}
        <button
          onClick={() => onTabChange("WEBHOOKS")}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === "WEBHOOKS"
              ? "text-primary font-bold bg-primary/10"
              : "text-ink-mute hover:text-ink"
          }`}
        >
          <Workflow className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] leading-tight">Webhooks</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => onTabChange("SETTINGS")}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === "SETTINGS"
              ? "text-primary font-bold bg-primary/10"
              : "text-ink-mute hover:text-ink"
          }`}
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] leading-tight">Settings</span>
        </button>
      </div>
    </div>
  );
}
