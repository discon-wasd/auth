import { preparedStatements } from "@/lib/database/prepared-statements";
import { protectedMiddleware } from "@/middleware/auth/protected";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import z from "zod";

const logoutDeleteJsonResponseSchema = z.object({
    success: z.boolean(),
    info: z.string(),
});

export const logoutRoute = new Hono().use(protectedMiddleware()).delete(
    "/",
    describeRoute({
        tags: ["Auth"],
        summary: "Logout",
        description: "Deletes the current session for the authenticated user.",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Successfully logged out",
                content: {
                    "application/json": {
                        schema: resolver(logoutDeleteJsonResponseSchema),
                    },
                },
            },
            401: {
                description: "Unauthorized (no valid session)",
            },
        },
    }),
    async (c) => {
        await preparedStatements.session.deleteByAccountIdAndToken({
            token: c.get("sessionToken"),
            accountId: c.get("user").accountId,
        });

        return c.json({
            success: true,
            info: "Logged out successfully",
        });
    },
);
