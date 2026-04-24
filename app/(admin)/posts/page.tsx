import fs from "fs";
import path from "path";
import ExplorerGrid from "./explorer-grid";

export const metadata = {
  title: "Explorer | Admin Console",
  description: "Manage your blog post folders and assets.",
};

export default function PostsPage() {
  const POSTS_PATH = path.join(process.cwd(), "content/posts");
  let folders: any[] = [];

  try {
    if (fs.existsSync(POSTS_PATH)) {
      const entries = fs.readdirSync(POSTS_PATH);
      folders = entries.map(slug => {
        const folderPath = path.join(POSTS_PATH, slug);
        const stat = fs.statSync(folderPath);
        if (!stat.isDirectory()) return null;
        
        const files = fs.readdirSync(folderPath);
        
        let date = "Unknown";
        const mdxPath = path.join(folderPath, "index.mdx");
        if (fs.existsSync(mdxPath)) {
          const content = fs.readFileSync(mdxPath, "utf8");
          // Extract date from frontmatter
          const dateMatch = content.match(/date:\s*["']?([^"'\n]+)["']?/);
          if (dateMatch) {
            try {
              const d = new Date(dateMatch[1]);
              // Check if valid date
              if (!isNaN(d.getTime())) {
                date = d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
              } else {
                date = dateMatch[1];
              }
            } catch (e) {
              date = dateMatch[1];
            }
          }
        }
        
        return { slug, files, date };
      }).filter(Boolean);
    } else {
      // Create mock data if running in prototype with no content folder
      folders = [
        { slug: "first-post", files: ["index.mdx", "cover.jpg"], date: "January 2026" },
        { slug: "second-post", files: ["index.mdx"], date: "February 2026" },
        { slug: "draft-post", files: ["index.mdx", "image1.png"], date: "January 2026" }
      ];
    }
  } catch (error) {
    console.error("Error loading posts:", error);
  }

  return (
    <main className="px-8 pb-8 pt-10 flex-1 flex flex-col">
      <ExplorerGrid initialFolders={folders} />
    </main>
  );
}
