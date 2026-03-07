import { db } from "@/lib/database";
import { defaultServerSchema, servers } from "@/lib/database/schema/servers";
import { HTTP_STATUS } from "@/lib/status-codes";
import { generateBase64Token } from "@/lib/utils";
import { protectedMiddleware } from "@/middleware/auth/protected";
import { sValidator } from "@hono/standard-validator";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const serverRoute = new Hono();

serverRoute.post(
    "/",
    sValidator(
        "json",
        defaultServerSchema.pick({
            domain: true,
            port: true,
            secure: true,
        }),
    ),
    protectedMiddleware(),
    async (c) => {
        const body = c.req.valid("json");
        const user = c.get("user");

        const [server] = await db
            .insert(servers)
            .values({
                id: crypto.randomUUID(),
                ...body,
                token: generateBase64Token(),
                userId: user.id,
            })
            .returning();

        return c.json(server);
    },
);

export const getServerPrepared = db.query.servers
    .findFirst({
        where: (t, { eq, and }) =>
            and(
                eq(t.id, sql.placeholder("id")),
                eq(t.userId, sql.placeholder("userId")),
            ),
    })
    .prepare();

serverRoute.get(
    "/:id",
    sValidator(
        "param",
        defaultServerSchema.pick({
            id: true,
        }),
    ),
    protectedMiddleware(),
    async (c) => {
        const user = c.get("user");
        const { id } = c.req.valid("param");

        const server = await getServerPrepared.get({
            id,
            userId: user.id,
        });

        if (!server) {
            throw new HTTPException(HTTP_STATUS["Not Found"], {
                message: "Server not found",
            });
        }

        return c.json(server);
    },
);

const getAllServerPrepared = db.query.servers
    .findMany({
        where: (t, { eq }) => eq(t.userId, sql.placeholder("userId")),
    })
    .prepare();

serverRoute.get("/", protectedMiddleware(), async (c) => {
    const user = c.get("user");

    const servers = await getAllServerPrepared.all({
        userId: user.id,
    });

    return c.json(servers);
});

serverRoute.get(
    "/:id/refresh-token",
    sValidator(
        "param",
        defaultServerSchema.pick({
            id: true,
        }),
    ),
    protectedMiddleware(),
    async (c) => {
        const user = c.get("user");
        const { id } = c.req.valid("param");

        const [server] = await db
            .update(servers)
            .set({
                token: generateBase64Token(),
            })
            .where(and(eq(servers.id, id), eq(servers.userId, user.id)))
            .returning();

        return c.json(server);
    },
);
