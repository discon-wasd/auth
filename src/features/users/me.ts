import { db } from "@/lib/database";
import { preparedStatements } from "@/lib/database/prepared-statements";
import { defaultUserSchema, users } from "@/lib/database/schema";
import { fireAuth } from "@/lib/firebase";
import { protectedMiddleware } from "@/middleware/auth/protected";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import z from "zod";

const meUserGetJsonResponseSchema = defaultUserSchema;

const meUserPatchJsonRequestSchema = defaultUserSchema
    .omit({ id: true, accountId: true })
    .partial();

const meUserPatchJsonResponseSchema = defaultUserSchema;

const meUserDeleteJsonResponseSchema = z.object({
    success: z.boolean(),
    info: z.string(),
});

export const meUserRoute = new Hono()
    .use(protectedMiddleware())

    .get(
        "/",
        describeRoute({
            tags: ["Users"],
            summary: "Get current user",
            description: "Returns the authenticated user's profile.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Current user profile",
                    content: {
                        "application/json": {
                            schema: resolver(meUserGetJsonResponseSchema),
                        },
                    },
                },
                401: {
                    description: "Unauthorized (no valid session)",
                },
            },
        }),
        (c) => {
            return c.json(c.get("user"));
        },
    )

    .patch(
        "/",
        describeRoute({
            tags: ["Users"],
            summary: "Update current user",
            description: "Updates the authenticated user's profile.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Updated user profile",
                    content: {
                        "application/json": {
                            schema: resolver(meUserPatchJsonResponseSchema),
                        },
                    },
                },
                401: {
                    description: "Unauthorized (no valid session)",
                },
            },
        }),
        validator("json", meUserPatchJsonRequestSchema),
        async (c) => {
            const body = c.req.valid("json");
            const [user] = await db
                .update(users)
                .set({
                    handle: body.handle,
                    about: body.about,
                    avatar: body.avatar,
                    name: body.name,
                })
                .where(eq(users.id, c.get("user").id))
                .returning();

            return c.json(user);
        },
    )

    .delete(
        "/",
        describeRoute({
            tags: ["Users"],
            summary: "Delete current user",
            description:
                "Deletes the authenticated user's account from Firebase and the database.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "User deleted successfully",
                    content: {
                        "application/json": {
                            schema: resolver(meUserDeleteJsonResponseSchema),
                        },
                    },
                },
                401: {
                    description: "Unauthorized (no valid session)",
                },
            },
        }),
        async (c) => {
            const { oAuthId } = c.get("account");

            await Promise.all([
                fireAuth.deleteUser(oAuthId),
                preparedStatements.account.deleteByOAuthId({ oAuthId }),
            ]);

            return c.json({
                success: true,
                info: "Deleted user",
            });
        },
    );
