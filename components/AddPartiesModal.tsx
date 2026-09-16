"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  X,
  Shield,
  Trash2,
  Mail,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { CollaboratorParty, PartyPermissions, RecruiterProfile } from "@/lib/types";
import { savePartyToFirestore, deletePartyFromFirestore } from "@/lib/firebase";
import CursiveAvatar from "./CursiveAvatar";
import { User } from "firebase/auth";

interface AddPartiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: CollaboratorParty[];
  currentUser: User | null;
  recruiterProfile: RecruiterProfile | null;
  activeParty: CollaboratorParty | null;
  onSetActiveParty: (party: CollaboratorParty | null) => void;
  onPartyUpdated?: () => void;
  onAddLog?: (
    action:
      | "STATUS_CHANGE"
      | "RESCHEDULE"
      | "CANDIDATE_ADDED"
      | "CANDIDATE_DELETED"
      | "NOTES_UPDATED"
      | "REJECTION_REASON_SAVED"
      | "SETTINGS_UPDATED"
      | "PARTY_ADDED"
      | "PARTY_REMOVED"
      | "PERMISSIONS_UPDATED",
    candidateName: string,
    details: string,
    extra?: any
  ) => void;
}

const PRESET_ROLES = [
  "Hiring Manager",
  "Technical Interviewer",
  "HR Coordinator",
  "Recruitment Lead",
  "Operations Lead",
  "Department Head",
  "External Evaluator",
];

const AVATAR_COLORS = [
  "lavender",
  "sky",
  "mint",
  "peach",
  "rose",
  "lemon",
  "cream",
  "periwinkle",
  "teal",
  "coral",
];

