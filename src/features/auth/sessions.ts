import { db } from "@/lib/database";
import { defaultSessionSchema, sessions } from "@/lib/database/schema";
import { HTTP_STATUS } from "@/lib/status-codes";
import { protectedMiddleware } from "@/middleware/auth/protected";
import { sValidator } from "@hono/standard-validator";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const sessionsRoute = new Hono().use(protectedMiddleware());

const sessionsPrepared = db.query.sessions
    .findMany({
        columns: {
            accountId: false,
        },
        where: (t, { eq }) => eq(t.accountId, sql.placeholder("accountId")),
    })
    .prepare();

sessionsRoute.get("/", async (c) => {
    const sessions = await sessionsPrepared.all({
        accountId: c.get("user").accountId,
    });

    return c.json(sessions);
});

const sessionDeletePrepared = db
    .delete(sessions)
    .where(
        and(
            eq(sessions.accountId, sql.placeholder("accountId")),
            eq(sessions.token, sql.placeholder("token")),
        ),
    )
    .prepare();

sessionsRoute.delete(
    "/",
    sValidator(
        "json",
        defaultSessionSchema.pick({
            token: true,
        }),
    ),
    async (c) => {
        const body = c.req.valid("json");
        if ((c.get("sessionToken"), body.token)) {
            throw new HTTPException(HTTP_STATUS["Method Not Allowed"], {
                message: "You cannot delete the current session",
            });
        }

        await sessionDeletePrepared.execute({
            token: body.token,
            accountId: c.get("user").accountId,
        });

        return c.json({
            success: true,
            info: "Deleted the session",
        });
    },
);
