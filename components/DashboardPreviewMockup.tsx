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
} from "lucide-react";

export default function DashboardPreviewMockup() {
  return (
    <section className="relative z-20 -mt-8 mb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Outer Composited Chrome Panel */}
      <div className="rounded-xl bg-canvas border border-hairline shadow-level2 overflow-hidden">
        {/* Top Window Bar */}
        <div className="bg-canvas-soft border-b border-hairline px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            <span className="ml-3 text-[12px] font-medium text-ink-mute tracking-tight">
              TalentFlow Command • Live Recruiter Line-Up Feed
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
            <Link
              href="/admin"
              className="text-[12px] font-medium text-primary hover:text-primary-deep transition-colors"
            >
              Open Full Console →
            </Link>
          </div>
        </div>

        {/* Inner Mockup Body */}
        <div className="p-4 sm:p-6 bg-canvas">
          {/* Top KPI Metrics Preview Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 rounded-lg bg-canvas-soft border border-hairline">
              <div className="flex items-center justify-between text-ink-mute text-[12px] mb-1">
                <span>Inbound Applicants</span>
                <Users className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-2xl font-light text-ink tracking-tight tabular-nums">
                248
              </div>
              <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+18% this week</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-canvas-soft border border-hairline">
              <div className="flex items-center justify-between text-ink-mute text-[12px] mb-1">
                <span>Screening Shortlisted</span>
                <Briefcase className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-2xl font-light text-ink tracking-tight tabular-nums">
                64
              </div>
              <div className="text-[11px] text-ink-mute">Ready for scheduling</div>
            </div>

            <div className="p-3.5 rounded-lg bg-canvas-soft border border-hairline">
              <div className="flex items-center justify-between text-ink-mute text-[12px] mb-1">
                <span>Line-Up Scheduled</span>
                <Calendar className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-2xl font-light text-ink tracking-tight tabular-nums">
                29
              </div>
              <div className="text-[11px] text-primary">Interviews lined up</div>
            </div>

            <div className="p-3.5 rounded-lg bg-canvas-soft border border-hairline">
              <div className="flex items-center justify-between text-ink-mute text-[12px] mb-1">
                <span>Selected Offers</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-light text-ink tracking-tight tabular-nums">
                12
              </div>
              <div className="text-[11px] text-emerald-600">Avg. 15d notice</div>
            </div>
          </div>

          {/* Table Header Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
                <div className="w-full text-[13px] pl-9 pr-3 py-1.5 rounded-sm border border-hairline-input text-ink-mute bg-canvas">
                  Search candidate or role...
                </div>
              </div>
              <div className="text-[12px] text-ink-mute border border-hairline rounded-sm px-2.5 py-1.5 bg-canvas-soft hidden sm:block">
                Sector 59, Noida
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="btn-primary-pill text-[13px] py-1.5 px-3.5 shadow-sm inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Line-Up (.xlsx)</span>
              </Link>
            </div>
          </div>

          {/* Sample Table Rows */}
          <div className="overflow-x-auto border border-hairline rounded-lg">
            <table className="w-full text-left text-[13px] divide-y divide-hairline">
              <thead className="bg-canvas-soft text-ink-mute font-medium text-[11px] uppercase tracking-wider">
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
                  <td className="py-3 px-3">
                    <div className="font-medium text-ink">Aarav Sharma</div>
                    <div className="text-[11px] text-ink-mute flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      +91 98182 34567 • Noida
                    </div>
                  </td>
                  <td className="py-3 px-3 text-ink">Documentation Specialist</td>
                  <td className="py-3 px-3 text-ink tabular-nums">2.5 Years</td>
                  <td className="py-3 px-3 text-ink tabular-nums">15 Days</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline cursor-pointer">
                      <FileText className="w-3.5 h-3.5" />
                      Google Drive
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary-subdued/60 text-primary-deep border border-primary-subdued">
                      <Clock className="w-3 h-3" />
                      Line-Up Scheduled
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-canvas-soft/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-ink">Pooja Verma</div>
                    <div className="text-[11px] text-ink-mute flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      +91 99104 56789 • Ghaziabad
                    </div>
                  </td>
                  <td className="py-3 px-3 text-ink">Operations Executive</td>
                  <td className="py-3 px-3 text-ink tabular-nums">3.2 Years</td>
                  <td className="py-3 px-3 text-ink tabular-nums">30 Days</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline cursor-pointer">
                      <FileText className="w-3.5 h-3.5" />
                      Google Drive
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      Screening Shortlisted
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-canvas-soft/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-ink">Sneha Mukherjee</div>
                    <div className="text-[11px] text-ink-mute flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      +91 98301 23456 • New Delhi
                    </div>
                  </td>
                  <td className="py-3 px-3 text-ink">Documentation Specialist</td>
                  <td className="py-3 px-3 text-ink tabular-nums">3.0 Years</td>
                  <td className="py-3 px-3 text-ink tabular-nums">15 Days</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline cursor-pointer">
                      <FileText className="w-3.5 h-3.5" />
                      Google Drive
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="w-3 h-3" />
                      Selected
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
