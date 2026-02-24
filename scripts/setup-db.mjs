// Setup script to initialize the database schema on Supabase
// Run with: node scripts/setup-db.mjs

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read env variables
const envPath = path.resolve(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) {
    env[key.trim()] = rest.join("=").trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

// Use service role key to bypass RLS
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// Split SQL into individual statements and execute them
const sqlPath = path.resolve(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "20260220210229_init.sql",
);
const sql = fs.readFileSync(sqlPath, "utf-8");

// Split on semicolons but handle $$ blocks (PL/pgSQL functions)
function splitSQL(sqlText) {
  const statements = [];
  let current = "";
  let inDollarQuote = false;

  const lines = sqlText.split("\n");
  for (const line of lines) {
    // Skip pure comments
    if (line.trim().startsWith("--") && !inDollarQuote) {
      continue;
    }

    if (line.includes("$$")) {
      const count = (line.match(/\$\$/g) || []).length;
      if (count % 2 !== 0) {
        inDollarQuote = !inDollarQuote;
      }
    }

    current += line + "\n";

    if (!inDollarQuote && line.trim().endsWith(";")) {
      const stmt = current.trim();
      if (stmt && stmt !== ";") {
        statements.push(stmt);
      }
      current = "";
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

async function run() {
  console.log("🚀 Connecting to Supabase:", supabaseUrl);
  console.log("");

  const statements = splitSQL(sql);
  console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\n/g, " ");
    process.stdout.write(`  [${i + 1}/${statements.length}] ${preview}...`);

    const { error } = await supabase
      .rpc("", {})
      .then(() => ({ error: null }))
      .catch(async () => {
        // Use the SQL endpoint directly via fetch
        const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        });
        return { error: null };
      });

    // Actually, let's use the Supabase SQL API directly
    try {
      const response = await fetch(`${supabaseUrl}/pg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ query: stmt }),
      });

      if (response.ok) {
        console.log(" ✅");
        successCount++;
      } else {
        const text = await response.text();
        console.log(` ❌ ${text}`);
        errorCount++;
      }
    } catch (err) {
      console.log(` ❌ ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} failed`);
}

run().catch(console.error);
