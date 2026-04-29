/**
 * Logo Component Factory
 *
 * This system allows each client to have their own logo implementation
 * while providing a unified import path.
 */

import { CLIENT_CONFIG } from "@/config/client.config";
import { FallbackLogo } from "./fallback-logo";
import { StrengthsWriterLogo } from "./strengths-writer";

// Map of available logos
const LOGO_MAP: Record<string, React.ComponentType<LogoProps>> = {
  "strengths-writer": StrengthsWriterLogo,
  fallback: FallbackLogo,
};

export interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  fill?: string;
}

/**
 * Get the appropriate logo component based on client config
 */
export function LogoIcon(props: LogoProps) {
  const logoKey = CLIENT_CONFIG.branding.logoComponent as keyof typeof LOGO_MAP;
  const LogoComponent = LOGO_MAP[logoKey] || LOGO_MAP.fallback;

  return <LogoComponent {...props} />;
}

/**
 * Export all available logos for direct import if needed
 */
export { FallbackLogo, StrengthsWriterLogo };
