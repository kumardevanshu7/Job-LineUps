"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Workflow,
  Check,
  Briefcase,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  WebhookWorkspace,
  WEBHOOK_WORKSPACE_COLORS,
} from "@/lib/types";

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (workspace: WebhookWorkspace) => void;
  availableRoles: string[];
  currentRecruiterUid?: string;
}

export default function CreateWebhookModal({
  isOpen,
  onClose,
  onCreated,
  availableRoles,
  currentRecruiterUid,
}: CreateWebhookModalProps) {
  const [name, setName] = useState("");
  const [selectedColorId, setSelectedColorId] = useState("lavender");
  const [targetRole, setTargetRole] = useState("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const selectedColor =
    WEBHOOK_WORKSPACE_COLORS.find((c) => c.id === selectedColorId) ||
    WEBHOOK_WORKSPACE_COLORS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter a name for this Webhook Workspace.");
      return;
    }

    setIsSubmitting(true);
    const newWs: WebhookWorkspace = {
      id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      recruiterUid: currentRecruiterUid || "system",
      name: name.trim(),
      colorId: selectedColorId,
      targetRole: targetRole === "ALL" ? "ALL" : targetRole,
      webhookUrl: "",
      active: true,
      totalSyncs: 0,
      lastPingStatus: "untested",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreated(newWs);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-canvas border border-hairline rounded-2xl shadow-level3 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-hairline flex items-center justify-between bg-canvas-soft shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${selectedColor.glowClass}`}
              style={{ backgroundColor: `${selectedColor.hex}18`, color: selectedColor.hex }}
            >
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-ink flex items-center gap-2">
                <span>Create Webhook Workspace</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{
                    backgroundColor: `${selectedColor.hex}20`,
                    color: selectedColor.hex,
                  }}
                >
                  {selectedColor.name}
                </span>
              </h3>
              <p className="text-[11px] text-ink-mute">
                Connect a dedicated Google Sheet with custom colors &amp; role filters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-mute hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          {/* 1. Workspace Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink block">
              Workspace / Sheet Name: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Documentation Specialist Sheet, Tech Hiring, Master Roster"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary shadow-2xs"
            />
            <p className="text-[11px] text-ink-mute">
              Give your workspace a recognizable name for your team.
            </p>
          </div>

          {/* 2. Target Role Routing */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink flex items-center justify-between">
              <span>Candidate Role Routing:</span>
              <span className="text-[10px] text-ink-mute font-normal">
                Which applicants sync here?
              </span>
            </label>
            <div className="relative">
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary appearance-none pr-8 cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Candidate Roles (Master Stream)</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    Only &quot;{role}&quot; candidates
                  </option>
                ))}
              </select>
              <Briefcase className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none" />
            </div>
            <p className="text-[11px] text-ink-mute">
              {targetRole === "ALL"
                ? "Every candidate applied or added will automatically stream to this sheet."
                : `Only applicants applying for "${targetRole}" will sync to this sheet.`}
            </p>
          </div>

          {/* 3. 10 Glowing Light Colors */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Choose Glowing Light Color (10 Themes):</span>
              </span>
              <span
                className="text-[11px] font-bold"
                style={{ color: selectedColor.hex }}
              >
                {selectedColor.name}
              </span>
            </label>

            <div className="grid grid-cols-5 gap-2.5 pt-1">
              {WEBHOOK_WORKSPACE_COLORS.map((color) => {
                const isSelected = selectedColorId === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColorId(color.id)}
                    className={`relative p-2 rounded-xl border transition-all flex flex-col items-center gap-1.5 group ${
                      isSelected
                        ? "border-2 scale-105 shadow-sm"
                        : "border-hairline hover:border-slate-300 dark:hover:border-slate-600 opacity-80 hover:opacity-100"
                    }`}
                    style={{
                      borderColor: isSelected ? color.hex : undefined,
                      backgroundColor: isSelected ? `${color.hex}14` : undefined,
                    }}
                  >
                    {/* Color Halo Dot */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                        isSelected ? color.glowClass : ""
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>

                    <span className="text-[10px] font-medium text-ink truncate w-full text-center">
                      {color.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Pill */}
          <div
            className="p-3 rounded-xl border flex items-center justify-between transition-all"
            style={{
              backgroundColor: `${selectedColor.hex}10`,
              borderColor: `${selectedColor.hex}40`,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: selectedColor.hex,
                  boxShadow: `0 0 10px ${selectedColor.hex}`,
                }}
              />
              <span className="text-xs font-semibold text-ink">
                {name.trim() || "Workspace Preview"}
              </span>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${selectedColor.hex}25`,
                color: selectedColor.hex,
              }}
            >
              {targetRole === "ALL" ? "All Roles" : targetRole}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-pill text-xs py-2 px-4"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="text-xs py-2 px-4 rounded-full font-semibold text-white transition-all shadow-md inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
              style={{
                backgroundColor: selectedColor.hex,
                boxShadow: `0 0 18px ${selectedColor.hex}40`,
              }}
            >
              <span>Done &amp; Open Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
