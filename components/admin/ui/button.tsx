"use client";

import { Loader2 } from "lucide-react";
import React from "react";

export type ButtonVariant = "default" | "ghost" | "danger" | "outline";
export type ButtonSize = "default" | "sm" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function Button({
  variant = "default",
  size = "default",
  isLoading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  // Base styles applied to all variants
  const baseStyles = "inline-flex items-center justify-center gap-2 font-bold uppercase tracking-widest transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0";

  // Visual variants
  const variants = {
    default: "bg-admin-primary text-admin-inverse hover:bg-admin-primary/80 shadow-sm rounded",
    ghost: "text-admin-text/50 hover:text-admin-text hover:bg-admin-contrast/5",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm rounded",
    outline: "text-admin-text/60 hover:text-admin-text border shadow-sm rounded hover:shadow-md",
  };

  // Size variations (includes automatic SVG scaling)
  const sizes = {
    default: "px-6 py-2 text-xs [&_svg]:size-4",
    sm: "px-4 py-1.5 text-[11px] [&_svg]:size-3.5",
    icon: "p-2 rounded-lg [&_svg]:size-4",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="size-3 animate-spin shrink-0" />}
      {children}
    </button>
  );
}
