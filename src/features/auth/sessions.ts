import { preparedStatements } from "@/lib/database/prepared-statements";
import { defaultSessionSchema } from "@/lib/database/schema";
import { HTTP_STATUS } from "@/lib/status-codes";
import { protectedMiddleware } from "@/middleware/auth/protected";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import z from "zod";

const sessionsGetJsonResponseSchema = defaultSessionSchema.array();

const sessionsDeleteJsonRequestSchema = defaultSessionSchema.pick({
    token: true,
});

const sessionsDeleteJsonResponseSchema = z.object({
    success: z.boolean(),
    info: z.string(),
});

export const sessionsRoute = new Hono()
    .use(protectedMiddleware())

    .get(
        "/",
        describeRoute({
            tags: ["Auth"],
            summary: "Get sessions",
            description: "Returns all sessions for the authenticated user.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "List of sessions",
                    content: {
                        "application/json": {
                            schema: resolver(sessionsGetJsonResponseSchema),
                        },
                    },
                },
                401: {
                    description: "Unauthorized (no valid session)",
                },
            },
        }),
        async (c) => {
            const sessions =
                await preparedStatements.session.findManyByAccountId({
                    accountId: c.get("user").accountId,
                });

            return c.json(sessions);
        },
    )

    .delete(
        "/",
        describeRoute({
            tags: ["Auth"],
            summary: "Delete session",
            description:
                "Deletes a session by token for the authenticated user. The current session cannot be deleted.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Session deleted successfully",
                    content: {
                        "application/json": {
                            schema: resolver(sessionsDeleteJsonResponseSchema),
                        },
                    },
                },
                401: {
                    description: "Unauthorized (no valid session)",
                },
                405: {
                    description: "Cannot delete the current active session",
                },
            },
        }),
        validator("json", sessionsDeleteJsonRequestSchema),
        async (c) => {
            const body = c.req.valid("json");

            if ((c.get("sessionToken"), body.token)) {
                throw new HTTPException(HTTP_STATUS["Method Not Allowed"], {
                    message: "You cannot delete the current session",
                });
            }

            await preparedStatements.session.deleteByAccountIdAndToken({
                token: body.token,
                accountId: c.get("user").accountId,
            });

            return c.json({
                success: true,
                info: "Deleted the session",
            });
        },
    );
