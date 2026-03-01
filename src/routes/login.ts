import { Hono } from "hono";

export const loginRoute = new Hono();

loginRoute.post("/", (c) => {
    return c.json({
        info: "Login route not implemented",
    });
});
