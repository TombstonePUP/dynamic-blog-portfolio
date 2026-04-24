
/**
 * Prototype-only actions that work in the browser for showcasing the UI.
 * Node.js modules are only imported dynamically when running on the server.
 */

export async function getBlogListAction() {
  if (typeof window !== 'undefined') {
    return { 
      success: true, 
      list: [
        { slug: "first-post", files: ["index.mdx", "cover.jpg"] },
        { slug: "second-post", files: ["index.mdx"] }
      ] 
    };
  }

  // Server-only dynamic imports
  const fs = require('fs');
  const path = require('path');
  const { getPostSlugs } = require('@/lib/mdx');
  const POSTS_PATH = path.join(process.cwd(), "content/posts");

  try {
    const slugs = getPostSlugs();
    const list = slugs.map((slug: string) => {
      const folderPath = path.join(POSTS_PATH, slug);
      const files = fs.readdirSync(folderPath);
      return { slug, files };
    });
    return { success: true, list };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBlogContentAction(slug: string) {
  if (typeof window !== 'undefined') {
    return { success: true, content: "# Prototype Content\n\nThis is a live preview in the static prototype." };
  }

  const fs = require('fs');
  const path = require('path');
  const POSTS_PATH = path.join(process.cwd(), "content/posts");

  try {
    const fullPath = path.join(POSTS_PATH, slug, "index.mdx");
    if (!fs.existsSync(fullPath)) throw new Error("File not found");
    const content = fs.readFileSync(fullPath, "utf8");
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveBlogContentAction(slug: string, content: string) {
  if (typeof window !== 'undefined') {
    console.log("Mock Save:", slug, content);
    return { success: true };
  }

  const fs = require('fs');
  const path = require('path');
  const POSTS_PATH = path.join(process.cwd(), "content/posts");

  try {
    const postFolder = path.join(POSTS_PATH, slug);
    if (!fs.existsSync(postFolder)) fs.mkdirSync(postFolder, { recursive: true });
    fs.writeFileSync(path.join(postFolder, "index.mdx"), content, "utf8");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadAssetAction(slug: string, formData: FormData) {
  if (typeof window !== 'undefined') {
    return { success: true, filename: "prototype-image.jpg" };
  }

  const fs = require('fs');
  const path = require('path');
  const POSTS_PATH = path.join(process.cwd(), "content/posts");

  try {
    const file = formData.get("file") as File;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const postFolder = path.join(POSTS_PATH, slug);
    if (!fs.existsSync(postFolder)) fs.mkdirSync(postFolder, { recursive: true });
    fs.writeFileSync(path.join(postFolder, file.name), buffer);
    return { success: true, filename: file.name };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAssetDataAction(slug: string, filename: string) {
  if (typeof window !== 'undefined') {
    return { success: true, dataUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800" };
  }

  const fs = require('fs');
  const path = require('path');

  try {
    const filePath = path.resolve(process.cwd(), 'content', 'posts', slug, filename);
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: any = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    return { success: true, dataUrl: `data:${contentType};base64,${buffer.toString('base64')}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function renameBlogSlugAction(oldSlug: string, newSlug: string) {
  if (typeof window !== 'undefined') return { success: true };
  const fs = require('fs');
  const path = require('path');
  const POSTS_PATH = path.join(process.cwd(), "content/posts");
  try {
    fs.renameSync(path.join(POSTS_PATH, oldSlug), path.join(POSTS_PATH, newSlug));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAssetAction(slug: string, filename: string) {
  if (typeof window !== 'undefined') return { success: true };
  const fs = require('fs');
  const path = require('path');
  const POSTS_PATH = path.join(process.cwd(), "content/posts");
  try {
    fs.unlinkSync(path.join(POSTS_PATH, slug, filename));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
