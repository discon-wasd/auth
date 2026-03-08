import { db } from "@/lib/database";
import { preparedStatements } from "@/lib/database/prepared-statements";
import { defaultServerSchema, servers } from "@/lib/database/schema/servers";
import { HTTP_STATUS } from "@/lib/status-codes";
import { generateBase64Token } from "@/lib/utils";
import { protectedMiddleware } from "@/middleware/auth/protected";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { HTTPException } from "hono/http-exception";

const serverPostJsonRequestSchema = defaultServerSchema.pick({
    domain: true,
    port: true,
    secure: true,
});

const serverPostJsonResponseSchema = defaultServerSchema;

const serverGetParamRequestSchema = defaultServerSchema.pick({ id: true });

const serverGetJsonResponseSchema = defaultServerSchema;

const serverGetManyJsonResponseSchema = defaultServerSchema.array();

const serverGetRefreshTokenParamRequestSchema = defaultServerSchema.pick({
    id: true,
});

const serverGetRefreshTokenJsonResponseSchema = defaultServerSchema;

export const serverRoute = new Hono()
    .post(
        "/",
        describeRoute({
            tags: ["Servers"],
            summary: "Create server",
            description: "Creates a new server for the authenticated user.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Created server",
                    content: {
                        "application/json": {
                            schema: resolver(serverPostJsonResponseSchema),
                        },
                    },
                },
                401: {
                    description: "Unauthorized (no valid session)",
                },
            },
        }),
        validator("json", serverPostJsonRequestSchema),
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
    )

    .get(
        "/:id",
        describeRoute({
            tags: ["Servers"],
            summary: "Get server",
            description:
                "Returns a single server by ID for the authenticated user.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Server found",
                    content: {
                        "application/json": {
                            schema: resolver(serverGetJsonResponseSchema),
                        },
                    },
                },
                401: {
                    description: "Unauthorized (no valid session)",
                },
                404: {
                    description: "Server not found",
                },
            },
        }),
        validator("param", serverGetParamRequestSchema),
        protectedMiddleware(),
        async (c) => {
            const user = c.get("user");
            const { id } = c.req.valid("param");

            const server = await preparedStatements.server.findByIdAndUserId({
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
    )

    .get(
        "/",
        describeRoute({
            tags: ["Servers"],
            summary: "Get servers",
            description: "Returns all servers for the authenticated user.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "List of servers",
                    content: {
                        "application/json": {
                            schema: resolver(serverGetManyJsonResponseSchema),
                        },
                    },
                },
                401: {
                    description: "Unauthorized (no valid session)",
                },
            },
        }),
        protectedMiddleware(),
        async (c) => {
            const user = c.get("user");

            const servers = await preparedStatements.server.findManyByUserId({
                userId: user.id,
            });

            return c.json(servers);
        },
    )

    .get(
        "/:id/refresh-token",
        describeRoute({
            tags: ["Servers"],
            summary: "Refresh server token",
            description:
                "Generates a new token for the specified server owned by the authenticated user.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Server with refreshed token",
                    content: {
                        "application/json": {
                            schema: resolver(
                                serverGetRefreshTokenJsonResponseSchema,
                            ),
                        },
                    },
                },
                401: {
                    description: "Unauthorized (no valid session)",
                },
                404: {
                    description: "Server not found",
                },
            },
        }),
        validator("param", serverGetRefreshTokenParamRequestSchema),
        protectedMiddleware(),
        async (c) => {
            const user = c.get("user");
            const { id } = c.req.valid("param");

            const server = await preparedStatements.server.refreshTokenById({
                id,
                userId: user.id,
            });

            return c.json(server);
        },
    );
