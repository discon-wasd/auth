import { Hono } from "hono";

export const verifyRoute = new Hono();

verifyRoute.get("/:token", (c) => {
    const token = c.req.param("token");
    return c.json({
        info: "Verify route not implemented",
        token,
    });
});
