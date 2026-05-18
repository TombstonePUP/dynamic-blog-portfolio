import {
  getTopicBySlug,
  insertTopicIfMissing,
  listPostTags,
  listTopics,
} from "@/db/queries/taxonomy";
import { createClient } from "@/db/supabase/server";
import { requireApprovedContext } from "@/features/auth/server/context";
import {
  normalizeTaxonomyName,
  normalizeTaxonomySlug,
  taxonomyKey,
  type TopicOption,
} from "@/features/posts/lib/taxonomy";
import type { Blog } from "@/features/posts/types";
import { getBlogs } from "./blogs";

export type EditorTaxonomyOptions = {
  tags: string[];
  topics: TopicOption[];
};

export type TopicIndexItem = TopicOption & {
  postCount: number;
};

export type TopicsIndex = {
  topics: TopicIndexItem[];
  posts: Blog[];
};

export async function getEditorTaxonomyOptions(): Promise<EditorTaxonomyOptions> {
  const { supabase } = await requireApprovedContext();
  const [tags, topics] = await Promise.all([
    listPostTags(supabase),
    listTopics(supabase),
  ]);

  return { tags, topics };
}

export async function ensureTopicForPost(
  name: string,
): Promise<TopicOption | null> {
  const cleanName = normalizeTaxonomyName(name);
  const slug = normalizeTaxonomySlug(cleanName);

  if (!cleanName || !slug) {
    return null;
  }

  const { supabase } = await requireApprovedContext();
  const existing = await getTopicBySlug(supabase, slug);

  if (existing) {
    return existing;
  }

  return insertTopicIfMissing(supabase, { name: cleanName, slug });
}

export async function getTopicsIndex(): Promise<TopicsIndex> {
  const supabase = await createClient();
  const [topics, posts] = await Promise.all([listTopics(supabase), getBlogs()]);
  const topicsByKey = new Map<string, TopicIndexItem>();

  for (const topic of topics) {
    topicsByKey.set(taxonomyKey(topic.name), { ...topic, postCount: 0 });
  }

  for (const post of posts) {
    if (!post.topic) {
      continue;
    }

    const key = taxonomyKey(post.topic.name);
    const existing = topicsByKey.get(key);

    if (existing) {
      existing.postCount += 1;
    } else {
      topicsByKey.set(key, { ...post.topic, postCount: 1 });
    }
  }

  return {
    topics: [...topicsByKey.values()].sort((left, right) =>
      left.name.localeCompare(right.name),
    ),
    posts,
  };
}
