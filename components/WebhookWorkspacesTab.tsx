"use client";

import React, { useState } from "react";
import {
  Workflow,
  Plus,
  ArrowLeft,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Briefcase,
  ShieldAlert,
  Info,
  Layers,
  Clock,
  ChevronRight,
  Settings2,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  WebhookWorkspace,
  WEBHOOK_WORKSPACE_COLORS,
  WebhookWorkspaceColor,
} from "@/lib/types";
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from "@/lib/webhook";
import CreateWebhookModal from "./CreateWebhookModal";

interface WebhookWorkspacesTabProps {
  workspaces: WebhookWorkspace[];
  onSaveWorkspace: (workspace: WebhookWorkspace) => Promise<void>;
  onDeleteWorkspace: (workspaceId: string) => Promise<void>;
  availableRoles: string[];
  currentRecruiterUid?: string;
  initialSelectedId?: string | null;
}

export default function WebhookWorkspacesTab({
  workspaces,
  onSaveWorkspace,
  onDeleteWorkspace,
  availableRoles,
  currentRecruiterUid,
  initialSelectedId,
}: WebhookWorkspacesTabProps) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    initialSelectedId || null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Selected workspace editing state
  const [urlInput, setUrlInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [roleInput, setRoleInput] = useState("ALL");
  const [colorIdInput, setColorIdInput] = useState("lavender");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Get active workspace object
  const activeWs = workspaces.find((w) => w.id === selectedWorkspaceId);

  // When active workspace changes, populate local inputs
  React.useEffect(() => {
    if (activeWs) {
      setUrlInput(activeWs.webhookUrl || "");
      setNameInput(activeWs.name || "");
      setRoleInput(activeWs.targetRole || "ALL");
      setColorIdInput(activeWs.colorId || "lavender");
    }
  }, [activeWs]);

  const getColorConfig = (colorId?: string): WebhookWorkspaceColor => {
    return (
      WEBHOOK_WORKSPACE_COLORS.find((c) => c.id === colorId) ||
      WEBHOOK_WORKSPACE_COLORS[0]
    );
  };

  const handleCreated = async (newWs: WebhookWorkspace) => {
    try {
      await onSaveWorkspace(newWs);
      setSelectedWorkspaceId(newWs.id);
      toast.success(`Created workspace "${newWs.name}"! Now paste your sheet Web App URL.`);
    } catch (e) {
      toast.error("Failed to create workspace");
    }
  };

  const handleSaveActiveWorkspace = async () => {
    if (!activeWs) return;
    const trimmedUrl = urlInput.trim();
    if (trimmedUrl && !trimmedUrl.startsWith("http")) {
      toast.error("Invalid URL. It must start with https://script.google.com/...");
      return;
    }

    setIsSaving(true);
    try {
      const updated: WebhookWorkspace = {
        ...activeWs,
        name: nameInput.trim() || activeWs.name,
        targetRole: roleInput,
        colorId: colorIdInput,
        webhookUrl: trimmedUrl || undefined,
        updatedAt: new Date().toISOString(),
      };
      await onSaveWorkspace(updated);
      toast.success(`Saved settings for "${updated.name}"!`);
    } catch (e) {
      toast.error("Failed to save workspace");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPing = async (wsToTest?: WebhookWorkspace) => {
    const ws = wsToTest || activeWs;
    const targetUrl = wsToTest ? wsToTest.webhookUrl : urlInput.trim();

    if (!targetUrl || !targetUrl.startsWith("http")) {
      toast.error("Please enter a valid Google Apps Script Web App URL first.");
      return;
    }

    setIsTesting(true);
    try {
      const res = await fetch("/api/webhook/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: targetUrl }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Webhook test ping passed! Test row added to sheet.");
        if (ws) {
          await onSaveWorkspace({
            ...ws,
            lastPingStatus: "success",
            lastSyncedAt: new Date().toISOString(),
          });
        }
      } else {
        toast.error(data.error || "Failed to ping Webhook.");
        if (ws) {
          await onSaveWorkspace({
            ...ws,
            lastPingStatus: "error",
          });
        }
      }
    } catch (e) {
      toast.error("Webhook test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleActive = async (ws: WebhookWorkspace, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = { ...ws, active: !ws.active, updatedAt: new Date().toISOString() };
      await onSaveWorkspace(updated);
      toast.info(updated.active ? `"${ws.name}" activated` : `"${ws.name}" paused`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (ws: WebhookWorkspace) => {
    if (confirm(`Are you sure you want to delete workspace "${ws.name}"?`)) {
      try {
        await onDeleteWorkspace(ws.id);
        if (selectedWorkspaceId === ws.id) {
          setSelectedWorkspaceId(null);
        }
        toast.success(`Deleted workspace "${ws.name}"`);
      } catch (e) {
        toast.error("Failed to delete workspace");
      }
    }
  };

  const copyAppsScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    toast.success("Copied Apps Script code!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // ==========================================
  // VIEW 1: WORKSPACE DETAIL / CONFIGURATION VIEW
  // ==========================================
  if (selectedWorkspaceId && activeWs) {
    const currentColor = getColorConfig(colorIdInput);

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setSelectedWorkspaceId(null)}
            className="btn-secondary-pill text-xs py-2 px-3.5 inline-flex items-center gap-2 hover:bg-canvas-soft transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-ink-secondary" />
            <span>Back to All Workspaces</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5"
              style={{
                backgroundColor: `${currentColor.hex}18`,
                borderColor: `${currentColor.hex}40`,
                color: currentColor.hex,
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: currentColor.hex }}
              />
              <span>{currentColor.name}</span>
            </span>

            <button
              onClick={() => handleDelete(activeWs)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-mute hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete workspace"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Title Card */}
        <div
          className="bg-canvas border rounded-2xl p-5 sm:p-6 shadow-level1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
          style={{ borderColor: `${currentColor.hex}35` }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${currentColor.glowClass}`}
              style={{
                backgroundColor: `${currentColor.hex}20`,
                color: currentColor.hex,
              }}
            >
              <Workflow className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-ink">
                  {nameInput || activeWs.name}
                </h2>
                <span
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${currentColor.hex}25`,
                    color: currentColor.hex,
                  }}
                >
                  {roleInput === "ALL" ? "All Candidate Roles" : roleInput}
                </span>
              </div>
              <p className="text-xs text-ink-mute mt-0.5">
                Target Google Sheet URL &amp; Live Sync Controls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="btn-secondary-pill text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
            >
              <span>Apps Script Code</span>
              <ExternalLink className="w-3.5 h-3.5 text-ink-mute" />
            </button>
          </div>
        </div>

        {/* Card 1: URL & Testing */}
        <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: currentColor.hex }}
              >
                <Workflow className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Google Apps Script Web App URL
                </h3>
                <p className="text-[11px] text-ink-mute">
                  Paste the deployment link from your connected Google Sheet
                </p>
              </div>
            </div>

            {activeWs.webhookUrl ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected &amp; Live</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-mute px-2.5 py-1 rounded-full bg-canvas-soft border border-hairline">
                ○ Not Connected
              </span>
            )}
          </div>

          {/* Notice for 403 Forbidden prevention */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-[12px] space-y-1">
              <p className="font-bold text-amber-950">
                Crucial Deployment Step (Prevents Error 403 Forbidden):
              </p>
              <p className="text-amber-900 font-medium leading-relaxed">
                In Google Apps Script deployment settings, set{" "}
                <strong className="font-bold text-amber-950 underline decoration-amber-500 underline-offset-2">
                  &quot;Who has access&quot;
                </strong>{" "}
                to{" "}
                <strong className="font-bold text-amber-950 underline decoration-amber-500 underline-offset-2">
                  &quot;Anyone&quot;
                </strong>
                . If set to &quot;Only myself&quot;, Google blocks incoming sync pings.
              </p>
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-ink block">
              Web App URL (ends with /exec):
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-hairline-input bg-canvas text-ink font-mono focus:outline-none focus:border-primary shadow-2xs"
            />
            {urlInput.trim() !== (activeWs.webhookUrl || "").trim() && (
              <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 pt-0.5">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>Unsaved URL — click &quot;Save Webhook URL&quot; below to apply changes.</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 flex-wrap pt-2">
            <button
              type="button"
              disabled={isTesting}
              onClick={() => handleTestPing()}
              className="btn-secondary-pill text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              {isTesting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-primary" />
              )}
              <span>Test Webhook Ping</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveActiveWorkspace}
              className="btn-primary-pill text-xs py-2 px-5 inline-flex items-center gap-1.5 shadow-xs"
              style={{
                backgroundColor: currentColor.hex,
                borderColor: currentColor.hex,
              }}
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Webhook URL</span>
            </button>
          </div>
        </div>

        {/* Card 2: Workspace Customization (Name, Role, Colors) */}
        <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-hairline">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Workspace Routing &amp; Color Customization
              </h3>
              <p className="text-[11px] text-ink-mute">
                Adjust the name, target role stream, or glow color theme
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rename */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink block">
                Workspace Name:
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
              />
            </div>

            {/* Target Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink block">
                Role Stream Filter:
              </label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="ALL">All Candidate Roles (Master Stream)</option>
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 10 Glowing Light Colors Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Change Glowing Light Color (10 Themes):</span>
              </span>
              <span className="text-[11px] font-bold" style={{ color: currentColor.hex }}>
                {currentColor.name}
              </span>
            </label>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {WEBHOOK_WORKSPACE_COLORS.map((color) => {
                const isSelected = colorIdInput === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setColorIdInput(color.id)}
                    className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? "border-2 scale-110 shadow-sm"
                        : "border-hairline hover:opacity-100 opacity-70"
                    }`}
                    style={{
                      borderColor: isSelected ? color.hex : undefined,
                      backgroundColor: isSelected ? `${color.hex}18` : undefined,
                    }}
                    title={color.name}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isSelected ? color.glowClass : ""
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveActiveWorkspace}
              disabled={isSaving}
              className="btn-primary-pill text-xs py-2 px-5 inline-flex items-center gap-1.5 shadow-xs"
              style={{
                backgroundColor: currentColor.hex,
                borderColor: currentColor.hex,
              }}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Workspace Settings</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Apps Script Modal */}
        {isGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-canvas border border-hairline rounded-2xl shadow-level3 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="px-5 py-4 border-b border-hairline flex items-center justify-between bg-canvas-soft shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Workflow className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-ink">
                      Google Apps Script Webhook Code
                    </h3>
                    <p className="text-[11px] text-ink-mute">
                      Copy-paste this into your Google Sheet to enable live sync &amp; auto-styling
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGuideOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-mute hover:text-ink hover:bg-canvas"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs text-ink">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">
                    Apps Script Template Code:
                  </span>
                  <button
                    onClick={copyAppsScript}
                    className="btn-primary-pill text-[11px] py-1 px-3 inline-flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
                  {GOOGLE_APPS_SCRIPT_TEMPLATE}
                </pre>

                <div className="p-3 rounded-xl bg-canvas-soft border border-hairline space-y-1.5 text-[11px]">
                  <p className="font-semibold text-ink">Next Steps in Google Sheet:</p>
                  <ol className="list-decimal list-inside space-y-1 text-ink-mute">
                    <li>Open your Google Sheet ➔ <strong>Extensions</strong> ➔ <strong>Apps Script</strong>.</li>
                    <li>Paste this code and save (Ctrl+S).</li>
                    <li>Click <strong>Deploy</strong> ➔ <strong>New deployment</strong> ➔ <strong>Web app</strong>.</li>
                    <li>Set <strong>&quot;Who has access&quot;</strong> to <strong>&quot;Anyone&quot;</strong>.</li>
                    <li>Click Deploy, copy the URL, and paste it into this workspace!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ALL WORKSPACES GRID LIST
  // ==========================================
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-canvas border border-hairline rounded-2xl p-5 sm:p-6 shadow-level1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Workflow className="w-3.5 h-3.5" />
            <span>Google Sheets Integration Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-ink">
            Webhook Workspaces
          </h2>
          <p className="text-xs sm:text-sm text-ink-mute mt-0.5 font-light">
            Stream candidates into multiple Google Sheets with custom glowing themes and role routing.
          </p>
        </div>

        {/* CTA: Create New Webhook Workspace */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary-pill text-xs sm:text-sm py-2.5 px-4.5 inline-flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Webhook Workspace</span>
        </button>
      </div>

      {/* Workspaces List Grid */}
      {workspaces.length === 0 ? (
        <div className="bg-canvas border border-dashed border-hairline rounded-2xl p-8 sm:p-12 text-center shadow-level1 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Workflow className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-ink">
            No Webhook Workspaces configured yet
          </h3>
          <p className="text-xs text-ink-mute max-w-md mx-auto font-light">
            Create your first workspace to connect Google Sheets for specific roles, teams, or master applicant streams.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary-pill text-xs py-2 px-4 inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Webhook Workspace</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {workspaces.map((ws) => {
            const color = getColorConfig(ws.colorId);
            const isConnected = !!ws.webhookUrl && ws.webhookUrl.startsWith("http");

            return (
              <div
                key={ws.id}
                onClick={() => setSelectedWorkspaceId(ws.id)}
                className="bg-canvas border border-hairline rounded-2xl p-5 shadow-level1 hover:shadow-level2 transition-all cursor-pointer group flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Accent Top Border Bar with Glow */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-all"
                  style={{ backgroundColor: color.hex }}
                />

                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${color.glowClass}`}
                        style={{
                          backgroundColor: `${color.hex}18`,
                          color: color.hex,
                        }}
                      >
                        <Workflow className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-ink truncate group-hover:text-primary transition-colors">
                          {ws.name}
                        </h3>
                        <p className="text-[11px] text-ink-mute flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-ink-mute shrink-0" />
                          <span className="truncate">
                            {ws.targetRole === "ALL" ? "All Candidate Roles" : ws.targetRole}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Active Toggle */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleActive(ws, e)}
                      className="text-ink-mute hover:text-ink shrink-0 p-1"
                      title={ws.active ? "Click to Pause" : "Click to Activate"}
                    >
                      {ws.active ? (
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
                          style={{
                            backgroundColor: color.hex,
                            boxShadow: `0 0 8px ${color.hex}`,
                          }}
                        />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full inline-block bg-slate-300 dark:bg-slate-700" />
                      )}
                    </button>
                  </div>

                  {/* Status & Preview */}
                  <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {isConnected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Connected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-ink-mute bg-canvas-soft px-2 py-0.5 rounded-full border border-hairline">
                          <span>URL not set</span>
                        </span>
                      )}
                    </div>

                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${color.hex}18`,
                        color: color.hex,
                      }}
                    >
                      {color.name}
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-primary font-medium group-hover:underline inline-flex items-center gap-1">
                    <span>Configure &amp; Test</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestPing(ws);
                    }}
                    className="btn-secondary-pill text-[10px] py-1 px-2.5 inline-flex items-center gap-1"
                  >
                    <Send className="w-2.5 h-2.5 text-primary" />
                    <span>Test Ping</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      <CreateWebhookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
        availableRoles={availableRoles}
        currentRecruiterUid={currentRecruiterUid}
      />
    </div>
  );
}
