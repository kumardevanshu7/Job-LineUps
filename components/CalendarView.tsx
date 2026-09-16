"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Phone,
  MessageCircle,
  FileText,
  Download,
  MapPin,
} from "lucide-react";
import { CandidateItem } from "@/lib/types";
import { isSameDay, isToday, isTomorrow, formatIndianDateTime } from "@/lib/date-utils";

interface CalendarViewProps {
  candidates: CandidateItem[];
  onStatusChange: (id: string, newStatus: string) => void;
  onOpenDetails: (candidate: CandidateItem) => void;
}

export default function CalendarView({
  candidates,
  onStatusChange,
  onOpenDetails,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Group candidates by date key (YYYY-MM-DD)
  const scheduledCandidates = useMemo(() => {
    return candidates.filter((c) => c.interviewDate);
  }, [candidates]);

  const candidatesByDateKey = useMemo(() => {
    const map = new Map<string, CandidateItem[]>();
    for (const c of scheduledCandidates) {
      if (!c.interviewDate) continue;
      const d = new Date(c.interviewDate);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const list = map.get(key) || [];
      list.push(c);
      map.set(key, list);
    }
    return map;
  }, [scheduledCandidates]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", { month: "short" });
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const jumpToTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCurrentDate(tomorrow);
    setSelectedDate(tomorrow);
  };

  // Candidates for the currently selected date
  const selectedDateCandidates = useMemo(() => {
    return scheduledCandidates
      .filter((c) => c.interviewDate && isSameDay(c.interviewDate, selectedDate))
      .sort((a, b) => {
        const timeA = a.interviewDate ? new Date(a.interviewDate).getTime() : 0;
        const timeB = b.interviewDate ? new Date(b.interviewDate).getTime() : 0;
        return timeA - timeB;
      });
  }, [scheduledCandidates, selectedDate]);

  // Days of week
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header & Presets */}
      <div className="bg-canvas border border-hairline rounded-xl p-3 sm:p-4 shadow-level1 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1 rounded-md text-ink-mute hover:text-ink hover:bg-canvas-soft border border-hairline transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm sm:text-base font-semibold text-ink px-2 min-w-28 text-center">
              {monthName} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-1 rounded-md text-ink-mute hover:text-ink hover:bg-canvas-soft border border-hairline transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[11px] text-ink-mute sm:border-l sm:border-hairline sm:pl-3">
            {scheduledCandidates.length} Scheduled
          </span>
        </div>

        {/* Quick Date Presets: Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={jumpToToday}
            className={`px-3 py-1 rounded-pill text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              isToday(selectedDate)
                ? "bg-primary text-white shadow-sm"
                : "bg-canvas-soft border border-hairline text-ink-secondary hover:border-primary"
            }`}
          >
            Today&apos;s Line-Up
          </button>

          <button
            onClick={jumpToTomorrow}
            className={`px-3 py-1 rounded-pill text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              isTomorrow(selectedDate)
                ? "bg-primary text-white shadow-sm"
                : "bg-canvas-soft border border-hairline text-ink-secondary hover:border-primary"
            }`}
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Col: Month Matrix */}
        <div className="lg:col-span-7 bg-canvas border border-hairline rounded-xl p-3 sm:p-5 shadow-level1">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-semibold text-ink-mute mb-2">
            {weekDays.map((d) => (
              <div key={d} className="py-0.5">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty days before 1st of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 sm:h-20 rounded-md sm:rounded-lg bg-canvas-soft/40" />
            ))}

            {/* Month Day Tiles */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const thisDate = new Date(year, month, dayNum);
              const dateKey = `${year}-${month + 1}-${dayNum}`;
              const dayCandidates = candidatesByDateKey.get(dateKey) || [];
              const count = dayCandidates.length;

              const isSelected = isSameDay(thisDate, selectedDate);
              const isCurrentDay = isToday(thisDate);

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(thisDate)}
                  className={`h-12 sm:h-20 p-1 sm:p-1.5 rounded-md sm:rounded-lg border text-left flex flex-col justify-between transition-all group ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm"
                      : isCurrentDay
                      ? "border-primary-subdued bg-primary-subdued/20"
                      : "border-hairline bg-canvas hover:border-ink-mute/40 hover:bg-canvas-soft/60"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[11px] sm:text-xs font-semibold tabular-nums w-5 h-5 flex items-center justify-center rounded-full ${
                        isCurrentDay
                          ? "bg-primary text-white"
                          : isSelected
                          ? "text-primary font-bold"
                          : "text-ink"
                      }`}
                    >
                      {dayNum}
                    </span>

                    {count > 0 && (
                      <span className="text-[9px] sm:text-[10px] font-bold bg-primary text-white rounded-full px-1.5 py-0.2 shadow-sm leading-none">
                        {count}
                      </span>
                    )}
                  </div>

                  {/* Desktop Preview */}
                  <div className="hidden sm:block w-full truncate mt-auto">
                    {count > 0 ? (
                      <div className="text-[10px] text-primary truncate font-medium">
                        {dayCandidates[0].fullName}
                        {count > 1 && ` +${count - 1}`}
                      </div>
                    ) : (
                      <div className="text-[10px] text-transparent select-none">-</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Day Line-Up Schedule */}
        <div className="lg:col-span-5 bg-canvas border border-hairline rounded-xl p-4 sm:p-5 shadow-level1 flex flex-col">
          {/* Day Schedule Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-hairline">
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>
                  {isToday(selectedDate)
                    ? "Today's Line-Up"
                    : isTomorrow(selectedDate)
                    ? "Tomorrow's Agenda"
                    : "Scheduled Date"}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-ink">
                {selectedDate.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </h3>
            </div>

            {selectedDateCandidates.length > 0 && (
              <a
                href={`/api/export-lineup`}
                className="btn-primary-pill text-xs py-1 px-2.5 sm:px-3 inline-flex items-center gap-1 shadow-sm"
                title="Download Excel Line-Up for Manager"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </a>
            )}
          </div>

          {/* Candidates List for Selected Date */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[480px] pr-0.5">
            {selectedDateCandidates.length === 0 ? (
              <div className="text-center py-10 text-ink-mute">
                <CalendarIcon className="w-8 h-8 mx-auto text-ink-mute/40 mb-2" />
                <p className="text-sm font-medium text-ink">No interviews on this date</p>
                <p className="text-xs text-ink-mute mt-1">
                  Tap &ldquo;+ Add Candidate&rdquo; to schedule interviews.
                </p>
              </div>
            ) : (
              selectedDateCandidates.map((c) => {
                const { timeStr } = formatIndianDateTime(c.interviewDate);

                return (
                  <div
                    key={c.id}
                    className="p-3 sm:p-3.5 rounded-lg border border-hairline bg-canvas-soft/60 hover:bg-canvas hover:border-primary/40 hover:shadow-level1 transition-all space-y-2.5"
                  >
                    {/* Time Slot & Role Badge */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full tabular-nums shrink-0">
                        <Clock className="w-3 h-3" />
                        {timeStr}
                      </span>

                      <span className="text-[10px] sm:text-[11px] font-medium text-ink-secondary bg-white border border-hairline px-2 py-0.5 rounded-pill truncate max-w-44">
                        {c.appliedRole}
                      </span>
                    </div>

                    {/* Candidate Name & Contact */}
                    <div>
                      <div className="font-semibold text-ink text-sm flex items-center justify-between">
                        <span>{c.fullName}</span>
                        <span className="text-[10px] text-ink-mute font-mono font-normal">
                          {c.id}
                        </span>
                      </div>
                      <div className="text-xs text-ink-mute flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{c.location}</span>
                        <span>•</span>
                        <span className="tabular-nums shrink-0">{c.experienceYears}y</span>
                        <span>•</span>
                        <span className="tabular-nums shrink-0">{c.noticePeriodDays}d</span>
                      </div>
                    </div>

                    {/* Direct Contact Buttons (Call, WhatsApp, Resume) - Touch friendly */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1.5 border-t border-hairline">
                      <a
                        href={`tel:${c.phone}`}
                        className="col-span-2 text-center py-2 text-xs font-semibold rounded-pill bg-white border border-hairline text-ink hover:text-primary transition-all flex items-center justify-center gap-1 active:scale-95 shadow-sm"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>Call</span>
                      </a>

                      <a
                        href={`https://wa.me/91${c.phone}?text=Hello%20${encodeURIComponent(
                          c.fullName
                        )},%20this%20is%20from%20TalentFlow%20Recruitment%20regarding%20your%20interview%20schedule.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-2 text-center py-2 text-xs font-semibold rounded-pill bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all flex items-center justify-center gap-1 active:scale-95 shadow-sm"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={c.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-1 py-2 text-xs rounded-pill bg-white border border-hairline text-primary hover:bg-primary/5 transition-all flex items-center justify-center active:scale-95 shadow-sm"
                        title="Open Resume"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Status dropdown & Notes preview */}
                    <div className="flex items-center justify-between gap-2 text-xs pt-1">
                      <select
                        value={c.status}
                        onChange={(e) => onStatusChange(c.id, e.target.value)}
                        className="text-[10px] sm:text-[11px] font-medium px-2 py-1 rounded-full border border-hairline bg-white text-ink focus:outline-none focus:border-primary cursor-pointer shrink-0 max-w-[145px]"
                      >
                        <option value="Line-Up Scheduled">Line-Up Scheduled</option>
                        <option value="Interview Done">Interview Done</option>
                        <option value="Screening Shortlisted">Screening Shortlisted</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <button
                        onClick={() => onOpenDetails(c)}
                        className="text-[11px] text-primary hover:underline font-medium shrink-0 py-0.5"
                      >
                        Edit Notes →
                      </button>
                    </div>

                    {c.recruiterNotes && (
                      <p className="text-[10px] sm:text-[11px] text-ink-mute bg-white p-2 rounded border border-hairline italic">
                        &ldquo;{c.recruiterNotes}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
