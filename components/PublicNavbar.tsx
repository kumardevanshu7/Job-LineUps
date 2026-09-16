"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 border-b border-hairline transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[19px] font-semibold tracking-tight text-ink">
              Talent<span className="text-primary font-normal">Flow</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-ink-mute -mt-1 font-medium">
              Recruitment Engine
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[14px] text-ink-secondary">
          <a
            href="#jobs-section"
            className="hover:text-primary transition-colors font-normal"
          >
            Open Vacancies
          </a>
          <a
            href="#workflow-section"
            className="hover:text-primary transition-colors font-normal"
          >
            How It Works
          </a>
          <a
            href="#features-section"
            className="hover:text-primary transition-colors font-normal"
          >
            Excel Line-Up Sync
          </a>
        </nav>

        {/* Right Actions: Recruiter Portal */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="btn-primary-pill text-sm py-2 px-4 inline-flex items-center gap-1.5 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Recruiter Portal</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
          </Link>
        </div>
      </div>
    </header>
  );
}
