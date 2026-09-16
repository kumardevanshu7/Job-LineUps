"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  UserCheck,
  Building2,
  Briefcase,
  Calendar,
  X,
  Check,
  Loader2,
  Palette,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { User } from "firebase/auth";
import { RecruiterProfile } from "@/lib/types";
import {
  ALPHABETS,
  LIGHT_COLORS,
  getColorOption,
} from "@/lib/avatar-constants";
import CursiveAvatar from "./CursiveAvatar";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  existingProfile?: RecruiterProfile | null;
  onSaveProfile: (profile: RecruiterProfile) => void;
}

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
];

export default function OnboardingModal({
  isOpen,
  onClose,
  currentUser,
  existingProfile,
  onSaveProfile,
}: OnboardingModalProps) {
  // Default values
  const defaultInitial = currentUser?.displayName
    ? currentUser.displayName.trim().charAt(0).toUpperCase()
    : "K";

  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("Male");
  const [company, setCompany] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [avatarInitial, setAvatarInitial] = useState<string>(defaultInitial);
  const [avatarColorId, setAvatarColorId] = useState<string>("lavender");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync with current user or existing profile
  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name || currentUser?.displayName || "");
      setAge(existingProfile.age ? String(existingProfile.age) : "");
      setGender(existingProfile.gender || "Male");
      setCompany(existingProfile.company || "");
      setPosition(existingProfile.position || "");
      setAvatarInitial(existingProfile.avatarInitial || defaultInitial);
      setAvatarColorId(existingProfile.avatarColorId || "lavender");
    } else if (currentUser) {
      setName(currentUser.displayName || "");
      setCompany("Arigato Labs");
      setPosition("Talent Acquisition Specialist");
      setAvatarInitial(defaultInitial);
      setAvatarColorId("lavender");
    }
  }, [existingProfile, currentUser, defaultInitial]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!company.trim()) {
      setErrorMsg("Please enter where you work (Company or Organization).");
      return;
    }

    if (!position.trim()) {
      setErrorMsg("Please enter your position / job title.");
      return;
    }

    setLoading(true);

    const profile: RecruiterProfile = {
      uid: currentUser?.uid || "guest_recruiter",
      name: name.trim(),
      age: age ? parseInt(age) : null,
      gender,
      company: company.trim(),
      position: position.trim(),
      avatarInitial: avatarInitial.toUpperCase(),
      avatarColorId,
      completedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSaveProfile(profile);
      toast.success("Profile & Cursive Logo Avatar saved successfully!");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedColor = getColorOption(avatarColorId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-canvas rounded-t-2xl sm:rounded-xl border border-hairline shadow-level3 overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-canvas-soft border-b border-hairline px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-ink">
                {existingProfile?.completedOnboarding
                  ? "Edit Recruiter Profile & Avatar"
                  : "Welcome! Complete Your Recruiter Profile"}
              </h2>
              <p className="text-[11px] sm:text-xs text-ink-mute">
                Personalize your recruiter identity &amp; design your custom cursive logo
              </p>
            </div>
          </div>

          {existingProfile?.completedOnboarding && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-ink-mute hover:text-ink hover:bg-hairline transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span>{errorMsg}</span>
              </div>
            )}

            {/* LIVE PREVIEW HERO CARD */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-canvas-soft to-primary-subdued/20 border border-hairline shadow-level1 flex flex-col sm:flex-row items-center gap-4">
              <div className="shrink-0 flex items-center justify-center">
                <CursiveAvatar
                  initial={avatarInitial}
                  colorId={avatarColorId}
                  size="xl"
                  title="Your Cursive Initial Logo"
                />
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 mb-1">
                  <Palette className="w-3 h-3" />
                  <span>Your Live Recruiter Badge</span>
                </div>
                <h3 className="text-base font-semibold text-ink truncate">
                  {name || "Your Name"}
                </h3>
                <p className="text-xs text-ink-secondary truncate">
                  {position || "Your Position"} • {company || "Your Company"}
                </p>
                <p className="text-[11px] text-ink-mute mt-0.5">
                  Initial &ldquo;{avatarInitial}&rdquo; in {selectedColor.name}
                </p>
              </div>
            </div>

            {/* SECTION 1: PERSONAL & PROFESSIONAL DETAILS */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <UserCheck className="w-4 h-4" />
                <span>1. Personal &amp; Professional Info</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kumar Devanshu"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (e.target.value.trim() && !existingProfile?.avatarInitial) {
                        setAvatarInitial(e.target.value.trim().charAt(0).toUpperCase());
                      }
                    }}
                    className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={100}
                    placeholder="e.g. 26"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink tabular-nums"
                  />
                </div>

                {/* Gender */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-ink-secondary mb-1.5">
                    Gender
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENDER_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all ${
                          gender === g
                            ? "bg-primary text-white shadow-sm"
                            : "bg-canvas-soft border border-hairline text-ink-secondary hover:border-primary"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Where You Work (Company) */}
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span>Where You Work (Company / Hub) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arigato Labs / Sector 59"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  />
                </div>

                {/* Position / Job Title */}
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    <span>Position / Role *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Talent Acquisition Lead"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 rounded-md border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: 26 CURSIVE ALPHABETS SELECTION */}
            <div className="pt-2 border-t border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>2. Choose Your Cursive Logo Initial (26 Alphabets)</span>
                </div>
                <span className="text-[11px] font-cursive text-primary font-bold text-base">
                  Selected: {avatarInitial}
                </span>
              </div>

              <div className="grid grid-cols-7 sm:grid-cols-13 gap-1.5">
                {ALPHABETS.map((letter) => {
                  const isSelected = avatarInitial === letter;
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setAvatarInitial(letter)}
                      className={`h-10 rounded-lg flex items-center justify-center font-cursive font-bold text-xl transition-all ${
                        isSelected
                          ? "bg-primary text-white shadow-md ring-2 ring-primary/40 scale-105"
                          : "bg-canvas-soft border border-hairline text-ink hover:border-primary hover:bg-canvas"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: 10 LIGHT COLORS PALETTE */}
            <div className="pt-2 border-t border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  <Palette className="w-4 h-4" />
                  <span>3. Choose Light Palette Color (10 Light Options)</span>
                </div>
                <span className="text-xs font-medium text-ink-secondary">
                  {selectedColor.name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {LIGHT_COLORS.map((col) => {
                  const isSelected = avatarColorId === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setAvatarColorId(col.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        col.bg
                      } ${col.border} ${
                        isSelected
                          ? "ring-2 ring-primary shadow-sm scale-[1.02]"
                          : "hover:shadow-xs"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-cursive font-bold text-sm ${col.text} border ${col.border} bg-white/70 shrink-0`}
                      >
                        {avatarInitial}
                      </div>

                      <div className="min-w-0">
                        <div className={`text-xs font-semibold truncate ${col.text}`}>
                          {col.name.replace("Light ", "")}
                        </div>
                        <div className="text-[10px] text-ink-mute">
                          {isSelected ? "Selected" : "Light tint"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 bg-canvas-soft border-t border-hairline px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-end gap-2.5 safe-bottom">
            {existingProfile?.completedOnboarding && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm text-ink-mute hover:text-ink transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-pill text-xs sm:text-sm px-6 py-2.5 inline-flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Profile &amp; Cursive Logo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
