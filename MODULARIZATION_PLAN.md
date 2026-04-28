# Modularization & Multi-Client Strategy Plan

## Executive Summary

The "Dynamic Blog Portfolio" is currently tailored as a **single-client solution** for "The Strengths Writer". To make it reusable across multiple clients, we need to:

1. **Extract client-specific configuration** into isolated config files
2. **Create a templating/theming system** that supports white-labeling
3. **Establish clear architectural boundaries** between core (reusable) and custom (client-specific) code
4. **Build a client initialization framework** for quick onboarding
5. **Refactor components to accept configuration props** instead of hardcoding values
6. **Create documentation** for client setup and customization

---

## Phase 1: Configuration Extraction (Priority: HIGH)

### 1.1 Client Config System

**Goal**: Move all client-specific data out of the codebase into a centralized config.

**Location**: Create `/config/client.config.ts`

```typescript
// config/client.config.ts
export const CLIENT_CONFIG = {
  // Branding
  site: {
    name: "The Strengths Writer",
    domain: "strengthswriter.com",
    tagline: "Positive psychology and personal development newsletter",
    description: "Write, refine, and publish from one place",
  },

  // Logo & Branding Assets
  branding: {
    logoSvgPath: "@/components/logos/strengths-writer.tsx", // Client-specific logo component
    logoText: "TheStrengthsWriter",
    favicon: "/favicons/strengths-writer.ico",
  },

  // Authentication
  auth: {
    primaryAdminEmail: "sanjuanregie@gmail.com",
    oauth: {
      providers: ["github", "google"], // configurable
    },
  },

  // Theme
  theme: {
    mode: "light", // or "dark"
    colors: {
      admin: {
        primary: "#1f3d39", // Evergreen
        accent: "#1f3d39",
        danger: "#b4534a",
        success: "#2b776a",
      },
      guest: {
        background: "#faf9f6",
        foreground: "#302c2c",
        primary: "#beb09a",
      },
    },
    fonts: {
      primary: "Inter",
      secondary: "JetBrains Mono",
      accent: "Hanken Grotesk",
    },
  },

  // Feature Flags
  features: {
    comments: true,
    tags: true,
    authorProfiles: true,
    userApprovalWorkflow: true,
    multiAuthor: true,
    assetStorage: true,
    seo: {
      sitemap: true,
      robots: true,
      schema: true,
    },
  },

  // Content & Taxonomy
  content: {
    postType: "stories", // or "articles", "posts", etc.
    categorization: "tags", // or "categories"
  },

  // Authors (Profiles)
  defaultAuthors: [
    {
      id: "ian",
      name: "Ian Llenares",
      email: "ian@example.com",
      slug: "ian-llenares",
      role: "founder",
      bio: "Founder & Lead Writer",
      avatar: "/authors/ian.jpg",
    },
    // ... more authors
  ],

  // Tags & Categories (for The Strengths Writer)
  taxonomy: {
    tags: [
      { name: "featured", label: "Featured", color: "#F0D8A1" },
      { name: "movie-review", label: "Movie Review", color: "#E29578" },
      // ... 34 more tags
    ],
  },

  // Social & Links
  social: {
    twitter: "https://twitter.com/strengthswriter",
    linkedin: "https://linkedin.com/in/ianllenares",
    email: "hello@strengthswriter.com",
  },

  // Deployment
  deployment: {
    provider: "vercel", // or "render", "railway", etc.
    nodeVersion: "20.x",
    buildCommand: "npm run build",
  },
};
```

**Impact**:

- All component imports change from hardcoded values to `import { CLIENT_CONFIG } from "@/config/client.config"`
- Environment variables can override config values at runtime
- Easy to create new client configs via `cp config/client.config.ts config/client-name.config.ts`

---

### 1.2 Environment Variable Mapping

**Create** `/config/env.config.ts` for runtime overrides:

