import { noWhitespacesRegex } from "@/lib/regex";
import { relations } from "drizzle-orm";
import {
    index,
    int,
    primaryKey,
    sqliteTable,
    text,
} from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import z, { uuid } from "zod";
import { users } from "./users";

export const accessTokens = sqliteTable(
    "access_tokens",
    {
        token: text("token").unique(),
        serverIP: text("server_ip").notNull(),
        userId: text("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        expiresAt: int("expires_at", { mode: "timestamp" })
            .notNull()
            .$default(() => new Date()),
        createdAt: int("created_at", { mode: "timestamp" })
            .notNull()
            .$default(() => new Date()),
    },
    (t) => [
        primaryKey({
            columns: [t.userId, t.serverIP],
        }),
        index("user_id_and_server_ip_and_token_idx").on(
            t.userId,
            t.serverIP,
            t.token,
        ),
    ],
);

export const accessTokensRelations = relations(accessTokens, ({ one }) => ({
    user: one(users, {
        fields: [accessTokens.userId],
        references: [users.id],
    }),
}));

export const defaultAccessTokenSchema = createSelectSchema(accessTokens, {
    serverIP: z.ipv4("Server IP is not an IP 😱"),

    token: z
        .string("Token is not a string")
        .regex(noWhitespacesRegex, "Token must not contain spaces")
        .length(128, "Token must be 128 characters"),

    userId: uuid("User Id"),

    expiresAt: z.date("Expires At is not a date"),

    createdAt: z.date("Created At is not a date"),
});
