import { db } from "@/lib/database";
import { accounts, defaultUserSchema, users } from "@/lib/database/schema";
import { fireAuth } from "@/lib/firebase";
import { protectedMiddleware } from "@/middleware/auth/protected";
import { sValidator } from "@hono/standard-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

export const meUserRoute = new Hono().use(protectedMiddleware());

meUserRoute.get("/", (c) => {
    return c.json(c.get("user"));
});

meUserRoute.patch(
    "/",
    sValidator(
        "json",
        defaultUserSchema
            .omit({
                id: true,
                accountId: true,
            })
            .partial(),
    ),
    async (c) => {
        const body = c.req.valid("json");
        const [user] = await db
            .update(users)
            .set(body)
            .where(eq(users.id, c.get("user").id))
            .returning();

        return c.json(user);
    },
);

meUserRoute.delete("/", async (c) => {
    const { oAuthId } = c.get("account");

    await Promise.all([
        fireAuth.deleteUser(oAuthId),
        db.delete(accounts).where(eq(accounts.oAuthId, oAuthId)),
    ]);

    return c.json({
        success: true,
        info: "Deleted user",
    });
});
