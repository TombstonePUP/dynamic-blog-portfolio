import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const contents = fs.readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const sep = line.indexOf("=");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

console.log("Supabase URL:", supabaseUrl);
console.log("Region: ap-northeast-1 (Tokyo)\n");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// --- Test 1: Basic connectivity + error check ---
console.log("=== Test 1: posts table query ===");
const { data: postsData, error: postsError } = await supabase
  .from("posts")
  .select("id")
  .limit(1);
console.log("Data:", postsData);
console.log("Error:", postsError);

// --- Test 2: profiles table ---
console.log("\n=== Test 2: profiles table query ===");
const { data: profilesData, error: profilesError } = await supabase
  .from("profiles")
  .select("id, email, role, approval_status")
  .limit(5);
console.log("Data:", profilesData);
console.log("Error:", profilesError);

// --- Test 3: published posts count ---
console.log("\n=== Test 3: published posts count ===");
const { count, error: countError } = await supabase
  .from("posts")
  .select("id", { count: "exact", head: true })
  .eq("status", "published");
console.log("Published post count:", count);
console.log("Error:", countError);

// --- Test 4: Latency measurement (3 rounds) ---
console.log("\n=== Test 4: Latency (3 rounds) ===");
for (let i = 1; i <= 3; i++) {
  const start = Date.now();
  await supabase.from("posts").select("id").limit(1);
  console.log(`Round ${i}: ${Date.now() - start}ms`);
}

// --- Test 5: Auth admin connectivity ---
console.log("\n=== Test 5: Auth admin - list users (page 1) ===");
const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 5,
});
if (authError) {
  console.log("Auth error:", authError);
} else {
  console.log(
    "Users found:",
    (authData?.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      role: u.app_metadata?.role,
    }))
  );
}

console.log("\n✅ Diagnostic complete.");