```typescript
// config/env.config.ts
export function getClientConfig() {
  // Load base config
  let config = CLIENT_CONFIG;

  // Allow environment variables to override
  if (process.env.NEXT_PUBLIC_SITE_NAME) {
    config.site.name = process.env.NEXT_PUBLIC_SITE_NAME;
  }

  if (process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL) {
    config.auth.primaryAdminEmail = process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL;
  }

  // ... override other values

  return config;
}
```

**Environment Variables** (.env.local template):

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Client Configuration
NEXT_PUBLIC_SITE_NAME="The Strengths Writer"
NEXT_PUBLIC_SITE_DOMAIN="strengthswriter.com"
NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL="admin@example.com"
NEXT_PUBLIC_THEME_PRIMARY_COLOR="#1f3d39"
NEXT_PUBLIC_THEME_ACCENT_COLOR="#1f3d39"

# Feature Flags
NEXT_PUBLIC_ENABLE_COMMENTS=true
NEXT_PUBLIC_ENABLE_TAGS=true
```

---

## Phase 2: Logo & Branding System (Priority: HIGH)

### 2.1 Logo Component System

**Replace** hardcoded `LogoIcon` with a dynamic component:

**Current Structure** (`components/app-logo.tsx`):

```typescript
export function LogoIcon() {
  /* hardcoded SVG */
}
```

**New Structure**:

```
components/logos/
├── index.ts                          # Export factory
├── strengths-writer.tsx              # Client 1 logo
├── client-2-logo.tsx                 # Client 2 logo
└── fallback-logo.tsx                 # Generic default

// components/logos/index.ts
import { CLIENT_CONFIG } from "@/config/client.config";
import { LogoIcon as StrengthsWriterLogo } from "./strengths-writer";
import { FallbackLogo } from "./fallback-logo";

const logoMap = {
  "strengths-writer": StrengthsWriterLogo,
  "fallback": FallbackLogo,
};

export function LogoIcon(props) {
  const LogoComponent = logoMap[CLIENT_CONFIG.branding.client] || FallbackLogo;
  return <LogoComponent {...props} />;
}
```

### 2.2 Dynamic Logo Text

**Current**: Hard-coded "TheStrengthsWriter"

**New**:

```typescript
// components/app-logo.tsx
import { CLIENT_CONFIG } from "@/config/client.config";

export function LogoText() {
  return <span>{CLIENT_CONFIG.branding.logoText}</span>;
}
```

---

## Phase 3: Theme & Styling Refactor (Priority: HIGH)

### 3.1 CSS Variable Abstraction

**Current** (`app/globals.css`):

```css
:root {
  --admin-bg: #f7f2ea;
  --admin-surface: #ffffff;
  /* 20+ hardcoded colors */
}
```

**New** (`app/globals.css`):

```css
:root {
  /* Load from CLIENT_CONFIG via CSS-in-JS or build-time injection */
  --primary-color: var(--config-primary);
  --accent-color: var(--config-accent);
  --danger-color: var(--config-danger);

  /* Semantic tokens (abstraction layer) */
  --admin-bg: var(--primary-color);
  --admin-surface: #ffffff;
}
```

### 3.2 Tailwind Theme Extension

**Create** `/tailwind-themes/` with client-specific configs:

```
tailwind-themes/
├── strengths-writer.js
├── client-2.js
└── index.js                    # Switch based on env
```

```javascript
// tailwind-themes/strengths-writer.js
module.exports = {
  colors: {
    "admin-bg": "#f7f2ea",
    "admin-accent": "#1f3d39",
    "admin-danger": "#b4534a",
  },
  fontFamily: {
    sans: ["Inter", "sans-serif"],
    mono: ["JetBrains Mono", "monospace"],
    accent: ["Hanken Grotesk", "sans-serif"],
  },
};

