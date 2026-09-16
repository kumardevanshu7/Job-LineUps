"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 border-b border-hairline transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <BrandLogo size="md" className="group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[17px] sm:text-[19px] font-semibold tracking-tight text-ink">
              Talent<span className="text-primary font-normal">Flow</span>
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-ink-mute -mt-0.5 font-medium hidden xs:block">
              HR Line-Up Command
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[14px] text-ink-secondary">
          <Link
            href="/admin"
            className="hover:text-primary transition-colors font-normal"
          >
            Line-Up Console
          </Link>
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
            Manager Excel Export
          </a>
        </nav>

        {/* Right Actions: Recruiter Portal */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin"
            className="btn-primary-pill text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 inline-flex items-center gap-1.5 shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Recruiter Portal</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-80 hidden xs:inline" />
          </Link>
        </div>
      </div>
    </header>
  );
}
