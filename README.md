# Dynamic Blog Portfolio

A Next.js 16 portfolio/blog project with Supabase-backed post storage, MDX editing, and migrated story assets in Supabase Storage.

## Tech Stack

- **Framework:** Next.js `16.2.3`
- **UI:** React `19.2.4`, Tailwind CSS `4`
- **Content:** MDX via `next-mdx-remote`
- **Backend:** Supabase Auth, Postgres, and Storage

## Database Migrations

Add your remote Postgres connection string to `.env.local`:

```bash
SUPABASE_DB_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ADMIN_PASSWORD=choose-a-strong-admin-password
```

Push any pending migrations with:

```bash
npm run supabase:push
```

Preview what would run without applying it:

```bash
npm run supabase:push:dry
```

After the migrations are in place, seed or repair the primary admin account with:

```bash
npm run supabase:seed-admin
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run locally:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Content Storage

Stories now live in **Supabase**:

- Post metadata and MDX body live in the `posts` table.
- Story assets live in the `post-assets` Supabase Storage bucket.
- The admin editor reads and writes against Supabase instead of `content/posts/`.

### Import Existing Local Bundles

If you still have legacy MDX folders under `content/posts/`, import them with:

```bash
npm run supabase:import-posts
```

Preview the migration without writing to Supabase:

```bash
npm run supabase:import-posts:dry
```

The importer uploads sibling assets, rewrites relative asset references, and inserts or updates the matching post rows in Supabase.

## Project Structure

- `app/(guest)/`: Public-facing pages
- `app/(admin)/`: Authenticated writing and management views
- `content/posts/`: Legacy import source for older MDX bundles
- `data/`: Static metadata used by the site
- `lib/`: Core utilities and server-side data access
- `public/images/posts/`: Legacy generated assets folder kept only for backward compatibility during migration
- `scripts/`: Supabase and content migration utilities
- `supabase/migrations/`: Database and storage schema changes

## Developer Notes

- Dynamic blog data is fetched in `lib/blogs.server.ts`. Do not import it into Client Components.
- The local `content/posts` folder is no longer the runtime source of truth after import.
- If you manually upload post assets, keep them under the matching `post-assets/<asset_folder>/...` path.
