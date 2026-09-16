"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas-soft py-12 text-ink-secondary text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" className="w-6 h-6 rounded-md" />
              <span className="text-base font-semibold text-ink">
                Talent<span className="text-primary font-normal">Flow</span>
              </span>
            </div>
            <p className="text-xs text-ink-mute leading-relaxed font-light">
              High-velocity recruitment line-up engine, date-wise interview calendar, and instant spreadsheet synchronization for HR teams.
            </p>
            <div className="text-[11px] text-ink-mute">
              Internal HR Command • Sector 59, Noida
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
              Line-Up Engine
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Daily Line-Up Roster
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Date-Wise Calendar
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Schedule Interviews
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Manager Export (.xlsx)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
              Recruiter Controls
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Google Sign-In Auth
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Firestore Database Sync
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  WhatsApp &amp; Call Links
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Pipeline Progression
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
              Architecture &amp; Hosting
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Next.js 14 App Router</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Google Firebase Auth &amp; Firestore</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Vercel Zero-Config Deployment</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} TalentFlow HR Command. All rights reserved. Designed with Stripi-inspired visual grammar.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="hover:text-ink transition-colors">
              Recruiter Console
            </Link>
            <span className="text-emerald-600 font-medium">● Firebase Connected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
