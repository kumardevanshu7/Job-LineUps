"use client";

import React from "react";

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

  const svgSizes = {
    sm: 16,
    md: 18,
    lg: 26,
  }[size];

  return (
    <div
      className={`bg-primary flex items-center justify-center shadow-sm shrink-0 select-none ${sizeClasses} ${className}`}
      style={{ backgroundColor: "#533afd" }}
    >
      <svg
        width={svgSizes}
        height={svgSizes}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white fill-current"
      >
        {/* Main 4-pointed sparkle star with curved concave flairs */}
        <path
          d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
          fill="currentColor"
        />
        {/* Top-right accent sparkle */}
        <path
          d="M19 2C19 3.65685 17.6569 5 16 5C17.6569 5 19 6.34315 19 8C19 6.34315 20.3431 5 22 5C20.3431 5 19 3.65685 19 2Z"
          fill="currentColor"
          opacity="0.85"
        />
        {/* Bottom-left accent sparkle */}
        <circle cx="5" cy="19" r="1.5" fill="currentColor" opacity="0.85" />
      </svg>
    </div>
  );
}
