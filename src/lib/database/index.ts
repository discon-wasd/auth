import { createClient } from "@libsql/client";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema/index";

const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.AUTH_TOKEN!,
});

export const db = drizzle({ client, schema });
