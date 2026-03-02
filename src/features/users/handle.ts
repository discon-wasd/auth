import { db } from "@/lib/database";
import { defaultUserSchema } from "@/lib/database/schema";
import { sValidator } from "@hono/standard-validator";
import { sql } from "drizzle-orm";
import { Hono } from "hono";

export const handleUserRoute = new Hono();

const userPreparedHandleStatement = db.query.users
    .findFirst({
        where: (t, { eq }) => eq(t.handle, sql.placeholder("handle")),
    })
    .prepare();

handleUserRoute.get(
    "/:handle",
    sValidator(
        "param",
        defaultUserSchema.pick({
            handle: true,
        }),
    ),
    async (c) => {
        const { handle } = c.req.valid("param");
        const user = await userPreparedHandleStatement.get({
            handle,
        });
        return c.json(user);
    },
);
