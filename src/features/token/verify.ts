import { Hono } from "hono";

export const verifyTokenRoute = new Hono();

verifyTokenRoute.get("/:ip/:token", (c) => {
    return c.json({
        info: "Token verify route not implemented",
    });
});
