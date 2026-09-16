"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-canvas border-t border-hairline pt-16 pb-12 text-ink-mute text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-semibold text-ink">
                Talent<span className="text-primary font-normal">Flow</span>
              </span>
            </div>
            <p className="text-xs text-ink-mute leading-relaxed font-light">
              High-efficiency candidate intake, live recruiter line-up management, and instant spreadsheet synchronization.
            </p>
            <div className="text-[11px] text-ink-mute">
              Operational Hub: Sector 59, Noida, UP, India
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
              Open Positions
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#jobs-section" className="hover:text-primary transition-colors">
                  Documentation Specialist
                </a>
              </li>
              <li>
                <a href="#jobs-section" className="hover:text-primary transition-colors">
                  Operations Executive
                </a>
              </li>
              <li>
                <a href="#jobs-section" className="hover:text-primary transition-colors">
                  HR Trainee
                </a>
              </li>
              <li>
                <a href="#jobs-section" className="hover:text-primary transition-colors">
                  All Open Roles
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
              Recruiter Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Live Line-Up Dashboard
                </Link>
              </li>
              <li>
                <a href="/api/export-lineup" className="hover:text-primary transition-colors">
                  Export Line-Up (.xlsx)
                </a>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Google Sheets Webhook Sync
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Pipeline Stage Progression
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
                <span>Vercel Zero-Config Deployment</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Prisma ORM &amp; SheetJS Engine</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} TalentFlow Inc. All rights reserved. Designed with Stripi-inspired visual grammar.
          </div>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-ink transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-ink transition-colors">
              Terms of Service
            </a>
            <a href="#security" className="hover:text-ink transition-colors">
              Enterprise Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
