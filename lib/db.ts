export function assertDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      [
        "Missing DATABASE_URL.",
        "Set DATABASE_URL in your .env/.env.local (see env.example).",
        "Neon format: postgresql://USER:URL_ENCODED_PASSWORD@HOST/DB?sslmode=require",
      ].join(" "),
    );
  }

  try {
    // Catches many common formatting issues early (especially unescaped ':'/@ in password)
    const u = new URL(url);
    const protocolOk = u.protocol === "postgresql:" || u.protocol === "postgres:";
    if (!protocolOk) throw new Error(`Unsupported protocol: ${u.protocol}`);
  } catch {
    throw new Error(
      [
        "Invalid DATABASE_URL format.",
        "Common cause on Neon: password contains special characters and must be URL-encoded.",
        "Example: postgresql://USER:URL_ENCODED_PASSWORD@ep-xxxx.neon.tech/DB?sslmode=require",
      ].join(" "),
    );
  }
}


