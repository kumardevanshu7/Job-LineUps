"use client";

import React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Workflow,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
} from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="workflow-section" className="py-20 bg-canvas-soft border-y border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture &amp; Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light tracking-display-lg text-ink mb-4">
            How TalentFlow eliminates 3 hours of daily manual line-up entry.
          </h2>
          <p className="text-base text-ink-secondary leading-relaxed font-light">
            Recruiting teams lose countless hours copy-pasting candidate rows between emails and spreadsheets. TalentFlow connects intake directly into live spreadsheets.
          </p>
        </div>

        {/* 3 Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 rounded-xl bg-canvas border border-hairline shadow-level1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-5">
              01
            </div>
            <h3 className="text-lg font-medium text-ink mb-2">
              Clean, Validated Intake
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Job seekers submit clean, verified details (10-digit mobile, experience bracket, notice days, and resume cloud links) with zero sign-up friction.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-canvas border border-hairline shadow-level1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-5">
              02
            </div>
            <h3 className="text-lg font-medium text-ink mb-2">
              Centralized Line-Up Queue
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Recruiters instantly see applicants in a live dashboard. Filter by role, screen candidate credentials, update status badges, and schedule interviews.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-canvas border border-hairline shadow-level1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-5">
              03
            </div>
            <h3 className="text-lg font-medium text-ink mb-2">
              Native Excel &amp; Cloud Sync
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Generate formatted corporate Line-Up sheets (.xlsx) in one click or automatically stream entries straight to Google Sheets via serverless webhooks.
            </p>
          </div>
        </div>

        {/* Warm Canvas Cream Band Interlude per stripe-DESIGN.md */}
        <div
          id="features-section"
          className="rounded-2xl bg-canvas-cream border border-[#eedfbe] p-8 sm:p-12 shadow-level1"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-[#ebd8b3] text-[#714d18] text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3 h-3" />
                <span>Enterprise Line-Up Delivery</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-light tracking-display-md text-ink mb-3">
                Ready for client presentations &amp; leadership reviews.
              </h3>
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed mb-6 font-light">
                TalentFlow exports structured, styled Excel line-ups with candidate IDs, phone numbers, verified notice periods, interview schedules, and recruiter notes formatted with clean column widths and enterprise ATS conventions.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-medium text-ink-secondary">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-primary" />
                  Native SheetJS (.xlsx) Engine
                </span>
                <span className="flex items-center gap-1.5">
                  <Workflow className="w-4 h-4 text-primary" />
                  Google Apps Script Webhook
                </span>
                <span className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-primary" />
                  Postgres &amp; Vercel Ready
                </span>
              </div>
            </div>

            <div className="shrink-0 w-full lg:w-auto">
              <Link
                href="/admin"
                className="btn-primary-pill text-sm px-6 py-3 shadow-md w-full lg:w-auto text-center inline-flex items-center justify-center gap-2"
              >
                <span>Launch Recruiter Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
