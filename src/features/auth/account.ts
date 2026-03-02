import { Hono } from "hono";

export const accountRoute = new Hono();

accountRoute.get("/", (c) => {
    return c.json({
        info: "Find account route not implemented",
    });
});

accountRoute.patch("/", (c) => {
    return c.json({
        info: "Update account route not implemented",
    });
});

accountRoute.delete("/", (c) => {
    return c.json({
        info: "Delete account route not implemented",
    });
});
