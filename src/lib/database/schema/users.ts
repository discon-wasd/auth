import { generateRandomName } from "@/lib/utils";
import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts";

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    handle: text("handle").unique().notNull().$default(generateRandomName),
    name: text("name").notNull(),
    avatar: text("avatar").notNull().default(""),
    accountId: text("account_id")
        .unique()
        .references(() => accounts.id, { onDelete: "cascade" })
        .notNull(),
    about: text("about").notNull().default(""),
    emailVerified: int("email_verified", {
        mode: "boolean",
    })
        .notNull()
        .default(false),
});

export const usersRelations = relations(users, ({ one, many }) => ({
    account: one(accounts, {
        fields: [users.accountId],
        references: [accounts.id],
    }),
}));
