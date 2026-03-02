import {
    allowedCharsRegex,
    imageUrlRegex,
    noWhitespacesRegex,
} from "@/lib/regex";
import { generateRandomName } from "@/lib/utils";
import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import z, { uuid } from "zod";
import { accessTokens } from "./access-tokens";
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
});

export const usersRelations = relations(users, ({ one, many }) => ({
    account: one(accounts, {
        fields: [users.accountId],
        references: [accounts.id],
    }),
    accessTokens: many(accessTokens),
}));

export const defaultUserSchema = createSelectSchema(users, {
    avatar: z
        .string()
        .min(1, "Avatar can't be empty")
        .regex(noWhitespacesRegex, "Avatar must not contain spaces")
        .regex(imageUrlRegex, "Avatar is not a an image"),

    handle: z
        .string()
        .min(1, "Handle can't be empty")
        .regex(noWhitespacesRegex, "Handle must not contain spaces")
        .regex(
            allowedCharsRegex,
            "Handle can only contain letters, numbers, -, _, and .",
        )
        .min(3, "Handle must be 3 or more characters")
        .max(36, "Handle must be within 36 characters"),

    id: uuid(),

    name: z
        .string()
        .min(1, "Name can't be empty")
        .max(48, "Name must be within 48 characters"),

    accountId: uuid("Account Id"),

    about: z.string().max(1200, "About must be within 1200 characters"),
});
