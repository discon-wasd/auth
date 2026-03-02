import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL || !process.env.AUTH_TOKEN) {
    throw new Error("Env DATABASE_URL or AUTH_TOKEN not defined");
}

export default defineConfig({
    out: "./drizzle",
    schema: "./src/lib/database/schema/",
    dialect: "turso",
    dbCredentials: {
        url: process.env.DATABASE_URL,
        authToken: process.env.AUTH_TOKEN,
    },
});
