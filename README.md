# Dynamic Blog Portfolio

A Next.js 16 portfolio/blog project featuring a robust, folder-based MDX system with automated asset localization.

## Tech Stack

- **Framework:** Next.js `16.2.3` (App Router, Static Export)
- **UI:** React `19.2.4`, Tailwind CSS `4`
- **Content:** MDX (via `next-mdx-remote`)
- **Icons:** Lucide React, React Icons

## 🚀 Getting Started

1.  **Installation:**
    ```bash
    npm install
    ```

2.  **Run Locally:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

3.  **Build for Production (Static Export):**
    ```bash
    npm run build
    ```

## ✍️ Content Management (MDX Bundles)

The blog uses a **Post Bundle** structure. Each blog article is a self-contained folder located in `content/posts/`.

### Structure:
```text
content/posts/
  └── your-blog-slug/
      ├── index.mdx       <-- The content
      ├── cover.jpg       <-- Local images
      └── chart.png
```

### How to add a new post:
1.  **Template:** Copy `content/BLOG_TEMPLATE.mdx` to a new folder in `content/posts/`.
2.  **Images:** Drop your images into that folder and link them in MDX using relative paths: `![alt](./my-image.jpg)`.
3.  **Metadata:** Fill out the YAML frontmatter in `index.mdx`.

### Important Utility Scripts:
- **`node sync-assets.mjs`**: Run this to synchronize images from your post folders to the `public/` directory so they can be served by Next.js.
- **`node download-images.mjs`**: Run this if you used external URLs (like Unsplash) in your MDX. It will automatically download them locally and update your links.

## 📂 Project Structure

- `app/(guest)/`: Public-facing pages (Home, Blog, Topics, Tags).
- `content/posts/`: Source of truth for blog articles (Bundled folders).
- `data/`: Static metadata (Authors, Tag definitions).
- `lib/`: Core utilities (MDX parsing, server-side data fetching).
- `public/images/posts/`: Generated folder for synchronized blog assets.

## 🛠️ Developer Notes

- **Server vs Client:** Dynamic blog data is fetched in `lib/blogs.server.ts`. Never import this file into Client Components to avoid `fs` errors.
- **Static Export:** This project is configured for `output: "export"`. Ensure all data is available at build time.
- **Styling:** Uses Tailwind CSS v4. Check `app/globals.css` for theme configurations.
