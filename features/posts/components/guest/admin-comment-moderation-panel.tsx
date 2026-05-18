"use client";

import {
  deleteCommentAction,
  moderateCommentAction,
} from "@/app/actions/comment-actions";
import type { CommentViewModel } from "@/services/posts";
import { CheckCircle, Loader2, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { useState, useTransition } from "react";

type AdminCommentModerationPanelProps = {
  comments: CommentViewModel[];
  variant?: "panel" | "inline";
  error?: string;
  onChange?: (comment: CommentViewModel) => void;
  onDelete?: (commentId: string) => void;
};

function statusClasses(status: CommentViewModel["status"]) {
  if (status === "approved") {
    return "border-admin-success/15 bg-admin-success/10 text-admin-success";
  }

  if (status === "rejected") {
    return "border-admin-danger/15 bg-admin-danger/10 text-admin-danger";
  }

  return "border-admin-muted/15 bg-admin-muted/10 text-admin-muted";
}

function StatusPill({ status }: { status: CommentViewModel["status"] }) {
  return (
    <span
      className={`inline-flex border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] ${statusClasses(status)}`}
    >
      {status}
    </span>
  );
}

export default function AdminCommentModerationPanel({
  comments,
  variant = "panel",
  error,
  onChange,
  onDelete,
}: AdminCommentModerationPanelProps) {
  const [items, setItems] = useState(comments);
  const [actionError, setActionError] = useState<string | null>(error || null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommentViewModel | null>(null);
  const [isPending, startTransition] = useTransition();
  const isInline = variant === "inline";
  const displayedItems = isInline ? comments : items;

  function replaceComment(comment: CommentViewModel) {
    setItems((current) =>
      current.map((item) => (item.id === comment.id ? comment : item)),
    );
    onChange?.(comment);
  }

  function removeComment(commentId: string) {
    setItems((current) => current.filter((item) => item.id !== commentId));
    onDelete?.(commentId);
  }

  function moderate(commentId: string, status: CommentViewModel["status"]) {
    setPendingId(commentId);
    setActionError(null);

    startTransition(async () => {
      const result = await moderateCommentAction({ commentId, status });

      if (result.success) {
        replaceComment(result.comment);
      } else {
        setActionError(result.error);
      }

      setPendingId(null);
    });
  }

  function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const targetId = deleteTarget.id;
    setPendingId(targetId);
    setActionError(null);

    startTransition(async () => {
      const result = await deleteCommentAction(targetId);

      if (result.success) {
        removeComment(result.commentId);
        setDeleteTarget(null);
      } else {
        setActionError(result.error);
      }

      setPendingId(null);
    });
  }

  if (displayedItems.length === 0 && !actionError && isInline) {
    return null;
  }

  return (
    <div
      className={
        isInline
          ? "mt-4 space-y-3"
          : "mx-auto mt-10 max-w-7xl border border-admin-surface-hover bg-admin-surface px-5 py-5 shadow-sm sm:px-6"
      }
    >
      {!isInline ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-admin-surface-hover pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-admin-primary" />
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-admin-heading">
              Comment Moderation
            </h2>
          </div>
          <span className="text-xs font-semibold text-admin-muted">
            {displayedItems.length} recent
          </span>
        </div>
      ) : null}

      {actionError ? (
        <div className="mb-3 border border-admin-danger/20 bg-admin-danger/10 px-3 py-2 text-xs font-semibold text-admin-danger">
          {actionError}
        </div>
      ) : null}

      {displayedItems.length === 0 ? (
        <div className="border border-dashed border-admin-surface-hover bg-admin-bg/50 px-4 py-6 text-center text-sm text-admin-muted">
          No recent comments to moderate.
        </div>
      ) : (
        <div className={isInline ? "space-y-2" : "grid gap-3 lg:grid-cols-2"}>
          {displayedItems.map((comment) => {
            const isBusy = isPending && pendingId === comment.id;

            return (
              <div
                key={comment.id}
                className="border border-admin-surface-hover bg-admin-bg/55 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-admin-heading">
                        {comment.name}
                      </p>
                      <StatusPill status={comment.status} />
                    </div>
                    <p className="mt-1 text-xs text-admin-muted">
                      {comment.postTitle || comment.postSlug} · {comment.date}
                    </p>
                  </div>
                  {isBusy ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-admin-primary" />
                  ) : null}
                </div>
                <p className="line-clamp-3 text-sm leading-6 text-admin-text">
                  {comment.body}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => moderate(comment.id, "approved")}
                    className="inline-flex items-center gap-1.5 border border-admin-success/20 bg-admin-success/10 px-3 py-1.5 text-xs font-bold text-admin-success transition hover:bg-admin-success/15 disabled:opacity-50"
                  >
                    <CheckCircle className="size-3.5" />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => moderate(comment.id, "rejected")}
                    className="inline-flex items-center gap-1.5 border border-admin-danger/20 bg-admin-danger/10 px-3 py-1.5 text-xs font-bold text-admin-danger transition hover:bg-admin-danger/15 disabled:opacity-50"
                  >
                    <XCircle className="size-3.5" />
                    Hide
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setDeleteTarget(comment)}
                    className="inline-flex items-center gap-1.5 border border-admin-surface-hover bg-admin-surface px-3 py-1.5 text-xs font-bold text-admin-text transition hover:bg-admin-surface-hover hover:text-admin-danger disabled:opacity-50"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-admin-surface p-6 shadow-2xl ring-1 ring-black/10">
            <div className="flex items-start justify-between gap-4 border-b border-admin-surface-hover pb-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-admin-heading">
                  Delete comment?
                </h3>
                <p className="mt-2 text-sm leading-6 text-admin-text">
                  This permanently removes the comment from the public database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-admin-muted transition hover:text-admin-heading"
              >
                <XCircle className="size-5" />
              </button>
            </div>
            <p className="mt-4 border border-admin-surface-hover bg-admin-bg px-4 py-3 text-sm leading-6 text-admin-text">
              {deleteTarget.body}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="border border-admin-surface-hover px-4 py-2 text-sm font-semibold text-admin-text transition hover:bg-admin-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending && pendingId === deleteTarget.id}
                className="inline-flex items-center gap-2 border border-admin-danger bg-admin-danger px-4 py-2 text-sm font-semibold text-admin-contrast transition hover:bg-admin-danger/90 disabled:opacity-50"
              >
                {isPending && pendingId === deleteTarget.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
