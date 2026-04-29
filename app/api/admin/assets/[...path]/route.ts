import fs from 'fs/promises';
import path from 'path';

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ path: ["_placeholder"] }];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;

    // Silence placeholder during build
    if (pathSegments[0] === '_placeholder') {
      return new Response('Placeholder', { status: 200 });
    }

    // Construct the absolute path
    const filePath = path.resolve(process.cwd(), 'content', 'posts', ...pathSegments);

    try {
      const fileBuffer = await fs.readFile(filePath);
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

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch {
      console.error(`[Asset API] File not found: ${filePath}`);
      return new Response('File not found', { status: 404 });
    }
  } catch (error) {
    console.error(`[Asset API] Server error:`, error);
    return new Response('Internal Server Error', { status: 500 });
  }
}


