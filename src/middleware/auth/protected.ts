import { db } from "@/lib/database";
import {
    defaultAccountSchema,
    defaultSessionSchema,
    defaultUserSchema,
} from "@/lib/database/schema";
import { HTTP_STATUS } from "@/lib/status-codes";
import { sql } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import z from "zod";

const userPreparedStatement = db.query.sessions
    .findFirst({
        columns: {},
        with: {
            account: {
                columns: {
                    createdAt: false,
                },
                with: {
                    user: {},
                },
            },
        },

        where: (t, { eq }) => eq(t.token, sql.placeholder("token")),
    })
    .prepare();

export type ProtectedContext = {
    sessionToken: string;
    user: z.infer<typeof defaultUserSchema>;
    account: Omit<z.infer<typeof defaultAccountSchema>, "createdAt">;
};

export const protectedMiddleware = () =>
    createMiddleware<{
        Variables: ProtectedContext;
    }>(async (c, next) => {
        const rawToken = c.req.header("Authorization");

        if (!rawToken) {
            throw new HTTPException(HTTP_STATUS["Unauthorized"], {
                message: "Please login to use this api route",
            });
        }

        const { success, data: token } = z.safeParse(
            defaultSessionSchema.shape.token,
            rawToken,
        );

        if (!success) {
            throw new HTTPException(HTTP_STATUS["Bad Request"], {
                message: "Authorization header formatted incorrectly",
            });
        }

        const session = await userPreparedStatement.get({
            token,
        });

        if (!session || !session.account.user) {
            throw new HTTPException(HTTP_STATUS["Not Found"], {
                message: "Your account does not exit",
            });
        }

        c.set("sessionToken", token);

        const { user, ...account } = session.account;

        c.set("user", user);
        c.set("account", account);

        await next();
    });
