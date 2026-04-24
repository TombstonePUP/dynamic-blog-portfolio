import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'content', 'posts');
const publicAssetsDir = path.join(process.cwd(), 'public', 'images', 'posts');

if (!fs.existsSync(publicAssetsDir)) {
  fs.mkdirSync(publicAssetsDir, { recursive: true });
}

function sync() {
  const slugs = fs.readdirSync(postsDir).filter(f => {
    return fs.statSync(path.join(postsDir, f)).isDirectory();
  });

  for (const slug of slugs) {
    const postFolder = path.join(postsDir, slug);
    const destFolder = path.join(publicAssetsDir, slug);

    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }

    const files = fs.readdirSync(postFolder);
    for (const file of files) {
      if (file === 'index.mdx') continue;

      const src = path.join(postFolder, file);
      const dest = path.join(destFolder, file);

      // Only copy if it's an image
      if (/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(file)) {
        fs.copyFileSync(src, dest);
        // console.log(`Synced: ${slug}/${file}`);
      }
    }
  }
  console.log('Post assets synchronized to public/images/posts/');
}

sync();
