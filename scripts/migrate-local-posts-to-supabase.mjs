import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const PRIMARY_ADMIN_EMAIL = "sanjuanregie@gmail.com";
const DRY_RUN = process.argv.includes("--dry-run");
const MIME_TYPES = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".webp": "image/webp",
};
const AUTHOR_SNAPSHOTS = {
  ian: {
    author_name: "Ian Llenares",
    author_slug: "ian",
    author_role: "Founder & Lead Writer",
    author_avatar_url: "/images/blog/Ian-L-1024x1024.jpg",
  },
  johndoe: {
    author_name: "John Doe",
    author_slug: "johndoe",
    author_role: "Guest Contributor",
    author_avatar_url: "/images/blog/unsplash-1472099645785-5658abf4ff4e.jpg",
  },
  janedoe: {
    author_name: "Jane Doe",
    author_slug: "janedoe",
    author_role: "Editorial Assistant",
    author_avatar_url: "/images/blog/unsplash-1438761681033-6461ffad8d80.jpg",
  },
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

const POST_ASSETS_BUCKET =
  process.env.SUPABASE_POST_ASSETS_BUCKET ||
  process.env.NEXT_PUBLIC_SUPABASE_POST_ASSETS_BUCKET ||
  "post-assets";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const authorCache = new Map();
let defaultOwnerPromise = null;

function normalizeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeStatus(value) {
  if (value === "draft" || value === "archived") {
    return value;
  }

  return "published";
}

function toIsoDate(value, fallback = new Date()) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }

  const parsed = value instanceof Date ? value : new Date(String(value || ""));
  if (Number.isNaN(parsed.getTime())) {
    return fallback.toISOString().slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeAssetFolder(value) {
  return String(value || "").trim().replace(/^\/+|\/+$/g, "");
}

function normalizeAssetPath(value) {
  return String(value || "").trim().replace(/^\.\/+/, "").replace(/^\/+/, "");
}

function encodeObjectPath(value) {
  return value
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildPostAssetUrl(assetFolder, assetPath) {
  const normalizedAssetFolder = normalizeAssetFolder(assetFolder);
  const normalizedAssetPath = normalizeAssetPath(assetPath);

  if (!normalizedAssetFolder || !normalizedAssetPath) {
    return null;
  }

  const objectPath = encodeObjectPath(
    `${normalizedAssetFolder}/${normalizedAssetPath}`,
  );

  return `${new URL(supabaseUrl).origin}/storage/v1/object/public/${POST_ASSETS_BUCKET}/${objectPath}`;
}

function resolvePostAssetUrl(assetFolder, value) {
  if (!value) {
    return null;
  }

  if (value.startsWith("./")) {
    return buildPostAssetUrl(assetFolder, value) || value;
  }

  const legacyPrefix = `/images/posts/${normalizeAssetFolder(assetFolder)}/`;

  if (value.startsWith(legacyPrefix)) {
    return buildPostAssetUrl(assetFolder, value.slice(legacyPrefix.length)) || value;
  }

  return value;
}

function rewritePostAssetUrls(assetFolder, content) {
  if (!content) {
    return content;
  }

  let nextContent = content.replace(
    /(["'(])\.\/([^"'()\s>]+)(?=["')\s>])/g,
    (match, prefix, assetPath) => {
      const resolved = buildPostAssetUrl(assetFolder, assetPath);
      return resolved ? `${prefix}${resolved}` : match;
    },
  );

  const normalizedAssetFolder = normalizeAssetFolder(assetFolder);
  const legacyPrefix = `/images/posts/${normalizedAssetFolder}/`;

  if (!normalizedAssetFolder) {
    return nextContent;
  }

  const escapedPrefix = legacyPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const legacyPattern = new RegExp(
    `(["'(])${escapedPrefix}([^"'()\\s>]+)(?=["')\\s>])`,
    "g",
  );

  nextContent = nextContent.replace(
    legacyPattern,
    (match, prefix, assetPath) => {
      const resolved = buildPostAssetUrl(assetFolder, assetPath);
      return resolved ? `${prefix}${resolved}` : match;
    },
  );

  return nextContent;
}

function inferMimeType(fileName) {
  return MIME_TYPES[path.extname(fileName).toLowerCase()] || "application/octet-stream";
}

function readLocalPosts() {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const folderPath = path.join(POSTS_DIR, entry.name);
      const mdxPath = path.join(folderPath, "index.mdx");

      if (!fs.existsSync(mdxPath)) {
        return null;
      }

      const fileContents = fs.readFileSync(mdxPath, "utf8");
      const { data, content } = matter(fileContents);
      const assetFiles = fs
        .readdirSync(folderPath, { withFileTypes: true })
        .filter((file) => file.isFile() && file.name !== "index.mdx")
        .map((file) => ({
          name: file.name,
          fullPath: path.join(folderPath, file.name),
        }));

      return {
        folderName: entry.name,
        slug: normalizeSlug(entry.name),
        frontmatter: data || {},
        content: content.trim(),
        assetFiles,
      };
    })
    .filter(Boolean)
    .sort((left, right) =>
      String(right.frontmatter?.date || "").localeCompare(
        String(left.frontmatter?.date || ""),
      ),
    );
}

