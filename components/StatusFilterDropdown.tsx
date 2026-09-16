"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface StatusOption {
  value: string;
  label: string;
  dotColor: string; // Tailwind bg class
  dotHex?: string;
}

export const STAGE_OPTIONS: StatusOption[] = [
  { value: "ALL", label: "All Stages", dotColor: "bg-slate-400", dotHex: "#94a3b8" },
  { value: "New Applied", label: "New Applied", dotColor: "bg-yellow-500", dotHex: "#eab308" },
  { value: "Screening Shortlisted", label: "Screening Shortlisted", dotColor: "bg-blue-600", dotHex: "#2563eb" },
  { value: "Line-Up Scheduled", label: "Line-Up Scheduled", dotColor: "bg-purple-600", dotHex: "#9333ea" },
  { value: "Interview Done", label: "Interview Done", dotColor: "bg-amber-700", dotHex: "#b45309" },
  { value: "Selected", label: "Selected", dotColor: "bg-green-600", dotHex: "#16a34a" },
  { value: "Rejected", label: "Rejected", dotColor: "bg-red-500", dotHex: "#ef4444" },
];

interface StatusFilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function StatusFilterDropdown({
  value,
  onChange,
  className = "",
}: StatusFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption =
    STAGE_OPTIONS.find((opt) => opt.value === value) || STAGE_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-xs px-2.5 py-1.5 rounded-sm border border-hairline-input bg-canvas text-ink hover:bg-canvas-soft flex items-center justify-between gap-2 shadow-xs transition-colors focus:outline-none focus:border-primary"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${currentOption.dotColor}`}
            aria-hidden="true"
          />
          <span className="font-medium text-ink truncate">{currentOption.label}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-ink-mute transition-transform shrink-0 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Floating Menu with Color-Coded Dots per Screenshot 2 */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1 w-52 rounded-md bg-white border border-hairline shadow-level3 py-1 z-50 animate-in fade-in-50 zoom-in-95 duration-100"
        >
          {STAGE_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-ink hover:bg-canvas-soft"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ${opt.dotColor}`}
                    aria-hidden="true"
                  />
                  <span>{opt.label}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