// tailwind.config.js (dynamic)
const clientTheme = process.env.CLIENT_THEME || "strengths-writer";
const themeConfig = require(`./tailwind-themes/${clientTheme}.js`);
```

### 3.3 Dynamic Color Mapping for Tags

**Current** (`lib/theme.ts`):

```typescript
export const TAG_COLORS = { featured: "#F0D8A1" /* ... */ };
```

**New**:

```typescript
// lib/theme.ts
import { CLIENT_CONFIG } from "@/config/client.config";

export function getTagColor(tagName: string): string {
  const tag = CLIENT_CONFIG.taxonomy.tags.find((t) => t.name === tagName);
  return tag?.color || "#default-color";
}
```

---

## Phase 4: Component Refactoring (Priority: MEDIUM)

### 4.1 Configuration-Driven Components

**Pattern**: Props over hardcoded imports

**Example 1: Landing Hero**

**Before** (`components/guest/landing-hero.tsx`):

```typescript
// Hardcoded: featured post query, title text, styling
export function LandingHero() {
  return <h1>Write, refine, and publish from one place</h1>;
}
```

**After**:

```typescript
interface LandingHeroProps {
  title?: string;
  subtitle?: string;
  featuredPost?: Post;
  backgroundColor?: string;
}

export function LandingHero({
  title = CLIENT_CONFIG.site.description,
  subtitle = CLIENT_CONFIG.site.tagline,
  featuredPost,
  backgroundColor,
}: LandingHeroProps) {
  return <h1>{title}</h1>;
}
```

**Example 2: Admin Header**

**Before**:

```typescript
// Imports hardcoded "The Strengths Writer" logo
import { LogoIcon } from "@/components/app-logo";

export function AdminHeader() {
  return <LogoIcon />;
}
```

**After**:

```typescript
import { LogoIcon } from "@/components/logos";
import { CLIENT_CONFIG } from "@/config/client.config";

export function AdminHeader() {
  return (
    <>
      <LogoIcon />
      <span>{CLIENT_CONFIG.site.name}</span>
    </>
  );
}
```

### 4.2 Shared UI Component Library

**Goal**: Extract reusable UI components into a standalone lib

```
components/ui/                          # Reusable
├── button.tsx
├── input.tsx
├── modal.tsx
├── card.tsx
└── ... (20+ base components)

components/admin/ui/                    # Admin-specific, client-aware
├── dashboard-card.tsx
├── story-card.tsx
└── ...

components/guest/ui/                    # Guest-specific, client-aware
├── header.tsx
├── footer.tsx
└── ...
```

### 4.3 Feature-Gated Components

Some features may only apply to certain clients:

```typescript
// components/guest/comments-section.tsx
import { CLIENT_CONFIG } from "@/config/client.config";

export function CommentsSection() {
  if (!CLIENT_CONFIG.features.comments) {
    return null;
  }

  return <div>Comments...</div>;
}
```

---

## Phase 5: Data & Content Management (Priority: MEDIUM)

### 5.1 Author/Profile Data

**Current**: Hardcoded in `data/blog.ts`

**New**: Load from database or config

```typescript
// config/authors.config.ts (or from Supabase)
export const DEFAULT_AUTHORS = CLIENT_CONFIG.defaultAuthors;
```

### 5.2 Taxonomy/Tags

**Current**: 36 tags hardcoded for "The Strengths Writer"

**New**: Configured dynamically

```typescript
// data/taxonomy.ts
import { CLIENT_CONFIG } from "@/config/client.config";

export const TAGS = CLIENT_CONFIG.taxonomy.tags;
export const CATEGORIES = CLIENT_CONFIG.taxonomy.categories;

export function getTagColor(tagName: string) {
  const tag = TAGS.find((t) => t.name === tagName);
  return tag?.color || "#999999";
}
```

### 5.3 Post Slugs & Content Paths

**Current**: Assumes `/content/posts/[slug]/` structure

**New**: Configurable asset paths

```typescript
// lib/post-assets.ts
import { CLIENT_CONFIG } from "@/config/client.config";

