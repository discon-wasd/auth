import { relations, sql } from "drizzle-orm";
import { check, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sessions } from "./sessions";
import { users } from "./users";

export const accounts = sqliteTable(
    "accounts",
    {
        id: text("id").primaryKey(),
        email: text("email").unique(),
        password: text("password"),
        oAuthId: text("o_auth_id").unique(),
        oAuthProvider: text("o_auth_provider", {
            enum: ["google", "github"],
        }),
        createdAt: int("created_at", { mode: "timestamp" })
            .notNull()
            .$default(() => new Date()),
    },
    (t) => [
        check(
            "email_password_or_oauth",
            sql`(${t.email} IS NOT NULL AND ${t.password} IS NOT NULL AND ${t.oAuthId} IS NULL AND ${t.oAuthProvider} IS NULL)
                OR
                (${t.email} IS NULL AND ${t.password} IS NULL AND ${t.oAuthId} IS NOT NULL AND ${t.oAuthProvider} IS NOT NULL)`,
        ),
    ],
);

export const accountsRelations = relations(accounts, ({ many, one }) => ({
    sessions: many(sessions),
    user: one(users),
}));
