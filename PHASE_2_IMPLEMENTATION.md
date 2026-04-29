# Phase 2: Component Refactoring & Theme Utilities

## Overview

Phase 2 introduces utilities and patterns for using CLIENT_CONFIG throughout components. This enables:

- Dynamic theming based on client configuration
- Feature flag gates for conditional rendering
- Type-safe theme and color access
- Easier component customization per client

## New Files Created

### 1. `lib/config-theme.ts` - Theme Utilities

Converts CLIENT_CONFIG colors into app theme values.

**Functions:**

```typescript
// Get color for a specific tag
getTagColor("featured"); // "#F0D8A1"

// Get all tag colors as a map
getTagColorMap(); // { featured: "#F0D8A1", ... }

// Get admin theme colors
getAdminTheme(); // { bg, surface, accent, danger, ... }

// Get guest theme colors
getGuestTheme(); // { background, foreground, primary }

// Get CSS variable map for injection
getCSSVariablesMap(); // { "--admin-bg": "#f7f2ea", ... }
```

**Usage in Components:**

```typescript
"use client";

import { getGuestTheme, getAdminTheme } from "@/lib/config-theme";

export function MyComponent() {
  const theme = getGuestTheme();

  return (
    <div style={{ backgroundColor: theme.background }}>
      Content
    </div>
  );
}
```

### 2. `lib/features.ts` - Feature Flag Utilities

Type-safe feature flag checking based on CLIENT_CONFIG.

**Functions:**

```typescript
// Direct check (returns boolean)
isFeatureEnabled("comments"); // true/false

// Convenience checks
features.commentsEnabled();
features.tagsEnabled();
features.searchEnabled();
features.authorProfilesEnabled();
features.assetStorageEnabled();
```

**Usage in Components:**

```typescript
import { features } from "@/lib/features";

export function PostView() {
  if (features.commentsEnabled()) {
    return <CommentsSection />;
  }
  return <p>Comments are disabled for this client</p>;
}
```

### 3. `lib/theme.ts` - Updated

Now uses config-based tag colors instead of hardcoded values.

```typescript
import { getTagColor } from "./config-theme";

export function getThemeColor(tags: string[]): string {
  for (const tag of tags) {
    const color = getTagColor(tag);
    if (color !== "#72dbcc") {
      return color;
    }
  }
  return "#72dbcc";
}
```

### 4. `components/feature-gate.tsx` - Feature Toggle Component

Conditionally render content based on feature flags.

**Usage:**

```typescript
import { FeatureGate } from "@/components/feature-gate";

export function PostView() {
  return (
    <article>
      <Content />

      <FeatureGate
        feature="commentsEnabled"
        fallback={<p>Comments disabled</p>}
      >
        <CommentsSection />
      </FeatureGate>
    </article>
  );
}
```

---

## Updated Components

### `components/guest/header.tsx`

Now imports and uses `getGuestTheme()` for background color.

**Before:**

```typescript
<header className="sticky top-0 z-50 w-full bg-[#FAF9F6]">
```

**After:**

```typescript
import { getGuestTheme } from "@/lib/config-theme";

export default function GuestHeader() {
  const guestTheme = getGuestTheme();

  return (
    <header
      className="sticky top-0 z-50 w-full transition-colors duration-300"
      style={{ backgroundColor: guestTheme.background }}
    >
```

Benefits:

- Header color now changes if client config changes
- No hardcoded colors in component
- Easy to override at runtime via config

### `lib/theme.ts`

Refactored to use config-driven tag colors instead of hardcoded values.

---

## Refactoring Patterns

### Pattern 1: Direct Color Usage

```typescript
// lib/config-theme.ts exports functions
import { getAdminTheme, getGuestTheme, getTagColor } from "@/lib/config-theme";

export function Card() {
  const theme = getAdminTheme();
  return <div style={{ backgroundColor: theme.surface }} />;
}
```

### Pattern 2: Feature Gating

```typescript
import { FeatureGate } from "@/components/feature-gate";

export function Blog() {
  return (
    <>
      <Article />

      <FeatureGate feature="searchEnabled">
        <SearchBar />
      </FeatureGate>

      <FeatureGate
        feature="commentsEnabled"
        fallback={<p>Comments are disabled</p>}
      >
        <Comments />
      </FeatureGate>
    </>
  );
}
```

### Pattern 3: Conditional Logic

```typescript
import { features } from "@/lib/features";

export function Dashboard() {
  const showUserApproval = features.userApprovalEnabled();

  if (!showUserApproval) {
    return <p>User approval workflow is disabled</p>;
  }

  return <UserApprovalSection />;
}
```

---

## CSS Variables Setup

