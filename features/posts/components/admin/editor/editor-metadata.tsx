"use client";

import { createClient } from "@/db/supabase/client";
import type { EditorTaxonomyOptions } from "@/services/posts";
import type { BlogStatus } from "@/features/posts/types";
import {
  dedupeTaxonomyValues,
  normalizeTaxonomyName,
  taxonomyKey,
  type TopicOption,
} from "@/features/posts/lib/taxonomy";
import {
  Archive,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Globe,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Type,
  UploadCloud,
  X
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type PostMetadata = {
  title: string;
  date: string;
  author: string;
  image: string;
  excerpt: string;
  topic: string;
  tags: string[];
  status: BlogStatus;
};

interface EditorMetadataProps {
  metadata: PostMetadata;
  onChange: (metadata: PostMetadata) => void;
  activeSlug: string | null;
  taxonomy: EditorTaxonomyOptions;
  taxonomyState: {
    isLoading: boolean;
    error: string | null;
  };
}

const STATUS_OPTIONS: { value: BlogStatus; label: string; icon: typeof Clock; color: string }[] = [
  { value: "draft", label: "Draft", icon: Clock, color: "text-admin-danger bg-admin-danger/5 border-admin-danger/10" },
  { value: "published", label: "Published", icon: CheckCircle, color: "text-admin-success bg-admin-success/5 border-admin-success/10" },
  { value: "archived", label: "Archived", icon: Archive, color: "text-admin-muted bg-admin-muted/5 border-admin-muted/10" },
];

function FieldLabel({ icon: Icon, label, hint }: { icon: typeof Type; label: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="flex items-center gap-2 text-[13px] font-medium text-admin-muted select-none">
        <Icon size={13} strokeWidth={2} className="opacity-70" />
        {label}
      </label>
      {hint && (
        <span className="text-[9px] text-admin-text/25 italic">{hint}</span>
      )}
    </div>
  );
}

function getFilteredSuggestions(
  suggestions: string[],
  inputValue: string,
  excluded: string[] = [],
) {
  const query = taxonomyKey(inputValue);
  const excludedKeys = new Set(excluded.map(taxonomyKey));

  return suggestions
    .filter((suggestion) => !excludedKeys.has(taxonomyKey(suggestion)))
    .filter((suggestion) => !query || taxonomyKey(suggestion).includes(query))
    .slice(0, 8);
}

function DropdownState({
  isLoading,
  error,
  isEmpty,
  createLabel,
  onCreate,
}: {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  createLabel: string | null;
  onCreate: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-admin-text/45">
        <Loader2 className="size-3 animate-spin" />
        Loading suggestions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-2 text-[11px] font-semibold text-admin-danger">
        {error}
      </div>
    );
  }

  if (createLabel) {
    return (
      <button
        type="button"
        onMouseDown={(event) => {
          event.preventDefault();
          onCreate();
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-bold text-admin-primary transition-colors hover:bg-admin-primary/8"
      >
        <Plus className="size-3" />
        Create {createLabel}
      </button>
    );
  }

  if (isEmpty) {
    return (
      <div className="px-3 py-2 text-[11px] font-semibold text-admin-text/35">
        No suggestions yet.
      </div>
    );
  }

  return null;
}

/* ─── Tag Autocomplete ─── */
function TagInput({
  tags,
  suggestions,
  isLoading,
  error,
  onChange,
}: {
  tags: string[];
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  onChange: (tags: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredSuggestions = getFilteredSuggestions(suggestions, inputValue, tags);
  const normalizedInput = normalizeTaxonomyName(inputValue);
  const existingKeys = new Set([
    ...tags.map(taxonomyKey),
    ...suggestions.map(taxonomyKey),
  ]);
  const canCreate = Boolean(normalizedInput && !existingKeys.has(taxonomyKey(normalizedInput)));

  const addTag = useCallback((value = inputValue) => {
    const nextTag = normalizeTaxonomyName(value);

    if (nextTag && !tags.some((tag) => taxonomyKey(tag) === taxonomyKey(nextTag))) {
      onChange(dedupeTaxonomyValues([...tags, nextTag]));
    }

    setInputValue("");
    setOpen(false);
  }, [inputValue, tags, onChange]);

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-admin-primary/8 text-admin-primary border border-admin-primary/15 hover:border-admin-primary/30 transition-colors group"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="opacity-40 group-hover:opacity-100 hover:text-admin-danger transition-all -mr-0.5"
            >
              <X size={10} strokeWidth={3} />
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <span className="text-[11px] text-admin-text/20 italic py-1">No tags yet</span>
        )}
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(filteredSuggestions[0] || inputValue);
            }
            if (e.key === "Backspace" && !inputValue && tags.length > 0) {
              removeTag(tags.length - 1);
            }
            if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
          }}
          placeholder="Search or create a tag..."
          className="w-full bg-admin-bg/60 border border-admin-text/8 px-3 py-2 text-[12px] font-medium text-admin-text placeholder:text-admin-text/25 focus:outline-none focus:ring-1 focus:ring-admin-primary/30 focus:border-admin-primary/30 transition-all"
        />
        <button
          type="button"
          onClick={() => { addTag(); inputRef.current?.focus(); }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-admin-text/20 hover:text-admin-primary hover:bg-admin-primary/5 transition-all"
        >
          <Plus size={12} strokeWidth={3} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto border border-admin-text/8 bg-admin-surface shadow-xl ring-1 ring-black/5">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  addTag(suggestion);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] font-semibold text-admin-text transition-colors hover:bg-admin-primary/8 hover:text-admin-heading"
              >
                {suggestion}
                <Tag className="size-3 text-admin-text/25" />
              </button>
            ))}
            <DropdownState
              isLoading={isLoading}
              error={error}
              isEmpty={filteredSuggestions.length === 0 && suggestions.length === 0}
              createLabel={canCreate ? normalizedInput : null}
              onCreate={() => addTag(normalizedInput)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TopicInput({
  value,
  topics,
  isLoading,
  error,
  onChange,
}: {
  value: string;
  topics: TopicOption[];
  isLoading: boolean;
  error: string | null;
  onChange: (topic: string) => void;
}) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const suggestions = topics.map((topic) => topic.name);
  const filteredSuggestions = getFilteredSuggestions(suggestions, inputValue);
  const normalizedInput = normalizeTaxonomyName(inputValue);
  const canCreate = Boolean(
    normalizedInput &&
      !suggestions.some((suggestion) => taxonomyKey(suggestion) === taxonomyKey(normalizedInput)),
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const commitTopic = useCallback((topic: string) => {
    const nextTopic = normalizeTaxonomyName(topic);
    onChange(nextTopic);
    setInputValue(nextTopic);
    setOpen(false);
  }, [onChange]);

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitTopic(filteredSuggestions[0] || inputValue);
          }
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        onBlur={() => {
          commitTopic(inputValue);
        }}
        placeholder="Search or create a topic..."
        className="w-full bg-admin-bg/60 border border-admin-text/8 px-3 py-2.5 text-[13px] font-semibold text-admin-heading placeholder:text-admin-text/25 focus:outline-none focus:ring-1 focus:ring-admin-primary/30 focus:border-admin-primary/30 transition-all"
      />
      <ChevronDown
        className={`pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-admin-text/25 transition-transform ${open ? "rotate-180" : ""}`}
      />
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto border border-admin-text/8 bg-admin-surface shadow-xl ring-1 ring-black/5">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                commitTopic(suggestion);
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] font-semibold text-admin-text transition-colors hover:bg-admin-primary/8 hover:text-admin-heading"
            >
              {suggestion}
              <Sparkles className="size-3 text-admin-text/25" />
            </button>
          ))}
          <DropdownState
            isLoading={isLoading}
            error={error}
            isEmpty={filteredSuggestions.length === 0 && suggestions.length === 0}
            createLabel={canCreate ? normalizedInput : null}
            onCreate={() => commitTopic(normalizedInput)}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Status Dropdown ─── */
