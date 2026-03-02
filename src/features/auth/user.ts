import { Hono } from "hono";

export const userRoute = new Hono();

userRoute.get("/", (c) => {
    return c.json({
        info: "Find user route not implemented",
    });
});

userRoute.patch("/", (c) => {
    return c.json({
        info: "Update user route not implemented",
    });
});
