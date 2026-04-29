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
  const baseStyles =
    "inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0";

  // Visual variants
  const variants = {
    default:
      "border border-admin-accent bg-admin-accent text-admin-contrast hover:bg-admin-accent/90",
    ghost:
      "border border-transparent text-admin-text hover:bg-admin-surface-hover hover:text-admin-heading",
    danger:
      "border border-admin-danger bg-admin-danger text-admin-contrast hover:bg-admin-danger/90",
    outline:
      "border border-admin-surface-hover text-admin-text hover:bg-admin-surface-hover hover:text-admin-heading",
  };

  // Size variations (includes automatic SVG scaling)
  const sizes = {
    default: "px-5 py-2 [&_svg]:size-4",
    sm: "px-4 py-1.5 text-[13px] [&_svg]:size-3.5",
    icon: "size-9 p-0 [&_svg]:size-4",
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
