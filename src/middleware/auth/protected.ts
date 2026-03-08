import {
    defaultAccountSchema,
    defaultSessionSchema,
    defaultUserSchema,
} from "@/lib/database/schema";
import { HTTP_STATUS } from "@/lib/status-codes";
import { preparedStatements } from "@/lib/database/prepared-statements";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export type ProtectedContext = {
    sessionToken: string;
    user: z.infer<typeof defaultUserSchema>;
    account: Omit<z.infer<typeof defaultAccountSchema>, "createdAt">;
};

export const protectedMiddleware = () =>
    createMiddleware<{
        Variables: ProtectedContext;
    }>(async (c, next) => {
        const rawToken = c.req
            .header("Authorization")
            ?.replace("Bearer ", "")
            .trim();

        if (!rawToken) {
            throw new HTTPException(HTTP_STATUS["Unauthorized"], {
                message: "No authorization token provided",
            });
        }

        const { success, data: token } = z.safeParse(
            defaultSessionSchema.shape.token,
            rawToken,
        );

        if (!success) {
            throw new HTTPException(HTTP_STATUS["Bad Request"], {
                message: "Authorization token is not a valid base64 string",
            });
        }

        const result =
            await preparedStatements.session.findByTokenWithAccountAndUser({
                token,
            });

        if (!result) {
            throw new HTTPException(HTTP_STATUS["Unauthorized"], {
                message: "Session not found or has expired, please login again",
            });
        }

        c.set("sessionToken", token);

        const { users: user, accounts: account } = result;

        c.set("user", user);
        c.set("account", account);

        await next();
    });
