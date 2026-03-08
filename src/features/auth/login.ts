import { db } from "@/lib/database";
import { preparedStatements } from "@/lib/database/prepared-statements";
import {
    accounts,
    defaultAccountSchema,
    defaultSessionSchema,
    sessions,
    users,
} from "@/lib/database/schema";
import { fireAuth } from "@/lib/firebase";
import { HTTP_STATUS } from "@/lib/status-codes";
import {
    capitalizeString,
    catchError,
    generateBase64Token,
    generateRandomName,
} from "@/lib/utils";
import { FirebaseAuthError } from "firebase-admin/auth";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { HTTPException } from "hono/http-exception";

const loginPostJsonRequestSchema = defaultAccountSchema.pick({
    oAuthId: true,
    oAuthProvider: true,
});

const loginPostJsonResponseSchema = defaultSessionSchema.pick({ token: true });

export const loginRoute = new Hono().post(
    "/",
    describeRoute({
        tags: ["Auth"],
        summary: "Login",
        description:
            "Authenticates a user via OAuth. Creates a new account and user profile on first login, or creates a new session for existing accounts. Requires a valid Firebase OAuth ID.",
        responses: {
            200: {
                description: "Session token returned on successful login",
                content: {
                    "application/json": {
                        schema: resolver(loginPostJsonResponseSchema),
                    },
                },
            },
            400: {
                description: "Already logged in (Authorization header present)",
            },
            401: {
                description: "Firebase user not found for the given oAuthId",
            },
        },
    }),
    async (c, next) => {
        const token = c.req.header("Authorization");

        if (token) {
            throw new HTTPException(HTTP_STATUS["Bad Request"], {
                message: "You are already logged in",
            });
        }

        await next();
    },
    validator("json", loginPostJsonRequestSchema),
    async (c) => {
        const body = c.req.valid("json");

        const [firebaseError, fireUser] = await catchError(
            fireAuth.getUser(body.oAuthId),
        );

        if (
            firebaseError instanceof FirebaseAuthError &&
            firebaseError.code === "auth/user-not-found"
        ) {
            throw new HTTPException(HTTP_STATUS["Unauthorized"], {
                message: firebaseError.message,
            });
        }

        const ipAddress =
            c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
            c.req.header("x-real-ip") ||
            "unknown";

        const userAgent = c.req.header("user-agent") || "unknown";

        const exitingAccount = await preparedStatements.account.findByOAuthId({
            oAuthId: body.oAuthId,
        });

        if (exitingAccount) {
            const [session] = await db
                .insert(sessions)
                .values({
                    accountId: exitingAccount.id,
                    ipAddress,
                    userAgent,
                    token: generateBase64Token(),
                })
                .returning({
                    token: sessions.token,
                });

            return c.json(session);
        }

        const accountId = crypto.randomUUID();
        const randomName = generateRandomName();

        const [, , [session]] = await db.batch([
            db.insert(accounts).values({
                id: accountId,
                oAuthId: body.oAuthId,
                oAuthProvider: body.oAuthProvider,
            }),

            db.insert(users).values({
                id: crypto.randomUUID(),
                accountId,
                name:
                    fireUser?.displayName ??
                    capitalizeString(randomName.replaceAll("-", " ")),
                handle: randomName,
            }),

            db
                .insert(sessions)
                .values({
                    accountId,
                    ipAddress,
                    userAgent,
                    token: generateBase64Token(),
                })
                .returning({
                    token: sessions.token,
                }),
        ]);

        return c.json(session);
    },
);
