import { Hono } from "hono";

export const createTokenRoute = new Hono();

createTokenRoute.post("/", (c) => {
    return c.json({
        info: "Create-Token route not implemented",
    });
});