export function buildPostAssetUrl(assetFolder: string, filename: string) {
  const bucket = CLIENT_CONFIG.storage.bucket || "post-assets";
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${assetFolder}/${filename}`;
}
```

---

## Phase 6: Database & Multi-Tenancy (Priority: MEDIUM-HIGH)

### 6.1 Single-DB vs. Multi-DB

**Option A: Single Database, Multiple Clients (Recommended)**

- Add `client_id` field to all tables
- RLS policies filter by client_id
- Simpler deployment, harder to separate data

```sql
-- Migration: add_client_id_to_posts.sql
ALTER TABLE posts ADD COLUMN client_id TEXT NOT NULL DEFAULT 'strengths-writer';
CREATE INDEX idx_posts_client_id ON posts(client_id);

-- RLS Policy
CREATE POLICY "clients_can_only_see_own_posts"
  ON posts
  FOR SELECT
  USING (client_id = current_setting('app.client_id'));
```

**Option B: Separate Database Per Client**

- Each client gets own Supabase project
- Complete data isolation, simpler compliance
- Harder to manage, more infrastructure costs

### 6.2 Migration Strategy

For existing data:

1. Add `client_id` column with default "strengths-writer"
2. Create views/functions for client-specific queries
3. Update all RLS policies

```typescript
// lib/admin-data.server.ts
export async function getAuthenticatedContext() {
  const supabase = createServerClient();

  // Set client context (from env or user metadata)
  await supabase.rpc("set_client_id", { client_id: "strengths-writer" });

  const { data } = await supabase.auth.getUser();
  // ... rest of logic
}
```

---

## Phase 7: Deployment & Client Setup (Priority: MEDIUM)

### 7.1 Client Initialization Script

**Goal**: Automated setup for new clients

```bash
npm run setup:client -- --name="New Client" --domain="newclient.com"
```

This script would:

1. Copy `config/client.config.ts` → `config/new-client.config.ts`
2. Prompt for branding (logo, colors, authors)
3. Create `.env.local` with config
4. Run database migrations
5. Seed initial data

```typescript
// scripts/setup-client.mjs
import fs from "fs";
import inquirer from "inquirer";

const answers = await inquirer.prompt([
  { name: "clientName", message: "Client name?" },
  { name: "domain", message: "Domain?" },
  { name: "primaryColor", message: "Primary color (hex)?" },
  // ... more prompts
]);

const config = `
export const CLIENT_CONFIG = {
  site: {
    name: "${answers.clientName}",
    domain: "${answers.domain}",
    // ...
  },
};
`;

fs.writeFileSync(
  `config/${answers.clientName.toLowerCase()}.config.ts`,
  config,
);
console.log("✓ Client config created");
```

### 7.2 Docker/Container Setup

For consistent deployments:

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV CLIENT_THEME=${CLIENT_THEME:-strengths-writer}
ENV NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME}
# ... other env vars

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

**Docker Compose for multi-client local dev**:

```yaml
# docker-compose.dev.yml
version: "3.9"

services:
  strengths-writer:
    build: .
    environment:
      CLIENT_THEME: strengths-writer
      NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}
    ports:
      - "3001:3000"

  client-2:
    build: .
    environment:
      CLIENT_THEME: client-2
      NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}
    ports:
      - "3002:3000"
```

---

## Phase 8: Documentation & Knowledge Base (Priority: MEDIUM)

### 8.1 Create New Files

1. **ARCHITECTURE.md** - Detailed system design
2. **CLIENT_SETUP_GUIDE.md** - Step-by-step for new clients
3. **CUSTOMIZATION_GUIDE.md** - How to customize for a client
4. **API_REFERENCE.md** - Server actions, RPC functions
5. **COMPONENT_LIBRARY.md** - Available components and props
6. **TROUBLESHOOTING.md** - Common issues

