import { db } from "@/lib/database";
import { accessTokens, defaultAccessTokenSchema } from "@/lib/database/schema";
import { protectedMiddleware } from "@/middleware/auth/protected";
import { sValidator } from "@hono/standard-validator";
import crypto from "crypto";
import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { verifyTokenRoute } from "./verify";

export const tokenRoute = new Hono();

tokenRoute.route("/verify", verifyTokenRoute);

const accessTokensPrepared = db.query.accessTokens
    .findMany({
        where: (t, { eq }) => eq(t.userId, sql.placeholder("userId")),
    })
    .prepare();

tokenRoute.get("/", protectedMiddleware(), async (c) => {
    const accessTokens = await accessTokensPrepared.all({
        userId: c.get("user").id,
    });

    return c.json(accessTokens);
});

tokenRoute.post(
    "/",
    sValidator("json", defaultAccessTokenSchema.pick({ serverIP: true })),
    protectedMiddleware(),
    async (c) => {
        const { serverIP } = c.req.valid("json");
        const currentDate = Date.now();
        const token = crypto
            .createHash("sha-512")
            .update(
                JSON.stringify({
                    currentDate,
                    serverIP,
                    user: c.get("user").id,
                }),
            )
            .digest("hex");

        const [accessToken] = await db
            .insert(accessTokens)
            .values({
                serverIP,
                token,
                userId: c.get("user").id,
            })
            .returning();

        return c.json(accessToken);
    },
);