function StatusSelector({ value, onChange }: { value: BlogStatus; onChange: (v: BlogStatus) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = STATUS_OPTIONS.find((o) => o.value === value) || STATUS_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-[12px] font-bold border transition-all ${current.color}`}
      >
        <span className="flex items-center gap-2">
          <current.icon size={14} strokeWidth={2.5} />
          {current.label}
        </span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-admin-surface shadow-xl ring-1 ring-black/10 overflow-hidden">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-bold text-left transition-all hover:bg-admin-primary/5 ${option.value === value ? "bg-admin-primary/8 text-admin-primary" : "text-admin-text/70"
                }`}
            >
              <option.icon size={14} strokeWidth={2.5} />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageUploadZone({
  label,
  imageUrl,
  onUrlChange,
  activeSlug,
  fieldHint,
}: {
  label: string;
  imageUrl: string;
  onUrlChange: (url: string) => void;
  activeSlug: string | null;
  fieldHint?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSaveHint, setShowSaveHint] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const uploadFile = async (file: File) => {
    if (!activeSlug) {
      // Show a non-blocking inline hint instead of an alert
      setShowSaveHint(true);
      setTimeout(() => setShowSaveHint(false), 4000);
      return;
    }

    setIsUploading(true);
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_POST_ASSETS_BUCKET || "post-assets";

    const { error } = await supabase.storage
      .from(bucket)
      .upload(`${activeSlug}/${filename}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      alert(`Upload failed: ${error.message}`);
    } else {
      // Build the public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(`${activeSlug}/${filename}`);
      onUrlChange(data.publicUrl);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await uploadFile(file);
    }
  };

  return (
    <div>
      <FieldLabel icon={ImageIcon} label={label} hint={fieldHint} />

      {/* Save-first hint banner */}
      {showSaveHint && (
        <div className="mb-2 flex items-center gap-2 border border-amber-400/30 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700">
          <span>⚠</span>
          <span>Click <strong>Create &amp; Save Post</strong> in the toolbar first, then upload your image.</span>
        </div>
      )}

      {/* Image Preview or Upload Zone */}
      {imageUrl ? (
        <div className="relative group">
          <div className="relative overflow-hidden border border-admin-text/8 bg-admin-bg/40">
            <img
              src={imageUrl}
              alt={`${label} preview`}
              className="w-full h-32 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm"
                title="Replace image"
              >
                <UploadCloud size={16} />
              </button>
              <button
                type="button"
                onClick={() => onUrlChange("")}
                className="p-2 bg-red-500/30 hover:bg-red-500/50 text-white transition-all backdrop-blur-sm"
                title="Remove image"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {/* Filename indicator */}
          <div className="mt-1 px-1 flex items-center justify-between">
            <span className="text-[10px] text-admin-text/30 truncate max-w-[80%]">
              {imageUrl.split("/").pop() || "Image"}
            </span>
            <span className="text-[9px] text-admin-success font-bold uppercase tracking-wider">Uploaded</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed cursor-pointer transition-all ${isDragOver
            ? "border-admin-primary bg-admin-primary/5"
            : activeSlug
              ? "border-admin-text/10 hover:border-admin-primary/30 hover:bg-admin-primary/3"
              : "border-amber-300/40 bg-amber-50/50 hover:border-amber-400/60"
            } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          {isUploading ? (
            <>
              <Loader2 size={20} className="animate-spin text-admin-primary" />
              <span className="text-[11px] font-bold text-admin-primary">Uploading…</span>
            </>
          ) : activeSlug ? (
            <>
              <div className="flex items-center justify-center size-10 bg-admin-primary/8 text-admin-primary/60">
                <UploadCloud size={20} />
              </div>
              <div className="text-center">
                <span className="text-[11px] font-bold text-admin-text/50 block">
                  Drop image here or <span className="text-admin-primary underline">browse</span>
                </span>
                <span className="text-[9px] text-admin-text/25 mt-0.5 block">
                  JPG, PNG, WebP · Max 5MB
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center size-10 bg-amber-100 text-amber-500">
                <UploadCloud size={20} />
              </div>
              <div className="text-center">
                <span className="text-[11px] font-bold text-amber-600/80 block">
                  Save post first to enable upload
                </span>
                <span className="text-[9px] text-amber-500/50 mt-0.5 block">
                  Click <strong>Create &amp; Save Post</strong> above
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

/* ─── Main Metadata Panel ─── */
export default function EditorMetadata({
  metadata,
  onChange,
  activeSlug,
  taxonomy,
  taxonomyState,
}: EditorMetadataProps) {
  const update = <K extends keyof PostMetadata>(key: K, value: PostMetadata[K]) => {
    onChange({ ...metadata, ...{ [key]: value } });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-admin-surface">

      <div className="flex flex-col gap-5 p-5">
        {/* Title */}
        <div>
          <FieldLabel icon={Type} label="Title" />
          <input
            id="metadata-title"
            type="text"
            value={metadata.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Enter your story title…"
            className="w-full bg-admin-bg/60 border border-admin-text/8 px-3 py-2.5 text-[13px] font-semibold text-admin-heading placeholder:text-admin-text/25 focus:outline-none focus:ring-1 focus:ring-admin-primary/30 focus:border-admin-primary/30 transition-all"
          />
        </div>

        {/* Topic */}
        <div>
          <FieldLabel icon={Sparkles} label="Topic" hint="One primary category" />
          <TopicInput
            value={metadata.topic}
            topics={taxonomy.topics}
            isLoading={taxonomyState.isLoading}
            error={taxonomyState.error}
            onChange={(topic) => update("topic", topic)}
          />
        </div>

        {/* Topic — What's this about */}
        <div>
          <FieldLabel icon={Sparkles} label="Excerpt" hint="Describe your post" />
          <textarea
            id="metadata-excerpt"
            value={metadata.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            placeholder="Briefly describe what this post is about — e.g. 'A deep dive into building resilience through everyday habits and positive psychology…'"
            rows={7}
            className="w-full bg-admin-bg/60 border border-admin-text/8 px-3 py-2.5 text-[12px] font-medium text-admin-text leading-relaxed placeholder:text-admin-text/25 focus:outline-none focus:ring-1 focus:ring-admin-primary/30 focus:border-admin-primary/30 transition-all resize-none"
          />
          <p className="text-[10px] text-admin-text/30 mt-1 px-0.5">
            {metadata.excerpt.length}/300 characters · This shows as the post excerpt
          </p>
        </div>

        {/* Date & Status row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel icon={Calendar} label="Date" />
            <input
              id="metadata-date"
              type="date"
              value={metadata.date}
              onChange={(e) => update("date", e.target.value)}
              className="w-full bg-admin-bg/60 border border-admin-text/8 px-3 py-2 text-[12px] font-medium text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-primary/30 focus:border-admin-primary/30 transition-all"
            />
          </div>
          <div>
            <FieldLabel icon={Globe} label="Status" />
            <StatusSelector value={metadata.status} onChange={(v) => update("status", v)} />
          </div>
        </div>



        {/* Divider — Images */}
        <div className="border-t border-admin-text/5 pt-1" />

        {/* Featured Image Upload */}
        <ImageUploadZone
          label="Featured image"
          imageUrl={metadata.image}
          onUrlChange={(url) => update("image", url)}
          activeSlug={activeSlug}
          fieldHint="Used for both cover and thumbnail layouts"
        />

        {/* Divider — Tags */}
        <div className="border-t border-admin-text/5 pt-1" />

        {/* Tags */}
        <div>
          <FieldLabel icon={Tag} label="Tags" hint="Search, select, or create" />
          <TagInput
            tags={metadata.tags}
            suggestions={taxonomy.tags}
            isLoading={taxonomyState.isLoading}
            error={taxonomyState.error}
            onChange={(tags) => update("tags", tags)}
          />
        </div>
      </div>
    </div>
  );
}
