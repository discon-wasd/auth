import { db } from "@/lib/database";
import {
    accounts,
    defaultAccountSchema,
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
import { sValidator } from "@hono/standard-validator";
import { sql } from "drizzle-orm";
import { FirebaseAuthError } from "firebase-admin/auth";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const loginRoute = new Hono();

const exitingAccountPrepared = db.query.accounts
    .findFirst({
        columns: {
            id: true,
        },
        where: (t, { eq }) => eq(t.oAuthId, sql.placeholder("oAuthId")),
    })
    .prepare();

loginRoute.post(
    "/",
    async (c, next) => {
        const token = c.req.header("Authorization");

        if (token) {
            throw new HTTPException(HTTP_STATUS["Bad Request"], {
                message: "You are already logged in",
            });
        }

        await next();
    },
    sValidator(
        "json",
        defaultAccountSchema.pick({
            oAuthId: true,
            oAuthProvider: true,
        }),
    ),
    async (c) => {
        const body = c.req.valid("json");

        const [firebaseError] = await catchError(
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

        const exitingAccount = await exitingAccountPrepared.get({
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
                ...body,
            }),

            db.insert(users).values({
                id: crypto.randomUUID(),
                accountId,
                name: capitalizeString(randomName.replaceAll("-", " ")),
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
