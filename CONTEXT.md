# Project Context & Architecture Rules

> [!IMPORTANT]
> DESIGN.md is the single source of truth for all visual and design decisions, including color tokens, typography, component structure, and Tailwind classes. This file (CONTEXT.md) must never duplicate those details.

> [!IMPORTANT]
> **Living Document Rules:**
> - **CONTEXT.md** must be updated any time the project structure, routing, layout system, tech stack, or constraints change.
> - **DESIGN.md** must be updated any time a component is added, modified, or removed, or any time a color token, typography rule, or Tailwind class changes.
> - **README.md** must be updated any time a feature is added, a dev command changes, an environment variable is added or removed, or the setup steps change.
> - **No code change** that affects any of the above is considered complete until the relevant doc is updated to match.

## Project Overview
The **Dynamic Blog Portfolio** (branded as "The Strengths Writer") is a professional portfolio and personal development blog platform. It features a high-performance reader experience for guests and a streamlined, custom MDX editor for administrators. The app focuses on identified strengths, positive psychology, and personal growth.

## Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.2.3 (App Router) |
| **UI Library** | React 19.2.4 |
| **Styling** | Tailwind CSS 4 |
| **Icons** | Lucide React |
| **Database** | Supabase (Postgres) |
| **Authentication** | Supabase Auth (SSR-compatible) |
| **Storage** | Supabase Storage (Bucket: `post-assets`) |
| **Content** | MDX via `next-mdx-remote` |
| **Runtime** | Node.js / Edge Runtime |
| **Package Manager**| npm |

## Project Structure
```text
/
├── app/                     # Next.js App Router root
│   ├── (admin)/             # Authenticated CMS/dashboard routes
│   │   ├── dashboard/       # Main admin overview
│   │   ├── editor/          # Custom Story editor (CodeMirror + Preview)
│   │   ├── layout.tsx       # Admin shell with header and auth checks
│   │   └── login/           # Admin authentication page
│   ├── actions/             # Server Actions for mutations (blog-actions.ts, mdx-actions.ts)
│   ├── api/                 # API Routes for search and admin utilities
│   ├── globals.css          # Global styles and Tailwind 4 theme tokens
│   └── layout.tsx           # Global root layout
├── components/              # Shared UI components
│   ├── admin/               # Admin-specific components (editor, dashboard)
│   │   ├── editor/          # Specialized editor sub-components
│   │   └── ui/              # Low-level admin design system components (Button, Modal)
│   ├── guest/               # Guest-facing components (search, mobile menu)
│   ├── mdx/                 # MDX rendering components
│   └── ui/                  # General UI components
├── lib/                     # Core business logic and data fetching
│   ├── admin-data.server.ts # Server-only admin data utilities
│   ├── blogs.server.ts      # Server-only guest data utilities
│   └── post-assets.ts       # Asset path resolution logic
├── scripts/                 # Migration and seeding utilities
├── services/                # External service integrations (auth.ts)
├── supabase/                # Local database schema and migrations
├── types/                   # TypeScript definitions
└── utils/                   # Shared utility functions (supabase client/server creators)
```

## Layout System
| Layout | File | Used By | Styling Approach |
| :--- | :--- | :--- | :--- |
| **Root** | `app/layout.tsx` | All pages | Minimal; manages fonts and global context. |
| **Guest** | `app/(guest)/layout.tsx` | `/`, `/about`, `/topics`, etc. | Uses `Hanken Grotesk` font; includes `GuestHeader` and `GuestFooter`. |
| **Admin** | `app/(admin)/layout.tsx` | `/dashboard`, `/editor` | Uses `Inter` font; includes `AdminHeader`; implements mobile blocker. |

## Routing Conventions
| Pattern | Layout | Note |
| :--- | :--- | :--- |
| `/` | Guest | Portfolio landing page with featured stories. |
| `/topics` | Guest | Filterable list of story categories. |
| `/login` | Admin | Access point for story authors. |
| `/dashboard`| Admin | Overview of stories and draft status. |
| `/editor` | Admin | Specialized workspace for MDX editing. |
| `/[slug]` | Guest | Dynamic story rendering via MDX. |

## Render Mode
- **Hybrid Rendering**: The app uses Server-Side Rendering (SSR) for data fetching in `page.tsx` files and Client-Side Rendering (CSR) for interactive elements (Editor, Search, Modals).
- **Static Generation**: Designed for static export compatibility where possible, but currently relies on SSR for dynamic story retrieval from Supabase.
- **Gotchas**: Always use `createClient` from `@/utils/supabase/server` in Server Components and `@/utils/supabase/client` in Client Components.

## Styling Approach
The project uses **Tailwind CSS 4** with a strict design system defined in `globals.css`. We use CSS variables for theme tokens and avoid ad-hoc color values in JSX. Layouts use CSS Grid and Flexbox for responsiveness. Refer to **DESIGN.md** for the full specification of tokens and components.

## Key Constraints and Gotchas
- **Terminology**: Always use **Stories** in UI copy. Database/Code may use `post`.
- **Database Schema**: The MDX content is stored in the `content_mdx` column in the `posts` table (do not use `content`).
- **Data Fetching**: Never import `*.server.ts` files into Client Components.
- **Assets**: Assets must be referenced via relative paths (e.g., `./assets/image.jpg`) in MDX.
- **Admin Access**: Desktop-only restriction enforced via layout; mobile users see a blocker.
- **Mutations**: All database updates must go through **Server Actions** in `app/actions/`.
- **MDX**: Use `ClientMDXRemote` for previewing to avoid hostname whitelist issues with `next/image`.
