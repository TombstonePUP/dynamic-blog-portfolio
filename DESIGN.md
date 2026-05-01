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

### Admin Layout Shell
```text
+---------------------------------------------------------+
| [AdminHeader]                                           |
| Logo | / Editor | / Dashboard | Search | User Profile   |
+---------------------------------------------------------+
|                                                         |
|  [Main Content Wrapper]                                 |
|  .mx-auto .w-full .max-w-7xl .px-8 .py-10               |
|                                                         |
|  +-------------------------+   +---------------------+  |
|  | [Sidebar]               |   | [Editor/Preview]    |  |
|  | .w-60 .border-r         |   | .flex-1             |  |
|  +-------------------------+   +---------------------+  |
|                                                         |
+---------------------------------------------------------+
```

### Guest Layout Shell
```text
+---------------------------------------------------------+
| [GuestHeader]                                           |
| Nav Left |          LOGO          | Nav Right | Search  |
+---------------------------------------------------------+
|                                                         |
|  [Page Content]                                         |
|                                                         |
+---------------------------------------------------------+
| [GuestFooter]                                           |
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

### StatCard (DashboardStats)
**Anatomy:**
```text
+-----------------------------+
| Label (Pill Variant)        |
|                             |
| Value                       |
+-----------------------------+
```
**Code Structure:**
```html
<div class="border border-admin-surface-hover bg-admin-surface p-6">
  <span class="inline-flex px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] bg-admin-accent/15">
    Label
  </span>
  <p class="mt-4 text-3xl font-bold text-admin-accent">Value</p>
</div>
```

### StoryCard
**Anatomy:**
```text
+-----------------------------+
| Title              (Status) |
| Excerpt                     |
| [Edit Button] [View Button] |
+-----------------------------+
```
**Code Structure:**
```html
<div class="border border-admin-surface-hover bg-admin-surface p-6 flex flex-col gap-4">
  <div class="flex items-start justify-between gap-4">
    <h3 class="text-xl font-bold text-admin-heading">Title</h3>
    <StatusPill status="published" />
  </div>
  <p class="text-sm text-admin-text">Excerpt...</p>
</div>
```

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
