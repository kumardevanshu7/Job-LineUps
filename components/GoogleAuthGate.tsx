"use client";

import React, { useState } from "react";
import { Sparkles, Shield, AlertCircle, Loader2 } from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase";
import { toast } from "sonner";

interface GoogleAuthGateProps {
  onSuccess: () => void;
}

export default function GoogleAuthGate({ onSuccess }: GoogleAuthGateProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const user = await signInWithGoogle();
      if (user) {
        toast.success(`Welcome, ${user.displayName || "Recruiter"}!`);
        onSuccess();
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error("Google Sign-In Error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setErrorMsg("Sign-in cancelled. Please click the button to try again.");
      } else if (error.code === "auth/unauthorized-domain") {
        setErrorMsg(
          "Domain not authorized in Firebase Console. Go to Firebase Console -> Authentication -> Settings -> Authorized domains -> Add your Vercel / localhost domain."
        );
      } else {
        setErrorMsg(error.message || "Failed to sign in with Google.");
      }
      toast.error(error.message || "Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-soft px-4 py-12 relative overflow-hidden">
      {/* Atmospheric background mesh */}
      <div className="gradient-mesh-bg">
        <div className="gradient-mesh-blob-1" />
        <div className="gradient-mesh-blob-2" />
        <div className="gradient-mesh-blob-3" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-canvas rounded-xl sm:rounded-2xl border border-hairline shadow-level2 p-5 sm:p-8 text-center">
        {/* Brand Icon */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary text-white mx-auto flex items-center justify-center shadow-md mb-5 sm:mb-6">
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-light text-ink tracking-heading-lg mb-2">
          Talent<span className="text-primary font-normal">Flow</span> HR
        </h1>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary-subdued/60 text-primary-deep text-[11px] font-semibold tracking-wide mb-4 border border-primary-subdued">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>Restricted Recruiter Access</span>
        </div>

        <p className="text-xs sm:text-sm text-ink-secondary mb-6 sm:mb-8 font-light leading-relaxed">
          Sign in with your authorized Google Account to view today&apos;s active candidate line-up, schedule interviews date-wise, and export manager reports.
        </p>

        {errorMsg && (
          <div className="mb-5 sm:mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left flex items-start gap-2 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-pill border border-hairline bg-canvas hover:bg-canvas-soft text-ink font-medium text-sm transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-70 min-h-[48px] group"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              {/* Official Google colorful SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <div className="mt-8 pt-6 border-t border-hairline text-center text-[11px] text-ink-mute">
          Secured by Google Firebase Authentication • Pro8-Job Portal
        </div>
      </div>
    </div>
  );
}
