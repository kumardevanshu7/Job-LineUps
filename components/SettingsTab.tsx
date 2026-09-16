"use client";

import React, { useState } from "react";
import {
  Shield,
  Download,
  Lock,
  KeyRound,
  Workflow,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Save,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { CandidateItem, RecruiterProfile, AppSettings, ActivityLogItem } from "@/lib/types";
import CursiveAvatar from "./CursiveAvatar";

interface SettingsTabProps {
  candidates: CandidateItem[];
  recruiterProfile: RecruiterProfile | null;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => Promise<void>;
  onOpenProfileModal: () => void;
  logs: ActivityLogItem[];
}

export default function SettingsTab({
  candidates,
  recruiterProfile,
  settings,
  onUpdateSettings,
  onOpenProfileModal,
  logs,
}: SettingsTabProps) {
  const [currentPin, setCurrentPin] = useState(settings.securityPin || "1234");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinEnabled, setPinEnabled] = useState(settings.pinProtectionEnabled);
  const [customWebhookUrl, setCustomWebhookUrl] = useState(
    settings.webhookUrl || ""
  );

  const [testingWebhook, setTestingWebhook] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // 1-Click JSON Data Export
  const handleExportJson = () => {
    try {
      const backupData = {
        app: "TalentFlow Recruitment Engine",
        version: "2.0",
        exportedAt: new Date().toISOString(),
        totalCandidates: candidates.length,
        recruiter: recruiterProfile,
        candidates: candidates,
        activityLogs: logs,
        settings: {
          pinProtectionEnabled: pinEnabled,
        },
      };

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `TalentFlow_Backup_${dateStr}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success("Database exported to JSON successfully!");
    } catch (err) {
      toast.error("Failed to generate JSON backup");
    }
  };

  // Save PIN Changes
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin) {
      if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        toast.error("PIN must be exactly 4 numeric digits.");
        return;
      }
      if (newPin !== confirmPin) {
        toast.error("New PIN and confirmation PIN do not match.");
        return;
      }
    }

    setSavingSettings(true);
    try {
      const updatedPin = newPin || currentPin;
      await onUpdateSettings({
        ...settings,
        securityPin: updatedPin,
        pinProtectionEnabled: pinEnabled,
        webhookUrl: customWebhookUrl.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
      setCurrentPin(updatedPin);
      setNewPin("");
      setConfirmPin("");
      toast.success("Security settings updated successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // Test Webhook
  const handleTestWebhook = async () => {
    if (!customWebhookUrl && !process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL) {
      toast.error("Please enter a Google Sheets Webhook URL first.");
      return;
    }

    setTestingWebhook(true);
    try {
      const res = await fetch("/api/webhook/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: customWebhookUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Webhook test passed! Test row appended.");
      } else {
        toast.error(data.error || "Failed to reach Webhook.");
      }
    } catch (err) {
      toast.error("Webhook test failed");
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Portal Administration</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-ink">
            Recruiter Settings &amp; Security Controls
          </h2>
          <p className="text-xs sm:text-sm text-ink-mute mt-0.5 font-light">
            Manage your Security PIN, export all candidate data to JSON, and configure live webhooks.
          </p>
        </div>

        {/* 1-Click JSON Export CTA */}
        <button
          onClick={handleExportJson}
          className="btn-primary-pill text-xs sm:text-sm py-2 px-4 inline-flex items-center gap-2 shadow-sm shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download All Data (.json)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Security PIN Manager */}
        <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-hairline">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Recruiter Action Password / Security PIN
              </h3>
              <p className="text-[11px] text-ink-mute">
                Required when changing status or deleting candidate records.
              </p>
            </div>
          </div>

          {/* Toggle PIN Protection */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-canvas-soft border border-hairline">
            <div>
              <span className="text-xs font-semibold text-ink block">
                PIN Verification Guard
              </span>
              <span className="text-[11px] text-ink-mute block">
                Prompt PIN for status change and deletions
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pinEnabled}
                onChange={(e) => setPinEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <form onSubmit={handleSavePin} className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-medium text-ink block mb-1">
                Active Security PIN:
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-3 py-1.5 rounded-lg border border-hairline bg-canvas-soft font-bold text-ink">
                  {currentPin}
                </span>
                <span className="text-[11px] text-ink-mute">(Default: 1234)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-ink-mute block mb-1">
                  New 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 5678"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-hairline-input bg-canvas text-ink font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] text-ink-mute block mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 5678"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-hairline-input bg-canvas text-ink font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full btn-primary-pill text-xs py-2 mt-2 inline-flex items-center justify-center gap-1.5 shadow-xs"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating PIN...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Security Settings</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Box 2: JSON Database Export & Stats */}
        <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-hairline">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">
                JSON Data Extraction
              </h3>
              <p className="text-[11px] text-ink-mute">
                Complete portal database backup for offline archiving.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-canvas-soft border border-hairline text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-ink-mute">Total Candidate Records:</span>
              <span className="font-bold text-ink tabular-nums text-sm">
                {candidates.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-mute">Total Activity Log Entries:</span>
              <span className="font-bold text-ink tabular-nums text-sm">
                {logs.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-mute">Database Format:</span>
              <span className="font-mono text-primary font-medium">JSON (UTF-8)</span>
            </div>
          </div>

          <p className="text-xs text-ink-secondary leading-relaxed font-light">
            Clicking the export button compiles all applicant information, schedule history, interview notes, and decision justifications into a standardized JSON file suitable for corporate audits.
          </p>

          <button
            onClick={handleExportJson}
            className="w-full btn-secondary-pill text-xs py-2.5 inline-flex items-center justify-center gap-1.5 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download TalentFlow_Backup.json</span>
          </button>
        </div>

        {/* Box 3: Google Sheets Webhook Configuration */}
        <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-hairline">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Google Sheets Live Webhook
              </h3>
              <p className="text-[11px] text-ink-mute">
                Automatically push candidate submissions to Google Sheets.
              </p>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-ink-mute block mb-1">
              Google Apps Script Web App URL:
            </label>
            <input
              type="text"
              value={customWebhookUrl}
              onChange={(e) => setCustomWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full text-xs px-3 py-2 rounded-lg border border-hairline-input bg-canvas text-ink font-mono focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={testingWebhook}
              onClick={handleTestWebhook}
              className="btn-secondary-pill text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
            >
              {testingWebhook ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-primary" />
              )}
              <span>Test Webhook Ping</span>
            </button>
          </div>
        </div>

        {/* Box 4: Recruiter Identity & Custom Logo Shortcut */}
        <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-hairline">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Recruiter Profile &amp; Custom Cursive Logo
              </h3>
              <p className="text-[11px] text-ink-mute">
                Customize your initials monogram and pastel logo theme.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-canvas-soft border border-hairline">
            <CursiveAvatar
              initial={recruiterProfile?.avatarInitial || "K"}
              colorId={recruiterProfile?.avatarColorId || "lavender"}
              size="md"
              className="rounded-xl shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink truncate">
                {recruiterProfile?.name || "Recruiter"}
              </p>
              <p className="text-[11px] text-ink-mute truncate">
                {recruiterProfile?.position || "Recruitment Lead"} • {recruiterProfile?.company || "TalentFlow HR"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProfileModal}
            className="w-full btn-secondary-pill text-xs py-2 inline-flex items-center justify-center gap-1.5"
          >
            <span>Change Cursive Logo Monogram &amp; Colors →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