async function ensurePostAssetsBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    throw error;
  }

  const existingBucket = (buckets || []).find((bucket) => bucket.name === POST_ASSETS_BUCKET);

  if (existingBucket) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(POST_ASSETS_BUCKET, {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: Object.values(MIME_TYPES),
  });

  if (createError) {
    throw createError;
  }
}

async function findProfileByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, slug, display_name, role, approval_status")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function resolveDefaultOwner() {
  if (defaultOwnerPromise) {
    return defaultOwnerPromise;
  }

  defaultOwnerPromise = (async () => {
    const preferredEmail = (
      process.env.SUPABASE_LEGACY_AUTHOR_EMAIL ||
      process.env.SUPABASE_ADMIN_EMAIL ||
      PRIMARY_ADMIN_EMAIL
    )
      .trim()
      .toLowerCase();

    const preferredProfile = await findProfileByEmail(preferredEmail);
    if (preferredProfile) {
      return preferredProfile;
    }

    const { data: adminProfiles, error: adminError } = await supabase
      .from("profiles")
      .select("id, email, slug, display_name, role, approval_status")
      .eq("role", "admin")
      .eq("approval_status", "approved")
      .limit(1);

    if (adminError) {
      throw adminError;
    }

    if (adminProfiles?.[0]) {
      return adminProfiles[0];
    }

    const { data: approvedProfiles, error: approvedError } = await supabase
      .from("profiles")
      .select("id, email, slug, display_name, role, approval_status")
      .eq("approval_status", "approved")
      .limit(1);

    if (approvedError) {
      throw approvedError;
    }

    if (approvedProfiles?.[0]) {
      return approvedProfiles[0];
    }

    throw new Error(
      "No approved profile found for imported posts. Seed or approve an author/admin first.",
    );
  })();

  return defaultOwnerPromise;
}

