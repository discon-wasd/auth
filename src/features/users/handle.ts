import { preparedStatements } from "@/lib/database/prepared-statements";
import { defaultUserSchema } from "@/lib/database/schema";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";

const handleUserGetParamRequestSchema = defaultUserSchema.pick({
    handle: true,
});

const handleUserGetJsonResponseSchema = defaultUserSchema;

export const handleUserRoute = new Hono().get(
    "/:handle",
    describeRoute({
        tags: ["Users"],
        summary: "Get user by handle",
        description: "Returns a user profile by their handle.",
        responses: {
            200: {
                description: "User found",
                content: {
                    "application/json": {
                        schema: resolver(handleUserGetJsonResponseSchema),
                    },
                },
            },
            404: {
                description: "User not found",
            },
        },
    }),
    validator("param", handleUserGetParamRequestSchema),
    async (c) => {
        const { handle } = c.req.valid("param");
        const user = await preparedStatements.user.findByHandle({ handle });
        return c.json(user);
    },
);
