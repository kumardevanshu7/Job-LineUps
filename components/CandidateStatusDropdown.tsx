"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { CandidateStatus } from "@/lib/types";

export interface StatusStyleMeta {
  label: string;
  dotColor: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
}

export const STATUS_META_MAP: Record<string, StatusStyleMeta> = {
  "New Applied": {
    label: "New Applied",
    dotColor: "bg-yellow-500",
    pillBg: "bg-yellow-50",
    pillText: "text-yellow-700",
    pillBorder: "border-yellow-300",
  },
  "Screening Shortlisted": {
    label: "Screening Shortlisted",
    dotColor: "bg-blue-600",
    pillBg: "bg-blue-50",
    pillText: "text-blue-700",
    pillBorder: "border-blue-200",
  },
  "Line-Up Scheduled": {
    label: "Line-Up Scheduled",
    dotColor: "bg-purple-600",
    pillBg: "bg-purple-50",
    pillText: "text-purple-700",
    pillBorder: "border-purple-200",
  },
  "Interview Done": {
    label: "Interview Done",
    dotColor: "bg-amber-700",
    pillBg: "bg-amber-50",
    pillText: "text-amber-800",
    pillBorder: "border-amber-300",
  },
  Selected: {
    label: "Selected",
    dotColor: "bg-green-600",
    pillBg: "bg-green-50",
    pillText: "text-green-700",
    pillBorder: "border-green-200",
  },
  Rejected: {
    label: "Rejected",
    dotColor: "bg-red-500",
    pillBg: "bg-red-50",
    pillText: "text-red-700",
    pillBorder: "border-red-200",
  },
};


export const STATUS_LIST: CandidateStatus[] = [
  "New Applied",
  "Screening Shortlisted",
  "Line-Up Scheduled",
  "Interview Done",
  "Selected",
  "Rejected",
];

interface CandidateStatusDropdownProps {
  currentStatus: string;
  onSelectStatus?: (newStatus: string) => void;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function CandidateStatusDropdown({
  currentStatus,
  onSelectStatus,
  onStatusChange,
  className = "",
  disabled = false,
}: CandidateStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const meta = STATUS_META_MAP[currentStatus] || STATUS_META_MAP["New Applied"];

  const handleSelect = (newStatus: string) => {
    if (onStatusChange) onStatusChange(newStatus);
    if (onSelectStatus) onSelectStatus(newStatus);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldOpenUpwards = spaceBelow < 240;

      const left = Math.max(8, Math.min(rect.left, window.innerWidth - 208));
      if (shouldOpenUpwards) {
        setCoords({
          bottom: window.innerHeight - rect.top + 6,
          left,
        });
      } else {
        setCoords({
          top: rect.bottom + 6,
          left,
        });
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Click outside or scroll to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    function handleScrollOrResize() {
      setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Pill trigger */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center justify-between gap-1.5 shadow-2xs transition-all focus:outline-none shrink-0 ${
          meta.pillBg
        } ${meta.pillText} ${meta.pillBorder} ${
          disabled ? "opacity-60 cursor-not-allowed" : "hover:brightness-95 cursor-pointer active:scale-95"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dotColor}`} />
          <span className="truncate">{meta.label}</span>
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Menu via Portal to prevent any container clipping */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: "fixed",
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className="w-48 rounded-xl bg-white border border-hairline shadow-level3 py-1.5 animate-in fade-in-50 zoom-in-95 duration-100"
          >
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-mute border-b border-hairline mb-1">
              Pipeline Stage
            </div>
            {STATUS_LIST.map((status) => {
              const itemMeta = STATUS_META_MAP[status] || STATUS_META_MAP["New Applied"];
              const isSelected = status === currentStatus;
              return (
                <button
                  key={status}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setIsOpen(false);
                    if (status !== currentStatus) {
                      handleSelect(status);
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-ink hover:bg-canvas-soft"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${itemMeta.dotColor}`} />
                    <span>{itemMeta.label}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
