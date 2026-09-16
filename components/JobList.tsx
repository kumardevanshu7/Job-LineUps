"use client";

import React, { useState } from "react";
import {
  MapPin,
  Clock,
  Briefcase,
  Search,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { JobItem } from "@/lib/types";

interface JobListProps {
  jobs: JobItem[];
  onApplyClick: (job: JobItem) => void;
}

export default function JobList({ jobs, onApplyClick }: JobListProps) {
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const departments = [
    { key: "ALL", label: "All Open Roles" },
    { key: "Operations & Compliance", label: "Operations & Compliance" },
    { key: "Supply Chain & Fulfilment", label: "Supply Chain" },
    { key: "People Operations & TA", label: "People & HR" },
  ];

  const filteredJobs = jobs.filter((job) => {
    if (selectedDept !== "ALL" && job.department !== selectedDept) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchDept = job.department.toLowerCase().includes(q);
      const matchLoc = job.location.toLowerCase().includes(q);
      if (!matchTitle && !matchDept && !matchLoc) return false;
    }
    return true;
  });

  return (
    <section id="jobs-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-hairline gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Openings</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light tracking-display-lg text-ink">
            Current Vacancies at Sector 59, Noida
          </h2>
          <p className="text-sm sm:text-base font-light text-ink-secondary mt-1">
            Fast-track your application directly into the hiring manager&apos;s daily line-up.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input
            type="text"
            placeholder="Search roles or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm pl-9 pr-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {departments.map((dept) => (
          <button
            key={dept.key}
            onClick={() => setSelectedDept(dept.key)}
            className={`px-4 py-1.5 rounded-pill text-xs sm:text-sm font-medium transition-all ${
              selectedDept === dept.key
                ? "bg-brand-dark text-white shadow-sm"
                : "bg-canvas-soft border border-hairline text-ink-secondary hover:border-ink-mute"
            }`}
          >
            {dept.label}
          </button>
        ))}
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="group rounded-xl border border-hairline bg-canvas p-6 shadow-level1 hover:shadow-level2 hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Top Pill */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-pill text-[11px] font-medium bg-primary-subdued/50 text-primary-deep border border-primary-subdued">
                  {job.department}
                </span>
                <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-pill tabular-nums">
                  {job.salaryRange}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-medium text-ink group-hover:text-primary transition-colors mb-2">
                {job.title}
              </h3>

              {/* Location & Experience Meta */}
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-ink-mute mb-4 pb-4 border-b border-hairline">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span className="tabular-nums">{job.experienceBracket}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  <span>{job.type}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-5">
                {job.description}
              </p>

              {/* Requirements checklist */}
              <div className="space-y-2 mb-6">
                <div className="text-[11px] uppercase tracking-wider text-ink-mute font-semibold">
                  Key Qualifications:
                </div>
                {job.requirements.slice(0, 3).map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-ink-secondary leading-snug"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-4 border-t border-hairline">
              <button
                onClick={() => onApplyClick(job)}
                className="w-full btn-primary-pill text-sm py-2.5 inline-flex items-center justify-center gap-2 group-hover:bg-primary-deep shadow-sm"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-16 bg-canvas-soft rounded-xl border border-hairline">
          <p className="text-base text-ink-mute">
            No matching openings found for your search filter.
          </p>
          <button
            onClick={() => {
              setSelectedDept("ALL");
              setSearchQuery("");
            }}
            className="mt-3 text-sm text-primary hover:underline font-medium"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