### 8.2 Example: CLIENT_SETUP_GUIDE.md

```markdown
# Client Setup Guide

## 1. Create Client Config

\`\`\`bash
npm run setup:client -- --name="Acme Corp"
\`\`\`

## 2. Customize Branding

- Edit `config/acme-corp.config.ts`
- Add custom logo to `components/logos/acme-corp.tsx`
- Update colors in tailwind config

## 3. Database Setup

\`\`\`bash
npm run supabase:migrate
npm run supabase:seed -- --client=acme-corp
\`\`\`

## 4. Environment Variables

Copy `.env.example` and update Supabase credentials

## 5. Local Testing

\`\`\`bash
CLIENT_THEME=acme-corp npm run dev
\`\`\`

## 6. Deploy

\`\`\`bash
npm run build -- --client=acme-corp
npm run deploy
\`\`\`
```

---

## Phase 9: Testing & Quality Assurance (Priority: MEDIUM)

### 9.1 Configuration Tests

```typescript
// __tests__/config.test.ts
describe("Client Config", () => {
  it("should load default client config", () => {
    const config = require("@/config/client.config").CLIENT_CONFIG;
    expect(config.site.name).toBeDefined();
    expect(config.theme.colors).toBeDefined();
  });

  it("should validate required fields", () => {
    const config = CLIENT_CONFIG;
    expect(config.auth.primaryAdminEmail).toMatch(/@/);
  });
});
```

### 9.2 Multi-Client E2E Tests

```typescript
// e2e/clients.e2e.ts
describe("Multi-Client Support", () => {
  ["strengths-writer", "client-2"].forEach((clientName) => {
    describe(`${clientName}`, () => {
      it("should load landing page", async () => {
        const { page } = await browser.newContext({
          env: { CLIENT_THEME: clientName },
        });
        await page.goto("/");
        expect(page.url()).toContain(clientName);
      });
    });
  });
});
```

---

## Phase 10: Monitoring & Analytics (Priority: LOW)

### 10.1 Client-Aware Tracking

```typescript
// lib/analytics.ts
import { CLIENT_CONFIG } from "@/config/client.config";

export function trackEvent(eventName: string, data: any) {
  // Send to analytics with client_id
  analytics.track(eventName, {
    client_id: CLIENT_CONFIG.site.domain,
    ...data,
  });
}
```

---

## Implementation Roadmap

### Sprint 1: Configuration & Extraction (2 weeks)

- [ ] Create `config/client.config.ts` schema
- [ ] Extract hardcoded values into config
- [ ] Set up environment variable overrides
- [ ] Update `globals.css` for theme variables

### Sprint 2: Logo & Branding (1 week)

- [ ] Create logo component system
- [ ] Refactor `app-logo.tsx` to be dynamic
- [ ] Set up Tailwind theme per client
- [ ] Update tag color system

### Sprint 3: Component Refactoring (2 weeks)

- [ ] Make 10 key components accept config props
- [ ] Extract shared UI components
- [ ] Add feature gates to optional features
- [ ] Update Storybook stories if applicable

### Sprint 4: Data & Content (1 week)

- [ ] Move authors to config
- [ ] Make taxonomy configurable
- [ ] Update asset path resolution
- [ ] Test with sample data

### Sprint 5: Multi-Tenancy (2 weeks)

- [ ] Add `client_id` to database schema
- [ ] Update RLS policies
- [ ] Create migration scripts
- [ ] Test data isolation

### Sprint 6: Deployment & Setup (2 weeks)

- [ ] Create `setup:client` script
- [ ] Write Docker setup
- [ ] Create deployment docs
- [ ] Test end-to-end client onboarding

### Sprint 7: Testing & Docs (1 week)

- [ ] Add configuration tests
- [ ] Write comprehensive docs
- [ ] Create troubleshooting guide
- [ ] Client onboarding checklist

---

## Files to Create/Modify

