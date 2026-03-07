import { db } from "@/lib/database";
import { defaultServerSchema } from "@/lib/database/schema";
import { HTTP_STATUS } from "@/lib/status-codes";
import { sValidator } from "@hono/standard-validator";
import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const tokenUserRoute = new Hono();

const getUserFromTokenPrepared = db.query.servers
    .findFirst({
        where: (t, { eq }) => eq(t.token, sql.placeholder("token")),
        with: {
            user: true,
        },
    })
    .prepare();

tokenUserRoute.post(
    "/",
    sValidator("json", defaultServerSchema.pick({ token: true })),
    async (c) => {
        const { token } = c.req.valid("json");

        const server = await getUserFromTokenPrepared.get({
            token,
        });

        if (!server) {
            throw new HTTPException(HTTP_STATUS["Not Found"], {
                message: "User not found",
            });
        }

        return c.json(server.user);
    },
);
