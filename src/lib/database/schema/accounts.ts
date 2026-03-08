import { noWhitespacesRegex } from "@/lib/regex";
import { uuidSchema } from "@/lib/utils";
import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";
import { sessions } from "./sessions";
import { users } from "./users";

export const accounts = sqliteTable("accounts", {
    id: text("id").notNull().primaryKey(),
    oAuthId: text("o_auth_id").notNull().unique(),
    oAuthProvider: text("o_auth_provider", {
        enum: ["google", "github", "email"],
    }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
        .notNull()
        .$default(() => new Date()),
});

export const accountsRelations = relations(accounts, ({ many, one }) => ({
    sessions: many(sessions),
    user: one(users),
}));

export const defaultAccountSchema = createSelectSchema(accounts, {
    id: uuidSchema(),
    
    oAuthId: z
        .string("OAuthId is not a string")
        .regex(noWhitespacesRegex, "OAuthId must not contain spaces"),

    oAuthProvider: z.enum(
        ["google", "github", "email"],
        "OAuthProvider is not valid",
    ),

    createdAt: z.iso.datetime("Created At is not a date"),
});
