"use client";

import { createCommentAction } from "@/app/actions/comment-actions";
import AdminCommentModerationPanel from "@/features/posts/components/guest/admin-comment-moderation-panel";
import type { CommentViewModel } from "@/services/posts";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { useState, useTransition } from "react";

interface CommentsSectionProps {
  postSlug: string;
  themeColor: string;
  enabled?: boolean;
  initialComments: CommentViewModel[];
  canModerateComments: boolean;
  loadError?: string;
}

function toDisplayInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export default function CommentsSection({
  postSlug,
  themeColor,
  enabled = true,
  initialComments,
  canModerateComments,
  loadError,
}: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    loadError || null,
  );
  const [isPending, startTransition] = useTransition();
  const displayComments = enabled ? comments : [];
  const displayErrorMessage = enabled ? errorMessage : null;
  const resolvedThemeColor = themeColor || "#72dbcc";
  const visibleCommentCount = canModerateComments
    ? comments.length
    : comments.filter((comment) => comment.status === "approved").length;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedBody = body.trim();

    if (!enabled || !trimmedName || !trimmedBody) {
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const result = await createCommentAction({
        postSlug,
        author: trimmedName,
        body: trimmedBody,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setComments((current) => [result.comment, ...current]);
      setName("");
      setBody("");
      setSubmitted(true);
      window.setTimeout(() => setSubmitted(false), 3000);
    });
  }

  return (
    <div id="comments" className="mt-10 scroll-mt-28 space-y-6">
      <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
        <MessageCircle
          className="size-5 text-foreground/60"
          strokeWidth={1.5}
        />
        <h2 className="text-lg font-bold text-foreground">
          {!enabled
            ? "Comments unavailable"
            : visibleCommentCount === 0
              ? "No comments yet"
              : `${visibleCommentCount} ${
                  visibleCommentCount === 1 ? "Comment" : "Comments"
                }`}
        </h2>
        {canModerateComments ? (
          <span className="border border-admin-primary/15 bg-admin-primary/8 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-admin-primary">
            Admin
          </span>
        ) : null}
      </div>

      {!enabled ? (
        <p className="text-sm text-foreground/50">
          Comments will appear here once this post has been migrated into the
          live publishing database.
        </p>
      ) : displayComments.length > 0 ? (
        <div className="space-y-4">
          {displayComments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-[#f3f2f0]/60 px-6 py-5 ${
                comment.status === "rejected" ? "opacity-70" : ""
              }`}
              style={{ borderLeft: `4px solid ${themeColor}` }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex size-8 items-center justify-center text-xs font-bold text-foreground/70"
                  style={{ backgroundColor: `${resolvedThemeColor}30` }}
                >
                  {toDisplayInitial(comment.name)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-foreground">
                      {comment.name}
                    </p>
                    {canModerateComments ? (
                      <span className="border border-admin-surface-hover bg-admin-surface px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-admin-muted">
                        {comment.status}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-foreground/50">{comment.date}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">
                {comment.body}
              </p>
              {canModerateComments ? (
                <AdminCommentModerationPanel
                  comments={[comment]}
                  variant="inline"
                  onChange={(updated) =>
                    setComments((current) =>
                      current.map((item) =>
                        item.id === updated.id ? updated : item,
                      ),
                    )
                  }
                  onDelete={(commentId) =>
                    setComments((current) =>
                      current.filter((item) => item.id !== commentId),
                    )
                  }
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-foreground/50">
          Be the first to share your thoughts on this story.
        </p>
      )}

      {enabled ? (
        <div className="pt-4">
          <h3 className="mb-5 text-base font-bold text-foreground">
            Leave a comment
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full border border-foreground/15 bg-white px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 transition focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={
                { "--tw-ring-color": resolvedThemeColor } as React.CSSProperties
              }
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts..."
              required
              rows={4}
              className="w-full resize-none border border-foreground/15 bg-white px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 transition focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={
                { "--tw-ring-color": resolvedThemeColor } as React.CSSProperties
              }
            />
            <div className="flex items-center justify-end gap-4">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 text-sm font-bold text-black transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: resolvedThemeColor }}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                ) : (
                  <Send className="size-4" strokeWidth={2} />
                )}
                {isPending ? "Posting..." : "Post comment"}
              </button>
              {submitted ? (
                <p className="animate-pulse text-sm font-medium text-foreground/60">
                  Comment posted.
                </p>
              ) : null}
            </div>
            {displayErrorMessage ? (
              <p className="text-sm text-red-600">{displayErrorMessage}</p>
            ) : null}
          </form>
        </div>
      ) : null}
    </div>
  );
}
