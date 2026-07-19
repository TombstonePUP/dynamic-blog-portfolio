# Design System & Component Library

> [!IMPORTANT]
> This file must be updated whenever a component is added or changed, a color token is modified, or any Tailwind class in the design system changes. It is never allowed to be stale.

## Color Tokens

| Token | Light Hex | Dark Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `#1F3D39` | `#4ADE80` | `text-admin-primary` | Main brand color, icons, links. |
| **Background** | `#FAF9F6` | `#0A0A0A` | `bg-background` | Global body background. |
| **Admin BG** | `#F7F2EA` | `#111111` | `bg-admin-bg` | Dashboard background. |
| **Surface** | `#FFFFFF` | `#1E1E1E` | `bg-admin-surface` | Cards, panels, modals. |
| **Text** | `#3A332F` | `#E5E5E5` | `text-admin-text` | Body copy and secondary text. |
| **Heading** | `#1F3D39` | `#F9F9F9` | `text-admin-heading` | Titles and primary headers. |
| **Accent** | `#1F3D39` | `#4ADE80` | `bg-admin-accent` | Primary action buttons and indicators. |
| **Success** | `#2B776A` | `#22C55E` | `text-admin-success` | Success pills and confirmations. |
| **Danger** | `#B4534A` | `#EF4444` | `text-admin-danger` | Destructive actions and errors. |

## Typography

- **Primary Font**: `Hanken Grotesk` (Guest Site) / `Inter` (Admin Site)
- **Mono Font**: `JetBrains Mono` (Editor & Code snippets)
- **Base Size**: `16px`

| Role | Font Size | Font Weight | Tailwind Classes |
| :--- | :--- | :--- | :--- |
| **Page Title** | `30px` (1.875rem)| `900` (Black) | `text-3xl font-black tracking-tight` |
| **Card Title** | `20px` (1.25rem) | `700` (Bold) | `text-xl font-bold tracking-tight` |
| **Section Header**| `11px` | `900` (Black) | `text-[11px] font-black uppercase tracking-[0.18em]` |
| **Body Copy** | `14px` (0.875rem)| `400` (Regular) | `text-sm leading-6` |
| **Muted Label** | `12px` (0.75rem) | `400` (Regular) | `text-xs text-admin-muted` |

## Layout

### Admin Layout Shell (Ghost-inspired)
```text
+----------------+----------------------------------------+
| [AdminSidebar] | [PageHeader]                           |
| .w-[300px]     | Title (16px/600)      [Chips] [Primary]|
| .bg-admin-bg   |----------------------------------------|
|                | [Content: white .bg-admin-surface]     |
| Brand row      | .mx-auto .max-w-[1120px] .px-6/.px-12  |
| Nav (32px rows)|                                        |
| · Overview     |  Cards: .rounded-lg .border            |
| · View site    |         .border-admin-text/8           |
| · Stories  [+] |  Lists: hairline-divided rows          |
|   - Drafts     |                                        |
|   - Published  |                                        |
| · Users        |                                        |
| · Profile      |                                        |
|                |                                        |
| ThemeToggle    |                                        |
| User block     |                                        |
+----------------+----------------------------------------+
```
- Sidebar is `sticky top-0 h-screen`, 300px at `lg`+, 64px icon rail below `lg`.
- Sidebar hides entirely on `/editor` (client pathname check) for a full-screen editor.
- Nav items: `h-8 rounded-md px-3 text-[13px] font-medium`; active = `bg-admin-surface-hover/70 text-admin-heading`.
- Admin type scale: 13px controls/labels/nav, 14px body & list rows, 16px/600 page titles, 24px/700 stat numbers.
- Radius scale: `rounded-md` buttons/chips/thumbnails, `rounded-lg` cards/panels. Hairlines use `border-admin-text/6..10` on white.

### Guest Layout Shell
```text
+---------------------------------------------------------+
| [GuestHeader]                                           |
| Featured/Topics |      LOGO      | Home/Login | Search  |
+---------------------------------------------------------+
|                                                         |
|  [Page Content]                                         |
|                                                         |
+---------------------------------------------------------+
```

### Auth Layout Shell
```text
+---------------------------------------------------------+
|                                                         |
|                                                         |
|                [Auth Card / Children]                   |
|           .max-w-md .bg-white/90 .backdrop-blur         |
|                                                         |
|                                                         |
+---------------------------------------------------------+
```

