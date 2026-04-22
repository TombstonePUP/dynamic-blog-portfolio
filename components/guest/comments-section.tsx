"use client";

import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";

interface Comment {
  id: number;
  name: string;
  date: string;
  body: string;
}

interface CommentsSectionProps {
  initialCount: number;
  themeColor: string;
  seedComments?: Comment[];
}

export default function CommentsSection({
  initialCount,
  themeColor,
  seedComments = [],
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(seedComments);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const totalCount = initialCount + comments.filter((c) => !seedComments.includes(c)).length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      name: name.trim(),
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      body: body.trim(),
    };

    setComments((prev) => [...prev, newComment]);
    setName("");
    setBody("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div id="comments" className="mt-10 scroll-mt-28 space-y-6">
      {/* Section heading */}
      <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
        <MessageCircle className="size-5 text-foreground/60" strokeWidth={1.5} />
        <h2 className="text-lg font-bold text-foreground">
          {comments.length === 0
            ? "No comments yet"
            : `${comments.length} ${comments.length === 1 ? "Comment" : "Comments"}`}
        </h2>
      </div>

      {/* Existing comments */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-[#f3f2f0]/60 px-6 py-5"
              style={{ borderLeft: `4px solid ${themeColor}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="size-8 flex items-center justify-center text-xs font-bold text-foreground/70"
                  style={{ backgroundColor: `${themeColor}30` }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{c.name}</p>
                  <p className="text-xs text-foreground/50">{c.date}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{c.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-foreground/50">
          Be the first to share your thoughts on this story.
        </p>
      )}

      {/* Comment form */}
      <div className="pt-4">
        <h3 className="mb-5 text-base font-bold text-foreground">Leave a comment</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full border border-foreground/15 bg-white px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-offset-1 transition"
            style={{ "--tw-ring-color": themeColor } as React.CSSProperties}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts…"
            required
            rows={4}
            className="w-full resize-none border border-foreground/15 bg-white px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-offset-1 transition"
            style={{ "--tw-ring-color": themeColor } as React.CSSProperties}
          />
          <div className="flex items-center gap-4 justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-black transition hover:opacity-80 cursor-pointer"
              style={{ backgroundColor: themeColor }}
            >
              <Send className="size-4" strokeWidth={2} />
              Post comment
            </button>
            {submitted && (
              <p className="text-sm font-medium text-foreground/60 animate-pulse">
                ✓ Comment posted!
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
