import { resolvePostAssetUrl } from "@/features/posts/lib/post-assets";
import { BookOpen } from "lucide-react";
import Image from "next/image";

/**
 * Thumbnail for admin story lists. Resolves the post's image through the
 * asset-folder rules and always falls back to a placeholder tile — a missing
 * image must never crash or collapse the row layout.
 */
export default function StoryThumb({
  imageUrl,
  assetFolder,
  title,
  className = "h-16 w-[100px]",
}: {
  imageUrl: string | null;
  assetFolder: string;
  title: string;
  className?: string;
}) {
  const resolved = imageUrl
    ? resolvePostAssetUrl(assetFolder, imageUrl)
    : null;
  const src =
    resolved && /^(https?:)?\/\//.test(resolved) ? resolved : null;

  if (!src) {
    return (
      <span
        aria-hidden
        className={`flex shrink-0 items-center justify-center rounded-md bg-admin-accent/8 ${className}`}
      >
        <BookOpen className="size-5 text-admin-accent/40" />
      </span>
    );
  }

  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-md bg-admin-accent/8 ${className}`}>
      <Image
        src={src}
        alt={title}
        fill
        sizes="200px"
        className="object-cover"
      />
    </span>
  );
}
