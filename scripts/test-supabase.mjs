import fs from "node:fs";
import path from "node:path";
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  process.exit(1);
}

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
};

async function probe(pathname, label) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${pathname}`, {
    headers,
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const code = body?.code ?? "unknown";
    const message = body?.message ?? "Unknown Supabase error.";
    throw new Error(`${label}: ${code}: ${message}`);
  }

  const rows = Array.isArray(body) ? body : [];
  console.log(`${label}: ${rows.length} row(s) returned`);
  rows.forEach((row) => console.log(`- ${JSON.stringify(row)}`));
}

try {
  console.log("Supabase connection succeeded.");
  await probe("profiles?select=id,display_name,slug&limit=2", "profiles");
  await probe("posts?select=id,slug,title,status,published_on&limit=2", "posts");
  await probe("comments?select=id,post_slug,author,status,created_at&limit=2", "comments");
} catch (error) {
  console.error("Supabase connection failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
