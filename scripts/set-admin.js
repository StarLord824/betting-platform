const fs = require("fs");
const { Pool } = require("pg");

// Parse .env.local
const envFile = fs.readFileSync(".env.local", "utf8");
envFile.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx > 0) {
    const key = trimmed.substring(0, eqIdx).trim();
    let val = trimmed.substring(eqIdx + 1).trim();
    // Strip surrounding quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
});

console.log("Connecting to database...");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool
  .query(
    "UPDATE profiles SET role = 'admin' WHERE phone_number = '+910000000000'",
  )
  .then((r) => {
    console.log("Updated", r.rowCount, "rows to admin role");
    return pool.end();
  })
  .catch((e) => {
    console.error("Error:", e.message);
    return pool.end();
  });
