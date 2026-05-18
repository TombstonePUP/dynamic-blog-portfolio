import {
  updatePostStatusBySlug,
  updatePostTagsBySlug,
  type PublishedPostRow,
} from "@/db/queries/posts";
import {
  updateTopicFeaturedBySlug,
  type TopicRecord,
} from "@/db/queries/taxonomy";
import { requireAdminContext } from "@/features/auth/server/context";
import { dedupeTaxonomyValues } from "@/features/posts/lib/taxonomy";
import type { Blog, BlogStatus } from "@/features/posts/types";
import { mapSupabasePostForGuest } from "./blogs";

function normalizePublicStatus(status: string): BlogStatus {
  if (status === "published" || status === "draft" || status === "archived") {
    return status;
  }

  throw new Error("Invalid story status.");
}

function normalizeSlug(value: string) {
  const slug = value.trim();

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Invalid story slug.");
  }

  return slug;
}

function toPublicBlog(row: PublishedPostRow): Blog {
  return mapSupabasePostForGuest(row);
}

export async function updatePublicStoryStatus(options: {
  slug: string;
  status: string;
}) {
  const { supabase } = await requireAdminContext();
  const row = await updatePostStatusBySlug(supabase, {
    slug: normalizeSlug(options.slug),
    status: normalizePublicStatus(options.status),
  });

  return toPublicBlog(row);
}

export async function togglePublicStoryFeatured(options: {
  slug: string;
  tags: string[];
  featured: boolean;
}) {
  const { supabase } = await requireAdminContext();
  const tagsWithoutFeatured = options.tags.filter(
    (tag) => tag.trim().toLowerCase() !== "featured",
  );
  const nextTags = dedupeTaxonomyValues(
    options.featured ? ["featured", ...tagsWithoutFeatured] : tagsWithoutFeatured,
  );
  const row = await updatePostTagsBySlug(supabase, {
    slug: normalizeSlug(options.slug),
    tags: nextTags,
  });

  return toPublicBlog(row);
}

export async function toggleHomepageTopicFeatured(options: {
  slug: string;
  featured: boolean;
}): Promise<TopicRecord> {
  const { supabase } = await requireAdminContext();

  return updateTopicFeaturedBySlug(supabase, {
    slug: normalizeSlug(options.slug),
    isFeatured: options.featured,
  });
}
