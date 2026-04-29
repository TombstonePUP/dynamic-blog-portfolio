/**
 * Fallback Logo Component
 *
 * Generic SVG logo that works for any client.
 * Clients can customize with their own logo by creating a new component
 * and updating CLIENT_CONFIG.branding.logoComponent
 */

import { LogoProps } from "./index";

export function FallbackLogo({
  className = "",
  width = 24,
  height = 24,
  fill = "currentColor",
}: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={fill}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Generic blog/writing icon */}
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
