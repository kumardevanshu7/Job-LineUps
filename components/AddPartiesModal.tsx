"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  X,
  Shield,
  Trash2,
  Mail,
  UserCheck,
  Search,
  Globe,
  Lock,
  Check,
  Clock,
  ArrowRight,
  Send,
  Sparkles,
  ChevronRight,
  Plus,
  CheckCircle2,
  Crown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  CollaboratorParty,
  PartyPermissions,
  RecruiterProfile,
  Team,
  TeamJoinRequest,
} from "@/lib/types";
import {
  savePartyToFirestore,
  deletePartyFromFirestore,
  saveTeamToFirestore,
  subscribeToMyTeamFromFirestore,
  searchTeamsFromFirestore,
  sendTeamJoinRequestToFirestore,
  subscribeToTeamRequestsFromFirestore,
  updateTeamRequestStatusInFirestore,
} from "@/lib/firebase";
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
  // Navigation tabs: MY_TEAM, SEARCH, REQUESTS
  const [activeTab, setActiveTab] = useState<"MY_TEAM" | "SEARCH" | "REQUESTS">("MY_TEAM");

  // Team state
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [isPublicTeam, setIsPublicTeam] = useState(true);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Team[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sentRequestTeamIds, setSentRequestTeamIds] = useState<Set<string>>(new Set());

  // Requests state
  const [incomingRequests, setIncomingRequests] = useState<TeamJoinRequest[]>([]);

  // Direct Add Party state
  const [showDirectAdd, setShowDirectAdd] = useState(false);
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

  // Current username
  const currentUsername =
    recruiterProfile?.username ||
    (currentUser?.displayName
      ? "@" + currentUser.displayName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9_]/g, "")
      : "@recruiter");

  // Real-time subscription to user's team
  useEffect(() => {
    if (!isOpen || !currentUser) return;
    const unsub = subscribeToMyTeamFromFirestore(currentUser.uid, (team) => {
      setMyTeam(team);
      if (team) {
        setTeamNameInput(team.name);
        setIsPublicTeam(team.isPublic);
      }
    });
    return () => unsub();
  }, [isOpen, currentUser]);

  // Real-time subscription to incoming join requests for this team
  useEffect(() => {
    if (!isOpen || !myTeam) return;
    const unsub = subscribeToTeamRequestsFromFirestore(myTeam.id, (reqs) => {
      setIncomingRequests(reqs);
    });
    return () => unsub();
  }, [isOpen, myTeam]);

  // Live search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchTeamsFromFirestore(searchQuery);
        setSearchResults(res);
      } catch (err) {
        console.warn("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  // Handler: Create or Update Team
  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamNameInput.trim()) {
      toast.error("Please enter a team name.");
      return;
    }
    if (!currentUser) return;

    setIsCreatingTeam(true);
    const teamId = myTeam?.id || `team-${currentUser.uid}`;
    const newTeam: Team = {
      id: teamId,
      name: teamNameInput.trim(),
      ownerUid: currentUser.uid,
      ownerName: recruiterProfile?.name || currentUser.displayName || "Recruiter",
      ownerUsername: currentUsername,
      isPublic: isPublicTeam,
      members: myTeam?.members || parties || [],
      createdAt: myTeam?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveTeamToFirestore(newTeam);
      setMyTeam(newTeam);
      toast.success(myTeam ? "Team settings updated!" : `Team "${newTeam.name}" created successfully!`);
    } catch (err) {
      toast.error("Failed to save team");
    } finally {
      setIsCreatingTeam(false);
    }
  };

  // Handler: Toggle Team Public/Private
  const handleTogglePublic = async () => {
    if (!myTeam) return;
    const updated = !isPublicTeam;
    setIsPublicTeam(updated);
    try {
      await saveTeamToFirestore({
        ...myTeam,
        isPublic: updated,
        updatedAt: new Date().toISOString(),
      });
      toast.success(updated ? "Team is now Public and searchable!" : "Team is now Private.");
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  // Handler: Send Request to Join Team
  const handleSendJoinRequest = async (targetTeam: Team) => {
    if (!currentUser) return;
    const requestId = `req-${Date.now()}-${currentUser.uid.slice(0, 5)}`;
    const req: TeamJoinRequest = {
      id: requestId,
      teamId: targetTeam.id,
      teamName: targetTeam.name,
      ownerUid: targetTeam.ownerUid,
      requesterUid: currentUser.uid,
      requesterName: recruiterProfile?.name || currentUser.displayName || "Recruiter",
      requesterEmail: currentUser.email || "",
      requesterUsername: currentUsername,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    try {
      await sendTeamJoinRequestToFirestore(req);
      setSentRequestTeamIds((prev) => {
        const next = new Set(prev);
        next.add(targetTeam.id);
        return next;
      });
      toast.success(`Join request sent to "${targetTeam.name}"! Waiting for owner's approval.`);
    } catch (err) {
      toast.error("Failed to send join request");
    }
  };

  // Handler: Accept Request
  const handleAcceptRequest = async (req: TeamJoinRequest) => {
    try {
      await updateTeamRequestStatusInFirestore(req.id, "ACCEPTED");

      // Add requester as collaborator party in Firestore
      const newParty: CollaboratorParty = {
        id: `party-${req.requesterUid}-${Date.now()}`,
        name: req.requesterName,
        email: req.requesterEmail,
        role: "Team Collaborator",
        avatarInitial: req.requesterName.trim().charAt(0).toUpperCase() || "C",
        avatarColorId: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        permissions: {
          canEditStatus: true,
          canReschedule: true,
          canEditNotes: true,
          canDelete: false,
          canExport: true,
        },
        createdAt: new Date().toISOString(),
        addedBy: currentUser?.email || "Team Owner",
      };

      await savePartyToFirestore(newParty);

      // Also update team members array
      if (myTeam) {
        const updatedMembers = [...(myTeam.members || []), newParty];
        await saveTeamToFirestore({
          ...myTeam,
          members: updatedMembers,
        });
      }

      onAddLog?.(
        "PARTY_ADDED",
        req.requesterName,
        `Approved join request for ${req.requesterName} (${req.requesterEmail}) to join the team`,
        {
          glowColor: "emerald",
          recruiterEmail: req.requesterEmail,
          recruiterRole: "Team Collaborator",
        }
      );

      onPartyUpdated?.();
      toast.success(`Accepted ${req.requesterName}! They are now an active team member.`);
    } catch (err) {
      toast.error("Failed to accept request");
    }
  };

  // Handler: Decline Request
  const handleDeclineRequest = async (req: TeamJoinRequest) => {
    try {
      await updateTeamRequestStatusInFirestore(req.id, "REJECTED");
      toast.info(`Declined request from ${req.requesterName}.`);
    } catch (err) {
      toast.error("Failed to decline request");
    }
  };

  // Handler: Update Existing Member Permissions
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

      // Update in team object as well
      if (myTeam) {
        const updatedMembers = (myTeam.members || []).map((m) =>
          m.id === party.id ? updatedParty : m
        );
        saveTeamToFirestore({ ...myTeam, members: updatedMembers }).catch(() => {});
      }

      toast.success(
        `Updated ${party.name}'s "${key}" permission to ${
          updatedPermissions[key] ? "Allowed" : "Disabled"
        }`
      );

      onAddLog?.(
        "PERMISSIONS_UPDATED",
        party.name,
        `Updated ${key} to ${updatedPermissions[key] ? "ALLOWED" : "DENIED"} for collaborator ${party.name}`,
        {
          fieldChanged: `Permission: ${key}`,
          previousValue: party.permissions[key] ? "Allowed" : "Denied",
          newValue: updatedPermissions[key] ? "Allowed" : "Denied",
          glowColor: "indigo",
          partyId: party.id,
          recruiterEmail: party.email,
        }
      );

      onPartyUpdated?.();
    } catch (err) {
      toast.error("Failed to update permissions");
    }
  };

  // Handler: Delete Member
  const handleDeleteParty = async (party: CollaboratorParty) => {
    if (!confirm(`Are you sure you want to remove "${party.name}" from your team?`)) return;

    try {
      await deletePartyFromFirestore(party.id);
      if (activeParty?.id === party.id) {
        onSetActiveParty(null);
      }

      if (myTeam) {
        const updatedMembers = (myTeam.members || []).filter((m) => m.id !== party.id);
        saveTeamToFirestore({ ...myTeam, members: updatedMembers }).catch(() => {});
      }

      onAddLog?.(
        "PARTY_REMOVED",
        party.name,
        `Removed collaborator party: ${party.name} (${party.email})`,
        {
          glowColor: "rose",
          recruiterEmail: party.email,
          partyId: party.id,
        }
      );

      toast.success(`Removed ${party.name} from team`);
      onPartyUpdated?.();
    } catch (err) {
      toast.error("Failed to remove party");
    }
  };

  // Handler: Direct Add Party by email
  const handleDirectAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter both Name and Email.");
      return;
    }

    const effectiveRole = role === "Other / Custom Role" ? customRole.trim() || "Collaborator" : role;
    setIsSubmitting(true);

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newParty: CollaboratorParty = {
      id: `party-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: effectiveRole,
      avatarInitial: name.trim().charAt(0).toUpperCase() || "C",
      avatarColorId: randomColor,
      permissions,
      createdAt: new Date().toISOString(),
      addedBy: currentUser?.email || "Team Owner",
    };

    try {
      await savePartyToFirestore(newParty);
      if (myTeam) {
        const updatedMembers = [...(myTeam.members || []), newParty];
        saveTeamToFirestore({ ...myTeam, members: updatedMembers }).catch(() => {});
      }

      onAddLog?.(
        "PARTY_ADDED",
        newParty.name,
        `Added collaborator party: ${newParty.name} (${newParty.email}) with role "${effectiveRole}"`,
        {
          glowColor: "blue",
          recruiterEmail: newParty.email,
          recruiterRole: effectiveRole,
          partyId: newParty.id,
        }
      );

      toast.success(`Added ${newParty.name} to team!`);
      setName("");
      setEmail("");
      setShowDirectAdd(false);
      onPartyUpdated?.();
    } catch (err) {
      toast.error("Failed to add collaborator");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-3xl bg-canvas rounded-t-2xl sm:rounded-2xl border border-hairline shadow-level3 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-canvas-soft border-b border-hairline px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-ink">
                  Team Collaboration &amp; Parties
                </h2>
                {myTeam && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {myTeam.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-ink-mute">
                Connect teams, search by username or team name, manage join requests &amp; assign custom permissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-mute hover:text-ink hover:bg-hairline transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="bg-canvas border-b border-hairline px-4 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {/* Tab 1: My Team */}
          <button
            type="button"
            onClick={() => setActiveTab("MY_TEAM")}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "MY_TEAM"
                ? "border-primary text-primary"
                : "border-transparent text-ink-mute hover:text-ink"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>My Team &amp; Permissions</span>
            {parties.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-canvas-soft border border-hairline text-ink">
                {parties.length}
              </span>
            )}
          </button>

          {/* Tab 2: Google Search Style Team / User Finder */}
          <button
            type="button"
            onClick={() => setActiveTab("SEARCH")}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "SEARCH"
                ? "border-primary text-primary"
                : "border-transparent text-ink-mute hover:text-ink"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Teams &amp; Users</span>
          </button>

          {/* Tab 3: Join Requests */}
          <button
            type="button"
            onClick={() => setActiveTab("REQUESTS")}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "REQUESTS"
                ? "border-primary text-primary"
                : "border-transparent text-ink-mute hover:text-ink"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Join Requests</span>
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: MY TEAM & PERMISSIONS */}
          {activeTab === "MY_TEAM" && (
            <div className="space-y-5">
              {/* Team Setup or Status Card */}
              {!myTeam ? (
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="text-sm font-bold text-ink">Create Your Team</h3>
                      <p className="text-xs text-ink-mute">
                        Create a named team so other recruiters &amp; interviewers can search for you by Team Name or your username ({currentUsername})
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveTeam} className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-ink block mb-1">
                          Team Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Arigato Talent Squad"
                          value={teamNameInput}
                          onChange={(e) => setTeamNameInput(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-ink block mb-1">
                          Your Username (Searchable)
                        </label>
                        <div className="w-full text-xs px-3 py-2.5 rounded-xl border border-hairline bg-canvas-soft text-ink-mute font-mono flex items-center justify-between">
                          <span>{currentUsername}</span>
                          <span className="text-[10px] text-primary font-bold">Owner</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <label className="flex items-start sm:items-center gap-2.5 cursor-pointer select-none flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isPublicTeam}
                          onChange={(e) => setIsPublicTeam(e.target.checked)}
                          className="w-4 h-4 rounded text-primary border-hairline focus:ring-primary mt-0.5 sm:mt-0 shrink-0"
                        />
                        <div className="text-xs text-ink leading-snug">
                          <strong className="block sm:inline font-semibold">Open for Public Search</strong>
                          <span className="text-ink-mute text-[11px] block sm:inline sm:before:content-['\00a0—\00a0']">
                            Anyone can search and send join requests
                          </span>
                        </div>
                      </label>

                      <button
                        type="submit"
                        disabled={isCreatingTeam}
                        className="btn-primary-pill text-xs px-5 py-2.5 inline-flex items-center justify-center gap-1.5 shadow-xs shrink-0 w-full sm:w-auto"
                      >
                        {isCreatingTeam ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                        <span>Create Team</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-canvas-soft border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-ink">{myTeam.name}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                        {myTeam.ownerUsername}
                      </span>
                      <button
                        type="button"
                        onClick={handleTogglePublic}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-colors ${
                          isPublicTeam
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {isPublicTeam ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{isPublicTeam ? "Public Team (Searchable)" : "Private Team"}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-ink-mute">
                      Owner: {myTeam.ownerName} • {parties.length} active collaborator{parties.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowDirectAdd((v) => !v)}
                      className="btn-secondary-pill text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-primary" />
                      <span>{showDirectAdd ? "Close Form" : "+ Direct Add"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Add Collapsible Form */}
              {showDirectAdd && (
                <form onSubmit={handleDirectAddSubmit} className="p-4 rounded-xl bg-canvas border border-primary/30 shadow-level1 space-y-3">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-primary" />
                    <span>Directly Add Collaborator by Email</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Full Name (e.g. Priya Sharma)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-xs px-3 py-2 rounded-lg border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs px-3 py-2 rounded-lg border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                    />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="text-xs px-3 py-2 rounded-lg border border-hairline-input bg-canvas text-ink focus:outline-none focus:border-primary"
                    >
                      {PRESET_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowDirectAdd(false)}
                      className="text-xs text-ink-mute hover:text-ink px-3 py-1.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary-pill text-xs py-1.5 px-4 inline-flex items-center gap-1"
                    >
                      {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Add Member</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Members List with Permissions Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-hairline">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Team Collaborators ({parties.length})</span>
                  </h3>
                  <span className="text-[11px] text-ink-mute">
                    Toggle individual permissions for each collaborator
                  </span>
                </div>

                {parties.length === 0 ? (
                  <div className="text-center py-8 bg-canvas-soft/60 rounded-xl border border-hairline space-y-2">
                    <Users className="w-8 h-8 text-ink-mute mx-auto stroke-1" />
                    <p className="text-xs font-medium text-ink">No collaborators added yet</p>
                    <p className="text-[11px] text-ink-mute max-w-sm mx-auto">
                      Share your team name &ldquo;{myTeam?.name || "TalentFlow"}&rdquo; or username ({currentUsername}) with colleagues so they can search and join, or click <strong>+ Direct Add</strong> above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {parties.map((party) => {
                      const isActive = activeParty?.id === party.id;
                      return (
                        <div
                          key={party.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isActive
                              ? "bg-primary-subdued/20 border-primary/40 shadow-xs"
                              : "bg-canvas border-hairline hover:border-primary/30"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline/60">
                            <div className="flex items-center gap-3 min-w-0">
                              <CursiveAvatar
                                initial={party.avatarInitial || party.name.charAt(0)}
                                colorId={party.avatarColorId || "lavender"}
                                size="md"
                                className="shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-ink truncate">{party.name}</h4>
                                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-canvas-soft border border-hairline text-ink-secondary">
                                    {party.role}
                                  </span>
                                </div>
                                <p className="text-[11px] text-ink-mute truncate flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3" />
                                  <span>{party.email}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {isActive ? (
                                <button
                                  type="button"
                                  onClick={() => onSetActiveParty(null)}
                                  className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-primary text-white flex items-center gap-1 shadow-2xs"
                                  title="Currently operating as this collaborator"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Active Identity</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onSetActiveParty(party)}
                                  className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-canvas-soft hover:bg-primary/10 text-ink-secondary hover:text-primary border border-hairline transition-colors"
                                  title="Switch to work under this collaborator's name"
                                >
                                  Switch To
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteParty(party)}
                                className="p-1.5 rounded-md text-ink-mute hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Remove collaborator"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Permission Toggles */}
                          <div className="pt-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-mute block mb-2">
                              Configured Permissions:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              {[
                                { key: "canEditStatus" as const, label: "Edit Status" },
                                { key: "canReschedule" as const, label: "Reschedule" },
                                { key: "canEditNotes" as const, label: "Edit Notes" },
                                { key: "canDelete" as const, label: "Delete", danger: true },
                                { key: "canExport" as const, label: "Export" },
                              ].map(({ key, label, danger }) => {
                                const allowed = !!party.permissions[key];
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleUpdateExistingPartyPermission(party, key)}
                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border flex items-center justify-between gap-1 transition-all ${
                                      allowed
                                        ? danger
                                          ? "bg-rose-50 text-rose-700 border-rose-200"
                                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-canvas-soft text-ink-mute border-hairline line-through opacity-70"
                                    }`}
                                    title={`Click to ${allowed ? "revoke" : "grant"} permission`}
                                  >
                                    <span>{label}</span>
                                    {allowed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SEARCH STYLE FINDER */}
          {activeTab === "SEARCH" && (
            <div className="space-y-4">
              {/* Google Search Bar Box */}
              <div className="relative">
                <div className="w-full flex items-center bg-canvas border border-hairline-input rounded-2xl shadow-level1 px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <Search className="w-5 h-5 text-primary mr-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Team Name (e.g. Arigato) or Username (e.g. @devanshu)..."
                    className="w-full text-sm bg-transparent text-ink placeholder:text-ink-mute focus:outline-none"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 rounded-full text-ink-mute hover:text-ink hover:bg-canvas-soft"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-ink-mute px-2 pt-1.5">
                  <span>Search public recruitment teams or recruiter handles across the organization</span>
                  {isSearching && (
                    <span className="flex items-center gap-1 text-primary">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Searching...
                    </span>
                  )}
                </div>
              </div>

              {/* Search Results (Google-Style Cards) */}
              <div className="space-y-3 pt-2">
                {searchQuery.trim() === "" ? (
                  <div className="text-center py-12 bg-canvas-soft/40 rounded-2xl border border-hairline space-y-2">
                    <Search className="w-10 h-10 text-primary/40 mx-auto stroke-1" />
                    <h4 className="text-sm font-bold text-ink">Find Teams &amp; Recruiters</h4>
                    <p className="text-xs text-ink-mute max-w-sm mx-auto">
                      Type any part of a team name or recruiter username above to discover public teams and request to join.
                    </p>
                  </div>
                ) : searchResults.length === 0 && !isSearching ? (
                  <div className="text-center py-10 bg-canvas-soft/40 rounded-2xl border border-hairline space-y-2">
                    <p className="text-sm font-semibold text-ink">No teams found matching &ldquo;{searchQuery}&rdquo;</p>
                    <p className="text-xs text-ink-mute">
                      Make sure the team owner has enabled <strong>Open for Public Search</strong> or check spelling.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-[11px] font-semibold text-ink-mute uppercase tracking-wider block">
                      Search Results ({searchResults.length}):
                    </span>

                    {searchResults.map((team) => {
                      const isOwnTeam = currentUser && team.ownerUid === currentUser.uid;
                      const hasSent = sentRequestTeamIds.has(team.id);
                      const isAlreadyMember =
                        currentUser &&
                        (team.members || []).some((m) => m.email.toLowerCase() === currentUser.email?.toLowerCase());

                      return (
                        <div
                          key={team.id}
                          className="p-4 rounded-xl bg-canvas border border-hairline hover:border-primary/40 transition-all shadow-level1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-ink group-hover:text-primary transition-colors">
                                {team.name}
                              </h4>
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                                {team.ownerUsername}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                                <Globe className="w-2.5 h-2.5" />
                                Public
                              </span>
                            </div>

                            <p className="text-xs text-ink-mute">
                              Created by {team.ownerName} • {(team.members || []).length} member{(team.members || []).length === 1 ? "" : "s"}
                            </p>
                          </div>

                          <div className="shrink-0 self-end sm:self-center">
                            {isOwnTeam ? (
                              <span className="text-xs font-bold text-primary px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 inline-flex items-center gap-1">
                                <Crown className="w-3.5 h-3.5" />
                                Your Team
                              </span>
                            ) : isAlreadyMember ? (
                              <span className="text-xs font-bold text-emerald-700 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Joined
                              </span>
                            ) : hasSent ? (
                              <span className="text-xs font-semibold text-amber-700 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Request Pending
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSendJoinRequest(team)}
                                className="btn-primary-pill text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5 shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Send Request</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: INCOMING JOIN REQUESTS */}
          {activeTab === "REQUESTS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-hairline">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Incoming Join Requests ({incomingRequests.length})</span>
                </h3>
                <span className="text-[11px] text-ink-mute">
                  Recruiters requesting to join your team
                </span>
              </div>

              {incomingRequests.length === 0 ? (
                <div className="text-center py-10 bg-canvas-soft/40 rounded-2xl border border-hairline space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-semibold text-ink">All caught up!</p>
                  <p className="text-[11px] text-ink-mute">
                    No pending join requests for your team at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-canvas border border-amber-200/80 shadow-level1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-ink">{req.requesterName}</h4>
                          {req.requesterUsername && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-canvas-soft text-ink-mute">
                              {req.requesterUsername}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-mute flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{req.requesterEmail}</span>
                        </p>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-block mt-1">
                          Requested to join &ldquo;{req.teamName}&rdquo;
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(req)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(req)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-canvas-soft border-t border-hairline px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-ink-mute safe-bottom">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Changes persist live in Cloud Firestore</span>
          </div>
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
