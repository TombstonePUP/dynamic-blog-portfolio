import fs from 'fs';
import path from 'path';
import https from 'https';

const blogFile = path.join(process.cwd(), 'data', 'blog.ts');
const imagesDir = path.join(process.cwd(), 'public', 'images', 'blog');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

let content = fs.readFileSync(blogFile, 'utf8');

// Regex to find all strengthswriter images and unsplash images
const urlRegex = /https:\/\/(strengthswriter\.com\/wp-content\/uploads\/|images\.unsplash\.com\/)[^"']+/g;
const matches = [...new Set(content.match(urlRegex) || [])];

console.log(`Found ${matches.length} unique image URLs to download.`);

async function downloadImage(url, filename) {
  const dest = path.join(imagesDir, filename);
  if (fs.existsSync(dest)) {
    console.log(`Already exists: ${filename}`);
    return `/images/blog/${filename}`;
  }

  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        if (res.statusCode === 301 || res.statusCode === 302) {
            console.log(`Redirecting ${url} to ${res.headers.location}`);
            https.get(res.headers.location, options, (res2) => {
                 const file = fs.createWriteStream(dest);
                 res2.pipe(file);
                 file.on('finish', () => {
                   file.close();
                   resolve(`/images/blog/${filename}`);
                 });
            }).on('error', reject);
            return;
        }
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(`/images/blog/${filename}`);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const url of matches) {
    let filename;
    if (url.includes('unsplash')) {
      // Extract photo id
      const match = url.match(/photo-([a-zA-Z0-9-]+)/);
      filename = match ? `unsplash-${match[1]}.jpg` : `unsplash-${Date.now()}.jpg`;
    } else {
      filename = url.split('/').pop();
    }
    
    try {
      const localPath = await downloadImage(url, filename);
      // Replace in content
      content = content.replaceAll(url, localPath);
    } catch (e) {
      console.error(`Error with ${url}:`, e.message);
    }
  }

  fs.writeFileSync(blogFile, content);
  console.log('Updated data/blog.ts with local paths');
}

run();
