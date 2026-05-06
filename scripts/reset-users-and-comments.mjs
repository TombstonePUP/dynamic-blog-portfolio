import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

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

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const nextToken = argv[index + 1];

    if (!nextToken || nextToken.startsWith("--")) {
      options[key] = "true";
      continue;
    }

    options[key] = nextToken;
    index += 1;
  }

  return options;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function usernameify(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);

  return normalized.length >= 3 ? normalized : null;
}

async function listAllUsers(supabase) {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const batch = data?.users || [];
    users.push(...batch);

    if (batch.length < 200) {
      break;
    }

    page += 1;
  }

  return users;
}

async function deleteAllRows(supabase, table, filterColumn = "id") {
  const { error } = await supabase
    .from(table)
    .delete()
    .not(filterColumn, "is", null);

  if (error) {
    throw error;
  }
}

async function ensureTargetUser(supabase, profile) {
  const users = await listAllUsers(supabase);
  const existingUser = users.find(
    (entry) => (entry.email || "").toLowerCase() === profile.email,
  );

  if (existingUser) {
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      email: profile.email,
      password: profile.password,
      email_confirm: true,
      user_metadata: {
        first_name: profile.firstName,
        last_name: profile.lastName,
        display_name: profile.displayName,
        username: profile.username,
      },
      app_metadata: {
        role: "admin",
      },
    });

    if (error) {
      throw error;
    }

    return { userId: existingUser.id, created: false };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: profile.email,
    password: profile.password,
    email_confirm: true,
    user_metadata: {
      first_name: profile.firstName,
      last_name: profile.lastName,
      display_name: profile.displayName,
      username: profile.username,
    },
    app_metadata: {
      role: "admin",
    },
  });

  if (error) {
    throw error;
  }

  return { userId: data.user.id, created: true };
}

async function ensureTargetProfile(supabase, profile) {
  const { error } = await supabase.from("profiles").upsert({
    id: profile.userId,
    email: profile.email,
    username: profile.username,
    first_name: profile.firstName,
    last_name: profile.lastName,
    display_name: profile.displayName,
    slug: profile.slug,
    role: "admin",
    approval_status: "approved",
    approved_at: new Date().toISOString(),
    approved_by: null,
  });

  if (error) {
    throw error;
  }
}

async function countRows(supabase, table, options = {}) {
  const query = supabase.from(table).select(options.column || "id", {
    count: "exact",
    head: true,
  });

  const { count, error } = options.filter ? await options.filter(query) : await query;

  if (error) {
    throw error;
  }

  return count || 0;
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env"));
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  const args = parseArgs(process.argv.slice(2));
  const dryRun = args["dry-run"] === "true";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = String(
    args.email ||
      process.env.SUPABASE_ADMIN_EMAIL ||
      "superadmin@strengthwriter.com",
  )
    .trim()
    .toLowerCase();
  const password = String(
    args.password || process.env.SUPABASE_ADMIN_PASSWORD || "",
  ).trim();
  const firstName = String(
    args["first-name"] || process.env.SUPABASE_ADMIN_FIRST_NAME || "Ian",
  ).trim();
  const lastName = String(
    args["last-name"] || process.env.SUPABASE_ADMIN_LAST_NAME || "Llenares",
  ).trim();
  const displayName = String(
    args["display-name"] || [firstName, lastName].filter(Boolean).join(" "),
  ).trim();
  const username = String(
    args.username ||
      process.env.SUPABASE_ADMIN_USERNAME ||
      usernameify(displayName) ||
      "",
  ).trim().toLowerCase();
  const slug = String(
    args.slug || process.env.SUPABASE_ADMIN_SLUG || slugify(displayName) || "writer",
  ).trim().toLowerCase();

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  if (!password) {
    console.error("Missing target admin password.");
    process.exit(1);
  }

  if (!displayName) {
    console.error("Missing target display name.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const beforeUsers = await listAllUsers(supabase);
  const beforeProfiles = await countRows(supabase, "profiles");
  const beforeComments = await countRows(supabase, "comments");
  const beforePosts = await countRows(supabase, "posts");

  console.log(
    JSON.stringify(
      {
        dryRun,
        before: {
          authUsers: beforeUsers.length,
          profiles: beforeProfiles,
          comments: beforeComments,
          posts: beforePosts,
        },
        target: {
          email,
          displayName,
          username: username || null,
          slug,
        },
      },
      null,
      2,
    ),
  );

  const targetProfile = {
    email,
    password,
    firstName,
    lastName,
    displayName,
    username: username || null,
    slug,
  };

  const { userId, created } = dryRun
    ? { userId: "dry-run-user-id", created: false }
    : await ensureTargetUser(supabase, targetProfile);

  if (!dryRun) {
    await ensureTargetProfile(supabase, {
      ...targetProfile,
      userId,
    });

    const { error: reassignPostsError } = await supabase
      .from("posts")
      .update({
        author_id: userId,
        author_name: displayName,
        author_slug: slug,
        author_role: "Admin",
        updated_at: new Date().toISOString(),
      })
      .neq("author_id", userId);

    if (reassignPostsError) {
      throw reassignPostsError;
    }

    await deleteAllRows(supabase, "comments");
    await deleteAllRows(supabase, "auth_login_attempts", "subject_key");
    await deleteAllRows(supabase, "auth_security_events");

    const usersToDelete = beforeUsers.filter(
      (entry) => entry.id !== userId && (entry.email || "").toLowerCase() !== email,
    );

    for (const user of usersToDelete) {
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) {
        throw error;
      }
    }

    const { error: deleteOrphanProfilesError } = await supabase
      .from("profiles")
      .delete()
      .neq("id", userId);

    if (deleteOrphanProfilesError) {
      throw deleteOrphanProfilesError;
    }
  }

  const afterUsers = dryRun ? beforeUsers.length : (await listAllUsers(supabase)).length;
  const afterProfiles = dryRun ? beforeProfiles : await countRows(supabase, "profiles");
  const afterComments = dryRun ? beforeComments : await countRows(supabase, "comments");
  const afterPosts = dryRun ? beforePosts : await countRows(supabase, "posts");
  const remainingTargetProfiles = dryRun
    ? 0
    : await countRows(supabase, "profiles", {
        filter(query) {
          return query.eq("email", email);
        },
      });

  console.log(
    JSON.stringify(
      {
        result: dryRun ? "dry-run-complete" : "reset-complete",
        targetUserCreated: created,
        after: {
          authUsers: afterUsers,
          profiles: afterProfiles,
          comments: afterComments,
          posts: afterPosts,
          matchingTargetProfiles: remainingTargetProfiles,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Failed to reset Supabase users and comments.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    try {
      console.error(JSON.stringify(error, null, 2));
    } catch {
      console.error(String(error));
    }
  }
  process.exit(1);
});
