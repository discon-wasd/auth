import { db } from "@/lib/database";
import { sessions } from "@/lib/database/schema";
import { protectedMiddleware } from "@/middleware/auth/protected";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";

export const logoutRoute = new Hono().use(protectedMiddleware());

const sessionDeletePrepared = db
    .delete(sessions)
    .where(
        and(
            eq(sessions.accountId, sql.placeholder("accountId")),
            eq(sessions.token, sql.placeholder("token")),
        ),
    )
    .prepare();

logoutRoute.get("/", async (c) => {
    await sessionDeletePrepared.execute({
        token: c.get("sessionToken"),
        accountId: c.get("user").accountId,
    });

    return c.json({
        success: true,
        info: "Logged out successfully",
    });
});
