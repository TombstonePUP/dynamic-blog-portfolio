import {
  listManageablePosts,
  getManageablePostBySlug as getManageablePostBySlugQuery,
  type OwnedPostRecord,
} from "@/db/queries/posts";
import { isAdminProfile, requireApprovedContext, type AuthContext } from "@/features/auth/server/context";
import {
  resolvePostAssetUrl,
  rewritePostAssetUrls,
} from "@/features/posts/lib/post-assets";
import { buildEditorDocument } from "@/features/posts/lib/post-documents";

export type { OwnedPostRecord };

export async function getManageablePosts(context: AuthContext) {
  return listManageablePosts(context.supabase, {
    userId: context.user.id,
    isAdmin: isAdminProfile(context.profile),
  });
}

export async function getManageablePostBySlug(
  context: AuthContext,
  slug: string,
) {
  return getManageablePostBySlugQuery(context.supabase, {
    userId: context.user.id,
    isAdmin: isAdminProfile(context.profile),
    slug,
  });
}

export async function getOwnedPosts() {
  const context = await requireApprovedContext();
  const posts = await getManageablePosts(context);

  return {
    ...context,
    posts,
  };
}

export function buildEditorContentFromPost(
  post: OwnedPostRecord,
  authorSlug = "author",
) {
  const assetFolder = post.asset_folder || post.slug;

  return buildEditorDocument({
    title: post.title,
    date: post.published_on || post.created_at.slice(0, 10),
    author: post.author_slug || authorSlug,
    image: resolvePostAssetUrl(assetFolder, post.image_url) || "",
    excerpt: post.excerpt || "",
    tags: post.tags || [],
    status: post.status,
    body: rewritePostAssetUrls(assetFolder, post.content_mdx),
  });
}
