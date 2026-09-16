"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Briefcase,
  ExternalLink,
  MapPin,
  Clock,
  Loader2,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { JobItem } from "@/lib/types";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob: JobItem | null;
  allJobs: JobItem[];
}

export default function ApplyModal({
  isOpen,
  onClose,
  selectedJob,
  allJobs,
}: ApplyModalProps) {
  const [role, setRole] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState("1.0");
  const [noticePeriodDays, setNoticePeriodDays] = useState("15");
  const [currentCtc, setCurrentCtc] = useState("");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedCandidate, setSubmittedCandidate] = useState<{
    id: string;
    fullName: string;
    appliedRole: string;
  } | null>(null);

  // Sync role when modal opens with a selected job
  React.useEffect(() => {
    if (selectedJob) {
      setRole(selectedJob.title);
    } else if (allJobs.length > 0 && !role) {
      setRole(allJobs[0].title);
    }
  }, [selectedJob, allJobs, role]);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setErrorMsg("");
    setSubmittedCandidate(null);
    onClose();
  };

  const copyRefId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Application Reference ID copied to clipboard!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Basic Validations
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Please enter your full legal name.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!location.trim()) {
      setErrorMsg("Please enter your current city or location.");
      return;
    }

    if (!resumeUrl.trim() || !resumeUrl.startsWith("http")) {
      setErrorMsg("Please provide a valid resume link (Google Drive, Dropbox, or OneDrive URL).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: email.trim(),
          location: location.trim(),
          appliedRole: role || (selectedJob ? selectedJob.title : "Documentation Specialist"),
          experienceYears: parseFloat(experienceYears) || 0,
          noticePeriodDays: parseInt(noticePeriodDays) || 0,
          currentCtc: currentCtc.trim() || null,
          expectedCtc: expectedCtc.trim() || null,
          resumeUrl: resumeUrl.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmittedCandidate(data.candidate);
      toast.success("Application submitted successfully! Candidate synced to active line-up.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-canvas rounded-xl border border-hairline shadow-level3 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-canvas-soft border-b border-hairline px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">
                {submittedCandidate ? "Application Confirmed" : "Fast-Track Job Application"}
              </h2>
              <p className="text-xs text-ink-mute">
                {submittedCandidate
                  ? "Your record is active in today's recruitment queue"
                  : "Submit your profile directly to the recruitment team"}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1 rounded-md text-ink-mute hover:text-ink hover:bg-hairline/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {submittedCandidate ? (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-medium text-ink mb-2">
                Application Received, {submittedCandidate.fullName}!
              </h3>
              <p className="text-sm text-ink-secondary max-w-md mx-auto mb-6">
                Your profile for <span className="font-semibold text-primary">{submittedCandidate.appliedRole}</span> has been logged and immediately synced to the recruiter line-up tracker.
              </p>

              {/* Reference ID Card */}
              <div className="bg-canvas-soft border border-hairline rounded-lg p-4 max-w-sm mx-auto mb-6">
                <div className="text-xs text-ink-mute uppercase tracking-wider mb-1">
                  Candidate Reference ID
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-mono font-bold text-ink tracking-wide tabular-nums">
                    {submittedCandidate.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyRefId(submittedCandidate.id)}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                    title="Copy Reference ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="btn-primary-pill text-sm px-6 py-2.5 w-full sm:w-auto"
                >
                  Done &amp; Close
                </button>
                <a
                  href="/admin"
                  className="btn-secondary-pill text-sm px-6 py-2.5 w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
                >
                  <span>View in Recruiter Line-Up</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Applying For Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  required
                >
                  {allJobs.map((j) => (
                    <option key={j.id} value={j.title}>
                      {j.title} ({j.department} • {j.experienceBracket})
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9812345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink tabular-nums"
                  />
                </div>
              </div>

              {/* Contact & City Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    Current City / Location *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-ink-mute absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sector 62, Noida"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full text-sm pl-8 pr-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                    />
                  </div>
                </div>
              </div>

              {/* Experience & Notice Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    Total Experience (Years) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="40"
                    required
                    placeholder="e.g. 2.5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    Notice Period (Days) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    required
                    placeholder="e.g. 15 (0 for immediate)"
                    value={noticePeriodDays}
                    onChange={(e) => setNoticePeriodDays(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink tabular-nums"
                  />
                </div>
              </div>

              {/* CTC Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    Current CTC (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹5,50,000 LPA"
                    value={currentCtc}
                    onChange={(e) => setCurrentCtc(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    Expected CTC (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹7,00,000 LPA"
                    value={expectedCtc}
                    onChange={(e) => setExpectedCtc(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  />
                </div>
              </div>

              {/* Resume Cloud URL */}
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Resume Link (Google Drive / Dropbox / Cloud Storage) *
                </label>
                <div className="relative">
                  <FileCheck className="w-3.5 h-3.5 text-primary absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="w-full text-sm pl-8 pr-3 py-2 rounded-sm border border-hairline-input focus:outline-none focus:border-primary bg-canvas text-ink"
                  />
                </div>
                <p className="text-[11px] text-ink-mute mt-1">
                  * Note: Please make sure your Google Drive link permission is set to <strong>&ldquo;Anyone with the link can view&rdquo;</strong>.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-hairline flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-sm text-ink-mute hover:text-ink transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-pill text-sm px-6 py-2.5 inline-flex items-center gap-2 shadow-sm disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting to Pipeline...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