### New Files

- `config/client.config.ts`
- `config/env.config.ts`
- `scripts/setup-client.mjs`
- `scripts/create-client-migration.mjs`
- `components/logos/index.ts`
- `components/logos/fallback-logo.tsx`
- `tailwind-themes/strengths-writer.js`
- `tailwind-themes/index.js`
- `MODULARIZATION_PLAN.md` (this file)
- `ARCHITECTURE.md`
- `CLIENT_SETUP_GUIDE.md`
- `CUSTOMIZATION_GUIDE.md`
- `Dockerfile`
- `docker-compose.dev.yml`
- `supabase/migrations/add-client-id.sql`
- `__tests__/config.test.ts`
- `e2e/clients.e2e.ts`

### Modified Files

- `app/globals.css` (theme variables)
- `tailwind.config.js` (dynamic theme loading)
- `next.config.ts` (client-aware image patterns)
- `components/app-logo.tsx` → refactor to use config
- `components/admin/header.tsx` → use CLIENT_CONFIG
- `components/guest/header.tsx` → use CLIENT_CONFIG
- `components/guest/landing-hero.tsx` → accept props
- `lib/theme.ts` → use config taxonomy
- `lib/admin-data.server.ts` → add client_id filtering
- `lib/post-assets.ts` → configurable buckets
- ALL component imports of hardcoded values

---

## Client Onboarding Checklist

For a new client (e.g., "Acme Corp"):

- [ ] Run `npm run setup:client -- --name="Acme Corp"`
- [ ] Provide logo SVG → `components/logos/acme-corp.tsx`
- [ ] Customize config file with brand colors, authors, tags
- [ ] Set up Supabase project (or use shared DB with client_id)
- [ ] Run migrations: `npm run supabase:migrate`
- [ ] Create seed data: `npm run supabase:seed -- --client=acme-corp`
- [ ] Update `.env.local` with Supabase credentials
- [ ] Test locally: `CLIENT_THEME=acme-corp npm run dev`
- [ ] Deploy: `npm run build && npm run deploy`
- [ ] Configure custom domain in DNS + hosting
- [ ] Train client on admin dashboard
- [ ] Hand off credentials & docs

---

## Benefits of This Approach

✅ **Code Reuse**: Core features built once, used by many clients
✅ **Easy Onboarding**: Setup script automates 80% of client config
✅ **Scalability**: Support 10+ clients from single codebase
✅ **Maintenance**: Bug fixes benefit all clients automatically
✅ **Data Isolation**: Multi-tenancy ensures client data is separate
✅ **Branding**: Each client has own colors, logos, taxonomy
✅ **Feature Control**: Toggle features per client in config
✅ **Documentation**: Clear patterns for customization

---

## Risks & Mitigations

| Risk                  | Mitigation                                            |
| --------------------- | ----------------------------------------------------- |
| Config bloat          | Keep configs simple, use env overrides for edge cases |
| Breaking changes      | Semantic versioning, changelog, deprecation warnings  |
| Data mixing           | Strict RLS policies, unit tests for isolation         |
| Deployment complexity | Docker containers, CI/CD automation                   |
| Performance           | Client themes loaded at build-time, not runtime       |

---

## Next Steps

1. **Review & Approve**: Share this plan with stakeholders
2. **Prioritize**: Decide which phases to tackle first
3. **Create Spike**: Build proof-of-concept for Phase 1-2
4. **Iterate**: Get feedback, refine approach
5. **Execute**: Roll out in sprints
6. **Measure**: Track time savings, client satisfaction

---

## Questions for Clarification

- Will clients share a single database or have separate Supabase projects?
- Should clients have different feature sets (some without comments, tags, etc.)?
- Who maintains custom components (logo, footer) vs. what's reusable?
- What's the deployment target for most clients (Vercel, Render, self-hosted)?
- Do clients need white-label branding or is visible branding acceptable?
