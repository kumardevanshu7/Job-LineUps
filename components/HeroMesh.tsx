"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, Zap } from "lucide-react";

export default function HeroMesh() {
  return (
    <section className="relative pt-10 sm:pt-16 pb-12 sm:pb-20 overflow-hidden">
      {/* Organic atmospheric gradient mesh backdrop */}
      <div className="gradient-mesh-bg">
        <div className="gradient-mesh-blob-1" />
        <div className="gradient-mesh-blob-2" />
        <div className="gradient-mesh-blob-3" />
        <div className="gradient-mesh-blob-4" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-4 sm:pt-8">
        {/* Subdued Indigo Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary-subdued/70 text-primary-deep text-[11px] sm:text-[12px] font-medium tracking-wide mb-5 border border-primary-subdued shadow-sm">
          <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">Candidate Line-Up &amp; Interview Command</span>
        </div>

        {/* Editorial Display Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-light leading-[1.08] tracking-display-lg sm:tracking-display-xxl text-ink max-w-4xl mx-auto mb-4 sm:mb-6 px-1">
          The daily recruitment line-up engine for high-velocity teams.
        </h1>

        {/* Marketing Lead Body */}
        <p className="text-sm sm:text-[18px] font-light leading-relaxed text-ink-secondary max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
          Capture candidate details, schedule interview slots on an interactive date-wise calendar, track pipeline stages, and export clean Excel (.xlsx) line-up sheets in one click for manager reviews.
        </p>

        {/* Action Buttons: Full width on mobile, inline on desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 max-w-xs sm:max-w-none mx-auto">
          <Link
            href="/admin"
            className="btn-primary-pill text-sm sm:text-[15px] py-3 px-6 shadow-md inline-flex items-center justify-center gap-2 group w-full sm:w-auto"
          >
            <span>Launch Recruiter Console</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/admin"
            className="btn-secondary-pill text-sm sm:text-[15px] py-3 px-6 inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Calendar className="w-4 h-4 text-primary" />
            <span>Interview Calendar</span>
          </Link>
        </div>

        {/* Value Proposition Micro Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-8 text-xs sm:text-[13px] text-ink-mute font-normal">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Date-Wise Line-Up Calendar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>1-Click Manager Excel (.xlsx) Export</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Google Sign-In Protected</span>
          </div>
        </div>
      </div>
    </section>
  );
}
