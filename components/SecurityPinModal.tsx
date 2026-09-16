"use client";

import React, { useState, useEffect } from "react";
import { Lock, X, AlertCircle, CheckCircle2, Delete } from "lucide-react";

interface SecurityPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
  actionTitle?: string;
  actionDescription?: string;
  correctPin?: string;
  expectedPin?: string;
  actionType?: "STATUS_CHANGE" | "DELETE" | "GENERIC";
}

export default function SecurityPinModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
  actionTitle,
  actionDescription,
  correctPin,
  expectedPin,
  actionType = "STATUS_CHANGE",
}: SecurityPinModalProps) {
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const displayTitle = actionTitle || title || "Recruiter Security Verification";
  const displayDescription = actionDescription || description || "Enter your 4-digit Security PIN to confirm this sensitive action.";
  const pinToMatch = expectedPin || correctPin || "1234";

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setErrorMsg("");
      setIsShaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg("");

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg("");
  };

  const handleClear = () => {
    setPin("");
    setErrorMsg("");
  };

  const verifyPin = (candidatePin: string) => {
    if (candidatePin === pinToMatch) {
      onSuccess();
      onClose();
    } else {
      setIsShaking(true);
      setErrorMsg("Incorrect Security PIN. Please try again.");
      setTimeout(() => {
        setIsShaking(false);
        setPin("");
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`bg-canvas w-full max-w-sm rounded-2xl border border-hairline shadow-level3 p-6 relative transition-transform ${
          isShaking ? "animate-shake ring-2 ring-rose-500" : ""
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-ink-mute hover:text-ink hover:bg-canvas-soft transition-colors"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon */}
        <div className="text-center mb-4">
          <div
            className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-xs ${
              actionType === "DELETE"
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "bg-primary/10 text-primary border border-primary/20"
            }`}
          >
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          <p className="text-xs text-ink-mute mt-1 leading-relaxed">{description}</p>
        </div>

        {/* 4-Digit Display Indicator */}
        <div className="flex items-center justify-center gap-3 my-5">
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = pin.length > index;
            return (
              <div
                key={index}
                className={`w-11 h-12 rounded-xl border flex items-center justify-center text-lg font-bold transition-all ${
                  hasDigit
                    ? "border-primary bg-primary/10 text-primary scale-105 shadow-xs"
                    : "border-hairline-input bg-canvas-soft/80 text-ink-mute"
                }`}
              >
                {hasDigit ? "•" : ""}
              </div>
            );
          })}
        </div>

        {errorMsg && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-medium mb-4 bg-rose-50 p-2 rounded-lg border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigitClick(num)}
              className="h-12 rounded-xl border border-hairline bg-canvas hover:bg-canvas-soft active:bg-primary/10 active:scale-95 text-base font-semibold text-ink transition-all flex items-center justify-center shadow-xs"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl border border-hairline bg-canvas-soft text-xs font-medium text-ink-mute hover:text-ink active:scale-95 transition-all flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick("0")}
            className="h-12 rounded-xl border border-hairline bg-canvas hover:bg-canvas-soft active:bg-primary/10 active:scale-95 text-base font-semibold text-ink transition-all flex items-center justify-center shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl border border-hairline bg-canvas-soft text-ink-mute hover:text-rose-600 active:scale-95 transition-all flex items-center justify-center"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Hint */}
        <p className="text-[11px] text-ink-mute/70 text-center mt-5">
          Default Security PIN: <span className="font-mono font-semibold text-ink">1234</span> (Changeable in Settings)
        </p>
      </div>
    </div>
  );
}
