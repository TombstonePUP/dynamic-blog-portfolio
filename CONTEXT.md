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
| **Package Manager** | npm |

## Project Structure
```text
/
|-- app/                     # Next.js App Router root with route groups, route handlers, and thin actions
|   |-- (admin)/             # Authenticated CMS and dashboard routes
|   |-- (auth)/              # Authentication routes and approval flow
|   |-- (guest)/             # Public reader and marketing routes
|   |-- actions/             # Thin Server Actions delegating to services (Auth, Posts, etc.)
|   |-- api/                 # API routes and admin asset handlers
|   `-- auth/                # Supabase Auth callback handlers (confirm, signout)
|-- components/              # Shared layout, branding, guest UI, and compatibility entrypoints
|-- db/                      # Supabase clients plus query and persistence modules
|   |-- queries/             # Database and storage query modules (posts, profiles, auth-security)
|   `-- supabase/            # Browser, server, and proxy Supabase client factories
|-- features/                # Feature-owned UI and feature-local helpers
|   |-- auth/                # Authentication components, server context, and security
|   |-- posts/               # Guest story views, story editor UI, MDX rendering, and post-specific helpers
|   `-- users/               # Profile forms and user-management helpers
|-- services/                # Route-facing business logic entrypoints
|-- validators/              # Shared Zod schemas for auth, users, and post actions
|-- lib/                     # Backward-compatible shims for older shared imports
|-- scripts/                 # Migration, seeding, and management utilities
|-- supabase/                # Local database schema and migrations
|-- types/                   # Backward-compatible type re-exports
`-- utils/                   # Backward-compatible Supabase import shims
```

## Layout System
| Layout | File | Used By | Styling Approach |
| :--- | :--- | :--- | :--- |
| **Guest (Root)** | `app/(guest)/layout.tsx` | `/`, `/topics`, and story routes | Uses `Hanken Grotesk`; includes `GuestHeader` with dynamic search and no static footer. Acts as a root layout. |
| **Admin (Root)** | `app/(admin)/layout.tsx` | `/dashboard`, `/editor`, `/posts`, `/users`, `/profile` | Uses `Inter`; includes `AdminHeader`; enforces approved desktop access. Acts as a root layout. |
| **Auth (Root)** | `app/(auth)/layout.tsx` | `/login`, `/pending`, `/auth-error`, `/reset-password` | Lightweight auth shell for sign-in and approval flows. Acts as a root layout. |

## Routing Conventions
| Pattern | Layout | Note |
| :--- | :--- | :--- |
| `/` | Guest | Portfolio landing page with featured stories. |
| `/topics` | Guest | Filterable list of story categories. |
| `/login` | Auth | Access point for story authors. |
| `/reset-password` | Auth | Secure password recovery flow. |
| `/dashboard` | Admin | Overview of stories and draft status. |
| `/editor` | Admin | Specialized workspace for MDX editing. |
| `/[slug]` | Guest | Dynamic story rendering via MDX. |

## Render Mode
- **Hybrid Rendering**: The app uses Server-Side Rendering (SSR) for thin route data loading and Client-Side Rendering (CSR) for interactive elements such as the editor, search modal, comments, and carousel motion.
- **Dynamic Data Source**: Guest and admin content resolve through services backed by Supabase data and storage, with static marketing pages removed from the public flow.
- **Gotchas**: Prefer `@/db/supabase/server` in Server Components and `@/db/supabase/client` in Client Components; `@/utils/supabase/*` now exists only as a compatibility shim layer.

## Styling Approach
The project uses **Tailwind CSS 4** with a strict design system defined in `globals.css`. We use CSS variables for theme tokens and avoid ad-hoc color values in JSX. Layouts use CSS Grid and Flexbox for responsiveness. Refer to **DESIGN.md** for the full specification of tokens and components.

## Key Constraints and Gotchas
- **Terminology**: Always use **Stories** in UI copy. Database and code may still use `post`.
- **Architecture**: Route files should stay thin and delegate business logic to `services/`, feature UI to `features/`, and persistence to `db/queries/`.
- **Guest UI**: Public routes should use the feature-owned guest post components under `features/posts/components/guest` instead of standalone static marketing sections.
- **Database Schema**: The MDX content is stored in the `content_mdx` column in the `posts` table (do not use `content`).
- **Data Fetching**: Never import server-only modules into Client Components. Missing post images or empty Supabase result sets must render placeholders instead of crashing.
- **Assets**: Assets must be referenced via relative paths such as `./assets/image.jpg` in MDX.
- **Admin Access**: Desktop-only restriction is enforced via layout; mobile users see a blocker.
- **Mutations**: All database updates must go through Server Actions in `app/actions/`.
- **MDX**: Use `ClientMDXRemote` for previewing to avoid hostname whitelist issues with `next/image`.
- **Auth Security**: All sign-in attempts are tracked in `auth_security_events` and rate-limited via `login_attempts` table.