## Components

### Button
**Anatomy:**
```text
[ (Icon) Label (LoadingSpinner) ]
```
**Code Structure:**
```html
<button class="inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors
               border border-admin-accent bg-admin-accent text-admin-contrast hover:bg-admin-accent/90
               px-5 py-2 disabled:opacity-50">
  <svg class="size-4 shrink-0">...</svg>
  <span>Label</span>
</button>
```
**Variants:**
| Variant | Tailwind Classes |
| :--- | :--- |
| **Default** | `bg-admin-accent text-admin-contrast hover:bg-admin-accent/90` |
| **Ghost** | `text-admin-text hover:bg-admin-surface-hover hover:text-admin-heading` |
| **Danger** | `bg-admin-danger text-admin-contrast hover:bg-admin-danger/90` |
| **Outline** | `border border-admin-surface-hover text-admin-text hover:bg-admin-surface-hover` |

### Input Field
**Anatomy:**
```text
+-----------------------------------------+
| [ (Icon) Placeholder/Value            ] |
+-----------------------------------------+
```
**Code Structure:**
```html
<div class="relative">
  <Type class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-admin-text/20" />
  <input class="w-full bg-admin-contrast/5 border-none px-10 py-4 text-sm font-medium
                focus:ring-2 focus:ring-admin-primary/40 outline-none" />
</div>
```

### OverviewStats (dashboard stat strip)
**Anatomy:**
```text
+---------+---------+---------+---------+
| Label   | Label   | Label   | Label   |
| Value   | Value   | Value   | Value   |
+---------+---------+---------+---------+
```
**Code Structure:**
```html
<div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-admin-text/6 rounded-lg border border-admin-text/8 bg-admin-surface">
  <div class="px-6 py-5">
    <p class="text-[13px] text-admin-muted">Label</p>
    <p class="mt-1 text-2xl font-bold tracking-tight text-admin-heading">Value</p>
  </div>
</div>
```
The "Published" value uses `text-admin-success`.

### StoryRow (admin lists: dashboard drafts, /posts)
**Anatomy:**
```text
[Thumb 100x64] Title (14px/600)                [View] [Edit]
               By Author in Topic – 3 days ago
               Status word (Published/Draft/Archived)
```
**Code Structure:**
```html
<div class="group flex items-center gap-5 border-b border-admin-text/6 py-4 last:border-b-0">
  <StoryThumb class="h-16 w-[100px] rounded-md" />
  <div class="min-w-0 flex-1">
    <a class="block truncate text-sm font-semibold text-admin-heading">Title</a>
    <p class="mt-0.5 truncate text-sm text-admin-muted">By Author in Topic – time</p>
    <p class="mt-0.5 text-[13px] text-admin-success">Published</p>
  </div>
  <div class="opacity-0 group-hover:opacity-100"><!-- View / Edit outline buttons --></div>
</div>
```
Status word colors: published `text-admin-success`, draft `text-admin-danger`, archived `text-admin-muted`.

### StoryThumb
Resolves the post image through `resolvePostAssetUrl`; non-absolute or missing URLs fall back to a `bg-admin-accent/8 rounded-md` tile with a `BookOpen` icon. Never crashes on null.

### LatestStoryCard (dashboard)
Card (`rounded-lg border border-admin-text/8 bg-admin-surface p-6`) with a "Latest story" label, 232x150 StoryThumb, title + byline + status, and a solid accent primary action ("Continue writing" / "Edit story") plus outline "View story" when published.

### PageHeader (admin content pages)
`flex justify-between px-6 lg:px-12 py-5`; `<h1 class="text-base font-semibold tracking-tight text-admin-heading">` left; right side holds 32px-tall actions: FilterChip links (`rounded-md border px-3 py-1.5 text-[13px]`; active = `border-admin-accent/30 bg-admin-accent/8 font-semibold`) and the solid accent primary button (`rounded-md bg-admin-accent px-4 py-1.5 text-[13px] font-semibold text-admin-contrast`).

