# Phase 1: Configuration Extraction - Implementation Guide

## What Was Completed

Phase 1 establishes the foundation for multi-client support by extracting all client-specific configuration into centralized, reusable files.

### New Files Created

1. **`config/client.config.ts`** (Main Configuration File)
   - Single source of truth for all client-specific settings
   - Covers: branding, colors, features, authors, taxonomy, social links, etc.
   - Easy to extend with new clients (copy & modify)

2. **`config/env.config.ts`** (Runtime Overrides)
   - Allows environment variables to override config values
   - Enables deployment-time customization
   - Server-side safe for sensitive keys

3. **`.env.example`** (Environment Template)
   - Shows all available configuration environment variables
   - Copy to `.env.local` and customize per deployment

4. **`components/logos/` (Logo System)**
   - `index.tsx`: Logo factory that dynamically loads the right logo
   - `strengths-writer.tsx`: Strengths Writer client logo (extracted)
   - `fallback-logo.tsx`: Generic default for any new client

5. **`hooks/useClientConfig.ts`** (Client Component Hook)
   - Safe way for client components to access config
   - Memoized to prevent unnecessary re-renders

6. **`components/app-logo.tsx`** (Refactored)
   - Now uses the dynamic logo system
   - No longer hardcoded to Strengths Writer

---

## How to Use Phase 1

### For the Current Project (Strengths Writer)

Just continue using as normal. The config system works transparently:

```typescript
// Instead of hardcoding values...
// Before:
const siteName = "The Strengths Writer";

// After: use config
import { CLIENT_CONFIG } from "@/config/client.config";
const siteName = CLIENT_CONFIG.site.name; // "The Strengths Writer"
```

### Creating a New Client

#### Step 1: Create Client Config

```bash
# Copy and customize for new client
cp config/client.config.ts config/acme-corp.config.ts
```

Edit `config/acme-corp.config.ts`:

```typescript
export const CLIENT_CONFIG = {
  site: {
    name: "Acme Corp Blog",
    domain: "acme.com",
    tagline: "Engineering insights from Acme",
    description: "Company engineering blog",
  },
  branding: {
    logoComponent: "acme-corp", // Point to your new logo
    logoText: "Acme",
  },
  theme: {
    colors: {
      admin: {
        accent: "#FF6B6B", // Brand color
        heading: "#FF6B6B",
        // ... other colors
      },
    },
  },
  // ... customize other sections
};
```

#### Step 2: Create Client Logo

Create `components/logos/acme-corp.tsx`:

```typescript
import { LogoProps } from "./index";

export function AmeCorpLogo({ className = "", width = 24, height = 24 }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      {/* Your custom SVG here */}
    </svg>
  );
}
```

#### Step 3: Register Logo in Factory

Edit `components/logos/index.tsx`:

```typescript
import { AmeCorpLogo } from "./acme-corp";

const LOGO_MAP: Record<string, React.ComponentType<LogoProps>> = {
  "strengths-writer": StrengthsWriterLogo,
  "acme-corp": AmeCorpLogo, // Add this
  fallback: FallbackLogo,
};
```

#### Step 4: Use Environment Variables

Create `.env.local`:

```env
# Supabase (shared or per-client)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

# Acme Corp specific
NEXT_PUBLIC_SITE_NAME="Acme Corp Blog"
NEXT_PUBLIC_SITE_DOMAIN="acme.com"
NEXT_PUBLIC_THEME_ADMIN_ACCENT="#FF6B6B"
```

---

## How to Extend Configuration

### Adding a New Config Section

1. Edit `config/client.config.ts`:

```typescript
export const CLIENT_CONFIG = {
  // ... existing sections

  customSettings: {
    postsPerPage: 12,
    enableNewsletterSignup: true,
    maxImageSize: 5242880, // 5MB
  },
};
```

2. (Optional) Add environment override in `config/env.config.ts`:

```typescript
if (process.env.NEXT_PUBLIC_POSTS_PER_PAGE) {
  config.customSettings.postsPerPage = parseInt(
    process.env.NEXT_PUBLIC_POSTS_PER_PAGE,
  );
}
```

3. Use in components:

```typescript
import { CLIENT_CONFIG } from "@/config/client.config";

export function BlogList() {
  const postsPerPage = CLIENT_CONFIG.customSettings.postsPerPage;
  // ... use the value
}
```

---

## Migration Path: Converting Hardcoded Values

Next steps will convert components to use config. Here's the pattern:

### Before (Hardcoded)

```typescript
// components/guest/header.tsx
export function Header() {
  return (
    <header>
      <h1>The Strengths Writer</h1>
      {/* hardcoded title */}
    </header>
  );
}
```

### After (Config-Driven)

```typescript
import { CLIENT_CONFIG } from "@/config/client.config";

export function Header() {
  return (
    <header>
      <h1>{CLIENT_CONFIG.site.name}</h1>
    </header>
  );
}
```

---

## Testing Configuration

### Verify Config Loads

```typescript
// test-config.ts
import { CLIENT_CONFIG } from "@/config/client.config";
import { getClientConfig, getServerOnlyConfig } from "@/config/env.config";

console.log(CLIENT_CONFIG.site.name); // "The Strengths Writer"
console.log(getClientConfig().site.name); // May be overridden by env
console.log(getServerOnlyConfig().supabase.url); // Server-side only
```

### Environment Override Test

```bash
# Test env override
NEXT_PUBLIC_SITE_NAME="Test Site" npm run dev

# In browser, verify the site name changed
```

---

## Best Practices

### ✅ DO

- Import `CLIENT_CONFIG` directly in server components
- Use `useClientConfig()` hook in client components
- Put all client-specific values in config files
- Use environment variables for deployment-specific overrides
- Keep config structure consistent across clients

### ❌ DON'T

- Hardcode client-specific values in components
- Import environment variables directly (use config layer)
- Store secrets in `CLIENT_CONFIG` (use `getServerOnlyConfig()` instead)
- Modify config at runtime (it should be static)

---

## Next Steps (Phase 2+)

Once Phase 1 is solid, Phase 2 will:

- Make components accept config as props (theme, feature flags)
- Create reusable component library
- Add dynamic theme CSS variables

Then Phase 3+ will tackle:

- Multi-tenancy database setup
- Client initialization scripts
- Deployment automation

---

## Files Ready for Next Phase

These components are candidates for the next refactoring:

- `components/admin/header.tsx` - Use site name from config
- `components/guest/header.tsx` - Use site name, social links from config
- `components/guest/landing-hero.tsx` - Use tagline, colors from config
- `lib/theme.ts` - Use taxonomy.tags from config
- `data/blog.ts` - Use defaultAuthors from config

---

## Troubleshooting

### Config not updating

Make sure you're importing from the correct location:

```typescript
// ✅ Correct
import { CLIENT_CONFIG } from "@/config/client.config";

// ❌ Wrong
import { CLIENT_CONFIG } from "config/client.config";
```

### Environment variables not working

Environment variables must start with `NEXT_PUBLIC_` to be accessible in browser:

```typescript
// ✅ Accessible in browser
NEXT_PUBLIC_SITE_NAME=...

// ❌ Only on server
SITE_NAME=...
```

### Logo not changing

1. Verify config points to correct logo: `logoComponent: "your-logo"`
2. Check logo is registered in `components/logos/index.tsx`
3. Ensure export name matches: `export function YourNameLogo`

---

## Summary

Phase 1 provides a solid, extensible foundation for configuration management. The next phases will gradually refactor components to use this system, eventually enabling full multi-client support.

**Current Status**: ✅ Configuration layer complete, ready for component refactoring
