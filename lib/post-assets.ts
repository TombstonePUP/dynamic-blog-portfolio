const SUPABASE_ORIGIN = (() => {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || null;

  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
})();

const POST_ASSETS_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_POST_ASSETS_BUCKET ||
  process.env.SUPABASE_POST_ASSETS_BUCKET ||
  "post-assets";

function normalizeAssetFolder(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function normalizeAssetPath(value: string) {
  return value.trim().replace(/^\.\/+/, "").replace(/^\/+/, "");
}

function encodeObjectPath(value: string) {
  return value
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildPostAssetUrl(assetFolder: string, assetPath: string) {
  const normalizedAssetFolder = normalizeAssetFolder(assetFolder);
  const normalizedAssetPath = normalizeAssetPath(assetPath);

  if (!SUPABASE_ORIGIN || !normalizedAssetFolder || !normalizedAssetPath) {
    return null;
  }

  const objectPath = encodeObjectPath(
    `${normalizedAssetFolder}/${normalizedAssetPath}`,
  );

  return `${SUPABASE_ORIGIN}/storage/v1/object/public/${POST_ASSETS_BUCKET}/${objectPath}`;
}

export function resolvePostAssetUrl(
  assetFolder: string,
  value: string | null | undefined,
) {
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

export function rewritePostAssetUrls(assetFolder: string, content: string) {
  if (!content) {
    return content;
  }

  let nextContent = content;

  nextContent = nextContent.replace(
    /(["'(])\.\/([^"'()\s>]+)(?=["')\s>])/g,
    (match, prefix: string, assetPath: string) => {
      const resolved = buildPostAssetUrl(assetFolder, assetPath);
      return resolved ? `${prefix}${resolved}` : match;
    },
  );

  const normalizedAssetFolder = normalizeAssetFolder(assetFolder);

  if (!normalizedAssetFolder) {
    return nextContent;
  }

  const legacyPrefix = `/images/posts/${normalizedAssetFolder}/`;
  const legacyPattern = new RegExp(
    `(["'(])${escapeRegExp(legacyPrefix)}([^"'()\\s>]+)(?=["')\\s>])`,
    "g",
  );

  return nextContent.replace(
    legacyPattern,
    (match, prefix: string, assetPath: string) => {
      const resolved = buildPostAssetUrl(assetFolder, assetPath);
      return resolved ? `${prefix}${resolved}` : match;
    },
  );
}