### Taxonomy Autocomplete
**Anatomy:**
```text
+-----------------------------------------+
| Selected chips / selected topic          |
| Search or create input              [+]  |
| --------------------------------------- |
| Suggestion                              |
| Create "new value"                      |
+-----------------------------------------+
```
**Code Structure:**
```html
<div class="relative">
  <input class="w-full bg-admin-bg/60 border border-admin-text/8 px-3 py-2.5 text-[13px] font-semibold
                focus:ring-1 focus:ring-admin-primary/30" />
  <div class="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto
              border border-admin-text/8 bg-admin-surface shadow-xl ring-1 ring-black/5">
    <button class="flex w-full items-center justify-between px-3 py-2 text-[12px] font-semibold
                   hover:bg-admin-primary/8">
      Suggestion
    </button>
  </div>
</div>
```
**States:**
| State | Tailwind Classes / Behavior |
| :--- | :--- |
| **Loading** | `text-admin-text/45` with spinner. |
| **Empty** | `text-admin-text/35` helper row. |
| **Error** | `text-admin-danger` helper row. |
| **Create** | `text-admin-primary hover:bg-admin-primary/8` action row. |

### Editor Chrome (Ghost-style)
- Top bar: `border-b border-admin-text/6 bg-admin-surface px-6 py-3` with a "‹ Stories" breadcrumb (14px/600) + slug/status text (14px muted) left; right side: quiet `rounded-md` icon toggles (explorer/preview panels), "Raw MDX" chip, and the solid accent save button.
- Panel section labels ("Story details", "Story content", "Stories" explorer header) are `text-[13px] font-medium text-admin-muted` — no uppercase tracking.
- Footer: `text-[13px] text-admin-muted` word/character counts left, save-state dot right.

**Removed components (Ghost redesign):** `AdminHeader` (`components/admin/header.tsx`), `DashboardStats`/StatCard, `StoryCard`, `ExplorerGrid` and their `components/admin/*` shims — replaced by `AdminSidebar`, `PageHeader`, `OverviewStats`, `StoryRow`, `StoryThumb`, `LatestStoryCard`.

### CodeMirror Editor
**Anatomy:**
```text
+-----------------------------+
| 1 | # Heading               |
| 2 |                         |
| 3 | **Bold Text**           |
+-----------------------------+
```
**Custom Theme Tokens:**
| Element | Color | Style |
| :--- | :--- | :--- |
| **Gutter BG** | `#F7F2EA` | (Cream Accent) |
| **Line Numbers**| `#3A332F50` | (Muted Brown) |
| **Caret** | `#1F3D39` | (Evergreen) |
| **Selection** | `#1F3D3920` | (Soft Evergreen) |
| **Headings** | `#1F3D39` | Bold, Graduated Sizes |
| **Keywords** | `#1F3D39` | Bold |
| **Strings/URLs**| `#2B776A` | (Soft Teal) |
| **Font** | `JetBrains Mono`| 13px |

### Modal / Overlay
**Anatomy:**
```text
+-----------------------------------------+
| [X] Title                               |
| --------------------------------------- |
| Description                             |
|                                         |
| [Body Content]                          |
|                                         |
| --------------------------------------- |
| [Cancel Button]         [Action Button] |
+-----------------------------------------+
```
**Code Structure:**
```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
  <div class="w-full max-w-md bg-admin-surface p-8 shadow-2xl ring-1 ring-black/10">
    <!-- Header, Body, Footer -->
  </div>
</div>
```

### Admin Comment Moderation
**Anatomy:**
```text
+--------------------------------------------------+
| Shield Comment Moderation                 Count   |
| ------------------------------------------------ |
| Author (Status)          Date / Story             |
| Comment body                                      |
| [Approve] [Hide] [Delete]                         |
+--------------------------------------------------+
```
**Code Structure:**
```html
<div class="border border-admin-surface-hover bg-admin-surface px-5 py-5 shadow-sm">
  <button class="inline-flex items-center gap-1.5 border border-admin-success/20
                 bg-admin-success/10 px-3 py-1.5 text-xs font-bold text-admin-success">
    Approve
  </button>
  <button class="inline-flex items-center gap-1.5 border border-admin-danger/20
                 bg-admin-danger/10 px-3 py-1.5 text-xs font-bold text-admin-danger">
    Hide
  </button>
  <button class="inline-flex items-center gap-1.5 border border-admin-surface-hover
                 bg-admin-surface px-3 py-1.5 text-xs font-bold text-admin-text">
    Delete
  </button>
</div>
```
**States:**
| State | Tailwind Classes / Behavior |
| :--- | :--- |
| **Loading** | `Loader2` with `animate-spin` beside the active item. |
| **Error** | `border-admin-danger/20 bg-admin-danger/10 text-admin-danger`. |
| **Empty** | Dashed `border-admin-surface-hover` with `text-admin-muted`. |
| **Confirm Delete** | Uses the Modal / Overlay structure with danger action styling. |