All admin colors use CSS variables (defined in `app/globals.css`):

```css
:root {
  --admin-bg: #f7f2ea;
  --admin-surface: #ffffff;
  --admin-accent: #1f3d39;
  /* ... etc */
}
```

To generate these from CLIENT_CONFIG, use:

```typescript
import { getCSSVariablesMap } from "@/lib/config-theme";

// Get map of all variables
const varsMap = getCSSVariablesMap();

// Inject into style tag at build time or runtime
// Example in a layout:
<style>{`
  :root {
    ${Object.entries(varsMap).map(([key, val]) => `${key}: ${val};`).join('\n')}
  }
`}</style>
```

---

## Components Ready for Phase 2 Refactoring

These components are good candidates for the next refactoring iteration:

1. **`components/guest/landing-hero.tsx`**
   - Use `getGuestTheme()` for title color
   - Use `CLIENT_CONFIG.site.description` for tagline

2. **`components/admin/dashboard-stats.tsx`**
   - Use `getAdminTheme()` for card colors

3. **`data/blog.ts`**
   - Use `CLIENT_CONFIG.defaultAuthors` instead of hardcoded array

4. **`components/guest/search-modal.tsx`**
   - Wrap with `<FeatureGate feature="searchEnabled">`

5. **`components/guest/comments-section.tsx`**
   - Wrap with `<FeatureGate feature="commentsEnabled">`

---

## Best Practices

### ✅ DO

- Use `getTagColor()` for tag colors (supports config)
- Import theme functions at component top
- Use `FeatureGate` for optional features
- Check features in server components (more efficient)
- Memoize theme queries if called multiple times

### ❌ DON'T

- Hardcode colors in inline styles
- Use CSS classes instead of config values
- Mix config and hardcoded colors in same component
- Call `features.xyz()` repeatedly (cache result if in loop)

---

## Testing Utilities

### Test Theme Colors

```typescript
import { getTagColor, getAdminTheme } from "@/lib/config-theme";

describe("Theme Utilities", () => {
  it("should get tag color from config", () => {
    const color = getTagColor("featured");
    expect(color).toBe("#F0D8A1");
  });

  it("should get admin theme", () => {
    const theme = getAdminTheme();
    expect(theme.accent).toBe("#1f3d39");
  });
});
```

### Test Feature Gates

```typescript
import { render } from '@testing-library/react';
import { FeatureGate } from '@/components/feature-gate';

describe('FeatureGate', () => {
  it('should render children when feature enabled', () => {
    const { getByText } = render(
      <FeatureGate feature="commentsEnabled">
        <div>Comments</div>
      </FeatureGate>
    );
    expect(getByText('Comments')).toBeInTheDocument();
  });

  it('should render fallback when feature disabled', () => {
    // Mock disabled feature
    const { getByText } = render(
      <FeatureGate
        feature="commentsEnabled"
        fallback={<div>Disabled</div>}
      >
        <div>Comments</div>
      </FeatureGate>
    );
    expect(getByText('Disabled')).toBeInTheDocument();
  });
});
```

---

## Migration Checklist

For each component, follow this checklist:

- [ ] Import config utilities at top
- [ ] Replace hardcoded colors with `getTheme()` calls
- [ ] Replace hardcoded strings with `CLIENT_CONFIG` values
- [ ] Wrap optional features with `<FeatureGate>`
- [ ] Test with different client configs
- [ ] Update component documentation

---

## Environment Variable Overrides

All features can be toggled via environment variables:

```env
# Override feature flags
NEXT_PUBLIC_ENABLE_COMMENTS=false
NEXT_PUBLIC_ENABLE_TAGS=true
NEXT_PUBLIC_ENABLE_SEARCH=false

# Override theme colors
NEXT_PUBLIC_THEME_ADMIN_ACCENT=#FF6B6B
NEXT_PUBLIC_THEME_ADMIN_PRIMARY=#FF6B6B
```

The `getClientConfig()` function in `config/env.config.ts` handles these overrides automatically.

---

## Next Steps (Phase 3)

Phase 3 will:

- Refactor more components using Phase 2 patterns
- Add database multi-tenancy (`client_id` field)
- Create client initialization script
- Set up automated testing for config changes

---

## Summary

Phase 2 provides the tools and patterns needed to make components configuration-driven. The three main utilities are:

1. **`lib/config-theme.ts`** - Access theme colors and convert to app values
2. **`lib/features.ts`** - Type-safe feature flag checking
3. **`components/feature-gate.tsx`** - Render components conditionally based on features

These enable **component reusability across different clients** by externalizing all customization to `CLIENT_CONFIG` and environment variables.

**Status**: ✅ Phase 2 utilities complete, ready for component migration
