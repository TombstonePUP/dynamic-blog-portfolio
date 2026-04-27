import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

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

const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
const dbUrl = process.env.SUPABASE_DB_URL;

if (!fs.existsSync(migrationsDir)) {
  console.error("Missing supabase/migrations directory.");
  process.exit(1);
}

if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL in .env.local.");
  console.error(
    "Add your Supabase Postgres connection string, then rerun npm run supabase:push.",
  );
  process.exit(1);
}

const extraArgs = process.argv.slice(2);
const cliArgs = ["supabase", "db", "push", "--db-url", dbUrl, ...extraArgs];

const child =
  process.platform === "win32"
    ? spawn("cmd.exe", ["/d", "/s", "/c", ["npx", ...cliArgs].join(" ")], {
        cwd: process.cwd(),
        stdio: "inherit",
      })
    : spawn("npx", cliArgs, {
        cwd: process.cwd(),
        stdio: "inherit",
      });

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
