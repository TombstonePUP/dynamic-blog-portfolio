# Dynamic Blog Portfolio
> A high-performance portfolio and personal development blog platform powered by Next.js and Supabase.

![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)

> [!IMPORTANT]
> This file must be kept up to date. Any feature addition, command change, environment variable change, or setup change must be reflected here immediately.

## Overview
The **Dynamic Blog Portfolio** (The Strengths Writer) is a professional CMS and blog engine designed for writers focusing on positive psychology and personal growth. It provides a seamless reading experience for guests and a powerful, integrated workspace for authors to manage stories and assets.

## Features
- **Integrated MDX Editor**: Dual-pane workspace with real-time preview and CodeMirror syntax highlighting.
- **Unified Media Explorer**: Manage story content and image assets directly within the sidebar.
- **Supabase Powered**: Dynamic story storage, authentication, and asset management via Supabase.
- **Responsive Layouts**: Desktop-optimized admin dashboard and mobile-friendly reader site.
- **Static Export Compatible**: Built to be performant and deployable to modern edge platforms like Cloudflare Pages.

## Project Structure
```text
/
├── app/               # Core routing and application logic
├── components/        # Reusable UI components (Admin & Guest)
├── lib/               # Server-side utilities and data fetching
├── scripts/           # Migration and admin seeding tools
├── supabase/          # Database migrations and schema
└── utils/             # Supabase client and server factories
```

## Getting Started
1. **Prerequisites**: Ensure you have Node.js 20+ and an active Supabase project.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**: Create a `.env.local` file with the required keys (see table below).
4. **Database Setup**:
   ```bash
   npm run supabase:push
   npm run supabase:seed-admin
   ```
5. **Run Locally**:
   ```bash
   npm run dev
   ```

## Dev Commands
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server. |
| `npm run build` | Compiles the production application. |
| `npm run supabase:push` | Pushes pending database migrations to Supabase. |
| `npm run supabase:seed-admin` | Seeds or repairs the primary admin account. |
| `npm run supabase:import-posts`| Migrates legacy local MDX posts to Supabase. |

## Environment Variables
| Variable | Purpose | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL. | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public API key (Anon key). | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API key for migrations/seeding. | Yes (Dev only) |
| `SUPABASE_DB_URL` | Postgres connection string for migrations. | Yes (Dev only) |
| `NEXT_PUBLIC_SUPABASE_POST_ASSETS_BUCKET`| Name of the storage bucket for images. | Optional (Default: `post-assets`) |

## Contributing
Please follow the standard branching strategy:
- `main`: Production-ready code.
- `staging`: Integration and testing.
- Feature branches should be branched from `staging`.

## License
MIT © 2026 The Strengths Writer

<!-- last updated: 2026-05-01 -->
