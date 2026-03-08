import { preparedStatements } from "@/lib/database/prepared-statements";
import { defaultServerSchema, defaultUserSchema } from "@/lib/database/schema";
import { HTTP_STATUS } from "@/lib/status-codes";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";

const tokenUserPostJsonRequestSchema = defaultServerSchema.pick({
    token: true,
});

const tokenUserPostJsonResponseSchema = defaultUserSchema;

export const tokenUserRoute = new Hono().post(
    "/",
    describeRoute({
        tags: ["Users"],
        summary: "Get user by server token",
        description: "Returns the user associated with the given server token.",
        responses: {
            200: {
                description: "User found",
                content: {
                    "application/json": {
                        schema: resolver(tokenUserPostJsonResponseSchema),
                    },
                },
            },
            404: {
                description: "No user found for the given server token",
            },
        },
    }),
    validator("json", tokenUserPostJsonRequestSchema),
    async (c) => {
        const { token } = c.req.valid("json");

        const result = await preparedStatements.server.findByTokenWithUser({
            token,
        });

        if (!result) {
            throw new HTTPException(HTTP_STATUS["Not Found"], {
                message: "User not found",
            });
        }

        return c.json(result.users);
    },
);
