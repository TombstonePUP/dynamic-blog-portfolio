/**
 * useClientConfig Hook
 * 
 * Client-side hook to access client configuration with environment overrides.
 * Safe for use in Client Components.
 */

"use client";

import { CLIENT_CONFIG } from "@/config/client.config";
import { useMemo } from "react";

/**
 * Hook to get merged client config in client components
 * 
 * Note: For server components, import CLIENT_CONFIG directly
 */
export function useClientConfig() {
  return useMemo(() => {
    // In client components, we can only access NEXT_PUBLIC_* env vars
    const config = { ...CLIENT_CONFIG };

    // Override with client-safe env vars if available
    if (typeof window !== "undefined") {
      // Add any client-side config overrides here if needed
    }

    return config;
  }, []);
}

/**
 * Convenience hook to get specific config sections
 */
export function useClientBranding() {
  const config = useClientConfig();
  return config.branding;
}

export function useClientTheme() {
  const config = useClientConfig();
  return config.theme;
}

export function useClientSiteInfo() {
  const config = useClientConfig();
  return config.site;
}
