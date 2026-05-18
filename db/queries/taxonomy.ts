import type { SupabaseClient } from "@supabase/supabase-js";

export type TopicRecord = {
  id: string;
  name: string;
  slug: string;
  is_featured?: boolean;
  homepage_order?: number | null;
};

const TOPIC_SELECT = "id, name, slug, is_featured, homepage_order";

export async function listPostTags(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.from("posts").select("tags");

  if (error) {
    throw new Error(error.message);
  }

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const row of (data as Array<{ tags: string[] | null }> | null) || []) {
    for (const tag of row.tags || []) {
      const label = String(tag).trim();
      const key = label.toLowerCase();

      if (!label || seen.has(key)) {
        continue;
      }

      seen.add(key);
      tags.push(label);
    }
  }

  return tags.sort((left, right) => left.localeCompare(right));
}

export async function listTopics(
  supabase: SupabaseClient,
): Promise<TopicRecord[]> {
  const { data, error } = await supabase
    .from("topics")
    .select(TOPIC_SELECT)
    .order("is_featured", { ascending: false })
    .order("homepage_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as TopicRecord[] | null) || [];
}

export async function getTopicBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<TopicRecord | null> {
  const { data, error } = await supabase
    .from("topics")
    .select(TOPIC_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as TopicRecord | null) || null;
}

export async function insertTopicIfMissing(
  supabase: SupabaseClient,
  topic: { name: string; slug: string },
): Promise<TopicRecord> {
  const { error } = await supabase
    .from("topics")
    .upsert(topic, { onConflict: "slug", ignoreDuplicates: true });

  if (error) {
    throw new Error(error.message);
  }

  const record = await getTopicBySlug(supabase, topic.slug);

  if (!record) {
    throw new Error("Unable to load topic after creating it.");
  }

  return record;
}

export async function updateTopicFeaturedBySlug(
  supabase: SupabaseClient,
  options: { slug: string; isFeatured: boolean },
): Promise<TopicRecord> {
  const { data, error } = await supabase
    .from("topics")
    .update({ is_featured: options.isFeatured })
    .eq("slug", options.slug)
    .select(TOPIC_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TopicRecord;
}
