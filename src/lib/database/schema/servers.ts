import { uuidSchema } from "@/lib/utils";
import { relations } from "drizzle-orm";
import { int, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";
import { users } from "./users";

export const servers = sqliteTable(
    "servers",
    {
        id: text("id").notNull().primaryKey(),
        secure: int("secure", {
            mode: "boolean",
        })
            .notNull()
            .default(true),
        domain: text("domain").notNull(),
        port: int("port").notNull().default(443),
        token: text("token").notNull().unique(),
        userId: text("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        createdAt: int("created_at", { mode: "timestamp" })
            .notNull()
            .$default(() => new Date()),
    },
    (t) => [unique().on(t.userId, t.domain, t.port)],
);

export const serversRelations = relations(servers, ({ one }) => ({
    user: one(users, {
        fields: [servers.userId],
        references: [users.id],
    }),
}));

export const defaultServerSchema = createSelectSchema(servers, {
    id: uuidSchema(),
    token: z.base64("Token is not in a base64 format"),
    domain: z.string("Domain is not a valid domain"),
    secure: z.boolean().optional(),
    port: z.uint32("Port is not an uint").optional(),
    userId: uuidSchema("User Id"),
    createdAt: z.date("Created At is not a date"),
});