async function resolveAuthorProfile(authorKey) {
  const normalizedKey = String(authorKey || "").trim().toLowerCase();

  if (!normalizedKey) {
    return resolveDefaultOwner();
  }

  if (authorCache.has(normalizedKey)) {
    return authorCache.get(normalizedKey);
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, slug, display_name, role, approval_status")
    .eq("slug", normalizedKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const profile = data || (await resolveDefaultOwner());
  authorCache.set(normalizedKey, profile);
  return profile;
}

async function uploadAssets(post) {
  for (const asset of post.assetFiles) {
    const objectPath = `${post.slug}/${asset.name}`;

    if (DRY_RUN) {
      continue;
    }

    const fileBuffer = fs.readFileSync(asset.fullPath);
    const { error } = await supabase.storage
      .from(POST_ASSETS_BUCKET)
      .upload(objectPath, fileBuffer, {
        upsert: true,
        contentType: inferMimeType(asset.name),
        cacheControl: "31536000",
      });

    if (error) {
      throw error;
    }
  }
}

async function findExistingPost(slug) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, author_name, author_slug, author_role, author_avatar_url, asset_folder, title, slug, excerpt, content_mdx, cover_image_url, thumbnail_url, tags, status, published_on, published_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function migratePost(post) {
  const existing = DRY_RUN ? null : await findExistingPost(post.slug);
  const ownerProfile = DRY_RUN
    ? { id: "dry-run-owner", slug: "writer", display_name: "Dry Run Owner", role: "author" }
    : await resolveAuthorProfile(post.frontmatter.author);
  const assetFolder = existing?.asset_folder || post.slug;
  await uploadAssets(post);
  const snapshot =
    AUTHOR_SNAPSHOTS[String(post.frontmatter.author || "").trim().toLowerCase()] || {};
  const localDate = toIsoDate(post.frontmatter.date);
  const localStatus = normalizeStatus(post.frontmatter.status);
  const localBody = rewritePostAssetUrls(assetFolder, post.content);
  const existingBody = existing?.content_mdx
    ? rewritePostAssetUrls(assetFolder, existing.content_mdx)
    : null;
  const body = existingBody || localBody;
  const coverImage =
    resolvePostAssetUrl(
      assetFolder,
      existing?.cover_image_url ||
        (typeof post.frontmatter.image === "string" ? post.frontmatter.image : ""),
    ) || null;
  const thumbnailImage =
    resolvePostAssetUrl(
      assetFolder,
      existing?.thumbnail_url ||
        (typeof post.frontmatter.thumbnail === "string"
          ? post.frontmatter.thumbnail
          : typeof post.frontmatter.image === "string"
            ? post.frontmatter.image
            : ""),
    ) || coverImage;
  const payload = {
    author_id: existing?.author_id || ownerProfile.id,
    author_name:
      existing?.author_name ||
      snapshot.author_name ||
      ownerProfile.display_name ||
      "Author",
    author_slug:
      existing?.author_slug || snapshot.author_slug || ownerProfile.slug || "author",
    author_role:
      existing?.author_role || snapshot.author_role || ownerProfile.role || "author",
    author_avatar_url:
      existing?.author_avatar_url || snapshot.author_avatar_url || null,
    asset_folder: assetFolder,
    title:
      existing?.title ||
      (typeof post.frontmatter.title === "string" && post.frontmatter.title.trim()) ||
      post.folderName,
    slug: post.slug,
    excerpt:
      existing?.excerpt ||
      (typeof post.frontmatter.excerpt === "string" && post.frontmatter.excerpt.trim()) ||
      (typeof post.frontmatter.description === "string" &&
        post.frontmatter.description.trim()) ||
      "",
    content_mdx: body,
    cover_image_url: coverImage,
    thumbnail_url: thumbnailImage,
    tags:
      Array.isArray(existing?.tags) && existing.tags.length > 0
        ? existing.tags
        : normalizeTags(post.frontmatter.tags),
    status: existing?.status || localStatus,
    published_on: existing?.published_on || localDate,
    published_at:
      existing?.published_at ||
      ((existing?.status || localStatus) === "published"
        ? `${existing?.published_on || localDate}T00:00:00.000Z`
        : null),
  };

  if (DRY_RUN) {
    console.log(
      `[dry-run] ${post.slug}: ${post.assetFiles.length} asset(s), owner=${payload.author_slug}, status=${payload.status}`,
    );
    return;
  }

  const query = existing
    ? supabase
        .from("posts")
        .update(payload)
        .eq("id", existing.id)
        .select("id, slug")
        .single()
    : supabase.from("posts").insert(payload).select("id, slug").single();

  const { error } = await query;

  if (error) {
    throw error;
  }

  console.log(
    `${existing ? "Updated" : "Imported"} ${post.slug} with ${post.assetFiles.length} asset(s).`,
  );
}

async function main() {
  const localPosts = readLocalPosts();

  if (localPosts.length === 0) {
    console.log("No local posts found in content/posts.");
    return;
  }

  console.log(
    `${DRY_RUN ? "Planning" : "Migrating"} ${localPosts.length} local post(s) from content/posts.`,
  );

  if (!DRY_RUN) {
    await ensurePostAssetsBucket();
  }

  for (const post of localPosts) {
    await migratePost(post);
  }

  console.log(
    `${DRY_RUN ? "Dry run complete." : "Local post migration complete."}`,
  );
}

main().catch((error) => {
  console.error("Failed to migrate local posts.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