export default function AddPartiesModal({
  isOpen,
  onClose,
  parties,
  currentUser,
  recruiterProfile,
  activeParty,
  onSetActiveParty,
  onPartyUpdated,
  onAddLog,
}: AddPartiesModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(PRESET_ROLES[0]);
  const [customRole, setCustomRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Granular Permissions for New Party
  const [permissions, setPermissions] = useState<PartyPermissions>({
    canEditStatus: true,
    canReschedule: true,
    canEditNotes: true,
    canDelete: false,
    canExport: true,
  });

  if (!isOpen) return null;

  const handleTogglePermission = (key: keyof PartyPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateExistingPartyPermission = async (
    party: CollaboratorParty,
    key: keyof PartyPermissions
  ) => {
    const updatedPermissions = {
      ...party.permissions,
      [key]: !party.permissions[key],
    };
    const updatedParty: CollaboratorParty = {
      ...party,
      permissions: updatedPermissions,
    };

    try {
      await savePartyToFirestore(updatedParty);
      toast.success(
        `Updated ${party.name}'s "${key}" permission to ${
          updatedPermissions[key] ? "Allowed" : "Disabled"
        }`
      );
      onPartyUpdated?.();
      onAddLog?.(
        "PERMISSIONS_UPDATED",
        party.name,
        `Permissions for ${party.name} (${party.email}) updated: ${key} = ${
          updatedPermissions[key] ? "Allowed" : "Disabled"
        }`,
        {
          glowColor: "indigo",
          recruiterEmail: currentUser?.email || "admin@talentflow.in",
          recruiterName: recruiterProfile?.name || currentUser?.displayName || "Admin Recruiter",
        }
      );
    } catch (e) {
      toast.error("Failed to update party permission");
    }
  };

  const handleAddParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter collaborator party name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid collaborator email address");
      return;
    }

    const assignedRole = role === "Other" && customRole.trim() ? customRole.trim() : role;
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newParty: CollaboratorParty = {
      id: `party-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: assignedRole,
      avatarInitial: name.trim().charAt(0).toUpperCase(),
      avatarColorId: randomColor,
      permissions: { ...permissions },
      createdAt: new Date().toISOString(),
      addedBy: currentUser?.email || recruiterProfile?.name || "Admin Recruiter",
    };

    setIsSubmitting(true);
    try {
      await savePartyToFirestore(newParty);
      toast.success(`Team party "${newParty.name}" added successfully!`);

      onAddLog?.(
        "PARTY_ADDED",
        newParty.name,
        `New collaborator party added: ${newParty.name} (${newParty.email}) as ${newParty.role}`,
        {
          glowColor: "emerald",
          recruiterEmail: currentUser?.email || "admin@talentflow.in",
          recruiterName: recruiterProfile?.name || currentUser?.displayName || "Admin Recruiter",
        }
      );

      // Reset form
      setName("");
      setEmail("");
      setRole(PRESET_ROLES[0]);
      setCustomRole("");
      setPermissions({
        canEditStatus: true,
        canReschedule: true,
        canEditNotes: true,
        canDelete: false,
        canExport: true,
      });

      onPartyUpdated?.();
    } catch (err) {
      toast.error("Failed to save party to Firestore");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteParty = async (party: CollaboratorParty) => {
    if (
      !confirm(
        `Are you sure you want to remove collaborator "${party.name}" (${party.email})?`
      )
    ) {
      return;
    }

    try {
      await deletePartyFromFirestore(party.id);
      if (activeParty?.id === party.id) {
        onSetActiveParty(null);
      }
      toast.info(`Removed collaborator "${party.name}"`);
      onAddLog?.(
        "PARTY_REMOVED",
        party.name,
        `Collaborator party removed: ${party.name} (${party.email})`,
        {
          glowColor: "rose",
          recruiterEmail: currentUser?.email || "admin@talentflow.in",
          recruiterName: recruiterProfile?.name || currentUser?.displayName || "Admin Recruiter",
        }
      );
      onPartyUpdated?.();
    } catch (e) {
      toast.error("Failed to remove collaborator party");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-canvas rounded-2xl border border-hairline shadow-level3 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline bg-canvas-soft">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-subdued/80 border border-primary/20 flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink leading-tight flex items-center gap-2">
                <span>Team Collaboration & Party Permissions</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {parties.length} Parties Active
                </span>
              </h2>
              <p className="text-xs text-ink-mute">
                Add team members and set custom permission toggles for candidate edits
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-mute hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-ink">
          {/* Working Identity Switcher Notification */}
          <div className="p-3 rounded-xl bg-canvas-soft border border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-ink">Active Operating Identity: </span>
                <span className="text-ink-secondary">
                  {activeParty
                    ? `${activeParty.name} (${activeParty.email}) — ${activeParty.role}`
                    : `${recruiterProfile?.name || currentUser?.displayName || "Primary Recruiter"} (${
                        currentUser?.email || "Admin"
                      })`}
                </span>
              </div>
            </div>
            {activeParty && (
              <button
                type="button"
                onClick={() => onSetActiveParty(null)}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Reset to Primary Admin
              </button>
            )}
          </div>

          {/* FORM: ADD NEW PARTY */}
          <form
            onSubmit={handleAddParty}
            className="p-4 rounded-xl border border-hairline bg-canvas space-y-4 shadow-2xs"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider">
              <UserPlus className="w-3.5 h-3.5 text-primary" />
              <span>1. Add New Collaborator Party</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-ink block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-hairline bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-ink block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. priya.sharma@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-hairline bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-ink block mb-1">
                  Role / Title
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-hairline bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {PRESET_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="Other">Other (Specify below)</option>
                </select>
              </div>

              {role === "Other" && (
                <div>
                  <label className="text-[11px] font-medium text-ink block mb-1">
                    Custom Role Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VP of Operations"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-hairline bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}
            </div>

            {/* Granular Permission Toggles */}
            <div className="pt-2 border-t border-hairline space-y-2">
              <label className="text-[11px] font-semibold text-ink flex items-center justify-between">
                <span>Configure Permissions for this Party:</span>
                <span className="text-[10px] text-ink-mute font-normal">
                  Toggle on/off as needed
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Status Toggle */}
                <label className="flex items-center justify-between p-2 rounded-lg border border-hairline bg-canvas-soft hover:bg-canvas transition-colors cursor-pointer">
                  <span className="text-[11px] font-medium text-ink">
                    Allow Pipeline Status Changes
                  </span>
                  <input
                    type="checkbox"
                    checked={permissions.canEditStatus}
                    onChange={() => handleTogglePermission("canEditStatus")}
                    className="w-4 h-4 text-primary rounded border-hairline focus:ring-primary"
                  />
                </label>

                {/* Reschedule Toggle */}
                <label className="flex items-center justify-between p-2 rounded-lg border border-hairline bg-canvas-soft hover:bg-canvas transition-colors cursor-pointer">
                  <span className="text-[11px] font-medium text-ink">
                    Allow Interview Rescheduling
                  </span>
                  <input
                    type="checkbox"
                    checked={permissions.canReschedule}
                    onChange={() => handleTogglePermission("canReschedule")}
                    className="w-4 h-4 text-primary rounded border-hairline focus:ring-primary"
                  />
                </label>

                {/* Notes Toggle */}
                <label className="flex items-center justify-between p-2 rounded-lg border border-hairline bg-canvas-soft hover:bg-canvas transition-colors cursor-pointer">
                  <span className="text-[11px] font-medium text-ink">
                    Allow Notes & Feedback Edits
                  </span>
                  <input
                    type="checkbox"
                    checked={permissions.canEditNotes}
                    onChange={() => handleTogglePermission("canEditNotes")}
                    className="w-4 h-4 text-primary rounded border-hairline focus:ring-primary"
                  />
                </label>

                {/* Delete Toggle */}
                <label className="flex items-center justify-between p-2 rounded-lg border border-hairline bg-canvas-soft hover:bg-canvas transition-colors cursor-pointer">
                  <span className="text-[11px] font-medium text-rose-700">
                    Allow Candidate Deletion
                  </span>
                  <input
                    type="checkbox"
                    checked={permissions.canDelete}
                    onChange={() => handleTogglePermission("canDelete")}
                    className="w-4 h-4 text-rose-600 rounded border-hairline focus:ring-rose-500"
                  />
                </label>

                {/* Export Toggle */}
                <label className="flex items-center justify-between p-2 rounded-lg border border-hairline bg-canvas-soft hover:bg-canvas transition-colors cursor-pointer sm:col-span-2">
                  <span className="text-[11px] font-medium text-ink">
                    Allow Candidate Export (.xlsx / JSON)
                  </span>
                  <input
                    type="checkbox"
                    checked={permissions.canExport}
                    onChange={() => handleTogglePermission("canExport")}
                    className="w-4 h-4 text-primary rounded border-hairline focus:ring-primary"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary-pill text-xs py-2 flex items-center justify-center gap-1.5 shadow-2xs font-semibold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Adding Party..." : "Add Party to Team"}</span>
            </button>
          </form>

          {/* LIST OF EXISTING PARTIES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>2. Existing Team Collaborators ({parties.length})</span>
              </span>
              <span className="text-[10px] text-ink-mute">
                Changes persist live in Cloud Firestore
              </span>
            </div>

            {parties.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-xl border border-dashed border-hairline bg-canvas-soft">
                <Users className="w-8 h-8 text-ink-mute mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-ink">No Collaborator Parties Added</p>
                <p className="text-[11px] text-ink-mute mt-0.5">
                  Add team members above so they can review candidates and record feedback
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {parties.map((p) => {
                  const isCurrentActive = activeParty?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrentActive
                          ? "bg-primary-subdued/30 border-primary shadow-xs ring-1 ring-primary/40"
                          : "bg-canvas border-hairline hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <CursiveAvatar
                            initial={p.avatarInitial || p.name.charAt(0)}
                            colorId={p.avatarColorId || "lavender"}
                            size="md"
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-ink truncate">
                                {p.name}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {p.role}
                              </span>
                              {isCurrentActive && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Active Identity
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-ink-secondary truncate flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-ink-mute" />
                              <span>{p.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              onSetActiveParty(isCurrentActive ? null : p)
                            }
                            className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                              isCurrentActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : "bg-canvas-soft hover:bg-canvas text-ink border-hairline"
                            }`}
                            title="Operate as this user so edits are stamped with their name & email"
                          >
                            {isCurrentActive ? "Active" : "Switch To"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteParty(p)}
                            className="p-1.5 rounded-lg text-ink-mute hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove collaborator"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Interactive Permission Toggles for this existing party */}
                      <div className="mt-3 pt-2.5 border-t border-hairline flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-ink-mute mr-1">
                          Permissions:
                        </span>

                        {/* Status Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateExistingPartyPermission(p, "canEditStatus")
                          }
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 transition-all ${
                            p.permissions.canEditStatus
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-400 border-slate-200 line-through"
                          }`}
                          title="Click to toggle status change permission"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>Status Change</span>
                        </button>

                        {/* Reschedule Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateExistingPartyPermission(p, "canReschedule")
                          }
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 transition-all ${
                            p.permissions.canReschedule
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-100 text-slate-400 border-slate-200 line-through"
                          }`}
                          title="Click to toggle reschedule permission"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>Reschedule</span>
                        </button>

                        {/* Notes Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateExistingPartyPermission(p, "canEditNotes")
                          }
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 transition-all ${
                            p.permissions.canEditNotes
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-slate-100 text-slate-400 border-slate-200 line-through"
                          }`}
                          title="Click to toggle notes permission"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>Notes & Feedback</span>
                        </button>

                        {/* Delete Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateExistingPartyPermission(p, "canDelete")
                          }
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 transition-all ${
                            p.permissions.canDelete
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-slate-100 text-slate-400 border-slate-200 line-through"
                          }`}
                          title="Click to toggle delete permission"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>Delete</span>
                        </button>

                        {/* Export Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateExistingPartyPermission(p, "canExport")
                          }
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 transition-all ${
                            p.permissions.canExport
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-400 border-slate-200 line-through"
                          }`}
                          title="Click to toggle export permission"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>Export</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 bg-canvas-soft border-t border-hairline px-5 py-3 flex items-center justify-between">
          <span className="text-[11px] text-ink-mute flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Every edit by a party is recorded in Activity Logs</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary-pill text-xs py-1.5 px-4"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
