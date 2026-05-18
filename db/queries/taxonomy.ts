import type { SupabaseClient } from "@supabase/supabase-js";

export type TopicRecord = {
  id: string;
  name: string;
  slug: string;
};

const TOPIC_SELECT = "id, name, slug";

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
