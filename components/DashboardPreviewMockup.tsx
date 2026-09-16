"use client";

import React from "react";
import Link from "next/link";
import {
  Download,
  Calendar,
  Phone,
  FileText,
  Search,
  CheckCircle,
  Clock,
  Briefcase,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export default function DashboardPreviewMockup() {
  return (
    <section className="relative z-20 -mt-6 sm:-mt-8 mb-16 sm:mb-24 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* Outer Composited Chrome Panel */}
      <div className="rounded-xl bg-canvas border border-hairline shadow-level2 overflow-hidden">
        {/* Top Window Bar */}
        <div className="bg-canvas-soft border-b border-hairline px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            <span className="ml-1.5 sm:ml-3 text-[11px] sm:text-[12px] font-medium text-ink-mute tracking-tight truncate max-w-40 sm:max-w-none">
              Recruiter Line-Up Command
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync</span>
            </span>
            <Link
              href="/admin"
              className="text-[11px] sm:text-[12px] font-medium text-primary hover:text-primary-deep transition-colors inline-flex items-center gap-1 shrink-0"
            >
              <span>Open Console</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Inner Mockup Body */}
        <div className="p-3 sm:p-6 bg-canvas">
          {/* Top KPI Metrics Preview Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2.5 sm:p-3.5 rounded-lg bg-canvas-soft border border-hairline">
              <div className="flex items-center justify-between text-ink-mute text-[10px] sm:text-[12px] mb-0.5 sm:mb-1">
                <span className="truncate">Total Roster</span>
                <Users className="w-3.5 h-3.5 text-primary shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-light text-ink tracking-tight tabular-nums">
                248
              </div>
              <div className="text-[10px] sm:text-[11px] text-emerald-600 flex items-center gap-0.5 mt-0.5 truncate">
                <TrendingUp className="w-3 h-3 shrink-0" />
                <span>+18% this week</span>
              </div>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-lg bg-canvas-soft border border-hairline">
              <div className="flex items-center justify-between text-ink-mute text-[10px] sm:text-[12px] mb-0.5 sm:mb-1">
                <span className="truncate">Shortlisted</span>
                <Briefcase className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-light text-ink tracking-tight tabular-nums">
                64
              </div>
              <div className="text-[10px] sm:text-[11px] text-ink-mute truncate">Ready for line-up</div>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-lg bg-canvas-soft border border-hairline">
              <div className="flex items-center justify-between text-ink-mute text-[10px] sm:text-[12px] mb-0.5 sm:mb-1">
                <span className="truncate">Scheduled</span>
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-light text-ink tracking-tight tabular-nums">
                29
              </div>
              <div className="text-[10px] sm:text-[11px] text-primary truncate">Active slots</div>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-lg bg-canvas-soft border border-hairline">
              <div className="flex items-center justify-between text-ink-mute text-[10px] sm:text-[12px] mb-0.5 sm:mb-1">
                <span className="truncate">Selected</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-light text-ink tracking-tight tabular-nums">
                12
              </div>
              <div className="text-[10px] sm:text-[11px] text-emerald-600 truncate">Offers finalized</div>
            </div>
          </div>

          {/* Table Header Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
                <div className="w-full text-xs pl-9 pr-3 py-1.5 rounded-sm border border-hairline-input text-ink-mute bg-canvas truncate">
                  Search candidate or role...
                </div>
              </div>
              <span className="text-[10px] sm:text-xs text-primary font-medium bg-primary/10 border border-primary/20 rounded px-2 py-1 shrink-0">
                Today&apos;s Line-Up
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="btn-primary-pill text-xs py-1.5 px-3 shadow-sm inline-flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <Download className="w-3 h-3" />
                <span>Export Line-Up (.xlsx)</span>
              </Link>
            </div>
          </div>

          {/* Sample Table Rows with Mobile Horizontal Scroll Support */}
          <div className="overflow-x-auto border border-hairline rounded-lg">
            <div className="sm:hidden px-3 py-1.5 bg-canvas-soft/90 border-b border-hairline text-[10px] text-ink-mute flex items-center justify-between">
              <span className="font-medium text-ink-secondary">Live Line-Up Preview</span>
              <span className="text-primary font-medium">Swipe horizontally →</span>
            </div>
            <table className="w-full text-left text-xs divide-y divide-hairline min-w-[540px]">
              <thead className="bg-canvas-soft text-ink-mute font-medium text-[10px] sm:text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Experience</th>
                  <th className="py-2.5 px-3">Notice</th>
                  <th className="py-2.5 px-3">Resume</th>
                  <th className="py-2.5 px-3">Line-Up Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline bg-canvas">
                <tr className="hover:bg-canvas-soft/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-ink">Aarav Sharma</div>
                    <div className="text-[10px] text-ink-mute flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      +91 98182 34567 • Noida
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-ink">Documentation Specialist</td>
                  <td className="py-2.5 px-3 text-ink tabular-nums">2.5 Years</td>
                  <td className="py-2.5 px-3 text-ink tabular-nums">15 Days</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer">
                      <FileText className="w-3 h-3" />
                      Drive Link
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-subdued/60 text-primary-deep border border-primary-subdued">
                      <Clock className="w-3 h-3" />
                      Line-Up Scheduled
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-canvas-soft/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-ink">Pooja Verma</div>
                    <div className="text-[10px] text-ink-mute flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      +91 99104 56789 • Ghaziabad
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-ink">Operations Executive</td>
                  <td className="py-2.5 px-3 text-ink tabular-nums">3.2 Years</td>
                  <td className="py-2.5 px-3 text-ink tabular-nums">30 Days</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer">
                      <FileText className="w-3 h-3" />
                      Drive Link
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      Screening Shortlisted
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
