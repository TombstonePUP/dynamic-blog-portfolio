/**
 * Environment-based Configuration Overrides
 * 
 * This layer allows environment variables to override CLIENT_CONFIG values
 * at runtime, enabling flexible deployment across different environments.
 */

import { CLIENT_CONFIG, type ClientConfig } from "./client.config";

/**
 * Get merged configuration with environment variable overrides
 */
export function getClientConfig(): ClientConfig {
  const config = JSON.parse(JSON.stringify(CLIENT_CONFIG)) as any;

  // Override site settings from environment
  if (process.env.NEXT_PUBLIC_SITE_NAME) {
    config.site.name = process.env.NEXT_PUBLIC_SITE_NAME;
  }
  if (process.env.NEXT_PUBLIC_SITE_DOMAIN) {
    config.site.domain = process.env.NEXT_PUBLIC_SITE_DOMAIN;
  }
  if (process.env.NEXT_PUBLIC_SITE_TAGLINE) {
    config.site.tagline = process.env.NEXT_PUBLIC_SITE_TAGLINE;
  }

  // Override auth settings
  if (process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL) {
    config.auth.primaryAdminEmail = process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL;
  }

  // Override theme colors
  if (process.env.NEXT_PUBLIC_THEME_ADMIN_ACCENT) {
    config.theme.colors.admin.accent = process.env.NEXT_PUBLIC_THEME_ADMIN_ACCENT;
  }
  if (process.env.NEXT_PUBLIC_THEME_ADMIN_PRIMARY) {
    config.theme.colors.admin.heading = process.env.NEXT_PUBLIC_THEME_ADMIN_PRIMARY;
  }

  // Override storage settings
  if (process.env.NEXT_PUBLIC_STORAGE_BUCKET) {
    config.storage.bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET;
  }

  // Override feature flags
  if (process.env.NEXT_PUBLIC_ENABLE_COMMENTS === "false") {
    config.features.comments = false;
  }
  if (process.env.NEXT_PUBLIC_ENABLE_TAGS === "false") {
    config.features.tags = false;
  }
  if (process.env.NEXT_PUBLIC_ENABLE_SEARCH === "false") {
    config.features.search = false;
  }

  return config;
}

/**
 * Server-side only config (uses SUPABASE_SERVICE_ROLE_KEY, etc)
 */
export function getServerOnlyConfig() {
  return {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      postAssetsBucket: process.env.SUPABASE_POST_ASSETS_BUCKET || "post-assets",
    },
  };
}
