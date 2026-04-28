/**
 * Config-Based Theme Utilities
 * 
 * Converts CLIENT_CONFIG colors and settings into theme values
 * for use throughout the app. This layer bridges config and components.
 */

import { CLIENT_CONFIG } from "@/config/client.config";

/**
 * Get theme color for a specific tag
 * Uses config-defined tag colors for dynamic theming
 */
export function getTagColor(tagName: string): string {
  const normalizedTag = tagName.toLowerCase().trim();
  const tag = CLIENT_CONFIG.taxonomy.tags.find(
    (t) => t.name.toLowerCase() === normalizedTag
  );
  return tag?.color || "#72dbcc"; // Default teal
}

/**
 * Get all tag colors as a map
 * Useful for bulk styling operations
 */
export function getTagColorMap(): Record<string, string> {
  const map: Record<string, string> = {};
  CLIENT_CONFIG.taxonomy.tags.forEach((tag) => {
    map[tag.name] = tag.color;
    map[tag.label.toLowerCase()] = tag.color;
  });
  return map;
}

/**
 * Get admin theme colors from config
 * Returns color values for admin UI
 */
export function getAdminTheme() {
  return {
    bg: CLIENT_CONFIG.theme.colors.admin.bg,
    surface: CLIENT_CONFIG.theme.colors.admin.surface,
    surfaceHover: CLIENT_CONFIG.theme.colors.admin.surfaceHover,
    text: CLIENT_CONFIG.theme.colors.admin.text,
    muted: CLIENT_CONFIG.theme.colors.admin.muted,
    heading: CLIENT_CONFIG.theme.colors.admin.heading,
    accent: CLIENT_CONFIG.theme.colors.admin.accent,
    success: CLIENT_CONFIG.theme.colors.admin.success,
    danger: CLIENT_CONFIG.theme.colors.admin.danger,
    info: CLIENT_CONFIG.theme.colors.admin.info,
  };
}

/**
 * Get guest theme colors from config
 * Returns color values for guest-facing UI
 */
export function getGuestTheme() {
  return {
    background: CLIENT_CONFIG.theme.colors.guest.background,
    foreground: CLIENT_CONFIG.theme.colors.guest.foreground,
    primary: CLIENT_CONFIG.theme.colors.guest.primary,
  };
}

/**
 * Get CSS variable map from config
 * Useful for injecting into styles at build or runtime
 */
export function getCSSVariablesMap() {
  const adminTheme = getAdminTheme();
  const guestTheme = getGuestTheme();

  return {
    // Admin colors
    "--admin-bg": adminTheme.bg,
    "--admin-surface": adminTheme.surface,
    "--admin-surface-hover": adminTheme.surfaceHover,
    "--admin-text": adminTheme.text,
    "--admin-muted": adminTheme.muted,
    "--admin-heading": adminTheme.heading,
    "--admin-accent": adminTheme.accent,
    "--admin-success": adminTheme.success,
    "--admin-danger": adminTheme.danger,
    "--admin-info": adminTheme.info,
    // Guest colors
    "--guest-background": guestTheme.background,
    "--guest-foreground": guestTheme.foreground,
    "--guest-primary": guestTheme.primary,
  };
}

/**
 * Convert config theme to inline style object
 * For use in style props
 */
export function getThemeStyle() {
  const map = getCSSVariablesMap();
  const style: Record<string, string> = {};
  Object.entries(map).forEach(([key, value]) => {
    style[key] = value;
  });
  return style;
}
