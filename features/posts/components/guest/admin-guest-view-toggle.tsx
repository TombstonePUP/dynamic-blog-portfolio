"use client";

import { setGuestViewModeAction } from "@/app/actions/guest-view-actions";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminGuestViewToggleProps = {
  isViewingAsGuest: boolean;
};

export default function AdminGuestViewToggle({
  isViewingAsGuest,
}: AdminGuestViewToggleProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(isViewingAsGuest);
  const [message, setMessage] = useState<string | null>(
    isViewingAsGuest ? "Guest view active" : null,
  );
  const [isPending, startTransition] = useTransition();

  function toggleGuestView() {
    const nextValue = !enabled;
    setMessage(null);

    startTransition(async () => {
      const result = await setGuestViewModeAction(nextValue);

      if (!result.success) {
        setMessage(result.error);
        return;
      }

      setEnabled(result.state.isViewingAsGuest);
      setMessage(
        result.state.isViewingAsGuest
          ? "Guest view active"
          : "Admin controls active",
      );
      router.refresh();
    });
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] border border-admin-surface-hover bg-admin-surface p-2 shadow-2xl ring-1 ring-black/10">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleGuestView}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 border border-admin-accent bg-admin-accent px-4 py-2 text-sm font-semibold text-admin-contrast transition-colors hover:bg-admin-accent/90 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-4 shrink-0 animate-spin" />
          ) : enabled ? (
            <EyeOff className="size-4 shrink-0" />
          ) : (
            <Eye className="size-4 shrink-0" />
          )}
          <span>{enabled ? "Exit Guest View" : "View as Guest"}</span>
        </button>
        {message ? (
          <span
            className={`max-w-40 text-xs font-semibold ${
              message.includes("Unable") || message.includes("Only")
                ? "text-admin-danger"
                : "text-admin-muted"
            }`}
          >
            {message}
          </span>
        ) : null}
      </div>
    </div>
  );
}
