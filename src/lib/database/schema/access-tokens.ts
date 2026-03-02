import { relations } from "drizzle-orm";
import {
    index,
    int,
    primaryKey,
    sqliteTable,
    text,
} from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts";

export const accessTokens = sqliteTable(
    "access_tokens",
    {
        token: text("token").unique(),
        serverIP: text("server_ip").notNull(),
        accountId: text("account_id")
            .references(() => accounts.id, { onDelete: "cascade" })
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
            columns: [t.accountId, t.serverIP],
        }),
        index("account_id_and_server_ip_and_token_idx").on(
            t.accountId,
            t.serverIP,
            t.token,
        ),
    ],
);

export const accessTokensRelations = relations(accessTokens, ({ one }) => ({
    account: one(accounts, {
        fields: [accessTokens.accountId],
        references: [accounts.id],
    }),
}));
