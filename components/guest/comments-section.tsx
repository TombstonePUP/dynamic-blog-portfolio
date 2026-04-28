"use client";

import { createClient } from "@/utils/supabase/client";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";

interface CommentRow {
  id: string;
  author: string;
  body: string;
  created_at: string;
}

interface CommentViewModel {
  id: string;
  name: string;
  body: string;
  date: string;
}

interface CommentsSectionProps {
  postSlug: string;
  themeColor: string;
  enabled?: boolean;
}

const supabase = createClient();

function formatCommentDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toCommentViewModel(comment: CommentRow): CommentViewModel {
  return {
    id: comment.id,
    name: comment.author,
    body: comment.body,
    date: formatCommentDate(comment.created_at),
  };
}

function getLoadErrorMessage(message: string) {
  if (message.includes("public.comments")) {
    return "Comments are not live yet. Finish the Supabase table setup first.";
  }

  return "Comments are unavailable right now.";
}

export default function CommentsSection({
  postSlug,
  themeColor,
  enabled = true,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentViewModel[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setComments([]);
      setLoading(false);
      setErrorMessage(null);
      return;
    }

    let active = true;

    async function loadComments() {
      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("comments")
        .select("id, author, body, created_at")
        .eq("post_slug", postSlug)
        .order("created_at", { ascending: false });

      if (!active) {
        return;
      }

      if (error) {
        setComments([]);
        setErrorMessage(getLoadErrorMessage(error.message));
      } else {
        setComments((data ?? []).map(toCommentViewModel));
      }

      setLoading(false);
    }

    void loadComments();

    return () => {
      active = false;
    };
  }, [enabled, postSlug]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedBody = body.trim();

    if (!enabled || !trimmedName || !trimmedBody) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_slug: postSlug,
        author: trimmedName,
        body: trimmedBody,
      })
      .select("id, author, body, created_at")
      .single();

    if (error) {
      setErrorMessage("Could not post your comment right now.");
      setSubmitting(false);
      return;
    }

    setComments((prev) => [toCommentViewModel(data), ...prev]);
    setName("");
    setBody("");
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div id="comments" className="mt-10 scroll-mt-28 space-y-6">
      <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
        <MessageCircle className="size-5 text-foreground/60" strokeWidth={1.5} />
        <h2 className="text-lg font-bold text-foreground">
          {!enabled
            ? "Comments unavailable"
            : loading
            ? "Loading comments..."
            : comments.length === 0
              ? "No comments yet"
              : `${comments.length} ${comments.length === 1 ? "Comment" : "Comments"}`}
        </h2>
      </div>

      {!enabled ? (
        <p className="text-sm text-foreground/50">
          Comments will appear here once this post has been migrated into the live publishing database.
        </p>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-[#f3f2f0]/60 px-6 py-5"
              style={{ borderLeft: `4px solid ${themeColor}` }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex size-8 items-center justify-center text-xs font-bold text-foreground/70"
                  style={{ backgroundColor: `${themeColor}30` }}
                >
                  {comment.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{comment.name}</p>
                  <p className="text-xs text-foreground/50">{comment.date}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{comment.body}</p>
            </div>
          ))}
        </div>
      ) : loading ? (
        <p className="text-sm text-foreground/50">Loading the conversation...</p>
      ) : (
        <p className="text-sm text-foreground/50">
          Be the first to share your thoughts on this story.
        </p>
      )}

      {enabled ? (
        <div className="pt-4">
          <h3 className="mb-5 text-base font-bold text-foreground">Leave a comment</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full border border-foreground/15 bg-white px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 transition focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ "--tw-ring-color": themeColor } as React.CSSProperties}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts..."
              required
              rows={4}
              className="w-full resize-none border border-foreground/15 bg-white px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 transition focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ "--tw-ring-color": themeColor } as React.CSSProperties}
            />
            <div className="flex items-center justify-end gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 text-sm font-bold text-black transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: themeColor }}
              >
                <Send className="size-4" strokeWidth={2} />
                {submitting ? "Posting..." : "Post comment"}
              </button>
              {submitted ? (
                <p className="animate-pulse text-sm font-medium text-foreground/60">
                  Comment posted.
                </p>
              ) : null}
            </div>
            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : null}
          </form>
        </div>
      ) : null}
    </div>
  );
}
