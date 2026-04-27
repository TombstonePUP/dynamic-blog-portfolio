import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_PATH = path.join(process.cwd(), "content/posts");

type MdxPost = {
  slug: string;
  frontmatter: Record<string, unknown>;
  content: string;
};

export function getPostSlugs() {
  if (!fs.existsSync(POSTS_PATH)) return [];
  
  return fs.readdirSync(POSTS_PATH).filter((f) => {
    const fullPath = path.join(POSTS_PATH, f);
    // Return directories that contain an index.mdx
    return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, "index.mdx"));
  });
}

export function getPostBySlug(slug: string) {
  const postFolder = path.join(POSTS_PATH, slug);
  const fullPath = path.join(postFolder, "index.mdx");
  
  if (!fs.existsSync(fullPath)) return null;
  
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    frontmatter: data as Record<string, unknown>,
    content,
  } satisfies MdxPost;
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is MdxPost => post !== null)
    .sort((post1, post2) => {
      const leftDate = typeof post1.frontmatter.date === "string" ? post1.frontmatter.date : "";
      const rightDate =
        typeof post2.frontmatter.date === "string" ? post2.frontmatter.date : "";

      return leftDate > rightDate ? -1 : 1;
    });

  return posts;
}


