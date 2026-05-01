"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  variant?: "default" | "danger" | "warning";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  variant = "default",
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const iconStyles = {
    default: "bg-admin-primary/10 text-admin-primary",
    danger: "bg-red-500/10 text-red-600",
    warning: "bg-amber-500/10 text-amber-600",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-admin-contrast/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full bg-admin-contrast max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-admin-contrast/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {icon && (
                <div
                  className={`flex items-center justify-center size-10 shrink-0 ${iconStyles[variant]}`}
                >
                  {icon}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-admin-text leading-tight">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-admin-text/50 mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-admin-contrast/5 transition text-admin-text/20 hover:text-admin-text shrink-0 -mr-2 -mt-2"
            >
              <X size={18} />
            </button>
          </div>

          {children && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              {children}
            </div>
          )}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-8 py-4  border-t border-admin-contrast/5">
            {footer}
          </div>
        )}
      </div>
      {/* Backdrop click listener */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
