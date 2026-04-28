/**
 * FeatureGate Component
 *
 * Conditionally renders children based on feature flags from CLIENT_CONFIG.
 * This allows easy toggling of features per client without code changes.
 */

import { features } from "@/lib/features";

export interface FeatureGateProps {
  feature: keyof typeof features;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Render children only if feature is enabled
 *
 * Usage:
 * <FeatureGate feature="commentsEnabled">
 *   <CommentsSection />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: FeatureGateProps) {
  const featureChecker = features[feature];

  if (!featureChecker) {
    console.warn(`Unknown feature: ${feature}`);
    return fallback;
  }

  if (!featureChecker()) {
    return fallback;
  }

  return children;
}

/**
 * Alternative: Just check if feature is enabled without rendering
 * Useful for logic, not rendering
 */
export function useFeature(featureName: keyof typeof features): boolean {
  return features[featureName]();
}
