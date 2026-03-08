import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import z from "zod";

const healthGetJsonResponseSchema = z.object({
    status: z.literal("alive"),
});

export const healthRoute = new Hono().get(
    "/",
    describeRoute({
        tags: ["Health"],
        summary: "Health check",
        description: "Returns the current status of the API.",
        responses: {
            200: {
                description: "API is alive",
                content: {
                    "application/json": {
                        schema: resolver(healthGetJsonResponseSchema),
                    },
                },
            },
        },
    }),
    (c) => {
        return c.json({
            status: "alive",
        });
    },
);
