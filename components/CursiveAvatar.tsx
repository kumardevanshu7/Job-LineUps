"use client";

import React from "react";
import { getColorOption } from "@/lib/avatar-constants";

interface CursiveAvatarProps {
  initial: string;
  colorId?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
  title?: string;
}

const SIZE_CONFIG = {
  sm: {
    container: "w-7 h-7 text-[16px]",
    borderWidth: "border",
    shadow: "shadow-xs",
  },
  md: {
    container: "w-9 h-9 text-[20px]",
    borderWidth: "border",
    shadow: "shadow-sm",
  },
  lg: {
    container: "w-14 h-14 text-[32px]",
    borderWidth: "border-2",
    shadow: "shadow-sm",
  },
  xl: {
    container: "w-20 h-20 text-[46px]",
    borderWidth: "border-2",
    shadow: "shadow-md",
  },
};

export default function CursiveAvatar({
  initial,
  colorId,
  size = "md",
  className = "",
  onClick,
  title,
}: CursiveAvatarProps) {
  const color = getColorOption(colorId);
  const sizeMeta = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const letter = (initial || "T").charAt(0).toUpperCase();

  return (
    <div
      onClick={onClick}
      title={title}
      className={`rounded-full flex items-center justify-center font-cursive font-bold leading-none select-none transition-transform ${
        sizeMeta.container
      } ${sizeMeta.borderWidth} ${sizeMeta.shadow} ${color.bg} ${color.text} ${
        color.border
      } ${onClick ? "cursor-pointer hover:scale-105 active:scale-95" : ""} ${className}`}
      style={{
        // Micro-adjustment for cursive font baseline
        paddingBottom: size === "xl" ? "4px" : size === "lg" ? "2px" : "1px",
      }}
    >
      <span>{letter}</span>
    </div>
  );
}