### Guest Admin Story Controls
**Anatomy:**
```text
[Status] [Edit] [Publish/Unpublish] [Pin/Unpin] [State message]
```
**Code Structure:**
```html
<div class="flex flex-wrap items-center gap-2 border border-admin-surface-hover bg-admin-surface/95 p-2 shadow-lg">
  <span class="border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em]">draft</span>
  <a class="inline-flex items-center gap-1.5 border border-admin-surface-hover bg-admin-surface px-2.5 py-1.5 text-xs font-bold">
    Edit
  </a>
  <button class="inline-flex items-center gap-1.5 border border-admin-primary/20 bg-admin-primary/8 px-2.5 py-1.5 text-xs font-bold text-admin-primary">
    Publish
  </button>
</div>
```
**States:**
| State | Tailwind Classes / Behavior |
| :--- | :--- |
| **Published** | `border-admin-success/20 bg-admin-success/10 text-admin-success`. |
| **Draft** | `border-admin-danger/20 bg-admin-danger/10 text-admin-danger`. |
| **Archived** | `border-admin-muted/20 bg-admin-muted/10 text-admin-muted`. |
| **Pending** | `Loader2 animate-spin` inside the active button. |

### Admin Guest View Toggle
**Anatomy:**
```text
[ (Eye/EyeOff Icon) View as Guest / Exit Guest View ] [State message]
```
**Code Structure:**
```html
<div class="fixed bottom-4 right-4 z-50 border border-admin-surface-hover bg-admin-surface p-2 shadow-2xl ring-1 ring-black/10">
  <button class="inline-flex items-center justify-center gap-2 border border-admin-accent bg-admin-accent px-4 py-2 text-sm font-semibold text-admin-contrast hover:bg-admin-accent/90">
    <svg class="size-4 shrink-0">...</svg>
    <span>View as Guest</span>
  </button>
  <span class="text-xs font-semibold text-admin-muted">Guest view active</span>
</div>
```
**Behavior:**
- Render only for approved admins on guest/public pages.
- Uses a Server Action to toggle the server-only guest-view cookie.
- When active, public pages hide admin controls and badges and load only guest-visible published content.

### Featured Topic Controls
**Anatomy:**
```text
+---------------------------------------------+
| Featured Topics                    Message   |
| [Pin Topic 3] [Unpin Topic 1] [Pin Topic 2]  |
+---------------------------------------------+
```
**Code Structure:**
```html
<button class="inline-flex items-center gap-2 border border-admin-primary/20 bg-admin-primary/8 px-3 py-2 text-xs font-bold text-admin-primary">
  Topic
  <span class="text-admin-muted">3</span>
</button>
```

### Auth Form
**Anatomy:**
```text
+-----------------------------------------+
| [ Sign in ] [ Create account ]          |
| --------------------------------------- |
| (Icon) Email or username                |
| (Icon) Password         [Forgot?]       |
|                                         |
| [ Sign in Button ]                      |
+-----------------------------------------+
```
**Code Structure:**
```html
<div class="w-full max-w-md bg-white/90 p-8 shadow-2xl backdrop-blur">
  <div class="mb-8 flex gap-2 bg-admin-bg p-1">
    <button class="flex-1 bg-white px-4 py-2 text-sm font-semibold shadow-sm">
      Sign in
    </button>
    <button class="flex-1 text-admin-text/55 px-4 py-2 text-sm font-semibold">
      Create account
    </button>
  </div>
  <!-- Form Fields -->
</div>
```

## Dark Mode
- **Strategy**: Tailwind class-based (`.dark`).
- **Persistence**: Managed via `next-themes` (key: `theme`).
- **Implementation**: `ThemeProvider` in `app/layout.tsx` wraps the application. Dark mode tokens are defined under the `.dark` selector in `globals.css`.

## Dev Commands
| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the Next.js dev server and compiles Tailwind styles JIT. |
| `npm run build` | Builds the production bundle and optimizes CSS/Assets. |
| `npm run lint` | Runs ESLint and checks for style guide violations. |
