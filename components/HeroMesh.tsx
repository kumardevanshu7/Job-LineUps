"use client";

import React from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, CheckCircle2, FileSpreadsheet, Zap } from "lucide-react";

export default function HeroMesh() {
  return (
    <section className="relative pt-16 pb-20 overflow-hidden">
      {/* Organic atmospheric gradient mesh backdrop */}
      <div className="gradient-mesh-bg">
        <div className="gradient-mesh-blob-1" />
        <div className="gradient-mesh-blob-2" />
        <div className="gradient-mesh-blob-3" />
        <div className="gradient-mesh-blob-4" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        {/* Subdued Indigo Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-primary-subdued/70 text-primary-deep text-[12px] font-medium tracking-wide mb-6 border border-primary-subdued shadow-sm">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span>Real-time Candidate Intake &amp; Live Line-Up Automation</span>
        </div>

        {/* Editorial Display Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-light leading-[1.04] tracking-display-xxl text-ink max-w-4xl mx-auto mb-6">
          The high-velocity recruitment pipeline for ambitious teams.
        </h1>

        {/* Marketing Lead Body */}
        <p className="text-lg sm:text-[19px] font-light leading-relaxed text-ink-secondary max-w-2xl mx-auto mb-10">
          Apply in under 60 seconds with zero friction. Candidate submissions
          instantly stream into a centralized recruiter command center with
          one-click Excel (.xlsx) line-up export and Google Sheets sync.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <a
            href="#jobs-section"
            className="btn-primary-pill text-[15px] px-6 py-3 shadow-md inline-flex items-center gap-2 group"
          >
            <span>Explore Open Roles</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </a>

          <Link
            href="/admin"
            className="btn-secondary-pill text-[15px] px-6 py-3 inline-flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            <span>Recruiter Line-Up</span>
            <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
        </div>

        {/* Value Proposition Micro Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[13px] text-ink-mute font-normal">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Sector 59, Noida Vacancies</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Direct Excel (.xlsx) Line-Up Export</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Zero Sign-Up Walls for Candidates</span>
          </div>
        </div>
      </div>
    </section>
  );
}
