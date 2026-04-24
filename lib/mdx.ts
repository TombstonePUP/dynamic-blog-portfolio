import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_PATH = path.join(process.cwd(), "content/posts");

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
    frontmatter: data as Record<string, any>,
    content,
  };
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post) => post !== null)
    .sort((post1, post2) => (post1.frontmatter.date > post2.frontmatter.date ? -1 : 1));

  return posts;
}


