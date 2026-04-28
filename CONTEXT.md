# Agent Context & Architecture Rules

This file provides strict architectural context and rules for AI coding agents working on this project.
It acts as the single source of truth for structural decisions and must be updated whenever the architecture changes.

## Tech Stack

- **Framework:** Next.js 16.2.3 (App Router)
- **UI:** React 19.2.4, Tailwind CSS 4, Lucide React
- **Content:** MDX via `next-mdx-remote`
- **Backend:** Supabase Auth, Postgres, and Storage

## App Structure

- `app/(guest)/`: Public-facing portfolio and blog pages.
- `app/(admin)/`: Authenticated CMS/dashboard for authors.
- `app/api/`: API routes.
- `lib/`: Server-side data fetching (`admin-data.server.ts`, `blogs.server.ts`). **Do NOT import server functions into Client Components.**
- `components/`: UI components. Grouped by `admin/` and `ui/`.

## Architectural Rules

1. **Server vs Client Components:**
   - Fetch data exclusively in Server Components (e.g., `page.tsx`) and pass only plain, serializable data down to Client Components.
   - Avoid passing complex objects (like React elements, instances, or functions) from Server to Client Components to prevent hydration/serialization errors.
2. **Database & Storage:**
   - Stories are stored dynamically in the Supabase `posts` table (the local `content/posts` folder is considered legacy).
   - Story assets (images) live in the `post-assets` Supabase Storage bucket.
3. **Authentication:**
   - Admin access requires Supabase Auth and a specific `profile` status (e.g., `approval_status = 'approved'`).
4. **Build & Deployment:**
   - The app is designed to be statically exported and deployed to Cloudflare Pages. Ensure all new routes are compatible with static generation unless dynamic server features are specifically requested.
5. **Documentation Updates:**
   - When architectural or design changes are made, update both CONTEXT.md and DESIGN.md to keep them authoritative.
6. **Admin Layout Standard:**
   - Admin pages (excluding `/editor`) follow the standard layout and surface rules documented in DESIGN.md.
7. **Linting Guidance:**
   - Run lint only when requested, after larger refactors, or before release to avoid excessive token usage from lint output.

## Terminology

- Use the term **Stories** (not posts, articles, or folders) in the UI copy to refer to blog entries, ensuring consistency across the Dashboard and Explorer. Code variables and database tables may retain `post` for technical accuracy.
