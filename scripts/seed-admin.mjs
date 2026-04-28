import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const PRIMARY_ADMIN_EMAIL = "sanjuanregie@gmail.com";
const DEFAULT_FIRST_NAME = "Regie";
const DEFAULT_LAST_NAME = "San Juan";

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
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = process.env.SUPABASE_ADMIN_PASSWORD;
const adminEmail = (process.env.SUPABASE_ADMIN_EMAIL || PRIMARY_ADMIN_EMAIL).trim().toLowerCase();
const firstName = (process.env.SUPABASE_ADMIN_FIRST_NAME || DEFAULT_FIRST_NAME).trim();
const lastName = (process.env.SUPABASE_ADMIN_LAST_NAME || DEFAULT_LAST_NAME).trim();
const displayName = [firstName, lastName].filter(Boolean).join(" ");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

if (!adminPassword) {
  console.error("Missing SUPABASE_ADMIN_PASSWORD in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(targetEmail) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const users = data?.users || [];
    const foundUser = users.find((entry) => (entry.email || "").toLowerCase() === targetEmail);

    if (foundUser) {
      return foundUser;
    }

    if (users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function ensureAdminProfile(userId) {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    email: adminEmail,
    first_name: firstName,
    last_name: lastName,
    display_name: displayName,
    role: "admin",
    approval_status: "approved",
    approved_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

try {
  const existingUser = await findUserByEmail(adminEmail);

  if (existingUser) {
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
      },
      app_metadata: {
        role: "admin",
      },
    });

    if (error) {
      throw error;
    }

    await ensureAdminProfile(existingUser.id);
    console.log(`Updated admin account for ${adminEmail}.`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
      },
      app_metadata: {
        role: "admin",
      },
    });

    if (error) {
      throw error;
    }

    await ensureAdminProfile(data.user.id);
    console.log(`Created admin account for ${adminEmail}.`);
  }
} catch (error) {
  console.error("Failed to seed the admin account.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
