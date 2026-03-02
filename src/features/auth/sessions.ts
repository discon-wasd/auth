import { Hono } from "hono";

export const sessionsRoute = new Hono();

sessionsRoute.get("/", (c) => {
    return c.json({
        info: "Find all sessions route not implemented",
    });
});

sessionsRoute.delete("/:sessionToken", (c) => {
    return c.json({
        info: "Delete session route not implemented",
    });
});
