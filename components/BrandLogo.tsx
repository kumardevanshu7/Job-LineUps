"use client";

import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-8 h-8 rounded-lg",
    lg: "w-12 h-12 rounded-xl shadow-md",
  }[size];

  const px = {
    sm: 28,
    md: 32,
    lg: 48,
  }[size];

  return (
    <div
      className={`flex items-center justify-center shrink-0 select-none overflow-hidden ${sizeClasses} ${className}`}
    >
      <Image
        src="/android-chrome-192x192.png"
        alt="TalentFlow Logo"
        width={px}
        height={px}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}
