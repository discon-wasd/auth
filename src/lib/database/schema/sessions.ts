import { uuidSchema } from "@/lib/utils";
import { relations } from "drizzle-orm";
import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";
import { accounts } from "./accounts";

export const sessions = sqliteTable(
    "sessions",
    {
        token: text("token").primaryKey(),
        userAgent: text("user_agent").notNull(),
        ipAddress: text("ip_address").notNull(),
        accountId: text("account_id")
            .references(() => accounts.id, { onDelete: "cascade" })
            .notNull(),
        createdAt: int("created_at", { mode: "timestamp" })
            .notNull()
            .$default(() => new Date()),
    },
    (t) => [
        index("account_id_idx").on(t.accountId),
        index("account_id_and_created_at_idx").on(t.accountId, t.createdAt),
    ],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
    account: one(accounts, {
        fields: [sessions.accountId],
        references: [accounts.id],
    }),
}));

export const defaultSessionSchema = createSelectSchema(sessions, {
    ipAddress: z.ipv4("IP is not an IP 😱"),

    userAgent: z.string().min(1, "UserAgent can't be empty"),

    token: z.base64("Token is not in a base64 format"),

    accountId: uuidSchema("Account Id"),

    createdAt: z.date("Created At is not a date"),
});
