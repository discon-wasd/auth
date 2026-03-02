import { db } from "@/lib/database";
import { accessTokens, defaultAccessTokenSchema } from "@/lib/database/schema";
import { HTTP_STATUS } from "@/lib/status-codes";
import { sValidator } from "@hono/standard-validator";
import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const verifyTokenRoute = new Hono();

const accessTokenPrepared = db.query.accessTokens
    .findFirst({
        with: {
            user: true,
        },

        where: (t, { eq }) => eq(t.token, sql.placeholder("token")),
    })
    .prepare();

verifyTokenRoute.get(
    "/:token",
    sValidator("param", defaultAccessTokenSchema.pick({ token: true })),
    async (c) => {
        const { token } = c.req.valid("param");

        const accessToken = await accessTokenPrepared.get({
            token,
        });

        if (!accessToken) {
            throw new HTTPException(HTTP_STATUS["Not Found"], {
                message: "Access token not found",
            });
        }

        if (accessToken.expiresAt <= new Date()) {
            await db.delete(accessTokens).where(eq(accessTokens.token, token));
            throw new HTTPException(HTTP_STATUS["Not Found"], {
                message: "Access token not found",
            });
        }

        return c.json(accessToken);
    },
);
