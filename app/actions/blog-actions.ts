"use server";

import fs from 'fs';
import path from 'path';
import { getPostSlugs, getPostBySlug } from '@/lib/mdx';

const POSTS_PATH = path.join(process.cwd(), "content/posts");

/**
 * Lists all blog folders and their contents.
 */
export async function getBlogListAction() {
  try {
    const slugs = getPostSlugs();
    const list = slugs.map(slug => {
      const folderPath = path.join(POSTS_PATH, slug);
      const files = fs.readdirSync(folderPath);
      return { slug, files };
    });
    return { success: true, list };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


/**
 * Reads the content of a specific blog's index.mdx.
 */
export async function getBlogContentAction(slug: string) {
  try {
    const postFolder = path.join(POSTS_PATH, slug);
    const fullPath = path.join(postFolder, "index.mdx");
    
    if (!fs.existsSync(fullPath)) throw new Error("File not found");
    
    const content = fs.readFileSync(fullPath, "utf8");
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Saves content back to the blog's index.mdx.
 */
export async function saveBlogContentAction(slug: string, content: string) {
  try {
    const postFolder = path.join(POSTS_PATH, slug);
    const fullPath = path.join(postFolder, "index.mdx");
    
    if (!fs.existsSync(postFolder)) {
      fs.mkdirSync(postFolder, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, "utf8");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Uploads an asset (image or MDX) to a post folder.
 */
export async function uploadAssetAction(slug: string, formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const postFolder = path.join(POSTS_PATH, slug);
    if (!fs.existsSync(postFolder)) {
      fs.mkdirSync(postFolder, { recursive: true });
    }

    const filePath = path.join(postFolder, file.name);
    fs.writeFileSync(filePath, buffer);

    return { success: true, filename: file.name };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Reads an asset and returns it as a Base64 Data URL for preview.
 */
export async function getAssetDataAction(slug: string, filename: string) {
  try {
    const filePath = path.resolve(process.cwd(), 'content', 'posts', slug, filename);
    if (!fs.existsSync(filePath)) throw new Error("File not found");

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.avif': 'image/avif',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const base64 = buffer.toString('base64');
    
    return { success: true, dataUrl: `data:${contentType};base64,${base64}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


