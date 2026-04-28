/**
 * Feature Flag Utilities
 * 
 * Provides a centralized way to check if features are enabled
 * based on CLIENT_CONFIG and environment variables.
 */

import { CLIENT_CONFIG } from "@/config/client.config";

/**
 * Type-safe feature flag checker
 */
export function isFeatureEnabled(
  featureName: keyof typeof CLIENT_CONFIG.features
): boolean {
  const isEnabled = CLIENT_CONFIG.features[featureName];

  // Allow environment variable to override
  if (typeof window === "undefined") {
    // Server-side: use env vars if available
    const envKey = `NEXT_PUBLIC_ENABLE_${featureName.toUpperCase()}`;
    const envValue = process.env[envKey];
    if (envValue !== undefined) {
      return envValue === "true";
    }
  } else {
    // Client-side: check NEXT_PUBLIC_ env vars
    const envKey = `NEXT_PUBLIC_ENABLE_${featureName.toUpperCase()}`;
    const envValue = process.env[`__NEXT_PUBLIC_${featureName.toUpperCase()}`];
    if (envValue !== undefined) {
      return envValue === "true";
    }
  }

  return isEnabled;
}

/**
 * Convenience functions for common feature checks
 */
export const features = {
  commentsEnabled: () => isFeatureEnabled("comments"),
  tagsEnabled: () => isFeatureEnabled("tags"),
  searchEnabled: () => isFeatureEnabled("search"),
  authorProfilesEnabled: () => isFeatureEnabled("authorProfiles"),
  userApprovalEnabled: () => isFeatureEnabled("userApprovalWorkflow"),
  multiAuthorEnabled: () => isFeatureEnabled("multiAuthor"),
  assetStorageEnabled: () => isFeatureEnabled("assetStorage"),
};
